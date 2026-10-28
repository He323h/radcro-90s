// Level Design for Sword of Xolan
// 3 Complete Hand-Crafted Stages with Caged Villagers, Enemies, Hazards, and Breakables

import { LevelData } from './types';

// Helper to create empty grid
function createEmptyGrid(width: number, height: number): number[][] {
  const grid: number[][] = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill(0));
  }
  return grid;
}

// ----------------------------------------------------
// LEVEL 1: The Sunken Catacombs
// ----------------------------------------------------
function buildLevel1(): LevelData {
  const width = 54;
  const height = 15;
  const tiles = createEmptyGrid(width, height);

  // Bottom boundary floor
  for (let x = 0; x < width; x++) {
    tiles[14][x] = 1;
    tiles[13][x] = 2; // walkable stone top
  }
  // Left and right boundary walls
  for (let y = 0; y < height; y++) {
    tiles[y][0] = 1;
    tiles[y][width - 1] = 1;
  }
  // Ceiling
  for (let x = 0; x < width; x++) {
    tiles[0][x] = 1;
  }

  // Section 1: Starting dungeon & first jump
  // Spikes pit at x = 12..14
  tiles[13][12] = 4;
  tiles[13][13] = 4;
  tiles[13][14] = 4;

  // Platform over spikes
  tiles[10][10] = 2;
  tiles[10][11] = 2;
  tiles[10][12] = 3; // wooden bridge
  tiles[10][13] = 3;
  tiles[10][14] = 3;
  tiles[10][15] = 2;
  tiles[10][16] = 2;

  // Upper ledge for Cage 1 (Villager 1)
  tiles[6][4] = 2;
  tiles[6][5] = 2;
  tiles[6][6] = 2;
  tiles[6][7] = 2;
  tiles[7][4] = 1;
  tiles[7][5] = 1;
  tiles[7][6] = 1;
  tiles[7][7] = 1;

  // Stepping stones up to Cage 1
  tiles[9][2] = 3;
  tiles[9][3] = 3;

  // Middle section: Wall barrier with arch
  for (let y = 1; y <= 9; y++) {
    tiles[y][20] = 1;
  }
  // Wooden bridges connecting through middle
  tiles[10][21] = 3;
  tiles[10][22] = 3;
  tiles[10][23] = 3;

  // Upper tier platform with Cage 2
  tiles[7][24] = 2;
  tiles[7][25] = 2;
  tiles[7][26] = 2;
  tiles[7][27] = 2;
  tiles[7][28] = 2;
  tiles[8][24] = 1;
  tiles[8][25] = 1;
  tiles[8][26] = 1;
  tiles[8][27] = 1;
  tiles[8][28] = 1;

  // Lower pit with spikes at x = 28..31
  tiles[13][29] = 4;
  tiles[13][30] = 4;
  tiles[13][31] = 4;

  // Stepping platforms
  tiles[10][32] = 2;
  tiles[10][33] = 2;
  tiles[10][34] = 3;
  tiles[10][35] = 3;

  // Tower before exit with Cage 3
  for (let y = 5; y <= 13; y++) {
    tiles[y][40] = 1;
  }
  tiles[4][37] = 3;
  tiles[4][38] = 3;
  tiles[4][39] = 3;
  tiles[5][41] = 2;
  tiles[5][42] = 2;
  tiles[5][43] = 2;
  tiles[5][44] = 2;
  tiles[6][41] = 1;
  tiles[6][42] = 1;
  tiles[6][43] = 1;
  tiles[6][44] = 1;

  // Wooden bridge to exit chamber
  tiles[9][45] = 3;
  tiles[9][46] = 3;
  tiles[9][47] = 3;

  return {
    id: 1,
    name: 'Stage 1',
    theme: 'catacombs',
    subtitle: 'The Sunken Catacombs',
    width,
    height,
    tiles,
    playerSpawn: { x: 32, y: 192 },
    exitPortal: { x: 49 * 16, y: 11 * 16 - 4, w: 28, h: 36 },
    cages: [
      { x: 5 * 16, y: 5 * 16 - 4 },   // Villager 1 on high left ledge
      { x: 26 * 16, y: 6 * 16 - 4 },  // Villager 2 on middle fortress tier
      { x: 42 * 16, y: 4 * 16 - 4 },  // Villager 3 on upper tower
    ],
    enemies: [
      { type: 'bat', x: 8 * 16, y: 4 * 16 },
      { type: 'shield_knight', x: 17 * 16, y: 12 * 16 - 8, patrolRange: 60 },
      { type: 'spitter', x: 27 * 16, y: 6 * 16 - 4 },
      { type: 'spider', x: 34 * 16, y: 1 * 16 },
      { type: 'bat', x: 36 * 16, y: 6 * 16 },
      { type: 'shield_knight', x: 46 * 16, y: 12 * 16 - 8, patrolRange: 50 },
    ],
    breakables: [
      { type: 'barrel', x: 7 * 16, y: 12 * 16, contains: 'coin', coinsCount: 3 },
      { type: 'pot', x: 8 * 16 + 4, y: 12 * 16, contains: 'mana' },
      { type: 'chest', x: 4 * 16, y: 12 * 16, contains: 'coin', coinsCount: 10 },
      { type: 'barrel', x: 15 * 16, y: 9 * 16, contains: 'health' },
      { type: 'pot', x: 22 * 16, y: 12 * 16, contains: 'coin', coinsCount: 2 },
      { type: 'chest', x: 24 * 16, y: 6 * 16 - 4, contains: 'coin', coinsCount: 8 },
      { type: 'barrel', x: 33 * 16, y: 9 * 16, contains: 'mana' },
      { type: 'pot', x: 48 * 16, y: 12 * 16, contains: 'health' },
    ],
    torches: [
      { x: 3 * 16, y: 10 * 16 },
      { x: 11 * 16, y: 8 * 16 },
      { x: 20 * 16, y: 5 * 16 },
      { x: 33 * 16, y: 7 * 16 },
      { x: 41 * 16, y: 7 * 16 },
      { x: 50 * 16, y: 9 * 16 },
    ],
    lavaFalls: [],
  };
}

