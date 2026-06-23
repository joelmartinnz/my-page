# Railway Deployment Guide for Paper.io

## Quick Setup (5 minutes)

### 1. Create Railway Account
- Go to https://railway.app
- Sign up (free tier available)
- Connect your GitHub account

### 2. Deploy to Railway
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `joelmartinnz/my-page` repository
4. Railway will auto-detect Node.js app and build it
5. Wait for deployment to complete (~2 minutes)

### 3. Get Your Railway URL
- Once deployed, Railway will show you the public URL
- It looks like: `https://your-project.up.railway.app`

### 4. Update Config
Edit `paper-io/config.js` and replace:
```javascript
GAME_SERVER_URL = 'https://paper-io-game-production.up.railway.app';
```

With your actual Railway URL from step 3.

### 5. Commit and Push
```bash
git add .
git commit -m "Update Paper.io with Railway deployment"
git push
```

Railway will auto-redeploy when you push!

## After Deployment

### Test Connection
1. Go to https://joelmartinnz.github.io/my-page/
2. Click "Join Game" in Paper.io card
3. You should see "Waiting for players..."
4. Open the game in another browser/device and use same room ID

### Troubleshooting

**"Connection refused" error?**
- Check Railway dashboard - is the app running?
- Make sure config.js has the correct Railway URL
- Check browser console (F12) for exact error

**Can't see other players?**
- Verify both players are on the same Room ID
- Check railway logs for errors (Railway Dashboard > Logs)

**Game is slow/laggy?**
- Railway free tier may have limitations
- Try upgrading to Railway's paid tier for better performance

## How It Works

1. **GitHub Pages** hosts the static files (HTML, CSS, JS)
   - URL: https://joelmartinnz.github.io/my-page/

2. **Railway** hosts the Node.js game server
   - URL: https://your-project.up.railway.app

3. **Browser** loads the game from GitHub Pages, then connects to Railway for multiplayer

## Making Changes

After deployment, any changes you push to GitHub will:
1. GitHub Pages updates automatically
2. Railway auto-rebuilds and redeploys

No manual deployment needed!
