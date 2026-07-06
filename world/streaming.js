class ChunkManager {
  constructor(generator, options = {}) {
    this.generator = generator;
    this.maxChunks = options.maxChunks || 16;
    this.loadedChunks = new Map();
  }

  getChunkKey(chunkX, chunkY, chunkZ) {
    return `${chunkX}:${chunkY}:${chunkZ}`;
  }

  ensureChunk(chunkX, chunkY, chunkZ, chunkFactory) {
    const key = this.getChunkKey(chunkX, chunkY, chunkZ);
    if (!this.loadedChunks.has(key)) {
      const chunk = chunkFactory ? chunkFactory(chunkX, chunkY, chunkZ) : null;
      if (chunk) {
        this.generator.generateChunk(chunk);
        this.loadedChunks.set(key, chunk);
      }
    }

    return this.loadedChunks.get(key) || null;
  }

  unloadChunk(chunkX, chunkY, chunkZ) {
    this.loadedChunks.delete(this.getChunkKey(chunkX, chunkY, chunkZ));
  }

  getVisibleChunks(centerX, centerZ, radius = 1) {
    const results = [];
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      for (let z = centerZ - radius; z <= centerZ + radius; z += 1) {
        results.push({ chunkX: x, chunkZ: z });
      }
    }
    return results;
  }
}

module.exports = {
  ChunkManager
};
