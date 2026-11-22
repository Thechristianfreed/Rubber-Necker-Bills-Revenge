import Phaser from 'phaser';
import { BILL, DEPTH, H, SCORE, view } from '../config';
import { applyArt, img } from '../art/sticker';
import { label } from './text';

const BAR_W = 300;
const BAR_H = 20;
const BTN_R = 74;

/** Everything drawn on top of the action: hearts, cash, the jam meter, combo,
 *  and the DUCK / RAGE touch buttons. */
export class Hud {
  private scene: Phaser.Scene;
  private hearts: Phaser.GameObjects.Image[] = [];
  private cash: Phaser.GameObjects.Text;
  private jamLabel: Phaser.GameObjects.Text;
  private jamCount: Phaser.GameObjects.Text;
  private bar: Phaser.GameObjects.Graphics;
  private combo: Phaser.GameObjects.Text;
  private duckBtn: Phaser.GameObjects.Image;
  private rageBtn: Phaser.GameObjects.Image;
  private rageRing: Phaser.GameObjects.Graphics;
  private mute: Phaser.GameObjects.Image;
  private rageReady = false;
  private ragePulse?: Phaser.Tweens.Tween;
  private jam = { done: 0, missed: 0, total: 1 };
  private rageFrac = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    for (let i = 0; i < BILL.maxHearts; i++) this.hearts.push(img(scene, 0, 0, 'heart').setDepth(DEPTH.hud));
    this.cash = label(scene, 0, 0, '$0', 26, '#b8f28a').setOrigin(0, 0.5).setDepth(DEPTH.hud);
    this.jamLabel = label(scene, 0, 0, 'JAM CLEARED', 19).setDepth(DEPTH.hud);
    this.jamCount = label(scene, 0, 0, '0/0', 19, '#ffe45c').setOrigin(1, 0.5).setDepth(DEPTH.hud);
    this.bar = scene.add.graphics().setDepth(DEPTH.hud);
    this.combo = label(scene, 0, 0, '', 34, '#ffe45c').setDepth(DEPTH.hud).setVisible(false);
    this.duckBtn = img(scene, 0, 0, 'btn_duck').setDepth(DEPTH.hud).setAlpha(0.9);
    this.rageRing = scene.add.graphics().setDepth(DEPTH.hud);
    this.rageBtn = img(scene, 0, 0, 'btn_rage_off').setDepth(DEPTH.hud).setAlpha(0.9);
    this.mute = img(scene, 0, 0, 'snd_on').setDepth(DEPTH.hud).setAlpha(0.85);
    this.layout();
  }

  get duckPos(): { x: number; y: number } {
    return { x: 84, y: H - 84 };
  }

  get ragePos(): { x: number; y: number } {
    return { x: view.W - 84, y: H - 84 };
  }

  layout(): void {
    const W = view.W;
    this.hearts.forEach((h, i) => h.setPosition(30 + i * 34, 28));
    this.cash.setPosition(16, 62);
    this.jamLabel.setPosition(W / 2 - 60, 20);
    this.jamCount.setPosition(W / 2 + BAR_W / 2, 20);
    this.combo.setPosition(W / 2, 92);
    this.duckBtn.setPosition(this.duckPos.x, this.duckPos.y);
    this.rageBtn.setPosition(this.ragePos.x, this.ragePos.y);
    this.mute.setPosition(W - 30, 28);
    this.drawBar();
    this.drawRing();
  }

  setHearts(n: number): void {
    this.hearts.forEach((h, i) => applyArt(h, i < n ? 'heart' : 'heart_off'));
  }

  loseHeartFx(n: number): void {
    const h = this.hearts[n];
    if (!h) return;
    this.scene.tweens.add({ targets: h, scale: h.scale * 1.7, duration: 110, yoyo: true });
  }

  setCash(n: number): void {
    this.cash.setText(`$${n}`);
  }

  setJam(done: number, missed: number, total: number): void {
    this.jam = { done, missed, total };
    this.jamCount.setText(`${done}/${total}`);
    this.drawBar();
  }

  private drawBar(): void {
    const g = this.bar;
    const x = view.W / 2 - BAR_W / 2, y = 34;
    const { done, missed, total } = this.jam;
    g.clear();
    g.fillStyle(0x231d1b, 1);
    g.fillRoundedRect(x - 4, y - 4, BAR_W + 8, BAR_H + 8, 9);
    g.fillStyle(0x4a4550, 1);
    g.fillRoundedRect(x, y, BAR_W, BAR_H, 6);
    const dw = (BAR_W * done) / total, mw = (BAR_W * missed) / total;
    if (dw > 2) {
      g.fillStyle(0x7ed957, 1);
      g.fillRoundedRect(x, y, Math.max(12, dw), BAR_H, 6);
    }
    if (mw > 2) {
      g.fillStyle(0xe2463f, 1);
      g.fillRoundedRect(x + BAR_W - Math.max(12, mw), y, Math.max(12, mw), BAR_H, 6);
    }
    // star thresholds
    for (const s of SCORE.passStars) {
      const sx = x + BAR_W * s;
      g.fillStyle(0x231d1b, 1);
      g.fillRect(sx - 1.5, y - 2, 3, BAR_H + 4);
      g.fillStyle(0xffd23f, 1);
      g.fillTriangle(sx - 6, y + BAR_H + 4, sx + 6, y + BAR_H + 4, sx, y + BAR_H - 3);
    }
  }

  setCombo(n: number, mult: number): void {
    if (n < 2) {
      this.combo.setVisible(false);
      return;
    }
    this.combo.setVisible(true).setText(mult > 1 ? `${n} COMBO  x${mult}` : `${n} COMBO`);
    this.combo.setScale(1.3);
    this.scene.tweens.add({ targets: this.combo, scale: 1, duration: 140, ease: 'Back.out' });
  }

  setRage(frac: number): void {
    this.rageFrac = Phaser.Math.Clamp(frac, 0, 1);
    const ready = this.rageFrac >= 1;
    if (ready !== this.rageReady) {
      this.rageReady = ready;
      applyArt(this.rageBtn, ready ? 'btn_rage' : 'btn_rage_off');
      this.ragePulse?.stop();
      this.rageBtn.setScale(0.5);
      if (ready) {
        this.ragePulse = this.scene.tweens.add({
          targets: this.rageBtn, scale: 0.57, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.inOut',
        });
      }
    }
    this.drawRing();
  }

  private drawRing(): void {
    const g = this.rageRing;
    const { x, y } = this.ragePos;
    g.clear();
    g.lineStyle(11, 0x231d1b, 0.9);
    g.beginPath();
    g.arc(x, y, 68, 0, Math.PI * 2);
    g.strokePath();
    if (this.rageFrac > 0.01) {
      g.lineStyle(7, this.rageFrac >= 1 ? 0xffd23f : 0xff7a45, 1);
      g.beginPath();
      g.arc(x, y, 68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.rageFrac);
      g.strokePath();
    }
  }

  setDuckPressed(down: boolean): void {
    this.duckBtn.setTint(down ? 0x9fb8e8 : 0xffffff);
    this.duckBtn.setScale(down ? 0.46 : 0.5);
  }

  setMuted(m: boolean): void {
    applyArt(this.mute, m ? 'snd_off' : 'snd_on');
  }

  overDuck(x: number, y: number): boolean {
    // generous: the whole bottom-left corner counts
    return Math.hypot(x - this.duckPos.x, y - this.duckPos.y) < BTN_R + 26 || (x < 190 && y > H - 190);
  }

  overRage(x: number, y: number): boolean {
    return Math.hypot(x - this.ragePos.x, y - this.ragePos.y) < BTN_R + 6;
  }

  overMute(x: number, y: number): boolean {
    return Math.hypot(x - (view.W - 30), y - 28) < 30;
  }
}
