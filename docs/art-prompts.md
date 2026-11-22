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

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
