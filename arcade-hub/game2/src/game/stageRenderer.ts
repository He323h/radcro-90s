import { StageId } from './types';

export class StageRenderer {
  /**
   * Render the 2D side-view battle arena stage with parallax scrolling
   */
  public static drawStage(
    ctx: CanvasRenderingContext2D,
    stage: StageId,
    cameraX: number,
    width: number,
    height: number,
    time: number
  ) {
    if (stage === 'COURTYARD') {
      this.drawCourtyardStage(ctx, cameraX, width, height, time);
    } else if (stage === 'NEON_ALLEY') {
      this.drawNeonAlleyStage(ctx, cameraX, width, height, time);
    } else {
      this.drawDojoStage(ctx, cameraX, width, height, time);
    }
  }

  /**
   * Stage 1: Moonlit Japanese Courtyard (Suzaku Castle style)
   */
  private static drawCourtyardStage(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    w: number,
    h: number,
    time: number
  ) {
    // 1. Sky Gradient (Deep midnight indigo to dark purple)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#09081a');
    skyGrad.addColorStop(0.5, '#171435');
    skyGrad.addColorStop(0.85, '#2e1c47');
    skyGrad.addColorStop(1, '#1b122c');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Parallax Layer 0: Giant Moon & Stars (Slowest scroll: factor 0.05)
    const p0 = -cameraX * 0.05;
    ctx.save();
    ctx.translate(p0, 0);

    // Stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const starCoords = [
      [60, 40], [120, 80], [200, 30], [280, 95], [350, 45],
      [420, 75], [510, 35], [580, 85], [660, 50], [740, 90],
      [820, 40], [900, 70], [980, 30], [1050, 60]
    ];
    for (const [sx, sy] of starCoords) {
      const twinkle = Math.sin(time * 2 + sx) * 0.5 + 0.5;
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Giant Glowing Full Moon
    const moonX = w * 0.65;
    const moonY = 85;
    const moonR = 48;

    // Moonlight outer haze
    const moonHaze = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.5);
    moonHaze.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
    moonHaze.addColorStop(0.6, 'rgba(253, 224, 71, 0.1)');
    moonHaze.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonHaze;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Moon disc
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Moon craters
    ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.beginPath();
    ctx.arc(moonX - 14, moonY - 12, 12, 0, Math.PI * 2);
    ctx.arc(moonX + 16, moonY + 8, 10, 0, Math.PI * 2);
    ctx.arc(moonX - 8, moonY + 16, 7, 0, Math.PI * 2);
    ctx.fill();

    // Floating Clouds across moon
    ctx.fillStyle = 'rgba(40, 30, 60, 0.65)';
    ctx.beginPath();
    const cloudOffset = (time * 8) % (w + 200) - 100;
    ctx.ellipse(moonX + 20 - cloudOffset * 0.3, moonY + 10, 65, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Parallax Layer 1: Distant Misty Mountains & Pagoda silhouette (Scroll: 0.15)
    const p1 = -cameraX * 0.15;
    ctx.save();
    ctx.translate(p1, 0);

    // Mountain silhouettes
    ctx.fillStyle = '#1e1635';
    ctx.beginPath();
    ctx.moveTo(-100, 350);
    ctx.lineTo(0, 220);
    ctx.lineTo(160, 270);
    ctx.lineTo(340, 190);
    ctx.lineTo(520, 260);
    ctx.lineTo(680, 180);
    ctx.lineTo(880, 250);
    ctx.lineTo(1100, 200);
    ctx.lineTo(1200, 350);
    ctx.closePath();
    ctx.fill();

    // Distant castle silhouette
    ctx.fillStyle = '#140e26';
    ctx.fillRect(720, 180, 70, 70);
    // Castle Tier roof curves
    this.drawCurvedRoof(ctx, 705, 180, 100, 14);
    this.drawCurvedRoof(ctx, 715, 150, 80, 12);
    this.drawCurvedRoof(ctx, 725, 126, 60, 10);
    ctx.restore();

    // Parallax Layer 2: Main Castle Courtyard & Pagoda (Scroll: 0.45)
    const p2 = -cameraX * 0.45;
    ctx.save();
    ctx.translate(p2, 0);

    // Japanese Castle Pagoda wall
    ctx.fillStyle = '#2d2542';
    ctx.fillRect(80, 120, 280, 210);

    // Ornate curved pagoda roofs
    this.drawCurvedRoof(ctx, 50, 120, 340, 22);
    this.drawCurvedRoof(ctx, 70, 70, 300, 20);

    // Wall wood frames
    ctx.strokeStyle = '#181224';
    ctx.lineWidth = 4;
    for (let x = 110; x <= 330; x += 55) {
      ctx.beginPath();
      ctx.moveTo(x, 120);
      ctx.lineTo(x, 330);
      ctx.stroke();
    }
    for (let y = 160; y <= 310; y += 45) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(360, y);
      ctx.stroke();
    }

