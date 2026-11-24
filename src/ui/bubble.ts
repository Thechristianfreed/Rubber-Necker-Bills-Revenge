import Phaser from 'phaser';
import { written } from './text';

const INK = 0x2a2320;
const PAPER = 0xfbf6ea;
/** A line longer than this is broken in two. */
const WRAP = 215;

/** A scrap of paper with something said on it, its middle at (x, y) and its tail
 *  pointing at whoever said it (`from`, which is where their mouth is). With a
 *  `side`, x is not its middle but its edge on the other side: 'left' puts the
 *  whole of it to the left of x, however long it is. It pops up; whoever asked
 *  for it takes it away again. */
export function bubble(
  scene: Phaser.Scene, x: number, y: number, text: string, from: { x: number; y: number }, size = 19, side?: 'left' | 'right',
): Phaser.GameObjects.Container {
  const words = written(scene, 0, 0, text, size);
  if (words.width > WRAP && text.includes(' ')) {
    // two lines, as near the same length as its spaces allow
    let cut = -1;
    for (let i = text.indexOf(' '); i >= 0; i = text.indexOf(' ', i + 1)) if (cut < 0 || Math.abs(i - text.length / 2) < Math.abs(cut - text.length / 2)) cut = i;
    words.setText(`${text.slice(0, cut)}\n${text.slice(cut + 1)}`).setLineSpacing(-4);
  }
  const a = (words.width + 20) / 2, c = (words.height + 6) / 2;
  if (side) x += side === 'left' ? -a : a;
  const g = scene.add.graphics();
  // The tail leaves by whichever edge the speaker is furthest beyond, and stops short of them.
  const mx = from.x - x, my = from.y - y;
  const ex = Math.abs(mx) - a, ey = Math.abs(my) - c;
  let tail: number[][] | undefined;
  if (ex > 6 || ey > 6) {
    const down = ey >= ex * 0.6;
    const bx = down ? Phaser.Math.Clamp(mx, -a + 20, a - 20) : Math.sign(mx) * a;
    const by = down ? Math.sign(my) * c : Phaser.Math.Clamp(my, -c + 14, c - 14);
    const far = Math.hypot(mx - bx, my - by) || 1, ux = (mx - bx) / far, uy = (my - by) / far;
    const long = Phaser.Math.Clamp(far - 16, 10, 56);
    const ax = down ? 1 : 0, ay = down ? 0 : 1, inx = down ? 0 : -Math.sign(mx) * 4, iny = down ? -Math.sign(my) * 4 : 0;
    tail = [
      [bx - ax * 12, by - ay * 12, bx + ax * 12, by + ay * 12, bx + ux * (long + 5), by + uy * (long + 5)],
      [bx - ax * 8.5 + inx, by - ay * 8.5 + iny, bx + ax * 8.5 + inx, by + ay * 8.5 + iny, bx + ux * long, by + uy * long],
    ];
  }
  g.fillStyle(INK, 1);
  g.fillRoundedRect(-a - 3, -c - 3, a * 2 + 6, c * 2 + 6, 16);
  if (tail) g.fillTriangle(tail[0][0], tail[0][1], tail[0][2], tail[0][3], tail[0][4], tail[0][5]);
  g.fillStyle(PAPER, 1);
  g.fillRoundedRect(-a, -c, a * 2, c * 2, 13);
  if (tail) g.fillTriangle(tail[1][0], tail[1][1], tail[1][2], tail[1][3], tail[1][4], tail[1][5]);
  const box = scene.add.container(x, y, [g, words]).setDepth(94).setScale(0.55);
  scene.tweens.add({ targets: box, scale: 1, duration: 120, ease: 'Back.out' });
  return box;
}
