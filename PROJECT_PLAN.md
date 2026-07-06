# PROJECT_PLAN.md

Status: Planning Complete - Awaiting Approval

## Milestone Progress Log
- Milestone 1: Completed
  - Implemented a project foundation with engine bootstrap, runtime loop, input abstraction, scene shell, and initial tests.
  - Verification: static error scan reported no issues in the new engine modules.
  - Note: Runtime execution could not be fully verified in this environment because Node.js is not currently installed.
- Milestone 2: Completed
  - Implemented a basic 3D camera projection system and a renderer that can clear the viewport, draw a grid, and project simple scene entities.
  - Verification: static error scan reported no issues in the new camera, renderer, and engine integration modules.
- Milestone 3: Completed for the current prototype scope
  - Implemented a chunk data structure and a deterministic terrain generator that produces layered voxel surfaces.
  - Verification: static error scan reported no issues in the new world modules and regression tests.
- Milestone 4: In Progress
  - The project is now pivoting to the first-person player-view milestone and the actual game experience.
  - A browser-based first-person prototype is now available at [game.html](game.html) for review.
  - Next focus: refine the player movement, camera feel, and the first-person voxel scene before advancing further.

### Playtest Status
- Full gameplay is still not yet complete, but the project now includes a first-person prototype entry point for review.
- The next major milestone will add richer biome variation, lighting, and chunk streaming behavior after the player-view layer is stabilized.

## 1. GAME OVERVIEW

### Vision Statement
A fully 3D, voxel-based, chunk-driven survival-adventure game set in a procedurally generated universe of rich biomes, dynamic lighting, and handcrafted progression. The experience will feel premium, performant, and expandable, with visual quality comparable to Minecraft Java Edition while maintaining a modern, scalable engine architecture.

### Core Gameplay Pillars
- Immersive exploration through procedurally generated voxel worlds.
- Deep progression through crafting, resource gathering, base building, and encounters.
- Rich biome diversity with unique environmental hazards and resources.
- Smooth, readable, and responsive player movement and interaction.
- High-performance world streaming for large infinite worlds.
- Extensible content architecture for future dimensions, mobs, bosses, and systems.

### Target Audience
- Players who enjoy sandbox exploration, survival progression, and block-based worlds.
- Players seeking a premium voxel experience with strong visuals and polished systems.
- Creative builders, collectors, and adventurers.
- Community-driven players interested in mod-ready and expansion-friendly design.

### Technical Goals
- Deliver a fully 3D voxel engine with block-based terrain and chunk streaming.
- Support procedural biome generation, dynamic lighting, and animated entities.
- Build a modular engine architecture that supports future content expansion without structural rewrites.
- Create a stable data pipeline for world generation, saving, loading, and updates.

### Performance Goals
- Maintain stable frame rates during large world exploration.
- Support streaming of thousands of chunks with efficient memory usage.
- Achieve low-latency chunk generation and mesh building.
- Ensure predictable CPU and GPU cost via batching, culling, and pooling.

### Long-Term Expansion Opportunities
- New dimensions and alternate realities.
- Additional biomes, mobs, bosses, and crafting stations.
- Seasonal events and progressive content updates.
- Multiplayer, vehicles, magic systems, and skill trees.

---

## 2. FULL PROJECT ROADMAP

### STAGE 1 — Engine Foundations

#### Milestones
- Milestone 1: Project Foundation and Tooling
- Milestone 2: Rendering Core and Scene Architecture

#### Sub-milestones
- Establish repository structure and configuration.
- Implement engine bootstrap, scene graph, and runtime loop.
- Build rendering foundation for 3D voxel rendering.
- Create input abstraction and basic UI framework.

#### Individual Development Tasks
- Create project folders for engine, world, entities, UI, audio, and content.
- Set up build tooling, asset pipeline, and development workflow.
- Implement the engine loop, frame timing, and update/render separation.
- Implement input mapping for keyboard, mouse, and gamepad.
- Create a scene manager, camera controller, and basic debug overlay.
- Implement a renderer with a simple 3D triangle pipeline suitable for voxel meshes.

### STAGE 2 — World Generation

#### Milestones
- Milestone 3: Chunk System and Terrain Generation
- Milestone 4: Biomes, Lighting, and World Streaming

