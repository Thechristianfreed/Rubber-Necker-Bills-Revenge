import { Doll, Look } from '../../art/fight';

/** The paper dolls of this game, joint by joint: Chad with a golf club, Bill
 *  watching him, and whoever is out on the trail the next day. They are what is
 *  on the page until there are photos of the same poses (the prompts are in the
 *  README), and they say where a head goes on each: the chin, a little under the
 *  middle of the paper head. Everybody is drawn facing right. */

type V = [number, number];

/** A golfer's pose: the doll, and the club in its hands (where it is held, which way
 *  it points, and whether it is behind him). The club is a piece of its own on the
 *  paper doll, so that it can be the one the player picked. */
export interface Swing extends Doll {
  grip: V;
  /** Which way the club points from the hands, in radians, clockwise from straight right. */
  club: number;
  behind: boolean;
}

/** Chad at the tee: over the ball, at the top of his swing, and after it. He
 *  faces us, as golfers on television do, with the fairway off to the right. */
export const CHAD_GOLF: Record<string, Swing> = {
  address: {
    hips: [[-9, -50], [9, -50]], knees: [[-13, -26], [13, -26]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-15, -94], [15, -94]], elbows: [[-12, -73], [13, -73]], hands: [[0, -57], [4, -56]],
    head: [0, -121], tilt: 0.05,
    grip: [2, -57], club: 0.99, behind: false,
  },
  back: {
    hips: [[-10, -50], [8, -50]], knees: [[-14, -26], [12, -27]], feet: [[-18, 0], [18, 0]],
    shoulders: [[-17, -94], [13, -96]], elbows: [[-35, -103], [-7, -108]], hands: [[-27, -121], [-23, -117]],
    head: [-2, -122], tilt: -0.08,
    grip: [-25, -119], club: -0.5, behind: true,
  },
  follow: {
    hips: [[-6, -50], [12, -50]], knees: [[-7, -27], [16, -26]], feet: [[-15, -4], [20, 0]],
    shoulders: [[-11, -96], [19, -94]], elbows: [[9, -108], [35, -104]], hands: [[21, -121], [25, -117]],
    head: [6, -122], tilt: 0.1,
    grip: [23, -119], club: 2.6, behind: true,
  },
};

/** Bill, who brought him: leaning on a club; and with both hands to his head. */
export const BILL_GOLF: Record<string, Doll> = {
  stand: {
    hips: [[-14, -112], [14, -112]], knees: [[-16, -56], [16, -56]], feet: [[-20, 0], [20, 0]],
    shoulders: [[-28, -186], [28, -186]], elbows: [[-52, -150], [42, -148]], hands: [[-22, -122], [52, -112]],
    head: [0, -228], tilt: 0,
  },
  ohno: {
    hips: [[-14, -112], [14, -112]], knees: [[-18, -56], [18, -56]], feet: [[-24, 0], [24, 0]],
    shoulders: [[-28, -186], [28, -186]], elbows: [[-64, -204], [64, -204]], hands: [[-40, -246], [40, -246]],
    head: [0, -228], tilt: 0.05,
  },
};

/** Somebody out on the trail: two steps of a walk, and two of a run. */
export const TRAIL: Record<string, Doll> = {
  walk1: {
    hips: [[-12, -112], [12, -112]], knees: [[-24, -58], [22, -60]], feet: [[-42, -2], [34, 0]],
    shoulders: [[-22, -186], [24, -186]], elbows: [[-34, -150], [36, -152]], hands: [[-20, -120], [48, -126]],
    head: [4, -228], tilt: 0.04,
  },
  walk2: {
    hips: [[-12, -112], [12, -112]], knees: [[20, -60], [-18, -58]], feet: [[34, 0], [-38, -4]],
    shoulders: [[-22, -186], [24, -186]], elbows: [[-30, -150], [30, -150]], hands: [[-40, -124], [20, -118]],
    head: [4, -226], tilt: 0.04,
  },
  run1: {
    hips: [[-4, -110], [20, -110]], knees: [[-32, -74], [46, -82]], feet: [[-70, -46], [54, -10]],
    shoulders: [[-2, -182], [42, -182]], elbows: [[-26, -158], [60, -150]], hands: [[-6, -134], [80, -172]],
    head: [34, -222], tilt: 0.16,
  },
  run2: {
    hips: [[-4, -110], [20, -110]], knees: [[40, -80], [-18, -70]], feet: [[70, -28], [-60, -36]],
    shoulders: [[-2, -182], [42, -182]], elbows: [[-22, -152], [62, -158]], hands: [[6, -172], [44, -130]],
    head: [34, -220], tilt: 0.16,
  },
};

export const CHAD_LOOK: Look = { skin: 'manila', top: 'sky', shorts: 'blue', arm: 9, leg: 11 };
export const BILL_LOOK: Look = { skin: 'manila', top: 'red', legs: 'cream', arm: 13, leg: 18 };

/** What the people on the trail are wearing: three who walk and three who run. */
export const OUTFITS: { runs: boolean; look: Look }[] = [
  { runs: false, look: { skin: 'manila', top: 'green', legs: 'grey', arm: 12, leg: 17 } },
  { runs: false, look: { skin: 'manila', top: 'red', legs: 'blue', arm: 12, leg: 17 } },
  { runs: false, look: { skin: 'manila', top: 'cream', legs: 'brown', arm: 12, leg: 17 } },
  { runs: true, look: { skin: 'manila', top: 'yellow', shorts: 'blue', arm: 12, leg: 16 } },
  { runs: true, look: { skin: 'manila', top: 'white', shorts: 'red', arm: 12, leg: 16 } },
  { runs: true, look: { skin: 'brown', top: 'green', shorts: 'grey', arm: 12, leg: 16 } },
];
/** Whose head goes with which outfit: the rubberneckers from the highway, out for the
 *  day (`head0` to `head11`; there are only the first eight when there are no photos). */
export const WEARS = [0, 4, 3, 1, 4, 3, 2, 1, 0, 3, 5, 2];

/** How far under the middle of a paper head the chin is: a boy's, and a grown-up's. */
export const KID_CHIN = 23;
export const BIG_CHIN = 30;

/** Where the chin is on a paper doll, from the spot it stands on, and how far the head tips. */
export function dollChin(p: Doll, under: number): { x: number; y: number; tilt: number } {
  return { x: p.head[0] - Math.sin(p.tilt) * under, y: p.head[1] + Math.cos(p.tilt) * under, tilt: p.tilt };
}
