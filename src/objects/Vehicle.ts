import Phaser from 'phaser';
import { DEPTH, LANE, SPEED, STREET } from '../config';
import { img } from '../art/sticker';
import { ARM_TINTS, HEAD_STYLES, VEHICLES, VehicleSpec } from '../art/textures';
import { Motion, NeckKind, NoodleNeck, STILL } from './NoodleNeck';

export type VehicleKind = 'car' | 'phone' | 'bus' | 'dog' | 'mailbox' | 'mailbox2' | 'mailman';

interface Rider {
  neck: NoodleNeck;
  slot: { x: number; y: number };
  arm?: Phaser.GameObjects.Image;
}

/** Things that stand at the kerb instead of driving. They have no vehicle of
 *  their own: just whatever is planted at each slot. */
const ROADSIDE: Partial<Record<VehicleKind, { w: number; xs: number[]; neck: NeckKind }>> = {
  mailbox: { w: 46, xs: [0], neck: 'post' },
  mailbox2: { w: 98, xs: [-26, 26], neck: 'post' },
  mailman: { w: 60, xs: [0], neck: 'bystander' },
};

let nextStyle = Math.floor(Math.random() * HEAD_STYLES);

/** One thing coming at Bill with something to whack (or not) on it: a vehicle
 *  crawling through the jam with heads hanging out, or mailboxes at the kerb. */
export class Vehicle {
  x: number;
  readonly kind: VehicleKind;
  readonly spec: VehicleSpec;
  readonly riders: Rider[] = [];
  /** Screen velocity (px/s, negative = leftwards). */
  readonly vx: number;
  private sprite?: Phaser.GameObjects.Image;
  private baseY: number;
  private t = Math.random() * 10;

  /** `speed` is how fast the world is sliding past Bill. */
  constructor(scene: Phaser.Scene, kind: VehicleKind, x: number, speed: number, motion: Motion = STILL) {
    this.kind = kind;
    this.x = x;
    const roadside = ROADSIDE[kind];
    if (roadside) {
      // standing still in the world, so it only moves as fast as the scenery
      this.vx = -speed;
      this.baseY = STREET.kerbY;
      this.spec = { key: '', w: roadside.w, h: 0, slots: roadside.xs.map((sx) => ({ x: sx, y: 0 })) };
      for (const slot of this.spec.slots) {
        const style = Math.floor(Math.random() * 2);
        this.riders.push({ neck: new NoodleNeck(scene, roadside.neck, style), slot });
      }
    } else {
      this.vx = -(speed + SPEED.crawl);
      this.baseY = LANE.farBase;
      const pool = kind === 'bus' ? VEHICLES.bus
        : kind === 'dog' ? VEHICLES.wagon
          : [...VEHICLES.sedan, ...VEHICLES.sedan, ...VEHICLES.van, ...VEHICLES.pickup];
      this.spec = pool[Math.floor(Math.random() * pool.length)];
      this.sprite = img(scene, x, this.baseY, this.spec.key).setDepth(DEPTH.farCars);
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
    }
    this.update(0);
  }

  get halfWidth(): number {
    return this.spec.w / 2;
  }

  update(dt: number): void {
    this.t += dt;
    this.x += this.vx * dt;
    // engines idle with a little judder; mailboxes do not
    const y = this.baseY + (this.sprite ? Math.sin(this.t * 19) * 0.7 : 0);
    this.sprite?.setPosition(this.x, y);
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

  /** Fully off-screen, including anything noodling along behind. */
  get gone(): boolean {
    if (this.x + this.halfWidth > -40) return false;
    return this.riders.every((r) => r.neck.state === 'gawk' || r.neck.gone) || this.x < -1400;
  }

  destroy(): void {
    this.sprite?.destroy();
    for (const r of this.riders) {
      r.neck.destroy();
      r.arm?.destroy();
    }
  }
}
