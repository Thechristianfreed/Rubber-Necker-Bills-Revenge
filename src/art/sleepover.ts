import Phaser from 'phaser';
import { BLEED } from './finish';
import { Ctx, circle, ellipse, makeArt, poly, rr } from './sticker';
import { Paper, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from './paper';

/** The sleepover bonus level, as cut paper: a basement rec room at night, DJ
 *  asleep on the couch, and the boys. These are stand-ins: any of them is
 *  replaced by a photo cutout registered under the same key (see photos.ts). */

/** How the room is laid out on the page. `x` values are measured from the
 *  middle of the couch unless they say otherwise. */
export const ROOM = {
  /** Where the wall meets the carpet. */
  floorY: 418,
  /** The couch: how far across the page its middle is, and where its feet are. */
  couchAt: 0.44,
  couchY: 452,
  /** DJ lies along the couch; this is where the bottom of his picture goes,
   *  and where the middle of his head ends up (from the couch's middle). */
  djY: 400,
  djHead: [-100, 342] as [number, number],
  /** Neil stands at the head end of the couch (his feet), and the lamp he
   *  hits when he swings in the dark is at the left of the room. */
  neil: [-189, 434] as [number, number],
  /** Forrest films from behind the couch. */
  forrest: [62, 408] as [number, number],
  /** From the right edge of the page: Christian, the light switch he works,
   *  and the door Alex's dad comes through. */
  christianFromRight: [233, 468] as [number, number],
  doorFromRight: [70, 420] as [number, number],
  lamp: [64, 440] as [number, number],
};

/** Points on the cut-out people, from the bottom middle of each picture. */
export const DOLL = {
  /** The middle of a standing boy's head, and his right shoulder. */
  head: [0, -170] as [number, number],
  shoulder: [25, -128] as [number, number],
  /** Christian's raised hand, which is where the light switch is. */
  reach: [61, -170] as [number, number],
  /** Where Forrest holds his phone. */
  phone: [-40, -108] as [number, number],
  /** Neil's sock arm is pinned at his shoulder; the toe of the sock hangs here. */
  toe: [64, -8] as [number, number],
};

type Face = 'grin' | 'cheeky' | 'sleep' | 'shock' | 'angry';
const INK = '#2a2320';

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

function tile(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void): void {
  makePaperArt(scene, key, w, h, draw, { border: 0, ax: 0, ay: 0 });
}

function stroke(c: Ctx, draw: () => void, width = 2.6): void {
  c.beginPath();
  draw();
  c.strokeStyle = INK;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.stroke();
}

// ---- people -----------------------------------------------------------------------

/** A head: a paper circle with hair across the top and a face drawn on in marker. */
function head(c: Ctx, x: number, y: number, r: number, hair: Paper, face: Face, thin = false): void {
  glued(c, () => { circle(c, x, y, r); fillPaper(c, 'manila'); });
  c.save();
  c.beginPath();
  c.rect(x - r - 6, y - r - 10, r * 2 + 12, thin ? r * 0.62 : r * 0.98);
  c.clip();
  circle(c, x, y - 3, r + 3);
  fillPaper(c, hair);
  c.restore();
  const ex = r * 0.38, ey = y + r * 0.08;
  if (face === 'sleep') {
    stroke(c, () => { c.arc(x - ex, ey, 5, 0.15 * Math.PI, 0.85 * Math.PI); });
    stroke(c, () => { c.arc(x + ex, ey, 5, 0.15 * Math.PI, 0.85 * Math.PI); });
    ellipse(c, x, y + r * 0.52, 5, 7);
    c.fillStyle = INK;
    c.fill();
    return;
  }
  if (face === 'shock') {
    for (const sx of [-ex, ex]) {
      circle(c, x + sx, ey - 2, 8);
      c.fillStyle = '#fbfaf4';
      c.fill();
      stroke(c, () => { c.arc(x + sx, ey - 2, 8, 0, Math.PI * 2); }, 2);
    }
  }
  for (const sx of [-ex, ex]) {
    circle(c, x + sx, ey - (face === 'shock' ? 2 : 0), 2.8);
    c.fillStyle = INK;
    c.fill();
  }
  if (face === 'angry') {
    stroke(c, () => { c.moveTo(x - ex - 8, ey - 12); c.lineTo(x - ex + 6, ey - 6); });
    stroke(c, () => { c.moveTo(x + ex + 8, ey - 12); c.lineTo(x + ex - 6, ey - 6); });
    stroke(c, () => { c.arc(x, y + r * 0.78, 9, 1.15 * Math.PI, 1.85 * Math.PI); });
  } else if (face === 'shock') {
    ellipse(c, x, y + r * 0.56, 6, 8);
    c.fillStyle = INK;
    c.fill();
  } else {
    if (face === 'cheeky') stroke(c, () => { c.moveTo(x + ex - 7, ey - 11); c.lineTo(x + ex + 7, ey - 8); });
    stroke(c, () => { c.arc(x, y + r * 0.28, r * 0.42, 0.12 * Math.PI, 0.88 * Math.PI); });
  }
}

/** A boy standing, on a canvas 110 wide (or more) by 210: legs, shirt and head.
 *  His arms are drawn by whoever calls this, since every boy is up to something
 *  different. */
function boy(c: Ctx, shirt: Paper, pants: Paper, hair: Paper, face: Face): void {
  ellipse(c, 40, 203, 13, 6.5);
  fillPaper(c, 'black');
  ellipse(c, 70, 203, 13, 6.5);
  fillPaper(c, 'black');
  rect(c, 33, 132, 19, 68, pants);
  rect(c, 58, 132, 19, 68, pants);
  rect(c, 48, 58, 14, 14, 'manila');
  glued(c, () => { rr(c, 28, 68, 54, 72, 10); fillPaper(c, shirt); });
  head(c, 55, 40, 30, hair, face);
}

function arm(c: Ctx, pts: number[], sleeve: Paper): void {
  glued(c, () => strokePaper(c, pts, sleeve, 13));
  circle(c, pts[pts.length - 2], pts[pts.length - 1], 7.5);
  fillPaper(c, 'manila');
}

/** Neil's arm, held up, with the Hot Carl dangling from his fist: on a 110 x
 *  130 canvas, pinned at his shoulder (14, 112). */
function sockArm(c: Ctx): void {
  // steam coming off the toe
  for (const [x, lean] of [[58, -1], [96, 1], [80, 0]] as [number, number][]) {
    c.beginPath();
    c.moveTo(x, 92);
    c.bezierCurveTo(x - 7 + lean * 4, 82, x + 7 + lean * 4, 76, x + lean * 6, 64);
    c.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.stroke();
  }
  // the sock: a white tube with two red rings, and a suspicious lump in the toe
  glued(c, () => {
    strokePaper(c, [70, 24, 73, 60, 77, 92], 'white', 22);
    ellipse(c, 79, 100, 17, 14);
    fillPaper(c, 'white');
  });
  c.save();
  c.beginPath();
  c.rect(56, 30, 30, 22);
  c.clip();
  strokePaper(c, [58, 36, 84, 34], 'red', 4);
  strokePaper(c, [58, 45, 85, 43], 'red', 4);
  c.restore();
  ellipse(c, 80, 105, 11, 7);
  c.fillStyle = 'rgba(110, 70, 30, 0.5)';
  c.fill();
  ellipse(c, 76, 99, 6, 5);
  c.fillStyle = 'rgba(110, 70, 30, 0.28)';
  c.fill();
  arm(c, [14, 112, 42, 64, 70, 20], 'green');
}

/** DJ, asleep along the couch in his sleeping bag, on a 300 x 120 canvas. */
function dj(c: Ctx, awake: boolean): void {
  glued(c, () => { rr(c, 6, 56, 92, 48, 14); fillPaper(c, 'white'); });
  glued(c, () => { rr(c, 66, 62, 228, 54, 24); fillPaper(c, 'blue'); });
  c.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  c.lineWidth = 2;
  c.setLineDash([6, 5]);
  c.beginPath();
  c.moveTo(84, 89);
  c.lineTo(282, 89);
  c.stroke();
  c.setLineDash([]);
  c.save();
  c.translate(50, 62);
  c.rotate(awake ? -0.1 : -0.4);
  head(c, 0, 0, 30, 'black', awake ? 'shock' : 'sleep');
  c.restore();
}

/** Alex's dad in his dressing gown, hands on hips, on a 130 x 250 canvas. */
function dad(c: Ctx): void {
  ellipse(c, 50, 243, 15, 7);
  fillPaper(c, 'brown');
  ellipse(c, 82, 243, 15, 7);
  fillPaper(c, 'brown');
  rect(c, 42, 196, 18, 44, 'sky');
  rect(c, 70, 196, 18, 44, 'sky');
  rect(c, 57, 66, 16, 16, 'manila');
  glued(c, () => strokePaper(c, [34, 92, 10, 128, 34, 150], 'blue', 15));
  glued(c, () => strokePaper(c, [96, 92, 120, 128, 96, 150], 'blue', 15));
  glued(c, () => { rr(c, 30, 78, 70, 128, 12); fillPaper(c, 'blue'); });
  rect(c, 30, 140, 70, 9, 'yellow');
  strokePaper(c, [65, 80, 58, 138], 'sky', 5);
  head(c, 65, 44, 32, 'grey', 'angry', true);
  strokePaper(c, [51, 58, 65, 54, 79, 58], 'grey', 6);
}

// ---- the room -------------------------------------------------------------------

function couch(c: Ctx): void {
  rect(c, 22, 118, 14, 12, 'black');
  rect(c, 284, 118, 14, 12, 'black');
  glued(c, () => { rr(c, 12, 0, 296, 96, 18); fillPaper(c, 'brown'); });
  c.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let x = 40; x < 290; x += 46) c.fillRect(x, 8, 20, 54);
  glued(c, () => { rr(c, 26, 66, 268, 44, 10); fillPaper(c, 'manila'); });
  glued(c, () => { rr(c, 0, 40, 36, 82, 12); fillPaper(c, 'brown'); });
  glued(c, () => { rr(c, 284, 40, 36, 82, 12); fillPaper(c, 'brown'); });
}

