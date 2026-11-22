import Phaser from 'phaser';
import { H, MAX_W, MIN_W, view } from './config';
import { sound } from './audio/sound';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { TitleScene } from './scenes/TitleScene';

const stage = document.getElementById('game') as HTMLElement;

/** The playfield is always 540 design pixels tall; its width follows the
 *  screen's aspect ratio so wide phones see more road instead of black bars. */
function designWidth(): number {
  const w = stage.clientWidth || window.innerWidth || 960;
  const h = stage.clientHeight || window.innerHeight || 540;
  if (h > w) return 960; // portrait: the "turn your phone" overlay is showing
  return Phaser.Math.Clamp(Math.round((H * w) / h), MIN_W, MAX_W);
}

view.RES = Math.min(window.devicePixelRatio || 1, 2);
view.W = designWidth();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1b1820',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: Math.round(view.W * view.RES),
    height: Math.round(H * view.RES),
  },
  input: { activePointers: 3 },
  // One texture per batch. Phaser 4.2's multi-texture shader picks its sampler
  // with an exact float compare, which leaves holes in rotated sprites on some
  // GPUs. The game draws few enough sprites that the extra draw calls are free.
  render: { antialias: true, maxTextures: 1 },
  scene: [BootScene, TitleScene, GameScene],
});

(window as unknown as { __game: Phaser.Game }).__game = game;

let resizeTimer = 0;
const refit = () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    const w = designWidth();
    if (w === view.W) return;
    view.W = w;
    game.scale.setGameSize(Math.round(w * view.RES), Math.round(H * view.RES));
  }, 120);
};
window.addEventListener('resize', refit);
if ('ResizeObserver' in window) new ResizeObserver(refit).observe(stage);

// If the phone will not rotate (some in-app browsers), let people play small.
const rotate = document.getElementById('rotate');
rotate?.addEventListener('click', () => rotate.classList.add('dismissed'));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) sound.stopMusic();
  else if (game.scene.isActive('game')) sound.startMusic();
});
