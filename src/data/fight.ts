/** The photo bodies for the fight after school. For each pose: the picture, how
 *  big it is drawn (game pixels to one of the picture's) and the spot on the
 *  floor it stands on (as a fraction of the picture). Stephanie's also say where
 *  her chin goes from that spot (in game pixels) and how far her head tips; in
 *  mid-air she is held by a foot, and `lie` is the direction from it to her chin.
 *  Written by tools/make_cutouts.py; do not edit by hand. */
export interface FightBody { file: string; scale: number; spot: [number, number]; chin?: [number, number]; tilt?: number; lie?: number }

export const FIGHT_BODIES: Record<string, Record<string, FightBody>> = {
  cheer: {
    ready: { file: 'cheer-ready.png', scale: 1.1657, spot: [0.500, 0.982], chin: [-1.7, -183.0], tilt: 0.00 },
    fingers: { file: 'cheer-fingers.png', scale: 1.1657, spot: [0.500, 0.983], chin: [-29.1, -186.5], tilt: 0.00 },
    kick: { file: 'cheer-kick.png', scale: 1.1657, spot: [0.500, 0.987], chin: [-13.4, -186.5], tilt: -0.52 },
    flurry: { file: 'cheer-flurry.png', scale: 1.1657, spot: [0.500, 0.983], chin: [-0.6, -178.4], tilt: 0.00 },
    plead: { file: 'cheer-plead.png', scale: 0.6302, spot: [0.500, 0.991], chin: [0.3, -196.0], tilt: 0.00 },
    fly: { file: 'cheer-fly.png', scale: 0.6302, spot: [0.984, 0.736], chin: [-136.1, -122.3], tilt: -1.09, lie: -2.410 },
    ko: { file: 'cheer-ko.png', scale: 0.6302, spot: [0.500, 0.976], chin: [-64.3, -54.2], tilt: -1.78 },
  },
  rival: {
    walk: { file: 'rival-walk.png', scale: 0.6098, spot: [0.480, 0.994] },
    point: { file: 'rival-point.png', scale: 0.6098, spot: [0.464, 0.994] },
    flinch: { file: 'rival-flinch.png', scale: 0.6098, spot: [0.364, 0.994] },
    charge: { file: 'rival-charge.png', scale: 0.6098, spot: [0.474, 0.994] },
    hulk: { file: 'rival-hulk.png', scale: 0.6807, spot: [0.419, 0.994] },
    flick: { file: 'rival-flick.png', scale: 0.6807, spot: [0.554, 0.994] },
    win: { file: 'rival-win.png', scale: 0.6807, spot: [0.472, 0.994] },
  },
};
