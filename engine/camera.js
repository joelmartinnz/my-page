class EngineCamera {
  constructor(options = {}) {
    this.position = options.position || { x: 0, y: 0, z: 0 };
    this.rotation = options.rotation || { x: 0, y: 0, z: 0 };
    this.fov = options.fov || 70;
    this.aspect = options.aspect || 16 / 9;
    this.near = options.near || 0.1;
    this.far = options.far || 1000;
  }

  updateAspect(width, height) {
    if (width && height) {
      this.aspect = width / height;
    }
    return this.aspect;
  }

  lookAt(target = { x: 0, y: 0, z: 0 }) {
    this.rotation.y = Math.atan2(target.x - this.position.x, target.z - this.position.z);
    this.rotation.x = Math.atan2(target.y - this.position.y, Math.sqrt((target.x - this.position.x) ** 2 + (target.z - this.position.z) ** 2));
    return this.rotation;
  }

  projectPoint(point = { x: 0, y: 0, z: 0 }) {
    const dx = point.x - this.position.x;
    const dy = point.y - this.position.y;
    const dz = point.z - this.position.z;

    const yaw = this.rotation.y;
    const pitch = this.rotation.x;

    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);

    const xRot = dx * cosYaw + dz * sinYaw;
    const zRot = dz * cosYaw - dx * sinYaw;
    const yRot = dy * cosPitch + zRot * sinPitch;
    const zProjected = zRot * cosPitch - dy * sinPitch;

    const scale = this.fov / (this.fov + zProjected);
    return {
      x: xRot * scale,
      y: yRot * scale,
      z: zProjected,
      scale
    };
  }
}

function createEngineCamera(options = {}) {
  return new EngineCamera(options);
}

module.exports = {
  EngineCamera,
  createEngineCamera
};
