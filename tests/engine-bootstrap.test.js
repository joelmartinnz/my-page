const test = require('node:test');
const assert = require('node:assert/strict');

const { createEngineBootstrap } = require('../engine/bootstrap');

test('createEngineBootstrap creates a runtime shell with required capabilities', () => {
  const bootstrap = createEngineBootstrap({
    canvasId: 'voxel-canvas',
    title: 'Voxel Foundation'
  });

  assert.ok(bootstrap);
  assert.equal(bootstrap.canvasId, 'voxel-canvas');
  assert.equal(bootstrap.title, 'Voxel Foundation');
  assert.equal(typeof bootstrap.start, 'function');
  assert.equal(typeof bootstrap.stop, 'function');
  assert.equal(typeof bootstrap.getState, 'function');
});
