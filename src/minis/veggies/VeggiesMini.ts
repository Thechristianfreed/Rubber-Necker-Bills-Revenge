import Phaser from 'phaser';
import { TEX, view } from '../../config';
import { ART, applyArt, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { label, written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { Diner, LAYER, PAPILLON, Talk, Waiter, layPapillon, onTable, setTable } from '../shared/papillon';
import { BIG, CUT, VEG, headKey } from './art';
import { burp, clack, gasp, gulp, plop, ptooey, squelch, strain } from './sounds';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;
type Veg = (typeof VEG)[number];

const SECONDS = 18;
/** When it is too late: the waiter is at the table with what he always gets, and there is
 *  just time to see him get it before the clock runs out. */
const LOSE_AT = SECONDS - 1.7;
/** How long before that the waiter sets out. */
const WAITER_WALKS = 2.6;

/** Where Branson's chin is on the page. */
const CHIN = 318;
/** His jaw is hinged under his ear: this far to the right of his chin. His lips are this far
 *  from the hinge, and his throat this far short of it. */
const HX = 61;
const LIPS = 84;
const THROAT = 14;
/** The vegetable, waiting in his father's hand: how far short of his throat, and at what slant. */
const COCKED = { adv: -130, axis: 0.3 };
/** How far in a vegetable is when it has been jammed in, before any shoving. */
const JAMMED = 0.1;
/** How fast he works it back out when nobody is shoving, and after how long. */
const SLIPS = 0.14;
const SLIPS_AFTER = 0.3;

/** How wide his mouth has to open for a vegetable: how far the top of his head tips back,
 *  and how far his jaw drops. */
function gape(v: Veg): { theta: number; phi: number } {
  const all = 2 * Math.asin(Math.min(0.985, (v.thick + 18) / (2 * LIPS)));
  return { theta: all * 0.58, phi: all * 0.42 };
}

/** Branson's head, as a piece of cut-out animation: the same photo twice, cut along the line
 *  of his mouth into the top of his head and his jaw. Each is hinged where his jaw would be,
 *  under his ear, so that the top tips back and the jaw drops, and his mouth opens to the
 *  left, at his father, as wide as it has to. What is inside (the dark, his teeth, his
 *  tongue, and whatever has been put in there) is drawn behind both pieces, so anything in
 *  his mouth is hidden by his face wherever it is not in the gap. */
class Head {
  readonly box: Box;
  readonly veg: Image;
  private readonly cavity: Phaser.GameObjects.Graphics;
  private readonly top: Image;
  private readonly jaw: Image;
  private readonly topBox: Box;
  private readonly jawBox: Box;
  private readonly topBack: Box;
  private readonly jawBack: Box;
  private readonly inside: Image[];
  look = '';
  theta = 0;
  phi = 0;
  /** How far the hinge is from his chin, up the page (it is on the line his head is cut along). */
  hy = -62;

  constructor(scene: Phaser.Scene, x: number, y: number, look: string) {
    this.cavity = scene.add.graphics();
    const tongue = img(scene, -LIPS + 6, 0, 'veggies_tongue');
    const below = img(scene, -LIPS + 2, 0, 'veggies_teeth_bot');
    const above = img(scene, -LIPS + 2, 0, 'veggies_teeth_top');
    this.inside = [tongue, below, above];
    this.jawBack = scene.add.container(0, 0, [tongue, below]);
    this.topBack = scene.add.container(0, 0, [above]);
    this.veg = img(scene, 0, 0, VEG[0].key);
    this.top = img(scene, 0, 0, headKey(look));
    this.jaw = img(scene, 0, 0, headKey(look));
    this.topBox = scene.add.container(0, 0, [this.top]);
    this.jawBox = scene.add.container(0, 0, [this.jaw]);
    this.box = scene.add.container(x, y, [this.cavity, this.jawBack, this.topBack, this.veg, this.topBox, this.jawBox]);
    this.set(look);
    this.open(0, 0);
  }

  /** Change his look. Both pieces change; where his head is cut changes with it; his chin stays where it was. */
  set(look: string): void {
    if (look === this.look) return;
    this.look = look;
    const key = headKey(look), a = ART[key];
    const down = CUT[look] * a.h;
    this.hy = down - a.ay;
    for (const b of [this.topBox, this.jawBox, this.topBack, this.jawBack]) b.setPosition(HX, this.hy);
    const wide = (a.w + a.pad * 2) * TEX, tall = (a.h + a.pad * 2) * TEX, row = Math.round((a.pad + down) * TEX);
    for (const im of [this.top, this.jaw]) {
      applyArt(im, key);
      im.setPosition(-HX, -this.hy);
    }
    this.top.setCrop(0, 0, wide, row);
    this.jaw.setCrop(0, row, wide, tall - row);
    this.draw();
  }

  /** Open his mouth: the top of his head tipped back so far, his jaw dropped so far (both in
   *  radians), and his cheeks so full (0 to 1). */
  open(theta: number, phi: number, full = 0): void {
    this.theta = theta;
    this.phi = phi;
    this.topBox.setRotation(theta).setScale(1 + full * 0.05, 1 + full * 0.03);
    this.topBack.setRotation(theta);
    this.jawBox.setRotation(-phi).setScale(1 + full * 0.1, 1 + full * 0.3);
    this.jawBack.setRotation(-phi);
    const k = Phaser.Math.Clamp((theta + phi) / 0.45, 0, 1);
    for (const im of this.inside) im.setScale(1 / TEX, k / TEX).setVisible(k > 0.06);
    this.draw();
  }

  /** The dark inside his mouth: exactly the gap between the two pieces. */
  private draw(): void {
    const g = this.cavity;
    g.clear();
    if (this.theta + this.phi < 0.02) return;
    g.fillStyle(0x3b0c17, 1);
    g.slice(HX, this.hy, LIPS, Math.PI - this.phi - 0.07, Math.PI + this.theta + 0.07, false);
    g.fillPath();
    g.fillStyle(0x17050a, 1);
    g.slice(HX, this.hy, LIPS * 0.52, Math.PI - this.phi, Math.PI + this.theta, false);
    g.fillPath();
  }

  tint(colour: number): void {
    this.top.setTint(colour);
    this.jaw.setTint(colour);
  }

  /** Put a vegetable on the line into his mouth (tipped `axis` from level): its front end
   *  `adv` past his throat, or short of it if that is less than nothing. What is past his
   *  throat is gone. */
  place(v: Veg, adv: number, axis: number): void {
    const ux = Math.cos(axis), uy = Math.sin(axis), a = ART[v.key];
    if (this.veg.texture.key !== v.key) applyArt(this.veg, v.key);
    this.veg.setPosition(HX + (adv - THROAT) * ux, this.hy + (adv - THROAT) * uy).setRotation(axis);
    const left = v.len - Math.max(0, adv);
    if (adv > 0) this.veg.setCrop(0, 0, Math.max(0, (a.pad + left) * TEX), (a.h + a.pad * 2) * TEX);
    else this.veg.setCrop();
    this.veg.setVisible(left > 1);
  }

  /** Where the hinge is on the page. */
  get hinge(): Point {
    return { x: this.box.x + HX, y: this.box.y + this.hy };
  }

  /** Where a spot on the top of his head is on the page: (x, y) from the hinge, before it tips. */
  onTop(x: number, y: number): Point {
    const c = Math.cos(this.theta), s = Math.sin(this.theta), h = this.hinge;
    return { x: h.x + x * c - y * s, y: h.y + x * s + y * c };
  }
}

type Phase = 'pinch' | 'gasp' | 'jam' | 'cram' | 'gulp' | 'won' | 'lost' | 'done';

/** EAT YOUR VEGETABLES. Growing up, Branson would only ever eat buttered noodles. At Le
 *  Papillon his mother pinches his nose until he has to open his mouth, and his father
 *  crams the vegetables in: a carrot, an ear of corn, and a head of broccoli as big as his
 *  own. The owner's picture of it is the Pepe wrap in Dexter's Laboratory: something as
 *  big as his head rammed into a mouth that stretches right round it.
 *
 *  Each vegetable is two things to do. Wait: his mouth is shut tight until he cannot hold
 *  his breath any longer, and then it is open for a moment (the "!"), and a tap jams the
 *  vegetable in. A tap too soon bounces it off his teeth. Then shove: every tap is a
 *  shove, and he works it back out if they stop. All the way down is a gulp. Three before
 *  the waiter gets there with the noodles. */
export class VeggiesMini extends Mini {
  readonly title = 'EAT YOUR VEGETABLES';
  readonly prompt = 'CRAM IT IN!';
  readonly seconds = SECONDS;

  // how it stands (plain, so that the tests can read it)
  phase: Phase = 'pinch';
  /** Seconds in this phase (below nothing in `pinch`: he is still pulling a face about the last one). */
  t = 0;
  /** Seconds played. */
  clock = 0;
  /** Vegetables down. */
  count = 0;
  /** How far in this one is, 0 to 1. */
  p = 0;
  shoves = 0;
  early = 0;
  missed = 0;
  /** No taps are taken while this runs: he has just been bonked on the teeth. */
  stun = 0;
  /** ...and none count against the player while this does (shoving that has not stopped yet). */
  guard = 0.5;
  waiterOn = false;
  served = false;

  private hold = VEG[0].hold;
  private cues: { at: number; run: () => void }[] = [];
  private talk!: Talk;
  private hx = 0;

  private bill!: Diner;
  private steph!: Diner;
  private head!: Head;
  private body!: Image;
  private kidArms: Image[] = [];
  private neck!: Image;
  private lump!: Image;
  private platter: (Image | undefined)[] = [];
  private arms: Image[] = [];
  private fists: Image[] = [];
  private upper!: Image;
  private forearm!: Image;
  private hand!: Image;
  private alert!: Image;
  private hint!: Phaser.GameObjects.Text;
  private waiter!: Waiter;
  private tray!: Image;
  private bowl!: Image;
  private bits: { im: Image; vx: number; vy: number; spin: number; life: number; drop: number }[] = [];

  // what moves, and where it is on its way to
  private theta = 0;
  private phi = 0;
  private want = { theta: 0, phi: 0 };
  private snap = 20;
  private adv = COCKED.adv;
  private axis = COCKED.axis;
  private from = { adv: 0, axis: 0 };
  private full = 0;
  /** A shove just landed (1, and fading): everything squashes. */
  private chomp = 0;
  /** A vegetable on its way to his shut mouth and back (0 to 1). */
  thrust = 0;
  /** His head, up on the end of his neck while something goes down it (0 to 1). */
  rise = 0;
  private red = 0;
  private smug = 0;
  private recoil = 0;
  private lead = 0;
  private back = [0, 52];
  private stephAt: Point = { x: 0, y: 0 };
  private bodyPop = 0;
  private squeak = 0;
  private flying = false;
  private waiterX = -160;
  /** How long since the last shove. */
  private idle = 0;
  private botIn = 0;
  private botEarly = false;

  /** (the tests read this: tools/test/lib.cjs, `said('...')`) */
  get said() {
    return this.talk.said;
  }

  private get v(): Veg {
    return VEG[Math.min(this.count, VEG.length - 1)];
  }

  build(): void {
    const s = this.scene, W = view.W, cx = W / 2;
    this.talk = new Talk(s);
    this.hx = cx + 10;
    const hx = this.hx, off = 280 + (W - 880) * 0.06;
    layPapillon(s, true);
    setTable(s, cx);

    // his mother and father, either side of him, leaning in
    this.bill = new Diner(s, 'bill', hx - off, 'angry', { size: 1.15, head: 108 });
    this.steph = new Diner(s, 'stephanie', hx + off - 6, 'hold', { size: 1.15, head: 108 });
    this.bill.lean(0.1);
    this.steph.lean(-0.1);

    // Branson: a small boy with a napkin in his collar, and a great deal of head
    img(s, hx + 12, CHIN - 60, 'papillon_chair').setDepth(LAYER.chair);
    this.body = img(s, hx + 12, CHIN + 2, 'veggies_body').setDepth(LAYER.diner + 1);
    for (const side of [-1, 1]) this.kidArms.push(img(s, hx + 12 + side * 52, CHIN + 30, 'veggies_kidarm').setDepth(LAYER.diner + 2));
    this.neck = img(s, hx + 12, CHIN + 14, 'veggies_neck').setDepth(LAYER.diner + 2).setVisible(false);
    this.lump = img(s, hx + 12, CHIN, 'veggies_lump').setDepth(LAYER.diner + 2.5).setVisible(false);
    this.head = new Head(s, hx, CHIN, 'angry');
    this.head.box.setDepth(LAYER.diner + 3);

    // the table: his plate, and the vegetables that are still to come
    onTable(s, 'papillon_plate', hx + 12);
    const dish = onTable(s, 'papillon_plate', hx - 156, 4);
    dish.setScale(dish.scale * 1.3);
    VEG.forEach((v, i) => {
      if (i === 0) return this.platter.push(undefined);
      // (lying on the dish: each is held by the end that goes in first)
      const im = img(s, hx - 156 + ART[v.key].w * 0.21 + (i - 1.5) * 16, PAPILLON.table + 22 - (i - 1) * 9, v.key).setDepth(LAYER.onTable + 0.3 - i * 0.1).setRotation(i === 1 ? 0.05 : -0.04);
      this.platter.push(im.setScale(im.scale * 0.42));
    });
    onTable(s, 'papillon_candle', hx + 156, 8);
    onTable(s, 'papillon_glass_red', this.bill.x + 18, 4);
    onTable(s, 'papillon_glass_red', this.steph.x - 30, 4);

    // their arms: his father's two, which stretch as far as they have to; and his mother's one, with an elbow
    for (let i = 0; i < 2; i++) {
      // (the far one comes round from behind him, so that it does not lie across his face)
      this.arms.push(img(s, 0, 0, 'veggies_arm_bill').setDepth(i ? LAYER.diner - 0.5 : LAYER.held));
      this.fists.push(img(s, 0, 0, 'veggies_fist').setDepth(LAYER.held + 1));
    }
    this.upper = img(s, 0, 0, 'veggies_arm_steph').setDepth(LAYER.held);
    this.forearm = img(s, 0, 0, 'veggies_forearm').setDepth(LAYER.held + 0.2);
    this.hand = img(s, 0, 0, 'veggies_pinch').setDepth(LAYER.held + 1);
    this.stephAt = this.nose();

    this.alert = img(s, hx + 30, CHIN - BIG - 24, 'alert').setDepth(30).setVisible(false);
    this.hint = label(s, cx, 496, '', 30, '#f6c430').setDepth(40);

    // the waiter, who is not here yet, and what he is carrying
    this.waiter = new Waiter(s, this.waiterX);
    this.waiter.im.setDepth(LAYER.chair + 1);
    this.waiter.serve(true);
    this.tray = img(s, 0, 0, 'papillon_tray').setDepth(LAYER.chair + 1.4);
    this.bowl = img(s, 0, 0, 'veggies_noodles').setDepth(LAYER.chair + 1.5);
    this.bowl.setScale(this.bowl.scale * 0.8);

    this.startPinch(VEG[0].hold, 0);
    this.say(this.mouth, 'NO!', 1.0, 150, -150, 24);
    this.after(0.5, () => this.say(this.steph, 'OPEN WIDE!', 1.1, 14, -128));
    this.pose(0);
  }

  // ---- the phases -----------------------------------------------------------------------------

  private enter(phase: Phase): void {
    this.phase = phase;
    this.t = 0;
    this.cues = [];
  }

  /** Do this so many seconds from now, if the phase has not changed by then. */
  private after(secs: number, run: () => void): void {
    this.cues.push({ at: this.t + secs, run });
  }

  /** His mouth is shut, and his mother has him by the nose: for `hold` seconds, after `face` seconds of a face first. */
  private startPinch(hold: number, face: number, look = 'smug'): void {
    this.enter('pinch');
    this.t = -face;
    this.hold = hold;
    this.want = { theta: 0, phi: 0 };
    this.snap = 30;
    this.red = 0;
    this.alert.setVisible(false);
    this.head.set(face > 0 ? look : 'angry');
    this.steph.set('hold');
    this.bill.set('angry');
    this.hint.setText('WAIT FOR IT...').setScale(1);
  }

  /** He cannot hold it any longer. */
  private startGasp(): void {
    this.enter('gasp');
    this.want = { theta: 0.17, phi: 0.24 };
    this.snap = 26;
    this.head.set('shocked');
    this.alert.setVisible(true);
    this.hint.setText('NOW!').setScale(1.5);
    this.scene.tweens.add({ targets: this.hint, scale: 1, duration: 150, ease: 'Back.out' });
    this.steph.set('yell');
    gasp();
  }

  /** In it goes. */
  private jam(): void {
    this.enter('jam');
    this.alert.setVisible(false);
    this.want = gape(this.v);
    this.snap = 24;
    this.from = { adv: this.adv, axis: this.axis };
    this.bill.set('yell');
    this.steph.set('yell');
    this.hint.setText('CRAM! CRAM! CRAM!').setScale(1);
    this.red = 0;
    sound.whoosh();
  }

  private startCram(): void {
    this.enter('cram');
    this.p = JAMMED;
    this.idle = 0;
    this.shoves = 0;
    this.head.set('cry');
    this.chomp = 1;
    this.back = [0, 52];
    this.lead = 0;
    sound.splat();
    this.scene.cameras.main.shake(110, 0.006);
  }

  /** One shove. */
  private shove(): void {
    const v = this.v;
    this.p += (1 - JAMMED) / v.shoves + 0.001;
    this.shoves++;
    this.idle = 0;
    this.chomp = 1;
    this.lead = 1 - this.lead;
    squelch(this.shoves);
    this.scene.cameras.main.shake(70, 0.004);
    const h = this.head.hinge;
    this.puff('puff', h.x - LIPS - 10, h.y - 10, -140 - Math.random() * 80, -60 - Math.random() * 60, 0.35, 300, 0.6);
    if (this.p >= 1) this.startGulp();
  }

  /** It is all the way in: his mouth shuts on it, and down it goes. */
  private startGulp(): void {
    const s = this.scene, hx = this.hx;
    this.count++;
    this.enter('gulp');
    this.p = 1;
    this.want = { theta: 0, phi: 0 };
    this.snap = 34;
    this.head.set('dazed');
    this.hint.setText('');
    this.bill.set('smug');
    this.steph.set('smug');
    clack();
    this.after(0.1, () => {
      gulp();
      this.host.word('veggies_gulp', hx + 150, CHIN - 16);
      // up on the end of his neck, for it to go down
      s.tweens.add({ targets: this, rise: 1, duration: 150, ease: 'Quad.out', yoyo: true, hold: 360 });
    });
    this.after(0.52, () => {
      // ...and it lands
      this.bodyPop = 1;
      plop();
    });
    this.after(0.85, () => {
      if (this.count >= VEG.length) this.win();
      else if (this.clock >= LOSE_AT) this.lose();
      else this.nextVeg();
    });
  }

  /** His father picks up the next one. */
  private nextVeg(): void {
    const v = this.v;
    this.platter[this.count]?.destroy();
    this.platter[this.count] = undefined;
    this.adv = COCKED.adv;
    this.axis = COCKED.axis;
    this.p = 0;
    this.full = 0;
    this.guard = 0.6;
    this.startPinch(v.hold + (Math.random() - 0.5) * 0.2, 0.4, 'disgusted');
    sound.tick();
    if (this.count === 1) this.say(this.mouth, 'I WANT NOODLES!', 1.1, 160, -150);
  }

  /** A tap while his mouth is shut: the vegetable bounces off his teeth. */
  private tooSoon(): void {
    const s = this.scene, hx = this.hx;
    this.early++;
    this.stun = 0.6;
    s.tweens.add({ targets: this, thrust: 1, duration: 80, ease: 'Quad.in', yoyo: true, hold: 30, onYoyo: () => {
      sound.bonk(false);
      this.host.word('veggies_nope', hx - 96, CHIN - 122);
      this.recoil = 1;
      this.smug = 0.55;
      s.cameras.main.shake(80, 0.004);
    } });
    this.hint.setText('TOO SOON!');
  }

  /** He did not get the tap in time: shut again. */
  private tooLate(): void {
    this.missed++;
    clack();
    this.startPinch(0.8, 0.55);
    this.hint.setText('TOO SLOW!');
  }

  /** All three are down. */
  private win(): void {
    const s = this.scene, W = view.W, hx = this.hx;
    this.enter('won');
    this.head.set('dazed');
    this.bill.set('laugh');
    this.steph.set('laugh');
    this.hint.setText('');
    this.host.word('veggies_cleanplate', W / 2, 462, true);
    sound.win();
    // butterflies, off the wallpaper: up the gaps between the three of them, not over their faces
    const gap = this.steph.x - hx;
    [hx - 172, hx + 152, hx - gap - 96, hx + gap + 90].forEach((x, i) => {
      const b = img(s, x + (Math.random() - 0.5) * 20, 430, 'papillon_butterfly').setDepth(31).setRotation((Math.random() - 0.5) * 0.6);
      s.tweens.add({ targets: b, y: 60 + Math.random() * 110, x: b.x + (Math.random() - 0.5) * 36, duration: 1500 + Math.random() * 500, delay: i * 90, ease: 'Sine.out' });
      s.tweens.add({ targets: b, scaleX: b.scaleX * 0.25, duration: 110, yoyo: true, repeat: -1 });
    });
    this.after(0.55, () => {
      // and a little of it comes back
      this.want = { theta: 0.2, phi: 0.16 };
      this.snap = 30;
      burp();
      this.host.word('veggies_burp', hx - 150, CHIN - 150);
      const h = this.head.hinge;
      for (let i = 0; i < 3; i++) this.puff('veggies_leaf', h.x - LIPS, h.y, -150 - Math.random() * 120, -150 - Math.random() * 90, 0.9, 420, 1);
    });
    this.after(0.85, () => {
      this.want = { theta: 0, phi: 0 };
      this.head.set('disgusted');
    });
    this.after(1.45, () => {
      this.phase = 'done';
      this.host.finish(true);
    });
  }

  /** Too late: the waiter is here. Whatever is in his mouth comes out again, and he gets what he always gets. */
  private lose(): void {
    const s = this.scene, W = view.W, hx = this.hx, had = this.phase === 'cram' || this.phase === 'jam';
    this.enter('lost');
    this.hint.setText('');
    this.alert.setVisible(false);
    this.red = 0;
    this.stun = 9;
    if (had) {
      this.flying = true;
      this.snap = 30;
      ptooey();
      this.host.word('veggies_ptooey', hx - 150, CHIN - 172);
      this.after(0.13, () => {
        this.bill.set('ouch');
        sound.bonk(false);
        const top = this.bill.top;
        for (let i = 0; i < 4; i++) this.puff('star', top.x + 20, top.y + 40, (Math.random() - 0.5) * 260, -120 - Math.random() * 140, 0.6, 520, 1);
      });
    } else {
      this.adv = -9999;
      this.bill.set('worried');
    }
    this.steph.set('shocked');
    this.after(0.36, () => {
      this.want = { theta: 0, phi: 0 };
      this.snap = 34;
      this.head.set('smug');
      clack();
    });
    this.after(0.5, () => {
      // onto the table in front of him
      this.served = true;
      this.bowl.setDepth(LAYER.onTable + 1);
      s.tweens.add({ targets: this.bowl, x: hx + 12, duration: 300, ease: 'Sine.inOut' });
      s.tweens.add({ targets: this.bowl, y: PAPILLON.table + 30, scale: 1 / TEX, duration: 300, ease: 'Back.in' });
    });
    this.after(0.84, () => {
      this.head.set('smile');
      this.bill.set('worried');
      this.steph.set('hold');
      sound.tock();
      sound.wahwah(0.7);
      const words = written(s, W / 2, 84, 'BUTTERED NOODLES. AGAIN.', 23).setDepth(61).setRotation(-0.015);
      const tape = img(s, W / 2, 84, 'tape_l').setDepth(60).setRotation(-0.015);
      tape.setScale(tape.scale * ((words.width + 44) / ART.tape_l.w), tape.scale * 1.1);
      for (const o of [tape, words]) {
        o.setAlpha(0);
        s.tweens.add({ targets: o, alpha: 1, duration: 120 });
      }
    });
    this.after(1.7, () => {
      this.phase = 'done';
      this.host.finish(false);
    });
  }

  // ---- the finger -----------------------------------------------------------------------------

  press(_at: Point): void {
    this.tap();
  }

  private tap(): void {
    if (this.stun > 0) return;
    if (this.phase === 'gasp') this.jam();
    else if (this.phase === 'cram') this.shove();
    else if (this.phase === 'pinch' && this.guard <= 0 && this.t > 0) this.tooSoon();
  }

  // ---- every frame ----------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    this.clock += dt;
    this.stun = Math.max(0, this.stun - dt);
    this.guard = Math.max(0, this.guard - dt);
    this.smug = Math.max(0, this.smug - dt);
    this.talk.update(dt);
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    const v = this.v;

    if (this.phase === 'pinch') {
      if (this.t >= 0) {
        // redder and redder, and then not angry any more
        const k = Math.min(1, this.t / this.hold);
        this.red = k;
        this.head.set(this.smug > 0 ? 'smug' : k < 0.62 ? 'angry' : 'worried');
        this.squeak -= dt;
        if (k > 0.3 && this.squeak <= 0) {
          this.squeak = 0.2;
          strain(k);
        }
        if (this.t >= this.hold) this.startGasp();
      }
    } else if (this.phase === 'gasp') {
      this.red = Math.max(0, this.red - dt * 3);
      if (this.t >= v.open) this.tooLate();
    } else if (this.phase === 'jam') {
      if (this.t >= 0.22) this.startCram();
    } else if (this.phase === 'cram') {
      this.idle += dt;
      if (this.idle > SLIPS_AFTER) this.p = Math.max(JAMMED * 0.8, this.p - SLIPS * dt);
    }

    // out of time: unless the last of it is on its way down already
    if (this.clock >= LOSE_AT && (this.phase === 'pinch' || this.phase === 'gasp' || this.phase === 'jam' || this.phase === 'cram')) this.lose();
    this.walk(dt);
    this.pose(dt);
  }

  /** The waiter: on his way for the last few seconds, there when it is too late, and gone again if he is not needed. */
  private walk(dt: number): void {
    const there = this.hx - 196;
    if (!this.waiterOn && this.clock >= LOSE_AT - WAITER_WALKS && this.count < VEG.length && this.phase !== 'won' && this.phase !== 'lost') this.waiterOn = true;
    if (!this.waiterOn) return;
    const going = this.count < VEG.length, to = going ? there : -170;
    const speed = going ? (there + 160) / WAITER_WALKS : 620;
    const step = Phaser.Math.Clamp(to - this.waiterX, -speed * dt, speed * dt);
    this.waiterX += step;
    const bob = Math.abs(step) > 0.01 ? Math.abs(Math.sin(this.clock * 9)) * 5 : 0;
    this.waiter.im.setPosition(this.waiterX, PAPILLON.feet - bob);
  }

  /** Where his mouth is, for what he says to come from; and his nose, for his mother's fingers. */
  private get mouth(): { mouth: Point } {
    return { mouth: { x: this.hx, y: CHIN - 64 } };
  }

  private nose(): Point {
    return { x: this.head.box.x - 17, y: this.head.box.y - 88 };
  }

  /** Where somebody's shoulder is on the page: the one nearer Branson, or (`far`) the other. */
  private shoulder(d: Diner, near: number, far = false): Point {
    const r = d.box.rotation, k = d.box.scaleX, x = (far ? -near : near) * 60 * k, y = -84 * k;
    return { x: d.box.x + x * Math.cos(r) - y * Math.sin(r), y: d.box.y + x * Math.sin(r) + y * Math.cos(r) };
  }

  /** Lay an arm from one spot to another: it is as long as that takes. */
  private reach(arm: Image, from: Point, to: Point): void {
    const key = arm.texture.key, dx = to.x - from.x, dy = to.y - from.y;
    arm.setPosition(from.x, from.y).setRotation(Math.atan2(dy, dx)).setScale(Math.hypot(dx, dy) / (ART[key].w - 12) / TEX, 1 / TEX);
  }

  /** Put everything where it is. */
  private pose(dt: number): void {
    const v = this.v, hx = this.hx, head = this.head, ease = (rate: number) => Math.min(1, dt * rate);
    const playing = this.phase === 'pinch' || this.phase === 'gasp' || this.phase === 'jam' || this.phase === 'cram';

    // his mouth
    this.chomp = Math.max(0, this.chomp - dt * 7);
    this.theta += (this.want.theta - this.theta) * ease(this.snap);
    this.phi += (this.want.phi - this.phi) * ease(this.snap);
    this.full += ((this.phase === 'cram' ? this.p : 0) - this.full) * ease(this.phase === 'cram' ? 14 : 8);
    head.open(this.theta * (1 - 0.2 * this.chomp), this.phi * (1 - 0.08 * this.chomp), this.full + this.chomp * 0.12);

    // his head: shaking "no" while his mouth is shut, shuddering while it is full, up on his neck for a gulp
    this.recoil = Math.max(0, this.recoil - dt * 5);
    const no = this.phase === 'pinch' && this.t > 0 ? Math.sin(this.clock * 21) * (1 - this.red * 0.5) : 0;
    const shudder = this.phase === 'cram' ? (Math.random() - 0.5) * 3 : 0;
    head.box.setPosition(hx + no * 5 + shudder + this.recoil * 9, CHIN - this.rise * 46 + shudder * 0.5).setRotation(no * 0.035 + this.recoil * 0.06);
    const r = Math.min(1, this.red);
    head.tint(Phaser.Display.Color.GetColor(255 - Math.max(0, r - 0.75) * 120, 255 - r * 120, 255 - r * 105 + Math.max(0, r - 0.75) * 190));

    // the vegetable
    if (this.flying) {
      this.adv -= 1500 * dt;
    } else if (this.phase === 'pinch' || this.phase === 'gasp') {
      const wag = Math.sin(this.clock * 7) * 0.035;
      this.adv = Phaser.Math.Linear(COCKED.adv, -(LIPS - THROAT + 6), this.thrust);
      this.axis = Phaser.Math.Linear(COCKED.axis + wag, 0.04, this.thrust);
    } else if (this.phase === 'jam') {
      const k = Phaser.Math.Easing.Quadratic.Out(Math.min(1, this.t / 0.2)), g = gape(v);
      this.adv = Phaser.Math.Linear(this.from.adv, JAMMED * v.len, k);
      this.axis = Phaser.Math.Linear(this.from.axis, (g.theta - g.phi) / 2, k);
    } else if (this.phase === 'cram') {
      this.adv += (this.p * v.len - this.adv) * ease(24);
      this.axis = (this.theta - this.phi) / 2;
    } else if (this.phase === 'gulp') this.adv = 999;
    head.place(VEG[Math.min(this.vegOnShow(), VEG.length - 1)], this.adv, this.axis);
    if (this.adv < -700 || this.phase === 'won') head.veg.setVisible(false);

    // his father's fists: one on it; and, while it is being shoved, the two of them turn about
    const h = head.hinge, ux = Math.cos(this.axis), uy = Math.sin(this.axis);
    const tail = THROAT - this.adv + v.len, pushing = this.phase === 'jam' || this.phase === 'cram';
    const grip = pushing ? Math.max(tail + 8, 62) : tail - 42;
    for (let i = 0; i < 2; i++) {
      const fist = this.fists[i], arm = this.arms[i];
      const show = playing && !this.flying && (i === 0 || pushing);
      fist.setVisible(show);
      arm.setVisible(show);
      if (!show) continue;
      const want = pushing ? (i === this.lead ? 0 : 52) : 0;
      this.back[i] += (want - this.back[i]) * ease(30);
      const d = grip + this.back[i], side = pushing ? (i ? 15 : -15) : 0;
      const at = { x: h.x - ux * d - uy * side, y: h.y - uy * d + ux * side };
      fist.setPosition(at.x, at.y).setRotation(this.axis);
      this.reach(arm, this.shoulder(this.bill, 1, i === 1), { x: at.x - ux * 14, y: at.y - uy * 14 });
    }

    // his mother's hand: on his nose, off it, and then holding the top of his head back
    const hold = this.phase === 'jam' || this.phase === 'cram';
    const to = hold ? head.onTop(-36, -(BIG + head.hy) + 14) : this.phase === 'gasp' ? { x: hx + 112, y: CHIN - BIG + 6 } : this.nose();
    const k = ease(this.phase === 'pinch' && this.t > 0 ? 40 : 16);
    this.stephAt = { x: this.stephAt.x + (to.x - this.stephAt.x) * k, y: this.stephAt.y + (to.y - this.stephAt.y) * k };
    const showHand = playing;
    for (const o of [this.upper, this.forearm, this.hand]) o.setVisible(showHand);
    if (showHand) {
      const from = this.shoulder(this.steph, -1), at = this.stephAt;
      const elbow = hold ? { x: (from.x + at.x) / 2 + 30, y: Math.min(from.y, at.y) + 40 } : { x: from.x - 36, y: at.y - 14 };
      const key = hold ? 'veggies_palm' : 'veggies_pinch';
      if (this.hand.texture.key !== key) applyArt(this.hand, key);
      this.hand.setPosition(at.x, at.y).setRotation(hold ? this.theta - 0.5 : 0);
      this.reach(this.upper, from, elbow);
      this.reach(this.forearm, elbow, { x: at.x + (hold ? 0 : 14), y: at.y + (hold ? 6 : 0) });
    }

    // the rest of him: his arms, his neck, and what goes down it
    const wave = this.clock;
    const up = this.phase === 'pinch' ? 2.78 : this.phase === 'gasp' ? -0.5 : this.phase === 'jam' || this.phase === 'cram' ? -0.9 + Math.sin(wave * 31) * 0.8
      : this.phase === 'lost' && this.t > 0.84 ? -1.15 + Math.sin(wave * 14) * 0.25 : 1.3;
    const other = this.phase === 'jam' || this.phase === 'cram' ? -0.9 + Math.sin(wave * 27 + 1) * 0.8 : up;
    this.kidArms[1].setRotation(up);
    this.kidArms[0].setRotation(Math.PI - other);
    this.bodyPop = Math.max(0, this.bodyPop - dt * 4);
    this.body.setScale((1 + this.bodyPop * 0.22) / TEX, (1 + this.bodyPop * 0.1) / TEX);
    const stretched = this.rise * 46;
    this.neck.setVisible(stretched > 1).setScale(1 / TEX, (stretched + 34) / ART.veggies_neck.h / TEX);
    const down = this.phase === 'gulp' ? Phaser.Math.Clamp((this.t - 0.14) / 0.36, 0, 1) : 1;
    this.lump.setVisible(down > 0 && down < 1 && stretched > 6).setPosition(hx + 12, CHIN - stretched + 4 + down * (stretched + 6));

    // the "!", the instructions, and the bits in the air
    this.alert.setScale((1.7 + Math.sin(this.clock * 20) * 0.12) / TEX);
    if (!this.served) {
      const hand = this.waiter.hand;
      this.tray.setPosition(hand.x, hand.y);
      this.bowl.setPosition(hand.x, hand.y - 4);
    } else this.tray.setPosition(this.waiter.hand.x, this.waiter.hand.y);
    for (const b of this.bits) {
      b.life -= dt;
      b.vy += b.drop * dt;
      b.im.setPosition(b.im.x + b.vx * dt, b.im.y + b.vy * dt).setRotation(b.im.rotation + b.spin * dt).setAlpha(Math.min(1, b.life * 4));
      if (b.life <= 0) b.im.destroy();
    }
    this.bits = this.bits.filter((b) => b.life > 0);
  }

  /** Which vegetable is to be seen: the one being put in (after a gulp, still the one that went down). */
  private vegOnShow(): number {
    return this.phase === 'gulp' || this.phase === 'won' ? this.count - 1 : this.count;
  }

  // ---- odds and ends --------------------------------------------------------------------------

  private say(who: { mouth: Point }, text: string, secs: number, dx: number, dy: number, size = 19): void {
    this.talk.say(who, text, secs, dx, dy, size);
  }

  /** Something small in the air: it flies, falls, and is gone. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, size: number): void {
    const im = img(this.scene, x, y, key).setDepth(32).setRotation(Math.random() * 6);
    im.setScale(im.scale * size);
    this.bits.push({ im, vx, vy, spin: (Math.random() - 0.5) * 9, life, drop });
  }

  timeUp(): boolean {
    return this.count >= VEG.length;
  }

  /** Self-play. The careful one taps the moment his mouth opens, and shoves as fast as a
   *  thumb can. The careless one pokes at his shut mouth, misses the first chance at each
   *  vegetable, and shoves slowly: the waiter gets there first. */
  bot(dt: number): void {
    const clumsy = this.host.auto === 'clumsy';
    this.botIn -= dt;
    if (this.phase === 'pinch') {
      if (clumsy && !this.botEarly && this.t > this.hold * 0.45 && this.missed === this.count) {
        this.botEarly = true;
        this.tap();
      }
      this.botIn = clumsy ? 0.45 : 0.16;
    } else if (this.phase === 'gasp') {
      this.botEarly = false;
      // (the careless one lets the first one go by, every time)
      if (clumsy && this.missed <= this.count) return;
      if (this.botIn <= 0) this.tap();
    } else if (this.phase === 'cram' && this.botIn <= 0) {
      this.botIn = clumsy ? 0.62 : 0.12;
      this.tap();
    }
  }
}
