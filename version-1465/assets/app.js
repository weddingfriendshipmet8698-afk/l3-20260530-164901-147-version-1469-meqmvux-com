
(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', root);
        var dots = selectAll('[data-hero-dot]', root);
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var keyword = panel.querySelector('[data-filter-keyword]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var category = panel.querySelector('[data-filter-category]');
        var cards = selectAll('.movie-card');
        var empty = document.querySelector('[data-no-results]');

        function value(control) {
            return control ? control.value.trim().toLowerCase() : '';
        }

        function apply() {
            var q = value(keyword);
            var r = value(region);
            var t = value(type);
            var y = value(year);
            var c = value(category);
            var shown = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var ok = true;

                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && (card.dataset.region || '').toLowerCase().indexOf(r) === -1) {
                    ok = false;
                }
                if (t && (card.dataset.type || '').toLowerCase().indexOf(t) === -1) {
                    ok = false;
                }
                if (y && (card.dataset.year || '').toLowerCase() !== y) {
                    ok = false;
                }
                if (c && (card.dataset.category || '').toLowerCase() !== c) {
                    ok = false;
                }

                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', shown === 0);
            }
        }

        [keyword, region, type, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    window.createMoviePlayer = function (source) {
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-player-button]');
        var hlsInstance = null;
        var ready = false;

        if (!video || !button || !source) {
            return;
        }

        function markStarted() {
            button.classList.add('is-hidden');
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        function attach() {
            if (ready) {
                playVideo();
                return;
            }
            ready = true;
            video.controls = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hlsInstance) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hlsInstance.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hlsInstance.recoverMediaError();
                        } else {
                            hlsInstance.destroy();
                        }
                    }
                });
            } else {
                video.src = source;
                playVideo();
            }
        }

        function start() {
            markStarted();
            attach();
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
}());
