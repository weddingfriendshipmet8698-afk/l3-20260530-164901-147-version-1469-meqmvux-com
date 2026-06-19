(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-control.prev");
    var next = document.querySelector(".hero-control.next");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function move(step) {
      setSlide(current + step);
    }

    if (slides.length) {
      setSlide(0);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          setSlide(index);
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          window.clearInterval(timer);
          move(-1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          window.clearInterval(timer);
          move(1);
        });
      }
    }

    var searchInput = document.querySelector(".local-search-input");
    var yearSelect = document.querySelector(".year-filter");
    var typeSelect = document.querySelector(".type-filter");
    var movieCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var emptyState = document.querySelector(".empty-state");

    function applyLocalFilter() {
      if (!movieCards.length) {
        return;
      }
      var keyword = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visibleCount = 0;
      movieCards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }
        card.classList.toggle("is-hidden-card", !matched);
        if (matched) {
          visibleCount += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle("show", visibleCount === 0);
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyLocalFilter);
        control.addEventListener("change", applyLocalFilter);
      }
    });

    var globalInput = document.querySelector(".global-search-input");
    var globalResults = document.querySelector(".global-results");
    if (globalInput && globalResults && window.SEARCH_INDEX) {
      globalInput.addEventListener("input", function () {
        var keyword = normalize(globalInput.value);
        globalResults.innerHTML = "";
        if (!keyword) {
          return;
        }
        var matches = window.SEARCH_INDEX.filter(function (item) {
          return normalize(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + item.tags + " " + item.year).indexOf(keyword) !== -1;
        }).slice(0, 24);
        matches.forEach(function (item) {
          var link = document.createElement("a");
          link.className = "result-card";
          link.href = item.url;
          link.innerHTML = '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.type + ' · ' + item.region + '</span><span>' + item.one_line + '</span></span>';
          globalResults.appendChild(link);
        });
      });
    }
  });
})();
