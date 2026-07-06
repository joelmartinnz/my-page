const test = require('node:test');
const assert = require('node:assert/strict');

const { createEngineCamera } = require('../engine/camera');
const { createEngineRenderer } = require('../engine/renderer');

test('camera and renderer provide a basic 3D scene projection workflow', () => {
  const camera = createEngineCamera({ position: { x: 0, y: 0, z: 5 } });
  const renderer = createEngineRenderer({ width: 640, height: 480, camera });

  const projection = camera.projectPoint({ x: 1, y: 1, z: 1 });
  assert.ok(projection);
  assert.equal(typeof projection.scale, 'number');

  const scene = {
    entities: [
      { id: 'cube', position: { x: 0, y: 0, z: 2 }, color: '#6fe6ff' }
    ]
  };

  const result = renderer.renderScene(scene);
  assert.equal(result.width, 640);
  assert.equal(result.height, 480);
  assert.equal(result.projected.length, 1);
});
