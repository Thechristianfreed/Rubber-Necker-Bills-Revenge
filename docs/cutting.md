# Cutting pictures out

How a picture the owner sends becomes a piece in the game. The prompts that
make the pictures are in `art-prompts.md`; this is everything after that.

```text
the owner's picture        art-src/generated/<ID>-<what>.webp   (or art-src/photos/<who>-<n>.jpg)
  -> Adobe: background off  art-src/adobe/<ID>-<what>-cutout.png
  -> Adobe: heads selected  art-src/adobe/<ID>-<what>-headmask.png
  -> tools/make_cutouts.py  src/assets/scrap/<piece>.webp, and a table in src/data
  -> src/art/photos.ts      registered under the same key as the paper stand-in
```

That is how it goes for the levels and the first six quick games, whose
pictures are all in the common folders. A quick game with a folder of its
own keeps everything of its own instead, and nothing of it is in those:

```text
the owner's picture         art-src/games/<id>/<ID>-<what>.webp
  -> Adobe                   art-src/games/<id>/<ID>-<what>-cutout.png, -headmask.png
  -> src/minis/<id>/cut.py   src/minis/<id>/assets/<piece>.webp
  -> src/minis/<id>/index.ts registered in its PIECES, under a key that starts "<id>_"
```

Everything in `art-src` is kept, so any piece can be cut again without going
back to Adobe. `python tools/make_cutouts.py` with nothing after it re-cuts
every common piece from those files, and should change nothing.

## 1. Keep the picture

- Pictures arrive as files only when the owner sends them in a message of
  their own. One sent while Claude is in the middle of something can be seen
  but is not on disk: ask for it again.
- Name it by its number in `art-prompts.md` and what it is:
  `art-src/generated/SB3-chad-sandbox.webp`. Family photos go in
  `art-src/photos` (`chad-7.jpg`). Crop anybody else out of a photo before it
  is saved: this repository is public.
- The owner says which picture is which when there is doubt. Look at each one
  before using it: a sheet meant to have four poses sometimes has three.

## 2. Send it to Adobe

The Adobe tools are a connector (`mcp__Adobe__...`). Its
`adobe_mandatory_init` has to be called once in a conversation before
anything else of Adobe's.

