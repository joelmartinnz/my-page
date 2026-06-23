const selectElement = document.getElementById('characterSelect');

const warhammerCharacters = {
  roboute: { name: 'Roboute Guilliman', health: 140, color: '#a8f8ff', ability: { name: "Emperor's Sword", description: 'Power strike that ignores armor and deals heavy damage.', cooldown: 2, execute(player, enemy) { const distance = Math.abs(player.x - enemy.x); if (distance <= 240) { const damage = 30; enemy.health = Math.max(0, enemy.health - damage); return `Phoenix Spear strikes for ${damage}!`; } return 'Phoenix Spear missed because the enemy is too far.'; } } },
  calgar: { name: 'Marneus Calgar', health: 130, color: '#83c3ff', ability: { name: 'Battle Focus', description: 'Heal and empower your next attack.', cooldown: 80, execute(player) { const heal = Math.min(player.maxHealth - player.health, 22); player.health += heal; player.nextAttackBonus = (player.nextAttackBonus || 0) + 8; return `Calgar heals ${heal} HP and readies a stronger strike.`; } } },
  farsight: { name: 'Commander Farsight', health: 120, color: '#8fc2ff', ability: { name: 'Plasma Volley', description: 'Ranged blast that hits from afar.', cooldown: 70, execute(player, enemy) { const distance = Math.abs(player.x - enemy.x); if (distance <= 360) { const damage = 20; enemy.health = Math.max(0, enemy.health - damage); return `Plasma Volley hits for ${damage} damage!`; } return 'Plasma Volley fails to reach the target.'; } } },
  sanguinius: { name: 'Sanguinius', health: 125, color: '#ff9f9f', ability: { name: 'Winged Charge', description: 'Dash and smash the enemy with a devastating blow.', cooldown: 85, execute(player, enemy) { player.x = clamp(enemy.x - 70, 70, 360); const damage = 26; enemy.health = Math.max(0, enemy.health - damage); return `Winged Charge slams into the foe for ${damage}!`; } } },
  azrael: { name: 'Azrael', health: 120, color: '#f8d98c', ability: { name: 'Shield of Faith', description: 'Raise a holy shield that halves the next incoming damage.', cooldown: 75, execute(player) { player.shield = 0.5; return 'Shield of Faith is active. Next hit deals half damage.'; } } },
  sisters: { name: 'Sister Superior', health: 110, color: '#ffb8d0', ability: { name: 'Divine Prayer', description: 'Restore health with a healing prayer.', cooldown: 60, execute(player) { const heal = Math.min(player.maxHealth - player.health, 24); player.health += heal; return `Divine Prayer heals ${heal} HP.`; } } },
  cawl: { name: 'Archmagos Cawl', health: 100, color: '#d0d0ff', ability: { name: 'Omniscience', description: 'Advanced machine logic heals and steadies you.', cooldown: 65, execute(player) { const heal = Math.min(player.maxHealth - player.health, 18); player.health += heal; player.nextAttackBonus = (player.nextAttackBonus || 0) + 4; return `Omniscience restores ${heal} HP and sharpens your aim.`; } } },
  kitanica: { name: 'Kitanica', health: 115, color: '#c8efff', ability: { name: 'Blade Flurry', description: 'Unleash a rapid multi-cut combo.', cooldown: 70, execute(player, enemy) { const damage = 22; enemy.health = Math.max(0, enemy.health - damage); return `Blade Flurry lands ${damage} damage in a blur!`; } } },
  cypher: { name: 'Cypher', health: 105, color: '#d6d6d6', ability: { name: 'Silent Strike', description: 'A precision attack that hits harder up close.', cooldown: 70, execute(player, enemy) { const distance = Math.abs(player.x - enemy.x); if (distance <= 140) { const damage = 24; enemy.health = Math.max(0, enemy.health - damage); return `Silent Strike deals ${damage} damage!`; } return 'Silent Strike needs you closer to the enemy.'; } } },
  creed: { name: 'Lord Castellan Ursarkar E. Creed', health: 120, color: '#d0b87a', ability: { name: 'Imperial Order', description: 'Stun the enemy by forcing them to hesitate.', cooldown: 85, execute(player, enemy) { enemy.cooldown += 22; return 'Imperial Order slows the enemy reaction!'; } } }
};

