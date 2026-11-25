# Testing: the game plays itself

Nobody plays the game to test it. It plays itself in a browser with no
window, a script takes pictures of the moments that matter, and those are
looked at and then shown to the owner. Test what changed, not the whole
game.

The scripts are in `tools/test`. They need Playwright and a Chromium, which
a Claude cloud session has already (`require('playwright')` finds them from
anywhere). Do not add Playwright to `package.json`: a second copy would not
find that browser.

## The page to test

Test the page as it is published, with its pictures and recordings beside
it:

```bash
node tools/make_preview.mjs <somewhere>/rubber-necker.html
```

That builds `dist-single` (`npm run build:single`), takes the pictures out
of the page into `dist-single/pictures`, and writes the page to publish.
`dist-single/index.html` is the same page, for testing. (With
`--only <game>` it builds a page that plays one quick game by itself, and
`dist-single` is left holding that: on it, `&level=minis` is that one game.
Build again without `--only` before testing the whole tape.)

`npm run build:single` by itself leaves every picture inside the page, which
also works, but is not what gets published.

```bash
cd dist-single && python3 -m http.server 5180
```

Leave that running, and give the scripts `http://localhost:5180/`. (The
server started by `npm run dev` works too, and is quicker while something is
being changed.)

What goes on the address:

| | |
| --- | --- |
| `?auto` | the game plays itself, carefully |
| `?auto=clumsy` | it plays itself badly, and finds the other endings |
| `&level=street` (or `highway`, `locker`, `sleepover`) | straight into that level |
| `&level=minis` | straight into Home Movies |
| `&mini=sand` (or `workout`, `phone`, `bop`, `bat`, `fight`) | only that quick game |

The game is 540 tall and between 880 and 1240 wide, depending on the
screen: try a change at the narrowest as well as at 960 or 1100.

What a script can reach on the page:

- `window.__game`: Phaser's game. `__game.loop.sleep()` and `.wake()` stop
  and start the clock; `__game.scene.isActive('title')`.
- `window.__rn`: whichever scene is on. In a level: `levelT`, `whacked`,
  `hearts`, `over`, `canRestart`. In Home Movies: `state` (`snow`, `card`,
  `play`, `stamp`, `over`), `playing` (which game), `score`, `counted`,
  `marks`, and `mini`, the game itself, with everything in it (private or
  not: `mini.phase`, `mini.chad.pose`, `mini.said`).
- `window.__sound`: the sound, with its outputs (`master`, `sfx`, `music`,
  `voiceOut`) and everything that makes a noise (`aww()`, `sand()`).

## The scripts

Each says how to run it in its first lines. `<base url>` is the address
above; `<outPrefix>` is where the pictures go, and the start of their names.

**Home Movies**

| | |
| --- | --- |
| `mini_show.cjs <base url> <outPrefix> <mini> [bot] [width]` | One quick game, photographed at each of its moments at twice the size, for showing. The moments are listed in the game's own folder (`src/minis/<mini>/moments.cjs`). |
| `mini_strip.cjs <base url> <outDir> <mini> [bot] [width] [step]` | The whole of one quick game, a frame every `step` seconds. For a game with no list yet, and for finding where something goes wrong. |
| `mini_by_hand.cjs <base url> <outPrefix> <mini> <width> "<condition>"...` | One quick game with nobody at the controls. |
| `bat_lose.cjs <base url> <out.png>` | Payback's losing ending, which neither bot reaches. |
| `tape_whole.cjs <base url> <out.png> [bot] [width]` | The whole tape: which games came up, how it ended, and every error and every file that failed to load. Run it before publishing. |
| `skip_test.cjs <base url> <outPrefix>` | The SKIP tag, by real taps, through to the end of the tape. |
| `textures.cjs <base url> <out.json>` and `textures.cjs --diff <before> <after>` | A fingerprint of every picture the game has made, to take before a change and again after: proof that no picture that was already there has been touched. |

**The levels**

| | |
| --- | --- |
| `shot.cjs <url> <outPrefix> [width] [height] [times]` | Any page, at the times given. |
| `level_play.cjs <url> <outPrefix> <width> <height> <times>` | A level playing itself: frames, and its numbers beside each. |
| `level_at.cjs <url> <outPrefix> <width> <height> <scale> <times>` | A level photographed as its own clock passes each time. |
| `level_finish.cjs <url> <out.png>` | A level played to the end, and its results page. |
| `all_scenes.cjs <base url> <outPrefix>` | The title, the level list, every level and a quick game: after a change to something they share. |
| `touch.cjs <base url> <out.png>` | The first level on a phone held sideways, with real touches. |

**Sound**

