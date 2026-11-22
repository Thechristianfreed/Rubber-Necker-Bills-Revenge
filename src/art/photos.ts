import Phaser from 'phaser';
import { INK } from '../config';
import { Ctx, PhotoOpts, makeArt, makePhotoArt, makePhotoTile, star } from './sticker';
import { ARM_TINTS, VEHICLES, VehicleSpec, makeNeck, setHeadStyles } from './textures';

/** Photo cutouts that replace drawn art. Each piece takes over the texture key
 *  of the drawing it replaces, so nothing else in the game has to change.
 *  The files come from tools/make_cutouts.py. */

const FILES = import.meta.glob('../assets/scrap/*.{png,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function url(name: string): string | undefined {
  return FILES[`../assets/scrap/${name}`];
}

const DISPLAY = 'Bangers, Impact, "Arial Narrow Bold", sans-serif';

/** Paint lettering onto a blank sign or billboard face. */
function lettering(lines: [string, number][], cx: number, cy: number, gap: number, color: string) {
  return (c: Ctx, w: number, h: number): void => {
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = color;
    let y = h * cy - ((lines.length - 1) * gap) / 2;
    for (const [text, size] of lines) {
      c.font = `${size}px ${DISPLAY}`;
      c.fillText(text, w * cx, y);
      y += gap;
    }
  };
}

interface Piece extends PhotoOpts {
  key: string;
  file: string;
}

type XY = [number, number];
const GROUND: XY = [0.5, 0.985];
const NECK: XY = [0.5, 0.86];

/** Every rubbernecker: height on screen and where the neck joins, for the
 *  gawking and the dazed photo. Big hair needs a bigger picture to keep the
 *  face the same size as everyone else's. */
interface HeadFit { h: number; at?: XY; dazedH?: number; dazedAt?: XY }
const HEADS: HeadFit[] = [
  { h: 64 }, { h: 64 }, { h: 64 }, { h: 64 },
  { h: 64 },                                                    // crew cut and moustache
  { h: 82, at: [0.42, 0.78], dazedAt: [0.4, 0.8] },             // long blonde hair
  { h: 62 },                                                    // bald, bushy eyebrows
  { h: 74, at: [0.42, 0.88] },                                  // rollers and headscarf
  { h: 66 },                                                    // slicked hair, sideburns
  { h: 72, at: [0.55, 0.82], dazedH: 56, dazedAt: [0.5, 0.86] }, // pigtails and braces
  { h: 84, at: [0.5, 0.9] },                                    // afro and goatee
  { h: 64 },                                                    // grey bun
];

const WORDS = ['bonk', 'whack', 'thwack', 'pow', 'bop', 'perfect'];

