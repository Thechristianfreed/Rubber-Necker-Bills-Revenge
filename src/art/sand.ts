import Phaser from 'phaser';
import { burstPath, cutText, fillPaper, glued, heartPath, makePaperArt, makeWord, paper, strokePaper } from './paper';
import { Ctx, circle, ellipse, makeArt, poly, rr, star } from './sticker';

/** Cut-paper art for the day of the pocket sand: the sandbox and what is in
 *  it, a hand or two for the close-ups, and the words. These are stand-ins:
 *  any of them is replaced by a photo cutout registered under the same key
 *  (see photos.ts). The people are the same as for the bat (bat.ts). */

/** How big the sandbox is, and where in its picture the sand is level with the boys' feet. */
export const SANDBOX = { w: 400, h: 120, floor: 78 };

function speckle(c: Ctx, x0: number, y0: number, w: number, h: number, n: number, seed: number): void {
  let s = seed * 7919 + 13;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    c.fillStyle = i % 3 ? 'rgba(120, 84, 30, 0.3)' : 'rgba(255, 244, 210, 0.55)';
    circle(c, x0 + rnd() * w, y0 + rnd() * h, 0.8 + rnd() * 1.4);
    c.fill();
  }
}

export function buildSandArt(scene: Phaser.Scene): void {
  const { w, h } = SANDBOX;
  // the sandbox, seen a little from above: the frame and the sand; and its near plank on
  // its own, to go in front of whoever is standing in it
  makePaperArt(scene, 'sandbox', w, h, (c) => {
    glued(c, () => { poly(c, [34, 26, w - 34, 26, w - 4, h - 6, 4, h - 6]); fillPaper(c, 'brown'); });
    glued(c, () => { poly(c, [48, 38, w - 48, 38, w - 22, h - 22, 22, h - 22]); fillPaper(c, 'manila'); });
    c.save();
    poly(c, [48, 38, w - 48, 38, w - 22, h - 22, 22, h - 22]);
    c.clip();
    speckle(c, 20, 36, w - 40, h - 56, 150, 3);
    c.restore();
  }, { border: 2.4, ax: w / 2, ay: SANDBOX.floor });
  makePaperArt(scene, 'sandbox_front', w, 26, (c) => {
    glued(c, () => { poly(c, [3, 2, w - 3, 2, w - 1, 24, 1, 24]); fillPaper(c, 'brown'); });
    c.strokeStyle = 'rgba(60, 34, 10, 0.3)';
    c.lineWidth = 1.5;
    for (const y of [9, 17]) { c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y); c.stroke(); }
  }, { border: 2.2, ax: w / 2, ay: 2 - (h - 22 - SANDBOX.floor) });

  // the toys, and what gets made with them
  makePaperArt(scene, 'sand_shovel', 30, 70, (c) => {
    glued(c, () => strokePaper(c, [15, 8, 15, 42], 'yellow', 6));
    glued(c, () => { rr(c, 6, 0, 18, 9, 3); fillPaper(c, 'yellow'); });
    glued(c, () => { c.beginPath(); c.moveTo(3, 38); c.lineTo(27, 38); c.lineTo(25, 58); c.quadraticCurveTo(15, 72, 5, 58); c.closePath(); fillPaper(c, 'red'); });
  }, { border: 1.8, ax: 15, ay: 10 });
  makePaperArt(scene, 'sand_bucket', 54, 56, (c) => {
    c.beginPath(); c.arc(27, 22, 22, Math.PI, 0);
    c.strokeStyle = paper(c, 'yellow'); c.lineWidth = 4; c.stroke();
    glued(c, () => { poly(c, [5, 18, 49, 18, 43, 54, 11, 54]); fillPaper(c, 'blue'); });
    glued(c, () => { rr(c, 2, 14, 50, 8, 3); fillPaper(c, 'blue'); });
    star(c, 27, 37, 9, 4, 5); fillPaper(c, 'yellow');
  }, { border: 1.8, ax: 27, ay: 52 });
  makePaperArt(scene, 'sandcastle', 84, 62, (c) => {
    glued(c, () => {
      c.beginPath();
      c.moveTo(4, 62); c.lineTo(8, 30); c.lineTo(8, 22); c.lineTo(14, 22); c.lineTo(14, 27); c.lineTo(20, 27); c.lineTo(20, 22); c.lineTo(26, 22);
      c.lineTo(26, 34); c.lineTo(34, 34); c.lineTo(34, 8); c.lineTo(39, 8); c.lineTo(39, 13); c.lineTo(45, 13); c.lineTo(45, 8); c.lineTo(50, 8);
      c.lineTo(50, 34); c.lineTo(58, 34); c.lineTo(58, 22); c.lineTo(64, 22); c.lineTo(64, 27); c.lineTo(70, 27); c.lineTo(70, 22); c.lineTo(76, 22);
      c.lineTo(76, 30); c.lineTo(80, 62); c.closePath();
      fillPaper(c, 'manila');
    });
    speckle(c, 8, 12, 70, 48, 40, 5);
    c.beginPath(); c.arc(42, 62, 9, Math.PI, 0); c.fillStyle = 'rgba(60, 40, 10, 0.55)'; c.fill();
    glued(c, () => { poly(c, [42, 0, 54, 4, 42, 8]); fillPaper(c, 'red'); });
  }, { border: 1.8, ax: 42, ay: 60 });
  makePaperArt(scene, 'sand_heap', 80, 26, (c) => {
    glued(c, () => { c.beginPath(); c.moveTo(0, 26); c.quadraticCurveTo(14, 4, 34, 10); c.quadraticCurveTo(58, 0, 80, 26); c.closePath(); fillPaper(c, 'manila'); });
    speckle(c, 8, 8, 64, 16, 24, 7);
  }, { border: 1.6, ax: 40, ay: 24 });

  // sand in the air, and sand where it lands
  makeArt(scene, 'sand_speck', 10, 10, (c) => { circle(c, 5, 5, 4); fillPaper(c, 'manila'); c.fillStyle = 'rgba(120, 84, 30, 0.35)'; circle(c, 4, 4, 1.5); c.fill(); }, { border: 0.8 });
  makePaperArt(scene, 'sand_blob', 60, 44, (c) => {
    glued(c, () => { burstPath(c, 30, 22, 29, 21, 9, 21); fillPaper(c, 'manila'); });
    speckle(c, 8, 6, 44, 32, 30, 9);
  }, { border: 1.6 });
  makeArt(scene, 'sand_close', 128, 128, (c) => {
    c.beginPath(); c.rect(0, 0, 128, 128); fillPaper(c, 'manila');
    speckle(c, 0, 0, 128, 128, 170, 11);
  }, { border: 0, ax: 0, ay: 0 });

  // for the close-ups: a finger to wag, and a hand to take a handful
  makePaperArt(scene, 'mom_finger', 120, 210, (c) => {
    glued(c, () => { rr(c, 36, 120, 56, 90, 16); fillPaper(c, 'yellow'); });
    glued(c, () => { rr(c, 22, 70, 82, 76, 26); fillPaper(c, 'manila'); });
    glued(c, () => strokePaper(c, [48, 84, 44, 16], 'manila', 22));
    for (const [x, y] of [[70, 84], [86, 92], [98, 104]]) glued(c, () => { circle(c, x, y, 13); fillPaper(c, 'manila'); });
    glued(c, () => { ellipse(c, 30, 110, 13, 20, 0.5); fillPaper(c, 'manila'); });
  }, { border: 3, ax: 62, ay: 200 });
  makePaperArt(scene, 'mom_hand', 230, 170, (c) => {
    glued(c, () => { c.save(); c.translate(54, 40); c.rotate(0.5); rr(c, -30, -70, 60, 110, 18); fillPaper(c, 'yellow'); c.restore(); });
    glued(c, () => { ellipse(c, 112, 84, 58, 44, 0.35); fillPaper(c, 'manila'); });
    for (const [x, y, a] of [[150, 126, 0.9], [172, 108, 0.7], [186, 84, 0.45], [188, 58, 0.15]]) glued(c, () => { ellipse(c, x, y, 26, 12, a); fillPaper(c, 'manila'); });
    glued(c, () => { ellipse(c, 96, 128, 24, 12, 1.2); fillPaper(c, 'manila'); });
  }, { border: 3, ax: 150, ay: 110 });

  makePaperArt(scene, 'heart', 30, 28, (c) => { glued(c, () => { heartPath(c, 30, 28); fillPaper(c, 'red'); }); }, { border: 1.4 });
  makeArt(scene, 'sparkle', 44, 44, (c) => {
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 5 : 21;
      c.lineTo(22 + Math.cos(a) * r, 22 + Math.sin(a) * r);
    }
    c.closePath();
    c.fillStyle = '#ffffff';
    c.shadowColor = 'rgba(255, 244, 150, 0.95)';
    c.shadowBlur = 8;
    c.fill();
  }, { border: 0 });
  makePaperArt(scene, 'tear', 16, 24, (c) => {
    glued(c, () => { c.beginPath(); c.moveTo(8, 0); c.quadraticCurveTo(18, 16, 8, 23); c.quadraticCurveTo(-2, 16, 8, 0); c.closePath(); fillPaper(c, 'sky'); });
  }, { border: 1.2 });
  // a choice that is no longer on offer
  makeArt(scene, 'choice_x', 120, 70, (c) => {
    glued(c, () => { strokePaper(c, [8, 8, 112, 62], 'red', 13); strokePaper(c, [112, 8, 8, 62], 'red', 13); });
  }, { border: 2.2 });
  // who the player is, for now
  makePaperArt(scene, 'you_are', 250, 44, (c) => { glued(c, () => { poly(c, [4, 3, 248, 0, 246, 41, 0, 44]); fillPaper(c, 'blue'); }); }, { border: 2.2 });

  makeWord(scene, 'word_pocketsand', 'POCKET SAND!', 'yellow', 'red', 470, 82, 71);
  makeWord(scene, 'word_youdidit', 'YOU DID IT!', 'blue', 'yellow', 440, 92, 72);
  makeWord(scene, 'word_dawww', 'DAWWW...', 'red', 'white', 230, 46, 73);
  // (lettering for the choices is put on at the time: see SandMini)
  void cutText;
}
