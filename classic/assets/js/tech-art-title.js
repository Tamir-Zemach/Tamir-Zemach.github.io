// assets/js/tech-art-title.js
// Hero "AI TECH ARTIST" = the game's greeting-bubble TECH + ART fx (portfolio-game src/tutorial/GreetingFx.ts,
// plain-JS port: no PORTFOLIO, no typeGate). ART covers "ARTIST". Letters type in on load, then the alive loops +
// mouse reactions (TECH: glitch + sparks + pink lens; ART: wobble + splatter + drips + yellow lens). Look = tech-art-title.css.
(() => {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    const ART_PAINT = ['#ff4fa3', '#b45cff', '#4fd2ff'];
    const SPLATTER = ['#ff4fa3', '#ffa62e', '#4fd2ff', '#9b5cff', '#3fe07a'];
    const DRIP = ['#4fd2ff', '#9b5cff'];
    const DRIP_LIFT = 12;
    const TECH_SPARKS = ['#8ff7ff', '#ffffff', '#ff2bd6'];
    const TYPE_MS = 60;           // per letter
    const NEXT_WORD_AFTER = 450;  // ms after TECH arrives before ARTIST types in (game's typeGate)
    const pick = a => a[(Math.random() * a.length) | 0];

    // build: <TECH> <ARTIST>
    const word = (txt, id) => {
        const w = document.createElement('span');
        w.className = `tut-word fx-word fx-${id} fx-grad`;
        [...txt].forEach((c, i, all) => {
            const l = document.createElement('span');
            l.className = 'tut-ch'; l.textContent = c; l.dataset.ch = c;
            if (id === 'art') { l.style.setProperty('--i', i); l.style.setProperty('--n', all.length); l.style.setProperty('--paint', ART_PAINT[i % ART_PAINT.length]); }
            w.append(l);
        });
        return w;
    };
    const tech = word('TECH', 'tech'), art = word('ARTIST', 'art');
    title.textContent = ''; title.classList.add('ta-title');
    title.setAttribute('aria-label', 'Tech Artist');
    title.append(tech, art);

    // typing
    const typeWord = (w, id, done) => {
        const ls = [...w.querySelectorAll('.tut-ch')];
        ls.forEach((l, i) => setTimeout(() => {
            l.classList.add('on');
            if (i === 0) w.classList.add('start');
            if (i === ls.length - 1) setTimeout(() => { arrived(id, w); done && done(); }, id === 'art' ? Math.max(260, 620 - i * TYPE_MS) : 260);
        }, i * TYPE_MS));
    };
    const arrived = (id, w) => {
        w.classList.add('go');
        if (id === 'tech') { sparks(w, TECH_SPARKS, 10); setInterval(() => sparks(w, ['#8ff7ff', '#ffffff'], 3), 2600); }
        if (id === 'art') { drips(w, 500); setInterval(() => drips(w, 0, true), 4200); }
    };
    const start = () => typeWord(tech, 'tech', () => setTimeout(() => typeWord(art, 'art'), NEXT_WORD_AFTER));
    // wait for the font so the boxes/brush are sized to the real glyphs
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(start, 300));

    // mouse
    const lastPoke = {};
    const poke = (id, w) => {
        if (!w.classList.contains('go')) return;
        const now = performance.now();
        if (now - (lastPoke[id] || 0) < 450) return;
        lastPoke[id] = now;
        if (id === 'tech') {
            w.animate([
                { textShadow: '-3px 0 #ff2bd6, 3px 0 #00e5ff', translate: '2px -1px' },
                { textShadow: '3px 0 #ff2bd6, -3px 0 #00e5ff', translate: '-2px 1px' },
                { textShadow: '-2px 0 #ff2bd6, 2px 0 #00e5ff', translate: '1px 0' },
                { textShadow: 'none', translate: '0 0' },
            ], { duration: 320, easing: 'steps(4)' });
            sparks(w, TECH_SPARKS, 8);
        } else {
            w.querySelectorAll('.tut-ch').forEach((l, i) => l.animate(
                [{ rotate: '0deg', scale: '1' }, { rotate: `${i % 2 ? 9 : -9}deg`, scale: '1.12' }, { rotate: `${i % 2 ? -5 : 5}deg` }, { rotate: '0deg', scale: '1' }],
                { duration: 480, delay: i * 50, easing: 'ease-out' }));
            splatter(w, 7);
        }
    };
    const lens = (w, e) => {
        for (const l of w.querySelectorAll('.tut-ch')) {
            const r = l.getBoundingClientRect();
            l.style.setProperty('--lx', `${e.clientX - r.left}px`);
            l.style.setProperty('--ly', `${e.clientY - r.top}px`);
        }
        w.classList.add('hover');
    };
    // trail: capped (one per 30 ms / 90 ms ART, max 40 alive, divs reused)
    const pool = [], live = new Set(); let lastTrail = 0;
    const trail = (id, w, e) => {
        if (!w.classList.contains('go')) return;
        const now = performance.now(), isTech = id === 'tech';
        if (now - lastTrail < (isTech ? 30 : 90) || live.size >= 40) return;
        lastTrail = now;
        const d = pool.pop() || document.createElement('div');
        d.removeAttribute('style');
        const done = () => { d.remove(); live.delete(d); pool.push(d); };
        live.add(d);
        if (!isTech) {
            d.className = 'fx-drip';
            const ls = w.querySelectorAll('.tut-ch'), a = ls[0].getBoundingClientRect(), b = ls[ls.length - 1].getBoundingClientRect();
            const x = Math.max(a.left + a.width * .25, Math.min(b.right - b.width * .25, e.clientX));
            const wr = w.getBoundingClientRect();
            Object.assign(d.style, { left: `${x - 3 - wr.left}px`, top: `${a.bottom - DRIP_LIFT - wr.top}px`, height: '10px', background: pick(DRIP) });
            w.append(d);
            dripAnim(d, 0).onfinish = done;
            return;
        }
        d.className = 'fx-spark';
        const s = 9 + Math.random() * 7, c = pick(TECH_SPARKS);
        Object.assign(d.style, { width: `${s}px`, height: `${s}px`, left: `${e.clientX}px`, top: `${e.clientY}px`, background: c, boxShadow: `0 0 6px ${c}` });
        document.body.append(d);
        const ang = Math.random() * Math.PI * 2, dist = 20 + Math.random() * 30;
        d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(ang) * dist}px, ${Math.sin(ang) * dist}px) scale(.4)`, opacity: 0 }],
            { duration: 450, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = done;
    };
    for (const [id, w] of [['tech', tech], ['art', art]]) {
        w.addEventListener('pointerenter', () => poke(id, w));
        w.addEventListener('pointermove', e => { trail(id, w, e); lens(w, e); });
        w.addEventListener('pointerleave', () => w.classList.remove('hover'));
    }

    // ---- fx helpers (divs animated with WAAPI, removed when done) ----
    function sparks(el, colors, n) {
        const r = el.getBoundingClientRect();
        for (let k = 0; k < n; k++) {
            const d = document.createElement('div');
            d.className = 'fx-spark';
            const s = 3 + Math.random() * 3;
            Object.assign(d.style, { width: `${s}px`, height: `${s}px`, background: colors[k % colors.length],
                left: `${r.left + Math.random() * r.width}px`, top: `${r.top + r.height * (.2 + Math.random() * .6)}px`, boxShadow: `0 0 6px ${colors[0]}` });
            document.body.append(d);
            const a = Math.random() * Math.PI * 2, dist = 18 + Math.random() * 30;
            d.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist - 10}px)`, opacity: 0 }],
                { duration: 500 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => d.remove();
        }
    }
    function splatter(el, n) {
        const r = el.getBoundingClientRect();
        for (let k = 0; k < n; k++) {
            const d = document.createElement('div');
            d.className = 'fx-spark';
            const s = 3 + Math.random() * 5;
            Object.assign(d.style, { width: `${s}px`, height: `${s}px`, borderRadius: '50%', background: SPLATTER[k % SPLATTER.length],
                left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px` });
            document.body.append(d);
            const a = Math.random() * Math.PI * 2, dist = 16 + Math.random() * 28, to = `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px)`;
            d.animate([{ transform: 'translate(0,0) scale(.3)' }, { transform: `${to} scale(1)`, offset: .35 }, { transform: `${to} scale(1)`, opacity: 1, offset: .8 }, { transform: `${to} scale(1)`, opacity: 0 }],
                { duration: 1000, easing: 'ease-out' }).onfinish = () => d.remove();
        }
    }
    function dripAnim(d, delay) {
        return d.animate([{ transform: 'scaleY(0)', opacity: 1 }, { transform: 'scaleY(1.6)', opacity: 1, offset: .5 }, { transform: 'translateY(10px) scaleY(.8)', opacity: 0 }],
            { duration: 1200, delay, easing: 'ease-in', fill: 'both' });
    }
    function drips(w, delay = 0, one = false) {
        let letters = [...w.querySelectorAll('.tut-ch')];
        if (one) letters = [pick(letters)];
        const wr = w.getBoundingClientRect();
        letters.forEach((l, i) => {
            const r = l.getBoundingClientRect();
            const d = document.createElement('div');
            d.className = 'fx-drip';
            Object.assign(d.style, { left: `${r.left - wr.left + r.width * (.3 + Math.random() * .4)}px`, top: `${r.bottom - wr.top - DRIP_LIFT}px`, height: '10px',
                background: one ? pick(DRIP) : DRIP[i % DRIP.length] });
            w.append(d);
            dripAnim(d, delay + i * 120).onfinish = () => d.remove();
        });
    }
})();
