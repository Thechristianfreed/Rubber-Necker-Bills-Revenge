import Phaser from 'phaser';
import { Ctx, makePhotoTile } from '../../art/sticker';
import { MiniGame, Piece } from '../kit';
import { buildArt, letterHole, letterPoster, letterShop, letterTrail } from './art';
import { GOLF_BODIES, GOLF_PLACES, GOLF_PLACE_TALL, GOLF_SIGNS } from './cuts';
import { GolfMini } from './GolfMini';

/** Letter a blank sign: `write` is given the blank part of the picture (cuts.ts says where it is). */
function lettered(sign: string, write: (c: Ctx, x: number, y: number, w: number, h: number) => void) {
  const [x0, y0, x1, y1] = GOLF_SIGNS[sign];
  return (c: Ctx, w: number, h: number): void => write(c, x0 * w, y0 * h, (x1 - x0) * w, (y1 - y0) * h);
}

/** Something that stands on the ground: pinned at the middle of its foot. */
const FOOT: [number, number] = [0.5, 0.99];

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py, from the pictures in
 *  art-src/games/golf: the README says which is which). Every key starts with "golf_". */
const PIECES: Piece[] = [
  // Chad with a club (and again with the other one), Bill, and whoever is out on the trail:
  // bodies with the heads off, each pinned at the spot on the ground it stands on
  ...Object.entries(GOLF_BODIES).map(([pose, body]): Piece => ({ key: `golf_${pose}`, file: body.file, scale: body.scale, border: 2, anchor: body.spot })),
  // on the tee
  { key: 'golf_bag', file: 'bag.png', h: 150, border: 2, anchor: FOOT },
  { key: 'golf_sign', file: 'sign.png', h: 104, border: 1.8, anchor: FOOT, decorate: lettered('sign', letterHole) },
  { key: 'golf_club_driver', file: 'club-driver.png', w: 84, border: 1.4, anchor: [0.04, 0.79] },
  { key: 'golf_club_iron', file: 'club-iron.png', w: 84, border: 1.4, anchor: [0.04, 0.79] },
  { key: 'golf_ball_big', file: 'ball.png', w: 132, border: 3 },
  { key: 'golf_ball', file: 'ball.png', w: 12, border: 1 },
  // at the entrance to the trail
  { key: 'golf_bollard', file: 'bollard.png', h: 92, border: 1.6, anchor: FOOT },
  { key: 'golf_gate', file: 'gate.png', h: 112, border: 1.6, anchor: FOOT },
  { key: 'golf_trailsign', file: 'trailsign.png', h: 150, border: 2.2, anchor: [0.5, 1], decorate: lettered('trailsign', letterTrail) },
  { key: 'golf_stopsign', file: 'stopsign.png', h: 168, border: 1.6, anchor: FOOT },
  // the water stand
  { key: 'golf_table', file: 'table.png', w: 136, border: 2.2, anchor: FOOT, decorate: lettered('poster', letterPoster) },
  { key: 'golf_cooler', file: 'cooler.png', w: 70, border: 2, anchor: FOOT },
  { key: 'golf_bottle', file: 'bottle.png', h: 36, border: 1.2 },
  { key: 'golf_jar', file: 'jar.png', h: 54, border: 1.6, anchor: FOOT },
  // Windows R Us
  { key: 'golf_store', file: 'store.png', h: 350, border: 2.5, anchor: FOOT, decorate: lettered('store', letterShop) },
  { key: 'golf_window_new', file: 'window-new.png', h: 150, border: 2.5 },
  // the title card for the second day (the owner's own picture: there is no paper one, only the words)
  { key: 'golf_card', file: 'card.jpg', h: 450, border: 4 },
];

/** The whole places (the first tee, the trail, the lot outside the shop): each is one photo,
 *  called `golf_place_<name>`, with no edge to it, which the game lays behind everything else. */
function places(scene: Phaser.Scene, loaded: Map<string, HTMLImageElement>): void {
  for (const [name, place] of Object.entries(GOLF_PLACES)) {
    const photo = loaded.get(place.file);
    if (photo) makePhotoTile(scene, `golf_place_${name}`, photo, GOLF_PLACE_TALL, true);
  }
}

/** FORE! Chad's first tee shot, the window it went through, and the day after: Shane and
 *  Chad selling water on the Iron Horse Trail until there is enough for a new one. */
export const golf: MiniGame = {
  id: 'golf', make: (host) => new GolfMini(host), art: buildArt, pieces: PIECES, files: Object.values(GOLF_PLACES).map((p) => p.file), photos: places,
};
