import Phaser from 'phaser';
import { Doll, Look, doll } from './fight';
import { Paper, burstPath, cutText, fillPaper, glued, makePaperArt, makeWord, paper, strokePaper } from './paper';
import { Ctx, circle, ellipse, makeArt, poly, rr } from './sticker';

/** Cut-paper art for the day Chad had had enough: two small brothers, their
 *  back yard, a baseball bat, and their mother at the back door. These are
 *  stand-ins: any of them is replaced by a photo cutout registered under the
 *  same key (see photos.ts).
 *
 *  The boys are a body and a head apart, so that a face can change without the
 *  body changing, and so that their real faces can go on later. Every pose is
 *  drawn facing right; the game turns them round. */

/** Chad, who is put upon, and then is not. */
export const CHAD: Record<string, Doll> = {
  stand: {
    hips: [[-9, -50], [9, -50]], knees: [[-10, -25], [10, -25]], feet: [[-12, 0], [12, 0]],
    shoulders: [[-15, -96], [15, -96]], elbows: [[-21, -74], [21, -74]], hands: [[-19, -54], [19, -54]],
    head: [0, -124], tilt: 0,
  },
  shoved: {
    hips: [[-12, -50], [6, -50]], knees: [[-16, -26], [12, -30]], feet: [[-14, 0], [22, -12]],
    shoulders: [[-22, -94], [8, -96]], elbows: [[-40, -102], [26, -106]], hands: [[-54, -120], [42, -122]],
    head: [-10, -122], tilt: -0.2,
  },
  mad: {
    hips: [[-9, -50], [9, -50]], knees: [[-13, -25], [13, -25]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-15, -96], [15, -96]], elbows: [[-2, -78], [24, -78]], hands: [[18, -88], [24, -94]],
    head: [0, -124], tilt: 0,
  },
  run1: {
    hips: [[-5, -50], [13, -50]], knees: [[-16, -32], [24, -36]], feet: [[-36, -18], [30, -4]],
    shoulders: [[-7, -95], [23, -95]], elbows: [[6, -98], [28, -102]], hands: [[10, -114], [18, -118]],
    head: [14, -122], tilt: 0.1,
  },
  run2: {
    hips: [[-5, -50], [13, -50]], knees: [[20, -34], [-10, -30]], feet: [[34, -10], [-32, -14]],
    shoulders: [[-7, -95], [23, -95]], elbows: [[6, -98], [28, -102]], hands: [[10, -114], [18, -118]],
    head: [14, -122], tilt: 0.1,
  },
  swing: {
    hips: [[-6, -48], [12, -48]], knees: [[-18, -26], [22, -28]], feet: [[-30, 0], [30, 0]],
    shoulders: [[-6, -92], [24, -92]], elbows: [[26, -90], [38, -84]], hands: [[46, -82], [52, -78]],
    head: [16, -120], tilt: 0.16,
  },
  hide: {
    hips: [[-9, -50], [9, -50]], knees: [[-8, -25], [8, -25]], feet: [[-9, 0], [9, 0]],
    shoulders: [[-15, -96], [15, -96]], elbows: [[-24, -76], [-20, -72]], hands: [[-12, -58], [-8, -56]],
    head: [2, -124], tilt: 0.12,
  },
};

