// assets/js/mechanic-anims.js - GENERATED from the game's src/ui/mechanicAnims.ts (esbuild bundle, do not edit by hand). Rebuild after changing the game's animations. Exposes window.MechanicAnims.buildMechanicLabel(mechanic, mediaEl).
(() => {
  // SITE PATCH (2026-11-08): the game finds a title's video via section > .media; the site has
  // .modal-media-box > .mech-media instead. Every lookup goes through mediaOf(). Re-apply after a rebuild.
  const mediaOf = (label) => label.closest("section")?.querySelector(".media") || label.closest(".modal-media-box")?.querySelector(".mech-media") || null;
  // ../Desktop/Portfolio/portfolio-game/src/ui/mechanicAnims.ts
  function splitCharsInto(container, text) {
    for (const ch of text) {
      if (ch === " ") {
        container.appendChild(document.createTextNode(" "));
        continue;
      }
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      container.appendChild(s);
    }
  }
  function buildFullshineLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-fullshine";
    title.split(" ").forEach((word, wi) => {
      if (wi > 0) el.appendChild(document.createTextNode(" "));
      const w = document.createElement("span");
      w.className = "w-sh";
      splitCharsInto(w, word);
      el.appendChild(w);
    });
    return el;
  }
  function mountFullshine(label) {
    const words = Array.from(label.querySelectorAll(".w-sh"));
    const chars = words.flatMap((w) => Array.from(w.querySelectorAll(".ch")));
    const rand = (a, b) => a + Math.random() * (b - a);
    let timers = [];
    let spawnTimer = 0;
    let active = false;
    let sparks = [];
    function makeSpark() {
      if (!active) return;
      const lit = chars.filter((c) => c.classList.contains("lit"));
      if (!lit.length) return;
      const ch = lit[Math.floor(Math.random() * lit.length)];
      const s = document.createElement("i");
      s.className = "spark";
      const size = rand(6, 18);
      s.style.width = size.toFixed(1) + "px";
      s.style.height = size.toFixed(1) + "px";
      s.style.left = rand(15, 85).toFixed(1) + "%";
      s.style.top = rand(-10, 110).toFixed(1) + "%";
      s.style.setProperty("--r0", rand(-90, 90).toFixed(0) + "deg");
      s.style.setProperty("--r1", rand(-120, 120).toFixed(0) + "deg");
      s.style.setProperty("--r2", rand(-200, 200).toFixed(0) + "deg");
      s.style.setProperty("--life", rand(650, 1100).toFixed(0) + "ms");
      ch.appendChild(s);
      sparks.push(s);
      s.addEventListener("animationend", () => {
        s.remove();
        sparks = sparks.filter((x) => x !== s);
      });
    }
    function play() {
      const STAGGER = 260, GROW = 200, CHAR_STEP = 32, SPAWN = 150;
      words.forEach((w, i) => timers.push(window.setTimeout(() => {
        if (active) w.classList.add("grown");
      }, i * STAGGER)));
      const allGrown = (words.length - 1) * STAGGER + GROW;
      const sweepStart = allGrown + 80;
      chars.forEach((c, idx) => timers.push(window.setTimeout(() => {
        if (active) c.classList.add("lit");
      }, sweepStart + idx * CHAR_STEP)));
      spawnTimer = window.setInterval(makeSpark, SPAWN);
    }
    function reset() {
      active = false;
      timers.forEach(clearTimeout);
      timers = [];
      if (spawnTimer) {
        clearInterval(spawnTimer);
        spawnTimer = 0;
      }
      words.forEach((w) => w.classList.remove("grown"));
      chars.forEach((c) => c.classList.remove("lit"));
      sparks.forEach((s) => {
        s.style.animation = "none";
        s.style.transition = "opacity .3s ease";
        s.style.opacity = "0";
        setTimeout(() => s.remove(), 320);
      });
      sparks = [];
    }
    const onEnter = () => {
      if (!active) {
        active = true;
        play();
      }
    };
    const onLeave = () => reset();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      reset();
    };
  }
  function buildPickupDropLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-pickupdrop";
    const [left, right] = title.split(" & ");
    const wPickup = document.createElement("span");
    wPickup.className = "w-pickup";
    [...left].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      s.style.animationDelay = (i * 0.11).toFixed(2) + "s";
      wPickup.appendChild(s);
    });
    const amp = document.createElement("span");
    amp.className = "w-amp";
    amp.textContent = "&";
    const wDrop = document.createElement("span");
    wDrop.className = "w-drop";
    wDrop.textContent = right ?? "";
    el.append(wPickup, document.createTextNode(" "), amp, document.createTextNode(" "), wDrop);
    return el;
  }
  function mountPickupDrop(label) {
    const els = Array.from(label.querySelectorAll(".w-pickup .ch, .w-drop"));
    let raf1 = 0;
    let raf2 = 0;
    const onEnter = () => {
      els.forEach((el) => {
        el.style.transform = "";
        el.style.opacity = "";
      });
      label.classList.add("playing");
    };
    const onLeave = () => {
      els.forEach((el) => {
        const cs = getComputedStyle(el);
        el.style.transform = cs.transform;
        el.style.opacity = cs.opacity;
      });
      label.classList.remove("playing");
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          els.forEach((el) => {
            el.style.transform = "";
            el.style.opacity = "";
          });
        });
      });
    };
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }
  function buildCrwLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-crw";
    const lampL = document.createElement("i");
    lampL.className = "lamp";
    const text = document.createElement("span");
    text.className = "crw-text";
    splitCharsInto(text, title);
    const lampR = document.createElement("i");
    lampR.className = "lamp";
    el.append(lampL, text, lampR);
    return el;
  }
  function mountCrw(label) {
    const chars = Array.from(label.querySelectorAll(".crw-text .ch"));
    const rand = (a, b) => a + Math.random() * (b - a);
    const n = chars.length;
    const center = (n - 1) / 2;
    const maxDist = center;
    const dist = chars.map((_c, i) => Math.abs(i - center));
    chars.forEach((c) => c.style.setProperty("--dy", (-rand(8, 22)).toFixed(0) + "px"));
    const STEP = 48, TRANS = 430, GONE_HOLD = 180, DONE_HOLD = 420;
    let timers = [];
    let active = false;
    const T = (fn, ms) => {
      timers.push(window.setTimeout(fn, ms));
    };
    function cycle() {
      if (!active) return;
      chars.forEach((c, i) => T(() => {
        if (active) c.classList.add("gone");
      }, (maxDist - dist[i]) * STEP));
      const dissolvedAt = maxDist * STEP + TRANS;
      T(() => {
        if (active) label.classList.remove("lit");
      }, dissolvedAt);
      const reformAt = dissolvedAt + GONE_HOLD;
      chars.forEach((c, i) => T(() => {
        if (active) c.classList.remove("gone");
      }, reformAt + dist[i] * STEP));
      const reformedAt = reformAt + maxDist * STEP + TRANS;
      T(() => {
        if (active) label.classList.add("lit");
      }, reformedAt);
      T(cycle, reformedAt + DONE_HOLD);
    }
    function start() {
      active = true;
      label.classList.add("go");
      T(() => {
        if (active) label.classList.add("lit");
      }, 650);
      T(() => {
        if (active) cycle();
      }, 1100);
    }
    function stop() {
      active = false;
      timers.forEach(clearTimeout);
      timers = [];
      label.classList.remove("go", "lit");
      chars.forEach((c) => c.classList.remove("gone"));
    }
    const onEnter = () => {
      if (!active) start();
    };
    const onLeave = () => stop();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      stop();
    };
  }
  function buildUppopLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-uppop";
    el.textContent = title;
    return el;
  }
  function mountUppop(label) {
    const text = label.textContent ?? "";
    label.textContent = "";
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const rnd = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    const randWord = (n) => Array.from({ length: n }, rnd).join("");
    const cells = [];
    text.split(" ").forEach((word, wi) => {
      if (wi) label.appendChild(document.createTextNode(" "));
      const c = document.createElement("span");
      c.className = "ch";
      const reel = document.createElement("span");
      reel.className = "reel";
      const r0 = document.createElement("span");
      const r1 = document.createElement("span");
      r0.textContent = randWord(word.length);
      r1.textContent = word;
      reel.append(r0, r1);
      c.appendChild(reel);
      label.appendChild(c);
      cells.push({ c, reel, r0, r1, word, len: word.length, y: 0, remaining: 0, done: true });
    });
    const CYCLE = 55, SPIN_BASE = 460, STAGGER = 240, HOLD = 1400;
    let active = false;
    let gen = 0;
    let raf = 0;
    let holdT = 0;
    let H = 0;
    let sized = false;
    const setY = (o) => {
      o.reel.style.transform = `translateY(${(o.y - H).toFixed(2)}px)`;
    };
    function measure() {
      if (!sized) {
        sized = true;
        cells.forEach((o) => {
          o.c.style.width = o.c.getBoundingClientRect().width.toFixed(1) + "px";
        });
      }
      H = cells[0].c.getBoundingClientRect().height;
    }
    function spin() {
      const my = ++gen;
      active = true;
      measure();
      const speed = H / CYCLE;
      label.classList.remove("finish");
      cells.forEach((o, i) => {
        o.done = false;
        o.landing = false;
        o.y = 0;
        o.remaining = SPIN_BASE + i * STAGGER;
        o.r0.textContent = randWord(o.len);
        o.r1.textContent = randWord(o.len);
        setY(o);
        o.c.classList.add("spinning");
        o.c.classList.remove("pulse");
      });
      let last = null;
      function frame(t) {
        if (!active || my !== gen) return;
        if (last == null) last = t;
        const dt = Math.min(50, t - last);
        last = t;
        let allDone = true;
        for (const o of cells) {
          if (o.done) continue;
          allDone = false;
          o.remaining -= dt;
          o.y += speed * dt;
          // SITE PATCH: the word used to SNAP in from mid-scroll (the end jitter). Now, once time is up,
          // the real word is fed in as the next row, scrolls fully into the window, then settles with a bounce.
          while (o.y >= H && !o.done) {
            o.y -= H;
            o.r1.textContent = o.r0.textContent;
            if (o.landing) {
              o.done = true;
              o.y = 0;
              o.r1.textContent = o.word;
              setY(o);
              o.reel.animate([
                { transform: `translateY(${(-H + 5).toFixed(2)}px)` },
                { transform: `translateY(${(-H - 1.5).toFixed(2)}px)`, offset: 0.6 },
                { transform: `translateY(${(-H).toFixed(2)}px)` }
              ], { duration: 220, easing: "ease-out" });
              o.c.classList.remove("spinning");
              o.c.classList.remove("pulse");
              void o.c.offsetWidth;
              o.c.classList.add("pulse");
            } else if (o.remaining <= 0) {
              o.r0.textContent = o.word;
              o.landing = true;
            } else o.r0.textContent = randWord(o.len);
          }
          if (!o.done) setY(o);
        }
        if (allDone) {
          label.classList.remove("finish");
          void label.offsetWidth;
          label.classList.add("finish");
          holdT = window.setTimeout(() => {
            if (active && my === gen) spin();
          }, HOLD);
          return;
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
    }
    function reset() {
      active = false;
      gen++;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (holdT) {
        clearTimeout(holdT);
        holdT = 0;
      }
      label.classList.remove("finish");
      cells.forEach((o) => {
        o.done = true;
        o.r1.textContent = o.word;
        o.reel.style.transform = "";
        o.c.classList.remove("spinning", "pulse");
      });
    }
    const onEnter = () => {
      if (!active) spin();
    };
    const onLeave = () => reset();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      reset();
    };
  }
  function buildSpawnLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-spawn";
    el.textContent = title;
    return el;
  }
  function mountSpawn(label) {
    const text = label.textContent ?? "";
    label.textContent = "";
    const cells = [];
    for (const ch of text) {
      if (ch === " ") {
        label.appendChild(document.createTextNode(" "));
        continue;
      }
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = ch;
      label.appendChild(s);
      cells.push({ el: s, qx: -70, dy: 42 });
    }
    const STEP = 0.45, DUR = 0.55, HOLD_ALL = 0.03, ENTER = 0.55, QUEUE_WAIT = 0.03;
    const ENTER_SPREAD = 0.5, PULSE_STEP = 0.05, PULSE_DUR = 0.2;
    const LEFT_MARGIN = 70, SURF_INSET = 13;
    let active = false;
    let gen = 0;
    let timers = [];
    let anims = [];
    let measured = false;
    const wait = (ms) => new Promise((r) => {
      timers.push(window.setTimeout(r, ms));
    });
    function measure() {
      if (measured) return;
      measured = true;
      const media = mediaOf(label);
      const surf = (media ? media.getBoundingClientRect().top : 0) + SURF_INSET;
      const stageX = cells[0].el.getBoundingClientRect().left - LEFT_MARGIN;
      cells.forEach((o, k) => {
        const r = o.el.getBoundingClientRect();
        o.qx = -(r.left - stageX) + k * 3;
        o.dy = Math.max(0, surf - r.bottom);
      });
    }
    const T = (x, y, s) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s})`;
    const deployKF = (o) => {
      const q = o.qx, d = o.dy;
      return [
        { offset: 0, opacity: 0.5, transform: T(q, d, 0.9) },
        { offset: 0.04, opacity: 1 },
        { offset: 0.1, transform: T(q * 0.8, d - 7, 0.9) },
        { offset: 0.2, transform: T(q * 0.62, d, 0.9) },
        { offset: 0.3, transform: T(q * 0.44, d - 7, 0.9) },
        { offset: 0.4, transform: T(q * 0.26, d, 0.9) },
        { offset: 0.5, transform: T(q * 0.1, d - 7, 0.9) },
        { offset: 0.58, transform: T(0, d, 0.9) },
        { offset: 0.62, transform: T(0, d + 3, 0.92) },
        { offset: 0.76, transform: T(0, -9, 1.07) },
        { offset: 0.84, transform: T(0, 0, 1.16), textShadow: "0 0 13px rgba(255,235,170,.9)" },
        { offset: 0.9, transform: T(0, 0, 1), textShadow: "none" },
        { offset: 1, transform: T(0, 0, 1) }
      ];
    };
    const enterKF = (o) => [
      // whole group jumps in an arc from home to the queue spot
      { offset: 0, opacity: 1, transform: T(0, 0, 1) },
      { offset: 0.45, transform: T(o.qx * 0.5, -22, 1) },
      { offset: 0.82, transform: T(o.qx, o.dy + 4, 0.88) },
      { offset: 1, opacity: 0.55, transform: T(o.qx, o.dy, 0.9) }
    ];
    const pulseKF = [
      // grow & shrink in place (completion wave)
      { offset: 0, transform: T(0, 0, 1) },
      { offset: 0.5, transform: T(0, 0, 1.5), textShadow: "0 0 14px rgba(255,235,170,.85)" },
      { offset: 1, transform: T(0, 0, 1), textShadow: "none" }
    ];
    const clearAnims = () => {
      anims.forEach((a) => {
        try {
          a.cancel();
        } catch {
        }
      });
      anims = [];
    };
    async function run() {
      const my = ++gen;
      active = true;
      measure();
      const alive = () => active && my === gen;
      while (alive()) {
        clearAnims();
        cells.forEach((o) => anims.push(o.el.animate(enterKF(o), { duration: ENTER * 1e3, delay: Math.random() * ENTER_SPREAD * 1e3, easing: "ease-in-out", fill: "both" })));
        await wait((ENTER_SPREAD + ENTER + QUEUE_WAIT) * 1e3);
        if (!alive()) return;
        clearAnims();
        cells.forEach((o, k) => anims.push(o.el.animate(deployKF(o), { duration: DUR * 1e3, delay: k * STEP * 1e3, easing: "linear", fill: "both" })));
        await wait(((cells.length - 1) * STEP + DUR + HOLD_ALL) * 1e3);
        if (!alive()) return;
        clearAnims();
        cells.forEach((o, k) => anims.push(o.el.animate(pulseKF, { duration: PULSE_DUR * 1e3, delay: k * PULSE_STEP * 1e3, easing: "ease-in-out", fill: "both" })));
        await wait(((cells.length - 1) * PULSE_STEP + PULSE_DUR + 0.2) * 1e3);
        if (!alive()) return;
      }
    }
    function reset() {
      active = false;
      gen++;
      clearAnims();
      timers.forEach(clearTimeout);
      timers = [];
      cells.forEach((o) => {
        o.el.style.transform = "";
        o.el.style.opacity = "";
      });
    }
    const onEnter = () => {
      if (!active) void run();
    };
    const onLeave = () => reset();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      reset();
    };
  }
  function buildMoneyflashLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-moneyflash";
    let ci = 0;
    for (const ch of title) {
      if (ch === " ") {
        el.appendChild(document.createTextNode(" "));
        continue;
      }
      const s = document.createElement("span");
      s.className = "ch " + (ci % 2 ? "y" : "g");
      s.textContent = ch;
      el.appendChild(s);
      ci++;
    }
    return el;
  }
  function mountMoneyflash(label) {
    const rand = (a, b) => a + Math.random() * (b - a);
    const SPAWN = 55, ARC = 80, ARC_VAR = 38, SPREAD = 170, DUR = 820;
    const TOGGLE = 240;
    let active = false;
    let spawnT = 0;
    let swapT = 0;
    const parts = /* @__PURE__ */ new Set();
    function spawn() {
      if (!active) return;
      const r = label.getBoundingClientRect();
      const coin = Math.random() > 0.42;
      const el = document.createElement("img");
      el.className = "mf-particle";
      el.src = coin ? "/ui/coin.png" : "/ui/dollar.png";
      el.style.width = (coin ? rand(13, 20) : rand(17, 25)).toFixed(0) + "px";
      const x0 = rand(r.left + r.width * 0.4, r.left + r.width * 0.6);
      const y0 = r.top + r.height * 0.5;
      const sx = (Math.random() - 0.5) * SPREAD;
      const arc = ARC + Math.random() * ARC_VAR;
      const life = DUR + Math.random() * 250;
      const spin = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
      document.body.appendChild(el);
      parts.add(el);
      const a = el.animate([
        { offset: 0, transform: `translate(${x0.toFixed(0)}px,${y0.toFixed(0)}px) scale(.06) rotate(0deg)`, opacity: 1, easing: "cubic-bezier(.15,.6,.3,1)" },
        { offset: 0.45, transform: `translate(${(x0 + sx * 0.5).toFixed(0)}px,${(y0 - arc).toFixed(0)}px) scale(1) rotate(${(spin * 0.45).toFixed(0)}deg)`, opacity: 1, easing: "cubic-bezier(.5,0,.85,.5)" },
        { offset: 1, transform: `translate(${(x0 + sx).toFixed(0)}px,${(y0 + 95).toFixed(0)}px) scale(1) rotate(${spin.toFixed(0)}deg)`, opacity: 0 }
      ], { duration: life, fill: "forwards" });
      a.onfinish = () => {
        el.remove();
        parts.delete(el);
      };
    }
    function start() {
      if (active) return;
      active = true;
      label.classList.add("shaking");
      spawnT = window.setInterval(spawn, SPAWN);
      swapT = window.setInterval(() => label.classList.toggle("swap"), TOGGLE);
    }
    function stop() {
      active = false;
      label.classList.remove("shaking", "swap");
      if (spawnT) {
        clearInterval(spawnT);
        spawnT = 0;
      }
      if (swapT) {
        clearInterval(swapT);
        swapT = 0;
      }
      parts.forEach((el) => el.remove());
      parts.clear();
    }
    label.addEventListener("mouseenter", start);
    label.addEventListener("mouseleave", stop);
    return () => {
      label.removeEventListener("mouseenter", start);
      label.removeEventListener("mouseleave", stop);
      stop();
    };
  }
  function buildDrilldashLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel drilltitle";
    el.innerHTML = `
    <div class="drillrig"><div class="drillshaker">
      <span class="drill"><img class="drill-strip" src="/ui/drill_sheet.png" alt=""></span>
      <span class="dtext"></span>
    </div></div>
  `;
    el.querySelector(".dtext").textContent = title;
    return el;
  }
  function mountDrilldash(label) {
    const dt = label;
    const rig = dt.querySelector(".drillrig");
    const drill = dt.querySelector(".drill");
    const IMPACT = 1050, HOLD_END = 3150, DUST_EVERY = 170;
    let timers = [];
    let intervals = [];
    function spawnDust() {
      const r = drill.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.bottom - 2;
      for (let k = 0; k < 5; k++) {
        const p = document.createElement("i");
        p.className = "drill-particle";
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.95);
        const dist = 14 + Math.random() * 28;
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist + (12 + Math.random() * 22);
        const sz = 3 + Math.random() * 5;
        p.style.left = cx + "px";
        p.style.top = cy + "px";
        p.style.width = sz.toFixed(1) + "px";
        p.style.height = sz.toFixed(1) + "px";
        p.style.setProperty("--dx", dx.toFixed(0) + "px");
        p.style.setProperty("--dy", dy.toFixed(0) + "px");
        p.style.setProperty("--life", (460 + Math.random() * 380).toFixed(0) + "ms");
        document.body.appendChild(p);
        p.addEventListener("animationend", () => p.remove());
      }
    }
    function scheduleDrilling() {
      timers.push(window.setTimeout(() => {
        dt.classList.add("drilling");
        spawnDust();
        const iv = window.setInterval(spawnDust, DUST_EVERY);
        intervals.push(iv);
        timers.push(window.setTimeout(() => {
          clearInterval(iv);
          dt.classList.remove("drilling");
        }, HOLD_END - IMPACT));
      }, IMPACT));
    }
    function clearDust() {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      timers = [];
      intervals = [];
      dt.classList.remove("drilling");
    }
    const onAnimEvent = (e) => {
      if (e.animationName === "drillplunge") scheduleDrilling();
    };
    rig.addEventListener("animationstart", onAnimEvent);
    rig.addEventListener("animationiteration", onAnimEvent);
    const onEnter = () => {
      const vid = mediaOf(rig)?.querySelector("video");
      if (vid) {
        const tip = drill.getBoundingClientRect().bottom;
        const surf = vid.getBoundingClientRect().top;
        rig.style.setProperty("--plunge", Math.max(0, surf - tip).toFixed(0) + "px");
      }
      dt.classList.add("playing");
    };
    const onLeave = () => {
      const cs = getComputedStyle(rig);
      const cd = getComputedStyle(drill);
      rig.style.transform = cs.transform;
      drill.style.setProperty("-webkit-mask-size", cd.maskSize);
      drill.style.setProperty("mask-size", cd.maskSize);
      dt.classList.remove("playing");
      clearDust();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        rig.style.transform = "";
        drill.style.removeProperty("-webkit-mask-size");
        drill.style.removeProperty("mask-size");
      }));
    };
    dt.addEventListener("mouseenter", onEnter);
    dt.addEventListener("mouseleave", onLeave);
    return () => {
      rig.removeEventListener("animationstart", onAnimEvent);
      rig.removeEventListener("animationiteration", onAnimEvent);
      dt.removeEventListener("mouseenter", onEnter);
      dt.removeEventListener("mouseleave", onLeave);
      clearDust();
      dt.classList.remove("playing");
    };
  }
  function buildCameraLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel camtitle";
    const frame = document.createElement("span");
    frame.className = "camframe";
    for (const pos of ["tl", "tr", "bl", "br"]) {
      const vf = document.createElement("span");
      vf.className = `vf ${pos}`;
      frame.appendChild(vf);
    }
    const text = document.createElement("span");
    text.className = "camtext";
    text.textContent = title;
    frame.appendChild(text);
    el.appendChild(frame);
    return el;
  }
  function mountCamera(label) {
    const onEnter = () => label.classList.add("playing");
    const onLeave = () => label.classList.remove("playing");
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      label.classList.remove("playing");
    };
  }
  function buildRagdollLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-ragdoll";
    el.textContent = title;
    return el;
  }
  function mountRagdoll(label) {
    const text = label.textContent ?? "";
    label.textContent = "";
    splitCharsInto(label, text);
    const chars = Array.from(label.querySelectorAll(".ch"));
    const n = chars.length;
    const rand = (a, b) => a + Math.random() * (b - a);
    chars.forEach((c, idx) => {
      const spread = (idx - (n - 1) / 2) / Math.max(1, n);
      const bx = spread * 120 + rand(-14, 14);
      const sign = bx >= 0 ? 1 : -1;
      c.style.setProperty("--bx", bx.toFixed(0) + "px");
      c.style.setProperty("--by", (-rand(16, 34)).toFixed(0) + "px");
      c.style.setProperty("--rr", (sign * rand(400, 720)).toFixed(0) + "deg");
      c.style.setProperty("--roll", (sign * rand(8, 15)).toFixed(0) + "px");
      c.style.setProperty("--rr2", (sign * rand(30, 55)).toFixed(0) + "deg");
      const b1 = rand(20, 36);
      c.style.setProperty("--b1", b1.toFixed(0) + "px");
      c.style.setProperty("--b2", (b1 * rand(0.3, 0.45)).toFixed(0) + "px");
      c.style.animationDelay = rand(0, 320).toFixed(0) + "ms";
    });
    const LAND_DROP = 13;
    function measure() {
      const media = mediaOf(label);
      if (!media) return;
      const mr = media.getBoundingClientRect();
      const surf = mr.top + LAND_DROP;
      // SITE PATCH: the site's title is centred over BOTH columns, so some letters landed beside
      // the video. Shift the whole pile sideways (spread kept) until every letter lands on the video.
      const MARGIN = 14;
      const land = chars.map((c) => {
        if (c.dataset.bx0 == null) c.dataset.bx0 = parseFloat(c.style.getPropertyValue("--bx")) || 0;
        const r = c.getBoundingClientRect();
        const x = r.left + r.width / 2 + +c.dataset.bx0;
        return { c, x, b: r.bottom };
      });
      const lo = Math.min(...land.map((o) => o.x)), hi = Math.max(...land.map((o) => o.x));
      let shift = 0;
      if (lo < mr.left + MARGIN) shift = mr.left + MARGIN - lo;
      if (hi + shift > mr.right - MARGIN) shift = mr.right - MARGIN - hi;
      land.forEach((o) => {
        o.c.style.setProperty("--bx", (+o.c.dataset.bx0 + shift).toFixed(0) + "px");
        o.c.style.setProperty("--land", Math.max(0, surf - o.b).toFixed(0) + "px");
      });
    }
    const onEnter = () => {
      measure();
      label.classList.add("playing");
    };
    const onLeave = () => label.classList.remove("playing");
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      label.classList.remove("playing");
    };
  }
  function buildTurretLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-turret";
    el.textContent = title;
    return el;
  }
  function mountTurret(label) {
    const text = label.textContent ?? "";
    label.textContent = "";
    splitCharsInto(label, text);
    const gun = document.createElement("span");
    gun.className = "turgun";
    const img = document.createElement("img");
    img.className = "turgun-strip";
    img.src = "/ui/turret_sheet.png";
    gun.appendChild(img);
    label.appendChild(gun);
    const chars = Array.from(label.querySelectorAll(".ch"));
    const rand = (a, b) => a + Math.random() * (b - a);
    const SHOT = 130;
    img.style.animationDuration = SHOT + "ms";
    let active = false;
    let gen = 0;
    let timers = [];
    const wait = (ms) => new Promise((r) => {
      timers.push(window.setTimeout(r, ms));
    });
    function anchor() {
      const lb = label.getBoundingClientRect();
      const last = chars[chars.length - 1].getBoundingClientRect();
      gun.style.left = last.right - lb.left + 24 + "px";
    }
    const TRAVEL = 190;
    function flash() {
      const r = gun.getBoundingClientRect();
      const f = document.createElement("i");
      f.className = "tur-flash";
      f.style.left = r.left + 4 + "px";
      f.style.top = r.top + r.height * 0.5 + "px";
      document.body.appendChild(f);
      f.addEventListener("animationend", () => f.remove());
    }
    function impactBurst(c) {
      const r = c.getBoundingClientRect();
      const x = r.right, y = r.top + r.height * 0.5;
      const n = 3 + Math.floor(rand(0, 3));
      for (let k = 0; k < n; k++) {
        const p = document.createElement("i");
        p.className = "tur-particle";
        const ang = Math.PI + rand(-1, 1) * (Math.PI * 0.55);
        const dist = 10 + rand(0, 20);
        const sz = 2 + rand(0, 4);
        p.style.left = x + "px";
        p.style.top = y + "px";
        p.style.width = sz.toFixed(1) + "px";
        p.style.height = sz.toFixed(1) + "px";
        p.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(0) + "px");
        p.style.setProperty("--dy", (Math.sin(ang) * dist + rand(6, 18)).toFixed(0) + "px");
        p.style.setProperty("--life", (400 + rand(0, 300)).toFixed(0) + "ms");
        document.body.appendChild(p);
        p.addEventListener("animationend", () => p.remove());
      }
    }
    function hurt(c) {
      if (!active) return;
      impactBurst(c);
      c.classList.add("hit");
      const t = window.setTimeout(() => {
        if (!active) return;
        c.classList.remove("hit");
        c.style.setProperty("--dx", rand(-8, 8).toFixed(0) + "px");
        c.style.setProperty("--dy", rand(34, 58).toFixed(0) + "px");
        c.style.setProperty("--dr", rand(-42, 42).toFixed(0) + "deg");
        c.classList.add("dead");
      }, 340);
      timers.push(t);
    }
    function bulletTo(c) {
      const g = gun.getBoundingClientRect();
      const nx = g.left + 4, ny = g.top + g.height * 0.5;
      const r = c.getBoundingClientRect();
      const dx = r.right - nx;
      const dy = r.top + r.height * 0.5 - ny;
      const b = document.createElement("i");
      b.className = "tur-bullet";
      b.style.left = nx + "px";
      b.style.top = ny + "px";
      document.body.appendChild(b);
      b.animate([
        { transform: "translate(0,0) translateY(-50%) scaleX(.7)", opacity: 0.9 },
        { transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) translateY(-50%) scaleX(1.25)`, opacity: 1 }
      ], { duration: TRAVEL, easing: "linear", fill: "forwards" }).onfinish = () => b.remove();
      const t = window.setTimeout(() => hurt(c), TRAVEL);
      timers.push(t);
    }
    async function cycle() {
      const my = ++gen;
      active = true;
      const alive = () => active && my === gen;
      while (alive()) {
        chars.forEach((c) => c.classList.remove("hit", "dead"));
        anchor();
        gun.classList.add("in");
        await wait(300);
        if (!alive()) return;
        gun.classList.add("play");
        for (let k = chars.length - 1; k >= 0; k--) {
          if (!alive()) return;
          flash();
          bulletTo(chars[k]);
          await wait(SHOT);
        }
        gun.classList.remove("play");
        await wait(TRAVEL + 800);
        if (!alive()) return;
        gun.classList.remove("in");
        await wait(700);
      }
    }
    function reset() {
      active = false;
      gen++;
      timers.forEach(clearTimeout);
      timers = [];
      gun.classList.remove("in", "play");
      chars.forEach((c) => c.classList.remove("hit", "dead"));
      document.querySelectorAll(".tur-flash,.tur-bullet,.tur-particle").forEach((e) => e.remove());
    }
    const onEnter = () => {
      if (!active) void cycle();
    };
    const onLeave = () => reset();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      reset();
    };
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function buildBinIcon() {
    // SITE PATCH: the drawn bin is replaced by a picture (Microsoft Fluent Emoji "Wastebasket", MIT,
    // images/bin/). It has no lid, so the empty .op-bin-lid <g> is kept only as the "open" signal;
    // modal-v2.css turns that into a bounce of the whole bin.
    const svg = svgEl("svg", { class: "op-bin-svg", viewBox: "0 0 32 32" });
    svg.append(
      svgEl("image", { href: "images/bin/wastebasket_3d_compressed.png", x: "0", y: "0", width: "32", height: "32", preserveAspectRatio: "xMidYMid meet" }),
      svgEl("g", { class: "op-bin-lid" })
    );
    return svg;
  }
  function buildObjectpoolLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-objectpool";
    const wrap = document.createElement("span");
    wrap.className = "op-wrap";
    const text = document.createElement("span");
    text.className = "op-text";
    splitCharsInto(text, title);
    wrap.append(text, buildBinIcon());
    el.append(wrap);
    return el;
  }
  function mountObjectpool(label) {
    const chars = Array.from(label.querySelectorAll(".op-text .ch"));
    const bin = label.querySelector(".op-bin-svg");
    const lid = label.querySelector(".op-bin-lid");
    const cells = chars.map((el) => ({ el, dx: 0, dy: 0, orbitAngle: Math.random() * Math.PI * 2, anims: [], gen: 0 }));
    const cellFor = (el) => cells.find((c) => c.el === el);
    const POOL_SIZE = Math.max(1, Math.min(2, Math.floor(chars.length / 6)));
    const SWAP_EVERY = 500;
    const FLY_IN = 170, FLY_OUT = 190, ORBIT_LAP = 700, ORBIT_R = 4, LID_OPEN_MS = 220;
    const BODY_CENTER_Y_RATIO = 0.667;
    let active = false;
    let swapTimer = 0;
    let lidTimer = 0;
    let measured = false;
    const pooled = /* @__PURE__ */ new Set();
    const T = (x, y, s) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s})`;
    const arcMid = (dx, dy) => ({ x: dx * 0.5, y: Math.min(dy, 0) * 0.5 - 20 });
    function measure() {
      if (measured) return;
      measured = true;
      const br = bin.getBoundingClientRect();
      const bcx = br.left + br.width / 2, bcy = br.top + br.height * BODY_CENTER_Y_RATIO;
      cells.forEach((c) => {
        const r = c.el.getBoundingClientRect();
        c.dx = bcx - (r.left + r.width / 2);
        c.dy = bcy - (r.top + r.height / 2);
      });
    }
    function openLid() {
      lid.classList.add("open");
      clearTimeout(lidTimer);
      lidTimer = window.setTimeout(() => lid.classList.remove("open"), LID_OPEN_MS);
    }
    function clearCellAnims(c) {
      c.anims.forEach((a) => {
        try {
          a.cancel();
        } catch {
        }
      });
      c.anims = [];
    }
    function startOrbit(c) {
      const kf = [];
      const STEPS = 8;
      for (let i = 0; i <= STEPS; i++) {
        const a = i / STEPS * Math.PI * 2 + c.orbitAngle;
        kf.push({ transform: T(c.dx + Math.cos(a) * ORBIT_R, c.dy + Math.sin(a) * ORBIT_R, 0.45) });
      }
      c.anims.push(c.el.animate(kf, { duration: ORBIT_LAP, easing: "linear", iterations: Infinity }));
    }
    function flyIn(c) {
      const my = ++c.gen;
      clearCellAnims(c);
      c.el.classList.add("pooled");
      openLid();
      const mid = arcMid(c.dx, c.dy);
      // SITE PATCH: letters vanish INTO the bin (no orbiting inside it — the picture bin shows them)
      const kf = [
        { offset: 0, transform: T(0, 0, 1), opacity: 1 },
        { offset: 0.5, transform: T(mid.x, mid.y, 0.75), opacity: 1 },
        { offset: 0.8, opacity: 1 },
        { offset: 1, transform: T(c.dx, c.dy, 0.45), opacity: 0 }
      ];
      const a = c.el.animate(kf, { duration: FLY_IN, easing: "ease-in", fill: "forwards" });
      c.anims.push(a);
    }
    function flyOut(c) {
      const my = ++c.gen;
      clearCellAnims(c);
      c.el.classList.remove("pooled");
      openLid();
      const mid = arcMid(c.dx, c.dy);
      const kf = [
        { offset: 0, transform: T(c.dx, c.dy, 0.45), opacity: 0 },
        { offset: 0.2, opacity: 1 },
        { offset: 0.5, transform: T(mid.x, mid.y, 0.85), opacity: 1 },
        { offset: 1, transform: T(0, 0, 1), opacity: 1 }
      ];
      const a = c.el.animate(kf, { duration: FLY_OUT, easing: "ease-out", fill: "forwards" });
      c.anims.push(a);
      a.onfinish = () => {
        if (my === c.gen) {
          c.el.style.transform = "";
          clearCellAnims(c);
        }
      };
    }
    function pulse() {
      bin.classList.remove("pulse");
      void bin.offsetWidth;
      bin.classList.add("pulse");
    }
    function tick() {
      measure();
      const notPooled = chars.filter((c) => !pooled.has(c));
      if (pooled.size < POOL_SIZE && notPooled.length > POOL_SIZE) {
        const retire = notPooled[Math.floor(Math.random() * notPooled.length)];
        pooled.add(retire);
        flyIn(cellFor(retire));
      } else if (pooled.size) {
        const pooledArr = Array.from(pooled);
        const revive = pooledArr[Math.floor(Math.random() * pooledArr.length)];
        pooled.delete(revive);
        flyOut(cellFor(revive));
        const candidates = chars.filter((c) => !pooled.has(c) && c !== revive);
        if (candidates.length) {
          const retire = candidates[Math.floor(Math.random() * candidates.length)];
          pooled.add(retire);
          flyIn(cellFor(retire));
        }
      }
      pulse();
    }
    function start() {
      active = true;
      label.classList.add("playing");
      tick();
      swapTimer = window.setInterval(tick, SWAP_EVERY);
    }
    function stop() {
      active = false;
      label.classList.remove("playing");
      if (swapTimer) {
        clearInterval(swapTimer);
        swapTimer = 0;
      }
      if (lidTimer) {
        clearTimeout(lidTimer);
        lidTimer = 0;
      }
      measured = false;
      pooled.clear();
      cells.forEach((c) => {
        c.gen++;
        clearCellAnims(c);
        c.el.classList.remove("pooled");
        c.el.style.transform = "";
      });
      bin.classList.remove("pulse");
      lid.classList.remove("open");
    }
    const onEnter = () => {
      if (!active) start();
    };
    const onLeave = () => stop();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      stop();
    };
  }
  // SITE PATCH (2026-11-08): the VFX title is REPLACED on the site (his pick from vfx-title-lab.html, "D"):
  // lightning flicker + strike, then two fireballs (left + right) collide on the word: flash, sparks, pop, smoke.
  // Particles are fixed-position on <body> with class .vfx2 (z-index above the pop-up, in modal-v2.css).
  // The game's original ring version (mountVfxOld below) is kept unused.
  function buildVfxLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-vfx";
    const wrap = document.createElement("span");
    wrap.className = "vfx-wrap";
    const text = document.createElement("span");
    text.className = "vfx-text";
    splitCharsInto(text, title);
    wrap.append(text);
    el.append(wrap);
    return el;
  }
  function mountVfx(label) {
    const wrap = label.querySelector(".vfx-wrap");
    const chars = Array.from(label.querySelectorAll(".vfx-text .ch"));
    const rand = (a, b) => a + Math.random() * (b - a);
    let gen = 0;
    let timers = [];
    const sleep = (ms) => new Promise((r) => { timers.push(window.setTimeout(r, ms)); });
    const at = (x, y) => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
    function fx(tag, css, kf, opt) {
      const e = document.createElement(tag);
      e.className = "vfx2";
      Object.assign(e.style, css);
      document.body.appendChild(e);
      e.animate(kf, opt).onfinish = () => e.remove();
      return e;
    }
    function sparks(x, y, n, colors, dist = [30, 80], size = [3, 6]) {
      for (let i = 0; i < n; i++) {
        const ang = rand(0, Math.PI * 2), d = rand(...dist), s = rand(...size), c = colors[i % colors.length];
        fx("i", { width: s + "px", height: s + "px", borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` },
          [{ transform: at(x, y) + " scale(1)", opacity: 1 }, { transform: at(x + Math.cos(ang) * d, y + Math.sin(ang) * d + rand(10, 30)) + " scale(.2)", opacity: 0 }],
          { duration: rand(450, 800), easing: "cubic-bezier(.15,.7,.3,1)" });
      }
    }
    function smoke(x, y, n, spread = 40) {
      for (let i = 0; i < n; i++) {
        const s = rand(18, 34), x0 = x + rand(-spread, spread);
        fx("i", { width: s + "px", height: s + "px", background: "url(/ui/vfx_smoke.png) center/contain no-repeat" },
          [{ transform: at(x0, y) + " scale(.4)", opacity: 0 }, { opacity: 0.75, offset: 0.25 }, { transform: at(x0 + rand(-15, 15), y - rand(30, 55)) + " scale(1.6)", opacity: 0 }],
          { duration: rand(900, 1400), delay: rand(0, 250), easing: "ease-out", fill: "backwards" }); // backwards = hidden in place during the delay (else it shows at top-left)
      }
    }
    function flash(x, y, size, color) {
      fx("i", { width: size + "px", height: size + "px", borderRadius: "50%", background: `radial-gradient(circle, #fff 0%, ${color} 35%, transparent 70%)` },
        [{ transform: at(x, y) + " scale(.2)", opacity: 1 }, { transform: at(x, y) + " scale(1.3)", opacity: 0 }], { duration: 380, easing: "ease-out" });
    }
    function shake(el, px, ms) {
      el.animate(Array.from({ length: 8 }, (_, i) => ({ transform: i === 7 ? "none" : `translate(${rand(-px, px)}px,${rand(-px, px)}px)` })), { duration: ms });
    }
    async function bolt(alive) {
      const r = wrap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 3; i++) {
        chars.forEach((c) => c.style.color = "#8fe3ff"); await sleep(70);
        chars.forEach((c) => c.style.color = ""); await sleep(110);
        if (!alive()) return;
      }
      const top = r.top - 70, pts = [[cx + rand(-10, 10), top]];
      for (let i = 1; i <= 6; i++) pts.push([cx + rand(-14, 14), top + (cy - top) * i / 6]);
      const svg = svgEl("svg", { width: String(innerWidth), height: String(innerHeight), class: "vfx2" });
      svg.appendChild(svgEl("polyline", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#e8fbff", "stroke-width": "3", "stroke-linejoin": "bevel",
        style: "filter: drop-shadow(0 0 4px #5fd0ff) drop-shadow(0 0 10px #2a9cff)" }));
      document.body.appendChild(svg);
      svg.animate([{ opacity: 1 }, { opacity: 0.3, offset: 0.3 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], { duration: 260 }).onfinish = () => svg.remove();
      flash(cx, cy, 140, "rgba(120,210,255,.8)");
      sparks(cx, cy, 18, ["#e8fbff", "#7fd8ff", "#3aa8ff"], [25, 70], [2, 4]);
      chars.forEach((c) => c.animate(Array.from({ length: 9 }, (_, i) => ({ transform: i === 8 ? "none" : `translate(${rand(-2.5, 2.5)}px,${rand(-2.5, 2.5)}px)`,
        color: i % 2 ? "#bff0ff" : "#fff", textShadow: i === 8 ? "none" : "0 0 12px #5fd0ff" })), { duration: 700 }));
      shake(wrap, 3, 260);
      smoke(cx, cy, 5, 20);
      await sleep(650);
    }
    async function fireballs(alive) {
      const r = wrap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const ballCss = { width: "22px", height: "22px", borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #fff 0%, #ffe07a 30%, #ff8a2a 60%, rgba(255,60,0,0) 75%)", filter: "drop-shadow(0 0 8px #ff7a20)" };
      const balls = [r.left - 160, r.right + 160].map((sx) => fx("i", ballCss, [{ transform: at(sx, cy - 30) }, { transform: at(cx, cy) }], { duration: 420, easing: "cubic-bezier(.5,0,1,1)" }));
      for (let i = 0; i < 10; i++) {
        await sleep(40);
        if (!alive()) return;
        balls.forEach((b) => { const p = b.getBoundingClientRect(); sparks(p.left + 11, p.top + 11, 2, ["#ffb347", "#ff6a1a"], [4, 14], [3, 6]); });
      }
      flash(cx, cy, 190, "rgba(255,150,40,.85)");
      sparks(cx, cy, 30, ["#ffd27a", "#ff8a2a", "#ff5a1a"], [30, 100]);
      chars.forEach((c) => c.animate([{ transform: "scale(1)" }, { transform: "scale(1.4) translateY(-6px)", color: "#ffe9a8", offset: 0.15 }, { transform: "scale(.92)", offset: 0.45 }, { transform: "none", color: "#fff" }], { duration: 650, easing: "ease-out" }));
      chars.forEach((c) => c.animate([{ color: "#ffcf6a" }, { color: "#ff7a3a", offset: 0.3 }, { color: "#fff" }], { duration: 900 }));
      shake(wrap, 4, 340);
      smoke(cx, cy, 10);
      await sleep(1500);
    }
    async function cycle() {
      const my = ++gen, alive = () => my === gen;
      while (alive()) {
        await bolt(alive);
        if (!alive()) return;
        await fireballs(alive);
      }
    }
    function reset() {
      gen++;
      timers.forEach(clearTimeout);
      timers = [];
      chars.forEach((c) => c.style.color = "");
    }
    const onEnter = () => void cycle();
    const onLeave = () => reset();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      reset();
      document.querySelectorAll(".vfx2").forEach((e) => e.remove());
    };
  }
  function mountVfxOld(label) {
    const telegraph = label.querySelector(".vfx-telegraph");
    const shock = label.querySelector(".vfx-shock");
    const chars = Array.from(label.querySelectorAll(".vfx-text .ch"));
    const rand = (a, b) => a + Math.random() * (b - a);
    const TELEGRAPH_MS = 700, SETTLE_MS = 900, SMOKE_EVERY = 60, SMOKE_PER_TICK = 3;
    let active = false;
    let gen = 0;
    let timers = [];
    let smokeTimer = 0;
    const wait = (ms) => new Promise((r) => {
      timers.push(window.setTimeout(r, ms));
    });
    function spawnSmoke() {
      if (!active) return;
      const media = mediaOf(label);
      const r = media ? media.getBoundingClientRect() : label.getBoundingClientRect();
      const p = document.createElement("i");
      p.className = "vfx-smoke";
      const size = rand(10, 24);
      p.style.width = size.toFixed(0) + "px";
      p.style.height = size.toFixed(0) + "px";
      p.style.left = rand(r.left, r.right).toFixed(0) + "px";
      p.style.top = (r.top + rand(-4, 10)).toFixed(0) + "px";
      p.style.setProperty("--dx", rand(-16, 16).toFixed(0) + "px");
      p.style.setProperty("--life", rand(800, 1400).toFixed(0) + "ms");
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
    function impact() {
      chars.forEach((c) => {
        c.style.setProperty("--kx", rand(-4, 4).toFixed(1) + "px");
        c.style.setProperty("--ky", rand(-4, 0).toFixed(1) + "px");
        c.classList.remove("impact");
        void c.offsetWidth;
        c.classList.add("impact");
      });
      shock.classList.remove("go");
      void shock.offsetWidth;
      shock.classList.add("go");
    }
    async function cycle() {
      const my = ++gen;
      active = true;
      const alive = () => active && my === gen;
      while (alive()) {
        telegraph.classList.add("go");
        await wait(TELEGRAPH_MS);
        if (!alive()) return;
        telegraph.classList.remove("go");
        impact();
        smokeTimer = window.setInterval(() => {
          for (let k = 0; k < SMOKE_PER_TICK; k++) spawnSmoke();
        }, SMOKE_EVERY);
        await wait(SETTLE_MS);
        if (!alive()) return;
        clearInterval(smokeTimer);
        smokeTimer = 0;
      }
    }
    function reset() {
      active = false;
      gen++;
      timers.forEach(clearTimeout);
      timers = [];
      if (smokeTimer) {
        clearInterval(smokeTimer);
        smokeTimer = 0;
      }
      telegraph.classList.remove("go");
      shock.classList.remove("go");
      chars.forEach((c) => c.classList.remove("impact"));
      document.querySelectorAll(".vfx-smoke").forEach((e) => e.remove());
    }
    const onEnter = () => {
      if (!active) void cycle();
    };
    const onLeave = () => reset();
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      reset();
    };
  }
  function buildParallaxLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-parallax";
    el.textContent = title;
    return el;
  }
  function mountParallax(label) {
    const text = label.textContent ?? "";
    label.textContent = "";
    const group = document.createElement("span");
    group.className = "pl-group";
    splitCharsInto(group, text);
    label.appendChild(group);
    const chars = Array.from(group.querySelectorAll(".ch"));
    const n = chars.length;
    const rand = (a, b) => a + Math.random() * (b - a);
    chars.forEach((c, idx) => {
      const angle = idx / Math.max(1, n) * Math.PI * 2 + rand(-0.18, 0.18);
      const mag = rand(34, 52);
      c.style.setProperty("--rx", (Math.cos(angle) * mag).toFixed(1) + "px");
      c.style.setProperty("--ry", (Math.sin(angle) * mag * 0.55).toFixed(1) + "px");
    });
    const onEnter = () => label.classList.add("playing");
    const onLeave = () => label.classList.remove("playing");
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      label.classList.remove("playing");
    };
  }
  var POL_SWEEP_MS = 1700;
  var POL_HOLD_MS = 500;
  var POL_HIDDEN = "polygon(-60% -20%, -30% -20%, -50% 120%, -60% 120%)";
  var POL_REVEALED = "polygon(-60% -20%, 130% -20%, 110% 120%, -60% 120%)";
  var POL_COLORS = {
    blue: { color: "#5fc7ff", shadow: "0 0 10px rgba(95, 199, 255, .8)" },
    green: { color: "#6be08f", shadow: "0 0 10px rgba(107, 224, 143, .8)" }
  };
  function applyPolColor(el, c) {
    el.style.color = POL_COLORS[c].color;
    el.style.textShadow = POL_COLORS[c].shadow;
  }
  function buildPolarityLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel anim-polarity";
    const stack = document.createElement("span");
    stack.className = "pol-stack";
    const normal = document.createElement("span");
    normal.className = "pol-normal";
    normal.textContent = title;
    const wrap = document.createElement("span");
    wrap.className = "pol-wrap";
    const base = document.createElement("span");
    base.className = "pol-base";
    base.textContent = title;
    const sweep = document.createElement("span");
    sweep.className = "pol-sweep";
    sweep.textContent = title;
    sweep.setAttribute("aria-hidden", "true");
    wrap.append(base, sweep);
    stack.append(normal, wrap);
    el.append(stack);
    return el;
  }
  function mountPolarity(label) {
    const wrap = label.querySelector(".pol-wrap");
    const base = label.querySelector(".pol-base");
    const sweep = label.querySelector(".pol-sweep");
    if (!wrap || !base || !sweep) return () => {
    };
    let anim = null;
    let holdTimer = null;
    let hovering = false;
    let from = "blue";
    let to = "green";
    const clearHold = () => {
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
    };
    const startPass = () => {
      anim?.cancel();
      applyPolColor(base, from);
      applyPolColor(sweep, to);
      sweep.style.clipPath = POL_HIDDEN;
      anim = sweep.animate(
        [{ clipPath: POL_HIDDEN }, { clipPath: POL_REVEALED }],
        { duration: POL_SWEEP_MS, easing: "linear", fill: "forwards" }
      );
      anim.onfinish = () => {
        if (!hovering) return;
        holdTimer = window.setTimeout(() => {
          holdTimer = null;
          if (!hovering) return;
          [from, to] = [to, from];
          startPass();
        }, POL_HOLD_MS);
      };
    };
    const onEnter = () => {
      hovering = true;
      label.classList.add("playing");
      clearHold();
      anim?.cancel();
      from = "blue";
      to = "green";
      wrap.classList.add("pol-show");
      startPass();
    };
    const onLeave = () => {
      hovering = false;
      label.classList.remove("playing");
      clearHold();
      if (anim && anim.playState !== "finished") {
        anim.onfinish = () => wrap.classList.remove("pol-show");
        anim.playbackRate = -1;
        anim.play();
      } else {
        wrap.classList.remove("pol-show");
      }
    };
    label.addEventListener("mouseenter", onEnter);
    label.addEventListener("mouseleave", onLeave);
    return () => {
      label.removeEventListener("mouseenter", onEnter);
      label.removeEventListener("mouseleave", onLeave);
      clearHold();
      anim?.cancel();
      label.classList.remove("playing");
      wrap.classList.remove("pol-show");
    };
  }
  var mechanicAnims = {
    fullshine: { buildLabel: buildFullshineLabel, mount: (label, _mediaEl) => mountFullshine(label) },
    pickupdrop: { buildLabel: buildPickupDropLabel, mount: (label, _mediaEl) => mountPickupDrop(label) },
    crw: { buildLabel: buildCrwLabel, mount: (label, _mediaEl) => mountCrw(label) },
    uppop: { buildLabel: buildUppopLabel, mount: (label, _mediaEl) => mountUppop(label) },
    spawn: { buildLabel: buildSpawnLabel, mount: (label, _mediaEl) => mountSpawn(label) },
    moneyflash: { buildLabel: buildMoneyflashLabel, mount: (label, _mediaEl) => mountMoneyflash(label) },
    drilldash: { buildLabel: buildDrilldashLabel, mount: (label, _mediaEl) => mountDrilldash(label) },
    camera: { buildLabel: buildCameraLabel, mount: (label, _mediaEl) => mountCamera(label) },
    ragdoll: { buildLabel: buildRagdollLabel, mount: (label, _mediaEl) => mountRagdoll(label) },
    turret: { buildLabel: buildTurretLabel, mount: (label, _mediaEl) => mountTurret(label) },
    objectpool: { buildLabel: buildObjectpoolLabel, mount: (label, _mediaEl) => mountObjectpool(label) },
    vfx: { buildLabel: buildVfxLabel, mount: (label, _mediaEl) => mountVfx(label) },
    polarity: { buildLabel: buildPolarityLabel, mount: (label, _mediaEl) => mountPolarity(label) },
    parallax: { buildLabel: buildParallaxLabel, mount: (label, _mediaEl) => mountParallax(label) }
  };
  function buildFallbackLabel(title) {
    const el = document.createElement("div");
    el.className = "slabel";
    el.textContent = title;
    return el;
  }
  function buildMechanicLabel(mechanic, mediaEl) {
    const anim = mechanic.animKey ? mechanicAnims[mechanic.animKey] : void 0;
    if (!anim) {
      return { el: buildFallbackLabel(mechanic.title), cleanup: () => {
      } };
    }
    const el = anim.buildLabel(mechanic.title);
    el.classList.add("has-anim");
    const cleanup = anim.mount(el, mediaEl);
    const unwatch = watchLabel(el);
    return { el, cleanup: () => {
      unwatch();
      cleanup();
    } };
  }
  var titleAnimWatch = { seen: false };
  var WATCH_MS = 1e3;
  var TAP_PLAY_MS = 3e3;
  function watchLabel(el) {
    let hoverT = 0, tapT = 0;
    const enter = () => {
      clearTimeout(hoverT);
      hoverT = window.setTimeout(() => {
        titleAnimWatch.seen = true;
      }, WATCH_MS);
    };
    const leave = () => clearTimeout(hoverT);
    const tap = (e) => {
      if (e.pointerType === "mouse") return;
      titleAnimWatch.seen = true;
      clearTimeout(tapT);
      el.dispatchEvent(new MouseEvent("mouseleave"));
      el.dispatchEvent(new MouseEvent("mouseenter"));
      tapT = window.setTimeout(() => el.dispatchEvent(new MouseEvent("mouseleave")), TAP_PLAY_MS);
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("pointerdown", tap);
    return () => {
      clearTimeout(hoverT);
      clearTimeout(tapT);
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("pointerdown", tap);
    };
  }

  // ../AppData/Local/Temp/claude/c63ca09ed6ba270a/f29df762-e277-4fb7-b2c6-dc734de6f46e/scratchpad/anims-entry.ts
  window.MechanicAnims = { buildMechanicLabel };
})();
