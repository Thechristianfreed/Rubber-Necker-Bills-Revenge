/** The photos of this game, and where everything is in them. Written by cut.py: do not
 *  edit by hand.
 *
 *  For each of the two of them ('steph', 'her') and each pose: the picture, how big it is
 *  drawn (the game's pixels to one of the picture's), the spot on the floor she stands on
 *  (as a fraction of the picture), where her chin is from that spot (in the game's pixels)
 *  and how far her head tips. Stephanie's head is hung on at the chin; the other girl has
 *  kept her own, and `tall` is how tall it is. `hand` is where the ball goes in a pose that
 *  holds one. `arms` is Stephanie's arms again, for a pose that has them up: a picture of
 *  its own, laid over her head, standing on the same spot.
 *
 *  A pose that is not here is still a paper doll (art.ts), and its chin is the doll's. */
export interface Body {
  file: string;
  scale: number;
  spot: [number, number];
  chin: [number, number];
  tilt: number;
  tall?: number;
  hand?: [number, number];
  arms?: { file: string; spot: [number, number] };
}

export const BODIES: Record<string, Record<string, Body>> = {
  steph: {
    stand: { file: 'steph-stand.png', scale: 0.3333, spot: [0.447, 0.996], chin: [7.6, -114.0], tilt: 0.00, hand: [25.3, -66.7] },
    dribble: { file: 'steph-stand.png', scale: 0.3333, spot: [0.447, 0.996], chin: [7.6, -114.0], tilt: 0.00, hand: [25.3, -66.7] },
    aim: { file: 'steph-aim.png', scale: 0.3333, spot: [0.291, 0.996], chin: [9.8, -107.2], tilt: 0.05, hand: [38.4, -93.7] },
    guard: { file: 'steph-guard.png', scale: 0.3333, spot: [0.450, 0.995], chin: [11.8, -96.7], tilt: 0.00 },
    steal: { file: 'steph-steal.png', scale: 0.3333, spot: [0.369, 0.995], chin: [17.4, -97.3], tilt: 0.16 },
    shoot: { file: 'steph-shoot.png', scale: 0.3333, spot: [0.491, 0.996], chin: [1.3, -123.0], tilt: 0.00, hand: [3.8, -179.7], arms: { file: 'steph-shoot-arms.png', spot: [0.422, 3.108] } },
    cheer: { file: 'steph-cheer.png', scale: 0.3333, spot: [0.513, 0.996], chin: [0.4, -120.9], tilt: 0.00, arms: { file: 'steph-cheer-arms.png', spot: [0.480, 3.151] } },
    run1: { file: 'steph-run1.png', scale: 0.3333, spot: [0.532, 0.996], chin: [9.0, -110.8], tilt: 0.00 },
    run2: { file: 'steph-run2.png', scale: 0.3333, spot: [0.482, 1.004], chin: [9.1, -110.8], tilt: 0.00 },
  },
  her: {
    dribble: { file: 'her-dribble.png', scale: 0.3333, spot: [0.636, 0.996], chin: [-12.3, -120.5], tilt: 0.00, tall: 25.3, hand: [-42.5, -80.7] },
    stand: { file: 'her-dribble.png', scale: 0.3333, spot: [0.636, 0.996], chin: [-12.3, -120.5], tilt: 0.00, tall: 25.3, hand: [-42.5, -80.7] },
    run1: { file: 'her-run1.png', scale: 0.3333, spot: [0.572, 1.079], chin: [-19.7, -121.2], tilt: 0.00, tall: 25.9 },
    run2: { file: 'her-run2.png', scale: 0.3333, spot: [0.545, 0.996], chin: [-13.8, -121.2], tilt: 0.00, tall: 25.7 },
    shoot: { file: 'her-shoot.png', scale: 0.3333, spot: [0.617, 0.997], chin: [-2.8, -134.4], tilt: 0.00, tall: 25.2, hand: [-9.3, -179.1] },
    guard: { file: 'her-guard.png', scale: 0.3333, spot: [0.565, 0.996], chin: [-13.4, -99.5], tilt: 0.00, tall: 25.6 },
    steal: { file: 'her-steal.png', scale: 0.3333, spot: [0.566, 0.996], chin: [-19.9, -107.2], tilt: 0.00, tall: 25.6 },
    shrug: { file: 'her-shrug.png', scale: 0.3333, spot: [0.686, 0.996], chin: [-7.1, -121.8], tilt: 0.00, tall: 31.6 },
    cheer: { file: 'her-cheer.png', scale: 0.3333, spot: [0.503, 0.997], chin: [-2.2, -115.3], tilt: 0.00, tall: 27.7 },
  },
};

/** The things: the basket from the side (`foot` is the spot the game stands it on, as a
 *  fraction of the picture: the middle of its rim is where the paper one's is from there;
 *  `wide` is how far across the rim is, in the game's pixels); its rim and net again, as the
 *  piece the ball goes down behind (`rim` is the middle of the rim in it); the ball; the
 *  scoreboard, and its lights: six numbers, two to a panel, each made of seven strokes.
 *  `at` is the left of each, `top` the top of all of them, `wide` and `tall` the size of one,
 *  `thick` how thick a stroke is and `lean` how far the top of one is to the right of its
 *  bottom (all as fractions of the picture: across for across, down for down). And the two
 *  pennants. */
export interface Lights { at: number[]; top: number; wide: number; tall: number; thick: number; lean: number }
export interface Things {
  hoop?: { file: string; scale: number; foot: [number, number]; wide: number };
  net?: { file: string; scale: number; rim: [number, number] };
  ball?: { file: string };
  board?: { file: string; w: number; tall: number; lights: Lights };
  home?: { file: string; w: number };
  away?: { file: string; w: number };
}

export const THINGS: Things = {
  hoop: { file: 'hoop.png', scale: 0.3333, foot: [0.1409, 0.9986], wide: 50 },
  net: { file: 'net.png', scale: 0.3333, rim: [0.6232, 0.0352] },
  ball: { file: 'ball.png' },
  board: { file: 'board.png', w: 270, tall: 105.8, lights: { at: [0.0900, 0.2053, 0.3959, 0.5112, 0.7018, 0.8171], top: 0.4318, wide: 0.0841, tall: 0.3722, thick: 0.0146, lean: 0.0088 } },
  home: { file: 'home.png', w: 170 },
  away: { file: 'away.png', w: 170 },
};
