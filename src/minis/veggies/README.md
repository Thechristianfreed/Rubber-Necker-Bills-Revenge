# EAT YOUR VEGETABLES

Branson will not eat his vegetables, so his mother pinches his nose and his
father crams them in: a carrot, an ear of corn, and a head of broccoli as big
as his own. Its short name is `veggies`. It is set at Le Papillon, the fancy
restaurant, like the ordering (`papillon`) and the anniversary (`favorite`).

## The story

In the owner's words:

> Get Branson to eat his vegetables. Branson notoriously would only ever eat
> buttered noodles growing up. so getting him to eat vegetables was
> difficult. I want the game to be Bill and Stephanie have to CRAM
> vegetables down Branson's throat to win. I want it to look super goofy. my
> inspiration is the Pepe Wrap scene from Dexters Lab. I want them to
> absolutely have to CRAM those veggies down his throat. I dont have specific
> gameplay ideas on how to convey this, currently I just have animation
> ideas in my head

He sent three frames of that scene to show what he meant. They are Cartoon
Network's, so they are described here and not kept: a big man holding up a
wrap as big as Dexter's head; the wrap rammed into Dexter's face, his lips
stretched right round the end of it; and Dexter's mouth gaping enormous as it
comes at him. What the game takes from them: the thing is as big as his head,
it comes at him from the left, and his mouth stretches as far as it has to.

How it is played was left to Claude, and is below: the owner has not seen it
yet, and any of it is his to change.

## How it plays

Eighteen seconds on the clock, three vegetables to get down. One finger,
anywhere on the page. Each vegetable is two things to do:

1. **Wait for it.** His mouth is shut tight and he is shaking his head. His
   mother has him by the nose; he goes redder and redder (and squeaks), and
   after about a second he cannot hold his breath any longer: his mouth drops
   open, with a "!" over his head and "NOW!" on the tablecloth. A tap while
   it is open and his father jams the vegetable in. A tap too soon bounces it
   off his teeth ("NOPE!", and no taps are taken for a moment). No tap in
   time and it shuts again ("TOO SLOW!"), and she takes hold of his nose
   again.
2. **Cram.** Every tap is a shove: his father's fists turn about, his mother
   has the top of his head by the hair and pumps it, and the vegetable goes
   in another notch. Stop, and he works it back out. All the way in, his
   mouth snaps shut and it goes down his neck: GULP.

The carrot takes five shoves, the corn seven and the broccoli nine, and his
mouth is open for a little less time before each (0.85, 0.75 and 0.7
seconds).

**Won** when the third one goes down: he is dazed, "CLEAN PLATE!", his
parents laugh, and he burps up a leaf.

**Lost** if the waiter gets there first. He sets out with 4.3 seconds on the
clock, carrying a bowl, and is at the table with 1.7 to go. Whatever is in
Branson's mouth comes out again the way it went in (PTOOEY, at his father),
and he gets what he always gets: "BUTTERED NOODLES. AGAIN."

The two bots: the careful one taps 0.16 seconds after his mouth opens and
shoves eight times a second, and the third one is down with nearly eight
seconds left. The careless one pokes at his shut mouth, lets the first
chance at each vegetable go by, and shoves hardly more than once a second:
the waiter arrives while the corn is half way in. Played by real clicks at a
person's speed (0.3 seconds to notice, six shoves a second) the last one
goes down four and a half seconds before the waiter gets there, and with
slower hands (0.42 seconds, four a second) three seconds before: room for a
mistake or two.

What can be tuned is at the top of `VeggiesMini.ts` (the clock, how soon
the waiter comes, how fast he works a vegetable back out) and in `VEG` in
`art.ts` (for each vegetable: how long, how thick, how many shoves, how long
he holds his breath, how long his mouth is open).

## How his mouth is done

