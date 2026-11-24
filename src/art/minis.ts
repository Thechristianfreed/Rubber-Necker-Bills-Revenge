import Phaser from 'phaser';
import { Ctx, circle, ellipse, makeArt, makeCanvas, poly, rr } from './sticker';
import { Paper, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from './paper';

/** Cut-paper art for the quick games ("Home Movies"), and above all for Mom's
 *  workout tape: the television, the poses, and the people doing them. These
 *  are stand-ins: any of them is replaced by a photo cutout registered under
 *  the same key (see photos.ts). */

type V = [number, number];

/** A workout pose, as where each joint is: x to the right and y down from the
 *  spot on the floor the figure is standing (or sitting, or kneeling) on. */
export interface Pose {
  name: string;
  hips: [V, V];
  knees: [V, V];
  feet: [V, V];
  shoulders: [V, V];
  elbows: [V, V];
  hands: [V, V];
  /** The middle of the head, and how far it tips. */
  head: V;
  tilt: number;
}

/** The poses on the tape. Left and right are as we see them. */
export const POSES: Record<string, Pose> = {
  lunge: {
    name: 'THE LUNGE',
    hips: [[-14, -112], [14, -112]], knees: [[-60, -94], [18, -58]], feet: [[-64, -30], [20, 0]],
    shoulders: [[-30, -190], [30, -190]], elbows: [[-62, -150], [58, -150]], hands: [[-58, -102], [24, -118]],
    head: [0, -232], tilt: -0.06,
  },
  pretzel: {
    name: 'THE PRETZEL',
    hips: [[-16, -24], [16, -24]], knees: [[-72, -16], [-4, -86]], feet: [[-128, -12], [-46, -12]],
    shoulders: [[-28, -106], [28, -102]], elbows: [[-50, -72], [54, -64]], hands: [[-8, -90], [62, -8]],
    head: [2, -148], tilt: 0.1,
  },
  frog: {
    name: 'THE FROG',
    hips: [[-16, -60], [16, -60]], knees: [[-80, -12], [80, -12]], feet: [[-116, -24], [116, -24]],
    shoulders: [[-30, -114], [30, -114]], elbows: [[-27, -62], [27, -62]], hands: [[-25, -6], [25, -6]],
    head: [0, -156], tilt: 0,
  },
  kick: {
    name: 'THE DONKEY KICK',
    hips: [[-12, -80], [14, -80]], knees: [[-72, -88], [18, -10]], feet: [[-138, -92], [42, -6]],
    shoulders: [[-28, -106], [28, -106]], elbows: [[-33, -56], [33, -56]], hands: [[-35, -5], [37, -5]],
    head: [4, -146], tilt: 0.12,
  },
  stretch: {
    name: 'THE BIG STRETCH',
    hips: [[-14, -118], [14, -118]], knees: [[-30, -60], [30, -60]], feet: [[-42, 0], [42, 0]],
    shoulders: [[-32, -190], [26, -198]], elbows: [[-56, -230], [36, -248]], hands: [[-76, -268], [-2, -284]],
    head: [-8, -234], tilt: -0.16,
  },
};

/** Not one of the poses to pick from: how the breathing is done on the tape,
 *  bent forward towards the camera with a hand on each knee. */
export const STANCE = 'ready';
POSES[STANCE] = {
  name: 'BREATHE!',
  hips: [[-16, -112], [16, -112]], knees: [[-34, -60], [34, -60]], feet: [[-42, 0], [42, 0]],
  shoulders: [[-36, -154], [36, -154]], elbows: [[-50, -110], [50, -110]], hands: [[-37, -72], [37, -72]],
  head: [0, -178], tilt: 0,
};

export const POSE_IDS = Object.keys(POSES).filter((id) => id !== STANCE);

/** The canvas every pose is drawn on, and where the floor spot is on it. */
const POSE_W = 320, POSE_H = 310, POSE_AX = 160, POSE_AY = 300;
/** How big a head is next to one of these bodies. */
export const WORKOUT_HEAD = 66;
/** Bill's head is a size too big for his body, as everywhere else: this tall, hair to chin. */
export const BILL_HEAD = WORKOUT_HEAD * 1.3;

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

const mid = (a: V, b: V, k = 0.5): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** Somebody in a leotard, tights and slouch socks, holding a pose. `hairy` is
 *  for Bill, who has not shaved his legs for the occasion. */
function figure(c: Ctx, p: Pose, leotard: Paper, pale: boolean, hairy: boolean): void {
  const limb = (pts: V[], sheet: Paper, w: number) => glued(c, () => strokePaper(c, pts.flat(), sheet, w));
  const hairs = (a: V, b: V) => {
    if (!hairy) return;
    c.strokeStyle = 'rgba(40, 30, 24, 0.55)';
    c.lineWidth = 1.2;
    for (let i = 1; i < 7; i++) {
      const [x, y] = mid(a, b, i / 7);
      c.beginPath();
      c.moveTo(x - 5, y + (i % 2 ? -3 : 3));
      c.lineTo(x - 9, y + (i % 2 ? -6 : 6));
      c.moveTo(x + 5, y + (i % 2 ? 3 : -3));
      c.lineTo(x + 9, y + (i % 2 ? 6 : -6));
      c.stroke();
    }
  };
  // the leg furthest from us first; socks and shoes go on last
  for (const side of [1, 0]) {
    limb([p.hips[side], p.knees[side], p.feet[side]], 'manila', 18);
    hairs(p.hips[side], p.knees[side]);
    hairs(p.knees[side], mid(p.knees[side], p.feet[side], 0.6));
    limb([mid(p.knees[side], p.feet[side], 0.66), p.feet[side]], 'white', 21);
    glued(c, () => { ellipse(c, p.feet[side][0], p.feet[side][1] - 2, 15, 9); fillPaper(c, 'white'); });
  }
  // the leotard: shoulders to hips, cut high on the leg
  const [sl, sr] = p.shoulders, [hl, hr] = p.hips;
  const crotch: V = [(hl[0] + hr[0]) / 2, (hl[1] + hr[1]) / 2 + 16];
  glued(c, () => {
    poly(c, [sl[0] - 4, sl[1], sr[0] + 4, sr[1], hr[0] + 9, hr[1] - 6, crotch[0], crotch[1], hl[0] - 9, hl[1] - 6]);
    fillPaper(c, leotard);
    if (pale) {
      c.fillStyle = 'rgba(255, 255, 255, 0.42)';
      c.fill();
    }
  });
  const neck = mid(sl, sr);
  strokePaper(c, [neck[0], neck[1] + 2, p.head[0], p.head[1] + 22], 'manila', 15);
  for (const side of [0, 1]) {
    limb([p.shoulders[side], p.elbows[side], p.hands[side]], 'manila', 12);
    hairs(p.elbows[side], p.hands[side]);
    glued(c, () => { circle(c, p.hands[side][0], p.hands[side][1], 8); fillPaper(c, 'manila'); });
  }
}

/** Mom's stand-in head, until there is a photo of her: big hair, and a face
 *  for each stage of the breathing. On a 110 x 110 canvas, chin at (55, 96). */
function momHead(c: Ctx, face: 'smile' | 'in' | 'pah' | 'hold'): void {
  // the hair first: a cloud of it
  glued(c, () => {
    for (const [x, y, r] of [[55, 40, 40], [24, 58, 24], [86, 58, 24], [30, 28, 22], [80, 28, 22], [18, 82, 15], [92, 82, 15]]) {
      circle(c, x, y, r);
      fillPaper(c, 'yellow');
    }
  });
  c.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (const [x, y, r] of [[40, 22, 9], [70, 18, 8], [22, 50, 7], [90, 46, 7]]) {
    circle(c, x, y, r);
    c.fill();
  }
  glued(c, () => { ellipse(c, 55, 62, 27, 33); fillPaper(c, 'manila'); });
  if (face === 'hold') {
    // holding it: going red, cheeks out
    c.fillStyle = 'rgba(210, 40, 40, 0.42)';
    ellipse(c, 55, 62, 27, 33);
    c.fill();
    for (const x of [36, 74]) {
      circle(c, x, 72, 9);
      c.fillStyle = 'rgba(210, 40, 40, 0.5)';
      c.fill();
    }
  }
  const ink = '#2a2320';
  const dot = (x: number, y: number, r: number) => { circle(c, x, y, r); c.fillStyle = ink; c.fill(); };
  const line = (draw: () => void, w = 2.6) => { c.beginPath(); draw(); c.strokeStyle = ink; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); };
  if (face === 'hold') {
    line(() => { c.moveTo(38, 54); c.lineTo(48, 58); });
    line(() => { c.moveTo(72, 54); c.lineTo(62, 58); });
    line(() => { c.moveTo(46, 80); c.lineTo(64, 80); }, 3);
  } else {
    dot(44, 56, 3.2);
    dot(66, 56, 3.2);
    if (face === 'pah') {
      ellipse(c, 55, 80, 10, 12);
      c.fillStyle = ink;
      c.fill();
    } else if (face === 'in') {
      circle(c, 55, 80, 5);
      c.fillStyle = ink;
      c.fill();
    } else {
      line(() => { c.arc(55, 70, 14, 0.15 * Math.PI, 0.85 * Math.PI); });
    }
  }
  // a little blue eyeshadow: it is the eighties
  if (face !== 'hold') {
    c.fillStyle = 'rgba(60, 110, 200, 0.5)';
    for (const x of [44, 66]) {
      ellipse(c, x, 50, 6, 3);
      c.fill();
    }
  }
}

