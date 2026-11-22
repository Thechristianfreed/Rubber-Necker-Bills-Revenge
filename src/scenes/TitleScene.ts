import Phaser from 'phaser';
import { H, HEAD_SRC_H, MAX_W, TEX, view } from '../config';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { label } from '../ui/text';

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
    const road = this.add.graphics();
    road.fillStyle(0xfbf6ea, 1); road.fillRect(0, H - 96, MAX_W, 4);
    road.fillStyle(0x5d5b66, 1); road.fillRect(0, H - 92, MAX_W, 92);
    road.fillStyle(0xf3c53a, 1); road.fillRect(0, H - 50, MAX_W, 5);

    // Bill, large, giving the side-eye, in front of a paper burst
    const bx = W * 0.25;
    const rays = img(this, bx, H - 250, 'burst');
    rays.setScale(rays.scale * 3.4);
    this.tweens.add({ targets: rays, rotation: Math.PI * 2, duration: 60000, repeat: -1 });
    const arm = img(this, bx + 82, H - 112, 'bill_arm').setRotation(0.34);
    arm.setScale(arm.scale * 2.2);
    const torso = img(this, bx, H - 6, 'bill_torso');
    torso.setScale(torso.scale * 2.5);
    const head = this.add.image(bx - 4, H - 268, 'bill-sideeye').setRotation(-0.06);
    head.setScale(230 / HEAD_SRC_H);
    this.tweens.add({ targets: head, y: head.y - 6, rotation: 0.02, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: arm, rotation: 0.24, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const tx = W * 0.66;
    const l1 = label(this, tx, 118, 'RUBBER', 132, '#ffd23f', 18).setRotation(-0.05);
    const l2 = label(this, tx + 14, 226, 'NECKER', 132, '#ffd23f', 18).setRotation(-0.05);
    const tag = label(this, tx + 6, 312, "BILL'S REVENGE", 44, '#ffffff', 9).setRotation(-0.05);
    for (const t of [l1, l2, tag]) t.setShadow(5, 6, '#231d1b', 0, true, true);

    const go = label(this, tx, 400, 'TAP TO PLAY', 46, '#ffffff', 9);
    this.tweens.add({ targets: go, scale: 1.1, duration: 460, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    label(this, tx, 462, 'TAP = swing     HOLD DUCK = dodge signs', 22, '#fffaf0', 5);
    label(this, tx, 492, "Fill the RAGE meter.  Don't hit the dog.", 22, '#fffaf0', 5);
    label(this, W - 10, H - 12, 'prototype 0.1', 15, '#fffaf0', 3).setOrigin(1, 0.5).setAlpha(0.7);

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
      this.scene.start('game');
    };
    this.input.once('pointerdown', start);
    this.input.keyboard?.once('keydown-SPACE', start);
  }
}
