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
the bully's tennis racquet. The level is playable with cut-paper stand-ins
(`src/art/hallway.ts`). These photos replace them.

### SJ1. The hallway

One picture is the whole backdrop: the wall of lockers, the open locker and
the floor.

```text
A photograph of an empty hallway in a 1960s American high school, looking straight at one wall. A long unbroken bank of tall single-door steel lockers, painted pale blue, runs across the whole width of the picture, seen exactly face-on with no perspective slant. The tops of the lockers are near the top edge of the picture and their feet are a little below the middle. Below them the floor fills the rest of the picture and runs toward the camera: checkered linoleum tiles in cream and tan, receding in straight one-point perspective toward the middle of the picture. The camera is at shoulder height, pointing very slightly down. Every locker is closed except one: the locker three places to the right of the middle of the picture is wide open, its door swung round toward the camera on its right-hand side, and inside it is dark, with a shelf of schoolbooks, a jacket on a hook and a can of tennis balls. No people. Soft even indoor light, slightly faded 1960s Kodachrome colour. No text, no signs, no borders. Very wide 21:9 image.
```

### SJ2. Bill from behind, with the racquet (three images, made as a chain)

Make SJ2a first. Then, in the same Gemini chat, send SJ2b and SJ2c one at a
time as edits of SJ2a, so the boy, the shirt and the framing stay identical
and only his racquet arm changes. His head gets replaced, so his hair does
not matter.

SJ2a, ready:

```text
A photograph of a teenage boy about sixteen seen from directly behind, from the hips up, standing with his back squarely to the camera. He wears a mustard-yellow short-sleeved T-shirt with two brown stripes across the back. His left arm hangs relaxed at his side. His right arm is bent and held out to his right side, holding a 1960s wooden tennis racquet in his right hand in a ready position: the racquet upright, its head above his hand and tilted slightly outward to the right, the strings facing the camera. The whole racquet and both arms are in frame, with empty margin on every side. Soft even indoor light, slightly faded 1960s Kodachrome colour. Plain flat light-grey background: no floor, no shadow, no text, no border. Wide 16:9 image.
```

SJ2b, winding up (send as an edit of SJ2a):

```text
Edit this image. Keep the boy, his shirt, his left arm, the framing, the lighting and the background exactly the same. Change only his right arm: it is now drawn back low and wide out to his right side, the racquet pointing out toward the right edge of the picture and slightly down, wound up for a forehand. The whole racquet stays in frame.
```

SJ2c, hitting (send as an edit of SJ2a):

```text
Edit this image. Keep the boy, his shirt, his left arm, the framing, the lighting and the background exactly the same. Change only his right arm: it is now reaching forward and up in front of his right shoulder, the racquet held upright with its head above his hand at about the height of his own head, the strings facing the camera, at the moment of hitting a ball that is coming straight at him. The whole racquet stays in frame.
```

### SJ3. The back of Bill's head

Bill mostly has his back to the camera in this level and only turns round to
grin or glare. The best version of this is real: a photo of the back of his
head, taken from straight behind at head height, against a plain wall.

To generate it instead, attach one of his photos:

```text
The back of this man's head, photographed from directly behind at head height: his silver-grey hair, both ears just visible at the sides, and the back of his neck down to the collar line. No face visible. Plain flat light-grey background, soft even light. No shoulders, no clothing, no text, no borders. Square image.
```

### SJ4. What comes out of the locker

```text
Three photographs side by side with clear gaps between them, all on one plain flat light-grey background. Left: a 1960s glass jar of creamy peanut butter with a red screw-on metal lid and a red, white and blue paper label reading SKIPPY, standing upright, seen straight on. Middle: a chocolate milkshake in a white paper diner cup with red stripes, a dome of chocolate shake over the brim with some of it running down the side, and a red-and-white striped paper straw, seen straight on. Right: a worn green cloth-bound 1960s school textbook, closed, seen from the front, with HISTORY in gold lettering on the cover and something brown squashed between its pages and oozing out along the page edge. Sharp, soft even light, slightly faded 1960s Kodachrome colour. No shadows, no other text, no borders. Wide 16:9 image.
```

### SJ5. Splats

```text
Four separate splats of thick chocolate milkshake, photographed from directly above, arranged in a row with clear gaps between them, all on one plain flat pale-blue background. Each is a different shape: a fat central blob with rounded lobes, gobs flung out around it, and a few flecks. Glossy and wet. Two are milk-chocolate brown and two are a darker brown. Soft even light, no shadows, no text, no borders. Wide 16:9 image.
```

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
