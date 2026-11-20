// assets/js/playable-nineslice.js — = the game's ui/NineSlice.ts + ui/playableNineSlice.ts (plain JS).
// The Sett playables draw their bubbles / buttons with CSS border-image in vmin: fractional px, so thin
// lines open at the 9 pieces' joins (worst while they scale). Fix: bake each one into ONE image at its
// size. Called with a running playable's document (same origin).
window.PlayableNineSlice = (() => {
    const imgs = new Map(), baked = new Map(), wanted = new WeakMap(), held = [];
    const load = src => { let i = imgs.get(src); if (!i) { i = new Image(); i.src = src; imgs.set(src, i); } return i; };

    function apply(el, spec) {
        const img = load(spec.src);
        if (!img.complete || !img.naturalWidth) { img.addEventListener('load', () => apply(el, spec), {once: true}); return; }
        const w = el.offsetWidth, h = el.offsetHeight;
        if (!w || !h) return;
        const k = Math.max(2, Math.ceil(devicePixelRatio * 1.2));
        const key = `${spec.src}|${spec.border}|${w}x${h}|${k}`;
        wanted.set(el, key);
        const hit = baked.get(key);
        if (hit) { show(el, hit); return; }
        const c = document.createElement('canvas'); c.width = w * k; c.height = h * k;
        const g = c.getContext('2d', {willReadFrequently: true}); // CPU canvas: ~0.3ms vs ~15ms GPU wait
        // spec.ref = the height the borders were tuned at: a shorter element (phones) shrinks them by
        // the same ratio, so the frame keeps its look instead of pinching the middle (2026-11-18)
        const f = spec.ref ? Math.min(1, h / spec.ref) : 1;
        const [st, sl, sb = st] = spec.slice, [bt, bl, bb = bt] = spec.border.map(v => v * f);
        const iw = img.naturalWidth, ih = img.naturalHeight, R = Math.round;
        const sx = [0, sl, iw - sl, iw], sy = [0, st, ih - sb, ih];
        const dx = [0, R(bl * k), R((w - bl) * k), w * k], dy = [0, R(bt * k), R((h - bb) * k), h * k];
        for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++)
            g.drawImage(img, sx[q], sy[r], sx[q + 1] - sx[q], sy[r + 1] - sy[r], dx[q], dy[r], dx[q + 1] - dx[q], dy[r + 1] - dy[r]);
        c.toBlob(async blob => {
            if (!blob) return;
            let url = baked.get(key);
            if (!url) {
                const src = URL.createObjectURL(blob), im = new Image();
                im.src = src; await im.decode().catch(() => {});
                url = `url(${src})`;
                if (baked.size > 64) { baked.clear(); held.length = 0; }
                baked.set(key, url); held.push(im);
            }
            if (wanted.get(el) === key) show(el, url);
        });
    }
    // the frame and its contents appear together: keep() hides the element (.ns-wait, game-skin.css)
    // until its frame art has loaded, then draws it at once with the browser's own border-image
    // (quick()); the baked, seam-free version replaces it here a moment later (his pick A, 2026-11-18)
    function show(el, url) {
        el.style.backgroundImage = url; el.style.borderImage = ''; el.style.borderStyle = ''; el.style.borderWidth = '';
        el.classList.remove('ns-wait');
    }
    function quick(el, spec) {
        const img = load(spec.src);
        const go = () => {
            if (el.style.backgroundImage) return; // the bake won the race
            const h = el.offsetHeight, f = spec.ref && h ? Math.min(1, h / spec.ref) : 1;
            const [st, sl, sb = st] = spec.slice, [bt, bl, bb = bt] = spec.border.map(v => v * f);
            el.style.borderStyle = 'solid'; el.style.borderWidth = '0'; // (no layout change: some had all:unset = 3 px borders)
            el.style.borderImage = `url(${spec.src}) ${st} ${sl} ${sb} ${sl} fill / ${bt}px ${bl}px ${bb}px ${bl}px / 0 stretch`;
            el.classList.remove('ns-wait');
        };
        if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go, {once: true});
    }

    const px = (v, base) => (v.endsWith('px') ? parseFloat(v) : v === 'auto' ? base : parseFloat(v) * base);

    /** Swap every border-image in `doc` (now and later) for a baked background. */
    function bakeDoc(doc) {
        const view = doc.defaultView;
        if (!view) return;
        const done = new WeakSet(), srcOf = new WeakMap();
        const spec = (el, src) => {
            const cs = view.getComputedStyle(el);
            const s = cs.borderImageSlice.replace('fill', '').trim().split(/\s+/).map(Number);
            const w = cs.borderImageWidth.trim().split(/\s+/);
            if (!s.length || s.some(isNaN)) return null;
            const [st, sr = st, sb = st] = s;
            const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth].map(parseFloat);
            const [wt, wr = wt, wb = wt] = w;
            return {src, slice: [st, sr, sb], border: [px(wt, bw[0]), px(wr, bw[1]), px(wb, bw[2])]};
        };
        const bake = el => { const src = srcOf.get(el), sp = src && spec(el, src); if (sp) apply(el, sp); };
        const resize = new view.ResizeObserver(es => { for (const e of es) bake(e.target); });
        const take = el => {
            if (done.has(el) || !(el instanceof view.HTMLElement)) return;
            const m = /url\(["']?(.*?)["']?\)$/.exec(view.getComputedStyle(el).borderImageSource);
            if (!m) return;
            done.add(el); srcOf.set(el, m[1]);
            Object.assign(el.style, {
                borderImageSource: 'none', borderColor: 'transparent',
                backgroundOrigin: 'border-box', backgroundClip: 'border-box', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
            });
            bake(el);
            resize.observe(el, {box: 'border-box'});
        };
        const scan = root => { take(root); for (const el of root.querySelectorAll('*')) take(el); };
        if (doc.body) scan(doc.body);
        new view.MutationObserver(ms => {
            for (const m of ms) {
                if (m.type === 'attributes') scan(m.target);
                else for (const n of m.addedNodes) if (n.nodeType === 1) scan(n);
            }
        }).observe(doc.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
    }
    /** = game keepNineSlice: bake now + again whenever el's layout size changes. */
    function keep(el, spec) {
        if (!el.style.backgroundImage) {
            el.classList.add('ns-wait'); setTimeout(() => el.classList.remove('ns-wait'), 3000); // (never hidden for good if the art fails)
            quick(el, spec);
        }
        apply(el, spec); new ResizeObserver(() => apply(el, spec)).observe(el, {box: 'border-box'}); }

    // the site's own cartoony HUD art: any element with data-hud="<name>" gets that frame, baked
    // (= the game's ui/HudFrame.ts + tutorial/MascotBubble.ts specs)
    const HUD = {
        gold: {src: '/ui/hud/button_frame_gold.png', slice: [66, 66, 90], border: [21.75, 21.75, 29.7], ref: 68},  // HUD_BUTTON_GOLD x1.5; 68 = Prefer to play's PC height
        goldSmall: {src: '/ui/hud/button_frame_gold.png', slice: [66, 66, 90], border: [14.5, 14.5, 19.8]}, // HUD_BUTTON_GOLD x1 (short buttons)
        display: {src: '/ui/hud/display_frame.png', slice: [64, 64, 86], border: [10.6, 10.6, 14.2]},     // HUD_DISPLAY x0.75
        panel: {src: '/ui/tutorial_panel.png', slice: [60, 64], border: [30, 32]},                        // BUBBLE_PANEL
        purple: {src: '/ui/hud/button_frame_purple.png', slice: [66, 66, 90], border: [14.5, 14.5, 19.8]}, // HUD_BUTTON_PURPLE x1 (Chrome prompt's "Stay here")
    };
    const hudAll = () => document.querySelectorAll('[data-hud]').forEach(el => { const s = HUD[el.dataset.hud]; if (s) keep(el, s); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hudAll); else hudAll();
    return {bakeDoc, apply, keep};
})();
