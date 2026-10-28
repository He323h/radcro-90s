import {
  GameState,
  LevelData,
  Player,
  Enemy,
  Collectible,
  Block,
  Spring,
  Flagpole,
  Projectile,
  Particle,
  FloatingText,
  InputState,
} from './types';
import { audio } from './audio';

export class GameEngine {
  public player: Player;
  public currentLevel: LevelData;
  public levelIndex: number = 0;
  public allLevels: LevelData[];
  public gameState: GameState = 'TITLE';
  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake: number = 0;
  public hitstopTimer: number = 0;
  public gameTime: number = 0;
  public levelTimeRemaining: number = 300;

  // Active entities
  public blocks: Block[] = [];
  public enemies: Enemy[] = [];
  public collectibles: Collectible[] = [];
  public springs: Spring[] = [];
  public flagpole: Flagpole;
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Internal resolution
  public readonly VIRTUAL_WIDTH = 480;
  public readonly VIRTUAL_HEIGHT = 270;

  private onStateChangeCallback?: (state: GameState) => void;

  constructor(levels: LevelData[], onStateChange?: (state: GameState) => void) {
    this.allLevels = levels;
    this.currentLevel = levels[0];
    this.onStateChangeCallback = onStateChange;

    this.player = this.createDefaultPlayer();
    this.flagpole = this.currentLevel.flagpole;
    this.loadLevel(0);
  }

  private createDefaultPlayer(): Player {
    return {
      x: 32,
      y: 100,
      vx: 0,
      vy: 0,
      width: 14,
      height: 20,
      grounded: false,
      facing: 'right',
      health: 3,
      maxHealth: 3,
      lives: 3,
      score: 0,
      coins: 0,
      powerup: 'none',
      starTimer: 0,
      invulnerableTimer: 0,
      spinTimer: 0,
      spinCooldown: 0,
      dashTimer: 0,
      dashCooldown: 0,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      doubleJumpAvailable: true,
      isDashing: false,
      isCrouching: false,
      isSpinning: false,
      walkFrame: 0,
      walkTimer: 0,
      checkpoint: null,
    };
  }

  public loadLevel(index: number, retainStats: boolean = true) {
    this.levelIndex = index % this.allLevels.length;
    // Deep clone level data to reset entities
    const rawLevel = this.allLevels[this.levelIndex];
    this.currentLevel = JSON.parse(JSON.stringify(rawLevel));

    this.blocks = this.currentLevel.blocks;
    this.enemies = this.currentLevel.enemies;
    this.collectibles = this.currentLevel.collectibles;
    this.springs = this.currentLevel.springs;
    this.flagpole = this.currentLevel.flagpole;
    this.levelTimeRemaining = this.currentLevel.timeLimit;
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];

    // Reset player position
    const startX = this.player.checkpoint ? this.player.checkpoint.x : this.currentLevel.playerStart.x;
    const startY = this.player.checkpoint ? this.player.checkpoint.y : this.currentLevel.playerStart.y;
    this.player.x = startX;
    this.player.y = startY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.grounded = false;
    this.player.spinTimer = 0;
    this.player.dashTimer = 0;
    this.player.starTimer = 0;

    if (!retainStats) {
      this.player.score = 0;
      this.player.coins = 0;
      this.player.lives = 3;
      this.player.health = 3;
      this.player.powerup = 'none';
      this.player.checkpoint = null;
    }

    this.cameraX = Math.max(0, this.player.x - this.VIRTUAL_WIDTH / 3);
    this.cameraY = 0;

