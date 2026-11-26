import Phaser from 'phaser';
import { Doll, Look, doll } from '../../art/fight';
import { Paper, cutText, fillPaper, glued, makePaperArt, makeWord, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from '../../art/sticker';
import { BODIES, DOORWAY, INSIDE, V, VAN, WHEEL_R } from './layout';

/** The paper stand-ins for "Take 'em for a ride": what is on the page until there
 *  is a photo (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "ride_" (a word on a burst: "word_ride_..."). The game
 *  cannot make a picture by any other name, or draw over one that is not its own.
 *
 *  The people are a body and a head apart: the heads are their real faces
 *  (everybody's set, docs/characters.md), hung on by the chin. The paper heads
 *  here are only for a page that could not fetch its photos. */

const DARK = '#241a14';

/** Fill the shape `draw` makes with paper, glued down, and a wash of colour over it if one is given. */
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

/** The same, not glued (flat on whatever is under it). */
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

/** A die that always throws the same numbers, so the paper comes out the same every time. */
function dice(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function buildArt(scene: Phaser.Scene): void {
  people(scene);
  animals(scene);
  van(scene);
  road(scene);
  forest(scene);
  inside(scene);
  things(scene);
  words(scene);
}

// ---- the people ---------------------------------------------------------------------------------

/** A doll's head joint, for its neck to point at: 25 up from the chin, along the tilt. */
function crown(chin: V, tilt: number): V {
  return [chin[0] + Math.sin(tilt) * 25, chin[1] - Math.cos(tilt) * 25];
}

const PAPPY: Look = { skin: 'manila', top: 'red', legs: 'grey', arm: 13, leg: 18 };
const MAMMY: Look = { skin: 'manila', top: 'sky', arm: 12, leg: 15 };
const STEPH: Look = { skin: 'manila', top: 'yellow', skirt: 'yellow', arm: 9, leg: 11 };
const CURT: Look = { skin: 'manila', top: 'red', legs: 'blue', arm: 9, leg: 12 };

type Joints = Omit<Doll, 'head' | 'tilt'>;

const POSES: Record<string, Joints> = {
  pappy_wait: {
    hips: [[-10, -112], [12, -112]], knees: [[-12, -56], [14, -56]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-28, -178], [22, -180]], elbows: [[-50, -146], [46, -146]], hands: [[-26, -116], [24, -116]],
  },
  pappy_ready: {
    hips: [[-6, -112], [14, -112]], knees: [[-10, -56], [44, -76]], feet: [[-14, 0], [76, -98]],
    shoulders: [[-24, -182], [24, -182]], elbows: [[-56, -168], [54, -160]], hands: [[-86, -176], [80, -140]],
  },
  pappy_kick: {
    hips: [[-10, -112], [8, -112]], knees: [[-60, -100], [12, -56]], feet: [[-112, -76], [16, 0]],
    shoulders: [[-4, -178], [40, -174]], elbows: [[-28, -160], [72, -150]], hands: [[-52, -176], [98, -160]],
  },
  pappy_kiss: {
    hips: [[-14, -112], [10, -112]], knees: [[-16, -56], [12, -56]], feet: [[-22, 0], [16, 0]],
    shoulders: [[-2, -176], [42, -170]], elbows: [[28, -148], [70, -144]], hands: [[56, -158], [90, -162]],
  },
  pappy_bottle: {
    hips: [[-12, -112], [12, -112]], knees: [[-13, -56], [13, -56]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-26, -184], [26, -184]], elbows: [[-44, -148], [52, -214]], hands: [[-22, -120], [62, -260]],
  },
  mammy_glass: {
    hips: [[-16, -112], [16, -112]], knees: [[-14, -56], [14, -56]], feet: [[-16, 0], [16, 0]],
    shoulders: [[-30, -184], [30, -184]], elbows: [[-56, -150], [56, -196]], hands: [[-24, -120], [46, -244]],
  },
  steph_hold: {
    hips: [[-10, -72], [10, -72]], knees: [[-10, -36], [10, -36]], feet: [[-12, 0], [12, 0]],
    shoulders: [[-17, -118], [17, -118]], elbows: [[-6, -92], [28, -92]], hands: [[14, -102], [32, -106]],
  },
  steph_stand: {
    hips: [[-10, -72], [10, -72]], knees: [[-10, -36], [10, -36]], feet: [[-12, 0], [12, 0]],
    shoulders: [[-17, -118], [17, -118]], elbows: [[-22, -96], [22, -96]], hands: [[-22, -74], [22, -74]],
  },
  curt_stand: {
    hips: [[-11, -72], [11, -72]], knees: [[-11, -36], [11, -36]], feet: [[-13, 0], [13, 0]],
    shoulders: [[-18, -120], [18, -120]], elbows: [[-24, -98], [24, -98]], hands: [[-24, -76], [24, -76]],
  },
};

