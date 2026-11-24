import Phaser from 'phaser';
import { PhotoOpts } from '../art/sticker';
import { Mini, MiniHost } from './Mini';

/** A photo that takes the place of a paper stand-in: the name the picture goes by in the
 *  game, and its file. For a game with a folder of its own the file is looked for in that
 *  folder's `assets` first, and among the common pictures (src/assets/scrap) after. */
export interface Piece extends PhotoOpts {
  key: string;
  file: string;
}

/** One quick game, as the master list (roster.ts) has it. Each is a folder in
 *  src/minis, and its `index.ts` gives one of these.
 *
 *  A game keeps to its own folder: its class, its paper art, its tables, its
 *  pictures (`assets`), the moments its test photographs (`moments.cjs`) and how its
 *  pictures are cut (`cut.py`). What it is given to draw with has a fence round it:
 *  every picture it makes is called `<id>_something` (or `word_<id>_something`, for a
 *  word on a burst), and it cannot draw over a picture that was there before it. So
 *  no game can spoil another, whatever order they were made in.
 *
 *  (The first six were made before games had folders. Their classes are in theirs;
 *  their paper art, tables and pictures are still where they were, in src/art,
 *  src/data and the common pictures, which no new game touches.) */
export interface MiniGame {
  /** Its short name: the name of its folder, and what `&mini=` takes. */
  readonly id: string;
  make(host: MiniHost): Mini;
  /** Draw its paper stand-ins: once, when the game is loaded. */
  art?(scene: Phaser.Scene): void;
  /** Its photos: each takes the place of the stand-in with the same key. */
  pieces?: Piece[];
  /** Other pictures of its own to have loaded (a backdrop, a strip), for `photos` to use. */
  files?: string[];
  /** Whatever else it does with its pictures once they are loaded. */
  photos?(scene: Phaser.Scene, loaded: Map<string, HTMLImageElement>): void;
}
