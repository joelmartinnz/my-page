class TerrainGenerator {
  constructor(seed = 1) {
    this.seed = seed;
  }

  hash(value) {
    let x = Math.sin(value * 12.9898 + this.seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  noise2D(x, z) {
    const ix = Math.floor(x);
    const iz = Math.floor(z);
    const fx = x - ix;
    const fz = z - iz;

    const a = this.hash(ix * 374.0 + iz * 127.1);
    const b = this.hash((ix + 1) * 374.0 + iz * 127.1);
    const c = this.hash(ix * 374.0 + (iz + 1) * 127.1);
    const d = this.hash((ix + 1) * 374.0 + (iz + 1) * 127.1);

    const u = fx * fx * (3 - 2 * fx);
    const v = fz * fz * (3 - 2 * fz);

    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }

  getSurfaceHeight(worldX, worldZ) {
    const baseHeight = 8 + Math.floor(this.noise2D(worldX / 16, worldZ / 16) * 6);
    const ridge = Math.sin(worldX * 0.06) * Math.cos(worldZ * 0.05) * 1.4;
    return baseHeight + Math.floor(ridge);
  }

  generateChunk(chunk) {
    for (let localX = 0; localX < chunk.size; localX += 1) {
      for (let localZ = 0; localZ < chunk.size; localZ += 1) {
        const worldX = chunk.x * chunk.size + localX;
        const worldZ = chunk.z * chunk.size + localZ;
        const surfaceHeight = this.getSurfaceHeight(worldX, worldZ);

        for (let localY = 0; localY < chunk.size; localY += 1) {
          const worldY = chunk.y * chunk.size + localY;
          if (worldY > surfaceHeight) {
            chunk.setBlock(localX, localY, localZ, 'air');
          } else if (worldY === surfaceHeight) {
            chunk.setBlock(localX, localY, localZ, 'grass');
          } else if (worldY >= surfaceHeight - 3) {
            chunk.setBlock(localX, localY, localZ, 'dirt');
          } else {
            chunk.setBlock(localX, localY, localZ, 'stone');
          }
        }
      }
    }

    return chunk;
  }
}

module.exports = {
  TerrainGenerator
};
