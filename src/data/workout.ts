/** The photo bodies for the workout tape: for each pose, the picture, how big
 *  it is drawn (game pixels to one of the picture's), the spot on the floor it
 *  stands on (as a fraction of the picture), where the chin goes from that spot
 *  (in game pixels) and how far the head tips. Written by tools/make_cutouts.py;
 *  do not edit by hand. */
export interface WorkoutBody { file: string; scale: number; spot: [number, number]; chin: [number, number]; tilt: number }

export const WORKOUT_BODIES: Record<string, Record<string, WorkoutBody>> = {
  mom: {
    ready: { file: 'pose-mom-ready.png', scale: 0.5297, spot: [0.500, 0.991], chin: [42.2, -155.7], tilt: -0.1 },
    lunge: { file: 'pose-mom-lunge.png', scale: 0.5297, spot: [0.500, 0.991], chin: [-13.8, -172.2], tilt: 0.0 },
    stretch: { file: 'pose-mom-stretch.png', scale: 0.5297, spot: [0.500, 0.994], chin: [0.0, -196.0], tilt: 0.0 },
    frog: { file: 'pose-mom-frog.png', scale: 0.5297, spot: [0.500, 0.986], chin: [1.3, -113.9], tilt: 0.0 },
    pretzel: { file: 'pose-mom-pretzel.png', scale: 0.5297, spot: [0.500, 0.983], chin: [-26.5, -89.0], tilt: 0.04 },
    kick: { file: 'pose-mom-kick.png', scale: 0.5297, spot: [0.500, 0.985], chin: [82.9, -75.8], tilt: 0.16 },
  },
};
