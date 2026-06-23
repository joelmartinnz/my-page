const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuDiv = document.getElementById('menu');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const BLOCK_SIZE = 32;
const GRAVITY = 0.6;
const WOBBLE_STRENGTH = 0.4;

let gameRunning = false;
let world = new Map(); // key: "x,y", value: { color, wobble }
let player = {
  x: 400,
  y: 200,
  vx: 0,
  vy: 0,
  w: 24,
  h: 32,
  jumpPower: -16,
  canJump: false,
  wobbleX: 0,
  wobbleY: 0
};

let keys = { w: false, a: false, s: false, d: false, space: false, arrowUp: false, arrowLeft: false, arrowRight: false };

const blockColors = ['#8B4513', '#90EE90', '#FFD700', '#FF6B6B', '#4169E1', '#FF69B4', '#FFA500'];

function startGame() {
  menuDiv.classList.add('hidden');
  gameRunning = true;
  generateWorld();
  gameLoop();
}

function generateWorld() {
  world.clear();
  
  // Create ground
  for (let x = -50; x < 80; x++) {
    for (let y = 12; y < 20; y++) {
      const colorIdx = (x + y) % blockColors.length;
      setBlock(x, y, blockColors[colorIdx]);
    }
  }

  // Add some random floating islands
  for (let i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * 100) - 25;
    const y = Math.floor(Math.random() * 8) + 2;
    for (let bx = 0; bx < 3; bx++) {
      const colorIdx = Math.floor(Math.random() * blockColors.length);
      setBlock(x + bx, y, blockColors[colorIdx]);
    }
  }
}

function setBlock(x, y, color) {
  const key = `${x},${y}`;
  world.set(key, { color, wobble: Math.random() * 0.5 });
}

function getBlock(x, y) {
  return world.get(`${x},${y}`);
}

function worldToGrid(worldPos) {
  return Math.floor(worldPos / BLOCK_SIZE);
}

function update() {
  // Handle input
  let accel = 0;
  if (keys.a || keys.arrowLeft) accel -= 0.5;
  if (keys.d || keys.arrowRight) accel += 0.5;
  if (keys.w) accel -= 0.5;

  player.vx = Math.max(-6, Math.min(6, player.vx + accel));
  player.vx *= 0.95; // friction

  // Jump
  if ((keys.space || keys.w) && player.canJump) {
    player.vy = player.jumpPower;
    player.canJump = false;
  }

  // Gravity with wobble
  player.vy += GRAVITY;
  player.wobbleY = Math.sin(Date.now() * 0.005) * WOBBLE_STRENGTH;
  player.wobbleX = Math.sin(Date.now() * 0.003) * WOBBLE_STRENGTH;

  // Update position
  player.x += player.vx;
  player.y += player.vy + player.wobbleY;

  // Collision with blocks
  player.canJump = false;
  const minGridX = worldToGrid(player.x - player.w / 2);
  const maxGridX = worldToGrid(player.x + player.w / 2);
  const minGridY = worldToGrid(player.y);
  const maxGridY = worldToGrid(player.y + player.h);

  for (let gx = minGridX; gx <= maxGridX; gx++) {
    for (let gy = minGridY; gy <= maxGridY; gy++) {
      if (!getBlock(gx, gy)) continue;

      const blockX = gx * BLOCK_SIZE;
      const blockY = gy * BLOCK_SIZE;

      // Collision detection
      if (player.x + player.w > blockX &&
          player.x - player.w < blockX + BLOCK_SIZE &&
          player.y + player.h > blockY &&
          player.y < blockY + BLOCK_SIZE) {
        
        // Landing on top
        if (player.vy >= 0 && player.y + player.h - BLOCK_SIZE < blockY + 8) {
          player.y = blockY - player.h;
          player.vy = 0;
          player.canJump = true;
        }
        // Hitting side
        else if (player.vx > 0) {
          player.x = blockX - player.w;
        } else if (player.vx < 0) {
          player.x = blockX + BLOCK_SIZE + player.w;
        }
        // Hitting bottom
        else if (player.vy < 0) {
          player.y = blockY + BLOCK_SIZE;
          player.vy = 0;
        }
      }
    }
  }

  // Bounds
  if (player.y > canvas.height) {
    player.x = 400;
    player.y = 200;
    player.vx = 0;
    player.vy = 0;
  }
}

