// Written by cut.py (src/minis/veggies/cut.py): do not edit by hand.
import { Piece } from '../kit';

/** The photos that take the place of the paper pieces: how big each is drawn, and where it is held. */
export const CUT: Piece[] = [
  { key: 'veggies_body', file: 'body.png', w: 130.0, border: 2.4, anchor: [0.4971, 0.0544] },
  { key: 'veggies_kidarm', file: 'kidarm.png', w: 89.1, border: 2, anchor: [0.1250, 0.4770] },
  { key: 'veggies_carrot', file: 'carrot.png', w: 190.0, border: 2.4, anchor: [0.9961, 0.4695] },
  { key: 'veggies_corn', file: 'corn.png', w: 170.0, border: 2.4, anchor: [0.9948, 0.5556] },
  { key: 'veggies_broccoli', file: 'broccoli.png', w: 176.0, border: 2.4, anchor: [0.9931, 0.5484] },
  { key: 'veggies_leaf', file: 'leaf.png', w: 28.0, border: 1.2, anchor: [0.5000, 0.5000] },
  { key: 'veggies_arm_bill', file: 'arm-bill.png', w: 194.0, border: 2.2, anchor: [0.0795, 0.4518] },
  { key: 'veggies_fist', file: 'fist.png', w: 60.1, border: 2, anchor: [0.5979, 0.5629] },
  { key: 'veggies_arm_steph', file: 'arm-steph.png', w: 79.2, border: 2.2, anchor: [0.0400, 0.4714] },
  { key: 'veggies_forearm', file: 'forearm.png', w: 83.6, border: 2.2, anchor: [0.1585, 0.4756] },
  { key: 'veggies_pinch', file: 'pinch.png', w: 60.5, border: 2, anchor: [0.0243, 0.2437] },
  { key: 'veggies_palm', file: 'palm.png', w: 32.6, border: 2, anchor: [0.4662, 0.5535] },
  { key: 'veggies_noodles', file: 'noodles.png', w: 140.0, border: 2.4, anchor: [0.5000, 0.9700] },
  { key: 'veggies_teeth_top', file: 'teeth-top.png', w: 66.0, h: 33.8, border: 0, anchor: [0.0000, 0.3878] },
  { key: 'veggies_teeth_bot', file: 'teeth-bot.png', w: 66.0, h: 36.0, border: 0, anchor: [0.0000, 0.7444] },
  { key: 'veggies_tongue', file: 'tongue.png', w: 76.0, border: 0, anchor: [0.0200, 0.9200] },
];

/** The vegetables, as the photos of them are: how long each is drawn, how tall that makes it, and how wide
 *  his mouth has to open for it (how thick it is where it goes in, and a bit). */
export const VEG_FIT: Record<string, { len: number; thick: number; tall: number }> = { veggies_carrot: { len: 190, thick: 34, tall: 61.3 }, veggies_corn: { len: 170, thick: 52, tall: 55.6 }, veggies_broccoli: { len: 176, thick: 126, tall: 150.5 } };

/** His body in the photo: where his two shoulders are from his chin (an arm is pinned at each). And his
 *  mother's hands: where the wrist of each is from the spot it is held by, as it is drawn. */
export const FIT = { body: { shoulders: [[-55.6, 32.2], [53.6, 32.2]] }, hands: { pinch: { wrist: [52.9, 28.1] }, palm: { wrist: [-1.3, 29.9] } } };
