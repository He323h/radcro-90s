/**
 * Blastar Reborn - Core 60 FPS Game Engine
 * AAA Arcade Polish with Screen Shake, Banking Roll Tilt, Shockwaves,
 * Debris Physics, and Celestial Bodies.
 */

import {
  Player,
  Enemy,
  Projectile,
  PowerUp,
  Particle,
  Shockwave,
  Debris,
  CelestialBody,
  FloatingText,
  Star,
  StageConfig,
  GameState,
  EnemyType,
} from './types';
import { CanvasRenderer } from './canvasRenderer';
import { soundEngine } from './audio';

export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'STAGE 1',
    subtitle: 'DEEP SPACE NEBULA',
    theme: 'deep_space',
    bgColor: '#030712',
    speed: 1.0,
    scoreThreshold: 2500,
  },
  {
    id: 2,
    name: 'STAGE 2',
    subtitle: 'EMERALD ALIEN CAVERNS',
    theme: 'alien_cavern',
    bgColor: '#011c14',
    speed: 1.25,
    scoreThreshold: 6500,
  },
  {
    id: 3,
    name: 'STAGE 3',
    subtitle: 'CYBERNETIC RUINED CITY',
    theme: 'cyber_ruins',
    bgColor: '#080d1a',
    speed: 1.5,
    scoreThreshold: 12000,
  },
];

export interface EngineCallbacks {
  onScoreUpdate: (score: number, highScore: number) => void;
  onPlayerStatusUpdate: (
    shield: number,
    maxShield: number,
    energy: number,
    weaponLevel: number,
    lives: number,
    maxLives: number
  ) => void;
  onStageChange: (stage: StageConfig) => void;
  onGameOver: (score: number, kills: number, stageName: string) => void;
  onStateChange: (state: GameState) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: CanvasRenderer;
  private callbacks: EngineCallbacks;

  // Running state
  public state: GameState = 'COCKPIT_MENU';
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private gameTime: number = 0;
  private scrollOffset: number = 0;

  // Camera Shake
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  // Game entities
  public player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private powerups: PowerUp[] = [];
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private debrisList: Debris[] = [];
  private floatingTexts: FloatingText[] = [];
  private stars: Star[] = [];
  private celestialBodies: CelestialBody[] = [];

  // Stage & Spawning
  public currentStageIndex: number = 0;
  private spawnTimer: number = 0;
  private nextEnemyId: number = 1;
  private nextProjId: number = 1;
  private nextPowerUpId: number = 1;
  private nextTextId: number = 1;

  // Controls & Settings
  public autoFire: boolean = true;
  private keys: { [key: string]: boolean } = {};
  private isPointerDown: boolean = false;
  private pointerTargetX: number | null = null;
  private pointerTargetY: number | null = null;
  public highScore: number = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.renderer = new CanvasRenderer(this.ctx, canvas.width, canvas.height);

    // Initial player setup
    this.player = this.createDefaultPlayer();

    // High Score init
    try {
      const saved = localStorage.getItem('blastar_reborn_high_score');
      if (saved) this.highScore = parseInt(saved, 10) || 0;
    } catch {
      this.highScore = 0;
    }

