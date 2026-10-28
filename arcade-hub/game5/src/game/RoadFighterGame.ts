/**
 * RoadFighterGame - Top-Down 2D Vertical Racing Arcade Engine
 * Pure 60 FPS HTML5 Canvas engine with classic Road Fighter physics,
 * vehicular combat, car shooting, rival road rage, weather presets (Winter, Summer, Sunrise, Rain),
 * stunt jumps, police pursuits, and boss encounters.
 */

import { retroAudio } from '../audio/retroAudio';
import { 
  TRACK_TOTAL_DISTANCE, 
  BASE_ROAD_WIDTH, 
  LANE_COUNT, 
  SHOULDER_WIDTH,
  MAX_NORMAL_SPEED,
  BOOST_SPEED,
  MIN_SPEED,
  ACCEL_RATE,
  BRAKE_RATE,
  NATURAL_DECEL_RATE,
  INITIAL_FUEL,
  FUEL_BURN_LOW_SPEED,
  FUEL_BURN_HIGH_SPEED,
  FUEL_BURN_BOOST,
  FUEL_PICKUP_VALUE,
  SUPER_BATTERY_VALUE,
  CRASH_FUEL_PENALTY,
  STEER_SPEED_FACTOR,
  ZONE_RANGES,
  CHECKPOINTS,
  THEME_COLORS,
  WEATHER_PRESETS
} from './constants';
import { 
  GameState, 
  EnvironmentTheme, 
  WeatherMode,
  PlayerCar, 
  Vehicle, 
  RoadHazard, 
  FuelCollectible, 
  SceneryProp, 
  Particle,
  SkidMark,
  CheckpointInfo,
  FloatingCombatText,
  Bullet,
  WeatherParticle
} from './types';
import {
  drawPlayerCar,
  drawVehicle,
  drawRoadHazard,
  drawFuelCollectible,
  drawSceneryProp,
  drawFinishLineGantry,
  drawFloatingCombatText,
  drawBullet,
  drawWeatherParticles,
  drawWeatherAtmosphere
} from './sprites';

export interface GameTelemetry {
  score: number;
  hiScore: number;
  speedKmH: number;
  fuel: number;
  distanceMeters: number;
  totalDistance: number;
  theme: EnvironmentTheme;
  themeName: string;
  weather: WeatherMode;
  weatherName: string;
  skidNotice: 'none' | 'left' | 'right' | 'recovered';
  isBoost: boolean;
  gameState: GameState;
  takedowns: number;
  comboCount: number;
  isAirborne: boolean;
  hasShieldRam: boolean;
  bossActive: boolean;
  weaponLevel: number;
  finalRank?: string;
  finalBonus?: number;
}

