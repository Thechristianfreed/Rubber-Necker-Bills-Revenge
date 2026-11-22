import Phaser from 'phaser';
import { DEPTH, LANE, TEX } from '../config';
import { ART, applyArt, img } from '../art/sticker';

/** A rubbernecker's neck and head.
 *
 *  While gawking it is a posed goose-neck curve hanging out of a car window.
 *  Once whacked it becomes a rope simulation whose length balloons out, so the
 *  head rockets away and the neck noodles around behind the car. */

export type NeckKind = 'gawker' | 'phone' | 'dog';

const N = 14;            // simulated points along the neck
const SUB = 4;           // extra smoothing points per segment when drawing
const STEP = 1 / 120;    // physics step
const HEAD_R = 21;       // neck base -> centre of head

interface Pt { x: number; y: number; vx: number; vy: number }

export class NoodleNeck {
  readonly kind: NeckKind;
  state: 'gawk' | 'noodle' = 'gawk';
  /** Centre of the head, for hit tests. */
  headX = 0;
  headY = 0;
  whacked = false;
  /** Set once an un-whacked head has gone past Bill. */
  passed = false;

  private scene: Phaser.Scene;
  private pts: Pt[] = [];
  private rope: Phaser.GameObjects.Rope;
  private shadow: Phaser.GameObjects.Rope;
  private head: Phaser.GameObjects.Image;
  private lump?: Phaser.GameObjects.Image;
  private headKey: string;
  private dazedKey: string;
  private phase = Math.random() * Math.PI * 2;
  private lean: number;
  private t = 0;
  private acc = 0;
  private restLen = 0;
  private targetLen = 0;
  private floorY = LANE.headY + 34 + Math.random() * 16;
  private stars: Phaser.GameObjects.Image[] = [];
  private shake = 0;

  constructor(scene: Phaser.Scene, kind: NeckKind, style: number) {
    this.scene = scene;
    this.kind = kind;
    const dog = kind === 'dog';
    this.headKey = dog ? 'dog' : `head${style}`;
    this.dazedKey = dog ? 'dog_mad' : `head${style}_dazed`;
    this.lean = dog ? 6 : -12 - Math.random() * 10;
    for (let i = 0; i < N; i++) this.pts.push({ x: 0, y: 0, vx: 0, vy: 0 });
    const count = (N - 1) * SUB + 1;
    const line = () => Array.from({ length: count }, (_, i) => new Phaser.Math.Vector2(i * 4, 0));
    // the neck is a strip of paper, so like every cutout it casts a shadow on the page
    this.shadow = scene.add.rope(2.4, 3.6, 'neck_shadow', undefined, line());
    this.shadow.setScale(1 / TEX).setDepth(DEPTH.necks - 1);
    const neckKey = dog ? 'neck_dog' : `neck${style}`;
    this.rope = scene.add.rope(0, 0, scene.textures.exists(neckKey) ? neckKey : 'neck0', undefined, line());
    this.rope.setScale(1 / TEX).setDepth(DEPTH.necks);
    this.head = img(scene, 0, 0, this.headKey).setDepth(DEPTH.heads);
  }

  /** Follow the car window at (ax, ay); `carVx` is the car's screen velocity. */
  update(dt: number, ax: number, ay: number, carVx: number): void {
    this.t += dt;
    if (this.state === 'gawk') {
      this.pose(ax, ay);
    } else {
      this.acc = Math.min(this.acc + dt, 0.05);
      while (this.acc >= STEP) {
        this.simulate(STEP, ax, ay, carVx);
        this.acc -= STEP;
      }
    }
    this.draw();
  }

