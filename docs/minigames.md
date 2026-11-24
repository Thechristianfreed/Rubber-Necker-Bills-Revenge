# Home Movies: the quick games

The video cassette on the level select starts a run of quick games, one
straight after another. Each says what to do in a few words, runs against the
clock, and is stamped a hit or a miss. Every game is played once, in the
order they are listed, with a mark at the top left for each: a tick for a hit
and a cross for a miss. Then the tape ends, and says how many were cleared.

## The three so far

| Game | What to do | Wins when |
| --- | --- | --- |
| Mom's workout tape (`workout`) | Mom is on the television and strikes a pose: tap the snapshot of the same pose. Then the breathing, done as on the tape, bent over with a hand on each knee: hold anywhere to breathe in, and let go in the green at the top of the meter for a "PAH". Then into the pose, and hold it. All six poses, once each, in a different order every time. | 8 points out of 12 (one for each right pose, one for each proper breath) |
| The tour bus (`phone`) | Heads bob up at the windows. Tap the ones holding up a phone, and nobody else. | 3 filmers caught before 2 innocent gawkers are |
| The sleepover (`bop`) | Bop DJ exactly the number of times asked, then stop. | The count is exact when the clock runs out, or has been for a moment |

Letting go of the breath too early is a "pfff"; holding on half a second
past full is a coughing fit. Neither scores.

The workout has the tape's own music, breath in and "PAH" (see "The workout
tape" in `docs/music.md`), and stand-ins if those files are missing. A game
asks for music of its own with `readonly music = '<file name in
public/music>'`; without it, the mode's usual track plays.

## Adding one

1. Copy one of the classes in `src/minis` (the sleepover one is the
   shortest). A game says its `title`, its `prompt` (a few words, shown
   large), and how many `seconds` it lasts; `build()` puts things on the
   page, `press()` and `release()` are the finger going down and up,
   `update()` runs every frame, and `timeUp()` says whether running out of
   time counts as a win. Call `this.host.finish(true or false)` to end it
   early.
2. Add it to `ROSTER` at the top of `src/scenes/MiniScene.ts`.
3. Give it a `bot()` so the game can test itself: `?auto&level=minis&mini=<id>`
   plays it well, `?auto=clumsy` plays it badly.

A game does not tidy up after itself: the scene clears away everything it
added. Art goes in `src/art/minis.ts`, or use anything already made for the
levels (the bus and the sleepover games do).

## Tuning

- Which games are on the tape, and in what order: `ROSTER` at the top of
  `src/scenes/MiniScene.ts`.
- The workout: the pass mark and how long each pose is given (`PASS`,
  `SECONDS_EACH`; there are as many rounds as there are poses), how long a
  breath takes and how big the green zone is (`INHALE`, `ZONE`, `TOO_LONG`),
  at the top of `src/minis/WorkoutMini.ts`. Each pose is a photo of a body
  with the head taken off (`src/data/workout.ts`, written by
  `tools/make_cutouts.py`, says where each one's chin is); behind them are
  paper dolls described joint by joint in `POSES` in `src/art/minis.ts`,
  which show if a photo is missing. A new pose needs a line in `POSES` and a
  figure on a sheet in `WORKOUT_SHEETS` in the tool. Mom is framed to fill
  the television's screen in whatever pose she is in (`frame()`).
