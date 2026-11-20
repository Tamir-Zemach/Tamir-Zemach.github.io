// assets/js/skills-sort.js — nothing on the page can be native-dragged (images, links, nav).
// The skills drag-to-sort was REMOVED 2026-11-18 (his call: feedback said it's irrelevant); clicking a
// skill still gets skills-fx.js's squash-pulse + sparkles. The sortable version is in git history.
(() => {
    addEventListener('dragstart', e => e.preventDefault(), true);
})();
