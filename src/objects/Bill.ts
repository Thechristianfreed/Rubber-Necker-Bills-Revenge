import Phaser from 'phaser';
import { DEPTH, HEAD_SRC_H, LANE, STREET, SWING, TEX } from '../config';
import { ART, applyArt, img } from '../art/sticker';
import type { Theme } from '../data/levels';

/** Bill: his photo head on a photographed body.
 *
 *  The body is a handful of stop-motion frames (rest, wind-up, swing, and
 *  sometimes a duck) rather than a jointed puppet, so his arms and grip are
 *  always a real photograph. Every frame is pinned at the same point, and his
 *  head goes on the frame's neck. */

export type Face = 'sideeye' | 'grin' | 'glare';
type Pose = 'rest' | 'windup' | 'swing';
type XY = [number, number];

/** How long the swing frame is held after the swing has gone through. */
const HOLD = 0.1;

/** How each frame leans, and how his head tips with it. */
const POSES: Record<Pose, { tilt: number; headTilt: number }> = {
  rest: { tilt: 0, headTilt: 0 },
  windup: { tilt: -0.05, headTilt: -0.05 },
  swing: { tilt: 0.05, headTilt: 0.06 },
};

/** How Bill is put together in a level. */
export interface BillRig {
  /** Texture keys of the body frames, and an optional frame for ducking. */
  frames: Record<Pose, string>;
  duckFrame?: string;
  /** Where every frame is pinned: offset from Bill's x, and height. */
  at: XY;
  /** Where his chin is in each frame, relative to that pin. */
  chin: Record<Pose, XY> & { duck?: XY };
  /** How tall his head is drawn. */
  headH: number;
  /** How much the body rocks from frame to frame (0 for a bike, which should not wheelie). */
  lean: number;
  /** How far his head bows in the duck frame, in radians. */
  duckHeadTilt: number;
  /** A vehicle drawn in front of him, hiding everything below `hideY`. */
  ride?: { key: string; baseY: number };
  hideY?: number;
  /** How far he drops when he ducks, if there is no duck frame. */
  duckDepth: number;
  /** Where the swing (or the throw) should find its target, relative to Bill's x. */
  sweetDX: number;
  /** Where a thrown paper leaves his hand, relative to the pin. */
  hand: XY;
  /** Where the dust kicks up, relative to Bill's x, and its height. */
  dust: XY;
}

export const RIGS: Record<Theme, BillRig> = {
  // sitting up out of the far window of the Bug, baseball bat in hand
  highway: {
    frames: { rest: 'bill_rest', windup: 'bill_windup', swing: 'bill_swing' },
    at: [-6, 308],
    chin: { rest: [0, 0], windup: [0, 0], swing: [0, 0] },
    headH: 104,
    lean: 1,
    duckHeadTilt: 0,
    ride: { key: 'bug', baseY: LANE.billBase },
    hideY: 478,
    duckDepth: 165,
    sweetDX: 96,
    hand: [70, -10],
    dust: [-112, LANE.billBase - 6],
  },
  // a kid on his Stingray with a rolled-up newspaper: the frames include the
  // bike, so they are pinned on the road under it (chins from make_cutouts.py, halved)
  street: {
    frames: { rest: 'kid_rest', windup: 'kid_windup', swing: 'kid_swing' },
    duckFrame: 'kid_duck',
    at: [0, STREET.bikeBase],
    chin: { rest: [-35, -214], windup: [-35, -214], swing: [-35, -214], duck: [19, -181] },
    headH: 84,
    lean: 0,
    duckHeadTilt: 0.5,
    duckDepth: 0,
    sweetDX: 230,
    hand: [74, -216],
    dust: [-128, STREET.bikeBase - 4],
  },
};

export class Bill {
  x: number;
  /** 0 = sitting up, 1 = fully ducked. */
  duck = 0;
  wantDuck = false;
  stun = 0;
  /** Extra wind-up for the Road Rage special (0..1). */
  rageCharge = 0;
  invulnerable = false;
  /** Goes up by one every time he starts a swing. */
  swingId = 0;