| | |
| --- | --- |
| `listen.cjs <base url> [where] "<call>" [ms] ...` | How loud a sound actually comes out, beside one that is known. |
| `sfx_listen.cjs <base url>` | Every take in every bank of recorded effects, one at a time. |
| `tape_music.cjs <base url>` | Which music plays under which quick game. |
| `music_test.cjs <base url> <outPrefix>` | Into each level by tapping: the music's level, and that it stops. |
| `voice_test.cjs <base url>` | Each level played through: which lines were said, which effects made. |
| `spec.py <sound file> <out.png>` | A picture of a sound, for finding where things are in a recording. |
| `audio_events.py <sound file>...` | The separate sounds in a file: where each is, and how loud. |
| `voice_find.py <recording>` | The lines in a new recording of the family, by a speech recogniser. |
| `voice_check.py` | The lines as the game has them, heard back by the recogniser. |

**Pictures**

| | |
| --- | --- |
| `sheet.py <folder> <out prefix> [columns] [per sheet] [tile width]` | A contact sheet of every PNG in a folder. |
| `grid.py <picture> <out.png> <x0> <y0> <x1> <y1> <step>` | A piece of a picture with a ruled grid over it (see `cutting.md`). |
| `catalogue.cjs <base url>` | Makes `docs/catalogue` again: every picture in the game by name, on sheets (see `pictures.md`). |

The Python ones are run with the Python that `tools/setup.sh` makes:
`.venv/bin/python tools/test/sheet.py ...`. The two that listen to the
family's lines need `faster-whisper` as well (see `tools/requirements.txt`).

## After changing a quick game

```bash
node tools/test/mini_show.cjs http://localhost:5180/ shots/sand sand
```

```bash
node tools/test/mini_show.cjs http://localhost:5180/ shots/sand-clumsy sand clumsy
```

```bash
.venv/bin/python tools/test/sheet.py shots shots/sheet 3 9 640
```

To be sure nothing that was already there has changed, take the fingerprints
of every picture on the main line's build and on yours, and compare:

```bash
node tools/test/textures.cjs http://localhost:5180/ shots/after.json
```

```bash
node tools/test/textures.cjs --diff shots/before.json shots/after.json
```

A new game should show its own pictures as "new" and nothing else at all.

Then look at the sheets. A script that says "no errors" has only said that
nothing threw: a head hung in the wrong place, a word over a face, a hand
off the bottom of the page are all "no errors". Send the owner the sheets
that show the change. Before publishing, `tape_whole.cjs` once, at its
narrowest.

(Put the pictures somewhere outside the repository, or in a folder that is
not committed.)

## Writing a condition

`mini_show.cjs` takes each picture when a condition comes true, with the
game's clock stopped while it does. A condition is a line of JavaScript, with
`m` the quick game and `r` the scene:

```js
['07-jarring', "!m.pair && m.round === 1 && m.shane.pose === 'throw' && m.lean > 0.5"],
```

`said('GIMME')` is true while somebody is saying that; `piece('hand_grab')`
is that picture in a close-up; `word('youdidit')` is true once that word has
landed.

- Write it about what is on the page (a pose, a flag, a tween that has got
  somewhere), not about `m.t` alone. Stopping the clock for the picture
  before makes times drift, and a moment that lasts a tenth of a second is
  then missed.
- "missed (gone)" means the game ended before the condition came true. It is
  the condition that is wrong far more often than the game.
- A picture taken the instant a pose changes catches things half way.
  `m.knock > 0.9` (he is nearly all the way back) is the kind of thing that
  gets the moment itself.

## Sound

Measure what comes out, never just that the code ran: a sound can be made
and be too quiet to hear, and several have been.

```bash
node tools/test/listen.cjs http://localhost:5180/ "s.aww()" 2200 "s.twinkle()"
```

- A short sound is leveled by its loudest 40 ms or so, not by its peak.
  `listen.cjs` gives that.
- Its first row is the mouth "bonk", about 0.17 where everything meets
  (`master`). A new effect belongs somewhere near that; one at 0.03 will not
  be heard over the music. The sandbox game's came out at: the audience 0.19,
  the trombone 0.20, the handful of sand 0.16, the twinkle 0.10.
- Measure with nothing else running. On a busy machine the meter misses the
  loudest moment and reads low: one take read 0.09 with three other scripts
  going, and 0.19 by itself.
- A script about sound goes in by a tap on the title, as a person does
  (`tapIn()` in `lib.cjs`). Opened straight into Home Movies with
  `?auto&level=minis`, the first game asks for its music before any tap has
  allowed sound, and plays in silence: that is the test, not the game.
- Nobody has heard any of it. Levels can be measured; whether a sound is the
  right sound is for the owner to say, in the preview.
