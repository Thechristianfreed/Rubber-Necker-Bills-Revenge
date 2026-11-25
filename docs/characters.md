# The cast

Who is in the game, what pictures there are of each of them, and which
faces are still missing. Anybody making a new quick game uses the people
who are here, with the faces they have. A face that is missing is asked for
here, once, for everybody: not made again in each game.

## How a person is put together

- **A head from a real photo, hung by the chin on a generated body.** The
  body belongs to the game that needs the pose. The head belongs to the
  person, and is the same in every game.
- **A new expression is an edit of one photo of that person**, one face to
  an image ("Change only his expression"). That keeps the likeness, and it
  keeps the light, so one face matches the next. Each person below has a
  *base photo* that their edits start from.
- **A face taken from a different photo does not match:** different light,
  different sharpness, sometimes a different haircut. Several of the first
  faces are like that, and are marked "other photo" below. They work, but a
  game that cuts from one to another shows the join.
- **Animals, and people who are only ever in one scene, do not need a set.**
  They need what their job needs, which is usually two pictures: as they
  are, and reacting.

## The looks

The fifteen everybody in the family gets (the owner's decision): Bill,
Stephanie, Chad and Shane now, and Mammy, Pappy, Nanner, Curt, Sherry,
Christian and Branson once there is a photo of each. The names are what the
faces are called in the tables below.

| Look | What it is for |
| --- | --- |
| calm | nothing happening; listening; in between |
| talking | in the middle of a word. Flipped with calm, it makes anybody speak. |
| smile | pleased |
| laugh | laughing out loud |
| smug | got away with it |
| angry | mouth shut, glaring |
| yell | mouth open, furious |
| shocked | eyes wide, mouth open: surprise or fright |
| guilty | caught at it |
| worried | about to cry |
| cry | bawling |
| ouch | the moment of being hit |
| dazed | the moment after |
| disgusted | at a smell, or worse. These stories have a lot of that. |
| asleep | eyes shut |

**Rick DeGour, Cindy and Betty get six:** calm, smile, laugh, angry, shocked
and cry. **The animals** get what their job needs, which is two or three
pictures.

**And everybody, all fourteen people, gets the back of their head,** for
the games that are seen from behind. It is not a face pulled from the
photo: it is a picture of its own, and a real photo of the back of
somebody's head (from straight behind, at head height, against a plain
wall) is better than a generated one. Bill has his.

Anything else is for one story (the doe eyes, the "PAH") and is made when a
game needs it.

A face is between 10 and 30 KB as a file (long hair costs more). All the
faces still to be made come to about 2.5 MB, which is no trouble now that
the pictures are kept beside the page (`minigames.md`, "How much room there
is").

## The family

Who is who, for anybody writing a line for one of them to say:

- **Bill and Stephanie** are married.
- **Their four boys are brothers.** Shane and Chad are Stephanie's sons, and
  Bill is their stepfather: he is not their father by birth, but he raised
  them most of their lives, and they call him **Beeb**. Christian and
  Branson are Stephanie and Bill's sons, and call him **Dad**. So Shane and
  Chad are Christian and Branson's half-brothers. Stephanie is "Mom" to all
  four.
- **Stephanie's side:** Mammy is her mother and Pappy her father (the boys'
  grandparents); Nanner is her sister and Curt her brother (their aunt and
  uncle).
- **Bill's side:** Betty is his mother (Christian and Branson's grandmother),
  and Sherry and Cindy are his sisters (their aunts).
- **Rick DeGour** works with Bill.
- **The animals:** Lady, the family's golden retriever; Sheeba, the first
  dog Christian had, growing up; and The Grump, Christian's pet opossum.
- **Christian** is the owner of this game.

## Every face there is now

