# FORE!

Chad's first tee shot, the window it went through, and the day after: Shane
and Chad selling water on the Iron Horse Trail until there is enough for a new
one. Its short name is `golf`.

## The story

In the owner's words (26 November 2026):

> Bill takes 5 year old Chad golfing for the first time. The player controls
> Chad as he tees off from the first tee box. The player can select from 2
> clubs: Driver, 7 iron. There is a wind meter that shows the wind direction.
> The player can select where on the ball he plans to strike just like in golf
> video games (even though it is just an illusion of control since
> mechanically this doesn't do anything). When the player presses the swing
> button the meter appears with the same mechanics as the workout game except
> the sweet spot is half the size it was in the workout game and the height of
> the sweet spot on the meter is randomly placed each time. (None of those
> choices matter in the end anyway because Chad hits the shot into a window
> the same way no matter what). The only change is if the shot says "NICE
> SHOT!" or it says "SHANKED" when struck. On his first and only shot off the
> tee Chad immediately breaks a window (use the backyard from the sandbox game
> as the house that gets the broken window).
>
> Cut to the next day: 5 year old Shane being the always responsible one
> decides that him and Chad must sell water at the iron horse trail so as to
> make enough money to pay for the window. Shane is framed as the Wally to
> Chad's Beaver (Leave It to Beaver). The gameplay in this second day is
> selling bottled waters to people walking and running on the iron horse
> trail. They make enough money to buy a new window at Windows R Us.

Two settings were asked for: the tee box of a golf course, and the entrance to
the Iron Horse Trail in Danville (where it crosses Hartford Road; the owner
sent three Street View pictures of it, from October 2009, kept here as
`art-src/games/golf/REF1` to `REF3`).

## How it plays

It waits for the player at the tee (`timed = false`), so the scene keeps no
clock for it. The trail has a clock of its own, drawn where the scene's is.

**The first day.**

1. **The tee.** Bill ("KEEP YOUR EYE ON THE BALL.") and Chad, and what a golf
   video game gives you: `DRIVER` or `7 IRON` (the club in his hands changes),
   a wind dial with the wind's speed (a different wind every time), a big
   golf ball to tap, which moves the mark on it and says what that would do
   ("TOPSPIN DRAW", "DEAD CENTER"), and `SWING!`. None of it changes anything.
2. **The meter.** `SWING!` puts it up. Hold anywhere and it fills, in 1.3
   seconds, as a breath does on Mom's workout tape; let go in the green for
   "NICE SHOT!", anywhere else for "SHANKED". The green is 12 hundredths of
   the meter (the workout's is 24) and is somewhere different every time.
   Held half a second past full, he swings anyway.
3. **The window.** Bill shouts "FORE!!", and the ball comes into the back yard
   from the sandbox game and goes through the window of the house: "CRASH!",
   and somebody indoors: "MY WINDOW!!".
4. **Back at the tee.** Bill with his hands to his head; Chad: "DID I WIN?"

**The next day.** A title card, "Leave It To Chad", and the trail.

5. Shane: "GEE, CHAD. WE HAVE TO PAY FOR THAT WINDOW." Chad: "GEE, SHANE.
   HOW?" Shane: "WE SELL WATER. A DOLLAR A BOTTLE."
6. **Selling.** People walk and run past in both directions. The thirsty ones
   have their tongues out, are sweating, and have a bottle of water in a
   bubble over their heads: tap one, and Shane throws them a bottle and their
   dollar flies into the jar ("SOLD!"). The ones who brought their own have it
   in their hand, and say "NO THANKS". Ten dollars in 22 seconds buys the
   window.
7. **Windows R Us**, if they made it: "ONE WINDOW, PLEASE.", a new window, and
   "PAID IN FULL!". If they did not: "NOT ENOUGH. SAME TIME TOMORROW, CHAD.",
   and it is a miss.

The careful bot tries the 7 iron, moves the mark on the ball, lets go in the
green and sells ten. The careless one just swings, lets go far too soon, and
taps somebody at random every couple of seconds, which is never enough: that
is how the losing end is seen.

### What is made up, and so is the owner's to change

The story is the owner's. These are not, and are there because something had
to be said:

- **Every line anybody says:** "KEEP YOUR EYE ON THE BALL.", "FORE!!", "MY
  WINDOW!!", "DID I WIN?", the three lines at the stand, "THAT'S A WINDOW!",
  "ONE WINDOW, PLEASE." and "NOT ENOUGH. SAME TIME TOMORROW, CHAD." (they are
  all in `GolfMini.ts`: search for `say(`).
- **The title card "Leave It To Chad",** and the two "GEE"s, which are how
  Shane is made the Wally to Chad's Beaver.
- **That the house is a stranger's.** Nobody is seen in it: their mother does
  not come to the door, so it reads as a house beside the course.
- **That it can be lost** on the second day, and the numbers: a dollar a
  bottle, ten dollars for a window, 22 seconds.
- **Who does what at the stand:** Shane throws the bottles, Chad shouts.
- **The title, "FORE!",** and the sign on the table, "ICE COLD WATER $1".

### Tuning

At the top of `GolfMini.ts`: how fast the meter fills and where the green may
be (`FILL`, `TOO_LONG`, `SWEET`; its size is `ZONE` in `art.ts`), what a window
and a bottle cost and how long there is (`NEED`, `PRICE`, `SELL_SECONDS`), and
how often somebody comes along (`EVERY`). Who is thirsty is decided in
`spawn()`: most of the runners, about half of the walkers, and never three in
a row who are not.

## Pictures

Nothing of this game's own is a photo yet: everything called `golf_...` is cut
paper (`art.ts`), drawn where the photo will go. What it uses that was already
there, as it is:

| | |
| --- | --- |
| The back yard, the tree, and the back of the house | `layYard`, `raiseHouse` (`shared/yard.ts`). The window that breaks is the one in the photo of the house: `WINDOW` in `GolfMini.ts` says where its glass is. |
| The brothers on the second day | Their bodies from the back yard (`shane_good`, `shane_laugh`, `shane_throw`, `chad_stand`, `chad_wail`), with faces from everybody's set. |
| Everybody's faces | Chad: smile, calm, yell, guilty, talking, worried, laugh, cry. Shane: calm, talking, smile, laugh, worried. Bill: smile, talking, yell, shocked, worried. All of them were there already: no new face is needed. |
| The people on the trail | The twelve rubberneckers' heads from the highway (`head0` to `head11`). Gawking is how they look when they have a drink; dazed, with the tongue out, is thirsty. |
| Odds and ends | The sky from the back yard, `yard_bush`, the bluebirds, `tear` (for sweat), `sparkle`, `puff`, the yellow and cream button plates from the fight, and strips of tape. |

`figures.ts` hangs a face on a body, for the bodies that are this game's own
and for the brothers' own alike; `poses.ts` has every paper doll joint by
joint, and says where each one's chin is.

### Prompts

For the owner to generate (Nano Banana in the Gemini app, as in
`docs/art-prompts.md`: clean photos on a plain background, one prompt to a
message, the full-size picture sent back labelled with its number). The game
adds the white border and the shadow itself. The year (about 1990) and the
clothes are guesses, as they were for the back yard: change them to what was
really worn.

When a picture comes back it is kept in `art-src/games/golf` under its number
(`GF1-chad-golf.webp`), cut by `cut.py`, and registered in `PIECES` in
`index.ts` under the key its paper stand-in has now.

#### GF1. Chad, with a golf club (one sheet)

Attach one of his sheets from Payback (`art-src/generated/PB1...`), so that it
is the same boy. He faces the camera, as golfers do on television, with the
fairway off to the right of the picture. The club is in the picture (the
game's paper club is only for the stand-ins), so with this sheet he holds the
same club whichever was picked; a second sheet with an iron would give both.

```text
The same small boy exactly, about five years old, in the same light blue T-shirt, navy shorts, white socks and white trainers, in the same light. Three full-length photographs of him side by side with wide clear gaps between them, all on one continuous plain flat light-grey studio background with no dividing lines or panels. In all three he faces the camera and is holding a child's golf club, a driver with a big wooden head, far too big for him. First: standing over an imaginary ball, feet apart, both hands together on the grip in front of his waist, the club head resting on the ground a little to the right of his feet. Second: at the top of his backswing: both hands lifted up beside his right shoulder, on the left of the picture, the club going up and over behind his head. Third: just after the swing: his weight on the foot nearer the right of the picture, both hands finishing high beside his other shoulder, the club wrapped round behind his neck. His whole body and the whole club are in frame in every one, and nothing covers his face or neck: his hands and the club stay clear of his head. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

#### GF2. Bill, at the tee (one sheet)

His head comes off and a photo of him goes on, a size bigger, so his hands
stay clear of his head even when they are up beside it.

```text
Two full-length photographs of the same man in his thirties, side by side with a wide clear gap between them, on one plain flat light-grey studio background. He is dressed for golf about 1990: a red short-sleeved polo shirt, cream trousers with a belt, white golf shoes. He faces the camera in both. First: standing relaxed with one hand on his hip and the other resting on the top of a golf club that stands upright beside him like a walking stick. Second: standing with his feet apart and both hands raised up beside his head, elbows out, fingers spread, not touching his head, as if he has just watched something terrible happen. His whole body is in frame from head to feet in both, and nothing covers his head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

#### GF3. The first tee

One photo is the whole place, as the gym and the den are.

```text
A photograph looking across the first tee of a suburban golf course in California on a sunny summer morning about 1990, seen from the side. A flat, closely mown tee box runs dead level across the whole width of the picture, its near edge a little above the bottom of the picture, with two small red tee markers on it. Beyond it a broad green fairway with mown stripes runs away into the distance towards low golden-green hills, and a single flag stands on a far green on the right. Along the right-hand side of the fairway, a long way off, is a row of the backs of ranch houses behind a low fence, their windows facing the course. A few oak trees. Clear blue sky with small white clouds fills the top half. Nobody in it, no golf carts, no signs. Even light, no long shadows. No text. Very wide 21:9 image.
```

#### GF4. What is on the tee

The sign is blank: the game letters it ("HOLE 1", "PAR 4").

```text
Five things photographed straight on, side by side with wide clear gaps between them, on one plain flat light-grey background. First: a golf bag about 1990, blue with a red pocket, standing upright on its own with the heads of several clubs sticking out of the top. Second: a small plain wooden signboard on a single wooden post, with nothing written on it. Third: a golf driver with a wooden head, lying flat and level, its grip on the left and its head on the right. Fourth: a 7 iron, lying flat and level the same way round. Fifth: one white dimpled golf ball, seen close up, perfectly round, evenly lit with no strong highlight. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

#### GF5. The entrance to the Iron Horse Trail

Attach the three Street View pictures (`REF1` to `REF3`). Those look down the
trail; the game is seen from the side, with people going past from left to
right and right to left, so the path has to run across the picture. What
stands at the entrance (GF6) is left out of this one, and put in by the game.

```text
A photograph of the Iron Horse Regional Trail where it leaves Hartford Road in Danville, California, on a sunny autumn day about 1990, like the attached pictures of the same place but seen from the side instead of looking down it. An old paved path of dark grey tarmac runs dead level across the whole width of the picture, seen exactly side-on with no perspective slant, a third of the way up from the bottom. In front of it, filling the bottom of the picture, and behind it, is bare brown ground thick with dry fallen leaves. Behind the far verge a weathered grey-brown wooden board fence runs level across the whole width, with ivy growing along its foot. Behind and above the fence, tall leafy trees (ash, oak, eucalyptus) fill the whole top half of the picture and meet overhead, with only small patches of blue sky showing through, and dappled sunlight falling on the path and the leaves. Nobody in it: no people, no bicycles, no signs, no gates, no posts. No text. Very wide 21:9 image.
```

#### GF6. What stands at the entrance

From the same three pictures. The trail sign is blank: the game letters it
("IRON HORSE REGIONAL TRAIL", "DANVILLE").

```text
Four things photographed straight on, side by side with wide clear gaps between them, on one plain flat light-grey background. First: a round dark brown wooden post about waist high with a band of yellow reflective paint round its top, the kind that keeps cars off a cycle path. Second: a low galvanised steel swing gate of chain-link mesh in a tube frame with one rounded top corner, about waist high and three times as wide as it is tall, with a small red-and-white metal sign fixed to the mesh. Third: a park sign of dark brown painted wood, a wide board on two square wooden posts, with nothing written on it. Fourth: a red octagonal stop sign on a grey metal pole. The whole of each is in frame, from the ground up. Soft even light, no shadows on the background. Wide 16:9 image.
```

#### GF7. The water stand

The poster is blank: the game writes it ("ICE COLD WATER $1").

```text
Four things photographed straight on, side by side with wide clear gaps between them, on one plain flat light-grey background. First: a small square folding card table with thin metal legs, seen from the front, with a blank sheet of white poster paper taped along its front edge and hanging down. Second: a red picnic cooler with a white lid, about 1990, its lid propped open, full of ice with the tops of plastic bottles of water sticking out. Third: one small clear plastic bottle of water with a blue label and a white cap, standing upright. Fourth: a large glass jar with a few dollar bills and coins in it. Soft even light, no shadows on the background. No text on anything. Wide 16:9 image.
```

#### GF8. The people on the trail (six sheets, last of all)

Their heads come off and the rubberneckers' go on, so these can be anybody.
The paper ones will do for a good while: this is the lowest of these. Each
sheet is one person in the two halves of a stride. Three walk and three run;
change the words in brackets for each.

```text
Two full-length photographs of the same person side by side with a wide clear gap between them, on one continuous plain flat light-grey studio background with no dividing lines or panels. [A man of about fifty out for a walk about 1990, in a green polo shirt, grey trousers and white trainers.] Each is seen exactly from the side, facing the right of the picture. First: in the middle of a stride, [walking briskly], the front leg reaching forward and the back leg behind, arms swinging. Second: the same a moment later with the legs the other way round. The whole body is in frame from head to feet in both, the hands are empty, and nothing covers the head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

The other five: `[A woman of about sixty, in a red blouse, blue slacks and
white trainers]`, `[An old man in a cream cardigan and brown trousers]`,
all three `[walking briskly]`; and `[A teenager in a yellow T-shirt, blue
running shorts, white tube socks and trainers]`, `[A man of about forty in a
white vest, red running shorts, a towelling headband round his wrist, and
trainers]`, `[A man of about thirty in a green T-shirt, grey running shorts
and trainers]`, all three `[running flat out, both feet off the ground]`.
(Which head wears which is `WEARS` in `poses.ts`.)

#### GF9. Windows R Us

The sign is the joke, so the game paints it: every letter a different colour
and the R the wrong way round.

```text
Two things side by side with a wide clear gap between them, on one plain flat light-grey background. First: the front of a small shop in a suburban strip mall about 1990, photographed exactly face-on and cut off square at both sides: a red brick wall, one wide plate-glass shop window with three new house windows of different sizes standing on display behind the glass, a glass door on the right, and above them a long plain white signboard with nothing written on it. Second: one brand new white double-hung house window in its frame, the glass clean and shining, standing upright by itself. Soft even light, no shadows on the background. No text on anything. Wide 16:9 image.
```

## Sound

All its own, made of notes and noise (`sounds.ts`). Measured with
`tools/test/listen.cjs` at `sfx`, with the game's drawing stopped (it reads
low otherwise), where the mouth "bonk" everything is put beside reads 0.20:

| | | Loudest 46 ms |
| --- | --- | --- |
| `ping(true)` | the club on the ball, clean: a ring | 0.17 |
| `ping(false)` | a shank: a clack | 0.13 |
| `smash()` | the window, and the pieces of it coming down | 0.22 |
| `jingle()` | the next day: six bright notes | 0.17 |
| `sale()` | a dollar in the jar, and the top off a bottle | 0.13 |
| `noSale()` | "no thanks" | 0.11 |

It also uses the game's own whoosh, tick, tock, yelp, the "caught" sound
(back at the tee, and when the money falls short) and the win fanfare.
Nobody has heard any of it: whether each is the right sound is for the owner
to say, in the preview.

To measure them again, on a page built with `--only golf` (the title goes
straight to it):

```bash
node tools/test/listen.cjs http://localhost:5180/ sfx "window.__game.loop.sleep()" 200 "window.__rn.mini.sounds.smash()" 1200
```
