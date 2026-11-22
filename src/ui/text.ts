import Phaser from 'phaser';
import { INK, PAPER, view } from '../config';

export const FONT = 'Bangers, Impact, "Arial Narrow Bold", sans-serif';

/** Comic lettering with an ink outline, crisp at the current screen density. */
export function label(
  scene: Phaser.Scene, x: number, y: number, text: string, size: number,
  color: string = PAPER, stroke = Math.max(4, Math.round(size * 0.2)),
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: FONT,
    fontSize: `${size}px`,
    color,
    stroke: INK,
    strokeThickness: stroke,
    align: 'center',
    padding: { x: 8, y: 6 },
    resolution: Math.max(1, Math.ceil(view.RES)),
  }).setOrigin(0.5).setLetterSpacing(1);
}

export const MARKER = '"Permanent Marker", "Comic Sans MS", "Marker Felt", cursive';

/** Handwritten marker lettering, for captions and anything "written on" the page. */
export function marker(
  scene: Phaser.Scene, x: number, y: number, text: string, size: number,
  color: string = PAPER, stroke = Math.max(3, Math.round(size * 0.16)),
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: MARKER,
    fontSize: `${size}px`,
    color,
    stroke: INK,
    strokeThickness: stroke,
    align: 'center',
    padding: { x: 8, y: 6 },
    resolution: Math.max(1, Math.ceil(view.RES)),
  }).setOrigin(0.5);
}

/** A strip of embossed label-maker tape. */
export function tape(scene: Phaser.Scene, x: number, y: number, text: string, size = 13, color = 0x1d1b22): Phaser.GameObjects.Container {
  const t = scene.add.text(0, 0, text.toUpperCase(), {
    fontFamily: 'ui-monospace, "Courier New", Menlo, monospace',
    fontStyle: 'bold',
    fontSize: `${size}px`,
    color: '#fdfbf4',
    resolution: Math.max(1, Math.ceil(view.RES)),
  }).setOrigin(0.5).setLetterSpacing(2.2).setShadow(0, 1, 'rgba(0,0,0,0.6)', 0, false, true);
  const w = t.width + 20, h = size + 11;
  const g = scene.add.graphics();
  g.fillStyle(0x18100a, 0.35);
  g.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
  g.fillStyle(color, 1);
  g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle(0xffffff, 0.14);
  g.fillRect(-w / 2, -h / 2, w, 2.5);
  return scene.add.container(x, y, [g, t]).setRotation(-0.025);
}

/** Marker handwriting in plain ink, for anything written on a scrap of paper. */
export function written(
  scene: Phaser.Scene, x: number, y: number, text: string, size: number, color = '#2a2320',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: MARKER,
    fontSize: `${size}px`,
    color,
    align: 'center',
    padding: { x: 6, y: 5 },
    resolution: Math.max(1, Math.ceil(view.RES)),
  }).setOrigin(0.5);
}
