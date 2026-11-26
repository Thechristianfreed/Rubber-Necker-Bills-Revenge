import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { CHEER } from '../../art/fight';
import { ART, applyArt, img, originOf } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { FIGHT_BODIES } from '../../data/fight';
import { label, written } from '../../ui/text';
import { Mini, Point } from '../Mini';

type Image = Phaser.GameObjects.Image;
type Text = Phaser.GameObjects.Text;

/** Where the gym floor is, and how far each of them stands from the middle. */
const FLOOR = 428;
const APART = 118;
/** Each of Stephanie's hits takes this much off the other girl, while they still count. */
const DAMAGE = 0.035;
/** The fight lasts this long, or this many hits, before the other girl has had enough. */
const FIGHT_FOR = 6.5;
const FIGHT_HITS = 8;
/** Where the other girl's hand is when her arm is straight out, from the spot she stands on. */
const HAND = { x: 118, y: 276 };
/** Her arm, in each photo there is of it held out, lowest first: the pose, and how
 *  far above level the arm is in it, shoulder to fist (in radians, measured off the
 *  photos; below level is less than nothing). Whichever is nearest to the way
 *  Stephanie is flying is the one that shows, mirrored for the other side. With
 *  only the one photo, her arm stays level. */
const ARMS = [{ pose: 'arm0', up: -1.13 }, { pose: 'arm1', up: 0.17 }, { pose: 'arm2', up: 0.63 }, { pose: 'arm3', up: 1.41 }]
  .filter((a) => FIGHT_BODIES.rival?.[a.pose]?.hand);
if (!ARMS.length) ARMS.push({ pose: 'flick', up: 0 });
/** The one Stephanie is held up by before the swinging starts: the lowest that keeps her head off the floor. */
const HELD_UP = Math.max(0, ARMS.findIndex((a) => -(FIGHT_BODIES.rival[a.pose].hand as number[])[1] > 270));
/** However low the arm goes, Stephanie is never quite laid flat: this is as near to it as she gets (radians off straight down). */
const FLATTEST = 1.05;
const STEEPEST = 0.26;
/** How many times she is brought down, how long each swing over the top takes, and the pause after each. */
const SLAMS = 7;
const SWING = 0.27;
const REST = 0.17;
/** Where the floor meets the wall in the photo of the gym, and in the game. */
const GYM_FLOOR = 455;
const WALL_ENDS = 410;

const MOVES = ['SPIRIT FINGERS', 'HIGH KICK', 'POM-POM FLURRY'];
const POSES = ['fingers', 'kick', 'flurry'];
const PLEAS = ['APOLOGIZE', 'COMPLIMENT HER JACKET', 'BEG FOR MERCY'];
const SAID = ['SORRY!!', 'I LOVE YOUR JACKET!', 'MERCY! PLEASE!'];

/** The other girl throws the first one, before anybody has said "fight": how far
 *  it knocks Stephanie back, and how much of her health bar it takes. */
const SHOVED = 74;
const SHOVE_COSTS = 0.22;
/** How long the screen stops for the words SUPER MOVE. */
const SUPER_FOR = 1.25;
/** In the announcer's recording, how long after "Flawless victory" he says "Fatality";
 *  and how long he takes over all of it, if the recording is not there to say. */
const FATALITY_AT = 1.92;
const ANNOUNCED_FOR = 3.45;

/** Speech bubbles. Nothing that is said sits higher than the names under the health
 *  bars or lower than the buttons, and a line longer than this is broken in two. */
const SAY_TOP = 108;
const SAY_BOTTOM = 462;
const SAY_WRAP = 215;
const INK_COLOUR = 0x2a2320;
const PAPER_COLOUR = 0xfbf6ea;

type Phase = 'callout' | 'round' | 'fight' | 'power' | 'grab' | 'super' | 'smash' | 'toss' | 'ko' | 'done';
type Who = 'steph' | 'rival';
interface Box { x0: number; y0: number; x1: number; y1: number }
/** Somebody's head: the middle of it, how big it is, and where the words come out. */
interface Head { x: number; y: number; r: number; mouth: Point }
/** Something somebody is saying: the paper it is on, how big that is, where it sits
 *  from their head, and how much longer it has. */
interface Bubble {
  who: Who;
  box: Phaser.GameObjects.Container;
  g: Phaser.GameObjects.Graphics;
  w: number;
  h: number;
  dx: number;
  dy: number;
  left: number;
  shout: boolean;
}

const boxAt = (x: number, y: number, w: number, h: number): Box => ({ x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2 });
const shared = (a: Box, b: Box): number => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/** Where Stephanie's chin is in a pose, from the point she is held by (the spot
 *  on the floor she stands on, or in mid-air the ankle she is swung by), how far
 *  her head tips, and which way she lies from that point: from the photo of the
 *  pose, or from the paper doll if there is none. */
function cheer(pose: string): { x: number; y: number; tilt: number; lie: number } {
  const photo = FIGHT_BODIES.cheer?.[pose];
  if (photo?.chin) return { x: photo.chin[0], y: photo.chin[1], tilt: photo.tilt ?? 0, lie: photo.lie ?? Math.atan2(photo.chin[1], photo.chin[0]) };
  const doll = CHEER[pose], held = doll.hold ?? [0, 0];
  const x = doll.head[0] - held[0] - 30 * Math.sin(doll.tilt), y = doll.head[1] - held[1] + 30 * Math.cos(doll.tilt);
  return { x, y, tilt: doll.tilt, lie: Math.atan2(y, x) };
}

/** The fight after school. Stephanie, in her cheer outfit, is called out. The
 *  other girl starts it, with a shove; Stephanie stands her ground, and for a
 *  few seconds it goes well. Then the other girl powers up, at length, picks
 *  Stephanie up by one leg and (SUPER MOVE) brings her down on the gym floor,
 *  one side and then the other, the way the Hulk does Loki. An announcer from
 *  another game calls it: flawless victory, fatality. It cannot be won, and is
 *  not counted in the score. */
export class FightMini extends Mini {
  readonly title = 'AFTER SCHOOL';
  readonly prompt = 'STAND YOUR GROUND!';
  readonly seconds = 50;
  readonly scored = false;

