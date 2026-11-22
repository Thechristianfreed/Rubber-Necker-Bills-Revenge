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
U (mailboxes on posts, waiting and delivered), V (the mailman), W (the tree),
X (the houses) and Y (the picket fence). The flying newspaper is cut from T3,
the first version of the throwing frame. The pavement is the public-domain
tarmac photo, bleached to concrete.

The thing to duck is a birdhouse sitting in the fork of the street tree (W).
The tree stands behind Bill; the birdhouse is drawn in front of him at head
height. The birdhouse is a cut-paper stand-in until image Z arrives.

### Z. The tree with a birdhouse in it

Send this as an edit of the tree image (W), so the tree stays exactly as it is.

```text
Edit this image. Keep the tree, the framing, the lighting and the plain background exactly the same. Add one small wooden birdhouse sitting in the fork of the tree, right where the trunk splits into its main branches, resting in the fork and facing the camera. The birdhouse has a red pitched roof, pale yellow walls, a round entrance hole and a small perch under the hole. Make it about one and a half times as wide as the trunk, in full view in front of the leaves, with nothing covering it.
```

If the tree image is no longer to hand, this makes the whole thing from scratch:

```text
A photograph of a single leafy street tree, a sycamore or maple, seen straight on and complete from the base of its trunk to the top of its crown, with a wide, heavy canopy. A small wooden birdhouse sits in the fork of the tree, right where the trunk splits into its main branches, facing the camera: red pitched roof, pale yellow walls, a round entrance hole and a small perch under the hole. The birdhouse is about one and a half times as wide as the trunk and in full view in front of the leaves, with nothing covering it. Summer foliage. Soft even daylight, slightly faded 1950s Kodachrome colour. One plain flat light-grey backdrop: no ground, no shadow, no text, no border. Square image.
```

Note for sheets of several objects: ask for one plain backdrop behind all of
them. Objects each sitting on their own card or panel have to be cut apart by
hand first, because background removal keeps the cards.

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
