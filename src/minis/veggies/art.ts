import Phaser from 'phaser';
import { Paper, fillPaper, glued, makePaperArt, makeWord, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, poly, rr } from '../../art/sticker';
import { CAST } from '../../data/cast';

/** The paper stand-ins for the vegetables: what is on the page until there is a
 *  photo (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "veggies_" (a word on a burst: "word_veggies_..."). The
 *  game cannot make a picture by any other name, or draw over one that is not
 *  its own. The restaurant, the table, the waiter and his parents' seats are
 *  the ordering game's (`papillon_...`), used as they are. */

/** How tall Branson's head is here, hair to chin: he is seen close up. */
export const BIG = 200;

/** The looks of his that are used, and where each is cut in two to open his mouth: how far
 *  down the picture the line between his lips is (in the middle of the gap, where his mouth is
 *  open already). Read off the photos with a grid ruled over them; a paper head is drawn to match. */
export const CUT: Record<string, number> = {
  angry: 0.672, worried: 0.675, shocked: 0.695, cry: 0.682, dazed: 0.672, disgusted: 0.685, smug: 0.675, smile: 0.675,
};
export const LOOKS = Object.keys(CUT);

/** How wide one of his faces is for how tall (the photos are all within a pixel or two of this). */
const ASPECT = 242 / 363;

/** The name of his head in a look, as this game draws it (big). */
export const headKey = (look: string): string => `veggies_branson_${look}`;

/** How big a look of his is drawn, and where its chin is: as the photo of it will be. */
export function headBox(look: string): { w: number; h: number; ax: number; ay: number } {
  const f = CAST.branson?.[look] ?? { tall: 1.008, chin: [0.344, 0.996] };
  const h = BIG * f.tall, w = h * ASPECT;
  return { w, h, ax: w * f.chin[0], ay: h * f.chin[1] };
}

/** The vegetables, in the order they come: each is drawn lying down, the end that goes in
 *  first to the right, and is held by that end. How long and how thick; how many shoves it
 *  takes; how long he can hold his breath before it; how long his mouth is open for. */
export const VEG = [
  { key: 'veggies_carrot', len: 150, thick: 46, shoves: 5, hold: 1.15, open: 0.85 },
  { key: 'veggies_corn', len: 152, thick: 66, shoves: 7, hold: 1.0, open: 0.75 },
  { key: 'veggies_broccoli', len: 176, thick: 126, shoves: 9, hold: 0.9, open: 0.7 },
];

const DARK = '#241a14';

function wash(c: Ctx, colour: string): void {
  c.fillStyle = colour;
  c.fill();
}

/** Branson in paper, to the size and the chin of the photo that takes his place: turned a
 *  little to his right, bearded, and pulling the face asked for. */
