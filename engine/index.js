const { createEngineBootstrap } = require('./bootstrap');
const { createEngineRuntime } = require('./runtime');
const { createEngineInput } = require('./input');
const { createEngineScene } = require('./scene');
const { createEngineCamera } = require('./camera');
const { createEngineRenderer } = require('./renderer');

function createVoxelEngine(options = {}) {
  const bootstrap = createEngineBootstrap(options);
  const runtime = createEngineRuntime(bootstrap);
  const input = createEngineInput();
  const scene = createEngineScene(options.sceneName || 'main');
  const camera = createEngineCamera(options.camera || {});
  const renderer = createEngineRenderer({
    ...options.renderer,
    camera,
    width: options.width || 800,
    height: options.height || 600
  });

  return {
    bootstrap,
    runtime,
    input,
    scene,
    camera,
    renderer,
    start() {
      bootstrap.start();
      runtime.start();
      return bootstrap.getState();
    },
    stop() {
      runtime.stop();
      return bootstrap.stop();
    }
  };
}

module.exports = {
  createVoxelEngine
};
