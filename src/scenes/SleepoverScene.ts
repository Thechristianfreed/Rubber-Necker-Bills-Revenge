import Phaser from 'phaser';
import { DEPTH, H, MAX_W, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { DOLL, ROOM } from '../art/sleepover';
import { ART, applyArt, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { pick } from '../data/phrases';
import { PlayScene, Point } from './PlayScene';

type Image = Phaser.GameObjects.Image;

/** Taps this soon after the light goes off are let go: nobody stops on a dime. */
const GRACE = 0.3;
/** The fastest two bops can follow one another, however many fingers are tapping. */
const BOP_GAP = 0.07;
/** How dark the room gets, and how far the music drops with it. */
const DARK = 0.86;
const HUSH = 0.35;
const BOP_WORDS = ['bop', 'blap', 'smack', 'thwack', 'pow'];
const DEPTHS = { wall: DEPTH.far, back: DEPTH.farCars, couch: DEPTH.necks, dj: DEPTH.heads, front: DEPTH.billBack, sock: DEPTH.billCar, dark: 80, glow: 85 };

/** The second bonus level: a sleepover, and a light switch. While the light
 *  is on, every tap is another bop on DJ's head with the Hot Carl. When it
 *  goes off, everybody freezes: swinging in the dark makes a racket. After the
 *  last round, or the third racket, Alex's dad comes down and it is over. */
export class SleepoverScene extends PlayScene {
  private phase: 'story' | 'dark' | 'lit' | 'dad' = 'story';
  /** Which spell of light is next (or on now), and how long this phase has left. */
  private round = 0;
  private left = 0;
  private sinceOff = 9;
  private lastBop = -9;
  /** Whether this spell of darkness has already cost a heart: one each is the most it can. */
  private struck = false;
  private botT = 0;
  /** Bops under the current light, the most under any one light, and the best rate. */
  private thisLight = 0;
  private bestLight = 0;
  private t = 0;

  private dark!: Phaser.GameObjects.Rectangle;
  private neil!: Image;
  private armIm!: Image;
  private dj!: Image;
  private forrest!: Image;
  private christian!: Image;
  private lightSwitch!: Image;
  private door!: Image;
  private dadIm!: Image;
  private lamp!: Image;
  private zzz!: Image;
  private recDot!: Image;
  private glows: Image[] = [];
  /** Things that sit a fixed distance from the right edge, to move if the screen changes. */
  private rightSide: { im: Image; dx: number }[] = [];

  constructor() {
    super('sleepover');
    this.buttons = false;
  }

  create(): void {
    this.begin();
    this.phase = 'story';
    this.round = 0;
    this.left = 0;
    this.sinceOff = 9;
    this.lastBop = -9;
    this.struck = false;
    this.botT = 0;
    this.thisLight = this.bestLight = 0;
    this.t = 0;
    this.glows = [];
    this.rightSide = [];
    this.tags = [];
    this.buildRoom();
    this.ready();
    this.setLight(false, true);
  }

  // ---- the room and everyone in it ---------------------------------------------------

  private get cx(): number {
    return view.W * ROOM.couchAt;
  }

  /** The middle of DJ's head: where the sock lands. */
  private get target(): Point {
    return { x: this.cx + ROOM.djHead[0], y: ROOM.djHead[1] };
  }

  private buildRoom(): void {
    const x0 = -BLEED, ww = MAX_W + BLEED * 2, cx = this.cx, W = view.W;
    const band = (key: string, y: number) => this.add.tileSprite(x0, y, ww * TEX, ART[key].h * TEX, key)
      .setOrigin(0, 0).setScale(1 / TEX).setDepth(DEPTHS.wall);
    band('rec_wall', -BLEED);
    band('rec_floor', ROOM.floorY);
    img(this, cx + 30, 150, 'rec_window').setDepth(DEPTHS.wall + 1);
    this.lamp = img(this, ROOM.lamp[0], ROOM.lamp[1], 'rec_lamp').setDepth(DEPTHS.back);

    const right = (key: string, [dx, y]: [number, number], depth: number): Image => {
      const im = img(this, W - dx, y, key).setDepth(depth);
      this.rightSide.push({ im, dx });
      return im;
    };
    this.door = right('rec_door', ROOM.doorFromRight, DEPTHS.wall + 1);
    this.dadIm = right('alex_dad', [ROOM.doorFromRight[0], ROOM.doorFromRight[1] + 14], DEPTHS.front).setVisible(false);
    this.christian = right('kid_christian', ROOM.christianFromRight, DEPTHS.front);
    const [cdx, cy] = ROOM.christianFromRight;
    this.lightSwitch = right('switch_off', [cdx - DOLL.reach[0], cy + DOLL.reach[1]], DEPTHS.back);

    // Forrest is behind the couch, so it hides his legs; Neil is at the head end
    this.forrest = img(this, cx + ROOM.forrest[0], ROOM.forrest[1], 'kid_forrest').setDepth(DEPTHS.back);
    img(this, cx, ROOM.couchY, 'rec_couch').setDepth(DEPTHS.couch);
    this.dj = img(this, cx, ROOM.djY, 'dj_asleep').setDepth(DEPTHS.dj);
    this.neil = img(this, cx + ROOM.neil[0], ROOM.neil[1], 'kid_neil').setDepth(DEPTHS.front);
    this.armIm = img(this, 0, 0, 'neil_arm').setDepth(DEPTHS.sock);
    this.restArm();

    // the dark, and what still shows in it
    this.dark = this.add.rectangle(W / 2, H / 2, MAX_W * 2, H * 2, 0x060818, 1).setDepth(DEPTHS.dark).setAlpha(0);
    const glow = (im: Image): Image => { this.glows.push(im.setDepth(DEPTHS.glow)); return im; };
    for (const who of [this.neil, this.forrest, this.christian]) {
      const eyes = glow(img(this, who.x + DOLL.head[0], who.y + DOLL.head[1] + 2, 'eyes'));
      if (who === this.christian) this.rightSide.push({ im: eyes, dx: W - eyes.x });
    }
    glow(img(this, this.forrest.x + DOLL.phone[0], this.forrest.y + DOLL.phone[1], 'phone_glow'));
    this.recDot = img(this, this.forrest.x + DOLL.phone[0], this.forrest.y + DOLL.phone[1] - 26, 'rec_dot').setDepth(DEPTHS.glow);
    this.zzz = img(this, this.target.x + 30, this.target.y - 62, 'zzz').setDepth(DEPTHS.glow);

    // who is who, on scraps of tape, until the first light comes on
    this.nameTag(this.neil.x, this.neil.y + 16, 'NEIL');
    this.nameTag(this.target.x + 96, this.target.y + 76, 'DJ');
    this.nameTag(this.forrest.x + 12, this.forrest.y - 222, 'FORREST');
    this.nameTag(this.christian.x - 4, this.christian.y + 16, 'CHRISTIAN');
  }

  private tags: Phaser.GameObjects.Container[] = [];

  private nameTag(x: number, y: number, name: string): void {
    const t = this.add.text(0, 0, name, {
      fontFamily: '"Permanent Marker", "Comic Sans MS", cursive', fontSize: '13px', color: '#2a2320',
      padding: { x: 4, y: 3 }, resolution: Math.max(1, Math.ceil(view.RES)),
    }).setOrigin(0.5);
    const tape = img(this, 0, 0, 'tape_s');
    tape.setScale(tape.scale * ((t.width + 8) / ART.tape_s.w), tape.scale * 0.85);
    this.tags.push(this.add.container(x, y, [tape, t]).setDepth(DEPTHS.glow + 1).setRotation((this.tags.length % 2 ? 1 : -1) * 0.04));
  }

  /** Neil's arm, up, with the toe of the sock hanging just over DJ's head. */
  private restArm(): void {
    this.armIm.setPosition(this.neil.x + DOLL.shoulder[0], this.neil.y + DOLL.shoulder[1]).setRotation(0);
  }

  protected onResize(): void {
    super.onResize();
    for (const r of this.rightSide) r.im.x = view.W - r.dx;
  }

  // ---- how it opens -----------------------------------------------------------------

  /** The story so far, then the banner, then the first wait in the dark. */
  protected opening(): void {
    const start = () => {
      this.intro();
      this.phase = 'dark';
      this.left = (this.level.lights?.[0]?.[0] ?? 2) + 1.4;
      this.sinceOff = 9;
    };
    if (this.level.prologue) this.storyPage(this.level.prologue, start, { art: 'neil_arm', face: false });
    else start();
  }

  // ---- the light ---------------------------------------------------------------------

  private setLight(on: boolean, quiet = false): void {
    // (a lamp that was still flickering from a swing in the dark stops)
    this.tweens.killTweensOf(this.dark);
    this.dark.setAlpha(on ? 0 : DARK);
    for (const g of this.glows) g.setVisible(!on);
    applyArt(this.lightSwitch, on ? 'switch_on' : 'switch_off');
    if (quiet) return;
    sound.flick(on);
    sound.dim(on ? 1 : HUSH);
    // Christian's whole arm goes with the switch
    this.tweens.add({ targets: this.christian, y: this.christian.y + (on ? -5 : 5), duration: 50, yoyo: true });
    if (on) this.cameras.main.flash(90, 255, 250, 225);
  }

  private lightsOn(): void {
    this.phase = 'lit';
    this.left = this.level.lights![this.round][1];
    this.thisLight = 0;
    this.setLight(true);
    this.teach('on', 'Lights ON - TAP as fast as you can!');
    if (this.round === 0) {
      this.dropTags(600);
      this.say({ text: 'HOT CARL!' }, 0, { x: this.neil.x + 30, y: this.neil.y - 208 });
    }
  }

  /** The name tags come off once everyone has been seen in the light. */
  private dropTags(after: number): void {
    for (const tag of this.tags) this.tweens.add({ targets: tag, alpha: 0, duration: 300, delay: after, onComplete: () => tag.destroy() });
    this.tags = [];
  }

  private lightsOff(): void {
    this.phase = 'dark';
    this.bestLight = Math.max(this.bestLight, this.thisLight);
    this.round++;
    this.sinceOff = 0;
    this.struck = false;
    // after the last round there is one more wait, and then it is not Christian at the switch
    this.left = this.level.lights![this.round]?.[0] ?? 1.5;
    this.setLight(false);
    this.restArm();
    this.teach('off', 'Lights OFF - FREEZE!');
  }

  // ---- taps --------------------------------------------------------------------------

  protected trySwing(): void {
    if (this.over || this.phase === 'story' || this.phase === 'dad') return;
    if (this.phase === 'lit') this.bop();
    // nothing counts against him before the first light, while the rules are still news
    else if (this.round > 0 && this.sinceOff > GRACE) this.oops();
  }

  protected tryRage(): void {
    // nothing special about this level's special: it is all in the tapping
  }

  /** One more on DJ's head. */
  private bop(): void {
    if (this.t - this.lastBop < BOP_GAP) return;
    this.lastBop = this.t;
    this.whacked++;
    this.thisLight++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.cash += 5 * this.mult;
    this.hud.setJam(this.whacked, 0, this.total);
    this.hud.setCash(this.cash);
    this.hud.setCombo(this.combo, this.mult);

    const at = this.target;
    sound.bonk(false);
    // the sock comes down and goes straight back up; DJ's head takes it
    this.restArm();
    this.tweens.killTweensOf(this.armIm);
    this.tweens.add({ targets: this.armIm, y: this.armIm.y + 32, rotation: 0.2, duration: 45, yoyo: true, ease: 'Quad.in' });
    this.tweens.killTweensOf(this.dj);
    this.dj.setScale(1 / TEX, 0.92 / TEX);
    this.tweens.add({ targets: this.dj, scaleY: 1 / TEX, duration: 110, ease: 'Back.out' });
    if (this.whacked % 2 === 1) {
      this.popWord(at.x - 20 + Math.random() * 110, at.y - 70 - Math.random() * 60, pick(BOP_WORDS));
    }
    if (this.whacked % 3 === 0) this.starFx.explode(3, at.x, at.y - 24);
    this.cameras.main.shake(50, 0.003);
  }

  /** A swing in the dark: he gets the lamp instead, and somebody upstairs stirs. */
  private oops(): void {
    if (this.struck) return;
    this.struck = true;
    this.hearts--;
    this.combo = 0;
    this.hud.setHearts(this.hearts);
    this.hud.loseHeartFx(this.hearts);
    this.hud.setCombo(0, 1);
    sound.clang();
    this.cameras.main.shake(160, 0.008);
    // the lamp he has clouted flickers, so for a moment everyone can see what he did
    this.dark.setAlpha(0.4);
    this.tweens.add({ targets: this.dark, alpha: DARK, duration: 260, delay: 140 });
    const crash = img(this, this.lamp.x + 40, this.lamp.y - 196, 'word_crash').setDepth(DEPTHS.glow + 2).setRotation(-0.12);
    this.tweens.add({ targets: crash, y: crash.y - 34, alpha: 0, duration: 380, delay: 520, onComplete: () => crash.destroy() });
    this.tweens.add({ targets: this.lamp, rotation: 0.16, duration: 70, yoyo: true, repeat: 2 });
    this.hint(this.hearts > 0 ? 'Shh! Swinging in the dark makes a racket.' : 'That woke somebody up...');
    if (this.hearts <= 0) this.dadArrives();
  }

  // ---- the end -------------------------------------------------------------------------

  /** Alex's dad comes down. The light is on, and it was not Christian. */
  private dadArrives(): void {
    if (this.phase === 'dad') return;
    this.phase = 'dad';
    this.bestLight = Math.max(this.bestLight, this.thisLight);
    this.setLight(true);
    this.dropTags(0);
    this.restArm();
    applyArt(this.door, 'rec_door_open');
    this.dadIm.setVisible(true);
    this.zzz.setVisible(false);
    this.recDot.setVisible(false);
    sound.busted();
    sound.dim(HUSH);
    this.cameras.main.shake(260, 0.01);
    const banner = img(this, view.W * 0.36, 128, 'word_busted').setDepth(DEPTH.overlay).setRotation(-0.04);
    const full = banner.scale;
    banner.setScale(full * 0.3);
    this.tweens.add({ targets: banner, scale: full, duration: 160, ease: 'Back.out' });
    this.tweens.add({ targets: banner, alpha: 0, duration: 250, delay: 1500, onComplete: () => banner.destroy() });
    this.say({ text: 'WHAT is going ON down here?!' }, 0.2, { x: this.dadIm.x - 30, y: this.dadIm.y - 250 });

    // DJ wakes up, and the boys are gone before he has worked out why
    this.time.delayedCall(500, () => applyArt(this.dj, 'dj_awake'));
    [this.armIm, this.neil, this.forrest, this.christian].forEach((who, i) => {
      this.tweens.add({ targets: who, x: -260, duration: 620, delay: 650 + i * 110, ease: 'Quad.in' });
    });
    this.time.delayedCall(2300, () => this.finish('end'));
  }

  protected resultRows(): [string, string][] {
    return [['Most under one light', `${this.bestLight}`], ['Best combo', `${this.bestCombo}`]];
  }

  // ---- main loop -----------------------------------------------------------------------

  update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50) / 1000;
    this.t += dt;
    // DJ snores, and Forrest's phone is recording, whatever else is going on
    this.zzz.setPosition(this.target.x + 34 + Math.sin(this.t * 1.7) * 4, this.target.y - 64 + Math.sin(this.t * 2.3) * 5);
    this.recDot.setAlpha(Math.sin(this.t * 6) > 0 ? 1 : 0.15);
    if (this.over || this.phase === 'story' || this.phase === 'dad') return;

    this.levelT += dt;
    this.sinceOff += dt;
    this.left -= dt;
    if (this.auto) this.autoplay(dt);
    if (this.left > 0) return;
    if (this.phase === 'lit') this.lightsOff();
    else if (this.round < this.level.lights!.length) this.lightsOn();
    else this.dadArrives();
  }

  /** Dev helper: add ?auto to the URL and the game plays itself (?auto=clumsy
   *  never stops tapping, light or no light). */
  private autoplay(dt: number): void {
    this.botT -= dt;
    if (this.botT > 0) return;
    if (this.auto === 'clumsy') {
      this.botT = 0.2;
      this.trySwing();
    } else if (this.phase === 'lit') {
      this.botT = 0.11;
      this.trySwing();
    }
  }
}
