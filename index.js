let number,
  program,
  attempt,
  points,
  currentTemplate,
  templates,
  programCodeInput,
  programSelector,
  gameContainer,
  gameCodeDisplay,
  gameAttemptDisplay,
  pointsDisplay,
  prevButton,
  nextButton,
  carousel,
  responseButtons,
  restartButton,
  backButton;

document.addEventListener("DOMContentLoaded", function () {
  fetch("./result.json")
    .then((response) => response.json())
    .then((data) => {
      templates = data;
      generateCarousel(templates);
    })
    .catch((error) => console.error("Error loading JSON:", error));

  programCodeInput = document.getElementById("programCode");
  programSelector = document.getElementById("programSelector");
  gameContainer = document.getElementById("gameContainer");
  gameCodeDisplay = document.querySelector(".game__code");
  gameAttemptDisplay = document.querySelector(".game__attempt");
  pointsDisplay = document.getElementById("pointsDisplay");
  prevButton = document.querySelector(".carousel-control-prev");
  nextButton = document.querySelector(".carousel-control-next");
  carousel = document.querySelector(".carousel-container");
  responseButtons = document.querySelectorAll(".game__button");
  restartButton = document.querySelector(".game__restart");
  backButton = document.querySelector("#backButton");

  backButton.addEventListener("click", function () {
    resetToInitialState();
  });

  prevButton.addEventListener("click", () => {
    carousel.scrollBy({ left: -carousel.offsetWidth, behavior: "smooth" });
  });

  nextButton.addEventListener("click", () => {
    carousel.scrollBy({ left: carousel.offsetWidth, behavior: "smooth" });
  });
  responseButtons.forEach((button) => {
    button.addEventListener("click", function () {
      play(this.textContent);
    });
  });
  restartButton.addEventListener("click", initialize);
  generateCarousel(templates);
  setupCarouselNavigation();
  initialize();
});

document.addEventListener("DOMContentLoaded", (event) => {
  setupCarouselNavigation();
});

function startGame() {
  const programCode = programCodeInput.value;
  const foundProgram = templates.find((t) => t.code === programCode);

  if (foundProgram) {
    currentTemplate = foundProgram.values;
    program = programCode;
    points = 0;
    number = 1;
    attempt = 1;
    programSelector.style.display = "none";
    gameContainer.style.display = "flex";
    updateDisplay();
    playSound("startLevel");
  } else {
    alert("Invalid Program Number!");
  }
}

function play(response) {
  let correctAnswer = currentTemplate[number - 1];

  if (response === correctAnswer) {
    points += calculatePoints(attempt);
    number++;
    attempt = 1;
    playSound("soundCorrect");
  } else {
    if (attempt >= 3) {
      number++;
      attempt = 1;
    } else {
      attempt++;
    }
    playSound("soundWrong");
  }

  if (number > currentTemplate.length) {
    finishGame();
  } else {
    updateDisplay();
  }
}

function calculatePoints(attempt) {
  if (attempt === 1) return 3;
  if (attempt === 2) return 2;
  if (attempt === 3) return 1;
}

function updateDisplay() {
  gameCodeDisplay.textContent = `${program}->${number}:`;
  gameAttemptDisplay.innerHTML = `<b>Attempt ${attempt} of 3</b>`;
  pointsDisplay.textContent = `Points: ${points}`;
}

function initialize() {
  program = null;
  currentTemplate = [];
  points = 0;
  number = 1;
  attempt = 1;

  gameCodeDisplay.textContent = "---";
  gameAttemptDisplay.innerHTML = "<b>Attempt 0 of 3</b>";

  programSelector.style.display = "block";
  gameContainer.style.display = "none";

  programCodeInput.value = "";
}

function populateProgramSelector(programs) {
  programCodeInput.innerHTML = '';

  programs.forEach(template => {
    const option = document.createElement('li');
    option.value = template.code;
    option.textContent = `Program ${template.code}`;
    option.addEventListener('click', function () {
      selectedProgramCode = this.textContent.split(' ')[1]
      programCodeInput.value = selectedProgramCode
      startGame()
    })
    programCodeInput.appendChild(option);
  });
}



function createCarouselItem(pattern) {
  const container = document.createElement("div");
  container.className = "carousel-item";

  const image = document.createElement("img");
  image.src = `./assets/book-${pattern}.jpg`;
  image.alt = `Book ${pattern}`;

  image.addEventListener("click", function () {
    programCodeInput.style.display = "inline";
    backButton.style.display = "inline";

    document.getElementById("carousel-container").style.display = "none";
    document.querySelector(".carousel-control-prev").style.display = "none";
    document.querySelector(".carousel-control-next").style.display = "none";

    const selectedBookPattern = pattern;
    const filteredTemplates = templates.filter(template => template.code.startsWith(selectedBookPattern));

  populateProgramSelector(filteredTemplates)
  });

  const legend = document.createElement("legend");
  legend.textContent = `Book ${pattern}`;
  container.appendChild(legend);
  container.appendChild(image);

  return container;
}

function generateCarousel(templates) {
  const carouselContainer = document.getElementById("carousel-container");
  const patterns = Array.from(
    new Set(templates.map((item) => item.code.substring(0, 2)))
  ).sort();

  carouselContainer.innerHTML = "";

  patterns.forEach((pattern) => {
    const carouselItem = createCarouselItem(pattern);
    carouselContainer.appendChild(carouselItem);
  });
}

function setupCarouselNavigation() {
  const container = document.getElementById("carousel-container");
  const prevButton = container.querySelector(".carousel-control-prev");
  const nextButton = container.querySelector(".carousel-control-next");
  const items = container.querySelectorAll(".carousel-item");

  let currentItemIndex = 0;

  function updateCarousel() {
    items.forEach((item) => (item.style.display = "none"));

    items[currentItemIndex].style.display = "block";
    if (currentItemIndex + 1 < items.length) {
      items[currentItemIndex + 1].style.display = "block";
    }

    prevButton.disabled = currentItemIndex === 0;
    nextButton.disabled = currentItemIndex >= items.length - 1;
  }

  prevButton.addEventListener("click", () => {
    if (currentItemIndex > 0) {
      currentItemIndex--;
      updateCarousel();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentItemIndex < items.length - 1) {
      currentItemIndex++;
      updateCarousel();
    }
  });

  updateCarousel();
}

function finishGame() {
  playSound("endGame");
  alert(`End of Game! Your score was: ${points}`);
  initialize();
}

function playSound(soundId) {
  const sound = document.getElementById(soundId);
  sound.play();
}

function resetToInitialState() {
  initialize();

  document.getElementById("carousel-container").style.display = "flex";
  document.querySelector(".carousel-control-prev").style.display = "block";
  document.querySelector(".carousel-control-next").style.display = "block";
  backButton.style.display = "none"; 
  programCodeInput.style.display = "none";
}