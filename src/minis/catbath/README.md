# Bath time

Pappy, a houseful of stinking cats, and the kitchen sink. Its short name is
`catbath`.

## The story

In the owner's words (26 November 2026):

> pappy used to have to bathe the cat. The cats didn't like that. So the
> cats would freak out hissing and clawing pappy while he held them at the
> sink trying to bathe them. One time he decided to strangle one until it
> passed out, then he dunked it in the soapy kitchen sink water a bunch to
> bathe it, then left it on the counter to dry.
>
> pappy stands in the house entryway room and there are stinky cats all
> over the place. Pappy says "someone needs to bathe these damn cats".
> Pappy is now at the kitchen sink. The sink is full of bubbles, there is
> one of those dishwasher station sink sprayers and a washboard sits in the
> sink. Pappy grabs the cats one by one and the gameplay is pappy washing
> the cats one step at a time. First step is he has to strangle them
> (humorously like Homer Strangles Bart in the early Simpsons seasons) until
> the cat passes out. Then he dunks them in the water aggressively scraping
> the cat along the washboard suds flying everywhere. Then he must wring
> them out like a twisted towel. Then he hangs them from a clothesline, and
> kisses them after he hangs them on the line to dry. The last frame of the
> game is the cats all on the clothesline and "all CLEAN" sparkles and suds
> onto screen

The places: the entryway from "Pappy comes home", and one new one, the
kitchen sink.

