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

All of these have been made and are in the game, cut out by `mom()`,
`workout_bodies()` and `workout_set()` in `tools/make_cutouts.py`: Stephanie's
four faces (WT1), her six bodies and Bill's (WT2), the room on the tape
(WT3), the television (WT4), the den (WT5) and Bill's three faces for the
breathing (WT6). The prompts are kept here for
making more poses or doing any of it again.

### WT1. Stephanie's faces

What goes wrong: asked for several new photographs of "this woman", the
generator invents a new woman. It keeps a likeness when it *edits one photo*
and changes one thing. So: one face per image, always starting from the
photo of her smiling (`art-src/generated/WT1d-mom-smile.webp`), in a fresh chat each time, with the biggest copy of the photo
there is. The tape frame goes in as a second image, for the expression only.
If it starts copying the tape lady, leave her frame out and let the words do
it. If the first try is not her, ask again rather than correcting it.

The "PAH" (attach the smiling photo, then the tape frame of the "PAH"):

```text
Edit the first image. It is a photo of the woman I want. Keep her exactly as she is: the same face, age, skin, eyes, nose, teeth, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: her mouth is thrown wide open in a big round shout, jaw dropped as far as it will go, top teeth showing, eyes rolled up toward the ceiling, eyebrows raised. The second image shows the expression I mean. Use it for the expression only: do not copy that woman's face, hair, clothes or the look of that picture. Do not make her younger, smoother or prettier. Photorealistic, the same quality as the original photo.
```

The breath in (attach the smiling photo, then the tape frame of the breath in):

```text
Edit the first image. It is a photo of the woman I want. Keep her exactly as she is: the same face, age, skin, eyes, nose, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: her lips are pushed forward and squeezed into a tight pucker, as if sucking air in through a straw, her cheeks are drawn in, and her eyes are half closed. The second image shows the expression I mean. Use it for the expression only: do not copy that woman's face, hair, clothes or the look of that picture. Do not make her younger, smoother or prettier. Photorealistic, the same quality as the original photo.
```

Holding it (attach the smiling photo only):

```text
Edit this photo. Keep this woman exactly as she is: the same face, age, skin, eyes, nose, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: she is holding her breath, lips pressed tightly shut, cheeks puffed out as round as they will go, eyes squeezed shut, face flushed red with the strain. Do not make her younger, smoother or prettier. Photorealistic, the same quality as the original photo.
```

