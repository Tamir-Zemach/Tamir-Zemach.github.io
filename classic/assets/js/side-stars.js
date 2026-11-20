// assets/js/side-stars.js — the empty sides on wide screens (>= 1280 px): pixel stars + calm pixel loot.
// His pick 2026-11-18 ("Loot + Warp (calm, no collect)" in side-lab). Trimmed from the lab's side-trial.js
// (all the other lab options live on in portfolio-labs\portfolio-game-labs\side-trial.js).
//  - 110 pixel stars in 3 depth layers; scrolling moves near layers more (wraps top/bottom)
//  - stars lean gently toward the mouse; dotted gold links appear between stars near it
//  - scrolling fast stretches the stars into hyperspace streaks
//  - half the near layer is loot (coin / heart / gem): dim + still at rest, lights up, spins, bobs and
//    glints only when the mouse is near
//  - only inside the side zones (stops ~40 px before the widest content); no work below 1280 px
(() => {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;z-index:-1;pointer-events:none;width:100%;height:100%';
    document.body.append(cv);
    const g = cv.getContext('2d');

    const PX = 3, snap = (v) => Math.round(v / PX) * PX;
    const sq = (x, y, s, c) => { g.fillStyle = c; g.fillRect(snap(x) - s / 2, snap(y) - s / 2, s, s); };
    const PAL = ['#ffffff', '#5ff3ff', '#ff7ad9', '#ffd23f', '#9b8cff'];
    const GOLD = '255, 210, 63';

    // loot sprites: dark outline (O), light / mid / dark shading
    const sprite = (x, y, rows, map, al) => {
        g.globalAlpha = al; const w = rows[0].length, h = rows.length;
        rows.forEach((r, ry) => [...r].forEach((ch, rx) => { if (map[ch]) sq(x + (rx - (w - 1) / 2) * PX, y + (ry - (h - 1) / 2) * PX, PX, map[ch]); }));
        g.globalAlpha = 1;
    };
    const COIN = [
        ['  OOO  ', ' OGGGO ', 'OGLLGDO', 'OGLGGDO', 'OGGGGDO', ' ODDDO ', '  OOO  '],
        [' OOO ', 'OLGGO', 'OLGDO', 'OLGDO', 'OGGDO', 'ODDDO', ' OOO '],
        [' O ', 'OLO', 'OLO', 'OGO', 'OGO', 'ODO', ' O '],
    ];
    const COIN_C = { O: '#6b3d00', G: '#ffc22e', L: '#fff3a0', D: '#d98e04' };
    const GEM = ['  OOO  ', ' OLLMO ', 'OLLMMDO', 'OMMMDDO', ' OMMDO ', '  ODO  ', '   O   '];
    const GEM_C = { '#5ff3ff': { O: '#0b3a5c', L: '#e6fdff', M: '#5ff3ff', D: '#1fa6c9' },
        '#9b8cff': { O: '#2a1660', L: '#f1e6ff', M: '#b48cff', D: '#6e45d6' } };
    const HEART = [' OO OO ', 'OLRORRO', 'ORRRRRO', 'ORRRRDO', ' ORRDO ', '  ODO  ', '   O   '];
    const HEART_C = { O: '#5c0b28', L: '#ffd0dc', R: '#ff4f7a', D: '#c92a55' };
    const shadowOf = (m) => Object.fromEntries(Object.keys(m).map((k) => [k, 'rgba(12, 4, 32, .4)']));
    const loot = (p, kind, x, y, al, active) => { // shadow, bob, sprite, coin / gem glint
        const bob = active ? Math.round(Math.sin(p.tw * 1.5)) * PX * .5 : 0;
        let rows, map;
        if (kind === 0) { rows = COIN[active ? [0, 1, 2, 1][((Math.floor(p.tw * 2) % 4) + 4) % 4] : 0]; map = COIN_C; }
        else if (kind === 1) { rows = HEART; map = HEART_C; }
        else { rows = GEM; map = GEM_C[p.c] || GEM_C['#5ff3ff']; }
        sprite(x, y + PX * 1.5, rows, shadowOf(map), al * .8);
        sprite(x, y + bob, rows, map, al);
        const gl = (p.tw * 1.3) % 6; // a short glint every few seconds
        if (active && kind !== 1 && gl < .5) {
            const k = gl < .25 ? 1 : 2; g.globalAlpha = al;
            [[0, 0], [k, 0], [-k, 0], [0, k], [0, -k]].forEach(([ax, ay]) => sq(x + PX * 1.5 + ax * PX, y + bob - PX * 2.5 + ay * PX, PX - 1, '#fff'));
            g.globalAlpha = 1;
        }
    };

    let W = 0, H = 0, gut = 0;
    const mouse = { x: -999, y: -999 };
    const pts = [];
    const size = () => {
        const dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; // real resolution = crisp
        cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
        gut = Math.max(0, (W - 1100) / 2); // widest content = project cards (~1020) + ~40 px air each side
        pts.length = 0;
        for (let i = 0; i < 110; i++) {
            const left = i % 2 === 0;
            pts.push({ x: left ? Math.random() * gut : W - Math.random() * gut, y: Math.random() * H, ox: 0, oy: 0,
                vx: (Math.random() - .5) * .1, vy: (Math.random() - .5) * .1,
                z: [.25, .55, 1][i % 3], tw: Math.random() * 6, side: left, c: PAL[i % PAL.length], isLoot: Math.random() < .5 });
        }
    };
    addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
    addEventListener('resize', size); size();

    const R = 170; // mouse reach
    let last = performance.now(), sv = 0, lastSY = scrollY;
    const tick = (now) => {
        const dt = Math.max(0, Math.min(50, now - last)) / 16.7; last = now; // first rAF time can be < last
        g.clearRect(0, 0, W, H);
        if (innerWidth < 1280) { requestAnimationFrame(tick); return; } // no sides = no work
        const mx = mouse.x, my = mouse.y;
        sv += ((scrollY - lastSY) - sv) * .25; lastSY = scrollY; // smoothed scroll speed

        for (const p of pts) {
            p.x += p.vx * dt; p.y += p.vy * dt; p.tw += .02 * dt;
            const lo = p.side ? 0 : W - gut, hi = p.side ? gut : W;
            if (p.x < lo || p.x > hi) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            const by = ((p.y - scrollY * p.z * .35) % H + H) % H; // scroll depth, wraps
            let tx = 0, ty = 0;
            const dx = p.x - mx, dy = by - my, d = Math.hypot(dx, dy) || 1;
            if (d < 200) { const f = (1 - d / 200) * 26 * (.5 + p.z * .5); tx = -dx / d * f; ty = -dy / d * f; } // gentle pull
            p.ox += (tx - p.ox) * .06 * dt; p.oy += (ty - p.oy) * .06 * dt;
            p.px = p.x + p.ox; p.py = by + p.oy;
            p.md = Math.hypot(p.px - mx, p.py - my);
        }

        // dotted gold links between stars near the mouse
        for (let i = 0; i < pts.length; i++) {
            const a = pts[i]; if (a.md > R) continue;
            for (let j = 0; j < pts.length; j++) {
                const b = pts[j]; if (j <= i && b.md <= R) continue;
                const d = Math.hypot(a.px - b.px, a.py - b.py); if (d > 110) continue;
                const al = (1 - d / 110) * (1 - Math.min(a.md, b.md) / R) * .32;
                if (al < .015) continue;
                g.fillStyle = `rgba(${GOLD}, ${Math.min(1, al * 1.6)})`;
                const n = Math.floor(d / (PX * 2));
                for (let k = 1; k < n; k++) { const t = k / n; g.fillRect(snap(a.px + (b.px - a.px) * t), snap(a.py + (b.py - a.py) * t), 2, 2); }
            }
        }

        for (const p of pts) {
            const tw = .75 + .25 * Math.sin(p.tw), glow = Math.max(0, 1 - p.md / R);
            const al = (.12 + p.z * .4) * tw + glow * .4;
            const isLoot = p.z === 1 && p.isLoot;
            const kind = p.c === '#ffffff' || p.c === '#ffd23f' ? 0 : p.c === '#ff7ad9' ? 1 : 2; // 0 coin, 1 heart, 2 gem
            g.globalAlpha = Math.min(1, al);
            if (!isLoot && p.z > .5 && Math.abs(sv) > 1) { // warp streak, trailing behind the scroll
                const len = Math.min(90, Math.abs(sv) * p.z * 2.2);
                g.fillStyle = '#cfc6ff';
                g.fillRect(snap(p.px) - 1, snap(p.py) - (sv > 0 ? 0 : len), 2, len);
            } else if (isLoot) {
                g.globalAlpha = 1;
                loot(p, kind, p.px, p.py, Math.min(1, .38 + glow * 1.2), glow > .15);
            } else {
                sq(p.px, p.py, p.z > .5 ? PX : 2, '#fff');
            }
            g.globalAlpha = 1;
        }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
})();
