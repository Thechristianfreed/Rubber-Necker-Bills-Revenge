"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/ride) into the pieces the game loads (src/minis/ride/assets).

Run:  .venv/bin/python src/minis/ride/cut.py        (how the cutouts are made: docs/cutting.md)

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

mc.SRC = os.path.join(ROOT, "art-src", "games", "ride")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go

# What goes to Adobe. People one at a time, cut off the sheet they came on (left, top, right,
# bottom, in the sheet's own pixels) and made bigger (DOUBLED), so that a head 60 pixels tall is
# one Adobe can find the chin of: each is sent for its background off (-cutout.png) and its
# head selected (-headmask.png: Hair, Face and both ears). The sheets of animals and things go
# whole, for their backgrounds only. Adobe's answers are the size of what it was sent, and are
# kept beside the sheets. (RD2, RD3 and RD5 came as photos stitched side by side: each figure's
# box keeps clear of the seams where it can.)
PEOPLE = {
    "RD1a-steph-hold": ("RD1-kids.jpg", (90, 60, 420, 756), "the girl"),
    "RD1b-steph-stand": ("RD1-kids.jpg", (470, 60, 840, 756), "the girl"),
    "RD1c-curt": ("RD1-kids.jpg", (890, 40, 1270, 756), "the boy"),
    "RD2a-pappy-wait": ("RD2-pappy-van.jpg", (110, 60, 450, 740), "the man"),
    "RD2b-pappy-ready": ("RD2-pappy-van.jpg", (470, 60, 860, 740), "the man"),
    "RD2c-pappy-kick": ("RD2-pappy-van.jpg", (850, 60, 1344, 740), "the man"),
    "RD3a-pappy-kiss": ("RD3-celebrate.jpg", (40, 60, 440, 756), "the man"),
    "RD3b-pappy-bottle": ("RD3-celebrate.jpg", (480, 30, 880, 756), "the man"),
    "RD3c-mammy-glass": ("RD3-celebrate.jpg", (940, 60, 1344, 756), "the woman"),
}
WHOLE = ["RD4-dogs.jpg", "RD5-duck.jpg", "RD6-van.jpg", "RD9-things.jpg"]
DOUBLED = 2


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
# How much finer than the game's own pixels a piece is kept (it is drawn bigger still, and twice
# over for sharp screens).
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


# The inside of the van (RD7): the doorway, a four-cornered opening on the left of the picture
# (top left, top right, foot of the right side, foot of the left side), is cut out of it, so
# that the forest of RD8 shows through, and what is kicked out goes behind its frame. Its sill
# runs along the foot of it; the bench seat at the back is where the rest wait their turn.
# Read off the picture with tools/test/grid.py.
DOORWAY = [(172, 95), (594, 150), (597, 628), (192, 712)]
BENCH = 586
# The edge of town (RD8): the forest down to where the road starts, for the end of the drive; and
# where the moon is, for the view through the door.
ROAD = 480
MOON = (875, 85)


def places():
    from PIL import Image, ImageDraw
    inside = mc.original("RD7-inside.jpg")
    h, w = inside.shape[:2]
    hole = Image.new("L", (w, h), 0)
    ImageDraw.Draw(hole).polygon(DOORWAY, fill=255)
    hole = cv2.GaussianBlur(np.asarray(hole, np.float32) / 255, (0, 0), 1.2)
    rgba = np.dstack([inside, 1 - hole])
    mc.save("inside.png", rgba)
    OUT["inside"] = dict(size=[w, h], door=[list(p) for p in DOORWAY], bench=BENCH)
    edge = mc.original("RD8-edge.jpg")
    jpeg("edge.jpg", edge)
    # (the strip repeats, so it is the picture and the picture turned round, side by side: no seam)
    wood = edge[:ROAD]
    jpeg("forest.jpg", np.concatenate([wood, wood[:, ::-1]], axis=1))
    OUT["edge"] = dict(size=[edge.shape[1], edge.shape[0]], road=ROAD, moon=list(MOON))


