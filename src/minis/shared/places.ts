import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { HALL } from '../../art/hallway';
import { ROOM } from '../../art/sleepover';
import { ART, img } from '../../art/sticker';
import { SAND } from '../../data/sand';
import { FLOOR } from './yard';

/** The places there already are, for a new game to be set in. Each is laid with
 *  one call, just as the game that first had it lays it, and says where its
 *  floor is: that is where feet go.
 *
 *  A place is only what is behind (depths 1 to 8). The game puts its own people
 *  and things in front, from depth 10 up. There is a picture of every place, and
 *  of every thing that can be put in one, in docs/catalogue.
 *
 *  These are for using, not for changing: a game that needs a place to look
 *  different lays it and then adds to it. (The games that first had them have
 *  their own copies of these few lines, so nothing here can upset them.) */

type Scene = Phaser.Scene;
type Image = Phaser.GameObjects.Image;

/** A strip that runs the whole width of the page, and a bit over at each side. */
function strip(scene: Scene, key: string, y: number, tall: number, depth = 1): void {
  if (!scene.textures.exists(key)) return;
  const d = ART[key].tex ?? TEX;
  scene.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * d, tall * d, key).setOrigin(0, 0).setScale(1 / d).setDepth(depth);
}

/** A photo that is the whole of the place: put so that the floor in it is at `floor` on the page. */
function backdrop(scene: Scene, key: string, floor: number, floorInPhoto: number): void {
  scene.add.image(-BLEED, floor - floorInPhoto, key).setOrigin(0, 0).setScale(1 / (ART[key].tex ?? TEX)).setDepth(1);
}

// ---- the school gym (from the fight after school) ---------------------------------------------

export const GYM = { floor: 428 };

/** The gym: painted block wall, wooden floor. */
export function layGym(scene: Scene): void {
  backdrop(scene, 'gym', 410, 455);
}

/** ...and what stands in it: the hoop, the bleachers and the bake-sale table, where the fight
 *  has them. They are handed back, to be moved, hidden or knocked over. */
export function gymThings(scene: Scene): { hoop: Image; bleachers: Image; table: Image } {
  return {
    hoop: img(scene, view.W - 96, GYM.floor - 12, 'hoop').setDepth(3),
    bleachers: img(scene, view.W / 2, GYM.floor - 16, 'bleachers').setDepth(4),
    table: img(scene, 124, GYM.floor + 34, 'bake_table').setDepth(8),
  };
}

// ---- the den (from Mom's workout tape) --------------------------------------------------------

export const DEN = { floor: 404 };

/** The den: wood panelling and carpet. (The television that stands in it is `tv_set`, with a hole
 *  for a screen: WorkoutMini shows how something is played behind the glass.) */
export function layDen(scene: Scene): void {
  backdrop(scene, 'den', DEN.floor, 431);
}

// ---- the road (from the highway, and the tour bus) --------------------------------------------

export const ROAD = { top: 206 };

/** The coast road: the postcard along the top, and tarmac from its lower edge down. */
export function layRoad(scene: Scene): void {
  const sky = scene.add.graphics().setDepth(0);
  sky.fillStyle(0x7fb0d8, 1);
  sky.fillRect(-BLEED, -BLEED, MAX_W + BLEED * 2, H + BLEED * 2);
  strip(scene, 'postcard', -10, ART.postcard?.h ?? 0);
  strip(scene, 'asphalt', ROAD.top, H - ROAD.top + BLEED);
  const edge = scene.add.graphics().setDepth(2);
  edge.fillStyle(0xfbf6ea, 1);
  edge.fillRect(-BLEED, ROAD.top - 3, MAX_W + BLEED * 2, 3.5);
}

// ---- the school hallway (from the bully's locker) ---------------------------------------------

export const HALLWAY = { floor: HALL.floorY };

/** The hallway: one photo of it, lockers along the far wall, seen from across the corridor. */
export function layHallway(scene: Scene): void {
  if (!scene.textures.exists('hallway')) return;
  scene.add.image(view.W / 2, HALL.photoY, 'hallway').setOrigin(0.5, 0).setScale(1 / (ART.hallway.tex ?? TEX)).setDepth(1);
}

// ---- the basement at the sleepover (cut paper so far) -----------------------------------------

export const REC_ROOM = { floor: ROOM.floorY };

/** The basement: wall, carpet, a window with the night in it, and the couch (handed back). */
export function layRecRoom(scene: Scene): { couch: Image } {
  strip(scene, 'rec_wall', -BLEED, ART.rec_wall.h);
  strip(scene, 'rec_floor', ROOM.floorY, ART.rec_floor.h);
  img(scene, view.W / 2 + 30, 150, 'rec_window').setDepth(2);
  return { couch: img(scene, view.W / 2, ROOM.couchY, 'rec_couch').setDepth(8) };
}

// ---- the brothers' back yard (from Payback, and the sandbox) ----------------------------------

/** The yard itself, the back of the house, and their mother on its doorstep are in yard.ts. */
export { layYard, raiseHouse, standMom } from './yard';
export const YARD = { floor: FLOOR };

/** The photo of the sandbox was taken from well above it: it is drawn this much flatter, to lie on the grass. */
const LIES = 0.4;

/** The sandbox, with its middle at `x`: the box, and its near plank again in front of whoever
 *  is standing in the sand. Lay the yard first. */
export function laySandbox(scene: Scene, x: number): void {
  const box = ART.sandbox_photo, flat = (im: Image) => im.setScale(im.scaleX, im.scaleY * LIES);
  flat(img(scene, x, FLOOR + 4, 'sandbox_photo').setDepth(7));
  flat(img(scene, x, FLOOR + 4 + (SAND.box.near * box.h - box.ay) * LIES, 'sandbox_near').setDepth(13));
}
