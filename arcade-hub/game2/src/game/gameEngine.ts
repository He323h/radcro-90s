import { ArcadeAI } from './ai';
import { arcadeAudio } from './audio';
import { Fighter } from './fighter';
import { SpriteRenderer } from './spriteRenderer';
import { StageRenderer } from './stageRenderer';
import {
  CharacterId,
  Difficulty,
  GameMode,
  GamePhase,
  InputState,
  Particle,
  Projectile,
  Rect,
  StageId,
} from './types';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public p1: Fighter;
  public p2: Fighter;
  public ai: ArcadeAI;

  public mode: GameMode = 'ARCADE';
  public difficulty: Difficulty = 'NORMAL';
  public stage: StageId = 'COURTYARD';
  public phase: GamePhase = 'ROUND_INTRO';

  public roundNumber: number = 1;
  public roundTime: number = 99;
  public roundTimeSubTick: number = 0;
  public phaseTimer: number = 0;
  public winnerId: 1 | 2 | null = null;
  public matchWinnerId: 1 | 2 | null = null;

  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public nextProjectileId: number = 1;

  public cameraX: number = 0;
  public screenShake: number = 0;
  public hitstopRemaining: number = 0;
  public slowMoFactor: number = 1.0;
  public slowMoTimer: number = 0;

  public debugHitboxes: boolean = false;
  public crtFilterEnabled: boolean = true;

  // Virtual Canvas Virtual Resolution
  public static readonly VIRTUAL_WIDTH = 640;
  public static readonly VIRTUAL_HEIGHT = 360;
  public static readonly STAGE_MIN_X = 60;
  public static readonly STAGE_MAX_X = 920;

  // React State sync callback
  public onStateSync?: (state: {
    p1Health: number;
    p1DisplayHealth: number;
    p1MaxHealth: number;
    p1Meter: number;
    p1Rounds: number;
    p1Char: CharacterId;
    p2Health: number;
    p2DisplayHealth: number;
    p2MaxHealth: number;
    p2Meter: number;
    p2Rounds: number;
    p2Char: CharacterId;
    roundTime: number;
    roundNumber: number;
    phase: GamePhase;
    bannerText: string | null;
    p1Combo: number;
    p2Combo: number;
    winnerId: 1 | 2 | null;
  }) => void;

  private bannerText: string | null = null;
  private animFrameId: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  // Current Input States
  public p1Input: InputState = this.getEmptyInput();
  public p2Input: InputState = this.getEmptyInput();

  constructor(
    canvas: HTMLCanvasElement,
    p1Char: CharacterId = 'RYUGA',
    p2Char: CharacterId = 'KAZUMA',
    mode: GameMode = 'ARCADE',
    difficulty: Difficulty = 'NORMAL',
    stage: StageId = 'COURTYARD'
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mode = mode;
    this.difficulty = difficulty;
    this.stage = stage;

    this.p1 = new Fighter(1, p1Char, 340, 1);
    this.p2 = new Fighter(2, p2Char, 580, -1);
    this.ai = new ArcadeAI(difficulty);

    this.initSakuraParticles();
  }

  public getEmptyInput(): InputState {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      lp: false,
      hp: false,
      lk: false,
      hk: false,
      special: false,
      superArt: false,
      block: false,
    };
  }

  public setMode(mode: GameMode, difficulty: Difficulty = 'NORMAL') {
    this.mode = mode;
    this.difficulty = difficulty;
    this.ai.setDifficulty(difficulty);
  }

  public setCharacters(p1Char: CharacterId, p2Char: CharacterId) {
    this.p1.setCharacter(p1Char);
    this.p2.setCharacter(p2Char);
  }

  public setStage(stage: StageId) {
    this.stage = stage;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.startRound(1, true);
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
  }

  public startRound(roundNum: number, fullReset: boolean = false) {
    this.roundNumber = roundNum;
    this.roundTime = 99;
    this.roundTimeSubTick = 0;
    this.phase = 'ROUND_INTRO';
    this.phaseTimer = 0;
    this.winnerId = null;
    this.projectiles = [];

    // Reposition fighters
    this.p1.reset(350, 1, fullReset);
    this.p2.reset(570, -1, fullReset);

    // Announce Round
    const roundTitle = roundNum === 3 ? 'FINAL ROUND' : `ROUND ${roundNum}`;
    this.bannerText = roundTitle;
    arcadeAudio.playRoundGong();
    arcadeAudio.playAnnouncer(roundTitle);
  }

  /**
   * Main Simulation & Render Loop
   */
  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.05);

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  /**
   * Update Physics & Combat Frame Logic
   */
  private update(_dt: number) {
    if (this.phase === 'PAUSED') return;

    this.phaseTimer++;

    // Hitstop micro-freeze
    if (this.hitstopRemaining > 0) {
      this.hitstopRemaining--;
      return;
    }

    // Slow-Mo on K.O.
    if (this.slowMoTimer > 0) {
      this.slowMoTimer--;
      if (this.slowMoTimer === 0) {
        this.slowMoFactor = 1.0;
      }
    }

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // Handle Match Phases
    if (this.phase === 'ROUND_INTRO') {
      if (this.phaseTimer === 60) {
        this.bannerText = 'FIGHT!';
        arcadeAudio.playAnnouncer('FIGHT!');
      } else if (this.phaseTimer > 95) {
        this.phase = 'FIGHTING';
        this.bannerText = null;
        arcadeAudio.startBGM();
      }
    } else if (this.phase === 'FIGHTING') {
      // Round Timer Count Down (every 60 frames = 1 second)
      this.roundTimeSubTick++;
      if (this.roundTimeSubTick >= 60) {
        this.roundTimeSubTick = 0;
        if (this.mode !== 'TRAINING') {
          this.roundTime = Math.max(0, this.roundTime - 1);
          if (this.roundTime === 0) {
            this.handleTimeout();
          }
        }
      }

      // 1. Process Inputs
      let p2ActiveInput = this.p2Input;
      if (this.mode === 'ARCADE') {
        p2ActiveInput = this.ai.update(this.p2, this.p1);
      } else if (this.mode === 'TRAINING') {
        const hasP2Input = Object.values(this.p2Input).some(Boolean);
        if (!hasP2Input) {
          p2ActiveInput = this.ai.update(this.p2, this.p1);
        }
      }

      // 2. Update Fighters
      this.p1.update(this.p1Input, this.p2, (type, isSuper) =>
        this.spawnProjectile(this.p1, type, isSuper)
      );
      this.p2.update(p2ActiveInput, this.p1, (type, isSuper) =>
        this.spawnProjectile(this.p2, type, isSuper)
      );

      // Clamp fighters within arena bounds
      this.clampFighterPositions();

      // 3. Push fighters apart
      this.resolveBodyOverlap();

      // 4. Hitbox vs Hurtbox Detection
      this.checkMeleeHits();

      // 5. Update Projectiles & Check Collisions
      this.updateProjectiles();

      // 6. Check Round End Condition (K.O.)
      if (this.p1.health <= 0 || this.p2.health <= 0) {
        this.handleRoundKO();
      }
    } else if (this.phase === 'ROUND_OVER') {
      if (this.phaseTimer > 180) {
        if (this.p1.roundsWon >= 2 || this.p2.roundsWon >= 2) {
          this.phase = 'MATCH_OVER';
          this.matchWinnerId = this.p1.roundsWon >= 2 ? 1 : 2;
          this.bannerText = this.matchWinnerId === 1 ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
          arcadeAudio.playAnnouncer('YOU WIN!');
        } else {
          this.startRound(this.roundNumber + 1);
        }
      }
    }

    // Update Particles
    this.updateParticles();

    // Camera follow midpoint between P1 and P2
    const midX = (this.p1.x + this.p2.x) / 2;
    const targetCamX = midX - GameEngine.VIRTUAL_WIDTH / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    // Clamp camera within stage bounds
    const maxCamX = GameEngine.STAGE_MAX_X - GameEngine.VIRTUAL_WIDTH;
    this.cameraX = Math.max(0, Math.min(maxCamX, this.cameraX));

    // Sync state with React UI
    if (this.onStateSync) {
      this.onStateSync({
        p1Health: this.p1.health,
        p1DisplayHealth: this.p1.displayHealth,
        p1MaxHealth: this.p1.maxHealth,
        p1Meter: this.p1.superMeter,
        p1Rounds: this.p1.roundsWon,
        p1Char: this.p1.charDef.id,
        p2Health: this.p2.health,
        p2DisplayHealth: this.p2.displayHealth,
        p2MaxHealth: this.p2.maxHealth,
        p2Meter: this.p2.superMeter,
        p2Rounds: this.p2.roundsWon,
        p2Char: this.p2.charDef.id,
        roundTime: this.roundTime,
        roundNumber: this.roundNumber,
        phase: this.phase,
        bannerText: this.bannerText,
        p1Combo: this.p1.comboCounter,
        p2Combo: this.p2.comboCounter,
        winnerId: this.winnerId,
      });
    }
  }

  private clampFighterPositions() {
    this.p1.x = Math.max(GameEngine.STAGE_MIN_X, Math.min(GameEngine.STAGE_MAX_X, this.p1.x));
    this.p2.x = Math.max(GameEngine.STAGE_MIN_X, Math.min(GameEngine.STAGE_MAX_X, this.p2.x));

    const maxSeparation = GameEngine.VIRTUAL_WIDTH - 80;
    if (Math.abs(this.p1.x - this.p2.x) > maxSeparation) {
      if (this.p1.x < this.p2.x) {
        this.p1.x = this.p2.x - maxSeparation;
      } else {
        this.p1.x = this.p2.x + maxSeparation;
      }
    }
  }

  private resolveBodyOverlap() {
    const minDist = 38;
    const dx = this.p2.x - this.p1.x;
    if (Math.abs(dx) < minDist) {
      const overlap = (minDist - Math.abs(dx)) / 2;
      if (dx >= 0) {
        this.p1.x -= overlap;
        this.p2.x += overlap;
      } else {
        this.p1.x += overlap;
        this.p2.x -= overlap;
      }
    }
  }

  private checkMeleeHits() {
    this.checkAttackImpact(this.p1, this.p2);
    this.checkAttackImpact(this.p2, this.p1);
  }

  private checkAttackImpact(attacker: Fighter, defender: Fighter) {
    const activeHitbox = attacker.getActiveHitbox();
    if (!activeHitbox || !attacker.currentAttack) return;

    const hx = attacker.facing === 1 ? attacker.x + activeHitbox.x : attacker.x - activeHitbox.x - activeHitbox.w;
    const hy = attacker.y + activeHitbox.y;
    const hitRect: Rect = { x: hx, y: hy, w: activeHitbox.w, h: activeHitbox.h };

    const hurtboxes = defender.getHurtboxes();
    for (const b of hurtboxes) {
      const bx = defender.facing === 1 ? defender.x + b.x : defender.x - b.x - b.w;
      const by = defender.y + b.y;
      const hurtRect: Rect = { x: bx, y: by, w: b.w, h: b.h };

      if (this.rectIntersect(hitRect, hurtRect)) {
        attacker.hasHitThisAttack = true;

        const isBlocked = defender.canBlock(attacker.currentAttack);
        defender.takeHit(attacker.currentAttack, attacker, isBlocked);

        const isHeavy = attacker.currentAttack.damage > 70;
        const isKick = attacker.currentAttack.soundType.includes('kick');

        if (isBlocked) {
          arcadeAudio.playBlock();
          this.spawnBlockSparks((hitRect.x + hurtRect.x) / 2 + 10, (hitRect.y + hurtRect.y) / 2);
          this.screenShake = 3;
        } else {
          arcadeAudio.playHit(isHeavy, isKick);
          this.spawnHitSparks(
            (hitRect.x + hurtRect.x) / 2 + 10,
            (hitRect.y + hurtRect.y) / 2,
            attacker.charDef.themeColor,
            isHeavy
          );
          this.screenShake = isHeavy ? 9 : 4;

          attacker.comboCounter++;
          attacker.comboResetTimer = 45;
          attacker.superMeter = Math.min(100, attacker.superMeter + attacker.currentAttack.meterGain);
        }

        this.hitstopRemaining = isHeavy ? 6 : 3;
        break;
      }
    }
  }

  public spawnProjectile(fighter: Fighter, type: 'HADOUKEN' | 'KUNAI', isSuper: boolean = false) {
    const isHadouken = type === 'HADOUKEN';
    const speed = isSuper ? 12 : isHadouken ? 8.5 : 9.5;
    const rad = isSuper ? 24 : isHadouken ? 16 : 11;
    const dmg = isSuper ? 220 : 90;

    arcadeAudio.playFireballLaunch();

    this.projectiles.push({
      id: this.nextProjectileId++,
      ownerId: fighter.id,
      x: fighter.x + fighter.facing * 52,
      y: fighter.y - 56,
      vx: fighter.facing * speed,
      vy: 0,
      radius: rad,
      damage: dmg,
      chipDamage: isSuper ? 40 : 16,
      hitstun: isSuper ? 45 : 24,
      color: isSuper ? '#facc15' : fighter.charDef.themeColor,
      glowColor: isSuper ? '#ea580c' : fighter.charDef.portraitColor,
      trail: [],
      life: 0,
      maxLife: 120,
      active: true,
      isSuper,
    });
  }

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.life++;

      p.trail.unshift({ x: p.x, y: p.y, alpha: 1.0, size: p.radius });
      if (p.trail.length > 8) p.trail.pop();
      for (const t of p.trail) t.alpha *= 0.78;

      const target = p.ownerId === 1 ? this.p2 : this.p1;
      const attacker = p.ownerId === 1 ? this.p1 : this.p2;

      let hit = false;
      const hurtboxes = target.getHurtboxes();
      for (const b of hurtboxes) {
        const bx = target.facing === 1 ? target.x + b.x : target.x - b.x - b.w;
        const by = target.y + b.y;
        if (
          p.x + p.radius > bx &&
          p.x - p.radius < bx + b.w &&
          p.y + p.radius > by &&
          p.y - p.radius < by + b.h
        ) {
          hit = true;
          break;
        }
      }

      if (hit) {
        p.active = false;
        arcadeAudio.playFireballHit();
        this.spawnExplosionSparks(p.x, p.y, p.color);
        this.screenShake = p.isSuper ? 12 : 7;

        const isBlocked = target.state === 'BLOCK_HIGH' || target.state === 'BLOCK_LOW';
        const dummyAttack = {
          damage: p.damage,
          chipDamage: p.chipDamage,
          hitstun: p.hitstun,
          blockstun: 16,
          pushback: p.isSuper ? 40 : 25,
          startupFrames: 0,
          activeFrames: 0,
          recoveryFrames: 0,
          meterGain: 0,
          hitbox: { x: 0, y: 0, w: 0, h: 0 },
          soundType: p.isSuper ? 'super' : 'special',
          knockdown: p.isSuper,
        };
        target.takeHit(dummyAttack as any, attacker, isBlocked);
        attacker.comboCounter++;
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.x < GameEngine.STAGE_MIN_X - 40 || p.x > GameEngine.STAGE_MAX_X + 40 || p.life > p.maxLife) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private handleRoundKO() {
    this.phase = 'ROUND_OVER';
    this.phaseTimer = 0;
    this.slowMoFactor = 0.3;
    this.slowMoTimer = 40;

    arcadeAudio.playKnockdown();
    arcadeAudio.playAnnouncer('K.O.!');
    this.bannerText = 'K.O.!';

    if (this.p1.health > 0 && this.p2.health <= 0) {
      this.winnerId = 1;
      this.p1.roundsWon++;
      this.p1.setState('VICTORY');
      this.p2.setState('DEFEAT');
      if (this.p1.health === this.p1.maxHealth) {
        setTimeout(() => {
          this.bannerText = 'PERFECT!';
          arcadeAudio.playAnnouncer('PERFECT!');
        }, 1200);
      }
    } else if (this.p2.health > 0 && this.p1.health <= 0) {
      this.winnerId = 2;
      this.p2.roundsWon++;
      this.p2.setState('VICTORY');
      this.p1.setState('DEFEAT');
    } else {
      this.winnerId = null;
      this.bannerText = 'DOUBLE K.O.!';
    }
  }

  private handleTimeout() {
    this.phase = 'ROUND_OVER';
    this.phaseTimer = 0;
    this.bannerText = 'TIME OVER!';
    arcadeAudio.playAnnouncer('TIME OVER!');

    if (this.p1.health > this.p2.health) {
      this.winnerId = 1;
      this.p1.roundsWon++;
      this.p1.setState('VICTORY');
      this.p2.setState('DEFEAT');
    } else if (this.p2.health > this.p1.health) {
      this.winnerId = 2;
      this.p2.roundsWon++;
      this.p2.setState('VICTORY');
      this.p1.setState('DEFEAT');
    } else {
      this.winnerId = null;
      this.bannerText = 'DRAW GAME!';
    }
  }

  private initSakuraParticles() {
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * GameEngine.STAGE_MAX_X,
        y: Math.random() * GameEngine.VIRTUAL_HEIGHT,
        vx: 0.8 + Math.random() * 1.2,
        vy: 0.5 + Math.random() * 0.8,
        color: '#fbcfe8',
        size: 3 + Math.random() * 3,
        life: 0,
        maxLife: 9999,
        type: 'sakura',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: 0.02 + Math.random() * 0.04,
      });
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      if (p.rotation !== undefined && p.rotSpeed !== undefined) {
        p.rotation += p.rotSpeed;
      }

      if (p.type === 'sakura') {
        p.x += Math.sin(p.life * 0.05) * 0.8;
        if (p.y > GameEngine.VIRTUAL_HEIGHT + 20) {
          p.y = -10;
          p.x = Math.random() * GameEngine.STAGE_MAX_X;
        }
      } else {
        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  public spawnHitSparks(x: number, y: number, _color: string, isHeavy: boolean) {
    const count = isHeavy ? 14 : 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * (isHeavy ? 6 : 4);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#facc15' : '#ffffff',
        size: isHeavy ? 8 : 5,
        life: 0,
        maxLife: isHeavy ? 18 : 12,
        type: 'spark',
        rotation: Math.random() * Math.PI,
        rotSpeed: 0.1,
      });
    }
  }

  public spawnBlockSparks(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        color: '#38bdf8',
        size: 4,
        life: 0,
        maxLife: 10,
        type: 'guard',
      });
    }
  }

  public spawnExplosionSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#facc15',
        size: 7,
        life: 0,
        maxLife: 22,
        type: 'spark',
      });
    }
  }

  private rectIntersect(r1: Rect, r2: Rect): boolean {
    return (
      r1.x < r2.x + r2.w &&
      r1.x + r1.w > r2.x &&
      r1.y < r2.y + r2.h &&
      r1.y + r1.h > r2.y
    );
  }

  public render() {
    const ctx = this.ctx;
    const vw = GameEngine.VIRTUAL_WIDTH;
    const vh = GameEngine.VIRTUAL_HEIGHT;

    ctx.save();

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // 1. Stage Parallax
    StageRenderer.drawStage(ctx, this.stage, this.cameraX, vw, vh, performance.now() * 0.001);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // 2. Projectiles
    for (const p of this.projectiles) {
      SpriteRenderer.drawProjectile(ctx, p);
    }

    // 3. Fighters
    SpriteRenderer.drawFighter(
      ctx,
      this.p1,
      this.debugHitboxes,
      this.p1.getActiveHitbox(),
      this.p1.getHurtboxes()
    );
    SpriteRenderer.drawFighter(
      ctx,
      this.p2,
      this.debugHitboxes,
      this.p2.getActiveHitbox(),
      this.p2.getHurtboxes()
    );

    // 4. Particles
    SpriteRenderer.drawParticles(ctx, this.particles);

    ctx.restore();
    ctx.restore();
  }
}
