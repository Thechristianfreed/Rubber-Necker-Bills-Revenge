/** Where each library sound effect is in sfx/effects.mp3: [start, length] in
 *  seconds, by group. The game picks one from a group at random.
 *  Written by tools/make_sfx.py; do not edit by hand. */
export const SFX = {
  hit: [
    [0.250, 0.482],  // punch (2460)
    [0.982, 0.445],  // punch (2461)
    [1.677, 0.502],  // punch, meatier (2463)
    [2.429, 0.369],  // punch, dull (2468)
    [3.049, 0.354],  // punch, sharp (2459)
    [3.653, 0.372],  // punch (0444)
    [4.274, 0.411],  // punch (0444)
    [4.936, 0.321],  // a gavel: one wooden knock (1588)
    [5.507, 0.798],  // a shovel on something hard (1084)
    [6.555, 0.674],  // a shovel on something hard (1084)
    [7.478, 0.368],  // a slap (0597)
  ],
  clunk: [
    [8.096, 0.488],  // metal mailbox (1527)
    [8.834, 0.650],  // metal mailbox (1527)
    [9.734, 0.753],  // metal mailbox (1528)
  ],
  stretch: [
    [10.737, 0.900],  // rope creak (3420)
    [11.887, 1.560],  // rope creak (3421)
    [13.697, 1.150],  // rope creak (3422)
    [15.097, 1.260],  // rope pulled tight (0554)
    [16.607, 1.520],  // rope pulled tight (0554)
    [18.377, 1.270],  // rope pulled tight (0554)
    [19.897, 1.300],  // a big rope groaning (3426)
    [21.447, 1.300],  // a big rope groaning (3426)
    [22.997, 1.300],  // a big rope groaning (3426)
  ],
  spring: [
    [24.547, 1.150],  // cartoon twang (1950)
    [25.947, 1.320],  // cartoon twang (1953)
    [27.517, 1.090],  // cartoon twang (1955)
    [28.857, 0.820],  // cartoon twang (1959)
    [29.927, 1.450],  // a large spring let go (0206)
    [31.627, 1.440],  // a large spring let go (0206)
    [33.317, 1.400],  // a large spring let go (0206)
    [34.967, 1.440],  // a door spring grinding (0605)
    [36.657, 1.090],  // a door spring grinding (0605)
  ],
} as const;

export type SfxGroup = keyof typeof SFX;
