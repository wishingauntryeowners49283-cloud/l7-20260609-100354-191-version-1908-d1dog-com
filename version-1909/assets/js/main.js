(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    start();
  }

  function setupLists() {
    var list = document.querySelector("[data-movie-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var search = document.querySelector("[data-list-search]");
    var type = document.querySelector("[data-filter-type]");
    var year = document.querySelector("[data-filter-year]");
    var sort = document.querySelector("[data-sort]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function matches(card) {
      var query = normalize(search && search.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      var okQuery = !query || text.indexOf(query) !== -1;
      var okType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
      var okYear = !yearValue || normalize(card.dataset.year) === yearValue;
      return okQuery && okType && okYear;
    }

    function applySort(visibleCards) {
      if (!sort || !sort.value) {
        return visibleCards;
      }
      var sorted = visibleCards.slice();
      if (sort.value === "rating") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        });
      }
      if (sort.value === "views") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.views) - Number(a.dataset.views);
        });
      }
      if (sort.value === "year") {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year) - Number(a.dataset.year);
        });
      }
      return sorted;
    }

    function render() {
      var visible = cards.filter(matches);
      cards.forEach(function (card) {
        card.style.display = "none";
      });
      applySort(visible).forEach(function (card) {
        card.style.display = "";
        list.appendChild(card);
      });
      if (empty) {
        empty.classList.toggle("show", visible.length === 0);
      }
    }

    [search, type, year, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupLists();
  });
})();
