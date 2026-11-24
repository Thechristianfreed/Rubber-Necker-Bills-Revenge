import Phaser from 'phaser';
import { H, MAX_W, TEX, view } from '../config';
import { KID_FACE, KID_HEAD } from '../art/bat';
import { Doll } from '../art/fight';
import { BLEED } from '../art/finish';
import { ART, applyArt, img } from '../art/sticker';
import { BAT_FACES } from '../data/bat';
import { BAT_BODIES, BAT_DOOR, BAT_YARD } from '../data/batbodies';
import { Point } from './Mini';

type Image = Phaser.GameObjects.Image;
type Box = Phaser.GameObjects.Container;

/** The brothers' back yard, and who is in it: what the quick games set there
 *  (the bat, the sandbox) have in common. */

/** Where the grass is underfoot. */
export const FLOOR = 436;
/** The boys are drawn this much bigger than their pictures, so that they can be seen from the couch. */
export const KID_SIZE = 1.3;
/** How fast the sky drifts when nobody is running. */
const DRIFT = 6;
/** The back doorstep, where their mother stands: how high it is (the photo of the house has a
 *  step up to it, and its ground a little nearer than the boys'), and where her chin is from there. */
export const DOORSTEP = BAT_DOOR ? FLOOR + 30 - BAT_DOOR.house.drop : FLOOR - 4;
export const MOM_SIZE = 1.15;
export const MOM_CHIN = BAT_DOOR ? { x: BAT_DOOR.mom.chin[0], y: BAT_DOOR.mom.chin[1] } : { x: 0, y: -198 };

/** Where somebody's chin is in a pose, from the spot they stand on, and how far their head
 *  tips: from the photo of the pose, or from the paper doll if there is none. */
export function chinOf(who: string, pose: string, dolls: Record<string, Doll>): { x: number; y: number; tilt: number; over: boolean } {
  const photo = BAT_BODIES[who]?.[pose];
  if (photo) return { x: photo.chin[0], y: photo.chin[1], tilt: photo.tilt, over: !!photo.over };
  const p = dolls[pose];
  return { x: p.head[0] - Math.sin(p.tilt) * KID_HEAD, y: p.head[1] + Math.cos(p.tilt) * KID_HEAD, tilt: p.tilt, over: false };
}

/** How tall somebody's head is, hair to chin: a photo of him, or a paper one. */
export function headTall(who: string): number {
  return BAT_FACES[who] ? KID_FACE : KID_HEAD * 2;
}

/** One of the brothers: a body, and a head hung on it by the chin. Everything
 *  is drawn facing right; `turn(-1)` faces him left. His body is a photo of a
 *  small boy in the pose (and of the bat, if he has it); or, with no photo, a
 *  paper doll, and then Chad's bat is a piece of its own in one hand. */
export class Kid {
  readonly box: Box;
  private readonly body: Image;
  private readonly head: Image;
  private readonly bat?: Image;
  /** How tall his head is, hair to chin. */
  private readonly tall: number;
  pose = '';
  look = '';

  constructor(scene: Phaser.Scene, private readonly who: string, private readonly poses: Record<string, Doll>, pose: string, look: string, bat = false) {
    this.body = img(scene, 0, 0, `${who}_${pose}`);
    this.head = img(scene, 0, 0, `${who}head_${look}`);
    this.tall = headTall(who);
    const parts: Image[] = [this.body, this.head];
    if (bat && !BAT_BODIES[who]) {
      this.bat = img(scene, 0, 0, 'bat').setVisible(false);
      parts.splice(1, 0, this.bat);
    }
    this.box = scene.add.container(0, 0, parts).setScale(KID_SIZE);
    this.set(pose, look);
  }

  /** Strike a pose (and, if one is given, pull a face). */
  set(pose: string, look = this.look): void {
    this.pose = pose;
    this.look = look;
    applyArt(this.body, `${this.who}_${pose}`);
    applyArt(this.head, `${this.who}head_${look}`);
    const chin = chinOf(this.who, pose, this.poses);
    this.head.setPosition(chin.x, chin.y).setRotation(chin.tilt);
    // with the bat up in front of his face, he is laid over his head and not under it
    this.box.bringToTop(chin.over ? this.body : this.head);
    if (this.bat) this.bat.setPosition(this.poses[pose].hands[1][0], this.poses[pose].hands[1][1]);
  }

