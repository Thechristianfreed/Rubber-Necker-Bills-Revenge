/** The brothers' photo bodies for the day Chad had had enough. For each pose: the
 *  picture, how big it is drawn (game pixels to one of the picture's), the spot on
 *  the ground it stands on (as a fraction of the picture), where his chin goes from
 *  that spot (in game pixels) and how far his head tips. `over` is a pose in which he
 *  has the bat up in front of his face, so that his body is laid over his head and
 *  not under it; `tip` is the far end of the bat where he has swung it.
 *  And the back yard: how tall its two strips are, and where each one starts.
 *  Written by tools/make_cutouts.py; do not edit by hand. */
export interface BatBody { file: string; scale: number; spot: [number, number]; chin: [number, number]; tilt: number; over?: boolean; tip?: [number, number] }

export const BAT_BODIES: Record<string, Record<string, BatBody>> = {
  chad: {
    stand: { file: 'chad-stand.png', scale: 0.3333, spot: [0.534, 0.996], chin: [2.1, -110.0], tilt: 0.00 },
    shoved: { file: 'chad-shoved.png', scale: 0.3333, spot: [0.519, 0.997], chin: [-4.5, -106.8], tilt: -0.20 },
    mad: { file: 'chad-mad.png', scale: 0.3333, spot: [0.500, 0.997], chin: [-1.8, -105.0], tilt: 0.00, over: true },
    hide: { file: 'chad-hide.png', scale: 0.3333, spot: [0.536, 0.996], chin: [4.6, -110.3], tilt: 0.10 },
    run1: { file: 'chad-run1.png', scale: 0.3333, spot: [0.530, 0.997], chin: [8.6, -101.4], tilt: 0.12, over: true },
    run2: { file: 'chad-run2.png', scale: 0.3333, spot: [0.544, 0.997], chin: [7.8, -102.0], tilt: 0.12, over: true },
    swing: { file: 'chad-swing.png', scale: 0.3333, spot: [0.322, 0.997], chin: [-5.0, -99.9], tilt: 0.18, over: true, tip: [59.6, -132.3] },
    down: { file: 'chad-down.png', scale: 0.3333, spot: [0.584, 0.996], chin: [3.2, -110.0], tilt: 0.00 },
  },
  shane: {
    push: { file: 'shane-push.png', scale: 0.3333, spot: [0.343, 0.996], chin: [13.2, -106.6], tilt: 0.15 },
    laugh: { file: 'shane-laugh.png', scale: 0.3333, spot: [0.496, 0.996], chin: [-0.9, -110.0], tilt: 0.00 },
    bawl: { file: 'shane-bawl.png', scale: 0.3333, spot: [0.494, 0.996], chin: [0.1, -110.4], tilt: -0.06 },
    run1: { file: 'shane-run1.png', scale: 0.3333, spot: [0.482, 0.996], chin: [15.2, -102.9], tilt: 0.12 },
    run2: { file: 'shane-run2.png', scale: 0.3333, spot: [0.499, 0.996], chin: [14.3, -103.3], tilt: 0.12 },
    ow: { file: 'shane-ow.png', scale: 0.3333, spot: [0.455, 0.996], chin: [11.7, -89.6], tilt: 0.12 },
  },
};

export const BAT_YARD = { detail: 1.5, skyTop: -48.0, skyTall: 360.7, groundTop: 265.2, groundTall: 322.7, fenceFoot: 399.0 };
