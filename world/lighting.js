class LightingModel {
  constructor(options = {}) {
    this.maxSkyLight = options.maxSkyLight || 15;
    this.maxBlockLight = options.maxBlockLight || 15;
  }

  calculateLight(surfaceHeight, worldY, skyLight = this.maxSkyLight, blockLight = 0) {
    if (worldY > surfaceHeight) {
      return { skyLight: 0, blockLight: 0 };
    }

    const distanceToSurface = surfaceHeight - worldY;
    const sky = Math.max(0, skyLight - distanceToSurface * 2);
    const block = Math.max(0, Math.min(this.maxBlockLight, blockLight));

    return { skyLight: sky, blockLight: block };
  }
}

module.exports = {
  LightingModel
};