  face(look: string): void {
    if (look !== this.look) this.set(this.pose, look);
  }

  turn(way: number): void {
    this.box.setScale(way * KID_SIZE, KID_SIZE);
  }

  /** The paper bat: he has it from now on; which way it points; and whether it is behind his back. */
  arm(): void {
    this.bat?.setVisible(true);
  }

  swingBat(turn: number): void {
    this.bat?.setRotation(turn);
  }

  batBehind(behind: boolean): void {
    if (!this.bat) return;
    if (behind) this.box.sendToBack(this.bat);
    else this.box.moveTo(this.bat, 1);
  }

  /** Where his mouth is on the page, for anything he says to come from. */
  get mouth(): Point {
    return { x: this.box.x + this.head.x * this.box.scaleX, y: this.box.y + (this.head.y - this.tall * 0.27) * KID_SIZE };
  }

  /** The top of his head. */
  get top(): Point {
    return { x: this.box.x + this.head.x * this.box.scaleX, y: this.box.y + (this.head.y - this.tall - 2) * KID_SIZE };
  }
}

/** A strip of the yard that can go by: how much of the speed it takes, and how fast it drifts by itself. */
export interface Strip { ts: Phaser.GameObjects.TileSprite; share: number; drift: number; tex: number }

/** Lay the yard out: the photo of it (the sky, and the fence and the grass in front), or
 *  paper if there is none. Returns its strips, and the paper clouds, for whoever wants them
 *  to move. */
export function layYard(scene: Phaser.Scene): { strips: Strip[]; clouds: Image[] } {
  const W = view.W, strips: Strip[] = [], clouds: Image[] = [];
  const strip = (key: string, y: number, tall: number, depth: number, share: number, drift = 0) => {
    const tex = ART[key].tex ?? TEX;
    const ts = scene.add.tileSprite(-BLEED, y, (MAX_W + BLEED * 2) * tex, tall * tex, key).setOrigin(0, 0).setScale(1 / tex).setDepth(depth);
    strips.push({ ts, share, drift, tex });
  };
  if (BAT_YARD && scene.textures.exists('yard_ground')) {
    strip('yard_sky_photo', BAT_YARD.skyTop, BAT_YARD.skyTall, 1, 0.03, DRIFT);
    strip('yard_ground', BAT_YARD.groundTop, BAT_YARD.groundTall, 2, 1);
  } else {
    strip('yard_sky', -BLEED, FLOOR + BLEED, 1, 0);
    img(scene, W - 74, 96, 'yard_sun').setDepth(1.5);
    for (const [x, y] of [[W * 0.3, 112], [W * 0.56, 150]]) clouds.push(img(scene, x, y, 'yard_cloud').setDepth(1.6));
    strip('yard_fence', FLOOR - 178, ART.yard_fence.h, 2, 1);
    strip('yard_grass', FLOOR - 32, H - FLOOR + 32 + BLEED, 3, 1);
  }
  return { strips, clouds };
}

/** The back of the house, with its door at `x`. */
export function raiseHouse(scene: Phaser.Scene, x: number): Image {
  const house = img(scene, x, BAT_DOOR ? DOORSTEP : FLOOR + 2, 'yard_house').setDepth(6);
  if (!BAT_DOOR) house.setScale(house.scale * 1.14);
  return house;
}

/** Their mother, on the doorstep, hands on hips: not to be seen until she is wanted. */
export function standMom(scene: Phaser.Scene): { box: Box; head: Image } {
  const head = img(scene, MOM_CHIN.x, MOM_CHIN.y, 'mom_hold');
  const box = scene.add.container(0, DOORSTEP, [img(scene, 0, 0, 'batmom_akimbo'), head]).setDepth(8).setVisible(false);
  return { box, head };
}

/** Where her mouth is when she stands at `x`, with her feet at `y`. */
export function momMouth(x: number, y = DOORSTEP): Point {
  return { x: x + MOM_CHIN.x * MOM_SIZE, y: y + MOM_CHIN.y * MOM_SIZE - 20 };
}
