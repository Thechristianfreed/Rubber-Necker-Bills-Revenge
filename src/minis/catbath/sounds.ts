import { sound } from '../../audio/sound';

/** What "Bath time" sounds like: all of it made up out of notes and hisses
 *  (sound.tone, sound.noise), in this folder. How loud each came out is in the
 *  README (tools/test/listen.cjs: they are reached as `window.__catbath`). */
export const SOUNDS = {
  /** A cat, hissing. */
  hiss(): void {
    sound.noise({ dur: 0.5, vol: 0.5, filter: 'highpass', f0: 3200, f1: 4200 });
    sound.noise({ dur: 0.08, vol: 0.33, filter: 'bandpass', f0: 2000, q: 2 });
  },

  /** A cat, yowling (higher with `pitch`). */
  yowl(pitch = 1): void {
    sound.tone({ type: 'sawtooth', f0: 520 * pitch, f1: 900 * pitch, dur: 0.22, vol: 0.5, attack: 0.03, vibrato: { rate: 11, depth: 40 } });
    sound.tone({ type: 'sawtooth', f0: 900 * pitch, f1: 480 * pitch, dur: 0.38, vol: 0.5, at: 0.22, vibrato: { rate: 11, depth: 50 } });
  },

  /** A small, sad meow. */
  mew(): void {
    sound.tone({ type: 'triangle', f0: 700, f1: 980, dur: 0.12, vol: 0.4, attack: 0.02 });
    sound.tone({ type: 'triangle', f0: 980, f1: 560, dur: 0.22, vol: 0.4, at: 0.12 });
  },

  /** A squeeze, and the cat's opinion of it: a strangled squeak, higher the harder it is held. */
  gurk(step = 0): void {
    const f = 380 + step * 30;
    sound.tone({ type: 'square', f0: f, f1: f * 1.6, dur: 0.09, vol: 0.35, attack: 0.005 });
    sound.noise({ dur: 0.05, vol: 0.8, filter: 'lowpass', f0: 900 });
  },

  /** Claws, across Pappy. */
  scratch(): void {
    for (let i = 0; i < 3; i++) sound.noise({ dur: 0.06, vol: 2.6, filter: 'bandpass', f0: 3400 - i * 400, f1: 1800, q: 1.4, at: i * 0.05 });
  },

  /** Out cold: a falling note, and a thump. */
  conk(): void {
    sound.tone({ type: 'sine', f0: 880, f1: 160, dur: 0.5, vol: 0.4, attack: 0.01 });
    sound.tone({ type: 'sine', f0: 140, f1: 60, dur: 0.12, vol: 0.6, at: 0.48 });
  },

  /** Into the sink with it. */
  splash(): void {
    sound.noise({ dur: 0.45, vol: 1.0, filter: 'lowpass', f0: 2600, f1: 500 });
    sound.tone({ type: 'sine', f0: 300, f1: 90, dur: 0.18, vol: 0.5 });
    for (let i = 0; i < 5; i++) sound.tone({ type: 'sine', f0: 900 + Math.random() * 900, f1: 1600 + Math.random() * 800, dur: 0.04, vol: 0.16, at: 0.1 + i * 0.06 });
  },

  /** Once along the washboard. */
  scrub(): void {
    sound.noise({ dur: 0.16, vol: 1.4, filter: 'bandpass', f0: 1400, f1: 2600, q: 0.9 });
    for (let i = 0; i < 4; i++) sound.noise({ dur: 0.02, vol: 0.98, filter: 'highpass', f0: 2800, at: i * 0.035 });
  },

  /** The sprayer. */
  spray(seconds = 0.7): void {
    sound.noise({ dur: seconds, vol: 0.4, filter: 'highpass', f0: 4200, f1: 3600 });
  },

  /** A quarter of a twist: a squeak, and water running out. */
  twist(step = 0): void {
    sound.tone({ type: 'square', f0: 700 + step * 20, f1: 1100 + step * 20, dur: 0.08, vol: 0.3, vibrato: { rate: 40, depth: 80 } });
    sound.noise({ dur: 0.2, vol: 1.5, filter: 'bandpass', f0: 1200, f1: 700, q: 1.2, at: 0.05 });
  },

  /** Water, dripping into the sink. */
  drip(): void {
    sound.tone({ type: 'sine', f0: 1300 + Math.random() * 500, f1: 600, dur: 0.06, vol: 0.58 });
  },

  /** A clothes peg, clipped on. */
  peg(): void {
    sound.noise({ dur: 0.025, vol: 1.0, filter: 'highpass', f0: 2200 });
    sound.tone({ type: 'triangle', f0: 1500, f1: 900, dur: 0.04, vol: 0.4 });
  },

  /** A kiss: the squeak of it, and the smack as it lets go. */
  kiss(): void {
    sound.tone({ type: 'sine', f0: 1050, f1: 3300, dur: 0.11, vol: 0.7, attack: 0.03 });
    sound.tone({ type: 'triangle', f0: 2100, f1: 5200, dur: 0.1, vol: 0.2, attack: 0.03 });
    sound.noise({ dur: 0.035, vol: 0.9, f0: 1900, q: 1.6, at: 0.11 });
    sound.tone({ type: 'sine', f0: 520, f1: 240, dur: 0.07, vol: 0.5, at: 0.11 });
  },

  /** Flies, round a smell. */
  buzz(seconds = 1): void {
    sound.tone({ type: 'sawtooth', f0: 210, f1: 230, dur: seconds, vol: 0.15, attack: 0.1, vibrato: { rate: 13, depth: 30 } });
  },

  /** A wet cat, dried all at once into a ball of fluff. */
  poof(): void {
    sound.noise({ dur: 0.25, vol: 0.9, f0: 600, f1: 3000, q: 0.8 });
    sound.tone({ type: 'sine', f0: 300, f1: 900, dur: 0.18, vol: 0.35 });
  },
};

// (for the tests, which measure how loud each of these comes out)
(window as unknown as { __catbath: typeof SOUNDS }).__catbath = SOUNDS;
