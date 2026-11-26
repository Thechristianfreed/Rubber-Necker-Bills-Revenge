import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { FavoriteMini } from './FavoriteMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "favorite_". */
const PIECES: Piece[] = [
  // { key: 'favorite_star', file: 'star.png', w: 160, border: 3 },
];

/** THE FAVORITE. (Say here, in a line, what the game is.) */
export const favorite: MiniGame = { id: 'favorite', make: (host) => new FavoriteMini(host), art: buildArt, pieces: PIECES };