#### Sub-milestones
- Implement chunk storage, meshing, and world streaming.
- Generate terrain using procedural noise and biome rules.
- Add voxel lighting and surface shading.
- Create chunk save/load and world persistence.

#### Individual Development Tasks
- Define chunk format, block IDs, and world coordinate system.
- Implement chunk creation, update, and visibility checks.
- Implement greedy meshing for voxel surfaces.
- Generate height maps, caves, and basic terrain features.
- Implement biome selection and biome-specific block rules.
- Add dynamic sunlight and ambient lighting per voxel.
- Implement chunk unloading and memory cleanup.

### STAGE 3 — Player Systems

#### Milestones
- Milestone 5: Player Controller and Interaction

#### Sub-milestones
- Build controllable player avatar and camera.
- Implement block placement, breaking, and inventory interaction.
- Add player state, health, hunger, and status effects.

#### Individual Development Tasks
- Implement first-person or third-person movement with collision.
- Implement block target selection and interaction raycasting.
- Implement inventory slots and hotbar UI.
- Add world interaction actions for mining and placing blocks.
- Add player state flow for health, stamina, and food.

### STAGE 4 — Core Gameplay

#### Milestones
- Milestone 6: Crafting, Progression, and Core Loops

#### Sub-milestones
- Build crafting and item progression.
- Add environmental hazards and basic survival systems.
- Add simple NPCs or creatures to support exploration feedback.

#### Individual Development Tasks
- Implement item definitions and inventory management logic.
- Implement crafting recipes and station-based crafting.
- Add basic resource collection and progression milestones.
- Add mob spawning and simple AI behavior.
- Add core gameplay feedback such as damage, rewards, and world events.

### STAGE 5 — Content Expansion

#### Milestones
- Milestone 7: Biome and Content Expansion

#### Sub-milestones
- Add multiple biome variants and content-specific blocks.
- Expand mobs, items, and environmental variety.
- Add basic world events and seasonal modifiers.

#### Individual Development Tasks
- Add new biome definitions and biome-specific terrain features.
- Introduce new blocks, ores, and decorative resources.
- Add new item tiers and equipment progression.
- Add additional enemy types and encounter logic.

### STAGE 6 — Polishing & Optimization

#### Milestones
- Milestone 8: Optimization, Polish, and QA Hardening

#### Sub-milestones
- Improve performance and stability.
- Polish animations, VFX, UI, and audio.
- Conduct comprehensive QA and regression testing.

#### Individual Development Tasks
- Tune chunk load/unload budgets and mesh generation costs.
- Improve culling and visibility updates.
- Optimize memory use and object pooling.
- Refine lighting, animations, and camera presentation.
- Add audio feedback and polish pass for core interactions.

### STAGE 7 — Future-Ready Architecture

#### Milestones
- Milestone 9: Modular Expansion Layer

#### Sub-milestones
- Prepare architecture for dimensions, multiplayer, and future content.
- Document systems and establish content pipelines.

#### Individual Development Tasks
- Add data-driven registration for blocks, items, mobs, and recipes.
- Separate engine systems from content definitions.
- Prepare save-format compatibility and mod-friendly extension points.

---

## 3. MILESTONE SPECIFICATIONS

### Milestone 1 — Project Foundation and Tooling
- Description: Create the project structure, tooling, and base engine scaffolding required for all later work.
- Goals: Establish a stable foundation, consistent workflow, and clear ownership boundaries.
- Estimated Complexity: Low
- Estimated Number of Files: 12–20
- Dependencies: None
- Expected Outcome: A clean, buildable project shell with organized source folders and core runtime support.

### Milestone 2 — Rendering Core and Scene Architecture
- Description: Build the rendering foundation and scene architecture needed to display 3D voxel worlds.
- Goals: Support real-time 3D rendering, camera control, and basic scene management.
- Estimated Complexity: Medium
- Estimated Number of Files: 20–35
- Dependencies: Milestone 1
- Expected Outcome: A functional renderer capable of displaying simple 3D scenes and future voxel geometry.

### Milestone 3 — Chunk System and Terrain Generation
- Description: Implement chunk creation, storage, and procedural terrain generation.
- Goals: Generate a playable voxel terrain surface with chunk-based streaming.
- Estimated Complexity: High
- Estimated Number of Files: 30–50
- Dependencies: Milestone 2
- Expected Outcome: A terrain system that generates and renders chunk-based worlds.

