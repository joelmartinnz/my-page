const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CHUNK_SIZE = 24;
const CHUNK_HEIGHT = 24;
const AIR = 'air';
const GRASS = 'grass';
const DIRT = 'dirt';
const STONE = 'stone';
const WOOD = 'wood';
const LEAF = 'leaf';
const WATER = 'water';
const SAND = 'sand';
const WATER_LEVEL = 7;
const SOLID_BLOCKS = [GRASS, DIRT, STONE, WOOD, LEAF, SAND];
const OPAQUE_BLOCKS = [GRASS, DIRT, STONE, WOOD, LEAF, SAND];
const BLOCK_PALETTE = [GRASS, DIRT, STONE, WOOD, LEAF, SAND, WATER];

class Chunk {
  constructor(size = CHUNK_SIZE, height = CHUNK_HEIGHT) {
    this.size = size;
    this.height = height;
    this.blocks = new Array(size * size * height).fill(AIR);
  }

  getIndex(localX, localY, localZ) {
    return (localY * this.size + localZ) * this.size + localX;
  }

  isInside(localX, localY, localZ) {
    return (
      localX >= 0 &&
      localX < this.size &&
      localY >= 0 &&
      localY < this.height &&
      localZ >= 0 &&
      localZ < this.size
    );
  }

  getBlock(localX, localY, localZ) {
    if (!this.isInside(localX, localY, localZ)) return AIR;
    return this.blocks[this.getIndex(localX, localY, localZ)];
  }

  setBlock(localX, localY, localZ, blockId) {
    if (!this.isInside(localX, localY, localZ)) return false;
    this.blocks[this.getIndex(localX, localY, localZ)] = blockId;
    return true;
  }
}

function hash(value) {
  const x = Math.sin(value * 12.9898 + 7.233) * 43758.5453;
  return x - Math.floor(x);
}

function noise2D(x, z) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const a = hash(ix * 374.0 + iz * 127.1);
  const b = hash((ix + 1) * 374.0 + iz * 127.1);
  const c = hash(ix * 374.0 + (iz + 1) * 127.1);
  const d = hash((ix + 1) * 374.0 + (iz + 1) * 127.1);

  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);

  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function noise3D(x, y, z) {
  return (noise2D(x * 0.15, z * 0.15) + noise2D((x + y) * 0.12, (z + y) * 0.11) + noise2D(x * 0.09 + 11, z * 0.09 + 17)) / 3;
}

function getSurfaceHeight(worldX, worldZ) {
  const baseHeight = 7 + Math.floor(noise2D(worldX / 14, worldZ / 14) * 6);
  const ridge = Math.sin(worldX * 0.2) * Math.cos(worldZ * 0.17) * 1.6;
  const detail = Math.floor(noise2D(worldX * 0.35 + 21, worldZ * 0.35 + 7) * 2.8);
  return Math.max(2, Math.floor(baseHeight + detail + ridge));
}

function buildTerrain(chunk) {
  for (let x = 0; x < chunk.size; x += 1) {
    for (let z = 0; z < chunk.size; z += 1) {
      const distanceToCenter = Math.hypot(x - chunk.size / 2, z - chunk.size / 2);
      const lakeFactor = Math.max(0, 1 - distanceToCenter / 7.6);
      const surfaceHeight = getSurfaceHeight(x, z);
      const waterSurface = WATER_LEVEL + Math.floor(lakeFactor * 2.2);
      const effectiveHeight = Math.min(surfaceHeight, waterSurface);
      const isBeach = lakeFactor > 0.22 && effectiveHeight <= waterSurface + 1;

      for (let y = 0; y < chunk.height; y += 1) {
        let block = AIR;
        if (y <= effectiveHeight) {
          if (y === effectiveHeight) {
            block = isBeach ? SAND : GRASS;
          } else if (y >= effectiveHeight - 3) {
            block = isBeach ? SAND : DIRT;
          } else {
            block = STONE;
          }

          if (y < effectiveHeight - 3 && noise3D(x, y, z) > 0.93 + lakeFactor * 0.02) {
            block = AIR;
          }
        }

        if (lakeFactor > 0.1 && y > effectiveHeight && y <= waterSurface) {
          block = WATER;
        }

        chunk.setBlock(x, y, z, block);
      }
    }
  }

  for (let x = 3; x < chunk.size - 3; x += 6) {
    for (let z = 3; z < chunk.size - 3; z += 6) {
      const height = getSurfaceHeight(x, z);
      if (noise2D(x * 0.3 + 4, z * 0.3 + 9) < 0.55) continue;
      if (height < 8) continue;
      for (let y = height + 1; y <= height + 4; y += 1) {
        chunk.setBlock(x, y, z, y === height + 4 ? LEAF : WOOD);
      }
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          if (dx === 0 && dz === 0) continue;
          chunk.setBlock(x + dx, height + 4, z + dz, LEAF);
        }
      }
      chunk.setBlock(x, height + 5, z, LEAF);
    }
  }
}

