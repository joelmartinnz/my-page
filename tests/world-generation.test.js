const test = require('node:test');
const assert = require('node:assert/strict');

const { Chunk } = require('../world/chunk');
const { TerrainGenerator } = require('../world/generator');

test('chunk stores block data and supports fill and count operations', () => {
  const chunk = new Chunk(0, 0, 0, 8, 'air');
  chunk.setBlock(0, 0, 0, 'stone');
  chunk.setBlock(1, 0, 0, 'dirt');
  assert.equal(chunk.getBlock(0, 0, 0), 'stone');
  assert.equal(chunk.getBlock(1, 0, 0), 'dirt');
  assert.equal(chunk.countBlocks('air'), 62);
});

test('terrain generator creates deterministic terrain surfaces', () => {
  const chunk = new Chunk(0, 0, 0, 16, 'air');
  const generator = new TerrainGenerator(7);

  generator.generateChunk(chunk);

  const surfaceBlock = chunk.getBlock(0, 0, 0);
  assert.equal(surfaceBlock, 'grass');
  assert.equal(chunk.getBlock(0, 1, 0), 'dirt');
  assert.equal(chunk.getBlock(0, 10, 0), 'air');
});