  private phase: Phase = 'callout';
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  /** What is being said just now: one thing each, at most. */
  private bubbles: Bubble[] = [];
  /** Things thrown about: they fly, fall and are cleared away. */
  private bits: { im: Image; vx: number; vy: number; spin: number; drop: number; life: number }[] = [];

  // Stephanie
  private body!: Image;
  private head!: Image;
  private pose = 'ready';
  private sx = 0;
  private lunge = 0;
  private cool = 0;
  private hits = 0;
  private said = 0;
  /** How far back she has been knocked by the shove that starts it (0 to 1), and what is left of her health. */
  private knock = 0;
  private mine = 1;
  // ...once she has been picked up: where she is held and which way she hangs,
  // how far through a swing (0 is down on the left, 1 down on the right), and the slams so far
  private at = { x: 0, y: 0 };
  private hang = 0;
  private swing = 0;
  /** How far through the swing she is in time (it starts slowly and ends fast). */
  private go = 0;
  private swinging = false;
  private side = 0;
  private slams = 0;
  private rest = 0;
  private thrown?: { from: { x: number; y: number }; to: { x: number; y: number }; t: number };
  private stars: Image[] = [];

  // the other girl
  private rival!: Image;
  private rx = 0;
  private rivalPose = 'walk';
  /** The picture of her that is showing, and how far she is leaning out of her spot to shove. */
  private shown = 'walk';
  private reach = 0;
  private faceRight = false;
  private flinch = 0;
  private aura!: Image;
  private size = 1;
  private shake = 0;
  private rocks: { im: Image; vy: number; spin: number }[] = [];
  private rockIn = 0;

  // the scoreboard, and the gym
  private hp = 1;
  private bars = 1;
  private barL!: Phaser.GameObjects.Graphics;
  private barR!: Phaser.GameObjects.Graphics;
  private barBroken = false;
  private stack!: Text;
  private power!: Text;
  private comboL!: Text;
  private comboR!: Text;
  private plates: { plate: Image; text: Text; x: number }[] = [];
  private pleading = false;
  private bleachers!: Image;
  private hoop!: Image;
  private table!: Image;
  private banner!: Image;
  private botIn = 0;

  private get cx(): number {
    return view.W / 2;
  }

  build(): void {
    const s = this.scene, W = view.W;
    // the gym: the photo of it, or a wall of painted blocks and a floor of boards cut from paper
    if (s.textures.exists('gym')) {
      s.add.image(-BLEED, WALL_ENDS - GYM_FLOOR, 'gym').setOrigin(0, 0).setScale(1 / (ART.gym.tex ?? TEX)).setDepth(1);
    } else {
      const strip = (key: string, y: number, h: number) => s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, h * TEX, key)
        .setOrigin(0, 0).setScale(1 / TEX).setDepth(1);
      strip('gym_wall', -BLEED, WALL_ENDS + BLEED);
      strip('gym_floor', WALL_ENDS, H - WALL_ENDS + BLEED);
      const stripe = s.add.graphics().setDepth(2);
      stripe.fillStyle(0x2a5db0, 1);
      stripe.fillRect(-BLEED, FLOOR - 62, MAX_W + BLEED * 2, 10);
    }
    this.banner = img(s, 170, 150, 'gym_banner').setDepth(3).setRotation(-0.03);
    this.hoop = img(s, W - 96, FLOOR - 12, 'hoop').setDepth(3);
    this.bleachers = img(s, this.cx, FLOOR - 16, 'bleachers').setDepth(4);
    this.table = img(s, 124, FLOOR + 34, 'bake_table').setDepth(8);

    this.sx = this.cx - APART;
    this.rx = W + 170;
    this.aura = img(s, this.cx + APART, FLOOR + 14, 'aura').setDepth(9).setAlpha(0);
    this.rival = img(s, this.rx, FLOOR, 'rival_walk').setDepth(10);
    this.body = img(s, this.sx, FLOOR, 'cheer_ready').setDepth(12);
    this.head = img(s, 0, 0, 'mom_smile').setDepth(13);

    // the scoreboard of a proper fighting game
    const hud = 96;
    this.barL = s.add.graphics().setDepth(hud);
    this.barR = s.add.graphics().setDepth(hud);
    label(s, this.cx, 60, 'VS', 22, '#f6c430').setDepth(hud);
    label(s, 26, 86, 'STEPHANIE', 18).setOrigin(0, 0.5).setDepth(hud);
    label(s, W - 26, 86, 'TROUBLE', 18).setOrigin(1, 0.5).setDepth(hud);
    this.stack = label(s, this.cx + 62, 86, '', 18, '#f6c430').setOrigin(0, 0.5).setDepth(hud);
    // her power level is read off at her feet, out of the way of anything that is said
    this.power = label(s, this.rx, FLOOR + 31, '', 16, '#9fe870').setDepth(hud);
    this.comboL = label(s, 150, 222, '', 26, '#f6c430').setDepth(hud).setRotation(-0.06);
    this.comboR = label(s, W - 150, 250, '', 26, '#ff7a5c').setDepth(hud).setRotation(0.06);