### Milestone 4 — Biomes, Lighting, and World Streaming
- Description: Add biome variation, voxel lighting, and streaming behavior for large worlds.
- Goals: Create visually rich and performance-aware worlds.
- Estimated Complexity: High
- Estimated Number of Files: 25–45
- Dependencies: Milestone 3
- Expected Outcome: Worlds with varied biomes, lighting, and efficient chunk management.

### Milestone 5 — Player Controller and Interaction
- Description: Implement the player character, movement, combat, and block interaction loop.
- Goals: Enable exploration, mining, building, and core agency.
- Estimated Complexity: High
- Estimated Number of Files: 25–40
- Dependencies: Milestone 4
- Expected Outcome: A complete player presence in the world with meaningful interaction.

### Milestone 6 — Crafting, Progression, and Core Loops
- Description: Implement crafting, resource progression, and survival feedback systems.
- Goals: Deliver a compelling gameplay loop beyond terrain generation.
- Estimated Complexity: Medium
- Estimated Number of Files: 20–35
- Dependencies: Milestone 5
- Expected Outcome: A player-facing progression loop with crafting and progression depth.

### Milestone 7 — Biome and Content Expansion
- Description: Expand world variety and gameplay content through new biomes, blocks, items, and mobs.
- Goals: Increase content richness and replayability.
- Estimated Complexity: Medium
- Estimated Number of Files: 25–40
- Dependencies: Milestone 6
- Expected Outcome: A broader and more diverse content set without breaking existing systems.

### Milestone 8 — Optimization, Polish, and QA Hardening
- Description: Optimize performance, improve presentation, and ensure release readiness.
- Goals: Stabilize performance and polish the entire experience.
- Estimated Complexity: Medium
- Estimated Number of Files: 20–35
- Dependencies: Milestone 7
- Expected Outcome: A polished, stable, high-performance game experience.

### Milestone 9 — Modular Expansion Layer
- Description: Prepare the architecture for future dimensions, multiplayer, and content extensions.
- Goals: Ensure the engine can grow without large rewrites.
- Estimated Complexity: Medium
- Estimated Number of Files: 15–25
- Dependencies: Milestone 8
- Expected Outcome: A future-ready modular content and gameplay framework.

---

## 4. PROJECT STRUCTURE

### Top-Level Folders
- /engine — Core runtime, renderer, scene systems, and engine abstractions.
- /world — Chunk generation, terrain logic, biome definitions, and world streaming.
- /entities — Player, NPCs, mobs, AI, and entity components.
- /items — Item definitions, inventory logic, recipes, and equipment.
- /ui — Menus, HUD, inventory, and interaction overlays.
- /audio — Audio assets, event definitions, and playback systems.
- /content — Data-driven definitions for blocks, items, biomes, and recipes.
- /save — Save format, serialization, and persistence management.
- /tools — Offline tools for asset generation, world generation validation, and debugging.
- /tests — Automated and manual QA test harnesses.

### Core Files and Purpose
- /engine/main.ts — Application bootstrap and engine initialization.
- /engine/runtime.ts — Frame loop, update/render scheduling, and engine lifecycle.
- /engine/input.ts — Input abstraction and event mapping.
- /engine/camera.ts — Camera state, movement, and projection logic.
- /engine/renderer.ts — Core renderer orchestration.
- /engine/scene.ts — Scene management and object hierarchy.
- /engine/resource-manager.ts — Asset loading and resource lifetime management.
- /engine/debug-overlay.ts — Debug stats and instrumentation.
- /world/chunk.ts — Chunk data structure, update state, and storage.
- /world/world.ts — World coordinate system and world-level management.
- /world/generator.ts — Terrain generation and procedural rules.
- /world/biome.ts — Biome definitions and biome composition.
- /world/mesher.ts — Greedy meshing and voxel surface generation.
- /world/lighting.ts — Voxel lighting and sunlight propagation.
- /world/streaming.ts — Chunk loading, unloading, and visibility management.
- /world/save-load.ts — Chunk serialization and world persistence.
- /entities/player.ts — Player controller and interaction logic.
- /entities/entity.ts — Base entity interface and shared behaviors.
- /entities/components.ts — Component definitions for movement, combat, AI, and state.
- /entities/ai.ts — Basic AI and behavior tree logic.
- /items/inventory.ts — Inventory data structure and operations.
- /items/recipes.ts — Crafting recipes and station logic.
- /items/items.ts — Item registry and definitions.
- /ui/hud.ts — Heads-up display and core UI panels.
- /ui/inventory-ui.ts — Inventory and hotbar presentation.
- /ui/menu.ts — Main menu and pause state UI.
- /audio/audio-manager.ts — Sound bank access and playback control.
- /content/blocks.json — Data definitions for voxel blocks.
- /content/biomes.json — Data definitions for biome rules and block weights.
- /content/recipes.json — Crafting recipe definitions.
- /content/mobs.json — Entity spawn and behavior data.
- /save/save-format.ts — Save versioning and serialization schema.
- /tests/qa-checklist.md — Manual testing checklist.
- /tests/perf-baseline.json — Performance benchmarks and thresholds.

