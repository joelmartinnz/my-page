const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levels = [
  { id: 1, speed: 3.2, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 920, y: 420, w: 60, h: 100 } ], color: '#5a98ff' },
  { id: 2, speed: 4.0, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 880, y: 420, w: 60, h: 100 }, { x: 1080, y: 360, w: 60, h: 160 } ], color: '#ff9f4b' },
  { id: 3, speed: 4.7, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 780, y: 420, w: 60, h: 100 }, { x: 980, y: 360, w: 60, h: 160 }, { x: 1180, y: 300, w: 60, h: 210 } ], color: '#7dff72' };

const state = {
  currentLevel: 1,
  isRunning: false,
  score: 0,
  player: { x: 160, y: 420, w: 32, h: 32, vy: 0, jumpPower: -11, gravity: 0.55 },
  obstacles: [],
  scroll: 0,
  status: 'Ready',
};

const levelButtons = document.getElementById('menu');
const levelLabel = document.getElementById('levelLabel');
const scoreLabel = document.getElementById('scoreLabel');
const statusLabel = document.getElementById('statusLabel');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');

function getLevel(id) {
  return levels.find((level) => level.id === id) || levels[0];
}

function updateUI() {
  levelLabel.textContent = state.currentLevel;
  scoreLabel.textContent = state.score;
  statusLabel.textContent = state.status;
}

function buildLevel() {
  const level = getLevel(state.currentLevel);
  state.obstacles = level.obstacles.map((obs) => ({ ...obs }));
  state.player = { x: 160, y: 420, w: 32, h: 32, vy: 0, jumpPower: -11, gravity: 0.55 };
  state.scroll = 0;
  state.score = 0;
  state.status = 'Ready';
  state.isRunning = false;
  updateUI();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#09111c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = '#132038';
  ctx.fillRect(0, 480, canvas.width, 40);

  const level = getLevel(state.currentLevel);
  ctx.fillStyle = level.color;
  for (const obs of state.obstacles) {
    ctx.fillRect(obs.x - state.scroll, obs.y, obs.w, obs.h);
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '18px Inter, system-ui, sans-serif';
  ctx.fillText(`Level ${state.currentLevel}`, 24, 30);
  ctx.fillText(`Score ${state.score}`, 24, 54);
}

function updateLogic() {
  if (!state.isRunning) return;

  state.player.vy += state.player.gravity;
  state.player.y += state.player.vy;
  if (state.player.y > 420) {
    state.player.y = 420;
    state.player.vy = 0;
  }

  const level = getLevel(state.currentLevel);
  const speed = level.speed;
  state.scroll += speed;
  state.score += Math.round(speed);

  for (const obs of state.obstacles) {
    if (obs.x - state.scroll < -obs.w) {
      obs.x += 1280;
    }

    if (collides(state.player, { x: obs.x - state.scroll, y: obs.y, w: obs.w, h: obs.h })) {
      state.status = 'Crashed';
      state.isRunning = false;
      updateUI();
      return;
    }
  }

  if (state.scroll > 1320) {
    state.status = 'Level Complete';
    state.isRunning = false;
    state.currentLevel = Math.min(state.currentLevel + 1, levels.length);
    updateUI();
  }
}

function collides(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function gameLoop() {
  updateLogic();
  drawScene();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    if (!state.isRunning) {
      state.isRunning = true;
      state.status = 'Playing';
      updateUI();
    }
    if (state.player.y >= 420) {
      state.player.vy = state.player.jumpPower;
    }
  }
});

startBtn.addEventListener('click', () => {
  if (!state.isRunning) {
    state.isRunning = true;
    state.status = 'Playing';
    updateUI();
  }
});

restartBtn.addEventListener('click', () => {
  buildLevel();
});

backBtn.addEventListener('click', () => {
  window.location.href = '../index.html';
});

for (const level of levels) {
  const button = document.createElement('button');
  button.textContent = `Level ${level.id}`;
  button.className = 'level-button' + (level.id === state.currentLevel ? ' active' : '');
  button.addEventListener('click', () => {
    state.currentLevel = level.id;
    buildLevel();
    document.querySelectorAll('.level-button').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  });
  levelButtons.appendChild(button);
}

buildLevel();
gameLoop();