const chunk = new Chunk();
buildTerrain(chunk);

const player = {
  x: CHUNK_SIZE / 2,
  y: getSurfaceHeight(CHUNK_SIZE / 2, CHUNK_SIZE / 2) + 2.3,
  z: CHUNK_SIZE / 2,
  yaw: -0.9,
  pitch: 0,
  eyeHeight: 1.62,
  height: 1.8,
  speed: 0.06,
  verticalVelocity: 0,
  onGround: true,
};

const keys = new Set();
let mouseLocked = false;
let jumpRequested = false;
let leftMousePressed = false;
let rightMousePressed = false;
let interactionCooldown = 0;
let selectedBlock = GRASS;

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    jumpRequested = true;
  }

  if (event.key >= '1' && event.key <= '7') {
    const index = parseInt(event.key, 10) - 1;
    if (BLOCK_PALETTE[index]) {
      selectedBlock = BLOCK_PALETTE[index];
    }
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

document.addEventListener('pointerlockchange', () => {
  mouseLocked = document.pointerLockElement === canvas;
});

window.addEventListener('mousemove', (event) => {
  if (!mouseLocked) return;
  player.yaw -= event.movementX * 0.0032;
  player.pitch += event.movementY * 0.0032;
  player.pitch = Math.max(-Math.PI / 2.4, Math.min(Math.PI / 2.4, player.pitch));
});

function getWorldBlock(x, y, z) {
  if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT) return AIR;
  return chunk.getBlock(Math.floor(x), Math.floor(y), Math.floor(z));
}

function setWorldBlock(x, y, z, blockType) {
  if (x < 0 || x >= CHUNK_SIZE || z < 0 || z >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT) return false;
  chunk.setBlock(Math.floor(x), Math.floor(y), Math.floor(z), blockType);
  return true;
}

function isSolidBlock(x, y, z) {
  const block = getWorldBlock(x, y, z);
  return SOLID_BLOCKS.includes(block);
}

function isOpaqueBlock(x, y, z) {
  const block = getWorldBlock(x, y, z);
  return OPAQUE_BLOCKS.includes(block);
}

function checkCollision(x, y, z) {
  const radius = 0.28;
  const samplePoints = [
    [x - radius, y + 0.15, z - radius],
    [x + radius, y + 0.15, z - radius],
    [x - radius, y + 0.15, z + radius],
    [x + radius, y + 0.15, z + radius],
    [x, y + 0.7, z],
    [x, y + player.height - 0.1, z],
  ];

  return samplePoints.some(([px, py, pz]) => isSolidBlock(px, py, pz));
}

function castRay() {
  const originX = player.x;
  const originY = player.y + player.eyeHeight;
  const originZ = player.z;
  const dirX = Math.cos(player.yaw) * Math.cos(player.pitch);
  const dirY = -Math.sin(player.pitch);
  const dirZ = Math.sin(player.yaw) * Math.cos(player.pitch);

  for (let step = 0; step < 16; step += 1) {
    const px = originX + dirX * step * 0.18;
    const py = originY + dirY * step * 0.18;
    const pz = originZ + dirZ * step * 0.18;
    const blockX = Math.floor(px);
    const blockY = Math.floor(py);
    const blockZ = Math.floor(pz);
    const block = getWorldBlock(blockX, blockY, blockZ);
    if (block && block !== AIR) {
      return { x: blockX, y: blockY, z: blockZ, block };
    }
  }
  return null;
}

