/** Placeholder audio, synthesised in code with the Web Audio API so the
 *  prototype needs no sound files. Every method here is a slot that a real
 *  recording (family mouth sounds, Bill impressions) can replace later. */

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
  private timer?: number;
  private step = 0;
  private nextTime = 0;
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
      this.music.gain.value = 0.34;
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

  // ---- music: a looping surf-rock sketch (60s era placeholder) -----------------

  startMusic(): void {
    if (!this.ctx || this.timer !== undefined) return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 40);
  }

  stopMusic(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const sixteenth = 60 / 164 / 4;
    while (this.nextTime < ctx.currentTime + 0.15) {
      this.playStep(this.step, this.nextTime - ctx.currentTime, sixteenth);
      this.step = (this.step + 1) % 128;
      this.nextTime += sixteenth;
    }
  }

  private playStep(step: number, at: number, len: number): void {
    const bar = Math.floor(step / 16);
    const s = step % 16;
    // E minor surf cadence: Em Em Am Em | Em D C B
    const roots = [82.4, 82.4, 110, 82.4, 82.4, 73.4, 65.4, 61.7];
    const root = roots[bar];
    const out = this.music;
    if (s % 4 === 0) this.tone({ f0: 150, f1: 45, dur: 0.12, vol: 0.9, at, out });
    if (s % 4 === 2) {
      this.noise({ dur: 0.1, vol: 0.5, f0: 1900, q: 0.7, at, out });
      this.tone({ type: 'triangle', f0: 190, f1: 140, dur: 0.07, vol: 0.3, at, out });
    }
    if (s % 2 === 0) this.noise({ dur: 0.03, vol: 0.16, filter: 'highpass', f0: 7000, at, out });
    if (s % 2 === 0) {
      const walk = [1, 1, 1.5, 1.5, 1.335, 1.335, 1.5, 1.189][s / 2];
      this.tone({ type: 'triangle', f0: root * walk, dur: len * 1.8, vol: 0.5, at, out });
    }
    // tremolo-picked lead, two notes per beat
    const scale = [1, 1.189, 1.335, 1.5, 1.587, 1.782, 2];
    const riff = [0, 0, 2, 3, 4, 4, 3, 2, 0, 0, 2, 3, 6, 5, 4, 3];
    const riffB = [4, 4, 3, 2, 3, 3, 2, 0, 2, 2, 3, 4, 3, 2, 0, 0];
    const line = bar % 4 === 3 ? riffB : riff;
    const f = root * 4 * scale[line[s]];
    this.tone({ type: 'sawtooth', f0: f, dur: len * 0.9, vol: 0.085, attack: 0.003, at, out });
  }
}

export const sound = new Sound();
