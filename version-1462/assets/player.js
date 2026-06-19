(function() {
  var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

  function startPlayer(shell) {
    if (shell.getAttribute("data-ready") === "1") {
      var currentVideo = shell.querySelector("video");
      if (currentVideo) {
        currentVideo.play().catch(function() {});
      }
      return;
    }

    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var source = shell.getAttribute("data-stream");

    if (!video || !source) {
      return;
    }

    shell.setAttribute("data-ready", "1");

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        }
      });
    } else {
      video.src = source;
    }

    if (cover) {
      cover.hidden = true;
    }

    video.controls = true;
    video.play().catch(function() {});
  }

  shells.forEach(function(shell) {
    var button = shell.querySelector(".player-cover");

    if (button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayer(shell);
      });
    }

    shell.addEventListener("click", function(event) {
      if (event.target.tagName.toLowerCase() === "video") {
        return;
      }

      startPlayer(shell);
    });
  });
})();
