import { sound } from '../../audio/sound';

/** The sounds that are this game's own, made out of notes and noise. How loud each
 *  comes out is in the README (measured with tools/test/listen.cjs, at `sfx`, where
 *  the mouth "bonk" everything is set beside reads 0.20). */

/** The club meets the ball: a clean one rings, and a shank clacks. */
export function ping(nice: boolean): void {
  if (nice) {
    sound.tone({ type: 'triangle', f0: 2300, f1: 1900, dur: 0.18, vol: 0.62 });
    sound.tone({ f0: 4600, f1: 4100, dur: 0.09, vol: 0.24 });
    sound.noise({ dur: 0.03, vol: 0.45, filter: 'highpass', f0: 3000 });
  } else {
    sound.tone({ type: 'square', f0: 420, f1: 170, dur: 0.12, vol: 0.4 });
    sound.noise({ dur: 0.09, vol: 0.95, f0: 900, f1: 500, q: 0.8 });
  }
}

/** A window: all of it at once, and then the pieces coming down. */
export function smash(): void {
  sound.noise({ dur: 0.3, vol: 0.72, filter: 'highpass', f0: 2400, f1: 6500 });
  sound.noise({ dur: 0.14, vol: 0.6, f0: 480, f1: 180, q: 0.7 });
  for (let i = 0; i < 10; i++) {
    const f = 2200 + Math.random() * 3800;
    sound.tone({ type: 'triangle', f0: f, f1: f * 0.93, dur: 0.05 + Math.random() * 0.12, vol: 0.2, at: 0.05 + Math.random() * 0.6 });
  }
}

/** The next day: a few bright notes, as at the start of an old television programme. */
export function jingle(): void {
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((f, i) => sound.tone({ type: 'triangle', f0: f, dur: i === notes.length - 1 ? 0.5 : 0.16, vol: 0.4, at: i * 0.13, vibrato: i === notes.length - 1 ? { rate: 6, depth: 8 } : undefined }));
  sound.tone({ f0: 262, dur: 0.6, vol: 0.22, at: 5 * 0.13 });
}

/** Somebody who is not buying. */
export function noSale(): void {
  sound.tone({ type: 'square', f0: 240, f1: 170, dur: 0.15, vol: 0.34 });
}

/** A bottle sold: a dollar in the jar, and the top off the bottle. */
export function sale(): void {
  sound.tone({ type: 'triangle', f0: 1319, dur: 0.09, vol: 0.5 });
  sound.tone({ type: 'triangle', f0: 1760, dur: 0.22, vol: 0.5, at: 0.08 });
  sound.tone({ f0: 300, f1: 620, dur: 0.07, vol: 0.4, at: 0.3 });
  sound.tone({ f0: 340, f1: 700, dur: 0.07, vol: 0.34, at: 0.4 });
}
