
(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var controls = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-goto]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      controls.forEach(function (control, i) {
        control.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    controls.forEach(function (control) {
      control.addEventListener('click', function () {
        showSlide(Number(control.getAttribute('data-hero-goto')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var scope = document.querySelector('[data-filter-scope]');
  var list = document.querySelector('[data-filter-list]');

  if (scope && list) {
    var keyword = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || card.getAttribute('data-year') === y;
        card.classList.toggle('is-hidden-by-filter', !(matchKeyword && matchYear));
      });
    }

    if (keyword) {
      keyword.addEventListener('input', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }
  }

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchInfo = document.querySelector('[data-search-info]');

  if (searchInput && searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;

    function renderSearch() {
      var q = searchInput.value.trim().toLowerCase();
      var data = window.SITE_MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.summary
        ].join(' ').toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 120);

      searchInfo.textContent = q ? '找到 ' + data.length + ' 条相关结果，最多显示 120 条。' : '展示推荐片库，输入关键词可继续筛选。';
      searchResults.innerHTML = data.map(function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="poster-img" onerror="this.classList.add(\'image-missing\');">',
          '    <span class="play-mask">立即播放</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</p>',
          '    <p class="movie-one-line">' + escapeHtml(movie.summary) + '</p>',
          '    <div class="tag-row">' + tags + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }
})();
