import Phaser from 'phaser';
import { TEX } from '../config';
import { ArtOpts, Ctx, makeArt, star } from './sticker';

/** Cut-paper building blocks for the interface, lettering and road paint.
 *
 *  The sheets are small tileable photos of real paper (tools/make_cutouts.py
 *  builds them). Anything made here is a shape filled with one of those
 *  sheets and given the usual white cut edge and drop shadow, so it sits in
 *  the scrapbook the same way the photo cutouts do. */

export type Paper = 'cream' | 'white' | 'manila' | 'yellow' | 'red' | 'blue' | 'green' | 'grey' | 'black';

/** Flat stand-ins, used only if a sheet fails to load. */
const FLAT: Record<Paper, string> = {
  cream: '#f9f4e4', white: '#fbfaf4', manila: '#e6c78c', yellow: '#f6c430', red: '#cc302a',
  blue: '#2b5cad', green: '#549e4d', grey: '#6b666e', black: '#242022',
};

export const INK_MARKER = '#2a2320';
export const DISPLAY = 'Bangers, Impact, "Arial Narrow Bold", sans-serif';

const SHEETS = new Map<Paper, HTMLImageElement>();

export function addPaper(name: Paper, image: HTMLImageElement): void {
  SHEETS.set(name, image);
}

/** A fill style that paints with a sheet of paper. */
export function paper(c: Ctx, name: Paper): CanvasPattern | string {
  const sheet = SHEETS.get(name);
  const pattern = sheet && c.createPattern(sheet, 'repeat');
  if (!pattern) return FLAT[name];
  pattern.setTransform(new DOMMatrix().scale(1 / TEX));
  return pattern;
}

/** Fill the current path with paper. */
export function fillPaper(c: Ctx, name: Paper): void {
  c.fillStyle = paper(c, name);
  c.fill();
}

/** Run `draw` so that whatever it fills looks glued on top: it casts the thin
 *  shadow of its own thickness onto the paper underneath. */
export function glued(c: Ctx, draw: () => void): void {
  c.save();
  c.shadowColor = 'rgba(24, 16, 10, 0.5)';
  c.shadowBlur = 1.4 * TEX;
  c.shadowOffsetX = 0.7 * TEX;
  c.shadowOffsetY = 1.3 * TEX;
  draw();
  c.restore();
}

/** Letters cut out of paper and glued down. */
export function cutText(c: Ctx, text: string, x: number, y: number, size: number, sheet: Paper, font = DISPLAY): void {
  glued(c, () => {
    c.font = `${size}px ${font}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = paper(c, sheet);
    c.fillText(text, x, y);
  });
}

/** Width of a line of lettering, in design pixels. */
export function textWidth(text: string, size: number, font = DISPLAY): number {
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `${size}px ${font}`;
  return c.measureText(text).width;
}

// ---- shapes ----------------------------------------------------------------

/** A jagged comic burst, a little irregular like one cut by hand. */
export function burstPath(c: Ctx, cx: number, cy: number, rx: number, ry: number, spikes: number, seed: number): void {
  let s = seed * 7919 + 13;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  c.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * 0.08;
    const k = i % 2 === 0 ? 0.84 + rnd() * 0.16 : 0.56 + rnd() * 0.1;
    const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
    if (i === 0) c.moveTo(x, y); else c.lineTo(x, y);
  }
  c.closePath();
}

/** A strip of tape: straight sides, ends torn in a zig-zag. */
export function tapePath(c: Ctx, x: number, y: number, w: number, h: number): void {
  const teeth = 5, d = 3;
  c.beginPath();
  c.moveTo(x + d, y);
  c.lineTo(x + w - d, y);
  for (let i = 0; i <= teeth; i++) c.lineTo(x + w - (i % 2 ? 0 : d), y + (h * i) / teeth);
  c.lineTo(x + d, y + h);
  for (let i = teeth; i >= 0; i--) c.lineTo(x + (i % 2 ? 0 : d), y + (h * i) / teeth);
  c.closePath();
}

export function heartPath(c: Ctx, w: number, h: number): void {
  c.beginPath();
  c.moveTo(w / 2, h * 0.94);
  c.bezierCurveTo(-w * 0.14, h * 0.44, w * 0.12, -h * 0.1, w / 2, h * 0.28);
  c.bezierCurveTo(w * 0.88, -h * 0.1, w * 1.14, h * 0.44, w / 2, h * 0.94);
  c.closePath();
}

/** A speech bubble with its tail at the bottom, pointing down and to the right. */
export function bubblePath(c: Ctx, w: number, h: number, tailX: number, tail: number): void {
  const r = Math.min(16, h / 2);
  c.beginPath();
  c.moveTo(r, 0);
  c.arcTo(w, 0, w, h, r);
  c.arcTo(w, h, 0, h, r);
  c.lineTo(tailX + 26, h);
  c.lineTo(tailX + 32, h + tail);
  c.lineTo(tailX, h);
  c.arcTo(0, h, 0, 0, r);
  c.arcTo(0, 0, w, 0, r);
  c.closePath();
}

/** Register a piece of cut paper as art. */
export function makePaperArt(
  scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void, opts: ArtOpts = {},
): void {
  makeArt(scene, key, w, h, draw, { border: 2.2, ...opts });
}

/** A hit word: glued letters on a jagged burst of coloured paper. */
export function makeWord(
  scene: Phaser.Scene, key: string, text: string, burst: Paper, letters: Paper, w = 118, size = 30, seed = 1,
): void {
  const h = w * 0.68;
  makePaperArt(scene, key, w, h, (c) => {
    burstPath(c, w / 2, h / 2, w / 2 - 1, h / 2 - 1, 13, seed);
    fillPaper(c, burst);
    c.translate(w / 2, h / 2);
    c.rotate(-0.07);
    cutText(c, text, 0, 2, size, letters);
  }, { border: 2.5 });
}

export { star };
