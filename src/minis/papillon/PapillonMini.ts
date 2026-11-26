import Phaser from 'phaser';
import { ART, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { DEPTH, view } from '../../config';
import { written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { Diner, LAYER, PAPILLON, Talk, Waiter, layPapillon, onTable, setTable } from '../shared/papillon';
import { MENU } from './art';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;

/** How long Stephanie's thought stays up, course by course. */
const THINKS = [2.3, 2.3, 2.7];
/** What the self-play bots order, course by course: the careful one always what she wants
 *  second; the careless one gets the first course right and then orders what she is having. */
const BOT = { good: ['second', 'second', 'second'], clumsy: ['second', 'first', 'second'] };

/** The middle of what can be seen of the tablecloth: bare, and so where a word on a burst goes. */
const CLOTH = 474;

/** How long WHAT A CRAZY COINCIDENCE! stays up, in seconds, before it goes (the scene's own words get 0.8). */
const COINCIDENCE = 1.8;

type Phase = 'play' | 'pick' | 'done';

/** Dinner at Le Papillon. When the family eats out, Stephanie orders what she
 *  wants most, and Bill orders whatever she wants second most: what a crazy
 *  coincidence that it is also always exactly what he wanted.
 *
 *  Three courses. For each, a thought pops up over Stephanie's head with what
 *  she wants most and what she wants after that, and goes again; she orders the
 *  first; the waiter turns to Bill, and the player picks his off the menu. Her
 *  second choice is the right answer. Her first ("That's what I'm having") or
 *  anything else ("...Really, Bill?") ends the dinner there. It gets harder to
 *  keep track of: the main course is three dishes deep, and over dessert she
 *  changes her mind. It waits for the player, and has no clock.
 *
 *  In between, the waiter brings something nobody ordered, and Christian says
 *  what he said. */
export class PapillonMini extends Mini {
  readonly title = 'DINNER AT LE PAPILLON';
  readonly prompt = 'ORDER FOR BILL!';
  readonly seconds = 60;
  readonly timed = false;

  phase: Phase = 'play';
  /** Which course it is, what is going on in it, and what Bill has ordered so far. */
  course = 0;
  beat = '';
  ordered: string[] = [];
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  private talk!: Talk;
  private bits: { im: Image; vx: number; vy: number; life: number; drop: number; sway: number }[] = [];

  bill!: Diner;
  steph!: Diner;
  christian!: Diner;
  waiter!: Waiter;
  /** The middle of the table, and where the waiter stands to take the order. */
  private tx = 0;
  private post = 0;
  private menus: Image[] = [];
  /** What she wants, best first (indexes into the course's dishes). */
  private want: number[] = [];
  bubble?: Box;
  private puffs: Image[] = [];
  private cards: { x: number; y: number; dish: number; parts: (Image | Phaser.GameObjects.Text)[] }[] = [];
  private cardWide = 300;
  private botIn = 0;
  /** What the waiter is carrying, if anything: it goes where his hand goes. */
  private carried: Image[] = [];
  private nag = 0;

  get said() {
    return this.talk.said;
  }

  build(): void {
    const s = this.scene, W = view.W;
    this.talk = new Talk(s);
    // (on a narrow screen the table moves over, to leave the waiter room at its end)
    this.tx = W / 2 + (W < 1000 ? 36 : 0);
    this.post = Math.max(66, this.tx - 400);
    layPapillon(s);
    setTable(s, this.tx);
    this.bill = new Diner(s, 'bill', this.tx - 210, 'smile');
    this.christian = new Diner(s, 'christian', this.tx, 'calm');
    this.steph = new Diner(s, 'stephanie', this.tx + 210, 'smile');
    onTable(s, 'papillon_candle', this.tx - 104, 8);
    onTable(s, 'papillon_rose', this.tx + 104, 8);
    for (const d of [this.bill, this.christian, this.steph]) {
      onTable(s, 'papillon_plate', d.x);
      onTable(s, 'papillon_glass_red', d.x + 64, 6);
    }
    // the two of them have a menu up; its foot is behind the table
    this.menus = [this.bill, this.steph].map((d) => img(s, d.x, PAPILLON.chin + 84, 'papillon_menu').setDepth(LAYER.table - 1));
    this.waiter = new Waiter(s, -160);
    this.script([
      [0.2, () => this.walk(this.post, 620)],
      [0.75, () => this.serveCourse(0)],
    ]);
  }

  // ---- one thing after another ------------------------------------------------------------

  /** Do these one after another, each so many seconds after the one before. */
  private script(steps: [number, () => void][]): void {
    this.phase = 'play';
    this.t = 0;
    this.cues = [];
    let at = 0;
    for (const [wait, run] of steps) {
      at += wait;
      this.cues.push({ at, run });
    }
  }

  private say(who: { mouth: Point }, text: string, secs: number, dx: number, dy: number, size = 19): void {
    this.talk.say(who, text, secs, dx, dy, size);
  }

  /** The waiter walks to `x` (facing the way he is going). */
  private walk(x: number, ms: number, then?: () => void): void {
    const w = this.waiter;
    w.turn(x >= w.x ? 1 : -1);
    this.scene.tweens.add({ targets: w.im, x, duration: ms, ease: 'Sine.inOut', onComplete: () => { w.turn(1); then?.(); } });
    // (his feet)
    for (let i = 0; i < ms / 170; i++) this.scene.time.delayedCall(i * 170, step);
  }

  // ---- a course ---------------------------------------------------------------------------

  private name(dish: number): string {
    return MENU[this.course].dishes[dish][1];
  }

  private serveCourse(i: number): void {
    const s = this.scene, tw = s.tweens, m = MENU[i];
    this.course = i;
    // what she wants tonight: two of the four, in order (and for the main course, three)
    this.want = Phaser.Utils.Array.Shuffle([0, 1, 2, 3]).slice(0, i === 1 ? 3 : 2);
    this.script([
      [0.25, () => {
        this.beat = 'ask';
        this.talk.hush();
        this.bill.set('smile');
        this.steph.set('calm');
        this.christian.set('calm');
        for (const menu of this.menus) {
          menu.setVisible(true);
          tw.add({ targets: menu, y: PAPILLON.chin + 84, duration: 200, ease: 'Back.out' });
        }
        this.say(this.waiter, m.ask, 1.3, 96, -78);
        sound.tick();
      }],
      [1.1, () => this.think(i)],
      [THINKS[i], () => this.unthink()],
      [0.4, () => {
        // she has made her mind up
        this.beat = 'order';
        this.lower(1);
        this.steph.set('talking');
        this.say(this.steph, `THE ${this.name(this.want[0])}, PLEASE.`, 1.4, -70, -122);
        sound.tock();
      }],
      [1.5, () => {
        this.steph.set('smile');
        this.bill.set('worried');
        this.say(this.waiter, 'AND FOR YOU, SIR?', 1.6, 100, -78);
        this.offer();
      }],
    ]);
  }

  /** Somebody puts their menu down (0 is Bill's, 1 Stephanie's): behind the table it goes. */
  private lower(which: number): void {
    const menu = this.menus[which];
    this.scene.tweens.add({ targets: menu, y: PAPILLON.chin + 250, duration: 220, ease: 'Quad.in', onComplete: () => menu.setVisible(false) });
  }

  /** What she is thinking: the dishes she wants, best first, in a cloud over her head.
   *  Over dessert she starts with them the wrong way round, and changes her mind.
   *  (`again` is the thought shown once more, afterwards, with the one Bill should have had.) */
  private think(i: number, again = false): void {
    const s = this.scene, tw = s.tweens, W = view.W, n = this.want.length;
    this.unthink(true);
    this.beat = again ? 'again' : 'think';
    const key = n === 3 ? 'papillon_thought_wide' : 'papillon_thought', wide = ART[key].w;
    const at = { x: Phaser.Math.Clamp(this.steph.x - 34, wide / 2 + 8, W - wide / 2 - 8), y: 116 };
    const slot = (k: number) => (k - (n - 1) / 2) * 104;
    const swap = i === 2 && !again;
    const order = swap ? [this.want[1], this.want[0]] : this.want;
    const dishes = order.map((d, k) => img(s, slot(k), 12, `papillon_dish_${MENU[i].dishes[d][0]}`));
    const ranks = this.want.map((_, k) => img(s, slot(k) - 34, -40, `papillon_rank${k + 1}`));
    this.bubble = s.add.container(at.x, at.y, [img(s, 0, 0, key), ...dishes, ...ranks]).setDepth(80).setScale(0.2);
    tw.add({ targets: this.bubble, scale: 1, duration: 200, ease: 'Back.out' });
    // (the little ones that lead up to it from her head)
    const top = this.steph.top;
    this.puffs = [0.55, 0.85].map((k, j) => {
      const puff = img(s, top.x + 26 - j * 8, top.y + 10 - j * 15, 'papillon_puff').setDepth(79);
      return puff.setScale(puff.scale * k);
    });
    sound.tone({ type: 'sine', f0: 620, f1: 930, dur: 0.16, vol: 0.5 });
    if (swap) {
      // ...no. The other one.
      s.time.delayedCall(THINKS[i] * 430, () => {
        if (!this.bubble) return;
        sound.whoosh();
        dishes.forEach((d, k) => {
          tw.add({ targets: d, x: slot(1 - k), duration: 300, ease: 'Sine.inOut' });
          tw.add({ targets: d, y: 12 + (k ? 16 : -16), duration: 150, yoyo: true, ease: 'Sine.out' });
        });
      });
    }
    if (again) {
      // the one he was meant to order
      const right = dishes[1], full = right.scale;
      tw.add({ targets: [right, ranks[1]], scale: full * 1.25, duration: 220, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
  }

  private unthink(now = false): void {
    const gone = this.bubble, tw = this.scene.tweens;
    for (const p of this.puffs) p.destroy();
    this.puffs = [];
    this.bubble = undefined;
    if (!gone) return;
    tw.killTweensOf(gone.list);
    if (now) gone.destroy();
    else tw.add({ targets: gone, scale: 0.1, alpha: 0, duration: 150, onComplete: () => gone.destroy() });
  }

  // ---- Bill's turn ------------------------------------------------------------------------

  /** The four dishes of the course, as cards off the menu, to pick from. */
  private offer(): void {
    const s = this.scene, W = view.W;
    this.beat = 'pick';
    this.phase = 'pick';
    this.botIn = this.host.auto === 'clumsy' ? 1.1 : 0.8;
    this.nag = 5;
    this.cardWide = Math.min(330, (W - 44) / 2);
    const wide = this.cardWide, cx = W / 2;
    this.cards = Phaser.Utils.Array.Shuffle([0, 1, 2, 3]).map((dish, k) => {
      const x = cx + (k % 2 ? 1 : -1) * (wide / 2 + 6), y = k < 2 ? 456 : 510;
      const plate = img(s, x, y, 'papillon_card').setDepth(90);
      plate.setScale((plate.scaleX * wide) / ART.papillon_card.w, plate.scaleY);
      const icon = img(s, x - wide / 2 + 34, y, `papillon_dish_${MENU[this.course].dishes[dish][0]}`).setDepth(91);
      icon.setScale(icon.scale * 0.5);
      let size = 20;
      const text = written(s, x + 22, y, this.name(dish), size).setDepth(91);
      while (text.width > wide - 80 && size > 12) text.setFontSize(--size);
      const parts = [plate, icon, text];
      for (const o of parts) {
        const to = o.y;
        o.setY(to + 130);
        s.tweens.add({ targets: o, y: to, duration: 200, delay: 60 * k, ease: 'Back.out' });
      }
      return { x, y, dish, parts };
    });
  }

  press(at: Point): void {
    if (this.phase !== 'pick') return;
    const i = this.cards.findIndex((c) => Math.abs(at.x - c.x) < this.cardWide / 2 + 4 && Math.abs(at.y - c.y) < 27);
    if (i >= 0) this.choose(i);
  }

  private choose(i: number): void {
    if (this.phase !== 'pick') return;
    const s = this.scene, tw = s.tweens, card = this.cards[i], dish = card.dish;
    this.phase = 'play';
    this.ordered.push(MENU[this.course].dishes[dish][0]);
    sound.tock();
    tw.add({ targets: card.parts[0], scaleY: (card.parts[0] as Image).scaleY * 0.84, duration: 60, yoyo: true });
    for (const c of this.cards) tw.add({ targets: c.parts, y: 640, duration: 220, delay: c === card ? 260 : 120 });
    this.talk.hush();
    this.lower(0);
    this.bill.set('talking');
    this.say(this.bill, `THE ${this.name(dish)}.`, 1.2, 56, -122);
    if (dish === this.want[1]) this.right();
    else this.wrong(dish === this.want[0]);
  }

  /** What she wanted second. Imagine that. */
  private right(): void {
    const s = this.scene, last = this.course === MENU.length - 1;
    this.script([
      [0.95, () => {
        this.beat = 'right';
        this.bill.set('smug');
        this.steph.set('laugh');
        this.say(this.steph, 'OOH! I WAS GOING TO GET THAT!', 1.7, -40, -122);
        for (let i = 0; i < 6; i++) s.time.delayedCall(i * 120, () => this.puff('heart', this.tx + 105 + (Math.random() - 0.5) * 150, 300, (Math.random() - 0.5) * 40, -90 - Math.random() * 50, 1.3, -30));
      }],
      [0.55, () => {
        this.beat = 'coincidence';
        // (on the cloth, where it is over nobody's face; and a second longer than a word usually gets)
        this.linger('papillon_coincidence', this.tx, CLOTH, COINCIDENCE);
        sound.cash();
      }],
      [COINCIDENCE + 0.95, () => {
        this.talk.hush();
        if (this.course === 0) this.amuse();
        else if (last) this.finale();
        else this.serveCourse(this.course + 1);
      }],
    ]);
  }

  /** What she is having herself; or something she never thought of at all. */
  private wrong(same: boolean): void {
    this.script([
      [0.95, () => {
        this.beat = same ? 'same' : 'wrong';
        this.steph.set(same ? 'hold' : 'angry');
        this.bill.set('guilty');
        this.christian.set('worried');
        this.say(this.steph, same ? "THAT'S WHAT I'M HAVING." : '...REALLY, BILL?', 2.1, -84, -122, 21);
        sound.wahwah(0.9);
        this.scene.cameras.main.shake(140, 0.006);
      }],
      // what he was meant to say
      [0.9, () => this.think(this.course, true)],
      [1.9, () => {
        this.phase = 'done';
        this.host.finish(false);
      }],
    ]);
  }

  // ---- compliments of the chef ------------------------------------------------------------

  /** Something nobody ordered, under a silver dome; and what Christian said about it. */
  private amuse(): void {
    const s = this.scene, tw = s.tweens, w = this.waiter;
    this.script([
      [0.2, () => {
        this.beat = 'away';
        this.bill.set('smile');
        this.steph.set('smile');
        this.walk(-170, 520);
      }],
      [0.75, () => {
        // back he comes, with a tray
        this.beat = 'tray';
        w.serve(true);
        const tray = img(s, 0, 0, 'papillon_tray').setDepth(LAYER.held);
        const plate = img(s, 0, 0, 'papillon_amuse').setDepth(LAYER.held + 1).setVisible(false);
        const dome = img(s, 0, 0, 'papillon_cloche').setDepth(LAYER.held + 2);
        this.carried = [tray, plate, dome];
        this.walk(this.post, 760);
      }],
      [1.0, () => {
        // off comes the dome
        this.beat = 'reveal';
        const [, plate, dome] = this.carried;
        plate.setVisible(true);
        this.carried = this.carried.slice(0, 2);
        tw.add({ targets: dome, y: dome.y - 70, alpha: 0, rotation: -0.3, duration: 340, ease: 'Quad.out', onComplete: () => dome.destroy() });
        sound.twinkle();
        for (const [dx, dy, k] of [[-30, -22, 1], [28, -30, 0.7], [4, -44, 0.85]]) {
          const star = img(s, plate.x + dx, plate.y + dy, 'sparkle').setDepth(LAYER.held + 3);
          const full = star.scale * k;
          star.setScale(0);
          tw.add({ targets: star, scale: full, rotation: 0.8, duration: 260, yoyo: true, repeat: 1, onComplete: () => star.destroy() });
        }
      }],
      [0.6, () => {
        this.beat = 'compliments';
        this.say(w, 'AMUSE-BOUCHE. COMPLIMENTS OF THE CHEF.', 2.2, 150, -82);
        // ...and across the table it goes, to Christian
        const [tray, plate] = this.carried;
        this.carried = [tray];
        const to = { x: this.christian.x, y: PAPILLON.table + 20 };
        tw.add({ targets: plate, x: to.x, duration: 520, delay: 500, ease: 'Sine.inOut' });
        tw.add({ targets: plate, y: to.y - 70, duration: 260, delay: 500, ease: 'Quad.out' });
        tw.add({ targets: plate, y: to.y, duration: 260, delay: 760, ease: 'Quad.in', onComplete: () => { plate.setDepth(LAYER.onTable + 1); sound.tick(); } });
      }],
      [2.3, () => {
        // what he said (the family's own words)
        this.beat = 'bouche';
        this.talk.hush();
        w.serve(false);
        for (const o of this.carried) o.destroy();
        this.carried = [];
        this.christian.set('smug');
        tw.add({ targets: this.christian.box, rotation: 0.07, duration: 240, ease: 'Sine.out' });
        this.say(this.christian, 'TELL THE CHEF TO CONSIDER MY BOUCHE AMUSED!', 2.9, 0, -132, 21);
      }],
      [1.7, () => {
        this.beat = 'rimshot';
        rimshot();
        this.host.word('papillon_badumtss', this.tx + 170, CLOTH);
        this.bill.set('sideeye');
        this.steph.set('laugh');
      }],
      [1.6, () => {
        this.talk.hush();
        tw.add({ targets: this.christian.box, rotation: 0, duration: 200 });
        this.christian.set('smile');
        this.serveCourse(1);
      }],
    ]);
  }

  // ---- and that is dinner -------------------------------------------------------------------

  private finale(): void {
    const s = this.scene;
    this.script([
      [0.2, () => {
        this.beat = 'finale';
        this.bill.set('laugh');
        this.steph.set('laugh');
        this.christian.set('laugh');
        this.say(this.waiter, 'EXCELLENT CHOICES.', 1.8, 104, -78);
        this.host.word('papillon_bonappetit', this.tx, CLOTH, true);
        sound.win();
        // butterflies, off the wallpaper
        for (let i = 0; i < 9; i++) {
          s.time.delayedCall(i * 90, () => this.puff('papillon_butterfly', this.tx + (Math.random() - 0.5) * 560, 330 + Math.random() * 40, (Math.random() - 0.5) * 70, -100 - Math.random() * 70, 1.7, -10, 5 + Math.random() * 4));
        }
      }],
      [1.9, () => {
        this.phase = 'done';
        this.host.finish(true);
      }],
    ]);
  }

  // ---- odds and ends --------------------------------------------------------------------------

  /** A word on a burst, as the scene pops one (`this.host.word`), but staying up for as long as it is told to. */
  private linger(word: string, x: number, y: number, secs: number): void {
    const s = this.scene, im = img(s, x, y, `word_${word}`).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.3);
    const full = im.scale;
    im.setScale(full * 0.3).setAlpha(0);
    s.tweens.add({ targets: im, scale: full, alpha: 1, duration: 110, ease: 'Back.out' });
    s.tweens.add({ targets: im, y: y - 36, alpha: 0, duration: 320, delay: secs * 1000, onComplete: () => im.destroy() });
  }

  /** Something small in the air: it flies, falls (or floats up) and is gone. One that sways flutters as it goes. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, sway = 0): void {
    const im = img(this.scene, x, y, key).setDepth(60);
    this.bits.push({ im, vx, vy, life, drop, sway });
  }

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    while (this.phase === 'play' && this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    this.talk.update(dt);
    // whatever the waiter has in his hand
    const hand = this.waiter.hand;
    this.carried.forEach((o, k) => o.setPosition(hand.x, hand.y - (k ? 6 : 0)));
    // he is waiting
    if (this.phase === 'pick') {
      this.nag -= dt;
      if (this.nag <= 0) {
        this.nag = 5;
        this.say(this.waiter, 'AHEM.', 0.9, 80, -78);
        ahem();
      }
    }
    for (const b of this.bits) {
      b.life -= dt;
      b.vy += b.drop * dt;
      b.im.setPosition(b.im.x + b.vx * dt, b.im.y + b.vy * dt).setAlpha(Math.min(1, b.life * 3));
      if (b.sway) b.im.setScale((Math.cos(b.life * b.sway * 3) * 0.5 + 0.6) * 0.5, 0.5).setRotation(Math.sin(b.life * b.sway) * 0.3);
      if (b.life <= 0) b.im.destroy();
    }
    this.bits = this.bits.filter((b) => b.life > 0);
  }

  timeUp(): boolean {
    return false;
  }

  bot(dt: number): void {
    if (this.phase !== 'pick') return;
    this.botIn -= dt;
    if (this.botIn > 0) return;
    const pick = BOT[this.host.auto === 'clumsy' ? 'clumsy' : 'good'][this.course];
    const dish = this.want[pick === 'first' ? 0 : 1];
    this.choose(this.cards.findIndex((c) => c.dish === dish));
  }
}

/** Ba-dum, tss: two drums and a cymbal, for a joke that has just been made. */
function rimshot(): void {
  sound.tone({ type: 'sine', f0: 210, f1: 130, dur: 0.12, vol: 0.7 });
  sound.noise({ dur: 0.06, vol: 0.5, f0: 900, f1: 400, q: 0.8 });
  sound.tone({ type: 'sine', f0: 150, f1: 90, dur: 0.14, vol: 0.75, at: 0.16 });
  sound.noise({ dur: 0.06, vol: 0.5, f0: 700, f1: 300, q: 0.8, at: 0.16 });
  sound.noise({ dur: 0.7, vol: 0.5, filter: 'highpass', f0: 5200, f1: 7000, at: 0.36 });
  sound.tone({ type: 'square', f0: 3100, dur: 0.3, vol: 0.05, at: 0.36 });
}

/** One of the waiter's footsteps, on carpet. */
function step(): void {
  sound.tone({ type: 'triangle', f0: 190, f1: 110, dur: 0.07, vol: 0.5 });
  sound.noise({ dur: 0.04, vol: 0.2, filter: 'lowpass', f0: 500, f1: 150 });
}

/** The waiter clears his throat. */
function ahem(): void {
  sound.tone({ type: 'sawtooth', f0: 170, f1: 120, dur: 0.13, vol: 0.9 });
  sound.tone({ type: 'sawtooth', f0: 130, f1: 95, dur: 0.22, vol: 0.9, at: 0.16 });
}
