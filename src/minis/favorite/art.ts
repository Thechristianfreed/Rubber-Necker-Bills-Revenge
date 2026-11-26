import Phaser from 'phaser';
import { Paper, burstPath, cutText, fillPaper, glued, heartPath, makePaperArt, makeWord, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, rr } from '../../art/sticker';

/** The paper stand-ins for this game: what is on the page until there is a photo
 *  (a photo registered under the same key in index.ts takes its place).
 *
 *  The restaurant, the table and everybody sitting at it are Le Papillon's
 *  (`papillon_...`, laid by src/minis/shared/papillon.ts). What is drawn here is
 *  only this game's: the bottle, the hearts over the boys' heads, and Bill's
 *  hand as he says it.
 *
 *  Every key starts with "favorite_" (a word on a burst: "word_favorite_..."). */

/** How big the bottle is drawn (the photo of it is the same shape, near enough), and where
 *  the glass shows on it, as fractions of its height: from under the foil to the top of
 *  the label. The wine goes down from the one to the other. */
export const BOTTLE = { w: 46, h: 170, glass: [0.192, 0.566] };
/** The heart over a boy's head. */
export const HEART = { w: 46, h: 42 };

function wash(c: Ctx, colour: string): void {
  c.fillStyle = colour;
  c.fill();
}

/** The outline of a bottle of Burgundy: a long neck, and sloping shoulders. */
function bottlePath(c: Ctx): void {
  const { w, h } = BOTTLE, m = w / 2;
  c.beginPath();
  c.moveTo(m - 8, 2);
  c.lineTo(m - 8, h * 0.24);
  c.bezierCurveTo(m - 9, h * 0.4, m - 22, h * 0.44, m - 22, h * 0.56);
  c.lineTo(m - 22, h - 8);
  c.quadraticCurveTo(m - 22, h - 1, m - 14, h - 1);
  c.lineTo(m + 14, h - 1);
  c.quadraticCurveTo(m + 22, h - 1, m + 22, h - 8);
  c.lineTo(m + 22, h * 0.56);
  c.bezierCurveTo(m + 22, h * 0.44, m + 9, h * 0.4, m + 8, h * 0.24);
  c.lineTo(m + 8, 2);
  c.closePath();
}

/** The bottle: full (dark, with the wine in it) or empty (green glass). The foil and the label are the same on both. */
function bottle(c: Ctx, full: boolean): void {
  const { w, h } = BOTTLE, m = w / 2;
  glued(c, () => {
    bottlePath(c);
    fillPaper(c, full ? 'black' : 'green');
    wash(c, full ? 'rgba(70, 0, 24, 0.5)' : 'rgba(210, 230, 120, 0.3)');
  });
  // a glint down one shoulder
  c.strokeStyle = full ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.6)';
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(m - 13, h * 0.5);
  c.quadraticCurveTo(m - 14, h * 0.42, m - 5, h * 0.3);
  c.stroke();
  // the foil
  glued(c, () => { rr(c, m - 9.5, 0, 19, h * BOTTLE.glass[0], 3); fillPaper(c, 'red'); wash(c, 'rgba(90, 0, 20, 0.2)'); });
  // the label: cream, a red rule top and bottom, and what it is
  const top = h * (BOTTLE.glass[1] + 0.012), tall = h * 0.35;
  glued(c, () => { c.beginPath(); c.rect(m - 22, top, 44, tall); fillPaper(c, 'cream'); });
  for (const y of [top, top + tall - 3.5]) { c.beginPath(); c.rect(m - 22, y, 44, 3.5); fillPaper(c, 'red'); }
  cutText(c, 'PINOT', m, top + 18, 12.5, 'red');
  cutText(c, 'NOIR', m, top + 32, 12.5, 'red');
  c.fillStyle = 'rgba(40, 30, 30, 0.75)';
  c.font = '7px Georgia, serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('2014', m, top + 46);
}

/** A shirt cuff and the end of a dark sleeve, running from (x, y) along (dx, dy) (a unit step). */
function sleeve(c: Ctx, x: number, y: number, dx: number, dy: number): void {
  glued(c, () => strokePaper(c, [x + dx * 16, y + dy * 16, x + dx * 40, y + dy * 40], 'black', 30));
  // (square ends: it is a cuff, not a sausage)
  c.save();
  c.lineCap = 'butt';
  glued(c, () => {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + dx * 12, y + dy * 12);
    c.strokeStyle = '#fbfaf4';
    c.lineWidth = 27;
    c.lineCap = 'butt';
    c.stroke();
  });
  c.restore();
}

const KNUCKLE = 'rgba(90, 50, 20, 0.45)';

