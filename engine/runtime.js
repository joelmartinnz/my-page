class EngineRuntime {
  constructor(bootstrap) {
    this.bootstrap = bootstrap;
    this.frameHandle = null;
    this.lastTimestamp = 0;
    this.frameCount = 0;
    this.active = false;
  }

  start() {
    if (this.active) return;

    this.active = true;
    this.lastTimestamp = performance.now();
    this.frameHandle = requestAnimationFrame((timestamp) => this.tick(timestamp));
  }

  stop() {
    this.active = false;
    if (this.frameHandle) {
      cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }
  }

  tick(timestamp) {
    if (!this.active) return;

    const deltaTime = Math.max(0, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;
    this.frameCount += 1;

    this.bootstrap.state.frameCount = this.frameCount;
    this.bootstrap.state.lastFrameTime = timestamp;

    this.frameHandle = requestAnimationFrame((nextTimestamp) => this.tick(nextTimestamp));
  }
}

function createEngineRuntime(bootstrap) {
  return new EngineRuntime(bootstrap);
}

module.exports = {
  EngineRuntime,
  createEngineRuntime
};
