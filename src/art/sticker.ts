import Phaser from 'phaser';
import { INK, PAPER, TEX } from '../config';

/** Helpers for the scrapbook look: every piece of art is drawn with the
 *  Canvas 2D API at TEX x design size, optionally wrapped in a white cut-paper
 *  border with a soft drop shadow, and registered as a Phaser texture. */

export type Ctx = CanvasRenderingContext2D;

export interface ArtInfo {
  /** Design-pixel size of the drawing itself (without the sticker border). */
  w: number;
  h: number;
  /** Border padding in design pixels. */
  pad: number;
  /** Anchor inside the drawing, in design pixels. */
  ax: number;
  ay: number;
  /** Texture pixels per design pixel, where that is not TEX (big photo backdrops). */
  tex?: number;
}

export const ART: Record<string, ArtInfo> = {};

export interface ArtOpts {
  border?: number;
  keyline?: number;
  ax?: number;
  ay?: number;
}

export function makeCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return [c, c.getContext('2d')!];
}

function silhouette(src: HTMLCanvasElement, color: string): HTMLCanvasElement {
  const [c, x] = makeCanvas(src.width, src.height);
  x.drawImage(src, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

/** Every cutout casts a soft shadow, as if it were glued onto the page below. */
const SHADOW = { dx: 2.2, dy: 3.4, blur: 3.2, alpha: 0.42 };

function stickerize(src: HTMLCanvasElement, border: number, keyline: number): [HTMLCanvasElement, number] {
  const padDesign = Math.ceil(border + keyline + 1 + SHADOW.blur + Math.max(SHADOW.dx, SHADOW.dy));
  const pad = padDesign * TEX;
  const [flat, o] = makeCanvas(src.width + pad * 2, src.height + pad * 2);
  const ring = (img: HTMLCanvasElement, r: number) => {
    const n = Math.max(16, Math.ceil(r * 2.4));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.drawImage(img, pad + Math.cos(a) * r, pad + Math.sin(a) * r);
    }
  };
  if (keyline > 0) ring(silhouette(src, INK), (border + keyline) * TEX);
  const white = silhouette(src, PAPER);
  ring(white, border * TEX);
  if (border * TEX > 5) ring(white, border * TEX * 0.5);
  o.drawImage(src, pad, pad);

  const [out, x] = makeCanvas(flat.width, flat.height);
  x.shadowColor = `rgba(24, 16, 10, ${SHADOW.alpha})`;
  x.shadowBlur = SHADOW.blur * TEX;
  x.shadowOffsetX = SHADOW.dx * TEX;
  x.shadowOffsetY = SHADOW.dy * TEX;
  x.drawImage(flat, 0, 0);
  return [out, padDesign];
}

/** Draw a piece of art and register it under `key`. */
export function makeArt(
  scene: Phaser.Scene, key: string, w: number, h: number,
  draw: (c: Ctx) => void, opts: ArtOpts = {},
): void {
  const [inner, c] = makeCanvas(w * TEX, h * TEX);
  c.scale(TEX, TEX);
  c.lineJoin = 'round';
  c.lineCap = 'round';
  draw(c);
  let canvas = inner;
  let pad = 0;
  if (opts.border && opts.border > 0) {
    [canvas, pad] = stickerize(inner, opts.border, opts.keyline ?? 0);
  }
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  ART[key] = { w, h, pad, ax: opts.ax ?? w / 2, ay: opts.ay ?? h / 2 };
}

export interface PhotoOpts {
  /** Size on screen in design pixels: give a width or a height (the other
   *  follows the image), or a scale in design pixels per image pixel. */
  w?: number;
  h?: number;
  scale?: number;
  border?: number;
  /** Anchor as fractions of the piece (0.5, 1 = bottom centre). */
  anchor?: [number, number];
  /** A canvas filter applied to the photo, e.g. 'grayscale(1)'. */
  filter?: string;
  /** Draw on top of the photo (sign lettering and so on), in design pixels. */
  decorate?: (c: Ctx, w: number, h: number) => void;
}

/** Register a photo cutout (an already-trimmed transparent image) as art,
 *  giving it the same white paper border and shadow as everything else. */
export function makePhotoArt(scene: Phaser.Scene, key: string, image: HTMLImageElement, opts: PhotoOpts): void {
  const aspect = image.naturalWidth / image.naturalHeight;
  const w = opts.scale ? image.naturalWidth * opts.scale : opts.w ?? (opts.h ?? 100) * aspect;
  const h = opts.scale ? image.naturalHeight * opts.scale : opts.h ?? w / aspect;
  const [inner, c] = makeCanvas(w * TEX, h * TEX);
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  if (opts.filter) c.filter = opts.filter;
  c.drawImage(image, 0, 0, inner.width, inner.height);
  c.filter = 'none';
  if (opts.decorate) {
    c.scale(TEX, TEX);
    opts.decorate(c, w, h);
  }
  const [canvas, pad] = stickerize(inner, opts.border ?? 2.5, 0);
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  const [fx, fy] = opts.anchor ?? [0.5, 0.5];
  ART[key] = { w, h, pad, ax: w * fx, ay: h * fy };
}

/** Register a photo as a plain repeating strip (no border), `h` design pixels tall. */
export function makePhotoTile(scene: Phaser.Scene, key: string, image: HTMLImageElement, h: number, native = false): void {
  const w = (h * image.naturalWidth) / image.naturalHeight;
  // `native` keeps a big photo at its own resolution instead of enlarging it,
  // so the texture stays small enough for every phone's graphics chip
  const d = native ? Math.min(TEX, image.naturalHeight / h) : TEX;
  const [canvas, c] = makeCanvas(Math.round(w * d), Math.round(h * d));
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  c.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
  ART[key] = { w: canvas.width / d, h: canvas.height / d, pad: 0, ax: 0, ay: 0, tex: d };
}

/** Origin (0..1) that puts a sprite's anchor at its x/y. */
export function originOf(key: string): [number, number] {
  const a = ART[key];
  return [(a.pad + a.ax) / (a.w + a.pad * 2), (a.pad + a.ay) / (a.h + a.pad * 2)];
}

/** Add an image for generated art, scaled to design pixels and anchored. */
export function img(scene: Phaser.Scene, x: number, y: number, key: string): Phaser.GameObjects.Image {
  const im = scene.add.image(x, y, key);
  applyArt(im, key);
  return im;
}

export function applyArt(im: Phaser.GameObjects.Image, key: string): void {
  if (im.texture.key !== key) im.setTexture(key);
  const [ox, oy] = originOf(key);
  im.setOrigin(ox, oy);
  im.setScale(1 / TEX);
}

// ---- small drawing vocabulary ------------------------------------------------

export function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number): void {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}

export function circle(c: Ctx, x: number, y: number, r: number): void {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
}

export function ellipse(c: Ctx, x: number, y: number, rx: number, ry: number, rot = 0): void {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}

export function poly(c: Ctx, pts: number[]): void {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.closePath();
}

/** Fill the current path and outline it in ink. */
export function ink(c: Ctx, fill: string, lw = 2.4): void {
  c.fillStyle = fill;
  c.fill();
  if (lw > 0) {
    c.lineWidth = lw;
    c.strokeStyle = INK;
    c.stroke();
  }
}

export function line(c: Ctx, pts: number[], color = INK, lw = 2): void {
  c.beginPath();
  c.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.strokeStyle = color;
  c.lineWidth = lw;
  c.stroke();
}

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => {
    const t = amt < 0 ? 0 : 255;
    return Math.round(v + (t - v) * Math.abs(amt));
  };
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function star(c: Ctx, x: number, y: number, outer: number, inner: number, points = 5, rot = -Math.PI / 2): void {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath();
}
