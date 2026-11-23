/** Where the workout tape's own breathing is in sfx/tape.mp3: [start, length]
 *  in seconds. Written by tools/make_tape.py; do not edit by hand. */
export const TAPE = {
  inhale: [0.250, 1.370],  // the breath in, through the nose
  pah: [1.870, 1.085],  // the "PAH"
} as const;
