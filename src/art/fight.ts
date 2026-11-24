import Phaser from 'phaser';
import { Ctx, circle, ellipse, makeArt, poly, rr, star } from './sticker';
import { DISPLAY, Paper, burstPath, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from './paper';

/** Cut-paper art for the fight after school: the gym, Stephanie in her cheer
 *  outfit, the other girl before and after, and everything that gets broken.
 *  These are stand-ins: any of them is replaced by a photo cutout registered
 *  under the same key (see photos.ts). */

type V = [number, number];

/** A paper doll in a pose: where each joint is, x to the right and y down from
 *  the spot on the floor it stands on. */
export interface Doll {
  hips: [V, V];
  knees: [V, V];
  feet: [V, V];
  shoulders: [V, V];
  elbows: [V, V];
  hands: [V, V];
  /** The middle of the head, and how far it tips. */
  head: V;
  tilt: number;
  /** Where on its picture the doll is held, if not by its spot on the floor (a body in mid-air is held by one foot). */
  hold?: V;
}

/** Stephanie, in every state the fight puts her in. She faces right. */
export const CHEER: Record<string, Doll> = {
  ready: {
    hips: [[-14, -112], [14, -112]], knees: [[-26, -58], [24, -60]], feet: [[-34, 0], [36, 0]],
    shoulders: [[-28, -186], [26, -186]], elbows: [[-46, -150], [44, -152]], hands: [[-22, -178], [54, -186]],
    head: [0, -228], tilt: 0,
  },
  fingers: {
    hips: [[-14, -112], [14, -112]], knees: [[-28, -58], [30, -60]], feet: [[-44, 0], [46, 0]],
    shoulders: [[-24, -186], [30, -184]], elbows: [[14, -184], [62, -176]], hands: [[58, -200], [106, -172]],
    head: [10, -226], tilt: 0.08,
  },
  kick: {
    hips: [[-14, -114], [14, -116]], knees: [[-18, -58], [70, -132]], feet: [[-22, 0], [126, -176]],
    shoulders: [[-30, -186], [22, -190]], elbows: [[-58, -198], [38, -210]], hands: [[-74, -234], [22, -248]],
    head: [-8, -230], tilt: -0.1,
  },
  flurry: {
    hips: [[-10, -106], [18, -106]], knees: [[-36, -56], [44, -62]], feet: [[-58, 0], [62, 0]],
    shoulders: [[-20, -180], [34, -180]], elbows: [[16, -168], [62, -192]], hands: [[68, -158], [108, -202]],
    head: [16, -222], tilt: 0.12,
  },
  plead: {
    hips: [[-14, -108], [14, -108]], knees: [[-10, -54], [12, -54]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-28, -180], [26, -180]], elbows: [[-36, -146], [36, -146]], hands: [[-4, -164], [10, -164]],
    head: [0, -222], tilt: 0.14,
  },
  fly: {
    hips: [[-14, -100], [14, -100]], knees: [[-56, -70], [58, -62]], feet: [[-92, -30], [98, -20]],
    shoulders: [[-28, -176], [28, -176]], elbows: [[-70, -200], [72, -196]], hands: [[-104, -232], [110, -224]],
    head: [0, -218], tilt: 0, hold: [98, -20],
  },
  ko: {
    hips: [[2, -16], [4, -30]], knees: [[52, -36], [50, -14]], feet: [[102, -10], [96, -42]],
    shoulders: [[-68, -20], [-64, -36]], elbows: [[-96, -8], [-70, -62]], hands: [[-126, -8], [-50, -88]],
    head: [-108, -30], tilt: -1.45,
  },
};

