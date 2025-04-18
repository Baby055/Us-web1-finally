document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const wordDisplay = document.getElementById('word-display');
    const inputField = document.getElementById('input-field');
    const timeDisplay = document.getElementById('time');
    const wpmDisplay = document.getElementById('wpm');
    const scoreDisplay = document.getElementById('score');
    const timeBar = document.getElementById('time-bar');
    const resultsDisplay = document.getElementById('results');
    const modeSelector = document.getElementById('mode');
    const challengeWord = document.getElementById('challenge-word');
    const restartBtn = document.getElementById('restart-btn');

    // Variables du jeu
    let timeLeft = 0;
    let timer;
    let isPlaying = false;
    let score = 0;
    let wordsTyped = 0;
    let currentWord = '';
    let startTime;
    let lastTypedTime = 0;
    let typingSpeeds = [];
    let averageTypingSpeed = 0;
    
    const difficultySettings = {
      easy: { 
        time: 15, 
        words: ['chat', 'chien', 'maison', 'arbre', 'fleur', 'soleil', 'lune', 'ciel', 'terre', 'eau'],
        baseSpeed: 30 // vitesse de référence pour 100%
      },
      medium: { 
        time: 12, 
        words: ['ordinateur', 'programmation', 'développeur', 'interface', 'algorithme', 
                'réseau', 'système', 'base de données', 'application', 'technologie'],
        baseSpeed: 20
      },
      hard: { 
        time: 10, 
        words: ['anticonstitutionnellement', 'phénoménologie', 'épistémologique', 
                'incompréhensibilité', 'internationalisation', 'interdisciplinarité',
                'contemporanéité', 'institutionnalisation', 'désintermédiation'],
        baseSpeed: 10
      }
    };
    let currentDifficulty = 'easy';

    // Initialisation du jeu
    function initGame() {
      restartBtn.style.display = 'none';
      currentDifficulty = modeSelector.value;
      const settings = difficultySettings[currentDifficulty];
      
      timeLeft = settings.time;
      updateTimeDisplay();
      inputField.value = '';
      resultsDisplay.textContent = '';
      score = 0;
      wordsTyped = 0;
      typingSpeeds = [];
      averageTypingSpeed = 0;
      updateScore();
      updateSpeed();
      
      // Afficher le premier mot directement
      currentWord = settings.words[Math.floor(Math.random() * settings.words.length)];
      wordDisplay.textContent = currentWord;
      wordDisplay.style.color = 'var(--correct)';
      
      // Afficher un exemple de mot difficile
      challengeWord.textContent = "Exemple: " + settings.words[Math.floor(Math.random() * settings.words.length)];
      challengeWord.style.display = 'block';
      
      inputField.setAttribute('placeholder', 'Appuyez sur Entrée pour commencer...');
      inputField.disabled = false;
      
      // Configurer l'écouteur d'événement pour commencer
      inputField.addEventListener('keypress', startGameOnEnter);
    }

    // Démarrer le jeu quand l'utilisateur appuie sur Entrée
    function startGameOnEnter(e) {
      if (e.key === 'Enter') {
        inputField.removeEventListener('keypress', startGameOnEnter);
        startGame();
      }
    }

    // Démarrer le jeu
    function startGame() {
      if (isPlaying) return;
      
      isPlaying = true;
      challengeWord.style.display = 'none';
      inputField.setAttribute('placeholder', 'Tapez le mot ici...');
      
      // Démarrer le timer
      startTimer();
      
      // Générer le premier mot
      newWord();
      
      // Focus sur le champ de saisie
      inputField.focus();
      
      // Enregistrer l'heure de début pour calculer le WPM
      startTime = Date.now();
      lastTypedTime = startTime;
    }

    // Générer un nouveau mot
    function newWord() {
      const settings = difficultySettings[currentDifficulty];
      currentWord = settings.words[Math.floor(Math.random() * settings.words.length)];
      wordDisplay.textContent = currentWord;
      wordDisplay.classList.remove('correct', 'wrong');
      inputField.value = '';
    }

    // Mettre à jour l'affichage du temps
    function updateTimeDisplay() {
      timeDisplay.textContent = `${timeLeft} s`;
      const percentage = (timeLeft / difficultySettings[currentDifficulty].time) * 100;
      timeBar.style.width = `${percentage}%`;
      
      // Changement de couleur selon le temps restant
      if (timeLeft <= 5) {
        timeBar.style.background = 'var(--error)';
      } else if (timeLeft <= 10) {
        timeBar.style.background = 'var(--accent)';
      } else {
        timeBar.style.background = 'linear-gradient(90deg, var(--accent), var(--primary))';
      }
    }

    // Mettre à jour le score
    function updateScore() {
      scoreDisplay.textContent = score;
    }

    // Mettre à jour la vitesse en pourcentage
    function updateSpeed() {
      if (typingSpeeds.length > 0) {
        const sum = typingSpeeds.reduce((a, b) => a + b, 0);
        averageTypingSpeed = Math.round(sum / typingSpeeds.length);
      } else {
        averageTypingSpeed = 0;
      }
      
      // Calculer le pourcentage par rapport à la vitesse de base de la difficulté
      const percentage = Math.min(Math.round((averageTypingSpeed / difficultySettings[currentDifficulty].baseSpeed) * 100), 200);
      wpmDisplay.textContent = percentage;
    }

    // Timer du jeu
    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();
        
        if (timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    }

    // Fin du jeu
    function endGame() {
      clearInterval(timer);
      isPlaying = false;
      inputField.blur();
      inputField.disabled = true;
      wordDisplay.textContent = 'Jeu terminé !';
      wordDisplay.style.color = 'var(--error)';
      resultsDisplay.textContent = `Score final: ${score} | Mots tapés: ${wordsTyped} | Vitesse max: ${Math.max(...typingSpeeds, 0)}%`;
      inputField.setAttribute('placeholder', 'Cliquez sur Rejouer');
      restartBtn.style.display = 'block';
    }

    // Vérifier la saisie de l'utilisateur
    inputField.addEventListener('input', () => {
      if (!isPlaying) return;
      
      const typedText = inputField.value;
      const now = Date.now();
      
      if (typedText === currentWord) {
        // Mot correctement tapé
        wordsTyped++;
        score += currentWord.length * (currentDifficulty === 'easy' ? 1 : currentDifficulty === 'medium' ? 2 : 3);
        
        // Calculer la vitesse pour ce mot (caractères par seconde)
        const timeTaken = (now - lastTypedTime) / 1000; // en secondes
        const charsPerSecond = currentWord.length / timeTaken;
        const speedPercentage = Math.round((charsPerSecond / 5) * 100); // 5 cps = 100%
        
        typingSpeeds.push(speedPercentage);
        
        updateScore();
        updateSpeed();
        
        // Animation de réussite
        wordDisplay.classList.add('correct');
        
        // Réinitialiser le temps pour le prochain mot
        timeLeft = difficultySettings[currentDifficulty].time;
        updateTimeDisplay();
        
        // Nouveau mot après un léger délai
        setTimeout(() => {
          newWord();
          lastTypedTime = Date.now();
        }, 300);
      } else if (currentWord.startsWith(typedText)) {
        // Mot partiellement correct
        wordDisplay.style.color = 'var(--correct)';
      } else {
        // Erreur de frappe
        wordDisplay.style.color = 'var(--error)';
        wordDisplay.classList.add('wrong');
      }
    });

    // Changer la difficulté
    modeSelector.addEventListener('change', () => {
      if (!isPlaying) {
        initGame();
      }
    });

    // Bouton Rejouer
    restartBtn.addEventListener('click', () => {
      initGame();
    });

    // Initialiser le jeu au chargement
    initGame();
  });