function paperHead(c: Ctx, look: string, w: number, h: number): void {
  const X = (k: number) => k * w, Y = (k: number) => k * h, cut = CUT[look];
  const line = (draw: () => void, lw = 3) => { c.beginPath(); draw(); c.strokeStyle = DARK; c.lineWidth = lw; c.lineCap = 'round'; c.stroke(); };
  // hair, over the top and down the back
  glued(c, () => { ellipse(c, X(0.52), Y(0.3), X(0.4), Y(0.28)); fillPaper(c, 'brown'); wash(c, 'rgba(30, 14, 6, 0.45)'); });
  // an ear
  glued(c, () => { ellipse(c, X(0.9), Y(0.47), X(0.075), Y(0.085)); fillPaper(c, 'manila'); });
  // the face
  glued(c, () => { ellipse(c, X(0.44), Y(0.47), X(0.37), Y(0.34)); fillPaper(c, 'manila'); });
  // the beard: from under one ear, round the chin, to under the other
  glued(c, () => {
    c.beginPath();
    c.moveTo(X(0.09), Y(0.56));
    c.quadraticCurveTo(X(0.3), Y(0.6), X(0.33), Y(0.6));
    c.quadraticCurveTo(X(0.6), Y(0.6), X(0.84), Y(0.5));
    c.quadraticCurveTo(X(0.86), Y(0.8), X(0.5), Y(0.985));
    c.quadraticCurveTo(X(0.34), Y(1.01), X(0.22), Y(0.9));
    c.quadraticCurveTo(X(0.08), Y(0.76), X(0.09), Y(0.56));
    c.closePath();
    fillPaper(c, 'brown');
    wash(c, 'rgba(30, 14, 6, 0.5)');
  });
  // the nose
  glued(c, () => { poly(c, [X(0.27), Y(0.4), X(0.33), Y(0.57), X(0.16), Y(0.575)]); fillPaper(c, 'manila'); });
  // eyes and eyebrows
  const eyes: [number, number][] = [[0.17, 0.46], [0.5, 0.44]];
  for (const [i, [ex, ey]] of eyes.entries()) {
    const x = X(ex), y = Y(ey), s = i ? 1 : -1, r = X(0.045);
    if (look === 'cry') line(() => { c.moveTo(x - r, y - r * 0.6); c.lineTo(x + r * 0.6, y); c.lineTo(x - r, y + r * 0.6); });
    else if (look === 'shocked') {
      circle(c, x, y, r * 1.7); wash(c, '#ffffff');
      line(() => c.arc(x, y, r * 1.7, 0, Math.PI * 2), 2);
      circle(c, x, y, r * 0.6); wash(c, DARK);
    } else if (look === 'dazed') line(() => { c.arc(x, y, r * 1.2, 0, Math.PI * 1.6); c.arc(x, y, r * 0.4, 0, Math.PI * 2); }, 2.4);
    else if (look === 'smug' || look === 'smile') line(() => c.arc(x, y + r * 0.6, r, Math.PI * 1.1, Math.PI * 1.9));
    else if (look === 'disgusted') line(() => { c.moveTo(x - r, y); c.lineTo(x + r, y); });
    else { circle(c, x, y, r * 0.75); wash(c, DARK); }
    // (down in the middle for cross; up in the middle for sorry for himself)
    const tip = look === 'angry' || look === 'disgusted' ? 1 : look === 'worried' || look === 'cry' || look === 'shocked' ? -1 : 0;
    line(() => { c.moveTo(x - s * r * 1.6, y - r * 2.3 - tip * r * 0.8 * (i ? 1 : 1)); c.lineTo(x + s * r * 1.4, y - r * 2.3 + tip * r * 0.8); }, 4);
  }
  // the mouth, on the line the head is cut along
  const mx = X(0.33), my = Y(cut), mw = X(0.14);
  if (look === 'shocked' || look === 'cry') {
    ellipse(c, mx, my, mw, Y(look === 'cry' ? 0.04 : 0.055));
    wash(c, '#3b0c17');
  } else if (look === 'smile') {
    c.beginPath(); c.moveTo(mx - mw, my - 4); c.quadraticCurveTo(mx, my + Y(0.07), mx + mw, my - 4); c.closePath();
    wash(c, '#ffffff');
    line(() => { c.moveTo(mx - mw, my - 4); c.quadraticCurveTo(mx, my + Y(0.07), mx + mw, my - 4); c.closePath(); }, 2.4);
  } else if (look === 'smug') line(() => { c.moveTo(mx - mw, my + 2); c.quadraticCurveTo(mx, my + 6, mx + mw, my - 6); });
  else if (look === 'disgusted') {
    line(() => { c.moveTo(mx - mw, my); c.lineTo(mx + mw, my); });
    glued(c, () => { rr(c, mx - 6, my, 14, 18, 6); fillPaper(c, 'red'); wash(c, 'rgba(255, 255, 255, 0.35)'); });
  } else line(() => { c.moveTo(mx - mw, my + (look === 'dazed' ? -3 : 3)); c.quadraticCurveTo(mx, my - 4, mx + mw, my + 3); });
  if (look === 'cry') {
    for (const [ex, ey] of eyes) { ellipse(c, X(ex) - 4, Y(ey) + 22, 5, 11); fillPaper(c, 'sky'); }
  }
}

/** Mix a paper orange: there is no orange sheet. */
function orange(c: Ctx): void {
  fillPaper(c, 'yellow');
  wash(c, 'rgba(226, 84, 20, 0.62)');
}

