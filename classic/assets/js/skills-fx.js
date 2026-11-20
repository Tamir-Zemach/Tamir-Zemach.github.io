// assets/js/skills-fx.js — skills row reacts to the mouse:
// tilt toward the cursor while hovered, squash-pulse + sparkle burst on click.
(() => {
    const MAX_TILT = 22; // degrees

    document.querySelectorAll('.skills-icons > div').forEach((item, i) => {
        item.style.setProperty('--bob-delay', `${(i * -0.37).toFixed(2)}s`);

        item.addEventListener('pointermove', e => {
            const r = item.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5..0.5
            const y = (e.clientY - r.top) / r.height - 0.5;
            item.style.setProperty('--ry', `${(x * MAX_TILT * 2).toFixed(1)}deg`);
            item.style.setProperty('--rx', `${(-y * MAX_TILT * 2).toFixed(1)}deg`);
        });

        item.addEventListener('pointerleave', () => {
            item.style.setProperty('--rx', '0deg');
            item.style.setProperty('--ry', '0deg');
        });

        item.addEventListener('click', () => {
            const icon = item.querySelector('.skill-icon');
            icon.classList.remove('tap');
            void icon.offsetWidth; // restart the animation
            icon.classList.add('tap');
            burst(item);
        });
    });

    function burst(item) {
        const n = 8;
        for (let k = 0; k < n; k++) {
            const s = document.createElement('span');
            s.className = 'skill-spark';
            const a = (k / n) * Math.PI * 2 + Math.random() * 0.5;
            const d = 46 + Math.random() * 22;
            s.style.setProperty('--dx', `${(Math.cos(a) * d).toFixed(1)}px`);
            s.style.setProperty('--dy', `${(Math.sin(a) * d).toFixed(1)}px`);
            s.style.setProperty('--sz', `${(10 + Math.random() * 8).toFixed(0)}px`);
            item.appendChild(s);
            s.addEventListener('animationend', () => s.remove());
        }
    }
})();
