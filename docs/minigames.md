# Home Movies: the quick games

The video cassette on the level select starts a run of quick games, one
straight after another. Each says what to do in a few words, runs against the
clock, and is stamped a hit or a miss. Every game is played once, in the
order they are listed, with a mark at the top left for each: a tick for a hit
and a cross for a miss. Then the tape ends, and says how many were cleared.

## The games so far

| Game | What to do | Wins when |
| --- | --- | --- |
| Mom's workout tape (`workout`) | Mom is on the television and strikes a pose: tap the snapshot of the same pose. Then the breathing, staying in that pose: hold anywhere to breathe in, and let go in the green at the top of the meter for a "PAH". Then hold it. All six poses, once each, in a different order every time. | 8 points out of 12 (one for each right pose, one for each proper breath) |
| The tour bus (`phone`) | Heads bob up at the windows. Tap the ones holding up a phone, and nobody else. | 3 filmers caught before 2 innocent gawkers are |
| The sleepover (`bop`) | Bop DJ exactly the number of times asked, then stop. | The count is exact when the clock runs out, or has been for a moment |
| Payback (`bat`) | All week Shane shoves his brother Chad about (a calendar turns a page for each shove, and a "FED UP" thermometer fills). On Friday Chad finds the baseball bat, and Shane runs for it. Chad gains on him by himself: tap to swing when he is close enough for the bat to reach. Shane's "!" is the moment. Too soon and Chad spins round on the end of the bat; too late and Shane has noticed and is away again. It ends at the back door, with their mother in it. If Chad got him, Shane howls, she asks what he did, and Chad says what he really said that day: "I didn't do nuffing Mom. I didn't do NUFFING! All I did was hit em in the head wiff dis bat. I didn't do NUFFING Mom!" (That is the family's own wording: leave it be.) | 3 bonks on the head before Shane reaches the back door (11 seconds) |
| Pocket sand (`sand`) | The same back yard, and the sandbox. A story in three choices, with no clock: it waits for the player. As Chad: the shovel or the bucket (Shane shoves him and throws sand either way, and their mother comes out: "Knock it off!"). As Shane: "Hug his brother Chad" (a hug with both arms, then one arm round his shoulders to say "I love you Chad"; an audience goes "Dawww", nobody moves, and then, straight from that, sand in Chad's face) or "Establish dominance" (he just throws it). Their mother comes out again, goes in, he does it again, and she comes out for the last time: "How would you like it if someone was bullying you?!" As their mother: "Let Chad handle it" (a close-up of Chad, the screen shaking: "It is Chad's turn to handle it!"; Shane punches him in the head; the choice comes back crossed out) or "Give Shane a mother's love": Shane's view up at her, from her shoes to her wagging finger ("blah blah blah", on a trombone), hers down at him, all of him and then just his big sparkling eyes, her hand taking a handful of sand, and POCKET SAND, in his eyes. | Always, in the end: "YOU DID IT!" |
| Pappy comes home (`homecoming`) | Seen over Pappy's shoulder at his own front door, late: three keys on a ring, and an arrow that says CHOOSE THE RIGHT KEY. The first two he tries are never it, whichever they are; the third always is. The door opens slowly, and then all at once, on Mammy and a rolling pin. Then the two of them from the side in the front room, Mammy still at it. Pappy knows the only thing that appeases her: he goes down on his knees, she turns her back and bends over (in a large pair of bloomers), and the player slides him across the carpet to kiss her butt. Each kiss leaves its mark, takes a notch off her temper and gets him shoved back for another go. A story with no clock. | Always, in the end, after eight kisses: "YOU DID IT!" |
| Take 'em for a ride (`ride`) | Curt and Stephanie bring home four dogs, and Mr. Quacks the duck, whom Stephanie will not leave alone however often she is told to. Can they keep 'em? Of course! Off to bed with them, and every animal turns and stares at Pappy; Mammy: "You know what to do..." The van, at night, through the street from the paper route, a head out of every window: tap to swerve round dustbins, cones and potholes, out past the last house to the forest at the edge of town. The side door rolls back, and the meter from FORE! comes up: hold, and let go in the green, to boot each one out into the dark ("AND DON'T COME BACK!"). Home again: "Where did Fido and Mr. Quacks go?" Pappy kisses Mammy: "They ran away." The children cry; Mammy and Pappy pop the champagne. A story with no clock. | Always, in the end: "YOU DID IT!" |
| Bath time (`catbath`) | The front room full of stinking cats: "Someone needs to bathe these damn cats." The kitchen sink, heaped with suds, a washboard in it and the sprayer beside it. One cat at a time: tap fast to choke it out while it claws him, drag up and down to scrub it on the washboard, go round and round to wring it out like a towel, then tap to hang it on the line, and he kisses it. When all three are up they dry all at once, twice the size and glaring: ALL CLEAN. A story with no clock. | Always, in the end: "YOU DID IT!" |
| After school (`fight`) | Stephanie is called out, and the other girl starts it: a shove, before anybody has said "fight", that takes a piece off Stephanie's health bar. Stephanie stands her ground. Three buttons: Spirit Fingers, High Kick, Pom-Pom Flurry. For a few seconds her hits land. Then the other girl powers up, at length; the hits stop counting, the buttons turn into "Apologize", "Compliment her jacket" and "Beg for mercy"; Stephanie is picked up by one ankle, the screen stops for the words SUPER MOVE, and she is brought down on the floor, one side and then the other, seven times, before being thrown into the bake sale. An arcade announcer has the last word: "Flawless victory. Fatality." | Never. It cannot be won, and it is left out of the score: its mark on the tape is a star, and the end page says "lost, as always". |

Letting go of the breath too early is a "pfff"; holding on half a second
past full is a coughing fit. Neither scores.

The workout has the tape's own music, breath in and "PAH" (see "The workout
tape" in `docs/music.md`), and stand-ins if those files are missing. A game
asks for music of its own with `readonly music = '<file name in
public/music>'`; without it, the mode's usual track plays.

What the two of them say in the fight is on scraps of paper that follow
their heads (`say()` in `src/minis/fight/FightMini.ts`). Each one is put wherever
above or beside the speaker's head covers least: never either face, never
what the other one is saying, never the names under the health bars or the
buttons, and not the banner or the combo count if it can be helped. A line
too long for one row is split into two of about the same length. Nothing
that is said carries over from one part of the fight into the next.

A game that is a story, and waits for the player to choose, says so with
`readonly timed = false`: it has no clock, and goes on until it calls
`this.host.finish()`. The two set in the brothers' back yard (the bat and
the sandbox) share the yard, the house, their mother and the boys
themselves: `src/minis/shared/yard.ts`.

