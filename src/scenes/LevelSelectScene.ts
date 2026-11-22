import Phaser from 'phaser';
import { H, HEAD_SRC_H, INK, MAX_W, TEX, view } from '../config';
import { ART, Ctx, img, star } from '../art/sticker';
import { cutText, fillPaper, glued, makePaperArt, tapePath, textWidth } from '../art/paper';
import { sound } from '../audio/sound';
import { HALL } from '../art/hallway';
import { DOLL, ROOM } from '../art/sleepover';
import { LEVELS, LevelDef, sceneFor } from '../data/levels';
import { RIGS, RigName } from '../objects/Bill';
import { loadStars } from '../data/progress';
import { MARKER, written } from '../ui/text';

const CARD_W = 300;
const CARD_H = 320;

/** Pick a level: each one is a snapshot stuck in the scrapbook, with the best
 *  star rating earned so far underneath. */
export class LevelSelectScene extends Phaser.Scene {
  private cards: { x: number; y: number; k: number; level: LevelDef }[] = [];

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

    // have every level's music on its way before one is picked
    LEVELS.forEach((level) => sound.loadMusic(level.id));
    const best = loadStars();
    const gap = Math.min(350, (W - 40) / LEVELS.length);
    // on a narrow screen the snapshots shrink to fit side by side
    const k = Math.min(1, (gap - 14) / CARD_W);
    LEVELS.forEach((level, i) => {
      const x = W / 2 + (i - (LEVELS.length - 1) / 2) * gap, y = 286;
      const tilt = i % 2 ? 0.025 : -0.03;
      this.buildCard(level);
      const card = img(this, x, y, `card_${level.id}`).setRotation(tilt);
      card.setScale(card.scale * k);
      for (let s = 0; s < 3; s++) {
        const st = img(this, x + (s - 1) * 46 * k, y + 124 * k, s < (best[level.id] ?? 0) ? 'star_big' : 'star_big_off');
        st.setScale(st.scale * 0.42 * k).setRotation(tilt + (s - 1) * 0.14);
      }
      this.cards.push({ x, y, k, level });
    });

    const tape = img(this, W / 2, H - 24, 'tape_m');
    tape.setScale(tape.scale * 1.3, tape.scale);
    written(this, W / 2, H - 24, 'Tap a level to play', 18);

    const start = (level: LevelDef) => {
      sound.unlock();
      this.scene.start(sceneFor(level), { level: level.id });
    };
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      const hit = this.cards.find((c) => Math.abs(w.x - c.x) < (CARD_W * c.k) / 2 && Math.abs(w.y - c.y) < (CARD_H * c.k) / 2);
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

  /** Draw a piece of art on a card with its anchor at (x, y), at `k` card pixels per game pixel. */
  private place(c: Ctx, key: string, x: number, y: number, k: number): void {
    if (!this.textures.exists(key)) return;
    const a = ART[key];
    const src = this.textures.get(key).getSourceImage() as HTMLCanvasElement;
    c.drawImage(src, x - (a.pad + a.ax) * k, y - (a.pad + a.ay) * k, (a.w + a.pad * 2) * k, (a.h + a.pad * 2) * k);
  }

