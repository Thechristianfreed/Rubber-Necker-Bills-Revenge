# THE FAVORITE

Bill and Stephanie's anniversary dinner at Le Papillon, a bottle of Pinot
Noir, and four boys who are each told, one after another, that he is the
favorite. Its short name is `favorite`.

It is set in the restaurant the ordering game made (`papillon`): the room, the
long table and everybody's seat at it are that game's pictures, laid by
`src/minis/shared/papillon.ts`, and used here as they are. This game cannot
be on the tape without that one.

## The story

In the owner's own words:

> The idea for the game comes from a story where it was Bill and Stephanie's
> anniversary dinner at Le Papillon and it was one of the ONLY times that my
> dad has ever been drunk in front of us. He drank a whole lot of Williams
> Selyem Pinot Noir (attached Image 4). Then he kept playfully telling each
> of his 4 boys (Shane, Chad, Christian, and Branson) "You know...You're My
> favorite!" then a little time would pass and he would tell a different boy
> "You're My favorite!" then immediately motion to another boy "shhhh dont
> tell anyone...really YOU are My Favorite". I dont have an idea on how to
> give this gameplay, but I feel like there is something there

The three things Bill says in the game are those three, as they were said
(`LINES` in `FavoriteMini.ts`): leave them be. Nothing else is put in his
mouth but a hiccup. "I KNEW IT!", which a boy says when it is lost, is made
up.

## How it plays

Spinning plates. The player is Bill.

- Everybody is on the far side of the long table, facing us: Shane, Chad,
  Bill, Stephanie, Christian, Branson.
- Each boy has a heart over his head: how special he feels. It runs down by
  itself, and his face goes with it (smug or laughing when he has just been
  told, then a smile, then nothing much, then worried, then tears). Under a
  quarter there is a "!" beside it.
- **Tap a boy** (anywhere on or under him) and Bill tells him. He leans over,
  out comes a hand, and he says it: "YOU KNOW... YOU'RE MY FAVORITE!" the
  first time; after that "YOU'RE MY FAVORITE!"; and, when it is a different
  boy straight after the last one, a finger to his lips and then a hand
  cupped beside his mouth: "SHHHH, DON'T TELL ANYONE... REALLY YOU ARE MY
  FAVORITE!" That boy's heart fills. The other three can hear perfectly well,
  and each loses a little.
- Saying it takes him a moment, so it cannot be done faster than about twice
  a second. A tap made while he is still talking is kept, and done next.
- **The wine is the clock.** The bottle empties as the twenty seconds go
  (the full bottle is laid over the empty one and taken away from the top).
  Three times he stops for a drink, which is a second he cannot talk in, and
  comes up with a hiccup. The more he has had, the faster the hearts run
  down, the more the room sways, and from about a third of the way through
  he is seeing two of each boy. Taps are judged against where the boys
  really are.
- **Lost** the moment any heart is empty: that boy shouts "I KNEW IT!", the
  other three glare, Bill looks caught, and Stephanie's lips go thin.
- **Won** if the bottle is finished first: everybody laughing, a glass in the
  air, and "HAPPY ANNIVERSARY!"
- There is a strip of tape on the cloth that says what to do, until it has
  been done once.

The careful bot tells whoever is lowest as soon as anybody is under about
three-quarters, and wins with every heart kept well up. The careless one says
it every two seconds or so, half the time to the boy it has just told, and
loses in about seven seconds.

How hard it is (all at the top of `FavoriteMini.ts`), from runs with taps
made at a steady pace through `press()`: somebody who always picks the lowest
boy wins at a tap every 1.3 seconds (the lowest heart gets to 0.16) and only
just at one every 1.6 (0.01). Going round the four in turn at a tap a second
won. Tapping a boy at random, every second or faster, lost each time it was
tried.

