import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { CHEER } from '../art/fight';
import { ART, applyArt, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { label, written } from '../ui/text';
import { Mini, Point } from './Mini';

type Image = Phaser.GameObjects.Image;
type Text = Phaser.GameObjects.Text;

/** Where the gym floor is, and how far each of them stands from the middle. */
const FLOOR = 428;
const APART = 118;
/** Each of Stephanie's hits takes this much off the other girl, while they still count. */
const DAMAGE = 0.035;
/** The fight lasts this long, or this many hits, before the other girl has had enough. */
const FIGHT_FOR = 6.5;
const FIGHT_HITS = 8;
/** How fast Stephanie crosses the gym once she has been sent on her way. */
const FLIGHT = 980;

const MOVES = ['SPIRIT FINGERS', 'HIGH KICK', 'POM-POM FLURRY'];
const POSES = ['fingers', 'kick', 'flurry'];
const PLEAS = ['APOLOGIZE', 'COMPLIMENT HER JACKET', 'OFFER HALL PASS'];
const SAID = ['SORRY!!', 'I LOVE YOUR JACKET!', 'HALL PASS...?'];

type Phase = 'callout' | 'round' | 'fight' | 'power' | 'flick' | 'pinball' | 'ko' | 'done';

/** The fight after school. Stephanie, in her cheer outfit, is called out and
 *  stands her ground, and for a few seconds it goes well. Then the other girl
 *  powers up, at length, and Stephanie is batted round the gym like a pinball.
 *  It cannot be won, and is not counted in the score. */
export class FightMini extends Mini {
  readonly title = 'AFTER SCHOOL';
  readonly prompt = 'STAND YOUR GROUND!';
  readonly seconds = 40;
  readonly scored = false;

  private phase: Phase = 'callout';
  private t = 0;
  private cues: { at: number; run: () => void }[] = [];
  /** Things that are on the page for a while and then are not. */
  private passing: { objs: Phaser.GameObjects.GameObject[]; left: number; who?: string }[] = [];
  /** Things thrown about: they fly, fall and are cleared away. */
  private bits: { im: Image; vx: number; vy: number; spin: number; drop: number; life: number }[] = [];

  // Stephanie
  private body!: Image;
  private head!: Image;
  private pose = 'ready';
  private sx = 0;
  private lunge = 0;
  private cool = 0;
  private hits = 0;
  private said = 0;
  // ...in flight
  private at = { x: 0, y: 0 };
  private spin = 0;
  private turn = 9;
  private stops: { x: number; y: number; hit?: string }[] = [];
  private bounces = 0;
  private stars: Image[] = [];

  // the other girl
  private rival!: Image;
  private rx = 0;
  private rivalPose = 'walk';
  private flinch = 0;
  private aura!: Image;
  private size = 1;
  private shake = 0;
  private rocks: { im: Image; vy: number; spin: number }[] = [];
  private rockIn = 0;

  // the scoreboard, and the gym
  private hp = 1;
  private bars = 1;
  private barL!: Phaser.GameObjects.Graphics;
  private barR!: Phaser.GameObjects.Graphics;
  private barBroken = false;
  private stack!: Text;
  private power!: Text;
  private comboL!: Text;
  private comboR!: Text;
  private plates: { plate: Image; text: Text; x: number }[] = [];
  private pleading = false;
  private bleachers!: Image;
  private hoop!: Image;
  private table!: Image;
  private broken = new Set<string>();
  private botIn = 0;

  private get cx(): number {
    return view.W / 2;
  }

  build(): void {
    const s = this.scene, W = view.W;
    const strip = (key: string, y: number, h: number) => s.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, h * TEX, key)
      .setOrigin(0, 0).setScale(1 / TEX).setDepth(1);
    strip('gym_wall', -BLEED, FLOOR - 18 + BLEED);
    strip('gym_floor', FLOOR - 18, H - FLOOR + 18 + BLEED);
    const stripe = s.add.graphics().setDepth(2);
    stripe.fillStyle(0x2a5db0, 1);
    stripe.fillRect(-BLEED, FLOOR - 62, MAX_W + BLEED * 2, 10);
    img(s, 170, 150, 'gym_banner').setDepth(3).setRotation(-0.03);
    this.hoop = img(s, W - 120, 124, 'hoop').setDepth(3);
    this.bleachers = img(s, this.cx, FLOOR - 16, 'bleachers').setDepth(4);
    this.table = img(s, 96, FLOOR + 30, 'bake_table').setDepth(8);

    this.sx = this.cx - APART;
    this.rx = W + 170;
    this.aura = img(s, this.cx + APART, FLOOR + 14, 'aura').setDepth(9).setAlpha(0);
    this.rival = img(s, this.rx, FLOOR, 'rival_walk').setDepth(10);
    this.body = img(s, this.sx, FLOOR, 'cheer_ready').setDepth(12);
    this.head = img(s, 0, 0, 'mom_smile').setDepth(13);

    // the scoreboard of a proper fighting game
    const hud = 96;
    this.barL = s.add.graphics().setDepth(hud);
    this.barR = s.add.graphics().setDepth(hud);
    label(s, this.cx, 60, 'VS', 22, '#f6c430').setDepth(hud);
    label(s, 26, 86, 'STEPHANIE', 18).setOrigin(0, 0.5).setDepth(hud);
    label(s, W - 26, 86, 'TROUBLE', 18).setOrigin(1, 0.5).setDepth(hud);
    this.stack = label(s, this.cx + 62, 86, '', 18, '#f6c430').setOrigin(0, 0.5).setDepth(hud);
    this.power = label(s, W - 26, 110, '', 16, '#9fe870').setOrigin(1, 0.5).setDepth(hud);
    this.comboL = label(s, 150, 222, '', 26, '#f6c430').setDepth(hud).setRotation(-0.06);
    this.comboR = label(s, W - 150, 250, '', 26, '#ff7a5c').setDepth(hud).setRotation(0.06);

    // three things she can do about it
    const bw = Math.min(260, (W - 68) / 3);
    for (let i = 0; i < 3; i++) {
      const x = this.cx + (i - 1) * (bw + 12);
      const plate = img(s, x, 502, 'fight_btn').setDepth(90);
      plate.setScale((plate.scaleX * bw) / 260, plate.scaleY);
      const text = written(s, x, 502, MOVES[i], 19).setDepth(91);
      this.plates.push({ plate, text, x });
    }
    this.draw();
    this.place();
    this.enter('callout');
  }

  // ---- one thing after another -----------------------------------------------------------

  private cue(at: number, run: () => void): void {
    this.cues.push({ at, run });
    this.cues.sort((a, b) => a.at - b.at);
  }

  private enter(phase: Phase): void {
    this.phase = phase;
    this.t = 0;
    this.cues = [];
    const W = view.W;
    if (phase === 'callout') {
      // she stomps on over
      for (const at of [0.3, 0.78, 1.26, 1.74, 2.22]) {
        this.cue(at, () => {
          sound.stomp();
          this.scene.cameras.main.shake(110, 0.007);
        });
      }
      this.cue(0.9, () => this.bubble('rival', Math.min(this.rx, W - 190), FLOOR - 300, 'HEY! LITTLE MISS PERFECT!', 1.5));
      this.cue(2.5, () => {
        this.rivalPose = 'point';
        this.bubble('rival', this.rx - 30, FLOOR - 304, 'YOU NEED AN ATTITUDE ADJUSTMENT.', 1.9);
      });
      this.cue(3.7, () => {
        this.bubble('steph', this.sx, FLOOR - 310, 'I AM NOT SCARED OF YOU!', 1.3);
        this.scene.tweens.add({ targets: this, lunge: 16, duration: 90, yoyo: true });
      });
      this.cue(5.0, () => this.enter('round'));
    } else if (phase === 'round') {
      this.cue(0, () => { this.host.word('round', this.cx, 210, true); sound.rageReady(); });
      this.cue(0.95, () => { this.host.word('fight', this.cx, 230, true); sound.rageFire(); });
      this.cue(1.5, () => this.enter('fight'));
    } else if (phase === 'power') {
      this.cue(0, () => {
        this.rivalPose = 'point';
        this.bubble('rival', this.rx - 20, FLOOR - 304, 'THAT ALL YOU GOT?', 1.1);
      });
      this.cue(1.2, () => {
        this.rivalPose = 'charge';
        this.bubble('rival', this.rx, FLOOR - 320, 'RRRRAAAAAAAHHH!!!', 5.2, 26);
        sound.powerUp(5.3);
        applyArt(this.head, 'mom_in');
      });
      this.cue(3.5, () => this.beg());
      this.cue(4.6, () => { this.hp = 1; this.bars = 2; });
      this.cue(6.5, () => this.transform());
      this.cue(8.3, () => {
        // and then, for a moment, it is very quiet
        this.shake = 0;
        sound.stopPower();
        sound.dim(0.3);
        this.scene.tweens.add({ targets: this.aura, alpha: 0.4, duration: 300 });
        this.bubble('rival', this.rx - 30, FLOOR - 400, 'MY TURN.', 1.2);
      });
      this.cue(8.9, () => {
        this.pose = 'plead';
        this.bubble('steph', this.sx - 10, FLOOR - 310, 'uh oh.', 0.8);
      });
      this.cue(9.8, () => this.enter('flick'));
    } else if (phase === 'flick') {
      this.rivalPose = 'flick';
      this.scene.tweens.add({ targets: this, rx: this.rx - 50, duration: 180, yoyo: true, ease: 'Quad.out' });
      this.cue(0.2, () => this.launch());
    } else if (phase === 'ko') {
      this.cue(0.25, () => {
        this.host.word('ko', this.cx, 220, true);
        sound.boom();
        this.scene.cameras.main.shake(260, 0.014);
      });
      this.cue(1.3, () => {
        this.rivalPose = 'win';
        this.host.word('flawless', Math.min(this.rx + 210, W - 160), 300, true);
        sound.lose();
      });
      this.cue(3.3, () => {
        this.phase = 'done';
        this.host.finish(false);
      });
    }
  }

  /** A speech bubble, for as long as it takes to read (or until whoever said it says something else). */
  private bubble(who: 'steph' | 'rival', x: number, y: number, text: string, secs: number, size = 19): void {
    const s = this.scene;
    for (const p of this.passing) if (p.who === who) p.left = 0;
    const words = written(s, 0, 0, text, size);
    const w = words.width + 22, h = words.height + 8;
    x = Phaser.Math.Clamp(x, w / 2 + 10, view.W - w / 2 - 10);
    y = Math.max(y, 128);
    const g = s.add.graphics().setDepth(94);
    g.fillStyle(0x2a2320, 1);
    g.fillRoundedRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 14);
    g.fillTriangle(x - 12, y + h / 2, x + 12, y + h / 2, x, y + h / 2 + 20);
    g.fillStyle(0xfbf6ea, 1);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
    g.fillTriangle(x - 8, y + h / 2 - 2, x + 8, y + h / 2 - 2, x, y + h / 2 + 14);
    words.setPosition(x, y).setDepth(95);
    this.passing.push({ objs: [g, words], left: secs, who });
  }

  /** Throw something: it flies off, turning, and falls. */
  private fling(key: string, x: number, y: number, n: number, speed: number, depth = 60): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
      const im = img(this.scene, x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, key).setDepth(depth).setRotation(a);
      this.bits.push({ im, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.4, spin: (Math.random() - 0.5) * 16, drop: 900, life: 1.6 });
    }
  }

  // ---- what the player can do ---------------------------------------------------------------

  press(at: Point): void {
    const which = this.plates.findIndex((p) => Math.abs(at.x - p.x) < 136 && at.y > 466);
    const i = which >= 0 ? which : Math.floor(Math.random() * 3);
    if (this.phase === 'fight' || (this.phase === 'power' && !this.pleading)) this.attack(i);
    else if (this.phase === 'power') this.plead(i);
    else if (this.phase === 'pinball' && this.cool <= 0) {
      this.cool = 0.4;
      this.host.word('ow', this.at.x, this.at.y - 70);
      sound.yelp();
    }
  }

  /** One of her three moves. While the fight is fair, it lands. */
  private attack(i: number): void {
    if (this.cool > 0) return;
    this.cool = 0.3;
    this.pose = POSES[i];
    this.squash(i);
    sound.whoosh();
    const tw = this.scene.tweens;
    tw.killTweensOf(this);
    this.lunge = 0;
    tw.add({ targets: this, lunge: 62, duration: 80, yoyo: true, hold: 70, ease: 'Quad.out', onComplete: () => { if (this.pose === POSES[i]) this.pose = 'ready'; } });
    this.scene.time.delayedCall(90, () => this.land());
  }

  private land(): void {
    const x = this.rx - 40, y = FLOOR - 170 + (Math.random() - 0.5) * 70;
    if (this.phase === 'fight') {
      this.hits++;
      this.hp = Math.max(0.05, this.hp - DAMAGE);
      this.flinch = 0.2;
      sound.bonk(false);
      this.host.word(['pow', 'whack', 'bop'][this.hits % 3], x, y);
      this.scene.cameras.main.shake(70, 0.004);
      if (this.hits >= 2) this.pop(this.comboL, `${this.hits} HIT COMBO!`);
      if (this.hits === 4) this.bubble('steph', this.sx - 30, FLOOR - 316, 'HA! TAKE THAT!', 1.0);
    } else if (this.phase === 'power') {
      // it is like punching a bus
      this.said++;
      sound.tock();
      this.host.word(['noeffect', 'zero', 'tickles'][this.said % 3], x, y);
    }
  }

  /** The buttons change, without a word, to the only moves she has left. */
  private beg(): void {
    this.pleading = true;
    this.plates.forEach((p, i) => {
      applyArt(p.plate, 'fight_btn_sad');
      p.plate.setScale((p.plate.scaleX * Math.min(260, (view.W - 68) / 3)) / 260, p.plate.scaleY);
      p.text.setText(PLEAS[i]).setFontSize(PLEAS[i].length > 16 ? 15 : 19);
    });
  }

  private plead(i: number): void {
    if (this.cool > 0) return;
    this.cool = 0.55;
    this.pose = 'plead';
    this.squash(i);
    this.bubble('steph', this.sx - 20 + i * 14, FLOOR - 312, SAID[i], 0.7);
    sound.tock();
    this.scene.time.delayedCall(260, () => { if (this.phase === 'power') this.host.word('noeffect', this.rx - 30, FLOOR - 200); });
  }

  private squash(i: number): void {
    const p = this.plates[i].plate, y = p.scaleY;
    this.scene.tweens.add({ targets: p, scaleY: y * 0.86, duration: 60, yoyo: true });
  }

  private pop(text: Text, words: string): void {
    text.setText(words).setScale(1.3);
    this.scene.tweens.add({ targets: text, scale: 1, duration: 120 });
  }

  // ---- what happens to her ----------------------------------------------------------------------

  /** The other girl is done powering up. */
  private transform(): void {
    const s = this.scene;
    const flash = s.add.rectangle(this.cx, H / 2, MAX_W * 2, H * 2, 0xffffff, 1).setDepth(97);
    s.tweens.add({ targets: flash, alpha: 0, duration: 420, onComplete: () => flash.destroy() });
    this.rivalPose = 'hulk';
    this.size = 0.7;
    s.tweens.add({ targets: this, size: 1.1, duration: 320, ease: 'Back.out' });
    this.fling('shred_cloth', this.rx, FLOOR - 190, 14, 520);
    s.cameras.main.shake(380, 0.016);
    sound.boom();
    this.bars = 9;
    this.comboL.setText('');
    applyArt(this.head, 'mom_hold');
    this.pose = 'ready';
  }

  /** One flick, and she is airborne. From here she goes where she is sent. */
  private launch(): void {
    const W = view.W;
    sound.dim(1);
    sound.boom();
    this.scene.cameras.main.shake(320, 0.02);
    this.host.word('pow', this.sx + 40, FLOOR - 180, true);
    this.phase = 'pinball';
    this.t = 0;
    this.pose = 'fly';
    applyArt(this.head, 'mom_pah');
    this.at = { x: this.sx, y: FLOOR - 130 };
    // a tour of the gym, taking in everything breakable
    this.stops = [
      { x: (24 + this.cx - 46) / 2, y: 74, hit: 'bar' },
      { x: W - 46, y: 250 },
      { x: this.cx, y: FLOOR - 96, hit: 'bleachers' },
      { x: 150, y: 66 },
      { x: 110, y: FLOOR - 30, hit: 'table' },
      { x: W - 120, y: 170, hit: 'hoop' },
      { x: this.rx - 96, y: FLOOR - 230, hit: 'rival' },
      { x: 46, y: 250 },
      { x: W - 230, y: 64 },
      { x: W - 110, y: FLOOR - 20 },
      { x: this.rx - 96, y: FLOOR - 230, hit: 'rival' },
      { x: this.cx - 60, y: 62 },
      { x: this.cx - 170, y: FLOOR - 20, hit: 'floor' },
    ];
  }

  /** She has arrived somewhere, hard. */
  private bounce(hit?: string): void {
    const s = this.scene, { x, y } = this.at;
    this.bounces++;
    this.turn = -this.turn * (0.9 + Math.random() * 0.4);
    sound.bonk(false);
    s.cameras.main.shake(120, 0.009);
    this.fling('star', x, y, 3, 300);
    this.fling(Math.random() < 0.5 ? 'shred_red' : 'shred_white', x, y, 3, 260);
    this.pop(this.comboR, `${this.bounces + 1} HIT COMBO!`);
    if (hit === 'bar' && !this.barBroken) {
      // through her own health bar
      this.barBroken = true;
      sound.clang();
      this.host.word('crash', x, y + 60);
      s.tweens.add({ targets: this.barL, y: H + 320, rotation: 0.9, duration: 1100, ease: 'Quad.in', onComplete: () => this.barL.setVisible(false) });
    } else if (hit === 'bleachers' && !this.broken.has(hit)) {
      this.broken.add(hit);
      sound.clang();
      this.host.word('crash', x, y - 60);
      this.fling('plank', x, y, 12, 520, 20);
      this.bleachers.setVisible(false);
    } else if (hit === 'table' && !this.broken.has(hit)) {
      this.broken.add(hit);
      sound.splat();
      this.host.word('splat', x + 60, y - 70);
      this.fling('cupcake', x, y - 30, 12, 480);
      s.tweens.add({ targets: this.table, rotation: -0.5, y: this.table.y + 14, duration: 220 });
    } else if (hit === 'hoop' && !this.broken.has(hit)) {
      this.broken.add(hit);
      sound.clang();
      s.tweens.add({ targets: this.hoop, y: H + 120, rotation: 1.4, duration: 1000, ease: 'Quad.in' });
    } else if (hit === 'rival') {
      // straight back where she came from
      this.rivalPose = 'flick';
      this.host.word('bop', x, y - 50);
      s.time.delayedCall(280, () => { if (this.phase === 'pinball') this.rivalPose = 'hulk'; });
    }
  }

  // ---- every frame ----------------------------------------------------------------------------

  update(dt: number): void {
    if (this.phase === 'done') return;
    this.t += dt;
    this.cool -= dt;
    this.flinch -= dt;
    while (this.cues.length && this.cues[0].at <= this.t) this.cues.shift()!.run();

    if (this.phase === 'callout') {
      const target = this.cx + APART;
      const go = Math.min(1, this.t / 2.4);
      this.rx = view.W + 170 + (target - view.W - 170) * go;
      if (go < 1) this.rivalPose = 'walk';
    } else if (this.phase === 'fight') {
      if (this.t > FIGHT_FOR || (this.hits >= FIGHT_HITS && this.t > 2.5)) this.enter('power');
    } else if (this.phase === 'power') {
      this.powerUp(dt);
    } else if (this.phase === 'pinball') {
      this.fly(dt);
    } else if (this.phase === 'ko') {
      this.stars.forEach((st, i) => {
        const a = this.t * 4 + (i * Math.PI * 2) / this.stars.length;
        st.setPosition(this.at.x - 104 + Math.cos(a) * 34, FLOOR - 78 + Math.sin(a) * 9).setDepth(Math.sin(a) > 0 ? 14 : 11);
      });
    }

    for (const p of this.passing) {
      p.left -= dt;
      if (p.left <= 0) p.objs.forEach((o) => o.destroy());
    }
    this.passing = this.passing.filter((p) => p.left > 0);
    for (const b of this.bits) {
      b.life -= dt;
      b.vy += b.drop * dt;
      b.im.setPosition(b.im.x + b.vx * dt, b.im.y + b.vy * dt).setRotation(b.im.rotation + b.spin * dt).setAlpha(Math.min(1, b.life * 3));
      if (b.life <= 0) b.im.destroy();
    }
    this.bits = this.bits.filter((b) => b.life > 0);
    this.draw();
    this.place();
  }

  /** The power-up: the aura, the shaking, the rocks, the numbers. It goes on. */
  private powerUp(dt: number): void {
    const s = this.scene, p = this.t;
    if (p < 1.2) return;
    const charging = p < 8.3;
    if (charging) {
      this.shake = Math.min(7, (p - 1.2) * 1.3);
      const build = Math.min(1, (p - 1.2) / 5);
      this.aura.setAlpha(0.35 + build * 0.6);
      // rocks, lifting off the floor for no reason anyone can give
      this.rockIn -= dt;
      if (this.rockIn <= 0 && this.rocks.length < 28) {
        this.rockIn = 0.16;
        const im = img(s, this.rx + (Math.random() - 0.5) * 520, FLOOR + 8 + Math.random() * 30, 'rock').setDepth(11).setRotation(Math.random() * 6);
        im.setScale(im.scale * (0.6 + Math.random() * 0.9));
        this.rocks.push({ im, vy: -(40 + Math.random() * 90), spin: (Math.random() - 0.5) * 3 });
      }
      if (Math.floor(p * 2) !== Math.floor((p - dt) * 2)) s.cameras.main.shake(180, 0.002 + build * 0.01);
      // her power level, as far as the instruments can follow it
      const level = Math.floor(12 * Math.exp((p - 1.2) * 1.5));
      this.power.setText(p < 6.5 ? (level > 9000 ? 'POWER LEVEL  OVER 9000!!' : `POWER LEVEL  ${level}`) : 'POWER LEVEL  ERROR').setColor(level > 9000 ? '#ff7a5c' : '#9fe870');
      if (p > 4.6 && p < 6.5 && this.bars < 9 && Math.floor(p * 5) !== Math.floor((p - dt) * 5)) this.bars++;
    }
    for (const r of this.rocks) {
      if (charging) r.vy *= 1 - 0.5 * dt;
      else r.vy += 1400 * dt;
      r.im.setPosition(r.im.x, r.im.y + r.vy * dt).setRotation(r.im.rotation + r.spin * dt);
      if (!charging && r.im.y > FLOOR + 30) {
        r.im.destroy();
        r.vy = NaN;
      }
    }
    this.rocks = this.rocks.filter((r) => !Number.isNaN(r.vy));
    const wobble = charging ? this.shake * 0.5 : 0;
    this.bleachers.setX(this.cx + (Math.random() - 0.5) * wobble);
    this.hoop.setRotation((Math.random() - 0.5) * wobble * 0.012);
  }

  /** Across the gym to the next thing in her way. */
  private fly(dt: number): void {
    this.spin += this.turn * dt;
    let left = FLIGHT * dt;
    while (left > 0 && this.stops.length) {
      const to = this.stops[0];
      const dx = to.x - this.at.x, dy = to.y - this.at.y, d = Math.hypot(dx, dy);
      if (d > left) {
        this.at.x += (dx / d) * left;
        this.at.y += (dy / d) * left;
        left = 0;
      } else {
        this.at = { x: to.x, y: to.y };
        left -= d;
        this.stops.shift();
        this.bounce(to.hit);
      }
    }
    if (!this.stops.length) {
      // and down she comes
      this.pose = 'ko';
      this.at = { x: this.cx - 150, y: FLOOR + 10 };
      this.spin = 0;
      applyArt(this.head, 'mom_hold');
      for (let i = 0; i < 4; i++) this.stars.push(img(this.scene, 0, 0, 'star'));
      this.plates.forEach((p) => { p.plate.setVisible(false); p.text.setVisible(false); });
      this.enter('ko');
    }
  }

  /** The two health bars. Hers is plain. The other one stops being. */
  private draw(): void {
    const W = view.W, y = 60, h = 16, len = this.cx - 46 - 24;
    const bar = (g: Phaser.GameObjects.Graphics, x: number, frac: number, colour: number, fromRight: boolean) => {
      g.clear();
      g.fillStyle(0x2a2320, 1);
      g.fillRoundedRect(x - 4, -h / 2 - 4, len + 8, h + 8, 6);
      g.fillStyle(0xfbf6ea, 1);
      g.fillRoundedRect(x - 1, -h / 2 - 1, len + 2, h + 2, 4);
      g.fillStyle(0x45343a, 1);
      g.fillRect(x, -h / 2, len, h);
      g.fillStyle(colour, 1);
      g.fillRect(fromRight ? x + len * (1 - frac) : x, -h / 2, len * frac, h);
    };
    if (!this.barBroken) {
      this.barL.setPosition(24 + len / 2, y);
      bar(this.barL, -len / 2, 1, 0x59c36a, false);
    }
    this.barR.setPosition(W - 24 - len / 2, y);
    bar(this.barR, -len / 2, this.hp, this.bars > 1 ? 0xb46bff : 0xf6c430, true);
    this.stack.setText(this.bars > 1 ? `x${this.bars > 8 ? 99 : this.bars}` : '');
  }

  /** Put everybody where they are, and Stephanie's head on Stephanie. */
  private place(): void {
    // the other girl
    const rival = `rival_${this.flinch > 0 && this.rivalPose === 'point' ? 'flinch' : this.rivalPose}`;
    if (this.rival.texture.key !== rival) applyArt(this.rival, rival);
    const jx = (Math.random() - 0.5) * this.shake, jy = (Math.random() - 0.5) * this.shake;
    const stomp = this.phase === 'callout' ? -Math.abs(Math.sin(this.t * Math.PI / 0.48)) * 10 : 0;
    const big = this.rivalPose === 'hulk' || this.rivalPose === 'flick' || this.rivalPose === 'win' ? this.size : 1;
    this.rival.setPosition(this.rx + jx, FLOOR + jy + stomp).setScale(big / TEX);
    this.aura.setPosition(this.rx, FLOOR + 14).setScale(((0.8 + Math.sin(this.t * 22) * 0.06) * (big > 1 ? 1.25 : 1)) / TEX);

    // Stephanie: on her feet, or wherever she has got to
    const key = `cheer_${this.pose}`;
    if (this.body.texture.key !== key) applyArt(this.body, key);
    const doll = CHEER[this.pose], held = doll.hold ?? [0, 0];
    const flying = this.pose === 'fly' || this.pose === 'ko';
    const x = flying ? this.at.x : this.sx + this.lunge, y = flying ? this.at.y : FLOOR;
    const turn = this.pose === 'fly' ? this.spin : 0;
    this.body.setPosition(x, y).setRotation(turn);
    // her chin is a little below the middle of her head, whichever way up that is
    const tip = doll.tilt, cxh = doll.head[0] - held[0] - 30 * Math.sin(tip), cyh = doll.head[1] - held[1] + 30 * Math.cos(tip);
    this.head.setPosition(x + cxh * Math.cos(turn) - cyh * Math.sin(turn), y + cxh * Math.sin(turn) + cyh * Math.cos(turn)).setRotation(turn + tip);
    void ART;
  }

  timeUp(): boolean {
    return false;
  }

  bot(dt: number): void {
    this.botIn -= dt;
    if (this.botIn > 0) return;
    this.botIn = this.host.auto === 'good' ? 0.24 : 0.5;
    if (this.phase === 'fight' || this.phase === 'power' || this.phase === 'pinball') {
      const p = this.plates[Math.floor(Math.random() * 3)];
      this.press({ x: p.x, y: 502 });
    }
  }
}
