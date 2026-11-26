import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { VeggiesMini } from './VeggiesMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "veggies_". */
const PIECES: Piece[] = [
  // { key: 'veggies_star', file: 'star.png', w: 160, border: 3 },
];

/** EAT YOUR VEGETABLES. (Say here, in a line, what the game is.) */
export const veggies: MiniGame = { id: 'veggies', make: (host) => new VeggiesMini(host), art: buildArt, pieces: PIECES };
