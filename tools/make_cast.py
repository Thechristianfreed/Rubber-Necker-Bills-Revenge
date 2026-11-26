#!/usr/bin/env python3
"""Everybody's faces: the looks each person has, cut the same way for every one
of them, so that any game can hang any face on any body and change it for
another without the head moving or changing size.

Each look is a picture of its own (an edit of one photo of that person: see
docs/characters.md), put through Adobe twice (docs/cutting.md): the background
taken off, and the head selected (hair, face, both ears, and the beard of
somebody who has one). Those are kept in art-src/cast/<who>/:

    <look>-cutout.webp     Adobe's cutout of the picture
    <look>-headmask.png    Adobe's selection of the head
    <look>-facemask.png    ...and of the face alone, for somebody whose hair
                           hangs below their chin (it is what finds the chin)

A person's looks are edits of one photo, so they nearly all share one framing:
the top of the hair, and the chin where it is with the mouth shut. Every look
is saved with the head HEAD pixels tall between those two and hung from that
chin, so a mouth that drops open drops the jaw and leaves the head where it
was. A look whose picture is framed differently (it is measured, not assumed)
is brought to the same size by the width of its head, and hung from the same
place on its skull.

The faces a person had already, cut for one game or another, are in their set
as well (PEOPLE below), cut again here from the same cutouts those games were
made from (art-src/adobe) so that they are the same size and hang from the
same place as the rest. One that is a look of the fifteen fills that gap in
the set, until a picture of that look comes with the others; then it is given
a name of its own here (Shane's first shocked face is his "startled"). One
that is not (the breath held in, the doe eyes) has a name of its own from the
start: no face that has been made is left out, and a new game can use any of
them.

usage: .venv/bin/python tools/make_cast.py [who ...] [--to <folder>]
With nobody named, everybody. Writes src/assets/scrap/face-<who>-<look>.png
(a WebP, like every cutout) and the table src/data/cast.ts; with --to, writes
the pictures to that folder instead and leaves the table alone.

    .venv/bin/python tools/make_cast.py --keep
turns Adobe's cutouts in art-src/cast from PNG, as they arrive, into WebP, a
tenth of the size, which is how they are kept.
"""
import glob
import os
import sys

import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_cutouts as mc  # noqa: E402

CAST = os.path.join(mc.ROOT, "art-src", "cast")
TABLE = os.path.join(mc.ROOT, "src", "data", "cast.ts")

# How tall a head is saved, from the top of the hair to the chin, in pixels: enough
# for a face that fills a third of the page.
HEAD = 360

# The fifteen, in the order docs/characters.md has them.
LOOKS = ["calm", "talking", "smile", "laugh", "smug", "angry", "yell", "shocked", "guilty", "worried", "cry", "ouch", "dazed",
         "disgusted", "asleep"]

# Whose mouth is shut, best first: the first of these a person has says where their chin is.
SHUT = ["calm", "angry", "smug", "worried"]

# Everybody who has a set, and the pictures there were of them already: each by its name in
# art-src/adobe (without "-cutout.png"), under the look it is in their set. A name from the
# fifteen fills that gap; any other name is a face of that person's own. A picture can say how
# far to turn the head to set it straight (degrees), how much longer to draw a jaw that
# Adobe's selection stopped short of (docs/cutting.md), and that it is another photo
# altogether: the head held another way, so it is hung from its own chin and not the set's.
PEOPLE = {
    "bill": {"yell": "WT6c-bill-pah",
             "inhale": "WT6a-bill-in", "hold": "WT6b-bill-hold", "sideeye": ("bill-2", {"other": True}), "glare": ("bill-1", {"other": True})},
    "stephanie": {"yell": "WT1a-mom-pah", "angry": "WT1e-mom-scold",
                  "inhale": "WT1b-mom-in", "hold": "WT1c-mom-hold"},
    "chad": {"calm": "PB-chad-7", "yell": "PB-chad-5", "cry": "PB-chad-6",
             "grin": "PB-chad-3", "angel": ("PB-chad-2", {"other": True}), "joy": ("PB-chad-4", {"other": True}),
             "scowl": ("PB-chad-1", {"other": True, "jaw": 0.045})},
    "shane": {"cry": "PB-shane-5",
              "beam": "PB-shane-1", "wary": ("PB-shane-2", {"other": True}), "smirk": ("PB-shane-3", {"other": True, "turn": -17}),
              "doe": "PB-shane-6", "startled": ("PB-shane-4", {"other": True, "turn": -8})},
    # ...and those who have no pictures from before
    "christian": {},
    "branson": {},
    "shorty": {},
    "mammy": {},
    "pappy": {},
    "nanner": {},
    "curt": {},
    "sabra": {},
}

