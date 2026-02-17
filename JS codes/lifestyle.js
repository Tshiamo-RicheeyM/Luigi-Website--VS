const track = document.getElementById("sliderTrack");
const cards = document.querySelectorAll(".card");
const sliderWindow = document.querySelector(".slider-window");
const progress = document.querySelector(".progress");

let index = 0;
const visibleCards = 3;
const cardWidth = 320;
const intervalTime = 3000;

const maxActiveIndex = cards.length - 1;
const maxTranslateIndex = cards.length - visibleCards;

let autoSlide;

function updateSlider() {
  const translateIndex = Math.min(index, maxTranslateIndex);
  track.style.transform = `translateX(${-translateIndex * cardWidth}px)`;

  cards.forEach(card => card.classList.remove("active"));
  if (cards[index]) {
    cards[index].classList.add("active");
  }
}

function startProgress() {
  progress.style.transition = "none";
  progress.style.width = "0%";

  setTimeout(() => {
    progress.style.transition = `width ${intervalTime}ms linear`;
    progress.style.width = "100%";
  }, 50);
}

function slideRight() {
  if (index < maxActiveIndex) {
    index++;
    updateSlider();
    startProgress();
  } else {
    clearInterval(autoSlide);
    setTimeout(() => {
      index = 0;
      updateSlider();
      startProgress();
      startAutoSlide();
    }, intervalTime);
  }
}

function slideLeft() {
  if (index > 0) {
    index--;
  } else {
    index = maxActiveIndex;
  }
  updateSlider();
  startProgress();
}

function startAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(slideRight, intervalTime);
}

sliderWindow.addEventListener("mouseenter", () => {
  clearInterval(autoSlide);
});

sliderWindow.addEventListener("mouseleave", () => {
  startAutoSlide();
  startProgress();
});

let startX = 0;
let isDragging = false;

sliderWindow.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

sliderWindow.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  handleSwipe(endX);
});

sliderWindow.addEventListener("mousedown", e => {
  isDragging = true;
  startX = e.clientX;
});

sliderWindow.addEventListener("mouseup", e => {
  if (!isDragging) return;
  isDragging = false;
  handleSwipe(e.clientX);
});

function handleSwipe(endX) {
  const diff = startX - endX;
  if (diff > 50) slideRight();
  else if (diff < -50) slideLeft();
}

updateSlider();
startProgress();
startAutoSlide();
