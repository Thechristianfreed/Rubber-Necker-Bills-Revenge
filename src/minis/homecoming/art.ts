import Phaser from 'phaser';
import { Doll, Look, doll } from '../../art/fight';
import { Paper, cutText, fillPaper, glued, heartPath, makePaperArt, makeWord, paper, strokePaper } from '../../art/paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from '../../art/sticker';
import { BODIES, DOOR, KNOB, LOCK } from './layout';

/** The paper stand-ins for "Pappy comes home": what is on the page until there is
 *  a photo (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "homecoming_" (a word on a burst: "word_homecoming_...").
 *  The game cannot make a picture by any other name, or draw over one that is not
 *  its own.
 *
 *  The two of them are a body and a head apart: the heads are their real faces
 *  (everybody's set, docs/characters.md), hung on by the chin. The paper heads
 *  here are only for a page that could not fetch its photos. */

type V = [number, number];

/** A wash of colour over the shape that has just been filled with paper. */
function wash(c: Ctx, colour: string): void {
  c.fillStyle = colour;
  c.fill();
}

function box(c: Ctx, x: number, y: number, w: number, h: number, sheet: Paper): void {
  c.beginPath();
  c.rect(x, y, w, h);
  fillPaper(c, sheet);
}

function stroke(c: Ctx, draw: () => void, colour: string | CanvasPattern, w: number): void {
  c.beginPath();
  draw();
  c.strokeStyle = colour;
  c.lineWidth = w;
  c.lineCap = 'round';
  c.stroke();
}

/** Skin is manila paper; Pappy has had more sun than that. */
const RUDDY = 'rgba(214, 96, 70, 0.26)';
const DARK = '#241a14';
const BRASS = 'rgba(150, 90, 10, 0.28)';

const skin = (c: Ctx, ruddy = false) => {
  fillPaper(c, 'manila');
  if (ruddy) wash(c, RUDDY);
};

/** A small heart, its middle at (x, y). */
function heartAt(c: Ctx, x: number, y: number, size: number, turn = 0): void {
  c.save();
  c.translate(x, y);
  c.rotate(turn);
  c.translate(-size / 2, -size / 2);
  heartPath(c, size, size * 0.92);
  fillPaper(c, 'red');
  c.restore();
}

// ---- the front of the house ---------------------------------------------------------------------

