const canvas = document.getElementById('terrainCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const regenBtn = document.getElementById('regenBtn');

function hash(value) {
  const x = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function generateHeightMap(width, height, seed = 3) {
  const map = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const noise = hash(x * 0.07 + seed) * 0.6 + hash(y * 0.07 + seed * 2) * 0.4;
      const ridge = Math.sin((x / width) * Math.PI * 2 + seed) * 0.2;
      map.push(Math.floor((noise + ridge) * 12));
    }
  }
  return map;
}

function drawTerrain() {
  const width = 48;
  const height = 28;
  const map = generateHeightMap(width, height, Math.random() * 10);
  const tileSize = 16;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0e1a28';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = map[y * width + x];
      const px = x * tileSize + 20;
      const py = y * tileSize + 20;
      let color = '#5e8c3f';

      if (value < 3) {
        color = '#66b5ff';
      } else if (value < 7) {
        color = '#7bcf5f';
      } else if (value < 10) {
        color = '#8b6b3b';
      } else {
        color = '#8b8b8b';
      }

      ctx.fillStyle = color;
      ctx.fillRect(px, py, tileSize, tileSize);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.strokeRect(px, py, tileSize, tileSize);
    }
  }
}

startBtn.addEventListener('click', () => {
  drawTerrain();
});

regenBtn.addEventListener('click', () => {
  drawTerrain();
});

drawTerrain();
