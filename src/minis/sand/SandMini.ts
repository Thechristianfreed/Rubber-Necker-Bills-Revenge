import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../../config';
import { CHAD, SHANE } from '../../art/bat';
import { ART, applyArt, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { SAND } from '../../data/sand';
import { bubble } from '../../ui/bubble';
import { label, written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { DOORSTEP, FLOOR, KID_SIZE, Kid, MOM_SIZE, headTall, layYard, momMouth, raiseHouse, standMom } from '../shared/yard';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;
type Thing = Phaser.GameObjects.GameObject;

/** Who the player is, a round at a time, and what each of them can do about it. */
const ROLES = ['YOU ARE CHAD', 'YOU ARE SHANE', 'YOU ARE MOM'];
const CHOICES = [
  ['PLAY WITH THE SHOVEL', 'PLAY WITH THE BUCKET'],
  ['HUG HIS BROTHER CHAD', 'ESTABLISH DOMINANCE'],
  ['LET CHAD HANDLE IT', "GIVE SHANE A MOTHER'S LOVE"],
];
/** What the self-play bots pick: the careful one goes straight through, the careless one finds every detour. */
const BOT = { good: [0, 1, 1], clumsy: [1, 0, 0] };
/** How far apart the boys stand in the sandbox. */
const APART = 156;
/** Close-ups are laid over everything else on the page, under the words. */
const SHOT = 50;
/** Where somebody's eyes are on a head, from their chin, as fractions of how tall the head is. */
const EYES = { x: 0.125, y: 0.53 };
/** The photo of the sandbox was taken from well above it: it is drawn this much flatter, to lie on the grass. */
const LIE = 0.4;
/** The photo heads are a little bigger than the ones that came on the pictures of their mother from below. */
const HEAD_UP = 1.15;

type Phase = 'intro' | 'pick' | 'play' | 'done';

/** A picture, so many game pixels tall whatever size it was made at; and the same done to one that is already there. */
function sized(scene: Phaser.Scene, x: number, y: number, key: string, tall: number): Image {
  return resized(img(scene, x, y, key), key, tall);
}

function resized(im: Image, key: string, tall: number): Image {
  applyArt(im, key);
  return im.setScale((im.scale * tall) / ART[key].h);
}

/** The day of the pocket sand, in the same back yard. Shane will not leave Chad
 *  alone in the sandbox, and their mother comes out three times. It is a story
 *  with a choice in each part of it: first as Chad (shovel or bucket: it makes
 *  no difference), then as Shane (who throws sand whichever is picked), then
 *  as their mother, who can let Chad handle it (he cannot) or give Shane a
 *  mother's love: a handful of sand in the eyes. It waits for the player, has
 *  no clock, and always ends the same way.
 *
 *  The boys are the ones from the day of the bat, in poses of their own for
 *  this (yard.ts hangs their heads on); the two of them hugging is one picture
 *  with both heads hung on it; and the two views, his of her and hers of him,
 *  are pictures taken from below and from above, with a head each (data/sand.ts). */
export class SandMini extends Mini {
  readonly title = 'POCKET SAND';
  readonly prompt = 'YOU CHOOSE!';
  readonly seconds = 90;
  readonly timed = false;

  private phase: Phase = 'intro';
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  private said: { box: Box; left: number }[] = [];
  private bits: { im: Image; vx: number; vy: number; spin: number; life: number; drop: number }[] = [];

  private chad!: Kid;
  private shane!: Kid;
  private chadX = 0;
  private shaneX = 0;
  /** Each of them: how far back on his heels (0 to 1), and how far he is leaning into something. */
  private knock = 0;
  private lean = 0;
  /** Chad, busy in the sand: he bobs. */
  private dig = 0;
  /** The two of them hugging: one picture, which stands in for them both while it lasts. */
  private pair?: Box;
  private pairMouth: Point = { x: 0, y: 0 };
  private weeping = new Set<Kid>();
  private tearIn = 0;
  private gritty: Image[] = [];

  private mom!: Box;
  private momHead!: Image;
  private momAt = { x: 0, y: DOORSTEP };
  private door = 0;
  private boxX = 0;
  private toy?: Image;
  private castle?: Image;

  // the choices
  private round = 0;
  private role!: Phaser.GameObjects.Text;
  private roleTape!: Image;
  private buttons: { x: number; plate: Image; text: Phaser.GameObjects.Text; cross?: Image; dead: boolean }[] = [];
  private waiting = false;
  /** Their mother has tried letting Chad handle it. */
  private tried = false;
  private botIn = 0.7;

  /** Whatever a close-up is made of, to be cleared away when it is over. */
  private shot: Thing[] = [];

  private get cx(): number {
    return view.W / 2;
  }

  build(): void {
    const s = this.scene, W = view.W;
    layYard(s);
    img(s, 58, FLOOR - 24, 'yard_tree').setDepth(4);
    this.door = W - 152;
    raiseHouse(s, this.door);
    const mom = standMom(s);
    this.mom = mom.box;
    this.momHead = mom.head;

    // the sandbox, with its near side in front of whoever is standing in it
    this.boxX = Math.max(214, this.cx - 196);
    if (s.textures.exists('sandbox_photo')) {
      const box = ART.sandbox_photo, flat = (im: Image) => im.setScale(im.scaleX, im.scaleY * LIE);
      flat(img(s, this.boxX, FLOOR + 4, 'sandbox_photo').setDepth(7));
      flat(img(s, this.boxX, FLOOR + 4 + (SAND.box.near * box.h - box.ay) * LIE, 'sandbox_near').setDepth(13));
    } else {
      img(s, this.boxX, FLOOR + 4, 'sandbox').setDepth(7);
      img(s, this.boxX, FLOOR + 4, 'sandbox_front').setDepth(13);
    }
    this.chadX = this.boxX - APART / 2;
    this.shaneX = this.boxX + APART / 2;
    this.chad = new Kid(s, 'chad', CHAD, 'stand', 'angel');
    this.shane = new Kid(s, 'shane', SHANE, 'laugh', 'grin');
    this.chad.box.setDepth(10);
    this.shane.box.setDepth(11);
    this.shane.turn(-1);

    this.roleTape = img(s, this.cx, 64, 'you_are').setDepth(95).setRotation(-0.015).setVisible(false);
    this.role = label(s, this.cx, 64, '', 24, '#f6c430').setDepth(96).setRotation(-0.015);
    this.place();
    this.script([[0.7, () => this.pick(0)]]);
  }

  // ---- one thing after another ------------------------------------------------------------

  /** Do these one after another, each so many seconds after the one before. */
  private script(steps: [number, () => void][]): void {
    this.phase = 'play';
    this.t = 0;
    this.cues = [];
    let at = 0;
    for (const [wait, run] of steps) {
      at += wait;
      this.cues.push({ at, run });
    }
  }

  /** A choice: say who the player is now, and put the two buttons up. */
  private pick(round: number): void {
    const s = this.scene, W = view.W;
    this.round = round;
    this.phase = 'pick';
    this.botIn = this.host.auto === 'good' ? 0.5 : 0.9;
    this.roleTape.setVisible(true);
    this.role.setText(ROLES[round]).setScale(1.4);
    s.tweens.add({ targets: this.role, scale: 1, duration: 160, ease: 'Back.out' });
    sound.tick();
    for (const b of this.buttons) [b.plate, b.text, b.cross].forEach((o) => o?.destroy());
    const wide = Math.min(360, (W - 48) / 2);
    this.buttons = CHOICES[round].map((words, i) => {
      const x = this.cx + (i ? 1 : -1) * (wide / 2 + 7);
      const dead = round === 2 && i === 0 && this.tried;
      const plate = img(s, x, 500, dead ? 'fight_btn_sad' : 'fight_btn').setDepth(90);
      plate.setScale((plate.scaleX * wide) / ART.fight_btn.w, plate.scaleY);
      let size = 19;
      const text = written(s, x, 500, words, size).setDepth(91);
      while (text.width > wide - 26 && size > 12) text.setFontSize(--size);
      const cross = dead ? img(s, x, 500, 'choice_x').setDepth(92) : undefined;
      if (dead) text.setAlpha(0.45);
      for (const o of [plate, text]) {
        const y = o.y;
        o.setY(y + 80);
        s.tweens.add({ targets: o, y, duration: 180, delay: i * 60, ease: 'Back.out' });
      }
      return { x, plate, text, cross, dead };
    });
    this.waiting = true;
  }

  press(at: Point): void {
    if (!this.waiting || at.y < 462) return;
    const wide = Math.min(360, (view.W - 48) / 2);
    const i = this.buttons.findIndex((b) => Math.abs(at.x - b.x) < wide / 2);
    if (i >= 0) this.choose(i);
  }

  private choose(i: number): void {
    const b = this.buttons[i], tw = this.scene.tweens;
    if (!this.waiting) return;
    if (b.dead) {
      // not twice
      sound.dodge();
      tw.add({ targets: [b.plate, b.text, b.cross], x: b.x + 7, duration: 40, yoyo: true, repeat: 2 });
      return;
    }
    this.waiting = false;
    sound.tock();
    tw.add({ targets: b.plate, scaleY: b.plate.scaleY * 0.86, duration: 60, yoyo: true });
    for (const o of this.buttons) tw.add({ targets: [o.plate, o.text, o.cross].filter(Boolean), y: 600, duration: 200, delay: 140 });
    if (this.round === 0) this.playWith(i ? 'sand_bucket' : 'sand_shovel');
    else if (this.round === 1) this.second(i === 0);
    else if (i === 0) this.handleIt();
    else this.mothersLove();
  }

  // ---- Chad's turn: a toy, for a moment ---------------------------------------------------

  private playWith(toy: string): void {
    const s = this.scene, tw = s.tweens, bucket = toy === 'sand_bucket';
    // where it is in the sand while he is down there with it (it is in the picture of him)
    const at = { x: this.chadX + 46, y: FLOOR - 18 };
    this.script([
      [0.25, () => {
        this.chad.set(bucket ? 'bucket' : 'dig', 'glee');
        if (bucket) {
          // a bucket of sand, patted down and turned out: a castle
          tw.add({ targets: this, dig: 1, duration: 110, yoyo: true, repeat: 2, onRepeat: () => sound.tick() });
          s.time.delayedCall(760, () => {
            this.castle = img(s, this.boxX + 8, FLOOR + 14, 'sandcastle').setDepth(9);
            const full = this.castle.scale;
            this.castle.setScale(full * 0.1);
            tw.add({ targets: this.castle, scale: full, duration: 180, ease: 'Back.out' });
            sound.cash();
          });
        } else {
          // digging: four goes at it, and a heap to show for them
          tw.add({ targets: this, dig: 1, duration: 130, yoyo: true, repeat: 3, onRepeat: () => { sound.sand(); this.spray(at.x + 14, FLOOR - 4, 5, 120); } });
          this.castle = img(s, this.boxX + 8, FLOOR + 14, 'sand_heap').setDepth(9);
          const full = this.castle.scale;
          this.castle.setScale(full * 0.1);
          tw.add({ targets: this.castle, scale: full, duration: 900 });
        }
      }],
      [1.5, () => {
        if (!bucket) this.shane.set('reach', 'grin');
        this.say(this.shane, bucket ? 'NICE CASTLE.' : 'GIMME THAT!', 0.7, 96, -70);
      }],
      [0.75, () => {
        this.shove('shove');
        s.time.delayedCall(90, () => {
          // there goes the toy; and whatever he had made
          this.toy = img(s, at.x, at.y, toy).setDepth(12);
          tw.add({ targets: this.toy, x: this.chadX - 190, y: FLOOR - 250, rotation: -7, alpha: 0, duration: 620, ease: 'Quad.out' });
          if (this.castle && bucket) {
            const flat = this.castle, was = flat.scale;
            tw.add({ targets: flat, scaleY: was * 0.12, duration: 120, onComplete: () => { applyArt(flat, 'sand_heap'); flat.setScale(flat.scale); } });
            this.spray(flat.x, flat.y - 20, 10, 200);
          }
        });
      }],
      [0.75, () => this.throwSand()],
      [1.0, () => this.momSays('SHANE! KNOCK IT OFF!', 1.6)],
      [1.9, () => this.momIn()],
      [0.5, () => this.pick(1)],
    ]);
  }

  // ---- Shane's turn: it comes to the same thing ---------------------------------------------

  private second(hug: boolean): void {
    const s = this.scene, tw = s.tweens;
    const steps: [number, () => void][] = hug ? [
      [0.2, () => {
        // over he goes, arms out
        this.shane.set('reach', 'sweet');
        tw.add({ targets: this, shaneX: this.chadX + 88, duration: 300, ease: 'Quad.out' });
        this.chad.set('stand', 'angel');
      }],
      [0.4, () => {
        // a proper hug, both arms
        this.embrace('hug');
        sound.tick();
        this.hearts(5);
      }],
      [1.4, () => {
        // ...and an arm round his shoulders, to say it
        this.embrace('side');
        this.say({ mouth: this.pairMouth }, 'I LOVE YOU CHAD.', 2.9, 124, -76);
        this.hearts(7);
      }],
      [0.6, () => {
        sound.aww();
        this.host.word('dawww', this.boxX + 250, 330, true);
      }],
      // ...and nobody moves, for just long enough
      [2.4, () => {
        // and then, from nowhere
        this.letGo();
        this.shaneX = this.chadX + 110;
        this.throwSand(true);
      }],
    ] : [
      [0.2, () => this.say(this.shane, 'MY SANDBOX.', 0.8, 96, -70)],
      [0.7, () => this.throwSand()],
      [0.55, () => this.throwSand(true)],
    ];
    this.script([
      ...steps,
      [0.5, () => this.cry(this.chad)],
      [0.9, () => this.momSays('SHANE! YOU HAD BETTER STOP PUSHING CHAD AROUND!', 2.2)],
      [2.5, () => this.momIn()],
      // ...and the moment the door shuts
      [0.6, () => this.shove('smack')],
      [0.6, () => this.throwSand(true)],
      [0.9, () => {
        // out she comes, for the last time, and all the way
        s.cameras.main.shake(220, 0.012);
        sound.boom();
        this.momSays('HOW WOULD YOU LIKE IT IF SOMEONE WAS BULLYING YOU?!', 2.4);
      }],
      [2.6, () => {
        this.hush();
        applyArt(this.momHead, 'mom_hold');
        tw.add({ targets: this.momAt, x: Math.min(this.shaneX + 176, this.door - 96), y: FLOOR + 10, duration: 420, ease: 'Quad.inOut' });
        this.mom.setDepth(12);
        this.shane.set('good', 'doe');
        this.shane.turn(1);
      }],
      [0.7, () => this.pick(2)],
    ]);
  }

  // ---- their mother's turn ------------------------------------------------------------------

  /** She lets Chad handle it. He is five, and so is the other one, who is bigger. */
  private handleIt(): void {
    const s = this.scene, tw = s.tweens;
    this.tried = true;
    this.script([
      [0.3, () => {
        // close on Chad, who has made his mind up
        this.dry(this.chad);
        this.chad.set('stance', 'set');
        const dark = this.shoot(s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x1c1430), 0);
        const lines = this.shoot(img(s, this.cx, 280, 'speed_lines').setAlpha(0.55), 1);
        lines.setScale(lines.scale * 2.2);
        tw.add({ targets: lines, rotation: 2.4, duration: 3000 });
        const head = this.shoot(sized(s, this.cx, 404, this.close('chad', 'set'), 250), 2).setName('face');
        const full = head.scale;
        head.setScale(full * 0.55).setY(360);
        tw.add({ targets: head, scale: full * 1.18, y: 432, duration: 1300, ease: 'Sine.in' });
        void dark;
        sound.rageReady();
      }],
      [1.35, () => {
        const head = this.shot.find((o) => o.name === 'face') as Image;
        // (the same size as he was: his mouth is open, so there is more of him)
        const at = head.scale;
        applyArt(head, this.close('chad', 'yell'));
        head.setScale(at);
        s.cameras.main.shake(1150, 0.014);
        sound.rageFire();
        let size = 44;
        const words = this.shoot(label(s, this.cx, 492, "IT IS CHAD'S TURN TO HANDLE IT!", size, '#f6c430'), 4);
        while (words.width > view.W - 36 && size > 22) words.setFontSize(--size);
        words.setScale(1.5);
        tw.add({ targets: words, scale: 1, duration: 140, ease: 'Back.out' });
      }],
      [1.25, () => {
        // and back, to how it actually goes
        this.cut();
        s.cameras.main.resetFX();
        this.chad.set('stance', 'yell');
        this.shane.turn(-1);
        // (a fist goes further than a shove)
        this.shane.set('punch', 'grin');
        tw.add({ targets: this, lean: 1.7, duration: 80, yoyo: true, hold: 240, onComplete: () => this.shane.set('laugh', 'grin') });
      }],
      [0.1, () => {
        const top = this.chad.top;
        this.host.word('pow', top.x + 4, top.y + 6);
        sound.bonk(true);
        s.cameras.main.shake(140, 0.01);
        for (let i = 0; i < 4; i++) this.puff('star', top.x, top.y + 16, (Math.random() - 0.5) * 300, -140 - Math.random() * 160, 0.7, 620);
        this.chad.set('shoved', 'cry');
        tw.add({ targets: this, knock: 1, duration: 120, ease: 'Quad.out', yoyo: true, hold: 260, onComplete: () => this.rest() });
      }],
      [0.6, () => this.cry(this.chad)],
      [0.9, () => {
        this.shane.set('good', 'doe');
        this.shane.turn(1);
      }],
      [0.5, () => this.pick(2)],
    ]);
  }

  /** A mother's love. */
  private mothersLove(): void {
    const s = this.scene, tw = s.tweens, W = view.W;
    const grain = ART.sand_close.tex ?? TEX;
    /** Sand, close to: so much of it, with its middle at a spot. */
    const sandy = (x: number, y: number, wide: number, tall: number) => s.add.tileSprite(x, y, (wide * grain) / 2, (tall * grain) / 2, 'sand_close').setScale(2 / grain);
    // Shane, as she sees him: a long way down, and nearly all eyes
    // (a little to one side, to leave room beside him for the words)
    const chin = { x: this.cx + 120, y: 384 }, tall = 292;
    const eyes = [-1, 1].map((side) => ({ x: chin.x + side * EYES.x * tall, y: chin.y - EYES.y * tall }));
    /** ...standing in the sand, his hands behind his back: from further off (if it says how far), and then closer. */
    const above = (look: string, far?: { x: number; y: number; size: number }) => {
      const head = sized(s, 0, 0, this.close('shane', look), tall);
      // (the rest of him is as big as that makes it: the head that came on the picture was so much of it)
      const body = sized(s, 0, 0, 'shane_above', tall / SAND.above.head);
      const him = this.shoot(s.add.container(chin.x, chin.y, [sandy(0, 200, 2800, 1400), body, head]), 1);
      if (far) {
        him.setPosition(far.x, far.y).setScale(far.size);
        tw.add({ targets: him, x: chin.x, y: chin.y, scale: 1, duration: 850, delay: 380, ease: 'Sine.inOut' });
      }
      return head;
    };
    // His mother, as he sees her: a long way up
    const B = SAND.below, high = 760, wide = (high * ART.mom_below.w) / ART.mom_below.h;
    const her = { x: this.cx - 40, y: 204 }, face = (B.head * high * HEAD_UP) / SAND.scold.chin[1];
    const mouth = { x: her.x, y: her.y - (face / SAND.scold.tall) * 0.24 };
    this.script([
      [0.3, () => {
        // Shane's view of it: up from her shoes to her face, and a finger
        this.hush();
        this.shoot(s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x8fc0e8), 0);
        if (s.textures.exists('yard_sky_photo')) {
          const tex = ART.yard_sky_photo.tex ?? TEX;
          this.shoot(s.add.tileSprite(-48, -60, (MAX_W + 96) * tex, ART.yard_sky_photo.h * tex, 'yard_sky_photo').setOrigin(0, 0).setScale(2 / tex), 0);
        }
        // (her forearm is a piece of its own, pinned at the elbow, so that it can wag)
        const arm = sized(s, (B.elbow[0] - B.chin[0]) * wide, (B.elbow[1] - B.chin[1]) * high, 'mom_forearm', high * B.arm.tall);
        const all = this.shoot(s.add.container(her.x, her.y - 340, [sized(s, 0, 0, 'mom_below', high), arm, sized(s, 0, 0, 'mom_big_scold', face)]), 1);
        tw.add({ targets: all, y: her.y, duration: 620, ease: 'Cubic.out' });
        arm.setRotation(-0.2);
        tw.add({ targets: arm, rotation: 0.18, duration: 150, delay: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        sound.whoosh();
      }],
      [0.65, () => {
        const blah = ['BLAH BLAH BLAH.', 'BLAH BLAH. BLAH!', 'BLAH BLAH BLAH BLAH!'];
        blah.forEach((words, i) => s.time.delayedCall(i * 640, () => {
          if (!this.shot.length) return;
          this.hush();
          this.say({ mouth }, words, 0.7, -Math.min(236, this.cx - 150), -34, 27);
        }));
        sound.wahwah(1.9);
      }],
      [2.05, () => {
        // ...and hers of him: all of him, down there, and then just the eyes. Butter would not melt
        this.cut();
        const head = above('doe', { x: this.cx, y: 168, size: 0.5 });
        head.setRotation(-0.05);
        tw.add({ targets: head, rotation: 0.05, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      }],
      [1.3, () => {
        for (const eye of eyes) {
          for (const [dx, dy, k, wait] of [[5, -3, 1.3, 0], [-15, 10, 0.65, 200], [18, 14, 0.5, 380]]) {
            const star = this.shoot(img(s, eye.x + dx, eye.y + dy, 'sparkle'), 3);
            const full = star.scale * k;
            star.setScale(0);
            tw.add({ targets: star, scale: full, rotation: 0.8, duration: 300, delay: wait, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          }
        }
        sound.twinkle();
      }],
      [1.5, () => {
        // her hand, and the sandbox: down into it, and away with a handful
        this.cut();
        this.shoot(sandy(this.cx, H / 2, MAX_W + 96, H + 96), 0);
        const hand = this.shoot(img(s, this.cx + 46, -300, 'hand_grab').setRotation(0.14), 1);
        const pile = this.shoot(img(s, this.cx, 452, 'sand_pile'), 2);
        sound.whoosh();
        tw.add({ targets: hand, x: this.cx + 8, y: 330, rotation: 0, duration: 230, ease: 'Quad.in' });
        s.time.delayedCall(250, () => {
          if (!this.shot.length) return;
          sound.sand();
          this.spray(this.cx, 400, 26, 420, SHOT + 3);
          tw.add({ targets: pile, scale: pile.scale * 0.62, duration: 120 });
          tw.add({ targets: hand, y: -330, rotation: -0.1, duration: 240, delay: 110, ease: 'Quad.in', onUpdate: () => { if (Math.random() < 0.6) this.puff('sand_clump', hand.x + (Math.random() - 0.5) * 60, hand.y + 40, (Math.random() - 0.5) * 60, 120, 0.5, 900, SHOT + 3); } });
        });
      }],
      [0.75, () => {
        // and back to him
        this.cut();
        const head = above('doe');
        // (her hand, up from the bottom of the picture, open)
        const hand = this.shoot(img(s, chin.x + 430, H + 300, 'hand_throw').setRotation(1.02), 5);
        hand.setScale(hand.scale * 1.5);
        s.time.delayedCall(170, () => {
          if (!this.shot.length) return;
          // POCKET SAND
          tw.add({ targets: hand, x: chin.x + 196, y: 408, duration: 80, ease: 'Quad.out' });
          tw.add({ targets: hand, x: chin.x + 470, y: H + 330, duration: 320, delay: 760, ease: 'Quad.in' });
          const white = this.shoot(s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0xffffff), 6);
          tw.add({ targets: white, alpha: 0, duration: 260 });
          resized(head, this.close('shane', 'cry'), tall);
          for (const eye of eyes) {
            const blob = this.shoot(img(s, eye.x, eye.y + 4, 'sand_blob').setRotation(Math.random() * 6), 3);
            blob.setScale(blob.scale * 1.7);
          }
          for (let i = 0; i < 44; i++) {
            const a = Math.random() * Math.PI * 2, v = 160 + Math.random() * 520;
            this.puff('sand_clump', chin.x + (Math.random() - 0.5) * 120, chin.y - EYES.y * tall + (Math.random() - 0.5) * 50, Math.cos(a) * v, Math.sin(a) * v - 120, 0.9 + Math.random() * 0.5, 900, SHOT + 4, 0.7 + Math.random() * 0.8);
          }
          this.host.word('pocketsand', Math.max(236, chin.x - 330), 200, true);
          s.cameras.main.shake(380, 0.018);
          sound.sand();
          sound.boom();
          s.time.delayedCall(160, () => sound.yelp());
          this.shotTears = eyes;
        });
      }],
      [2.0, () => {
        // the yard again, and how it stands
        this.cut();
        this.shotTears = undefined;
        this.shane.set('bawl', 'cry');
        this.cry(this.shane);
        this.dry(this.chad);
        this.chad.set('stand', 'joy');
        applyArt(this.momHead, 'mom_smile');
        const high = headTall('shane') * KID_SIZE, top = this.shane.top;
        for (const side of [-1, 1]) {
          const grit = img(s, top.x + side * EYES.x * high, top.y + (1 - EYES.y) * high + 2, 'sand_blob').setDepth(12).setRotation(Math.random() * 6);
          this.gritty.push(grit.setScale(grit.scale * 0.36));
        }
        this.say(this.shane, 'WAAAAAH!', 2.6, -110, -84, 24);
      }],
      [0.5, () => {
        // (down in the corner, where it covers nobody's face)
        this.host.word('youdidit', W - 215, 400, true);
        sound.win();
      }],
      [2.0, () => {
        this.phase = 'done';
        this.host.finish(true);
      }],
    ]);
  }

  // ---- what they do to each other -----------------------------------------------------------

  /** Shane shoves Chad. */
  private shove(word: string): void {
    const s = this.scene, tw = s.tweens;
    this.shane.turn(-1);
    this.shane.set('push', 'grin');
    tw.add({ targets: this, lean: 1, duration: 90, yoyo: true, hold: 230, onComplete: () => this.shane.set('laugh', 'grin') });
    s.time.delayedCall(90, () => {
      this.dig = 0;
      this.chad.set('shoved', this.weeping.has(this.chad) ? 'cry' : 'sad');
      tw.add({ targets: this, knock: 1, duration: 120, ease: 'Quad.out', yoyo: true, hold: 180, onComplete: () => this.rest() });
      this.host.word(word, this.boxX - 8, FLOOR - 262);
      sound.bonk(false);
      s.cameras.main.shake(90, 0.005);
    });
  }

  /** Shane throws a handful of sand at Chad (or, from close to, a faceful). */
  private throwSand(hard = false): void {
    const s = this.scene, tw = s.tweens;
    this.shane.turn(-1);
    this.shane.set('throw', 'grin');
    tw.add({ targets: this, lean: 0.6, duration: 80, yoyo: true, hold: 220, onComplete: () => this.shane.set('laugh', 'grin') });
    sound.sand();
    // (out of the hand he has flung out, which is as high as Chad's face)
    const from = { x: this.shaneX - 78, y: FLOOR - 152 }, to = { x: this.chadX + 4, y: this.chad.mouth.y };
    for (let i = 0; i < (hard ? 22 : 13); i++) {
      const im = img(s, from.x + (Math.random() - 0.5) * 16, from.y + (Math.random() - 0.5) * 16, 'sand_speck').setDepth(14);
      im.setScale(im.scale * (0.7 + Math.random() * 0.9));
      tw.add({
        targets: im, x: to.x + (Math.random() - 0.5) * 46, y: to.y - 12 + (Math.random() - 0.5) * 50, duration: 130 + Math.random() * 110, ease: 'Quad.out',
        onComplete: () => this.bits.push({ im, vx: -60 - Math.random() * 160, vy: -60 - Math.random() * 90, spin: 0, life: 0.6, drop: 700 }),
      });
    }
    s.time.delayedCall(170, () => {
      if (this.chad.pose !== 'shoved') {
        this.chad.set('shoved', this.weeping.has(this.chad) ? 'cry' : 'sad');
        tw.add({ targets: this, knock: 0.7, duration: 100, ease: 'Quad.out', yoyo: true, hold: 160, onComplete: () => this.rest() });
      }
      if (hard) {
        sound.bonk(false);
        s.cameras.main.shake(110, 0.006);
      }
    });
  }

  /** The two of them, hugging: both arms (`hug`), or one round the shoulders (`side`). It is one
   *  picture of them both, with their heads hung on it, and it stands where Chad was. */
  private embrace(how: 'hug' | 'side'): void {
    const s = this.scene, pair = SAND.pairs[how];
    this.letGo();
    this.chad.box.setVisible(false);
    this.shane.box.setVisible(false);
    const head = (who: string, look: string, at: [number, number, number]) => img(s, at[0], at[1], `${who}head_${look}`).setRotation(at[2]);
    const x = this.chadX - pair.chad[0] * KID_SIZE;
    this.pair = s.add.container(x, FLOOR, [img(s, 0, 0, `pair_${how}`), head('chad', how === 'hug' ? 'angel' : 'glee', pair.chad), head('shane', 'sweet', pair.shane)]).setDepth(10);
    // (a squeeze)
    this.pair.setScale(KID_SIZE * 1.06, KID_SIZE * 0.96);
    s.tweens.add({ targets: this.pair, scaleX: KID_SIZE, scaleY: KID_SIZE, duration: 220, ease: 'Back.out' });
    this.pairMouth = { x: x + pair.shane[0] * KID_SIZE, y: FLOOR + (pair.shane[1] - headTall('shane') * 0.27) * KID_SIZE };
  }

  /** ...and not hugging any more. */
  private letGo(): void {
    if (this.pair) this.scene.tweens.killTweensOf(this.pair);
    this.pair?.destroy();
    this.pair = undefined;
    this.chad.box.setVisible(true);
    this.shane.box.setVisible(true);
  }

  /** Hearts, off the top of the two of them. */
  private hearts(n: number): void {
    for (let i = 0; i < n; i++) {
      this.scene.time.delayedCall(i * 190, () => {
        if (this.pair) this.puff('heart', this.chadX + 30 + (Math.random() - 0.5) * 80, FLOOR - 236, (Math.random() - 0.5) * 30, -70 - Math.random() * 40, 1.5, -20);
      });
    }
  }

  /** Somebody is in tears, from now on. */
  private cry(who: Kid): void {
    this.weeping.add(who);
    sound.yelp();
    if (who === this.chad) {
      // (all of him: his arms out, and his head back)
      who.set('wail', 'cry');
      this.say(who, 'WAAAH!', 0.9, -88, -84, 22);
    } else who.face('cry');
  }

  private dry(who: Kid): void {
    this.weeping.delete(who);
  }

  /** How Chad stands when nothing is being done to him: in tears, or not. */
  private rest(): void {
    this.chad.set(this.weeping.has(this.chad) ? 'wail' : 'stand');
  }

  // ---- their mother, in the doorway -----------------------------------------------------------

  /** Out she comes, with something to say; and Shane is the picture of innocence. */
  private momSays(text: string, secs: number): void {
    const s = this.scene;
    this.hush();
    this.momAt = { x: this.door, y: DOORSTEP };
    this.mom.setVisible(true).setDepth(8).setScale(MOM_SIZE * 0.8);
    s.tweens.add({ targets: this.mom, scale: MOM_SIZE, duration: 140, ease: 'Back.out' });
    applyArt(this.momHead, s.textures.exists('mom_scold') ? 'mom_scold' : 'mom_pah');
    sound.flick(true);
    const mouth = momMouth(this.door);
    this.said.push({ box: bubble(s, mouth.x - 62, Math.max(118, mouth.y - 22), text, mouth, 19, 'left'), left: secs });
    // (a step back from his brother, and his hands behind his back)
    s.tweens.add({ targets: this, shaneX: this.boxX + APART / 2, duration: 160 });
    this.shane.set('good', 'sweet');
    this.shane.turn(1);
  }

  /** ...and back in she goes. */
  private momIn(): void {
    this.hush();
    this.mom.setVisible(false);
    sound.flick(false);
    this.shane.set('laugh', 'grin');
    this.shane.turn(-1);
  }

  // ---- close-ups ------------------------------------------------------------------------------

  /** Put something in the close-up, so many layers up. */
  private shoot<T extends Thing & { setDepth(d: number): T }>(thing: T, layer: number): T {
    thing.setDepth(SHOT + layer);
    this.shot.push(thing);
    // (nobody needs telling who they are while it is on)
    this.role.setVisible(false);
    this.roleTape.setVisible(false);
    return thing;
  }

  /** The close-up is over. */
  private cut(): void {
    const tw = this.scene.tweens;
    for (const o of this.shot) {
      tw.killTweensOf(o);
      o.destroy();
    }
    this.shot = [];
    this.hush();
    // ...and so is whatever was in the air in it
    for (const b of this.bits) if (b.im.depth >= SHOT) b.life = 0;
    this.role.setVisible(true);
    this.roleTape.setVisible(true);
  }

  /** The picture of somebody's face to use close up: the big one, if there is one. */
  private close(who: string, look: string): string {
    const big = `${who}bighead_${look}`;
    return this.scene.textures.exists(big) ? big : `${who}head_${look}`;
  }

  /** Where tears run from, in a close-up. */
  private shotTears?: Point[];

  // ---- odds and ends --------------------------------------------------------------------------

  /** Somebody says something, on a scrap of paper up and to one side of their head. */
  private say(who: { mouth: Point }, text: string, secs: number, dx: number, dy: number, size = 19): void {
    const m = who.mouth, W = view.W;
    const box = bubble(this.scene, Phaser.Math.Clamp(m.x + dx, 110, W - 110), Math.max(112, m.y + dy), text, m, size);
    this.said.push({ box, left: secs });
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  /** Something small in the air: it flies, falls (or floats up) and is gone. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, depth = 30, size = 1): void {
    const im = img(this.scene, x, y, key).setDepth(depth).setRotation(key === 'heart' || key === 'tear' ? 0 : Math.random() * 6);
    im.setScale(im.scale * size);
    this.bits.push({ im, vx, vy, spin: key === 'heart' || key === 'tear' ? 0 : (Math.random() - 0.5) * 8, life, drop });
  }

  /** A spray of sand, from where something has gone into it. */
  private spray(x: number, y: number, n: number, speed: number, depth = 14): void {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = speed * (0.4 + Math.random() * 0.8);
      this.puff(depth > 20 ? 'sand_clump' : 'sand_speck', x + (Math.random() - 0.5) * 20, y, Math.cos(a) * v, Math.sin(a) * v, 0.7, 760, depth);
    }
  }

  // ---- every frame ----------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    while (this.phase === 'play' && this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();

    // tears, from whoever is in them
    this.tearIn -= dt;
    if (this.tearIn <= 0) {
      this.tearIn = 0.2;
      if (this.shotTears) {
        for (const eye of this.shotTears) this.puff('tear', eye.x + (Math.random() - 0.5) * 30, eye.y + 30, (Math.random() - 0.5) * 30, 60, 0.9, 500, SHOT + 4, 2.2);
      } else if (!this.shot.length) {
        for (const who of this.weeping) {
          const high = headTall(who === this.chad ? 'chad' : 'shane') * KID_SIZE, top = who.top, side = Math.random() < 0.5 ? -1 : 1;
          this.puff('tear', top.x + side * (EYES.x * high + 6), top.y + (1 - EYES.y) * high + 8, side * 46, -70, 0.7, 520, 15, 0.8);
        }
      }
    }
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
    this.place();
  }

  /** Put everybody where they are. */
  private place(): void {
    this.chad.box.setPosition(this.chadX - this.knock * 30, FLOOR + this.dig * 3).setRotation(-0.26 * this.knock + 0.05 * this.dig);
    this.shane.box.setPosition(this.shaneX - this.lean * 34, FLOOR);
    this.mom.setPosition(this.momAt.x, this.momAt.y);
    this.roleTape.setScale((this.role.width + 34) / ART.you_are.w / TEX, 1 / TEX);
  }

  timeUp(): boolean {
    return true;
  }

  bot(dt: number): void {
    if (!this.waiting) return;
    this.botIn -= dt;
    if (this.botIn > 0) return;
    const want = BOT[this.host.auto === 'clumsy' ? 'clumsy' : 'good'][this.round];
    this.choose(this.buttons[want].dead ? 1 - want : want);
  }
}
