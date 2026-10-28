export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type EnvironmentTheme = 
  | 'suburban'     // 1. Suburban Town
  | 'sea_bridge'   // 2. Sea Bridge / Pier
  | 'desert'       // 3. Desert Canyon
  | 'tropical'     // 4. Tropical Beach
  | 'cargo_port';  // 5. Cargo Port

export type WeatherMode = 
  | 'summer'       // Bright sunny clear skies, golden sunshine
  | 'winter'       // Snow-covered ground, falling snowflakes, icy road
  | 'sunrise'      // Warm amber/peach morning horizon, glowing sunrise tint
  | 'rain';        // Dark thunderous rain, lightning flashes, wet asphalt

export interface WeatherPreset {
  name: string;
  icon: string;
  skyOverlay: string;
  groundTint?: string;
  roadTint?: string;
  groundOverride?: string;
  groundDetailOverride?: string;
  roadColorOverride?: string;
  curbLightOverride?: string;
  curbDarkOverride?: string;
  laneMarkingOverride?: string;
  friction: number;
  rainCount: number;
  snowCount: number;
  hasLightning: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  damage: number;
  color: string;
  width: number;
  height: number;
  shooterId?: number;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  size: number;
  opacity: number;
  type: 'rain' | 'snow';
}

export interface Vehicle {
  id: number;
  type: 
    | 'yellow_sedan' 
    | 'red_sport' 
    | 'cargo_truck' 
    | 'parked_hazard' 
    | 'bonus_s_car'
    | 'rival_muscle'      // Aggressive rival car that side-rams and races you!
    | 'police_interceptor'// Police car chasing racers with flashing sirens!
    | 'boss_tanker';      // Sector Boss heavy tanker with HP bar!
  x: number;              // Road horizontal coordinate (px relative to road left)
  y: number;              // Screen vertical coordinate or track world Y
  width: number;
  height: number;
  speedKmH: number;       // Traffic speed
  lane: number;           // Target lane
  targetLane?: number;
  laneChangeTimer?: number;
  isChangingLane?: boolean;
  blinkSide?: 'left' | 'right' | null;
  color?: string;

  // Combat & Vehicular Battle attributes
  hp?: number;
  maxHp?: number;
  isWrecked?: boolean;
  wreckSpin?: number;
  wreckAngle?: number;
  wreckVelocityX?: number;
  wreckVelocityY?: number;
  isAggressive?: boolean;
  targetX?: number;
  hornCooldown?: number;
  isFightingAnother?: boolean;
  fightTargetId?: number;
  name?: string;

  // Weapons & Shooting
  shootCooldown?: number;
  canShoot?: boolean;
}

export interface RoadHazard {
  id: number;
  type: 'oil_slick' | 'puddle' | 'pothole' | 'barrier_cone' | 'stunt_ramp' | 'rolling_boulder';
  x: number;
  y: number;
  width: number;
  height: number;
  rot?: number;
  vx?: number;
}

export interface FuelCollectible {
  id: number;
  type: 'fuel_can' | 'super_battery' | 'shield_cowcatcher' | 'weapon_crate';
  x: number;
  y: number;
  width: number;
  height: number;
  pulsePhase: number;
}

export interface SceneryProp {
  id: number;
  theme: EnvironmentTheme;
  side: 'left' | 'right';
  type: 
    // Suburban
    | 'house' | 'tennis_court' | 'hedge' | 'tree' | 'suburban_curb'
    // Sea Bridge
    | 'pier_dock' | 'yacht' | 'speedboat' | 'buoy' | 'bridge_support'
    // Desert Canyon
    | 'cactus' | 'canyon_rock' | 'tumbleweed' | 'overhead_plane'
    // Tropical Beach
    | 'palm_tree' | 'parasol' | 'beach_towel' | 'ocean_surf'
    // Cargo Port
    | 'shipping_container' | 'port_warehouse' | 'dock_crane' | 'parked_semi'
    // Winter additions
    | 'snowman' | 'snow_pine';
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: number;
  extraData?: Record<string, unknown>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'smoke' | 'spark' | 'flame' | 'skid' | 'water_splash' | 'debris' | 'shockwave' | 'muzzle_flash';
}

export interface FloatingCombatText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface SkidMark {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

export interface CheckpointInfo {
  distanceMeters: number;
  name: string;
  theme: EnvironmentTheme;
  reached: boolean;
}

export interface PlayerCar {
  x: number;            // Normalized within road coordinates
  y: number;            // Fixed or slightly dynamic near bottom
  width: number;
  height: number;
  speedKmH: number;
  maxSpeedKmH: number;
  angle: number;        // Rotation in radians (-0.5 to 0.5)
  fuel: number;         // 0 to 100
  maxFuel: number;
  
  // Fishtail / Skid recovery state
  skidState: 'none' | 'skidding_left' | 'skidding_right' | 'spinning' | 'crashed';
  skidSeverity: number;
  skidTimer: number;
  counterSteerNeeded: 'left' | 'right' | null;
  recoveryNoticeTimer: number;

  // Boost & invincible state
  boostTimer: number;
  invincibleTimer: number;

  // Stunt Jump & Air mechanics (Mega Ramps!)
  jumpAltitude: number;
  jumpTimer: number;

  // Vehicular Combat & Side-Slam Mechanics
  slamTimer: number;
  slamCooldown: number;
  slamDirection: 'left' | 'right' | null;
  shieldBumperTimer: number;

  // Mounted Weapons & Shooting
  shootCooldown: number;
  weaponLevel: number; // 1 = Twin Blaster, 2 = Plasma Repeaters, 3 = Hyper Cannon
  weaponTimer: number;

  // Takedown & Adventure Stats
  takedownCount: number;
  comboCount: number;
  comboTimer: number;

  // Visual cues
  brakeLightsOn: boolean;
  turningDirection: -1 | 0 | 1;
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  date: string;
  rank: string;
  takedowns: number;
}
