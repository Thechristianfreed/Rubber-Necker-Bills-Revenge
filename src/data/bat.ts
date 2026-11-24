/** The brothers' photo faces for the day Chad had had enough. For each look: the
 *  picture, how tall it is in heads (a head being hair to chin), and where the
 *  chin is in it (as a fraction of the picture): each is hung from its chin.
 *  Written by tools/make_cutouts.py; do not edit by hand. */
export interface BatFace { file: string; tall: number; chin: [number, number] }

export const BAT_FACES: Record<string, Record<string, BatFace>> = {
  chad: {
    scowl: { file: 'chadface-scowl.png', tall: 1.017, chin: [0.480, 0.992] },
    smile: { file: 'chadface-smile.png', tall: 1.013, chin: [0.458, 0.993] },
    grin: { file: 'chadface-grin.png', tall: 1.004, chin: [0.433, 0.996] },
    laugh: { file: 'chadface-laugh.png', tall: 1.013, chin: [0.530, 0.993] },
  },
};