// ----------------------------------------------------
// LEVEL 2: The Molten Cavern
// ----------------------------------------------------
function buildLevel2(): LevelData {
  const width = 60;
  const height = 15;
  const tiles = createEmptyGrid(width, height);

  // Boundaries
  for (let y = 0; y < height; y++) {
    tiles[y][0] = 1;
    tiles[y][width - 1] = 1;
  }
  for (let x = 0; x < width; x++) {
    tiles[0][x] = 1;
    tiles[14][x] = 1;
  }

  // Base floor with lava pits
  for (let x = 0; x < width; x++) {
    tiles[13][x] = 2;
  }

  // Lava Pit 1 (x = 10..15)
  for (let x = 10; x <= 15; x++) {
    tiles[13][x] = 6; // Lava surface
    tiles[14][x] = 5; // Deep lava
  }
  // Bridge over Lava Pit 1
  tiles[10][11] = 3;
  tiles[10][12] = 3;
  tiles[10][13] = 3;
  tiles[10][14] = 3;

  // High perch with Cage 1
  tiles[6][6] = 2;
  tiles[6][7] = 2;
  tiles[6][8] = 2;
  tiles[7][6] = 1;
  tiles[7][7] = 1;
  tiles[7][8] = 1;
  tiles[9][4] = 3;
  tiles[9][5] = 3;

  // Middle elevated platform
  tiles[10][18] = 2;
  tiles[10][19] = 2;
  tiles[10][20] = 2;
  tiles[11][18] = 1;
  tiles[11][19] = 1;
  tiles[11][20] = 1;
  tiles[12][18] = 1;
  tiles[12][19] = 1;
  tiles[12][20] = 1;

  // Lava Pit 2 (x = 23..32) Large volcanic gorge!
  for (let x = 23; x <= 32; x++) {
    tiles[13][x] = 6;
    tiles[14][x] = 5;
  }

  // Stepping stone islands over gorge
  tiles[11][24] = 2;
  tiles[11][25] = 2;
  tiles[12][24] = 1;
  tiles[12][25] = 1;

  tiles[9][27] = 3;
  tiles[9][28] = 3;

  tiles[7][30] = 2;
  tiles[7][31] = 2;
  tiles[7][32] = 2;
  tiles[8][30] = 1;
  tiles[8][31] = 1;
  tiles[8][32] = 1;

  // Cage 2 on island over gorge
  // High cavern ceiling path
  tiles[4][21] = 3;
  tiles[4][22] = 3;
  tiles[4][23] = 3;

  // Section 3: Spikes and molten towers
  tiles[13][37] = 4;
  tiles[13][38] = 4;
  tiles[13][39] = 4;

  tiles[9][36] = 2;
  tiles[9][37] = 2;
  tiles[9][38] = 3;
  tiles[9][39] = 3;
  tiles[9][40] = 2;
  tiles[9][41] = 2;

  // Upper sanctuary with Cage 3
  tiles[5][45] = 2;
  tiles[5][46] = 2;
  tiles[5][47] = 2;
  tiles[5][48] = 2;
  tiles[6][45] = 1;
  tiles[6][46] = 1;
  tiles[6][47] = 1;
  tiles[6][48] = 1;
  tiles[7][43] = 3;
  tiles[7][44] = 3;

  // Final stretch
  tiles[13][46] = 4;
  tiles[13][47] = 4;

  return {
    id: 2,
    name: 'Stage 2',
    theme: 'molten',
    subtitle: 'The Molten Cavern',
    width,
    height,
    tiles,
    playerSpawn: { x: 32, y: 192 },
    exitPortal: { x: 55 * 16, y: 11 * 16 - 4, w: 28, h: 36 },
    cages: [
      { x: 7 * 16, y: 5 * 16 - 4 },   // Cage 1 on high volcanic ledge
      { x: 31 * 16, y: 6 * 16 - 4 },  // Cage 2 over the great lava gorge
      { x: 47 * 16, y: 4 * 16 - 4 },  // Cage 3 in upper sanctuary
    ],
    enemies: [
      { type: 'spitter', x: 8 * 16, y: 12 * 16 - 4 },
      { type: 'bat', x: 13 * 16, y: 6 * 16 },
      { type: 'spider', x: 19 * 16, y: 1 * 16 },
      { type: 'shield_knight', x: 20 * 16, y: 9 * 16 - 8, patrolRange: 35 },
      { type: 'bat', x: 26 * 16, y: 5 * 16 },
      { type: 'spider', x: 31 * 16, y: 1 * 16 },
      { type: 'spitter', x: 40 * 16, y: 8 * 16 - 4 },
      { type: 'shield_knight', x: 51 * 16, y: 12 * 16 - 8, patrolRange: 50 },
    ],
    breakables: [
      { type: 'pot', x: 5 * 16, y: 12 * 16, contains: 'coin', coinsCount: 4 },
      { type: 'barrel', x: 6 * 16, y: 5 * 16 - 4, contains: 'health' },
      { type: 'chest', x: 8 * 16, y: 5 * 16 - 4, contains: 'coin', coinsCount: 12 },
      { type: 'pot', x: 19 * 16, y: 9 * 16 - 4, contains: 'mana' },
      { type: 'chest', x: 22 * 16, y: 3 * 16, contains: 'coin', coinsCount: 15 },
      { type: 'barrel', x: 37 * 16, y: 8 * 16, contains: 'health' },
      { type: 'pot', x: 45 * 16, y: 4 * 16 - 4, contains: 'mana' },
      { type: 'pot', x: 54 * 16, y: 12 * 16, contains: 'coin', coinsCount: 5 },
    ],
    torches: [
      { x: 4 * 16, y: 9 * 16 },
      { x: 17 * 16, y: 8 * 16 },
      { x: 35 * 16, y: 6 * 16 },
      { x: 44 * 16, y: 4 * 16 },
      { x: 53 * 16, y: 9 * 16 },
    ],
    lavaFalls: [
      { x: 12 * 16 + 8, startY: 1, endY: 10 },
      { x: 29 * 16 + 8, startY: 1, endY: 13 },
    ],
  };
}

