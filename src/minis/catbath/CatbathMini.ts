import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { ART, applyArt, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { bubble } from '../../ui/bubble';
import { label } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { FACE, face } from '../shared/people';
import { DEN, layDen } from '../shared/places';
import { HEAD as HOME_HEAD, bodyOf as homeBodyOf } from '../homecoming/layout';
import { CATS } from './art';
import { CUT } from './cut';
import {
  AT_SINK, BODIES, COUNTER_TALL, FEET, HEAD, KITCHEN_PHOTO, LINE, RIM, SPOTS, V, bodyOf, boardFoot, isPhoto, scrubRange, sinkOff,
} from './layout';
import { SOUNDS } from './sounds';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;
type Thing = Phaser.GameObjects.GameObject;

// ---- the story: what Pappy says -----------------------------------------------------------------

const SOMEONE = 'SOMEONE NEEDS TO BATHE THESE DAMN CATS.';
/** As he gets hold of each one. */
const GOT_YOU = ['WHY YOU LITTLE...!', 'C\'MERE, YOU.', 'YOUR TURN.'];
/** When it stops fighting, and when it is clean. */
const OUT = ['THERE WE GO.', 'NIGHTY NIGHT.', 'THAT\'S BETTER.'];

// ---- tuning -------------------------------------------------------------------------------------

/** In the front room they are drawn this much bigger than their pictures (as in "Pappy comes home"). */
const SIZE = 1.25;
const GROUND = 458;
/** How much fight a cat has, and how fast it gets it back: each squeeze takes this much off (more
 *  for the later ones: he is getting the hang of it). */
const DECAY = [0.1, 0.12, 0.14];
const REGEN = 0.1;
/** How often a cat that still has some fight in it gets its claws into him. */
const CLAWS = 1.1;
/** How many times along the washboard each one needs, and how many times round to wring it out. */
const STROKES = [8, 7, 6];
const TURNS = [3, 2.5, 2];
/** How far the finger has to go one way before going back counts as another scrub. */
const STROKE = 30;
/** The cats are drawn this much bigger than their pictures: in his hands, and sitting about. */
const HELD = 1.15;
const SITTING = 1.1;
/** The poses he holds a cat in: his fists go in front of it. */
const FISTS = ['choke', 'scrub', 'wring', 'hang'];

type Stage = 'home' | 'sink' | 'clean' | 'done';
type Step = 'intro' | 'grab' | 'choke' | 'dunk' | 'scrub' | 'rinse' | 'wring' | 'hang' | 'kiss' | 'between';
interface Cat { i: number; im: Image; where: 'counter' | 'held' | 'line'; pegs: Image[] }

/** His face: his own, from everybody's set, or (on a page that could not fetch its photos) paper. */
function faceKey(scene: Phaser.Scene, look: string): string {
  const key = face('pappy', look);
  return scene.textures.exists(key) ? key : 'catbath_head_pappy';
}

/** Pappy: a body in a pose, and his own head hung on it by the chin. In the front room he is the
 *  photo from "Pappy comes home", used as it is; at the sink he is this game's own. */
class Pappy {
  readonly box: Box;
  private readonly body: Image;
  private readonly head: Image;
  pose = '';
  look = '';

  constructor(private readonly scene: Phaser.Scene, pose: string, look: string, x: number, y: number, size: number) {
    this.body = img(scene, 0, 0, this.of(pose).key);
    this.head = img(scene, 0, 0, faceKey(scene, look));
    this.box = scene.add.container(x, y, [this.body, this.head]).setScale(size);
    this.set(pose, look);
  }

  private of(pose: string): { key: string; chin: V; tilt: number; head: number } {
    if (pose === 'home') {
      if (this.scene.textures.exists('homecoming_pappy_stand')) return { key: 'homecoming_pappy_stand', ...homeBodyOf('pappy_stand'), head: HOME_HEAD };
      return { key: 'catbath_pappy_stand', chin: BODIES.stand.chin, tilt: 0, head: HEAD };
    }
    const b = bodyOf(pose);
    return { key: `catbath_pappy_${pose}`, chin: b.chin, tilt: b.tilt, head: HEAD };
  }

  set(pose: string, look = this.look): void {
    this.pose = pose;
    this.look = look;
    const p = this.of(pose);
    applyArt(this.body, p.key);
    applyArt(this.head, faceKey(this.scene, look));
    this.head.setScale(p.head / FACE / TEX).setPosition(p.chin[0], p.chin[1]).setRotation(p.tilt);
  }

  face(look: string): void {
    if (look !== this.look) this.set(this.pose, look);
  }

  at(x: number, y: number): Point {
    return { x: this.box.x + x * this.box.scaleX, y: this.box.y + y * this.box.scaleY };
  }

  private up(k: number): Point {
    const p = this.of(this.pose);
    return this.at(p.chin[0] + Math.sin(p.tilt) * p.head * k, p.chin[1] - Math.cos(p.tilt) * p.head * k);
  }

  get mouth(): Point {
    return this.up(0.27);
  }

  get eyes(): Point {
    return this.up(0.5);
  }
}

/** Bath time. Pappy had to bathe the cats, and the cats did not like it: they hissed and
 *  clawed him while he held them at the sink. So one time he throttled one until it passed
 *  out, dunked it in the soapy water a bunch, and left it to dry.
 *
 *  The front room, full of stinking cats; then the kitchen sink, full of bubbles, with a
 *  washboard in it and the sprayer beside it. One cat at a time: choke it out (tap, fast,
 *  while it claws him), dunk it and scrub it on the washboard (up and down), wring it out
 *  like a towel (round and round), hang it on the line, and give it a kiss. When all three
 *  are up: ALL CLEAN.
 *
 *  It is a story that waits for the player: there is no clock, and it always ends the
 *  same way. */
export class CatbathMini extends Mini {
  readonly title = 'BATH TIME';
  readonly prompt = 'BATHE THE CATS!';
  readonly seconds = 90;
  readonly timed = false;

  stage: Stage = 'home';
  step: Step = 'intro';
  /** Where the story has got to, for the tests to photograph. */
  beat = '';
  t = 0;
  clock = 0;
  private cues: { at: number; run: () => void }[] = [];
  private later: { left: number; run: () => void }[] = [];
  said: { box: Box; left: number }[] = [];
  bits: { im: Image; vx: number; vy: number; spin: number; life: number; drop: number }[] = [];
  private shot: Thing[] = [];
  private caption?: Phaser.GameObjects.Text;

  private pappy?: Pappy;
  private hands: Image[] = [];
  cats: Cat[] = [];
  /** Which cat is being bathed (0, 1, 2). */
  n = 0;
  private flies: { im: Image; at: Point; ph: number; r: number }[] = [];
  private stinkIn = 0;
  private stinky: Point[] = [];

  // ---- at the sink
  private px = 0;
  private sx = 0;
  /** The cat being bathed: where it is held from (its neck; its middle, being wrung). */
  private held?: Cat;
  private holdAt: Point = { x: 0, y: 0 };
  /** How much fight is left in it; scrubs and quarter turns so far. */
  fight = 1;
  private clawIn = 0;
  strokes = 0;
  quarters = 0;
  /** Where on the washboard it is, which way it was last going, and how far. */
  private scrubY = 0;
  /** How far up and down the board it goes; and whether he is a photo (whose own fists go round
   *  what he holds), or paper. */
  private range: V = [0, 0];
  private photo = false;
  private dir = 0;
  private travel = 0;
  private lastY = 0;
  /** A finger is down (and not a key); where round the cat it last was. */
  private finger = false;
  private lastAng: number | null = null;
  private spun = 0;
  private bar?: Phaser.GameObjects.Graphics;
  private barName?: Phaser.GameObjects.Text;
  private barFull = 1;
  private spinner?: Image;
  private arrow?: Image;
  private sprayer?: Image;
  private scratches: Image[] = [];
  private botIn = 0;
  private botAng = 0;

  private get cx(): number {
    return view.W / 2;
  }

  // ==== the front room, and the smell =============================================================

  build(): void {
    const s = this.scene, W = view.W;
    if (s.textures.exists('den')) this.capture(() => layDen(s));
    else {
      const strip = (key: string, y: number, tall: number) => this.keep(s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, tall * TEX, key).setOrigin(0, 0).setScale(1 / TEX).setDepth(1));
      strip('den_wall', -BLEED, DEN.floor + BLEED);
      strip('den_carpet', DEN.floor, H - DEN.floor + BLEED);
    }
    if (s.textures.exists('homecoming_door_in')) this.keep(img(s, 94, DEN.floor + 8, 'homecoming_door_in').setDepth(3));
    this.pappy = new Pappy(s, 'home', 'calm', W * 0.5, GROUND, SIZE);
    this.keep(this.pappy.box.setDepth(12));
    const spots: [number, number][] = [[W * 0.2, GROUND + 34], [W * 0.73, GROUND + 22], [W * 0.36, GROUND + 58]];
    this.cats = spots.map(([x, y], i) => {
      const im = this.keep(img(s, x, y, `catbath_cat${i}_sit`).setDepth(14 + i * 0.1));
      im.setScale(SIZE / TEX).setFlipX(i === 1);
      return { i, im, where: 'counter' as const, pegs: [] };
    });
    this.stinky = spots.map(([x, y]) => ({ x, y: y - 150 }));
    this.swarm();

    this.script([
      [0.5, () => {
        this.beat = 'stink';
        this.pappy!.face('disgusted');
        SOUNDS.buzz(2.5);
      }],
      [1.0, () => {
        this.beat = 'someone';
        this.pappy!.face('angry');
        this.say(this.pappy!.mouth, SOMEONE, 2.3, -10, -96, 21);
      }],
      [2.5, () => {
        // and they think about as much of him
        this.beat = 'hiss';
        this.pappy!.face('disgusted');
        SOUNDS.hiss();
        for (const c of this.cats) {
          applyArt(c.im, `catbath_cat${c.i}_mad`);
          c.im.setScale((SIZE * 0.8) / TEX).setY(c.im.y - 60);
          this.hop(c.im, 14);
        }
        this.host.word('catbath_hiss', this.cats[0].im.x + 10, this.cats[0].im.y - 90);
      }],
      [1.3, () => this.words('TO THE KITCHEN SINK.')],
      [1.3, () => this.blackout(() => this.startSink())],
    ]);
  }

  /** Flies, round each of them. */
  private swarm(): void {
    this.flies = [];
    this.stinky.forEach((at, k) => {
      for (let j = 0; j < 2; j++) this.flies.push({ im: this.keep(img(this.scene, at.x, at.y, 'catbath_fly').setDepth(30)), at, ph: k * 2 + j * 3, r: 26 + j * 14 });
    });
  }

  // ==== the kitchen sink ==========================================================================

  private startSink(): void {
    const s = this.scene, W = view.W, cx = this.cx;
    this.clear();
    this.stage = 'sink';
    this.beat = 'kitchen';
    this.px = cx - 70;
    this.sx = this.px + sinkOff();
    this.photo = isPhoto('pappy_choke');
    this.range = scrubRange();
    this.scrubY = this.range[1];
    if (isPhoto('kitchen')) {
      // (the photo of the kitchen, with the edge of its own counter behind his)
      const a = ART.catbath_kitchen;
      this.keep(s.add.image(cx - a.w / 2, RIM - CUT.kitchen.edge * KITCHEN_PHOTO.k, 'catbath_kitchen').setOrigin(0, 0).setScale(1 / (a.tex ?? TEX)).setDepth(1));
    } else this.keep(img(s, -BLEED, -BLEED, 'catbath_kitchen').setDepth(1));
    // the clothesline, across the top of the kitchen
    const d = TEX;
    this.keep(s.add.tileSprite(-BLEED, LINE, (MAX_W + BLEED * 2) * d, 8 * d, 'catbath_rope').setOrigin(0, 0.5).setScale(1 / d).setDepth(3));
    this.keep(img(s, 12, LINE, 'catbath_hook').setDepth(3.2));
    this.keep(img(s, W - 12, LINE, 'catbath_hook').setDepth(3.2).setFlipX(true));

    this.pappy = new Pappy(s, 'stand', 'angry', this.px, FEET, AT_SINK);
    this.keep(this.pappy.box.setDepth(10));
    this.hands = [0, 1].map(() => this.keep(img(s, 0, 0, 'catbath_hand').setDepth(27)));
    for (const h of this.hands) h.setScale(AT_SINK / TEX).setVisible(false);
    const cd = ART.catbath_counter?.tex ?? TEX, tall = isPhoto('counter') ? COUNTER_TALL : 160;
    this.keep(s.add.tileSprite(-BLEED, RIM - 4, (MAX_W + BLEED * 2) * cd, tall * cd, 'catbath_counter').setOrigin(0, 0).setScale(1 / cd).setDepth(20));
    this.keep(img(s, this.sx, RIM + 8, 'catbath_basin').setDepth(21));
    // (the washboard, and a cat in the sink, are behind the counter: the rim hides what is under the water)
    this.keep(img(s, this.sx, boardFoot(), 'catbath_board').setDepth(19));
    this.keep(img(s, this.sx + (isPhoto('tap') ? 104 : 128), RIM + 4, 'catbath_tap').setDepth(23));
    this.sprayer = this.keep(img(s, this.sx + 178, RIM + 6, 'catbath_sprayer').setDepth(23));
    // (on a photo the heap of suds sits lower in the sink, below his hands)
    this.keep(img(s, this.sx, RIM + (isPhoto('suds') ? 26 : 12), 'catbath_suds').setDepth(25));

    // the three of them, along the counter, still stinking
    this.cats = CATS.map((_, i) => {
      const im = this.keep(img(s, this.px - 150 - i * 74, RIM + 4, `catbath_cat${i}_sit`).setDepth(24 - i * 0.1));
      im.setScale(SITTING / TEX).setFlipX(i % 2 === 1);
      return { i, im, where: 'counter' as const, pegs: [] };
    });
    this.stinky = this.cats.map((c) => ({ x: c.im.x, y: c.im.y - 128 }));
    this.swarm();

    // how far along it is
    this.bar = this.keep(s.add.graphics().setDepth(88));
    this.barName = this.keep(label(s, this.cx - 150, 60, '', 18, '#f6c430').setDepth(89).setOrigin(1, 0.5));

    this.n = 0;
    this.script([
      [0.5, () => this.words('ONE AT A TIME.')],
      [1.1, () => this.grab()],
    ]);
  }

  /** He gets hold of the next one. */
  private grab(): void {
    const s = this.scene, cat = this.cats[this.n], p = this.pappy!;
    this.step = 'grab';
    this.beat = `grab${this.n}`;
    this.caption?.destroy();
    p.set('grab', 'angry');
    this.held = cat;
    cat.where = 'held';
    applyArt(cat.im, `catbath_cat${cat.i}_mad`);
    cat.im.setScale(HELD / TEX).setDepth(26).setFlipX(false);
    this.stinky[cat.i] = { x: -999, y: -999 };
    const from = { x: cat.im.x, y: cat.im.y - 70 };
    this.holdAt = from;
    SOUNDS.hiss();
    this.host.word('catbath_hiss', from.x + 20, from.y - 80);
    const grip = bodyOf('choke').grip, to = p.at(grip[0], grip[1]);
    this.after(0.3, () => {
      p.set('choke', 'yell');
      s.tweens.add({ targets: this.holdAt, x: to.x, y: to.y, duration: 220, ease: 'Quad.out' });
      this.say(p.mouth, GOT_YOU[this.n], 1.3, -150, -60, 21);
    });
    this.after(0.75, () => {
      this.step = 'choke';
      this.beat = `choke${this.n}`;
      this.fight = 1;
      this.clawIn = 0.6;
      this.showBar('FIGHT LEFT', 1);
      this.words('TAP FAST TO CHOKE IT OUT!');
      this.botIn = 0.2;
    });
  }

  /** A squeeze. */
  private squeeze(): void {
    const s = this.scene, cat = this.held!;
    this.fight = Math.max(0, this.fight - DECAY[this.n]);
    SOUNDS.gurk(Math.round((1 - this.fight) * 10));
    this.pappy!.face('yell');
    s.tweens.add({ targets: cat.im, scaleX: (HELD * 0.86) / TEX, scaleY: (HELD * 1.1) / TEX, duration: 50, yoyo: true });
    if (this.fight <= 0) this.knockedOut();
  }

  /** ...and it stops fighting. */
  private knockedOut(): void {
    const cat = this.held!, p = this.pappy!;
    this.step = 'between';
    this.beat = `out${this.n}`;
    this.caption?.destroy();
    this.hideBar();
    applyArt(cat.im, `catbath_cat${cat.i}_out`);
    cat.im.setScale(HELD / TEX).setRotation(0);
    SOUNDS.conk();
    this.host.word('catbath_out', this.holdAt.x + 10, this.holdAt.y - 120);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      this.puff('star', this.holdAt.x + Math.cos(a) * 30, this.holdAt.y - 40 + Math.sin(a) * 10, Math.cos(a) * 60, -40 + Math.sin(a) * 30, 0.9, 40, 40);
    }
    p.face('smug');
    this.say(p.mouth, OUT[this.n], 1.1, -150, -60, 20);
    this.after(1.2, () => this.dunk());
  }

  /** Into the sink with it, and up against the washboard. */
  private dunk(): void {
    const s = this.scene, cat = this.held!, p = this.pappy!;
    this.step = 'dunk';
    this.beat = `dunk${this.n}`;
    p.set('scrub', 'angry');
    cat.im.setDepth(19.5);
    s.tweens.add({ targets: this.holdAt, x: this.sx, y: RIM + 30, duration: 200, ease: 'Quad.in' });
    this.after(0.2, () => {
      SOUNDS.splash();
      this.host.word('catbath_splash', this.sx + 40, RIM - 150);
      for (let i = 0; i < 26; i++) this.puff('catbath_bubble', this.sx + (Math.random() - 0.5) * 160, RIM - 30, (Math.random() - 0.5) * 900, -300 - Math.random() * 500, 1.4, 700, 45, 0.6 + Math.random() * 1.2);
      for (let i = 0; i < 14; i++) this.puff('catbath_drop', this.sx + (Math.random() - 0.5) * 120, RIM - 20, (Math.random() - 0.5) * 600, -250 - Math.random() * 350, 1.0, 1100, 45, 1.4);
      // (soaked: held by the middle on a photo, so that the top of it is up out of the suds)
      applyArt(cat.im, `catbath_cat${cat.i}_${this.photo ? 'soak' : 'wet'}`);
      cat.im.setScale(HELD / TEX);
      s.cameras.main.shake(100, 0.004);
    });
    // dunked again, for good measure
    this.after(0.5, () => s.tweens.add({ targets: this.holdAt, y: RIM - 30, duration: 140, yoyo: true, repeat: 1, ease: 'Sine.inOut' }));
    this.after(1.2, () => {
      this.scrubY = this.range[1];
      s.tweens.add({ targets: this.holdAt, y: this.scrubY, duration: 200, ease: 'Quad.out' });
    });
    this.after(1.45, () => {
      this.step = 'scrub';
      this.beat = `scrub${this.n}`;
      this.strokes = 0;
      this.dir = 0;
      this.travel = 0;
      this.showBar('DIRT LEFT', 1);
      this.words('SCRUB IT ON THE WASHBOARD! UP AND DOWN!');
      this.arrow = this.keep(img(s, this.sx - 110, (this.range[0] + this.range[1]) / 2 + 40, 'catbath_arrow').setDepth(60));
      s.tweens.add({ targets: this.arrow, scaleY: { from: 0.85 / TEX, to: 1.05 / TEX }, duration: 300, yoyo: true, repeat: -1 });
      this.botIn = 0.2;
    });
  }

  /** The cat to here on the washboard (where the finger is). Going back the other way after going
   *  far enough one way is another scrub. */
  private scrubTo(y: number): void {
    const [top, foot] = this.range, to = Phaser.Math.Clamp(y, top, foot), dy = to - this.scrubY;
    if (Math.abs(dy) < 0.5) return;
    const d = Math.sign(dy);
    if (d !== this.dir) {
      if (this.travel >= STROKE) this.stroke();
      this.dir = d;
      this.travel = 0;
    }
    this.travel += Math.abs(dy);
    this.scrubY = to;
  }

  /** A key (or the bot): once to the other end of the board. */
  private scrubOnce(): void {
    const [top, foot] = this.range, mid = (top + foot) / 2;
    this.dir = this.scrubY > mid ? 1 : -1;
    this.travel = 0;
    this.scrubTo(this.scrubY > mid ? top : foot);
    this.travel = STROKE;
    this.stroke();
  }

  private stroke(): void {
    if (this.step !== 'scrub') return;
    this.strokes++;
    SOUNDS.scrub();
    const at = { x: this.sx, y: this.scrubY + 30 };
    for (let i = 0; i < 5; i++) this.puff('catbath_bubble', at.x + (Math.random() - 0.5) * 90, at.y, (Math.random() - 0.5) * 500, -200 - Math.random() * 300, 1.1, 600, 45, 0.5 + Math.random());
    if (this.strokes % 2 === 1) this.host.word('catbath_scrub', this.sx + (this.strokes % 4 === 1 ? 120 : -120), this.scrubY - 40);
    this.pappy!.face(this.strokes % 2 ? 'yell' : 'angry');
    this.showBar('DIRT LEFT', 1 - this.strokes / STROKES[this.n]);
    if (this.strokes >= STROKES[this.n]) this.rinse();
  }

  /** The sprayer, over it, and off again. */
  private rinse(): void {
    const s = this.scene, sp = this.sprayer!, home = { x: sp.x, y: sp.y };
    this.step = 'rinse';
    this.beat = `rinse${this.n}`;
    this.caption?.destroy();
    this.hideBar();
    this.arrow?.destroy();
    this.pappy!.face('smug');
    s.tweens.add({ targets: sp, x: this.sx + 110, y: this.scrubY + 10, angle: -60, duration: 220, ease: 'Quad.out' });
    this.after(0.25, () => {
      SOUNDS.spray(0.7);
      for (let i = 0; i < 24; i++) this.after(i * 0.03, () => this.puff('catbath_drop', this.sx + 80, this.scrubY - 6, -300 - Math.random() * 200, (Math.random() - 0.3) * 200, 0.5, 600, 45, 1.2));
    });
    this.after(1.05, () => s.tweens.add({ targets: sp, x: home.x, y: home.y, angle: 0, duration: 240, ease: 'Quad.in' }));
    this.after(1.2, () => this.wring());
  }

  /** Out of the sink, and wrung out like a towel. */
  private wring(): void {
    const s = this.scene, cat = this.held!, p = this.pappy!;
    this.step = 'wring';
    this.beat = `wring${this.n}`;
    p.set('wring', 'angry');
    applyArt(cat.im, `catbath_cat${cat.i}_wrung`);
    // (it lies along the line through his two fists)
    const g = bodyOf('wring'), to = p.at(g.grip[0], g.grip[1]);
    cat.im.setScale(1.1 / TEX).setDepth(26).setFlipY(false).setRotation(g.turn);
    s.tweens.add({ targets: this.holdAt, x: to.x, y: to.y, duration: 220, ease: 'Quad.out' });
    this.quarters = 0;
    this.lastAng = null;
    this.spun = 0;
    this.after(0.3, () => {
      this.showBar('WATER LEFT', 1);
      this.words('WRING IT OUT! ROUND AND ROUND!');
      this.spinner = this.keep(img(s, to.x, to.y, 'catbath_spin').setDepth(60).setAlpha(0.85));
      s.tweens.add({ targets: this.spinner, angle: 360, duration: 1600, repeat: -1 });
      this.botIn = 0.2;
    });
  }

  /** The finger has gone round to here: every quarter of a turn is a quarter of a twist. */
  private twistTo(ang: number, far: number): void {
    if (far < 28) return;
    if (this.lastAng !== null) {
      let d = ang - this.lastAng;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      this.spun += Math.abs(d);
      while (this.spun >= Math.PI / 2 && this.step === 'wring') {
        this.spun -= Math.PI / 2;
        this.quarter();
      }
    }
    this.lastAng = ang;
  }

  private quarter(): void {
    const cat = this.held!, need = TURNS[this.n] * 4;
    this.quarters++;
    const k = this.quarters / need;
    SOUNDS.twist(this.quarters);
    cat.im.setFlipY(!cat.im.flipY);
    cat.im.setScale(((1.1 + k * 0.15) / TEX), ((1.1 - k * 0.45) / TEX));
    for (let i = 0; i < 3; i++) this.puff('catbath_drop', this.holdAt.x + (Math.random() - 0.5) * 140, this.holdAt.y + 12, (Math.random() - 0.5) * 60, 60 + Math.random() * 80, 0.8, 900, 45, 1.3);
    if (this.quarters % 2 === 0) this.after(0.15, () => SOUNDS.drip());
    if (this.quarters % 4 === 0) this.host.word('catbath_twist', this.holdAt.x + 150, this.holdAt.y - 70);
    this.pappy!.face(this.quarters % 2 ? 'yell' : 'angry');
    this.showBar('WATER LEFT', 1 - k);
    if (this.quarters >= need) this.wrung();
  }

  /** Wrung out: up to the line with it. */
  private wrung(): void {
    const cat = this.held!, p = this.pappy!;
    this.step = 'hang';
    this.beat = `wrung${this.n}`;
    this.hideBar();
    this.spinner?.destroy();
    this.spinner = undefined;
    p.set('choke', 'smug');
    applyArt(cat.im, `catbath_cat${cat.i}_wet`);
    // (held out over the sink, dripping into it: what hangs below the rim is behind the counter)
    cat.im.setScale(HELD / TEX).setFlipY(false).setDepth(19.5).setRotation(0);
    const grip = bodyOf('choke').grip, to = p.at(grip[0], grip[1]);
    this.scene.tweens.add({ targets: this.holdAt, x: to.x, y: to.y, duration: 200 });
    SOUNDS.mew();
    this.words('TAP TO HANG IT UP TO DRY!');
    this.botIn = this.host.auto === 'clumsy' ? 1.3 : 0.5;
  }

  /** On the line with it, and a kiss. */
  private hangIt(): void {
    const s = this.scene, cat = this.held!, p = this.pappy!, spot = { x: this.cx + SPOTS[this.n], y: LINE };
    // he stands beside where it goes, to see it while he kisses it
    const side = spot.x + 116 < view.W - 60 ? 1 : -1, by = spot.x + side * 116;
    this.step = 'kiss';
    this.beat = `hang${this.n}`;
    this.caption?.destroy();
    p.set('hang', 'smug');
    s.tweens.add({ targets: p.box, x: by, duration: 420, ease: 'Sine.inOut' });
    this.after(0.45, () => {
      // up it goes, and two pegs
      s.tweens.add({ targets: this.holdAt, x: spot.x, y: spot.y + 6, duration: 180, ease: 'Quad.out' });
      cat.im.setDepth(4);
    });
    this.after(0.65, () => {
      cat.where = 'line';
      this.held = undefined;
      cat.im.setPosition(spot.x, spot.y + 6);
      cat.pegs = [-16, 16].map((dx, k) => {
        const peg = this.keep(img(s, spot.x + dx, spot.y, 'catbath_peg').setDepth(5));
        this.after(k * 0.12, () => SOUNDS.peg());
        return peg;
      });
      p.set('stand', 'pucker');
    });
    this.after(0.9, () => {
      // and a kiss for it
      this.beat = `kiss${this.n}`;
      // (a photo of him stops at his thighs: he only stands up so far, or the foot of it shows)
      s.tweens.add({ targets: p.box, y: FEET - (this.photo ? 22 : 54), angle: -side * 4, duration: 160, yoyo: true, hold: 260, ease: 'Quad.out' });
    });
    this.after(1.08, () => {
      SOUNDS.kiss();
      const at = { x: spot.x + side * 34, y: spot.y + 80 };
      this.host.word('catbath_mwah', spot.x - side * 70, at.y + 10);
      for (let i = 0; i < 4; i++) this.puff('heart', at.x, at.y + 30, (Math.random() - 0.5) * 140, -60 - Math.random() * 80, 1.1, -20, 40);
    });
    this.after(1.7, () => {
      p.face('smile');
      s.tweens.add({ targets: p.box, x: this.px, duration: 420, ease: 'Sine.inOut' });
    });
    this.after(2.2, () => {
      this.n++;
      if (this.n < this.cats.length) this.grab();
      else this.allClean();
    });
  }

  // ==== all clean ==================================================================================

  private allClean(): void {
    const s = this.scene, p = this.pappy!;
    this.stage = 'clean';
    this.step = 'between';
    this.beat = 'drying';
    p.set('stand', 'smile');
    // dry, all three of them: every hair on end, and not pleased about it
    this.cats.forEach((cat, k) => this.after(0.4 + k * 0.35, () => {
      applyArt(cat.im, `catbath_cat${cat.i}_dry`);
      cat.im.setScale(1.15 / TEX).setY(LINE + 2);
      SOUNDS.poof();
      for (let i = 0; i < 6; i++) this.puff('puff', cat.im.x, cat.im.y + 60, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 200, 0.6, 0, 40);
    }));
    this.after(1.6, () => {
      this.beat = 'clean';
      p.face('laugh');
      sound.twinkle();
      sound.win();
      const big = this.keep(img(s, this.cx, 396, 'word_catbath_clean').setDepth(140));
      const full = big.scale * 0.82;
      big.setScale(full * 0.2).setRotation(-0.08);
      s.tweens.add({ targets: big, scale: full, duration: 260, ease: 'Back.out' });
      s.tweens.add({ targets: big, angle: { from: -6, to: -2 }, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.rain();
    });
    this.after(4.4, () => {
      this.stage = 'done';
      this.host.finish(true);
    });
  }

  /** Sparkles and suds, all over the page. */
  private rain(): void {
    if (this.stage !== 'clean') return;
    const W = view.W;
    for (let i = 0; i < 3; i++) {
      this.puff(Math.random() < 0.5 ? 'sparkle' : 'catbath_bubble', Math.random() * W, -20, (Math.random() - 0.5) * 60, 120 + Math.random() * 120, 3.2, 30, 135, 0.5 + Math.random() * 0.9);
    }
    this.after(0.08, () => this.rain());
  }

  // ==== fingers =====================================================================================

  press(at: Point): void {
    const pointer = this.scene.input.activePointer, byFinger = !!pointer?.isDown;
    if (this.step === 'choke') this.squeeze();
    else if (this.step === 'scrub') {
      if (byFinger) {
        this.finger = true;
        this.lastY = at.y;
      } else this.scrubOnce();
    } else if (this.step === 'wring') {
      if (byFinger) {
        this.finger = true;
        this.lastAng = null;
      } else {
        this.quarter();
        if (this.step === 'wring') this.quarter();
      }
    } else if (this.step === 'hang') this.hangIt();
  }

  release(): void {
    this.finger = false;
    this.lastAng = null;
  }

  // ==== odds and ends ===============================================================================

  private keep<T extends Thing>(thing: T): T {
    this.shot.push(thing);
    return thing;
  }

  /** Keep hold of whatever `lay` puts on the page (a place laid with one call, which does not hand it back). */
  private capture(lay: () => void): void {
    const before = new Set(this.scene.children.list);
    lay();
    for (const o of this.scene.children.list) if (!before.has(o)) this.shot.push(o);
  }

  private clear(): void {
    const tw = this.scene.tweens;
    this.hush();
    for (const b of this.bits) b.im.destroy();
    this.bits = [];
    for (const o of this.shot) {
      tw.killTweensOf(o);
      o.destroy();
    }
    this.shot = [];
    this.flies = [];
    this.caption?.destroy();
    this.caption = undefined;
    this.later = [];
    this.cues = [];
    this.scene.cameras.main.resetFX();
  }

  private blackout(then: () => void): void {
    const s = this.scene;
    const black = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x000000).setDepth(150).setAlpha(0);
    s.tweens.add({
      targets: black, alpha: 1, duration: 260,
      onComplete: () => {
        then();
        s.tweens.add({ targets: black, alpha: 0, duration: 300, delay: 80, onComplete: () => black.destroy() });
      },
    });
  }

  private hop(target: Image, high: number): void {
    const y = target.y;
    this.scene.tweens.add({ targets: target, y: y - high, duration: 120, yoyo: true, ease: 'Quad.out', onComplete: () => target.setY(y) });
  }

  private after(secs: number, run: () => void): void {
    this.later.push({ left: secs, run });
  }

  private script(steps: [number, () => void][]): void {
    this.t = 0;
    this.cues = [];
    let at = 0;
    for (const [wait, run] of steps) {
      at += wait;
      this.cues.push({ at, run });
    }
  }

  private say(mouth: Point, text: string, secs: number, dx: number, dy: number, size = 19): void {
    const box = bubble(this.scene, Phaser.Math.Clamp(mouth.x + dx, 130, view.W - 130), Math.max(110, mouth.y + dy), text, mouth, size).setDepth(120);
    this.said.push({ box, left: secs });
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  private words(text: string): void {
    this.caption?.destroy();
    let size = 32;
    const words = label(this.scene, this.cx, 510, text, size, '#f6c430').setDepth(130);
    while (words.width > view.W - 30 && size > 18) words.setFontSize(--size);
    words.setScale(1.3);
    this.scene.tweens.add({ targets: words, scale: 1, duration: 150, ease: 'Back.out' });
    this.caption = words;
  }

  /** How far along the cat is, along the top. */
  private showBar(name: string, full: number): void {
    this.barFull = Phaser.Math.Clamp(full, 0, 1);
    this.barName?.setText(name).setVisible(true);
    const g = this.bar!, x = this.cx - 140, y = 50, w = 280;
    g.clear().setVisible(true);
    g.fillStyle(0x18100a, 0.75);
    g.fillRoundedRect(x - 4, y - 4, w + 8, 26, 8);
    g.fillStyle(0xfbf6ea, 1);
    g.fillRoundedRect(x, y, w, 18, 6);
    if (this.barFull > 0) {
      g.fillStyle(name.startsWith('FIGHT') ? 0xd8523f : name.startsWith('DIRT') ? 0x8a5a2a : 0x4f8fd8, 1);
      g.fillRoundedRect(x, y, Math.max(12, w * this.barFull), 18, 6);
    }
  }

  private hideBar(): void {
    this.bar?.setVisible(false);
    this.barName?.setVisible(false);
  }

  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, depth = 30, size = 1): void {
    const im = img(this.scene, x, y, key).setDepth(depth);
    im.setScale(im.scale * size);
    this.bits.push({ im, vx, vy, spin: key === 'heart' || key === 'catbath_drop' ? 0 : (Math.random() - 0.5) * 6, life, drop });
  }

  update(dt: number): void {
    if (this.stage === 'done') return;
    const s = this.scene;
    this.t += dt;
    this.clock += dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    for (const l of this.later) l.left -= dt;
    const due = this.later.filter((l) => l.left <= 0);
    this.later = this.later.filter((l) => l.left > 0);
    for (const l of due) l.run();

    // the smell, and the flies
    for (const f of this.flies) {
      f.ph += dt * 5;
      f.im.setPosition(f.at.x + Math.cos(f.ph) * f.r, f.at.y + Math.sin(f.ph * 1.7) * f.r * 0.5).setFlipX(Math.sin(f.ph) > 0);
    }
    this.stinkIn -= dt;
    if (this.stinkIn <= 0) {
      this.stinkIn = 0.35;
      const at = this.stinky[Math.floor(Math.random() * this.stinky.length)];
      if (at && at.x > -900) this.puff('catbath_stink', at.x + (Math.random() - 0.5) * 40, at.y, (Math.random() - 0.5) * 20, -50, 1.3, 0, 29);
    }

    // a finger, going up and down the washboard, or round and round
    if (this.finger) {
      const p = s.input.activePointer, w = s.cameras.main.getWorldPoint(p.x, p.y);
      if (this.step === 'scrub') this.scrubTo(this.scrubY + (w.y - this.lastY));
      if (this.step === 'wring') this.twistTo(Math.atan2(w.y - this.holdAt.y, w.x - this.holdAt.x), Math.hypot(w.x - this.holdAt.x, w.y - this.holdAt.y));
      this.lastY = w.y;
    }

    // the cat that is being bathed
    const cat = this.held;
    if (this.step === 'choke' && cat) {
      this.fight = Math.min(1, this.fight + REGEN * dt);
      this.showBar('FIGHT LEFT', this.fight);
      cat.im.setRotation(Math.sin(this.clock * 31) * 0.18 * this.fight);
      this.pappy!.box.setX(this.px + Math.sin(this.clock * 23) * 4 * this.fight);
      this.clawIn -= dt;
      if (this.clawIn <= 0 && this.fight > 0.2) this.claw();
    }
    if (this.step === 'scrub') {
      this.holdAt.y = this.scrubY;
      // (on paper he bobs with it; a photo's fists are on it, so he goes all the way up and down with it)
      const g = this.photo ? FEET + bodyOf('scrub').grip[1] * AT_SINK : this.range[1];
      this.pappy!.box.setY(FEET + (this.scrubY - g) * (this.photo ? 1 : 0.45));
    } else if (this.stage === 'sink' && this.step !== 'kiss' && this.pappy && !s.tweens.isTweening(this.pappy.box)) this.pappy.box.setY(FEET);
    if (cat && cat.where === 'held') cat.im.setPosition(this.holdAt.x, this.holdAt.y);
    this.placeHands();

    for (const b of this.said) {
      b.left -= dt;
      if (b.left <= 0) b.box.destroy();
    }
    this.said = this.said.filter((b) => b.left > 0);
    for (const b of this.bits) {
      b.life -= dt;
      b.vy += b.drop * dt;
      b.im.setPosition(b.im.x + b.vx * dt, b.im.y + b.vy * dt).setRotation(b.im.rotation + b.spin * dt).setAlpha(Math.min(1, b.life * 3));
      if (b.life <= 0) b.im.destroy();
    }
    this.bits = this.bits.filter((b) => b.life > 0);
    for (const sc of this.scratches) sc.setAlpha(Math.max(0, sc.alpha - dt * 0.25));
  }

  /** It gets its claws into him. */
  private claw(): void {
    const s = this.scene, p = this.pappy!;
    this.clawIn = CLAWS * (0.7 + Math.random() * 0.6);
    SOUNDS.scratch();
    if (Math.random() < 0.5) SOUNDS.yowl(1 + this.n * 0.1);
    else SOUNDS.hiss();
    const e = p.eyes, mark = this.keep(img(s, e.x + (Math.random() - 0.5) * 60, e.y + 10 + Math.random() * 40, 'catbath_scratch').setDepth(11).setRotation((Math.random() - 0.5) * 0.8));
    this.scratches.push(mark);
    this.host.word(Math.random() < 0.5 ? 'catbath_rawr' : 'yeowch', this.holdAt.x + 70, this.holdAt.y - 110);
    p.face('ouch');
    this.after(0.3, () => {
      if (this.step === 'choke') p.face('angry');
    });
  }

  /** His hands go round whatever he is holding. */
  private placeHands(): void {
    const cat = this.held, p = this.pappy;
    if (!p || !this.hands.length) return;
    // (not while it is under the water: his hands are in there with it)
    const show = this.stage === 'sink' && !!cat && cat.where === 'held' && this.step !== 'grab' && this.holdAt.y < RIM - 10;
    for (const h of this.hands) h.setVisible(show);
    if (!show) return;
    if (this.photo) {
      // his own fists, cut from the photo of him in this pose, where they are on it
      const pose = FISTS.includes(p.pose) ? p.pose : 'choke', b = bodyOf(pose);
      b.hands.forEach(([hx, hy], k) => {
        const h = this.hands[k], at = p.at(hx, hy);
        if (h.texture.key !== `catbath_fist_${pose}_${k}`) applyArt(h, `catbath_fist_${pose}_${k}`);
        h.setScale(AT_SINK / TEX).setPosition(at.x, at.y);
      });
      return;
    }
    const { x, y } = this.holdAt;
    const spots: [V, V] = this.step === 'wring' ? [[-104, 0], [104, 0]] : this.step === 'scrub' || this.step === 'dunk' || this.step === 'rinse' ? [[-26, 26], [26, 26]] : [[-17, 6], [17, 6]];
    spots.forEach(([dx, dy], k) => this.hands[k].setPosition(x + dx, y + dy));
  }

  timeUp(): boolean {
    return true;
  }

  bot(dt: number): void {
    const clumsy = this.host.auto === 'clumsy';
    this.botIn -= dt;
    if (this.step === 'choke' && this.botIn <= 0) {
      this.botIn = clumsy ? 0.3 : 0.13;
      this.squeeze();
    } else if (this.step === 'scrub' && this.botIn <= 0) {
      this.botIn = clumsy ? 0.42 : 0.2;
      this.scrubOnce();
    } else if (this.step === 'wring' && this.botIn <= 0) {
      // round and round, as a finger would
      this.botAng += dt * (clumsy ? 4.5 : 10);
      this.twistTo(this.botAng, 80);
    } else if (this.step === 'hang' && this.botIn <= 0) this.hangIt();
  }
}
