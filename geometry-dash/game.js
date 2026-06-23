const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levels = [
  { id: 1, name: 'Beginner', speed: 3.2, reward: 40, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 900, y: 420, w: 60, h: 100 } ], color: '#5a98ff' },
  { id: 2, name: 'Jump Rush', speed: 4.2, reward: 70, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 840, y: 420, w: 60, h: 100 }, { x: 1040, y: 360, w: 60, h: 160 } ], color: '#ff9f4b' },
  { id: 3, name: 'Turbo', speed: 5.0, reward: 110, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 760, y: 420, w: 60, h: 100 }, { x: 940, y: 360, w: 60, h: 160 }, { x: 1120, y: 300, w: 60, h: 210 } ], color: '#7dff72' }
];

const skins = [
  { id: 'default', name: 'Default', cost: 0, color: '#f7f7ff', emoji: '🙂', expression: 'friendly' },
  { id: 'neon', name: 'Neon', cost: 80, color: '#7dfdfd', emoji: '😎', expression: 'cool' },
  { id: 'solar', name: 'Solar', cost: 120, color: '#ffb74d', emoji: '🔥', expression: 'fiery' },
  { id: 'ice', name: 'Ice', cost: 140, color: '#90d7ff', emoji: '❄️', expression: 'chill' },
  { id: 'shadow', name: 'Shadow', cost: 160, color: '#6f6f8f', emoji: '😈', expression: 'mischief' },
  { id: 'cosmic', name: 'Cosmic', cost: 200, color: '#c08cff', emoji: '🌟', expression: 'starry' },
  { id: 'peach', name: 'Peach', cost: 220, color: '#ff9fb6', emoji: '😊', expression: 'soft' },
  { id: 'lime', name: 'Lime', cost: 240, color: '#9cff6b', emoji: '😁', expression: 'energetic' }
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
  canJump: true,
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
    preview.style.display = 'grid';
    preview.style.placeItems = 'center';
    preview.style.fontSize = '1rem';
    preview.textContent = skin.emoji;

    const details = document.createElement('div');
    details.className = 'skin-details';

    const title = document.createElement('strong');
    title.textContent = skin.name;
    const desc = document.createElement('span');
    desc.textContent = skin.cost === 0 ? `${skin.expression}` : `${skin.cost} coins • ${skin.expression}`;
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
  state.canJump = true;
  state.status = 'Ready';
  state.isRunning = false;
  createSkinCards();
  updateUI();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#09111c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  const px = state.player.x;
  const py = state.player.y;
  const size = state.player.w;
  ctx.fillStyle = skin.color;
  ctx.fillRect(px, py, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.strokeRect(px, py, size, size);

  ctx.fillStyle = '#000';
  const eyeOffset = skin.expression === 'surprised' ? 26 : 24;
  ctx.beginPath();
  ctx.arc(px + 10, py + 12, 3, 0, Math.PI * 2);
  ctx.arc(px + eyeOffset, py + 12, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (skin.expression === 'cool') {
    ctx.moveTo(px + 6, py + 16);
    ctx.lineTo(px + 12, py + 18);
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 16, py + 10, 8, 4);
  } else if (skin.expression === 'mischief') {
    ctx.moveTo(px + 8, py + 20);
    ctx.quadraticCurveTo(px + 16, py + 24, px + 24, py + 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + 9, py + 11);
    ctx.lineTo(px + 13, py + 13);
    ctx.moveTo(px + 26, py + 11);
    ctx.lineTo(px + 22, py + 13);
    ctx.stroke();
  } else if (skin.expression === 'starry') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 12);
    ctx.lineTo(px + 11, py + 14);
    ctx.lineTo(px + 9, py + 15);
    ctx.lineTo(px + 12, py + 17);
    ctx.lineTo(px + 7, py + 16);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + 24, py + 12);
    ctx.lineTo(px + 27, py + 14);
    ctx.lineTo(px + 25, py + 15);
    ctx.lineTo(px + 28, py + 17);
    ctx.lineTo(px + 23, py + 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(px + 9, py + 22);
    ctx.lineTo(px + 23, py + 22);
    ctx.stroke();
  } else if (skin.expression === 'chill') {
    ctx.moveTo(px + 8, py + 22);
    ctx.quadraticCurveTo(px + 16, py + 26, px + 24, py + 22);
    ctx.stroke();
  } else if (skin.expression === 'fiery') {
    ctx.moveTo(px + 10, py + 22);
    ctx.lineTo(px + 12, py + 18);
    ctx.lineTo(px + 14, py + 22);
    ctx.lineTo(px + 16, py + 18);
    ctx.lineTo(px + 18, py + 22);
    ctx.stroke();
  } else {
    ctx.moveTo(px + 10, py + 22);
    ctx.quadraticCurveTo(px + 16, py + 26, px + 22, py + 22);
    ctx.stroke();
  }

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

  // Apply gravity
  state.player.vy += state.player.gravity;
  state.player.y += state.player.vy;

  // Check platform collisions
  let onPlatform = false;
  for (const obs of state.obstacles) {
    // Check if player is above platform and falling onto it
    if (state.player.vy >= 0 &&
        state.player.y + state.player.h <= obs.y + 2 &&
        state.player.y + state.player.h + state.player.vy >= obs.y &&
        state.player.x + state.player.w > obs.x - state.scroll &&
        state.player.x < obs.x - state.scroll + obs.w) {
      // Land on platform
      state.player.y = obs.y - state.player.h;
      state.player.vy = 0;
      state.canJump = true;
      onPlatform = true;
    }
  }

  // Keep player from falling below ground
  if (state.player.y + state.player.h >= 480) {
    state.player.y = 480 - state.player.h;
    state.player.vy = 0;
    state.canJump = true;
    onPlatform = true;
  }

  // Lose jump if not on platform
  if (!onPlatform && state.player.vy > 0) {
    state.canJump = false;
  }

  // Scroll world
  state.scroll += state.levelData.speed;
  state.score += Math.round(state.levelData.speed);

  // Move obstacles
  for (const obs of state.obstacles) {
    if (obs.x - state.scroll < -obs.w) {
      obs.x += 1380;
    }
    // Check collision with obstacle side (death)
    if (state.player.x < obs.x - state.scroll + obs.w &&
        state.player.x + state.player.w > obs.x - state.scroll &&
        (state.player.y < obs.y || state.player.y >= obs.y + obs.h)) {
      state.status = 'Crashed';
      state.isRunning = false;
      updateUI();
      setTimeout(() => {
        if (window.confirm('You died! Restart the level?')) {
          buildLevel();
        }
      }, 50);
      return;
    }
  }

  // Level complete
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
      return;
    }
    if (state.canJump) {
      state.player.vy = state.player.jumpPower;
      state.canJump = false;
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