All of them, so that nothing already made is made twice or lost track of.
"Name in the game" is the picture a game asks for; the file is in
`src/assets/scrap` (Bill's four everyday heads are in `src/assets/bill`).

**Outside the fifteen** are the looks made for one story: the three of the
breathing (the breath in, holding it, the "PAH"), the scolding, the doe
eyes, the set jaw, and the bigger copies for close-ups. They are kept and
used, and they are **not being made for anybody else for now** (the owner's
decision). The back of a head is the exception: everybody is to have one.

### Bill

The star: it is his scrapbook. Stephanie's husband. A grown man in every
game, whatever age the body is.

| Look | Which of the fifteen | Name in the game | File | From | Used in |
| --- | --- | --- | --- | --- | --- |
| grinning | smile, laugh | `bill-grin` | `head-grin` | the base photo (`bill-3`) | wins, a good hit in the levels, the level cards, the workout when he gets a pose |
| the "PAH" | yell | `bill_pah` | `billface-pah` | an edit | the workout |
| the breath in | outside the fifteen | `bill_in` | `billface-in` | an edit | the workout |
| holding it | outside the fifteen | `bill_hold` | `billface-hold` | an edit | the workout |
| side-eye | smug | `bill-sideeye` | `head-sideeye` | other photo (`bill-2`): a moustache and no beard | his everyday head: the title, every level |
| glaring down | angry | `bill-glare` | `head-glare` | other photo (`bill-1`): soft and dark, the weakest of his | losses, and when he is hurt or ducking in the levels |
| from behind | the back of his head | `bill-back` | `head-back` | a generated picture | the hallway |

Missing: calm, talking, shocked, guilty, worried, cry, ouch, dazed,
disgusted, asleep.

- **Base photo:** `art-src/photos/bill-3.jpg`. His grin and his three
  breathing faces are from it and match one another. His two other everyday
  heads are from different photos, and in them he has no beard.
- **Bodies:** with the bat (`bill_rest`, `bill_windup`, `bill_swing`); the
  paperboy on the bicycle (`kid_rest`, `kid_windup`, `kid_swing`,
  `kid_duck`); from behind with the tennis racquet (`teen_rest`,
  `teen_windup`, `teen_swing`); six workout poses in blue (`pose_bill_*`).

### Stephanie (Mom)

Bill's wife, and mother of Shane, Chad, Christian and Branson: "Mom"
wherever the game says it. The instructor on the workout tape, the
cheerleader in the fight, the mother at the back door.

| Look | Which of the fifteen | Name in the game | File | From | Used in |
| --- | --- | --- | --- | --- | --- |
| smiling | smile | `mom_smile` | `mom-smile` | the base photo | the workout, the fight, the end of the sandbox |
| the "PAH" | yell, shocked | `mom_pah` | `mom-pah` | an edit: mouth wide open, which reads as either | the workout, the fight, the back door |
| scolding | angry (mid-word); outside the fifteen | `mom_scold`, and `mom_big_scold` for close up | `mom-scold` | an edit | the sandbox |
| the breath in | outside the fifteen | `mom_in` | `mom-in` | an edit | the workout, and the fight |
| holding it | outside the fifteen | `mom_hold` | `mom-hold` | an edit | the workout; everywhere else as her cross, lips-pressed face (hit in the fight, at the back door, deciding at the sandbox) |

Missing: calm, talking, laugh, smug, guilty, worried, cry, ouch, dazed,
disgusted, asleep; and the back of her head.

- **Base photo:** `art-src/generated/WT1d-mom-smile.webp`. All five of hers
  come from it, so they match: she is the model for how the others should be.
- **Bodies:** six workout poses in pink (`pose_mom_*`); the cheer outfit, red
  and white with pom-poms (`cheer_*`, seven poses); at the back door, about
  1990, in a yellow short-sleeved blouse and high-waisted jeans
  (`batmom_akimbo`); the same seen from below, with a forearm that wags
  (`mom_below`, `mom_forearm`).

### Chad

Stephanie's son and Bill's stepson, who calls him Beeb; Shane's brother,
and half-brother to Christian and Branson. In the games so far, a five-year-old's body (light blue T-shirt,
navy shorts, white socks and trainers) with his head as he is now.

| Look | Which of the fifteen | Name in the game | File | From | Used in |
| --- | --- | --- | --- | --- | --- |
| grinning | smile | `chadhead_glee` | `chadface-grin` | the base photo (`chad-3`) | Payback, the sandbox |
| jaw set | calm; outside the fifteen | `chadhead_set`, and `chadbighead_set` for close up | `chadface-set` | an edit | the sandbox |
| yelling | yell | `chadhead_yell`, and `chadbighead_yell` for close up | `chadface-yell` | an edit | Payback, the sandbox |
| bawling | cry | `chadhead_cry` | `chadface-cry` | an edit | the sandbox |
| smiling | smile (again) | `chadhead_angel` | `chadface-smile` | other photo (`chad-2`): warm and soft | Payback, the sandbox |
| laughing | laugh | `chadhead_joy` | `chadface-laugh` | other photo (`chad-4`): dark | Payback, the sandbox |
| scowling | angry | `chadhead_mad`, `chadhead_sad` | `chadface-scowl` | other photo (`chad-1`): dark and red | Payback, the sandbox |

Missing: talking, smug, shocked, guilty, worried, ouch, dazed, disgusted,
asleep; and the back of his head.

