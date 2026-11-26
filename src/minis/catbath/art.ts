import Phaser from 'phaser';
import { Doll, Look, doll } from '../../art/fight';
import { Paper, burstPath, fillPaper, glued, makePaperArt, makeWord, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from '../../art/sticker';
import { BOARD, BODIES, V } from './layout';

/** The paper stand-ins for "Bath time": what is on the page until there is a photo
 *  (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "catbath_" (a word on a burst: "word_catbath_..."). The game
 *  cannot make a picture by any other name, or draw over one that is not its own.
 *
 *  Pappy is a body and a head apart: the head is his real face (everybody's set,
 *  docs/characters.md), hung on by the chin. */

const DARK = '#241a14';

function shape(c: Ctx, draw: () => void, sheet: Paper, wash?: string): void {
  glued(c, () => {
    c.beginPath();
    draw();
    fillPaper(c, sheet);
    if (wash) {
      c.fillStyle = wash;
      c.fill();
    }
  });
}

function flat(c: Ctx, draw: () => void, sheet: Paper, wash?: string): void {
  c.beginPath();
  draw();
  fillPaper(c, sheet);
  if (wash) {
    c.fillStyle = wash;
    c.fill();
  }
}

function ink(c: Ctx, draw: () => void, w = 2.4, colour = DARK): void {
  c.beginPath();
  draw();
  c.strokeStyle = colour;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.stroke();
}

function dot(c: Ctx, x: number, y: number, r: number, colour = DARK): void {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = colour;
  c.fill();
}

function dice(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function buildArt(scene: Phaser.Scene): void {
  pappy(scene);
  cats(scene);
  kitchen(scene);
  things(scene);
  words(scene);
}

// ---- Pappy ----------------------------------------------------------------------------------------

const PAPPY: Look = { skin: 'manila', top: 'red', legs: 'grey', arm: 13, leg: 18 };

/** His arms in each pose (the rest of him is the same: square on to the camera, behind the counter). */
const ARMS: Record<string, { elbows: [V, V] }> = {
  stand: { elbows: [[-52, -146], [52, -146]] },
  grab: { elbows: [[-80, -164], [52, -146]] },
  choke: { elbows: [[12, -160], [70, -150]] },
  scrub: { elbows: [[10, -150], [80, -164]] },
  wring: { elbows: [[-4, -150], [104, -186]] },
  hang: { elbows: [[-46, -226], [46, -226]] },
};

function crown(chin: V, tilt: number): V {
  return [chin[0] + Math.sin(tilt) * 25, chin[1] - Math.cos(tilt) * 25];
}

function pappy(scene: Phaser.Scene): void {
  for (const [name, b] of Object.entries(BODIES)) {
    const p: Doll = {
      hips: [[-14, -112], [14, -112]], knees: [[-14, -56], [14, -56]], feet: [[-18, 0], [18, 0]],
      shoulders: [[-28, -184], [28, -184]], elbows: ARMS[name].elbows, hands: b.hands,
      head: crown(b.chin, b.tilt), tilt: b.tilt,
    };
    makePaperArt(scene, `catbath_pappy_${name}`, b.w, b.h, (c) => {
      c.translate(b.ax, b.ay);
      doll(c, p, PAPPY);
      // short sleeves, rolled up for the job
      for (const side of [0, 1]) {
        const [s, e] = [p.shoulders[side], p.elbows[side]];
        glued(c, () => strokePaper(c, [s[0], s[1], s[0] + (e[0] - s[0]) * 0.55, s[1] + (e[1] - s[1]) * 0.55], 'red', PAPPY.arm + 5));
      }
      // and a dish towel tucked in his belt
      shape(c, () => poly(c, [8, -116, 34, -116, 32, -70, 10, -72]), 'white', 'rgba(60, 120, 200, 0.18)');
      for (const y of [-104, -84]) ink(c, () => { c.moveTo(10, y); c.lineTo(32, y); }, 2.4, 'rgba(200, 40, 40, 0.6)');
    }, { border: 2.5, ax: b.ax, ay: b.ay });
  }
  // a hand, gripping (it goes in front of whatever it holds)
  makePaperArt(scene, 'catbath_hand', 30, 30, (c) => {
    shape(c, () => ellipse(c, 15, 15, 13, 11), 'manila', 'rgba(214, 96, 70, 0.2)');
    for (const x of [8, 14, 20]) ink(c, () => { c.moveTo(x, 9); c.lineTo(x + 1, 14); }, 1.4, 'rgba(36, 26, 20, 0.5)');
  }, { border: 1.6 });
  // claw marks, where a cat got him
  makeArt(scene, 'catbath_scratch', 34, 30, (c) => {
    for (const i of [0, 1, 2]) ink(c, () => { c.moveTo(4 + i * 9, 2); c.lineTo(12 + i * 9, 28); }, 2.6, 'rgba(200, 20, 30, 0.85)');
  }, { border: 0 });
  // the paper head, for a page with no photos
  makePaperArt(scene, 'catbath_head_pappy', 90, 104, (c) => {
    c.translate(45, 96);
    shape(c, () => ellipse(c, 0, -40, 30, 38), 'manila');
    shape(c, () => ellipse(c, 0, -70, 31, 14), 'white');
    for (const s of [-1, 1]) dot(c, s * 11, -44, 3.2);
    shape(c, () => ellipse(c, 0, -24, 14, 5), 'white');
    ink(c, () => { c.moveTo(-9, -16); c.quadraticCurveTo(0, -20, 9, -16); });
  }, { border: 2.2, ax: 45, ay: 96 });
}

// ---- the cats ---------------------------------------------------------------------------------------

/** The three of them: an orange tabby, a black one, and a grey one with a white face. */
interface Cat { fur: Paper; wash?: string; stripes?: string; muzzle?: Paper; eye: string }
export const CATS: Cat[] = [
  { fur: 'yellow', wash: 'rgba(235, 120, 20, 0.55)', stripes: 'rgba(150, 60, 0, 0.55)', eye: '#3c9a3a' },
  { fur: 'black', eye: '#e8c020' },
  { fur: 'grey', muzzle: 'white', stripes: 'rgba(60, 60, 70, 0.35)', eye: '#3a7ac8' },
];

type Eyes = 'mad' | 'x' | 'swirl' | 'grump' | 'glare';

/** A cat's head, its chin at (0, 0), looking at the camera. */
function catHead(c: Ctx, k: Cat, eyes: Eyes, mouth: 'hiss' | 'tongue' | 'frown' | 'none', r = 26, droop = false): void {
  const cy = -r;
  // ears: pricked, or flattened and drooping when it is wet through
  for (const s of [-1, 1]) {
    const pts = droop ? [s * r * 0.5, cy - r * 0.7, s * r * 1.25, cy - r * 0.2, s * r * 0.85, cy - r * 0.95] : [s * r * 0.35, cy - r * 0.8, s * r * 0.95, cy - r * 1.55, s * r * 0.95, cy - r * 0.5];
    shape(c, () => poly(c, pts), k.fur, k.wash);
  }
  shape(c, () => ellipse(c, 0, cy, r * 1.08, r), k.fur, k.wash);
  if (k.stripes) for (const x of [-0.35, 0, 0.35]) ink(c, () => { c.moveTo(x * r, cy - r * 0.95); c.lineTo(x * r * 0.8, cy - r * 0.55); }, 3, k.stripes);
  if (k.muzzle) shape(c, () => ellipse(c, 0, cy + r * 0.42, r * 0.62, r * 0.45), k.muzzle);
  const ex = r * 0.4, ey = cy - r * 0.12;
  const white = k.fur === 'black' ? 'rgba(255,255,255,0.85)' : DARK;
  for (const s of [-1, 1]) {
    const x = s * ex;
    if (eyes === 'x') {
      ink(c, () => { c.moveTo(x - 5, ey - 5); c.lineTo(x + 5, ey + 5); c.moveTo(x + 5, ey - 5); c.lineTo(x - 5, ey + 5); }, 2.8, white);
    } else if (eyes === 'swirl') {
      ink(c, () => { for (let a = 0; a < 10; a += 0.3) { const rr2 = a * 0.6; const px = x + Math.cos(a) * rr2, py = ey + Math.sin(a) * rr2; if (a === 0) c.moveTo(px, py); else c.lineTo(px, py); } }, 1.6, white);
    } else {
      // open eyes, the lids down hard in the middle (mad), half shut (grump), or narrowed to slits (glare)
      const h = eyes === 'mad' ? 7 : eyes === 'grump' ? 4 : 3;
      shape(c, () => ellipse(c, x, ey, 7, h), 'white');
      dot(c, x, ey, Math.min(h, 4), k.eye);
      dot(c, x, ey, 1.6);
      ink(c, () => { c.moveTo(x - s * 9, ey - 10 + (eyes === 'grump' ? 4 : 0)); c.lineTo(x + s * 6, ey - (eyes === 'glare' ? 3 : 6)); }, 3, white);
    }
  }
  // nose, whiskers, mouth
  shape(c, () => poly(c, [-4, cy + r * 0.22, 4, cy + r * 0.22, 0, cy + r * 0.34]), 'red', 'rgba(255, 160, 180, 0.6)');
  for (const s of [-1, 1]) for (const dy of [-3, 3]) ink(c, () => { c.moveTo(s * 8, cy + r * 0.36 + dy); c.lineTo(s * (r + 12), cy + r * 0.3 + dy * 2.4); }, 1, white);
  if (mouth === 'hiss') {
    shape(c, () => ellipse(c, 0, cy + r * 0.6, 9, 8), 'black');
    for (const s of [-1, 1]) shape(c, () => poly(c, [s * 6, cy + r * 0.48, s * 3, cy + r * 0.66, s * 8, cy + r * 0.54]), 'white');
  } else if (mouth === 'tongue') {
    ink(c, () => { c.moveTo(-7, cy + r * 0.5); c.lineTo(7, cy + r * 0.5); }, 2, white);
    shape(c, () => ellipse(c, 3, cy + r * 0.72, 5, 9, -0.3), 'red', 'rgba(255, 140, 160, 0.4)');
  } else if (mouth === 'frown') {
    ink(c, () => { c.moveTo(-8, cy + r * 0.62); c.quadraticCurveTo(0, cy + r * 0.42, 8, cy + r * 0.62); }, 2, white);
  }
}

/** A cat hanging from its neck (held there, or pegged to the line), its neck at (0, 0). */
function catHanging(c: Ctx, k: Cat, how: 'mad' | 'out' | 'wet'): void {
  const thin = how === 'wet' ? 0.7 : 1, fur = k.fur;
  // tail, back legs, body, front legs
  const tail = how === 'mad' ? [10, 76, 34, 96, 52, 82, 58, 56] : [8, 78, 14, 104, 10, 124, 16, 138];
  glued(c, () => strokePaper(c, tail, fur, how === 'mad' ? 14 : 8 * thin));
  for (const s of [-1, 1]) {
    const leg = how === 'mad' ? [s * 14, 68, s * 34, 90] : [s * 10, 70, s * 12, 100];
    glued(c, () => strokePaper(c, leg, fur, 11 * thin));
  }
  shape(c, () => ellipse(c, 0, 38, 24 * thin, 40), fur, k.wash);
  if (k.stripes) for (const y of [22, 38, 54]) ink(c, () => { c.moveTo(-18 * thin, y); c.quadraticCurveTo(0, y + 5, 18 * thin, y); }, 3, k.stripes);
  if (k.muzzle) shape(c, () => ellipse(c, 0, 34, 12 * thin, 22), k.muzzle);
  for (const s of [-1, 1]) {
    const arm = how === 'mad' ? [s * 16, 16, s * 40, 30, s * 50, 12] : [s * 12, 18, s * 16, 46, s * 14, 62];
    glued(c, () => strokePaper(c, arm, fur, 10 * thin));
    // claws out
    if (how === 'mad') for (const d of [-5, 0, 5]) ink(c, () => { c.moveTo(s * 50 + d, 8); c.lineTo(s * 52 + d * 1.4, -1); }, 1.8, '#fbf6ea');
  }
  c.save();
  c.translate(0, 6);
  if (how === 'mad') {
    // its fur stood on end
    burstPath(c, 0, -26, 34, 31, 15, 4);
    fillPaper(c, fur);
    if (k.wash) { c.fillStyle = k.wash; c.fill(); }
    catHead(c, k, 'mad', 'hiss');
  } else if (how === 'out') catHead(c, k, 'x', 'tongue');
  else catHead(c, k, 'swirl', 'tongue', 22, true);
  c.restore();
  if (how === 'wet') {
    // water running off it
    for (const [x, y] of [[-18, 50], [16, 70], [-6, 86], [20, 30]]) {
      shape(c, () => { c.moveTo(x, y); c.quadraticCurveTo(x + 5, y + 10, x, y + 13); c.quadraticCurveTo(x - 5, y + 10, x, y); }, 'sky', 'rgba(255, 255, 255, 0.3)');
    }
  }
}

/** A cat sitting, looking at the camera: held by the spot it sits on. */
function catSitting(c: Ctx, k: Cat): void {
  glued(c, () => strokePaper(c, [26, -6, 46, -10, 50, -30, 42, -40], k.fur, 9));
  shape(c, () => ellipse(c, 0, -26, 30, 27), k.fur, k.wash);
  if (k.stripes) for (const x of [-14, 0, 14]) ink(c, () => { c.moveTo(x, -50); c.lineTo(x, -36); }, 3, k.stripes);
  if (k.muzzle) shape(c, () => ellipse(c, 0, -22, 14, 20), k.muzzle);
  for (const x of [-12, 12]) shape(c, () => ellipse(c, x, -3, 9, 5), k.muzzle ?? k.fur, k.wash);
  c.save();
  c.translate(0, -46);
  catHead(c, k, 'grump', 'frown', 24);
  c.restore();
}

/** A cat wrung out like a towel: twisted from end to end, its head at the left and its tail at the
 *  right, held by the middle. */
function catWrung(c: Ctx, k: Cat, rnd: () => number): void {
  const L = 200;
  glued(c, () => strokePaper(c, [L - 20, 0, L - 2, 8, L + 8, -6], k.fur, 7));
  glued(c, () => { rr(c, 26, -14, L - 50, 28, 12); fillPaper(c, k.fur); if (k.wash) { c.fillStyle = k.wash; c.fill(); } });
  // the twist: stripes winding round it
  for (let x = 36; x < L - 26; x += 14) ink(c, () => { c.moveTo(x, -13); c.quadraticCurveTo(x + 6, 0, x + 12, 13); }, 2.6, k.fur === 'black' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(40, 25, 10, 0.4)');
  // paws, poking out where they could
  for (const [x, s] of [[60, -1], [72, 1], [L - 60, -1], [L - 48, 1]]) shape(c, () => ellipse(c, x, s * 16, 6, 5), k.muzzle ?? k.fur, k.wash);
  c.save();
  c.translate(20, 22);
  c.rotate(-0.15);
  catHead(c, k, 'x', 'tongue', 20, true);
  c.restore();
  for (let i = 0; i < 4; i++) dot(c, 40 + rnd() * (L - 70), 16 + rnd() * 6, 2.4, 'rgba(120, 180, 240, 0.9)');
}

/** A cat that has dried on the line: twice the size it was, every hair on end, and not pleased.
 *  Held by the top, where the pegs are. */
function catDry(c: Ctx, k: Cat, seed: number): void {
  glued(c, () => { burstPath(c, 0, 66, 46, 58, 22, seed); fillPaper(c, k.fur); if (k.wash) { c.fillStyle = k.wash; c.fill(); } });
  if (k.muzzle) glued(c, () => { burstPath(c, 0, 72, 24, 34, 14, seed + 3); fillPaper(c, k.muzzle!); });
  glued(c, () => { burstPath(c, 4, 132, 12, 16, 9, seed + 1); fillPaper(c, k.fur); if (k.wash) { c.fillStyle = k.wash; c.fill(); } });
  for (const s of [-1, 1]) glued(c, () => { burstPath(c, s * 30, 116, 11, 11, 8, seed + 2); fillPaper(c, k.fur); });
  c.save();
  c.translate(0, 40);
  glued(c, () => { burstPath(c, 0, -26, 36, 32, 16, seed + 5); fillPaper(c, k.fur); if (k.wash) { c.fillStyle = k.wash; c.fill(); } });
  catHead(c, k, 'glare', 'frown');
  c.restore();
}

function cats(scene: Phaser.Scene): void {
  CATS.forEach((k, i) => {
    makePaperArt(scene, `catbath_cat${i}_sit`, 110, 110, (c) => { c.translate(50, 104); catSitting(c, k); }, { border: 2.2, ax: 50, ay: 104 });
    for (const how of ['mad', 'out', 'wet'] as const) {
      makePaperArt(scene, `catbath_cat${i}_${how}`, 150, 190, (c) => { c.translate(75, 66); catHanging(c, k, how); }, { border: 2.2, ax: 75, ay: 66 });
    }
    makePaperArt(scene, `catbath_cat${i}_wrung`, 230, 70, (c) => { c.translate(10, 34); catWrung(c, k, dice(i + 2)); }, { border: 2.2, ax: 110, ay: 34 });
    makePaperArt(scene, `catbath_cat${i}_dry`, 130, 170, (c) => { c.translate(65, 10); catDry(c, k, i * 7 + 1); }, { border: 2.2, ax: 65, ay: 10 });
  });
  // the smell of them, rising; and the flies that come with it
  makeArt(scene, 'catbath_stink', 30, 60, (c) => {
    ink(c, () => { c.moveTo(15, 58); c.bezierCurveTo(2, 44, 28, 30, 15, 16); c.quadraticCurveTo(8, 8, 15, 2); }, 4, 'rgba(110, 160, 40, 0.85)');
  }, { border: 0 });
  makeArt(scene, 'catbath_fly', 16, 12, (c) => {
    for (const s of [-1, 1]) {
      ellipse(c, 8 + s * 4, 4, 4.5, 2.4, s * 0.6);
      c.fillStyle = 'rgba(150, 170, 190, 0.55)';
      c.fill();
    }
    ellipse(c, 8, 8, 4, 3);
    c.fillStyle = '#15120f';
    c.fill();
  }, { border: 0 });
}

// ---- the kitchen ------------------------------------------------------------------------------------

/** The kitchen behind him, as wide as the widest page: drawn from -BLEED, -BLEED. */
export const KITCHEN = { w: 1340, h: 520 };

function kitchen(scene: Phaser.Scene): void {
  const { w, h } = KITCHEN, B = 48;
  makeArt(scene, 'catbath_kitchen', w, h, (c) => {
    // wallpaper: harvest gold, with brown and orange flowers on it
    flat(c, () => c.rect(0, 0, w, h), 'yellow', 'rgba(210, 150, 30, 0.35)');
    for (let y = 30; y < h; y += 70) {
      for (let x = (y / 70) % 2 ? 0 : 40; x < w; x += 80) {
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * Math.PI * 2;
          ellipse(c, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, 6);
          c.fillStyle = 'rgba(200, 90, 20, 0.35)';
          c.fill();
        }
        dot(c, x, y, 5, 'rgba(110, 60, 20, 0.5)');
      }
    }
    // cupboards along the top
    for (const [x0, x1] of [[0, 380], [w - 420, w]]) {
      flat(c, () => c.rect(x0, 0, x1 - x0, 150 + B), 'brown', 'rgba(120, 60, 10, 0.2)');
      for (let x = x0 + 10; x < x1 - 60; x += 96) {
        flat(c, () => rr(c, x, 14, 84, 120 + B, 4), 'brown', 'rgba(255, 220, 160, 0.12)');
        shape(c, () => circle(c, x + 74, 110 + B, 4), 'yellow');
      }
    }
    // the fridge, avocado green, and a clock over the door through to the rest of the house
    shape(c, () => rr(c, w - 300, 200, 160, h - 190, 10), 'green', 'rgba(150, 170, 40, 0.5)');
    ink(c, () => { c.moveTo(w - 300, 330); c.lineTo(w - 140, 330); }, 2.4, 'rgba(36, 26, 20, 0.4)');
    shape(c, () => rr(c, w - 160, 250, 8, 50, 3), 'grey');
    shape(c, () => rr(c, w - 160, 360, 8, 60, 3), 'grey');
    flat(c, () => c.rect(420, 190, 170, h - 180), 'brown', 'rgba(40, 20, 5, 0.6)');
    shape(c, () => circle(c, 505, 150, 26), 'white');
    ink(c, () => { c.moveTo(505, 150); c.lineTo(505, 134); c.moveTo(505, 150); c.lineTo(517, 156); }, 2.4);
    // the window over the sink is behind the camera; its light falls on the wall
    const glow = c.createRadialGradient(w / 2, 260, 20, w / 2, 260, 420);
    glow.addColorStop(0, 'rgba(255, 250, 220, 0.3)');
    glow.addColorStop(1, 'rgba(255, 250, 220, 0)');
    c.fillStyle = glow;
    c.fillRect(0, 0, w, h);
  }, { border: 0, ax: 0, ay: 0 });

  // the counter in front of him, and the cupboards under it: a strip that repeats
  makeArt(scene, 'catbath_counter', 128, 160, (c) => {
    flat(c, () => c.rect(0, 0, 128, 22), 'green', 'rgba(160, 180, 60, 0.45)');
    flat(c, () => c.rect(0, 18, 128, 6), 'grey', 'rgba(255, 255, 255, 0.4)');
    flat(c, () => c.rect(0, 24, 128, 136), 'brown', 'rgba(120, 60, 10, 0.15)');
    flat(c, () => rr(c, 8, 34, 112, 120, 4), 'brown', 'rgba(255, 220, 160, 0.14)');
    shape(c, () => rr(c, 98, 50, 6, 26, 3), 'yellow');
  }, { border: 0, ax: 0, ay: 0 });
  // the sink, sunk in the counter; the bubbles heaped up out of it; the tap and the sprayer
  makeArt(scene, 'catbath_basin', 250, 30, (c) => {
    rr(c, 0, 0, 250, 26, 12);
    fillPaper(c, 'grey');
    c.fillStyle = 'rgba(255, 255, 255, 0.35)';
    c.fill();
    rr(c, 10, 4, 230, 16, 8);
    c.fillStyle = 'rgba(40, 50, 60, 0.55)';
    c.fill();
  }, { border: 0, ax: 125, ay: 8 });
  makePaperArt(scene, 'catbath_suds', 270, 96, (c) => {
    const rnd = dice(5);
    for (let i = 0; i < 46; i++) {
      const x = 16 + rnd() * 238, top = 96 - 70 * Math.sin((x / 270) * Math.PI), y = top + rnd() * (90 - top) + 6, r = 10 + rnd() * 14;
      shape(c, () => circle(c, x, y, r), 'white', 'rgba(190, 220, 255, 0.25)');
      dot(c, x - r * 0.35, y - r * 0.35, r * 0.2, 'rgba(255, 255, 255, 0.9)');
    }
  }, { border: 1.8, ax: 135, ay: 90 });
  makePaperArt(scene, 'catbath_board', BOARD.w, BOARD.h, (c) => {
    const { w: bw, h: bh } = BOARD;
    shape(c, () => c.rect(0, 0, bw, bh), 'brown', 'rgba(255, 210, 150, 0.2)');
    shape(c, () => c.rect(12, 30, bw - 24, bh - 50), 'grey', 'rgba(255, 255, 255, 0.35)');
    for (let y = 36; y < bh - 24; y += 8) ink(c, () => { c.moveTo(14, y); c.lineTo(bw - 14, y); }, 2.4, 'rgba(60, 60, 70, 0.45)');
    shape(c, () => rr(c, 8, 6, bw - 16, 20, 4), 'brown', 'rgba(0, 0, 0, 0.12)');
  }, { border: 2.2, ax: BOARD.w / 2, ay: BOARD.h });
  makePaperArt(scene, 'catbath_tap', 110, 90, (c) => {
    glued(c, () => strokePaper(c, [96, 88, 96, 20, 70, 6, 36, 8, 18, 24], 'grey', 12));
    shape(c, () => rr(c, 8, 22, 22, 12, 4), 'grey', 'rgba(255, 255, 255, 0.4)');
  }, { border: 2, ax: 96, ay: 88 });
  // the sprayer, on its hose (held by its foot, in its holder on the counter)
  makePaperArt(scene, 'catbath_sprayer', 44, 84, (c) => {
    shape(c, () => rr(c, 4, 58, 36, 24, 6), 'grey', 'rgba(255, 255, 255, 0.3)');
    shape(c, () => rr(c, 12, 4, 20, 62, 8), 'black', 'rgba(255, 255, 255, 0.15)');
    shape(c, () => rr(c, 8, 0, 28, 14, 5), 'grey');
    shape(c, () => rr(c, 30, 26, 8, 18, 3), 'black');
  }, { border: 2, ax: 22, ay: 82 });
  // the clothesline (a strip of rope), and the pegs that hold a cat on it
  makeArt(scene, 'catbath_rope', 32, 8, (c) => {
    flat(c, () => c.rect(0, 1, 32, 6), 'cream', 'rgba(150, 110, 60, 0.3)');
    for (let x = 0; x < 32; x += 8) ink(c, () => { c.moveTo(x, 7); c.lineTo(x + 6, 1); }, 1.4, 'rgba(110, 80, 40, 0.5)');
  }, { border: 0, ax: 0, ay: 4 });
  makePaperArt(scene, 'catbath_peg', 14, 40, (c) => {
    shape(c, () => rr(c, 1, 0, 5.5, 40, 2.5), 'cream', 'rgba(170, 120, 60, 0.35)');
    shape(c, () => rr(c, 7.5, 0, 5.5, 40, 2.5), 'cream', 'rgba(170, 120, 60, 0.35)');
    shape(c, () => rr(c, 0, 14, 14, 6, 2), 'grey');
  }, { border: 1.2, ax: 7, ay: 12 });
  makePaperArt(scene, 'catbath_hook', 20, 30, (c) => {
    glued(c, () => strokePaper(c, [10, 30, 10, 10, 18, 4, 14, 0], 'grey', 4));
  }, { border: 1.2, ax: 10, ay: 6 });
}

// ---- bubbles, water, and how far along a cat is -------------------------------------------------------

function things(scene: Phaser.Scene): void {
  makePaperArt(scene, 'catbath_bubble', 24, 24, (c) => {
    shape(c, () => circle(c, 12, 12, 10), 'white', 'rgba(190, 220, 255, 0.3)');
    dot(c, 8, 8, 2.4, 'rgba(255, 255, 255, 0.95)');
  }, { border: 1 });
  makeArt(scene, 'catbath_drop', 10, 14, (c) => {
    c.beginPath();
    c.moveTo(5, 0);
    c.quadraticCurveTo(10, 9, 5, 13);
    c.quadraticCurveTo(0, 9, 5, 0);
    fillPaper(c, 'sky');
    c.fillStyle = 'rgba(80, 150, 230, 0.5)';
    c.fill();
  }, { border: 0 });
  // round and round: how to wring one out
  makePaperArt(scene, 'catbath_spin', 150, 150, (c) => {
    c.beginPath();
    c.arc(75, 75, 62, -Math.PI * 0.2, Math.PI * 1.45);
    c.strokeStyle = 'rgba(246, 196, 48, 0.95)';
    c.lineWidth = 9;
    c.lineCap = 'round';
    c.stroke();
    const a = Math.PI * 1.45, x = 75 + Math.cos(a) * 62, y = 75 + Math.sin(a) * 62;
    glued(c, () => { poly(c, [x - 16, y + 6, x + 14, y - 14, x + 10, y + 18]); fillPaper(c, 'yellow'); });
  }, { border: 1.6 });
  makePaperArt(scene, 'catbath_arrow', 60, 120, (c) => {
    glued(c, () => { poly(c, [30, 0, 58, 30, 40, 30, 40, 90, 58, 90, 30, 120, 2, 90, 20, 90, 20, 30, 2, 30]); fillPaper(c, 'yellow'); });
  }, { border: 1.8 });
}

function words(scene: Phaser.Scene): void {
  makeWord(scene, 'word_catbath_hiss', 'HISS!', 'black', 'yellow', 120, 34, 2);
  makeWord(scene, 'word_catbath_rawr', 'RRAWR!', 'red', 'white', 130, 30, 4);
  makeWord(scene, 'word_catbath_out', 'OUT COLD!', 'yellow', 'red', 170, 32, 6);
  makeWord(scene, 'word_catbath_splash', 'SPLOOSH!', 'sky', 'white', 170, 34, 3);
  makeWord(scene, 'word_catbath_scrub', 'SCRUB!', 'white', 'blue', 118, 30, 5);
  makeWord(scene, 'word_catbath_twist', 'TWIST!', 'yellow', 'blue', 118, 30, 7);
  makeWord(scene, 'word_catbath_mwah', 'MWAH!', 'red', 'white', 130, 32, 2);
  makeWord(scene, 'word_catbath_clean', 'ALL CLEAN!', 'sky', 'white', 460, 92, 8);
}
