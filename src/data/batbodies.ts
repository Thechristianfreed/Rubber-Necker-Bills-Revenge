/** The brothers' photo bodies for the day Chad had had enough. For each pose: the
 *  picture, how big it is drawn (game pixels to one of the picture's), the spot on
 *  the ground it stands on (as a fraction of the picture), where his chin goes from
 *  that spot (in game pixels) and how far his head tips. `over` is a pose in which he
 *  has the bat up in front of his face, so that his body is laid over his head and
 *  not under it.
 *  The back yard: how tall its two strips are, and where each one starts.
 *  The back door: the house (pinned at the middle of its doorstep, with how far
 *  below that the ground is), and their mother's body, which stands there.
 *  Written by tools/make_cutouts.py; do not edit by hand. */
export interface BatBody { file: string; scale: number; spot: [number, number]; chin: [number, number]; tilt: number; over?: boolean }

export const BAT_BODIES: Record<string, Record<string, BatBody>> = {
  chad: {
    stand: { file: 'chad-stand.png', scale: 0.3333, spot: [0.534, 0.996], chin: [2.1, -110.0], tilt: 0.00 },
    shoved: { file: 'chad-shoved.png', scale: 0.3333, spot: [0.519, 0.997], chin: [-4.5, -106.8], tilt: -0.20 },
    mad: { file: 'chad-mad.png', scale: 0.3333, spot: [0.500, 0.997], chin: [-1.8, -105.0], tilt: 0.00, over: true },
    hide: { file: 'chad-hide.png', scale: 0.3333, spot: [0.536, 0.996], chin: [4.6, -110.3], tilt: 0.10 },
    down: { file: 'chad-down.png', scale: 0.3333, spot: [0.584, 0.996], chin: [3.2, -110.0], tilt: 0.00 },
    run1: { file: 'chad-run1.png', scale: 0.3333, spot: [0.492, 0.995], chin: [9.6, -100.0], tilt: 0.12, over: true },
    run2: { file: 'chad-run2.png', scale: 0.3333, spot: [0.569, 0.995], chin: [5.4, -105.8], tilt: 0.08, over: true },
    swing: { file: 'chad-swing.png', scale: 0.3333, spot: [0.266, 0.995], chin: [4.6, -105.7], tilt: 0.15, over: true },
    dig: { file: 'chad-dig.png', scale: 0.3333, spot: [0.389, 0.992], chin: [17.5, -60.9], tilt: 0.50 },
    bucket: { file: 'chad-bucket.png', scale: 0.3333, spot: [0.408, 0.991], chin: [10.7, -55.6], tilt: 0.50 },
    wail: { file: 'chad-wail.png', scale: 0.3333, spot: [0.505, 0.994], chin: [0.0, -108.1], tilt: 0.00 },
    stance: { file: 'chad-stance.png', scale: 0.3333, spot: [0.494, 0.994], chin: [0.0, -110.0], tilt: 0.00 },
  },
  shane: {
    push: { file: 'shane-push.png', scale: 0.3333, spot: [0.343, 0.996], chin: [13.2, -106.6], tilt: 0.15 },
    laugh: { file: 'shane-laugh.png', scale: 0.3333, spot: [0.496, 0.996], chin: [-0.9, -110.0], tilt: 0.00 },
    bawl: { file: 'shane-bawl.png', scale: 0.3333, spot: [0.494, 0.996], chin: [0.1, -110.4], tilt: -0.06 },
    ow: { file: 'shane-ow.png', scale: 0.3333, spot: [0.455, 0.996], chin: [11.7, -89.6], tilt: 0.12 },
    run1: { file: 'shane-run1.png', scale: 0.3333, spot: [0.485, 0.994], chin: [15.0, -99.6], tilt: 0.12 },
    run2: { file: 'shane-run2.png', scale: 0.3333, spot: [0.440, 0.994], chin: [10.9, -104.6], tilt: 0.08 },
    throw: { file: 'shane-throw.png', scale: 0.3333, spot: [0.320, 0.995], chin: [12.6, -111.2], tilt: 0.10 },
    reach: { file: 'shane-reach.png', scale: 0.3333, spot: [0.301, 0.995], chin: [9.4, -106.3], tilt: 0.08 },
    punch: { file: 'shane-punch.png', scale: 0.3333, spot: [0.348, 0.995], chin: [3.9, -108.7], tilt: 0.06 },
    good: { file: 'shane-good.png', scale: 0.3333, spot: [0.492, 0.995], chin: [0.0, -110.0], tilt: 0.00 },
  },
};

export const BAT_YARD = { detail: 1.5, skyTop: -48.0, skyTall: 360.7, groundTop: 265.2, groundTall: 322.7, fenceFoot: 399.0 };

export const BAT_DOOR = {
  house: { file: 'yard-house.png', scale: 0.5955, spot: [0.671, 0.792] as [number, number], drop: 97.1 },
  mom: { file: 'batmom-akimbo.png', scale: 0.3333, spot: [0.498, 0.993] as [number, number], chin: [11.1, -178.0] as [number, number] },
};