The head is kept facing the camera on purpose (a head thrown back is where
the likeness goes first); the game tips it. For the tape's big hair, do that
first, as one edit of the smiling photo ("give her big, teased, feathered
blonde 1990s hair to her shoulders; change nothing about her face"), check it
is still her, and use the result as the first image for all three faces, so
the hair matches from one face to the next.

### WT6. Bill's faces

Made the same way, from a photo of Bill: the breath in, holding it and the
"PAH" (`bill_faces()` in the tool; `art-src/generated/WT6a` to `WT6c`). The
same three prompts as Stephanie's do it, with his photo as the first image.
The rest of the time he wears one of his everyday heads, which are from
other photos and have no beard; the photo these three were made from, as it
was before any editing, would give him a matching face for in between.

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

## Home Movies: After school (the fight)

Made and in the game, cut out by `fight()` in `tools/make_cutouts.py`:
Stephanie's seven bodies in her cheer outfit (AS1), the other girl before and
after (AS2), the gym, the bleachers, bake sale and hoop (AS3), and the other
girl's arm at four heights (AS4), which follows Stephanie round when she is
swung. Not made, and only worth making if the opening shove should be a
punch: the other girl, before she changes, throwing one (it is her pointing
pose, lunging, for now). The first sheet of AS1 arrived at half
size (512 pixels wide), so those four bodies are a little soft; a full-size
copy would fix that. Stephanie's head is the four faces made for the workout;
the people in her pictures lose theirs to it. The other girl is as the family
described her, and keeps her own head.

### AS1. Stephanie, in her cheer outfit (two sheets)

The uniform is red and white here: change it to the school's real colours.

```text
Four full-length photographs of the same teenage cheerleader side by side with wide clear gaps between them, on one plain flat light-grey studio background. A late-1970s high school cheer uniform: red sleeveless top with white trim, short red pleated skirt with a white stripe, white ankle socks and white trainers, a red-and-white pom-pom in each hand, hair tied up in a tight bun so her neck and shoulders are clear. Her body is turned towards the right of the picture in all four. First: a fighting stance, feet apart, both pom-poms held up like fists. Second: both arms thrust straight out in front of her, pom-poms shaking. Third: a high kick, one leg kicked up above her waist towards the right, both arms up. Fourth: lunging forward, punching with one pom-pom. Her whole body is in frame from head to feet in every one. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

Then, with that sheet attached:

```text
The same cheerleader in the same uniform, on the same background in the same light: three more full-length photographs side by side with wide clear gaps between them. First: standing with her knees together and her hands clasped in front of her chest, pleading. Second: in mid-air, flung backwards, arms and legs thrown out wide like a starfish, pom-poms flying. Third: lying flat on her back on the floor, seen from the side, arms and legs sprawled, out cold. Her whole body is in frame in every one. No text, no borders. Wide 16:9 image.
```

### AS2. The other girl (two sheets)

```text
Four full-length photographs of the same teenage girl side by side with wide clear gaps between them, on one plain flat light-grey studio background. She is a heavyset Black girl of about seventeen with long dark wavy hair worn down over one shoulder, in a loose brown V-neck top over a brown camisole, dark jeans and trainers, a thin silver chain and heart-shaped earrings. Her body is turned towards the left of the picture in all four, and she is furious with somebody. First: stomping forward mid-stride, fists clenched. Second: standing with one hand on her hip, pointing straight at somebody with the other. Third: leaning back a little, annoyed, as if something small had just bounced off her. Fourth: feet wide apart, fists clenched at her sides, head thrown back, roaring. Her whole body is in frame from head to feet in every one. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

Then, with that sheet attached, what she turns into:

```text
The same girl, transformed: now she has the enormous muscles of a champion bodybuilder, her hair is tied up in a puff on top of her head, and she wears a black ribbed tank top, black sweatpants and a black sports watch. Three full-length photographs side by side with wide clear gaps between them, on the same plain flat light-grey background, her body turned towards the left of the picture. First: standing with her hands on her hips, looking down at somebody, quite calm. Second: one arm stretched out in front of her, flicking something away with one finger. Third: arms folded, the faintest smile. Her whole body is in frame from head to feet in every one. No text, no borders. Wide 16:9 image.
```

### AS3. The gym, and what gets broken in it

```text
An empty American high school gymnasium of the late 1970s, photographed straight on from the middle of the court: a painted cream cinder-block wall with one blue stripe along it, and a polished wooden floor filling the bottom quarter of the picture. No bleachers, no hoops, no people, nothing against the wall. Flat even light. No text. Wide 16:9 image.
```

```text
Three things photographed straight on, side by side with wide clear gaps between them, on one plain flat light-grey background. First: a section of wooden gymnasium bleachers, five rows, pulled out. Second: a folding table with a white paper cloth and a hand-lettered card reading BAKE SALE, covered in cupcakes. Third: a school basketball backboard with its hoop and net. Soft even light, no shadows on the background. Wide 16:9 image.
```

### AS4. The other girl's arm, for the swing

She swings Stephanie by the ankle from the floor on one side, up over her
head, and down on the other. These four photos are her arm on the way: the
game shows whichever has it pointing most nearly the way Stephanie is flying
from her fist, and mirrors them for the other side, so there are seven
positions in a swing. Stephanie's ankle is on the fist in each. The sheet is
`art-src/generated/AS5-rival-arms.webp`, its cutout
`art-src/adobe/AS5-rival-arms-cutout.png`, and `fight()` makes `arm0` to
`arm3` from it, low to high. How far above level the arm is in each is
written in `ARMS` at the top of `src/minis/FightMini.ts`: measure again if
the sheet is ever replaced.

Attach the sheet of her transformed:

```text
The same woman exactly: the same face, the same hair tied up on top of her head, the same enormous muscles, black ribbed tank top, black sweatpants, grey trainers and black watch, on the same plain flat light-grey background in the same light. Four full-length photographs of her side by side with wide clear gaps between them. In all four she stands square to the camera with her feet apart, scowling, with the hand on the right-hand side of the picture resting on her hip. Only her other arm moves, and its hand is a tight fist, as if gripping the end of something. First: that arm stretched down and out towards the left of the picture, the fist at about the height of her knee and well out from her body, as if she has just brought something down hard on the floor beside her. Second: stretched straight out towards the left of the picture, level with her shoulder. Third: stretched up and out towards the left, halfway between level and straight up. Fourth: stretched straight up above her head. Her whole body is in frame from head to feet in every one, with clear space above the raised fist. No text, no borders. Wide 16:9 image.
```

## Home Movies: Payback (Chad and the bat)

Made and in the game:

- **The brothers' heads**, from the family's photos of them as they are now.
  Chad has four (`art-src/photos/chad-1.jpg` to `chad-4.jpg`: scowling,
  smiling, grinning, laughing) and Shane three (`shane-1.jpg` to
  `shane-3.jpg`: beaming, wary and looking off to one side, smirking). They
  are cut out by `bat_faces()` in `tools/make_cutouts.py`, which hangs each
  from its chin; a new photo needs Adobe's cutout and head selection, and a
  line in `BAT_FACES` in the tool. Which photo does for which look in the
  game is the `KID_LOOKS` table in `src/art/bat.ts`. Nobody has a photo of
  Shane frightened or crying, so the wary one stands in for both: see "More
  looks for the faces" below.
- **Their bodies** (PB1 and PB2), cut out by `bat_bodies()`: each sheet
  needs Adobe's cutout, its selection of the heads (`-headmask.png`) and,
  for Chad, of the bats (`-batmask.png`). The poses on each sheet, in order,
  are in `BAT_SHEETS` in the tool.
- **The back yard** (PB3), made into two strips by `bat_yard()`.

Still cut from paper: the swing set, pool, clothesline, bush and tree (PB4),
and the back of the house and their mother's body (PB5).

Two things about the first body sheets, both put right by PB1c and PB2c
when those are in. The two running photos of each boy came out as the same
stride, so the run is a bob and not a step. And in Chad's swing the bat ran
off the edge of its panel: `lengthen_bat()` finishes it with the end of the
bat from another pose (`BAT_CUT_SHORT` in the tool says which).

The bodies are five-year-olds and the heads are grown men: that is the
joke, as with Bill on his bicycle. The heads come off these pictures.

The year and the clothes here are guesses (about 1990): change them to
what the boys really wore.

### PB1. Chad's body (two sheets)

Every pose faces right (the game turns them round), and nothing may cover
the head or neck, since the head comes off. The bat is in the picture
wherever he has it: the game's own paper bat is only for the stand-ins.
Attach the first sheet when making the second, so it is the same boy.

```text
Four full-length photographs of the same small boy, about five years old, side by side with wide clear gaps between them, on one plain flat light-grey studio background. He wears a light blue T-shirt, navy shorts, white socks and white trainers, in the style of about 1990, and has short hair. His body is turned three-quarters towards the right of the picture in all four. First: standing still, arms hanging at his sides, shoulders slumped. Second: stumbling backwards off balance, both arms thrown up and out, one foot off the ground, as if he has just been pushed in the chest. Third: standing with his feet apart, holding a wooden baseball bat upright in both hands in front of his chest, like a batter waiting. Fourth: standing up straight with both hands behind his back, holding the bat hidden behind him, its end sticking up behind one shoulder. His whole body is in frame from head to feet in every one, and nothing covers his head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

```text
The same small boy exactly, in the same clothes, on the same plain light-grey background in the same light: four more full-length photographs side by side with wide clear gaps between them, his body turned towards the right of the picture in all four. First: running flat out with a wooden baseball bat raised in both hands over his shoulder, left leg forward. Second: the same, right leg forward. Third: at the end of a swing, leaning forward with the bat stretched out in front of him in both hands at the height of his own head. Fourth: standing still with the bat hanging down from one hand, its end resting on the ground. His whole body and the whole bat are in frame in every one, and nothing covers his head or neck. No text, no borders. Wide 16:9 image.
```

### PB2. Shane's body (two sheets)

The same rules. His hands stay away from his head even when he has been
hit on it, or they would be left hanging in the air when the head comes off.

```text
Three full-length photographs of the same small boy, about five years old, side by side with wide clear gaps between them, on one plain flat light-grey studio background. He wears a red T-shirt, blue jeans and white trainers, in the style of about 1990, and has short hair. First: turned towards the right of the picture, leaning forward with both arms stretched straight out in front of him, palms forward, giving somebody a hard shove. Second: facing the camera with his hands on his hips, chest out, feet apart, pleased with himself. Third: facing the camera, standing stiff with his shoulders hunched up and his arms straight down at his sides, fists clenched, howling. His whole body is in frame from head to feet in every one, and nothing covers his head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

```text
The same small boy exactly, in the same clothes, on the same plain light-grey background in the same light: three more full-length photographs side by side with wide clear gaps between them, his body turned towards the right of the picture in all three. First: running away flat out, arms pumping, left leg forward. Second: the same, right leg forward. Third: jumping straight up in the air with his knees tucked up and both arms flung out wide, fingers spread, as if something has just hit him. His whole body is in frame in every one, and nothing covers his head or neck. No text, no borders. Wide 16:9 image.
```

### PB1c and PB2c. The running, again

Running as two different moments (legs wide apart; and legs together), and
the swing with the whole bat in the picture. Attach a sheet of the same boy.

```text
The same small boy exactly, in the same light blue T-shirt, navy shorts, white socks and white trainers, in the same light. Three full-length photographs of him side by side with wide clear gaps between them, all on one continuous plain light-grey background with no dividing lines or panels. Each is seen exactly from the side, facing the right of the picture. First: running at full stretch with a wooden baseball bat raised in both hands over his back shoulder, both feet off the ground, his front leg reaching far forward and his back leg stretched far out behind him, legs wide apart like open scissors. Second: the same run a moment later: standing on one straight leg directly under him with his other knee lifted high in front, legs close together, the bat still raised over his back shoulder. Third: at the end of a swing, leaning forward with the bat stretched straight out in front of him in both hands at the height of his own head. The whole bat is inside the picture in every one, with clear empty background beyond its end, and nothing covers his head or neck. No text, no borders. Wide 16:9 image.
```

```text
The same small boy exactly, in the same red T-shirt, blue jeans and white trainers, in the same light. Two full-length photographs of him side by side with a wide clear gap between them, on one continuous plain light-grey background with no dividing lines or panels. Each is seen exactly from the side, running away towards the right of the picture with his arms pumping. First: at full stretch, both feet off the ground, his front leg reaching far forward and his back leg stretched far out behind him, legs wide apart like open scissors. Second: the same run a moment later: standing on one straight leg directly under him with his other knee lifted high in front, legs close together. His whole body is in frame in both, and nothing covers his head or neck. No text, no borders. Wide 16:9 image.
```

### PB3. The back yard

It goes by sideways, so it is put beside its own mirror image as the gym
is: there should be nothing in it but fence, grass and sky.

```text
A photograph of an empty suburban back yard on a sunny summer afternoon about 1990, looking straight at the back fence. A white picket fence runs dead level across the whole width of the picture, seen exactly face-on with no perspective slant, its foot two thirds of the way down the picture. Below it, plain mown grass fills the bottom third. Above it, clear blue sky with a few small white clouds fills the top half. Nothing else in the yard: no trees, no toys, no house, nobody. Even light, no long shadows. No text. Very wide 21:9 image.
```

### PB4. What is in the yard

```text
Five things photographed straight on, side by side with wide clear gaps between them, on one plain flat light-grey background. First: a child's red metal swing set with one swing. Second: a small round blue plastic paddling pool with a yellow rubber duck in it. Third: a clothesline on two poles with a few shirts and a towel pegged to it. Fourth: a round garden bush with red berries. Fifth: a small leafy garden tree, the whole of it from the foot of its trunk to its top. Soft even light, no shadows on the background. Wide 16:9 image.
```

### PB5. The back door, and their mother

```text
Two things side by side with a wide clear gap between them, on one plain flat light-grey background. First: a section of the back wall of a suburban house about 1990, photographed exactly face-on and cut off square at both sides: cream siding, one window, and a back door standing wide open on a dark doorway, with one concrete step below it. Second: a full-length photograph of a mother of about thirty in the clothes of about 1990, a yellow blouse and high-waisted blue jeans, standing square to the camera with her hands on her hips, hair tied back so that her neck and shoulders are clear. Her whole body is in frame from head to feet. Soft even light, no shadows on the background. No text. Wide 16:9 image.
```

### More looks for the faces

The game asks for looks there is no photo of yet. Each is an edit of one
photo of him, one look at a time, as Stephanie's and Bill's were. For Chad,
use the grinning photo (`chad-3`):

```text
Edit this photo. Keep the man, his hair, his stubble, the lighting, the framing and the background exactly the same. Change only his expression: he is furious and yelling a battle cry, mouth wide open, eyebrows drawn hard down.
```

```text
Edit this photo. Keep the man, his hair, his stubble, the lighting, the framing and the background exactly the same. Change only his expression: he is hurt and about to cry, bottom lip stuck out, eyebrows up in the middle.
```

For Shane, use the beaming photo (`shane-1`):

```text
Edit this photo. Keep the man, his hair, his beard, the lighting, the framing and the background exactly the same. Change only his expression: he is terrified, eyes wide open, eyebrows up, mouth a small round O.
```

```text
Edit this photo. Keep the man, his hair, his beard, the lighting, the framing and the background exactly the same. Change only his expression: he is bawling like a small child, eyes screwed shut, mouth wide open and turned down, tears running down his cheeks.
```

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
