// assets/js/sett.js — "Current Employment": the Sett playables, ONE phone at a time, = the game's Sett
// station (ui/PlayableShowcase.ts + styles/showcase.css, frame mode): poster + glow dots + gold Play,
// white arrows either side cycle the playables (the phone slides out / in), Portrait / Landscape
// under it turn the phone in place (a running game is NOT reloaded, it re-lays itself out).
// Click the phone: the whole showcase flies big over a dark backdrop and the playable loads.
// X / Esc / click the backdrop: the playable unloads and it flies home. Nothing loads before that.
(() => {
    const root = document.querySelector('.showcase');
    if (!root) return;
    const MIN_LOADING = 1200, TIMEOUT = 20000, FLY_MS = 480;
    const SIDE = 868;           // the phone's long side + bezel, design px (the area is SIDE x SIDE)
    const TURN = 500, SLIDE_OUT = 180, SLIDE_IN = 280;
    const easeIn = p => p * p * p, easeOut = p => 1 - (1 - p) ** 3;
    const easeInOut = p => (p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2);

    // ---- icons (= game PlayableShowcase.ts) ----
    const GRAD = id => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="20">
      <stop offset="0" stop-color="#a84ca8"/><stop offset=".45" stop-color="#772378"/><stop offset="1" stop-color="#4f0c4f"/></linearGradient>`;
    const PLAY_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><defs>${GRAD('wk-ig')}</defs>
      <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10-6.4a1 1 0 0 0 0-1.72l-10-6.4A1 1 0 0 0 8 5.6z" fill="url(#wk-ig)" stroke="#370033" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M9.7 7.6v3.4" stroke="#e193e4" stroke-width="1.1" stroke-linecap="round" opacity=".85"/></svg>`;
    const rad = d => d * Math.PI / 180;
    const onCircle = (a, r) => [12 + r * Math.cos(rad(a)), 12 + r * Math.sin(rad(a))];
    const f2 = p => p.map(v => v.toFixed(2)).join(' ');
    const ARC_R = 10.6, ARC_W = 1.5, HEAD = 1.05;
    const arcPath = (a0, a1) => `M${f2(onCircle(a0, ARC_R))}A${ARC_R} ${ARC_R} 0 0 1 ${f2(onCircle(a1, ARC_R))}`;
    const arrowHead = a => {
        const [px, py] = onCircle(a, ARC_R), tx = -Math.sin(rad(a)), ty = Math.cos(rad(a)), nx = Math.cos(rad(a)), ny = Math.sin(rad(a));
        const back = 0.4, len = 3 * HEAD, half = 2.2 * HEAD;
        return `M${f2([px + tx * len, py + ty * len])}L${f2([px + nx * half - tx * back, py + ny * half - ty * back])}`
            + `L${f2([px - nx * half - tx * back, py - ny * half - ty * back])}Z`;
    };
    const PHONE_ICON = (id, land) => {
        const [x, y, w, h] = land ? [5.4, 8.4, 13.2, 7.2] : [8.4, 5.4, 7.2, 13.2];
        const arcs = land ? [[-145, -53], [35, 127]] : [[-55, 37], [125, 217]];
        const lines = arcs.map(([a, b]) => arcPath(a, b)).join(''), heads = arcs.map(([, b]) => arrowHead(b)).join('');
        const p = 1.3, scr = land ? [x + 2.4, y + p, w - 4.4, h - 2 * p] : [x + p, y + 2.4, w - 2 * p, h - 4.4];
        const slot = land ? `M${x + 1.2} 10.4v3.2` : `M10.4 ${y + 1.2}h3.2`;
        const home = land ? `M${x + w - 1.15} 11.2v1.6` : `M11.2 ${y + h - 1.15}h1.6`;
        return `<svg viewBox="-2 -2 28 28" aria-hidden="true"><defs>${GRAD(id)}</defs>
          <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="${lines}" stroke="#370033" stroke-width="${ARC_W + 2}"/><path d="${heads}" fill="#370033" stroke="#370033" stroke-width="2"/>
            <path d="${lines}" stroke="url(#${id})" stroke-width="${ARC_W}"/><path d="${heads}" fill="url(#${id})"/>
            <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.9" fill="url(#${id})" stroke="#370033" stroke-width="1.4"/>
            <rect x="${scr[0]}" y="${scr[1]}" width="${scr[2]}" height="${scr[3]}" rx=".6" fill="#fff4dc"/>
            <g stroke="#fff4dc" stroke-width=".9"><path d="${slot}"/><path d="${home}"/></g>
          </g></svg>`;
    };
    const LOADING = `<div class="sc-loading"><div class="sleeper"><img src="/loading/sleeping.png" alt="" width="640" height="586">
      <span class="z">Z</span><span class="z">Z</span><span class="z">Z</span></div>
      <div class="label">${[...'LOADING'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div></div>`;
    const r = (a, b) => a + Math.random() * (b - a);
    const dots = n => Array.from({length: n}, () => {
        const sz = r(14, 40);
        return `<i class="sc-dot" style="left:${r(-5, 100)}%;top:${r(-5, 100)}%;width:${sz}px;height:${sz}px;--sx:${r(-10, 10)}px;--sy:${r(-22, 22)}px;`
            + `--bob:${r(3, 8)}s;--tw:${r(1.6, 5)}s;--d:${r(-8, 0)}s;--o0:${r(0.15, 0.35)};--o1:${r(0.55, 0.95)}"></i>`;
    }).join('');

    // ---- DOM ----
    const wrap = document.createElement('div');
    wrap.className = 'sc-wrap';
    wrap.innerHTML = `
        <div class="sc-row">
            <button class="sc-arrow prev" type="button" aria-label="Previous playable"></button>
            <div class="sc-area"><div class="sc-shadow"></div><div class="sc-phone"><div class="sc-screen"></div></div></div>
            <button class="sc-arrow next" type="button" aria-label="Next playable"></button>
        </div>
        <div class="sc-rotate">
            <button class="sc-orient portrait on" type="button" title="Portrait" aria-label="Portrait">${PHONE_ICON('sc-ig-port', false)}</button>
            <button class="sc-orient landscape" type="button" title="Landscape" aria-label="Landscape">${PHONE_ICON('sc-ig-land', true)}</button>
        </div>
        <button class="sc-x" type="button" aria-label="Close"></button>`;
    root.appendChild(wrap);
    const dim = document.createElement('div');
    dim.id = 'play-dim';
    document.body.appendChild(dim);
    const area = wrap.querySelector('.sc-area'), phone = wrap.querySelector('.sc-phone'), shadow = wrap.querySelector('.sc-shadow');
    const screen = wrap.querySelector('.sc-screen'), rotateBox = wrap.querySelector('.sc-rotate');
    const arrows = [...wrap.querySelectorAll('.sc-arrow')];

    // ---- state ----
    let list = [], cur = 0, landscape = false, scale = 0.6, angle = 0, slideX = 0, slideA = 1;
    let session = 0, cleanup = null, turning = false, big = false, busy = false, slideToken = 0;

    // ---- layout ----
    function inlineScale() {
        const w = root.clientWidth, roomy = w > 640;
        return Math.max(0.3, Math.min(0.62, ((roomy ? w - 2 * (64 + 44) : w) - 8) / SIDE));
    }
    // the page's zoom (?wide=1, wide.js): the big view is fixed INSIDE the zoomed section, so it works
    // in the section's own px = screen px / Z
    const Z = () => wrap.currentCSSZoom || 1;
    function bigBox() {
        const W = innerWidth / Z(), H = innerHeight / Z();
        const s = Math.min(1.35, (H - 132) / SIDE, (W - 230) / SIDE), side = SIDE * s;
        return {s, side, left: (W - side) / 2, top: Math.max(16, (H - 104 - side) / 2)};
    }
    function applyTurn() {
        const x = slideX * scale;
        phone.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale}) rotate(${angle}deg)`;
        shadow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${30 * scale}px)) scale(${scale}) rotate(${angle}deg)`;
        phone.style.opacity = String(slideA);
        shadow.style.opacity = String(0.6 * slideA);
    }
    // real phone (= game PlayableShowcase detectPhone): tap = fullscreen + play, no fly, no frame
    // controls; `?device=phone|frame` forces one for testing
    const isPhone = (() => {
        const forced = new URLSearchParams(location.search).get('device');
        if (forced) return forced === 'phone';
        // window.screen: `screen` in this file is the playable's .sc-screen element (that made every
        // real phone fail this test — only ?device=phone worked, 2026-11-18)
        return matchMedia('(pointer: coarse)').matches && Math.min(window.screen.width, window.screen.height) < 600;
    })();
    let fs = false, landBeforeFs = false;
    // fullscreen follows the phone's own orientation (the playable re-lays itself on a turn)
    // ?dbg=1: a small readout of what the phone reports (his real phone opened portrait while
    // landscape, 2026-11-18; the PC phone simulation opens landscape)
    const dbg = new URLSearchParams(location.search).get('dbg') === '1' && document.body.appendChild(Object.assign(document.createElement('pre'), {
        style: 'position:fixed;left:4px;bottom:4px;z-index:20000;margin:0;padding:6px 8px;background:#000c;color:#0f0;font:11px/1.35 monospace;pointer-events:none;white-space:pre'}));
    const dbgShow = (why) => {
        if (!dbg) return;
        const s = screen_ => { const r = screen_?.getBoundingClientRect(); return r ? `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` : '-'; };
        dbg.textContent = `${why}\nisPhone ${isPhone}  fs ${fs}  land ${landscape}\ninner ${innerWidth}x${innerHeight}  screen ${window.screen.width}x${window.screen.height}  dpr ${devicePixelRatio}`
            + `\nclient ${document.documentElement.clientWidth}x${document.documentElement.clientHeight}  vv ${Math.round(visualViewport?.width)}x${Math.round(visualViewport?.height)} @${visualViewport?.scale}`
            + `\norient ${window.screen.orientation?.type}  mq ${matchMedia('(orientation: landscape)').matches}\nwrap ${wrap.className}\nphone ${s(phone)}  scr ${s(screen)}\nua ${navigator.userAgent}`;
        // dev: also to the PC (Vite proxies /r/upload -> :8800), so no phone screenshot is needed
        fetch(`/r/upload?src=classic-dbg&kind=log`, {method: 'POST', headers: {'Content-Type': 'text/plain'}, body: dbg.textContent}).catch(() => {});
    };
    addEventListener('resize', () => dbgShow('resize')); setTimeout(() => dbgShow('load'), 500);
    // fullscreen keeps the orientation chosen on the mockup (Portrait / Landscape buttons), or
    // landscape if the phone itself is sideways. When the phone is held the other way, the screen
    // turns 90° to fill it (.turn-cw / .turn-ccw, game-skin.css) — turn the phone and it straightens
    // (his pick A, 2026-11-18)
    let fsWant = false;
    const devLand = () => matchMedia('(orientation: landscape)').matches || innerWidth > innerHeight;
    // phones: no Portrait / Landscape buttons (game-skin.css .sc-wrap.on-phone); the page's mockup
    // turns with the phone instead
    if (isPhone) wrap.classList.add('on-phone');
    function phoneMatch() {
        if (!isPhone || fs || turning || devLand() === landscape) return;
        landscape = devLand();
        phone.classList.toggle('landscape', landscape); shadow.classList.toggle('landscape', landscape);
        for (const b of rotateBox.children) b.classList.toggle('on', b.classList.contains('landscape') === landscape);
        swapPoster();
    }
    addEventListener('resize', phoneMatch);
    function fsOrient() {
        const dev = devLand();
        if (isPhone) fsWant = dev; // phones: the phone's own rotation decides, live (his call 2026-11-18)
        const land = fsWant;
        wrap.classList.toggle('land', land);
        wrap.classList.toggle('turn-cw', land && !dev);
        wrap.classList.toggle('turn-ccw', !land && dev);
        if (land !== landscape) {
            landscape = land;
            phone.classList.toggle('landscape', land); shadow.classList.toggle('landscape', land);
            swapPoster();
        }
    }
    function layout() {
        if (fs) { area.removeAttribute('style'); fsOrient(); return; }
        if (big) {
            const b = bigBox();
            scale = b.s;
            Object.assign(area.style, {width: `${b.side}px`, height: `${b.side}px`, left: `${b.left}px`, top: `${b.top}px`});
            arrows.forEach(a => { a.style.top = `${b.top + b.side / 2 - 23}px`; });
        } else {
            scale = inlineScale();
            area.removeAttribute('style');
            area.style.width = area.style.height = `${SIDE * scale}px`;
            arrows.forEach(a => { a.style.top = ''; });
        }
        applyTurn();
    }

    // ---- poster / play ----
    const orient = () => (landscape ? 'landscape' : 'portrait');
    function showIdle() {
        session++;
        cleanup?.(); cleanup = null;
        wrap.classList.remove('playing');
        const p = list[cur];
        screen.innerHTML = `<div class="sc-poster" style="background-image:url(${p.posterBase}_${orient()}_bg.jpg)">${dots(26)}
            <img class="sc-logo" alt="" src="${p.posterBase}_${orient()}_logo.webp"></div>
            <i class="sc-play-glow"></i><button class="sc-play" type="button" aria-label="Play ${p.title}">${PLAY_ICON}</button><div class="sc-tap">TAP TO PLAY</div>`;
        screen.querySelector('.sc-play').onclick = e => { e.stopPropagation(); big ? play() : expand(); };
    }
    function swapPoster() {
        const poster = screen.querySelector('.sc-poster');
        if (!poster) return;
        const p = list[cur];
        poster.style.backgroundImage = `url(${p.posterBase}_${orient()}_bg.jpg)`;
        poster.querySelector('.sc-logo').src = `${p.posterBase}_${orient()}_logo.webp`;
    }
    function forwardAD(w) {
        if (!w) return;
        const map = {a: 'ArrowLeft', d: 'ArrowRight'};
        for (const type of ['keydown', 'keyup']) w.addEventListener(type, e => {
            const key = map[e.key.toLowerCase()];
            if (key) w.dispatchEvent(new w.KeyboardEvent(type, {key, code: key, repeat: e.repeat, bubbles: true, cancelable: true}));
            if (e.key === 'Escape' && type === 'keydown') close();
        }, true);
    }
    function play() {
        const my = ++session, t0 = performance.now(), p = list[cur];
        wrap.classList.add('playing');
        screen.innerHTML = `<iframe src="${p.file}" title="${p.title}" allow="autoplay; fullscreen"></iframe>${LOADING}`;
        const frame = screen.querySelector('iframe'), loading = screen.querySelector('.sc-loading');
        frame.addEventListener('load', () => {
            if (frame.contentDocument) window.PlayableNineSlice?.bakeDoc(frame.contentDocument);
            forwardAD(frame.contentWindow);
            frame.focus();
        }, {once: true});
        const done = () => {
            removeEventListener('message', onMsg); clearTimeout(to);
            if (my !== session) return;
            setTimeout(() => {
                if (my !== session) return;
                loading.classList.add('done');
                setTimeout(() => { if (my === session) loading.remove(); }, 600);
            }, Math.max(0, MIN_LOADING - (performance.now() - t0)));
        };
        const onMsg = e => { if (e.source === frame.contentWindow && e.data?.type === 'playable-ready') done(); };
        addEventListener('message', onMsg);
        const to = setTimeout(done, TIMEOUT);
        cleanup = () => { removeEventListener('message', onMsg); clearTimeout(to); };
    }

    // ---- arrows: slide out, swap, slide in (= game go()) ----
    function go(dir) {
        if (list.length < 2 || busy) return;
        cur = (cur + dir + list.length) % list.length;
        session++;
        const my = ++slideToken, dist = Math.min(innerWidth * 0.6, 700) / scale;
        const fromX = slideX, fromA = slideA;
        let t0 = performance.now(), swapped = false;
        const step = now => {
            if (my !== slideToken) return;
            if (!swapped) {
                const p = Math.min(1, (now - t0) / SLIDE_OUT), e = easeIn(p);
                slideX = fromX + (-dir * dist - fromX) * e; slideA = fromA * (1 - e);
                if (p >= 1) { swapped = true; t0 = now; showIdle(); }
            } else {
                const p = Math.min(1, (now - t0) / SLIDE_IN), e = easeOut(p);
                slideX = dir * dist * (1 - e); slideA = e;
                if (p >= 1) { slideX = 0; slideA = 1; }
            }
            applyTurn();
            if (!swapped || slideA < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    // ---- Portrait / Landscape: a quarter turn, orientation swaps in the dark at halfway (= game rotate()) ----
    function rotate() {
        if (turning) return;
        turning = true;
        const to = !landscape, target = -90, t0 = performance.now();
        let swapped = false;
        phone.classList.add('fading');
        for (const b of rotateBox.children) b.classList.toggle('on', b.classList.contains('landscape') === to);
        const step = now => {
            const p = Math.min(1, (now - t0) / TURN), a = easeInOut(p) * target;
            if (!swapped && p >= 0.5) {
                swapped = true; landscape = to;
                phone.classList.toggle('landscape', to); shadow.classList.toggle('landscape', to);
                swapPoster();
            }
            if (p >= 0.65) phone.classList.remove('fading');
            angle = swapped ? a - target : a;
            applyTurn();
            if (p < 1) requestAnimationFrame(step); else { angle = 0; applyTurn(); turning = false; }
        };
        requestAnimationFrame(step);
    }

    // ---- big view: the area flies from its spot in the page to the middle (FLIP), then plays ----
    // the arrows + Portrait / Landscape slide from their old spots to their new ones WITH the phone
    // (same duration + curve), instead of jumping there; moved with `translate`, which stacks on
    // their own transforms (the mirrored prev arrow, the centred rotate strip)
    async function flip(toBig) {
        const ctrls = [...arrows, rotateBox];
        const from = area.getBoundingClientRect(), cFrom = ctrls.map(c => c.getBoundingClientRect());
        big = toBig;
        wrap.classList.toggle('big', toBig);
        layout();
        const to = area.getBoundingClientRect(), k = from.width / to.width, z = Z(); // (rects = screen px; translates = zoomed px)
        const opts = {duration: toBig ? FLY_MS : FLY_MS * 0.85, easing: 'cubic-bezier(.3, 0, .2, 1)'};
        const anims = ctrls.map((c, i) => {
            const r = c.getBoundingClientRect(), f = cFrom[i];
            const dx = ((f.left + f.width / 2) - (r.left + r.width / 2)) / z, dy = ((f.top + f.height / 2) - (r.top + r.height / 2)) / z;
            return c.animate([{translate: `${dx}px ${dy}px`}, {translate: '0 0'}], opts).finished;
        });
        anims.push(area.animate([
            {transform: `translate(${(from.left - to.left) / z}px, ${(from.top - to.top) / z}px) scale(${k})`, transformOrigin: '0 0'},
            {transform: 'none', transformOrigin: '0 0'},
        ], opts).finished);
        await Promise.all(anims);
    }
    async function expand() {
        if (big || busy) return;
        if (isPhone) {
            big = fs = true; landBeforeFs = landscape;
            fsWant = landscape || matchMedia('(orientation: landscape)').matches || innerWidth > innerHeight;
            root.style.minHeight = `${root.offsetHeight}px`;
            document.body.classList.add('play-open');
            wrap.classList.add('big', 'fs');
            layout();
            play();
            dbgShow('opened');
            return;
        }
        busy = true;
        root.style.minHeight = `${root.offsetHeight}px`; // keeps the page from shifting under it
        document.body.classList.add('play-open');
        dim.classList.add('lit');
        wrap.classList.add('flying');
        await flip(true);
        wrap.classList.remove('flying');
        busy = false;
        play();
    }
    async function close() {
        if (!big || busy) return;
        if (fs) {
            big = fs = false;
            wrap.classList.remove('big', 'fs', 'land', 'turn-cw', 'turn-ccw');
            if (landscape !== landBeforeFs) {
                landscape = landBeforeFs;
                phone.classList.toggle('landscape', landscape); shadow.classList.toggle('landscape', landscape);
            }
            phoneMatch(); // (phones: back the way the phone is held now)
            showIdle();
            layout();
            root.style.minHeight = '';
            document.body.classList.remove('play-open');
            return;
        }
        busy = true;
        showIdle(); // unload the playable, poster back
        dim.classList.remove('lit');
        wrap.classList.add('flying');
        await flip(false);
        wrap.classList.remove('flying');
        root.style.minHeight = '';
        document.body.classList.remove('play-open');
        busy = false;
    }

    // ---- wiring ----
    wrap.querySelector('.prev').onclick = () => go(-1);
    wrap.querySelector('.next').onclick = () => go(1);
    // = game ROTATE_FRAME: the HUD button frame 1.4x thick, baked into one image (no seams, no blur)
    const ROTATE_FRAME = {src: '/ui/hud/button_frame.png', slice: [66, 66, 90], border: [20.3, 20.3, 27.7]};
    for (const b of rotateBox.children) {
        b.onclick = () => { if (b.classList.contains('landscape') !== landscape) rotate(); };
        window.PlayableNineSlice?.keep(b, ROTATE_FRAME);
    }
    area.addEventListener('click', () => { if (!big) expand(); });
    wrap.querySelector('.sc-x').onclick = close;
    dim.addEventListener('click', close);
    addEventListener('keydown', e => {
        if (e.key === 'Escape') close();
        if (big && !wrap.classList.contains('playing')) { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }
    });
    addEventListener('resize', () => { if (!busy) layout(); });

    fetch(root.dataset.src).then(res => res.json()).then(data => {
        list = data.playables || [];
        if (!list.length) return;
        if (list.length < 2) arrows.forEach(a => { a.style.visibility = 'hidden'; });
        phoneMatch(); // phones: start the way the phone is held
        layout();
        showIdle();
    }).catch(e => console.warn('Current Employment: playables.json failed', e));
})();
