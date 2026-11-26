import { sound } from '../../audio/sound';

/** What "Take 'em for a ride" sounds like: all of it made up out of notes and hisses
 *  (sound.tone, sound.noise), in this folder. How loud each came out is in the
 *  README (tools/test/listen.cjs: they are reached as `window.__ride`). */
export const SOUNDS = {
  /** A dog, barking once (`pitch` above 1 for a small one). */
  bark(pitch = 1): void {
    sound.noise({ dur: 0.09, vol: 1.6, f0: 900 * pitch, f1: 500 * pitch, q: 1.4 });
    sound.tone({ type: 'sawtooth', f0: 420 * pitch, f1: 260 * pitch, dur: 0.11, vol: 0.72, attack: 0.008 });
  },

  /** A dog, kicked or bumped: a yelp. */
  yip(): void {
    sound.tone({ type: 'sawtooth', f0: 900, f1: 1500, dur: 0.07, vol: 0.62, attack: 0.005 });
    sound.tone({ type: 'sawtooth', f0: 1500, f1: 700, dur: 0.16, vol: 0.62, at: 0.07 });
  },

  /** Mr. Quacks, saying so. */
  quack(): void {
    sound.tone({ type: 'sawtooth', f0: 620, f1: 430, dur: 0.16, vol: 0.5, attack: 0.01, vibrato: { rate: 38, depth: 50 } });
    sound.tone({ type: 'square', f0: 1240, f1: 860, dur: 0.16, vol: 0.12, attack: 0.01 });
  },

  /** Two children, delighted. */
  yay(): void {
    sound.tone({ type: 'triangle', f0: 660, f1: 990, dur: 0.5, vol: 0.42, attack: 0.04, vibrato: { rate: 7, depth: 18 } });
    sound.tone({ type: 'triangle', f0: 830, f1: 1250, dur: 0.5, vol: 0.32, attack: 0.04, at: 0.03, vibrato: { rate: 8, depth: 22 } });
  },

  /** ...and the same two, heartbroken. */
  wah(): void {
    for (const [at, f] of [[0, 620], [0.55, 560], [1.1, 600]] as const) {
      sound.tone({ type: 'sawtooth', f0: f, f1: f * 0.62, dur: 0.48, vol: 0.42, attack: 0.05, at, vibrato: { rate: 9, depth: 30 } });
    }
  },

  /** A cricket, in the quiet. */
  cricket(): void {
    for (let i = 0; i < 3; i++) sound.tone({ type: 'sine', f0: 4300, f1: 4200, dur: 0.05, vol: 0.42, at: i * 0.11, vibrato: { rate: 60, depth: 300 } });
  },

  /** The van's engine, turning over and catching. */
  start(): void {
    for (let i = 0; i < 4; i++) sound.noise({ dur: 0.09, vol: 1.0, filter: 'lowpass', f0: 500, f1: 200, at: i * 0.13 });
    sound.tone({ type: 'sawtooth', f0: 60, f1: 120, dur: 0.6, vol: 0.4, at: 0.55 });
  },

  /** The engine, going: a burble that lasts `seconds` (how fast it is going is `pitch`). */
  engine(seconds = 1, pitch = 1): void {
    sound.tone({ type: 'sawtooth', f0: 70 * pitch, f1: 76 * pitch, dur: seconds, vol: 0.2, attack: 0.05, vibrato: { rate: 19, depth: 9 } });
  },

  /** Brakes, and the van coming to a stop. */
  brake(): void {
    sound.tone({ type: 'square', f0: 1900, f1: 1500, dur: 0.6, vol: 0.18, attack: 0.04, vibrato: { rate: 31, depth: 60 } });
    sound.noise({ dur: 0.6, vol: 0.8, filter: 'bandpass', f0: 2400, f1: 1400, q: 3 });
  },

  /** A dustbin, hit by a van. */
  crash(): void {
    sound.clang();
    sound.noise({ dur: 0.25, vol: 0.9, f0: 3000, f1: 800, q: 0.7 });
  },

  /** A pothole, gone through. */
  thud(): void {
    sound.tone({ type: 'sine', f0: 120, f1: 45, dur: 0.2, vol: 0.9 });
    sound.noise({ dur: 0.12, vol: 0.6, filter: 'lowpass', f0: 500 });
  },

  /** A van's sliding door, rolled back on its runner: and shut again (`shut`). */
  slide(shut = false): void {
    sound.noise({ dur: 0.42, vol: 0.8, filter: 'bandpass', f0: shut ? 900 : 1500, f1: shut ? 1500 : 900, q: 1.6 });
    sound.tone({ type: 'sine', f0: 140, f1: 70, dur: 0.12, vol: 0.7, at: 0.4 });
  },

  /** A boot, connecting. */
  boot(): void {
    sound.tone({ type: 'sine', f0: 180, f1: 60, dur: 0.16, vol: 0.95 });
    sound.noise({ dur: 0.07, vol: 0.9, filter: 'lowpass', f0: 1400, f1: 300 });
  },

  /** Something going a long way off, into the dark: a falling whistle. */
  away(): void {
    sound.tone({ type: 'sine', f0: 1700, f1: 380, dur: 0.75, vol: 0.32, attack: 0.02 });
  },

  /** A kiss: the squeak of it, and the smack as it lets go. */
  kiss(): void {
    sound.tone({ type: 'sine', f0: 1050, f1: 3300, dur: 0.11, vol: 0.7, attack: 0.03 });
    sound.tone({ type: 'triangle', f0: 2100, f1: 5200, dur: 0.1, vol: 0.2, attack: 0.03 });
    sound.noise({ dur: 0.035, vol: 0.9, f0: 1900, q: 1.6, at: 0.11 });
    sound.tone({ type: 'sine', f0: 520, f1: 240, dur: 0.07, vol: 0.5, at: 0.11 });
  },

  /** A cork, out of a bottle of champagne, and the fizz after it. */
  pop(): void {
    sound.tone({ type: 'sine', f0: 900, f1: 220, dur: 0.07, vol: 0.9 });
    sound.noise({ dur: 0.04, vol: 1.0, filter: 'highpass', f0: 1800 });
    sound.noise({ dur: 0.9, vol: 0.35, filter: 'highpass', f0: 5000, f1: 7000, at: 0.06 });
  },

  /** Two grown-ups, laughing. */
  haha(): void {
    for (let i = 0; i < 5; i++) {
      sound.tone({ type: 'sawtooth', f0: 300 - i * 8, f1: 240 - i * 8, dur: 0.11, vol: 0.8, attack: 0.01, at: i * 0.16 });
      sound.tone({ type: 'sawtooth', f0: 420 - i * 10, f1: 350 - i * 10, dur: 0.1, vol: 0.62, attack: 0.01, at: i * 0.16 + 0.05 });
    }
  },
};

// (for the tests, which measure how loud each of these comes out)
(window as unknown as { __ride: typeof SOUNDS }).__ride = SOUNDS;
