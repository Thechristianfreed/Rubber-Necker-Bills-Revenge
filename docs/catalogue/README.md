# The catalogue

Every picture the game has, by the name a game calls it by. **Made by `tools/test/catalogue.cjs`: do not edit by hand.** Run it again when pictures are added. How to use what is here: `docs/pictures.md`.

The size is how big the picture is drawn, in the game's own pixels (the page is 540 of them tall). A strip repeats to fill a width. The file is the finished cutout the picture is made from; one with no file is cut from paper, in code.

- [Places](#places) (52)
- [Things](#things) (51)
- [Cars](#cars) (22)
- [People: bodies](#bodies) (77)
- [People: faces](#faces) (32)
- [People: everybody's faces](#cast) (206)
- [The rubberneckers, and the animals](#gawkers) (51)
- [Effects](#effects) (25)
- [Words on bursts](#words) (57)
- [The interface](#interface) (26)
- [The quick game "golf"](#game-golf) (68)

<a id="places"></a>

## Places

Backdrops, and the strips some of them are made of. Each place is laid with one call: `src/minis/shared/places.ts`.

![Places, sheet 1](places-1.jpg)

![Places, sheet 2](places-2.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `asphalt` | 192 x 192 | strip | `src/assets/scrap/asphalt.jpg` |
| `cloud` | 150 x 64 |  | paper |
| `den` | 1760 x 645 | strip | `src/assets/scrap/den.jpg` |
| `den_carpet` | 64 x 64 |  | paper |
| `den_wall` | 64 x 64 |  | paper |
| `fence` | 186 x 40 | strip | `src/assets/scrap/fence.webp` |
| `grass` | 64 x 72 |  | paper |
| `gym` | 2048 x 645 | strip | `src/assets/scrap/gym.jpg` |
| `gym_banner` | 250 x 70 |  | paper |
| `gym_floor` | 128 x 64 |  | paper |
| `gym_wall` | 96 x 64 |  | paper |
| `hall_floor` | 1336 x 201 |  | paper |
| `hall_wall` | 64 x 112 |  | paper |
| `hallway` | 1337 x 573 | strip | `src/assets/scrap/hallway.jpg` |
| `hills` | 512 x 130 |  | paper |
| `houses` | 2660 x 352 | strip | `src/assets/scrap/houses.jpg` |
| `kerb` | 64 x 11 |  | paper |
| `lawn` | 64 x 62 |  | paper |
| `line_white` | 64 x 6 |  | paper |
| `line_yellow` | 64 x 5 |  | paper |
| `locker_open` | 106 x 339 |  | paper |
| `lockers` | 120 x 323 |  | paper |
| `postcard` | 1257 x 216 | strip | `src/assets/scrap/postcard.jpg` |
| `rail` | 347 x 30 | strip | `src/assets/scrap/rail.webp` |
| `rec_couch` | 320 x 130 |  | paper |
| `rec_door` | 96 x 200 |  | paper |
| `rec_door_open` | 96 x 200 |  | paper |
| `rec_dot` | 10 x 10 |  | paper |
| `rec_floor` | 64 x 170 |  | paper |
| `rec_lamp` | 70 x 230 |  | paper |
| `rec_wall` | 64 x 466 |  | paper |
| `rec_window` | 120 x 96 |  | paper |
| `sand_close` | 520 x 260 | strip | `src/assets/scrap/sand-close.jpg` |
| `sandbox` | 400 x 120 |  | paper |
| `sandbox_front` | 400 x 26 |  | paper |
| `sandbox_near` | 430 x 71 |  | `src/assets/scrap/sand-box-near.webp` |
| `sandbox_photo` | 430 x 300 |  | `src/assets/scrap/sand-box.webp` |
| `sidewalk` | 192 x 96 | strip | `src/assets/scrap/concrete.jpg` |
| `skydots` | 14 x 210 |  | paper |
| `sun` | 66 x 66 |  | paper |
| `tape_room` | 303 x 227 | strip | `src/assets/scrap/tape-room.jpg` |
| `tv_lines` | 4 x 4 |  | paper |
| `tv_set` | 440 x 432 |  | `src/assets/scrap/tv-set.webp` |
| `tv_snow` | 128 x 128 |  | paper |
| `yard_cloud` | 130 x 54 |  | paper |
| `yard_fence` | 96 x 150 |  | paper |
| `yard_grass` | 128 x 64 |  | paper |
| `yard_ground` | 2392 x 323 | strip | `src/assets/scrap/yard-ground.webp` |
| `yard_house` | 470 x 476 |  | `src/assets/scrap/yard-house.webp` |
| `yard_sky` | 64 x 64 |  | paper |
| `yard_sky_photo` | 2392 x 361 | strip | `src/assets/scrap/yard-sky.jpg` |
| `yard_sun` | 90 x 90 |  | paper |

<a id="things"></a>

## Things

What can be put in a place, picked up, thrown or broken.

![Things, sheet 1](things-1.jpg)

![Things, sheet 2](things-2.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `armphone` | 54 x 59 |  | `src/assets/scrap/hand-phone.webp` |
| `bake_table` | 250 x 120 |  | `src/assets/scrap/gym-table.webp` |
| `bat` | 84 x 18 |  | paper |
| `billboard0` | 123 x 152 |  | `src/assets/scrap/billboard.webp` |
| `billboard1` | 123 x 152 |  | `src/assets/scrap/billboard.webp` |
| `birdhouse` | 62 x 62 |  | `src/assets/scrap/birdhouse.webp` |
| `bleachers` | 380 x 183 |  | `src/assets/scrap/gym-bleachers.webp` |
| `blob` | 18 x 12 |  | `src/assets/scrap/blob.webp` |
| `book` | 84 x 108 |  | `src/assets/scrap/book.webp` |
| `cal_page` | 104 x 110 |  | paper |
| `cassette` | 200 x 70 |  | paper |
| `cone` | 19 x 33 |  | `src/assets/scrap/cone.webp` |
| `crack` | 130 x 44 |  | paper |
| `cupcake` | 26 x 28 |  | paper |
| `hand_grab` | 151 x 430 |  | `src/assets/scrap/hand-grab.webp` |
| `hand_throw` | 340 x 138 |  | `src/assets/scrap/hand-throw.webp` |
| `hoop` | 170 x 340 |  | `src/assets/scrap/gym-hoop.webp` |
| `jar` | 53 x 86 |  | `src/assets/scrap/jar.webp` |
| `mailbox0` | 55 x 88 |  | `src/assets/scrap/mailbox-silver.webp` |
| `mailbox0_hit` | 65 x 93 |  | `src/assets/scrap/mailbox-silver-hit.webp` |
| `mailbox1` | 55 x 88 |  | `src/assets/scrap/mailbox-red.webp` |
| `mailbox1_hit` | 65 x 93 |  | `src/assets/scrap/mailbox-red-hit.webp` |
| `palm` | 66 x 172 |  | `src/assets/scrap/palm.webp` |
| `paper_roll` | 30 x 12 |  | `src/assets/scrap/paper-roll.webp` |
| `phone` | 7 x 26 |  | `src/assets/scrap/phone.webp` |
| `phone_glow` | 60 x 60 |  | paper |
| `plank` | 64 x 12 |  | paper |
| `rock` | 30 x 24 |  | paper |
| `sand_blob` | 66 x 41 |  | `src/assets/scrap/sand-heap.webp` |
| `sand_bucket` | 31 x 36 |  | `src/assets/scrap/sand-bucket.webp` |
| `sand_clump` | 30 x 19 |  | `src/assets/scrap/sand-heap.webp` |
| `sand_heap` | 66 x 41 |  | `src/assets/scrap/sand-heap.webp` |
| `sand_pile` | 250 x 157 |  | `src/assets/scrap/sand-heap.webp` |
| `sand_shovel` | 27 x 50 |  | `src/assets/scrap/sand-shovel.webp` |
| `sand_speck` | 13 x 8 |  | `src/assets/scrap/sand-heap.webp` |
| `sandcastle` | 39 x 52 |  | `src/assets/scrap/sand-castle.webp` |
| `shake` | 53 x 104 |  | `src/assets/scrap/shake.webp` |
| `sign0` | 87 x 167 |  | `src/assets/scrap/sign.webp` |
| `sign1` | 87 x 167 |  | `src/assets/scrap/sign.webp` |
| `splat0` | 120 x 124 |  | `src/assets/scrap/splat0.webp` |
| `splat1` | 120 x 131 |  | `src/assets/scrap/splat1.webp` |
| `splat2` | 120 x 124 |  | `src/assets/scrap/splat2.webp` |
| `splat3` | 120 x 125 |  | `src/assets/scrap/splat3.webp` |
| `switch_off` | 22 x 34 |  | paper |
| `switch_on` | 22 x 34 |  | paper |
| `tree` | 370 x 341 |  | `src/assets/scrap/tree.webp` |
| `yard_bush` | 139 x 112 |  | `src/assets/scrap/yard-bush.webp` |
| `yard_line` | 254 x 205 |  | `src/assets/scrap/yard-line.webp` |
| `yard_pool` | 200 x 79 |  | `src/assets/scrap/yard-pool.webp` |
| `yard_swing` | 239 x 240 |  | `src/assets/scrap/yard-swing.webp` |
| `yard_tree` | 271 x 310 |  | `src/assets/scrap/yard-tree.webp` |

<a id="cars"></a>

## Cars

From the highway. A photo one and a paper one of most.

![Cars](cars.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `bug` | 270 x 103 |  | `src/assets/scrap/bug.webp` |
| `bus` | 444 x 126 |  | paper |
| `bus_photo` | 404 x 144 |  | `src/assets/scrap/bus.webp` |
| `pickup_blue` | 232 x 78 |  | `src/assets/scrap/pickup-blue.webp` |
| `pickup_mustard` | 232 x 78 |  | `src/assets/scrap/pickup-mustard.webp` |
| `pickup0` | 234 x 92 |  | paper |
| `pickup1` | 234 x 92 |  | paper |
| `sedan_blue` | 236 x 68 |  | `src/assets/scrap/sedan-blue.webp` |
| `sedan_green` | 236 x 68 |  | `src/assets/scrap/sedan-green.webp` |
| `sedan_red` | 236 x 68 |  | `src/assets/scrap/sedan-red.webp` |
| `sedan0` | 212 x 90 |  | paper |
| `sedan1` | 212 x 90 |  | paper |
| `sedan2` | 212 x 90 |  | paper |
| `sedan3` | 212 x 90 |  | paper |
| `sedan4` | 212 x 90 |  | paper |
| `van_blue` | 218 x 97 |  | `src/assets/scrap/van-blue.webp` |
| `van_green` | 218 x 97 |  | `src/assets/scrap/van-green.webp` |
| `van0` | 228 x 106 |  | paper |
| `van1` | 228 x 106 |  | paper |
| `wagon` | 226 x 90 |  | paper |
| `wagon_photo` | 240 x 74 |  | `src/assets/scrap/wagon.webp` |
| `wreck` | 420 x 176 |  | paper |

<a id="bodies"></a>

## People: bodies

Each is one pose. The family's have no heads: a face is hung on by the chin (`docs/characters.md`).

![People: bodies, sheet 1](bodies-1.jpg)

![People: bodies, sheet 2](bodies-2.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `alex_dad` | 130 x 250 |  | paper |
| `batmom_akimbo` | 88 x 182 |  | `src/assets/scrap/batmom-akimbo.webp` |
| `bill_rest` | 123 x 186 |  | `src/assets/scrap/bill-rest.webp` |
| `bill_swing` | 159 x 177 |  | `src/assets/scrap/bill-swing.webp` |
| `bill_windup` | 161 x 216 |  | `src/assets/scrap/bill-windup.webp` |
| `chad_bucket` | 70 x 68 |  | `src/assets/scrap/chad-bucket.webp` |
| `chad_dig` | 68 x 75 |  | `src/assets/scrap/chad-dig.webp` |
| `chad_down` | 48 x 113 |  | `src/assets/scrap/chad-down.webp` |
| `chad_hide` | 43 x 116 |  | `src/assets/scrap/chad-hide.webp` |
| `chad_mad` | 55 x 141 |  | `src/assets/scrap/chad-mad.webp` |
| `chad_run1` | 87 x 131 |  | `src/assets/scrap/chad-run1.webp` |
| `chad_run2` | 59 x 135 |  | `src/assets/scrap/chad-run2.webp` |
| `chad_shoved` | 71 x 132 |  | `src/assets/scrap/chad-shoved.webp` |
| `chad_stance` | 61 x 112 |  | `src/assets/scrap/chad-stance.webp` |
| `chad_stand` | 39 x 117 |  | `src/assets/scrap/chad-stand.webp` |
| `chad_swing` | 93 x 112 |  | `src/assets/scrap/chad-swing.webp` |
| `chad_wail` | 65 x 111 |  | `src/assets/scrap/chad-wail.webp` |
| `cheer_fingers` | 121 x 207 |  | `src/assets/scrap/cheer-fingers.webp` |
| `cheer_flurry` | 169 x 203 |  | `src/assets/scrap/cheer-flurry.webp` |
| `cheer_fly` | 233 x 236 |  | `src/assets/scrap/cheer-fly.webp` |
| `cheer_kick` | 146 x 272 |  | `src/assets/scrap/cheer-kick.webp` |
| `cheer_ko` | 228 x 79 |  | `src/assets/scrap/cheer-ko.webp` |
| `cheer_plead` | 67 x 202 |  | `src/assets/scrap/cheer-plead.webp` |
| `cheer_ready` | 120 x 199 |  | `src/assets/scrap/cheer-ready.webp` |
| `dj_asleep` | 300 x 120 |  | paper |
| `dj_awake` | 300 x 120 |  | paper |
| `kid_christian` | 130 x 210 |  | paper |
| `kid_duck` | 257 x 203 |  | `src/assets/scrap/kid-duck.webp` |
| `kid_forrest` | 110 x 210 |  | paper |
| `kid_neil` | 110 x 210 |  | paper |
| `kid_rest` | 257 x 229 |  | `src/assets/scrap/kid-rest.webp` |
| `kid_swing` | 257 x 225 |  | `src/assets/scrap/kid-swing.webp` |
| `kid_windup` | 257 x 257 |  | `src/assets/scrap/kid-windup.webp` |
| `mailman` | 72 x 138 |  | `src/assets/scrap/mailman.webp` |
| `mailman_mad` | 63 x 136 |  | `src/assets/scrap/mailman-mad.webp` |
| `mom_below` | 361 x 720 |  | `src/assets/scrap/mom-below.webp` |
| `mom_forearm` | 47 x 191 |  | `src/assets/scrap/mom-forearm.webp` |
| `neil_arm` | 110 x 130 |  | paper |
| `pair_hug` | 63 x 116 |  | `src/assets/scrap/pair-hug.webp` |
| `pair_side` | 75 x 115 |  | `src/assets/scrap/pair-side.webp` |
| `pose_bill_frog` | 112 x 118 |  | `src/assets/scrap/pose-bill-frog.webp` |
| `pose_bill_kick` | 209 x 107 |  | `src/assets/scrap/pose-bill-kick.webp` |
| `pose_bill_lunge` | 167 x 178 |  | `src/assets/scrap/pose-bill-lunge.webp` |
| `pose_bill_pretzel` | 187 x 94 |  | `src/assets/scrap/pose-bill-pretzel.webp` |
| `pose_bill_ready` | 96 x 173 |  | `src/assets/scrap/pose-bill-ready.webp` |
| `pose_bill_stretch` | 67 x 285 |  | `src/assets/scrap/pose-bill-stretch.webp` |
| `pose_mom_frog` | 116 x 117 |  | `src/assets/scrap/pose-mom-frog.webp` |
| `pose_mom_kick` | 182 x 106 |  | `src/assets/scrap/pose-mom-kick.webp` |
| `pose_mom_lunge` | 165 x 175 |  | `src/assets/scrap/pose-mom-lunge.webp` |
| `pose_mom_pretzel` | 174 x 92 |  | `src/assets/scrap/pose-mom-pretzel.webp` |
| `pose_mom_ready` | 94 x 170 |  | `src/assets/scrap/pose-mom-ready.webp` |
| `pose_mom_stretch` | 65 x 279 |  | `src/assets/scrap/pose-mom-stretch.webp` |
| `rival_arm0` | 182 x 354 |  | `src/assets/scrap/rival-arm0.webp` |
| `rival_arm1` | 203 x 356 |  | `src/assets/scrap/rival-arm1.webp` |
| `rival_arm2` | 203 x 356 |  | `src/assets/scrap/rival-arm2.webp` |
| `rival_arm3` | 163 x 382 |  | `src/assets/scrap/rival-arm3.webp` |
| `rival_charge` | 118 x 287 |  | `src/assets/scrap/rival-charge.webp` |
| `rival_flick` | 222 x 346 |  | `src/assets/scrap/rival-flick.webp` |
| `rival_flinch` | 127 x 287 |  | `src/assets/scrap/rival-flinch.webp` |
| `rival_hulk` | 172 x 356 |  | `src/assets/scrap/rival-hulk.webp` |
| `rival_point` | 151 x 286 |  | `src/assets/scrap/rival-point.webp` |
| `rival_walk` | 123 x 283 |  | `src/assets/scrap/rival-walk.webp` |
| `rival_win` | 120 x 344 |  | `src/assets/scrap/rival-win.webp` |
| `shane_above` | 382 x 640 |  | `src/assets/scrap/shane-above.webp` |
| `shane_bawl` | 47 x 117 |  | `src/assets/scrap/shane-bawl.webp` |
| `shane_good` | 46 x 116 |  | `src/assets/scrap/shane-good.webp` |
| `shane_laugh` | 60 x 115 |  | `src/assets/scrap/shane-laugh.webp` |
| `shane_ow` | 90 x 114 |  | `src/assets/scrap/shane-ow.webp` |
| `shane_punch` | 75 x 121 |  | `src/assets/scrap/shane-punch.webp` |
| `shane_push` | 90 x 117 |  | `src/assets/scrap/shane-push.webp` |
| `shane_reach` | 58 x 114 |  | `src/assets/scrap/shane-reach.webp` |
| `shane_run1` | 93 x 107 |  | `src/assets/scrap/shane-run1.webp` |
| `shane_run2` | 66 x 111 |  | `src/assets/scrap/shane-run2.webp` |
| `shane_throw` | 80 x 125 |  | `src/assets/scrap/shane-throw.webp` |
| `teen_rest` | 393 x 305 |  | `src/assets/scrap/teen-rest.webp` |
| `teen_swing` | 300 x 342 |  | `src/assets/scrap/teen-swing.webp` |
| `teen_windup` | 482 x 218 |  | `src/assets/scrap/teen-windup.webp` |

<a id="faces"></a>

## People: faces

The family's heads. Who has which look, and which are missing, is in `docs/characters.md`.

![People: faces](faces.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `bill_hold` | 72 x 96 |  | `src/assets/scrap/billface-hold.webp` |
| `bill_in` | 72 x 97 |  | `src/assets/scrap/billface-in.webp` |
| `bill_pah` | 72 x 103 |  | `src/assets/scrap/billface-pah.webp` |
| `bill-back` | 205 x 274 |  | `src/assets/bill/head-back.webp` |
| `bill-glare` | 186 x 248 |  | `src/assets/bill/head-glare.webp` |
| `bill-grin` | 196 x 248 |  | `src/assets/bill/head-grin.webp` |
| `bill-sideeye` | 190 x 248 |  | `src/assets/bill/head-sideeye.webp` |
| `chadbighead_set` | 181 x 283 |  | `src/assets/scrap/chadface-set-big.webp` |
| `chadbighead_yell` | 183 x 318 |  | `src/assets/scrap/chadface-yell-big.webp` |
| `chadhead_angel` | 44 x 63 |  | `src/assets/scrap/chadface-smile.webp` |
| `chadhead_cry` | 44 x 67 |  | `src/assets/scrap/chadface-cry.webp` |
| `chadhead_glee` | 41 x 62 |  | `src/assets/scrap/chadface-grin.webp` |
| `chadhead_joy` | 42 x 63 |  | `src/assets/scrap/chadface-laugh.webp` |
| `chadhead_mad` | 46 x 63 |  | `src/assets/scrap/chadface-scowl.webp` |
| `chadhead_sad` | 46 x 63 |  | `src/assets/scrap/chadface-scowl.webp` |
| `chadhead_set` | 40 x 63 |  | `src/assets/scrap/chadface-set.webp` |
| `chadhead_yell` | 41 x 70 |  | `src/assets/scrap/chadface-yell.webp` |
| `mom_big_scold` | 271 x 299 |  | `src/assets/scrap/mom-scold.webp` |
| `mom_hold` | 102 x 115 |  | `src/assets/scrap/mom-hold.webp` |
| `mom_in` | 102 x 116 |  | `src/assets/scrap/mom-in.webp` |
| `mom_pah` | 102 x 116 |  | `src/assets/scrap/mom-pah.webp` |
| `mom_scold` | 104 x 115 |  | `src/assets/scrap/mom-scold.webp` |
| `mom_smile` | 102 x 116 |  | `src/assets/scrap/mom-smile.webp` |
| `shanebighead_cry` | 179 x 281 |  | `src/assets/scrap/shaneface-cry-big.webp` |
| `shanebighead_doe` | 189 x 285 |  | `src/assets/scrap/shaneface-doe-big.webp` |
| `shanehead_cry` | 40 x 62 |  | `src/assets/scrap/shaneface-cry.webp` |
| `shanehead_doe` | 42 x 63 |  | `src/assets/scrap/shaneface-doe.webp` |
| `shanehead_grin` | 42 x 62 |  | `src/assets/scrap/shaneface-smirk.webp` |
| `shanehead_ow` | 40 x 63 |  | `src/assets/scrap/shaneface-scared.webp` |
| `shanehead_scared` | 40 x 63 |  | `src/assets/scrap/shaneface-scared.webp` |
| `shanehead_sweet` | 39 x 62 |  | `src/assets/scrap/shaneface-beam.webp` |
| `shanehead_tongue` | 39 x 62 |  | `src/assets/scrap/shaneface-beam.webp` |

<a id="cast"></a>

## People: everybody's faces

One set for each of the family, every look the same size and hung from the same chin: `head(scene, 'chad', 'guilty', x, y, 62)` in `src/minis/shared/people.ts`. Who has which is in `docs/characters.md`.

![People: everybody's faces, sheet 1](cast-1.jpg)

![People: everybody's faces, sheet 2](cast-2.jpg)

![People: everybody's faces, sheet 3](cast-3.jpg)

![People: everybody's faces, sheet 4](cast-4.jpg)

![People: everybody's faces, sheet 5](cast-5.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `face_bill_angry` | 62 x 81 |  | `src/assets/scrap/face-bill-angry.webp` |
| `face_bill_asleep` | 62 x 82 |  | `src/assets/scrap/face-bill-asleep.webp` |
| `face_bill_calm` | 56 x 82 |  | `src/assets/scrap/face-bill-calm.webp` |
| `face_bill_cry` | 62 x 82 |  | `src/assets/scrap/face-bill-cry.webp` |
| `face_bill_dazed` | 62 x 82 |  | `src/assets/scrap/face-bill-dazed.webp` |
| `face_bill_disgusted` | 62 x 82 |  | `src/assets/scrap/face-bill-disgusted.webp` |
| `face_bill_glare` | 62 x 90 |  | `src/assets/scrap/face-bill-glare.webp` |
| `face_bill_guilty` | 62 x 81 |  | `src/assets/scrap/face-bill-guilty.webp` |
| `face_bill_hold` | 63 x 84 |  | `src/assets/scrap/face-bill-hold.webp` |
| `face_bill_inhale` | 63 x 85 |  | `src/assets/scrap/face-bill-inhale.webp` |
| `face_bill_laugh` | 62 x 84 |  | `src/assets/scrap/face-bill-laugh.webp` |
| `face_bill_ouch` | 62 x 82 |  | `src/assets/scrap/face-bill-ouch.webp` |
| `face_bill_shocked` | 62 x 84 |  | `src/assets/scrap/face-bill-shocked.webp` |
| `face_bill_sideeye` | 61 x 87 |  | `src/assets/scrap/face-bill-sideeye.webp` |
| `face_bill_smile` | 62 x 84 |  | `src/assets/scrap/face-bill-smile.webp` |
| `face_bill_smug` | 62 x 82 |  | `src/assets/scrap/face-bill-smug.webp` |
| `face_bill_talking` | 62 x 83 |  | `src/assets/scrap/face-bill-talking.webp` |
| `face_bill_worried` | 62 x 82 |  | `src/assets/scrap/face-bill-worried.webp` |
| `face_bill_yell` | 63 x 90 |  | `src/assets/scrap/face-bill-yell.webp` |
| `face_branson_angry` | 54 x 81 |  | `src/assets/scrap/face-branson-angry.webp` |
| `face_branson_asleep` | 54 x 81 |  | `src/assets/scrap/face-branson-asleep.webp` |
| `face_branson_calm` | 54 x 81 |  | `src/assets/scrap/face-branson-calm.webp` |
| `face_branson_cry` | 54 x 81 |  | `src/assets/scrap/face-branson-cry.webp` |
| `face_branson_dazed` | 54 x 82 |  | `src/assets/scrap/face-branson-dazed.webp` |
| `face_branson_disgusted` | 54 x 81 |  | `src/assets/scrap/face-branson-disgusted.webp` |
| `face_branson_guilty` | 54 x 81 |  | `src/assets/scrap/face-branson-guilty.webp` |
| `face_branson_laugh` | 51 x 85 |  | `src/assets/scrap/face-branson-laugh.webp` |
| `face_branson_ouch` | 54 x 81 |  | `src/assets/scrap/face-branson-ouch.webp` |
| `face_branson_shocked` | 54 x 83 |  | `src/assets/scrap/face-branson-shocked.webp` |
| `face_branson_smile` | 54 x 81 |  | `src/assets/scrap/face-branson-smile.webp` |
| `face_branson_smug` | 54 x 81 |  | `src/assets/scrap/face-branson-smug.webp` |
| `face_branson_talking` | 54 x 81 |  | `src/assets/scrap/face-branson-talking.webp` |
| `face_branson_worried` | 54 x 81 |  | `src/assets/scrap/face-branson-worried.webp` |
| `face_branson_yell` | 54 x 83 |  | `src/assets/scrap/face-branson-yell.webp` |
| `face_chad_angel` | 52 x 73 |  | `src/assets/scrap/face-chad-angel.webp` |
| `face_chad_angry` | 52 x 81 |  | `src/assets/scrap/face-chad-angry.webp` |
| `face_chad_asleep` | 52 x 81 |  | `src/assets/scrap/face-chad-asleep.webp` |
| `face_chad_calm` | 52 x 81 |  | `src/assets/scrap/face-chad-calm.webp` |
| `face_chad_cry` | 52 x 79 |  | `src/assets/scrap/face-chad-cry.webp` |
| `face_chad_dazed` | 52 x 81 |  | `src/assets/scrap/face-chad-dazed.webp` |
| `face_chad_disgusted` | 52 x 82 |  | `src/assets/scrap/face-chad-disgusted.webp` |
| `face_chad_grin` | 52 x 79 |  | `src/assets/scrap/face-chad-grin.webp` |
| `face_chad_guilty` | 52 x 81 |  | `src/assets/scrap/face-chad-guilty.webp` |
| `face_chad_joy` | 52 x 78 |  | `src/assets/scrap/face-chad-joy.webp` |
| `face_chad_laugh` | 52 x 82 |  | `src/assets/scrap/face-chad-laugh.webp` |
| `face_chad_ouch` | 52 x 81 |  | `src/assets/scrap/face-chad-ouch.webp` |
| `face_chad_scowl` | 54 x 74 |  | `src/assets/scrap/face-chad-scowl.webp` |
| `face_chad_shocked` | 52 x 84 |  | `src/assets/scrap/face-chad-shocked.webp` |
| `face_chad_smile` | 52 x 81 |  | `src/assets/scrap/face-chad-smile.webp` |
| `face_chad_smug` | 53 x 82 |  | `src/assets/scrap/face-chad-smug.webp` |
| `face_chad_talking` | 52 x 82 |  | `src/assets/scrap/face-chad-talking.webp` |
| `face_chad_worried` | 52 x 80 |  | `src/assets/scrap/face-chad-worried.webp` |
| `face_chad_yell` | 52 x 91 |  | `src/assets/scrap/face-chad-yell.webp` |
| `face_christian_angry` | 52 x 81 |  | `src/assets/scrap/face-christian-angry.webp` |
| `face_christian_asleep` | 52 x 81 |  | `src/assets/scrap/face-christian-asleep.webp` |
| `face_christian_calm` | 52 x 81 |  | `src/assets/scrap/face-christian-calm.webp` |
| `face_christian_cry` | 52 x 82 |  | `src/assets/scrap/face-christian-cry.webp` |
| `face_christian_dazed` | 52 x 81 |  | `src/assets/scrap/face-christian-dazed.webp` |
| `face_christian_dazed2` | 52 x 84 |  | `src/assets/scrap/face-christian-dazed2.webp` |
| `face_christian_disgusted` | 52 x 81 |  | `src/assets/scrap/face-christian-disgusted.webp` |
| `face_christian_gentle` | 59 x 94 |  | `src/assets/scrap/face-christian-gentle.webp` |
| `face_christian_guilty` | 52 x 81 |  | `src/assets/scrap/face-christian-guilty.webp` |
| `face_christian_laugh` | 53 x 89 |  | `src/assets/scrap/face-christian-laugh.webp` |
| `face_christian_ouch` | 52 x 81 |  | `src/assets/scrap/face-christian-ouch.webp` |
| `face_christian_shocked` | 52 x 83 |  | `src/assets/scrap/face-christian-shocked.webp` |
| `face_christian_smile` | 52 x 84 |  | `src/assets/scrap/face-christian-smile.webp` |
| `face_christian_smug` | 52 x 81 |  | `src/assets/scrap/face-christian-smug.webp` |
| `face_christian_talking` | 52 x 81 |  | `src/assets/scrap/face-christian-talking.webp` |
| `face_christian_worried` | 52 x 81 |  | `src/assets/scrap/face-christian-worried.webp` |
| `face_christian_worried2` | 52 x 84 |  | `src/assets/scrap/face-christian-worried2.webp` |
| `face_christian_yell` | 52 x 86 |  | `src/assets/scrap/face-christian-yell.webp` |
| `face_christian_yell2` | 52 x 89 |  | `src/assets/scrap/face-christian-yell2.webp` |
| `face_curt_angry` | 55 x 81 |  | `src/assets/scrap/face-curt-angry.webp` |
| `face_curt_asleep` | 55 x 82 |  | `src/assets/scrap/face-curt-asleep.webp` |
| `face_curt_calm` | 55 x 81 |  | `src/assets/scrap/face-curt-calm.webp` |
| `face_curt_cry` | 55 x 84 |  | `src/assets/scrap/face-curt-cry.webp` |
| `face_curt_dazed` | 55 x 83 |  | `src/assets/scrap/face-curt-dazed.webp` |
| `face_curt_disgusted` | 55 x 85 |  | `src/assets/scrap/face-curt-disgusted.webp` |
| `face_curt_guilty` | 55 x 82 |  | `src/assets/scrap/face-curt-guilty.webp` |
| `face_curt_laugh` | 61 x 81 |  | `src/assets/scrap/face-curt-laugh.webp` |
| `face_curt_ouch` | 55 x 82 |  | `src/assets/scrap/face-curt-ouch.webp` |
| `face_curt_photo` | 60 x 80 |  | `src/assets/scrap/face-curt-photo.webp` |
| `face_curt_shocked` | 55 x 87 |  | `src/assets/scrap/face-curt-shocked.webp` |
| `face_curt_smile` | 55 x 82 |  | `src/assets/scrap/face-curt-smile.webp` |
| `face_curt_smug` | 55 x 81 |  | `src/assets/scrap/face-curt-smug.webp` |
| `face_curt_talking` | 55 x 83 |  | `src/assets/scrap/face-curt-talking.webp` |
| `face_curt_worried` | 55 x 81 |  | `src/assets/scrap/face-curt-worried.webp` |
| `face_curt_yell` | 55 x 88 |  | `src/assets/scrap/face-curt-yell.webp` |
| `face_mammy_angry` | 104 x 107 |  | `src/assets/scrap/face-mammy-angry.webp` |
| `face_mammy_asleep` | 104 x 108 |  | `src/assets/scrap/face-mammy-asleep.webp` |
| `face_mammy_calm` | 104 x 107 |  | `src/assets/scrap/face-mammy-calm.webp` |
| `face_mammy_cry` | 104 x 108 |  | `src/assets/scrap/face-mammy-cry.webp` |
| `face_mammy_dazed` | 104 x 108 |  | `src/assets/scrap/face-mammy-dazed.webp` |
| `face_mammy_disgusted` | 104 x 108 |  | `src/assets/scrap/face-mammy-disgusted.webp` |
| `face_mammy_guilty` | 104 x 108 |  | `src/assets/scrap/face-mammy-guilty.webp` |
| `face_mammy_laugh` | 104 x 107 |  | `src/assets/scrap/face-mammy-laugh.webp` |
| `face_mammy_ouch` | 104 x 107 |  | `src/assets/scrap/face-mammy-ouch.webp` |
| `face_mammy_photo` | 93 x 120 |  | `src/assets/scrap/face-mammy-photo.webp` |
| `face_mammy_shocked` | 104 x 108 |  | `src/assets/scrap/face-mammy-shocked.webp` |
| `face_mammy_smile` | 104 x 108 |  | `src/assets/scrap/face-mammy-smile.webp` |
| `face_mammy_smug` | 104 x 108 |  | `src/assets/scrap/face-mammy-smug.webp` |
| `face_mammy_talking` | 104 x 108 |  | `src/assets/scrap/face-mammy-talking.webp` |
| `face_mammy_worried` | 104 x 108 |  | `src/assets/scrap/face-mammy-worried.webp` |
| `face_mammy_yell` | 104 x 108 |  | `src/assets/scrap/face-mammy-yell.webp` |
| `face_nanner_angry` | 104 x 111 |  | `src/assets/scrap/face-nanner-angry.webp` |
| `face_nanner_asleep` | 104 x 111 |  | `src/assets/scrap/face-nanner-asleep.webp` |
| `face_nanner_calm` | 104 x 111 |  | `src/assets/scrap/face-nanner-calm.webp` |
| `face_nanner_cry` | 104 x 111 |  | `src/assets/scrap/face-nanner-cry.webp` |
| `face_nanner_dazed` | 104 x 111 |  | `src/assets/scrap/face-nanner-dazed.webp` |
| `face_nanner_disgusted` | 104 x 111 |  | `src/assets/scrap/face-nanner-disgusted.webp` |
| `face_nanner_guilty` | 104 x 111 |  | `src/assets/scrap/face-nanner-guilty.webp` |
| `face_nanner_laugh` | 104 x 111 |  | `src/assets/scrap/face-nanner-laugh.webp` |
| `face_nanner_ouch` | 104 x 111 |  | `src/assets/scrap/face-nanner-ouch.webp` |
| `face_nanner_photo` | 84 x 114 |  | `src/assets/scrap/face-nanner-photo.webp` |
| `face_nanner_shocked` | 104 x 111 |  | `src/assets/scrap/face-nanner-shocked.webp` |
| `face_nanner_smile` | 104 x 111 |  | `src/assets/scrap/face-nanner-smile.webp` |
| `face_nanner_smug` | 103 x 111 |  | `src/assets/scrap/face-nanner-smug.webp` |
| `face_nanner_talking` | 104 x 111 |  | `src/assets/scrap/face-nanner-talking.webp` |
| `face_nanner_worried` | 104 x 111 |  | `src/assets/scrap/face-nanner-worried.webp` |
| `face_nanner_yell` | 104 x 111 |  | `src/assets/scrap/face-nanner-yell.webp` |
| `face_pappy_angry` | 62 x 81 |  | `src/assets/scrap/face-pappy-angry.webp` |
| `face_pappy_asleep` | 62 x 82 |  | `src/assets/scrap/face-pappy-asleep.webp` |
| `face_pappy_calm` | 62 x 81 |  | `src/assets/scrap/face-pappy-calm.webp` |
| `face_pappy_cry` | 62 x 84 |  | `src/assets/scrap/face-pappy-cry.webp` |
| `face_pappy_dazed` | 62 x 82 |  | `src/assets/scrap/face-pappy-dazed.webp` |
| `face_pappy_disgusted` | 62 x 84 |  | `src/assets/scrap/face-pappy-disgusted.webp` |
| `face_pappy_guilty` | 62 x 82 |  | `src/assets/scrap/face-pappy-guilty.webp` |
| `face_pappy_laugh` | 62 x 83 |  | `src/assets/scrap/face-pappy-laugh.webp` |
| `face_pappy_ouch` | 62 x 82 |  | `src/assets/scrap/face-pappy-ouch.webp` |
| `face_pappy_photo` | 56 x 82 |  | `src/assets/scrap/face-pappy-photo.webp` |
| `face_pappy_shocked` | 62 x 85 |  | `src/assets/scrap/face-pappy-shocked.webp` |
| `face_pappy_silly` | 60 x 84 |  | `src/assets/scrap/face-pappy-silly.webp` |
| `face_pappy_smile` | 64 x 81 |  | `src/assets/scrap/face-pappy-smile.webp` |
| `face_pappy_smug` | 63 x 81 |  | `src/assets/scrap/face-pappy-smug.webp` |
| `face_pappy_talking` | 62 x 83 |  | `src/assets/scrap/face-pappy-talking.webp` |
| `face_pappy_worried` | 62 x 81 |  | `src/assets/scrap/face-pappy-worried.webp` |
| `face_pappy_yell` | 63 x 86 |  | `src/assets/scrap/face-pappy-yell.webp` |
| `face_sabra_angry` | 65 x 83 |  | `src/assets/scrap/face-sabra-angry.webp` |
| `face_sabra_asleep` | 65 x 83 |  | `src/assets/scrap/face-sabra-asleep.webp` |
| `face_sabra_calm` | 82 x 101 |  | `src/assets/scrap/face-sabra-calm.webp` |
| `face_sabra_cry` | 65 x 83 |  | `src/assets/scrap/face-sabra-cry.webp` |
| `face_sabra_dazed` | 65 x 83 |  | `src/assets/scrap/face-sabra-dazed.webp` |
| `face_sabra_disgusted` | 66 x 83 |  | `src/assets/scrap/face-sabra-disgusted.webp` |
| `face_sabra_guilty` | 65 x 83 |  | `src/assets/scrap/face-sabra-guilty.webp` |
| `face_sabra_laugh` | 65 x 83 |  | `src/assets/scrap/face-sabra-laugh.webp` |
| `face_sabra_ouch` | 66 x 83 |  | `src/assets/scrap/face-sabra-ouch.webp` |
| `face_sabra_photo` | 70 x 90 |  | `src/assets/scrap/face-sabra-photo.webp` |
| `face_sabra_shocked` | 65 x 85 |  | `src/assets/scrap/face-sabra-shocked.webp` |
| `face_sabra_smile` | 65 x 83 |  | `src/assets/scrap/face-sabra-smile.webp` |
| `face_sabra_smug` | 65 x 83 |  | `src/assets/scrap/face-sabra-smug.webp` |
| `face_sabra_talking` | 65 x 83 |  | `src/assets/scrap/face-sabra-talking.webp` |
| `face_sabra_worried` | 65 x 83 |  | `src/assets/scrap/face-sabra-worried.webp` |
| `face_sabra_yell` | 66 x 86 |  | `src/assets/scrap/face-sabra-yell.webp` |
| `face_shane_angry` | 53 x 81 |  | `src/assets/scrap/face-shane-angry.webp` |
| `face_shane_asleep` | 53 x 81 |  | `src/assets/scrap/face-shane-asleep.webp` |
| `face_shane_beam` | 50 x 79 |  | `src/assets/scrap/face-shane-beam.webp` |
| `face_shane_calm` | 53 x 81 |  | `src/assets/scrap/face-shane-calm.webp` |
| `face_shane_cry` | 50 x 79 |  | `src/assets/scrap/face-shane-cry.webp` |
| `face_shane_dazed` | 53 x 81 |  | `src/assets/scrap/face-shane-dazed.webp` |
| `face_shane_disgusted` | 53 x 82 |  | `src/assets/scrap/face-shane-disgusted.webp` |
| `face_shane_doe` | 53 x 80 |  | `src/assets/scrap/face-shane-doe.webp` |
| `face_shane_guilty` | 53 x 81 |  | `src/assets/scrap/face-shane-guilty.webp` |
| `face_shane_laugh` | 53 x 82 |  | `src/assets/scrap/face-shane-laugh.webp` |
| `face_shane_ouch` | 53 x 81 |  | `src/assets/scrap/face-shane-ouch.webp` |
| `face_shane_shocked` | 53 x 85 |  | `src/assets/scrap/face-shane-shocked.webp` |
| `face_shane_smile` | 53 x 81 |  | `src/assets/scrap/face-shane-smile.webp` |
| `face_shane_smirk` | 52 x 77 |  | `src/assets/scrap/face-shane-smirk.webp` |
| `face_shane_smug` | 53 x 81 |  | `src/assets/scrap/face-shane-smug.webp` |
| `face_shane_startled` | 52 x 82 |  | `src/assets/scrap/face-shane-startled.webp` |
| `face_shane_talking` | 53 x 82 |  | `src/assets/scrap/face-shane-talking.webp` |
| `face_shane_wary` | 53 x 76 |  | `src/assets/scrap/face-shane-wary.webp` |
| `face_shane_worried` | 53 x 81 |  | `src/assets/scrap/face-shane-worried.webp` |
| `face_shane_yell` | 53 x 86 |  | `src/assets/scrap/face-shane-yell.webp` |
| `face_shorty_angry` | 90 x 82 |  | `src/assets/scrap/face-shorty-angry.webp` |
| `face_shorty_asleep` | 90 x 82 |  | `src/assets/scrap/face-shorty-asleep.webp` |
| `face_shorty_calm` | 90 x 82 |  | `src/assets/scrap/face-shorty-calm.webp` |
| `face_shorty_cry` | 90 x 82 |  | `src/assets/scrap/face-shorty-cry.webp` |
| `face_shorty_dazed` | 90 x 82 |  | `src/assets/scrap/face-shorty-dazed.webp` |
| `face_shorty_disgusted` | 90 x 82 |  | `src/assets/scrap/face-shorty-disgusted.webp` |
| `face_shorty_guilty` | 90 x 82 |  | `src/assets/scrap/face-shorty-guilty.webp` |
| `face_shorty_laugh` | 90 x 84 |  | `src/assets/scrap/face-shorty-laugh.webp` |
| `face_shorty_ouch` | 90 x 82 |  | `src/assets/scrap/face-shorty-ouch.webp` |
| `face_shorty_pout` | 96 x 100 |  | `src/assets/scrap/face-shorty-pout.webp` |
| `face_shorty_shocked` | 90 x 86 |  | `src/assets/scrap/face-shorty-shocked.webp` |
| `face_shorty_smile` | 92 x 85 |  | `src/assets/scrap/face-shorty-smile.webp` |
| `face_shorty_smug` | 90 x 82 |  | `src/assets/scrap/face-shorty-smug.webp` |
| `face_shorty_talking` | 90 x 82 |  | `src/assets/scrap/face-shorty-talking.webp` |
| `face_shorty_worried` | 90 x 82 |  | `src/assets/scrap/face-shorty-worried.webp` |
| `face_shorty_yell` | 90 x 85 |  | `src/assets/scrap/face-shorty-yell.webp` |
| `face_stephanie_angry` | 115 x 128 |  | `src/assets/scrap/face-stephanie-angry.webp` |
| `face_stephanie_asleep` | 116 x 129 |  | `src/assets/scrap/face-stephanie-asleep.webp` |
| `face_stephanie_calm` | 115 x 128 |  | `src/assets/scrap/face-stephanie-calm.webp` |
| `face_stephanie_cry` | 115 x 129 |  | `src/assets/scrap/face-stephanie-cry.webp` |
| `face_stephanie_dazed` | 115 x 128 |  | `src/assets/scrap/face-stephanie-dazed.webp` |
| `face_stephanie_disgusted` | 115 x 128 |  | `src/assets/scrap/face-stephanie-disgusted.webp` |
| `face_stephanie_guilty` | 115 x 129 |  | `src/assets/scrap/face-stephanie-guilty.webp` |
| `face_stephanie_hold` | 115 x 129 |  | `src/assets/scrap/face-stephanie-hold.webp` |
| `face_stephanie_inhale` | 115 x 130 |  | `src/assets/scrap/face-stephanie-inhale.webp` |
| `face_stephanie_laugh` | 115 x 129 |  | `src/assets/scrap/face-stephanie-laugh.webp` |
| `face_stephanie_ouch` | 115 x 129 |  | `src/assets/scrap/face-stephanie-ouch.webp` |
| `face_stephanie_shocked` | 115 x 129 |  | `src/assets/scrap/face-stephanie-shocked.webp` |
| `face_stephanie_smile` | 115 x 129 |  | `src/assets/scrap/face-stephanie-smile.webp` |
| `face_stephanie_smug` | 116 x 128 |  | `src/assets/scrap/face-stephanie-smug.webp` |
| `face_stephanie_talking` | 115 x 129 |  | `src/assets/scrap/face-stephanie-talking.webp` |
| `face_stephanie_worried` | 115 x 129 |  | `src/assets/scrap/face-stephanie-worried.webp` |
| `face_stephanie_yell` | 114 x 130 |  | `src/assets/scrap/face-stephanie-yell.webp` |

<a id="gawkers"></a>

## The rubberneckers, and the animals

Twelve heads, each gawking and dazed, with a neck the colour of each; the dog; the bluebirds; and the family's own animals, from their photos: Roger the dog and The Grump the opossum.

![The rubberneckers, and the animals, sheet 1](gawkers-1.jpg)

![The rubberneckers, and the animals, sheet 2](gawkers-2.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `bird_down` | 30 x 20 |  | `src/assets/scrap/bird-down.webp` |
| `bird_up` | 30 x 23 |  | `src/assets/scrap/bird-up.webp` |
| `dog` | 84 x 60 |  | `src/assets/scrap/dog.webp` |
| `dog_mad` | 67 x 59 |  | `src/assets/scrap/dog-mad.webp` |
| `grump_asleep` | 46 x 52 |  | `src/assets/scrap/grump-asleep.webp` |
| `grump_eat` | 64 x 50 |  | `src/assets/scrap/grump-eat.webp` |
| `grump_held` | 60 x 32 |  | `src/assets/scrap/grump-held.webp` |
| `grump_up` | 44 x 60 |  | `src/assets/scrap/grump-up.webp` |
| `head0` | 50 x 64 |  | `src/assets/scrap/head0.webp` |
| `head0_dazed` | 50 x 65 |  | `src/assets/scrap/head0-dazed.webp` |
| `head1` | 54 x 64 |  | `src/assets/scrap/head1.webp` |
| `head1_dazed` | 57 x 65 |  | `src/assets/scrap/head1-dazed.webp` |
| `head2` | 49 x 64 |  | `src/assets/scrap/head2.webp` |
| `head2_dazed` | 52 x 65 |  | `src/assets/scrap/head2-dazed.webp` |
| `head3` | 53 x 64 |  | `src/assets/scrap/head3.webp` |
| `head3_dazed` | 52 x 65 |  | `src/assets/scrap/head3-dazed.webp` |
| `head4` | 44 x 64 |  | `src/assets/scrap/head4.webp` |
| `head4_dazed` | 44 x 65 |  | `src/assets/scrap/head4-dazed.webp` |
| `head5` | 82 x 82 |  | `src/assets/scrap/head5.webp` |
| `head5_dazed` | 82 x 83 |  | `src/assets/scrap/head5-dazed.webp` |
| `head6` | 47 x 62 |  | `src/assets/scrap/head6.webp` |
| `head6_dazed` | 47 x 63 |  | `src/assets/scrap/head6-dazed.webp` |
| `head7` | 65 x 74 |  | `src/assets/scrap/head7.webp` |
| `head7_dazed` | 65 x 75 |  | `src/assets/scrap/head7-dazed.webp` |
| `head8` | 45 x 66 |  | `src/assets/scrap/head8.webp` |
| `head8_dazed` | 45 x 67 |  | `src/assets/scrap/head8-dazed.webp` |
| `head9` | 57 x 72 |  | `src/assets/scrap/head9.webp` |
| `head9_dazed` | 51 x 56 |  | `src/assets/scrap/head9-dazed.webp` |
| `head10` | 67 x 84 |  | `src/assets/scrap/head10.webp` |
| `head10_dazed` | 71 x 85 |  | `src/assets/scrap/head10-dazed.webp` |
| `head11` | 46 x 64 |  | `src/assets/scrap/head11.webp` |
| `head11_dazed` | 46 x 65 |  | `src/assets/scrap/head11-dazed.webp` |
| `neck_dog` | 16 x 14 |  | paper |
| `neck_shadow` | 16 x 16 |  | paper |
| `neck0` | 16 x 14 |  | paper |
| `neck1` | 16 x 14 |  | paper |
| `neck2` | 16 x 14 |  | paper |
| `neck3` | 16 x 14 |  | paper |
| `neck4` | 16 x 14 |  | paper |
| `neck5` | 16 x 14 |  | paper |
| `neck6` | 16 x 14 |  | paper |
| `neck7` | 16 x 14 |  | paper |
| `neck8` | 16 x 14 |  | paper |
| `neck9` | 16 x 14 |  | paper |
| `neck10` | 16 x 14 |  | paper |
| `neck11` | 16 x 14 |  | paper |
| `roger_happy` | 44 x 104 |  | `src/assets/scrap/roger-happy.webp` |
| `roger_lie` | 60 x 78 |  | `src/assets/scrap/roger-lie.webp` |
| `roger_portrait` | 58 x 78 |  | `src/assets/scrap/roger-portrait.webp` |
| `roger_sit` | 42 x 104 |  | `src/assets/scrap/roger-sit.webp` |
| `roger_sleepy` | 51 x 78 |  | `src/assets/scrap/roger-sleepy.webp` |

<a id="effects"></a>

## Effects

Small things that fly, flash or float.

![Effects](effects.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `alert` | 34 x 44 |  | paper |
| `aura` | 300 x 380 |  | paper |
| `breath` | 28 x 8 |  | paper |
| `burst` | 130 x 112 |  | `src/assets/scrap/burst.webp` |
| `dash` | 110 x 8 |  | paper |
| `edge` | 8 x 14 |  | paper |
| `eyes` | 30 x 12 |  | paper |
| `halo` | 50 x 20 |  | paper |
| `heart` | 30 x 28 |  | paper |
| `heart_off` | 30 x 28 |  | paper |
| `puff` | 40 x 42 |  | `src/assets/scrap/puff.webp` |
| `shadow` | 70 x 22 |  | paper |
| `shred_cloth` | 20 x 14 |  | paper |
| `shred_red` | 18 x 6 |  | paper |
| `shred_white` | 18 x 6 |  | paper |
| `spark` | 12 x 12 |  | paper |
| `sparkle` | 44 x 44 |  | paper |
| `speed_lines` | 700 x 700 |  | paper |
| `star` | 27 x 26 |  | `src/assets/scrap/star.webp` |
| `star_big` | 84 x 81 |  | `src/assets/scrap/star.webp` |
| `star_big_off` | 84 x 81 |  | `src/assets/scrap/star.webp` |
| `steam` | 44 x 36 |  | paper |
| `tear` | 16 x 24 |  | paper |
| `zone` | 84 x 84 |  | paper |
| `zzz` | 70 x 56 |  | paper |

<a id="words"></a>

## Words on bursts

Shown with `this.host.word('bonk', x, y)`: the name without "word_".

![Words on bursts, sheet 1](words-1.jpg)

![Words on bursts, sheet 2](words-2.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `stamp_lose` | 300 x 204 |  | paper |
| `stamp_win` | 360 x 245 |  | paper |
| `word_ace` | 104 x 71 |  | paper |
| `word_badbill` | 122 x 83 |  | paper |
| `word_blap` | 104 x 71 |  | paper |
| `word_bonk` | 106 x 75 |  | `src/assets/scrap/word-bonk.webp` |
| `word_bop` | 106 x 75 |  | `src/assets/scrap/word-bop.webp` |
| `word_busted` | 330 x 224 |  | paper |
| `word_clang` | 112 x 76 |  | paper |
| `word_cough` | 126 x 86 |  | paper |
| `word_crash` | 118 x 80 |  | paper |
| `word_dawww` | 230 x 156 |  | paper |
| `word_delivered` | 122 x 83 |  | paper |
| `word_dodged` | 108 x 73 |  | paper |
| `word_extra` | 340 x 231 |  | paper |
| `word_fatality` | 520 x 190 |  | paper |
| `word_fight` | 360 x 245 |  | paper |
| `word_flawless` | 560 x 92 |  | paper |
| `word_gethim` | 320 x 218 |  | paper |
| `word_golf_crash` | 330 x 224 |  | paper |
| `word_golf_niceshot` | 330 x 224 |  | paper |
| `word_golf_nothanks` | 136 x 92 |  | paper |
| `word_golf_paid` | 360 x 245 |  | paper |
| `word_golf_shanked` | 300 x 204 |  | paper |
| `word_golf_sold` | 104 x 71 |  | paper |
| `word_goodboy` | 118 x 80 |  | paper |
| `word_grandslam` | 350 x 238 |  | paper |
| `word_homerun` | 330 x 224 |  | paper |
| `word_inthebox` | 124 x 84 |  | paper |
| `word_ko` | 380 x 258 |  | paper |
| `word_missed` | 104 x 71 |  | paper |
| `word_nice` | 104 x 71 |  | paper |
| `word_nicekid` | 116 x 79 |  | paper |
| `word_nicetoss` | 118 x 80 |  | paper |
| `word_noeffect` | 136 x 92 |  | paper |
| `word_nope` | 104 x 71 |  | paper |
| `word_ow` | 86 x 58 |  | paper |
| `word_pah` | 300 x 204 |  | paper |
| `word_perfect` | 124 x 84 |  | `src/assets/scrap/word-perfect.webp` |
| `word_pff` | 120 x 82 |  | paper |
| `word_pocketsand` | 470 x 320 |  | paper |
| `word_pow` | 106 x 75 |  | `src/assets/scrap/word-pow.webp` |
| `word_roadrage` | 330 x 224 |  | paper |
| `word_round` | 300 x 204 |  | paper |
| `word_shove` | 150 x 102 |  | paper |
| `word_smack` | 114 x 78 |  | paper |
| `word_splat` | 112 x 76 |  | paper |
| `word_super` | 600 x 124 |  | paper |
| `word_thatsit` | 330 x 224 |  | paper |
| `word_thwack` | 106 x 73 |  | `src/assets/scrap/word-thwack.webp` |
| `word_tickles` | 136 x 92 |  | paper |
| `word_toomany` | 140 x 95 |  | paper |
| `word_whack` | 106 x 74 |  | `src/assets/scrap/word-whack.webp` |
| `word_whiff` | 140 x 95 |  | paper |
| `word_yeowch` | 160 x 109 |  | paper |
| `word_youdidit` | 440 x 299 |  | paper |
| `word_zero` | 76 x 52 |  | paper |

<a id="interface"></a>

## The interface

Buttons, tape, meters and marks.

![The interface](interface.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `btn_duck` | 124 x 124 |  | paper |
| `btn_rage` | 124 x 124 |  | paper |
| `btn_rage_off` | 124 x 124 |  | paper |
| `choice_x` | 120 x 70 |  | paper |
| `fight_btn` | 260 x 58 |  | paper |
| `fight_btn_sad` | 260 x 58 |  | paper |
| `lungs` | 40 x 200 |  | paper |
| `meter` | 312 x 30 |  | paper |
| `meter_green` | 32 x 18 |  | paper |
| `meter_red` | 32 x 18 |  | paper |
| `mini_mark` | 26 x 26 |  | paper |
| `mini_mark_ko` | 26 x 26 |  | paper |
| `mini_mark_lose` | 26 x 26 |  | paper |
| `mini_mark_now` | 26 x 26 |  | paper |
| `mini_mark_win` | 26 x 26 |  | paper |
| `pose_card` | 96 x 104 |  | paper |
| `pose_card_on` | 96 x 104 |  | paper |
| `snd_off` | 36 x 36 |  | paper |
| `snd_on` | 36 x 36 |  | paper |
| `tag` | 96 x 32 |  | paper |
| `tape_l` | 470 x 40 |  | paper |
| `tape_m` | 168 x 30 |  | paper |
| `tape_s` | 78 x 26 |  | paper |
| `title_card` | 440 x 232 |  | paper |
| `title_sub` | 290 x 50 |  | paper |
| `you_are` | 250 x 44 |  | paper |

<a id="game-golf"></a>

## The quick game "golf"

Made by `src/minis/golf`, and kept in its folder.

![The quick game "golf", sheet 1](game-golf-1.jpg)

![The quick game "golf", sheet 2](game-golf-2.jpg)

| Name | Size | | File |
| --- | --- | --- | --- |
| `golf_aim` | 36 x 36 |  | paper |
| `golf_bag` | 58 x 150 |  | `src/minis/golf/assets/bag.webp` |
| `golf_ball` | 12 x 12 |  | `src/minis/golf/assets/ball.webp` |
| `golf_ball_big` | 132 x 133 |  | `src/minis/golf/assets/ball.webp` |
| `golf_bill_ohno` | 111 x 224 |  | `src/minis/golf/assets/bill-ohno.webp` |
| `golf_bill_stand` | 110 x 202 |  | `src/minis/golf/assets/bill-stand.webp` |
| `golf_boards` | 96 x 100 |  | paper |
| `golf_bollard` | 17 x 92 |  | `src/minis/golf/assets/bollard.webp` |
| `golf_bottle` | 12 x 36 |  | `src/minis/golf/assets/bottle.webp` |
| `golf_btn_swing` | 176 x 86 |  | paper |
| `golf_card` | 616 x 450 |  | `src/minis/golf/assets/card.jpg` |
| `golf_chad_address` | 69 x 115 |  | `src/minis/golf/assets/chad-address.webp` |
| `golf_chad_address_iron` | 69 x 114 |  | `src/minis/golf/assets/chad-address-iron.webp` |
| `golf_chad_back` | 69 x 146 |  | `src/minis/golf/assets/chad-back.webp` |
| `golf_chad_back_iron` | 69 x 144 |  | `src/minis/golf/assets/chad-back-iron.webp` |
| `golf_chad_follow` | 79 x 125 |  | `src/minis/golf/assets/chad-follow.webp` |
| `golf_chad_follow_iron` | 78 x 125 |  | `src/minis/golf/assets/chad-follow-iron.webp` |
| `golf_club_driver` | 84 x 14 |  | `src/minis/golf/assets/club-driver.webp` |
| `golf_club_iron` | 84 x 14 |  | `src/minis/golf/assets/club-iron.webp` |
| `golf_coin` | 14 x 14 |  | paper |
| `golf_cooler` | 70 x 86 |  | `src/minis/golf/assets/cooler.webp` |
| `golf_dirt` | 128 x 64 |  | paper |
| `golf_fairway` | 128 x 64 |  | paper |
| `golf_fill` | 40 x 8 |  | paper |
| `golf_flag` | 42 x 72 |  | paper |
| `golf_gate` | 181 x 112 |  | `src/minis/golf/assets/gate.webp` |
| `golf_green` | 150 x 26 |  | paper |
| `golf_head_bill` | 84 x 86 |  | paper |
| `golf_head_chad` | 84 x 86 |  | paper |
| `golf_head_shane` | 84 x 86 |  | paper |
| `golf_hills` | 512 x 150 |  | paper |
| `golf_houses` | 240 x 84 |  | paper |
| `golf_jar` | 32 x 54 |  | `src/minis/golf/assets/jar.webp` |
| `golf_meter` | 56 x 268 |  | paper |
| `golf_p0_walk1` | 128 x 206 |  | `src/minis/golf/assets/p0-walk1.webp` |
| `golf_p0_walk2` | 52 x 209 |  | `src/minis/golf/assets/p0-walk2.webp` |
| `golf_p1_walk1` | 126 x 204 |  | `src/minis/golf/assets/p1-walk1.webp` |
| `golf_p1_walk2` | 54 x 207 |  | `src/minis/golf/assets/p1-walk2.webp` |
| `golf_p2_walk1` | 124 x 206 |  | `src/minis/golf/assets/p2-walk1.webp` |
| `golf_p2_walk2` | 54 x 209 |  | `src/minis/golf/assets/p2-walk2.webp` |
| `golf_p3_run1` | 177 x 194 |  | `src/minis/golf/assets/p3-run1.webp` |
| `golf_p3_run2` | 119 x 202 |  | `src/minis/golf/assets/p3-run2.webp` |
| `golf_p4_run1` | 171 x 193 |  | `src/minis/golf/assets/p4-run1.webp` |
| `golf_p4_run2` | 101 x 202 |  | `src/minis/golf/assets/p4-run2.webp` |
| `golf_p5_run1` | 184 x 196 |  | `src/minis/golf/assets/p5-run1.webp` |
| `golf_p5_run2` | 129 x 204 |  | `src/minis/golf/assets/p5-run2.webp` |
| `golf_path` | 128 x 80 |  | paper |
| `golf_pavement` | 128 x 64 |  | paper |
| `golf_place_lot` | 1539 x 660 | strip | `src/minis/golf/assets/lot.jpg` |
| `golf_place_tee` | 1539 x 660 | strip | `src/minis/golf/assets/tee.jpg` |
| `golf_place_trail` | 1539 x 660 | strip | `src/minis/golf/assets/trail.jpg` |
| `golf_shard` | 18 x 22 |  | paper |
| `golf_sign` | 78 x 104 |  | `src/minis/golf/assets/sign.webp` |
| `golf_sky` | 64 x 64 |  | paper |
| `golf_smash` | 100 x 132 |  | paper |
| `golf_stoppaint` | 150 x 40 |  | paper |
| `golf_stopsign` | 50 x 168 |  | `src/minis/golf/assets/stopsign.webp` |
| `golf_store` | 463 x 350 |  | `src/minis/golf/assets/store.webp` |
| `golf_table` | 136 x 130 |  | `src/minis/golf/assets/table.webp` |
| `golf_tee` | 6 x 14 |  | paper |
| `golf_teebox` | 460 x 56 |  | paper |
| `golf_trailsign` | 176 x 150 |  | `src/minis/golf/assets/trailsign.webp` |
| `golf_trees` | 256 x 300 |  | paper |
| `golf_want` | 56 x 56 |  | paper |
| `golf_wind` | 112 x 112 |  | paper |
| `golf_wind_arrow` | 80 x 30 |  | paper |
| `golf_window_new` | 98 x 150 |  | `src/minis/golf/assets/window-new.webp` |
| `golf_zone` | 40 x 30 |  | paper |
