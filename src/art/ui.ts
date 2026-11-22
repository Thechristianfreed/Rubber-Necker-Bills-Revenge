import Phaser from 'phaser';
import { Ctx, circle, poly, rr, star } from './sticker';
import {
  burstPath, cutText, fillPaper, glued, heartPath, makePaperArt, makeWord, paper, tapePath,
} from './paper';

/** The interface, hit words and road paint, all as cut paper. Built once the
 *  paper sheets have loaded. */

function tile(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void): void {
  makePaperArt(scene, key, w, h, draw, { border: 0, ax: 0, ay: 0 });
}

/** A round paper button: a coloured disc with a glued-on icon and lettering. */
function button(c: Ctx, disc: 'blue' | 'red' | 'grey', label: string, letters: 'white' | 'yellow' | 'cream', icon: (c: Ctx) => void): void {
  circle(c, 62, 62, 57);
  fillPaper(c, disc);
  glued(c, () => icon(c));
  cutText(c, label, 62, 89, 29, letters);
}

export function buildPaperUi(scene: Phaser.Scene): void {
  // hearts
  for (const [key, sheet] of [['heart', 'red'], ['heart_off', 'grey']] as const) {
    makePaperArt(scene, key, 30, 28, (c) => { heartPath(c, 30, 28); fillPaper(c, sheet); }, { border: 2 });
  }

  // sound on / off: a little paper disc with a cut-out speaker
  for (const on of [true, false]) {
    makePaperArt(scene, on ? 'snd_on' : 'snd_off', 36, 36, (c) => {
      circle(c, 18, 18, 17);
      fillPaper(c, 'cream');
      glued(c, () => {
        poly(c, [8, 14, 13, 14, 19, 9, 19, 27, 13, 22, 8, 22]);
        fillPaper(c, 'black');
      });
      c.lineCap = 'round';
      c.lineWidth = 2.4;
      if (on) {
        c.strokeStyle = paper(c, 'black');
        c.beginPath(); c.arc(19.5, 18, 5.5, -0.85, 0.85); c.stroke();
        c.beginPath(); c.arc(19.5, 18, 9.5, -0.85, 0.85); c.stroke();
      } else {
        c.strokeStyle = paper(c, 'red');
        c.beginPath(); c.moveTo(22, 13); c.lineTo(30, 23); c.moveTo(30, 13); c.lineTo(22, 23); c.stroke();
      }
    }, { border: 1.8 });
  }

  // DUCK and RAGE
  const chevron = (c: Ctx) => { poly(c, [40, 30, 62, 55, 84, 30, 84, 45, 62, 70, 40, 45]); fillPaper(c, 'white'); };
  const pow = (sheet: 'yellow' | 'cream') => (c: Ctx) => { burstPath(c, 62, 46, 30, 25, 10, 5); fillPaper(c, sheet); };
  makePaperArt(scene, 'btn_duck', 124, 124, (c) => button(c, 'blue', 'DUCK', 'white', chevron), { border: 3 });
  makePaperArt(scene, 'btn_rage', 124, 124, (c) => button(c, 'red', 'RAGE!', 'yellow', pow('yellow')), { border: 3 });
  makePaperArt(scene, 'btn_rage_off', 124, 124, (c) => button(c, 'grey', 'RAGE', 'cream', pow('cream')), { border: 3 });

  // strips of masking tape, and a price tag, to write on
  for (const [key, w, h] of [['tape_s', 78, 26], ['tape_m', 168, 30], ['tape_l', 470, 40]] as const) {
    makePaperArt(scene, key, w, h, (c) => { tapePath(c, 0, 0, w, h); fillPaper(c, 'cream'); }, { border: 0.8 });
  }
  makePaperArt(scene, 'tag', 96, 32, (c) => {
    poly(c, [12, 0, 96, 0, 96, 32, 12, 32, 0, 16]);
    fillPaper(c, 'manila');
    c.globalCompositeOperation = 'destination-out';
    circle(c, 12, 16, 3);
    c.fill();
  }, { border: 1.6, ax: 0, ay: 16 });

  // the jam meter: a paper trough, with strips that fill it
  makePaperArt(scene, 'meter', 312, 30, (c) => {
    rr(c, 0, 0, 312, 30, 5);
    fillPaper(c, 'cream');
    glued(c, () => { c.beginPath(); c.rect(6, 6, 300, 18); fillPaper(c, 'black'); });
  }, { border: 1.6 });
  tile(scene, 'meter_green', 32, 18, (c) => { c.beginPath(); c.rect(0, 0, 32, 18); fillPaper(c, 'green'); });
  tile(scene, 'meter_red', 32, 18, (c) => { c.beginPath(); c.rect(0, 0, 32, 18); fillPaper(c, 'red'); });

  // words that never change
  makeWord(scene, 'word_missed', 'MISSED!', 'grey', 'white', 104, 25, 2);
  makeWord(scene, 'word_dodged', 'DODGED!', 'blue', 'white', 108, 25, 3);
  makeWord(scene, 'word_clang', 'CLANG!', 'red', 'yellow', 112, 30, 4);
  makeWord(scene, 'word_goodboy', 'GOOD BOY!', 'green', 'white', 118, 24, 5);
  makeWord(scene, 'word_badbill', 'BAD BILL!', 'red', 'white', 122, 26, 6);
  makeWord(scene, 'word_roadrage', 'ROAD RAGE!', 'red', 'yellow', 330, 70, 7);

  // road paint: strips of paper laid on the tarmac, each with a hint of shadow
  const strip = (key: string, w: number, h: number, len: number, sheet: 'white' | 'yellow') =>
    tile(scene, key, w, h + 2, (c) => {
      c.fillStyle = 'rgba(24,16,10,0.32)';
      c.fillRect(1, 1.6, len, h);
      c.beginPath();
      c.rect(0, 0, len, h);
      fillPaper(c, sheet);
    });
  strip('dash', 110, 6, 52, 'white');
  strip('line_white', 64, 4, 64, 'white');
  strip('line_yellow', 64, 3, 64, 'yellow');

  // the grass verge: green paper with a zig-zag cut along the top
  tile(scene, 'grass', 64, 72, (c) => {
    c.fillStyle = 'rgba(24,16,10,0.3)';
    c.beginPath();
    c.moveTo(0, 7);
    for (let x = 0; x <= 64; x += 8) c.lineTo(x, x % 16 === 0 ? 7 : 1);
    c.lineTo(64, 72); c.lineTo(0, 72);
    c.fill();
    c.beginPath();
    c.moveTo(0, 9);
    for (let x = 0; x <= 64; x += 8) c.lineTo(x, x % 16 === 0 ? 9 : 3);
    c.lineTo(64, 72); c.lineTo(0, 72);
    c.closePath();
    fillPaper(c, 'green');
  });

  // the strike-zone ring, as a chalk-white dashed circle of paper bits
  makePaperArt(scene, 'zone', 84, 84, (c) => {
    c.setLineDash([9, 8]);
    circle(c, 42, 42, 36);
    c.strokeStyle = paper(c, 'white');
    c.lineWidth = 3.6;
    c.stroke();
  }, { border: 0 });

  void star;
}
