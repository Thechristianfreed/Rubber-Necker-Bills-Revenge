import { CAST } from '../../data/cast';
import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { HomecomingMini } from './HomecomingMini';
import { DOOR_FACE, LUNGE } from './layout';

/** Mammy's face, close up: the two she pulls in the doorway, from the same files as
 *  everybody's set but big enough to fill the page (each is hung by its chin, as in the set). */
const close = (look: string): Piece => {
  const f = CAST.mammy[look];
  return { key: `homecoming_mammy_big_${look}`, file: f.file, h: DOOR_FACE * LUNGE * f.tall, border: 3.4, anchor: f.chin };
};

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py), or among the common pictures.
 *  Every key starts with "homecoming_". */
const PIECES: Piece[] = [
  close('angry'),
  close('yell'),
];

/** Pappy comes home: three keys at the front door, Mammy behind it, and the only thing that appeases her. */
export const homecoming: MiniGame = { id: 'homecoming', make: (host) => new HomecomingMini(host), art: buildArt, pieces: PIECES };