/** The television and the video recorder under it: how big they are drawn,
 *  where the glass of the screen is, and where the recorder's clock is (from
 *  tools/make_cutouts.py, which also cuts the hole the tape shows through). */
export const TV = { w: 440, h: 432, screen: { x: 43, y: 51, w: 290, h: 227 }, clock: { x: 219, y: 402 } };
/** How far down the photo of the den the wall meets the carpet. */
export const DEN_FLOOR = 431;

/** The stand-in television: a wooden box with a hole for the screen, on top of a recorder. */
function television(c: Ctx): void {
  const s = TV.screen;
  glued(c, () => { rr(c, 0, 0, TV.w, 318, 14); fillPaper(c, 'brown'); });
  glued(c, () => { rr(c, s.x - 14, s.y - 14, s.w + 28, s.h + 28, 22); fillPaper(c, 'black'); });
  // the knobs down the side
  for (const y of [84, 144]) {
    glued(c, () => { circle(c, 396, y, 17); fillPaper(c, 'black'); });
    rect(c, 394, y - 15, 4, 13, 'white');
  }
  c.fillStyle = 'rgba(0, 0, 0, 0.35)';
  for (let y = 196; y < 296; y += 9) c.fillRect(378, y, 36, 3.5);
  // the video recorder, with the clock nobody ever set
  glued(c, () => { rr(c, 16, 324, TV.w - 32, TV.h - 326, 6); fillPaper(c, 'black'); });
  rect(c, TV.clock.x - 70, TV.clock.y - 13, 140, 26, 'grey');
  c.fillStyle = 'rgba(0, 0, 0, 0.55)';
  c.fillRect(TV.clock.x - 66, TV.clock.y - 9, 132, 18);
  for (const x of [338, 360, 382]) rect(c, x, TV.clock.y - 5, 14, 10, 'grey');
  // the glass is a hole: whatever is on the tape shows through from behind
  c.save();
  c.globalCompositeOperation = 'destination-out';
  rr(c, s.x, s.y, s.w, s.h, 22);
  c.fill();
  c.restore();
}

