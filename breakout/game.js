const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let score = 0;
let lives = 3;
let balls = [];
let paddle = { x: canvas.width / 2 - 40, y: canvas.height - 20, w: 80, h: 15 };
let bricks = [];
let powerUps = [];
let mouseX = canvas.width / 2;

// Power-up types
const POWER_UP_TYPES = {
  SLOW: { color: '#FFD700', symbol: '🟡', speedMod: 0.5 },
  EXPAND: { color: '#00FF00', symbol: '🟢', paddleWMod: 1.5 },
  MULTI_BALL: { color: '#0066FF', symbol: '🔵', multiplier: 2 },
  EXTRA_LIFE: { color: '#9933FF', symbol: '🟣', lives: 1 }
};

class Ball {
  constructor(x, y, vx = 4, vy = -4) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 6;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.vx *= -1;
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    }

    if (this.y - this.radius < 0) {
      this.vy *= -1;
      this.y = this.radius;
    }

    // Lose ball
    if (this.y > canvas.height) {
      return false;
    }

    // Paddle collision
    if (this.y + this.radius >= paddle.y &&
        this.y - this.radius <= paddle.y + paddle.h &&
        this.x >= paddle.x &&
        this.x <= paddle.x + paddle.w) {
      this.vy *= -1;
      this.y = paddle.y - this.radius;
      this.vx += (this.x - (paddle.x + paddle.w / 2)) / 20;
    }

    // Brick collision
    for (let i = 0; i < bricks.length; i++) {
      const brick = bricks[i];
      if (brick.active &&
          this.x + this.radius > brick.x &&
          this.x - this.radius < brick.x + brick.w &&
          this.y + this.radius > brick.y &&
          this.y - this.radius < brick.y + brick.h) {
        brick.active = false;
        score += 10;
        this.vy *= -1;

        // Chance to spawn power-up
        if (Math.random() < 0.3) {
          powerUps.push({
            x: brick.x + brick.w / 2,
            y: brick.y + brick.h / 2,
            type: Object.keys(POWER_UP_TYPES)[Math.floor(Math.random() * Object.keys(POWER_UP_TYPES).length)],
            vy: 2
          });
        }
        break;
      }
    }

    return true;
  }

  draw() {
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initBricks() {
  bricks = [];
  const brickW = 60;
  const brickH = 15;
  const cols = 8;
  const rows = 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bricks.push({
        x: col * (brickW + 8) + 30,
        y: row * (brickH + 8) + 30,
        w: brickW,
        h: brickH,
        active: true,
        color: ['#FF6B6B', '#FFA500', '#FFD700', '#00FF00'][row]
      });
    }
  }
}

function startGame() {
  score = 0;
  lives = 3;
  gameRunning = true;
  gamePaused = false;
  gameOver = false;
  balls = [new Ball(canvas.width / 2, canvas.height - 50)];
  paddle = { x: canvas.width / 2 - 40, y: canvas.height - 20, w: 80, h: 15 };
  powerUps = [];
  initBricks();
  document.getElementById('gameStatus').textContent = 'Playing...';
  gameLoop();
}

function togglePause() {
  if (gameRunning && !gameOver) {
    gamePaused = !gamePaused;
    document.getElementById('gameStatus').textContent = gamePaused ? 'PAUSED' : 'Playing...';
  }
}

function update() {
  if (!gameRunning || gamePaused || gameOver) return;

  // Update paddle
  paddle.x = mouseX - paddle.w / 2;
  paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, paddle.x));

  // Update balls
  for (let i = balls.length - 1; i >= 0; i--) {
    if (!balls[i].update()) {
      balls.splice(i, 1);
    }
  }

  // Check if lost all balls
  if (balls.length === 0) {
    lives--;
    if (lives <= 0) {
      gameRunning = false;
      gameOver = true;
      document.getElementById('gameStatus').textContent = `Game Over! Score: ${score}`;
    } else {
      balls.push(new Ball(canvas.width / 2, canvas.height - 50));
    }
  }

  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.y += p.vy;

    // Collision with paddle
    if (p.y > paddle.y && p.x > paddle.x && p.x < paddle.x + paddle.w) {
      applyPowerUp(p.type);
      powerUps.splice(i, 1);
    } else if (p.y > canvas.height) {
      powerUps.splice(i, 1);
    }
  }

  // Check win condition
  const activeBricks = bricks.filter(b => b.active).length;
  if (activeBricks === 0) {
    gameRunning = false;
    gameOver = false;
    document.getElementById('gameStatus').textContent = `Level Complete! Score: ${score}`;
  }

  document.getElementById('score').textContent = `Score: ${score} | Lives: ${lives}`;
}

function applyPowerUp(type) {
  switch (type) {
    case 'SLOW':
      balls.forEach(ball => {
        ball.vx *= 0.7;
        ball.vy *= 0.7;
      });
      break;
    case 'EXPAND':
      paddle.w = Math.min(180, paddle.w * 1.5);
      setTimeout(() => { paddle.w = 80; }, 5000);
      break;
    case 'MULTI_BALL':
      const newBalls = balls.map(b => new Ball(b.x, b.y, b.vx, b.vy));
      balls.push(...newBalls);
      break;
    case 'EXTRA_LIFE':
      lives++;
      break;
  }
  score += 50;
}

function draw() {
  // Background
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw bricks
  bricks.forEach(brick => {
    if (brick.active) {
      ctx.fillStyle = brick.color;
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
    }
  });

  // Draw paddle
  ctx.fillStyle = '#4CAF50';
  ctx.shadowColor = 'rgba(76, 175, 80, 0.8)';
  ctx.shadowBlur = 10;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.shadowColor = 'none';

  // Draw balls
  balls.forEach(ball => ball.draw());

  // Draw power-ups
  powerUps.forEach(p => {
    const info = POWER_UP_TYPES[p.type];
    ctx.fillStyle = info.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', p.x, p.y);
  });
}

function gameLoop() {
  update();
  draw();

  if (gameRunning || gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

// Mouse tracking
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
});

// Start with empty canvas
draw();
