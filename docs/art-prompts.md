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
paper burst), N (hit words), O (phone-filming arm), S (Bill's body in three
poses: rest, wind-up, swing). Their prompts are in the git history of this file.

J (the shirt on its own) and K (the arm and bat on its own) were replaced by S
and are no longer used.

The interface, lettering and road paint are cut from paper sheets built from
these images. The tarmac is a public-domain photo texture (`art-src/library`).

## Still to make

### P. Bluebirds (optional)

Whacked heads have gold stars circling them. This adds little blue birds as a
second kind of dizzy.

```text
Two photographs of the same small bluebird in flight, side by side with a clear gap, on a plain flat light-grey background. Both are seen exactly from the side, flying toward the left. Left: wings raised high above its back. Right: wings swept down below its body. Bright blue back and wings, rusty orange chest. Sharp, natural daylight. Whole bird in frame. No branch, no shadows, no text, no borders. Wide 16:9 image.
```

### Later

- The other five weapons (newspaper, flyswatter, tennis racquet, nail board,
  kayak oar): each needs the same three poses as image S, with the same man
  and shirt holding that weapon instead of the bat. Attach image S as the
  reference so the man, shirt and framing match.
- A photo of Lady for the dog.
