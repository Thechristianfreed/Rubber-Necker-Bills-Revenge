import { H } from '../../config';
import { FROM } from '../../art/sticker';
import { CUT } from './cut';

/** Where things are in "Pappy comes home": what the art and the game both have to
 *  agree on. Everything is in the game's own pixels (the page is 540 tall).
 *
 *  Each thing is in two places. What is written out here is the paper: how the
 *  stand-ins are drawn. Where a photo has taken a stand-in's place, its numbers
 *  come from the photo itself (cut.ts, which cut.py writes), and the functions at
 *  the foot of this file hand over whichever is on the page. */

type V = [number, number];

// ---- the front door, seen over Pappy's shoulder -----------------------------------------------

/** The door itself: how big, how far down the page its top is, and how wide the frame round it. */
export const DOOR = { w: 236, h: 436, top: 56, frame: 16 };
/** On the door, from its top left corner: the keyhole of the lock, and the knob under it. */
export const LOCK: V = [36, 214];
export const KNOB: V = [36, 262];
/** How tall Mammy's head is (hair to chin) when the door flies open, and once she is in his face. */
export const DOOR_FACE = 150;
export const LUNGE = 1.45;

// ---- the two of them, in the front room -------------------------------------------------------

/** Where their feet (and his knees) are, a little way out on the carpet. */
export const GROUND = 458;
/** They are drawn this much bigger than their pictures, so that they can be seen from the couch. */
export const SIZE = 1.25;
/** How tall a head is on a body, hair to chin, before that. */
export const HEAD = 70;

/** A body in a pose: how big its picture is, where on it the spot it stands on is, where the
 *  chin of its head goes from there, and how far the head tips. (When a photo takes the place
 *  of a paper body, its chin is written here by cut.py.) */
export interface Body { w: number; h: number; ax: number; ay: number; chin: V; tilt: number }

export const BODIES: Record<string, Body> = {
  // Pappy: hat in his hands; on his knees, begging; and leaning in, eyes shut
  pappy_stand: { w: 200, h: 270, ax: 100, ay: 258, chin: [2, -200], tilt: 0 },
  pappy_kneel: { w: 220, h: 220, ax: 96, ay: 208, chin: [12, -136], tilt: 0.06 },
  pappy_smooch: { w: 240, h: 200, ax: 100, ay: 188, chin: [54, -108], tilt: 0.38 },
  // Mammy: hands on her hips; and bent over, with her back to him
  mammy_stand: { w: 220, h: 270, ax: 110, ay: 258, chin: [0, -200], tilt: 0 },
  mammy_bent: { w: 260, h: 270, ax: 112, ay: 258, chin: [90, -172], tilt: -0.1 },
  // ...and in the doorway, from the waist up, arms folded round a rolling pin
  mammy_door: { w: 340, h: 330, ax: 170, ay: 330, chin: [0, -254], tilt: 0 },
};

/** On Mammy bent over, from the spot she stands on: where a kiss lands. */
export const KISS_AT: V = [-80, -124];
/** How many kisses it takes. */
export const NEED = 8;

// ---- paper, or the photo that has taken its place ---------------------------------------------

/** Whether one of this game's pictures is its photo yet (and not the paper it is drawn as until then). */
export const isPhoto = (name: string): boolean => !!FROM[`homecoming_${name}`];

/** How tall the photo of the front of the house is drawn: a little more than the page, for when it shakes. */
export const PORCH_TALL = 572;
/** How wide the door is drawn where it is a photo: as wide as the doorway in the photo of the house. */
export const DOOR_WIDE = ((CUT.porch.door[2] - CUT.porch.door[0]) * PORCH_TALL) / CUT.porch.size[1];

/** The front of the house, with the middle of the page at `cx`: where the photo of it goes (if
 *  there is one), where the doorway is and how big, and where the keyhole is. */
export function porchPlan(cx: number): { photo: boolean; x: number; y: number; left: number; top: number; w: number; h: number; lock: V } {
  if (!isPhoto('porch')) {
    const left = cx + 96 - DOOR.w / 2;
    return { photo: false, x: 0, y: 0, left, top: DOOR.top, w: DOOR.w, h: DOOR.h, lock: [left + LOCK[0], DOOR.top + LOCK[1]] };
  }
  const P = CUT.porch, k = PORCH_TALL / P.size[1], x = cx - (P.size[0] * k) / 2, y = (H - PORCH_TALL) / 2;
  return { photo: true, x, y, left: x + P.door[0] * k, top: y + P.door[1] * k, w: DOOR_WIDE, h: (P.door[3] - P.door[1]) * k, lock: [x + P.lock[0] * k, y + P.lock[1] * k] };
}

/** How far a head tips on each photo of a body. (The bodies came looking where they were going;
 *  the heads that go on them look at the camera.) */
const TIPS: Record<string, number> = { pappy_stand: 0.05, pappy_kneel: 0.05, pappy_smooch: 0.3, mammy_stand: 0, mammy_bent: -0.14, mammy_door: 0 };

/** Where the chin goes on a body, from the spot it is held by, and how far the head tips. */
export function bodyOf(name: string): { chin: V; tilt: number } {
  if (!isPhoto(name)) return BODIES[name];
  return { chin: (CUT.bodies as Record<string, { chin: number[] }>)[name].chin as V, tilt: TIPS[name] };
}

/** On Mammy bent over, from the spot she stands on: where a kiss lands; and the part of her
 *  bloomers that the marks of them are left on (left, top, right, bottom). */
export function kissAt(): V {
  return isPhoto('mammy_bent') ? (CUT.kiss as V) : KISS_AT;
}

export function marksOn(): [number, number, number, number] {
  if (!isPhoto('mammy_bent')) return [KISS_AT[0] + 10, KISS_AT[1] - 31, KISS_AT[0] + 54, KISS_AT[1] + 31];
  const [x0, y0, x1, y1] = CUT.bloomers;
  return [x0 + 5, y0 + 8, x0 + (x1 - x0) * 0.6, y1 - 12];
}
