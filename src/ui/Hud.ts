import Phaser from 'phaser';
import { BILL, DEPTH, H, SCORE, TEX, view } from '../config';
import { ART, applyArt, img } from '../art/sticker';
import { INK_MARKER } from '../art/paper';
import { written } from './text';

const BAR_W = 300;
const BTN_R = 74;

/** Everything on top of the action, all cut from paper: hearts, the cash
 *  price tag, the jam meter, the combo, and the DUCK / RAGE buttons. */
export class Hud {
  private scene: Phaser.Scene;
  private hearts: Phaser.GameObjects.Image[] = [];
  private tag: Phaser.GameObjects.Image;
  private cash: Phaser.GameObjects.Text;
  private jamTape: Phaser.GameObjects.Image;
  private jamLabel: Phaser.GameObjects.Text;
  private meter: Phaser.GameObjects.Image;
  private green: Phaser.GameObjects.TileSprite;
  private red: Phaser.GameObjects.TileSprite;
  private marks: Phaser.GameObjects.Image[] = [];
  private comboTape: Phaser.GameObjects.Image;
  private combo: Phaser.GameObjects.Text;
  private duckBtn: Phaser.GameObjects.Image;
  private rageBtn: Phaser.GameObjects.Image;
  private rageRing: Phaser.GameObjects.Graphics;
  private mute: Phaser.GameObjects.Image;
  private rageReady = false;
  private ragePulse?: Phaser.Tweens.Tween;
  private jam = { done: 0, missed: 0, total: 1 };
  private rageFrac = 0;
  private meterLabel: string;
  private buttons: boolean;

  /** `meterLabel` is what this level calls its progress bar. A level that is
   *  all tapping can do without the DUCK and RAGE buttons. */
  constructor(scene: Phaser.Scene, meterLabel: string, buttons = true) {
    this.scene = scene;
    this.meterLabel = meterLabel;
    this.buttons = buttons;
    const d = DEPTH.hud;
    for (let i = 0; i < BILL.maxHearts; i++) this.hearts.push(img(scene, 0, 0, 'heart').setDepth(d));
    this.tag = img(scene, 0, 0, 'tag').setDepth(d).setRotation(-0.04);
    this.cash = written(scene, 0, 0, '$0', 21, '#2f6b2b').setOrigin(0, 0.5).setDepth(d + 1).setRotation(-0.04);

    this.jamTape = img(scene, 0, 0, 'tape_m').setDepth(d).setRotation(-0.025);
    this.jamLabel = written(scene, 0, 0, `${meterLabel}  0/0`, 15).setDepth(d + 1).setRotation(-0.025);
    this.meter = img(scene, 0, 0, 'meter').setDepth(d);
    const strip = (key: string) => scene.add.tileSprite(0, 0, 4, ART[key].h * TEX, key).setOrigin(0, 0.5).setScale(1 / TEX).setDepth(d + 1);
    this.green = strip('meter_green');
    this.red = strip('meter_red').setOrigin(1, 0.5);
    for (let i = 0; i < SCORE.passStars.length; i++) {
      const s = img(scene, 0, 0, 'star').setDepth(d + 2);
      this.marks.push(s.setScale(s.scale * 0.62));
    }

    this.comboTape = img(scene, 0, 0, 'tape_m').setDepth(d).setVisible(false).setRotation(0.02);
    this.combo = written(scene, 0, 0, '', 22, '#b8372a').setDepth(d + 1).setVisible(false).setRotation(0.02);
    this.duckBtn = img(scene, 0, 0, 'btn_duck').setDepth(d);
    this.rageRing = scene.add.graphics().setDepth(d);
    this.rageBtn = img(scene, 0, 0, 'btn_rage_off').setDepth(d);
    this.mute = img(scene, 0, 0, 'snd_on').setDepth(d);
    for (const o of [this.duckBtn, this.rageBtn, this.rageRing]) o.setVisible(buttons);
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
    this.tag.setPosition(10, 66);
    this.cash.setPosition(32, 66);
    this.jamTape.setPosition(W / 2, 17);
    this.jamLabel.setPosition(W / 2, 17);
    this.meter.setPosition(W / 2, 46);
    this.comboTape.setPosition(W / 2, 92);
    this.combo.setPosition(W / 2, 92);
    this.duckBtn.setPosition(this.duckPos.x, this.duckPos.y);
    this.rageBtn.setPosition(this.ragePos.x, this.ragePos.y);
    this.mute.setPosition(W - 28, 28);
    this.marks.forEach((s, i) => s.setPosition(W / 2 - BAR_W / 2 + BAR_W * SCORE.passStars[i], 62));
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
    this.jamLabel.setText(`${this.meterLabel}  ${done}/${total}`);
    this.drawBar();
  }

  /** Lay the green (cleared) and red (missed) paper strips into the trough. */
  private drawBar(): void {
    const { done, missed, total } = this.jam;
    const x = view.W / 2 - BAR_W / 2, y = 46;
    this.green.setPosition(x, y).setVisible(done > 0);
    this.green.width = Math.max(1, BAR_W * Math.min(1, done / total)) * TEX;
    this.red.setPosition(x + BAR_W, y).setVisible(missed > 0);
    this.red.width = Math.max(1, (BAR_W * missed) / total) * TEX;
  }

  setCombo(n: number, mult: number): void {
    const show = n >= 2;
    this.combo.setVisible(show);
    this.comboTape.setVisible(show);
    if (!show) return;
    this.combo.setText(mult > 1 ? `${n} COMBO   x${mult}` : `${n} COMBO`);
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

  /** The rage meter: a ring of red paper filling in around the button. */
  private drawRing(): void {
    const g = this.rageRing;
    const { x, y } = this.ragePos;
    g.clear();
    g.lineStyle(12, 0x18100a, 0.28);
    g.beginPath();
    g.arc(x + 2, y + 3, 68, 0, Math.PI * 2);
    g.strokePath();
    g.lineStyle(11, 0xf9f4e4, 1);
    g.beginPath();
    g.arc(x, y, 68, 0, Math.PI * 2);
    g.strokePath();
    if (this.rageFrac > 0.01) {
      g.lineStyle(7, this.rageFrac >= 1 ? 0xf6c430 : 0xcc302a, 1);
      g.beginPath();
      g.arc(x, y, 68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.rageFrac);
      g.strokePath();
    }
  }

  setDuckPressed(down: boolean): void {
    this.duckBtn.setTint(down ? 0xb9c6e0 : 0xffffff);
    this.duckBtn.setScale(down ? 0.46 : 0.5);
  }

  setMuted(m: boolean): void {
    applyArt(this.mute, m ? 'snd_off' : 'snd_on');
  }

  overDuck(x: number, y: number): boolean {
    // generous: the whole bottom-left corner counts
    return this.buttons && (Math.hypot(x - this.duckPos.x, y - this.duckPos.y) < BTN_R + 26 || (x < 190 && y > H - 190));
  }

  overRage(x: number, y: number): boolean {
    return this.buttons && Math.hypot(x - this.ragePos.x, y - this.ragePos.y) < BTN_R + 6;
  }

  overMute(x: number, y: number): boolean {
    return Math.hypot(x - (view.W - 28), y - 28) < 30;
  }
}

export { INK_MARKER };
