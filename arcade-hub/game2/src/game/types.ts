export type CharacterId = 'RYUGA' | 'KAZUMA' | 'SAKURA';

export type GameMode = 'ARCADE' | 'VERSUS' | 'TRAINING';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'CHAMPION';
export type StageId = 'COURTYARD' | 'NEON_ALLEY' | 'DOJO';

export type GamePhase =
  | 'TITLE'
  | 'CHARACTER_SELECT'
  | 'ROUND_INTRO'
  | 'FIGHTING'
  | 'ROUND_OVER'
  | 'MATCH_OVER'
  | 'PAUSED';

export type FighterState =
  | 'IDLE'
  | 'WALK_FWD'
  | 'WALK_BACK'
  | 'JUMP_START'
  | 'JUMP_UP'
  | 'JUMP_FALL'
  | 'CROUCH'
  | 'BLOCK_HIGH'
  | 'BLOCK_LOW'
  | 'LIGHT_PUNCH'
  | 'HEAVY_PUNCH'
  | 'LIGHT_KICK'
  | 'HEAVY_KICK'
  | 'CROUCH_PUNCH'
  | 'CROUCH_KICK'
  | 'JUMP_PUNCH'
  | 'JUMP_KICK'
  | 'SPECIAL_PROJECTILE'
  | 'SPECIAL_DRAGON'
  | 'SPECIAL_WHIRLWIND'
  | 'SPECIAL_SLIDE'
  | 'SUPER_ART'
  | 'HIT_LIGHT'
  | 'HIT_HEAVY'
  | 'KNOCKDOWN'
  | 'GETUP'
  | 'VICTORY'
  | 'DEFEAT'
  | 'DIZZY';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AttackData {
  damage: number;
  chipDamage: number;
  hitstun: number; // frames
  blockstun: number; // frames
  pushback: number;
  knockdown?: boolean;
  isLow?: boolean;
  isOverhead?: boolean;
  meterGain: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  hitbox: Rect; // relative to fighter pos
  soundType: 'light' | 'heavy' | 'kick_light' | 'kick_heavy' | 'special' | 'super';
}

export interface Projectile {
  id: number;
  ownerId: 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  chipDamage: number;
  hitstun: number;
  color: string;
  glowColor: string;
  trail: { x: number; y: number; alpha: number; size: number }[];
  life: number;
  maxLife: number;
  active: boolean;
  isSuper?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'sakura' | 'ki' | 'guard' | 'blood' | 'super_ring';
  rotation?: number;
  rotSpeed?: number;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  country: string;
  style: string;
  portraitColor: string;
  themeColor: string;
  primaryColor: string;
  secondaryColor: string;
  skinColor: string;
  hairColor: string;
  accentColor: string;
  speed: number;
  jumpForce: number;
  maxHealth: number;
  quoteWin: string;
  specialNames: {
    projectile: string;
    antiAir: string;
    special3: string;
    superArt: string;
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  lp: boolean; // Light Punch
  hp: boolean; // Heavy Punch
  lk: boolean; // Light Kick
  hk: boolean; // Heavy Kick
  special: boolean; // Special Move shortcut
  superArt: boolean; // Super Move shortcut
  block: boolean; // Block shortcut / hold back
}
