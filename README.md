# Rubber Necker: Bill's Revenge

A side-scrolling Android game. Bill hangs out of his avocado-green '59 Bug with
a baseball bat and whacks the rubberneckers who are jamming up the other side of
the highway. Their necks stretch like rubber and noodle around behind them.

This is an early playable prototype: one level, placeholder audio.

## Play it

```bash
npm install
npm run dev
```

Open the printed address on a phone held sideways, or on a computer.

| Control | Touch | Keyboard |
| --- | --- | --- |
| Swing | tap anywhere | Space |
| Duck | hold the DUCK button | Down arrow or S |
| Road Rage special | RAGE button when the ring is full | R or Enter |

Add `?auto` to the address to watch the game play itself (`?auto=clumsy` plays badly).

## Build

```bash
npm run build
```

Writes the web build to `dist/` (this is what the Android wrapper will package).

```bash
npm run build:single
```

Writes one self-contained `dist-single/index.html` that can be shared as a single file.

```bash
node tools/make_artifact.mjs
```

Converts that single file into a page fragment for hosts that add their own page wrapper.

## How it is put together

- **Engine:** [Phaser 4](https://phaser.io) with TypeScript and Vite. The Android app will wrap the web build with Capacitor.
- **Art style:** Bill's scrapbook. Every piece is a cutout with a white paper
  border and a drop shadow, under a printed-page finish (paper grain and print
  dots, `src/art/finish.ts`). Bill's head comes from real photos
  (`art-src/photos`), cut out with Adobe (`art-src/adobe`) and built by
  `tools/make_heads.py`. The rest is still drawn in code in
  `src/art/textures.ts` and is being replaced by photo cutouts; the image
  prompts for those are in `docs/art-prompts.md`.
- **Audio:** synthesised placeholders in `src/audio/sound.ts`, to be replaced by
  family recordings.
- **Tuning:** speeds, timing windows and scoring live in `src/config.ts`; the
  level script is `src/data/levels.ts`; Bill's lines are `src/data/phrases.ts`.
- **Ideas backlog:** `docs/level-ideas.md`.

To rebuild Bill's heads after changing the source cutouts:

```bash
pip install pillow numpy opencv-python-headless
```

```bash
python tools/make_heads.py
```
