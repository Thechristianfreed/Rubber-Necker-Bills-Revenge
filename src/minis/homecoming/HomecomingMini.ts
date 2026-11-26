import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { applyArt, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { bubble } from '../../ui/bubble';
import { label } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { FACE, face, hasLook } from '../shared/people';
import { DEN, layDen } from '../shared/places';
import { BODIES, DOOR, DOOR_FACE, GROUND, HEAD, KISS_AT, LOCK, LUNGE, NEED, SIZE } from './layout';
import { SOUNDS } from './sounds';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;
type Thing = Phaser.GameObjects.GameObject;
type Who = 'mammy' | 'pappy';

/** What Pappy says to himself at the door, each time a key is not the one. */
const WRONG = ['HUH.', 'OH, COME ON.'];
/** What Mammy has to say: in the doorway, in the front room, and then after each kiss. */
const AT_THE_DOOR = ['WHERE HAVE YOU BEEN?!', 'DO YOU KNOW WHAT TIME IT IS?!', 'I HAVE BEEN WORRIED SICK!'];
const IN_THE_ROOM = ['AND YOUR DINNER IS COLD!', 'YOU NEVER LISTEN!'];
const AFTER_A_KISS = ['', 'AND ANOTHER THING!', 'YOU NEVER CALL!', 'HMPH.', 'WELL...', 'I SUPPOSE.', 'KEEP GOING.', 'A LITTLE MORE.', 'OH, YOU.'];
/** ...and the face she says it with: how she looks after so many kisses. */
const TEMPER = ['yell', 'yell', 'angry', 'angry', 'talking', 'calm', 'smug', 'smile', 'laugh'];
/** The looks that a paper head (on a page with no photos) shows as pleased. */
const PLEASED = ['calm', 'smug', 'smile', 'laugh', 'asleep', 'pucker'];

/** How far each key hangs from straight down, and where on the ring it hangs from. */
const HANG = [0.7, 0, -0.7];
const HOOK: [number, number][] = [[-24, -9], [0, 0], [24, -9]];
/** How long a key is, from the hole it hangs by to its tip, and how much bigger than that the bunch is shown. */
const KEY_LONG = 160;
const BUNCH = 1.3;
/** What the self-play bots pick: the careful one straight through, the careless one back to a key he has tried. */
const BOT = { good: [0, 1, 2], clumsy: [2, 2, 0, 1] };

/** How fast Pappy goes on his knees, and how far back from her spot his own is when his lips arrive. */
const SPEED = 400;
const REACH = (-KISS_AT[0] + 58) * SIZE;
/** Where he comes in. */
const START = 190;

/** The picture of somebody's face: their own, from everybody's set; or, on a page that could not
 *  fetch its photos, a paper one. Pappy has no face made for a kiss yet: until he has (it would
 *  be his own `pucker`), his eyes are shut. */
function faceKey(scene: Phaser.Scene, who: Who, look: string): string {
  if (look === 'pucker' && !hasLook(who, look)) look = 'asleep';
  const key = face(who, look);
  if (scene.textures.exists(key)) return key;
  return `homecoming_${who}_head_${PLEASED.includes(look) ? 'glad' : who === 'mammy' ? 'mad' : 'sorry'}`;
}

/** One of the two of them: a body in a pose, and their head hung on it by the chin. */
class Person {
  readonly box: Box;
  private readonly body: Image;
  private readonly head: Image;
  pose = '';
  look = '';

  constructor(private readonly scene: Phaser.Scene, readonly who: Who, pose: string, look: string) {
    this.body = img(scene, 0, 0, `homecoming_${who}_${pose}`);
    this.head = img(scene, 0, 0, faceKey(scene, who, look));
    this.box = scene.add.container(0, 0, [this.body, this.head]).setScale(SIZE);
    this.set(pose, look);
  }

  /** Strike a pose (and, if one is given, pull a face). */
  set(pose: string, look = this.look): void {
    this.pose = pose;
    this.look = look;
    const b = BODIES[`${this.who}_${pose}`];
    applyArt(this.body, `homecoming_${this.who}_${pose}`);
    applyArt(this.head, faceKey(this.scene, this.who, look));
    this.head.setScale(HEAD / FACE / TEX).setPosition(b.chin[0], b.chin[1]).setRotation(b.tilt);
  }

  face(look: string): void {
    if (look !== this.look) this.set(this.pose, look);
  }

  /** Where a spot on the body is on the page. */
  at(x: number, y: number): Point {
    return { x: this.box.x + x * SIZE, y: this.box.y + y * SIZE };
  }

  /** So far up the head from the chin, as a fraction of how tall the head is. */
  private up(k: number): Point {
    const b = BODIES[`${this.who}_${this.pose}`];
    return this.at(b.chin[0] + Math.sin(b.tilt) * HEAD * k, b.chin[1] - Math.cos(b.tilt) * HEAD * k);
  }

  get mouth(): Point {
    return this.up(0.27);
  }

  get top(): Point {
    return this.up(1.04);
  }
}

type Phase = 'keys' | 'door' | 'room' | 'kiss' | 'won' | 'done';

/** Pappy comes home. Seen over his shoulder, he fumbles with his keys at the front
 *  door: three on the ring, and a big arrow that says to choose the right one.
 *  The first two tried are never it; the third always is. The door opens slowly,
 *  and then all at once, on Mammy, who is not pleased and says so.
 *
 *  Then the two of them from the side, in the front room, Mammy still at it. Pappy
 *  knows the only thing that appeases her: he goes down on his knees, she turns
 *  her back and bends over, and the player slides him across the carpet to kiss
 *  her butt. Each kiss makes her a little less angry (and gets him shoved back
 *  for another go), until she has been kissed enough.
 *
 *  It is a story that waits for the player: there is no clock, and it always ends
 *  the same way. */
export class HomecomingMini extends Mini {
  readonly title = 'PAPPY COMES HOME';
  readonly prompt = 'CHOOSE THE RIGHT KEY!';
  readonly seconds = 60;
  readonly timed = false;

  phase: Phase = 'keys';
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  private later: { left: number; run: () => void }[] = [];
  private said: { box: Box; left: number }[] = [];
  private bits: { im: Image; vx: number; vy: number; spin: number; life: number; drop: number }[] = [];

  // ---- at the door
  /** Everything of the porch, to be cleared away when the two of them go in. */
  private porch: Thing[] = [];
  private doorX = 0;
  private door!: Image;
  /** How wide the door is drawn: 1 shut, next to nothing wide open (it is hinged on the right). */
  private ajar = 1;
  private lock: Point = { x: 0, y: 0 };
  private back!: Image;
  private backAt: Point = { x: 0, y: 0 };
  /** How far his shoulders have dropped. */
  private sag = 0;
  private hand!: Image;
  private veil!: Phaser.GameObjects.Rectangle;
  private bunch!: Box;
  private bunchAt: Point = { x: 0, y: 0 };
  private keys: { im: Image; tried: boolean; cross?: Image }[] = [];
  private arrow!: Image;
  private arrowX = 0;
  picking = false;
  tries = 0;
  private botIn = 0.7;
  private botAt = 0;
  private eyes?: Image;
  /** Mammy in the doorway: all of her, and her face. */
  private wife?: Box;
  private wifeFace?: Image;
  /** She is in the middle of saying something: her mouth goes. */
  private nagging = false;
  private flap = 0;

  // ---- in the front room
  private mammy?: Person;
  private pappy?: Person;
  private mammyX = 0;
  private pappyX = START;
  private vx = 0;
  /** Where he is making for; whether he is making for anywhere (a tap sends him once, and a
   *  finger kept down keeps sending him); and whether a finger is down. */
  private dest = START;
  private going = false;
  private held = false;
  /** Seconds before he can move again (he has just been shoved), and before he can kiss again. */
  private stun = 0;
  private cool = 0;
  kisses = 0;
  private marks: Image[] = [];
  private shuffleIn = 0;
  private caption?: Phaser.GameObjects.Text;
  private pointer?: Image;
  private temper?: Phaser.GameObjects.Graphics;
  private botWait = 0;

  private get cx(): number {
    return view.W / 2;
  }

  // ---- the porch ----------------------------------------------------------------------------

  build(): void {
    const s = this.scene, cx = this.cx;
    const keep = <T extends Thing>(thing: T): T => {
      this.porch.push(thing);
      return thing;
    };
    const strip = (key: string, y: number, tall: number, depth: number) => keep(s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, tall * TEX, key).setOrigin(0, 0).setScale(1 / TEX).setDepth(depth));
    const floor = DOOR.top + DOOR.h;
    strip('homecoming_siding', -BLEED - 4, floor + BLEED + 4, 1);
    strip('homecoming_boards', floor, H - floor + BLEED, 2);
    this.doorX = cx + 96;
    const left = this.doorX - DOOR.w / 2;
    this.lock = { x: left + LOCK[0], y: DOOR.top + LOCK[1] };
    keep(img(s, cx - 296, 156, 'homecoming_window').setDepth(3));
    keep(img(s, left - 74, 132, 'homecoming_lamp').setDepth(3));
    keep(img(s, this.doorX, floor + 22, 'homecoming_mat').setDepth(3));
    // (it is late: everything but what the porch light falls on is dim)
    keep(s.add.rectangle(cx, H / 2, MAX_W * 2, H * 2, 0x0c1030, 0.34).setDepth(8));
    keep(img(s, left - 74, 150, 'homecoming_glow').setDepth(9));
    keep(img(s, this.doorX, floor, 'homecoming_doorway').setDepth(10));
    this.door = keep(img(s, left + DOOR.w, floor, 'homecoming_door').setDepth(12));

    // Pappy, from behind, and the hand he will try the keys with (out of sight for now)
    this.backAt = { x: cx - 252, y: H + 34 };
    this.back = keep(img(s, this.backAt.x, this.backAt.y, 'homecoming_pappy_back').setDepth(20));
    this.hand = keep(img(s, this.lock.x - 70, H + 240, 'homecoming_hand_key').setDepth(19));

    // the bunch of keys, big, over everything; and the arrow
    this.veil = keep(s.add.rectangle(cx, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.5).setDepth(40).setAlpha(0));
    this.bunchAt = { x: Math.min(cx + 170, view.W - 190), y: 166 };
    const ring = img(s, 0, 0, 'homecoming_ring');
    this.keys = HANG.map((turn, i) => ({ im: img(s, HOOK[i][0], HOOK[i][1], `homecoming_key${i}`).setRotation(turn), tried: false }));
    this.bunch = keep(s.add.container(this.backAt.x + 150, 380, [...this.keys.map((k) => k.im), ring]).setDepth(41).setScale(0.3).setVisible(false));
    this.arrowX = this.bunchAt.x - 366;
    this.arrow = keep(img(s, this.arrowX, 296, 'homecoming_arrow').setDepth(42).setAlpha(0));

    this.place();
    this.script([
      [0.35, () => {
        // out they come, and he has no idea
        this.bunch.setVisible(true);
        SOUNDS.jingle();
        s.tweens.add({ targets: this.bunch, rotation: 0.22, duration: 70, yoyo: true, repeat: 5 });
        this.sayBack('NOW, WHICH ONE IS IT...', 1.5);
      }],
      [0.6, () => SOUNDS.jingle()],
      [0.7, () => this.offer()],
    ]);
  }

  /** Hold the bunch up: three keys, and an arrow that says what to do about them. */
  private offer(): void {
    const tw = this.scene.tweens;
    this.phase = 'keys';
    this.bunch.setVisible(true);
    SOUNDS.jingle();
    tw.add({ targets: this.veil, alpha: 1, duration: 200 });
    tw.add({ targets: this.bunch, x: this.bunchAt.x, y: this.bunchAt.y, scale: BUNCH, rotation: 0, duration: 260, ease: 'Back.out' });
    this.arrow.setX(this.arrowX - 260);
    tw.add({ targets: this.arrow, x: this.arrowX, alpha: 1, duration: 260, delay: 160, ease: 'Back.out' });
    tw.add({ targets: this.arrow, x: this.arrowX + 16, duration: 330, delay: 440, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.after(0.3, () => {
      this.picking = true;
      this.botIn = this.host.auto === 'clumsy' ? 1.0 : 0.6;
    });
  }

  /** Which key is under a finger: the nearest, if it is near enough. */
  private keyAt(at: Point): number {
    let best = -1, near = 48;
    this.keys.forEach((_, i) => {
      const ax = this.bunchAt.x + HOOK[i][0] * BUNCH, ay = this.bunchAt.y + HOOK[i][1] * BUNCH;
      const dx = -Math.sin(HANG[i]) * KEY_LONG * BUNCH, dy = Math.cos(HANG[i]) * KEY_LONG * BUNCH;
      const k = Phaser.Math.Clamp(((at.x - ax) * dx + (at.y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
      const far = Math.hypot(at.x - ax - dx * k, at.y - ay - dy * k);
      if (far < near) {
        near = far;
        best = i;
      }
    });
    return best;
  }

  /** He tries a key. The first two he tries are not it, whichever they are; the third is. */
  private choose(i: number): void {
    const s = this.scene, tw = s.tweens, key = this.keys[i];
    if (!this.picking) return;
    if (key.tried) {
      // not that one again
      sound.dodge();
      tw.add({ targets: key.im, rotation: HANG[i] + 0.12, duration: 45, yoyo: true, repeat: 2 });
      return;
    }
    this.picking = false;
    this.tries++;
    const right = this.tries === 3;
    key.tried = true;
    sound.tock();
    tw.add({ targets: key.im, scale: key.im.scale * 1.25, duration: 110, yoyo: true });
    this.hush();
    this.script([
      [0.3, () => {
        // away with the bunch, and up to the lock with the one
        tw.killTweensOf(this.arrow);
        tw.add({ targets: [this.veil, this.arrow], alpha: 0, duration: 160 });
        tw.add({ targets: this.bunch, x: this.backAt.x + 150, y: 400, scale: 0.3, duration: 200, ease: 'Quad.in', onComplete: () => this.bunch.setVisible(false) });
        this.hand.setPosition(this.lock.x - 70, H + 240).setRotation(0);
        tw.add({ targets: this.hand, x: this.lock.x, y: this.lock.y, duration: 260, delay: 120, ease: 'Quad.out' });
      }],
      [0.45, () => {
        SOUNDS.rattle();
        tw.add({ targets: this.hand, rotation: 0.09, duration: 60, yoyo: true, repeat: right ? 1 : 4 });
      }],
      ...(right ? [
        [0.3, () => {
          // round it goes
          tw.add({ targets: this.hand, rotation: 0.3, duration: 150, ease: 'Quad.out' });
          SOUNDS.unlock();
          this.host.word('homecoming_click', this.lock.x + 112, this.lock.y - 62);
        }],
        [0.6, () => this.sayBack('AH. THERE WE GO.', 1.2)],
        [0.6, () => this.open()],
      ] as [number, () => void][] : [
        [0.3, () => SOUNDS.rattle()],
        [0.35, () => {
          SOUNDS.wrong();
          this.host.word('nope', this.lock.x + 104, this.lock.y - 62);
          tw.add({ targets: this.door, x: this.door.x + 3, duration: 40, yoyo: true, repeat: 2 });
          tw.add({ targets: this, sag: 1, duration: 200, yoyo: true, hold: 500 });
          this.sayBack(WRONG[this.tries - 1], 1.2);
        }],
        [0.7, () => tw.add({ targets: this.hand, x: this.lock.x - 70, y: H + 240, duration: 220, ease: 'Quad.in' })],
        [0.35, () => {
          // that one is no good: it hangs there crossed out
          key.im.setAlpha(0.55).setTint(0x8a8a8a);
          const mid = KEY_LONG * 0.55;
          key.cross = img(s, HOOK[i][0] - Math.sin(HANG[i]) * mid, HOOK[i][1] + Math.cos(HANG[i]) * mid, 'choice_x');
          key.cross.setScale(key.cross.scale * 0.5);
          this.bunch.add(key.cross);
          this.offer();
        }],
      ] as [number, () => void][]),
    ]);
  }

  /** The door: slowly, and then not. */
  private open(): void {
    const s = this.scene, tw = s.tweens, left = this.doorX - DOOR.w / 2, floor = DOOR.top + DOOR.h;
    this.phase = 'door';
    this.hush();
    tw.add({ targets: this.hand, x: this.lock.x - 70, y: H + 240, duration: 240, ease: 'Quad.in' });
    // she is there already, behind it
    const body = img(s, 0, 0, 'homecoming_mammy_door'), chin = BODIES.mammy_door.chin;
    const big = s.textures.exists('homecoming_mammy_big_angry');
    this.wifeFace = img(s, chin[0], chin[1], big ? 'homecoming_mammy_big_angry' : 'homecoming_mammy_head_mad');
    this.wifeFace.setScale(big ? 1 / LUNGE / TEX : DOOR_FACE / FACE / TEX);
    this.wife = s.add.container(this.doorX, floor, [body, this.wifeFace]).setDepth(11).setVisible(false);
    this.porch.push(this.wife);
    this.script([
      [0.4, () => {
        SOUNDS.creak(1.6);
        tw.add({ targets: this, ajar: 0.84, duration: 1600, ease: 'Sine.inOut' });
      }],
      [0.9, () => {
        // somebody is up
        this.eyes = img(s, left + 19, floor + chin[1] - DOOR_FACE * 0.52, 'eyes').setDepth(11.5).setAlpha(0);
        this.porch.push(this.eyes);
        tw.add({ targets: this.eyes, alpha: 1, duration: 260 });
      }],
      [0.9, () => {
        // ...and all the way, all at once
        tw.killTweensOf(this);
        tw.add({ targets: this, ajar: 0.05, duration: 70 });
        this.eyes?.destroy();
        this.wife!.setVisible(true);
        SOUNDS.bang();
        s.cameras.main.shake(260, 0.014);
        const white = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0xffffff).setDepth(60);
        this.porch.push(white);
        tw.add({ targets: white, alpha: 0, duration: 240 });
        this.host.word('homecoming_bang', Math.min(view.W - 170, this.doorX + 250), 150, true);
        tw.add({ targets: this, sag: -1.6, duration: 90, yoyo: true });
        for (const side of [-1, 1]) this.puff('steam', this.doorX + side * 70, floor + chin[1] - DOOR_FACE - 6, side * 60, -70, 1.3, -30, 13);
        tw.add({ targets: this.wife, scale: 1.05, duration: 1300 });
      }],
      [0.75, () => {
        SOUNDS.gulp();
        tw.add({ targets: this, sag: 1.5, duration: 300 });
        this.sayBack('...HI, HONEY.', 1.0);
      }],
      [1.1, () => {
        // and she is off
        this.hush();
        const y = 306 + -chin[1] * LUNGE;
        this.wife!.setDepth(14);
        tw.killTweensOf(this.wife!);
        tw.add({ targets: this.wife, x: this.cx + 44, y, scale: LUNGE, duration: 150, ease: 'Back.out' });
        s.cameras.main.shake(900, 0.008);
        this.nagging = true;
        this.wifeSays(0);
      }],
      [0.95, () => this.wifeSays(1)],
      [0.95, () => this.wifeSays(2)],
      [1.0, () => this.inside()],
    ]);
  }

  /** One of the things she says in the doorway, to one side of her head and then the other. */
  private wifeSays(n: number): void {
    const s = this.scene, W = view.W;
    this.hush();
    SOUNDS.nag(0.8);
    const mouth = { x: this.cx + 44, y: 306 - DOOR_FACE * LUNGE * 0.24 };
    const x = n % 2 ? Math.max(126, this.cx - 250) : Math.min(W - 126, this.cx + 318), y = n % 2 ? 92 : 118 + n * 14;
    this.said.push({ box: bubble(s, x, y, AT_THE_DOOR[n], mouth, 22), left: 0.9 });
  }

  // ---- the front room -------------------------------------------------------------------------

  /** In they go: the two of them from the side, and Mammy nowhere near finished. */
  private inside(): void {
    const s = this.scene, tw = s.tweens, cx = this.cx;
    for (const o of this.porch) {
      tw.killTweensOf(o);
      o.destroy();
    }
    this.porch = [];
    tw.killTweensOf(this);
    this.hush();
    for (const b of this.bits) b.life = 0;
    this.phase = 'room';
    s.cameras.main.resetFX();
    layDen(s);
    img(s, 88, DEN.floor + 8, 'homecoming_door_in').setDepth(3);
    this.mammyX = Math.min(cx + 170, view.W - 190);
    this.pappyX = this.dest = START;
    this.mammy = new Person(s, 'mammy', 'stand', 'yell');
    this.pappy = new Person(s, 'pappy', 'stand', 'worried');
    this.mammy.box.setDepth(11);
    this.pappy.box.setDepth(12);
    this.place();
    const white = s.add.rectangle(cx, H / 2, MAX_W * 2, H * 2, 0xffffff).setDepth(60);
    tw.add({ targets: white, alpha: 0, duration: 220, onComplete: () => white.destroy() });
    this.script([
      [0.2, () => this.mammySays(IN_THE_ROOM[0], 1.3, true)],
      [1.4, () => this.mammySays(IN_THE_ROOM[1], 1.3, true)],
      [1.3, () => {
        // he has been here before
        this.words('PAPPY KNOWS THE ONLY THING THAT APPEASES MAMMY.');
        this.pappy!.face('smug');
        const top = this.pappy!.top;
        const bang = img(s, top.x + 30, top.y - 2, 'alert').setDepth(30);
        const full = bang.scale;
        bang.setScale(0);
        tw.add({ targets: bang, scale: full, duration: 160, ease: 'Back.out' });
        tw.add({ targets: bang, alpha: 0, duration: 200, delay: 1300, onComplete: () => bang.destroy() });
        sound.tick();
        this.mammySays(AFTER_A_KISS[1], 1.5, true);
      }],
      [2.0, () => {
        this.hush();
        this.nagging = false;
        this.pappy!.face('talking');
        this.say(this.pappy!.mouth, 'YES, DEAR.', 1.1, 96, -74);
      }],
      [1.0, () => {
        // down he goes
        this.hush();
        this.pappy!.set('kneel', 'worried');
        SOUNDS.kneel();
        s.cameras.main.shake(110, 0.005);
        for (const side of [-1, 1]) this.puff('puff', this.pappyX + side * 30, GROUND - 8, side * 70, -30, 0.5, 60, 13, 0.7);
      }],
      [0.6, () => {
        // and round she goes
        this.mammy!.set('bent', 'yell');
        SOUNDS.flap();
        this.mammy!.box.setScale(SIZE * 1.1, SIZE * 0.9);
        tw.add({ targets: this.mammy!.box, scaleX: SIZE, scaleY: SIZE, duration: 240, ease: 'Back.out' });
        this.pappy!.face('shocked');
      }],
      [0.8, () => this.pucker()],
    ]);
  }

  /** The game: slide him over, and kiss it. */
  private pucker(): void {
    const s = this.scene, cx = this.cx;
    this.phase = 'kiss';
    this.pappy!.face('worried');
    this.words('SLIDE PAPPY OVER AND KISS HER BUTT!');
    img(s, cx, 80, 'homecoming_temper').setDepth(88);
    this.temper = s.add.graphics().setDepth(89);
    this.drawTemper();
    // an arrow, at what is wanted
    const spot = this.mammy!.at(KISS_AT[0], KISS_AT[1]);
    this.pointer = img(s, spot.x - 96, spot.y - 76, 'homecoming_point').setDepth(30).setRotation(0.62);
    s.tweens.add({ targets: this.pointer, x: spot.x - 80, y: spot.y - 64, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.nagging = true;
    this.mammySays(AFTER_A_KISS[1], 1.4, true);
    this.botWait = this.host.auto === 'clumsy' ? 1.6 : 0.3;
  }

  /** Where his own spot is when his lips are where they are wanted. */
  private get lipsAt(): number {
    return this.mammyX - REACH;
  }

  /** Pappy, across the carpet on his knees: after a finger, or where one last was. */
  private slide(dt: number): void {
    const s = this.scene, pappy = this.pappy!;
    const p = s.input.activePointer;
    if (this.held && p.isDown) this.dest = s.cameras.main.getWorldPoint(p.x, p.y).x + 20;
    this.dest = Phaser.Math.Clamp(this.dest, 96, this.lipsAt);
    this.cool -= dt;
    if (this.stun > 0) {
      // (shoved: he goes where he is sent)
      this.stun -= dt;
      this.vx *= Math.exp(-4.4 * dt);
      if (this.stun <= 0) pappy.set('kneel', 'worried');
    } else {
      const want = this.going ? Phaser.Math.Clamp((this.dest - this.pappyX) * 7, -SPEED, SPEED) : 0;
      this.vx += (want - this.vx) * Math.min(1, dt * 9);
    }
    this.pappyX = Phaser.Math.Clamp(this.pappyX + this.vx * dt, 96, this.lipsAt);
    if (this.pappyX <= 96 && this.vx < 0) this.vx = 0;

    // knees on a carpet
    const going = this.stun <= 0 && Math.abs(this.vx) > 60;
    pappy.box.setRotation(going ? Math.sin(this.t * 19) * 0.045 : this.stun > 0 ? -0.12 : 0);
    this.shuffleIn -= dt;
    if (going && this.shuffleIn <= 0) {
      this.shuffleIn = 0.17;
      SOUNDS.shuffle();
      this.puff('puff', this.pappyX - 40, GROUND - 6, -Math.sign(this.vx) * 40, -20, 0.35, 40, 10, 0.45);
    }
    if (this.stun <= 0 && this.cool <= 0 && this.pappyX >= this.lipsAt - 4) this.kiss();
  }

  /** There. */
  private kiss(): void {
    const s = this.scene, tw = s.tweens, mammy = this.mammy!, pappy = this.pappy!;
    this.kisses++;
    const n = this.kisses, last = n >= NEED;
    this.cool = 0.5;
    this.stun = 0.3;
    this.vx = 0;
    // (one tap, one kiss: he only comes back for another by himself while a finger is down)
    this.going = this.held;
    this.pointer?.destroy();
    this.pointer = undefined;
    pappy.set('smooch', 'pucker');
    SOUNDS.kiss();
    const at = mammy.at(KISS_AT[0], KISS_AT[1]);
    this.host.word(`homecoming_kiss${['', '2', '3'][n % 3]}`, at.x - 46 + Math.random() * 50, at.y - 96 - Math.random() * 34);
    // (hearts, from above his head: not over his face)
    for (let i = 0; i < 2; i++) this.puff('heart', at.x - 10 + (Math.random() - 0.5) * 50, at.y - 62, (Math.random() - 0.5) * 70, -90 - Math.random() * 50, 1.1, -30, 30);
    // (the mark it leaves, on the bloomers, for good)
    const mark = img(s, KISS_AT[0] + 10 + Math.random() * 44, KISS_AT[1] + (Math.random() - 0.5) * 62, 'homecoming_lips').setRotation(-0.5 + Math.random());
    mammy.box.add(mark);
    this.marks.push(mark);
    // she feels it
    mammy.box.setScale(SIZE * 0.96, SIZE * 1.04);
    tw.add({ targets: mammy.box, scaleX: SIZE, scaleY: SIZE, duration: 200, ease: 'Back.out' });
    mammy.face(TEMPER[n]);
    this.nagging = n < 2;
    this.mammySays(AFTER_A_KISS[n], 1.3, n < 3);
    if (n >= 4) SOUNDS.mmm(n - 4);
    this.drawTemper();
    if (last) return this.appeased();
    // ...and that is not enough: back he goes, off her hip, less far the less cross she is
    this.after(0.26, () => {
      if (this.phase !== 'kiss') return;
      const cross = 1 - n / NEED;
      SOUNDS.bump();
      tw.add({ targets: mammy.box, x: this.mammyX - 14, duration: 60, yoyo: true });
      pappy.set('kneel', 'ouch');
      this.vx = -(300 + 520 * cross);
      this.stun = 0.34;
      if (n <= 3) this.host.word('homecoming_hmph', at.x + 30, at.y - 150);
    });
  }

  /** She has been kissed enough. */
  private appeased(): void {
    const s = this.scene, mammy = this.mammy!, pappy = this.pappy!;
    this.phase = 'won';
    this.stun = 0;
    this.script([
      [0.7, () => {
        this.hush();
        pappy.set('kneel', 'smile');
        pappy.box.setRotation(0);
        for (const mark of this.marks) mark.destroy();
        mammy.set('stand', 'smile');
        mammy.box.setScale(SIZE * 0.9, SIZE * 1.1);
        s.tweens.add({ targets: mammy.box, scaleX: SIZE, scaleY: SIZE, duration: 240, ease: 'Back.out' });
        sound.twinkle();
        this.caption?.destroy();
        this.say(mammy.mouth, 'ALL IS FORGIVEN.', 2.6, -150, -70);
        for (let i = 0; i < 12; i++) {
          // (up out of the gap between them, and off the tops of their heads)
          this.after(i * 0.13, () => {
            const from = [{ x: (this.pappyX + this.mammyX) / 2 - 10, y: GROUND - 150 }, pappy.top, mammy.top][i % 3];
            this.puff('heart', from.x + (Math.random() - 0.5) * 50, from.y - 14, (Math.random() - 0.5) * 50, -70 - Math.random() * 40, 1.5, -20, 30, 1 + Math.random() * 0.6);
          });
        }
      }],
      [0.8, () => {
        pappy.face('laugh');
        this.host.word('youdidit', Math.min(204, this.pappyX - 276), 262, true);
        sound.win();
      }],
      [2.0, () => {
        this.phase = 'done';
        this.host.finish(true);
      }],
    ]);
  }

  /** How cross she still is, on the board at the top. */
  private drawTemper(): void {
    const g = this.temper;
    if (!g) return;
    const x = this.cx - 132, y = 88, w = 264, left = 1 - this.kisses / NEED;
    g.clear();
    g.fillStyle(0x242022, 1);
    g.fillRoundedRect(x, y, w, 13, 4);
    if (left > 0.01) {
      g.fillStyle(left > 0.5 ? 0xcc302a : left > 0.25 ? 0xe8892a : 0xf6c430, 1);
      g.fillRoundedRect(x + 2.5, y + 2.5, (w - 5) * left, 8, 3);
    }
  }

  // ---- fingers -------------------------------------------------------------------------------

  press(at: Point): void {
    if (this.picking) {
      const i = this.keyAt(at);
      if (i >= 0) this.choose(i);
    } else if (this.phase === 'kiss') {
      this.held = this.going = true;
      this.dest = at.x + 20;
    }
  }

  release(): void {
    this.held = false;
  }

  // ---- odds and ends -------------------------------------------------------------------------

  /** Do something in so many seconds of the game's own time (which is what everything here keeps). */
  private after(secs: number, run: () => void): void {
    this.later.push({ left: secs, run });
  }

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

  /** Something said, on a scrap of paper up and to one side of whoever says it. */
  private say(mouth: Point, text: string, secs: number, dx: number, dy: number, size = 19): void {
    const box = bubble(this.scene, Phaser.Math.Clamp(mouth.x + dx, 120, view.W - 120), Math.max(126, mouth.y + dy), text, mouth, size);
    this.said.push({ box, left: secs });
  }

  /** Pappy, at the door, to himself: from the back of his head. */
  private sayBack(text: string, secs: number): void {
    const from = { x: this.backAt.x + 30, y: this.backAt.y - 330 };
    this.said.push({ box: bubble(this.scene, Math.max(150, from.x - 30), 168, text, from, 20), left: secs });
  }

  /** Mammy, in the front room: up and to the right of her, out of the way of what is going on behind her. */
  private mammySays(text: string, secs: number, loud: boolean): void {
    this.hush();
    if (!text) return;
    if (loud) SOUNDS.nag(Math.min(1.1, secs * 0.7));
    const m = this.mammy!.mouth;
    this.say(m, text, secs, this.mammy!.pose === 'bent' ? 92 : 130, -96, loud ? 21 : 19);
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  /** What is going on, in big letters along the bottom. */
  private words(text: string): void {
    this.caption?.destroy();
    let size = 34;
    const words = label(this.scene, this.cx, 508, text, size, '#f6c430').setDepth(92);
    while (words.width > view.W - 30 && size > 18) words.setFontSize(--size);
    words.setScale(1.3);
    this.scene.tweens.add({ targets: words, scale: 1, duration: 150, ease: 'Back.out' });
    this.caption = words;
  }

  /** Something small in the air: it flies, falls (or floats up) and is gone. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, depth = 30, size = 1): void {
    const im = img(this.scene, x, y, key).setDepth(depth);
    im.setScale(im.scale * size);
    this.bits.push({ im, vx, vy, spin: key === 'puff' ? (Math.random() - 0.5) * 4 : 0, life, drop });
  }

  /** Put everything where it is. */
  private place(): void {
    if (this.phase === 'keys' || this.phase === 'door') {
      this.door.setScale(this.ajar / TEX, 1 / TEX);
      this.back.setPosition(this.backAt.x, this.backAt.y + this.sag * 12);
      return;
    }
    this.pappy?.box.setPosition(this.pappyX, GROUND);
    if (this.mammy && !this.scene.tweens.isTweening(this.mammy.box)) this.mammy.box.setPosition(this.mammyX, GROUND);
    else this.mammy?.box.setY(GROUND);
  }

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    for (const l of this.later) l.left -= dt;
    const due = this.later.filter((l) => l.left <= 0);
    this.later = this.later.filter((l) => l.left > 0);
    for (const l of due) l.run();

    // her mouth, while she has something to say
    if (this.nagging) {
      this.flap += dt;
      const open = Math.floor(this.flap / 0.16) % 2 === 0;
      if (this.wifeFace?.active && this.scene.textures.exists('homecoming_mammy_big_yell')) {
        const { scaleX, scaleY } = this.wifeFace;
        applyArt(this.wifeFace, open ? 'homecoming_mammy_big_yell' : 'homecoming_mammy_big_angry');
        this.wifeFace.setScale(scaleX, scaleY);
      } else if (this.mammy && this.phase !== 'door') this.mammy.face(open ? 'yell' : 'talking');
    }
    if (this.phase === 'kiss') {
      this.slide(dt);
      // (and she will not keep still while she waits)
      if (!this.scene.tweens.isTweening(this.mammy!.box)) this.mammy!.box.setRotation(Math.sin(this.t * 5.5) * 0.022 * (1 - this.kisses / NEED));
    } else if (this.phase === 'won') this.mammy?.box.setRotation(0);

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

  timeUp(): boolean {
    return true;
  }

  bot(dt: number): void {
    if (this.picking) {
      this.botIn -= dt;
      if (this.botIn > 0) return;
      const order = BOT[this.host.auto === 'clumsy' ? 'clumsy' : 'good'];
      this.botIn = 0.7;
      this.choose(order[Math.min(this.botAt++, order.length - 1)]);
    } else if (this.phase === 'kiss') {
      // the careless one stops half way, and has a think
      this.botWait -= dt;
      this.going = true;
      this.dest = this.botWait > 0 && this.host.auto === 'clumsy' ? (START + this.lipsAt) / 2 : this.lipsAt;
    }
  }
}
