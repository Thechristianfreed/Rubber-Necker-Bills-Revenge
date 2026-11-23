import Phaser from 'phaser';
import { H, HEAD_SRC_H, MAX_W, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { POSES, POSE_IDS, STANCE, TV, WORKOUT_HEAD } from '../art/minis';
import { ART, applyArt, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { label, written } from '../ui/text';
import { Mini, Point } from './Mini';

type Image = Phaser.GameObjects.Image;

/** How many poses there are to get through, and how many points pass (there
 *  are two to be had from each: the right pose, and a proper breath). */
const REPS = 3;
const PASS = 4;
/** Where the television stands, and how big Mom is on its screen. */
const TV_AT = { x: 34, y: 36 };
const MOM_FLOOR = 276;
const MOM_SIZE = 0.72;
/** Bill's head is a size too big for his body, as everywhere else. */
const BILL_HEAD = WORKOUT_HEAD * 1.3;
const FLOOR_Y = 404;
/** A full breath in takes this long (as long as it does on the tape). Let go in the top part of it (ZONE and
 *  up) for a proper PAH; hold on this long past full and it ends in a cough. */
const INHALE = 1.3;
const ZONE = 0.76;
const TOO_LONG = 0.5;

/** Mom's workout tape. She is on the television, facing us, and calls a pose:
 *  pick the same one for Bill. Then the famous breathing, done as on the tape,
 *  bent over with a hand on each knee: hold to breathe in, let go at the top
 *  of the breath for the PAH, then into the pose and hold it while you turn
 *  purple. Three poses. The music and the breathing are the tape's own. */
export class WorkoutMini extends Mini {
  readonly title = "MOM'S WORKOUT TAPE";
  readonly prompt = 'COPY MOM, THEN BREATHE!';
  readonly seconds = 26;
  readonly music = 'workout';

  private phase: 'pose' | 'picked' | 'breathe' | 'hold' | 'done' = 'pose';
  private left = 0;
  private rep = 0;
  private points = 0;
  private target = '';
  /** The pose picked for Bill this time, and what each of them is doing right now. */
  private worn = '';
  private momPose = STANCE;
  private billPose = STANCE;
  /** How full Bill's lungs are (1 is full), and whether a finger is down. */
  private air = 0;
  private holding = false;
  private momAir = 0;
  private t = 0;

  private mom!: Image;
  private momHead!: Image;
  private bill!: Image;
  private billHead!: Image;
  private caption!: Phaser.GameObjects.Text;
  private note!: Phaser.GameObjects.Text;
  private noteTape!: Image;
  private cards: { card: Image; thumb: Image; id: string }[] = [];
  private lungs!: Image;
  private breath!: Image;
  private band!: Phaser.GameObjects.Rectangle;
  private clock!: Phaser.GameObjects.Text;

  private get billX(): number {
    return Math.max(view.W * 0.7, 640);
  }

  build(): void {
    const s = this.scene, W = view.W;
    const strip = (key: string, y: number, h: number) => s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, h * TEX, key)
      .setOrigin(0, 0).setScale(1 / TEX).setDepth(1);
    strip('den_wall', -BLEED, FLOOR_Y + BLEED);
    strip('den_carpet', FLOOR_Y, H - FLOOR_Y + BLEED);

    // the television, Mom on its screen, and the lines and the rolling bar of an old tape over her
    img(s, TV_AT.x, TV_AT.y, 'tv_set').setDepth(10);
    const sx = TV_AT.x + TV.screen.x, sy = TV_AT.y + TV.screen.y;
    this.mom = img(s, sx + TV.screen.w / 2, TV_AT.y + MOM_FLOOR, 'pose_mom_lunge').setDepth(12);
    this.momHead = img(s, 0, 0, 'mom_smile').setDepth(13);
    s.add.tileSprite(sx, sy, TV.screen.w, TV.screen.h, 'tv_lines').setOrigin(0, 0).setDepth(15);
    this.band = s.add.rectangle(sx + TV.screen.w / 2, sy, TV.screen.w - 12, 16, 0xffffff, 0.1).setDepth(15);
    this.caption = label(s, sx + TV.screen.w / 2, sy + TV.screen.h - 22, '', 26).setDepth(16);
    label(s, sx + 44, sy + 20, 'PLAY >', 16, '#eaffea', 3).setDepth(16).setAlpha(0.85);
    this.clock = s.add.text(TV_AT.x + 70, TV_AT.y + 346, '12:00', {
      fontFamily: 'ui-monospace, "Courier New", monospace', fontStyle: 'bold', fontSize: '17px', color: '#7dff8a',
      resolution: Math.max(1, Math.ceil(view.RES)),
    }).setDepth(16);

    // Bill, on the carpet, in the same get-up
    this.bill = img(s, this.billX, 452, `pose_bill_${STANCE}`).setDepth(30);
    this.billHead = s.add.image(0, 0, 'bill-sideeye').setDepth(31).setScale(BILL_HEAD / HEAD_SRC_H);

    // three snapshots under the television to pick from
    for (let i = 0; i < 3; i++) {
      const x = TV_AT.x + 78 + i * 142, y = 484;
      const card = img(s, x, y, 'pose_card').setDepth(40).setRotation((i - 1) * 0.05);
      const thumb = img(s, x, y + 30, 'pose_bill_lunge').setDepth(41);
      this.cards.push({ card, thumb, id: '' });
    }
    this.lungs = img(s, this.billX + 172, 300, 'lungs').setDepth(40);
    this.breath = img(s, this.lungs.x, 394, 'breath').setDepth(41).setOrigin(0.5, 1);
    this.noteTape = img(s, 0, 0, 'tape_m').setDepth(44);
    this.note = written(s, 0, 0, '', 17).setDepth(45);
    void W;
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
    const others = POSE_IDS.filter((id) => id !== this.target);
    this.target = others[Math.floor(Math.random() * others.length)];
    const wrong = POSE_IDS.filter((id) => id !== this.target).sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [this.target, ...wrong].sort(() => Math.random() - 0.5);
    this.cards.forEach((c, i) => {
      c.id = options[i];
      applyArt(c.card, 'pose_card');
      applyArt(c.thumb, `pose_bill_${c.id}`);
      c.thumb.setScale(0.25 / TEX);
      c.card.setVisible(true);
      c.thumb.setVisible(true);
    });
    this.strike(this.target, STANCE);
    applyArt(this.momHead, 'mom_smile');
    this.caption.setText(POSES[this.target].name);
    this.momAir = 0;
    this.air = 0;
    this.holding = false;
    this.phase = 'pose';
    this.left = 3.6;
    this.lungs.setVisible(false);
    this.breath.setVisible(false);
    this.say('TAP the pose Mom is doing');
  }

  private pick(id: string): void {
    const right = id === this.target;
    this.worn = id;
    this.strike(this.target, id);
    for (const c of this.cards) {
      if (c.id === id) applyArt(c.card, 'pose_card_on');
      else { c.card.setVisible(false); c.thumb.setVisible(false); }
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
    this.phase = 'picked';
    this.left = 0.55;
  }

  private startBreath(): void {
    for (const c of this.cards) { c.card.setVisible(false); c.thumb.setVisible(false); }
    this.phase = 'breathe';
    this.left = 4.4;
    this.air = 0;
    this.momAir = 0;
    this.holding = false;
    this.lungs.setVisible(true);
    this.breath.setVisible(true);
    // the breathing is done bent over, a hand on each knee
    this.strike(STANCE, STANCE);
    this.caption.setText(POSES[STANCE].name);
    this.say('HOLD to breathe in... LET GO at the top!');
  }

  /** Out it comes: a proper PAH if the lungs were full, or something less. */
  private exhale(): void {
    // over his head, not over his face: going purple is the good bit
    const at = { x: this.billX + POSES[this.worn].head[0] + 50, y: Math.max(92, this.bill.y + POSES[this.worn].head[1] - 190) };
    this.holding = false;
    if (this.air > 1 + TOO_LONG / INHALE) {
      sound.cough();
      this.host.word('cough', at.x, at.y);
    } else if (this.air >= ZONE) {
      this.points++;
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
    this.caption.setText(POSES[this.target].name);
    // Mom lets hers go with ours, then holds it too
    applyArt(this.momHead, 'mom_pah');
    this.lungs.setVisible(false);
    this.breath.setVisible(false);
  }

  /** Put the two of them into a pose each. */
  private strike(mom: string, bill: string): void {
    this.momPose = mom;
    this.billPose = bill;
    applyArt(this.mom, `pose_mom_${mom}`);
    applyArt(this.bill, `pose_bill_${bill}`);
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
    const mp = POSES[this.momPose], ms = MOM_SIZE;
    const momIn = this.phase === 'breathe' ? this.momAir : 0;
    const momHold = this.phase === 'hold' ? 1 : 0;
    this.mom.setScale(k * ms * (1 + 0.07 * momIn - 0.1 * momHold), k * ms);
    this.momHead.setScale(k * ms)
      .setPosition(this.mom.x + mp.head[0] * ms, this.mom.y + (mp.head[1] + 30) * ms - momIn * 4)
      .setRotation(mp.tilt - momIn * 0.12 + (momHold ? Math.sin(this.t * 38) * 0.04 : 0));
    this.band.y = TV_AT.y + TV.screen.y + ((this.t * 46) % (TV.screen.h - 16)) + 8;
    this.clock.setVisible(Math.floor(this.t * 2) % 2 === 0);

    // Bill, on the carpet
    const bp = POSES[this.billPose];
    const full = Math.min(this.air, 1.2), held = this.phase === 'hold' ? 1 : 0;
    const strain = held || this.air > 1 ? Math.sin(this.t * 40) * 2.2 : 0;
    this.bill.setScale(k * (1 + 0.13 * full - 0.12 * held), k);
    this.billHead.setPosition(this.billX + bp.head[0] + strain, this.bill.y + bp.head[1] - full * 6)
      .setRotation(bp.tilt - full * 0.14);
    const face = held || this.air > 1 ? 'bill-glare' : this.phase === 'picked' && this.worn === this.target ? 'bill-grin' : 'bill-sideeye';
    if (this.billHead.texture.key !== face) this.billHead.setTexture(face);
    // he goes redder the longer he holds it
    const red = held ? 1 : Math.max(0, this.air - 0.85) * 2.2;
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