export class RoadFighterGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;

  // React HUD callback
  public onTelemetryUpdate?: (data: GameTelemetry) => void;
  public onStateChange?: (state: GameState) => void;

  // Core Game State
  public state: GameState = 'TITLE';
  public score: number = 0;
  public hiScore: number = 15000;
  public distanceMeters: number = 0;
  public currentTheme: EnvironmentTheme = 'suburban';
  public currentWeather: WeatherMode = 'summer';

  // Player Entity
  public player: PlayerCar;

  // Track & Road layout
  private roadScrollY: number = 0;
  private roadWidth: number = BASE_ROAD_WIDTH;
  private laneWidth: number = BASE_ROAD_WIDTH / LANE_COUNT;

  // Dynamic Objects
  private traffic: Vehicle[] = [];
  private hazards: RoadHazard[] = [];
  private collectibles: FuelCollectible[] = [];
  private sceneryProps: SceneryProp[] = [];
  private particles: Particle[] = [];
  private skidMarks: SkidMark[] = [];
  private floatingTexts: FloatingCombatText[] = [];
  private bullets: Bullet[] = [];
  private weatherParticles: WeatherParticle[] = [];

  // Weather & Atmosphere Timers
  private lightningTimer: number = 7.0;
  private lightningAlpha: number = 0;

  // Spawn timers
  private nextTrafficSpawnDist: number = 70;
  private nextHazardSpawnDist: number = 140;
  private nextFuelSpawnDist: number = 200;
  private nextScenerySpawnDist: number = 35;
  private nextPoliceDist: number = 1200;
  private bossSpawned: boolean = false;

  // Checkpoints
  private checkpoints: CheckpointInfo[];
  private lastCheckpointNotice: string | null = null;
  private checkpointNoticeTimer: number = 0;

  // Camera Shake
  private cameraShake: number = 0;

  // Input states
  private input = {
    left: false,
    right: false,
    accelerate: false,
    brake: false,
    shoot: false,
    touchTargetX: null as number | null,
  };

  // Canvas Dimensions
  private width: number = 800;
  private height: number = 900;
  private roadLeft: number = 0;

  private entityIdCounter: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    try {
      const savedHi = localStorage.getItem('road_fighter_hiscore');
      if (savedHi) this.hiScore = Math.max(parseInt(savedHi, 10), 15000);
    } catch {
      // Ignore
    }

    this.checkpoints = JSON.parse(JSON.stringify(CHECKPOINTS));
    this.player = this.createDefaultPlayer();
    this.resize();
    this.setupWindowListeners();
    this.initWeatherParticles();
  }

  private createDefaultPlayer(): PlayerCar {
    return {
      x: BASE_ROAD_WIDTH / 2,
      y: 0,
      width: 44,
      height: 76,
      speedKmH: 0,
      maxSpeedKmH: MAX_NORMAL_SPEED,
      angle: 0,
      fuel: INITIAL_FUEL,
      maxFuel: 100,
      skidState: 'none',
      skidSeverity: 0,
      skidTimer: 0,
      counterSteerNeeded: null,
      recoveryNoticeTimer: 0,
      boostTimer: 0,
      invincibleTimer: 0,
      jumpAltitude: 0,
      jumpTimer: 0,
      slamTimer: 0,
      slamCooldown: 0,
      slamDirection: null,
      shieldBumperTimer: 0,
      shootCooldown: 0,
      weaponLevel: 1,
      weaponTimer: 0,
      takedownCount: 0,
      comboCount: 0,
      comboTimer: 0,
      brakeLightsOn: false,
      turningDirection: 0,
    };
  }

  public resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    this.roadWidth = Math.min(Math.max(this.width * 0.72, 340), 520);
    this.roadLeft = (this.width - this.roadWidth) / 2;
    this.laneWidth = this.roadWidth / LANE_COUNT;

    this.player.y = this.height * 0.74;
  }

  private setupWindowListeners() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('blur', () => {
      this.input.left = false;
      this.input.right = false;
      this.input.accelerate = false;
      this.input.brake = false;
      this.input.shoot = false;
      this.input.touchTargetX = null;
      if (this.state === 'PLAYING') {
        this.pause();
      }
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      retroAudio.init();
      if (this.state !== 'PLAYING') return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.handleTouchSteer(x);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (this.state !== 'PLAYING') return;
      if (e.buttons > 0) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        this.handleTouchSteer(x);
      }
    });

    this.canvas.addEventListener('pointerup', () => {
      this.input.touchTargetX = null;
    });

    this.canvas.addEventListener('pointercancel', () => {
      this.input.touchTargetX = null;
    });
  }

  private handleTouchSteer(touchCanvasX: number) {
    const roadX = touchCanvasX - this.roadLeft;
    this.input.touchTargetX = roadX;
  }

  // ==========================================================================
  // Weather System
  // ==========================================================================
  public setWeather(mode: WeatherMode) {
    this.currentWeather = mode;
    this.initWeatherParticles();
    const preset = WEATHER_PRESETS[mode];
    this.addFloatingText(`★ ${preset.icon} ${preset.name.toUpperCase()}! ★`, this.roadLeft + this.roadWidth / 2, this.height * 0.45, '#38bdf8');
  }

  public cycleWeather() {
    const modes: WeatherMode[] = ['summer', 'winter', 'sunrise', 'rain'];
    const nextIdx = (modes.indexOf(this.currentWeather) + 1) % modes.length;
    this.setWeather(modes[nextIdx]);
  }

  private initWeatherParticles() {
    this.weatherParticles = [];
    const count = this.currentWeather === 'rain' ? 90 : this.currentWeather === 'winter' ? 70 : 0;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: this.currentWeather === 'rain' ? -40 : (Math.random() - 0.5) * 50,
        vy: this.currentWeather === 'rain' ? 1100 + Math.random() * 400 : 160 + Math.random() * 120,
        length: this.currentWeather === 'rain' ? 24 + Math.random() * 16 : 0,
        size: this.currentWeather === 'winter' ? 2 + Math.random() * 3.5 : 1.5,
        opacity: 0.4 + Math.random() * 0.5,
        type: this.currentWeather === 'rain' ? 'rain' : 'snow',
      });
    }
  }

  // ==========================================================================
  // Game Lifecycle Control
  // ==========================================================================
  public startNewGame(weather?: WeatherMode) {
    retroAudio.init();
    this.state = 'PLAYING';
    this.score = 0;
    this.distanceMeters = 0;
    this.currentTheme = 'suburban';
    if (weather) {
      this.currentWeather = weather;
    }

    this.player = this.createDefaultPlayer();
    this.player.y = this.height * 0.74;
    this.player.x = this.roadWidth / 2 - this.player.width / 2;

    this.traffic = [];
    this.hazards = [];
    this.collectibles = [];
    this.sceneryProps = [];
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.bullets = [];

    this.checkpoints = JSON.parse(JSON.stringify(CHECKPOINTS));
    this.nextTrafficSpawnDist = 70;
    this.nextHazardSpawnDist = 130;
    this.nextFuelSpawnDist = 180;
    this.nextScenerySpawnDist = 30;
    this.nextPoliceDist = 1200;
    this.bossSpawned = false;

    this.initWeatherParticles();
    this.seedInitialScenery();

    if (this.onStateChange) this.onStateChange('PLAYING');

    if (!this.animationFrameId) {
      this.lastTimestamp = performance.now();
      this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  public pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      retroAudio.stopEngine();
      retroAudio.setScreech(false);
      retroAudio.stopLowFuelAlarm();
      if (this.onStateChange) this.onStateChange('PAUSED');
    }
  }

  public resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTimestamp = performance.now();
      if (this.onStateChange) this.onStateChange('PLAYING');
    }
  }

  public goToTitle() {
    this.state = 'TITLE';
    retroAudio.stopEngine();
    retroAudio.setScreech(false);
    retroAudio.stopLowFuelAlarm();
    this.player.speedKmH = 0;
    this.player.skidState = 'none';
    this.player.boostTimer = 0;
    this.bullets = [];
    this.particles = [];
    if (this.onStateChange) this.onStateChange('TITLE');
    this.emitTelemetry();
  }

  public setInput(control: 'left' | 'right' | 'accelerate' | 'brake' | 'shoot', pressed: boolean) {
    this.input[control] = pressed;
    if (pressed) {
      retroAudio.init();
    }
  }

  public triggerTurbo() {
    retroAudio.init();
    if (this.state === 'PLAYING' && this.player.fuel > 8) {
      this.player.boostTimer = Math.max(this.player.boostTimer, 3.5);
      this.player.speedKmH = BOOST_SPEED;
      this.player.fuel = Math.max(0, this.player.fuel - 4);
      retroAudio.playFuelPickup(true);
      this.addFloatingText('TURBO BOOST!', this.roadLeft + this.player.x + 20, this.player.y - 20, '#38bdf8');
    }
  }

  /**
   * Gun Shooting: Twin hood-mounted blaster cannon fire!
   */
  public triggerShoot() {
    retroAudio.init();
    const p = this.player;
    if (this.state !== 'PLAYING' || p.skidState === 'crashed' || p.shootCooldown > 0) return;

    p.shootCooldown = p.weaponLevel === 3 ? 0.09 : p.weaponLevel === 2 ? 0.12 : 0.16;
    retroAudio.playPlayerShoot();

    const carScreenX = this.roadLeft + p.x;
    const carScreenY = p.y;
    const bulletSpeedY = -920;

    if (p.weaponLevel === 1) {
      // Twin Laser Blasters
      this.bullets.push({
        id: this.entityIdCounter++,
        x: carScreenX + 10,
        y: carScreenY - 6,
        vx: 0,
        vy: bulletSpeedY,
        isPlayer: true,
        damage: 1,
        color: '#38bdf8',
        width: 4,
        height: 14,
      });
      this.bullets.push({
        id: this.entityIdCounter++,
        x: carScreenX + p.width - 10,
        y: carScreenY - 6,
        vx: 0,
        vy: bulletSpeedY,
        isPlayer: true,
        damage: 1,
        color: '#38bdf8',
        width: 4,
        height: 14,
      });
    } else if (p.weaponLevel === 2) {
      // Quad Plasma Repeaters (spread angle)
      [-1, 1].forEach((dir) => {
        this.bullets.push({
          id: this.entityIdCounter++,
          x: carScreenX + p.width / 2 + dir * 14,
          y: carScreenY - 8,
          vx: dir * 45,
          vy: bulletSpeedY,
          isPlayer: true,
          damage: 1.5,
          color: '#facc15',
          width: 5,
          height: 16,
        });
      });
    } else {
      // Hyper Gatling Cannon (Triple Stream)
      [-16, 0, 16].forEach((offset) => {
        this.bullets.push({
          id: this.entityIdCounter++,
          x: carScreenX + p.width / 2 + offset,
          y: carScreenY - 8,
          vx: offset * 3,
          vy: -1050,
          isPlayer: true,
          damage: 2,
          color: '#a855f7',
          width: 6,
          height: 18,
        });
      });
    }

    // Recoil smoke particles
    this.particles.push({
      x: carScreenX + p.width / 2,
      y: carScreenY - 4,
      vx: (Math.random() - 0.5) * 40,
      vy: 60,
      life: 0.18,
      maxLife: 0.18,
      color: '#fef08a',
      size: 5,
      type: 'muzzle_flash',
    });
  }

  /**
   * Vehicular Combat: Heavy Side-Slam / Body-Check Ram!
   */
  public triggerSideSlam(direction: 'left' | 'right') {
    retroAudio.init();
    const p = this.player;
    if (this.state !== 'PLAYING' || p.slamCooldown > 0 || p.skidState === 'crashed') return;

    p.slamTimer = 0.28;
    p.slamCooldown = 0.85;
    p.slamDirection = direction;
    retroAudio.playSlam();

    const dashDistance = direction === 'left' ? -38 : 38;
    p.x = Math.max(10, Math.min(this.roadWidth - p.width - 10, p.x + dashDistance));

    const slamBox = {
      x: direction === 'left' ? p.x - 25 : p.x,
      y: p.y - 10,
      w: p.width + 25,
      h: p.height + 20,
    };

    for (let i = 0; i < this.traffic.length; i++) {
      const v = this.traffic[i];
      if (v.isWrecked) continue;

      const vBox = { x: v.x, y: v.y, w: v.width, h: v.height };
      if (this.isAABBIntersect(slamBox, vBox)) {
        this.executeTakedown(v, 'SIDE SLAM TAKEDOWN!');
        break;
      }
    }
  }

  // ==========================================================================
  // Main Game Loop (60 FPS with Clamped dt)
  // ==========================================================================
  private loop(timestamp: number) {
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    const dt = Math.min(rawDt, 0.05);

    if (this.state === 'PLAYING') {
      this.update(dt);
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
  }

  // ==========================================================================
  // Simulation Update
  // ==========================================================================
  private update(dt: number) {
    this.updateSpeedAndFuel(dt);
    this.updateSteeringAndSkid(dt);
    this.updateAirborneJump(dt);
    this.updateShootingAndWeapons(dt);
    this.updateDistanceAndTheme(dt);
    this.updateTraffic(dt);
    this.updateHazardsAndCollectibles(dt);
    this.updateScenery(dt);
    this.updateWeatherAndAtmosphere(dt);
    this.updateParticles(dt);
    this.updateFloatingTexts(dt);
    this.checkCollisions();
    this.checkCheckpoints();
    this.emitTelemetry();

    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
    }
  }

  // ---------------- Speed & Fuel Physics ----------------
  private updateSpeedAndFuel(dt: number) {
    const p = this.player;

    if (p.skidState === 'crashed') {
      p.speedKmH = Math.max(0, p.speedKmH - BRAKE_RATE * 1.5 * dt);
      retroAudio.updateEngine(p.speedKmH, false, false);
      return;
    }

    if (p.boostTimer > 0) {
      p.boostTimer -= dt;
      p.maxSpeedKmH = BOOST_SPEED;
    } else {
      p.maxSpeedKmH = MAX_NORMAL_SPEED;
    }

    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.recoveryNoticeTimer > 0) p.recoveryNoticeTimer -= dt;
    if (p.slamCooldown > 0) p.slamCooldown -= dt;
    if (p.slamTimer > 0) p.slamTimer -= dt;
    if (p.shieldBumperTimer > 0) p.shieldBumperTimer -= dt;
    if (p.shootCooldown > 0) p.shootCooldown -= dt;

    if (p.weaponTimer > 0) {
      p.weaponTimer -= dt;
      if (p.weaponTimer <= 0) {
        p.weaponLevel = 1;
      }
    }

    if (p.comboTimer > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) {
        p.comboCount = 0;
      }
    }

    const isAccelerating = this.input.accelerate || p.boostTimer > 0;
    p.brakeLightsOn = this.input.brake;

    if (isAccelerating) {
      const rate = p.boostTimer > 0 ? ACCEL_RATE * 1.8 : ACCEL_RATE;
      p.speedKmH = Math.min(p.maxSpeedKmH, p.speedKmH + rate * dt);
    } else if (this.input.brake) {
      p.speedKmH = Math.max(MIN_SPEED, p.speedKmH - BRAKE_RATE * dt);
    } else {
      p.speedKmH = Math.max(MIN_SPEED, p.speedKmH - NATURAL_DECEL_RATE * dt);
    }

    // Fuel Consumption
    if (p.speedKmH > 0) {
      let burnRate = FUEL_BURN_LOW_SPEED;
      if (p.boostTimer > 0) {
        burnRate = FUEL_BURN_BOOST;
      } else if (p.speedKmH > 240) {
        burnRate = FUEL_BURN_HIGH_SPEED * (p.speedKmH / MAX_NORMAL_SPEED);
      } else {
        burnRate = FUEL_BURN_LOW_SPEED + (p.speedKmH / 240) * 1.2;
      }
      p.fuel = Math.max(0, p.fuel - burnRate * dt);
    }

    if (p.fuel > 0 && p.fuel <= 20) {
      retroAudio.startLowFuelAlarm();
    } else {
      retroAudio.stopLowFuelAlarm();
    }

    if (p.fuel <= 0) {
      p.fuel = 0;
      p.speedKmH = Math.max(0, p.speedKmH - BRAKE_RATE * 0.5 * dt);
      if (p.speedKmH <= 1) {
        this.triggerGameOver('OUT OF FUEL');
        return;
      }
    }

    retroAudio.updateEngine(p.speedKmH, isAccelerating, p.boostTimer > 0);
  }

  // ---------------- Stunt Jump Air Physics ----------------
  private updateAirborneJump(dt: number) {
    const p = this.player;
    if (p.jumpTimer > 0) {
      p.jumpTimer -= dt;
      p.jumpAltitude = Math.sin((p.jumpTimer / 1.2) * Math.PI);

      if (p.jumpTimer <= 0) {
        p.jumpAltitude = 0;
        retroAudio.playLandingThud();
        this.cameraShake = 5;
        this.addFloatingText('STUNT LANDING!', this.roadLeft + p.x + 20, p.y - 15, '#facc15');
        this.spawnLandingSparks(this.roadLeft + p.x + p.width / 2, p.y + p.height);
      }
    }
  }

  // ---------------- Gun Shooting & Projectile Updates ----------------
  private updateShootingAndWeapons(dt: number) {
    // Continuous fire while holding shoot button
    if (this.input.shoot) {
      this.triggerShoot();
    }

    // Update active bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Bullet bounds check
      if (b.y < -50 || b.y > this.height + 50 || b.x < 0 || b.x > this.width) {
        this.bullets.splice(i, 1);
        continue;
      }

      // 1. Player Bullet Collisions against Traffic & Hazards
      if (b.isPlayer) {
        let bulletHit = false;

        // Check Traffic
        for (let j = 0; j < this.traffic.length; j++) {
          const v = this.traffic[j];
          if (v.isWrecked) continue;

          const vBox = {
            x: this.roadLeft + v.x + 3,
            y: v.y + 4,
            w: v.width - 6,
            h: v.height - 8,
          };

          if (this.isPointInBox(b.x, b.y, vBox)) {
            retroAudio.playBulletHit();
            this.spawnCollisionSparks(b.x, b.y);
            v.hp = (v.hp || 1) - b.damage;

            if (v.hp <= 0) {
              this.executeTakedown(v, 'BLAST TAKEDOWN!');
            } else {
              this.addFloatingText(`HIT! HP: ${v.hp}`, vBox.x + 10, vBox.y, '#f59e0b');
            }

            bulletHit = true;
            break;
          }
        }

        // Check Hazards (e.g. Boulders)
        if (!bulletHit) {
          for (let k = 0; k < this.hazards.length; k++) {
            const h = this.hazards[k];
            if (h.type === 'rolling_boulder') {
              const hBox = { x: this.roadLeft + h.x, y: h.y, w: h.width, h: h.height };
              if (this.isPointInBox(b.x, b.y, hBox)) {
                retroAudio.playCrash();
                this.spawnExplosion(b.x, b.y);
                this.hazards.splice(k, 1);
                this.score += 200;
                this.addFloatingText('BOULDER BLASTED! +200', b.x, b.y, '#facc15');
                bulletHit = true;
                break;
              }
            }
          }
        }

        if (bulletHit) {
          this.bullets.splice(i, 1);
        }
      } else {
        // 2. Enemy Plasma Bullet Collisions against Player
        const pBox = {
          x: this.roadLeft + this.player.x + 4,
          y: this.player.y + 6,
          w: this.player.width - 8,
          h: this.player.height - 12,
        };

        if (this.isPointInBox(b.x, b.y, pBox)) {
          if (this.player.invincibleTimer <= 0 && this.player.jumpAltitude < 0.2) {
            retroAudio.playBump();
            this.cameraShake = 8;
            this.player.fuel = Math.max(0, this.player.fuel - 4);
            this.spawnCollisionSparks(b.x, b.y);
            this.addFloatingText('ENEMY LASER HIT! -4 FUEL', pBox.x + 10, pBox.y, '#ef4444');
          }
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  private isPointInBox(px: number, py: number, box: { x: number; y: number; w: number; h: number }): boolean {
    return px >= box.x && px <= box.x + box.w && py >= box.y && py <= box.y + box.h;
  }

  // ---------------- Steering & Fishtail Skid ----------------
  private updateSteeringAndSkid(dt: number) {
    const p = this.player;
    if (p.skidState === 'crashed') return;

    let steerDir = 0;
    if (this.input.left) steerDir -= 1;
    if (this.input.right) steerDir += 1;

    if (this.input.touchTargetX !== null) {
      const carCenterX = p.x + p.width / 2;
      const diff = this.input.touchTargetX - carCenterX;
      if (Math.abs(diff) > 8) {
        steerDir = Math.sign(diff);
      }
    }

    p.turningDirection = steerDir as -1 | 0 | 1;

    // Weather friction adjustment (e.g. icy winter or rainy roads drift more!)
    const weatherFriction = WEATHER_PRESETS[this.currentWeather].friction;
    const speedRatio = Math.min(1.0, p.speedKmH / 120);

    // Fishtail Skid Recovery Mechanic
    if (p.skidState === 'skidding_left' || p.skidState === 'skidding_right') {
      retroAudio.setScreech(true, 1.0);
      p.skidTimer -= dt;
      this.spawnSkidParticles();

      const skidDirection = p.skidState === 'skidding_left' ? -1 : 1;
      p.x += skidDirection * STEER_SPEED_FACTOR * 1.3 * (1.2 - weatherFriction * 0.2) * dt;
      p.angle = skidDirection * 0.38 + Math.sin(Date.now() * 0.02) * 0.12;

      const correctCounter = p.skidState === 'skidding_left' ? (steerDir > 0) : (steerDir < 0);
      if (correctCounter) {
        p.skidState = 'none';
        p.counterSteerNeeded = null;
        p.angle = 0;
        p.recoveryNoticeTimer = 1.2;
        this.score += 150;
        retroAudio.setScreech(false);
        retroAudio.playRecoveryChime();
        this.addFloatingText('RECOVERY! +150', this.roadLeft + p.x + 20, p.y - 25, '#22c55e');
      } else if (p.skidTimer <= 0) {
        this.triggerSpinCrash();
      }
    } else {
      retroAudio.setScreech(false);
      p.x += steerDir * STEER_SPEED_FACTOR * speedRatio * weatherFriction * dt;
      const targetAngle = steerDir * 0.12;
      p.angle += (targetAngle - p.angle) * 14 * dt;
    }

    // Guardrail collision check
    const minX = 6;
    const maxX = this.roadWidth - p.width - 6;
    if (p.x < minX || p.x > maxX) {
      if (p.skidState === 'skidding_left' || p.skidState === 'skidding_right') {
        this.triggerSpinCrash();
      } else {
        p.x = Math.max(minX, Math.min(maxX, p.x));
        p.speedKmH = Math.max(40, p.speedKmH - 120 * dt);
        this.cameraShake = 4;
        retroAudio.playBump();
        this.spawnCollisionSparks(p.x < minX ? this.roadLeft + minX : this.roadLeft + maxX, p.y + p.height / 2);
      }
    }
  }

  private triggerSpinCrash() {
    const p = this.player;
    p.skidState = 'crashed';
    p.counterSteerNeeded = null;
    p.fuel = Math.max(0, p.fuel - CRASH_FUEL_PENALTY);
    this.cameraShake = 14;
    retroAudio.setScreech(false);
    retroAudio.playCrash();
    this.addFloatingText('CRASHED! -14 FUEL', this.roadLeft + p.x + 20, p.y - 20, '#ef4444');

    this.spawnExplosion(this.roadLeft + p.x + p.width / 2, p.y + p.height / 2);

    window.setTimeout(() => {
      if (this.state === 'PLAYING') {
        p.skidState = 'none';
        p.angle = 0;
        p.speedKmH = 80;
        p.invincibleTimer = 2.2;
        p.x = this.roadWidth / 2 - p.width / 2;
      }
    }, 850);
  }

  // ---------------- Weather & Atmospheric Simulation ----------------
  private updateWeatherAndAtmosphere(dt: number) {
    // Update rain & snow particles
    for (const wp of this.weatherParticles) {
      wp.y += wp.vy * dt;
      wp.x += wp.vx * dt;

      if (wp.y > this.height) {
        wp.y = -20;
        wp.x = Math.random() * this.width;
      }
      if (wp.x < 0) wp.x = this.width;
      if (wp.x > this.width) wp.x = 0;
    }

    // Thunderstorm Lightning in Rain Mode
    if (this.currentWeather === 'rain') {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        this.lightningAlpha = 0.9;
        retroAudio.playThunder();
        this.cameraShake = 9;
        this.lightningTimer = 6.0 + Math.random() * 8.0;
      }

      if (this.lightningAlpha > 0) {
        this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 4.5);
      }
    } else {
      this.lightningAlpha = 0;
    }
  }

  // ---------------- Distance, Theme & Events ----------------
  private updateDistanceAndTheme(dt: number) {
    const p = this.player;
    if (p.speedKmH <= 0) return;

    const metersTravelled = (p.speedKmH / 3.6) * dt;
    this.distanceMeters += metersTravelled;

    const scrollPixels = (p.speedKmH / 3.6) * 5.5 * dt;
    this.roadScrollY = (this.roadScrollY + scrollPixels) % 60;

    const scoreRate = 10 + (p.speedKmH / MAX_NORMAL_SPEED) * 35;
    this.score += Math.floor(scoreRate * dt * 5);

    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      try {
        localStorage.setItem('road_fighter_hiscore', this.hiScore.toString());
      } catch {
        // Ignore
      }
    }

    for (const zone of ZONE_RANGES) {
      if (this.distanceMeters >= zone.start && this.distanceMeters < zone.end) {
        this.currentTheme = zone.theme;
        break;
      }
    }

    if (!this.bossSpawned && this.distanceMeters >= 4800 && this.distanceMeters < 6000) {
      this.spawnBossTanker();
      this.bossSpawned = true;
    }

    if (this.distanceMeters >= this.nextPoliceDist && this.distanceMeters < TRACK_TOTAL_DISTANCE - 400) {
      this.spawnPoliceInterceptor();
      this.nextPoliceDist = this.distanceMeters + 2200;
    }

    if (this.distanceMeters >= TRACK_TOTAL_DISTANCE) {
      this.triggerVictory();
    }
  }

  // ---------------- Traffic, Rivals & Vehicular Combat AI ----------------
  private updateTraffic(dt: number) {
    const p = this.player;
    const playerSpeedMs = (p.speedKmH / 3.6);

    if (this.distanceMeters >= this.nextTrafficSpawnDist && this.distanceMeters < TRACK_TOTAL_DISTANCE - 150) {
      this.spawnTrafficCar();
      const progressRatio = this.distanceMeters / TRACK_TOTAL_DISTANCE;
      const minGap = Math.max(30, 75 - progressRatio * 35);
      this.nextTrafficSpawnDist = this.distanceMeters + minGap + Math.random() * 40;
    }

    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const v = this.traffic[i];

      if (v.isWrecked) {
        v.x += (v.wreckVelocityX || 0) * dt;
        v.y += (v.wreckVelocityY || 0) * dt;
        v.wreckAngle = (v.wreckAngle || 0) + (v.wreckSpin || 10) * dt;
        this.spawnFireAndSmoke(this.roadLeft + v.x + v.width / 2, v.y + v.height / 2);

        if (v.y > this.height + 250 || v.y < -400 || v.x < -80 || v.x > this.roadWidth + 80) {
          this.traffic.splice(i, 1);
        }
        continue;
      }

      const trafficSpeedMs = (v.speedKmH / 3.6);
      const relativeSpeedMs = playerSpeedMs - trafficSpeedMs;
      v.y += relativeSpeedMs * 5.5 * dt;

      // ======================================================================
      // RIVAL CAR COMBAT & SHOOTING AI: Rivals shoot plasma bolts at player!
      // ======================================================================
      if (v.canShoot && !v.isWrecked) {
        v.shootCooldown = (v.shootCooldown || 1.5) - dt;
        const distToPlayerY = v.y - p.y;

        // If rival is ahead or behind and roughly aligned in X lane
        if (Math.abs(v.x - p.x) < 55 && Math.abs(distToPlayerY) < 360 && v.shootCooldown <= 0) {
          v.shootCooldown = 2.2 + Math.random() * 1.5;
          retroAudio.playEnemyShoot();

          const bulletVy = distToPlayerY < 0 ? 460 : -460;
          this.bullets.push({
            id: this.entityIdCounter++,
            x: this.roadLeft + v.x + v.width / 2,
            y: v.y + (distToPlayerY < 0 ? v.height + 6 : -6),
            vx: 0,
            vy: bulletVy,
            isPlayer: false,
            damage: 1,
            color: '#ef4444',
            width: 8,
            height: 8,
            shooterId: v.id,
          });
        }
      }

      // Rival Ramming & Chasing
      if (v.type === 'rival_muscle' || v.type === 'police_interceptor') {
        const distToPlayer = Math.abs(v.y - p.y);
        if (distToPlayer < 240) {
          const diffX = p.x - v.x;
          if (Math.abs(diffX) > 10) {
            v.x += Math.sign(diffX) * 95 * dt;
          }

          v.hornCooldown = (v.hornCooldown || 0) - dt;
          if (v.hornCooldown <= 0 && Math.abs(diffX) < 55) {
            retroAudio.playHorn();
            v.hornCooldown = 3.5;
          }
        }
      }

      // Cars fighting each other for position!
      for (let j = 0; j < this.traffic.length; j++) {
        if (i === j) continue;
        const other = this.traffic[j];
        if (other.isWrecked) continue;

        const dy = Math.abs(v.y - other.y);
        const dx = Math.abs(v.x - other.x);

        if (dy < 40 && dx < 50) {
          v.isFightingAnother = true;
          other.isFightingAnother = true;

          const pushDir = v.x < other.x ? -1 : 1;
          v.x += pushDir * 35 * dt;
          other.x -= pushDir * 35 * dt;

          if (v.x < 15 || v.x > this.roadWidth - v.width - 15) {
            this.executeTakedown(v, 'RIVAL CRASH! +300', false);
          }
          break;
        } else {
          v.isFightingAnother = false;
        }
      }

      if (v.y > p.y && v.y < p.y + p.height && Math.abs(v.x - p.x) < 65 && !('awardedPass' in v)) {
        (v as unknown as { awardedPass: boolean }).awardedPass = true;
        this.score += 75;
      }

      if (v.y > this.height + 250 || v.y < -500) {
        this.traffic.splice(i, 1);
      }
    }
  }

  private spawnTrafficCar() {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = lane * this.laneWidth + (this.laneWidth - 42) / 2;
    const y = -140;

    const rand = Math.random();
    let type: Vehicle['type'] = 'yellow_sedan';
    let width = 42;
    let height = 72;
    let speedKmH = 130 + Math.random() * 25;
    let color: string | undefined = undefined;
    let canShoot = false;

    if (rand < 0.30) {
      type = 'yellow_sedan';
      width = 42;
      height = 72;
      speedKmH = 120 + Math.random() * 20;
    } else if (rand < 0.50) {
      type = 'red_sport';
      width = 44;
      height = 76;
      speedKmH = 190 + Math.random() * 30;
      canShoot = Math.random() < 0.35;
    } else if (rand < 0.72) {
      // Rival Muscle Car (Shoots, rams, aggressive!)
      type = 'rival_muscle';
      width = 46;
      height = 78;
      speedKmH = 175 + Math.random() * 25;
      canShoot = true;
    } else if (rand < 0.86) {
      type = 'cargo_truck';
      width = 48;
      height = 110;
      speedKmH = 100 + Math.random() * 15;
      const truckColors = ['#0284c7', '#ea580c', '#16a34a', '#475569'];
      color = truckColors[Math.floor(Math.random() * truckColors.length)];
    } else if (rand < 0.94) {
      type = 'parked_hazard';
      width = 42;
      height = 70;
      speedKmH = 0;
    } else {
      type = 'bonus_s_car';
      width = 44;
      height = 76;
      speedKmH = 220;
    }

    this.traffic.push({
      id: this.entityIdCounter++,
      type,
      x,
      y,
      width,
      height,
      speedKmH,
      lane,
      laneChangeTimer: 1.5 + Math.random() * 2,
      color,
      hp: type === 'rival_muscle' ? 2 : 1,
      maxHp: type === 'rival_muscle' ? 2 : 1,
      canShoot,
      shootCooldown: 1.0 + Math.random() * 2,
    });
  }

  private spawnPoliceInterceptor() {
    retroAudio.playSirenChirp();
    const lane = Math.floor(Math.random() * LANE_COUNT);
    this.traffic.push({
      id: this.entityIdCounter++,
      type: 'police_interceptor',
      x: lane * this.laneWidth + (this.laneWidth - 44) / 2,
      y: this.height + 120,
      width: 44,
      height: 76,
      speedKmH: 260,
      lane,
      hp: 2,
      maxHp: 2,
      canShoot: true,
      shootCooldown: 1.5,
    });
    this.addFloatingText('★ POLICE PURSUIT! ★', this.roadLeft + this.roadWidth / 2, this.height * 0.4, '#38bdf8');
  }

  private spawnBossTanker() {
    retroAudio.playBossWarning();
    this.traffic.push({
      id: this.entityIdCounter++,
      type: 'boss_tanker',
      x: this.roadWidth / 2 - 28,
      y: -220,
      width: 56,
      height: 140,
      speedKmH: 150,
      lane: 1,
      hp: 8,
      maxHp: 8,
      canShoot: true,
      shootCooldown: 1.0,
    });
    this.cameraShake = 12;
    this.addFloatingText('⚠️ SECTOR BOSS: WAR TANKER! ⚠️', this.roadLeft + this.roadWidth / 2, this.height * 0.35, '#ef4444');
  }

  // ---------------- Hazards & Power-ups ----------------
  private updateHazardsAndCollectibles(dt: number) {
    const p = this.player;
    const playerSpeedMs = (p.speedKmH / 3.6);

    if (this.distanceMeters >= this.nextHazardSpawnDist && this.distanceMeters < TRACK_TOTAL_DISTANCE - 100) {
      this.spawnHazard();
      this.nextHazardSpawnDist = this.distanceMeters + 110 + Math.random() * 110;
    }

    if (this.distanceMeters >= this.nextFuelSpawnDist && this.distanceMeters < TRACK_TOTAL_DISTANCE - 100) {
      this.spawnFuelItem();
      this.nextFuelSpawnDist = this.distanceMeters + 160 + Math.random() * 110;
    }

    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.y += playerSpeedMs * 5.5 * dt;

      if (h.type === 'rolling_boulder') {
        h.x += (h.vx || 60) * dt;
        h.rot = (h.rot || 0) + 5 * dt;
        if (h.x > this.roadWidth - 30 || h.x < 10) {
          h.vx = -(h.vx || 60);
        }
      }

      if (h.y > this.height + 150) {
        this.hazards.splice(i, 1);
      }
    }

    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.y += playerSpeedMs * 5.5 * dt;
      if (c.y > this.height + 150) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private spawnHazard() {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = lane * this.laneWidth + (this.laneWidth - 36) / 2 + (Math.random() * 20 - 10);
    const y = -80;

    const rand = Math.random();
    let type: RoadHazard['type'] = 'oil_slick';

    if (rand < 0.28) {
      type = 'stunt_ramp';
    } else if (rand < 0.48 && this.currentTheme === 'desert') {
      type = 'rolling_boulder';
    } else if (rand < 0.65) {
      type = 'oil_slick';
    } else if (rand < 0.85) {
      type = 'puddle';
    } else {
      type = 'pothole';
    }

    this.hazards.push({
      id: this.entityIdCounter++,
      type,
      x: Math.max(10, Math.min(this.roadWidth - 55, x)),
      y,
      width: type === 'stunt_ramp' ? 52 : type === 'rolling_boulder' ? 40 : 44,
      height: type === 'stunt_ramp' ? 36 : type === 'rolling_boulder' ? 40 : 32,
      vx: 75,
      rot: 0,
    });
  }

  private spawnFuelItem() {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = lane * this.laneWidth + (this.laneWidth - 32) / 2;
    const y = -70;

    const rand = Math.random();
    let type: FuelCollectible['type'] = 'fuel_can';

    if (rand < 0.20) {
      type = 'super_battery';
    } else if (rand < 0.35) {
      type = 'shield_cowcatcher';
    } else if (rand < 0.50) {
      type = 'weapon_crate'; // Upgrade weapon!
    } else {
      type = 'fuel_can';
    }

    this.collectibles.push({
      id: this.entityIdCounter++,
      type,
      x,
      y,
      width: 32,
      height: 32,
      pulsePhase: Math.random() * Math.PI,
    });
  }

  // ---------------- Scenery Generation ----------------
  private seedInitialScenery() {
    for (let y = -100; y < this.height + 100; y += 75) {
      this.spawnSceneryAtY(y);
    }
  }

  private updateScenery(dt: number) {
    const playerSpeedMs = (this.player.speedKmH / 3.6);

    if (this.distanceMeters >= this.nextScenerySpawnDist) {
      this.spawnSceneryAtY(-120);
      this.nextScenerySpawnDist = this.distanceMeters + 35;
    }

    for (let i = this.sceneryProps.length - 1; i >= 0; i--) {
      const prop = this.sceneryProps[i];
      prop.y += playerSpeedMs * 5.5 * dt;
      if (prop.y > this.height + 250) {
        this.sceneryProps.splice(i, 1);
      }
    }
  }

  private spawnSceneryAtY(y: number) {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const marginWidth = this.roadLeft;
    if (marginWidth < 30) return;

    let propType: SceneryProp['type'] = 'tree';
    let width = 50;
    let height = 50;
    let variant = Math.random() > 0.5 ? 1 : 2;

    switch (this.currentTheme) {
      case 'suburban': {
        const types: SceneryProp['type'][] = ['house', 'tennis_court', 'hedge', 'tree'];
        propType = types[Math.floor(Math.random() * types.length)];
        width = propType === 'house' ? 70 : propType === 'tennis_court' ? 65 : 44;
        height = propType === 'house' ? 60 : propType === 'tennis_court' ? 90 : 44;
        break;
      }
      case 'sea_bridge': {
        const types: SceneryProp['type'][] = ['pier_dock', 'yacht', 'speedboat', 'buoy'];
        propType = types[Math.floor(Math.random() * types.length)];
        width = propType === 'pier_dock' ? 60 : propType === 'yacht' ? 50 : 36;
        height = propType === 'pier_dock' ? 80 : propType === 'yacht' ? 80 : 36;
        break;
      }
      case 'desert': {
        const types: SceneryProp['type'][] = ['cactus', 'canyon_rock', 'tumbleweed', 'overhead_plane'];
        propType = types[Math.floor(Math.random() * types.length)];
        width = propType === 'overhead_plane' ? 65 : propType === 'canyon_rock' ? 65 : 36;
        height = propType === 'overhead_plane' ? 70 : propType === 'canyon_rock' ? 55 : 45;
        break;
      }
      case 'tropical': {
        const types: SceneryProp['type'][] = ['palm_tree', 'parasol', 'palm_tree', 'parasol'];
        propType = types[Math.floor(Math.random() * types.length)];
        width = propType === 'palm_tree' ? 50 : 36;
        height = propType === 'palm_tree' ? 55 : 36;
        break;
      }
      case 'cargo_port': {
        const types: SceneryProp['type'][] = ['shipping_container', 'port_warehouse', 'dock_crane'];
        propType = types[Math.floor(Math.random() * types.length)];
        width = propType === 'shipping_container' ? 65 : propType === 'port_warehouse' ? 80 : 60;
        height = propType === 'shipping_container' ? 44 : propType === 'port_warehouse' ? 65 : 70;
        variant = Math.floor(Math.random() * 3) + 1;
        break;
      }
    }

    const marginMargin = 12;
    const x = side === 'left' 
      ? Math.max(marginMargin, this.roadLeft - width - marginMargin - Math.random() * 30)
      : this.roadLeft + this.roadWidth + marginMargin + Math.random() * 30;

    this.sceneryProps.push({
      id: this.entityIdCounter++,
      theme: this.currentTheme,
      side,
      type: propType,
      x,
      y,
      width,
      height,
      variant,
    });
  }

  // ---------------- Bounding Box Collisions & Vehicular Combat ----------------
  private checkCollisions() {
    const p = this.player;
    if (p.invincibleTimer > 0 || p.skidState === 'crashed') return;

    const isAirborne = p.jumpAltitude > 0.25;

    const playerBox = {
      x: p.x + 4,
      y: p.y + 6,
      w: p.width - 8,
      h: p.height - 12,
    };

    // 1. Car vs Traffic
    for (let i = 0; i < this.traffic.length; i++) {
      const v = this.traffic[i];
      if (v.isWrecked) continue;

      const vBox = {
        x: v.x + 3,
        y: v.y + 4,
        w: v.width - 6,
        h: v.height - 8,
      };

      if (this.isAABBIntersect(playerBox, vBox)) {
        if (isAirborne) {
          this.addFloatingText('JUMP OVER!', this.roadLeft + p.x + 20, p.y - 20, '#38bdf8');
          continue;
        }

        if (v.type === 'bonus_s_car') {
          this.score += 1000;
          p.fuel = Math.min(p.maxFuel, p.fuel + 40);
          p.boostTimer = 4.0;
          p.speedKmH = BOOST_SPEED;
          retroAudio.playFuelPickup(true);
          this.addFloatingText('SUPER S-CAR! +1000', this.roadLeft + v.x + 20, v.y, '#facc15');
          this.traffic.splice(i, 1);
          return;
        }

        if (p.shieldBumperTimer > 0 || p.slamTimer > 0) {
          this.executeTakedown(v, p.shieldBumperTimer > 0 ? 'COW-RAM TAKEDOWN!' : 'SIDE SLAM TAKEDOWN!');
          return;
        }

        if (v.type === 'boss_tanker') {
          retroAudio.playBump();
          this.cameraShake = 12;
          p.speedKmH = Math.max(50, p.speedKmH - 120);
          if (v.hp !== undefined) {
            v.hp -= 1;
            this.addFloatingText(`BOSS RAMMED! HP: ${v.hp}/${v.maxHp}`, this.roadLeft + v.x + 20, v.y, '#ef4444');
            if (v.hp <= 0) {
              this.executeTakedown(v, '★ BOSS ANNIHILATED! +5,000 ★');
              this.score += 5000;
              p.fuel = 100;
              return;
            }
          }
          return;
        }

        retroAudio.playBump();
        this.cameraShake = 7;
        p.speedKmH = Math.max(80, p.speedKmH - 80);

        const hitFromLeft = p.x < v.x;
        p.skidState = hitFromLeft ? 'skidding_left' : 'skidding_right';
        p.counterSteerNeeded = hitFromLeft ? 'right' : 'left';
        p.skidTimer = 0.95;
        p.skidSeverity = 1.0;

        v.y -= 25;
        this.spawnCollisionSparks(this.roadLeft + p.x + p.width / 2, p.y + 15);
        return;
      }
    }

    // 2. Car vs Collectible Items
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      const cBox = { x: c.x, y: c.y, w: c.width, h: c.height };

      if (this.isAABBIntersect(playerBox, cBox)) {
        if (c.type === 'shield_cowcatcher') {
          p.shieldBumperTimer = 7.0;
          this.score += 400;
          retroAudio.playFuelPickup(true);
          this.addFloatingText('ARMORED RAM ACTIVE! (7s)', this.roadLeft + c.x + 10, c.y, '#38bdf8');
        } else if (c.type === 'weapon_crate') {
          p.weaponLevel = Math.min(3, p.weaponLevel + 1);
          p.weaponTimer = 14.0;
          this.score += 600;
          retroAudio.playFuelPickup(true);
          const name = p.weaponLevel === 3 ? 'HYPER CANNON!' : 'PLASMA REPEATERS!';
          this.addFloatingText(`★ ${name} (14s) ★`, this.roadLeft + c.x + 10, c.y, '#a855f7');
        } else {
          const isSuper = c.type === 'super_battery';
          const fuelGain = isSuper ? SUPER_BATTERY_VALUE : FUEL_PICKUP_VALUE;
          const scoreGain = isSuper ? 500 : 150;

          p.fuel = Math.min(p.maxFuel, p.fuel + fuelGain);
          this.score += scoreGain;

          if (isSuper) {
            p.boostTimer = Math.max(p.boostTimer, 4.0);
            p.speedKmH = BOOST_SPEED;
            this.addFloatingText('SUPER BATTERY! +500', this.roadLeft + c.x + 10, c.y, '#38bdf8');
          } else {
            this.addFloatingText('+24% FUEL', this.roadLeft + c.x + 10, c.y, '#22c55e');
          }

          retroAudio.playFuelPickup(isSuper);
        }

        this.spawnFuelPickupSparkles(this.roadLeft + c.x + c.width / 2, c.y + c.height / 2, c.type !== 'fuel_can');
        this.collectibles.splice(i, 1);
      }
    }

    // 3. Car vs Road Hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      const hBox = { x: h.x, y: h.y, w: h.width, h: h.height };

      if (this.isAABBIntersect(playerBox, hBox)) {
        if (isAirborne && h.type !== 'stunt_ramp') {
          continue;
        }

        if (h.type === 'stunt_ramp') {
          p.jumpTimer = 1.25;
          p.jumpAltitude = 1.0;
          p.speedKmH = Math.min(BOOST_SPEED, p.speedKmH + 50);
          retroAudio.playJumpWhoosh();
          this.score += 300;
          this.addFloatingText('★ MEGA STUNT JUMP! +300 ★', this.roadLeft + p.x + 20, p.y - 20, '#facc15');
          this.hazards.splice(i, 1);
          return;
        }

        if (h.type === 'rolling_boulder') {
          if (p.shieldBumperTimer > 0) {
            retroAudio.playCrash();
            this.score += 400;
            this.addFloatingText('BOULDER CRUSHED! +400', this.roadLeft + h.x, h.y, '#f59e0b');
            this.spawnExplosion(this.roadLeft + h.x + 20, h.y + 20);
            this.hazards.splice(i, 1);
            return;
          } else {
            this.triggerSpinCrash();
            this.hazards.splice(i, 1);
            return;
          }
        }

        if (h.type === 'oil_slick') {
          retroAudio.playSplash();
          const skidLeft = Math.random() > 0.5;
          p.skidState = skidLeft ? 'skidding_left' : 'skidding_right';
          p.counterSteerNeeded = skidLeft ? 'right' : 'left';
          p.skidTimer = 0.9;
          this.cameraShake = 5;
        } else if (h.type === 'puddle') {
          retroAudio.playSplash();
          p.speedKmH = Math.max(60, p.speedKmH - 75);
          this.cameraShake = 4;
          this.spawnWaterSplash(this.roadLeft + p.x + p.width / 2, p.y + p.height / 2);
        } else {
          retroAudio.playBump();
          p.speedKmH = Math.max(40, p.speedKmH - 110);
          this.cameraShake = 8;
          this.spawnCollisionSparks(this.roadLeft + p.x + p.width / 2, p.y + p.height / 2);
        }

        this.hazards.splice(i, 1);
      }
    }
  }

  private executeTakedown(v: Vehicle, label: string, countPlayerTakedown: boolean = true) {
    v.isWrecked = true;
    v.wreckSpin = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 8);
    v.wreckVelocityX = (v.x < this.roadWidth / 2 ? -1 : 1) * (180 + Math.random() * 80);
    v.wreckVelocityY = -60;

    retroAudio.playTakedown();
    this.cameraShake = 12;

    const crashX = this.roadLeft + v.x + v.width / 2;
    const crashY = v.y + v.height / 2;
    this.spawnExplosion(crashX, crashY);

    if (countPlayerTakedown) {
      this.player.takedownCount++;
      this.player.comboCount++;
      this.player.comboTimer = 4.0;
      const comboMult = Math.min(4, this.player.comboCount);
      const pts = 500 * comboMult;
      this.score += pts;
      this.player.fuel = Math.min(100, this.player.fuel + 10);

      const text = comboMult > 1 ? `★ ${label} (x${comboMult}) +${pts} ★` : `★ ${label} +${pts} ★`;
      this.addFloatingText(text, crashX, crashY - 20, '#facc15');
    } else {
      this.score += 300;
      this.addFloatingText(label, crashX, crashY - 20, '#f97316');
    }
  }

  private isAABBIntersect(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // ---------------- Checkpoint Progression ----------------
  private checkCheckpoints() {
    for (const cp of this.checkpoints) {
      if (!cp.reached && this.distanceMeters >= cp.distanceMeters) {
        cp.reached = true;
        this.score += 2000;
        this.player.fuel = Math.min(this.player.maxFuel, this.player.fuel + 20);
        this.lastCheckpointNotice = cp.name;
        this.checkpointNoticeTimer = 2.5;
        retroAudio.playCheckpoint();
      }
    }

    if (this.checkpointNoticeTimer > 0) {
      this.checkpointNoticeTimer -= 0.016;
    }
  }

  // ---------------- Floating Combat Text ----------------
  public addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: this.entityIdCounter++,
      text,
      x,
      y,
      color,
      life: 1.1,
      maxLife: 1.1,
      scale: 1.25,
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const f = this.floatingTexts[i];
      f.y -= 45 * dt;
      f.life -= dt;
      f.scale = Math.max(1.0, f.scale - dt * 0.5);
      if (f.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // ---------------- Particles & Visual Effects ----------------
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnSkidParticles() {
    const p = this.player;
    const px = this.roadLeft + p.x;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: px + (Math.random() > 0.5 ? 4 : p.width - 4),
        y: p.y + p.height - 10,
        vx: (Math.random() - 0.5) * 60,
        vy: 40 + Math.random() * 50,
        life: 0.35,
        maxLife: 0.35,
        color: 'rgba(200, 200, 210, 0.7)',
        size: 5 + Math.random() * 6,
        type: 'smoke',
      });
    }
  }

  private spawnLandingSparks(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.35,
        maxLife: 0.35,
        color: '#facc15',
        size: 4,
        type: 'spark',
      });
    }
  }

  private spawnFireAndSmoke(x: number, y: number) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 30,
      vy: -20 - Math.random() * 40,
      life: 0.45,
      maxLife: 0.45,
      color: Math.random() > 0.5 ? '#f97316' : '#52525b',
      size: 6 + Math.random() * 6,
      type: 'smoke',
    });
  }

  private spawnCollisionSparks(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.25,
        maxLife: 0.25,
        color: '#fef08a',
        size: 3 + Math.random() * 3,
        type: 'spark',
      });
    }
  }

  private spawnWaterSplash(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.3,
        maxLife: 0.3,
        color: '#38bdf8',
        size: 4 + Math.random() * 4,
        type: 'water_splash',
      });
    }
  }

  private spawnFuelPickupSparkles(x: number, y: number, isSuper: boolean) {
    const count = isSuper ? 24 : 14;
    const color = isSuper ? '#38bdf8' : '#22c55e';
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 50 + Math.random() * 100;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.4,
        maxLife: 0.4,
        color,
        size: 4 + Math.random() * 3,
        type: 'spark',
      });
    }
  }

  private spawnExplosion(x: number, y: number) {
    for (let i = 0; i < 35; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 200;
      const isFire = Math.random() > 0.35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.6 + Math.random() * 0.3,
        maxLife: 0.8,
        color: isFire ? '#f97316' : '#ef4444',
        size: 6 + Math.random() * 10,
        type: 'flame',
      });
    }
  }

  // ---------------- End Conditions ----------------
  private triggerGameOver(reason: string) {
    this.state = 'GAME_OVER';
    retroAudio.playGameOver();
    if (this.onStateChange) this.onStateChange('GAME_OVER');
  }

  private triggerVictory() {
    this.state = 'VICTORY';
    const fuelBonus = Math.floor(this.player.fuel * 80);
    const takedownBonus = this.player.takedownCount * 300;
    this.score += fuelBonus + takedownBonus;

    let rank = 'C';
    if (this.score >= 38000) rank = 'S';
    else if (this.score >= 28000) rank = 'A';
    else if (this.score >= 18000) rank = 'B';

    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      try {
        localStorage.setItem('road_fighter_hiscore', this.hiScore.toString());
      } catch {
        // Ignore
      }
    }

    retroAudio.playVictoryFanfare();
    if (this.onStateChange) this.onStateChange('VICTORY');

    if (this.onTelemetryUpdate) {
      this.onTelemetryUpdate({
        score: this.score,
        hiScore: this.hiScore,
        speedKmH: this.player.speedKmH,
        fuel: this.player.fuel,
        distanceMeters: this.distanceMeters,
        totalDistance: TRACK_TOTAL_DISTANCE,
        theme: this.currentTheme,
        themeName: this.getThemeName(this.currentTheme),
        weather: this.currentWeather,
        weatherName: WEATHER_PRESETS[this.currentWeather].name,
        skidNotice: 'none',
        isBoost: false,
        gameState: 'VICTORY',
        takedowns: this.player.takedownCount,
        comboCount: this.player.comboCount,
        isAirborne: false,
        hasShieldRam: false,
        bossActive: false,
        weaponLevel: this.player.weaponLevel,
        finalRank: rank,
        finalBonus: fuelBonus + takedownBonus,
      });
    }
  }

  private emitTelemetry() {
    if (!this.onTelemetryUpdate) return;

    let skidNotice: GameTelemetry['skidNotice'] = 'none';
    if (this.player.recoveryNoticeTimer > 0) {
      skidNotice = 'recovered';
    } else if (this.player.counterSteerNeeded === 'left') {
      skidNotice = 'left';
    } else if (this.player.counterSteerNeeded === 'right') {
      skidNotice = 'right';
    }

    const hasBoss = this.traffic.some(v => v.type === 'boss_tanker' && !v.isWrecked);

    this.onTelemetryUpdate({
      score: this.score,
      hiScore: this.hiScore,
      speedKmH: Math.floor(this.player.speedKmH),
      fuel: Math.floor(this.player.fuel),
      distanceMeters: Math.floor(this.distanceMeters),
      totalDistance: TRACK_TOTAL_DISTANCE,
      theme: this.currentTheme,
      themeName: this.getThemeName(this.currentTheme),
      weather: this.currentWeather,
      weatherName: WEATHER_PRESETS[this.currentWeather].name,
      skidNotice,
      isBoost: this.player.boostTimer > 0,
      gameState: this.state,
      takedowns: this.player.takedownCount,
      comboCount: this.player.comboCount,
      isAirborne: this.player.jumpAltitude > 0.1,
      hasShieldRam: this.player.shieldBumperTimer > 0,
      bossActive: hasBoss,
      weaponLevel: this.player.weaponLevel,
    });
  }

  private getThemeName(theme: EnvironmentTheme): string {
    switch (theme) {
      case 'suburban': return 'Suburban Town';
      case 'sea_bridge': return 'Sea Bridge Pier';
      case 'desert': return 'Desert Canyon';
      case 'tropical': return 'Tropical Beach';
      case 'cargo_port': return 'Cargo Port';
    }
  }

  // ==========================================================================
  // Rendering Routine
  // ==========================================================================
  public render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    if (this.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShake;
      const shakeY = (Math.random() - 0.5) * this.cameraShake;
      ctx.translate(shakeX, shakeY);
    }

    const themeColors = THEME_COLORS[this.currentTheme];
    const weatherPreset = WEATHER_PRESETS[this.currentWeather];

    // 1. Scenery Margins (Ground)
    ctx.fillStyle = weatherPreset.groundOverride || themeColors.ground;
    ctx.fillRect(0, 0, w, h);

    // Weather Ground Detail
    ctx.fillStyle = weatherPreset.groundDetailOverride || themeColors.groundDetail;
    if (this.currentTheme === 'sea_bridge') {
      for (let y = (this.roadScrollY * 2) % 40; y < h; y += 35) {
        ctx.fillRect(0, y, this.roadLeft - SHOULDER_WIDTH, 4);
        ctx.fillRect(this.roadLeft + this.roadWidth + SHOULDER_WIDTH, y + 15, w, 4);
      }
    } else if (this.currentTheme === 'desert') {
      for (let y = (this.roadScrollY) % 50; y < h; y += 45) {
        ctx.fillRect(0, y, this.roadLeft - SHOULDER_WIDTH, 3);
        ctx.fillRect(this.roadLeft + this.roadWidth + SHOULDER_WIDTH, y + 20, w, 3);
      }
    } else if (this.currentWeather === 'winter') {
      // Snow drifts on margins
      for (let y = (this.roadScrollY) % 60; y < h; y += 50) {
        ctx.fillRect(0, y, this.roadLeft - SHOULDER_WIDTH, 6);
        ctx.fillRect(this.roadLeft + this.roadWidth + SHOULDER_WIDTH, y + 25, w, 6);
      }
    }

    // 2. Scenery Props
    for (const prop of this.sceneryProps) {
      drawSceneryProp(ctx, prop, prop.x, prop.y);
    }

    // 3. Highway & Curbs
    const rLeft = this.roadLeft;
    const rWidth = this.roadWidth;

    const curbW = 14;
    const curbSegH = 30;
    const offset = this.roadScrollY % (curbSegH * 2);

    for (let y = -curbSegH * 2 + offset; y < h + curbSegH; y += curbSegH) {
      const isAlt = Math.floor((y - offset) / curbSegH) % 2 === 0;
      const cLight = weatherPreset.curbLightOverride || themeColors.curbLight;
      const cDark = weatherPreset.curbDarkOverride || themeColors.curbDark;
      ctx.fillStyle = isAlt ? cLight : cDark;
      ctx.fillRect(rLeft - curbW, y, curbW, curbSegH);
      ctx.fillRect(rLeft + rWidth, y, curbW, curbSegH);
    }

    ctx.fillStyle = themeColors.shoulderColor;
    ctx.fillRect(rLeft - SHOULDER_WIDTH, 0, SHOULDER_WIDTH - curbW, h);
    ctx.fillRect(rLeft + rWidth + curbW, 0, SHOULDER_WIDTH - curbW, h);

    // Road asphalt
    ctx.fillStyle = weatherPreset.roadColorOverride || themeColors.roadColor;
    ctx.fillRect(rLeft, 0, rWidth, h);

    // Lane Markings
    const dashH = 40;
    const gapH = 30;
    const dashOffset = (this.roadScrollY * 2) % (dashH + gapH);

    ctx.fillStyle = weatherPreset.laneMarkingOverride || themeColors.laneMarking;
    for (let l = 1; l < LANE_COUNT; l++) {
      const lx = rLeft + l * this.laneWidth;
      for (let y = -dashH + dashOffset; y < h + dashH; y += dashH + gapH) {
        ctx.fillRect(lx - 2, y, 4, dashH);
      }
    }

    // 4. Finish Line Gantry
    if (this.distanceMeters >= TRACK_TOTAL_DISTANCE - 40) {
      const finishDistAway = TRACK_TOTAL_DISTANCE - this.distanceMeters;
      const finishScreenY = this.player.y - finishDistAway * 5.5;
      drawFinishLineGantry(ctx, finishScreenY, rLeft, rWidth);
    }

    // 5. Road Hazards
    for (const hazard of this.hazards) {
      drawRoadHazard(ctx, hazard, rLeft + hazard.x, hazard.y);
    }

    // 6. Fuel Collectibles
    for (const item of this.collectibles) {
      drawFuelCollectible(ctx, item, rLeft + item.x, item.y);
    }

    // 7. Bullets (Player & Enemy)
    for (const bullet of this.bullets) {
      drawBullet(ctx, bullet);
    }

    // 8. Traffic Vehicles
    for (const veh of this.traffic) {
      drawVehicle(ctx, veh, rLeft + veh.x, veh.y);
    }

    // 9. Player Car
    drawPlayerCar(ctx, this.player, rLeft + this.player.x, this.player.y);

    // 10. Particle System
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
      ctx.fill();
    }

    // 11. Weather Particles (Rain / Snow)
    if (this.weatherParticles.length > 0) {
      drawWeatherParticles(ctx, this.weatherParticles);
    }

    // 12. Weather Atmosphere & Lightning Flash
    drawWeatherAtmosphere(ctx, this.currentWeather, w, h, this.lightningAlpha);

    // 13. Floating Combat Texts
    for (const f of this.floatingTexts) {
      drawFloatingCombatText(ctx, f);
    }

    // 14. Checkpoint Notification
    if (this.checkpointNoticeTimer > 0 && this.lastCheckpointNotice) {
      ctx.save();
      const alpha = Math.min(1.0, this.checkpointNoticeTimer);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(rLeft, h * 0.32, rWidth, 54);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 15px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`★ ${this.lastCheckpointNotice} ★`, rLeft + rWidth / 2, h * 0.32 + 20);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillText('+20 FUEL  +2,000 PTS', rLeft + rWidth / 2, h * 0.32 + 40);
      ctx.restore();
    }

    // 15. Fishtail Counter-Steer Alert!
    if (this.player.counterSteerNeeded) {
      ctx.save();
      const blink = Math.floor(Date.now() / 100) % 2 === 0;
      ctx.fillStyle = blink ? 'rgba(239, 68, 68, 0.85)' : 'rgba(245, 158, 11, 0.85)';
      ctx.fillRect(rLeft, this.player.y - 48, rWidth, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const promptText = this.player.counterSteerNeeded === 'left' ? '◀ STEER LEFT TO RECOVER!' : 'STEER RIGHT TO RECOVER! ▶';
      ctx.fillText(promptText, rLeft + rWidth / 2, this.player.y - 30);
      ctx.restore();
    }

    ctx.restore();
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    retroAudio.stopEngine();
    retroAudio.setScreech(false);
    retroAudio.stopLowFuelAlarm();
  }
}