function carrot(c: Ctx): void {
  // the green top, at the end that is held
  for (const [y, turn] of [[10, -0.35], [24, 0], [38, 0.35]] as [number, number][]) {
    glued(c, () => { ellipse(c, 20, y, 22, 7, turn); fillPaper(c, 'green'); });
  }
  glued(c, () => {
    c.beginPath();
    c.moveTo(34, 3);
    c.quadraticCurveTo(100, 6, 149, 24);
    c.quadraticCurveTo(100, 42, 34, 45);
    c.quadraticCurveTo(24, 24, 34, 3);
    c.closePath();
    orange(c);
  });
  c.strokeStyle = 'rgba(120, 40, 0, 0.4)';
  c.lineWidth = 2;
  for (const [x, a, b] of [[52, 8, 20], [74, 26, 40], [96, 12, 22], [116, 24, 32]]) { c.beginPath(); c.moveTo(x, a); c.lineTo(x + 3, b); c.stroke(); }
}

function corn(c: Ctx): void {
  // the husk, peeled back at the end that is held
  for (const [y, turn] of [[8, -0.42], [58, 0.42]] as [number, number][]) {
    glued(c, () => { ellipse(c, 34, y, 36, 11, turn); fillPaper(c, 'green'); });
  }
  glued(c, () => { ellipse(c, 22, 33, 24, 13); fillPaper(c, 'green'); wash(c, 'rgba(255, 255, 255, 0.18)'); });
  glued(c, () => {
    c.beginPath();
    c.moveTo(44, 6);
    c.quadraticCurveTo(128, 2, 150, 33);
    c.quadraticCurveTo(128, 64, 44, 60);
    c.quadraticCurveTo(30, 33, 44, 6);
    c.closePath();
    fillPaper(c, 'yellow');
  });
  c.save();
  c.beginPath();
  c.moveTo(44, 6);
  c.quadraticCurveTo(128, 2, 150, 33);
  c.quadraticCurveTo(128, 64, 44, 60);
  c.quadraticCurveTo(30, 33, 44, 6);
  c.clip();
  c.strokeStyle = 'rgba(150, 90, 0, 0.42)';
  c.lineWidth = 1.6;
  for (let x = 50; x < 150; x += 11) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 66); c.stroke(); }
  for (let y = 11; y < 66; y += 11) { c.beginPath(); c.moveTo(40, y); c.lineTo(150, y); c.stroke(); }
  c.restore();
}

function broccoli(c: Ctx): void {
  // the stalk goes in first; the head of it is as big as his
  glued(c, () => {
    poly(c, [84, 44, 170, 50, 175, 63, 170, 76, 84, 82]);
    fillPaper(c, 'green');
    wash(c, 'rgba(255, 255, 220, 0.42)');
  });
  glued(c, () => { poly(c, [96, 40, 120, 22, 112, 48]); fillPaper(c, 'green'); wash(c, 'rgba(255, 255, 220, 0.42)'); });
  glued(c, () => { poly(c, [96, 86, 122, 104, 112, 78]); fillPaper(c, 'green'); wash(c, 'rgba(255, 255, 220, 0.42)'); });
  const florets: [number, number, number][] = [[34, 34, 30], [34, 92, 30], [64, 20, 20], [64, 106, 20], [22, 63, 22], [74, 44, 24], [74, 82, 24], [52, 63, 30]];
  for (const [x, y, r] of florets) {
    glued(c, () => { circle(c, x, y, r); fillPaper(c, 'green'); wash(c, 'rgba(4, 44, 14, 0.4)'); });
  }
  c.fillStyle = 'rgba(190, 240, 150, 0.3)';
  for (const [x, y, r] of florets) { circle(c, x - r * 0.3, y - r * 0.3, r * 0.3); c.fill(); }
}

/** A fist, shoving: knuckles to the right. */
function fist(c: Ctx): void {
  glued(c, () => { rr(c, 3, 4, 38, 32, 13); fillPaper(c, 'manila'); });
  glued(c, () => { rr(c, 8, 24, 24, 13, 6); fillPaper(c, 'manila'); });
  c.strokeStyle = 'rgba(90, 50, 20, 0.45)';
  c.lineWidth = 1.6;
  for (const y of [12, 20, 28]) { c.beginPath(); c.moveTo(30, y); c.lineTo(40, y); c.stroke(); }
}

/** A hand, finger and thumb pinched together at the left. */
function pinch(c: Ctx): void {
  glued(c, () => { ellipse(c, 34, 22, 15, 17); fillPaper(c, 'manila'); });
  glued(c, () => strokePaper(c, [30, 12, 12, 13, 4, 20], 'manila', 9));
  glued(c, () => strokePaper(c, [30, 32, 14, 30, 5, 23], 'manila', 9));
}

