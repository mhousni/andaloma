(() => {
    const style = document.createElement("style");
    style.textContent = `
        html.aqua-popup-open,
        body.aqua-popup-open {
            overflow: hidden !important;
            overscroll-behavior: none;
        }

        .aqua-modal-backdrop {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            height: 100dvh !important;
            font-family: gyst-variable, serif;
            background: rgba(0, 0, 0, 0.46) !important;;
            z-index: 100000 !important;
        }

        .aqua-modal-backdrop:not(.d-none) {
            display: block !important;
        }

        .aqua-modal-dialog {
            position: fixed !important;
            inset: 0 !important;
            z-index: 100001 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 16px !important;
            box-sizing: border-box !important;
            background: transparent !important;
        }

        .aqua-modal-dialog.d-none {
            display: none !important;
        }

        .aqua-modal-dialog > [class^="popupF"] {
            position: relative !important;
            inset: auto !important;
            transform: none !important;
            width: min(900px, calc(100vw - 32px)) !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: calc(100vh - 32px) !important;
            max-height: calc(100dvh - 32px) !important;
            margin: 0 !important;
            overflow: auto !important;
            overscroll-behavior: contain;
            box-sizing: border-box !important;
        }
    `;
    document.head.appendChild(style);

    const initializePopups = () => {
        const popups = [];
        for (let index = 1; index <= 5; index += 1) {
            const backdrop = document.getElementById(`popupF${index}BG`);
            const dialog = document.getElementById(`sectionPopupF${index}`);
            if (!backdrop || !dialog) continue;

            backdrop.classList.add("aqua-modal-backdrop");
            dialog.classList.add("aqua-modal-dialog");
            document.body.append(backdrop, dialog);
            popups.push(dialog);
        }

        let shouldResumeLenis = false;
        const syncPopupState = () => {
            const isOpen = popups.some((dialog) => !dialog.classList.contains("d-none"));
            document.documentElement.classList.toggle("aqua-popup-open", isOpen);
            document.body.classList.toggle("aqua-popup-open", isOpen);

            if (isOpen && window.lenis && !window.lenis.isStopped) {
                shouldResumeLenis = true;
                window.lenis.stop();
            } else if (!isOpen && shouldResumeLenis && window.lenis) {
                shouldResumeLenis = false;
                window.lenis.start();
            }
        };

        document.addEventListener(
            "click",
            (event) => {
                if (!(event.target instanceof Element)) return;
                const isPopupControl = event.target.closest(
                    '[id^="popupF"][id$="Btn"], [id^="popupTeamF"][id$="Close"]',
                );
                if (isPopupControl) requestAnimationFrame(syncPopupState);
            },
            true,
        );

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            const openDialog = popups.find(
                (dialog) => !dialog.classList.contains("d-none"),
            );
            const closeButton = openDialog?.querySelector(".close-popup");
            if (closeButton instanceof HTMLElement) closeButton.click();
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializePopups, { once: true });
    } else {
        initializePopups();
    }
})();