function updatePlayer() {
  if (interactionCooldown > 0) {
    interactionCooldown -= 1 / 60;
  }

  if (mouseLocked && interactionCooldown <= 0) {
    if (leftMousePressed) {
      const hit = castRay();
      if (hit) {
        setWorldBlock(hit.x, hit.y, hit.z, AIR);
        interactionCooldown = 0.08;
      }
    }
    if (rightMousePressed) {
      const hit = castRay();
      if (hit) {
        const placeX = hit.x + Math.sign(Math.cos(player.yaw));
        const placeY = hit.y;
        const placeZ = hit.z + Math.sign(Math.sin(player.yaw));
        if (!isSolidBlock(placeX, placeY, placeZ) && !isSolidBlock(player.x, player.y + 0.7, player.z)) {
          setWorldBlock(placeX, placeY, placeZ, selectedBlock);
          interactionCooldown = 0.08;
        }
      }
    }
  }

  const moveSpeed = keys.has('shift') ? 0.08 : 0.055;
  let moveX = 0;
  let moveZ = 0;

  if (keys.has('w')) {
    moveX += Math.cos(player.yaw) * moveSpeed;
    moveZ += Math.sin(player.yaw) * moveSpeed;
  }
  if (keys.has('s')) {
    moveX -= Math.cos(player.yaw) * moveSpeed;
    moveZ -= Math.sin(player.yaw) * moveSpeed;
  }
  if (keys.has('a')) {
    moveX -= Math.sin(player.yaw) * moveSpeed;
    moveZ += Math.cos(player.yaw) * moveSpeed;
  }
  if (keys.has('d')) {
    moveX += Math.sin(player.yaw) * moveSpeed;
    moveZ -= Math.cos(player.yaw) * moveSpeed;
  }

  if (moveX || moveZ) {
    const len = Math.hypot(moveX, moveZ) || 1;
    moveX /= len;
    moveZ /= len;
  }

  const nextX = player.x + moveX;
  if (!checkCollision(nextX, player.y, player.z)) {
    player.x = nextX;
  }

  const nextZ = player.z + moveZ;
  if (!checkCollision(player.x, player.y, nextZ)) {
    player.z = nextZ;
  }

  if (jumpRequested && player.onGround) {
    player.verticalVelocity = 0.24;
    player.onGround = false;
  }
  jumpRequested = false;

  player.verticalVelocity -= 0.026;
  const nextY = player.y + player.verticalVelocity;
  if (!checkCollision(player.x, nextY, player.z)) {
    player.y = nextY;
  } else {
    player.verticalVelocity = 0;
    if (player.y > 0) {
      player.y = Math.floor(player.y) + 0.02;
    }
  }

  if (checkCollision(player.x, player.y - 0.04, player.z) && player.verticalVelocity <= 0) {
    player.onGround = true;
    player.verticalVelocity = 0;
  } else {
    player.onGround = false;
  }
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const normalized = value.length === 3 ? value.split('').map((ch) => ch + ch).join('') : value;
  const intValue = parseInt(normalized, 16);
  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
}

