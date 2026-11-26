import { FROM } from '../../art/sticker';

/** Where things are in "Take 'em for a ride": what the art and the game both have
 *  to agree on. Everything is in the game's own pixels (the page is 540 tall).
 *
 *  What is written here is the paper: how the stand-ins are drawn. When a photo
 *  takes a stand-in's place, its numbers (where a chin goes, where the doorway is)
 *  will come from the photo, written by cut.py, as "Pappy comes home" does it. */

export type V = [number, number];

// ---- the people -------------------------------------------------------------------------------

/** How tall a head is on a body, hair to chin, before the body is scaled: a grown-up's, a child's. */
export const HEAD = 70;
export const KID_HEAD = 56;

/** A body in a pose: how big its picture is, the spot it stands on (in its picture), where its chin
 *  goes from that spot, how far the head tips, and how tall the head is. */
export interface Body { w: number; h: number; ax: number; ay: number; chin: V; tilt: number; head: number }

const adult = (chin: V, tilt = 0, w = 260, ax = 130): Body => ({ w, h: 290, ax, ay: 276, chin, tilt, head: HEAD });
const kid = (chin: V, tilt = 0): Body => ({ w: 150, h: 170, ax: 75, ay: 162, chin, tilt, head: KID_HEAD });

export const BODIES: Record<string, Body> = {
  // Pappy, in the back of the van, facing the open door (to the left): waiting, winding up, kicking
  pappy_wait: adult([-8, -194], -0.08),
  pappy_ready: adult([-4, -196], -0.06),
  pappy_kick: adult([16, -190], 0.14, 300, 170),
  // ...home again: going in for a kiss (Mammy is to his right), and the champagne up in the air
  pappy_kiss: adult([34, -188], 0.26),
  pappy_bottle: adult([-2, -200], -0.04),
  // Mammy with a glass
  mammy_glass: adult([0, -200]),
  // Stephanie with her duck held to her, and with her arms down; Curt
  steph_hold: kid([2, -130], 0.04),
  steph_stand: kid([0, -130]),
  curt_stand: kid([0, -132]),
};

/** In Pappy's kicking pose, from the spot he stands on: where his foot is. */
export const FOOT: V = [-112, -76];
/** ...and in Stephanie's holding pose, where the duck sits in her arms. */
export const ARMS: V = [20, -96];
/** In Pappy's champagne pose, his hand up in the air; in Mammy's, the hand with the glass. */
export const BOTTLE_HAND: V = [62, -260];
export const GLASS_HAND: V = [46, -244];

// ---- the van ----------------------------------------------------------------------------------

/** The van from outside, side on, facing right: how big, and the spot under it that it stands on. */
export const VAN = { w: 560, h: 250, ax: 280, ay: 238 };
/** Where the wheels go, from that spot (and how big they are). */
export const WHEELS: V[] = [[-160, -38], [160, -38]];
export const WHEEL_R = 38;
/** The windows, from that spot: the middle of the bottom of each. Pappy is at the front one. */
export const DRIVER: V = [128, -128];
export const WINDOWS: V[] = [[-2, -128], [-120, -128], [-205, -128], [-68, -128], [46, -128]];

/** Inside the van, looking out of the open side door: the doorway, on the page. */
export const DOORWAY = { l: 70, r: 430, t: 92, b: 452 };
/** The inside of the van is drawn this wide and tall (from -BLEED, -BLEED on the page). */
export const INSIDE = { w: 1340, h: 640 };

// ---- the drive --------------------------------------------------------------------------------

/** The two lanes: where the wheels are in each. */
export const LANES = [432, 512];
/** The van is drawn this much of its size on the road. */
export const ON_ROAD = 0.62;

/** Whether one of this game's pictures is its photo yet (and not the paper it is drawn as until then). */
export const isPhoto = (name: string): boolean => !!FROM[`ride_${name}`];
