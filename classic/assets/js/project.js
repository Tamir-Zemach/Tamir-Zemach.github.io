// assets/js/project.js
(() => {
    const {openModal, modalMedia, onClear} = window.ModalHelpers;

    // The game's hover micro-animations on the mechanic titles (assets/js/mechanic-anims.js, built from
    // the game's src/ui/mechanicAnims.ts). Title -> the game's animKey (content/projects.ts).
    const ANIM_KEYS = {
        'Full Gameplay Footage': 'fullshine',
        'Object Pooling': 'objectpool', 'VFX': 'vfx', 'Palette Swap Shader': 'polarity', 'Parallax Effect': 'parallax',
        'Upgrade Popup': 'uppop', 'Unit Spawner': 'spawn', 'Money Flash': 'moneyflash',
        'Dash Drill': 'drilldash', 'Camera Transition': 'camera', 'Ragdoll': 'ragdoll', 'Static Turret': 'turret',
        'Pickup & Drop': 'pickupdrop', 'Color Reactive Wall': 'crw',
    };
    // the Upgrade Popup reel's vertical motion blur (= the game's FocusPanel svg defs)
    if (!document.getElementById('reelBlur')) document.body.insertAdjacentHTML('beforeend',
        '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="reelBlur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="0 5"/></filter>' +
        // = the game's FocusPanel #strokeDark: dark outline around the C# gem
        '<filter id="strokeDark" x="-40%" y="-40%" width="180%" height="180%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d"/>' +
        '<feFlood flood-color="#120a22"/><feComposite in2="d" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs></svg>');

    /** Title element for a mechanic: the animated one if the game has it, else a plain heading.
     *  mediaEl = the box around its video (some animations land on the video's top edge). */
    function mechanicTitle(title, mediaEl) {
        const MA = window.MechanicAnims, key = ANIM_KEYS[title];
        if (MA && key) {
            const {el, cleanup} = MA.buildMechanicLabel({title, animKey: key}, mediaEl);
            el.classList.add('mechanic-title');
            onClear(cleanup);
            return el;
        }
        const h = document.createElement('h3');
        h.className = 'mechanic-title';
        h.textContent = title;
        return h;
    }
    const videoBox = src => {
        const box = document.createElement('div');
        box.className = 'mech-media';
        box.innerHTML = `<video src="${src}" autoplay loop muted playsinline style="width:100%; border-radius:6px;"></video>`;
        return box;
    };

    async function loadJSON(src) {
        try {
            const res = await fetch(src);
            return await res.json();
        } catch {
            return [];
        }
    }

    function buildLinkBadge(link) {
        if (window.GameArt) return window.GameArt.linkBadge(link);
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'project-link-badge';

        if (link.icon) {
            const icon = document.createElement('span');
            icon.className = `icon brands fa-${link.icon}`;
            a.appendChild(icon);
        }

        const label = document.createElement('span');
        label.textContent = link.label || link.url;
        a.appendChild(label);

        return a;
    }

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', async () => {
            openModal(card.dataset.title, card.dataset.description);

            // Gameplay video + links inside same modal-media-box
            if (card.dataset.gameplayVideo) {
                const gameplayBox = document.createElement('div');
                gameplayBox.className = 'modal-media-box';

                const media = videoBox(card.dataset.gameplayVideo);
                gameplayBox.appendChild(mechanicTitle('Full Gameplay Footage', media));
                gameplayBox.appendChild(media);

                // links inside same box
                if (card.dataset.linksSrc) {
                    const links = await loadJSON(card.dataset.linksSrc);
                    if (Array.isArray(links) && links.length > 0) {
                        const innerLinks = document.createElement('div');
                        innerLinks.className = 'modal-links gameplay-links';
                        links.forEach(link => innerLinks.appendChild(buildLinkBadge(link)));
                        gameplayBox.appendChild(innerLinks);
                    }
                }

                modalMedia.appendChild(gameplayBox);
            }

            // Mechanics
            let mechanics = [];
            if (card.dataset.mechanicsSrc) mechanics = await loadJSON(card.dataset.mechanicsSrc);
            else try {
                mechanics = JSON.parse(card.dataset.mechanics || '[]');
            } catch {
            }

            if (!Array.isArray(mechanics)) mechanics = [mechanics];

            if (mechanics.length > 0) {
                const heading = document.createElement('h2');
                heading.textContent = 'Mechanics';
                heading.className = 'mechanics-heading';
                modalMedia.appendChild(heading);

                mechanics.forEach(m => {
                    const box = document.createElement('div');
                    box.className = 'modal-media-box';
                    box.innerHTML = `
            <div class="mechanic">
              <p class="mechanic-description">${m.text || ''}</p>
              <div class="mechanic-scripts-label">${(m.snippets || []).length > 1 ? 'Scripts' : 'Script'}</div>
            </div>
          `;
                    const mech = box.querySelector('.mechanic'), media = videoBox(m.video);
                    mech.prepend(mechanicTitle(m.title || 'Mechanic', media), media);

                    if (Array.isArray(m.snippets)) {
                        const group = document.createElement('div');
                        group.className = 'snippet-group';
                        m.snippets.forEach(snippet => {
                            if (window.GameArt) { group.appendChild(window.GameArt.scriptButton(snippet)); return; }
                            const btn = document.createElement('button');
                            btn.className = 'snippet-toggle';
                            btn.textContent = snippet.title;
                            btn.dataset.url = snippet.url;
                            group.appendChild(btn);
                        });

                        box.appendChild(group);
                        if (window.GameArt) { modalMedia.appendChild(box); return; } // game script buttons open the code card (code-card.js)
                        const wrapper = document.createElement('div');
                        wrapper.className = 'snippet-wrapper';
                        const codeBox = document.createElement('div');
                        codeBox.className = 'code-box';
                        const pre = document.createElement('pre');
                        pre.className = 'snippet-content';
                        pre.dataset.active = '';
                        const handle = document.createElement('div');
                        handle.className = 'resize-handle';
                        handle.innerHTML = '<i class="fas fa-arrows-alt-v"></i>';
                        codeBox.appendChild(pre);
                        codeBox.appendChild(handle);
                        wrapper.appendChild(codeBox);

                        box.appendChild(wrapper);
                    }

                    modalMedia.appendChild(box);
                });
            }

            // Links bar at bottom (plain .modal-links, no modal-media-box wrapper)
            if (card.dataset.linksSrc) {
                const links = await loadJSON(card.dataset.linksSrc);
                if (Array.isArray(links) && links.length > 0) {
                    const bottomLinks = document.createElement('div');
                    bottomLinks.className = 'modal-links bottom-links';
                    links.forEach(link => bottomLinks.appendChild(buildLinkBadge(link)));
                    modalMedia.appendChild(bottomLinks);
                }
            }
        });
    });
})();