import Phaser from 'phaser';
import { H, MAX_W } from '../config';
import { BLEED } from './finish';
import { Ctx, circle, ellipse, makeArt, poly, rr } from './sticker';
import { Paper, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from './paper';

/** The bonus level's school hallway, as cut paper, seen over Bill's shoulder.
 *  These are stand-ins: any of them is replaced by a photo cutout registered
 *  under the same key (see photos.ts). */

/** How the hallway is laid out on the page. */
export const HALL = {
  /** Top of the bank of lockers on the far wall, and the floor line under it. */
  top: 64,
  floorY: 300,
  /** Height of the point the floor tiles run back to. */
  vanishY: 150,
  /** How big something looks over at the lockers, next to how big it looks beside Bill. */
  far: 0.3,
  /** Width of one locker. */
  lockerW: 60,
};

type V = [number, number];
type Pose = 'rest' | 'windup' | 'swing';

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

function tile(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void): void {
  makePaperArt(scene, key, w, h, draw, { border: 0, ax: 0, ay: 0 });
}

// ---- the hallway ---------------------------------------------------------------

/** Two closed lockers, side by side, to repeat along the far wall. */
function lockers(c: Ctx, h: number): void {
  const w = HALL.lockerW;
  for (let i = 0; i < 2; i++) {
    const x = i * w;
    rect(c, x, 0, w, h, 'sky');
    c.fillStyle = 'rgba(24, 40, 70, 0.55)';
    c.fillRect(x, 0, 1.6, h);
    glued(c, () => rect(c, x + 4, 8, w - 7, h - 22, 'sky'));
    if (i) {
      c.fillStyle = 'rgba(30, 50, 90, 0.08)';
      c.fillRect(x + 4, 8, w - 7, h - 22);
    }
    // vents top and bottom, a number plate, a handle and a combination lock
    c.fillStyle = 'rgba(24, 34, 56, 0.6)';
    for (let k = 0; k < 5; k++) c.fillRect(x + 15, 22 + k * 7, 31, 2.6);
    for (let k = 0; k < 3; k++) c.fillRect(x + 15, h - 46 + k * 7, 31, 2.6);
    glued(c, () => rect(c, x + 23, 64, 15, 8, 'white'));
    glued(c, () => rect(c, x + 44, 108, 7, 24, 'grey'));
    circle(c, x + 47.5, 143, 4.6);
    fillPaper(c, 'black');
  }
  rect(c, 0, 0, w * 2, 5, 'grey');
  rect(c, 0, h - 8, w * 2, 8, 'black');
}

/** The bully's locker, wide open, on a 106 x 252 canvas: the dark inside is the
 *  left 60, and the door has swung round toward us on the right. */
function lockerOpen(c: Ctx, h: number): void {
  const w = HALL.lockerW;
  rect(c, 0, 0, w, h, 'black');
  c.fillStyle = 'rgba(255, 255, 255, 0.07)';
  c.fillRect(5, 5, w - 10, h - 13);
  // books on the shelf, a jacket on the hook, a can of tennis balls
  rect(c, 8, 26, 8, 24, 'red');
  rect(c, 17, 22, 7, 28, 'green');
  rect(c, 25, 30, 10, 20, 'yellow');
  glued(c, () => rect(c, 3, 50, w - 6, 4, 'grey'));
  glued(c, () => { poly(c, [36, 62, 54, 66, 55, 132, 34, 128]); fillPaper(c, 'blue'); });
  glued(c, () => rect(c, 8, 186, 13, 42, 'white'));
  for (const [x, y] of [[14.5, 196], [14.5, 208], [14.5, 220], [33, 221], [46, 222]]) {
    circle(c, x, y, 5.6);
    fillPaper(c, 'yellow');
  }
  rect(c, 0, h - 8, w, 8, 'black');
  const door = [w, 0, w + 40, 9, w + 40, h + 14, w, h];
  glued(c, () => { poly(c, door); fillPaper(c, 'sky'); });
  c.save();
  poly(c, door);
  c.clip();
  c.fillStyle = 'rgba(20, 36, 70, 0.3)';
  c.fillRect(w, 0, 46, h + 16);
  c.restore();
  // a pennant taped inside the door
  glued(c, () => {
    c.save();
    c.translate(w + 20, 86);
    c.rotate(0.08);
    poly(c, [-13, -9, 13, 0, -13, 9]);
    fillPaper(c, 'red');
    c.restore();
  });
}

/** The floor: checkered tiles running away to the far wall. */
function floor(c: Ctx, w: number, h: number): void {
  const drop = HALL.floorY - HALL.vanishY;
  const zf = 1 / HALL.far;
  const tileW = 45, dz = 0.29;
  const cols = Math.ceil(w / 2 / tileW) + 1;
  rect(c, 0, 0, w, h, 'manila');
  for (let k = 0; ; k++) {
    const z0 = zf - k * dz, z1 = zf - (k + 1) * dz;
    const y0 = drop * (zf / z0 - 1);
    if (y0 > h || z0 <= 0.2) break;
    const y1 = z1 > 0.2 ? drop * (zf / z1 - 1) : h * 3;
    const xAt = (j: number, y: number) => w / 2 + j * tileW * (1 + y / drop);
    for (let j = -cols; j < cols; j++) {
      if ((((j + k) % 2) + 2) % 2 === 0) continue;
      if (xAt(j + 1, y1) < 0 || xAt(j, y1) > w) continue;
      poly(c, [xAt(j, y0), y0, xAt(j + 1, y0), y0, xAt(j + 1, y1), y1, xAt(j, y1), y1]);
      fillPaper(c, 'cream');
    }
  }
  // it is darker under the lockers
  const g = c.createLinearGradient(0, 0, 0, 80);
  g.addColorStop(0, 'rgba(40, 28, 16, 0.34)');
  g.addColorStop(1, 'rgba(40, 28, 16, 0)');
  c.fillStyle = g;
  c.fillRect(0, 0, w, 80);
}

// ---- what comes flying out of the locker ---------------------------------------

/** A jar of peanut butter, on a 58 x 84 canvas. */
function jar(c: Ctx): void {
  rr(c, 4, 11, 50, 73, 9);
  fillPaper(c, 'brown');
  c.fillStyle = 'rgba(255, 255, 255, 0.26)';
  rr(c, 8, 16, 6, 62, 3);
  c.fill();
  glued(c, () => { rr(c, 8, 0, 42, 14, 3); fillPaper(c, 'red'); });
  glued(c, () => rect(c, 4, 30, 50, 34, 'white'));
  rect(c, 4, 30, 50, 5, 'red');
  rect(c, 4, 57, 50, 7, 'blue');
  cutText(c, 'SKIPPY', 29, 47, 16, 'red');
}

/** A chocolate milkshake in a paper cup, on a 60 x 98 canvas. */
function shake(c: Ctx): void {
  strokePaper(c, [35, 30, 47, 4], 'red', 5);
  ellipse(c, 30, 30, 24, 13);
  fillPaper(c, 'brown');
  circle(c, 27, 21, 10);
  fillPaper(c, 'brown');
  glued(c, () => { poly(c, [6, 32, 54, 32, 46, 98, 14, 98]); fillPaper(c, 'white'); });
  glued(c, () => { poly(c, [8.4, 52, 51.6, 52, 49.2, 72, 10.8, 72]); fillPaper(c, 'red'); });
  cutText(c, 'SHAKE', 30, 63, 13, 'white');
  // it is running down the side
  rr(c, 12, 27, 8, 20, 4);
  fillPaper(c, 'brown');
  rr(c, 40, 27, 7, 14, 3.5);
  fillPaper(c, 'brown');
}

/** His history book, with something smushed between the pages, on a 90 x 106 canvas. */
function book(c: Ctx): void {
  glued(c, () => rect(c, 8, 8, 80, 94, 'white'));
  c.fillStyle = 'rgba(40, 34, 30, 0.25)';
  for (let y = 12; y < 100; y += 4) c.fillRect(80, y, 8, 1);
  ellipse(c, 84, 66, 6, 17);
  fillPaper(c, 'brown');
  rr(c, 80, 74, 6, 26, 3);
  fillPaper(c, 'brown');
  glued(c, () => { rr(c, 0, 2, 80, 102, 4); fillPaper(c, 'green'); });
  c.fillStyle = 'rgba(0, 0, 0, 0.22)';
  c.fillRect(0, 2, 11, 102);
  glued(c, () => rect(c, 17, 22, 57, 28, 'yellow'));
  cutText(c, 'HISTORY', 45.5, 37, 16, 'red');
  circle(c, 45, 76, 12);
  fillPaper(c, 'yellow');
}

/** A splat, on a 130 x 130 canvas: a fat blob, the gobs flung out of it, and
 *  a few drips running down from it. */
function splat(c: Ctx, seed: number, milky: boolean): void {
  let s = seed * 7919 + 13;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const cx = 65, cy = 52;
  const blobs: [number, number, number][] = [[cx, cy, 27]];
  const arms: number[][] = [];
  const n = 7 + Math.floor(rnd() * 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.5;
    // a bulge on the rim of the blob, and for most of them a gob thrown clear
    blobs.push([cx + Math.cos(a) * 23, cy + Math.sin(a) * 21, 10 + rnd() * 8]);
    if (rnd() < 0.6) {
      const d = 37 + rnd() * 11, r = 5 + rnd() * 4.5;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.86;
      blobs.push([x, y, r]);
      arms.push([cx + Math.cos(a) * 20, cy + Math.sin(a) * 18, x, y, r * 1.5]);
    } else if (rnd() < 0.5) {
      // a fleck that came off altogether
      const d = 50 + rnd() * 10;
      blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.86, 2.5 + rnd() * 2.5]);
    }
  }
  const paint = (fill: () => void) => {
    for (const [x1, y1, x2, y2, w] of arms) {
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.lineWidth = w;
      c.lineCap = 'round';
      c.strokeStyle = c.fillStyle;
      c.stroke();
    }
    for (const [x, y, r] of blobs) {
      circle(c, x, y, r);
      fill();
    }
  };
  // drips first, so the blob sits on top of where they start
  for (let i = 0; i < 3; i++) {
    const x = 46 + i * 17 + rnd() * 6, len = 30 + rnd() * 34, w = 6 + rnd() * 4;
    rr(c, x, cy, w, len + 10, w / 2);
    fillPaper(c, 'brown');
  }
  c.fillStyle = paper(c, 'brown');
  paint(() => c.fill());
  if (milky) {
    c.fillStyle = 'rgba(255, 232, 200, 0.3)';
    circle(c, cx, cy, 30);
    c.fill();
  }
  c.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ellipse(c, 56, 42, 10, 5, -0.5);
  c.fill();
}

