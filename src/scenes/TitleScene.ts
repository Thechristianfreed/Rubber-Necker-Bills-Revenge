import Phaser from 'phaser';
import { H, HEAD_SRC_H, MAX_W, TEX, view } from '../config';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { written } from '../ui/text';
import { cutText, fillPaper, makePaperArt, tapePath } from '../art/paper';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    const W = view.W;
    this.cameras.main.setZoom(view.RES).centerOn(W / 2, H / 2);
    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', onResize));

    // the postcard fills the page, with a strip of road along the bottom
    const g = this.add.graphics();
    g.fillStyle(0x7fb0d8, 1);
    g.fillRect(0, 0, MAX_W, H);
    if (this.textures.exists('postcard')) {
      const k = (H - 70) / ART.postcard.h;
      this.add.tileSprite(0, 0, (MAX_W / k) * TEX, ART.postcard.h * TEX, 'postcard').setOrigin(0, 0).setScale(k / TEX);
    }
    const band = (key: string, y: number, h: number) => this.add.tileSprite(0, y, MAX_W * TEX, h * TEX, key).setOrigin(0, 0).setScale(1 / TEX);
    if (this.textures.exists('asphalt')) band('asphalt', H - 92, 92);
    else this.add.rectangle(0, H - 92, MAX_W, 92, 0x5d5b66).setOrigin(0, 0);
    band('line_white', H - 96, ART.line_white.h);
    band('line_yellow', H - 50, ART.line_yellow.h);

    // Bill in front of a paper burst, bat on his shoulder: the same body frame
    // the game uses at rest, blown up, with his waist running off the page
    const bx = W * 0.25;
    const chinY = H - 184;
    const rays = img(this, bx, H - 262, 'burst');
    rays.setScale(rays.scale * 3.6);
    this.tweens.add({ targets: rays, rotation: Math.PI * 2, duration: 60000, repeat: -1 });
    if (this.textures.exists('bill_rest')) {
      const body = img(this, bx, chinY, 'bill_rest');
      body.setScale(body.scale * 2.2);
    }
    const head = this.add.image(bx + 2, chinY - 95, 'bill-sideeye').setRotation(-0.04);
    head.setScale(230 / HEAD_SRC_H);
    this.tweens.add({ targets: head, y: head.y - 4, rotation: 0.01, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // the title: yellow letters glued on a red paper banner
    const tx = W * 0.66;
    makePaperArt(this, 'title_card', 440, 232, (c) => {
      tapePath(c, 0, 0, 440, 232);
      fillPaper(c, 'red');
      cutText(c, 'RUBBER', 220, 66, 116, 'yellow');
      cutText(c, 'NECKER', 220, 166, 116, 'yellow');
    }, { border: 3.5 });
    makePaperArt(this, 'title_sub', 290, 50, (c) => {
      tapePath(c, 0, 0, 290, 50);
      fillPaper(c, 'blue');
      cutText(c, "BILL'S REVENGE", 145, 27, 38, 'white');
    }, { border: 2.5 });
    img(this, tx, 138, 'title_card').setRotation(-0.045);
    img(this, tx + 40, 268, 'title_sub').setRotation(-0.02);

    // notes written on strips of tape
    const note = (y: number, text: string, size: number, tapeKey: string, stretch: number, tilt: number) => {
      const t = written(this, 0, 0, text, size);
      const tape = img(this, 0, 0, tapeKey);
      tape.setScale(tape.scale * Math.max(0.4, (t.width + 30) / ART[tapeKey].w), tape.scale * stretch);
      return this.add.container(tx, y, [tape, t]).setRotation(tilt);
    };
    const go = note(350, 'TAP TO PLAY', 30, 'tape_m', 1.5, 0.015);
    this.tweens.add({ targets: go, scale: 1.08, duration: 460, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    note(424, 'TAP = swing        HOLD DUCK = dodge signs', 17, 'tape_l', 0.8, -0.01);
    note(462, "Fill the RAGE meter.  Don't hit the dog.", 17, 'tape_l', 0.8, 0.008);
    written(this, W - 12, H - 14, 'prototype 0.3', 13, '#fbf6ea').setOrigin(1, 0.5).setAlpha(0.8);

    const start = () => {
      sound.unlock();
      // On phones, go fullscreen and lock sideways where the browser allows it.
      if (this.sys.game.device.input.touch && this.scale.fullscreen.available && !this.scale.isFullscreen) {
        try {
          this.scale.startFullscreen();
          const o = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
          void o?.lock?.('landscape')?.catch(() => undefined);
        } catch { /* not allowed here (e.g. inside an embedded frame): play windowed */ }
      }
      this.scene.start('levels');
    };
    this.input.once('pointerdown', start);
    this.input.keyboard?.once('keydown-SPACE', start);
  }
}
