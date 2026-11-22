import Phaser from 'phaser';
import { DEPTH, H, HEAD_SRC_H, MAX_W, SCORE, SWING, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { HALL } from '../art/hallway';
import { fillPaper, makePaperArt } from '../art/paper';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { Lob, Spawn } from '../data/levels';
import { PHRASES, pick } from '../data/phrases';
import { Bill, RIGS } from '../objects/Bill';
import { written } from '../ui/text';
import { PlayScene, Point, Quality } from './PlayScene';

type Image = Phaser.GameObjects.Image;

/** How long something is in the air on its way to Bill, by how it was thrown. */
const FLIGHT: Record<Lob, number> = { lob: 1.4, drive: 1.0, bounce: 1.5 };
/** How far a throw climbs above a straight line, in pixels at Bill's distance. */
const ARC: Record<Lob, number> = { lob: 210, drive: 60, bounce: 0 };
/** How far through its flight a bouncing one hits the floor. */
const BOUNCE_AT = 0.56;
/** How close to the moment it arrives a swing has to be, in seconds either side. */
const GOOD = 0.15;
const PERFECT = 0.055;
/** Distance to the lockers, counted in Bill-distances from the camera. */
const ZF = 1 / HALL.far;
/** How far below the vanishing point the floor is, for something beside Bill. */
const DROP = (HALL.floorY - HALL.vanishY) * ZF;
const HIT_WORDS = ['splat', 'smack', 'thwack', 'pow', 'bop'];
const MAX_SPLATS = 36;

/** Something in the air: on its way to Bill, smacked back toward the lockers,
 *  or missed and sailing past the camera. */
interface Flyer {
  kind: 'jar' | 'shake' | 'book';
  lob: Lob;
  im: Image;
  shadow: Image;
  /** A ring that closes in on the strike zone as it arrives. */
  ring?: Image;
  state: 'in' | 'back' | 'past';
  /** Seconds since it left the locker, and when it reaches Bill. */
  t: number;
  T: number;
  /** Its path: sideways from the middle of the page and up from the floor,
   *  both measured in pixels at Bill's distance. */
  x0: number;
  x1: number;
  h0: number;
  h1: number;
  arc: number;
  spin: number;
  bounced: boolean;
  /** The trip back, once it has been hit. */
  back?: { t: number; dur: number; from: Point; to: Point; s0: number; inLocker: boolean };
}

/** The bonus level: a school hallway, seen over Bill's shoulder. Jars and
 *  milkshakes come flying out of the bully's locker straight at the camera,
 *  and Bill sends them back with the bully's own tennis racquet. */
export class LockerScene extends PlayScene {
  private pending: Spawn[] = [];
  private flyers: Flyer[] = [];
  private splats: Image[] = [];
  private zone!: Image;
  /** The hallway photo; or, without it, the paper floor and open locker. */
  private photo?: Image;
  private floor?: Image;
  private open?: Image;
  private label!: Phaser.GameObjects.Container;
  private blobFx!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('locker');
    this.billFrac = 0.3;
  }

  create(): void {
    this.begin();
    this.pending = [...this.level.spawns];
    this.flyers = [];
    this.splats = [];
    this.buildHall();
    this.bill = new Bill(this, view.W * this.billFrac, RIGS.locker);
    this.zone = img(this, 0, 0, 'zone').setDepth(DEPTH.billCar + 1).setAlpha(0.55);
    this.blobFx = this.add.particles(0, 0, 'blob', {
      speed: { min: 120, max: 380 }, angle: { min: 215, max: 345 }, gravityY: 700, lifespan: 520,
      scale: { start: 0.5, end: 0.12 }, emitting: false,
    }).setDepth(DEPTH.fx + 2);
    this.layout();
    this.ready();
    // he grins back at us while the banner is up, then turns to face the locker
    this.bill.setFace('grin', 2.5);
  }

  // ---- the hallway -----------------------------------------------------------------

  private buildHall(): void {
    this.photo = this.floor = this.open = undefined;
    if (this.textures.exists('hallway')) {
      // one photo is the whole hallway: lockers, the open one, and the floor
      this.photo = this.add.image(0, HALL.photoY, 'hallway').setOrigin(0.5, 0)
        .setScale(1 / (ART.hallway.tex ?? TEX)).setDepth(DEPTH.sky);
    } else {
      const x0 = -BLEED, ww = MAX_W + BLEED * 2;
      const band = (key: string, y: number, depth: number) => this.add
        .tileSprite(x0, y, ww * TEX, ART[key].h * TEX, key).setOrigin(0, 0).setScale(1 / TEX).setDepth(depth);
      band('hall_wall', -BLEED, DEPTH.sky);
      band('lockers', HALL.top, DEPTH.far);
      this.floor = img(this, 0, HALL.floorY, 'hall_floor').setDepth(DEPTH.road);
      this.open = img(this, 0, HALL.floorY, 'locker_open').setDepth(DEPTH.far + 1);
    }
    const t = written(this, 0, 0, "THE BULLY'S LOCKER", 12);
    const tape = img(this, 0, 0, 'tape_s');
    tape.setScale(tape.scale * ((t.width + 10) / ART.tape_s.w), tape.scale * 0.8);
    this.label = this.add.container(0, 0, [tape, t]).setDepth(DEPTH.far + 4).setRotation(-0.04);
  }

  /** The middle of the bully's open locker, where everything comes out. */
  private get mouth(): Point {
    return { x: view.W / 2 + HALL.mouthDX, y: HALL.mouthY };
  }

  /** The middle of the racquet when it connects. */
  private get strike(): Point {
    return this.bill.handAt;
  }

  /** The middle of Bill's head when he is standing up: where a book is aimed. */
  private get headSpot(): Point {
    return { x: this.bill.headX0, y: RIGS.locker.at[1] - RIGS.locker.headH * 0.42 };
  }

  private layout(): void {
    const m = this.mouth;
    this.photo?.setX(view.W / 2);
    this.floor?.setX(view.W / 2);
    this.open?.setX(m.x);
    this.label.setPosition(m.x + 8, HALL.top + 20);
    this.zone.setPosition(this.strike.x, this.strike.y);
  }

  protected onResize(): void {
    super.onResize();
    this.layout();
  }

  // ---- things in the air -----------------------------------------------------------

  /** Send the next thing out of the locker. `age` is how long ago it left. */
  private launch(s: Spawn, T: number, age: number): void {
    const kind = s.type as Flyer['kind'];
    const book = kind === 'book';
    const m = this.mouth, cx = view.W / 2;
    const target = book ? this.headSpot : this.strike;
    const f: Flyer = {
      kind,
      lob: s.lob,
      im: img(this, m.x, m.y, kind).setDepth(book ? DEPTH.billCar + 3 : DEPTH.necks),
      shadow: img(this, m.x, HALL.floorY, 'shadow').setDepth(DEPTH.road + 1),
      state: 'in',
      t: age,
      T,
      x0: (m.x - cx) / HALL.far,
      x1: target.x - cx,
      h0: (HALL.floorY - m.y) / HALL.far,
      h1: HALL.vanishY + DROP - target.y,
      arc: ARC[s.lob] * (book ? 0.6 : 1),
      spin: (Math.random() < 0.5 ? -1 : 1) * (book ? 6.5 : 2.5 + Math.random() * 3),
      bounced: false,
    };
    f.im.setRotation(Math.random() * 6);
    f.ring = img(this, target.x, target.y, 'zone').setDepth(DEPTH.billCar + 2).setAlpha(0);
    if (book) f.ring.setTint(0xff5a4a);
    this.flyers.push(f);
    this.place(f);
    // the locker door rattles as something comes out
    if (this.open) this.tweens.add({ targets: this.open, scaleX: this.open.scaleX * 1.06, duration: 60, yoyo: true });
    if (book) this.teach('duck', 'His history book! HOLD DUCK!');
    else if (s.lob === 'bounce') this.teach('bounce', 'Watch the bounce!');
    else this.teach('swing', 'TAP to swing when it reaches the ring!');
  }

  /** How high above the floor it is, `u` of the way to Bill (and beyond, if it got past). */
  private height(f: Flyer, u: number): number {
    if (f.lob === 'bounce') {
      if (u < BOUNCE_AT) return f.h0 * (1 - (u / BOUNCE_AT) ** 2);
      const v = (u - BOUNCE_AT) / (1 - BOUNCE_AT);
      return f.h1 * (2 * v - v * v);
    }
    return f.h0 + (f.h1 - f.h0) * u + f.arc * 4 * u * (1 - u);
  }

  /** Put something on the page where its flight has taken it: things get
   *  bigger, lower and faster across the page as they near the camera. */
  private place(f: Flyer): void {
    const u = f.t / f.T;
    const s = 1 / Math.max(0.3, ZF + (1 - ZF) * u);
    const floorY = HALL.vanishY + DROP * s;
    const x = view.W / 2 + (f.x0 + (f.x1 - f.x0) * u) * s;
    f.im.setPosition(x, floorY - this.height(f, u) * s).setScale(s / TEX);
    // a book is always in plain view; the rest pass in front of Bill as they arrive
    if (f.kind !== 'book') f.im.setDepth(u < 0.9 ? DEPTH.necks : DEPTH.fx - 1);
    f.shadow.setPosition(x, floorY).setScale(s / TEX);
    if (f.ring) {
      // a ring that tightens onto the spot it is headed for, and is exactly
      // the size of the strike zone at the moment to swing
      const k = Phaser.Math.Clamp(1 - u, 0, 1);
      f.ring.setScale((1 + k * 1.7) / TEX).setAlpha(Phaser.Math.Clamp((u - 0.3) * 1.2, 0, 0.75));
      if (u > 1.04) { f.ring.destroy(); f.ring = undefined; }
    }
  }

  private remove(f: Flyer): void {
    f.im.destroy();
    f.shadow.destroy();
    f.ring?.destroy();
    this.flyers.splice(this.flyers.indexOf(f), 1);
  }

  /** The racquet connects: it goes back where it came from. */
  private smack(f: Flyer, q: Quality): void {
    const perfect = q !== 'good';
    const gain = this.tally(q);
    const at = { x: f.im.x, y: f.im.y };
    sound.bonk(perfect);
    this.hitStop = q === 'rage' ? 0.02 : perfect ? 0.07 : 0.04;
    this.cameras.main.shake(perfect ? 150 : 90, perfect ? 0.008 : 0.005);
    this.burst(at.x, at.y, perfect);
    // some of it goes through the strings
    this.blobFx.explode(perfect ? 9 : 6, at.x, at.y);
    this.popWord(at.x + 14, at.y - 62, q === 'perfect' ? 'ace' : pick(HIT_WORDS));
    this.popTag(at.x + 50, at.y - 8, `+$${gain}`, '#2f6b2b', 0.12);
    if (q !== 'rage' && this.combo > 0 && this.combo % 8 === 0) {
      this.say(pick(PHRASES.comboLocker).text);
      this.bill.setFace('grin', 1.2);
    }

    // a clean hit goes straight back into the locker; the rest redecorate the wall
    const m = this.mouth;
    const to = perfect
      ? { x: m.x + (Math.random() - 0.5) * 24, y: m.y - 40 + Math.random() * 150 }
      : {
        x: Phaser.Math.Clamp(m.x - 320 + Math.random() * 500, 40, view.W - 40),
        y: HALL.top + 34 + Math.random() * (HALL.floorY - HALL.top - 90),
      };
    f.state = 'back';
    f.back = { t: 0, dur: perfect ? 0.3 : 0.36, from: at, to, s0: f.im.scale * TEX, inLocker: perfect };
    f.ring?.destroy();
    f.ring = undefined;
    f.shadow.setVisible(false);
    f.im.setDepth(DEPTH.fx - 1);
    this.showTally();
  }

  /** Which splat something leaves: a dark one for the jar (and the book), a
   *  milky one for the shake. There are two of each. */
  private splatKey(f: Flyer): string {
    return `splat${(f.kind === 'shake' ? 1 : 0) + (Math.random() < 0.5 ? 0 : 2)}`;
  }

  /** It lands: a splat on the lockers (or inside the open one). */
  private splat(f: Flyer): void {
    const b = f.back!;
    const im = img(this, b.to.x, b.to.y, this.splatKey(f))
      .setDepth(DEPTH.far + (b.inLocker ? 2 : 3)).setRotation((Math.random() - 0.5) * 0.5);
    const full = im.scale * (b.inLocker ? 0.3 : 0.4 + Math.random() * 0.22);
    im.setScale(full * 0.25);
    this.tweens.add({ targets: im, scale: full, duration: 130, ease: 'Back.out' });
    this.splats.push(im);
    if (this.splats.length > MAX_SPLATS) {
      const old = this.splats.shift()!;
      this.tweens.add({ targets: old, alpha: 0, duration: 400, onComplete: () => old.destroy() });
    }
    sound.splat();
    this.cameras.main.shake(70, 0.003);
  }

  /** One that got past him hits the camera instead. */
  private lensSplat(f: Flyer): void {
    // off to the racquet side, so it never hides Bill
    const x = Math.min(view.W - 230, this.strike.x + 40 + Math.random() * 140);
    const im = img(this, x, H - 70, this.splatKey(f)).setDepth(DEPTH.fx + 6).setAlpha(0.94);
    const full = im.scale * 2.6;
    im.setScale(full * 0.5).setRotation((Math.random() - 0.5) * 0.6);
    this.tweens.add({ targets: im, scale: full, duration: 110, ease: 'Back.out' });
    this.tweens.add({ targets: im, y: H + 60, alpha: 0, duration: 900, delay: 260, ease: 'Quad.in', onComplete: () => im.destroy() });
    sound.splat();
  }

  /** The book catches him on the head and tumbles away. */
  private bookHits(f: Flyer): void {
    const im = f.im;
    f.shadow.destroy();
    f.ring?.destroy();
    this.flyers.splice(this.flyers.indexOf(f), 1);
    im.setDepth(DEPTH.fx + 1);
    this.tweens.add({ targets: im, x: im.x + 150, rotation: im.rotation + 9, duration: 800 });
    this.tweens.add({ targets: im, y: im.y - 120, duration: 280, ease: 'Quad.out' });
    this.tweens.add({ targets: im, y: H + 120, duration: 520, delay: 280, ease: 'Quad.in', onComplete: () => im.destroy() });
    this.hurtBill('bonk');
  }

  private updateFlyers(dt: number): void {
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i];
      if (f.state === 'back') {
        const b = f.back!;
        b.t += dt;
        const k = Math.min(1, b.t / b.dur);
        // it shrinks the way things do as they get further away
        const s = 1 / (1 / b.s0 + (ZF - 1 / b.s0) * k);
        const w = b.s0 > HALL.far ? (s - HALL.far) / (b.s0 - HALL.far) : 0;
        f.im.setPosition(
          b.to.x + (b.from.x - b.to.x) * w,
          b.to.y + (b.from.y - b.to.y) * w - Math.sin(k * Math.PI) * 46 * s,
        ).setScale(s / TEX);
        f.im.rotation += dt * 20;
        if (k >= 1) {
          this.splat(f);
          this.remove(f);
        }
        continue;
      }

      f.t += dt;
      f.im.rotation += f.spin * dt;
      const u = f.t / f.T;
      if (f.lob === 'bounce' && !f.bounced && u >= BOUNCE_AT) {
        f.bounced = true;
        sound.tock();
      }
      this.place(f);

      if (f.state === 'in' && f.kind === 'book' && f.t >= f.T - 0.03) {
        if (this.bill.exposed && !this.over) {
          this.bookHits(f);
          continue;
        }
        f.state = 'past';
        if (!this.over && !this.bill.invulnerable) {
          this.cash += SCORE.dodge;
          this.hud.setCash(this.cash);
          sound.dodge();
          this.popWord(this.headSpot.x + 30, this.headSpot.y - 70, 'dodged');
        }
      } else if (f.state === 'in' && f.kind !== 'book' && f.t > f.T + GOOD + 0.02) {
        f.state = 'past';
        if (!this.over) {
          this.missed++;
          this.combo = 0;
          this.hud.setCombo(0, 1);
          this.hud.setJam(this.whacked, this.missed, this.total);
          this.popWord(this.strike.x + 10, this.strike.y - 56, 'missed');
        }
      }
      if (u >= 1.25) {
        if (f.kind !== 'book') this.lensSplat(f);
        this.remove(f);
      }
    }
  }

  // ---- the racquet's special -------------------------------------------------------

  protected tryRage(): void {
    if (this.over || this.rage < 100 || this.rageT >= 0 || this.bill.stun > 0) return;
    this.rage = 0;
    this.hud.setRage(0);
    this.rageT = 0;
    this.bill.invulnerable = true;
    this.bill.setFace('grin', 1.1);
    this.setSlow(0.18);
    sound.rageFire();
    this.say(pick(PHRASES.rageLocker).text);
    const banner = img(this, view.W / 2, 150, 'word_grandslam').setDepth(DEPTH.overlay).setRotation(-0.04);
    const full = banner.scale;
    banner.setScale(full * 0.3);
    this.tweens.add({ targets: banner, scale: full * 1.05, duration: 60, ease: 'Back.out' });
    this.tweens.add({ targets: banner, alpha: 0, scale: full * 1.5, duration: 90, delay: 200, onComplete: () => banner.destroy() });
    this.cameras.main.zoomTo(view.RES * 1.06, 380);
  }

  /** One enormous swing that sends back everything in the air. */
  private grandSlam(): void {
    this.setSlow(1);
    this.bill.rageCharge = 0;
    this.bill.startSwing();
    this.bill.markConnected();
    this.cameras.main.zoomTo(view.RES, 160);
    this.cameras.main.shake(380, 0.016);
    this.cameras.main.flash(160, 255, 244, 200);
    const ring = img(this, this.strike.x, this.strike.y, 'burst').setDepth(DEPTH.fx + 5).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 420, ease: 'Cubic.out', onComplete: () => ring.destroy() });

    const inAir = this.flyers.filter((f) => f.state === 'in').sort((a, b) => (a.T - a.t) - (b.T - b.t));
    inAir.forEach((f, i) => {
      this.time.delayedCall(i * 60, () => {
        if (f.state !== 'in' || !this.flyers.includes(f)) return;
        if (f.kind === 'book') {
          // books go back too, though nobody is counting those
          f.state = 'back';
          f.back = { t: 0, dur: 0.34, from: { x: f.im.x, y: f.im.y }, to: this.mouth, s0: f.im.scale * TEX, inLocker: true };
          f.ring?.destroy();
          f.ring = undefined;
          f.shadow.setVisible(false);
        } else {
          this.smack(f, 'rage');
        }
      });
    });
    this.time.delayedCall(500, () => { this.bill.invulnerable = false; });
  }

  // ---- main loop ---------------------------------------------------------------------

  update(_time: number, delta: number): void {
    const real = Math.min(delta, 50) / 1000;
    if (this.hitStop > 0) {
      this.hitStop -= real;
      return;
    }
    const dt = real * this.slow;

    if (this.rageT >= 0) {
      this.rageT += real;
      this.bill.rageCharge = Math.min(1, this.rageT / 0.4);
      if (this.rageT >= 0.46) {
        this.rageT = -1;
        this.grandSlam();
      }
    }

    if (!this.over) {
      this.levelT += dt;
      // a timeline entry is when it reaches Bill, so it leaves the locker a flight earlier
      for (let i = 0; i < this.pending.length; i++) {
        const s = this.pending[i];
        const T = FLIGHT[s.lob] * (s.type === 'book' ? 1.15 : 1);
        if (s.t - this.levelT > T) continue;
        this.launch(s, T, T - (s.t - this.levelT));
        this.pending.splice(i, 1);
        i--;
      }
      if (this.auto) this.autoplay();
      this.readInput(real);
    } else {
      this.bill.wantDuck = false;
    }

    const whiff = this.bill.update(dt);
    if (whiff && !this.over) {
      this.combo = 0;
      this.hud.setCombo(0, 1);
    }
    this.zone.setPosition(this.strike.x, this.strike.y).setRotation(this.levelT * 0.6).setVisible(this.bill.duck < 0.3);

    // anything that is arriving while the racquet comes through gets sent back
    if (this.bill.swingLive && !this.over) {
      for (const f of [...this.flyers]) {
        if (f.state !== 'in' || f.kind === 'book') continue;
        const off = Math.abs(f.t - f.T);
        if (off <= GOOD) {
          this.bill.markConnected();
          this.smack(f, off <= PERFECT ? 'perfect' : 'good');
        }
      }
    }
    this.updateFlyers(dt);

    if (!this.over && this.pending.length === 0 && this.flyers.length === 0
      && this.whacked + this.missed >= this.total && this.rageT < 0) {
      this.finish('end');
    }
  }

  /** Dev helper: add ?auto to the URL and the game plays itself (?auto=clumsy
   *  plays badly: never ducks, and swings early at most things). */
  private autoplay(): void {
    const clumsy = this.auto === 'clumsy';
    let inAir = 0;
    let duck = false;
    for (const f of this.flyers) {
      if (f.state !== 'in') continue;
      const left = f.T - f.t;
      if (f.kind === 'book') {
        if (left < 0.34 && left > -0.1) duck = true;
        continue;
      }
      inAir++;
      if (clumsy) {
        if (Math.floor(f.x0 * 3 + f.T * 100 + f.spin * 50) % 3 !== 0 && left < 0.3 && left > 0.24) this.trySwing();
      } else if (left <= SWING.windup + 0.02) {
        this.trySwing();
      }
    }
    this.duckKey = duck && !clumsy;
    if (this.rage >= 100 && inAir >= 2) this.tryRage();
  }

  // ---- how the story ended -------------------------------------------------------------

  /** After a win, the punchline: a page from the next day, before the results. */
  protected outro(won: boolean, done: () => void): void {
    const story = this.level.epilogue;
    if (!won || !story) {
      done();
      return;
    }
    const W = view.W, d = DEPTH.overlay + 1;
    const pw = 600, ph = 380, px = W / 2, py = H / 2 + 4;
    const made: Phaser.GameObjects.GameObject[] = [];
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T): T => { made.push(o); return o; };

    const veil = keep(this.add.rectangle(W / 2, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.55).setDepth(DEPTH.overlay).setAlpha(0));
    this.tweens.add({ targets: veil, alpha: 1, duration: 250 });
    // a sheet of ruled notebook paper
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

    const left = px - pw / 2 + 84, wide = pw - 84 - 150;
    const parts: Phaser.GameObjects.Text[] = [];
    let y = py - ph / 2 + 42;
    parts.push(keep(written(this, left, y, story.title, 22, '#b8372a').setOrigin(0, 0.5)));
    y += 46;
    for (const [who, said] of story.lines) {
      parts.push(keep(written(this, left, y, `${who}:`, 15, '#7a6a58').setOrigin(0, 0.5)));
      y += 12;
      const line = keep(written(this, left, y, said, 23).setOrigin(0, 0).setAlign('left').setWordWrapWidth(wide + 34));
      parts.push(line);
      y += line.height + 16;
    }
    if (story.caption) parts.push(keep(written(this, left, py + ph / 2 - 62, story.caption, 17, '#7a6a58').setOrigin(0, 0.5)));

    // the book in question, and Bill
    const bookIm = keep(img(this, px + pw / 2 - 86, py - ph / 2 + 80, 'book').setRotation(0.16));
    const face = keep(this.add.image(px + pw / 2 - 70, py + ph / 2 - 84, 'bill-grin').setRotation(0.1).setScale(138 / HEAD_SRC_H));
    const go = keep(written(this, px, py + ph / 2 - 24, 'tap to continue', 15, '#7a6a58'));
    const extras = [...parts, bookIm, face, go];
    extras.forEach((o, i) => {
      o.setDepth(d + 1).setAlpha(0);
      this.tweens.add({ targets: o, alpha: 1, duration: 260, delay: 260 + Math.min(i, 6) * 260 });
    });

    let finished = false;
    const next = () => {
      if (finished) return;
      finished = true;
      made.forEach((o) => o.destroy());
      done();
    };
    // long enough to read it; a tap moves on sooner
    this.time.delayedCall(this.auto ? 2600 : 14000, next);
    this.time.delayedCall(1500, () => {
      this.input.once('pointerdown', next);
      this.input.keyboard?.once('keydown-SPACE', next);
    });
  }
}
