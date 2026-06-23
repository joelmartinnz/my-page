const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas setup
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
let gameState = {
  players: new Map(),
  currentPlayerId: null,
  gameRunning: false,
  keys: {
    w: false,
    a: false,
    s: false,
    d: false
  },
  cameraX: 0,
  cameraY: 0,
  territoryGrid: new Map(), // for collision and territory
  GRID_CELL_SIZE: 10,
  PLAYER_SPEED: 3,
  PLAYER_RADIUS: 8
};

// Initialize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Keyboard input
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w') gameState.keys.w = true;
  if (key === 'a') gameState.keys.a = true;
  if (key === 's') gameState.keys.s = true;
  if (key === 'd') gameState.keys.d = true;
});

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'w') gameState.keys.w = false;
  if (key === 'a') gameState.keys.a = false;
  if (key === 's') gameState.keys.s = false;
  if (key === 'd') gameState.keys.d = false;
});

function startGame() {
  const playerName = document.getElementById('playerName').value || 'Player';
  const roomId = document.getElementById('roomId').value || 'default';

  if (playerName.trim()) {
    document.getElementById('menu').style.display = 'none';
    socket.emit('joinGame', { playerName, roomId });
  }
}

// Socket events
socket.on('playerJoined', (data) => {
  console.log('Players joined:', data.players);
  gameState.currentPlayerId = data.currentPlayerId;
  
  data.players.forEach(player => {
    gameState.players.set(player.id, {
      ...player,
      screenX: canvas.width / 2,
      screenY: canvas.height / 2,
      trail: player.trail || [],
      isLocal: player.id === gameState.currentPlayerId
    });
  });

  updatePlayerList();
});

socket.on('gameStarted', () => {
  gameState.gameRunning = true;
  console.log('Game started!');
});

socket.on('playerMoved', (data) => {
  const player = gameState.players.get(data.playerId);
  if (player) {
    player.x = data.x;
    player.y = data.y;
    player.vx = data.vx;
    player.vy = data.vy;
    player.isTrailing = data.isTrailing;
  }
});

socket.on('territoryUpdated', (data) => {
  data.players.forEach(player => {
    const localPlayer = gameState.players.get(player.id);
    if (localPlayer) {
      localPlayer.territory = player.territory;
    }
  });
  updatePlayerList();
});

socket.on('playerEliminated', (data) => {
  const player = gameState.players.get(data.playerId);
  if (player) {
    player.alive = false;
  }
});

socket.on('playerRespawned', (data) => {
  const player = gameState.players.get(data.playerId);
  if (player) {
    player.x = data.players.find(p => p.id === data.playerId).x;
    player.y = data.players.find(p => p.id === data.playerId).y;
    player.alive = true;
    player.trail = [];
  }
});

socket.on('playerLeft', (data) => {
  gameState.players.delete(data.playerId);
  updatePlayerList();
});

socket.on('roomFull', () => {
  alert('Room is full!');
  location.reload();
});

function updatePlayerList() {
  const playerList = document.getElementById('playerList');
  playerList.innerHTML = '';
  
  const sortedPlayers = Array.from(gameState.players.values()).sort((a, b) => (b.territory || 0) - (a.territory || 0));
  
  sortedPlayers.forEach((player, index) => {
    const div = document.createElement('div');
    div.className = 'player-item';
    div.innerHTML = `
      <div class="player-dot" style="background-color: ${player.color};"></div>
      <div class="player-info">
        <div class="player-name">${index + 1}. ${player.name} ${player.alive === false ? '✕' : ''}</div>
        <div class="player-territory">${Math.floor(player.territory || 0)} territory</div>
      </div>
    `;
    playerList.appendChild(div);
  });
}

// Game loop
function gameLoop() {
  // Update local player
  const localPlayer = gameState.players.get(gameState.currentPlayerId);
  if (localPlayer && gameState.gameRunning) {
    updateLocalPlayer(localPlayer);
  }

  // Update camera to follow local player
  if (localPlayer) {
    gameState.cameraX = localPlayer.x - canvas.width / 2;
    gameState.cameraY = localPlayer.y - canvas.height / 2;
  }

  // Render
  render();
  requestAnimationFrame(gameLoop);
}

function updateLocalPlayer(player) {
  if (!player.alive) return;

  // Calculate direction from WASD keys
  let dx = 0;
  let dy = 0;

  if (gameState.keys.w) dy -= 1;
  if (gameState.keys.s) dy += 1;
  if (gameState.keys.a) dx -= 1;
  if (gameState.keys.d) dx += 1;

  // Normalize diagonal movement
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 0) {
    player.vx = (dx / dist) * gameState.PLAYER_SPEED;
    player.vy = (dy / dist) * gameState.PLAYER_SPEED;
  } else {
    player.vx = 0;
    player.vy = 0;
  }

  // Update position
  player.x += player.vx;
  player.y += player.vy;

  // Keep in bounds
  const WORLD_SIZE = 2000;
  player.x = Math.max(0, Math.min(WORLD_SIZE, player.x));
  player.y = Math.max(0, Math.min(WORLD_SIZE, player.y));

  // Check if trailing (away from center of territory)
  const isTrailing = isPlayerTrailing(player);
  
  if (!player.isTrailing && isTrailing) {
    player.trail = [];
  }
  
  player.isTrailing = isTrailing;

  // Check collisions with other players
  checkCollisions(player);

  // Emit movement
  socket.emit('movePlayer', {
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    isTrailing: player.isTrailing
  });

  updatePlayerList();
}

