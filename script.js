const wordDisplay = document.getElementById("word-display");
const inputField = document.getElementById("input-field");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const modeSelect = document.getElementById("mode");
const endScreen = document.getElementById("end-screen");
const endMessage = document.getElementById("end-message");
const continueBtn = document.getElementById("continue-btn");
const changeDifficultyBtn = document.getElementById("change-difficulty-btn");

const words = {
  easy: [
    "happy", "mouse", "house", "light", "water",
    "music", "apple", "juice", "beach", "smile",
    "heart", "dream", "cloud", "party", "pizza",
    "tiger", "ocean", "radio", "zebra", "candy"
  ],
  medium: [
    "keyboard", "elephant", "sunshine", "mountain", "computer",
    "digital", "awesome", "rainbow", "victory", "warlike",
    "adventure", "birthday", "chocolate", "dinosaur", "fireworks",
    "guitar", "hamburger", "internet", "jellyfish", "kangaroo"
  ],
  hard: [
    "javascript", "extravaganza", "quintessential", "magnificent",
    "phenomenon", "superficial", "highfalutin", "architecture",
    "reactjs", "dependencies", "asynchronous", "blockchain",
    "cryptography", "destructuring", "encyclopedia", "functionality",
    "grandiose", "heterogeneous", "implementation", "juxtaposition"
  ]
};


let currentWord;
let score = 0;
let timeLeft = 10;
let difficulty = "easy";
let gameTimer;
let usedWords = [];
let startTime;
let charactersTyped = 0;
let correctCharacters = 0;


function initGame() {
  difficulty = localStorage.getItem('difficulty') || 'easy';
  modeSelect.value = difficulty;
  usedWords = [];
  score = 0;
  timeLeft = 10;
  charactersTyped = 0;
  correctCharacters = 0;
  
  currentWord = words[difficulty][0];
  usedWords.push(currentWord);
  wordDisplay.textContent = currentWord;
  
  updateDisplay();
  startTimer();
  
  inputField.value = "";
  inputField.focus();
  
  startTime = new Date();
  
  endScreen.style.display = "none";
}

function getNewWord() {
  const availableWords = words[difficulty].filter(word => !usedWords.includes(word));
  
  if (availableWords.length === 0) {
    endGame(true); 
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  currentWord = availableWords[randomIndex];
  usedWords.push(currentWord);
  wordDisplay.textContent = currentWord;
}

function updateDisplay() {
  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft + "s";
  updateWPM();
}

function updateWPM() {
  if (!startTime) return;
  
  const timeElapsed = (new Date() - startTime) / 60000; // en minutes
  const wpm = Math.round((correctCharacters / 5) / timeElapsed) || 0;
  wpmDisplay.textContent = wpm;
}


function calculateAccuracy() {
  return charactersTyped > 0 ? Math.round((correctCharacters / charactersTyped) * 100) : 100;
}


function startTimer() {
  clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    
    if (timeLeft <= 0) {
      endGame(false); // Temps écoulé
    }
  }, 1000);
}

function endGame(completedAllWords) {
  clearInterval(gameTimer);
  const accuracy = calculateAccuracy();
  
  if (completedAllWords) {
    endMessage.innerHTML = `
      <h2>Niveau terminé!</h2>
      <p>Vous avez complété tous les mots en mode ${difficulty}!</p>
      <p>Score: ${score}</p>
      <p>Vitesse: ${wpmDisplay.textContent} mots/minute</p>
      <p>Précision: ${accuracy}%</p>
    `;
    continueBtn.style.display = "none";
  } else {
    endMessage.innerHTML = `
      <h2>Temps écoulé!</h2>
      <p>Score: ${score}</p>
      <p>Vitesse: ${wpmDisplay.textContent} mots/minute</p>
      <p>Précision: ${accuracy}%</p>
    `;
    continueBtn.style.display = "block";
  }
  
  endScreen.style.display = "flex";
}


inputField.addEventListener("input", (e) => {
  const typedText = e.target.value;
  charactersTyped++;
  
  if (typedText === currentWord) {
    correctCharacters += currentWord.length;
    score++;
    e.target.value = "";
    updateDisplay();
    
    if (difficulty === "easy") timeLeft += 5;
    else if (difficulty === "medium") timeLeft += 3;
    else timeLeft += 2;
    
    getNewWord();
  } else if (!currentWord.startsWith(typedText)) {
    e.target.value = "";
  }
});


continueBtn.addEventListener("click", initGame);


changeDifficultyBtn.addEventListener("click", () => {
  if (difficulty === "easy") difficulty = "medium";
  else if (difficulty === "medium") difficulty = "hard";
  else difficulty = "easy";
  
  modeSelect.value = difficulty;
  localStorage.setItem('difficulty', difficulty);
  initGame();
});

modeSelect.addEventListener("change", () => {
  difficulty = modeSelect.value;
  localStorage.setItem('difficulty', difficulty);
  initGame();
});

window.addEventListener("DOMContentLoaded", initGame);