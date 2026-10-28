import { Fighter } from './fighter';
import { Difficulty, InputState } from './types';

export class ArcadeAI {
  private difficulty: Difficulty;
  private actionTimer: number = 0;
  private currentInput: InputState;

  // AI Behavior State Machine
  private state: 'APPROACH' | 'ATTACK' | 'ZONE' | 'JUMP_IN' | 'RETREAT' = 'APPROACH';
  private comboStep: number = 0;
  private comboTimer: number = 0;
  private activeAttackButton: keyof InputState | null = null;
  private attackPressFrames: number = 0;

  constructor(difficulty: Difficulty = 'NORMAL') {
    this.difficulty = difficulty;
    this.currentInput = this.getEmptyInput();
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
  }

  private getEmptyInput(): InputState {
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

  /**
   * Main AI frame update called every tick (60 FPS)
   */
  public update(ai: Fighter, player: Fighter): InputState {
    // Reset inputs
    this.currentInput = this.getEmptyInput();

    const dist = Math.abs(ai.x - player.x);
    const playerToRight = player.x > ai.x;
    const moveToward = playerToRight ? 'right' : 'left';
    const moveAway = playerToRight ? 'left' : 'right';

    // 1. Check for Active Attack Button Release
    // Attack buttons need a crisp press (active for 2-3 frames, then released)
    if (this.activeAttackButton) {
      this.attackPressFrames++;
      if (this.attackPressFrames <= 3) {
        this.currentInput[this.activeAttackButton] = true;
      } else {
        this.activeAttackButton = null;
        this.attackPressFrames = 0;
      }
    }

    // 2. High-Priority Reflex: Anti-Air Reaction
    // If player is airborne jumping toward AI, punish with Dragon Uppercut or Heavy Punch!
    if (player.y < Fighter.GROUND_Y - 30 && dist < 160 && !ai.currentAttack) {
      const antiAirProb =
        this.difficulty === 'EASY' ? 0.35 : this.difficulty === 'NORMAL' ? 0.7 : 0.95;
      if (Math.random() < antiAirProb && this.actionTimer <= 0) {
        this.pressAttack(Math.random() < 0.65 ? 'special' : 'hp');
        this.currentInput.up = true; // executes Dragon Uppercut
        this.actionTimer = 25;
        return this.currentInput;
      }
    }

    // 3. High-Priority Reflex: Super Move
    // When Super Meter is 100% and within range, trigger Super Art!
    if (ai.superMeter >= 100 && dist < 150 && !ai.currentAttack) {
      this.pressAttack('superArt');
      this.actionTimer = 40;
      return this.currentInput;
    }

    // 4. Defensive Guarding against player's incoming attacks
    if (player.currentAttack && dist < 110 && !ai.currentAttack) {
      const guardProb =
        this.difficulty === 'EASY' ? 0.25 : this.difficulty === 'NORMAL' ? 0.55 : 0.85;
      // Chance to block or counter-attack
      if (Math.random() < guardProb) {
        this.currentInput[moveAway] = true;
        this.currentInput.block = true;
        if (player.currentAttack.isLow) {
          this.currentInput.down = true; // Low guard against sweeps
        }
        return this.currentInput;
      } else if (Math.random() < 0.5) {
        // Fast interrupt with Light Punch!
        this.pressAttack('lp');
        return this.currentInput;
      }
    }

    // 5. Handle Airborne AI (Mid-jump attack)
    if (ai.y < Fighter.GROUND_Y) {
      if (!ai.currentAttack && dist < 120) {
        // Drop an aerial kick or punch
        this.pressAttack(Math.random() < 0.6 ? 'hk' : 'hp');
      }
      return this.currentInput;
    }

    // 6. Action Timer Countdown & State Machine Transitions
    this.actionTimer--;
    if (this.actionTimer <= 0) {
      this.decideNextAction(dist);
    }

    // 7. Execute Current State Behavior
    switch (this.state) {
      case 'APPROACH':
        // Walk aggressively toward the player
        this.currentInput[moveToward] = true;
        // If we got close enough, transition immediately to attack!
        if (dist <= 75) {
          this.state = 'ATTACK';
          this.actionTimer = 3;
          this.comboStep = 0;
        }
        break;

      case 'ATTACK':
        // Close-range combat attack execution
        this.executeMeleeAttack(dist, moveToward);
        break;

      case 'ZONE':
        // Projectile Fireball (Hadouken / Kunai)
        this.pressAttack('special');
        this.actionTimer = 35;
        // After throwing fireball, immediately advance!
        this.state = 'APPROACH';
        break;

      case 'JUMP_IN':
        // Jump toward opponent with momentum
        this.currentInput.up = true;
        this.currentInput[moveToward] = true;
        this.actionTimer = 30;
        this.state = 'APPROACH';
        break;

      case 'RETREAT':
        // Brief tactical repositioning / spacing
        this.currentInput[moveAway] = true;
        if (Math.random() < 0.4) this.currentInput.block = true;
        break;
    }

    return this.currentInput;
  }

  /**
   * Decide new tactical objective based on distance
   */
  private decideNextAction(dist: number) {
    const roll = Math.random();

    if (dist > 230) {
      // FAR RANGE
      if (roll < 0.45) {
        // 45% Approach
        this.state = 'APPROACH';
        this.actionTimer = 24;
      } else if (roll < 0.8) {
        // 35% Fireball zoning
        this.state = 'ZONE';
        this.actionTimer = 30;
      } else {
        // 20% Jump-in forward
        this.state = 'JUMP_IN';
        this.actionTimer = 25;
      }
    } else if (dist > 85) {
      // MID RANGE (85 to 230)
      if (roll < 0.55) {
        // 55% Advance into striking range
        this.state = 'APPROACH';
        this.actionTimer = 16;
      } else if (roll < 0.8) {
        // 25% Mid-range special attack (Whirlwind, Slide, or Projectile)
        this.state = 'ATTACK';
        this.actionTimer = 18;
      } else {
        // 20% Jump-in attack
        this.state = 'JUMP_IN';
        this.actionTimer = 25;
      }
    } else {
      // CLOSE RANGE (dist <= 85)
      // Highly aggressive: 85% Attack, 15% Brief spacing
      if (roll < 0.85) {
        this.state = 'ATTACK';
        this.comboStep = 0;
        this.actionTimer = 18;
      } else {
        this.state = 'RETREAT';
        this.actionTimer = 12; // Very brief step back
      }
    }
  }

  /**
   * Execute varied martial arts melee combos & special moves
   */
  private executeMeleeAttack(dist: number, moveToward: 'left' | 'right') {
    // If already in middle of attack animation, wait or cancel
    this.comboTimer--;
    if (this.comboTimer > 0) return;

    const attackRoll = Math.random();

    if (dist > 85) {
      // Mid-range lunge or slide
      if (attackRoll < 0.4) {
        // Heavy Kick / Roundhouse
        this.pressAttack('hk');
        this.comboTimer = 22;
      } else if (attackRoll < 0.75) {
        // Special slide or whirlwind kick
        this.pressAttack('special');
        this.currentInput.down = true; // Special 3 (Whirlwind or Slide)
        this.comboTimer = 26;
      } else {
        // Step forward
        this.currentInput[moveToward] = true;
      }
      return;
    }

    // Close Range Combo Selection
    if (this.comboStep === 0) {
      if (attackRoll < 0.3) {
        // Combo A: Light Punch (Jab)
        this.pressAttack('lp');
        this.comboStep = 1;
        this.comboTimer = 12;
      } else if (attackRoll < 0.55) {
        // Combo B: Low Sweep (Crouch Heavy Kick) - Trips player!
        this.currentInput.down = true;
        this.pressAttack('hk');
        this.comboStep = 0;
        this.comboTimer = 24;
      } else if (attackRoll < 0.75) {
        // Combo C: Heavy Punch straight
        this.pressAttack('hp');
        this.comboStep = 2; // Can cancel into special
        this.comboTimer = 16;
      } else if (attackRoll < 0.9) {
        // Combo D: Light Kick quick poke
        this.pressAttack('lk');
        this.comboStep = 1;
        this.comboTimer = 14;
      } else {
        // Combo E: Dragon Uppercut point-blank
        this.currentInput.up = true;
        this.pressAttack('special');
        this.comboStep = 0;
        this.comboTimer = 30;
      }
    } else if (this.comboStep === 1) {
      // Follow up from Light strike: Heavy strike or Special
      if (attackRoll < 0.5) {
        this.pressAttack('hp');
        this.comboStep = 2;
        this.comboTimer = 16;
      } else {
        this.pressAttack('hk');
        this.comboStep = 0;
        this.comboTimer = 22;
      }
    } else if (this.comboStep === 2) {
      // Special Cancel finish!
      this.pressAttack('special');
      this.comboStep = 0;
      this.comboTimer = 28;
    }
  }

  /**
   * Helper to trigger a crisp attack button press
   */
  private pressAttack(btn: keyof InputState) {
    this.activeAttackButton = btn;
    this.attackPressFrames = 1;
    this.currentInput[btn] = true;
  }
}
