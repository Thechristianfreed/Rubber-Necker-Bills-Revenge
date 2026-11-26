// Start a new quick game: a folder of its own, with a small game in it that
// already plays. Having a folder is what puts it on the tape (src/minis/roster.ts
// finds it): no file that anybody else works in is touched.
//
//   node tools/new_mini.mjs <id> "<TITLE>"
//   node tools/new_mini.mjs toaster "THE TOASTER"
//
// <id> is its short name: lower-case letters and digits. It is the name of the
// folder (src/minis/<id>), what `&mini=` takes, and the start of the name of
// every picture the game makes (`<id>_...`).
//
// What is made, all of it the new game's own and nobody else's:
//
//   src/minis/<id>/index.ts         what the master list is given
//   src/minis/<id>/<Id>Mini.ts      the game (a placeholder: tap the star three times)
//   src/minis/<id>/art.ts           its paper stand-ins
//   src/minis/<id>/assets/          its photos, once there are some
//   src/minis/<id>/cut.py           how its photos are cut (docs/cutting.md)
//   src/minis/<id>/moments.cjs      the moments its test photographs (docs/testing.md)
//   src/minis/<id>/README.md        what it is, the story behind it, its picture prompts
//   art-src/games/<id>/             the pictures the owner sends, and Adobe's cutouts of them
//
// Nothing else is made, and nothing that was already there is changed.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const [id, title] = process.argv.slice(2);
if (!id || !title || !/^[a-z][a-z0-9]*$/.test(id)) {
  console.error('usage: node tools/new_mini.mjs <id> "<TITLE>"     (id: lower-case letters and digits, starting with a letter)');
  process.exit(1);
}
const dir = `src/minis/${id}`;
if (existsSync(dir)) {
  console.error(`there is already a quick game called "${id}" (${dir}): nothing was changed`);
  process.exit(1);
}
if (['shared', 'word', 'kit', 'roster'].includes(id)) {
  console.error(`"${id}" is taken for something else: pick another short name`);
  process.exit(1);
}
const Name = id.charAt(0).toUpperCase() + id.slice(1) + 'Mini';
const TITLE = title.toUpperCase();
const write = (path, text) => {
  writeFileSync(path, text);
  console.log('  made', path);
};

mkdirSync(`${dir}/assets`, { recursive: true });
mkdirSync(`art-src/games/${id}`, { recursive: true });

write(`${dir}/index.ts`, `import { MiniGame, Piece } from '../kit';
import { buildArt } from './art';
import { ${Name} } from './${Name}';

/** The photos of this game: each takes the place of the paper stand-in with the same
 *  key. The files are in ./assets (cut by ./cut.py). Every key starts with "${id}_". */
const PIECES: Piece[] = [
  // { key: '${id}_star', file: 'star.png', w: 160, border: 3 },
];

/** ${TITLE}. (Say here, in a line, what the game is.) */
export const ${id}: MiniGame = { id: '${id}', make: (host) => new ${Name}(host), art: buildArt, pieces: PIECES };
`);

