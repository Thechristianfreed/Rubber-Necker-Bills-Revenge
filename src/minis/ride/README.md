# Take 'em for a ride

Curt and Stephanie bring home a houseful of dogs, and a duck; Pappy drives
them to the edge of town and kicks them out of the van, one at a time. Its
short name is `ride`.

## The story

In the owner's words (26 November 2026):

> Curt and Stephanie used to bring home all sorts of animals. Mostly dogs.
> And pappy would "take them for the ride". That is: drive them to the edge
> of town, kick the dogs out of the car, then drive away.
>
> Stephanie and Curt bring a bunch of dogs home, and one duck that Stephanie
> is carrying that Stephanie wouldn't leave alone no matter how much everyone
> told her to "leave those ducks alone". Stephanie, curt, pappy and mammy are
> in the entryway inside the house. Stephanie and Curt ask "can we keep em
> pop!?" Pappy says "of course!" Then tells Curt and Stephanie to go to bed.
> The two kids head off to bed leaving the animals in the room staring at
> Pappy. Mammy says to pappy "you know what to do...". Cut to pappy driving
> an old van with all the animals hanging out the window. Suggest some sort
> of driving gameplay here. After the gameplay the van makes it to the edge
> of town, then the van door slides open and the meter from the golf game
> appears on screen. The player must hit the sweet spot to successfully kick
> an animal out one at a time. Each time an animal flys out of the van pappy
> says something along the lines "and don't come back!" Pappy reenters the
> entryway of the house with mammy curt and Stephanie already standing in
> the house waiting for him. The kids ask "where did Fido and Mr Quacks go?"
> Pappy kisses Mammy as he says "they ran away." The kids cry and Mammy and
> Pappy celebrate by popping champagne and laughing.

Curt and Stephanie are brother and sister; Mammy and Pappy are their mother
and father. They are children here, with their faces as they are now (as
Chad and Shane are five-year-olds with theirs).

The places asked for: the entryway from "Pappy comes home", the neighborhood
from the paper route, and one new one, the edge of town: the side of the
road, and a barren, spooky forest.

