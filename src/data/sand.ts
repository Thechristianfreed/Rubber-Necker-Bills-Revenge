/** The photo pieces for the day of the pocket sand, beyond the brothers' usual
 *  bodies and faces (which are with the bat's: batbodies.ts and bat.ts).
 *  `pairs`: the two of them hugging, as one picture less both heads; its size,
 *  the spot on the ground between them, and for each of them where his chin goes
 *  from that spot (game pixels) and how far his head tips.
 *  `above`: Shane as his mother sees him. `below`: her as he sees her, with the
 *  forearm she wags a finger with as a piece of its own that turns at the elbow.
 *  For those, a chin and an elbow are fractions of the picture, `head` is how
 *  tall the head that was on it was (as a fraction of the picture's height), and
 *  `arm.tall` is how tall the forearm's picture is beside the body's.
 *  `scold`: their mother's face for telling somebody off, as her others are (photos.ts).
 *  `box.near`: how far down the picture of the sandbox its near plank (a piece of its own) begins.
 *  Written by tools/make_cutouts.py; do not edit by hand. */
export interface SandPair { file: string; scale: number; spot: [number, number]; chad: [number, number, number]; shane: [number, number, number] }

export const SAND = {
  pairs: {
    hug: { file: 'pair-hug.png', scale: 0.3333, spot: [0.446, 0.995], chad: [-20.0, -110.8, 0.14], shane: [20.0, -109.2, -0.12] },
    side: { file: 'pair-side.png', scale: 0.3333, spot: [0.488, 0.995], chad: [-23.0, -110.3, 0.05], shane: [23.0, -109.7, -0.06] },
  } as Record<string, SandPair>,
  above: { file: 'shane-above.png', chin: [0.515, 0.037] as [number, number], head: 0.386 },
  below: {
    file: 'mom-below.png', chin: [0.447, 0.015] as [number, number], head: 0.182,
    elbow: [0.948, 0.144] as [number, number],
    arm: { file: 'mom-forearm.png', pivot: [0.500, 0.892] as [number, number], tall: 0.265 },
  },
  scold: { file: 'mom-scold.png', tall: 1.915, chin: [0.476, 0.638] as [number, number] },
  box: { file: 'sand-box.png', front: 'sand-box-near.png', near: 0.764 },
};