### How Systems Communicate
- The engine runtime coordinates frame updates and dispatches to the world, entities, UI, and audio systems.
- The world system exposes chunk data to the renderer and the player interaction system.
- The player system requests terrain changes and inventory actions through shared service layers.
- Data-driven content definitions are loaded through a content registry and consumed by gameplay systems.

### How Data Flows Through the Engine
1. Input events enter the input system.
2. The runtime updates the active scene and world state.
3. World generation and chunk updates produce modified voxel data.
4. Meshing converts voxel data into renderable geometry.
5. The renderer draws the visible chunk set and entities.
6. UI and audio systems respond to gameplay changes and state updates.

---

## 5. ENGINE ARCHITECTURE

### Rendering Pipeline
- Input state is collected each frame.
- The scene graph updates transforms and visibility.
- The world system updates dirty chunks and generates mesh data.
- The renderer batches visible meshes and submits draw commands.
- Lighting and shader passes are applied per frame.
- Post-processing and UI overlay are composed on top.

### Game Loop
- Frame start: measure time delta and input state.
- Update: simulate world, entities, UI state, and audio events.
- Chunk processing: generate or refresh chunks as required.
- Render: submit visible meshes, entities, and UI.
- End frame: collect diagnostics and finalize state.

### Input System
- Normalize keyboard, mouse, and gamepad input into a common event stream.
- Support context-based input mapping for gameplay, UI, and debug tools.
- Provide input buffering for responsive player actions.

### Physics System
- Use simple voxel collision volumes for the player and entities.
- Implement block-solid detection and movement resolution.
- Avoid expensive full-body physics in favor of deterministic voxel collision.

### World Generation
- Use layered noise functions for terrain elevation, cave generation, and biome weighting.
- Maintain deterministic generation rules based on world seed and coordinates.
- Separate world generation logic from runtime chunk mutation.

### Chunk System
- Chunks are the primary unit of world streaming and rendering.
- Each chunk stores block data, dirty flags, mesh state, and neighbor references.
- Nearby chunks are updated and meshed on demand with visibility thresholds.

### Save/Load System
- Persist world seed, chunk data, entity state, time, and player progress.
- Use versioned save formats for compatibility and future migration.
- Save incrementally and prioritize critical player and chunk data.

### UI Framework
- Use a layered UI system for HUD, pause, inventory, crafting, and system overlays.
- Keep UI data-driven and decoupled from gameplay logic.
- Support accessibility, localization, and scalable resolutions.

### Audio Pipeline
- Event-based audio system with category-based mixing.
- Trigger sound effects for actions, hazards, ambience, and combat.
- Keep audio assets separate from gameplay logic and expose simple playback hooks.

### Lighting System
- Implement voxel lighting with sunlight, skylight, and block-emitted light.
- Use light propagation passes for chunk updates and dynamic light sources.
- Keep lighting updates local and efficient to limit broad recomputation.

### Entity Component System
- Use a lightweight component-based model for player, mobs, and interactive entities.
- Support movement, animation, health, combat, and AI on a modular basis.
- Keep systems data-driven and decoupled for expandability.