/** A doll with sleeves: the top is drawn down each arm, so far towards the hand. */
function dressed(c: Ctx, p: Doll, look: Look, sleeve: number): void {
  doll(c, p, look);
  for (const side of [0, 1]) {
    const [s, e, h] = [p.shoulders[side], p.elbows[side], p.hands[side]];
    const pts = sleeve > 1 ? [...s, ...e, e[0] + (h[0] - e[0]) * (sleeve - 1), e[1] + (h[1] - e[1]) * (sleeve - 1)] : [...s, s[0] + (e[0] - s[0]) * sleeve, s[1] + (e[1] - s[1]) * sleeve];
    glued(c, () => strokePaper(c, pts, look.top, look.arm + 4));
  }
}

/** Mammy's housecoat, over her knees, buttoned down the front. */
function housecoat(c: Ctx): void {
  shape(c, () => poly(c, [-25, -108, 25, -108, 36, -40, -36, -40]), 'sky');
  for (const y of [-170, -150, -130, -104, -82, -60]) {
    circle(c, 0, y, 2.6);
    fillPaper(c, 'white');
  }
  glued(c, () => strokePaper(c, [-16, -188, 0, -176, 16, -188], 'white', 6));
  for (const x of [-24, 8]) {
    shape(c, () => ellipse(c, x + 7, -3, 17, 8), 'red');
    shape(c, () => circle(c, x + 17, -8, 5.5), 'white');
  }
}

function people(scene: Phaser.Scene): void {
  const body = (name: string, look: Look, sleeve: number, more?: (c: Ctx) => void) => {
    const b = BODIES[name];
    makePaperArt(scene, `ride_${name}`, b.w, b.h, (c) => {
      c.translate(b.ax, b.ay);
      dressed(c, { ...POSES[name], head: crown(b.chin, b.tilt), tilt: b.tilt }, look, sleeve);
      more?.(c);
    }, { border: 2.5, ax: b.ax, ay: b.ay });
  };
  for (const name of ['pappy_wait', 'pappy_ready', 'pappy_kick', 'pappy_kiss', 'pappy_bottle']) body(name, PAPPY, 1.8);
  body('mammy_glass', MAMMY, 0.8, housecoat);
  // Stephanie's dress has a white collar; Curt's shirt has stripes
  const collar = (c: Ctx) => glued(c, () => strokePaper(c, [-10, -121, 0, -113, 10, -121], 'white', 4));
  body('steph_hold', STEPH, 0.7, collar);
  body('steph_stand', STEPH, 0.7, collar);
  body('curt_stand', CURT, 0.8, (c) => {
    for (const y of [-108, -96, -84]) glued(c, () => strokePaper(c, [-15, y, 15, y], 'white', 3));
  });

  // the paper heads, for a page with no photos: each 80 from hair to chin, held by the chin
  const paperHead = (key: string, skin: Paper, hair: Paper, long: boolean, moustache: boolean) => {
    makePaperArt(scene, key, 90, 104, (c) => {
      c.translate(45, 96);
      if (long) shape(c, () => ellipse(c, 0, -38, 36, 46), hair);
      shape(c, () => ellipse(c, 0, -40, 30, 38), skin);
      shape(c, () => ellipse(c, 0, -70, 31, 14), hair);
      for (const s of [-1, 1]) dot(c, s * 11, -44, 3.2);
      if (moustache) shape(c, () => ellipse(c, 0, -24, 14, 5), 'white');
      ink(c, () => { c.moveTo(-9, -18); c.quadraticCurveTo(0, -11, 9, -18); });
    }, { border: 2.2, ax: 45, ay: 96 });
  };
  paperHead('ride_head_pappy', 'manila', 'white', false, true);
  paperHead('ride_head_mammy', 'manila', 'grey', true, false);
  paperHead('ride_head_steph', 'manila', 'brown', true, false);
  paperHead('ride_head_curt', 'manila', 'brown', false, false);
}

// ---- the animals ----------------------------------------------------------------------------------