function door(c: Ctx, open: boolean): void {
  rect(c, 0, 0, 96, 200, 'white');
  rect(c, 7, 7, 82, 193, open ? 'yellow' : 'brown');
  if (open) return;
  c.fillStyle = 'rgba(0, 0, 0, 0.16)';
  c.fillRect(17, 18, 62, 70);
  c.fillRect(17, 104, 62, 82);
  circle(c, 78, 100, 5);
  fillPaper(c, 'yellow');
}

export function buildSleepoverArt(scene: Phaser.Scene): void {
  // wood panelling above, shag carpet below
  const wallH = ROOM.floorY + BLEED;
  tile(scene, 'rec_wall', 64, wallH, (c) => {
    rect(c, 0, 0, 64, wallH, 'manila');
    c.fillStyle = 'rgba(90, 55, 20, 0.22)';
    c.fillRect(0, 0, 64, wallH);
    c.fillStyle = 'rgba(60, 34, 10, 0.4)';
    c.fillRect(0, 0, 2, wallH);
    c.fillRect(32, 0, 1.4, wallH);
    rect(c, 0, wallH - 9, 64, 9, 'brown');
  });
  tile(scene, 'rec_floor', 64, 170, (c) => {
    rect(c, 0, 0, 64, 170, 'green');
    c.fillStyle = 'rgba(20, 40, 10, 0.3)';
    c.fillRect(0, 0, 64, 170);
    c.fillStyle = 'rgba(255, 255, 220, 0.14)';
    for (let i = 0; i < 46; i++) c.fillRect((i * 37) % 62, (i * 53) % 166, 2, 5);
  });
  makePaperArt(scene, 'rec_couch', 320, 130, couch, { border: 2, ax: 160, ay: 130 });
  makePaperArt(scene, 'rec_door', 96, 200, (c) => door(c, false), { border: 2, ax: 48, ay: 200 });
  makePaperArt(scene, 'rec_door_open', 96, 200, (c) => door(c, true), { border: 2, ax: 48, ay: 200 });
  makePaperArt(scene, 'rec_lamp', 70, 230, (c) => {
    rect(c, 32, 60, 6, 162, 'brown');
    ellipse(c, 35, 224, 24, 6);
    fillPaper(c, 'brown');
    glued(c, () => { poly(c, [16, 0, 54, 0, 68, 62, 2, 62]); fillPaper(c, 'yellow'); });
  }, { border: 2, ax: 35, ay: 230 });
  // a window onto the night, so it is plain how late it is
  makePaperArt(scene, 'rec_window', 120, 96, (c) => {
    rect(c, 0, 0, 120, 96, 'white');
    rect(c, 8, 8, 104, 80, 'black');
    circle(c, 84, 34, 13);
    fillPaper(c, 'yellow');
    rect(c, 57, 8, 6, 80, 'white');
    rect(c, 8, 45, 104, 6, 'white');
  }, { border: 2 });
  for (const on of [true, false]) {
    makePaperArt(scene, on ? 'switch_on' : 'switch_off', 22, 34, (c) => {
      rr(c, 0, 0, 22, 34, 3);
      fillPaper(c, 'white');
      glued(c, () => rect(c, 8, on ? 7 : 16, 6, 11, 'grey'));
    }, { border: 1.5 });
  }

  // the cast
  makePaperArt(scene, 'kid_neil', 110, 210, (c) => {
    arm(c, [30, 82, 22, 132], 'green');
    boy(c, 'green', 'blue', 'brown', 'cheeky');
  }, { border: 2.5, ax: 55, ay: 210 });
  makePaperArt(scene, 'neil_arm', 110, 130, sockArm, { border: 2.5, ax: 14, ay: 112 });
  makePaperArt(scene, 'kid_forrest', 110, 210, (c) => {
    boy(c, 'red', 'grey', 'yellow', 'grin');
    // both hands on his phone, pointed at the couch
    glued(c, () => { rr(c, 4, 84, 22, 38, 4); fillPaper(c, 'black'); });
    arm(c, [80, 82, 54, 108, 26, 110], 'red');
    arm(c, [30, 82, 26, 96], 'red');
  }, { border: 2.5, ax: 55, ay: 210 });
  makePaperArt(scene, 'kid_christian', 130, 210, (c) => {
    arm(c, [30, 82, 22, 132], 'sky');
    boy(c, 'sky', 'brown', 'black', 'grin');
    arm(c, [80, 82, 104, 62, 116, 40], 'sky');
  }, { border: 2.5, ax: 55, ay: 210 });
  makePaperArt(scene, 'dj_asleep', 300, 120, (c) => dj(c, false), { border: 2.5, ax: 150, ay: 120 });
  makePaperArt(scene, 'dj_awake', 300, 120, (c) => dj(c, true), { border: 2.5, ax: 150, ay: 120 });
  makePaperArt(scene, 'alex_dad', 130, 250, dad, { border: 2.5, ax: 65, ay: 250 });

  // what shows in the dark: eyes, the glow of Forrest's phone, and DJ's snores
  makeArt(scene, 'eyes', 30, 12, (c) => {
    for (const x of [7, 23]) {
      ellipse(c, x, 6, 6, 5.5);
      c.fillStyle = '#fbfaf4';
      c.fill();
      circle(c, x + 1, 6.5, 2.4);
      c.fillStyle = '#14121a';
      c.fill();
    }
  });
  makeArt(scene, 'phone_glow', 60, 60, (c) => {
    const g = c.createRadialGradient(30, 30, 2, 30, 30, 30);
    g.addColorStop(0, 'rgba(190, 225, 255, 0.95)');
    g.addColorStop(0.35, 'rgba(150, 200, 255, 0.4)');
    g.addColorStop(1, 'rgba(150, 200, 255, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 60, 60);
  });
  makeArt(scene, 'rec_dot', 10, 10, (c) => {
    circle(c, 5, 5, 4.5);
    c.fillStyle = paper(c, 'red');
    c.fill();
  });
  makePaperArt(scene, 'zzz', 70, 56, (c) => {
    cutText(c, 'z', 12, 44, 22, 'white');
    cutText(c, 'z', 32, 30, 30, 'white');
    cutText(c, 'Z', 56, 18, 38, 'white');
  }, { border: 0 });

  makeWord(scene, 'word_blap', 'BLAP!', 'yellow', 'red', 104, 32, 31);
  makeWord(scene, 'word_crash', 'CRASH!', 'grey', 'yellow', 118, 29, 33);
  makeWord(scene, 'word_busted', 'BUSTED!', 'red', 'yellow', 330, 76, 34);
}
