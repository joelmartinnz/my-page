const test = require('node:test');
const assert = require('node:assert/strict');

const { createVoxelEngine } = require('../engine');

test('createVoxelEngine wires bootstrap, runtime, input, and scene together', () => {
  const engine = createVoxelEngine({ canvasId: 'voxel-canvas', title: 'Voxel Foundation' });

  assert.ok(engine);
  assert.equal(engine.bootstrap.canvasId, 'voxel-canvas');
  assert.equal(engine.scene.name, 'main');
  assert.equal(typeof engine.start, 'function');
  assert.equal(typeof engine.stop, 'function');
});
