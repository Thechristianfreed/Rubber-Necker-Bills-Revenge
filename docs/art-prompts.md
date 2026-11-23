# Image prompts for the scrapbook look

The game is styled as Bill's scrapbook: every piece is a photo cut out with a
white paper border and a drop shadow. The game adds the border and shadow
itself, so generated images should be **clean photos on a plain background
with none of that baked in**.

How to use these (Nano Banana in the Gemini app):

- Use the highest-quality image model offered. One prompt per message.
- If a result is off, reply to it with the fix, e.g. "make it an exact side
  view" or "remove the necks and shoulders".
- Download the full-size image (not a screenshot) and do not crop or edit it.
- Send them back labelled with their letter.

## Already in the game

A (Bill's Bug), B (sedan, wagon, pickup), C (tour bus, van), D, H and I (twelve
rubberneckers), E (stand-in dog, until Lady's photo), F (landscape postcard),
G (palm, billboard, road sign, cone), L (guardrail), M (gold star, cotton puff,
paper burst), N (hit words), O (phone-filming arm, used as a hand and wrist),
P (bluebirds), S (Bill's body in three poses: rest, wind-up, swing). Their
prompts are in the git history of this file.

J (the shirt on its own) and K (the arm and bat on its own) were replaced by S
and are no longer used.

The interface, lettering and road paint are cut from paper sheets built from
these images. The tarmac is a public-domain photo texture (`art-src/library`).

## Level 1, Paper Route

Bill the paperboy rides his Stingray down a 1950s street tossing papers into
mailboxes. Every image for this level is in the game: T1, T2, T3b and T4 (the
boy on the bike: riding, winding up, throwing with an empty hand, ducking),
U (mailboxes on posts, waiting and delivered), V (the mailman), X (the houses),
Y (the picket fence) and Z (the tree with a birdhouse in it). The flying newspaper is cut from T3,
the first version of the throwing frame. The pavement is the public-domain
tarmac photo, bleached to concrete.

The thing to duck is the birdhouse sitting in the fork of the front-yard tree
(image Z, an edit of the tree W that added the birdhouse). The tree stands
behind the fence; the birdhouse is lifted onto its own layer and drawn again,
a size larger, in front of Bill at head height.

Note for sheets of several objects: ask for one plain backdrop behind all of
them. Objects each sitting on their own card or panel have to be cut apart by
hand first, because background removal keeps the cards.

## Bonus level, The SKIPPY Jar

The school hallway, seen over Bill's shoulder: jars and milkshakes fly out of
the bully's open locker straight at the camera and Bill sends them back with
the bully's tennis racquet. Every image for this level is in the game:

- SJ1, the hallway: one photo is the whole backdrop.
- SJ2a, SJ2b and SJ2c, Bill from behind with the racquet: ready, winding up,
  hitting. The hitting frame came with a tennis ball on the strings;
  `make_cutouts.py` paints it out with strings from the ready frame.
- SJ3, the back of his head.
- SJ4, the jar, the milkshake and his history book. Each came on a panel of
  its own, so the three panels were stitched into one plain strip before the
  background was removed.
- SJ5, four splats, cut out of their blue backdrop by colour.

Their prompts are in the git history of this file. The cut-paper versions in
`src/art/hallway.ts` are only used if a photo fails to load.

## Bonus level, The Hot Carl

A basement family room at night: DJ asleep on the couch, Neil with the sock,
Forrest filming, Christian at the light switch, and Alex's dad at the door.
The level is playable with cut-paper stand-ins (`src/art/sleepover.ts`). These
photos replace them. Every person's head gets replaced, with a photo of the
real person or a stand-in face, so the faces in these do not matter.

### HC1. The room (two images, made as a chain)

HC1a, the door shut:

```text
A photograph of an empty suburban basement family room at night, around 2010, with the ceiling light on, looking straight at one wall. The wall is wood panelling across the whole width of the picture, seen exactly face-on with no perspective slant, and beige carpet fills the bottom quarter of the picture. A three-seat fabric couch stands against the wall a little left of the middle, seen exactly from the front. A floor lamp stands at the far left. At the far right is a closed interior door, with a plain white light switch on the wall just to the left of it at shoulder height. A small window high on the wall shows that it is dark outside. No people. Even, slightly warm indoor light. No text, no borders. Very wide 21:9 image.
```

HC1b, the door open (send as an edit of HC1a):

```text
Edit this image. Keep the room, the furniture, the framing and the lighting exactly the same. Change only the door at the far right: it is now wide open, with bright light from a hallway behind it.
```

### HC2. Neil and the sock (two images, made as a chain)

HC2a, sock up:

```text
A photograph of a teenage boy about sixteen in a T-shirt and pyjama bottoms, barefoot, standing and seen from the front, his whole body in frame with empty margin on every side. His right arm is raised high, and from his right fist dangles a white tube sock with two red rings round the cuff, held by the cuff, hanging straight down with a heavy round lump in its toe and a brown stain on the toe, a little steam rising from it. His left arm hangs at his side. Soft even indoor light. Plain flat light-grey background: no floor, no shadow, no text, no border. Tall 9:16 image.
```

HC2b, sock down (send as an edit of HC2a):

```text
Edit this image. Keep the boy, his clothes, the sock, the framing, the lighting and the background exactly the same. Change only his right arm: he has brought it down in front of him to chest height, so the sock is hanging lower, as if he has just bopped something with its toe.
```

### HC3. DJ on the couch (two images, made as a chain)

HC3a, asleep:

```text
A photograph of a teenage boy about sixteen asleep on his back, zipped into a blue sleeping bag, his head on a white pillow at the left, seen exactly from the side at the height of the couch he would be lying on. Only the boy, the sleeping bag and the pillow: no couch. His mouth is slightly open. The whole of him is in frame with empty margin on every side. Soft even indoor light. Plain flat light-grey background: no shadow, no text, no border. Wide 16:9 image.
```

HC3b, awake (send as an edit of HC3a):

```text
Edit this image. Keep the sleeping bag, the pillow, the framing, the lighting and the background exactly the same. The boy has just been woken up: his head is lifted off the pillow, eyes wide open, mouth open, baffled.
```

### HC4. Forrest filming

```text
A photograph of a teenage boy about sixteen in a T-shirt and pyjama bottoms, standing and seen from the front, his whole body in frame with empty margin on every side. He holds a smartphone up in both hands, filming something low down to his right (the left of the picture), grinning. Soft even indoor light. Plain flat light-grey background: no floor, no shadow, no text, no border. Tall 9:16 image.
```

### HC5. Christian at the light switch

```text
A photograph of a teenage boy about sixteen in a T-shirt and pyjama bottoms, standing and seen from the front, his whole body in frame with empty margin on every side. His left arm (on the right of the picture) is stretched up and out to the side, one finger out, as if flicking a light switch on a wall beside him at head height. He is looking the other way, grinning. Soft even indoor light. Plain flat light-grey background: no wall, no switch, no floor, no shadow, no text, no border. Tall 9:16 image.
```

### HC6. Alex's dad

```text
A photograph of a middle-aged father in a blue dressing gown, pyjama bottoms and slippers, standing with his hands on his hips, seen from the front, his whole body in frame with empty margin on every side. He has just come downstairs in the middle of the night and is furious. Soft even indoor light. Plain flat light-grey background: no floor, no shadow, no text, no border. Tall 9:16 image.
```

### The faces

Best of all is a photo of each of the real people, with their say-so: Neil,
DJ, Forrest, Christian and Alex's dad. Any photo where the face is clear will
do; it gets cut out the way Bill's were. Failing that, this makes stand-ins:

```text
Six head-and-shoulders photographs in a row with clear gaps between them, all on one plain flat light-grey background: five different teenage boys about sixteen and one middle-aged man with a moustache. Each looks straight at the camera. The first boy has a sly grin, the second is fast asleep with his mouth open, the third is laughing, the fourth grins, the fifth is wide-eyed with shock, and the man is furious. Soft even light. No text, no borders. Very wide 21:9 image.
```

## Home Movies: Mom's workout tape

Mom's head is Stephanie's own; the bodies, the room and the television are
paper stand-ins so far.

### WT1. Mom's face

Done, from one photo: Stephanie smiling in the kitchen (`art-src/photos/mom-1.jpg`).
`tools/make_cutouts.py` cuts her head out and makes the other three faces from
it the way cut-out animation does: her chin drops open on a hinge for the
"PAH", her face goes long for the breath in, and her cheeks puff out and go
red for holding it.

Real expressions would be better still, and the lemon drop photo
(`art-src/photos/mom-2.jpg`) has just the eyes for it. It needs the glass
taken away and the mouth opened, which is a job for the image generator:

```text
[Attach the lemon drop photo, and the round one of her smiling with her hair down.] Four head-and-shoulders photographs of this same woman in a row with clear gaps between them, all on one plain flat light-grey background. Exactly her face, her age and her blonde hair worn down as in these photos; no glass and no hands in any of them. First: smiling at the camera. Second: sucking in a huge breath through pursed lips, eyes wide. Third: the sideways glare from the lemon drop photo, but with her mouth wide open as if she has just shouted "PAH!". Fourth: holding her breath, cheeks puffed right out, eyes squeezed shut. Soft even light. No text, no borders. Very wide 21:9 image.
```

Send the result back and the four heads replace the ones made from the
kitchen photo (`mom-smile.png`, `mom-in.png`, `mom-pah.png`, `mom-hold.png`
in `src/assets/scrap`).

### WT2. The poses

The game has five poses, guessed from the three screenshots: the lunge, the
pretzel (sitting twist), the frog (squat with knees wide), the donkey kick
(on all fours, one leg straight back) and the big stretch (standing, both
arms up). More screenshots mean more, and truer, poses: each one only needs
to show where the arms and legs go.

For photo bodies in place of the paper dolls, one sheet per person. Mom
faces the camera, in the leotard from the tape; Bill is seen from the same
angle in his own. The heads are cut off and replaced, so they do not matter.

```text
Five full-length photographs of the same woman in a row with clear gaps between them, all on one plain flat light-grey background, from a 1990s home workout video: shiny pink leotard, white leg warmers, white trainers. She faces the camera in each. From left to right: a deep side lunge with one hand on her knee; sitting on the floor in a twist, one leg straight out and the other knee up, pulling the knee across; a deep squat with knees wide and elbows pressing them apart; on hands and knees with one leg kicked straight out behind; standing tall with both arms stretched straight up. Soft even studio light, no shadows on the background, whole body in frame in every one. No text, no borders. Very wide 21:9 image.
```

```text
The same five poses in the same order, on the same plain flat light-grey background, but the person is a slim man of about seventy in a royal-blue leotard and white trainers, bare hairy legs, taking it completely seriously. Soft even studio light, whole body in frame in every one. No text, no borders. Very wide 21:9 image.
```

### WT3. The room

```text
A 1990s living room photographed straight on from the middle of the floor: wood-panelled wall, beige wall-to-wall carpet filling the bottom third, nothing in the middle of the room. Empty of people. Evening lamp light. No text. Wide 16:9 image.
```

```text
A 1990s wood-cabinet television set with a video recorder underneath, photographed straight on against a plain flat light-grey background, screen switched off and plain dark grey. Soft even light, no reflections on the screen. No text, no logos.
```

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
