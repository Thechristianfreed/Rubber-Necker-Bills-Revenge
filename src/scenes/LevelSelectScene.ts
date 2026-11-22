import Phaser from 'phaser';
import { H, INK, MAX_W, TEX, view } from '../config';
import { ART, Ctx, img } from '../art/sticker';
import { cutText, fillPaper, glued, makePaperArt, tapePath, textWidth } from '../art/paper';
import { sound } from '../audio/sound';
import { LEVELS, LevelDef } from '../data/levels';
import { loadStars } from '../data/progress';
import { MARKER, written } from '../ui/text';

const CARD_W = 300;
const CARD_H = 320;

/** Pick a level: each one is a snapshot stuck in the scrapbook, with the best
 *  star rating earned so far underneath. */
export class LevelSelectScene extends Phaser.Scene {
  private cards: { x: number; y: number; level: LevelDef }[] = [];

  constructor() {
    super('levels');
  }

  create(): void {
    const W = view.W;
    this.cards = [];
    this.cameras.main.setZoom(view.RES).centerOn(W / 2, H / 2);
    const onResize = () => this.scene.restart();
    this.scale.on('resize', onResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', onResize));

    // the same page as the title: postcard above, a strip of road below
    const g = this.add.graphics();
    g.fillStyle(0x7fb0d8, 1);
    g.fillRect(0, 0, MAX_W, H);
    if (this.textures.exists('postcard')) {
      const k = (H - 70) / ART.postcard.h;
      this.add.tileSprite(0, 0, (MAX_W / k) * TEX, ART.postcard.h * TEX, 'postcard').setOrigin(0, 0).setScale(k / TEX);
    }
    const band = (key: string, y: number, h: number) => this.add.tileSprite(0, y, MAX_W * TEX, h * TEX, key).setOrigin(0, 0).setScale(1 / TEX);
    if (this.textures.exists('asphalt')) band('asphalt', H - 92, 92);
    band('line_white', H - 96, ART.line_white.h);
    band('line_yellow', H - 50, ART.line_yellow.h);

    makePaperArt(this, 'levels_header', 320, 60, (c) => {
      tapePath(c, 0, 0, 320, 60);
      fillPaper(c, 'red');
      cutText(c, 'PICK A LEVEL', 160, 32, 42, 'yellow');
    }, { border: 3 });
    img(this, W / 2, 50, 'levels_header').setRotation(-0.02);

    const best = loadStars();
    const gap = Math.min(350, (W - 60) / LEVELS.length);
    LEVELS.forEach((level, i) => {
      const x = W / 2 + (i - (LEVELS.length - 1) / 2) * gap, y = 286;
      const tilt = i % 2 ? 0.025 : -0.03;
      this.buildCard(level);
      img(this, x, y, `card_${level.id}`).setRotation(tilt);
      for (let s = 0; s < 3; s++) {
        const st = img(this, x - 46 + s * 46, y + 124, s < (best[level.id] ?? 0) ? 'star_big' : 'star_big_off');
        st.setScale(st.scale * 0.42).setRotation(tilt + (s - 1) * 0.14);
      }
      this.cards.push({ x, y, level });
    });

    const tape = img(this, W / 2, H - 24, 'tape_m');
    tape.setScale(tape.scale * 1.3, tape.scale);
    written(this, W / 2, H - 24, 'Tap a level to play', 18);

    const start = (level: LevelDef) => {
      sound.unlock();
      this.scene.start('game', { level: level.id });
    };
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      const hit = this.cards.find((c) => Math.abs(w.x - c.x) < CARD_W / 2 && Math.abs(w.y - c.y) < CARD_H / 2);
      if (hit) start(hit.level);
    });
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const level = LEVELS.find((l) => String(l.number) === e.key);
      if (level) start(level);
    });
  }

  /** Draw one of the game's own pieces onto a card, standing on `bottom`. */
  private stamp(c: Ctx, key: string, x: number, bottom: number, w: number): void {
    if (!this.textures.exists(key)) return;
    const src = this.textures.get(key).getSourceImage() as HTMLCanvasElement;
    const h = (w * src.height) / src.width;
    c.drawImage(src, x - w / 2, bottom - h, w, h);
  }

  private buildCard(level: LevelDef): void {
    makePaperArt(this, `card_${level.id}`, CARD_W, CARD_H, (c) => {
      // a snapshot: a white print with a picture and a caption
      c.beginPath();
      c.rect(0, 0, CARD_W, CARD_H);
      fillPaper(c, 'white');
      const px = 16, py = 16, pw = CARD_W - 32, ph = 178;
      c.save();
      c.beginPath();
      c.rect(px, py, pw, ph);
      c.clip();
      c.fillStyle = '#8fbfe0';
      c.fillRect(px, py, pw, ph);
      const road = py + 150;
      if (level.theme === 'street') {
        if (this.textures.exists('houses')) {
          const src = this.textures.get('houses').getSourceImage() as HTMLCanvasElement;
          c.drawImage(src, px - 14, py + 34, 420, (420 * src.height) / src.width);
        }
        c.beginPath(); c.rect(px, py + 132, pw, 20); fillPaper(c, 'green');
        c.beginPath(); c.rect(px, road, pw, ph); fillPaper(c, 'grey');
        for (const mx of [px + 62, px + 206]) {
          c.beginPath(); c.rect(mx - 3, road - 26, 6, 30); fillPaper(c, 'brown');
        }
        this.stamp(c, 'mailbox0', px + 62, road - 22, 56);
        this.stamp(c, 'mailbox1', px + 206, road - 22, 56);
        this.stamp(c, 'bike', px + 136, py + ph + 2, 128);
      } else {
        if (this.textures.exists('postcard')) {
          const src = this.textures.get('postcard').getSourceImage() as HTMLCanvasElement;
          c.drawImage(src, 0, 0, src.width / 3, src.height, px, py - 8, pw, 160);
        }
        c.beginPath(); c.rect(px, py + 122, pw, ph); fillPaper(c, 'grey');
        this.stamp(c, 'sedan_red', px + 182, py + 150, 150);
        this.stamp(c, 'head1', px + 150, py + 128, 44);
        this.stamp(c, 'bug', px + 96, py + ph + 4, 136);
      }
      c.restore();

      // the level number on a yellow dot, and the caption
      glued(c, () => { c.beginPath(); c.arc(px + 28, py + 28, 22, 0, Math.PI * 2); fillPaper(c, 'yellow'); });
      cutText(c, String(level.number), px + 28, py + 30, 34, 'red');
      let size = 36;
      while (size > 18 && textWidth(level.name, size) > pw) size -= 2;
      cutText(c, level.name, CARD_W / 2, 224, size, 'red');
      c.font = `17px ${MARKER}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = INK;
      c.fillText(level.era, CARD_W / 2, 254);
    }, { border: 1 });
  }
}
