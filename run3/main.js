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
const BASE_SPEED = 5.2;
const GRAVITY = 0.54;
const JUMP_FORCE = -11.2;
const FLOOR_Y = WORLD_HEIGHT - 52;

let gameState = 'ready';
let score = 0;
let bestScore = Number(localStorage.getItem('run3-best')) || 0;
let speedMultiplier = 1;
let lastTimestamp = 0;
let spawnTimer = 0;
let stars = [];

const player = {
  x: PLAYER_X,
  y: FLOOR_Y - 28,
  w: 28,
  h: 28,
  vy: 0,
  grounded: true,
};

let obstacles = [];

function makeStars() {
  stars = [];
  for (let i = 0; i < 90; i += 1) {
    stars.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * (WORLD_HEIGHT * 0.72),
      r: 1 + Math.random() * 2,
      a: 0.35 + Math.random() * 0.8,
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
  if (gameState === 'gameover') resetGame();
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
  if (gameState === 'ready') startGame();
  if (gameState !== 'running') return;
  if (player.grounded) {
    player.vy = JUMP_FORCE;
    player.grounded = false;
  }
}

function createObstacle() {
  const gapWidth = 70 + Math.random() * 110;
  obstacles.push({
    x: WORLD_WIDTH + 40,
    gapWidth,
    passed: false,
  });
}

function isPlayerOverGap(obstacle) {
  const gapLeft = obstacle.x;
  const gapRight = obstacle.x + obstacle.gapWidth;
  const playerLeft = player.x;
  const playerRight = player.x + player.w;
  return playerRight > gapLeft && playerLeft < gapRight && player.y + player.h >= FLOOR_Y;
}

function update(delta) {
  if (gameState !== 'running') return;

  speedMultiplier = 1 + score * 0.05;
  speedText.textContent = `${speedMultiplier.toFixed(1)}x`;

  spawnTimer += delta;
  const spawnInterval = Math.max(0.9, 1.5 - score * 0.02);
  if (spawnTimer > spawnInterval / speedMultiplier) {
    createObstacle();
    spawnTimer = 0;
  }

  player.vy += GRAVITY * 60 * delta;
  player.y += player.vy * delta * 60;

  if (player.y + player.h >= FLOOR_Y) {
    const isOnSolidGround = !obstacles.some((obstacle) => isPlayerOverGap(obstacle));
    if (isOnSolidGround) {
      player.y = FLOOR_Y - player.h;
      player.vy = 0;
      player.grounded = true;
    } else {
      player.grounded = false;
    }
  } else {
    player.grounded = false;
  }

  for (const obstacle of obstacles) {
    obstacle.x -= BASE_SPEED * speedMultiplier * delta * 60;

    if (!obstacle.passed && obstacle.x + obstacle.gapWidth < player.x) {
      obstacle.passed = true;
      score += 1;
      scoreText.textContent = String(score);
    }

    if (isPlayerOverGap(obstacle)) {
      endGame();
      return;
    }

    if (obstacle.x + obstacle.gapWidth < -60) {
      obstacles = obstacles.filter((item) => item !== obstacle);
    }
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#4f83ea');
  sky.addColorStop(0.48, '#3f6fd4');
  sky.addColorStop(1, '#0d1934');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  for (const star of stars) {
    ctx.fillStyle = `rgba(255,255,255,${star.a})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tunnelGlow = ctx.createRadialGradient(WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.6, 40, WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.6, 340);
  tunnelGlow.addColorStop(0, 'rgba(160, 202, 255, 0.18)');
  tunnelGlow.addColorStop(1, 'rgba(160, 202, 255, 0)');
  ctx.fillStyle = tunnelGlow;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  ctx.fillStyle = '#091b2f';
  ctx.fillRect(0, FLOOR_Y, WORLD_WIDTH, WORLD_HEIGHT - FLOOR_Y);

  for (let i = 0; i < WORLD_WIDTH; i += 38) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(130,200,255,0.12)' : 'rgba(255,255,255,0.08)';
    ctx.fillRect(i, FLOOR_Y + 10, 18, 14);
  }
}

function drawObstacle(obstacle) {
  ctx.fillStyle = '#061521';
  ctx.fillRect(obstacle.x, FLOOR_Y, obstacle.gapWidth, WORLD_HEIGHT - FLOOR_Y);

  ctx.fillStyle = '#193b6e';
  ctx.fillRect(0, FLOOR_Y, obstacle.x, WORLD_HEIGHT - FLOOR_Y);
  ctx.fillRect(obstacle.x + obstacle.gapWidth, FLOOR_Y, WORLD_WIDTH - (obstacle.x + obstacle.gapWidth), WORLD_HEIGHT - FLOOR_Y);

  ctx.fillStyle = '#132d52';
  ctx.fillRect(obstacle.x, FLOOR_Y + 4, obstacle.gapWidth, 8);
}

function drawPlayer() {
  const x = player.x;
  const y = player.y;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#d3d8df';
  ctx.beginPath();
  ctx.ellipse(14, 12, 11, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ecf5ff';
  ctx.beginPath();
  ctx.arc(10, 12, 2.2, 0, Math.PI * 2);
  ctx.arc(18, 12, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0e1325';
  ctx.beginPath();
  ctx.arc(10, 12, 1.1, 0, Math.PI * 2);
  ctx.arc(18, 12, 1.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#7d9cc8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(7, 18);
  ctx.lineTo(2, 24);
  ctx.moveTo(21, 18);
  ctx.lineTo(26, 24);
  ctx.stroke();

  ctx.fillStyle = '#8ee4ff';
  ctx.fillRect(6, 20, 18, 8);

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
    ctx.font = '900 48px sans-serif';
    ctx.fillText('Level 2', WORLD_WIDTH / 2, WORLD_HEIGHT / 2 - 8);
    ctx.font = '600 18px sans-serif';
    ctx.fillText('Press space to leap', WORLD_WIDTH / 2, WORLD_HEIGHT / 2 + 26);
  }

  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(5, 12, 22, 0.28)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#f3bb57';
    ctx.textAlign = 'center';
    ctx.font = '900 38px sans-serif';
    ctx.fillText('Crash!', WORLD_WIDTH / 2, WORLD_HEIGHT / 2 - 8);
    ctx.fillStyle = '#ecf8ff';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(`Final score: ${score}`, WORLD_WIDTH / 2, WORLD_HEIGHT / 2 + 24);
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

makeStars();
resetBest();
resetGame();
requestAnimationFrame(loop);