/** An open hand, flat, fingers up. */
function palm(c: Ctx): void {
  for (const [x, top] of [[10, 14], [19, 6], [28, 6], [37, 12]]) glued(c, () => strokePaper(c, [x, top, x, 30], 'manila', 8));
  glued(c, () => { rr(c, 5, 22, 37, 24, 10); fillPaper(c, 'manila'); });
  glued(c, () => strokePaper(c, [6, 36, -1, 28], 'manila', 8));
}

/** An arm that stretches: a sleeve (or bare), 200 long, held by the shoulder end. */
function sleeve(c: Ctx, sheet: Paper, thick: number, cuff?: Paper, cap?: Paper): void {
  glued(c, () => { rr(c, 0, 0, 200, thick, thick / 2); fillPaper(c, sheet); });
  if (cuff) glued(c, () => { rr(c, 178, -1, 22, thick + 2, 5); fillPaper(c, cuff); });
  if (cap) glued(c, () => { rr(c, 0, -1, 46, thick + 2, thick / 2); fillPaper(c, cap); });
}

/** A small boy at the table, from the neck down: a waistcoat, and a napkin tucked into his collar. */
function body(c: Ctx): void {
  glued(c, () => {
    c.beginPath();
    c.moveTo(42, 8);
    c.quadraticCurveTo(10, 12, 8, 46);
    c.lineTo(4, 124);
    c.lineTo(126, 124);
    c.lineTo(122, 46);
    c.quadraticCurveTo(120, 12, 88, 8);
    c.closePath();
    fillPaper(c, 'white');
  });
  glued(c, () => { poly(c, [30, 10, 100, 10, 108, 124, 22, 124]); fillPaper(c, 'brown'); });
  // the napkin
  glued(c, () => {
    c.beginPath();
    c.moveTo(40, 4);
    c.lineTo(90, 4);
    c.quadraticCurveTo(104, 60, 96, 110);
    c.lineTo(34, 110);
    c.quadraticCurveTo(26, 60, 40, 4);
    c.closePath();
    fillPaper(c, 'white');
  });
  c.strokeStyle = 'rgba(90, 80, 120, 0.2)';
  c.lineWidth = 2;
  for (const x of [52, 65, 78]) { c.beginPath(); c.moveTo(x, 12); c.lineTo(x + (x - 65) * 0.3, 106); c.stroke(); }
}

/** What he always gets: a bowl of buttered noodles. */
function noodles(c: Ctx): void {
  // the noodles, heaped
  glued(c, () => { ellipse(c, 70, 40, 56, 30); fillPaper(c, 'cream'); wash(c, 'rgba(250, 214, 110, 0.5)'); });
  c.save();
  ellipse(c, 70, 40, 56, 30);
  c.clip();
  c.strokeStyle = 'rgba(190, 140, 40, 0.55)';
  c.lineWidth = 3;
  c.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const x = 18 + i * 13, y = 16 + ((i * 37) % 22);
    c.beginPath();
    c.moveTo(x, y);
    c.bezierCurveTo(x + 22, y - 12, x - 8, y + 18, x + 16, y + 26);
    c.stroke();
  }
  c.restore();
  // a pat of butter, going
  glued(c, () => { poly(c, [58, 14, 84, 10, 88, 24, 62, 28]); fillPaper(c, 'yellow'); });
  // the bowl
  glued(c, () => {
    c.beginPath();
    c.moveTo(6, 44);
    c.quadraticCurveTo(14, 92, 48, 92);
    c.lineTo(92, 92);
    c.quadraticCurveTo(126, 92, 134, 44);
    c.closePath();
    fillPaper(c, 'white');
  });
  glued(c, () => { rr(c, 2, 40, 136, 9, 4); fillPaper(c, 'blue'); });
}

