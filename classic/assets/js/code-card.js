// assets/js/code-card.js — the game's "genie" script code card (src/ui/codeCard.ts), plain JS.
// Click a C# gem (.game-script, built by game-art.js): the card flows out of it (N strips, tilted to the
// side with room); click the card = open the file on GitHub; X / click outside / scroll = flows back.
// Look: assets/css/code-card.css.
(() => {
    const N = 20, DUR = 460, STAGGER = 320;
    const rawToBlob = raw => {
        const m = raw.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/(?:refs\/heads\/)?([^/]+)\/(.+)$/);
        return m ? `https://github.com/${m[1]}/${m[2]}/blob/${m[3]}/${m[4]}` : raw;
    };
    const cache = new Map(), inflight = new Map();
    let openFor = null, geom = null, busy = false;

    const sv = document.createElement('div');
    sv.id = 'scriptview'; sv.className = 'sview';
    sv.innerHTML = `
      <div class="sv-bar"><span class="sv-name"></span><button class="sv-x" title="Close" aria-label="Close"></button></div>
      <div class="sv-skeleton">${'<i></i>'.repeat(24)}</div>
      <pre><code class="language-csharp"></code></pre>
      <div class="sv-hint">Open in <img class="gh" src="/ui/github_baked.png" alt="GitHub"></div>`; // (the blue GitHub badge of the link buttons)
    sv.style.display = 'none';
    const nameEl = sv.querySelector('.sv-name'), codeEl = sv.querySelector('pre code');
    const mount = () => document.body.appendChild(sv);
    if (document.body) mount(); else addEventListener('DOMContentLoaded', mount);

    sv.addEventListener('click', e => {
        if (e.target.closest('.sv-x')) { close(); return; }
        if (sv.dataset.href) window.open(sv.dataset.href, '_blank', 'noopener');
    });
    document.addEventListener('mousedown', e => {
        if (openFor && !busy && !sv.contains(e.target) && !e.target.closest('.game-script')) close();
    });
    addEventListener('scroll', () => { if (openFor) close(); }, true);
    addEventListener('resize', () => { if (openFor) close(); });

    function fetchSnippet(url) {
        if (cache.has(url)) return Promise.resolve(cache.get(url));
        if (inflight.has(url)) return inflight.get(url);
        const p = fetch(url).then(r => r.text()).then(t => { cache.set(url, t); inflight.delete(url); return t; })
            .catch(err => { inflight.delete(url); throw err; });
        inflight.set(url, p);
        return p;
    }
    const highlight = () => { codeEl.removeAttribute('data-highlighted'); window.hljs?.highlightElement(codeEl); };

    function stageEl() {
        let s = document.getElementById('genieStage');
        if (!s) { s = document.createElement('div'); s.id = 'genieStage'; document.body.appendChild(s); }
        s.innerHTML = '';
        return s;
    }
    function buildStrips(inner, left, top, W, H, loading) {
        const stage = stageEl(), band = Math.ceil(H / N), OVERLAP = 2, strips = [];
        for (let k = 0; k < N; k++) {
            const sy = k * band, bh = Math.min(band, H - sy);
            if (bh <= 0) break;
            const stripH = Math.min(bh + OVERLAP, H - sy);
            const strip = document.createElement('div');
            strip.className = 'genie-strip';
            strip.style.cssText = `left:${left}px;top:${top + sy}px;width:${W}px;height:${stripH}px;transform-origin:${W / 2}px ${(H / 2 - sy).toFixed(1)}px`;
            const card = document.createElement('div');
            card.className = loading ? 'sview gcard loading' : 'sview gcard';
            card.style.cssText = `width:${W}px;height:${H}px;transform:translateY(${-sy}px)`;
            card.innerHTML = inner;
            strip.appendChild(card); stage.appendChild(strip); strips.push(strip);
        }
        return {stage, strips};
    }
    function flow(strips, W, cx, cy, pcx, pcy, tilt, dir, done) {
        const sx = Math.max(.18, Math.min(.5, 120 / W));
        const collapsed = `translate(${(pcx - cx).toFixed(1)}px,${(pcy - cy).toFixed(1)}px) rotate(${tilt}deg) scale(${sx},0.1)`;
        const rest = `rotate(${tilt}deg)`;
        strips.forEach((el, k) => {
            const idx = dir === 'in' ? k : strips.length - 1 - k;
            el.style.transitionDelay = Math.round(idx * (STAGGER / strips.length)) + 'ms';
            el.style.transform = dir === 'in' ? collapsed : rest;
            el.style.opacity = dir === 'in' ? '0' : '1';
        });
        requestAnimationFrame(() => requestAnimationFrame(() => strips.forEach(el => {
            el.style.transform = dir === 'in' ? rest : collapsed;
            el.style.opacity = dir === 'in' ? '1' : '0';
        })));
        setTimeout(done, DUR + STAGGER + 40);
    }
    function revealCard() {
        sv.style.display = ''; sv.style.transition = 'none'; sv.classList.add('open');
        void sv.offsetWidth; sv.style.transition = '';
        sv.classList.add('glow-spawn');
        const clear = () => { sv.classList.remove('glow-spawn'); sv.removeEventListener('animationend', clear); sv.removeEventListener('animationcancel', clear); };
        sv.addEventListener('animationend', clear); sv.addEventListener('animationcancel', clear);
    }
    function open(pill, title, url) {
        if (busy) return;
        if (openFor === pill) { close(); return; }
        if (openFor) { openFor = null; sv.classList.remove('open'); }
        busy = true;
        document.body.classList.add('script-open');
        nameEl.textContent = title;
        codeEl.className = 'language-csharp';
        sv.dataset.href = rawToBlob(url);
        if (cache.has(url)) { sv.classList.remove('loading'); codeEl.textContent = cache.get(url); highlight(); }
        else {
            sv.classList.add('loading');
            fetchSnippet(url).then(t => {
                if (sv.dataset.href !== rawToBlob(url)) return;
                sv.classList.remove('loading'); codeEl.textContent = t; highlight();
            }).catch(() => {
                if (sv.dataset.href !== rawToBlob(url)) return;
                sv.classList.remove('loading'); codeEl.textContent = '// Could not load snippet';
            });
        }
        sv.style.display = ''; sv.classList.remove('open');
        // phones (code-card.css max-width 600): narrower, centred on screen, a smaller tilt — the
        // tilted 92% card ran off both sides (2026-11-18)
        const narrow = innerWidth <= 600 || innerHeight <= 500; // (+ sideways phones)
        const W = Math.min(innerHeight <= 500 ? 560 : 680, innerWidth * (narrow ? 0.86 : 0.92));
        sv.style.width = W + 'px';
        const pr = pill.getBoundingClientRect();
        const side = (pr.left + pr.width / 2) < innerWidth / 2 ? 'left' : 'right';
        let left = narrow ? (innerWidth - W) / 2 : side === 'right' ? pr.right + 18 : pr.left - W - 18;
        left = Math.max(10, Math.min(left, innerWidth - W - 10));
        const H = sv.offsetHeight;
        let top = narrow ? (innerHeight - H) / 2 : pr.top + pr.height / 2 - H / 2 - 280;
        top = Math.max(10, Math.min(top, innerHeight - H - 10));
        const tilt = (side === 'right' ? -4 : 4) * (narrow ? 0.5 : 1);
        sv.style.left = left + 'px'; sv.style.top = top + 'px'; sv.style.setProperty('--tilt', tilt + 'deg');
        geom = {left, top, W, H, cx: left + W / 2, cy: top + H / 2, tilt, pcx: pr.left + pr.width / 2, pcy: pr.top + pr.height / 2};
        const inner = sv.innerHTML;
        sv.style.display = 'none';
        const {stage, strips} = buildStrips(inner, left, top, W, H, sv.classList.contains('loading'));
        flow(strips, W, geom.cx, geom.cy, geom.pcx, geom.pcy, tilt, 'in', () => { stage.remove(); revealCard(); openFor = pill; busy = false; });
    }
    function close() {
        if (busy || !openFor) return;
        const g = geom;
        openFor = null;
        document.body.classList.remove('script-open');
        if (!g) { sv.classList.remove('open'); return; }
        busy = true;
        sv.classList.remove('open'); sv.style.display = 'none';
        const {stage, strips} = buildStrips(sv.innerHTML, g.left, g.top, g.W, g.H, sv.classList.contains('loading'));
        flow(strips, g.W, g.cx, g.cy, g.pcx, g.pcy, g.tilt, 'out', () => { stage.remove(); busy = false; });
    }

    // the C# gem buttons: hover = prefetch; click = the card
    document.addEventListener('mouseover', e => {
        const b = e.target.closest?.('.game-script'); if (b?.dataset.url) fetchSnippet(b.dataset.url).catch(() => {});
    });
    document.addEventListener('click', e => {
        const b = e.target.closest?.('.game-script'); if (!b) return;
        e.preventDefault();
        open(b, b.getAttribute('aria-label') || b.textContent.trim(), b.dataset.url);
    });
    // the modal closing: drop the card at once
    document.addEventListener('click', e => {
        if (!e.target.closest?.('.modal-close') && !e.target.classList?.contains('modal')) return;
        openFor = null; busy = false; geom = null; sv.classList.remove('open'); sv.style.display = 'none';
        document.body.classList.remove('script-open'); document.getElementById('genieStage')?.remove();
    }, true);
})();
