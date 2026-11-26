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

**All of this game's own pictures are cut paper so far**, in `art.ts`, each
under the name its photo will have. What it borrows is already a photo: the
den, the front door from inside, Pappy and Mammy standing (all from "Pappy
comes home" and the workout tape), the street from the paper route, and
everybody's faces (Pappy's `pucker` for the kiss).

The prompts for its own are below. Each stands by itself and can go in one
batch. When they come back they go in `art-src/games/ride`, named by their
number (`RD1-kids.webp`), and `cut.py` cuts them.

| Prompt | What it is for | Takes the place of |
| --- | --- | --- |
| RD1 | Stephanie (holding the duck, and with her arms down) and Curt | `ride_steph_hold`, `ride_steph_stand`, `ride_curt_stand` |
| RD2 | Pappy in the van: waiting, winding up, kicking | `ride_pappy_wait`, `ride_pappy_ready`, `ride_pappy_kick` |
| RD3 | Pappy going in for a kiss, Pappy with the bottle up, Mammy with a glass | `ride_pappy_kiss`, `ride_pappy_bottle`, `ride_mammy_glass` |
| RD4 | The four dogs, sitting | `ride_dog0` to `ride_dog3`, and their heads out of the windows (`ride_dog0_head` ...) cut from the same |
| RD5 | Mr. Quacks, standing and flying | `ride_duck`, `ride_duck_fly`, `ride_duck_head` |
| RD6 | The van, from the side | `ride_van` |
| RD7 | Inside the van, the side door open | `ride_inside`, with its doorway cut out (by its place in the picture) so the forest shows through it |
| RD8 | The edge of town: the side of the road, and the forest, at night | `ride_forest` (the end of the drive, and through the door) |
| RD9 | Things: the sign, a dustbin, the champagne, a glass | `ride_sign` (lettered by the game), `ride_can`, `ride_bottle`, `ride_glass` |

Still cut from paper, and meant to be: the meter, the van's wheels (they
turn), the headlamp's beam, the sliding door from inside, the pothole, the
moon, the owl's eyes, the bits of rubbish, the cork and the fizz, and the
words.

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

**RD4. The dogs** (four on one sheet)

```text
Four photographs of four different scruffy mongrel dogs, side by side with wide clear gaps between them, on one plain flat light-grey studio background. Each sits up on its haunches with its body turned to the left of the picture and its head turned towards the camera, mouth open and tongue out, happy. First: a brown-and-white spaniel mix with floppy ears. Second: a black Labrador mix. Third: a small scruffy grey terrier with pricked ears and a beard. Fourth: a white dog with black spots and black floppy ears. Each whole dog is in frame, about the same size, nothing touching another. Soft even light, no shadows on the background. No text, no borders. Wide 16:9 image.
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
