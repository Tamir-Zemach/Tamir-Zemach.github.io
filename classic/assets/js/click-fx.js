// assets/js/click-fx.js — the game's click feedback (game src/ui/ClickFx.ts, his pick "C"):
// every MOUSE press pops a small gold ring + sparks at the fingertip, and the hand cursor
// pushes in for a moment (body.cur-tap = a frame swap; CSS cursors can't animate).
(() => {
    const cfg = { // = game config.ts clickFx
        size: 0.45, tapTime: 0.14, color: '#ffd75e',
        ringSize: 46, ringTime: 0.38, sparkCount: 6, sparkDist: 24, sparkTime: 0.42,
    };

    const layer = document.createElement('div');
    layer.className = 'click-fx';
    document.body.appendChild(layer);
    let tapTimer = 0;

    window.addEventListener('pointerdown', e => {
        if (e.pointerType !== 'mouse') return;
        ring(e.clientX, e.clientY);
        sparks(e.clientX, e.clientY);
        document.body.classList.add('cur-tap');
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => document.body.classList.remove('cur-tap'), cfg.tapTime * 1000);
    }, {capture: true, passive: true});

    function piece(x, y, cls, px) {
        const el = document.createElement('div');
        el.className = `click-fx-${cls}`;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = el.style.height = `${px}px`;
        el.style.margin = `${-px / 2}px 0 0 ${-px / 2}px`;
        el.style.setProperty('--c', cfg.color);
        layer.appendChild(el);
        return el;
    }

    function ring(x, y) {
        const el = piece(x, y, 'ring', cfg.ringSize * cfg.size);
        el.animate(
            [{transform: 'scale(0.15)', opacity: 1}, {transform: 'scale(1)', opacity: 0}],
            {duration: cfg.ringTime * 1000, easing: 'cubic-bezier(.2, .7, .3, 1)'},
        ).onfinish = () => el.remove();
    }

    function sparks(x, y) {
        const turn = Math.random() * Math.PI * 2;
        for (let i = 0; i < cfg.sparkCount; i++) {
            const a = turn + (i / cfg.sparkCount) * Math.PI * 2;
            const d = cfg.sparkDist * cfg.size * (0.8 + Math.random() * 0.4);
            const el = piece(x, y, 'spark', 5 * cfg.size);
            const dx = Math.cos(a) * d, dy = Math.sin(a) * d;
            el.animate(
                [
                    {transform: 'translate(0, 0) scale(0.4)', opacity: 1},
                    {transform: `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(1.15)`, opacity: 1, offset: 0.45},
                    {transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0},
                ],
                {duration: cfg.sparkTime * 1000, easing: 'cubic-bezier(.15, .8, .3, 1)'},
            ).onfinish = () => el.remove();
        }
    }
})();
