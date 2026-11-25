import Phaser from 'phaser';
import { INK, TEX } from '../config';
import { ART, Ctx, fence, makeArt, makePhotoArt, makePhotoTile, star } from './sticker';
import { ARM_TINTS, VEHICLES, VehicleSpec, makeNeck, setHeadStyles } from './textures';
import { PAPERS, addPaper } from './paper';
import { loadPictures, picture } from './pictures';
import { buildPaperUi } from './ui';
import { HALL, buildHallArt } from './hallway';
import { BILL_HEAD, TV, buildMiniArt } from './minis';
import { buildFightArt } from './fight';
import { KID_CLOSE, KID_CLOSE_UPS, KID_FACE, KID_LOOKS, buildBatArt } from './bat';
import { buildSandArt } from './sand';
import { BAT_FACES } from '../data/bat';
import { BAT_BODIES, BAT_DOOR, BAT_YARD } from '../data/batbodies';
import { SAND } from '../data/sand';
import { buildSleepoverArt } from './sleepover';
import { buildStreetArt } from './street';
import { FIGHT_BODIES } from '../data/fight';
import { WORKOUT_BODIES } from '../data/workout';
import { Piece } from '../minis/kit';
import { ROSTER } from '../minis/roster';

/** Photo cutouts that replace drawn art. Each piece takes over the texture key
 *  of the drawing it replaces, so nothing else in the game has to change.
 *  The files come from tools/make_cutouts.py. */