function isPlayerTrailing(player) {
  // Check if player is in contested/unclaimed territory
  const cellKey = `${Math.floor(player.x / gameState.GRID_CELL_SIZE)},${Math.floor(player.y / gameState.GRID_CELL_SIZE)}`;
  
  // For now, players at map edges or far from spawn claim territory
  return Math.sqrt(player.x * player.x + player.y * player.y) > 200;
}

function checkCollisions(player) {
  // Check if player hits another player's trail
  gameState.players.forEach((otherPlayer) => {
    if (otherPlayer.id === player.id || !otherPlayer.alive) return;

    // Check collision with other player's trail
    if (otherPlayer.isTrailing && otherPlayer.trail.length > 0) {
      for (let point of otherPlayer.trail) {
        const dx = player.x - point.x;
        const dy = player.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < gameState.PLAYER_RADIUS + 5) {
          // Collision! Player dies
          playerDies(player);
          return;
        }
      }
    }

    // Check collision with other player directly
    const dx = player.x - otherPlayer.x;
    const dy = player.y - otherPlayer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < gameState.PLAYER_RADIUS * 2) {
      playerDies(player);
      return;
    }
  });

  // Check if player closes a loop (gains territory)
  if (player.isTrailing && player.trail.length > 30) {
    const lastTrail = player.trail[player.trail.length - 1];
    const firstTrail = player.trail[0];

    const dx = player.x - player.trail[0].x;
    const dy = player.y - player.trail[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30) {
      // Loop closed! Claim territory
      const territoryGained = calculateTerritory(player.trail);
      socket.emit('claimTerritory', { amount: territoryGained });
      player.trail = [];
      player.isTrailing = false;
    }
  }
}

function calculateTerritory(trail) {
  // Simple calculation: area of polygon using shoelace formula
  if (trail.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < trail.length - 1; i++) {
    area += trail[i].x * trail[i + 1].y - trail[i + 1].x * trail[i].y;
  }
  
  area = Math.abs(area / 2);
  return Math.floor(area / 100); // Normalize
}

function playerDies(player) {
  player.alive = false;
  player.trail = [];
  socket.emit('playerDied');
  
  // Respawn after 3 seconds
  setTimeout(() => {
    socket.emit('respawn');
  }, 3000);
}

function render() {
  // Clear canvas
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid background
  drawGridBackground();

  // Draw territories and trails
  gameState.players.forEach((player) => {
    if (player.alive) {
      drawPlayerTrail(player);
    }
  });

  // Draw players
  gameState.players.forEach((player) => {
    if (player.alive) {
      drawPlayer(player);
    }
  });

  // Draw UI overlay
  drawUI();
}

function drawGridBackground() {
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;

  const startX = Math.floor(gameState.cameraX / 50) * 50;
  const startY = Math.floor(gameState.cameraY / 50) * 50;

  for (let x = startX; x < gameState.cameraX + canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x - gameState.cameraX, 0);
    ctx.lineTo(x - gameState.cameraX, canvas.height);
    ctx.stroke();
  }

  for (let y = startY; y < gameState.cameraY + canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y - gameState.cameraY);
    ctx.lineTo(canvas.width, y - gameState.cameraY);
    ctx.stroke();
  }
}

function drawPlayerTrail(player) {
  if (player.trail.length < 2) return;

  ctx.strokeStyle = player.color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  const firstPoint = player.trail[0];
  ctx.moveTo(firstPoint.x - gameState.cameraX, firstPoint.y - gameState.cameraY);

  for (let i = 1; i < player.trail.length; i++) {
    const point = player.trail[i];
    ctx.lineTo(point.x - gameState.cameraX, point.y - gameState.cameraY);
  }

  ctx.stroke();
  ctx.globalAlpha = 1.0;
}

function drawPlayer(player) {
  const screenX = player.x - gameState.cameraX;
  const screenY = player.y - gameState.cameraY;

  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.arc(screenX, screenY + 3, gameState.PLAYER_RADIUS + 2, 0, Math.PI * 2);
  ctx.fill();

  // Draw player circle
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(screenX, screenY, gameState.PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw name (only if local player or close)
  if (player.isLocal || true) {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(player.name, screenX, screenY + gameState.PLAYER_RADIUS + 5);
  }
}

function drawUI() {
  // Draw FPS and status
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Players: ${gameState.players.size}`, 10, 20);

  const localPlayer = gameState.players.get(gameState.currentPlayerId);
  if (localPlayer) {
    ctx.fillText(`Territory: ${Math.floor(localPlayer.territory || 0)}`, 10, 35);
    ctx.fillText(`Status: ${localPlayer.alive ? 'Alive' : 'Dead - Respawning...'}`, 10, 50);
  }
}

// Start game loop
gameLoop();
