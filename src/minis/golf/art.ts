import Phaser from 'phaser';
import { doll } from '../../art/fight';
import { DISPLAY, Paper, burstPath, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper, textWidth } from '../../art/paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from '../../art/sticker';
import { MARKER } from '../../ui/text';
import { BILL_GOLF, BILL_LOOK, CHAD_GOLF, CHAD_LOOK, OUTFITS, TRAIL } from './poses';

/** The paper stand-ins for this game: what is on the page until there is a photo
 *  (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "golf_" (a word on a burst: "word_golf_..."). The game
 *  cannot make a picture by any other name, or draw over one that is not its own. */

/** The swing meter: how big its frame is, and how far in the part that fills is. */
export const METER = { w: 56, h: 268, pad: 8 };
/** How much of the meter the sweet spot is: half of what the green is on Mom's workout tape (0.24). */
export const ZONE = 0.12;
/** How tall a paper head is made, hair to chin: the same as everybody's photo faces (FACE in shared/people.ts). */
const HEAD = 80;
/** A club, from the hands to the middle of its head. */
export const CLUB_LONG = 64;

const DARK = '#241a14';

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

/** Tint whatever was just filled: the same shape again, in a see-through colour. */
function wash(c: Ctx, colour: string): void {
  c.fillStyle = colour;
  c.fill();
}

/** A piece that repeats to fill a width: no edge, and held by its top left corner. */
function tile(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void): void {
  makeArt(scene, key, w, h, draw, { border: 0, ax: 0, ay: 0 });
}

