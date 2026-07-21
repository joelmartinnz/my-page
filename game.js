const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

class Chunk {
  constructor(x = 0, y = 0, z = 0, size = 16, fillBlock = 'air') {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.blocks = new Array(size * size * size).fill(fillBlock);
  }

  getIndex(localX, localY, localZ) {
    return localY * this.size * this.size + localZ * this.size + localX;
  }

  isInside(localX, localY, localZ) {
    return (
      localX >= 0 &&
      localX < this.size &&
      localY >= 0 &&
      localY < this.size &&
      localZ >= 0 &&
      localZ < this.size
    );
  }

  getBlock(localX, localY, localZ) {
    if (!this.isInside(localX, localY, localZ)) {
      return null;
    }
    return this.blocks[this.getIndex(localX, localY, localZ)];
  }

  setBlock(localX, localY, localZ, blockId) {
    if (!this.isInside(localX, localY, localZ)) {
      return false;
    }
    this.blocks[this.getIndex(localX, localY, localZ)] = blockId;
    return true;
  }
}

class TerrainGenerator {
  constructor(seed = 1) {
    this.seed = seed;
  }

  hash(value) {
    let x = Math.sin(value * 12.9898 + this.seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  noise2D(x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;

    const a = this.hash(ix * 374.0 + iz * 127.1);
    const b = this.hash((ix + 1) * 374.0 + iz * 127.1);
    const c = this.hash(ix * 374.0 + (iz + 1) * 127.1);
    const d = this.hash((ix + 1) * 374.0 + (iz + 1) * 127.1);

    const u = fx * fx * (3 - 2 * fx);
    const v = fz * fz * (3 - 2 * fz);

    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }

  getSurfaceHeight(worldX, worldZ) {
    const baseHeight = 8 + Math.floor(this.noise2D(worldX / 16, worldZ / 16) * 6);
    const ridge = Math.sin(worldX * 0.06) * Math.cos(worldZ * 0.05) * 1.4;
    return baseHeight + Math.floor(ridge);
  }

  generateChunk(chunk) {
    for (let localX = 0; localX < chunk.size; localX += 1) {
      for (let localZ = 0; localZ < chunk.size; localZ += 1) {
        const worldX = chunk.x * chunk.size + localX;
        const worldZ = chunk.z * chunk.size + localZ;
        const surfaceHeight = this.getSurfaceHeight(worldX, worldZ);

        for (let localY = 0; localY < chunk.size; localY += 1) {
          const worldY = chunk.y * chunk.size + localY;
          if (worldY > surfaceHeight) {
            chunk.setBlock(localX, localY, localZ, 'air');
          } else if (worldY === surfaceHeight) {
            chunk.setBlock(localX, localY, localZ, 'grass');
          } else if (worldY >= surfaceHeight - 3) {
            chunk.setBlock(localX, localY, localZ, 'dirt');
          } else {
            chunk.setBlock(localX, localY, localZ, 'stone');
          }
        }
      }
    }

    return chunk;
  }
}

const generator = new TerrainGenerator(7);
const chunk = new Chunk(0, 0, 0, 16, 'air');
generator.generateChunk(chunk);

const player = {
  x: 0,
  y: 1.8,
  z: 0,
  yaw: -0.9,
  pitch: 0,
  speed: 0.06,
  mode: 'first-person',
  inventory: [],
  selectedSlot: 0,
  targetBlock: null
};

const keys = new Set();
let mouseLocked = false;
let leftMousePressed = false;
let rightMousePressed = false;

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
  }
  keys.add(event.key.toLowerCase());
});
window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener('click', () => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  mouseLocked = document.pointerLockElement === canvas;
});

window.addEventListener('mousemove', (event) => {
  if (!mouseLocked) return;
  player.yaw -= event.movementX * 0.0035;
  player.pitch += event.movementY * 0.0035;
  player.pitch = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, player.pitch));
});

canvas.addEventListener('mousedown', (event) => {
  if (event.button === 0) leftMousePressed = true;
  if (event.button === 2) rightMousePressed = true;
});

canvas.addEventListener('mouseup', (event) => {
  if (event.button === 0) leftMousePressed = false;
  if (event.button === 2) rightMousePressed = false;
});

canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

window.addEventListener('keydown', (event) => {
  if (event.key >= '1' && event.key <= '9') {
    player.selectedSlot = parseInt(event.key) - 1;
  }
});

function update() {
  const sprintMultiplier = keys.has('shift') ? 1.65 : 1;
  const movementSpeed = player.speed * sprintMultiplier;
  
  let nextX = player.x;
  let nextZ = player.z;

  if (keys.has('w')) {
    nextX += Math.cos(player.yaw) * movementSpeed;
    nextZ += Math.sin(player.yaw) * movementSpeed;
  }
  if (keys.has('s')) {
    nextX -= Math.cos(player.yaw) * movementSpeed;
    nextZ -= Math.sin(player.yaw) * movementSpeed;
  }
  if (keys.has('a')) {
    nextX -= Math.sin(player.yaw) * movementSpeed;
    nextZ += Math.cos(player.yaw) * movementSpeed;
  }
  if (keys.has('d')) {
    nextX += Math.sin(player.yaw) * movementSpeed;
    nextZ -= Math.cos(player.yaw) * movementSpeed;
  }

  if (!checkBlockCollision(nextX, player.y, nextZ)) {
    player.x = nextX;
    player.z = nextZ;
  }
}