function shadeColor(hex, factor) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)}, 0.96)`;
}

function projectPoint(worldX, worldY, worldZ) {
  const relX = worldX - player.x;
  const relY = (worldY + 0.5) - (player.y + player.eyeHeight);
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

  if (rotZ <= 0.08) return null;

  const scale = 300 / rotZ;
  return {
    x: canvas.width / 2 + rotX * scale,
    y: canvas.height / 2 - rotY * scale,
    z: rotZ,
  };
}

function getFaceVertices(x, y, z, direction) {
  const half = 0.5;
  const origin = { x, y, z };
  switch (direction) {
    case 'north':
      return [
        { x: origin.x - half, y: origin.y - half, z: origin.z - half },
        { x: origin.x + half, y: origin.y - half, z: origin.z - half },
        { x: origin.x + half, y: origin.y + half, z: origin.z - half },
        { x: origin.x - half, y: origin.y + half, z: origin.z - half },
      ];
    case 'south':
      return [
        { x: origin.x - half, y: origin.y - half, z: origin.z + half },
        { x: origin.x - half, y: origin.y + half, z: origin.z + half },
        { x: origin.x + half, y: origin.y + half, z: origin.z + half },
        { x: origin.x + half, y: origin.y - half, z: origin.z + half },
      ];
    case 'east':
      return [
        { x: origin.x + half, y: origin.y - half, z: origin.z - half },
        { x: origin.x + half, y: origin.y - half, z: origin.z + half },
        { x: origin.x + half, y: origin.y + half, z: origin.z + half },
        { x: origin.x + half, y: origin.y + half, z: origin.z - half },
      ];
    case 'west':
      return [
        { x: origin.x - half, y: origin.y - half, z: origin.z - half },
        { x: origin.x - half, y: origin.y + half, z: origin.z - half },
        { x: origin.x - half, y: origin.y + half, z: origin.z + half },
        { x: origin.x - half, y: origin.y - half, z: origin.z + half },
      ];
    case 'top':
      return [
        { x: origin.x - half, y: origin.y + half, z: origin.z - half },
        { x: origin.x + half, y: origin.y + half, z: origin.z - half },
        { x: origin.x + half, y: origin.y + half, z: origin.z + half },
        { x: origin.x - half, y: origin.y + half, z: origin.z + half },
      ];
    default:
      return [
        { x: origin.x - half, y: origin.y - half, z: origin.z - half },
        { x: origin.x - half, y: origin.y - half, z: origin.z + half },
        { x: origin.x + half, y: origin.y - half, z: origin.z + half },
        { x: origin.x + half, y: origin.y - half, z: origin.z - half },
      ];
  }
}

function getFaceColor(blockType, direction) {
  const colorMap = {
    [GRASS]: { top: '#5ece66', side: '#4c8541', bottom: '#6b4a2f' },
    [DIRT]: { top: '#8d6b42', side: '#6e4f2d', bottom: '#4d3522' },
    [STONE]: { top: '#8e8e8e', side: '#6f6f6f', bottom: '#4a4a4a' },
    [WOOD]: { top: '#8a5a2d', side: '#6a4021', bottom: '#4b2d16' },
    [LEAF]: { top: '#3ca95d', side: '#2e8647', bottom: '#215f34' },
    [WATER]: { top: '#2d7cbf', side: '#2c6d9f', bottom: '#194c75' },
    [SAND]: { top: '#d9c06f', side: '#b49d56', bottom: '#8c7740' },
  };
  const palette = colorMap[blockType] || colorMap[STONE];
  const shade = direction === 'top' ? 1.04 : direction === 'bottom' ? 0.74 : 0.84;
  return blockType === WATER ? `rgba(54, 122, 181, 0.84)` : shadeColor(palette[direction === 'top' ? 'top' : direction === 'bottom' ? 'bottom' : 'side'], shade);
}

function renderFace(face) {
  const projected = face.vertices.map((vertex) => projectPoint(vertex.x, vertex.y, vertex.z)).filter(Boolean);
  if (projected.length < 3) return;

  const depth = projected.reduce((sum, point) => sum + point.z, 0) / projected.length;
  const fillStyle = getFaceColor(face.blockType, face.direction);

  ctx.beginPath();
  ctx.moveTo(projected[0].x, projected[0].y);
  projected.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  face.depth = depth;
}

function renderScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const time = performance.now() * 0.00006;
  const skyGlow = (Math.sin(time) + 1) * 0.5;
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
  sky.addColorStop(0, skyGlow > 0.5 ? '#091d35' : '#152b4a');
  sky.addColorStop(0.45, skyGlow > 0.5 ? '#2d6a9f' : '#4b84bf');
  sky.addColorStop(1, skyGlow > 0.5 ? '#9bc8d8' : '#d8ebf4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `rgba(255, 213, 120, ${0.18 + skyGlow * 0.06})`;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.8, canvas.height * 0.16, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let i = 0; i < 70; i += 1) {
    const starX = (i * 97) % canvas.width;
    const starY = (i * 53) % (canvas.height * 0.6);
    ctx.fillRect(starX, starY, 1.2, 1.2);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for (let i = 0; i < 5; i += 1) {
    const cloudX = (time * 30 + i * 220) % (canvas.width + 260) - 130;
    const cloudY = 90 + i * 52;
    ctx.beginPath();
    ctx.ellipse(cloudX, cloudY, 28, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cloudX + 28, cloudY + 6, 36, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(cloudX + 58, cloudY, 24, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const faces = [];
  for (let x = 0; x < CHUNK_SIZE; x += 1) {
    for (let z = 0; z < CHUNK_SIZE; z += 1) {
      for (let y = 0; y < CHUNK_HEIGHT; y += 1) {
        const blockType = getWorldBlock(x, y, z);
        if (blockType === AIR) continue;

        const directions = [
          { name: 'north', dx: 0, dy: 0, dz: -1 },
          { name: 'south', dx: 0, dy: 0, dz: 1 },
          { name: 'east', dx: 1, dy: 0, dz: 0 },
          { name: 'west', dx: -1, dy: 0, dz: 0 },
          { name: 'top', dx: 0, dy: 1, dz: 0 },
          { name: 'bottom', dx: 0, dy: -1, dz: 0 },
        ];

        directions.forEach((direction) => {
          const neighbor = getWorldBlock(x + direction.dx, y + direction.dy, z + direction.dz);
          const shouldRenderFace = blockType === WATER
            ? !isOpaqueBlock(x + direction.dx, y + direction.dy, z + direction.dz)
            : !isOpaqueBlock(x + direction.dx, y + direction.dy, z + direction.dz);
          if (shouldRenderFace) {
            faces.push({
              blockType,
              direction: direction.name,
              vertices: getFaceVertices(x, y, z, direction.name),
            });
          }
        });
      }
    }
  }

  faces.sort((a, b) => (b.depth || 0) - (a.depth || 0));
  faces.forEach((face) => {
    renderFace(face);
  });

  ctx.fillStyle = 'rgba(255,255,255,0.84)';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText('Voxel World', 20, 32);
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(`Position: ${player.x.toFixed(1)}, ${player.z.toFixed(1)}`, 20, 56);
  ctx.fillText(`Block: ${selectedBlock.toUpperCase()} · 1-7 switch`, 20, 78);
  ctx.fillText('Click to lock mouse · WASD move · Space jump · Left/Right click to edit blocks', 20, 100);

  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 8, canvas.height / 2);
  ctx.lineTo(canvas.width / 2 + 8, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, canvas.height / 2 - 8);
  ctx.lineTo(canvas.width / 2, canvas.height / 2 + 8);
  ctx.stroke();
}

function loop() {
  updatePlayer();
  renderScene();
  requestAnimationFrame(loop);
}

loop();
