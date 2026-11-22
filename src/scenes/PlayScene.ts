import Phaser from 'phaser';
import { BILL, DEPTH, H, HEAD_SRC_H, INK, MAX_W, SCORE, view } from '../config';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { HIGHWAY_JAM, LevelDef, Story, countHeads, levelById } from '../data/levels';
import { saveStars } from '../data/progress';
import { PHRASES, Phrase, pick } from '../data/phrases';
import { Bill } from '../objects/Bill';
import { Hud } from '../ui/Hud';
import { written } from '../ui/text';
import { DISPLAY, bubblePath, cutText, fillPaper, glued, makePaperArt, tapePath, textWidth } from '../art/paper';

export type Quality = 'good' | 'perfect' | 'rage';
export type Point = { x: number; y: number };

/** What every level has in common, whichever way the camera is looking: Bill,
 *  the scoreboard, taps and buttons, the things that pop up on the page, and
 *  the results at the end. A level adds its own world and its own targets. */
export abstract class PlayScene extends Phaser.Scene {
  protected bill!: Bill;
  protected hud!: Hud;
  protected level: LevelDef = HIGHWAY_JAM;
  protected starFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private bubble?: Phaser.GameObjects.Image;
  private bubbleSeq = 0;
  private hintNote?: Phaser.GameObjects.Container;

  /** How far across the screen Bill is. */
  protected billFrac = BILL.xFrac;
  /** Whether this level uses the DUCK and RAGE buttons. */
  protected buttons = true;
  protected levelT = 0;
  protected total = 0;
  protected whacked = 0;
  protected missed = 0;
  protected perfects = 0;
  protected combo = 0;
  protected bestCombo = 0;
  protected cash = 0;
  protected hearts = BILL.maxHearts;
  protected rage = 0;
  protected slow = 1;
  protected hitStop = 0;
  protected rageT = -1;
  protected over = false;
  protected canRestart = false;
  protected duckPointer = -1;
  protected duckKey = false;
  /** A tap that arrived mid-swing is remembered briefly so fast taps are not lost. */
  protected swingBuffer = 0;
  private taught = new Set<string>();
  protected auto: '' | 'good' | 'clumsy' = '';
  protected keys!: Record<'down' | 's' | 'space' | 'r' | 'enter', Phaser.Input.Keyboard.Key>;

  /** Which level to play: passed in by the level select, or `?level=` in the address. */
  init(data: { level?: string }): void {
    this.level = levelById(data?.level ?? new URLSearchParams(location.search).get('level'));
  }

  protected abstract tryRage(): void;

  // ---- setup -------------------------------------------------------------------

  /** Reset the score sheet. Call first in create(), before building the world. */
  protected begin(): void {
    this.levelT = 0;
    this.total = this.level.par ?? countHeads(this.level);
    this.whacked = this.missed = this.perfects = this.combo = this.bestCombo = this.cash = this.rage = 0;
    this.hearts = BILL.maxHearts;
    this.slow = 1;
    this.hitStop = 0;
    this.rageT = -1;
    this.over = false;
    this.canRestart = false;
    this.duckPointer = -1;
    this.duckKey = false;
    this.swingBuffer = 0;
    this.taught = new Set();
    this.bubble = undefined;
    this.hintNote = undefined;
    const auto = new URLSearchParams(location.search).get('auto');
    this.auto = auto === null ? '' : auto === 'clumsy' ? 'clumsy' : 'good';
    this.tweens.timeScale = 1;
    this.fitCamera();
    sound.loadMusic(this.level.id);
  }

