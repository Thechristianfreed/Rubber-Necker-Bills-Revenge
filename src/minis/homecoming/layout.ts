/** Where things are in "Pappy comes home": what the paper art and the game both
 *  have to agree on. Everything is in the game's own pixels (the page is 540 tall). */

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
