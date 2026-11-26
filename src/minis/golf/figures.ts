import Phaser from 'phaser';
import { TEX } from '../../config';
import { CHAD, SHANE } from '../../art/bat';
import { FROM, applyArt, img } from '../../art/sticker';
import { Point } from '../Mini';
import { FACE, face } from '../shared/people';
import { chinOf } from '../shared/yard';
import { GOLF_BODIES } from './cuts';
import { BIG_CHIN, BILL_GOLF, CHAD_GOLF, KID_CHIN, Swing, dollChin } from './poses';

type Image = Phaser.GameObjects.Image;

/** How tall the boys' heads are, hair to chin, and how much bigger than their pictures
 *  the boys are drawn: both as in the back yard (shared/yard.ts), so that they are the
 *  same boys here. Bill's are a grown man's. */
export const KID_FACE = 62;
export const KID_SIZE = 1.3;
export const BILL_FACE = 74;
export const BILL_SIZE = 1.12;

/** Where a head goes on a body: the chin, from the spot the body stands on, and how far the head tips. */
interface Chin { x: number; y: number; tilt: number }

/** Somebody in this game: a body in a pose, and one of that person's faces hung on it
 *  by the chin (shared/people.ts). The body is either one made for this game
 *  (`golf_chad_back`: a photo of the pose with the head taken off, or the paper doll that
 *  stands in for it if the photo cannot be had) or one the brothers already have from
 *  the back yard (`chad_stand`, `shane_good`), used as it is.
 *
 *  Chad's photos have the club in them: there is a set with the driver and a set with the
 *  7 iron (`golf_chad_back_iron`). The paper doll is handed a paper club instead.
 *
 *  Everybody is drawn facing right; `turn(-1)` faces them left. */
export class Figure {
  readonly box: Phaser.GameObjects.Container;
  private readonly body: Image;
  private readonly head: Image;
  /** The club in his hands, where the body is a paper doll (a photo has its own). */
  private club?: Image;
  private clubKey = 'golf_club_driver';
  private iron = false;
  private way = 1;
  pose = '';
  look = '';

  constructor(private readonly scene: Phaser.Scene, readonly who: 'chad' | 'shane' | 'bill', pose: string, look: string, private readonly size = who === 'bill' ? BILL_SIZE : KID_SIZE) {
    this.body = img(scene, 0, 0, this.bodyKey(pose));
    this.head = img(scene, 0, 0, this.faceKey(look));
    this.box = scene.add.container(0, 0, [this.body, this.head]).setScale(size);
    this.set(pose, look);
  }

  private get tall(): number {
    return this.who === 'bill' ? BILL_FACE : KID_FACE;
  }

  /** The picture of a pose: this game's own if it has one (with the iron in it, if that is
   *  the club he has), otherwise the one from the back yard. */
  private bodyKey(pose: string): string {
    const own = `golf_${this.who}_${pose}`;
    if (this.iron && this.scene.textures.exists(`${own}_iron`)) return `${own}_iron`;
    return this.scene.textures.exists(own) ? own : `${this.who}_${pose}`;
  }

  /** The picture of a look: his photo face, or (if the photos could not be had) a paper one. */
  private faceKey(look: string): string {
    const key = face(this.who, look);
    return this.scene.textures.exists(key) ? key : `golf_head_${this.who}`;
  }

  private chin(pose: string): Chin {
    // (where the photo of the pose has it, if it is the photo that is on the page)
    const key = this.bodyKey(pose), cut = FROM[key] ? GOLF_BODIES[key.slice(5)] : undefined;
    if (cut) return { x: cut.chin[0], y: cut.chin[1], tilt: cut.tilt };
    if (this.who === 'bill') return dollChin(BILL_GOLF[pose], BIG_CHIN);
    if (this.who === 'chad' && CHAD_GOLF[pose]) return dollChin(CHAD_GOLF[pose], KID_CHIN);
    return chinOf(this.who, pose, this.who === 'chad' ? CHAD : SHANE);
  }

  /** Strike a pose (and, if one is given, pull a face). */
  set(pose: string, look = this.look): void {
    this.pose = pose;
    this.look = look;
    applyArt(this.body, this.bodyKey(pose));
    const at = this.chin(pose);
    applyArt(this.head, this.faceKey(look));
    this.head.setScale(this.tall / FACE / TEX).setPosition(at.x, at.y).setRotation(at.tilt);
    const swing: Swing | undefined = this.who === 'chad' && !FROM[this.bodyKey(pose)] ? CHAD_GOLF[pose] : undefined;
    if (this.club) {
      this.club.setVisible(!!swing);
      if (swing) {
        applyArt(this.club, this.clubKey);
        this.club.setPosition(swing.grip[0], swing.grip[1]).setRotation(swing.club);
        if (swing.behind) this.box.sendToBack(this.club);
        else this.box.moveTo(this.club, 1);
      }
    }
  }

  face(look: string): void {
    if (look !== this.look) this.set(this.pose, look);
  }

  /** Put a club in his hands: the driver, or the 7 iron. */
  hold(key: string): void {
    this.clubKey = key;
    this.iron = key === 'golf_club_iron';
    if (!this.club) {
      this.club = img(this.scene, 0, 0, key);
      this.box.addAt(this.club, 0);
    }
    this.set(this.pose);
  }

  turn(way: number): void {
    this.way = way < 0 ? -1 : 1;
    this.box.setScale(this.way * this.size, this.size);
  }

  /** Where his mouth is on the page, for anything he says to come from. */
  get mouth(): Point {
    return { x: this.box.x + this.head.x * this.way * this.size, y: this.box.y + (this.head.y - this.tall * 0.27) * this.size };
  }

  /** The top of his head. */
  get top(): Point {
    return { x: this.box.x + this.head.x * this.way * this.size, y: this.box.y + (this.head.y - this.tall - 2) * this.size };
  }
}
