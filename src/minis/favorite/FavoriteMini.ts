import Phaser from 'phaser';
import { H, MAX_W, view } from '../../config';
import { img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { label } from '../../ui/text';
import { Mini, Point } from '../Mini';

/** THE FAVORITE. (Say here what the game is and the story behind it.)
 *
 *  As it stands it is a placeholder, to be replaced: tap the star three times
 *  before the clock runs out. It shows the shape of a quick game: `build` puts
 *  everything on the page, `press` is a finger down, `update` runs once a frame,
 *  `timeUp` says whether running out of time is a win, and `bot` plays it for the
 *  tests. See docs/minigames.md. */
export class FavoriteMini extends Mini {
  readonly title = 'THE FAVORITE';
  readonly prompt = 'TAP THE STAR!';
  readonly seconds = 8;

  private star!: Phaser.GameObjects.Image;
  private count!: Phaser.GameObjects.Text;
  private taps = 0;
  private botIn = 0.7;

  build(): void {
    const s = this.scene, cx = view.W / 2;
    s.add.rectangle(cx, H / 2, MAX_W * 2, H * 2, 0x2f6f8f);
    this.star = img(s, cx, 270, 'favorite_star');
    this.count = label(s, cx, 430, '0 OF 3', 40, '#f6c430');
  }

  press(at: Point): void {
    if (Math.hypot(at.x - this.star.x, at.y - this.star.y) < 100) this.tap();
  }

  private tap(): void {
    this.taps++;
    this.count.setText(`${Math.min(this.taps, 3)} OF 3`);
    sound.tock();
    this.scene.tweens.add({ targets: this.star, rotation: this.star.rotation + 1.2, duration: 160, ease: 'Back.out' });
    if (this.taps === 3) this.host.finish(true);
  }

  timeUp(): boolean {
    return false;
  }

  bot(dt: number): void {
    this.botIn -= dt;
    if (this.botIn > 0) return;
    // (the careless one is too slow to get three in)
    this.botIn = this.host.auto === 'clumsy' ? 4.5 : 0.7;
    this.tap();
  }
}
