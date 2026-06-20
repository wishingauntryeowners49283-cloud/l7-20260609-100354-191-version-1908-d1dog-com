(function () {
  var hero = document.querySelector('.hero-carousel');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var previous = hero.querySelector('[data-hero="previous"]');
    var next = hero.querySelector('[data-hero="next"]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
        slide.setAttribute('aria-hidden', slideIndex === current ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restartTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    showSlide(0);
    restartTimer();
  }

  var toolbars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  toolbars.forEach(function (toolbar) {
    var scope = toolbar.getAttribute('data-filter-scope');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-scope="' + scope + '"]'));
    var input = toolbar.querySelector('.search-input');
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('.filter-button'));
    var activeFilter = '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords'));
        var type = normalize(card.getAttribute('data-type'));
        var genre = normalize(card.getAttribute('data-genre'));
        var tag = normalize(card.getAttribute('data-tags'));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = !activeFilter || type.indexOf(activeFilter) !== -1 || genre.indexOf(activeFilter) !== -1 || tag.indexOf(activeFilter) !== -1;
        card.classList.toggle('hidden-by-filter', !(matchesQuery && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = normalize(button.getAttribute('data-filter'));
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();
