import { MiniGame } from './kit';
import { bat } from './bat';
import { bop } from './bop';
import { fight } from './fight';
import { phone } from './phone';
import { sand } from './sand';
import { workout } from './workout';

/** THE MASTER LIST: every quick game on the Home Movies tape, in the order they
 *  come up. This is where the games are stitched into one.
 *
 *  Each game is a folder beside this file (see kit.ts for what is in one). A new
 *  game is added here with one import and one name in the list, and nothing else
 *  in this file changes: `node tools/new_mini.mjs <id> "<TITLE>"` does both. */
export const ROSTER: MiniGame[] = [
  workout,
  phone,
  bop,
  bat,
  sand,
  fight,
];
