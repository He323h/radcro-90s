/**
 * High-performance 2D Canvas rendering routines for Road Fighter Retro.
 * Pixel-accurate, clean vector/pixel hybrid arcade aesthetics.
 */

import { 
  PlayerCar, 
  Vehicle, 
  RoadHazard, 
  FuelCollectible, 
  SceneryProp, 
  FloatingCombatText,
  Bullet,
  WeatherParticle,
  WeatherMode
} from './types';

// ============================================================================
// 1. PLAYER CAR (Sleek Blue Sports Car)
// ============================================================================
export function drawPlayerCar(
  ctx: CanvasRenderingContext2D,
  car: PlayerCar,
  screenX: number,
  screenY: number
) {
  ctx.save();

  // Jump altitude vertical offset & 3D scaling
  const isJumping = (car.jumpAltitude || 0) > 0;
  const jumpOffset = isJumping ? car.jumpAltitude * 40 : 0;
  const jumpScale = isJumping ? 1 + car.jumpAltitude * 0.28 : 1.0;

  // Ground Shadow (stays on road even when car is high in the air!)
  const w = car.width;
  const h = car.height;
  const hw = w / 2;
  const hh = h / 2;

  ctx.save();
  ctx.translate(screenX + hw, screenY + hh + 4);
  const shadowAlpha = isJumping ? Math.max(0.15, 0.45 - car.jumpAltitude * 0.25) : 0.45;
  const shadowScale = isJumping ? 1 + car.jumpAltitude * 0.4 : 1.0;
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, (hw + 4) * shadowScale, (hh + 2) * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Car chassis translate (with jump lift)
  ctx.translate(screenX + hw, screenY + hh - jumpOffset);
  ctx.scale(jumpScale, jumpScale);

  // Apply tilt/skid angle
  ctx.rotate(car.angle);

  // Flash when recovering/invincible
  if (car.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  // Side Slam Thruster Blast!
  if (car.slamTimer > 0 && car.slamDirection) {
    const isLeft = car.slamDirection === 'left';
    ctx.save();
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    const thrustX = isLeft ? hw + 2 : -hw - 2;
    const pointX = isLeft ? hw + 22 : -hw - 22;
    ctx.moveTo(thrustX, -10);
    ctx.lineTo(pointX, 0);
    ctx.lineTo(thrustX, 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Wheels (4 tires)
  ctx.fillStyle = '#111827';
  const tireW = 7;
  const tireH = 15;
  // Front-left
  ctx.fillRect(-hw - 1, -hh + 8, tireW, tireH);
  // Front-right
  ctx.fillRect(hw - tireW + 1, -hh + 8, tireW, tireH);
  // Rear-left
  ctx.fillRect(-hw - 1, hh - 22, tireW, tireH);
  // Rear-right
  ctx.fillRect(hw - tireW + 1, hh - 22, tireW, tireH);

  // Wheels rim highlight
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-hw + 1, -hh + 12, 3, 7);
  ctx.fillRect(hw - 4, -hh + 12, 3, 7);
  ctx.fillRect(-hw + 1, hh - 18, 3, 7);
  ctx.fillRect(hw - 4, hh - 18, 3, 7);

  // Main chassis (Sleek Blue Sports Car)
  // Base body: Royal Blue
  const bodyGrad = ctx.createLinearGradient(-hw, 0, hw, 0);
  bodyGrad.addColorStop(0, '#1d4ed8');
  bodyGrad.addColorStop(0.3, '#3b82f6');
  bodyGrad.addColorStop(0.7, '#60a5fa');
  bodyGrad.addColorStop(1, '#1e40af');
  ctx.fillStyle = bodyGrad;

  ctx.beginPath();
  ctx.roundRect(-hw + 2, -hh, w - 4, h, [12, 12, 6, 6]);
  ctx.fill();

  // White center racing stripe
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-3, -hh + 2, 6, h - 4);

  // Hood scoop / air vent
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-5, -hh + 14, 10, 8, 2);
  ctx.fill();

  // Front Windshield
  const glassGrad = ctx.createLinearGradient(0, -hh + 24, 0, -hh + 38);
  glassGrad.addColorStop(0, '#0f172a');
  glassGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.roundRect(-hw + 7, -hh + 24, w - 14, 14, [4, 4, 1, 1]);
  ctx.fill();

  // Windshield reflection glare
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.moveTo(-hw + 10, -hh + 26);
  ctx.lineTo(-hw + 16, -hh + 26);
  ctx.lineTo(-hw + 11, -hh + 36);
  ctx.lineTo(-hw + 8, -hh + 36);
  ctx.closePath();
  ctx.fill();

  // Roof
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(-hw + 7, -hh + 38, w - 14, 16);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-3, -hh + 38, 6, 16);

  // Rear Window
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-hw + 7, -hh + 54, w - 14, 9, [1, 1, 3, 3]);
  ctx.fill();

  // Rear Spoiler / Wing
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-hw + 1, hh - 7, w - 2, 6);
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(-hw + 4, hh - 6, w - 8, 2);

  // Headlights (Front)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-hw + 4, -hh + 1, 6, 4);
  ctx.fillRect(hw - 10, -hh + 1, 6, 4);

  // Twin Hood-Mounted Machine Guns
  ctx.fillStyle = '#334155';
  ctx.fillRect(-hw + 8, -hh - 4, 3, 6);
  ctx.fillRect(hw - 11, -hh - 4, 3, 6);

  // Muzzle Flashes when firing
  if ((car.shootCooldown || 0) > 0.08) {
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-hw + 9.5, -hh - 6, 4, 0, Math.PI * 2);
    ctx.arc(hw - 9.5, -hh - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Armored Spiked Cowcatcher Ram (Active Power-up!)
  if (car.shieldBumperTimer > 0) {
    ctx.save();
    ctx.fillStyle = '#e2e8f0';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    // Heavy steel bumper
    ctx.fillRect(-hw - 3, -hh - 5, w + 6, 6);
    // Ram spikes
    ctx.fillStyle = '#94a3b8';
    for (let sx = -hw; sx <= hw - 6; sx += 8) {
      ctx.beginPath();
      ctx.moveTo(sx, -hh - 5);
      ctx.lineTo(sx + 3, -hh - 12);
      ctx.lineTo(sx + 6, -hh - 5);
      ctx.fill();
    }
    ctx.restore();
  }

  // Tail Lights (Rear) - glow intensely on brake!
  if (car.brakeLightsOn) {
    ctx.fillStyle = '#ff2222';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillRect(-hw + 3, hh - 3, 8, 4);
    ctx.fillRect(hw - 11, hh - 3, 8, 4);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-hw + 4, hh - 2, 6, 3);
    ctx.fillRect(hw - 10, hh - 2, 6, 3);
  }

  // Turbo Exhaust Flames!
  if (car.boostTimer > 0 || car.speedKmH > 320) {
    const flameLen = car.boostTimer > 0 ? 20 + Math.random() * 12 : 10 + Math.random() * 8;
    const flameColor = car.boostTimer > 0 ? '#38bdf8' : '#f97316';
    ctx.fillStyle = flameColor;
    ctx.shadowColor = flameColor;
    ctx.shadowBlur = 8;
    // Left flame
    ctx.beginPath();
    ctx.moveTo(-hw + 6, hh);
    ctx.lineTo(-hw + 9, hh + flameLen);
    ctx.lineTo(-hw + 12, hh);
    ctx.fill();
    // Right flame
    ctx.beginPath();
    ctx.moveTo(hw - 12, hh);
    ctx.lineTo(hw - 9, hh + flameLen);
    ctx.lineTo(hw - 6, hh);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ============================================================================
// 2. TRAFFIC VEHICLES
// ============================================================================
export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  veh: Vehicle,
  screenX: number,
  screenY: number
) {
  ctx.save();
  ctx.translate(screenX + veh.width / 2, screenY + veh.height / 2);

  const hw = veh.width / 2;
  const hh = veh.height / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 3, hw + 3, hh + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (veh.type) {
    case 'yellow_sedan': {
      // Classic Road Fighter Yellow Taxi / Commuter Car
      // Wheels
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-hw - 1, -hh + 7, 6, 14);
      ctx.fillRect(hw - 5, -hh + 7, 6, 14);
      ctx.fillRect(-hw - 1, hh - 20, 6, 14);
      ctx.fillRect(hw - 5, hh - 20, 6, 14);

      // Body: Bright Yellow with orange side shadow
      const grad = ctx.createLinearGradient(-hw, 0, hw, 0);
      grad.addColorStop(0, '#eab308');
      grad.addColorStop(0.3, '#facc15');
      grad.addColorStop(0.7, '#fef08a');
      grad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, veh.height, [8, 8, 4, 4]);
      ctx.fill();

      // Front & Rear Glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 6, -hh + 20, veh.width - 12, 12);
      ctx.fillRect(-hw + 6, hh - 24, veh.width - 12, 9);

      // Roof
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-hw + 6, -hh + 32, veh.width - 12, 14);

      // Headlights & Tail lights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-hw + 4, -hh + 1, 5, 3);
      ctx.fillRect(hw - 9, -hh + 1, 5, 3);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-hw + 4, hh - 3, 5, 3);
      ctx.fillRect(hw - 9, hh - 3, 5, 3);
      break;
    }

    case 'red_sport': {
      // Fast Aggressive Red Sports Car with turn blinkers!
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-hw - 1, -hh + 8, 6, 14);
      ctx.fillRect(hw - 5, -hh + 8, 6, 14);
      ctx.fillRect(-hw - 1, hh - 21, 6, 14);
      ctx.fillRect(hw - 5, hh - 21, 6, 14);

      // Red Body with sports styling
      const grad = ctx.createLinearGradient(-hw, 0, hw, 0);
      grad.addColorStop(0, '#b91c1c');
      grad.addColorStop(0.4, '#ef4444');
      grad.addColorStop(0.8, '#f87171');
      grad.addColorStop(1, '#991b1b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, veh.height, [10, 10, 5, 5]);
      ctx.fill();

      // Black sport stripes
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-2, -hh + 2, 4, veh.height - 4);

      // Glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 6, -hh + 22, veh.width - 12, 14);
      ctx.fillRect(-hw + 6, hh - 22, veh.width - 12, 8);

      // Spoiler
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-hw + 1, hh - 5, veh.width - 2, 4);

      // Blinkers (Flashing when changing lane)
      const blinkOn = Math.floor(Date.now() / 150) % 2 === 0;
      if (veh.blinkSide === 'left' && blinkOn) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fillRect(-hw - 3, -hh + 2, 5, 5);
        ctx.fillRect(-hw - 3, hh - 7, 5, 5);
        ctx.shadowBlur = 0;
      } else if (veh.blinkSide === 'right' && blinkOn) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fillRect(hw - 2, -hh + 2, 5, 5);
        ctx.fillRect(hw - 2, hh - 7, 5, 5);
        ctx.shadowBlur = 0;
      }

      // Lights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-hw + 3, -hh + 1, 5, 3);
      ctx.fillRect(hw - 8, -hh + 1, 5, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-hw + 3, hh - 2, 5, 3);
      ctx.fillRect(hw - 8, hh - 2, 5, 3);
      break;
    }

    case 'cargo_truck': {
      // Big Heavy Freight / Container Truck
      // 6 or 8 Wheels
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-hw - 2, -hh + 8, 7, 18);
      ctx.fillRect(hw - 5, -hh + 8, 7, 18);
      ctx.fillRect(-hw - 2, hh - 38, 7, 18);
      ctx.fillRect(hw - 5, hh - 38, 7, 18);
      ctx.fillRect(-hw - 2, hh - 18, 7, 18);
      ctx.fillRect(hw - 5, hh - 18, 7, 18);

      // Front Truck Cab
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, 34, [6, 6, 2, 2]);
      ctx.fill();

      // Front windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 6, -hh + 10, veh.width - 12, 10);

      // Chrome grill
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-hw + 8, -hh + 1, veh.width - 16, 5);

      // Big Long Cargo Container Body
      const containerColor = veh.color || '#d97706';
      ctx.fillStyle = containerColor;
      ctx.beginPath();
      ctx.roundRect(-hw + 1, -hh + 36, veh.width - 2, veh.height - 38, 3);
      ctx.fill();

      // Corrugated container lines
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 2;
      for (let y = -hh + 44; y < hh - 6; y += 10) {
        ctx.beginPath();
        ctx.moveTo(-hw + 3, y);
        ctx.lineTo(hw - 3, y);
        ctx.stroke();
      }

      // Lights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-hw + 4, -hh + 1, 5, 4);
      ctx.fillRect(hw - 9, -hh + 1, 5, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-hw + 3, hh - 3, 6, 3);
      ctx.fillRect(hw - 9, hh - 3, 6, 3);
      break;
    }

    case 'parked_hazard': {
      // Breakdown car with flashing double hazard lights!
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-hw - 1, -hh + 6, 6, 12);
      ctx.fillRect(hw - 5, -hh + 6, 6, 12);
      ctx.fillRect(-hw - 1, hh - 18, 6, 12);
      ctx.fillRect(hw - 5, hh - 18, 6, 12);

      // Body (Gray / worn)
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, veh.height, [6, 6, 4, 4]);
      ctx.fill();

      // Open hood smoking!
      ctx.fillStyle = '#334155';
      ctx.fillRect(-hw + 4, -hh + 2, veh.width - 8, 12);

      // Glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 6, -hh + 18, veh.width - 12, 10);
      ctx.fillRect(-hw + 6, hh - 20, veh.width - 12, 8);

      // Flashing 4-way Hazards!
      if (Math.floor(Date.now() / 200) % 2 === 0) {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fillRect(-hw + 1, -hh + 1, 5, 5);
        ctx.fillRect(hw - 6, -hh + 1, 5, 5);
        ctx.fillRect(-hw + 1, hh - 5, 5, 5);
        ctx.fillRect(hw - 6, hh - 5, 5, 5);
        ctx.shadowBlur = 0;
      }
      break;
    }

    case 'bonus_s_car': {
      // Rare 'S' Bonus Car (Rainbow / Chrome)
      const hue = (Date.now() / 10) % 360;
      ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, veh.height, [12, 12, 6, 6]);
      ctx.fill();

      // Glowing 'S' emblem on roof
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.fillText('S', 0, 0);
      ctx.shadowBlur = 0;
      break;
    }

    case 'rival_muscle': {
      // Aggressive Black & Orange Muscle Car
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-hw - 1, -hh + 8, 7, 16);
      ctx.fillRect(hw - 6, -hh + 8, 7, 16);
      ctx.fillRect(-hw - 1, hh - 24, 7, 16);
      ctx.fillRect(hw - 6, hh - 24, 7, 16);

      // Chassis: Matte Black with Fiery Orange Flames
      const mGrad = ctx.createLinearGradient(-hw, 0, hw, 0);
      mGrad.addColorStop(0, '#1c1917');
      mGrad.addColorStop(0.5, '#292524');
      mGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, veh.height, [6, 6, 4, 4]);
      ctx.fill();

      // Orange racing stripes
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-4, -hh + 2, 8, veh.height - 4);

      // Supercharger Blower on Hood
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-5, -hh + 12, 10, 8);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3, -hh + 14, 6, 4);

      // Dark tinted glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 6, -hh + 24, veh.width - 12, 14);
      ctx.fillRect(-hw + 6, hh - 24, veh.width - 12, 8);

      // Menacing Red Headlights!
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillRect(-hw + 3, -hh + 1, 6, 4);
      ctx.fillRect(hw - 9, -hh + 1, 6, 4);
      ctx.shadowBlur = 0;

      // Heavy Ramming Bumper
      ctx.fillStyle = '#57534e';
      ctx.fillRect(-hw + 1, -hh, veh.width - 2, 3);
      break;
    }

    case 'police_interceptor': {
      // Police Patrol Cruiser with Flashing Lightbar
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-hw - 1, -hh + 8, 6, 14);
      ctx.fillRect(hw - 5, -hh + 8, 6, 14);
      ctx.fillRect(-hw - 1, hh - 21, 6, 14);
      ctx.fillRect(hw - 5, hh - 21, 6, 14);

      // Body: White roof & doors, black fenders
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, veh.height, [8, 8, 4, 4]);
      ctx.fill();

      // White center roof/doors
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-hw + 4, -hh + 16, veh.width - 8, veh.height - 32);

      // "POLICE" text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('POLICE', 0, 0);

      // Glass
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw + 6, -hh + 18, veh.width - 12, 10);
      ctx.fillRect(-hw + 6, hh - 20, veh.width - 12, 8);

      // Flashing Blue & Red Lightbar!
      const flash = Math.floor(Date.now() / 90) % 2 === 0;
      // Red light
      ctx.fillStyle = flash ? '#ef4444' : '#7f1d1d';
      ctx.shadowColor = flash ? '#ef4444' : 'transparent';
      ctx.shadowBlur = flash ? 10 : 0;
      ctx.fillRect(-hw + 8, -hh + 28, 8, 5);
      // Blue light
      ctx.fillStyle = !flash ? '#3b82f6' : '#1e3a8a';
      ctx.shadowColor = !flash ? '#3b82f6' : 'transparent';
      ctx.shadowBlur = !flash ? 10 : 0;
      ctx.fillRect(hw - 16, -hh + 28, 8, 5);
      ctx.shadowBlur = 0;

      // Front push-bar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-hw + 4, -hh - 1, veh.width - 8, 3);
      break;
    }

    case 'boss_tanker': {
      // Sector Boss Heavy Armored War-Rig Tanker
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-hw - 3, -hh + 8, 8, 22);
      ctx.fillRect(hw - 5, -hh + 8, 8, 22);
      ctx.fillRect(-hw - 3, hh - 50, 8, 22);
      ctx.fillRect(hw - 5, hh - 50, 8, 22);
      ctx.fillRect(-hw - 3, hh - 24, 8, 22);
      ctx.fillRect(hw - 5, hh - 24, 8, 22);

      // Armored Cab
      ctx.fillStyle = '#3f3f46';
      ctx.beginPath();
      ctx.roundRect(-hw + 2, -hh, veh.width - 4, 40, [8, 8, 3, 3]);
      ctx.fill();

      // Chrome grill with skull teeth
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-hw + 6, -hh + 2, veh.width - 12, 6);

      // Twin smokestacks
      ctx.fillStyle = '#71717a';
      ctx.fillRect(-hw + 3, -hh + 12, 4, 18);
      ctx.fillRect(hw - 7, -hh + 12, 4, 18);

      // Huge Armor Tanker Body
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(-hw + 1, -hh + 42, veh.width - 2, veh.height - 44, 4);
      ctx.fill();

      // Hazard hazard stripes on rear
      for (let s = -hw + 4; s < hw - 4; s += 8) {
        ctx.fillStyle = (Math.floor(s / 8) % 2 === 0) ? '#eab308' : '#09090b';
        ctx.fillRect(s, hh - 10, 8, 6);
      }

      // Boss HP Bar floating above
      if (veh.hp !== undefined && veh.maxHp) {
        const hpRatio = Math.max(0, veh.hp / veh.maxHp);
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(-hw - 6, -hh - 18, veh.width + 12, 10);
        ctx.fillStyle = hpRatio > 0.4 ? '#ef4444' : '#eab308';
        ctx.fillRect(-hw - 4, -hh - 16, (veh.width + 8) * hpRatio, 6);
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1;
        ctx.strokeRect(-hw - 6, -hh - 18, veh.width + 12, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS RIG', 0, -hh - 22);
        ctx.restore();
      }
      break;
    }
  }

  // Wrecked or fighting spark overlay
  if (veh.isWrecked) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, hw + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, hw * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  if (veh.isFightingAnother) {
    // Clash sparks on sides!
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    for (let i = 0; i < 4; i++) {
      ctx.fillRect((Math.random() > 0.5 ? hw : -hw - 4), (Math.random() - 0.5) * hh, 4, 4);
    }
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

// ============================================================================
// 3. POWER-UPS & FUEL CANISTERS
// ============================================================================
export function drawFuelCollectible(
  ctx: CanvasRenderingContext2D,
  item: FuelCollectible,
  screenX: number,
  screenY: number
) {
  ctx.save();
  ctx.translate(screenX + item.width / 2, screenY + item.height / 2);

  const bounce = Math.sin(Date.now() * 0.008 + item.pulsePhase) * 3;
  ctx.translate(0, bounce);

  const hw = item.width / 2;
  const hh = item.height / 2;

  // Glow aura
  const isSuper = item.type === 'super_battery';
  const glowColor = isSuper ? 'rgba(56, 189, 248, 0.45)' : 'rgba(34, 197, 94, 0.45)';
  ctx.shadowColor = isSuper ? '#38bdf8' : '#22c55e';
  ctx.shadowBlur = 14;

  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.arc(0, 0, hw + 6, 0, Math.PI * 2);
  ctx.fill();

  if (isSuper) {
    // Super Battery (Cyan/Electric)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-hw + 3, -hh + 4, item.width - 6, item.height - 8, 4);
    ctx.fill();

    // Battery Terminal Top
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-hw + 8, -hh + 1, item.width - 16, 4);

    // Lightning Bolt
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(2, -hh + 8);
    ctx.lineTo(-6, 1);
    ctx.lineTo(0, 1);
    ctx.lineTo(-2, hh - 8);
    ctx.lineTo(6, -1);
    ctx.lineTo(0, -1);
    ctx.closePath();
    ctx.fill();
  } else {
    // Classic Red/Green Fuel Canister (Jerry Can)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(-hw + 3, -hh + 3, item.width - 6, item.height - 6, 5);
    ctx.fill();

    // Spout / handle
    ctx.fillStyle = '#15803d';
    ctx.fillRect(-hw + 6, -hh, 8, 4);
    ctx.fillRect(hw - 10, -hh, 6, 4);

    // Fuel "F" letter or drop
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', 0, 1);
  }

  ctx.restore();
}