const PIECES: Piece[] = [
  { key: 'bug', file: 'bug.png', w: 270, anchor: GROUND },
  ...HEADS.flatMap((f, i): Piece[] => [
    { key: `head${i}`, file: `head${i}.png`, h: f.h, anchor: f.at ?? NECK },
    { key: `head${i}_dazed`, file: `head${i}-dazed.png`, h: f.dazedH ?? f.h + 1, anchor: f.dazedAt ?? f.at ?? NECK },
  ]),
  { key: 'dog', file: 'dog.png', w: 84, anchor: [0.66, 0.9] },
  { key: 'dog_mad', file: 'dog-mad.png', w: 67, anchor: [0.55, 0.92] },

  // Bill: aloha shirt, and his arm holding the bat (it pivots at the sleeve)
  { key: 'bill_torso', file: 'shirt.png', w: 90, anchor: [0.5, 0.6] },
  { key: 'bill_arm', file: 'arm-bat.png', h: 138, border: 2, anchor: [0.414, 0.975] },

  // roadside
  { key: 'palm', file: 'palm.png', h: 172, border: 2, anchor: [0.48, 0.97] },
  { key: 'cone', file: 'cone.png', h: 33, border: 1.5, anchor: [0.5, 0.96] },
  {
    key: 'billboard0', file: 'billboard.png', h: 152, border: 2, anchor: [0.5, 0.99],
    decorate: lettering([['EYES ON', 22], ['THE ROAD!', 19]], 0.48, 0.185, 21, '#b8372a'),
  },
  {
    key: 'billboard1', file: 'billboard.png', h: 152, border: 2, anchor: [0.5, 0.99],
    decorate: lettering([['KEEP IT', 22], ['MOVING!', 22]], 0.48, 0.185, 21, '#1f4f8a'),
  },
  {
    key: 'sign0', file: 'sign.png', h: 120, anchor: [0.5, 0.995],
    decorate: lettering([['NO', 21], ['GAWKING', 16]], 0.5, 0.345, 18, INK),
  },
  {
    key: 'sign1', file: 'sign.png', h: 120, anchor: [0.5, 0.995],
    decorate: lettering([['ROAD', 21], ['WORK', 21]], 0.5, 0.345, 20, INK),
  },

  // effects
  { key: 'star', file: 'star.png', w: 27, border: 1.4 },
  { key: 'puff', file: 'puff.png', w: 40, border: 0.8 },
  { key: 'burst', file: 'burst.png', w: 130, border: 2.5 },
  ...WORDS.map((w): Piece => ({ key: `word_${w}`, file: `word-${w}.png`, w: w === 'perfect' ? 124 : 106, border: 2.5 })),
  { key: 'armphone', file: 'arm-phone.png', w: 84, border: 1.8, anchor: [0.98, 0.74] },
  { key: 'phone', file: 'phone.png', h: 26, border: 1.4 },
];

/** Photo vehicles, with where the open windows are (as fractions of the image). */
interface PhotoVehicle {
  pool: keyof typeof VEHICLES;
  key: string;
  file: string;
  w: number;
  windows: XY[];
}

const VAN_WINDOW: XY[] = [[0.361, 0.3]];
const SEDAN_WINDOW: XY[] = [[0.455, 0.285]];
const PICKUP_WINDOW: XY[] = [[0.426, 0.262]];
const PHOTO_VEHICLES: PhotoVehicle[] = [
  { pool: 'sedan', key: 'sedan_red', file: 'sedan-red.png', w: 236, windows: SEDAN_WINDOW },
  { pool: 'sedan', key: 'sedan_blue', file: 'sedan-blue.png', w: 236, windows: SEDAN_WINDOW },
  { pool: 'sedan', key: 'sedan_green', file: 'sedan-green.png', w: 236, windows: SEDAN_WINDOW },
  { pool: 'pickup', key: 'pickup_mustard', file: 'pickup-mustard.png', w: 232, windows: PICKUP_WINDOW },
  { pool: 'pickup', key: 'pickup_blue', file: 'pickup-blue.png', w: 232, windows: PICKUP_WINDOW },
  { pool: 'van', key: 'van_blue', file: 'van-blue.png', w: 218, windows: VAN_WINDOW },
  { pool: 'van', key: 'van_green', file: 'van-green.png', w: 218, windows: VAN_WINDOW },
  // the dog rides in the back of the wagon
  { pool: 'wagon', key: 'wagon_photo', file: 'wagon.png', w: 240, windows: [[0.755, 0.3]] },
  { pool: 'bus', key: 'bus_photo', file: 'bus.png', w: 404, windows: [[0.287, 0.38], [0.46, 0.38], [0.63, 0.38], [0.75, 0.38]] },
];

/** Average colour of part of a cutout, as [r, g, b]. */
function sample(image: HTMLImageElement, x0: number, y0: number, x1: number, y1: number): [number, number, number] | null {
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const c = canvas.getContext('2d', { willReadFrequently: true })!;
  c.drawImage(image, 0, 0, size, size);
  const d = c.getImageData(Math.round(x0 * size), Math.round(y0 * size), Math.round((x1 - x0) * size), Math.round((y1 - y0) * size)).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 250) continue;
    r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
  }
  return n ? [r / n, g / n, b / n] : null;
}

/** The skin (or fur) colour a neck should be: the middle of the face, lifted a
 *  little because the average of a face is darker than the skin reads. */
