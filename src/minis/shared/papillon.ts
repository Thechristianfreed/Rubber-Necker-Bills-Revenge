import Phaser from 'phaser';
import { MAX_W, TEX, view } from '../../config';
import { BLEED } from '../../art/finish';
import { ART, FROM, applyArt, img } from '../../art/sticker';
import { bubble } from '../../ui/bubble';
import { Point } from '../Mini';
import { ROOM_FIT, WAITER_FIT } from '../papillon/cut';
import { Look, head, setLook } from './people';

/** Le Papillon, the fancy restaurant, and who is in it: what the quick games
 *  set there have in common (the ordering, the vegetables, the anniversary).
 *
 *  Its pictures are the ordering game's (`papillon_...`, drawn in
 *  src/minis/papillon/art.ts, where photos take their places): the other games
 *  use them as they are. Laid like any other place: the room behind (depths 1
 *  to 6), then chairs, people, the table in front of them, and what stands on
 *  it.
 *
 *      layPapillon(scene);
 *      setTable(scene, view.W / 2);
 *      const bill = new Diner(scene, 'bill', view.W / 2 - 200, 'calm');
 *      onTable(scene, 'papillon_candle', view.W / 2);
 *      bill.set('smug');
 */

type Scene = Phaser.Scene;
type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;

export const PAPILLON = {
  /** Where the wall stops and the panelling starts, and where the carpet starts. */
  rail: 300,
  floor: 462,
  /** The far edge of the table top; its near edge, where the cloth turns down, is 30 below. */
  table: 392,
  /** Where somebody sitting at the table has their chin, and how tall their head is. */
  chin: 300,
  head: 92,
  /** Where the waiter's feet are. */
  feet: 512,
};

/** What is drawn at which depth. */
export const LAYER = { chair: 8, diner: 10, waiter: 14, table: 16, onTable: 18, held: 22 };

function strip(scene: Scene, key: string, y: number, tall: number, depth: number): void {
  const d = ART[key].tex ?? TEX;
  scene.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * d, tall * d, key).setOrigin(0, 0).setScale(1 / d).setDepth(depth);
}

/** The room: wallpaper, panelling, carpet, lamps, butterflies under glass, and its name on a
 *  board. `bare` leaves the board off (for a game that wants the wall clear).
 *
 *  It is one photo of the whole room, with its own lamps and frames in it, put in the middle
 *  of the page; or, if the photo is not there, the same made of paper (and then `bare` leaves
 *  the paper frames off as well). */
export function layPapillon(scene: Scene, bare = false): void {
  const W = view.W, P = PAPILLON;
  if (scene.textures.exists('papillon_room')) {
    scene.add.image(W / 2, ROOM_FIT.top, 'papillon_room').setOrigin(0.5, 0).setScale(1 / (ART.papillon_room.tex ?? TEX)).setDepth(1);
  } else {
    strip(scene, 'papillon_wall', -BLEED, P.rail + BLEED, 1);
    strip(scene, 'papillon_panel', P.rail, ART.papillon_panel.h, 2);
    strip(scene, 'papillon_floor', P.floor, 120, 3);
    for (const x of [W * 0.2, W * 0.8]) {
      scene.add.image(x, 150, 'papillon_glow').setScale(1.5 / TEX).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      img(scene, x, 156, 'papillon_sconce').setDepth(5);
    }
    if (!bare) {
      // (up out of the way of whoever is sitting under them)
      const frames = W > 1040 ? [0.06, 0.335, 0.665, 0.94] : [0.065, 0.935];
      frames.forEach((k, i) => img(scene, W * k, 112 + (i % 2) * 6, `papillon_frame${i % 4}`).setDepth(5).setRotation(i % 2 ? 0.025 : -0.025));
    }
  }
  if (!bare) img(scene, W / 2, 34, 'papillon_sign').setDepth(5);
}

/** The table, its middle at `x`: for two or three, or (`long`) for the whole family. */
export function setTable(scene: Scene, x: number, long = false): Image {
  return img(scene, x, PAPILLON.table, long ? 'papillon_table_long' : 'papillon_table').setDepth(LAYER.table);
}

/** Stand something on the table at `x` (and `back` nearer its far edge). */
export function onTable(scene: Scene, key: string, x: number, back = 0): Image {
  return img(scene, x, PAPILLON.table + 20 - back, key).setDepth(LAYER.onTable - back / 100);
}

/** How far below their chin somebody is sat: they lean from there. */
const SEAT = 130;

/** Somebody sitting at the table: a body dressed for dinner, their head hung on it by the
 *  chin, and the chair they are in. `set` changes their look; `lean` tips them from the seat. */
export class Diner {
  readonly box: Box;
  readonly head: Image;
  readonly body: Image;
  readonly chair?: Image;
  look: string;
  /** How big they are drawn (a child is smaller), and how tall their head is. */
  private readonly size: number;
  private readonly tall: number;

