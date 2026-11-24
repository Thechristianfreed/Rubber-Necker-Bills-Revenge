import { SFX, SfxGroup } from '../data/sfx';
import { TAPE } from '../data/tape';
import { VOICE, VoiceId } from '../data/voice';

/** The game's sound.
 *
 *  Bill's lines and the mouth sounds (bonk, boing, whoosh, splat...) are the
 *  family's own recording: one file, `voice/lines.mp3`, cut up by
 *  tools/make_voice.py. Hits, mailbox clunks, stretches and springs are
 *  library recordings in `sfx/effects.mp3` (tools/make_sfx.py): several of
 *  each, picked at random, so nothing is heard twice running. Until those
 *  files have loaded, and for the effects nobody has recorded, a stand-in
 *  synthesised with the Web Audio API plays instead. The breathing in the
 *  workout game is the tape's own, `sfx/tape.mp3` (tools/make_tape.py), which
 *  is not always there; nor is the announcer who ends the fight after school,
 *  `sfx/fatality.mp3` (see docs/music.md). The music is recordings
 *  too, one per level, in `music/` (tools/make_music.sh). All of it sits
 *  beside the page rather than inside it. */

/** A file of clips laid end to end: where it is, and (once loaded) its sound. */
interface Bank { url: string; file?: Promise<ArrayBuffer | null>; sound?: AudioBuffer }
type Clip = readonly [start: number, length: number];
/** How far the music drops while somebody is speaking. */
const DUCK = 0.4;
/** How loud a full breath in gets: clearly there, but well under the PAH that follows. */
const BREATH_IN = 0.52;
/** How loud the power-up drone is at its height. */
const POWER_UP = 0.14;
/** How loud the audience's "Dawww" is, and each note of the trombone that stands for a grown-up talking. */
const AUDIENCE = 2.1;
const TROMBONE = 0.38;
/** How loud the announcer is at the end of the fight (his recording is a loud one). */
const ANNOUNCER = 0.8;

/** Where the music is, relative to the page, and how loud it plays under the effects. */
const MUSIC_DIR = 'music/';
const MUSIC_VOLUME = 0.55;
/** How much music is kept ready to play, in seconds (see asSound). */
const KEEP_SECONDS = 135;

type Wave = OscillatorType;

interface ToneOpts {
  type?: Wave;
  f0: number;
  f1?: number;
  dur: number;
  vol?: number;
  attack?: number;
  at?: number;
  vibrato?: { rate: number; depth: number };
  out?: AudioNode;
}

interface NoiseOpts {
  dur: number;
  vol?: number;
  filter?: BiquadFilterType;
  f0: number;
  f1?: number;
  q?: number;
  at?: number;
  out?: AudioNode;
}

class Sound {
  private ctx?: AudioContext;
  private master!: GainNode;
  private sfx!: GainNode;
  private music!: GainNode;
  private noiseBuf!: AudioBuffer;
  /** The track that should be playing ('' for none), and the one that is. */
  private track = '';
  private playing?: { track: string; src: AudioBufferSourceNode; fade: GainNode };
  private files = new Map<string, Promise<ArrayBuffer | null>>();
  /** Tracks already turned into sound, the latest last. */
  private decoded: { track: string; seconds: number; buffer: Promise<AudioBuffer | null> }[] = [];
  /** How far the music is turned down for the scene (1 = as normal). */
  private musicLevel = 1;
  /** The family's recording, and the library sound effects. */
  private voice: Bank = { url: 'voice/lines.mp3' };
  private effects: Bank = { url: 'sfx/effects.mp3' };
  /** The workout tape's own breath in and "PAH" (may be missing: see tools/make_tape.py). */
  private tape: Bank = { url: 'sfx/tape.mp3' };
  /** The announcer who has the last word on the fight after school (may be missing too). */
  private announcer: Bank = { url: 'sfx/fatality.mp3' };
  private voiceOut!: GainNode;
  /** Lines being spoken right now. */
  private speaking: AudioBufferSourceNode[] = [];
  /** When each sound was last made, and which of a group was picked last. */
  private last: Record<string, number> = {};
  private picked: Record<string, number> = {};
  /** The drone of something powering up, while it lasts. */
  private power?: { parts: AudioScheduledSourceNode[]; out: GainNode };
  /** The breath being drawn in, if there is one. */
  private breath?: { src: AudioBufferSourceNode; gain: GainNode };
  muted = false;