/** Each of the dogs Curt and Stephanie brought home. Fido is the first. */
interface Dog { fur: Paper; wash?: string; ear: Paper; ears: 'flop' | 'up'; chest?: Paper; spots?: boolean; scruff?: boolean }
export const DOGS: Dog[] = [
  { fur: 'brown', wash: 'rgba(255, 220, 160, 0.25)', ear: 'brown', ears: 'flop', chest: 'white' },
  { fur: 'black', ear: 'black', ears: 'flop' },
  { fur: 'grey', ear: 'grey', ears: 'up', scruff: true, chest: 'cream' },
  { fur: 'white', ear: 'black', ears: 'flop', spots: true },
];

/** A dog's head, its chin at (0, 0), looking left. With `pant`, its tongue is out. */
function dogHead(c: Ctx, d: Dog, pant: boolean, flap = 0): void {
  const back: V = [12, -30];
  if (d.ears === 'flop') shape(c, () => ellipse(c, back[0] + 10, back[1] + 2, 9, 19, -0.3 - flap), d.ear, 'rgba(0, 0, 0, 0.16)');
  shape(c, () => circle(c, back[0], back[1], 22), d.fur, d.wash);
  // the snout, out to the left
  shape(c, () => ellipse(c, -16, -18, 19, 12, 0.1), d.chest ?? d.fur, d.wash);
  if (d.spots) {
    dot(c, 18, -40, 5);
    dot(c, 2, -18, 3.5);
  }
  dot(c, -33, -22, 4.5);
  dot(c, -2, -38, 3.4);
  dot(c, -1, -39.4, 1.1, '#ffffff');
  ink(c, () => { c.moveTo(-34, -12); c.quadraticCurveTo(-22, -6, -12, -12); }, 2);
  if (pant) shape(c, () => ellipse(c, -21, -4, 6, 10, 0.2), 'red', 'rgba(255, 140, 160, 0.4)');
  // a scruffy one has a beard, and eyebrows
  if (d.scruff) {
    shape(c, () => poly(c, [-30, -10, -24, 2, -18, -6, -12, 4, -6, -8]), d.fur, 'rgba(0, 0, 0, 0.12)');
    ink(c, () => { c.moveTo(-8, -46); c.lineTo(4, -44); }, 3.4, 'rgba(36, 26, 20, 0.7)');
  }
  if (d.ears === 'up') shape(c, () => poly(c, [6, -46, 14, -70, 24, -44]), d.ear, 'rgba(0, 0, 0, 0.14)');
  else shape(c, () => ellipse(c, back[0] + 4, back[1] + 4, 8, 18, -0.15 - flap), d.ear, 'rgba(0, 0, 0, 0.22)');
}

/** A dog sitting up, looking left: held by the spot it sits on. */
function dogSitting(c: Ctx, d: Dog): void {
  // its tail, its haunch, its chest and front legs, then its head
  glued(c, () => strokePaper(c, [44, -16, 60, -30, 62, -48], d.fur, 9));
  shape(c, () => ellipse(c, 24, -24, 30, 24), d.fur, d.wash);
  shape(c, () => ellipse(c, -2, -44, 22, 32, -0.2), d.chest ?? d.fur, d.wash);
  for (const x of [-12, 4]) {
    glued(c, () => strokePaper(c, [x, -40, x - 2, -4], d.fur, 10));
    shape(c, () => ellipse(c, x - 5, -3, 9, 5), d.chest ?? d.fur);
  }
  shape(c, () => ellipse(c, 34, -4, 16, 6), d.fur, 'rgba(0, 0, 0, 0.12)');
  if (d.spots) for (const [x, y] of [[26, -32], [10, -18], [40, -16]]) dot(c, x, y, 5);
  c.save();
  c.translate(-6, -64);
  dogHead(c, d, true);
  c.restore();
}

