# Dinner at Le Papillon

Bill and Stephanie are out to dinner at a fancy restaurant, with Christian.
Stephanie orders what she wants most. The player orders for Bill, and the
right answer is always whatever she wanted second. Its short name is
`papillon`.

This folder also has the restaurant itself: the room, the table, the waiter
and everybody's seat. The other two games set at Le Papillon (`veggies`,
`favorite`) use those pictures as they are, and all three lay the place
with `src/minis/shared/papillon.ts`.

## The story

In the owner's words:

> The first is a play on the reality that when we go to restaurants we just
> order whatever Stephanie wants, then bill chooses whatever Stephanie wants
> the second most.
>
> the game takes place in a fancy restaurant. the player character is bill.
> bill sits across from stephanie. they are both holding and reading a menu.
> stephanie has a though bubble pop up with what she wants the most and what
> she wants the second most. the player must decide to order what stephanie
> wants to eat.
>
> the whole joke being that "what a crazy coincidence that what stephanie
> wants the second most is also what Bill always wants"
>
> during the game at some point the waiter brings by an Amuse Bouche and
> announces "Amuse Bouche, Compliments of the Chef." Christian replies with a
> smug face "Tell The Chef to consider MY Bouche Amused!"

Those two lines are said in the game as they are written there. The
restaurant is called Le Papillon (the butterfly), which is why there are
butterflies in the wallpaper and under glass on the wall.

## How it plays

A story that waits for the player: no clock. Three courses, and for each:

1. The waiter asks ("TO START?").
2. A thought pops up over Stephanie's head: the dishes she wants, with a
   "1" on the one she wants most and a "2" on the next. After a couple of
   seconds it goes.
3. She orders her first choice out loud.
4. "AND FOR YOU, SIR?" Four cards off the menu come up over the tablecloth.
   The player taps one.

- **Her second choice** is right: "OOH! I WAS GOING TO GET THAT!", hearts,
  and WHAT A CRAZY COINCIDENCE! on a burst. On to the next course.
- **Her first choice:** "THAT'S WHAT I'M HAVING."
- **Anything else:** "...REALLY, BILL?"

Either wrong answer ends the dinner there (a miss), after her thought has
come back up to show which one he should have had.

It gets harder to keep track of. The main course is three dishes deep (the
answer is still the "2"). Over dessert she starts with them one way round
and then changes her mind: the two dishes swap places, and it is where they
end up that counts.

After the first course the waiter goes away and comes back with a silver
dome on a tray. Under it is one very small thing on a very big plate:
"AMUSE-BOUCHE. COMPLIMENTS OF THE CHEF." Christian, smug: "TELL THE CHEF TO
CONSIDER MY BOUCHE AMUSED!" Ba-dum tss; Bill gives him the side-eye and
Stephanie laughs.

Getting all three courses right is a hit: BON APPETIT!, and butterflies.

Which dishes she wants is different every time (two of the course's four,
picked at random; three for the main course). The careful bot always orders
her second choice. The careless one gets the first course right, which
shows the amuse-bouche, and then orders what she is having.

What can be changed easily: how long each thought stays up (`THINKS` in
`PapillonMini.ts`), and the menu (`MENU` in `art.ts`: each dish is a short
name, which is its picture, and what the card says).

## Who is in it

- **Bill, Stephanie and Christian,** with the faces from their sets
  (`docs/characters.md`). Bill is `smile` reading, `worried` choosing,
  `smug` when he gets it right, `guilty` when he does not, and his
  `sideeye` at Christian. Stephanie's glare is her `hold`.
- **The waiter** is nobody: a generated person, in this restaurant only,
  like the other girl in the fight. He is cut paper until PP5 is made.

## Pictures

Everything is cut paper so far, drawn in `art.ts`. Each of these replaces
the paper piece with the same name, once it is made, cut by `cut.py` and
listed in `PIECES` in `index.ts`. Nothing has been generated yet.

