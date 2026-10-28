export type Direction = 1 | -1; // 1: Right, -1: Left

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PlayerState = 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'magic' | 'hurt' | 'dead';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: Direction;
  state: PlayerState;
  stateTimer: number;
  frame: number;
  isGrounded: boolean;
  canDoubleJump: boolean;
  hasDoubleJumped: boolean;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  invincibleTimer: number;
  attackTimer: number;
  attackHasHit: boolean;
  magicTimer: number;
  coins: number;
  rescuedVillagers: number;
  totalVillagers: number;
  coyoteTimer: number;
  jumpBufferTimer: number;
}

export type EnemyType = 'shield_knight' | 'spitter' | 'bat' | 'spider';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: Direction;
  health: number;
  maxHealth: number;
  isGrounded: boolean;
  patrolLeft: number;
  patrolRight: number;
  isShieldUp?: boolean;
  attackCooldown: number;
  stateTimer: number;
  frame: number;
  hurtTimer: number;
  dead: boolean;
  // Spider-specific
  originY?: number;
  isDropping?: boolean;
  isRetracting?: boolean;
  // Bat-specific
  baseY?: number;
  swoopTimer?: number;
  // Spitter-specific
  spitWindup?: number;
}

export type BreakableType = 'barrel' | 'pot' | 'chest' | 'cage';

export interface Breakable {
  id: number;
  type: BreakableType;
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  opened?: boolean;
  containsItem?: 'coin' | 'health' | 'mana' | 'villager';
  coinsCount?: number;
}

export interface VillagerNPC {
  id: number;
  x: number;
  y: number;
  rescued: boolean;
  rescueTimer: number;
  facing: Direction;
}

export type ItemType = 'coin' | 'health' | 'mana';

export interface ItemDrop {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  lifeTimer: number;
  collected: boolean;
}

export interface Projectile {
  id: number;
  type: 'player_magic' | 'enemy_spit';
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  damage: number;
  life: number;
  frame: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  life: number;
}

export interface LevelData {
  id: number;
  name: string;
  theme: 'catacombs' | 'molten' | 'citadel';
  subtitle: string;
  width: number;
  height: number;
  tiles: number[][]; // 0: empty, 1: solid stone, 2: stone top, 3: wood bridge, 4: spike, 5: lava, 6: lava surface
  playerSpawn: { x: number; y: number };
  exitPortal: { x: number; y: number; w: number; h: number };
  enemies: Array<{ type: EnemyType; x: number; y: number; patrolRange?: number }>;
  breakables: Array<{ type: BreakableType; x: number; y: number; contains?: 'coin' | 'health' | 'mana' | 'villager'; coinsCount?: number }>;
  cages: Array<{ x: number; y: number }>;
  torches: Array<{ x: number; y: number }>;
  lavaFalls: Array<{ x: number; startY: number; endY: number }>;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  attack: boolean;
  magic: boolean;
  justJumped: boolean;
  justAttacked: boolean;
  justMagic: boolean;
}