  /** Must be called from a tap/click before anything can play. */
  unlock(): void {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain();
      this.sfx.gain.value = 0.9;
      this.sfx.connect(this.master);
      this.music = this.ctx.createGain();
      this.music.gain.value = MUSIC_VOLUME;
      this.music.connect(this.master);
      this.voiceOut = this.ctx.createGain();
      this.voiceOut.gain.value = 1;
      this.voiceOut.connect(this.master);
      this.loadVoice();
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.02);
  }

  // ---- the family's recording ---------------------------------------------------

  /** Start fetching the recordings; they are turned into sound as soon as
   *  there is something to play them with (after the first tap). */
  loadVoice(): void {
    for (const bank of [this.voice, this.effects, this.tape, this.announcer]) {
      if (!bank.file) {
        bank.file = fetch(new URL(bank.url, document.baseURI))
          .then((r) => (r.ok ? r.arrayBuffer() : null))
          .catch(() => null);
      }
      void bank.file.then(async (bytes) => {
        if (!bytes || !this.ctx || bank.sound) return;
        const recording = await this.ctx.decodeAudioData(bytes.slice(0)).catch(() => null);
        if (recording) bank.sound = recording;
      });
    }
  }

  /** Play one clip out of a bank. */
  private clip(bank: Bank, [start, length]: Clip, out: AudioNode, rate = 1, vol = 1, after = 0): AudioBufferSourceNode | null {
    const ctx = this.ctx;
    if (!ctx || !bank.sound) return null;
    const src = ctx.createBufferSource();
    src.buffer = bank.sound;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(g).connect(out);
    // a hair early and late: where a clip sits in an MP3 is not exact to the millisecond
    src.start(ctx.currentTime + after, Math.max(0, start - 0.03), length + 0.06);
    return src;
  }

  /** True if `every` seconds have gone by since the last sound called `key`
   *  (and starts the clock again), so a burst of hits does not pile them up. */
  private due(key: string, every: number): boolean {
    const now = this.ctx?.currentTime ?? 0;
    if (now - (this.last[key] ?? -9) < every) return false;
    this.last[key] = now;
    return true;
  }

  /** Make a recorded mouth sound in place of a synthesised effect. False if
   *  the recording has not loaded, so the caller can do something else. */
  private mouth(id: VoiceId, rate = 1, vol = 1, every = 0): boolean {
    if (!this.ctx || !this.voice.sound) return false;
    if (this.due(id, every)) this.clip(this.voice, VOICE[id], this.sfx, rate, vol);
    return true;
  }

  /** Play one of a group of library sounds, never the same one twice running.
   *  False if they have not loaded. */
  private effect(group: SfxGroup, rate = 1, vol = 1, every = 0): boolean {
    if (!this.ctx || !this.effects.sound) return false;
    if (!this.due(group, every)) return true;
    const clips: readonly Clip[] = SFX[group];
    let i = Math.floor(Math.random() * clips.length);
    if (i === this.picked[group]) i = (i + 1) % clips.length;
    this.picked[group] = i;
    this.clip(this.effects, clips[i], this.sfx, rate, vol);
    return true;
  }

  /** Now and then: true about one time in `n`, but never twice running. */
  private nowAndThen(key: string, n: number): boolean {
    const yes = !this.picked[key] && Math.random() < 1 / n;
    this.picked[key] = yes ? 1 : 0;
    return yes;
  }

  /** Somebody says a recorded line, `after` seconds from now. It cuts off
   *  whatever was being said, and the music dips under it. Returns how long
   *  the line is (0 if there is no recording to play). */
  say(id: VoiceId | undefined, after = 0): number {
    const ctx = this.ctx;
    if (!id || !ctx || !this.voice.sound) return 0;
    const at = ctx.currentTime + after;
    const length = VOICE[id][1];
    for (const s of this.speaking) s.stop(at);
    const src = this.clip(this.voice, VOICE[id], this.voiceOut, 1, 1, after);
    if (!src) return 0;
    this.speaking.push(src);
    src.onended = () => { this.speaking = this.speaking.filter((s) => s !== src); };
    const g = this.music.gain;
    g.cancelScheduledValues(at);
    g.setTargetAtTime(MUSIC_VOLUME * this.musicLevel * DUCK, at, 0.04);
    g.setTargetAtTime(MUSIC_VOLUME * this.musicLevel, at + length, 0.2);
    return length;
  }

  /** Stop anyone who is speaking. */
  hush(): void {
    if (!this.ctx) return;
    for (const s of this.speaking) s.stop();
    this.speaking = [];
    this.music.gain.cancelScheduledValues(this.ctx.currentTime);
    this.music.gain.setTargetAtTime(MUSIC_VOLUME * this.musicLevel, this.ctx.currentTime, 0.2);
  }

  // ---- synthesised sound ----------------------------------------------------------

  private tone(o: ToneOpts): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + (o.at ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    if (o.f1 !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + o.dur);
    if (o.vibrato) {
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = o.vibrato.rate;
      lg.gain.setValueAtTime(o.vibrato.depth, t);
      lg.gain.exponentialRampToValueAtTime(Math.max(0.01, o.vibrato.depth * 0.05), t + o.dur);
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + o.dur + 0.05);
    }
    const vol = o.vol ?? 0.3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g).connect(o.out ?? this.sfx);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  private noise(o: NoiseOpts): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + (o.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.filter ?? 'bandpass';
    f.Q.value = o.q ?? 1;
    f.frequency.setValueAtTime(o.f0, t);
    if (o.f1 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + o.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.vol ?? 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f).connect(g).connect(o.out ?? this.sfx);
    src.start(t, Math.random() * 0.5);
    src.stop(t + o.dur + 0.05);
  }

  // ---- effects ---------------------------------------------------------------

  whoosh(): void {
    if (this.mouth('fx_whoosh', 0.92 + Math.random() * 0.24, 0.7, 0.05)) return;
    this.noise({ dur: 0.13, vol: 0.2, f0: 500, f1: 2600, q: 1.4 });
  }

  /** Something lands on a head: usually a punch, a knock or a clang from the
   *  library, and now and then the family's own "BONK!". */
  bonk(perfect: boolean): void {
    const rate = perfect ? 1.08 : 0.92 + Math.random() * 0.16;
    const heard = (this.voice.sound && this.nowAndThen('bonk', 7) && this.mouth('fx_bonk', rate, 0.95))
      || this.effect('hit', rate, 0.9, 0.05)
      || this.mouth('fx_bonk', rate, 0.95, 0.07);
    if (heard) {
      // a perfect hit still gets its little chime on top
      if (perfect) this.tone({ type: 'triangle', f0: 1320, dur: 0.25, vol: 0.14, at: 0.02 });
      return;
    }
    this.tone({ type: 'sine', f0: perfect ? 260 : 210, f1: 70, dur: 0.16, vol: 0.7 });
    this.tone({ type: 'square', f0: perfect ? 900 : 700, f1: 300, dur: 0.05, vol: 0.16 });
    this.noise({ dur: 0.05, vol: 0.35, filter: 'highpass', f0: 1800 });
    if (perfect) {
      this.tone({ type: 'triangle', f0: 1320, dur: 0.25, vol: 0.2, at: 0.02 });
      this.tone({ type: 'triangle', f0: 1980, dur: 0.3, vol: 0.14, at: 0.06 });
    }
  }

  /** The rubber-neck stretch: a springy "boi-oi-oing". */
  /** A newspaper lands in a mailbox: a metal clunk, and the till rings. */
  deliver(): void {
    if (!this.effect('clunk', 0.94 + Math.random() * 0.14, 0.85, 0.05)) {
      this.tone({ type: 'sine', f0: 210, f1: 70, dur: 0.16, vol: 0.7 });
      this.noise({ dur: 0.05, vol: 0.35, filter: 'highpass', f0: 1800 });
    }
    this.cash();
  }

  /** A neck stretches: mostly a creak of something pulled tight, sometimes a
   *  spring, and every once in a while the family's "boi-oi-oing". */
  boing(power = 1): void {
    if (!this.ctx || !this.due('boing', 0.3)) return;
    const rate = (0.92 + Math.random() * 0.2) * (power > 1.1 ? 1.06 : 1);
    if (this.voice.sound && this.nowAndThen('boing', 8) && this.mouth('fx_boing', rate, 0.75)) return;
    if (Math.random() < 0.35 ? this.effect('spring', rate, 0.9) : this.effect('stretch', rate, 0.9)) return;
    if (this.mouth('fx_boing', rate, 0.75)) return;
    const f = 150 + Math.random() * 60;
    this.tone({
      type: 'sawtooth', f0: f * 2.4, f1: f * 0.7, dur: 0.55 + power * 0.15, vol: 0.13,
      vibrato: { rate: 13, depth: f * 0.9 }, at: 0.03,
    });
    this.tone({ type: 'sine', f0: f * 3.2, f1: f, dur: 0.5, vol: 0.2, vibrato: { rate: 13, depth: f * 1.2 }, at: 0.03 });
  }

  hurt(): void {
    if (this.mouth('fx_ow')) return;
    this.tone({ type: 'sawtooth', f0: 420, f1: 90, dur: 0.4, vol: 0.28 });
    this.noise({ dur: 0.12, vol: 0.4, filter: 'lowpass', f0: 900 });
  }

  clang(): void {
    for (const [f, v] of [[523, 0.3], [787, 0.22], [1183, 0.16], [1571, 0.1]]) {
      this.tone({ type: 'square', f0: f, f1: f * 0.98, dur: 0.5, vol: v * 0.5 });
    }
  }

  /** Someone who should not have been hit says so (the same "OW!", higher). */
  ouch(): void {
    if (this.mouth('fx_ow', 1.22)) return;
    this.yelp();
  }

  yelp(): void {
    if (this.mouth('fx_yelp', 0.96 + Math.random() * 0.12)) return;
    this.tone({ type: 'square', f0: 700, f1: 1500, dur: 0.09, vol: 0.2 });
    this.tone({ type: 'square', f0: 900, f1: 500, dur: 0.14, vol: 0.2, at: 0.1 });
  }

  dodge(): void {
    this.noise({ dur: 0.22, vol: 0.14, f0: 2400, f1: 500, q: 0.8 });
    this.tone({ type: 'triangle', f0: 660, f1: 990, dur: 0.12, vol: 0.14, at: 0.05 });
  }

  cash(): void {
    this.tone({ type: 'square', f0: 1320, dur: 0.06, vol: 0.09 });
    this.tone({ type: 'square', f0: 1760, dur: 0.1, vol: 0.09, at: 0.06 });
  }

  /** Something wet hitting something flat. */
  splat(): void {
    if (this.mouth('fx_splat', 0.88 + Math.random() * 0.3, 0.9, 0.08)) return;
    this.noise({ dur: 0.16, vol: 0.5, filter: 'lowpass', f0: 1400, f1: 180 });
    this.tone({ type: 'sine', f0: 170, f1: 60, dur: 0.14, vol: 0.4 });
  }

  /** Something hard bouncing off the floor. */
  tock(): void {
    this.tone({ type: 'triangle', f0: 520, f1: 260, dur: 0.07, vol: 0.3 });
    this.noise({ dur: 0.03, vol: 0.2, filter: 'highpass', f0: 2200 });
  }

  /** A long breath in through the nose, taking `seconds` to fill the lungs,
   *  until something comes out again. The tape's own, if it is there;
   *  otherwise hiss that climbs and swells. */
  inhale(seconds = 1.3): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.stopBreath();
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    if (this.tape.sound) {
      const [start, length] = TAPE.inhale;
      src.buffer = this.tape.sound;
      // played a touch faster or slower, so that it lasts exactly as long as the breath does
      src.playbackRate.value = length / seconds;
      g.gain.value = 0.95;
      src.connect(g).connect(this.sfx);
      src.start(t, start, length);
    } else {
      src.buffer = this.noiseBuf;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 1.1;
      f.frequency.setValueAtTime(420, t);
      f.frequency.exponentialRampToValueAtTime(2800, t + seconds);
      g.gain.setValueAtTime(BREATH_IN * 0.2, t);
      g.gain.linearRampToValueAtTime(BREATH_IN, t + seconds);
      src.connect(f).connect(g).connect(this.sfx);
      src.start(t, Math.random() * 0.5);
      src.stop(t + seconds + 1.5);
    }
    this.breath = { src, gain: g };
  }

  /** Cut a breath in short, without a sound. */
  stopBreath(): void {
    const b = this.breath;
    if (!b || !this.ctx) return;
    const t = this.ctx.currentTime;
    b.gain.gain.cancelScheduledValues(t);
    b.gain.gain.setTargetAtTime(0.0001, t, 0.012);
    b.src.stop(t + 0.12);
    this.breath = undefined;
  }

  /** ...and all of it out at once: PAH! */
  pah(): void {
    this.stopBreath();
    if (this.tape.sound && this.clip(this.tape, TAPE.pah, this.sfx, 1, 1)) return;
    this.noise({ dur: 0.34, vol: 0.9, filter: 'lowpass', f0: 3800, f1: 500 });
    this.tone({ type: 'sawtooth', f0: 230, f1: 90, dur: 0.22, vol: 0.4 });
    this.tone({ type: 'sine', f0: 150, f1: 50, dur: 0.2, vol: 0.6 });
  }

  /** A breath let go too soon: it just leaks out. */
  wheeze(): void {
    this.stopBreath();
    this.noise({ dur: 0.55, vol: 1.15, f0: 2400, f1: 500, q: 1.2 });
  }

  /** A breath held too long: it comes out as a coughing fit. */
  cough(): void {
    this.stopBreath();
    [0, 0.15, 0.27].forEach((at, i) => {
      this.noise({ dur: 0.1, vol: 2.2 - i * 0.35, filter: 'lowpass', f0: 2600, f1: 500, at });
      this.tone({ type: 'sawtooth', f0: 190 - i * 20, f1: 110, dur: 0.08, vol: 0.3, at });
    });
  }

  /** A heavy footstep, coming this way. */
  stomp(): void {
    this.tone({ type: 'sine', f0: 110, f1: 40, dur: 0.24, vol: 0.65 });
    this.noise({ dur: 0.12, vol: 0.55, filter: 'lowpass', f0: 700, f1: 120 });
  }

  /** Something enormous gathering itself: a drone that climbs and swells for
   *  `seconds`, and goes on until stopPower(). */
  powerUp(seconds: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.stopPower();
    const t = ctx.currentTime;
    const out = ctx.createGain();
    out.gain.setValueAtTime(POWER_UP * 0.15, t);
    out.gain.linearRampToValueAtTime(POWER_UP, t + seconds);
    out.connect(this.sfx);
    const parts: AudioScheduledSourceNode[] = [];
    for (const [type, from, to, vol] of [['sawtooth', 55, 220, 0.5], ['square', 82, 331, 0.25], ['sine', 40, 80, 0.9]] as const) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(from, t);
      o.frequency.exponentialRampToValueAtTime(to, t + seconds);
      g.gain.value = vol;
      o.connect(g).connect(out);
      o.start(t);
      parts.push(o);
    }
    // and a shudder through all of it
    const wob = ctx.createOscillator(), depth = ctx.createGain();
    wob.frequency.setValueAtTime(7, t);
    wob.frequency.linearRampToValueAtTime(19, t + seconds);
    depth.gain.value = POWER_UP * 0.35;
    wob.connect(depth).connect(out.gain);
    wob.start(t);
    parts.push(wob);
    const hiss = ctx.createBufferSource(), f = ctx.createBiquadFilter(), hg = ctx.createGain();
    hiss.buffer = this.noiseBuf;
    hiss.loop = true;
    f.type = 'bandpass';
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(200, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + seconds);
    hg.gain.value = 0.7;
    hiss.connect(f).connect(hg).connect(out);
    hiss.start(t);
    parts.push(hiss);
    this.power = { parts, out };
  }

  stopPower(): void {
    const p = this.power;
    if (!p || !this.ctx) return;
    const t = this.ctx.currentTime;
    p.out.gain.cancelScheduledValues(t);
    p.out.gain.setTargetAtTime(0.0001, t, 0.03);
    for (const part of p.parts) part.stop(t + 0.25);
    this.power = undefined;
  }

  /** The screen stops for somebody's best move: a rising shriek, a ring of
   *  high notes, and a thud as it lands. */
  superMove(): void {
    this.tone({ type: 'sawtooth', f0: 180, f1: 1500, dur: 0.34, vol: 0.2 });
    this.noise({ dur: 0.36, vol: 0.5, filter: 'highpass', f0: 900, f1: 5200 });
    [1319, 1568, 1976, 2637].forEach((f, i) => this.tone({ type: 'square', f0: f, dur: 0.16, vol: 0.09, at: 0.3 + i * 0.055 }));
    this.tone({ type: 'sine', f0: 150, f1: 42, dur: 0.5, vol: 0.6, at: 0.3 });
  }

  /** The announcer: "Flawless victory." And then: "Fatality." The music drops
   *  under him. Returns how long he takes (nothing, if he is not there: then
   *  it is a groan and a few sad notes, as for any other loss). */
  fatality(): number {
    const ctx = this.ctx, clip = this.announcer.sound;
    if (!ctx || !clip) {
      this.lose();
      return 0;
    }
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = clip;
    g.gain.value = ANNOUNCER;
    src.connect(g).connect(this.sfx);
    src.start();
    const at = ctx.currentTime, m = this.music.gain;
    m.cancelScheduledValues(at);
    m.setTargetAtTime(MUSIC_VOLUME * this.musicLevel * DUCK, at, 0.04);
    m.setTargetAtTime(MUSIC_VOLUME * this.musicLevel, at + clip.duration, 0.2);
    return clip.duration;
  }

  /** A studio audience, touched: "Dawww". A dozen voices, none quite together,
   *  each sliding up a little and then a long way down. */
  aww(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime, long = 1.7;
    const out = ctx.createGain();
    out.gain.value = AUDIENCE;
    out.connect(this.sfx);
    // the shape of the mouth saying "aw": two bumps in what gets through
    const mouth = ctx.createGain();
    for (const [f, q, vol] of [[640, 4, 1], [1020, 5, 0.7], [2600, 3, 0.16]]) {
      const band = ctx.createBiquadFilter(), g = ctx.createGain();
      band.type = 'bandpass';
      band.frequency.value = f;
      band.Q.value = q;
      g.gain.value = vol;
      mouth.connect(band).connect(g).connect(out);
    }
    for (const pitch of [147, 165, 175, 196, 220, 247, 262, 294, 330, 349, 392, 440]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const late = Math.random() * 0.14, f = pitch * (0.985 + Math.random() * 0.03);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f * 0.93, t + late);
      o.frequency.linearRampToValueAtTime(f * 1.05, t + late + 0.3);
      o.frequency.exponentialRampToValueAtTime(f * 0.8, t + late + long);
      const wob = ctx.createOscillator(), depth = ctx.createGain();
      wob.frequency.value = 4.5 + Math.random() * 1.5;
      depth.gain.value = f * 0.012;
      wob.connect(depth).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t + late);
      g.gain.linearRampToValueAtTime(0.16, t + late + 0.1);
      g.gain.setValueAtTime(0.16, t + late + long * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + late + long);
      o.connect(g).connect(mouth);
      for (const part of [o, wob]) { part.start(t + late); part.stop(t + late + long + 0.05); }
    }
  }

  /** A grown-up, talking, as a five-year-old hears it: a trombone with a
   *  plunger in it, one "wah" for every syllable. Lasts about `seconds`. */
  wahwah(seconds = 2): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    // the tune of a telling-off: up, down, and down further at the end
    const tune = [233, 262, 247, 196, 220, 262, 233, 175, 196, 220, 165];
    const each = 0.21, n = Math.max(3, Math.min(tune.length, Math.round(seconds / each)));
    for (let i = 0; i < n; i++) {
      const at = t + i * each, f = tune[i], long = i === n - 1 ? 0.42 : i % 3 === 2 ? 0.26 : 0.17;
      const horn = ctx.createBiquadFilter(), g = ctx.createGain();
      horn.type = 'lowpass';
      horn.Q.value = 5;
      horn.frequency.setValueAtTime(330, at);
      horn.frequency.linearRampToValueAtTime(1500, at + long * 0.45);
      horn.frequency.linearRampToValueAtTime(420, at + long);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(TROMBONE, at + 0.03);
      g.gain.setValueAtTime(TROMBONE, at + long * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, at + long);
      horn.connect(g).connect(this.sfx);
      for (const [type, mult, vol] of [['sawtooth', 1, 1], ['square', 2, 0.18]] as const) {
        const o = ctx.createOscillator(), og = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f * mult * 0.93, at);
        o.frequency.linearRampToValueAtTime(f * mult, at + 0.05);
        o.frequency.linearRampToValueAtTime(f * mult * (i === n - 1 ? 0.84 : 0.98), at + long);
        og.gain.value = vol;
        o.connect(og).connect(horn);
        o.start(at);
        o.stop(at + long + 0.03);
      }
    }
  }

  /** Big innocent eyes: a few high bright notes. */
  twinkle(): void {
    [1568, 2093, 2637, 3136, 2637, 3520].forEach((f, i) => this.tone({ type: 'sine', f0: f, dur: 0.22, vol: 0.32, at: i * 0.09 }));
  }

  /** A handful of sand, thrown: a short dry hiss. */
  sand(): void {
    this.noise({ dur: 0.22, vol: 0.66, filter: 'highpass', f0: 2600, f1: 5200 });
    this.noise({ dur: 0.12, vol: 0.4, f0: 1400, f1: 700, q: 0.9, at: 0.04 });
  }

  /** One very large thump. */
  boom(): void {
    this.tone({ type: 'sine', f0: 130, f1: 30, dur: 0.6, vol: 0.66 });
    this.tone({ type: 'square', f0: 70, f1: 35, dur: 0.18, vol: 0.26 });
    this.noise({ dur: 0.5, vol: 0.7, filter: 'lowpass', f0: 1400, f1: 90 });
  }

  /** A light switch: up for on, down for off. */
  flick(on: boolean): void {
    this.tone({ type: 'square', f0: on ? 1900 : 1300, f1: on ? 1500 : 900, dur: 0.03, vol: 0.3 });
    this.noise({ dur: 0.02, vol: 0.3, filter: 'highpass', f0: 3000 });
  }

  /** Caught: the fun stops dead. */
  busted(): void {
    this.noise({ dur: 0.3, vol: 0.4, f0: 3200, f1: 300, q: 1.2 });
    [330, 247, 196].forEach((f, i) => this.tone({ type: 'sawtooth', f0: f, dur: 0.3, vol: 0.2, at: 0.1 + i * 0.16 }));
  }

  rageReady(): void {
    [330, 415, 494, 659].forEach((f, i) => this.tone({ type: 'sawtooth', f0: f, dur: 0.14, vol: 0.14, at: i * 0.07 }));
  }

  rageFire(): void {
    this.tone({ type: 'sawtooth', f0: 90, f1: 600, dur: 0.45, vol: 0.3 });
    this.noise({ dur: 0.7, vol: 0.5, filter: 'lowpass', f0: 3000, f1: 120, at: 0.42 });
    this.tone({ type: 'sine', f0: 160, f1: 36, dur: 0.7, vol: 0.8, at: 0.42 });
  }

  win(): void {
    this.mouth('fx_woohoo');
    [392, 494, 587, 784, 988, 1175].forEach((f, i) => this.tone({ type: 'triangle', f0: f, dur: 0.28, vol: 0.22, at: i * 0.1 }));
  }

  lose(): void {
    this.mouth('fx_groan');
    [392, 370, 330, 262].forEach((f, i) => this.tone({ type: 'sawtooth', f0: f, dur: 0.4, vol: 0.16, at: i * 0.22 }));
  }

  tick(): void {
    this.tone({ type: 'square', f0: 880, dur: 0.05, vol: 0.1 });
  }

  // ---- music: one recording per level --------------------------------------

  /** Start fetching a level's music, so it is ready by the time it is wanted. */
  loadMusic(track: string): void {
    if (this.files.has(track)) return;
    this.files.set(track, fetch(new URL(`${MUSIC_DIR}${track}.mp3`, document.baseURI))
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null));
  }

  /** Play a level's music from the top. It goes round again if the level
   *  outlasts it, and carries on until stopMusic(). If the track is not there
   *  to be had, `instead` plays. */
  startMusic(track: string, instead?: string): void {
    this.track = track;
    this.dim(1);
    if (!this.ctx || this.playing?.track === track) return;
    this.halt(0.25);
    this.loadMusic(track);
    void this.files.get(track)!.then(async (bytes) => {
      const ctx = this.ctx;
      if (!ctx) return;
      const buffer = bytes && await this.asSound(track, bytes);
      if (this.track !== track) return;
      if (!buffer) {
        if (instead) this.startMusic(instead);
        return;
      }
      // only if nothing has started since
      if (this.playing) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const fade = ctx.createGain();
      fade.gain.setValueAtTime(0.0001, ctx.currentTime);
      fade.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.5);
      src.connect(fade).connect(this.music);
      src.start();
      this.playing = { track, src, fade };
    });
  }

  /** A track's file turned into sound, once, and kept while there is room. A
   *  level's minute and a half is a lot of memory on a phone, so only the
   *  latest track is sure to be kept, and earlier ones only while it all comes
   *  to about two minutes: enough for the quick games to go back and forth
   *  between their own music and the workout tape's without a pause. */
  private asSound(track: string, bytes: ArrayBuffer): Promise<AudioBuffer | null> {
    let hit = this.decoded.find((d) => d.track === track);
    if (!hit) {
      const made = { track, seconds: 0, buffer: this.ctx!.decodeAudioData(bytes.slice(0)).catch(() => null) };
      void made.buffer.then((sound) => {
        made.seconds = sound?.duration ?? 0;
        let total = this.decoded.reduce((sum, d) => sum + d.seconds, 0);
        while (this.decoded.length > 1 && total > KEEP_SECONDS) total -= this.decoded.shift()!.seconds;
      });
      hit = made;
    }
    this.decoded = [...this.decoded.filter((d) => d !== hit), hit];
    return hit.buffer;
  }

  /** Turn the music down (or back up) for the scene: 1 is normal, 0.3 is hushed. */
  dim(level: number): void {
    this.musicLevel = level;
    if (!this.ctx) return;
    this.music.gain.cancelScheduledValues(this.ctx.currentTime);
    this.music.gain.setTargetAtTime(MUSIC_VOLUME * level, this.ctx.currentTime, 0.08);
  }

  stopMusic(): void {
    this.track = '';
    this.halt(0.7);
  }

  /** Fade out whatever is playing and let it go. */
  private halt(seconds: number): void {
    const p = this.playing;
    if (!p || !this.ctx) return;
    this.playing = undefined;
    const t = this.ctx.currentTime;
    p.fade.gain.cancelScheduledValues(t);
    p.fade.gain.setValueAtTime(Math.max(0.0001, p.fade.gain.value), t);
    p.fade.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    p.src.stop(t + seconds + 0.05);
  }

  /** Go quiet while the game is in the background, and pick up where it left
   *  off when it comes back. */
  sleep(asleep: boolean): void {
    if (!this.ctx) return;
    if (asleep) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  /** What the music is doing, for the self-play tests. */
  get musicState(): { wanted: string; playing: string; seconds: number } {
    return { wanted: this.track, playing: this.playing?.track ?? '', seconds: this.playing?.src.buffer?.duration ?? 0 };
  }
}

export const sound = new Sound();