- **Base photo:** `art-src/photos/chad-3.jpg`.
- **Bodies:** `chad_stand`, `chad_shoved`, `chad_mad`, `chad_hide`,
  `chad_down`, `chad_run1`, `chad_run2`, `chad_swing` (those with the bat,
  from Payback); `chad_dig`, `chad_bucket`, `chad_wail`, `chad_stance` (from
  the sandbox); and the two brothers hugging (`pair_hug`, `pair_side`).

### Shane

Stephanie's son and Bill's stepson, who calls him Beeb; Chad's brother,
half-brother to Christian and Branson, and the bigger of the two in the
yard. In the games so far, a
five-year-old's body (red T-shirt, blue jeans, white trainers) with his
head as he is now.

| Look | Which of the fifteen | Name in the game | File | From | Used in |
| --- | --- | --- | --- | --- | --- |
| beaming | smile | `shanehead_sweet`, `shanehead_tongue` | `shaneface-beam` | the base photo (`shane-1`) | Payback, the sandbox |
| bawling | cry | `shanehead_cry`, and `shanebighead_cry` for close up | `shaneface-cry` | an edit | Payback, the sandbox |
| doe eyes | outside the fifteen | `shanehead_doe`, and `shanebighead_doe` for close up | `shaneface-doe` | an edit | the sandbox |
| smirking | smug | `shanehead_grin` | `shaneface-smirk` | other photo (`shane-3`): dark | Payback, the sandbox |
| frightened | shocked | `shanehead_scared`, `shanehead_ow` | `shaneface-scared` | other photo (`shane-4`): a good one | Payback |
| wary, looking away | calm | none: cut out, and not used yet | `shaneface-wary` | other photo (`shane-2`): washed out | |

Missing: talking, laugh, angry, yell, guilty, worried, ouch, dazed,
disgusted, asleep; and the back of his head.

- **Base photo:** `art-src/photos/shane-1.jpg`.
- **Bodies:** `shane_push`, `shane_laugh`, `shane_run1`, `shane_run2`,
  `shane_ow`, `shane_bawl` (from Payback); `shane_throw`, `shane_reach`,
  `shane_punch`, `shane_good` (from the sandbox); and seen from above
  (`shane_above`).

In the games the brothers' faces go by what they are doing, not by the name
of the look (`KID_LOOKS` in `src/art/bat.ts`: Chad's "glee" is his grin,
Shane's "sweet" is his beam), which is why one file can have two names.

## Everybody else

| Who | What there is | Needs more? |
| --- | --- | --- |
| **Trouble**, the other girl in the fight | Seven whole figures, her own face on each: walking up, pointing, charging, flicking, flinching, hulked out, arms folded (`rival_*`), and an arm that swings | No. She is generated, and in one game. |
| **The rubberneckers** | Twelve heads, each gawking and each dazed (`head0` to `head11`) | No |
| **The mailman** | A whole figure, twice: with a letter, and shaking his fist | No |
| **The boys at the sleepover:** DJ, Neil, Forrest, Christian, and Alex's dad | Cut paper only. The prompts for photos are written (HC1 to HC6 in `art-prompts.md`) and none is made. | Only when that level gets its photos |
| **The bully, the teacher** | Named in the story of the locker; never seen | No |

## The animals

| Who | What there is | Needs more? |
| --- | --- | --- |
| **The dog** (a golden retriever, in the back of the wagon) | Two heads: happy with its tongue out, and cross | A stand-in for **Lady**, the family's own golden retriever. One photo of her replaces it. Two looks is enough. |
| **The bluebirds** (round a head that has been hit) | Wings up, wings down | No |

## Named, and not in the game yet

The owner's list. Each needs a picture to start from: facing the camera,
evenly lit, the biggest copy there is, nobody else in it.

| Who | Who they are | Faces |
| --- | --- | --- |
| **Mammy** | Stephanie's mother | all fifteen |
| **Pappy** | Stephanie's father | all fifteen |
| **Nanner** | Stephanie's sister | all fifteen |
| **Curt** | Stephanie's brother | all fifteen |
| **Sherry** | Bill's sister | all fifteen |
| **Christian** | Stephanie and Bill's son, and the owner. He is at the light switch in The Hot Carl, cut from paper. | all fifteen |
| **Branson** | Stephanie and Bill's son, Christian's brother | all fifteen |
| **Rick DeGour** | Bill's coworker | six |
| **Cindy** | Bill's sister | six |
| **Betty** | Bill's mother | six |
| **Sheeba**, a dog | The first dog Christian had, growing up. A second dog: Lady is still the one not to hit. | Two: as she is, and reacting. From photos of her. |
| **The Grump**, an opossum | Christian's pet | Three would suit an opossum: as it is, hissing, and playing dead. From a photo, or generated if there is none. |

One of each person's faces will be the photo itself (a smile, usually), so
there are fourteen to make of fifteen, and five of six. Each of them is to
have the back of their head as well.

## Faces still to make

One image each, starting from that person's base photo, in a fresh chat
each time, with the biggest copy of the photo there is. If the first try is
not them, ask again rather than correcting it.

The owner works from a page that has every one of these written out, ready
to copy, with a tick for each one made:
https://claude.ai/artifact/27mH87aARmemxJtoMhiSNF. (Each prompt there also
says "Keep his head upright and facing the camera", which keeps the chin
where the cutting expects it.) When a face is made and in the game, take it
off the lists here.