Adobe will not fetch a picture from just anywhere on the web ("URL domain not
whitelisted"), so the picture goes into the owner's Adobe storage first, in
three steps:

1. `asset_initialize_file_upload` with `path: "rubber-necker/<name>.jpg"`,
   the file's exact size in bytes, and its `media_type`. Only JPEG and PNG
   have been sent, so a WebP is saved as one of those first (a scratch copy;
   it is not kept). It answers with a `transfer_document`; the address to
   send the file to is in it, under `_links`, the one ending
   `block/transfer`.
2. Send the file there:

   ```bash
   curl -sS -L -X PUT -H "Content-Type: image/jpeg" --data-binary @picture.jpg -o /dev/null -w "%{http_code}\n" "<the transfer address>"
   ```

3. `asset_finalize_file_upload` with the `filename` and the same
   `transfer_document` handed back. It answers with `presignedAssetUrl`:
   that is the picture's address for the tools below.

If the first step says "Service Unavailable", it means it: try again.

## 3. Cut it

- **Background off:** `image_remove_background` with
  `imageURI: <presignedAssetUrl>` and nothing else. The answer's `outputUrl`
  is a PNG of the same size with the background see-through. (Its
  description sends a single picture to an interactive version instead; the
  exception it gives, a result that feeds another tool, is this case.)
- **Heads selected:** `image_select_by_prompt` with
  `options: { prompt: "the man", bodyParts: ["Hair", "Face", "Left Ear", "Right Ear"] }`,
  and `"Beard"` as well for somebody who has one. The prompt says who; the
  body parts say what of them. The answer's `outputUrl` is a mask.
  `bodyParts: ["Face"]` alone gives hairline to chin, which is what sizes
  Stephanie's faces.
- **Anything else selected:** the same tool with no body parts and a prompt
  naming the thing: "all the wooden baseball bats", "the three hands",
  "the birdhouse".

Fetch each answer straight away into `art-src/adobe` (these are signed,
temporary addresses, not ones to keep):

```bash
curl -sS -L -o art-src/adobe/SB3-chad-sandbox-cutout.png "<outputUrl>"
```

They are named for the picture they came from: `-cutout.png`,
`-headmask.png` (`-headmask2.png` for a second figure selected separately),
`-facemask.png`, `-handmask.png`. A mask comes back either as see-through or
as black and white; `selection()` in `make_cutouts.py` reads both.

## 4. Make the pieces

**For a game with a folder of its own:** its `cut.py`, which
`tools/new_mini.mjs` wrote. It borrows every helper in
`tools/make_cutouts.py` (as `mc.load`, `mc.pieces`, `mc.save`,
`mc.head_only`, `mc.without_heads`, `mc.chin_of` and the rest), pointed at
the game's own folders, so it cannot read or write another game's pictures:

```bash
.venv/bin/python src/minis/<id>/cut.py
```

A table the game needs (where a chin is, how far a head tips) is written by
that file into the game's own folder too.

**For the levels and the first six games:** `tools/make_cutouts.py` is one
step for each kind of picture (`STEPS` at the bottom lists them). Run one by
name:

```bash
.venv/bin/python tools/make_cutouts.py sand
```

A new picture is usually a new row in a table that a step already reads:

| For | Add to | Then run |
| --- | --- | --- |
| One of the brothers' faces | `BAT_FACES` (and `BAT_CLOSE_UPS` if it is seen close up) | `bat_faces` |
| A sheet of one of the brothers' poses | `BAT_SHEETS` | `bat_bodies` |
| The two of them in one picture | `SAND_PAIRS` | `sand` |
| A new kind of thing | a step of its own, added to `STEPS` | that step |

The step writes the pieces into `src/assets/scrap` (as WebP, though every
name in the code says `.png`) and, where the game needs to know where a chin
or an elbow is, a table in `src/data` that says "do not edit by hand". The
piece is then registered in `PIECES` in `src/art/photos.ts`, under the key
its paper stand-in has, and the photo takes its place.

How people are put together:

- **A generated body has its head taken off** (`headless`, `without_heads`)
  and a real photo head is hung on it by the chin (`chin_of`). The body's
  table row says where the chin goes and how far the head tips.
- **A head from a photo** is Adobe's cutout where Adobe's head selection
  says, with the holes it leaves at the eyes filled in (`head_only`), and
  only the biggest piece kept.
- **Something that has to move at a joint** (the arm in the fight, their
  mother's wagging forearm) is cut off as a piece of its own with a round
  end, and pinned in the game at the joint.

To find where something is in a picture (the row a plank starts on, an
elbow), rule a grid over it and read it off:

```bash
.venv/bin/python tools/test/grid.py art-src/generated/SB9-mom-below.webp grid.png 800 400 1125 800 50
```

## 5. Look at it

Look at every piece before it goes in the game: laid out on a coloured
background (a white or grey one hides a ragged edge), and then in the game,
by the game playing itself (`testing.md`). A head that sits wrong on a body
shows at once in a screenshot and not at all in the numbers.

## What goes wrong

**With the selecting:**

- **A sheet of several people, and only one head comes back.** "all the
  boys" has selected one of two. Select them one at a time and keep two
  masks. Say who by what they are wearing: "the child wearing the red
  t-shirt and blue jeans" worked where "the boy in the red shirt" and "the
  boy on the right" both failed with "No Salient Object found".
- **Still not found** (two people with their arms round each other): cut
  that person out of the picture as a crop, send the crop, select on it, and
  paste the mask back into a blank one the size of the whole picture at the
  place the crop came from. (`SB6-hug-headmask2.png` was made that way.)
- **A prompt refused as unsafe.** "all the bare arms and hands" was. "the
  three hands" was not. Say what the thing is and leave skin out of it.
- **The head stops short of the chin.** The selection can end at the mouth
  on a face with a strong jaw, and the head then looks sliced. `BAT_FACES`
  has a `jaw` number for it, which carries the lower edge of the face down a
  little.
- **Hair with a ragged edge.** The selection is rougher than the cutout
  round hair. The head is taken from the cutout, inside the selection, so
  the cutout's edge is the one that shows.

**With the background:**

- **It keeps only what it thinks is the subject.** A person or a thing on a
  plain background comes out well. A wall, a white page, or a card that
  something is lying on is not a subject: the house was taken as "whatever
  is not the page", worked out in `make_cutouts.py`, and the hands (which
  came back still on their grey cards) were got by selecting "the three
  hands" instead.
- **Several things on one sheet** come back as one cutout. `pieces()` splits
  it into its separate things, left to right, so they need clear gaps
  between them: ask for those in the prompt.

**With the pictures themselves:**

- **A face at the very edge of a photo:** the crop is held inside the
  picture.
- **An open mouth makes a head taller.** Heads are sized hair to chin, so a
  yelling one comes out small beside a calm one. `BAT_FACES` has a `long`
  number for how much taller it really is.
- **Two heads in one generated picture are too close together,** because the
  photo heads hung on are about twice the size of the ones that came off.
  `SAND_PAIRS` says how far apart to put their chins.
- **A generated body's own head is small,** and seen from below it is
  smaller still. The photo head hung on their mother from below is made a
  little bigger than the one that came off (`HEAD_UP` in `src/minis/sand/SandMini.ts`); it
  is a scrapbook, and a big head is right.
- **A pose that covers the head or neck** cannot have its head changed. The
  prompts ask for poses that do not; a picture that does anyway goes back to
  be made again.

**With the files:**

- **The page has a size limit** (16 MB with every picture inside it), which
  is why pieces are WebP. A PNG that has come from somewhere else is turned
  into one by `tools/shrink_assets.py`.
- **A tool must not read its pictures back out of `src/assets`:** what is
  there has lost a little. Each step works from `art-src`.
- **Uploads stay in the owner's Adobe storage**, in a folder called
  `rubber-necker`. Nothing here deletes them.
