const robloxCanvas = document.getElementById('robloxCanvas');
if (robloxCanvas) {
  const robloxCtx = robloxCanvas.getContext('2d');
  let robloxRunning = false;
  let robloxKeys = {};
  let robloxPlayer1 = { x: 180, y: 220, vy: 0, health: 100, attackCooldown: 0, color: '#3f8bf5', facing: 1, name: 'Player 1' };
  let robloxPlayer2 = { x: 420, y: 220, vy: 0, health: 100, attackCooldown: 0, color: '#f58b3f', facing: -1, name: 'Player 2' };
  const robloxGravity = 0.8;
  const robloxJumpForce = -14;

  function resetRobloxGame() {
    robloxPlayer1 = { x: 180, y: 220, vy: 0, health: 100, attackCooldown: 0, color: '#3f8bf5', facing: 1, name: 'Player 1' };
    robloxPlayer2 = { x: 420, y: 220, vy: 0, health: 100, attackCooldown: 0, color: '#f58b3f', facing: -1, name: 'Player 2' };
    robloxRunning = true;
    robloxKeys = {};
    document.getElementById('robloxStatus').textContent = 'Battle starts!';
    robloxLoop();
  }

  function drawRobloxPlayer(player) {
    const baseX = player.x;
    const baseY = player.y;
    const front = player.color;
    const faceColor = '#111';
    robloxCtx.save();
    drawShadow(robloxCtx, baseX + 4, baseY + 76, 44);

    drawCube(robloxCtx, baseX - 20, baseY + 30, 16, 30, 10, front);
    drawCube(robloxCtx, baseX + 4, baseY + 30, 16, 30, 10, front);
    drawCube(robloxCtx, baseX - 20, baseY - 10, 40, 44, 12, front);
    drawCube(robloxCtx, baseX - 16, baseY - 54, 32, 28, 10, front);
    drawCube(robloxCtx, baseX - 36, baseY - 4, 16, 32, 10, front);
    drawCube(robloxCtx, baseX + 20, baseY - 4, 16, 32, 10, front);

    robloxCtx.fillStyle = faceColor;
    robloxCtx.fillRect(baseX - 10, baseY - 48, 8, 8);
    robloxCtx.fillRect(baseX + 2, baseY - 48, 8, 8);
    robloxCtx.fillStyle = '#fff';
    robloxCtx.fillRect(baseX - 8, baseY - 46, 4, 4);
    robloxCtx.fillRect(baseX + 4, baseY - 46, 4, 4);
    robloxCtx.fillStyle = '#222';
    robloxCtx.fillRect(baseX - 6, baseY - 32, 12, 4);

    if (player.attackCooldown > 0) {
      robloxCtx.fillStyle = 'rgba(255,255,255,0.85)';
      robloxCtx.fillRect(baseX - 30, baseY + 2, 10, 10);
      robloxCtx.fillRect(baseX + 20, baseY + 2, 10, 10);
    }
    robloxCtx.restore();
  }

  function drawRobloxArena() {
    robloxCtx.fillStyle = '#081923';
    robloxCtx.fillRect(0, 0, robloxCanvas.width, robloxCanvas.height);
    robloxCtx.fillStyle = '#11233d';
    robloxCtx.fillRect(0, 260, robloxCanvas.width, 60);
    robloxCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i <= 12; i++) {
      const x = i * 50;
      robloxCtx.beginPath();
      robloxCtx.moveTo(x, 260);
      robloxCtx.lineTo(x + 20, 320);
      robloxCtx.stroke();
    }
    for (let j = 0; j <= 5; j++) {
      const y = 260 + j * 12;
      robloxCtx.beginPath();
      robloxCtx.moveTo(0, y);
      robloxCtx.lineTo(600, y + 10);
      robloxCtx.stroke();
    }
  }

  function performRobloxAttack(attacker, defender) {
    if (attacker.attackCooldown > 0) return;
    const distance = Math.abs(attacker.x - defender.x);
    if (distance < 80 && Math.abs(attacker.y - defender.y) < 40) {
      const damage = 12;
      defender.health = Math.max(0, defender.health - damage);
      document.getElementById('robloxStatus').textContent = `${attacker.name} hits ${defender.name} for ${damage}!`;
    } else {
      document.getElementById('robloxStatus').textContent = `${attacker.name} swings and misses!`;
    }
    attacker.attackCooldown = 24;
  }

  function updateRoblox() {
    if (!robloxRunning) return;
    if (robloxKeys['KeyA']) robloxPlayer1.x -= 4;
    if (robloxKeys['KeyD']) robloxPlayer1.x += 4;
    if (robloxKeys['ArrowLeft']) robloxPlayer2.x -= 4;
    if (robloxKeys['ArrowRight']) robloxPlayer2.x += 4;
    if (robloxKeys['KeyW'] && robloxPlayer1.y === 220) robloxPlayer1.vy = robloxJumpForce;
    if (robloxKeys['ArrowUp'] && robloxPlayer2.y === 220) robloxPlayer2.vy = robloxJumpForce;
    robloxPlayer1.x = Math.max(80, Math.min(520, robloxPlayer1.x));
    robloxPlayer2.x = Math.max(80, Math.min(520, robloxPlayer2.x));

    [robloxPlayer1, robloxPlayer2].forEach(player => {
      player.vy += robloxGravity;
      player.y += player.vy;
      if (player.y > 220) {
        player.y = 220;
        player.vy = 0;
      }
      if (player.attackCooldown > 0) player.attackCooldown -= 1;
    });

    if (robloxPlayer1.health <= 0 || robloxPlayer2.health <= 0) {
      robloxRunning = false;
      const winner = robloxPlayer1.health > robloxPlayer2.health ? robloxPlayer1.name : robloxPlayer2.name;
      document.getElementById('robloxStatus').textContent = `${winner} wins the arena!`;
    }
  }

  function drawRoblox() {
    drawRobloxArena();
    drawRobloxPlayer(robloxPlayer1);
    drawRobloxPlayer(robloxPlayer2);
    robloxCtx.fillStyle = '#7ef4ff';
    robloxCtx.fillRect(20, 20, robloxPlayer1.health * 2, 10);
    robloxCtx.fillRect(420, 20, robloxPlayer2.health * 2, 10);
    robloxCtx.strokeStyle = '#8ef';
    robloxCtx.strokeRect(20, 20, 200, 10);
    robloxCtx.strokeRect(420, 20, 200, 10);
    robloxCtx.fillStyle = '#cde';
    robloxCtx.font = '14px Inter, Arial, sans-serif';
    robloxCtx.fillText('P1 HP', 20, 18);
    robloxCtx.fillText('P2 HP', 420, 18);
    if (!robloxRunning) {
      robloxCtx.fillStyle = '#ffdc33';
      robloxCtx.font = '20px Inter, Arial, sans-serif';
      robloxCtx.fillText('Press Reset Arena to play again', 150, 180);
    }
  }

  function robloxLoop() {
    updateRoblox();
    drawRoblox();
    if (robloxRunning) requestAnimationFrame(robloxLoop);
  }

  document.addEventListener('keydown', (e) => {
    if (['KeyA','KeyD','KeyW','KeyQ','KeyL','ArrowLeft','ArrowRight','ArrowUp'].includes(e.code)) {
      robloxKeys[e.code] = true;
    }
    if (e.code === 'KeyQ') performRobloxAttack(robloxPlayer1, robloxPlayer2);
    if (e.code === 'KeyL') performRobloxAttack(robloxPlayer2, robloxPlayer1);
  });

  document.addEventListener('keyup', (e) => {
    if (['KeyA','KeyD','KeyW','KeyQ','KeyL','ArrowLeft','ArrowRight','ArrowUp'].includes(e.code)) {
      robloxKeys[e.code] = false;
    }
  });

  // start
  resetRobloxGame();
}
