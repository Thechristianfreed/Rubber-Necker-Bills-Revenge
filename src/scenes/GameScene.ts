import Phaser from 'phaser';
import { BILL, DEPTH, H, HEAD_SRC_H, INK, LANE, MAX_W, SCORE, SPEED, STREET, SWING, TEX, view } from '../config';
import { BLEED } from '../art/finish';
import { ART, img } from '../art/sticker';
import { sound } from '../audio/sound';
import { HIGHWAY_JAM, LevelDef, Move, Spawn, countHeads, levelById } from '../data/levels';
import { saveStars } from '../data/progress';
import { PHRASES, pick } from '../data/phrases';
import { Bill, RIGS } from '../objects/Bill';
import { MAILBOX_UP, Motion, NoodleNeck } from '../objects/NoodleNeck';
import { Vehicle } from '../objects/Vehicle';
import { Hud } from '../ui/Hud';
import { written } from '../ui/text';
import { DISPLAY, bubblePath, cutText, fillPaper, glued, makePaperArt, tapePath, textWidth } from '../art/paper';

interface Strip { ts: Phaser.GameObjects.TileSprite; factor: number }
interface Prop { im: Phaser.GameObjects.Image; factor: number; wrap?: number }
/** Something Bill has to duck: a road sign, a low branch. */
interface Sign { im: Phaser.GameObjects.Image; x: number; half: number; done: boolean }
type Quality = 'good' | 'perfect' | 'rage';
type Point = { x: number; y: number };
/** A thrown newspaper in mid-air. */
interface Paper {
  im: Phaser.GameObjects.Image;
  from: Point;
  /** Where it is heading: a moving mailbox, or a spot on the pavement. */
  to: () => Point;
  t: number;
  dur: number;
  onLand: (im: Phaser.GameObjects.Image) => void;
}

/** Where the things Bill ducks stand: on the median, or on the far pavement. */
const HAZARD_BASE_Y = { highway: 398, street: STREET.kerbY + 2 };
const HAZARD_DEPTH = { highway: DEPTH.median, street: DEPTH.median };
const HIT_WORDS = ['bonk', 'whack', 'thwack', 'bop', 'pow'];
const DELIVERY_WORDS = ['delivered', 'nicetoss', 'inthebox'];

export class GameScene extends Phaser.Scene {
  private bill!: Bill;
  private hud!: Hud;
  private level: LevelDef = HIGHWAY_JAM;
  private pending: Spawn[] = [];
  private vehicles: Vehicle[] = [];
  private signs: Sign[] = [];
  private strips: Strip[] = [];
  private props: Prop[] = [];
  private zone!: Phaser.GameObjects.Image;
  private starFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private papers: Paper[] = [];
  /** The swing whose paper has already been thrown. */
  private thrownId = -1;
  private smokeFx?: Phaser.GameObjects.Particles.ParticleEmitter;
  private wreck?: Phaser.GameObjects.Image;
  private bubble?: Phaser.GameObjects.Image;
  private bubbleSeq = 0;
  private hintNote?: Phaser.GameObjects.Container;

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

  /** Which level to play: passed in by the level select, or `?level=` in the address. */
  init(data: { level?: string }): void {
    this.level = levelById(data?.level ?? new URLSearchParams(location.search).get('level'));
  }

  private get street(): boolean {
    return this.level.theme === 'street';
  }

  /** In this level a tap throws a paper, rather than swinging at what is in the ring. */
  private get throwing(): boolean {
    return this.level.attack === 'throw';
  }

