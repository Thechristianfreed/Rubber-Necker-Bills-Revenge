import Phaser from 'phaser';
import { cutText } from '../../art/paper';
import { makePhotoTile } from '../../art/sticker';
import { CAST } from '../../data/cast';
import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { CUT } from './cut';
import { HomecomingMini } from './HomecomingMini';
import { DOOR_FACE, DOOR_WIDE, LUNGE, PORCH_TALL } from './layout';

/** Mammy's face, close up: the two she pulls in the doorway, from the same files as
 *  everybody's set but big enough to fill the page (each is hung by its chin, as in the set). */
const close = (look: string): Piece => {
  const f = CAST.mammy[look];
  return { key: `homecoming_mammy_big_${look}`, file: f.file, h: DOOR_FACE * LUNGE * f.tall, border: 3.4, anchor: f.chin };
};

/** A body with its head off: as tall as cut.py says, and held by the spot it stands (or kneels) on. */
const body = ([name, b]: [string, { h: number; at: number[] }]): Piece => (
  { key: `homecoming_${name}`, file: `${name.replace('_', '-')}.png`, h: b.h, border: 2.5, anchor: b.at as [number, number] }
);

/** How long a key is drawn, from the hole it hangs by to its tip (the paper ones are the same). */
const KEY_LONG = 160;
const key = (k: { hole: number[] }, i: number): Piece => (
  { key: `homecoming_key${i}`, file: `key${i}.png`, h: KEY_LONG / (1 - k.hole[1]), border: 2.2, anchor: k.hole as [number, number] }
);

/** The ring is as much smaller than its picture as the keys are; what is written on its tag runs
 *  along the tag, which hangs down in the picture and out to one side in the game. */
const RING_TALL = 196;
const ring: Piece = {
  key: 'homecoming_ring', file: 'ring.png', h: RING_TALL, border: 2.2, anchor: CUT.ring.centre as [number, number],
  decorate: (c, w, h) => {
    const [x0, y0, x1, y1] = CUT.ring.tag;
    c.translate(((x0 + x1) / 2) * w, ((y0 + y1) / 2) * h);
    c.rotate(-Math.PI / 2);
    cutText(c, '#1 PAPPY', 0, 1, 13, 'red');
  },
};

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py), or among the common pictures.
 *  Every key starts with "homecoming_". */
const PIECES: Piece[] = [
  close('angry'),
  close('yell'),
  ...Object.entries(CUT.bodies).map(body),
  // Pappy from behind, held by the foot of the picture; his hand, by the tip of the key
  { key: 'homecoming_pappy_back', file: 'pappy-back.png', w: 470, border: 2.6, anchor: [0.5, 1] },
  { key: 'homecoming_hand_key', file: 'hand-key.png', w: 216, border: 2.4, anchor: CUT.hand.tip as [number, number] },
  ring,
  ...CUT.keys.map(key),
  // the front door, shut: as wide as the doorway in the photo of the house, and held by its hinges
  { key: 'homecoming_door', file: 'door.png', w: DOOR_WIDE, border: 0, anchor: [1, 1] },
  // ...and from inside, open on the night
  { key: 'homecoming_door_in', file: 'door-in.png', h: 352, border: 2.2, anchor: [0.5, 1] },
];

/** The front of the house is one photo, door open: the whole of the place at the start. */
function photos(scene: Phaser.Scene, loaded: Map<string, HTMLImageElement>): void {
  const porch = loaded.get('porch.jpg');
  if (porch) makePhotoTile(scene, 'homecoming_porch', porch, PORCH_TALL, true);
}

/** Pappy comes home: three keys at the front door, Mammy behind it, and the only thing that appeases her. */
export const homecoming: MiniGame = {
  id: 'homecoming', make: (host) => new HomecomingMini(host), art: buildArt, pieces: PIECES, files: ['porch.jpg'], photos,
};