// ============================================================================
// 4. ROAD HAZARDS
// ============================================================================
export function drawRoadHazard(
  ctx: CanvasRenderingContext2D,
  hazard: RoadHazard,
  screenX: number,
  screenY: number
) {
  ctx.save();
  ctx.translate(screenX + hazard.width / 2, screenY + hazard.height / 2);

  const hw = hazard.width / 2;
  const hh = hazard.height / 2;

  switch (hazard.type) {
    case 'oil_slick': {
      // Dark slick with rainbow iridescence
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, hw);
      grad.addColorStop(0, '#09090b');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(0.8, '#4c1d95');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Small secondary oil splat
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-hw * 0.4, -hh * 0.3, hw * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'puddle': {
      // Water puddle with ripples
      const waterGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, hw);
      waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
      waterGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.4)');
      waterGrad.addColorStop(1, 'rgba(3, 105, 161, 0)');

      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw * 0.6, hh * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'pothole': {
      // Deep broken asphalt hole
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'barrier_cone': {
      // Construction Cone / Barrier
      // Orange & White diagonal stripes
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-hw, -hh, hazard.width, hazard.height);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-hw, -hh);
      ctx.lineTo(-hw + 8, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(hw - 8, hh);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'stunt_ramp': {
      // Mega Launch Stunt Ramp (Yellow/Black chevron with neon arrows)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-hw, -hh, hazard.width, hazard.height);

      // Yellow & black diagonal chevrons
      for (let x = -hw; x < hw; x += 10) {
        ctx.fillStyle = (Math.floor((x + hw) / 10) % 2 === 0) ? '#facc15' : '#18181b';
        ctx.fillRect(x, -hh, 10, hazard.height);
      }

      // Neon Cyan Boost Arrows pointing up
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -hh + 3);
      ctx.lineTo(-hw + 8, hh - 3);
      ctx.lineTo(0, hh - 8);
      ctx.lineTo(hw - 8, hh - 3);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }

    case 'rolling_boulder': {
      // Desert Canyon rolling boulder
      ctx.save();
      if (hazard.rot) {
        ctx.rotate(hazard.rot);
      }
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
      ctx.fill();

      // Rock texture & crack
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(-hw * 0.3, -hh * 0.2, hw * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.6, -hh * 0.4);
      ctx.lineTo(0, 0);
      ctx.lineTo(hw * 0.5, hh * 0.3);
      ctx.stroke();
      ctx.restore();
      break;
    }
  }

  ctx.restore();
}

