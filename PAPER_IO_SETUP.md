# Paper.io Multiplayer Game - Setup Guide

## Overview
A real-time multiplayer Paper.io game where you claim territory by drawing closed loops. Perfect for playing with friends online!

## Features
- **Real-time multiplayer** - Play with up to 8 friends simultaneously
- **Claim territory** - Draw loops to claim territory and earn points
- **Player leaderboard** - See who has the most territory
- **Smooth canvas rendering** - Optimized for 60 FPS gameplay
- **Cross-platform** - Play on any device with a web browser

## Installation & Setup

### 1. Install Dependencies
```bash
cd /Users/joelmartin/Desktop/codes/my-cool-web-site.awsome.boom
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will run on `http://localhost:3000`

### 3. Access the Game
- Open your browser to `http://localhost:3000`
- Click "Join Game" in the Paper.io card
- Or go directly to `http://localhost:3000/paper-io`

### 4. Share with Friends
1. Get your local IP address:
   - **Mac/Linux**: Run `ipconfig getifaddr en0`
   - **Windows**: Run `ipconfig` and look for IPv4 Address

2. Share this URL with friends:
   ```
   http://<YOUR_IP>:3000/paper-io
   ```

3. Each player should:
   - Enter their name
   - Use the same Room ID (e.g., "default")
   - Click Play

## How to Play

### Objective
Claim the most territory while avoiding other players' trails!

### Controls
- **Mouse movement** - Move your character
- **Automatic trailing** - You'll automatically start a trail when in unclaimed territory
- **Close loops** - Complete your trail loop to claim territory
- **Avoid collisions** - Don't hit other players' trails or you'll be eliminated!

### Game Rules
1. Players spawn randomly on the map
2. Move your character around the game world
3. Create closed loops to claim territory (shown by your color)
4. Each loop claims points based on the enclosed area
5. Other players can cut your trail if you haven't closed the loop yet
6. If you hit an opponent's trail, they are eliminated and respawn after 3 seconds
7. The leaderboard on the right shows territory standings

## Game Mechanics

### Territory Claiming
- Draw a path and return to near your starting point to close a loop
- The enclosed area becomes your territory
- Territory points are calculated using the shoelace formula (area calculation)

### Collisions
- Hitting another player's trail eliminates you
- You respawn automatically after 3 seconds
- Hitting the edge of the map is safe

### Trailing System
- Players only leave trails when in contested (unclaimed) territory
- Trails disappear once you respawn or close a loop
- Trails are rendered in your color for visibility

## Network Information

### Server Features
- **WebSocket Communication** - Real-time game state sync
- **Room-based Matchmaking** - Multiple games can run with same room ID
- **Max 8 players per room** - Optimal for gameplay
- **Automatic cleanup** - Empty rooms are removed

### Server Endpoints
- `GET /` - Serves static files
- WebSocket - Real-time game events

## Troubleshooting

### "Connection refused" error
- Make sure the server is running (`npm start`)
- Check that port 3000 is not blocked by firewall
- Try `http://localhost:3000` locally first

### Friends can't connect
- Use your local IP (not localhost)
- Check firewall settings to allow port 3000
- Ensure both devices are on the same network (or use port forwarding)
- Verify the Room ID is the same for all players

### Game is lagging
- Check internet connection
- Reduce number of players in the room
- Close other browser tabs
- Check browser console for errors (F12)

### Can't see other players
- Verify they're using the same Room ID
- Refresh the page (F5)
- Check browser console for connection errors

## File Structure
```
/Users/joelmartin/Desktop/codes/my-cool-web-site.awsome.boom/
├── server.js           # Express + Socket.io backend
├── package.json        # Dependencies
├── index.html          # Main arcade page
├── paper-io/
│   ├── index.html      # Game UI
│   └── game.js         # Game logic & rendering
├── shared/
│   └── utils.js
└── [other games...]
```

## Future Improvements
- [ ] Power-ups (speed boost, shield, etc.)
- [ ] Different game modes (survival, time attack)
- [ ] Sound effects and music
- [ ] Mobile touch controls
- [ ] Player stats and rankings
- [ ] Replay system
- [ ] Custom skins/colors

## Browser Support
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Enjoy the game! 🎮
