/* ================================
   SLIDER CORE SETUP
================================ */
const track = document.getElementById("sliderTrack");
const cards = document.querySelectorAll(".card");
const sliderWindow = document.querySelector(".slider-window");
const progress = document.querySelector(".progress");

let index = 0;
const visibleCards = 3;
const cardWidth = 320; // card width + margin
const intervalTime = 3000;

const maxActiveIndex = cards.length - 1;
const maxTranslateIndex = cards.length - visibleCards;

let autoSlide;

/* ================================
   UPDATE SLIDER + ACTIVE CARD
================================ */
function updateSlider() {
  // Prevent empty space
  const translateIndex = Math.min(index, maxTranslateIndex);
  track.style.transform = `translateX(${-translateIndex * cardWidth}px)`;

  // Active (enlarged) card
  cards.forEach(card => card.classList.remove("active"));
  if (cards[index]) {
    cards[index].classList.add("active");
  }
}

/* ================================
   PROGRESS BAR
================================ */
function startProgress() {
  if (!progress) return;

  progress.style.transition = "none";
  progress.style.width = "0%";

  setTimeout(() => {
    progress.style.transition = `width ${intervalTime}ms linear`;
    progress.style.width = "100%";
  }, 50);
}

/* ================================
   SLIDE RIGHT (AUTO + MANUAL)
================================ */
function slideRight() {
  if (index < maxActiveIndex) {
    index++;
    updateSlider();
    startProgress();
  } else {
    // Pause on last card, then restart
    clearInterval(autoSlide);
    setTimeout(() => {
      index = 0;
      updateSlider();
      startProgress();
      startAutoSlide();
    }, intervalTime);
  }
}

/* ================================
   SLIDE LEFT (MANUAL ONLY)
================================ */
function slideLeft() {
  if (index > 0) {
    index--;
  } else {
    index = maxActiveIndex;
  }
  updateSlider();
  startProgress();
}

/* ================================
   AUTO SLIDE CONTROL
================================ */
function startAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(slideRight, intervalTime);
}

/* ================================
   PAUSE ON HOVER
================================ */
sliderWindow.addEventListener("mouseenter", () => {
  clearInterval(autoSlide);
});

sliderWindow.addEventListener("mouseleave", () => {
  startAutoSlide();
  startProgress();
});

/* ================================
   SWIPE / DRAG SUPPORT
================================ */
let startX = 0;
let isDragging = false;

// Touch
sliderWindow.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

sliderWindow.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  handleSwipe(endX);
});

// Mouse
sliderWindow.addEventListener("mousedown", e => {
  isDragging = true;
  startX = e.clientX;
});

sliderWindow.addEventListener("mouseup", e => {
  if (!isDragging) return;
  isDragging = false;
  handleSwipe(e.clientX);
});

// Swipe logic
function handleSwipe(endX) {
  const diff = startX - endX;

  if (diff > 50) {
    slideRight();
  } else if (diff < -50) {
    slideLeft();
  }
}

/* ================================
   INIT
================================ */
updateSlider();     // First card enlarged immediately
startProgress();    // Progress starts immediately
startAutoSlide();   // Auto slideshow starts
