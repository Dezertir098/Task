const mob_btn = document.querySelector(".mob_btn");
const mob_menu = document.querySelector(".mob_menu");

mob_btn.addEventListener("click", function () {
  mob_menu.classList.toggle("active");
});

const sliderTrack = document.querySelector(".slide_track");
const slides = Array.from(document.querySelectorAll(".slide"));
const slideWidth = slides[0].offsetWidth;

slides.forEach((slide) => {
  const clone = slide.cloneNode(true);
  sliderTrack.appendChild(clone);
});

let currentIndex = 0;

function moveNext() {
  currentIndex++;
  sliderTrack.style.transition = "transform 0.5s ease";
  sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

  if (currentIndex === slides.length) {
    setTimeout(() => {
      sliderTrack.style.transition = "none";
      sliderTrack.style.transform = `translateX(0%)`;
      currentIndex = 0;
    }, 5000);
  }
}

setInterval(moveNext, 10000);
