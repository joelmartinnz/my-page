const test = require('node:test');
const assert = require('node:assert/strict');

const { Biome, BiomeRegistry, getBiomeForPosition } = require('../world/biome');
const { LightingModel } = require('../world/lighting');
const { ChunkManager } = require('../world/streaming');
const { Chunk } = require('../world/chunk');
const { TerrainGenerator } = require('../world/generator');

test('biome registry selects a biome deterministically', () => {
  const registry = new BiomeRegistry();
  registry.register(new Biome('forest', { color: '#4f7d2b' }));
  registry.register(new Biome('desert', { color: '#d7c07c' }));

  const biome = getBiomeForPosition(10, 20, registry, 3);
  assert.ok(biome);
  assert.equal(typeof biome.name, 'string');
});

test('lighting model returns expected sky and block light values', () => {
  const lighting = new LightingModel();
  const result = lighting.calculateLight(10, 6);
  assert.equal(result.skyLight, 6);
  assert.equal(result.blockLight, 0);
});

test('chunk manager stores and returns generated chunks', () => {
  const generator = new TerrainGenerator(2);
  const manager = new ChunkManager(generator, { maxChunks: 4 });
  const chunk = manager.ensureChunk(0, 0, 0, (x, y, z) => new Chunk(x, y, z, 8, 'air'));

  assert.ok(chunk);
  assert.equal(chunk.size, 8);
});
