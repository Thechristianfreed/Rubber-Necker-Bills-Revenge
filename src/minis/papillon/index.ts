import { cutText, textWidth } from '../../art/paper';
import { makePhotoTile } from '../../art/sticker';
import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { CUT, ROOM_FIT, SIGN_FIT } from './cut';
import { PapillonMini } from './PapillonMini';

const MARKER = '"Permanent Marker", "Comic Sans MS", cursive';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets, cut by ./cut.py, which also writes how big each is
 *  drawn and where it is held (./cut.ts). Every key starts with "papillon_".
 *
 *  The sign came as a blank board: its name is lettered on it here, in gold, between its
 *  two painted butterflies. */
const PIECES: Piece[] = CUT.map((p) => (p.key !== 'papillon_sign' ? p : {
  ...p,
  decorate: (c) => {
    let size = 34;
    while (size > 16 && textWidth('Le Papillon', size, MARKER) > SIGN_FIT.wide) size--;
    cutText(c, 'Le Papillon', SIGN_FIT.name[0], SIGN_FIT.name[1], size, 'yellow', MARKER);
  },
}));

/** Dinner at Le Papillon: Stephanie orders what she wants most, and the player orders for Bill,
 *  who (what a crazy coincidence) always wants what she wanted second. Its pictures are also the
 *  restaurant's: the room, the table, the waiter and everybody's seat, which the other games set
 *  there use (src/minis/shared/papillon.ts). */
export const papillon: MiniGame = {
  id: 'papillon',
  make: (host) => new PapillonMini(host),
  art: buildArt,
  pieces: PIECES,
  // the room is one photo, the whole of the wall, the panelling and the carpet: a backdrop, with no edge to it
  files: [ROOM_FIT.file],
  photos: (scene, loaded) => {
    const room = loaded.get(ROOM_FIT.file);
    if (room) makePhotoTile(scene, 'papillon_room', room, ROOM_FIT.tall, true);
  },
};
