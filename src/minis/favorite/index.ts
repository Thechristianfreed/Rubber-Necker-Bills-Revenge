import { MiniGame, Piece } from '../kit';
import { BOTTLE, buildArt } from './art';
import { FavoriteMini } from './FavoriteMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "favorite_". */
const PIECES: Piece[] = [
  // the bottle (the owner's picture of it), and the same bottle emptied: held by the foot
  { key: 'favorite_bottle', file: 'bottle.png', h: BOTTLE.h, border: 1.8, anchor: [0.5, 0.988] },
  { key: 'favorite_bottle_empty', file: 'bottle-empty.png', h: BOTTLE.h, border: 1.8, anchor: [0.5, 0.988] },
];

/** THE FAVORITE. The anniversary dinner at Le Papillon, a bottle of Pinot Noir, and four boys who are each told they are the favorite. */
export const favorite: MiniGame = { id: 'favorite', make: (host) => new FavoriteMini(host), art: buildArt, pieces: PIECES };
