/* CLAREAR — motion: revelações, vidro limpo, bolhas, vídeo sob demanda */

(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Quebra o texto de um título em palavras mascaradas (mantém tags internas) */
  function splitWords(el, base) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span");
            w.className = "w";
            var s = document.createElement("span");
            s.style.setProperty("--i", i++);
            s.textContent = part;
            w.appendChild(s);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    })(el);
    el.classList.add("split");
    el.style.setProperty("--base", (base || 0) + "ms");
  }

  /* Sequência de revelação por irmãos: --d vira o atraso escalonado */
  function stagger(selector, type, parentSel) {
    $all(selector).forEach(function (el) {
      var parent = parentSel ? el.closest(parentSel) : el.parentElement;
      var sibs = parent ? $all(selector, parent) : [el];
      el.style.setProperty("--d", Math.max(0, sibs.indexOf(el)));
      el.setAttribute("data-r", type || "up");
    });
  }

  function setupReveal() {
    // títulos
    $all("h1, h2").forEach(function (h) {
      if (h.closest(".drawer")) return;
      var inHero = !!h.closest(".hero, .hero-media");
      splitWords(h, inHero ? 250 : 0);
      h.setAttribute("data-r", "split");
    });

    // blocos
    stagger(".kicker, .lede, .hero-text .actions, .section-head p", "up");
    stagger(".stat-row", "up");
    stagger(".feature", "up", ".feature-list");
    stagger(".diff", "up", ".diff-grid");
    stagger(".case", "up", ".case-grid");
    stagger(".work", "up", ".portfolio-grid");
    stagger(".tl-step", "up", ".timeline");
    stagger(".model", "up", ".model-grid");
    stagger(".contact-card, #quoteForm, .cta-box > *, .cta .actions", "up");
    stagger(".case-photo, .work-photo", "media");

    $all(".timeline").forEach(function (t) { t.setAttribute("data-r-line", ""); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

    // mídia recortada não "aparece" para o observador: observa o cartão pai

    $all("[data-r], .timeline").forEach(function (el) {
      if (el.getAttribute("data-r") === "media") {
        var box = el.closest(".case, .work") || el;
        var inner = box._mediaEls || (box._mediaEls = []);
        inner.push(el);
        if (inner.length === 1) {
          var obs = new IntersectionObserver(function (en) {
            if (!en[0].isIntersecting) return;
            box._mediaEls.forEach(function (m) { m.classList.add("in"); });
            obs.disconnect();
          }, { threshold: 0.12 });
          obs.observe(box);
        }
      } else io.observe(el);
    });
  }

  /* Vidro limpo: névoa + rodo passam sobre a imagem principal */
  function setupWipe() {
    $all(".hero-frame, .hero-media").forEach(function (box) {
      var haze = document.createElement("div"); haze.className = "haze";
      var sq = document.createElement("div"); sq.className = "squeegee";
      box.appendChild(haze);
      box.appendChild(sq);

      var isFrame = box.classList.contains("hero-frame");
      var sparkles = isFrame ? [["14%", "18%", ".2s"], ["78%", "30%", ".9s"], ["60%", "72%", "1.6s"]] : [];
      sparkles.forEach(function (p) {
        var s = document.createElement("i");
        s.className = "sparkle";
        s.style.left = p[0]; s.style.top = p[1]; s.style.setProperty("--sd", p[2]);
        box.appendChild(s);
      });

      if (isFrame) {
        var hint = document.createElement("span");
        hint.className = "wipe-hint";
        hint.textContent = "Clique para limpar de novo";
        box.appendChild(hint);
      }

      function run() {
        box.classList.remove("wipe", "wipe-done");
        void box.offsetWidth;
        box.classList.add("wipe");
      }

      sq.addEventListener("animationend", function (e) {
        if (e.animationName !== "wipeFlash") return;
        box.classList.remove("wipe");
        box.classList.add("wipe-done");
      });

      if (isFrame) {
        box.addEventListener("click", function () {
          if (box.classList.contains("wipe-done")) run();
        });
      }

      run();
    });
  }

  /* Cabeçalho compacto + barra de progresso */
  function setupScroll() {
    var header = document.querySelector(".header");
    var bar = document.createElement("div");
    bar.className = "progress";
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var y = window.scrollY || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      if (header) header.classList.toggle("scrolled", y > 24);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* Bolhas de sabão subindo na faixa final */
  function setupBubbles() {
    $all(".cta").forEach(function (cta) {
      var wrap = document.createElement("div");
      wrap.className = "bubbles";
      for (var i = 0; i < 16; i++) {
        var b = document.createElement("span");
        var size = 10 + Math.random() * 38;
        b.className = "bubble";
        b.style.width = b.style.height = size + "px";
        b.style.left = (Math.random() * 100) + "%";
        b.style.setProperty("--t", (11 + Math.random() * 11) + "s");
        b.style.setProperty("--dl", (-Math.random() * 18) + "s");
        b.style.setProperty("--x", (Math.random() * 70 - 35) + "px");
        wrap.appendChild(b);
      }
      cta.insertBefore(wrap, cta.firstChild);
    });
  }

  /* Vídeos só tocam quando aparecem na tela (economiza banda e bateria) */
  function setupVideos() {
    var vids = $all("video");
    if (!vids.length || !("IntersectionObserver" in window)) return;
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { v.preload = "metadata"; vio.observe(v); });
  }

  function init() {
    setupVideos();
    if (reduce || !("IntersectionObserver" in window)) return;
    root.classList.add("motion");
    setupReveal();
    setupWipe();
    setupScroll();
    setupBubbles();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
