import Phaser from 'phaser';
import { Doll, Look, doll } from '../../art/fight';
import { Paper, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from '../../art/sticker';

/** The paper stand-ins for this game: what is on the page until there is a photo
 *  (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "ownbasket_" (a word on a burst: "word_ownbasket_..."). The game
 *  cannot make a picture by any other name, or draw over one that is not its own. */

type V = [number, number];

/** A basket seen from the side, as it stands at the left end of the court (the other end
 *  is the same picture turned round): how big the picture is, where its foot is in it, and
 *  where the middle of the rim is from that foot. */
export const HOOP = { w: 150, h: 340, foot: [22, 336] as V, rim: [84, -250] as V };
/** How wide the rim is, and how far the ball is across. */
export const RIM_W = 44;
export const BALL = 30;

/** The two of them are paper dolls with the proportions of a girl of twelve: this is how
 *  far it is from the middle of a doll's head to its chin, which is where a head is hung. */
export const HEAD_R = 20;

/** Stephanie, in every pose the game puts her in. She faces right: the way she is
 *  supposed to be going. */
export const STEPH: Record<string, Doll> = {
  stand: {
    hips: [[-9, -66], [9, -66]], knees: [[-12, -34], [12, -34]], feet: [[-14, 0], [14, 0]],
    shoulders: [[-17, -112], [17, -112]], elbows: [[-25, -90], [27, -90]], hands: [[-21, -70], [31, -72]],
    head: [0, -138], tilt: 0,
  },
  // one hand down on the ball
  dribble: {
    hips: [[-8, -64], [10, -64]], knees: [[-14, -34], [16, -36]], feet: [[-18, 0], [20, 0]],
    shoulders: [[-14, -110], [20, -108]], elbows: [[-27, -92], [35, -90]], hands: [[-21, -74], [31, -66]],
    head: [6, -136], tilt: 0.06,
  },
  run1: {
    hips: [[-8, -66], [10, -66]], knees: [[-22, -40], [24, -44]], feet: [[-38, -14], [22, 0]],
    shoulders: [[-12, -112], [22, -110]], elbows: [[-29, -98], [37, -92]], hands: [[-35, -78], [31, -68]],
    head: [10, -138], tilt: 0.1,
  },
  run2: {
    hips: [[-8, -66], [10, -66]], knees: [[-2, -36], [24, -40]], feet: [[-12, 0], [42, -12]],
    shoulders: [[-12, -112], [22, -110]], elbows: [[-25, -92], [37, -94]], hands: [[-13, -76], [31, -70]],
    head: [10, -138], tilt: 0.1,
  },
  // knees bent, the ball in both hands, filling up
  aim: {
    hips: [[-9, -56], [9, -56]], knees: [[-19, -32], [19, -32]], feet: [[-16, 0], [16, 0]],
    shoulders: [[-17, -100], [17, -100]], elbows: [[-27, -72], [29, -72]], hands: [[2, -76], [18, -76]],
    head: [0, -126], tilt: -0.05,
  },
  // the jump shot: both arms up
  shoot: {
    hips: [[-9, -66], [9, -66]], knees: [[-10, -32], [12, -36]], feet: [[-10, 4], [14, 2]],
    shoulders: [[-17, -112], [17, -112]], elbows: [[-44, -126], [44, -128]], hands: [[-30, -172], [30, -174]],
    head: [0, -138], tilt: -0.12,
  },
  // on defence: low, arms wide
  guard: {
    hips: [[-10, -58], [10, -58]], knees: [[-24, -32], [24, -32]], feet: [[-30, 0], [30, 0]],
    shoulders: [[-17, -104], [17, -104]], elbows: [[-42, -98], [42, -98]], hands: [[-58, -112], [60, -108]],
    head: [0, -130], tilt: 0,
  },
  // a lunge for the ball
  steal: {
    hips: [[-10, -58], [8, -60]], knees: [[-26, -34], [26, -32]], feet: [[-40, 0], [36, 0]],
    shoulders: [[-6, -102], [26, -98]], elbows: [[-24, -86], [50, -94]], hands: [[-30, -66], [78, -92]],
    head: [22, -124], tilt: 0.25,
  },
  // she scored
  cheer: {
    hips: [[-9, -66], [9, -66]], knees: [[-14, -34], [14, -34]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-17, -112], [17, -112]], elbows: [[-46, -130], [46, -130]], hands: [[-56, -166], [56, -166]],
    head: [0, -138], tilt: 0,
  },
};

