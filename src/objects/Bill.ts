import Phaser from 'phaser';
import { BILL, DEPTH, LANE, SWING } from '../config';
import { img } from '../art/sticker';

/** Bill: a photo-cutout head on a drawn aloha-shirt body, hanging out of the
 *  far side of his avocado Bug with a baseball bat. */

export type Face = 'sideeye' | 'grin' | 'glare';

const HEAD_H = 112;

const REST = 0.16;
const COCKED = -0.95;
const THROUGH = 1.6;

export class Bill {
  x: number;
  /** 0 = leaning out, 1 = fully ducked into the car. */
  duck = 0;
  wantDuck = false;
  stun = 0;
  /** Extra wind-up for the Road Rage special (0..1). */
  rageCharge = 0;
  invulnerable = false;

  private car: Phaser.GameObjects.Image;
  private torso: Phaser.GameObjects.Image;
  private head: Phaser.GameObjects.Image;
  private arm: Phaser.GameObjects.Image;
  private face: Face = 'sideeye';
  private faceT = 0;
  private swingT = -1;
  private lock = 0;
  private connected = false;
  private t = 0;
  private stars: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number) {
    this.x = x;
    this.torso = img(scene, x, 0, 'bill_torso').setDepth(DEPTH.billBack);
    // the arm sits behind the head so the bat never covers Bill's face
    this.arm = img(scene, x, 0, 'bill_arm').setDepth(DEPTH.billBack + 1);
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
    this.head.setScale(HEAD_H / this.head.frame.height);
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

    let angle = REST + Math.sin(this.t * 5) * 0.04;
    if (this.swingT >= 0) {
      this.swingT += dt;
      const s = this.swingT;
      const end = SWING.windup + SWING.active;
      if (s < SWING.windup) {
        angle = Phaser.Math.Linear(REST, COCKED, s / SWING.windup);
      } else if (s < end) {
        const k = (s - SWING.windup) / SWING.active;
        angle = Phaser.Math.Linear(COCKED, THROUGH, 1 - (1 - k) * (1 - k));
      } else {
        const recover = this.connected ? SWING.recoverHit : SWING.recoverMiss;
        const k = Math.min(1, (s - end) / recover);
        angle = Phaser.Math.Linear(THROUGH, REST, k * k * (3 - 2 * k));
        if (k >= 1) {
          this.swingT = -1;
          if (!this.connected) result = 'whiff';
        }
      }
    }
    if (this.rageCharge > 0) angle = COCKED - 0.75 * this.rageCharge + Math.sin(this.t * 60) * 0.05;

    const bounce = Math.sin(this.t * 21) * 0.9;
    const carY = LANE.billBase + bounce;
    const stunShake = this.stun > 0 ? Math.sin(this.t * 55) * 4 : 0;
    const lean = this.swingT >= 0 ? Math.sin(Math.min(1, this.swingT / 0.2) * Math.PI) * 7 : 0;
    const bx = this.x - 6 + stunShake;
    const by = carY - 76;
    // ducking squashes him down behind the roof, bat pulled in flat
    const drop = this.duck * BILL.duckDepth;
    if (this.duck > 0) angle = Phaser.Math.Linear(angle, 1.72, this.duck);

    this.car.setPosition(this.x, carY);
    this.torso.setPosition(bx + lean * 0.4, by).setRotation(lean * 0.012);
    this.torso.scaleY = this.torso.scaleX * (1 - this.duck * 0.8);
    this.head.setPosition(bx - 4 + lean, by - 102 + drop + Math.sin(this.t * 7) * 1.2).setRotation(lean * 0.02 + (this.stun > 0 ? Math.sin(this.t * 40) * 0.12 : 0));
    this.arm.setPosition(bx + 31 + lean * 0.5, by - 54 + drop * 0.85).setRotation(angle);

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