  /** Put the scoreboard on top and start the level. Call last in create(),
   *  once the world and Bill exist. */
  protected ready(): void {
    this.hud = new Hud(this, this.level.words.meter, this.buttons);
    this.hud.setHearts(this.hearts);
    this.hud.setJam(0, 0, this.total);
    this.hud.setMuted(sound.muted);

    this.starFx = this.add.particles(0, 0, 'star', {
      speed: { min: 160, max: 420 }, angle: { min: 200, max: 345 }, gravityY: 900, lifespan: 650,
      scale: { start: 0.42, end: 0.12 }, rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(DEPTH.fx + 4);

    this.setupInput();
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.onResize, this));

    this.opening();
    sound.startMusic(this.level.id);
    (window as unknown as { __rn: unknown }).__rn = this;
  }

  /** How the level opens: its name on a banner, unless it has more to say first. */
  protected opening(): void {
    this.intro();
  }

  private fitCamera(): void {
    this.cameras.main.setZoom(view.RES).centerOn(view.W / 2, H / 2);
  }

  protected onResize(): void {
    this.fitCamera();
    this.hud.layout();
    this.bill?.setX(view.W * this.billFrac);
  }

  private setupInput(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      sound.unlock();
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      if (this.over) {
        // the results page: "play again" on the left, "levels" on the right
        if (this.canRestart) {
          if (w.x > view.W / 2) this.scene.start('levels');
          else this.scene.restart({ level: this.level.id });
        }
        return;
      }
      if (this.hud.overMute(w.x, w.y)) {
        sound.setMuted(!sound.muted);
        this.hud.setMuted(sound.muted);
      } else if (this.hud.overDuck(w.x, w.y)) {
        this.duckPointer = p.id;
      } else if (this.hud.overRage(w.x, w.y)) {
        this.tryRage();
      } else {
        this.trySwing();
      }
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.duckPointer) this.duckPointer = -1;
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        r: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        enter: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
      this.keys.space.on('down', () => {
        sound.unlock();
        if (this.over) { if (this.canRestart) this.scene.restart({ level: this.level.id }); } else this.trySwing();
      });
      this.keys.r.on('down', () => this.tryRage());
      this.keys.enter.on('down', () => this.tryRage());
    }
  }

  /** The level's name on a paper banner, with the brief on a strip of tape. */
  protected intro(): void {
    const name = this.level.name;
    const w = Math.max(300, textWidth(name, 66) + 70), h = 92;
    makePaperArt(this, 'intro_banner', w, h, (c) => {
      tapePath(c, 0, 0, w, h);
      fillPaper(c, 'red');
      cutText(c, name, w / 2, h / 2 + 3, 66, 'yellow');
    }, { border: 3 });
    const title = img(this, view.W / 2, 150, 'intro_banner').setDepth(DEPTH.overlay).setRotation(-0.03).setAlpha(0);
    const full = title.scale;
    title.setScale(full * 0.2);
    const sub = written(this, view.W / 2, 222, this.level.tagline, 21).setDepth(DEPTH.overlay).setAlpha(0).setRotation(0.012);
    const tape = img(this, view.W / 2, 222, 'tape_l').setDepth(DEPTH.overlay).setAlpha(0).setRotation(0.012);
    tape.setScale(tape.scale * Math.max(1, (sub.width + 30) / ART.tape_l.w), tape.scale);
    sub.setDepth(DEPTH.overlay + 0.5);
    this.tweens.add({ targets: title, scale: full, alpha: 1, duration: 320, ease: 'Back.out' });
    this.tweens.add({ targets: [tape, sub], alpha: 1, duration: 250, delay: 250 });
    this.tweens.add({
      targets: [title, tape, sub], alpha: 0, y: '-=30', duration: 300, delay: 2500,
      onComplete: () => { title.destroy(); tape.destroy(); sub.destroy(); this.textures.remove('intro_banner'); },
    });
  }

  // ---- player actions ------------------------------------------------------------

  protected trySwing(): void {
    if (this.over || this.rageT >= 0) return;
    if (this.bill.startSwing()) {
      this.swingBuffer = 0;
      sound.whoosh();
    } else if (!this.bill.wantDuck) {
      this.swingBuffer = 0.13;
    }
  }

  /** Once a frame while the level is running: buffered taps, and the DUCK button. */
  protected readInput(real: number): void {
    if (this.swingBuffer > 0) {
      this.swingBuffer -= real;
      if (this.bill.canSwing) this.trySwing();
    }
    const keyDuck = !!this.keys && (this.keys.down.isDown || this.keys.s.isDown);
    this.bill.wantDuck = this.duckPointer >= 0 || keyDuck || this.duckKey;
    this.hud.setDuckPressed(this.bill.wantDuck);
  }

  protected setSlow(s: number): void {
    this.slow = s;
    this.tweens.timeScale = s < 1 ? Math.max(s, 0.35) : 1;
  }

  // ---- keeping score ---------------------------------------------------------------

  protected get mult(): number {
    return Math.min(5, 1 + Math.floor(this.combo / 5));
  }

  /** Count one good hit: the combo, the cash and the rage meter. Returns the cash earned. */
  protected tally(q: Quality): number {
    const perfect = q !== 'good';
    this.whacked++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    if (q === 'perfect') this.perfects++;
    const gain = (perfect ? SCORE.perfect : SCORE.good) * this.mult;
    this.cash += gain;
    if (q !== 'rage') {
      const was = this.rage;
      this.rage = Math.min(100, this.rage + (perfect ? SCORE.ragePerfect : SCORE.rageGood));
      if (was < 100 && this.rage >= 100) {
        sound.rageReady();
        this.teach('rage', 'RAGE is ready - hit the button!');
      }
    }
    return gain;
  }

  /** Write the score sheet back onto the scoreboard. */
  protected showTally(): void {
    this.hud.setCash(this.cash);
    this.hud.setCombo(this.combo, this.mult);
    this.hud.setRage(this.rage / 100);
    this.hud.setJam(this.whacked, this.missed, this.total);
  }

  /** Something has clocked Bill: a heart goes, and `word` pops up over his head. */
  protected hurtBill(word: string): void {
    this.hearts--;
    this.combo = 0;
    this.hud.setHearts(this.hearts);
    this.hud.loseHeartFx(this.hearts);
    this.hud.setCombo(0, 1);
    this.bill.hurt();
    sound.clang();
    sound.hurt();
    this.cameras.main.shake(220, 0.012);
    this.cameras.main.flash(120, 255, 90, 80);
    const top = this.bill.headTop;
    this.burst(top.x, top.y + 20, false);
    this.popWord(top.x, top.y - 24, word);
    this.say(pick(PHRASES.hurt), 0.55);
    if (this.hearts <= 0) this.finish('bonked');
  }

  // ---- little effects --------------------------------------------------------------

  protected burst(x: number, y: number, big: boolean): void {
    const b = img(this, x, y, 'burst').setDepth(DEPTH.fx).setRotation(Math.random() * 6);
    const s = b.scale * (big ? 1.15 : 0.8);
    b.setScale(s * 0.3);
    this.tweens.add({ targets: b, scale: s, duration: 70, ease: 'Back.out' });
    this.tweens.add({ targets: b, alpha: 0, scale: s * 1.25, duration: 150, delay: 90, onComplete: () => b.destroy() });
    this.starFx.explode(big ? 10 : 6, x, y);
  }

  /** A number or note scribbled on a scrap of tape and slapped down. */
  protected popTag(x: number, y: number, text: string, color: string, delay = 0): void {
    const t = written(this, 0, 0, text, 19, color);
    const tape = img(this, 0, 0, 'tape_s');
    tape.setScale(tape.scale * Math.max(0.8, (t.width + 4) / ART.tape_s.w), tape.scale);
    const c = this.add.container(x, y, [tape, t]).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.3).setScale(0.3).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 110, delay, ease: 'Back.out' });
    this.tweens.add({ targets: c, y: y - 46, alpha: 0, duration: 380, delay: delay + 430, onComplete: () => c.destroy() });
  }

  /** A word on a jagged paper burst, slapped onto the page. */
  protected popWord(x: number, y: number, word: string): void {
    const im = img(this, x, y, `word_${word}`).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.36);
    const full = im.scale;
    im.setScale(full * 0.3).setAlpha(0);
    this.tweens.add({ targets: im, scale: full, alpha: 1, duration: 110, ease: 'Back.out' });
    this.tweens.add({ targets: im, y: y - 40, alpha: 0, duration: 340, delay: 480, onComplete: () => im.destroy() });
  }

  /** Bill says a line: a speech bubble cut from paper, with a tail toward his
   *  head, and the recording of it if there is one. The voice waits `after`
   *  seconds, so it does not land on top of the whack that set it off. */
  protected say(line: Phrase, after = 0.3, from: Point = this.bill.headTop): void {
    const text = line.text;
    sound.say(line.voice, after);
    this.bubble?.destroy();
    const size = 26;
    const w = textWidth(text, size) + 34, h = 42, tail = 22;
    const key = `bubble_${this.bubbleSeq++}`;
    makePaperArt(this, key, w, h + tail, (c) => {
      bubblePath(c, w, h, w - 74, tail);
      fillPaper(c, 'white');
      c.font = `${size}px ${DISPLAY}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = INK;
      c.fillText(text, w / 2, h / 2 + 1);
    }, { border: 2, ax: w - 44, ay: h + tail });
    const top = from;
    const x = Phaser.Math.Clamp(top.x - 22, w - 36, view.W - 50);
    const b = img(this, x, Math.max(h + tail + 76, top.y - 6), key).setDepth(DEPTH.fx + 10);
    const full = b.scale;
    b.setScale(full * 0.3);
    this.bubble = b;
    this.tweens.add({ targets: b, scale: full, duration: 140, ease: 'Back.out' });
    this.tweens.add({
      targets: b, alpha: 0, duration: 200, delay: 1500,
      onComplete: () => { if (this.bubble === b) this.bubble = undefined; b.destroy(); this.textures.remove(key); },
    });
  }

  /** A tip written on a long strip of tape across the top of the page. */
  protected hint(text: string): void {
    this.hintNote?.destroy();
    const t = written(this, 0, 0, text, 21);
    const tape = img(this, 0, 0, 'tape_l');
    tape.setScale(tape.scale * Math.max(0.5, (t.width + 34) / ART.tape_l.w), tape.scale);
    const c = this.add.container(view.W / 2, 150, [tape, t]).setDepth(DEPTH.overlay - 1).setRotation(-0.012).setScale(0.4).setAlpha(0);
    this.hintNote = c;
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 180, ease: 'Back.out' });
    this.tweens.add({
      targets: c, alpha: 0, duration: 250, delay: 2300,
      onComplete: () => { if (this.hintNote === c) this.hintNote = undefined; c.destroy(); },
    });
  }

  protected teach(id: string, text: string): void {
    if (this.taught.has(id)) return;
    this.taught.add(id);
    this.hint(text);
  }

  // ---- results ----------------------------------------------------------------------

  protected finish(reason: 'end' | 'bonked'): void {
    if (this.over) return;
    this.over = true;
    this.setSlow(1);
    this.duckPointer = -1;
    const frac = this.whacked / this.total;
    const stars = reason === 'bonked' ? 0 : SCORE.passStars.filter((s) => frac >= s).length;
    const won = stars > 0;
    if (!this.auto) saveStars(this.level.id, stars);
    sound.stopMusic();
    this.time.delayedCall(won ? 500 : 700, () => this.outro(won, () => this.showResults(won, stars, reason)));
  }

  /** Anything a level wants to show between its last hit and the results page. */
  protected outro(_won: boolean, done: () => void): void {
    done();
  }

  /** The two middle lines of the results page. */
  protected resultRows(): [string, string][] {
    return [['Perfect hits', `${this.perfects}`], ['Best combo', `${this.bestCombo}`]];
  }

  /** A page of story on ruled notebook paper, over the top of the scene. It
   *  stays until it is tapped (or has had time to be read), then calls `done`.
   *  `art` is a piece of the level to stick in the top corner; Bill grins from
   *  the bottom one unless `face` is false. `spoken` starts any voices. */
  protected storyPage(story: Story, done: () => void, opts: { art?: string; face?: boolean; spoken?: () => void } = {}): void {
    const W = view.W, d = DEPTH.overlay + 1;
    const pw = 600, ph = 380, px = W / 2, py = H / 2 + 4;
    const made: Phaser.GameObjects.GameObject[] = [];
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T): T => { made.push(o); return o; };

    const veil = keep(this.add.rectangle(W / 2, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.55).setDepth(DEPTH.overlay).setAlpha(0));
    this.tweens.add({ targets: veil, alpha: 1, duration: 250 });
    makePaperArt(this, 'story_page', pw, ph, (c) => {
      c.beginPath();
      c.rect(0, 0, pw, ph);
      fillPaper(c, 'white');
      c.fillStyle = 'rgba(60, 110, 190, 0.32)';
      for (let y = 74; y < ph - 10; y += 30) c.fillRect(0, y, pw, 1.4);
      c.fillStyle = 'rgba(200, 50, 50, 0.45)';
      c.fillRect(64, 0, 1.6, ph);
      for (const y of [60, ph / 2, ph - 60]) {
        c.beginPath();
        c.arc(30, y, 9, 0, Math.PI * 2);
        c.fillStyle = 'rgba(30, 24, 30, 0.55)';
        c.fill();
      }
    }, { border: 0 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.textures.remove('story_page'));
    const page = keep(img(this, px, py, 'story_page').setDepth(d).setRotation(-0.012));
    const full = page.scale;
    page.setScale(full * 0.6).setAlpha(0);
    this.tweens.add({ targets: page, scale: full, alpha: 1, duration: 240, ease: 'Back.out' });

    const left = px - pw / 2 + 84, wide = pw - 84 - 116;
    const parts: (Phaser.GameObjects.Text | Phaser.GameObjects.Image)[] = [];
    let y = py - ph / 2 + 42;
    parts.push(keep(written(this, left, y, story.title, 22, '#b8372a').setOrigin(0, 0.5)));
    y += 46;
    for (const [who, said] of story.lines) {
      if (who) {
        parts.push(keep(written(this, left, y, `${who}:`, 15, '#7a6a58').setOrigin(0, 0.5)));
        y += 12;
      } else {
        y -= 10;
      }
      const line = keep(written(this, left, y, said, who ? 23 : 20).setOrigin(0, 0).setAlign('left').setWordWrapWidth(wide));
      parts.push(line);
      y += line.height + 16;
    }
    if (story.caption) parts.push(keep(written(this, left, py + ph / 2 - 62, story.caption, 17, '#7a6a58').setOrigin(0, 0.5)));
    if (opts.art) parts.push(keep(img(this, px + pw / 2 - 86, py - ph / 2 + 80, opts.art).setRotation(0.16)));
    if (opts.face !== false) {
      parts.push(keep(this.add.image(px + pw / 2 - 70, py + ph / 2 - 84, 'bill-grin').setRotation(0.1).setScale(138 / HEAD_SRC_H)));
    }
    parts.push(keep(written(this, px, py + ph / 2 - 24, 'tap to continue', 15, '#7a6a58')));
    parts.forEach((o, i) => {
      o.setDepth(d + 1).setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 260, delay: 260 + Math.min(i, 6) * 260 });
    });
    opts.spoken?.();

    let finished = false;
    const next = () => {
      if (finished) return;
      finished = true;
      sound.hush();
      made.forEach((o) => o.destroy());
      done();
    };
    // long enough to read it; a tap moves on sooner
    this.time.delayedCall(this.auto ? 2600 : 16000, next);
    this.time.delayedCall(1500, () => {
      this.input.once('pointerdown', next);
      this.input.keyboard?.once('keydown-SPACE', next);
    });
  }

  /** The results page: a sheet of paper held by photo corners. */
  private showResults(won: boolean, stars: number, reason: 'end' | 'bonked'): void {
    const W = view.W;
    if (won) sound.win(); else sound.lose();
    const veil = this.add.rectangle(W / 2, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.55).setDepth(DEPTH.overlay).setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 250 });

    const pw = 560, ph = 396, px = W / 2, py = H / 2 + 6;
    const title = won ? this.level.words.cleared : reason === 'bonked' ? "BILL'S HAD ENOUGH" : this.level.words.lost;
    makePaperArt(this, 'results_page', pw, ph, (c) => {
      c.beginPath();
      c.rect(0, 0, pw, ph);
      fillPaper(c, 'cream');
      glued(c, () => {
        for (const [x, y, sx, sy] of [[0, 0, 1, 1], [pw, 0, -1, 1], [0, ph, 1, -1], [pw, ph, -1, -1]]) {
          c.beginPath();
          c.moveTo(x, y); c.lineTo(x + 34 * sx, y); c.lineTo(x, y + 34 * sy);
          c.closePath();
          fillPaper(c, 'black');
        }
      });
      cutText(c, title, pw / 2, 52, title.length > 18 ? 40 : title.length > 13 ? 50 : 60, won ? 'red' : 'blue');
    }, { border: 0 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.textures.remove('results_page'));
    const d = DEPTH.overlay + 2;
    img(this, px, py, 'results_page').setDepth(d - 1).setRotation(-0.008);

    for (let i = 0; i < 3; i++) {
      const on = i < stars;
      const s = img(this, px - 92 + i * 92, py - 76 + (i === 1 ? -8 : 0), on ? 'star_big' : 'star_big_off').setDepth(d).setRotation((i - 1) * 0.12);
      if (on) {
        const full = s.scale;
        s.setScale(0);
        this.tweens.add({
          targets: s, scale: full, duration: 260, delay: 350 + i * 260, ease: 'Back.out',
          onStart: () => sound.tick(),
        });
      }
    }

    const pct = Math.round((this.whacked / this.total) * 100);
    const rows: [string, string][] = [
      [this.level.words.counted, `${this.whacked} / ${this.total}  (${pct}%)`],
      ...this.resultRows(),
      ['Cash earned', `$${this.cash}`],
    ];
    rows.forEach(([k, v], i) => {
      const y = py + 2 + i * 33;
      written(this, px - 222, y, k, 21).setOrigin(0, 0.5).setDepth(d);
      written(this, px + 222, y, v, 21, '#b8372a').setOrigin(1, 0.5).setDepth(d);
    });
    if (!won && reason === 'end') {
      written(this, px, py - 24, `Need ${Math.round(SCORE.passStars[0] * 100)}% to pass`, 16, '#7a6a58').setDepth(d);
    }

    const face = this.add.image(px - pw / 2 + 12, py - ph / 2 + 30, won ? 'bill-grin' : 'bill-glare').setDepth(d + 1).setRotation(-0.22);
    face.setScale(121 / HEAD_SRC_H);

    // two notes on tape: play it again (left), or back to the levels (right)
    const note = (x: number, text: string) => {
      const t = written(this, 0, 0, text, 20);
      const tape = img(this, 0, 0, 'tape_m');
      tape.setScale(tape.scale * 1.05, tape.scale * 1.1);
      return this.add.container(x, py + 158, [tape, t]).setDepth(d + 1).setAlpha(0).setRotation(x < px ? -0.02 : 0.02);
    };
    const notes = [note(px - 118, 'PLAY AGAIN'), note(px + 118, 'LEVELS')];
    this.time.delayedCall(1100, () => {
      this.canRestart = true;
      notes.forEach((n) => n.setAlpha(1));
      this.tweens.add({ targets: notes, y: '-=5', duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }
}
