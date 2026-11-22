import Phaser from 'phaser';
import bug from '../assets/scrap/bug.png';
import { makePhotoArt } from './sticker';

/** Photo cutouts that replace drawn art. Each entry takes over the texture key
 *  of the drawing it replaces, so nothing else in the game has to change. */
interface PhotoPiece {
  key: string;
  url: string;
  /** Width on screen, in design pixels. */
  w: number;
  border?: number;
  anchor?: [number, number];
}

const PIECES: PhotoPiece[] = [
  { key: 'bug', url: bug, w: 270, anchor: [0.5, 0.985] },
];

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = url;
  });
}

/** Load every photo cutout and swap it in over its drawn stand-in. */
export async function loadPhotoArt(scene: Phaser.Scene): Promise<void> {
  const images = await Promise.all(PIECES.map((p) => loadImage(p.url)));
  PIECES.forEach((p, i) => {
    const im = images[i];
    if (im) makePhotoArt(scene, p.key, im, p.w, { border: p.border, anchor: p.anchor });
  });
}