def roger():
    """Roger is one of the dogs (the owner's wish): sitting, he is the common picture as it is
    (`roger-sit.png`, registered under this game's own name in index.ts); out of the van window
    he is his head with his tongue out, cut from the photo of him sitting up happy (Adobe's
    cutout of it is with the common pictures: it is read, not changed)."""
    happy = np.asarray(Image_open(os.path.join(ROOT, "art-src", "adobe", "roger-happy-cutout.png")), dtype=np.float32) / 255
    head = mc.trim(mc.ellipse_crop(happy, 500, 300, 250, 262))
    mc.save("roger-head.png", mc.smaller(head, 0.5))


def Image_open(path):
    from PIL import Image
    return Image.open(path).convert("RGBA")


# ---- the people ----------------------------------------------------------------------------------

# How big each of them is drawn: so far from the floor to the chin, in the game's own pixels (as
# their paper stand-ins are, in layout.ts). The other poses on a sheet are the same size as its first.
TO_CHIN = {"kid": 130, "pappy": 196, "mammy": 200}


def body(sheet, name, scale=None, to_chin=None):
    """Somebody whose head comes off, for theirs to go on: the piece, held by the spot on the floor
    under their feet, and where the chin goes from there (as "Pappy comes home" cuts them)."""
    cut = mc.load(f"{sheet}-cutout.png")
    head = mc.selection(f"{sheet}-headmask.png")
    rest = mc.without_heads(cut, [head])
    (cx, cy), tall = mc.chin_of(head)
    x0, x1, y0, y1 = mc.boxed(rest)
    ys, xs = np.where(rest[..., 3] > 0.3)
    floor = float(ys.max())
    low = ys > floor - (floor - cy) * 0.07
    spot = float(np.median(xs[low]))
    if scale is None:
        scale = to_chin / (floor - cy)
    piece = mc.smaller(rest[y0:y1, x0:x1], min(1, scale * DETAIL))
    mc.save(f"{name.replace('_', '-')}.png", piece)
    at = lambda p: [round((p[0] - spot) * scale, 1), round((p[1] - floor) * scale, 1)]
    OUT.setdefault("bodies", {})[name] = dict(
        h=round((y1 - y0) * scale, 1), at=[round((spot - x0) / (x1 - x0), 4), round((floor - y0) / (y1 - y0), 4)],
        chin=at((cx, cy)), head=round(tall * scale, 1))
    return scale, rest, at


def people():
    if not has("RD3c-mammy-glass-headmask.png"):
        return
    k, _, _ = body("RD1b-steph-stand", "steph_stand", to_chin=TO_CHIN["kid"])
    body("RD1a-steph-hold", "steph_hold", scale=k)
    body("RD1c-curt", "curt_stand", to_chin=TO_CHIN["kid"])
    k, _, _ = body("RD2a-pappy-wait", "pappy_wait", to_chin=TO_CHIN["pappy"])
    body("RD2b-pappy-ready", "pappy_ready", scale=k)
    _, kick, at = body("RD2c-pappy-kick", "pappy_kick", scale=k)
    ys, xs = np.where(kick[..., 3] > 0.5)
    j = int(np.argmin(xs))                                  # the toe of the kicking foot: furthest left
    OUT["foot"] = at((float(xs[j]), float(ys[j])))
    k, _, _ = body("RD3a-pappy-kiss", "pappy_kiss", to_chin=TO_CHIN["pappy"])
    _, bottle, at = body("RD3b-pappy-bottle", "pappy_bottle", scale=k)
    ys, xs = np.where(bottle[..., 3] > 0.5)
    j = int(np.argmin(ys))                                  # the neck of the bottle: highest of him
    OUT["bottle"] = at((float(xs[j]), float(ys[j])))
    _, glass, at = body("RD3c-mammy-glass", "mammy_glass", to_chin=TO_CHIN["mammy"])
    ys, xs = np.where(glass[..., 3] > 0.3)
    j = int(np.argmin(ys))
    OUT["glass"] = at((float(xs[j]), float(ys[j])))


# ---- the animals ---------------------------------------------------------------------------------

