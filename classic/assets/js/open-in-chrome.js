// assets/js/open-in-chrome.js — = the game's Samsung prompt (src/ui/OpenInChrome.ts + content/tutorial.ts
// introLines.chrome): on a PHONE in SAMSUNG INTERNET only, the page opens with the mascot recommending
// Chrome. Why: Samsung's forced dark mode (battery saver) recolours the site and can't be switched off
// or detected. "Open in Chrome" = an Android intent link (Chrome missing -> the fallback keeps them
// here); "Stay here" is remembered (same key as the game). Dev server (:5173) shows it every load;
// `?samsung=1` forces it on any phone-size screen (testing). Frames: playable-nineslice.js data-hud.
(() => {
    const KEY = 'openInChromeClosed';
    const q = new URLSearchParams(location.search);
    const forced = q.get('samsung') === '1';
    const samsung = forced || /SamsungBrowser/i.test(navigator.userAgent);
    const phone = forced ? Math.min(innerWidth, innerHeight) < 600
        : matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600;
    if (!samsung || !phone) return;
    const dev = location.port === '5173';
    try { if (!dev && localStorage.getItem(KEY)) return; } catch { /* storage blocked: offer it */ }

    const el = document.createElement('div');
    el.id = 'chrome-offer';
    el.innerHTML = `
        <div class="co-pop">
            <img class="co-mascot" src="/tutorial/mascot/points-thumb.png" alt="">
            <div class="co-bubble" data-hud="panel">
                <p>I recommend opening my portfolio in <img class="co-logo" src="/ui/chrome_logo.svg" alt=""> <b>Chrome</b><br>for the <b>best experience</b></p>
                <div class="co-btns">
                    <button type="button" class="co-open" data-hud="goldSmall">Open in Chrome</button>
                    <button type="button" class="co-stay" data-hud="purple">Stay here</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(el);
    document.body.classList.add('chrome-offer-on');
    const close = () => { el.classList.add('out'); document.body.classList.remove('chrome-offer-on'); setTimeout(() => el.remove(), 250); };
    el.querySelector('.co-open').onclick = () => { // straight from the tap: Android wants a user gesture
        const scheme = location.protocol.replace(':', '');
        location.href = `intent://${location.host}${location.pathname}${location.search}${location.hash}`
            + `#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(location.href)};end`;
        close();
    };
    el.querySelector('.co-stay').onclick = () => { try { localStorage.setItem(KEY, '1'); } catch { /* fine */ } close(); };
})();
