(function () {
  function selectAll(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    selectAll(document, "[data-hero]").forEach(function (hero) {
      var slides = selectAll(hero, "[data-hero-slide]");
      var dots = selectAll(hero, "[data-hero-dot]");
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (!slides.length) {
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
          dot.classList.toggle("active", i === active);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      start();
    });
  }

  function initFilters() {
    selectAll(document, "[data-filter-scope]").forEach(function (scope) {
      var search = scope.querySelector("[data-search]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = selectAll(scope, ".movie-card, .rank-card");
      var controls = selectAll(scope, "[data-filter-control]");

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function apply() {
        var text = normalize(search && search.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchText = !text || haystack.indexOf(text) >= 0;
          var matchYear = !selectedYear || normalize(card.getAttribute("data-year")).indexOf(selectedYear) >= 0;
          var matchType = !selectedType || normalize(card.getAttribute("data-type")).indexOf(selectedType) >= 0;
          card.hidden = !(matchText && matchYear && matchType);
        });
      }

      controls.forEach(function (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
    });
  }

  function initMoviePlayer(src, videoId) {
    var video = document.getElementById(videoId || "movie-player");
    if (!video || !src) {
      return;
    }
    var shell = video.closest(".player-shell");
    var button = shell ? shell.querySelector(".play-cover") : null;
    var loaded = false;
    var hls = null;

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function tryPlay() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    function start() {
      hideButton();
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.attachMedia(video);
          hls.loadSource(src);
          if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, tryPlay);
          }
        } else {
          video.src = src;
        }
      }
      tryPlay();
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (shell) {
      shell.addEventListener("click", function (event) {
        if (event.target === shell) {
          start();
        }
      });
    }
    video.addEventListener("play", hideButton);
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
