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
