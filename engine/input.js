class EngineInput {
  constructor() {
    this.keys = new Set();
    this.mouse = {
      x: 0,
      y: 0,
      down: false
    };
  }

  bind(windowRef) {
    if (!windowRef) return;

    windowRef.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
    });

    windowRef.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    windowRef.addEventListener('mousemove', (event) => {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
    });

    windowRef.addEventListener('mousedown', () => {
      this.mouse.down = true;
    });

    windowRef.addEventListener('mouseup', () => {
      this.mouse.down = false;
    });
  }

  isKeyDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  isMouseDown() {
    return this.mouse.down;
  }
}

function createEngineInput() {
  return new EngineInput();
}

module.exports = {
  EngineInput,
  createEngineInput
};
