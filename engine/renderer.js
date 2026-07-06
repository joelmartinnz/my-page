class EngineRenderer {
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 600;
    this.background = options.background || '#07131f';
    this.camera = options.camera || null;
    this.canvas = options.canvas || null;
    this.context = options.context || null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    if (canvas && typeof canvas.getContext === 'function') {
      this.context = canvas.getContext('2d');
      this.width = canvas.width || this.width;
      this.height = canvas.height || this.height;
    }
    return this.context;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    return { width: this.width, height: this.height };
  }

  clear() {
    if (!this.context) return null;

    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.background;
    this.context.fillRect(0, 0, this.width, this.height);
    return { width: this.width, height: this.height };
  }

  drawGrid() {
    if (!this.context) return null;

    this.context.save();
    this.context.strokeStyle = 'rgba(150, 220, 255, 0.16)';
    this.context.lineWidth = 1;

    const step = 32;
    for (let x = 0; x <= this.width; x += step) {
      this.context.beginPath();
      this.context.moveTo(x, 0);
      this.context.lineTo(x, this.height);
      this.context.stroke();
    }

    for (let y = 0; y <= this.height; y += step) {
      this.context.beginPath();
      this.context.moveTo(0, y);
      this.context.lineTo(this.width, y);
      this.context.stroke();
    }

    this.context.restore();
    return { step };
  }

  drawEntities(entities = []) {
    if (!this.context) return [];

    const projected = entities.map((entity, index) => {
      const point = entity.position || { x: 0, y: 0, z: 0 };
      const projection = this.camera ? this.camera.projectPoint(point) : { x: 0, y: 0, scale: 1 };
      const screenX = this.width / 2 + projection.x * 120;
      const screenY = this.height / 2 - projection.y * 120;

      this.context.save();
      this.context.fillStyle = entity.color || '#6fe6ff';
      this.context.beginPath();
      this.context.arc(screenX, screenY, 8 + (index % 3), 0, Math.PI * 2);
      this.context.fill();
      this.context.restore();

      return { entity, screenX, screenY, projection };
    });

    return projected;
  }

  renderScene(scene) {
    this.clear();
    this.drawGrid();
    const entities = scene && Array.isArray(scene.entities) ? scene.entities : [];
    const projected = this.drawEntities(entities);
    return {
      width: this.width,
      height: this.height,
      projected
    };
  }
}

function createEngineRenderer(options = {}) {
  return new EngineRenderer(options);
}

module.exports = {
  EngineRenderer,
  createEngineRenderer
};