# Each dog's head on RD4 (an oval round it: middle, and how far across and up and down), for the
# window of the van; and Mr. Quacks's on RD5.
DOG_HEADS = [(192, 262, 94, 80), (625, 285, 86, 86), (1010, 268, 94, 78)]
DUCK_HEAD = (222, 268, 88, 66)


def animals():
    if has("RD4-dogs-cutout.png"):
        sheet = mc.load("RD4-dogs-cutout.png")
        dogs = sorted(mc.pieces(sheet, 4000), key=lambda p: p[0])
        assert len(dogs) == 3, f"{len(dogs)} dogs on RD4: there should be three"
        for i, (_, _, piece) in enumerate(dogs):
            mc.save(f"dog{i}.png", mc.smaller(piece, 0.5))
            head = mc.trim(mc.ellipse_crop(sheet, *DOG_HEADS[i]))
            mc.save(f"dog{i}-head.png", mc.smaller(head, 0.6))
    if has("RD5-duck-cutout.png"):
        sheet = mc.load("RD5-duck-cutout.png")
        two = sorted(mc.pieces(sheet, 4000), key=lambda p: p[0])
        assert len(two) == 2, f"{len(two)} ducks on RD5: there should be two"
        mc.save("duck.png", mc.smaller(two[0][2], 0.4))
        mc.save("duck-fly.png", mc.smaller(two[1][2], 0.4))
        mc.save("duck-head.png", mc.smaller(mc.trim(mc.ellipse_crop(sheet, *DUCK_HEAD)), 0.5))


# ---- the van, and the things -----------------------------------------------------------------------

# The van (RD6): where the ground is under its wheels, the middle of the two wheels across, the foot
# of its windows, and where along that foot each head goes (the five of them, then Pappy at the
# wheel), and its headlamp. Read off the cutout with tools/test/grid.py.
VAN_GROUND, VAN_MIDDLE, SILL = 650, 662, 340
HEADS = [745, 590, 270, 465, 368]
DRIVER = 950
LAMP = (1205, 465)


def van():
    if not has("RD6-van-cutout.png"):
        return
    cut = mc.load("RD6-van-cutout.png")
    # (its windows are glass, and some of the background came through them: shut that in)
    cut = mc.seal_glass(cut, mc.original("RD6-van.jpg"), 0.6)
    x0, x1, y0, y1 = mc.boxed(cut)
    mc.save("van.png", mc.smaller(cut[y0:y1, x0:x1], 0.6))
    w = x1 - x0
    OUT["van"] = dict(size=[int(w), int(y1 - y0)], at=[round((VAN_MIDDLE - x0) / w, 4), round((VAN_GROUND - y0) / (y1 - y0), 4)],
                      sill=SILL - VAN_GROUND, heads=[x - VAN_MIDDLE for x in HEADS], driver=DRIVER - VAN_MIDDLE,
                      lamp=[LAMP[0] - VAN_MIDDLE, LAMP[1] - VAN_GROUND])


def things():
    """The sign at the edge of town (blank: the game letters it), a dustbin, the champagne, a glass."""
    if not has("RD9-things-cutout.png"):
        return
    four = sorted(mc.pieces(mc.load("RD9-things-cutout.png"), 3000), key=lambda p: p[0])
    assert len(four) == 4, f"{len(four)} things on RD9: there should be four"
    for name, (_, _, piece) in zip(("sign", "can", "bottle", "glass"), four):
        mc.save(f"{name}.png", mc.smaller(piece, 0.6))
    sign = four[0][2]
    tone = mc.hsv(sign)
    green = ((tone[..., 0] > 120) & (tone[..., 0] < 190) & (tone[..., 1] > 0.35) & (sign[..., 3] > 0.9)).astype(np.uint8)
    ys, xs = np.where(green > 0)
    h, w = sign.shape[:2]
    OUT["sign"] = [round(float(xs.min()) / w, 4), round(float(ys.min()) / h, 4), round(float(xs.max()) / w, 4), round(float(ys.max()) / h, 4)]


def cut():
    import json
    places()
    roger()
    people()
    animals()
    van()
    things()
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
