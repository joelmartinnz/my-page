const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');
const scoreText = document.getElementById('scoreText');
const bestText = document.getElementById('bestText');
const speedText = document.getElementById('speedText');

const WORLD_WIDTH = canvas.width;
const WORLD_HEIGHT = canvas.height;
const PLAYER_X = 120;
const BASE_SPEED = 4.5;
const GRAVITY = 0.5;
const JUMP_FORCE = -10.8;
const FLOOR_Y = WORLD_HEIGHT - 48;

let gameState = 'ready';
let score = 0;
let bestScore = Number(localStorage.getItem('run3-best')) || 0;
let speedMultiplier = 1;
let lastTimestamp = 0;
let spawnTimer = 0;
let starField = [];

const player = {
  x: PLAYER_X,
  y: FLOOR_Y - 30,
  w: 28,
  h: 30,
  vy: 0,
  grounded: true,
};

let obstacles = [];

function buildStars() {
  starField = [];
  for (let i = 0; i < 65; i += 1) {
    starField.push({
      x: 120 + Math.random() * 520,
      y: 110 + Math.random() * 270,
      r: 1 + Math.random() * 1.5,
      a: 0.35 + Math.random() * 0.65,
    });
  }
}

function resetBest() {
  bestText.textContent = String(bestScore);
}

function resetGame() {
  player.x = PLAYER_X;
  player.y = FLOOR_Y - player.h;
  player.vy = 0;
  player.grounded = true;

  obstacles = [];
  score = 0;
  speedMultiplier = 1;
  spawnTimer = 0;
  scoreText.textContent = '0';
  speedText.textContent = '1.0x';
  statusText.textContent = 'Ready to run';
  gameState = 'ready';
}

function startGame() {
  if (gameState === 'running') return;
  if (gameState === 'gameover') {
    resetGame();
  }
  gameState = 'running';
  statusText.textContent = 'Running';
}

function endGame() {
  gameState = 'gameover';
  statusText.textContent = 'Game over';
  bestScore = Math.max(bestScore, score);
  localStorage.setItem('run3-best', String(bestScore));
  bestText.textContent = String(bestScore);
}

function jump() {
  if (gameState === 'ready') {
    startGame();
  }

  if (gameState !== 'running') return;

  if (player.grounded) {
    player.vy = JUMP_FORCE;
    player.grounded = false;
  }
}

function createObstacle() {
  const gapWidth = 70 + Math.random() * 60;
  const blockWidth = 120 + Math.random() * 100;
  obstacles.push({
    x: WORLD_WIDTH + 50,
    gapWidth,
    blockWidth,
    passed: false,
  });
}

function update(delta) {
  if (gameState !== 'running') return;

  speedMultiplier = 1 + score * 0.04;
  speedText.textContent = `${speedMultiplier.toFixed(1)}x`;

  spawnTimer += delta;
  const spawnInterval = Math.max(0.9, 1.55 - score * 0.03);
  if (spawnTimer > spawnInterval / speedMultiplier) {
    createObstacle();
    spawnTimer = 0;
  }

  player.vy += GRAVITY * 60 * delta;
  player.y += player.vy * 60 * delta;

  const floorTop = FLOOR_Y - player.h;
  if (player.y >= floorTop) {
    player.y = floorTop;
    player.vy = 0;
    player.grounded = true;
  }

  for (const obstacle of obstacles) {
    obstacle.x -= BASE_SPEED * speedMultiplier * delta * 60;

    if (!obstacle.passed && obstacle.x + obstacle.gapWidth < player.x) {
      obstacle.passed = true;
      score += 1;
      scoreText.textContent = String(score);
    }

    const playerLeft = player.x;
    const playerRight = player.x + player.w;
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.gapWidth + obstacle.blockWidth;

    const isOverBlock = playerRight > obstacleLeft && playerLeft < obstacleRight;
    const isOverGap = playerRight > obstacle.x + obstacle.gapWidth && playerLeft < obstacle.x + obstacle.gapWidth + obstacle.blockWidth;

    if (player.y + player.h >= FLOOR_Y && isOverGap) {
      endGame();
      return;
    }

    if (obstacle.x + obstacle.gapWidth + obstacle.blockWidth < -60) {
      obstacles = obstacles.filter((item) => item !== obstacle);
    }
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#5a8de8');
  sky.addColorStop(1, '#4d7ed8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const tunnelX = 200;
  const tunnelY = 70;
  const tunnelW = 500;
  const tunnelH = 300;

  ctx.fillStyle = '#010d1f';
  ctx.fillRect(tunnelX, tunnelY, tunnelW, tunnelH);

  ctx.strokeStyle = 'rgba(130, 180, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(tunnelX, tunnelY, tunnelW, tunnelH);

  for (const star of starField) {
    ctx.fillStyle = `rgba(255,255,255,${star.a})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#020d1c';
  ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, WORLD_HEIGHT - FLOOR_Y);
}

function drawObstacle(obstacle) {
  const leftBlockWidth = obstacle.x;
  const gapStart = obstacle.x + obstacle.gapWidth;
  const rightBlockWidth = WORLD_WIDTH - gapStart - obstacle.blockWidth;

  ctx.fillStyle = '#1f3e6d';
  ctx.fillRect(0, FLOOR_Y, leftBlockWidth, 30);
  ctx.fillRect(gapStart, FLOOR_Y, obstacle.blockWidth, 30);
  ctx.fillRect(WORLD_WIDTH - rightBlockWidth, FLOOR_Y, rightBlockWidth, 30);

  ctx.fillStyle = '#0d2039';
  ctx.fillRect(0, FLOOR_Y, leftBlockWidth, 8);
  ctx.fillRect(gapStart, FLOOR_Y, obstacle.blockWidth, 8);
  ctx.fillRect(WORLD_WIDTH - rightBlockWidth, FLOOR_Y, rightBlockWidth, 8);
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#b4b7bf';
  ctx.beginPath();
  ctx.ellipse(14, 15, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#dfe3e8';
  ctx.beginPath();
  ctx.arc(11, 14, 2, 0, Math.PI * 2);
  ctx.arc(17, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0d1230';
  ctx.beginPath();
  ctx.arc(11, 14, 1, 0, Math.PI * 2);
  ctx.arc(17, 14, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#718199';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(7, 20);
  ctx.lineTo(2, 25);
  ctx.moveTo(21, 20);
  ctx.lineTo(26, 25);
  ctx.stroke();

  ctx.restore();
}

function draw() {
  drawBackground();

  for (const obstacle of obstacles) {
    drawObstacle(obstacle);
  }

  drawPlayer();

  if (gameState === 'ready') {
    ctx.fillStyle = 'rgba(5, 12, 22, 0.32)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#ebf9ff';
    ctx.textAlign = 'center';
    ctx.font = '900 52px sans-serif';
    ctx.fillText('Level 2', WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  }

  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(5, 12, 22, 0.2)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#f4ba54';
    ctx.textAlign = 'center';
    ctx.font = '900 36px sans-serif';
    ctx.fillText('Crash!', WORLD_WIDTH / 2, WORLD_HEIGHT / 2 - 8);
    ctx.fillStyle = '#ecf8ff';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`Final score: ${score}`, WORLD_WIDTH / 2, WORLD_HEIGHT / 2 + 28);
  }
}

function loop(timestamp) {
  const delta = Math.min(0.033, (timestamp - lastTimestamp) / 1000 || 0.016);
  lastTimestamp = timestamp;

  update(delta);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener('pointerdown', jump);
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

buildStars();
resetBest();
resetGame();
requestAnimationFrame(loop);
