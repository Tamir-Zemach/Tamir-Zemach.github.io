// assets/js/game-on.js — About Me's "GAME ON!" neon sign (game-skin.css .go-neon): it flickers on the
// first time it scrolls into view (his pick "arcade neon" from about-lab, 2026-11-18).
// + his pick "I" (game-on-lab): letters split into .gl spans (per-letter glow wave), and on hover the
// marquee bulbs speed up via playbackRate, so they keep going from where they are instead of jumping.
(() => {
    const el = document.querySelector('.go-neon'); if (!el) return;

    [...el.childNodes].forEach((n) => {
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        const w = document.createElement('span');
        [...n.textContent.trim()].forEach((ch, i) => {
            const s = document.createElement('span'); s.className = 'gl'; s.textContent = ch === ' ' ? ' ' : ch;
            s.style.setProperty('--i', i); w.append(s);
        });
        n.replaceWith(w);
    });

    // grow the bulb ring to a whole number of 14 px bulb cells (else the right / bottom edge shows half bulbs)
    const fit = () => {
        const w = el.offsetWidth + 24, h = el.offsetHeight + 24;
        el.style.setProperty('--bx', `${(Math.ceil(w / 14) * 14 - w) / 2}px`);
        el.style.setProperty('--by', `${(Math.ceil(h / 14) * 14 - h) / 2}px`);
    };
    fit(); addEventListener('resize', fit); if (document.fonts) document.fonts.ready.then(fit);

    const bulbs = () => (el.getAnimations ? el.getAnimations({ subtree: true }) : [])
        .filter((a) => a.animationName === 'goChase');
    el.addEventListener('mouseenter', () => bulbs().forEach((a) => { a.playbackRate = 3.4; }));
    el.addEventListener('mouseleave', () => bulbs().forEach((a) => { a.playbackRate = 1; }));

    if (!('IntersectionObserver' in window)) { el.classList.add('play'); return; }
    const obs = new IntersectionObserver(es => { if (es[0].isIntersecting) { el.classList.add('play'); obs.disconnect(); } }, {threshold: 0.6});
    obs.observe(el);
})();
