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

## Still to make: level 1, Mailbox Baseball

Level 1 is playable with cut-paper stand-ins. These photos replace them.

### T. Young Bill on the Stingray (four images, made as a chain)

Make T1 first. Then, in the same Gemini chat, send T2, T3 and T4 one at a
time as edits of T1, so the bike, the boy and the framing stay identical and
only his pose changes. His head gets replaced with Bill's, so his face does
not matter.

T1, riding:

```text
A photograph of a boy about eleven years old riding a red 1960s Schwinn Sting-Ray bicycle with a white banana seat, a sissy bar and high-rise handlebars. Exact side view, the bike facing right, both wheels on the same straight baseline, the whole bike and the whole boy in frame with empty margin on every side. He wears a striped T-shirt, blue jeans and canvas sneakers. His left hand is on the handlebar. In his right hand (the arm nearest the camera) he holds a rolled-up newspaper resting on his right shoulder. He looks straight ahead. Soft even daylight, slightly faded 1960s Kodachrome colour. Plain flat light-grey background: no ground, no shadow, no text, no border. Wide 16:9 image.
```

T2, winding up (send as an edit of T1):

```text
Edit this image. Keep the bicycle, the boy, his clothes, the framing, the lighting and the background exactly the same. Change only his right arm: it is now raised with the elbow bent, the rolled-up newspaper cocked back behind his head, about to swing.
```

T3, swinging (send as an edit of T1):

```text
Edit this image. Keep the bicycle, the boy, his clothes, the framing, the lighting and the background exactly the same. Change only his right arm: it is now stretched straight out in front of him at head height, the rolled-up newspaper pointing forward toward the right edge of the picture, as if he has just swatted something beside him.
```

T4, ducking (send as an edit of T1):

```text
Edit this image. Keep the bicycle, his clothes, the framing, the lighting and the background exactly the same. The boy is now ducking: crouched as low as he can over the handlebars with his head down level with his hands, both hands on the handlebar grips, the rolled-up newspaper tucked under his right arm.
```

### U. Mailboxes

```text
Four separate photographs in a row with clear gaps between them, on a plain flat light-grey background. Each is a classic American curbside mailbox with NO post, seen in exact side view with its door end on the left.
1. A galvanized silver mailbox, door shut, red flag down.
2. The same silver mailbox after being whacked: door hanging open, red flag up, dented, with a few letters spilling out of the door.
3. A red painted mailbox, door shut, yellow flag down.
4. The same red mailbox after being whacked: door hanging open, flag up, dented, with a few letters spilling out of the door.
All four the same size. Soft even daylight, slightly faded 1960s Kodachrome colour. No text or numbers on the mailboxes, no shadows, no borders. Wide 16:9 image.
```

### V. The mailman (the one you must not hit)

```text
Two full-body photographs of the same 1960s American mailman side by side with a clear gap, on a plain flat light-grey background. He wears a blue-grey postal uniform and cap and carries a leather mail satchel on a shoulder strap. Each shows him from the top of his cap to his shoes, standing, turned toward the left.
Left: cheerful, holding a letter out in front of him.
Right: the same man furious, shaking his fist, his cap knocked crooked.
Same size and framing in both. Soft even daylight, slightly faded 1960s Kodachrome colour. No text, no shadows, no borders. Wide 16:9 image.
```

### W. The tree (duck under it)

```text
A photograph of a single leafy street tree, a sycamore or maple, seen straight on and complete from the base of its trunk to the top of its crown. It has a wide, heavy canopy that droops low, with the lowest leaves hanging to about a third of the way up the trunk. Summer foliage. Soft even daylight, slightly faded 1960s Kodachrome colour. Plain flat light-grey background: no ground, no shadow, no text, no border. Square image.
```

### X. The houses across the street

Swap in the town or kind of neighbourhood Bill actually grew up in.

```text
A vintage 1960s photograph of a row of modest American suburban houses seen straight on from across the street: single-storey houses in pastel colours with front lawns, driveways and a few shrubs, under a clear sky. The houses run evenly across the entire width so the left and right edges look alike. No cars, no people, no text, no border. Slightly faded Kodachrome colour. Very wide panoramic image, 21:9.
```

### Y. Picket fence

```text
A photograph of a long straight white wooden picket fence seen exactly side-on at fence height, so it is perfectly horizontal and runs off both the left and the right edges of the picture. Evenly spaced pointed pickets, at least twenty of them visible. Slightly weathered paint. Soft even daylight. Plain flat light-grey background: no grass, no ground, no shadows, no text. Very wide panoramic image, 21:9.
```

## Later

- The other weapons (flyswatter, tennis racquet, nail board, kayak oar): each
  needs the same three poses as image S, with the same man and shirt holding
  that weapon instead of the bat. Attach image S as the reference.
- A photo of Lady for the dog.
