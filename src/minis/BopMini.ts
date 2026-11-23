import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { DOLL, ROOM } from '../art/sleepover';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { label } from '../ui/text';
import { Mini } from './Mini';

type Image = Phaser.GameObjects.Image;

/** The sleepover again, but this time it is about restraint: bop DJ exactly
 *  as many times as asked. One too many and it is over; too few when the
 *  clock runs out is no good either. */
export class BopMini extends Mini {
  private readonly want = 4 + Math.floor(Math.random() * 5);
  readonly title = 'THE SLEEPOVER';
  readonly prompt = `BOP DJ EXACTLY ${this.want} TIMES!`;
  readonly seconds = 6.5;

  private count = 0;
  private sinceLast = 0;
  private botT = 0.4;
  private done = false;
  private dj!: Image;
  private arm!: Image;
  private armAt = { x: 0, y: 0 };
  private tally!: Phaser.GameObjects.Text;

  build(): void {
    const s = this.scene, cx = view.W * 0.5;
    const band = (key: string, y: number) => s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, ART[key].h * TEX, key)
      .setOrigin(0, 0).setScale(1 / TEX).setDepth(1);
    band('rec_wall', -BLEED);
    band('rec_floor', ROOM.floorY);
    void H;
    img(s, cx + 30, 150, 'rec_window').setDepth(2);
    img(s, cx, ROOM.couchY, 'rec_couch').setDepth(10);
    this.dj = img(s, cx, ROOM.djY, 'dj_asleep').setDepth(11);
    const neil = img(s, cx + ROOM.neil[0], ROOM.neil[1], 'kid_neil').setDepth(12);
    this.armAt = { x: neil.x + DOLL.shoulder[0], y: neil.y + DOLL.shoulder[1] };
    this.arm = img(s, this.armAt.x, this.armAt.y, 'neil_arm').setDepth(13);
    this.tally = label(s, cx + 150, 190, `0 / ${this.want}`, 76, '#f6c430').setDepth(20);
  }

  update(dt: number): void {
    this.sinceLast += dt;
    // the right number, and a moment of holding back: that will do
    if (!this.done && this.count === this.want && this.sinceLast > 0.9) this.end(true);
  }

  press(): void {
    if (this.done) return;
    this.count++;
    this.sinceLast = 0;
    sound.bonk(false);
    this.tally.setText(`${this.count} / ${this.want}`);
    this.tally.setScale(1.25);
    const tw = this.scene.tweens;
    tw.add({ targets: this.tally, scale: 1, duration: 110 });
    tw.killTweensOf(this.arm);
    this.arm.setPosition(this.armAt.x, this.armAt.y).setRotation(0);
    tw.add({ targets: this.arm, y: this.armAt.y + 32, rotation: 0.2, duration: 45, yoyo: true });
    tw.killTweensOf(this.dj);
    this.dj.setScale(1 / TEX, 0.92 / TEX);
    tw.add({ targets: this.dj, scaleY: 1 / TEX, duration: 110 });
    if (this.count > this.want) {
      this.tally.setColor('#cc302a');
      this.host.word('toomany', this.tally.x, this.tally.y + 70);
      this.end(false);
    }
  }

  private end(won: boolean): void {
    this.done = true;
    this.scene.time.delayedCall(250, () => this.host.finish(won));
  }

  timeUp(): boolean {
    return this.count === this.want;
  }

  bot(dt: number): void {
    this.botT -= dt;
    if (this.botT > 0) return;
    this.botT = 0.17;
    // the careless one does not know when to stop
    if (this.count < this.want || this.host.auto === 'clumsy') this.press();
  }
}
