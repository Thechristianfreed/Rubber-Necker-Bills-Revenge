# Stephanie's only basket

A game of basketball, one against one, in the school gym: Stephanie against
another little girl. It can be played properly (forward and back, a jump
shot, a steal) and every shot Stephanie takes goes in her own basket. Its
short name is `ownbasket`.

It is the first of two basketball games. The second is a story of its own,
still to be told, and will be a folder of its own; both are set on this
court.

## The story

The owner's words:

> Stephanie played basketball in middleschool and she tells the story of the
> only time she ever scored a basket. She got a rebound and she immediately
> got so excited that she went back up with it, a perfect shot, swished it.
> only problem was: it went in her own basket. the only points she has ever
> scored in basketball were on her own basket.

## How it plays

The court is seen from the side, all of it at once. Stephanie (in red, the
home team) goes right; her own basket is behind her, on the left, under the
HOME pennant. The other girl (in green, the visitors) goes left.

| | Touch | Keyboard |
| --- | --- | --- |
| Back and forward | the two arrows, bottom left (hold) | the arrow keys, or A and D |
| Shoot, when she has the ball | hold SHOOT, bottom right (or anywhere but the arrows), and let go | hold the space bar, and let go |
| Steal, when she has not | tap STEAL (the same button) | the space bar |

- **It starts with the rebound.** The other girl shoots and misses, and the
  ball comes off the rim to Stephanie. The clock on the scoreboard starts
  then: 30 seconds.
- **The shot is the meter from Mom's workout tape**, with the tape's own
  breath in while it fills: hold to fill it, let go in the green at the top.
  What the ball then does:

  | Let go | What happens |
  | --- | --- |
  | in the green (the sweet spot) | The ball goes straight backwards over her head, flat and fast, and swishes into her own basket. (No "PAH": the owner's decision. The breath in just stops.) |
  | too early | It sets off the right way, comes off the front of the other basket's rim, and flies the length of the court into her own. |
  | far too early | It does not even get there: it comes down on the floor short of the other basket, and bounces from there into her own. |
  | far too late (half a second past full, when it goes off by itself) | Straight up, off the scoreboard, and into her own. |

- **Every one of those is a basket**, and every basket is the visitors':
  two, or three from past half way. HOME stays at 0 all game. Stephanie is
  delighted each time ("I SCORED!!"); the other girl says less and less
  about it ("THAT'S YOUR OWN BASKET!", "UM... THANKS?", "KEEP 'EM COMING!").
- **Then the other girl has the ball**, and brings it up to shoot at the
  same basket. Get near her and STEAL: within reach it works; from too far
  off it is a handful of air and half a second to get over it. If she is
  left to it she shoots: every other one goes in (two more for the
  visitors, and Stephanie's ball), and the rest come off the rim to
  Stephanie, as the first did.
- **Stephanie may not sit on the ball.** After 8 seconds with it and no
  shot, the other girl takes it off her (there is a warning on the tape at
  the bottom, and she can be seen reaching).
- **The buzzer** ends it. A shot that is in the air still counts. The slip
  at the bottom reads out what Stephanie scored: "every one of them in her
  own basket".
- **It is won by scoring**, which is to say by taking a shot at all: one
  basket (in her own net: there is no other kind) and the tape stamps it
  "NAILED IT!". It is lost only by never shooting.

The two bots: the careful one takes the four shots in turn (in the green,
early, far too early, far too late) and steals the ball back every other
time, so that everything is seen in one game. The clumsy one never shoots
(it dithers until the ball is taken off her) and grabs at the ball from
much too far away: it loses.

Nobody's jump is left to a tween: how far each of them is off the floor is
worked out from the clock, a whole jump at a time (`leap`, `height`), and a
new jump waits for her to land from the last. (Two tweens on the one number
once left Stephanie standing in mid-air after a quick basket.) Feet are on
the floor at all other times.

The clock is the game's own, on the scoreboard, because it has to stop for
the tip and wait for a shot that is in the air: so the game says
`timed = false`, and the tape's clock is not shown.

## Tuning

At the top of `OwnbasketMini.ts`:

- The meter: `INHALE`, `ZONE` and `TOO_LONG` are the workout's own numbers
  (they are not shared with it: change them there and they do not change
  here). `FEEBLE` is where "too early" becomes "far too early".
- How long the game is (`GAME`: 30 seconds, the owner's choice), how fast each of them moves (`SPEED`,
  `HER_SPEED`), how far Stephanie's arm reaches for a steal (`REACH`), how
  long she may hold the ball (`HOG`), and how near the basket the other girl
  comes before she shoots (`HER_RANGE`).
- What they say: `SHE_SAYS` and `HER_ANSWER`, in the order they are said.

## What it borrows

The gym and its bleachers (`layGym`, `bleachers`); Stephanie's faces from
everybody's set (`head(scene, 'stephanie', ...)`: smile, laugh, angry, yell,
shocked, worried, guilty, smug, ouch, and her own `inhale` and `hold`); the
workout's meter (`lungs`, `breath`) and its breath in, wheeze and cough
(not its "PAH"); the family's "boing"; the audience's "Dawww" from the sandbox, the
first time she scores; `tape_m`, `shadow`, and the words `bonk` and `whiff`.
Nothing of anybody else's is changed.

## Pictures

The two girls, the ball, the baskets, the scoreboard and the pennants are
photos (the owner made all ten sheets on 26 November 2026, from the prompts
below: five, and then five more that put right what the first five could not
do). The buttons, the slip the score is read from, the question mark and the
words are cut paper (`art.ts`), and stay so. The paper dolls, the other
girl's four paper faces and the paper baskets, scoreboard and pennants are
still there behind the photos, and show if the pictures cannot be fetched.

Stephanie's number is 01 (the owner's word). The uniforms are red and white
for her school and green for the visitors, and the other girl is number 7:
those are made up, to be changed to the real ones if they are known.

