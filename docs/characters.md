# The cast

Who is in the game, what pictures there are of each of them, and which
faces are still missing. Anybody making a new quick game uses the people
who are here, with the faces they have. A face that is missing is asked for
here, once, for everybody: not made again in each game.

## How a person is put together

- **A head from a real photo, hung by the chin on a generated body.** The
  body belongs to the game that needs the pose. The head belongs to the
  person, and is the same in every game.
- **Everybody in the family has one set of faces,** all cut the same way:
  every head the same size and hung from the same chin, so any look can be
  changed for any other and the head does not move. That set is what a new
  game uses ("Everybody's faces: the set", below).
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

**And everybody in the family gets the back of their head** (all but Rick
DeGour, Cindy and Betty), for the games that are seen from behind. It is not a face pulled from the
photo: it is a picture of its own, and a real photo of the back of
somebody's head (from straight behind, at head height, against a plain
wall) is better than a generated one. Bill has his. **The rest are
waiting:** asking a generator to turn a photo of a face round gave nothing
like the person (Stephanie and Chad were tried, November 2026), and the
owner remembers Bill's being made another way. Ask him how before trying
again.

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
- **Shorty** is Branson's wife.
- **The animals:** Lady, the family's golden retriever; Sheeba, the first
  dog Christian had, growing up (a white German shepherd); The Grump,
  Christian's pet opossum; and Roger, Branson and Shorty's dog (a big
  curly-coated cream doodle).
