import { sound } from '../../audio/sound';

/** The sounds of a school gym, made up out of notes and noise (there are no recordings
 *  of these). How loud each comes out is in this game's README: tools/test/listen.cjs. */

/** The ball on the floor: `hard` 1 is a bounce, less is a dribble, more is from a height. */
export function bounce(hard = 1): void {
  sound.tone({ type: 'sine', f0: 210, f1: 62, dur: 0.11, vol: 0.68 * hard });
  sound.noise({ dur: 0.05, vol: 0.42 * hard, filter: 'lowpass', f0: 1100, f1: 240 });
}

/** The ball off the rim: iron, ringing for a moment. */
export function rim(): void {
  sound.tone({ type: 'square', f0: 587, f1: 560, dur: 0.26, vol: 0.28 });
  sound.tone({ type: 'triangle', f0: 880, f1: 862, dur: 0.34, vol: 0.48 });
  sound.tone({ type: 'sine', f0: 1320, f1: 1290, dur: 0.2, vol: 0.25 });
  sound.noise({ dur: 0.06, vol: 1.0, filter: 'bandpass', f0: 2600, q: 2 });
}

/** Nothing but net. */
export function swish(): void {
  sound.noise({ dur: 0.26, vol: 0.75, filter: 'highpass', f0: 4200, f1: 1500 });
  sound.noise({ dur: 0.16, vol: 0.45, f0: 1500, f1: 520, q: 0.9, at: 0.07 });
}

/** The ball off the scoreboard: a box of tin and light bulbs. */
export function board(): void {
  sound.tone({ type: 'square', f0: 196, f1: 120, dur: 0.2, vol: 0.48 });
  sound.noise({ dur: 0.14, vol: 1.3, filter: 'bandpass', f0: 1800, f1: 600, q: 1.2 });
  sound.tone({ type: 'triangle', f0: 1480, f1: 1100, dur: 0.12, vol: 0.24, at: 0.05 });
}

/** A gym shoe turning on a polished floor. */
export function squeak(): void {
  sound.tone({ type: 'sine', f0: 2100, f1: 3300, dur: 0.09, vol: 0.6 });
  sound.tone({ type: 'triangle', f0: 2500, f1: 3000, dur: 0.06, vol: 0.28, at: 0.02 });
}

/** A hand on the ball. */
export function slap(): void {
  sound.noise({ dur: 0.05, vol: 2.0, filter: 'bandpass', f0: 1700, f1: 700, q: 0.8 });
  sound.tone({ type: 'sine', f0: 260, f1: 140, dur: 0.06, vol: 0.75 });
}

/** The buzzer, at the end of the game. */
export function buzzer(): void {
  for (const [f, vol] of [[233, 0.45], [117, 0.39], [351, 0.18]]) sound.tone({ type: 'sawtooth', f0: f, f1: f, dur: 1.1, vol, attack: 0.02 });
}