The ball is a piece of its own, which the game moves: **nobody in these
pictures is holding one**.

### What came back, and what was cut from it

All of it is in `art-src/games/ownbasket`: the owner's picture (`.webp`),
Adobe's cutout of it (`-cutout.png`) and Adobe's selection of the heads or
faces on it (`-headmask.png`, `-facemask.png`). `cut.py` makes the pieces in
`assets` from those, and writes `bodies.ts`, the table of where everything
is in them (chins, hands, the rim, the scoreboard's lights).

```bash
.venv/bin/python src/minis/ownbasket/cut.py
```

| Sheet | What is on it, left to right | Pieces cut from it now |
| --- | --- | --- |
| `OB1a-steph-moves` | Stephanie: standing with a hand out for the ball, running, running, crouched to shoot | `steph-stand` (which is also her bouncing the ball where she stands), `steph-aim`. (The two of her running are OB5's now.) |
| `OB1b-steph-shots` | Stephanie: the jump shot, on defense, lunging for the ball, jumping for joy | `steph-guard`, `steph-steal`. (The two with her arms up are OB4's now.) |
| `OB2a-her-moves` | The other girl: bouncing the ball, running, running, the jump shot | `her-dribble` (also her standing), `her-run1`, `her-run2`, `her-shoot` |
| `OB2b-her-feelings` | The other girl: on defense (scowling), lunging, baffled, jumping for joy | `her-guard`, `her-steal`, `her-shrug`, `her-cheer` |
| `OB3-things` | The first basket, the ball, the first scoreboard | `ball`. (The basket is OB6's now and the scoreboard OB7's.) |
| `OB4-steph-arms-up` | Stephanie: the jump shot, jumping for joy, both arms whole and clear of her head | `steph-shoot`, `steph-cheer`, and her arms again for each: `steph-shoot-arms`, `steph-cheer-arms` |
| `OB5-steph-running` | Stephanie: two strides, a foot on the floor in each | `steph-run1`, `steph-run2` |
| `OB6-hoop` | The basket from the side, on a straight post | `hoop`, `net` |
| `OB7-scoreboard` | The scoreboard, three panels of the one size | `board` |
| `OB8-pennants` | HOME over VISITORS, in felt | `home`, `away` |

Nothing is thrown away: the first pictures of what was made again are still
in `art-src/games/ownbasket`, and a name in `cut.py` that begins with `_` is
somebody on a sheet who is not cut from it any more.

What was decided in the cutting, and why:

- **Stephanie's bodies lose their heads** and hers is hung on by the chin, as
  in every game. Hers is face on, so it sits over the neck: most of the way
  back from the tip of the chin that was there.
- **Her head is two and a half times the size of the one that came off,** so
  arms held up beside the small one are behind the big one. In the jump shot
  and the cheer her arms, from the chin up, are a piece of their own that is
  laid over her head: each moved out sideways until it is clear of her face,
  and made about a third as long again, so that her hands still get above
  it (`ARMS_UP` in `cut.py`). (In the first picture of the jump shot her near
  arm crossed her face and could not be had whole, and the far one was used
  for both sides. OB4 was made so that both are her own.)
- **Her head stays level as she runs.** If one of the two running pictures is
  lower than the other it is lifted off the floor by the difference. OB5 was
  made with a foot on the floor in both and her head at one height, so for
  her it is a pixel. The other girl's first running picture has both feet
  off the floor, and is lifted a little more.
- **The other girl keeps her own head,** and what she thinks is on it: she
  scowls on defense, is baffled with her hands out, laughs when she jumps
  for joy. So the game shows how she feels by which picture it shows. Her
  faces were selected only to know where her head is, for what she says to
  come from. She is drawn a little bigger than Stephanie's body is, since
  her head is a real one and small (`HER_TALL`).
- **The basket is sized by its rim** (`RIM_WIDE`), which is where the paper
  one's was, and its post is cut to the length that puts the rim at the
  right height: a post is the same all the way down, so rows of it can be
  taken out and not be missed. (The first basket's post was so far back from
  its rim that it was off the edge of the page.) The rim and net are a piece
  of their own, in front of the ball, so that it goes down behind them.
- **The scoreboard's numbers are lights.** The photo has six unlit numbers on
  it, two to a panel, each of seven strokes. The game lights the strokes of
  each figure over the unlit ones (`STROKES` in `OwnbasketMini.ts`): the
  home score, the seconds left, the visitors' score. Where each number is
  was measured off the cutout (`LIGHTS` in `cut.py`) and checked by drawing
  the lit strokes over the unlit ones. (The first scoreboard's middle panel
  was too small for a clock.)
- **The pennants** are on the wall just inside each board, each with its
  notch towards the middle of the court.

### OB1. Stephanie, in her basketball uniform (two sheets: made)

Her head is taken off and her own put on, so her hair is tied up out of the
way of her neck, as in the cheer pictures.

```text
Four full-length photographs of the same girl of about twelve side by side with wide clear gaps between them, on one plain flat light-grey studio background. A 1970s middle school girls' basketball uniform: a red sleeveless jersey with white trim and the number 01 on the chest in white, red shorts with a white stripe, white knee socks with red bands, white canvas high-top trainers, her hair tied up in a tight bun so her neck and shoulders are clear. Her body is turned towards the right of the picture in all four, and there is no ball in any of them. First: standing ready, knees a little bent, her right hand held low and flat in front of her as if bouncing a ball. Second: running to the right, mid-stride, the same hand low as if dribbling. Third: the same run a moment later, the other leg forward. Fourth: crouched with her knees well bent, both hands together in front of her chest as if holding a ball, about to jump. Her whole body is in frame from head to feet in every one. Soft even light, no shadows on the background. No text other than the number, no borders. Wide 16:9 image.
```

Then, with that sheet attached:

```text
The same girl in the same uniform, on the same background in the same light: four more full-length photographs side by side with wide clear gaps between them, her body turned towards the right of the picture, no ball in any of them. First: at the top of a jump shot, feet off the ground, both arms stretched up above her head, wrists flicked forward. Second: a low defensive stance, feet wide apart, knees bent, both arms held out wide to the sides. Third: lunging forward to the right, one arm stretched out as far as it will go, reaching to slap a ball away. Fourth: jumping for joy, both fists thrown up in the air, feet off the ground. Her whole body is in frame from head to feet in every one. No text other than the number, no borders. Wide 16:9 image.
```

### OB2. The other girl (two sheets: made)

She keeps her own head, so her face matters: say what she is like if the
story has somebody in mind. She faces the other way from Stephanie.

```text
Four full-length photographs of the same girl of about twelve side by side with wide clear gaps between them, on one plain flat light-grey studio background. She has brown hair in a high ponytail and freckles, and wears a 1970s middle school girls' basketball uniform: a green sleeveless jersey with white trim and a white number 7, green shorts, white knee socks with green bands, white canvas high-top trainers. Her body is turned towards the left of the picture in all four, her face can be seen, and there is no ball in any of them. First: standing, her left hand held low and flat in front of her as if bouncing a ball, concentrating. Second: running to the left, mid-stride, the same hand low as if dribbling, concentrating. Third: the same run a moment later, the other leg forward. Fourth: at the top of a jump shot, feet off the ground, both arms stretched up above her head. Her whole body is in frame from head to feet in every one. Soft even light, no shadows on the background. No text other than the number, no borders. Wide 16:9 image.
```

Then, with that sheet attached:

```text
The same girl in the same uniform, on the same background in the same light: four more full-length photographs side by side with wide clear gaps between them, her body turned towards the left of the picture, no ball in any of them. First: a low defensive stance, feet wide apart, both arms held out wide, scowling. Second: lunging forward to the left, one arm stretched out, reaching to slap a ball away. Third: standing with both hands held out palms up and her shoulders shrugged, her mouth a little open, completely baffled by what she has just seen. Fourth: jumping for joy, both fists in the air, laughing. Her whole body is in frame from head to feet in every one. No text other than the number, no borders. Wide 16:9 image.
```

### OB3. The basket, the ball and the scoreboard (made)

```text
Three things photographed side by side with wide clear gaps between them, on one plain flat light-grey background. First: a school gymnasium basketball goal seen exactly from the side, in profile: a grey steel post on a heavy black base at the left, an arm reaching out to the right from the top of the post, a white backboard seen edge on, and an orange rim with a white net sticking out to the right of the backboard. All of it in frame from the base on the floor to the top of the backboard. Second: a worn orange leather basketball. Third: an old electric gymnasium scoreboard of the 1970s, a wide black metal box seen straight on, with the words HOME and VISITORS across the top and three dark blank panels below them where the lit numbers go, all switched off. Soft even light, no shadows on the background. Wide 16:9 image.
```

The court itself is the fight's gym, as it is.

### OB4 to OB8: the second batch (made)

Four pictures that let the game use what was sent as it is, where it had
been working round it, and the pennants, which the owner asked for as
photos. All five came back on 26 November 2026 and are in the game. None
needed another picture attached: Stephanie's head is replaced, so only her
uniform had to match. The other girl's pictures are right as they are, and a
new one of her would not have the same face.

OB4, Stephanie with her arms up (for the jump shot and the cheer: both arms
whole, and clear of her head, so that neither has to be borrowed or mended):

```text
Two full-length photographs of the same girl of about twelve side by side with a very wide clear gap between them, on one plain flat light-grey studio background. A 1970s middle school girls' basketball uniform: a red sleeveless jersey with white trim at the neck and armholes and the number 01 on the chest in white block numerals, red shorts with a white stripe down each side, white knee socks with two red bands at the top, white canvas high-top trainers, her hair tied up in a tight bun so her neck and shoulders are clear. Her body is turned a little towards the right of the picture. There is no ball in either. First: at the top of a jump shot, feet off the ground with her toes pointing down, both arms stretched straight up as high as they will go, one on each side of her head, hands above her head with the wrists flicked forward. Second: jumping for joy, feet off the ground, both arms thrown straight up and out in a wide V, fists clenched. In both, there is a clear gap of bare background between each arm and her head, no part of either arm or hand passes in front of or behind her face, head, hair or neck, and both arms can be seen whole from shoulder to fingertips. Her whole body is in frame from fingertips to feet, with room above her hands. Soft even light, no shadows on the background. No text other than the number, no borders. Wide 16:9 image.
```

OB5, Stephanie running (two strides with her head at one height and a foot
on the floor in each, so that neither has to be lifted to keep her level):

```text
Two full-length photographs of the same girl of about twelve side by side with a very wide clear gap between them, on one plain flat light-grey studio background. A 1970s middle school girls' basketball uniform: a red sleeveless jersey with white trim at the neck and armholes and the number 01 on the chest in white block numerals, red shorts with a white stripe down each side, white knee socks with two red bands at the top, white canvas high-top trainers, her hair tied up in a tight bun so her neck and shoulders are clear. She is running towards the right of the picture, upright, bouncing a ball that is not in the picture: her right hand is held low and flat out in front of her, and there is no ball. First: one stride, her right foot flat on the ground under her and her left leg lifted behind. Second: the next stride, her left foot flat on the ground under her and her right leg lifted behind. In both she is the same size, standing just as tall, with her head at exactly the same height and one foot on the ground. Her whole body is in frame from head to feet in both. Soft even light, no shadows on the background. No text other than the number, no borders. Wide 16:9 image.
```

OB6, the basket (with its post close behind the board, so that all of it is
on the page):

```text
A school gymnasium basketball goal seen exactly from the side, in profile, photographed alone on one plain flat light-grey background. A single straight vertical grey steel post stands on a small flat steel plate on the floor. Near the top of the post a short horizontal steel bracket holds a white backboard, seen edge on, close in front of the post. An orange rim with a white net sticks out to the right of the backboard. It is compact: the post is almost directly behind the backboard, and the middle of the rim is only about a third as far out from the post as the rim is high above the floor. There is no long diagonal arm and no wheeled or weighted base. All of it is in frame, from the plate on the floor to the top of the backboard. Soft even light, no shadows on the background. No text, no borders. Tall 9:16 image.
```

OB7, the scoreboard (with a middle panel as big as the other two, for a
clock that reads 0:30):

```text
An old electric gymnasium scoreboard of the 1970s, photographed straight on and alone on one plain flat light-grey background. A wide black metal box with the word HOME in white capital letters at the top left and the word VISITORS in white capital letters at the top right. Below the words are three dark panels in a row, all exactly the same size and evenly spaced: one under HOME, one in the middle, one under VISITORS. Each panel is wide enough for two large numerals. All three panels are switched off and completely dark, with no numbers showing. No other words or numbers anywhere on it. Soft even light, no shadows on the background. No borders. Wide 16:9 image.
```

## Sound

Its own are made of notes and noise in `sfx.ts`. How loud each came out,
measured where everything meets (the mouth "bonk" beside them was 0.17):

| | |
| --- | --- |
| a dribble | 0.08 |
| a bounce, and the big bounce off the floor | 0.16, 0.21 |
| the rim | 0.14 to 0.19 |
| the swish | 0.19 |
| the scoreboard | 0.18 |
| a shoe squeaking | 0.12 |
| a hand on the ball | 0.14 |
| the buzzer | 0.16 to 0.21 |

Borrowed, and as loud as they always are: the breath in, the wheeze and the
cough (the workout tape's), the "boing", the audience
("Dawww", 0.18), a whoosh for a steal that misses. Nobody has heard any of
it yet: whether each is the right sound is for the owner to say, in the
preview.

To measure them again (on `npm run dev`, where the game's own files can be
asked for by name):

```bash
node tools/test/listen.cjs http://localhost:5173/ "import('/src/minis/ownbasket/sfx.ts').then((m) => m.rim())" 800
```

OB8, the two pennants over the baskets (the same shape as the paper ones,
which are 132 by 40: the red one is over Stephanie's own basket on the left,
the green one over the other on the right, each with its notch towards the
middle of the court):

```text
Two felt banners from a 1970s school gymnasium, photographed flat and straight on, one above the other with a wide clear gap between them, on one plain flat light-grey background. Both are the same size and shape: a long horizontal strip of thick felt about three and a half times as wide as it is tall, with a V-shaped notch cut into one end like a swallowtail, and a narrow stitched hem all round. The top one is bright red, with its straight end on the left and its notched end on the right, and the word HOME sewn on in large cream-white felt capital block letters. The bottom one is dark green, with its notched end on the left and its straight end on the right, and the word VISITORS sewn on in large cream-white felt capital block letters. The letters fill most of each banner and are spelled exactly HOME and VISITORS. No cords, no poles, no pins, no wall, no other words. Soft even light, no shadows on the background. No borders. Wide 16:9 image.
```
