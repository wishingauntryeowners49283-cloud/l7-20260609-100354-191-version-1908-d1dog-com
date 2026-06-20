(function () {
  var libraryUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
  var libraryPromise = null;

  function ensureLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (libraryPromise) {
      return libraryPromise;
    }
    libraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = libraryUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return libraryPromise;
  }

  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var button = shell.querySelector(".play-overlay");
    var source = shell.getAttribute("data-stream");
    var prepared = false;
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        prepared = true;
        shell.classList.add("is-ready");
        return Promise.resolve();
      }
      return ensureLibrary().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          prepared = true;
          shell.classList.add("is-ready");
        } else {
          video.src = source;
          prepared = true;
          shell.classList.add("is-ready");
        }
      });
    }

    function play() {
      prepare().then(function () {
        return video.play();
      }).then(function () {
        shell.classList.add("is-playing");
        button.classList.add("is-hidden");
      }).catch(function () {
        video.controls = true;
      });
    }

    button.addEventListener("click", play);
    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
      button.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
    prepare();
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