A game that cannot be won says so with `readonly scored = false`: it is
played like any other, but it is not counted in "games cleared".

For now, while the games are being made, there is a SKIP tag at the top
left: it goes on to the next game without playing this one. A skipped game
is not counted, and a tape with a skip in it does not set the best.

## Adding one

Every quick game is a folder of its own in `src/minis`, and the master list
(`src/minis/roster.ts`) stitches them into the one tape: it finds every
folder by itself, so adding a game changes no file that anybody else works
in. A new game is made in a chat of its own, on a branch of its own, and
comes into the master game when the owner says so (`CLAUDE.md` has the
rules). What there already is to put in it is in `pictures.md` (the places,
the things, the effects) and `characters.md` (the people, and the faces each
of them has: `head(scene, 'chad', 'guilty', x, y, 62)` puts one on a body).

```bash
node tools/new_mini.mjs toaster "THE TOASTER"
```

That makes `src/minis/toaster/` with a small game in it that already plays
(tap the star three times). It is on the tape from then on, after the games
that were there and before the last one:

| In the folder | |
| --- | --- |
| `ToasterMini.ts` | The game. It says its `title`, its `prompt` (a few words, shown large) and how many `seconds` it lasts; `build()` puts things on the page, `press()` and `release()` are the finger going down and up, `update()` runs every frame, and `timeUp()` says whether running out of time counts as a win. `this.host.finish(true or false)` ends it early. `bot()` plays it for the tests. |
| `art.ts` | Its paper stand-ins: what is on the page until there is a photo. |
| `index.ts` | What the master list is given: the game, its stand-ins, and its photos (`PIECES`), each of which takes the place of the stand-in with the same key. |
| `assets/` | Its photos, cut by `cut.py` from what is in `art-src/games/toaster/`. |
| `moments.cjs` | The moments its test photographs (`testing.md`). |
| `README.md` | What it is, the story behind it in the owner's words, and its picture prompts. |