    this.initStars();
    this.initCelestialBodies();
    this.setupListeners();
  }

  private createDefaultPlayer(): Player {
    const width = 46;
    const height = 50;
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height - height * 1.6,
      width,
      height,
      vx: 0,
      vy: 0,
      tilt: 0,
      speed: 380, // pixels per sec
      shield: 100,
      maxShield: 100,
      lives: 3, // 3 Lifelines / Hearts
      maxLives: 3,
      energy: 100,
      maxEnergy: 100,
      weaponLevel: 1,
      invulnerableTimer: 0,
      shootCooldown: 0,
      isShooting: false,
      score: 0,
      kills: 0,
    };
  }

  private initStars() {
    this.stars = [];
    const count = Math.floor((this.canvas.width * this.canvas.height) / 3200);
    const starColors = ['#ffffff', '#93c5fd', '#fef08a', '#c084fc', '#67e8f9'];

    for (let i = 0; i < count; i++) {
      const layer = Math.random() < 0.25 ? 3 : Math.random() < 0.6 ? 2 : 1;
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: layer === 3 ? 2.5 : layer === 2 ? 1.5 : 1,
        speed: layer === 3 ? 90 : layer === 2 ? 55 : 25,
        brightness: 0.35 + Math.random() * 0.65,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        layer: layer as 1 | 2 | 3,
      });
    }
  }

  private initCelestialBodies() {
    this.celestialBodies = [];
    // Deep Space ringed planet & nebulae
    this.celestialBodies.push({
      id: 1,
      x: this.canvas.width * 0.78,
      y: this.canvas.height * 0.22,
      size: 44,
      speed: 12,
      type: 'planet_ring',
      color: '#fbbf24',
      detailColor: '#d97706',
    });

    this.celestialBodies.push({
      id: 2,
      x: this.canvas.width * 0.25,
      y: this.canvas.height * 0.45,
      size: 160,
      speed: 18,
      type: 'nebula',
      color: 'rgba(56, 189, 248, 0.4)',
      detailColor: 'rgba(168, 85, 247, 0.2)',
    });

    this.celestialBodies.push({
      id: 3,
      x: this.canvas.width * 0.82,
      y: this.canvas.height * 0.85,
      size: 190,
      speed: 14,
      type: 'nebula',
      color: 'rgba(236, 72, 153, 0.3)',
      detailColor: 'rgba(59, 130, 246, 0.15)',
    });
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.resize(width, height);
    this.initStars();
    this.initCelestialBodies();
    this.clampPlayerPosition();
  }

  private clampPlayerPosition() {
    const minX = this.player.width / 2 + 10;
    const maxX = this.canvas.width - this.player.width / 2 - 10;
    const minY = this.canvas.height * 0.62;
    const maxY = this.canvas.height - this.player.height / 2 - 12;

    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
    this.player.y = Math.max(minY, Math.min(maxY, this.player.y));
  }

  public triggerScreenShake(intensity: number, duration: number = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        this.player.isShooting = true;
      }
      if (e.key === 'Escape' && this.state === 'PLAYING') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key === ' ' || e.key === 'Spacebar') {
        this.player.isShooting = false;
      }
    });

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.pointerTargetX = (clientX - rect.left) * scaleX;
      this.pointerTargetY = (clientY - rect.top) * scaleY;
    };

    this.canvas.addEventListener('mousedown', (e) => {
      this.isPointerDown = true;
      onPointerMove(e.clientX, e.clientY);
      if (!this.autoFire) this.player.isShooting = true;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPointerDown) {
        onPointerMove(e.clientX, e.clientY);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isPointerDown = false;
      this.pointerTargetX = null;
      this.pointerTargetY = null;
      if (!this.autoFire) this.player.isShooting = false;
    });

    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length > 0) {
          this.isPointerDown = true;
          const touch = e.touches[0];
          onPointerMove(touch.clientX, touch.clientY);
          if (!this.autoFire) this.player.isShooting = true;
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length > 0) {
          e.preventDefault();
          const touch = e.touches[0];
          onPointerMove(touch.clientX, touch.clientY);
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener('touchend', () => {
      this.isPointerDown = false;
      this.pointerTargetX = null;
      this.pointerTargetY = null;
      if (!this.autoFire) this.player.isShooting = false;
    });
  }

  public startGame() {
    this.state = 'PLAYING';
    this.callbacks.onStateChange('PLAYING');
    this.player = this.createDefaultPlayer();
    this.enemies = [];
    this.projectiles = [];
    this.powerups = [];
    this.particles = [];
    this.shockwaves = [];
    this.debrisList = [];
    this.floatingTexts = [];
    this.currentStageIndex = 0;
    this.spawnTimer = 0;
    this.gameTime = 0;
    this.shakeTimer = 0;

    soundEngine.playStageAnnounce();
    soundEngine.startBgm();

    this.callbacks.onStageChange(STAGES[0]);
    this.callbacks.onScoreUpdate(this.player.score, this.highScore);
    this.callbacks.onPlayerStatusUpdate(
      this.player.shield,
      this.player.maxShield,
      this.player.energy,
      this.player.weaponLevel,
      this.player.lives,
      this.player.maxLives
    );

    this.addFloatingText(this.canvas.width / 2, this.canvas.height / 2, 'LAUNCH SEQUENCE INITIATED', '#facc15');
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.callbacks.onStateChange('PAUSED');
      soundEngine.stopBgm();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.callbacks.onStateChange('PLAYING');
      soundEngine.startBgm();
    }
  }

  public exitToCockpit() {
    this.state = 'COCKPIT_MENU';
    this.callbacks.onStateChange('COCKPIT_MENU');
    soundEngine.stopBgm();
  }

  public resetHighScores() {
    this.highScore = 0;
    try {
      localStorage.removeItem('blastar_reborn_high_score');
    } catch {
      // ignore
    }
    this.callbacks.onScoreUpdate(this.player ? this.player.score : 0, 0);
  }

  public startLoop() {
    this.lastTime = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(frame);
    };
    this.animFrameId = requestAnimationFrame(frame);
  }

  public stopLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundEngine.stopBgm();
  }

  private update(dt: number) {
    this.gameTime += dt;
    const stage = STAGES[this.currentStageIndex];
    this.scrollOffset += dt * 65 * stage.speed;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.y += s.speed * stage.speed * dt;
      if (s.y > this.canvas.height) {
        s.y = 0;
        s.x = Math.random() * this.canvas.width;
      }
    }

    for (let i = 0; i < this.celestialBodies.length; i++) {
      const b = this.celestialBodies[i];
      b.y += b.speed * stage.speed * dt;
      if (b.y > this.canvas.height + b.size * 2) {
        b.y = -b.size * 2;
        b.x = Math.random() * this.canvas.width;
      }
    }

    if (this.state !== 'PLAYING') {
      this.updateParticles(dt);
      this.updateShockwaves(dt);
      this.updateDebris(dt);
      return;
    }

    if (this.currentStageIndex < STAGES.length - 1) {
      const nextStage = STAGES[this.currentStageIndex + 1];
      if (this.player.score >= nextStage.scoreThreshold) {
        this.currentStageIndex++;
        const newStage = STAGES[this.currentStageIndex];
        soundEngine.playStageAnnounce();
        this.callbacks.onStageChange(newStage);
        this.triggerScreenShake(8, 0.4);
        this.addFloatingText(
          this.canvas.width / 2,
          this.canvas.height / 3,
          `${newStage.name}: ${newStage.subtitle}`,
          '#38bdf8'
        );
      }
    }

    this.updatePlayerMovement(dt);
    this.updatePlayerShooting(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updatePowerUps(dt);
    this.updateParticles(dt);
    this.updateShockwaves(dt);
    this.updateDebris(dt);
    this.updateFloatingTexts(dt);

    if (this.player.energy < this.player.maxEnergy) {
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + dt * 10);
      this.callbacks.onPlayerStatusUpdate(
        this.player.shield,
        this.player.maxShield,
        this.player.energy,
        this.player.weaponLevel,
        this.player.lives,
        this.player.maxLives
      );
    }
  }

  private updatePlayerMovement(dt: number) {
    let moveX = 0;
    let moveY = 0;

    if (this.keys['arrowleft'] || this.keys['a']) moveX -= 1;
    if (this.keys['arrowright'] || this.keys['d']) moveX += 1;
    if (this.keys['arrowup'] || this.keys['w']) moveY -= 1;
    if (this.keys['arrowdown'] || this.keys['s']) moveY += 1;

    let targetTilt = 0;

    if (this.pointerTargetX !== null && this.pointerTargetY !== null) {
      const dx = this.pointerTargetX - this.player.x;
      const dy = this.pointerTargetY - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        this.player.x += dx * Math.min(dt * 15, 1);
        this.player.y += dy * Math.min(dt * 15, 1);
        targetTilt = Math.max(-1, Math.min(1, dx / 40));
      }
    } else {
      this.player.x += moveX * this.player.speed * dt;
      this.player.y += moveY * this.player.speed * dt;
      targetTilt = moveX;
    }

    this.player.tilt += (targetTilt - this.player.tilt) * Math.min(dt * 10, 1);
    this.clampPlayerPosition();

    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }
  }

  private updatePlayerShooting(dt: number) {
    if (this.player.shootCooldown > 0) {
      this.player.shootCooldown -= dt;
    }

    const wantToShoot = this.autoFire || this.player.isShooting || this.keys[' '];

    if (wantToShoot && this.player.shootCooldown <= 0) {
      const cooldownBase = this.player.weaponLevel >= 3 ? 0.13 : 0.17;
      this.player.shootCooldown = cooldownBase;
      soundEngine.playLaser(this.player.weaponLevel);

      const px = this.player.x;
      const py = this.player.y - this.player.height / 2;
      const projSpeed = 740;

      if (this.player.weaponLevel === 1) {
        this.spawnLaser(px - 14, py, 0, -projSpeed, false, 28, 3.5, 'laser');
        this.spawnLaser(px + 14, py, 0, -projSpeed, false, 28, 3.5, 'laser');
      } else if (this.player.weaponLevel === 2) {
        this.spawnLaser(px - 14, py, 0, -projSpeed, false, 32, 3.8, 'laser');
        this.spawnLaser(px + 14, py, 0, -projSpeed, false, 32, 3.8, 'laser');
        this.spawnLaser(px - 20, py + 4, -130, -projSpeed * 0.95, false, 22, 3.2, 'laser');
        this.spawnLaser(px + 20, py + 4, 130, -projSpeed * 0.95, false, 22, 3.2, 'laser');
      } else if (this.player.weaponLevel === 3) {
        this.spawnLaser(px, py - 4, 0, -projSpeed * 1.05, false, 38, 4.5, 'laser');
        this.spawnLaser(px - 16, py, -170, -projSpeed, false, 30, 4, 'laser');
        this.spawnLaser(px + 16, py, 170, -projSpeed, false, 30, 4, 'laser');
      } else {
        this.spawnLaser(px - 9, py - 6, 0, -projSpeed * 1.15, false, 48, 5, 'laser');
        this.spawnLaser(px + 9, py - 6, 0, -projSpeed * 1.15, false, 48, 5, 'laser');
        this.spawnLaser(px - 22, py, -220, -projSpeed * 1.05, false, 35, 4.2, 'laser');
        this.spawnLaser(px + 22, py, 220, -projSpeed * 1.05, false, 35, 4.2, 'laser');
      }
    }
  }

  private spawnLaser(
    x: number,
    y: number,
    vx: number,
    vy: number,
    isEnemy: boolean,
    damage: number,
    radius: number = 3.5,
    beamType?: 'lance' | 'needle' | 'meteor' | 'laser'
  ) {
    this.projectiles.push({
      id: this.nextProjId++,
      x,
      y,
      vx,
      vy,
      radius,
      isEnemy,
      damage,
      color: isEnemy ? '#ef4444' : '#38bdf8',
      glowColor: isEnemy ? '#dc2626' : '#06b6d4',
      beamType,
      trail: [],
    });
  }

  private updateEnemies(dt: number) {
    const stage = STAGES[this.currentStageIndex];
    this.spawnTimer += dt;

    const spawnInterval = Math.max(1.0 - this.currentStageIndex * 0.2, 0.52);

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemyPattern();
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.patternTime += dt;

      if (e.type === 'cruiser') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.patternTime * 2 + e.id) * 45 * dt;
      } else if (e.type === 'skull') {
        e.y += e.vy * dt;
        e.x += Math.sin(e.patternTime * 4.8 + e.id) * 150 * dt;
      } else if (e.type === 'plasma') {
        e.y += e.vy * dt;
        const targetDx = this.player.x - e.x;
        e.x += Math.sign(targetDx) * Math.min(Math.abs(targetDx), 65 * dt);
      }

      e.shootTimer += dt;
      if (e.shootTimer >= e.shootInterval && e.y < this.canvas.height * 0.75) {
        e.shootTimer = 0;
        this.enemyShoot(e);
      }

      const distToPlayer = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      const hitRadius = (e.width + this.player.width) / 2.8;

      if (distToPlayer < hitRadius && this.player.invulnerableTimer <= 0) {
        this.damagePlayer(e.type === 'cruiser' ? 35 : e.type === 'plasma' ? 40 : 25);
        this.damageEnemy(e, 50, i);
      }

      if (e.y > this.canvas.height + e.height) {
        this.enemies.splice(i, 1);
      }
    }
  }

  private spawnEnemyPattern() {
    const stage = STAGES[this.currentStageIndex];
    const roll = Math.random();
    let type: EnemyType = 'cruiser';
    if (roll < 0.45) type = 'cruiser';
    else if (roll < 0.8) type = 'skull';
    else type = 'plasma';

    const padding = 65;
    const spawnX = padding + Math.random() * (this.canvas.width - padding * 2);
    const spawnY = -55;

    let width = 48;
    let height = 46;
    let hp = 45;
    let speed = 95 * stage.speed;
    let score = 150;
    let interval = 1.9;

    if (type === 'cruiser') {
      width = 52;
      height = 48;
      hp = 55 + this.currentStageIndex * 20;
      speed = (85 + Math.random() * 30) * stage.speed;
      score = 150;
      interval = 1.8;
    } else if (type === 'skull') {
      width = 42;
      height = 44;
      hp = 35 + this.currentStageIndex * 15;
      speed = (115 + Math.random() * 40) * stage.speed;
      score = 200;
      interval = 2.1;
    } else if (type === 'plasma') {
      width = 54;
      height = 54;
      hp = 95 + this.currentStageIndex * 35;
      speed = (65 + Math.random() * 25) * stage.speed;
      score = 350;
      interval = 2.4;
    }

    this.enemies.push({
      id: this.nextEnemyId++,
      type,
      x: spawnX,
      y: spawnY,
      width,
      height,
      vx: 0,
      vy: speed,
      hp,
      maxHp: hp,
      scoreValue: score,
      shootTimer: Math.random() * interval,
      shootInterval: interval,
      patternTime: Math.random() * Math.PI,
      rotation: 0,
      scale: 1,
      corePulse: 0,
    });
  }

  private enemyShoot(e: Enemy) {
    soundEngine.playEnemyLaser();
    const projSpeed = 350;

    if (e.type === 'cruiser') {
      // Heavy Cruiser Crimson Lance
      this.spawnLaser(e.x - 14, e.y + e.height / 2, 0, projSpeed, true, 20, 4.5, 'lance');
      this.spawnLaser(e.x + 14, e.y + e.height / 2, 0, projSpeed, true, 20, 4.5, 'lance');
    } else if (e.type === 'skull') {
      // Targeted Ruby Energy Needle
      const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      this.spawnLaser(
        e.x,
        e.y + e.height / 2,
        Math.cos(angle) * projSpeed,
        Math.sin(angle) * projSpeed,
        true,
        24,
        4.2,
        'needle'
      );
    } else if (e.type === 'plasma') {
      // 3-Way Radiant Plasma Meteors
      const angles = [Math.PI / 2 - 0.35, Math.PI / 2, Math.PI / 2 + 0.35];
      for (const ang of angles) {
        this.spawnLaser(
          e.x,
          e.y + e.height / 2,
          Math.cos(ang) * projSpeed * 0.9,
          Math.sin(ang) * projSpeed * 0.9,
          true,
          18,
          4.8,
          'meteor'
        );
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y < -20 || p.y > this.canvas.height + 20 || p.x < -20 || p.x > this.canvas.width + 20) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.isEnemy) {
        const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
        if (dist < p.radius + this.player.width * 0.35 && this.player.invulnerableTimer <= 0) {
          this.damagePlayer(p.damage);
          this.createHitSparks(p.x, p.y, '#ef4444');
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        let hit = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const dist = Math.hypot(p.x - e.x, p.y - e.y);
          if (dist < p.radius + e.width / 2.2) {
            hit = true;
            this.createHitSparks(p.x, p.y, '#38bdf8');
            this.damageEnemy(e, p.damage, j);
            this.projectiles.splice(i, 1);
            break;
          }
        }
        if (hit) continue;
      }
    }
  }

  private damageEnemy(e: Enemy, damage: number, index: number) {
    e.hp -= damage;
    if (e.hp <= 0) {
      this.enemies.splice(index, 1);
      this.player.kills++;
      this.player.score += e.scoreValue;

      if (this.player.score > this.highScore) {
        this.highScore = this.player.score;
        try {
          localStorage.setItem('blastar_reborn_high_score', this.highScore.toString());
        } catch {
          // ignore
        }
      }
      this.callbacks.onScoreUpdate(this.player.score, this.highScore);

      const size = e.type === 'plasma' ? 'large' : e.type === 'cruiser' ? 'medium' : 'small';
      soundEngine.playExplosion(size);
      this.triggerScreenShake(e.type === 'plasma' ? 10 : 6, 0.3);

      this.createExplosion(e.x, e.y, e.type);
      this.addFloatingText(e.x, e.y, `+${e.scoreValue}`, '#facc15');

      if (Math.random() < 0.28 || e.type === 'plasma') {
        this.spawnPowerUp(e.x, e.y);
      }
    }
  }

  private spawnPowerUp(x: number, y: number) {
    const type = Math.random() < 0.4 ? 'heart' : 'orb';
    this.powerups.push({
      id: this.nextPowerUpId++,
      type,
      x,
      y,
      vy: 85,
      radius: 14,
      bobTimer: Math.random() * Math.PI * 2,
      value: type === 'heart' ? 35 : 1,
    });
  }

  private updatePowerUps(dt: number) {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.y += p.vy * dt;

      const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (dist < 130) {
        p.x += (this.player.x - p.x) * dt * 4.5;
        p.y += (this.player.y - p.y) * dt * 4.5;
      }

      if (dist < p.radius + this.player.width / 2) {
        if (p.type === 'heart') {
          soundEngine.playShieldRestore();
          if (this.player.lives < this.player.maxLives) {
            this.player.lives += 1;
            this.player.shield = 100;
            this.addFloatingText(p.x, p.y, `❤️ +1 LIFE! (${this.player.lives}/3)`, '#ec4899');
          } else {
            this.player.shield = Math.min(this.player.maxShield, this.player.shield + 40);
            this.addFloatingText(p.x, p.y, '+SHIELD RESTORED', '#f43f5e');
          }
        } else {
          soundEngine.playPowerup();
          if (this.player.weaponLevel < 4) {
            this.player.weaponLevel++;
            this.addFloatingText(p.x, p.y, `WEAPON LVL ${this.player.weaponLevel}!`, '#38bdf8');
          } else {
            this.player.score += 500;
            this.addFloatingText(p.x, p.y, '+500 OVERCHARGE', '#facc15');
          }
        }
        this.callbacks.onPlayerStatusUpdate(
          this.player.shield,
          this.player.maxShield,
          this.player.energy,
          this.player.weaponLevel,
          this.player.lives,
          this.player.maxLives
        );
        this.callbacks.onScoreUpdate(this.player.score, this.highScore);
        this.createHitSparks(p.x, p.y, p.type === 'heart' ? '#f43f5e' : '#38bdf8');
        this.powerups.splice(i, 1);
        continue;
      }

      if (p.y > this.canvas.height + 30) {
        this.powerups.splice(i, 1);
      }
    }
  }

  private damagePlayer(damage: number) {
    this.player.shield -= damage;
    this.player.invulnerableTimer = 0.85;
    soundEngine.playPlayerHit();
    this.triggerScreenShake(12, 0.35);

    if (this.player.shield <= 0) {
      this.player.lives -= 1;
      if (this.player.lives > 0) {
        this.player.shield = 100;
        this.player.invulnerableTimer = 2.0;
        this.triggerScreenShake(18, 0.5);
        this.addFloatingText(
          this.player.x,
          this.player.y - 25,
          `💔 LIFE LOST! (${this.player.lives} LEFT)`,
          '#f43f5e'
        );
      } else {
        this.player.shield = 0;
        this.triggerGameOver();
      }
    }

    this.callbacks.onPlayerStatusUpdate(
      this.player.shield,
      this.player.maxShield,
      this.player.energy,
      this.player.weaponLevel,
      this.player.lives,
      this.player.maxLives
    );
  }

  private triggerGameOver() {
    this.state = 'GAME_OVER';
    this.callbacks.onStateChange('GAME_OVER');
    soundEngine.stopBgm();
    soundEngine.playGameOver();
    this.triggerScreenShake(18, 0.6);

    this.createExplosion(this.player.x, this.player.y, 'plasma');
    this.callbacks.onGameOver(
      this.player.score,
      this.player.kills,
      STAGES[this.currentStageIndex].name
    );
  }

  private createHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 9; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 2.5,
        color,
        alpha: 1.0,
        decay: 3.5,
        isSpark: true,
      });
    }
  }

  private createExplosion(x: number, y: number, type: EnemyType) {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: type === 'plasma' ? 90 : 65,
      color: type === 'plasma' ? '#f97316' : type === 'skull' ? '#ef4444' : '#38bdf8',
      alpha: 0.9,
      lineWidth: 3,
    });

    const debrisCount = type === 'plasma' ? 8 : 6;
    for (let i = 0; i < debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 180;
      this.debrisList.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 12,
        size: 3 + Math.random() * 5,
        color: type === 'plasma' ? '#ea580c' : '#64748b',
        alpha: 1.0,
      });
    }

    const count = type === 'plasma' ? 38 : 26;
    const colors =
      type === 'plasma'
        ? ['#facc15', '#f97316', '#ef4444', '#ffffff']
        : type === 'skull'
        ? ['#ef4444', '#cbd5e1', '#94a3b8', '#dc2626']
        : ['#f97316', '#e2e8f0', '#ef4444', '#0284c7'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: 1.6 + Math.random() * 1.4,
      });
    }
  }

  private updateShockwaves(dt: number) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * dt * 10;
      sw.alpha -= dt * 2.2;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  private updateDebris(dt: number) {
    for (let i = this.debrisList.length - 1; i >= 0; i--) {
      const d = this.debrisList[i];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vrot * dt;
      d.alpha -= dt * 1.5;
      if (d.alpha <= 0) {
        this.debrisList.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: this.nextTextId++,
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -50,
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 1.2;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private render() {
    const stage = STAGES[this.currentStageIndex];
    const ctx = this.ctx;

    ctx.save();

    if (this.shakeTimer > 0) {
      const shakeFactor = this.shakeTimer * this.shakeIntensity;
      const offsetX = (Math.random() - 0.5) * shakeFactor;
      const offsetY = (Math.random() - 0.5) * shakeFactor;
      ctx.translate(offsetX, offsetY);
    }

    this.renderer.clear(stage.bgColor);
    this.renderer.renderCelestialBodies(this.celestialBodies, this.gameTime);
    this.renderer.renderStars(this.stars, this.gameTime);
    this.renderer.renderEnvironment(stage, this.scrollOffset, this.gameTime);
    this.renderer.renderShockwaves(this.shockwaves);
    this.renderer.renderDebris(this.debrisList);

    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.renderer.renderPowerUps(this.powerups, this.gameTime);
      this.renderer.renderProjectiles(this.projectiles);

      for (const e of this.enemies) {
        if (e.type === 'cruiser') {
          this.renderer.renderCruiser(e, this.gameTime);
        } else if (e.type === 'skull') {
          this.renderer.renderSkull(e, this.gameTime);
        } else {
          this.renderer.renderPlasma(e, this.gameTime);
        }
      }

      this.renderer.renderPlayer(this.player, this.gameTime);
    }

    this.renderer.renderParticles(this.particles);
    this.renderer.renderFloatingTexts(this.floatingTexts);
    this.renderer.renderScanlines();

    ctx.restore();
  }
}