/** Shane, who starts it. */
export const SHANE: Record<string, Doll> = {
  push: {
    hips: [[-10, -50], [8, -50]], knees: [[-18, -26], [16, -28]], feet: [[-28, 0], [22, 0]],
    shoulders: [[-10, -94], [20, -94]], elbows: [[22, -96], [26, -90]], hands: [[44, -98], [46, -90]],
    head: [10, -122], tilt: 0.1,
  },
  laugh: {
    hips: [[-9, -50], [9, -50]], knees: [[-11, -25], [11, -25]], feet: [[-14, 0], [14, 0]],
    shoulders: [[-15, -96], [15, -96]], elbows: [[-28, -76], [28, -76]], hands: [[-12, -58], [12, -58]],
    head: [0, -125], tilt: -0.1,
  },
  run1: {
    hips: [[-5, -50], [13, -50]], knees: [[-16, -32], [24, -36]], feet: [[-36, -18], [30, -4]],
    shoulders: [[-5, -95], [25, -95]], elbows: [[-18, -84], [34, -80]], hands: [[-30, -98], [44, -96]],
    head: [18, -121], tilt: 0.14,
  },
  run2: {
    hips: [[-5, -50], [13, -50]], knees: [[20, -34], [-10, -30]], feet: [[34, -10], [-32, -14]],
    shoulders: [[-5, -95], [25, -95]], elbows: [[30, -76], [-14, -78]], hands: [[42, -62], [-26, -64]],
    head: [18, -121], tilt: 0.14,
  },
  ow: {
    hips: [[-10, -52], [8, -52]], knees: [[-4, -30], [18, -34]], feet: [[-18, -14], [24, -20]],
    shoulders: [[0, -96], [28, -94]], elbows: [[-18, -78], [-10, -72]], hands: [[-16, -54], [-10, -50]],
    head: [22, -122], tilt: 0.22,
  },
  tattle: {
    hips: [[-9, -50], [9, -50]], knees: [[-10, -25], [10, -25]], feet: [[-13, 0], [13, 0]],
    shoulders: [[-15, -96], [15, -96]], elbows: [[-34, -96], [20, -76]], hands: [[-54, -98], [14, -60]],
    head: [0, -124], tilt: 0.08,
  },
};

/** Their mother, at the back door: hands on hips. (Her head is a photo, hung on afterwards.) */
export const MOM: Record<string, Doll> = {
  akimbo: {
    hips: [[-14, -112], [14, -112]], knees: [[-16, -56], [16, -56]], feet: [[-20, 0], [20, 0]],
    shoulders: [[-28, -186], [28, -186]], elbows: [[-54, -150], [54, -150]], hands: [[-22, -122], [22, -122]],
    head: [0, -228], tilt: 0,
  },
};

const CHAD_LOOK: Look = { skin: 'manila', top: 'sky', shorts: 'blue', arm: 9, leg: 11 };
const SHANE_LOOK: Look = { skin: 'manila', top: 'red', legs: 'blue', arm: 10, leg: 12 };
const MOM_LOOK: Look = { skin: 'manila', top: 'yellow', legs: 'blue', arm: 12, leg: 17 };

/** How big a boy's paper head is drawn, and so where his chin is below the middle of it. */
export const KID_HEAD = 23;
/** ...and how tall his photo head is, hair to chin: bigger, since it is the best of him. */
export const KID_FACE = 72;

type Mood = 'sad' | 'mad' | 'yell' | 'angel' | 'grin' | 'scared' | 'ow' | 'cry' | 'tongue';

/** Every look the game asks of each of them (a head called `<who>head_<look>`),
 *  how the paper head for it is drawn, and which of the photos of him does for
 *  it when there are photos (see BAT_FACES in tools/make_cutouts.py). */
export const KID_LOOKS: Record<string, { hair: Paper; looks: Record<string, { paper: Mood; photo: string }> }> = {
  chad: {
    hair: 'yellow',
    looks: {
      sad: { paper: 'sad', photo: 'scowl' },
      mad: { paper: 'mad', photo: 'scowl' },
      yell: { paper: 'yell', photo: 'scowl' },
      glee: { paper: 'grin', photo: 'grin' },
      joy: { paper: 'grin', photo: 'laugh' },
      angel: { paper: 'angel', photo: 'smile' },
    },
  },
  shane: {
    hair: 'brown',
    looks: {
      grin: { paper: 'grin', photo: 'grin' },
      tongue: { paper: 'tongue', photo: 'grin' },
      scared: { paper: 'scared', photo: 'scared' },
      ow: { paper: 'ow', photo: 'cry' },
      cry: { paper: 'cry', photo: 'cry' },
    },
  },
};