// ---- Bill, from behind -----------------------------------------------------------

/** Where the racquet arm is in each frame: elbow, hand, which way the racquet
 *  points, and how big it looks (it is nearer to us when he winds up). */
const ARMS: Record<Pose, { elbow: V; hand: V; aim: V; size: number }> = {
  rest: { elbow: [160, 108], hand: [202, 56], aim: [0.42, -0.908], size: 1 },
  windup: { elbow: [184, 86], hand: [240, 108], aim: [0.9, 0.436], size: 1.12 },
  swing: { elbow: [176, 44], hand: [232, 6], aim: [0.1, -0.995], size: 1 },
};

const along = (p: V, d: V, k: number): V => [p[0] + d[0] * k, p[1] + d[1] * k];

/** A wooden tennis racquet held at `hand`, pointing along `aim`. */
function racquet(c: Ctx, hand: V, aim: V, k: number): void {
  const mid = along(hand, aim, 96 * k);
  strokePaper(c, [...along(hand, aim, -17 * k), ...along(hand, aim, 26 * k)], 'black', 9 * k);
  strokePaper(c, [...along(hand, aim, 26 * k), ...along(hand, aim, 50 * k)], 'manila', 7 * k);
  c.save();
  c.translate(mid[0], mid[1]);
  c.rotate(Math.atan2(aim[1], aim[0]) + Math.PI / 2);
  strokePaper(c, [0, 47 * k, -15 * k, 34 * k], 'manila', 6 * k);
  strokePaper(c, [0, 47 * k, 15 * k, 34 * k], 'manila', 6 * k);
  // the strings
  c.save();
  ellipse(c, 0, 0, 29 * k, 39 * k);
  c.clip();
  c.fillStyle = 'rgba(255, 255, 255, 0.14)';
  c.fillRect(-40 * k, -50 * k, 80 * k, 100 * k);
  c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  c.lineWidth = 1.1;
  c.beginPath();
  for (let x = -28 * k; x <= 28 * k; x += 6.5 * k) { c.moveTo(x, -42 * k); c.lineTo(x, 42 * k); }
  for (let y = -39 * k; y <= 39 * k; y += 6.5 * k) { c.moveTo(-32 * k, y); c.lineTo(32 * k, y); }
  c.stroke();
  c.restore();
  // the hoop, with a band of red paint round the top
  glued(c, () => {
    ellipse(c, 0, 0, 31 * k, 41 * k);
    c.strokeStyle = paper(c, 'manila');
    c.lineWidth = 7 * k;
    c.stroke();
  });
  c.beginPath();
  c.ellipse(0, 0, 31 * k, 41 * k, 0, -2.25, -0.89);
  c.strokeStyle = paper(c, 'red');
  c.lineWidth = 7 * k;
  c.lineCap = 'butt';
  c.stroke();
  c.restore();
}

