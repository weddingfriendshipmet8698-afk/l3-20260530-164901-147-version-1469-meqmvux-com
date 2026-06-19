(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function() {
      var open = mobile.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function(value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function(panel) {
      var scope = panel.parentElement || document;
      var list = scope.querySelector("[data-movie-list]") || document.querySelector("[data-movie-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item")) : [];
      if (!cards.length) {
        return;
      }
      var keyword = panel.querySelector("[data-filter='keyword']");
      var region = panel.querySelector("[data-filter='region']");
      var type = panel.querySelector("[data-filter='type']");
      var category = panel.querySelector("[data-filter='category']");
      var sort = panel.querySelector("[data-sort='movies']");
      var regions = Array.from(new Set(cards.map(function(card) { return card.getAttribute("data-region") || ""; }))).sort();
      var types = Array.from(new Set(cards.map(function(card) { return card.getAttribute("data-type") || ""; }))).sort();
      fillSelect(region, regions);
      fillSelect(type, types);

      function applySort() {
        if (!sort || !list) {
          return;
        }
        var mode = sort.value;
        var sorted = cards.slice().sort(function(a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (mode === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
        });
        sorted.forEach(function(card) {
          list.appendChild(card);
        });
        cards = sorted;
      }

      function applyFilter() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var c = category ? category.value : "";
        cards.forEach(function(card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          if (c && card.getAttribute("data-category") !== c) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
        });
      }

      [keyword, region, type, category].forEach(function(input) {
        if (input) {
          input.addEventListener("input", applyFilter);
          input.addEventListener("change", applyFilter);
        }
      });
      if (sort) {
        sort.addEventListener("change", function() {
          applySort();
          applyFilter();
        });
        applySort();
      }
    });
  }

  window.initMoviePlayer = function(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var overlay = document.getElementById(config.overlayId);
    if (!video || !button || !overlay || !config.source) {
      return;
    }
    var started = false;
    var hls = null;

    function attach() {
      if (started) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
      started = true;
    }

    function play() {
      attach();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    button.addEventListener("click", function(event) {
      event.stopPropagation();
      play();
    });
    overlay.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (!started) {
        play();
      }
    });
    window.addEventListener("pagehide", function() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