# A look in art-src/cast that is a real photo, used as it is, and not one of a batch of edits:
# Christian laughing on a boat is his laugh. Unless it is the person's base photo ("base": the
# one their edits are made from), it is another photo, and is hung by its own chin as the ones
# marked "other" above are. A photo can also say:
#   turn    how far to turn the head to set it straight, in degrees
#   seal    to close slits in Adobe's selection: an eyebrow at the very edge of a face that is
#           turned a little opens the selection to the outside, and the paper border then runs
#           into it. The number is how wide a slit to close, as a part of the head's height.
#   above   to take the hair and ears from Adobe's cutout where its selection left them out:
#           everything in the cutout higher than this far down the selection (0 its top, 1 its
#           bottom), which is above where the neck begins.
#   size    to make it a little bigger or smaller than the width of the head says (a head
#           turned to one side measures narrow, and comes out big)
#   below   to cut long hair off this far under the chin, in heads, along a curve: for a
#           photo whose frame cuts the hair off anyhow, or that has a coat under it
# (Give a person an empty entry in PEOPLE as well, if they have none.)
# The photo a person's edits were made from is their "smile" until the edits come, and their
# "photo" after: the edit of it that came with the others is the smile then.
PHOTOS = {
    "bill": {"calm": {"seal": 0.03, "size": 0.87}},
    "christian": {"calm": {"base": True, "seal": 0.03, "turn": 10}, "smile": {}, "laugh": {"size": 0.95}, "gentle": {"seal": 0.03},
                  "yell2": {}, "dazed2": {}, "worried2": {}},
    "branson": {"laugh": {"seal": 0.03, "size": 0.95}},
    "shorty": {"smile": {"base": True, "below": 0.27}, "pout": {}},
    "mammy": {"photo": {"size": 0.9}},
    "pappy": {"photo": {"seal": 0.03, "size": 0.9}, "silly": {"seal": 0.03, "size": 0.9}},
    "nanner": {"photo": {"size": 0.87}},
    "curt": {"photo": {"seal": 0.03, "size": 1.03}, "laugh": {"seal": 0.03, "size": 1.12}},
    "sabra": {"photo": {"seal": 0.03, "below": 0.05, "size": 0.95}, "calm": {"seal": 0.04, "below": 0.3, "size": 1.2}},
}

# What every look in a person's batch needs, where the portrait they are all edits of needs it
# (the same things a photo can say, above). Pappy's head is turned in his, so the far eyebrow
# is at the very edge of his face in every look, and he holds his head tipped. Nanner's hair
# runs down over her shoulders and ends in thin tails where her dress begins. Christian's and
# Branson's edits are of photos in which the head is tipped and turned a little (the same far
# eyebrow); Shorty's are of one her hair runs out of, as her photo's own face is trimmed.
# Sabra's hair is tied back, and wisps of it hang down past her jaw on both sides.
SETS = {
    "pappy": {"seal": 0.055, "turn": 10},
    "nanner": {"below": 0.4},
    "christian": {"seal": 0.05, "turn": 10},
    "branson": {"seal": 0.06, "turn": -6},
    "shorty": {"below": 0.27},
    "sabra": {"below": 0.05},
}

# A look in a batch whose selection Adobe left the hair and the ears out of ("Face, Beard" where
# the rest of the batch got "Face, Hair, Left Ear, Beard"): it takes those from the selection of
# another look in the same batch, which is framed the same to the pixel.
BORROW = {
    "branson": {"smug": "calm", "smile": "calm"},
    "shorty": {"guilty": "calm"},
    "sabra": {"smile": "angry", "laugh": "angry", "shocked": "angry"},
}

# A look whose head is this near the usual place and size in its picture has the same framing.
SAME = 0.02


def picture(path):
    return np.asarray(Image.open(path).convert("RGBA"), dtype=np.float32) / 255.0


def selected(path):
    m = picture(path)
    return m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)


