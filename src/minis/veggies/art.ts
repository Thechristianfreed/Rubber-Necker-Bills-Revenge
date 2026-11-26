import Phaser from 'phaser';
import { fillPaper, makePaperArt } from '../../art/paper';
import { star } from '../../art/sticker';

/** The paper stand-ins for this game: what is on the page until there is a photo
 *  (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "veggies_" (a word on a burst: "word_veggies_..."). The game
 *  cannot make a picture by any other name, or draw over one that is not its own. */
export function buildArt(scene: Phaser.Scene): void {
  makePaperArt(scene, 'veggies_star', 160, 160, (c) => {
    star(c, 80, 80, 74, 34, 5);
    fillPaper(c, 'yellow');
  }, { border: 3 });
}
