import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { GolfMini } from './GolfMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "golf_".
 *  There are none yet: the prompts for them are in the README. */
const PIECES: Piece[] = [
  // { key: 'golf_bag', file: 'bag.png', h: 170, border: 2, anchor: [0.5, 0.99] },
];

/** FORE! Chad's first tee shot, the window it went through, and the day after: Shane and
 *  Chad selling water on the Iron Horse Trail until there is enough for a new one. */
export const golf: MiniGame = { id: 'golf', make: (host) => new GolfMini(host), art: buildArt, pieces: PIECES };