function getSelectedWarhammerCharacter() {
  const selected = document.getElementById('characterSelect').value;
  return warhammerCharacters[selected] || warhammerCharacters.roboute;
}

function refreshAbilityDisplay() {
  const selected = getSelectedWarhammerCharacter();
  document.getElementById('abilityInfo').textContent = `${selected.ability.name}: ${selected.ability.description}`;
  const status = player && player.abilityCooldown > 0 ? `Cooldown: ${player.abilityCooldown}` : 'Ready to use';
  document.getElementById('abilityStatus').textContent = `Special Ability — ${selected.ability.name} (${status})`;
  document.getElementById('abilityBtn').disabled = !fightRunning || (player && player.abilityCooldown > 0);
}

function useAbility() {
  if (!fightRunning || !player || player.abilityCooldown > 0) return;
  const result = player.ability.execute(player, enemy);
  player.abilityCooldown = player.ability.cooldown;
  fightMessage = result;
  refreshAbilityDisplay();
}

const fightCanvas = document.getElementById('warhammerCanvas');
if (fightCanvas) {
  const fightCtx = fightCanvas.getContext('2d');
  let fightRunning = false;
  let bossMode = false;
  let player = { x: 140, y: 220, health: 100, maxHealth: 100, action: 'idle', timer: 0, abilityCooldown: 0, nextAttackBonus: 0, shield: 0 };
  let enemy = { x: 460, y: 220, health: 100, maxHealth: 100, action: 'idle', timer: 0, cooldown: 30, isBoss: false };
  let fightMessage = 'Press Start to deploy Lord Guilliman.';
  const fightKeys = { left: false, right: false };
  let sparks = [];
  let currentLevel = 1;

  if (selectElement) {
    selectElement.addEventListener('change', refreshAbilityDisplay);
  }
  refreshAbilityDisplay();

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function buildWarhammerPlayer(selected) {
    const levelBonus = (currentLevel - 1) * 8;
    return {
      x: 140,
      y: 220,
      health: selected.health + levelBonus,
      maxHealth: selected.health + levelBonus,
      action: 'idle',
      timer: 0,
      name: selected.name,
      color: selected.color,
      isBoss: false,
      ability: selected.ability,
      abilityCooldown: 0,
      nextAttackBonus: 0,
      shield: 0,
      attackPower: levelBonus * 0.35
    };
  }

  function buildWarhammerEnemy(isBoss) {
    const baseHealth = isBoss ? 250 : 120;
    const healthBonus = currentLevel * 15;
    return {
      x: isBoss ? 470 : 460,
      y: 220,
      health: baseHealth + healthBonus,
      maxHealth: baseHealth + healthBonus,
      action: 'idle',
      timer: 0,
      cooldown: isBoss ? 15 : 30,
      isBoss,
      name: isBoss ? 'Gutrot Spume' : 'Chaos Champion',
      color: isBoss ? '#ffb64a' : '#57a7ff',
      attackPower: currentLevel * 0.8
    };
  }

  function startFight() {
    bossMode = false;
    fightRunning = true;
    const selected = getSelectedWarhammerCharacter();
    player = buildWarhammerPlayer(selected);
    enemy = buildWarhammerEnemy(false);
    fightMessage = `Level ${currentLevel}: ${selected.name} descends into battle!`;
    document.getElementById('fightStatus').textContent = fightMessage;
    refreshAbilityDisplay();
    fightLoop();
  }

  function startBossFight() {
    bossMode = true;
    fightRunning = true;
    const selected = getSelectedWarhammerCharacter();
    player = buildWarhammerPlayer(selected);
    enemy = buildWarhammerEnemy(true);
    fightMessage = `Level ${currentLevel}: ${selected.name} faces Gutrot Spume!`;
    document.getElementById('fightStatus').textContent = fightMessage;
    refreshAbilityDisplay();
    fightLoop();
  }

  function setPlayerAction(action) {
    if (!fightRunning || player.action !== 'idle') return;
    player.action = action;
    player.timer = action === 'kick' ? 22 : 16;
  }

  function applyAttack(attacker, defender, action, side) {
    const distance = Math.abs(attacker.x - defender.x);
    const attackerName = attacker.name || (side === 'Player' ? 'Guilliman' : 'Enemy');
    if (distance <= 130) {
      let damage = action === 'kick' ? 18 : 12;
      damage += attacker.nextAttackBonus || 0;
      damage += attacker.attackPower || 0;
      attacker.nextAttackBonus = 0;
      if (attacker.isBoss) damage += 10;
      if (defender.isBoss && side === 'Player') damage += 8;
      if (defender.shield > 0) {
        const shieldBlock = Math.floor(damage * defender.shield);
        damage = Math.max(0, damage - shieldBlock);
        defender.shield = 0;
      }
      defender.health = Math.max(0, defender.health - damage);
      fightMessage = `${attackerName} ${action}s and deals ${damage}!`;
    } else {
      fightMessage = `${attackerName} ${action}s and misses.`;
    }
  }

  function spawnSpark(x, y) {
    sparks.push({ x, y, radius: 4, alpha: 1 });
  }

  function updateSparks() {
    sparks = sparks.filter(spark => spark.alpha > 0);
    sparks.forEach(spark => {
      spark.radius += 0.8;
      spark.alpha -= 0.03;
    });
  }

  function updateFight() {
    if (!fightRunning) return;
    if (player.abilityCooldown > 0) player.abilityCooldown = Math.max(0, player.abilityCooldown - 1);
    if (fightKeys.left) player.x -= 4;
    if (fightKeys.right) player.x += 4;
    player.x = clamp(player.x, 70, 360);

    if (player.action !== 'idle') {
      player.timer -= 1;
      if (player.timer <= 0) {
        applyAttack(player, enemy, player.action, 'Player');
        spawnSpark((player.x + enemy.x) / 2, player.y - 18);
        player.action = 'idle';
      }
    }

    if (enemy.cooldown > 0) {
      enemy.cooldown -= 1;
    } else if (enemy.action === 'idle') {
      const distance = Math.abs(player.x - enemy.x);
      if (distance > (enemy.isBoss ? 180 : 140)) {
        enemy.action = 'move';
        enemy.timer = enemy.isBoss ? 32 : 40;
      } else {
        if (enemy.isBoss && Math.random() < 0.5) {
          enemy.action = 'kick';
        } else {
          enemy.action = Math.random() < 0.6 ? 'punch' : 'kick';
        }
        enemy.timer = enemy.action === 'kick' ? (enemy.isBoss ? 24 : 22) : 18;
      }
    }

    if (enemy.action === 'move') {
      enemy.x += player.x < enemy.x ? -3 : 3;
      enemy.x = clamp(enemy.x, enemy.isBoss ? 240 : 260, 520);
      enemy.timer -= 1;
      if (enemy.timer <= 0) {
        enemy.action = 'idle';
        enemy.cooldown = enemy.isBoss ? 10 : 15;
      }
    } else if (enemy.action !== 'idle') {
      enemy.timer -= 1;
      if (enemy.timer <= 0) {
        applyAttack(enemy, player, enemy.action, 'Enemy');
        spawnSpark((player.x + enemy.x) / 2, player.y - 18);
        spawnSpark((player.x + enemy.x) / 2, player.y - 18);
        enemy.action = 'idle';
        enemy.cooldown = enemy.isBoss ? 25 : 30;
      }
    }

    if (player.health <= 0 || enemy.health <= 0) {
      fightRunning = false;
      if (player.health <= 0) {
        fightMessage = `${enemy.name || 'Enemy'} wins! Level reset to 1. Click Start to fight again.`;
        currentLevel = 1;
      } else {
        fightMessage = `${player.name || 'Guilliman'} wins Level ${currentLevel}!`;
        setTimeout(() => {
          currentLevel++;
          if (currentLevel % 2 === 0) {
            startBossFight();
          } else {
            startFight();
          }
        }, 3000);
      }
    }
    updateSparks();
    refreshAbilityDisplay();
    document.getElementById('fightStatus').textContent = fightMessage;
  }

  function drawWarhammerMarine(ctx, actor, color, isPlayer) {
    ctx.save();
    const x = actor.x;
    const y = actor.y;
    const armor = color;
    const accent = actor.isBoss ? '#c6e088' : '#d5f4ff';
    const visor = actor.isBoss ? '#1a271b' : '#12223e';
    const glow = actor.isBoss ? 'rgba(120, 255, 110, 0.22)' : 'rgba(120, 220, 255, 0.16)';

    drawShadow(ctx, x, y + 24, 84);
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, y - 18, 74, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawCube(ctx, x - 30, y - 42, 60, 48, 18, armor);
    drawCube(ctx, x - 14, y - 90, 28, 28, 14, armor);
    drawCube(ctx, x - 46, y - 36, 18, 40, 12, armor);
    drawCube(ctx, x + 28, y - 36, 18, 40, 12, armor);
    drawCube(ctx, x - 28, y + 12, 18, 34, 12, armor);
    drawCube(ctx, x + 10, y + 12, 18, 34, 12, armor);
    drawCube(ctx, x - 54, y - 54, 26, 18, 10, armor);
    drawCube(ctx, x + 28, y - 54, 26, 18, 10, armor);
    drawCube(ctx, x - 30, y - 12, 8, 14, 10, accent);
    drawCube(ctx, x + 22, y - 12, 8, 14, 10, accent);

    ctx.fillStyle = accent;
    ctx.fillRect(x - 14, y - 24, 28, 10);
    ctx.fillRect(x - 10, y - 4, 20, 8);
    ctx.fillStyle = visor;
    ctx.fillRect(x - 16, y - 78, 32, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.strokeRect(x - 16, y - 78, 32, 14);
    ctx.fillStyle = actor.isBoss ? '#8cff8c' : '#9ff3ff';
    ctx.fillRect(x - 8, y - 72, 16, 6);

    ctx.fillStyle = actor.isBoss ? '#7ba85a' : '#88c8ff';
    ctx.beginPath();
    ctx.moveTo(x + 15, y - 32);
    ctx.lineTo(x + 22, y - 46);
    ctx.lineTo(x + 30, y - 32);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 32);
    ctx.lineTo(x - 22, y - 46);
    ctx.lineTo(x - 30, y - 32);
    ctx.closePath();
    ctx.fill();

    if (actor.isBoss) {
      ctx.fillStyle = '#a4c68f';
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 94);
      ctx.lineTo(x, y - 108);
      ctx.lineTo(x + 10, y - 94);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#dcd9c2';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 22);
    ctx.lineTo(x + 10, y - 22);
    ctx.lineTo(x, y - 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawFight() {
    const arena = fightCtx.createLinearGradient(0, 0, 0, fightCanvas.height);
    arena.addColorStop(0, '#05080f');
    arena.addColorStop(0.25, '#08101c');
    arena.addColorStop(0.55, '#05060e');
    arena.addColorStop(1, '#030408');
    fightCtx.fillStyle = arena;
    fightCtx.fillRect(0, 0, fightCanvas.width, fightCanvas.height);

    fightCtx.save();
    fightCtx.globalAlpha = 0.18;
    fightCtx.fillStyle = 'rgba(200, 90, 30, 0.16)';
    fightCtx.beginPath();
    fightCtx.ellipse(300, 150, 260, 100, 0, 0, Math.PI * 2);
    fightCtx.fill();
    fightCtx.restore();

    fightCtx.save();
    fightCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    fightCtx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const offset = 40 + i * 50;
      fightCtx.beginPath();
      fightCtx.moveTo(offset, 0);
      fightCtx.lineTo(offset - 20, fightCanvas.height);
      fightCtx.stroke();
    }
    fightCtx.restore();

    fightCtx.save();
    fightCtx.globalAlpha = 0.2;
    fightCtx.strokeStyle = 'rgba(255,255,255,0.08)';
    fightCtx.lineWidth = 1;
    for (let i = 0; i <= 14; i++) {
      const px = i * (fightCanvas.width / 14);
      fightCtx.beginPath();
      fightCtx.moveTo(px, 248);
      fightCtx.lineTo(160 + (px - 160) * 0.5, fightCanvas.height);
      fightCtx.stroke();
    }
    for (let j = 0; j <= 6; j++) {
      const yy = 248 + j * 10;
      fightCtx.beginPath();
      fightCtx.moveTo(0, yy);
      fightCtx.lineTo(fightCanvas.width, yy + 8);
      fightCtx.stroke();
    }
    fightCtx.restore();

    fightCtx.save();
    fightCtx.globalCompositeOperation = 'screen';
    fightCtx.fillStyle = 'rgba(255,255,255,0.06)';
    fightCtx.beginPath();
    fightCtx.arc(160, 70, 90, 0, Math.PI * 2);
    fightCtx.fill();
    fightCtx.beginPath();
    fightCtx.arc(460, 60, 70, 0, Math.PI * 2);
    fightCtx.fill();
    fightCtx.restore();

    fightCtx.fillStyle = '#081b2d';
    fightCtx.fillRect(0, 248, fightCanvas.width, 52);
    fightCtx.strokeStyle = 'rgba(255, 236, 132, 0.18)';
    fightCtx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      fightCtx.beginPath();
      fightCtx.moveTo(i * 60, 248);
      fightCtx.lineTo(fightCanvas.width / 2 + (i - 5) * 14, fightCanvas.height);
      fightCtx.stroke();
    }
    fightCtx.fillStyle = '#0f8';
    fightCtx.fillRect(20, 30, (player.health / player.maxHealth) * 160, 14);
    fightCtx.strokeStyle = '#8ef';
    fightCtx.lineWidth = 2;
    fightCtx.strokeRect(20, 30, 160, 14);
    fightCtx.fillStyle = enemy.isBoss ? '#ffb14d' : '#f55';
    fightCtx.fillRect(420, 30, (enemy.health / enemy.maxHealth) * 160, 14);
    fightCtx.strokeStyle = enemy.isBoss ? '#ffc587' : '#f9a';
    fightCtx.strokeRect(420, 30, 160, 14);
    fightCtx.fillStyle = '#cde';
    fightCtx.font = '16px Inter, Arial, sans-serif';
    fightCtx.fillText(player.name || 'Guilliman HP', 20, 22);
    fightCtx.fillText(enemy.name || (enemy.isBoss ? 'Chaos Overlord HP' : 'Enemy HP'), 420, 22);
    drawWarhammerMarine(fightCtx, player, player.color || '#a8f8ff', true);
    drawWarhammerMarine(fightCtx, enemy, enemy.color || (enemy.isBoss ? '#ffb64a' : '#57a7ff'), false);
    fightCtx.globalCompositeOperation = 'lighter';
    sparks.forEach(spark => {
      fightCtx.fillStyle = `rgba(170, 255, 255, ${spark.alpha})`;
      fightCtx.beginPath();
      fightCtx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
      fightCtx.fill();
    });
    fightCtx.globalCompositeOperation = 'source-over';
    fightCtx.fillStyle = '#aaffff';
    fightCtx.font = '18px Inter, Arial, sans-serif';
    fightCtx.fillText(fightMessage, 20, 205);
    if (!fightRunning) {
      fightCtx.fillStyle = '#ffdc33';
      fightCtx.font = '20px Inter, Arial, sans-serif';
      fightCtx.fillText('Press Start to fight', 190, 150);
    }
  }

  function fightLoop() {
    updateFight();
    drawFight();
    if (fightRunning) {
      requestAnimationFrame(fightLoop);
    }
  }

  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || e.code === 'ArrowLeft') fightKeys.left = true;
    if (key === 'd' || e.code === 'ArrowRight') fightKeys.right = true;
    if (fightRunning && (key === 'w' || e.code === 'ArrowUp')) setPlayerAction('punch');
    if (fightRunning && (key === 's' || e.code === 'ArrowDown')) setPlayerAction('kick');
    if (fightRunning && key === 'e') {
      e.preventDefault();
      useAbility();
    }
  });

  window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || e.code === 'ArrowLeft') fightKeys.left = false;
    if (key === 'd' || e.code === 'ArrowRight') fightKeys.right = false;
  });

  window.startFight = startFight;
  window.startBossFight = startBossFight;
  window.useAbility = useAbility;

  // initial draw
  drawFight();
}
