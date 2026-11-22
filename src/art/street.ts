import Phaser from 'phaser';
import { Ctx, circle, ellipse, poly, rr } from './sticker';
import { Paper, fillPaper, glued, makePaperArt, makeWord, strokePaper } from './paper';

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

/** A mailbox on its post, seen from the side, on a 64 x 102 canvas: door at
 *  the left, flag on the side. `delivered` has a newspaper in it and the flag up. */
function mailbox(c: Ctx, body: Paper, flag: Paper, delivered: boolean): void {
  rect(c, 30, 44, 8, 58, 'brown');
  if (delivered) {
    // the door has dropped open and there is a rolled-up paper in the box
    glued(c, () => { poly(c, [12, 46, 0, 41, 2, 32, 13, 37]); fillPaper(c, 'black'); });
    c.save();
    c.translate(10, 30);
    c.rotate(-0.18);
    glued(c, () => { rr(c, -12, -5, 26, 10, 5); fillPaper(c, 'white'); });
    c.fillStyle = 'rgba(40, 34, 30, 0.35)';
    for (const x of [-7, -2, 3, 8]) c.fillRect(x, -3, 1, 6);
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
  rect(c, 12, delivered ? 21 : 19, delivered ? 7 : 4, delivered ? 25 : 27, 'black');
  glued(c, () => {
    if (delivered) {
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

/** A street tree with a canopy low enough to clip a kid on a bike (190 x 252). */
function tree(c: Ctx): void {
  poly(c, [84, 252, 106, 252, 101, 110, 89, 110]);
  fillPaper(c, 'brown');
  const blobs: [number, number, number][] = [[34, 88, 32], [142, 78, 40], [55, 62, 46], [105, 52, 50], [92, 92, 42]];
  for (const [x, y, r] of blobs) { circle(c, x, y, r); fillPaper(c, 'green'); }
  // a little depth: shade underneath, light on top
  c.fillStyle = 'rgba(16, 48, 20, 0.2)';
  for (const [x, y, r] of blobs) { c.beginPath(); c.arc(x, y + r * 0.2, r * 0.82, 0.15, Math.PI - 0.15); c.fill(); }
  c.fillStyle = 'rgba(255, 255, 230, 0.12)';
  for (const [x, y, r] of blobs.slice(2)) { circle(c, x - r * 0.25, y - r * 0.35, r * 0.4); c.fill(); }
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
  // mailboxes on their posts, waiting and delivered, in two colours
  const styles: [Paper, Paper][] = [['grey', 'red'], ['red', 'yellow']];
  styles.forEach(([body, flag], i) => {
    makePaperArt(scene, `mailbox${i}`, 64, 102, (c) => mailbox(c, body, flag, false), { border: 2, ax: 34, ay: 101 });
    makePaperArt(scene, `mailbox${i}_hit`, 64, 102, (c) => mailbox(c, body, flag, true), { border: 2, ax: 34, ay: 101 });
  });

  makePaperArt(scene, 'mailman', 64, 106, (c) => mailman(c, mailmanHead), { border: 2, ax: 32, ay: 106 });
  makePaperArt(scene, 'mailman_mad', 64, 106, (c) => mailman(c, mailmanMad ?? mailmanHead), { border: 2, ax: 32, ay: 106 });

  makePaperArt(scene, 'branch', 190, 252, tree, { border: 2.5, ax: 95, ay: 251 });

  // what pops up when a paper lands
  makeWord(scene, 'word_delivered', 'DELIVERED!', 'blue', 'white', 122, 24, 9);
  makeWord(scene, 'word_nicetoss', 'NICE TOSS!', 'yellow', 'red', 118, 25, 10);
  makeWord(scene, 'word_inthebox', 'IN THE BOX!', 'red', 'yellow', 124, 24, 11);
  makeWord(scene, 'word_nicekid', 'NICE KID!', 'blue', 'white', 116, 24, 8);
  makeWord(scene, 'word_extra', 'EXTRA! EXTRA!', 'red', 'yellow', 340, 62, 12);

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