// ============================================================================
// 5. SCENERY PROPS (All 5 Dynamic Scenery Themes)
// ============================================================================
export function drawSceneryProp(
  ctx: CanvasRenderingContext2D,
  prop: SceneryProp,
  screenX: number,
  screenY: number
) {
  ctx.save();
  ctx.translate(screenX + prop.width / 2, screenY + prop.height / 2);

  const hw = prop.width / 2;
  const hh = prop.height / 2;

  switch (prop.type) {
    // ---------------- Suburban Town ----------------
    case 'house': {
      // Pitched roof house with chimney & garden
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(-hw + 4, -hh + 6, prop.width, prop.height);

      // Walls
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-hw, -hh + 12, prop.width - 4, prop.height - 14);

      // Roof
      const roofColor = prop.variant === 1 ? '#b91c1c' : '#0369a1';
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(-hw - 4, -hh + 14);
      ctx.lineTo(0, -hh - 4);
      ctx.lineTo(hw, -hh + 14);
      ctx.closePath();
      ctx.fill();

      // Chimney
      ctx.fillStyle = '#78350f';
      ctx.fillRect(hw - 16, -hh - 6, 8, 12);

      // Windows
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-hw + 8, -hh + 20, 12, 10);
      ctx.fillRect(hw - 22, -hh + 20, 12, 10);

      // Front door
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, hh - 14, 12, 14);
      break;
    }

    case 'tennis_court': {
      // Green/Clay tennis court with white lines & net
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-hw, -hh, prop.width, prop.height);

      // White perimeter line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(-hw + 4, -hh + 4, prop.width - 8, prop.height - 8);

      // Center net
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-hw + 4, -1, prop.width - 8, 2);

      // Service boxes
      ctx.strokeRect(-hw + 8, -hh + 16, prop.width - 16, prop.height - 32);
      break;
    }

    case 'hedge': {
      // Manicured garden hedge
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, prop.width, prop.height, 8);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-hw * 0.4, -hh * 0.2, hw * 0.4, 0, Math.PI * 2);
      ctx.arc(hw * 0.3, -hh * 0.1, hw * 0.45, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'tree': {
      // Foliage tree
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(3, 3, hw, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 0, hw - 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(-hw * 0.3, -hh * 0.3, hw * 0.45, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ---------------- Sea Bridge / Pier ----------------
    case 'pier_dock': {
      // Wooden pier extending out into the water
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-hw, -hh, prop.width, prop.height);

      // Wooden planks
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1;
      for (let y = -hh + 6; y < hh; y += 8) {
        ctx.beginPath();
        ctx.moveTo(-hw, y);
        ctx.lineTo(hw, y);
        ctx.stroke();
      }
      break;
    }

    case 'yacht': {
      // White luxury yacht on water
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(3, 4, hw, hh * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hull
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, -hh * 0.2);
      ctx.lineTo(hw * 0.7, hh);
      ctx.lineTo(-hw * 0.7, hh);
      ctx.lineTo(-hw, -hh * 0.2);
      ctx.closePath();
      ctx.fill();

      // Cabin & Tinted glass
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-hw * 0.4, -hh * 0.2, prop.width * 0.4, prop.height * 0.4);
      break;
    }

    case 'speedboat': {
      // Fast motorboat with wake
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      ctx.fill();

      // White wake behind
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.moveTo(-hw, hh);
      ctx.lineTo(0, hh + 16);
      ctx.lineTo(hw, hh);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'buoy': {
      // Red/Yellow ocean buoy
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, hw * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ---------------- Desert Canyon ----------------
    case 'cactus': {
      // Saguaro cactus
      ctx.fillStyle = '#15803d';
      // Main trunk
      ctx.fillRect(-4, -hh, 8, prop.height);
      // Left arm
      ctx.fillRect(-hw, -hh * 0.3, hw, 6);
      ctx.fillRect(-hw, -hh * 0.6, 6, hh * 0.35);
      // Right arm
      ctx.fillRect(0, -hh * 0.1, hw, 6);
      ctx.fillRect(hw - 6, -hh * 0.4, 6, hh * 0.35);
      break;
    }

    case 'canyon_rock': {
      // Red sandstone rock formations
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.moveTo(-hw, hh);
      ctx.lineTo(-hw * 0.7, -hh);
      ctx.lineTo(hw * 0.4, -hh * 0.8);
      ctx.lineTo(hw, hh);
      ctx.closePath();
      ctx.fill();

      // Highlight
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-hw * 0.5, hh);
      ctx.lineTo(-hw * 0.4, -hh * 0.6);
      ctx.lineTo(hw * 0.2, -hh * 0.7);
      ctx.lineTo(hw * 0.5, hh);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'overhead_plane': {
      // Jet fighter flying fast overhead
      // Draw ground shadow first
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.moveTo(25, -hh + 35);
      ctx.lineTo(hw + 25, 25);
      ctx.lineTo(25, hh + 25);
      ctx.lineTo(-hw + 25, 25);
      ctx.closePath();
      ctx.fill();

      // Jet plane body
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, 0);
      ctx.lineTo(hw * 0.2, hh);
      ctx.lineTo(-hw * 0.2, hh);
      ctx.lineTo(-hw, 0);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -hh * 0.4, 4, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // ---------------- Tropical Beach ----------------
    case 'palm_tree': {
      // Tropical palm tree
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-3, -hh + 8, 6, prop.height - 8);

      // Fronds
      ctx.fillStyle = '#059669';
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, -hh + 8);
        ctx.lineTo(Math.cos(ang) * hw, -hh + 8 + Math.sin(ang) * hh * 0.7);
        ctx.lineTo(Math.cos(ang + 0.3) * hw * 0.7, -hh + 8 + Math.sin(ang + 0.3) * hh * 0.7);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'parasol': {
      // Colorful striped beach umbrella
      ctx.fillStyle = prop.variant === 1 ? '#ef4444' : '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
      ctx.fill();

      // White slices
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const start = (i * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, hw, start, start + Math.PI / 4);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    // ---------------- Cargo Port ----------------
    case 'shipping_container': {
      // Giant colorful cargo container
      const color = prop.variant === 1 ? '#0284c7' : prop.variant === 2 ? '#ea580c' : '#16a34a';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-hw, -hh, prop.width, prop.height, 3);
      ctx.fill();

      // Metal ribbing
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      for (let y = -hh + 6; y < hh; y += 8) {
        ctx.beginPath();
        ctx.moveTo(-hw + 3, y);
        ctx.lineTo(hw - 3, y);
        ctx.stroke();
      }
      break;
    }

    case 'port_warehouse': {
      // Industrial warehouse
      ctx.fillStyle = '#475569';
      ctx.fillRect(-hw, -hh, prop.width, prop.height);

      // Roof ridges
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-hw + 4, -hh + 4, prop.width - 8, 12);
      break;
    }

    case 'dock_crane': {
      // Overhead dock portal crane
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.strokeRect(-hw, -hh, prop.width, prop.height);

      // Cross trusses
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh);
      ctx.lineTo(hw, hh);
      ctx.moveTo(hw, -hh);
      ctx.lineTo(-hw, hh);
      ctx.stroke();
      break;
    }

    default:
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-hw, -hh, prop.width, prop.height);
      break;
  }

  ctx.restore();
}

