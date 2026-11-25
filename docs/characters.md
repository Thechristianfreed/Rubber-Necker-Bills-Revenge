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

The set worth having for anybody who is in more than one game. The names
are what the faces are called in the tables below.

| Look | What it is for |
| --- | --- |
| calm | nothing happening; listening; in between |
| smile | pleased |
| laugh | laughing out loud |
| smug | got away with it |
| angry | mouth shut, glaring |
| yell | mouth open, furious |
| shocked | eyes wide, mouth open: surprise or fright |
| worried | about to cry |
| cry | bawling |
| ouch | has just been hit |

Anything else is for one story (the doe eyes, the "PAH") and is made when a
game needs it.

## The family

### Bill

The star: it is his scrapbook. A grown man in every game, whatever age the
body is.

| Look | Have | From |
| --- | --- | --- |
| smile, laugh | `bill-grin` | the base photo (`bill-3`): short grey beard |
| yell | `bill_pah` (the "PAH") | an edit |
| smug | `bill-sideeye` | other photo (`bill-2`): a moustache and no beard |
| angry | `bill-glare` | other photo (`bill-1`): looking down, soft and dark, the weakest of his |
| calm, shocked, worried, cry, ouch | missing | |
| (one story) | `bill_in`, `bill_hold` (the breathing); `bill-back` (from behind) | edits; a generated picture |

- **Base photo:** `art-src/photos/bill-3.jpg`. His grin and his three
  breathing faces are from it and match one another. His two other everyday
  heads are from different photos, and in them he has no beard.
- **Bodies:** with the bat (`bill_rest`, `bill_windup`, `bill_swing`); the
  paperboy on the bicycle (`kid_rest`, `kid_windup`, `kid_swing`,
  `kid_duck`); from behind with the tennis racquet (`teen_rest`,
  `teen_windup`, `teen_swing`); six workout poses in blue (`pose_bill_*`).

### Stephanie (Mom)

Chad and Shane's mother, and "Mom" wherever the game says it. The instructor
on the workout tape, the cheerleader in the fight, the mother at the back
door.

| Look | Have | From |
| --- | --- | --- |
| smile | `mom_smile` | the base photo |
| angry (mid-word) | `mom_scold` | an edit |
| yell, or shocked | `mom_pah` | an edit: mouth wide open, which reads as either |
| calm, laugh, smug, worried, cry, ouch | missing | |
| (one story) | `mom_in`, `mom_hold` (the breathing) | edits |

- **Base photo:** `art-src/generated/WT1d-mom-smile.webp`. All five of hers
  come from it, so they match: she is the model for how the others should be.
- **Bodies:** six workout poses in pink (`pose_mom_*`); the cheer outfit, red
  and white with pom-poms (`cheer_*`, seven poses); at the back door, about
  1990, in a yellow short-sleeved blouse and high-waisted jeans
  (`batmom_akimbo`); the same seen from below, with a forearm that wags
  (`mom_below`, `mom_forearm`).

### Chad

Stephanie's son. A five-year-old's body (light blue T-shirt, navy shorts,
white socks and trainers) with his head as he is now.

| Look | Have | From |
| --- | --- | --- |
| smile | `chadface-grin` | the base photo (`chad-3`) |
| calm (set, determined) | `chadface-set` | an edit |
| yell | `chadface-yell` | an edit |
| cry | `chadface-cry` | an edit |
| smile (again) | `chadface-smile` | other photo (`chad-2`), warm and soft |
| laugh | `chadface-laugh` | other photo (`chad-4`), dark |
| angry | `chadface-scowl` | other photo (`chad-1`), dark and red |
| smug, shocked, worried, ouch | missing | |

- **Base photo:** `art-src/photos/chad-3.jpg`.
- **Bodies:** `chad_stand`, `chad_shoved`, `chad_mad`, `chad_hide`,
  `chad_down`, `chad_run1`, `chad_run2`, `chad_swing` (those with the bat,
  from Payback); `chad_dig`, `chad_bucket`, `chad_wail`, `chad_stance` (from
  the sandbox); and the two brothers hugging (`pair_hug`, `pair_side`).

### Shane

Chad's brother, and the bigger of the two. A five-year-old's body (red
T-shirt, blue jeans, white trainers) with his head as he is now.

| Look | Have | From |
| --- | --- | --- |
| smile | `shaneface-beam` | the base photo (`shane-1`) |
| cry | `shaneface-cry` | an edit |
| (one story) | `shaneface-doe` (big innocent eyes) | an edit |
| smug | `shaneface-smirk` | other photo (`shane-3`), dark |
| shocked | `shaneface-scared` | other photo (`shane-4`): a good one |
| calm (wary, looking away) | `shaneface-wary` | other photo (`shane-2`), washed out |
| laugh, angry, yell, worried, ouch | missing | |

- **Base photo:** `art-src/photos/shane-1.jpg`.
- **Bodies:** `shane_push`, `shane_laugh`, `shane_run1`, `shane_run2`,
  `shane_ow`, `shane_bawl` (from Payback); `shane_throw`, `shane_reach`,
  `shane_punch`, `shane_good` (from the sandbox); and seen from above
  (`shane_above`).

In the games the brothers' faces go by what they are doing, not by these
names (`KID_LOOKS` in `src/art/bat.ts`: Chad's "glee" is his grin, Shane's
"sweet" is his beam). The files are named as above.

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

## Faces still to make

One image each, starting from that person's base photo, in a fresh chat
each time, with the biggest copy of the photo there is. If the first try is
not them, ask again rather than correcting it.

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
| laugh | laughing out loud. Eyes creased nearly shut, mouth wide open in a big laugh, head still facing the camera. |
| smug | smug and pleased with himself. One corner of the mouth pulled up in a smirk, one eyebrow raised, eyes half closed. |
| angry | angry. Eyebrows pulled hard down, jaw clenched, lips pressed thin, glaring straight into the camera. |
| yell | yelling in fury. Mouth wide open, teeth showing, eyebrows hard down, eyes fixed on the camera. |
| shocked | shocked. Eyes as wide as they will go, eyebrows right up, mouth dropped open in a round O. |
| worried | hurt and about to cry. Bottom lip stuck out, eyebrows up in the middle. |
| cry | bawling like a small child. Eyes screwed shut, mouth wide open and turned down, tears running down the cheeks. |
| ouch | has just been hit on the head. Eyes squeezed shut, wincing, teeth gritted, the whole face scrunched up. |

(For Stephanie, "herself" for "himself".)

What each person is missing, and what could be done again from their base
photo so that it matches the rest:

| | Missing | Could be done again to match |
| --- | --- | --- |
| Bill | calm, shocked, worried, cry, ouch | smug, angry (his are from photos with no beard) |
| Stephanie | calm, laugh, smug, worried, cry, ouch | |
| Chad | smug, shocked, worried, ouch | laugh, angry |
| Shane | laugh, angry, yell, worried, ouch | calm, smug |

When they come back: each is cut out like the others (`cutting.md`), and
goes in with the common pictures, where every game can use it.