/** The other girl. Her poses are written down facing right, like Stephanie's, and drawn
 *  turned round: she is going the other way. */
export const HER: Record<string, Doll> = {
  stand: STEPH.stand,
  dribble: STEPH.dribble,
  run1: STEPH.run1,
  run2: STEPH.run2,
  shoot: STEPH.shoot,
  guard: STEPH.guard,
  steal: STEPH.steal,
  cheer: STEPH.cheer,
  // both hands out, palms up: what was THAT
  shrug: {
    hips: [[-9, -66], [9, -66]], knees: [[-12, -34], [12, -34]], feet: [[-16, 0], [16, 0]],
    shoulders: [[-17, -112], [17, -112]], elbows: [[-32, -92], [32, -92]], hands: [[-50, -106], [50, -106]],
    head: [0, -138], tilt: 0.14,
  },
};

/** The faces the other girl pulls. (Stephanie's are her own: docs/characters.md.) */
export const MOODS = ['plain', 'set', 'what', 'laugh'] as const;
export type Mood = (typeof MOODS)[number];

/** The home team is in red, as Stephanie's school always is; the visitors in green. */
const HOME: Look = { skin: 'manila', top: 'red', shorts: 'red', arm: 9, leg: 12 };
const AWAY: Look = { skin: 'manila', top: 'green', shorts: 'green', arm: 9, leg: 12 };

const DOLL_W = 200, DOLL_H = 244, DOLL_AX = 100, DOLL_AY = 232;

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

/** A sheet of dolls, one for each pose. `turned` draws them facing left (her number stays the right way round). */
function dolls(scene: Phaser.Scene, prefix: string, poses: Record<string, Doll>, look: Look, number: string, turned = false): void {
  for (const [name, p] of Object.entries(poses)) {
    makePaperArt(scene, `${prefix}_${name}`, DOLL_W, DOLL_H, (c) => {
      c.translate(DOLL_AX, DOLL_AY);
      c.save();
      if (turned) c.scale(-1, 1);
      doll(c, p, look);
      c.restore();
      // her number, on her shirt
      const x = (p.shoulders[0][0] + p.shoulders[1][0] + p.hips[0][0] + p.hips[1][0]) / 4;
      const y = ((p.shoulders[0][1] + p.shoulders[1][1]) / 2) * 0.62 + ((p.hips[0][1] + p.hips[1][1]) / 2) * 0.38;
      cutText(c, number, turned ? -x : x, y, 17, 'white');
    }, { border: 2.2, ax: DOLL_AX, ay: DOLL_AY });
  }
}

/** The other girl's head: brown hair in a ponytail, and whatever she thinks of all this.
 *  Hung by the chin, like a photo of a head. */
function herHead(c: Ctx, mood: Mood): void {
  const r = 19, dark = '#241a14';
  const stroke = (draw: () => void, w = 2.4) => { c.beginPath(); draw(); c.strokeStyle = dark; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); };
  glued(c, () => {
    // the ponytail, out behind her (she faces left)
    ellipse(c, r + 9, -2, 9, 17, -0.5);
    fillPaper(c, 'brown');
    ellipse(c, 0, -3, r + 3, r + 3);
    fillPaper(c, 'brown');
  });
  glued(c, () => { ellipse(c, 1, 2, r - 3, r - 1); fillPaper(c, 'manila'); });
  // a fringe
  c.beginPath();
  c.ellipse(1, -9, r - 2, 9, 0, Math.PI, 0);
  fillPaper(c, 'brown');
  for (const s of [-1, 1]) {
    const ex = 1 + s * 7, ey = 1;
    if (mood === 'laugh') stroke(() => { c.moveTo(ex - 3.5, ey + 1); c.quadraticCurveTo(ex, ey - 4, ex + 3.5, ey + 1); });
    else { circle(c, ex, ey, mood === 'what' ? 3 : 2.5); c.fillStyle = dark; c.fill(); }
    if (mood === 'set') stroke(() => { c.moveTo(ex + s * 5, ey - 8); c.lineTo(ex - s * 4, ey - 5); }, 2.6);
    if (mood === 'what') stroke(() => { c.moveTo(ex - 4, ey - (s > 0 ? 10 : 7)); c.lineTo(ex + 4, ey - (s > 0 ? 9 : 7)); }, 2.2);
  }
  if (mood === 'laugh') {
    c.beginPath();
    c.ellipse(1, 9, 8, 6.5, 0, 0, Math.PI);
    c.closePath();
    c.fillStyle = dark;
    c.fill();
  } else if (mood === 'what') {
    ellipse(c, 2, 11, 3.2, 4);
    c.fillStyle = dark;
    c.fill();
  } else if (mood === 'set') {
    stroke(() => { c.moveTo(-5, 11); c.lineTo(7, 11); });
  } else {
    stroke(() => { c.moveTo(-6, 9); c.quadraticCurveTo(1, 14, 8, 9); });
  }
}