  /** Bill, put together the way the game does it: his body frame, his head on
   *  its neck, and his ride in front. (x, groundY) is where his wheels touch the road. */
  private placeBill(c: Ctx, theme: RigName, face: string, x: number, groundY: number, k: number): void {
    const rig = RIGS[theme];
    const ground = rig.ride?.baseY ?? rig.at[1];
    const X = (dx: number) => x + dx * k;
    const Y = (dy: number) => groundY + (dy - ground) * k;
    this.place(c, rig.frames.rest, X(rig.at[0]), Y(rig.at[1]), k);
    if (this.textures.exists(face)) {
      const src = this.textures.get(face).getSourceImage() as HTMLCanvasElement;
      const s = (rig.headH / HEAD_SRC_H) * k;
      const cx = X(rig.at[0] + rig.chin.rest[0]);
      const cy = Y(rig.at[1] + rig.chin.rest[1]) - rig.headH * 0.415 * k;
      c.drawImage(src, cx - (src.width * s) / 2, cy - (src.height * s) / 2, src.width * s, src.height * s);
    }
    if (rig.ride) this.place(c, rig.ride.key, X(0), Y(rig.ride.baseY), k);
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
          // a slice of the street, with the picket fence along the front
          const src = this.textures.get('houses').getSourceImage() as HTMLCanvasElement;
          const photo = ART.houses.h > 200;
          const sw = photo ? src.width * 0.27 : src.width * 0.66;
          const sy = photo ? src.height * 0.26 : 0;
          const dh = (pw * (src.height - sy)) / sw;
          c.drawImage(src, 0, sy, sw, src.height - sy, px, road - 6 - dh, pw, dh);
        }
        if (this.textures.exists('fence')) {
          const src = this.textures.get('fence').getSourceImage() as HTMLCanvasElement;
          const fh = 26, fw = (fh * src.width) / src.height;
          for (let x = px; x < px + pw; x += fw) c.drawImage(src, x, road - fh, fw, fh);
        }
        c.beginPath(); c.rect(px, road, pw, ph); fillPaper(c, 'grey');
        this.place(c, 'mailbox0_hit', px + 44, road + 3, 0.7);
        this.place(c, 'mailbox1', px + 232, road + 3, 0.7);
        this.placeBill(c, 'street', 'bill-grin', px + 140, py + ph - 3, 0.52);
      } else if (level.theme === 'sleepover') {
        // the rec room: DJ asleep on the couch, and Neil with the sock
        const lk = 0.6, floor = py + 132, cx = px + 158;
        c.beginPath(); c.rect(px, py, pw, ph); fillPaper(c, 'manila');
        c.fillStyle = 'rgba(90, 55, 20, 0.22)';
        c.fillRect(px, py, pw, ph);
        c.beginPath(); c.rect(px, floor, pw, ph); fillPaper(c, 'green');
        this.place(c, 'rec_window', cx + 60, py + 46, lk);
        this.place(c, 'kid_forrest', cx + ROOM.forrest[0] * lk, floor + 30 + (ROOM.forrest[1] - ROOM.couchY) * lk, lk);
        this.place(c, 'rec_couch', cx, floor + 30, lk);
        this.place(c, 'dj_asleep', cx, floor + 30 + (ROOM.djY - ROOM.couchY) * lk, lk);
        const nx = cx + ROOM.neil[0] * lk, ny = floor + 30 + (ROOM.neil[1] - ROOM.couchY) * lk;
        this.place(c, 'kid_neil', nx, ny, lk);
        this.place(c, 'neil_arm', nx + DOLL.shoulder[0] * lk, ny + DOLL.shoulder[1] * lk, lk);
        this.place(c, 'word_blap', px + 214, py + 40, 0.62);
      } else if (level.theme === 'locker') {
        // the hallway over his shoulder: lockers, the open one, and what is coming out of it
        c.beginPath(); c.rect(px, py, pw, ph); fillPaper(c, 'cream');
        // the part of the hallway around the open locker, at `lk` of its size in the game
        const lk = 0.6, left = HALL.mouthDX - 300, top = 96;
        const X = (dx: number) => px + (dx - left) * lk, Y = (y: number) => py + (y - top) * lk;
        if (this.textures.exists('hallway')) {
          const src = this.textures.get('hallway').getSourceImage() as HTMLCanvasElement;
          const d = ART.hallway.tex ?? TEX;
          c.drawImage(src, (ART.hallway.w / 2 + left) * d, (top - HALL.photoY) * d, (pw / lk) * d, (ph / lk) * d, px, py, pw, ph);
        } else {
          const src = this.textures.get('lockers').getSourceImage() as HTMLCanvasElement;
          for (let x = px - 8; x < px + pw; x += ART.lockers.w * lk) c.drawImage(src, x, Y(HALL.top), ART.lockers.w * lk, ART.lockers.h * lk);
          const fl = this.textures.get('hall_floor').getSourceImage() as HTMLCanvasElement;
          const fh = py + ph - Y(HALL.floorY);
          c.drawImage(fl, fl.width / 2 - pw / lk, 0, (pw / lk) * 2, (fh / lk) * 2, px, Y(HALL.floorY), pw, fh);
          this.place(c, 'locker_open', X(HALL.mouthDX), Y(HALL.floorY), lk);
        }
        this.place(c, 'splat0', X(HALL.mouthDX - 150), Y(160), 0.26);
        this.place(c, 'splat1', X(HALL.mouthDX - 62), Y(250), 0.2);
        this.place(c, 'shake', X(HALL.mouthDX - 12), Y(170), 0.24);
        this.place(c, 'jar', X(HALL.mouthDX - 72), Y(238), 0.42);
        this.placeBill(c, 'locker', 'bill-grin', px + 64, py + 146, 0.5);
      } else {
        if (this.textures.exists('postcard')) {
          const src = this.textures.get('postcard').getSourceImage() as HTMLCanvasElement;
          c.drawImage(src, 0, 0, src.width / 3, src.height, px, py - 8, pw, 160);
        }
        c.beginPath(); c.rect(px, py + 122, pw, ph); fillPaper(c, 'grey');
        this.stamp(c, 'sedan_red', px + 182, py + 150, 150);
        this.stamp(c, 'head1', px + 150, py + 128, 44);
        this.placeBill(c, 'highway', 'bill-sideeye', px + 92, py + ph - 1, 0.47);
      }
      c.restore();

      // the level number on a yellow dot, and the caption
      glued(c, () => { c.beginPath(); c.arc(px + 28, py + 28, 22, 0, Math.PI * 2); fillPaper(c, 'yellow'); });
      if (level.bonus) {
        star(c, px + 28, py + 29, 16, 7);
        fillPaper(c, 'red');
      } else {
        cutText(c, String(level.number), px + 28, py + 30, 34, 'red');
      }
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