// ============================================================================
// 6. FINISH LINE OVERHEAD GANTRY
// ============================================================================
export function drawFinishLineGantry(
  ctx: CanvasRenderingContext2D,
  screenY: number,
  roadLeft: number,
  roadWidth: number
) {
  ctx.save();

  // Checkered track finish stripe across road
  const checkSize = 16;
  const cols = Math.ceil(roadWidth / checkSize);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < 2; r++) {
      ctx.fillStyle = (c + r) % 2 === 0 ? '#ffffff' : '#000000';
      ctx.fillRect(roadLeft + c * checkSize, screenY + r * checkSize, checkSize, checkSize);
    }
  }

  // Overhead Gantry Banner
  const gantryH = 34;
  const gantryY = screenY - gantryH - 6;

  // Support pillars on left and right
  ctx.fillStyle = '#475569';
  ctx.fillRect(roadLeft - 18, gantryY - 10, 14, gantryH + 26);
  ctx.fillRect(roadLeft + roadWidth + 4, gantryY - 10, 14, gantryH + 26);

  // Cross beam
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(roadLeft - 22, gantryY, roadWidth + 44, gantryH);

  // Checkered border on beam
  for (let c = 0; c < Math.ceil((roadWidth + 44) / 10); c++) {
    ctx.fillStyle = c % 2 === 0 ? '#ef4444' : '#ffffff';
    ctx.fillRect(roadLeft - 22 + c * 10, gantryY, 10, 4);
    ctx.fillRect(roadLeft - 22 + c * 10, gantryY + gantryH - 4, 10, 4);
  }

  // FINISH LINE Text
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#facc15';
  ctx.shadowBlur = 10;
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ GOAL / FINISH ★', roadLeft + roadWidth / 2, gantryY + gantryH / 2);
  ctx.shadowBlur = 0;

  ctx.restore();
}

