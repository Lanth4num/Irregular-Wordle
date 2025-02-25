/* Code mainly made by AI */
// Base de données de conjugaison et traduction pour l'ensemble des verbes
const verbData = {};

// Liste des verbes du jeu
const verbs = [
	"beat", "became", "began", "bet", "bit", "bled", "broke", "brought",
	"built", "burnt", "bought", "cast", "caught", "chose", "came", "cost",
	"cut", "did", "drew", "dreamt", "drank", "drove", "ate", "fell", "fed",
	"felt", "fought", "found", "flew", "forbade", "forgot", "forgave", "got",
	"gave", "went", "grew", "hung", "had", "heard", "hid", "hit", "held", "hurt",
	"kept", "knew", "learnt", "left", "let", "lost", "made", "meant", "met", "paid",
	"put", "read", "rose", "ran", "said", "saw", "sold", "sent", "shot", "showed",
	"shut", "sang", "sat", "slept", "smelt", "spoke", "spent", "stole", "swam",
	"took", "taught", "tore", "told", "thought", "threw", "understood", "woke",
	"won", "wrote", "was", "were"
];

const guessLimit = 5;
let solutionWord = "";
let currentRow = 0;
let gameOver = false;
let currentGuess = "";
let gameStartTime = 0;

let currentStreak = 0;
let bestStreak = localStorage.getItem("bestStreak") ? parseInt(localStorage.getItem("bestStreak")) : 0;

const boardElem = document.getElementById("board");
const messageElem = document.getElementById("message");
const scoreBox = document.getElementById("score-box");

function createBoard() {
	boardElem.innerHTML = "";
	for (let i = 0; i < guessLimit; i++) {
		const row = document.createElement("div");
		row.classList.add("row");
		for (let j = 0; j < solutionWord.length; j++) {
			const cell = document.createElement("div");
			cell.classList.add("cell");
			cell.textContent = "";
			row.appendChild(cell);
		}
		boardElem.appendChild(row);
	}
}

function updateScoreBox() {
	scoreBox.textContent = "Meilleur série : " + bestStreak + " | Série actuelle : " + currentStreak;
}

function chooseSolution() {
	const randIndex = Math.floor(Math.random() * verbs.length);
	return verbs[randIndex];
}

// Affiche la fenêtre modale dans le conteneur de la grille,
// avec un titre en fonction du résultat, le contenu d'information et le bouton d'action centré.
function displayVerbInfo(isWin) {
	const boardContainer = document.getElementById("board-container");
	const infoContainer = document.createElement("div");
	infoContainer.id = "verb-info";
	const data = verbData[solutionWord];
	let content = "";
	let title = isWin ? "Well Done !" : "Oh Nooo !";
	if (!data) {
		content = "<p>Données non disponibles pour ce verbe.</p>";
	} else {
		const infoText = "<p><strong>Base verbale :</strong> " + data.base + "</p>" +
										 "<p><strong>Prétérit :</strong> " + data.preterit + "</p>" +
										 "<p><strong>Participe passé :</strong> " + data.past + "</p>" +
										 "<p><strong>Traduction :</strong> " + data.translation + "</p>";
		const imgSrc = isWin 
			? "https://i.ibb.co/5gNjxgKw/db24c795-e74a-4c0d-96f3-a2bab7b35c13-d449fd80-704c-4d7a-94b3-946fe063bc25-v1.png" 
			: "https://i.ibb.co/8DGLL7bT/No.png";
		content = `<div style="display: flex; flex-direction: column; align-items: center;">
									<h3>${title}</h3>
									<div style="display: flex; align-items: center;">
										<div>${infoText}</div>
										<img src="${imgSrc}?transparent=1&palette=1" style="width: 85px; margin-left: 10px;">
									</div>
								</div>`;
	}
	// Création du bouton d'action centré dans la modale
	const modalButton = document.createElement("button");
	modalButton.id = "modal-button";
	modalButton.textContent = isWin ? "Partie suivante" : "Recommencer";
	modalButton.addEventListener("click", () => {
		infoContainer.remove();
		initGame();
	});
	infoContainer.innerHTML = content;
	infoContainer.appendChild(modalButton);
	boardContainer.appendChild(infoContainer);
}

function initGame() {
	const oldInfo = document.getElementById("verb-info");
	if (oldInfo) oldInfo.remove();
	solutionWord = chooseSolution();
	currentRow = 0;
	gameOver = false;
	currentGuess = "";
	messageElem.textContent = "";
	updateScoreBox();
	createBoard();
	clearKeyboardColors();
	enableKeyboard();
	gameStartTime = Date.now();
	console.log("Mot à trouver :", solutionWord);
}

