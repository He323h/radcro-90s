import { ATTACK_DEFINITIONS, CHARACTERS } from './characterData';
import {
  AttackData,
  CharacterDef,
  CharacterId,
  FighterState,
  InputState,
  Rect,
} from './types';

export class Fighter {
  public id: 1 | 2;
  public charDef: CharacterDef;
  public x: number = 0;
  public y: number = 330;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 1 | -1 = 1;

  public state: FighterState = 'IDLE';
  public stateTimer: number = 0;
  public currentAttack: AttackData | null = null;
  public hasHitThisAttack: boolean = false;

  public health: number = 1000;
  public displayHealth: number = 1000; // trailing chip damage bar
  public maxHealth: number = 1000;
  public superMeter: number = 0; // 0 to 100
  public roundsWon: number = 0;

  public hitstunTimer: number = 0;
  public blockstunTimer: number = 0;
  public hitstopTimer: number = 0;
  public invincibleTimer: number = 0;

  public get invincible(): boolean {
    return this.invincibleTimer > 0;
  }

  public isGuarding: boolean = false;
  public isHit: boolean = false;
  public comboCounter: number = 0;
  public comboResetTimer: number = 0;

  // Ground level constant
  public static readonly GROUND_Y = 330;
  public static readonly GRAVITY = 0.75;

  // Recent input buffer for special move execution
  private inputHistory: { input: InputState; time: number }[] = [];

  constructor(id: 1 | 2, charId: CharacterId, startX: number, startFacing: 1 | -1) {
    this.id = id;
    this.charDef = CHARACTERS[charId];
    this.maxHealth = this.charDef.maxHealth;
    this.health = this.maxHealth;
    this.displayHealth = this.maxHealth;
    this.x = startX;
    this.y = Fighter.GROUND_Y;
    this.facing = startFacing;
  }

  public reset(startX: number, startFacing: 1 | -1, fullReset: boolean = false) {
    this.x = startX;
    this.y = Fighter.GROUND_Y;
    this.vx = 0;
    this.vy = 0;
    this.facing = startFacing;
    this.state = 'IDLE';
    this.stateTimer = 0;
    this.currentAttack = null;
    this.hasHitThisAttack = false;
    this.hitstunTimer = 0;
    this.blockstunTimer = 0;
    this.hitstopTimer = 0;
    this.invincibleTimer = 0;
    this.isGuarding = false;
    this.isHit = false;
    this.comboCounter = 0;

    if (fullReset) {
      this.health = this.maxHealth;
      this.displayHealth = this.maxHealth;
      this.superMeter = 0;
      this.roundsWon = 0;
    } else {
      this.health = this.maxHealth;
      this.displayHealth = this.maxHealth;
    }
  }

  public setCharacter(charId: CharacterId) {
    this.charDef = CHARACTERS[charId];
    this.maxHealth = this.charDef.maxHealth;
    this.health = this.maxHealth;
    this.displayHealth = this.maxHealth;
  }

