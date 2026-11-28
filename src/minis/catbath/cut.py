"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/catbath) into the pieces the game loads (src/minis/catbath/assets).

Run:  .venv/bin/python src/minis/catbath/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.
"""
import os
import shutil
import sys

import cv2  # noqa: F401
import numpy as np  # noqa: F401

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "catbath")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go

# What goes to Adobe. People one at a time, cut off the sheet they came on (left, top, right,
# bottom, in the sheet's own pixels) and made bigger (DOUBLED), so that a head 40 pixels tall is
# one Adobe can find the chin of: each is sent for its background off (-cutout.png) and its
# head selected (-headmask.png: Hair, Face and both ears). The sheets of animals and things go
# whole, for their backgrounds only. Adobe's answers are the size of what it was sent, and are
# kept beside the sheets.
PEOPLE = {
    # (CB4 came as six tiles side by side, each a photo of its own: each is sent by itself)
    "CB4a-pappy-stand": ("CB4-pappy.jpg", (0, 196, 224, 560), "the man"),
    "CB4b-pappy-grab": ("CB4-pappy.jpg", (224, 196, 448, 560), "the man"),
    "CB4c-pappy-choke": ("CB4-pappy.jpg", (448, 196, 672, 560), "the man"),
    "CB4d-pappy-scrub": ("CB4-pappy.jpg", (672, 196, 896, 560), "the man"),
    "CB4e-pappy-wring": ("CB4-pappy.jpg", (896, 196, 1120, 560), "the man"),
    "CB4f-pappy-hang": ("CB4-pappy.jpg", (1120, 196, 1344, 560), "the man"),
}
WHOLE = ["CB3-sink.jpg", "CB5-cats.jpg", "CB6a-tabby.jpg", "CB6b-black.jpg", "CB6c-grey.jpg", "CB7-peg.jpg"]
# (and CB8-wrung.jpg, when it comes: the three cats twisted like towels, sent whole for its background)
# (he is small on his sheet, a head about 40 pixels tall: three times the size)
DOUBLED = 3


def send(folder):
    """Write the pictures that go to Adobe into `folder`, as JPEGs, and say how big each is."""
    from PIL import Image
    os.makedirs(folder, exist_ok=True)
    for name, (sheet, box, _) in PEOPLE.items():
        im = Image.open(os.path.join(mc.GEN, sheet)).convert("RGB").crop(box)
        im = im.resize((im.width * DOUBLED, im.height * DOUBLED), Image.LANCZOS)
        im.save(os.path.join(folder, f"{name}.jpg"), quality=95)
    for sheet in WHOLE:
        shutil.copyfile(os.path.join(mc.GEN, sheet), os.path.join(folder, sheet))
    for f in sorted(os.listdir(folder)):
        print(f, os.path.getsize(os.path.join(folder, f)), "bytes")


# ---- the pieces ---------------------------------------------------------------------------------

OUT = {}
DETAIL = 2.6


def has(*names):
    """Whether Adobe's answers for these are here yet (each step waits for its own)."""
    return all(os.path.exists(os.path.join(mc.SRC, n)) for n in names)


def jpeg(name, rgb, quality=88):
    from PIL import Image
    im = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")
    path = os.path.join(mc.OUT, name)
    im.save(path, quality=quality, optimize=True)
    print(name, im.size[0], "x", im.size[1], os.path.getsize(path), "bytes")


# The kitchen (CB1) was taken from the sink: the counter in front of the sink runs across the foot
# of the picture, and its edge is this far down it. In the game that edge goes behind the
# counter Pappy stands at. The counter (CB2): its top starts this far down the picture.
KITCHEN_EDGE = 585
COUNTER_TOP = 50


def places():
    kitchen = mc.original("CB1-kitchen.jpg")
    jpeg("kitchen.jpg", kitchen)
    OUT["kitchen"] = dict(size=[kitchen.shape[1], kitchen.shape[0]], edge=KITCHEN_EDGE)
    counter = mc.original("CB2-counter.jpg")[COUNTER_TOP:]
    # (a strip that repeats: the picture and the picture turned round, side by side, so that there is no seam)
    jpeg("counter.jpg", cv2.resize(np.concatenate([counter, counter[:, ::-1]], axis=1), None, fx=0.6, fy=0.6, interpolation=cv2.INTER_AREA))
    OUT["counter"] = dict(size=[counter.shape[1] * 2, counter.shape[0]])


