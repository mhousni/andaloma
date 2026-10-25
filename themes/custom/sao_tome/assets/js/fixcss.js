(() => {
    const style = document.createElement("style");
    style.textContent = `
        body:has(.Immersive) .Header:not(:has(
            .menu-link[aria-expanded="true"],
            .Burger-trigger[aria-expanded="true"],
            .Navbar-content.is-open
        )) {
            --header-color: var(--color-black) !important;
        }

        body:has(.Immersive) .Header:not(:has(
            .menu-link[aria-expanded="true"],
            .Burger-trigger[aria-expanded="true"],
            .Navbar-content.is-open
        )) .Header-content #block-sao-tome-site-branding {
            --logo-filter: none !important;
        }
    `;
    document.head.appendChild(style);
})();