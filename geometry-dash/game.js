const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levels = [
  { id: 1, name: 'Beginner', speed: 3.2, reward: 40, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 900, y: 420, w: 60, h: 100 } ], color: '#5a98ff' },
  { id: 2, name: 'Jump Rush', speed: 4.2, reward: 70, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 840, y: 420, w: 60, h: 100 }, { x: 1040, y: 360, w: 60, h: 160 } ], color: '#ff9f4b' },
  { id: 3, name: 'Turbo', speed: 5.0, reward: 110, obstacles: [ { x: 620, y: 460, w: 60, h: 60 }, { x: 760, y: 420, w: 60, h: 100 }, { x: 940, y: 360, w: 60, h: 160 }, { x: 1120, y: 300, w: 60, h: 210 } ], color: '#7dff72' }
];

const skins = [
  { id: 'default', name: 'Default', cost: 0, color: '#FFD700', emoji: '😊', face: 'smile' },
  { id: 'neon', name: 'Neon', cost: 80, color: '#00FFFF', emoji: '😎', face: 'cool' },
  { id: 'solar', name: 'Solar', cost: 120, color: '#FF6B35', emoji: '🔥', face: 'fierce' },
  { id: 'ice', name: 'Ice', cost: 140, color: '#4DD0E1', emoji: '❄️', face: 'chill' },
  { id: 'shadow', name: 'Shadow', cost: 160, color: '#2C2C54', emoji: '😈', face: 'mischief' },
  { id: 'cosmic', name: 'Cosmic', cost: 200, color: '#9D4EDD', emoji: '✨', face: 'magic' },
  { id: 'peach', name: 'Peach', cost: 220, color: '#FFB3BA', emoji: '🌸', face: 'happy' },
  { id: 'lime', name: 'Lime', cost: 240, color: '#90EE90', emoji: '⚡', face: 'excited' }
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

  // Grid background
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

  // Ground platform
  ctx.fillStyle = '#132038';
  ctx.fillRect(0, 480, canvas.width, 40);

  // Draw obstacles as platforms
  ctx.fillStyle = state.levelData.color;
  for (const obs of state.obstacles) {
    const x = obs.x - state.scroll;
    ctx.fillRect(x, obs.y, obs.w, obs.h);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, obs.y, obs.w, obs.h);
  }

  // Draw player cube with GD-style face
  const skin = getSkin(state.selectedSkin);
  const px = state.player.x;
  const py = state.player.y;
  const size = state.player.w;

  // Cube body
  ctx.fillStyle = skin.color;
  ctx.fillRect(px, py, size, size);
  
  // Cube border/outline
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(px, py, size, size);

  // Draw 3D cube effect
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 2, py + 2);
  ctx.lineTo(px + size - 2, py + 2);
  ctx.lineTo(px + size - 2, py + size - 2);
  ctx.lineTo(px + 2, py + size - 2);
  ctx.closePath();
  ctx.stroke();

  // Draw face based on skin
  drawCubeFace(ctx, px, py, size, skin.face);

  // Score display
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '18px Inter, system-ui, sans-serif';
  ctx.fillText(`Level ${state.isCustomMode ? 'Random' : state.currentLevel}`, 24, 30);
  ctx.fillText(`Score ${state.score}`, 24, 54);
  ctx.fillText(`Coins ${state.coins}`, 24, 78);
}

function drawCubeFace(ctx, x, y, size, faceType) {
  // Eyes
  ctx.fillStyle = '#000';
  const eyeSize = 4;
  const eyeY = y + 10;
  const eyeX1 = x + 8;
  const eyeX2 = x + size - 8;

  ctx.fillRect(eyeX1 - eyeSize / 2, eyeY - eyeSize / 2, eyeSize, eyeSize);
  ctx.fillRect(eyeX2 - eyeSize / 2, eyeY - eyeSize / 2, eyeSize, eyeSize);

  // Mouth based on face type
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const mouthY = y + 20;
  const mouthX = x + size / 2;

  switch (faceType) {
    case 'smile':
      // Happy smile
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 5, 0, Math.PI);
      ctx.stroke();
      break;
    case 'cool':
      // Cool sunglasses effect - rectangles
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(eyeX1 - 4, eyeY - 3, 8, 6);
      ctx.strokeRect(eyeX2 - 4, eyeY - 3, 8, 6);
      ctx.beginPath();
      ctx.moveTo(eyeX1 + 4, eyeY);
      ctx.lineTo(eyeX2 - 4, eyeY);
      ctx.stroke();
      break;
    case 'fierce':
      // Angry face - inverted mouth
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 5, Math.PI, 0);
      ctx.stroke();
      // Angry eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'chill':
      // Relaxed face - wavy mouth
      ctx.beginPath();
      ctx.moveTo(mouthX - 6, mouthY - 1);
      ctx.quadraticCurveTo(mouthX - 3, mouthY + 2, mouthX, mouthY);
      ctx.quadraticCurveTo(mouthX + 3, mouthY + 2, mouthX + 6, mouthY - 1);
      ctx.stroke();
      break;
    case 'mischief':
      // Mischievous grin - off-center smile
      ctx.beginPath();
      ctx.arc(mouthX + 2, mouthY, 5, 0, Math.PI);
      ctx.stroke();
      // Raised eyebrow effect
      ctx.beginPath();
      ctx.moveTo(eyeX1 - 5, eyeY - 3);
      ctx.lineTo(eyeX1 + 5, eyeY - 5);
      ctx.stroke();
      break;
    case 'magic':
      // Magical sparkle eyes
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, eyeSize + 1, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY, eyeSize + 1, 0, Math.PI * 2);
      ctx.fill();
      // Star mouth
      drawStar(ctx, mouthX, mouthY, 4, 3, 2);
      break;
    case 'happy':
      // Big happy smile with wrinkles
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 6, 0, Math.PI);
      ctx.stroke();
      // Happy cheeks
      ctx.strokeStyle = 'rgba(255,100,100,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 4, eyeY + 2, 3, 0, Math.PI * 2);
      ctx.arc(x + size - 4, eyeY + 2, 3, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'excited':
      // Wide excited mouth
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mouthX - 7, mouthY - 2);
      ctx.lineTo(mouthX - 7, mouthY + 4);
      ctx.lineTo(mouthX + 7, mouthY + 4);
      ctx.lineTo(mouthX + 7, mouthY - 2);
      ctx.stroke();
      break;
    default:
      // Default smile
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 5, 0, Math.PI);
      ctx.stroke();
  }
}

function drawStar(ctx, x, y, size, points, innerSize) {
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? size : innerSize;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
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
