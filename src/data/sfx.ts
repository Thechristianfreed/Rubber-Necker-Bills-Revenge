/** Where each library sound effect is in sfx/effects.mp3: [start, length] in
 *  seconds, by group. The game picks one from a group at random.
 *  Written by tools/make_sfx.py; do not edit by hand. */
export const SFX = {
  hit: [
    [0.250, 0.482],  // punch (2460)
    [0.982, 0.445],  // punch (2461)
    [1.677, 0.502],  // punch, meatier (2463)
    [2.429, 0.369],  // punch, dull (2468)
    [3.049, 0.372],  // punch (0444)
    [3.670, 0.411],  // punch (0444)
    [4.332, 0.321],  // a gavel: one wooden knock (1588)
    [4.903, 0.798],  // a shovel on something hard (1084)
    [5.951, 0.368],  // a slap (0597)
  ],
  clunk: [
    [6.569, 0.488],  // metal mailbox (1527)
    [7.306, 0.650],  // metal mailbox (1527)
    [8.206, 0.753],  // metal mailbox (1528)
  ],
  stretch: [
    [9.209, 0.900],  // rope creak (3420)
    [10.359, 1.560],  // rope creak (3421)
    [12.169, 1.150],  // rope creak (3422)
    [13.569, 1.260],  // rope pulled tight (0554)
    [15.079, 1.520],  // rope pulled tight (0554)
    [16.849, 1.270],  // rope pulled tight (0554)
    [18.369, 1.300],  // a big rope groaning (3426)
    [19.919, 1.300],  // a big rope groaning (3426)
    [21.469, 1.300],  // a big rope groaning (3426)
  ],
  spring: [
    [23.019, 1.150],  // cartoon twang (1950)
    [24.419, 1.320],  // cartoon twang (1953)
    [25.989, 1.090],  // cartoon twang (1955)
    [27.329, 0.820],  // cartoon twang (1959)
    [28.399, 1.450],  // a large spring let go (0206)
    [30.099, 1.440],  // a large spring let go (0206)
    [31.789, 1.400],  // a large spring let go (0206)
    [33.439, 1.440],  // a door spring grinding (0605)
    [35.129, 1.090],  // a door spring grinding (0605)
  ],
} as const;

export type SfxGroup = keyof typeof SFX;