  /** The goose-neck gawking pose: out of the window, down, and up into the head. */
  private pose(ax: number, ay: number): void {
    const sway = Math.sin(this.t * 2.1 + this.phase) * 5;
    const bob = Math.sin(this.t * 3.3 + this.phase * 1.7) * 3;
    const dog = this.kind === 'dog';
    const bx = ax + this.lean + sway + (this.shake > 0 ? Math.sin(this.t * 70) * 5 : 0);
    const by = LANE.headY + (dog ? 14 : HEAD_R) + bob;
    const c1x = ax + 8, c1y = ay + (by - ay) * 0.75;
    const c2x = bx + (dog ? 2 : 13), c2y = by + (dog ? 8 : 26);
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1), u = 1 - t;
      const p = this.pts[i];
      p.x = u * u * u * ax + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * bx;
      p.y = u * u * u * ay + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * by;
    }
    if (this.shake > 0) this.shake -= 1 / 60;
  }

  /** Send the head flying. `power` ~1 for a good hit, more for perfect/rage. */
  whack(power: number, carVx: number): void {
    if (this.whacked) return;
    this.whacked = true;
    if (this.kind === 'dog') {
      // Dogs are innocent: no noodle, just one offended pooch.
      applyArt(this.head, this.dazedKey);
      this.shake = 0.5;
      return;
    }
    this.state = 'noodle';
    this.t = 0;
    this.acc = 0;
    let len = 0;
    for (let i = 1; i < N; i++) len += Math.hypot(this.pts[i].x - this.pts[i - 1].x, this.pts[i].y - this.pts[i - 1].y);
    this.restLen = len;
    this.targetLen = len * (3.7 + power * 1.6 + Math.random() * 1.1);
    const ivx = (560 + Math.random() * 200) * (0.75 + power * 0.3);
    const ivy = -(430 + Math.random() * 180) * (0.75 + power * 0.3);
    for (let i = 0; i < N; i++) {
      const k = (i / (N - 1)) ** 2;
      this.pts[i].vx = carVx + ivx * k;
      this.pts[i].vy = ivy * k;
    }
    applyArt(this.head, this.dazedKey);
    this.head.setDepth(DEPTH.fx + 2);
    this.rope.setDepth(DEPTH.fx + 1);
    this.shadow.setDepth(DEPTH.fx);
    this.lump = img(this.scene, 0, 0, 'lump').setDepth(DEPTH.fx + 3).setScale(0);
    for (let i = 0; i < 3; i++) {
      this.stars.push(img(this.scene, 0, 0, 'star').setDepth(DEPTH.fx + 3).setScale(0.36));
    }
  }

  private simulate(dt: number, ax: number, ay: number, carVx: number): void {
    const p = this.pts;
    this.restLen += (this.targetLen - this.restLen) * (1 - Math.exp(-dt * 9));
    const seg = this.restLen / (N - 1);
    const wiggle = 2400 * Math.exp(-this.t * 0.9);
    const damp = Math.exp(-dt * 0.9);
    const ox: number[] = [], oy: number[] = [];
    for (let i = 0; i < N; i++) { ox.push(p[i].x); oy.push(p[i].y); }

    p[0].x = ax; p[0].y = ay; p[0].vx = carVx; p[0].vy = 0;
    for (let i = 1; i < N; i++) {
      const isHead = i === N - 1;
      p[i].vy += (isHead ? 1050 : 520) * dt;
      if (!isHead) {
        // a travelling wave pushed sideways along the neck: the "noodle"
        const tx = p[i + 1].x - p[i - 1].x, ty = p[i + 1].y - p[i - 1].y;
        const tl = Math.hypot(tx, ty) || 1;
        const w = Math.sin(this.t * 17 - i * 0.95 + this.phase) * wiggle * dt;
        p[i].vx += (-ty / tl) * w;
        p[i].vy += (tx / tl) * w;
      }
      p[i].vx *= damp;
      p[i].vy *= damp;
      p[i].x += p[i].vx * dt;
      p[i].y += p[i].vy * dt;
    }

    for (let it = 0; it < 6; it++) {
      // rubber: segments resist stretching past their (growing) rest length
      for (let i = 0; i < N - 1; i++) {
        const a = p[i], b = p[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        if (d <= seg) continue;
        const wa = i === 0 ? 0 : 1;
        const wb = i + 1 === N - 1 ? 0.35 : 1;
        const k = (d - seg) / d / (wa + wb);
        a.x += dx * k * wa; a.y += dy * k * wa;
        b.x -= dx * k * wb; b.y -= dy * k * wb;
      }
      // a little springiness so it bends in curves instead of folding flat
      for (let i = 0; i < N - 2; i++) {
        const a = p[i], b = p[i + 2];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const min = seg * 1.45;
        if (d >= min) continue;
        const k = ((min - d) / d) * 0.12;
        if (i !== 0) { a.x -= dx * k; a.y -= dy * k; }
        b.x += dx * k; b.y += dy * k;
      }
    }

    for (let i = 1; i < N; i++) {
      const isHead = i === N - 1;
      p[i].vx = (p[i].x - ox[i]) / dt;
      p[i].vy = (p[i].y - oy[i]) / dt;
      const floor = isHead ? this.floorY - HEAD_R * 0.4 : this.floorY;
      if (p[i].y > floor) {
        p[i].y = floor;
        if (p[i].vy > 0) p[i].vy *= isHead ? -0.58 : -0.25;
        p[i].vx *= 0.985;
      }
      if (p[i].y < 26) {
        p[i].y = 26;
        if (p[i].vy < 0) p[i].vy *= -0.5;
      }
    }
  }

  private draw(): void {
    const p = this.pts;
    const rp = this.rope.points as Phaser.Math.Vector2[];
    const sp = this.shadow.points as Phaser.Math.Vector2[];
    let k = 0;
    for (let i = 0; i < N - 1; i++) {
      const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(N - 1, i + 2)];
      for (let j = 0; j < SUB; j++) {
        const t = j / SUB, t2 = t * t, t3 = t2 * t;
        const x = 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
        const y = 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
        sp[k].set(x * TEX, y * TEX);
        rp[k++].set(x * TEX, y * TEX);
      }
    }
    const end = p[N - 1], prev = p[N - 3];
    sp[k].set(end.x * TEX, end.y * TEX);
    rp[k].set(end.x * TEX, end.y * TEX);
    this.rope.setDirty();
    this.shadow.setDirty();

    let rot: number;
    if (this.kind === 'dog') {
      rot = Math.sin(this.t * 9 + this.phase) * 0.08;
    } else {
      rot = Math.atan2(end.y - prev.y, end.x - prev.x) + Math.PI / 2;
      if (this.state === 'gawk') rot = Phaser.Math.Clamp(rot, -0.5, 0.5);
    }
    this.head.setPosition(end.x, end.y).setRotation(rot);
    const a = ART[this.head.texture.key];
    const up = this.kind === 'dog' ? a.ay - a.h / 2 : HEAD_R;
    this.headX = end.x + Math.sin(rot) * up + (this.kind === 'dog' ? -10 : 0);
    this.headY = end.y - Math.cos(rot) * up;

    if (this.lump) {
      // the lump swells out of the top of the head with a springy overshoot, then throbs
      const top = a.ay - a.h * 0.07;
      const k = Math.min(1, this.t / 0.32) - 1;
      const grow = 1 + 2.6 * k * k * k + 1.6 * k * k;
      const size = (a.h * 0.5) / ART.lump.w;
      this.lump
        .setPosition(end.x + Math.sin(rot) * top, end.y - Math.cos(rot) * top)
        .setRotation(rot)
        .setScale((size * grow * (1 + Math.sin(this.t * 13) * 0.05)) / TEX);
    }

    if (this.stars.length) {
      const life = 1.9;
      for (let i = 0; i < this.stars.length; i++) {
        const ang = this.t * 9 + (i * Math.PI * 2) / 3;
        this.stars[i]
          .setPosition(this.headX + Math.cos(ang) * 24, this.headY - 26 + Math.sin(ang) * 7)
          .setAlpha(Phaser.Math.Clamp((life - this.t) * 2, 0, 1));
      }
      if (this.t > life) {
        this.stars.forEach((s) => s.destroy());
        this.stars = [];
      }
    }
  }

  /** True once a whacked head has been dragged off the left of the screen. */
  get gone(): boolean {
    return this.pts[N - 1].x < -90;
  }

  destroy(): void {
    this.rope.destroy();
    this.shadow.destroy();
    this.head.destroy();
    this.lump?.destroy();
    this.stars.forEach((s) => s.destroy());
  }
}
