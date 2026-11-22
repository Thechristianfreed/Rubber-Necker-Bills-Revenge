import Phaser from 'phaser';
import { INK } from '../config';
import { Ctx, PhotoOpts, makeArt, makePhotoArt, makePhotoTile, star } from './sticker';
import { ARM_TONES, VEHICLES, VehicleSpec, setHeadStyles } from './textures';

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

const GROUND: [number, number] = [0.5, 0.985];
const NECK: [number, number] = [0.5, 0.86];

const PIECES: Piece[] = [
  { key: 'bug', file: 'bug.png', w: 270, anchor: GROUND },
  ...[0, 1, 2, 3].flatMap((i): Piece[] => [
    { key: `head${i}`, file: `head${i}.png`, h: 64, anchor: NECK },
    { key: `head${i}_dazed`, file: `head${i}-dazed.png`, h: 65, anchor: NECK },
  ]),
  { key: 'dog', file: 'dog.png', w: 84, anchor: [0.66, 0.9] },
  { key: 'dog_mad', file: 'dog-mad.png', w: 67, anchor: [0.55, 0.92] },
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
];

/** Photo vehicles, with where the open windows are (as fractions of the image). */
interface PhotoVehicle {
  pool: keyof typeof VEHICLES;
  key: string;
  file: string;
  w: number;
  windows: [number, number][];
}

const VAN_WINDOW: [number, number][] = [[0.361, 0.3]];
const PHOTO_VEHICLES: PhotoVehicle[] = [
  { pool: 'van', key: 'van_blue', file: 'van-blue.png', w: 218, windows: VAN_WINDOW },
  { pool: 'van', key: 'van_red', file: 'van-red.png', w: 218, windows: VAN_WINDOW },
  { pool: 'van', key: 'van_mustard', file: 'van-mustard.png', w: 218, windows: VAN_WINDOW },
  { pool: 'van', key: 'van_green', file: 'van-green.png', w: 218, windows: VAN_WINDOW },
  // the dog's ride, until the station wagon arrives
  { pool: 'wagon', key: 'van_teal', file: 'van-teal.png', w: 218, windows: VAN_WINDOW },
  { pool: 'bus', key: 'bus_photo', file: 'bus.png', w: 404, windows: [[0.287, 0.38], [0.46, 0.38], [0.63, 0.38], [0.75, 0.38]] },
];

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
  const names = new Set<string>([...PIECES.map((p) => p.file), ...PHOTO_VEHICLES.map((v) => v.file), 'postcard.jpg']);
  const loaded = new Map<string, HTMLImageElement>();
  await Promise.all([...names].map(async (n) => {
    const im = await loadImage(url(n));
    if (im) loaded.set(n, im);
  }));

  for (const p of PIECES) {
    const im = loaded.get(p.file);
    if (im) makePhotoArt(scene, p.key, im, p);
  }

  // photo heads: every style present replaces a drawn one, and only those are used
  let heads = 0;
  while (loaded.has(`head${heads}.png`) && loaded.has(`head${heads}-dazed.png`)) heads++;
  if (heads > 0) {
    setHeadStyles(heads);
    ARM_TONES.length = 0;
    for (let i = 0; i < heads; i++) ARM_TONES.push(0);
  }

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
  if (pools.has('van')) {
    VEHICLES.sedan = [];
    VEHICLES.pickup = [];
  }

  const postcard = loaded.get('postcard.jpg');
  if (postcard) makePhotoTile(scene, 'postcard', postcard, 216);

  // the wreck, staged from two of the photo vans
  const a = loaded.get('van-red.png'), b = loaded.get('van-blue.png');
  if (a && b) {
    const vw = 218, vh = (vw * a.naturalHeight) / a.naturalWidth;
    makeArt(scene, 'wreck', 400, 170, (c) => {
      c.save();
      c.translate(176, 34);
      c.rotate(-0.17);
      c.drawImage(b, 0, 0, vw, vh);
      c.restore();
      c.drawImage(a, 6, 170 - vh - 2, vw, vh);
      star(c, 214, 110, 20, 9, 8);
      c.fillStyle = '#ffd94a';
      c.fill();
      c.lineWidth = 2;
      c.strokeStyle = INK;
      c.stroke();
    }, { border: 2.5, ax: 200, ay: 168 });
  }
}
