/** The game's sound. The effects are placeholders synthesised in code with
 *  the Web Audio API: every one is a slot that a real recording (family mouth
 *  sounds, Bill impressions) can replace later. The music is recordings, one
 *  per level, kept beside the page in `music/` (see tools/make_music.sh). */

/** Where the music is, relative to the page, and how loud it plays under the effects. */
const MUSIC_DIR = 'music/';
const MUSIC_VOLUME = 0.55;

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
  private decoded?: { track: string; buffer: Promise<AudioBuffer | null> };
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
    this.noise({ dur: 0.13, vol: 0.2, f0: 500, f1: 2600, q: 1.4 });
  }

  bonk(perfect: boolean): void {
    this.tone({ type: 'sine', f0: perfect ? 260 : 210, f1: 70, dur: 0.16, vol: 0.7 });
    this.tone({ type: 'square', f0: perfect ? 900 : 700, f1: 300, dur: 0.05, vol: 0.16 });
    this.noise({ dur: 0.05, vol: 0.35, filter: 'highpass', f0: 1800 });
    if (perfect) {
      this.tone({ type: 'triangle', f0: 1320, dur: 0.25, vol: 0.2, at: 0.02 });
      this.tone({ type: 'triangle', f0: 1980, dur: 0.3, vol: 0.14, at: 0.06 });
    }
  }

  /** The rubber-neck stretch: a springy "boi-oi-oing". */
  boing(power = 1): void {
    const f = 150 + Math.random() * 60;
    this.tone({
      type: 'sawtooth', f0: f * 2.4, f1: f * 0.7, dur: 0.55 + power * 0.15, vol: 0.13,
      vibrato: { rate: 13, depth: f * 0.9 }, at: 0.03,
    });
    this.tone({ type: 'sine', f0: f * 3.2, f1: f, dur: 0.5, vol: 0.2, vibrato: { rate: 13, depth: f * 1.2 }, at: 0.03 });
  }

  hurt(): void {
    this.tone({ type: 'sawtooth', f0: 420, f1: 90, dur: 0.4, vol: 0.28 });
    this.noise({ dur: 0.12, vol: 0.4, filter: 'lowpass', f0: 900 });
  }

  clang(): void {
    for (const [f, v] of [[523, 0.3], [787, 0.22], [1183, 0.16], [1571, 0.1]]) {
      this.tone({ type: 'square', f0: f, f1: f * 0.98, dur: 0.5, vol: v * 0.5 });
    }
  }

  yelp(): void {
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
    this.noise({ dur: 0.16, vol: 0.5, filter: 'lowpass', f0: 1400, f1: 180 });
    this.tone({ type: 'sine', f0: 170, f1: 60, dur: 0.14, vol: 0.4 });
  }

  /** Something hard bouncing off the floor. */
  tock(): void {
    this.tone({ type: 'triangle', f0: 520, f1: 260, dur: 0.07, vol: 0.3 });
    this.noise({ dur: 0.03, vol: 0.2, filter: 'highpass', f0: 2200 });
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
    [392, 494, 587, 784, 988, 1175].forEach((f, i) => this.tone({ type: 'triangle', f0: f, dur: 0.28, vol: 0.22, at: i * 0.1 }));
  }

  lose(): void {
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
   *  outlasts it, and carries on until stopMusic(). */
  startMusic(track: string): void {
    this.track = track;
    if (!this.ctx || this.playing?.track === track) return;
    this.halt(0.25);
    this.loadMusic(track);
    void this.files.get(track)!.then(async (bytes) => {
      const ctx = this.ctx;
      if (!bytes || !ctx) return;
      // one decoded track at a time: a minute and a half of sound is a lot of memory on a phone
      if (this.decoded?.track !== track) {
        this.decoded = { track, buffer: ctx.decodeAudioData(bytes.slice(0)).catch(() => null) };
      }
      const buffer = await this.decoded.buffer;
      // only if this is still the music that is wanted, and nothing has started since
      if (!buffer || this.track !== track || this.playing) return;
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