  constructor(scene: Scene, readonly who: string, x: number, look: Look | (string & {}) = 'calm', opts: { size?: number; chin?: number; chair?: boolean; body?: string; head?: number } = {}) {
    this.size = opts.size ?? 1;
    this.tall = opts.head ?? PAPILLON.head;
    this.look = look;
    const chin = opts.chin ?? PAPILLON.chin;
    if (opts.chair !== false) this.chair = img(scene, x, chin - 28 * this.size, 'papillon_chair').setDepth(LAYER.chair).setScale(this.size / TEX);
    this.body = img(scene, 0, -SEAT, opts.body ?? `papillon_sit_${who}`);
    this.head = head(scene, who, look, 0, -SEAT, this.tall / this.size);
    this.box = scene.add.container(x, chin + SEAT * this.size, [this.body, this.head]).setScale(this.size).setDepth(LAYER.diner);
  }

  set(look: Look | (string & {})): void {
    if (look === this.look) return;
    this.look = look;
    setLook(this.head, this.who, look);
  }

  /** Tip over to one side (in radians), from the seat. */
  lean(angle: number): void {
    this.box.setRotation(angle);
  }

  private at(up: number): Point {
    const r = this.box.rotation, d = (SEAT + up) * this.size;
    return { x: this.box.x + Math.sin(r) * d, y: this.box.y - Math.cos(r) * d };
  }

  /** Where their chin, their mouth and the top of their head are on the page. */
  get chin(): Point {
    return this.at(0);
  }

  get mouth(): Point {
    return this.at((this.tall / this.size) * 0.25);
  }

  get top(): Point {
    return this.at(this.tall / this.size + 2);
  }

  get x(): number {
    return this.box.x;
  }
}

/** Where things are on the waiter, from the floor under him, facing right: as he is drawn on
 *  paper. (In the photos he is somebody else, with his hand somewhere else: cut.py says where.) */
const PAPER_WAITER = { hand: { x: 86, y: -212 }, mouth: { x: 4, y: -268 }, top: { x: 2, y: -306 } };

/** The waiter. He faces right until he is turned; `serve` puts a hand out flat, for a tray. */
export class Waiter {
  readonly im: Image;
  private way = 1;
  serving = false;

  constructor(scene: Scene, x: number, y = PAPILLON.feet) {
    this.im = img(scene, x, y, 'papillon_waiter').setDepth(LAYER.waiter);
  }

  serve(on: boolean): void {
    this.serving = on;
    applyArt(this.im, on ? 'papillon_waiter_serve' : 'papillon_waiter');
    this.im.setScale(this.way / TEX, 1 / TEX);
  }

  turn(way: number): void {
    this.way = way;
    this.im.setScale(way / TEX, 1 / TEX);
  }

  /** Where one of his spots is on the page: from the photo he is drawn from, or the paper. */
  private at(spot: 'hand' | 'mouth' | 'top'): Point {
    const photo = FROM.papillon_waiter ? { ...WAITER_FIT.serve, ...(this.serving ? {} : WAITER_FIT.stand) } : PAPER_WAITER;
    return { x: this.im.x + photo[spot].x * this.way, y: this.im.y + photo[spot].y };
  }

  /** The spot on his hand that a tray sits on (when he has it out: `serve`). */
  get hand(): Point {
    return this.at('hand');
  }

  get mouth(): Point {
    return this.at('mouth');
  }

  get top(): Point {
    return this.at('top');
  }

  get x(): number {
    return this.im.x;
  }
}

/** What is being said, on scraps of paper, and for how much longer. One of these to a game:
 *  `say` puts a line up beside whoever says it, `update` (every frame) takes each away when
 *  its time is up, `hush` takes them all away now. */
export class Talk {
  /** (the tests read this: tools/test/lib.cjs, `said('...')`) */
  said: { box: Box; left: number; text: string }[] = [];

  constructor(private readonly scene: Scene) {}

  /** `who` says `text` for `secs`: on a scrap `dx` across and `dy` up from their mouth (kept on the page). */
  say(who: { mouth: Point }, text: string, secs: number, dx: number, dy: number, size = 19): Box {
    const m = who.mouth, W = view.W;
    const box = bubble(this.scene, Phaser.Math.Clamp(m.x + dx, 112, W - 112), Math.max(64, m.y + dy), text, m, size);
    this.said.push({ box, left: secs, text });
    return box;
  }

  /** Whether anybody is saying something with this in it (for the tests). */
  saying(part: string): boolean {
    return this.said.some((b) => b.text.includes(part));
  }

  hush(): void {
    for (const b of this.said) b.box.destroy();
    this.said = [];
  }

  update(dt: number): void {
    for (const b of this.said) {
      b.left -= dt;
      if (b.left <= 0) b.box.destroy();
    }
    this.said = this.said.filter((b) => b.left > 0);
  }
}
