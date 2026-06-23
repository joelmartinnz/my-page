const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levels = [
  { id: 1, name: 'Beginner', speed: 3.2, reward: 40, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 900, y: 420, w: 60, h: 100 } ], color: '#5a98ff' },
  { id: 2, name: 'Jump Rush', speed: 4.2, reward: 70, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 840, y: 420, w: 60, h: 100 }, { x: 1040, y: 360, w: 60, h: 160 } ], color: '#ff9f4b' },
  { id: 3, name: 'Turbo', speed: 5.0, reward: 110, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 760, y: 420, w: 60, h: 100 }, { x: 940, y: 360, w: 60, h: 160 }, { x: 1120, y: 300, w: 60, h: 210 } ], color: '#7dff72' }
];

const skins = [
  { id: 'default', name: 'Default', cost: 0, color: '#ffffff' },
  { id: 'neon', name: 'Neon', cost: 80, color: '#7dfdfd' },
  { id: 'solar', name: 'Solar', cost: 140, color: '#ffb74d' },
  { id: 'ice', name: 'Ice', cost: 180, color: '#90d7ff' }
];

const state = {
  currentLevel: 1,
  isRunning: false,
  score: 0,
  coins: 0,
  selectedSkin: 'default',
  ownedSkins: new Set(['default']),
  isCustomMode: false,
  customDifficulty: 2,
  player: { x: 160, y: 420, w: 32, h: 32, vy: 0, jumpPower: -13, gravity: 0.55 },
  obstacles: [],
  scroll: 0,
  status: 'Ready',
};

const levelButtons = document.getElementById('menu');
const skinShop = document.getElementById('skinShop');
const levelLabel = document.getElementById('levelLabel');
const scoreLabel = document.getElementById('scoreLabel');
const coinsInfo = document.getElementById('coinsInfo');
const coinsLabel = document.getElementById('coinsLabel');
const skinLabel = document.getElementById('skinLabel');
const statusLabel = document.getElementById('statusLabel');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');
const difficultySlider = document.getElementById('difficultySlider');
const customDifficultyLabel = document.getElementById('customDifficultyLabel');
const randomBtn = document.getElementById('randomBtn');

function getLevel(id) {
  return levels.find((level) => level.id === id) || levels[0];
}

function getSkin(id) {
  return skins.find((skin) => skin.id === id) || skins[0];
}

function updateUI() {
  const levelText = state.isCustomMode ? `Random (${state.customDifficulty})` : `${state.currentLevel}`;
  levelLabel.textContent = levelText;
  scoreLabel.textContent = state.score;
  coinsInfo.textContent = state.coins;
  coinsLabel.textContent = state.coins;
  const skin = getSkin(state.selectedSkin);
  skinLabel.textContent = skin.name;
  statusLabel.textContent = state.status;
  customDifficultyLabel.textContent = state.customDifficulty;
  document.querySelectorAll('.level-button').forEach((button) => {
    const buttonLevel = Number(button.dataset.level);
    button.classList.toggle('active', buttonLevel === state.currentLevel && !state.isCustomMode);
  });
}

function createSkinCards() {
  skinShop.innerHTML = '';
  skins.forEach((skin) => {
    const card = document.createElement('div');
    card.className = 'skin-card';
    if (state.selectedSkin === skin.id) card.classList.add('selected');

    const preview = document.createElement('div');
    preview.className = 'skin-preview';
    preview.style.background = skin.color;

    const details = document.createElement('div');
    details.className = 'skin-details';

    const title = document.createElement('strong');
    title.textContent = skin.name;
    const desc = document.createElement('span');
    desc.textContent = skin.cost === 0 ? 'Free' : `${skin.cost} coins`;
    details.append(title, desc);

    const action = document.createElement('button');
    action.className = 'shop-button';
    action.textContent = state.selectedSkin === skin.id ? 'Selected' : state.ownedSkins.has(skin.id) ? 'Select' : 'Buy';
    if (state.ownedSkins.has(skin.id) || skin.cost === 0) {
      action.disabled = false;
    }

    action.addEventListener('click', () => {
      if (state.ownedSkins.has(skin.id) || skin.cost === 0) {
        state.selectedSkin = skin.id;
        state.status = `Skin selected: ${skin.name}`;
      } else if (state.coins >= skin.cost) {
        state.coins -= skin.cost;
        state.ownedSkins.add(skin.id);
        state.selectedSkin = skin.id;
        state.status = `Purchased ${skin.name}`;
      } else {
        state.status = 'Not enough coins';
      }
      createSkinCards();
      updateUI();
    });

    card.append(preview, details, action);
    skinShop.appendChild(card);
  });
}

