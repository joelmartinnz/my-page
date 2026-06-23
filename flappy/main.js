const canvas = document.getElementById('flappyCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let bird = { x: 50, y: 300, velocity: 0 };
  const gravity = 0.6;
  const jump = -12;
  let pipes = [];
  let score = 0;
  let gameRunning = true;

  function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, 20, 20);
  }

  function drawPipes() {
    ctx.fillStyle = 'green';
    pipes.forEach(pipe => {
      ctx.fillRect(pipe.x, 0, 50, pipe.top);
      ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 50, pipe.bottom);
    });
  }

  function update() {
    if (!gameRunning) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (bird.y + 20 > canvas.height || bird.y < 0) {
      gameOver();
    }

    pipes.forEach(pipe => {
      pipe.x -= 2;
      if (pipe.x + 50 < 0) {
        pipes.shift();
        score++;
        document.getElementById('flappyScore').textContent = `Score: ${score}`;
      }
      if (bird.x < pipe.x + 50 && bird.x + 20 > pipe.x &&
          (bird.y < pipe.top || bird.y + 20 > canvas.height - pipe.bottom)) {
        gameOver();
      }
    });

    if (pipes.length === 0 || pipes[pipes.length - 1].x < 300) {
      const top = Math.random() * (canvas.height - 200) + 50;
      const bottom = canvas.height - top - 150;
      pipes.push({ x: canvas.width, top, bottom });
    }
  }

  function draw() {
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
  }

  function gameLoop() {
    update();
    draw();
    if (gameRunning) {
      requestAnimationFrame(gameLoop);
    }
  }

  function flap() {
    if (!gameRunning) {
      resetGame();
      return;
    }
    bird.velocity = jump;
  }

  function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'red';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
    ctx.fillText('Click to restart', canvas.width / 2 - 100, canvas.height / 2 + 40);
  }

  function resetGame() {
    bird = { x: 50, y: 300, velocity: 0 };
    pipes = [];
    score = 0;
    document.getElementById('flappyScore').textContent = `Score: ${score}`;
    gameRunning = true;
    gameLoop();
  }

  canvas.addEventListener('click', flap);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap();
    }
  });

  // start flappy loop
  gameLoop();
}
