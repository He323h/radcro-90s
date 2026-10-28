/**
 * Blastar Reborn - Types & Interfaces
 */

export type GameState = 'COCKPIT_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type StageId = 1 | 2 | 3;

export interface StageConfig {
  id: StageId;
  name: string;
  subtitle: string;
  theme: 'deep_space' | 'alien_cavern' | 'cyber_ruins';
  bgColor: string;
  speed: number;
  scoreThreshold: number;
}

export type EnemyType = 'cruiser' | 'skull' | 'plasma';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  tilt: number; // -1 to 1 banking tilt for dogfight maneuvers
  speed: number;
  shield: number;
  maxShield: number;
  lives: number; // 3 Lifelines / Hearts
  maxLives: number;
  energy: number;
  maxEnergy: number;
  weaponLevel: number; // 1 to 4
  invulnerableTimer: number;
  shootCooldown: number;
  isShooting: boolean;
  score: number;
  kills: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  scoreValue: number;
  shootTimer: number;
  shootInterval: number;
  patternTime: number;
  rotation: number;
  scale: number;
  corePulse: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isEnemy: boolean;
  damage: number;
  color: string;
  glowColor: string;
  beamType?: 'lance' | 'needle' | 'meteor' | 'laser';
  trail: { x: number; y: number }[];
}

export type PowerUpType = 'heart' | 'orb';

export interface PowerUp {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  vy: number;
  radius: number;
  bobTimer: number;
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isSpark?: boolean;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  alpha: number;
}

export interface CelestialBody {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: 'planet_ring' | 'nebula' | 'gas_giant' | 'spore_cluster' | 'neon_billboard';
  color: string;
  detailColor: string;
  label?: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  color: string;
  layer: 1 | 2 | 3;
}
