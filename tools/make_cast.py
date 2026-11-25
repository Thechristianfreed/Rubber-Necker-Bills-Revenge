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
the set, until a picture of that look comes with the others. One that is not
(the breath held in, the doe eyes) keeps a name of its own: no face that has
been made is left out, and a new game can use any of them.

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
    "shane": {"cry": "PB-shane-5", "shocked": ("PB-shane-4", {"other": True, "turn": -8}),
              "beam": "PB-shane-1", "wary": ("PB-shane-2", {"other": True}), "smirk": ("PB-shane-3", {"other": True, "turn": -17}),
              "doe": "PB-shane-6"},
}

# A look whose head is this near the usual place and size in its picture has the same framing.
SAME = 0.02


def picture(path):
    return np.asarray(Image.open(path).convert("RGBA"), dtype=np.float32) / 255.0


def selected(path):
    m = picture(path)
    return m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)


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
            found[look] = (cut, mask, face if os.path.exists(face) else None, True, {})     # a new one takes an old one's place
    return found


def head_of(cut, mask, turn=0, jaw=0):
    """The head alone: Adobe's cutout where its selection of the head says, the holes it
    leaves at the eyes and mouth filled in, and only the one biggest piece of it. Then, where
    the picture needs it, the jaw drawn out to where the chin really is, and the head set straight."""
    rgba = picture(cut)
    sel = selected(mask)
    solid = (sel > 0.5).astype(np.uint8)
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
        ys, xs = np.where(selected(face) > 0.5)
    else:
        ys, xs = np.where(head[..., 3] > 0.5)
    low = ys > ys.max() - (ys.max() - ys.min()) * 0.04
    return float(xs[low].mean()), float(ys.max())


def cast(who):
    found = sources(who)
    if not found:
        print(who, "has no pictures yet")
        return {}
    heads = {look: head_of(cut, mask, how.get("turn", 0), how.get("jaw", 0)) for look, (cut, mask, _, _, how) in found.items()}
    at = {look: measured(head) for look, head in heads.items()}
    # the look that says where the chin is: one of the new set, with the mouth shut
    new = [look for look in found if found[look][3]] or list(found)
    ref = next((look for look in SHUT if look in new), new[0])
    top, wide, middle, _ = at[ref]
    chin = chin_of(heads[ref], found[ref][2])
    k = HEAD / (chin[1] - top)
    made = {}
    for look in sorted(found, key=lambda n: LOOKS.index(n) if n in LOOKS else 99 + list(PEOPLE[who]).index(n)):
        head = heads[look]
        t, w, m, _ = at[look]
        same = found[look][3] and abs(w / wide - 1) < SAME and abs(t - top) < SAME * wide and abs(m - middle) < SAME * wide
        if same:
            scale, hang = k, chin
        else:
            # framed differently: the same size by the width of the head, hung from the same place on the skull
            grow = w / wide
            scale, hang = k / grow, (m + (chin[0] - middle) * grow, t + (chin[1] - top) * grow)
            if found[look][4].get("other"):
                hang = chin_of(head, None)
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
