# Notes for Claude

A family present: a Phaser + TypeScript + Vite game about Bill (an Android
wrap comes later). The owner directs and Claude builds. Read `README.md`
first, then the doc for whatever is being touched: `docs/minigames.md`,
`docs/art-prompts.md`, `docs/cutting.md`, `docs/testing.md`, `docs/music.md`,
`docs/voice.md`, `docs/level-ideas.md`.

A fresh checkout is made ready with `bash tools/setup.sh` (the game's
packages, and `.venv` with what the Python tools need).

## How we work

- **Look:** a scrapbook. Everything is a photo cutout with a white paper
  border and a drop shadow. Until a photo exists, a cut-paper stand-in is
  registered under the same texture key, and the photo replaces it later
  (`PIECES` in `src/art/photos.ts`).
- **Pictures:** Claude writes prompts into `docs/art-prompts.md`; the owner
  generates them and sends them back; Claude cuts them out (Adobe background
  removal and body-part selection, results kept in `art-src/adobe`) with
  `tools/make_cutouts.py`. Bill's own heads are `tools/make_heads.py`.
  The steps, and what goes wrong with them, are in `docs/cutting.md`.
  Pictures the owner sends while Claude is in the middle of something can be
  seen but do not arrive as files: ask for them again in a message of their own.
- **Real people:** the family's photos, their voice recording, the workout
  tape's audio and the arcade announcer's clip that ends the fight are in
  this public repository on purpose; the owner has said so each time. Ask
  again for anything new that is somebody else's.
- **Testing:** test what changed, not the whole game. The game plays itself:
  `?auto` or `?auto=clumsy`, with `&level=street|highway|locker|sleepover|minis`
  and `&mini=workout|phone|bop|bat|sand|fight`. Then show the owner screenshots.
  The scripts that do it are in `tools/test` (`docs/testing.md`): keep a new
  one there, not in scratch space, if another session would want it.
  Home Movies has a SKIP tag (top left) for the owner's own testing, for now.
- **Sound:** measure what actually comes out (`tools/test/listen.cjs`), never
  just that the code ran: quiet effects have slipped through that way. Level
  short sounds by their loudest 40 ms, not their peak.
- **Words on screen** are American ("Mom"), and plain.

## Build and publish

```bash
npx tsc --noEmit
npm run build && npm run build:single && node tools/make_artifact.mjs <somewhere>/rubber-necker.html
```

- The preview the owner plays is a Claude artifact:
  https://claude.ai/artifact/GwrBX3NsV3Jue3LDMUhb1c. Publish to that address
  (pass it as `url`); otherwise a second one is created.
- Sound is not inside the page. `public/music`, `public/voice` and
  `public/sfx` go up beside it as supporting files (`audio/mpeg`) whenever
  one of them changes.
- The page has to stay under 16 MB. Pictures are kept as WebP to fit
  (`tools/shrink_assets.py`; the cutout tools save WebP themselves, and the
  code still calls each one "name.png").
- Bump the `prototype x.y` on the title screen with each build that is
  published, so the owner can see they have the new one.

## Adding things

- A quick game: one class in `src/minis`, one line in `ROSTER` in
  `src/scenes/MiniScene.ts` (see `docs/minigames.md`).
- A level: a script in `src/data/levels.ts` and, if it plays differently, a
  scene beside `GameScene.ts` that extends `PlayScene.ts`.