    // Glowing Shoji Screens
    ctx.fillStyle = 'rgba(254, 215, 170, 0.35)';
    ctx.fillRect(125, 180, 40, 70);
    ctx.fillRect(195, 180, 40, 70);
    ctx.fillRect(265, 180, 40, 70);

    // Hanging Red Paper Lanterns with fire flicker
    const lanternPositions = [90, 170, 270, 350, 520, 720];
    for (const lx of lanternPositions) {
      const flicker = Math.sin(time * 8 + lx) * 0.15 + 0.85;
      const sway = Math.sin(time * 2 + lx) * 2;

      // Cord
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, 125);
      ctx.lineTo(lx + sway, 142);
      ctx.stroke();

      // Radial warm lantern glow
      const lGlow = ctx.createRadialGradient(lx + sway, 152, 2, lx + sway, 152, 38);
      lGlow.addColorStop(0, `rgba(249, 115, 22, ${0.45 * flicker})`);
      lGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lGlow;
      ctx.beginPath();
      ctx.arc(lx + sway, 152, 38, 0, Math.PI * 2);
      ctx.fill();

      // Lantern body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(lx - 9 + sway, 142, 18, 22, 5);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(lx - 5 + sway, 149, 10, 8); // Gold inner light
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(lx - 9 + sway, 140, 18, 3); // Cap
      ctx.fillRect(lx - 9 + sway, 163, 18, 3); // Base
    }

    // Great Torii Gate in background
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(580, 170, 18, 160); // Left pillar
    ctx.fillRect(690, 170, 18, 160); // Right pillar
    this.drawCurvedRoof(ctx, 560, 165, 170, 18); // Top crossbeam
    ctx.fillRect(570, 195, 150, 12); // Secondary crossbeam
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(580, 315, 18, 15); // Stone bases
    ctx.fillRect(690, 315, 18, 15);

    // Stone Guardian Lion / Lantern
    ctx.fillStyle = '#475569';
    ctx.fillRect(490, 275, 24, 55);
    ctx.fillRect(484, 265, 36, 12);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(495, 270, 14, 6); // Stone lantern window glow

    ctx.restore();

    // Foreground / Ground Layer (Scroll: 1.0)
    const p3 = -cameraX;
    ctx.save();
    ctx.translate(p3, 0);

    // Dojo wooden platform & courtyard floor
    const groundY = 330;
    const floorH = h - groundY;

    // Stone base foundation
    ctx.fillStyle = '#334155';
    ctx.fillRect(-200, groundY, w + 1400, 15);

    // Polished Timber planks
    const woodGrad = ctx.createLinearGradient(0, groundY + 15, 0, h);
    woodGrad.addColorStop(0, '#59381e');
    woodGrad.addColorStop(0.3, '#3d2513');
    woodGrad.addColorStop(1, '#23150b');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(-200, groundY + 15, w + 1400, floorH);

    // Wood Plank lines with subtle specular reflection
    ctx.strokeStyle = '#27170a';
    ctx.lineWidth = 2;
    for (let x = -200; x < w + 1200; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 15);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Horizontal plank separator bands
    ctx.strokeStyle = '#6e4425';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-200, groundY + 15);
    ctx.lineTo(w + 1200, groundY + 15);
    ctx.stroke();

    // Courtyard Stone Steps at stage edge
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(1000, groundY - 10, 120, 25);
    ctx.fillRect(1030, groundY - 25, 90, 15);

    ctx.restore();
  }

  /**
   * Stage 2: Neon Shinjuku Rain Alley
   */
  private static drawNeonAlleyStage(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    w: number,
    h: number,
    time: number
  ) {
    // Dark Rainy Sky
    ctx.fillStyle = '#060714';
    ctx.fillRect(0, 0, w, h);

    // Distant Skyscrapers with window matrices (Scroll: 0.2)
    const p1 = -cameraX * 0.2;
    ctx.save();
    ctx.translate(p1, 0);

    const buildings = [
      { x: 50, w: 120, h: 260, color: '#0f172a' },
      { x: 190, w: 140, h: 290, color: '#111827' },
      { x: 350, w: 100, h: 240, color: '#090d16' },
      { x: 470, w: 150, h: 300, color: '#131b2e' },
      { x: 640, w: 130, h: 270, color: '#0f172a' },
      { x: 790, w: 160, h: 310, color: '#111827' },
    ];

    for (const b of buildings) {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, h - b.h - 50, b.w, b.h);

      // Windows
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      for (let wx = b.x + 12; wx < b.x + b.w - 12; wx += 16) {
        for (let wy = h - b.h - 40; wy < h - 90; wy += 20) {
          if ((wx + wy) % 5 !== 0) {
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }
    ctx.restore();

    // Midground: Neon signs & storefronts (Scroll: 0.5)
    const p2 = -cameraX * 0.5;
    ctx.save();
    ctx.translate(p2, 0);

    // Street walls
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(80, 160, 260, 170);
    ctx.fillRect(520, 140, 280, 190);

    // Neon Kanji Sign: "拉麺" (Ramen) - Glowing Pink
    const flicker1 = Math.sin(time * 12) > 0.05 ? 1 : 0.4;
    this.drawNeonSign(ctx, 120, 180, '拉麺', '#ec4899', flicker1);

    // Neon Sign: "BAR FIGHT '96" - Cyan & Amber
    const flicker2 = Math.sin(time * 9 + 2) > 0.1 ? 1 : 0.6;
    this.drawNeonSign(ctx, 580, 160, '激闘 96', '#06b6d4', flicker2);

    // Vending Machine with glowing front
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(360, 230, 48, 100);
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(366, 240, 36, 42); // Glass display
    ctx.fillStyle = '#f87171';
    ctx.fillRect(368, 292, 32, 10); // Dispenser

    ctx.restore();

    // Ground: Wet reflective street asphalt (Scroll: 1.0)
    const p3 = -cameraX;
    ctx.save();
    ctx.translate(p3, 0);

    const groundY = 330;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-200, groundY, w + 1400, h - groundY);

    // Wet puddles with neon color reflections
    ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
    ctx.beginPath();
    ctx.ellipse(300, groundY + 25, 90, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.beginPath();
    ctx.ellipse(680, groundY + 30, 110, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sidewalk curb
    ctx.fillStyle = '#334155';
    ctx.fillRect(-200, groundY - 4, w + 1400, 8);

    ctx.restore();
  }

  /**
   * Stage 3: Traditional Dojo Hall
   */
  private static drawDojoStage(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    w: number,
    h: number,
    time: number
  ) {
    // Golden wood interior
    ctx.fillStyle = '#26170d';
    ctx.fillRect(0, 0, w, h);

    const p = -cameraX * 0.4;
    ctx.save();
    ctx.translate(p, 0);

    // Giant Calligraphy Banner: "風林火山" (Wind, Forest, Fire, Mountain)
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(300, 60, 240, 160);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 6;
    ctx.strokeRect(300, 60, 240, 160);

    // Calligraphy mark representation
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 36px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('武道', 420, 140);
    ctx.font = '14px sans-serif';
    ctx.fillText('SPIRIT OF THE DRAGON', 420, 180);

    // Weapons rack on wall (Katana & Bokken)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(100, 140, 14, 110);
    ctx.fillRect(170, 140, 14, 110);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(90, 165, 105, 6); // Katana 1
    ctx.fillRect(90, 195, 105, 6); // Katana 2
    ctx.fillRect(90, 225, 105, 6); // Katana 3

    ctx.restore();

    // Tatami Floor (Scroll: 1.0)
    const p3 = -cameraX;
    ctx.save();
    ctx.translate(p3, 0);
    const groundY = 330;
    ctx.fillStyle = '#a38148';
    ctx.fillRect(-200, groundY, w + 1400, h - groundY);

    // Tatami woven borders
    ctx.fillStyle = '#14532d';
    for (let x = -200; x < w + 1200; x += 110) {
      ctx.fillRect(x, groundY, 8, h - groundY);
    }
    ctx.restore();
  }

  /**
   * Helper: Draw curving Japanese temple tile roof
   */
  private static drawCurvedRoof(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    ctx.fillStyle = '#181226';
    ctx.beginPath();
    ctx.moveTo(x - 18, y + h);
    ctx.quadraticCurveTo(x + w * 0.5, y - 4, x + w + 18, y + h);
    ctx.lineTo(x + w, y + h + 6);
    ctx.quadraticCurveTo(x + w * 0.5, y + 6, x, y + h + 6);
    ctx.closePath();
    ctx.fill();

    // Gold tip accents
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x - 22, y + h - 6, 8, 8);
    ctx.fillRect(x + w + 14, y + h - 6, 8, 8);
  }

  /**
   * Helper: Draw neon glowing text sign
   */
  private static drawNeonSign(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string,
    color: string,
    flicker: number
  ) {
    ctx.save();
    ctx.font = 'bold 24px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';

    // Outer Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 18 * flicker;
    ctx.fillStyle = color;
    ctx.globalAlpha = flicker;
    ctx.fillText(text, x, y);

    // Inner White core
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);

    ctx.restore();
  }
}
