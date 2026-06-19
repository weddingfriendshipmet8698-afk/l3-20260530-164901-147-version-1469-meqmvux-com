function setupMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var started = false;

  function attachSource() {
    if (!video || started) {
      return;
    }
    started = true;
    video.controls = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(options.source);
      hls.attachMedia(video);
    } else {
      video.src = options.source;
    }
  }

  function playVideo() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (video) {
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (!started) {
        playVideo();
      }
    });
  }
}
