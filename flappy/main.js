const canvas = document.getElementById('flappyCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let bird = { x: 50, y: 300, velocity: 0, color: 'yellow', beak: 'classic', eye: 'dot', wing: 'straight' };
  const gravity = 0.6;
  const jump = -12;
  let pipes = [];
  let score = 0;
  let gameRunning = true;
  let state = {
    customDrawings: { beak: null, eye: null, wing: null },
    customPartImages: { beak: null, eye: null, wing: null }
  };

  const drawCanvas = document.getElementById('flappyDrawCanvas');
  const drawCtx = drawCanvas.getContext('2d');
  const drawPartSelect = document.getElementById('flappyDrawPart');
  const drawColorInput = document.getElementById('flappyDrawColor');
  const drawClearBtn = document.getElementById('flappyClearDraw');
  const drawSaveBtn = document.getElementById('flappySaveDraw');

  function drawBird() {
    const size = 24;
    const wingHeight = bird.wing === 'flap' ? 14 : bird.wing === 'spiky' ? 20 : 10;
    const wingY = bird.y + 10;
    ctx.fillStyle = bird.color;
    ctx.fillRect(bird.x, bird.y, size, size);

    const wingImage = state.customPartImages.wing;
    if (wingImage) {
      ctx.drawImage(wingImage, bird.x - 30, bird.y + 6, 28, 20);
    } else {
      ctx.fillStyle = bird.color;
      if (bird.wing === 'straight') {
        ctx.fillRect(bird.x - 10, wingY, 10, 6);
      } else if (bird.wing === 'flap') {
        ctx.beginPath();
        ctx.moveTo(bird.x - 10, wingY);
        ctx.lineTo(bird.x - 22, wingY + wingHeight);
        ctx.lineTo(bird.x - 10, wingY + wingHeight + 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(bird.x - 10, wingY);
        ctx.lineTo(bird.x - 18, wingY + 4);
        ctx.lineTo(bird.x - 10, wingY + 10);
        ctx.lineTo(bird.x - 18, wingY + 14);
        ctx.lineTo(bird.x - 10, wingY + 18);
        ctx.fill();
      }
    }

    const beakImage = state.customPartImages.beak;
    if (beakImage) {
      ctx.drawImage(beakImage, bird.x + size - 2, bird.y + 8, 28, 18);
    } else {
      let beakPoints;
      if (bird.beak === 'long') {
        beakPoints = [
          { x: bird.x + size, y: bird.y + 8 },
          { x: bird.x + size + 18, y: bird.y + 12 },
          { x: bird.x + size, y: bird.y + 16 }
        ];
      } else if (bird.beak === 'pointy') {
        beakPoints = [
          { x: bird.x + size, y: bird.y + 10 },
          { x: bird.x + size + 12, y: bird.y + 6 },
          { x: bird.x + size + 12, y: bird.y + 18 }
        ];
      } else if (bird.beak === 'chonk') {
        beakPoints = [
          { x: bird.x + size, y: bird.y + 8 },
          { x: bird.x + size + 20, y: bird.y + 8 },
          { x: bird.x + size + 20, y: bird.y + 18 },
          { x: bird.x + size, y: bird.y + 18 }
        ];
      } else {
        beakPoints = [
          { x: bird.x + size, y: bird.y + 10 },
          { x: bird.x + size + 12, y: bird.y + 14 },
          { x: bird.x + size, y: bird.y + 18 }
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
      ctx.drawImage(eyeImage, bird.x + 10, bird.y + 8, 12, 12);
    } else {
      ctx.fillStyle = '#000';
      if (bird.eye === 'glow') {
        ctx.beginPath();
        ctx.arc(bird.x + 16, bird.y + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bird.x + 14, bird.y + 8, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (bird.eye === 'squint') {
        ctx.fillRect(bird.x + 10, bird.y + 10, 10, 4);
      } else {
        ctx.beginPath();
        ctx.arc(bird.x + 16, bird.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
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

    if (bird.y + 24 > canvas.height || bird.y < 0) {
      gameOver();
    }

    pipes.forEach(pipe => {
      pipe.x -= 2;
      if (pipe.x + 50 < 0) {
        pipes.shift();
        score++;
        document.getElementById('flappyScore').textContent = `Score: ${score}`;
      }
      if (bird.x < pipe.x + 50 && bird.x + 24 > pipe.x &&
          (bird.y < pipe.top || bird.y + 24 > canvas.height - pipe.bottom)) {
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
    bird = { x: 50, y: 300, velocity: 0, color: bird.color, beak: bird.beak, eye: bird.eye, wing: bird.wing };
    pipes = [];
    score = 0;
    document.getElementById('flappyScore').textContent = `Score: ${score}`;
    gameRunning = true;
    gameLoop();
  }

  function updateBirdStyle() {
    bird.color = document.getElementById('flappyColor').value;
    bird.beak = document.getElementById('flappyBeak').value;
    bird.eye = document.getElementById('flappyEye').value;
    bird.wing = document.getElementById('flappyWing').value;
  }

  function clearDrawCanvas() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.fillStyle = 'rgba(255,255,255,0.06)';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  }

  function loadDrawPreview() {
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
    const rect = drawCanvas.getBoundingClientRect();
    const x = ((event.clientX || event.touches[0].clientX) - rect.left) * (drawCanvas.width / rect.width);
    const y = ((event.clientY || event.touches[0].clientY) - rect.top) * (drawCanvas.height / rect.height);
    return { x, y };
  }

  let drawing = false;
  function startDrawing(event) {
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
    if (!drawing) return;
    const pos = getDrawPointerPosition(event);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    event.preventDefault();
  }

  function stopDrawing() {
    drawing = false;
  }

  drawCanvas.addEventListener('mousedown', startDrawing);
  drawCanvas.addEventListener('mousemove', drawPointer);
  drawCanvas.addEventListener('mouseup', stopDrawing);
  drawCanvas.addEventListener('mouseleave', stopDrawing);
  drawCanvas.addEventListener('touchstart', startDrawing);
  drawCanvas.addEventListener('touchmove', drawPointer);
  drawCanvas.addEventListener('touchend', stopDrawing);

  drawPartSelect.addEventListener('change', loadDrawPreview);
  drawColorInput.addEventListener('change', () => {
    drawCtx.strokeStyle = drawColorInput.value;
  });
  drawClearBtn.addEventListener('click', clearDrawCanvas);
  drawSaveBtn.addEventListener('click', saveDrawnPart);

  document.getElementById('flappyColor').addEventListener('change', updateBirdStyle);
  document.getElementById('flappyBeak').addEventListener('change', updateBirdStyle);
  document.getElementById('flappyEye').addEventListener('change', updateBirdStyle);
  document.getElementById('flappyWing').addEventListener('change', updateBirdStyle);

  canvas.addEventListener('click', flap);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap();
    }
  });

  clearDrawCanvas();
  loadDrawPreview();

  // start flappy loop
  gameLoop();
}
