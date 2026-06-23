const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;

function startGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  gameRunning = true;
  gamePaused = false;
  gameOver = false;
  generateFood();
  document.getElementById('gameStatus').textContent = 'Playing...';
  document.getElementById('score').textContent = `Score: ${score}`;
  gameLoop();
}

function togglePause() {
  if (gameRunning && !gameOver) {
    gamePaused = !gamePaused;
    document.getElementById('gameStatus').textContent = gamePaused ? 'PAUSED' : 'Playing...';
  }
}

function generateFood() {
  let validPosition = false;
  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
}

function update() {
  if (!gameRunning || gamePaused || gameOver) return;

  direction = { ...nextDirection };

  // Move snake
  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  // Wrap around edges
  head.x = (head.x + GRID_SIZE) % GRID_SIZE;
  head.y = (head.y + GRID_SIZE) % GRID_SIZE;

  // Check self collision
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
    document.getElementById('score').textContent = `Score: ${score}`;
  } else {
    snake.pop();
  }
}

function endGame() {
  gameRunning = false;
  gameOver = true;
  document.getElementById('gameStatus').textContent = `Game Over! Final Score: ${score}`;
}

function draw() {
  // Background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(i * TILE_SIZE, 0);
    ctx.lineTo(i * TILE_SIZE, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * TILE_SIZE);
    ctx.lineTo(canvas.width, i * TILE_SIZE);
    ctx.stroke();
  }

  // Draw snake
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Head
      ctx.fillStyle = '#4CAF50';
      ctx.shadowColor = 'rgba(76, 175, 80, 0.8)';
      ctx.shadowBlur = 10;
    } else {
      // Body
      ctx.fillStyle = '#45a049';
      ctx.shadowColor = 'none';
    }

    ctx.fillRect(
      segment.x * TILE_SIZE + 1,
      segment.y * TILE_SIZE + 1,
      TILE_SIZE - 2,
      TILE_SIZE - 2
    );

    ctx.shadowColor = 'none';
  });

  // Draw food
  ctx.fillStyle = '#FF5252';
  ctx.shadowColor = 'rgba(255, 82, 82, 0.8)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(
    food.x * TILE_SIZE + TILE_SIZE / 2,
    food.y * TILE_SIZE + TILE_SIZE / 2,
    TILE_SIZE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowColor = 'none';
}

function gameLoop() {
  update();
  draw();

  if (gameRunning) {
    setTimeout(gameLoop, 100);
  }
}

// Input
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();

  if (key === 'arrowup' || key === 'w') {
    if (direction.y === 0) nextDirection = { x: 0, y: -1 };
    e.preventDefault();
  } else if (key === 'arrowdown' || key === 's') {
    if (direction.y === 0) nextDirection = { x: 0, y: 1 };
    e.preventDefault();
  } else if (key === 'arrowleft' || key === 'a') {
    if (direction.x === 0) nextDirection = { x: -1, y: 0 };
    e.preventDefault();
  } else if (key === 'arrowright' || key === 'd') {
    if (direction.x === 0) nextDirection = { x: 1, y: 0 };
    e.preventDefault();
  } else if (key === ' ') {
    togglePause();
    e.preventDefault();
  }
});

// Start with empty canvas
draw();