/** Mr. Quacks: a white duck, looking left. With `fly`, his wings are up. */
function duck(c: Ctx, fly: boolean): void {
  for (const x of [-4, 8]) shape(c, () => poly(c, [x - 8, 0, x + 6, 0, x, -10]), 'yellow', 'rgba(240, 120, 0, 0.5)');
  shape(c, () => ellipse(c, 6, -24, 26, 16, -0.15), 'white');
  shape(c, () => poly(c, [26, -30, 40, -40, 30, -22]), 'white');
  if (fly) {
    shape(c, () => poly(c, [0, -32, -14, -70, 18, -62, 22, -30]), 'white', 'rgba(0, 0, 0, 0.05)');
    shape(c, () => poly(c, [10, -30, 30, -66, 44, -48, 26, -26]), 'white', 'rgba(0, 0, 0, 0.1)');
  } else shape(c, () => ellipse(c, 10, -24, 14, 8, -0.2), 'white', 'rgba(0, 0, 0, 0.07)');
  shape(c, () => ellipse(c, -12, -44, 6, 14), 'white');
  shape(c, () => circle(c, -14, -56, 11), 'white');
  shape(c, () => poly(c, [-22, -58, -38, -54, -22, -50]), 'yellow', 'rgba(240, 120, 0, 0.5)');
  dot(c, -17, -59, 2.2);
}

function animals(scene: Phaser.Scene): void {
  DOGS.forEach((d, i) => {
    makePaperArt(scene, `ride_dog${i}`, 130, 120, (c) => { c.translate(64, 114); dogSitting(c, d); }, { border: 2.3, ax: 64, ay: 114 });
    // ...and its head alone, out of a window with its ears in the wind (held by its chin)
    makePaperArt(scene, `ride_dog${i}_head`, 90, 84, (c) => { c.translate(48, 78); dogHead(c, d, true, 0.9); }, { border: 2.2, ax: 48, ay: 78 });
  });
  makePaperArt(scene, 'ride_duck', 84, 80, (c) => { c.translate(42, 76); duck(c, false); }, { border: 2.2, ax: 42, ay: 76 });
  makePaperArt(scene, 'ride_duck_fly', 84, 90, (c) => { c.translate(42, 86); duck(c, true); }, { border: 2.2, ax: 42, ay: 60 });
  makePaperArt(scene, 'ride_duck_head', 60, 56, (c) => {
    c.translate(34, 54);
    shape(c, () => ellipse(c, 0, -10, 7, 12), 'white');
    shape(c, () => circle(c, -2, -24, 12), 'white');
    shape(c, () => poly(c, [-10, -26, -28, -22, -10, -17]), 'yellow', 'rgba(240, 120, 0, 0.5)');
    dot(c, -5, -28, 2.2);
  }, { border: 2.2, ax: 34, ay: 54 });
}

// ---- the van --------------------------------------------------------------------------------------

function vanBody(c: Ctx, open: boolean): void {
  // the body: brown along the bottom, cream on top, an orange stripe between (it is the seventies)
  const { w } = VAN, top = 18, foot = 206;
  c.save();
  c.beginPath();
  c.moveTo(14, foot);
  c.lineTo(14, top + 26);
  c.quadraticCurveTo(14, top, 40, top);
  c.lineTo(w - 120, top);
  c.quadraticCurveTo(w - 90, top, w - 62, top + 60);
  c.lineTo(w - 22, top + 92);
  c.quadraticCurveTo(w - 10, top + 100, w - 10, top + 120);
  c.lineTo(w - 10, foot);
  c.closePath();
  glued(c, () => { fillPaper(c, 'cream'); });
  c.clip();
  flat(c, () => c.rect(0, 120, w, foot), 'brown');
  flat(c, () => c.rect(0, 112, w, 12), 'yellow', 'rgba(230, 110, 10, 0.55)');
  flat(c, () => c.rect(0, 128, w, 5), 'yellow', 'rgba(230, 110, 10, 0.35)');
  c.restore();
  // the windscreen, the windows (dark: it is night inside), the sliding door's seam
  flat(c, () => poly(c, [w - 116, top + 12, w - 96, top + 14, w - 66, top + 74, w - 116, top + 74]), 'sky', 'rgba(10, 20, 50, 0.6)');
  for (const [x0, x1] of [[34, 116], [136, 236], [254, 352], [372, 444]]) flat(c, () => rr(c, x0, top + 16, x1 - x0, 76, 8), 'sky', 'rgba(10, 20, 50, 0.72)');
  ink(c, () => { c.moveTo(246, top + 6); c.lineTo(246, foot - 6); c.moveTo(362, top + 6); c.lineTo(362, foot - 6); }, 2, 'rgba(36, 26, 20, 0.5)');
  ink(c, () => { c.moveTo(454, top + 6); c.lineTo(454, foot - 6); }, 2, 'rgba(36, 26, 20, 0.5)');
  shape(c, () => rr(c, 336, 140, 18, 7, 3), 'grey');
  shape(c, () => rr(c, 428, 140, 18, 7, 3), 'grey');
  if (open) flat(c, () => rr(c, 248, top + 6, 112, foot - top - 10, 4), 'black', 'rgba(40, 20, 10, 0.5)');
  // bumpers, a headlamp, a tail lamp, and the wheel arches
  shape(c, () => rr(c, w - 30, foot - 22, 28, 14, 4), 'grey', 'rgba(255, 255, 255, 0.3)');
  shape(c, () => rr(c, 4, foot - 22, 26, 14, 4), 'grey', 'rgba(255, 255, 255, 0.3)');
  shape(c, () => rr(c, w - 26, top + 112, 16, 22, 4), 'yellow', 'rgba(255, 255, 255, 0.4)');
  shape(c, () => rr(c, 14, top + 104, 10, 26, 3), 'red');
  for (const x of [VAN.ax - 160, VAN.ax + 160]) flat(c, () => { c.arc(x, foot + 4, WHEEL_R + 8, Math.PI, 0); c.closePath(); }, 'black');
}