As always: clean photos on a plain background, no border and no shadow
(the game adds those), and the full-size picture sent back with its number.

Every prompt here stands by itself: nothing has to be attached, and none
waits on another's result, so all of them can go to the generator as one
batch. In a batch each is called by its heading and a letter, in the order
they are written (PP1a is the room, PP1b the sign; PP7a, PP7b and PP7c the
three courses). If a second sheet comes back not matching the first (PP6b
beside PP6a, PP7b or PP7c beside PP7a), send that one again by itself with
the first sheet attached, beginning it "The same framing, background and
light as the attached picture:".

### PP1. The dining room

One photo is the whole backdrop (`papillon_wall`, `papillon_panel` and
`papillon_floor` together). Its name goes on the sign in the game.

```text
The empty dining room of an old-fashioned, expensive French restaurant, photographed straight on at the height of somebody sitting down. The upper two thirds of the wall is deep red damask wallpaper with a faint pattern of butterflies in it. Below that, dark polished wood panelling with a rail along its top. The bottom sixth of the picture is dark green patterned carpet. On the wall: two brass wall lamps with cream shades, lit, one a quarter of the way in from each side, and four small gilt frames, each with a single pinned butterfly under glass. Nothing at all in the middle third of the wall, no tables, no chairs, no people. Warm, low evening light. No text. Very wide panoramic image, 21:9.
```

```text
A blank hanging restaurant sign photographed straight on, on a plain flat light-grey background: a wide oval-cornered board of black lacquer in a heavy gilt frame, hanging from two short brass chains, with a small gold butterfly painted at each end and the middle left completely empty. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

### PP2. The tables

```text
A restaurant table for three, photographed from straight in front and very slightly above, on a plain flat light-grey background: covered in a heavy white linen tablecloth that hangs all the way to the floor in soft folds, so that no legs show. Nothing on it. The whole table is in frame. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

```text
A very long banqueting table for six people side by side, photographed from straight in front and very slightly above, on a plain flat light-grey background: covered in a heavy white linen tablecloth that hangs all the way to the floor in soft folds, so that no legs show. Nothing on it. The whole table is in frame. Soft even light, no shadows on the background. No text. Very wide panoramic image, 21:9.
```

### PP3. What stands on the table

```text
Eight things photographed side by side on one plain flat light-grey background, with wide clear gaps between them, all seen from the side at table height. A plain white dinner plate, empty. An empty wine glass. The same wine glass half full of red wine. A brass candlestick with a lit cream candle. A single red rose in a small glass bud vase. A polished silver dome (a cloche) with a knob on top, sitting on a round silver tray. The same round silver tray by itself. A tiny canape on a very large white plate: one small square of toast with a dot of green on it, absurdly small for the plate. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

```text
A closed restaurant menu held upright in two hands, photographed from straight in front on a plain flat light-grey background: dark burgundy leather, a thin gold line round its edge and a small gold butterfly stamped in the middle of the cover, a hand gripping each side of it half way up. Only the hands and wrists show, cut off square at the wrist. Soft even light, no shadows on the background. No text. 3:4 image.
```

### PP4. The chair

```text
A dining chair from an expensive old restaurant, photographed from straight in front on a plain flat light-grey background: a tall arched back in dark polished wood, upholstered in buttoned dark green velvet. Only the back and seat matter; the whole chair is in frame. Soft even light, no shadows on the background. No text. 3:4 image.
```

### PP5. The waiter

A whole person with his own face: nothing is replaced. He faces the right
of the picture in both.

```text
Two full-length photographs of the same man side by side with a wide clear gap between them, on one plain flat light-grey studio background. He is the head waiter of an expensive old French restaurant: about fifty, thin, slicked-back black hair, a thin waxed moustache curled up at the ends, a black waistcoat over a white shirt with a red bow tie, and a long white apron from his waist to his shins, black shoes. He looks down his nose with his eyes half closed and his eyebrows up, as if nothing is quite good enough. He is turned a little towards the right of the picture in both. Left: standing very straight, a folded white cloth over one forearm held across his waist, the other hand behind his back. Right: the same, but with one arm out in front of him towards the right of the picture, bent at the elbow, the hand flat and palm up at shoulder height, as if carrying a tray that is not there. His whole body is in frame from head to feet in both, his feet on the same floor line. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### PP6. Everybody, sitting down