/** A small boy's head: a bowl of hair, and a face that says how it is going. */
function kidHead(c: Ctx, hair: Paper, mood: Mood): void {
  const r = KID_HEAD, dark = '#241a14';
  const line = (draw: () => void, w = 2.4) => { c.beginPath(); draw(); c.strokeStyle = dark; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); };
  const fill = (colour: string) => { c.fillStyle = colour; c.fill(); };
  glued(c, () => { ellipse(c, 0, -3, r + 3, r + 2); fillPaper(c, hair); });
  for (const s of [-1, 1]) { circle(c, s * (r - 1), 4, 5); fillPaper(c, 'manila'); }
  glued(c, () => { ellipse(c, 0, 3, r - 2, r - 1); fillPaper(c, 'manila'); });
  // the fringe: straight across, as cut at the kitchen table
  c.save();
  ellipse(c, 0, 3, r - 2, r - 1);
  c.clip();
  c.beginPath();
  c.rect(-r, -r, r * 2, r * 0.72);
  fillPaper(c, hair);
  c.restore();
  if (mood === 'mad' || mood === 'yell') { ellipse(c, 0, 6, r - 2, r - 4); fill('rgba(214, 60, 40, 0.3)'); }
  for (const s of [-1, 1]) { circle(c, s * 12, 9, 4.5); fill('rgba(230, 110, 100, 0.35)'); }

  // eyes
  for (const s of [-1, 1]) {
    const x = s * 8.5, y = 1;
    if (mood === 'ow' || mood === 'cry') {
      line(() => { c.moveTo(x - s * 4, y - 3); c.lineTo(x + s * 3, y); c.lineTo(x - s * 4, y + 3); });
    } else if (mood === 'angel') {
      line(() => { c.arc(x, y + 1, 3.6, Math.PI * 1.1, Math.PI * 1.9); });
    } else if (mood === 'scared') {
      circle(c, x, y, 5.6); fill('#ffffff');
      line(() => { c.arc(x, y, 5.6, 0, Math.PI * 2); }, 1.4);
      circle(c, x - 1.5, y + 0.5, 2); fill(dark);
    } else {
      circle(c, x, y, 2.8); fill(dark);
    }
    if (mood === 'mad' || mood === 'yell') line(() => { c.moveTo(s * 14, -7); c.lineTo(s * 4, -3); }, 3);
    else if (mood === 'sad') line(() => { c.moveTo(s * 13, -4); c.lineTo(s * 5, -7); });
    else if (mood === 'grin' || mood === 'tongue') line(() => { c.moveTo(s * 13, -6); c.lineTo(s * 5, -8); });
    else if (mood === 'scared') line(() => { c.moveTo(s * 13, -8); c.lineTo(s * 5, -10); });
  }

  // mouth
  if (mood === 'sad') line(() => { c.moveTo(-6, 15); c.quadraticCurveTo(0, 10, 6, 15); });
  else if (mood === 'mad') {
    rr(c, -8, 10, 16, 7, 2); fill('#ffffff');
    line(() => { c.rect(-8, 10, 16, 7); c.moveTo(-3, 10); c.lineTo(-3, 17); c.moveTo(3, 10); c.lineTo(3, 17); }, 1.5);
  } else if (mood === 'yell' || mood === 'ow') { ellipse(c, 0, 13, 7, 7.5); fill(dark); ellipse(c, 0, 17, 4, 3); fill('#d8523f'); }
  else if (mood === 'cry') {
    ellipse(c, 0, 13, 9, 7.5); fill(dark); ellipse(c, 0, 17, 5, 3); fill('#d8523f');
    for (const s of [-1, 1]) { ellipse(c, s * 12, 9, 2.6, 6); fillPaper(c, 'sky'); circle(c, s * 14, 17, 2.4); fillPaper(c, 'sky'); }
  } else if (mood === 'scared') { ellipse(c, 0, 14, 4, 5); fill(dark); }
  else if (mood === 'angel') { circle(c, 3, 14, 2.6); fill(dark); }
  else {
    // a grin with teeth in it; and, to finish, a tongue
    c.beginPath(); c.moveTo(-10, 10); c.quadraticCurveTo(0, 22, 10, 10); c.closePath(); fill(dark);
    c.beginPath(); c.rect(-7, 10, 14, 3); fill('#ffffff');
    if (mood === 'tongue') { rr(c, -4, 13, 8, 11, 4); fill('#e0584a'); }
  }
}

