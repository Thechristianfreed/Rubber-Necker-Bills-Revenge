/** The photo bodies for this game, once there are some: for each of the two of them
 *  ('steph', 'her') and each pose, where the chin goes from the spot she stands on (in
 *  game pixels) and how far her head tips. A pose that is not here is still a paper doll
 *  (art.ts), and its chin is the doll's.
 *
 *  Written by cut.py once there are photos to cut: until then it is empty. */
export interface Body { chin: [number, number]; tilt: number }

export const BODIES: Record<string, Record<string, Body>> = {};
