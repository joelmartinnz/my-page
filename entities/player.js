class PlayerController {
  constructor(options = {}) {
    this.position = options.position || { x: 0, y: 6, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = { yaw: 0, pitch: 0 };
    this.height = options.height || 1.8;
    this.baseSpeed = options.speed || 0.12;
    this.speed = this.baseSpeed;
    this.fov = options.fov || 70;
    this.mode = options.mode || 'first-person';
    this.state = {
      grounded: false,
      health: 100,
      stamina: 100,
      inventory: [],
      selectedSlot: 0
    };
    this.collisionRadius = 0.3;
    this.targetBlock = null;
  }

  move(direction, deltaTime = 1) {
    const amount = this.speed * deltaTime;
    let nextX = this.position.x;
    let nextZ = this.position.z;

    switch (direction) {
      case 'forward':
        nextX += Math.cos(this.rotation.yaw) * amount;
        nextZ += Math.sin(this.rotation.yaw) * amount;
        break;
      case 'backward':
        nextX -= Math.cos(this.rotation.yaw) * amount;
        nextZ -= Math.sin(this.rotation.yaw) * amount;
        break;
      case 'left':
        nextX -= Math.sin(this.rotation.yaw) * amount;
        nextZ -= Math.cos(this.rotation.yaw) * amount;
        break;
      case 'right':
        nextX += Math.sin(this.rotation.yaw) * amount;
        nextZ -= Math.cos(this.rotation.yaw) * amount;
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

    if (!this.checkCollision(nextX, this.position.y, nextZ)) {
      this.position.x = nextX;
      this.position.z = nextZ;
    }

    return this.position;
  }

  checkCollision(x, y, z) {
    const checkX = Math.floor(x);
    const checkY = Math.floor(y);
    const checkZ = Math.floor(z);
    return checkX < -1 || checkX > 1 || checkZ < -1 || checkZ > 1;
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

  setSprint(isSprinting) {
    this.speed = isSprinting ? this.baseSpeed * 1.7 : this.baseSpeed;
    return this.speed;
  }

  setGrounded(isGrounded) {
    this.state.grounded = isGrounded;
    return this.state.grounded;
  }

  addToInventory(blockType) {
    this.state.inventory.push(blockType);
    return this.state.inventory;
  }

  removeFromInventory(index = this.state.selectedSlot) {
    if (index >= 0 && index < this.state.inventory.length) {
      return this.state.inventory.splice(index, 1)[0];
    }
    return null;
  }

  selectSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < 9) {
      this.state.selectedSlot = slotIndex;
    }
    return this.state.selectedSlot;
  }

  getSelectedBlock() {
    return this.state.inventory[this.state.selectedSlot] || null;
  }

  setTargetBlock(block) {
    this.targetBlock = block;
    return this.targetBlock;
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