  /** Height of the middle of the strike ring: where the targets are. */
  private get ringY(): number {
    return this.street ? STREET.kerbY - MAILBOX_UP : LANE.headY;
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
    this.hintNote = undefined;
    const auto = new URLSearchParams(location.search).get('auto');
    this.auto = auto === null ? '' : auto === 'clumsy' ? 'clumsy' : 'good';
    this.tweens.timeScale = 1;

    this.wreck = undefined;
    this.smokeFx = undefined;
    this.papers = [];
    this.thrownId = -1;
    this.fitCamera();
    if (this.street) this.buildStreet(); else this.buildWorld();
    this.bill = new Bill(this, view.W * BILL.xFrac, RIGS[this.level.theme]);
    this.zone = img(this, this.bill.sweetX, this.ringY, 'zone').setDepth(DEPTH.median + 1).setAlpha(0.3);
    this.hud = new Hud(this, this.level.words.meter);
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

  /** A full-width band of a repeating texture that scrolls with the world. */
  private strip(key: string, y: number, factor: number, depth: number, height?: number): Phaser.GameObjects.TileSprite {
    const a = ART[key];
    const ts = this.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * TEX, (height ?? a.h) * TEX, key)
      .setOrigin(0, 0).setScale(1 / TEX).setDepth(depth);
    this.strips.push({ ts, factor });
    return ts;
  }

  private buildWorld(): void {
    const x0 = -BLEED, ww = MAX_W + BLEED * 2;

    if (this.textures.exists('postcard')) {
      // the far background is a vintage postcard stuck across the top of the page
      const sky = this.add.graphics().setDepth(DEPTH.sky);
      sky.fillStyle(0x7fb0d8, 1);
      sky.fillRect(x0, -BLEED, ww, BLEED);
      this.strip('postcard', -10, 0.06, DEPTH.sky);
    } else {
      // sky: a faded blue page with printed dots thickening toward the horizon
      const sky = this.add.graphics().setDepth(DEPTH.sky);
      sky.fillGradientStyle(0x4d9fd6, 0x4d9fd6, 0xa9d8ea, 0xa9d8ea, 1);
      sky.fillRect(x0, -BLEED, ww, 210 + BLEED);
      this.strip('skydots', 0, 0, DEPTH.sky);
      img(this, 250, 66, 'sun').setDepth(DEPTH.sky + 1);

      for (let i = 0; i < 5; i++) {
        const im = img(this, (i / 5) * (MAX_W + 200) + Math.random() * 90, 26 + Math.random() * 70, 'cloud')
          .setDepth(DEPTH.sky + 2);
        im.setScale(im.scale * (0.6 + Math.random() * 0.5));
        this.props.push({ im, factor: 0.035 + Math.random() * 0.02, wrap: MAX_W + 260 });
      }
      this.strip('hills', 76, 0.1, DEPTH.far);
    }

    // the road: two strips of tarmac paper with painted lines
    this.strip('edge', 192, 0, DEPTH.far + 2);
    this.strip('asphalt', 206, 1, DEPTH.road, 184).setTint(0xeeeef6);
    this.strip('asphalt', 402, 1, DEPTH.road, 128);
    const r = this.add.graphics().setDepth(DEPTH.road);
    r.fillStyle(0xfbf6ea, 1); r.fillRect(x0, 203, ww, 3.5);        // the postcard's white bottom edge
    r.fillStyle(0x1c1820, 0.1); r.fillRect(x0, 206, ww, 92);       // the closed far lane sits a shade darker
    this.strip('asphalt', 388, 1, DEPTH.road, 14).setTint(0xa9a9b6); // median
    this.strip('line_yellow', 390.5, 1, DEPTH.road + 1);
    this.strip('line_yellow', 395.5, 1, DEPTH.road + 1);
    this.strip('line_white', 516, 1, DEPTH.road + 1);

    this.strip('rail', 207 - ART.rail.h, 1, DEPTH.road + 1);                // posts stand on the road's far edge
    this.strip('dash', 297, 1, DEPTH.road + 1);
    this.strip('dash', 452, 1, DEPTH.road + 1);
    this.strip('grass', 522, 1, DEPTH.fore);

    // cones along the closed lane
    const spacing = 190;
    const count = Math.ceil((MAX_W + 200) / spacing);
    for (let i = 0; i < count; i++) {
      const im = img(this, i * spacing + 60, 300, 'cone').setDepth(DEPTH.farCars - 2);
      this.props.push({ im, factor: 1, wrap: count * spacing });
    }

    // the wreck everyone is staring at, already behind Bill as the level starts
    this.wreck = img(this, view.W * 0.62, 292, 'wreck').setDepth(DEPTH.farCars - 1);
    this.smokeFx = this.add.particles(0, 0, 'puff', {
      speedY: { min: -120, max: -70 }, speedX: { min: -30, max: 30 }, lifespan: 1300,
      scale: { start: 0.3, end: 0.9 }, alpha: { start: 0.8, end: 0 }, frequency: 110, tint: 0xc9c5cf,
    }).setDepth(DEPTH.farCars - 1);
  }

