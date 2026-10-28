/**
 * Blastar Reborn - Canvas 2D Vector & Sprite Renderer
 * AAA Arcade Visual Polish with Banking Ship Tilt, Dynamic Lighting,
 * Shockwaves, Debris, Parallax Celestial Bodies & CRT Vignette.
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
} from './types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  // Clear frame with deep gradient
  public clear(bgColor: string) {
    const ctx = this.ctx;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  // Render Celestial Bodies (Nebulae, Ringed Planet, Cyber Billboards)
  public renderCelestialBodies(bodies: CelestialBody[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      ctx.save();

      if (b.type === 'nebula') {
        // Soft glowing cosmic nebula cloud
        const grad = ctx.createRadialGradient(b.x, b.y, b.size * 0.1, b.x, b.y, b.size);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.5, b.detailColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalAlpha = 0.28;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'planet_ring') {
        // Distant ringed planet
        ctx.translate(b.x, b.y);

        // Planet body
        const grad = ctx.createRadialGradient(-b.size * 0.3, -b.size * 0.3, b.size * 0.1, 0, 0, b.size);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.7, b.detailColor);
        grad.addColorStop(1, '#020617');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, b.size, 0, Math.PI * 2);
        ctx.fill();

        // Planet rings
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
        ctx.lineWidth = b.size * 0.35;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.size * 2.2, b.size * 0.6, -0.35, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.size * 2.3, b.size * 0.63, -0.35, 0, Math.PI * 2);
        ctx.stroke();
      } else if (b.type === 'neon_billboard') {
        // Floating holographic neon billboard in cybercity
        ctx.translate(b.x, b.y);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-b.size, -20, b.size * 2, 40);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(-b.size, -20, b.size * 2, 40);

        ctx.font = 'bold 11px "Orbitron", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.fillText(b.label || 'BLASTAR SECTOR', 0, 0);
      } else if (b.type === 'spore_cluster') {
        // Glowing alien spores
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3 + b.id);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Render 3-Layer Parallax Starfield
  public renderStars(stars: Star[], time: number) {
    const ctx = this.ctx;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      // Twinkle calculation
      const alpha = s.brightness * (0.65 + 0.35 * Math.sin(time * 4 + i));
      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;

      if (s.size > 2) {
        // 4-point cross glare for major bright stars
        ctx.fillRect(s.x - 1, s.y, 3, 1);
        ctx.fillRect(s.x, s.y - 1, 1, 3);
      } else {
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  // Render Stage-specific Environments (Caverns or Cyber Ruins)
  public renderEnvironment(stage: StageConfig, scrollOffset: number, time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (stage.theme === 'alien_cavern') {
      ctx.save();
      // Cavern rock gradients
      const leftGrad = ctx.createLinearGradient(0, 0, 80, 0);
      leftGrad.addColorStop(0, '#022c22');
      leftGrad.addColorStop(1, '#064e3b');

      const rightGrad = ctx.createLinearGradient(w, 0, w - 80, 0);
      rightGrad.addColorStop(0, '#022c22');
      rightGrad.addColorStop(1, '#064e3b');

      // Left cavern wall with jagged organic spikes
      ctx.fillStyle = leftGrad;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#059669';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let y = 0; y <= h; y += 30) {
        const wallW =
          35 +
          Math.sin((y + scrollOffset) * 0.015) * 25 +
          Math.cos((y + scrollOffset) * 0.038) * 16 +
          Math.sin((y + scrollOffset) * 0.09) * 6;
        ctx.lineTo(wallW, y);
      }
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right cavern wall
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(w, 0);
      for (let y = 0; y <= h; y += 30) {
        const wallW =
          35 +
          Math.cos((y + scrollOffset) * 0.018) * 25 +
          Math.sin((y + scrollOffset) * 0.035) * 16 +
          Math.cos((y + scrollOffset) * 0.08) * 6;
        ctx.lineTo(w - wallW, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing bio-luminescent crystals
      const spacing = 140;
      const offset = (scrollOffset * 0.8) % spacing;
      for (let y = -offset; y < h + 120; y += spacing) {
        // Left crystal cluster
        ctx.fillStyle = '#6ee7b7';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(42, y);
        ctx.lineTo(58, y - 14);
        ctx.lineTo(66, y);
        ctx.lineTo(52, y + 16);
        ctx.closePath();
        ctx.fill();

        // Right crystal cluster
        ctx.beginPath();
        ctx.moveTo(w - 42, y + 70);
        ctx.lineTo(w - 60, y + 54);
        ctx.lineTo(w - 68, y + 70);
        ctx.lineTo(w - 52, y + 84);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    } else if (stage.theme === 'cyber_ruins') {
      ctx.save();
      // Cybernetic spires & searchlight beams
      const beamX = w * 0.5 + Math.sin(time * 0.8) * (w * 0.35);
      const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 60, h);
      beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX - 40, 0);
      ctx.lineTo(beamX + 100, 0);
      ctx.lineTo(beamX + 280, h);
      ctx.lineTo(beamX - 140, h);
      ctx.closePath();
      ctx.fill();

      // Scaffolding on flanks
      const gridSpacing = 70;
      const yOffset = scrollOffset % gridSpacing;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;

      for (let y = -yOffset; y < h + gridSpacing; y += gridSpacing) {
        // Left truss
        ctx.strokeRect(4, y, 55, gridSpacing);
        ctx.beginPath();
        ctx.moveTo(4, y);
        ctx.lineTo(59, y + gridSpacing);
        ctx.moveTo(59, y);
        ctx.lineTo(4, y + gridSpacing);
        ctx.stroke();

        // Right truss
        ctx.strokeRect(w - 59, y, 55, gridSpacing);
        ctx.beginPath();
        ctx.moveTo(w - 59, y);
        ctx.lineTo(w - 4, y + gridSpacing);
        ctx.moveTo(w - 4, y);
        ctx.lineTo(w - 59, y + gridSpacing);
        ctx.stroke();
      }

      // Neon warning markers on ruins
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.globalAlpha = 0.8;
      for (let y = -yOffset; y < h + gridSpacing; y += gridSpacing * 2) {
        ctx.fillRect(57, y + 10, 4, 8);
        ctx.fillRect(w - 61, y + 10, 4, 8);
      }

      ctx.restore();
    }
  }

  // Render Player Ship with Sleek Aerospace Rocket Detailing & Shock Diamonds
  public renderPlayer(player: Player, time: number) {
    const ctx = this.ctx;
    const { x, y, width, height, invulnerableTimer, tilt } = player;

    // Flash when invulnerable
    if (invulnerableTimer > 0 && Math.floor(time * 26) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(x, y);

    // Apply banking roll rotation when maneuvering
    ctx.rotate(tilt * 0.22);

    // --- Dynamic Rocket Propulsion Engine Exhaust ---
    const flameHeight = 22 + Math.random() * 14;
    const flameWidth = 8;
    const thrusterY = height / 2 - 2;

    // Left & Right Rocket Exhaust Plumes
    [-14, 14].forEach((tx) => {
      // Outer Orange/Gold Flame Plume
      const flameGrad = ctx.createLinearGradient(tx, thrusterY, tx, thrusterY + flameHeight);
      flameGrad.addColorStop(0, '#facc15');
      flameGrad.addColorStop(0.4, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = flameGrad;
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(tx - flameWidth / 2, thrusterY);
      ctx.lineTo(tx + flameWidth / 2, thrusterY);
      ctx.lineTo(tx, thrusterY + flameHeight);
      ctx.closePath();
      ctx.fill();

      // Inner Hot Blue Ion Core & Mach Shock Diamonds
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(tx - 3, thrusterY);
      ctx.lineTo(tx + 3, thrusterY);
      ctx.lineTo(tx, thrusterY + flameHeight * 0.65);
      ctx.closePath();
      ctx.fill();

      // Mach Diamond shockwave
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(tx, thrusterY + 6);
      ctx.lineTo(tx + 2.5, thrusterY + 9);
      ctx.lineTo(tx, thrusterY + 12);
      ctx.lineTo(tx - 2.5, thrusterY + 9);
      ctx.closePath();
      ctx.fill();

      // Rocket Nozzle Bell
      ctx.fillStyle = '#334155';
      ctx.fillRect(tx - 4.5, thrusterY - 4, 9, 5);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(tx - 3.5, thrusterY - 1, 7, 2);
    });

    // --- Main Fighter Rocket Fuselage & Wings ---
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 14;

    // Swept Variable Delta Wings (Vibrant Orange & Titanium Gunmetal)
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(0, -height / 2 - 2); // Sharp needle nose
    ctx.lineTo(6, -height / 3); // Forward chine
    ctx.lineTo(width / 2, height / 2 - 6); // Right wingtip
    ctx.lineTo(width / 2 - 4, height / 2); // Wingtip trailing edge
    ctx.lineTo(width / 4, height / 2 - 2);
    ctx.lineTo(12, height / 2 - 6);
    ctx.lineTo(0, height / 2 - 2); // Tail apex
    ctx.lineTo(-12, height / 2 - 6);
    ctx.lineTo(-width / 4, height / 2 - 2);
    ctx.lineTo(-width / 2 + 4, height / 2);
    ctx.lineTo(-width / 2, height / 2 - 6); // Left wingtip
    ctx.lineTo(-6, -height / 3); // Left chine
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Solar Gold & Amber Armor Chevrons
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, -height / 2 + 6);
    ctx.lineTo(width / 2 - 8, height / 2 - 8);
    ctx.lineTo(width / 2 - 14, height / 2 - 8);
    ctx.lineTo(0, -height / 4);
    ctx.lineTo(-width / 2 + 14, height / 2 - 8);
    ctx.lineTo(-width / 2 + 8, height / 2 - 8);
    ctx.closePath();
    ctx.fill();

    // Carbon-Titanium Center Fuselage Spine
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(5, -height / 6);
    ctx.lineTo(6, height / 3);
    ctx.lineTo(0, height / 2 - 4);
    ctx.lineTo(-6, height / 3);
    ctx.lineTo(-5, -height / 6);
    ctx.closePath();
    ctx.fill();

    // Forward Canards (aerodynamic control surfaces)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-5, -height / 4);
    ctx.lineTo(-14, -height / 6);
    ctx.lineTo(-6, -height / 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(5, -height / 4);
    ctx.lineTo(14, -height / 6);
    ctx.lineTo(6, -height / 8);
    ctx.closePath();
    ctx.fill();

    // Wing Energy Conduits (Illuminated cyan circuits)
    ctx.strokeStyle = '#38bdf8';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 12, height / 2 - 10);
    ctx.lineTo(-10, 2);
    ctx.lineTo(-5, 12);
    ctx.moveTo(width / 2 - 12, height / 2 - 10);
    ctx.lineTo(10, 2);
    ctx.lineTo(5, 12);
    ctx.stroke();

    // Dual Heavy Wingtip Plasma Cannons
    [-width / 2 + 1, width / 2 - 6].forEach((cx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx, -height / 4 - 4, 5, height / 2 + 4);
      // Cannon muzzle heat shroud
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillRect(cx, -height / 4 - 8, 5, 4);
    });

    // High-Tech Curved Sapphire Cockpit Canopy
    const canopyGrad = ctx.createLinearGradient(0, -height / 4, 0, 5);
    canopyGrad.addColorStop(0, '#38bdf8');
    canopyGrad.addColorStop(0.4, '#0284c7');
    canopyGrad.addColorStop(1, '#082f49');

    ctx.fillStyle = canopyGrad;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, -height / 9, 6.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pilot HUD Hologram & Glass Glare
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -height / 9, 2.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-2.2, -height / 9 - 4, 2.2, 6, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Active Hexagonal Energy Deflector Shield Matrix
    if (player.shield > 0) {
      const shieldAlpha =
        player.invulnerableTimer > 0 ? 0.8 : 0.18 + (player.shield / player.maxShield) * 0.25;
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2;
      ctx.globalAlpha = shieldAlpha;

      // Hexagonal outer shield perimeter
      const sRadius = Math.max(width, height) * 0.78;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const hx = Math.cos(ang) * sRadius;
        const hy = Math.sin(ang) * sRadius;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();

      // Energy ripple arc
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, sRadius + Math.sin(time * 9) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render Enemy 1: Heavy Assault Battlecruiser (Upgraded Graphic Design)
  public renderCruiser(enemy: Enemy, time: number) {
    const ctx = this.ctx;
    const { x, y, width, height, maxHp, hp } = enemy;

    ctx.save();
    ctx.translate(x, y);

    // Dynamic Engine Exhaust behind cruiser
    [-width / 3.5, width / 3.5].forEach((ex) => {
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(ex - 3, -height / 2 + 2);
      ctx.lineTo(ex + 3, -height / 2 + 2);
      ctx.lineTo(ex, -height / 2 - (12 + Math.random() * 8));
      ctx.closePath();
      ctx.fill();
    });

    // Heavy Stealth Armor Chassis (Faceted Titanium)
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    ctx.moveTo(0, height / 2 + 3); // Reinforced prow
    ctx.lineTo(width / 2.2, 0); // Forward wing
    ctx.lineTo(width / 2, -height / 4);
    ctx.lineTo(width / 3, -height / 2); // Engine nacelle
    ctx.lineTo(width / 5, -height / 3);
    ctx.lineTo(0, -height / 2 + 4); // Rear spine
    ctx.lineTo(-width / 5, -height / 3);
    ctx.lineTo(-width / 3, -height / 2); // Left engine nacelle
    ctx.lineTo(-width / 2, -height / 4);
    ctx.lineTo(-width / 2.2, 0); // Forward wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crimson Combat Plating & Inlay
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - 6);
    ctx.lineTo(width / 3.2, -4);
    ctx.lineTo(-width / 3.2, -4);
    ctx.closePath();
    ctx.fill();

    // Glowing Bridge Sensor Visor / Cyclops Eye
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 12;
    ctx.fillRect(-10, height / 4 - 2, 20, 3.5);

    // Twin Heavy Plasma Cannons
    [-width / 3.2, width / 3.2].forEach((cx) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx - 2.5, 0, 5, height / 2 - 2);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(cx - 2.5, height / 2 - 4, 5, 4);
    });

    // Pulsing Antimatter Containment Reactor
    const pulseAlpha = 0.65 + 0.35 * Math.sin(time * 8 + enemy.id);
    ctx.fillStyle = `rgba(239, 68, 68, ${pulseAlpha})`;
    ctx.beginPath();
    ctx.arc(0, -4, 7.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, -4, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Flashing Strobe Warning Beacons
    const strobe = Math.floor(time * 6 + enemy.id) % 2 === 0;
    ctx.fillStyle = strobe ? '#ffffff' : '#ef4444';
    ctx.fillRect(-width / 2.2 + 2, -height / 4, 3, 3);
    ctx.fillRect(width / 2.2 - 5, -height / 4, 3, 3);

    // Damage Smoke
    if (hp < maxHp * 0.5) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.beginPath();
      ctx.arc(Math.sin(time * 9) * 8, -height / 2 - 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Health Bar
    if (hp < maxHp) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(-22, -height / 2 - 14, 44, 4);
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 5;
      ctx.fillRect(-22, -height / 2 - 14, 44 * (hp / maxHp), 4);
    }

    ctx.restore();
  }

  // Render Enemy 2: Cyber Skull Hazard (Upgraded Graphic Design)
  public renderSkull(enemy: Enemy, time: number) {
    const ctx = this.ctx;
    const { x, y, width, height } = enemy;

    ctx.save();
    ctx.translate(x, y);

    // Undulating menacing tilt
    ctx.rotate(Math.sin(time * 4.5 + enemy.id) * 0.2);

    // Demonic Shadow Aura behind skull
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 18;

    // Polished Titanium Cranial Plates
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.arc(0, -height / 6, width / 2.2, Math.PI, 0, false);
    // Cheekbone struts
    ctx.lineTo(width / 2.3, height / 10);
    ctx.lineTo(width / 3.4, height / 3.2); // Jaw socket
    ctx.lineTo(width / 4, height / 2 + 2); // Chin right
    ctx.lineTo(-width / 4, height / 2 + 2); // Chin left
    ctx.lineTo(-width / 3.4, height / 3.2); // Jaw socket left
    ctx.lineTo(-width / 2.3, height / 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Etched Cybernetic Circuit Lines
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -height / 2 + 4);
    ctx.lineTo(0, -height / 10);
    ctx.moveTo(-width / 3, -height / 4);
    ctx.lineTo(-width / 6, -height / 8);
    ctx.moveTo(width / 3, -height / 4);
    ctx.lineTo(width / 6, -height / 8);
    ctx.stroke();

    // Deep Robotic Eye Sockets
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(-width / 4.4, -height / 10, 6, 8, -0.15, 0, Math.PI * 2);
    ctx.ellipse(width / 4.4, -height / 10, 6, 8, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Burning Crimson Photoreceptors with Crosshair Flares
    [-width / 4.4, width / 4.4].forEach((ox) => {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(ox, -height / 10, 3, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent pupil
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox, -height / 10, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Chrome Razor Teeth
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-width / 4.5, height / 4 + 2, width / 2.25, 7);
    ctx.fillStyle = '#ffffff';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(i * 4 - 1.2, height / 4 + 2, 2.4, 7);
    }

    ctx.restore();
  }

  // Render Enemy 3: Solar Corona Plasma Anomaly (Upgraded Graphic Design)
  public renderPlasma(enemy: Enemy, time: number) {
    const ctx = this.ctx;
    const { x, y, width } = enemy;
    const radius = width / 2;

    ctx.save();
    ctx.translate(x, y);

    // Multi-Frequency Rotation
    ctx.rotate(time * 2.5 + enemy.id);

    // Vibrant Multi-Layer Solar Gradient
    const grad = ctx.createRadialGradient(0, 0, radius * 0.15, 0, 0, radius * 1.6);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, '#fef08a');
    grad.addColorStop(0.55, '#f97316');
    grad.addColorStop(0.85, '#dc2626');
    grad.addColorStop(1, 'rgba(220, 38, 38, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Arcing Solar Prominence Loops & Coronal Spikes
    const flareCount = 12;
    ctx.fillStyle = '#ea580c';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 18;

    for (let i = 0; i < flareCount; i++) {
      const angle = (i * Math.PI * 2) / flareCount;
      const spikeLen = radius * (1.2 + 0.4 * Math.sin(time * 10 + i * 2.2));
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.22) * (radius * 0.7), Math.sin(angle - 0.22) * (radius * 0.7));
      ctx.lineTo(Math.cos(angle) * spikeLen, Math.sin(angle) * spikeLen);
      ctx.lineTo(Math.cos(angle + 0.22) * (radius * 0.7), Math.sin(angle + 0.22) * (radius * 0.7));
      ctx.closePath();
      ctx.fill();
    }

    // Incandescent Fusion Nucleus
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting mini plasma particles
    for (let i = 0; i < 4; i++) {
      const ang = time * 4 + (i * Math.PI) / 2;
      const d = radius * 1.25;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * d, Math.sin(ang) * d, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Render Projectiles: Graphic Designed Laser Beams & Plasma Bolts
  public renderProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      ctx.save();

      if (p.isEnemy) {
        // --- High-End Graphic Designed Enemy Laser Beams ---
        if (p.beamType === 'lance') {
          // Heavy Cruiser Energy Lance (Tapered laser slug with intense core)
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 18;

          // Outer energy bloom
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.radius * 2, p.radius * 4.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Main Crimson Lance
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + p.radius * 4); // Arrow prow
          ctx.lineTo(p.x + p.radius * 1.6, p.y);
          ctx.lineTo(p.x, p.y - p.radius * 3);
          ctx.lineTo(p.x - p.radius * 1.6, p.y);
          ctx.closePath();
          ctx.fill();

          // White-Pink Incandescent Needle Core
          ctx.fillStyle = '#fdf2f8';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + p.radius * 3);
          ctx.lineTo(p.x + p.radius * 0.7, p.y);
          ctx.lineTo(p.x, p.y - p.radius * 2);
          ctx.lineTo(p.x - p.radius * 0.7, p.y);
          ctx.closePath();
          ctx.fill();

          // Trailing Speed Wake Streak
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = p.radius * 1.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y - 20);
          ctx.stroke();
        } else if (p.beamType === 'needle') {
          // Skull Targeted Energy Needle (Sharp piercing bolt)
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 16;

          // Piercing diamond projectile
          const angle = Math.atan2(p.vy, p.vx);
          ctx.translate(p.x, p.y);
          ctx.rotate(angle);

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(p.radius * 3, 0); // Prow
          ctx.lineTo(0, p.radius * 1.4);
          ctx.lineTo(-p.radius * 3, 0);
          ctx.lineTo(0, -p.radius * 1.4);
          ctx.closePath();
          ctx.fill();

          // Bright white center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.9, 0, Math.PI * 2);
          ctx.fill();

          // Trailing speed line
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-24, 0);
          ctx.stroke();
        } else if (p.beamType === 'meteor') {
          // Plasma Radiant Mini-Meteor (Swirling Fireball)
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 18;

          // Flaming comet tail
          const tailGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y - 22);
          tailGrad.addColorStop(0, '#f97316');
          tailGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          ctx.fillStyle = tailGrad;
          ctx.beginPath();
          ctx.moveTo(p.x - p.radius * 1.5, p.y);
          ctx.lineTo(p.x + p.radius * 1.5, p.y);
          ctx.lineTo(p.x, p.y - 22);
          ctx.closePath();
          ctx.fill();

          // Fiery outer sphere
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Molten yellow core
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.85, 0, Math.PI * 2);
          ctx.fill();

          // White incandescent heart
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard upgraded crimson bolt
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.roundRect(p.x - p.radius, p.y - p.radius * 2, p.radius * 2, p.radius * 4, 3);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(p.x - p.radius * 0.5, p.y - p.radius * 1.2, p.radius, p.radius * 2.4, 2);
          ctx.fill();
        }
      } else {
        // --- High-End Player Cyan Plasma Photon Lasers ---
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 16;

        // Elongated rounded laser bolt with energy halo
        ctx.beginPath();
        ctx.roundRect(p.x - p.radius, p.y - p.radius * 2.6, p.radius * 2, p.radius * 5.2, 4);
        ctx.fill();

        // Speed light-trail streak
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = p.radius * 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + 18);
        ctx.stroke();

        // White-hot inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(p.x - p.radius * 0.45, p.y - p.radius * 1.8, p.radius * 0.9, p.radius * 3.6, 2.5);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Render Power-ups (Beating Heart & Swirling Dual Blue Flame Orb)
  public renderPowerUps(powerups: PowerUp[], time: number) {
    const ctx = this.ctx;

    for (let i = 0; i < powerups.length; i++) {
      const item = powerups[i];
      const bob = Math.sin(time * 5 + item.bobTimer) * 4;
      const x = item.x;
      const y = item.y + bob;

      ctx.save();
      ctx.translate(x, y);

      if (item.type === 'heart') {
        // Double-thump heartbeat scale
        const beatCycle = (time * 2.5) % 1;
        let heartScale = 1.0;
        if (beatCycle < 0.15) {
          heartScale = 1.25;
        } else if (beatCycle < 0.3) {
          heartScale = 1.15;
        }

        ctx.scale(heartScale, heartScale);
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 16;

        // Outer halo
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Heart shape
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.bezierCurveTo(0, -6, -11, -6, -11, 0);
        ctx.bezierCurveTo(-11, 7, 0, 12, 0, 15);
        ctx.bezierCurveTo(0, 12, 11, 7, 11, 0);
        ctx.bezierCurveTo(11, -6, 0, -6, 0, 5);
        ctx.closePath();
        ctx.fill();

        // Specular gleam
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Swirling Dual Blue Flames Orb
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 16;

        // Orbiting satellites
        const satAngle = time * 6.5 + item.id;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(Math.cos(satAngle) * 16, Math.sin(satAngle) * 16, 3, 0, Math.PI * 2);
        ctx.arc(Math.cos(satAngle + Math.PI) * 16, Math.sin(satAngle + Math.PI) * 16, 3, 0, Math.PI * 2);
        ctx.fill();

        // Outer energy boundary
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling blue vortex core
        const coreScale = 0.85 + 0.2 * Math.sin(time * 8);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, 0, 9 * coreScale, 0, Math.PI * 2);
        ctx.fill();

        // Star core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Render Shockwaves
  public renderShockwaves(shockwaves: Shockwave[]) {
    const ctx = this.ctx;
    for (let i = 0; i < shockwaves.length; i++) {
      const sw = shockwaves[i];
      ctx.save();
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = sw.lineWidth;

      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Render Flying Debris
  public renderDebris(debrisList: Debris[]) {
    const ctx = this.ctx;
    for (let i = 0; i < debrisList.length; i++) {
      const d = debrisList[i];
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.moveTo(-d.size, -d.size / 2);
      ctx.lineTo(d.size, -d.size / 3);
      ctx.lineTo(d.size / 2, d.size);
      ctx.lineTo(-d.size / 2, d.size / 2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  // Render Particles
  public renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.isSpark ? 10 : 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Render Floating Texts
  public renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 13px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < texts.length; i++) {
      const ft = texts[i];
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }

  // Render CRT Scanlines & Vignette
  public renderScanlines() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < this.height; y += 4) {
      ctx.fillRect(0, y, this.width, 1.5);
    }

    // Vignette
    const grad = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.35,
      this.width / 2,
      this.height / 2,
      this.width * 0.75
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }
}