### Inventory System
- Store items in a slot-based inventory with stack support and metadata.
- Support hotbar selection, drag-and-drop, and crafting interaction.
- Keep inventory data independent from UI presentation.

### Crafting System
- Register recipes by station type and required ingredients.
- Support deterministic crafting flow with item output and station state.
- Make the crafting layer data-driven for future stations and recipes.

### AI System
- Implement simple behavior states for roaming, chasing, fleeing, and attacking.
- Use tick-based updates and local awareness to avoid heavy simulation costs.
- Prepare for future pathfinding and faction systems.

---

## 6. TESTING PLAN

### Testing Checklists by Milestone

#### Milestone 1 Checklist
- Build succeeds from a clean environment.
- Core folders and toolchain are present.
- Runtime boots without crashes.
- Basic debug overlay renders.

#### Milestone 2 Checklist
- Renderer displays a basic 3D scene.
- Camera movement is stable.
- Scene transitions and object management work correctly.

#### Milestone 3 Checklist
- Chunks generate correctly from seed data.
- Terrain surfaces render without holes or artifacts.
- Chunk updates are deterministic.

#### Milestone 4 Checklist
- Biome transitions are visually coherent.
- Lighting appears consistent across voxel surfaces.
- Chunk loading and unloading remain stable at runtime.

#### Milestone 5 Checklist
- Player movement respects collision.
- Mining and placement actions affect the world correctly.
- Inventory and hotbar behave correctly.

#### Milestone 6 Checklist
- Crafting recipes produce expected items.
- progression and survival systems respond correctly.
- Basic enemies and hazards behave properly.

#### Milestone 7 Checklist
- New biomes and content appear as intended.
- New blocks, items, and mobs integrate without regressions.
- Content definitions remain stable and data-driven.

#### Milestone 8 Checklist
- Performance stays within set thresholds.
- Stability testing produces no major runtime issues.
- Visual polish passes are complete.

#### Milestone 9 Checklist
- Expansion hooks function without major refactoring.
- Content registration remains modular.
- Save compatibility remains stable.

### Expected Bugs
- Chunk seam artifacts at borders.
- Lighting popping when chunks update.
- Collision issues near block corners.
- Memory spikes during chunk streaming.
- Inventory state desynchronization.
- AI pathing failures or unexpected spawning.

### System-Specific Testing Procedures
- Rendering: test camera movement, chunk visibility, and mesh correctness.
- World generation: test seeds, biome boundaries, cave generation, and cliff formations.
- Player systems: test movement, mining, placement, hit detection, and health states.
- Inventory and crafting: test recipe matching, stacking, and state consistency.
- Save/load: test persistence after world changes and system upgrades.

### Integration Testing Strategy
- Validate end-to-end gameplay across world generation, player interaction, inventory, and persistence.
- Verify chunk updates and world state changes remain consistent across multiple systems.
- Perform repeated play sessions to detect timing and state bugs.

### Regression Testing Strategy
- Re-run core gameplay flows after each milestone.
- Compare performance and stability against prior baselines.
- Review system interactions whenever new content or architecture is added.

---

## 7. PERFORMANCE PLAN

### Chunk Loading
- Stream chunks around the player with a bounded radius.
- Prioritize nearby chunks first and defer distant chunks.
- Use asynchronous generation and mesh building where possible.

### Chunk Unloading
- Unload distant chunks after they leave the active radius.
- Persist modified chunks before removal where necessary.
- Release mesh data and references promptly to avoid memory growth.

### Frustum Culling
- Render only chunks and entities within the active camera view.
- Skip hidden or occluded geometry where practical.
- Maintain view-based visibility updates per frame.

### Greedy Meshing
- Merge adjacent voxel faces to reduce draw calls.
- Use chunk-local meshing to limit work per update.
- Rebuild only dirty regions when possible.

### Memory Management
- Use compact block storage and chunk-level memory budgets.
- Avoid retaining stale references after chunk unloads.
- Track allocations and monitor memory pressure during playtests.

### Object Pooling
- Reuse temporary mesh builders, particle systems, and other high-frequency objects.
- Reduce allocations in gameplay loops and chunk updates.
- Keep pooled objects lifecycle-managed and deterministic.

### Optimization Strategy
- Separate CPU-heavy world updates from GPU-bound rendering.
- Limit chunk generation concurrency to maintain stability.
- Use profiling-driven tuning at every milestone.
- Keep content data lightweight and modular to support scaling.

