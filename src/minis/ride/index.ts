import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { RideMini } from './RideMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "ride_".
 *  None have come yet: the prompts for them are in the README. */
const PIECES: Piece[] = [];

/** Take 'em for a ride: the dogs Curt and Stephanie brought home, and Mr. Quacks, driven to the
 *  edge of town by Pappy and kicked out of the van one at a time. */
export const ride: MiniGame = { id: 'ride', make: (host) => new RideMini(host), art: buildArt, pieces: PIECES };
