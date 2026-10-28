import { LevelData, Block, Enemy, Collectible, Spring, Flagpole } from './types';

export const TILE_SIZE = 16;

export function createLevels(): LevelData[] {
  // Helper to place ground strip
  const makeGround = (startX: number, y: number, length: number): Block[] => {
    const blocks: Block[] = [];
    for (let i = 0; i < length; i++) {
      blocks.push({
        x: (startX + i) * TILE_SIZE,
        y: y * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        type: 'ground',
        bounceOffset: 0,
        bounceVy: 0,
      });
    }
    return blocks;
  };

  // Helper for pipe
  const makePipe = (x: number, groundY: number, heightInTiles: number): Block[] => {
    const blocks: Block[] = [];
    // Top
    blocks.push({
      x: x * TILE_SIZE,
      y: (groundY - heightInTiles) * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'pipe_top_left',
      bounceOffset: 0,
      bounceVy: 0,
    });
    blocks.push({
      x: (x + 1) * TILE_SIZE,
      y: (groundY - heightInTiles) * TILE_SIZE,
      width: TILE_SIZE,
      height: TILE_SIZE,
      type: 'pipe_top_right',
      bounceOffset: 0,
      bounceVy: 0,
    });
    // Body
    for (let h = 1; h < heightInTiles; h++) {
      blocks.push({
        x: x * TILE_SIZE,
        y: (groundY - heightInTiles + h) * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        type: 'pipe_left',
        bounceOffset: 0,
        bounceVy: 0,
      });
      blocks.push({
        x: (x + 1) * TILE_SIZE,
        y: (groundY - heightInTiles + h) * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        type: 'pipe_right',
        bounceOffset: 0,
        bounceVy: 0,
      });
    }
    return blocks;
  };

  // ==========================================
  // LEVEL 1: EMERALD MEADOWS
  // ==========================================
  const l1Blocks: Block[] = [
    // Main ground sections with pits
    ...makeGround(0, 15, 24),
    ...makeGround(27, 15, 28),
    ...makeGround(58, 15, 32),
    ...makeGround(94, 15, 35),
    ...makeGround(132, 15, 40),

    // Pipes
    ...makePipe(14, 15, 2),
    ...makePipe(42, 15, 3),
    ...makePipe(74, 15, 2),
    ...makePipe(108, 15, 3),

    // Platforms & Question blocks early
    { x: 8 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },
    { x: 10 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 11 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'fire_flower', bounceOffset: 0, bounceVy: 0 },
    { x: 12 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 13 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },

    // High cloud platforms
    { x: 18 * TILE_SIZE, y: 9 * TILE_SIZE, width: 4 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 30 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },
    { x: 32 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'star', bounceOffset: 0, bounceVy: 0 },
    { x: 34 * TILE_SIZE, y: 11 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },

    // Stepping stone bricks over pit 1
    { x: 24 * TILE_SIZE, y: 13 * TILE_SIZE, width: 2 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },

    // Mid section stairs and floating islands
    { x: 48 * TILE_SIZE, y: 11 * TILE_SIZE, width: 3 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 52 * TILE_SIZE, y: 8 * TILE_SIZE, width: 4 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 53 * TILE_SIZE, y: 5 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'cherry_1up', bounceOffset: 0, bounceVy: 0 },

    // Stepping stones over pit 2
    { x: 55 * TILE_SIZE, y: 12 * TILE_SIZE, width: 2 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },

    // Middle zone
    { x: 64 * TILE_SIZE, y: 11 * TILE_SIZE, width: 4 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 65 * TILE_SIZE, y: 8 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },
    { x: 66 * TILE_SIZE, y: 8 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },

    // Pit 3 challenge with high bridge
    { x: 90 * TILE_SIZE, y: 12 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'wood_bridge', bounceOffset: 0, bounceVy: 0 },

    // Pyramidal staircase up to goal
    { x: 120 * TILE_SIZE, y: 14 * TILE_SIZE, width: 4 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 121 * TILE_SIZE, y: 13 * TILE_SIZE, width: 3 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 122 * TILE_SIZE, y: 12 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 123 * TILE_SIZE, y: 11 * TILE_SIZE, width: 1 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
  ];

  const l1Enemies: Enemy[] = [
    { id: 1, type: 'urchin', x: 18 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 18 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: -0.6, vy: 0, width: 16, height: 16, facing: 'left', patrolMinX: 16 * TILE_SIZE, patrolMaxX: 23 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 2, type: 'urchin', x: 33 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 33 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: 0.6, vy: 0, width: 16, height: 16, facing: 'right', patrolMinX: 28 * TILE_SIZE, patrolMaxX: 41 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 3, type: 'winged_beetle', x: 49 * TILE_SIZE, y: 9 * TILE_SIZE, startX: 49 * TILE_SIZE, startY: 9 * TILE_SIZE, vx: -0.7, vy: -1.8, width: 16, height: 16, facing: 'left', patrolMinX: 46 * TILE_SIZE, patrolMaxX: 52 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 4, type: 'piranha', x: 42 * TILE_SIZE + 4, y: 12 * TILE_SIZE, startX: 42 * TILE_SIZE + 4, startY: 12 * TILE_SIZE, vx: 0, vy: 0, width: 16, height: 20, facing: 'left', patrolMinX: 0, patrolMaxX: 0, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0, pipeYMin: 10 * TILE_SIZE + 2, pipeYMax: 12 * TILE_SIZE + 10, pipeState: 'rising', pipeTimer: 0 },
    { id: 5, type: 'urchin', x: 62 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 62 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: 0.6, vy: 0, width: 16, height: 16, facing: 'right', patrolMinX: 59 * TILE_SIZE, patrolMaxX: 73 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 6, type: 'winged_beetle', x: 80 * TILE_SIZE, y: 11 * TILE_SIZE, startX: 80 * TILE_SIZE, startY: 11 * TILE_SIZE, vx: 0.7, vy: -2, width: 16, height: 16, facing: 'right', patrolMinX: 76 * TILE_SIZE, patrolMaxX: 86 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 7, type: 'urchin', x: 100 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 100 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: -0.8, vy: 0, width: 16, height: 16, facing: 'left', patrolMinX: 95 * TILE_SIZE, patrolMaxX: 107 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 8, type: 'piranha', x: 108 * TILE_SIZE + 4, y: 12 * TILE_SIZE, startX: 108 * TILE_SIZE + 4, startY: 12 * TILE_SIZE, vx: 0, vy: 0, width: 16, height: 20, facing: 'left', patrolMinX: 0, patrolMaxX: 0, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0, pipeYMin: 10 * TILE_SIZE + 2, pipeYMax: 12 * TILE_SIZE + 10, pipeState: 'hiding', pipeTimer: 60 },
  ];

  const l1Collectibles: Collectible[] = [
    // Early coin arc
    { id: 1, type: 'coin', x: 4 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 2, type: 'coin', x: 5 * TILE_SIZE, y: 12 * TILE_SIZE, startY: 12 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 3, type: 'coin', x: 6 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    // On high cloud
    { id: 4, type: 'coin', x: 19 * TILE_SIZE, y: 7 * TILE_SIZE, startY: 7 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 5, type: 'coin', x: 20 * TILE_SIZE, y: 7 * TILE_SIZE, startY: 7 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 6, type: 'coin', x: 21 * TILE_SIZE, y: 7 * TILE_SIZE, startY: 7 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    // Secret gems
    { id: 7, type: 'coin', x: 37 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 8, type: 'coin', x: 38 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 9, type: 'coin', x: 70 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 10, type: 'coin', x: 71 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 11, type: 'coin', x: 91 * TILE_SIZE, y: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 12, type: 'coin', x: 92 * TILE_SIZE, y: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
  ];

  const l1Springs: Spring[] = [
    { x: 50 * TILE_SIZE, y: 14 * TILE_SIZE, width: 16, height: 16, bounceTimer: 0 },
    { x: 114 * TILE_SIZE, y: 14 * TILE_SIZE, width: 16, height: 16, bounceTimer: 0 },
  ];

  const l1Flagpole: Flagpole = {
    x: 145 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    height: 10 * TILE_SIZE,
    flagY: 5 * TILE_SIZE + 4,
    reached: false,
  };

  const level1: LevelData = {
    id: 1,
    name: 'World 1-1',
    subtitle: 'Emerald Meadows',
    theme: 'day',
    width: 155 * TILE_SIZE,
    height: 18 * TILE_SIZE,
    playerStart: { x: 32, y: 13 * TILE_SIZE },
    blocks: l1Blocks,
    enemies: l1Enemies,
    collectibles: l1Collectibles,
    springs: l1Springs,
    flagpole: l1Flagpole,
    timeLimit: 300,
  };

  // ==========================================
  // LEVEL 2: MUSHROOM CAVERN
  // ==========================================
  const l2Blocks: Block[] = [
    // Cavern floor with deep chasms and spikes
    ...makeGround(0, 15, 20),
    ...makeGround(24, 15, 18),
    ...makeGround(46, 15, 25),
    ...makeGround(76, 15, 20),
    ...makeGround(102, 15, 36),

    // Pipes
    ...makePipe(16, 15, 3),
    ...makePipe(36, 15, 2),
    ...makePipe(60, 15, 4),
    ...makePipe(90, 15, 3),

    // Spikes in pits
    { x: 21 * TILE_SIZE, y: 15 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 22 * TILE_SIZE, y: 15 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 23 * TILE_SIZE, y: 15 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 43 * TILE_SIZE, y: 15 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 44 * TILE_SIZE, y: 15 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 45 * TILE_SIZE, y: 15 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },

    // Underground cave ledges
    { x: 8 * TILE_SIZE, y: 11 * TILE_SIZE, width: 3 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 9 * TILE_SIZE, y: 8 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'fire_flower', bounceOffset: 0, bounceVy: 0 },

    // Floating wooden bridges & cloud shelves
    { x: 20 * TILE_SIZE, y: 11 * TILE_SIZE, width: 4 * TILE_SIZE, height: 10, type: 'wood_bridge', bounceOffset: 0, bounceVy: 0 },
    { x: 27 * TILE_SIZE, y: 8 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 28 * TILE_SIZE, y: 5 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'star', bounceOffset: 0, bounceVy: 0 },

    // Mid cavern double-decker route
    { x: 50 * TILE_SIZE, y: 10 * TILE_SIZE, width: 6 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 52 * TILE_SIZE, y: 7 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },
    { x: 53 * TILE_SIZE, y: 7 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'coin', bounceOffset: 0, bounceVy: 0 },
    { x: 54 * TILE_SIZE, y: 7 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'cherry_1up', bounceOffset: 0, bounceVy: 0 },

    // Stepping platforms over chasm
    { x: 72 * TILE_SIZE, y: 12 * TILE_SIZE, width: 2 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 96 * TILE_SIZE, y: 13 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 100 * TILE_SIZE, y: 10 * TILE_SIZE, width: 2 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },

    // Goal staircase
    { x: 124 * TILE_SIZE, y: 14 * TILE_SIZE, width: 4 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 125 * TILE_SIZE, y: 13 * TILE_SIZE, width: 3 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 126 * TILE_SIZE, y: 12 * TILE_SIZE, width: 2 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
  ];

  const l2Enemies: Enemy[] = [
    { id: 11, type: 'urchin', x: 10 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 10 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: -0.7, vy: 0, width: 16, height: 16, facing: 'left', patrolMinX: 5 * TILE_SIZE, patrolMaxX: 15 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 12, type: 'piranha', x: 16 * TILE_SIZE + 4, y: 11 * TILE_SIZE, startX: 16 * TILE_SIZE + 4, startY: 11 * TILE_SIZE, vx: 0, vy: 0, width: 16, height: 20, facing: 'left', patrolMinX: 0, patrolMaxX: 0, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0, pipeYMin: 9 * TILE_SIZE + 2, pipeYMax: 11 * TILE_SIZE + 10, pipeState: 'rising', pipeTimer: 10 },
    { id: 13, type: 'winged_beetle', x: 26 * TILE_SIZE, y: 11 * TILE_SIZE, startX: 26 * TILE_SIZE, startY: 11 * TILE_SIZE, vx: 0.8, vy: -2.2, width: 16, height: 16, facing: 'right', patrolMinX: 24 * TILE_SIZE, patrolMaxX: 35 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 14, type: 'urchin', x: 30 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 30 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: -0.8, vy: 0, width: 16, height: 16, facing: 'left', patrolMinX: 25 * TILE_SIZE, patrolMaxX: 35 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 15, type: 'piranha', x: 60 * TILE_SIZE + 4, y: 10 * TILE_SIZE, startX: 60 * TILE_SIZE + 4, startY: 10 * TILE_SIZE, vx: 0, vy: 0, width: 16, height: 20, facing: 'left', patrolMinX: 0, patrolMaxX: 0, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0, pipeYMin: 8 * TILE_SIZE + 2, pipeYMax: 10 * TILE_SIZE + 10, pipeState: 'rising', pipeTimer: 30 },
    { id: 16, type: 'winged_beetle', x: 82 * TILE_SIZE, y: 11 * TILE_SIZE, startX: 82 * TILE_SIZE, startY: 11 * TILE_SIZE, vx: -0.9, vy: -2, width: 16, height: 16, facing: 'left', patrolMinX: 77 * TILE_SIZE, patrolMaxX: 92 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 17, type: 'urchin', x: 108 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 108 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: 0.8, vy: 0, width: 16, height: 16, facing: 'right', patrolMinX: 103 * TILE_SIZE, patrolMaxX: 118 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
  ];

  const l2Collectibles: Collectible[] = [
    { id: 13, type: 'coin', x: 12 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 14, type: 'coin', x: 21 * TILE_SIZE, y: 9 * TILE_SIZE, startY: 9 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 15, type: 'coin', x: 22 * TILE_SIZE, y: 9 * TILE_SIZE, startY: 9 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 16, type: 'coin', x: 51 * TILE_SIZE, y: 5 * TILE_SIZE, startY: 5 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 17, type: 'coin', x: 73 * TILE_SIZE, y: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 18, type: 'coin', x: 97 * TILE_SIZE, y: 11 * TILE_SIZE, startY: 11 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 19, type: 'coin', x: 101 * TILE_SIZE, y: 8 * TILE_SIZE, startY: 8 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
  ];

  const l2Springs: Spring[] = [
    { x: 33 * TILE_SIZE, y: 14 * TILE_SIZE, width: 16, height: 16, bounceTimer: 0 },
    { x: 88 * TILE_SIZE, y: 14 * TILE_SIZE, width: 16, height: 16, bounceTimer: 0 },
  ];

  const l2Flagpole: Flagpole = {
    x: 132 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    height: 10 * TILE_SIZE,
    flagY: 5 * TILE_SIZE + 4,
    reached: false,
  };

  const level2: LevelData = {
    id: 2,
    name: 'World 1-2',
    subtitle: 'Mushroom Cavern',
    theme: 'cavern',
    width: 142 * TILE_SIZE,
    height: 18 * TILE_SIZE,
    playerStart: { x: 32, y: 13 * TILE_SIZE },
    blocks: l2Blocks,
    enemies: l2Enemies,
    collectibles: l2Collectibles,
    springs: l2Springs,
    flagpole: l2Flagpole,
    timeLimit: 280,
  };

  // ==========================================
  // LEVEL 3: SKY CASTLE FORTRESS (WITH BOSS!)
  // ==========================================
  const l3Blocks: Block[] = [
    // Castle parapets and lava floor below
    ...makeGround(0, 15, 20),
    ...makeGround(25, 15, 16),
    ...makeGround(45, 15, 20),
    ...makeGround(70, 15, 18),
    // Boss arena (wide, flat, enclosed with high walls)
    ...makeGround(92, 15, 34),

    // Left wall of boss arena to prevent escape
    { x: 91 * TILE_SIZE, y: 10 * TILE_SIZE, width: TILE_SIZE, height: 5 * TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    // Right wall
    { x: 125 * TILE_SIZE, y: 10 * TILE_SIZE, width: TILE_SIZE, height: 5 * TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },

    // Magma spikes in gaps
    { x: 20 * TILE_SIZE, y: 16 * TILE_SIZE, width: 5 * TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 41 * TILE_SIZE, y: 16 * TILE_SIZE, width: 4 * TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },
    { x: 65 * TILE_SIZE, y: 16 * TILE_SIZE, width: 5 * TILE_SIZE, height: TILE_SIZE, type: 'spike', bounceOffset: 0, bounceVy: 0 },

    // Castle battlements platforms
    { x: 10 * TILE_SIZE, y: 11 * TILE_SIZE, width: 3 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 11 * TILE_SIZE, y: 8 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'fire_flower', bounceOffset: 0, bounceVy: 0 },

    // High suspended bridges over lava
    { x: 21 * TILE_SIZE, y: 12 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'wood_bridge', bounceOffset: 0, bounceVy: 0 },
    { x: 30 * TILE_SIZE, y: 10 * TILE_SIZE, width: 4 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 32 * TILE_SIZE, y: 7 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'star', bounceOffset: 0, bounceVy: 0 },

    { x: 42 * TILE_SIZE, y: 11 * TILE_SIZE, width: 2 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
    { x: 50 * TILE_SIZE, y: 11 * TILE_SIZE, width: 4 * TILE_SIZE, height: TILE_SIZE, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 51 * TILE_SIZE, y: 8 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'question', content: 'cherry_1up', bounceOffset: 0, bounceVy: 0 },

    { x: 66 * TILE_SIZE, y: 12 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'wood_bridge', bounceOffset: 0, bounceVy: 0 },
    { x: 78 * TILE_SIZE, y: 10 * TILE_SIZE, width: 4 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },

    // Platforms inside boss arena to leap from
    { x: 96 * TILE_SIZE, y: 11 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 117 * TILE_SIZE, y: 11 * TILE_SIZE, width: 3 * TILE_SIZE, height: 10, type: 'brick', bounceOffset: 0, bounceVy: 0 },
    { x: 106 * TILE_SIZE, y: 8 * TILE_SIZE, width: 4 * TILE_SIZE, height: 10, type: 'cloud_platform', bounceOffset: 0, bounceVy: 0 },
  ];

  const l3Enemies: Enemy[] = [
    { id: 20, type: 'urchin', x: 12 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 12 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: -0.8, vy: 0, width: 16, height: 16, facing: 'left', patrolMinX: 6 * TILE_SIZE, patrolMaxX: 18 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 21, type: 'winged_beetle', x: 28 * TILE_SIZE, y: 11 * TILE_SIZE, startX: 28 * TILE_SIZE, startY: 11 * TILE_SIZE, vx: 0.9, vy: -2.3, width: 16, height: 16, facing: 'right', patrolMinX: 25 * TILE_SIZE, patrolMaxX: 38 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 22, type: 'urchin', x: 54 * TILE_SIZE, y: 14 * TILE_SIZE, startX: 54 * TILE_SIZE, startY: 14 * TILE_SIZE, vx: -0.9, vy: 0, width: 16, height: 16, facing: 'left', patrolMinX: 47 * TILE_SIZE, patrolMaxX: 62 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    { id: 23, type: 'winged_beetle', x: 74 * TILE_SIZE, y: 11 * TILE_SIZE, startX: 74 * TILE_SIZE, startY: 11 * TILE_SIZE, vx: -0.9, vy: -2, width: 16, height: 16, facing: 'left', patrolMinX: 71 * TILE_SIZE, patrolMaxX: 84 * TILE_SIZE, alive: true, health: 1, maxHealth: 1, animTimer: 0, animFrame: 0, isSquashed: false, squashTimer: 0 },
    // Mini-Boss: Iron Spiketoad King!
    {
      id: 99,
      type: 'boss',
      x: 110 * TILE_SIZE,
      y: 13 * TILE_SIZE,
      startX: 110 * TILE_SIZE,
      startY: 13 * TILE_SIZE,
      vx: -1.0,
      vy: 0,
      width: 32,
      height: 32,
      facing: 'left',
      patrolMinX: 94 * TILE_SIZE,
      patrolMaxX: 122 * TILE_SIZE,
      alive: true,
      health: 3,
      maxHealth: 3,
      animTimer: 0,
      animFrame: 0,
      isSquashed: false,
      squashTimer: 0,
      bossPhase: 1,
      bossAttackTimer: 0,
    },
  ];

  const l3Collectibles: Collectible[] = [
    { id: 24, type: 'coin', x: 14 * TILE_SIZE, y: 13 * TILE_SIZE, startY: 13 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 25, type: 'coin', x: 22 * TILE_SIZE, y: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 26, type: 'coin', x: 43 * TILE_SIZE, y: 9 * TILE_SIZE, startY: 9 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 27, type: 'coin', x: 67 * TILE_SIZE, y: 10 * TILE_SIZE, startY: 10 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 28, type: 'coin', x: 107 * TILE_SIZE, y: 6 * TILE_SIZE, startY: 6 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
    { id: 29, type: 'coin', x: 108 * TILE_SIZE, y: 6 * TILE_SIZE, startY: 6 * TILE_SIZE, width: 12, height: 12, collected: false, animTimer: 0, animFrame: 0, floatOffset: 0 },
  ];

  const l3Springs: Spring[] = [
    { x: 38 * TILE_SIZE, y: 14 * TILE_SIZE, width: 16, height: 16, bounceTimer: 0 },
    { x: 84 * TILE_SIZE, y: 14 * TILE_SIZE, width: 16, height: 16, bounceTimer: 0 },
  ];

  const l3Flagpole: Flagpole = {
    x: 123 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    height: 10 * TILE_SIZE,
    flagY: 5 * TILE_SIZE + 4,
    reached: false,
  };

  const level3: LevelData = {
    id: 3,
    name: 'World 1-3',
    subtitle: 'Sky Castle Fortress',
    theme: 'castle',
    width: 130 * TILE_SIZE,
    height: 18 * TILE_SIZE,
    playerStart: { x: 32, y: 13 * TILE_SIZE },
    blocks: l3Blocks,
    enemies: l3Enemies,
    collectibles: l3Collectibles,
    springs: l3Springs,
    flagpole: l3Flagpole,
    timeLimit: 260,
  };

  return [level1, level2, level3];
}