/** The same not-very-random numbers every time, so that a picture is the same on every phone. */
function dice(seed: number): () => number {
  let s = seed * 7919 + 13;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

/** A bottle of water, standing up, `k` times life size, with its foot at (x, y). */
function bottle(c: Ctx, x: number, y: number, k: number): void {
  glued(c, () => { rr(c, x - 5 * k, y - 26 * k, 10 * k, 26 * k, 3.5 * k); fillPaper(c, 'sky'); wash(c, 'rgba(255, 255, 255, 0.45)'); });
  rect(c, x - 5 * k, y - 17 * k, 10 * k, 8 * k, 'blue');
  rr(c, x - 3 * k, y - 32 * k, 6 * k, 7 * k, 1.5 * k);
  fillPaper(c, 'white');
}

/** A head cut from paper, for when somebody's photo cannot be had: hair, a face, and not much else. */
function paperHead(c: Ctx, hair: Paper, beard: boolean): void {
  glued(c, () => { ellipse(c, 42, 40, 36, 38); fillPaper(c, hair); });
  glued(c, () => { ellipse(c, 42, 48, 30, 33); fillPaper(c, 'manila'); });
  if (beard) {
    c.save();
    ellipse(c, 42, 48, 30, 33);
    c.clip();
    rect(c, 0, 58, 84, 30, hair);
    c.restore();
  }
  for (const x of [31, 53]) { circle(c, x, 44, 3.6); wash(c, DARK); }
  c.beginPath();
  c.moveTo(32, 60);
  c.quadraticCurveTo(42, 68, 52, 60);
  c.strokeStyle = beard ? '#f4e6d0' : DARK;
  c.lineWidth = 3;
  c.lineCap = 'round';
  c.stroke();
}

export function buildArt(scene: Phaser.Scene): void {
  // ---- the first tee -------------------------------------------------------------------------
  tile(scene, 'golf_sky', 64, 64, (c) => rect(c, 0, 0, 64, 64, 'sky'));
  // rolling ground a long way off, with a line of trees along the top of it
  tile(scene, 'golf_hills', 512, 150, (c) => {
    const top = (base: number, a: number, b: number, shift: number) => (x: number) => base + a * Math.sin((x / 512) * Math.PI * 2 + shift) + b * Math.sin((x / 512) * Math.PI * 4 + shift * 2);
    const ridge = (y: (x: number) => number, tint: string) => {
      c.beginPath();
      c.moveTo(0, 150);
      for (let x = 0; x <= 512; x += 8) c.lineTo(x, y(x));
      c.lineTo(512, 150);
      c.closePath();
      fillPaper(c, 'green');
      wash(c, tint);
    };
    const far = top(44, 16, 7, 0.6), near = top(80, 12, 6, 2.2);
    for (const x of [36, 92, 120, 208, 296, 328, 418, 468]) { circle(c, x, far(x) - 3, 14); fillPaper(c, 'green'); wash(c, 'rgba(10, 40, 30, 0.55)'); }
    ridge(far, 'rgba(20, 60, 40, 0.32)');
    ridge(near, 'rgba(255, 255, 190, 0.2)');
  });
  // the fairway: mown in stripes
  tile(scene, 'golf_fairway', 128, 64, (c) => {
    rect(c, 0, 0, 128, 64, 'green');
    wash(c, 'rgba(255, 255, 190, 0.2)');
    for (let x = -64; x < 128; x += 64) { poly(c, [x, 0, x + 32, 0, x + 96, 64, x + 64, 64]); wash(c, 'rgba(255, 255, 255, 0.1)'); }
  });
  makePaperArt(scene, 'golf_teebox', 460, 56, (c) => {
    glued(c, () => { poly(c, [30, 6, 430, 6, 460, 50, 0, 50]); fillPaper(c, 'green'); wash(c, 'rgba(10, 60, 20, 0.28)'); });
    for (const x of [62, 398]) glued(c, () => { circle(c, x, 38, 7); fillPaper(c, 'red'); });
  }, { border: 2 });
  makeArt(scene, 'golf_green', 150, 26, (c) => { ellipse(c, 75, 13, 74, 12); fillPaper(c, 'green'); wash(c, 'rgba(255, 255, 200, 0.4)'); }, { border: 0 });
  makePaperArt(scene, 'golf_flag', 42, 72, (c) => {
    strokePaper(c, [15, 70, 15, 5], 'white', 3);
    glued(c, () => { poly(c, [16, 4, 40, 12, 16, 21]); fillPaper(c, 'red'); });
  }, { border: 1.2, ax: 15, ay: 70 });
  // the houses that back on to it, behind their fence
  makePaperArt(scene, 'golf_houses', 240, 84, (c) => {
    for (const [x, r] of [[78, 17], [168, 15], [236, 12]]) { circle(c, x, 40, r); fillPaper(c, 'green'); wash(c, 'rgba(10, 40, 30, 0.35)'); }
    const house = (x: number, w: number, wall: Paper, roof: Paper) => {
      glued(c, () => { rect(c, x, 36, w, 34, wall); });
      glued(c, () => { poly(c, [x - 5, 38, x + w * 0.3, 14, x + w * 0.7, 14, x + w + 5, 38]); fillPaper(c, roof); });
      rect(c, x + w * 0.5 - 6, 44, 12, 12, 'sky');
    };
    house(8, 62, 'cream', 'brown');
    house(92, 66, 'white', 'grey');
    house(178, 54, 'manila', 'red');
    glued(c, () => { rect(c, 0, 64, 240, 20, 'cream'); });
    c.strokeStyle = 'rgba(90, 70, 40, 0.3)';
    c.lineWidth = 1;
    for (let x = 8; x < 240; x += 8) { c.beginPath(); c.moveTo(x, 64); c.lineTo(x, 84); c.stroke(); }
  }, { border: 1.5, ax: 120, ay: 84 });
  makePaperArt(scene, 'golf_sign', 90, 100, (c) => {
    strokePaper(c, [45, 100, 45, 40], 'brown', 8);
    glued(c, () => { rr(c, 4, 4, 82, 52, 6); fillPaper(c, 'manila'); });
    cutText(c, 'HOLE 1', 45, 21, 21, 'red');
    cutText(c, 'PAR 4', 45, 42, 15, 'black');
  }, { border: 1.8, ax: 45, ay: 100 });
  makePaperArt(scene, 'golf_bag', 70, 170, (c) => {
    for (const [x0, x1, y1] of [[30, 20, 12], [36, 38, 6], [42, 56, 14]]) {
      strokePaper(c, [x0, 62, x1, y1], 'grey', 3);
      glued(c, () => { ellipse(c, x1, y1, 8, 6); fillPaper(c, 'black'); });
    }
    glued(c, () => { rr(c, 18, 52, 36, 112, 10); fillPaper(c, 'blue'); });
    glued(c, () => { rr(c, 22, 102, 28, 34, 6); fillPaper(c, 'red'); });
    strokePaper(c, [20, 64, 8, 100, 20, 140], 'black', 4);
    rr(c, 16, 156, 40, 10, 4);
    fillPaper(c, 'black');
  }, { border: 2, ax: 35, ay: 168 });
  makeArt(scene, 'golf_ball', 12, 12, (c) => {
    circle(c, 6, 6, 5);
    fillPaper(c, 'white');
    c.strokeStyle = 'rgba(40, 40, 60, 0.55)';
    c.lineWidth = 1;
    c.stroke();
  }, { border: 1 });
  makeArt(scene, 'golf_tee', 6, 14, (c) => { poly(c, [0, 0, 6, 0, 4, 3, 3.6, 14, 2.4, 14, 2, 3]); fillPaper(c, 'yellow'); }, { border: 0.6, ax: 3, ay: 14 });
  // the two clubs, each held by its grip and pointing right
  const club = (key: string, head: (c: Ctx) => void) => makePaperArt(scene, key, CLUB_LONG + 20, 28, (c) => {
    strokePaper(c, [6, 12, CLUB_LONG + 4, 12], 'grey', 3);
    strokePaper(c, [6, 12, 24, 12], 'black', 5);
    glued(c, () => head(c));
  }, { border: 1.4, ax: 6, ay: 12 });
  club('golf_club_driver', (c) => { ellipse(c, CLUB_LONG + 7, 15, 10, 9); fillPaper(c, 'black'); });
  club('golf_club_iron', (c) => { poly(c, [CLUB_LONG + 2, 7, CLUB_LONG + 8, 7, CLUB_LONG + 13, 25, CLUB_LONG + 3, 25]); fillPaper(c, 'grey'); wash(c, 'rgba(255, 255, 255, 0.5)'); });

  // Chad with a club, and Bill beside him (their heads are photos, hung on afterwards)
  for (const [pose, p] of Object.entries(CHAD_GOLF)) {
    makePaperArt(scene, `golf_chad_${pose}`, 150, 150, (c) => { c.translate(75, 142); doll(c, p, CHAD_LOOK); }, { border: 2, ax: 75, ay: 142 });
  }
  for (const [pose, p] of Object.entries(BILL_GOLF)) {
    makePaperArt(scene, `golf_bill_${pose}`, 210, 284, (c) => {
      c.translate(105, 272);
      doll(c, p, BILL_LOOK);
      if (pose !== 'stand') return;
      // the club he is leaning on
      strokePaper(c, [p.hands[1][0], p.hands[1][1], p.hands[1][0] + 6, -5], 'grey', 3);
      glued(c, () => { ellipse(c, p.hands[1][0] + 11, -5, 9, 5); fillPaper(c, 'black'); });
    }, { border: 2.4, ax: 105, ay: 272 });
  }
  const heads: [string, Paper, boolean][] = [['chad', 'yellow', false], ['shane', 'brown', false], ['bill', 'brown', true]];
  for (const [who, hair, beard] of heads) {
    makePaperArt(scene, `golf_head_${who}`, 84, 86, (c) => paperHead(c, hair, beard), { border: 2.4, ax: 42, ay: HEAD + 1 });
  }

  // ---- what the player is given to fiddle with -------------------------------------------------
  makePaperArt(scene, 'golf_ball_big', 132, 132, (c) => {
    glued(c, () => { circle(c, 66, 66, 62); fillPaper(c, 'white'); });
    c.save();
    circle(c, 66, 66, 61);
    c.clip();
    for (let row = 0; row < 12; row++) {
      for (let col = 0; col < 12; col++) { circle(c, 8 + col * 11 + (row % 2) * 5.5, 8 + row * 10.5, 2.8); wash(c, 'rgba(110, 120, 150, 0.2)'); }
    }
    const shade = c.createRadialGradient(46, 44, 20, 66, 66, 66);
    shade.addColorStop(0, 'rgba(60, 70, 110, 0)');
    shade.addColorStop(1, 'rgba(60, 70, 110, 0.3)');
    c.fillStyle = shade;
    c.fillRect(0, 0, 132, 132);
    c.restore();
  }, { border: 3 });
  makeArt(scene, 'golf_aim', 36, 36, (c) => {
    c.strokeStyle = paper(c, 'red');
    c.lineWidth = 3.5;
    c.beginPath();
    c.arc(18, 18, 11, 0, Math.PI * 2);
    c.stroke();
    c.lineWidth = 2.5;
    for (const [x0, y0, x1, y1] of [[18, 1, 18, 11], [18, 25, 18, 35], [1, 18, 11, 18], [25, 18, 35, 18]]) { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
    circle(c, 18, 18, 3.2);
    fillPaper(c, 'red');
  }, { border: 1 });
  makePaperArt(scene, 'golf_btn_swing', 176, 86, (c) => {
    glued(c, () => { rr(c, 0, 0, 176, 86, 22); fillPaper(c, 'red'); });
    rr(c, 7, 6, 162, 32, 16);
    wash(c, 'rgba(255, 255, 255, 0.14)');
    cutText(c, 'SWING!', 88, 46, 48, 'yellow');
  }, { border: 3 });
  makePaperArt(scene, 'golf_wind', 112, 112, (c) => {
    glued(c, () => { circle(c, 56, 56, 54); fillPaper(c, 'cream'); });
    c.strokeStyle = 'rgba(60, 50, 40, 0.45)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(56, 56, 45, 0, Math.PI * 2);
    c.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r0 = i % 2 ? 40 : 35;
      c.beginPath();
      c.moveTo(56 + Math.cos(a) * r0, 56 + Math.sin(a) * r0);
      c.lineTo(56 + Math.cos(a) * 45, 56 + Math.sin(a) * 45);
      c.stroke();
    }
  }, { border: 2.5 });
  makePaperArt(scene, 'golf_wind_arrow', 80, 30, (c) => {
    glued(c, () => { poly(c, [4, 11, 50, 11, 50, 2, 78, 15, 50, 28, 50, 19, 4, 19]); fillPaper(c, 'red'); });
  }, { border: 1.5 });
  makePaperArt(scene, 'golf_meter', METER.w, METER.h, (c) => {
    rr(c, 0, 0, METER.w, METER.h, 14);
    fillPaper(c, 'white');
    rr(c, METER.pad, METER.pad, METER.w - METER.pad * 2, METER.h - METER.pad * 2, 9);
    fillPaper(c, 'black');
  }, { border: 2 });
  const inside = { w: METER.w - METER.pad * 2, h: METER.h - METER.pad * 2 };
  makeArt(scene, 'golf_zone', inside.w, inside.h * ZONE, (c) => rect(c, 0, 0, inside.w, inside.h * ZONE, 'green'), { border: 0, ax: inside.w / 2, ay: inside.h * ZONE });
  makeArt(scene, 'golf_fill', inside.w, 8, (c) => rect(c, 0, 0, inside.w, 8, 'yellow'), { border: 0, ax: inside.w / 2, ay: 8 });

  // ---- the window ------------------------------------------------------------------------------
  // what is left of the glass: a hole, and cracks out to the frame
  makeArt(scene, 'golf_smash', 100, 132, (c) => {
    c.save();
    c.beginPath();
    c.rect(0, 0, 100, 132);
    c.clip();
    c.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    c.lineWidth = 1.6;
    const rnd = dice(5);
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + rnd() * 0.3, bend = (rnd() - 0.5) * 0.5;
      c.beginPath();
      c.moveTo(50 + Math.cos(a) * 26, 66 + Math.sin(a) * 34);
      c.lineTo(50 + Math.cos(a + bend) * 52, 66 + Math.sin(a + bend) * 62);
      c.lineTo(50 + Math.cos(a - bend) * 90, 66 + Math.sin(a - bend) * 100);
      c.stroke();
    }
    burstPath(c, 50, 66, 36, 46, 9, 17);
    wash(c, 'rgba(18, 14, 22, 0.94)');
    c.stroke();
    c.restore();
  }, { border: 0 });
  makeArt(scene, 'golf_shard', 18, 22, (c) => { poly(c, [2, 20, 9, 1, 17, 16]); fillPaper(c, 'sky'); wash(c, 'rgba(255, 255, 255, 0.4)'); }, { border: 0.8 });

  // ---- the Iron Horse Trail, where it leaves Hartford Road ---------------------------------------
  // tall trees that meet overhead: a green tunnel, with a little sky through the top of it
  tile(scene, 'golf_trees', 256, 300, (c) => {
    // the wall of leaves behind everything
    c.beginPath();
    c.rect(0, 0, 256, 232);
    for (let x = 0; x <= 256; x += 32) c.arc(x, 232, 22, 0, Math.PI * 2);
    fillPaper(c, 'green');
    wash(c, 'rgba(6, 30, 24, 0.66)');
    for (const [x, y, rx, ry] of [[58, 34, 20, 12], [188, 58, 16, 10], [128, 16, 14, 8], [232, 22, 12, 9]]) { ellipse(c, x, y, rx, ry, 0.3); fillPaper(c, 'sky'); }
    for (const [x, w, lean] of [[52, 18, 8], [168, 13, -6], [226, 10, 4]]) {
      glued(c, () => { poly(c, [x - w / 2, 300, x - w / 2 + lean, 96, x + w / 2 + lean, 96, x + w / 2, 300]); fillPaper(c, 'brown'); wash(c, 'rgba(20, 12, 6, 0.45)'); });
    }
    const layer = (blobs: number[][], tint: string) => glued(c, () => {
      for (const [x, y, r] of blobs) for (const dx of [-256, 0, 256]) { circle(c, x + dx, y, r); fillPaper(c, 'green'); wash(c, tint); }
    });
    layer([[20, 62, 50], [112, 96, 54], [206, 74, 50], [72, 158, 40], [170, 172, 44], [250, 150, 38]], 'rgba(8, 40, 26, 0.42)');
    layer([[0, 10, 46], [92, 4, 44], [160, 26, 42], [238, 104, 36], [44, 112, 34], [140, 138, 30]], 'rgba(10, 50, 20, 0.2)');
    layer([[36, 42, 24], [124, 66, 26], [200, 30, 22], [226, 168, 22], [96, 176, 20], [16, 168, 22]], 'rgba(255, 255, 140, 0.22)');
  });
  // a board fence, gone grey-brown
  tile(scene, 'golf_boards', 96, 100, (c) => {
    rect(c, 0, 0, 96, 100, 'manila');
    wash(c, 'rgba(110, 70, 30, 0.34)');
    c.strokeStyle = 'rgba(60, 34, 10, 0.4)';
    c.lineWidth = 1.5;
    for (let x = 0; x < 96; x += 16) { c.beginPath(); c.moveTo(x + 0.75, 0); c.lineTo(x + 0.75, 100); c.stroke(); }
    c.beginPath();
    c.rect(0, 10, 96, 7);
    wash(c, 'rgba(60, 34, 10, 0.3)');
  });
  // bare ground, deep in last year's leaves
  tile(scene, 'golf_dirt', 128, 64, (c) => {
    rect(c, 0, 0, 128, 64, 'brown');
    wash(c, 'rgba(240, 215, 170, 0.5)');
    const rnd = dice(9), leaves: Paper[] = ['yellow', 'manila', 'brown', 'green', 'manila'];
    for (let i = 0; i < 26; i++) {
      ellipse(c, 6 + rnd() * 116, 5 + rnd() * 54, 3 + rnd() * 2.5, 1.6 + rnd(), rnd() * 3);
      c.globalAlpha = 0.75;
      fillPaper(c, leaves[i % leaves.length]);
      c.globalAlpha = 1;
    }
  });
  // the path: old tarmac, in the shade, with the sun coming through here and there
  tile(scene, 'golf_path', 128, 80, (c) => {
    rect(c, 0, 0, 128, 80, 'grey');
    wash(c, 'rgba(20, 20, 32, 0.36)');
    const rnd = dice(3);
    for (let i = 0; i < 46; i++) { c.fillStyle = i % 2 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.16)'; c.fillRect(rnd() * 126, rnd() * 78, 2, 1.5); }
    for (const [x, y, rx, ry] of [[30, 24, 20, 7], [92, 52, 24, 8], [70, 14, 12, 4]]) { ellipse(c, x, y, rx, ry); wash(c, 'rgba(255, 250, 200, 0.12)'); }
  });
  // the posts that keep cars off it, and the gate that lets the park's own trucks on
  makePaperArt(scene, 'golf_bollard', 24, 100, (c) => {
    glued(c, () => { rr(c, 5, 6, 14, 94, 4); fillPaper(c, 'brown'); wash(c, 'rgba(20, 12, 6, 0.5)'); });
    rr(c, 4, 4, 16, 17, 4);
    fillPaper(c, 'yellow');
  }, { border: 1.6, ax: 12, ay: 100 });
  makePaperArt(scene, 'golf_gate', 230, 128, (c) => {
    c.beginPath();
    c.moveTo(6, 114); c.lineTo(6, 24); c.quadraticCurveTo(6, 8, 22, 8); c.lineTo(224, 8); c.lineTo(224, 114);
    c.closePath();
    wash(c, 'rgba(214, 220, 228, 0.34)');
    c.save();
    c.clip();
    c.strokeStyle = 'rgba(170, 178, 190, 0.85)';
    c.lineWidth = 1;
    for (let x = -130; x < 360; x += 9) {
      c.beginPath(); c.moveTo(x, 8); c.lineTo(x + 110, 118); c.stroke();
      c.beginPath(); c.moveTo(x, 118); c.lineTo(x + 110, 8); c.stroke();
    }
    c.restore();
    const tube = (pts: number[]) => { strokePaper(c, pts, 'grey', 5); c.strokeStyle = 'rgba(255, 255, 255, 0.5)'; c.stroke(); };
    glued(c, () => {
      c.beginPath();
      c.moveTo(6, 124); c.lineTo(6, 24); c.quadraticCurveTo(6, 8, 22, 8); c.lineTo(224, 8); c.lineTo(224, 124);
      c.strokeStyle = paper(c, 'grey'); c.lineWidth = 5; c.lineCap = 'round'; c.stroke();
      c.strokeStyle = 'rgba(255, 255, 255, 0.5)'; c.stroke();
    });
    tube([6, 114, 224, 114]);
    tube([115, 8, 115, 114]);
    glued(c, () => { rect(c, 34, 40, 62, 36, 'white'); });
    rect(c, 34, 40, 62, 13, 'red');
    cutText(c, 'NO PARKING', 65, 65, 11.5, 'red');
  }, { border: 1.6, ax: 115, ay: 126 });
  // the park district's sign: brown, with yellow letters
  makePaperArt(scene, 'golf_trailsign', 200, 150, (c) => {
    for (const x of [30, 170]) glued(c, () => { strokePaper(c, [x, 148, x, 26], 'brown', 11); });
    glued(c, () => { rr(c, 8, 32, 184, 76, 6); fillPaper(c, 'brown'); wash(c, 'rgba(30, 16, 4, 0.3)'); });
    cutText(c, 'IRON HORSE', 100, 58, 31, 'yellow');
    cutText(c, 'REGIONAL TRAIL', 100, 88, 17, 'cream');
    glued(c, () => { rr(c, 56, 114, 88, 22, 4); fillPaper(c, 'brown'); wash(c, 'rgba(30, 16, 4, 0.3)'); });
    cutText(c, 'DANVILLE', 100, 126, 13, 'cream');
  }, { border: 2.2, ax: 100, ay: 150 });
  // STOP, painted on the path where it meets the road, as it looks from the side
  makeArt(scene, 'golf_stoppaint', 150, 40, (c) => {
    c.translate(75, 20);
    c.transform(1, 0, -0.5, 0.42, 0, 0);
    c.font = `64px ${DISPLAY}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'rgba(250, 250, 240, 0.78)';
    c.fillText('STOP', 0, 4);
  }, { border: 0 });
  makePaperArt(scene, 'golf_stopsign', 48, 120, (c) => {
    strokePaper(c, [24, 120, 24, 40], 'grey', 4);
    const pts: number[] = [];
    for (let i = 0; i < 8; i++) { const a = ((i + 0.5) / 8) * Math.PI * 2; pts.push(24 + Math.cos(a) * 23, 24 + Math.sin(a) * 23); }
    glued(c, () => { poly(c, pts); fillPaper(c, 'red'); });
    cutText(c, 'STOP', 24, 25, 15, 'white');
  }, { border: 1.6, ax: 24, ay: 120 });

  // ---- the water stand ---------------------------------------------------------------------------
  makePaperArt(scene, 'golf_table', 210, 120, (c) => {
    for (const pts of [[26, 120, 36, 46], [184, 120, 174, 46], [30, 92, 180, 92]]) strokePaper(c, pts, 'grey', 4);
    glued(c, () => { rr(c, 6, 36, 198, 14, 4); fillPaper(c, 'brown'); wash(c, 'rgba(255, 230, 190, 0.3)'); });
    glued(c, () => { poly(c, [44, 52, 166, 50, 168, 114, 42, 116]); fillPaper(c, 'white'); });
    cutText(c, 'ICE COLD', 105, 64, 15, 'blue', MARKER);
    cutText(c, 'WATER', 105, 81, 21, 'blue', MARKER);
    cutText(c, '$1', 105, 102, 23, 'red', MARKER);
  }, { border: 2.2, ax: 105, ay: 120 });
  makePaperArt(scene, 'golf_cooler', 84, 70, (c) => {
    for (const x of [22, 40, 58]) bottle(c, x, 40, 0.8);
    glued(c, () => { poly(c, [0, 20, 60, 2, 64, 10, 4, 28]); fillPaper(c, 'white'); });
    glued(c, () => { rr(c, 4, 26, 76, 42, 6); fillPaper(c, 'red'); });
    rect(c, 4, 26, 76, 9, 'white');
    for (const [x, y] of [[14, 24], [30, 22], [48, 24], [66, 23]]) { circle(c, x, y, 3.5); fillPaper(c, 'white'); }
  }, { border: 2, ax: 42, ay: 70 });
  makePaperArt(scene, 'golf_bottle', 14, 36, (c) => bottle(c, 7, 35, 1), { border: 1.2 });
  // the jar the money goes in
  makePaperArt(scene, 'golf_jar', 44, 56, (c) => {
    rr(c, 4, 10, 36, 44, 8);
    wash(c, 'rgba(232, 244, 250, 0.72)');
    c.strokeStyle = 'rgba(70, 90, 100, 0.8)';
    c.lineWidth = 2;
    c.stroke();
    rr(c, 6, 4, 32, 8, 3);
    fillPaper(c, 'grey');
    glued(c, () => { rr(c, 10, 24, 24, 18, 3); fillPaper(c, 'white'); });
    cutText(c, '$', 22, 34, 17, 'green');
  }, { border: 1.6, ax: 22, ay: 56 });
  makeArt(scene, 'golf_coin', 14, 14, (c) => {
    circle(c, 7, 7, 6);
    fillPaper(c, 'yellow');
    c.strokeStyle = 'rgba(120, 80, 10, 0.7)';
    c.lineWidth = 1.4;
    c.stroke();
  }, { border: 0.8 });
  // somebody who wants one: it floats over their head
  makePaperArt(scene, 'golf_want', 56, 56, (c) => {
    glued(c, () => { ellipse(c, 30, 22, 25, 21); fillPaper(c, 'white'); });
    for (const [x, y, r] of [[18, 45, 5], [11, 52, 3]]) { circle(c, x, y, r); fillPaper(c, 'white'); }
    bottle(c, 30, 37, 0.95);
  }, { border: 1.6, ax: 11, ay: 54 });

  // whoever is out on the trail: six outfits, two steps each (their heads are the rubberneckers')
  OUTFITS.forEach(({ runs, look }, i) => {
    for (const step of [1, 2]) {
      const pose = `${runs ? 'run' : 'walk'}${step}`;
      makePaperArt(scene, `golf_p${i}_${pose}`, 260, 284, (c) => { c.translate(120, 272); doll(c, TRAIL[pose], look); }, { border: 2.2, ax: 120, ay: 272 });
    }
  });

  // ---- Windows R Us ------------------------------------------------------------------------------
  makePaperArt(scene, 'golf_store', 620, 340, (c) => {
    glued(c, () => { rect(c, 0, 60, 620, 280, 'red'); });
    c.strokeStyle = 'rgba(255, 236, 214, 0.26)';
    c.lineWidth = 1.2;
    for (let y = 74, row = 0; y < 340; y += 14, row++) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(620, y); c.stroke();
      for (let x = row % 2 ? 18 : 0; x < 620; x += 36) { c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y); c.stroke(); }
    }
    // the sign: every letter a different colour, and the R the wrong way round
    glued(c, () => { rr(c, 34, 4, 552, 92, 12); fillPaper(c, 'white'); });
    const colours: Paper[] = ['red', 'blue', 'green', 'brown'], size = 62;
    const spell = (word: string, from: number, first: number) => {
      let x = from;
      [...word].forEach((ch, i) => {
        const w = textWidth(ch, size);
        cutText(c, ch, x + w / 2, 52, size, colours[(first + i) % colours.length]);
        x += w + 4;
      });
      return x;
    };
    const wide = (word: string) => [...word].reduce((sum, ch) => sum + textWidth(ch, size) + 4, 0);
    let x = 310 - (wide('WINDOWS') + 96 + wide('US')) / 2;
    x = spell('WINDOWS', x, 0) + 48;
    glued(c, () => { burstPath(c, x, 50, 40, 40, 11, 23); fillPaper(c, 'yellow'); });
    c.save();
    c.translate(x, 52);
    c.scale(-1, 1);
    cutText(c, 'R', 0, 0, 50, 'blue');
    c.restore();
    spell('US', x + 48, 3);
    // the shop window, with what they sell in it
    glued(c, () => { rect(c, 44, 124, 340, 178, 'white'); });
    rect(c, 54, 134, 320, 158, 'sky');
    for (const wx of [76, 180, 284]) {
      glued(c, () => { rect(c, wx, 158, 70, 104, 'white'); });
      for (const wy of [166, 214]) { rect(c, wx + 8, wy, 54, 40, 'blue'); wash(c, 'rgba(255, 255, 255, 0.55)'); }
      glued(c, () => { circle(c, wx + 60, 164, 10); fillPaper(c, 'yellow'); });
      cutText(c, '$', wx + 60, 165, 13, 'red');
    }
    // the door
    glued(c, () => { rect(c, 430, 124, 136, 216, 'white'); });
    rect(c, 442, 136, 112, 156, 'sky');
    glued(c, () => { rr(c, 470, 166, 56, 24, 4); fillPaper(c, 'red'); });
    cutText(c, 'OPEN', 498, 179, 16, 'white');
    rect(c, 0, 326, 430, 14, 'grey');
    rect(c, 566, 326, 54, 14, 'grey');
  }, { border: 2.5, ax: 310, ay: 340 });
  tile(scene, 'golf_pavement', 128, 64, (c) => {
    rect(c, 0, 0, 128, 64, 'grey');
    wash(c, 'rgba(255, 255, 255, 0.5)');
    c.strokeStyle = 'rgba(60, 60, 70, 0.3)';
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0.75, 0); c.lineTo(0.75, 64); c.moveTo(0, 0.75); c.lineTo(128, 0.75); c.stroke();
  });
  // one window, new
  makePaperArt(scene, 'golf_window_new', 116, 146, (c) => {
    glued(c, () => { rect(c, 0, 0, 116, 146, 'white'); });
    for (const y of [10, 78]) {
      rect(c, 10, y, 96, 58, 'sky');
      c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      c.lineWidth = 5;
      c.beginPath(); c.moveTo(24, y + 44); c.lineTo(52, y + 12); c.stroke();
    }
  }, { border: 2.5 });

  makeWord(scene, 'word_golf_niceshot', 'NICE SHOT!', 'green', 'white', 330, 62, 81);
  makeWord(scene, 'word_golf_shanked', 'SHANKED', 'grey', 'yellow', 300, 64, 82);
  makeWord(scene, 'word_golf_crash', 'CRASH!', 'red', 'yellow', 330, 96, 83);
  makeWord(scene, 'word_golf_sold', 'SOLD!', 'green', 'white', 104, 30, 84);
  makeWord(scene, 'word_golf_nothanks', 'NO THANKS', 'grey', 'white', 136, 22, 85);
  makeWord(scene, 'word_golf_paid', 'PAID IN FULL!', 'blue', 'yellow', 360, 60, 86);
}
