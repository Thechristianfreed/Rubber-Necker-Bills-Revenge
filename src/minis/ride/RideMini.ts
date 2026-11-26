import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { ART, applyArt, img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { bubble } from '../../ui/bubble';
import { label, written } from '../../ui/text';
import { Mini, Point } from '../Mini';
import { FACE, face } from '../shared/people';
import { DEN, layDen } from '../shared/places';
import { HEAD as HOME_HEAD, bodyOf } from '../homecoming/layout';
import { FOREST, METER, ZONE } from './art';
import {
  ARMS, BODIES, BOTTLE_HAND, DOORWAY, DRIVER, FOOT, GLASS_HAND, LANES, ON_ROAD, V, WHEELS, WINDOWS,
} from './layout';
import { SOUNDS } from './sounds';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;
type Thing = Phaser.GameObjects.GameObject;
type Who = 'pappy' | 'mammy' | 'stephanie' | 'curt';

// ---- the story: everything anybody says ---------------------------------------------------------

const ASK = "CAN WE KEEP 'EM, POP?!";
const OF_COURSE = 'OF COURSE!';
/** Everybody tells Stephanie, and she does not listen. */
const LEAVE_THEM: [Who, string][] = [
  ['mammy', 'STEPHANIE! LEAVE THOSE DUCKS ALONE!'],
  ['curt', 'LEAVE THOSE DUCKS ALONE, STEPH!'],
  ['pappy', 'LEAVE THOSE DUCKS ALONE!'],
];
const BED = 'NOW OFF TO BED, YOU TWO.';
const NIGHT_NIGHT = 'NIGHT NIGHT, MR. QUACKS.';
const YOU_KNOW = 'YOU KNOW WHAT TO DO...';
/** What Pappy says as each one goes: Fido first, Mr. Quacks last. */
const GOODBYE = [
  "SO LONG, FIDO! AND DON'T COME BACK!",
  "AND DON'T COME BACK!",
  "GO ON, GIT! AND DON'T COME BACK!",
  "AND DON'T COME BACK, YA HEAR?!",
  "AND DON'T COME BACK, MR. QUACKS!",
];
/** ...and when he misses. */
const MISSED = ['HOLD STILL, DAMMIT!', 'DANG IT.', 'C\'MERE, YOU.'];
const WHERE = 'WHERE DID FIDO AND MR. QUACKS GO?';
const RAN_AWAY = 'THEY RAN AWAY.';

// ---- tuning -------------------------------------------------------------------------------------

/** They are drawn this much bigger than their pictures in the front room (as in "Pappy comes home"),
 *  and stand this far down the page. */
const SIZE = 1.25;
const GROUND = 458;
/** ...and the animals this much. */
const PET_SIZE = 1.05;
/** How fast the road goes by, and for how long before the edge of town comes. */
const SPEED = 430;
const TOWN = 15.6;
/** What is in the road: when it comes (seconds into the drive), in which lane (0 the far one, 1 the
 *  near one), and what it is. The van starts in the near lane. Every one can be missed. */
const ROAD: [number, 0 | 1, 'can' | 'cone' | 'hole'][] = [
  [1.4, 1, 'can'], [2.8, 0, 'cone'], [3.6, 0, 'hole'], [5.0, 1, 'can'], [6.4, 0, 'can'], [7.2, 0, 'cone'],
  [8.6, 1, 'hole'], [9.4, 1, 'can'], [10.8, 0, 'cone'], [12.2, 1, 'can'], [13.0, 1, 'hole'], [14.4, 0, 'can'],
];
/** How long a swerve from one lane to the other takes. */
const SWERVE = 0.24;
/** The kick meter fills in this long, and half a second past full he kicks anyway: as the swing
 *  meter goes in "FORE!". The green is ZONE (in art.ts) and is somewhere between these. */
const FILL = 1.3;
const TOO_LONG = 0.5;
const SWEET = [0.22, 0.86];
/** In the van: how big Pappy is drawn, and where he stands. */
const IN_VAN = 1.1;
const PAPPY_IN_VAN = DOORWAY.r + 100;

/** The animals Curt and Stephanie brought home: four dogs (Fido is the first) and Mr. Quacks. */
const PETS = ['dog0', 'dog1', 'dog2', 'dog3', 'duck'] as const;
type Pet = (typeof PETS)[number];

/** Paper heads, for a page that could not fetch its photos. */
const PAPER_HEAD: Record<Who, string> = { pappy: 'ride_head_pappy', mammy: 'ride_head_mammy', stephanie: 'ride_head_steph', curt: 'ride_head_curt' };

/** The picture of somebody's face: their own, from everybody's set, or a paper one. */
function faceKey(scene: Phaser.Scene, who: Who, look: string): string {
  const key = face(who, look);
  return scene.textures.exists(key) ? key : PAPER_HEAD[who];
}

/** A body in a pose: its picture, where its chin is from the spot it stands on, how far its head
 *  tips, and how tall its head is. Pappy and Mammy standing are the photos from "Pappy comes
 *  home", used as they are (`homecoming_...`); the rest are this game's own. */
function poseOf(scene: Phaser.Scene, name: string): { key: string; chin: V; tilt: number; head: number } {
  if (name.startsWith('homecoming_') && scene.textures.exists(name)) {
    const b = bodyOf(name.slice('homecoming_'.length));
    return { key: name, chin: b.chin, tilt: b.tilt, head: HOME_HEAD };
  }
  // (without the other game's pictures, the nearest of this game's own)
  const own = name === 'homecoming_pappy_stand' ? 'pappy_kiss' : name === 'homecoming_mammy_stand' ? 'mammy_glass' : name;
  const b = BODIES[own];
  return { key: `ride_${own}`, chin: b.chin, tilt: b.tilt, head: b.head };
}

/** One of the family: a body in a pose, and their own head hung on it by the chin. */
class Person {
  readonly box: Box;
  private readonly body: Image;
  private readonly head: Image;
  pose = '';
  look = '';

  constructor(private readonly scene: Phaser.Scene, readonly who: Who, pose: string, look: string, x: number, y: number, size: number) {
    this.body = img(scene, 0, 0, poseOf(scene, pose).key);
    this.head = img(scene, 0, 0, faceKey(scene, who, look));
    this.box = scene.add.container(x, y, [this.body, this.head]).setScale(size);
    this.set(pose, look);
  }

  set(pose: string, look = this.look): void {
    this.pose = pose;
    this.look = look;
    const p = poseOf(this.scene, pose);
    applyArt(this.body, p.key);
    applyArt(this.head, faceKey(this.scene, this.who, look));
    this.head.setScale(p.head / FACE / TEX).setPosition(p.chin[0], p.chin[1]).setRotation(p.tilt);
  }

  face(look: string): void {
    if (look !== this.look) this.set(this.pose, look);
  }

  /** Where a spot on the body is, on the page. */
  at(x: number, y: number): Point {
    return { x: this.box.x + x * this.box.scaleX, y: this.box.y + y * this.box.scaleY };
  }

  private up(k: number): Point {
    const p = poseOf(this.scene, this.pose);
    return this.at(p.chin[0] + Math.sin(p.tilt) * p.head * k, p.chin[1] - Math.cos(p.tilt) * p.head * k);
  }

  get mouth(): Point {
    return this.up(0.27);
  }

  get eyes(): Point {
    return this.up(0.5);
  }

  get top(): Point {
    return this.up(1.04);
  }
}

type Stage = 'home' | 'drive' | 'kick' | 'back' | 'done';
/** Something in the road: which lane, what it is, where it is, whether it has been run into
 *  (`done`), and whether it has been sent flying (`hit`: it no longer goes by with the road). */
interface Hazard { n: number; im: Image; lane: 0 | 1; kind: string; x: number; done: boolean; hit: boolean }

/** Take 'em for a ride. Curt and Stephanie used to bring home all sorts of animals,
 *  mostly dogs, and Pappy would take them for a ride: to the edge of town, out of the
 *  van, and away.
 *
 *  In the front room the two of them ask if they can keep the dogs and the duck
 *  Stephanie will not put down, however often she is told to leave those ducks alone.
 *  Of course they can. Off to bed with them; and the animals all look at Pappy, and
 *  Mammy says he knows what to do.
 *
 *  The drive (tap to swerve: dustbins, cones and potholes in the road), out past the
 *  last house to the forest at the edge of town. The side door slides open, and the
 *  meter from "FORE!" comes up: hold, and let go in the green, to kick each one out.
 *  Back home, the children want to know where Fido and Mr. Quacks went. They ran away.
 *
 *  It is a story that waits for the player: there is no clock, and it always ends the
 *  same way. */
export class RideMini extends Mini {
  readonly title = "TAKE 'EM FOR A RIDE";
  readonly prompt = "GET 'EM OUT OF TOWN!";
  readonly seconds = 90;
  readonly timed = false;

  stage: Stage = 'home';
  /** Where the story has got to, for the tests to photograph: a word for each moment. */
  beat = '';
  t = 0;
  clock = 0;
  private cues: { at: number; run: () => void }[] = [];
  private later: { left: number; run: () => void }[] = [];
  said: { box: Box; left: number }[] = [];
  bits: { im: Image; vx: number; vy: number; spin: number; life: number; drop: number }[] = [];
  /** Everything on the page in this part of the story, to be cleared away for the next. */
  private shot: Thing[] = [];
  private caption?: Phaser.GameObjects.Text;

  // ---- the front room
  private pappy?: Person;
  private mammy?: Person;
  private steph?: Person;
  private curt?: Person;
  private pets: Partial<Record<Pet, Image>> = {};
  private duckHeld = false;

  // ---- the drive
  private strips: { ts: Phaser.GameObjects.TileSprite; k: number; d: number }[] = [];
  private van?: Box;
  private wheels: Image[] = [];
  private heads: Image[] = [];
  lane: 0 | 1 = 1;
  private laneY: number = LANES[1];
  private vanX = 0;
  private speed = SPEED;
  private road: Hazard[] = [];
  private next = 0;
  bumps = 0;
  private jolt = 0;
  private forest?: Phaser.GameObjects.TileSprite;
  private forestX = 0;
  private sign?: Image;
  private progress?: Phaser.GameObjects.Graphics;
  private marker?: Image;
  private hum = 0;
  private driving = false;

  // ---- the kicks
  private slider?: Image;
  private queue: Pet[] = [];
  /** The one in the doorway, and which it is. */
  private atDoor?: Image;
  private doorPet?: Pet;
  kicked = 0;
  misses = 0;
  private triesHere = 0;
  /** Waiting for a finger; a finger is down; how full the meter is; where the green starts. */
  ready = false;
  holding = false;
  air = 0;
  zone0 = 0.5;
  private ticked = 0;
  private meter: Thing[] = [];
  private fill?: Image;
  private zone?: Image;
  private botIn = 0;

  private get cx(): number {
    return view.W / 2;
  }

  // ==== the front room ============================================================================

  build(): void {
    const s = this.scene, W = view.W;
    this.room();
    // the two of them came in with all of them: four dogs, and the duck in Stephanie's arms
    this.curt = this.keep(new Person(s, 'curt', 'curt_stand', 'smile', W * 0.27, GROUND, SIZE));
    this.steph = this.keep(new Person(s, 'stephanie', 'steph_hold', 'smile', W * 0.38, GROUND, SIZE));
    this.pappy = this.keep(new Person(s, 'pappy', 'homecoming_pappy_stand', 'calm', W * 0.65, GROUND, SIZE));
    this.mammy = this.keep(new Person(s, 'mammy', 'homecoming_mammy_stand', 'calm', W * 0.83, GROUND, SIZE));
    this.curt.box.setDepth(10);
    this.steph.box.setDepth(10.5);
    this.pappy.box.setDepth(12);
    this.mammy.box.setDepth(11);
    const spots: [Pet, number, number, boolean][] = [
      ['dog0', W * 0.17, GROUND + 26, true], ['dog1', W * 0.48, GROUND + 6, false],
      ['dog2', W * 0.31, GROUND + 46, true], ['dog3', W * 0.54, GROUND + 40, false],
    ];
    for (const [pet, x, y, right] of spots) {
      const im = this.keep(img(s, x, y, `ride_${pet}`).setDepth(14 + (y - GROUND) / 100).setFlipX(right));
      im.setScale(PET_SIZE / TEX);
      this.pets[pet] = im;
    }
    const arms = this.steph.at(ARMS[0], ARMS[1]);
    this.pets.duck = this.keep(img(s, arms.x, arms.y + 30, 'ride_duck').setDepth(10.6).setScale(PET_SIZE / TEX).setFlipX(true));
    this.duckHeld = true;

    const both = (): Point => ({ x: (this.curt!.mouth.x + this.steph!.mouth.x) / 2, y: this.steph!.mouth.y });
    const kids = (look: string) => { this.curt!.face(look); this.steph!.face(look); };
    this.script([
      [0.4, () => {
        this.beat = 'ask';
        kids('talking');
        this.say(both(), ASK, 1.6, 10, -96, 21);
        SOUNDS.bark();
        this.wag();
      }],
      [0.5, () => kids('smile')],
      [1.3, () => {
        this.pappy!.face('smile');
        this.say(this.pappy!.mouth, OF_COURSE, 1.2, -30, -88, 22);
      }],
      [1.2, () => {
        this.beat = 'yay';
        kids('laugh');
        SOUNDS.yay();
        for (const p of [this.curt!, this.steph!]) this.hop(p.box, 18);
        SOUNDS.bark(1.3);
        this.after(0.2, () => SOUNDS.bark(0.85));
        this.wag();
      }],
      ...LEAVE_THEM.flatMap(([who, line], i): [number, () => void][] => [
        [i === 0 ? 1.3 : 1.0, () => {
          this.beat = 'ducks';
          kids('smile');
          const p = this.person(who);
          p.face(who === 'mammy' ? 'yell' : 'talking');
          this.say(p.mouth, line, 1.5, who === 'curt' ? -40 : who === 'mammy' ? -90 : -60, -92, 20);
        }],
        [1.2, () => {
          // she holds it all the tighter
          this.person(who).face(who === 'mammy' ? 'angry' : 'calm');
          this.squeeze(i);
        }],
      ]),
      [1.1, () => {
        this.beat = 'bed';
        this.pappy!.face('talking');
        this.say(this.pappy!.mouth, BED, 1.4, -70, -90, 20);
      }],
      [1.4, () => {
        // she puts him down, and says goodnight to him
        this.pappy!.face('smile');
        this.putDown();
        this.steph!.face('worried');
        this.say(this.steph!.mouth, NIGHT_NIGHT, 1.3, 20, -80, 18);
      }],
      [1.5, () => {
        // off they go to bed
        kids('smile');
        this.walkOff(this.curt!, 0);
        this.walkOff(this.steph!, 0.15);
      }],
      [2.1, () => {
        // and every one of them turns and looks at Pappy
        this.beat = 'stare';
        this.pappy!.face('worried');
        for (const pet of PETS) {
          const im = this.pets[pet];
          if (!im) continue;
          im.setFlipX(true);
          this.hop(im, 8);
        }
        SOUNDS.cricket();
        this.after(0.7, () => SOUNDS.cricket());
      }],
      [1.6, () => {
        this.beat = 'know';
        this.mammy!.face('smug');
        this.say(this.mammy!.mouth, YOU_KNOW, 1.9, -40, -94, 21);
      }],
      [1.1, () => this.pappy!.face('smug')],
      [1.0, () => this.words("PAPPY TAKES 'EM FOR A RIDE.")],
      [1.6, () => this.blackout(() => this.startDrive())],
    ]);
  }

  /** The front room: the den, with the front door from inside on its wall (both as other games have them). */
  private room(): void {
    const s = this.scene;
    if (s.textures.exists('den')) this.capture(() => layDen(s));
    else {
      const strip = (key: string, y: number, tall: number) => this.keep(s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, tall * TEX, key).setOrigin(0, 0).setScale(1 / TEX).setDepth(1));
      strip('den_wall', -BLEED, DEN.floor + BLEED);
      strip('den_carpet', DEN.floor, H - DEN.floor + BLEED);
    }
    if (s.textures.exists('homecoming_door_in')) this.keep(img(s, 94, DEN.floor + 8, 'homecoming_door_in').setDepth(3));
  }

  private person(who: Who): Person {
    return { pappy: this.pappy, mammy: this.mammy, stephanie: this.steph, curt: this.curt }[who]!;
  }

  /** The dogs wag (bounce on the spot) and bark. */
  private wag(): void {
    for (const pet of ['dog0', 'dog1', 'dog2', 'dog3'] as Pet[]) {
      const im = this.pets[pet];
      if (im) this.scene.tweens.add({ targets: im, angle: { from: -5, to: 5 }, duration: 90, yoyo: true, repeat: 3, delay: Math.random() * 150, onComplete: () => im.setAngle(0) });
    }
  }

  /** Something jumps on the spot. */
  private hop(target: Box | Image, high: number): void {
    const y = target.y;
    this.scene.tweens.add({ targets: target, y: y - high, duration: 130, yoyo: true, ease: 'Quad.out', onComplete: () => target.setY(y) });
  }

  /** Stephanie hugs her duck tighter (each time a little more), and he says so. */
  private squeeze(n: number): void {
    const duck = this.pets.duck!, k = PET_SIZE / TEX;
    this.steph!.face('smile');
    this.scene.tweens.add({ targets: duck, scaleX: k * (1.15 + n * 0.08), scaleY: k * (0.72 - n * 0.06), duration: 110, yoyo: true, ease: 'Quad.out' });
    this.scene.tweens.add({ targets: this.steph!.box, angle: { from: -4, to: 4 }, duration: 90, yoyo: true, repeat: 1, onComplete: () => this.steph!.box.setAngle(0) });
    SOUNDS.quack();
    this.host.word('ride_quack', duck.x - 40, duck.y - 70);
  }

  /** ...and puts him down, for the night. */
  private putDown(): void {
    const duck = this.pets.duck!, s = this.scene;
    this.duckHeld = false;
    this.steph!.set('steph_stand');
    duck.setDepth(15.2);
    s.tweens.add({ targets: duck, x: duck.x + 46, duration: 360, ease: 'Sine.inOut' });
    s.tweens.add({ targets: duck, y: GROUND + 30, duration: 360, ease: 'Bounce.out' });
    SOUNDS.quack();
  }

  /** Off to bed: out past the grown-ups, bobbing as they go. */
  private walkOff(p: Person, delay: number): void {
    const s = this.scene;
    p.box.setDepth(p.box.depth - 2);
    s.tweens.add({ targets: p.box, x: view.W + 140, duration: 1900, delay, ease: 'Sine.in' });
    s.tweens.add({ targets: p.box, y: GROUND - 8, duration: 150, delay, yoyo: true, repeat: 6 });
  }

  // ==== the drive =================================================================================

  private startDrive(): void {
    const s = this.scene, W = view.W;
    this.clear();
    this.stage = 'drive';
    this.beat = 'drive';
    this.clock = 0;
    // the night, and the street from the paper route going by
    this.keep(s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x10142e).setDepth(0));
    const photo = ART.houses && ART.houses.h > 200;
    if (photo) this.strip('houses', 304 - ART.houses.h, 0.6, 1);
    else {
      this.strip('houses', 104, 0.6, 1);
      this.strip('lawn', 250, 1, 1.2);
    }
    this.strip('fence', 304 - (ART.fence?.h ?? 40), 1, 2.4);
    this.strip('sidewalk', 300, 1, 2, 50);
    this.strip('kerb', 346, 1, 2.2);
    this.strip('asphalt', 352, 1, 2, 200);
    this.strip('line_yellow', 466, 1, 2.2);
    this.strip('line_white', 524, 1, 2.2);
    this.strip('grass', 528, 1, 60);
    // (it is dark: everything but the van and what is in the road is dimmed)
    this.keep(s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x0a0e2a, 0.6).setDepth(6));
    this.keep(img(s, W - 120, 74, 'ride_moon').setDepth(6.5));
    // the forest at the edge of town, waiting off to the right
    const fw = FOREST.w, d = ART.ride_forest?.tex ?? TEX;
    this.forestX = W + BLEED + 40;
    this.forest = this.keep(s.add.tileSprite(this.forestX, 352 - FOREST.h, (MAX_W + BLEED * 2 + fw) * d, FOREST.h * d, 'ride_forest').setOrigin(0, 0).setScale(1 / d).setDepth(5));

    // the van, with Pappy at the wheel and every one of them out of a window
    this.vanX = W * 0.3;
    this.lane = 1;
    this.laneY = LANES[1];
    this.buildVan(true);
    this.road = [];
    this.next = 0;
    this.bumps = 0;
    this.driving = true;
    this.speed = SPEED;
    SOUNDS.start();

    // how far it is to the edge of town
    this.progress = this.keep(s.add.graphics().setDepth(80));
    this.keep(label(s, this.cx + 214, 62, 'EDGE OF TOWN', 18, '#f6c430').setDepth(81));
    this.marker = this.keep(img(s, this.cx - 150, 62, 'ride_van').setDepth(82));
    this.marker.setScale(0.09 / TEX);
    this.words('TAP TO SWERVE!');
    this.after(3.2, () => this.caption?.destroy());
  }

  private strip(key: string, y: number, k: number, depth: number, tall?: number): void {
    if (!this.scene.textures.exists(key) || !ART[key]) return;
    const d = ART[key].tex ?? TEX;
    const ts = this.keep(this.scene.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * d, (tall ?? ART[key].h) * d, key).setOrigin(0, 0).setScale(1 / d).setDepth(depth));
    this.strips.push({ ts, k, d });
  }

  /** The van from outside: its wheels, Pappy at the wheel, and the animals out of the windows. */
  private buildVan(onRoad: boolean): void {
    const s = this.scene;
    const beam = img(s, 262, -97, 'ride_beam');
    const body = img(s, 0, 0, 'ride_van');
    this.wheels = WHEELS.map(([x, y]) => img(s, x, y, 'ride_wheel'));
    const driver = img(s, DRIVER[0], DRIVER[1] + 6, faceKey(s, 'pappy', 'smug')).setRotation(0.08);
    driver.setScale(62 / FACE / TEX);
    const sill = img(s, DRIVER[0], DRIVER[1] + 6, 'ride_sill');
    this.heads = PETS.map((pet, i) => img(s, WINDOWS[i][0], WINDOWS[i][1] + 8, `ride_${pet}_head`).setFlipX(false));
    this.van = this.keep(s.add.container(this.vanX, this.laneY, [beam, body, ...this.wheels, driver, sill, ...this.heads]).setScale(onRoad ? ON_ROAD : 1).setDepth(this.vanDepth()));
  }

  private vanDepth(): number {
    return this.laneY > (LANES[0] + LANES[1]) / 2 ? 40 : 20;
  }

  private swerve(): void {
    if (!this.driving) return;
    this.lane = this.lane ? 0 : 1;
    sound.dodge();
  }

  private drive(dt: number): void {
    const s = this.scene, W = view.W;
    this.clock += dt;
    const go = this.speed * dt;
    for (const st of this.strips) st.ts.tilePositionX += go * st.k * st.d;
    for (const w of this.wheels) w.rotation += (go / 38) * 1.4;
    // the engine, now and then
    this.hum -= dt;
    if (this.hum <= 0 && this.speed > 40) {
      this.hum = 0.9;
      SOUNDS.engine(1, 0.8 + this.speed / SPEED * 0.4);
    }
    // what is in the road
    while (this.next < ROAD.length && ROAD[this.next][0] <= this.clock) {
      const [, lane, kind] = ROAD[this.next++];
      const key = kind === 'can' ? 'ride_can' : kind === 'cone' ? 'cone' : 'ride_hole';
      const im = this.keep(img(s, W + 70, LANES[lane] - (kind === 'hole' ? 4 : 0), key).setDepth(lane ? 35 : 15));
      if (kind === 'cone') im.setScale(1.7 / TEX);
      this.road.push({ n: this.next - 1, im, lane, kind, x: W + 70, done: false, hit: false });
    }
    for (const r of this.road) {
      r.x -= go;
      if (!r.hit) r.im.setX(r.x);
      const near = Math.abs(this.laneY - LANES[r.lane]) < 34;
      if (!r.done && near && r.x < this.vanX + 166 && r.x > this.vanX - 150) this.bump(r);
    }
    this.road = this.road.filter((r) => {
      if (r.x > -200 || r.hit) return true;
      r.im.destroy();
      return false;
    });

    // the edge of town: the forest comes in from the right, and covers the town as it goes by
    if (this.clock > TOWN && this.forest) {
      this.forestX = Math.max(-BLEED, this.forestX - go * 0.8);
      if (this.forestX > -BLEED) this.forest.setX(this.forestX);
      else this.forest.tilePositionX += go * 0.8 * (ART.ride_forest?.tex ?? TEX);
      if (!this.sign) {
        this.sign = this.keep(img(s, W + 120, 352, 'ride_sign').setDepth(5.5));
      }
    }
    if (this.sign) this.sign.setX(this.sign.x - go * 0.9);
    if (this.clock > TOWN + 2.6 && this.driving) {
      // and here it is
      this.driving = false;
      this.beat = 'edge';
      SOUNDS.brake();
      s.tweens.add({ targets: this, speed: 0, duration: 1300, ease: 'Quad.out' });
      this.after(1.5, () => {
        this.words('THE EDGE OF TOWN.');
        SOUNDS.cricket();
        for (let i = 0; i < 3; i++) this.after(0.2 + i * 0.25, () => SOUNDS.bark(1 + i * 0.1));
      });
      this.after(3.4, () => this.blackout(() => this.startKick()));
    }

    // where the van is: on its way to its lane, jolted by whatever it has just hit, and the heads in the wind
    const to = LANES[this.lane], step = ((LANES[1] - LANES[0]) / SWERVE) * dt;
    this.laneY = Math.abs(to - this.laneY) <= step ? to : this.laneY + Math.sign(to - this.laneY) * step;
    this.jolt = Math.max(0, this.jolt - dt * 4);
    const bounce = Math.sin(this.clock * 26) * 1.4 * (this.speed / SPEED) - Math.sin(this.jolt * Math.PI) * 22;
    this.van?.setPosition(this.vanX, this.laneY + bounce).setRotation((this.laneY - LANES[this.lane]) * -0.0012 + this.jolt * Math.sin(this.clock * 50) * 0.04);
    this.van?.setDepth(this.vanDepth());
    this.heads.forEach((h, i) => h.setRotation(Math.sin(this.clock * 9 + i * 1.7) * 0.12 * (this.speed / SPEED)));
    if (this.progress && this.marker) {
      const g = this.progress, x0 = this.cx - 150, x1 = this.cx + 150, k = Math.min(1, this.clock / (TOWN + 2.6));
      g.clear();
      g.fillStyle(0xfbf6ea, 0.9);
      for (let x = x0; x <= x1; x += 14) g.fillRect(x, 74, 7, 3);
      this.marker.setPosition(x0 + (x1 - x0) * k, 70);
    }
  }

  /** The van has hit something. */
  private bump(r: Hazard): void {
    const s = this.scene;
    r.done = true;
    this.bumps++;
    this.jolt = 1;
    const pet = PETS[Math.floor(Math.random() * PETS.length)];
    const head = this.heads[PETS.indexOf(pet)];
    if (head) s.tweens.add({ targets: head, y: head.y - 30, duration: 120, yoyo: true });
    if (pet === 'duck') SOUNDS.quack();
    else SOUNDS.yip();
    if (r.kind === 'hole') {
      SOUNDS.thud();
      this.host.word('bonk', this.vanX + 40, this.laneY - 170);
      return;
    }
    // (anything else goes flying, and no longer goes by with the road)
    r.hit = true;
    SOUNDS.crash();
    this.host.word(r.kind === 'can' ? 'crash' : 'bonk', r.x, this.laneY - 150);
    s.tweens.add({
      targets: r.im, x: r.x + 260, y: this.laneY - 260, angle: 540, duration: 700, ease: 'Quad.out',
      onComplete: () => s.tweens.add({ targets: r.im, y: H + 120, x: r.im.x + 120, duration: 500, ease: 'Quad.in' }),
    });
    if (r.kind === 'can') for (let i = 0; i < 6; i++) this.puff(`ride_trash${i % 3}`, r.x, this.laneY - 30, 80 + Math.random() * 300, -300 - Math.random() * 260, 1.1, 900, 45);
    if (this.bumps === 2) this.after(0.3, () => this.say(this.driverMouth(), 'WHOOPS.', 0.9, 40, -60, 18));
    if (this.bumps === 4) this.after(0.3, () => this.say(this.driverMouth(), 'HANG ON, FIDO!', 1.0, 40, -60, 18));
  }

  private driverMouth(): Point {
    return { x: this.vanX + DRIVER[0] * ON_ROAD, y: this.laneY + (DRIVER[1] - 20) * ON_ROAD };
  }

  // ==== the edge of town: one at a time, out of the side door ======================================

  private startKick(): void {
    const s = this.scene, W = view.W;
    this.clear();
    this.stage = 'kick';
    this.beat = 'door';
    // through the doorway, the forest; round it, the inside of the van
    const d = ART.ride_forest?.tex ?? TEX;
    this.keep(s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0x141432).setDepth(0));
    this.keep(s.add.tileSprite(-BLEED, DOORWAY.b - FOREST.h + 4, (MAX_W + BLEED * 2) * d, FOREST.h * d, 'ride_forest').setOrigin(0, 0).setScale(1 / d).setDepth(1).setTilePosition(260 * d, 0));
    this.keep(img(s, DOORWAY.l + 96, 170, 'ride_moon').setDepth(1.5));
    const owl = this.keep(img(s, DOORWAY.l + 250, 236, 'ride_owl').setDepth(1.6));
    s.tweens.add({ targets: owl, alpha: { from: 1, to: 0 }, duration: 90, yoyo: true, repeat: -1, repeatDelay: 2300 });
    this.slider = this.keep(img(s, DOORWAY.l - 4, DOORWAY.t - 4, 'ride_slider').setDepth(4));
    this.keep(img(s, -BLEED, -BLEED, 'ride_inside').setDepth(5));

    // Pappy, and all of them waiting their turn along the back
    this.pappy = this.keep(new Person(s, 'pappy', 'pappy_wait', 'smug', PAPPY_IN_VAN, DOORWAY.b, IN_VAN));
    this.pappy.box.setDepth(10);
    this.queue = [...PETS];
    this.pets = {};
    const x0 = PAPPY_IN_VAN + 70, x1 = W - 150, n = PETS.length;
    PETS.forEach((pet, i) => {
      const im = this.keep(img(s, x0 + ((x1 - x0) * i) / (n - 1), DOORWAY.b + 14 + (i % 2) * 18, `ride_${pet}`).setDepth(8 + (i % 2) * 0.5));
      im.setScale(IN_VAN / TEX);
      this.pets[pet] = im;
    });
    this.kicked = 0;
    this.misses = 0;

    this.script([
      [0.5, () => {
        // the side door, rolled back
        SOUNDS.slide();
        s.tweens.add({ targets: this.slider, x: DOORWAY.l - 4 - (DOORWAY.r - DOORWAY.l) - 60, duration: 520, ease: 'Quad.in' });
      }],
      [0.9, () => {
        this.pappy!.face('talking');
        this.say(this.pappy!.mouth, 'END OF THE LINE.', 1.2, 60, -70, 20);
      }],
      [1.3, () => {
        this.pappy!.face('smug');
        this.showMeter();
        this.nextPet();
      }],
    ]);
  }

  /** The meter, the same as the one in "FORE!": hold, and let go in the green. */
  private showMeter(): void {
    const s = this.scene, x = view.W - 70, y = 236, foot = y + METER.h / 2 - METER.pad, tall = METER.h - METER.pad * 2;
    this.meter = [
      this.keep(img(s, x, y, 'ride_meter').setDepth(90)),
      (this.zone = this.keep(img(s, x, foot - this.zone0 * tall, 'ride_zone').setDepth(91))),
      (this.fill = this.keep(img(s, x, foot, 'ride_fill').setDepth(92))),
      this.keep(label(s, x, y - METER.h / 2 - 20, 'KICK', 20, '#f6c430').setDepth(91)),
    ];
    const tape = this.keep(img(s, this.cx, 508, 'tape_m').setDepth(94));
    const note = this.keep(written(s, this.cx, 508, 'HOLD to wind up...  LET GO in the green!', 17).setDepth(95));
    tape.setScale((note.width + 26) / ART.tape_m.w / TEX, 1.15 / TEX);
    for (const o of [tape, note]) this.meter.push(o);
  }

  /** A new place for the green, and the meter emptied. */
  private newZone(): void {
    const y = 236, foot = y + METER.h / 2 - METER.pad, tall = METER.h - METER.pad * 2;
    this.zone0 = SWEET[0] + Math.random() * (SWEET[1] - SWEET[0]);
    this.zone?.setY(foot - this.zone0 * tall);
    this.air = 0;
    this.fill?.setScale(1 / TEX, 0);
  }

  /** The next one hops over to the door. */
  private nextPet(): void {
    const s = this.scene, pet = this.queue.shift();
    if (!pet) return this.allGone();
    const im = this.pets[pet]!;
    this.doorPet = pet;
    this.atDoor = im;
    this.triesHere = 0;
    im.setDepth(12);
    const to = { x: DOORWAY.r - 44, y: DOORWAY.b };
    s.tweens.add({ targets: im, x: to.x, duration: 520, ease: 'Sine.inOut' });
    s.tweens.add({ targets: im, y: to.y - 70, duration: 260, ease: 'Quad.out', yoyo: true, onComplete: () => im.setY(to.y) });
    if (pet === 'duck') SOUNDS.quack();
    else SOUNDS.bark(1 + PETS.indexOf(pet) * 0.08);
    this.after(0.6, () => {
      this.newZone();
      this.ready = true;
      this.botIn = this.host.auto === 'clumsy' ? 0.3 : 0.5;
    });
  }

  private windUp(): void {
    if (!this.ready || this.holding) return;
    this.holding = true;
    this.ticked = 0;
    this.pappy!.set('pappy_ready', 'angry');
  }

  /** He lets fly: in the green it connects, anywhere else it does not. */
  private strike(): void {
    const s = this.scene, im = this.atDoor!, pet = this.doorPet!;
    this.holding = false;
    this.ready = false;
    const good = this.air >= this.zone0 && this.air <= this.zone0 + ZONE;
    this.triesHere++;
    this.pappy!.set('pappy_kick', 'yell');
    const foot = this.pappy!.at(FOOT[0], FOOT[1]);
    if (!good) {
      // too soon or too late: the foot goes where it was a moment ago
      this.misses++;
      this.beat = 'whiff';
      sound.dodge();
      this.host.word('whiff', foot.x - 30, foot.y - 60);
      s.tweens.add({ targets: im, y: im.y - 70, duration: 170, yoyo: true, ease: 'Quad.out' });
      if (pet === 'duck') SOUNDS.quack();
      else this.after(0.25, () => SOUNDS.bark(1.2));
      this.after(0.4, () => {
        this.pappy!.set('pappy_wait', 'angry');
        this.say(this.pappy!.mouth, MISSED[(this.misses - 1) % MISSED.length], 1.0, 60, -76, 19);
      });
      this.after(1.3, () => {
        this.pappy!.face('smug');
        this.newZone();
        this.ready = true;
        this.botIn = 0.5;
      });
      return;
    }
    // BOOT: out of the door, and away into the dark
    this.beat = 'boot';
    this.kicked++;
    SOUNDS.boot();
    this.host.word('ride_boot', foot.x - 20, foot.y - 70);
    s.cameras.main.shake(90, 0.004);
    if (pet === 'duck') {
      SOUNDS.quack();
      applyArt(im, 'ride_duck_fly');
      im.setScale(IN_VAN / TEX).setFlipX(false);
      s.tweens.add({ targets: im, x: DOORWAY.l + 160, y: DOORWAY.t + 70, scale: 0.12 / TEX, duration: 1500, ease: 'Sine.out' });
      s.tweens.add({ targets: im, scaleY: { from: IN_VAN / TEX, to: (IN_VAN * 0.6) / TEX }, duration: 110, yoyo: true, repeat: 6 });
    } else {
      SOUNDS.yip();
      s.tweens.add({ targets: im, x: DOORWAY.l + 120 + Math.random() * 140, y: DOORWAY.t + 90 + Math.random() * 90, scale: 0.08 / TEX, angle: -720, duration: 950, ease: 'Quad.out' });
    }
    SOUNDS.away();
    this.after(0.14, () => im.setDepth(3));
    for (let i = 0; i < 4; i++) this.puff('star', foot.x, foot.y, -100 - Math.random() * 200, -120 - Math.random() * 200, 0.6, 400, 20);
    this.after(0.5, () => {
      this.pappy!.set('pappy_wait', 'yell');
      this.say(this.pappy!.mouth, GOODBYE[this.kicked - 1], 1.5, 60, -84, 20);
    });
    this.after(1.6, () => im.destroy());
    this.after(1.9, () => {
      this.pappy!.face('smug');
      this.nextPet();
    });
  }

  private allGone(): void {
    const s = this.scene;
    this.beat = 'gone';
    for (const o of this.meter) s.tweens.add({ targets: o, alpha: 0, duration: 200 });
    this.pappy!.set('pappy_wait', 'smile');
    this.say(this.pappy!.mouth, "WELL. THAT'S THAT.", 1.3, 60, -80, 20);
    this.script([
      [1.5, () => {
        SOUNDS.slide(true);
        s.tweens.add({ targets: this.slider, x: DOORWAY.l - 4, duration: 420, ease: 'Quad.out' });
      }],
      [0.7, () => SOUNDS.start()],
      [1.0, () => this.blackout(() => this.startBack())],
    ]);
  }

  // ==== home again ================================================================================

  private startBack(): void {
    const s = this.scene, W = view.W;
    this.clear();
    this.stage = 'back';
    this.beat = 'home';
    this.room();
    this.curt = this.keep(new Person(s, 'curt', 'curt_stand', 'calm', W * 0.3, GROUND, SIZE));
    this.steph = this.keep(new Person(s, 'stephanie', 'steph_stand', 'calm', W * 0.41, GROUND, SIZE));
    this.mammy = this.keep(new Person(s, 'mammy', 'homecoming_mammy_stand', 'smug', W * 0.8, GROUND, SIZE));
    this.pappy = this.keep(new Person(s, 'pappy', 'homecoming_pappy_stand', 'smile', 94, GROUND, SIZE));
    this.curt.box.setDepth(10);
    this.steph.box.setDepth(10.5);
    this.mammy.box.setDepth(11);
    this.pappy.box.setDepth(13).setAlpha(0);
    const by = W * 0.8 - 118;
    const kids = (look: string) => { this.curt!.face(look); this.steph!.face(look); };
    this.script([
      [0.4, () => {
        // in he comes, whistling
        s.tweens.add({ targets: this.pappy!.box, alpha: 1, duration: 200 });
        s.tweens.add({ targets: this.pappy!.box, x: by, duration: 1500, ease: 'Sine.inOut' });
        s.tweens.add({ targets: this.pappy!.box, y: GROUND - 7, duration: 150, yoyo: true, repeat: 4 });
        for (let i = 0; i < 4; i++) sound.tone({ type: 'sine', f0: [880, 988, 784, 1046][i], dur: 0.16, vol: 0.28, at: i * 0.2 });
      }],
      [1.7, () => {
        this.beat = 'where';
        kids('worried');
        this.say({ x: (this.curt!.mouth.x + this.steph!.mouth.x) / 2, y: this.steph!.mouth.y }, WHERE, 1.9, 20, -100, 20);
      }],
      [2.1, () => {
        // a kiss for Mammy
        this.beat = 'ranaway';
        this.pappy!.set('pappy_kiss', 'pucker');
        s.tweens.add({ targets: this.pappy!.box, x: by + 28, duration: 200, ease: 'Quad.out' });
        this.after(0.2, () => {
          SOUNDS.kiss();
          this.mammy!.face('smile');
          const cheek = this.mammy!.mouth;
          this.host.word('ride_mwah', cheek.x - 10, cheek.y - 70);
          for (let i = 0; i < 4; i++) this.puff('heart', cheek.x - 10, cheek.y - 20, (Math.random() - 0.5) * 120, -90 - Math.random() * 60, 1.2, -10, 30);
        });
        this.after(0.5, () => {
          this.pappy!.face('talking');
          this.say(this.pappy!.mouth, RAN_AWAY, 1.6, -110, -96, 22);
        });
      }],
      [2.2, () => {
        this.beat = 'cry';
        kids('cry');
        SOUNDS.wah();
        this.say({ x: (this.curt!.mouth.x + this.steph!.mouth.x) / 2, y: this.steph!.mouth.y }, 'WAAAAAH!', 1.4, 0, -96, 24);
        this.cry();
      }],
      [1.5, () => {
        // ...and the champagne
        this.beat = 'pop';
        this.pappy!.set('pappy_bottle', 'laugh');
        this.mammy!.set('mammy_glass', 'laugh');
        const hand = this.pappy!.at(BOTTLE_HAND[0], BOTTLE_HAND[1]);
        const bottle = this.keep(img(s, hand.x, hand.y, 'ride_bottle').setDepth(13.5).setRotation(-0.5));
        bottle.setScale(SIZE / TEX);
        const glassAt = this.mammy!.at(GLASS_HAND[0], GLASS_HAND[1]);
        this.keep(img(s, glassAt.x, glassAt.y, 'ride_glass').setDepth(11.5)).setScale(SIZE / TEX);
        const neck = { x: hand.x - 34, y: hand.y - 56 };
        SOUNDS.pop();
        this.host.word('ride_pop', Math.min(neck.x - 60, view.W - 150), Math.max(130, neck.y - 30));
        this.puff('ride_cork', neck.x, neck.y, -140, -520, 1.4, 700, 40);
        for (let i = 0; i < 16; i++) this.puff('ride_fizz', neck.x, neck.y, -220 + Math.random() * 300, -260 - Math.random() * 260, 1.0, 600, 40);
      }],
      [0.6, () => {
        SOUNDS.haha();
        this.say({ x: (this.pappy!.mouth.x + this.mammy!.mouth.x) / 2, y: this.mammy!.mouth.y }, 'HA HA HA!', 1.6, 0, -110, 24);
        this.after(0.9, () => SOUNDS.haha());
      }],
      [2.4, () => {
        this.stage = 'done';
        this.host.finish(true);
      }],
    ]);
  }

  /** The children's tears, for as long as the game lasts. */
  private cry(): void {
    if (this.stage !== 'back') return;
    for (const p of [this.curt!, this.steph!]) {
      const e = p.eyes;
      for (const side of [-1, 1]) this.puff('tear', e.x + side * 14, e.y, side * (60 + Math.random() * 70), -110 - Math.random() * 60, 0.8, 600, 30);
    }
    this.after(0.22, () => this.cry());
  }

  // ==== fingers ===================================================================================

  press(_at: Point): void {
    if (this.stage === 'drive') this.swerve();
    else if (this.stage === 'kick') this.windUp();
  }

  release(): void {
    if (this.stage === 'kick' && this.holding) this.strike();
  }

  // ==== odds and ends =============================================================================

  /** Keep hold of something put on the page, to clear it away with the rest of this part of the story. */
  private keep<T extends Thing | Person>(thing: T): T {
    this.shot.push(thing instanceof Person ? thing.box : (thing as Thing));
    return thing;
  }

  /** Keep hold of whatever `lay` puts on the page (a place laid with one call, which does not hand it back). */
  private capture(lay: () => void): void {
    const before = new Set(this.scene.children.list);
    lay();
    for (const o of this.scene.children.list) if (!before.has(o)) this.shot.push(o);
  }

  /** Away with everything of the last part of the story. */
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
    this.strips = [];
    this.caption?.destroy();
    this.caption = undefined;
    this.later = [];
    this.cues = [];
    this.sign = undefined;
    this.forest = undefined;
    this.scene.cameras.main.resetFX();
  }

  /** The page goes dark, and comes up again on whatever is next. */
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
    const box = bubble(this.scene, Phaser.Math.Clamp(mouth.x + dx, 130, view.W - 130), Math.max(110, mouth.y + dy), text, mouth, size).setDepth(120);
    this.said.push({ box, left: secs });
  }

  private hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  /** What is going on, in big letters along the bottom. */
  private words(text: string): void {
    this.caption?.destroy();
    let size = 34;
    const words = label(this.scene, this.cx, 508, text, size, '#f6c430').setDepth(130);
    while (words.width > view.W - 30 && size > 18) words.setFontSize(--size);
    words.setScale(1.3);
    this.scene.tweens.add({ targets: words, scale: 1, duration: 150, ease: 'Back.out' });
    this.caption = words;
  }

  /** Something small in the air: it flies, falls (or floats up) and is gone. */
  private puff(key: string, x: number, y: number, vx: number, vy: number, life: number, drop: number, depth = 30): void {
    const im = img(this.scene, x, y, key).setDepth(depth);
    this.bits.push({ im, vx, vy, spin: key === 'tear' || key === 'heart' ? 0 : (Math.random() - 0.5) * 9, life, drop });
  }

  update(dt: number): void {
    if (this.stage === 'done') return;
    this.t += dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();
    for (const l of this.later) l.left -= dt;
    const due = this.later.filter((l) => l.left <= 0);
    this.later = this.later.filter((l) => l.left > 0);
    for (const l of due) l.run();

    if (this.stage === 'home' && this.duckHeld && this.steph && this.pets.duck) {
      // the duck stays in her arms
      const a = this.steph.at(ARMS[0], ARMS[1]);
      this.pets.duck.setPosition(a.x, a.y + 30);
    }
    if (this.stage === 'drive') this.drive(dt);
    if (this.stage === 'kick' && this.holding) {
      this.air += dt / FILL;
      if (this.air < 1 && Math.floor(this.air * 8) > this.ticked) {
        this.ticked = Math.floor(this.air * 8);
        sound.tick();
      }
      if (this.air > 1 + TOO_LONG / FILL) this.strike();
    }
    if (this.stage === 'kick' && this.fill) {
      this.fill.setScale(1 / TEX, ((1 / TEX) * Math.min(this.air, 1) * (METER.h - METER.pad * 2)) / 8);
      // he winds up as it fills; past full, he cannot hold it
      const wobble = this.air > 1 ? Math.sin(this.t * 44) * 0.05 : 0;
      this.pappy?.box.setRotation(this.holding ? 0.08 * Math.min(this.air, 1) + wobble : 0);
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
  }

  timeUp(): boolean {
    return true;
  }

  bot(dt: number): void {
    const clumsy = this.host.auto === 'clumsy';
    if (this.stage === 'drive' && this.driving) {
      // swerve round whatever is coming in this lane, if the other is clear (the careless one sees
      // every third thing too late)
      const coming = this.road.some((r) => !r.done && r.lane === this.lane && r.x > this.vanX && r.x < this.vanX + 166 + (clumsy && r.n % 3 === 0 ? 10 : 430));
      const other = this.road.some((r) => !r.done && r.lane !== this.lane && r.x > this.vanX - 170 && r.x < this.vanX + 250);
      if (coming && !other && this.laneY === LANES[this.lane]) this.swerve();
    } else if (this.stage === 'kick' && this.ready) {
      this.botIn -= dt;
      if (this.botIn > 0) return;
      if (!this.holding) this.windUp();
      // the careless one lets go far too soon, the first time at each
      const at = clumsy && this.triesHere === 0 ? 0.08 : this.zone0 + ZONE / 2;
      if (this.holding && this.air >= at) this.strike();
    }
  }
}
