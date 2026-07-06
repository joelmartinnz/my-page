class EngineScene {
  constructor(name = 'default') {
    this.name = name;
    this.entities = [];
  }

  addEntity(entity) {
    this.entities.push(entity);
    return entity;
  }

  removeEntity(entityId) {
    this.entities = this.entities.filter((entity) => entity.id !== entityId);
  }

  listEntities() {
    return this.entities.map((entity) => entity.id);
  }
}

function createEngineScene(name) {
  return new EngineScene(name);
}

module.exports = {
  EngineScene,
  createEngineScene
};