    audio.setMusicTheme(this.currentLevel.theme);
  }

  public setGameState(state: GameState) {
    this.gameState = state;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(state);
    }
    if (state === 'PLAYING') {
      audio.startMusic(this.currentLevel.theme);
    } else if (state === 'PAUSED' || state === 'TITLE') {
      audio.stopMusic();
    }
  }

  // --- Main Update Loop ---

  public update(dt: number, input: InputState) {
    // Clamp delta time to avoid physics tunneling
    const safeDt = Math.min(dt, 0.05);
    this.gameTime += safeDt;

    // Decay screenshake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - safeDt * 18);
    }

    // Hitstop freeze frame on heavy impacts
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= safeDt;
      return;
    }

    if (this.gameState !== 'PLAYING') {
      // In title screen, idle camera pan
      if (this.gameState === 'TITLE') {
        this.cameraX = 20 + Math.sin(this.gameTime * 0.4) * 30;
      }
      return;
    }

    // Decrement level timer
    this.levelTimeRemaining = Math.max(0, this.levelTimeRemaining - safeDt);
    if (this.levelTimeRemaining <= 0 && this.player.health > 0) {
      this.handlePlayerDeath('Time Out!');
      return;
    }

    // Update timers
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= safeDt;
    }
    if (this.player.starTimer > 0) {
      this.player.starTimer -= safeDt;
    }
    if (this.player.spinTimer > 0) {
      this.player.spinTimer -= safeDt;
      this.player.isSpinning = this.player.spinTimer > 0;
    }
    if (this.player.spinCooldown > 0) {
      this.player.spinCooldown -= safeDt;
    }
    if (this.player.dashTimer > 0) {
      this.player.dashTimer -= safeDt;
      this.player.isDashing = this.player.dashTimer > 0;
    }
    if (this.player.dashCooldown > 0) {
      this.player.dashCooldown -= safeDt;
    }
    if (this.player.coyoteTimer > 0) {
      this.player.coyoteTimer -= safeDt;
    }
    if (this.player.jumpBufferTimer > 0) {
      this.player.jumpBufferTimer -= safeDt;
    }

    // Handle Input & Player Physics
    this.updatePlayerMovement(safeDt, input);

    // Update Blocks (bounce animations)
    this.updateBlocks(safeDt);

    // Update Springs
    for (const s of this.springs) {
      if (s.bounceTimer > 0) {
        s.bounceTimer -= safeDt * 10;
      }
    }

    // Update Enemies & Collisions
    this.updateEnemies(safeDt, input);

    // Update Collectibles
    this.updateCollectibles(safeDt);

    // Update Projectiles
    this.updateProjectiles(safeDt);

    // Update Particles & Floating Text
    this.updateParticles(safeDt);

    // Check Flagpole / Level Clear
    this.checkFlagpole(safeDt);

    // Update Camera
    this.updateCamera(safeDt);
  }

  // --- Player Physics & Actions ---

  private updatePlayerMovement(dt: number, input: InputState) {
    const p = this.player;

    // Crouch
    p.isCrouching = input.down && p.grounded && !p.isDashing;

    // Action 1: Cape Spin Attack (Button B or Action)
    if (input.actionJustPressed && p.spinCooldown <= 0) {
      p.spinTimer = 0.28;
      p.spinCooldown = 0.45;
      p.isSpinning = true;
      audio.playSpinAttack();

      // Check if player has fire powerup, fire fireball too!
      if (p.powerup === 'fire' && this.projectiles.filter((pr) => pr.isPlayer).length < 2) {
        this.spawnFireball();
      }

      // Check nearby breakable blocks or enemies to spin-smash
      this.checkSpinAttackCollisions();
    }

    // Action 2: Dash (Button C or Dash)
    if (input.dashJustPressed && p.dashCooldown <= 0) {
      p.dashTimer = 0.2;
      p.dashCooldown = 0.7;
      p.isDashing = true;
      p.vx = (p.facing === 'right' ? 1 : -1) * 6.5;
      p.vy = 0; // brief anti-gravity burst
      audio.playDash();

      // Spawn dash ghost trail particles
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: p.x + Math.random() * p.width,
          y: p.y + Math.random() * p.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 3,
          color: '#38bdf8',
          alpha: 0.8,
          life: 0.2,
          maxLife: 0.2,
        });
      }
    }

    // Horizontal Movement
    if (!p.isDashing) {
      const maxSpeed = input.action ? 3.4 : 2.6; // Dash/Run speed
      const accel = p.grounded ? 0.35 : 0.25;
      const friction = p.grounded ? 0.8 : 0.92;

      if (input.left && !p.isCrouching) {
        p.vx -= accel;
        p.facing = 'left';
      } else if (input.right && !p.isCrouching) {
        p.vx += accel;
        p.facing = 'right';
      } else {
        p.vx *= friction;
        if (Math.abs(p.vx) < 0.05) p.vx = 0;
      }

      // Clamp max speed
      p.vx = Math.max(-maxSpeed, Math.min(maxSpeed, p.vx));
    }

    // Jump Buffering & Coyote Time
    if (input.jumpJustPressed) {
      p.jumpBufferTimer = 0.14;
    }

    const canJump = p.grounded || p.coyoteTimer > 0;
    if (p.jumpBufferTimer > 0 && canJump && !p.isCrouching) {
      // Primary High Jump (clears 3-tile pipes and high blocks with ease)
      p.vy = -7.5;
      p.grounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.doubleJumpAvailable = true;
      audio.playJump();

      // Jump dust particles
      this.spawnDust(p.x + p.width / 2, p.y + p.height, 4);
    } else if (input.jumpJustPressed && !p.grounded && p.doubleJumpAvailable && !p.isCrouching) {
      // Mid-Air Double Jump / Cape Flutter
      p.vy = -7.0;
      p.doubleJumpAvailable = false;
      audio.playDoubleJump();

      // Cape flutter sparkles
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * 8,
          y: p.y + p.height - 4,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 1.5,
          size: 2.5,
          color: '#fef08a',
          alpha: 1,
          life: 0.3,
          maxLife: 0.3,
          shape: 'spark',
        });
      }
    }

    // Variable Jump Arc (releasing jump early allows short hops, holding gives maximum height)
    if (!input.jump && p.vy < -3.2) {
      p.vy *= 0.65;
    }

    // Gravity
    const gravity = p.isDashing ? 0 : 0.32;
    p.vy = Math.min(p.vy + gravity, 7.5);

    // Apply horizontal movement and test collisions
    p.x += p.vx;
    this.resolveHorizontalCollisions(p);

    // Apply vertical movement and test collisions
    const wasGrounded = p.grounded;
    p.y += p.vy;
    p.grounded = false;
    this.resolveVerticalCollisions(p, input);

    // Trigger coyote timer if just walked off ledge
    if (wasGrounded && !p.grounded && p.vy >= 0) {
      p.coyoteTimer = 0.12;
    }

    // Check spring collisions
    for (const spring of this.springs) {
      if (
        p.x + p.width > spring.x &&
        p.x < spring.x + spring.width &&
        p.y + p.height >= spring.y &&
        p.y + p.height <= spring.y + 8 &&
        p.vy > 0
      ) {
        spring.bounceTimer = 1.0;
        p.vy = input.jump ? -11.5 : -9.5;
        p.grounded = false;
        audio.playSpring();
        this.spawnDust(spring.x + spring.width / 2, spring.y + 8, 6);
      }
    }

    // Check Pit Death
    if (p.y > this.currentLevel.height + 40) {
      this.handlePlayerDeath('Fell into pit!');
    }

    // Walk animation frame update
    if (p.grounded && Math.abs(p.vx) > 0.1) {
      p.walkTimer += dt * Math.abs(p.vx) * 12;
      p.walkFrame = p.walkTimer;
      if (Math.floor(p.walkFrame) % 3 === 0 && Math.random() < 0.2) {
        this.spawnDust(p.x + p.width / 2, p.y + p.height, 1);
      }
    } else {
      p.walkFrame = 0;
    }
  }

  private resolveHorizontalCollisions(p: Player) {
    for (const b of this.blocks) {
      if (b.broken || b.type === 'cloud_platform' || b.type === 'wood_bridge' || b.type === 'spike') continue;

      if (
        p.x < b.x + b.width &&
        p.x + p.width > b.x &&
        p.y < b.y + b.height &&
        p.y + p.height > b.y
      ) {
        if (p.vx > 0) {
          p.x = b.x - p.width;
          p.vx = 0;
        } else if (p.vx < 0) {
          p.x = b.x + b.width;
          p.vx = 0;
        }
      }
    }
  }

  private resolveVerticalCollisions(p: Player, input: InputState) {
    for (const b of this.blocks) {
      if (b.broken) continue;

      // Handle Spikes
      if (b.type === 'spike') {
        if (
          p.x + p.width - 2 > b.x &&
          p.x + 2 < b.x + b.width &&
          p.y + p.height > b.y + 4 &&
          p.y < b.y + b.height
        ) {
          this.damagePlayer();
        }
        continue;
      }

      // One-way cloud / bridge platforms
      if (b.type === 'cloud_platform' || b.type === 'wood_bridge') {
        const prevBottom = p.y + p.height - p.vy;
        if (
          p.x + p.width - 2 > b.x &&
          p.x + 2 < b.x + b.width &&
          p.y + p.height >= b.y &&
          prevBottom <= b.y + 5 &&
          p.vy >= 0 &&
          !(input.down && input.jumpJustPressed)
        ) {
          p.y = b.y - p.height;
          p.vy = 0;
          p.grounded = true;
          p.doubleJumpAvailable = true;
        }
        continue;
      }

      // Solid Blocks (Ground, Brick, Question, Pipes)
      if (
        p.x + p.width - 2 > b.x &&
        p.x + 2 < b.x + b.width &&
        p.y < b.y + b.height &&
        p.y + p.height > b.y
      ) {
        if (p.vy > 0) {
          // Landing on top
          p.y = b.y - p.height;
          p.vy = 0;
          p.grounded = true;
          p.doubleJumpAvailable = true;
        } else if (p.vy < 0) {
          // Hitting block from below!
          p.y = b.y + b.height;
          p.vy = 0;
          this.bumpBlock(b);
        }
      }
    }
  }

  private bumpBlock(b: Block) {
    if (b.type === 'question') {
      b.bounceVy = -3.5;
      audio.playBlockBump();

      // Spawn content
      if (b.content === 'coin') {
        this.player.coins++;
        this.player.score += 100;
        audio.playCoin();
        this.spawnFloatingText(b.x + b.width / 2, b.y - 10, '+100', '#facc15');
        this.spawnCoinSparkles(b.x + b.width / 2, b.y);
      } else if (b.content === 'star' || b.content === 'fire_flower' || b.content === 'cherry_1up') {
        this.collectibles.push({
          id: Date.now() + Math.random(),
          type: b.content,
          x: b.x + 2,
          y: b.y - 16,
          startY: b.y - 16,
          width: 14,
          height: 14,
          collected: false,
          animTimer: 0,
          animFrame: 0,
          floatOffset: 0,
          vy: -2,
        });
        audio.playPowerup();
      }

      b.type = 'empty';
    } else if (b.type === 'brick') {
      if (this.player.powerup !== 'none') {
        // Break brick!
        b.broken = true;
        this.player.score += 50;
        audio.playBlockBreak();
        this.spawnBrickShards(b.x, b.y);
      } else {
        b.bounceVy = -2.5;
        audio.playBlockBump();
      }
    }
  }

  private checkSpinAttackCollisions() {
    const p = this.player;
    const spinBox = {
      x: p.x - 8,
      y: p.y - 4,
      width: p.width + 16,
      height: p.height + 8,
    };

    // Defeat enemies caught in spin
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.isSquashed) continue;
      if (
        spinBox.x < enemy.x + enemy.width &&
        spinBox.x + spinBox.width > enemy.x &&
        spinBox.y < enemy.y + enemy.height &&
        spinBox.y + spinBox.height > enemy.y
      ) {
        this.defeatEnemy(enemy, 'spin');
      }
    }

    // Break adjacent bricks
    for (const b of this.blocks) {
      if (b.broken || b.type !== 'brick') continue;
      if (
        spinBox.x < b.x + b.width &&
        spinBox.x + spinBox.width > b.x &&
        spinBox.y < b.y + b.height &&
        spinBox.y + spinBox.height > b.y
      ) {
        b.broken = true;
        audio.playBlockBreak();
        this.spawnBrickShards(b.x, b.y);
      }
    }
  }

  private spawnFireball() {
    const p = this.player;
    this.projectiles.push({
      x: p.facing === 'right' ? p.x + p.width + 2 : p.x - 4,
      y: p.y + 6,
      vx: (p.facing === 'right' ? 1 : -1) * 4.5,
      vy: 1.5,
      radius: 4,
      life: 2.0,
      isPlayer: true,
      bounces: 0,
    });
    audio.playFireball();
  }

  // --- Enemies Behavior & Collisions ---

  private updateEnemies(dt: number, input: InputState) {
    const p = this.player;

    for (const enemy of this.enemies) {
      if (!enemy.alive && !enemy.isSquashed) continue;

      if (enemy.isSquashed) {
        enemy.squashTimer += dt;
        if (enemy.squashTimer > 0.6) {
          enemy.alive = false;
        }
        continue;
      }

      enemy.animTimer++;

      if (enemy.type === 'urchin') {
        // Patrols back and forth on platform
        enemy.x += enemy.vx;
        if (enemy.x <= enemy.patrolMinX) {
          enemy.x = enemy.patrolMinX;
          enemy.vx = Math.abs(enemy.vx);
          enemy.facing = 'right';
        } else if (enemy.x + enemy.width >= enemy.patrolMaxX) {
          enemy.x = enemy.patrolMaxX - enemy.width;
          enemy.vx = -Math.abs(enemy.vx);
          enemy.facing = 'left';
        }
      } else if (enemy.type === 'winged_beetle') {
        // Hopping / flying in parabolic arcs
        enemy.x += enemy.vx;
        enemy.vy += 0.08;
        enemy.y += enemy.vy;
        if (enemy.y >= enemy.startY) {
          enemy.y = enemy.startY;
          enemy.vy = -2.2; // Bounce
        }
        if (enemy.x <= enemy.patrolMinX) {
          enemy.vx = Math.abs(enemy.vx);
          enemy.facing = 'right';
        } else if (enemy.x >= enemy.patrolMaxX) {
          enemy.vx = -Math.abs(enemy.vx);
          enemy.facing = 'left';
        }
      } else if (enemy.type === 'piranha') {
        // Moves up and down from pipe
        enemy.pipeTimer = (enemy.pipeTimer || 0) + 1;
        const state = enemy.pipeState || 'hiding';
        const minY = enemy.pipeYMin || enemy.startY - 20;
        const maxY = enemy.pipeYMax || enemy.startY;

        if (state === 'rising') {
          enemy.y -= 0.6;
          if (enemy.y <= minY) {
            enemy.y = minY;
            enemy.pipeState = 'waiting';
            enemy.pipeTimer = 0;
          }
        } else if (state === 'waiting') {
          if (enemy.pipeTimer > 80) {
            enemy.pipeState = 'lowering';
          }
        } else if (state === 'lowering') {
          enemy.y += 0.6;
          if (enemy.y >= maxY) {
            enemy.y = maxY;
            enemy.pipeState = 'hiding';
            enemy.pipeTimer = 0;
          }
        } else if (state === 'hiding') {
          // Only rise if player is not standing directly on the pipe
          const playerNearPipe = Math.abs(p.x - enemy.x) < 24;
          if (enemy.pipeTimer > 90 && !playerNearPipe) {
            enemy.pipeState = 'rising';
          }
        }
      } else if (enemy.type === 'boss') {
        // Iron Spiketoad King Boss AI
        enemy.bossAttackTimer = (enemy.bossAttackTimer || 0) + dt;
        enemy.x += enemy.vx;

        // Turn around at walls
        if (enemy.x <= enemy.patrolMinX) {
          enemy.x = enemy.patrolMinX;
          enemy.vx = 1.2;
          enemy.facing = 'right';
        } else if (enemy.x + enemy.width >= enemy.patrolMaxX) {
          enemy.x = enemy.patrolMaxX - enemy.width;
          enemy.vx = -1.2;
          enemy.facing = 'left';
        }

        // Periodic high jump stomp
        if (enemy.bossAttackTimer > 3.0) {
          enemy.bossAttackTimer = 0;
          enemy.vy = -6.0;
        }

        enemy.vy += 0.3;
        enemy.y += enemy.vy;
        if (enemy.y >= enemy.startY) {
          if (enemy.vy > 3.0) {
            // Ground stomp shockwave
            this.screenShake = 6;
            audio.playBlockBump();
            this.spawnDust(enemy.x + enemy.width / 2, enemy.y + enemy.height, 8);
          }
          enemy.y = enemy.startY;
          enemy.vy = 0;
        }
      }

      // Check Collision with Player
      if (
        p.x + p.width - 2 > enemy.x &&
        p.x + 2 < enemy.x + enemy.width &&
        p.y + p.height > enemy.y &&
        p.y < enemy.y + enemy.height
      ) {
        // 1. If Star Invincibility: destroy enemy instantly!
        if (p.starTimer > 0) {
          this.defeatEnemy(enemy, 'star');
          continue;
        }

        // 2. If jumping/falling on top: Stomp!
        // Generous, natural stomp window: player is moving downward (vy >= 0) and player feet are in top 70% of enemy
        const isFalling = p.vy >= 0;
        const playerBottom = p.y + p.height;
        const enemyTop = enemy.y;
        const enemyMid = enemy.y + enemy.height * 0.75;
        const isLandingOnTop = isFalling && playerBottom >= enemyTop && (playerBottom - Math.max(p.vy, 3)) <= enemyMid;

        if (isLandingOnTop && enemy.type !== 'piranha') {
          // Bouncy stomp! Holding jump gives high spring bounce
          p.vy = input.jump ? -8.2 : -7.0;
          p.grounded = false;
          p.doubleJumpAvailable = true; // Stomping refreshes double jump!
          this.defeatEnemy(enemy, 'stomp');
        } else {
          // 3. Side hit: Player hurt
          this.damagePlayer();
        }
      }
    }
  }

  private defeatEnemy(enemy: Enemy, method: 'stomp' | 'spin' | 'star' | 'fireball') {
    if (enemy.type === 'boss') {
      enemy.health--;
      this.screenShake = 8;
      this.hitstopTimer = 0.08;
      audio.playStomp();
      this.spawnFloatingText(enemy.x + enemy.width / 2, enemy.y - 10, 'HIT!', '#ef4444');

      if (enemy.health <= 0) {
        enemy.alive = false;
        this.player.score += 2000;
        audio.playStageClear();
        // Drop Victory Star at center of arena
        this.collectibles.push({
          id: 9999,
          type: 'star',
          x: enemy.x + 8,
          y: enemy.y - 16,
          startY: enemy.y - 16,
          width: 16,
          height: 16,
          collected: false,
          animTimer: 0,
          animFrame: 0,
          floatOffset: 0,
        });
        this.spawnConfetti(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      }
      return;
    }

    if (method === 'stomp') {
      enemy.isSquashed = true;
      enemy.squashTimer = 0;
      audio.playStomp();
    } else {
      enemy.alive = false;
      audio.playStomp();
      this.spawnDust(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8);
    }

    this.player.score += 200;
    this.spawnFloatingText(enemy.x + enemy.width / 2, enemy.y - 8, '+200', '#ffffff');
  }

  // --- Collectibles ---

  private updateCollectibles(dt: number) {
    const p = this.player;

    for (const col of this.collectibles) {
      if (col.collected) continue;

      col.animTimer += dt * 10;
      col.animFrame = Math.floor(col.animTimer);
      col.floatOffset = Math.sin(col.animTimer * 0.4) * 3;

      // Check Collection
      if (
        p.x + p.width > col.x &&
        p.x < col.x + col.width &&
        p.y + p.height > col.y &&
        p.y < col.y + col.height
      ) {
        col.collected = true;

        switch (col.type) {
          case 'coin':
            p.coins++;
            p.score += 100;
            audio.playCoin();
            this.spawnFloatingText(col.x + col.width / 2, col.y - 8, '+100', '#facc15');
            this.spawnCoinSparkles(col.x + col.width / 2, col.y);
            break;

          case 'star':
            p.score += 500;
            p.starTimer = 12.0; // 12 seconds invincibility
            audio.playPowerup();
            this.spawnFloatingText(col.x, col.y - 8, 'INVINCIBLE!', '#facc15');
            // If in level 3 and boss is defeated, star triggers game victory!
            if (this.currentLevel.id === 3) {
              setTimeout(() => {
                this.setGameState('GAME_VICTORY');
                audio.playStageClear();
              }, 400);
            }
            break;

          case 'fire_flower':
            p.score += 300;
            p.powerup = 'fire';
            audio.playPowerup();
            this.spawnFloatingText(col.x, col.y - 8, 'FIRE POWER!', '#ea580c');
            break;

          case 'cherry_1up':
            p.lives++;
            p.health = p.maxHealth;
            audio.playPowerup();
            this.spawnFloatingText(col.x, col.y - 8, '1-UP!', '#22c55e');
            break;

          case 'speed_boots':
            p.score += 200;
            audio.playPowerup();
            this.spawnFloatingText(col.x, col.y - 8, 'SPEED BOOST!', '#3b82f6');
            break;
        }
      }
    }
  }

  // --- Projectiles ---

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      pr.x += pr.vx;
      pr.vy += 0.25;
      pr.y += pr.vy;

      // Bounce on floor
      for (const b of this.blocks) {
        if (b.broken) continue;
        if (
          pr.x + pr.radius > b.x &&
          pr.x - pr.radius < b.x + b.width &&
          pr.y + pr.radius >= b.y &&
          pr.y - pr.radius <= b.y + b.height
        ) {
          pr.y = b.y - pr.radius;
          pr.vy = -3.2; // Bounce up
          pr.bounces++;
          if (pr.bounces > 4) {
            pr.life = 0;
          }
        }
      }

      // Check collision with enemies
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.isSquashed) continue;
        if (
          pr.x + pr.radius > enemy.x &&
          pr.x - pr.radius < enemy.x + enemy.width &&
          pr.y + pr.radius > enemy.y &&
          pr.y - pr.radius < enemy.y + enemy.height
        ) {
          pr.life = 0;
          this.defeatEnemy(enemy, 'fireball');
          break;
        }
      }
    }
  }

  // --- Particles & Text ---

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.life -= dt;
      if (part.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      part.x += part.vx;
      part.y += part.vy;
      if (part.gravity) {
        part.vy += part.gravity;
      }
      part.alpha = part.life / part.maxLife;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy;
      ft.alpha = ft.life / 0.8;
    }
  }

  private updateBlocks(dt: number) {
    for (const b of this.blocks) {
      if (b.bounceOffset < 0 || b.bounceVy !== 0) {
        b.bounceOffset += b.bounceVy;
        b.bounceVy += 0.5;
        if (b.bounceOffset >= 0) {
          b.bounceOffset = 0;
          b.bounceVy = 0;
        }
      }
    }
  }

  // --- Flagpole & Victory ---

  private checkFlagpole(dt: number) {
    const fp = this.flagpole;
    const p = this.player;

    if (!fp.reached && p.x + p.width >= fp.x && p.x <= fp.x + 8) {
      fp.reached = true;
      audio.playStageClear();

      // Bonus score based on flag height
      const heightPercent = 1 - (p.y - fp.y) / fp.height;
      const bonusScore = Math.max(100, Math.floor(heightPercent * 2000));
      p.score += bonusScore;
      this.spawnFloatingText(fp.x, p.y, `+${bonusScore}`, '#fbbf24');
      this.spawnConfetti(fp.x + 4, fp.y + fp.height / 2);

      // Slide flag down
      const flagSlideInterval = setInterval(() => {
        if (fp.flagY < fp.y + fp.height - 18) {
          fp.flagY += 4;
        } else {
          clearInterval(flagSlideInterval);
          setTimeout(() => {
            if (this.levelIndex < this.allLevels.length - 1) {
              this.setGameState('STAGE_CLEAR');
            } else {
              this.setGameState('GAME_VICTORY');
            }
          }, 800);
        }
      }, 30);
    }
  }

  // --- Player Hurt & Death ---

  public damagePlayer() {
    const p = this.player;
    if (p.invulnerableTimer > 0 || p.starTimer > 0) return;

    if (p.powerup !== 'none') {
      p.powerup = 'none';
      p.invulnerableTimer = 1.8;
      this.screenShake = 6;
      audio.playHurt();
      this.spawnDust(p.x + p.width / 2, p.y + p.height / 2, 6);
      return;
    }

    p.health--;
    p.invulnerableTimer = 1.8;
    this.screenShake = 8;
    audio.playHurt();
    this.spawnDust(p.x + p.width / 2, p.y + p.height / 2, 8);

    if (p.health <= 0) {
      this.handlePlayerDeath('Defeated!');
    }
  }

  private handlePlayerDeath(reason: string) {
    const p = this.player;
    p.lives--;
    audio.playGameOver();
    this.screenShake = 10;
    this.spawnFloatingText(p.x + p.width / 2, p.y - 12, reason, '#ef4444');

    if (p.lives <= 0) {
      setTimeout(() => {
        this.setGameState('GAME_OVER');
      }, 700);
    } else {
      setTimeout(() => {
        p.health = p.maxHealth;
        p.powerup = 'none';
        p.invulnerableTimer = 2.0;
        // Respawn at checkpoint or start
        const startX = p.checkpoint ? p.checkpoint.x : this.currentLevel.playerStart.x;
        const startY = p.checkpoint ? p.checkpoint.y : this.currentLevel.playerStart.y;
        p.x = startX;
        p.y = startY;
        p.vx = 0;
        p.vy = 0;
      }, 600);
    }
  }

  // --- Camera ---

  private updateCamera(_dt: number) {
    const p = this.player;
    // Camera follows player smoothly with horizontal lead
    const targetX = p.x - this.VIRTUAL_WIDTH * 0.38 + (p.facing === 'right' ? 20 : -20);
    const maxCameraX = Math.max(0, this.currentLevel.width - this.VIRTUAL_WIDTH);

    this.cameraX += (targetX - this.cameraX) * 0.12;
    this.cameraX = Math.max(0, Math.min(maxCameraX, this.cameraX));

    // Vertical camera damping
    const targetY = Math.max(0, p.y - this.VIRTUAL_HEIGHT * 0.65);
    const maxCameraY = Math.max(0, this.currentLevel.height - this.VIRTUAL_HEIGHT);
    this.cameraY += (targetY - this.cameraY) * 0.1;
    this.cameraY = Math.max(0, Math.min(maxCameraY, this.cameraY));
  }

  // --- Particle Helpers ---

  private spawnDust(x: number, y: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y - Math.random() * 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 1.2,
        size: Math.random() * 2.5 + 1.5,
        color: '#e2e8f0',
        alpha: 0.8,
        life: 0.35,
        maxLife: 0.35,
        gravity: 0.05,
      });
    }
  }

  private spawnCoinSparkles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5,
        color: '#fde047',
        alpha: 1,
        life: 0.4,
        maxLife: 0.4,
        shape: 'spark',
      });
    }
  }

  private spawnBrickShards(x: number, y: number) {
    const velocities = [
      { vx: -2, vy: -4 },
      { vx: 2, vy: -4 },
      { vx: -1.5, vy: -2 },
      { vx: 1.5, vy: -2 },
    ];
    for (const v of velocities) {
      this.particles.push({
        x: x + 8,
        y: y + 8,
        vx: v.vx,
        vy: v.vy,
        size: 5,
        color: '#b45309',
        alpha: 1,
        life: 0.6,
        maxLife: 0.6,
        gravity: 0.25,
      });
    }
  }

  private spawnConfetti(x: number, y: number) {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        size: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1.2,
        maxLife: 1.2,
        gravity: 0.15,
      });
    }
  }

  public spawnFloatingText(x: number, y: number, text: string, color: string = '#ffffff') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -0.8,
      life: 0.8,
    });
  }
}
