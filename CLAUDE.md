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
- **Real people, and a public repository:** the owner has said, once and for
  every time to come, that nothing about this project needs keeping out of
  the public repository: the family's photos, their names (full names
  included), how they are related, their voices, the workout tape, the
  arcade announcer's clip. Do not ask about it again, and do not soften or
  leave out a fact because the repository is public. (Passwords and keys
  are another matter, and never go in.)
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

- **Neither the pictures nor the sound are inside the page.** They go up
  beside it as supporting files, from `dist-single`, at the same paths:
  `pictures/*.json` (`application/json`) and `music/`, `voice/`, `sfx/`
  (`audio/mpeg`). `make_preview.mjs` lists them when it finishes. (The
  owner has seen the pictures and heard the sound arrive this way in the
  preview.)
- **The pictures are sent with every publish.** Each file of them is named
  for what is in it, so one that has not changed is the same file as before.
  A `pictures/...` file the artifact still has from an earlier build, and
  that is not in the new list, is taken away (pass `null` for it): list the
  artifact's files to find them.
- **The recordings are sent** the first time an artifact is published, and
  after that when one changes.
- If the pictures cannot be fetched the game still plays, all in cut paper:
  somebody who sees paper dolls where there were photos is seeing that.
- A page may be 16 MB, and a file beside it 16 MB. The page is under 2 MB
  now, and the pictures are split into files of 6 MB, so neither is close.
  Pictures are kept as WebP all the same (`tools/shrink_assets.py`; the
  cutout tools save WebP themselves, and the code still calls each one
  "name.png").
- `dist-single` holds whichever was built last, and is what the tests are
  run on. Build the whole game again before testing the whole tape.

## Adding things

- A quick game: `node tools/new_mini.mjs <id> "<TITLE>"`, and then
  `docs/minigames.md`.
- A level: a script in `src/data/levels.ts` and, if it plays differently, a
  scene beside `GameScene.ts` that extends `PlayScene.ts`. A level is shared
  ground: say so to the owner before starting one in a chat that was opened
  for a quick game.