const FILES = import.meta.glob('../assets/scrap/*.{png,jpg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
/** ...and the pictures each quick game keeps in its own folder (src/minis/<id>/assets). */
const OWN = import.meta.glob('../minis/*/assets/*.{png,jpg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

/** Where a picture is. Cutouts are called "name.png" throughout, but they are
 *  kept as WebP, which is a fraction of the size (tools/shrink_assets.py). */
function url(name: string): string | undefined {
  return FILES[`../assets/scrap/${name.replace(/\.png$/, '.webp')}`] ?? FILES[`../assets/scrap/${name}`];
}

/** Where a quick game's picture is: in its own folder if it has it there, among the common ones if not. */
function ownUrl(id: string, name: string): string | undefined {
  const at = `../minis/${id}/assets/`;
  return OWN[at + name.replace(/\.png$/, '.webp')] ?? OWN[at + name] ?? url(name);
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

/** Bill's body is drawn small under his big photo head (design pixels per image pixel). */
const BODY_SCALE = 0.58;
const KID_SCALE = 0.5;
/** Bill from behind in the hallway is right in front of the camera. */
const TEEN_SCALE = 0.8;
/** Puts the middle of a mailbox 68 pixels above the kerb (MAILBOX_UP in NoodleNeck.ts). */
const MAILBOX_SCALE = 0.352;
/** How tall Bill's head is in the faces he pulls for the breathing. A little more than his everyday
 *  heads measure, which were photographed from closer and so look bigger for their height. */
const BILL_FACE = BILL_HEAD * 1.1;
/** How tall the instructor's face is on the workout tape, hairline to chin: a size too big for her body, like everybody's. */
const MOM_FACE = 60;
/** How tall the two views in the sandbox are made (the pictures of Shane from above and of their mother from below), before the game sizes them. */
export const SAND_ABOVE = 640;
export const SAND_BELOW = 720;
export { MOM_FACE };

/** The tree the birdhouse sits in: how tall it is drawn, and where the
 *  birdhouse is in the photo, measured from the foot of the trunk as fractions
 *  of the tree's height (from tools/make_cutouts.py). */
export const TREE = { h: 341, birdUp: 0.2227, birdAcross: 0.0115 };

const WORDS = ['bonk', 'whack', 'thwack', 'pow', 'bop', 'perfect'];

const PIECES: Piece[] = [
  { key: 'bug', file: 'bug.png', w: 270, anchor: GROUND },
  ...HEADS.flatMap((f, i): Piece[] => [
    { key: `head${i}`, file: `head${i}.png`, h: f.h, anchor: f.at ?? NECK },
    { key: `head${i}_dazed`, file: `head${i}-dazed.png`, h: f.dazedH ?? f.h + 1, anchor: f.dazedAt ?? f.at ?? NECK },
  ]),
  { key: 'dog', file: 'dog.png', w: 84, anchor: [0.66, 0.9] },
  { key: 'dog_mad', file: 'dog-mad.png', w: 67, anchor: [0.55, 0.92] },

  // Bill's body: three stop-motion frames, each anchored at the chin of the man
  // in the source photo (tools/make_cutouts.py prints these anchors)
  { key: 'bill_rest', file: 'bill-rest.png', scale: BODY_SCALE, anchor: [0.498, 0.218] },
  { key: 'bill_windup', file: 'bill-windup.png', scale: BODY_SCALE, anchor: [0.538, 0.34] },
  { key: 'bill_swing', file: 'bill-swing.png', scale: BODY_SCALE, anchor: [0.27, 0.187] },
  // Level 1: Bill as a kid on the Stingray. The bike is in the frames, so they
  // are pinned on the ground under it (anchors from tools/make_cutouts.py).
  { key: 'kid_rest', file: 'kid-rest.png', scale: KID_SCALE, anchor: [0.499, 0.993] },
  { key: 'kid_windup', file: 'kid-windup.png', scale: KID_SCALE, anchor: [0.499, 0.994] },
  { key: 'kid_swing', file: 'kid-swing.png', scale: KID_SCALE, anchor: [0.499, 0.993] },
  { key: 'kid_duck', file: 'kid-duck.png', scale: KID_SCALE, anchor: [0.499, 0.993] },
  // Bill from behind with the tennis racquet, pinned at the top of his collar
  // (the pins are printed by make_cutouts.py)
  { key: 'teen_rest', file: 'teen-rest.png', scale: TEEN_SCALE, anchor: [0.287, 0.291] },
  { key: 'teen_windup', file: 'teen-windup.png', scale: TEEN_SCALE, anchor: [0.234, 0.007] },
  { key: 'teen_swing', file: 'teen-swing.png', scale: TEEN_SCALE, anchor: [0.376, 0.369] },
  // what comes out of the bully's locker, and the mess it makes (dark splats
  // for the jar, light for the milkshake; each is pinned at the middle of its blob)
  { key: 'jar', file: 'jar.png', h: 86 },
  { key: 'shake', file: 'shake.png', h: 104 },
  { key: 'book', file: 'book.png', h: 108 },
  { key: 'splat0', file: 'splat0.png', w: 120, border: 1.5, anchor: [0.519, 0.476] },
  { key: 'splat1', file: 'splat1.png', w: 120, border: 1.5, anchor: [0.565, 0.451] },
  { key: 'splat2', file: 'splat2.png', w: 120, border: 1.5, anchor: [0.46, 0.496] },
  { key: 'splat3', file: 'splat3.png', w: 120, border: 1.5, anchor: [0.479, 0.492] },
  { key: 'blob', file: 'blob.png', w: 18, border: 1 },
  { key: 'paper_roll', file: 'paper-roll.png', w: 30, border: 1.4 },
  // The front-yard tree with a birdhouse in its fork, pinned where its trunk
  // meets the ground, and the birdhouse again on its own: it is drawn a size
  // larger in front of Bill, over the one in the tree, as the thing to duck.
  { key: 'tree', file: 'tree.png', h: TREE.h, border: 2, anchor: [0.496, 0.997] },
  { key: 'birdhouse', file: 'birdhouse.png', w: 62, border: 2, anchor: [0.5, 0.98] },
  // the street: mailboxes on posts, waiting and with a paper delivered, each
  // pinned where its post meets the ground (anchors from tools/make_cutouts.py)
  { key: 'mailbox0', file: 'mailbox-silver.png', scale: MAILBOX_SCALE, border: 2, anchor: [0.519, 0.972] },
  { key: 'mailbox0_hit', file: 'mailbox-silver-hit.png', scale: MAILBOX_SCALE, border: 2, anchor: [0.603, 0.973] },
  { key: 'mailbox1', file: 'mailbox-red.png', scale: MAILBOX_SCALE, border: 2, anchor: [0.516, 0.968] },
  { key: 'mailbox1_hit', file: 'mailbox-red-hit.png', scale: MAILBOX_SCALE, border: 2, anchor: [0.601, 0.97] },
  // the mailman, standing on the same spot in both photos
  { key: 'mailman', file: 'mailman.png', h: 138, border: 2, anchor: [0.557, 0.985] },
  { key: 'mailman_mad', file: 'mailman-mad.png', h: 136, border: 2, anchor: [0.49, 0.985] },

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
    key: 'sign0', file: 'sign.png', h: 167, anchor: [0.5, 0.995],
    decorate: lettering([['NO', 21], ['GAWKING', 16]], 0.5, 0.248, 18, INK),
  },
  {
    key: 'sign1', file: 'sign.png', h: 167, anchor: [0.5, 0.995],
    decorate: lettering([['ROAD', 21], ['WORK', 21]], 0.5, 0.248, 20, INK),
  },

  // effects
  { key: 'star', file: 'star.png', w: 27, border: 1.4 },
  { key: 'star_big', file: 'star.png', w: 84, border: 3 },
  { key: 'star_big_off', file: 'star.png', w: 84, border: 3, filter: 'grayscale(1) brightness(0.5)' },
  { key: 'puff', file: 'puff.png', w: 40, border: 0.8 },
  { key: 'burst', file: 'burst.png', w: 130, border: 2.5 },
  ...WORDS.map((w): Piece => ({ key: `word_${w}`, file: `word-${w}.png`, w: w === 'perfect' ? 124 : 106, border: 2.5 })),
  // Stephanie, the instructor on the workout tape: smiling, and the three faces of the breathing
  // (heights in faces and chins from tools/make_cutouts.py, so that all four are the same size and hang from the same point)
  { key: 'mom_smile', file: 'mom-smile.png', h: MOM_FACE * 1.925, border: 2, anchor: [0.482, 0.635] },
  { key: 'mom_in', file: 'mom-in.png', h: MOM_FACE * 1.925, border: 2, anchor: [0.482, 0.635] },
  { key: 'mom_pah', file: 'mom-pah.png', h: MOM_FACE * 1.925, border: 2, anchor: [0.481, 0.635] },
  { key: 'mom_hold', file: 'mom-hold.png', h: MOM_FACE * 1.92, border: 2, anchor: [0.482, 0.636] },
  // Bill's faces for the same breathing (heights in heads and chins from tools/make_cutouts.py again)
  { key: 'bill_in', file: 'billface-in.png', h: BILL_FACE * 1.031, border: 2.5, anchor: [0.498, 0.979] },
  { key: 'bill_hold', file: 'billface-hold.png', h: BILL_FACE * 1.019, border: 2.5, anchor: [0.498, 0.991] },
  { key: 'bill_pah', file: 'billface-pah.png', h: BILL_FACE * 1.092, border: 2.5, anchor: [0.498, 0.924] },
  // and the bodies their heads go on, one for each pose, standing on their spot on the floor
  ...Object.entries(WORKOUT_BODIES).flatMap(([who, poses]) => Object.entries(poses).map(([pose, body]): Piece => (
    { key: `pose_${who}_${pose}`, file: body.file, scale: body.scale, border: 2, anchor: body.spot }
  ))),
  // the fight after school: Stephanie's bodies in her cheer outfit, and the other girl before and after
  ...Object.entries(FIGHT_BODIES).flatMap(([who, poses]) => Object.entries(poses).map(([pose, body]): Piece => (
    { key: `${who}_${pose}`, file: body.file, scale: body.scale, border: 2, anchor: body.spot }
  ))),
  // the day Chad had had enough: the brothers' own faces, for each look there is a photo to do
  ...Object.entries(KID_LOOKS).flatMap(([who, { looks }]) => Object.entries(looks).flatMap(([look, { photo }]): Piece[] => {
    const face = BAT_FACES[who]?.[photo];
    return face ? [{ key: `${who}head_${look}`, file: face.file, h: KID_FACE * face.tall, border: 2, anchor: face.chin }] : [];
  })),
  // ...the faces that are seen close up in the sandbox, again and larger; and their mother's
  ...Object.entries(KID_CLOSE_UPS).flatMap(([who, looks]) => looks.flatMap((look): Piece[] => {
    const face = BAT_FACES[who]?.[KID_LOOKS[who].looks[look].photo];
    return face?.big ? [{ key: `${who}bighead_${look}`, file: face.big, h: KID_CLOSE * face.tall, border: 4, anchor: face.chin }] : [];
  })),
  { key: 'mom_scold', file: SAND.scold.file, h: MOM_FACE * SAND.scold.tall, border: 2, anchor: SAND.scold.chin },
  { key: 'mom_big_scold', file: SAND.scold.file, h: MOM_FACE * SAND.scold.tall * 2.6, border: 4, anchor: SAND.scold.chin },
  // the day of the pocket sand: the sandbox and the toys; the two of them hugging; their mother's
  // hands; and the two views (each pinned at the chin its head goes on, her forearm at its elbow)
  // (the sandbox is pinned where the boys stand in it, its near plank by its top edge; the toys
  // are the size of the ones in the pictures of Chad playing with them)
  { key: 'sandbox_photo', file: SAND.box.file, w: 430, border: 2.4, anchor: [0.5, 0.6] },
  { key: 'sandbox_near', file: SAND.box.front, w: 430, border: 2.4, anchor: [0.5, 0] },
  { key: 'sand_shovel', file: 'sand-shovel.png', h: 50, border: 1.6, anchor: [0.5, 0.5] },
  { key: 'sand_bucket', file: 'sand-bucket.png', h: 36, border: 1.6, anchor: [0.5, 0.5] },
  { key: 'sandcastle', file: 'sand-castle.png', h: 52, border: 1.6, anchor: [0.48, 0.97] },
  { key: 'sand_heap', file: 'sand-heap.png', w: 66, border: 1.6, anchor: [0.5, 0.9] },
  { key: 'sand_pile', file: 'sand-heap.png', w: 250, border: 3, anchor: [0.5, 0.9] },
  // ...and what flies: a speck (in the yard), a clump (close to), and a faceful
  { key: 'sand_speck', file: 'sand-heap.png', w: 13, border: 0.7, anchor: [0.5, 0.5] },
  { key: 'sand_clump', file: 'sand-heap.png', w: 30, border: 1, anchor: [0.5, 0.5] },
  { key: 'sand_blob', file: 'sand-heap.png', w: 66, border: 1.6, anchor: [0.5, 0.5] },
  { key: 'hand_grab', file: 'hand-grab.png', h: 430, border: 3, anchor: [0.5, 0.84] },
  { key: 'hand_throw', file: 'hand-throw.png', w: 340, border: 3, anchor: [0.17, 0.5] },
  ...Object.entries(SAND.pairs).map(([name, pair]): Piece => ({ key: `pair_${name}`, file: pair.file, scale: pair.scale, border: 2, anchor: pair.spot })),
  { key: 'shane_above', file: SAND.above.file, h: SAND_ABOVE, border: 3, anchor: SAND.above.chin },
  { key: 'mom_below', file: SAND.below.file, h: SAND_BELOW, border: 3, anchor: SAND.below.chin },
  { key: 'mom_forearm', file: SAND.below.arm.file, h: SAND_BELOW * SAND.below.arm.tall, border: 3, anchor: SAND.below.arm.pivot },
  // ...and the bodies of the five-year-olds they were, one for each pose, standing on their spot on the grass
  ...Object.entries(BAT_BODIES).flatMap(([who, poses]) => Object.entries(poses).map(([pose, body]): Piece => (
    { key: `${who}_${pose}`, file: body.file, scale: body.scale, border: 2, anchor: body.spot }
  ))),
  // ...what there is in their back yard to run past; and the back of the house, pinned at the
  // middle of its doorstep, with their mother's body to stand on it
  { key: 'yard_swing', file: 'yard-swing.png', h: 240, border: 2, anchor: [0.5, 0.95] },
  { key: 'yard_pool', file: 'yard-pool.png', w: 200, border: 2, anchor: [0.5, 0.75] },
  { key: 'yard_line', file: 'yard-line.png', h: 205, border: 2, anchor: [0.5, 0.99] },
  { key: 'yard_bush', file: 'yard-bush.png', h: 112, border: 2, anchor: [0.5, 0.95] },
  { key: 'yard_tree', file: 'yard-tree.png', h: 310, border: 2, anchor: [0.5, 0.99] },
  ...(BAT_DOOR ? [
    { key: 'yard_house', file: BAT_DOOR.house.file, scale: BAT_DOOR.house.scale, border: 2.5, anchor: BAT_DOOR.house.spot },
    { key: 'batmom_akimbo', file: BAT_DOOR.mom.file, scale: BAT_DOOR.mom.scale, border: 2.5, anchor: BAT_DOOR.mom.spot },
  ] as Piece[] : []),
  // ...and what gets broken in the gym
  { key: 'bleachers', file: 'gym-bleachers.png', w: 380, border: 2.2, anchor: [0.5, 0.975] },
  { key: 'bake_table', file: 'gym-table.png', w: 250, border: 2.2, anchor: [0.5, 0.975] },
  { key: 'hoop', file: 'gym-hoop.png', h: 340, border: 2, anchor: [0.49, 0.99] },
  // the television and the recorder under it (its screen is cut out afterwards: see punchHole)
  { key: 'tv_set', file: 'tv-set.png', w: TV.w, border: 2.5, anchor: [0, 0] },
  // a hand holding a phone, pinned at the wrist (which hides behind the gawker's head)
  { key: 'armphone', file: 'hand-phone.png', w: 54, border: 1.6, anchor: [0.97, 0.822] },
  // a bluebird, wings up and wings down, both pinned at the chest so only the wings move
  { key: 'bird_up', file: 'bird-up.png', scale: 0.08, border: 1.2, anchor: [0.371, 0.774] },
  { key: 'bird_down', file: 'bird-down.png', scale: 0.08, border: 1.2, anchor: [0.251, 0.253] },
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

function loadImage(address: string | undefined): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const src = picture(address);
    if (!src) return resolve(null);
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** Cut a hole in a sticker: the shape of `mask`, laid over the picture the
 *  sticker was made from. The white edge and the shadow stay round the outside
 *  only, which they would not if the hole were in the picture to begin with. */
function punchHole(scene: Phaser.Scene, key: string, mask: HTMLImageElement): void {
  const texture = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
  const a = ART[key], c = texture.getContext();
  c.save();
  c.globalCompositeOperation = 'destination-out';
  c.drawImage(mask, a.pad * TEX, a.pad * TEX, a.w * TEX, a.h * TEX);
  c.restore();
  texture.refresh();
}

/** The quick games that keep their own pictures (a folder each in src/minis): each draws
 *  its paper stand-ins, and then its photos take their places. Each is fenced in while it
 *  does: it can make pictures by its own name, and cannot draw over anybody else's. */
async function loadGames(scene: Phaser.Scene): Promise<void> {
  for (const game of ROSTER) {
    if (!game.art && !game.pieces && !game.files && !game.photos) continue;
    const names = new Set<string>([...(game.pieces ?? []).map((p) => p.file), ...(game.files ?? [])]);
    const loaded = new Map<string, HTMLImageElement>();
    await Promise.all([...names].map(async (n) => {
      const im = await loadImage(ownUrl(game.id, n));
      if (im) loaded.set(n, im);
    }));
    fence(game.id, scene.textures.getTextureKeys());
    try {
      game.art?.(scene);
      for (const p of game.pieces ?? []) {
        const im = loaded.get(p.file);
        if (im) makePhotoArt(scene, p.key, im, p);
      }
      game.photos?.(scene, loaded);
    } finally {
      fence(null);
    }
  }
}

/** Load every photo cutout and swap it in over its drawn stand-in. */
export async function loadPhotoArt(scene: Phaser.Scene): Promise<void> {
  await loadPictures();
  const sheets = PAPERS;
  const names = new Set<string>([
    ...PIECES.map((p) => p.file), ...PHOTO_VEHICLES.map((v) => v.file), 'postcard.jpg', 'rail.png', 'asphalt.jpg', 'houses.jpg', 'fence.png', 'concrete.jpg', 'hallway.jpg',
    'tv-glass.png', 'tape-room.jpg', 'den.jpg', 'gym.jpg', 'yard-sky.jpg', 'yard-ground.png', 'sand-close.jpg',
    ...sheets.map((n) => `paper-${n}.png`),
  ]);
  const loaded = new Map<string, HTMLImageElement>();
  await Promise.all([...names].map(async (n) => {
    const im = await loadImage(url(n));
    if (im) loaded.set(n, im);
  }));

  // the cut-paper interface first, so photo pieces with the same key win
  for (const n of sheets) {
    const im = loaded.get(`paper-${n}.png`);
    if (im) addPaper(n, im);
  }
  buildPaperUi(scene);
  buildStreetArt(scene, loaded.get('head4.png'), loaded.get('head4-dazed.png'));
  buildHallArt(scene);
  buildSleepoverArt(scene);
  buildMiniArt(scene);
  buildFightArt(scene);
  buildBatArt(scene);
  buildSandArt(scene);

  for (const p of PIECES) {
    const im = loaded.get(p.file);
    if (im) makePhotoArt(scene, p.key, im, p);
  }

  // the workout tape: the glass of the television is a hole the tape shows through; the room on
  // the tape goes behind it; and the den is the whole backdrop, kept at the photo's own size
  const glass = loaded.get('tv-glass.png');
  if (glass && loaded.has('tv-set.png')) punchHole(scene, 'tv_set', glass);
  const room = loaded.get('tape-room.jpg');
  if (room) makePhotoTile(scene, 'tape_room', room, TV.screen.h);
  const den = loaded.get('den.jpg');
  if (den) makePhotoTile(scene, 'den', den, den.naturalHeight, true);
  const gym = loaded.get('gym.jpg');
  if (gym) makePhotoTile(scene, 'gym', gym, gym.naturalHeight, true);
  // sand, close to
  const sandClose = loaded.get('sand-close.jpg');
  if (sandClose) makePhotoTile(scene, 'sand_close', sandClose, sandClose.naturalHeight / 2, true);
  // the back yard, in two strips that go by at different speeds: the sky, and the fence and grass
  const yardSky = loaded.get('yard-sky.jpg'), yardGround = loaded.get('yard-ground.png');
  if (BAT_YARD && yardSky && yardGround) {
    makePhotoTile(scene, 'yard_sky_photo', yardSky, yardSky.naturalHeight / BAT_YARD.detail, true);
    makePhotoTile(scene, 'yard_ground', yardGround, yardGround.naturalHeight / BAT_YARD.detail, true);
  }

  // Photo heads: only styles with both photos are used. Each gets a neck cut
  // from paper the colour of its own skin, and a tint so the arm that holds a
  // phone matches too.
  let heads = 0;
  while (loaded.has(`head${heads}.png`) && loaded.has(`head${heads}-dazed.png`)) heads++;
  if (heads > 0) {
    setHeadStyles(heads);
    const armPhoto = loaded.get('hand-phone.png');
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
  const tarmac = loaded.get('asphalt.jpg');
  if (tarmac) makePhotoTile(scene, 'asphalt', tarmac, 192);
  const rail = loaded.get('rail.png');
  if (rail) makePhotoTile(scene, 'rail', rail, 30);
  // the street: houses and lawns across the road, the picket fence, the pavement
  const houses = loaded.get('houses.jpg');
  if (houses) makePhotoTile(scene, 'houses', houses, 352, true);
  const fence = loaded.get('fence.png');
  if (fence) makePhotoTile(scene, 'fence', fence, 40);
  const concrete = loaded.get('concrete.jpg');
  if (concrete) makePhotoTile(scene, 'sidewalk', concrete, 96);
  // the school hallway: one photo is the whole backdrop of the bonus level
  const hallway = loaded.get('hallway.jpg');
  if (hallway) makePhotoTile(scene, 'hallway', hallway, HALL.photoH, true);

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

  await loadGames(scene);
}
