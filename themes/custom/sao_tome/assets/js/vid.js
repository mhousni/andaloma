 (function() {
      const btnLink = document.getElementById('btnVidePA');
      const popup = document.getElementById('videoPopup');
      const video = document.getElementById('video');

      // Open popup on button click
      btnLink.addEventListener('click', function(e) {
        e.preventDefault();
        popup.classList.add('andavid-show');
        video.currentTime = 0;
        video.play().catch(err => {
          console.log("Playback prevented:", err);
        });
      });

      // Close popup when clicking anywhere on the black overlay
      // (but not when clicking the video itself)
      popup.addEventListener('click', function(e) {
        if (e.target === video || video.contains(e.target)) {
          return;
        }
        popup.classList.remove('andavid-show');
        video.pause();
      });

      // Close with Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('andavid-show')) {
          popup.classList.remove('andavid-show');
          video.pause();
        }
      });

      // Pause video when popup is hidden via class mutation
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isVisible = popup.classList.contains('andavid-show');
            if (!isVisible) {
              video.pause();
            }
          }
        });
      });
      observer.observe(popup, { attributes: true });

      // Initial state: ensure video is paused
      video.pause();
    })();