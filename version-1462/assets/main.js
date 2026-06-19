(function() {
  var body = document.body;
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("open");
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeHero = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }

    activeHero = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeHero);
    });

    heroDots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === activeHero);
    });
  }

  if (heroSlides.length) {
    showHero(0);

    heroDots.forEach(function(dot, dotIndex) {
      dot.addEventListener("click", function() {
        showHero(dotIndex);
      });
    });

    window.setInterval(function() {
      showHero(activeHero + 1);
    }, 5200);
  }

  function resolveUrl(path) {
    var prefix = document.body.getAttribute("data-root") || "./";
    return prefix + path.replace(/^\.\//, "");
  }

  function createSearchItem(movie) {
    var link = document.createElement("a");
    link.className = "search-item";
    link.href = resolveUrl(movie.url);

    var img = document.createElement("img");
    img.src = resolveUrl(movie.cover);
    img.alt = movie.title;

    var info = document.createElement("div");
    var title = document.createElement("strong");
    title.textContent = movie.title;

    var meta = document.createElement("span");
    meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(" / ");

    info.appendChild(title);
    info.appendChild(meta);
    link.appendChild(img);
    link.appendChild(info);

    return link;
  }

  function setupSiteSearch(input) {
    var wrapper = input.closest(".header-search");
    var panel = wrapper ? wrapper.querySelector(".search-panel") : null;
    var movies = window.SiteMovies || [];

    if (!panel) {
      return;
    }

    input.addEventListener("input", function() {
      var keyword = input.value.trim().toLowerCase();
      panel.innerHTML = "";

      if (!keyword) {
        panel.classList.remove("open");
        return;
      }

      var matched = movies.filter(function(movie) {
        return movie.text.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 12);

      if (!matched.length) {
        var empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent = "没有找到相关剧集";
        panel.appendChild(empty);
      } else {
        matched.forEach(function(movie) {
          panel.appendChild(createSearchItem(movie));
        });
      }

      panel.classList.add("open");
    });

    document.addEventListener("click", function(event) {
      if (!wrapper.contains(event.target)) {
        panel.classList.remove("open");
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(setupSiteSearch);

  Array.prototype.slice.call(document.querySelectorAll(".local-filter")).forEach(function(input) {
    var targetSelector = input.getAttribute("data-target") || ".movie-card";
    var targets = Array.prototype.slice.call(document.querySelectorAll(targetSelector));

    input.addEventListener("input", function() {
      var keyword = input.value.trim().toLowerCase();

      targets.forEach(function(card) {
        var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        card.classList.toggle("hidden-card", keyword && text.indexOf(keyword) === -1);
      });
    });
  });
})();
