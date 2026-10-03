/* CLAREAR — morph: antes/depois, processo pinado, spotlight, botões magnéticos */

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Antes / depois: o input range cobre a área toda (acessível por teclado e toque) */
  function setupBeforeAfter() {
    var ba = document.getElementById("ba");
    if (!ba) return;
    var range = ba.querySelector(".ba-range");
    var raf = 0;

    function set(v) { ba.style.setProperty("--pos", v + "%"); }

    range.addEventListener("input", function () {
      ba.classList.add("touched");
      stopDemo();
      set(range.value);
    });
    ["pointerdown", "touchstart"].forEach(function (ev) {
      range.addEventListener(ev, function () { ba.classList.add("drag", "touched"); stopDemo(); }, { passive: true });
    });
    ["pointerup", "pointercancel", "touchend", "blur"].forEach(function (ev) {
      range.addEventListener(ev, function () { ba.classList.remove("drag"); }, { passive: true });
    });

    function stopDemo() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    /* demonstração: o "rodo" varre a imagem uma vez para mostrar a interação */
    if (reduce) return;
    var started = false;
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting || started) return;
      started = true;
      io.disconnect();
      var t0 = performance.now();
      (function tick(now) {
        var t = (now - t0) / 3200;
        if (t >= 1) { set(50); range.value = 50; raf = 0; return; }
        var v = 50 + Math.sin(t * Math.PI * 2) * 38 * (1 - t * .4);
        set(v); range.value = v;
        raf = requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.5 });
    io.observe(ba);
  }

  /* Processo: o scroll dentro da seção pinada troca as etapas */
  function setupScrub() {
    var sec = document.getElementById("processo");
    if (!sec) return;
    var cards = $all(".scrub-card", sec);
    var steps = $all(".scrub-steps li", sec);
    var last = -1;
    var ticking = false;

    function update() {
      ticking = false;
      if (window.innerWidth <= 980) return;
      var r = sec.getBoundingClientRect();
      var total = sec.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / total));
      sec.style.setProperty("--prog", p.toFixed(3));
      var idx = Math.min(cards.length - 1, Math.floor(p * cards.length));
      if (idx === last) return;
      last = idx;
      cards.forEach(function (c, i) { c.classList.toggle("on", i === idx); c.classList.toggle("past", i < idx); });
      steps.forEach(function (s, i) { s.classList.toggle("on", i === idx); });
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* Luz que segue o cursor nos cartões */
  function setupSpotlight() {
    if (!fine) return;
    $all(".feature, .diff").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* Botões que "puxam" o cursor */
  function setupMagnet() {
    if (!fine || reduce) return;
    $all(".magnet").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        var y = (e.clientY - (r.top + r.height / 2)) * 0.32;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }

  function init() {
    setupBeforeAfter();
    setupScrub();
    setupSpotlight();
    setupMagnet();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
