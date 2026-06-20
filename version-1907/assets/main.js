(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = queryAll('.hero-slide', hero);
    var dots = queryAll('.hero-dot', hero);
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }
    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
    show(0);
  }

  function initFilters() {
    queryAll('[data-filter-scope]').forEach(function (scope) {
      var keyword = scope.querySelector('[data-filter-keyword]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var cards = queryAll('.movie-card', scope);
      var empty = scope.querySelector('[data-empty-state]');
      if (cards.length === 0 && scope.classList.contains('search-panel')) {
        var target = scope.nextElementSibling;
        while (target && target.querySelectorAll('.movie-card').length === 0) {
          target = target.nextElementSibling;
        }
        if (target) {
          cards = queryAll('.movie-card', target);
          empty = target.querySelector('[data-empty-state]');
        }
      }
      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }
      function apply() {
        var keywordValue = normalize(keyword && keyword.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchedKeyword = !keywordValue || haystack.indexOf(keywordValue) !== -1;
          var matchedYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var matchedType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1 || normalize(card.getAttribute('data-genre')).indexOf(typeValue) !== -1;
          var matched = matchedKeyword && matchedYear && matchedType;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible === 0 ? 'block' : 'none';
        }
      }
      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    queryAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-video-url');
      var started = false;
      function attach() {
        if (!url || started) {
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          video._hlsPlayer = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else {
          video.src = url;
        }
      }
      function play() {
        attach();
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
