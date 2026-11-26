import Phaser from 'phaser';
import '@fontsource/bangers/latin-400.css';
import '@fontsource/permanent-marker/latin-400.css';
import { loadPhotoArt } from '../art/photos';
import { loadPictures, picture } from '../art/pictures';
import { FROM } from '../art/sticker';
import { buildTextures } from '../art/textures';
import { sound } from '../audio/sound';
import { ONLY_MINI } from '../config';
import { levelById, sceneFor } from '../data/levels';
import back from '../assets/bill/head-back.webp';
import glare from '../assets/bill/head-glare.webp';
import grin from '../assets/bill/head-grin.webp';
import sideeye from '../assets/bill/head-sideeye.webp';

/** Loads Bill's photo heads and the comic font, then draws all the art. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  /** Load a photo head and bake it into a canvas texture that looks down the
   *  road (to the right); the source photos face different ways. Uses a plain
   *  <img> rather than Phaser's loader so it also works from an inlined data: URL. */
  private loadHead(key: string, address: string, mirror: boolean): Promise<void> {
    return new Promise((resolve) => {
      const url = picture(address);
      if (!url) return resolve();
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
        FROM[key] = `src/assets/bill/head-${key.slice(5)}.webp`;
        resolve();
      };
      im.onerror = () => resolve();
      im.src = url;
    });
  }

  create(): void {
    sound.loadVoice();
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const ready = fonts
      ? Promise.all([fonts.load('40px Bangers'), fonts.load('24px "Permanent Marker"')]).catch(() => undefined)
      : Promise.resolve();
    // never let a slow font block the game
    const timeout = new Promise((res) => setTimeout(res, 2500));
    const fontReady = Promise.race([ready, timeout]);
    // (the pictures that are kept beside the page have to be here before any of them is asked for)
    const heads = loadPictures().then(() => Promise.all([
      this.loadHead('bill-sideeye', sideeye, true),
      this.loadHead('bill-glare', glare, true),
      this.loadHead('bill-grin', grin, false),
      this.loadHead('bill-back', back, false),
    ]));
    void Promise.all([fontReady, heads]).then(() => {
      buildTextures(this);
      return loadPhotoArt(this);
    }).then(() => {
      const q = new URLSearchParams(location.search);
      // ?auto goes straight into a level (or, with level=minis, the quick games)
      const level = q.get('level');
      this.scene.start(!q.has('auto') ? 'title' : level === 'minis' || (ONLY_MINI && !level) ? 'minis' : sceneFor(levelById(level)));
    });
  }
}
