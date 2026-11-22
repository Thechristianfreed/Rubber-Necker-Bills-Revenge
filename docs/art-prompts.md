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
G (palm, billboard, road sign, cone), J (Bill's shirt), K (his arm and the
bat), L (guardrail), M (gold star, cotton puff, paper burst), N (hit words),
O (phone-filming arm). Their prompts are in the git history of this file.

The interface, lettering and road paint are cut from paper sheets built from
these images. The tarmac is a public-domain photo texture (`art-src/library`).

## Still to make

### S. Bill's body, in three poses

Bill is currently a shirt with one straight arm-and-bat piece pinned to the
shoulder, which does not look like a real arm. These three poses replace the
whole body and get swapped like stop-motion frames. Attach the shirt image
(J) to the prompt as a reference if the app allows it. The man's head will be
cut off and replaced with Bill's photo, so it does not matter what he looks like.

```text
Three photographs of the same man side by side with clear gaps between them, on a plain flat light-grey background. He is a slightly stocky older man with tanned arms and short grey hair, wearing a coral-red short-sleeved aloha shirt with a darker red Polynesian tapa-pattern print. Each photograph shows him from the waist up in three-quarter view, facing toward the right side of the picture, holding a wooden baseball bat in his right hand only (the arm nearest the camera). His left arm hangs relaxed at his side in all three.
Left: at rest, with the bat resting on his right shoulder.
Middle: winding up, his right arm raised with the elbow bent and the bat cocked back behind his head, about to swing.
Right: the end of a hard one-handed swing, his right arm stretched out in front of him at head height and the bat pointing forward toward the right edge of the picture.
Natural proportions and a natural grip. The same man, the same shirt, the same size and the same framing in all three, with the whole bat in frame each time. Soft even daylight. No shadows, no text, no borders. Wide 16:9 image.
```

### P. Bluebirds (optional)

Whacked heads have gold stars circling them. This adds little blue birds as a
second kind of dizzy.

```text
Two photographs of the same small bluebird in flight, side by side with a clear gap, on a plain flat light-grey background. Both are seen exactly from the side, flying toward the left. Left: wings raised high above its back. Right: wings swept down below its body. Bright blue back and wings, rusty orange chest. Sharp, natural daylight. Whole bird in frame. No branch, no shadows, no text, no borders. Wide 16:9 image.
```

### Later

- The other five weapons (newspaper, flyswatter, tennis racquet, nail board,
  kayak oar), in the same three poses as image S, when the shop is built.
- A photo of Lady for the dog.
