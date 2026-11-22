import Phaser from 'phaser';
import '@fontsource/bangers/latin-400.css';
import { buildTextures } from '../art/textures';
import glare from '../assets/bill/head-glare.png';
import grin from '../assets/bill/head-grin.png';
import sideeye from '../assets/bill/head-sideeye.png';

/** Loads Bill's photo heads and the comic font, then draws all the art. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  /** Load a photo head and bake it into a canvas texture that looks down the
   *  road (to the right); the source photos face different ways. Uses a plain
   *  <img> rather than Phaser's loader so it also works from an inlined data: URL. */
  private loadHead(key: string, url: string, mirror: boolean): Promise<void> {
    return new Promise((resolve) => {
      const im = new Image();
      im.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = im.naturalWidth;
        canvas.height = im.naturalHeight;
        const c = canvas.getContext('2d')!;
        if (mirror) {
          c.translate(canvas.width, 0);
          c.scale(-1, 1);
        }
        c.drawImage(im, 0, 0);
        this.textures.addCanvas(key, canvas);
        resolve();
      };
      im.onerror = () => resolve();
      im.src = url;
    });
  }

  create(): void {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const ready = fonts ? fonts.load('40px Bangers').catch(() => undefined) : Promise.resolve();
    // never let a slow font block the game
    const timeout = new Promise((res) => setTimeout(res, 2500));
    const fontReady = Promise.race([ready, timeout]);
    const heads = Promise.all([
      this.loadHead('bill-sideeye', sideeye, true),
      this.loadHead('bill-glare', glare, true),
      this.loadHead('bill-grin', grin, false),
    ]);
    void Promise.all([fontReady, heads]).then(() => {
      buildTextures(this);
      this.scene.start(new URLSearchParams(location.search).has('auto') ? 'game' : 'title');
    });
  }
}
