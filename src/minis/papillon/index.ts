import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { PapillonMini } from './PapillonMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "papillon_". */
const PIECES: Piece[] = [

];

/** Dinner at Le Papillon: Stephanie orders what she wants most, and the player orders for Bill,
 *  who (what a crazy coincidence) always wants what she wanted second. Its pictures are also the
 *  restaurant's: the room, the table, the waiter and everybody's seat, which the other games set
 *  there use (src/minis/shared/papillon.ts). */
export const papillon: MiniGame = { id: 'papillon', make: (host) => new PapillonMini(host), art: buildArt, pieces: PIECES };
