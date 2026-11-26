import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { PapillonMini } from './PapillonMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "papillon_". */
const PIECES: Piece[] = [

];

/** LE PAPILLON. (Say here, in a line, what the game is.) */
export const papillon: MiniGame = { id: 'papillon', make: (host) => new PapillonMini(host), art: buildArt, pieces: PIECES };