function van(scene: Phaser.Scene): void {
  makePaperArt(scene, 'ride_van', VAN.w, VAN.h, (c) => vanBody(c, false), { border: 2.6, ax: VAN.ax, ay: VAN.ay });
  makePaperArt(scene, 'ride_wheel', WHEEL_R * 2, WHEEL_R * 2, (c) => {
    shape(c, () => circle(c, WHEEL_R, WHEEL_R, WHEEL_R), 'black');
    shape(c, () => circle(c, WHEEL_R, WHEEL_R, WHEEL_R * 0.5), 'grey', 'rgba(255, 255, 255, 0.3)');
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      dot(c, WHEEL_R + Math.cos(a) * 10, WHEEL_R + Math.sin(a) * 10, 2.4, '#3a3530');
    }
  }, { border: 1.6 });
  // the window frame Pappy's head is seen through: just its edge, in front of him
  makeArt(scene, 'ride_sill', 96, 12, (c) => { rr(c, 0, 0, 96, 12, 4); fillPaper(c, 'cream'); }, { border: 0, ax: 48, ay: 6 });
  // headlamps, lighting up the road ahead
  makeArt(scene, 'ride_beam', 320, 110, (c) => {
    const g = c.createLinearGradient(0, 0, 320, 0);
    g.addColorStop(0, 'rgba(255, 240, 170, 0.55)');
    g.addColorStop(1, 'rgba(255, 240, 170, 0)');
    c.fillStyle = g;
    poly(c, [0, 48, 320, 0, 320, 110, 0, 62]);
    c.fill();
  }, { border: 0, ax: 0, ay: 55 });
}

// ---- the road, and what is in it -----------------------------------------------------------------

function road(scene: Phaser.Scene): void {
  // a dustbin rolled out into the road, and its lid
  makePaperArt(scene, 'ride_can', 50, 66, (c) => {
    shape(c, () => poly(c, [4, 10, 46, 10, 42, 66, 8, 66]), 'grey', 'rgba(255, 255, 255, 0.18)');
    for (const x of [14, 25, 36]) ink(c, () => { c.moveTo(x, 16); c.lineTo(x - (x - 25) * 0.1, 62); }, 2, 'rgba(0, 0, 0, 0.25)');
    shape(c, () => rr(c, 0, 2, 50, 10, 4), 'grey', 'rgba(0, 0, 0, 0.12)');
    shape(c, () => rr(c, 18, -4, 14, 7, 3), 'grey');
  }, { border: 2.2, ax: 25, ay: 64 });
  // a pothole: a hole in the tarmac, and the cracks out from it
  makeArt(scene, 'ride_hole', 110, 30, (c) => {
    ellipse(c, 55, 15, 50, 12);
    c.fillStyle = 'rgba(20, 16, 14, 0.85)';
    c.fill();
    ellipse(c, 55, 13, 40, 8);
    c.fillStyle = 'rgba(0, 0, 0, 0.5)';
    c.fill();
    ink(c, () => { c.moveTo(6, 14); c.lineTo(0, 10); c.moveTo(104, 16); c.lineTo(110, 22); c.moveTo(86, 4); c.lineTo(92, 0); }, 1.6, 'rgba(20, 16, 14, 0.7)');
  }, { border: 0, ax: 55, ay: 15 });
  // the sign at the edge of town
  makePaperArt(scene, 'ride_sign', 176, 210, (c) => {
    for (const x of [40, 136]) shape(c, () => c.rect(x - 4, 60, 8, 150), 'grey');
    shape(c, () => rr(c, 2, 4, 172, 96, 8), 'green', 'rgba(0, 60, 20, 0.3)');
    ink(c, () => rr(c, 8, 10, 160, 84, 6), 2.4, '#fbf6ea');
    cutText(c, 'NOW LEAVING', 88, 34, 22, 'white');
    cutText(c, 'TOWN', 88, 66, 32, 'white');
    shape(c, () => rr(c, 18, 110, 140, 34, 6), 'white');
    cutText(c, 'COME BACK SOON!', 88, 128, 17, 'green');
  }, { border: 2.4, ax: 88, ay: 206 });
  // bits of rubbish, knocked flying
  makePaperArt(scene, 'ride_trash0', 26, 18, (c) => { shape(c, () => poly(c, [2, 4, 22, 0, 24, 14, 6, 18]), 'white', 'rgba(120, 90, 40, 0.2)'); }, { border: 1.2 });
  makePaperArt(scene, 'ride_trash1', 16, 24, (c) => { shape(c, () => rr(c, 2, 2, 12, 20, 3), 'red'); }, { border: 1.2 });
  makePaperArt(scene, 'ride_trash2', 30, 16, (c) => { shape(c, () => { c.moveTo(2, 14); c.quadraticCurveTo(15, -8, 28, 14); c.quadraticCurveTo(15, 4, 2, 14); }, 'yellow'); }, { border: 1.2 });
}