**What is made up, and is the owner's to put right:** that there are three
cats (an orange tabby, a black one, a grey one with a white face); that the
clothesline is strung across the kitchen; everything Pappy says but the
first line ("WHY YOU LITTLE...!" for the first cat, "C'MERE, YOU." and
"YOUR TURN." for the others, and "THERE WE GO.", "NIGHTY NIGHT.", "THAT'S
BETTER." as each one goes limp; at the top of `CatbathMini.ts`); that the
cats all hiss at him in the front room; the rinse with the sprayer after the scrubbing (the owner put
the sprayer at the sink, and that is what it is for); the kitchen's
harvest-gold wallpaper and avocado fridge; the dish towel in Pappy's belt;
and that the cats come out of it dry, twice the size, every hair on end,
and glaring.

**By itself:** https://claude.ai/artifact/JHncMNQPcW4cKtwDDkNwFx (built with `node tools/make_preview.mjs <out>/catbath.html --only catbath`, and published from the same file each time, which keeps the address).

## How it plays

It is a story that waits for the player (`timed = false`): there is no
clock, and it always ends the same way.

**The front room** (the den, and the front door from inside, both as "Pappy
comes home" has them; Pappy standing is that game's photo, used as it is).
Three cats on the carpet, the smell coming off them in green, and flies.
Pappy, disgusted: "SOMEONE NEEDS TO BATHE THESE DAMN CATS." They hiss at
him.

**The kitchen sink,** seen across the sink at Pappy, the kitchen behind him
and a clothesline over his head. The sink is heaped with suds, a washboard
stands in it, and the sprayer is beside it. The cats wait their turn along
the counter, still stinking. For each, one at a time:

1. **Choke it out.** He gets it by the neck over the sink. **Tap fast**: each
   squeeze takes a piece off FIGHT LEFT, and it gets its fight back while he
   is not squeezing. While it still has fight in it, it gets its claws into
   him every second or so ("RRAWR!", "YEOWCH!", and a claw mark on his face
   that fades). At nothing: OUT COLD, X eyes, tongue out, stars.
2. **Dunk it and scrub it.** In it goes ("SPLOOSH!", suds everywhere), twice,
   and up against the washboard. **Drag up and down** (or press the space
   bar, once for each way): every time it goes back the other way after
   going far enough one way is a scrub ("SCRUB!", suds flying), off DIRT
   LEFT. Then the sprayer rinses it.
3. **Wring it out.** It comes out twisted like a towel, one end in each of
   his hands. **Go round and round it with a finger** (the space bar is half
   a turn): every quarter of a turn is a twist, and water runs out of it,
   off WATER LEFT.
4. **Hang it up, and kiss it.** **Tap**, and he takes it up to the line,
   pegs it on, and gives it a kiss ("MWAH!", hearts).

Each is a little quicker than the one before (he is getting the hang of it:
`DECAY`, `STROKES`, `TURNS`). When all three are up they dry, all at once:
twice the size, every hair on end, and glaring. ALL CLEAN, with sparkles and
suds coming down over everything.

The two bots: the careful one squeezes, scrubs and wrings fast; the careless
one is slow at all of it, so the cats get him more often.

Tuning, at the top of `CatbathMini.ts`: how much fight a cat has and how
fast it comes back (`DECAY`, `REGEN`), how often it claws (`CLAWS`), how many
scrubs and turns (`STROKES`, `TURNS`), and how far a finger has to go for a
scrub (`STROKE`). Where things are on the page is `layout.ts`.

## Pictures

**Every picture is a photo now**, but the few meant to stay paper. The owner
made CB1 to CB7 from the prompts below (26 November 2026, in his Drive folder
"Additional Home Movies Game Assets"), and `cut.py` cut them. They are kept
as they came in `art-src/games/catbath`, with Adobe's answers beside them.
What went to Adobe: each of the six of Pappy at the sink by itself, three
times the size (he is small on his sheet: `PEOPLE` in `cut.py`), for its
background and its head; the other sheets whole, for their backgrounds; and
CB3 once more, for the heap of suds, which the background removal had left
out (`-sudsmask.png`, "the heap of white soap suds"). CB1 and CB2 are places
and went nowhere.

Where a photo has taken a stand-in's place, its numbers are written by
`cut.py` into `cut.ts`: where each pose's chin goes, where his two fists are
(read off the pictures: `FISTS` in `cut.py`), where a cat is held between
them and which way the line through them runs, and where each cat hanging
from the scruff is held. The paper stand-ins are all still in `art.ts`: a
page that cannot fetch its pictures plays in paper.

| Prompt | What it is in the game |
| --- | --- |
| CB1 | `catbath_kitchen`: the whole of it, its own counter edge behind his |
| CB2 | `catbath_counter`: a strip (the picture and the picture turned round, so that it repeats with no seam) |
| CB3 | `catbath_board`, `catbath_sprayer`, `catbath_tap`, `catbath_suds` |
| CB4 | `catbath_pappy_stand`, `_grab`, `_choke`, `_scrub`, `_wring`, `_hang`, heads off, held by a spot under the chin; and his two fists in the four that hold a cat (`catbath_fist_choke_0` ...), cut out again to go in front of it |
| CB5 | `catbath_cat0_sit` to `catbath_cat2_sit` |
| CB6a, b, c | each cat's `_mad`, `_out`, `_wet` (held at the top of its head), `_soak` (the same picture, held by the middle, at the washboard), `_wrung` and `_dry` |
| CB7 | `catbath_peg` |

**What changes with the photos.** His hands in the scrubbing picture are at
his belt, which is the height of the counter: so at the washboard a cat is
held by its middle, its top half up out of the suds and the rest down in the
sink, and he goes up and down with it as it is scrubbed. The cat being wrung
lies along the line through his two fists, which are one above the other.
On the kiss he only stands up a little, or the foot of his picture (his
thighs) would show over the counter.

How they came: CB4 is six photos side by side, each with its own framing.
The fourth of each cat's five came lying limp on its side, not twisted like
a towel: it is held up by his two fists, and squeezed and turned over as he
twists. Another go at only that one would make it a twisted towel.

Still cut from paper, and meant to be: the clothesline, its hooks, the sink
basin, the claw marks, the smell, the flies, the bubbles and the drops, the
arrows that say what to do, and the words.

### The prompts

**CB1. The kitchen** (the new place)

```text
A wide photograph of a 1970s American kitchen, taken from where the kitchen sink is, looking back into the room at about the height of a man's chest. Harvest-gold wallpaper with a pattern of small brown and orange flowers. Dark wood cupboards along the top of the wall at the left and at the right. An avocado-green refrigerator on the right. In the middle of the back wall, an open doorway into a dark hall, with a round white clock on the wall above it. Nothing on the floor in front, and nobody in the picture. Soft daylight from behind the camera. No text. Very wide 21:9 image.
```

**CB2. The counter**

```text
A photograph of a run of 1970s kitchen counter seen exactly from the front, at the height of the counter top, so that the top is a thin strip and the cupboard doors below it fill most of the picture: an avocado-green laminate counter top with a steel edge, and below it dark wood cupboard doors with small brass handles, side by side all the way across. Nothing on the counter. Even light. No text. Very wide 21:9 image, the counter running from edge to edge.
```

**CB3. At the sink** (four on one sheet)

```text
Four things photographed side by side with wide clear gaps between them, on one plain flat light-grey studio background. First: an old wooden washboard with a ribbed metal scrubbing panel, standing upright. Second: a kitchen sink spray nozzle on a short black hose, standing upright in its round chrome holder. Third: a chrome kitchen faucet with a tall curved spout, seen side on, the spout pointing left. Fourth: a big heap of white soap suds and bubbles, wider than it is tall, as if heaped up out of a sink. Each whole thing is in frame. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**CB4. Pappy at the sink** (six on one sheet)

```text
Six photographs of the same older man from the waist up, side by side with wide clear gaps between them, on one plain flat light-grey studio background. He faces the camera in every one. He wears a red short-sleeved shirt with the sleeves rolled up and a white dish towel with red stripes tucked into his belt. First: both hands flat on a counter in front of him at waist height (the counter is not in the picture). Second: reaching out to his right (the left of the picture) at waist height with his right hand, as if to grab something. Third: both arms held out to his left (the right of the picture) at the height of his shoulders, hands close together as if gripping something round the neck and shaking it. Fourth: both hands down in front of him to his left at waist height, as if scrubbing something on a washboard. Fifth: both arms held out to his left at chest height, hands a long way apart, as if wringing out a towel. Sixth: both arms raised above his head, as if pegging something on a washing line. Nothing in his hands in any of them, and nothing covers his head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**CB5. The cats** (three on one sheet)

```text
Three photographs of three different cats, side by side with wide clear gaps between them, on one plain flat light-grey studio background. Each sits facing the camera, ears back, scowling, scruffy and unwashed. First: an orange tabby. Second: a black cat with yellow eyes. Third: a grey cat with a white face, chest and paws. Each whole cat is in frame, about the same size. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**CB6a. The orange tabby, at bath time** (five on one sheet)

```text
Five photographs of the same orange tabby cat, side by side with wide clear gaps between them, on one plain flat light-grey studio background, comic, like a cartoon. First: held up in the air by the scruff of its neck (whatever is holding it is not in the picture), facing the camera, its fur standing on end, claws out and legs flailing, hissing with its mouth wide open. Second: hanging the same way, completely limp, eyes shut, tongue poking out. Third: hanging the same way, soaking wet, fur plastered flat, dripping, ears drooping, miserable. Fourth: the cat twisted up like a wrung-out towel, very long, lying sideways, its head at the left end and its tail at the right, water dripping. Fifth: hanging the same way, bone dry and puffed up into a huge ball of frizzy fur, every hair on end, glaring at the camera. The whole cat is in frame in each. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**CB6b. The black cat, at bath time** (an edit: attach what CB6a gave)

```text
Edit this picture. Keep all five photographs exactly as they are: the same five poses, the same framing, the same background and the same light. Change one thing only: in all five the cat is now a black cat with yellow eyes, instead of an orange tabby. No text, no borders. Wide 16:9 image.
```

**CB6c. The grey cat, at bath time** (an edit: attach what CB6a gave)

```text
Edit this picture. Keep all five photographs exactly as they are: the same five poses, the same framing, the same background and the same light. Change one thing only: in all five the cat is now a grey cat with a white face, white chest and white paws, instead of an orange tabby. No text, no borders. Wide 16:9 image.
```

**CB7. A clothes peg**

```text
A single old wooden spring clothes peg, standing upright, photographed on a plain flat light-grey studio background. Soft even light, no shadows on the background. No text, no borders. Square image.
```

### Faces

Pappy's own, from his set (`docs/characters.md`): calm, disgusted, angry,
yell, ouch, smug, smile, laugh and `pucker`. Nothing new is needed.

## Sound

All of it is made up from notes and hisses, in `sounds.ts`. Nobody has heard
any of it: whether a sound is the right sound is for the owner to say, in
the preview. A real cat (or a real Pappy) would go in as
`public/sfx/catbath-<name>.mp3`.

How loud each came out is measured with `tools/test/listen.cjs` (they are
reached as `window.__catbath.hiss()` and so on): see the table below.

On the effects channel, where the mouth "bonk" reads 0.19 (each measured by its loudest 46 ms):

| Sound | When | Loudest 46 ms |
| --- | --- | --- |
| `hiss` | a cat, hissing | 0.14 |
| `yowl` | a cat, clawing him | 0.13 |
| `mew` | a soaked cat, out of the sink and waiting to be hung up | 0.11 |
| `gurk` | a squeeze (higher the less fight is left) | 0.09 |
| `scratch` | claws, across Pappy | 0.12 |
| `conk` | out cold | 0.16 |
| `splash` | into the sink | 0.20 |
| `scrub` | once along the washboard | 0.13 |
| `spray` | the sprayer | 0.15 |
| `twist` | a quarter of a twist | 0.10 |
| `drip` | water, wrung out into the sink | 0.10 |
| `peg` | a clothes peg | 0.10 |
| `kiss` | a kiss for a cat | 0.17 |
| `buzz` | the flies (meant to be faint) | 0.05 |
| `poof` | a cat, dried all at once | 0.12 |

Borrowed as they are from the game's own sound: `twinkle` and `win` (all clean).
