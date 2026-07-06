const canvas = document.getElementById('voxelCanvas');
const ctx = canvas.getContext('2d');
const rerenderBtn = document.getElementById('rerenderBtn');

const worldSize = 18;
const tile = 22;
let seed = 4.2;
let time = 0;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hash(n) {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function getHeight(x, z) {
  const n1 = hash(x * 0.18 + seed);
  const n2 = hash(z * 0.18 + seed * 1.37);
  const n3 = hash((x + z) * 0.09 + seed * 0.6);
  const base = Math.floor((n1 * 0.55 + n2 * 0.35 + n3 * 0.1) * 8);
  const ridge = Math.sin((x + z) * 0.16 + seed) * 1.3;
  return clamp(base + Math.floor(ridge), 0, 8);
}

function getColorForHeight(y, height) {
  if (y <= 0) return '#4f7f6d';
  if (y < height - 2) return '#51653d';
  if (y < height) return '#79b661';
  return '#8dc671';
}

function drawCube(x, y, z, height) {
  const cameraOffsetX = Math.sin(time * 0.32) * 0.55;
  const cameraOffsetZ = Math.cos(time * 0.24) * 0.45;
  const screenX = canvas.width * 0.5 + (x - z + cameraOffsetX) * tile * 0.82;
  const screenY = canvas.height * 0.62 + (x + z + cameraOffsetZ) * tile * 0.14 - y * tile * 1.1;

  const topColor = getColorForHeight(y, height);
  const sideColor = y <= 0 ? '#2c4d4a' : '#4e5f39';
  const glow = y === height ? '#d6f5ff' : '#163447';

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(screenX, screenY - tile * 0.72);
  ctx.lineTo(screenX + tile * 0.82, screenY - tile * 0.36);
  ctx.lineTo(screenX + tile * 0.82, screenY + tile * 0.36);
  ctx.lineTo(screenX, screenY + tile * 0.72);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = sideColor;
  ctx.beginPath();
  ctx.moveTo(screenX, screenY + tile * 0.72);
  ctx.lineTo(screenX + tile * 0.82, screenY + tile * 0.36);
  ctx.lineTo(screenX + tile * 0.82, screenY + tile * 1.08);
  ctx.lineTo(screenX, screenY + tile * 1.44);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = glow;
  ctx.fillRect(screenX + 2, screenY - tile * 0.5, tile * 0.34, tile * 0.24);
}

function renderScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#122c47');
  sky.addColorStop(0.45, '#0c1a2a');
  sky.addColorStop(1, '#050b12');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = -worldSize; x <= worldSize; x += 1) {
    for (let z = -worldSize; z <= worldSize; z += 1) {
      const height = getHeight(x, z);
      for (let y = 0; y <= height; y += 1) {
        drawCube(x, y, z, height);
      }
    }
  }

  ctx.fillStyle = 'rgba(70, 160, 255, 0.18)';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.75, canvas.height * 0.2, 80, 0, Math.PI * 2);
  ctx.fill();
}

function animate() {
  time += 0.01;
  seed = 3.5 + Math.sin(time * 0.3) * 0.8;
  renderScene();
  requestAnimationFrame(animate);
}

rerenderBtn.addEventListener('click', () => {
  seed = Math.random() * 10;
  renderScene();
});

renderScene();
animate();