    // three things she can do about it
    const bw = Math.min(260, (W - 68) / 3);
    for (let i = 0; i < 3; i++) {
      const x = this.cx + (i - 1) * (bw + 12);
      const plate = img(s, x, 502, 'fight_btn').setDepth(90);
      plate.setScale((plate.scaleX * bw) / 260, plate.scaleY);
      const text = written(s, x, 502, MOVES[i], 19).setDepth(91);
      this.plates.push({ plate, text, x });
    }
    this.draw();
    this.place();
    this.enter('callout');
  }

  // ---- one thing after another -----------------------------------------------------------

  private cue(at: number, run: () => void): void {
    this.cues.push({ at, run });
    this.cues.sort((a, b) => a.at - b.at);
  }

  private enter(phase: Phase): void {
    this.phase = phase;
    this.t = 0;
    this.cues = [];
    this.hush();
    if (phase === 'callout') {
      // she stomps on over
      for (const at of [0.3, 0.78, 1.26, 1.74, 2.22]) {
        this.cue(at, () => {
          sound.stomp();
          this.scene.cameras.main.shake(110, 0.007);
        });
      }
      this.cue(0.9, () => this.say('rival', 'HEY! LITTLE MISS PERFECT!', 1.45));
      this.cue(2.5, () => {
        this.rivalPose = 'point';
        this.say('rival', 'YOU NEED AN ATTITUDE ADJUSTMENT.', 1.65);
      });
      // ...and she is the one who starts it: one step in and a shove, before anybody has said "fight"
      this.cue(4.3, () => {
        sound.whoosh();
        this.scene.tweens.add({ targets: this, reach: -(APART * 2 - 112), duration: 110, ease: 'Quad.in', yoyo: true, hold: 150 });
      });
      this.cue(4.41, () => this.shoved());
      this.cue(5.15, () => {
        this.scene.tweens.add({ targets: this, knock: 0, duration: 340, ease: 'Quad.inOut' });
        applyArt(this.head, 'mom_hold');
      });
      this.cue(5.7, () => {
        applyArt(this.head, 'mom_smile');
        this.say('steph', 'I AM NOT SCARED OF YOU!', 1.3);
        this.scene.tweens.add({ targets: this, lunge: 16, duration: 90, yoyo: true });
      });
      this.cue(7.1, () => this.enter('round'));
    } else if (phase === 'round') {
      this.cue(0, () => { this.host.word('round', this.cx, 210, true); sound.rageReady(); });
      this.cue(0.95, () => { this.host.word('fight', this.cx, 230, true); sound.rageFire(); });
      this.cue(1.5, () => this.enter('fight'));
    } else if (phase === 'power') {
      this.cue(0, () => {
        this.rivalPose = 'point';
        this.say('rival', 'THAT ALL YOU GOT?', 1.1);
      });
      this.cue(1.2, () => {
        this.rivalPose = 'charge';
        this.say('rival', 'RRRAAAAAHHH!!!', 5.2, true);
        sound.powerUp(5.3);
        applyArt(this.head, 'mom_in');
      });
      this.cue(3.5, () => this.beg());
      this.cue(4.6, () => { this.hp = 1; this.bars = 2; });
      this.cue(6.5, () => this.transform());
      this.cue(8.3, () => {
        // and then, for a moment, it is very quiet
        this.shake = 0;
        sound.stopPower();
        sound.dim(0.3);
        this.scene.tweens.add({ targets: this.aura, alpha: 0.4, duration: 300 });
        this.say('rival', 'MY TURN.', 1.3);
      });
      this.cue(8.9, () => {
        this.pose = 'plead';
        this.say('steph', 'uh oh.', 0.8);
      });
      this.cue(9.8, () => this.enter('grab'));
    } else if (phase === 'grab') {
      // one step, and she has her by the ankle
      sound.dim(1);
      sound.stomp();
      this.scene.cameras.main.shake(140, 0.009);
      this.power.setText('');
      this.rivalPose = 'flick';
      this.scene.tweens.add({ targets: this, rx: this.sx - this.hand(ARMS[HELD_UP].pose).x, duration: 260, ease: 'Quad.out' });
      this.cue(0.3, () => {
        this.pose = 'fly';
        this.swing = 0;
        this.hang = Math.PI / 2;
        applyArt(this.head, 'mom_in');
        sound.whoosh();
      });
      this.cue(0.36, () => this.say('steph', 'wait wait wai', 0.62));
      this.cue(1.0, () => this.enter('super'));
    } else if (phase === 'super') {
      this.superMove();
      this.cue(SUPER_FOR, () => this.enter('smash'));
    } else if (phase === 'smash') {
      this.swinging = true;
      this.side = 0;
      this.go = 0;
      sound.whoosh();
      applyArt(this.head, 'mom_pah');
    } else if (phase === 'toss') {
      // and away
      const from = { ...this.at }, to = { x: 150, y: FLOOR - 30 };
      this.thrown = { from, to, t: 0 };
      this.rivalPose = 'flick';
      this.faceRight = false;
      sound.whoosh();
    } else if (phase === 'ko') {
      this.cue(0.25, () => {
        this.host.word('ko', this.cx, 220, true);
        sound.boom();
        this.scene.cameras.main.shake(260, 0.014);
      });
      this.cue(1.3, () => {
        this.rivalPose = 'win';
        this.say('rival', 'LITTLE MISS PERFECT.', 1.5);
      });
      this.cue(3.0, () => this.announce());
    }
  }

  /** The shove lands: Stephanie goes back on her heels, and it comes off her health bar. */
  private shoved(): void {
    const s = this.scene;
    sound.bonk(false);
    sound.stomp();
    s.cameras.main.shake(170, 0.011);
    this.host.word('shove', this.sx + 44, FLOOR - 196);
    this.mine = 1 - SHOVE_COSTS;
    applyArt(this.head, 'mom_pah');
    s.tweens.add({ targets: this, knock: 1, duration: 170, ease: 'Quad.out' });
    s.tweens.add({ targets: this.barL, x: this.barL.x - 7, duration: 45, yoyo: true, repeat: 2 });
  }

  /** The screen stops, goes dark and streams with lines, and says so: SUPER MOVE. */
  private superMove(): void {
    const s = this.scene, tw = s.tweens, W = view.W;
    sound.superMove();
    const dark = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x120c1c).setDepth(8.4).setAlpha(0);
    const lines = img(s, this.rx, FLOOR - 200, 'speed_lines').setDepth(8.5).setAlpha(0);
    lines.setScale(lines.scale * 2.1);
    tw.add({ targets: dark, alpha: 0.86, duration: 70 });
    tw.add({ targets: lines, alpha: 0.9, duration: 70 });
    tw.add({ targets: lines, rotation: 1.1, duration: SUPER_FOR * 1000 + 200 });
    const flash = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0xffffff, 0.95).setDepth(97);
    tw.add({ targets: flash, alpha: 0, duration: 240, onComplete: () => flash.destroy() });
    // the words, slammed on from far too close, and blinking white for as long as they are news
    const words = img(s, this.cx, 252, 'word_super').setDepth(98).setRotation(-0.07);
    const full = words.scale * Math.min(1, (W - 50) / ART.word_super.w);
    words.setScale(full * 3.2).setAlpha(0);
    tw.add({
      targets: words, scale: full, alpha: 1, duration: 130, ease: 'Cubic.in',
      onComplete: () => { s.cameras.main.shake(160, 0.012); sound.boom(); },
    });
    tw.addCounter({
      from: 0, to: 7, duration: 520, delay: 130,
      onUpdate: (t) => words.setTintMode(Math.floor(t.getValue() ?? 0) % 2 ? Phaser.TintModes.MULTIPLY : Phaser.TintModes.FILL),
      onComplete: () => words.setTintMode(Phaser.TintModes.MULTIPLY),
    });
    // ...and off, and the lights back up, just as she starts
    this.cue(SUPER_FOR - 0.2, () => tw.add({ targets: words, x: W + 420, duration: 150, ease: 'Quad.in', onComplete: () => words.destroy() }));
    this.cue(SUPER_FOR - 0.12, () => tw.add({ targets: [dark, lines], alpha: 0, duration: 130, onComplete: () => { dark.destroy(); lines.destroy(); } }));
  }

  /** The last word, from the announcer of another game altogether: "Flawless
   *  victory." And then, once that has sunk in: "Fatality." */
  private announce(): void {
    const s = this.scene, tw = s.tweens, W = view.W;
    this.hush();
    const long = sound.fatality() || ANNOUNCED_FOR;
    const veil = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x0c0810).setDepth(97).setAlpha(0);
    tw.add({ targets: veil, alpha: 0.3, duration: 200 });
    const slam = (key: string, y: number, from: number): Image => {
      const im = img(s, this.cx, y, key).setDepth(98);
      const full = im.scale * Math.min(1, (W - 40) / ART[key].w);
      im.setScale(full * from).setAlpha(0);
      tw.add({ targets: im, scale: full, alpha: 1, duration: 140, ease: 'Cubic.in' });
      return im;
    };
    const first = slam('word_flawless', 236, 1.7);
    this.cue(this.t + FATALITY_AT, () => {
      tw.add({ targets: first, alpha: 0, y: 150, duration: 160, onComplete: () => first.destroy() });
      tw.add({ targets: veil, alpha: 0.62, duration: 160 });
      slam('word_fatality', 272, 2.4);
      s.time.delayedCall(140, () => s.cameras.main.shake(260, 0.012));
    });
    this.cue(this.t + long + 0.35, () => {
      this.phase = 'done';
      this.host.finish(false);
    });
  }

  // ---- what they say ----------------------------------------------------------------------

  /** Where somebody's head is just now. Stephanie's is its own picture, held by
   *  the chin; the other girl's is wherever it is in the picture of her that is showing. */
  private headOf(who: Who): Head {
    if (who === 'steph') {
      const r = this.head.rotation, ux = Math.sin(r), uy = -Math.cos(r);
      return { x: this.head.x + ux * 34, y: this.head.y + uy * 34, r: 37, mouth: { x: this.head.x + ux * 15, y: this.head.y + uy * 15 } };
    }
    const big = this.rival.scale * TEX, face = FIGHT_BODIES.rival?.[this.shown]?.face ?? [0, -255];
    const side = this.faceRight ? -1 : 1;
    const x = this.rx + this.reach + side * face[0] * big, y = FLOOR + face[1] * big;
    return { x, y, r: 33 * big, mouth: { x: x - side * 9 * big, y: y + 15 * big } };
  }

  /** Keep a bubble on the page: below the names, above the buttons, inside the edges. */
  private keepIn(x: number, y: number, w: number, h: number): Point {
    const foot = this.plates[0].plate.visible ? SAY_BOTTOM : H - 12;
    return { x: Phaser.Math.Clamp(x, w / 2 + 8, view.W - w / 2 - 8), y: Phaser.Math.Clamp(y, SAY_TOP + h / 2, foot - h / 2) };
  }

  /** Somebody says something, for as long as it takes to read (or until they say
   *  something else). It goes on a scrap of paper by their head, wherever beside or
   *  above it covers least: not either of their faces, not what the other one is
   *  saying, and nothing else if it can be helped. It then stays by their head
   *  wherever that goes. A shout is on a jagged scrap, in bigger letters, and shakes. */
  private say(who: Who, text: string, secs: number, shout = false): void {
    const s = this.scene;
    this.bubbles = this.bubbles.filter((b) => (b.who === who ? (b.box.destroy(), false) : true));
    const words = written(s, 0, 0, text, shout ? 25 : 19);
    if (words.width > SAY_WRAP && text.includes(' ')) {
      // two lines, as near the same length as its spaces allow
      let cut = -1;
      for (let i = text.indexOf(' '); i >= 0; i = text.indexOf(' ', i + 1)) if (cut < 0 || Math.abs(i - text.length / 2) < Math.abs(cut - text.length / 2)) cut = i;
      words.setText(`${text.slice(0, cut)}\n${text.slice(cut + 1)}`).setLineSpacing(-4);
    }
    const w = words.width + (shout ? 64 : 26), h = words.height + (shout ? 36 : 12);
    const head = this.headOf(who), other = this.headOf(who === 'steph' ? 'rival' : 'steph');
    const out = who === 'steph' ? -1 : 1;

    // what it must not cover, and what it had better not
    const never: Box[] = [boxAt(head.x, head.y, head.r * 2, head.r * 2), boxAt(other.x, other.y, other.r * 2, other.r * 2)];
    for (const b of this.bubbles) never.push(boxAt(b.box.x, b.box.y, b.w + 8, b.h + 8));
    const rather: Box[] = [];
    for (const im of [this.body, this.rival, this.banner]) {
      const r = im.getBounds();
      if (im.visible && r.y < H) rather.push({ x0: r.x, y0: r.y, x1: r.right, y1: r.bottom });
    }
    for (const t of [this.comboL, this.comboR]) if (t.text && t.alpha > 0.2) rather.push(boxAt(t.x, t.y, t.width, t.height));

    // the places it could go, best first: over the head (and a little to either side), beside it, beside and lower
    const above = head.y - head.r - 14 - h / 2, beside = head.r + 18 + w / 2;
    const places: Point[] = [0, 0.22 * out, -0.22 * out, 0.44 * out, -0.44 * out].map((k) => ({ x: head.x + k * w, y: above }));
    for (const y of [head.y - head.r * 0.5 - h / 2 + 8, head.y + 6]) places.push({ x: head.x + out * beside, y }, { x: head.x - out * beside, y });
    let best = places[0], least = Infinity;
    places.forEach((p, i) => {
      const at = this.keepIn(p.x, p.y, w, h), box = boxAt(at.x, at.y, w + 8, h + 8);
      let cost = i * 25 + (Math.abs(at.x - p.x) + Math.abs(at.y - p.y)) * 2;
      for (const n of never) cost += shared(box, n) * 3;
      for (const r of rather) cost += shared(box, r) * 0.4;
      if (cost < least) { least = cost; best = p; }
    });

    const g = s.add.graphics();
    const box = s.add.container(0, 0, [g, words]).setDepth(94);
    const b: Bubble = { who, box, g, w, h, dx: best.x - head.x, dy: best.y - head.y, left: secs, shout };
    this.bubbles.push(b);
    this.settle(b);
    box.setScale(0.55);
    s.tweens.add({ targets: box, scale: 1, duration: 120, ease: 'Back.out' });
  }

  /** Put a bubble where its speaker's head now is, and point it at their mouth. */
  private settle(b: Bubble): void {
    const head = this.headOf(b.who), at = this.keepIn(head.x + b.dx, head.y + b.dy, b.w, b.h);
    const jolt = b.shout ? 3 : 0;
    b.box.setPosition(at.x + (Math.random() - 0.5) * jolt, at.y + (Math.random() - 0.5) * jolt);
    const g = b.g, a = b.w / 2 - 3, c = b.h / 2 - 3;
    // The tail leaves by whichever edge the mouth is furthest beyond, and stops short of the face.
    const mx = head.mouth.x - at.x, my = head.mouth.y - at.y;
    const ex = Math.abs(mx) - a, ey = Math.abs(my) - c;
    const inset = b.shout ? 12 : 0;
    let tail: number[][] | undefined;
    if (ex > 6 || ey > 6) {
      const down = ey >= ex * 0.6;
      const bx = down ? Phaser.Math.Clamp(mx, -a + 20, a - 20) : Math.sign(mx) * (a - inset);
      const by = down ? Math.sign(my) * (c - inset) : Phaser.Math.Clamp(my, -c + 14, c - 14);
      const far = Math.hypot(mx - bx, my - by) || 1, ux = (mx - bx) / far, uy = (my - by) / far;
      const long = Phaser.Math.Clamp(far - head.r * 0.6, 10 + inset, 58 + inset);
      // across the edge it leaves by, and a little way back inside the paper so that the join does not show
      const ax = down ? 1 : 0, ay = down ? 0 : 1, inx = down ? 0 : -Math.sign(mx) * 4, iny = down ? -Math.sign(my) * 4 : 0;
      tail = [
        [bx - ax * 12, by - ay * 12, bx + ax * 12, by + ay * 12, bx + ux * (long + 5), by + uy * (long + 5)],
        [bx - ax * 8.5 + inx, by - ay * 8.5 + iny, bx + ax * 8.5 + inx, by + ay * 8.5 + iny, bx + ux * long, by + uy * long],
      ];
    }
    const sheet = (grow: number) => {
      if (!b.shout) {
        g.fillRoundedRect(-a - grow, -c - grow, (a + grow) * 2, (c + grow) * 2, 13 + grow);
        return;
      }
      // a shout: the scrap is all points
      const pts: Phaser.Math.Vector2[] = [], n = 26;
      for (let i = 0; i < n; i++) {
        const th = (i / n) * Math.PI * 2, k = i % 2 ? 1 : 0.8;
        const cx = Math.cos(th), sy = Math.sin(th);
        pts.push(new Phaser.Math.Vector2(Math.sign(cx) * Math.abs(cx) ** 0.55 * (a + grow) * k, Math.sign(sy) * Math.abs(sy) ** 0.55 * (c + grow) * k));
      }
      g.fillPoints(pts, true);
    };
    g.clear();
    g.fillStyle(INK_COLOUR, 1);
    sheet(3);
    if (tail) g.fillTriangle(tail[0][0], tail[0][1], tail[0][2], tail[0][3], tail[0][4], tail[0][5]);
    g.fillStyle(PAPER_COLOUR, 1);
    sheet(0);
    if (tail) g.fillTriangle(tail[1][0], tail[1][1], tail[1][2], tail[1][3], tail[1][4], tail[1][5]);
  }

  /** Nobody is saying anything any more. */
  private hush(): void {
    for (const b of this.bubbles) b.box.destroy();
    this.bubbles = [];
  }

  /** Throw something: it flies off, turning, and falls. */
  private fling(key: string, x: number, y: number, n: number, speed: number, depth = 60): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
      const im = img(this.scene, x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, key).setDepth(depth).setRotation(a);
      this.bits.push({ im, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.4, spin: (Math.random() - 0.5) * 16, drop: 900, life: 1.6 });
    }
  }

  // ---- what the player can do ---------------------------------------------------------------

  press(at: Point): void {
    const which = this.plates.findIndex((p) => Math.abs(at.x - p.x) < 136 && at.y > 466);
    const i = which >= 0 ? which : Math.floor(Math.random() * 3);
    if (this.phase === 'fight' || (this.phase === 'power' && !this.pleading)) this.attack(i);
    else if (this.phase === 'power') this.plead(i);
    else if ((this.phase === 'grab' || this.phase === 'smash' || this.phase === 'toss') && this.cool <= 0) {
      this.cool = 0.45;
      this.host.word('ow', this.head.x, Math.max(120, this.head.y - 70));
      sound.yelp();
    }
  }

  /** One of her three moves. While the fight is fair, it lands. */
  private attack(i: number): void {
    if (this.cool > 0) return;
    this.cool = 0.3;
    this.pose = POSES[i];
    this.squash(i);
    sound.whoosh();
    const tw = this.scene.tweens;
    tw.killTweensOf(this);
    this.lunge = 0;
    tw.add({ targets: this, lunge: 62, duration: 80, yoyo: true, hold: 70, ease: 'Quad.out', onComplete: () => { if (this.pose === POSES[i]) this.pose = 'ready'; } });
    this.scene.time.delayedCall(90, () => this.connect());
  }

  private connect(): void {
    const x = this.rx - 40, y = FLOOR - 170 + (Math.random() - 0.5) * 70;
    if (this.phase === 'fight') {
      this.hits++;
      this.hp = Math.max(0.05, this.hp - DAMAGE);
      this.flinch = 0.2;
      sound.bonk(false);
      this.host.word(['pow', 'whack', 'bop'][this.hits % 3], x, y);
      this.scene.cameras.main.shake(70, 0.004);
      if (this.hits >= 2) this.pop(this.comboL, `${this.hits} HIT COMBO!`);
      if (this.hits === 4) this.say('steph', 'HA! TAKE THAT!', 1.0);
    } else if (this.phase === 'power') {
      // it is like punching a bus
      this.said++;
      sound.tock();
      this.host.word(['noeffect', 'zero', 'tickles'][this.said % 3], x, y);
    }
  }

  /** The buttons change, without a word, to the only moves she has left. */
  private beg(): void {
    this.pleading = true;
    this.plates.forEach((p, i) => {
      applyArt(p.plate, 'fight_btn_sad');
      p.plate.setScale((p.plate.scaleX * Math.min(260, (view.W - 68) / 3)) / 260, p.plate.scaleY);
      p.text.setText(PLEAS[i]).setFontSize(PLEAS[i].length > 16 ? 15 : 19);
    });
  }

  private plead(i: number): void {
    if (this.cool > 0) return;
    this.cool = 0.55;
    this.pose = 'plead';
    this.squash(i);
    this.say('steph', SAID[i], 0.7);
    sound.tock();
    this.scene.time.delayedCall(260, () => { if (this.phase === 'power') this.host.word('noeffect', this.rx - 30, FLOOR - 200); });
  }

  private squash(i: number): void {
    const p = this.plates[i].plate, y = p.scaleY;
    this.scene.tweens.add({ targets: p, scaleY: y * 0.86, duration: 60, yoyo: true });
  }

  private pop(text: Text, words: string): void {
    // up with a bump, and gone again once there has been nothing to add to it for a while
    const tw = this.scene.tweens;
    tw.killTweensOf(text);
    text.setText(words).setScale(1.3).setAlpha(1);
    tw.add({ targets: text, scale: 1, duration: 120 });
    tw.add({ targets: text, alpha: 0, duration: 300, delay: 1500 });
  }

  // ---- what happens to her ----------------------------------------------------------------------

  /** The other girl is done powering up. */
  private transform(): void {
    const s = this.scene;
    const flash = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0xffffff, 1).setDepth(97);
    s.tweens.add({ targets: flash, alpha: 0, duration: 420, onComplete: () => flash.destroy() });
    this.rivalPose = 'hulk';
    this.size = 0.7;
    s.tweens.add({ targets: this, size: 1, duration: 320, ease: 'Back.out' });
    this.fling('shred_cloth', this.rx, FLOOR - 190, 14, 520);
    s.cameras.main.shake(380, 0.016);
    sound.boom();
    this.bars = 9;
    applyArt(this.head, 'mom_hold');
    this.pose = 'ready';
  }

  /** She has been brought down on the floor again. */
  private slam(): void {
    const s = this.scene, x = this.head.x, y = FLOOR + 6;
    this.slams++;
    this.rest = REST;
    this.swinging = false;
    applyArt(this.head, 'mom_hold');
    if (this.slams % 2) sound.boom();
    sound.bonk(false);
    s.cameras.main.shake(170, 0.014);
    this.host.word(['pow', 'whack', 'bop', 'thwack'][this.slams % 4], x, FLOOR - 120);
    this.fling('star', x, y - 20, 4, 320);
    this.fling(this.slams % 2 ? 'shred_red' : 'shred_white', x, y - 20, 3, 260);
    img(s, x, y, 'crack').setDepth(7).setRotation((Math.random() - 0.5) * 0.4);
    this.pop(this.comboR, `${this.slams} HIT COMBO!`);
    // the gym is not built for this
    if (this.slams === 3) {
      sound.clang();
      // over it goes, from the foot of its post
      s.tweens.add({ targets: this.hoop, rotation: 1.5, duration: 800, ease: 'Quad.in' });
    } else if (this.slams === 4) {
      sound.clang();
      this.host.word('crash', this.bleachers.x, FLOOR - 150);
      this.fling('plank', this.bleachers.x, FLOOR - 80, 14, 520, 20);
      this.bleachers.setVisible(false);
    } else if (this.slams === 5) {
      s.tweens.add({ targets: this.banner, y: H + 100, rotation: -0.9, duration: 1000, ease: 'Quad.in' });
    }
  }

  /** Over the top she goes, and on the first trip takes her own health bar with her. */
  private overhead(): void {
    if (this.barBroken) return;
    this.barBroken = true;
    sound.clang();
    this.host.word('crash', 24 + (this.cx - 70) / 2, 130);
    this.scene.tweens.add({ targets: this.barL, y: H + 320, rotation: 0.9, duration: 1100, ease: 'Quad.in', onComplete: () => this.barL.setVisible(false) });
  }

  /** The end of her flight: the bake sale. */
  private land(at: { x: number; y: number }): void {
    const s = this.scene;
    sound.splat();
    sound.clang();
    s.cameras.main.shake(260, 0.016);
    this.host.word('splat', at.x + 90, FLOOR - 150);
    this.fling('cupcake', at.x - 40, FLOOR - 40, 14, 520);
    s.tweens.add({ targets: this.table, rotation: -0.5, y: this.table.y + 14, duration: 220 });
    this.pose = 'ko';
    this.at = { x: at.x + 60, y: FLOOR + 12 };
    applyArt(this.head, 'mom_hold');
    for (let i = 0; i < 4; i++) this.stars.push(img(s, 0, 0, 'star'));
    this.plates.forEach((p) => { p.plate.setVisible(false); p.text.setVisible(false); });
    this.enter('ko');
  }

  // ---- every frame ----------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    this.cool -= dt;
    this.flinch -= dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();

    if (this.phase === 'callout') {
      const target = this.cx + APART;
      const go = Math.min(1, this.t / 2.4);
      this.rx = view.W + 170 + (target - view.W - 170) * go;
      if (go < 1) this.rivalPose = 'walk';
    } else if (this.phase === 'fight') {
      if (this.t > FIGHT_FOR || (this.hits >= FIGHT_HITS && this.t > 2.5)) this.enter('power');
    } else if (this.phase === 'power') {
      this.powerUp(dt);
    } else if (this.phase === 'smash') {
      this.smash(dt);
    } else if (this.phase === 'toss' && this.thrown) {
      // a long way, turning over and over
      const th = this.thrown;
      th.t = Math.min(1, th.t + dt / 0.6);
      this.at = { x: th.from.x + (th.to.x - th.from.x) * th.t, y: th.from.y + (th.to.y - th.from.y) * th.t - Math.sin(th.t * Math.PI) * 90 };
      this.hang -= 15 * dt;
      if (th.t >= 1) {
        this.thrown = undefined;
        this.land(th.to);
      }
    } else if (this.phase === 'ko') {
      this.stars.forEach((st, i) => {
        const a = this.t * 4 + (i * Math.PI * 2) / this.stars.length;
        st.setPosition(this.head.x + Math.cos(a) * 34, this.head.y - 46 + Math.sin(a) * 9).setDepth(Math.sin(a) > 0 ? 14 : 11);
      });
    }

    for (const b of this.bits) {
      b.life -= dt;
      b.vy += b.drop * dt;
      b.im.setPosition(b.im.x + b.vx * dt, b.im.y + b.vy * dt).setRotation(b.im.rotation + b.spin * dt).setAlpha(Math.min(1, b.life * 3));
      if (b.life <= 0) b.im.destroy();
    }
    this.bits = this.bits.filter((b) => b.life > 0);
    this.draw();
    this.place();
    // whatever is being said goes where its speaker has gone
    for (const b of this.bubbles) {
      b.left -= dt;
      if (b.left <= 0) b.box.destroy();
      else this.settle(b);
    }
    this.bubbles = this.bubbles.filter((b) => b.left > 0);
  }

  /** The power-up: the aura, the shaking, the rocks, the numbers. It goes on. */
  private powerUp(dt: number): void {
    const s = this.scene, p = this.t;
    if (p < 1.2) return;
    const charging = p < 8.3;
    if (charging) {
      this.shake = Math.min(7, (p - 1.2) * 1.3);
      const build = Math.min(1, (p - 1.2) / 5);
      this.aura.setAlpha(0.35 + build * 0.6);
      // rocks, lifting off the floor for no reason anyone can give
      this.rockIn -= dt;
      if (this.rockIn <= 0 && this.rocks.length < 28) {
        this.rockIn = 0.16;
        const im = img(s, this.rx + (Math.random() - 0.5) * 520, FLOOR + 8 + Math.random() * 30, 'rock').setDepth(11).setRotation(Math.random() * 6);
        im.setScale(im.scale * (0.6 + Math.random() * 0.9));
        this.rocks.push({ im, vy: -(40 + Math.random() * 90), spin: (Math.random() - 0.5) * 3 });
      }
      if (Math.floor(p * 2) !== Math.floor((p - dt) * 2)) s.cameras.main.shake(180, 0.002 + build * 0.01);
      // her power level, as far as the instruments can follow it
      const level = Math.floor(12 * Math.exp((p - 1.2) * 1.5));
      this.power.setText(p < 6.5 ? (level > 9000 ? 'POWER LEVEL  OVER 9000!!' : `POWER LEVEL  ${level}`) : 'POWER LEVEL  ERROR').setColor(level > 9000 ? '#ff7a5c' : '#9fe870');
      if (p > 4.6 && p < 6.5 && this.bars < 9 && Math.floor(p * 5) !== Math.floor((p - dt) * 5)) this.bars++;
    }
    for (const r of this.rocks) {
      if (charging) r.vy *= 1 - 0.5 * dt;
      else r.vy += 1400 * dt;
      r.im.setPosition(r.im.x, r.im.y + r.vy * dt).setRotation(r.im.rotation + r.spin * dt);
      if (!charging && r.im.y > FLOOR + 30) {
        r.im.destroy();
        r.vy = NaN;
      }
    }
    this.rocks = this.rocks.filter((r) => !Number.isNaN(r.vy));
    const wobble = charging ? this.shake * 0.5 : 0;
    this.bleachers.setX(this.cx + (Math.random() - 0.5) * wobble);
    this.hoop.setRotation((Math.random() - 0.5) * wobble * 0.012);
  }

  /** Up by the ankle, over the top and down on the other side; and again. */
  private smash(dt: number): void {
    if (!this.swinging) {
      this.rest -= dt;
      if (this.rest > 0) return;
      if (this.slams >= SLAMS) {
        this.enter('toss');
        return;
      }
      this.swinging = true;
      applyArt(this.head, 'mom_pah');
      sound.whoosh();
    }
    // slow off the floor and fast into it
    const before = this.go * this.go;
    this.go = Math.min(1, this.go + dt / SWING);
    const eased = this.go * this.go;
    if (before < 0.5 && eased >= 0.5) this.overhead();
    this.swing = this.side ? 1 - eased : eased;
    if (this.go >= 1) {
      this.side = 1 - this.side;
      this.swing = this.side;
      this.go = 0;
      this.slam();
    }
  }

  /** The two health bars. Hers is plain. The other one stops being. */
  private draw(): void {
    const W = view.W, y = 60, h = 16, len = this.cx - 46 - 24;
    const bar = (g: Phaser.GameObjects.Graphics, x: number, frac: number, colour: number, fromRight: boolean) => {
      g.clear();
      g.fillStyle(0x2a2320, 1);
      g.fillRoundedRect(x - 4, -h / 2 - 4, len + 8, h + 8, 6);
      g.fillStyle(0xfbf6ea, 1);
      g.fillRoundedRect(x - 1, -h / 2 - 1, len + 2, h + 2, 4);
      g.fillStyle(0x45343a, 1);
      g.fillRect(x, -h / 2, len, h);
      g.fillStyle(colour, 1);
      g.fillRect(fromRight ? x + len * (1 - frac) : x, -h / 2, len * frac, h);
    };
    if (!this.barBroken) {
      this.barL.setY(y);
      if (!this.scene.tweens.isTweening(this.barL)) this.barL.setX(24 + len / 2);
      bar(this.barL, -len / 2, this.mine, 0x59c36a, false);
    }
    this.barR.setPosition(W - 24 - len / 2, y);
    bar(this.barR, -len / 2, this.hp, this.bars > 1 ? 0xb46bff : 0xf6c430, true);
    this.stack.setText(this.bars > 1 ? `x${this.bars > 8 ? 99 : this.bars}` : '');
  }

  /** Put everybody where they are, and Stephanie's head on Stephanie. `over`
   *  is how far through a swing she is, if she is being swung just now. */
  private place(over = this.swing): void {
    const held = this.phase === 'grab' && this.pose === 'fly' || this.phase === 'super' || this.phase === 'smash';
    // The other girl. While she has Stephanie by the ankle, which way Stephanie lies from her
    // hand comes first: hanging nearly straight down while she is only held up; then round from
    // lying out on one side, through standing on her head in the air, to lying out on the other.
    // (On the floor she is as near flat as will reach it from the hand that put her there.) The
    // other girl turns to whichever side that is, and her arm is in whichever photo has it
    // pointing most nearly the same way.
    let pose = this.flinch > 0 && this.rivalPose === 'point' ? 'flinch' : this.rivalPose;
    if (held) {
      const fly = cheer('fly'), long = Math.hypot(fly.x, fly.y) + 66, low = this.hand(ARMS[0].pose);
      const off = Phaser.Math.Clamp(Math.acos(Math.min(1, -low.y / long)), STEEPEST, FLATTEST);
      const up = Math.PI / 2 + STEEPEST, round = Math.PI / 2 + off + (Math.PI * 2 - off * 2) * over;
      const first = this.phase === 'smash' && this.slams === 0;
      this.hang = this.phase !== 'smash' ? up : first ? up + (round - up) * Math.min(1, over / 0.2) : round;
      this.faceRight = this.hang > Math.PI * 1.5;
      const lift = this.faceRight ? Math.PI * 2 - this.hang : this.hang - Math.PI;
      let arm = ARMS.reduce((best, a, i) => (Math.abs(a.up - lift) < Math.abs(ARMS[best].up - lift) ? i : best), 0);
      // (from being held up, her arm does not dip before it rises)
      if (this.phase !== 'smash' || (first && !this.faceRight)) arm = Math.max(arm, HELD_UP);
      pose = ARMS[arm].pose;
    }
    const rival = `rival_${pose}`;
    this.shown = pose;
    if (this.rival.texture.key !== rival) applyArt(this.rival, rival);
    const jx = (Math.random() - 0.5) * this.shake, jy = (Math.random() - 0.5) * this.shake;
    const stomp = this.phase === 'callout' ? -Math.abs(Math.sin((this.t * Math.PI) / 0.48)) * 10 : 0;
    const big = this.rivalPose === 'hulk' || this.rivalPose === 'flick' || this.rivalPose === 'win' ? this.size : 1;
    const [ox, oy] = originOf(rival);
    this.rival.setFlipX(this.faceRight).setOrigin(this.faceRight ? 1 - ox : ox, oy)
      .setPosition(this.rx + this.reach + jx, FLOOR + jy + stomp).setScale(big / TEX);
    this.power.setX(this.rx);
    this.aura.setPosition(this.rx, FLOOR + 14).setScale(((0.8 + Math.sin(this.t * 22) * 0.06) * (big > 1 || this.rivalPose !== 'charge' ? 1.25 : 1)) / TEX);

    // Stephanie: on her feet; or held by the ankle, in the other girl's hand wherever that is
    const key = `cheer_${this.pose}`;
    if (this.body.texture.key !== key) applyArt(this.body, key);
    const c = cheer(this.pose);
    // (shoved, she goes back on her heels: away, tipped over backwards, and a little way off the floor)
    let x = this.sx + this.lunge - SHOVED * this.knock, y = FLOOR - Math.sin(Math.min(1, this.knock) * Math.PI) * 10, turn = -0.3 * this.knock;
    if (held) {
      const hand = this.hand(pose);
      this.at = { x: this.rx + (this.faceRight ? -hand.x : hand.x), y: FLOOR + hand.y };
    }
    if (this.pose === 'fly') {
      x = this.at.x;
      y = this.at.y;
      turn = this.hang - c.lie;
    } else if (this.pose === 'ko') {
      x = this.at.x;
      y = this.at.y;
    }
    this.body.setPosition(x, y).setRotation(turn);
    this.head.setPosition(x + c.x * Math.cos(turn) - c.y * Math.sin(turn), y + c.x * Math.sin(turn) + c.y * Math.cos(turn)).setRotation(turn + c.tilt);
  }

  /** Where the other girl's hand is in a pose with her arm out, from the spot she stands on (as she faces left). */
  private hand(pose: string): { x: number; y: number } {
    const at = FIGHT_BODIES.rival?.[pose]?.hand;
    return at ? { x: at[0], y: at[1] } : { x: -HAND.x, y: -HAND.y };
  }

  timeUp(): boolean {
    return false;
  }

  bot(dt: number): void {
    this.botIn -= dt;
    if (this.botIn > 0) return;
    this.botIn = this.host.auto === 'good' ? 0.24 : 0.5;
    if (this.phase === 'fight' || this.phase === 'power' || this.phase === 'grab' || this.phase === 'smash') {
      const p = this.plates[Math.floor(Math.random() * 3)];
      this.press({ x: p.x, y: 502 });
    }
  }
}
