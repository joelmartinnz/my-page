const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('.'));

// Game state
const gameRooms = new Map();
const MAX_ROOM_PLAYERS = 8;
const GRID_SIZE = 2000;

class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = new Map();
    this.territories = new Map(); // territory grid
    this.gameState = 'waiting'; // waiting, playing, ended
    this.startTime = null;
  }

  addPlayer(playerId, playerName, color) {
    const spawnX = Math.random() * GRID_SIZE;
    const spawnY = Math.random() * GRID_SIZE;
    
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      color: color,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      trail: [],
      territory: 0,
      alive: true,
      trailColor: color,
      isTrailing: false
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  getPlayerCount() {
    return this.players.size;
  }

  getPlayers() {
    return Array.from(this.players.values());
  }

  updatePlayerPos(playerId, x, y, vx, vy, isTrailing) {
    const player = this.players.get(playerId);
    if (player) {
      player.x = x;
      player.y = y;
      player.vx = vx;
      player.vy = vy;
      player.isTrailing = isTrailing;
      
      if (isTrailing) {
        player.trail.push({ x, y });
        // Keep trail history limited
        if (player.trail.length > 500) {
          player.trail.shift();
        }
      } else {
        player.trail = [];
      }
    }
  }

  updateTerritory(playerId, amount) {
    const player = this.players.get(playerId);
    if (player) {
      player.territory = (player.territory || 0) + amount;
    }
  }
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);

  socket.on('joinGame', (data) => {
    const { roomId, playerName } = data;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Get or create room
    if (!gameRooms.has(roomId)) {
      gameRooms.set(roomId, new GameRoom(roomId));
    }

    const room = gameRooms.get(roomId);
    
    if (room.getPlayerCount() >= MAX_ROOM_PLAYERS) {
      socket.emit('roomFull');
      return;
    }

    room.addPlayer(socket.id, playerName, color);
    socket.join(roomId);
    socket.roomId = roomId;

    // Notify all players in room
    io.to(roomId).emit('playerJoined', {
      players: room.getPlayers(),
      currentPlayerId: socket.id
    });

    console.log(`${playerName} joined room ${roomId}. Players: ${room.getPlayerCount()}`);

    // Auto-start game if 2+ players
    if (room.getPlayerCount() >= 2 && room.gameState === 'waiting') {
      room.gameState = 'playing';
      room.startTime = Date.now();
      io.to(roomId).emit('gameStarted', { gameState: room.getPlayers() });
    }
  });

  socket.on('movePlayer', (data) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room) return;

    const { x, y, vx, vy, isTrailing } = data;
    room.updatePlayerPos(socket.id, x, y, vx, vy, isTrailing);

    // Broadcast to all players in room
    io.to(roomId).emit('playerMoved', {
      playerId: socket.id,
      x, y, vx, vy, isTrailing
    });
  });

  socket.on('claimTerritory', (data) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room) return;

    const { amount } = data;
    room.updateTerritory(socket.id, amount);

    io.to(roomId).emit('territoryUpdated', {
      players: room.getPlayers()
    });
  });

  socket.on('playerDied', () => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.alive = false;
    }

    io.to(roomId).emit('playerEliminated', {
      playerId: socket.id,
      players: room.getPlayers()
    });
  });

  socket.on('respawn', () => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.x = Math.random() * GRID_SIZE;
      player.y = Math.random() * GRID_SIZE;
      player.trail = [];
      player.alive = true;
    }

    io.to(roomId).emit('playerRespawned', {
      playerId: socket.id,
      players: room.getPlayers()
    });
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (room) {
      room.removePlayer(socket.id);
      
      io.to(roomId).emit('playerLeft', {
        playerId: socket.id,
        players: room.getPlayers()
      });

      // Clean up empty rooms
      if (room.getPlayerCount() === 0) {
        gameRooms.delete(roomId);
      }
    }

    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
