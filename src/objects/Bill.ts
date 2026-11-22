import Phaser from 'phaser';
import { BILL, DEPTH, HEAD_SRC_H, LANE, SWING, TEX } from '../config';
import { ART, applyArt, img } from '../art/sticker';

/** Bill: his photo head on a photographed body, sitting up out of the far
 *  window of his avocado Bug with a baseball bat.
 *
 *  The body is three stop-motion frames (rest, wind-up, swing) rather than a
 *  jointed puppet, so his arm and grip are always a real photograph. Every
 *  frame hangs from the same point, the chin, and so does his head. */

export type Face = 'sideeye' | 'grin' | 'glare';
type Pose = 'rest' | 'windup' | 'swing';

const HEAD_H = 104;
/** How much of Bill's head overlaps the neck of the body underneath. */
const NECK_OVERLAP = 9;
/** How long the swing frame is held after the bat has gone through. */
const HOLD = 0.1;

/** Fine placement of the head on each frame's neck, and how each frame leans. */
const POSES: Record<Pose, { dx: number; dy: number; tilt: number; headTilt: number }> = {
  rest: { dx: 1, dy: 0, tilt: 0, headTilt: 0 },
  windup: { dx: -1, dy: 0, tilt: -0.05, headTilt: -0.05 },
  swing: { dx: 3, dy: 1, tilt: 0.05, headTilt: 0.06 },
};

export class Bill {
  x: number;
  /** 0 = sitting up out of the window, 1 = fully ducked into the car. */
  duck = 0;
  wantDuck = false;
  stun = 0;
  /** Extra wind-up for the Road Rage special (0..1). */
  rageCharge = 0;
  invulnerable = false;

  private car: Phaser.GameObjects.Image;
  private body?: Phaser.GameObjects.Image;
  private head: Phaser.GameObjects.Image;
  private pose: Pose = 'rest';
  private face: Face = 'sideeye';
  private faceT = 0;
  private swingT = -1;
  private lock = 0;
  private connected = false;
  private t = 0;
  /** Counts down after a frame change, for a small pop. */
  private snap = 0;
  private stars: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number) {
    this.x = x;
    if (scene.textures.exists('bill_rest')) this.body = img(scene, x, 0, 'bill_rest').setDepth(DEPTH.billBack);
    this.head = scene.add.image(x, 0, 'bill-sideeye').setDepth(DEPTH.billBack + 2);
    this.car = img(scene, x, LANE.billBase, 'bug').setDepth(DEPTH.billCar);
    for (let i = 0; i < 3; i++) {
      this.stars.push(img(scene, 0, 0, 'star').setDepth(DEPTH.billCar + 1).setScale(0.36).setVisible(false));
    }
    this.setFace('sideeye');
    this.update(0);
  }

  get sweetX(): number {
    return this.x + BILL.sweetDX;
  }

  /** Can a sign smack him right now? */
  get exposed(): boolean {
    return this.duck < 0.5 && !this.invulnerable;
  }

  get canSwing(): boolean {
    return this.swingT < 0 && this.lock <= 0 && this.stun <= 0 && this.duck < 0.35 && this.rageCharge === 0;
  }

  /** The bat is in the strike zone on this frame. */
  get swingLive(): boolean {
    return this.swingT >= SWING.windup && this.swingT < SWING.windup + SWING.active;
  }

  startSwing(): boolean {
    if (!this.canSwing) return false;
    this.swingT = 0;
    this.connected = false;
    return true;
  }

  markConnected(): void {
    this.connected = true;
  }

  setFace(face: Face, seconds = 0): void {
    this.face = face;
    this.faceT = seconds;
    this.head.setTexture(`bill-${face}`);
    this.head.setScale(HEAD_H / HEAD_SRC_H);
  }

  hurt(): void {
    this.stun = 0.75;
    this.swingT = -1;
    this.setFace('glare', 1.3);
  }

  /** Returns 'whiff' on the frame a swing ends without hitting anything. */
  update(dt: number): 'whiff' | null {
    this.t += dt;
    let result: 'whiff' | null = null;

    this.duck = Phaser.Math.Clamp(this.duck + (this.wantDuck ? 1 : -1) * dt * 11, 0, 1);
    if (this.lock > 0) this.lock -= dt;
    if (this.stun > 0) this.stun -= dt;
    if (this.faceT > 0) {
      this.faceT -= dt;
      if (this.faceT <= 0) this.setFace('sideeye');
    }
    if (this.wantDuck && this.face !== 'glare') this.setFace('glare', 0.2);

    // which frame of the swing are we on?
    let pose: Pose = 'rest';
    if (this.rageCharge > 0) {
      pose = 'windup';
    } else if (this.swingT >= 0) {
      this.swingT += dt;
      const s = this.swingT;
      const end = SWING.windup + SWING.active;
      pose = s < SWING.windup ? 'windup' : s < end + HOLD ? 'swing' : 'rest';
      if (s >= end + (this.connected ? SWING.recoverHit : SWING.recoverMiss)) {
        this.swingT = -1;
        if (!this.connected) result = 'whiff';
      }
    }
    if (pose !== this.pose) {
      this.pose = pose;
      this.snap = 0.07;
      if (this.body) applyArt(this.body, `bill_${pose}`);
    }
    if (this.snap > 0) this.snap -= dt;

    const p = POSES[pose];
    const bounce = Math.sin(this.t * 21) * 0.9;
    const shake = this.stun > 0 ? Math.sin(this.t * 55) * 4 : this.rageCharge > 0 ? Math.sin(this.t * 60) * 2 : 0;
    // ducking drops him down behind the car, as if he pulled himself back inside
    const chinX = this.x - 6 + shake;
    const chinY = BILL.chinY + bounce + this.duck * BILL.duckDepth;
    const tilt = p.tilt - (this.rageCharge > 0 ? 0.1 * this.rageCharge : 0);
    const pop = this.snap > 0 ? 1 + (this.snap / 0.07) * 0.05 : 1;

    this.car.setPosition(this.x, LANE.billBase + bounce);
    if (this.body) {
      this.body.setPosition(chinX, chinY).setRotation(tilt);
      this.body.setScale(Math.abs(this.body.scaleX), Math.abs(this.body.scaleX) * pop);
      // the car hides him from the door down, however far he has ducked
      const a = ART[`bill_${pose}`];
      this.body.setCrop(0, 0, this.body.frame.width, Math.max(0, (a.pad + a.ay + BILL.hideY - chinY) * TEX));
    }
    this.head
      .setPosition(chinX + p.dx, chinY + p.dy - HEAD_H / 2 + NECK_OVERLAP + Math.sin(this.t * 7) * 1.1)
      .setRotation(p.headTilt + (this.stun > 0 ? Math.sin(this.t * 40) * 0.12 : 0));

    const showStars = this.stun > 0;
    for (let i = 0; i < this.stars.length; i++) {
      const a = this.t * 9 + (i * Math.PI * 2) / 3;
      this.stars[i].setVisible(showStars).setPosition(this.head.x + Math.cos(a) * 40, this.head.y - 52 + Math.sin(a) * 8);
    }
    return result;
  }

  get headTop(): { x: number; y: number } {
    return { x: this.head.x, y: this.head.y - HEAD_H / 2 };
  }

  setX(x: number): void {
    this.x = x;
  }
}
