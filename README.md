# Rubber Necker: Bill's Revenge

A side-scrolling Android game. Bill hangs out of his avocado-green '59 Bug with
a baseball bat and whacks the rubberneckers who are jamming up the other side of
the highway. Their necks stretch like rubber and noodle around behind them.

This is an early playable prototype with two levels and two bonus levels:

1. **Paper Route** (the fifties): Bill the paperboy on a Schwinn Stingray, tossing papers into mailboxes.
2. **Highway Jam** (the Bug years): the avocado Bug, the baseball bat, and a highway full of rubberneckers.
3. **The SKIPPY Jar** (bonus, high school): a true story. Seen over Bill's
   shoulder in the school hallway, he returns everything that comes flying out
   of the bully's locker with the bully's own tennis racquet.
4. **The Hot Carl** (bonus, the sleepover): another true story. Every time the
   light comes on, tap as fast as you can; when it goes off, freeze.

And **Home Movies** (the video cassette on the level select): quick games a
few seconds long, one straight after another, a little faster every time
round. Three misses and the tape runs out. There are three so far: Mom's
workout tape (copy her pose, then hold to breathe in and let go at the top
for the PAH), the tour bus (tap whoever is on the phone) and the sleepover
(bop DJ exactly as many times as asked). See `docs/minigames.md`.

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

Add `?auto` to the address to watch the game play itself (`?auto=clumsy` plays badly), and `&level=street`, `&level=highway`, `&level=locker` or `&level=sleepover` to pick the level. `&level=minis` plays the quick games, and `&mini=workout`, `&mini=phone` or `&mini=bop` keeps to one of them.

## Build

```bash
npm run build
```

Writes the web build to `dist/` (this is what the Android wrapper will package).

```bash
npm run build:single
```

Writes one `dist-single/index.html` that can be shared as a single file. Everything is inside it except the sound recordings, which sit beside it in `dist-single/music/`, `dist-single/voice/` and `dist-single/sfx/`; without those folders the game still plays, with no music and only synthesised effects.

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
- **Audio:** Bill's lines and the mouth sounds (bonk, boing, whoosh...) are a
  family recording, cut up by `tools/make_voice.py` into `public/voice/`.
  Hits, mailbox clunks, stretches and springs are public-domain library
  recordings, several of each, built by `tools/make_sfx.py` into `public/sfx/`
  (see `docs/voice.md` for both). The music is one recording per level in
  `public/music/` (see `docs/music.md` for the tracks and their credit). The
  workout game uses the real tape's music and breathing, cut out of a
  recording by `tools/make_tape.py`. The few effects left over are
  synthesised in `src/audio/sound.ts`.
- **Tuning:** timing windows and scoring live in `src/config.ts`; the level
  scripts are in `src/data/levels.ts`; Bill's lines are `src/data/phrases.ts`;
  how Bill is assembled in each level (car, bike or on foot) is `RIGS` in
  `src/objects/Bill.ts`.
- **Scenes:** `src/scenes/PlayScene.ts` holds what every level shares (the
  scoreboard, taps and buttons, speech bubbles, the results page).
  `GameScene.ts` is the side-on levels; `LockerScene.ts` is the hallway, seen
  over Bill's shoulder; `SleepoverScene.ts` is the light-switch level.
  `MiniScene.ts` runs the quick games, which are in `src/minis`.
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