| | |
| --- | --- |
| `SECONDS` | how long the evening is (20) |
| `START` | how full each heart is to begin with |
| `FADES`, `FADES_MORE` | how fast a heart runs down a second at the start, and how much more by the end |
| `HEARD` | what the other three lose when one is told |
| `GLOW` | how long a boy who has just been told stays full |
| `SAYING`, `SHUSHING` | how long it takes Bill to say it |
| `SWIGS`, `SWIG` | when he drinks, and how long that keeps him |

The camera is never turned (nothing puts it straight again if the game is
skipped): the sway is the camera sliding and coming in a little, which the
scene resets.

## Pictures

### FV1. The bottle (in the game)

The owner's own picture of the wine: a bottle of Williams Selyem 2014 Pinot
Noir, Sonoma Coast, on white. It came with the message that asked for the
game (26 November 2026) and is kept as it came:
`art-src/games/favorite/FV1-bottle.webp`. Adobe took the white off
(`FV1-bottle-cutout.png`, beside it), and `cut.py` makes two pieces from
that:

| Piece | In the game as | What it is |
| --- | --- | --- |
| `assets/bottle.webp` | `favorite_bottle` | the bottle, full |
| `assets/bottle-empty.webp` | `favorite_bottle_empty` | the same bottle with the wine gone: the glass between the foil and the label, and under the label, turned to empty green glass. The foil and the label are untouched. |

The game stands the empty one on the table with the full one over it, and
cuts the full one away from the top as the time goes, from under the foil
to the top of the label (`BOTTLE.glass` in `art.ts`, and `GLASS` in
`cut.py`).

### Still cut paper

Bill's three hands, the hearts, the "#1" that floats off a boy who has just
been told, and the two words on bursts. The hands would be better as photos.
The game holds each by one point (the wrist, the finger, the palm) and turns
it over for the other side, so one right hand does for all three.

### FV2. Bill's hands

```text
Three photographs of the same man's right hand and wrist, side by side with wide clear gaps between them, on one plain flat light-grey background. He is about sixty, and wears a dark suit jacket with a white shirt cuff showing at the wrist. First: the arm level, coming in from the left of the picture, the hand in a loose fist with the first finger pointing straight out towards the right, as if picking somebody out across a dinner table. Second: the forearm upright, the hand in a loose fist with the first finger pointing straight up, as it is held in front of the lips to say "shh", seen from the front. Third: the forearm upright, the hand open and upright with the fingers together and curved a little, as it is held beside the mouth to whisper behind, its palm facing the right of the picture. Each arm ends a little way up the sleeve, cut off square. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

(Each arm on the one background, not on a card of its own: background
removal keeps the cards. If they come back on cards, the three are got by
selecting "the three hands".)

### FV3. A heart (only if the paper one is not wanted)

```text
A heart cut out of glossy red card, plump and even, lying flat, photographed from straight above on a plain flat light-grey background. Nothing else in the picture. Soft even light, no shadows on the background. No text. Square 1:1 image.
```

(Only the red one is asked for. The empty heart has to be the same shape to
the pixel, since the red one is laid over it and cut away from the top, so
`cut.py` makes the grey one from the red one, as the empty bottle is made
from the full one.)

## Sound

All of it is made in the game's own folder, out of `sound.tone()` and
`sound.noise()` (`NOISES` at the top of `FavoriteMini.ts`), or is a sound the
game already had. Measured with `tools/test/listen.cjs`, by the loudest 46 ms
of each, beside the mouth "bonk" at 0.175:

| | When | Level |
| --- | --- | --- |
| `told` | two notes up: a boy has been told (every tap) | 0.11 |
| `shh` | a hiss: the "SHHHH" | 0.14 |
| `glug` | three swallows: the glass is at his mouth | 0.16 |
| `hic` | the hiccup after it | 0.13 |
| `low` | two pips: somebody's heart is nearly empty | 0.09 |
| `sound.aww()` | the audience, at the happy ending (the sandbox's) | 0.19 to 0.21 |
| `sound.yelp()` | the boy who has worked it out (a recording) | 0.26 |

Nobody has heard any of it: whether each is the right sound is for the owner
to say, in the preview. The music is the tape's usual.
