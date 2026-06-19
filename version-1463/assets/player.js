
(function () {
  var player = document.querySelector('[data-player]');
  if (!player) {
    return;
  }

  var video = player.querySelector('[data-video]');
  var button = player.querySelector('[data-play-button]');
  var source = player.getAttribute('data-src');

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function attachAndPlay() {
    if (!video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      }
    });
  }

  if (button) {
    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      attachAndPlay();
    });
  }
})();