/** The other girl, before she powers up. She faces left. */
export const RIVAL: Record<string, Doll> = {
  walk: {
    hips: [[-18, -116], [18, -116]], knees: [[-42, -74], [20, -58]], feet: [[-58, -30], [24, 0]],
    shoulders: [[-36, -196], [36, -196]], elbows: [[-58, -154], [58, -154]], hands: [[-46, -114], [50, -114]],
    head: [0, -240], tilt: 0,
  },
  point: {
    hips: [[-18, -116], [18, -116]], knees: [[-24, -58], [24, -58]], feet: [[-30, 0], [30, 0]],
    shoulders: [[-36, -196], [36, -196]], elbows: [[-66, -178], [64, -152]], hands: [[-78, -228], [34, -124]],
    head: [-4, -240], tilt: -0.1,
  },
  flinch: {
    hips: [[-12, -116], [24, -116]], knees: [[-22, -58], [30, -58]], feet: [[-30, 0], [34, 0]],
    shoulders: [[-22, -196], [50, -194]], elbows: [[-36, -164], [78, -168]], hands: [[-28, -198], [92, -204]],
    head: [22, -236], tilt: 0.22,
  },
  charge: {
    hips: [[-18, -108], [18, -108]], knees: [[-48, -56], [48, -56]], feet: [[-58, 0], [58, 0]],
    shoulders: [[-40, -186], [40, -186]], elbows: [[-74, -150], [74, -150]], hands: [[-66, -106], [66, -106]],
    head: [0, -234], tilt: 0,
  },
};

/** And after. */
export const HULK: Record<string, Doll> = {
  hulk: {
    hips: [[-24, -130], [24, -130]], knees: [[-44, -66], [44, -66]], feet: [[-52, 0], [52, 0]],
    shoulders: [[-64, -228], [64, -228]], elbows: [[-100, -182], [100, -182]], hands: [[-72, -134], [72, -134]],
    head: [0, -280], tilt: 0,
  },
  flick: {
    hips: [[-28, -128], [20, -130]], knees: [[-52, -66], [40, -66]], feet: [[-66, 0], [48, 0]],
    shoulders: [[-70, -224], [58, -230]], elbows: [[-118, -216], [96, -184]], hands: [[-170, -208], [70, -136]],
    head: [-10, -278], tilt: -0.08,
  },
  win: {
    hips: [[-24, -130], [24, -130]], knees: [[-40, -66], [40, -66]], feet: [[-46, 0], [46, 0]],
    shoulders: [[-64, -228], [64, -228]], elbows: [[-72, -168], [72, -168]], hands: [[34, -188], [-34, -178]],
    head: [0, -282], tilt: 0.06,
  },
};

/** How a doll is dressed and built. */
export interface Look {
  skin: Paper;
  top: Paper;
  /** Legs that are trousers rather than bare (or shorts, to the knee), a skirt, and pom-poms in the hands. */
  legs?: Paper;
  shorts?: Paper;
  skirt?: Paper;
  poms?: boolean;
  /** How thick the arms and legs are. */
  arm: number;
  leg: number;
  /** A head drawn on (Stephanie's is a photo, hung on afterwards): the hair, and the mood. */
  head?: { hair: 'down' | 'up'; mouth: 'scowl' | 'yell' | 'smirk' };
}

const STEPH: Look = { skin: 'manila', top: 'red', skirt: 'red', poms: true, arm: 12, leg: 17 };
const BEFORE: Look = { skin: 'brown', top: 'grey', legs: 'black', arm: 17, leg: 24, head: { hair: 'down', mouth: 'scowl' } };
const AFTER: Look = { skin: 'brown', top: 'black', legs: 'black', arm: 34, leg: 36, head: { hair: 'up', mouth: 'smirk' } };

const DOLL_W = 380, DOLL_H = 350, DOLL_AX = 190, DOLL_AY = 336;
const mid = (a: V, b: V, k = 0.5): V => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const unit = (a: V, b: V): V => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / d, (b[1] - a[1]) / d];
};

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

