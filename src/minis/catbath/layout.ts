import { FROM } from '../../art/sticker';

/** Where things are in "Bath time": what the art and the game both have to agree on.
 *  Everything is in the game's own pixels (the page is 540 tall).
 *
 *  What is written here is the paper: how the stand-ins are drawn. When a photo takes a
 *  stand-in's place, its numbers (where a chin goes, where his hands are) will come from
 *  the photo, written by cut.py, as "Pappy comes home" does it. */

export type V = [number, number];

// ---- Pappy at the sink ------------------------------------------------------------------------

/** How tall his head is on a body, hair to chin, before the body is scaled. */
export const HEAD = 70;
/** At the sink he is drawn this much bigger than his pictures, standing this far down the page
 *  (his feet are under the counter, off the foot of the page). */
export const AT_SINK = 1.5;
export const FEET = 566;

/** A body in a pose (facing the camera, across the sink): how big its picture is, the spot it
 *  stands on, where its chin goes from that spot, how far the head tips; where his hands are;
 *  and where a cat he is holding is held (its neck, or its middle when it is being wrung). */
export interface Body { w: number; h: number; ax: number; ay: number; chin: V; tilt: number; hands: [V, V]; grip: V }

const body = (chin: V, tilt: number, hands: [V, V], grip: V): Body => ({ w: 340, h: 330, ax: 130, ay: 300, chin, tilt, hands, grip });

export const BODIES: Record<string, Body> = {
  // hands on the counter
  stand: body([0, -200], 0, [[-56, -110], [56, -110]], [0, -110]),
  // reaching over for the next one, on the counter to his right (the left of the page)
  grab: body([-6, -198], -0.08, [[-120, -128], [56, -110]], [-120, -128]),
  // both hands round its neck, out over the sink
  choke: body([-4, -200], -0.06, [[70, -190], [100, -186]], [86, -188]),
  // down at the washboard
  scrub: body([6, -196], 0.08, [[66, -150], [106, -146]], [86, -150]),
  // one end in each hand, out over the sink
  wring: body([0, -200], 0, [[22, -178], [150, -178]], [86, -178]),
  // up at the clothesline
  hang: body([0, -200], 0, [[-30, -262], [30, -262]], [0, -262]),
};

/** The sink is this far to his left (the right of the page), and its rim this far down the page. */
export const SINK_OFF = 130;
export const RIM = 400;
/** The washboard: how far it stands up out of the sink, and the part of it a cat is scrubbed on. */
export const BOARD = { w: 96, h: 176, top: 236, scrub: [262, 352] as V };

/** The clothesline, and where on it each cat is hung, from the middle of the page. */
export const LINE = 118;
export const SPOTS = [-330, 170, 340];

/** Whether one of this game's pictures is its photo yet (and not the paper it is drawn as until then). */
export const isPhoto = (name: string): boolean => !!FROM[`catbath_${name}`];