Cut-out animation, as in a scrapbook that moves. His head is one of his own
faces (from everybody's set, `docs/characters.md`) drawn twice and cut along
the line of his mouth into the top of his head and his jaw (`Head` in
`VeggiesMini.ts`). Both are hinged where his jaw would be, under his ear, so
the top tips back and the jaw drops, and his mouth opens to the left, at his
father, as wide as the vegetable is thick. The dark inside, his teeth, his
tongue and the vegetable are behind both pieces: whatever is in his mouth is
hidden by his face wherever it is not in the gap, and what has gone past his
throat is not drawn at all.

- The faces are seen close up (200 from hair to chin, where a head in a set
  is 80), so each look that is used is made again at that size, from the
  same file, as `veggies_branson_<look>` (`PIECES` in `index.ts`). There is
  a paper head behind each, the same size and hung from the same chin, which
  shows if the photo is missing.
- Where each look is cut is `CUT` in `art.ts`: how far down the picture the
  line between his lips is. They were read off the photos with a grid ruled
  over them. **A look that is made again, or a new one, needs its line read
  again.**
- The looks used: `angry` (shut tight), `worried` (running out of breath),
  `shocked` (the gasp, and the moment it goes in), `cry` (while it is
  crammed), `dazed` (the gulp), `disgusted` (afterwards), `smug` (when they
  miss) and `smile` (the noodles).

## Pictures

Everything of this game's own is cut from paper so far (`art.ts`). The
restaurant, the table, the waiter, his tray and his parents' seats are the
ordering game's (`papillon_...`), used as they are; their prompts are in that
game's README. Bill's and Stephanie's heads, and Branson's, are from
everybody's set.

To be generated (Nano Banana, one prompt to a message, the full-size picture
sent back with its number: `docs/art-prompts.md` has how). Each is a clean
photo on a plain background: the game adds the white edge and the shadow.
When they come back they go in `art-src/games/veggies/`, with Adobe's
cutouts, and `cut.py` cuts them into `assets/`.

### VG1. Branson's body

A small boy's body with a grown man's head on it: that is the joke, as with
the brothers in the back yard. His arms are pieces of their own (VG2), so
that they can flail, and so are out of sight here. The head comes off.

```text
A photograph of a small boy, about six years old, sitting up straight at a dinner table and facing the camera, on a plain flat light-grey studio background. He is seen from the waist up; there is no table in the picture. He wears a white long-sleeved shirt and a brown waistcoat, and a large white cloth napkin is tucked into his collar and hangs down over his chest like a bib. Both his arms are held straight back behind him, so that only his shoulders show and no arm or hand is in front of his body. He has short hair. Nothing covers his head or his neck. Soft even light, no shadows on the background. No text, no borders. Tall 3:4 image.
```

### VG2. His arm

One arm: the game turns it round for the other.

```text
A photograph of a small boy's arm, about six years old, in a white long shirt sleeve, on a plain flat light-grey studio background. The arm is stretched straight out level towards the right of the picture, the hand in a small tight fist, seen from the side. The arm ends at the shoulder, cut off square, with nothing else of the boy in the picture. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### VG3. The vegetables

Each lies level, with the end that goes in first pointing to the right.

```text
Four things photographed from the side on one plain flat light-grey studio background, in a row with wide clear gaps between them. First: a large fresh carrot with its bushy green top still on, lying level, its pointed tip towards the right of the picture and its green top to the left. Second: an ear of yellow corn on the cob, lying level, its tip towards the right, its green husk peeled back and bunched at the left end. Third: a very big whole head of broccoli lying on its side, its thick pale stalk pointing to the right and its dark green crown to the left. Fourth, much smaller: one single loose green leaf. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### VG4. Bill's arm

It stretches as far as it has to in the game, so the fist is cut off it and
kept its own size, and only the sleeve is stretched.

```text
A photograph of a man's right arm in the sleeve of a black dinner jacket, a white shirt cuff showing at the wrist, on a plain flat light-grey studio background. The arm is stretched straight out level towards the right of the picture, the hand a tight fist with the knuckles to the right, as if pushing hard against something, seen from the side. The arm ends at the shoulder, cut off square, with nothing else of the man in the picture. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### VG5. Stephanie's arm and hands

Her arm has an elbow in the game: an upper arm and a forearm, each of which
stretches, and a hand that is one of two.

```text
Three photographs of the same woman's bare right arm and hand, side by side with wide clear gaps between them, on one plain flat light-grey studio background. First: the whole arm stretched straight out level towards the left of the picture, from a short royal-blue sleeve at the shoulder to the wrist, the hand open and relaxed, seen from the side; it ends at the shoulder, cut off square. Second: just her hand and wrist, the first finger and thumb pinched tightly together and pointing towards the left of the picture, the other fingers curled, as if pinching somebody's nose shut. Third: just her hand and wrist, the hand held up flat with the fingers together and pointing up, the palm towards the camera, as if pressing down on something. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### VG6. The buttered noodles

```text
A photograph of a white china bowl with a blue rim, heaped high with plain buttered egg noodles, a square pat of yellow butter melting on top, on a plain flat light-grey studio background. Seen from the side and a little from above, so that the heap of noodles shows over the rim. Nothing else in the picture. Soft even light, no shadows on the background. No text, no borders.
```

### VG7. Inside his mouth (if wanted)

His teeth and tongue are small and cut from paper, and may as well stay
that way. If a photo is wanted, false teeth are the joke:

```text
Three things photographed from the front on one plain flat light-grey studio background, in a row with wide clear gaps between them. First: the upper half of a set of novelty false teeth, a row of big white upper front teeth in a strip of pink gum, the teeth pointing down. Second: the lower half of the same set, a row of big white lower front teeth in pink gum, the teeth pointing up. Third: a pink rubber joke tongue lying flat, its tip towards the left of the picture. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### VG8. A face of his own: stuffed (if wanted)

Not one of the fifteen: a look for this story, as Shane's doe eyes are for
the sandbox. It would be the moment his mouth shuts on a vegetable (he is
`dazed` there now). An edit of his own photo, `art-src/photos/branson-1.jpg`,
like the rest of his set, so that it matches them:

```text
Edit this photo. Keep the man, his hair, his beard, the lighting, the framing and the background exactly the same. Change only his expression: his cheeks puffed out as full as they will go, as if his mouth is crammed with far too much food, his lips pressed shut round it, his eyes wide and watering. Keep his head upright and facing the camera.
```

It goes through Adobe and `tools/make_cast.py` like any face (`cutting.md`,
"For everybody's faces"), as a look of Branson's own called `stuffed`, and
then gets a line in `CUT`.

## Sound

Its own, made in `sounds.ts` out of `sound.tone()` and `sound.noise()`. How
loud each came out, by `tools/test/listen.cjs` at the master (the mouth
"bonk" beside them read 0.177):

| | What it is | Loudest 46 ms |
| --- | --- | --- |
| `squelch()` | a shove: something wet, squashed (two pitches, turn about) | 0.177 |
| `gasp()` | his mouth drops open | 0.146 |
| `gulp()` | it goes down: "gl-oop" | 0.166 |
| `plop()` | ...and lands | 0.164 |
| `burp()` | a little of it comes back | 0.171 |
| `strain(k)` | the squeak as he goes red, five times a second, climbing | 0.106 (on purpose: it is under everything else) |
| `clack()` | his teeth, shut again | 0.152 |
| `ptooey()` | out it comes | 0.170 |

They can be played one at a time on the page: `window.__veggies.gulp()`.

And the game's usual ones, as they are: the whoosh when it is jammed in, the
splat when it lands, the bonk off his teeth (and off his father, at the
end), the fanfare for a clean plate, and the trombone for the noodles.

Nobody has heard any of it: whether each is the right noise is for the owner
to say, in the preview.
