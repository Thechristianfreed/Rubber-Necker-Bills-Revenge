import { sound } from '../../audio/sound';

/** The noises of the vegetables going in: made here, out of the two things every made-up
 *  sound is built from. How loud each comes out is in the README (tools/test/listen.cjs). */

/** A shove: something wet, squashed. Each a little different from the last. */
export function squelch(n = 0): void {
  const up = n % 2 ? 1.25 : 1;
  sound.noise({ dur: 0.12, vol: 0.62, filter: 'lowpass', f0: 1100 * up, f1: 170 });
  sound.tone({ type: 'sine', f0: 210 * up, f1: 70, dur: 0.11, vol: 0.5 });
}

/** He cannot hold it any longer: a breath in, all at once. */
export function gasp(): void {
  sound.noise({ dur: 0.32, vol: 0.5, f0: 500, f1: 2600, q: 1.6 });
  sound.tone({ type: 'sawtooth', f0: 280, f1: 640, dur: 0.24, vol: 0.2 });
}

/** It goes down: "gl-oop". */
export function gulp(): void {
  sound.tone({ type: 'sine', f0: 430, f1: 130, dur: 0.15, vol: 0.62 });
  sound.tone({ type: 'sine', f0: 150, f1: 560, dur: 0.15, vol: 0.62, at: 0.16 });
  sound.noise({ dur: 0.09, vol: 0.3, filter: 'lowpass', f0: 600, f1: 200, at: 0.16 });
}

/** ...and something comes back up. */
export function burp(): void {
  sound.tone({ type: 'sawtooth', f0: 118, f1: 72, dur: 0.46, vol: 0.4, vibrato: { rate: 41, depth: 34 } });
  sound.tone({ type: 'square', f0: 59, f1: 40, dur: 0.4, vol: 0.2 });
  sound.noise({ dur: 0.34, vol: 0.3, filter: 'lowpass', f0: 520, f1: 190 });
}

/** His face going red: a squeak that climbs the longer he holds on (`k` from 0 to 1). */
export function strain(k: number): void {
  sound.tone({ type: 'triangle', f0: 520 + k * 700, f1: 580 + k * 780, dur: 0.07, vol: 0.2 });
}

/** His teeth, shut again. */
export function clack(): void {
  sound.tone({ type: 'square', f0: 900, f1: 400, dur: 0.045, vol: 0.3 });
  sound.noise({ dur: 0.04, vol: 0.4, filter: 'highpass', f0: 1800 });
}

/** Out it comes, the way it went in. */
export function ptooey(): void {
  sound.noise({ dur: 0.2, vol: 0.6, f0: 900, f1: 3400, q: 1.2 });
  sound.tone({ type: 'sine', f0: 200, f1: 900, dur: 0.16, vol: 0.4 });
}

// (for tools/test/listen.cjs to play them one at a time: "window.__veggies.gulp()")
(window as unknown as { __veggies: unknown }).__veggies = { squelch, gasp, gulp, burp, strain, clack, ptooey };