// ----------------------------------------------------
// LEVEL 3: The Crimson Citadel
// ----------------------------------------------------
function buildLevel3(): LevelData {
  const width = 64;
  const height = 16;
  const tiles = createEmptyGrid(width, height);

  // Boundaries
  for (let y = 0; y < height; y++) {
    tiles[y][0] = 1;
    tiles[y][width - 1] = 1;
  }
  for (let x = 0; x < width; x++) {
    tiles[0][x] = 1;
    tiles[15][x] = 1;
    tiles[14][x] = 2;
  }

  // Grand Citadel multi-floor castle architecture
  // Spikes pit at entrance
  tiles[14][8] = 4;
  tiles[14][9] = 4;
  tiles[14][10] = 4;

  tiles[11][7] = 2;
  tiles[11][8] = 3;
  tiles[11][9] = 3;
  tiles[11][10] = 3;
  tiles[11][11] = 2;

  // Tower 1 (x = 13..15)
  for (let y = 6; y <= 14; y++) {
    tiles[y][14] = 1;
  }
  tiles[6][12] = 2;
  tiles[6][13] = 2;
  tiles[6][14] = 2;
  tiles[6][15] = 2;

  // Hanging bridges
  tiles[9][16] = 3;
  tiles[9][17] = 3;
  tiles[9][18] = 3;

  // Cage 1 on high dungeon vault
  tiles[4][18] = 2;
  tiles[4][19] = 2;
  tiles[4][20] = 2;
  tiles[5][18] = 1;
  tiles[5][19] = 1;
  tiles[5][20] = 1;

  // Central Citadel Hall
  tiles[11][22] = 2;
  tiles[11][23] = 2;
  tiles[11][24] = 2;
  tiles[11][25] = 2;
  tiles[11][26] = 2;
  tiles[11][27] = 2;
  tiles[11][28] = 2;
  tiles[12][22] = 1;
  tiles[12][28] = 1;

  // Spikes underneath hall
  for (let x = 23; x <= 27; x++) {
    tiles[14][x] = 4;
  }

  // Upper throne ledge with Cage 2
  tiles[6][25] = 2;
  tiles[6][26] = 2;
  tiles[6][27] = 2;
  tiles[6][28] = 2;
  tiles[7][25] = 1;
  tiles[7][26] = 1;
  tiles[7][27] = 1;
  tiles[7][28] = 1;

  // Lava chasm at x = 32..37
  for (let x = 32; x <= 37; x++) {
    tiles[14][x] = 6;
    tiles[15][x] = 5;
  }

  // Floating defense platforms
  tiles[10][33] = 3;
  tiles[10][34] = 3;
  tiles[8][36] = 3;
  tiles[8][37] = 3;

  // Grand Bastion (x = 40..52)
  tiles[11][41] = 2;
  tiles[11][42] = 2;
  tiles[11][43] = 2;
  tiles[11][44] = 2;
  tiles[11][45] = 2;
  tiles[11][46] = 2;
  tiles[11][47] = 2;
  tiles[11][48] = 2;
  tiles[11][49] = 2;
  tiles[12][41] = 1;
  tiles[12][49] = 1;

  // Cage 3 in the upper fortress cell
  tiles[6][44] = 2;
  tiles[6][45] = 2;
  tiles[6][46] = 2;
  tiles[6][47] = 2;
  tiles[7][44] = 1;
  tiles[7][45] = 1;
  tiles[7][46] = 1;
  tiles[7][47] = 1;
  tiles[8][42] = 3;
  tiles[8][43] = 3;

  // Exit chamber floor
  tiles[14][54] = 4;
  tiles[14][55] = 4;
  tiles[10][54] = 3;
  tiles[10][55] = 3;

  return {
    id: 3,
    name: 'Stage 3',
    theme: 'citadel',
    subtitle: 'The Crimson Citadel',
    width,
    height,
    tiles,
    playerSpawn: { x: 32, y: 192 },
    exitPortal: { x: 59 * 16, y: 12 * 16 - 4, w: 28, h: 36 },
    cages: [
      { x: 19 * 16, y: 3 * 16 - 4 },  // Cage 1 high vault
      { x: 26 * 16, y: 5 * 16 - 4 },  // Cage 2 above central hall
      { x: 45 * 16, y: 5 * 16 - 4 },  // Cage 3 in fortress cell
    ],
    enemies: [
      { type: 'bat', x: 9 * 16, y: 5 * 16 },
      { type: 'shield_knight', x: 18 * 16, y: 13 * 16 - 8, patrolRange: 45 },
      { type: 'spider', x: 20 * 16, y: 1 * 16 },
      { type: 'spitter', x: 25 * 16, y: 10 * 16 - 4 },
      { type: 'bat', x: 34 * 16, y: 5 * 16 },
      { type: 'spider', x: 37 * 16, y: 1 * 16 },
      { type: 'shield_knight', x: 44 * 16, y: 10 * 16 - 8, patrolRange: 60 },
      { type: 'spitter', x: 48 * 16, y: 10 * 16 - 4 },
      { type: 'shield_knight', x: 56 * 16, y: 13 * 16 - 8, patrolRange: 40 },
    ],
    breakables: [
      { type: 'pot', x: 4 * 16, y: 13 * 16, contains: 'coin', coinsCount: 5 },
      { type: 'chest', x: 13 * 16, y: 5 * 16 - 4, contains: 'coin', coinsCount: 15 },
      { type: 'barrel', x: 22 * 16, y: 10 * 16, contains: 'health' },
      { type: 'pot', x: 28 * 16, y: 5 * 16 - 4, contains: 'mana' },
      { type: 'chest', x: 30 * 16, y: 13 * 16, contains: 'coin', coinsCount: 20 },
      { type: 'barrel', x: 42 * 16, y: 10 * 16, contains: 'health' },
      { type: 'pot', x: 46 * 16, y: 5 * 16 - 4, contains: 'mana' },
      { type: 'chest', x: 52 * 16, y: 13 * 16, contains: 'coin', coinsCount: 25 },
    ],
    torches: [
      { x: 3 * 16, y: 10 * 16 },
      { x: 14 * 16, y: 8 * 16 },
      { x: 24 * 16, y: 8 * 16 },
      { x: 36 * 16, y: 6 * 16 },
      { x: 46 * 16, y: 8 * 16 },
      { x: 58 * 16, y: 10 * 16 },
    ],
    lavaFalls: [
      { x: 33 * 16 + 8, startY: 1, endY: 14 },
    ],
  };
}

export const LEVELS: Record<number, () => LevelData> = {
  1: buildLevel1,
  2: buildLevel2,
  3: buildLevel3,
};
