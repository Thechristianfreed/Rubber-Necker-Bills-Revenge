import Phaser from 'phaser';
import { makePhotoTile } from '../../art/sticker';
import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { CUT } from './cut';
import { CatbathMini } from './CatbathMini';
import { COUNTER_TALL, KITCHEN_PHOTO } from './layout';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "catbath_". */
const B = CUT.bodies as Record<string, { h: number; at: number[]; fist: number }>;
const CATS = CUT.cats as Record<string, Record<string, number[]>>;
const PIECES: Piece[] = [
  // Pappy at the sink, from the thighs up (the counter hides the rest), each held by a spot under
  // his chin; and his fists, which go in front of whatever he holds
  ...['stand', 'grab', 'choke', 'scrub', 'wring', 'hang'].map((pose): Piece => (
    { key: `catbath_pappy_${pose}`, file: `pappy-${pose}.png`, h: B[pose].h, border: 2.5, anchor: B[pose].at as [number, number] })),
  ...['choke', 'scrub', 'wring', 'hang'].flatMap((pose) => [0, 1].map((k): Piece => (
    { key: `catbath_fist_${pose}_${k}`, file: `pappy-${pose}-fist${k}.png`, w: B[pose].fist, border: 0 }))),
  // the three cats: sitting about; held up by the scruff (hissing, out cold, soaked: held at the top
  // of the head), soaked and held by the middle, lying limp to be wrung, and dried out
  ...[0, 1, 2].flatMap((i): Piece[] => [
    { key: `catbath_cat${i}_sit`, file: `cat${i}-sit.png`, h: 115, border: 2.2, anchor: [0.5, 0.98] },
    ...['mad', 'out', 'wet', 'dry'].map((how): Piece => (
      { key: `catbath_cat${i}_${how}`, file: `cat${i}-${how}.png`, h: how === 'dry' ? 160 : 150, border: 2.2, anchor: CATS[i][how] as [number, number] })),
    { key: `catbath_cat${i}_soak`, file: `cat${i}-wet.png`, h: 150, border: 2.2, anchor: [0.5, 0.4] },
    { key: `catbath_cat${i}_wrung`, file: `cat${i}-wrung.png`, w: 200, border: 2.2, anchor: [0.5, 0.5] },
  ]),
  // what is at the sink
  { key: 'catbath_board', file: 'board.png', h: 176, border: 2.2, anchor: [0.5, 1] },
  { key: 'catbath_sprayer', file: 'sprayer.png', h: 84, border: 2, anchor: [0.5, 0.98] },
  { key: 'catbath_tap', file: 'tap.png', h: 100, border: 2, anchor: [0.66, 0.98] },
  { key: 'catbath_suds', file: 'suds.png', w: 196, border: 1.8, anchor: [0.5, 0.9] },
  { key: 'catbath_peg', file: 'peg.png', h: 40, border: 1.2, anchor: [0.5, 0.3] },
];

/** The kitchen behind him is one photo, kept at its own size; the counter in front of him is a
 *  strip that repeats. */
function photos(scene: Phaser.Scene, loaded: Map<string, HTMLImageElement>): void {
  const kitchen = loaded.get('kitchen.jpg'), counter = loaded.get('counter.jpg');
  if (kitchen) makePhotoTile(scene, 'catbath_kitchen', kitchen, kitchen.naturalHeight * KITCHEN_PHOTO.k, true);
  if (counter) makePhotoTile(scene, 'catbath_counter', counter, COUNTER_TALL, true);
}

/** Bath time: Pappy and the stinking cats, at the kitchen sink. Choke it out, scrub it on the
 *  washboard, wring it out, hang it on the line, and kiss it. */
export const catbath: MiniGame = {
  id: 'catbath', make: (host) => new CatbathMini(host), art: buildArt, pieces: PIECES, files: ['kitchen.jpg', 'counter.jpg'], photos,
};
