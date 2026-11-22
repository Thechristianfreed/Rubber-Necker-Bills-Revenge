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
mailboxes. In the game: T1 to T4 (the boy on the bike: riding, winding up,
throwing, ducking; the flying newspaper is cut from T3), V (the mailman),
W (the tree), X (the houses) and Y (the picket fence). The pavement is the
public-domain tarmac photo, bleached to concrete.

Still to come, replacing the last cut-paper stand-ins:

### U. Mailboxes on posts

```text
Four separate photographs in a row with clear gaps between them, on a plain flat light-grey background. Each is a classic American curbside mailbox mounted on a short square wooden post, seen in exact side view with its door end on the left. The whole post is in frame down to its base.
1. A galvanized silver mailbox, door shut, red flag down.
2. The same silver mailbox with its door open and a rolled-up newspaper sticking out of it, red flag up.
3. A red painted mailbox, door shut, yellow flag down.
4. The same red mailbox with its door open and a rolled-up newspaper sticking out of it, yellow flag up.
All four the same size, with identical posts. Soft even daylight, slightly faded 1950s Kodachrome colour. No text or numbers on the mailboxes, no ground, no shadows, no borders. Wide 16:9 image.
```

### T3b. Throwing, hand empty

In the throwing frame Bill is still holding a paper while another one flies.
Send this as an edit of T3 for a cleaner release.

```text
Edit this image. Keep the bicycle, the boy, his clothes, his pose, the framing, the lighting and the background exactly the same. Remove the rolled-up newspaper from his outstretched right hand: the hand is now open and empty, fingers spread, as if he has just let go of it.
```

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