  private rig: BillRig;
  private car?: Phaser.GameObjects.Image;
  private body?: Phaser.GameObjects.Image;
  private head: Phaser.GameObjects.Image;
  /** Which frame of the swing he is on. */
  pose: Pose = 'rest';
  private frameKey: string;
  private face: Face = 'sideeye';
  private faceT = 0;
  private swingT = -1;
  private lock = 0;
  private connected = false;
  private t = 0;
  /** Counts down after a frame change, for a small pop. */
  private snap = 0;
  private stars: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, rig: BillRig) {
    this.x = x;
    this.rig = rig;
    this.frameKey = rig.frames.rest;
    if (scene.textures.exists(this.frameKey)) this.body = img(scene, x, 0, this.frameKey).setDepth(DEPTH.billBack);
    this.head = scene.add.image(x, 0, 'bill-sideeye').setDepth(DEPTH.billBack + 2);
    if (rig.ride) this.car = img(scene, x, rig.ride.baseY, rig.ride.key).setDepth(DEPTH.billCar);
    for (let i = 0; i < 3; i++) {
      this.stars.push(img(scene, 0, 0, 'star').setDepth(DEPTH.billCar + 1).setScale(0.36).setVisible(false));
    }
    this.setFace('sideeye');
    this.update(0);
  }

  get sweetX(): number {
    return this.x + this.rig.sweetDX;
  }

  /** Can a sign or a branch smack him right now? */
  get exposed(): boolean {
    return this.duck < 0.5 && !this.invulnerable;
  }

  get canSwing(): boolean {
    return this.swingT < 0 && this.lock <= 0 && this.stun <= 0 && this.duck < 0.35 && this.rageCharge === 0;
  }

  /** The bat is in the strike zone (or the paper is leaving his hand) on this frame. */
  get swingLive(): boolean {
    return this.swingT >= SWING.windup && this.swingT < SWING.windup + SWING.active;
  }

  startSwing(): boolean {
    if (!this.canSwing) return false;
    this.swingT = 0;
    this.swingId++;
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
    this.head.setScale(this.rig.headH / HEAD_SRC_H);
  }

  hurt(): void {
    this.stun = 0.75;
    this.swingT = -1;
    this.setFace('glare', 1.3);
  }

  /** Returns 'whiff' on the frame a swing ends without hitting anything. */
  update(dt: number): 'whiff' | null {
    this.t += dt;
    const rig = this.rig;
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
    this.pose = pose;
    // a duck frame, if this rig has one, takes over while he is down
    const ducked = rig.duckFrame !== undefined && this.duck > 0.5;
    const key = ducked ? rig.duckFrame! : rig.frames[pose];
    if (key !== this.frameKey) {
      this.frameKey = key;
      this.snap = 0.07;
      if (this.body) applyArt(this.body, key);
    }
    if (this.snap > 0) this.snap -= dt;

    const p = POSES[pose];
    const bounce = Math.sin(this.t * 21) * 0.9;
    const shake = this.stun > 0 ? Math.sin(this.t * 55) * 4 : this.rageCharge > 0 ? Math.sin(this.t * 60) * 2 : 0;
    // without a duck frame, ducking drops him down behind his ride
    const pinX = this.x + rig.at[0] + shake;
    const pinY = rig.at[1] + bounce + this.duck * rig.duckDepth;
    const tilt = (p.tilt - (this.rageCharge > 0 ? 0.1 * this.rageCharge : 0)) * rig.lean;
    const pop = this.snap > 0 ? 1 + (this.snap / 0.07) * 0.04 : 1;

    this.car?.setPosition(this.x, rig.ride!.baseY + bounce);
    if (this.body) {
      this.body.setPosition(pinX, pinY).setRotation(tilt);
      this.body.setScale(Math.abs(this.body.scaleX), Math.abs(this.body.scaleX) * pop);
      if (rig.hideY !== undefined) {
        // his ride hides him from the door down, however far he has ducked
        const a = ART[key];
        this.body.setCrop(0, 0, this.body.frame.width, Math.max(0, (a.pad + a.ay + rig.hideY - pinY) * TEX));
      }
    }

    // his head sits on the frame's neck, tipped the way the frame calls for
    const chin = (ducked ? rig.chin.duck : undefined) ?? rig.chin[pose];
    const headTilt = (ducked ? rig.duckHeadTilt : p.headTilt) + (this.stun > 0 ? Math.sin(this.t * 40) * 0.12 : 0);
    const reach = rig.headH * 0.415;
    this.head
      .setPosition(
        pinX + chin[0] + Math.sin(headTilt) * reach,
        pinY + chin[1] - Math.cos(headTilt) * reach + Math.sin(this.t * 7) * 1.1,
      )
      .setRotation(headTilt);

    const showStars = this.stun > 0;
    for (let i = 0; i < this.stars.length; i++) {
      const a = this.t * 9 + (i * Math.PI * 2) / 3;
      this.stars[i].setVisible(showStars)
        .setPosition(this.head.x + Math.cos(a) * rig.headH * 0.4, this.head.y - rig.headH / 2 + Math.sin(a) * 8);
    }
    return result;
  }

  get headTop(): { x: number; y: number } {
    return { x: this.head.x, y: this.head.y - this.rig.headH / 2 };
  }

  /** Where a thrown paper leaves his hand. */
  get handAt(): { x: number; y: number } {
    return { x: this.x + this.rig.at[0] + this.rig.hand[0], y: this.rig.at[1] + this.rig.hand[1] };
  }

  /** Where the dust kicks up behind his wheels. */
  get dustAt(): { x: number; y: number } {
    return { x: this.x + this.rig.dust[0], y: this.rig.dust[1] };
  }

  setX(x: number): void {
    this.x = x;
  }
}
