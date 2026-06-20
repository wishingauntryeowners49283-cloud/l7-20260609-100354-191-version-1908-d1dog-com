document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupHero();
  setupImageDisplay();
  setupSearchForms();
  setupCardFilters();
  setupPlayers();
});

function setupNavigation() {
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (!toggle || !mobile) {
    return;
  }
  toggle.addEventListener('click', function () {
    var isOpen = mobile.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupHero() {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (!slides.length) {
    return;
  }
  var current = 0;
  var timer;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      show(Number(dot.getAttribute('data-slide-target')) || 0);
      start();
    });
  });

  show(0);
  start();
}

function setupImageDisplay() {
  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
    function hideBrokenImage() {
      image.style.opacity = '0';
      image.setAttribute('aria-hidden', 'true');
    }
    image.addEventListener('error', hideBrokenImage);
    if (image.complete && image.naturalWidth === 0) {
      hideBrokenImage();
    }
  });
}

function setupSearchForms() {
  Array.prototype.slice.call(document.querySelectorAll('.home-search')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });
}

function setupCardFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('.card-search');
    var chips = Array.prototype.slice.call(panel.querySelectorAll('.filter-chip'));
    var list = panel.parentElement.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .ranking-item'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var activeFilter = '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var filter = normalize(activeFilter);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = !filter || text.indexOf(filter) !== -1;
        card.classList.toggle('is-hidden', !(matchesQuery && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeFilter = chip.getAttribute('data-filter') || '';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });

    apply();
  });
}

var hlsLoaderPromise = null;

function loadHlsLibrary() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }
  if (hlsLoaderPromise) {
    return hlsLoaderPromise;
  }
  hlsLoaderPromise = new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      resolve(window.Hls);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return hlsLoaderPromise;
}

function setupPlayers() {
  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-start');
    if (!video) {
      return;
    }

    function markPlaying() {
      shell.classList.add('is-playing');
    }

    function startVideo() {
      var source = video.getAttribute('data-video-url');
      if (!source) {
        return;
      }

      function play() {
        markPlaying();
        video.play().catch(function () {});
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = source;
        }
        play();
        return;
      }

      loadHlsLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          if (!video.hlsInstance) {
            var hls = new Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, play);
            video.hlsInstance = hls;
          } else {
            play();
          }
        } else {
          video.src = source;
          play();
        }
      }).catch(function () {
        video.src = source;
        play();
      });
    }

    if (button) {
      button.addEventListener('click', startVideo);
    }
    video.addEventListener('play', markPlaying);
    video.addEventListener('click', function () {
      if (!video.src) {
        startVideo();
      }
    });
  });
}
