// Sword of Xolan - Core 60 FPS Platformer Game Engine
// Handles physics, collisions, combat, enemies, particles, camera, and render loop

import { sounds } from './audio';
import {
  Breakable,
  Direction,
  Enemy,
  FloatingText,
  InputState,
  ItemDrop,
  LevelData,
  Particle,
  Player,
  Projectile,
  Rect,
  VillagerNPC,
} from './types';
import { SpriteSet } from './sprites';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public sprites: SpriteSet;
  public currentLevel: LevelData;
  public levelNumber: number;

  // Viewport & Scaling
  public virtualWidth = 400;
  public virtualHeight = 225;
  public cameraX = 0;
  public cameraY = 0;
  public screenShake = 0;

  // Game Loop
  private animationFrameId: number | null = null;
  private lastTime = 0;
  public isRunning = false;
  public isPaused = false;
  public isGameOver = false;
  public isVictory = false;

  // Input
  public input: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    magic: false,
    justJumped: false,
    justAttacked: false,
    justMagic: false,
  };

  // Entities
  public player!: Player;
  public enemies: Enemy[] = [];
  public breakables: Breakable[] = [];
  public villagers: VillagerNPC[] = [];
  public items: ItemDrop[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Parallax & Atmosphere
  public ambientEmbers: Array<{ x: number; y: number; vy: number; vx: number; size: number; alpha: number }> = [];

  // Callbacks to UI
  public onStateChange?: () => void;

  constructor(canvas: HTMLCanvasElement, sprites: SpriteSet, level: LevelData, levelNumber: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.sprites = sprites;
    this.currentLevel = level;
    this.levelNumber = levelNumber;

    this.initLevel(level);
    this.initEmbers();
  }

  public initLevel(level: LevelData) {
    this.currentLevel = level;
    this.isGameOver = false;
    this.isVictory = false;
    this.isPaused = false;

    // Player Init
    this.player = {
      x: level.playerSpawn.x,
      y: level.playerSpawn.y,
      vx: 0,
      vy: 0,
      w: 14,
      h: 18,
      facing: 1,
      state: 'idle',
      stateTimer: 0,
      frame: 0,
      isGrounded: false,
      canDoubleJump: true,
      hasDoubleJumped: false,
      health: 3,
      maxHealth: 3,
      mana: 3,
      maxMana: 3,
      invincibleTimer: 0,
      attackTimer: 0,
      attackHasHit: false,
      magicTimer: 0,
      coins: 0,
      rescuedVillagers: 0,
      totalVillagers: level.cages.length,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
    };

    // Enemies Init
    this.enemies = level.enemies.map((e, idx) => ({
      id: idx + 1,
      type: e.type,
      x: e.x,
      y: e.y,
      vx: e.type === 'shield_knight' ? 0.6 : 0,
      vy: 0,
      w: e.type === 'shield_knight' ? 18 : e.type === 'spitter' ? 16 : e.type === 'bat' ? 14 : 14,
      h: e.type === 'shield_knight' ? 22 : e.type === 'spitter' ? 16 : e.type === 'bat' ? 12 : 14,
      facing: (idx % 2 === 0 ? -1 : 1) as Direction,
      health: e.type === 'shield_knight' ? 3 : e.type === 'spitter' ? 2 : 1,
      maxHealth: e.type === 'shield_knight' ? 3 : e.type === 'spitter' ? 2 : 1,
      isGrounded: false,
      patrolLeft: e.x - (e.patrolRange || 40),
      patrolRight: e.x + (e.patrolRange || 40),
      isShieldUp: e.type === 'shield_knight',
      attackCooldown: 0,
      stateTimer: 0,
      frame: 0,
      hurtTimer: 0,
      dead: false,
      baseY: e.y,
      swoopTimer: 0,
      originY: e.y,
      isDropping: false,
      isRetracting: false,
      spitWindup: 0,
    }));

    // Breakables & Cages
    this.breakables = [];
    let bId = 1;

    // Add cages
    level.cages.forEach((cagePos) => {
      this.breakables.push({
        id: bId++,
        type: 'cage',
        x: cagePos.x,
        y: cagePos.y,
        w: 20,
        h: 20,
        health: 1,
        containsItem: 'villager',
      });
    });

    // Add barrels, pots, chests
    level.breakables.forEach((b) => {
      this.breakables.push({
        id: bId++,
        type: b.type,
        x: b.x,
        y: b.y,
        w: b.type === 'chest' ? 20 : 16,
        h: b.type === 'chest' ? 16 : 16,
        health: 1,
        opened: false,
        containsItem: b.contains || 'coin',
        coinsCount: b.coinsCount || (b.type === 'chest' ? 10 : 3),
      });
    });

    // Villagers
    this.villagers = [];
    this.items = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Center camera
    this.cameraX = Math.max(0, this.player.x - this.virtualWidth / 2);
    this.cameraY = Math.max(0, this.player.y - this.virtualHeight / 2);
  }

  private initEmbers() {
    this.ambientEmbers = [];
    for (let i = 0; i < 28; i++) {
      this.ambientEmbers.push({
        x: Math.random() * this.virtualWidth * 2,
        y: Math.random() * this.virtualHeight,
        vy: -0.2 - Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        size: Math.random() > 0.5 ? 2 : 1,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (time: number) => {
    if (!this.isRunning) return;
    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDt, 0.05); // Clamp frame delta

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // --- COLLISION LOGIC ---

  private isSolidTile(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.currentLevel.width || tileY < 0 || tileY >= this.currentLevel.height) {
      return true; // Boundaries
    }
    const t = this.currentLevel.tiles[tileY][tileX];
    return t === 1 || t === 2;
  }

  private isBridgeTile(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.currentLevel.width || tileY < 0 || tileY >= this.currentLevel.height) {
      return false;
    }
    return this.currentLevel.tiles[tileY][tileX] === 3;
  }

  private isSpikeTile(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.currentLevel.width || tileY < 0 || tileY >= this.currentLevel.height) {
      return false;
    }
    return this.currentLevel.tiles[tileY][tileX] === 4;
  }

  private isLavaTile(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.currentLevel.width || tileY < 0 || tileY >= this.currentLevel.height) {
      return false;
    }
    const t = this.currentLevel.tiles[tileY][tileX];
    return t === 5 || t === 6;
  }

  // --- UPDATE LOGIC ---

  private update(dt: number) {
    const p = this.player;

    // Screen Shake Decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Floating Text Update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 0.8);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Particles Update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      if (pt.gravity) pt.vy += pt.gravity;
      pt.life -= dt;
      pt.alpha = Math.max(0, pt.life / pt.maxLife);
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Ambient Embers Update
    for (const em of this.ambientEmbers) {
      em.y += em.vy;
      em.x += em.vx;
      if (em.y < 0) {
        em.y = this.virtualHeight;
        em.x = Math.random() * (this.currentLevel.width * 16);
      }
    }

    // Player Update
    if (!this.isGameOver && !this.isVictory) {
      this.updatePlayer(dt);
    }

    // Projectiles Update
    this.updateProjectiles(dt);

    // Enemies Update
    this.updateEnemies(dt);

    // Breakables & Items Update
    this.updateItems(dt);

    // Villagers Update
    this.updateVillagers(dt);

    // Check Victory Portal
    this.checkVictoryCondition();

    // Camera follow player with smooth damping
    const targetCamX = p.x - this.virtualWidth / 2 + p.w / 2;
    const targetCamY = p.y - this.virtualHeight / 2 + p.h / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.12;

    const maxCamX = this.currentLevel.width * 16 - this.virtualWidth;
    const maxCamY = this.currentLevel.height * 16 - this.virtualHeight;
    this.cameraX = Math.max(0, Math.min(this.cameraX, maxCamX));
    this.cameraY = Math.max(0, Math.min(this.cameraY, maxCamY));

    // Clear edge-triggered inputs at the end of the frame
    this.input.justJumped = false;
    this.input.justAttacked = false;
    this.input.justMagic = false;
  }

  // --- PLAYER MECHANICS ---

  private updatePlayer(dt: number) {
    const p = this.player;
    p.stateTimer += dt;
    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    // Coyote time & Jump buffer
    if (p.isGrounded) {
      p.coyoteTimer = 0.12;
      p.canDoubleJump = true;
      p.hasDoubleJumped = false;
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    if (this.input.justJumped) {
      p.jumpBufferTimer = 0.12;
    } else {
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
    }

    // Horizontal Movement
    const speed = 2.4;
    if (p.state !== 'attack' || !p.isGrounded) {
      if (this.input.left) {
        p.vx = -speed;
        p.facing = -1;
      } else if (this.input.right) {
        p.vx = speed;
        p.facing = 1;
      } else {
        p.vx = 0;
      }
    } else {
      p.vx = 0;
    }

    // Jump Execution
    if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
      p.vy = -4.9;
      p.isGrounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      sounds.playJump();
      this.spawnDust(p.x + p.w / 2, p.y + p.h, 6);
    } else if (this.input.justJumped && !p.isGrounded && p.canDoubleJump && !p.hasDoubleJumped) {
      // Double Jump
      p.vy = -4.5;
      p.hasDoubleJumped = true;
      p.canDoubleJump = false;
      p.frame = 0;
      sounds.playDoubleJump();
      this.spawnDust(p.x + p.w / 2, p.y + p.h, 10, '#ffffff');
    }

    // Gravity
    p.vy += 0.26;
    if (p.vy > 6.0) p.vy = 6.0;

    // Movement & Collision with Tiles
    this.movePlayerWithCollision();

    // Attack action (Sword Slash)
    if (this.input.justAttacked && p.attackTimer <= 0 && p.magicTimer <= 0) {
      p.attackTimer = 0.22;
      p.attackHasHit = false;
      p.state = 'attack';
      p.stateTimer = 0;
      sounds.playSwordSlash();
    }

    if (p.attackTimer > 0) {
      p.attackTimer -= dt;
      // Perform attack hitbox check midway through swing
      if (!p.attackHasHit && p.attackTimer < 0.16) {
        this.performSwordAttack();
        p.attackHasHit = true;
      }
      if (p.attackTimer <= 0) {
        p.state = p.isGrounded ? (p.vx !== 0 ? 'run' : 'idle') : (p.vy < 0 ? 'jump' : 'fall');
      }
    }

    // Magic spell action
    if (this.input.justMagic && p.magicTimer <= 0 && p.attackTimer <= 0) {
      if (p.mana > 0) {
        p.mana--;
        p.magicTimer = 0.25;
        p.state = 'magic';
        p.stateTimer = 0;
        sounds.playMagicCast();
        this.castPlayerMagic();
        this.notifyState();
      } else {
        this.addFloatingText('NO MANA', p.x + p.w / 2, p.y - 10, '#48cae4');
      }
    }

    if (p.magicTimer > 0) {
      p.magicTimer -= dt;
      if (p.magicTimer <= 0) {
        p.state = p.isGrounded ? (p.vx !== 0 ? 'run' : 'idle') : (p.vy < 0 ? 'jump' : 'fall');
      }
    }

    // Determine Animation State
    if (p.attackTimer <= 0 && p.magicTimer <= 0) {
      if (!p.isGrounded) {
        p.state = p.hasDoubleJumped ? 'jump' : p.vy < 0 ? 'jump' : 'fall';
      } else if (p.vx !== 0) {
        p.state = 'run';
      } else {
        p.state = 'idle';
      }
    }

    // Hazard checks (Spikes & Lava)
    this.checkPlayerHazards();
  }

  private movePlayerWithCollision() {
    const p = this.player;

    // Horizontal Movement
    p.x += p.vx;
    const tileLeft = Math.floor(p.x / 16);
    const tileRight = Math.floor((p.x + p.w) / 16);
    const tileTop = Math.floor(p.y / 16);
    const tileBottom = Math.floor((p.y + p.h - 1) / 16);

    // Left wall collision
    if (p.vx < 0) {
      if (this.isSolidTile(tileLeft, tileTop) || this.isSolidTile(tileLeft, tileBottom)) {
        p.x = (tileLeft + 1) * 16;
        p.vx = 0;
      }
    }
    // Right wall collision
    if (p.vx > 0) {
      if (this.isSolidTile(tileRight, tileTop) || this.isSolidTile(tileRight, tileBottom)) {
        p.x = tileRight * 16 - p.w;
        p.vx = 0;
      }
    }

    // Vertical Movement
    const oldY = p.y;
    p.y += p.vy;
    const newTileTop = Math.floor(p.y / 16);
    const newTileBottom = Math.floor((p.y + p.h) / 16);
    const currentLeft = Math.floor(p.x / 16);
    const currentRight = Math.floor((p.x + p.w - 1) / 16);

    // Upward ceiling collision
    if (p.vy < 0) {
      if (this.isSolidTile(currentLeft, newTileTop) || this.isSolidTile(currentRight, newTileTop)) {
        p.y = (newTileTop + 1) * 16;
        p.vy = 0;
      }
    }

    // Downward floor collision
    p.isGrounded = false;
    if (p.vy >= 0) {
      let collided = false;
      // Solid tiles
      if (this.isSolidTile(currentLeft, newTileBottom) || this.isSolidTile(currentRight, newTileBottom)) {
        p.y = newTileBottom * 16 - p.h;
        p.vy = 0;
        p.isGrounded = true;
        collided = true;
      }

      // Wooden bridge (one-way platform)
      if (!collided) {
        const wasAboveBridge = oldY + p.h <= newTileBottom * 16 + 4;
        if (wasAboveBridge) {
          if (this.isBridgeTile(currentLeft, newTileBottom) || this.isBridgeTile(currentRight, newTileBottom)) {
            p.y = newTileBottom * 16 - p.h;
            p.vy = 0;
            p.isGrounded = true;
          }
        }
      }
    }
  }

  private performSwordAttack() {
    const p = this.player;
    const attackBox: Rect = {
      x: p.facing === 1 ? p.x + p.w : p.x - 24,
      y: p.y - 2,
      w: 24,
      h: 22,
    };

    // 1. Check Breakables (Barrels, Pots, Chests, Cages)
    for (const b of this.breakables) {
      if (b.health <= 0 && b.type !== 'chest') continue;
      if (this.checkOverlap(attackBox, { x: b.x, y: b.y, w: b.w, h: b.h })) {
        this.hitBreakable(b);
      }
    }

    // 2. Check Enemies
    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      if (this.checkOverlap(attackBox, { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) {
        this.hitEnemy(enemy, 1, false);
      }
    }
  }

  private hitBreakable(b: Breakable) {
    if (b.type === 'chest') {
      if (!b.opened) {
        b.opened = true;
        sounds.playSmash();
        this.screenShake = 3;
        this.spawnWoodDebris(b.x + b.w / 2, b.y + b.h / 2, '#ffb703', 12);
        this.spawnCoinsBurst(b.x + b.w / 2, b.y, b.coinsCount || 10);
        this.addFloatingText('+TREASURE!', b.x + b.w / 2, b.y - 12, '#ffd166');
      }
      return;
    }

    if (b.health <= 0) return;
    b.health = 0;
    sounds.playSmash();
    this.screenShake = 4;

    if (b.type === 'cage') {
      // Rescue Villager!
      this.spawnWoodDebris(b.x + b.w / 2, b.y + b.h / 2, '#adb5bd', 16);
      sounds.playRescueVillager();
      this.player.rescuedVillagers++;
      this.addFloatingText('VILLAGER RESCUED!', b.x + b.w / 2, b.y - 16, '#55a630');
      // Spawn happy free villager NPC
      this.villagers.push({
        id: b.id,
        x: b.x + 2,
        y: b.y + 2,
        rescued: true,
        rescueTimer: 0,
        facing: 1,
      });
      // Award coins
      this.spawnCoinsBurst(b.x + b.w / 2, b.y, 5);
      this.notifyState();
      return;
    }

    if (b.type === 'barrel') {
      this.spawnWoodDebris(b.x + b.w / 2, b.y + b.h / 2, '#8c4a16', 10);
      if (b.containsItem === 'health') {
        this.spawnItem('health', b.x + 4, b.y);
      } else if (b.containsItem === 'mana') {
        this.spawnItem('mana', b.x + 4, b.y);
      } else {
        this.spawnCoinsBurst(b.x + b.w / 2, b.y, b.coinsCount || 3);
      }
    } else if (b.type === 'pot') {
      this.spawnWoodDebris(b.x + b.w / 2, b.y + b.h / 2, '#b55a30', 8);
      if (b.containsItem === 'health') {
        this.spawnItem('health', b.x + 4, b.y);
      } else if (b.containsItem === 'mana') {
        this.spawnItem('mana', b.x + 4, b.y);
      } else {
        this.spawnCoinsBurst(b.x + b.w / 2, b.y, b.coinsCount || 2);
      }
    }
  }

  private hitEnemy(enemy: Enemy, damage: number, isMagic: boolean) {
    const p = this.player;

    // Check Shield Knight Block Mechanic
    if (enemy.type === 'shield_knight' && !isMagic) {
      // Facing each other?
      const playerToLeftOfEnemy = p.x < enemy.x;
      const enemyFacingPlayer = (playerToLeftOfEnemy && enemy.facing === -1) || (!playerToLeftOfEnemy && enemy.facing === 1);

      if (enemyFacingPlayer && enemy.isShieldUp) {
        // Shield Block!
        sounds.playShieldClang();
        this.screenShake = 3;
        p.vx = -p.facing * 2.5; // recoil player
        this.spawnSparks(enemy.x + (enemy.facing === -1 ? 0 : enemy.w), enemy.y + enemy.h / 2, 8);
        this.addFloatingText('BLOCKED!', enemy.x + enemy.w / 2, enemy.y - 10, '#adb5bd');
        return;
      }
    }

    // Damage Enemy
    enemy.health -= damage;
    enemy.hurtTimer = 0.25;
    sounds.playSwordHit();
    this.screenShake = isMagic ? 5 : 3;

    // Sparks / blood particles
    this.spawnSparks(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, isMagic ? 12 : 6);
    this.addFloatingText(`-${damage}`, enemy.x + enemy.w / 2, enemy.y - 10, isMagic ? '#48cae4' : '#e63946');

    // Knockback
    const knockDir = p.x < enemy.x ? 1 : -1;
    enemy.vx = knockDir * (isMagic ? 3.0 : 1.8);
    enemy.vy = -1.5;

    if (enemy.health <= 0) {
      enemy.dead = true;
      this.spawnWoodDebris(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, '#4a4e69', 14);
      const coinReward = enemy.type === 'shield_knight' ? 6 : enemy.type === 'spitter' ? 4 : 2;
      this.spawnCoinsBurst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, coinReward);
      // Rare chance of potion drop
      if (Math.random() < 0.25) {
        this.spawnItem(Math.random() < 0.5 ? 'health' : 'mana', enemy.x, enemy.y);
      }
    }
  }

  private castPlayerMagic() {
    const p = this.player;
    this.projectiles.push({
      id: Date.now() + Math.random(),
      type: 'player_magic',
      x: p.facing === 1 ? p.x + p.w : p.x - 14,
      y: p.y + 2,
      vx: p.facing * 5.2,
      vy: 0,
      w: 12,
      h: 12,
      damage: 3,
      life: 1.2,
      frame: 0,
    });
  }

  private checkPlayerHazards() {
    const p = this.player;
    const centerTileX = Math.floor((p.x + p.w / 2) / 16);
    const bottomTileY = Math.floor((p.y + p.h - 1) / 16);

    // Spikes
    if (this.isSpikeTile(centerTileX, bottomTileY)) {
      this.damagePlayer(1, 'SPIKED!');
      p.vy = -4.0;
    }

    // Lava
    if (this.isLavaTile(centerTileX, bottomTileY)) {
      this.damagePlayer(2, 'LAVA!');
      p.vy = -5.0;
      // Respawn near spawn if fell deep
      if (p.y > (this.currentLevel.height - 1) * 16) {
        p.x = this.currentLevel.playerSpawn.x;
        p.y = this.currentLevel.playerSpawn.y;
        p.vy = 0;
      }
    }
  }

  public damagePlayer(amount: number, label = 'OUCH!') {
    const p = this.player;
    if (p.invincibleTimer > 0 || this.isGameOver) return;

    p.health = Math.max(0, p.health - amount);
    p.invincibleTimer = 1.0;
    this.screenShake = 6;
    sounds.playHurt();
    this.spawnSparks(p.x + p.w / 2, p.y + p.h / 2, 8, '#e63946');
    this.addFloatingText(label, p.x + p.w / 2, p.y - 12, '#e63946');
    this.notifyState();

    if (p.health <= 0) {
      this.isGameOver = true;
      p.state = 'dead';
      sounds.playDeath();
      this.notifyState();
    }
  }

  // --- PROJECTILES ---

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.life -= dt;
      proj.frame = (proj.frame + 1) % 3;

      // Solid tile collision
      const tx = Math.floor((proj.x + proj.w / 2) / 16);
      const ty = Math.floor((proj.y + proj.h / 2) / 16);
      if (this.isSolidTile(tx, ty)) {
        this.spawnSparks(proj.x, proj.y, 6, proj.type === 'player_magic' ? '#48cae4' : '#70e000');
        if (proj.type === 'player_magic') sounds.playMagicExplosion();
        this.projectiles.splice(i, 1);
        continue;
      }

      // Player magic hits enemies & breakables
      if (proj.type === 'player_magic') {
        let hit = false;
        for (const e of this.enemies) {
          if (e.dead) continue;
          if (this.checkOverlap(proj, { x: e.x, y: e.y, w: e.w, h: e.h })) {
            this.hitEnemy(e, proj.damage, true);
            sounds.playMagicExplosion();
            this.spawnSparks(proj.x, proj.y, 10, '#48cae4');
            hit = true;
            break;
          }
        }
        if (!hit) {
          for (const b of this.breakables) {
            if (b.health <= 0 && b.type !== 'chest') continue;
            if (this.checkOverlap(proj, { x: b.x, y: b.y, w: b.w, h: b.h })) {
              this.hitBreakable(b);
              sounds.playMagicExplosion();
              hit = true;
              break;
            }
          }
        }
        if (hit || proj.life <= 0) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Enemy spit hits player
      if (proj.type === 'enemy_spit') {
        const p = this.player;
        if (this.checkOverlap(proj, { x: p.x, y: p.y, w: p.w, h: p.h })) {
          this.damagePlayer(1, 'ACID!');
          this.spawnSparks(proj.x, proj.y, 8, '#70e000');
          this.projectiles.splice(i, 1);
          continue;
        }
        if (proj.life <= 0) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }
    }
  }

  // --- ENEMIES BEHAVIOR ---

  private updateEnemies(dt: number) {
    const p = this.player;

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      enemy.stateTimer += dt;
      if (enemy.hurtTimer > 0) enemy.hurtTimer -= dt;

      // 1. Armored Shield Knight
      if (enemy.type === 'shield_knight') {
        // Gravity
        enemy.vy += 0.24;
        enemy.y += enemy.vy;
        const eBottomTile = Math.floor((enemy.y + enemy.h) / 16);
        const eLeftTile = Math.floor(enemy.x / 16);
        const eRightTile = Math.floor((enemy.x + enemy.w) / 16);
        if (this.isSolidTile(eLeftTile, eBottomTile) || this.isSolidTile(eRightTile, eBottomTile)) {
          enemy.y = eBottomTile * 16 - enemy.h;
          enemy.vy = 0;
          enemy.isGrounded = true;
        }

        // Patrol & Player Detection
        const distToPlayer = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (distToPlayer < 70) {
          // Face player
          enemy.facing = p.x < enemy.x ? -1 : 1;
          enemy.isShieldUp = true;
          // Walk slowly towards player
          enemy.x += enemy.facing * 0.7;
        } else {
          // Normal patrol
          enemy.x += enemy.vx;
          if (enemy.x <= enemy.patrolLeft) {
            enemy.vx = Math.abs(enemy.vx);
            enemy.facing = 1;
          } else if (enemy.x >= enemy.patrolRight) {
            enemy.vx = -Math.abs(enemy.vx);
            enemy.facing = -1;
          }
        }

        // Contact damage with player
        if (this.checkOverlap({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
          this.damagePlayer(1, 'SLASH!');
          p.vx = -enemy.facing * 3;
        }
      }

      // 2. Spitting Monster
      else if (enemy.type === 'spitter') {
        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        enemy.facing = p.x < enemy.x ? -1 : 1;

        if (dist < 180) {
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            // Spit projectile!
            enemy.attackCooldown = 2.4; // seconds between spits
            this.projectiles.push({
              id: Date.now() + Math.random(),
              type: 'enemy_spit',
              x: enemy.facing === 1 ? enemy.x + enemy.w : enemy.x - 8,
              y: enemy.y + 4,
              vx: enemy.facing * 2.6,
              vy: -0.2,
              w: 8,
              h: 8,
              damage: 1,
              life: 2.0,
              frame: 0,
            });
            this.spawnSparks(enemy.x + enemy.w / 2, enemy.y, 4, '#70e000');
          }
        }
        // Contact damage
        if (this.checkOverlap({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
          this.damagePlayer(1);
        }
      }

      // 3. Bat / Shadow Drake
      else if (enemy.type === 'bat') {
        enemy.swoopTimer = (enemy.swoopTimer || 0) + dt * 2.5;
        // Sinusoidal flight
        enemy.y = (enemy.baseY || enemy.y) + Math.sin(enemy.swoopTimer) * 12;

        const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
        if (dist < 120) {
          enemy.facing = p.x < enemy.x ? -1 : 1;
          enemy.x += enemy.facing * 1.2;
        } else {
          enemy.x += Math.cos(enemy.swoopTimer * 0.5) * 0.8;
        }

        // Contact damage
        if (this.checkOverlap({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
          this.damagePlayer(1, 'BITE!');
        }
      }

      // 4. Ceiling Spider
      else if (enemy.type === 'spider') {
        const originY = enemy.originY || enemy.y;
        const distX = Math.abs(p.x - enemy.x);

        if (distX < 36 && p.y > enemy.y && !enemy.isRetracting) {
          enemy.isDropping = true;
        }

        if (enemy.isDropping) {
          enemy.y += 2.8;
          if (enemy.y >= originY + 80 || this.isSolidTile(Math.floor(enemy.x / 16), Math.floor((enemy.y + enemy.h) / 16))) {
            enemy.isDropping = false;
            enemy.isRetracting = true;
          }
        } else if (enemy.isRetracting) {
          enemy.y -= 1.0;
          if (enemy.y <= originY) {
            enemy.y = originY;
            enemy.isRetracting = false;
          }
        }

        // Contact damage
        if (this.checkOverlap({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
          this.damagePlayer(1, 'POISON!');
        }
      }
    }
  }

  // --- ITEMS & DROPS ---

  private spawnCoinsBurst(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.items.push({
        id: Date.now() + Math.random(),
        type: 'coin',
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -2.0 - Math.random() * 2.5,
        value: 1,
        lifeTimer: 0,
        collected: false,
      });
    }
  }

  private spawnItem(type: 'health' | 'mana', x: number, y: number) {
    this.items.push({
      id: Date.now() + Math.random(),
      type,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2.2,
      value: 1,
      lifeTimer: 0,
      collected: false,
    });
  }

  private updateItems(dt: number) {
    const p = this.player;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.lifeTimer += dt;

      // Physics
      item.vy += 0.2;
      item.x += item.vx;
      item.y += item.vy;
      item.vx *= 0.95;

      // Bounce on floor
      const tx = Math.floor(item.x / 16);
      const ty = Math.floor((item.y + 8) / 16);
      if (this.isSolidTile(tx, ty) || this.isBridgeTile(tx, ty)) {
        item.y = ty * 16 - 8;
        item.vy = -item.vy * 0.4;
      }

      // Magnet toward player if within 42px
      const dist = Math.hypot(p.x + p.w / 2 - item.x, p.y + p.h / 2 - item.y);
      if (dist < 46) {
        item.x += (p.x + p.w / 2 - item.x) * 0.15;
        item.y += (p.y + p.h / 2 - item.y) * 0.15;
      }

      // Pick up item
      if (dist < 14) {
        if (item.type === 'coin') {
          p.coins += item.value;
          sounds.playCoin();
          this.addFloatingText(`+${item.value}G`, item.x, item.y - 8, '#ffb703');
        } else if (item.type === 'health') {
          p.health = Math.min(p.maxHealth, p.health + 1);
          sounds.playPotion();
          this.addFloatingText('+1 HP', item.x, item.y - 8, '#ff4d6d');
        } else if (item.type === 'mana') {
          p.mana = Math.min(p.maxMana, p.mana + 1);
          sounds.playPotion();
          this.addFloatingText('+1 MANA', item.x, item.y - 8, '#00b4d8');
        }

        this.spawnSparks(item.x, item.y, 6, item.type === 'coin' ? '#ffb703' : item.type === 'health' ? '#ff4d6d' : '#00b4d8');
        this.items.splice(i, 1);
        this.notifyState();
      }
    }
  }

  private updateVillagers(dt: number) {
    for (const v of this.villagers) {
      v.rescueTimer += dt;
      // Cheering animation
    }
  }

  // --- VICTORY & LEVEL CLEAR ---

  private checkVictoryCondition() {
    if (this.isVictory || this.isGameOver) return;
    const p = this.player;
    const portal = this.currentLevel.exitPortal;

    if (this.checkOverlap({ x: p.x, y: p.y, w: p.w, h: p.h }, portal)) {
      this.isVictory = true;
      sounds.playVictory();
      this.notifyState();
    }
  }

  // --- PARTICLE HELPERS ---

  private spawnDust(x: number, y: number, count: number, color = '#6c757d') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -0.4 - Math.random() * 0.8,
        size: Math.random() > 0.5 ? 2 : 1,
        color,
        alpha: 0.8,
        life: 0.25,
        maxLife: 0.25,
      });
    }
  }

  private spawnWoodDebris(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -1.5 - Math.random() * 3.0,
        size: Math.floor(Math.random() * 3) + 2,
        color,
        alpha: 1,
        life: 0.5,
        maxLife: 0.5,
        gravity: 0.22,
      });
    }
  }

  private spawnSparks(x: number, y: number, count: number, color = '#ffd166') {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3.0,
        vy: (Math.random() - 0.5) * 3.0,
        size: 2,
        color,
        alpha: 1,
        life: 0.3,
        maxLife: 0.3,
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color = '#ffffff') {
    this.floatingTexts.push({
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      vy: -18,
      alpha: 1,
      color,
      size: 8,
      life: 0.8,
    });
  }

  private checkOverlap(a: Rect, b: Rect): boolean {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  // --- RENDER PASS ---

  public render() {
    const ctx = this.ctx;
    const w = this.virtualWidth;
    const h = this.virtualHeight;

    // Apply Screen Shake
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (this.screenShake > 0) {
      shakeOffsetX = (Math.random() - 0.5) * this.screenShake;
      shakeOffsetY = (Math.random() - 0.5) * this.screenShake;
    }

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Far Parallax Background (Dark dungeon / Volcanic cavern)
    this.renderParallaxBackground(ctx);

    // Camera Translation
    ctx.translate(Math.floor(-this.cameraX + shakeOffsetX), Math.floor(-this.cameraY + shakeOffsetY));

    // 2. Middle Layer: Torches, Lava Falls, Background Arches
    this.renderBackgroundProps(ctx);

    // 3. Tilemap
    this.renderTiles(ctx);

    // 4. Breakables, Chests & Cages
    this.renderBreakables(ctx);

    // 5. Rescued Villagers
    this.renderVillagers(ctx);

    // 6. Enemies
    this.renderEnemies(ctx);

    // 7. Items & Drops
    this.renderItems(ctx);

    // 8. Player
    this.renderPlayer(ctx);

    // 9. Projectiles & Particles
    this.renderProjectilesAndParticles(ctx);

    // 10. Floating Texts
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderParallaxBackground(ctx: CanvasRenderingContext2D) {
    const theme = this.currentLevel.theme;

    // Gradient Sky / Dungeon Depth
    const grad = ctx.createLinearGradient(0, 0, 0, this.virtualHeight);
    if (theme === 'molten') {
      grad.addColorStop(0, '#1a0505');
      grad.addColorStop(0.7, '#2e0a0a');
      grad.addColorStop(1, '#5c1010');
    } else if (theme === 'citadel') {
      grad.addColorStop(0, '#0c0c17');
      grad.addColorStop(0.7, '#1b1b2f');
      grad.addColorStop(1, '#3b1c32');
    } else {
      // Catacombs
      grad.addColorStop(0, '#0a0d16');
      grad.addColorStop(0.7, '#141a29');
      grad.addColorStop(1, '#1e2738');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

    // Distant Gothic Pillars & Arches Silhouette (Parallax factor 0.25)
    ctx.fillStyle = theme === 'molten' ? 'rgba(38, 10, 10, 0.45)' : 'rgba(15, 20, 32, 0.55)';
    const parX = this.cameraX * 0.25;
    for (let i = 0; i < 12; i++) {
      const archX = i * 90 - (parX % 90);
      ctx.fillRect(archX, 60, 24, this.virtualHeight - 60);
      ctx.beginPath();
      ctx.arc(archX + 12, 60, 12, Math.PI, 0);
      ctx.fill();
    }

    // Ambient floating embers
    ctx.fillStyle = theme === 'molten' ? '#ff7b00' : '#48cae4';
    for (const em of this.ambientEmbers) {
      const screenX = ((em.x - this.cameraX * 0.4) % this.virtualWidth + this.virtualWidth) % this.virtualWidth;
      ctx.globalAlpha = em.alpha;
      ctx.fillRect(screenX, em.y, em.size, em.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private renderBackgroundProps(ctx: CanvasRenderingContext2D) {
    const tFrame = Math.floor(performance.now() / 150) % 3;
    const lFrame = Math.floor(performance.now() / 200) % 2;

    // Torches
    for (const torch of this.currentLevel.torches) {
      ctx.drawImage(this.sprites.tiles.torch[tFrame], torch.x, torch.y);
      // Soft radial torch glow
      const glow = ctx.createRadialGradient(torch.x + 8, torch.y + 6, 2, torch.x + 8, torch.y + 6, 28);
      glow.addColorStop(0, 'rgba(255, 183, 3, 0.25)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(torch.x + 8, torch.y + 6, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lava Falls
    for (const lf of this.currentLevel.lavaFalls) {
      for (let y = lf.startY; y <= lf.endY; y++) {
        ctx.drawImage(this.sprites.tiles.lavaFall[lFrame], lf.x, y * 16);
      }
    }

    // Exit Portal
    const portal = this.currentLevel.exitPortal;
    const pFrame = Math.floor(performance.now() / 140) % 3;
    ctx.drawImage(this.sprites.tiles.portal[pFrame], portal.x, portal.y);
  }

  private renderTiles(ctx: CanvasRenderingContext2D) {
    const lFrame = Math.floor(performance.now() / 250) % 2;
    const startCol = Math.max(0, Math.floor(this.cameraX / 16));
    const endCol = Math.min(this.currentLevel.width - 1, Math.ceil((this.cameraX + this.virtualWidth) / 16));
    const startRow = Math.max(0, Math.floor(this.cameraY / 16));
    const endRow = Math.min(this.currentLevel.height - 1, Math.ceil((this.cameraY + this.virtualHeight) / 16));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = this.currentLevel.tiles[r][c];
        const tx = c * 16;
        const ty = r * 16;

        if (t === 1) {
          ctx.drawImage(this.sprites.tiles.stone, tx, ty);
        } else if (t === 2) {
          ctx.drawImage(this.sprites.tiles.stoneTop, tx, ty);
        } else if (t === 3) {
          ctx.drawImage(this.sprites.tiles.woodBridge, tx, ty);
        } else if (t === 4) {
          ctx.drawImage(this.sprites.tiles.spikes, tx, ty);
        } else if (t === 5) {
          ctx.fillStyle = '#9d0208';
          ctx.fillRect(tx, ty, 16, 16);
        } else if (t === 6) {
          ctx.drawImage(this.sprites.tiles.lavaSurface[lFrame], tx, ty);
        }
      }
    }
  }

  private renderBreakables(ctx: CanvasRenderingContext2D) {
    const cFrame = Math.floor(performance.now() / 300) % 2;

    for (const b of this.breakables) {
      if (b.type === 'cage') {
        if (b.health > 0) {
          ctx.drawImage(this.sprites.villagerCaged[cFrame], b.x, b.y);
        } else {
          ctx.drawImage(this.sprites.cage, b.x, b.y);
        }
      } else if (b.type === 'barrel') {
        if (b.health > 0) {
          ctx.drawImage(this.sprites.barrel, b.x, b.y);
        }
      } else if (b.type === 'pot') {
        if (b.health > 0) {
          ctx.drawImage(this.sprites.pot, b.x, b.y);
        }
      } else if (b.type === 'chest') {
        ctx.drawImage(b.opened ? this.sprites.chestOpen : this.sprites.chestClosed, b.x, b.y);
      }
    }
  }

  private renderVillagers(ctx: CanvasRenderingContext2D) {
    const vFrame = Math.floor(performance.now() / 200) % 2;
    for (const v of this.villagers) {
      ctx.drawImage(this.sprites.villagerFree[vFrame], v.x, v.y);
    }
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      ctx.save();
      // Hurt flash
      if (e.hurtTimer > 0 && Math.floor(performance.now() / 50) % 2 === 0) {
        ctx.filter = 'brightness(2.2)';
      }

      if (e.type === 'shield_knight') {
        const frame = Math.floor(performance.now() / 200) % 2;
        let sprite = this.sprites.shieldKnight.walk[frame];
        if (e.isShieldUp) {
          sprite = this.sprites.shieldKnight.shieldUp;
        }

        ctx.translate(e.x + e.w / 2, e.y);
        ctx.scale(e.facing, 1);
        ctx.drawImage(sprite, -14, -6);
      } else if (e.type === 'spitter') {
        const frame = Math.floor(performance.now() / 300) % 2;
        const sprite = e.attackCooldown < 0.4 ? this.sprites.spitter.spit : this.sprites.spitter.idle[frame];
        ctx.translate(e.x + e.w / 2, e.y);
        ctx.scale(e.facing, 1);
        ctx.drawImage(sprite, -10, -4);
      } else if (e.type === 'bat') {
        const frame = Math.floor(performance.now() / 150) % 2;
        ctx.translate(e.x + e.w / 2, e.y);
        ctx.scale(e.facing, 1);
        ctx.drawImage(this.sprites.bat[frame], -9, -2);
      } else if (e.type === 'spider') {
        // Draw web thread from ceiling
        const originY = e.originY || e.y;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, originY);
        ctx.lineTo(e.x + e.w / 2, e.y);
        ctx.stroke();

        ctx.drawImage(this.sprites.spider, e.x, e.y);
      }
      ctx.restore();
    }
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    ctx.save();

    // Invincibility flashing
    if (p.invincibleTimer > 0 && Math.floor(performance.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    let sprite: HTMLCanvasElement;
    let offsetX = -5;
    const offsetY = -4;

    if (p.state === 'dead' || (p.invincibleTimer > 0 && p.health <= 0)) {
      sprite = this.sprites.knightHurt;
    } else if (p.state === 'attack') {
      const atkIdx = Math.min(2, Math.floor((0.22 - p.attackTimer) / 0.07));
      sprite = this.sprites.knightAttack[atkIdx];
      offsetX = p.facing === 1 ? -5 : -13;
    } else if (p.state === 'magic') {
      sprite = this.sprites.knightMagic;
    } else if (p.hasDoubleJumped) {
      const rotIdx = Math.floor(p.stateTimer * 16) % 4;
      sprite = this.sprites.knightDoubleJump[rotIdx];
    } else if (p.state === 'jump' || p.state === 'fall') {
      sprite = this.sprites.knightJump;
    } else if (p.state === 'run') {
      const runIdx = Math.floor(p.stateTimer * 10) % 4;
      sprite = this.sprites.knightRun[runIdx];
    } else {
      const idleIdx = Math.floor(p.stateTimer * 3) % 2;
      sprite = this.sprites.knightIdle[idleIdx];
    }

    ctx.translate(p.x + p.w / 2, p.y);
    ctx.scale(p.facing, 1);
    ctx.drawImage(sprite, offsetX, offsetY);

    ctx.restore();
  }

  private renderItems(ctx: CanvasRenderingContext2D) {
    const cFrame = Math.floor(performance.now() / 150) % 4;

    for (const item of this.items) {
      if (item.type === 'coin') {
        ctx.drawImage(this.sprites.coin[cFrame], item.x, item.y);
      } else if (item.type === 'health') {
        ctx.drawImage(this.sprites.healthPotion, item.x, item.y);
      } else if (item.type === 'mana') {
        ctx.drawImage(this.sprites.manaPotion, item.x, item.y);
      }
    }
  }

  private renderProjectilesAndParticles(ctx: CanvasRenderingContext2D) {
    // Projectiles
    for (const pr of this.projectiles) {
      if (pr.type === 'player_magic') {
        ctx.drawImage(this.sprites.magicProjectile[pr.frame], pr.x, pr.y);
      } else {
        ctx.drawImage(this.sprites.spitProjectile[pr.frame % 2], pr.x, pr.y);
      }
    }

    // Particles
    for (const pt of this.particles) {
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      // Outline for readability
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0;
  }
}
