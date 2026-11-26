import Phaser from 'phaser';
import { Paper, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from '../../art/sticker';

/** The paper stand-ins for Le Papillon: the restaurant itself, its table and its
 *  waiter, and everybody's seat at it, which the other games set there use as
 *  well (src/minis/shared/papillon.ts lays them); and then what is only this
 *  game's, the ordering. Each is on the page until there is a photo (a photo
 *  registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "papillon_" (a word on a burst: "word_papillon_..."). */

const DARK = '#241a14';

/** Lay a wash of colour over whatever was just filled: the same path again. */
function wash(c: Ctx, colour: string): void {
  c.fillStyle = colour;
  c.fill();
}

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper, over?: string): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
  if (over) wash(c, over);
}

/** A butterfly, its middle at (x, y), `s` across; flat colour if no paper is given. */
export function butterfly(c: Ctx, x: number, y: number, s: number, wings: Paper | string, spots?: Paper | string): void {
  const fill = (what: Paper | string) => {
    if (what.startsWith('#') || what.startsWith('rgb')) wash(c, what);
    else fillPaper(c, what as Paper);
  };
  c.save();
  c.translate(x, y);
  c.scale(s / 100, s / 100);
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(side * 3, -6);
    c.bezierCurveTo(side * 18, -52, side * 62, -46, side * 50, -8);
    c.bezierCurveTo(side * 46, 2, side * 20, 2, side * 3, 0);
    c.closePath();
    fill(wings);
    c.beginPath();
    c.moveTo(side * 3, 0);
    c.bezierCurveTo(side * 30, 2, side * 44, 22, side * 30, 34);
    c.bezierCurveTo(side * 18, 42, side * 8, 20, side * 3, 6);
    c.closePath();
    fill(wings);
    if (spots) {
      circle(c, side * 36, -22, 8);
      fill(spots);
      circle(c, side * 26, 20, 5);
      fill(spots);
    }
  }
  ellipse(c, 0, 0, 3.5, 17);
  wash(c, DARK);
  c.strokeStyle = DARK;
  c.lineWidth = 1.6;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(0, -15);
    c.quadraticCurveTo(side * 6, -30, side * 13, -31);
    c.stroke();
  }
  c.restore();
}

/** How somebody sitting at the table is dressed. */
interface Dress {
  /** What is over the shoulders: a jacket, a shirt, a dress. */
  top: Paper;
  topWash?: string;
  /** A shirt front, and a tie or a bow tie down it; or, with neither, a dress with a neckline. */
  shirt?: Paper;
  tie?: Paper;
  bow?: Paper;
  necklace?: boolean;
}

const DRESS: Record<string, Dress> = {
  bill: { top: 'black', shirt: 'white', tie: 'red' },
  stephanie: { top: 'blue', necklace: true },
  christian: { top: 'green', topWash: 'rgba(10, 40, 20, 0.35)', shirt: 'cream', bow: 'black' },
  branson: { top: 'brown', shirt: 'white', tie: 'yellow' },
  shane: { top: 'grey', shirt: 'white', tie: 'red' },
  chad: { top: 'blue', topWash: 'rgba(10, 20, 60, 0.4)', shirt: 'sky', tie: 'white' },
};

/** Where things are in a picture of somebody sitting: it is held by the chin. */
export const SIT = { w: 190, h: 210, ax: 95, ay: 8 };