const KID_W = 220, KID_H = 190, KID_AX = 110, KID_AY = 180;

function kids(scene: Phaser.Scene, prefix: string, poses: Record<string, Doll>, look: Look): void {
  for (const [name, p] of Object.entries(poses)) {
    makePaperArt(scene, `${prefix}_${name}`, KID_W, KID_H, (c) => {
      c.translate(KID_AX, KID_AY);
      doll(c, p, look);
    }, { border: 2, ax: KID_AX, ay: KID_AY });
  }
}

export function buildBatArt(scene: Phaser.Scene): void {
  kids(scene, 'chad', CHAD, CHAD_LOOK);
  kids(scene, 'shane', SHANE, SHANE_LOOK);
  // their heads, each hung from its chin (as the photos of them are)
  for (const [who, { hair, looks }] of Object.entries(KID_LOOKS)) {
    for (const [look, { paper: mood }] of Object.entries(looks)) {
      makePaperArt(scene, `${who}head_${look}`, 64, 64, (c) => { c.translate(32, 32); kidHead(c, hair, mood); }, { border: 2, ax: 32, ay: 32 + KID_HEAD - 1 });
    }
  }
  makePaperArt(scene, 'batmom_akimbo', 200, 260, (c) => { c.translate(100, 250); doll(c, MOM.akimbo, MOM_LOOK); }, { border: 2.5, ax: 100, ay: 250 });

  // the bat: held by the thin end
  makePaperArt(scene, 'bat', 84, 18, (c) => {
    glued(c, () => {
      c.beginPath();
      c.moveTo(4, 6); c.lineTo(34, 6); c.quadraticCurveTo(58, 2, 76, 2); c.quadraticCurveTo(83, 9, 76, 16);
      c.quadraticCurveTo(58, 16, 34, 12); c.lineTo(4, 12); c.closePath();
      fillPaper(c, 'manila');
    });
    circle(c, 4, 9, 4.5);
    fillPaper(c, 'brown');
    c.fillStyle = 'rgba(90, 50, 10, 0.3)';
    for (const x of [14, 18, 22]) c.fillRect(x, 6, 2, 6);
  }, { border: 1.6, ax: 12, ay: 9 });

  // the back yard: sky, the fence along the back of it, and grass
  makeArt(scene, 'yard_sky', 64, 64, (c) => { c.beginPath(); c.rect(0, 0, 64, 64); fillPaper(c, 'sky'); }, { border: 0, ax: 0, ay: 0 });
  makeArt(scene, 'yard_fence', 96, 150, (c) => {
    c.beginPath(); c.rect(0, 46, 96, 12); fillPaper(c, 'brown');
    c.beginPath(); c.rect(0, 108, 96, 12); fillPaper(c, 'brown');
    for (let i = 0; i < 4; i++) {
      const x = i * 24 + 2;
      glued(c, () => { poly(c, [x, 18, x + 10, 4, x + 20, 18, x + 20, 150, x, 150]); fillPaper(c, i % 2 ? 'cream' : 'white'); });
    }
  }, { border: 0, ax: 0, ay: 0 });
  makeArt(scene, 'yard_grass', 128, 64, (c) => {
    c.beginPath(); c.rect(0, 0, 128, 64); fillPaper(c, 'green');
    c.strokeStyle = 'rgba(20, 70, 20, 0.35)';
    c.lineWidth = 1.6;
    for (const [x, y] of [[10, 12], [44, 30], [78, 10], [110, 40], [26, 50], [92, 54], [60, 20]]) {
      c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + 2, y); c.moveTo(x + 5, y + 8); c.lineTo(x + 6, y + 1); c.stroke();
    }
  }, { border: 0, ax: 0, ay: 0 });
  makePaperArt(scene, 'yard_sun', 90, 90, (c) => {
    burstPath(c, 45, 45, 43, 43, 12, 5); fillPaper(c, 'yellow');
    glued(c, () => { circle(c, 45, 45, 24); fillPaper(c, 'yellow'); });
  }, { border: 2 });
  makePaperArt(scene, 'yard_cloud', 130, 54, (c) => {
    glued(c, () => {
      for (const [x, y, r] of [[30, 34, 20], [58, 24, 22], [88, 30, 20], [106, 38, 14], [64, 40, 16]]) { circle(c, x, y, r); fillPaper(c, 'white'); }
    });
  }, { border: 0 });

  // what there is in it to run past
  makePaperArt(scene, 'yard_tree', 200, 300, (c) => {
    glued(c, () => { poly(c, [86, 300, 92, 150, 110, 150, 118, 300]); fillPaper(c, 'brown'); });
    glued(c, () => { for (const [x, y, r] of [[62, 96, 56], [128, 86, 62], [98, 56, 54], [100, 124, 50]]) { circle(c, x, y, r); fillPaper(c, 'green'); } });
  }, { border: 2.4, ax: 102, ay: 296 });
  makePaperArt(scene, 'yard_swing', 230, 190, (c) => {
    for (const pts of [[14, 188, 44, 8], [74, 188, 44, 8], [216, 188, 186, 8], [156, 188, 186, 8], [40, 10, 190, 10]]) glued(c, () => strokePaper(c, pts, 'red', 7));
    c.strokeStyle = 'rgba(40, 40, 40, 0.7)';
    c.lineWidth = 1.6;
    for (const x of [86, 118]) { c.beginPath(); c.moveTo(x, 12); c.lineTo(x + 6, 132); c.stroke(); }
    glued(c, () => { rr(c, 84, 130, 48, 9, 3); fillPaper(c, 'black'); });
  }, { border: 2, ax: 115, ay: 186 });
  makePaperArt(scene, 'yard_pool', 170, 52, (c) => {
    glued(c, () => { ellipse(c, 85, 26, 83, 24); fillPaper(c, 'blue'); });
    ellipse(c, 85, 23, 70, 15); fillPaper(c, 'sky');
    glued(c, () => { ellipse(c, 112, 20, 13, 8); fillPaper(c, 'yellow'); });
    circle(c, 122, 13, 6); fillPaper(c, 'yellow');
  }, { border: 2, ax: 85, ay: 44 });
  makePaperArt(scene, 'yard_line', 250, 210, (c) => {
    for (const x of [10, 240]) glued(c, () => strokePaper(c, [x, 208, x, 20], 'grey', 6));
    c.strokeStyle = 'rgba(40, 40, 40, 0.7)';
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(10, 26); c.quadraticCurveTo(125, 46, 240, 26); c.stroke();
    const hang: [number, Paper, number][] = [[40, 'white', 46], [92, 'red', 40], [140, 'white', 60], [192, 'yellow', 42]];
    for (const [x, sheet, h] of hang) glued(c, () => { poly(c, [x, 36, x + 34, 38, x + 32, 38 + h, x + 2, 36 + h]); fillPaper(c, sheet); });
  }, { border: 2, ax: 125, ay: 206 });
  makePaperArt(scene, 'yard_bush', 150, 80, (c) => {
    glued(c, () => { for (const [x, y, r] of [[34, 52, 30], [74, 40, 36], [114, 52, 30]]) { circle(c, x, y, r); fillPaper(c, 'green'); } });
    c.fillStyle = paper(c, 'red');
    for (const [x, y] of [[40, 40], [70, 24], [96, 46], [118, 38]]) { circle(c, x, y, 4); c.fill(); }
  }, { border: 2, ax: 75, ay: 76 });

  // the back of the house, with the door open (she stands in it), and a step up to it
  makePaperArt(scene, 'yard_house', 340, 400, (c) => {
    glued(c, () => { c.beginPath(); c.rect(0, 0, 340, 380); fillPaper(c, 'cream'); });
    c.strokeStyle = 'rgba(90, 70, 40, 0.22)';
    c.lineWidth = 1.5;
    for (let y = 22; y < 380; y += 22) { c.beginPath(); c.moveTo(0, y); c.lineTo(340, y); c.stroke(); }
    glued(c, () => { c.beginPath(); c.rect(48, 84, 136, 296); fillPaper(c, 'white'); });
    c.beginPath(); c.rect(60, 96, 112, 284); fillPaper(c, 'black');
    glued(c, () => { c.beginPath(); c.rect(222, 120, 96, 96); fillPaper(c, 'white'); });
    c.beginPath(); c.rect(232, 130, 76, 76); fillPaper(c, 'sky');
    strokePaper(c, [270, 130, 270, 206], 'white', 5);
    strokePaper(c, [232, 168, 308, 168], 'white', 5);
    glued(c, () => { c.beginPath(); c.rect(30, 380, 172, 20); fillPaper(c, 'grey'); });
  }, { border: 2.5, ax: 116, ay: 380 });

  // the week it took: a calendar that loses a page a day, and how fed up he is
  makePaperArt(scene, 'cal_page', 104, 110, (c) => {
    glued(c, () => { rr(c, 0, 6, 104, 104, 5); fillPaper(c, 'white'); });
    c.beginPath(); c.rect(0, 6, 104, 26); fillPaper(c, 'red');
    for (const x of [28, 76]) { glued(c, () => { rr(c, x - 4, 0, 8, 16, 3); fillPaper(c, 'grey'); }); }
  }, { border: 2 });
  makePaperArt(scene, 'steam', 44, 36, (c) => {
    glued(c, () => { for (const [x, y, r] of [[13, 22, 11], [24, 13, 12], [33, 23, 10]]) { circle(c, x, y, r); fillPaper(c, 'white'); } });
  }, { border: 0 });
  makePaperArt(scene, 'halo', 50, 20, (c) => {
    c.beginPath(); c.ellipse(25, 10, 21, 6.5, 0, 0, Math.PI * 2);
    c.strokeStyle = paper(c, 'yellow'); c.lineWidth = 5; c.stroke();
  }, { border: 1.4 });
  makePaperArt(scene, 'alert', 34, 44, (c) => {
    glued(c, () => { burstPath(c, 17, 22, 16, 21, 9, 11); fillPaper(c, 'yellow'); });
    cutText(c, '!', 17, 23, 30, 'red');
  }, { border: 1.6 });

  makeWord(scene, 'word_bonk', 'BONK!', 'yellow', 'red', 150, 44, 61);
  makeWord(scene, 'word_whiff', 'WHIFF!', 'grey', 'white', 140, 34, 62);
  makeWord(scene, 'word_yeowch', 'YEOWCH!', 'blue', 'white', 160, 32, 63);
  makeWord(scene, 'word_homerun', 'HOME RUN!', 'red', 'yellow', 330, 66, 64);
  makeWord(scene, 'word_thatsit', "THAT'S IT!", 'red', 'white', 330, 68, 65);
  makeWord(scene, 'word_gethim', 'GET HIM!', 'blue', 'yellow', 320, 78, 66);
}
