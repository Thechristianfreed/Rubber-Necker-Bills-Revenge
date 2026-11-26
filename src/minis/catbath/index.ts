import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { CatbathMini } from './CatbathMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "catbath_".
 *  None have come yet: the prompts for them are in the README. */
const PIECES: Piece[] = [];

/** Bath time: Pappy and the stinking cats, at the kitchen sink. Choke it out, scrub it on the
 *  washboard, wring it out, hang it on the line, and kiss it. */
export const catbath: MiniGame = { id: 'catbath', make: (host) => new CatbathMini(host), art: buildArt, pieces: PIECES };