function evaluateGuess(guess, solution) {
	const result = Array(guess.length).fill("absent");
	const solutionLetterCount = {};
	for (let i = 0; i < solution.length; i++) {
		const letter = solution[i];
		solutionLetterCount[letter] = (solutionLetterCount[letter] || 0) + 1;
	}
	for (let i = 0; i < guess.length; i++) {
		if (guess[i] === solution[i]) {
			result[i] = "correct";
			solutionLetterCount[guess[i]]--;
		}
	}
	for (let i = 0; i < guess.length; i++) {
		if (result[i] !== "correct" && solutionLetterCount[guess[i]] > 0) {
			result[i] = "present";
			solutionLetterCount[guess[i]]--;
		}
	}
	return result;
}

function updateCurrentRow() {
	const rowElem = boardElem.children[currentRow];
	for (let i = 0; i < solutionWord.length; i++) {
		const cell = rowElem.children[i];
		cell.textContent = currentGuess[i] || "";
	}
}

function handleGuess() {
	if (gameOver) return;
	if (currentGuess.length !== solutionWord.length) {
		alert("Le mot doit contenir " + solutionWord.length + " lettres.");
		return;
	}
	const evaluation = evaluateGuess(currentGuess, solutionWord);
	const rowElem = boardElem.children[currentRow];
	for (let i = 0; i < evaluation.length; i++) {
		const cell = rowElem.children[i];
		setTimeout(() => {
			cell.classList.add("flip");
			cell.classList.add(evaluation[i]);
			updateKeyColor(cell.textContent, evaluation[i]);
		}, i * 300);
	}
	setTimeout(() => {
		const isWin = (currentGuess === solutionWord);
		if (isWin) {
			gameOver = true;
			currentStreak++;
			if (currentStreak > bestStreak) {
				bestStreak = currentStreak;
				localStorage.setItem("bestStreak", bestStreak);
			}
		} else {
			currentRow++;
			if (currentRow >= guessLimit) {
				gameOver = true;
				currentStreak = 0;
			}
		}
		if (gameOver) {
			displayVerbInfo(isWin);
		}
		currentGuess = "";
	}, evaluation.length * 300 + 300);
}

const keyboardLayout = [
	["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
	["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
	["Delete", "W", "X", "C", "V", "B", "N", "Enter"]
];

function createKeyboard() {
	keyboardLayout.forEach((row, rowIndex) => {
		const rowElem = document.getElementById("row" + (rowIndex + 1));
		row.forEach(key => {
			const keyButton = document.createElement("button");
			keyButton.textContent = key;
			keyButton.classList.add("key");
			keyButton.addEventListener("click", () => handleKey(key));
			rowElem.appendChild(keyButton);
		});
	});
}

function handleKey(key) {
	if (gameOver) return;
	if (key === "Enter") {
		handleGuess();
	} else if (key === "Delete") {
		if (currentGuess.length > 0) {
			currentGuess = currentGuess.slice(0, -1);
			updateCurrentRow();
		}
	} else {
		if (currentGuess.length < solutionWord.length) {
			currentGuess += key.toLowerCase();
			updateCurrentRow();
		}
	}
}

function disableKeyboard() {
	document.querySelectorAll(".key").forEach(key => key.disabled = true);
}

function enableKeyboard() {
	document.querySelectorAll(".key").forEach(key => key.disabled = false);
}

function updateKeyColor(letter, status) {
	document.querySelectorAll(".key").forEach(key => {
		if (key.textContent.toLowerCase() === letter) {
			if (status === "correct") {
				key.style.backgroundColor = "#6aaa64";
				key.style.color = "white";
			} else if (status === "present" && key.style.backgroundColor !== "rgb(106, 170, 100)") {
				key.style.backgroundColor = "#c9b458";
				key.style.color = "white";
			} else if (status === "absent" &&
								key.style.backgroundColor !== "rgb(106, 170, 100)" &&
								key.style.backgroundColor !== "rgb(201, 180, 88)") {
				key.style.backgroundColor = "#787c7e";
				key.style.color = "white";
			}
		}
	});
}

function clearKeyboardColors() {
	document.querySelectorAll(".key").forEach(key => {
		key.style.backgroundColor = "";
		key.style.color = "";
	});
	enableKeyboard();
}

createKeyboard();
updateScoreBox();
initGame();
