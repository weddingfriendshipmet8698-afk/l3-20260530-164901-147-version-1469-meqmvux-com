(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function markMissingImages() {
    qsa('img[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        var frame = img.closest('.media-frame');
        if (frame) {
          frame.classList.add('is-image-missing');
        }
      });
    });
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-main-nav]');
    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupCardFilters() {
    var grids = qsa('[data-filter-grid]');
    var input = qs('[data-filter-input]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');
    var count = qs('[data-result-count]');
    var reset = qs('[data-reset-filter]');

    if (!grids.length || (!input && !type && !year)) {
      return;
    }

    function cardMatches(card) {
      var keyword = normalize(input && input.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);
      var text = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.category,
        card.textContent
      ].join(' '));
      var cardType = normalize(card.dataset.type);
      var cardYear = Number(card.dataset.year || 0);

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (selectedType && cardType !== selectedType) {
        return false;
      }
      if (selectedYear) {
        var yearNumber = Number(selectedYear);
        if (yearNumber >= 2020 && yearNumber !== cardYear && selectedYear.length === 4) {
          if (yearNumber === 2020 || yearNumber === 2010) {
            if (cardYear < yearNumber) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    }

    function apply() {
      var visible = 0;
      grids.forEach(function (grid) {
        qsa('.movie-card', grid).forEach(function (card) {
          var matched = cardMatches(card);
          card.classList.toggle('is-hidden-card', !matched);
          if (matched) {
            visible += 1;
          }
        });
      });
      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    qsa('[data-quick-keyword]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = button.dataset.quickKeyword || button.textContent;
          apply();
        }
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
  }

  function movieCard(movie) {
    var cover = movie.cover || '1.jpg';
    var tags = (movie.genre || '').split(/[，,\/、\s]+/).filter(Boolean).slice(0, 2);
    var tagHtml = tags.map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="poster media-frame" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover>',
      '    <span class="image-fallback">' + escapeHtml(movie.title) + '</span>',
      '    <span class="play-mark">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a href="' + escapeHtml(movie.url) + '" class="movie-title">' + escapeHtml(movie.title) + '</a>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.yearText || movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tagHtml + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var resultWrap = qs('[data-search-results]');
    if (!resultWrap || !window.MOVIES) {
      return;
    }

    var input = qs('[data-search-page-input]');
    var category = qs('[data-search-page-category]');
    var type = qs('[data-search-page-type]');
    var count = qs('[data-search-page-count]');

    function matches(movie) {
      var keyword = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var selectedType = normalize(type && type.value);
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));

      if (selectedCategory && normalize(movie.category) !== selectedCategory) {
        return false;
      }
      if (selectedType && normalize(movie.type) !== selectedType) {
        return false;
      }
      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }
      return true;
    }

    function render() {
      var keyword = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var selectedType = normalize(type && type.value);
      var list = window.MOVIES.filter(matches)
        .sort(function (a, b) {
          return (b.score || 0) - (a.score || 0);
        });

      if (!keyword && !selectedCategory && !selectedType) {
        list = list.slice(0, 40);
      } else {
        list = list.slice(0, 160);
      }

      resultWrap.innerHTML = list.map(movieCard).join('\n');
      markMissingImages();

      if (count) {
        count.textContent = '当前显示 ' + list.length + ' 部，继续输入关键词可缩小范围。';
      }
    }

    [input, category, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    markMissingImages();
    setupMenu();
    setupHero();
    setupCardFilters();
    setupSearchPage();
  });
})();