- **Sabra** has a folder of photos and is to be in the game. Who she is to
  the family has not been said yet: ask the owner before writing her in.
  (Nor has who **Kim** is, who is in every photo of Curt, or **Brian**, who
  is in one of Nanner's: neither is a character.)
- **Christian** is the owner of this game.

## Everybody's faces: the set

Each of the family has one set of looks, cut the same way
(`tools/make_cast.py`): every head the same size, hung from the same chin.
**These are the faces a new game uses.** A head goes on any body with one
call and changes its look with another, without moving
(`src/minis/shared/people.ts`):

```ts
import { head, setLook } from '../shared/people';

const chad = head(scene, 'chad', 'calm', x, neckY, 62).setDepth(12);   // 62 from hair to chin
setLook(chad, 'chad', 'guilty');
```

A look somebody has not got is stood in for by the nearest they have (Bill's
calm is his smug, for now), so a game can ask anybody for any of the
fifteen and the list below can be filled in later without the game
changing. Each face is `face_<who>_<look>` in the catalogue, and its file is
`src/assets/scrap/face-<who>-<look>.webp`.

**No face that has been made is left out of it** (the owner's decision).
The faces each person had before there was a set, made for one game or
another, are in their set as well, cut again by the same tool so that they
are the same size and hang the same way. One that is a look of the fifteen
fills that place in the set, until a picture of that look comes with the
others: then the new one is the look and the old one is given a name of its
own (Shane's first shocked face is his `startled`). One that is not keeps a
name of its own from the start, and is asked for like any other:
`head(scene, 'shane', 'doe', x, y, 62)`.

| Who | Called | Of the fifteen | Missing | And of their own |
| --- | --- | --- | --- | --- |
| Bill | `bill` | 15 (his calm is a photo of him years ago, with a moustache and no beard: the owner has said that is his calm, for good) | | `inhale` (the breath in), `hold` (holding it), `sideeye`, `glare` |
| Stephanie | `stephanie` | 15 | | `inhale` (the breath in), `hold` (holding it: her cross, lips-pressed face) |
| Chad | `chad` | 15 | | `grin` (the base photo), `angel` (smiling), `joy` (laughing), `scowl` |
| Shane | `shane` | 15 | | `beam` (the base photo), `wary`, `smirk`, `doe` (doe eyes), `startled` (his first shocked face, from another photo) |
| Mammy | `mammy` | 15 | | `photo` (the Christmas photo her set was made from: its own smile) |
| Pappy | `pappy` | 15 | | `photo` (a real photo: a closed-mouth smile, in the leaf-print shirt), `silly` (tongue out, in his sunglasses) |
| Nanner | `nanner` | 15 | | `photo` (the wedding photo her set was made from: its own smile) |
| Christian | `christian` | 15 (his calm, smile and laugh are real photos) | | `gentle` (a gentle smile, 2021), and three made from the photo his smile is: `yell2`, `dazed2`, `worried2` (a nervous grin) |
| Branson | `branson` | 15 (his laugh is a real photo) | | `stuffed` (his cheeks puffed out, crammed full: made for the vegetables) |
| Shorty | `shorty` | 15 (her smile is the photo itself) | | `pout` |
| Curt | `curt` | 15 (his laugh is a real photo of him as he is now; the rest are him at his wedding, years younger, with a moustache) | | `photo` (as he is now, smiling, on the rooftop) |
| Sabra | `sabra` | 15 (her calm is a real photo, on the train, looking away) | | `photo` (smiling, in the restaurant) |

Everybody on the list has a set now. A face that is a real photo, used as it
is, is listed in the next section but one, with every photo and what became
of it. When a person's
generated set comes, its "Default" is their smile, and the face cut from the
real photo is kept as their `photo`.

There is a sheet of every face each of them has, labelled, made with
`.venv/bin/python tools/test/every_face.py <out prefix>`: make it again
whenever faces are added, and show the owner.

Which of a set are the same picture as one the first six games use, under
the name those games know it by (the next section has what each is used
for):

| Who | In the set | The first games' name for the same picture |
| --- | --- | --- |
| Bill | smile | `bill-grin` |
| | yell | `bill_pah` |
| | inhale, hold | `bill_in`, `bill_hold` |
| | sideeye, glare | `bill-sideeye`, `bill-glare` (other photos: a moustache and no beard) |
| Stephanie | smile | `mom_smile` |
| | yell | `mom_pah` |
| | angry | `mom_scold`, `mom_big_scold` |
| | inhale, hold | `mom_in`, `mom_hold` |
| Chad | calm | `chadhead_set`, `chadbighead_set` |
| | yell | `chadhead_yell`, `chadbighead_yell` |
| | cry | `chadhead_cry` |
| | grin | `chadhead_glee` |
| | angel, joy, scowl | `chadhead_angel`, `chadhead_joy`, `chadhead_mad` and `chadhead_sad` (other photos) |
| Shane | cry | `shanehead_cry`, `shanebighead_cry` |
| | startled | `shanehead_scared`, `shanehead_ow` (another photo) |
| | beam | `shanehead_sweet`, `shanehead_tongue` |
| | smirk | `shanehead_grin` (another photo) |
| | doe | `shanehead_doe`, `shanebighead_doe` |
| | wary | none: no game has used it yet (another photo) |

- **Most of the fifteen are one batch** (November 2026): edits of each
  person's base photo, made by the owner, one look to a picture. They are in
  his Google Drive, in "Rubber Necker Game Character Photos", "Full
  Expression Repo", a folder for each person, each file called by the person
  and the look ("Chad Guilty.png"). "Default" is the photo itself, and is
  that person's smile. Adobe's cutouts of them are in `art-src/cast/<who>`.
- **Bill's smile is the base photo,** a big open grin. His laugh is an edit
  of it that the owner sent in the chat on 26 November (eyes creased shut,
  mouth wide open), as was Mammy's ouch: neither is in his Drive, so both are
  kept here, in `art-src/generated` (`face-bill-laugh`, `face-mammy-ouch`).
  The picture that came as Bill's calm was the same file as his talking; his
  calm is the photo of him at the lookout in Hawaii, years ago, and the owner
  has said that one is final.
- **Within a batch they match,** being edits of one photo with one framing.
  An earlier picture that is an edit of the same photo sits well beside
  them. One from **another photo** does not (different light, sometimes a
  different haircut, the head held another way): Bill's calm is the only
  one of those among the fifteen now. (Shane's shocked was another, until
  one was made to match; the first is his `startled`.) Those are hung by
  their own chins, as they always were.
- **Mammy's, Pappy's and Nanner's came the same way** (25 November 2026),
  with Stephanie's shocked and a shocked for Shane that matches his set.
  Mammy's ouch came later, in the chat. Her other thirteen came
  as small copies (480 by 639, where her "Default" is 1792 by 2388): they
  are big enough for a head in the game, a little softer than her smile, and
  full-size copies would replace them if the owner has them.
- **Christian's, Branson's and Shorty's came later the same day,** and are
  edits of each one's photo itself: no portrait was made first. So the photo
  stays that person's face for the look it shows (Christian's calm, Shorty's
  smile; Branson's smile is his "Default", which is the photo), and the edits
  fill in round it. Christian's three called "Alternate" are edits of another
  photo, the green T-shirt one his smile is: they are his own `yell2`,
  `dazed2` and `worried2`. Two of Branson's files were both called "Calm": one
  was his smug. His dazed came as a small picture blown up, and is soft.
  Shorty's hair runs out of her photo and lies over her shoulder, and her
  denim jacket showed through it: every look of hers, and her smile, is
  trimmed at the chin, which takes the shoulder off (the owner asked for
  this). **That is Shorty's and nobody else's.** Nanner's and Mammy's long
  hair is right as it is, the owner has said (26 November): do not trim
  anybody else's hair unless he asks.
- **Sabra's and Curt's came on 26 November,** each a portrait ("Default")
  and thirteen edits of it. Sabra's portrait was made from her restaurant
  photo; Curt's from his wedding photo, the owner's choice, so his set is
  Curt years younger and with a moustache, and his one real-photo look (his
  laugh, from now) is another man beside the rest. A laugh made from his
  "Default" would match; so would a calm made from Sabra's, whose calm is a
  photo of her looking away on a train. Sabra's hair is tied back in her
  portrait and wisps of it hang past her jaw: they are trimmed at the chin.
- **Pappy's portrait has his head turned and tipped,** as it is in the
  Christmas photo it was made from. Every look of his is set straight by the
  same amount (`SETS` in `tools/make_cast.py`), which is also where his far
  eyebrow, at the very edge of his face, is kept inside the cutout. Nanner's
  hair is trimmed there too, where it ran down over her shoulders in tails.
- **The first six games keep the faces they were made with** (the next
  section), under the names they have always had. Nothing of theirs has been
  changed: a face in the set is a new cutout beside theirs, even where it is
  the same picture.
- **Bill's head from behind** (`bill-back`) is not a face and is not in the
  set.

## The faces the first six games use

All of them, so that nothing already made is made twice or lost track of.
(A new game uses the set, above.)
"Name in the game" is the picture a game asks for; the file is in
`src/assets/scrap` (Bill's four everyday heads are in `src/assets/bill`).

**Outside the fifteen** are the looks made for one story: the three of the
breathing (the breath in, holding it, the "PAH"), the scolding, the doe
eyes, the set jaw, and the bigger copies for close-ups. They are kept and
used, they are in their owner's set for any new game to use, and they are
**not being made for anybody else for now** (the owner's decision). The back of a head is the exception: everybody who has the
fifteen is to have one.

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

(What he has now, and what he is missing, is in the table of the set.)

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

(What she has now, and what she is missing, is in the table of the set.)

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

(What he has now is in the table of the set: all fifteen.)

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
| frightened | shocked (in the set it is his `startled`) | `shanehead_scared`, `shanehead_ow` | `shaneface-scared` | other photo (`shane-4`): a good one | Payback |
| wary, looking away | calm | none: cut out, and not used yet | `shaneface-wary` | other photo (`shane-2`): washed out | |

(What he has now is in the table of the set: all fifteen.)

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
| **The waiter** at Le Papillon | A whole figure, twice, his own face on each: standing with a cloth over his arm, and holding a hand out for a tray (`papillon_waiter`, `papillon_waiter_serve`). | No. He is generated whole, like Trouble, and is in all three games set at the restaurant. |
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
| **Mammy** | Stephanie's mother | all fifteen: she has them |
| **Pappy** | Stephanie's father | all fifteen: he has them |
| **Nanner** | Stephanie's sister | all fifteen: she has them |
| **Curt** | Stephanie's brother | all fifteen: he has them |
| **Sherry** | Bill's sister | all fifteen |
| **Christian** | Stephanie and Bill's son, and the owner. He is at the light switch in The Hot Carl, cut from paper. | all fifteen: he has them |
| **Branson** | Stephanie and Bill's son, Christian's brother | all fifteen: he has them |
| **Shorty** | Branson's wife | all fifteen: she has them |
| **Sabra** | Not said yet | all fifteen: she has them |
| **Rick DeGour** | Bill's coworker | six |
| **Cindy** | Bill's sister | six |
| **Betty** | Bill's mother | six |
| **Sheeba**, a dog | The first dog Christian had, growing up: a white German shepherd. A second dog: Lady is still the one not to hit. | Two: as she is, and reacting. There is no photo of her; she is generated from pictures of dogs like her. |
| **The Grump**, an opossum | Christian's pet | Every photo of him is cut, whole: at his dish, held, asleep on his back (which will do for playing dead), held upright (`grump_eat`, `grump_held`, `grump_asleep`, `grump_up`). A hiss would have to be generated. |
| **Roger**, a dog | Branson and Shorty's: a big curly-coated cream doodle | Every photo of him is cut, whole: sitting with his tongue out, sitting with his mouth shut, lying down, and twice from the chest up (`roger_happy`, `roger_sit`, `roger_lie`, `roger_sleepy`, `roger_portrait`). |

**Photos there are now.** They are in the owner's Google Drive ("Rubber
Necker Game Character Photos", "Family Game Images", a folder for each
person), and the ones worth starting from are in `art-src/photos`, cropped
to the one person:

| Who | Photos | Which to start from |
| --- | --- | --- |
| **Pappy** | `pappy-1` (indoors, in a leaf-print shirt: the biggest and sharpest), `pappy-2` (at Christmas, in a suit, his head turned a little), `pappy-3` (on a patio). White hair and a white moustache in all of them. | Done: the owner made his portrait from `pappy-2`. |
| **Mammy** | `mammy-1` (at Christmas: red hair, square to the camera, no glasses), `mammy-2` (on a patio: blonde), `mammy-3` (later: grey-blonde curls and tinted glasses; her head is biggest here, but the glasses hide her eyes), `mammy-4` (younger, in a suede hat) | Done: the owner made her portrait from `mammy-1`. |
| **Nanner** | `nanner-1` (at a wedding, cropped from a photo with somebody else), `nanner-2` (a selfie in a birthday tiara, with braces: square to the camera, and the biggest), `nanner-3` (by a Christmas tree: small and soft) | Done: the owner made her portrait from `nanner-1`. |
| **Christian** | `christian-1` (indoors, grey T-shirt, calm: as he is now, big and sharp), `christian-2` (a green T-shirt, a broad smile), `christian-3` (on a boat, a big laugh), `christian-4` (2021, a mustard jacket, a gentle smile: Adobe cannot find the face in it, it is so washed out), `christian-5` (in profile: no use for a face) | Done: every look is an edit of `christian-1` (he is alone in it, so no base was needed). He has more in Google Photos, which Claude cannot reach: the owner copies any that are wanted into the Drive folder. |
| **Branson** | Seven, all screenshots (a little soft) and every one a smile or a laugh. `branson-1` (on a street, a patterned shirt: the biggest), `branson-2` (a maroon T-shirt, laughing), `branson-3` (in a dinner jacket: square to the camera but small), `branson-4` (younger, with somebody else) | Done: every look is an edit of `branson-1`. |
| **Shorty** | `shorty-1` (outdoors, a denim jacket, smiling: big and sharp, but her hair runs off the left and the bottom of the picture, and somebody else is at its edge), a studio portrait (head turned well away, lighter hair) and a small cut-out of her pulling a face (`shorty-3`) | Done: every look is an edit of `shorty-1` itself (no base was made, so her hair is trimmed where the picture ends). |
| **Sabra** | Four. Close up in a restaurant, a wide smile (`sabra-3`); on a train, looking at her phone (`sabra-4`); looking back over her shoulder, small and soft (`sabra-1`); in profile (`sabra-2`) | Done: the owner made her portrait from `sabra-3`. |
| **Curt** | Five, all with Kim. On a rooftop, square to the camera and evenly lit (`curt-1`: the owner's "good lighting"); a close selfie, a broad grin, sunglasses on his head (`curt-2`: "accurate"); in a sun hat; and two from years ago | Done: the owner made his portrait from the wedding photo (years younger, with a moustache), not from `curt-1`. |
| **Sheeba** | Four pictures in the Drive folder "Sheeba", of a white German shepherd: sitting by a lake, lying on a couch, asleep on a rug, standing in a studio. There is no photo of Sheeba herself: these are found pictures of dogs close to her (the owner's word; one has a photographer's mark on it). | Not for cutting out: she is generated from a description of them. |
| **Roger** | Five. Sitting on a step with his tongue out (`roger-1`: sharp and big), sitting by a Christmas tree (`roger-2`), lying on an ottoman (`roger-3`, cropped out of a phone screenshot), and two that had been cut out or touched up already (`roger-4`, `roger-5`) | All five cut whole, as they are. |
| **The Grump** | Four, all small. At his dish, in profile (`grump-1`), in somebody's arms, looking at the camera (`grump-2`), curled up asleep on his back (`grump-3`), held upright (`grump-4`: soft) | All four cut whole, as they are. |

**A real photo can be a look as it is** (the owner's decision), so that it
need not be generated: Christian laughing on the boat is his laugh. It has
to be sharp enough, the whole head in the picture, the face to the camera
or nearly, and nothing over it. Such a look is a photo in its own right
(`PHOTOS` in `tools/make_cast.py`) and hangs by its own chin; it will not
match the generated ones in its light, as any face from another photo does
not. Every photo in every folder has been gone through for this: "Every
photo there is, and what became of it", below.

Mammy's, Pappy's and Nanner's photos are small (a head is 190 to 380
pixels tall) and most have somebody else in them; Shorty's is cut off by
its frame. So the first thing made from each is a **base**: a
clean head-and-shoulders portrait of the one person, head upright, the whole
head in the picture (the faces page has the prompt, as the first card for
each of them). Every look is then an edit of the base, not of the photo:
that is how Chad's and Shane's were done, and why each of their sets
matches. The base is that person's smile. (Mammy's, Pappy's and Nanner's are
made: each is "Default" in that person's folder of the Full Expression
Repo, as Curt's and Sabra's are. Shorty's looks were made from her photo as
it is.)

One of each person's faces will be the photo itself (a smile, usually), so
there are fourteen to make of fifteen, and five of six. Those who get the
fifteen are to have the back of their head as well.

## Every photo there is, and what became of it

The owner's rule: where a photo in a folder already shows an expression, it
is used for it, and that look is not generated. So every photo in every
folder of his Drive ("Family Game Images") is listed here with what it is in
the game as, or why it is not. All of it was gone through on 25 November
2026; a photo added since then is not here, and is to be gone through the
same way (list the folder to its last page: a folder comes five files at a
time, and the first pass over Sabra's stopped a page early and missed half
of it).

What keeps a photo out: a head too small to cut (under about 130 pixels),
something over the face (a hand on the jaw, a glass at the mouth), a profile,
blur, or black and white. A photo that shows a look somebody already has
from a better photo is not cut again: it is "another smile" below, and there
if a game wants that very picture.

**Bill** (3 in the Drive; `bill-1` to `bill-5` came earlier, by hand)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| `bill-3` | Grinning, outdoors, in the blue T-shirt | His base: **smile**, and every edit of him |
| "Bill and Branson" (`bill-branson-1`) | At a lookout in Hawaii, years ago: a moustache and no beard, mouth shut | **calm** |
| "Bill and Branson Hawaii" (`bill-branson-2`) | At breakfast, smiling | Not used: his head is 110 pixels |
| The Christmas one (`4976…`) | Chin on his hand, a closed-mouth smile, a moustache | Not used: his hand is over his jaw |
| `bill-1`, `bill-2` | Glaring down; side-eye | **glare**, **sideeye** (his own) |
| `bill-4`, `bill-5` | At night, full length; and from the side, in the dark | Not used: small, and dark |

(Branson is in both Hawaii photos as a teenager, with braces: there if a
game set back then wants him.)

**Stephanie** (7)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| The Gemini portrait (it is `WT1d-mom-smile`) | Smiling, in the garden | Her base: **smile**, and every edit of her |
| Two with a martini | Eyes up over the glass, mischievous | Not used: the glass is over her mouth and chin |
| Two at a fence with another woman | Arm in arm; and squaring up to each other | Not used: full length, a head of 70 pixels |
| In a kitchen, hair back | A closed-mouth smile | Not used: blurred |
| The round profile picture | Smiling | Not used: 150 pixels, and cropped to a circle |

**Chad** (5) and **Shane** (5)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| Chad "Media (5)" (`chad-3`) | Grinning | His base: **grin** (his own); his smile is the same photo made again by the generator |
| Chad "Media (6)" (`chad-1`) | Scowling, in hard light | **scowl** (his own) |
| Chad "Media (8)" (`chad-4`) | Laughing, darker hair | **joy** (his own) |
| Chad "Media (9)" (`chad-2`) | Smiling, in a jacket and tie | **angel** (his own) |
| Chad "Media (7)" | Smiling | Not used: black and white |
| Shane "Media (4)" (`shane-1`) | Beaming | His base: **beam** (his own); his smile is the same photo made again |
| Shane "Media (3)" (`shane-2`) | Calm, looking away, in a suit | **wary** (his own) |
| Shane "Media" (`shane-3`) | A crooked grin, head tipped | **smirk** (his own) |
| Shane "Media (2)" | A slight crooked smile, a grey shirt | Not cut: another smile |
| Shane "Media (1)" | In profile, forehead to forehead with somebody | Not used: a profile, and half hidden |

(`chad-5` to `chad-7` and `shane-4` to `shane-6` are not photos but the first
edits, and one other photo of Shane looking frightened; all are in their
sets: Chad's yell, cry and calm, Shane's startled, cry and doe eyes.)

**Christian** (5)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| `christian-1` (PXL_20260809) | Calm, indoors, a grey T-shirt | His base: **calm**, and the twelve edits that make up the rest of his fifteen |
| `christian-2` (PXL_20260908) | A broad smile, a green T-shirt | **smile**, and three edits of it that are his own: **yell2**, **dazed2**, **worried2** |
| `christian-3` (PXL_20260130) | Laughing, on a boat | **laugh** |
| `christian-4` (20211010) | A gentle, sleepy-eyed smile, a mustard jacket; 2021 | **gentle** (his own). Adobe could not find the face in it until its contrast was put right; the cutout has the photo's own colours. |
| `christian-5` (the screenshot) | Looking away, in profile | Not used: a profile |

**Branson** (7)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| `branson-1` (…110221) | A broad smile, on a street | His base: **smile**, and the thirteen edits of it |
| `branson-2` (…110245) | Laughing, eyes screwed up | **laugh** |
| `branson-3` (…105847) | Laughing, in a dinner jacket | Not cut: another laugh, and small |
| `branson-4` (…105811) | Smiling, younger, somebody beside him | Not cut: another smile |
| …105905 | Laughing, looking up and away | Not cut: another laugh, turned well away |
| …110117 | A grin, head right over to one side | Not cut: another smile, leaning a long way |
| …110150 | A grin, cheek to cheek with somebody | Not used: her head is against his |

**Shorty** (3)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| `shorty-1` (…110606) | Smiling, outdoors, a denim jacket | Her base: **smile**, and the fourteen edits of it (her hair runs out of the picture and over her shoulder, and is trimmed at her chin in all of them) |
| `shorty-3` (the cut-out one) | A pout, hands up by her head | **pout** (her own) |
| The studio portrait | Smiling over her shoulder, lighter hair | Not cut: another smile, turned well away |

**Mammy and Pappy** (5, most of the two of them)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| At Christmas | Both facing the camera; she has red hair | **The base for both.** Mammy (`mammy-1`): her portrait and every look are made from it, and its own face is her **photo**. Pappy (`pappy-2`): his portrait and every look are made from it |
| Indoors, he in a leaf-print shirt | He smiles with his mouth shut; she is in tinted glasses | **Pappy's photo** (his own; `pappy-1`). Mammy: not used, her eyes are hidden (`mammy-3`) |
| On a patio, with wine | Both smiling; she is blonde here | Not cut: another smile each (`mammy-2`, `pappy-3`) |
| A crowd, she in a wheelchair | He has sunglasses on and his tongue out; she is looking up at him | **Pappy's silly** (his own; `pappy-4`). Mammy: not used, in profile and in glasses |
| She alone, in a suede hat | A big smile; younger | Not cut: another smile, and a hat (`mammy-4`) |

**Nanner** (3)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| "Nanner and Brian" (`nanner-1`) | Smiling, at a wedding | Her base: her portrait and every look are made from it, and its own face is her **photo** |
| "Nanner Braces" (`nanner-2`) | A big grin, braces, a birthday tiara | Not cut: another smile, and the tiara |
| By the Christmas tree (`nanner-3`) | Smiling | Not cut: another smile, small and soft |

**Curt** (5, all with Kim)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| "good lighting" (`curt-1`) | Smiling, on a rooftop | **photo** (his own: Curt as he is now) |
| "accurate" (`curt-2`) | A broad open grin, sunglasses up on his head | **laugh** |
| "hat" | A grin under a sun hat | Not cut: another smile, and the hat |
| "wedding" | Years younger, a moustache, in a suit with a rose | **His base:** the owner made his portrait from it, and every look of his but the laugh is an edit of that |
| "Curt and Kim" | Shaved head, a closed-mouth smile | Not used: 90 pixels |

**Sabra** (4)

| Photo | What it shows | What became of it |
| --- | --- | --- |
| `sabra-3` (…5824) | A wide smile, close up, in a restaurant | Her base: her portrait and every look but calm are made from it, and its own face is her **photo** |
| `sabra-4` (…5726) | On a train, looking at her phone, mouth shut | **calm** |
| `sabra-1` (…4296) | Smiling back over her shoulder | Not cut: another smile, small and soft |
| `sabra-2` (…6146) | In profile, in a café | Not used: a profile |

**Roger** (5) and **The Grump** (4): every photo is cut, whole (`roger_happy`,
`roger_sit`, `roger_lie`, `roger_sleepy`, `roger_portrait`; `grump_eat`,
`grump_held`, `grump_asleep`, `grump_up`). **Sheeba** (4) are pictures of
other dogs, to describe her from.

What nobody's photos show, and so has to be generated for everybody who is
to have it: talking, smug, angry, yell, shocked, guilty, worried, cry, ouch,
dazed, disgusted, asleep. (People are photographed smiling.)

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

The back of a head is not asked for this way: see "The looks", above. (Bill's
is hung by the top of the collar, where a face is hung by the chin:
`build_back()` in `tools/make_heads.py`.)

(For Stephanie, "herself" for "himself".)

What each person is missing, and what could be done again from their base
photo so that it matches the rest:

| | Missing | Could be done again to match |
| --- | --- | --- |
| Bill | | yell (his is the "PAH", head tipped back). His calm is settled: the owner has chosen the Hawaii photo for it. |
| Stephanie | | yell and angry (hers are the "PAH" and the scolding) |
| Chad | | calm, yell, cry (his are from the earlier pictures: the same photo, framed closer) |
| Shane | | cry (his is from the earlier pictures) |
| Mammy | | the thirteen that came small, if there are full-size copies |
| Curt | | laugh (his is a photo of him as he is now; the rest are him years younger) |
| Sabra | | calm (hers is a photo of her looking away) |

(The faces that are a person's own, like the doe eyes, are not on this
list: nobody else is getting those for now.)
| Sherry | all fifteen, less the one the photo is, once there is a photo | |
| Branson | | dazed (his came small, and is soft) |
| Rick DeGour, Cindy, Betty | calm, smile, laugh, angry, shocked, cry, less the one the photo is | |
| Stephanie, Chad, Shane, Mammy, Pappy, Nanner, Curt, Sherry, Christian, Branson | the back of the head: waiting (see "The looks") | |

When they come back (a folder for each person in the owner's Drive, each
file called by the person and the look): each goes through Adobe and
`tools/make_cast.py` (`cutting.md`, "For everybody's faces"), which puts it
in the set, where every game can use it. Then `tools/test/faces.cjs` shows
the whole set in the game, and the catalogue is made again.