  /**
   * Main per-frame physics & state update
   */
  public update(
    input: InputState,
    opponent: Fighter,
    onSpawnProjectile: (type: 'HADOUKEN' | 'KUNAI', isSuper?: boolean) => void
  ) {
    // Record input into buffer
    this.inputHistory.push({ input: { ...input }, time: Date.now() });
    if (this.inputHistory.length > 30) this.inputHistory.shift();

    // Trailing health bar decay animation (smooth yellow chip bar)
    if (this.displayHealth > this.health) {
      this.displayHealth = Math.max(this.health, this.displayHealth - 2.5);
    }

    // Combo reset timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer === 0) {
        this.comboCounter = 0;
      }
    }

    // Invincible frames tick down
    if (this.invincibleTimer > 0) this.invincibleTimer--;

    // Hitstop micro-pause on attack contact
    if (this.hitstopTimer > 0) {
      this.hitstopTimer--;
      return;
    }

    this.stateTimer++;

    // Apply gravity if airborne
    if (this.y < Fighter.GROUND_Y || this.vy < 0) {
      this.vy += Fighter.GRAVITY;
      this.y += this.vy;
      this.x += this.vx;

      if (this.y >= Fighter.GROUND_Y) {
        this.y = Fighter.GROUND_Y;
        this.vy = 0;
        this.vx = 0;
        // Land recovery
        if (this.state.startsWith('JUMP') || this.state === 'SPECIAL_DRAGON') {
          this.setState('IDLE');
        }
      }
    } else {
      this.x += this.vx;
    }

    // Facing direction: auto-turn to face opponent when in neutral or walking
    if (['IDLE', 'WALK_FWD', 'WALK_BACK'].includes(this.state)) {
      if (opponent.x > this.x + 8) this.facing = 1;
      else if (opponent.x < this.x - 8) this.facing = -1;
    }

    // --- State-Specific Logic ---

    // 1. Hitstun state
    if (this.hitstunTimer > 0) {
      this.hitstunTimer--;
      this.vx *= 0.88; // pushback friction
      if (this.hitstunTimer === 0) {
        this.isHit = false;
        this.setState('IDLE');
      }
      return;
    }

    // 2. Blockstun state
    if (this.blockstunTimer > 0) {
      this.blockstunTimer--;
      this.vx *= 0.85;
      if (this.blockstunTimer === 0) {
        this.isGuarding = false;
        this.setState('IDLE');
      }
      return;
    }

    // 3. Knockdown state
    if (this.state === 'KNOCKDOWN') {
      if (this.y >= Fighter.GROUND_Y && this.stateTimer > 28) {
        this.setState('GETUP');
      }
      return;
    }

    // 4. Getting up
    if (this.state === 'GETUP') {
      if (this.stateTimer > 18) {
        this.invincibleTimer = 16; // Wake-up invincibility
        this.setState('IDLE');
      }
      return;
    }

    // 5. Attacking states
    if (this.currentAttack) {
      const totalFrames =
        this.currentAttack.startupFrames +
        this.currentAttack.activeFrames +
        this.currentAttack.recoveryFrames;

      // Projectile release moment
      if (
        this.state === 'SPECIAL_PROJECTILE' &&
        this.stateTimer === this.currentAttack.startupFrames &&
        !this.hasHitThisAttack
      ) {
        this.hasHitThisAttack = true;
        const type = this.charDef.id === 'KAZUMA' ? 'KUNAI' : 'HADOUKEN';
        onSpawnProjectile(type, false);
      }

      // Special Dragon Uppercut leaping physics
      if (this.state === 'SPECIAL_DRAGON') {
        if (this.stateTimer === this.currentAttack.startupFrames) {
          this.vy = -12.5;
          this.vx = this.facing * 3.2;
        }
      }

      // Whirlwind Kick floating physics
      if (this.state === 'SPECIAL_WHIRLWIND') {
        if (this.stateTimer === this.currentAttack.startupFrames) {
          this.vy = -3;
          this.vx = this.facing * 4.5;
        }
      }

      // Shadow Slide ground dash
      if (this.state === 'SPECIAL_SLIDE') {
        if (this.stateTimer === this.currentAttack.startupFrames) {
          this.vx = this.facing * 7.5;
        } else {
          this.vx *= 0.92;
        }
      }

      // Super Art dash / projectile burst
      if (this.state === 'SUPER_ART') {
        if (this.stateTimer === this.currentAttack.startupFrames && !this.hasHitThisAttack) {
          this.hasHitThisAttack = true;
          this.vx = this.facing * 8;
          onSpawnProjectile('HADOUKEN', true);
        }
      }

      // Attack finished -> return to Idle or Crouch
      if (this.stateTimer >= totalFrames) {
        this.currentAttack = null;
        this.hasHitThisAttack = false;
        if (input.down && this.y >= Fighter.GROUND_Y) {
          this.setState('CROUCH');
        } else {
          this.setState('IDLE');
        }
      }

      // Special Cancel: Can cancel normal attack into a special move if hit connected!
      if (this.hasHitThisAttack && this.isNormalAttack()) {
        if (input.superArt && this.superMeter >= 100) {
          this.executeAttack('SUPER_ART');
          return;
        }
        if (input.special) {
          this.executeAttack(this.getSpecialMoveName());
          return;
        }
      }
      return;
    }

    // 6. Airborne Jump Movement
    if (this.y < Fighter.GROUND_Y) {
      if (this.vy > 0 && this.state !== 'JUMP_FALL' && !this.currentAttack) {
        this.state = 'JUMP_FALL';
      }

      // Aerial Attacks
      if (input.lp || input.hp) {
        this.executeAttack('JUMP_PUNCH');
        return;
      }
      if (input.lk || input.hk) {
        this.executeAttack('JUMP_KICK');
        return;
      }
      return;
    }

    // --- Ground Neutral & Input Actions ---

    // Special Art Moves
    if (input.superArt && this.superMeter >= 100) {
      this.superMeter = 0;
      this.executeAttack('SUPER_ART');
      return;
    }

    if (input.special) {
      if (input.down) {
        // Special 3: Whirlwind Kick or Slide
        const spec = this.charDef.id === 'KAZUMA' ? 'SPECIAL_SLIDE' : 'SPECIAL_WHIRLWIND';
        this.executeAttack(spec);
      } else if (input.up) {
        // Special 2: Dragon Uppercut
        this.executeAttack('SPECIAL_DRAGON');
      } else {
        // Special 1: Projectile (Hadouken / Kunai)
        this.executeAttack('SPECIAL_PROJECTILE');
      }
      return;
    }

    // Attacks
    if (input.down) {
      // Crouch Attacks
      if (input.lp || input.hp) {
        this.executeAttack('CROUCH_PUNCH');
        return;
      }
      if (input.lk || input.hk) {
        this.executeAttack('CROUCH_KICK');
        return;
      }
      this.setState('CROUCH');
      this.vx = 0;
      return;
    }

    // Standing Normal Attacks
    if (input.lp) {
      this.executeAttack('LIGHT_PUNCH');
      return;
    }
    if (input.hp) {
      this.executeAttack('HEAVY_PUNCH');
      return;
    }
    if (input.lk) {
      this.executeAttack('LIGHT_KICK');
      return;
    }
    if (input.hk) {
      this.executeAttack('HEAVY_KICK');
      return;
    }

    // Jump
    if (input.up) {
      this.vy = -this.charDef.jumpForce;
      if (input.left) this.vx = -this.charDef.speed * 0.9;
      else if (input.right) this.vx = this.charDef.speed * 0.9;
      else this.vx = 0;
      this.setState('JUMP_UP');
      return;
    }

    // Movement (Walk Forward / Walk Back with Blocking)
    const movingAway = (this.facing === 1 && input.left) || (this.facing === -1 && input.right);
    const movingToward = (this.facing === 1 && input.right) || (this.facing === -1 && input.left);

    if (movingToward) {
      this.vx = this.facing * this.charDef.speed;
      this.setState('WALK_FWD');
    } else if (movingAway || input.block) {
      // Walking back automatically guards high attacks!
      this.vx = -this.facing * (this.charDef.speed * 0.7);
      this.setState(opponent.currentAttack ? 'BLOCK_HIGH' : 'WALK_BACK');
    } else {
      this.vx = 0;
      this.setState('IDLE');
    }
  }

  /**
   * Start executing an attack
   */
  public executeAttack(attackName: string) {
    const def = ATTACK_DEFINITIONS[attackName];
    if (!def) return;

    this.currentAttack = def;
    this.hasHitThisAttack = false;
    this.setState(attackName as FighterState);
  }

  private isNormalAttack(): boolean {
    return [
      'LIGHT_PUNCH',
      'HEAVY_PUNCH',
      'LIGHT_KICK',
      'HEAVY_KICK',
      'CROUCH_PUNCH',
      'CROUCH_KICK',
    ].includes(this.state);
  }

  private getSpecialMoveName(): string {
    if (this.charDef.id === 'KAZUMA') return 'SPECIAL_SLIDE';
    return 'SPECIAL_DRAGON';
  }

  public setState(newState: FighterState) {
    this.state = newState;
    this.stateTimer = 0;
  }

  /**
   * Calculate Hurtboxes (Areas where the fighter can be hit)
   */
  public getHurtboxes(): Rect[] {
    if (this.state === 'KNOCKDOWN' || this.invincibleTimer > 0) {
      return []; // Invulnerable while on floor or recovering
    }

    if (this.state === 'CROUCH' || this.state === 'BLOCK_LOW' || this.state === 'CROUCH_KICK') {
      // Compact low hurtbox
      return [
        { x: -20, y: -52, w: 42, h: 26 }, // Torso/head low
        { x: -24, y: -26, w: 48, h: 26 }, // Legs
      ];
    }

    if (this.state.startsWith('JUMP')) {
      return [{ x: -20, y: -65, w: 40, h: 48 }];
    }

    // Default upright fighter hurtboxes (Head, Torso, Legs)
    return [
      { x: -16, y: -86, w: 32, h: 24 }, // Head
      { x: -20, y: -62, w: 40, h: 32 }, // Chest/Torso
      { x: -22, y: -30, w: 44, h: 30 }, // Legs/Feet
    ];
  }

  /**
   * Get Active Hitbox for current frame
   */
  public getActiveHitbox(): Rect | null {
    if (!this.currentAttack || this.hasHitThisAttack) return null;

    const start = this.currentAttack.startupFrames;
    const end = start + this.currentAttack.activeFrames;

    if (this.stateTimer >= start && this.stateTimer < end) {
      return this.currentAttack.hitbox;
    }
    return null;
  }

  /**
   * Check if fighter is currently guarding against an incoming attack
   */
  public canBlock(attack: AttackData): boolean {
    if (this.state === 'BLOCK_HIGH') {
      // High block stops HIGH and MID, fails against LOW
      return !attack.isLow;
    }
    if (this.state === 'BLOCK_LOW') {
      // Low block stops LOW and MID, fails against OVERHEAD
      return !attack.isOverhead;
    }
    return false;
  }

  /**
   * Apply hit damage or block chip
   */
  public takeHit(attack: AttackData, attacker: Fighter, isBlocked: boolean) {
    if (isBlocked) {
      // Chip damage
      this.health = Math.max(0, this.health - attack.chipDamage);
      this.blockstunTimer = attack.blockstun;
      this.hitstopTimer = 4;
      this.isGuarding = true;
      this.vx = -this.facing * (attack.pushback * 0.7);
      // Small meter gain on block
      this.superMeter = Math.min(100, this.superMeter + 4);
    } else {
      // Clean Hit
      this.health = Math.max(0, this.health - attack.damage);
      this.hitstunTimer = attack.hitstun;
      this.hitstopTimer = attack.soundType === 'super' ? 12 : 6;
      this.isHit = true;
      this.vx = -this.facing * attack.pushback;

      // Meter gain on hit received
      this.superMeter = Math.min(100, this.superMeter + attack.meterGain * 0.5);

      if (attack.knockdown || this.health <= 0) {
        this.setState('KNOCKDOWN');
        this.vy = -8.5;
        this.vx = -this.facing * 6;
      } else {
        this.setState(attack.damage > 70 ? 'HIT_HEAVY' : 'HIT_LIGHT');
      }
    }
  }
}
