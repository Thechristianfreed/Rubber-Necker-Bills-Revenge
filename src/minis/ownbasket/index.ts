import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { OwnbasketMini } from './OwnbasketMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "ownbasket_". */
const PIECES: Piece[] = [
  // (none yet: the prompts for them are in README.md)
];

/** Stephanie's only basket: one against one in the school gym, and every shot of hers goes in her own. */
export const ownbasket: MiniGame = { id: 'ownbasket', make: (host) => new OwnbasketMini(host), art: buildArt, pieces: PIECES };
