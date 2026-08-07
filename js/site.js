/* CLAREAR — comportamento compartilhado entre páginas */

(function () {
  var WHATS_NUMBER = "5548988395264";

  function waLink(message) {
    return "https://wa.me/" + WHATS_NUMBER + "?text=" + encodeURIComponent(message);
  }

  function reportConversion(url) {
    if (typeof gtag === "function") {
      gtag("event", "conversion", {
        send_to: "AW-18135353188/ETkPCPahv6YcEOSOzsdD"
      });
    }
    return true;
  }

  function setWhatsLinks() {
    var defaultMessage = "Olá! Vim pelo site da Clarear e gostaria de solicitar uma proposta.";
    document.querySelectorAll("[data-whats]").forEach(function (el) {
      var message = el.getAttribute("data-whats") || defaultMessage;
      var link = waLink(message);
      el.href = link;
      el.target = "_blank";
      el.rel = "noopener";
      el.addEventListener("click", function () {
        reportConversion(link);
      });
    });
  }

  function setupDrawer() {
    var drawer = document.getElementById("drawer");
    var openBtn = document.getElementById("openMenu");
    var closeBtn = document.getElementById("closeMenu");
    if (!drawer || !openBtn || !closeBtn) return;

    function close() {
      drawer.classList.remove("open");
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", function () {
      drawer.classList.add("open");
      document.body.style.overflow = "hidden";
    });

    closeBtn.addEventListener("click", close);

    drawer.addEventListener("click", function (e) {
      if (e.target === drawer) close();
    });

    drawer.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
  }

  function setupForm() {
    var form = document.getElementById("quoteForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var lines = [form.dataset.intro || "Olá! Vim pelo site da Clarear e gostaria de solicitar uma proposta.", ""];

      form.querySelectorAll("[data-field]").forEach(function (el) {
        var value = el.value.trim();
        if (!value) return;
        lines.push(el.dataset.field + ": " + value);
      });

      var link = waLink(lines.join("\n"));
      reportConversion(link);
      window.open(link, "_blank", "noopener");
    });
  }

  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setWhatsLinks();
    setupDrawer();
    setupForm();
    setYear();
  });
})();
