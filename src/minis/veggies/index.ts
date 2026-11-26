import { CAST } from '../../data/cast';
import { MiniGame, Piece } from '../kit';
import { BIG, LOOKS, buildArt, headKey } from './art';
import { VeggiesMini } from './VeggiesMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py); one that is not there is looked for
 *  among the common pictures. Every key starts with "veggies_".
 *
 *  So far they are all Branson's own faces, from everybody's set, at the size he is
 *  seen here: close up. */
const PIECES: Piece[] = [
  ...LOOKS.filter((look) => CAST.branson?.[look]).map((look): Piece => {
    const f = CAST.branson[look];
    return { key: headKey(look), file: f.file, h: BIG * f.tall, border: 3, anchor: f.chin };
  }),
];

/** EAT YOUR VEGETABLES. Branson would only ever eat buttered noodles: his mother pinches
 *  his nose until he has to open his mouth, and his father crams the vegetables in. */
export const veggies: MiniGame = { id: 'veggies', make: (host) => new VeggiesMini(host), art: buildArt, pieces: PIECES };
