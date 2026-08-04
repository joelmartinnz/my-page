const canvas = document.getElementById('voxelCanvas');
const ctx = canvas.getContext('2d');
const rerenderBtn = document.getElementById('rerenderBtn');

const worldSize = 16;
const tile = 24;
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
  const n1 = hash(x * 0.16 + seed);
  const n2 = hash(z * 0.17 + seed * 1.37);
  const n3 = hash((x + z) * 0.1 + seed * 0.7);
  const ridge = Math.sin((x + z) * 0.2 + seed) * 1.25;
  const slope = Math.cos(x * 0.08) * 0.35 + Math.sin(z * 0.11) * 0.25;
  const base = Math.floor((n1 * 0.5 + n2 * 0.32 + n3 * 0.18) * 8.8);
  return clamp(base + Math.floor(ridge + slope), 0, 9);
}

function getColorForHeight(y, height) {
  if (y <= 0) return '#3e7d6e';
  if (y < height - 2) return '#4f6c36';
  if (y < height) return '#83bd62';
  return '#b8f090';
}

function drawCube(x, y, z, height) {
  const wave = Math.sin(time * 0.8 + x * 0.8 + z * 0.7) * 0.15;
  const cameraOffsetX = Math.sin(time * 0.3) * 0.8;
  const cameraOffsetZ = Math.cos(time * 0.24) * 0.65;
  const screenX = canvas.width * 0.5 + (x - z + cameraOffsetX) * tile * 0.82;
  const screenY = canvas.height * 0.65 + (x + z + cameraOffsetZ) * tile * 0.14 - (y + wave) * tile * 1.12;

  const topColor = getColorForHeight(y, height);
  const sideColor = y <= 0 ? '#2d4b45' : y < height ? '#5d713b' : '#7a8d4a';
  const glow = y === height ? '#dff7ff' : '#183544';

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

  if (y === height) {
    ctx.fillStyle = glow;
    ctx.fillRect(screenX + 2, screenY - tile * 0.5, tile * 0.34, tile * 0.24);
  }

  if (y === height && Math.abs(x) + Math.abs(z) < 4 && Math.random() > 0.78) {
    ctx.fillStyle = '#ffdd77';
    ctx.beginPath();
    ctx.moveTo(screenX + 8, screenY - 10);
    ctx.lineTo(screenX + 16, screenY - 28);
    ctx.lineTo(screenX + 24, screenY - 10);
    ctx.closePath();
    ctx.fill();
  }
}

function renderScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#0a2343');
  sky.addColorStop(0.48, '#091a2d');
  sky.addColorStop(1, '#040a10');
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

  ctx.fillStyle = 'rgba(97, 174, 255, 0.16)';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.76, canvas.height * 0.2, 92, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.18, canvas.height * 0.24, 58, 0, Math.PI * 2);
  ctx.fill();
}

function animate() {
  time += 0.01;
  seed = 3.5 + Math.sin(time * 0.3) * 0.8;
  renderScene();
  requestAnimationFrame(animate);
}

if (rerenderBtn) {
  rerenderBtn.addEventListener('click', () => {
    seed = Math.random() * 10;
    renderScene();
  });
}

renderScene();
animate();
