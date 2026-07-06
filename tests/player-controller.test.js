const test = require('node:test');
const assert = require('node:assert/strict');

const { PlayerController } = require('../entities/player');

test('player controller supports first-person movement and rotation', () => {
  const player = new PlayerController();
  player.rotate(0.4, 0.1);
  player.move('forward', 1);

  assert.equal(player.mode, 'first-person');
  assert.ok(player.position.x !== 0 || player.position.z !== 0);
  assert.equal(typeof player.rotation.yaw, 'number');
});