write(`${dir}/${Name}.ts`, `import Phaser from 'phaser';
import { H, MAX_W, view } from '../../config';
import { img } from '../../art/sticker';
import { sound } from '../../audio/sound';
import { label } from '../../ui/text';
import { Mini, Point } from '../Mini';

/** ${TITLE}. (Say here what the game is and the story behind it.)
 *
 *  As it stands it is a placeholder, to be replaced: tap the star three times
 *  before the clock runs out. It shows the shape of a quick game: \`build\` puts
 *  everything on the page, \`press\` is a finger down, \`update\` runs once a frame,
 *  \`timeUp\` says whether running out of time is a win, and \`bot\` plays it for the
 *  tests. See docs/minigames.md. */
export class ${Name} extends Mini {
  readonly title = '${TITLE}';
  readonly prompt = 'TAP THE STAR!';
  readonly seconds = 8;

  private star!: Phaser.GameObjects.Image;
  private count!: Phaser.GameObjects.Text;
  private taps = 0;
  private botIn = 0.7;

  build(): void {
    const s = this.scene, cx = view.W / 2;
    s.add.rectangle(cx, H / 2, MAX_W * 2, H * 2, 0x2f6f8f);
    this.star = img(s, cx, 270, '${id}_star');
    this.count = label(s, cx, 430, '0 OF 3', 40, '#f6c430');
  }

  press(at: Point): void {
    if (Math.hypot(at.x - this.star.x, at.y - this.star.y) < 100) this.tap();
  }

  private tap(): void {
    this.taps++;
    this.count.setText(\`\${Math.min(this.taps, 3)} OF 3\`);
    sound.tock();
    this.scene.tweens.add({ targets: this.star, rotation: this.star.rotation + 1.2, duration: 160, ease: 'Back.out' });
    if (this.taps === 3) this.host.finish(true);
  }

  timeUp(): boolean {
    return false;
  }

  bot(dt: number): void {
    this.botIn -= dt;
    if (this.botIn > 0) return;
    // (the careless one is too slow to get three in)
    this.botIn = this.host.auto === 'clumsy' ? 4.5 : 0.7;
    this.tap();
  }
}
`);

write(`${dir}/art.ts`, `import Phaser from 'phaser';
import { fillPaper, makePaperArt } from '../../art/paper';
import { star } from '../../art/sticker';

/** The paper stand-ins for this game: what is on the page until there is a photo
 *  (a photo registered under the same key in index.ts takes its place).
 *
 *  Every key starts with "${id}_" (a word on a burst: "word_${id}_..."). The game
 *  cannot make a picture by any other name, or draw over one that is not its own. */
export function buildArt(scene: Phaser.Scene): void {
  makePaperArt(scene, '${id}_star', 160, 160, (c) => {
    star(c, 80, 80, 74, 34, 5);
    fillPaper(c, 'yellow');
  }, { border: 3 });
}
`);

write(`${dir}/moments.cjs`, `// The moments of this game worth a picture, for tools/test/mini_show.cjs: a name,
// and the condition that says the moment has come. \`m\` is the game, \`r\` the scene;
// \`bot\` is who is playing ('' for the careful one, or 'clumsy'). See docs/testing.md.
module.exports = (bot) => [
  ['1-start', 'm.taps === 0'],
  ...(bot ? [] : [['2-two-in', 'm.taps === 2']]),
];
`);

write(`${dir}/cut.py`, `"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/${id}) into the pieces the game loads (src/minis/${id}/assets).

Run:  .venv/bin/python src/minis/${id}/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "${id}")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go


def cut():
    # for example, a sheet of three things on a plain background, left to right:
    #
    #   sheet = sorted(mc.pieces(mc.load("${id.toUpperCase()}1-things-cutout.png")), key=lambda p: p[0])
    #   for name, (_, _, piece) in zip(("star", "moon", "sun"), sheet):
    #       mc.save(f"{name}.png", piece)
    print("nothing to cut yet")


if __name__ == "__main__":
    cut()
`);

write(`${dir}/README.md`, `# ${title}

What this quick game is, in a few lines. Its short name is \`${id}\`.

## The story

(In the owner's own words. A line somebody really said goes in exactly as it was said.)

## How it plays

(What the player does, how it is won and lost, what the two bots do.)

## Pictures

(The prompts for the owner to generate, numbered, as in \`docs/art-prompts.md\`; and for
each picture that has come back, where it is kept in \`art-src/games/${id}\` and what was
cut from it.)

## Sound

(What it makes of its own, and how loud each came out: \`tools/test/listen.cjs\`.)
`);
write(`${dir}/assets/.gitkeep`, '');
write(`art-src/games/${id}/.gitkeep`, '');

console.log(`
"${id}" is ready, and on the tape (after the games that were there, before the last one).
To see it by itself:

  node tools/make_preview.mjs <somewhere>/${id}.html --only ${id}

and publish that page as an artifact of its own (not to the master preview's address).
`);