# Pappy at the sink (CB4): six photos of him from the thighs up, each by itself. His own head comes
# off and his photo head goes on at the chin. Where his fists are in each, in the pixels of what
# was sent to Adobe (three times the size of the sheet), read off with tools/test/grid.py: a cat
# he is holding is held between them, and the two fists are cut out again to go in front of it.
FISTS = {
    "stand": [(130, 870), (520, 870)],
    "grab": [(75, 715), (590, 930)],
    "choke": [(595, 420), (610, 485)],
    "scrub": [(480, 850), (545, 845)],
    "wring": [(510, 643), (590, 535)],
    "hang": [(238, 113), (448, 113)],
}
# His generated head is made this tall (as his bodies in "Pappy comes home" are, so that he is one
# size in both), and his chin is this far up from the spot he is held by (as the paper one's).
HEAD_TALL = 39.5
TO_CHIN = 200
FIST_R = 46


def pappy():
    if not has("CB4a-pappy-stand-cutout.png"):
        return
    OUT["bodies"] = {}
    for letter, pose in zip("abcdef", FISTS):
        name = f"CB4{letter}-pappy-{pose}"
        cut = mc.load(f"{name}-cutout.png")
        head = mc.selection(f"{name}-headmask.png")
        rest = mc.without_heads(cut, [head])
        (cx, cy), tall = mc.chin_of(head)
        k = HEAD_TALL / tall
        x0, x1, y0, y1 = mc.boxed(rest)
        piece = rest[y0:y1, x0:x1]
        mc.save(f"pappy-{pose}.png", mc.smaller(piece, min(1, k * DETAIL)))
        # held by a spot TO_CHIN under his chin (below the foot of the picture: the counter hides that)
        spot = (cx, cy + TO_CHIN / k)
        to = lambda p: [round((p[0] - spot[0]) * k, 1), round((p[1] - spot[1]) * k, 1)]
        fists = FISTS[pose]
        # a cat is held between his fists; but choking one, his fists are one above the other, and
        # the top one is round its neck (the bottom one is on its chest, behind it)
        grip = min(fists, key=lambda f: f[1]) if pose == "choke" else ((fists[0][0] + fists[1][0]) / 2, (fists[0][1] + fists[1][1]) / 2)
        OUT["bodies"][pose] = dict(
            h=round((y1 - y0) * k, 1), at=[round((spot[0] - x0) / (x1 - x0), 4), round((spot[1] - y0) / (y1 - y0), 4)],
            chin=to((cx, cy)), hands=[to(f) for f in fists], grip=to(grip),
            turn=round(float(np.arctan2(fists[1][1] - fists[0][1], fists[1][0] - fists[0][0])), 3), fist=round(FIST_R * 2 * k, 1))
        # the fists again, by themselves, to go in front of whatever he holds
        if pose in ("choke", "scrub", "wring", "hang"):
            for i, (fx, fy) in enumerate(fists):
                fist = mc.ellipse_crop(rest, fx, fy, FIST_R, FIST_R, feather=4)
                fist = fist[max(0, fy - FIST_R):fy + FIST_R, max(0, fx - FIST_R):fx + FIST_R]
                mc.save(f"pappy-{pose}-fist{i}.png", mc.smaller(fist, min(1, k * DETAIL)))


def sink():
    """The washboard, the sprayer and the tap, left to right; and the heap of suds, which the
    background removal left out, selected by itself."""
    if not has("CB3-sink-cutout.png", "CB3-sink-sudsmask.png"):
        return
    sheet = sorted(mc.pieces(mc.load("CB3-sink-cutout.png"), 3000), key=lambda p: p[0])
    assert len(sheet) >= 3, f"{len(sheet)} things on the sheet at the sink: there should be the washboard, the sprayer and the tap"
    for name, (_, _, piece) in zip(("board", "sprayer", "tap"), sheet):
        mc.save(f"{name}.png", mc.smaller(piece, 0.6))
    suds = mc.original("CB3-sink.jpg")
    mask = mc.selection("CB3-sink-sudsmask.png")
    mc.save("suds.png", mc.smaller(mc.trim(np.dstack([suds, cv2.GaussianBlur(mask, (0, 0), 1.0)])), 0.6))


