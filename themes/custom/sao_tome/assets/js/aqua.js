(() => {
    const bindAquacultureLinks = () => {
        document.querySelectorAll(".anda-menu-filieres a[href]").forEach((link) => {
            link.addEventListener("click", (event) => {
                const url = new URL(link.href, window.location.href);
                if (
                    url.origin !== window.location.origin ||
                    url.pathname !== window.location.pathname ||
                    !url.hash ||
                    url.hash === "#"
                ) {
                    return;
                }

                const targetId = decodeURIComponent(url.hash.slice(1));
                const target = document.getElementById(targetId);
                const wrapper = link.closest(".ParagraphImmersiveEdito");
                const container = wrapper?.querySelector(
                    '[data-immersive-edito-component="container"]',
                );
                const content = wrapper?.querySelector(
                    '[data-immersive-edito-component="content"]',
                );

                if (!target || !wrapper || !container || !content) {
                    return;
                }

                let destination;
                if (window.matchMedia("(min-width: 768px)").matches) {
                    const scrollTrigger = window.ScrollTrigger
                        ?.getAll()
                        .find((item) => item.trigger === container);

                    if (!scrollTrigger) {
                        console.error(
                            "Aquaculture panel navigation could not find its ScrollTrigger.",
                        );
                        return;
                    }

                    const maxHorizontalShift = content.offsetWidth - wrapper.offsetWidth;
                    if (maxHorizontalShift > 0) {
                        const targetOffset =
                            target.getBoundingClientRect().left -
                            content.getBoundingClientRect().left;
                        const progress = Math.min(
                            1,
                            Math.max(0, targetOffset / maxHorizontalShift),
                        );
                        destination =
                            scrollTrigger.start +
                            progress * (scrollTrigger.end - scrollTrigger.start);
                    }
                }

                event.preventDefault();
                if (window.location.hash !== url.hash) {
                    window.history.pushState(null, "", url.hash);
                }

                if (destination !== undefined && window.lenis) {
                    window.lenis.scrollTo(destination, {
                        duration: 1.2,
                        force: true,
                    });
                } else if (destination !== undefined) {
                    window.scrollTo({ top: destination, behavior: "smooth" });
                } else if (window.lenis) {
                    window.lenis.scrollTo(target, {
                        duration: 1.2,
                        force: true,
                    });
                } else {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindAquacultureLinks, {
            once: true,
        });
    } else {
        bindAquacultureLinks();
    }

    const headerFix = document.createElement("script");
    headerFix.src = "/themes/custom/sao_tome/assets/js/fixcss.js";
    headerFix.onerror = () => {
        console.error("Could not load the aquaculture header style fix.");
    };
    document.head.appendChild(headerFix);
})();
