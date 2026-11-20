// assets/js/modal.js
(() => {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalMedia = document.getElementById('modalMedia');
    const modalClose = document.querySelector('.modal-close');

    let mouseDownTarget = null;
    // things to stop when the pop-up's contents go away (the title animations' timers / listeners)
    let cleanups = [];
    const runCleanups = () => { cleanups.forEach(fn => { try { fn(); } catch (e) {} }); cleanups = []; };
    const onClear = fn => cleanups.push(fn);

    function openModal(title, description) {
        runCleanups();
        modalTitle.textContent = title || '';
        modalDescription.textContent = description || '';
        modalMedia.innerHTML = '';
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        runCleanups();
        modal.style.display = 'none';
        modalMedia.innerHTML = '';
        document.body.classList.remove('modal-open');
    }

    // Track where the mouse went down
    window.addEventListener('mousedown', (e) => {
        mouseDownTarget = e.target;
    });

    // Only close if both down and up were on the backdrop
    window.addEventListener('mouseup', (e) => {
        if (
            modal.style.display === 'block' &&
            e.target === modal &&
            mouseDownTarget === modal
        ) {
            closeModal();
        }
        mouseDownTarget = null; // reset
    });

    // Close when clicking the X button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
        // The X lives OUTSIDE the scrolling panel (on its top-right frame corner) so it never covers the videos.
        // (.modal-content has a CSS filter, so a fixed child would still scroll with it -> move it to the overlay.)
        const content = modal.querySelector('.modal-content');
        modal.appendChild(modalClose);
        const placeClose = () => {
            if (modal.style.display !== 'block') return;
            const r = content.getBoundingClientRect();
            const w = modalClose.offsetWidth, h = modalClose.offsetHeight;
            // further out than the frame corner (his call: clear of the panel), but never off-screen
            // phones: the panel spans the screen, so "outside" got pinned to the screen edge, up on the
            // nav — sit ON the panel's top-right corner instead (his call 2026-11-18)
            const narrow = innerWidth <= 600;
            // (the drawn frame sits ~20 px inside the box: FRAME_IN, measured at 414 px)
            const FRAME_IN = 20;
            modalClose.style.left = (narrow ? r.right - FRAME_IN - w * 0.75 : Math.min(r.right - w * 0.3, document.documentElement.clientWidth - w - 6)) + 'px';
            modalClose.style.top = (narrow ? Math.max(r.top + FRAME_IN - h * 0.3, 6) : Math.max(r.top - h * 0.7, 6)) + 'px';
        };
        const _open = openModal;
        openModal = (...a) => { _open(...a); placeClose(); requestAnimationFrame(placeClose); };
        window.addEventListener('resize', placeClose);
        modal.addEventListener('scroll', placeClose);
        if (window.ResizeObserver) new ResizeObserver(placeClose).observe(content);
    }

    // Optional: close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Expose helpers globally
    window.ModalHelpers = {openModal, closeModal, modalMedia, onClear};
})();