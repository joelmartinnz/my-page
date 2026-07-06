class Chunk {
  constructor(x = 0, y = 0, z = 0, size = 16, fillBlock = 'air') {
    this.x = x;
    this.y = y;
    this.z = z;
    this.size = size;
    this.blocks = new Array(size * size * size).fill(fillBlock);
  }

  getIndex(localX, localY, localZ) {
    return localY * this.size * this.size + localZ * this.size + localX;
  }

  isInside(localX, localY, localZ) {
    return (
      localX >= 0 &&
      localX < this.size &&
      localY >= 0 &&
      localY < this.size &&
      localZ >= 0 &&
      localZ < this.size
    );
  }

  getBlock(localX, localY, localZ) {
    if (!this.isInside(localX, localY, localZ)) {
      return null;
    }
    return this.blocks[this.getIndex(localX, localY, localZ)];
  }

  setBlock(localX, localY, localZ, blockId) {
    if (!this.isInside(localX, localY, localZ)) {
      return false;
    }
    this.blocks[this.getIndex(localX, localY, localZ)] = blockId;
    return true;
  }

  fill(blockId) {
    this.blocks.fill(blockId);
    return this;
  }

  countBlocks(blockId) {
    return this.blocks.filter((value) => value === blockId).length;
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      size: this.size,
      blocks: this.blocks.slice()
    };
  }

  static fromJSON(data) {
    const chunk = new Chunk(data.x, data.y, data.z, data.size, 'air');
    chunk.blocks = data.blocks.slice();
    return chunk;
  }
}

module.exports = {
  Chunk
};
