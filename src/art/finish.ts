import Phaser from 'phaser';
import { DEPTH, H, MAX_W, TEX } from '../config';

/** How far past the screen edges the world and finish are painted, so camera
 *  shake never exposes a gap. */
export const BLEED = 48;

/** `?finish=1` / `?finish=0` in the address forces the finish on or off. */
const forced = new URLSearchParams(location.search).get('finish');
let tooSlow = false;

/** The printed-page finish laid over an entire scene: one see-through sheet of
 *  cream paper with grain, fibres and print dots (the `paper` texture). It is
 *  what makes photos, drawings and interface look stuck in the same scrapbook.
 *
 *  It is a full-screen layer, so on a phone that cannot hold a smooth frame
 *  rate with it, it switches itself off: how the game plays matters more. */
export function addPrintFinish(scene: Phaser.Scene): void {
  if (forced === '0' || (tooSlow && forced !== '1')) return;
  const w = MAX_W + BLEED * 2, h = H + BLEED * 2;
  const sheet = scene.add.tileSprite(-BLEED, -BLEED, w * TEX, h * TEX, 'paper').setOrigin(0, 0).setScale(1 / TEX)
    .setDepth(DEPTH.overlay + 50);
  if (forced === '1') return;

  // watch the first few seconds; drop the sheet if frames are being missed
  let frames = 0, elapsed = 0, settled = false;
  const watch = (_t: number, delta: number) => {
    if (settled) return;
    elapsed += delta;
    if (elapsed < 1500) return; // ignore start-up hitches
    frames++;
    if (elapsed < 5500) return;
    settled = true;
    scene.events.off(Phaser.Scenes.Events.UPDATE, watch);
    const fps = (frames * 1000) / (elapsed - 1500);
    if (fps < 42) {
      tooSlow = true;
      sheet.destroy();
    }
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, watch);
}
