# Pappy comes home

Pappy gets in late. First he has to find the right key; then he has to face
Mammy; then he does the only thing that has ever worked. Its short name is
`homecoming`.

## The story

In the owner's words, as he asked for it:

> POV pappy coming home simulator: camera angle over Pappys shoulder. pappy
> as the player character fumbles with his key ring. A key ring appears on
> screen with 3 keys. A big arrow appears that says "choose the right key".
> The player chooses a key pappy tries the door. It doesn't work. Same with
> the second key. Then on the third choice pappy uses the key to unlock the
> front door. The door starts open slowly, then SUDDENLY door opens in a
> hurry to Mammy grumpy face. Immediately angry. Then the yelling face
> nagging pappy.
>
> The viewpoint changes so both characters are in frame mammy still nagging.
> Pappy knows the only thing that appeases Mammy. The gameplay begins: you
> have to slide pappy on his knees towards mammy who is bent over mooning
> him. And you have to make the player character kiss her butt. Kissing
> sound effects and action bubbles that say "kiss" appear. Each kiss makes
> her slightly less angry. The game ends as a success when Mammy's butt has
> been kissed enough.

Mammy and Pappy are Stephanie's mother and father.

**What is made up, and is the owner's to put right:** everything either of
them says. Nobody has said yet what Mammy really shouts when Pappy is late,
or what he says back, so the lines are the plainest that would do (`WRONG`,
`AT_THE_DOOR`, `IN_THE_ROOM` and `AFTER_A_KISS` at the top of
`HomecomingMini.ts`). So are the rolling pin, the "#1 PAPPY" written on the
tag of his keys, and Pappy's red jacket. (Mammy's leopard-print housecoat is
the owner's own choice: the prompt said light blue.)

## How it plays

It is a story that waits for the player (`timed = false`): there is no clock,
and it always ends in "YOU DID IT!".

**At the door**, seen over Pappy's shoulder.

- He gets his keys out and has no idea ("NOW, WHICH ONE IS IT..."). The bunch
  comes up big, three keys on a ring, with an arrow: CHOOSE THE RIGHT KEY.
- Tap a key and he tries it. **The first two tried are never it, whichever
  they are; the third always is.** A key that has been tried hangs there
  crossed out, and tapping it again does nothing but rattle it.
- The right one turns ("CLICK!"). The door opens slowly, a hand's width, on
  the dark and a pair of eyes; then all the way at once ("BANG!"), and Mammy
  is in the doorway with a rolling pin: her `angry` face, and not a word.
  Pappy: "...HI, HONEY."
- Then she is in his face, yelling (`yell`, her mouth going), three things
  one after another.

**In the front room**, the two of them from the side, Mammy still at it.

- "PAPPY KNOWS THE ONLY THING THAT APPEASES MAMMY." He says "YES, DEAR.",
  and goes down on his knees; she turns her back, throws the hem of her
  housecoat up and bends over.
- **Slide Pappy over and kiss her butt.** He goes after a finger: put one
  down and he shuffles across the carpet towards it, and follows it while it
  is held. A tap sends him once; a finger kept down keeps him at it. (The
  space bar is a finger in the middle of the page.)
- When his lips arrive: a kiss, with its sound, a "KISS!" on a burst, hearts,
  and a lipstick mark left on her bloomers for good. Then she shoves him back
  off her hip ("HMPH!"), less far the less cross she is, and he has to come
  again.
- Each kiss takes a notch off MAMMY'S TEMPER at the top and changes her face
  (`TEMPER`: yell, yell, angry, angry, talking, calm, smug, smile) and what
  she has to say about it. Eight kisses (`NEED` in `layout.ts`) and all is
  forgiven.

**She is in bloomers,** big white ones with red hearts on, not bare: Mammy is
a real person, and the body is a generated photo with her own face on it.
The housecoat goes up and the bloomers are what he gets.

**He has to dive for it.** Her bloomers are lower than a kneeling man's
mouth, so for each kiss the whole of him tips forward off his knees, feet in
the air, until his lips are where they are wanted (`aim()` works out how far
from where the kiss lands and where his chin is: nothing is set by hand).

The two bots: the careful one tries the keys left to right and goes straight
over. The careless one goes back to a key he has already tried, and stops
half way across the carpet for a think. Both get in, and both are forgiven.

Tuning, all at the top of `HomecomingMini.ts` or in `layout.ts`: how many
kisses (`NEED`), how fast he shuffles (`SPEED`), how big the two of them and
their heads are (`SIZE`, `HEAD`), where the door is and how big (`DOOR`).

## Pictures

Every picture is a photo now: the owner made all nine (26 November 2026), and
`cut.py` cut them. Their faces are their own, from everybody's set
(`docs/characters.md`): Mammy's angry, yell, talking, calm, smug, smile and
laugh; Pappy's worried, smug, talking, shocked, ouch, smile, laugh, and his
`pucker` for the kiss. Mammy's two faces in the doorway are bigger copies of
her angry and yell, made from the same files (`PIECES` in `index.ts`).

