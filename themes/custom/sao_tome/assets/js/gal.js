
(function () {
  "use strict";
  var root = document.querySelector(".usda-home-redesign");
  if (!root) { return; }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var hasIO = "IntersectionObserver" in window;
  var motionOK = !reduceMotion.matches && hasIO;
  var EASE = "cubic-bezier(.22,1,.36,1)";

  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

  if (motionOK) { root.classList.add("usda-motion"); }

  /* ========================================================
     1. SPLIT HEADINGS INTO MASKED WORDS
     ======================================================== */
  function splitWords(el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    if (!text) { return; }
    var words = text.split(" ");
    el.textContent = "";
    words.forEach(function (word, i) {
      var outer = document.createElement("span");
      var inner = document.createElement("span");
      outer.className = "usda-word";
      inner.textContent = word;
      inner.style.setProperty("--i", i);
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) { el.appendChild(document.createTextNode(" ")); }
    });
  }
  if (motionOK) {
    $$(".usda-section-heading").forEach(splitWords);
  }

  /* ========================================================
     2. COUNTERS
     ======================================================== */
  function prepCounter(el) {
    var original = el.textContent.trim();
    var match = original.match(/[\d,.]+/);
    if (!match) { return null; }
    var numText = match[0];
    var target = parseFloat(numText.replace(/,/g, ""));
    if (isNaN(target)) { return null; }
    var start = original.indexOf(numText);
    var dec = numText.replace(/,/g, "").split(".")[1];
    var info = {
      original: original,
      target: target,
      prefix: original.substring(0, start),
      suffix: original.substring(start + numText.length),
      decimals: dec ? dec.length : 0
    };
    if (info.target < 10 && info.decimals === 0) { return null; }
    var live = document.createElement("span");
    var sr = document.createElement("span");
    live.setAttribute("aria-hidden", "true");
    sr.className = "usda-sr-only";
    sr.textContent = original;
    live.textContent = info.prefix + (info.decimals ? (0).toFixed(info.decimals) : "0") + info.suffix;
    el.textContent = "";
    el.appendChild(live);
    el.appendChild(sr);
    info.live = live;
    el._usdaCounter = info;
    return info;
  }
  function runCounter(el, delay) {
    var info = el._usdaCounter;
    if (!info || info.done) { return; }
    info.done = true;
    var duration = 1400;
    var startTime = null;
    function tick(ts) {
      if (startTime === null) { startTime = ts + (delay || 0); }
      var p = clamp((ts - startTime) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var cur = info.target * eased;
      var shown = info.decimals
        ? cur.toFixed(info.decimals)
        : Math.round(cur).toLocaleString("en-US");
      info.live.textContent = info.prefix + shown + info.suffix;
      if (p < 1) { requestAnimationFrame(tick); }
      else { info.live.textContent = info.original; }
    }
    requestAnimationFrame(tick);
  }
  var cardCounters = [];
  if (motionOK) {
    cardCounters = $$(".usda-win-stat__number").filter(prepCounter);
  }

  /* ========================================================
     3. SCROLL REVEALS (staggered per batch)
     ======================================================== */
  function settleLater(el, ms) {
    setTimeout(function () { el.classList.add("is-settled"); }, ms);
  }
  var revealObserver = null;
  if (motionOK) {
    revealObserver = new IntersectionObserver(function (entries) {
      var entering = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) {
          return (a.boundingClientRect.top - b.boundingClientRect.top) ||
                 (a.boundingClientRect.left - b.boundingClientRect.left);
        });
      entering.forEach(function (entry, i) {
        var el = entry.target;
        var delay = i * 85;
        el.style.setProperty("--d", delay + "ms");
        el.classList.add("is-inview");
        revealObserver.unobserve(el);
        if (el.classList.contains("usda-win-stat")) {
          var num = el.querySelector(".usda-win-stat__number");
          if (num) { runCounter(num, delay + 150); }
          settleLater(el, delay + 1050);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    $$(".usda-section-heading, .usda-win-intro, .usda-win-stat")
      .forEach(function (el) { revealObserver.observe(el); });
  }

  /* ========================================================
     4. YELLOW MARKER HIGHLIGHTS
     ======================================================== */
  var highlights = $$(".usda-win-intro strong, .usda-win-intro b, .usda-win-stat p strong, .usda-win-stat p b");
  var highlightObserver = null;
  if (motionOK) {
    highlightObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("usda-highlight-visible");
        highlightObserver.unobserve(entry.target);
      });
    }, { threshold: 0.55, rootMargin: "0px 0px -5% 0px" });
    highlights.forEach(function (h) { highlightObserver.observe(h); });
  } else {
    highlights.forEach(function (h) { h.classList.add("usda-highlight-visible"); });
  }

  /* ========================================================
     5. CURSOR GLOW ON RESULT CARDS (desktop)
     ======================================================== */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reduceMotion.matches) {
    $$(".usda-win-stat").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--gx", (e.clientX - r.left) + "px");
        card.style.setProperty("--gy", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ========================================================
     6. RESULTS DEPTH CAROUSEL, with "See all" toggle
     ======================================================== */
  var winGrid = root.querySelector(".usda-win-grid");
  var winCards = winGrid ? $$(".usda-win-stat", winGrid) : [];
  if (winGrid && winCards.length > 3) {
    var total = winCards.length;
    var animate = !reduceMotion.matches;
    var fineHover = window.matchMedia("(hover:hover) and (pointer:fine)");
    var narrowMQ = window.matchMedia("(max-width:700px)");

    var wrap = document.createElement("div");
    wrap.className = "usda-win-carousel is-depth";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-roledescription", "carousel");
    wrap.setAttribute("aria-label", "USDA results");
    winGrid.parentNode.insertBefore(wrap, winGrid);
    wrap.appendChild(winGrid);
    if (!winGrid.id) { winGrid.id = "usda-win-track"; }

    function chevron(dir) {
      var NS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("focusable", "false");
      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "2.2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      svg.appendChild(path);
      return svg;
    }
    function makeButton(cls, label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.setAttribute("aria-controls", winGrid.id);
      if (label) { b.setAttribute("aria-label", label); }
      return b;
    }
    function spokenText(el) {
      var out = [];
      (function walk(node) {
        if (node.nodeType === 3) { out.push(node.nodeValue); return; }
        if (node.nodeType !== 1 || node.getAttribute("aria-hidden") === "true") { return; }
        for (var c = node.firstChild; c; c = c.nextSibling) { walk(c); }
      })(el);
      return out.join(" ").replace(/\s+/g, " ").trim();
    }

    var controls = document.createElement("div");
    controls.className = "usda-win-controls";
    var prev = makeButton("usda-win-arrow usda-win-prev", "Previous result");
    prev.appendChild(chevron(-1));
    var next = makeButton("usda-win-arrow usda-win-next", "Next result");
    next.appendChild(chevron(1));
    var meta = document.createElement("div");
    meta.className = "usda-win-meta";
    var progress = document.createElement("div");
    progress.className = "usda-win-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.appendChild(document.createElement("span"));
    var status = document.createElement("p");
    status.className = "usda-win-status";
    meta.appendChild(progress);
    meta.appendChild(status);
    controls.appendChild(prev);
    controls.appendChild(meta);
    controls.appendChild(next);
    wrap.appendChild(controls);

    var live = document.createElement("p");
    live.className = "usda-sr-only";
    live.setAttribute("aria-live", "polite");
    live.setAttribute("aria-atomic", "true");
    wrap.appendChild(live);

    var toggle = makeButton("usda-win-toggle");
    toggle.setAttribute("aria-expanded", "false");
    // toggle.textContent = "See all " + total + " results";
      // toggle.textContent = "Explorer le Secteur en Chiffres";
    wrap.appendChild(toggle);

    /* ---- state ---- */
    var expanded = false;
    var pos = 0, target = 0, vel = 0;
    var spread = animate && motionOK ? 0 : 1;
    var entered = !(animate && motionOK);
    var steer = 0, steerGoal = 0;
    var lean = 0, leanGoal = 0;
    var active = -1;
    var running = false, last = 0;
    var S1 = 300, S2 = 150, cardW = 400;
    var dragging = false, drag = null, suppressClick = false;
    var wheelTimer = null;

    function setAria(on) {
      winCards.forEach(function (c, i) {
        if (on) {
          c.setAttribute("aria-label", "Result " + (i + 1) + " of " + total);
        } else {
          c.removeAttribute("aria-label");
          c.removeAttribute("aria-hidden");
          c.classList.remove("is-active");
        }
      });
      if (on) {
        winGrid.setAttribute("tabindex", "0");
        winGrid.setAttribute("aria-label", "Results. Use the left and right arrow keys to browse.");
      } else {
        winGrid.removeAttribute("tabindex");
        winGrid.removeAttribute("aria-label");
      }
    }

    /* ---- measuring ---- */
    function measure() {
      if (expanded) { return; }
      cardW = winCards[0].offsetWidth || 400;
      var h = 330;
      wrap.style.setProperty("--card-h", h + "px");
      var pad = narrowMQ.matches ? 84 : 96;
      wrap.style.setProperty("--stage-h", (h + pad) + "px");
      var narrow = narrowMQ.matches;
      S1 = cardW * (narrow ? 0.86 : 0.74);
      S2 = cardW * (narrow ? 0.42 : 0.5);
      layout();
    }

    /* ---- endless loop helpers ---- */
    function mod(n) { return ((n % total) + total) % total; }
    function wrapOff(i, p) {
      var o = (i - p) % total;
      if (o < -total / 2) { o += total; }
      if (o >= total / 2) { o -= total; }
      return o;
    }

    /* ---- drawing ---- */
    function layout() {
      if (expanded) { return; }
      var stageHalf = winGrid.clientWidth / 2;
      var narrow = narrowMQ.matches;
      for (var i = 0; i < total; i++) {
        var card = winCards[i];
        var o = wrapOff(i, pos);
        var a = Math.abs(o);
        var sgn = o < 0 ? -1 : 1;
        var near = Math.min(a, 1);
        var far = Math.max(a - 1, 0);
        var x = sgn * (near * S1 + far * S2) * spread;
        if (Math.abs(x) - cardW * 0.6 > stageHalf || a > 4) {
          card.style.visibility = "hidden";
          continue;
        }
        card.style.visibility = "visible";
        var z = -(near * 160 + far * 110);
        var rot = -sgn * (near * 32 + far * 6) * spread;
        var sc = 1 - near * 0.12 - far * 0.05;
        var op = Math.max(0, 1 - far * 0.5) * (a < 0.5 ? 1 : 0.35 + 0.65 * spread);
        if (narrow) { op *= 1 - near * 0.4; }
        card.style.transform =
          "translate3d(" + x.toFixed(1) + "px,0," + z.toFixed(1) + "px) " +
          "rotateY(" + rot.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
        card.style.opacity = op.toFixed(3);
        card.style.zIndex = String(100 - Math.round(a * 10));
        var blur = Math.min(a, 2) * (narrow ? 0.8 : 1.1);
        card.style.filter = blur > 0.15 ? "blur(" + blur.toFixed(2) + "px)" : "";
      }
      if (lean !== 0 || leanGoal !== 0) {
        wrap.style.setProperty("--lean-x", (50 - lean * 12).toFixed(2) + "%");
      }
      var idx = mod(Math.round(pos));
      if (idx !== active) { setActive(idx); }
    }

    function reveal(i) {
      var c = winCards[i];
      if (!c || c._usdaShown || !entered) { return; }
      c._usdaShown = true;
      var num = c.querySelector(".usda-win-stat__number");
      if (num) { runCounter(num, 60); }
      $$("strong, b", c).forEach(function (b) {
        b.style.setProperty("--d", "0ms");
        b.classList.add("usda-highlight-visible");
      });
    }

    var announceNext = false;
    function setActive(idx) {
      active = idx;
      winCards.forEach(function (c, i) {
        var on = i === idx;
        c.classList.toggle("is-active", on);
        if (on) { c.removeAttribute("aria-hidden"); }
        else { c.setAttribute("aria-hidden", "true"); }
      });
      for (var k = idx - 3; k <= idx + 3; k++) { reveal(mod(k)); }
      status.textContent = (idx + 1) + " of " + total;
      progress.style.setProperty("--prog", ((idx + 1) / total).toFixed(4));
      if (announceNext) {
        live.textContent = "Result " + (idx + 1) + " of " + total + ". " + spokenText(winCards[idx]);
      }
    }

    /* ---- motion loop ---- */
    function kick() {
      if (running || expanded) { return; }
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    }
    function frame(ts) {
      if (expanded) { running = false; return; }
      var dt = last ? Math.min(0.05, (ts - last) / 1000) : 1 / 60;
      last = ts;
      if (!animate) {
        pos = target; vel = 0; spread = 1;
      } else {
        steer = steerGoal ? steer + (steerGoal - steer) * Math.min(1, dt * 6) : 0;
        if (steer && !dragging) { target = target + steer * 2.4 * dt; }
        if (!dragging) {
          var acc = 180 * (target - pos) - 26 * vel;
          vel += acc * dt;
          pos += vel * dt;
        }
        if (entered && spread < 1) { spread = Math.min(1, spread + dt * 1.25); }
        lean += (leanGoal - lean) * Math.min(1, dt * 5);
      }
      layout();
      var settled = Math.abs(target - pos) < 0.0015 && Math.abs(vel) < 0.002 &&
        Math.abs(steerGoal) < 0.001 && Math.abs(steer) < 0.01 &&
        (spread >= 1 || !entered) && Math.abs(lean - leanGoal) < 0.002 && !dragging;
      if (settled || !animate) {
        if (settled) { pos = target; vel = 0; steer = 0; lean = leanGoal; layout(); }
        running = false;
        return;
      }
      requestAnimationFrame(frame);
    }
    function goTo(i, announce) {
      target = Math.round(i);
      steerGoal = 0;
      announceNext = !!announce;
      if (!announce) { live.textContent = ""; }
      kick();
    }
    function goToCard(i, announce) {
      var here = Math.round(target);
      goTo(here + wrapOff(i, here), announce);
    }
    function snap() {
      steer = 0;
      target = Math.round(animate ? pos + vel * 0.12 : target);
      kick();
    }

    /* ---- buttons + keyboard ---- */
    prev.addEventListener("click", function () { goTo(Math.round(target) - 1, true); });
    next.addEventListener("click", function () { goTo(Math.round(target) + 1, true); });
    winGrid.addEventListener("keydown", function (e) {
      if (expanded) { return; }
      var t = Math.round(target);
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(t + 1, true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(t - 1, true); }
      else if (e.key === "Home") { e.preventDefault(); goToCard(0, true); }
      else if (e.key === "End") { e.preventDefault(); goToCard(total - 1, true); }
    });

    /* ---- hover glide ---- */
    winGrid.addEventListener("pointermove", function (e) {
      if (expanded || dragging || !animate || e.pointerType !== "mouse" || !fineHover.matches) { return; }
      var r = winGrid.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var half = r.width / 2;
      leanGoal = clamp(dx / half, -1, 1);
      var dead = cardW * 0.5;
      var reach = Math.max(1, half * 0.88 - dead);
      var amt = clamp((Math.abs(dx) - dead) / reach, 0, 1);
      steerGoal = amt > 0 ? (dx < 0 ? -1 : 1) * Math.pow(amt, 1.3) : 0;
      if (steerGoal) { announceNext = false; }
      if (!steerGoal && steer) { snap(); }
      kick();
    });
    winGrid.addEventListener("pointerleave", function () {
      steerGoal = 0;
      leanGoal = 0;
      snap();
    });

    /* ---- swipe / drag ---- */
    winGrid.addEventListener("pointerdown", function (e) {
      if (expanded || (e.pointerType === "mouse" && e.button !== 0)) { return; }
      drag = {
        x: e.clientX, y: e.clientY, start: pos, lastX: e.clientX, lastT: e.timeStamp,
        v: 0, moved: false, id: e.pointerId,
        card: e.target.closest ? e.target.closest(".usda-win-stat") : null
      };
    });
    winGrid.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) { return; }
      var dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) { return; }
        drag.moved = true;
        dragging = true;
        announceNext = false;
        steerGoal = 0; steer = 0;
        wrap.classList.add("is-dragging");
        if (winGrid.setPointerCapture) {
          try { winGrid.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
      }
      var dt = Math.max(1, e.timeStamp - drag.lastT) / 1000;
      drag.v = -((e.clientX - drag.lastX) / S1) / dt;
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      pos = drag.start - dx / S1;
      target = pos;
      vel = 0;
      layout();
    });
    function endDrag(e, cancelled) {
      if (!drag || (e && e.pointerId !== drag.id)) { return; }
      var d = drag;
      drag = null;
      if (d.moved) {
        dragging = false;
        wrap.classList.remove("is-dragging");
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
        vel = animate ? clamp(d.v, -12, 12) : 0;
        goTo(pos + clamp(d.v * 0.16, -3, 3), false);
      } else if (!cancelled && d.card) {
        var i = winCards.indexOf(d.card);
        if (i !== -1 && i !== active) { goToCard(i, false); }
      }
    }
    winGrid.addEventListener("pointerup", function (e) { endDrag(e, false); });
    winGrid.addEventListener("pointercancel", function (e) { endDrag(e, true); });
    winGrid.addEventListener("click", function (e) {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* ---- sideways trackpad / wheel ---- */
    winGrid.addEventListener("wheel", function (e) {
      if (expanded || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) { return; }
      e.preventDefault();
      steerGoal = 0;
      target = target + e.deltaX / S1;
      kick();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () {
        target = Math.round(target);
        kick();
      }, 140);
    }, { passive: false });

    /* ---- entrance fan-out ---- */
    if (motionOK) {
      winCards.forEach(function (c) {
        if (revealObserver) { revealObserver.unobserve(c); }
        c.classList.add("is-inview", "is-settled");
      });
      if (highlightObserver) {
        $$("strong, b", winGrid).forEach(function (b) { highlightObserver.unobserve(b); });
      }
      var stageObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) { return; }
        stageObserver.disconnect();
        wrap.classList.add("is-inview");
        setTimeout(function () {
          entered = true;
          for (var k = active - 3; k <= active + 3; k++) { reveal(mod(k)); }
          kick();
        }, animate ? 250 : 0);
      }, { threshold: 0.2 });
      stageObserver.observe(winGrid);
    }

    /* ---- See all / Show fewer ---- */
    toggle.addEventListener("click", function () {
      expanded = !expanded;
      wrap.classList.toggle("is-depth", !expanded);
      wrap.classList.toggle("is-expanded", expanded);
      controls.hidden = expanded;
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggle.textContent = expanded ? "Show fewer results" : "See all " + total + " results";
      live.textContent = "";
      if (expanded) {
        setAria(false);
        winCards.forEach(function (c, i) {
          ["transform", "opacity", "z-index", "filter", "visibility"].forEach(function (p) {
            c.style.removeProperty(p);
          });
          entered = true;
          reveal(i);
        });
        active = -1;
      } else {
        setAria(true);
        pos = target = mod(Math.round(target));
        vel = 0;
        spread = 1;
        measure();
        var top = wrap.getBoundingClientRect().top;
        if (top < 0) { wrap.scrollIntoView({ block: "start", behavior: animate ? "smooth" : "auto" }); }
      }
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener("load", measure);

    setAria(true);
    measure();
    kick();
  }
})();
