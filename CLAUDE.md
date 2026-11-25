# Notes for Claude

A family present: a Phaser + TypeScript + Vite game about Bill (an Android
wrap comes later). The owner directs and Claude builds. Read `README.md`
first, then the doc for whatever is being touched: `docs/minigames.md`,
`docs/pictures.md`, `docs/characters.md`, `docs/art-prompts.md`,
`docs/cutting.md`, `docs/testing.md`, `docs/music.md`, `docs/voice.md`,
`docs/level-ideas.md`.

A fresh checkout is made ready with `bash tools/setup.sh` (the game's
packages, and `.venv` with what the Python tools need).

## One game, one chat, one folder

The owner makes each new quick game in a chat of its own, and several chats
may be going at once. **Nothing that already exists is to be changed or lost
by a chat that is making something else.** Everything below follows from
that.

- **`main` is the master game:** every finished game, stitched into one by
  the master list (`src/minis/roster.ts`, which finds each game's folder by
  itself: adding a game changes no shared file). A chat never pushes to
  `main`. It
  works on its own branch, and its work goes into `main` by a pull request,
  which is opened only when the owner asks and merged only when the owner
  says.
- **A quick game is a folder.** Start one with
  `node tools/new_mini.mjs <id> "<TITLE>"`. Everything of the game's goes in
  `src/minis/<id>/` (its class, paper art, tables, photos in `assets`,
  `cut.py`, `moments.cjs`, and a README with its story and picture prompts).
  The pictures the owner sends and Adobe's cutouts of them go in
  `art-src/games/<id>/`. A recording of its own is
  `public/sfx/<id>-<name>.mp3`.
- **What is already made is there to use.** Every place, thing, effect and
  word any game has made is in the catalogue (`docs/pictures.md`,
  `docs/catalogue`), by the name to call it by; the places are laid with one
  call each (`src/minis/shared/places.ts`). Look there before making
  anything.
- **The people are shared.** Who is in the game, and which faces each of
  them has, is in `docs/characters.md`. Use those. A face that is missing is
  asked of the owner once, for every game, and goes in with the common
  pictures: that is one of the things to stop and ask about.
- **Keep to it.** A chat making a game does not edit another game's folder,
  the common pictures and art (`src/assets`, `src/art`, `src/data`), the
  levels, the scenes, the sound, or the tools. What it needs from those it
  uses as it is. If something shared truly has to change, stop and ask the
  owner first: it is a change to every game.
- **A game cannot draw over anybody else's pictures,** even by mistake.
  Every picture it makes is called `<id>_...`; anything else is refused, with
  an error the tests report (`fence` in `src/art/sticker.ts`).
- **Before asking the owner about a pull request:**
  `node tools/check_branch.mjs`, which lists what the branch has changed and
  stops on anything that was already there; the game playing itself; and the
  picture fingerprints, before and after (`docs/testing.md`), which should
  show the new game's pictures as new and nothing else at all.
- **The first six games** (workout, phone, bop, bat, sand, fight) were made
  before this. Their classes are in their folders; their paper art, tables
  and pictures are in the common places, several of them shared between two
  games. That is one more reason nobody touches those.

## How we work

- **Look:** a scrapbook. Everything is a photo cutout with a white paper
  border and a drop shadow. Until a photo exists, a cut-paper stand-in is
  registered under the same texture key, and the photo replaces it later
  (`PIECES` in the game's `index.ts`; for the levels and the first six
  games, `PIECES` in `src/art/photos.ts`).
- **Pictures:** Claude writes prompts (in the game's README; the levels' and
  the first six games' are in `docs/art-prompts.md`); the owner generates
  them and sends them back; Claude cuts them out (Adobe background removal
  and body-part selection) with the game's `cut.py`, which borrows
  `tools/make_cutouts.py`. Bill's own heads are `tools/make_heads.py`. The
  steps, and what goes wrong with them, are in `docs/cutting.md`. Pictures
  the owner sends while Claude is in the middle of something can be seen but
  do not arrive as files: ask for them again in a message of their own.
- **Real people:** the family's photos, their voice recording, the workout
  tape's audio and the arcade announcer's clip that ends the fight are in
  this public repository on purpose; the owner has said so each time. Ask
  again for anything new that is somebody else's.
- **Testing:** test what changed, not the whole game. The game plays itself:
  `?auto` or `?auto=clumsy`, with `&level=street|highway|locker|sleepover|minis`
  and `&mini=<id>`. Then show the owner screenshots. The scripts that do it
  are in `tools/test` (`docs/testing.md`). Home Movies has a SKIP tag (top
  left) for the owner's own testing, for now.
- **Sound:** measure what actually comes out (`tools/test/listen.cjs`), never
  just that the code ran: quiet effects have slipped through that way. Level
  short sounds by their loudest 40 ms, not their peak.
- **Words on screen** are American ("Mom"), and plain.

## Build and publish

There are two kinds of preview, and they have different addresses.

**One game by itself.** This is what a chat that is making a game shows the
owner:

```bash
node tools/make_preview.mjs <somewhere>/<id>.html --only <id>
```

- Publish it as an artifact of the chat's own: with no `url` the first time
  (that makes a new address: tell the owner what it is), and from the same
  file path after that, which keeps the address.
- **Never publish it to the address of the whole game.**
- Its title screen says which game it is and when it was built, so the owner
  can see they have the new one. Leave the `prototype x.y` number alone.

**The whole game** (the master preview) is
https://claude.ai/artifact/GwrBX3NsV3Jue3LDMUhb1c.

```bash
node tools/make_preview.mjs <somewhere>/rubber-necker.html
```

- It is published only from `main`, and only when the owner asks: pass that
  address as `url`, or a second one is created.
- Bump the `prototype x.y` on the title screen (`src/scenes/TitleScene.ts`)
  with each build published there.

For both:

- Sound is not inside the page. `public/music`, `public/voice` and
  `public/sfx` go up beside it as supporting files (`audio/mpeg`): all of
  them the first time an artifact is published, and after that whenever one
  changes.
- The page has to stay under 16 MB. Pictures are kept as WebP to fit
  (`tools/shrink_assets.py`; the cutout tools save WebP themselves, and the
  code still calls each one "name.png").
- `dist-single` holds whichever was built last. Build the whole game again
  before testing the whole tape.

## Adding things

- A quick game: `node tools/new_mini.mjs <id> "<TITLE>"`, and then
  `docs/minigames.md`.
- A level: a script in `src/data/levels.ts` and, if it plays differently, a
  scene beside `GameScene.ts` that extends `PlayScene.ts`. A level is shared
  ground: say so to the owner before starting one in a chat that was opened
  for a quick game.
