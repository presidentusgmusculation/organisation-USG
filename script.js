const carousel = document.querySelector('.carousel');
const viewport = document.querySelector('.carousel-viewport');
const track = document.querySelector('.carousel-track');
const cards = [...document.querySelectorAll('.carousel > .carousel-viewport .category-card')];
const previousButton = document.querySelector('.carousel-arrow--previous');
const nextButton = document.querySelector('.carousel-arrow--next');
const dots = [...document.querySelectorAll('.carousel-section > .carousel-footer .carousel-dot')];
const currentLabel = document.querySelector('.carousel-current');
const carouselSection = document.querySelector('.carousel-section');
const submenuPanels = [...document.querySelectorAll('[data-submenu-panel]')];
const submenuTriggers = [...document.querySelectorAll('[data-open-submenu]')];

let currentIndex = 0;
let carouselRotation = 0;
let carouselVisualRotation = 0;
let carouselAnimationFrame = 0;
let startX = 0;

function updateCarousel({ focusCard = false } = {}) {
  currentIndex = ((currentIndex % cards.length) + cards.length) % cards.length;

  const radius = window.innerWidth <= 620 ? 150 : window.innerWidth <= 900 ? 250 : 330;

  dots.forEach((dot, index) => {
    const isActive = index === currentIndex;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });

  cards.forEach((card, index) => {
    const angle = index * (360 / cards.length) - carouselVisualRotation;
    const radians = angle * Math.PI / 180;
    const x = Math.sin(radians) * radius;
    const z = (Math.cos(radians) - 1) * radius;
    const offset = index === currentIndex ? 0 : Math.abs(index - currentIndex);
    const circularOffset = Math.min(offset, cards.length - offset);
    const y = circularOffset * -8;
    const scale = index === currentIndex ? 1.08 : Math.max(0.72, 1 - circularOffset * 0.08);

    card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-angle}deg) scale(${scale})`;
    card.style.zIndex = String(20 - circularOffset);
    card.classList.toggle('is-active', index === currentIndex);
    card.classList.toggle('is-near', circularOffset === 1);
    card.classList.toggle('is-far', circularOffset > 1);
    card.setAttribute('aria-hidden', String(index !== currentIndex));
    card.tabIndex = index === currentIndex ? 0 : -1;
  });

  currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
  previousButton.disabled = false;
  nextButton.disabled = false;

  if (focusCard) cards[currentIndex].focus();
}

function moveCarousel(direction) {
  carouselRotation += direction * (360 / cards.length);
  currentIndex = (currentIndex + direction + cards.length) % cards.length;
  animateCarouselRotation();
}

function animateCarouselRotation() {
  cancelAnimationFrame(carouselAnimationFrame);
  const startRotation = carouselVisualRotation;
  const targetRotation = carouselRotation;
  const startTime = performance.now();
  const duration = 1100;

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    carouselVisualRotation = startRotation + (targetRotation - startRotation) * eased;
    updateCarousel();

    if (progress < 1) {
      carouselAnimationFrame = requestAnimationFrame(step);
    } else {
      carouselVisualRotation = targetRotation;
      updateCarousel();
    }
  }

  carouselAnimationFrame = requestAnimationFrame(step);
}

previousButton.addEventListener('click', () => moveCarousel(-1));
nextButton.addEventListener('click', () => moveCarousel(1));

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    let offset = index - currentIndex;
    if (offset > cards.length / 2) offset -= cards.length;
    if (offset < -cards.length / 2) offset += cards.length;
    carouselRotation += offset * (360 / cards.length);
    currentIndex = index;
    animateCarouselRotation();
  });
});

carousel.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    moveCarousel(-1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    moveCarousel(1);
  }
});

viewport.addEventListener('pointerdown', (event) => {
  startX = event.clientX;
});

viewport.addEventListener('pointerup', (event) => {
  const distance = event.clientX - startX;
  if (Math.abs(distance) > 45) moveCarousel(distance > 0 ? -1 : 1);
});

function createSubmenuCarousel(panel) {
  const cards = [...panel.querySelectorAll('.submenu-card')];
  const dots = [...panel.querySelectorAll('.submenu-dots .carousel-dot')];
  const currentLabel = panel.querySelector('.submenu-current');
  const totalLabel = panel.querySelector('.submenu-total');
  const previousButton = panel.querySelector('.submenu-arrow--previous');
  const nextButton = panel.querySelector('.submenu-arrow--next');
  const viewport = panel.querySelector('.carousel-viewport');
  const carousel = panel.querySelector('.submenu-carousel');
  const backButton = panel.querySelector('.submenu-back');

  let currentIndex = 0;
  let rotation = 0;
  let visualRotation = 0;
  let animationFrame = 0;
  let startX = 0;

  function update() {
    const radius = window.innerWidth <= 620 ? 150 : 330;

    cards.forEach((card, index) => {
      const angle = index * (360 / cards.length) - visualRotation;
      const radians = angle * Math.PI / 180;
      const x = Math.sin(radians) * radius;
      const z = (Math.cos(radians) - 1) * radius;
      const offset = Math.abs(index - currentIndex);
      const circularOffset = Math.min(offset, cards.length - offset);
      const y = circularOffset * -8;
      const scale = index === currentIndex ? 1.08 : Math.max(0.72, 1 - circularOffset * 0.08);

      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${-angle}deg) scale(${scale})`;
      card.style.zIndex = String(20 - circularOffset);
      card.classList.toggle('is-active', index === currentIndex);
      card.classList.toggle('is-near', circularOffset === 1);
      card.classList.toggle('is-far', circularOffset > 1);
      card.setAttribute('aria-hidden', String(index !== currentIndex));
      card.tabIndex = index === currentIndex ? 0 : -1;
    });

    dots.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });

    currentLabel.textContent = String(currentIndex + 1).padStart(2, '0');
    totalLabel.textContent = String(cards.length).padStart(2, '0');
    previousButton.disabled = cards.length < 2;
    nextButton.disabled = cards.length < 2;
  }

  function animate() {
    cancelAnimationFrame(animationFrame);
    const startRotation = visualRotation;
    const targetRotation = rotation;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      visualRotation = startRotation + (targetRotation - startRotation) * eased;
      update();

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        visualRotation = targetRotation;
        update();
      }
    }

    animationFrame = requestAnimationFrame(step);
  }

  function move(direction) {
    rotation += direction * (360 / cards.length);
    currentIndex = (currentIndex + direction + cards.length) % cards.length;
    animate();
  }

  function goTo(index) {
    let offset = index - currentIndex;
    if (offset > cards.length / 2) offset -= cards.length;
    if (offset < -cards.length / 2) offset += cards.length;
    rotation += offset * (360 / cards.length);
    currentIndex = index;
    animate();
  }

  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => goTo(index)));

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'Escape') {
      closeSubmenu(panel);
    }
  });

  viewport.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
  });
  viewport.addEventListener('pointerup', (event) => {
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
  });

  backButton.addEventListener('click', () => closeSubmenu(panel));

  return {
    refresh() {
      cancelAnimationFrame(animationFrame);
      visualRotation = rotation;
      update();
    },
    reset() {
      currentIndex = 0;
      rotation = 0;
      visualRotation = 0;
      update();
    }
  };
}