/** The stand-in room on the tape: a cream wall, a grey carpet, a picture, a plant, a fireplace. */
function tapeRoom(c: Ctx): void {
  const { w, h } = TV.screen, floor = h * 0.66;
  rect(c, 0, 0, w, h, 'cream');
  rect(c, 0, floor, w, h - floor, 'grey');
  c.fillStyle = 'rgba(255, 255, 255, 0.5)';
  c.fillRect(0, floor, w, h - floor);
  rect(c, 34, 20, 76, 46, 'brown');
  rect(c, 40, 26, 64, 34, 'green');
  rect(c, w - 70, floor - 100, 70, 100, 'manila');
  rect(c, w - 58, floor - 78, 46, 78, 'black');
  for (const [dx, dy] of [[-8, -80], [12, -88], [26, -64]]) strokePaper(c, [w * 0.6, floor, w * 0.6 + dx, floor + dy], 'green', 5);
}

export function buildMiniArt(scene: Phaser.Scene): void {
  // everyone on the tape, in every pose: Mom in pink, Bill in blue
  for (const id of Object.keys(POSES)) {
    for (const [who, leotard, pale, hairy] of [['mom', 'red', true, false], ['bill', 'blue', false, true]] as const) {
      makePaperArt(scene, `pose_${who}_${id}`, POSE_W, POSE_H, (c) => {
        c.translate(POSE_AX, POSE_AY);
        figure(c, POSES[id], leotard, pale, hairy);
      }, { border: 2.5, ax: POSE_AX, ay: POSE_AY });
    }
  }
  for (const face of ['smile', 'in', 'pah', 'hold'] as const) {
    makePaperArt(scene, `mom_${face}`, 110, 110, (c) => momHead(c, face), { border: 2.5, ax: 55, ay: 96 });
  }

  makePaperArt(scene, 'tv_set', TV.w, TV.h, television, { border: 2.5, ax: 0, ay: 0 });
  makePaperArt(scene, 'tape_room', TV.screen.w, TV.screen.h, tapeRoom, { border: 0, ax: 0, ay: 0 });
  // scan lines to lay over the screen, and snow for when the channel changes
  const [lines, lc] = makeCanvas(8, 8);
  lc.fillStyle = 'rgba(10, 10, 30, 0.2)';
  lc.fillRect(0, 0, 8, 3);
  scene.textures.addCanvas('tv_lines', lines);
  const [snow, sc] = makeCanvas(256, 256);
  const px = sc.createImageData(256, 256);
  for (let i = 0; i < px.data.length; i += 4) {
    const v = Math.floor(Math.random() * 256);
    px.data[i] = px.data[i + 1] = px.data[i + 2] = v;
    px.data[i + 3] = 255;
  }
  sc.putImageData(px, 0, 0);
  scene.textures.addCanvas('tv_snow', snow);

  // the room the television is in
  makePaperArt(scene, 'den_wall', 64, 64, (c) => {
    rect(c, 0, 0, 64, 64, 'sky');
    c.fillStyle = 'rgba(255, 255, 255, 0.55)';
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = 'rgba(60, 110, 170, 0.2)';
    c.fillRect(0, 0, 10, 64);
    c.fillRect(32, 0, 10, 64);
  }, { border: 0, ax: 0, ay: 0 });
  makePaperArt(scene, 'den_carpet', 64, 64, (c) => {
    rect(c, 0, 0, 64, 64, 'manila');
    c.fillStyle = 'rgba(120, 70, 30, 0.14)';
    for (let i = 0; i < 26; i++) c.fillRect((i * 29) % 62, (i * 41) % 60, 2, 4);
  }, { border: 0, ax: 0, ay: 0 });

  // a snapshot to pick a pose from, the lungs, and the words
  makePaperArt(scene, 'pose_card', 96, 104, (c) => {
    rect(c, 0, 0, 96, 104, 'white');
    rect(c, 6, 6, 84, 78, 'sky');
  }, { border: 1.5 });
  makePaperArt(scene, 'pose_card_on', 96, 104, (c) => {
    rect(c, 0, 0, 96, 104, 'yellow');
    rect(c, 6, 6, 84, 78, 'sky');
  }, { border: 1.5 });
  makePaperArt(scene, 'lungs', 40, 200, (c) => {
    rr(c, 0, 0, 40, 200, 12);
    fillPaper(c, 'white');
    rr(c, 6, 6, 28, 188, 8);
    fillPaper(c, 'black');
    // the stretch at the top where it is time to let go
    rr(c, 6, 6, 28, 44, 8);
    fillPaper(c, 'green');
  }, { border: 2 });
  makeArt(scene, 'breath', 28, 8, (c) => {
    c.fillStyle = paper(c, 'yellow');
    c.fillRect(0, 0, 28, 8);
  });
  makeWord(scene, 'word_pah', 'PAH!', 'yellow', 'red', 300, 92, 41);
  makeWord(scene, 'word_pff', 'pfff...', 'grey', 'white', 120, 26, 42);
  makeWord(scene, 'word_cough', 'COUGH!', 'blue', 'white', 126, 28, 43);
  makeWord(scene, 'word_nice', 'NICE!', 'green', 'white', 104, 30, 44);
  makeWord(scene, 'word_nope', 'NOPE!', 'grey', 'yellow', 104, 30, 45);
  makeWord(scene, 'word_toomany', 'TOO MANY!', 'grey', 'yellow', 140, 26, 46);
  makeWord(scene, 'stamp_win', 'NAILED IT!', 'green', 'white', 360, 70, 47);
  makeWord(scene, 'stamp_lose', 'OOF!', 'grey', 'yellow', 300, 92, 48);

  // one mark for each game on the tape: still to come, on now, cleared, missed
  const mark = (key: string, sheet: Paper, sign?: 'tick' | 'cross') => makePaperArt(scene, key, 26, 26, (c) => {
    circle(c, 13, 13, 11);
    fillPaper(c, sheet);
    if (sign === 'tick') strokePaper(c, [7, 13.5, 11.5, 18, 19, 8.5], 'white', 3.2);
    if (sign === 'cross') {
      strokePaper(c, [8.5, 8.5, 17.5, 17.5], 'white', 3);
      strokePaper(c, [17.5, 8.5, 8.5, 17.5], 'white', 3);
    }
  }, { border: 2 });
  mark('mini_mark', 'cream');
  mark('mini_mark_now', 'yellow');
  mark('mini_mark_win', 'green', 'tick');
  mark('mini_mark_lose', 'grey', 'cross');

  // a video cassette: the way in from the list of levels
  makePaperArt(scene, 'cassette', 200, 70, (c) => {
    rr(c, 0, 0, 200, 70, 6);
    fillPaper(c, 'black');
    glued(c, () => rect(c, 14, 8, 172, 34, 'white'));
    cutText(c, 'HOME MOVIES', 100, 26, 22, 'red');
    for (const x of [62, 138]) {
      circle(c, x, 55, 9);
      fillPaper(c, 'white');
      circle(c, x, 55, 4);
      fillPaper(c, 'black');
    }
  }, { border: 2.5 });
}
