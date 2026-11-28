import Phaser from 'phaser';
import { cutText } from '../../art/paper';
import { Ctx, makePhotoTile } from '../../art/sticker';
import { MiniGame, Piece } from '../kit';
import { FOREST, buildArt } from './art';
import { CUT } from './cut';
import { EDGE_PHOTO, INSIDE_PHOTO, VAN } from './layout';
import { RideMini } from './RideMini';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py), or among the common pictures.
 *  Every key starts with "ride_". */
const BODY = CUT.bodies as Record<string, { h: number; at: number[] }>;
const body = (name: string): Piece => (
  { key: `ride_${name}`, file: `${name.replace('_', '-')}.png`, h: BODY[name].h, border: 2.5, anchor: BODY[name].at as [number, number] });

/** The sign at the edge of town came blank: the game letters it, in the green of it. */
const lettered = (c: Ctx, w: number, h: number) => {
  const [x0, y0, x1, y1] = CUT.sign, mx = ((x0 + x1) / 2) * w, top = y0 * h, tall = (y1 - y0) * h;
  cutText(c, 'NOW LEAVING', mx, top + tall * 0.3, tall * 0.24, 'white');
  cutText(c, 'TOWN', mx, top + tall * 0.66, tall * 0.4, 'white');
};

const PIECES: Piece[] = [
  // the family (their own faces go on at the chin): Stephanie with Mr. Quacks and without, Curt;
  // Pappy in the van (waiting, winding up, kicking) and home again (the kiss, the champagne); Mammy
  ...['steph_hold', 'steph_stand', 'curt_stand', 'pappy_wait', 'pappy_ready', 'pappy_kick', 'pappy_kiss', 'pappy_bottle', 'mammy_glass'].map(body),
  // the three dogs from RD4 (Fido is the first), and each one's head for a window
  ...[0, 1, 2].flatMap((i): Piece[] => [
    { key: `ride_dog${i}`, file: `dog${i}.png`, h: 120, border: 2.2, anchor: [0.5, 0.97] },
    { key: `ride_dog${i}_head`, file: `dog${i}-head.png`, h: 72, border: 2.2, anchor: [0.5, 0.96] },
  ]),
  // Mr. Quacks: standing, flying away, and his head
  { key: 'ride_duck', file: 'duck.png', h: 80, border: 2.2, anchor: [0.55, 0.96] },
  { key: 'ride_duck_fly', file: 'duck-fly.png', h: 84, border: 2.2, anchor: [0.5, 0.6] },
  { key: 'ride_duck_head', file: 'duck-head.png', h: 46, border: 2, anchor: [0.55, 0.96] },
  // the van, as wide as the paper one, held by the ground under the middle of it
  { key: 'ride_van', file: 'van.png', w: VAN.w, border: 2.6, anchor: CUT.van.at as [number, number] },
  // the sign, a dustbin, the champagne and a glass
  { key: 'ride_sign', file: 'sign.png', h: 190, border: 2.4, anchor: [0.5, 0.99], decorate: lettered },
  { key: 'ride_can', file: 'can.png', h: 62, border: 2.2, anchor: [0.5, 0.97] },
  { key: 'ride_bottle', file: 'bottle.png', h: 96, border: 2, anchor: [0.5, 0.7] },
  { key: 'ride_glass', file: 'glass.png', h: 52, border: 1.6, anchor: [0.5, 0.5] },
  // the sliding door, shut, from inside: made from the photo of the inside of the van (cut.py)
  { key: 'ride_slider', file: 'slider.jpg', w: CUT.slider.size[0] * INSIDE_PHOTO.k, border: 0, anchor: [0, 0] },
  // inside the van, its doorway cut out (the edge of town shows through it)
  { key: 'ride_inside', file: 'inside.png', w: CUT.inside.size[0] * INSIDE_PHOTO.k, border: 0, anchor: [0, 0] },
  // Roger, sitting (the common picture, as it is), and his head with his tongue out for the window
  { key: 'ride_roger', file: 'roger-sit.png', h: 138, border: 2.2, anchor: [0.478, 0.985] },
  { key: 'ride_roger_head', file: 'roger-head.png', h: 78, border: 2.2, anchor: [0.5, 0.96] },
];

/** The edge of town: a strip of its forest for the end of the drive (it repeats), and the whole of
 *  it for the view through the van's door. */
function photos(scene: Phaser.Scene, loaded: Map<string, HTMLImageElement>): void {
  const forest = loaded.get('forest.jpg'), edge = loaded.get('edge.jpg');
  if (forest) makePhotoTile(scene, 'ride_forest', forest, FOREST.h, true);
  if (edge) makePhotoTile(scene, 'ride_edge', edge, EDGE_PHOTO.h, true);
}

/** Take 'em for a ride: the dogs Curt and Stephanie brought home, and Mr. Quacks, driven to the
 *  edge of town by Pappy and kicked out of the van one at a time. */
export const ride: MiniGame = {
  id: 'ride', make: (host) => new RideMini(host), art: buildArt, pieces: PIECES, files: ['forest.jpg', 'edge.jpg'], photos,
};
