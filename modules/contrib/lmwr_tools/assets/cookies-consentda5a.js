Drupal.behaviors.cookiesConsent = {
    attach(context) {
        context.querySelectorAll('[href="#cookies"]').forEach(link => {
            link.addEventListener('click', ev => {
                ev.preventDefault();
                if(window.axeptioSDK && 'openCookies' in window.axeptioSDK) {
                    window.axeptioSDK.openCookies()
                }
            });
        });
    }
}