/** Bill from behind, from the shoulder blades up, with the bully's tennis
 *  racquet in his right hand. Drawn around the point where his head meets his
 *  neck; his head is a separate piece. */
function teen(c: Ctx, pose: Pose): void {
  const arm = ARMS[pose];
  const shoulder: V = [112, 40];
  const cuff: V = [shoulder[0] + (arm.elbow[0] - shoulder[0]) * 0.62, shoulder[1] + (arm.elbow[1] - shoulder[1]) * 0.62];
  const torso = () => {
    c.beginPath();
    c.moveTo(-34, 6);
    c.quadraticCurveTo(0, -8, 34, 6);
    c.lineTo(118, 26);
    c.quadraticCurveTo(128, 30, 126, 46);
    c.lineTo(116, 196);
    c.lineTo(-116, 196);
    c.lineTo(-126, 46);
    c.quadraticCurveTo(-128, 30, -118, 26);
    c.closePath();
  };
  // his other arm hangs at his side
  strokePaper(c, [-130, 70, -138, 196], 'manila', 32);
  glued(c, () => { poly(c, [-110, 24, -148, 46, -154, 106, -108, 102]); fillPaper(c, 'yellow'); });
  rect(c, -27, -22, 54, 42, 'manila');
  glued(c, () => { torso(); fillPaper(c, 'yellow'); });
  // two stripes across the back, and the collar
  c.save();
  torso();
  c.clip();
  rect(c, -130, 70, 260, 13, 'brown');
  rect(c, -130, 90, 260, 5, 'brown');
  c.fillStyle = 'rgba(60, 40, 10, 0.1)';
  c.fillRect(-2, 10, 4, 190);
  c.restore();
  c.beginPath();
  c.moveTo(-34, 6);
  c.quadraticCurveTo(0, -8, 34, 6);
  c.strokeStyle = paper(c, 'brown');
  c.lineWidth = 7;
  c.stroke();

  racquet(c, arm.hand, arm.aim, arm.size);
  strokePaper(c, [...cuff, ...arm.elbow, ...arm.hand], 'manila', 29);
  glued(c, () => strokePaper(c, [...shoulder, ...cuff], 'yellow', 44));
  glued(c, () => { circle(c, arm.hand[0], arm.hand[1], 15); fillPaper(c, 'manila'); });
}

