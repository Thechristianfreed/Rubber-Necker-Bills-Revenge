# Pictures a new game can use

Everything any game has made is there for every other game to use: the
places, the things in them, the people, the effects, the words. A new game
is set in the gym, or hands somebody the sand bucket, without making either
again.

- **What there is:** `docs/catalogue/README.md`. Every picture by the name a
  game calls it by, with a sheet of small pictures for each kind and the
  file each one is. It is made from the game itself
  (`tools/test/catalogue.cjs`), so it leaves nothing out.
- **Who there is:** `docs/characters.md`. The people, and the faces each of
  them has. A head goes on a body with one call, `head(scene, 'chad',
  'guilty', x, y, 62)`, from `src/minis/shared/people.ts`.

The rule is the same for all of it: **use it as it is; do not change it.** A
picture that is nearly right is used as it is, or a new one is made in the
new game's own folder, called `<id>_something`. Anything in the catalogue
that would have to change for a new game to work is something to ask the
owner about first.

## Where the files are

Everything that has ever been cut is kept, in three layers. All of it is in
the repository.

| | Where | What it is |
| --- | --- | --- |
| **The finished cutouts** | `src/assets/scrap` (421 files), and Bill's four everyday heads in `src/assets/bill`. A game with a folder of its own keeps its own in `src/minis/<id>/assets`. | What the game loads: each piece by itself, background gone, trimmed to its edges, heads taken off bodies, at the size it is drawn. **These are the ones to use**, and a game uses one by its name, not its file: the catalogue gives both. |
| **Adobe's cutouts** | `art-src/adobe` (155 files): `...-cutout.png` is a whole picture with its background gone, and `...-headmask.png` (`-facemask`, `-handmask`, `-batmask`) is what Adobe selected in it. Everybody's faces are in `art-src/cast/<who>` (445 files), the same two for each look. | Full size, exactly as Adobe gave them back. For when a finished piece is not enough: a bigger copy for a close-up, or a piece cut a different way. Nothing has to go back to Adobe for that. |
| **The pictures they were cut from** | `art-src/generated` (what the owner generated) and `art-src/photos` (the family's photos) | The originals. |

`tools/make_cutouts.py` makes the first layer from the other two, and can
make all of it again (`cutting.md`).

## Putting one on the page

```ts
import { img } from '../../art/sticker';

const bucket = img(scene, 300, 420, 'sand_bucket').setDepth(12);
```

`img` draws it at the size in the catalogue and pins it where it is meant to
be held: something that stands is pinned at its foot, a head at its chin, a
hand at its wrist. `applyArt(image, 'other_key')` swaps the picture for
another and keeps the pin. A strip (marked so in the catalogue) repeats to
fill a width: `places.ts` shows how one is laid.

## Places

Each is laid with one call from `src/minis/shared/places.ts`, behind
everything else (depths 1 to 8), and says where its floor is.

| Place | Lay it with | Floor | First in |
| --- | --- | --- | --- |
| The school gym | `layGym(scene)`, and `gymThings(scene)` for the hoop, the bleachers and the bake-sale table | `GYM.floor` (428) | the fight |
| The den | `layDen(scene)`. The television is `tv_set`. | `DEN.floor` (404) | Mom's workout tape |
| The back yard | `layYard(scene)`, then `raiseHouse(scene, x)` for the back of the house and `standMom(scene)` for their mother on the doorstep | `YARD.floor` (436) | Payback |
| The sandbox, in the yard | `laySandbox(scene, x)` | the yard's | Pocket sand |
| The school hallway | `layHallway(scene)` | `HALLWAY.floor` (387) | the bully's locker |
| The coast road | `layRoad(scene)`: tarmac from `ROAD.top` (206) down | anywhere on the road | the highway |
| The basement at the sleepover | `layRecRoom(scene)`: cut paper so far | `REC_ROOM.floor` (418) | The Hot Carl |

The street of houses from the paper route (`houses`, `fence`, `sidewalk`,
`kerb`, `lawn`) scrolls past in its level and has no call of its own yet.

## Things

All in the catalogue under "Things". The ones most likely to be wanted
again:

- **In the yard:** `yard_tree`, `yard_bush`, `yard_swing`, `yard_pool`,
  `yard_line` (the washing line).
- **In the sandbox:** `sand_bucket`, `sand_shovel`, `sandcastle`,
  `sand_heap`; sand in the air (`sand_speck` small, `sand_clump` close to,
  `sand_blob` a faceful); a grown-up's hands (`hand_grab` reaching down,
  `hand_throw` flung open).
- **In the gym:** `hoop`, `bleachers`, `bake_table`, `cupcake`, `plank`.
- **From the locker:** `jar`, `shake`, `book`, and the mess (`splat0` to
  `splat3`, `blob`).
- **From the road and the street:** `mailbox0`, `mailbox1` (and each `_hit`),
  `tree`, `birdhouse`, `palm`, `cone`, `billboard0`, `sign0`, `bat`,
  `phone`, `armphone` (a hand holding a phone up).

## Effects, words and lettering

- **Effects:** `star`, `puff`, `burst`, `heart`, `tear`, `sparkle`, `zzz`,
  `steam`, `speed_lines`, and the bluebirds (`bird_up`, `bird_down`).
- **A word on a burst:** `this.host.word('bonk', x, y)`, for any of the
  `word_*` in the catalogue. A game's own are made with `makeWord`, and
  called `word_<id>_something`.
- **Something said:** `bubble(scene, x, y, 'TEXT', mouth)` from
  `src/ui/bubble.ts`.
- **Lettering:** `label()` for big cut-out letters, `written()` for marker
  pen, both in `src/ui/text.ts`. Strips of tape to write on: `tape_s`,
  `tape_m`, `tape_l`.

## People

A body in a pose with a head hung on it by the chin. `docs/characters.md`
says who has which faces.

- **The brothers:** `new Kid(scene, 'chad', CHAD, 'stand', 'glee')` from
  `src/minis/shared/yard.ts` puts the head on, and `kid.set(pose, look)`
  changes both.
- **Their mother at the back door:** `standMom(scene)`.
- **Anybody else, or a new pose:** a body made for the new game, with its
  chin written down by the game's `cut.py`, and one of the person's faces
  put at that chin. `yard.ts` is the pattern to follow.

## Keeping the catalogue true

```bash
node tools/test/catalogue.cjs http://localhost:5180/
```

Run it on the whole game (not a page built with `--only`) after pictures
are added, and commit what it writes in `docs/catalogue`. A new game's own
pictures get a section of their own.
