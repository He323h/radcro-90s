export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER' | 'GAME_VICTORY';

export type PowerupType = 'none' | 'cape' | 'fire' | 'star';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  action: boolean;
  actionJustPressed: boolean;
  dash: boolean;
  dashJustPressed: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  grounded: boolean;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  lives: number;
  score: number;
  coins: number;
  powerup: PowerupType;
  starTimer: number; // Invincibility star timer
  invulnerableTimer: number; // Hurt i-frames
  spinTimer: number; // Cape spin active attack timer
  spinCooldown: number;
  dashTimer: number; // Air/ground dash active timer
  dashCooldown: number;
  coyoteTimer: number; // Jump grace window
  jumpBufferTimer: number; // Jump buffer before landing
  doubleJumpAvailable: boolean; // Mid-air jump / cape flutter
  isDashing: boolean;
  isCrouching: boolean;
  isSpinning: boolean;
  walkFrame: number;
  walkTimer: number;
  checkpoint: { x: number; y: number } | null;
}

export type EnemyType = 'urchin' | 'winged_beetle' | 'piranha' | 'boss';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  patrolMinX: number;
  patrolMaxX: number;
  alive: boolean;
  health: number;
  maxHealth: number;
  animTimer: number;
  animFrame: number;
  isSquashed: boolean;
  squashTimer: number;
  // Specific to piranha pipe enemy
  pipeYMin?: number;
  pipeYMax?: number;
  pipeState?: 'hiding' | 'rising' | 'waiting' | 'lowering';
  pipeTimer?: number;
  // Specific to Boss
  bossPhase?: number;
  bossAttackTimer?: number;
}

export type CollectibleType = 'coin' | 'star' | 'fire_flower' | 'cherry_1up' | 'speed_boots';

export interface Collectible {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  startY: number;
  width: number;
  height: number;
  collected: boolean;
  animTimer: number;
  animFrame: number;
  floatOffset: number;
  vy?: number;
  vx?: number;
  grounded?: boolean;
}

export type BlockType = 
  | 'ground' 
  | 'brick' 
  | 'question' 
  | 'empty' 
  | 'pipe_left' 
  | 'pipe_right' 
  | 'pipe_top_left' 
  | 'pipe_top_right'
  | 'cloud_platform' 
  | 'wood_bridge'
  | 'spike';

export interface Block {
  x: number; // In grid tiles or absolute coords
  y: number;
  width: number;
  height: number;
  type: BlockType;
  content?: 'coin' | 'star' | 'fire_flower' | 'cherry_1up' | 'none';
  bounceOffset: number;
  bounceVy: number;
  broken?: boolean;
}

export interface Spring {
  x: number;
  y: number;
  width: number;
  height: number;
  bounceTimer: number;
}

export interface Flagpole {
  x: number;
  y: number;
  height: number;
  flagY: number;
  reached: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  isPlayer: boolean;
  bounces: number;
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
  shape?: 'square' | 'circle' | 'spark';
  gravity?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
}

export interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  theme: 'day' | 'cavern' | 'castle';
  width: number; // In world pixels
  height: number;
  playerStart: { x: number; y: number };
  blocks: Block[];
  enemies: Enemy[];
  collectibles: Collectible[];
  springs: Spring[];
  flagpole: Flagpole;
  timeLimit: number;
}