function porch(scene: Phaser.Scene): void {
  // clapboards, and the boards of the porch
  makePaperArt(scene, 'homecoming_siding', 64, 44, (c) => {
    box(c, 0, 0, 64, 44, 'cream');
    for (const y of [0, 22]) {
      c.fillStyle = 'rgba(90, 70, 40, 0.24)';
      c.fillRect(0, y + 19, 64, 3);
      c.fillStyle = 'rgba(255, 255, 255, 0.5)';
      c.fillRect(0, y, 64, 2);
    }
  }, { border: 0, ax: 0, ay: 0 });
  makePaperArt(scene, 'homecoming_boards', 96, 64, (c) => {
    box(c, 0, 0, 96, 64, 'grey');
    c.fillStyle = 'rgba(255, 255, 255, 0.22)';
    c.fillRect(0, 0, 96, 64);
    c.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (const x of [0, 32, 64]) c.fillRect(x, 0, 2.5, 64);
    c.fillRect(0, 0, 96, 5);
  }, { border: 0, ax: 0, ay: 0 });

  // the doorway: its frame, and the dark of the hall behind the door
  const F = DOOR.frame, fw = DOOR.w + F * 2, fh = DOOR.h + F;
  makePaperArt(scene, 'homecoming_doorway', fw, fh, (c) => {
    glued(c, () => box(c, 0, 0, fw, fh, 'white'));
    box(c, F, F, DOOR.w, DOOR.h, 'black');
    wash(c, 'rgba(60, 30, 90, 0.3)');
    // a strip of hall carpet, and the skirting, to give the dark a floor
    c.fillStyle = 'rgba(150, 110, 90, 0.2)';
    c.fillRect(F, fh - 64, DOOR.w, 64);
    c.fillStyle = 'rgba(255, 255, 255, 0.08)';
    c.fillRect(F, fh - 70, DOOR.w, 6);
  }, { border: 2.2, ax: fw / 2, ay: fh });

  // the door: six panels, a brass lock and knob on the side he can reach, and a sign that means well
  makePaperArt(scene, 'homecoming_door', DOOR.w, DOOR.h, (c) => {
    box(c, 0, 0, DOOR.w, DOOR.h, 'green');
    wash(c, 'rgba(10, 40, 20, 0.34)');
    for (const [x, y, w, h] of [[26, 110, 80, 96], [130, 110, 80, 96], [26, 228, 80, 96], [130, 228, 80, 96], [26, 346, 80, 68], [130, 346, 80, 68]]) {
      c.fillStyle = 'rgba(0, 0, 0, 0.2)';
      c.fillRect(x, y, w, h);
      c.fillStyle = 'rgba(255, 255, 255, 0.14)';
      c.fillRect(x + 4, y + 5, w - 4, h - 5);
      c.fillStyle = 'rgba(0, 0, 0, 0.1)';
      c.fillRect(x + 4, y + 5, w - 8, h - 10);
    }
    glued(c, () => { rr(c, 43, 34, 150, 46, 6); fillPaper(c, 'cream'); });
    cutText(c, 'HOME SWEET HOME', DOOR.w / 2, 58, 19, 'red');
    // (the lock, with its keyhole; and the knob)
    glued(c, () => { circle(c, LOCK[0], LOCK[1], 15); fillPaper(c, 'yellow'); wash(c, BRASS); });
    c.fillStyle = DARK;
    c.fillRect(LOCK[0] - 1.8, LOCK[1] - 8, 3.6, 16);
    glued(c, () => { rr(c, KNOB[0] - 16, KNOB[1] - 24, 32, 62, 8); fillPaper(c, 'yellow'); wash(c, BRASS); });
    glued(c, () => { circle(c, KNOB[0], KNOB[1], 14); fillPaper(c, 'yellow'); });
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    circle(c, KNOB[0] - 4, KNOB[1] - 5, 4);
    c.fill();
    // a letter slot, low down
    glued(c, () => { rr(c, 78, 326, 80, 13, 3); fillPaper(c, 'yellow'); wash(c, BRASS); });
  }, { border: 2.2, ax: DOOR.w, ay: DOOR.h });

  makePaperArt(scene, 'homecoming_mat', 250, 34, (c) => {
    glued(c, () => { poly(c, [16, 0, 234, 0, 250, 34, 0, 34]); fillPaper(c, 'brown'); });
    cutText(c, 'WELCOME', 125, 18, 23, 'cream');
  }, { border: 2 });

  // the porch light, and what it throws on the wall
  makePaperArt(scene, 'homecoming_lamp', 50, 84, (c) => {
    glued(c, () => { box(c, 21, 0, 8, 22, 'black'); poly(c, [8, 22, 42, 22, 50, 34, 0, 34]); fillPaper(c, 'black'); });
    glued(c, () => { poly(c, [5, 34, 45, 34, 38, 72, 12, 72]); fillPaper(c, 'yellow'); wash(c, 'rgba(255, 255, 255, 0.35)'); });
    glued(c, () => { box(c, 10, 72, 30, 6, 'black'); box(c, 21, 78, 8, 6, 'black'); });
    c.fillStyle = 'rgba(0, 0, 0, 0.6)';
    c.fillRect(24, 34, 2, 38);
  }, { border: 2 });
  makeArt(scene, 'homecoming_glow', 360, 360, (c) => {
    const g = c.createRadialGradient(180, 180, 6, 180, 180, 180);
    g.addColorStop(0, 'rgba(255, 232, 150, 0.72)');
    g.addColorStop(0.4, 'rgba(255, 220, 130, 0.26)');
    g.addColorStop(1, 'rgba(255, 220, 130, 0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 360, 360);
  });

  // a window with the light on behind the curtains: somebody is still up
  makePaperArt(scene, 'homecoming_window', 140, 170, (c) => {
    glued(c, () => box(c, 0, 0, 140, 170, 'white'));
    box(c, 10, 10, 120, 150, 'yellow');
    wash(c, 'rgba(255, 255, 255, 0.3)');
    for (const side of [0, 1]) {
      glued(c, () => {
        const x = side ? 130 : 10, way = side ? -1 : 1;
        c.beginPath();
        c.moveTo(x, 10);
        c.lineTo(x + way * 52, 10);
        c.quadraticCurveTo(x + way * 40, 96, x + way * 8, 160);
        c.lineTo(x, 160);
        c.closePath();
        fillPaper(c, 'white');
        wash(c, 'rgba(230, 140, 150, 0.22)');
      });
    }
    box(c, 66, 10, 8, 150, 'white');
    box(c, 10, 80, 120, 8, 'white');
  }, { border: 2.2 });
}

// ---- Pappy, from behind; his hand; his keys -----------------------------------------------------

function keys(scene: Phaser.Scene): void {
  // the back of his head and his shoulders, as near as the camera gets
  makePaperArt(scene, 'homecoming_pappy_back', 440, 340, (c) => {
    glued(c, () => {
      c.beginPath();
      c.moveTo(4, 340);
      c.quadraticCurveTo(8, 226, 98, 198);
      c.lineTo(170, 172);
      c.lineTo(270, 172);
      c.lineTo(342, 198);
      c.quadraticCurveTo(432, 226, 436, 340);
      c.closePath();
      fillPaper(c, 'red');
    });
    stroke(c, () => { c.moveTo(220, 200); c.lineTo(220, 340); }, 'rgba(0, 0, 0, 0.16)', 3);
    glued(c, () => {
      c.beginPath();
      c.moveTo(158, 180);
      c.quadraticCurveTo(220, 204, 282, 180);
      c.lineTo(278, 158);
      c.quadraticCurveTo(220, 180, 162, 158);
      c.closePath();
      fillPaper(c, 'white');
    });
    glued(c, () => { rr(c, 178, 112, 84, 66, 18); skin(c, true); });
    for (const x of [136, 304]) glued(c, () => { ellipse(c, x, 100, 15, 25); skin(c, true); });
    glued(c, () => { ellipse(c, 220, 94, 84, 92); skin(c, true); });
    // white hair, combed back: thick on top, cut straight above his collar, a little thin at the crown
    glued(c, () => {
      c.beginPath();
      c.moveTo(132, 112);
      c.bezierCurveTo(112, -36, 328, -36, 308, 112);
      c.quadraticCurveTo(304, 134, 286, 142);
      c.quadraticCurveTo(220, 156, 154, 142);
      c.quadraticCurveTo(136, 134, 132, 112);
      c.closePath();
      fillPaper(c, 'white');
      wash(c, 'rgba(120, 126, 140, 0.2)');
    });
    c.save();
    c.beginPath();
    c.moveTo(132, 112);
    c.bezierCurveTo(112, -36, 328, -36, 308, 112);
    c.quadraticCurveTo(304, 134, 286, 142);
    c.quadraticCurveTo(220, 156, 154, 142);
    c.quadraticCurveTo(136, 134, 132, 112);
    c.clip();
    // (every strand starts at the crown and goes its own way down)
    for (let k = -5; k <= 5; k++) {
      const end = 220 + k * 18 + (k % 2 ? 5 : -3), low = 152 - Math.abs(k) * 2.4;
      stroke(c, () => { c.moveTo(224 + k * 3, 36); c.quadraticCurveTo(222 + k * 21, 84 + (k % 2 ? 8 : 0), end, low); }, 'rgba(84, 92, 108, 0.2)', 2.6);
    }
    for (const k of [-4, -2, 0, 2, 4]) {
      stroke(c, () => { c.moveTo(224 + k * 3, 34); c.quadraticCurveTo(224 + k * 22, 10, 220 + k * 19, -4); }, 'rgba(84, 92, 108, 0.14)', 2.4);
    }
    ellipse(c, 224, 37, 15, 10);
    c.fillStyle = 'rgba(214, 150, 120, 0.22)';
    c.fill();
    c.restore();
  }, { border: 2.6, ax: 220, ay: 340 });

  // his hand, with one key out in front of it: held by the tip of the key
  makePaperArt(scene, 'homecoming_hand_key', 230, 330, (c) => {
    c.translate(80, 0);
    glued(c, () => strokePaper(c, [-70, 336, 56, 140], 'red', 58));
    glued(c, () => strokePaper(c, [52, 146, 60, 134], 'white', 54));
    // the key: its bow is in his fist
    glued(c, () => { strokePaper(c, [84, 104, 132, 18], 'yellow', 9); strokePaper(c, [110, 68, 118, 73], 'yellow', 7); strokePaper(c, [118, 52, 127, 57], 'yellow', 7); });
    glued(c, () => { ellipse(c, 78, 116, 31, 27, -0.5); skin(c, true); });
    glued(c, () => { ellipse(c, 92, 100, 13, 9, -1.0); skin(c, true); });
    for (const k of [0, 1, 2]) stroke(c, () => { c.moveTo(62 + k * 10, 126 + k * 6); c.lineTo(72 + k * 10, 110 + k * 6); }, 'rgba(120, 50, 30, 0.4)', 2);
  }, { border: 2.4, ax: 212, ay: 18 });

  // the ring, and the tag the grandchildren gave him: held where the keys hang from
  makePaperArt(scene, 'homecoming_ring', 190, 120, (c) => {
    c.save();
    c.translate(52, 30);
    c.rotate(-0.24);
    glued(c, () => { rr(c, -44, -17, 88, 34, 6); fillPaper(c, 'red'); });
    cutText(c, '#1 PAPPY', -3, 1, 19, 'white');
    c.restore();
    stroke(c, () => { c.moveTo(92, 36); c.lineTo(104, 44); }, paper(c, 'grey'), 5);
    glued(c, () => {
      c.beginPath();
      c.arc(128, 64, 31, 0, Math.PI * 2);
      c.strokeStyle = paper(c, 'grey');
      c.lineWidth = 8;
      c.stroke();
    });
    stroke(c, () => { c.arc(128, 64, 33, Math.PI * 1.1, Math.PI * 1.6); }, 'rgba(255, 255, 255, 0.6)', 2.5);
  }, { border: 2.2, ax: 128, ay: 95 });

  // three keys, each held by the hole it hangs from, pointing down
  const hole = (c: Ctx) => {
    c.save();
    c.globalCompositeOperation = 'destination-out';
    circle(c, 32, 24, 7);
    c.fill();
    c.restore();
  };
  const blade = (c: Ctx, sheet: Paper, teeth: number[]) => {
    const pts = [26, 48, 38, 48];
    teeth.forEach((deep, i) => pts.push(38 + deep, 84 + i * 14, 38 + deep, 96 + i * 14));
    pts.push(38, 84 + teeth.length * 14, 38, 170, 32, 184, 26, 170);
    poly(c, pts);
    fillPaper(c, sheet);
  };
  makePaperArt(scene, 'homecoming_key0', 64, 190, (c) => {
    glued(c, () => { circle(c, 32, 28, 25); fillPaper(c, 'yellow'); wash(c, BRASS); blade(c, 'yellow', [10, 4, 12, 6, 9]); wash(c, BRASS); });
    hole(c);
    stroke(c, () => { c.moveTo(32, 60); c.lineTo(32, 168); }, 'rgba(90, 50, 0, 0.3)', 2);
  }, { border: 2.2, ax: 32, ay: 24 });
  makePaperArt(scene, 'homecoming_key1', 64, 190, (c) => {
    glued(c, () => { rr(c, 8, 4, 48, 48, 9); fillPaper(c, 'grey'); wash(c, 'rgba(255, 255, 255, 0.5)'); blade(c, 'grey', [5, 12, 5, 12, 4]); wash(c, 'rgba(255, 255, 255, 0.5)'); });
    hole(c);
    stroke(c, () => { c.moveTo(32, 60); c.lineTo(32, 168); }, 'rgba(0, 0, 0, 0.22)', 2);
  }, { border: 2.2, ax: 32, ay: 24 });
  makePaperArt(scene, 'homecoming_key2', 64, 190, (c) => {
    glued(c, () => { blade(c, 'yellow', [12, 9, 4, 11, 6]); wash(c, BRASS); });
    glued(c, () => { poly(c, [32, 0, 56, 12, 56, 44, 32, 56, 8, 44, 8, 12]); fillPaper(c, 'blue'); });
    hole(c);
    stroke(c, () => { c.moveTo(32, 62); c.lineTo(32, 168); }, 'rgba(90, 50, 0, 0.3)', 2);
  }, { border: 2.2, ax: 32, ay: 24 });

  // the arrow that says what to do, and a plain one for later
  makePaperArt(scene, 'homecoming_arrow', 372, 112, (c) => {
    glued(c, () => { poly(c, [0, 24, 274, 24, 274, 0, 372, 56, 274, 112, 274, 88, 0, 88]); fillPaper(c, 'yellow'); });
    cutText(c, 'CHOOSE THE RIGHT KEY', 160, 58, 31, 'red');
  }, { border: 3.2 });
  makePaperArt(scene, 'homecoming_point', 110, 76, (c) => {
    glued(c, () => { poly(c, [0, 22, 58, 22, 58, 0, 110, 38, 58, 76, 58, 54, 0, 54]); fillPaper(c, 'yellow'); });
  }, { border: 3 });
}

// ---- the two of them ----------------------------------------------------------------------------

/** A doll's head joint, for the neck to point at: 25 up from the chin, along the tilt. */
function crown(body: string): V {
  const { chin, tilt } = BODIES[body];
  return [chin[0] + Math.sin(tilt) * 25, chin[1] - Math.cos(tilt) * 25];
}

const PAPPY: Look = { skin: 'manila', top: 'red', legs: 'grey', arm: 13, leg: 18 };
const MAMMY: Look = { skin: 'manila', top: 'sky', arm: 12, leg: 15 };

const PAPPY_POSES: Record<string, Doll> = {
  // hat in his hands
  stand: {
    hips: [[-12, -112], [12, -112]], knees: [[-13, -56], [13, -56]], feet: [[-16, 0], [16, 0]],
    shoulders: [[-26, -184], [26, -184]], elbows: [[-34, -146], [34, -146]], hands: [[-10, -120], [12, -120]],
    head: crown('pappy_stand'), tilt: 0,
  },
  // on his knees, hands together
  kneel: {
    hips: [[-10, -56], [4, -56]], knees: [[4, -8], [18, -8]], feet: [[-50, -6], [-36, -6]],
    shoulders: [[-8, -124], [20, -122]], elbows: [[24, -96], [36, -98]], hands: [[46, -116], [50, -112]],
    head: crown('pappy_kneel'), tilt: 0.06,
  },
  // ...and leaning in, arms out behind him
  smooch: {
    hips: [[-12, -46], [2, -46]], knees: [[4, -8], [18, -8]], feet: [[-50, -6], [-36, -6]],
    shoulders: [[22, -90], [40, -94]], elbows: [[-4, -78], [10, -72]], hands: [[-30, -62], [-18, -54]],
    head: crown('pappy_smooch'), tilt: 0.38,
  },
};

const MAMMY_STAND: Doll = {
  hips: [[-16, -112], [16, -112]], knees: [[-14, -56], [14, -56]], feet: [[-16, 0], [16, 0]],
  shoulders: [[-30, -184], [30, -184]], elbows: [[-56, -150], [56, -150]], hands: [[-24, -120], [24, -120]],
  head: crown('mammy_stand'), tilt: 0,
};

/** A fluffy slipper, toe to the right. */
function slipper(c: Ctx, x: number, y: number): void {
  glued(c, () => { ellipse(c, x + 7, y - 5, 17, 8); fillPaper(c, 'red'); });
  glued(c, () => { circle(c, x + 17, y - 10, 5.5); fillPaper(c, 'white'); });
}

/** Mammy, standing: hands on her hips, in her housecoat and slippers. */
function mammyStand(c: Ctx): void {
  dressed(c, MAMMY_STAND, MAMMY, 0.8);
  // the skirt of the housecoat, over her knees; a row of buttons; her collar
  glued(c, () => { poly(c, [-25, -108, 25, -108, 36, -40, -36, -40]); fillPaper(c, 'sky'); });
  for (const y of [-170, -150, -130, -104, -82, -60]) { circle(c, 0, y, 2.6); fillPaper(c, 'white'); }
  glued(c, () => { strokePaper(c, [-16, -188, 0, -176, 16, -188], 'white', 6); });
  for (const x of [-16, 16]) slipper(c, x - 8, 2);
}

/** Mammy, bent over with her back to him: one hand on her knee, the other holding the hem of her
 *  housecoat up out of the way of a large pair of bloomers. She faces right. */
function mammyBent(c: Ctx): void {
  const limb = (pts: number[], sheet: Paper, w: number) => glued(c, () => strokePaper(c, pts, sheet, w));
  // her legs, the far one first, and the slippers on them
  const legs: [V, V, V][] = [[[-12, -104], [6, -56], [12, -4]], [[-30, -104], [-14, -54], [-8, -4]]];
  for (const [hip, knee, foot] of legs) {
    limb([...hip, ...knee, ...foot], 'manila', 15);
    slipper(c, foot[0] - 4, foot[1] + 5);
  }
  // the far arm, down to her knee
  limb([66, -150, 56, -104, 22, -66], 'sky', 13);
  glued(c, () => { circle(c, 22, -66, 8.5); skin(c); });
  // her back
  glued(c, () => { poly(c, [-32, -150, -6, -168, 60, -188, 86, -170, 80, -146, 40, -126, 2, -110, -24, -114]); fillPaper(c, 'sky'); });
  // the bloomers: down each leg to a frill, and then the rest of them
  for (const [hip, knee] of legs) {
    const cuff: V = [hip[0] + (knee[0] - hip[0]) * 0.56, hip[1] + (knee[1] - hip[1]) * 0.56];
    limb([...hip, ...cuff], 'white', 25);
    glued(c, () => { for (const dx of [-11, -4, 4, 11]) { circle(c, cuff[0] + dx, cuff[1] + 5, 5.5); fillPaper(c, 'white'); } });
  }
  const cheeks: [number, number, number][] = [[-18, -126, 40], [-40, -124, 42]];
  for (const [x, y, r] of cheeks) glued(c, () => { circle(c, x, y, r); fillPaper(c, 'white'); });
  // (hearts all over them, and the seam)
  c.save();
  c.beginPath();
  for (const [x, y, r] of cheeks) { c.moveTo(x + r, y); c.arc(x, y, r - 2, 0, Math.PI * 2); }
  c.clip();
  for (const [x, y, turn] of [[-58, -146, -0.3], [-30, -152, 0.2], [-2, -140, 0.4], [-44, -122, 0.1], [-16, -116, -0.2], [-62, -104, 0.3], [-34, -94, -0.1], [-6, -98, 0.25], [8, -118, -0.4]]) {
    heartAt(c, x, y, 13, turn);
  }
  c.restore();
  stroke(c, () => { c.arc(-40, -124, 42, -1.25, 0.95); }, 'rgba(60, 40, 70, 0.22)', 2.2);
  // the hem of the housecoat, thrown up over her back, and the arm that holds it there
  glued(c, () => {
    poly(c, [-34, -150, -46, -186, -26, -208, 6, -206, 30, -192, 46, -172, 24, -154, -6, -146]);
    fillPaper(c, 'sky');
    wash(c, 'rgba(255, 255, 255, 0.34)');
  });
  for (const [x, y] of [[-46, -186], [-36, -198], [-24, -207], [-10, -208], [6, -206], [20, -198]]) {
    glued(c, () => { circle(c, x, y, 6.5); fillPaper(c, 'white'); });
  }
  limb([64, -166, 36, -196, 8, -196], 'sky', 13);
  glued(c, () => { circle(c, 8, -196, 8.5); skin(c); });
  // her neck, up to where her head goes
  const head = crown('mammy_bent');
  strokePaper(c, [72, -168, head[0] - 4, head[1] + 16], 'manila', 16);
}

/** Mammy in the doorway, from the waist up: arms folded round a rolling pin. */
function mammyDoor(c: Ctx): void {
  const sleeve = (pts: number[]) => glued(c, () => strokePaper(c, pts, 'sky', 46));
  glued(c, () => { rr(c, -23, -268, 46, 50, 12); skin(c); });
  glued(c, () => {
    c.beginPath();
    c.moveTo(-124, 0);
    c.lineTo(-114, -186);
    c.quadraticCurveTo(-110, -230, -64, -234);
    c.lineTo(64, -234);
    c.quadraticCurveTo(110, -230, 114, -186);
    c.lineTo(124, 0);
    c.closePath();
    fillPaper(c, 'sky');
  });
  // quilting
  c.save();
  c.beginPath();
  c.rect(-116, -230, 232, 230);
  c.clip();
  for (let k = -12; k < 14; k++) {
    stroke(c, () => { c.moveTo(k * 34, -240); c.lineTo(k * 34 + 240, 0); }, 'rgba(30, 70, 130, 0.14)', 2);
    stroke(c, () => { c.moveTo(k * 34, -240); c.lineTo(k * 34 - 240, 0); }, 'rgba(30, 70, 130, 0.14)', 2);
  }
  c.restore();
  // her collar, open at the neck
  glued(c, () => { poly(c, [-24, -236, 24, -236, 0, -192]); skin(c); });
  glued(c, () => strokePaper(c, [-30, -240, 0, -188, 30, -240], 'white', 11));
  // her arms; the rolling pin; and the hand that has hold of it
  sleeve([-98, -204, -136, -128, -84, -138]);
  sleeve([98, -204, 136, -122, 52, -136]);
  glued(c, () => { circle(c, 46, -140, 19); skin(c); });
  glued(c, () => strokePaper(c, [-96, -146, 118, -186], 'brown', 12));
  glued(c, () => { strokePaper(c, [-58, -153, 82, -179], 'manila', 34); });
  stroke(c, () => { c.moveTo(-52, -164); c.lineTo(76, -188); }, 'rgba(255, 255, 255, 0.4)', 4);
  glued(c, () => { circle(c, -80, -148, 19); skin(c); });
  for (const k of [0, 1, 2]) stroke(c, () => { c.moveTo(-90 + k * 9, -160 + k * 2); c.lineTo(-88 + k * 9, -138 + k * 2); }, 'rgba(120, 50, 30, 0.35)', 2);
}

/** A paper head, for a page with no photos: 80 from the top of the hair to the chin, the chin at
 *  (0, 0). Mammy's hair is red and down to her shoulders; Pappy's is white, and so is his moustache. */
function paperHead(c: Ctx, who: 'mammy' | 'pappy', mood: 'mad' | 'glad' | 'sorry'): void {
  const line = (draw: () => void, w = 2.6) => stroke(c, draw, DARK, w);
  if (who === 'mammy') {
    glued(c, () => {
      ellipse(c, 0, -40, 46, 44);
      fillPaper(c, 'red');
      wash(c, 'rgba(255, 150, 20, 0.38)');
      for (const s of [-1, 1]) { ellipse(c, s * 36, -4, 15, 26); fillPaper(c, 'red'); wash(c, 'rgba(255, 150, 20, 0.38)'); }
    });
  } else {
    glued(c, () => { ellipse(c, 0, -44, 36, 38); fillPaper(c, 'white'); wash(c, 'rgba(120, 126, 140, 0.16)'); });
  }
  glued(c, () => { ellipse(c, 0, -34, 30, 34); skin(c, who === 'pappy'); });
  if (who === 'mammy') {
    // her fringe
    c.save();
    ellipse(c, 0, -34, 30, 34);
    c.clip();
    ellipse(c, -4, -70, 34, 20);
    fillPaper(c, 'red');
    wash(c, 'rgba(255, 150, 20, 0.38)');
    c.restore();
  }
  for (const s of [-1, 1]) {
    const x = s * 11, y = -40;
    if (mood === 'glad') line(() => { c.arc(x, y + 2, 4.4, Math.PI * 1.1, Math.PI * 1.9); });
    else { circle(c, x, y, 3.2); c.fillStyle = DARK; c.fill(); }
    if (mood === 'mad') line(() => { c.moveTo(s * 18, -53); c.lineTo(s * 5, -47); }, 3.2);
    else if (mood === 'sorry') line(() => { c.moveTo(s * 18, -47); c.lineTo(s * 6, -52); });
    else line(() => { c.moveTo(s * 17, -51); c.lineTo(s * 6, -52); }, 2);
  }
  if (mood === 'mad') { ellipse(c, 0, -17, 10, 9); c.fillStyle = DARK; c.fill(); ellipse(c, 0, -12, 6, 3.5); c.fillStyle = '#d8523f'; c.fill(); }
  else if (mood === 'glad') line(() => { c.moveTo(-10, -20); c.quadraticCurveTo(0, -10, 10, -20); });
  else line(() => { c.moveTo(-8, -15); c.quadraticCurveTo(0, -20, 8, -15); });
  if (who === 'pappy') {
    glued(c, () => { ellipse(c, -9, -25, 11, 5, 0.25); fillPaper(c, 'white'); ellipse(c, 9, -25, 11, 5, -0.25); fillPaper(c, 'white'); });
  }
}

/** A doll with sleeves: the paper doll's arms are bare, so the top is drawn down each of them, so
 *  far towards the hand. */
function dressed(c: Ctx, p: Doll, look: Look, sleeve: number): void {
  doll(c, p, look);
  for (const side of [0, 1]) {
    const [s, e, h] = [p.shoulders[side], p.elbows[side], p.hands[side]];
    const pts = sleeve > 1 ? [...s, ...e, e[0] + (h[0] - e[0]) * (sleeve - 1), e[1] + (h[1] - e[1]) * (sleeve - 1)] : [...s, s[0] + (e[0] - s[0]) * sleeve, s[1] + (e[1] - s[1]) * sleeve];
    glued(c, () => strokePaper(c, pts, look.top, look.arm + 4));
  }
}

function people(scene: Phaser.Scene): void {
  const body = (key: string, draw: (c: Ctx) => void) => {
    const b = BODIES[key];
    makePaperArt(scene, `homecoming_${key}`, b.w, b.h, (c) => { c.translate(b.ax, b.ay); draw(c); }, { border: 2.5, ax: b.ax, ay: b.ay });
  };
  body('pappy_stand', (c) => {
    dressed(c, PAPPY_POSES.stand, PAPPY, 1.8);
    // his hat, held in front of him
    glued(c, () => { rr(c, -15, -138, 32, 22, 9); fillPaper(c, 'brown'); });
    glued(c, () => { ellipse(c, 1, -116, 27, 7); fillPaper(c, 'brown'); });
    box(c, -15, -124, 32, 5, 'black');
  });
  body('pappy_kneel', (c) => dressed(c, PAPPY_POSES.kneel, PAPPY, 1.75));
  body('pappy_smooch', (c) => dressed(c, PAPPY_POSES.smooch, PAPPY, 1.75));
  body('mammy_stand', mammyStand);
  body('mammy_bent', mammyBent);
  body('mammy_door', mammyDoor);

  for (const [who, moods] of [['mammy', ['mad', 'glad']], ['pappy', ['sorry', 'glad']]] as const) {
    for (const mood of moods) {
      makePaperArt(scene, `homecoming_${who}_head_${mood}`, 110, 110, (c) => { c.translate(55, 96); paperHead(c, who, mood); }, { border: 2.4, ax: 55, ay: 96 });
    }
  }

  // the mark a kiss leaves
  makeArt(scene, 'homecoming_lips', 30, 22, (c) => {
    c.fillStyle = 'rgba(206, 30, 66, 0.92)';
    c.beginPath();
    c.moveTo(1, 10);
    c.quadraticCurveTo(8, 0, 15, 5);
    c.quadraticCurveTo(22, 0, 29, 10);
    c.quadraticCurveTo(22, 12, 15, 11);
    c.quadraticCurveTo(8, 12, 1, 10);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(3, 12.5);
    c.quadraticCurveTo(15, 14.5, 27, 12.5);
    c.quadraticCurveTo(15, 26, 3, 12.5);
    c.closePath();
    c.fill();
  });
}

// ---- the front room -----------------------------------------------------------------------------

function room(scene: Phaser.Scene): void {
  // the front door from inside, still open on the night
  makePaperArt(scene, 'homecoming_door_in', 196, 344, (c) => {
    glued(c, () => box(c, 0, 0, 160, 344, 'white'));
    box(c, 14, 14, 132, 330, 'blue');
    wash(c, 'rgba(8, 10, 40, 0.62)');
    glued(c, () => { circle(c, 108, 62, 15); fillPaper(c, 'yellow'); wash(c, 'rgba(255, 255, 255, 0.45)'); });
    c.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (const [x, y, r] of [[40, 40, 1.8], [64, 96, 1.4], [30, 130, 1.6], [120, 136, 1.5], [84, 30, 1.2], [52, 182, 1.3]]) { circle(c, x, y, r); c.fill(); }
    // (the door, swung in against the wall)
    glued(c, () => { poly(c, [146, 14, 194, 34, 194, 344, 146, 344]); fillPaper(c, 'green'); wash(c, 'rgba(10, 40, 20, 0.34)'); });
    glued(c, () => { circle(c, 182, 206, 6); fillPaper(c, 'yellow'); });
  }, { border: 2.2, ax: 80, ay: 344 });

  // what her temper is written on
  makePaperArt(scene, 'homecoming_temper', 300, 54, (c) => {
    glued(c, () => { rr(c, 0, 0, 300, 54, 8); fillPaper(c, 'cream'); });
    cutText(c, "MAMMY'S TEMPER", 150, 16, 20, 'red');
  }, { border: 2.2 });
}

export function buildArt(scene: Phaser.Scene): void {
  porch(scene);
  keys(scene);
  people(scene);
  room(scene);

  makeWord(scene, 'word_homecoming_kiss', 'KISS!', 'red', 'white', 128, 40, 81);
  makeWord(scene, 'word_homecoming_kiss2', 'KISS!', 'white', 'red', 128, 40, 82);
  makeWord(scene, 'word_homecoming_kiss3', 'KISS!', 'yellow', 'red', 128, 40, 83);
  makeWord(scene, 'word_homecoming_hmph', 'HMPH!', 'blue', 'white', 122, 32, 84);
  makeWord(scene, 'word_homecoming_click', 'CLICK!', 'yellow', 'red', 130, 34, 85);
  makeWord(scene, 'word_homecoming_bang', 'BANG!', 'red', 'yellow', 300, 96, 86);
}