const submenuCarousels = new Map(
  submenuPanels.map((panel) => [panel.dataset.submenuPanel, createSubmenuCarousel(panel)])
);

function openSubmenu(name) {
  const panel = submenuPanels.find((submenu) => submenu.dataset.submenuPanel === name);
  const trigger = submenuTriggers.find((card) => card.dataset.openSubmenu === name);
  if (!panel || !trigger) return;

  submenuPanels.forEach((submenu) => {
    const isOpen = submenu === panel;
    submenu.classList.toggle('is-open', isOpen);
    submenu.setAttribute('aria-hidden', String(!isOpen));
  });
  submenuTriggers.forEach((card) => card.setAttribute('aria-expanded', String(card === trigger)));
  carouselSection.classList.add('is-submenu-open');
  submenuCarousels.get(name).reset();
  panel.querySelector('.submenu-back').focus();
}

function closeSubmenu(panel) {
  panel.classList.remove('is-open');
  panel.setAttribute('aria-hidden', 'true');
  carouselSection.classList.remove('is-submenu-open');
  const trigger = submenuTriggers.find((card) => card.dataset.openSubmenu === panel.dataset.submenuPanel);
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  }
}

submenuTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openSubmenu(trigger.dataset.openSubmenu);
  });
});

window.addEventListener('resize', () => {
  cancelAnimationFrame(carouselAnimationFrame);
  carouselVisualRotation = carouselRotation;
  updateCarousel();
  submenuCarousels.forEach((submenuCarousel) => submenuCarousel.refresh());
});
updateCarousel();
submenuCarousels.forEach((submenuCarousel) => submenuCarousel.refresh());
