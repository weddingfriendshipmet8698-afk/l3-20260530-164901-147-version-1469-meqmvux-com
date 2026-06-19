(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', root);
    var dots = selectAll('[data-hero-dot]', root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var keyword = scope.querySelector('[data-filter-keyword]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var cards = selectAll('[data-card]', scope);
      var empty = scope.querySelector('[data-empty]');
      function apply() {
        var key = keyword ? keyword.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var ok = true;
          if (key && text.indexOf(key) === -1) {
            ok = false;
          }
          if (y && cardYear !== y) {
            ok = false;
          }
          if (t && cardType !== t) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      [keyword, year, type].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var layer = document.querySelector('[data-play-layer]');
    if (!video || !sourceUrl) {
      return;
    }
    var started = false;
    var hlsInstance = null;
    function attachSource() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }
    function begin() {
      attachSource();
      if (layer) {
        layer.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (layer) {
      layer.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (!started || video.paused) {
        begin();
      }
    });
    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
