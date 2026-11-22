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

  preload(): void {
    this.load.image('bill-sideeye', sideeye);
    this.load.image('bill-glare', glare);
    this.load.image('bill-grin', grin);
  }

  /** Re-bake a photo head so it looks down the road (to the right). The source
   *  photos face different ways; mirroring once here keeps every use site simple. */
  private faceRight(key: string, mirror: boolean): void {
    const src = this.textures.get(key).getSourceImage() as HTMLImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = src.width;
    canvas.height = src.height;
    const c = canvas.getContext('2d')!;
    if (mirror) {
      c.translate(src.width, 0);
      c.scale(-1, 1);
    }
    c.drawImage(src, 0, 0);
    this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
  }

  create(): void {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    const ready = fonts ? fonts.load('40px Bangers').catch(() => undefined) : Promise.resolve();
    // never let a slow font block the game
    const timeout = new Promise((res) => setTimeout(res, 2500));
    void Promise.race([ready, timeout]).then(() => {
      this.faceRight('bill-sideeye', true);
      this.faceRight('bill-glare', true);
      this.faceRight('bill-grin', false);
      buildTextures(this);
      this.scene.start(new URLSearchParams(location.search).has('auto') ? 'game' : 'title');
    });
  }
}