**What is made up, and is the owner's to put right:** everything said that
the owner did not write ("NOW OFF TO BED, YOU TWO.", "NIGHT NIGHT, MR.
QUACKS.", "END OF THE LINE.", what Pappy says when he misses, "WELL. THAT'S
THAT.", "WAAAAAH!", "HA HA HA!", and all but the first "AND DON'T COME
BACK!"); that it is Mammy, then Curt, then Pappy who tell Stephanie to leave
those ducks alone, and that she hugs him tighter each time; that there are
four dogs and Fido is the brown and white one; the van's colors; the sign at
the edge of town ("NOW LEAVING TOWN", "COME BACK SOON!"); what is in the road
(dustbins, cones and potholes); and that it is night. All of the lines are
at the top of `RideMini.ts`.

**By itself:** https://claude.ai/artifact/7wco3WuX9fazQFSt7yjVdM (built with `node tools/make_preview.mjs <out>/ride.html --only ride`, and published from the same file each time, which keeps the address).

## How it plays

It is a story that waits for the player (`timed = false`): there is no
clock, and it always ends the same way.

**The front room** (the den, with the front door from inside on its wall,
both as "Pappy comes home" has them; Pappy and Mammy standing are that
game's photos, used as they are). Curt and Stephanie, four dogs, and Mr.
Quacks in Stephanie's arms. "CAN WE KEEP 'EM, POP?!" "OF COURSE!" Mammy,
Curt and Pappy each tell her to leave those ducks alone, and each time she
hugs him tighter ("QUACK!"). Off to bed: she puts him down ("NIGHT NIGHT,
MR. QUACKS."), and the two of them go. Every animal turns and looks at
Pappy. A cricket. Mammy: "YOU KNOW WHAT TO DO..."

**The drive.** The street from the paper route, at night, going by. The van
has Pappy at the wheel and every animal's head out of a window. Dustbins,
cones and potholes come down the road in one lane or the other: **tap to
swerve** into the other lane. Every one can be missed. Hitting one is no
loss: the van jolts, an animal yelps, a dustbin goes flying, and Pappy says
"WHOOPS." (the second time) and "HANG ON, FIDO!" (the fourth). A van along
the top shows how far it is to the edge of town. After about sixteen
seconds the houses stop and the forest starts, past the sign, and the van
pulls up.

**The kicks.** Inside the van, looking out of the side door. The door rolls
back on the dark forest (an owl's eyes blink in it). The meter is the one
from "FORE!", the same size and as fast: hold anywhere to wind up, and let go
in the green, which is somewhere different every time. In the green, BOOT:
the animal goes out of the door and away into the dark, and Pappy says
goodbye ("SO LONG, FIDO! AND DON'T COME BACK!", and so on; Mr. Quacks flaps
off last). Anywhere else, or held half a second past full, he misses
("WHIFF!"), it jumps the foot, and he tries again ("HOLD STILL, DAMMIT!").
When they are all gone the door rolls shut.

**Home again.** Mammy, Curt and Stephanie are waiting. "WHERE DID FIDO AND
MR. QUACKS GO?" Pappy kisses Mammy: "THEY RAN AWAY." The children cry, and
go on crying; Pappy pops the champagne, Mammy holds up a glass, and the two
of them laugh.

The two bots: the careful one dodges everything in the road and kicks each
one out first time. The careless one swerves late (and hits some of it), and
lets go far too soon the first time at each animal.

Tuning, at the top of `RideMini.ts`: what is in the road and when (`ROAD`),
how fast it goes and how long the town is (`SPEED`, `TOWN`), how quick a
swerve is (`SWERVE`), and the meter (`FILL`, `TOO_LONG`, `SWEET`; the size
of the green is `ZONE` in `art.ts`). Where things are on the page is
`layout.ts`.

## Pictures

**Every picture is a photo now**, but the few meant to stay paper. The owner
made RD1 to RD9 from the prompts below (26 November 2026, in his Drive folder
"Additional Home Movies Game Assets"), and `cut.py` cut them. They are kept
as they came in `art-src/games/ride`, with Adobe's answers beside them
(`-cutout.png`, the background off; `-headmask.png`, the head selected). What
went to Adobe is each person by themselves, cut off the sheet and made twice
the size (`PEOPLE` in `cut.py`; `cut.py send <folder>` writes them out
again), and the sheets of animals and things whole. RD7 and RD8 are places
and went nowhere: the doorway is cut out of RD7 by its corners (`DOORWAY` in
`cut.py`), and RD8 is the forest at the end of the drive (down to the road,
and turned round beside itself so that it repeats with no seam) and, whole,
what is seen through the door.

**Roger is one of the dogs** (the owner's wish), from the family's own
photos, which were already in the game: sitting is the common picture
`roger-sit` as it is, registered under this game's own name; his head out of
the window, tongue out, is cut by `cut.py` from Adobe's cutout of
`roger-happy` (read from the common pictures, not changed). He goes fourth:
"SEE YA, ROGER! AND DON'T COME BACK!" (made up). Fido is the black dog. RD4b,
a golden retriever to go with the highway's, was not needed and not made.

Where a photo has taken a stand-in's place, its numbers (where a chin goes,
the toe of the kicking foot, the neck of the bottle, the van's windows and
lamp, the sign's green, the doorway and the bench) are written by `cut.py`
into `cut.ts`, and `layout.ts` and the game hand over whichever is on the
page. The paper stand-ins are all still in `art.ts`: a page that cannot fetch
its pictures plays in paper.

| Prompt | What it is in the game |
| --- | --- |
| RD1 | `ride_steph_hold` (Mr. Quacks in her arms is in the picture: his own photo waits until she puts him down), `ride_steph_stand`, `ride_curt_stand`, heads off |
| RD2 | `ride_pappy_wait`, `ride_pappy_ready`, `ride_pappy_kick`, heads off |
| RD3 | `ride_pappy_kiss`, `ride_pappy_bottle`, `ride_mammy_glass`, heads off; the bottle and the glass are in their hands in the pictures |
| RD4 | `ride_dog0` (Fido), `ride_dog1`, `ride_dog2`, and each one's head for a window (an oval round it: `DOG_HEADS`) |
| RD5 | `ride_duck`, `ride_duck_fly`, `ride_duck_head` |
| RD6 | `ride_van` (its glass sealed where the background came through). Its own wheels: the paper ones that turn are left off. |
| RD7 | `ride_inside`, the doorway cut out |
| RD8 | `ride_forest` (a strip) and `ride_edge` (whole) |
| RD9 | `ride_sign` (lettered "NOW LEAVING TOWN" by the game, in its green), `ride_can`, and `ride_bottle` and `ride_glass` (which only paper people need) |

How they came: RD2, RD3 and RD5 are photos stitched side by side, and the men
in RD2 and RD3 are not dressed alike (a track jacket, then a Harrington):
their heads are Pappy's own either way. RD3's kiss is arms open rather than
leaning in, and Mammy's glass is a flute.

**The sliding door** is made out of RD7 too, so that it is the same wood in
the same light (`slider()` in `cut.py`): the wall with the window in it, over
the panelling under the chrome strip, as big as the doorway, a little darker
at its edges, with a handle. It rolls back off the doorway at the start, and
shut again at the end.

**Mr. Quacks in Stephanie's arms** is his own photo, in front of her and under
her chin (`DUCK_HELD` in `RideMini.ts`): the duck in her picture has his head
up beside her face, and her face (hung on at the chin, and bigger than the
girl's own) covered him.

**Pappy's head in the van** is put further back on his shoulders than the
chin of the man in RD2 (`HEAD_BACK`): that man was looking down at the floor,
with his chin forward, and Pappy's own face looks straight out.

Still cut from paper, and meant to be: the meter, the headlamp's beam, the
pothole, the moon over the town, the owl's eyes, the bits of rubbish, the
cork and the fizz, and the words.

### The prompts

**RD1. Stephanie and Curt** (three on one sheet)

```text
Three full-length photographs of children, side by side with wide clear gaps between them, on one plain flat light-grey studio background, about 1975. First: a girl of about eight in a yellow dress with a white collar, white ankle socks and white shoes, standing facing the camera and hugging a white farmyard duck to her chest with both arms; the duck's head is turned to the side, well clear of her face and neck. Second: the same girl, standing facing the camera with her arms by her sides. Third: a boy of about ten in a red-and-white horizontally striped T-shirt, blue jeans and white trainers, standing facing the camera with his arms by his sides. Their whole bodies are in frame from head to feet, and nothing covers their heads or necks. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**RD2. Pappy in the van** (three on one sheet)

```text
Three full-length photographs of the same older man, side by side with wide clear gaps between them, on one plain flat light-grey studio background. He wears a red zip-up jacket over a white shirt, grey trousers and white trainers. His body is turned towards the left of the picture in all three. First: standing with his feet apart and his hands on his hips, leaning forward a little, looking down at something at his feet. Second: standing on his right leg with his left knee drawn up and back behind him, winding up to kick, arms out for balance. Third: kicking: his left leg shot out straight in front of him to the left at hip height, sole of the shoe forward, leaning back, arms flung out. His whole body is in frame from head to feet in every one, and nothing covers his head or neck. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**RD3. Pappy and Mammy celebrating** (three on one sheet)

```text
Three full-length photographs side by side with wide clear gaps between them, on one plain flat light-grey studio background. First: an older man in a red zip-up jacket over a white shirt, grey trousers and white trainers, turned to the right of the picture and leaning in with his arms open, about to kiss somebody on the cheek. Second: the same man facing the camera, holding a bottle of champagne up high in his right hand, the bottle tipped over, his left hand down by his side. Third: a grandmother in a quilted leopard-print knee-length housecoat with a white collar and red fluffy slippers, facing the camera, holding a champagne glass up in her right hand, her left hand on her hip. Their whole bodies are in frame from head to feet, their hair is clear of their necks, and nothing covers their heads or necks. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**The dogs there are already.** Two of the four can come from pictures the
game has. The golden retriever made for the highway (`E`, a stand-in for
Lady) has a happy head, tongue out and ears blowing back (`dog`), which is a
head out of a van window as it is; RD4b makes the rest of the same dog.
Roger, Branson and Shorty's doodle, is cut from the family's own photos: one
of him sitting (`roger_sit`), and his head and chest (`roger_portrait`) for
the window. Whether Roger is one of the dogs that gets the boot is the
owner's to say; RD4 has three new dogs, so that there are four without him.

**RD4. Three more dogs** (three on one sheet)

```text
Three photographs of three different scruffy mongrel dogs, side by side with wide clear gaps between them, on one plain flat light-grey studio background. Each sits up on its haunches with its body turned to the left of the picture and its head turned towards the camera, mouth open and tongue out, happy. First: a black Labrador mix. Second: a small scruffy grey terrier with pricked ears and a beard. Third: a white dog with black spots and black floppy ears. Each whole dog is in frame, about the same size, nothing touching another. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**RD4b. The golden retriever, whole** (an edit: attach `art-src/generated/E-dog.png`)

```text
Edit this picture. Keep the left-hand dog exactly as it is: the same golden retriever, the same face, fur and colour, the same open mouth with its tongue out, and the same light. Now show the whole of this dog, sitting up on its haunches, its body turned towards the left of the picture and its head turned just as it is. Take away the right-hand dog. The whole dog is in frame, on the same plain flat light-grey background, with no shadows on it. No text, no borders. Wide 16:9 image.
```

**RD5. Mr. Quacks** (two on one sheet)

```text
Two photographs of the same white farmyard duck with an orange bill and orange feet, side by side with a wide clear gap between them, on one plain flat light-grey studio background. First: standing, side on, facing the left of the picture. Second: flying away from the camera and to the left, wings spread wide and up. The whole duck is in frame in both. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

**RD6. The van**

```text
A photograph of an old 1970s American full-size van, seen exactly side on, facing the right of the picture, on a plain flat light-grey studio background. Two-tone paint: brown along the bottom and cream on top, with an orange stripe between. Three square side windows wound all the way down (open, no glass), a sliding side door shut, chrome bumpers, a round headlamp. The whole van is in frame, wheels and all. Soft even light, no shadows on the background. No text, no number plate, no borders. Wide 16:9 image.
```

**RD7. Inside the van, the side door open**

```text
A photograph from inside an old 1970s van, looking straight across at its open sliding side door, at night. The door is slid all the way back and out of sight, and the doorway is a tall square opening on the left half of the picture, from the floor of the van to near its ceiling. Inside: dark wood panelling on the walls, orange shag carpet on the floor, a cream vinyl ceiling with a dome light on, and a brown vinyl bench seat along the back on the right of the picture with a small window over it. Through the doorway, the dark: bare dead trees and mist. Nobody in the picture. No text. Wide 16:9 image.
```

**RD8. The edge of town** (the new place)

```text
A wide photograph of the edge of a small American town at night, from the far side of the road, looking across at the roadside: a strip of gravel and dead grass along the edge of the tarmac, and behind it a barren, spooky forest of tall bare dead trees with twisted branches, mist lying low between their trunks, a full moon behind thin cloud, everything blue-black and grey. No houses, no lights, no signs, no people, no animals. The ground runs straight across the whole picture near the bottom. No text. Very wide 21:9 image.
```

**RD9. Things** (four on one sheet)

```text
Four things photographed side by side with wide clear gaps between them, on one plain flat light-grey studio background, about 1975. First: a green American road sign on two metal posts, blank, with a white border and no words. Second: a galvanized metal dustbin with its lid on. Third: a bottle of champagne with gold foil on its neck and a plain cream label with no words on it. Fourth: an empty champagne glass, the wide shallow coupe kind. Each whole thing is in frame, standing upright. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
```

### Faces

Everybody's own, from their set (`docs/characters.md`): Curt and
Stephanie's smile, talking, laugh, worried and cry; Pappy's calm, smile,
talking, worried, smug, angry, yell, laugh and `pucker`; Mammy's calm, yell,
angry, smug, smile and laugh. Nothing new is needed. (Curt's and
Stephanie's are them grown up: a photo of either of them as a child, if
there is one, would be a face of its own for this game.)

## Sound

All of it is made up from notes and hisses, in `sounds.ts`. Nobody has heard
any of it: whether a sound is the right sound is for the owner to say, in
the preview. A real "and don't come back!" from somebody in the family would
go in as `public/sfx/ride-dontcomeback.mp3`.

How loud each came out is measured with `tools/test/listen.cjs` (they are
reached as `window.__ride.bark()` and so on): see the table below.

On the effects channel, where the mouth "bonk" reads 0.19 (each measured by its loudest 46 ms):

| Sound | When | Loudest 46 ms |
| --- | --- | --- |
| `bark` | a dog, barking (each one, coming home and going to the door) | 0.12 |
| `yip` | a dog, bumped or booted | 0.12 |
| `quack` | Mr. Quacks | 0.11 |
| `yay` | Curt and Stephanie, delighted | 0.17 |
| `wah` | ...and heartbroken | 0.13 |
| `cricket` | the quiet, while the animals stare (meant to be faint) | 0.07 |
| `start` | the van starting | 0.12 |
| `engine` | the van going (under everything, while it drives) | 0.07 |
| `brake` | pulling up at the edge of town | 0.10 |
| `crash` | a dustbin, hit (with the game's own `clang`) | 0.16 |
| `thud` | a pothole | 0.25 |
| `slide` | the side door, rolled back and shut | 0.17 |
| `boot` | a kick that lands | 0.25 |
| `away` | something going a long way off into the dark | 0.15 |
| `kiss` | a kiss for Mammy | 0.16 |
| `pop` | the cork | 0.17 |
| `haha` | Mammy and Pappy, laughing | 0.12 |

Borrowed as they are from the game's own sound: `dodge` (a swerve, and a kick that misses), `tick` (the meter filling), `clang`.
