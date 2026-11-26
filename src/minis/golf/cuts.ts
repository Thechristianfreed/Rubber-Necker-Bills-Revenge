/** What was measured as this game's pictures were cut.
 *  The bodies: for each pose its picture, how big it is drawn (game pixels to one of
 *  the picture's), the spot on the ground it stands on (as a fraction of the picture),
 *  and from that spot, in game pixels: where the chin goes, how far the head tips, and
 *  where the hand that is furthest forward is. (For somebody seen from the side, the
 *  chin is under the middle of their head, which is where a head that faces us hangs.)
 *  The signs: the blank part of each, to be lettered (left, top, right, bottom, as
 *  fractions of its picture).
 *  The places: each one's picture, how tall it is made and how wide that makes it.
 *  Written by src/minis/golf/cut.py; do not edit by hand. */
export interface GolfBody { file: string; scale: number; spot: [number, number]; chin: [number, number]; tilt: number; hand: [number, number] }

export const GOLF_BODIES: Record<string, GolfBody> = {
  chad_address: { file: 'chad-address.png', scale: 0.3333, spot: [0.358, 0.959], chin: [3.6, -106.6], tilt: 0.06, hand: [20.5, -90.2] },
  chad_back: { file: 'chad-back.png', scale: 0.3333, spot: [0.468, 0.997], chin: [1.9, -104.4], tilt: 0.10, hand: [15.0, -48.2] },
  chad_follow: { file: 'chad-follow.png', scale: 0.3333, spot: [0.652, 0.996], chin: [-4.7, -110.0], tilt: -0.04, hand: [25.9, -99.9] },
  chad_address_iron: { file: 'chad-address-iron.png', scale: 0.3333, spot: [0.357, 0.956], chin: [3.7, -104.7], tilt: 0.06, hand: [20.5, -88.5] },
  chad_back_iron: { file: 'chad-back-iron.png', scale: 0.3333, spot: [0.468, 0.997], chin: [0.6, -103.6], tilt: 0.10, hand: [15.0, -48.2] },
  chad_follow_iron: { file: 'chad-follow-iron.png', scale: 0.3333, spot: [0.648, 0.996], chin: [-4.8, -110.0], tilt: -0.04, hand: [25.9, -99.9] },
  bill_stand: { file: 'bill-stand.png', scale: 0.3333, spot: [0.465, 0.997], chin: [-0.7, -198.0], tilt: 0.00, hand: [49.0, -113.7] },
  bill_ohno: { file: 'bill-ohno.png', scale: 0.3333, spot: [0.496, 0.997], chin: [-0.6, -194.4], tilt: 0.00, hand: [53.7, -174.9] },
  p0_walk1: { file: 'p0-walk1.png', scale: 0.3333, spot: [0.423, 0.997], chin: [9.0, -196.3], tilt: 0.00, hand: [55.4, -117.0] },
  p0_walk2: { file: 'p0-walk2.png', scale: 0.3333, spot: [0.443, 0.997], chin: [6.3, -198.0], tilt: 0.00, hand: [26.6, -78.3] },
  p1_walk1: { file: 'p1-walk1.png', scale: 0.3333, spot: [0.436, 0.997], chin: [5.4, -195.7], tilt: 0.00, hand: [58.8, -119.1] },
  p1_walk2: { file: 'p1-walk2.png', scale: 0.3333, spot: [0.448, 0.997], chin: [2.9, -198.0], tilt: 0.00, hand: [27.1, -78.4] },
  p2_walk1: { file: 'p2-walk1.png', scale: 0.3333, spot: [0.435, 0.997], chin: [11.3, -195.6], tilt: 0.00, hand: [53.6, -114.6] },
  p2_walk2: { file: 'p2-walk2.png', scale: 0.3333, spot: [0.454, 0.997], chin: [8.0, -198.0], tilt: 0.00, hand: [27.6, -78.1] },
  p3_run1: { file: 'p3-run1.png', scale: 0.3333, spot: [0.519, 0.996], chin: [21.2, -182.6], tilt: 0.00, hand: [62.0, -159.2] },
  p3_run2: { file: 'p3-run2.png', scale: 0.3333, spot: [0.492, 0.996], chin: [18.0, -190.0], tilt: 0.00, hand: [58.1, -161.1] },
  p4_run1: { file: 'p4-run1.png', scale: 0.3333, spot: [0.510, 0.996], chin: [20.3, -181.3], tilt: 0.00, hand: [56.1, -160.2] },
  p4_run2: { file: 'p4-run2.png', scale: 0.3333, spot: [0.473, 0.996], chin: [16.5, -190.0], tilt: 0.00, hand: [51.0, -161.1] },
  p5_run1: { file: 'p5-run1.png', scale: 0.3333, spot: [0.507, 0.996], chin: [23.4, -181.3], tilt: 0.00, hand: [63.0, -164.6] },
  p5_run2: { file: 'p5-run2.png', scale: 0.3333, spot: [0.512, 0.996], chin: [22.4, -190.0], tilt: 0.00, hand: [60.6, -168.1] },
};

export const GOLF_SIGNS: Record<string, [number, number, number, number]> = {
  sign: [0.007, 0.082, 0.989, 0.491],
  trailsign: [0.005, 0.086, 0.994, 0.381],
  poster: [0.227, 0.077, 0.773, 0.840],
  store: [0.086, 0.092, 0.914, 0.269],
};

export const GOLF_PLACE_TALL = 660;
export const GOLF_PLACES: Record<string, { file: string; wide: number }> = {
  tee: { file: 'tee.jpg', wide: 1539 },
  trail: { file: 'trail.jpg', wide: 1539 },
  lot: { file: 'lot.jpg', wide: 1539 },
};
