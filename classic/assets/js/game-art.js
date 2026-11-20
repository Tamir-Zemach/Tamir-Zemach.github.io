// assets/js/game-art.js — builds the game's script + link buttons (same art as the game's focus panel).
// Link bar = the game's Unity-panel bar (unity_panel_tour_bundle option E, 2026-11-12): Unity -> Sett's gold
// Play button (middle, big), YouTube / GitHub -> cream HUD buttons with a coloured pulse, hover popups in the
// mascot speech-bubble art (captions on touch). Look: assets/css/link-bar.css. Frames are 9-sliced by
// playable-nineslice.js.
(() => {
    const BRAND_ICONS = {
        unity: '/ui/unity_baked.png',
        youtube: '/ui/youtube_baked.png',
        github: '/ui/github_baked.png',
    };
    const PLAY_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="cl-ig-play" gradientUnits="userSpaceOnUse" x1="0" y1="4" x2="0" y2="20">
      <stop offset="0" stop-color="#a84ca8"/><stop offset=".45" stop-color="#772378"/><stop offset="1" stop-color="#4f0c4f"/></linearGradient></defs>
      <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10-6.4a1 1 0 0 0 0-1.72l-10-6.4A1 1 0 0 0 8 5.6z" fill="url(#cl-ig-play)" stroke="#370033" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M9.7 7.6v3.4" stroke="#e193e4" stroke-width="1.1" stroke-linecap="round" opacity=".85"/></svg>`;
    // popup text (*word* = gold caps) + the touch caption
    const TIPS = {unity: '*Play* it in your browser', youtube: 'How it was *built*, start to finish', github: 'See the *full code*'};
    const CAPS = {unity: 'Play', youtube: 'Watch', github: 'Code'};
    const hl = t => t.replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');
    const GOLD = {src: '/ui/hud/button_frame_gold.png', slice: [66, 66, 90], border: [29, 29, 39.6], ref: 129};   // game HUD_BUTTON_GOLD x2 (ref = PC size: smaller on touch shrinks the rim too)
    const CREAM = {src: '/ui/hud/button_frame.png', slice: [66, 66, 90], border: [23.2, 23.2, 31.68], ref: 75};  // game HUD_BUTTON x1.6
    const BUBBLE = {src: '/ui/tutorial_panel.png', slice: [60, 64], border: [15, 16]};                  // game BUBBLE_PANEL, half size
    const keep = (el, spec) => requestAnimationFrame(() => window.PlayableNineSlice?.keep(el, spec)); // (once it's in the page)

    // Round gem button; the file name shows as a gold tip on hover (like the game).
    // A click opens the game's code card (code-card.js).
    function scriptButton(snippet) {
        const btn = document.createElement('button');
        btn.className = 'snippet-toggle game-script'; // (snippets.js skips .game-script)
        btn.type = 'button';
        btn.dataset.url = snippet.url;
        btn.setAttribute('aria-label', snippet.title);
        btn.innerHTML = `
            <span class="gs-btn"><span class="gs-gem"><img src="/ui/csharp.png" alt=""><span class="gs-shine"></span></span></span>
            <span class="gs-tip">${snippet.title}</span>`;
        return btn;
    }

    function linkBadge(link) {
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener';
        const icon = BRAND_ICONS[link.icon];
        if (!icon) {
            a.className = 'game-link pill';
            a.textContent = link.label || link.url;
            return a;
        }
        a.className = `game-link b-${link.icon}`;
        a.setAttribute('aria-label', link.label || link.icon);
        if (link.icon === 'unity') {
            a.classList.add('cl-play');
            a.innerHTML = PLAY_SVG;
            keep(a, GOLD);
        } else {
            a.classList.add('cl-cream');
            a.innerHTML = `
                <span class="gl-gem" style="--mask:url(${icon})">
                    <img src="${icon}" alt="">
                    <span class="gl-fill"></span><span class="gl-shine"></span>
                </span>`;
            keep(a, CREAM);
        }
        a.insertAdjacentHTML('beforeend', `<span class="cl-tip">${hl(TIPS[link.icon])}</span><span class="cl-cap">${CAPS[link.icon]}</span>`);
        keep(a.querySelector('.cl-tip'), BUBBLE);
        return a;
    }

    window.GameArt = {scriptButton, linkBadge};
})();