/** Draw a doll: legs, then the body, then the arms over it. */
export function doll(c: Ctx, p: Doll, look: Look): void {
  const limb = (pts: V[], sheet: Paper, w: number) => glued(c, () => strokePaper(c, pts.flat(), sheet, w));
  for (const side of [1, 0]) {
    limb([p.hips[side], p.knees[side], p.feet[side]], look.legs ?? look.skin, look.leg);
    if (!look.legs) limb([mid(p.knees[side], p.feet[side], 0.7), p.feet[side]], 'white', look.leg + 3);
    if (look.shorts) limb([p.hips[side], mid(p.hips[side], p.knees[side], 0.7)], look.shorts, look.leg + 4);
    glued(c, () => { ellipse(c, p.feet[side][0], p.feet[side][1] - 2, look.leg * 0.85, look.leg * 0.5); fillPaper(c, 'white'); });
  }
  const [sl, sr] = p.shoulders, [hl, hr] = p.hips;
  const neck = mid(sl, sr), seat = mid(hl, hr);
  const down = unit(neck, seat), across = unit(hl, hr);
  const pad = look.arm * 0.4;
  glued(c, () => {
    poly(c, [sl[0] - across[0] * pad, sl[1] - across[1] * pad, sr[0] + across[0] * pad, sr[1] + across[1] * pad,
      hr[0] + across[0] * 8, hr[1] + across[1] * 8, seat[0] + down[0] * 14, seat[1] + down[1] * 14, hl[0] - across[0] * 8, hl[1] - across[1] * 8]);
    fillPaper(c, look.top);
  });
  if (look.skirt) {
    // a short pleated skirt, flaring away from the waist whichever way up she is
    const waist = mid(neck, seat, 0.72);
    glued(c, () => {
      poly(c, [waist[0] - across[0] * 20, waist[1] - across[1] * 20, waist[0] + across[0] * 20, waist[1] + across[1] * 20,
        seat[0] + across[0] * 40 + down[0] * 30, seat[1] + across[1] * 40 + down[1] * 30,
        seat[0] - across[0] * 40 + down[0] * 30, seat[1] - across[1] * 40 + down[1] * 30]);
      fillPaper(c, look.skirt!);
    });
    strokePaper(c, [seat[0] - across[0] * 36 + down[0] * 24, seat[1] - across[1] * 36 + down[1] * 24,
      seat[0] + across[0] * 36 + down[0] * 24, seat[1] + across[1] * 36 + down[1] * 24], 'white', 4);
    strokePaper(c, [mid(sl, sr, 0.2)[0], mid(sl, sr, 0.2)[1] + 10, mid(sl, sr, 0.8)[0], mid(sl, sr, 0.8)[1] + 10], 'white', 5);
  }
  const toHead = unit(neck, p.head);
  strokePaper(c, [neck[0], neck[1], p.head[0] - toHead[0] * 20, p.head[1] - toHead[1] * 20], look.skin, look.arm + 3);
  if (look.head) head(c, p, look);
  for (const side of [0, 1]) {
    limb([p.shoulders[side], p.elbows[side], p.hands[side]], look.skin, look.arm);
    const [hx, hy] = p.hands[side];
    if (look.poms) {
      glued(c, () => { burstPath(c, hx, hy, 19, 19, 11, 3 + side); fillPaper(c, 'white'); });
      burstPath(c, hx, hy, 12, 12, 9, 7 + side);
      fillPaper(c, 'red');
    } else {
      glued(c, () => { circle(c, hx, hy, look.arm * 0.72); fillPaper(c, look.skin); });
    }
  }
}

/** A head drawn on a doll: hair behind, face in front, turned with the pose. */
function head(c: Ctx, p: Doll, look: Look): void {
  const face = look.head!;
  c.save();
  c.translate(p.head[0], p.head[1]);
  c.rotate(p.tilt);
  const r = look.arm > 20 ? 27 : 25;
  glued(c, () => {
    if (face.hair === 'down') {
      // long, and worn over one shoulder
      ellipse(c, 2, -4, r + 9, r + 10);
      fillPaper(c, 'black');
      ellipse(c, r - 2, r + 6, 15, 30);
      fillPaper(c, 'black');
    } else {
      // tied up on top
      circle(c, 0, -r - 6, 17);
      fillPaper(c, 'black');
      ellipse(c, 0, -5, r + 3, r + 2);
      fillPaper(c, 'black');
    }
  });
  glued(c, () => { ellipse(c, 0, 2, r - 3, r); fillPaper(c, look.skin); });
  const dark = '#241a14';
  const stroke = (draw: () => void, w = 2.6) => { c.beginPath(); draw(); c.strokeStyle = dark; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); };
  for (const s of [-1, 1]) {
    circle(c, s * 9, -2, 3);
    c.fillStyle = dark;
    c.fill();
    // brows drawn down in the middle: she is not pleased
    stroke(() => { c.moveTo(s * 15, -11); c.lineTo(s * 4, -7); }, 3);
  }
  if (face.mouth === 'yell') {
    ellipse(c, 0, 13, 8, 9);
    c.fillStyle = dark;
    c.fill();
  } else if (face.mouth === 'smirk') {
    stroke(() => { c.moveTo(-8, 13); c.quadraticCurveTo(2, 17, 9, 10); });
  } else {
    stroke(() => { c.moveTo(-8, 15); c.quadraticCurveTo(0, 10, 8, 15); });
  }
  c.restore();
}

