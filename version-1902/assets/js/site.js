(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var category = scope.querySelector('[data-filter-category]');
    var type = scope.querySelector('[data-filter-type]');
    var year = scope.querySelector('[data-filter-year]');
    var container = scope.parentElement ? scope.parentElement.querySelector('[data-card-list]') : null;
    var cards = container ? Array.prototype.slice.call(container.querySelectorAll('[data-card]')) : [];
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var categoryValue = category ? category.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';

      cards.forEach(function (card) {
        var searchable = (card.getAttribute('data-search') || '').toLowerCase();
        var matchQuery = !query || searchable.indexOf(query) !== -1;
        var matchCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchType && matchYear));
      });
    }

    [input, category, type, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', filterCards);
        item.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });
})();

function initMoviePlayer(videoId, triggerId, streamUrl) {
  var video = document.getElementById(videoId);
  var trigger = document.getElementById(triggerId);
  var hlsInstance = null;
  var initialized = false;

  if (!video || !trigger || !streamUrl) {
    return;
  }

  function attachStream() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playNow() {
    attachStream();
    trigger.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  trigger.addEventListener('click', playNow);
  video.addEventListener('play', function () {
    trigger.classList.add('is-hidden');
  });
  video.addEventListener('emptied', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    initialized = false;
  });
}
