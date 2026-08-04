const canvas = document.getElementById('flappyCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('flappyScore');
  const colorEl = document.getElementById('flappyColor');
  const beakEl = document.getElementById('flappyBeak');
  const eyeEl = document.getElementById('flappyEye');
  const wingEl = document.getElementById('flappyWing');

  let bird = { x: 72, y: 180, velocity: 0, color: 'yellow', beak: 'classic', eye: 'dot', wing: 'straight' };
  const gravity = 0.42;
  const jump = -8.2;
  let pipes = [];
  let score = 0;
  let gameRunning = false;
  let gameOvered = false;
  let animationFrameId = null;
  let state = {
    customDrawings: { beak: null, eye: null, wing: null },
    customPartImages: { beak: null, eye: null, wing: null }
  };

  const drawCanvas = document.getElementById('flappyDrawCanvas');
  const drawCtx = drawCanvas ? drawCanvas.getContext('2d') : null;
  const drawPartSelect = document.getElementById('flappyDrawPart');
  const drawColorInput = document.getElementById('flappyDrawColor');
  const drawClearBtn = document.getElementById('flappyClearDraw');
  const drawSaveBtn = document.getElementById('flappySaveDraw');

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#87dcff');
    sky.addColorStop(0.55, '#4ba7ff');
    sky.addColorStop(1, '#ecf8ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(canvas.width - 90, 70, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.ellipse(120, 95, 54, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(210, 112, 38, 18, 0, 0, Math.PI * 2);
    ctx.ellipse(300, 86, 42, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#73c96a';
    ctx.fillRect(0, canvas.height - 70, canvas.width, 70);
    ctx.fillStyle = '#5aa758';
    ctx.fillRect(0, canvas.height - 54, canvas.width, 16);
  }

  function drawBird() {
    const size = 24;
    const wingHeight = bird.wing === 'flap' ? 14 : bird.wing === 'spiky' ? 20 : 10;
    const wingY = 10;
    const bodyX = bird.x;
    const bodyY = bird.y;

    ctx.save();
    ctx.translate(bodyX, bodyY);
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(size * 0.7, size * 0.7, size * 0.6, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const wingImage = state.customPartImages.wing;
    if (wingImage) {
      ctx.drawImage(wingImage, -24, 8, 28, 20);
    } else {
      ctx.fillStyle = bird.color;
      if (bird.wing === 'straight') {
        ctx.fillRect(-10, wingY + 6, 10, 6);
      } else if (bird.wing === 'flap') {
        ctx.beginPath();
        ctx.moveTo(-10, wingY + 6);
        ctx.lineTo(-22, wingY + wingHeight);
        ctx.lineTo(-10, wingY + wingHeight + 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(-10, wingY + 6);
        ctx.lineTo(-18, wingY + 4);
        ctx.lineTo(-10, wingY + 10);
        ctx.lineTo(-18, wingY + 14);
        ctx.lineTo(-10, wingY + 18);
        ctx.fill();
      }
    }

    const beakImage = state.customPartImages.beak;
    if (beakImage) {
      ctx.drawImage(beakImage, size - 2, 8, 28, 18);
    } else {
      let beakPoints;
      if (bird.beak === 'long') {
        beakPoints = [
          { x: size, y: 8 },
          { x: size + 18, y: 12 },
          { x: size, y: 16 }
        ];
      } else if (bird.beak === 'pointy') {
        beakPoints = [
          { x: size, y: 10 },
          { x: size + 12, y: 6 },
          { x: size + 12, y: 18 }
        ];
      } else if (bird.beak === 'chonk') {
        beakPoints = [
          { x: size, y: 8 },
          { x: size + 20, y: 8 },
          { x: size + 20, y: 18 },
          { x: size, y: 18 }
        ];
      } else {
        beakPoints = [
          { x: size, y: 10 },
          { x: size + 12, y: 14 },
          { x: size, y: 18 }
        ];
      }
      ctx.fillStyle = '#ff8e3c';
      ctx.beginPath();
      ctx.moveTo(beakPoints[0].x, beakPoints[0].y);
      for (let i = 1; i < beakPoints.length; i += 1) {
        ctx.lineTo(beakPoints[i].x, beakPoints[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    const eyeImage = state.customPartImages.eye;
    if (eyeImage) {
      ctx.drawImage(eyeImage, 10, 8, 12, 12);
    } else {
      ctx.fillStyle = '#f7f2f2';
      if (bird.eye === 'glow') {
        ctx.beginPath();
        ctx.arc(16, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(14, 8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (bird.eye === 'squint') {
        ctx.fillRect(10, 10, 10, 4);
      } else {
        ctx.beginPath();
        ctx.arc(16, 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawPipes() {
    pipes.forEach(pipe => {
      ctx.fillStyle = '#4fb35c';
      ctx.fillRect(pipe.x, 0, 52, pipe.top);
      ctx.fillStyle = '#3d8b44';
      ctx.fillRect(pipe.x, pipe.top - 10, 52, 10);

      ctx.fillStyle = '#4fb35c';
      ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 52, pipe.bottom);
      ctx.fillStyle = '#3d8b44';
      ctx.fillRect(pipe.x, canvas.height - pipe.bottom, 52, 10);
    });
  }

  function update() {
    if (!gameRunning) return;

    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (bird.y + 24 > canvas.height - 70 || bird.y < 0) {
      gameOver();
      return;
    }

    pipes.forEach(pipe => {
      pipe.x -= 2.2;
      if (!pipe.passed && pipe.x + 52 < bird.x) {
        pipe.passed = true;
        score += 1;
        if (scoreEl) {
          scoreEl.textContent = `Score: ${score}`;
        }
      }

      const birdLeft = bird.x;
      const birdRight = bird.x + 24;
      const birdTop = bird.y;
      const birdBottom = bird.y + 24;
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + 52;
      const gapTop = pipe.top;
      const gapBottom = canvas.height - pipe.bottom;

      const hitPipe = birdRight > pipeLeft && birdLeft < pipeRight && (birdTop < gapTop || birdBottom > gapBottom);
      if (hitPipe) {
        gameOver();
      }
    });

    pipes = pipes.filter(pipe => pipe.x + 52 > -20);

    if (pipes.length === 0 || pipes[pipes.length - 1].x < 290) {
      const gap = 150;
      const top = Math.random() * (canvas.height - gap - 110) + 45;
      const bottom = canvas.height - top - gap;
      pipes.push({ x: canvas.width, top, bottom, passed: false });
    }
  }

  function draw() {
    drawBackground();
    drawPipes();
    drawBird();

    if (!gameRunning && !gameOvered) {
      ctx.fillStyle = 'rgba(3, 16, 27, 0.68)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f6fbff';
      ctx.font = '700 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tap or press space to start', canvas.width / 2, canvas.height / 2 - 6);
      ctx.font = '500 14px Inter, sans-serif';
      ctx.fillText('Avoid the pipes and chase a new high score', canvas.width / 2, canvas.height / 2 + 24);
    } else if (gameOvered) {
      ctx.fillStyle = 'rgba(3, 16, 27, 0.72)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffd166';
      ctx.font = '700 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = '500 15px Inter, sans-serif';
      ctx.fillStyle = '#f6fbff';
      ctx.fillText(`Score: ${score} • Click to try again`, canvas.width / 2, canvas.height / 2 + 24);
    }
  }

  function gameLoop() {
    if (gameRunning) {
      update();
    }
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function flap() {
    if (!gameRunning) {
      startFlappy();
      return;
    }
    bird.velocity = jump;
  }

  function gameOver() {
    gameRunning = false;
    gameOvered = true;
  }

  function resetGame() {
    const style = { color: bird.color, beak: bird.beak, eye: bird.eye, wing: bird.wing };
    bird = { x: 72, y: 180, velocity: 0, ...style };
    pipes = [];
    score = 0;
    if (scoreEl) {
      scoreEl.textContent = `Score: ${score}`;
    }
    gameRunning = false;
    gameOvered = false;
  }

  function startFlappy() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    resetGame();
    gameRunning = true;
    gameOvered = false;
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function updateBirdStyle() {
    bird.color = colorEl ? colorEl.value : bird.color;
    bird.beak = beakEl ? beakEl.value : bird.beak;
    bird.eye = eyeEl ? eyeEl.value : bird.eye;
    bird.wing = wingEl ? wingEl.value : bird.wing;
  }

  function clearDrawCanvas() {
    if (!drawCtx || !drawCanvas) return;
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.fillStyle = 'rgba(255,255,255,0.06)';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  }

  function loadDrawPreview() {
    if (!drawCtx || !drawCanvas || !drawPartSelect) return;
    clearDrawCanvas();
    const part = drawPartSelect.value;
    if (state.customDrawings[part]) {
      const image = new Image();
      image.onload = () => {
        drawCtx.drawImage(image, 0, 0, drawCanvas.width, drawCanvas.height);
      };
      image.src = state.customDrawings[part];
    }
  }

  function saveDrawnPart() {
    if (!drawCtx || !drawCanvas || !drawPartSelect) return;
    const part = drawPartSelect.value;
    state.customDrawings[part] = drawCanvas.toDataURL();
    const image = new Image();
    image.onload = () => {
      state.customPartImages[part] = image;
    };
    image.src = state.customDrawings[part];
    bird[part] = part;
    state.status = `Saved custom ${part}`;
  }

  function getDrawPointerPosition(event) {
    if (!drawCanvas) return { x: 0, y: 0 };
    const rect = drawCanvas.getBoundingClientRect();
    const x = ((event.clientX || event.touches[0].clientX) - rect.left) * (drawCanvas.width / rect.width);
    const y = ((event.clientY || event.touches[0].clientY) - rect.top) * (drawCanvas.height / rect.height);
    return { x, y };
  }

  let drawing = false;
  function startDrawing(event) {
    if (!drawCtx || !drawCanvas || !drawColorInput) return;
    drawing = true;
    drawCtx.strokeStyle = drawColorInput.value;
    drawCtx.lineWidth = 8;
    drawCtx.lineCap = 'round';
    const pos = getDrawPointerPosition(event);
    drawCtx.beginPath();
    drawCtx.moveTo(pos.x, pos.y);
    event.preventDefault();
  }

  function drawPointer(event) {
    if (!drawing || !drawCtx) return;
    const pos = getDrawPointerPosition(event);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    event.preventDefault();
  }

  function stopDrawing() {
    drawing = false;
  }

  if (drawCanvas) {
    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', drawPointer);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseleave', stopDrawing);
    drawCanvas.addEventListener('touchstart', startDrawing);
    drawCanvas.addEventListener('touchmove', drawPointer);
    drawCanvas.addEventListener('touchend', stopDrawing);
  }

  if (drawPartSelect) {
    drawPartSelect.addEventListener('change', loadDrawPreview);
  }
  if (drawColorInput && drawCtx) {
    drawColorInput.addEventListener('change', () => {
      drawCtx.strokeStyle = drawColorInput.value;
    });
  }
  if (drawClearBtn) {
    drawClearBtn.addEventListener('click', clearDrawCanvas);
  }
  if (drawSaveBtn) {
    drawSaveBtn.addEventListener('click', saveDrawnPart);
  }

  if (colorEl) colorEl.addEventListener('change', updateBirdStyle);
  if (beakEl) beakEl.addEventListener('change', updateBirdStyle);
  if (eyeEl) eyeEl.addEventListener('change', updateBirdStyle);
  if (wingEl) wingEl.addEventListener('change', updateBirdStyle);

  const startBtn = document.getElementById('flappyStartBtn');
  if (startBtn) {
    startBtn.addEventListener('click', startFlappy);
  }
  canvas.addEventListener('click', flap);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap();
    }
  });

  clearDrawCanvas();
  loadDrawPreview();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
}
