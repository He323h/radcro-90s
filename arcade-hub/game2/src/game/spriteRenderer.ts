import { CharacterDef, FighterState, Projectile, Particle, Rect } from './types';

export class SpriteRenderer {
  /**
   * Draw a fighter with procedural 90s arcade pixel-art aesthetics
   */
  public static drawFighter(
    ctx: CanvasRenderingContext2D,
    fighter: {
      x: number;
      y: number;
      facing: 1 | -1;
      state: FighterState;
      stateTimer: number;
      charDef: CharacterDef;
      isHit: boolean;
      isGuarding: boolean;
      superMeter: number;
      hitstopTimer: number;
      invincible: boolean;
    },
    debugHitboxes: boolean = false,
    activeHitbox: Rect | null = null,
    hurtboxes: Rect[] = []
  ) {
    ctx.save();

    // Invincibility or Hit flash (white silhouette flicker)
    if (fighter.invincible && Math.floor(fighter.stateTimer / 3) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // 1. Draw ground contact shadow
    const isAirborne =
      fighter.state.startsWith('JUMP') ||
      fighter.state === 'SPECIAL_DRAGON' ||
      (fighter.state === 'KNOCKDOWN' && fighter.y < 330);
    const shadowY = 345;
    const shadowDist = Math.max(0, shadowY - fighter.y);
    const shadowScale = Math.max(0.3, 1 - shadowDist / 200);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(fighter.x, shadowY, 36 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Position and flip horizontally based on facing direction
    ctx.translate(fighter.x, fighter.y);
    ctx.scale(fighter.facing, 1);

    // Super aura if meter is full (MAX) or in SUPER_ART
    if (fighter.superMeter >= 100 || fighter.state === 'SUPER_ART') {
      this.drawSuperAura(ctx, fighter.charDef.themeColor, fighter.stateTimer);
    }

    // If hit and in hitstop, slight shudder
    if (fighter.isHit && fighter.hitstopTimer > 0) {
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }

    // White hit flash
    if (fighter.isHit && fighter.stateTimer < 4) {
      ctx.filter = 'brightness(2.5)';
    }

    // Character drawing routines by state
    this.renderCharacterBody(ctx, fighter.charDef, fighter.state, fighter.stateTimer);

    ctx.restore();

    // Debug Hitbox / Hurtbox Overlay
    if (debugHitboxes) {
      this.drawDebugBoxes(ctx, fighter.x, fighter.y, fighter.facing, hurtboxes, activeHitbox);
    }
  }

  /**
   * Procedural anatomy drawing for retro martial artists
   */
  private static renderCharacterBody(
    ctx: CanvasRenderingContext2D,
    char: CharacterDef,
    state: FighterState,
    timer: number
  ) {
    const isRyuga = char.id === 'RYUGA';
    const isKazuma = char.id === 'KAZUMA';

    // Palette Colors
    const skin = char.skinColor;
    const skinShadow = '#c59b6c';
    const giColor = char.primaryColor;
    const giShadow = isRyuga ? '#cbd5e1' : '#0f172a';
    const beltColor = char.secondaryColor;
    const accent = char.accentColor;
    const hair = char.hairColor;

    // Breathing / Idle rhythm
    const breath = Math.sin(timer * 0.12) * 2.5;
    const legStance = Math.sin(timer * 0.12) * 1;

    // Helper pixel block drawer
    const drawRect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };

    // Draw Head
    const drawHead = (hx: number, hy: number, tilt: number = 0) => {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate((tilt * Math.PI) / 180);

      // Hair back
      drawRect(-12, -26, 24, 22, hair);

      // Face
      drawRect(-9, -20, 18, 18, skin);
      drawRect(-9, -8, 16, 6, skinShadow); // Jaw shadow

      // Eyebrows & Eyes
      drawRect(0, -14, 8, 3, '#1e293b'); // Stern brow
      drawRect(2, -11, 4, 3, '#ffffff'); // Sclera
      drawRect(4, -11, 2, 3, '#000000'); // Pupil

      if (isRyuga) {
        // Red Headband
        drawRect(-10, -18, 20, 5, accent);
        // Headband tails fluttering behind
        const wave = Math.sin(timer * 0.25) * 4;
        drawRect(-18, -17 + wave, 9, 4, accent);
        drawRect(-24, -15 + wave * 1.5, 7, 3, accent);
      } else if (isKazuma) {
        // Shinobi mask covering mouth & nose
        drawRect(-8, -11, 17, 10, giColor);
        // Flowing crimson ninja scarf
        const wave = Math.sin(timer * 0.3) * 6;
        drawRect(-16, -10 + wave, 10, 6, accent);
        drawRect(-26, -8 + wave * 1.4, 12, 5, accent);
        drawRect(-36, -6 + wave * 1.8, 12, 4, accent);
      } else {
        // Sakura hair buns & ribbon
        drawRect(-14, -28, 8, 8, hair);
        drawRect(6, -28, 8, 8, hair);
        drawRect(-15, -22, 6, 4, accent);
        drawRect(9, -22, 6, 4, accent);
      }

      ctx.restore();
    };

    // --- State-Specific Rendering ---

    if (state === 'IDLE') {
      // Ready Fighting Stance
      const by = breath;

      // Back Leg
      drawRect(-18, -42, 12, 26, giShadow);
      drawRect(-22, -18, 14, 20, giShadow);
      drawRect(-24, -2, 16, 6, '#0f172a'); // Back foot

      // Front Leg
      drawRect(6, -40, 13, 25, giColor);
      drawRect(10, -18, 14, 20, giColor);
      drawRect(10, -2, 17, 6, '#0f172a'); // Front foot

      // Torso / Gi
      drawRect(-12, -74 + by, 24, 34, giColor);
      drawRect(-10, -68 + by, 10, 26, giShadow); // Gi fold / shadow
      // Exposed chest in V-neck if karate gi
      if (isRyuga) drawRect(-2, -72 + by, 8, 14, skin);

      // Belt
      drawRect(-13, -44 + by, 26, 6, beltColor);
      // Belt tails
      const bWave = Math.sin(timer * 0.15) * 2;
      drawRect(4, -38 + by, 5, 14 + bWave, beltColor);
      drawRect(8, -38 + by, 4, 11 - bWave, beltColor);

      // Back Arm / Fist (guarding chest)
      drawRect(-18, -70 + by, 10, 20, giColor);
      drawRect(-12, -54 + by, 10, 10, skin); // Forearm
      drawRect(-6, -56 + by, 8, 8, accent); // Fist glove

      // Head
      drawHead(0, -78 + by);

      // Front Arm / Lead Guard
      drawRect(6, -68 + by, 11, 18, giColor);
      drawRect(14, -58 + by, 12, 9, skin);
      drawRect(22, -60 + by, 9, 9, accent); // Lead fist
    } else if (state === 'WALK_FWD' || state === 'WALK_BACK') {
      // Stepping cycle
      const cycle = Math.sin(timer * 0.35);
      const bob = Math.abs(Math.sin(timer * 0.35)) * 3;

      // Legs alternating
      const l1 = cycle * 12;
      const l2 = -cycle * 12;

      drawRect(-14 - l1, -40, 12, 24, giShadow);
      drawRect(-16 - l1, -18, 13, 20, giShadow);
      drawRect(-18 - l1, -2, 16, 6, '#0f172a');

      drawRect(4 + l1, -38, 13, 24, giColor);
      drawRect(6 + l1, -16, 14, 18, giColor);
      drawRect(6 + l1, 0, 17, 6, '#0f172a');

      // Torso & head
      drawRect(-11, -74 + bob, 23, 34, giColor);
      drawRect(-12, -43 + bob, 25, 6, beltColor);
      drawHead(2, -78 + bob, state === 'WALK_FWD' ? 4 : -4);

      // Arms swinging
      drawRect(-14 - cycle * 8, -66 + bob, 10, 18, giShadow);
      drawRect(12 + cycle * 8, -64 + bob, 10, 18, giColor);
    } else if (state.startsWith('JUMP')) {
      // Airborne Tuck / Rise
      const tuck = state === 'JUMP_FALL' ? 6 : -4;
      drawRect(-12, -58 + tuck, 24, 28, giColor);
      drawRect(-13, -33 + tuck, 26, 6, beltColor);

      // Legs bent up
      drawRect(-16, -28 + tuck, 14, 16, giShadow);
      drawRect(-4, -28 + tuck, 14, 16, giColor);

      drawHead(0, -64 + tuck, -5);

      // Arms extended
      drawRect(-20, -56 + tuck, 10, 16, giColor);
      drawRect(10, -56 + tuck, 10, 16, giColor);
    } else if (state === 'CROUCH' || state === 'BLOCK_LOW') {
      // Low Crouch Stance
      drawRect(-16, -26, 16, 16, giShadow);
      drawRect(0, -26, 18, 16, giColor);
      drawRect(-18, -12, 38, 12, giColor); // Thighs/hips low

      // Upper body leaned down
      drawRect(-10, -48, 22, 24, giColor);
      drawRect(-11, -26, 24, 5, beltColor);

      drawHead(2, -54, 8);

      if (state === 'BLOCK_LOW') {
        // Cross arms low
        drawRect(4, -44, 16, 12, skin);
        drawRect(12, -44, 10, 10, accent);
        // Guard spark
        this.drawGuardSpark(ctx, 22, -42, timer);
      } else {
        // Low guard fists
        drawRect(8, -42, 10, 12, skin);
        drawRect(14, -42, 8, 8, accent);
      }
    } else if (state === 'BLOCK_HIGH') {
      // High Standing Guard
      drawRect(-14, -42, 12, 26, giShadow);
      drawRect(4, -40, 13, 25, giColor);
      drawRect(-10, -72, 22, 32, giColor);
      drawRect(-11, -43, 24, 6, beltColor);
      drawHead(-2, -76, -5);

      // Arms crossed defensively in front of face
      drawRect(2, -74, 14, 22, giColor);
      drawRect(10, -70, 12, 14, skin);
      drawRect(16, -68, 10, 10, accent);

      // Guard shield effect
      this.drawGuardSpark(ctx, 26, -68, timer);
    } else if (state === 'LIGHT_PUNCH' || state === 'HEAVY_PUNCH') {
      // Straight Punch / Jab
      const isHeavy = state === 'HEAVY_PUNCH';
      const reach = isHeavy ? 48 : 36;
      const stepForward = isHeavy ? 8 : 4;

      // Legs braced
      drawRect(-18, -40, 12, 26, giShadow);
      drawRect(6 + stepForward, -38, 14, 24, giColor);

      // Torso turned into punch
      drawRect(-8 + stepForward, -72, 22, 32, giColor);
      drawRect(-9 + stepForward, -43, 24, 6, beltColor);
      drawHead(2 + stepForward, -77, 3);

      // Extended Punch Arm with speed streak
      ctx.fillStyle = giColor;
      ctx.fillRect(8 + stepForward, -68, 16, 12);
      ctx.fillStyle = skin;
      ctx.fillRect(20 + stepForward, -67, reach - 8, 10);
      // Glove / Fist
      ctx.fillStyle = accent;
      ctx.fillRect(reach + stepForward, -69, 14, 14);

      // Impact speed lines behind fist
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(reach - 14, -66, 10, 2);
      ctx.fillRect(reach - 22, -62, 14, 2);
    } else if (state === 'LIGHT_KICK' || state === 'HEAVY_KICK') {
      // Snappy Front Kick / High Crescent Roundhouse
      const isHeavy = state === 'HEAVY_KICK';
      const kickHeight = isHeavy ? -56 : -38;
      const kickDist = isHeavy ? 50 : 38;

      // Standing on back leg
      drawRect(-12, -42, 14, 28, giShadow);
      drawRect(-14, -16, 15, 18, giShadow);

      // Torso leaned back
      drawRect(-14, -70, 22, 32, giColor);
      drawHead(-10, -78, -10);

      // Kicking Leg extended
      ctx.fillStyle = giColor;
      ctx.fillRect(4, -48, 20, 14);
      ctx.fillStyle = skin;
      ctx.fillRect(22, kickHeight, kickDist - 16, 12);
      ctx.fillStyle = '#0f172a'; // Foot/boot
      ctx.fillRect(kickDist + 4, kickHeight - 2, 14, 14);

      // Kick arc swoosh
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -30, kickDist + 10, -0.6, 0.3);
      ctx.stroke();
    } else if (state === 'CROUCH_PUNCH') {
      // Low Crouch Jab
      drawRect(-16, -26, 16, 16, giShadow);
      drawRect(0, -26, 18, 16, giColor);
      drawRect(-10, -48, 22, 24, giColor);
      drawHead(2, -54);

      // Low extended fist
      drawRect(10, -42, 22, 8, skin);
      drawRect(30, -44, 12, 12, accent);
    } else if (state === 'CROUCH_KICK') {
      // Low Ground Sweep (Trips enemy)
      drawRect(-18, -20, 20, 16, giShadow);
      drawRect(-12, -40, 22, 22, giColor);
      drawHead(-4, -46, 12);

      // Long sweeping leg sliding on the ground
      drawRect(0, -14, 48, 12, giColor);
      drawRect(42, -15, 16, 14, '#0f172a');

      // Ground friction dust
      drawRect(46, -4, 10, 3, 'rgba(255, 255, 255, 0.8)');
      drawRect(32, -2, 8, 2, 'rgba(255, 255, 255, 0.5)');
    } else if (state === 'JUMP_PUNCH' || state === 'JUMP_KICK') {
      // Aerial Attack
      drawRect(-10, -56, 22, 28, giColor);
      drawHead(-2, -62, 5);

      if (state === 'JUMP_PUNCH') {
        drawRect(8, -50, 32, 10, skin);
        drawRect(36, -52, 12, 12, accent);
      } else {
        // Downward angle diving kick
        drawRect(4, -40, 24, 14, giColor);
        drawRect(24, -32, 26, 12, skin);
        drawRect(46, -34, 14, 14, '#0f172a');
      }
    } else if (state === 'SPECIAL_PROJECTILE') {
      // Hadouken / Energy Blast Pose
      // Deep lunging crouch, thrusting both hands forward
      drawRect(-22, -36, 16, 24, giShadow);
      drawRect(2, -34, 16, 22, giColor);
      drawRect(-14, -68, 26, 32, giColor);
      drawRect(-15, -40, 28, 6, beltColor);
      drawHead(2, -74, 12);

      // Both arms thrust out forward
      drawRect(10, -62, 34, 12, giColor);
      drawRect(38, -64, 16, 16, skin);
      drawRect(48, -66, 12, 18, accent);

      // Ki gathering flare at palms
      const flareSize = 14 + Math.sin(timer * 0.4) * 4;
      ctx.fillStyle = char.themeColor;
      ctx.beginPath();
      ctx.arc(58, -56, flareSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(58, -56, flareSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (state === 'SPECIAL_DRAGON') {
      // Shoryuken / Dragon Uppercut
      // Soaring skyward with leading fist
      drawRect(-8, -65, 20, 35, giColor);
      drawHead(0, -82, -15);

      // Front fist stretched straight up to the heavens
      drawRect(4, -85, 12, 24, giColor);
      drawRect(4, -108, 11, 24, skin);
      drawRect(2, -118, 15, 15, accent); // Soaring fist

      // Back arm tucked
      drawRect(-14, -60, 10, 16, giShadow);

      // Trailing legs in leap
      drawRect(-6, -35, 12, 28, giColor);
      drawRect(2, -20, 12, 24, giColor);

      // Fiery Dragon Trail behind rising fist
      this.drawDragonFireTrail(ctx, char.themeColor, timer);
    } else if (state === 'SPECIAL_WHIRLWIND') {
      // Tatsumaki Senpuu Kyaku (Whirlwind Kick)
      // Horizontal spin with both legs out
      const spinAngle = (timer * 0.6) % (Math.PI * 2);
      ctx.save();
      ctx.translate(0, -45);
      ctx.rotate(spinAngle);

      drawRect(-12, -16, 24, 32, giColor);
      drawHead(0, -28);

      // Outstretched legs spinning
      drawRect(-44, -8, 40, 14, giShadow);
      drawRect(8, -8, 42, 14, giColor);

      ctx.restore();

      // Wind gust vortex lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, -45, 52, 16, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state === 'SPECIAL_SLIDE') {
      // Shadow Ninja Slide
      drawRect(-26, -18, 54, 14, giColor);
      drawHead(-24, -28, 20);
      drawRect(20, -18, 36, 12, '#0f172a'); // Extended sliding foot
      // Friction smoke
      drawRect(-32, -6, 14, 6, 'rgba(255,255,255,0.7)');
      drawRect(-14, -4, 18, 4, 'rgba(255,255,255,0.5)');
    } else if (state === 'SUPER_ART') {
      // Super Art Cinematic Strike Pose
      drawRect(-12, -74, 24, 34, giColor);
      drawHead(2, -80, 5);

      // Blazing super fist
      drawRect(8, -70, 38, 14, giColor);
      drawRect(42, -72, 18, 18, accent);

      // Radiant energy corona
      this.drawSuperAura(ctx, '#facc15', timer * 2);
    } else if (state === 'HIT_LIGHT' || state === 'HIT_HEAVY') {
      // Knocked back / hit recoil
      const heavy = state === 'HIT_HEAVY';
      const tilt = heavy ? -18 : -8;
      const recoil = heavy ? -12 : -6;

      ctx.save();
      ctx.translate(recoil, 0);
      ctx.rotate((tilt * Math.PI) / 180);

      drawRect(-14, -40, 14, 26, giShadow);
      drawRect(2, -38, 14, 24, giColor);
      drawRect(-10, -70, 22, 32, giColor);
      drawHead(-6, -78, -12); // Head snapped backward

      // Arms flailed back
      drawRect(-22, -66, 12, 18, skin);
      drawRect(12, -60, 10, 18, skin);

      ctx.restore();
    } else if (state === 'KNOCKDOWN') {
      // Tumbling / Fallen on floor
      ctx.save();
      ctx.translate(-10, -15);
      ctx.rotate((-75 * Math.PI) / 180);

      drawRect(-12, -60, 24, 30, giColor);
      drawHead(0, -74);
      drawRect(-10, -32, 12, 28, giShadow);
      drawRect(2, -32, 12, 28, giColor);

      ctx.restore();
    } else if (state === 'GETUP') {
      // Rolling back up
      drawRect(-14, -28, 28, 18, giColor);
      drawHead(4, -38);
      drawRect(-16, -12, 14, 12, giColor);
      drawRect(6, -12, 14, 12, giColor);
    } else if (state === 'VICTORY') {
      // Classic Win Pose: Arms crossed or Fist pump
      drawRect(-14, -42, 14, 28, giShadow);
      drawRect(4, -40, 14, 26, giColor);
      drawRect(-12, -76, 24, 36, giColor);
      drawRect(-13, -44, 26, 6, beltColor);
      drawHead(0, -84, 0);

      // Arms crossed across chest
      drawRect(-16, -66, 32, 14, giColor);
      drawRect(-6, -64, 14, 10, skin);
      drawRect(4, -64, 10, 10, accent);

      // Flowing headband / scarf celebrating
      const wave = Math.sin(timer * 0.2) * 5;
      drawRect(-18, -82 + wave, 12, 4, accent);
      drawRect(-28, -80 + wave * 1.5, 12, 4, accent);
    } else if (state === 'DEFEAT') {
      // Fallen defeated
      drawRect(-30, -12, 60, 12, giColor);
      drawHead(-26, -18, -40);
      drawRect(-40, -10, 18, 8, giShadow);
    }
  }

  /**
   * Super move golden/blue charging aura
   */
  private static drawSuperAura(ctx: CanvasRenderingContext2D, color: string, timer: number) {
    ctx.save();
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (timer * 0.15 + (i * Math.PI * 2) / count);
      const rad = 42 + Math.sin(timer * 0.3 + i) * 8;
      const px = Math.cos(angle) * rad * 0.7;
      const py = -45 + Math.sin(angle) * rad;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(px, py, 6 + Math.sin(timer * 0.2 + i) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Rising Dragon punch fire trail
   */
  private static drawDragonFireTrail(ctx: CanvasRenderingContext2D, color: string, timer: number) {
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const py = -20 - i * 14;
      const spread = (Math.sin(timer * 0.5 + i) * 8);
      ctx.fillStyle = i % 2 === 0 ? color : '#facc15';
      ctx.globalAlpha = 0.8 - i * 0.1;
      ctx.beginPath();
      ctx.arc(spread, py, 14 - i * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Guard spark shield
   */
  private static drawGuardSpark(ctx: CanvasRenderingContext2D, x: number, y: number, timer: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.85;

    // Hexagonal guard barrier
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + timer * 0.1;
      const r = 20;
      const gx = Math.cos(angle) * r;
      const gy = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  /**
   * Render Flying Projectiles (Hadouken, Kunai)
   */
  public static drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Glowing Trail
    for (let i = 0; i < p.trail.length; i++) {
      const t = p.trail[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = t.alpha * 0.5;
      ctx.beginPath();
      ctx.arc(t.x - p.x, t.y - p.y, t.size * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Aura
    ctx.fillStyle = p.glowColor;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Core Orb / Ki Blast
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner White Hotspot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Energy spikes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (p.life * 0.2 + (i * Math.PI) / 2);
      const ex = Math.cos(angle) * (p.radius + 6);
      const ey = Math.sin(angle) * (p.radius + 6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render Combat Particle effects (Sparks, smoke, hit flashes, sakura petals)
   */
  public static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    ctx.save();
    for (const p of particles) {
      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - progress);
      ctx.globalAlpha = alpha;

      if (p.type === 'spark') {
        // Comic book 4-point impact spark
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s * 2);
        ctx.lineTo(s * 0.5, -s * 0.5);
        ctx.lineTo(s * 2, 0);
        ctx.lineTo(s * 0.5, s * 0.5);
        ctx.lineTo(0, s * 2);
        ctx.lineTo(-s * 0.5, s * 0.5);
        ctx.lineTo(-s * 2, 0);
        ctx.lineTo(-s * 0.5, -s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'sakura') {
        // Fluttering cherry blossom petal
        ctx.fillStyle = '#fbcfe8';
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'super_ring') {
        // Expanding super ring shockwave
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * (1 - progress);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * progress * 3, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Default glowing dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Debug hitbox and hurtbox visualizer
   */
  private static drawDebugBoxes(
    ctx: CanvasRenderingContext2D,
    fx: number,
    fy: number,
    facing: 1 | -1,
    hurtboxes: Rect[],
    activeHitbox: Rect | null
  ) {
    ctx.save();

    // Hurtboxes (Green)
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
    for (const b of hurtboxes) {
      const rx = facing === 1 ? fx + b.x : fx - b.x - b.w;
      const ry = fy + b.y;
      ctx.fillRect(rx, ry, b.w, b.h);
      ctx.strokeRect(rx, ry, b.w, b.h);
    }

    // Active Attack Hitbox (Red)
    if (activeHitbox) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      const hx = facing === 1 ? fx + activeHitbox.x : fx - activeHitbox.x - activeHitbox.w;
      const hy = fy + activeHitbox.y;
      ctx.fillRect(hx, hy, activeHitbox.w, activeHitbox.h);
      ctx.strokeRect(hx, hy, activeHitbox.w, activeHitbox.h);
    }

    ctx.restore();
  }
}
