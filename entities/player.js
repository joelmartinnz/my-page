class PlayerController {
  constructor(options = {}) {
    this.position = options.position || { x: 0, y: 6, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = { yaw: 0, pitch: 0 };
    this.height = options.height || 1.8;
    this.speed = options.speed || 0.12;
    this.fov = options.fov || 70;
    this.mode = options.mode || 'first-person';
    this.state = {
      grounded: false,
      health: 100,
      stamina: 100
    };
  }

  move(direction, deltaTime = 1) {
    const amount = this.speed * deltaTime;
    switch (direction) {
      case 'forward':
        this.position.z -= Math.sin(this.rotation.yaw) * amount;
        this.position.x += Math.cos(this.rotation.yaw) * amount;
        break;
      case 'backward':
        this.position.z += Math.sin(this.rotation.yaw) * amount;
        this.position.x -= Math.cos(this.rotation.yaw) * amount;
        break;
      case 'left':
        this.position.x -= Math.sin(this.rotation.yaw) * amount;
        this.position.z -= Math.cos(this.rotation.yaw) * amount;
        break;
      case 'right':
        this.position.x += Math.sin(this.rotation.yaw) * amount;
        this.position.z += Math.cos(this.rotation.yaw) * amount;
        break;
      case 'jump':
        if (this.state.grounded) {
          this.velocity.y = 0.18;
          this.state.grounded = false;
        }
        break;
      default:
        break;
    }

    return this.position;
  }

  rotate(yawDelta, pitchDelta) {
    this.rotation.yaw += yawDelta;
    this.rotation.pitch = Math.max(-1.2, Math.min(1.2, this.rotation.pitch + pitchDelta));
    return this.rotation;
  }

  setMode(mode) {
    this.mode = mode;
    return this.mode;
  }

  getViewState() {
    return {
      position: this.position,
      rotation: this.rotation,
      mode: this.mode,
      fov: this.fov,
      height: this.height
    };
  }
}

module.exports = {
  PlayerController
};
