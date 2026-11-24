/** The brothers' photo faces for the day Chad had had enough. For each look: the
 *  picture, how tall it is in heads (a head being hair to chin), and where the
 *  chin is in it (as a fraction of the picture): each is hung from its chin.
 *  Written by tools/make_cutouts.py; do not edit by hand. */
export interface BatFace { file: string; tall: number; chin: [number, number] }

export const BAT_FACES: Record<string, Record<string, BatFace>> = {
  chad: {
    scowl: { file: 'chadface-scowl.png', tall: 1.017, chin: [0.474, 0.992] },
    smile: { file: 'chadface-smile.png', tall: 1.013, chin: [0.458, 0.993] },
    grin: { file: 'chadface-grin.png', tall: 1.004, chin: [0.433, 0.996] },
    laugh: { file: 'chadface-laugh.png', tall: 1.013, chin: [0.530, 0.993] },
    yell: { file: 'chadface-yell.png', tall: 1.135, chin: [0.420, 0.998] },
  },
  shane: {
    beam: { file: 'shaneface-beam.png', tall: 1.004, chin: [0.539, 0.997] },
    wary: { file: 'shaneface-wary.png', tall: 1.009, chin: [0.651, 0.996] },
    smirk: { file: 'shaneface-smirk.png', tall: 1.004, chin: [0.518, 0.997] },
    scared: { file: 'shaneface-scared.png', tall: 1.009, chin: [0.453, 0.996] },
    cry: { file: 'shaneface-cry.png', tall: 1.004, chin: [0.538, 0.998] },
  },
};