/** Somebody at the table, from the neck down to where the cloth hides them. */
function seated(c: Ctx, d: Dress): void {
  const x = SIT.ax;
  // the neck
  glued(c, () => strokePaper(c, [x, 2, x, 40], 'manila', 30));
  // shoulders, and all the way down
  glued(c, () => {
    c.beginPath();
    c.moveTo(x - 24, 34);
    c.quadraticCurveTo(x - 72, 40, x - 78, 84);
    c.lineTo(x - 86, 210);
    c.lineTo(x + 86, 210);
    c.lineTo(x + 78, 84);
    c.quadraticCurveTo(x + 72, 40, x + 24, 34);
    c.closePath();
    fillPaper(c, d.top);
    if (d.topWash) wash(c, d.topWash);
  });
  // where the arms hang
  c.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  c.lineWidth = 2;
  for (const side of [-1, 1]) {
    c.beginPath();
    c.moveTo(x + side * 56, 96);
    c.quadraticCurveTo(x + side * 60, 150, x + side * 58, 210);
    c.stroke();
  }
  if (d.shirt) {
    glued(c, () => { poly(c, [x - 22, 32, x + 22, 32, x + 5, 126, x - 5, 126]); fillPaper(c, d.shirt!); });
    // lapels
    for (const side of [-1, 1]) {
      glued(c, () => {
        poly(c, [x + side * 22, 32, x + side * 40, 44, x + side * 26, 92, x + side * 4, 128]);
        fillPaper(c, d.top);
        if (d.topWash) wash(c, d.topWash);
        wash(c, 'rgba(255, 255, 255, 0.07)');
      });
    }
    if (d.tie) {
      glued(c, () => { poly(c, [x - 6, 42, x + 6, 42, x + 8, 100, x, 116, x - 8, 100]); fillPaper(c, d.tie!); });
      glued(c, () => { poly(c, [x - 8, 36, x + 8, 36, x + 5, 48, x - 5, 48]); fillPaper(c, d.tie!); });
    }
    if (d.bow) {
      for (const side of [-1, 1]) glued(c, () => { poly(c, [x, 42, x + side * 17, 33, x + side * 17, 52]); fillPaper(c, d.bow!); });
      circle(c, x, 42, 4.5);
      fillPaper(c, d.bow);
    }
  } else {
    // a dress: bare to the collarbone, and something round her neck
    glued(c, () => {
      c.beginPath();
      c.moveTo(x - 34, 36);
      c.quadraticCurveTo(x, 96, x + 34, 36);
      c.closePath();
      fillPaper(c, 'manila');
    });
    if (d.necklace) {
      for (let i = 0; i <= 8; i++) {
        const k = i / 8, px = x - 22 + k * 44, py = 42 + Math.sin(k * Math.PI) * 26;
        circle(c, px, py, 3.3);
        fillPaper(c, 'white');
      }
    }
  }
}

/** The waiter's head: his nose in the air, his eyes shut, and a moustache with a curl at each end. */
function waiterHead(c: Ctx, x: number, y: number): void {
  c.save();
  c.translate(x, y);
  c.rotate(-0.06);
  glued(c, () => { ellipse(c, 0, 0, 25, 30); fillPaper(c, 'manila'); });
  // hair, combed flat
  c.save();
  ellipse(c, 0, 0, 25, 30);
  c.clip();
  c.beginPath();
  c.rect(-30, -34, 60, 18);
  fillPaper(c, 'black');
  c.beginPath();
  c.moveTo(-30, -16);
  c.quadraticCurveTo(-10, -22, 30, -8);
  c.lineTo(30, -34);
  c.lineTo(-30, -34);
  c.closePath();
  fillPaper(c, 'black');
  c.restore();
  const line = (draw: () => void, w = 2.2) => { c.beginPath(); draw(); c.strokeStyle = DARK; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); };
  // eyes shut, eyebrows up: nothing here is good enough for him
  for (const s of [-1, 1]) {
    line(() => { c.arc(s * 9 + 3, -1, 4.5, Math.PI * 0.1, Math.PI * 0.9); });
    line(() => { c.moveTo(s * 9 - 3, -12); c.lineTo(s * 9 + 9, -14); }, 2.6);
  }
  // nose
  glued(c, () => { poly(c, [4, -2, 16, 10, 3, 11]); fillPaper(c, 'manila'); });
  // the moustache
  for (const s of [-1, 1]) {
    line(() => { c.moveTo(4, 15); c.quadraticCurveTo(4 + s * 12, 21, 4 + s * 19, 12); c.quadraticCurveTo(4 + s * 22, 7, 4 + s * 17, 8); }, 3.4);
  }
  line(() => { c.moveTo(-2, 22); c.lineTo(9, 22); }, 1.8);
  c.restore();
}

/** Where things are in a picture of the waiter: it is held by the floor under him. He faces right. */
export const WAITER = { w: 220, h: 340, ax: 96, ay: 332, /** his hand, when he is holding something out */ hand: [86, -212], /** his mouth */ mouth: [4, -268] };