function dolls(scene: Phaser.Scene, prefix: string, poses: Record<string, Doll>, look: Look, more: Partial<Look> = {}): void {
  for (const [name, p] of Object.entries(poses)) {
    const [hx, hy] = p.hold ?? [0, 0];
    makePaperArt(scene, `${prefix}_${name}`, DOLL_W, DOLL_H, (c) => {
      c.translate(DOLL_AX, DOLL_AY);
      doll(c, p, name === 'charge' ? { ...look, ...more } : look);
    }, { border: 2.5, ax: DOLL_AX + hx, ay: DOLL_AY + hy });
  }
}

export function buildFightArt(scene: Phaser.Scene): void {
  dolls(scene, 'cheer', CHEER, STEPH);
  dolls(scene, 'rival', RIVAL, BEFORE, { head: { hair: 'down', mouth: 'yell' } });
  dolls(scene, 'rival', HULK, AFTER);

  // the gym: painted block wall, a floor of boards, bleachers, a hoop, and somebody's bake sale
  makePaperArt(scene, 'gym_wall', 96, 64, (c) => {
    rect(c, 0, 0, 96, 64, 'cream');
    c.strokeStyle = 'rgba(90, 70, 40, 0.16)';
    c.lineWidth = 1.5;
    for (const y of [0, 32]) { c.beginPath(); c.moveTo(0, y + 0.75); c.lineTo(96, y + 0.75); c.stroke(); }
    for (const [x, y] of [[24, 0], [72, 0], [0, 32], [48, 32]]) { c.beginPath(); c.moveTo(x + 0.75, y); c.lineTo(x + 0.75, y + 32); c.stroke(); }
  }, { border: 0, ax: 0, ay: 0 });
  makePaperArt(scene, 'gym_floor', 128, 64, (c) => {
    rect(c, 0, 0, 128, 64, 'manila');
    c.fillStyle = 'rgba(190, 120, 40, 0.28)';
    c.fillRect(0, 0, 128, 64);
    c.strokeStyle = 'rgba(90, 50, 10, 0.28)';
    c.lineWidth = 1.5;
    for (let y = 0; y < 64; y += 16) {
      c.beginPath(); c.moveTo(0, y + 0.75); c.lineTo(128, y + 0.75); c.stroke();
      const x = (y * 5 + 20) % 128;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke();
    }
  }, { border: 0, ax: 0, ay: 0 });
  makePaperArt(scene, 'bleachers', 360, 150, (c) => {
    for (let row = 0; row < 5; row++) {
      const y = 120 - row * 26, inset = row * 10;
      glued(c, () => rect(c, inset, y, 360 - inset * 2, 22, 'brown'));
      c.fillStyle = 'rgba(0, 0, 0, 0.22)';
      c.fillRect(inset, y + 16, 360 - inset * 2, 6);
    }
  }, { border: 2.2, ax: 180, ay: 146 });
  makePaperArt(scene, 'plank', 64, 12, (c) => rect(c, 0, 0, 64, 12, 'brown'), { border: 1.5 });
  makePaperArt(scene, 'hoop', 110, 340, (c) => {
    // on a post, standing on the floor
    glued(c, () => rect(c, 50, 60, 10, 280, 'black'));
    glued(c, () => { rr(c, 6, 4, 98, 66, 5); fillPaper(c, 'white'); });
    c.strokeStyle = paper(c, 'red');
    c.lineWidth = 4;
    c.strokeRect(36, 30, 38, 28);
    glued(c, () => strokePaper(c, [34, 70, 76, 70], 'red', 6));
    c.strokeStyle = 'rgba(40, 40, 40, 0.5)';
    c.lineWidth = 1.6;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(36 + i * 8, 72); c.lineTo(42 + i * 5, 108); c.stroke(); }
  }, { border: 2, ax: 55, ay: 338 });
  makePaperArt(scene, 'bake_table', 210, 120, (c) => {
    for (const x of [28, 176]) rect(c, x, 60, 8, 58, 'brown');
    glued(c, () => { rr(c, 6, 44, 198, 44, 4); fillPaper(c, 'white'); });
    c.fillStyle = 'rgba(200, 60, 60, 0.25)';
    for (let x = 6; x < 204; x += 22) c.fillRect(x, 44, 11, 44);
    glued(c, () => { rr(c, 46, 54, 118, 26, 3); fillPaper(c, 'yellow'); });
    cutText(c, 'BAKE SALE', 105, 68, 17, 'red');
    for (const x of [22, 52, 82, 128, 158, 188]) cupcake(c, x, 44);
  }, { border: 2.2, ax: 105, ay: 116 });
  makePaperArt(scene, 'cupcake', 26, 28, (c) => cupcake(c, 13, 26), { border: 1.5 });
  makePaperArt(scene, 'gym_banner', 250, 70, (c) => {
    poly(c, [0, 4, 250, 0, 244, 62, 6, 66]);
    fillPaper(c, 'blue');
    cutText(c, 'GO TEAM!', 125, 35, 34, 'yellow');
  }, { border: 2.2 });

  // what she turns into is announced by all this
  makeArt(scene, 'aura', 300, 380, (c) => {
    burstPath(c, 150, 200, 146, 178, 17, 5);
    c.fillStyle = 'rgba(255, 196, 40, 0.5)';
    c.fill();
    burstPath(c, 150, 214, 108, 148, 15, 9);
    c.fillStyle = 'rgba(255, 240, 150, 0.55)';
    c.fill();
    burstPath(c, 150, 230, 70, 112, 13, 13);
    c.fillStyle = 'rgba(255, 255, 240, 0.5)';
    c.fill();
  }, { border: 0, ax: 150, ay: 372 });
  // where she lands, the floor remembers
  makeArt(scene, 'crack', 130, 44, (c) => {
    c.strokeStyle = 'rgba(40, 26, 14, 0.75)';
    c.lineCap = 'round';
    for (const [x, y, w] of [[8, 30, 3], [34, 6, 2.4], [70, 40, 2], [98, 8, 2.6], [124, 28, 3], [52, 42, 2], [18, 10, 2]]) {
      c.lineWidth = w;
      c.beginPath();
      c.moveTo(65, 22);
      c.lineTo((65 + x) / 2 + 5, (22 + y) / 2 - 4);
      c.lineTo(x, y);
      c.stroke();
    }
  }, { border: 0, ax: 65, ay: 22 });
  makePaperArt(scene, 'rock', 30, 24, (c) => { poly(c, [3, 16, 9, 3, 21, 1, 28, 11, 22, 22, 8, 23]); fillPaper(c, 'grey'); }, { border: 1.5 });
  makePaperArt(scene, 'shred_cloth', 20, 14, (c) => { poly(c, [0, 3, 12, 0, 20, 8, 9, 14]); fillPaper(c, 'grey'); }, { border: 1.2 });
  makePaperArt(scene, 'shred_red', 18, 6, (c) => rect(c, 0, 0, 18, 6, 'red'), { border: 1 });
  makePaperArt(scene, 'shred_white', 18, 6, (c) => rect(c, 0, 0, 18, 6, 'white'), { border: 1 });

  // the buttons: what she can do about it, and later what she can try instead
  for (const [key, sheet] of [['fight_btn', 'yellow'], ['fight_btn_sad', 'cream']] as const) {
    makePaperArt(scene, key, 260, 58, (c) => { rr(c, 0, 0, 260, 58, 12); fillPaper(c, sheet); }, { border: 2.5 });
  }
  makeWord(scene, 'word_round', 'ROUND 1', 'blue', 'white', 300, 70, 51);
  makeWord(scene, 'word_fight', 'FIGHT!', 'red', 'yellow', 360, 104, 52);
  makeWord(scene, 'word_noeffect', 'NO EFFECT', 'grey', 'white', 136, 24, 53);
  makeWord(scene, 'word_zero', '0', 'grey', 'white', 76, 40, 54);
  makeWord(scene, 'word_tickles', 'IT TICKLES', 'grey', 'yellow', 136, 23, 55);
  makeWord(scene, 'word_ow', 'OW!', 'blue', 'white', 86, 34, 56);
  makeWord(scene, 'word_ko', 'K.O.', 'red', 'yellow', 380, 120, 57);
  makeWord(scene, 'word_shove', 'SHOVE!', 'red', 'white', 150, 36, 59);

  // The screen stops for her best move: a slash of paper across it, the letters leaning into it.
  makePaperArt(scene, 'word_super', 600, 124, (c) => {
    glued(c, () => { poly(c, [30, 10, 596, 2, 570, 112, 4, 122]); fillPaper(c, 'black'); });
    glued(c, () => { poly(c, [44, 22, 578, 14, 558, 100, 24, 110]); fillPaper(c, 'red'); });
    c.translate(300, 62);
    c.rotate(-0.015);
    c.transform(1, 0, -0.2, 1, 0, 0);
    cutText(c, 'SUPER MOVE', 0, 4, 84, 'yellow');
  }, { border: 3 });
  // ...the lines everything streams along while it does: thin wedges out from a middle that is left empty
  makeArt(scene, 'speed_lines', 700, 700, (c) => {
    let seed = 4711;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      const a = (i / 46) * Math.PI * 2 + (rnd() - 0.5) * 0.09, wide = 0.012 + rnd() * 0.03, from = 78 + rnd() * 90;
      c.beginPath();
      c.moveTo(350 + Math.cos(a) * from, 350 + Math.sin(a) * from);
      c.lineTo(350 + Math.cos(a - wide) * 350, 350 + Math.sin(a - wide) * 350);
      c.lineTo(350 + Math.cos(a + wide) * 350, 350 + Math.sin(a + wide) * 350);
      c.closePath();
      c.fillStyle = i % 3 ? 'rgba(255, 244, 200, 0.85)' : 'rgba(255, 196, 40, 0.85)';
      c.fill();
    }
  }, { border: 0 });

  // The last word on it, as an arcade machine would have it: gold for the winner, and then red,
  // running, for what she did.
  makePaperArt(scene, 'word_flawless', 560, 92, (c) => {
    c.translate(280, 46);
    cutText(c, 'FLAWLESS VICTORY', 0, 4, 76, 'yellow');
  }, { border: 3, keyline: 2 });
  makePaperArt(scene, 'word_fatality', 520, 190, (c) => {
    const letters = 'FATALITY', size = 124, y = 70;
    c.font = `${size}px ${DISPLAY}`;
    const wide = c.measureText(letters).width;
    // it runs: from the foot of each letter, a drop or two, some longer than others
    let seed = 90210, x = 260 - wide / 2;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    glued(c, () => {
      c.fillStyle = paper(c, 'red');
      for (const ch of letters) {
        const w = c.measureText(ch).width;
        for (let n = 0; n < 2; n++) {
          const dx = x + w * (0.2 + rnd() * 0.6), long = 14 + rnd() * 54, thick = 5 + rnd() * 4;
          if (rnd() < 0.25) continue;
          rr(c, dx - thick / 2, y + size * 0.3, thick, long, thick / 2);
          c.fill();
          circle(c, dx, y + size * 0.3 + long, thick * 0.75);
          c.fill();
        }
        x += w;
      }
    });
    cutText(c, letters, 260, y, size, 'red');
  }, { border: 3, keyline: 2 });

  // the mark on the tape for a game that was never going to be won
  makePaperArt(scene, 'mini_mark_ko', 26, 26, (c) => {
    circle(c, 13, 13, 11);
    fillPaper(c, 'red');
    star(c, 13, 13.5, 8, 3.4, 5);
    fillPaper(c, 'yellow');
  }, { border: 2 });
}

function cupcake(c: Ctx, x: number, bottom: number): void {
  poly(c, [x - 7, bottom - 10, x + 7, bottom - 10, x + 5, bottom, x - 5, bottom]);
  fillPaper(c, 'brown');
  circle(c, x, bottom - 13, 8);
  fillPaper(c, 'white');
  circle(c, x, bottom - 21, 3);
  fillPaper(c, 'red');
}