function checkBlockCollision(x, y, z) {
  const checkRadius = 0.3;
  const checkPoints = [
    [x - checkRadius, y, z - checkRadius],
    [x + checkRadius, y, z - checkRadius],
    [x - checkRadius, y, z + checkRadius],
    [x + checkRadius, y, z + checkRadius],
    [x, y, z]
  ];

  for (const [px, py, pz] of checkPoints) {
    const blockX = Math.floor(px);
    const blockY = Math.floor(py);
    const blockZ = Math.floor(pz);
    
    const localX = ((blockX % chunk.size) + chunk.size) % chunk.size;
    const localY = Math.max(0, Math.min(chunk.size - 1, blockY));
    const localZ = ((blockZ % chunk.size) + chunk.size) % chunk.size;
    
    const block = chunk.getBlock(localX, localY, localZ);
    if (block && block !== 'air') {
      return true;
    }
  }
  
  return false;
}

function renderHUD() {
  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText('Voxel World', 20, 32);
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(`Position: ${player.x.toFixed(1)}, ${player.z.toFixed(1)}`, 20, 56);
  ctx.fillText('Click to lock mouse · WASD move · Shift sprint', 20, 78);
}

function render3DScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw sky
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
  sky.addColorStop(0, '#0f2746');
  sky.addColorStop(0.6, '#4472a3');
  sky.addColorStop(1, '#8ec9d8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render visible chunks and blocks in front of player
  const visibleBlocks = [];
  const renderDistance = 4;

  for (let cx = -renderDistance; cx <= renderDistance; cx++) {
    for (let cz = -renderDistance; cz <= renderDistance; cz++) {
      for (let y = 0; y < chunk.size; y++) {
        for (let x = 0; x < chunk.size; x++) {
          for (let z = 0; z < chunk.size; z++) {
            const block = chunk.getBlock(x, y, z);
            if (block && block !== 'air') {
              const worldX = chunk.x * chunk.size + cx * chunk.size + x;
              const worldY = y;
              const worldZ = chunk.z * chunk.size + cz * chunk.size + z;

              const distX = worldX - player.x;
              const distY = worldY - player.y;
              const distZ = worldZ - player.z;
              const dist = Math.sqrt(distX * distX + distZ * distZ);

              if (dist < 12) {
                visibleBlocks.push({
                  x: worldX,
                  y: worldY,
                  z: worldZ,
                  block,
                  dist
                });
              }
            }
          }
        }
      }
    }
  }

  visibleBlocks.sort((a, b) => b.dist - a.dist);

  for (const vblock of visibleBlocks) {
    renderBlock3D(vblock.x, vblock.y, vblock.z, vblock.block);
  }

  renderHUD();
}

function renderBlock3D(worldX, worldY, worldZ, blockType) {
  const relX = worldX - player.x;
  const relY = worldY - player.y + 1.8;
  const relZ = worldZ - player.z;

  const cosYaw = Math.cos(player.yaw);
  const sinYaw = Math.sin(player.yaw);
  const cosPitch = Math.cos(player.pitch);
  const sinPitch = Math.sin(player.pitch);

  let rotX = relX * cosYaw - relZ * sinYaw;
  let rotZ = relX * sinYaw + relZ * cosYaw;
  const tmpY = relY * cosPitch - rotZ * sinPitch;
  rotZ = relY * sinPitch + rotZ * cosPitch;
  const rotY = tmpY;

  if (rotZ <= 0.1) return;

  const scale = 300 / rotZ;
  const screenX = canvas.width / 2 + rotX * scale;
  const screenY = canvas.height / 2 - rotY * scale;
  const blockSize = Math.max(3, 60 / rotZ);

  const colors = {
    grass: { top: '#5fce6b', side: '#3d6b32', side2: '#2a4a1f' },
    dirt: { top: '#9b8b5a', side: '#6b5344', side2: '#4a3a2a' },
    stone: { top: '#909090', side: '#707070', side2: '#505050' }
  };

  const c = colors[blockType] || colors.stone;

  ctx.fillStyle = c.side2;
  ctx.beginPath();
  ctx.moveTo(screenX, screenY + blockSize);
  ctx.lineTo(screenX - blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.lineTo(screenX, screenY);
  ctx.lineTo(screenX + blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = c.top;
  ctx.beginPath();
  ctx.moveTo(screenX, screenY);
  ctx.lineTo(screenX + blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.lineTo(screenX, screenY + blockSize);
  ctx.lineTo(screenX - blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = c.side;
  ctx.beginPath();
  ctx.moveTo(screenX + blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.lineTo(screenX + blockSize * 0.5, screenY + blockSize);
  ctx.lineTo(screenX, screenY + blockSize * 1.5);
  ctx.lineTo(screenX, screenY + blockSize);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(screenX, screenY);
  ctx.lineTo(screenX + blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.moveTo(screenX, screenY);
  ctx.lineTo(screenX - blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.moveTo(screenX, screenY + blockSize);
  ctx.lineTo(screenX + blockSize * 0.5, screenY + blockSize * 0.5);
  ctx.stroke();
}

function render() {
  render3DScene();
}


function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loop();