function render() {
  // Sky
  ctx.fillStyle = 'rgba(135, 206, 235, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw blocks
  const camX = player.x - canvas.width / 2;
  const camY = player.y - canvas.height / 2;

  const minGridX = worldToGrid(camX) - 2;
  const maxGridX = worldToGrid(camX + canvas.width) + 2;
  const minGridY = worldToGrid(camY) - 2;
  const maxGridY = worldToGrid(camY + canvas.height) + 2;

  for (let gx = minGridX; gx <= maxGridX; gx++) {
    for (let gy = minGridY; gy <= maxGridY; gy++) {
      const block = getBlock(gx, gy);
      if (!block) continue;

      const screenX = gx * BLOCK_SIZE - camX;
      const screenY = gy * BLOCK_SIZE - camY;
      
      // Wobble effect
      const wobbleX = Math.sin((gx + gy) * 0.5 + Date.now() * 0.003) * 2;
      const wobbleY = Math.cos((gx + gy) * 0.7 + Date.now() * 0.002) * 2;

      ctx.fillStyle = block.color;
      ctx.fillRect(screenX + wobbleX, screenY + wobbleY, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX + wobbleX, screenY + wobbleY, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
    }
  }

  // Draw player with wobble
  const screenPx = player.x - camX + player.wobbleX;
  const screenPy = player.y - camY + player.wobbleY;

  ctx.fillStyle = '#FF6B9D';
  ctx.beginPath();
  ctx.arc(screenPx, screenPy - 12, player.w / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FFB5D8';
  ctx.fillRect(screenPx - player.w / 2, screenPy - 8, player.w, player.h - 8);

  // Eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(screenPx - 6, screenPy - 12, 2, 0, Math.PI * 2);
  ctx.arc(screenPx + 6, screenPy - 12, 2, 0, Math.PI * 2);
  ctx.fill();

  // Update UI
  document.getElementById('posDisplay').textContent = `Pos: (${Math.floor(player.x)}, ${Math.floor(player.y)})`;
  document.getElementById('velDisplay').textContent = `Vel: (${player.vx.toFixed(1)}, ${player.vy.toFixed(1)})`;
  document.getElementById('blockDisplay').textContent = `Block: (${worldToGrid(player.x)}, ${worldToGrid(player.y)})`;
}

function gameLoop() {
  if (!gameRunning) return;

  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Input handling
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w') keys.w = true;
  if (key === 'a') keys.a = true;
  if (key === 'd') keys.d = true;
  if (key === 's') keys.s = true;
  if (key === ' ') { keys.space = true; e.preventDefault(); }
  if (e.key === 'ArrowUp') { keys.arrowUp = true; e.preventDefault(); }
  if (e.key === 'ArrowLeft') { keys.arrowLeft = true; e.preventDefault(); }
  if (e.key === 'ArrowRight') { keys.arrowRight = true; e.preventDefault(); }
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w') keys.w = false;
  if (key === 'a') keys.a = false;
  if (key === 'd') keys.d = false;
  if (key === 's') keys.s = false;
  if (key === ' ') keys.space = false;
  if (e.key === 'ArrowUp') keys.arrowUp = false;
  if (e.key === 'ArrowLeft') keys.arrowLeft = false;
  if (e.key === 'ArrowRight') keys.arrowRight = false;
});

// Click to place/destroy blocks
canvas.addEventListener('click', (e) => {
  const camX = player.x - canvas.width / 2;
  const camY = player.y - canvas.height / 2;
  const worldX = e.clientX + camX;
  const worldY = e.clientY + camY;
  const gridX = worldToGrid(worldX);
  const gridY = worldToGrid(worldY);

  if (!getBlock(gridX, gridY)) {
    const colorIdx = Math.floor(Math.random() * blockColors.length);
    setBlock(gridX, gridY, blockColors[colorIdx]);
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const camX = player.x - canvas.width / 2;
  const camY = player.y - canvas.height / 2;
  const worldX = e.clientX + camX;
  const worldY = e.clientY + camY;
  const gridX = worldToGrid(worldX);
  const gridY = worldToGrid(worldY);
  world.delete(`${gridX},${gridY}`);
});
