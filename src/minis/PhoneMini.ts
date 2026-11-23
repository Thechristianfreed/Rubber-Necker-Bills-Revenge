import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { ART, applyArt, img } from '../art/sticker';
import { HEAD_STYLES, VEHICLES } from '../art/textures';
import { sound } from '../audio/sound';
import { Mini, Point } from './Mini';

type Image = Phaser.GameObjects.Image;

/** How many phone filmers have to be caught, and how many mistakes end it. */
const NEED = 3;
const STRIKES = 2;
/** Everything is drawn this much bigger than on the highway, to be easy to tap. */
const BIG = 1.55;
/** Where the road starts, under the postcard, as on the highway. */
const ROAD_TOP = 206;
/** A phone is held up this far to the left of the face holding it. */
const PHONE_DX = 58;

interface Window {
  x: number;
  y: number;
  head: Image;
  phone: Image;
  up: boolean;
  filming: boolean;
  caught: boolean;
  /** Seconds until this window changes (someone pops up, or ducks back down). */
  t: number;
  /** How long they have been up, for the bot. */
  shown: number;
}

/** A tour bus full of rubberneckers bobbing up at the windows. Some of them
 *  are filming. Tap the ones with a phone, and nobody else. */
export class PhoneMini extends Mini {
  readonly title = 'THE TOUR BUS';
  readonly prompt = 'TAP WHOEVER IS ON THE PHONE!';
  readonly seconds = 12;

  private windows: Window[] = [];
  private caught = 0;
  private strikes = 0;
  private done = false;

  build(): void {
    const s = this.scene, W = view.W;
    const sky = s.add.graphics().setDepth(0);
    sky.fillStyle(0x7fb0d8, 1);
    sky.fillRect(-BLEED, -BLEED, MAX_W + BLEED * 2, H + BLEED * 2);
    const strip = (key: string, y: number, h: number) => {
      if (!s.textures.exists(key)) return;
      const d = ART[key].tex ?? TEX;
      s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * d, h * d, key).setOrigin(0, 0).setScale(1 / d).setDepth(1);
    };
    // the highway again: the postcard across the top, and road from its bottom edge down
    strip('postcard', -10, ART.postcard?.h ?? 0);
    strip('asphalt', ROAD_TOP, H - ROAD_TOP + BLEED);
    const edge = s.add.graphics().setDepth(2);
    edge.fillStyle(0xfbf6ea, 1);
    edge.fillRect(-BLEED, ROAD_TOP - 3, MAX_W + BLEED * 2, 3.5);

    const spec = VEHICLES.bus[0];
    const busX = W / 2, busY = 470;
    const bus = img(s, busX, busY, spec.key).setDepth(10);
    bus.setScale(bus.scale * BIG);
    // one head to a window, spread evenly along the row of them so no two are on top of each other;
    // each stands a little in front of the one to its left, so nobody's phone is hidden behind a neighbour
    const n = spec.slots.length;
    const first = spec.slots[0], last = spec.slots[n - 1];
    spec.slots.forEach((slot, i) => {
      const along = n > 1 ? first.x + ((last.x - first.x) * i) / (n - 1) : slot.x;
      const x = busX + along * BIG, y = busY + slot.y * BIG + 16;
      const phone = img(s, x, y, 'armphone').setDepth(11 + i * 2).setVisible(false);
      const head = img(s, x, y, 'head0').setDepth(12 + i * 2).setVisible(false);
      this.windows.push({ x, y, head, phone, up: false, filming: false, caught: false, t: 0.2 + Math.random() * 0.9, shown: 0 });
    });
  }

  /** Somebody bobs up at a window, or ducks back down. */
  private flip(w: Window): void {
    w.up = !w.up;
    w.caught = false;
    w.shown = 0;
    if (!w.up) {
      w.head.setVisible(false);
      w.phone.setVisible(false);
      w.t = 0.25 + Math.random() * 0.6;
      return;
    }
    // about half of them are filming, and never nobody for long
    const others = this.windows.filter((o) => o !== w && o.up && o.filming).length;
    w.filming = others === 0 ? Math.random() < 0.7 : Math.random() < 0.35;
    applyArt(w.head, `head${Math.floor(Math.random() * HEAD_STYLES)}`);
    w.head.setVisible(true).setPosition(w.x, w.y);
    w.head.setScale(w.head.scale * BIG, 0.2 * w.head.scale * BIG);
    this.scene.tweens.add({ targets: w.head, scaleY: (BIG / TEX), duration: 120, ease: 'Back.out' });
    // (the last one's phone may still be on its way over the horizon)
    this.scene.tweens.killTweensOf(w.phone);
    w.phone.setVisible(w.filming).setPosition(w.x + 9, w.y + 4).setScale(BIG / TEX).setRotation(-0.08).setAlpha(1);
    w.t = 1.05 + Math.random() * 0.5;
  }

  update(dt: number): void {
    if (this.done) return;
    for (const w of this.windows) {
      w.t -= dt;
      w.shown += dt;
      if (w.t <= 0) this.flip(w);
    }
  }

  press(at: Point): void {
    if (this.done) return;
    // whoever is nearest the finger; a filmer's phone counts as part of them
    const reach = (o: Window) => (o.filming ? Math.min(Math.abs(at.x - o.x), Math.abs(at.x - (o.x - PHONE_DX))) : Math.abs(at.x - o.x));
    const w = this.windows
      .filter((o) => o.up && !o.caught && reach(o) < 50 && at.y > o.y - 125 && at.y < o.y + 34)
      .sort((a, b) => reach(a) - reach(b))[0];
    if (!w) return;
    w.caught = true;
    if (!w.filming) {
      // an innocent gawker: that is not who we are after
      this.strikes++;
      sound.ouch();
      this.host.word('badbill', w.x, w.y - 110);
      this.scene.cameras.main.shake(140, 0.006);
      if (this.strikes >= STRIKES) this.end(false);
      return;
    }
    this.caught++;
    sound.bonk(true);
    const style = w.head.texture.key;
    if (this.scene.textures.exists(`${style}_dazed`)) {
      applyArt(w.head, `${style}_dazed`);
      w.head.setScale(BIG / TEX);
    }
    this.host.word('bonk', w.x, w.y - 110);
    // the phone goes flying
    this.scene.tweens.add({ targets: w.phone, x: w.x + 140, y: w.y - 180, rotation: 9, alpha: 0, duration: 500 });
    w.t = 0.5;
    if (this.caught >= NEED) {
      sound.say(Math.random() < 0.5 ? 'damn_phone' : 'addicted', 0.15);
      this.end(true);
    }
  }

  private end(won: boolean): void {
    this.done = true;
    this.scene.time.delayedCall(won ? 500 : 250, () => this.host.finish(won));
  }

  timeUp(): boolean {
    return this.caught >= NEED;
  }

  bot(): void {
    const good = this.host.auto === 'good';
    for (const w of this.windows) {
      if (w.up && !w.caught && w.shown > 0.3 && (good ? w.filming : true)) {
        this.press({ x: w.x, y: w.y - 40 });
        return;
      }
    }
  }
}