/** The waiter: standing with a cloth over his arm, or holding a hand out flat for a tray to sit on. */
function waiter(c: Ctx, serving: boolean): void {
  const x = WAITER.ax, limb = (pts: number[], sheet: Paper, w: number) => glued(c, () => strokePaper(c, pts, sheet, w));
  // the arm behind his back (or, serving, the one that carries)
  if (!serving) limb([x + 26, 112, x + 36, 160, x + 12, 186], 'black', 15);
  // legs, and shoes
  for (const side of [-1, 1]) {
    limb([x + side * 11, 196, x + side * 13, 322], 'black', 17);
    glued(c, () => { ellipse(c, x + side * 13 + 7, 324, 16, 7); fillPaper(c, 'black'); });
  }
  // the long apron
  glued(c, () => { poly(c, [x - 27, 196, x + 27, 196, x + 31, 296, x - 31, 296]); fillPaper(c, 'white'); });
  // waistcoat, shirt and bow tie
  glued(c, () => {
    c.beginPath();
    c.moveTo(x - 20, 98);
    c.quadraticCurveTo(x - 40, 102, x - 38, 122);
    c.lineTo(x - 26, 204);
    c.lineTo(x + 26, 204);
    c.lineTo(x + 38, 122);
    c.quadraticCurveTo(x + 40, 102, x + 20, 98);
    c.closePath();
    fillPaper(c, 'black');
  });
  glued(c, () => { poly(c, [x - 14, 96, x + 14, 96, x + 3, 164, x - 3, 164]); fillPaper(c, 'white'); });
  for (const side of [-1, 1]) glued(c, () => { poly(c, [x, 104, x + side * 13, 97, x + side * 13, 112]); fillPaper(c, 'red'); });
  for (const y of [176, 190]) { circle(c, x, y, 2.4); fillPaper(c, 'yellow'); }
  // his neck and head
  strokePaper(c, [x, 84, x, 100], 'manila', 18);
  waiterHead(c, x + 2, 58);
  if (serving) {
    // one arm up and out, the hand flat
    limb([x + 30, 112, x + 60, 150, x + 82, 126], 'white', 14);
    glued(c, () => { ellipse(c, x + WAITER.hand[0], WAITER.ay + WAITER.hand[1] + 6, 15, 7); fillPaper(c, 'manila'); });
    limb([x - 30, 112, x - 40, 156, x - 16, 176], 'white', 14);
  } else {
    // the other across his middle, with a cloth over it
    limb([x - 30, 112, x - 42, 158, x + 6, 168], 'white', 14);
    glued(c, () => { rr(c, x - 30, 160, 26, 52, 4); fillPaper(c, 'white'); });
    c.strokeStyle = 'rgba(0, 0, 0, 0.16)';
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x - 17, 172); c.lineTo(x - 17, 208); c.stroke();
    glued(c, () => { circle(c, x + 8, 168, 8); fillPaper(c, 'manila'); });
  }
}

/** A wine glass: empty, or with so much red in it (0 to 1). */
export function glass(c: Ctx, x: number, foot: number, tall: number, wine = 0): void {
  const bowl = tall * 0.5, wide = tall * 0.34, top = foot - tall;
  const shape = () => {
    c.beginPath();
    c.moveTo(x - wide * 0.8, top);
    c.bezierCurveTo(x - wide * 1.25, top + bowl * 0.7, x - wide * 0.5, top + bowl, x, top + bowl);
    c.bezierCurveTo(x + wide * 0.5, top + bowl, x + wide * 1.25, top + bowl * 0.7, x + wide * 0.8, top);
    c.closePath();
  };
  glued(c, () => {
    strokePaper(c, [x, top + bowl, x, foot - 2], 'white', tall * 0.07);
    ellipse(c, x, foot - 2, wide * 0.7, tall * 0.05);
    fillPaper(c, 'white');
    shape();
    fillPaper(c, 'white');
  });
  shape();
  wash(c, 'rgba(150, 200, 230, 0.35)');
  if (wine > 0) {
    c.save();
    shape();
    c.clip();
    const level = top + bowl * (1 - 0.82 * wine);
    c.beginPath();
    c.rect(x - wide * 1.4, level, wide * 2.8, bowl);
    fillPaper(c, 'red');
    wash(c, 'rgba(60, 0, 30, 0.5)');
    c.restore();
  }
  // a glint
  c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  c.lineWidth = tall * 0.035;
  c.beginPath();
  c.moveTo(x - wide * 0.62, top + bowl * 0.16);
  c.quadraticCurveTo(x - wide * 0.74, top + bowl * 0.5, x - wide * 0.44, top + bowl * 0.74);
  c.stroke();
}

/** A plate, seen from the table's edge: `wide` across, its middle at (x, y). */
export function plate(c: Ctx, x: number, y: number, wide: number): void {
  glued(c, () => { ellipse(c, x, y, wide / 2, wide * 0.13); fillPaper(c, 'white'); });
  ellipse(c, x, y - wide * 0.012, wide * 0.34, wide * 0.075);
  wash(c, 'rgba(120, 120, 140, 0.16)');
}

