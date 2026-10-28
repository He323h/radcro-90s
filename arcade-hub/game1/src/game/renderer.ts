import { Player, Enemy, Collectible, Block, Spring, Flagpole, Projectile, Particle, FloatingText } from './types';

export class GameRenderer {
  private sunAngle: number = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: 'day' | 'cavern' | 'castle',
    cameraX: number,
    cameraY: number,
    player: Player,
    blocks: Block[],
    enemies: Enemy[],
    collectibles: Collectible[],
    springs: Spring[],
    flagpole: Flagpole,
    projectiles: Projectile[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    gameTime: number
  ) {
    ctx.save();

    // 1. Clear & Draw Parallax Background
    this.renderBackground(ctx, width, height, theme, cameraX, cameraY, gameTime);

    // 2. Camera Transform for World Entities
    ctx.translate(-Math.floor(cameraX), -Math.floor(cameraY));

    // Draw Blocks & Terrain
    for (const block of blocks) {
      if (block.broken) continue;
      // Frustum culling
      if (block.x + block.width < cameraX - 20 || block.x > cameraX + width + 20) continue;
      this.renderBlock(ctx, block, theme);
    }

    // Draw Springs
    for (const spring of springs) {
      if (spring.x + spring.width < cameraX - 20 || spring.x > cameraX + width + 20) continue;
      this.renderSpring(ctx, spring);
    }

    // Draw Flagpole
    this.renderFlagpole(ctx, flagpole);

    // Draw Collectibles
    for (const col of collectibles) {
      if (col.collected) continue;
      if (col.x + col.width < cameraX - 20 || col.x > cameraX + width + 20) continue;
      this.renderCollectible(ctx, col);
    }

    // Draw Enemies
    for (const enemy of enemies) {
      if (!enemy.alive && !enemy.isSquashed) continue;
      if (enemy.x + enemy.width < cameraX - 20 || enemy.x > cameraX + width + 20) continue;
      this.renderEnemy(ctx, enemy, gameTime);
    }

    // Draw Projectiles
    for (const p of projectiles) {
      this.renderProjectile(ctx, p);
    }

    // Draw Particles
    for (const p of particles) {
      this.renderParticle(ctx, p);
    }

    // Draw Player Hero
    this.renderPlayer(ctx, player, gameTime);

    // Draw Floating Text (+100, 1UP)
    for (const ft of floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // --- Background Rendering ---

  private renderBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    theme: 'day' | 'cavern' | 'castle',
    camX: number,
    _camY: number,
    gameTime: number
  ) {
    if (theme === 'day') {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#38bdf8'); // sky-400
      grad.addColorStop(0.7, '#7dd3fc'); // sky-300
      grad.addColorStop(1, '#bae6fd'); // sky-200
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Smiling Pixel Sun
      this.sunAngle += 0.01;
      const sunX = w - 50 - (camX * 0.02) % (w + 100);
      const sunY = 40;
      this.drawPixelSun(ctx, sunX, sunY, this.sunAngle);

      // Distant Emerald Hills (Parallax 0.15x)
      ctx.fillStyle = '#15803d'; // green-700
      this.drawRollingHills(ctx, w, h - 30, camX * 0.15, 60, 40);

      // Near Hills with trees/bushes (Parallax 0.35x)
      ctx.fillStyle = '#22c55e'; // green-500
      this.drawRollingHills(ctx, w, h - 15, camX * 0.35, 45, 25);

      // Fluffy Clouds (Parallax 0.1x and 0.25x)
      this.drawClouds(ctx, w, h, camX, gameTime);
    } else if (theme === 'cavern') {
      // Underground deep cavern
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.7, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Cavern Stalactites on roof
      ctx.fillStyle = '#172554';
      const offset = (camX * 0.2) % 32;
      for (let x = -32; x < w + 32; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x - offset, 0);
        ctx.lineTo(x + 16 - offset, 24 + ((x % 3) * 8));
        ctx.lineTo(x + 32 - offset, 0);
        ctx.fill();
      }

      // Bioluminescent glowing specks
      for (let i = 0; i < 15; i++) {
        const sx = ((i * 37 + gameTime * 15) % (w + 40)) - 20;
        const sy = (i * 29 + Math.sin(gameTime * 2 + i) * 10) % (h - 60) + 30;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)';
        ctx.fillRect(Math.floor(sx), Math.floor(sy), 2, 2);
      }
    } else {
      // Sky Castle Fortress (sunset/dramatic)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#450a0a'); // red-950
      grad.addColorStop(0.5, '#991b1b'); // red-800
      grad.addColorStop(0.85, '#ea580c'); // orange-600
      grad.addColorStop(1, '#fbbf24'); // amber-400
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Silhouette Castle battlements in background (Parallax 0.2x)
      ctx.fillStyle = '#1c1917';
      const cOffset = (camX * 0.2) % 80;
      for (let x = -80; x < w + 80; x += 80) {
        const bx = x - cOffset;
        ctx.fillRect(bx, h - 90, 50, 90);
        ctx.fillRect(bx - 10, h - 120, 20, 120);
        ctx.fillRect(bx + 40, h - 110, 20, 110);
        // Battlements teeth
        ctx.fillRect(bx - 10, h - 126, 6, 6);
        ctx.fillRect(bx + 4, h - 126, 6, 6);
        ctx.fillRect(bx + 40, h - 116, 6, 6);
        ctx.fillRect(bx + 54, h - 116, 6, 6);
      }

      // Molten magma glow at bottom
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(0, h - 30, w, 30);
    }
  }

  private drawPixelSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, _angle: number) {
    ctx.save();
    // Sun rays
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 14, cy - 14, 28, 28);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - 10, cy - 10, 20, 20);

    // Smiling face
    ctx.fillStyle = '#854d0e';
    // Eyes
    ctx.fillRect(cx - 5, cy - 4, 2, 4);
    ctx.fillRect(cx + 3, cy - 4, 2, 4);
    // Rosy cheeks
    ctx.fillStyle = '#f87171';
    ctx.fillRect(cx - 7, cy, 2, 2);
    ctx.fillRect(cx + 5, cy, 2, 2);
    // Smile
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(cx - 4, cy + 3, 8, 2);
    ctx.fillRect(cx - 5, cy + 2, 1, 1);
    ctx.fillRect(cx + 4, cy + 2, 1, 1);

    ctx.restore();
  }

  private drawRollingHills(ctx: CanvasRenderingContext2D, w: number, baseY: number, offset: number, hillWidth: number, hillHeight: number) {
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    const startX = -(offset % (hillWidth * 2));
    for (let x = startX - hillWidth; x < w + hillWidth * 2; x += hillWidth) {
      ctx.quadraticCurveTo(x + hillWidth / 2, baseY - hillHeight, x + hillWidth, baseY);
    }
    ctx.lineTo(w, baseY + 60);
    ctx.lineTo(0, baseY + 60);
    ctx.closePath();
    ctx.fill();
  }

  private drawClouds(ctx: CanvasRenderingContext2D, w: number, _h: number, camX: number, gameTime: number) {
    const clouds = [
      { x: 40, y: 30, s: 1.2, speed: 0.08 },
      { x: 180, y: 55, s: 0.9, speed: 0.12 },
      { x: 320, y: 25, s: 1.5, speed: 0.06 },
      { x: 460, y: 45, s: 1.0, speed: 0.1 },
    ];

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (const c of clouds) {
      const cx = ((c.x - camX * c.speed + gameTime * 4) % (w + 100)) - 50;
      const cy = c.y;
      const s = c.s;
      // Pixel cloud puff clusters
      ctx.fillRect(Math.floor(cx), Math.floor(cy), Math.floor(28 * s), Math.floor(10 * s));
      ctx.fillRect(Math.floor(cx + 4 * s), Math.floor(cy - 6 * s), Math.floor(18 * s), Math.floor(8 * s));
      ctx.fillRect(Math.floor(cx + 8 * s), Math.floor(cy - 10 * s), Math.floor(10 * s), Math.floor(6 * s));
    }
  }

  // --- Terrain & Blocks ---

  private renderBlock(ctx: CanvasRenderingContext2D, b: Block, theme: 'day' | 'cavern' | 'castle') {
    const bx = Math.floor(b.x);
    const by = Math.floor(b.y + b.bounceOffset);

    switch (b.type) {
      case 'ground': {
        if (theme === 'day') {
          // Lush grass top
          ctx.fillStyle = '#16a34a'; // grass top
          ctx.fillRect(bx, by, b.width, 4);
          ctx.fillStyle = '#4ade80'; // grass highlight blades
          for (let i = 2; i < b.width; i += 4) {
            ctx.fillRect(bx + i, by, 2, 2);
          }
          // Earth
          ctx.fillStyle = '#92400e'; // dirt
          ctx.fillRect(bx, by + 4, b.width, b.height - 4);
          ctx.fillStyle = '#78350f'; // dirt pebbles
          ctx.fillRect(bx + 3, by + 7, 3, 3);
          ctx.fillRect(bx + 10, by + 11, 2, 2);
        } else if (theme === 'cavern') {
          // Dark stone cavern
          ctx.fillStyle = '#334155';
          ctx.fillRect(bx, by, b.width, b.height);
          ctx.fillStyle = '#475569';
          ctx.fillRect(bx, by, b.width, 3);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(bx + 4, by + 6, 4, 4);
        } else {
          // Castle dark brick floor
          ctx.fillStyle = '#292524';
          ctx.fillRect(bx, by, b.width, b.height);
          ctx.fillStyle = '#44403c';
          ctx.fillRect(bx, by, b.width, 2);
          ctx.fillStyle = '#78716c';
          ctx.fillRect(bx + 2, by + 2, 5, 4);
        }
        break;
      }

      case 'brick': {
        ctx.fillStyle = theme === 'castle' ? '#7f1d1d' : '#b45309';
        ctx.fillRect(bx, by, b.width, b.height);
        // Brick mortar lines
        ctx.fillStyle = '#451a03';
        ctx.fillRect(bx, by, b.width, 1);
        ctx.fillRect(bx, by + 7, b.width, 1);
        ctx.fillRect(bx, by + 15, b.width, 1);
        ctx.fillRect(bx + 7, by, 1, 7);
        ctx.fillRect(bx + 3, by + 8, 1, 7);
        ctx.fillRect(bx + 11, by + 8, 1, 7);
        // Highlights
        ctx.fillStyle = theme === 'castle' ? '#ef4444' : '#f59e0b';
        ctx.fillRect(bx + 1, by + 1, 6, 1);
        ctx.fillRect(bx + 8, by + 1, 7, 1);
        break;
      }

      case 'question': {
        // Glowing gold question block
        ctx.fillStyle = '#eab308';
        ctx.fillRect(bx, by, b.width, b.height);
        // Bevel borders
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx, by, b.width, 2);
        ctx.fillRect(bx, by, 2, b.height);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(bx, by + b.height - 2, b.width, 2);
        ctx.fillRect(bx + b.width - 2, by, 2, b.height);

        // Screws in corners
        ctx.fillStyle = '#713f12';
        ctx.fillRect(bx + 2, by + 2, 1, 1);
        ctx.fillRect(bx + b.width - 3, by + 2, 1, 1);
        ctx.fillRect(bx + 2, by + b.height - 3, 1, 1);
        ctx.fillRect(bx + b.width - 3, by + b.height - 3, 1, 1);

        // Pixel Question Mark "?"
        ctx.fillStyle = '#713f12';
        ctx.fillRect(bx + 5, by + 4, 6, 2);
        ctx.fillRect(bx + 9, by + 6, 2, 2);
        ctx.fillRect(bx + 7, by + 8, 2, 2);
        ctx.fillRect(bx + 7, by + 11, 2, 2);
        break;
      }

      case 'empty': {
        // Hit/emptied brown block
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx, by, b.width, b.height);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(bx + 1, by + 1, b.width - 2, b.height - 2);
        break;
      }

      case 'pipe_top_left':
      case 'pipe_top_right': {
        const isLeft = b.type === 'pipe_top_left';
        ctx.fillStyle = '#15803d'; // Green rim
        ctx.fillRect(bx, by, b.width, b.height);
        if (isLeft) {
          ctx.fillStyle = '#4ade80'; // Glossy highlight
          ctx.fillRect(bx + 2, by, 3, b.height);
        } else {
          ctx.fillStyle = '#14532d'; // Shadow
          ctx.fillRect(bx + b.width - 3, by, 3, b.height);
        }
        // Top lip border
        ctx.fillStyle = '#166534';
        ctx.fillRect(bx, by, b.width, 2);
        break;
      }

      case 'pipe_left':
      case 'pipe_right': {
        const isLeft = b.type === 'pipe_left';
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(bx, by, b.width, b.height);
        if (isLeft) {
          ctx.fillStyle = '#86efac';
          ctx.fillRect(bx + 3, by, 2, b.height);
        } else {
          ctx.fillStyle = '#14532d';
          ctx.fillRect(bx + b.width - 4, by, 3, b.height);
        }
        break;
      }

      case 'cloud_platform': {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(bx, by, b.width, b.height);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx, by + b.height - 3, b.width, 3);
        // Cloud puffs on top
        ctx.fillStyle = '#ffffff';
        for (let i = 2; i < b.width - 4; i += 8) {
          ctx.fillRect(bx + i, by - 2, 6, 2);
        }
        break;
      }

      case 'wood_bridge': {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bx, by, b.width, b.height);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bx, by + b.height - 2, b.width, 2);
        for (let i = 0; i < b.width; i += 4) {
          ctx.fillRect(bx + i, by, 1, b.height);
        }
        break;
      }

      case 'spike': {
        ctx.fillStyle = '#e2e8f0';
        for (let i = 0; i < b.width; i += 8) {
          ctx.beginPath();
          ctx.moveTo(bx + i, by + b.height);
          ctx.lineTo(bx + i + 4, by);
          ctx.lineTo(bx + i + 8, by + b.height);
          ctx.fill();
        }
        // Red tip warning
        ctx.fillStyle = '#ef4444';
        for (let i = 0; i < b.width; i += 8) {
          ctx.fillRect(bx + i + 3, by + 1, 2, 3);
        }
        break;
      }
    }
  }

  private renderSpring(ctx: CanvasRenderingContext2D, s: Spring) {
    const sx = Math.floor(s.x);
    const sy = Math.floor(s.y);
    const isCompressed = s.bounceTimer > 0;
    const h = isCompressed ? 8 : 14;

    ctx.fillStyle = '#ef4444'; // Red top pad
    ctx.fillRect(sx, sy + 16 - h, s.width, 4);

    // Coils
    ctx.fillStyle = '#e2e8f0';
    if (isCompressed) {
      ctx.fillRect(sx + 3, sy + 12, s.width - 6, 4);
    } else {
      ctx.fillRect(sx + 2, sy + 6, s.width - 4, 3);
      ctx.fillRect(sx + 4, sy + 9, s.width - 8, 3);
      ctx.fillRect(sx + 2, sy + 12, s.width - 4, 3);
    }
  }

  private renderFlagpole(ctx: CanvasRenderingContext2D, fp: Flagpole) {
    const fx = Math.floor(fxCoord(fp.x));
    const fy = Math.floor(fp.y);

    // Base block
    ctx.fillStyle = '#334155';
    ctx.fillRect(fx - 6, fy + fp.height - 4, 16, 8);

    // Pole
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(fx, fy, 4, fp.height);
    // Gold finial on top
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(fx - 2, fy - 6, 8, 8);

    // Red Golden-fringed Flag
    const flagY = Math.floor(fp.flagY);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(fx + 4, flagY);
    ctx.lineTo(fx + 22, flagY + 6);
    ctx.lineTo(fx + 4, flagY + 14);
    ctx.fill();

    // Star icon on flag
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(fx + 7, flagY + 5, 4, 4);
  }

  // --- Collectibles ---

  private renderCollectible(ctx: CanvasRenderingContext2D, col: Collectible) {
    const cx = Math.floor(col.x);
    const cy = Math.floor(col.y + col.floatOffset);

    switch (col.type) {
      case 'coin': {
        // 4-frame rotating 3D coin
        const frame = col.animFrame % 4;
        ctx.fillStyle = '#eab308';
        if (frame === 0) {
          // Full oval
          ctx.fillRect(cx + 1, cy, 10, 12);
          ctx.fillStyle = '#fef08a'; // Shine
          ctx.fillRect(cx + 3, cy + 2, 2, 8);
          ctx.fillStyle = '#ca8a04';
          ctx.fillRect(cx + 6, cy + 3, 2, 6);
        } else if (frame === 1 || frame === 3) {
          // Slimmer
          ctx.fillRect(cx + 3, cy, 6, 12);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx + 4, cy + 2, 2, 8);
        } else {
          // Edge line
          ctx.fillRect(cx + 5, cy, 2, 12);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(cx + 5, cy + 2, 2, 3);
        }
        break;
      }

      case 'star': {
        // Glowing animated star
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(cx + 7, cy);
        ctx.lineTo(cx + 9, cy + 4);
        ctx.lineTo(cx + 14, cy + 5);
        ctx.lineTo(cx + 10, cy + 9);
        ctx.lineTo(cx + 12, cy + 14);
        ctx.lineTo(cx + 7, cy + 11);
        ctx.lineTo(cx + 2, cy + 14);
        ctx.lineTo(cx + 4, cy + 9);
        ctx.lineTo(cx, cy + 5);
        ctx.lineTo(cx + 5, cy + 4);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + 5, cy + 5, 1, 3);
        ctx.fillRect(cx + 8, cy + 5, 1, 3);
        break;
      }

      case 'fire_flower': {
        // Petals
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(cx + 2, cy, 10, 10);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(cx + 4, cy + 2, 6, 6);
        // Stalk and leaves
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(cx + 6, cy + 10, 2, 5);
        ctx.fillRect(cx + 2, cy + 12, 4, 2);
        ctx.fillRect(cx + 8, cy + 12, 4, 2);
        // Eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx + 5, cy + 4, 1, 2);
        ctx.fillRect(cx + 8, cy + 4, 1, 2);
        break;
      }

      case 'cherry_1up': {
        // Cherries / 1UP mushroom
        ctx.fillStyle = '#10b981'; // Green 1UP cap
        ctx.fillRect(cx + 1, cy, 12, 8);
        ctx.fillStyle = '#f8fafc'; // White spots
        ctx.fillRect(cx + 3, cy + 2, 3, 3);
        ctx.fillRect(cx + 8, cy + 2, 3, 3);
        // Stem
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(cx + 4, cy + 8, 6, 5);
        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx + 5, cy + 9, 1, 3);
        ctx.fillRect(cx + 8, cy + 9, 1, 3);
        break;
      }

      case 'speed_boots': {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(cx + 2, cy + 2, 10, 6);
        ctx.fillRect(cx + 6, cy + 8, 8, 4);
        ctx.fillStyle = '#fef08a';
        // Wing
        ctx.fillRect(cx, cy, 4, 3);
        break;
      }
    }
  }

  // --- Enemies ---

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, gameTime: number) {
    const ex = Math.floor(enemy.x);
    const ey = Math.floor(enemy.y);

    if (enemy.isSquashed) {
      // Squashed pancake state
      ctx.fillStyle = '#b45309';
      ctx.fillRect(ex, ey + 10, enemy.width, 6);
      return;
    }

    switch (enemy.type) {
      case 'urchin': {
        // Spiky walking shell
        ctx.save();
        if (enemy.facing === 'right') {
          ctx.translate(ex + enemy.width, ey);
          ctx.scale(-1, 1);
        } else {
          ctx.translate(ex, ey);
        }

        // Spiky Shell dome
        ctx.fillStyle = '#991b1b'; // Red/Brown shell
        ctx.fillRect(2, 2, 12, 10);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(3, 1, 10, 2);
        // Spikes on back
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(1, 4, 2, 2);
        ctx.fillRect(4, 0, 2, 2);
        ctx.fillRect(8, 0, 2, 2);
        ctx.fillRect(12, 4, 2, 2);

        // Angry yellow eyes
        ctx.fillStyle = '#fde047';
        ctx.fillRect(10, 5, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(11, 6, 1, 2);

        // Walking feet
        const step = (Math.floor(enemy.animTimer / 8) % 2) === 0;
        ctx.fillStyle = '#fbbf24';
        if (step) {
          ctx.fillRect(2, 12, 4, 3);
          ctx.fillRect(9, 13, 4, 2);
        } else {
          ctx.fillRect(2, 13, 4, 2);
          ctx.fillRect(9, 12, 4, 3);
        }

        ctx.restore();
        break;
      }

      case 'winged_beetle': {
        // Flying/hopping iridescent winged beetle
        ctx.save();
        ctx.translate(ex, ey);

        // Flapping wings
        const flap = Math.sin(gameTime * 20) > 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        if (flap) {
          ctx.fillRect(1, -3, 6, 5);
          ctx.fillRect(9, -3, 6, 5);
        } else {
          ctx.fillRect(0, 1, 5, 5);
          ctx.fillRect(11, 1, 5, 5);
        }

        // Beetle Body (Teal / Emerald)
        ctx.fillStyle = '#0d9488';
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(4, 2, 8, 3);

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.facing === 'left' ? 3 : 10, 5, 3, 3);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(enemy.facing === 'left' ? 3 : 12, 6, 1, 2);

        ctx.restore();
        break;
      }

      case 'piranha': {
        // Pipe chomper popping up
        ctx.save();
        ctx.translate(ex, ey);

        // Stalk
        ctx.fillStyle = '#15803d';
        ctx.fillRect(6, 10, 4, 10);

        // Red spotted head
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(2, 2, 12, 9);
        // White spots
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 3, 2, 2);
        ctx.fillRect(10, 3, 2, 2);

        // Teeth (animated snap)
        const open = (Math.floor(enemy.animTimer / 12) % 2) === 0;
        ctx.fillStyle = '#ffffff';
        if (open) {
          ctx.fillRect(4, 8, 2, 2);
          ctx.fillRect(8, 8, 2, 2);
          ctx.fillStyle = '#000000';
          ctx.fillRect(2, 7, 12, 2);
        } else {
          ctx.fillRect(3, 7, 10, 1);
        }

        ctx.restore();
        break;
      }

      case 'boss': {
        // Iron Spiketoad King (32x32 Boss)
        ctx.save();
        ctx.translate(ex, ey);

        // Shaking when hit or enraged
        if (enemy.health < enemy.maxHealth) {
          // Boss rage aura
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.fillRect(-4, -4, 40, 40);
        }

        // Big spiked crown
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(6, 0, 20, 6);
        ctx.fillRect(8, -4, 4, 4);
        ctx.fillRect(14, -6, 4, 6);
        ctx.fillRect(20, -4, 4, 4);

        // Massive toad body
        ctx.fillStyle = '#475569'; // Slate armor skin
        ctx.fillRect(4, 6, 24, 20);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(6, 4, 20, 4);

        // Glowing red dragon eyes
        ctx.fillStyle = '#ef4444';
        if (enemy.facing === 'left') {
          ctx.fillRect(6, 10, 6, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(7, 11, 2, 2);
        } else {
          ctx.fillRect(20, 10, 6, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(23, 11, 2, 2);
        }

        // Huge spiked teeth mouth
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(6, 18, 20, 6);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(8, 18, 3, 3);
        ctx.fillRect(14, 18, 3, 3);
        ctx.fillRect(20, 18, 3, 3);

        // Sturdy claw feet
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, 26, 8, 6);
        ctx.fillRect(22, 26, 8, 6);

        // Boss Health Bar above head
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, -14, 32, 5);
        const hpPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = enemy.health > 1 ? '#22c55e' : '#ef4444';
        ctx.fillRect(1, -13, Math.floor(30 * hpPercent), 3);

        ctx.restore();
        break;
      }
    }
  }

  // --- Player Adventurer Hero ---

  private renderPlayer(ctx: CanvasRenderingContext2D, p: Player, gameTime: number) {
    // Invulnerability flashing
    if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    const px = Math.floor(p.x);
    const py = Math.floor(p.y);

    if (p.facing === 'left') {
      ctx.translate(px + p.width, py);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(px, py);
    }

    // Star power rainbow tint
    let tunicColor = '#0284c7'; // default cyan/blue
    let capeColor = '#dc2626'; // default red cape
    if (p.starTimer > 0) {
      const hue = Math.floor((gameTime * 360) % 360);
      tunicColor = `hsl(${hue}, 90%, 55%)`;
      capeColor = `hsl(${(hue + 120) % 360}, 90%, 50%)`;
    } else if (p.powerup === 'fire') {
      tunicColor = '#ffffff'; // Fire Mario style white tunic
      capeColor = '#ea580c';
    }

    // Cape flutter & render behind or fluttering
    this.renderCape(ctx, p, capeColor);

    // Adventurer Helmet with gold visor
    ctx.fillStyle = '#64748b'; // Slate helmet
    ctx.fillRect(3, 1, 10, 8);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(4, 0, 8, 2);
    // Gold visor
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, 4, 5, 3);
    // Helmet feather plume
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(1, -2, 4, 3);
    ctx.fillRect(3, -4, 3, 3);

    // Hero Face / Chin
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(5, 7, 4, 2);

    // Tunic Body
    ctx.fillStyle = tunicColor;
    ctx.fillRect(4, 9, 8, 6);

    // Leather Belt & Buckle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 14, 8, 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(7, 14, 2, 2);

    // Legs / Boots
    ctx.fillStyle = '#1e293b'; // Trousers
    ctx.fillStyle = '#92400e'; // Leather boots
    if (!p.grounded) {
      // Jump pose: legs tucked
      ctx.fillRect(4, 16, 4, 4);
      ctx.fillRect(8, 15, 4, 4);
    } else if (Math.abs(p.vx) > 0.2) {
      // Running animation
      const runCycle = Math.floor(p.walkFrame) % 4;
      if (runCycle === 0) {
        ctx.fillRect(3, 16, 4, 5);
        ctx.fillRect(9, 16, 4, 4);
      } else if (runCycle === 1) {
        ctx.fillRect(5, 16, 4, 4);
        ctx.fillRect(7, 16, 4, 4);
      } else if (runCycle === 2) {
        ctx.fillRect(7, 16, 4, 5);
        ctx.fillRect(4, 16, 4, 4);
      } else {
        ctx.fillRect(5, 16, 4, 4);
        ctx.fillRect(7, 16, 4, 4);
      }
    } else {
      // Idle standing
      ctx.fillRect(4, 16, 3, 5);
      ctx.fillRect(9, 16, 3, 5);
    }

    // Cape Spin Effect (Whirlwind circle when spinning)
    if (p.isSpinning) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(8, 10, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.beginPath();
      ctx.arc(8, 10, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderCape(ctx: CanvasRenderingContext2D, p: Player, color: string) {
    ctx.fillStyle = color;
    if (p.isSpinning) {
      // Full flare cape
      ctx.fillRect(-2, 7, 6, 8);
      ctx.fillRect(12, 7, 6, 8);
    } else if (!p.grounded) {
      // High jump arching cape
      ctx.beginPath();
      ctx.moveTo(3, 9);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-7, 13);
      ctx.lineTo(3, 14);
      ctx.fill();
    } else if (Math.abs(p.vx) > 0.3) {
      // Fluttering running cape
      ctx.beginPath();
      ctx.moveTo(3, 9);
      ctx.lineTo(-5, 8 + Math.sin(p.walkFrame * 2) * 2);
      ctx.lineTo(-4, 14 + Math.sin(p.walkFrame * 2) * 2);
      ctx.lineTo(3, 13);
      ctx.fill();
    } else {
      // Resting cape
      ctx.fillRect(1, 9, 3, 7);
    }
  }

  // --- Projectiles & Particles ---

  private renderProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
    const px = Math.floor(p.x);
    const py = Math.floor(p.y);
    // Bouncing Fireball
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(px, py, p.radius + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(px, py, p.radius - 1, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.alpha);
    const px = Math.floor(p.x);
    const py = Math.floor(p.y);
    const sz = Math.max(1, Math.floor(p.size));

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(px, py, sz, sz);
    }
    ctx.globalAlpha = 1;
  }
}

function fxCoord(val: number): number {
  return val;
}
