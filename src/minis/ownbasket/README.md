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
  then: 40 seconds.
- **The shot is the meter from Mom's workout tape**, with the tape's own
  breath in while it fills: hold to fill it, let go in the green at the top.
  What the ball then does:

  | Let go | What happens |
  | --- | --- |
  | in the green (the sweet spot) | The ball goes straight backwards over her head, flat and fast, and swishes into her own basket, with the "PAH". |
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

The clock is the game's own, on the scoreboard, because it has to stop for
the tip and wait for a shot that is in the air: so the game says
`timed = false`, and the tape's clock is not shown.

## Tuning

At the top of `OwnbasketMini.ts`:

- The meter: `INHALE`, `ZONE` and `TOO_LONG` are the workout's own numbers
  (they are not shared with it: change them there and they do not change
  here). `FEEBLE` is where "too early" becomes "far too early".
- How long the game is (`GAME`), how fast each of them moves (`SPEED`,
  `HER_SPEED`), how far Stephanie's arm reaches for a steal (`REACH`), how
  long she may hold the ball (`HOG`), and how near the basket the other girl
  comes before she shoots (`HER_RANGE`).
- What they say: `SHE_SAYS` and `HER_ANSWER`, in the order they are said.

## What it borrows

The gym and its bleachers (`layGym`, `bleachers`); Stephanie's faces from
everybody's set (`head(scene, 'stephanie', ...)`: smile, laugh, angry, yell,
shocked, worried, guilty, smug, ouch, and her own `inhale` and `hold`); the
workout's meter (`lungs`, `breath`) and its breath in, "PAH", wheeze and
cough; the family's "boing"; the audience's "Dawww" from the sandbox, the
first time she scores; `tape_m`, `shadow`, and the words `bonk` and `whiff`.
Nothing of anybody else's is changed.

## Pictures

Everything of the game's own is cut paper so far (`art.ts`): the two girls,
the other girl's four faces, the ball, the two baskets and their nets, the
scoreboard, the pennants and the buttons. These are the prompts for photos
to take their places. The uniforms are red and white for Stephanie's school
and green for the visitors: change them to the real colours if they are
known, and the numbers (12 and 7 are made up).

The ball is a piece of its own, which the game moves: **nobody in these
pictures is holding one**.

### OB1. Stephanie, in her basketball uniform (two sheets)

Her head is taken off and her own put on, so her hair is tied up out of the
way of her neck, as in the cheer pictures.

```text
Four full-length photographs of the same girl of about twelve side by side with wide clear gaps between them, on one plain flat light-grey studio background. A 1970s middle school girls' basketball uniform: a red sleeveless jersey with white trim and a white number 12, red shorts with a white stripe, white knee socks with red bands, white canvas high-top trainers, her hair tied up in a tight bun so her neck and shoulders are clear. Her body is turned towards the right of the picture in all four, and there is no ball in any of them. First: standing ready, knees a little bent, her right hand held low and flat in front of her as if bouncing a ball. Second: running to the right, mid-stride, the same hand low as if dribbling. Third: the same run a moment later, the other leg forward. Fourth: crouched with her knees well bent, both hands together in front of her chest as if holding a ball, about to jump. Her whole body is in frame from head to feet in every one. Soft even light, no shadows on the background. No text other than the number, no borders. Wide 16:9 image.
```

Then, with that sheet attached:

```text
The same girl in the same uniform, on the same background in the same light: four more full-length photographs side by side with wide clear gaps between them, her body turned towards the right of the picture, no ball in any of them. First: at the top of a jump shot, feet off the ground, both arms stretched up above her head, wrists flicked forward. Second: a low defensive stance, feet wide apart, knees bent, both arms held out wide to the sides. Third: lunging forward to the right, one arm stretched out as far as it will go, reaching to slap a ball away. Fourth: jumping for joy, both fists thrown up in the air, feet off the ground. Her whole body is in frame from head to feet in every one. No text other than the number, no borders. Wide 16:9 image.
```

### OB2. The other girl (two sheets)

She keeps her own head, so her face matters: say what she is like if the
story has somebody in mind. She faces the other way from Stephanie.

```text
Four full-length photographs of the same girl of about twelve side by side with wide clear gaps between them, on one plain flat light-grey studio background. She has brown hair in a high ponytail and freckles, and wears a 1970s middle school girls' basketball uniform: a green sleeveless jersey with white trim and a white number 7, green shorts, white knee socks with green bands, white canvas high-top trainers. Her body is turned towards the left of the picture in all four, her face can be seen, and there is no ball in any of them. First: standing, her left hand held low and flat in front of her as if bouncing a ball, concentrating. Second: running to the left, mid-stride, the same hand low as if dribbling, concentrating. Third: the same run a moment later, the other leg forward. Fourth: at the top of a jump shot, feet off the ground, both arms stretched up above her head. Her whole body is in frame from head to feet in every one. Soft even light, no shadows on the background. No text other than the number, no borders. Wide 16:9 image.
```

Then, with that sheet attached:

```text
The same girl in the same uniform, on the same background in the same light: four more full-length photographs side by side with wide clear gaps between them, her body turned towards the left of the picture, no ball in any of them. First: a low defensive stance, feet wide apart, both arms held out wide, scowling. Second: lunging forward to the left, one arm stretched out, reaching to slap a ball away. Third: standing with both hands held out palms up and her shoulders shrugged, her mouth a little open, completely baffled by what she has just seen. Fourth: jumping for joy, both fists in the air, laughing. Her whole body is in frame from head to feet in every one. No text other than the number, no borders. Wide 16:9 image.
```

### OB3. The basket, the ball and the scoreboard

```text
Three things photographed side by side with wide clear gaps between them, on one plain flat light-grey background. First: a school gymnasium basketball goal seen exactly from the side, in profile: a grey steel post on a heavy black base at the left, an arm reaching out to the right from the top of the post, a white backboard seen edge on, and an orange rim with a white net sticking out to the right of the backboard. All of it in frame from the base on the floor to the top of the backboard. Second: a worn orange leather basketball. Third: an old electric gymnasium scoreboard of the 1970s, a wide black metal box seen straight on, with the words HOME and VISITORS across the top and three dark blank panels below them where the lit numbers go, all switched off. Soft even light, no shadows on the background. Wide 16:9 image.
```

The court itself is the fight's gym, as it is.

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

Borrowed, and as loud as they always are: the breath in, the "PAH", the
wheeze and the cough (the workout tape's), the "boing", the audience
("Dawww", 0.18), a whoosh for a steal that misses. Nobody has heard any of
it yet: whether each is the right sound is for the owner to say, in the
preview.

To measure them again (on `npm run dev`, where the game's own files can be
asked for by name):

```bash
node tools/test/listen.cjs http://localhost:5173/ "import('/src/minis/ownbasket/sfx.ts').then((m) => m.rim())" 800
```
