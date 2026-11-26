import { MiniGame, Piece } from '../kit';
import { BOTTLE, HEART, buildArt } from './art';
import { FavoriteMini } from './FavoriteMini';
import { HANDS } from './hands';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "favorite_". */
const PIECES: Piece[] = [
  // the bottle (the owner's picture of it), and the same bottle emptied: held by the foot
  { key: 'favorite_bottle', file: 'bottle.png', h: BOTTLE.h, border: 1.8, anchor: [0.5, 0.988] },
  { key: 'favorite_bottle_empty', file: 'bottle-empty.png', h: BOTTLE.h, border: 1.8, anchor: [0.5, 0.988] },
  // the heart over a boy's head (a red card one), and the same heart in grey, with nothing in it:
  // the two are one shape, the red laid over the grey and taken away from the top
  { key: 'favorite_heart', file: 'heart.png', w: HEART.w, border: 2.2 },
  { key: 'favorite_heart_empty', file: 'heart-empty.png', w: HEART.w, border: 2.2 },
  // Bill's hand, three ways (pointing, a finger up, open beside his mouth): each held where hands.ts says
  ...Object.entries(HANDS).map(([name, hand]): Piece => ({ key: `favorite_${name}`, file: hand.file, scale: hand.scale, border: 2, anchor: hand.anchor })),
];

/** THE FAVORITE. The anniversary dinner at Le Papillon, a bottle of Pinot Noir, and four boys who are each told they are the favorite. */
export const favorite: MiniGame = { id: 'favorite', make: (host) => new FavoriteMini(host), art: buildArt, pieces: PIECES };
