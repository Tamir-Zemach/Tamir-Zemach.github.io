// assets/js/x-pulse.js — every X (project panel, code card, diploma view, fullscreen playable) gives a
// squash-pulse when pressed, THEN does its close (the close hides the X, so the pulse plays first,
// ~170 ms). His ask 2026-11-18. Look: game-skin.css .x-pulse.
(() => {
    const SEL = '.modal-close, .sv-x, .cv-x, .sc-x';
    const MS = 170;
    document.addEventListener('click', e => {
        const x = e.target.closest?.(SEL);
        if (!x || x.dataset.pulsed) return; // (the replayed click below goes through)
        e.preventDefault(); e.stopImmediatePropagation();
        x.classList.remove('x-pulse'); void x.offsetWidth; x.classList.add('x-pulse');
        setTimeout(() => {
            x.dataset.pulsed = '1';
            x.click();
            delete x.dataset.pulsed;
            x.classList.remove('x-pulse');
        }, MS);
    }, true);
})();
