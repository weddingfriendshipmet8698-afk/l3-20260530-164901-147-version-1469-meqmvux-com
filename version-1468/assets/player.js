(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var playButton = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var sourceButtons = Array.from(document.querySelectorAll('[data-source]'));
    var currentSource = shell.dataset.source || (sourceButtons[0] && sourceButtons[0].dataset.source);
    var hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function setActiveSource(source) {
      currentSource = source;
      sourceButtons.forEach(function (button) {
        button.classList.toggle('is-active', button.dataset.source === source);
      });
    }

    function destroyHls() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    }

    function attachSource(source) {
      if (!video || !source) {
        return Promise.reject(new Error('没有可用播放源'));
      }

      destroyHls();
      setActiveSource(source);

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        return new Promise(function (resolve, reject) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error(data.details || 'HLS 加载失败'));
            }
          });
        });
      }

      return Promise.reject(new Error('当前浏览器不支持 HLS 播放'));
    }

    function play() {
      setMessage('正在加载播放源...');
      attachSource(currentSource)
        .then(function () {
          return video.play();
        })
        .then(function () {
          if (playButton) {
            playButton.classList.add('is-hidden');
          }
          setMessage('正在播放');
        })
        .catch(function (error) {
          setMessage(error.message + '，请尝试切换播放源或使用支持 HLS 的浏览器。');
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
        });
    }

    sourceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setActiveSource(button.dataset.source);
        if (!video.paused) {
          play();
        } else {
          setMessage('已选择 ' + button.textContent.trim() + '，点击播放器开始播放。');
        }
      });
    });

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && playButton) {
        playButton.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