For somebody whose photo has not been seen yet, the page uses a prompt that
fits anybody ("Keep this person exactly as they are...").

For Bill, Chad and Shane:

```text
Edit this photo. Keep the man, his hair, his beard, the lighting, the framing and the background exactly the same. Change only his expression: <the look, from below>
```

For Stephanie:

```text
Edit this photo. Keep this woman exactly as she is: the same face, age, skin, eyes, nose, hair, necklace and top, the same lighting, the same background and the same framing. Change one thing only, her expression: <the look, from below>
```

| Look | The words |
| --- | --- |
| calm | relaxed and neutral. Mouth closed, no smile, eyebrows level, looking straight into the camera. |
| talking | in the middle of saying something. Mouth open as if speaking a word, face relaxed, eyebrows level, looking straight into the camera. |
| laugh | laughing out loud. Eyes creased nearly shut, mouth wide open in a big laugh, head still facing the camera. |
| smug | smug and pleased with himself. One corner of the mouth pulled up in a smirk, one eyebrow raised, eyes half closed. |
| angry | angry. Eyebrows pulled hard down, jaw clenched, lips pressed thin, glaring straight into the camera. |
| yell | yelling in fury. Mouth wide open, teeth showing, eyebrows hard down, eyes fixed on the camera. |
| shocked | shocked. Eyes as wide as they will go, eyebrows right up, mouth dropped open in a round O. |
| worried | hurt and about to cry. Bottom lip stuck out, eyebrows up in the middle. |
| cry | bawling like a small child. Eyes screwed shut, mouth wide open and turned down, tears running down the cheeks. |
| guilty | caught out and guilty. Eyes wide and looking off to one side, teeth clenched in an awkward grimace, eyebrows up. |
| ouch | has just been hit on the head. Eyes squeezed shut, wincing, teeth gritted, the whole face scrunched up. |
| dazed | dazed, as if knocked on the head a moment ago. Eyes unfocused and a little crossed, eyelids heavy, mouth hanging slack and crooked. |
| disgusted | disgusted, as if at a terrible smell. Nose wrinkled, upper lip curled, tongue pushed out a little, eyes narrowed. |
| asleep | fast asleep. Eyes closed, face completely relaxed, mouth a little open. |

The back of a head is asked for differently, since nothing of the photo is
kept but the hair (for a woman, "this woman's" and "her"):

```text
The back of this man's head, photographed from directly behind at head height: his hair exactly as it is in the photo (the same colour, length and cut), his ears just visible at the sides if his hair does not cover them, and the back of his neck down to the collar line. No face visible. Plain flat light-grey background, soft even light. No shoulders, no clothing, no text, no borders. Square image.
```

It is hung by the top of the collar, where a face is hung by the chin
(`build_back()` in `tools/make_heads.py` did Bill's).

(For Stephanie, "herself" for "himself".)

What each person is missing, and what could be done again from their base
photo so that it matches the rest:

| | Missing | Could be done again to match |
| --- | --- | --- |
| Bill | calm, talking, shocked, guilty, worried, cry, ouch, dazed, disgusted, asleep | smug, angry (his are from photos with no beard) |
| Stephanie | calm, talking, laugh, smug, guilty, worried, cry, ouch, dazed, disgusted, asleep | |
| Chad | talking, smug, shocked, guilty, worried, ouch, dazed, disgusted, asleep | laugh, angry |
| Shane | talking, laugh, angry, yell, guilty, worried, ouch, dazed, disgusted, asleep | calm, smug |
| Mammy, Pappy, Nanner, Curt, Sherry, Christian, Branson | all fifteen, less the one the photo is | |
| Rick DeGour, Cindy, Betty | calm, smile, laugh, angry, shocked, cry, less the one the photo is | |
| Everybody but Bill | the back of the head | |

When they come back: each is cut out like the others (`cutting.md`), and
goes in with the common pictures, where every game can use it.
