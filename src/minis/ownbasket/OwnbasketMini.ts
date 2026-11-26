import Phaser from 'phaser';
import { TEX, view } from '../../config';
import { ART, FROM, applyArt, img, originOf } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { bubble } from '../../ui/bubble';
import { label, written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { head, setLook } from '../shared/people';
import { GYM, layGym } from '../shared/places';
import { BALL, HEAD_R, HER, HOOP, Mood, RIM_W, STEPH } from './art';
import { BODIES, Body, Lights, THINGS } from './bodies';
import * as sfx from './sfx';

type Image = Phaser.GameObjects.Image;
type Text = Phaser.GameObjects.Text;

/** Where feet go, and how high the rims are. */
const FLOOR = GYM.floor;
const RIM = FLOOR + HOOP.rim[1];
/** How far in from each end of the court its post stands. */
const HOOP_X = 26;

/** The meter is the one from Mom's workout tape, and works as it does there: a full
 *  breath takes this long; let go in the top part of it (ZONE and up) for the sweet
 *  spot; hold on this long past full and it goes off by itself. */
const INHALE = 1.3;
const ZONE = 0.76;
const TOO_LONG = 0.5;
/** A shot let go too early gets as far as the other basket's rim. One let go before
 *  even this much has not the legs for that, and comes down on the floor. */
const FEEBLE = 0.36;

/** How long the game is, on the scoreboard's clock. */
const GAME = 30;
/** How fast Stephanie gets about; how fast the other girl brings the ball up, and backs off. */
const SPEED = 205;
const HER_SPEED = 112;
const HER_BACK = 240;
/** As near as the two of them get; where the other girl stands to guard; and how far Stephanie's arm reaches. */
const GAP = 72;
const GUARD = 132;
const REACH = 118;
/** Stephanie may have the ball this long without shooting before it is taken off her. */
const HOG = 8;
/** How near the basket the other girl comes before she shoots, and how long she takes
 *  over it. (Every other shot of hers goes in: the first, which is the rebound the story
 *  starts with, does not.) */
const HER_RANGE = 250;
const HER_WINDUP = 0.5;
/** The two of them are drawn this much bigger than their pictures, so that they can be
 *  seen from the couch; and how tall Stephanie's head is at that size, hair to chin. */
const SIZE = 1.2;
const STEPH_HEAD = 64;

/** Which of a number's seven strokes are lit for each figure, 0 to 9: a is the top one, then
 *  round to the right (b, c), the bottom (d), up the left (e, f), and g across the middle. */
const STROKES = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg'];
/** What the scoreboard's lights are lit in: the scores, the clock, and a score that has just changed. */
const LIT = { score: 0xffb52e, clock: 0xff5a3c, fresh: 0xfff3b0 };

const SHE_SAYS = ['I SCORED!!', 'NOTHING BUT NET!', "I'M ON FIRE!", 'DID YOU SEE THAT?!'];
const HER_ANSWER = ["THAT'S YOUR OWN BASKET!", 'UM... THANKS?', "KEEP 'EM COMING!", "YOU'RE OUR BEST PLAYER!"];

type Phase = 'open' | 'mine' | 'aim' | 'shot' | 'scored' | 'hers' | 'hershot' | 'loose' | 'final' | 'done';
type Who = 'steph' | 'her';
/** The four things a shot of Stephanie's can do on its way into her own basket. */
type Shot = 'sweet' | 'rim' | 'floor' | 'long';
/** One hop of the ball: where to (which may be somebody who is moving), how far it
 *  rises above the straight line there, how long it takes, and what happens when it lands. */
interface Leg { to: Point | (() => Point); rise: number; secs: number; then?: () => void }
/** Somebody jumping: how high, how long each jump takes, how many are left, how far
 *  through this one she is, and how long before the first. */
interface Hops { high: number; secs: number; left: number; t: number; wait: number }

/** Stephanie's only basket. She played basketball in middle school, and tells the
 *  story of the one time she ever scored: she got a rebound, was so excited that she
 *  went straight back up with it, and swished it. Into her own basket.
 *
 *  So: one against one in the school gym, Stephanie going right. She can go forward
 *  and back, shoot a jump shot when she has the ball (the meter from the workout
 *  tape: hold to fill, let go in the green) and try to steal it when she has not.
 *  Whatever she does with a shot, it goes in the basket behind her: let go early, it
 *  sets off the right way, comes down on the floor or off the other rim, and bounces
 *  the length of the court into her own; let go in the green, it goes straight
 *  backwards over her head and swishes. Every point on the board is the visitors'. */
export class OwnbasketMini extends Mini {
  readonly title = "STEPHANIE'S ONLY BASKET";
  readonly prompt = 'SCORE A BASKET!';
  /** (Its clock is the one on the scoreboard, which stops for the tip and waits for a
   *  shot that is in the air: so the tape's own clock is not used.) */
  readonly seconds = GAME + 15;
  readonly timed = false;

  private phase: Phase = 'open';
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  /** The clock: whether it has started, what is left on it, and whether the buzzer has gone. */
  private live = false;
  private clock = GAME;
  private over = false;
  /** The scoreboard, and what Stephanie herself has put on it. */
  private home = 0;
  private away = 0;
  private points = 0;
  private baskets = 0;
  private shots = 0;
  /** How many times the other girl has brought the ball up, and how many shots she has taken. */
  private turns = 0;
  private herShots = 0;

  // Stephanie
  private sx = 0;
  private pose = 'guard';
  private look = 'calm';
  private worn = '';
  private jump = 0;
  private lunge = 0;
  /** The jumps each of them is in the middle of, and what she does when she has landed. */
  private hops: Record<Who, { now?: Hops; next?: Hops }> = { steph: {}, her: {} };
  /** How long she has had the ball, how far she has run (for her legs), and how long before she can do anything again. */
  private held = 0;
  private run = 0;
  private busy = 0;
  private moving = false;
  private body!: Image;
  private head!: Image;
  /** Her arms, in the photos that have them up: a piece of their own, laid over her head. */
  private arms!: Image;

  // the other girl
  private ox = 0;
  private herPose = 'dribble';
  private mood: Mood = 'set';
  private hop = 0;
  private herRun = 0;
  private herMoving = false;
  /** How long she has been stopped by Stephanie being in the way, and how long until her shot goes up. */
  private stall = 0;
  private windup = 0;
  private herBody!: Image;
  private herHead!: Image;
  private what!: Image;
  /** Where her chin is on the page just now, and how tall her head is: for what she says to come from. */
  private herChin: Point = { x: 0, y: 0 };
  private herTall = HEAD_R * 2 * SIZE;

  // the ball
  private ball!: Image;
  private shade!: Image;
  private at: Point = { x: 0, y: 0 };
  private holder: Who | '' = 'her';
  private legs: Leg[] = [];
  private leg?: Leg & { from: Point; k: number };
  private drib = 0;
  private spin = 0;
  /** What the shot in the air is, what it is worth, and how many things it has hit on the way. */
  private kind: Shot = 'sweet';
  private worth = 2;
  private bounced = 0;

  // the meter
  private air = 0;
  private lungs!: Image;
  private breath!: Image;

  // the court, the scoreboard and the buttons
  private nets: Image[] = [];
  /** How far across a rim is, and where the bottom of the scoreboard is: the photos' are not the paper ones'. */
  private rimWide = RIM_W;
  private boardFoot = 132;
  /** The scoreboard, with its numbers on it (so that they go with it when it is hit). On the photo
   *  of one the numbers are lights, lit stroke by stroke over the unlit ones; on the paper one they
   *  are lettering. `strokes` is each stroke of a number, from its top left corner; `showing` is
   *  what the lights last showed; `fresh` is how much longer a score that has just changed stays bright. */
  private board!: Phaser.GameObjects.Container;
  private lights?: Phaser.GameObjects.Graphics;
  private strokes: Record<string, Point[]> = {};
  private showing = '';
  private fresh = 0;
  private homeText?: Text;
  private awayText?: Text;
  private clockText?: Text;
  private back!: Image;
  private fwd!: Image;
  private act!: Image;
  private note!: Text;
  private noteTape!: Image;
  private keys: Phaser.Input.Keyboard.Key[] = [];
  private said: { who: Who; box: Phaser.GameObjects.Container; dx: number; dy: number; left: number }[] = [];
  /** The self-play bots: which way one is walking, and when it next lunges. */
  private botDir = 0;
  private botIn = 0;

  /** The middle of each rim: hers (behind her, on the left) and the one she is meant to be shooting at. */
  private get own(): number {
    return HOOP_X + HOOP.rim[0];
  }

  private get theirs(): number {
    return view.W - HOOP_X - HOOP.rim[0];
  }

  build(): void {
    const s = this.scene, W = view.W, cx = W / 2;
    layGym(s);
    img(s, cx, FLOOR - 16, 'bleachers').setDepth(4);

    // The scoreboard. The photo of one has lights: six numbers, two to a panel (the score, the
    // seconds left, the score). The paper one has a window for each number, and lettering in it.
    const photo = FROM.ownbasket_board ? THINGS.board : undefined;
    if (photo) {
      const top = 38;
      this.lights = s.add.graphics();
      this.strokes = this.strokesOf(photo.lights, photo.w, photo.tall);
      this.board = s.add.container(cx, top + photo.tall / 2, [img(s, 0, 0, 'ownbasket_board'), this.lights]).setDepth(3);
      this.boardFoot = top + photo.tall - 6;
    } else {
      const lit = (x: number, colour: string) => label(s, x, 12, '0', 31, colour, 0);
      this.homeText = lit(-102, '#f6c430');
      this.clockText = lit(2, '#ff6a4c');
      this.awayText = lit(102, '#f6c430');
      this.board = s.add.container(cx, 86, [img(s, 0, 0, 'ownbasket_board'), this.homeText, this.clockText, this.awayText]).setDepth(3);
    }

    // a basket at each end, and whose it is
    const post = (x: number, turned: boolean) => {
      const im = img(s, x, FLOOR, 'ownbasket_hoop').setDepth(6);
      const [ox, oy] = originOf('ownbasket_hoop');
      if (turned) im.setFlipX(true).setOrigin(1 - ox, oy);
    };
    post(HOOP_X, false);
    post(W - HOOP_X, true);
    this.nets = [img(s, this.own, RIM, 'ownbasket_net').setDepth(22), img(s, this.theirs, RIM, 'ownbasket_net').setDepth(22)];
    // (the photo of the rim has the bracket that holds it to the board on one side: the far one is turned round)
    const [nx, ny] = originOf('ownbasket_net');
    this.nets[1].setFlipX(true).setOrigin(1 - nx, ny);
    if (FROM.ownbasket_hoop && THINGS.hoop) this.rimWide = THINGS.hoop.wide;
    // (a pennant on the wall beside each, just inside its board)
    img(s, 168, 78, 'ownbasket_home').setDepth(3).setRotation(-0.02);
    img(s, W - 168, 78, 'ownbasket_away').setDepth(3).setRotation(0.02);

    // the two of them, and the ball
    this.shade = img(s, 0, FLOOR + 5, 'shadow').setDepth(8);
    this.herBody = img(s, 0, 0, 'ownbasket_her_dribble').setDepth(10);
    this.herHead = img(s, 0, 0, 'ownbasket_herhead_set').setDepth(11);
    this.what = img(s, 0, 0, 'ownbasket_qmark').setDepth(11).setVisible(false);
    this.body = img(s, 0, 0, 'ownbasket_steph_guard').setDepth(12);
    this.head = head(s, 'stephanie', 'calm', 0, 0, STEPH_HEAD).setDepth(13);
    this.arms = s.add.image(0, 0, 'ownbasket_ball').setDepth(13.5).setVisible(false);
    this.ball = img(s, 0, 0, 'ownbasket_ball').setDepth(16);

    // the meter from the workout tape
    this.lungs = img(s, 0, 300, 'lungs').setDepth(40).setVisible(false);
    this.breath = img(s, 0, 394, 'breath').setDepth(41).setOrigin(0.5, 1).setVisible(false);

    // back and forward under the left thumb, and the one button that matters under the right
    this.back = img(s, 62, 490, 'ownbasket_btn_back').setDepth(90);
    this.fwd = img(s, 164, 490, 'ownbasket_btn_fwd').setDepth(90);
    this.act = img(s, W - 108, 490, 'ownbasket_btn_shoot').setDepth(90);
    this.noteTape = img(s, cx, 516, 'tape_m').setDepth(44);
    this.note = written(s, cx, 516, '', 16).setDepth(45);
    // (on a keyboard: the arrows, or A and D; the space bar is the button)
    const kb = s.input.keyboard, K = Phaser.Input.Keyboard.KeyCodes;
    if (kb) this.keys = [kb.addKey(K.LEFT), kb.addKey(K.A, false), kb.addKey(K.RIGHT), kb.addKey(K.D, false)];

    this.sx = this.own + 150;
    this.ox = Math.min(this.own + 360, cx + 60);
    this.enter('open');
    this.place();
  }

  // ---- one thing after another -------------------------------------------------------------

  private cue(at: number, run: () => void): void {
    this.cues.push({ at, run });
    this.cues.sort((a, b) => a.at - b.at);
  }

  private enter(phase: Phase): void {
    this.phase = phase;
    this.t = 0;
    this.cues = [];
    if (phase === 'open') {
      // the other girl has it, shoots, and misses: that is the rebound the story starts with
      this.holder = 'her';
      this.pose = 'guard';
      this.look = 'angry';
      this.tell('Here she comes...');
      this.button('steal', false);
      this.cue(0.8, () => this.herShot());
    } else if (phase === 'mine') {
      this.live = true;
      this.holder = 'steph';
      this.held = 0;
      this.pose = 'dribble';
      this.herPose = 'guard';
      this.mood = 'set';
      this.tell('HOLD to shoot... LET GO in the green!');
      this.button('shoot', true);
    } else if (phase === 'aim') {
      this.air = 0;
      this.pose = 'aim';
      this.look = 'inhale';
      this.herPose = 'guard';
      sound.inhale(INHALE / this.host.speed);
      this.tell('...and LET GO in the green!');
    } else if (phase === 'hers') {
      this.turns++;
      this.holder = 'her';
      this.stall = 0;
      this.windup = 0;
      this.herPose = 'dribble';
      this.mood = 'set';
      if (this.pose !== 'steal') this.pose = 'guard';
      this.look = 'angry';
      this.tell('Get close and STEAL it!');
      this.button('steal', true);
    }
  }

  /** On to whatever is next; unless the buzzer has gone, and then that was the game. */
  private next(phase: Phase): void {
    if (this.over) this.final();
    else this.enter(phase);
  }

  /** The words on the strip of tape at the bottom. */
  private tell(text: string): void {
    this.note.setText(text);
    this.noteTape.setVisible(!!text).setScale((this.note.width + 26) / ART.tape_m.w / TEX, 1.1 / TEX);
  }

  private button(which: 'shoot' | 'steal', on: boolean): void {
    applyArt(this.act, `ownbasket_btn_${which}`);
    this.act.setAlpha(on ? 1 : 0.45);
  }

  // ---- the ball -------------------------------------------------------------------------------

  /** Send the ball off, from where it is, one hop after another. */
  private fly(legs: Leg[]): void {
    this.holder = '';
    this.legs = legs;
    this.leg = undefined;
  }

  private give(who: Who): void {
    this.holder = who;
    this.legs = [];
    this.leg = undefined;
  }

  private flyOn(dt: number): void {
    if (!this.leg) {
      const next = this.legs.shift();
      if (!next) return;
      this.leg = { ...next, from: { ...this.at }, k: 0 };
    }
    const g = this.leg, to = typeof g.to === 'function' ? g.to() : g.to;
    g.k = Math.min(1, g.k + dt / g.secs);
    this.at = { x: g.from.x + (to.x - g.from.x) * g.k, y: g.from.y + (to.y - g.from.y) * g.k - 4 * g.rise * g.k * (1 - g.k) };
    this.spin += dt * (to.x < g.from.x ? -11 : 11);
    if (g.k >= 1) {
      this.leg = undefined;
      g.then?.();
    }
  }

  /** Send somebody up in the air and down again, `times` over, starting in `wait` seconds.
   *  If she is in the air already, it waits for her to land. */
  private leap(who: Who, high: number, secs: number, times = 1, wait = 0): void {
    const slot = this.hops[who], hops: Hops = { high, secs, left: times, t: 0, wait };
    if (slot.now && slot.now.wait <= 0) slot.next = hops;
    else slot.now = hops;
  }

  /** How far off the floor somebody is just now. It is worked out from the clock, one whole
   *  jump at a time, so that whatever else happens she comes down where she went up from. */
  private height(who: Who, dt: number): number {
    const slot = this.hops[who], h = slot.now;
    if (!h) return 0;
    if (h.wait > 0) {
      h.wait -= dt;
      return 0;
    }
    h.t += dt;
    if (h.t >= h.secs) {
      // she has landed: on to whatever was waiting, or up again, or that was the last of them
      h.t = 0;
      h.left--;
      if (slot.next || h.left <= 0) {
        slot.now = slot.next;
        slot.next = undefined;
        return 0;
      }
    }
    return h.high * Math.sin((Math.PI * h.t) / h.secs);
  }

  /** Where somebody has the ball when it is thrown or bounces to her. */
  private hands(who: Who): Point {
    return who === 'steph' ? { x: this.sx + 32, y: FLOOR - 88 } : { x: this.ox - 32, y: FLOOR - 88 };
  }

  /** The ball goes through a net: it gives, and swings back. */
  private swing(net: Image): void {
    const full = 1 / TEX;
    this.scene.tweens.add({ targets: net, scaleY: full * 1.35, scaleX: full * 0.86, duration: 90, yoyo: true, ease: 'Quad.out' });
  }

  // ---- Stephanie shoots ----------------------------------------------------------------------

  /** Up she goes, and lets it go: and whatever the meter said, it ends in her own basket. */
  private shoot(): void {
    const W = view.W;
    const air = this.air, own = { x: this.own, y: RIM }, far = this.sx - this.own, across = this.theirs - this.sx;
    this.kind = air > 1 + TOO_LONG / INHALE ? 'long' : air >= ZONE ? 'sweet' : air >= FEEBLE ? 'rim' : 'floor';
    this.shots++;
    this.bounced = 0;
    // (from past half way, it is worth three: to the visitors)
    this.worth = this.sx > W / 2 ? 3 : 2;
    // (in the green, the breath in just stops, and the next thing heard is the net)
    if (this.kind === 'sweet') sound.stopBreath();
    else if (this.kind === 'long') sound.cough();
    else sound.wheeze();
    this.enter('shot');
    this.tell('');
    this.button('shoot', false);
    this.pose = 'shoot';
    this.look = this.kind === 'sweet' ? 'yell' : this.kind === 'long' ? 'ouch' : 'worried';
    this.leap('steph', 58, 0.46);
    sfx.squeak();
    // the other girl goes up to block it, for all the good that does
    this.herPose = 'shoot';
    this.leap('her', 46, 0.44, 1, 0.06);
    this.cue(0.5, () => {
      this.herPose = this.mood === 'what' ? 'shrug' : 'stand';
      // (and she is down again herself, watching it go)
      if (this.phase === 'shot') this.pose = 'stand';
    });

    const up = this.photo('steph', 'shoot')?.hand;
    this.at = up ? { x: this.sx + up[0] * SIZE, y: FLOOR + up[1] * SIZE - BALL / 2 } : { x: this.sx + 2, y: FLOOR - 236 };
    const swish = () => this.swish();
    if (this.kind === 'sweet') {
      // straight back over her head, flat and fast
      this.fly([{ to: own, rise: 26 + far * 0.05, secs: Phaser.Math.Clamp(far / 1100, 0.22, 0.5), then: swish }]);
      this.cue(0.3, () => { this.look = 'smile'; });
    } else if (this.kind === 'rim') {
      // the right way, at least: off the front of the other rim, and all the way back
      this.fly([
        { to: { x: this.theirs - this.rimWide / 2 + 2, y: RIM - 7 }, rise: 96 + across * 0.1, secs: 0.5 + across / 800, then: () => this.clank(this.theirs) },
        { to: own, rise: 118, secs: 1.2, then: swish },
      ]);
    } else if (this.kind === 'floor') {
      // not even that far: it comes down short, and the floor does the rest
      const x = Math.min(this.sx + Math.max(90, across * 0.55), this.theirs - 26);
      this.fly([
        { to: { x, y: FLOOR - BALL / 2 }, rise: 44, secs: 0.45, then: () => this.boing() },
        { to: own, rise: 200, secs: 1.25, then: swish },
      ]);
    } else {
      // held on to far too long: straight up, and off the scoreboard
      this.fly([
        { to: { x: W / 2, y: this.boardFoot }, rise: 28, secs: 0.5, then: () => this.offTheBoard() },
        { to: own, rise: 50, secs: 0.85, then: swish },
      ]);
    }
  }

  /** Off a rim. */
  private clank(x: number): void {
    this.bounced++;
    sfx.rim();
    this.host.word('ownbasket_clank', x + (x > view.W / 2 ? -70 : 70), RIM - 56);
    const net = this.nets[x > view.W / 2 ? 1 : 0];
    this.scene.tweens.add({ targets: net, x: net.x + 3, duration: 40, yoyo: true, repeat: 3 });
    if (this.phase === 'shot') {
      this.look = 'shocked';
      this.baffled();
    }
  }

  /** The other girl has seen something she cannot account for. */
  private baffled(): void {
    this.mood = 'what';
    if (this.herPose === 'stand') this.herPose = 'shrug';
  }

  /** Off the floor, a great deal harder than it came down. */
  private boing(): void {
    this.bounced++;
    sfx.bounce(1.5);
    sound.boing();
    this.host.word('ownbasket_boing', this.at.x, FLOOR - 70);
    this.look = 'shocked';
    this.baffled();
  }

  private offTheBoard(): void {
    this.bounced++;
    sfx.board();
    this.host.word('bonk', view.W / 2 + 90, this.boardFoot + 18);
    this.scene.tweens.add({ targets: this.board, rotation: 0.07, duration: 60, yoyo: true, repeat: 2 });
    this.scene.cameras.main.shake(120, 0.005);
    this.look = 'shocked';
    this.baffled();
  }

  /** In it goes. Her own basket: the only one she ever scored in. */
  private swish(): void {
    const W = view.W;
    this.away += this.worth;
    this.points += this.worth;
    this.baskets++;
    sfx.swish();
    sound.cash();
    this.swing(this.nets[0]);
    this.host.word('ownbasket_swish', this.own + 96, RIM - 44, true);
    this.onTheBoard();
    this.enter('scored');
    const n = this.baskets - 1;
    // (the first time, there is a burst that says so instead)
    this.tell(n > 0 ? `Her OWN basket: ${this.worth} for the visitors` : '');
    // nobody is more pleased than she is
    this.pose = 'cheer';
    this.look = 'laugh';
    this.leap('steph', 26, 0.3, 4);
    // ...and nobody less sure what to say than the other girl, who backs off to be given the ball
    this.herPose = 'shrug';
    this.mood = 'what';
    this.what.setVisible(true);
    if (n === 0) {
      // (said once, down on the floor, clear of their heads and of what they have to say about it)
      this.cue(0.35, () => {
        this.host.word('ownbasket_wrong', W / 2, 468, true);
        sound.aww();
      });
    }
    this.cue(0.12, () => this.say('steph', this.worth === 3 && n > 0 ? 'FROM DOWNTOWN!' : SHE_SAYS[n % SHE_SAYS.length], 1.25));
    this.cue(0.95, () => {
      this.what.setVisible(false);
      this.say('her', HER_ANSWER[n < HER_ANSWER.length ? n : 2 + (n % 2)], 1.5);
    });
    // down through the net, one bounce, and out to her
    this.fly([
      { to: { x: this.own, y: FLOOR - BALL / 2 }, rise: 0, secs: 0.28, then: () => sfx.bounce(1.1) },
      { to: () => this.hands('her'), rise: 64, secs: 0.75, then: () => { this.give('her'); sfx.slap(); } },
    ]);
    this.cue(1.75, () => {
      this.what.setVisible(false);
      this.next('hers');
    });
  }

  /** The visitors' score has changed: its lights are bright for a moment (or, on the paper board, the number jumps). */
  private onTheBoard(): void {
    this.fresh = 0.5;
    if (this.awayText) this.scene.tweens.add({ targets: this.awayText, scale: 1.7, duration: 110, yoyo: true, ease: 'Quad.out' });
  }

  /** The seven strokes of one of the scoreboard's numbers, each as a six-sided shape, measured from
   *  the number's top left corner in the game's pixels: three across (top, middle, bottom) and four
   *  down, with a little gap where they meet, and the whole of it leaning to the right as the
   *  unlit ones in the photo do. */
  private strokesOf(l: Lights, w: number, tall: number): Record<string, Point[]> {
    const wide = l.wide * w, high = l.tall * tall, h = (l.thick * w) / 2, gap = h * 0.28, lean = l.lean * w;
    const across = (y: number): number[][] => [[h + gap, y], [2 * h + gap, y - h], [wide - 2 * h - gap, y - h], [wide - h - gap, y], [wide - 2 * h - gap, y + h], [2 * h + gap, y + h]];
    const down = (x: number, top: number, foot: number): number[][] => [[x, top], [x + h, top + h], [x + h, foot - h], [x, foot], [x - h, foot - h], [x - h, top + h]];
    const flat: Record<string, number[][]> = {
      a: across(h), g: across(high / 2), d: across(high - h),
      f: down(h, h + gap, high / 2 - gap), b: down(wide - h, h + gap, high / 2 - gap),
      e: down(h, high / 2 + gap, high - h - gap), c: down(wide - h, high / 2 + gap, high - h - gap),
    };
    const out: Record<string, Point[]> = {};
    for (const [name, pts] of Object.entries(flat)) out[name] = pts.map(([x, y]) => ({ x: x + lean * (1 - y / high), y }));
    return out;
  }

  /** Light the scoreboard: the home score, the seconds left, the visitors' score. Two figures each,
   *  the first of them dark for a number under ten. */
  private light(home: number, seconds: number | null, away: number, bright: boolean): void {
    const g = this.lights, photo = THINGS.board;
    const now = `${home} ${seconds} ${away} ${bright}`;
    if (!g || !photo || now === this.showing) return;
    this.showing = now;
    g.clear();
    const l = photo.lights, top = -photo.tall / 2 + l.top * photo.tall;
    const figure = (cell: number, n: number, colour: number) => {
      const left = -photo.w / 2 + l.at[cell] * photo.w;
      g.fillStyle(colour, 1);
      for (const stroke of STROKES[n]) g.fillPoints(this.strokes[stroke].map((p) => new Phaser.Math.Vector2(left + p.x, top + p.y)), true);
    };
    const number = (cell: number, n: number, colour: number) => {
      const shown = Math.min(99, Math.max(0, Math.floor(n)));
      if (shown >= 10) figure(cell, Math.floor(shown / 10), colour);
      figure(cell + 1, shown % 10, colour);
    };
    number(0, home, LIT.score);
    if (seconds !== null) number(2, seconds, LIT.clock);
    number(4, away, bright ? LIT.fresh : LIT.score);
  }

  // ---- the other girl has it ---------------------------------------------------------------------

  /** She shoots, at the basket she is supposed to shoot at: a miss, then a make, turn about. */
  private herShot(): void {
    const makes = this.herShots++ % 2 === 1;
    const far = this.ox - this.own, rise = 92 + far * 0.12, secs = 0.55 + far / 900;
    this.phase = 'hershot';
    this.t = 0;
    this.cues = [];
    this.tell('');
    this.button('steal', false);
    this.herPose = 'shoot';
    this.leap('her', 46, 0.44);
    this.cue(0.5, () => { this.herPose = 'stand'; });
    sfx.squeak();
    this.look = 'shocked';
    const up = this.photo('her', 'shoot')?.hand;
    this.at = up ? { x: this.ox + up[0] * SIZE, y: FLOOR + up[1] * SIZE - BALL / 2 } : { x: this.ox - 2, y: FLOOR - 236 };
    if (makes) {
      this.fly([{ to: { x: this.own, y: RIM }, rise, secs, then: () => this.herBasket() }]);
    } else {
      // off the rim, and down to Stephanie: REBOUND!
      this.fly([
        { to: { x: this.own + this.rimWide / 2 - 2, y: RIM - 7 }, rise, secs, then: () => this.clank(this.own) },
        { to: () => this.hands('steph'), rise: 84, secs: 0.7, then: () => this.rebound() },
      ]);
    }
  }

  private rebound(): void {
    sfx.slap();
    this.host.word('ownbasket_rebound', this.sx + 10, FLOOR - 250);
    this.look = 'smile';
    this.next('mine');
  }

  /** Two for the visitors, the usual way; and then it is Stephanie's ball. */
  private herBasket(): void {
    this.away += 2;
    sfx.swish();
    this.swing(this.nets[0]);
    this.host.word('ownbasket_swish', this.own + 96, RIM - 44);
    this.onTheBoard();
    this.phase = 'loose';
    this.herPose = 'cheer';
    this.mood = 'laugh';
    this.look = 'worried';
    this.leap('her', 22, 0.3, 2);
    this.fly([
      { to: { x: this.own, y: FLOOR - BALL / 2 }, rise: 0, secs: 0.28, then: () => sfx.bounce(1.1) },
      { to: () => this.hands('steph'), rise: 64, secs: 0.6, then: () => { sfx.slap(); this.look = 'smile'; this.next('mine'); } },
    ]);
  }

  /** Stephanie goes for the ball. Near enough, she has it; from too far off, she has a handful of air. */
  private trySteal(): void {
    if (this.busy > 0) return;
    this.busy = 0.5;
    this.pose = 'steal';
    this.lunge = 0;
    this.scene.tweens.add({ targets: this, lunge: 20, duration: 90, ease: 'Quad.out', yoyo: true, hold: 120 });
    sfx.squeak();
    if (this.ox - this.sx <= REACH) {
      this.look = 'yell';
      this.cue(this.t + 0.09, () => this.stole());
    } else {
      sound.whoosh();
      this.look = 'guilty';
      this.host.word('whiff', this.sx + 84, FLOOR - 150);
    }
  }

  private stole(): void {
    sfx.slap();
    this.host.word('ownbasket_steal', (this.sx + this.ox) / 2, FLOOR - 236);
    this.phase = 'loose';
    this.cues = [];
    this.tell('');
    this.herPose = 'shrug';
    this.mood = 'what';
    this.windup = 0;
    this.look = 'smug';
    this.fly([{ to: () => this.hands('steph'), rise: 22, secs: 0.16, then: () => this.next('mine') }]);
  }

  /** She dithered, and the other girl has taken it off her. */
  private stripped(): void {
    sfx.slap();
    sfx.squeak();
    this.host.word('ownbasket_stolen', (this.sx + this.ox) / 2, FLOOR - 236);
    this.phase = 'loose';
    this.cues = [];
    this.tell('');
    this.button('steal', false);
    this.look = 'shocked';
    this.pose = 'guard';
    this.busy = 0.45;
    this.herPose = 'steal';
    this.fly([{ to: () => this.hands('her'), rise: 22, secs: 0.16, then: () => this.next('hers') }]);
  }

  // ---- the end ---------------------------------------------------------------------------------

  /** The buzzer. A shot that is on its way still counts; anything else stops where it is. */
  private buzz(): void {
    this.over = true;
    this.clock = 0;
    sfx.buzzer();
    this.host.word('ownbasket_buzzer', view.W / 2, 168);
    if (this.phase === 'mine' || this.phase === 'hers') this.final();
  }

  /** The final score, read out: every point on the board is the visitors', and Stephanie
   *  scored a good few of them. One basket is all it takes to have won this. */
  private final(): void {
    const s = this.scene, cx = view.W / 2, won = this.points > 0;
    this.phase = 'final';
    this.t = 0;
    this.cues = [];
    this.hush();
    sound.stopBreath();
    this.tell('');
    this.windup = 0;
    for (const o of [this.back, this.fwd, this.act, this.lungs, this.breath]) o.setVisible(false);
    if (this.holder === '') this.fly([{ to: { x: this.at.x, y: FLOOR - BALL / 2 }, rise: 0, secs: 0.3, then: () => sfx.bounce(0.8) }]);
    this.pose = won ? 'cheer' : 'stand';
    this.look = won ? 'laugh' : 'worried';
    this.herPose = 'cheer';
    this.mood = 'laugh';
    if (won) this.leap('steph', 24, 0.32, 6);
    this.leap('her', 20, 0.34, 6, 0.09);
    this.cue(0.7, () => {
      // (down where the buttons were, clear of the two of them and of the stamp that is coming)
      img(s, cx, 476, 'ownbasket_slip').setDepth(95).setRotation(-0.015);
      label(s, cx, 456, `STEPHANIE SCORED ${this.points}!`, 44, '#f6c430').setDepth(96).setRotation(-0.015);
      written(s, cx, 504, won ? 'every one of them in her own basket' : 'not even in her own basket', 21).setDepth(96).setRotation(-0.015);
      if (won) sound.win();
    });
    this.cue(this.host.auto ? 2.4 : 3.6, () => {
      this.phase = 'done';
      this.host.finish(won);
    });
  }

  // ---- what they say ----------------------------------------------------------------------------

  /** The top of somebody's head, and her mouth. */
  private top(who: Who): Point {
    return who === 'steph' ? { x: this.head.x, y: this.head.y - STEPH_HEAD } : { x: this.herChin.x, y: this.herChin.y - this.herTall };
  }

  private mouth(who: Who): Point {
    return who === 'steph' ? { x: this.head.x, y: this.head.y - STEPH_HEAD * 0.26 } : { x: this.herChin.x, y: this.herChin.y - this.herTall * 0.25 };
  }

  /** Something said, on a scrap of paper over the head of whoever said it, which goes where she goes. */
  private say(who: Who, text: string, secs: number): void {
    this.said = this.said.filter((b) => (b.who === who ? (b.box.destroy(), false) : true));
    const top = this.top(who), out = who === 'steph' ? -1 : 1;
    // (clear of the scoreboard, and of her own arms when they are up over her head)
    const up = who === 'steph' ? (this.arms.visible ? 72 : 30) : 64;
    const x = Phaser.Math.Clamp(top.x + out * 26, 130, view.W - 130), y = Math.max(this.boardFoot + 30, top.y - up);
    const box = bubble(this.scene, x, y, text, this.mouth(who));
    this.said.push({ who, box, dx: x - top.x, dy: y - top.y, left: secs });
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  // ---- the controls --------------------------------------------------------------------------------

  /** Which of the three things to press a point on the page is: the bottom left is back
   *  and forward, and everywhere else is the button. */
  private zone(at: Point): 'back' | 'fwd' | 'act' {
    if (at.y > 380 && at.x < 236) return at.x < 113 ? 'back' : 'fwd';
    return 'act';
  }

  /** Which way she is being told to go: a finger on an arrow (or sliding from one to the other), a key, or a bot. */
  private steer(): number {
    let dir = this.botDir;
    const cam = this.scene.cameras.main;
    for (const p of this.scene.input.manager.pointers) {
      if (!p.isDown) continue;
      const z = this.zone(cam.getWorldPoint(p.x, p.y));
      if (z === 'back') dir--;
      else if (z === 'fwd') dir++;
    }
    const [left, a, right, d] = this.keys;
    if (left?.isDown || a?.isDown) dir--;
    if (right?.isDown || d?.isDown) dir++;
    return Math.sign(dir);
  }

  press(at: Point): void {
    if (this.zone(at) !== 'act') return;
    if (this.phase === 'mine' && this.busy <= 0) this.enter('aim');
    else if (this.phase === 'hers') this.trySteal();
  }

  release(at: Point): void {
    if (this.phase === 'aim' && this.zone(at) === 'act') this.shoot();
  }

  // ---- every frame -----------------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    this.busy -= dt;
    this.fresh -= dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    this.jump = this.height('steph', dt);
    this.hop = this.height('her', dt);
    if (this.live && !this.over) {
      this.clock -= dt;
      if (this.clock <= 0) this.buzz();
    }

    // Stephanie goes where she is sent, while she is free to; never past the other girl
    const free = this.phase === 'mine' || this.phase === 'hers' || this.phase === 'hershot' || this.phase === 'loose' || this.phase === 'open';
    const dir = free && this.busy <= 0 ? this.steer() : 0;
    const before = this.sx;
    // (with the ball she stops short of the far end, so that the other girl has room to guard her)
    const most = this.phase === 'mine' ? Math.min(this.ox - GAP, this.theirs - 34 - GUARD + 14) : this.ox - GAP;
    this.sx = Phaser.Math.Clamp(this.sx + dir * SPEED * dt, this.own + 130, Math.max(this.own + 130, most));
    this.moving = Math.abs(this.sx - before) > 0.01;
    if (this.moving) this.run += Math.abs(this.sx - before);
    if (this.busy <= 0 && this.pose === 'steal') this.pose = 'guard';

    const herBefore = this.ox;
    if (this.phase === 'mine' || this.phase === 'aim') {
      // the other girl guards her: in front, and backing off as she comes
      const want = Math.min(this.sx + GUARD, this.theirs - 34);
      this.ox = Math.max(this.sx + GAP, this.ox + Phaser.Math.Clamp(want - this.ox, -HER_BACK * dt, HER_BACK * dt));
      if (this.phase === 'mine') {
        this.held += dt;
        // (she can be seen to be thinking about it for a second first, and there is fair warning)
        this.herPose = this.held > HOG - 1.1 ? 'steal' : 'guard';
        if (this.held > HOG - 2.6 && this.held - dt <= HOG - 2.6) this.tell('SHOOT it, before she takes it!');
        if (this.held > HOG) this.stripped();
      } else {
        this.air += dt / INHALE;
        if (this.air > 1) this.look = 'hold';
        if (this.air > 1 + TOO_LONG / INHALE) this.shoot();
      }
    } else if (this.phase === 'scored') {
      // she backs off to be given the ball
      this.ox = Math.min(this.theirs - 34, this.ox + Math.max(0, this.sx + GUARD + 60 - this.ox) * Math.min(1, dt * 5));
    } else if (this.phase === 'hers') {
      this.herTurn(dt);
    } else if (this.phase === 'final') {
      // room for both of them to jump up and down in
      const short = Math.max(0, 168 - (this.ox - this.sx)) * Math.min(1, dt * 5), had = this.ox;
      this.ox = Math.min(this.theirs - 34, this.ox + short);
      this.sx -= short - (this.ox - had);
    }
    this.herMoving = Math.abs(this.ox - herBefore) > 0.01;
    if (this.herMoving) this.herRun += Math.abs(this.ox - herBefore);

    // the ball: bounced by whoever has it, or on its way somewhere
    if (this.holder === '') {
      this.flyOn(dt);
    } else {
      const dribbling = this.holder === 'steph' ? this.pose === 'dribble' : this.herPose === 'dribble';
      if (dribbling) {
        const was = Math.floor(this.drib);
        this.drib += dt * 2.7;
        if (Math.floor(this.drib) !== was) sfx.bounce(0.55);
      }
    }
    this.place();

    for (const b of this.said) {
      b.left -= dt;
      const top = this.top(b.who);
      if (b.left <= 0) b.box.destroy();
      else b.box.setPosition(top.x + b.dx, top.y + b.dy);
    }
    this.said = this.said.filter((b) => b.left > 0);
  }

  /** The other girl brings the ball up: on towards Stephanie's basket until she is near
   *  enough, or until Stephanie is in the way, and then up for a shot. */
  private herTurn(dt: number): void {
    if (this.windup > 0) {
      this.windup -= dt;
      if (this.windup <= 0) this.herShot();
      return;
    }
    const blocked = this.ox - this.sx < GAP + 16;
    if (blocked) this.stall += dt;
    else this.ox = Math.max(this.sx + GAP, this.ox - HER_SPEED * dt);
    if (this.ox - this.own < HER_RANGE || this.stall > 0.9) {
      this.windup = HER_WINDUP;
      this.herPose = 'shoot';
    }
  }

  /** Put the two of them where they are, their heads on their bodies, and the ball in somebody's hands or in the air. */
  private place(): void {
    const k = 1 / TEX;
    // Stephanie
    const aiming = this.phase === 'aim', full = aiming ? Math.min(this.air, 1.2) : 0;
    let pose = this.pose;
    if (pose === 'dribble' && this.moving) pose = Math.floor(this.run / 34) % 2 ? 'run1' : 'run2';
    const key = `ownbasket_steph_${pose}`;
    if (this.body.texture.key !== key) applyArt(this.body, key);
    // (she fills up like Bill does on the carpet, and shakes with the effort of holding it)
    const wide = 1 + 0.12 * full, strain = aiming && this.air > 1 ? Math.sin(this.t * 40) * 2 : 0;
    const x = this.sx + this.lunge + strain, y = FLOOR - this.jump;
    this.body.setPosition(x, y).setScale(k * wide * SIZE, k * SIZE);
    const c = this.chin('steph', pose);
    if (this.worn !== this.look) {
      setLook(this.head, 'stephanie', this.look);
      this.worn = this.look;
    }
    this.head.setPosition(x + c.x * wide * SIZE, y + c.y * SIZE - full * 5).setRotation(c.tilt - full * 0.14);
    const up = this.photo('steph', pose)?.arms ? `${key}_arms` : '';
    if (up && this.arms.texture.key !== up) applyArt(this.arms, up);
    this.arms.setVisible(!!up).setPosition(x, y).setScale(k * SIZE);
    const red = Math.round(255 - Math.min(1, Math.max(0, this.air - 0.9) * 1.6) * 70 * (aiming ? 1 : 0));
    this.head.setTint((255 << 16) | (red << 8) | red);

    // the other girl
    let hers = this.herPose;
    if (hers === 'dribble' && this.herMoving) hers = Math.floor(this.herRun / 30) % 2 ? 'run1' : 'run2';
    const herKey = `ownbasket_her_${hers}`;
    if (this.herBody.texture.key !== herKey) applyArt(this.herBody, herKey);
    const hy = FLOOR - this.hop;
    this.herBody.setPosition(this.ox, hy).setScale(k * SIZE);
    // (in a photo she has her own head, with what she thinks of it all on it; the paper doll has one hung on)
    const hc = this.chin('her', hers), face = `ownbasket_herhead_${this.mood}`, own = this.photo('her', hers);
    if (this.herHead.texture.key !== face) applyArt(this.herHead, face);
    this.herChin = { x: this.ox + hc.x * SIZE, y: hy + hc.y * SIZE };
    this.herTall = (own?.tall ?? HEAD_R * 2) * SIZE;
    this.herHead.setPosition(this.herChin.x, this.herChin.y).setRotation(hc.tilt).setScale(k * SIZE).setVisible(!own);
    this.what.setPosition(this.herChin.x + 30, this.herChin.y - this.herTall - 16);

    // the ball
    // (bounced under the hand that is out for it; held where the hands are, in a pose that holds it)
    const beat = Math.abs(Math.sin(this.drib * Math.PI));
    const under = (hand: [number, number] | undefined, side: number, cx: number): Point => {
      const out = hand ? hand[0] * SIZE + side * 4 : side * 38, high = hand ? Math.max(30, -hand[1] * SIZE - BALL - 2) : 54;
      return { x: cx + out, y: FLOOR - BALL / 2 - beat * high };
    };
    if (this.holder === 'steph') {
      const held = this.photo('steph', pose)?.hand;
      if (pose === 'aim') this.at = held ? { x: x + held[0] * wide * SIZE - 6, y: y + held[1] * SIZE - full * 4 } : { x: x + 12, y: y - 92 - full * 4 };
      else if (pose === 'dribble' || pose === 'run1' || pose === 'run2') this.at = under(this.photo('steph', 'dribble')?.hand, 1, x);
      else this.at = { x: x + 32, y: y - 88 };
    } else if (this.holder === 'her') {
      const held = this.photo('her', hers)?.hand;
      if (hers === 'dribble' || hers === 'run1' || hers === 'run2') this.at = under(this.photo('her', 'dribble')?.hand, -1, this.ox);
      else if (this.windup > 0) this.at = held ? { x: this.ox + held[0] * SIZE, y: hy + held[1] * SIZE - BALL / 2 } : { x: this.ox - 8, y: hy - 190 + this.windup * 190 };
      else this.at = { x: this.ox - 32, y: hy - 88 };
    }
    this.ball.setPosition(this.at.x, this.at.y).setRotation(this.spin + (this.holder ? this.drib * 2 : 0))
      .setDepth(this.holder === 'her' ? 11.5 : this.holder === 'steph' ? 14 : 20);
    const high = Phaser.Math.Clamp((FLOOR - this.at.y) / 380, 0, 1);
    this.shade.setPosition(this.at.x, FLOOR + 5).setScale(k * (0.62 - high * 0.3)).setAlpha(0.75 - high * 0.5);

    // the meter: beside her while she has the ball, filling while she holds the button
    const shown = (this.phase === 'mine' || aiming) && !this.over;
    this.lungs.setVisible(shown).setX(this.sx - 96).setAlpha(aiming ? 1 : 0.6);
    this.breath.setVisible(aiming).setX(this.sx - 96).setScale(k, (k * Math.min(this.air, 1) * 188) / 8);
    this.back.setScale(k * (this.steer() < 0 ? 0.92 : 1));
    this.fwd.setScale(k * (this.steer() > 0 ? 0.92 : 1));

    // the scoreboard
    // (when the game is over, the clock blinks at nothing)
    const left = Math.ceil(Math.max(0, this.clock)), on = !this.over || Math.floor(this.t * 3) % 2 === 0;
    this.light(this.home, on ? left : null, this.away, this.fresh > 0);
    this.homeText?.setText(`${this.home}`);
    this.awayText?.setText(`${this.away}`);
    this.clockText?.setText(`0:${String(left).padStart(2, '0')}`).setVisible(on);
  }

  /** Where somebody's chin is in a pose, from the spot she stands on, and how far her head
   *  tips: from the photo of the pose if there is one, otherwise from the paper doll. */
  private chin(who: Who, pose: string): { x: number; y: number; tilt: number } {
    const photo = this.photo(who, pose);
    if (photo) return { x: photo.chin[0], y: photo.chin[1], tilt: photo.tilt };
    const d = (who === 'steph' ? STEPH : HER)[pose], side = who === 'steph' ? 1 : -1;
    return { x: side * (d.head[0] - Math.sin(d.tilt) * HEAD_R), y: d.head[1] + Math.cos(d.tilt) * HEAD_R, tilt: side * d.tilt };
  }

  /** What the table says about the photo of somebody in a pose: if there is one, and it came.
   *  (If the pictures could not be fetched she is a paper doll, and is measured as one.) */
  private photo(who: Who, pose: string): Body | undefined {
    return FROM[`ownbasket_${who}_${pose}`] ? BODIES[who]?.[pose] : undefined;
  }

  timeUp(): boolean {
    return this.points > 0;
  }

  /** The careful bot goes a little way up the court and shoots, letting go at a different
   *  place on the meter each time, so that all four shots are seen; and steals the ball
   *  back every other time, so that the other girl is seen to shoot as well. The clumsy
   *  one never shoots at all (it dithers until the ball is taken off her) and lunges for
   *  the ball from much too far away: that is the only way to lose. */
  bot(dt: number): void {
    const good = this.host.auto === 'good', centre = { x: view.W / 2, y: 270 };
    this.botDir = 0;
    this.botIn -= dt;
    if (this.phase === 'mine') {
      // (to and fro, and a little further up the court each time)
      if (!good) this.botDir = Math.sin(this.t * 2.4) > -0.55 ? 1 : -1;
      else if (this.held < 0.45 + 0.35 * (this.shots % 3)) this.botDir = 1;
      else this.press(centre);
    } else if (this.phase === 'aim') {
      if (this.air >= [0.9, 0.56, 0.16, 9][this.shots % 4]) this.release(centre);
    } else if (this.phase === 'hers') {
      const gap = this.ox - this.sx;
      if (good && this.turns % 2 === 1) {
        if (gap > REACH - 10) this.botDir = 1;
        else if (this.busy <= 0) this.press(centre);
      } else if (!good) {
        // (backing away from her, and grabbing at the air)
        this.botDir = -1;
        if (this.botIn <= 0 && gap > REACH + 30) {
          this.botIn = 1.2;
          this.press(centre);
        }
      }
    }
  }
}
