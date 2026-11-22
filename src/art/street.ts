import Phaser from 'phaser';
import { Ctx, circle, ellipse, poly, rr } from './sticker';
import { Paper, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from './paper';
import { makeNeck } from './textures';

/** Level 1, the street, as cut paper. These are stand-ins: any of them is
 *  replaced by a photo cutout registered under the same key (see photos.ts). */

function tile(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void): void {
  makePaperArt(scene, key, w, h, draw, { border: 0, ax: 0, ay: 0 });
}

function rect(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

/** A mailbox seen from the side, on a 64 x 48 canvas: door at the left, flag on the side. */
function mailbox(c: Ctx, body: Paper, flag: Paper, hit: boolean): void {
  if (hit) {
    // the door has dropped open and a letter is on its way out
    glued(c, () => { poly(c, [12, 46, 0, 41, 2, 32, 13, 37]); fillPaper(c, 'black'); });
    c.save();
    c.translate(8, 28);
    c.rotate(-0.5);
    glued(c, () => rect(c, -9, -5, 18, 11, 'white'));
    c.restore();
  }
  c.beginPath();
  c.moveTo(12, 46);
  c.lineTo(12, 27);
  c.quadraticCurveTo(12, 16, 24, 16);
  c.lineTo(46, 16);
  c.quadraticCurveTo(56, 16, 56, 27);
  c.lineTo(56, 46);
  c.closePath();
  fillPaper(c, body);
  rect(c, 12, hit ? 21 : 19, hit ? 7 : 4, hit ? 25 : 27, 'black');
  glued(c, () => {
    if (hit) {
      rect(c, 40, 1, 4, 30, flag);
      rect(c, 40, 1, 12, 8, flag);
    } else {
      rect(c, 28, 28, 22, 4, flag);
      rect(c, 28, 22, 8, 10, flag);
    }
  });
  circle(c, 42, 30, 2.4);
  fillPaper(c, 'black');
}

/** A mailman standing at the kerb, on a 64 x 106 canvas, with a photo head if one is supplied. */
function mailman(c: Ctx, head: HTMLImageElement | undefined): void {
  ellipse(c, 25, 103, 8, 3.5); fillPaper(c, 'black');
  ellipse(c, 38, 103, 8, 3.5); fillPaper(c, 'black');
  rect(c, 22, 78, 9, 25, 'blue');
  rect(c, 33, 78, 9, 25, 'blue');
  rr(c, 18, 50, 28, 32, 6); fillPaper(c, 'blue');
  // one arm holding a letter out, the other on his bag
  strokePaper(c, [21, 56, 11, 68, 14, 76], 'blue', 7);
  glued(c, () => rect(c, 5, 71, 13, 9, 'white'));
  strokePaper(c, [22, 52, 46, 66], 'manila', 3);
  glued(c, () => { rr(c, 36, 62, 21, 21, 4); fillPaper(c, 'manila'); });
  if (head) {
    const hh = 58, hw = (hh * head.naturalWidth) / head.naturalHeight;
    c.drawImage(head, 32 - hw / 2, 0, hw, hh);
  } else {
    circle(c, 32, 30, 22); fillPaper(c, 'manila');
  }
  // his cap, peak to the front
  glued(c, () => {
    c.beginPath();
    c.moveTo(15, 15);
    c.quadraticCurveTo(32, -7, 50, 15);
    c.lineTo(50, 19);
    c.lineTo(15, 19);
    c.closePath();
    fillPaper(c, 'blue');
    poly(c, [3, 20, 32, 17, 32, 22, 5, 24]);
    fillPaper(c, 'black');
  });
}

/** A street tree with a canopy low enough to clip a kid on a bike (190 x 212). */
function tree(c: Ctx): void {
  poly(c, [84, 212, 106, 212, 101, 110, 89, 110]);
  fillPaper(c, 'brown');
  const blobs: [number, number, number][] = [[34, 88, 32], [142, 78, 40], [55, 62, 46], [105, 52, 50], [92, 92, 42]];
  for (const [x, y, r] of blobs) { circle(c, x, y, r); fillPaper(c, 'green'); }
  // a little depth: shade underneath, light on top
  c.fillStyle = 'rgba(16, 48, 20, 0.2)';
  for (const [x, y, r] of blobs) { c.beginPath(); c.arc(x, y + r * 0.2, r * 0.82, 0.15, Math.PI - 0.15); c.fill(); }
  c.fillStyle = 'rgba(255, 255, 230, 0.12)';
  for (const [x, y, r] of blobs.slice(2)) { circle(c, x - r * 0.25, y - r * 0.35, r * 0.4); c.fill(); }
}

/** A Schwinn Stingray with its rider's legs, on a 212 x 134 canvas: wheels on the ground at y = 132. */
function bike(c: Ctx): void {
  const wheel = (x: number) => {
    c.beginPath();
    c.arc(x, 96, 32, 0, Math.PI * 2);
    c.strokeStyle = paper(c, 'black');
    c.lineWidth = 8;
    c.stroke();
    c.strokeStyle = paper(c, 'grey');
    c.lineWidth = 1.2;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 8;
      c.beginPath();
      c.moveTo(x - Math.cos(a) * 28, 96 - Math.sin(a) * 28);
      c.lineTo(x + Math.cos(a) * 28, 96 + Math.sin(a) * 28);
      c.stroke();
    }
    circle(c, x, 96, 4); fillPaper(c, 'grey');
  };
  // far leg and foot, behind everything
  strokePaper(c, [90, 54, 106, 72, 98, 88], 'blue', 11);
  ellipse(c, 102, 91, 9, 4); fillPaper(c, 'white');
  wheel(44);
  wheel(166);
  strokePaper(c, [84, 56, 98, 98, 44, 96, 82, 56], 'red', 5);      // seat tube, chain stay, seat stay
  strokePaper(c, [98, 98, 150, 58, 86, 58], 'red', 5);             // down tube, top tube
  strokePaper(c, [150, 58, 166, 96], 'grey', 5);                   // fork
  strokePaper(c, [62, 52, 50, 16, 66, 16, 70, 50], 'grey', 3);     // sissy bar
  glued(c, () => { rr(c, 54, 46, 58, 10, 5); fillPaper(c, 'white'); });  // banana seat
  strokePaper(c, [150, 58, 142, 22, 152, 16], 'grey', 4);          // ape-hanger bars
  strokePaper(c, [150, 16, 159, 14], 'black', 5);
  circle(c, 98, 98, 9); fillPaper(c, 'grey');
  // near leg, pedalling
  glued(c, () => strokePaper(c, [92, 54, 118, 76, 106, 106], 'blue', 12));
  ellipse(c, 110, 110, 10, 5); fillPaper(c, 'white');
}

function house(c: Ctx, x: number, w: number, body: Paper, roof: Paper, door: Paper): void {
  const top = 64;
  rect(c, x + w * 0.68, top - 36, 11, 24, 'red');
  rect(c, x, top, w, 150 - top, body);
  glued(c, () => { poly(c, [x - 10, top + 3, x + w / 2, top - 44, x + w + 10, top + 3]); fillPaper(c, roof); });
  rect(c, x + w / 2 - 10, 108, 20, 42, door);
  for (const wx of [x + 14, x + w - 40]) {
    rect(c, wx - 2, top + 16, 30, 28, 'white');
    rect(c, wx, top + 18, 26, 24, 'sky');
    rect(c, wx + 12, top + 18, 2, 24, 'white');
  }
}

export function buildStreetArt(scene: Phaser.Scene, mailmanHead?: HTMLImageElement, mailmanMad?: HTMLImageElement): void {
  // mailboxes, shut and whacked, in two colours
  const styles: [Paper, Paper][] = [['grey', 'red'], ['red', 'yellow']];
  styles.forEach(([body, flag], i) => {
    makePaperArt(scene, `mailbox${i}`, 64, 48, (c) => mailbox(c, body, flag, false), { border: 2, ax: 34, ay: 47 });
    makePaperArt(scene, `mailbox${i}_hit`, 64, 48, (c) => mailbox(c, body, flag, true), { border: 2, ax: 34, ay: 47 });
  });
  makeNeck(scene, 'neck_post', '#9a6b3f');

  makePaperArt(scene, 'mailman', 64, 106, (c) => mailman(c, mailmanHead), { border: 2, ax: 32, ay: 106 });
  makePaperArt(scene, 'mailman_mad', 64, 106, (c) => mailman(c, mailmanMad ?? mailmanHead), { border: 2, ax: 32, ay: 106 });

  makePaperArt(scene, 'branch', 190, 212, tree, { border: 2.5, ax: 95, ay: 211 });
  makePaperArt(scene, 'bike', 212, 134, bike, { border: 2, ax: 106, ay: 132 });

  makePaperArt(scene, 'envelope', 18, 12, (c) => {
    rect(c, 0, 0, 18, 12, 'white');
    c.beginPath();
    c.moveTo(0.5, 0.5); c.lineTo(9, 7); c.lineTo(17.5, 0.5);
    c.strokeStyle = 'rgba(50, 40, 30, 0.55)';
    c.lineWidth = 0.8;
    c.stroke();
  }, { border: 0.8 });

  makeWord(scene, 'word_nicekid', 'NICE KID!', 'blue', 'white', 116, 24, 8);

  // the far side of the street, as strips that scroll past
  tile(scene, 'houses', 620, 150, (c) => {
    for (const [x, y, r] of [[196, 140, 20], [214, 146, 14], [410, 142, 18], [600, 144, 16], [8, 146, 14]]) {
      circle(c, x, y, r); fillPaper(c, 'green');
    }
    house(c, 26, 150, 'white', 'red', 'blue');
    house(c, 236, 158, 'yellow', 'grey', 'red');
    house(c, 436, 150, 'sky', 'black', 'yellow');
  });
  tile(scene, 'lawn', 64, 62, (c) => rect(c, 0, 0, 64, 62, 'green'));
  tile(scene, 'fence', 24, 40, (c) => {
    rect(c, 0, 13, 24, 4, 'white');
    rect(c, 0, 29, 24, 4, 'white');
    for (const x of [1, 13]) {
      glued(c, () => { poly(c, [x, 40, x, 8, x + 5, 1, x + 10, 8, x + 10, 40]); fillPaper(c, 'white'); });
    }
  });
  tile(scene, 'sidewalk', 96, 50, (c) => {
    rect(c, 0, 0, 96, 50, 'cream');
    c.fillStyle = 'rgba(70, 58, 44, 0.3)';
    c.fillRect(0, 0, 1.4, 50);
  });
  tile(scene, 'kerb', 64, 11, (c) => {
    const g = c.createLinearGradient(0, 6, 0, 11);
    g.addColorStop(0, 'rgba(24, 16, 10, 0.4)');
    g.addColorStop(1, 'rgba(24, 16, 10, 0)');
    c.fillStyle = g;
    c.fillRect(0, 6, 64, 5);
    rect(c, 0, 0, 64, 7, 'white');
    c.fillStyle = 'rgba(40, 34, 30, 0.14)';
    c.fillRect(0, 0, 64, 7);
  });
}
