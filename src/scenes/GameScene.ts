import Phaser from 'phaser';
import { DEPTH, LANE, MAX_W, SCORE, SPEED, STREET, SWING, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { TREE } from '../art/photos';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { Move, Spawn } from '../data/levels';
import { PHRASES, pick } from '../data/phrases';
import { Bill, RIGS } from '../objects/Bill';
import { MAILBOX_UP, Motion, NoodleNeck } from '../objects/NoodleNeck';
import { Vehicle, VehicleKind } from '../objects/Vehicle';
import { PlayScene, Point, Quality } from './PlayScene';

interface Strip { ts: Phaser.GameObjects.TileSprite; factor: number; tex: number }
interface Prop { im: Phaser.GameObjects.Image; factor: number; wrap?: number }
/** Something Bill has to duck: a road sign, or a birdhouse sitting in a tree. */
interface Sign {
  im: Phaser.GameObjects.Image;
  x: number;
  half: number;
  done: boolean;
  /** What it sits in, drawn behind Bill: the tree a birdhouse is in. */
  back?: Phaser.GameObjects.Image;
  /** How hard it is still rattling after clocking him, and when that started. */
  kick: number;
  kickT: number;
}
/** A thrown newspaper in mid-air. */
interface Paper {
  im: Phaser.GameObjects.Image;
  from: Point;
  /** Where it is heading: a moving mailbox, or a spot on the pavement. */
  to: () => Point;
  t: number;
  dur: number;
  onLand: (im: Phaser.GameObjects.Image) => void;
}

/** Where the things Bill ducks stand: on the median, or on the far pavement. */
const SIGN_BASE_Y = 398;
/** The tree stands in a front yard, its foot behind the picket fence. The
 *  birdhouse sits in its fork: this far up, and this far across from the trunk. */
const TREE_BASE_Y = 300;
const BIRDHOUSE_UP = TREE.h * TREE.birdUp;
const BIRDHOUSE_DX = TREE.h * TREE.birdAcross;
const HIT_WORDS = ['bonk', 'whack', 'thwack', 'bop', 'pow'];
const DELIVERY_WORDS = ['delivered', 'nicetoss', 'inthebox'];

/** The side-on levels: Bill rolls along and the world slides past him. */
export class GameScene extends PlayScene {
  private pending: Spawn[] = [];
  private vehicles: Vehicle[] = [];
  private signs: Sign[] = [];
  private strips: Strip[] = [];
  private props: Prop[] = [];
  private zone!: Phaser.GameObjects.Image;
  private dustFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private papers: Paper[] = [];
  /** The swing whose paper has already been thrown. */
  private thrownId = -1;
  private smokeFx?: Phaser.GameObjects.Particles.ParticleEmitter;
  private wreck?: Phaser.GameObjects.Image;
  private propT = 1;

  constructor() {
    super('game');
  }

  private get street(): boolean {
    return this.level.theme === 'street';
  }

  /** In this level a tap throws a paper, rather than swinging at what is in the ring. */
  private get throwing(): boolean {
    return this.level.attack === 'throw';
  }

  /** Height of the middle of the strike ring: where the targets are. */
  private get ringY(): number {
    return this.street ? STREET.kerbY - MAILBOX_UP : LANE.headY;
  }

  create(): void {
    this.begin();
    this.pending = [...this.level.spawns];
    this.vehicles = [];
    this.signs = [];
    this.strips = [];
    this.props = [];
    this.propT = 1;
    this.wreck = undefined;
    this.smokeFx = undefined;
    this.papers = [];
    this.thrownId = -1;
    if (this.street) this.buildStreet(); else this.buildWorld();
    this.bill = new Bill(this, view.W * this.billFrac, RIGS[this.level.theme]);
    this.zone = img(this, this.bill.sweetX, this.ringY, 'zone').setDepth(DEPTH.median + 1).setAlpha(0.3);
    this.dustFx = this.add.particles(0, 0, 'puff', {
      speedX: { min: -300, max: -200 }, speedY: { min: -36, max: 6 }, lifespan: 420,
      scale: { start: 0.2, end: 0.48 }, alpha: { start: 0.65, end: 0 }, frequency: 85,
    }).setDepth(DEPTH.billBack - 1);
    this.ready();
  }

  // ---- the world ---------------------------------------------------------------

  /** A full-width band of a repeating texture that scrolls with the world. */
  private strip(key: string, y: number, factor: number, depth: number, height?: number): Phaser.GameObjects.TileSprite {
    const a = ART[key];
    const d = a.tex ?? TEX;
    const ts = this.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * d, (height ?? a.h) * d, key)
      .setOrigin(0, 0).setScale(1 / d).setDepth(depth);
    this.strips.push({ ts, factor, tex: d });
    return ts;
  }

  private buildWorld(): void {
    const x0 = -BLEED, ww = MAX_W + BLEED * 2;

    if (this.textures.exists('postcard')) {
      // the far background is a vintage postcard stuck across the top of the page
      const sky = this.add.graphics().setDepth(DEPTH.sky);
      sky.fillStyle(0x7fb0d8, 1);
      sky.fillRect(x0, -BLEED, ww, BLEED);
      this.strip('postcard', -10, 0.06, DEPTH.sky);
    } else {
      // sky: a faded blue page with printed dots thickening toward the horizon
      const sky = this.add.graphics().setDepth(DEPTH.sky);
      sky.fillGradientStyle(0x4d9fd6, 0x4d9fd6, 0xa9d8ea, 0xa9d8ea, 1);
      sky.fillRect(x0, -BLEED, ww, 210 + BLEED);
      this.strip('skydots', 0, 0, DEPTH.sky);
      img(this, 250, 66, 'sun').setDepth(DEPTH.sky + 1);

      for (let i = 0; i < 5; i++) {
        const im = img(this, (i / 5) * (MAX_W + 200) + Math.random() * 90, 26 + Math.random() * 70, 'cloud')
          .setDepth(DEPTH.sky + 2);
        im.setScale(im.scale * (0.6 + Math.random() * 0.5));
        this.props.push({ im, factor: 0.035 + Math.random() * 0.02, wrap: MAX_W + 260 });
      }
      this.strip('hills', 76, 0.1, DEPTH.far);
    }

    // the road: two strips of tarmac paper with painted lines
    this.strip('edge', 192, 0, DEPTH.far + 2);
    this.strip('asphalt', 206, 1, DEPTH.road, 184).setTint(0xeeeef6);
    this.strip('asphalt', 402, 1, DEPTH.road, 128);
    const r = this.add.graphics().setDepth(DEPTH.road);
    r.fillStyle(0xfbf6ea, 1); r.fillRect(x0, 203, ww, 3.5);        // the postcard's white bottom edge
    r.fillStyle(0x1c1820, 0.1); r.fillRect(x0, 206, ww, 92);       // the closed far lane sits a shade darker
    this.strip('asphalt', 388, 1, DEPTH.road, 14).setTint(0xa9a9b6); // median
    this.strip('line_yellow', 390.5, 1, DEPTH.road + 1);
    this.strip('line_yellow', 395.5, 1, DEPTH.road + 1);
    this.strip('line_white', 516, 1, DEPTH.road + 1);

    this.strip('rail', 207 - ART.rail.h, 1, DEPTH.road + 1);                // posts stand on the road's far edge
    this.strip('dash', 297, 1, DEPTH.road + 1);
    this.strip('dash', 452, 1, DEPTH.road + 1);
    this.strip('grass', 522, 1, DEPTH.fore);

    // cones along the closed lane
    const spacing = 190;
    const count = Math.ceil((MAX_W + 200) / spacing);
    for (let i = 0; i < count; i++) {
      const im = img(this, i * spacing + 60, 300, 'cone').setDepth(DEPTH.farCars - 2);
      this.props.push({ im, factor: 1, wrap: count * spacing });
    }

    // the wreck everyone is staring at, already behind Bill as the level starts
    this.wreck = img(this, view.W * 0.62, 292, 'wreck').setDepth(DEPTH.farCars - 1);
    this.smokeFx = this.add.particles(0, 0, 'puff', {
      speedY: { min: -120, max: -70 }, speedX: { min: -30, max: 30 }, lifespan: 1300,
      scale: { start: 0.3, end: 0.9 }, alpha: { start: 0.8, end: 0 }, frequency: 110, tint: 0xc9c5cf,
    }).setDepth(DEPTH.farCars - 1);
  }

  /** Level 1: houses, lawns and a picket fence across the street, mailboxes at the kerb. */
  private buildStreet(): void {
    const x0 = -BLEED, ww = MAX_W + BLEED * 2;
    const sky = this.add.graphics().setDepth(DEPTH.sky);
    sky.fillStyle(0x7fb0d8, 1);
    sky.fillRect(x0, -BLEED, ww, BLEED + 262);
    if (ART.houses.h > 200) {
      // the photo of the street carries its own sky and front lawns; it drifts
      // by slower than the pavement, and the fence hides where the two meet
      this.strip('houses', 304 - ART.houses.h, 0.6, DEPTH.far);
    } else {
      if (this.textures.exists('postcard')) this.strip('postcard', -10, 0.05, DEPTH.sky);
      this.strip('houses', 104, 0.6, DEPTH.far);
      this.strip('lawn', 250, 1, DEPTH.far + 1);
    }
    this.strip('fence', 304 - ART.fence.h, 1, DEPTH.far + 4);
    this.strip('sidewalk', 300, 1, DEPTH.road, 50);
    this.strip('kerb', 346, 1, DEPTH.road + 1);
    this.strip('asphalt', 352, 1, DEPTH.road, 200);
    this.strip('line_white', 524, 1, DEPTH.road + 1);
    this.strip('grass', 528, 1, DEPTH.fore);
  }

  // ---- player actions ------------------------------------------------------------

  protected tryRage(): void {
    if (this.over || this.rage < 100 || this.rageT >= 0 || this.bill.stun > 0) return;
    this.rage = 0;
    this.hud.setRage(0);
    this.rageT = 0;
    this.bill.invulnerable = true;
    this.bill.setFace('grin', 2);
    this.setSlow(0.18);
    sound.rageFire();
    this.say(pick(this.street ? PHRASES.rageStreet : PHRASES.rage), 0);
    const banner = img(this, view.W / 2, 150, this.street ? 'word_extra' : 'word_roadrage').setDepth(DEPTH.overlay).setRotation(-0.04);
    const full = banner.scale;
    banner.setScale(full * 0.3);
    this.tweens.add({ targets: banner, scale: full * 1.05, duration: 60, ease: 'Back.out' });
    this.tweens.add({ targets: banner, alpha: 0, scale: full * 1.5, duration: 90, delay: 200, onComplete: () => banner.destroy() });
    this.cameras.main.zoomTo(view.RES * 1.06, 380);
  }

  /** The bat's special: one grand-slam swing that clears everything in sight. */
  private rageSlam(): void {
    this.setSlow(1);
    this.bill.rageCharge = 0;
    this.bill.startSwing();
    this.bill.markConnected();
    this.thrownId = this.bill.swingId;
    this.cameras.main.zoomTo(view.RES, 160);
    this.cameras.main.shake(380, 0.016);
    this.cameras.main.flash(160, 255, 244, 200);
    const ring = img(this, this.bill.sweetX, this.ringY, 'burst').setDepth(DEPTH.fx + 5).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 420, ease: 'Cubic.out', onComplete: () => ring.destroy() });

    const targets: { v: Vehicle; neck: NoodleNeck; d: number }[] = [];
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.innocent || n.whacked || n.passed || n.claimed) continue;
        if (n.headX > this.bill.x - 240 && n.headX < view.W + 80) targets.push({ v, neck: n, d: Math.abs(n.headX - this.bill.sweetX) });
      }
    }
    targets.sort((a, b) => a.d - b.d);
    targets.forEach((tg, i) => {
      if (this.throwing) tg.neck.claimed = true;
      this.time.delayedCall(i * 55, () => {
        if (!this.vehicles.includes(tg.v)) return;
        // a storm of papers, one for every mailbox in sight; or one almighty swing
        if (this.throwing) this.flyPaper(this.bill.handAt, () => this.doorOf(tg.neck), 0.26, (im) => { im.destroy(); this.whack(tg.v, tg.neck, 'rage'); });
        else this.whack(tg.v, tg.neck, 'rage');
      });
    });
    this.time.delayedCall(500, () => { this.bill.invulnerable = false; });
  }

  // ---- hits ---------------------------------------------------------------------

  private whack(v: Vehicle, neck: NoodleNeck, q: Quality): void {
    if (neck.whacked) return;
    const hx = neck.headX, hy = neck.headY;

    if (neck.innocent) {
      neck.whack(1, v.vx);
      this.combo = 0;
      this.hud.setCombo(0, 1);
      this.cash = Math.max(0, this.cash - SCORE.dogFine);
      this.hud.setCash(this.cash);
      if (neck.kind === 'dog') sound.yelp(); else sound.ouch();
      this.popWord(hx, hy - 40, 'badbill');
      this.popTag(hx + 6, hy + 6, `-$${SCORE.dogFine}`, '#b8372a', 0.12);
      this.say(pick(neck.kind === 'dog' ? PHRASES.dog : PHRASES.mailman), 0.5);
      this.bill.setFace('glare', 1);
      this.cameras.main.shake(120, 0.005);
      return;
    }

    const perfect = q !== 'good';
    neck.whack(q === 'rage' ? 1.6 : perfect ? 1.25 : 0.8, v.vx);
    const gain = this.tally(q);

    const delivery = neck.kind === 'post';
    if (delivery) {
      sound.deliver();
    } else {
      sound.bonk(perfect);
      sound.boing(perfect ? 1.3 : 1);
    }
    this.hitStop = q === 'rage' || delivery ? 0.02 : perfect ? 0.085 : 0.05;
    this.cameras.main.shake(perfect ? 150 : 90, (perfect ? 0.009 : 0.005) * (delivery ? 0.5 : 1));
    this.burst(hx, hy, perfect);
    this.popWord(hx + 10, hy - 52, q === 'perfect' ? 'perfect' : pick(delivery ? DELIVERY_WORDS : HIT_WORDS));
    this.popTag(hx + 38, hy - 4, `+$${gain}`, '#2f6b2b', 0.12);
    this.bill.setFace('grin', 0.5);

    if (neck.kind === 'phone') {
      const rider = v.riders.find((r) => r.neck === neck);
      const from = rider && v.dropPhone(rider);
      if (from) this.flingPhone(from.x, from.y);
      this.say(pick(PHRASES.phone));
    } else if (q !== 'rage' && this.combo > 0 && this.combo % 8 === 0) {
      this.say(pick(this.street ? PHRASES.comboStreet : PHRASES.combo));
    }

    this.showTally();
  }

  /** Turn a level's movement label into how far and how fast a head moves. */
  private motionFor(move: Move): Motion {
    const { lean, bob, restlessness } = this.level;
    return {
      x: move === 'lean' || move === 'both' ? lean : 0,
      y: move === 'bob' || move === 'both' ? bob : 0,
      speed: restlessness,
    };
  }

  /** The open end of a mailbox, where the paper goes in. */
  private doorOf(neck: NoodleNeck): Point {
    return { x: neck.headX - 22, y: neck.headY };
  }

  /** Bill lets go of a paper. Whatever is in the ring gets it: a mailbox, or
   *  (oops) the mailman. If nothing is there it lands on the pavement. */
  private throwPaper(): void {
    const sweet = this.bill.sweetX;
    let best: { v: Vehicle; n: NoodleNeck; d: number } | undefined;
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed || n.claimed) continue;
        const d = Math.abs(n.headX - sweet);
        if (d <= SWING.good && (!best || d < best.d)) best = { v, n, d };
      }
    }
    if (best) {
      const { v, n, d } = best;
      n.claimed = true;
      this.bill.markConnected();
      this.flyPaper(this.bill.handAt, () => this.doorOf(n), 0.24, (im) => {
        im.destroy();
        if (this.vehicles.includes(v)) this.whack(v, n, d <= SWING.perfect ? 'perfect' : 'good');
      });
    } else {
      // nobody home: it lands on the pavement and gets left behind
      const spot = { x: sweet - 40 + Math.random() * 50, y: STREET.kerbY - 8 + Math.random() * 10 };
      const paper = this.flyPaper(this.bill.handAt, () => spot, 0.3, (im) => {
        im.setDepth(DEPTH.road + 2).setRotation(Math.random() * 3);
        this.props.push({ im, factor: 1 });
      });
      paper.ground = spot;
    }
  }

  private flyPaper(from: Point, to: () => Point, dur: number, onLand: (im: Phaser.GameObjects.Image) => void): Paper & { ground?: Point } {
    const im = img(this, from.x, from.y, 'paper_roll').setDepth(DEPTH.fx + 1);
    const paper: Paper & { ground?: Point } = { im, from: { ...from }, to, t: 0, dur, onLand };
    this.papers.push(paper);
    return paper;
  }

  /** Move every paper in the air along its arc, and land the ones that arrive. */
  private updatePapers(dt: number, scroll: number): void {
    for (let i = this.papers.length - 1; i >= 0; i--) {
      const p = this.papers[i] as Paper & { ground?: Point };
      if (p.ground) p.ground.x -= scroll;      // a spot on the pavement slides by with the street
      p.t += dt;
      const k = Math.min(1, p.t / p.dur);
      const to = p.to();
      p.im.setPosition(
        p.from.x + (to.x - p.from.x) * k,
        p.from.y + (to.y - p.from.y) * k - Math.sin(k * Math.PI) * 46,
      );
      p.im.rotation += dt * 14;
      if (k >= 1) {
        this.papers.splice(i, 1);
        p.onLand(p.im);
      }
    }
  }

  private flingPhone(x: number, y: number): void {
    const ph = img(this, x, y, 'phone').setDepth(DEPTH.fx + 2);
    this.tweens.add({ targets: ph, x: x + 150 + Math.random() * 120, duration: 900 });
    this.tweens.add({ targets: ph, rotation: 16, duration: 900 });
    this.tweens.add({ targets: ph, y: y - 150, duration: 380, ease: 'Quad.out' });
    this.tweens.add({ targets: ph, y: 380, duration: 520, delay: 380, ease: 'Quad.in', onComplete: () => ph.destroy() });
  }

  // ---- spawning --------------------------------------------------------------------

  private spawnDue(): void {
    const speed = this.level.speed;
    for (let i = 0; i < this.pending.length; i++) {
      const s = this.pending[i];
      const remaining = s.t - this.levelT;
      if (s.type === 'sign' || s.type === 'birdhouse') {
        // something to duck: it stands still, so it arrives with the scenery
        const birdhouse = s.type === 'birdhouse';
        const head = this.bill.headX0;
        if (remaining > (view.W + (birdhouse ? 250 : 110) - head) / speed) continue;
        const x = head + speed * remaining;
        if (birdhouse) {
          // The tree stands in a front yard, behind the fence. The birdhouse in
          // its fork is at head height and drawn again in front of Bill, so it
          // is plainly the thing he has to get his head under.
          const back = this.textures.exists('tree')
            ? img(this, x - BIRDHOUSE_DX, TREE_BASE_Y, 'tree').setDepth(DEPTH.far + 2)
            : undefined;
          const im = img(this, x, TREE_BASE_Y - BIRDHOUSE_UP, 'birdhouse').setDepth(DEPTH.billCar + 1);
          this.signs.push({ im, x, half: 34, done: false, back, kick: 0, kickT: 0 });
          this.teach('duck', 'Birdhouse in the tree - HOLD DUCK!');
        } else {
          const im = img(this, x, SIGN_BASE_Y, `sign${Math.random() < 0.5 ? 0 : 1}`).setDepth(DEPTH.median);
          this.signs.push({ im, x, half: 34, done: false, kick: 0, kickT: 0 });
          this.teach('duck', 'Sign coming - HOLD DUCK!');
        }
      } else {
        const roadside = s.type === 'mailbox' || s.type === 'mailbox2' || s.type === 'mailman';
        const closing = roadside ? speed : speed + SPEED.crawl;
        if (remaining > (view.W + 330 - this.bill.sweetX) / closing) continue;
        const v = new Vehicle(this, s.type as VehicleKind, view.W + 600, speed, this.motionFor(s.move));
        const lead = roadside ? 0 : v.riders[0].slot.x - 16;
        v.x = this.bill.sweetX + closing * remaining - lead;
        v.update(0);
        this.vehicles.push(v);
        if (s.type === 'dog') this.teach('dog', "That's a good dog. DON'T hit it!");
        else if (s.type === 'mailman') this.teach('mailman', "That's the mailman. DON'T hit him!");
        else if (s.type === 'mailbox2') this.teach('swing', 'TAP to toss a paper when a mailbox reaches the ring!');
        else if (s.type === 'phone') this.teach('phone', 'Phone filmers! Knock some sense into them.');
        else if (s.type === 'bus') this.teach('bus', 'Tour bus! Four heads in a row!');
        else if (s.type === 'mailbox') this.teach('swing', 'TAP to toss a paper when a mailbox reaches the ring!');
        else this.teach('swing', 'TAP to swing when a head reaches the ring!');
        if (s.move !== 'still') this.teach('restless', "They're leaning for a better look. Watch the head!");
      }
      this.pending.splice(i, 1);
      i--;
    }
  }

  private spawnProp(dt: number): void {
    // the street's backdrop has its own trees; a tree in the open there is one to duck
    if (this.street) return;
    this.propT -= dt;
    if (this.propT > 0) return;
    this.propT = 1.3 + Math.random() * 2.2;
    const key = Math.random() < 0.72 ? 'palm' : `billboard${Math.random() < 0.5 ? 0 : 1}`;
    const im = img(this, view.W + 140, 202, key).setDepth(DEPTH.far + 1);
    if (key === 'palm') im.setFlipX(Math.random() < 0.5).setScale(im.scale * (0.85 + Math.random() * 0.3));
    this.props.push({ im, factor: 1 });
  }

  // ---- main loop --------------------------------------------------------------------

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
        this.rageSlam();
      }
    }

    if (!this.over) {
      this.levelT += dt;
      this.spawnDue();
      if (this.auto) this.autoplay();
      this.readInput(real);
    } else {
      this.bill.wantDuck = false;
    }
    this.spawnProp(dt);

    const scroll = this.level.speed * dt;
    for (const s of this.strips) s.ts.tilePositionX += scroll * s.factor * s.tex;
    for (let i = this.props.length - 1; i >= 0; i--) {
      const p = this.props[i];
      p.im.x -= scroll * p.factor;
      if (p.im.x < -160) {
        if (p.wrap) p.im.x += p.wrap;
        else { p.im.destroy(); this.props.splice(i, 1); }
      }
    }
    if (this.wreck) {
      this.wreck.x -= scroll;
      this.smokeFx?.setPosition(this.wreck.x + 30, this.wreck.y - 96);
      if (this.wreck.x < -260) {
        this.wreck.destroy();
        this.wreck = undefined;
        this.smokeFx?.destroy();
        this.smokeFx = undefined;
      }
    }

    const whiff = this.bill.update(dt);
    if (whiff && !this.over) {
      this.combo = 0;
      this.hud.setCombo(0, 1);
    }
    this.zone.setPosition(this.bill.sweetX, this.ringY).setRotation(this.levelT * 0.6);
    // a tap in a throwing level lets one paper go, the moment his arm comes through
    if (this.throwing && this.bill.swingLive && this.bill.swingId !== this.thrownId && !this.over) {
      this.thrownId = this.bill.swingId;
      this.throwPaper();
    }
    this.updatePapers(dt, scroll);
    this.dustFx.setPosition(this.bill.dustAt.x, this.bill.dustAt.y);

    // vehicles, swings and misses
    const sweet = this.bill.sweetX;
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      v.update(dt);
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed || n.claimed) continue;
        const dx = n.headX - sweet;
        const inReach = Math.abs(n.headY - LANE.headY) <= SWING.reachY;
        if (!this.throwing && this.bill.swingLive && Math.abs(dx) <= SWING.good && inReach && !this.over) {
          this.bill.markConnected();
          this.whack(v, n, Math.abs(dx) <= SWING.perfect ? 'perfect' : 'good');
        } else if (dx < -SWING.good - 26) {
          n.passed = true;
          if (this.over) continue;
          if (n.innocent) {
            this.cash += SCORE.dodge;
            this.hud.setCash(this.cash);
            this.popWord(n.headX, n.headY - 46, n.kind === 'dog' ? 'goodboy' : 'nicekid');
          } else {
            this.missed++;
            this.combo = 0;
            this.hud.setCombo(0, 1);
            this.hud.setJam(this.whacked, this.missed, this.total);
            this.popWord(n.headX, n.headY - 46, 'missed');
          }
        }
      }
      if (v.gone) {
        v.destroy();
        this.vehicles.splice(i, 1);
      }
    }

    // things to duck: signs on the median, birdhouses in their trees
    for (let i = this.signs.length - 1; i >= 0; i--) {
      const s = this.signs[i];
      s.x -= scroll;
      s.im.x = s.x;
      if (s.back) s.back.x = s.x - BIRDHOUSE_DX;
      if (s.kick > 0.002) {
        // a birdhouse rattles on its perch after it has clocked him
        s.kick *= Math.exp(-dt * 4);
        s.im.rotation = s.kick * Math.sin((this.levelT - s.kickT) * 26);
      }
      if (!s.done && !this.over) {
        const dx = s.x - this.bill.headX0;
        if (dx < s.half && dx > -s.half && this.bill.exposed) {
          s.done = true;
          if (s.back) {
            s.kick = 0.4;
            s.kickT = this.levelT;
          } else {
            // a sign gets knocked askew
            this.tweens.add({ targets: s.im, rotation: 0.5, duration: 160, ease: 'Back.out' });
          }
          this.hurtBill(this.street ? 'bonk' : 'clang');
        } else if (dx <= -s.half) {
          s.done = true;
          if (!this.bill.invulnerable) {
            this.cash += SCORE.dodge;
            this.hud.setCash(this.cash);
            sound.dodge();
            this.popWord(this.bill.headX0, this.street ? 300 : 262, 'dodged');
          }
        }
      }
      if (s.x < (s.back ? -260 : -120)) {
        s.im.destroy();
        s.back?.destroy();
        this.signs.splice(i, 1);
      }
    }

    if (!this.over && this.pending.length === 0 && this.whacked + this.missed >= this.total) {
      const stillOnScreen = this.signs.some((s) => !s.done);
      if (!stillOnScreen && this.rageT < 0) this.finish('end');
    }
  }

  /** Dev helper: add ?auto to the URL and the game plays itself (?auto=clumsy
   *  plays badly: never ducks, hits dogs, skips heads). */
  private autoplay(): void {
    const clumsy = this.auto === 'clumsy';
    const head = this.bill.headX0;
    this.duckKey = !clumsy && this.signs.some((s) => !s.done && s.x - head < s.half + 80 && s.x - head > -s.half - 14);
    const lead = (this.level.speed + (this.street ? 0 : SPEED.crawl)) * SWING.windup;
    let onScreen = 0;
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed || n.claimed) continue;
        if (n.innocent && !clumsy) continue;
        if (clumsy && Math.floor(n.headY * 7) % 3 === 0) continue;
        if (n.headX < view.W) onScreen++;
        const dx = n.headX - this.bill.sweetX;
        const inReach = clumsy || this.throwing || Math.abs(n.headY - LANE.headY) <= SWING.reachY - 5;
        if (dx < lead + (clumsy ? 40 : 8) && dx > -10 && inReach) this.trySwing();
      }
    }
    if (this.rage >= 100 && onScreen >= 3) this.tryRage();
  }

}