def face_of(path):
    """Adobe's selection of somebody's face: the one biggest piece of it (a passer-by in the
    background has a face as well, and it gets selected with hers)."""
    solid = (selected(path) > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(solid, 8)
    return lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])) if n > 2 else solid.astype(bool)


def sources(who):
    """Every look this person has a cutout and a head selection for: look -> (cutout, headmask, facemask or None)."""
    found = {}
    for look, stem in PEOPLE[who].items():
        stem, how = stem if isinstance(stem, tuple) else (stem, {})
        base = os.path.join(mc.SRC, stem)
        if os.path.exists(base + "-cutout.png") and os.path.exists(base + "-headmask.png"):
            face = base + "-facemask.png"
            found[look] = (base + "-cutout.png", base + "-headmask.png", face if os.path.exists(face) and not how.get("turn") else None, False, how)
    for mask in sorted(glob.glob(os.path.join(CAST, who, "*-headmask.png"))):
        look = os.path.basename(mask)[:-len("-headmask.png")]
        base = mask[:-len("-headmask.png")]
        cut = next((base + "-cutout" + e for e in (".webp", ".png") if os.path.exists(base + "-cutout" + e)), None)
        if cut:
            face = base + "-facemask.png"
            how = dict(PHOTOS.get(who, {}).get(look, SETS.get(who, {})))
            if look in PHOTOS.get(who, {}) and not how.pop("base", False):
                how["other"] = True
            lender = BORROW.get(who, {}).get(look)
            if lender:
                how["also"] = os.path.join(CAST, who, lender + "-headmask.png")
            # (a new one takes an old one's place)
            found[look] = (cut, mask, face if os.path.exists(face) and not how.get("turn") else None, True, how)
    return found


def head_of(cut, mask, turn=0, jaw=0, seal=0, above=0, below=0, face=None, also=None):
    """The head alone: Adobe's cutout where its selection of the head says, the holes it
    leaves at the eyes and mouth filled in, and only the one biggest piece of it. Then, where
    the picture needs it, the jaw drawn out to where the chin really is, and the head set straight."""
    rgba = picture(cut)
    sel = selected(mask)
    if also:
        more = selected(also)
        if more.shape != sel.shape:       # (a picture that came a pixel wider or narrower than the rest)
            more = cv2.resize(more, (sel.shape[1], sel.shape[0]), interpolation=cv2.INTER_LINEAR)
        sel = np.maximum(sel, more)
    solid = (sel > 0.5).astype(np.uint8)
    rows = np.where(solid.any(axis=1))[0]
    if seal:
        across = max(3, int(seal * (rows.max() - rows.min()))) | 1
        solid = cv2.morphologyEx(solid, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (across, across)))
    if above:
        more = (rgba[..., 3] > 0.5).astype(np.uint8)
        more[int(rows.min() + above * (rows.max() - rows.min())):] = 0
        solid = np.maximum(solid, more)
    contours, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    whole = np.zeros(solid.shape, np.uint8)
    cv2.drawContours(whole, contours, -1, 1, thickness=cv2.FILLED)
    soft = cv2.GaussianBlur(whole.astype(np.float32), (0, 0), 1.2)
    head = rgba.copy()
    head[..., 3] = np.minimum(head[..., 3], np.clip(soft * 1.6, 0, 1))
    n, lab, st, _ = cv2.connectedComponentsWithStats((head[..., 3] > 0.5).astype(np.uint8), 8)
    if n > 1:
        # (a faint speck off to one side is not a piece, and goes as well)
        keep = cv2.dilate((lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8), np.ones((5, 5), np.uint8))
        head[..., 3] *= keep
    if below and face:
        fy, fx = np.where(face_of(face))
        tall = fy.max() - np.where(head[..., 3] > 0.5)[0].min()
        xs = np.arange(head.shape[1], dtype=np.float32)
        # lowest in the middle and higher at the sides, as hair that has been cut is
        edge = fy.max() + below * tall - 0.1 * tall * ((xs - (fx.min() + fx.max()) / 2) / (0.6 * tall)) ** 2
        rows_ = np.arange(head.shape[0], dtype=np.float32)[:, None]
        head[..., 3] *= np.clip(edge[None, :] - rows_ + 0.5, 0, 1)
    if jaw:
        # from the mouth down the outline is made the shape of a jaw, with nothing cut into it,
        # and that shape is drawn out downwards as far as the chin really goes
        solid = (head[..., 3] > 0.5).astype(np.uint8)
        rows = np.where(solid.any(axis=1))[0]
        tall = rows.max() - rows.min()
        mouth = int(rows.min() + tall * 0.6)
        low = solid.copy()
        low[:mouth] = 0
        shape = np.zeros_like(solid)
        cv2.fillConvexPoly(shape, cv2.convexHull(cv2.findNonZero(low)), 1)
        band = shape[mouth:rows.max() + 1]
        longer = cv2.resize(band, (band.shape[1], band.shape[0] + round(tall * jaw)), interpolation=cv2.INTER_LINEAR)
        longer = longer[:shape.shape[0] - mouth]
        shape[mouth:mouth + longer.shape[0]] = longer
        soft = cv2.GaussianBlur(shape.astype(np.float32), (0, 0), 1.2)
        head[..., 3] = np.maximum(head[..., 3], np.minimum(rgba[..., 3], np.clip(soft * 1.6, 0, 1)))
    if turn:
        tall, wide = head.shape[:2]
        side = int(np.hypot(tall, wide)) + 4
        page = np.zeros((side, side, 4), np.float32)
        oy, ox = (side - tall) // 2, (side - wide) // 2
        page[oy:oy + tall, ox:ox + wide] = head
        head = cv2.warpAffine(page, cv2.getRotationMatrix2D((side / 2, side / 2), turn, 1), (side, side), flags=cv2.INTER_CUBIC)
    return head


