document.addEventListener("DOMContentLoaded", () => {

  const teamMembers = [
    { name: "Majida MAAROUF", role: "Directrice" },
    { name: "Fatima AMHASSAR", role: "Chef de Service de la Promotion et la Communication" },
    { name: "Mustafa AMZOUGH", role: "Chef de Département de l'Investissement de la Promotion et des Etudes" },
    { name: "Mohamed Amine MANSOURI", role: "Chef de Service des Etudes" },
    { name: "Abdelkadouss MORCHID", role: "Chef du Département de l’Ingénierie des Projets Aquacoles" },
    { name: "Asmaa JAHID", role: "Chef de Service des Plans d'Aménagements" },
    { name: "Hicham EL OUAZZANI", role: "Chef de Service de l'Appui Technique" },
    { name: "Brahim KARFAL", role: "Chef de Service de la Réglementation et des Autorisations" },
    { name: " Kamar TALBI", role: "Chef de Département des ressources et des systèmes d'information" },
   
  ];

  const cards = document.querySelectorAll(".prfl-card");
  const dots = document.querySelectorAll(".prfl-dot");
  const memberName = document.querySelector(".prfl-member-name");
  const memberRole = document.querySelector(".prfl-member-role");
  
  let currentIndex = 0;
  let isAnimating = false;

  function updateCarousel(newIndex) {
    if (isAnimating) return;
    isAnimating = true;

   
    currentIndex = (newIndex + cards.length) % cards.length;

    // Check if mobile to tighten the spacing
    const isMobile = window.innerWidth <= 768;
    const xGap1 = isMobile ? 140 : 220;
    const xGap2 = isMobile ? 240 : 400;

    cards.forEach((card, i) => {
      let offset = i - currentIndex;
      if (offset > Math.floor(cards.length / 2)) offset -= cards.length;
      if (offset < -Math.floor(cards.length / 2)) offset += cards.length;

      let x = 0, z = 0, scale = 1, opacity = 1, grayscale = 100;
      let zIndex = 10 - Math.abs(offset); 

      // The mapping logic
      if (offset === 0) {
        scale = 1.1; 
        grayscale = 0; 
      } else if (offset === 1) {
        x = xGap1; z = -100; scale = 0.9; opacity = 0.9;
      } else if (offset === -1) {
        x = -xGap1; z = -100; scale = 0.9; opacity = 0.9;
      } else if (offset === 2) {
        x = xGap2; z = -300; scale = 0.8; opacity = 0.7;
      } else if (offset === -2) {
        x = -xGap2; z = -300; scale = 0.8; opacity = 0.7;
      } else {
        x = offset > 0 ? 500 : -500; z = -400; scale = 0.5; opacity = 0;
      }

      gsap.set(card, { zIndex: zIndex });

      // GSAP animate the 3D geometry
      gsap.to(card, {
        x: x,
        z: z,
        scale: scale,
        opacity: opacity,
        filter: `grayscale(${grayscale}%)`,
        duration: 0.8,
        ease: "power3.out"
      });
    });

    // Animate the text smoothly
    gsap.to(".prfl-member-info", {
      opacity: 0,
      y: 10,
      duration: 0.3,
      onComplete: () => {
        memberName.textContent = teamMembers[currentIndex].name;
        memberRole.textContent = teamMembers[currentIndex].role;
        gsap.to(".prfl-member-info", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
      }
    });

    // Update active dot
    dots.forEach((dot, i) => dot.classList.toggle("prfl-active", i === currentIndex));

    setTimeout(() => { isAnimating = false; }, 800);
  }

  // --- EVENT LISTENERS ---

  document.querySelector(".prfl-nav-arrow.prfl-left").addEventListener("click", () => updateCarousel(currentIndex - 1));
  document.querySelector(".prfl-nav-arrow.prfl-right").addEventListener("click", () => updateCarousel(currentIndex + 1));
  
  dots.forEach((dot, i) => dot.addEventListener("click", () => updateCarousel(i)));
  cards.forEach((card, i) => card.addEventListener("click", () => updateCarousel(i)));

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") updateCarousel(currentIndex - 1);
    if (e.key === "ArrowRight") updateCarousel(currentIndex + 1);
  });

  // Smooth Swipe Logic
  let touchStartX = 0;
  document.addEventListener("touchstart", (e) => touchStartX = e.changedTouches[0].screenX);
  document.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) updateCarousel(currentIndex + 1);
    if (touchEndX - touchStartX > 50) updateCarousel(currentIndex - 1);
  });

  // Initialize
  updateCarousel(0);
});