export function buildArt(scene: Phaser.Scene): void {
  // his head, in each look that is used (a photo of it takes each one's place)
  for (const look of LOOKS) {
    const b = headBox(look);
    makePaperArt(scene, headKey(look), b.w, b.h, (c) => paperHead(c, look, b.w, b.h), { border: 3, ax: b.ax, ay: b.ay });
  }

  // inside his mouth: teeth, top and bottom, and a tongue
  for (const [key, up] of [['veggies_teeth_top', false], ['veggies_teeth_bot', true]] as [string, boolean][]) {
    makePaperArt(scene, key, 66, 14, (c) => {
      for (let i = 0; i < 6; i++) glued(c, () => { rr(c, 1 + i * 11, up ? 2 : -6, 10, 18, 4); fillPaper(c, 'white'); });
    }, { border: 0, ax: 0, ay: up ? 14 : 0 });
  }
  makePaperArt(scene, 'veggies_tongue', 74, 24, (c) => {
    glued(c, () => { rr(c, 0, 4, 74, 34, 14); fillPaper(c, 'red'); wash(c, 'rgba(255, 220, 220, 0.45)'); });
    c.strokeStyle = 'rgba(120, 20, 30, 0.35)';
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(10, 14); c.lineTo(70, 16); c.stroke();
  }, { border: 0, ax: 0, ay: 24 });

  // the rest of him
  makePaperArt(scene, 'veggies_body', 130, 124, body, { border: 2.4, ax: 65, ay: 4 });
  makePaperArt(scene, 'veggies_kidarm', 62, 22, (c) => {
    glued(c, () => { rr(c, 0, 2, 44, 18, 9); fillPaper(c, 'white'); });
    glued(c, () => { circle(c, 50, 11, 10); fillPaper(c, 'manila'); });
  }, { border: 2, ax: 8, ay: 11 });
  makePaperArt(scene, 'veggies_neck', 36, 60, (c) => { c.beginPath(); c.rect(0, 0, 36, 60); fillPaper(c, 'manila'); }, { border: 2, ax: 18, ay: 60 });
  makePaperArt(scene, 'veggies_lump', 58, 40, (c) => { glued(c, () => { ellipse(c, 29, 20, 28, 19); fillPaper(c, 'manila'); }); }, { border: 2 });

  // the vegetables
  makePaperArt(scene, 'veggies_carrot', 150, 48, carrot, { border: 2.4, ax: 150, ay: 24 });
  makePaperArt(scene, 'veggies_corn', 152, 66, corn, { border: 2.4, ax: 152, ay: 33 });
  makePaperArt(scene, 'veggies_broccoli', 176, 126, broccoli, { border: 2.4, ax: 176, ay: 63 });
  makePaperArt(scene, 'veggies_leaf', 24, 16, (c) => { glued(c, () => { ellipse(c, 12, 8, 11, 6, 0.3); fillPaper(c, 'green'); }); }, { border: 1.2 });

  // his parents' arms and hands
  makePaperArt(scene, 'veggies_arm_bill', 200, 30, (c) => sleeve(c, 'black', 30, 'white'), { border: 2.2, ax: 6, ay: 15 });
  makePaperArt(scene, 'veggies_arm_steph', 200, 24, (c) => sleeve(c, 'manila', 24, undefined, 'blue'), { border: 2.2, ax: 6, ay: 12 });
  makePaperArt(scene, 'veggies_forearm', 200, 21, (c) => sleeve(c, 'manila', 21), { border: 2.2, ax: 6, ay: 10.5 });
  makePaperArt(scene, 'veggies_fist', 44, 40, fist, { border: 2, ax: 22, ay: 20 });
  makePaperArt(scene, 'veggies_pinch', 50, 44, pinch, { border: 2, ax: 5, ay: 22 });
  makePaperArt(scene, 'veggies_palm', 46, 48, palm, { border: 2, ax: 23, ay: 34 });

  // and what the waiter brings instead
  makePaperArt(scene, 'veggies_noodles', 140, 96, noodles, { border: 2.4, ax: 70, ay: 92 });

  makeWord(scene, 'word_veggies_gulp', 'GULP!', 'green', 'white', 150, 44, 81);
  makeWord(scene, 'word_veggies_nope', 'NOPE!', 'grey', 'white', 132, 34, 82);
  makeWord(scene, 'word_veggies_ptooey', 'PTOOEY!', 'blue', 'yellow', 200, 42, 83);
  makeWord(scene, 'word_veggies_burp', 'BURP!', 'green', 'yellow', 128, 34, 84);
  makeWord(scene, 'word_veggies_cleanplate', 'CLEAN PLATE!', 'yellow', 'red', 340, 62, 85);
}
