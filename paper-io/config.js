// Game server configuration
// This file determines where the game connects to

let GAME_SERVER_URL = '';

// Detect if running locally or on GitHub Pages
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Local development
  GAME_SERVER_URL = `http://localhost:3000`;
} else {
  // Production - set this to your Railway URL
  // Format: https://your-railway-project.railway.app
  GAME_SERVER_URL = 'https://web-production-be268.up.railway.app';
}

console.log('Game Server URL:', GAME_SERVER_URL);
