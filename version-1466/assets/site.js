(function () {
  var htmlEscape = function (value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", menu.classList.contains("is-open") ? "true" : "false");
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
        dot.classList.toggle("is-active", i === active);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var queryInput = document.querySelector("[data-filter-query]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var regionSelect = document.querySelector("[data-filter-region]");

    function currentValue(node) {
      return node ? node.value.trim().toLowerCase() : "";
    }

    function filterCards() {
      var query = currentValue(queryInput);
      var year = currentValue(yearSelect);
      var region = currentValue(regionSelect);
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var matchesRegion = !region || card.getAttribute("data-region") === region;
        card.classList.toggle("is-filter-hidden", !(matchesQuery && matchesYear && matchesRegion));
      });
    }

    [queryInput, yearSelect, regionSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", filterCards);
        node.addEventListener("change", filterCards);
      }
    });
  }

  function setupSearch() {
    var input = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-global-results]");
    if (!input || !results || !window.SEARCH_INDEX) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (query.length < 1) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }
      var items = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.category, item.tags].join(" ").toLowerCase();
        return text.indexOf(query) !== -1;
      }).slice(0, 12);
      if (!items.length) {
        results.classList.add("is-open");
        results.innerHTML = "<div class=\"search-result-item\"><div></div><div><strong>未找到匹配影片</strong><span>换一个关键词试试</span></div></div>";
        return;
      }
      results.classList.add("is-open");
      results.innerHTML = items.map(function (item) {
        return "<a class=\"search-result-item\" href=\"" + htmlEscape(item.url) + "\">" +
          "<img src=\"" + htmlEscape(item.cover) + "\" alt=\"" + htmlEscape(item.title) + "\" loading=\"lazy\">" +
          "<div><strong>" + htmlEscape(item.title) + "</strong><span>" + htmlEscape(item.region) + " · " + htmlEscape(item.year) + " · " + htmlEscape(item.category) + "</span></div>" +
          "</a>";
      }).join("");
    });
  }

  function setupPlayer() {
    var video = document.querySelector("[data-player]");
    var trigger = document.querySelector("[data-play-trigger]");
    var cover = document.querySelector("[data-player-cover]");
    var message = document.querySelector("[data-player-message]");
    if (!video || !trigger) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var hls = null;
    var loaded = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function loadStream() {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放暂不可用，请稍后再试");
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else {
        setMessage("播放暂不可用，请稍后再试");
      }
    }

    function beginPlay() {
      loadStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          setMessage("");
        });
      }
    }

    trigger.addEventListener("click", beginPlay);
    if (cover) {
      cover.addEventListener("click", beginPlay);
    }
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayer();
  });
})();
