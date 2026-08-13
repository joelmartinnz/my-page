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
const BASE_SPEED = 350;
const PLAYER_LANE_MIN = -1.5;
const PLAYER_LANE_MAX = 1.5;
const TUNNEL_DEPTH = 1000;
const PLAYER_Y = WORLD_HEIGHT - 110;

let gameState = 'ready';
let score = 0;
let bestScore = Number(localStorage.getItem('run3-best')) || 0;
let speedMultiplier = 1;
let lastTimestamp = 0;
let spawnTimer = 0;
let stars = [];

const player = {
  lane: 0,
  targetLane: 0,
  bob: 0,
  x: WORLD_WIDTH * 0.5,
  y: PLAYER_Y,
};

let obstacles = [];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function makeStars() {
  stars = [];
  for (let i = 0; i < 90; i += 1) {
    stars.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * (WORLD_HEIGHT * 0.7),
      r: 1 + Math.random() * 2,
      a: 0.4 + Math.random() * 0.6,
    });
  }
}

function resetBest() {
  bestText.textContent = String(bestScore);
}

function resetGame() {
  player.lane = 0;
  player.targetLane = 0;
  player.bob = 0;
  player.x = WORLD_WIDTH * 0.5;
  player.y = PLAYER_Y;

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

function moveLane(direction) {
  if (gameState === 'ready') startGame();
  if (gameState !== 'running') return;
  player.targetLane = clamp(player.targetLane + direction, PLAYER_LANE_MIN, PLAYER_LANE_MAX);
}

function spawnObstacle() {
  const gapCenter = (Math.random() * 2 - 1) * 190;
  const gapWidth = 110 + Math.random() * 110;
  obstacles.push({
    z: TUNNEL_DEPTH,
    gapCenter,
    gapWidth,
    passed: false,
  });
}

function update(delta) {
  if (gameState !== 'running') return;

  speedMultiplier = 1 + score * 0.08;
  speedText.textContent = `${speedMultiplier.toFixed(1)}x`;

  player.lane += (player.targetLane - player.lane) * Math.min(1, delta * 12);
  player.bob += delta * 10;
  player.x = WORLD_WIDTH * 0.5 + player.lane * 120;

  spawnTimer += delta;
  const spawnInterval = Math.max(0.72, 1.15 - score * 0.015);
  if (spawnTimer > spawnInterval / speedMultiplier) {
    spawnObstacle();
    spawnTimer = 0;
  }

  for (const obstacle of obstacles) {
    obstacle.z -= BASE_SPEED * speedMultiplier * delta;

    const nearHit = obstacle.z < 120 && obstacle.z > 40;
    const laneDelta = Math.abs(player.lane - obstacle.gapCenter / 190);
    if (nearHit && laneDelta > obstacle.gapWidth / 260) {
      endGame();
      return;
    }

    if (!obstacle.passed && obstacle.z < 30) {
      obstacle.passed = true;
      score += 1;
      scoreText.textContent = String(score);
    }

    if (obstacle.z < -120) {
      obstacles = obstacles.filter((item) => item !== obstacle);
    }
  }
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#2f62d6');
  sky.addColorStop(0.42, '#1d4c9d');
  sky.addColorStop(1, '#091a2f');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  for (const star of stars) {
    ctx.fillStyle = `rgba(255,255,255,${star.a})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTunnel() {
  const horizonY = 150;
  const floorY = WORLD_HEIGHT - 60;

  for (let i = 0; i < 24; i += 1) {
    const d1 = i / 24;
    const d2 = (i + 1) / 24;
    const p1 = 1 - d1;
    const p2 = 1 - d2;

    const width1 = 70 + p1 * 710;
    const width2 = 70 + p2 * 710;
    const y1 = horizonY + (1 - p1) * 230;
    const y2 = horizonY + (1 - p2) * 230;

    ctx.fillStyle = i % 2 === 0 ? 'rgba(11, 25, 45, 0.94)' : 'rgba(17, 34, 58, 0.96)';
    ctx.beginPath();
    ctx.moveTo(WORLD_WIDTH * 0.5 - width1 * 0.5, y1);
    ctx.lineTo(WORLD_WIDTH * 0.5 + width1 * 0.5, y1);
    ctx.lineTo(WORLD_WIDTH * 0.5 + width2 * 0.5, y2);
    ctx.lineTo(WORLD_WIDTH * 0.5 - width2 * 0.5, y2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#091629';
  ctx.fillRect(0, floorY, WORLD_WIDTH, WORLD_HEIGHT - floorY);
}

function drawObstacle(obstacle) {
  const depthRatio = clamp((TUNNEL_DEPTH - obstacle.z) / TUNNEL_DEPTH, 0, 1);
  const baseY = 160 + depthRatio * 200;
  const width = 70 + depthRatio * 520;
  const gapHalf = obstacle.gapWidth * 0.5 * (0.25 + depthRatio * 0.85);

  const x = WORLD_WIDTH * 0.5 + obstacle.gapCenter * (0.12 + depthRatio * 0.8);
  const gapLeft = x - gapHalf;
  const gapRight = x + gapHalf;

  ctx.fillStyle = '#0a1427';
  ctx.fillRect(0, baseY, gapLeft, 50 + depthRatio * 140);
  ctx.fillRect(gapRight, baseY, WORLD_WIDTH - gapRight, 50 + depthRatio * 140);

  ctx.fillStyle = '#0f1d32';
  ctx.fillRect(gapLeft, baseY - 8, gapHalf * 2, 12);
}

function drawPlayer() {
  const bobOffset = Math.sin(player.bob) * 3;
  const x = player.x;
  const y = PLAYER_Y + bobOffset;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#d9dfe8';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f3f9ff';
  ctx.beginPath();
  ctx.arc(-6, -4, 2.5, 0, Math.PI * 2);
  ctx.arc(6, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#101826';
  ctx.beginPath();
  ctx.arc(-6, -4, 1.2, 0, Math.PI * 2);
  ctx.arc(6, -4, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8fe5ff';
  ctx.fillRect(-12, 10, 24, 9);

  ctx.strokeStyle = '#7eaad8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 10);
  ctx.lineTo(-14, 22);
  ctx.moveTo(8, 10);
  ctx.lineTo(14, 22);
  ctx.stroke();

  ctx.restore();
}

function draw() {
  drawBackground();
  drawTunnel();

  for (const obstacle of obstacles) {
    drawObstacle(obstacle);
  }

  drawPlayer();

  if (gameState === 'ready') {
    ctx.fillStyle = 'rgba(5, 12, 22, 0.34)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#ebf9ff';
    ctx.textAlign = 'center';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('Level 2', WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.48);
    ctx.font = '600 18px sans-serif';
    ctx.fillText('Move left and right to dodge the gaps', WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.55);
  }

  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(5, 12, 22, 0.28)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#f3bb57';
    ctx.textAlign = 'center';
    ctx.font = '900 38px sans-serif';
    ctx.fillText('Crash!', WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.48);
    ctx.fillStyle = '#ecf8ff';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(`Final score: ${score}`, WORLD_WIDTH * 0.5, WORLD_HEIGHT * 0.56);
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
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
    event.preventDefault();
    moveLane(-1);
  }

  if (event.code === 'ArrowRight' || event.code === 'KeyD') {
    event.preventDefault();
    moveLane(1);
  }

  if (event.code === 'Space') {
    event.preventDefault();
    if (gameState === 'ready') startGame();
  }
});

canvas.addEventListener('pointerdown', () => startGame());
canvas.addEventListener('pointermove', (event) => {
  if (gameState !== 'running') return;
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  player.targetLane = clamp((x - 0.5) * 4.2, PLAYER_LANE_MIN, PLAYER_LANE_MAX);
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

makeStars();
resetBest();
resetGame();
requestAnimationFrame(loop);
