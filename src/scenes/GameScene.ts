import Phaser from 'phaser';
import { BILL, DEPTH, H, INK, LANE, MAX_W, SCORE, SPEED, SWING, TEX, view } from '../config';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { HIGHWAY_JAM, Spawn, countHeads } from '../data/levels';
import { PHRASES, pick } from '../data/phrases';
import { Bill } from '../objects/Bill';
import { NoodleNeck } from '../objects/NoodleNeck';
import { Vehicle } from '../objects/Vehicle';
import { Hud } from '../ui/Hud';
import { label } from '../ui/text';

interface Strip { ts: Phaser.GameObjects.TileSprite; factor: number }
interface Prop { im: Phaser.GameObjects.Image; factor: number; wrap?: number }
interface Sign { im: Phaser.GameObjects.Image; x: number; done: boolean }
type Quality = 'good' | 'perfect' | 'rage';

const SIGN_BASE_Y = 384;
/** The world is painted this far past every screen edge so camera shake never shows a gap. */
const BLEED = 48;
const HIT_WORDS = ['BONK!', 'WHACK!', 'THWACK!', 'BOP!', 'POW!'];

export class GameScene extends Phaser.Scene {
  private bill!: Bill;
  private hud!: Hud;
  private level = HIGHWAY_JAM;
  private pending: Spawn[] = [];
  private vehicles: Vehicle[] = [];
  private signs: Sign[] = [];
  private strips: Strip[] = [];
  private props: Prop[] = [];
  private zone!: Phaser.GameObjects.Image;
  private starFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private smokeFx?: Phaser.GameObjects.Particles.ParticleEmitter;
  private wreck?: Phaser.GameObjects.Image;
  private bubble?: Phaser.GameObjects.Container;
  private hintText?: Phaser.GameObjects.Text;

  private levelT = 0;
  private propT = 1;
  private total = 0;
  private whacked = 0;
  private missed = 0;
  private perfects = 0;
  private combo = 0;
  private bestCombo = 0;
  private cash = 0;
  private hearts = BILL.maxHearts;
  private rage = 0;
  private slow = 1;
  private hitStop = 0;
  private rageT = -1;
  private over = false;
  private canRestart = false;
  private duckPointer = -1;
  private duckKey = false;
  /** A tap that arrived mid-swing is remembered briefly so fast taps are not lost. */
  private swingBuffer = 0;
  private taught = new Set<string>();
  private auto: '' | 'good' | 'clumsy' = '';
  private keys!: Record<'down' | 's' | 'space' | 'r' | 'enter', Phaser.Input.Keyboard.Key>;

  constructor() {
    super('game');
  }

  create(): void {
    this.pending = [...this.level.spawns];
    this.vehicles = [];
    this.signs = [];
    this.strips = [];
    this.props = [];
    this.levelT = 0;
    this.propT = 1;
    this.total = countHeads(this.level);
    this.whacked = this.missed = this.perfects = this.combo = this.bestCombo = this.cash = this.rage = 0;
    this.hearts = BILL.maxHearts;
    this.slow = 1;
    this.hitStop = 0;
    this.rageT = -1;
    this.over = false;
    this.canRestart = false;
    this.duckPointer = -1;
    this.duckKey = false;
    this.swingBuffer = 0;
    this.taught = new Set();
    this.bubble = undefined;
    this.hintText = undefined;
    const auto = new URLSearchParams(location.search).get('auto');
    this.auto = auto === null ? '' : auto === 'clumsy' ? 'clumsy' : 'good';
    this.tweens.timeScale = 1;

    this.fitCamera();
    this.buildWorld();
    this.bill = new Bill(this, view.W * BILL.xFrac);
    this.zone = img(this, this.bill.sweetX, LANE.headY, 'zone').setDepth(DEPTH.median + 1).setAlpha(0.3);
    this.hud = new Hud(this);
    this.hud.setHearts(this.hearts);
    this.hud.setJam(0, 0, this.total);
    this.hud.setMuted(sound.muted);

    this.starFx = this.add.particles(0, 0, 'star', {
      speed: { min: 160, max: 420 }, angle: { min: 200, max: 345 }, gravityY: 900, lifespan: 650,
      scale: { start: 0.42, end: 0.12 }, rotate: { min: 0, max: 360 }, emitting: false,
    }).setDepth(DEPTH.fx + 4);
    this.dustFx = this.add.particles(0, 0, 'puff', {
      speedX: { min: -300, max: -200 }, speedY: { min: -36, max: 6 }, lifespan: 420,
      scale: { start: 0.2, end: 0.48 }, alpha: { start: 0.65, end: 0 }, frequency: 85,
    }).setDepth(DEPTH.billBack - 1);

    this.setupInput();
    this.scale.on('resize', this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.onResize, this));