function knuckles(c: Ctx, pts: [number, number, number, number][]): void {
  c.strokeStyle = KNUCKLE;
  c.lineWidth = 1.6;
  c.lineCap = 'round';
  for (const [x0, y0, x1, y1] of pts) {
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
  }
}

const SKIN: Paper = 'manila';

function buildHands(scene: Phaser.Scene): void {
  // pointing, to the right: "YOU'RE my favorite". Held by the wrist.
  makePaperArt(scene, 'favorite_point', 126, 60, (c) => {
    sleeve(c, 44, 32, -1, 0);
    glued(c, () => strokePaper(c, [72, 23, 116, 21], SKIN, 12));
    glued(c, () => { ellipse(c, 64, 32, 21, 18); fillPaper(c, SKIN); });
    glued(c, () => strokePaper(c, [58, 20, 70, 9], SKIN, 10));
    knuckles(c, [[66, 34, 78, 34], [64, 41, 76, 41], [62, 47, 72, 47]]);
  }, { border: 2, ax: 44, ay: 32 });

  // one finger up, for his lips: "SHHHH". Held where the finger crosses them.
  makePaperArt(scene, 'favorite_shh', 60, 130, (c) => {
    sleeve(c, 30, 88, 0, 1);
    glued(c, () => strokePaper(c, [30, 10, 30, 62], SKIN, 12));
    glued(c, () => { ellipse(c, 30, 70, 19, 20); fillPaper(c, SKIN); });
    glued(c, () => strokePaper(c, [16, 60, 26, 72], SKIN, 10));
    knuckles(c, [[34, 60, 34, 72], [40, 62, 40, 73], [45, 66, 45, 75]]);
  }, { border: 2, ax: 30, ay: 34 });

  // cupped beside his mouth, so that nobody else hears. Its hollow faces right; held by the middle of the palm.
  makePaperArt(scene, 'favorite_cup', 70, 130, (c) => {
    sleeve(c, 32, 90, 0, 1);
    glued(c, () => {
      c.beginPath();
      c.moveTo(14, 90);
      c.bezierCurveTo(2, 58, 8, 22, 34, 4);
      c.quadraticCurveTo(46, 2, 44, 16);
      c.bezierCurveTo(30, 36, 34, 62, 50, 90);
      c.closePath();
      fillPaper(c, SKIN);
    });
    glued(c, () => { ellipse(c, 50, 66, 9, 14, -0.5); fillPaper(c, SKIN); });
    knuckles(c, [[20, 30, 30, 18], [16, 44, 24, 30], [14, 58, 20, 46]]);
  }, { border: 2, ax: 30, ay: 50 });
}

export function buildArt(scene: Phaser.Scene): void {
  // the bottle, and the same bottle with nothing left in it
  makePaperArt(scene, 'favorite_bottle', BOTTLE.w, BOTTLE.h, (c) => bottle(c, true), { border: 1.8, ax: BOTTLE.w / 2, ay: BOTTLE.h - 2 });
  makePaperArt(scene, 'favorite_bottle_empty', BOTTLE.w, BOTTLE.h, (c) => bottle(c, false), { border: 1.8, ax: BOTTLE.w / 2, ay: BOTTLE.h - 2 });

  // how special somebody feels: a heart, and the same heart with nothing in it
  makePaperArt(scene, 'favorite_heart', HEART.w, HEART.h, (c) => {
    glued(c, () => { heartPath(c, HEART.w, HEART.h); fillPaper(c, 'red'); });
    c.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(13, 13, 6, Math.PI * 1.05, Math.PI * 1.5);
    c.stroke();
  }, { border: 2.2 });
  makePaperArt(scene, 'favorite_heart_empty', HEART.w, HEART.h, (c) => {
    glued(c, () => { heartPath(c, HEART.w, HEART.h); fillPaper(c, 'grey'); wash(c, 'rgba(20, 16, 24, 0.55)'); });
  }, { border: 2.2 });

  buildHands(scene);

  // the last word: it was their anniversary dinner
  makePaperArt(scene, 'word_favorite_anniversary', 310, 164, (c) => {
    burstPath(c, 155, 82, 153, 80, 15, 91);
    fillPaper(c, 'red');
    c.translate(155, 82);
    c.rotate(-0.05);
    cutText(c, 'HAPPY', 0, -21, 42, 'yellow');
    cutText(c, 'ANNIVERSARY!', 0, 23, 42, 'white');
  }, { border: 2.5 });
  makeWord(scene, 'word_favorite_hic', '*HIC*', 'sky', 'blue', 104, 28, 92);
  // (something small to float up off a boy who has just been told)
  makePaperArt(scene, 'favorite_no1', 40, 40, (c) => {
    glued(c, () => { circle(c, 20, 20, 18); fillPaper(c, 'yellow'); });
    cutText(c, '#1', 20, 21, 20, 'red');
  }, { border: 1.6 });
}
