import Phaser from 'phaser';
import { DEPTH, H, MAX_W, view } from '../config';
import { cutText, fillPaper, makePaperArt } from '../art/paper';
import { ART, applyArt, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { loadBest, saveBest } from '../data/progress';
import { BatMini } from '../minis/BatMini';
import { BopMini } from '../minis/BopMini';
import { FightMini } from '../minis/FightMini';
import { Mini, MiniHost } from '../minis/Mini';
import { PhoneMini } from '../minis/PhoneMini';
import { WorkoutMini } from '../minis/WorkoutMini';
import { label, written } from '../ui/text';

type Image = Phaser.GameObjects.Image;

/** Every quick game there is. To add one, write a class beside the others in
 *  src/minis and put it in this list. */
const ROSTER: { id: string; make: (host: MiniHost) => Mini }[] = [
  { id: 'workout', make: (h) => new WorkoutMini(h) },
  { id: 'phone', make: (h) => new PhoneMini(h) },
  { id: 'bop', make: (h) => new BopMini(h) },
  { id: 'bat', make: (h) => new BatMini(h) },
  { id: 'fight', make: (h) => new FightMini(h) },
];

const BAR_W = 250;
/** What the best run is saved under. (Not 'minis': that holds scores from when the games went round and round.) */
const BEST = 'home-movies';
/** What plays under the games that have no music of their own. */
const MUSIC = 'minis';

/** Home Movies: quick games, one straight after another, like flicking
 *  through the family's old video tapes. Each one says what to do, runs against
 *  the clock, and is stamped a hit or a miss. Every game is played once, and
 *  then the tape ends and says how many were cleared. */
export class MiniScene extends Phaser.Scene {
  private state: 'snow' | 'card' | 'play' | 'stamp' | 'over' = 'snow';
  /** Seconds left in this state (for 'play', seconds left on the clock). */
  private t = 0;
  private mini?: Mini;
  private miniId = '';
  /** The games still to come, how many there were to begin with, and how many have been on. */
  private queue: number[] = [];
  private total = 0;
  private played = 0;
  private score = 0;
  /** How many of the games played so far counted (one that cannot be won does not). */
  private counted = 0;
  private unscored: string[] = [];
  private auto: '' | 'good' | 'clumsy' = '';
  private only = '';
  private canRestart = false;
  private host!: MiniHost;

  /** Everything the scene itself owns; whatever else is on the page belongs to the game being played. */
  private keep = new Set<Phaser.GameObjects.GameObject>();
  /** One mark for each game on the tape: still to come, on now, cleared or missed. */
  private marks: Image[] = [];
  private scoreText!: Phaser.GameObjects.Text;
  private bar!: Phaser.GameObjects.Graphics;
  private mute!: Image;
  private snow!: Phaser.GameObjects.TileSprite;
  private card: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super('minis');
  }

  create(): void {
    const q = new URLSearchParams(location.search);
    const auto = q.get('auto');
    this.auto = auto === null ? '' : auto === 'clumsy' ? 'clumsy' : 'good';
    this.only = q.get('mini') ?? '';
    // every game once, in order (or just the one asked for)
    this.queue = ROSTER.map((_, i) => i).filter((i) => !this.only || ROSTER[i].id === this.only);
    if (this.queue.length === 0) this.queue = ROSTER.map((_, i) => i);
    this.total = this.queue.length;
    this.played = 0;
    this.score = 0;
    this.counted = 0;
    this.unscored = [];
    this.mini = undefined;
    this.canRestart = false;
    this.card = [];
    this.marks = [];
    this.tweens.timeScale = 1;
    this.cameras.main.setZoom(view.RES).centerOn(view.W / 2, H / 2);
    const onResize = () => this.cameras.main.setZoom(view.RES).centerOn(view.W / 2, H / 2);
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', onResize));

    // the scoreboard: a mark for each game on the tape, how many are cleared, and the clock
    const d = DEPTH.hud;
    const step = Math.min(30, (view.W / 2 - 110) / this.total);
    for (let i = 0; i < this.total; i++) this.marks.push(img(this, 26 + i * step, 26, 'mini_mark').setDepth(d));
    const tape = img(this, view.W / 2, 17, 'tape_m').setDepth(d);
    tape.setScale(tape.scale * 0.9, tape.scale);
    this.scoreText = written(this, view.W / 2, 17, 'CLEARED  0', 15).setDepth(d + 1);
    this.bar = this.add.graphics().setDepth(d);
    this.mute = img(this, view.W - 28, 28, sound.muted ? 'snd_off' : 'snd_on').setDepth(d);
    this.snow = this.add.tileSprite(view.W / 2, H / 2, MAX_W + 96, H + 96, 'tv_snow').setDepth(DEPTH.overlay + 5).setAlpha(0);
    this.keep = new Set(this.children.list);

    this.host = {
      scene: this,
      auto: this.auto,
      speed: 1,
      finish: (won) => this.finish(won),
      word: (word, x, y, big) => this.word(word, x, y, big),
    };

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      sound.unlock();
      const at = this.cameras.main.getWorldPoint(p.x, p.y);
      if (Math.hypot(at.x - (view.W - 28), at.y - 28) < 30) {
        sound.setMuted(!sound.muted);
        applyArt(this.mute, sound.muted ? 'snd_off' : 'snd_on');
      } else if (this.state === 'play') {
        this.mini?.press(at);
      } else if (this.state === 'over' && this.canRestart) {
        if (at.x > view.W / 2) this.scene.start('levels');
        else this.scene.restart();
      }
    });
    const up = (p: Phaser.Input.Pointer) => {
      if (this.state === 'play') this.mini?.release(this.cameras.main.getWorldPoint(p.x, p.y));
    };
    this.input.on('pointerup', up);
    this.input.on('pointerupoutside', up);
    const space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    space?.on('down', () => { if (this.state === 'play') this.mini?.press({ x: view.W / 2, y: H / 2 }); });
    space?.on('up', () => { if (this.state === 'play') this.mini?.release({ x: view.W / 2, y: H / 2 }); });

    sound.loadMusic(MUSIC);
    (window as unknown as { __rn: unknown }).__rn = this;
    this.next();
  }

  /** Which game is on, for the self-play tests. */
  get playing(): string {
    return this.miniId;
  }

  // ---- from one game to the next ------------------------------------------------------

  /** Clear away whatever the last game left on the page. */
  private sweep(): void {
    this.tweens.killAll();
    this.time.removeAllEvents();
    sound.stopBreath();
    sound.stopPower();
    for (const o of [...this.children.list]) if (!this.keep.has(o)) o.destroy();
    this.card = [];
    this.cameras.main.setZoom(view.RES).centerOn(view.W / 2, H / 2);
    this.cameras.main.resetFX();
  }

  /** Change the channel: snow, then the next game with its instructions over it. */
  private next(): void {
    this.sweep();
    const entry = ROSTER[this.queue.shift()!];
    applyArt(this.marks[this.played], 'mini_mark_now');
    this.played++;
    this.miniId = entry.id;
    this.mini = entry.make(this.host);
    this.mini.build();
    // its own music if it has some (and the file is there), the usual otherwise
    if (this.mini.music) sound.startMusic(this.mini.music, MUSIC);
    else sound.startMusic(MUSIC);

    // what it is, on a strip of tape, and what to do, in big letters
    const veil = this.add.rectangle(view.W / 2, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.5).setDepth(DEPTH.overlay);
    const tape = img(this, view.W / 2, 170, 'tape_l').setDepth(DEPTH.overlay + 1).setRotation(-0.015);
    const title = written(this, view.W / 2, 170, this.mini.title, 22).setDepth(DEPTH.overlay + 2).setRotation(-0.015);
    tape.setScale(tape.scale * Math.max(0.5, (title.width + 40) / ART.tape_l.w), tape.scale);
    let size = 58;
    const prompt = label(this, view.W / 2, 262, this.mini.prompt, size, '#f6c430').setDepth(DEPTH.overlay + 2);
    while (prompt.width > view.W - 60 && size > 26) prompt.setFontSize(size -= 4);
    this.card = [veil, tape, title, prompt];
    this.snow.setAlpha(1);
    sound.flick(true);
    this.state = 'snow';
    this.t = 0.3;
    this.drawBar(1);
  }

  private startPlay(): void {
    for (const o of this.card) o.destroy();
    this.card = [];
    this.state = 'play';
    this.t = this.mini!.seconds;
  }

  /** The game is over, one way or the other: stamp it. */
  private finish(won: boolean): void {
    if (this.state !== 'play') return;
    this.state = 'stamp';
    this.t = 1.05;
    const scored = this.mini!.scored;
    if (scored) this.counted++;
    else this.unscored.push(this.mini!.title);
    if (won) {
      this.score++;
      sound.cash();
    } else {
      sound.clang();
      this.cameras.main.shake(160, 0.006);
    }
    this.scoreText.setText(`CLEARED  ${this.score}`);
    applyArt(this.marks[this.played - 1], !scored ? 'mini_mark_ko' : won ? 'mini_mark_win' : 'mini_mark_lose');
    // a game that was never going to be won has said so itself: no stamp on top of that
    if (!scored) return;
    const stamp = img(this, view.W / 2, 230, won ? 'stamp_win' : 'stamp_lose').setDepth(DEPTH.overlay + 3).setRotation(-0.08);
    const full = stamp.scale;
    stamp.setScale(full * 1.8).setAlpha(0);
    this.tweens.add({ targets: stamp, scale: full, alpha: 1, duration: 140, ease: 'Quad.in' });
  }

  private word(word: string, x: number, y: number, big = false): void {
    const im = img(this, x, y, `word_${word}`).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.3);
    const full = im.scale;
    im.setScale(full * 0.3).setAlpha(0);
    this.tweens.add({ targets: im, scale: full, alpha: 1, duration: 110, ease: 'Back.out' });
    this.tweens.add({ targets: im, y: y - 36, alpha: 0, duration: 320, delay: big ? 800 : 460, onComplete: () => im.destroy() });
  }

  private drawBar(frac: number): void {
    // beside the score, out of the way of whatever the game has put top left
    const g = this.bar, x = view.W / 2 + 92, y = 10;
    g.clear();
    g.fillStyle(0x18100a, 0.3);
    g.fillRoundedRect(x + 2, y + 3, BAR_W, 14, 5);
    g.fillStyle(0xf9f4e4, 1);
    g.fillRoundedRect(x, y, BAR_W, 14, 5);
    g.fillStyle(0x242022, 1);
    g.fillRoundedRect(x + 3, y + 3, BAR_W - 6, 8, 3);
    if (frac > 0.005) {
      g.fillStyle(frac < 0.25 ? 0xcc302a : 0xf6c430, 1);
      g.fillRoundedRect(x + 3, y + 3, (BAR_W - 6) * Math.min(1, frac), 8, 3);
    }
  }

  // ---- the end ------------------------------------------------------------------------

  /** Every game has been on: the tape ends, and says how it went. */
  private theEnd(): void {
    this.sweep();
    this.state = 'over';
    this.mini = undefined;
    sound.stopMusic();
    const all = this.counted > 0 && this.score === this.counted;
    if (all) sound.win();
    else if (this.score === 0) sound.lose();
    else sound.cash();
    this.bar.clear();
    // the best is only kept for the whole tape, played by a person
    const whole = this.total === ROSTER.length;
    const best = whole ? Math.max(this.score, loadBest(BEST)) : this.score;
    if (!this.auto && whole) saveBest(BEST, this.score);
    const W = view.W, d = DEPTH.overlay + 2, px = W / 2, py = H / 2 + 8, pw = 500, ph = 300;
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x1b1820, 1);
    g.fillRect(-48, -48, MAX_W + 96, H + 96);
    this.snow.setAlpha(0.16);
    makePaperArt(this, 'mini_results', pw, ph, (c) => {
      c.beginPath();
      c.rect(0, 0, pw, ph);
      fillPaper(c, 'cream');
      cutText(c, all ? "THAT'S A WRAP!" : 'END OF TAPE', pw / 2, 56, 50, 'red');
    }, { border: 0 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.textures.remove('mini_results'));
    img(this, px, py, 'mini_results').setDepth(d - 1).setRotation(-0.01);
    const rows: [string, string][] = [['Games cleared', `${this.score} of ${this.counted}`], ['Best so far', `${best} of ${this.counted}`]];
    for (const title of this.unscored) rows.push([title.charAt(0) + title.slice(1).toLowerCase(), 'lost, as always']);
    rows.forEach(([k, v], i) => {
      const y = py - 18 + i * 40;
      written(this, px - 190, y, k, 22).setOrigin(0, 0.5).setDepth(d);
      written(this, px + 190, y, v, 22, '#b8372a').setOrigin(1, 0.5).setDepth(d);
    });
    const note = (x: number, text: string) => {
      const t = written(this, 0, 0, text, 20);
      const tape = img(this, 0, 0, 'tape_m');
      tape.setScale(tape.scale * 1.05, tape.scale * 1.1);
      return this.add.container(x, py + 112, [tape, t]).setDepth(d + 1).setAlpha(0);
    };
    const notes = [note(px - 118, 'PLAY AGAIN'), note(px + 118, 'LEVELS')];
    this.time.delayedCall(900, () => {
      this.canRestart = true;
      notes.forEach((n) => n.setAlpha(1));
    });
  }

  // ---- main loop -----------------------------------------------------------------------

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50) / 1000;
    this.snow.tilePositionX = Math.random() * 256;
    this.snow.tilePositionY = Math.random() * 256;
    if (this.state === 'over') return;

    if (this.state === 'play') {
      const g = dt * this.host.speed;
      this.mini!.update(g);
      if (this.auto && this.state === 'play') this.mini!.bot(g);
      if (this.state !== 'play') return;
      this.t -= g;
      this.drawBar(this.t / this.mini!.seconds);
      if (this.t <= 0) this.finish(this.mini!.timeUp());
      return;
    }

    this.t -= dt;
    if (this.state === 'snow') {
      this.snow.setAlpha(Math.max(0, this.t / 0.3));
      if (this.t <= 0) {
        this.snow.setAlpha(0);
        this.state = 'card';
        this.t = this.auto ? 0.5 : 1.9;
      }
    } else if (this.state === 'card' && this.t <= 0) {
      this.startPlay();
    } else if (this.state === 'stamp' && this.t <= 0) {
      if (this.queue.length === 0) this.theEnd();
      else this.next();
    }
  }
}
