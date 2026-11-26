/** Bill's hands (FV2), as they are cut from the sheet: the picture, how many of the game's
 *  pixels one of its own is, and the point each is held by, as a fraction of the picture
 *  (the wrist of the one that points, the foot of the finger that is up, the middle of the
 *  open palm). Each is a right hand, and the game turns it over for the other side.
 *  Written by cut.py; do not edit by hand. */
export const HANDS: Record<string, { file: string; scale: number; anchor: [number, number] }> = {
  point: { file: 'hand-point.png', scale: 0.22, anchor: [0.322, 0.447] },
  shh: { file: 'hand-shh.png', scale: 0.22, anchor: [0.749, 0.228] },
  cup: { file: 'hand-cup.png', scale: 0.22, anchor: [0.509, 0.386] },
};
