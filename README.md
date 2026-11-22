# Rubber Necker: Bill's Revenge

A side-scrolling Android game. Bill hangs out of his avocado-green '59 Bug with
a baseball bat and whacks the rubberneckers who are jamming up the other side of
the highway. Their necks stretch like rubber and noodle around behind them.

This is an early playable prototype with placeholder audio and two levels:

1. **Mailbox Baseball** (the sixties): Bill as a kid on a Schwinn Stingray, whacking mailboxes with a rolled-up newspaper. Its art is cut-paper stand-ins for now.
2. **Highway Jam** (the Bug years): the avocado Bug, the baseball bat, and a highway full of rubberneckers.

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

Add `?auto` to the address to watch the game play itself (`?auto=clumsy` plays badly), and `&level=street` or `&level=highway` to pick the level.

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
- **Art style:** Bill's scrapbook. Every piece is a photo cutout with a white
  paper border and a drop shadow. Bill's head comes from real photos
  (`art-src/photos`), cut out with Adobe (`art-src/adobe`) and built by
  `tools/make_heads.py`. The interface, lettering and road paint are cut paper
  (`src/art/paper.ts`, `src/art/ui.ts`), filled with small photo sheets of real
  paper. The remaining image prompts are in `docs/art-prompts.md`.
- **Audio:** synthesised placeholders in `src/audio/sound.ts`, to be replaced by
  family recordings.
- **Tuning:** timing windows and scoring live in `src/config.ts`; the level
  scripts are in `src/data/levels.ts`; Bill's lines are `src/data/phrases.ts`;
  how Bill is assembled in each level (car or bike) is `RIGS` in
  `src/objects/Bill.ts`.
- **Ideas backlog:** `docs/level-ideas.md`.

Photo cutouts live in `src/assets/scrap` and are listed in `src/art/photos.ts`,
which swaps each one in over the drawing it replaces. They are built from
generated images (`art-src/generated`) that Adobe has cut out (`art-src/adobe`).

To rebuild Bill's heads or the photo cutouts after changing the sources:

```bash
pip install pillow numpy opencv-python-headless
```

```bash
python tools/make_heads.py
```

```bash
python tools/make_cutouts.py
```
