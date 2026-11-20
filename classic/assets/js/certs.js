// assets/js/certs.js — Education: the certificates are on the page as framed images (straight-forward,
// no clicking needed to see them). Click one: it grows from its spot to full size over a dark backdrop
// (same feel as the playables' big view). Click / Esc / X: it shrinks back.
(() => {
    const frames = document.querySelectorAll('.cert-frame');
    if (!frames.length) return;
    const MS = 420;

    const view = document.createElement('div');
    view.id = 'cert-view';
    view.innerHTML = '<div class="dim"></div><div class="cv-frame"><img alt=""></div><div class="cv-cap"><b></b><span></span></div><button class="cv-x" type="button" aria-label="Close"></button>';
    document.body.appendChild(view);
    const big = view.querySelector('.cv-frame'), bigImg = big.querySelector('img');
    let from = null, busy = false;

    // the big frame's box: the image at its own aspect, as large as fits (room for the caption)
    function box(img) {
        const ar = img.naturalWidth / img.naturalHeight || 0.7, pad = 0; // the picture is the whole scroll
        // no caption under it any more (the certificate says it itself), so it can use the height
        const maxW = innerWidth * 0.92, maxH = innerHeight - 60;
        let h = maxH, w = (h - pad) * ar + pad;
        if (w > maxW) { w = maxW; h = (w - pad) / ar + pad; }
        return {w, h, left: (innerWidth - w) / 2, top: Math.max(20, (innerHeight - h) / 2)};
    }

    async function open(btn) {
        if (busy || from) return;
        busy = true; from = btn;
        const img = btn.querySelector('img'), fig = btn.closest('.cert');
        bigImg.src = img.currentSrc || img.src;
        bigImg.alt = img.alt;
        view.querySelector('.cv-cap b').textContent = (fig.querySelector('figcaption b') || fig.querySelector('.cert-sub'))?.textContent || '';
        const logo = fig.querySelector('figcaption .cert-logo'); // the school's logo under the title
        view.querySelector('.cv-cap span').innerHTML = logo ? logo.outerHTML : '';
        const b = box(img);
        Object.assign(big.style, {width: `${b.w}px`, height: `${b.h}px`, left: `${b.left}px`, top: `${b.top}px`});
        view.classList.add('on');
        document.body.classList.add('cert-open');
        btn.classList.add('away');
        requestAnimationFrame(() => view.classList.add('lit'));
        const r = btn.getBoundingClientRect();
        await big.animate([
            {transform: `translate(${r.left - b.left}px, ${r.top - b.top}px) scale(${r.width / b.w}, ${r.height / b.h})`},
            {transform: 'none'},
        ], {duration: MS, easing: 'cubic-bezier(.3, 0, .2, 1)'}).finished;
        busy = false;
    }

    async function close() {
        if (busy || !from) return;
        busy = true;
        const r = from.getBoundingClientRect(), b = big.getBoundingClientRect();
        view.classList.remove('lit');
        await big.animate([
            {transform: 'none'},
            {transform: `translate(${r.left - b.left}px, ${r.top - b.top}px) scale(${r.width / b.width}, ${r.height / b.height})`},
        ], {duration: MS * 0.85, easing: 'cubic-bezier(.3, 0, .2, 1)', fill: 'forwards'}).finished;
        from.classList.remove('away');
        view.classList.remove('on');
        big.getAnimations().forEach(a => a.cancel());
        document.body.classList.remove('cert-open');
        from = null; busy = false;
    }

    frames.forEach(btn => btn.addEventListener('click', () => open(btn)));

    // the school logo labels: click = grow downward with a one-line "who is this"
    document.querySelectorAll('.cert-label[role="button"]').forEach(label => {
        const toggle = () => label.setAttribute('aria-expanded', String(label.classList.toggle('open')));
        label.addEventListener('click', toggle);
        label.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });
    view.addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    addEventListener('resize', () => {
        if (!from || busy) return;
        const b = box(from.querySelector('img'));
        Object.assign(big.style, {width: `${b.w}px`, height: `${b.h}px`, left: `${b.left}px`, top: `${b.top}px`});
    });
})();