function getCustomLevel() {
  const difficulty = state.customDifficulty;
  const speed = 3.2 + difficulty * 1.2;
  const count = 3 + difficulty;
  const obstacles = [];
  let baseX = 620;
  for (let i = 0; i < count; i += 1) {
    const height = 40 + Math.round(Math.random() * 140) + difficulty * 10;
    const y = 480 - height;
    obstacles.push({ x: baseX, y, w: 60, h: height });
    baseX += 180 + Math.round(Math.random() * 100);
  }
  return { speed, reward: 30 + difficulty * 30, obstacles, color: '#d36cff' };
}

function buildLevel() {
  if (state.isCustomMode) {
    const custom = getCustomLevel();
    state.currentLevel = 0;
    state.levelData = custom;
  } else {
    state.levelData = getLevel(state.currentLevel);
  }

  state.obstacles = state.levelData.obstacles.map((obs) => ({ ...obs }));
  state.player = { x: 160, y: 420, w: 32, h: 32, vy: 0, jumpPower: -13, gravity: 0.55 };
  state.scroll = 0;
  state.score = 0;
  state.status = 'Ready';
  state.isRunning = false;
  createSkinCards();
  updateUI();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#09111c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#132038';
  ctx.fillRect(0, 480, canvas.width, 40);

  ctx.fillStyle = state.levelData.color;
  for (const obs of state.obstacles) {
    const x = obs.x - state.scroll;
    ctx.fillRect(x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.strokeRect(x, obs.y, obs.w, obs.h);
  }

  const skin = getSkin(state.selectedSkin);
  ctx.fillStyle = skin.color;
  ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(state.player.x, state.player.y, state.player.w, state.player.h);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '18px Inter, system-ui, sans-serif';
  ctx.fillText(`Level ${state.isCustomMode ? 'Random' : state.currentLevel}`, 24, 30);
  ctx.fillText(`Score ${state.score}`, 24, 54);
  ctx.fillText(`Coins ${state.coins}`, 24, 78);
}

function handleLevelComplete() {
  state.status = 'Level Complete';
  state.isRunning = false;
  state.coins += state.levelData.reward;

  if (!state.isCustomMode) {
    if (state.currentLevel < levels.length) {
      state.currentLevel += 1;
      state.status = `Level done! Earned ${state.levelData.reward} coins.`;
    } else {
      state.status = `Final level done! Earned ${state.levelData.reward} coins.`;
    }
  } else {
    state.status = `Random level done! Earned ${state.levelData.reward} coins.`;
  }

  createSkinCards();
  updateUI();
}

function updateLogic() {
  if (!state.isRunning) return;

  state.player.vy += state.player.gravity;
  state.player.y += state.player.vy;
  if (state.player.y > 420) {
    state.player.y = 420;
    state.player.vy = 0;
  }

  state.scroll += state.levelData.speed;
  state.score += Math.round(state.levelData.speed);

  for (const obs of state.obstacles) {
    if (obs.x - state.scroll < -obs.w) {
      obs.x += 1380;
    }
    if (collides(state.player, { x: obs.x - state.scroll, y: obs.y, w: obs.w, h: obs.h })) {
      state.status = 'Crashed';
      state.isRunning = false;
      updateUI();
      return;
    }
  }

  if (state.scroll > 1320) {
    handleLevelComplete();
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

difficultySlider.addEventListener('input', (event) => {
  state.customDifficulty = Number(event.target.value);
  customDifficultyLabel.textContent = state.customDifficulty;
  if (state.isCustomMode) buildLevel();
});

randomBtn.addEventListener('click', () => {
  state.isCustomMode = true;
  buildLevel();
  document.querySelectorAll('.level-button').forEach((button) => button.classList.remove('active'));
});

for (const level of levels) {
  const button = document.createElement('button');
  button.dataset.level = level.id;
  button.innerHTML = `<strong>Level ${level.id}</strong><span style="font-size:0.85rem; color:#aacfff; margin-top:6px;">${level.name}</span>`;
  button.className = 'level-button' + (level.id === state.currentLevel ? ' active' : '');
  button.addEventListener('click', () => {
    state.isCustomMode = false;
    state.currentLevel = level.id;
    buildLevel();
    document.querySelectorAll('.level-button').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
  });
  levelButtons.appendChild(button);
}

buildLevel();
gameLoop();
