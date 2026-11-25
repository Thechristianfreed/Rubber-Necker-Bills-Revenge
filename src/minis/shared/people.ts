import Phaser from 'phaser';
import { TEX } from '../../config';
import { applyArt, img } from '../../art/sticker';
import { CAST } from '../../data/cast';

/** The people, and the faces they pull. Everybody in the family has one set of
 *  looks, cut the same way (tools/make_cast.py): every head is the same size and
 *  hangs from the same point, the chin with the mouth shut. So a head is put on
 *  any body with one call, and its look is changed with another, and it does not
 *  jump or change size when it is.
 *
 *      const chad = head(scene, 'chad', 'calm', x, neckY, 62).setDepth(12);
 *      setLook(chad, 'chad', 'guilty');
 *
 *  Who there is, and which looks each of them has, is in docs/characters.md, and
 *  there is a picture of every face in docs/catalogue. The faces are called
 *  `face_<who>_<look>`: `face('chad', 'guilty')` gives the name, for img() and
 *  applyArt().
 *
 *  Besides the fifteen, each person has faces of their own, made for one game or
 *  another before there was a set (Shane's doe eyes, Stephanie holding her
 *  breath). They are in the set too, the same size and hung the same way, and are
 *  asked for by name like any other: `head(scene, 'shane', 'doe', x, y)`.
 *  `ownLooks('shane')` lists them.
 *
 *  These are for using, not for changing. A face seen close up (bigger than
 *  about twice FACE) wants a bigger copy: a game makes one in its own PIECES,
 *  from the same file (`face-chad-guilty.png`), under a name of its own. */

/** The fifteen looks. Not everybody has every one yet: face() gives the nearest. */
export const LOOKS = ['calm', 'talking', 'smile', 'laugh', 'smug', 'angry', 'yell', 'shocked', 'guilty', 'worried', 'cry', 'ouch', 'dazed',
  'disgusted', 'asleep'] as const;
export type Look = (typeof LOOKS)[number];

/** How tall a head is as it comes, from the top of the hair to the chin. */
export const FACE = 80;

/** What to show where somebody has not got a look: the nearest they have, best first. */
const NEAREST: Record<Look, Look[]> = {
  calm: ['smug', 'smile', 'talking'],
  talking: ['calm', 'smile', 'laugh'],
  smile: ['laugh', 'smug', 'calm'],
  laugh: ['smile', 'talking'],
  smug: ['smile', 'calm'],
  angry: ['yell', 'disgusted', 'calm'],
  yell: ['angry', 'shocked', 'talking'],
  shocked: ['yell', 'worried', 'guilty'],
  guilty: ['worried', 'shocked', 'calm'],
  worried: ['guilty', 'cry', 'calm'],
  cry: ['worried', 'ouch', 'yell'],
  ouch: ['cry', 'disgusted', 'dazed'],
  dazed: ['asleep', 'calm', 'ouch'],
  disgusted: ['angry', 'ouch'],
  asleep: ['dazed', 'calm'],
};

/** How tall somebody's look is, in heads: more than one where the mouth is wide open, or the hair hangs below the chin. */
export function headsTall(who: string, look: string): number {
  return CAST[who][face(who, look).split('_').pop()!].tall;
}

/** Every look somebody has: those of the fifteen they have, and then the ones that are only theirs. */
export function looksOf(who: string): string[] {
  return Object.keys(CAST[who] ?? {});
}

/** The faces that are only this person's: not one of the fifteen. */
export function ownLooks(who: string): string[] {
  return looksOf(who).filter((look) => !(LOOKS as readonly string[]).includes(look));
}

/** Everybody who has faces. */
export const PEOPLE: string[] = Object.keys(CAST);

/** Whether somebody has this look themselves (and not just the nearest thing to it). */
export function hasLook(who: string, look: string): boolean {
  return !!CAST[who]?.[look];
}

/** The name of somebody's face. `look` is one of the fifteen (and where they have not got
 *  that one, they give the nearest they have), or one of that person's own. */
export function face(who: string, look: Look | (string & {})): string {
  const looks = CAST[who];
  if (!looks) throw new Error(`nobody called "${who}" has faces yet: docs/characters.md says who has`);
  if (looks[look]) return `face_${who}_${look}`;
  const near = NEAREST[look as Look];
  if (!near) console.error(`${who} has no face called "${look}": docs/characters.md lists the ones there are`);
  const found = [...(near ?? []), ...LOOKS].find((l) => looks[l]);
  return `face_${who}_${found}`;
}

/** Somebody's head, with its chin at (x, y), `tall` from the top of the hair to the chin. */
export function head(scene: Phaser.Scene, who: string, look: Look | (string & {}), x: number, y: number, tall = FACE): Phaser.GameObjects.Image {
  return img(scene, x, y, face(who, look)).setScale(tall / FACE / TEX);
}

/** Change the look on a head that is already there. It keeps its place, its size, its tilt and which way it faces. */
export function setLook(image: Phaser.GameObjects.Image, who: string, look: Look | (string & {})): void {
  const { scaleX, scaleY } = image;
  applyArt(image, face(who, look));
  image.setScale(scaleX, scaleY);
}