To see it by itself, build a page that plays only that game, and publish it
as an artifact of its own:

```bash
node tools/make_preview.mjs <somewhere>/toaster.html --only toaster
```

Where the previews are (add a game's here when it gets one):

| | |
| --- | --- |
| The whole game | https://claude.ai/artifact/GwrBX3NsV3Jue3LDMUhb1c |
| Pocket sand by itself | https://claude.ai/artifact/11orTeMeACo1UbsrVrHxcQ |
| Pappy comes home by itself | https://claude.ai/artifact/1sZax1AfUnwYJJCTfL2Luz |

A chat other than the one that made a preview can publish to it by passing
its address as `url`.

What keeps one game from spoiling another:

- **Its pictures have its name on them.** Every key is `toaster_something`
  (a word on a burst: `word_toaster_something`, shown with
  `this.host.word('toaster_something', x, y)`). A game cannot make a picture
  by any other name, or draw over one that was there before it: it is
  refused, and the tests report it.
- **It may use what is already there** (the paper, the lettering, the
  effects, the levels' pictures, another game's people) but not change it.
- **Its sounds are made in its own folder,** out of `sound.tone()` and
  `sound.noise()`, or are recordings of its own
  (`public/sfx/toaster-<name>.mp3`, with `sound.loadClip()` and
  `sound.playClip()`).
- **Before it goes back:** `node tools/check_branch.mjs` lists everything the
  branch has changed, and stops on anything that was already there.

A game does not tidy up after itself: the scene clears away everything it
added.

### How much room there is

Plenty. A published page may be 16 MB, and the pictures used to be inside it,
which left room for only a few more games. They are now kept beside the
page, in files of about 6 MB (`tools/pack_pictures.mjs`,
`src/art/pictures.ts`): the page itself is under 2 MB, and an artifact may
have 256 MB of files beside it. With six games the pictures come to 8 MB.

Pictures are still worth keeping small (they are all fetched before the
title comes up), so they stay WebP, at the size they are drawn.

The first six games were made before games had folders. Their classes are in
theirs (`src/minis/sand/SandMini.ts`); their paper art (`src/art`), tables
(`src/data`) and pictures (`src/assets/scrap`, listed in `src/art/photos.ts`)
are still in the common places, and several are shared: the brothers, their
mother and the back yard (`src/minis/shared/yard.ts`) are in two games each.

## Tuning

- Which games are on the tape: every folder in `src/minis` with an
  `index.ts`. In what order: `FIRST` and `LAST` in `src/minis/roster.ts`
  (the owner's to decide; a new game goes in between until it is named).
- The workout: the pass mark and how long each pose is given (`PASS`,
  `SECONDS_EACH`; there are as many rounds as there are poses), how long a
  breath takes and how big the green zone is (`INHALE`, `ZONE`, `TOO_LONG`),
  how long the "PAH" stays on their faces before it is held in (`PAH_LINGERS`),
  at the top of `src/minis/workout/WorkoutMini.ts`. Each pose is a photo of a body
  with the head taken off (`src/data/workout.ts`, written by
  `tools/make_cutouts.py`, says where each one's chin is); behind them are
  paper dolls described joint by joint in `POSES` in `src/art/minis.ts`,
  which show if a photo is missing. A new pose needs a line in `POSES` and a
  figure on a sheet in `WORKOUT_SHEETS` in the tool. Mom is framed to fill
  the television's screen in whatever pose she is in (`frame()`).