// ---- the edge of town -----------------------------------------------------------------------------

/** The forest at the edge of town: bare dead trees against the night, and mist along the ground.
 *  A strip that repeats; its ground is at the foot of it. */
export const FOREST = { w: 720, h: 470 };

function bareTree(c: Ctx, x: number, foot: number, tall: number, lean: number, rnd: () => number): void {
  const limb = (x0: number, y0: number, a: number, len: number, w: number, depth: number) => {
    const x1 = x0 + Math.sin(a) * len, y1 = y0 - Math.cos(a) * len;
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.strokeStyle = '#1b1620';
    c.lineWidth = w;
    c.lineCap = 'round';
    c.stroke();
    if (depth <= 0) return;
    const n = depth > 2 ? 2 : 2 + (rnd() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) limb(x1, y1, a + (rnd() - 0.5) * 1.5 + (i - (n - 1) / 2) * 0.5, len * (0.55 + rnd() * 0.2), w * 0.62, depth - 1);
  };
  limb(x, foot, lean, tall * 0.42, tall * 0.07, 4);
}

function forest(scene: Phaser.Scene): void {
  const { w, h } = FOREST;
  makeArt(scene, 'ride_forest', w, h, (c) => {
    const sky = c.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#141432');
    sky.addColorStop(0.75, '#3a2f52');
    sky.addColorStop(1, '#4a3e5a');
    c.fillStyle = sky;
    c.fillRect(0, 0, w, h);
    const rnd = dice(7);
    // the trees further off, fainter; then the near ones
    for (const [far, n] of [[true, 9], [false, 6]] as const) {
      for (let i = 0; i < n; i++) {
        const x = 40 + ((i + rnd() * 0.6) / n) * (w - 80);
        c.save();
        c.globalAlpha = far ? 0.45 : 1;
        bareTree(c, x, h - (far ? 46 : 14), far ? 170 + rnd() * 80 : 280 + rnd() * 120, (rnd() - 0.5) * 0.3, rnd);
        c.restore();
      }
    }
    // the ground: dead grass and dirt, and mist lying on it
    c.fillStyle = '#2b2420';
    c.fillRect(0, h - 24, w, 24);
    for (let i = 0; i < 60; i++) {
      const x = rnd() * w;
      c.beginPath();
      c.moveTo(x, h - 20);
      c.lineTo(x + (rnd() - 0.5) * 8, h - 32 - rnd() * 14);
      c.strokeStyle = 'rgba(120, 100, 70, 0.6)';
      c.lineWidth = 1.6;
      c.stroke();
    }
    const mist = c.createLinearGradient(0, h - 90, 0, h);
    mist.addColorStop(0, 'rgba(200, 200, 230, 0)');
    mist.addColorStop(0.6, 'rgba(200, 200, 230, 0.28)');
    mist.addColorStop(1, 'rgba(200, 200, 230, 0.1)');
    c.fillStyle = mist;
    c.fillRect(0, h - 90, w, 90);
  }, { border: 0, ax: 0, ay: 0 });
  makePaperArt(scene, 'ride_moon', 74, 74, (c) => {
    shape(c, () => circle(c, 37, 37, 34), 'cream', 'rgba(255, 250, 200, 0.4)');
    for (const [x, y, r] of [[26, 28, 6], [46, 46, 8], [48, 22, 4]]) {
      circle(c, x, y, r);
      c.fillStyle = 'rgba(120, 110, 80, 0.2)';
      c.fill();
    }
  }, { border: 2 });
  // an owl's eyes, in the dark
  makeArt(scene, 'ride_owl', 30, 12, (c) => {
    for (const x of [7, 23]) dot(c, x, 6, 4.5, '#f6d040');
    for (const x of [7, 23]) dot(c, x, 6, 1.8, '#1b1620');
  }, { border: 0 });
}

