import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../config';
import { CHAD, KID_FACE, KID_HEAD, SHANE } from '../art/bat';
import { Doll } from '../art/fight';
import { BLEED } from '../art/finish';
import { ART, applyArt, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { BAT_FACES } from '../data/bat';
import { BAT_BODIES, BAT_DOOR, BAT_YARD } from '../data/batbodies';
import { bubble } from '../ui/bubble';
import { label, written } from '../ui/text';
import { Mini, Point } from './Mini';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;

/** Where the grass is underfoot. */
const FLOOR = 436;
/** The week it took: one page of the calendar, and one shove, at a time. */
const DAYS = ['MON', 'TUE', 'WED', 'THU'];
const DAY = 0.62;
/** How many times he has to be got, and how long there is to do it in before he reaches the back door. */
const BONKS = 3;
const CHASE = 11;
/** How near Chad has to be for the bat to reach, how far ahead Shane gets when he
 *  gets away, how fast Chad gains on him, and how long Shane takes to notice that
 *  he is in reach and put a spurt on. */
const REACH = 120;
const NEAREST = 90;
const AHEAD = 350;
const GAINING = 170;
const NOTICE = 0.6;
/** How fast the yard goes by. */
const SCROLL = 340;
/** How far it is from one end of the yard to where it starts again. */
const YARD = 1560;
/** How fast the sky drifts when nobody is running. */
const DRIFT = 6;
/** How long each of the two moments of a run is on for, and how far off the ground the one with both feet in the air is. */
const STRIDE = 0.13;
const AIRBORNE = 8;
/** The back doorstep, where their mother stands: how high it is (the photo of the house has a
 *  step up to it, and its ground a little nearer than the boys'), and where her chin is from there. */
const DOORSTEP = BAT_DOOR ? FLOOR + 30 - BAT_DOOR.house.drop : FLOOR - 4;
const MOM_SIZE = 1.15;
const MOM_CHIN = BAT_DOOR ? { x: BAT_DOOR.mom.chin[0], y: BAT_DOOR.mom.chin[1] } : { x: 0, y: -198 };

/** The boys are drawn this much bigger than their pictures, so that they can be seen from the couch. */
const SIZE = 1.3;

type Phase = 'week' | 'snap' | 'chase' | 'home' | 'done';

/** One of the brothers: a body, and a head hung on it by the chin. Everything
 *  is drawn facing right; `turn(-1)` faces him left. His body is a photo of a
 *  small boy in the pose (and of the bat, if he has it); or, with no photo, a
 *  paper doll, and then Chad's bat is a piece of its own in one hand. */
class Kid {
  readonly box: Box;
  private readonly body: Image;
  private readonly head: Image;
  private readonly bat?: Image;
  /** How tall his head is, hair to chin. */
  private readonly tall: number;
  pose = '';
  look = '';

  constructor(scene: Phaser.Scene, private readonly who: string, private readonly poses: Record<string, Doll>, pose: string, look: string, bat = false) {
    this.body = img(scene, 0, 0, `${who}_${pose}`);
    this.head = img(scene, 0, 0, `${who}head_${look}`);
    this.tall = BAT_FACES[who] ? KID_FACE : KID_HEAD * 2;
    const parts: Image[] = [this.body, this.head];
    if (bat && !BAT_BODIES[who]) {
      this.bat = img(scene, 0, 0, 'bat').setVisible(false);
      parts.splice(1, 0, this.bat);
    }
    this.box = scene.add.container(0, 0, parts).setScale(SIZE);
    this.set(pose, look);
  }

  /** Strike a pose (and, if one is given, pull a face). */
  set(pose: string, look = this.look): void {
    this.pose = pose;
    this.look = look;
    applyArt(this.body, `${this.who}_${pose}`);
    applyArt(this.head, `${this.who}head_${look}`);
    const photo = BAT_BODIES[this.who]?.[pose];
    if (photo) {
      this.head.setPosition(photo.chin[0], photo.chin[1]).setRotation(photo.tilt);
      // with the bat up in front of his face, he is laid over his head and not under it
      this.box.bringToTop(photo.over ? this.body : this.head);
    } else {
      const p = this.poses[pose];
      this.head.setPosition(p.head[0] - Math.sin(p.tilt) * KID_HEAD, p.head[1] + Math.cos(p.tilt) * KID_HEAD).setRotation(p.tilt);
      this.bat?.setPosition(p.hands[1][0], p.hands[1][1]);
    }
  }

  face(look: string): void {
    if (look !== this.look) this.set(this.pose, look);
  }

  turn(way: number): void {
    this.box.setScale(way * SIZE, SIZE);
  }

  /** The paper bat: he has it from now on; which way it points; and whether it is behind his back. */
  arm(): void {
    this.bat?.setVisible(true);
  }

  swingBat(turn: number): void {
    this.bat?.setRotation(turn);
  }

  batBehind(behind: boolean): void {
    if (!this.bat) return;
    if (behind) this.box.sendToBack(this.bat);
    else this.box.moveTo(this.bat, 1);
  }

  /** Where his mouth is on the page, for anything he says to come from. */
  get mouth(): Point {
    return { x: this.box.x + this.head.x * this.box.scaleX, y: this.box.y + (this.head.y - this.tall * 0.27) * SIZE };
  }

  /** The top of his head. */
  get top(): Point {
    return { x: this.box.x + this.head.x * this.box.scaleX, y: this.box.y + (this.head.y - this.tall - 2) * SIZE };
  }
}

/** The day Chad had had enough. All week his brother Shane shoves him about;
 *  on Friday Chad finds the baseball bat, and Shane finds out how fast he can
 *  run. Tap to swing when Chad is close enough: too soon and he spins round
 *  on the end of the bat, too late and Shane has noticed and is gone again.
 *  Three on the head before Shane reaches the back door, and their mother,
 *  settles it; and then Chad explains himself, as he did. */
export class BatMini extends Mini {
  readonly title = 'PAYBACK';
  readonly prompt = 'GET HIM BACK!';
  readonly seconds = 29;

  private phase: Phase = 'week';
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  private said: { box: Box; left: number }[] = [];
  private bits: { im: Image; vx: number; vy: number; spin: number; life: number }[] = [];

  private chad!: Kid;
  private shane!: Kid;
  private chadX = 0;
  /** How far ahead of Chad Shane is. */
  private gap = 124;
  /** Chad, shoved: how far back on his heels he is (0 to 1). */
  private knock = 0;
  /** Shane, got: how far through his hop he is (0 to 1). */
  private hop = 0;
  private lean = 0;
  /** Shane, safe: how far up on the doorstep behind his mother he is. */
  private perch = 0;
  private stride = 0;
  private batTurn = -1.3;

  // the chase
  private left = CHASE;
  private hits = 0;
  private busy = 0;
  private seen = 0;
  private fleeing = 0;
  private plan: 'steady' | 'spurt' | 'stumble' = 'steady';
  private planned = false;
  private surge = 0;
  private scroll = 0;
  private won = false;

  // the yard: strips of it that go by (each at its own share of the speed, and the sky drifting
  // whether anybody is running or not), and what there is in it to run past
  private strips: { ts: Phaser.GameObjects.TileSprite; share: number; drift: number; tex: number }[] = [];
  private props: Image[] = [];
  private clouds: Image[] = [];
  private house!: Image;
  private mom!: Box;
  private momHead!: Image;
  private alert!: Image;
  private halo!: Image;
  private haloOn = false;

  // the week
  private page!: Image;
  private dayText!: Phaser.GameObjects.Text;
  private ring!: Phaser.GameObjects.Graphics;
  private meter!: Phaser.GameObjects.Graphics;
  private meterText!: Phaser.GameObjects.Text;
  private fedUp = 0;
  private fedUpShown = 0;
  private tally!: Phaser.GameObjects.Text;
  private note!: Phaser.GameObjects.Text;
  private noteTape!: Image;
  private quip = 0;
  private botIn = 0.3;

  private get cx(): number {
    return view.W / 2;
  }

  build(): void {
    const s = this.scene, W = view.W;
    const strip = (key: string, y: number, tall: number, depth: number, share: number, drift = 0) => {
      const tex = ART[key].tex ?? TEX;
      const ts = s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * tex, tall * tex, key).setOrigin(0, 0).setScale(1 / tex).setDepth(depth);
      this.strips.push({ ts, share, drift, tex });
    };
    if (BAT_YARD && s.textures.exists('yard_ground')) {
      // the photo of it: the sky, and the fence and the grass going by in front
      strip('yard_sky_photo', BAT_YARD.skyTop, BAT_YARD.skyTall, 1, 0.03, DRIFT);
      strip('yard_ground', BAT_YARD.groundTop, BAT_YARD.groundTall, 2, 1);
    } else {
      strip('yard_sky', -BLEED, FLOOR + BLEED, 1, 0);
      img(s, W - 74, 96, 'yard_sun').setDepth(1.5);
      for (const [x, y] of [[W * 0.3, 112], [W * 0.56, 150]]) this.clouds.push(img(s, x, y, 'yard_cloud').setDepth(1.6));
      strip('yard_fence', FLOOR - 178, ART.yard_fence.h, 2, 1);
      strip('yard_grass', FLOOR - 32, H - FLOOR + 32 + BLEED, 3, 1);
    }
    const prop = (key: string, x: number, y: number, depth: number) => this.props.push(img(s, x, y, key).setDepth(depth));
    prop('yard_bush', this.cx - 196, FLOOR - 22, 4);
    prop('yard_swing', W - 112, FLOOR - 22, 4);
    prop('yard_line', W + 330, FLOOR - 24, 4);
    prop('yard_bush', W + 620, FLOOR - 22, 4);
    prop('yard_tree', W + 900, FLOOR - 24, 4);
    prop('yard_pool', this.cx + 150, FLOOR + 78, 14);
    prop('yard_pool', W + 760, FLOOR + 78, 14);

    // the back of the house, a long way off to the right, and their mother in its door
    this.house = img(s, W + 420, BAT_DOOR ? DOORSTEP : FLOOR + 2, 'yard_house').setDepth(6);
    if (!BAT_DOOR) this.house.setScale(this.house.scale * 1.14);
    const momBody = img(s, 0, 0, 'batmom_akimbo');
    this.momHead = img(s, MOM_CHIN.x, MOM_CHIN.y, 'mom_hold');
    this.mom = s.add.container(0, DOORSTEP, [momBody, this.momHead]).setDepth(8).setVisible(false);

    this.chadX = this.cx - 76;
    this.gap = 124;
    this.chad = new Kid(s, 'chad', CHAD, 'stand', 'sad', true);
    this.shane = new Kid(s, 'shane', SHANE, 'laugh', 'grin');
    this.chad.box.setDepth(11);
    this.shane.box.setDepth(10);
    this.shane.turn(-1);
    this.alert = img(s, 0, 0, 'alert').setDepth(20).setVisible(false);
    this.halo = img(s, 0, 0, 'halo').setDepth(20).setVisible(false);

    // the week: a calendar that turns a page a day, and how fed up he is getting
    const px = Math.min(W - 290, this.cx + 160);
    this.page = img(s, px, 146, 'cal_page').setDepth(20).setRotation(0.04);
    this.dayText = label(s, px, 164, '', 34, '#2a2320', 0).setDepth(21).setRotation(0.04);
    this.ring = s.add.graphics().setDepth(22);
    const mx = Math.max(84, this.cx - 300);
    this.meter = s.add.graphics().setDepth(20).setPosition(mx, 326);
    this.meterText = label(s, mx, 112, 'FED UP', 20, '#f6c430').setDepth(21);

    this.tally = label(s, this.cx, 66, '', 26, '#f6c430').setDepth(96);
    this.noteTape = img(s, this.cx, 508, 'tape_m').setDepth(95).setVisible(false);
    this.note = written(s, this.cx, 508, '', 17).setDepth(96);
    this.place();
    this.drawMeter();
    this.enter('week');
  }

  // ---- one thing after another ------------------------------------------------------------

  private cue(at: number, run: () => void): void {
    this.cues.push({ at, run });
    this.cues.sort((a, b) => a.at - b.at);
  }

  private enter(phase: Phase): void {
    const s = this.scene, tw = s.tweens, W = view.W;
    this.phase = phase;
    this.t = 0;
    this.cues = [];
    if (phase === 'week') {
      DAYS.forEach((_, i) => this.cue(0.3 + i * DAY, () => this.day(i)));
      this.cue(0.42 + DAYS.length * DAY, () => this.enter('snap'));
    } else if (phase === 'snap') {
      // Friday. He has had enough
      this.hush();
      this.turnPage('FRI');
      const p = this.page;
      this.ring.lineStyle(5, 0xcc302a, 1).strokeEllipse(p.x, p.y + 18, 86, 50);
      this.fedUp = 1;
      sound.rageReady();
      this.cue(0.3, () => {
        this.chad.set('mad', 'mad');
        this.chad.arm();
        this.batTurn = -1.3;
        this.host.word('thatsit', this.cx - 10, 150, true);
        sound.rageFire();
        s.cameras.main.shake(260, 0.01);
        for (let i = 0; i < 5; i++) this.puff('steam', this.chad.top.x + (Math.random() - 0.5) * 50, this.chad.top.y - 6, (Math.random() - 0.5) * 120, -150 - Math.random() * 90, 0.9);
        this.shane.set('laugh', 'scared');
      });
      this.cue(0.95, () => this.say(this.shane, 'uh oh.', 0.55, 62, -62));
      this.cue(1.5, () => this.enter('chase'));
    } else if (phase === 'chase') {
      // and he is off, round the yard, with his brother behind him
      this.hush();
      this.host.word('gethim', this.cx, 170, true);
      this.shane.turn(1);
      this.shane.set('run1', 'scared');
      this.chad.set('run1', 'yell');
      this.batTurn = -2.2;
      const ahead = Math.min(AHEAD, W - 130 - (this.cx - 190));
      tw.add({ targets: this, chadX: this.cx - 190, gap: ahead, scroll: SCROLL, duration: 450, ease: 'Quad.out' });
      tw.add({ targets: [this.page, this.dayText, this.ring, this.meter, this.meterText], alpha: 0, duration: 260 });
      // (nothing counts until he has his start)
      this.busy = 0.55;
      this.fleeing = 0.6;
      this.plan = 'steady';
      this.planned = true;
      this.left = CHASE;
      this.tally.setText(`BONKS  0 / ${BONKS}`);
      this.tell('TAP to swing the bat when he is close enough');
    } else if (phase === 'home') {
      // the back door, and their mother in it
      this.hush();
      this.tell('');
      this.alert.setVisible(false);
      const door = W - 152;
      // (what she says comes from her mouth, and goes beside her head: there is no room over it)
      const mom = { mouth: { x: door + MOM_CHIN.x * MOM_SIZE, y: DOORSTEP + MOM_CHIN.y * MOM_SIZE - 20 } };
      tw.add({ targets: this, scroll: 0, duration: 520, ease: 'Quad.out' });
      tw.add({ targets: this.house, x: door, duration: 520, ease: 'Quad.out' });
      tw.add({ targets: this, gap: door - 128 - this.chadX, duration: 600, ease: 'Quad.out' });
      this.mom.setX(door);
      this.cue(0.5, () => {
        this.mom.setVisible(true).setScale(0.9);
        tw.add({ targets: this.mom, scale: MOM_SIZE, duration: 140, ease: 'Back.out' });
        applyArt(this.momHead, this.won ? 'mom_pah' : 'mom_hold');
      });
      if (this.won) {
        // Shane howling, their mother wanting to know, and Chad, bat behind his back, with his
        // side of it: which is, word for word, what he said
        this.cue(0.62, () => {
          this.shane.set('bawl', 'cry');
          this.chad.set('hide', 'angel');
          this.batTurn = -1.45;
          this.chad.batBehind(true);
          this.halo.setVisible(true);
          this.haloOn = true;
          sound.yelp();
        });
        this.cue(0.8, () => this.say(this.shane, 'WAAAAAH!', 1.9, -96, -92, 24));
        this.cue(1.5, () => this.say(mom, 'CHAD! WHAT DID YOU DO?!', 1.5, -150, -26));
        const plea = (at: number, text: string, secs: number) => this.cue(at, () => {
          this.hush();
          this.say(this.chad, text, secs, 150, -112);
        });
        plea(3.0, "I didn't do nuffing Mom.", 1.5);
        plea(4.5, "I didn't do NUFFING!", 1.3);
        this.cue(5.8, () => {
          // (out it comes, to show her; and that is the end of the halo)
          this.chad.set('mad', 'angel');
          this.chad.batBehind(false);
          this.batTurn = -1.3;
          tw.add({ targets: this, batTurn: -1.05, duration: 160, yoyo: true, repeat: 3 });
          this.haloOn = false;
          tw.add({ targets: this.halo, y: this.halo.y + 250, rotation: 1.3, alpha: 0, duration: 800, ease: 'Quad.in' });
          applyArt(this.momHead, 'mom_hold');
          sound.tock();
        });
        plea(5.8, 'All I did was hit em in the head wiff dis bat.', 2.5);
        plea(8.3, "I didn't do NUFFING Mom!", 1.6);
        this.cue(10.0, () => this.end(true));
      } else {
        // he made it: round behind her, and safe
        this.cue(0.62, () => {
          this.shane.set('laugh', 'tongue');
          this.shane.turn(-1);
          this.shane.box.setDepth(7);
          tw.add({ targets: this, gap: door - 52 - this.chadX, perch: FLOOR - DOORSTEP, duration: 220 });
          this.chad.set('down', 'sad');
          this.batTurn = 1.25;
          sound.lose();
        });
        this.cue(0.9, () => this.say(this.shane, 'NYAH NYAH!', 2.2, -150, 26));
        this.cue(1.6, () => this.say(mom, 'CHAD! DROP THAT BAT!', 1.5, -150, -26));
        this.cue(3.0, () => this.end(false));
      }
    }
  }

  private end(won: boolean): void {
    this.phase = 'done';
    this.host.finish(won);
  }

  /** One day of it: the page turns, and Shane shoves him again. */
  private day(i: number): void {
    const s = this.scene, tw = s.tweens;
    this.turnPage(DAYS[i]);
    this.shane.set('push', 'grin');
    tw.add({ targets: this, lean: 1, duration: 90, yoyo: true, hold: 230, onComplete: () => this.shane.set('laugh', 'grin') });
    s.time.delayedCall(90, () => {
      if (this.phase !== 'week') return;
      this.chad.set('shoved', i < 2 ? 'sad' : 'mad');
      tw.add({ targets: this, knock: 1, duration: 120, ease: 'Quad.out', yoyo: true, hold: 150, onComplete: () => this.chad.set('stand') });
      this.host.word(i % 2 ? 'smack' : 'shove', this.chadX + 56, FLOOR - 268);
      sound.bonk(false);
      s.cameras.main.shake(90, 0.005);
      this.fedUp = (i + 1) / (DAYS.length + 1);
    });
  }

  private turnPage(day: string): void {
    const tw = this.scene.tweens;
    this.dayText.setText(day);
    for (const o of [this.page, this.dayText]) {
      o.setScale(o.scaleX, 0.1 * o.scaleX);
      tw.add({ targets: o, scaleY: o.scaleX, duration: 130, ease: 'Back.out' });
    }
    sound.tick();
  }

  /** A note along the bottom: what to do. */
  private tell(text: string): void {
    this.note.setText(text);
    this.noteTape.setVisible(!!text).setScale((this.note.width + 26) / ART.tape_m.w / TEX, 1.15 / TEX);
  }

  /** Somebody says something, on a scrap of paper up and to one side of their head. */
  private say(who: { mouth: Point }, text: string, secs: number, dx: number, dy: number, size = 19): void {
    const m = who.mouth, W = view.W;
    const box = bubble(this.scene, Phaser.Math.Clamp(m.x + dx, 120, W - 120), Math.max(112, m.y + dy), text, m, size);
    this.said.push({ box, left: secs });
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  /** Something small thrown up off somebody: steam, stars. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number): void {
    const im = img(this.scene, x, y, key).setDepth(30).setRotation(Math.random() * 6);
    this.bits.push({ im, vx, vy, spin: (Math.random() - 0.5) * 8, life });
  }

  // ---- what the player can do ---------------------------------------------------------------

  press(): void {
    if (this.phase === 'week') {
      // all he can do about it, all week
      if (this.quip > 0) return;
      this.quip = 0.5;
      this.hush();
      this.say(this.chad, ['QUIT IT!', 'STOP IT!', "I'M TELLING!"][Math.floor(Math.random() * 3)], 0.45, -80, -84);
    } else if (this.phase === 'chase' && this.busy <= 0) {
      this.swing();
    }
  }

  private swing(): void {
    const s = this.scene, tw = s.tweens;
    this.busy = 0.32;
    this.chad.set('swing');
    this.batTurn = -2.1;
    tw.add({ targets: this, batTurn: -0.6, duration: 90, ease: 'Quad.in' });
    sound.whoosh();
    s.time.delayedCall(80, () => {
      if (this.phase !== 'chase') return;
      if (this.gap <= REACH + 10) this.bonk();
      else this.whiff();
    });
    s.time.delayedCall(300, () => { if (this.phase === 'chase' && this.chad.pose === 'swing') { this.chad.set('run1'); this.batTurn = -2.2; } });
  }

  /** Got him. */
  private bonk(): void {
    const s = this.scene, tw = s.tweens, x = this.chadX + this.gap;
    this.hits++;
    const last = this.hits >= BONKS;
    this.tally.setText(`BONKS  ${this.hits} / ${BONKS}`).setScale(1.35);
    tw.add({ targets: this.tally, scale: 1, duration: 140 });
    // (the words go where they do not cover his face: one over his head, where it landed, and one beside him)
    const head = this.shane.top;
    this.host.word(last ? 'homerun' : 'bonk', last ? this.cx : head.x - 8, last ? 176 : head.y - 22, last);
    this.host.word('yeowch', Math.min(x + 140, view.W - 86), FLOOR - 96);
    sound.bonk(true);
    sound.yelp();
    s.cameras.main.shake(last ? 260 : 150, last ? 0.014 : 0.009);
    for (let i = 0; i < 5; i++) this.puff('star', head.x, head.y + 14, (Math.random() - 0.5) * 360, -160 - Math.random() * 220, 0.8);
    this.shane.set('ow', 'ow');
    this.chad.face(last ? 'joy' : 'glee');
    this.hop = 0;
    tw.add({ targets: this, hop: 1, duration: last ? 620 : 460, onComplete: () => { if (this.phase === 'chase') this.shane.set('run1', 'scared'); } });
    const ahead = Math.min(AHEAD, view.W - 130 - this.chadX);
    tw.add({ targets: this, gap: ahead, duration: 520, ease: 'Quad.out' });
    this.fleeing = 0.56;
    this.seen = 0;
    this.alert.setVisible(false);
    this.planned = false;
    if (last) {
      this.won = true;
      this.busy = 9;
      s.time.delayedCall(760, () => { if (this.phase === 'chase') this.enter('home'); });
    } else {
      s.time.delayedCall(700, () => { if (this.phase === 'chase') this.chad.face('yell'); });
    }
  }

  /** Too soon: the bat goes round, and so does he. */
  private whiff(): void {
    const s = this.scene, tw = s.tweens;
    this.busy = 0.8;
    this.host.word('whiff', this.chadX + 90, FLOOR - 196);
    sound.dodge();
    tw.add({ targets: this.chad.box, scaleX: -SIZE, duration: 150, yoyo: true, repeat: 1, onComplete: () => this.chad.turn(1) });
    const ahead = Math.min(AHEAD, view.W - 130 - this.chadX);
    tw.add({ targets: this, gap: Math.min(ahead, this.gap + 120), duration: 500, ease: 'Quad.out' });
    this.fleeing = 0.55;
    this.shane.face('tongue');
    s.time.delayedCall(650, () => { if (this.phase === 'chase') this.shane.face('scared'); });
  }

  // ---- every frame ----------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    this.busy -= dt;
    this.quip -= dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    if (this.phase === 'chase') this.chase(dt);

    // the yard goes by
    for (const st of this.strips) st.ts.tilePositionX += (this.scroll * st.share + st.drift) * st.tex * dt;
    for (const p of this.props) {
      p.x -= this.scroll * dt;
      if (p.x < -280 && this.phase === 'chase') p.x += Math.max(YARD, view.W + 600);
    }
    for (const c of this.clouds) {
      c.x -= (8 + this.scroll * 0.04) * dt;
      if (c.x < -90) c.x += view.W + 180;
    }
    if (this.scroll > 40) this.stride += dt;

    this.fedUpShown += (this.fedUp - this.fedUpShown) * Math.min(1, dt * 9);
    this.drawMeter();
    for (const b of this.said) {
      b.left -= dt;
      if (b.left <= 0) b.box.destroy();
    }
    this.said = this.said.filter((b) => b.left > 0);
    for (const b of this.bits) {
      b.life -= dt;
      b.vy += 620 * dt;
      b.im.setPosition(b.im.x + b.vx * dt, b.im.y + b.vy * dt).setRotation(b.im.rotation + b.spin * dt).setAlpha(Math.min(1, b.life * 3));
      if (b.life <= 0) b.im.destroy();
    }
    this.bits = this.bits.filter((b) => b.life > 0);
    this.place();
  }

  /** Chad gains on him; he notices, and gets away; and round again. */
  private chase(dt: number): void {
    this.left -= dt;
    if (this.left <= 0 && !this.won) {
      this.enter('home');
      return;
    }
    this.fleeing -= dt;
    if (this.fleeing > 0 || this.won) return;
    const ahead = Math.min(AHEAD, view.W - 130 - this.chadX);
    if (!this.planned) {
      // how he runs this time: straight, or with a spurt just as he is about to be caught, or tripping over his own feet
      this.planned = true;
      const r = Math.random();
      this.plan = r < 0.4 ? 'steady' : r < 0.75 ? 'spurt' : 'stumble';
    }
    let closing = GAINING + this.hits * 18;
    if (this.plan === 'spurt' && this.gap < REACH + 70 && this.gap > REACH + 24) {
      this.plan = 'steady';
      this.surge = 0.3;
    } else if (this.plan === 'stumble' && this.gap < ahead - 60) {
      this.plan = 'steady';
      this.surge = -0.3;
    }
    if (this.surge > 0) {
      this.surge = Math.max(0, this.surge - dt);
      closing = -250;
    } else if (this.surge < 0) {
      this.surge = Math.min(0, this.surge + dt);
      closing *= 2.4;
    }
    this.gap = Phaser.Math.Clamp(this.gap - closing * dt, NEAREST, ahead);

    // in reach: he looks round, and in a moment he will be gone again
    if (this.gap <= REACH) {
      this.seen += dt;
      if (this.seen > NOTICE) {
        this.seen = 0;
        this.fleeing = 0.5;
        this.planned = false;
        this.scene.tweens.add({ targets: this, gap: ahead, duration: 480, ease: 'Quad.out' });
        this.shane.face('tongue');
        this.scene.time.delayedCall(600, () => { if (this.phase === 'chase' && this.shane.look === 'tongue') this.shane.face('scared'); });
      }
    } else {
      this.seen = 0;
    }
    this.alert.setVisible(this.gap <= REACH);
  }

  /** How fed up he is, as a thermometer. */
  private drawMeter(): void {
    const g = this.meter, w = 34, h = 190, full = this.fedUpShown;
    g.clear();
    g.fillStyle(0x2a2320, 1);
    g.fillRoundedRect(-w / 2 - 4, -h - 4, w + 8, h + 8, 10);
    g.fillStyle(0xfbf6ea, 1);
    g.fillRoundedRect(-w / 2, -h, w, h, 7);
    const red = full > 0.95 && Math.floor(this.t * 12) % 2 ? 0xff7a5c : 0xcc302a;
    g.fillStyle(full > 0.7 ? red : full > 0.4 ? 0xf08a2a : 0xf6c430, 1);
    g.fillRoundedRect(-w / 2 + 5, -5 - (h - 10) * full, w - 10, (h - 10) * full, 4);
  }

  /** Put the two of them where they are. */
  private place(): void {
    const running = this.phase === 'chase' || (this.phase === 'home' && this.scroll > 40);
    // a run is two moments by turns: at full stretch, with both feet off the ground (run1), and one foot down (run2)
    const step = Math.floor(this.stride / STRIDE) % 2;
    const up = (k: Kid) => (running && k.pose === 'run1' ? -AIRBORNE : 0);
    const c = this.chad, s = this.shane;
    if (running && (c.pose === 'run1' || c.pose === 'run2')) c.set(step ? 'run2' : 'run1');
    if (running && (s.pose === 'run1' || s.pose === 'run2')) s.set(step ? 'run1' : 'run2');
    c.box.setPosition(this.chadX - this.knock * 34, FLOOR + up(c)).setRotation(-0.28 * this.knock);
    const hop = Math.sin(this.hop * Math.PI) * (this.won ? 100 : 66);
    s.box.setPosition(this.chadX + this.gap - this.lean * 40, FLOOR - hop - this.perch + up(s));
    c.swingBat(this.batTurn);
    this.alert.setPosition(s.top.x + 4, s.top.y - 14);
    if (this.haloOn) this.halo.setPosition(c.top.x, c.top.y - 8 + Math.sin(this.t * 5) * 3);
  }

  timeUp(): boolean {
    return this.won;
  }

  bot(dt: number): void {
    if (this.phase !== 'chase' || this.busy > 0) return;
    this.botIn -= dt;
    if (this.host.auto === 'good') {
      // waits until he is in reach, and then is as quick as anybody is
      if (this.gap > REACH - 6) this.botIn = 0.14;
      else if (this.botIn <= 0) this.press();
    } else if (this.botIn <= 0) {
      // swings whenever he feels like it
      this.botIn = 0.5 + Math.random() * 0.7;
      this.press();
    }
  }
}
