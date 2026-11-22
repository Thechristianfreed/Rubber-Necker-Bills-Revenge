import Phaser from 'phaser';
import { DEPTH, LANE, SPEED } from '../config';
import { img } from '../art/sticker';
import { ARM_TINTS, HEAD_STYLES, VEHICLES, VehicleSpec } from '../art/textures';
import { Motion, NeckKind, NoodleNeck, STILL } from './NoodleNeck';

export type VehicleKind = 'car' | 'phone' | 'bus' | 'dog';

interface Rider {
  neck: NoodleNeck;
  slot: { x: number; y: number };
  arm?: Phaser.GameObjects.Image;
}

let nextStyle = Math.floor(Math.random() * HEAD_STYLES);

/** One vehicle crawling through the jam with heads hanging out of it. */
export class Vehicle {
  x: number;
  readonly kind: VehicleKind;
  readonly spec: VehicleSpec;
  readonly riders: Rider[] = [];
  /** Screen velocity (px/s, negative = leftwards). */
  readonly vx: number;
  private sprite: Phaser.GameObjects.Image;
  private scene: Phaser.Scene;
  private t = Math.random() * 10;

  constructor(scene: Phaser.Scene, kind: VehicleKind, x: number, motion: Motion = STILL) {
    this.scene = scene;
    this.kind = kind;
    this.x = x;
    this.vx = -(SPEED.world + SPEED.crawl);
    const pool = kind === 'bus' ? VEHICLES.bus
      : kind === 'dog' ? VEHICLES.wagon
        : [...VEHICLES.sedan, ...VEHICLES.sedan, ...VEHICLES.van, ...VEHICLES.pickup];
    this.spec = pool[Math.floor(Math.random() * pool.length)];
    this.sprite = img(scene, x, LANE.farBase, this.spec.key).setDepth(DEPTH.farCars);
    for (const slot of this.spec.slots) {
      const neckKind: NeckKind = kind === 'dog' ? 'dog' : kind === 'phone' ? 'phone' : 'gawker';
      const style = nextStyle++ % HEAD_STYLES;
      const rider: Rider = { neck: new NoodleNeck(scene, neckKind, style, motion), slot };
      if (kind === 'phone' && scene.textures.exists('armphone')) {
        // a hand holding a phone up in front of their face; it sits behind the
        // head so the wrist disappears behind their jaw
        rider.arm = img(scene, 0, 0, 'armphone').setDepth(DEPTH.heads - 1).setTint(ARM_TINTS[style] ?? 0xffffff);
      }
      this.riders.push(rider);
    }
    this.update(0);
  }

  get halfWidth(): number {
    return this.spec.w / 2;
  }

  update(dt: number): void {
    this.t += dt;
    this.x += this.vx * dt;
    const y = LANE.farBase + Math.sin(this.t * 19) * 0.7;
    this.sprite.setPosition(this.x, y);
    for (const r of this.riders) {
      const ax = this.x + r.slot.x, ay = y + r.slot.y;
      r.neck.update(dt, ax, ay, this.vx);
      // the phone hand goes wherever the head goes
      if (r.arm) r.arm.setPosition(r.neck.headX + 6, r.neck.headY + 15).setRotation(-0.08 + Math.sin(this.t * 4) * 0.05);
    }
  }

  /** Knock the phone out of a filmer's hand (returns where it was). */
  dropPhone(rider: Rider): { x: number; y: number } | null {
    if (!rider.arm) return null;
    const pos = { x: rider.arm.x - 46, y: rider.arm.y - 27 };
    rider.arm.destroy();
    rider.arm = undefined;
    return pos;
  }

  /** Fully off-screen, including any noodle necks trailing behind. */
  get gone(): boolean {
    if (this.x + this.halfWidth > -40) return false;
    return this.riders.every((r) => r.neck.state === 'gawk' || r.neck.gone) || this.x < -1400;
  }

  destroy(): void {
    this.sprite.destroy();
    for (const r of this.riders) {
      r.neck.destroy();
      r.arm?.destroy();
    }
    void this.scene;
  }
}