/** A plate to press: paper, with something cut out of paper on it. */
function plate(scene: Phaser.Scene, key: string, w: number, sheet: Paper, draw: (c: Ctx) => void): void {
  makePaperArt(scene, key, w, 76, (c) => {
    rr(c, 0, 0, w, 76, 14);
    fillPaper(c, sheet);
    draw(c);
  }, { border: 2.5 });
}

export function buildArt(scene: Phaser.Scene): void {
  dolls(scene, 'ownbasket_steph', STEPH, HOME, '12');
  dolls(scene, 'ownbasket_her', HER, AWAY, '7', true);
  for (const mood of MOODS) {
    makePaperArt(scene, `ownbasket_herhead_${mood}`, 76, 60, (c) => {
      c.translate(30, 28);
      herHead(c, mood);
    }, { border: 2, ax: 31, ay: 28 + HEAD_R });
  }

  // the ball
  makePaperArt(scene, 'ownbasket_ball', BALL, BALL, (c) => {
    const r = BALL / 2;
    circle(c, r, r, r - 0.5);
    c.fillStyle = '#d9702b';
    c.fill();
    c.save();
    circle(c, r, r, r - 0.5);
    c.clip();
    c.strokeStyle = '#3a2416';
    c.lineWidth = 1.7;
    c.beginPath(); c.moveTo(r, 0); c.lineTo(r, BALL); c.stroke();
    c.beginPath(); c.moveTo(0, r); c.lineTo(BALL, r); c.stroke();
    c.beginPath(); c.arc(-r * 0.45, r, r * 1.05, -1, 1); c.stroke();
    c.beginPath(); c.arc(BALL + r * 0.45, r, r * 1.05, Math.PI - 1, Math.PI + 1); c.stroke();
    c.restore();
  }, { border: 1.6 });

  // A basket from the side: a post on a heavy foot, an arm out over the court, the board
  // edge on, and the far half of the rim. (The near half, and the net, are a piece of their
  // own, so that the ball can go down between them.)
  const [fx] = HOOP.foot, rimX = fx + HOOP.rim[0], rimY = HOOP.foot[1] + HOOP.rim[1];
  makePaperArt(scene, 'ownbasket_hoop', HOOP.w, HOOP.h, (c) => {
    glued(c, () => { rr(c, 2, HOOP.h - 18, 62, 16, 5); fillPaper(c, 'black'); });
    glued(c, () => rect(c, fx - 6, 74, 12, HOOP.h - 90, 'grey'));
    glued(c, () => strokePaper(c, [fx, 82, 74, 46], 'grey', 9));
    glued(c, () => strokePaper(c, [fx, 124, 72, 92], 'grey', 6));
    glued(c, () => { poly(c, [70, 12, 84, 4, 84, 112, 70, 120]); fillPaper(c, 'white'); });
    c.strokeStyle = paper(c, 'red');
    c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(81, 9); c.lineTo(81, 110); c.stroke();
    glued(c, () => strokePaper(c, [82, rimY, rimX - RIM_W / 2 + 2, rimY], 'red', 5));
    c.beginPath();
    c.ellipse(rimX, rimY, RIM_W / 2, 5, 0, Math.PI, 0);
    c.strokeStyle = paper(c, 'red');
    c.lineWidth = 3.4;
    c.stroke();
  }, { border: 2, ax: HOOP.foot[0], ay: HOOP.foot[1] });
  makePaperArt(scene, 'ownbasket_net', RIM_W + 8, 50, (c) => {
    const m = (RIM_W + 8) / 2, top = 7;
    c.strokeStyle = 'rgba(250, 248, 240, 0.96)';
    c.lineWidth = 1.7;
    c.lineCap = 'round';
    for (let i = 0; i <= 6; i++) {
      const x0 = m - RIM_W / 2 + (RIM_W * i) / 6, x1 = m - 13 + (26 * i) / 6;
      c.beginPath(); c.moveTo(x0, top); c.lineTo(x1, 46); c.stroke();
    }
    for (const [k, y] of [[0.33, top + 13], [0.66, top + 26], [1, 46]] as V[]) {
      const half = RIM_W / 2 - (RIM_W / 2 - 13) * k;
      c.beginPath(); c.moveTo(m - half, y); c.lineTo(m + half, y); c.stroke();
    }
    c.beginPath();
    c.ellipse(m, top, RIM_W / 2, 5, 0, 0, Math.PI);
    c.strokeStyle = paper(c, 'red');
    c.lineWidth = 3.6;
    c.stroke();
  }, { border: 0, ax: (RIM_W + 8) / 2, ay: 7 });

  // whose basket is whose, on a pennant over each
  const pennant = (key: string, text: string, sheet: Paper) => makePaperArt(scene, key, 132, 40, (c) => {
    poly(c, [0, 0, 132, 3, 118, 20, 132, 37, 0, 40]);
    fillPaper(c, sheet);
    cutText(c, text, 58, 21, 23, 'white');
  }, { border: 2 });
  pennant('ownbasket_home', 'HOME', 'red');
  pennant('ownbasket_away', 'VISITORS', 'green');

  // the scoreboard: the numbers are put on it by the game
  makePaperArt(scene, 'ownbasket_board', 320, 78, (c) => {
    rr(c, 0, 0, 320, 78, 9);
    fillPaper(c, 'black');
    c.strokeStyle = paper(c, 'grey');
    c.lineWidth = 3;
    rr(c, 5, 5, 310, 68, 6);
    c.stroke();
    cutText(c, 'HOME', 58, 19, 17, 'red');
    cutText(c, 'VISITORS', 262, 19, 17, 'green');
    for (const x of [22, 126, 226]) { rr(c, x, 31, 72, 38, 5); c.fillStyle = '#0e0c10'; c.fill(); }
  }, { border: 2.4 });

  // what there is to press
  const arrow = (c: Ctx, way: number) => {
    c.translate(42, 38);
    c.scale(way, 1);
    glued(c, () => { poly(c, [-22, 0, 4, -24, 4, -10, 22, -10, 22, 10, 4, 10, 4, 24]); fillPaper(c, 'red'); });
  };
  plate(scene, 'ownbasket_btn_back', 84, 'cream', (c) => arrow(c, 1));
  plate(scene, 'ownbasket_btn_fwd', 84, 'cream', (c) => arrow(c, -1));
  plate(scene, 'ownbasket_btn_shoot', 168, 'red', (c) => cutText(c, 'SHOOT', 84, 40, 40, 'white'));
  plate(scene, 'ownbasket_btn_steal', 168, 'blue', (c) => cutText(c, 'STEAL', 84, 40, 40, 'yellow'));

  // the slip of paper the final score is read out from
  makePaperArt(scene, 'ownbasket_slip', 430, 112, (c) => {
    poly(c, [0, 4, 430, 0, 426, 108, 4, 112]);
    fillPaper(c, 'cream');
  }, { border: 2.4 });

  // what goes over the head of somebody who cannot believe what she has just seen
  makeArt(scene, 'ownbasket_qmark', 30, 40, (c) => {
    cutText(c, '?', 15, 21, 40, 'yellow');
  }, { border: 1.6 });

  makeWord(scene, 'word_ownbasket_swish', 'SWISH!', 'yellow', 'red', 170, 42, 61);
  makeWord(scene, 'word_ownbasket_clank', 'CLANK!', 'grey', 'white', 128, 30, 62);
  makeWord(scene, 'word_ownbasket_boing', 'BOING!', 'blue', 'white', 128, 30, 63);
  makeWord(scene, 'word_ownbasket_rebound', 'REBOUND!', 'green', 'white', 164, 32, 64);
  makeWord(scene, 'word_ownbasket_steal', 'STEAL!', 'green', 'yellow', 128, 32, 65);
  makeWord(scene, 'word_ownbasket_stolen', 'STOLEN!', 'grey', 'yellow', 136, 30, 66);
  makeWord(scene, 'word_ownbasket_wrong', 'WRONG BASKET!', 'red', 'yellow', 236, 35, 67);
  makeWord(scene, 'word_ownbasket_buzzer', 'BZZZT!', 'red', 'white', 150, 36, 68);
}
