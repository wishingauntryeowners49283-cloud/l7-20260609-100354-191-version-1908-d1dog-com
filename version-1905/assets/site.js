(function() {
  var StaticMovieSite = {
    init: function() {
      this.bindMobileMenu();
      this.bindHero();
      this.bindFilters();
    },
    bindMobileMenu: function() {
      var button = document.querySelector('[data-menu-toggle]');
      var menu = document.querySelector('[data-mobile-menu]');
      if (!button || !menu) {
        return;
      }
      button.addEventListener('click', function() {
        menu.classList.toggle('open');
      });
    },
    bindHero: function() {
      var hero = document.querySelector('[data-hero]');
      if (!hero) {
        return;
      }
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (!slides.length) {
        return;
      }
      var active = 0;
      var timer = null;
      var show = function(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === active);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === active);
        });
      };
      var start = function() {
        timer = window.setInterval(function() {
          show(active + 1);
        }, 5000);
      };
      var restart = function() {
        if (timer) {
          window.clearInterval(timer);
        }
        start();
      };
      if (prev) {
        prev.addEventListener('click', function() {
          show(active - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function() {
          show(active + 1);
          restart();
        });
      }
      dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
          show(index);
          restart();
        });
      });
      show(0);
      start();
    },
    bindFilters: function() {
      var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
      if (!lists.length) {
        return;
      }
      var input = document.querySelector('[data-filter-input]');
      var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) {
        input.value = query;
      }
      var normalize = function(value) {
        return String(value || '').toLowerCase().trim();
      };
      var apply = function() {
        var words = normalize(input ? input.value : '').split(/\s+/).filter(Boolean);
        var filters = {};
        selects.forEach(function(select) {
          filters[select.getAttribute('data-filter-select')] = normalize(select.value);
        });
        lists.forEach(function(list) {
          var cards = Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]'));
          var visibleCount = 0;
          cards.forEach(function(card) {
            var text = normalize(card.getAttribute('data-search'));
            var matchedWords = words.every(function(word) {
              return text.indexOf(word) !== -1;
            });
            var matchedSelects = Object.keys(filters).every(function(key) {
              var value = filters[key];
              if (!value) {
                return true;
              }
              return normalize(card.getAttribute('data-' + key)).indexOf(value) !== -1;
            });
            var visible = matchedWords && matchedSelects;
            card.style.display = visible ? '' : 'none';
            if (visible) {
              visibleCount += 1;
            }
          });
          var empty = document.querySelector('[data-empty-state]');
          if (empty) {
            empty.classList.toggle('show', visibleCount === 0);
          }
        });
      };
      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function(select) {
        select.addEventListener('change', apply);
      });
      apply();
    },
    initPlayer: function(streamUrl) {
      var video = document.getElementById('movie-player');
      var overlay = document.getElementById('player-overlay');
      var hlsInstance = null;
      if (!video || !streamUrl) {
        return;
      }
      var attach = function() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }
        video.setAttribute('data-ready', 'true');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          return;
        }
        video.src = streamUrl;
      };
      var play = function() {
        attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function() {});
        }
      };
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function() {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
  window.StaticMovieSite = StaticMovieSite;
  document.addEventListener('DOMContentLoaded', function() {
    StaticMovieSite.init();
  });
})();
