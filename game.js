const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
  x: 0,
  y: 6,
  z: 0,
  yaw: 0,
  pitch: 0,
  speed: 0.12,
  mode: 'first-person'
};

const keys = new Set();

window.addEventListener('keydown', (event) => {
  keys.add(event.key.toLowerCase());
});
window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
});

window.addEventListener('mousemove', (event) => {
  player.yaw -= event.movementX * 0.004;
  player.pitch = Math.max(-0.8, Math.min(0.8, player.pitch - event.movementY * 0.004));
});

function update() {
  if (keys.has('w')) {
    player.x += Math.cos(player.yaw) * player.speed;
    player.z += Math.sin(player.yaw) * player.speed;
  }
  if (keys.has('s')) {
    player.x -= Math.cos(player.yaw) * player.speed;
    player.z -= Math.sin(player.yaw) * player.speed;
  }
  if (keys.has('a')) {
    player.x -= Math.sin(player.yaw) * player.speed;
    player.z += Math.cos(player.yaw) * player.speed;
  }
  if (keys.has('d')) {
    player.x += Math.sin(player.yaw) * player.speed;
    player.z -= Math.cos(player.yaw) * player.speed;
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, '#123a5b');
  sky.addColorStop(1, '#08101c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2f5a36';
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

  ctx.save();
  ctx.translate(canvas.width * 0.5, canvas.height * 0.5);
  ctx.rotate(player.pitch);
  ctx.fillStyle = '#d8f4ff';
  ctx.fillRect(-4, -18, 8, 18);
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(-4, 0, 8, 8);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText('First-person view prototype', 20, 32);
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

loop();