function tone(rgb: [number, number, number] | null): string {
  if (!rgb) return '#e0b08c';
  return '#' + rgb.map((v) => Math.round(v + (255 - v) * 0.12).toString(16).padStart(2, '0')).join('');
}

function loadImage(src: string | undefined): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** Load every photo cutout and swap it in over its drawn stand-in. */
export async function loadPhotoArt(scene: Phaser.Scene): Promise<void> {
  const names = new Set<string>([...PIECES.map((p) => p.file), ...PHOTO_VEHICLES.map((v) => v.file), 'postcard.jpg', 'rail.png']);
  const loaded = new Map<string, HTMLImageElement>();
  await Promise.all([...names].map(async (n) => {
    const im = await loadImage(url(n));
    if (im) loaded.set(n, im);
  }));

  for (const p of PIECES) {
    const im = loaded.get(p.file);
    if (im) makePhotoArt(scene, p.key, im, p);
  }

  // Photo heads: only styles with both photos are used. Each gets a neck cut
  // from paper the colour of its own skin, and a tint so the arm that holds a
  // phone matches too.
  let heads = 0;
  while (loaded.has(`head${heads}.png`) && loaded.has(`head${heads}-dazed.png`)) heads++;
  if (heads > 0) {
    setHeadStyles(heads);
    const armPhoto = loaded.get('arm-phone.png');
    const arm = (armPhoto && sample(armPhoto, 0.45, 0.5, 0.8, 0.85)) ?? [205, 160, 130];
    ARM_TINTS.length = 0;
    for (let i = 0; i < heads; i++) {
      const skin = sample(loaded.get(`head${i}.png`)!, 0.36, 0.5, 0.64, 0.8);
      makeNeck(scene, `neck${i}`, tone(skin));
      const [r, g, b] = (skin ?? arm).map((v, k) => Math.round(255 * Math.min(1, (v * 1.06) / arm[k])));
      ARM_TINTS.push((r << 16) | (g << 8) | b);
    }
  }
  const dog = loaded.get('dog.png');
  if (dog) makeNeck(scene, 'neck_dog', tone(sample(dog, 0.45, 0.45, 0.75, 0.8)));

  // photo vehicles take over whole pools, so drawn and photo cars never mix
  const pools = new Map<keyof typeof VEHICLES, VehicleSpec[]>();
  for (const v of PHOTO_VEHICLES) {
    const im = loaded.get(v.file);
    if (!im) continue;
    makePhotoArt(scene, v.key, im, { w: v.w, anchor: GROUND });
    const h = (v.w * im.naturalHeight) / im.naturalWidth;
    const spec: VehicleSpec = {
      key: v.key, w: v.w, h,
      slots: v.windows.map(([fx, fy]) => ({ x: (fx - GROUND[0]) * v.w, y: (fy - GROUND[1]) * h })),
    };
    pools.set(v.pool, [...(pools.get(v.pool) ?? []), spec]);
  }
  for (const [pool, specs] of pools) VEHICLES[pool] = specs;

  const postcard = loaded.get('postcard.jpg');
  if (postcard) makePhotoTile(scene, 'postcard', postcard, 216);
  const rail = loaded.get('rail.png');
  if (rail) makePhotoTile(scene, 'rail', rail, 30);

  // the wreck everyone is staring at: the van has rear-ended the red sedan
  const front = loaded.get('sedan-red.png'), back = loaded.get('van-blue.png');
  if (front && back) {
    const fw = 236, fh = (fw * front.naturalHeight) / front.naturalWidth;
    const bw = 218, bh = (bw * back.naturalHeight) / back.naturalWidth;
    makeArt(scene, 'wreck', 420, 176, (c) => {
      c.save();
      c.translate(196, 26);
      c.rotate(-0.15);
      c.drawImage(back, 0, 0, bw, bh);
      c.restore();
      c.drawImage(front, 6, 176 - fh - 2, fw, fh);
      star(c, 232, 118, 20, 9, 8);
      c.fillStyle = '#ffd94a';
      c.fill();
      c.lineWidth = 2;
      c.strokeStyle = INK;
      c.stroke();
    }, { border: 2.5, ax: 210, ay: 174 });
  }
}
