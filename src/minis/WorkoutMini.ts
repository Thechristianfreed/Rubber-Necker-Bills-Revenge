import Phaser from 'phaser';
import { H, HEAD_SRC_H, MAX_W, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { BILL_HEAD, DEN_FLOOR, POSES, POSE_IDS, STANCE, TV } from '../art/minis';
import { ART, applyArt, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { WORKOUT_BODIES } from '../data/workout';
import { label, written } from '../ui/text';
import { Mini, Point } from './Mini';

type Image = Phaser.GameObjects.Image;

/** Every pose is done once, in a different order each time. There are two
 *  points to be had from each (the right pose, and a proper breath), and two
 *  thirds of them pass. Each pose is given this many seconds, all told. */
const REPS = POSE_IDS.length;
const PASS = Math.ceil((REPS * 2 * 2) / 3);
const SECONDS_EACH = 8.7;
/** Where the television stands, and how far down its screen Mom's feet are.
 *  She is shown as big as the screen will hold, whatever she is doing (as the
 *  camera would frame her), up to MOM_MAX of her full size and with MOM_ROOM
 *  to spare at the top and the sides. */
const TV_AT = { x: 34, y: 18 };
const MOM_FLOOR = 0.94;
const MOM_MAX = 1.2;
const MOM_ROOM = 7;
/** Bill's head hangs from his chin, a little way down his neck. His everyday
 *  heads are pictures with the head in the middle and room all round it: this
 *  is how far down them his chin is. */
const NECK = 8;
const OLD_CHIN = 0.903;
/** The faces he pulls for the breathing, and which everyday head stands in for each if its photo is missing. */
const FACES: Record<string, string> = { bill_in: 'bill-sideeye', bill_hold: 'bill-glare', bill_pah: 'bill-glare' };
/** Bill is nearer to us than the television is, so he is drawn bigger than life. */
const BILL_SIZE = 1.2;
/** How big the snapshots of the poses are, next to the real thing. */
const SNAP = 0.25;
const FLOOR_Y = 404;
/** A full breath in takes this long (as long as it does on the tape). Let go in the top part of it (ZONE and
 *  up) for a proper PAH; hold on this long past full and it ends in a cough. */
const INHALE = 1.3;
const ZONE = 0.76;
const TOO_LONG = 0.5;

/** Where somebody's chin is in a pose, from the spot on the floor they are on,
 *  and how far their head tips: from the photo of that pose if there is one,
 *  otherwise from the paper doll. */
function chinOf(who: 'mom' | 'bill', pose: string): { x: number; y: number; tilt: number } {
  const photo = WORKOUT_BODIES[who]?.[pose];
  if (photo) return { x: photo.chin[0], y: photo.chin[1], tilt: photo.tilt };
  const doll = POSES[pose];
  return { x: doll.head[0], y: doll.head[1] + 30, tilt: doll.tilt };
}

/** Mom's workout tape. She is on the television, facing us, and calls a pose:
 *  pick the same one for Bill. Then the famous breathing, done as on the tape,
 *  bent over with a hand on each knee: hold to breathe in, let go at the top
 *  of the breath for the PAH, then into the pose and hold it while you turn
 *  purple. Three poses. The music and the breathing are the tape's own. */
export class WorkoutMini extends Mini {
  readonly title = "MOM'S WORKOUT TAPE";
  readonly prompt = 'COPY MOM, THEN BREATHE!';
  readonly seconds = Math.round(REPS * SECONDS_EACH);
  readonly music = 'workout';

  private phase: 'pose' | 'picked' | 'breathe' | 'hold' | 'done' = 'pose';
  private left = 0;
  private rep = 0;
  private points = 0;
  /** The poses in the order they will be called this time, and the one Mom is calling now. */
  private order: string[] = [];
  private target = '';
  /** The pose picked for Bill this time, and what each of them is doing right now. */
  private worn = '';
  private momPose = STANCE;
  private billPose = STANCE;
  /** How full Bill's lungs are (1 is full), and whether a finger is down. */
  private air = 0;
  private holding = false;
  private momAir = 0;
  /** Whether the breath just let go was a proper PAH. */
  private pahed = false;
  private t = 0;

  private mom!: Image;
  private momHead!: Image;
  private bill!: Image;
  private billHead!: Image;
  /** Which face he has on, and how big that picture has to be drawn. */
  private billFace = '';
  private billFaceSize = 1;
  /** How big Mom is on the screen in the pose she is in, and where on it her spot on the floor is. */
  private momSize = 1;
  private momX = 0;
  private note!: Phaser.GameObjects.Text;
  private noteTape!: Image;
  private cards: { card: Image; thumb: Image; head: Image; id: string }[] = [];
  private lungs!: Image;
  private breath!: Image;
  private band!: Phaser.GameObjects.Rectangle;
  private clock!: Phaser.GameObjects.Text;

  private get billX(): number {
    return Math.max(view.W * 0.7, 640);
  }

  build(): void {
    const s = this.scene;
    // the den: the photo of it, or wallpaper and carpet cut from paper
    if (s.textures.exists('den')) {
      s.add.image(-BLEED, FLOOR_Y - DEN_FLOOR, 'den').setOrigin(0, 0).setScale(1 / (ART.den.tex ?? TEX)).setDepth(1);
    } else {
      const strip = (key: string, y: number, h: number) => s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, h * TEX, key)
        .setOrigin(0, 0).setScale(1 / TEX).setDepth(1);
      strip('den_wall', -BLEED, FLOOR_Y + BLEED);
      strip('den_carpet', FLOOR_Y, H - FLOOR_Y + BLEED);
    }

    // The television. Its glass is a hole, and the tape plays behind it: the room, Mom, and the
    // lines and the rolling bar of an old tape over her. Nothing back there may stick out past the set.
    const sx = TV_AT.x + TV.screen.x, sy = TV_AT.y + TV.screen.y, sw = TV.screen.w, sh = TV.screen.h;
    const room = img(s, sx - 2, sy - 2, 'tape_room').setDepth(4);
    room.setScale(((sw + 4) / ART.tape_room.w) * room.scaleX, ((sh + 4) / ART.tape_room.h) * room.scaleY);
    this.mom = img(s, sx + sw / 2, sy + sh * MOM_FLOOR, 'pose_mom_lunge').setDepth(5);
    this.momHead = img(s, 0, 0, 'mom_smile').setDepth(6);
    s.add.tileSprite(sx, sy, sw, sh, 'tv_lines').setOrigin(0, 0).setDepth(7);
    this.band = s.add.rectangle(sx + sw / 2, sy, sw - 12, 16, 0xffffff, 0.1).setDepth(7);
    label(s, sx + 46, sy + 22, 'PLAY >', 15, '#eaffea', 3).setDepth(8).setAlpha(0.85);
    img(s, TV_AT.x, TV_AT.y, 'tv_set').setDepth(10);
    this.clock = s.add.text(TV_AT.x + TV.clock.x, TV_AT.y + TV.clock.y, '12:00', {
      fontFamily: 'ui-monospace, "Courier New", monospace', fontStyle: 'bold', fontSize: '15px', color: '#7dff8a',
      resolution: Math.max(1, Math.ceil(view.RES)),
    }).setOrigin(0.5).setDepth(11);

    // Bill, on the carpet, in the same get-up
    this.bill = img(s, this.billX, 462, `pose_bill_${STANCE}`).setDepth(30);
    this.billHead = s.add.image(0, 0, 'bill-sideeye').setDepth(31);
    this.wear('bill-sideeye');

    // three snapshots in front of the television to pick from, each of Bill doing a pose
    for (let i = 0; i < 3; i++) {
      const x = TV_AT.x + 78 + i * 142, y = 488;
      const card = img(s, x, y, 'pose_card').setDepth(40).setRotation((i - 1) * 0.05);
      const thumb = img(s, x, y + 30, 'pose_bill_lunge').setDepth(41);
      const head = s.add.image(0, 0, 'bill-sideeye').setDepth(42).setOrigin(0.5, OLD_CHIN).setScale((BILL_HEAD / HEAD_SRC_H) * SNAP);
      this.cards.push({ card, thumb, head, id: '' });
    }
    this.lungs = img(s, this.billX + 172, 300, 'lungs').setDepth(40);
    this.breath = img(s, this.lungs.x, 394, 'breath').setDepth(41).setOrigin(0.5, 1);
    this.noteTape = img(s, 0, 0, 'tape_m').setDepth(44);
    this.note = written(s, 0, 0, '', 17).setDepth(45);
    // every pose once; not the breathing stance first, since that is how Bill starts out
    this.order = Phaser.Utils.Array.Shuffle([...POSE_IDS]);
    if (this.order[0] === STANCE) {
      const swap = 1 + Math.floor(Math.random() * (this.order.length - 1));
      [this.order[0], this.order[swap]] = [this.order[swap], this.order[0]];
    }
    this.startRep();
    this.place();
  }

  // ---- the routine -------------------------------------------------------------------

  private say(text: string): void {
    const x = this.billX + 20, y = 512;
    this.note.setText(text).setPosition(x, y);
    this.noteTape.setPosition(x, y);
    this.noteTape.setScale((this.note.width + 26) / ART.tape_m.w / TEX, 1.15 / TEX);
  }

  /** Mom strikes the next pose, and there are three snapshots to choose from. */
  private startRep(): void {
    this.target = this.order[this.rep];
    const wrong = Phaser.Utils.Array.Shuffle(POSE_IDS.filter((id) => id !== this.target)).slice(0, 2);
    const options = Phaser.Utils.Array.Shuffle([this.target, ...wrong]);
    this.cards.forEach((c, i) => {
      c.id = options[i];
      applyArt(c.card, 'pose_card');
      applyArt(c.thumb, `pose_bill_${c.id}`);
      c.thumb.setScale(c.thumb.scale * SNAP);
      const chin = chinOf('bill', c.id);
      c.head.setPosition(c.thumb.x + chin.x * SNAP, c.thumb.y + (chin.y + NECK) * SNAP).setRotation(chin.tilt);
      this.show(c, true);
    });
    // (Bill stays as he was, holding the last one, until he is given the next)
    this.strike(this.target, this.billPose);
    applyArt(this.momHead, 'mom_smile');
    this.momAir = 0;
    this.air = 0;
    this.holding = false;
    this.phase = 'pose';
    this.left = 3.6;
    this.lungs.setVisible(false);
    this.breath.setVisible(false);
    this.say(`TAP the pose Mom is doing  (${this.rep + 1} of ${REPS})`);
  }

  private pick(id: string): void {
    const right = id === this.target;
    this.worn = id;
    this.strike(this.target, id);
    for (const c of this.cards) {
      if (c.id === id) applyArt(c.card, 'pose_card_on');
      else this.show(c, false);
    }
    if (right) {
      this.points++;
      sound.cash();
      this.host.word('nice', this.billX + 90, 250);
    } else {
      sound.clang();
      this.host.word('nope', this.billX + 90, 250);
      this.scene.cameras.main.shake(120, 0.005);
    }
    this.say(right ? 'That is the one!' : 'Not that one...');
    this.phase = 'picked';
    this.left = 0.55;
  }

  private startBreath(): void {
    for (const c of this.cards) this.show(c, false);
    this.phase = 'breathe';
    this.left = 4.4;
    this.air = 0;
    this.momAir = 0;
    this.holding = false;
    this.lungs.setVisible(true);
    this.breath.setVisible(true);
    // the breathing is done bent over, a hand on each knee
    this.strike(STANCE, STANCE);
    this.say('HOLD to breathe in... LET GO at the top!');
  }

  /** Out it comes: a proper PAH if the lungs were full, or something less. */
  private exhale(): void {
    // over his head, not over his face: going purple is the good bit
    const chin = chinOf('bill', this.worn);
    // (beside him instead, when he is stretched up so tall that there is no room above)
    const above = this.bill.y + chin.y * BILL_SIZE - 230;
    const at = above > 92 ? { x: this.billX + chin.x * BILL_SIZE + 50, y: above } : { x: this.billX - 170, y: 170 };
    this.holding = false;
    this.pahed = false;
    if (this.air > 1 + TOO_LONG / INHALE) {
      sound.cough();
      this.host.word('cough', at.x, at.y);
    } else if (this.air >= ZONE) {
      this.points++;
      this.pahed = true;
      sound.pah();
      this.host.word('pah', at.x, at.y, true);
      this.scene.cameras.main.shake(220, 0.012);
    } else {
      sound.wheeze();
      this.host.word('pff', at.x, at.y);
    }
    this.phase = 'hold';
    this.left = 1.0;
    this.say('...and HOLD IT');
    // and straight into the pose, holding it in
    this.strike(this.target, this.worn);
    // Mom lets hers go with ours, then holds it too
    applyArt(this.momHead, 'mom_pah');
    this.lungs.setVisible(false);
    this.breath.setVisible(false);
  }

  /** Put a face on Bill: one of his everyday heads, or one of the faces for the breathing. */
  private wear(face: string): void {
    if (FACES[face] && !this.scene.textures.exists(face)) face = FACES[face];
    if (face === this.billFace) return;
    this.billFace = face;
    if (FACES[face]) {
      applyArt(this.billHead, face);
      this.billFaceSize = this.billHead.scale;
    } else {
      this.billHead.setTexture(face).setOrigin(0.5, OLD_CHIN);
      this.billFaceSize = BILL_HEAD / HEAD_SRC_H;
    }
  }

  /** Lay a snapshot out, or take it away. */
  private show(c: { card: Image; thumb: Image; head: Image }, on: boolean): void {
    c.card.setVisible(on);
    c.thumb.setVisible(on);
    c.head.setVisible(on);
  }

  /** Put the two of them into a pose each. */
  private strike(mom: string, bill: string): void {
    this.momPose = mom;
    this.billPose = bill;
    applyArt(this.mom, `pose_mom_${mom}`);
    applyArt(this.bill, `pose_bill_${bill}`);
    this.frame();
  }

  /** Frame Mom in the screen: as big as she can be with all of her in shot,
   *  head included, and in the middle of it from side to side. */
  private frame(): void {
    const body = ART[`pose_mom_${this.momPose}`], head = ART.mom_pah, chin = chinOf('mom', this.momPose);
    // how far she reaches from her spot on the floor: left, right and up
    const left = Math.min(-body.ax, chin.x - head.ax);
    const right = Math.max(body.w - body.ax, chin.x + head.w - head.ax);
    const up = Math.max(body.ay, head.ay - chin.y);
    const sw = TV.screen.w, sh = TV.screen.h;
    this.momSize = Math.min(MOM_MAX, (sh * MOM_FLOOR - MOM_ROOM) / up, (sw - MOM_ROOM * 2) / (right - left));
    this.momX = TV_AT.x + TV.screen.x + sw / 2 - ((left + right) / 2) * this.momSize;
  }

  // ---- taps --------------------------------------------------------------------------

  press(at: Point): void {
    if (this.phase === 'pose') {
      const hit = this.cards.find((c) => Math.abs(at.x - c.card.x) < 60 && Math.abs(at.y - c.card.y) < 64);
      if (hit) this.pick(hit.id);
    } else if (this.phase === 'breathe' && !this.holding && this.air === 0) {
      this.holding = true;
      sound.inhale(INHALE / this.host.speed);
    }
  }

  release(): void {
    if (this.phase === 'breathe' && this.holding) this.exhale();
  }

  // ---- every frame -------------------------------------------------------------------

  update(dt: number): void {
    this.t += dt;
    this.left -= dt;
    if (this.phase === 'pose' && this.left <= 0) {
      // dithered too long: Bill does whatever he was doing, which is wrong
      this.pick(this.cards.find((c) => c.id !== this.target)!.id);
    } else if (this.phase === 'picked' && this.left <= 0) {
      this.startBreath();
    } else if (this.phase === 'breathe') {
      // Mom shows how: in, and PAH at the top
      this.momAir = Math.min(1, this.momAir + dt / INHALE);
      if (this.momAir >= 1 && this.momHead.texture.key !== 'mom_pah') applyArt(this.momHead, 'mom_pah');
      else if (this.momAir < 1 && this.momHead.texture.key !== 'mom_in') applyArt(this.momHead, 'mom_in');
      if (this.holding) {
        this.air += dt / INHALE;
        if (this.air > 1 + TOO_LONG / INHALE) this.exhale();
      } else if (this.left <= 0) {
        this.exhale();
      }
    } else if (this.phase === 'hold' && this.left > 0) {
      if (this.left < 0.62 && this.momHead.texture.key !== 'mom_hold') applyArt(this.momHead, 'mom_hold');
    } else if (this.phase === 'hold') {
      this.rep++;
      if (this.rep >= REPS) {
        this.phase = 'done';
        this.host.finish(this.points >= PASS);
      } else {
        this.startRep();
      }
    }
    this.place();
  }

  /** Put the two heads on the two bodies, and show the breath going in and out. */
  private place(): void {
    const k = 1 / TEX;
    // Mom, on the screen
    const mp = chinOf('mom', this.momPose), ms = this.momSize;
    const momIn = this.phase === 'breathe' ? this.momAir : 0;
    const momHold = this.phase === 'hold' ? 1 : 0;
    const momWide = 1 + 0.07 * momIn - 0.1 * momHold;
    this.mom.setX(this.momX).setScale(k * ms * momWide, k * ms);
    this.momHead.setScale(k * ms)
      .setPosition(this.mom.x + mp.x * ms * momWide, this.mom.y + mp.y * ms - momIn * 4)
      .setRotation(mp.tilt - momIn * 0.12 + (momHold ? Math.sin(this.t * 38) * 0.04 : 0));
    this.band.y = TV_AT.y + TV.screen.y + ((this.t * 46) % (TV.screen.h - 16)) + 8;
    this.clock.setVisible(Math.floor(this.t * 2) % 2 === 0);

    // Bill, on the carpet
    const bp = chinOf('bill', this.billPose);
    const full = Math.min(this.air, 1.2), held = this.phase === 'hold' ? 1 : 0;
    const strain = held || this.air > 1 ? Math.sin(this.t * 40) * 2.2 : 0;
    const wide = 1 + 0.13 * full - 0.12 * held;
    this.bill.setScale(k * wide * BILL_SIZE, k * BILL_SIZE);
    // his face: the PAH as it comes out, then holding it; the breath going in; or just himself
    this.wear(held ? (this.pahed && this.left > 0.62 ? 'bill_pah' : 'bill_hold')
      : this.air > 1 ? 'bill_hold'
        : this.holding ? 'bill_in'
          : this.phase === 'picked' && this.worn === this.target ? 'bill-grin' : 'bill-sideeye');
    this.billHead.setScale(this.billFaceSize * BILL_SIZE)
      .setPosition(this.billX + bp.x * wide * BILL_SIZE + strain, this.bill.y + (bp.y + NECK) * BILL_SIZE - full * 6)
      .setRotation(bp.tilt - full * 0.14);
    // He goes redder the longer he holds it. (The photos of him holding it are red already.)
    const photo = FACES[this.billFace] ? 0.3 : 1;
    const red = this.billFace === 'bill_pah' ? 0 : (held ? 1 : Math.max(0, this.air - 0.85) * 2.2) * photo;
    const fade = Math.round(255 - Math.min(1, red) * 120);
    this.billHead.setTint((255 << 16) | (fade << 8) | fade);
    this.breath.setScale(k, (k * Math.min(this.air, 1) * 188) / 8);
  }

  timeUp(): boolean {
    return this.points >= PASS;
  }

  bot(): void {
    const good = this.host.auto === 'good';
    if (this.phase === 'pose' && this.left < 3.0) {
      const c = good ? this.cards.find((x) => x.id === this.target)! : this.cards[0];
      this.press({ x: c.card.x, y: c.card.y });
    } else if (this.phase === 'breathe') {
      if (!this.holding && this.air === 0) this.press({ x: 0, y: 0 });
      else if (this.holding && this.air >= (good ? 0.88 : 0.3)) this.release();
    }
  }
}
