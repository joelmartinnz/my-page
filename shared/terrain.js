function getTerrainHeight(x, z) {
  const ridge = Math.sin(x * 0.16) * 1.8 + Math.cos(z * 0.13) * 1.4;
  const detail = Math.sin((x + z) * 0.24) * 0.65;
  return Math.max(0.2, ridge + detail);
}

function getBiome(x, z, height) {
  if (height >= 7) {
    return 'snow';
  }

  if (x > 10 || z > 10) {
    return 'desert';
  }

  if (height >= 3) {
    return 'forest';
  }

  return 'grass';
}

function sampleTerrain(x, z) {
  const height = getTerrainHeight(x, z);
  const biome = getBiome(x, z, height);

  const palette = {
    grass: { topColor: '#4f8c45', sideColor: '#6f5a3f' },
    forest: { topColor: '#3b7a3d', sideColor: '#5a4632' },
    snow: { topColor: '#dfeff7', sideColor: '#8ca0b7' },
    desert: { topColor: '#c8b26a', sideColor: '#a8893f' }
  };

  return {
    height,
    biome,
    topColor: palette[biome].topColor,
    sideColor: palette[biome].sideColor
  };
}

module.exports = {
  getTerrainHeight,
  getBiome,
  sampleTerrain
};