/** The back of Bill's head, on a 210 x 248 canvas laid out like his photo
 *  heads: 200 tall, with the bottom of the head 207 down. */
function headBack(c: Ctx): void {
  rr(c, 66, 160, 78, 88, 10);
  fillPaper(c, 'manila');
  for (const x of [20, 190]) {
    ellipse(c, x, 124, 11, 23);
    fillPaper(c, 'manila');
  }
  ellipse(c, 105, 110, 80, 98);
  fillPaper(c, 'manila');
  // silver hair, cut a little ragged along the back of his neck
  const hair = () => {
    c.beginPath();
    c.moveTo(21, 114);
    c.bezierCurveTo(10, 18, 64, 5, 105, 6);
    c.bezierCurveTo(146, 5, 200, 18, 189, 114);
    c.lineTo(184, 152);
    for (let i = 0; i <= 12; i++) c.lineTo(177 - i * 12, 176 + Math.sin((i / 12) * Math.PI) * 13 + (i % 2 ? -4 : 3));
    c.lineTo(26, 152);
    c.closePath();
  };
  glued(c, () => { hair(); fillPaper(c, 'white'); });
  c.save();
  hair();
  c.clip();
  c.fillStyle = 'rgba(112, 114, 126, 0.4)';
  c.fillRect(0, 0, 210, 248);
  c.lineWidth = 2.4;
  for (let i = 0; i < 26; i++) {
    // strands falling away from the crown
    const a = -0.35 + (i / 25) * (Math.PI + 0.7);
    const x1 = 105 - Math.cos(a) * 24, y1 = 60 + Math.sin(a) * 10;
    const x2 = 105 - Math.cos(a) * 94, y2 = 66 + Math.sin(a) * 132;
    c.strokeStyle = i % 3 ? 'rgba(70, 72, 84, 0.28)' : 'rgba(255, 255, 255, 0.6)';
    c.beginPath();
    c.moveTo(x1, y1);
    c.quadraticCurveTo((x1 + x2) / 2 + (i % 2 ? 7 : -7), (y1 + y2) / 2 - 12, x2, y2);
    c.stroke();
  }
  c.restore();
}

