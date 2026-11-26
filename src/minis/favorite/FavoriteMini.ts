import Phaser from 'phaser';
import { H, TEX, view } from '../../config';
import { ART, applyArt, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { Diner, LAYER, PAPILLON, Talk, layPapillon, onTable, setTable } from '../shared/papillon';
import { BOTTLE } from './art';

type Image = Phaser.GameObjects.Image;

/** How long the evening lasts. */
const SECONDS = 20;
/** Who sits where, left to right: the boys at the ends, their parents in the middle. */
const SEATS = ['shane', 'chad', 'bill', 'stephanie', 'christian', 'branson'];
/** How special each boy feels to begin with (in the order they sit). */
const START = [0.74, 0.6, 0.67, 0.8];
/** How fast that runs down by itself, a second: at the start of the evening, and how much more by the end of it. */
const FADES = 0.066, FADES_MORE = 0.108;
/** ...and how much goes when he hears his father tell one of the others. (It never takes the last of it.) */
const HEARD = 0.05, HEARD_LEAVES = 0.05;
/** Nothing runs down for this long after he has been told. */
const GLOW = 0.6;
/** Under this he is in trouble (and it says so over his head); under this, in tears. */
const LOW = 0.26, TEARS = 0.13;
/** How long it takes Bill to say it: he cannot say it again until he has. */
const SAYING = 0.42, SHUSHING = 0.62;
/** Told to a different boy within this long of the last one, it is the "SHHHH". */
const SOON = 1.8;
/** When he takes a drink, and how long one keeps him busy. */
const SWIGS = [4, 9, 14], SWIG = 0.95;
/** How long before the end the happy ending starts, and how long the unhappy one is looked at. */
const WIN_SHOWS = 1.45, LOSS_SHOWS = 1.7;

/** What he says. These are the family's own words for it: leave them be. */
const LINES = {
  know: "YOU KNOW... YOU'RE MY FAVORITE!",
  plain: "YOU'RE MY FAVORITE!",
  shh: "SHHHH, DON'T TELL ANYONE... REALLY YOU ARE MY FAVORITE!",
};

interface Boy {
  who: string;
  diner: Diner;
  /** How special he feels, 0 to 1. */
  level: number;
  /** Seconds left of having just been told, and the face he pulls for it. */
  glad: number;
  gladLook: string;
  /** The heart over his head (full, and the empty one under it), and the "!" beside it. */
  heart: Image;
  shell: Image;
  alarm: Image;
  low: boolean;
  /** A second head, for when Bill is seeing two of everybody. */
  ghost: Image;
}

/** What it sounds like. (How loud each comes out is in the README: measured, with tools/test/listen.cjs.) */
const NOISES = {
  /** Two notes, up: somebody has been told. */
  told(): void {
    sound.tone({ type: 'triangle', f0: 392, dur: 0.09, vol: 0.55 });
    sound.tone({ type: 'triangle', f0: 587, dur: 0.15, vol: 0.55, at: 0.09 });
  },
  shh(): void {
    sound.noise({ dur: 0.42, vol: 0.85, f0: 5200, f1: 3400, q: 0.7 });
  },
  /** Three swallows. */
  glug(): void {
    for (let i = 0; i < 3; i++) sound.tone({ type: 'sine', f0: 330 - i * 36, f1: 150, dur: 0.11, vol: 0.75, at: i * 0.14 });
  },
  hic(): void {
    sound.tone({ type: 'square', f0: 420, f1: 1040, dur: 0.07, vol: 0.42 });
    sound.tone({ type: 'sine', f0: 720, f1: 300, dur: 0.09, vol: 0.7, at: 0.1 });
  },
  /** Somebody's heart is nearly empty. */
  low(): void {
    sound.tone({ type: 'square', f0: 660, dur: 0.06, vol: 0.5 });
    sound.tone({ type: 'square', f0: 660, dur: 0.06, vol: 0.5, at: 0.09 });
  },
};

/** Keep only what is below `from` of a picture (0 is its top, 1 its bottom): the rest is cut away. */
function drain(im: Image, key: string, from: number): void {
  const a = ART[key], y = Math.round((a.pad + Phaser.Math.Clamp(from, 0, 1) * a.h) * TEX);
  im.setCrop(0, y, im.frame.width, Math.max(0, im.frame.height - y));
}

/** The anniversary dinner at Le Papillon, and one of the only times Bill has been
 *  drunk in front of the boys: a lot of Williams Selyem Pinot Noir, and then he
 *  kept telling each of the four of them, one after another, "You know... you're my
 *  favorite!", and then turning to the next one: "Shhhh, don't tell anyone...
 *  really YOU are my favorite."
 *
 *  It is spinning plates. Each boy has a heart over his head, which is how special
 *  he feels, and it runs down by itself. Tap a boy and Bill tells him: his heart
 *  fills, and the other three, who can hear perfectly well, lose a little. The
 *  bottle is the clock: as it empties the room sways more, Bill sees two of
 *  everybody, and the hearts run down faster. It is lost the moment any boy's
 *  heart is empty, and won if the bottle is finished first. */
export class FavoriteMini extends Mini {
  readonly title = 'THE FAVORITE';
  readonly prompt = 'TELL THEM ALL!';
  readonly seconds = SECONDS;

  /** How it stands, for the tests: 'play', 'won' or 'lost'. */
  phase: 'play' | 'won' | 'lost' = 'play';
  /** Seconds since it started, and how much he has had (0 to 1). */
  t = 0;
  drunk = 0;
  boys: Boy[] = [];
  /** How many times he has said it, how many drinks he has taken, and whether he is in the middle of one. */
  tells = 0;
  swigs = 0;
  swigging = false;
  /** How far the glass is to his mouth (0 on the table, 1 at his lips). */
  sip = 0;

  private talk!: Talk;
  private bill!: Diner;
  private steph!: Diner;
  private gap = 160;
  /** Who he told last, how long ago, and whether that was the "SHHHH". */
  private last = -1;
  private since = 99;
  private shushed = false;
  /** Seconds until he can say it again, and who is to be told the moment he can. */
  private busy = 0;
  private queued = -1;
  /** His hand: which one is out, which way, and for how much longer (the finger to his lips comes first, and then this). */
  private hand!: Image;
  private handKind = '';
  private handSide = 1;
  private handFor = 0;
  private shushFor = 0;
  private lean = 0;
  private leanTo = 0;
  /** Seconds left of the hiccup's grin, and of Stephanie laughing at him. */
  private hicFor = 0;
  private amused = 0;
  private glass!: Image;
  private glassAt: Point = { x: 0, y: 0 };
  private toast = 0;
  private bottle!: Image;
  private endIn = 0;
  /** What to do, on a strip of tape on the cloth, until it has been done once. */
  private hint: (Image | Phaser.GameObjects.Text)[] = [];
  private finished = false;
  private botIn = 0.6;

  /** What is being said (the tests read this). */
  get said(): Talk['said'] {
    return this.talk.said;
  }

  /** How low the lowest of them is (for the tests). */
  get lowest(): number {
    return Math.min(...this.boys.map((b) => b.level));
  }

  build(): void {
    const s = this.scene, W = view.W, cx = W / 2, P = PAPILLON;
    this.talk = new Talk(s);
    layPapillon(s);
    setTable(s, cx, true);

    // six in a row, as close as the page needs them
    this.gap = Math.min(190, (W - 150) / 5);
    const size = Phaser.Math.Clamp(this.gap / 175, 0.84, 1), tall = Math.round(Phaser.Math.Linear(82, 92, Phaser.Math.Clamp((this.gap - 146) / 44, 0, 1)));
    SEATS.forEach((who, i) => {
      const x = cx + (i - 2.5) * this.gap;
      const diner = new Diner(s, who, x, 'smile', { size, head: tall });
      onTable(s, 'papillon_plate', x);
      if (who === 'bill') {
        this.bill = diner;
        diner.box.setDepth(LAYER.diner + 1);
        return;
      }
      if (who === 'stephanie') {
        this.steph = diner;
        onTable(s, 'papillon_glass_red', x + 40, 6);
        return;
      }
      onTable(s, 'papillon_glass', x + (i < 2 ? 44 : -44), 6);
      const hy = P.chin - tall - 32, n = this.boys.length;
      const shell = img(s, x, hy, 'favorite_heart_empty').setDepth(40);
      const heart = img(s, x, hy, 'favorite_heart').setDepth(41);
      const alarm = img(s, x + 30, hy - 16, 'alert').setDepth(42).setVisible(false);
      const ghost = s.add.image(x, P.chin, diner.head.texture.key).setDepth(LAYER.diner + 0.5).setAlpha(0);
      this.boys.push({ who, diner, level: START[n], glad: 0, gladLook: 'smug', heart, shell, alarm, low: false, ghost });
    });

    // the bottle, between the two of them, and his glass
    const bx = this.bill.x + this.gap * 0.56;
    onTable(s, 'favorite_bottle_empty', bx, 10);
    this.bottle = onTable(s, 'favorite_bottle', bx, 10);
    this.bottle.setDepth(this.bottle.depth + 0.001);
    // (the candle and the rose at the ends, out of the way of his hands)
    onTable(s, 'papillon_candle', cx - this.gap * 2, 10);
    onTable(s, 'papillon_rose', cx + this.gap * 2 + 4, 10);
    this.glassAt = { x: this.bill.x - 50, y: P.table + 14 };
    this.glass = img(s, this.glassAt.x, this.glassAt.y, 'papillon_glass_red').setDepth(LAYER.held);
    this.hand = img(s, 0, 0, 'favorite_point').setDepth(LAYER.diner + 2.5).setVisible(false);
    const words = written(s, cx, 492, "TAP A BOY TO TELL HIM HE'S THE FAVORITE", 19).setDepth(LAYER.held + 1).setRotation(-0.012);
    const tape = img(s, cx, 492, 'tape_l').setDepth(LAYER.held).setRotation(-0.012);
    tape.setScale((tape.scale * (words.width + 44)) / ART.tape_l.w, tape.scale);
    this.hint = [tape, words];
    this.pose(0);
  }

  // ---- telling them ---------------------------------------------------------------------------

  press(at: Point): void {
    if (this.phase !== 'play' || at.y < 120) return;
    // whichever boy is nearest: where he really is, however many of him there seem to be
    let best = -1, far = this.gap * 0.55;
    this.boys.forEach((b, i) => {
      const d = Math.abs(at.x - b.diner.x);
      if (d < far) { far = d; best = i; }
    });
    if (best >= 0) this.tap(best);
  }

  /** Tell this one (as soon as he has finished telling the last one). */
  private tap(i: number): void {
    if (this.phase !== 'play') return;
    if (this.busy > 0) this.queued = i;
    else this.tell(i);
  }

  private tell(i: number): void {
    const s = this.scene, tw = s.tweens, b = this.boys[i], side = b.diner.x < this.bill.x ? -1 : 1;
    // which of the three things he says
    const shh = this.tells > 0 && i !== this.last && this.since < SOON && !this.shushed;
    const line = this.tells === 0 ? LINES.know : shh ? LINES.shh : LINES.plain;
    if (this.tells === 0) tw.add({ targets: this.hint, alpha: 0, y: 520, duration: 260, delay: 500 });
    this.tells++;
    this.last = i;
    this.since = 0;
    this.shushed = shh;
    this.busy = shh ? SHUSHING : SAYING;

    // he fills right up; the others heard that
    b.level = 1;
    b.glad = 1.25;
    b.gladLook = this.tells % 2 ? 'smug' : 'laugh';
    this.boys.forEach((o, n) => {
      if (n === i) return;
      o.level = Math.max(Math.min(o.level, HEARD_LEAVES), o.level - HEARD);
      tw.add({ targets: [o.heart, o.shell], x: o.diner.x + 3, duration: 45, yoyo: true, repeat: 2, onComplete: () => { o.heart.x = o.shell.x = o.diner.x; } });
    });
    tw.add({ targets: [b.heart, b.shell], scale: { from: 1 / TEX, to: 1.35 / TEX }, duration: 90, yoyo: true, ease: 'Quad.out', onComplete: () => { b.heart.setScale(1 / TEX); b.shell.setScale(1 / TEX); } });
    tw.add({ targets: b.diner.box, y: b.diner.box.y - 7, duration: 80, yoyo: true, ease: 'Quad.out' });
    const badge = img(s, b.diner.x + (Math.random() - 0.5) * 20, b.heart.y - 8, 'favorite_no1').setDepth(43);
    tw.add({ targets: badge, y: badge.y - 46, alpha: 0, duration: 700, ease: 'Quad.out', onComplete: () => badge.destroy() });

    // Bill, saying it: over he leans, and out comes the hand
    // (not so far to his right: the bottle is there)
    const far = Math.abs(b.diner.x - this.bill.x) > this.gap * 1.6;
    this.leanTo = side < 0 ? (far ? -0.2 : -0.14) : far ? 0.1 : 0.07;
    this.handSide = side;
    this.shushFor = shh ? 0.5 : 0;
    this.handKind = shh ? 'favorite_cup' : 'favorite_point';
    this.handFor = shh ? 1.5 : 1.0;
    this.talk.hush();
    this.talk.say(this.bill, line, shh ? 1.7 : 1.2, side * 104, 114 - this.bill.mouth.y, shh ? 19 : 22);
    if (shh) {
      this.amused = 0.9;
      NOISES.shh();
    } else {
      NOISES.told();
    }
  }

  // ---- the wine -------------------------------------------------------------------------------

  /** A drink: the glass to his mouth, down it goes, and what comes back up. */
  private swig(): void {
    const s = this.scene, tw = s.tweens;
    this.swigs++;
    this.swigging = true;
    this.busy = Math.max(this.busy, SWIG);
    this.leanTo = 0;
    this.handFor = 0;
    // (nobody talks with a glass in his mouth)
    this.talk.hush();
    tw.add({
      targets: this, sip: 1, duration: 220, ease: 'Quad.out',
      onComplete: () => NOISES.glug(),
    });
    s.time.delayedCall(660, () => tw.add({
      targets: this, sip: 0, duration: 220, ease: 'Quad.in',
      onComplete: () => {
        this.swigging = false;
        applyArt(this.glass, 'papillon_glass');
        if (this.phase !== 'play') return;
        this.hicFor = 0.7;
        this.amused = 0.8;
        const top = this.bill.top;
        this.host.word('favorite_hic', top.x + 56, top.y + 6);
        NOISES.hic();
        s.cameras.main.shake(120, 0.004);
      },
    }));
    // ...and somebody has filled it again
    s.time.delayedCall(1500, () => applyArt(this.glass, 'papillon_glass_red'));
  }

  // ---- how it ends ----------------------------------------------------------------------------

  /** The bottle is finished, and every one of them is the favorite. */
  private win(): void {
    const s = this.scene, tw = s.tweens;
    this.phase = 'won';
    this.endIn = WIN_SHOWS - 0.12;
    this.talk.hush();
    this.handFor = 0;
    this.leanTo = 0;
    this.toast = 0;
    tw.add({ targets: this, toast: 1, duration: 260, ease: 'Back.out' });
    applyArt(this.glass, 'papillon_glass_red');
    this.boys.forEach((b, i) => {
      b.level = 1;
      b.alarm.setVisible(false);
      b.diner.set(i % 2 ? 'laugh' : 'smile');
      tw.add({ targets: b.diner.box, y: b.diner.box.y - 9, duration: 110, yoyo: true, delay: i * 70, ease: 'Quad.out' });
      for (let n = 0; n < 2; n++) {
        const up = img(s, b.diner.x + (n ? 16 : -14), b.heart.y, 'heart').setDepth(43).setAlpha(0);
        tw.add({ targets: up, y: up.y - 60 - n * 16, alpha: { from: 1, to: 0 }, duration: 900, delay: 120 + i * 70 + n * 160, onComplete: () => up.destroy() });
      }
    });
    this.host.word('favorite_anniversary', view.W / 2, 122, true);
    sound.aww();
  }

  /** One of them has worked it out. */
  private lose(i: number): void {
    const s = this.scene, tw = s.tweens, b = this.boys[i];
    this.phase = 'lost';
    this.endIn = LOSS_SHOWS;
    this.talk.hush();
    this.handFor = 0;
    this.leanTo = 0;
    this.queued = -1;
    b.level = 0;
    b.heart.setVisible(false);
    b.alarm.setVisible(false);
    b.diner.set('yell');
    const m = b.diner.mouth;
    this.talk.say(b.diner, 'I KNEW IT!', LOSS_SHOWS + 1, b.diner.x < view.W / 2 ? 34 : -34, 150 - m.y, 24);
    tw.add({ targets: b.diner.box, y: b.diner.box.y - 12, duration: 70, yoyo: true, repeat: 1 });
    // ...and so have the other three
    this.boys.forEach((o) => {
      o.alarm.setVisible(false);
      if (o === b) return;
      o.diner.set('angry');
      o.diner.lean(o.diner.x < this.bill.x ? 0.07 : -0.07);
    });
    s.cameras.main.shake(200, 0.008);
    sound.yelp();
  }

  // ---- every frame ----------------------------------------------------------------------------

  update(dt: number): void {
    this.t += dt;
    this.talk.update(dt);
    if (this.phase !== 'play') {
      this.endIn -= dt;
      if (this.endIn <= 0 && !this.finished) {
        this.finished = true;
        this.host.finish(this.phase === 'won');
      }
      this.pose(dt);
      return;
    }
    this.drunk = Phaser.Math.Clamp(this.t / SECONDS, 0, 1);
    this.since += dt;
    this.busy = Math.max(0, this.busy - dt);

    // everybody's heart runs down, and faster as the bottle does
    const fades = FADES + FADES_MORE * this.drunk;
    for (let i = 0; i < this.boys.length; i++) {
      const b = this.boys[i];
      const glowing = b.glad > 1.25 - GLOW;
      b.glad = Math.max(0, b.glad - dt);
      if (!glowing) b.level -= fades * dt;
      if (b.level <= 0) return this.lose(i);
      const low = b.level < LOW;
      if (low && !b.low) NOISES.low();
      b.low = low;
    }
    if (this.t >= SECONDS - WIN_SHOWS) return this.win();

    if (this.swigs < SWIGS.length && this.t >= SWIGS[this.swigs] && this.busy <= 0) this.swig();
    if (this.busy <= 0 && this.queued >= 0) {
      const i = this.queued;
      this.queued = -1;
      this.tell(i);
    }
    this.pose(dt);
  }

  /** Put everything where it is, and everybody's face on. */
  private pose(dt: number): void {
    const s = this.scene, k = this.drunk, t = this.t, play = this.phase === 'play';
    const bill = this.bill;

    // Bill: leaning to whoever he is telling, and not quite upright in between
    this.handFor = Math.max(0, this.handFor - dt);
    this.shushFor = Math.max(0, this.shushFor - dt);
    this.hicFor = Math.max(0, this.hicFor - dt);
    this.amused = Math.max(0, this.amused - dt);
    if (this.handFor <= 0 && play) this.leanTo = 0;
    this.lean += (this.leanTo - this.lean) * Math.min(1, dt * 14);
    bill.lean(this.lean + Math.sin(t * 1.7) * 0.05 * k * (play ? 1 : 0.3));
    const rest = k < 0.35 ? 'smile' : k < 0.7 ? 'smug' : 'dazed';
    bill.set(this.phase === 'lost' ? 'guilty' : this.phase === 'won' ? 'laugh'
      : this.swigging ? 'asleep'
      : this.shushFor > 0 ? 'smug'
      : this.handFor > 0.25 ? (Math.floor(t / 0.14) % 2 ? 'talking' : rest)
      : this.hicFor > 0 ? 'laugh' : rest);
    this.steph.set(this.phase === 'lost' ? 'hold' : this.phase === 'won' || this.amused > 0 ? 'laugh' : 'smile');

    // his hand: a finger to his lips first, if it is that one; then pointing, or cupped beside his mouth
    const mouth = bill.mouth, chin = bill.chin, side = this.handSide;
    const kind = this.shushFor > 0 ? 'favorite_shh' : this.handKind;
    this.hand.setVisible(this.handFor > 0 && !this.swigging);
    if (this.hand.visible) {
      if (this.hand.texture.key !== kind) applyArt(this.hand, kind);
      if (kind === 'favorite_shh') this.hand.setPosition(mouth.x + 1, mouth.y + 12).setScale(0.8 / TEX).setRotation(bill.box.rotation * 0.6);
      // (an open hand, turned edge-on to us by drawing it narrow, and tipped in over his mouth: flat on, it is a wave)
      else if (kind === 'favorite_cup') this.hand.setPosition(mouth.x - side * 35, mouth.y + 10).setScale((side * 0.46) / TEX, 0.76 / TEX).setRotation(bill.box.rotation + side * 0.14);
      else this.hand.setPosition(chin.x + side * 50, chin.y + 36 + Math.sin(t * 22) * 2).setScale(side / TEX, 1 / TEX).setRotation(side * -0.1);
    }

    // his glass: on the table, at his mouth, or (at the end) in the air
    const g = this.glassAt, lip = { x: mouth.x - 52, y: mouth.y + 36 };
    const up = this.sip, cheer = this.toast;
    this.glass.setPosition(g.x + (lip.x - g.x) * up - 16 * cheer, g.y + (lip.y - g.y) * up - 128 * cheer).setRotation(up * 1.0 - cheer * 0.2);

    // the bottle: what is left in it
    drain(this.bottle, 'favorite_bottle', Phaser.Math.Linear(BOTTLE.glass[0], BOTTLE.glass[1] + 0.01, Phaser.Math.Clamp(t / (SECONDS - WIN_SHOWS), 0, 1)));

    // the boys: their faces, their hearts, and the second one of each of them
    this.boys.forEach((b, i) => {
      if (play) {
        b.diner.set(b.glad > 0 ? b.gladLook : b.level > 0.6 ? 'smile' : b.level > 0.38 ? 'calm' : b.level > TEARS ? 'worried' : 'cry');
        b.alarm.setVisible(b.low).setScale((1 + Math.sin(t * 16) * 0.12) / TEX);
        b.heart.setRotation(b.low ? Math.sin(t * 26) * 0.12 : 0);
        b.shell.setRotation(b.heart.rotation);
      }
      b.heart.setVisible(b.level > 0.02);
      drain(b.heart, 'favorite_heart', 1 - b.level);
      const seeing = Phaser.Math.Clamp((k - 0.3) / 0.4, 0, 1), head = b.diner.head, at = b.diner.chin;
      const off = (8 + 20 * k) * Math.sin(t * 1.4 + i * 1.7);
      if (b.ghost.texture.key !== head.texture.key) b.ghost.setTexture(head.texture.key);
      b.ghost.setOrigin(head.originX, head.originY).setScale(head.scaleX * b.diner.box.scaleX, head.scaleY * b.diner.box.scaleY)
        .setRotation(b.diner.box.rotation).setPosition(at.x + off, at.y + off * 0.15).setAlpha(play ? 0.32 * seeing : 0.12 * seeing);
    });

    // and the room, which will not keep still
    const cam = s.cameras.main, a = (2 + 20 * k * k) * (play ? 1 : 0.5);
    cam.setZoom(view.RES * (1 + 0.011 * k * (1 + Math.sin(t * 0.9))));
    cam.centerOn(view.W / 2 + Math.sin(t * 1.15) * a, H / 2 + Math.sin(t * 0.83 + 1) * a * 0.35);
  }

  timeUp(): boolean {
    return this.phase !== 'lost';
  }

  bot(dt: number): void {
    if (this.phase !== 'play') return;
    this.botIn -= dt;
    if (this.botIn > 0 || this.busy > 0) return;
    if (this.host.auto === 'clumsy') {
      // slow, and as often as not it is the boy he has just told
      this.botIn = 1.9;
      this.tap(this.last >= 0 && this.tells % 2 ? this.last : Math.floor(Math.random() * this.boys.length));
      return;
    }
    // whoever needs it most, once anybody does
    let low = 0;
    this.boys.forEach((b, i) => { if (b.level < this.boys[low].level) low = i; });
    this.botIn = 0.12;
    if (this.boys[low].level < 0.72) this.tap(low);
  }
}