---

## 8. EXPANSION PLAN

The architecture will be designed for future expansion without major rewrites by using data-driven registries, isolated systems, and versioned content pipelines.

### Dimensions
- Netherbound: Fire-based terrain, lava seas, volcanic structures, and hostile biomes.
- Skyreach: Floating islands, cloud forests, and aerial hazards.
- Deepvoid: Dark subterranean realms with void corruption and rare resources.

### Biomes
- Crystal Plains
- Ember Wastes
- Frostwild
- Verdant Jungle
- Shattered Cliffs
- Arcane Forest

### Blocks
The content system will support a complete, data-driven Minecraft-style block registry, including the full vanilla block families and variants across all major categories:
- Natural terrain and stone: stone, granite, diorite, andesite, deepslate, calcite, tuff, driftwood, gravel, sand, clay, dirt, grass, mycelium, podzol, moss, mud, packed mud, netherrack, basalt, blackstone, end stone, obsidian, crying obsidian, and related variants.
- Ores and minerals: coal ore, iron ore, copper ore, gold ore, redstone ore, emerald ore, lapis ore, diamond ore, nether gold ore, quartz ore, ancient debris, and associated mineral blocks.
- Wood and vegetation: oak, spruce, birch, jungle, acacia, dark oak, mangrove, cherry, pale oak, stripped logs, planks, stairs, slabs, fences, doors, trapdoors, buttons, pressure plates, signs, leaves, saplings, vines, moss, mushrooms, flowers, crops, cacti, sugar cane, bamboo, kelp, sea grass, corals, and related natural flora.
- Building and decorative blocks: bricks, stone bricks, cracked stone bricks, mossy stone bricks, nether bricks, prismarine, purpur, terracotta, glazed terracotta, concrete, concrete powder, wool, carpets, banners, candles, lanterns, torches, candles, chests, barrels, bookshelves, and decorative blocks.
- Utility and redstone: redstone dust, repeaters, comparators, pistons, sticky pistons, dispensers, droppers, observers, hoppers, rails, powered rails, detectors, activator rails, levers, buttons, pressure plates, doors, trapdoors, ladders, scaffolding, chains, and mechanisms.
- Liquid and special blocks: water, lava, ice, packed ice, blue ice, snow, powder snow, frosted ice, glass, tinted glass, glowstone, shroomlight, sea lanterns, beacon bases, command blocks, structure blocks, and other special blocks.
- Nether, End, and fantasy expansion blocks: soul sand, soul soil, warped nylium, crimson nylium, warped stems, crimson stems, chorus plants, chorus flowers, end rods, purpur blocks, shulker boxes, and future expansion blocks such as crystal, magma, froststone, voidglass, copperwood, and runic ore.

### Items
- Runic Tools
- Crystal Weapons
- Ember Armor
- Voidsteel Gear

### Mobs
- Stoneback
- Emberling
- Frostcrawler
- Void Wraith
- Sky Serpent

### Bosses
- Titan of Cinders
- Frost Monarch
- Void Harvester
- Sky Leviathan

### Crafting Stations
- Arcane Forge
- Crystal Loom
- Mechanist Bench
- Alchemy Crucible

### Game Modes
- Hardcore
- Adventure
- Creative
- Seasonal Events

### Other Expansions
- Multiplayer
- Vehicles
- Magic
- Skills
- Seasons
- NPC Factions
- More Dimensions
- More Bosses
- More Biomes
- More Crafting Stations

---

## DEVELOPMENT RULES

1. Do not skip ahead to future milestones.
2. Complete each milestone in order.
3. After each milestone, update this plan, mark tasks complete, record optimizations, and note future improvements.
4. Stop and await review before beginning the next milestone.
5. A milestone is not considered complete until it is visually and functionally credible in review.
6. Avoid rewriting completed systems unless absolutely necessary.
7. Treat this document as the master authority for the project.
8. Follow AAA-grade production discipline at all times.
9. Any milestone that is only a placeholder or a low-fidelity prototype is considered incomplete until it is upgraded to a reviewable state.

---

## APPROVAL GATE

The project is ready for review. No development work will begin until this plan is approved.
