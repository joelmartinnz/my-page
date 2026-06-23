const questions = [
  { q: "Is it a mammal?", yes: 1, no: 2 },
  { q: "Does it bark?", yes: "dog", no: "cat" },
  { q: "Does it fly?", yes: "bird", no: "fish" }
];

let currentQuestion = 0;

function startYesNoGame() {
  const startBtn = document.getElementById('startGame');
  const area = document.getElementById('gameArea');
  if (startBtn) startBtn.style.display = 'none';
  if (area) area.style.display = 'block';
  currentQuestion = 0;
  document.getElementById('question').textContent = questions[currentQuestion].q;
  document.getElementById('gameResult').textContent = '';
}

function answerYes() {
  const next = questions[currentQuestion].yes;
  if (typeof next === 'string') {
    document.getElementById('gameResult').textContent = `I guess it's a ${next}!`;
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('startGame').style.display = 'block';
  } else {
    currentQuestion = next;
    document.getElementById('question').textContent = questions[currentQuestion].q;
  }
}

function answerNo() {
  const next = questions[currentQuestion].no;
  if (typeof next === 'string') {
    document.getElementById('gameResult').textContent = `I guess it's a ${next}!`;
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('startGame').style.display = 'block';
  } else {
    currentQuestion = next;
    document.getElementById('question').textContent = questions[currentQuestion].q;
  }
}
