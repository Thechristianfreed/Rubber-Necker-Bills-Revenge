import { MiniGame, Piece } from '../kit';
import { BALL, buildArt } from './art';
import { BODIES, Body, THINGS } from './bodies';
import { OwnbasketMini } from './OwnbasketMini';

/** Somebody in a pose: her body, and (where her arms are up) her arms again, to go over her head. */
const body = (who: string, pose: string, b: Body): Piece[] => [
  { key: `ownbasket_${who}_${pose}`, file: b.file, scale: b.scale, anchor: b.spot, border: 2.2 },
  ...(b.arms ? [{ key: `ownbasket_${who}_${pose}_arms`, file: b.arms.file, scale: b.scale, anchor: b.arms.spot, border: 2.2 }] : []),
];

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets, cut by ./cut.py, which also writes the table of
 *  where everything is in them (./bodies.ts). Every key starts with "ownbasket_". */
const PIECES: Piece[] = [
  ...Object.entries(BODIES).flatMap(([who, poses]) => Object.entries(poses).flatMap(([pose, b]) => body(who, pose, b))),
  ...(THINGS.hoop ? [{ key: 'ownbasket_hoop', file: THINGS.hoop.file, scale: THINGS.hoop.scale, anchor: THINGS.hoop.foot, border: 2 }] : []),
  ...(THINGS.net ? [{ key: 'ownbasket_net', file: THINGS.net.file, scale: THINGS.net.scale, anchor: THINGS.net.rim, border: 0 }] : []),
  ...(THINGS.ball ? [{ key: 'ownbasket_ball', file: THINGS.ball.file, w: BALL, border: 1.6 }] : []),
  ...(THINGS.board ? [{ key: 'ownbasket_board', file: THINGS.board.file, w: THINGS.board.w, border: 2.4 }] : []),
  ...(THINGS.home ? [{ key: 'ownbasket_home', file: THINGS.home.file, w: THINGS.home.w, border: 2 }] : []),
  ...(THINGS.away ? [{ key: 'ownbasket_away', file: THINGS.away.file, w: THINGS.away.w, border: 2 }] : []),
];

/** Stephanie's only basket: one against one in the school gym, and every shot of hers goes in her own. */
export const ownbasket: MiniGame = { id: 'ownbasket', make: (host) => new OwnbasketMini(host), art: buildArt, pieces: PIECES };