// ============================================================================
// 7. FLOATING COMBAT TEXT (Takedowns, Slams, Combos)
// ============================================================================
export function drawFloatingCombatText(
  ctx: CanvasRenderingContext2D,
  f: FloatingCombatText
) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.scale, f.scale);

  const alpha = Math.min(1.0, f.life / (f.maxLife * 0.4));
  ctx.globalAlpha = Math.max(0, alpha);

  ctx.font = 'bold 13px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Thick black outline
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#09090b';
  ctx.strokeText(f.text, 0, 0);

  // Bright color fill
  ctx.fillStyle = f.color;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = 10;
  ctx.fillText(f.text, 0, 0);

  ctx.restore();
}

// ============================================================================
// 8. PROJECTILES & BULLETS
// ============================================================================
export function drawBullet(
  ctx: CanvasRenderingContext2D,
  b: Bullet
) {
  ctx.save();
  ctx.translate(b.x, b.y);

  if (b.isPlayer) {
    // Player High-Velocity Laser Bolt / Tracer Bullet
    ctx.fillStyle = b.color || '#38bdf8';
    ctx.shadowColor = b.color || '#38bdf8';
    ctx.shadowBlur = 8;

    // Glowing core
    ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);

    // Tracer streak behind
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -b.height / 2 + 2, 2, b.height - 4);
  } else {
    // Enemy / Rival Plasma Bolt
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, b.width / 2 + 1, 0, Math.PI * 2);
    ctx.fill();

    // Hot center
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, b.width / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// 9. WEATHER EFFECTS (Rain, Snow, Lightning, Sunrise)
// ============================================================================
export function drawWeatherParticles(
  ctx: CanvasRenderingContext2D,
  particles: WeatherParticle[]
) {
  ctx.save();

  for (const p of particles) {
    if (p.type === 'rain') {
      // Slanted fast rain streak
      ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.75})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * 0.05, p.y + p.length);
      ctx.stroke();
    } else {
      // Fluffy tumbling snowflake
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.85})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawWeatherAtmosphere(
  ctx: CanvasRenderingContext2D,
  weather: WeatherMode,
  width: number,
  height: number,
  lightningAlpha: number = 0
) {
  ctx.save();

  // Full-screen lightning flash
  if (lightningAlpha > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${lightningAlpha * 0.7})`;
    ctx.fillRect(0, 0, width, height);
  }

  switch (weather) {
    case 'sunrise': {
      // Warm golden/peach morning dawn gradient over the horizon
      const dawnGrad = ctx.createLinearGradient(0, 0, 0, height);
      dawnGrad.addColorStop(0, 'rgba(249, 115, 22, 0.22)');
      dawnGrad.addColorStop(0.4, 'rgba(217, 70, 239, 0.12)');
      dawnGrad.addColorStop(1, 'rgba(245, 158, 11, 0.05)');
      ctx.fillStyle = dawnGrad;
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'winter': {
      // Cold frosty cyan-white haze
      ctx.fillStyle = 'rgba(219, 234, 254, 0.1)';
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'rain': {
      // Wet dark storm atmosphere
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);
      break;
    }

    case 'summer': {
      // Clean sunny high-noon warm wash
      ctx.fillStyle = 'rgba(255, 245, 180, 0.04)';
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  ctx.restore();
}