The heads come off and the family's own go on, so the faces do not matter:
what matters is a clear neck and shoulders, facing the camera, and nothing
in the hands. Each is cut off below the chest by the table. Two sheets.

```text
Three photographs side by side with wide clear gaps between them, on one plain flat light-grey studio background, each of a person dressed for dinner at an expensive restaurant, sitting upright and facing the camera, seen from the waist up, arms down at their sides with their hands out of sight below the bottom of the picture. Left: a slim man of about seventy in a black dinner jacket, white shirt and dark red tie. Middle: a woman of about sixty in a royal-blue evening dress with a low round neckline and a string of pearls, her hair up so that her neck and shoulders are clear. Right: a man of about thirty-five in a dark green velvet jacket, cream shirt and black bow tie. Nothing covers anybody's head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

```text
Three photographs side by side with wide clear gaps between them, on one plain flat light-grey studio background, each of a man dressed for dinner at an expensive restaurant, sitting upright and facing the camera, seen from the waist up, arms down at his sides with his hands out of sight below the bottom of the picture. Left: a man of about fifty in a grey suit, white shirt and red tie. Middle: a man of about fifty in a navy jacket, pale blue shirt and white tie. Right: a man of about thirty-five in a brown tweed jacket, white shirt and mustard-yellow tie. Nothing covers anybody's head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

(Left to right: Bill, Stephanie, Christian; then Shane, Chad, Branson.)

### PP7. The menu

Three sheets, a course each. Every dish is on the same plain white plate,
seen from the same angle, so that they sit alike in her thought and on the
cards.

```text
Four restaurant dishes photographed side by side on one plain flat light-grey background, with wide clear gaps between them, each on the same plain white plate and seen from the same angle, a little above the side. Left to right: French onion soup in a brown crock with melted cheese over the top; six escargots in their shells with parsley; a shrimp cocktail in a glass with shrimp hooked over the rim; a small green salad with tomato. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

```text
Four restaurant dishes photographed side by side on one plain flat light-grey background, with wide clear gaps between them, each on the same plain white plate and seen from the same angle, a little above the side. Left to right: a grilled steak with a pat of butter melting on it; a fillet of salmon with a wedge of lemon and asparagus; a whole small roast chicken; a whole red lobster. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

```text
Four restaurant desserts photographed side by side on one plain flat light-grey background, with wide clear gaps between them, each on the same plain white plate and seen from the same angle, a little above the side. Left to right: a slice of chocolate layer cake with a cherry on top; a slice of apple tart with a lattice crust; an ice cream sundae in a tall glass with chocolate sauce and a cherry; a slice of cheesecake with strawberry sauce. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

## Sound

Nothing recorded. It uses the game's own effects (the cash register for a
right answer, the trombone for a wrong one, the twinkle for the dome coming
off) and makes four small ones of its own out of `sound.tone()` and
`sound.noise()`, at the bottom of `PapillonMini.ts`. Measured with
`tools/test/listen.cjs`, beside the mouth "bonk" at 0.17:

| | Loudest 46 ms |
| --- | --- |
| The rimshot (ba-dum, tss) | 0.17 on the drums |
| The waiter clearing his throat ("AHEM.", if Bill takes too long) | 0.17 |
| The thought popping up | 0.13 |
| The waiter's footsteps | about 0.06, on purpose: they are under everything else |

(The footsteps were measured at 0.11 when they were set nearly twice as
loud, and turned down from there; the meter read low on the later runs,
with other work going on, so that last number is worked out and not read
off.)

Nobody has heard any of it yet: whether each is the right sound is for the
owner to say, in the preview.
