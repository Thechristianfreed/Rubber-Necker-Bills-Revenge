import Phaser from 'phaser';
import { DEPTH, LANE, SPEED } from '../config';
import { img } from '../art/sticker';
import { HEAD_STYLES, VEHICLES, VehicleSpec } from '../art/textures';
import { NeckKind, NoodleNeck } from './NoodleNeck';

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

  constructor(scene: Phaser.Scene, kind: VehicleKind, x: number) {
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
      const rider: Rider = { neck: new NoodleNeck(scene, neckKind, style), slot };
      if (kind === 'phone') {
        rider.arm = img(scene, 0, 0, `armphone${style % 5}`).setDepth(DEPTH.necks + 1).setRotation(2.3);
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
      if (r.arm) r.arm.setPosition(ax - 4, ay + 2).setRotation(2.3 + Math.sin(this.t * 4) * 0.06);
    }
  }

  /** Knock the phone out of a filmer's hand (returns where it was). */
  dropPhone(rider: Rider): { x: number; y: number } | null {
    if (!rider.arm) return null;
    const pos = { x: rider.arm.x - 30, y: rider.arm.y + 34 };
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
