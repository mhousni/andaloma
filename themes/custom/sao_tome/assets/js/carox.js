   (function() {
      // ─── Generic setup for an auto‑scrolling carousel ───
      function setupCarousel(slider, direction) {
        if (!slider) return;

        slider.setAttribute('data-lenis-prevent-touch', '');

        // 1. Duplicate original items for infinite loop
        const originalItems = Array.from(slider.querySelectorAll('.caroxs-item'));
        originalItems.forEach(item => {
          const clone = item.cloneNode(true);
          slider.appendChild(clone);
        });

        let isDown = false;
        let startX;
        let scrollLeft;
        let isJumping = false;
        let halfScrollWidth = 0;

        // Auto‑scroll speed (px per frame)
        const SCROLL_SPEED = 1.2;
        const step = direction === 'left' ? -SCROLL_SPEED : SCROLL_SPEED;

        function updateHalfWidth() {
          if (slider.children.length === 0) return;
          halfScrollWidth = slider.scrollWidth / 2;
        }

        setTimeout(updateHalfWidth, 50);
        window.addEventListener('resize', updateHalfWidth);
        window.addEventListener('load', updateHalfWidth);

        // ─── Infinite scroll handler (for drag/auto) ───
        function handleInfiniteScroll() {
          if (isJumping) return;
          if (halfScrollWidth <= 0) return;

          const setWidth = halfScrollWidth;
          const maxScroll = slider.scrollWidth - slider.clientWidth;

          if (maxScroll < setWidth) return;

          if (slider.scrollLeft >= setWidth) {
            isJumping = true;
            slider.scrollLeft -= setWidth;
            requestAnimationFrame(() => { isJumping = false; });
          } else if (slider.scrollLeft < 0) {
            isJumping = true;
            slider.scrollLeft += setWidth;
            requestAnimationFrame(() => { isJumping = false; });
          }
        }

        slider.addEventListener('scroll', () => {
          requestAnimationFrame(handleInfiniteScroll);
        });

        // ─── Auto‑scroll loop ───
        let isPaused = false;
        let autoScrollFrameId = null;

        function autoScrollTick() {
          if (isPaused || isDown) {
            autoScrollFrameId = requestAnimationFrame(autoScrollTick);
            return;
          }

          // Only scroll if we have enough content
          if (slider.scrollWidth > slider.clientWidth) {
            slider.scrollLeft += step;
            // The scroll event will handle the infinite jump
          }

          autoScrollFrameId = requestAnimationFrame(autoScrollTick);
        }

        // Start auto‑scroll after layout
        function startAutoScroll() {
          if (autoScrollFrameId) cancelAnimationFrame(autoScrollFrameId);
          autoScrollFrameId = requestAnimationFrame(autoScrollTick);
        }

        setTimeout(startAutoScroll, 100);

        // Pause on hover
        slider.addEventListener('mouseenter', () => {
          isPaused = true;
        });
        slider.addEventListener('mouseleave', () => {
          isPaused = false;
        });

        // ─── Mouse drag ───
        slider.addEventListener('mousedown', (e) => {
          e.preventDefault();
          isDown = true;
          isPaused = true;
          slider.classList.add('caroxs-active');
          const rect = slider.getBoundingClientRect();
          startX = e.pageX - rect.left;
          scrollLeft = slider.scrollLeft;
          halfScrollWidth = slider.scrollWidth / 2;
        });

        slider.addEventListener('mouseleave', () => {
          isDown = false;
          slider.classList.remove('caroxs-active');
          // isPaused is set to false by the mouseleave handler above
        });

        slider.addEventListener('mouseup', () => {
          isDown = false;
          slider.classList.remove('caroxs-active');
        });

        slider.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          const rect = slider.getBoundingClientRect();
          const x = e.pageX - rect.left;
          const walk = (x - startX) * 2;
          slider.scrollLeft = scrollLeft - walk;
        });

        // ─── Touch support ───
        let touchStartX = 0;
        let touchStartY = 0;
        let touchAxis = null;
        let touchScrollLeft = 0;

        slider.addEventListener('touchstart', (e) => {
          const touch = e.touches[0];
          const rect = slider.getBoundingClientRect();
          touchStartX = touch.pageX - rect.left;
          touchStartY = touch.pageY - rect.top;
          touchAxis = null;
          touchScrollLeft = slider.scrollLeft;
          isDown = true;
          isPaused = true;
          slider.classList.add('caroxs-active');
          halfScrollWidth = slider.scrollWidth / 2;
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
          if (!isDown) return;
          const touch = e.touches[0];
          const rect = slider.getBoundingClientRect();
          const x = touch.pageX - rect.left;
          const y = touch.pageY - rect.top;
          const deltaX = x - touchStartX;
          const deltaY = y - touchStartY;

          if (!touchAxis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 8) {
            touchAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
          }

          if (touchAxis === 'y') {
            isDown = false;
            isPaused = false;
            slider.classList.remove('caroxs-active');
            return;
          }

          if (touchAxis !== 'x') return;

          e.preventDefault();
          const walk = (x - touchStartX) * 2;
          slider.scrollLeft = touchScrollLeft - walk;
        }, { passive: false });

        slider.addEventListener('touchend', () => {
          isDown = false;
          isPaused = false;
          touchAxis = null;
          slider.classList.remove('caroxs-active');
        });

        slider.addEventListener('touchcancel', () => {
          isDown = false;
          isPaused = false;
          touchAxis = null;
          slider.classList.remove('caroxs-active');
        });

        // Prevent image drag
        slider.querySelectorAll('.caroxs-item img').forEach(img => {
          img.addEventListener('dragstart', (e) => e.preventDefault());
        });

        // ─── Set default scroll position based on direction ───
        function setDefaultPosition() {
          if (!slider || slider.children.length === 0) return;
          const setWidth = slider.scrollWidth / 2;
          if (direction === 'left') {
            // Start in the second set so that decreasing scrollLeft moves left naturally
            slider.scrollLeft = setWidth;
          } else {
            // 'right' direction: start at 0
            slider.scrollLeft = 0;
          }
        }

        setTimeout(setDefaultPosition, 60);
        window.addEventListener('load', () => {
          setTimeout(setDefaultPosition, 30);
        });
      }

      // ─── Initialize both carousels ───
      const rightCarousel = document.getElementById('caroxsDragCarouselRight');
      const leftCarousel = document.getElementById('caroxsDragCarouselLeft');

      if (rightCarousel) setupCarousel(rightCarousel, 'right');
      if (leftCarousel) setupCarousel(leftCarousel, 'left');

      // Ensure correct starting positions after images load
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (leftCarousel) {
            const setWidth = leftCarousel.scrollWidth / 2;
            if (leftCarousel.scrollLeft < setWidth - 10) {
              leftCarousel.scrollLeft = setWidth;
            }
          }
          if (rightCarousel) {
            if (rightCarousel.scrollLeft > 10) {
              rightCarousel.scrollLeft = 0;
            }
          }
        }, 150);
      });

    })();