/** The restaurant: what is the same in every game set there. */
function buildPlace(scene: Phaser.Scene): void {
  // the wall: dark red paper, butterflies in it, and a rail along the top of the panelling
  makeArt(scene, 'papillon_wall', 180, 320, (c) => {
    rect(c, 0, 0, 180, 320, 'red', 'rgba(52, 4, 30, 0.58)');
    c.fillStyle = 'rgba(255, 220, 190, 0.05)';
    for (let x = 0; x < 180; x += 30) c.fillRect(x, 0, 15, 320);
    for (const [x, y, s, turn] of [[46, 60, 54, -0.3], [136, 150, 46, 0.4], [50, 246, 50, 0.2]]) {
      c.save();
      c.translate(x, y);
      c.rotate(turn);
      butterfly(c, 0, 0, s, 'rgba(255, 190, 150, 0.13)');
      c.restore();
    }
  }, { border: 0, ax: 0, ay: 0 });
  makeArt(scene, 'papillon_panel', 150, 190, (c) => {
    rect(c, 0, 0, 150, 190, 'brown', 'rgba(30, 12, 4, 0.5)');
    rect(c, 0, 0, 150, 12, 'brown', 'rgba(255, 220, 150, 0.12)');
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    c.fillRect(0, 12, 150, 3);
    glued(c, () => { rr(c, 14, 30, 122, 146, 3); fillPaper(c, 'brown'); wash(c, 'rgba(30, 12, 4, 0.36)'); });
    c.strokeStyle = 'rgba(255, 220, 150, 0.14)';
    c.lineWidth = 2;
    c.strokeRect(22, 38, 106, 130);
  }, { border: 0, ax: 0, ay: 0 });
  makeArt(scene, 'papillon_floor', 120, 120, (c) => {
    rect(c, 0, 0, 120, 120, 'green', 'rgba(8, 26, 30, 0.62)');
    c.fillStyle = 'rgba(240, 200, 110, 0.2)';
    for (const [x, y] of [[30, 30], [90, 30], [0, 90], [60, 90], [120, 90]]) {
      poly(c, [x, y - 10, x + 13, y, x, y + 10, x - 13, y]);
      c.fill();
    }
  }, { border: 0, ax: 0, ay: 0 });

  // its name, on a board that hangs from two chains
  makePaperArt(scene, 'papillon_sign', 330, 110, (c) => {
    for (const x of [74, 256]) strokePaper(c, [x, 0, x, 26], 'yellow', 3);
    glued(c, () => { rr(c, 4, 22, 322, 84, 14); fillPaper(c, 'yellow'); wash(c, 'rgba(120, 70, 0, 0.3)'); });
    glued(c, () => { rr(c, 13, 31, 304, 66, 9); fillPaper(c, 'black'); wash(c, 'rgba(40, 10, 30, 0.4)'); });
    butterfly(c, 40, 66, 34, 'yellow', 'red');
    butterfly(c, 290, 66, 34, 'yellow', 'red');
    cutText(c, 'Le Papillon', 165, 66, 31, 'yellow', '"Permanent Marker", "Comic Sans MS", cursive');
  }, { border: 2.4, ax: 165, ay: 0 });

  // butterflies under glass, in gold frames
  const cased: [Paper, Paper][] = [['blue', 'sky'], ['yellow', 'red'], ['sky', 'white'], ['red', 'yellow']];
  cased.forEach(([wings, spots], i) => {
    makePaperArt(scene, `papillon_frame${i}`, 86, 104, (c) => {
      glued(c, () => { rr(c, 0, 0, 86, 104, 5); fillPaper(c, 'yellow'); wash(c, 'rgba(120, 70, 0, 0.32)'); });
      glued(c, () => { c.beginPath(); c.rect(9, 9, 68, 86); fillPaper(c, 'cream'); });
      glued(c, () => butterfly(c, 43, 50, 54, wings, spots));
      circle(c, 43, 50, 1.8);
      wash(c, '#c8c8c8');
    }, { border: 2 });
  });

  // a lamp on the wall, and the light it gives
  makePaperArt(scene, 'papillon_sconce', 60, 96, (c) => {
    glued(c, () => { rr(c, 23, 46, 14, 46, 4); fillPaper(c, 'yellow'); wash(c, 'rgba(120, 70, 0, 0.3)'); });
    strokePaper(c, [30, 60, 30, 40], 'yellow', 4);
    glued(c, () => { poly(c, [12, 6, 48, 6, 56, 42, 4, 42]); fillPaper(c, 'cream'); });
    poly(c, [12, 6, 48, 6, 56, 42, 4, 42]);
    wash(c, 'rgba(255, 190, 70, 0.4)');
  }, { border: 1.8 });
  makeArt(scene, 'papillon_glow', 220, 220, (c) => {
    const g = c.createRadialGradient(110, 110, 4, 110, 110, 110);
    g.addColorStop(0, 'rgba(255, 214, 130, 0.5)');
    g.addColorStop(1, 'rgba(255, 214, 130, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 220, 220);
  }, { border: 0 });

  // the table: a white cloth to the floor. For two or three; and a long one, for the whole family
  for (const [key, wide] of [['papillon_table', 620], ['papillon_table_long', 1060]] as [string, number][]) {
    makePaperArt(scene, key, wide, 200, (c) => {
      // the top, seen from just above its near edge
      glued(c, () => {
        poly(c, [22, 0, wide - 22, 0, wide, 30, 0, 30]);
        fillPaper(c, 'white');
      });
      poly(c, [22, 0, wide - 22, 0, wide, 30, 0, 30]);
      wash(c, 'rgba(120, 110, 150, 0.1)');
      // and the cloth hanging down the front of it, in folds
      glued(c, () => { c.beginPath(); c.rect(0, 30, wide, 170); fillPaper(c, 'white'); });
      for (let x = 34; x < wide; x += 62) {
        const g = c.createLinearGradient(x - 16, 0, x + 16, 0);
        g.addColorStop(0, 'rgba(90, 80, 120, 0)');
        g.addColorStop(0.5, 'rgba(90, 80, 120, 0.13)');
        g.addColorStop(1, 'rgba(90, 80, 120, 0)');
        c.fillStyle = g;
        c.fillRect(x - 16, 34, 32, 166);
      }
      c.fillStyle = 'rgba(60, 50, 90, 0.16)';
      c.fillRect(0, 30, wide, 3);
    }, { border: 2.4, ax: wide / 2, ay: 0 });
  }

  // a chair, from the front: a high back, buttoned
  makePaperArt(scene, 'papillon_chair', 150, 230, (c) => {
    glued(c, () => {
      c.beginPath();
      c.moveTo(8, 230);
      c.lineTo(8, 50);
      c.quadraticCurveTo(75, -22, 142, 50);
      c.lineTo(142, 230);
      c.closePath();
      fillPaper(c, 'brown');
      wash(c, 'rgba(30, 12, 4, 0.3)');
    });
    glued(c, () => {
      c.beginPath();
      c.moveTo(22, 230);
      c.lineTo(22, 56);
      c.quadraticCurveTo(75, -2, 128, 56);
      c.lineTo(128, 230);
      c.closePath();
      fillPaper(c, 'green');
      wash(c, 'rgba(6, 30, 26, 0.45)');
    });
    for (const [x, y] of [[50, 60], [100, 60], [75, 96], [50, 132], [100, 132]]) { circle(c, x, y, 3); wash(c, 'rgba(0, 0, 0, 0.35)'); }
  }, { border: 2.2, ax: 75, ay: 0 });

  // what stands on the table
  makePaperArt(scene, 'papillon_plate', 96, 28, (c) => plate(c, 48, 14, 92), { border: 1.6, ax: 48, ay: 16 });
  makePaperArt(scene, 'papillon_glass', 36, 70, (c) => glass(c, 18, 68, 64), { border: 1.4, ax: 18, ay: 66 });
  makePaperArt(scene, 'papillon_glass_red', 36, 70, (c) => glass(c, 18, 68, 64, 0.7), { border: 1.4, ax: 18, ay: 66 });
  makePaperArt(scene, 'papillon_candle', 40, 104, (c) => {
    glued(c, () => { ellipse(c, 20, 98, 17, 5); fillPaper(c, 'yellow'); wash(c, 'rgba(120, 70, 0, 0.3)'); });
    glued(c, () => { rr(c, 16, 60, 8, 38, 3); fillPaper(c, 'yellow'); wash(c, 'rgba(120, 70, 0, 0.3)'); });
    glued(c, () => { rr(c, 14, 26, 12, 38, 2); fillPaper(c, 'cream'); });
    glued(c, () => {
      c.beginPath();
      c.moveTo(20, 2);
      c.bezierCurveTo(30, 14, 28, 26, 20, 26);
      c.bezierCurveTo(12, 26, 10, 14, 20, 2);
      fillPaper(c, 'yellow');
    });
    ellipse(c, 20, 20, 3.5, 5);
    fillPaper(c, 'red');
  }, { border: 1.5, ax: 20, ay: 100 });
  makePaperArt(scene, 'papillon_rose', 40, 96, (c) => {
    strokePaper(c, [20, 36, 22, 70], 'green', 3);
    glued(c, () => { poly(c, [22, 50, 34, 42, 30, 54]); fillPaper(c, 'green'); });
    glued(c, () => { circle(c, 20, 24, 13); fillPaper(c, 'red'); });
    c.strokeStyle = 'rgba(80, 0, 10, 0.5)';
    c.lineWidth = 1.6;
    c.beginPath(); c.arc(20, 24, 7, 0.4, 4.4); c.stroke();
    c.beginPath(); c.arc(21, 23, 3, 2, 6.4); c.stroke();
    glued(c, () => { poly(c, [12, 62, 28, 62, 31, 92, 9, 92]); fillPaper(c, 'sky'); });
    poly(c, [12, 62, 28, 62, 31, 92, 9, 92]);
    wash(c, 'rgba(255, 255, 255, 0.35)');
  }, { border: 1.5, ax: 20, ay: 90 });
  makePaperArt(scene, 'papillon_cloche', 110, 78, (c) => {
    glued(c, () => { ellipse(c, 55, 68, 53, 8); fillPaper(c, 'grey'); wash(c, 'rgba(255, 255, 255, 0.5)'); });
    glued(c, () => {
      c.beginPath();
      c.moveTo(11, 64);
      c.bezierCurveTo(11, 2, 99, 2, 99, 64);
      c.closePath();
      fillPaper(c, 'grey');
      wash(c, 'rgba(255, 255, 255, 0.42)');
    });
    c.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    c.lineWidth = 4;
    c.beginPath(); c.arc(55, 62, 34, Math.PI * 1.1, Math.PI * 1.4); c.stroke();
    glued(c, () => { circle(c, 55, 13, 6); fillPaper(c, 'yellow'); });
  }, { border: 1.8, ax: 55, ay: 72 });
  makePaperArt(scene, 'papillon_tray', 120, 20, (c) => {
    glued(c, () => { ellipse(c, 60, 10, 58, 8); fillPaper(c, 'grey'); wash(c, 'rgba(255, 255, 255, 0.5)'); });
    ellipse(c, 60, 8, 48, 4.5);
    wash(c, 'rgba(60, 60, 80, 0.16)');
  }, { border: 1.6, ax: 60, ay: 12 });

  // the menu, as somebody holds it up to read: a hand on each side
  makePaperArt(scene, 'papillon_menu', 132, 150, (c) => {
    glued(c, () => { rr(c, 14, 2, 104, 140, 5); fillPaper(c, 'brown'); wash(c, 'rgba(50, 6, 20, 0.5)'); });
    c.strokeStyle = paper(c, 'yellow');
    c.lineWidth = 2;
    c.strokeRect(22, 10, 88, 124);
    butterfly(c, 66, 52, 44, 'yellow');
    cutText(c, 'MENU', 66, 98, 24, 'yellow');
    for (const side of [-1, 1]) glued(c, () => { ellipse(c, 66 + side * 52, 108, 13, 17); fillPaper(c, 'manila'); });
  }, { border: 2, ax: 66, ay: 72 });

  // the waiter
  makePaperArt(scene, 'papillon_waiter', WAITER.w, WAITER.h, (c) => waiter(c, false), { border: 2.4, ax: WAITER.ax, ay: WAITER.ay });
  makePaperArt(scene, 'papillon_waiter_serve', WAITER.w, WAITER.h, (c) => waiter(c, true), { border: 2.4, ax: WAITER.ax, ay: WAITER.ay });

  // everybody, sitting down, dressed for it
  for (const [who, dress] of Object.entries(DRESS)) {
    makePaperArt(scene, `papillon_sit_${who}`, SIT.w, SIT.h, (c) => seated(c, dress), { border: 2.4, ax: SIT.ax, ay: SIT.ay });
  }

  // a butterfly off the wallpaper, for when something goes right
  makePaperArt(scene, 'papillon_butterfly', 56, 46, (c) => butterfly(c, 28, 26, 50, 'yellow', 'red'), { border: 1.4 });
}

export function buildArt(scene: Phaser.Scene): void {
  buildPlace(scene);
  makeWord(scene, 'word_papillon_placeholder', 'OUI!', 'yellow', 'red', 150, 44, 71);
}