// ---- inside the van, looking out of the side door --------------------------------------------------

/** The inside of the van, as wide as the widest page, with the doorway cut out of it (what is
 *  behind it shows through: the forest). Drawn from -BLEED, -BLEED. */
function inside(scene: Phaser.Scene): void {
  const B = 48, { w, h } = INSIDE;
  const d = { l: DOORWAY.l + B, r: DOORWAY.r + B, t: DOORWAY.t + B, b: DOORWAY.b + B };
  makeArt(scene, 'ride_inside', w, h, (c) => {
    // ceiling, panelled walls, shag carpet
    flat(c, () => c.rect(0, 0, w, d.t - 20), 'cream', 'rgba(160, 120, 60, 0.25)');
    flat(c, () => c.rect(0, d.t - 20, w, d.b - d.t + 20), 'brown', 'rgba(120, 60, 10, 0.18)');
    for (let x = 0; x < w; x += 46) ink(c, () => { c.moveTo(x, d.t - 20); c.lineTo(x, d.b); }, 2, 'rgba(30, 15, 5, 0.35)');
    flat(c, () => c.rect(0, d.b, w, h - d.b), 'yellow', 'rgba(200, 80, 0, 0.55)');
    const rnd = dice(3);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * w, y = d.b + 4 + rnd() * (h - d.b);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (rnd() - 0.5) * 6, y - 6);
      c.strokeStyle = 'rgba(110, 40, 0, 0.45)';
      c.lineWidth = 2;
      c.stroke();
    }
    // the bench seat at the back, and a window over it with the night in it
    flat(c, () => rr(c, 820, d.t + 30, 380, 120, 12), 'sky', 'rgba(10, 20, 50, 0.75)');
    glued(c, () => { rr(c, 700, d.b - 120, 620, 70, 14); fillPaper(c, 'brown'); c.fillStyle = 'rgba(60, 20, 0, 0.3)'; c.fill(); });
    glued(c, () => { rr(c, 700, d.b - 54, 620, 54, 10); fillPaper(c, 'brown'); c.fillStyle = 'rgba(30, 10, 0, 0.35)'; c.fill(); });
    for (let x = 740; x < 1300; x += 80) ink(c, () => { c.moveTo(x, d.b - 116); c.lineTo(x, d.b - 56); }, 2, 'rgba(0, 0, 0, 0.25)');
    // a dome light, on
    shape(c, () => ellipse(c, 640, 40, 40, 12), 'cream', 'rgba(255, 240, 160, 0.6)');
    // the doorway: a steel frame round it, its runner along the top, and the step
    flat(c, () => rr(c, d.l - 16, d.t - 16, d.r - d.l + 32, d.b - d.t + 30, 10), 'grey', 'rgba(255, 255, 255, 0.15)');
    flat(c, () => c.rect(d.l - 30, d.t - 26, d.r - d.l + 60, 8), 'grey', 'rgba(0, 0, 0, 0.2)');
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = '#000000';
    c.fillRect(d.l, d.t, d.r - d.l, d.b - d.t);
    c.globalCompositeOperation = 'source-over';
    flat(c, () => c.rect(d.l - 6, d.b, d.r - d.l + 12, 10), 'grey', 'rgba(0, 0, 0, 0.3)');
  }, { border: 0, ax: 0, ay: 0 });
  // the sliding door, from inside: it covers the doorway, and slides away to the left
  const dw = DOORWAY.r - DOORWAY.l + 8, dh = DOORWAY.b - DOORWAY.t + 8;
  makeArt(scene, 'ride_slider', dw, dh, (c) => {
    flat(c, () => c.rect(0, 0, dw, dh), 'brown', 'rgba(80, 40, 10, 0.25)');
    flat(c, () => rr(c, 30, 30, dw - 60, 120, 8), 'sky', 'rgba(10, 20, 50, 0.75)');
    for (let y = 170; y < dh - 20; y += 34) ink(c, () => { c.moveTo(20, y); c.lineTo(dw - 20, y); }, 2, 'rgba(0, 0, 0, 0.2)');
    shape(c, () => rr(c, dw - 48, dh / 2 - 8, 30, 14, 5), 'grey', 'rgba(255, 255, 255, 0.3)');
  }, { border: 0, ax: 0, ay: 0 });
}

