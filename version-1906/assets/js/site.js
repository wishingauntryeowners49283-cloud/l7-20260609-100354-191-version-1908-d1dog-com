let hlsConstructorPromise = null;

function getHlsConstructor() {
  if (!hlsConstructorPromise) {
    hlsConstructorPromise = import('./video-vendor-dru42stk.js').then((module) => module.H);
  }

  return hlsConstructorPromise;
}

function setupMobileNavigation() {
  const button = document.querySelector('[data-menu-button]');

  if (!button) {
    return;
  }

  button.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
    button.textContent = document.body.classList.contains('nav-open') ? '×' : '☰';
  });
}

function setupHeroCarousel() {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));

  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;

  const setActive = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const nextIndex = Number(dot.dataset.heroDot || 0);
      setActive(nextIndex);
    });
  });

  window.setInterval(() => {
    setActive(activeIndex + 1);
  }, 5200);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function setupFilters() {
  const panel = document.querySelector('[data-filter-panel]');
  const grid = document.querySelector('[data-movie-grid]');

  if (!panel || !grid) {
    return;
  }

  const cards = Array.from(grid.querySelectorAll('.movie-card'));
  const searchInput = panel.querySelector('[data-filter-search]');
  const regionSelect = panel.querySelector('[data-filter-region]');
  const typeSelect = panel.querySelector('[data-filter-type]');
  const yearSelect = panel.querySelector('[data-filter-year]');
  const categorySelect = panel.querySelector('[data-filter-category]');
  const result = panel.querySelector('[data-filter-result]');
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');

  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
  }

  const applyFilter = () => {
    const query = normalize(searchInput && searchInput.value);
    const region = normalize(regionSelect && regionSelect.value);
    const type = normalize(typeSelect && typeSelect.value);
    const year = normalize(yearSelect && yearSelect.value);
    const category = normalize(categorySelect && categorySelect.value);
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.category,
        card.dataset.tags,
        card.dataset.year,
      ].join(' '));

      const matched = (!query || haystack.includes(query))
        && (!region || normalize(card.dataset.region).includes(region))
        && (!type || normalize(card.dataset.type).includes(type))
        && (!year || normalize(card.dataset.year) === year)
        && (!category || normalize(card.dataset.category) === category);

      card.hidden = !matched;

      if (matched) {
        visibleCount += 1;
      }
    });

    if (result) {
      result.textContent = `当前显示 ${visibleCount} 部`;
    }
  };

  [searchInput, regionSelect, typeSelect, yearSelect, categorySelect].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  applyFilter();
}

async function attachHls(video, source, message) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  const Hls = await getHlsConstructor();

  if (!Hls || !Hls.isSupported()) {
    throw new Error('当前浏览器不支持 HLS 播放');
  }

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 60,
  });

  hls.on(Hls.Events.ERROR, function (_event, data) {
    if (data && data.fatal && message) {
      message.textContent = '播放源暂时无法加载，请刷新页面或稍后重试。';
    }
  });

  hls.loadSource(source);
  hls.attachMedia(video);
  video._hlsInstance = hls;
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const message = player.querySelector('[data-player-message]');

    if (!video || !button) {
      return;
    }

    const source = video.dataset.src;

    button.addEventListener('click', async () => {
      if (!source) {
        if (message) {
          message.textContent = '当前影片未配置播放源。';
        }
        return;
      }

      button.classList.add('is-hidden');

      if (message) {
        message.textContent = '正在加载高清播放源...';
      }

      try {
        if (!video.dataset.playerReady) {
          await attachHls(video, source, message);
          video.dataset.playerReady = 'true';
        }

        await video.play();

        if (message) {
          message.textContent = '';
        }
      } catch (error) {
        button.classList.remove('is-hidden');

        if (message) {
          message.textContent = error && error.message ? error.message : '播放启动失败，请再次点击或更换浏览器。';
        }
      }
    });
  });
}

function setupHeaderSearchShortcut() {
  const searchFields = Array.from(document.querySelectorAll('input[type="search"]'));

  searchFields.forEach((field) => {
    field.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      const panel = field.closest('[data-filter-panel]');

      if (panel) {
        return;
      }

      const query = field.value.trim();

      if (query) {
        window.location.href = `all.html?q=${encodeURIComponent(query)}`;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNavigation();
  setupHeroCarousel();
  setupFilters();
  setupPlayers();
  setupHeaderSearchShortcut();
});
