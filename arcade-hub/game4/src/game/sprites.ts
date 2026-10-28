// Procedural 16-Bit Pixel Art Rasterizer for Sword of Xolan
// Generates crisp, retro pixel-art sprites into offscreen HTML5 canvases.

export interface SpriteSet {
  knightIdle: HTMLCanvasElement[];
  knightRun: HTMLCanvasElement[];
  knightJump: HTMLCanvasElement;
  knightDoubleJump: HTMLCanvasElement[];
  knightAttack: HTMLCanvasElement[];
  knightMagic: HTMLCanvasElement;
  knightHurt: HTMLCanvasElement;
  shieldKnight: {
    walk: HTMLCanvasElement[];
    shieldUp: HTMLCanvasElement;
    attack: HTMLCanvasElement;
  };
  spitter: {
    idle: HTMLCanvasElement[];
    spit: HTMLCanvasElement;
  };
  bat: HTMLCanvasElement[];
  spider: HTMLCanvasElement;
  villagerCaged: HTMLCanvasElement[];
  villagerFree: HTMLCanvasElement[];
  barrel: HTMLCanvasElement;
  pot: HTMLCanvasElement;
  chestClosed: HTMLCanvasElement;
  chestOpen: HTMLCanvasElement;
  cage: HTMLCanvasElement;
  coin: HTMLCanvasElement[];
  healthPotion: HTMLCanvasElement;
  manaPotion: HTMLCanvasElement;
  heartFull: HTMLCanvasElement;
  heartEmpty: HTMLCanvasElement;
  manaOrbFull: HTMLCanvasElement;
  manaOrbEmpty: HTMLCanvasElement;
  slashArc: HTMLCanvasElement[];
  magicProjectile: HTMLCanvasElement[];
  spitProjectile: HTMLCanvasElement[];
  tiles: {
    stone: HTMLCanvasElement;
    stoneTop: HTMLCanvasElement;
    woodBridge: HTMLCanvasElement;
    spikes: HTMLCanvasElement;
    lavaSurface: HTMLCanvasElement[];
    lavaFall: HTMLCanvasElement[];
    torch: HTMLCanvasElement[];
    portal: HTMLCanvasElement[];
  };
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

// Draw a pixel grid from an array of strings with a color palette
function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  grid: string[],
  palette: Record<string, string>,
  pixelSize = 1,
  offsetX = 0,
  offsetY = 0
) {
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      const color = palette[char];
      if (color && color !== 'transparent') {
        ctx.fillStyle = color;
        ctx.fillRect(offsetX + c * pixelSize, offsetY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

export function initSpriteSet(): SpriteSet {
  // Common knight palette:
  // . : transparent
  // k : dark outline (#181425)
  // s : skin (#f0b58a)
  // d : skin shade (#be7759)
  // h : hair dark brown (#3a2518)
  // r : cape crimson (#b11e29)
  // R : cape bright (#e63946)
  // a : armor iron grey (#6e7f8d)
  // A : armor bright silver (#a8b9c6)
  // w : white highlight (#ffffff)
  // b : blue boots/trousers (#2b3956)
  // B : blue highlight (#3f557d)
  // g : gold belt (#e5a93b)
  // m : sword metal (#c0cdd8)

  const pKnight: Record<string, string> = {
    '.': 'transparent',
    'k': '#15141f',
    's': '#f2ba91',
    'd': '#bd7759',
    'h': '#3c2317',
    'r': '#9d1927',
    'R': '#e63946',
    'a': '#5f707f',
    'A': '#9cb1c2',
    'w': '#ffffff',
    'b': '#24334a',
    'B': '#3c5275',
    'g': '#f4a226',
    'm': '#d0e0ec',
    'M': '#eef5fc',
  };

  // Knight Idle frames (24x24)
  const idleGrid1 = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "........ksskk...........",
    ".......krAAakk..........",
    "......krrAAAAkmM........",
    "......krraAaak.mM.......",
    "......krkggakk..mM......",
    "......krrbbkk....mM.....",
    "......k.kbbk......mM....",
    "......k.kbbk.......mM...",
    "........kAAk........k...",
    "........kAAk............",
    "........kkkk............",
  ];
  const idleGrid2 = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "........ksskk...........",
    ".......krrAakk..........",
    "......krrAAAAkmM........",
    "......kRraAaak.mM.......",
    "......krkggakk..mM......",
    "......krrbbkk....mM.....",
    "......k.kbbk......mM....",
    "......k.kbbk.......mM...",
    "........kAAk........k...",
    "........kAAk............",
    "........kkkk............",
  ];

  const knightIdle = [idleGrid1, idleGrid2].map(grid => {
    const [c, ctx] = createCanvas(24, 24);
    drawPixelGrid(ctx, grid, pKnight, 1, 0, 4);
    return c;
  });

  // Knight Run (4 frames)
  const runGrid1 = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "........ksskk...........",
    "......krrAAak.kk........",
    ".....krrAAAAkkmM........",
    ".....krrkAaak..mM.......",
    ".....krkggakk...mM......",
    ".....krrbbkkk....mM.....",
    ".....k.kbbk.kbbk..mM....",
    ".......kAAk..kAAk..k....",
    ".......kkkk...kkkk......",
  ];
  const runGrid2 = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "........ksskk...........",
    ".....krrAAakk.kk........",
    "....krrAAAAk.kmM........",
    "....kRraAaak..mM........",
    "....krkggakk...mM.......",
    "....krrbbk......mM......",
    "....k.kbbk.kbbk..mM.....",
    "......kAAk.kAAk...k.....",
    "......kkkk.kkkk.........",
  ];
  const runGrid3 = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "........ksskk...........",
    "......krrAAak.kk........",
    ".....krrAAAAkkmM........",
    ".....krrkAaak..mM.......",
    ".....krkggakk...mM......",
    ".....krr..bbkk...mM.....",
    ".....k.kbbk.kbbk..mM....",
    "......kAAk...kAAk..k....",
    "......kkkk....kkkk......",
  ];
  const runGrid4 = runGrid2;

  const knightRun = [runGrid1, runGrid2, runGrid3, runGrid4].map(grid => {
    const [c, ctx] = createCanvas(24, 24);
    drawPixelGrid(ctx, grid, pKnight, 1, 0, 4);
    return c;
  });

  // Jump Frame
  const jumpGrid = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "......k.ksskk...........",
    ".....krr.AAak.kk........",
    "....krrAAAAk.kmM........",
    "...krrraAaak..mM........",
    "...krkggakk....mM.......",
    "...krkbbkk......mM......",
    "....kbbk.kbbk....mM.....",
    "....kAAk..kAAk....k.....",
    "....kkkk...kkkk.........",
  ];
  const [jumpC, jumpCtx] = createCanvas(24, 24);
  drawPixelGrid(jumpCtx, jumpGrid, pKnight, 1, 0, 3);
  const knightJump = jumpC;

  // Double Jump spin frames (4 rotational frames)
  const knightDoubleJump = [0, 90, 180, 270].map(rot => {
    const [c, ctx] = createCanvas(24, 24);
    ctx.translate(12, 12);
    ctx.rotate((rot * Math.PI) / 180);
    drawPixelGrid(ctx, jumpGrid, pKnight, 1, -12, -12);
    return c;
  });

  // Knight Attack frames (32x24) - with sweeping arc
  const atkGrid1 = [
    "......kkkk..............",
    ".....khhhhk.............",
    ".....khsshR.............",
    ".....kssshR.............",
    "......ksskk.............",
    "....krrAAakk....k.......",
    "...krrAAAAk....kmM......",
    "..krrraAaak...k.mM......",
    "..krkggakk...k..mM......",
    "..krkbbkk...k....mM.....",
    "...kbbk..........k......",
    "...kAAk.................",
    "...kkkk.................",
  ];
  const atkGrid2 = [
    "......kkkk..............",
    ".....khhhhk.............",
    ".....khsshR.............",
    ".....kssshR.............",
    "......ksskk...wwwwww....",
    "....krrAAak.wMMMMMMMwk..",
    "...krrAAAAkwMMMMMMMMMMk.",
    "..krrraAaak..kAAAAAkk...",
    "..krkggakk.kssmMMMMk....",
    "..krkbbkk..kssmMMMMk....",
    "...kbbk.....kkkkkk......",
    "...kAAk.................",
    "...kkkk.................",
  ];
  const atkGrid3 = [
    "......kkkk..............",
    ".....khhhhk.............",
    ".....khsshR.............",
    ".....kssshR....wwwwww...",
    "......ksskk..wMMMMMMMMk.",
    "....krrAAak.wMMMMMMMMMMk",
    "...krrAAAAkwMMMMMMMMMMk.",
    "..krrraAaak..wMMMMMMwk..",
    "..krkggakk....kAAAAk....",
    "..krkbbkk.....kkkk......",
    "...kbbk.................",
    "...kAAk.................",
    "...kkkk.................",
  ];

  const knightAttack = [atkGrid1, atkGrid2, atkGrid3].map(grid => {
    const [c, ctx] = createCanvas(32, 24);
    drawPixelGrid(ctx, grid, pKnight, 1, 0, 4);
    return c;
  });

  // Knight Magic Cast frame
  const magicCastGrid = [
    "........kkkk............",
    ".......khhhhk...........",
    ".......khsshR...........",
    ".......kssshR...........",
    "........ksskk.....wBw...",
    ".......krrAakk...BwBwB..",
    "......krrAAAAk..wBBBBw..",
    "......kRraAaak...BwBwB..",
    "......krkggakk....wBw...",
    "......krrbbkk.ksskk.....",
    "......k.kbbk..ksskk.....",
    "......k.kbbk...kk.......",
    "........kAAk............",
    "........kAAk............",
    "........kkkk............",
  ];
  const [magicC, magicCtx] = createCanvas(28, 24);
  drawPixelGrid(magicCtx, magicCastGrid, pKnight, 1, 0, 4);
  const knightMagic = magicC;

  // Knight Hurt frame
  const hurtGrid = [
    "........kkkk............",
    ".......kddddk...........",
    ".......kdsddk...........",
    ".......kssddk...........",
    "........ksskk...........",
    ".......kwwAAkk..........",
    "......kwwAAAAkkm........",
    "......kwwaAaak.km.......",
    "......kwkggakk..km......",
    "......kwwbbkk....km.....",
    "......k.kbbk......km....",
    "........kAAk.......k....",
    "........kkkk............",
  ];
  const [hurtC, hurtCtx] = createCanvas(24, 24);
  drawPixelGrid(hurtCtx, hurtGrid, pKnight, 1, 0, 4);
  const knightHurt = hurtC;

  // Slash crescent particle sprites (3 frames)
  const slashArc = [0, 1, 2].map(f => {
    const [c, ctx] = createCanvas(32, 32);
    ctx.strokeStyle = f === 0 ? '#ffffff' : f === 1 ? '#aae5ff' : '#4ea8de';
    ctx.lineWidth = 3 - f;
    ctx.beginPath();
    ctx.arc(10, 16, 14, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
    // Inner glow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(11, 16, 12, -Math.PI * 0.35, Math.PI * 0.35);
    ctx.stroke();
    return c;
  });

  // Magic Projectile (Fireball / Energy Orb)
  const magicProjectile = [0, 1, 2].map(f => {
    const [c, ctx] = createCanvas(16, 16);
    // Outer glow
    ctx.fillStyle = f === 0 ? 'rgba(78, 168, 222, 0.4)' : 'rgba(0, 180, 216, 0.4)';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = f === 1 ? '#48cae4' : '#00b4d8';
    ctx.beginPath();
    ctx.arc(8, 8, 5, 0, Math.PI * 2);
    ctx.fill();
    // Center bright spark
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();
    return c;
  });

  // Spit Projectile (Green acid ball)
  const spitProjectile = [0, 1].map(f => {
    const [c, ctx] = createCanvas(12, 12);
    ctx.fillStyle = f === 0 ? '#70e000' : '#38b000';
    ctx.beginPath();
    ctx.arc(6, 6, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ccff33';
    ctx.beginPath();
    ctx.arc(5, 5, 2, 0, Math.PI * 2);
    ctx.fill();
    return c;
  });

  // --- ENEMIES ---

  // 1. Armored Shield Knight (28x28)
  const pEnemyKnight: Record<string, string> = {
    '.': 'transparent',
    'k': '#101015',
    'h': '#2b2d42',
    'e': '#e63946', // glowing red eye slit
    'a': '#4a4e69',
    'A': '#8d99ae',
    'g': '#c77dff',
    's': '#22223b',
    'S': '#6c757d',
    'w': '#f8f9fa',
    'm': '#adb5bd',
  };

  const eShieldWalk1 = [
    "......kkkkkk................",
    ".....khaaaahk...............",
    ".....khheeehk...............",
    ".....khaaaahk.kkk...........",
    "......kAAaakk.kSSkk.........",
    "....kkkAAAAAkkkSSSSkk.......",
    "...kSSkAAAAAk.kSSSSSSk......",
    "...kSSkAAAAAk.kSSSSSSk......",
    "...kSSkaaaak..kSSwSSSk......",
    "....kkkgaagk..kSSSSSSk......",
    "......khhhhk...kSSSSk.......",
    "......khhhhk....kkkk........",
    "......ka..ak................",
    "......kk..kk................",
  ];
  const eShieldWalk2 = [
    "......kkkkkk................",
    ".....khaaaahk...............",
    ".....khheeehk...............",
    ".....khaaaahk.kkk...........",
    "......kAAaakk.kSSkk.........",
    "....kkkAAAAAkkkSSSSkk.......",
    "...kSSkAAAAAk.kSSSSSSk......",
    "...kSSkAAAAAk.kSSSSSSk......",
    "...kSSkaaaak..kSSwSSSk......",
    "....kkkgaagk..kSSSSSSk......",
    ".....kh..hhk...kSSSSk.......",
    ".....kh..hhk....kkkk........",
    ".....ka...ak................",
    ".....kk...kk................",
  ];

  const shieldWalk = [eShieldWalk1, eShieldWalk2].map(grid => {
    const [c, ctx] = createCanvas(28, 28);
    drawPixelGrid(ctx, grid, pEnemyKnight, 1, 0, 6);
    return c;
  });

  // Shield Up defense frame
  const eShieldUpGrid = [
    "......kkkkkk................",
    ".....khaaaahk...............",
    ".....khheeehk...kkkk........",
    ".....khaaaahk..kSSSSkk......",
    "......kAAaakk.kSSSSSSSk.....",
    ".....kkAAAAAk.kSSSSSSSSk....",
    "....k..AAAAAk.kSSSSSSSSk....",
    "....k..AAAAAk.kSSSwSSSSk....",
    "....k..aaaak..kSSSSSSSSk....",
    "....kkkgaagk..kSSSSSSSSk....",
    "......khhhhk...kSSSSSSk.....",
    "......khhhhk....kSSSSk......",
    "......ka..ak.....kkkk.......",
    "......kk..kk................",
  ];
  const [eShieldUpC, eShieldUpCtx] = createCanvas(28, 28);
  drawPixelGrid(eShieldUpCtx, eShieldUpGrid, pEnemyKnight, 1, 0, 6);

  // Shield Knight Attack frame
  const eShieldAtkGrid = [
    "......kkkkkk................",
    ".....khaaaahk...............",
    ".....khheeehk...............",
    ".....khaaaahk...kmmmmmmk....",
    "......kAAaakk..kmmmmmmmmk...",
    "....kkkAAAAAkk.kmmkAAkmmk...",
    "...kSSkAAAAAk...kkk..kkk....",
    "...kSSkAAAAAk.kSSSSk........",
    "...kSSkaaaak..kSSSSk........",
    "....kkkgaagk..kSSSSk........",
    "......khhhhk...kkkk.........",
    "......khhhhk................",
    "......ka..ak................",
    "......kk..kk................",
  ];
  const [eShieldAtkC, eShieldAtkCtx] = createCanvas(28, 28);
  drawPixelGrid(eShieldAtkCtx, eShieldAtkGrid, pEnemyKnight, 1, 0, 6);

  // 2. Spitting Monster (Gargoyle slug)
  const pSpitter: Record<string, string> = {
    '.': 'transparent',
    'k': '#1a0c24',
    'p': '#5c1d68',
    'P': '#8b2fc9',
    'y': '#ffd166', // yellow evil eye
    't': '#f4f1de', // fangs
    'g': '#70e000', // toxic spit
  };
  const spitterIdle1 = [
    "......kkkkkkk.......",
    "....kkPPPPPPPkk.....",
    "...kPPPyPPyPPPk.....",
    "..kPPPyyPyyPPPPk....",
    "..kPPPPPPPPPPPPk....",
    "..kPPtPPtPPtPPPk....",
    "..kPkkkkkkkkkkPk....",
    "..kPPPPPPPPPPPPk....",
    "...kPPPPPPPPPPk.....",
    "....kkkpppppkkk.....",
    "......kkkkkkk.......",
  ];
  const spitterIdle2 = [
    "......kkkkkkk.......",
    "....kkPPPPPPPkk.....",
    "...kPPPyPPyPPPk.....",
    "..kPPPyyPyyPPPPk....",
    "..kPPPPPPPPPPPPk....",
    "..kPPtPPtPPtPPPk....",
    "..kPkkkkkkkkkkPk....",
    "..kPPPPPPPPPPPPk....",
    "...kPPPPPPPPPkk.....",
    "....kkpppppkk.......",
    "......kkkkk.........",
  ];
  const spitterSpitGrid = [
    "......kkkkkkk.......",
    "....kkPPPPPPPkk.....",
    "...kPPPyPPyPPPk.....",
    "..kPPPyyPyyPPPPk....",
    "..kPPPPPPPPPPPPk.gg.",
    "..kPPt......tPPkgggg",
    "..kPkk..gg..kkPkgggg",
    "..kPPPPPPPPPPPPk.gg.",
    "...kPPPPPPPPPPk.....",
    "....kkkpppppkkk.....",
    "......kkkkkkk.......",
  ];

  const spitterIdle = [spitterIdle1, spitterIdle2].map(g => {
    const [c, ctx] = createCanvas(20, 20);
    drawPixelGrid(ctx, g, pSpitter, 1, 0, 4);
    return c;
  });
  const [spitAtkC, spitAtkCtx] = createCanvas(20, 20);
  drawPixelGrid(spitAtkCtx, spitterSpitGrid, pSpitter, 1, 0, 4);

  // 3. Bat / Shadow Drake (flapping wings)
  const pBat: Record<string, string> = {
    '.': 'transparent',
    'k': '#120d20',
    'b': '#3a2e56',
    'B': '#5e4b8b',
    'r': '#ff2a2a', // glowing red eyes
  };
  const batGrid1 = [
    "k.......kk.......k",
    "kkk...kkBBkk...kkk",
    "kBBkkkBBkkBBkkkBBk",
    ".kBBBBBrrrBBBBBBk.",
    "..kBBkBrrrBkBBk...",
    "...kkk.kkkk.kkk...",
  ];
  const batGrid2 = [
    "...kk...kk...kk...",
    ".kkBBk.kBBk.kBBkk.",
    "kBBBBkkkBBkkkBBBBk",
    ".kkBBBBrrrBBBBkk..",
    "...kkk.kkkk.kkk...",
  ];
  const bat = [batGrid1, batGrid2].map(g => {
    const [c, ctx] = createCanvas(18, 14);
    drawPixelGrid(ctx, g, pBat, 1, 0, 3);
    return c;
  });

  // 4. Spider (hanging on web)
  const pSpider: Record<string, string> = {
    '.': 'transparent',
    'k': '#1b1b1e',
    'r': '#9a031e',
    'R': '#e36414',
    'w': '#ffffff',
    't': '#e0e1dd',
  };
  const spiderGrid = [
    ".......kk.......",
    "k.....krrk.....k",
    "kk...krrrrk...kk",
    ".kk.krrrrrrk.kk.",
    "..kkkwwwwwwkkk..",
    "...krkRtktRkr...",
    "..kk.kt..tk.kk..",
    ".k....k..k....k.",
  ];
  const [spiderC, spiderCtx] = createCanvas(16, 16);
  drawPixelGrid(spiderCtx, spiderGrid, pSpider, 1, 0, 4);

  // --- VILLAGER & CAGE ---
  const pVillager: Record<string, string> = {
    '.': 'transparent',
    'k': '#161a1d',
    's': '#f2ba91',
    'h': '#6c584c',
    'c': '#2b9348', // villager tunic green
    'C': '#55a630',
    'b': '#4a4e69',
    'w': '#ffffff',
    'i': '#8d99ae', // cage iron bars
    'wWood': '#7f4f24',
  };

  const villagerInside1 = [
    "iiiiiiiiiiiiiiii",
    "i....khhhk.....i",
    "i...khssshk....i",
    "i...ksswssk....i",
    "i..kkkCCk.k....i",
    "i..k.kCCkk.....i",
    "i....kbbk......i",
    "i....kAAk......i",
    "iiiiiiiiiiiiiiii",
  ];
  const villagerInside2 = [
    "iiiiiiiiiiiiiiii",
    "i....khhhk.....i",
    "i...khssshk....i",
    "i...ksswssk....i",
    "i..k.kCCkk.k...i",
    "i..kkkCCk.kk...i",
    "i....kbbk......i",
    "i....kAAk......i",
    "iiiiiiiiiiiiiiii",
  ];
  const villagerCaged = [villagerInside1, villagerInside2].map(g => {
    const [c, ctx] = createCanvas(20, 20);
    drawPixelGrid(ctx, g, pVillager, 1, 2, 4);
    return c;
  });

  const villagerFree1 = [
    "......khhhk.....",
    ".....khssshk....",
    ".....ksswssk....",
    "..k..kCCCCk..k..",
    "..kkk.CCCC.kkk..",
    "......kbbk......",
    "......kAAk......",
    "......kkkk......",
  ];
  const villagerFree2 = [
    "....k.khhhk.k...",
    "....kkssssskk...",
    ".....ksswssk....",
    ".....kCCCCk.....",
    ".....kCCCCk.....",
    ".....kbbbbk.....",
    "......kAAk......",
    "......kkkk......",
  ];
  const villagerFree = [villagerFree1, villagerFree2].map(g => {
    const [c, ctx] = createCanvas(18, 18);
    drawPixelGrid(ctx, g, pVillager, 1, 1, 2);
    return c;
  });

  // Empty Cage
  const cageGrid = [
    "iiiiiiiiiiiiiiii",
    "i..i..i..i..i..i",
    "i..i..i..i..i..i",
    "i..i..i..i..i..i",
    "i..i..i..i..i..i",
    "i..i..i..i..i..i",
    "i..i..i..i..i..i",
    "iiiiiiiiiiiiiiii",
  ];
  const [cageC, cageCtx] = createCanvas(20, 20);
  drawPixelGrid(cageCtx, cageGrid, pVillager, 1, 2, 4);

  // Barrel
  const pBarrel: Record<string, string> = {
    '.': 'transparent',
    'k': '#1a0c00',
    'w': '#8c4a16',
    'W': '#b7692b',
    'i': '#495057',
    'I': '#adb5bd',
  };
  const barrelGrid = [
    "..kkkkkkkk..",
    ".kWWwWWWWwk.",
    "kIIIIIIIIIIk",
    "kWWwWWwWWWWk",
    "kWWwWWwWWWWk",
    "kIIIIIIIIIIk",
    ".kWWwWWWWwk.",
    "..kkkkkkkk..",
  ];
  const [barrelC, barrelCtx] = createCanvas(16, 16);
  drawPixelGrid(barrelCtx, barrelGrid, pBarrel, 1, 2, 4);

  // Pot
  const pPot: Record<string, string> = {
    '.': 'transparent',
    'k': '#1c0b02',
    'c': '#b55a30',
    'C': '#dc7a48',
    'h': '#f09a6c',
  };
  const potGrid = [
    "...kkkkkk...",
    "..kCCCCCCk..",
    ".kChhCCCCk..",
    "kChhCCCCCCk.",
    "kCCCCCCCCCCk",
    "kCCCCCCCCCCk",
    ".kCCCCCCCCk.",
    "..kkkkkkkk..",
  ];
  const [potC, potCtx] = createCanvas(16, 16);
  drawPixelGrid(potCtx, potGrid, pPot, 1, 2, 4);

  // Chest (Closed and Open)
  const pChest: Record<string, string> = {
    '.': 'transparent',
    'k': '#120b08',
    'w': '#6f3a15',
    'W': '#995424',
    'g': '#ffb703',
    'G': '#ffd166',
    'l': '#ffffff',
  };
  const chestClosedGrid = [
    "...kkkkkkkkkk...",
    ".kkWWgGGGGgWWkk.",
    "kWWWgGGGGGGgWWWk",
    "kWWkkkkkkkkkkWWk",
    "kggkGGGGGGGGkggk",
    "kWWkkggGGggkkWWk",
    "kWWkkgkggkgkkWWk",
    "kWWkkkkkkkkkkWWk",
    "kWWWWWWWWWWWWWWk",
    ".kkkkkkkkkkkkkk.",
  ];
  const [chestClosedC, chestClosedCtx] = createCanvas(20, 16);
  drawPixelGrid(chestClosedCtx, chestClosedGrid, pChest, 1, 2, 3);

  const chestOpenGrid = [
    ".kkWWgGGGGgWWkk.",
    "kWWWgGGGGGGgWWWk",
    ".kkkkkkkkkkkkkk.",
    "kGGGGGGGGGGGGGGk",
    "kWWkkggGGggkkWWk",
    "kWWkkgkggkgkkWWk",
    "kWWkkkkkkkkkkWWk",
    "kWWWWWWWWWWWWWWk",
    ".kkkkkkkkkkkkkk.",
  ];
  const [chestOpenC, chestOpenCtx] = createCanvas(20, 16);
  drawPixelGrid(chestOpenCtx, chestOpenGrid, pChest, 1, 2, 4);

  // Animated Spinning Coin (4 frames)
  const pCoin: Record<string, string> = {
    '.': 'transparent',
    'k': '#7f4f00',
    'g': '#ffb703',
    'G': '#ffe380',
    'w': '#ffffff',
  };
  const coinFrames = [
    [
      ".kkkk.",
      "kGGGGk",
      "kGwGGk",
      "kGGGGk",
      ".kkkk.",
    ],
    [
      ".kk.",
      "kGGk",
      "kGwk",
      "kGGk",
      ".kk.",
    ],
    [
      "kk",
      "kk",
      "kk",
      "kk",
      "kk",
    ],
    [
      ".kk.",
      "kGGk",
      "kwGk",
      "kGGk",
      ".kk.",
    ],
  ];
  const coin = coinFrames.map(g => {
    const [c, ctx] = createCanvas(10, 10);
    drawPixelGrid(ctx, g, pCoin, 1, 2, 2);
    return c;
  });

  // Health and Mana Potions
  const pPotion: Record<string, string> = {
    '.': 'transparent',
    'k': '#1a181b',
    'c': '#d8e2dc', // cork
    'C': '#ffe5d9',
    'r': '#d90429', // red health liquid
    'R': '#ff4d6d',
    'b': '#0077b6', // blue mana liquid
    'B': '#48cae4',
    'w': '#ffffff',
  };
  const healthPotGrid = [
    "...kk...",
    "..kCCk..",
    "..kCCk..",
    ".kwwwwk.",
    "kRwwRRRk",
    "kRRrRRRk",
    "kRRrrrrk",
    ".kkkkkk.",
  ];
  const [healthPotC, healthPotCtx] = createCanvas(12, 12);
  drawPixelGrid(healthPotCtx, healthPotGrid, pPotion, 1, 2, 2);

  const manaPotGrid = [
    "...kk...",
    "..kCCk..",
    "..kCCk..",
    ".kwwwwk.",
    "kBwwBBBk",
    "kBBbBBBk",
    "kBBbbbbk",
    ".kkkkkk.",
  ];
  const [manaPotC, manaPotCtx] = createCanvas(12, 12);
  drawPixelGrid(manaPotCtx, manaPotGrid, pPotion, 1, 2, 2);

  // HUD Heart Full & Empty (12x12)
  const pHeart: Record<string, string> = {
    '.': 'transparent',
    'k': '#38040e',
    'r': '#d90429',
    'R': '#ff4d6d',
    'w': '#ffffff',
    'e': '#4a4e69', // empty heart
    'E': '#6c757d',
  };
  const heartFullGrid = [
    ".kk..kk.",
    "kRRkkRRk",
    "kRwRRRRk",
    "kRRRRRRk",
    ".kRRRRk.",
    "..kRRk..",
    "...kk...",
  ];
  const [heartFullC, heartFullCtx] = createCanvas(12, 12);
  drawPixelGrid(heartFullCtx, heartFullGrid, pHeart, 1, 2, 2);

  const heartEmptyGrid = [
    ".kk..kk.",
    "kEEkkEEk",
    "kEEEEEEk",
    "kEEEEEEk",
    ".kEEEEk.",
    "..kEEk..",
    "...kk...",
  ];
  const [heartEmptyC, heartEmptyCtx] = createCanvas(12, 12);
  drawPixelGrid(heartEmptyCtx, heartEmptyGrid, pHeart, 1, 2, 2);

  // HUD Mana Orb Full & Empty (12x12)
  const pOrb: Record<string, string> = {
    '.': 'transparent',
    'k': '#03045e',
    'b': '#0077b6',
    'B': '#00b4d8',
    'w': '#90e0ef',
    'W': '#ffffff',
    'e': '#343a40',
    'E': '#495057',
  };
  const manaOrbFullGrid = [
    "..kkkk..",
    ".kBWWBBk",
    "kBBWBBBBk",
    "kBBBBBBbk",
    "kBBBBbbbk",
    ".kbbbbk.",
    "..kkkk..",
  ];
  const [manaOrbFullC, manaOrbFullCtx] = createCanvas(12, 12);
  drawPixelGrid(manaOrbFullCtx, manaOrbFullGrid, pOrb, 1, 1, 2);

  const manaOrbEmptyGrid = [
    "..kkkk..",
    ".kEEEEk.",
    "kEEEEEEk",
    "kEEEEEEk",
    "kEEEEEEk",
    ".kEEEEk.",
    "..kkkk..",
  ];
  const [manaOrbEmptyC, manaOrbEmptyCtx] = createCanvas(12, 12);
  drawPixelGrid(manaOrbEmptyCtx, manaOrbEmptyGrid, pOrb, 1, 1, 2);

  // TILES & ENVIRONMENT
  const pTile: Record<string, string> = {
    'd': '#181b24', // dark stone
    's': '#2b3040', // mid stone
    'l': '#41485e', // light stone highlight
    'g': '#2d6a4f', // moss/grass
    'G': '#40916c', // light grass
    'w': '#6a4c28', // bridge wood
    'W': '#8b6339',
    'r': '#adb5bd', // iron spike
    'R': '#dee2e6',
  };

  // Stone Block (16x16)
  const stoneGrid = [
    "llllllllllllllll",
    "lssssssssssssssd",
    "lssssssssssssssd",
    "lssssssssssdssss",
    "lddddddddddddddd",
    "lssssdsssssssssd",
    "lssssdsssssssssd",
    "lddddddddddddddd",
    "lssssssssdsssssd",
    "lssssssssdsssssd",
    "lddddddddddddddd",
    "lssssdsssssssssd",
    "lssssdsssssssssd",
    "lddddddddddddddd",
    "lssssssssssssssd",
    "dddddddddddddddd",
  ];
  const [stoneC, stoneCtx] = createCanvas(16, 16);
  drawPixelGrid(stoneCtx, stoneGrid, pTile, 1, 0, 0);

  // Stone Top (with mossy/grass surface)
  const stoneTopGrid = [
    "GGGGGGGGGGGGGGGG",
    "gggggggggggggggg",
    "lggsggsggggsggsd",
    "lssssssssssdssss",
    "lddddddddddddddd",
    "lssssdsssssssssd",
    "lssssdsssssssssd",
    "lddddddddddddddd",
    "lssssssssdsssssd",
    "lssssssssdsssssd",
    "lddddddddddddddd",
    "lssssdsssssssssd",
    "lssssdsssssssssd",
    "lddddddddddddddd",
    "lssssssssssssssd",
    "dddddddddddddddd",
  ];
  const [stoneTopC, stoneTopCtx] = createCanvas(16, 16);
  drawPixelGrid(stoneTopCtx, stoneTopGrid, pTile, 1, 0, 0);

  // Wood Bridge Plank (16x16)
  const woodBridgeGrid = [
    "WWWWWWWWWWWWWWWW",
    "wwwwwwwwwwwwwwww",
    "WWwWWwWWwWWwWWwW",
    "dddddddddddddddd",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ];
  const [woodBridgeC, woodBridgeCtx] = createCanvas(16, 16);
  drawPixelGrid(woodBridgeCtx, woodBridgeGrid, pTile, 1, 0, 0);

  // Spikes (16x16)
  const spikesGrid = [
    "................",
    "....R......R....",
    "...rRr....rRr...",
    "...rRr....rRr...",
    "..rrRrr..rrRrr..",
    "..rrRrr..rrRrr..",
    ".rrrRrrr.rrrRrrr",
    ".rrrRrrr.rrrRrrr",
    "rrrrrrrrrrrrrrrr",
    "dddddddddddddddd",
    "................",
    "................",
    "................",
    "................",
    "................",
    "................",
  ];
  const [spikesC, spikesCtx] = createCanvas(16, 16);
  drawPixelGrid(spikesCtx, spikesGrid, pTile, 1, 0, 0);

  // Lava Surface & Flow (Animated 2 frames)
  const lavaSurface = [0, 1].map(f => {
    const [c, ctx] = createCanvas(16, 16);
    ctx.fillStyle = f === 0 ? '#d90429' : '#ef233c';
    ctx.fillRect(0, 0, 16, 16);
    // Glowing surface waves
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(0, 0, 16, 3);
    ctx.fillStyle = '#ffea00';
    if (f === 0) {
      ctx.fillRect(2, 0, 5, 2);
      ctx.fillRect(10, 0, 4, 2);
    } else {
      ctx.fillRect(5, 0, 6, 2);
      ctx.fillRect(13, 0, 3, 2);
    }
    return c;
  });

  const lavaFall = [0, 1].map(f => {
    const [c, ctx] = createCanvas(16, 16);
    ctx.fillStyle = 'rgba(217, 4, 41, 0.85)';
    ctx.fillRect(4, 0, 8, 16);
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(6, 0, 4, 16);
    ctx.fillStyle = '#ffffff';
    if (f === 0) {
      ctx.fillRect(7, 2, 2, 5);
      ctx.fillRect(7, 10, 2, 4);
    } else {
      ctx.fillRect(7, 0, 2, 4);
      ctx.fillRect(7, 7, 2, 6);
    }
    return c;
  });

  // Animated Wall Torch (3 frames)
  const torch = [0, 1, 2].map(f => {
    const [c, ctx] = createCanvas(16, 16);
    // Sconce iron bracket
    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(6, 9, 4, 6);
    ctx.fillRect(5, 8, 6, 2);
    // Flame
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.arc(8, 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(8, 5 - (f % 2), 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(8, 4 - (f % 2), 1.5, 0, Math.PI * 2);
    ctx.fill();
    return c;
  });

  // Exit Portal / Gate (24x32 animated 3 frames)
  const portal = [0, 1, 2].map(f => {
    const [c, ctx] = createCanvas(28, 36);
    // Stone archway
    ctx.fillStyle = '#1c1924';
    ctx.fillRect(2, 4, 24, 32);
    ctx.fillStyle = '#393447';
    ctx.fillRect(0, 2, 4, 34);
    ctx.fillRect(24, 2, 4, 34);
    ctx.fillRect(0, 0, 28, 4);
    // Archway runic portal glow
    const grad = ctx.createRadialGradient(14, 18, 2, 14, 18, 12);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, f === 0 ? '#48cae4' : f === 1 ? '#7209b7' : '#f72585');
    grad.addColorStop(0.7, '#3a0ca3');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(14, 20, 9, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    return c;
  });

  return {
    knightIdle,
    knightRun,
    knightJump,
    knightDoubleJump,
    knightAttack,
    knightMagic,
    knightHurt,
    shieldKnight: {
      walk: shieldWalk,
      shieldUp: eShieldUpC,
      attack: eShieldAtkC,
    },
    spitter: {
      idle: spitterIdle,
      spit: spitAtkC,
    },
    bat,
    spider: spiderC,
    villagerCaged,
    villagerFree,
    barrel: barrelC,
    pot: potC,
    chestClosed: chestClosedC,
    chestOpen: chestOpenC,
    cage: cageC,
    coin,
    healthPotion: healthPotC,
    manaPotion: manaPotC,
    heartFull: heartFullC,
    heartEmpty: heartEmptyC,
    manaOrbFull: manaOrbFullC,
    manaOrbEmpty: manaOrbEmptyC,
    slashArc,
    magicProjectile,
    spitProjectile,
    tiles: {
      stone: stoneC,
      stoneTop: stoneTopC,
      woodBridge: woodBridgeC,
      spikes: spikesC,
      lavaSurface,
      lavaFall,
      torch,
      portal,
    },
  };
}