def measured(head):
    """Where a head is in its picture, by what an expression does not move: the top of the
    hair, and how wide the head is and where its middle is at about the height of the eyes."""
    solid = head[..., 3] > 0.5
    rows = np.where(solid.any(axis=1))[0]
    top, bottom = int(rows.min()), int(rows.max())
    left = np.array([np.argmax(solid[y]) if solid[y].any() else 0 for y in range(top, bottom + 1)])
    right = np.array([solid.shape[1] - 1 - np.argmax(solid[y][::-1]) if solid[y].any() else 0 for y in range(top, bottom + 1)])
    wide = right - left
    widest = float(wide[:max(1, int(0.6 * len(wide)))].max())
    band = slice(int(0.3 * widest), max(int(0.3 * widest) + 1, min(len(wide), int(0.7 * widest))))
    return top, float(np.median(wide[band])), float(np.median((left + right)[band] / 2)), bottom


def chin_of(head, face):
    """The chin: the bottom of the face's own selection where there is one (long hair hangs
    below it), and of the head where there is not; and the middle of the lowest of it."""
    if face:
        ys, xs = np.where(face_of(face))
    else:
        ys, xs = np.where(head[..., 3] > 0.5)
    low = ys > ys.max() - (ys.max() - ys.min()) * 0.04
    return float(xs[low].mean()), float(ys.max())