The paper stand-ins are all still there, in `art.ts`, under the same names: a
page that cannot fetch its pictures plays in paper. Where a photo has taken a
stand-in's place its numbers (how big, where it is held, where a chin goes)
come from the photo: `cut.py` writes them into `cut.ts`, and `layout.ts`
hands over whichever is on the page.

The front room is the den from Mom's workout tape, used as it is
(`layDen`), with this game's own front door on its wall.

### What came back, and what was cut from it

All of it is kept in `art-src/games/homecoming`: each picture as it came, and
beside it Adobe's answers (`-cutout.png`, the background off; `-headmask.png`,
its selection of the head, where a head comes off). Seven came from the
owner's Drive ("Additional Home Movies Game Assets"), as JPEGs 1344 pixels
wide; PH1b came in the chat, twice that size. Full-size copies of the seven,
if there are any, would be sharper: Pappy's back and Mammy in the doorway are
drawn about as big as their pictures are.

| Picture | What it is | What was cut from it (in `assets`) |
| --- | --- | --- |
| `PH1-porch.jpg` | The front of the house at night, door shut | `door`: the door itself, by its place in the picture (`SHUT_DOOR` in `cut.py`). Nothing goes to Adobe. |
| `PH1b-porch-open.webp` | The same, door open on the dark hall (an edit of PH1) | `porch.jpg`: the whole of it is the place. The door from PH1 lies over its doorway until the door flies open; after that the open door is the picture's own. |
| `PH2-pappy-back.jpg` | Pappy from behind, and his hand with a key, each on a card of its own | `pappy-back` (whole: the back of that head is the generated man's own) and `hand-key`, held by the tip of the key. Each was cut off its card before it went to Adobe. |
| `PH3-keys.jpg` | A key ring with a tag on a chain, and three keys | `ring`, `key0`, `key1`, `key2`. Each key is held by the hole in its head. The paper in the tag came back see-through (white, on a white sheet) and is put back; "#1 PAPPY" is written on it in the game. |
| `PH4-mammy-door.jpg` | Mammy from the hips up, arms folded round a rolling pin | `mammy-door`, head off. She is drawn big enough that the foot of the picture is off the page. |
| `PH5-pappy.jpg` | Pappy three times: hat in hand, on his knees, and leaning in with his arms out behind | `pappy-stand`, `pappy-kneel`, `pappy-smooch`, heads off. The two on their knees are held at the knee, so that one changes for the other without his moving. |
| `PH6-mammy.jpg` | Mammy twice: hands on hips, and bent over with her housecoat up | `mammy-stand`, `mammy-bent`, heads off. Where a kiss lands, and the part of her bloomers the marks are left on, are found by their colour (white). |
| `PH7-door-inside.jpg` | The front door from inside, open on the night, in the wall of a room | `door-in`: the frame and what is in it (`INSIDE` in `cut.py`). Nothing goes to Adobe. |

What went to Adobe is each figure by itself, cut off its sheet and made twice
the size (`SENT` in `cut.py`; `cut.py send <folder>` writes them out again),
because a head 70 pixels tall is too small for it to find a chin on. To cut
everything again from what is kept:

```bash
.venv/bin/python src/minis/homecoming/cut.py
```

### The prompts

As they were sent. The owner changed the housecoat to leopard print before
making PH4 and PH6. PH1's first prompt and PH2 to PH7 stand alone and were
made as one batch; PH1's second is an edit of the picture the first gave.

**PH1. The front door** (two images, made as a chain, so that the door can
open)

```text
The front of a suburban American house at night, about 1985, photographed exactly face-on from the porch, a few feet from the front door. Cream clapboard siding. A dark green panelled front door, shut, in a white frame, with a brass knob and a brass lock above it on its left side; the whole door is in the picture, from its top to the step, and stands a little to the right of the middle. To the left of the door a black porch lantern, lit, throwing warm light on the wall; further left a window with the light on behind closed curtains. A doormat that says WELCOME on grey painted porch boards. Nobody in the picture. No other text. Wide 16:9 image.
```

```text
Edit this picture. Keep everything exactly as it is, the same framing and light. Change one thing only: the front door is now wide open, swung inside against the wall so that it can hardly be seen, and the doorway shows a dark hallway with the light off.
```

**PH2. Pappy from behind, and his hand**

```text
Two photographs side by side with a wide clear gap between them, on one plain flat light-grey background. First: an older man seen from directly behind, from the middle of his back up, close to the camera: broad shoulders in a red zip-up jacket with a white shirt collar showing above it, thick white hair combed back. He stands square, arms down. Second: the same man's right forearm and hand alone, in the same red sleeve with a white shirt cuff, reaching up and away from the camera towards the top right of the picture, holding a single brass house key between finger and thumb, pointing it forward as if at a keyhole. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

**PH3. The keys**

```text
Four things laid flat and photographed from straight above, side by side with wide clear gaps between them, on one plain flat light-grey background. First: an empty steel split key ring with a small red plastic tag hanging from it on a short chain, the tag blank. Second: a brass house key with a round head, pointing down. Third: a silver house key with a square head, pointing down. Fourth: a brass house key with a blue plastic cap on its head, pointing down. The three keys are about the same size and each is cut differently. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

**PH4. Mammy in the doorway**

```text
A photograph of a grandmother from the hips up, facing the camera square on, on a plain flat light-grey background. She wears a quilted light blue housecoat with a white collar, open at the neck. Her arms are folded across her front and she holds a wooden rolling pin in one fist, resting across her other forearm. Her shoulders are squared and her weight is forward: she has been waiting up. Her hair is tied back so that her neck and shoulders are clear, and nothing covers her head or neck. Soft even light, no shadows on the background. No text. Tall 3:4 image.
```

**PH5. Pappy's body** (three poses on one sheet)

```text
Three full-length photographs of the same older man, side by side with wide clear gaps between them, on one plain flat light-grey studio background. He wears a red zip-up jacket over a white shirt, grey trousers and white trainers. His body is turned towards the right of the picture in all three. First: standing with his shoulders rounded, holding a brown felt hat in both hands in front of his belt, sheepish. Second: kneeling upright on both knees, his shins flat on the floor behind him, hands pressed together in front of his chest, begging. Third: kneeling on both knees and leaning well forward from the hips, his chin pushed out in front of him, both arms stretched out behind him like wings. His whole body is in frame from head to feet in every one, and nothing covers his head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**PH6. Mammy's body** (two poses on one sheet)

```text
Two full-length photographs of the same grandmother, side by side with a wide clear gap between them, on one plain flat light-grey studio background. She wears a quilted light blue knee-length housecoat with a white collar and red fluffy slippers. First: facing the camera square on, hands on her hips, feet apart, very cross. Second: seen from the side and a little from behind, facing the right of the picture and bent over at the hips with her legs straight, one hand on her knee; her other hand has thrown the back of her housecoat up over her back, showing a very large pair of old-fashioned white cotton bloomers that reach half way down her thighs, with a frill at each leg and a pattern of small red hearts all over them; her head is turned to look back over her shoulder. Comic, like a seaside postcard. Her whole body is in frame from head to feet in both, her hair is tied back, and nothing covers her head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**PH7. The front door from inside**

```text
A photograph of the inside of a suburban front door, about 1985, face-on, on a plain flat light-grey background: a white door frame, the dark green door swung open into the room against the right side of the frame, and through the doorway the night: dark blue sky, a few stars, a moon. The whole frame is in the picture from the floor to its top. Soft even light on the frame, no shadows on the background. No text. Tall 3:4 image.
```

### Faces

- **Pappy puckering up** is in everybody's set, as his own `pucker` (it is
  with the common pictures, not in this folder: `docs/characters.md`). The
  owner made it from Pappy's portrait with this, and sent it in the chat:

