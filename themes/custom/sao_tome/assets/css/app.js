document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.axx-card');
    const axeLabels = document.querySelectorAll('.axx-axe-label');

    // 1. Initial Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('axx-show');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => {
        observer.observe(card);
    });


    // 2. Interactive Hover Effect
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const axeId = card.getAttribute('data-axe'); 
            
            // Remove active class from all labels
            axeLabels.forEach(label => label.classList.remove('axx-active'));

            // Add active class to matching label
            const targetLabel = document.querySelector(`.axx-axe-${axeId}`);
            if(targetLabel) {
                // targetLabel.classList.add('axx-active');
            }
        });

        card.addEventListener('mouseleave', () => {
            //  axeLabels.forEach(label => label.classList.remove('axx-active'));
        });
    });
});