// ---- the champagne, and the meter -----------------------------------------------------------------

/** The kick meter: the same as the swing meter in "FORE!" (how big its frame is, how far in the part
 *  that fills is, and how much of it the sweet spot is: half of the green on Mom's workout tape). */
export const METER = { w: 56, h: 268, pad: 8 };
export const ZONE = 0.12;

function things(scene: Phaser.Scene): void {
  makePaperArt(scene, 'ride_bottle', 30, 96, (c) => {
    shape(c, () => { c.moveTo(10, 0); c.lineTo(20, 0); c.lineTo(20, 26); c.quadraticCurveTo(30, 36, 30, 48); c.lineTo(30, 96); c.lineTo(0, 96); c.lineTo(0, 48); c.quadraticCurveTo(0, 36, 10, 26); c.closePath(); }, 'green', 'rgba(0, 40, 10, 0.4)');
    flat(c, () => c.rect(9, 0, 12, 22), 'yellow', 'rgba(200, 150, 0, 0.3)');
    flat(c, () => rr(c, 3, 54, 24, 26, 3), 'cream');
    cutText(c, 'BUBBLY', 15, 67, 8, 'red');
  }, { border: 2, ax: 15, ay: 70 });
  makePaperArt(scene, 'ride_cork', 14, 14, (c) => { shape(c, () => rr(c, 1, 1, 12, 12, 4), 'yellow', 'rgba(150, 100, 30, 0.4)'); }, { border: 1.4 });
  makePaperArt(scene, 'ride_glass', 26, 52, (c) => {
    c.globalAlpha = 0.85;
    shape(c, () => { c.moveTo(3, 2); c.lineTo(23, 2); c.lineTo(17, 26); c.lineTo(9, 26); c.closePath(); }, 'white', 'rgba(255, 220, 120, 0.5)');
    c.globalAlpha = 1;
    shape(c, () => c.rect(11.5, 26, 3, 20), 'white');
    shape(c, () => ellipse(c, 13, 48, 9, 3), 'white');
  }, { border: 1.6, ax: 13, ay: 26 });
  makeArt(scene, 'ride_fizz', 10, 10, (c) => { circle(c, 5, 5, 4); fillPaper(c, 'cream'); c.fillStyle = 'rgba(255, 245, 190, 0.6)'; c.fill(); }, { border: 0 });

  const { w, h, pad } = METER, inner = { w: w - pad * 2, h: h - pad * 2 };
  makePaperArt(scene, 'ride_meter', w, h, (c) => {
    rr(c, 0, 0, w, h, 14);
    fillPaper(c, 'white');
    rr(c, pad, pad, inner.w, inner.h, 9);
    fillPaper(c, 'black');
  }, { border: 2 });
  makeArt(scene, 'ride_zone', inner.w, inner.h * ZONE, (c) => { c.rect(0, 0, inner.w, inner.h * ZONE); fillPaper(c, 'green'); }, { border: 0, ax: inner.w / 2, ay: inner.h * ZONE });
  makeArt(scene, 'ride_fill', inner.w, 8, (c) => { c.rect(0, 0, inner.w, 8); fillPaper(c, 'yellow'); }, { border: 0, ax: inner.w / 2, ay: 8 });
}

function words(scene: Phaser.Scene): void {
  makeWord(scene, 'word_ride_boot', 'BOOT!', 'yellow', 'red', 140, 40, 3);
  makeWord(scene, 'word_ride_pop', 'POP!', 'yellow', 'red', 118, 38, 5);
  makeWord(scene, 'word_ride_mwah', 'MWAH!', 'red', 'white', 130, 32, 2);
  makeWord(scene, 'word_ride_quack', 'QUACK!', 'white', 'yellow', 124, 28, 4);
  makeWord(scene, 'word_ride_yip', 'YIP!', 'white', 'red', 96, 30, 6);
}
