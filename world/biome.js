class Biome {
  constructor(name, options = {}) {
    this.name = name;
    this.surfaceBlock = options.surfaceBlock || 'grass';
    this.subsurfaceBlock = options.subsurfaceBlock || 'dirt';
    this.undergroundBlock = options.undergroundBlock || 'stone';
    this.color = options.color || '#6bcf6e';
  }
}

class BiomeRegistry {
  constructor() {
    this.biomes = [];
  }

  register(biome) {
    this.biomes.push(biome);
    return biome;
  }

  getBiomeByName(name) {
    return this.biomes.find((biome) => biome.name === name) || null;
  }
}

function hashCoordinate(x, z, seed = 1) {
  const value = Math.sin((x + 1) * 127.1 + (z + 1) * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function getBiomeForPosition(x, z, registry, seed = 1) {
  if (!registry || !registry.biomes.length) {
    return new Biome('plains', { color: '#7ddc73' });
  }

  const sample = hashCoordinate(x, z, seed);
  const index = Math.floor(sample * registry.biomes.length);
  return registry.biomes[Math.min(index, registry.biomes.length - 1)];
}

module.exports = {
  Biome,
  BiomeRegistry,
  getBiomeForPosition
};
