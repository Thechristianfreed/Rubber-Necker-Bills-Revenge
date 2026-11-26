import { sound } from '../../audio/sound';

/** What "Pappy comes home" sounds like: all of it made up out of notes and hisses
 *  (sound.tone, sound.noise), in this folder. How loud each came out is in the
 *  README (tools/test/listen.cjs: they are reached as `window.__homecoming`). */
export const SOUNDS = {
  /** A bunch of keys, shaken. */
  jingle(): void {
    for (let i = 0; i < 8; i++) {
      const f = 2400 + Math.random() * 2800;
      sound.tone({ type: 'triangle', f0: f, f1: f * 0.97, dur: 0.09, vol: 0.62, at: i * 0.05 + Math.random() * 0.02 });
    }
    sound.noise({ dur: 0.36, vol: 0.2, filter: 'highpass', f0: 5200 });
  },

  /** A key that is not the right one, worked about in a lock. */
  rattle(): void {
    for (let i = 0; i < 3; i++) {
      sound.noise({ dur: 0.045, vol: 1.9, f0: 2100 + i * 240, q: 2.4, at: i * 0.07 });
      sound.tone({ type: 'square', f0: 310 - i * 30, f1: 190, dur: 0.045, vol: 0.5, at: i * 0.07 });
    }
  },

  /** ...and the lock's opinion of it. */
  wrong(): void {
    sound.tone({ type: 'sawtooth', f0: 196, f1: 150, dur: 0.16, vol: 0.56 });
    sound.tone({ type: 'sawtooth', f0: 147, f1: 104, dur: 0.3, vol: 0.56, at: 0.17 });
  },

  /** The right key: the bolt goes back. */
  unlock(): void {
    sound.noise({ dur: 0.03, vol: 0.9, filter: 'highpass', f0: 2600 });
    sound.tone({ type: 'triangle', f0: 880, f1: 300, dur: 0.07, vol: 0.5 });
    sound.noise({ dur: 0.05, vol: 0.9, filter: 'lowpass', f0: 900, at: 0.13 });
    sound.tone({ type: 'sine', f0: 190, f1: 90, dur: 0.14, vol: 0.7, at: 0.13 });
  },

  /** A door that wants oiling, opened slowly: it lasts about `seconds`. */
  creak(seconds = 1.5): void {
    sound.tone({ type: 'sawtooth', f0: 150, f1: 290, dur: seconds, vol: 0.34, attack: 0.2, vibrato: { rate: 17, depth: 60 } });
    sound.tone({ type: 'square', f0: 452, f1: 860, dur: seconds, vol: 0.12, attack: 0.3, vibrato: { rate: 23, depth: 130 } });
  },

  /** The same door, all the way, at once. */
  bang(): void {
    sound.boom();
    sound.noise({ dur: 0.09, vol: 0.9, f0: 1800, f1: 500, q: 0.8 });
  },

  /** Somebody swallowing. */
  gulp(): void {
    sound.tone({ type: 'sine', f0: 400, f1: 170, dur: 0.1, vol: 0.5 });
    sound.tone({ type: 'sine', f0: 230, f1: 520, dur: 0.08, vol: 0.5, at: 0.13 });
  },

  /** Being told off, at length: a quacking that lasts about `seconds`. */
  nag(seconds = 1.6): void {
    const n = Math.max(3, Math.round(seconds / 0.115));
    for (let i = 0; i < n; i++) {
      const f = 430 + Math.random() * 330 + (i % 4 === 0 ? 180 : 0), long = i === n - 1 ? 0.2 : 0.09;
      sound.tone({ type: 'sawtooth', f0: f * 1.25, f1: f * 0.8, dur: long, vol: 0.5, attack: 0.012, at: i * 0.115 });
      sound.tone({ type: 'square', f0: f * 2.5, f1: f * 1.6, dur: long, vol: 0.15, attack: 0.012, at: i * 0.115 });
    }
  },

  /** A kiss: the squeak of it, and the smack as it lets go. */
  kiss(): void {
    const up = 0.92 + Math.random() * 0.2;
    sound.tone({ type: 'sine', f0: 1050 * up, f1: 3300 * up, dur: 0.11, vol: 0.7, attack: 0.03 });
    sound.tone({ type: 'triangle', f0: 2100 * up, f1: 5200 * up, dur: 0.1, vol: 0.2, attack: 0.03 });
    sound.noise({ dur: 0.035, vol: 0.9, f0: 1900, q: 1.6, at: 0.11 });
    sound.tone({ type: 'sine', f0: 520, f1: 240, dur: 0.07, vol: 0.5, at: 0.11 });
  },

  /** A shove from a hip. */
  bump(): void {
    sound.tone({ type: 'sine', f0: 210, f1: 80, dur: 0.14, vol: 0.72 });
    sound.noise({ dur: 0.08, vol: 0.5, filter: 'lowpass', f0: 700, f1: 200 });
  },

  /** Knees, going across a carpet. */
  shuffle(): void {
    sound.noise({ dur: 0.13, vol: 1.2, filter: 'lowpass', f0: 1300, f1: 500 });
  },

  /** Both knees, arriving on it. */
  kneel(): void {
    for (const at of [0, 0.09]) {
      sound.tone({ type: 'sine', f0: 150, f1: 60, dur: 0.12, vol: 0.9, at });
      sound.noise({ dur: 0.06, vol: 0.4, filter: 'lowpass', f0: 600, at });
    }
  },

  /** A housecoat, thrown up out of the way. */
  flap(): void {
    sound.noise({ dur: 0.2, vol: 0.8, f0: 500, f1: 2400, q: 1.1 });
    sound.tone({ type: 'sine', f0: 300, f1: 760, dur: 0.16, vol: 0.42 });
  },

  /** She is coming round: a small pleased noise, higher each time. */
  mmm(step = 0): void {
    const f = 392 * Math.pow(1.122, step);
    sound.tone({ type: 'triangle', f0: f, f1: f * 1.26, dur: 0.22, vol: 0.46, attack: 0.04, vibrato: { rate: 6, depth: 8 } });
  },
};

// (for the tests, which measure how loud each of these comes out)
(window as unknown as { __homecoming: typeof SOUNDS }).__homecoming = SOUNDS;
