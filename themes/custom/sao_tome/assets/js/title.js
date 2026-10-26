(() => {
  const titleSelector =
    ".ParagraphHeaderHP-body-title.title--1, .ParagraphHeaderHP-body-title .title--1";

  function observeTitles() {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const titles = document.querySelectorAll(titleSelector);
    if (!titles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.remove("title-scroll-pending");
            entry.target.classList.add("title-scroll-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.01,
      },
    );

    for (const title of titles) {
      const bounds = title.getBoundingClientRect();
      if (bounds.bottom < 0) {
        title.classList.add("title-scroll-visible");
        continue;
      }

      title.classList.add("title-scroll-pending");
      observer.observe(title);
    }
  }

  function startAfterLoader() {
    if (!document.getElementById("AppLoader")) {
      observeTitles();
      return;
    }

    const loaderWatcher = new MutationObserver(() => {
      if (!document.getElementById("AppLoader")) {
        loaderWatcher.disconnect();
        observeTitles();
      }
    });

    loaderWatcher.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  startAfterLoader();
})();