def top_middle(piece):
    """Where a cat hanging on the line is pegged: the top of its head, in the middle."""
    a = piece[..., 3] > 0.5
    h, w = a.shape
    cols = slice(int(w * 0.32), int(w * 0.68))
    ys = np.where(a[:, cols].any(axis=1))[0]
    return 0.5, round(float(ys.min()) / h, 4)


# How far down each cat held up in his hands its neck is, read off the pictures with a ruled grid
# (its chin is at 0.21, 0.20 and 0.17): the same on all three, which are one sheet with the cat
# changed. It is held half a fist below the chin, so that his fist is round its neck and not over
# its mouth.
NECK = {"mad": 0.27, "out": 0.26, "wet": 0.23}


def neck_of(piece, how):
    """Where he has hold of a cat: round its neck, in the middle of it at that height (the middle
    third across, clear of the paws it holds up beside its head)."""
    a = piece[..., 3] > 0.5
    h, w = a.shape
    y = int(NECK[how] * h)
    row = np.where(a[y, int(w * 0.3):int(w * 0.7)])[0] + int(w * 0.3)
    x = float(row.mean()) / w if len(row) else 0.5
    return round(x, 4), NECK[how]


def cats():
    if has("CB5-cats-cutout.png"):
        for i, (_, _, piece) in enumerate(sorted(mc.pieces(mc.load("CB5-cats-cutout.png"), 3000), key=lambda p: p[0])[:3]):
            mc.save(f"cat{i}-sit.png", mc.smaller(piece, 0.6))
    OUT["cats"] = {}
    for i, sheet in enumerate(("CB6a-tabby", "CB6b-black", "CB6c-grey")):
        if not has(f"{sheet}-cutout.png"):
            continue
        five = sorted(mc.pieces(mc.load(f"{sheet}-cutout.png"), 3000), key=lambda p: p[0])
        assert len(five) == 5, f"{len(five)} cats on {sheet}: there should be five"
        held = {}
        for name, (_, _, piece) in zip(("mad", "out", "wet", "wrung", "dry"), five):
            mc.save(f"cat{i}-{name}.png", mc.smaller(piece, 0.7))
            # held by the neck in his hands; pegged by the top of the head on the line
            held[name] = neck_of(piece, name) if name in NECK else top_middle(piece)
            if name == "wet":
                held["line"] = top_middle(piece)
        OUT["cats"][i] = held


def wrung():
    """CB8, if it has come: the three cats twisted like towels, one above another (the orange tabby,
    the black, the grey), in place of the fourth of each one's five, which came lying limp on its
    side. Its background off by Adobe like the rest, as CB8-wrung-cutout.png."""
    if not has("CB8-wrung-cutout.png"):
        return
    three = sorted(mc.pieces(mc.load("CB8-wrung-cutout.png"), 3000), key=lambda p: p[1])
    assert len(three) == 3, f"{len(three)} cats on CB8: there should be three"
    for i, (_, _, piece) in enumerate(three):
        mc.save(f"cat{i}-wrung.png", mc.smaller(piece, 0.7))


def peg():
    if has("CB7-peg-cutout.png"):
        mc.save("peg.png", mc.smaller(max(mc.pieces(mc.load("CB7-peg-cutout.png"), 3000), key=lambda p: p[2].size)[2], 0.25))


def cut():
    import json
    places()
    pappy()
    sink()
    cats()
    wrung()
    peg()
    table = os.path.join(HERE, "cut.ts")
    with open(table, "w") as f:
        f.write("/** Where things are in this game's photos: how big each piece is, where it is held, where a chin\n")
        f.write(" *  goes. Written by cut.py from the pictures themselves: do not edit by hand. */\n")
        f.write("export const CUT = " + json.dumps(OUT, indent=2) + ";\n")
    print("wrote", os.path.relpath(table, ROOT))


if __name__ == "__main__":
    if sys.argv[1:2] == ["send"]:
        send(sys.argv[2])
    else:
        cut()
