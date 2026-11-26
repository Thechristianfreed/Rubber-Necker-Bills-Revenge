import Phaser from 'phaser';
import { DEPTH, H, MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { ART, FROM, applyArt, img } from '../../art/sticker';
import { HEAD_STYLES } from '../../art/textures';
import { sound } from '../../audio/sound';
import { BAT_YARD } from '../../data/batbodies';
import { bubble } from '../../ui/bubble';
import { label, marker, written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { DOORSTEP, FLOOR as YARD_FLOOR, layYard, raiseHouse } from '../shared/yard';
import { METER, ZONE } from './art';
import { GOLF_BODIES } from './cuts';
import { Figure } from './figures';
import { OUTFITS, TRAIL, WEARS } from './poses';
import { jingle, noSale, ping, sale, smash } from './sounds';

type Image = Phaser.GameObjects.Image;
type Text = Phaser.GameObjects.Text;
type Box = Phaser.GameObjects.Container;
type Thing = Phaser.GameObjects.GameObject;

// ---- the first day: the tee -----------------------------------------------------------------

/** Where the grass is underfoot at the tee. */
const TEE = 436;
/** The two clubs in the bag, and how far down the page the buttons for them are. */
const CLUBS = [{ name: 'DRIVER', key: 'golf_club_driver' }, { name: '7 IRON', key: 'golf_club_iron' }];
const PLATES = 506;
/** Where the top of each whole-place photo goes on the page (each is 660 tall): the tee's so that
 *  its markers are just behind where they stand, the trail's so that its path is under the feet of
 *  whoever is on it, the lot's so that its sidewalk starts at the foot of the shop. */
const TEE_PHOTO = -87;
const TRAIL_PHOTO = -38;
const LOT_PHOTO = -66;
/** The swing meter fills in this long, as a breath does on Mom's workout tape, and the same
 *  half a second past full is too long. The sweet spot is half the size of the green there
 *  (ZONE, in art.ts), and is somewhere different every time: anywhere between these. */
const FILL = 1.3;
const TOO_LONG = 0.5;
const SWEET = [0.22, 0.86];
/** Where the glass of the window is on the back of the house, from the doorstep, and how
 *  big: on the photo of the house, and on the paper one that stands in for it. */
const WINDOW = { photo: { x: -186, y: -228, w: 82, h: 118 }, paper: { x: 154, y: -212, w: 76, h: 76 } };

// ---- the next day: the trail ----------------------------------------------------------------

/** What a window costs, what a bottle of water costs, and how long there is to sell them. */
const NEED = 10;
const PRICE = 1;
const SELL_SECONDS = 22;
/** Where feet go on the path, and where the boys' are, in front of it. */
const PATH = 446;
const STAND = 528;
/** Somebody comes along about this often. */
const EVERY = 0.95;

type Stage = 'tee' | 'yard' | 'after' | 'card' | 'trail' | 'store';
type Phase = 'setup' | 'meter' | 'story' | 'sell' | 'done';

/** Somebody out on the trail. */
interface Person {
  box: Box;
  body: Image;
  head: Image;
  /** The bubble over the head of somebody who wants a drink, and the bottle in the hand of somebody who has one. */
  want?: Image;
  drink?: Image;
  /** Which head, which outfit, and which of the two steps they are on. */
  n: number;
  outfit: number;
  runs: boolean;
  foot: number;
  step: number;
  way: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  thirsty: boolean;
  sold: boolean;
  sweatIn: number;
  /** How long since they last said no. */
  quiet: number;
  /** Off the end of the trail, and cleared away. */
  gone: boolean;
}

/** Something thrown from one place to another: a bottle to whoever bought it, their dollar to the jar. */
interface Throw { im: Image; from: Point; to: () => Point; t: number; secs: number; arc: number; done?: () => void }

/** FORE! Two days, one after the other.
 *
 *  The first: Bill takes Chad, who is five, to play golf for the first time. The
 *  player is Chad on the first tee, and is given everything a golf video game
 *  gives: two clubs to choose from, the wind, where on the ball to hit it, and a
 *  swing meter (hold to fill it, let go in the green: as the breathing goes on
 *  Mom's workout tape, with a sweet spot half the size and never in the same
 *  place twice). None of it matters. It says NICE SHOT! or SHANKED, and the ball
 *  goes through the window of a house beside the course either way.
 *
 *  The next day: Shane, who is the responsible one (the Wally to Chad's Beaver),
 *  has decided that the two of them will sell bottled water at the entrance to
 *  the Iron Horse Trail in Danville until there is enough to pay for the window.
 *  That part can be won and lost: tap the thirsty ones as they go by, ten of
 *  them before the time runs out, and it ends at Windows R Us.
 *
 *  It waits for the player at the tee, so the scene keeps no clock for it: the
 *  trail has one of its own. */
export class GolfMini extends Mini {
  readonly title = 'FORE!';
  readonly prompt = 'TEE OFF!';
  readonly seconds = 120;
  readonly timed = false;

  private stage: Stage = 'tee';
  private phase: Phase = 'setup';
  /** Seconds since the last script began, and what it has still to do. */
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  /** Seconds since the game began. */
  private clock = 0;
  private said: { box: Box; left: number }[] = [];
  private bits: { im: Image; vx: number; vy: number; spin: number; life: number; drop: number }[] = [];
  private flying: Throw[] = [];
  /** Everything that was on the page before this game put anything there: the scene's own. */
  private base = new Set<Thing>();

  private chad!: Figure;
  private bill!: Figure;
  private shane!: Figure;

  // the tee
  private club = 0;
  private aim = { x: 0, y: 0 };
  private wind = { dir: 0, mph: 0 };
  private ui: Thing[] = [];
  private plates: { x: number; plate: Image }[] = [];
  private swingAt: Point = { x: 0, y: 0 };
  private swingBtn?: Image;
  private ballAt: Point = { x: 0, y: 0 };
  private aimMark?: Image;
  private aimText?: Text;
  private arrow?: Image;
  private teeBall?: Image;
  /** How full the meter is (1 is full), whether a finger is down, where the sweet spot starts, and how it went. */
  private air = 0;
  private holding = false;
  private zone0 = 0;
  private nice = false;
  private fill?: Image;
  private ticked = 0;
  private note?: Text;
  private noteTape?: Image;
  /** The window has gone (the test that photographs it waits for this). */
  smashed = false;

  // the trail
  private people: Person[] = [];
  private spawnIn = 0;
  /** How many have gone by in a row who did not want one. */
  private dry = 0;
  private fund = 0;
  private left = SELL_SECONDS;
  private jar?: Image;
  private cooler: Point = { x: 0, y: 0 };
  private fundText?: Text;
  private fundTape?: Image;
  private bar?: Phaser.GameObjects.Graphics;
  private hawkIn = 0;
  private tossed = 0;

  private botIn = 0.6;
  private botStep = 0;
  /** The sounds that are this game's own, where the test that measures them can reach them (tools/test/listen.cjs). */
  readonly sounds = { ping, smash, jingle, noSale, sale };

  private get cx(): number {
    return view.W / 2;
  }

  /** Where Chad stands at the tee. */
  private get chadX(): number {
    return Math.max(330, view.W * 0.36);
  }

  build(): void {
    this.base = new Set(this.scene.children.list);
    this.wind = { dir: Math.floor(Math.random() * 8) * (Math.PI / 4), mph: 3 + Math.floor(Math.random() * 15) };
    this.zone0 = SWEET[0] + Math.random() * (SWEET[1] - SWEET[0]);
    this.teeScene(false);
    this.controls();
    this.script([
      [0.5, () => { this.bill.face('talking'); this.say(this.bill, 'KEEP YOUR EYE ON THE BALL.', 2.2, 120, -86); }],
      [2.2, () => this.bill.face('smile')],
    ]);
    this.phase = 'setup';
  }

  // ---- one thing after another ----------------------------------------------------------------

  /** Do these one after another, each so many seconds after the one before. */
  private script(steps: [number, () => void][]): void {
    this.t = 0;
    this.cues = [];
    let at = 0;
    for (const [wait, run] of steps) {
      at += wait;
      this.cues.push({ at, run });
    }
  }

  /** Cut: clear away everything this game has put on the page, ready for the next place. */
  private cut(stage: Stage): void {
    const s = this.scene;
    s.tweens.killTweensOf(this);
    for (const o of [...s.children.list]) {
      if (this.base.has(o)) continue;
      s.tweens.killTweensOf(o);
      o.destroy();
    }
    this.said = [];
    this.bits = [];
    this.flying = [];
    this.people = [];
    this.ui = [];
    s.cameras.main.resetFX();
    this.stage = stage;
  }

  /** A strip that runs the whole width of the page, and a bit over at each side. */
  private strip(key: string, y: number, tall: number, depth: number): void {
    const d = ART[key].tex ?? TEX;
    this.scene.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * d, tall * d, key).setOrigin(0, 0).setScale(1 / d).setDepth(depth);
  }

  /** A whole place that is one photo (`golf_place_tee`, `golf_place_trail`, `golf_place_lot`): laid behind everything,
   *  with its top at `top` on the page, and its middle in the middle of the page or its right-hand
   *  edge at the edge of it. False if the photo is not there, and the place has to be cut from paper. */
  private place(key: string, top: number, hold: 'middle' | 'right'): boolean {
    const s = this.scene;
    if (!s.textures.exists(key)) return false;
    const wide = ART[key].w, x = hold === 'right' ? view.W + BLEED - wide : view.W / 2 - wide / 2;
    s.add.image(x, top, key).setOrigin(0, 0).setScale(1 / (ART[key].tex ?? TEX)).setDepth(1);
    return true;
  }

  /** The sky: the photo of it from the back yard, over plain blue paper. */
  private sky(): void {
    this.strip('golf_sky', -BLEED, H + BLEED * 2, 0.5);
    if (BAT_YARD && this.scene.textures.exists('yard_sky_photo')) this.strip('yard_sky_photo', BAT_YARD.skyTop, BAT_YARD.skyTall, 1);
  }

  // ---- the first tee ----------------------------------------------------------------------------

  /** The first tee, with the two of them on it: before the shot, or just after it. */
  private teeScene(after: boolean): void {
    const s = this.scene, W = view.W, chadX = this.chadX, billX = chadX - 190;
    // The photo of the first tee is held by its right-hand edge, which is where the houses are;
    // its tee markers come just behind the two of them.
    if (!this.place('golf_place_tee', TEE_PHOTO, 'right')) {
      // ...or all of it cut from paper
      this.sky();
      this.strip('golf_hills', 232, ART.golf_hills.h, 2);
      this.strip('golf_fairway', 352, H - 352 + BLEED, 3);
      const houses = img(s, W * 0.645, 360, 'golf_houses').setDepth(3.2);
      houses.setScale(houses.scale * 0.76);
      img(s, W * 0.775, 384, 'golf_green').setDepth(3.3);
      img(s, W * 0.775 + 8, 382, 'golf_flag').setDepth(3.4);
      img(s, 34, TEE - 14, 'yard_tree').setDepth(4);
      img(s, chadX - 40, TEE + 22, 'golf_teebox').setDepth(6);
    }
    const sign = img(s, chadX + 132, TEE - 22, 'golf_sign').setDepth(5);
    sign.setScale(sign.scale * 0.9);
    img(s, billX - 84, TEE + 6, 'golf_bag').setDepth(9);
    this.bill = new Figure(s, 'bill', after ? 'ohno' : 'stand', after ? 'shocked' : 'smile');
    this.bill.box.setPosition(billX, TEE + 4).setDepth(10);
    this.chad = new Figure(s, 'chad', after ? 'follow' : 'address', after ? 'guilty' : 'smile');
    this.chad.hold(CLUBS[this.club].key);
    this.chad.box.setPosition(chadX, TEE + 10).setDepth(12);
    if (after) return;
    const tee = { x: chadX + 60, y: TEE + 12 };
    img(s, tee.x, tee.y, 'golf_tee').setDepth(11);
    this.teeBall = img(s, tee.x, tee.y - 17, 'golf_ball').setDepth(13);
  }

  /** What a golf video game gives you: the clubs, the wind, where to hit the ball, and SWING. */
  private controls(): void {
    const s = this.scene, W = view.W, gold = '#f6c430';
    const add = <T extends Thing>(o: T): T => { this.ui.push(o); return o; };
    add(label(s, 92 + CLUBS.length * 156 - 2, PLATES, 'PICK A CLUB', 17, gold).setOrigin(0, 0.5).setDepth(91));
    this.plates = CLUBS.map((club, i) => {
      const x = 92 + i * 156;
      const plate = add(img(s, x, PLATES, i === this.club ? 'fight_btn' : 'fight_btn_sad').setDepth(90));
      plate.setScale((plate.scaleX * 148) / ART.fight_btn.w, plate.scaleY * 0.86);
      add(written(s, x, PLATES, club.name, 21).setDepth(91));
      add(img(s, x - 38, PLATES - 33, club.key).setDepth(91));
      return { x, plate };
    });
    // the wind: which way, and how hard
    const dial = { x: W - 304, y: 112 };
    add(img(s, dial.x, dial.y, 'golf_wind').setDepth(90));
    this.arrow = add(img(s, dial.x, dial.y, 'golf_wind_arrow').setDepth(91).setRotation(this.wind.dir));
    add(label(s, dial.x, dial.y + 72, `WIND ${this.wind.mph} MPH`, 17, gold).setDepth(91));
    // the ball, and where on it he means to hit it
    this.ballAt = { x: W - 104, y: 262 };
    add(label(s, this.ballAt.x, this.ballAt.y - 84, 'WHERE TO HIT IT', 17, gold).setDepth(91));
    add(img(s, this.ballAt.x, this.ballAt.y, 'golf_ball_big').setDepth(90));
    this.aimMark = add(img(s, this.ballAt.x, this.ballAt.y, 'golf_aim').setDepth(91));
    this.aimText = add(label(s, this.ballAt.x, this.ballAt.y + 82, '', 16).setDepth(91));
    this.aimAt(0, 0);
    this.swingAt = { x: W - 112, y: 474 };
    this.swingBtn = add(img(s, this.swingAt.x, this.swingAt.y, 'golf_btn_swing').setDepth(90));
    s.tweens.add({ targets: this.swingBtn, scale: this.swingBtn.scale * 1.06, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  private pickClub(i: number): void {
    if (i === this.club) return;
    this.club = i;
    this.plates.forEach((p, k) => {
      const { scaleX, scaleY } = p.plate;
      applyArt(p.plate, k === i ? 'fight_btn' : 'fight_btn_sad');
      p.plate.setScale(scaleX, scaleY);
    });
    this.chad.hold(CLUBS[i].key);
    sound.tick();
  }

  /** Move the mark on the ball (from its middle, in ball-widths), and say what that would do, if anything did. */
  private aimAt(x: number, y: number): void {
    const far = Math.hypot(x, y), k = far > 0.8 ? 0.8 / far : 1;
    this.aim = { x: x * k, y: y * k };
    this.aimMark?.setPosition(this.ballAt.x + this.aim.x * 58, this.ballAt.y + this.aim.y * 58);
    const up = this.aim.y < -0.25 ? 'TOPSPIN' : this.aim.y > 0.25 ? 'BACKSPIN' : '';
    const side = this.aim.x < -0.25 ? 'FADE' : this.aim.x > 0.25 ? 'DRAW' : '';
    this.aimText?.setText(up && side ? `${up} ${side}` : up || side || 'DEAD CENTER');
  }

  /** SWING has been pressed: away with all that, and up with the meter. */
  private startMeter(): void {
    const s = this.scene, W = view.W;
    this.phase = 'meter';
    this.hush();
    this.cues = [];
    this.bill.face('smile');
    sound.tock();
    if (this.swingBtn) s.tweens.killTweensOf(this.swingBtn);
    for (const o of this.ui) s.tweens.add({ targets: o, alpha: 0, duration: 140, onComplete: () => o.destroy() });
    this.ui = [];
    const x = W - 104, y = 250, foot = y + METER.h / 2 - METER.pad, tall = METER.h - METER.pad * 2;
    img(s, x, y, 'golf_meter').setDepth(90);
    img(s, x, foot - this.zone0 * tall, 'golf_zone').setDepth(91);
    this.fill = img(s, x, foot, 'golf_fill').setDepth(92);
    label(s, x, y - METER.h / 2 - 20, 'SWING', 20, '#f6c430').setDepth(91);
    this.noteTape = img(s, this.cx, 506, 'tape_m').setDepth(94);
    this.note = written(s, this.cx, 506, 'HOLD to swing back...  LET GO in the green!', 17).setDepth(95);
    this.noteTape.setScale((this.note.width + 26) / ART.tape_m.w / TEX, 1.15 / TEX);
    this.air = 0;
    this.holding = false;
    this.botIn = 0.5;
  }

  /** He lets fly. Whatever the meter said, it goes the same way. */
  private strike(): void {
    const s = this.scene, W = view.W;
    this.holding = false;
    this.phase = 'story';
    this.nice = this.air >= this.zone0 && this.air <= this.zone0 + ZONE;
    this.chad.box.setRotation(0);
    this.chad.set('follow', 'yell');
    sound.whoosh();
    ping(this.nice);
    this.host.word(this.nice ? 'golf_niceshot' : 'golf_shanked', Math.min(this.chadX + 190, W - 330), 200, true);
    this.note?.destroy();
    this.noteTape?.destroy();
    if (this.teeBall) {
      // off it goes: up, away, and a long way right of where anybody was looking
      s.tweens.add({ targets: this.teeBall, x: this.chadX + 560, y: 30, scale: this.teeBall.scale * 0.45, duration: 620, ease: 'Quad.out' });
      for (let i = 0; i < 5; i++) this.puff('puff', this.teeBall.x + i * 9, this.teeBall.y - i * 7, 30, -20, 0.4, 0, 12, 0.5);
    }
    this.script([
      [0.45, () => { this.bill.face('yell'); this.say(this.bill, 'FORE!!', 0.9, 110, -92, 30); }],
      [0.75, () => this.yardScene()],
    ]);
  }

  // ---- the window -------------------------------------------------------------------------------

  /** The back of a house beside the course (the brothers' own back yard does for it). */
  private yardScene(): void {
    const s = this.scene, W = view.W;
    this.cut('yard');
    layYard(s);
    img(s, 58, YARD_FLOOR - 24, 'yard_tree').setDepth(4);
    const photo = !!FROM.yard_house, glass = photo ? WINDOW.photo : WINDOW.paper;
    const door = Phaser.Math.Clamp(this.cx + (photo ? 150 : -40), 330, W - 170);
    raiseHouse(s, door);
    const win = { x: door + glass.x, y: DOORSTEP + glass.y };
    const ball = img(s, -30, 24, 'golf_ball').setDepth(20);
    ball.setScale(ball.scale * 1.7);
    s.tweens.add({ targets: ball, x: win.x + 3, y: win.y + 8, rotation: 9, duration: 420, ease: 'Sine.in' });
    this.smashed = false;
    this.script([
      [0.42, () => {
        ball.destroy();
        this.smashed = true;
        const hole = img(s, win.x, win.y, 'golf_smash').setDepth(6.5);
        hole.setScale((hole.scaleX * glass.w) / ART.golf_smash.w, (hole.scaleY * glass.h) / ART.golf_smash.h);
        for (let i = 0; i < 22; i++) {
          this.puff('golf_shard', win.x + (Math.random() - 0.5) * glass.w * 0.7, win.y + (Math.random() - 0.5) * glass.h * 0.7,
            (Math.random() - 0.5) * 560, -60 - Math.random() * 330, 1.2, 950, 30, 0.7 + Math.random() * 0.9);
        }
        this.host.word('golf_crash', Math.max(190, win.x - 205), win.y + 90, true);
        s.cameras.main.shake(280, 0.014);
        smash();
        // and the birds leave the tree
        if (s.textures.exists('bird_up')) {
          for (let i = 0; i < 3; i++) {
            const bird = img(s, 50 + i * 26, 150 + i * 22, i % 2 ? 'bird_down' : 'bird_up').setDepth(5).setFlipX(true);
            s.tweens.add({ targets: bird, x: -80 - i * 30, y: 20 + i * 18, duration: 900 + i * 160, ease: 'Quad.in' });
          }
        }
      }],
      [0.75, () => {
        const mouth = { x: door, y: DOORSTEP - 150 };
        this.said.push({ box: bubble(s, Math.min(door + 30, W - 110), 84, 'MY WINDOW!!', mouth, 25), left: 1.7 });
        sound.yelp();
      }],
      [1.9, () => this.afterScene()],
    ]);
  }

  /** Back at the tee, where nobody has moved. */
  private afterScene(): void {
    this.cut('after');
    this.teeScene(true);
    sound.busted();
    this.script([
      [0.9, () => { this.chad.face('talking'); this.say(this.chad, 'DID I WIN?', 1.5, 104, -70, 22); }],
      [1.5, () => { this.chad.face('guilty'); this.bill.face('worried'); }],
      [0.8, () => this.card()],
    ]);
  }

  // ---- the next day -----------------------------------------------------------------------------

  /** A title card, as on an old television programme about two brothers. */
  private card(): void {
    const s = this.scene;
    this.cut('card');
    s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x16131c).setDepth(1);
    if (s.textures.exists('tv_lines')) s.add.tileSprite(this.cx, H / 2, MAX_W + BLEED * 2, H + BLEED * 2, 'tv_lines').setDepth(2).setAlpha(0.5);
    const title = marker(s, this.cx, 214, 'Leave It To Chad', 68).setDepth(3).setRotation(-0.04).setScale(0.8);
    s.tweens.add({ targets: title, scale: 1, duration: 260, ease: 'Back.out' });
    const tape = img(s, this.cx, 330, 'tape_l').setDepth(3).setRotation(0.015);
    const day = written(s, this.cx, 330, 'THE NEXT DAY', 26).setDepth(4).setRotation(0.015);
    tape.setScale(tape.scale * Math.max(0.5, (day.width + 50) / ART.tape_l.w), tape.scale * 1.15);
    jingle();
    this.script([[2.3, () => this.trailScene()]]);
  }

  /** The entrance to the Iron Horse Trail, and a table with a sign on it. */
  private trailScene(): void {
    const s = this.scene, W = view.W, cx = this.cx;
    this.cut('trail');
    // the photo of the trail (its far verge is a little lower down the page than the paper one's)
    const photo = this.place('golf_place_trail', TRAIL_PHOTO, 'middle'), back = photo ? 412 : 398;
    if (!photo) {
      this.sky();
      this.strip('golf_trees', -24, ART.golf_trees.h, 2);
      this.strip('golf_boards', 276, ART.golf_boards.h, 3);
      this.strip('golf_dirt', 372, 26, 4);
      this.strip('golf_path', 396, ART.golf_path.h, 4);
      this.strip('golf_dirt', 476, H - 476 + BLEED, 4);
      for (const x of [W * 0.46, W - 30]) img(s, x, 394, 'yard_bush').setDepth(5);
    }
    img(s, W - 108, photo ? 448 : 440, 'golf_stoppaint').setDepth(4.5);
    img(s, 44, back, 'golf_stopsign').setDepth(6);
    img(s, Math.max(176, W * 0.2), back, 'golf_trailsign').setDepth(6);
    img(s, W - 140, back + 2, 'golf_gate').setDepth(6);
    for (const x of [W - 266, W - 206]) img(s, x, PATH - 4, 'golf_bollard').setDepth(8);
    // the stand: a card table, a cooler, and a jar for the money (the photo of the table is a
    // real one's shape, narrower and taller than the paper one)
    const real = !!FROM.golf_table, top = STAND - (real ? ART.golf_table.h * 0.93 : 83), apart = real ? 126 : 152;
    img(s, cx, STAND, 'golf_table').setDepth(40);
    this.jar = img(s, cx - (real ? 38 : 66), top, 'golf_jar').setDepth(41);
    this.cooler = { x: cx + (real ? 26 : 56), y: top - 30 };
    img(s, this.cooler.x, top + 1, 'golf_cooler').setDepth(41);
    this.shane = new Figure(s, 'shane', 'good', 'calm');
    this.shane.box.setPosition(cx - apart, STAND - 2).setDepth(39);
    this.chad = new Figure(s, 'chad', 'stand', 'worried');
    this.chad.box.setPosition(cx + apart, STAND - 2).setDepth(39);
    this.fund = 0;
    this.phase = 'story';
    this.script([
      [0.5, () => { this.shane.face('talking'); this.say(this.shane, 'GEE, CHAD. WE HAVE TO PAY FOR THAT WINDOW.', 2.1, 30, -104); }],
      [2.2, () => { this.shane.face('calm'); this.chad.face('talking'); this.say(this.chad, 'GEE, SHANE. HOW?', 1.2, -30, -104); }],
      [1.3, () => { this.chad.face('worried'); this.shane.set('laugh', 'smile'); this.say(this.shane, 'WE SELL WATER. A DOLLAR A BOTTLE.', 1.8, 30, -104); }],
      [1.9, () => this.startSelling()],
    ]);
  }

  private startSelling(): void {
    const s = this.scene, cx = this.cx;
    this.hush();
    this.phase = 'sell';
    this.left = SELL_SECONDS;
    this.spawnIn = 0.1;
    this.dry = 2;
    this.shane.set('good', 'smile');
    this.fundTape = img(s, cx, 72, 'tape_l').setDepth(95).setRotation(-0.01);
    this.fundText = written(s, cx, 72, '', 20).setDepth(96).setRotation(-0.01);
    this.bar = s.add.graphics().setDepth(DEPTH.hud);
    this.showFund();
    let size = 52;
    const what = label(s, cx, 190, 'TAP THE THIRSTY ONES!', size, '#f6c430').setDepth(97);
    while (what.width > view.W - 60 && size > 26) what.setFontSize(size -= 4);
    what.setScale(1.4);
    s.tweens.add({ targets: what, scale: 1, duration: 160, ease: 'Back.out' });
    s.tweens.add({ targets: what, alpha: 0, y: 160, duration: 300, delay: 1300, onComplete: () => what.destroy() });
    sound.flick(true);
  }

  private showFund(): void {
    if (!this.fundText || !this.fundTape) return;
    this.fundText.setText(`WINDOW FUND:   $${this.fund * PRICE} of $${NEED * PRICE}`);
    this.fundTape.setScale((this.fundText.width + 44) / ART.tape_l.w / TEX, 1.05 / TEX);
  }

  /** Somebody comes along the trail, from one end or the other. */
  private spawn(): void {
    const s = this.scene, W = view.W;
    const on = new Set(this.people.map((p) => p.n));
    let n = Math.floor(Math.random() * HEAD_STYLES);
    for (let i = 0; i < 8 && on.has(n); i++) n = Math.floor(Math.random() * HEAD_STYLES);
    const outfit = WEARS[n % WEARS.length], runs = OUTFITS[outfit].runs;
    // (never three in a row who have brought their own)
    const thirsty = this.dry >= 2 || Math.random() < (runs ? 0.85 : 0.55);
    this.dry = thirsty ? 0 : this.dry + 1;
    const way = Math.random() < 0.5 ? 1 : -1, near = Math.random() < 0.5;
    const body = img(s, 0, 0, `golf_p${outfit}_${runs ? 'run' : 'walk'}1`);
    // (the photos of people are a little shorter than the paper dolls of them)
    const size = (near ? 0.92 : 0.86) * (FROM[body.texture.key] ? 1.08 : 1);
    const head = img(s, 0, 0, `head${n}${thirsty ? '_dazed' : ''}`);
    const p: Person = {
      box: s.add.container(0, 0, [body, head]).setDepth(near ? 21 : 20), body, head, n, outfit, runs, foot: 0, step: 0, way,
      x: way > 0 ? -90 : W + 90, y: PATH + (near ? 8 : -6), size, speed: W / (runs ? 3.4 + Math.random() * 0.9 : 8 + Math.random() * 2.2),
      thirsty, sold: false, sweatIn: Math.random() * 0.4, quiet: 9, gone: false,
    };
    p.box.setScale(way * size, size);
    if (thirsty) p.want = img(s, 0, 0, 'golf_want').setDepth(30);
    else this.giveDrink(p);
    this.people.push(p);
    this.stride(p);
  }

  /** Where somebody's neck and front hand are in the picture they are on, from the spot they stand
   *  on, and how far their head tips: from the photo of that stride, or from the paper doll of it. */
  private joints(p: Person): { neck: Point; hand: Point; tilt: number } {
    const stride = `${p.runs ? 'run' : 'walk'}${p.foot + 1}`, cut = GOLF_BODIES[`p${p.outfit}_${stride}`];
    if (cut && FROM[`golf_p${p.outfit}_${stride}`]) {
      return { neck: { x: cut.chin[0], y: cut.chin[1] + 5 }, hand: { x: cut.hand[0] - 2, y: cut.hand[1] - 10 }, tilt: cut.tilt };
    }
    const doll = TRAIL[stride];
    return { neck: { x: doll.head[0], y: doll.head[1] + 26 }, hand: { x: doll.hands[1][0] + 3, y: doll.hands[1][1] - 8 }, tilt: doll.tilt };
  }

  /** Which of their two pictures somebody is on, and where that puts their head and their hand. */
  private stride(p: Person): void {
    applyArt(p.body, `golf_p${p.outfit}_${p.runs ? 'run' : 'walk'}${p.foot + 1}`);
    const at = this.joints(p);
    p.head.setPosition(at.neck.x, at.neck.y).setRotation(at.tilt);
    p.drink?.setPosition(at.hand.x, at.hand.y);
  }

  private handOf(p: Person): Point {
    const hand = this.joints(p).hand;
    return { x: p.x + p.way * hand.x * p.size, y: p.y + hand.y * p.size };
  }

  private topOf(p: Person): Point {
    return { x: p.x + p.way * 6, y: p.y - 290 * p.size };
  }

  private giveDrink(p: Person): void {
    p.drink = img(this.scene, 0, 0, 'golf_bottle');
    p.box.add(p.drink);
    this.stride(p);
  }

  /** A tap on the trail: whoever is there, if anybody is. */
  private tap(at: Point): void {
    const under = this.people.filter((p) => Math.abs(at.x - p.x) < 50 * p.size + 12 && at.y > p.y - 330 * p.size && at.y < p.y + 16);
    if (!under.length) return;
    const near = (a: Person, b: Person) => Math.abs(at.x - a.x) - Math.abs(at.x - b.x);
    const buyer = under.filter((p) => p.thirsty && !p.sold).sort(near)[0];
    if (buyer) return this.sell(buyer);
    const other = under.sort(near)[0];
    if (other.quiet < 0.8) return;
    other.quiet = 0;
    const top = this.topOf(other);
    this.host.word('golf_nothanks', Phaser.Math.Clamp(top.x, 80, view.W - 80), Math.max(110, top.y + 30));
    noSale();
  }

  /** One bottle of water, sold: it goes to them, and their dollar comes back. */
  private sell(p: Person): void {
    const s = this.scene;
    p.sold = true;
    p.want?.destroy();
    p.want = undefined;
    applyArt(p.head, `head${p.n}`);
    this.fund++;
    this.showFund();
    sale();
    const top = this.topOf(p);
    this.host.word('golf_sold', Phaser.Math.Clamp(top.x, 70, view.W - 70), Math.max(110, top.y + 20));
    // Shane throws it to them
    this.shane.turn(p.x < this.shane.box.x ? -1 : 1);
    this.shane.set('throw', 'smile');
    this.tossed = 0.3;
    this.flying.push({ im: img(s, this.cooler.x, this.cooler.y, 'golf_bottle').setDepth(60), from: { ...this.cooler }, to: () => this.handOf(p), t: 0, secs: 0.26, arc: 70, done: () => { if (!p.gone) this.giveDrink(p); } });
    const jar = this.jar!;
    this.flying.push({
      im: img(s, top.x, top.y + 60, 'golf_coin').setDepth(60), from: { x: top.x, y: top.y + 60 }, to: () => ({ x: jar.x, y: jar.y - 46 }), t: -0.12, secs: 0.4, arc: 90,
      done: () => s.tweens.add({ targets: jar, scaleY: jar.scaleY * 0.84, duration: 60, yoyo: true }),
    });
    if (this.fund >= NEED) this.soldOut();
  }

  /** Enough for a window. */
  private soldOut(): void {
    this.phase = 'story';
    this.bar?.clear();
    this.script([
      [0.35, () => {
        this.shane.turn(1);
        this.shane.set('laugh', 'laugh');
        this.chad.set('stand', 'laugh');
        this.say(this.shane, "THAT'S A WINDOW!", 1.4, 30, -104, 24);
        sound.win();
      }],
      [1.6, () => this.storeScene()],
    ]);
  }

  /** Time is up, and there is not enough in the jar. */
  private tooSlow(): void {
    this.phase = 'story';
    this.bar?.clear();
    sound.busted();
    for (const p of this.people) { p.want?.destroy(); p.want = undefined; }
    this.script([
      [0.3, () => {
        this.shane.turn(1);
        this.shane.set('good', 'worried');
        this.chad.set('wail', 'cry');
        this.say(this.shane, 'NOT ENOUGH. SAME TIME TOMORROW, CHAD.', 2.3, 30, -104);
      }],
      [2.5, () => { this.phase = 'done'; this.host.finish(false); }],
    ]);
  }

  // ---- Windows R Us -----------------------------------------------------------------------------

  private storeScene(): void {
    const s = this.scene, W = view.W, cx = this.cx, tw = s.tweens;
    this.cut('store');
    if (!this.place('golf_place_lot', LOT_PHOTO, 'middle')) {
      this.sky();
      this.strip('golf_hills', 250, ART.golf_hills.h, 2);
      this.strip('golf_fairway', 388, 60, 2.5);
      this.strip('golf_pavement', 432, H - 432 + BLEED, 3);
    }
    // (the photo of the shop is narrower than the paper one, and its window is in the middle of it)
    const real = !!FROM.golf_store, shop = cx + (real ? 0 : 40), mid = shop - (real ? 44 : 166);
    img(s, shop, 440, 'golf_store').setDepth(5);
    this.shane = new Figure(s, 'shane', 'good', 'smile');
    this.shane.box.setPosition(-70, 486).setDepth(13);
    this.chad = new Figure(s, 'chad', 'stand', 'smile');
    this.chad.box.setPosition(-190, 490).setDepth(12);
    // in they come, with the jar
    for (const [box, x] of [[this.shane.box, mid + 106], [this.chad.box, mid - 106]] as [Box, number][]) {
      tw.add({ targets: box, x, duration: 760, ease: 'Quad.out' });
      tw.add({ targets: box, y: box.y - 9, duration: 95, yoyo: true, repeat: 3 });
    }
    this.script([
      [0.95, () => { this.shane.face('talking'); this.say(this.shane, 'ONE WINDOW, PLEASE.', 1.2, 70, -100); }],
      [1.3, () => {
        this.hush();
        this.shane.set('laugh', 'laugh');
        this.chad.face('laugh');
        const pane = img(s, mid, 336, 'golf_window_new').setDepth(20);
        const full = pane.scale;
        pane.setScale(full * 0.1);
        tw.add({ targets: pane, scale: full, duration: 220, ease: 'Back.out' });
        for (const [dx, dy, k, wait] of [[-44, -58, 1.1, 0], [46, -40, 0.8, 140], [-30, 50, 0.7, 260], [50, 44, 1, 380]]) {
          const star = img(s, pane.x + dx, pane.y + dy, 'sparkle').setDepth(21);
          const big = star.scale * k;
          star.setScale(0);
          tw.add({ targets: star, scale: big, rotation: 0.8, duration: 300, delay: wait, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        }
        this.host.word('golf_paid', Math.min(W - 196, cx + 250), 318, true);
        sound.cash();
        sound.win();
      }],
      [2.1, () => { this.phase = 'done'; this.host.finish(true); }],
    ]);
  }

  // ---- odds and ends ----------------------------------------------------------------------------

  /** Somebody says something, on a scrap of paper up and to one side of their head. */
  private say(who: { mouth: Point }, text: string, secs: number, dx: number, dy: number, size = 19): void {
    const m = who.mouth, W = view.W;
    this.hush();
    const box = bubble(this.scene, Phaser.Math.Clamp(m.x + dx, 124, W - 124), Math.max(96, m.y + dy), text, m, size);
    this.said.push({ box, left: secs });
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  /** Something small in the air: it flies, falls (or floats) and is gone. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, depth = 30, size = 1): void {
    const im = img(this.scene, x, y, key).setDepth(depth).setRotation(key === 'tear' ? 0 : Math.random() * 6);
    im.setScale(im.scale * size);
    this.bits.push({ im, vx, vy, spin: key === 'tear' ? 0 : (Math.random() - 0.5) * 9, life, drop });
  }

  // ---- taps -------------------------------------------------------------------------------------

  press(at: Point): void {
    if (this.phase === 'setup') {
      const plate = this.plates.findIndex((p) => Math.abs(at.x - p.x) < 76 && Math.abs(at.y - PLATES) < 30);
      if (Math.abs(at.x - this.swingAt.x) < 96 && Math.abs(at.y - this.swingAt.y) < 50) this.startMeter();
      else if (plate >= 0) this.pickClub(plate);
      else if (Math.hypot(at.x - this.ballAt.x, at.y - this.ballAt.y) < 72) {
        this.aimAt((at.x - this.ballAt.x) / 58, (at.y - this.ballAt.y) / 58);
        sound.tick();
      }
    } else if (this.phase === 'meter' && !this.holding && this.air === 0) {
      this.holding = true;
      this.ticked = 0;
      this.chad.set('back', 'calm');
    } else if (this.phase === 'sell') {
      this.tap(at);
    }
  }

  release(): void {
    if (this.phase === 'meter' && this.holding) this.strike();
  }

  // ---- every frame ------------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    this.clock += dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();

    if (this.phase === 'setup' && this.arrow) {
      // the wind does not hold still
      this.arrow.setRotation(this.wind.dir + Math.sin(this.clock * 2.3) * 0.12 + Math.sin(this.clock * 5.1) * 0.05);
    } else if (this.phase === 'meter') {
      if (this.holding) {
        this.air += dt / FILL;
        // (a tick for each eighth of the way up)
        if (this.air < 1 && Math.floor(this.air * 8) > this.ticked) { this.ticked = Math.floor(this.air * 8); sound.tick(); }
        if (this.air > 1 + TOO_LONG / FILL) this.strike();
      }
      if (this.fill) this.fill.setScale(1 / TEX, ((1 / TEX) * Math.min(this.air, 1) * (METER.h - METER.pad * 2)) / 8);
      // he winds up as it fills; past full, he cannot hold it
      const wobble = this.air > 1 ? Math.sin(this.clock * 44) * 0.05 : 0;
      this.chad.box.setRotation(this.holding ? -0.1 * Math.min(this.air, 1) + wobble : 0);
    }
    if (this.stage === 'trail') this.trail(dt);

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
  }

  /** The trail, a frame at a time: who is on it, what is in the air, the clock. */
  private trail(dt: number): void {
    const W = view.W, selling = this.phase === 'sell';
    if (selling) {
      this.left -= dt;
      this.spawnIn -= dt;
      if (this.spawnIn <= 0) {
        this.spawnIn = EVERY * (0.7 + Math.random() * 0.6);
        this.spawn();
      }
      // Chad shouts about it, on and off
      this.hawkIn -= dt;
      if (this.hawkIn <= 0) {
        this.hawkIn = 0.8;
        if (this.chad.pose === 'wail') this.chad.set('stand', 'smile');
        else this.chad.set('wail', 'yell');
      }
      if (this.tossed > 0) {
        this.tossed -= dt;
        if (this.tossed <= 0) { this.shane.turn(1); this.shane.set('good', 'smile'); }
      }
      this.drawBar(this.left / SELL_SECONDS);
    }
    for (const p of this.people) {
      p.x += p.way * p.speed * dt;
      p.quiet += dt;
      p.step -= dt;
      if (p.step <= 0) {
        p.step = p.runs ? 0.13 : 0.27;
        p.foot = 1 - p.foot;
        this.stride(p);
      }
      p.box.setPosition(p.x, p.y);
      const top = this.topOf(p);
      p.want?.setPosition(top.x + 8, top.y + 26 + Math.sin(this.clock * 6 + p.n) * 2);
      if (p.thirsty && !p.sold) {
        // (hot work)
        p.sweatIn -= dt;
        if (p.sweatIn <= 0) {
          p.sweatIn = 0.34;
          this.puff('tear', top.x - p.way * 20, top.y + 70, -p.way * 50, -40, 0.5, 420, 22, 0.55);
        }
      }
      if (p.x < -130 || p.x > W + 130) {
        p.box.destroy();
        p.want?.destroy();
        p.gone = true;
      }
    }
    this.people = this.people.filter((p) => !p.gone);
    for (const f of this.flying) {
      f.t += dt;
      if (f.t < 0) continue;
      const k = Math.min(1, f.t / f.secs), to = f.to();
      f.im.setPosition(f.from.x + (to.x - f.from.x) * k, f.from.y + (to.y - f.from.y) * k - Math.sin(k * Math.PI) * f.arc).setRotation(k * 7);
      if (k >= 1) {
        f.im.destroy();
        f.done?.();
      }
    }
    this.flying = this.flying.filter((f) => f.t < f.secs);
    if (selling && this.left <= 0) this.tooSlow();
  }

  /** The clock for the selling, where the scene keeps its own for the other games. */
  private drawBar(frac: number): void {
    const g = this.bar;
    if (!g) return;
    const x = view.W / 2 + 92, y = 10, w = 250;
    g.clear();
    g.fillStyle(0x18100a, 0.3);
    g.fillRoundedRect(x + 2, y + 3, w, 14, 5);
    g.fillStyle(0xf9f4e4, 1);
    g.fillRoundedRect(x, y, w, 14, 5);
    g.fillStyle(0x242022, 1);
    g.fillRoundedRect(x + 3, y + 3, w - 6, 8, 3);
    if (frac > 0.005) {
      g.fillStyle(frac < 0.25 ? 0xcc302a : 0xf6c430, 1);
      g.fillRoundedRect(x + 3, y + 3, (w - 6) * Math.min(1, frac), 8, 3);
    }
  }

  timeUp(): boolean {
    return false;
  }

  // ---- playing itself ---------------------------------------------------------------------------

  bot(dt: number): void {
    const good = this.host.auto !== 'clumsy';
    if (this.phase === 'setup') {
      this.botIn -= dt;
      if (this.botIn > 0) return;
      this.botIn = 0.55;
      // the careful one tries everything first; the careless one just swings
      const step = good ? this.botStep++ : 2;
      if (step === 0) this.press({ x: this.plates[1].x, y: PLATES });
      else if (step === 1) this.press({ x: this.ballAt.x + 24, y: this.ballAt.y - 30 });
      else this.press(this.swingAt);
    } else if (this.phase === 'meter') {
      if (!this.holding && this.air === 0) {
        this.botIn -= dt;
        if (this.botIn <= 0) this.press({ x: 0, y: 0 });
      } else if (this.holding && this.air >= (good ? this.zone0 + ZONE * 0.4 : Math.max(0.15, this.zone0 - 0.3))) {
        this.release();
      }
    } else if (this.phase === 'sell') {
      this.botIn -= dt;
      if (this.botIn > 0) return;
      this.botIn = good ? 0.3 : 2.4;
      const on = this.people.filter((p) => p.x > 40 && p.x < view.W - 40);
      const pick = good ? on.filter((p) => p.thirsty && !p.sold).sort((a, b) => b.speed - a.speed)[0] : on[Math.floor(Math.random() * on.length)];
      if (pick) this.press({ x: pick.x, y: pick.y - 130 * pick.size });
    }
  }
}
