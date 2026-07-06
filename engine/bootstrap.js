class EngineBootstrap {
  constructor(options = {}) {
    this.canvasId = options.canvasId || 'voxel-canvas';
    this.title = options.title || 'Voxel Foundation';
    this.state = {
      running: false,
      startedAt: null,
      lastFrameTime: null,
      frameCount: 0
    };
  }

  start() {
    this.state.running = true;
    this.state.startedAt = Date.now();
    this.state.lastFrameTime = performance.now();
    return this.getState();
  }

  stop() {
    this.state.running = false;
    return this.getState();
  }

  getState() {
    return {
      ...this.state,
      canvasId: this.canvasId,
      title: this.title
    };
  }
}

function createEngineBootstrap(options = {}) {
  return new EngineBootstrap(options);
}

module.exports = {
  EngineBootstrap,
  createEngineBootstrap
};