// --------------------------------------------------------------------------------

export function buildHallArt(scene: Phaser.Scene): void {
  const lockerH = HALL.floorY - HALL.top;
  tile(scene, 'hall_wall', 64, HALL.top + BLEED, (c) => rect(c, 0, 0, 64, HALL.top + BLEED, 'cream'));
  tile(scene, 'lockers', HALL.lockerW * 2, lockerH, (c) => lockers(c, lockerH));
  makePaperArt(scene, 'locker_open', HALL.lockerW + 46, lockerH + 16, (c) => lockerOpen(c, lockerH), {
    border: 2, ax: HALL.lockerW / 2, ay: lockerH,
  });
  const fw = MAX_W + BLEED * 2, fh = H - HALL.floorY + BLEED;
  makePaperArt(scene, 'hall_floor', fw, fh, (c) => floor(c, fw, fh), { border: 0, ax: fw / 2, ay: 0 });

  makePaperArt(scene, 'jar', 58, 84, jar, { border: 2.5 });
  makePaperArt(scene, 'shake', 60, 98, shake, { border: 2.5 });
  makePaperArt(scene, 'book', 90, 106, book, { border: 2.5 });
  makePaperArt(scene, 'splat0', 130, 130, (c) => splat(c, 3, false), { border: 2, ax: 65, ay: 54 });
  makePaperArt(scene, 'splat1', 130, 130, (c) => splat(c, 8, true), { border: 2, ax: 65, ay: 54 });
  makePaperArt(scene, 'blob', 16, 16, (c) => { circle(c, 8, 8, 7); fillPaper(c, 'brown'); }, { border: 1 });
  makeArt(scene, 'shadow', 70, 22, (c) => {
    ellipse(c, 35, 11, 33, 9.5);
    c.fillStyle = 'rgba(24, 16, 10, 0.34)';
    c.fill();
  });

  // Bill from behind: three frames pinned where his head meets his neck, drawn
  // a size up because he is right in front of the camera
  const k = 1.2, px = 192, py = 220;
  for (const pose of ['rest', 'windup', 'swing'] as Pose[]) {
    makePaperArt(scene, `teen_${pose}`, 664, 480, (c) => {
      c.translate(px, py);
      c.scale(k, k);
      teen(c, pose);
    }, { border: 2.5, ax: px, ay: py });
  }
  makePaperArt(scene, 'bill-back', 210, 248, headBack, { border: 3 });

  makeWord(scene, 'word_splat', 'SPLAT!', 'brown', 'yellow', 112, 30, 21);
  makeWord(scene, 'word_smack', 'SMACK!', 'red', 'yellow', 114, 29, 22);
  makeWord(scene, 'word_ace', 'ACE!', 'yellow', 'red', 104, 36, 23);
  makeWord(scene, 'word_grandslam', 'GRAND SLAM!', 'red', 'yellow', 350, 66, 24);
}