    this.intro();
    sound.startMusic();
    (window as unknown as { __rn: unknown }).__rn = this;
  }

  // ---- setup -------------------------------------------------------------------

  private fitCamera(): void {
    this.cameras.main.setZoom(view.RES).centerOn(view.W / 2, H / 2);
  }

  private onResize(): void {
    this.fitCamera();
    this.hud.layout();
    this.bill.setX(view.W * BILL.xFrac);
  }

  private strip(key: string, y: number, factor: number, depth: number): void {
    const a = ART[key];
    const ts = this.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, a.h * TEX, key).setOrigin(0, 0).setScale(1 / TEX).setDepth(depth);
    this.strips.push({ ts, factor });
  }

  private buildWorld(): void {
    const sky = this.add.graphics().setDepth(DEPTH.sky);
    sky.fillGradientStyle(0x4fb3ee, 0x4fb3ee, 0xd3f0ff, 0xd3f0ff, 1);
    sky.fillRect(-BLEED, -BLEED, MAX_W + BLEED * 2, 210 + BLEED);
    sky.fillStyle(0x231d1b, 1);
    sky.fillCircle(250, 66, 35);
    sky.fillStyle(0xfff0a0, 1);
    sky.fillCircle(250, 66, 32);

    for (let i = 0; i < 5; i++) {
      const im = img(this, (i / 5) * (MAX_W + 200) + Math.random() * 90, 26 + Math.random() * 70, 'cloud')
        .setDepth(DEPTH.sky + 1).setAlpha(0.95);
      im.setScale(im.scale * (0.6 + Math.random() * 0.5));
      this.props.push({ im, factor: 0.035 + Math.random() * 0.02, wrap: MAX_W + 260 });
    }
    this.strip('hills', 76, 0.1, DEPTH.far);

    const r = this.add.graphics().setDepth(DEPTH.road);
    const x0 = -BLEED, ww = MAX_W + BLEED * 2;
    r.fillStyle(0x5d5b66, 1); r.fillRect(x0, 206, ww, 184);        // jammed side
    r.fillStyle(0x56545f, 1); r.fillRect(x0, 300, ww, 90);         // closed lane
    r.fillStyle(0x231d1b, 1); r.fillRect(x0, 203, ww, 3);
    r.fillStyle(0x47454f, 1); r.fillRect(x0, 388, ww, 14);         // median
    r.fillStyle(0xf6c21c, 1); r.fillRect(x0, 391, ww, 3); r.fillRect(x0, 396, ww, 3);
    r.fillStyle(0x67656f, 1); r.fillRect(x0, 402, ww, 122);        // Bill's side
    r.fillStyle(0xf4f1ea, 1); r.fillRect(x0, 517, ww, 4);
    r.fillStyle(0x5c9f5e, 1); r.fillRect(x0, 530, ww, 10 + BLEED); // verge, past the bottom edge

    this.strip('rail', 184, 1, DEPTH.road + 1);
    this.strip('dash', 297, 1, DEPTH.road + 1);
    this.strip('dash', 452, 1, DEPTH.road + 1);
    this.strip('grass', 522, 1, DEPTH.fore);

    // cones along the closed lane
    const spacing = 190;
    const count = Math.ceil((MAX_W + 200) / spacing);
    for (let i = 0; i < count; i++) {
      const im = img(this, i * spacing + 60, 304, 'cone').setDepth(DEPTH.farCars + 1);
      this.props.push({ im, factor: 1, wrap: count * spacing });
    }

    // the wreck everyone is staring at, already behind Bill as the level starts
    this.wreck = img(this, view.W * 0.6, 380, 'wreck').setDepth(DEPTH.median);
    this.smokeFx = this.add.particles(0, 0, 'puff', {
      speedY: { min: -120, max: -70 }, speedX: { min: -30, max: 30 }, lifespan: 1300,
      scale: { start: 0.3, end: 0.9 }, alpha: { start: 0.8, end: 0 }, frequency: 110, tint: 0xc9c5cf,
    }).setDepth(DEPTH.median + 1);
  }

  private setupInput(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      sound.unlock();
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      if (this.over) {
        if (this.canRestart) this.scene.restart();
        return;
      }
      if (this.hud.overMute(w.x, w.y)) {
        sound.setMuted(!sound.muted);
        this.hud.setMuted(sound.muted);
      } else if (this.hud.overDuck(w.x, w.y)) {
        this.duckPointer = p.id;
      } else if (this.hud.overRage(w.x, w.y)) {
        this.tryRage();
      } else {
        this.trySwing();
      }
    });
    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.duckPointer) this.duckPointer = -1;
    };
    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        r: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        enter: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      };
      this.keys.space.on('down', () => {
        sound.unlock();
        if (this.over) { if (this.canRestart) this.scene.restart(); } else this.trySwing();
      });
      this.keys.r.on('down', () => this.tryRage());
      this.keys.enter.on('down', () => this.tryRage());
    }
  }

  private intro(): void {
    const title = label(this, view.W / 2, 150, this.level.name, 76, '#ffe45c', 12).setDepth(DEPTH.overlay).setScale(0.2).setAlpha(0);
    const sub = label(this, view.W / 2, 212, this.level.tagline, 30).setDepth(DEPTH.overlay).setAlpha(0);
    this.tweens.add({ targets: title, scale: 1, alpha: 1, duration: 320, ease: 'Back.out' });
    this.tweens.add({ targets: sub, alpha: 1, duration: 250, delay: 250 });
    this.tweens.add({
      targets: [title, sub], alpha: 0, y: '-=30', duration: 300, delay: 2500,
      onComplete: () => { title.destroy(); sub.destroy(); },
    });
  }

  // ---- player actions ------------------------------------------------------------

  private trySwing(): void {
    if (this.over || this.rageT >= 0) return;
    if (this.bill.startSwing()) {
      this.swingBuffer = 0;
      sound.whoosh();
    } else if (!this.bill.wantDuck) {
      this.swingBuffer = 0.13;
    }
  }

  private tryRage(): void {
    if (this.over || this.rage < 100 || this.rageT >= 0 || this.bill.stun > 0) return;
    this.rage = 0;
    this.hud.setRage(0);
    this.rageT = 0;
    this.bill.invulnerable = true;
    this.bill.setFace('grin', 2);
    this.setSlow(0.18);
    sound.rageFire();
    this.say(pick(PHRASES.rage).text);
    const banner = label(this, view.W / 2, 150, 'ROAD RAGE!', 84, '#ff5a3c', 13).setDepth(DEPTH.overlay).setScale(0.3);
    this.tweens.add({ targets: banner, scale: 1.05, duration: 60, ease: 'Back.out' });
    this.tweens.add({ targets: banner, alpha: 0, scale: 1.5, duration: 90, delay: 200, onComplete: () => banner.destroy() });
    this.cameras.main.zoomTo(view.RES * 1.06, 380);
  }

  /** The bat's special: one grand-slam swing that clears everything in sight. */
  private rageSlam(): void {
    this.setSlow(1);
    this.bill.rageCharge = 0;
    this.bill.startSwing();
    this.bill.markConnected();
    this.cameras.main.zoomTo(view.RES, 160);
    this.cameras.main.shake(380, 0.016);
    this.cameras.main.flash(160, 255, 244, 200);
    const ring = img(this, this.bill.sweetX, LANE.headY, 'burst').setDepth(DEPTH.fx + 5).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 420, ease: 'Cubic.out', onComplete: () => ring.destroy() });

    const targets: { v: Vehicle; neck: NoodleNeck; d: number }[] = [];
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.kind === 'dog' || n.whacked || n.passed) continue;
        if (n.headX > this.bill.x - 240 && n.headX < view.W + 80) targets.push({ v, neck: n, d: Math.abs(n.headX - this.bill.sweetX) });
      }
    }
    targets.sort((a, b) => a.d - b.d);
    targets.forEach((tg, i) => {
      this.time.delayedCall(i * 55, () => {
        if (this.vehicles.includes(tg.v)) this.whack(tg.v, tg.neck, 'rage');
      });
    });
    this.time.delayedCall(500, () => { this.bill.invulnerable = false; });
  }

  private setSlow(s: number): void {
    this.slow = s;
    this.tweens.timeScale = s < 1 ? Math.max(s, 0.35) : 1;
  }

  // ---- hits ---------------------------------------------------------------------

  private get mult(): number {
    return Math.min(5, 1 + Math.floor(this.combo / 5));
  }

  private whack(v: Vehicle, neck: NoodleNeck, q: Quality): void {
    if (neck.whacked) return;
    const hx = neck.headX, hy = neck.headY;

    if (neck.kind === 'dog') {
      neck.whack(1, v.vx);
      this.combo = 0;
      this.hud.setCombo(0, 1);
      this.cash = Math.max(0, this.cash - SCORE.dogFine);
      this.hud.setCash(this.cash);
      sound.yelp();
      this.pop(hx, hy - 34, 'BAD BILL!', '#ff6b5e', 34);
      this.pop(hx, hy + 2, `-$${SCORE.dogFine}`, '#ff6b5e', 24);
      this.say(pick(PHRASES.dog).text);
      this.bill.setFace('glare', 1);
      this.cameras.main.shake(120, 0.005);
      return;
    }

    const perfect = q !== 'good';
    neck.whack(q === 'rage' ? 1.6 : perfect ? 1.25 : 0.8, v.vx);
    this.whacked++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    if (q === 'perfect') this.perfects++;
    const gain = (perfect ? SCORE.perfect : SCORE.good) * this.mult;
    this.cash += gain;
    if (q !== 'rage') {
      const was = this.rage;
      this.rage = Math.min(100, this.rage + (perfect ? SCORE.ragePerfect : SCORE.rageGood));
      if (was < 100 && this.rage >= 100) {
        sound.rageReady();
        this.teach('rage', 'RAGE is ready - hit the button!');
      }
    }

    sound.bonk(perfect);
    sound.boing(perfect ? 1.3 : 1);
    this.hitStop = q === 'rage' ? 0.02 : perfect ? 0.085 : 0.05;
    this.cameras.main.shake(perfect ? 150 : 90, perfect ? 0.009 : 0.005);
    this.burst(hx, hy, perfect);
    this.pop(hx + 10, hy - 44, q === 'perfect' ? 'PERFECT!' : pick(HIT_WORDS), q === 'perfect' ? '#ffe45c' : '#ffffff', q === 'perfect' ? 40 : 32);
    this.pop(hx + 34, hy - 6, `+$${gain}`, '#b8f28a', 22, 0.12);
    this.bill.setFace('grin', 0.5);

    if (neck.kind === 'phone') {
      const rider = v.riders.find((r) => r.neck === neck);
      const from = rider && v.dropPhone(rider);
      if (from) this.flingPhone(from.x, from.y);
      this.say(pick(PHRASES.phone).text);
    } else if (q !== 'rage' && this.combo > 0 && this.combo % 8 === 0) {
      this.say(pick(PHRASES.combo).text);
    }

    this.hud.setCash(this.cash);
    this.hud.setCombo(this.combo, this.mult);
    this.hud.setRage(this.rage / 100);
    this.hud.setJam(this.whacked, this.missed, this.total);
  }

  private hurtBill(): void {
    this.hearts--;
    this.combo = 0;
    this.hud.setHearts(this.hearts);
    this.hud.loseHeartFx(this.hearts);
    this.hud.setCombo(0, 1);
    this.bill.hurt();
    sound.clang();
    sound.hurt();
    this.cameras.main.shake(220, 0.012);
    this.cameras.main.flash(120, 255, 90, 80);
    const top = this.bill.headTop;
    this.burst(top.x, top.y + 20, false);
    this.pop(top.x, top.y - 20, 'CLANG!', '#ff6b5e', 38);
    this.say(pick(PHRASES.hurt).text);
    if (this.hearts <= 0) this.finish('bonked');
  }

  // ---- little effects --------------------------------------------------------------

  private burst(x: number, y: number, big: boolean): void {
    const b = img(this, x, y, 'burst').setDepth(DEPTH.fx).setRotation(Math.random() * 6);
    const s = b.scale * (big ? 1.15 : 0.8);
    b.setScale(s * 0.3);
    this.tweens.add({ targets: b, scale: s, duration: 70, ease: 'Back.out' });
    this.tweens.add({ targets: b, alpha: 0, scale: s * 1.25, duration: 150, delay: 90, onComplete: () => b.destroy() });
    this.starFx.explode(big ? 10 : 6, x, y);
  }

  private pop(x: number, y: number, text: string, color: string, size: number, delay = 0): void {
    const t = label(this, x, y, text, size, color).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.3).setScale(0.3).setAlpha(0);
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 110, delay, ease: 'Back.out' });
    this.tweens.add({ targets: t, y: y - 46, alpha: 0, duration: 380, delay: delay + 430, onComplete: () => t.destroy() });
  }

  private flingPhone(x: number, y: number): void {
    const ph = img(this, x, y, 'phone').setDepth(DEPTH.fx + 2);
    this.tweens.add({ targets: ph, x: x + 150 + Math.random() * 120, duration: 900 });
    this.tweens.add({ targets: ph, rotation: 16, duration: 900 });
    this.tweens.add({ targets: ph, y: y - 150, duration: 380, ease: 'Quad.out' });
    this.tweens.add({ targets: ph, y: 380, duration: 520, delay: 380, ease: 'Quad.in', onComplete: () => ph.destroy() });
  }

  /** Bill's speech bubble. */
  private say(text: string): void {
    this.bubble?.destroy();
    const t = this.add.text(0, 0, text, {
      fontFamily: 'Bangers, Impact, sans-serif', fontSize: '26px', color: INK,
      padding: { x: 6, y: 4 }, resolution: Math.max(1, Math.ceil(view.RES)),
    }).setOrigin(0.5).setLetterSpacing(1);
    const w = t.width + 26, h = t.height + 12;
    const g = this.add.graphics();
    g.fillStyle(0xfffaf0, 1);
    g.lineStyle(3, 0x231d1b, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 15);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 15);
    const tx = w / 2 - 46;
    g.fillTriangle(tx, h / 2 - 3, tx + 26, h / 2 - 3, tx + 30, h / 2 + 24);
    g.beginPath();
    g.moveTo(tx, h / 2);
    g.lineTo(tx + 30, h / 2 + 24);
    g.lineTo(tx + 26, h / 2);
    g.strokePath();
    g.lineStyle(4, 0xfffaf0, 1);
    g.lineBetween(tx + 3, h / 2 - 1, tx + 23, h / 2 - 1);
    const top = this.bill.headTop;
    const bx = Math.max(w / 2 + 8, top.x - 26 - (w / 2 - 46));
    const c = this.add.container(bx, top.y - 44 - h / 2, [g, t]).setDepth(DEPTH.fx + 10).setScale(0.3);
    this.bubble = c;
    this.tweens.add({ targets: c, scale: 1, duration: 140, ease: 'Back.out' });
    this.tweens.add({
      targets: c, alpha: 0, duration: 200, delay: 1500,
      onComplete: () => { if (this.bubble === c) this.bubble = undefined; c.destroy(); },
    });
  }

  private hint(text: string): void {
    this.hintText?.destroy();
    const t = label(this, view.W / 2, 152, text, 34, '#ffffff').setDepth(DEPTH.overlay - 1).setScale(0.4).setAlpha(0);
    this.hintText = t;
    this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 180, ease: 'Back.out' });
    this.tweens.add({
      targets: t, alpha: 0, duration: 250, delay: 2300,
      onComplete: () => { if (this.hintText === t) this.hintText = undefined; t.destroy(); },
    });
  }

  private teach(id: string, text: string): void {
    if (this.taught.has(id)) return;
    this.taught.add(id);
    this.hint(text);
  }

  // ---- spawning --------------------------------------------------------------------

  private spawnDue(): void {
    const carSpeed = SPEED.world + SPEED.crawl;
    for (let i = 0; i < this.pending.length; i++) {
      const s = this.pending[i];
      const remaining = s.t - this.levelT;
      if (s.type === 'sign') {
        if (remaining > (view.W + 70 - this.bill.x) / SPEED.world) continue;
        const x = this.bill.x + SPEED.world * remaining;
        const im = img(this, x, SIGN_BASE_Y, `sign${Math.random() < 0.5 ? 0 : 1}`).setDepth(DEPTH.median);
        this.signs.push({ im, x, done: false });
        this.teach('duck', 'Sign coming - HOLD DUCK!');
      } else {
        if (remaining > (view.W + 330 - this.bill.sweetX) / carSpeed) continue;
        const v = new Vehicle(this, s.type, view.W + 600);
        const lead = v.riders[0].slot.x - 16;
        v.x = this.bill.sweetX + carSpeed * remaining - lead;
        v.update(0);
        this.vehicles.push(v);
        if (s.type === 'dog') this.teach('dog', "That's a good dog. DON'T hit it!");
        else if (s.type === 'phone') this.teach('phone', 'Phone filmers! Knock some sense into them.');
        else if (s.type === 'bus') this.teach('bus', 'Tour bus! Four heads in a row!');
        else this.teach('swing', 'TAP to swing when a head reaches the ring!');
      }
      this.pending.splice(i, 1);
      i--;
    }
  }

  private spawnProp(dt: number): void {
    this.propT -= dt;
    if (this.propT > 0) return;
    this.propT = 1.3 + Math.random() * 2.2;
    const key = Math.random() < 0.72 ? 'palm' : `billboard${Math.random() < 0.5 ? 0 : 1}`;
    const im = img(this, view.W + 140, 202, key).setDepth(DEPTH.far + 1);
    if (key === 'palm') im.setFlipX(Math.random() < 0.5).setScale(im.scale * (0.85 + Math.random() * 0.3));
    this.props.push({ im, factor: 1 });
  }

  // ---- main loop --------------------------------------------------------------------

  update(_time: number, delta: number): void {
    const real = Math.min(delta, 50) / 1000;
    if (this.hitStop > 0) {
      this.hitStop -= real;
      return;
    }
    const dt = real * this.slow;

    if (this.rageT >= 0) {
      this.rageT += real;
      this.bill.rageCharge = Math.min(1, this.rageT / 0.4);
      if (this.rageT >= 0.46) {
        this.rageT = -1;
        this.rageSlam();
      }
    }

    if (!this.over) {
      this.levelT += dt;
      this.spawnDue();
      if (this.auto) this.autoplay();
      if (this.swingBuffer > 0) {
        this.swingBuffer -= real;
        if (this.bill.canSwing) this.trySwing();
      }
      const keyDuck = !!this.keys && (this.keys.down.isDown || this.keys.s.isDown);
      this.bill.wantDuck = this.duckPointer >= 0 || keyDuck || this.duckKey;
      this.hud.setDuckPressed(this.bill.wantDuck);
    } else {
      this.bill.wantDuck = false;
    }
    this.spawnProp(dt);

    const scroll = SPEED.world * dt;
    for (const s of this.strips) s.ts.tilePositionX += scroll * s.factor * TEX;
    for (let i = this.props.length - 1; i >= 0; i--) {
      const p = this.props[i];
      p.im.x -= scroll * p.factor;
      if (p.im.x < -160) {
        if (p.wrap) p.im.x += p.wrap;
        else { p.im.destroy(); this.props.splice(i, 1); }
      }
    }
    if (this.wreck) {
      this.wreck.x -= scroll;
      this.smokeFx?.setPosition(this.wreck.x + 30, this.wreck.y - 96);
      if (this.wreck.x < -260) {
        this.wreck.destroy();
        this.wreck = undefined;
        this.smokeFx?.destroy();
        this.smokeFx = undefined;
      }
    }

    const whiff = this.bill.update(dt);
    if (whiff && !this.over) {
      this.combo = 0;
      this.hud.setCombo(0, 1);
    }
    this.zone.setPosition(this.bill.sweetX, LANE.headY).setRotation(this.levelT * 0.6);
    this.dustFx.setPosition(this.bill.x - 112, LANE.billBase - 6);

    // vehicles, swings and misses
    const sweet = this.bill.sweetX;
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      v.update(dt);
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed) continue;
        const dx = n.headX - sweet;
        if (this.bill.swingLive && Math.abs(dx) <= SWING.good && !this.over) {
          this.bill.markConnected();
          this.whack(v, n, Math.abs(dx) <= SWING.perfect ? 'perfect' : 'good');
        } else if (dx < -SWING.good - 26) {
          n.passed = true;
          if (this.over) continue;
          if (n.kind === 'dog') {
            this.cash += SCORE.dodge;
            this.hud.setCash(this.cash);
            this.pop(n.headX, n.headY - 40, 'GOOD BOY!', '#b8f28a', 24);
          } else {
            this.missed++;
            this.combo = 0;
            this.hud.setCombo(0, 1);
            this.hud.setJam(this.whacked, this.missed, this.total);
            this.pop(n.headX, n.headY - 40, 'MISSED!', '#ff8f85', 24);
          }
        }
      }
      if (v.gone) {
        v.destroy();
        this.vehicles.splice(i, 1);
      }
    }

    // signs standing in the closed lane
    for (let i = this.signs.length - 1; i >= 0; i--) {
      const s = this.signs[i];
      s.x -= scroll;
      s.im.x = s.x;
      if (!s.done && !this.over) {
        const dx = s.x - this.bill.x;
        if (dx < 34 && dx > -34 && this.bill.exposed) {
          s.done = true;
          this.tweens.add({ targets: s.im, rotation: 0.5, duration: 160, ease: 'Back.out' });
          this.hurtBill();
        } else if (dx <= -34) {
          s.done = true;
          if (!this.bill.invulnerable) {
            this.cash += SCORE.dodge;
            this.hud.setCash(this.cash);
            sound.dodge();
            this.pop(this.bill.x, 300, 'DODGED!', '#9fd0ff', 26);
          }
        }
      }
      if (s.x < -80) {
        s.im.destroy();
        this.signs.splice(i, 1);
      }
    }

    if (!this.over && this.pending.length === 0 && this.whacked + this.missed >= this.total) {
      const stillOnScreen = this.signs.some((s) => !s.done);
      if (!stillOnScreen && this.rageT < 0) this.finish('end');
    }
  }

  /** Dev helper: add ?auto to the URL and the game plays itself (?auto=clumsy
   *  plays badly: never ducks, hits dogs, skips heads). */
  private autoplay(): void {
    const clumsy = this.auto === 'clumsy';
    this.duckKey = !clumsy && this.signs.some((s) => !s.done && s.x - this.bill.x < 150 && s.x - this.bill.x > -40);
    const lead = (SPEED.world + SPEED.crawl) * SWING.windup;
    let onScreen = 0;
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed) continue;
        if (n.kind === 'dog' && !clumsy) continue;
        if (clumsy && Math.floor(n.headY * 7) % 3 === 0) continue;
        if (n.headX < view.W) onScreen++;
        const dx = n.headX - this.bill.sweetX;
        if (dx < lead + (clumsy ? 40 : 8) && dx > -10) this.trySwing();
      }
    }
    if (this.rage >= 100 && onScreen >= 3) this.tryRage();
  }

  // ---- results ----------------------------------------------------------------------

  private finish(reason: 'end' | 'bonked'): void {
    if (this.over) return;
    this.over = true;
    this.setSlow(1);
    this.duckPointer = -1;
    const frac = this.whacked / this.total;
    const stars = reason === 'bonked' ? 0 : SCORE.passStars.filter((s) => frac >= s).length;
    const won = stars > 0;
    sound.stopMusic();
    this.time.delayedCall(won ? 500 : 700, () => this.showResults(won, stars, reason));
  }

  private showResults(won: boolean, stars: number, reason: 'end' | 'bonked'): void {
    const W = view.W;
    if (won) sound.win(); else sound.lose();
    const veil = this.add.rectangle(W / 2, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.62).setDepth(DEPTH.overlay).setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 250 });

    const pw = 560, ph = 400, px = W / 2, py = H / 2 + 6;
    const g = this.add.graphics().setDepth(DEPTH.overlay + 1);
    g.fillStyle(0x231d1b, 1);
    g.fillRoundedRect(px - pw / 2 + 7, py - ph / 2 + 9, pw, ph, 26);
    g.fillStyle(0xfffaf0, 1);
    g.lineStyle(5, 0x231d1b, 1);
    g.fillRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 26);
    g.strokeRoundedRect(px - pw / 2, py - ph / 2, pw, ph, 26);

    const d = DEPTH.overlay + 2;
    const title = won ? 'JAM CLEARED!' : reason === 'bonked' ? "BILL'S HAD ENOUGH" : 'THE JAM WINS';
    label(this, px, py - 150, title, 58, won ? '#ffd23f' : '#ff6b5e', 10).setDepth(d);

    for (let i = 0; i < 3; i++) {
      const on = i < stars;
      const s = img(this, px - 92 + i * 92, py - 72 + (i === 1 ? -8 : 0), on ? 'star_big' : 'star_big_off').setDepth(d);
      if (on) {
        const full = s.scale;
        s.setScale(0);
        this.tweens.add({
          targets: s, scale: full, duration: 260, delay: 350 + i * 260, ease: 'Back.out',
          onStart: () => sound.tick(),
        });
      }
    }

    const pct = Math.round((this.whacked / this.total) * 100);
    const rows: [string, string][] = [
      ['Rubberneckers whacked', `${this.whacked} / ${this.total}  (${pct}%)`],
      ['Perfect hits', `${this.perfects}`],
      ['Best combo', `${this.bestCombo}`],
      ['Cash earned', `$${this.cash}`],
    ];
    rows.forEach(([k, v], i) => {
      const y = py + 2 + i * 34;
      label(this, px - 220, y, k, 25, INK, 0).setOrigin(0, 0.5).setDepth(d);
      label(this, px + 220, y, v, 25, '#c2402f', 0).setOrigin(1, 0.5).setDepth(d);
    });
    if (!won && reason === 'end') {
      label(this, px, py - 20, `Need ${Math.round(SCORE.passStars[0] * 100)}% to clear the jam`, 20, '#7a6a58', 0).setDepth(d);
    }

    const face = this.add.image(px - pw / 2 + 12, py - ph / 2 + 30, won ? 'bill-grin' : 'bill-glare').setDepth(d + 1).setRotation(-0.22);
    face.setScale(132 / face.frame.height);

    const again = label(this, px, py + 158, 'TAP TO PLAY AGAIN', 32, '#ffffff').setDepth(d).setAlpha(0);
    this.time.delayedCall(1100, () => {
      this.canRestart = true;
      again.setAlpha(1);
      this.tweens.add({ targets: again, scale: 1.08, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }
}