  /** Level 1: houses, lawns and a picket fence across the street, mailboxes at the kerb. */
  private buildStreet(): void {
    const x0 = -BLEED, ww = MAX_W + BLEED * 2;
    const sky = this.add.graphics().setDepth(DEPTH.sky);
    sky.fillStyle(0x7fb0d8, 1);
    sky.fillRect(x0, -BLEED, ww, BLEED + 262);
    if (this.textures.exists('postcard')) this.strip('postcard', -10, 0.05, DEPTH.sky);
    this.strip('houses', 104, 0.6, DEPTH.far);
    this.strip('lawn', 250, 1, DEPTH.far + 1);
    this.strip('fence', 262, 1, DEPTH.far + 4);
    this.strip('sidewalk', 300, 1, DEPTH.road);
    this.strip('kerb', 346, 1, DEPTH.road + 1);
    this.strip('asphalt', 352, 1, DEPTH.road, 200);
    this.strip('line_white', 524, 1, DEPTH.road + 1);
    this.strip('grass', 528, 1, DEPTH.fore);
  }

  private setupInput(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      sound.unlock();
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      if (this.over) {
        // the results page: "play again" on the left, "levels" on the right
        if (this.canRestart) {
          if (w.x > view.W / 2) this.scene.start('levels');
          else this.scene.restart({ level: this.level.id });
        }
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
        if (this.over) { if (this.canRestart) this.scene.restart({ level: this.level.id }); } else this.trySwing();
      });
      this.keys.r.on('down', () => this.tryRage());
      this.keys.enter.on('down', () => this.tryRage());
    }
  }

  /** The level's name on a paper banner, with the brief on a strip of tape. */
  private intro(): void {
    const name = this.level.name;
    const w = Math.max(300, textWidth(name, 66) + 70), h = 92;
    makePaperArt(this, 'intro_banner', w, h, (c) => {
      tapePath(c, 0, 0, w, h);
      fillPaper(c, 'red');
      cutText(c, name, w / 2, h / 2 + 3, 66, 'yellow');
    }, { border: 3 });
    const title = img(this, view.W / 2, 150, 'intro_banner').setDepth(DEPTH.overlay).setRotation(-0.03).setAlpha(0);
    const full = title.scale;
    title.setScale(full * 0.2);
    const tape = img(this, view.W / 2, 222, 'tape_l').setDepth(DEPTH.overlay).setAlpha(0).setRotation(0.012);
    const sub = written(this, view.W / 2, 222, this.level.tagline, 21).setDepth(DEPTH.overlay).setAlpha(0).setRotation(0.012);
    this.tweens.add({ targets: title, scale: full, alpha: 1, duration: 320, ease: 'Back.out' });
    this.tweens.add({ targets: [tape, sub], alpha: 1, duration: 250, delay: 250 });
    this.tweens.add({
      targets: [title, tape, sub], alpha: 0, y: '-=30', duration: 300, delay: 2500,
      onComplete: () => { title.destroy(); tape.destroy(); sub.destroy(); this.textures.remove('intro_banner'); },
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
    this.say(pick(this.street ? PHRASES.rageStreet : PHRASES.rage).text);
    const banner = img(this, view.W / 2, 150, this.street ? 'word_extra' : 'word_roadrage').setDepth(DEPTH.overlay).setRotation(-0.04);
    const full = banner.scale;
    banner.setScale(full * 0.3);
    this.tweens.add({ targets: banner, scale: full * 1.05, duration: 60, ease: 'Back.out' });
    this.tweens.add({ targets: banner, alpha: 0, scale: full * 1.5, duration: 90, delay: 200, onComplete: () => banner.destroy() });
    this.cameras.main.zoomTo(view.RES * 1.06, 380);
  }

  /** The bat's special: one grand-slam swing that clears everything in sight. */
  private rageSlam(): void {
    this.setSlow(1);
    this.bill.rageCharge = 0;
    this.bill.startSwing();
    this.bill.markConnected();
    this.thrownId = this.bill.swingId;
    this.cameras.main.zoomTo(view.RES, 160);
    this.cameras.main.shake(380, 0.016);
    this.cameras.main.flash(160, 255, 244, 200);
    const ring = img(this, this.bill.sweetX, this.ringY, 'burst').setDepth(DEPTH.fx + 5).setScale(0.4);
    this.tweens.add({ targets: ring, scale: 5, alpha: 0, duration: 420, ease: 'Cubic.out', onComplete: () => ring.destroy() });

    const targets: { v: Vehicle; neck: NoodleNeck; d: number }[] = [];
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.innocent || n.whacked || n.passed || n.claimed) continue;
        if (n.headX > this.bill.x - 240 && n.headX < view.W + 80) targets.push({ v, neck: n, d: Math.abs(n.headX - this.bill.sweetX) });
      }
    }
    targets.sort((a, b) => a.d - b.d);
    targets.forEach((tg, i) => {
      if (this.throwing) tg.neck.claimed = true;
      this.time.delayedCall(i * 55, () => {
        if (!this.vehicles.includes(tg.v)) return;
        // a storm of papers, one for every mailbox in sight; or one almighty swing
        if (this.throwing) this.flyPaper(this.bill.handAt, () => this.doorOf(tg.neck), 0.26, (im) => { im.destroy(); this.whack(tg.v, tg.neck, 'rage'); });
        else this.whack(tg.v, tg.neck, 'rage');
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

    if (neck.innocent) {
      neck.whack(1, v.vx);
      this.combo = 0;
      this.hud.setCombo(0, 1);
      this.cash = Math.max(0, this.cash - SCORE.dogFine);
      this.hud.setCash(this.cash);
      sound.yelp();
      this.popWord(hx, hy - 40, 'badbill');
      this.popTag(hx + 6, hy + 6, `-$${SCORE.dogFine}`, '#b8372a', 0.12);
      this.say(pick(neck.kind === 'dog' ? PHRASES.dog : PHRASES.mailman).text);
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

    const delivery = neck.kind === 'post';
    sound.bonk(perfect);
    if (delivery) sound.cash(); else sound.boing(perfect ? 1.3 : 1);
    this.hitStop = q === 'rage' || delivery ? 0.02 : perfect ? 0.085 : 0.05;
    this.cameras.main.shake(perfect ? 150 : 90, (perfect ? 0.009 : 0.005) * (delivery ? 0.5 : 1));
    this.burst(hx, hy, perfect);
    this.popWord(hx + 10, hy - 52, q === 'perfect' ? 'perfect' : pick(delivery ? DELIVERY_WORDS : HIT_WORDS));
    this.popTag(hx + 38, hy - 4, `+$${gain}`, '#2f6b2b', 0.12);
    this.bill.setFace('grin', 0.5);

    if (neck.kind === 'phone') {
      const rider = v.riders.find((r) => r.neck === neck);
      const from = rider && v.dropPhone(rider);
      if (from) this.flingPhone(from.x, from.y);
      this.say(pick(PHRASES.phone).text);
    } else if (q !== 'rage' && this.combo > 0 && this.combo % 8 === 0) {
      this.say(pick(this.street ? PHRASES.comboStreet : PHRASES.combo).text);
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
    this.popWord(top.x, top.y - 24, this.street ? 'thwack' : 'clang');
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

  /** A number or note scribbled on a scrap of tape and slapped down. */
  private popTag(x: number, y: number, text: string, color: string, delay = 0): void {
    const t = written(this, 0, 0, text, 19, color);
    const tape = img(this, 0, 0, 'tape_s');
    tape.setScale(tape.scale * Math.max(0.8, (t.width + 4) / ART.tape_s.w), tape.scale);
    const c = this.add.container(x, y, [tape, t]).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.3).setScale(0.3).setAlpha(0);
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 110, delay, ease: 'Back.out' });
    this.tweens.add({ targets: c, y: y - 46, alpha: 0, duration: 380, delay: delay + 430, onComplete: () => c.destroy() });
  }

  /** A word on a jagged paper burst, slapped onto the page. */
  private popWord(x: number, y: number, word: string): void {
    const im = img(this, x, y, `word_${word}`).setDepth(DEPTH.fx + 8).setRotation((Math.random() - 0.5) * 0.36);
    const full = im.scale;
    im.setScale(full * 0.3).setAlpha(0);
    this.tweens.add({ targets: im, scale: full, alpha: 1, duration: 110, ease: 'Back.out' });
    this.tweens.add({ targets: im, y: y - 40, alpha: 0, duration: 340, delay: 480, onComplete: () => im.destroy() });
  }

  /** Turn a level's movement label into how far and how fast a head moves. */
  private motionFor(move: Move): Motion {
    const { lean, bob, restlessness } = this.level;
    return {
      x: move === 'lean' || move === 'both' ? lean : 0,
      y: move === 'bob' || move === 'both' ? bob : 0,
      speed: restlessness,
    };
  }

  /** The open end of a mailbox, where the paper goes in. */
  private doorOf(neck: NoodleNeck): Point {
    return { x: neck.headX - 16, y: neck.headY };
  }

  /** Bill lets go of a paper. Whatever is in the ring gets it: a mailbox, or
   *  (oops) the mailman. If nothing is there it lands on the pavement. */
  private throwPaper(): void {
    const sweet = this.bill.sweetX;
    let best: { v: Vehicle; n: NoodleNeck; d: number } | undefined;
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed || n.claimed) continue;
        const d = Math.abs(n.headX - sweet);
        if (d <= SWING.good && (!best || d < best.d)) best = { v, n, d };
      }
    }
    if (best) {
      const { v, n, d } = best;
      n.claimed = true;
      this.bill.markConnected();
      this.flyPaper(this.bill.handAt, () => this.doorOf(n), 0.24, (im) => {
        im.destroy();
        if (this.vehicles.includes(v)) this.whack(v, n, d <= SWING.perfect ? 'perfect' : 'good');
      });
    } else {
      // nobody home: it lands on the pavement and gets left behind
      const spot = { x: sweet - 40 + Math.random() * 50, y: STREET.kerbY - 8 + Math.random() * 10 };
      const paper = this.flyPaper(this.bill.handAt, () => spot, 0.3, (im) => {
        im.setDepth(DEPTH.road + 2).setRotation(Math.random() * 3);
        this.props.push({ im, factor: 1 });
      });
      paper.ground = spot;
    }
  }

  private flyPaper(from: Point, to: () => Point, dur: number, onLand: (im: Phaser.GameObjects.Image) => void): Paper & { ground?: Point } {
    const im = img(this, from.x, from.y, 'paper_roll').setDepth(DEPTH.fx + 1);
    const paper: Paper & { ground?: Point } = { im, from: { ...from }, to, t: 0, dur, onLand };
    this.papers.push(paper);
    return paper;
  }

  /** Move every paper in the air along its arc, and land the ones that arrive. */
  private updatePapers(dt: number, scroll: number): void {
    for (let i = this.papers.length - 1; i >= 0; i--) {
      const p = this.papers[i] as Paper & { ground?: Point };
      if (p.ground) p.ground.x -= scroll;      // a spot on the pavement slides by with the street
      p.t += dt;
      const k = Math.min(1, p.t / p.dur);
      const to = p.to();
      p.im.setPosition(
        p.from.x + (to.x - p.from.x) * k,
        p.from.y + (to.y - p.from.y) * k - Math.sin(k * Math.PI) * 46,
      );
      p.im.rotation += dt * 14;
      if (k >= 1) {
        this.papers.splice(i, 1);
        p.onLand(p.im);
      }
    }
  }

  private flingPhone(x: number, y: number): void {
    const ph = img(this, x, y, 'phone').setDepth(DEPTH.fx + 2);
    this.tweens.add({ targets: ph, x: x + 150 + Math.random() * 120, duration: 900 });
    this.tweens.add({ targets: ph, rotation: 16, duration: 900 });
    this.tweens.add({ targets: ph, y: y - 150, duration: 380, ease: 'Quad.out' });
    this.tweens.add({ targets: ph, y: 380, duration: 520, delay: 380, ease: 'Quad.in', onComplete: () => ph.destroy() });
  }

  /** Bill's speech bubble: cut from paper, with a tail toward his head. */
  private say(text: string): void {
    this.bubble?.destroy();
    const size = 26;
    const w = textWidth(text, size) + 34, h = 42, tail = 22;
    const key = `bubble_${this.bubbleSeq++}`;
    makePaperArt(this, key, w, h + tail, (c) => {
      bubblePath(c, w, h, w - 74, tail);
      fillPaper(c, 'white');
      c.font = `${size}px ${DISPLAY}`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillStyle = INK;
      c.fillText(text, w / 2, h / 2 + 1);
    }, { border: 2, ax: w - 44, ay: h + tail });
    const top = this.bill.headTop;
    const x = Math.max(w - 36, top.x - 22);
    const b = img(this, x, top.y - 6, key).setDepth(DEPTH.fx + 10);
    const full = b.scale;
    b.setScale(full * 0.3);
    this.bubble = b;
    this.tweens.add({ targets: b, scale: full, duration: 140, ease: 'Back.out' });
    this.tweens.add({
      targets: b, alpha: 0, duration: 200, delay: 1500,
      onComplete: () => { if (this.bubble === b) this.bubble = undefined; b.destroy(); this.textures.remove(key); },
    });
  }

  /** A tip written on a long strip of tape across the top of the page. */
  private hint(text: string): void {
    this.hintNote?.destroy();
    const t = written(this, 0, 0, text, 21);
    const tape = img(this, 0, 0, 'tape_l');
    tape.setScale(tape.scale * Math.max(0.5, (t.width + 34) / ART.tape_l.w), tape.scale);
    const c = this.add.container(view.W / 2, 150, [tape, t]).setDepth(DEPTH.overlay - 1).setRotation(-0.012).setScale(0.4).setAlpha(0);
    this.hintNote = c;
    this.tweens.add({ targets: c, scale: 1, alpha: 1, duration: 180, ease: 'Back.out' });
    this.tweens.add({
      targets: c, alpha: 0, duration: 250, delay: 2300,
      onComplete: () => { if (this.hintNote === c) this.hintNote = undefined; c.destroy(); },
    });
  }

  private teach(id: string, text: string): void {
    if (this.taught.has(id)) return;
    this.taught.add(id);
    this.hint(text);
  }

  // ---- spawning --------------------------------------------------------------------

  private spawnDue(): void {
    const speed = this.level.speed;
    for (let i = 0; i < this.pending.length; i++) {
      const s = this.pending[i];
      const remaining = s.t - this.levelT;
      if (s.type === 'sign' || s.type === 'branch') {
        // something to duck: it stands still, so it arrives with the scenery
        const branch = s.type === 'branch';
        if (remaining > (view.W + 110 - this.bill.x) / speed) continue;
        const x = this.bill.x + speed * remaining;
        const key = branch ? 'branch' : `sign${Math.random() < 0.5 ? 0 : 1}`;
        const im = img(this, x, HAZARD_BASE_Y[this.level.theme], key).setDepth(HAZARD_DEPTH[this.level.theme]);
        this.signs.push({ im, x, half: branch ? 46 : 34, done: false });
        this.teach('duck', branch ? 'Low branch - HOLD DUCK!' : 'Sign coming - HOLD DUCK!');
      } else {
        const roadside = s.type === 'mailbox' || s.type === 'mailbox2' || s.type === 'mailman';
        const closing = roadside ? speed : speed + SPEED.crawl;
        if (remaining > (view.W + 330 - this.bill.sweetX) / closing) continue;
        const v = new Vehicle(this, s.type, view.W + 600, speed, this.motionFor(s.move));
        const lead = roadside ? 0 : v.riders[0].slot.x - 16;
        v.x = this.bill.sweetX + closing * remaining - lead;
        v.update(0);
        this.vehicles.push(v);
        if (s.type === 'dog') this.teach('dog', "That's a good dog. DON'T hit it!");
        else if (s.type === 'mailman') this.teach('mailman', "That's the mailman. DON'T hit him!");
        else if (s.type === 'mailbox2') this.teach('swing', 'TAP to toss a paper when a mailbox reaches the ring!');
        else if (s.type === 'phone') this.teach('phone', 'Phone filmers! Knock some sense into them.');
        else if (s.type === 'bus') this.teach('bus', 'Tour bus! Four heads in a row!');
        else if (s.type === 'mailbox') this.teach('swing', 'TAP to toss a paper when a mailbox reaches the ring!');
        else this.teach('swing', 'TAP to swing when a head reaches the ring!');
        if (s.move !== 'still') this.teach('restless', "They're leaning for a better look. Watch the head!");
      }
      this.pending.splice(i, 1);
      i--;
    }
  }

  private spawnProp(dt: number): void {
    this.propT -= dt;
    if (this.propT > 0) return;
    this.propT = 1.3 + Math.random() * 2.2;
    // trees on the lawns of the street; palms and billboards along the highway
    const key = this.street || Math.random() < 0.72 ? 'palm' : `billboard${Math.random() < 0.5 ? 0 : 1}`;
    const im = img(this, view.W + 140, this.street ? 262 : 202, key).setDepth(this.street ? DEPTH.far + 2 : DEPTH.far + 1);
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

    const scroll = this.level.speed * dt;
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
    this.zone.setPosition(this.bill.sweetX, this.ringY).setRotation(this.levelT * 0.6);
    // a tap in a throwing level lets one paper go, the moment his arm comes through
    if (this.throwing && this.bill.swingLive && this.bill.swingId !== this.thrownId && !this.over) {
      this.thrownId = this.bill.swingId;
      this.throwPaper();
    }
    this.updatePapers(dt, scroll);
    this.dustFx.setPosition(this.bill.dustAt.x, this.bill.dustAt.y);

    // vehicles, swings and misses
    const sweet = this.bill.sweetX;
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];
      v.update(dt);
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed || n.claimed) continue;
        const dx = n.headX - sweet;
        const inReach = Math.abs(n.headY - LANE.headY) <= SWING.reachY;
        if (!this.throwing && this.bill.swingLive && Math.abs(dx) <= SWING.good && inReach && !this.over) {
          this.bill.markConnected();
          this.whack(v, n, Math.abs(dx) <= SWING.perfect ? 'perfect' : 'good');
        } else if (dx < -SWING.good - 26) {
          n.passed = true;
          if (this.over) continue;
          if (n.innocent) {
            this.cash += SCORE.dodge;
            this.hud.setCash(this.cash);
            this.popWord(n.headX, n.headY - 46, n.kind === 'dog' ? 'goodboy' : 'nicekid');
          } else {
            this.missed++;
            this.combo = 0;
            this.hud.setCombo(0, 1);
            this.hud.setJam(this.whacked, this.missed, this.total);
            this.popWord(n.headX, n.headY - 46, 'missed');
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
        if (dx < s.half && dx > -s.half && this.bill.exposed) {
          s.done = true;
          // a sign gets knocked askew; a tree only shudders
          const sign = s.im.texture.key.startsWith('sign');
          this.tweens.add({ targets: s.im, rotation: sign ? 0.5 : 0.06, duration: 160, ease: 'Back.out', yoyo: !sign });
          this.hurtBill();
        } else if (dx <= -s.half) {
          s.done = true;
          if (!this.bill.invulnerable) {
            this.cash += SCORE.dodge;
            this.hud.setCash(this.cash);
            sound.dodge();
            this.popWord(this.bill.x - 10, 262, 'dodged');
          }
        }
      }
      if (s.x < -120) {
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
    const lead = (this.level.speed + (this.street ? 0 : SPEED.crawl)) * SWING.windup;
    let onScreen = 0;
    for (const v of this.vehicles) {
      for (const r of v.riders) {
        const n = r.neck;
        if (n.whacked || n.passed || n.claimed) continue;
        if (n.innocent && !clumsy) continue;
        if (clumsy && Math.floor(n.headY * 7) % 3 === 0) continue;
        if (n.headX < view.W) onScreen++;
        const dx = n.headX - this.bill.sweetX;
        const inReach = clumsy || this.throwing || Math.abs(n.headY - LANE.headY) <= SWING.reachY - 5;
        if (dx < lead + (clumsy ? 40 : 8) && dx > -10 && inReach) this.trySwing();
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
    if (!this.auto) saveStars(this.level.id, stars);
    sound.stopMusic();
    this.time.delayedCall(won ? 500 : 700, () => this.showResults(won, stars, reason));
  }

  /** The results page: a sheet of paper held by photo corners. */
  private showResults(won: boolean, stars: number, reason: 'end' | 'bonked'): void {
    const W = view.W;
    if (won) sound.win(); else sound.lose();
    const veil = this.add.rectangle(W / 2, H / 2, MAX_W * 2, H * 2, 0x14121a, 0.55).setDepth(DEPTH.overlay).setAlpha(0);
    this.tweens.add({ targets: veil, alpha: 1, duration: 250 });

    const pw = 560, ph = 396, px = W / 2, py = H / 2 + 6;
    const title = won ? this.level.words.cleared : reason === 'bonked' ? "BILL'S HAD ENOUGH" : this.level.words.lost;
    makePaperArt(this, 'results_page', pw, ph, (c) => {
      c.beginPath();
      c.rect(0, 0, pw, ph);
      fillPaper(c, 'cream');
      glued(c, () => {
        for (const [x, y, sx, sy] of [[0, 0, 1, 1], [pw, 0, -1, 1], [0, ph, 1, -1], [pw, ph, -1, -1]]) {
          c.beginPath();
          c.moveTo(x, y); c.lineTo(x + 34 * sx, y); c.lineTo(x, y + 34 * sy);
          c.closePath();
          fillPaper(c, 'black');
        }
      });
      cutText(c, title, pw / 2, 52, title.length > 18 ? 40 : title.length > 13 ? 50 : 60, won ? 'red' : 'blue');
    }, { border: 0 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.textures.remove('results_page'));
    const d = DEPTH.overlay + 2;
    img(this, px, py, 'results_page').setDepth(d - 1).setRotation(-0.008);

    for (let i = 0; i < 3; i++) {
      const on = i < stars;
      const s = img(this, px - 92 + i * 92, py - 76 + (i === 1 ? -8 : 0), on ? 'star_big' : 'star_big_off').setDepth(d).setRotation((i - 1) * 0.12);
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
      [this.level.words.counted, `${this.whacked} / ${this.total}  (${pct}%)`],
      ['Perfect hits', `${this.perfects}`],
      ['Best combo', `${this.bestCombo}`],
      ['Cash earned', `$${this.cash}`],
    ];
    rows.forEach(([k, v], i) => {
      const y = py + 2 + i * 33;
      written(this, px - 222, y, k, 21).setOrigin(0, 0.5).setDepth(d);
      written(this, px + 222, y, v, 21, '#b8372a').setOrigin(1, 0.5).setDepth(d);
    });
    if (!won && reason === 'end') {
      written(this, px, py - 24, `Need ${Math.round(SCORE.passStars[0] * 100)}% to pass`, 16, '#7a6a58').setDepth(d);
    }

    const face = this.add.image(px - pw / 2 + 12, py - ph / 2 + 30, won ? 'bill-grin' : 'bill-glare').setDepth(d + 1).setRotation(-0.22);
    face.setScale(121 / HEAD_SRC_H);

    // two notes on tape: play it again (left), or back to the levels (right)
    const note = (x: number, text: string) => {
      const t = written(this, 0, 0, text, 20);
      const tape = img(this, 0, 0, 'tape_m');
      tape.setScale(tape.scale * 1.05, tape.scale * 1.1);
      return this.add.container(x, py + 158, [tape, t]).setDepth(d + 1).setAlpha(0).setRotation(x < px ? -0.02 : 0.02);
    };
    const notes = [note(px - 118, 'PLAY AGAIN'), note(px + 118, 'LEVELS')];
    this.time.delayedCall(1100, () => {
      this.canRestart = true;
      notes.forEach((n) => n.setAlpha(1));
      this.tweens.add({ targets: notes, y: '-=5', duration: 420, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    });
  }
}