def cast(who):
    found = sources(who)
    if not found:
        print(who, "has no pictures yet")
        return {}
    # the look that says where the chin is: one of the batch (the edits that came together, and
    # share a framing to the pixel), with the mouth shut; for somebody who has only photos so
    # far, one of those that is not another photo altogether
    batch = {look for look in found if found[look][3] and look not in PHOTOS.get(who, {})}
    new = ([look for look in found if look in batch]
           or [look for look in found if found[look][3] and not found[look][4].get("other")] or [look for look in found if found[look][3]] or list(found))
    ref = next((look for look in SHUT if look in new), new[0])
    # (hair that is trimmed is trimmed along one line for a whole batch, under that chin: a
    # mouth that drops open must not take the hair down with it)
    heads = {look: head_of(cut, mask, how.get("turn", 0), how.get("jaw", 0), how.get("seal", 0), how.get("above", 0),
                           how.get("below", 0), found[ref][2] if look in batch else face, how.get("also"))
             for look, (cut, mask, face, _, how) in found.items()}
    at = {look: measured(head) for look, head in heads.items()}
    top, wide, middle, _ = at[ref]
    chin = chin_of(heads[ref], found[ref][2])
    k = HEAD / (chin[1] - top)
    made = {}
    theirs = list(PEOPLE[who]) + list(PHOTOS.get(who, {}))       # the order a person's own faces come in
    for look in sorted(found, key=lambda n: LOOKS.index(n) if n in LOOKS else 99 + (theirs.index(n) if n in theirs else 99)):
        head = heads[look]
        t, w, m, _ = at[look]
        same = (found[look][3] and not found[look][4].get("other")
                and abs(w / wide - 1) < SAME and abs(t - top) < SAME * wide and abs(m - middle) < SAME * wide)
        if same:
            scale, hang = k, chin
        else:
            # framed differently: the same size by the width of the head, hung from the same place on the skull
            grow = w / wide
            scale, hang = k / grow, (m + (chin[0] - middle) * grow, t + (chin[1] - top) * grow)
            if found[look][4].get("other"):
                hang = chin_of(head, found[look][2])        # (her face's selection, if her hair hangs below her chin)
            scale *= found[look][4].get("size", 1)
        ys, xs = np.where(head[..., 3] > 0.08)
        x0, x1 = max(0, xs.min() - 2), min(head.shape[1], xs.max() + 3)
        y0, y1 = max(0, ys.min() - 2), min(head.shape[0], ys.max() + 3)
        piece = head[y0:y1, x0:x1]
        size = (round(piece.shape[1] * scale), round(piece.shape[0] * scale))
        out = cv2.resize(piece, size, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
        name = f"face-{who}-{look}.png"
        mc.save(name, np.clip(out, 0, 1))
        made[look] = (name, out.shape[0] / HEAD, (hang[0] - x0) / (x1 - x0), (hang[1] - y0) / (y1 - y0))
        how = "the set's framing" if same else f"its own framing, {scale / k:.2f} of the set's size" + ("" if found[look][3] else ", from before") + (
            ", another photo: its own chin" if found[look][4].get("other") else "")
        print(f"  {who} {look}: {made[look][1]:.3f} heads tall, chin at ({made[look][2]:.3f}, {made[look][3]:.3f}); {how}")
    own = [n for n in made if n not in LOOKS]
    print(f"  {who}: {len(made) - len(own)} of the fifteen, chin from \"{ref}\"; missing: {', '.join(n for n in LOOKS if n not in made) or 'none'}; "
          f"and {len(own)} of their own: {', '.join(own) or 'none'}")
    return made


def table(everybody):
    with open(TABLE, "w") as f:
        f.write("/** Everybody's faces: for each person, the looks they have (those of the fifteen\n"
                " *  first, then the ones that are only theirs). For each look: the\n"
                " *  picture, how tall it is in heads (a head being the top of the hair to the chin\n"
                " *  with the mouth shut), and where that chin is in it (as a fraction of the\n"
                " *  picture): every face is hung from there, so that one look can be changed for\n"
                " *  another and the head stays where it was.\n"
                " *  Written by tools/make_cast.py; do not edit by hand. */\n"
                "export interface CastFace { file: string; tall: number; chin: [number, number] }\n\n"
                "export const CAST: Record<string, Record<string, CastFace>> = {\n")
        for who, looks in everybody.items():
            f.write(f"  {who}: {{\n")
            for look, (name, tall, cx, cy) in looks.items():
                f.write(f"    {look}: {{ file: '{name}', tall: {tall:.3f}, chin: [{cx:.3f}, {cy:.3f}] }},\n")
            f.write("  },\n")
        f.write("};\n")
    print("wrote", TABLE)


def keep():
    """Adobe's cutouts as they are kept: WebP, with nothing lost from the edge."""
    for png in sorted(glob.glob(os.path.join(CAST, "*", "*-cutout.png"))):
        image = Image.open(png).convert("RGBA")
        webp = png[:-4] + ".webp"
        image.save(webp, "WEBP", quality=95, method=6, exact=True)
        was = os.path.getsize(png)
        os.remove(png)
        print(os.path.relpath(webp, mc.ROOT), was, "->", os.path.getsize(webp), "bytes")


def main():
    args = sys.argv[1:]
    if "--keep" in args:
        return keep()
    elsewhere = "--to" in args
    if elsewhere:
        i = args.index("--to")
        mc.OUT = os.path.abspath(args[i + 1])
        del args[i:i + 2]
    everybody = {who: cast(who) for who in (args or PEOPLE)}
    if not elsewhere and not args:
        table({who: looks for who, looks in everybody.items() if looks})
    elif not elsewhere:
        print("(the table is written when everybody is made: run it with nobody named)")


if __name__ == "__main__":
    main()