```text
Edit this photo. Keep this man exactly as he is: the same face, age, skin, white hair and moustache, the same lighting, the same background and the same framing. Keep his head upright and facing the camera. Change one thing only, his expression: about to give somebody a kiss. Eyes gently closed, eyebrows raised, lips pushed well forward in a big pucker.
```

- **The back of Pappy's head** is still to come. What the game opens on is
  the back of the man in PH2, who is generated: white hair, the right
  jacket, and not Pappy. A real photo of Pappy from straight behind would
  take the place of that head (`characters.md` says to ask the owner how
  Bill's was made before trying to generate one).

## Sound

All of it is made up from notes and hisses, in `sounds.ts`. Nobody has heard
any of it: whether a sound is the right sound is for the owner to say, in
the preview. A real kiss, recorded, would go in as
`public/sfx/homecoming-kiss.mp3`.

How loud each came out (`tools/test/listen.cjs`, on the effects channel,
where the mouth "bonk" reads 0.19, the handful of sand 0.16 and the twinkle
0.11; they are reached as `window.__homecoming.kiss()` and so on):

| Sound | When | Loudest 46 ms |
| --- | --- | --- |
| `jingle` | the keys come out, and the bunch comes up | 0.14 |
| `rattle` | a key worked about in the lock | 0.11 |
| `wrong` | it is not that one | 0.15 |
| `unlock` | it is that one | 0.19 |
| `creak` | the door, slowly | 0.13 |
| `bang` | the door, all at once (the game's own `boom`, and a crack) | 0.32 |
| `gulp` | "...HI, HONEY." | 0.11 |
| `nag` | Mammy has something to say | 0.13 |
| `kiss` | a kiss | 0.17 |
| `bump` | shoved back off her hip | 0.18 |
| `shuffle` | knees on the carpet, while he is moving | 0.07 |
| `kneel` | down he goes | 0.22 |
| `flap` | up goes the housecoat | 0.12 |
| `mmm` | she is coming round (from the fourth kiss, higher each time) | 0.12 |

Borrowed as they are from the game's own sound: `tock`, `tick` and `dodge`
(the keys), `twinkle` and `win` (the end).
