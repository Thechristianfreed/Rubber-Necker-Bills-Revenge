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

Done so far: Stephanie's three faces for the breathing (WT1) and her six
bodies (WT2), cut out by `mom()` and `workout_bodies()` in
`tools/make_cutouts.py`. Still paper stand-ins: Bill's bodies, the room on the
tape, the television and the den. One thing is missing from WT1: her everyday
face is still from the kitchen photo, with her hair up, so her hair changes
when the breathing starts. The photo the three edits were made from (hair
down, outdoors) would fix that.

### WT1. Stephanie's faces

What goes wrong: asked for several new photographs of "this woman", the
generator invents a new woman. It keeps a likeness when it *edits one photo*
and changes one thing. So: one face per image, always starting from the
kitchen photo, in a fresh chat each time, with the biggest copy of the photo
there is. The tape frame goes in as a second image, for the expression only.
If it starts copying the tape lady, leave her frame out and let the words do
it. If the first try is not her, ask again rather than correcting it.

The "PAH" (attach the kitchen photo, then the tape frame of the "PAH"):

```text
Edit the first image. It is a photo of the woman I want. Keep her exactly as she is: the same face, age, skin, eyes, nose, teeth, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: her mouth is thrown wide open in a big round shout, jaw dropped as far as it will go, top teeth showing, eyes rolled up toward the ceiling, eyebrows raised. The second image shows the expression I mean. Use it for the expression only: do not copy that woman's face, hair, clothes or the look of that picture. Do not make her younger, smoother or prettier. Photorealistic, the same quality as the original photo.
```

The breath in (attach the kitchen photo, then the tape frame of the breath in):

```text
Edit the first image. It is a photo of the woman I want. Keep her exactly as she is: the same face, age, skin, eyes, nose, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: her lips are pushed forward and squeezed into a tight pucker, as if sucking air in through a straw, her cheeks are drawn in, and her eyes are half closed. The second image shows the expression I mean. Use it for the expression only: do not copy that woman's face, hair, clothes or the look of that picture. Do not make her younger, smoother or prettier. Photorealistic, the same quality as the original photo.
```

Holding it (attach the kitchen photo only):

```text
Edit this photo. Keep this woman exactly as she is: the same face, age, skin, eyes, nose, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: she is holding her breath, lips pressed tightly shut, cheeks puffed out as round as they will go, eyes squeezed shut, face flushed red with the strain. Do not make her younger, smoother or prettier. Photorealistic, the same quality as the original photo.
```

The head is kept facing the camera on purpose (a head thrown back is where
the likeness goes first); the game tips it. For the tape's big hair, do that
first, as one edit of the kitchen photo ("give her big, teased, feathered
blonde 1990s hair to her shoulders; change nothing about her face"), check it
is still her, and use the result as the first image for all three faces, so
the hair matches from one face to the next.

### WT2. The bodies

The heads are cut off and replaced, so the faces do not matter here; what
matters is a clear neck and shoulders and the whole body in frame. Two sheets
for Mom, then the same two for Bill.

Mom, standing (attach nothing):

```text
Three full-length photographs of the same woman side by side with wide clear gaps between them, on one plain flat light-grey studio background. She is the instructor in a 1990s home workout video: shiny pink high-cut leotard with white trim, white slouch socks and white trainers, blonde hair tied up in a tight bun so her neck and shoulders are clear. She faces the camera in all three. Left: bent forward at the waist with a hand on each knee, back flat, head up, looking at the camera. Middle: a deep side lunge, one knee bent and the other leg straight out to the side, hands on her hips. Right: standing tall with both arms stretched straight up overhead. Her whole body is in frame from head to feet in every one, her feet on the same floor line. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

Mom, on the floor (attach the sheet just made):

```text
The same woman in the same leotard, on the same background in the same light: three more full-length photographs side by side with wide clear gaps between them. Left: a deep squat facing the camera, knees pushed wide apart by her elbows, palms pressed together in front of her chest. Middle: sitting on the floor in a twist, one leg stretched straight out, the other knee bent up and crossed over it, pulling that knee across with the opposite arm, shoulders turned, head toward the camera. Right: on her hands and knees seen from the side, one leg kicked straight out behind her, level with her back, head turned to the camera. Her whole body is in frame in every one. No text, no borders. Wide 16:9 image.
```

Bill, twice (attach one of Mom's sheets each time):

```text
The same three poses in the same order, with the same framing, background and light, but the person is a slim man of about seventy in a royal-blue high-cut leotard, with bare hairy legs, white slouch socks and white trainers, short grey hair, neck and shoulders clear. He is taking it completely seriously. His whole body is in frame in every one. No text, no borders. Wide 16:9 image.
```

For a pose straight off the tape, attach the screenshot and ask for one
figure: "a full-length photograph of the same woman in exactly the pose of
the attached screenshot", then the same again for Bill.

### WT3. The room on the tape (what the television shows)

```text
An empty living room from a 1990s home workout video, photographed straight on at standing height: cream walls, a white fireplace mantel with a brass fire screen on the right, a dark framed tapestry on the wall on the left, white curtains at the left edge, a tall vase of dried pampas grass, pale grey carpet filling the bottom third of the picture. Nobody in it, and nothing in the middle of the floor. Flat, slightly washed-out video lighting. No text. 4:3 image.
```

### WT4. The television

```text
A 1990s wood-cabinet television set with a video recorder sitting underneath it, photographed exactly straight on, with no angle and no perspective, against a plain flat light-grey background. The whole screen is one flat, even, bright green with no reflections and no glare, as if for a green-screen effect. Knobs and a speaker grille to the right of the screen. Soft even light. No brand names, no text.
```

### WT5. The den (the room Bill is in)

```text
An empty 1990s family den photographed straight on at standing height: a wood-panelled wall and wall-to-wall beige shag carpet, the line where the wall meets the carpet exactly three quarters of the way down the picture. Nobody in it and no furniture. Warm evening lamp light. No text. Wide 16:9 image.
```

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
