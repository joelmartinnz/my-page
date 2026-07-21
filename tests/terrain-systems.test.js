const test = require('node:test');
const assert = require('node:assert/strict');

const { getTerrainHeight, getBiome, sampleTerrain } = require('../shared/terrain');

test('terrain height stays within a playable range', () => {
  const height = getTerrainHeight(4, 8);

  assert.ok(height >= 0);
  assert.ok(height <= 10);
});

test('terrain sampling returns a biome and block color data', () => {
  const sample = sampleTerrain(12, 24);

  assert.ok(['grass', 'forest', 'snow', 'desert'].includes(sample.biome));
  assert.ok(sample.topColor);
  assert.ok(sample.sideColor);
});

test('biome selection changes with height and position', () => {
  const lowGrass = getBiome(2, 2, 2);
  const highSnow = getBiome(20, 20, 9);

  assert.equal(lowGrass, 'grass');
  assert.equal(highSnow, 'snow');
});
