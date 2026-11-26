"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/homecoming) into the pieces the game loads (src/minis/homecoming/assets).

Run:  .venv/bin/python src/minis/homecoming/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "homecoming")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go


# What goes to Adobe: each figure by itself, cut off the sheet it came on (left, top, right,
# bottom, in the sheet's own pixels; None for the whole picture) and made twice the size, so
# that a head 70 pixels tall is one Adobe can find the chin of. Adobe's answers are the size
# of what it was sent, and are kept beside the sheets as <name>-cutout.png and, where a head
# comes off, <name>-headmask.png (its selection of Hair, Face and both ears).
SENT = {
    "PH2a-pappy-back": ("PH2-pappy-back.jpg", (113, 128, 613, 628)),      # (each of the two came on a card of its own)
    "PH2b-pappy-hand": ("PH2-pappy-back.jpg", (731, 128, 1231, 628)),
    "PH3-keys": ("PH3-keys.jpg", None),
    "PH4-mammy-door": ("PH4-mammy-door.jpg", None),
    "PH5a-pappy-stand": ("PH5-pappy.jpg", (0, 0, 400, 756)),
    "PH5b-pappy-kneel": ("PH5-pappy.jpg", (400, 0, 838, 756)),
    "PH5c-pappy-smooch": ("PH5-pappy.jpg", (838, 0, 1344, 756)),
    "PH6a-mammy-stand": ("PH6-mammy.jpg", (0, 0, 672, 756)),
    "PH6b-mammy-bent": ("PH6-mammy.jpg", (672, 0, 1344, 756)),
}
DOUBLED = 2


def send(folder):
    """Write the pictures that go to Adobe into `folder`, as JPEGs, and say how big each is."""
    from PIL import Image
    os.makedirs(folder, exist_ok=True)
    for name, (sheet, box) in SENT.items():
        im = Image.open(os.path.join(mc.GEN, sheet)).convert("RGB")
        if box:
            im = im.crop(box)
        im = im.resize((im.width * DOUBLED, im.height * DOUBLED), Image.LANCZOS)
        path = os.path.join(folder, f"{name}.jpg")
        im.save(path, quality=95)
        print(name, im.size, os.path.getsize(path), "bytes")


# ---- the pieces ---------------------------------------------------------------------------------

# The front of the house came twice, in the same framing: with the door shut (PH1) and, an
# edit of that, with it open on the dark hall (PH1b, which is twice the size). The open one is
# the place; the door is cut out of the shut one, and is laid over the doorway of the open one
# until it flies open. Read off the two pictures with tools/test/grid.py:
SHUT_DOOR = (690, 102, 940, 643)        # the door itself, in PH1
SHUT_LOCK, SHUT_KNOB = (706, 368), (706, 411)
DOORWAY = (1400, 198, 1910, 1300)       # the opening it fills, in PH1b
# The front door from inside (PH7) came with the wall of a room round it: only its frame, and
# what is in the frame, is kept.
INSIDE = (181, 126, 686, 1068)

# How big the two of them are drawn: so far from the floor to the chin, standing, in the game's
# own pixels (before the game makes them bigger still: SIZE in layout.ts). The other poses of
# each are the same size as that one, having come on the same sheet.
TO_CHIN = {"pappy": 200, "mammy": 196}
# Mammy in the doorway is from the hips up, and is big enough to run off the foot of the page.
DOOR_TO_CHIN = 330
# How much finer than the game's own pixels a body is kept (it is drawn bigger by SIZE, and twice over for sharp screens).
DETAIL = 2.6

OUT = {}


def rgba_of(rgb):
    return np.dstack([rgb, np.ones(rgb.shape[:2], np.float32)])


def holes_of(piece):
    """What is see-through but shut in on every side by the piece: each hole's label, and the lot."""
    solid = (piece[..., 3] > 0.5).astype(np.uint8)
    outline, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    whole = np.zeros(solid.shape, np.uint8)
    cv2.drawContours(whole, outline, -1, 1, thickness=cv2.FILLED)
    n, lab, st, mid = cv2.connectedComponentsWithStats(((whole == 1) & (solid == 0)).astype(np.uint8), 8)
    return [(st[i], mid[i], lab == i) for i in range(1, n) if st[i][cv2.CC_STAT_AREA] > 60]


def porch():
    from PIL import Image
    opened = Image.open(os.path.join(mc.GEN, "PH1b-porch-open.webp")).convert("RGB")
    # (the place is drawn 572 tall, twice over: no bigger than that is kept)
    small = opened.resize((round(opened.width * 1144 / opened.height), 1144), Image.LANCZOS)
    path = os.path.join(mc.OUT, "porch.jpg")
    small.save(path, quality=88, optimize=True)
    print("porch.jpg", small.size, os.path.getsize(path), "bytes")
    shut = mc.original("PH1-porch.jpg")
    x0, y0, x1, y1 = SHUT_DOOR
    mc.save("door.png", rgba_of(shut[y0:y1, x0:x1]))
    grow = (DOORWAY[2] - DOORWAY[0]) / (x1 - x0), (DOORWAY[3] - DOORWAY[1]) / (y1 - y0)
    at = lambda p: [round(DOORWAY[0] + (p[0] - x0) * grow[0]), round(DOORWAY[1] + (p[1] - y0) * grow[1])]
    OUT["porch"] = dict(size=list(opened.size), door=list(DOORWAY), lock=at(SHUT_LOCK), knob=at(SHUT_KNOB))
    inside = mc.original("PH7-door-inside.jpg")
    x0, y0, x1, y1 = INSIDE
    mc.save("door-in.png", rgba_of(inside[y0:y1, x0:x1]))
    OUT["doorIn"] = dict(size=[x1 - x0, y1 - y0])


def from_behind():
    """Pappy from behind, whole (the back of that head is the generated man's own, until there is
    a photo of Pappy's); and his hand, which is held by the tip of the key."""
    back = mc.trim(mc.load("PH2a-pappy-back-cutout.png"))
    mc.save("pappy-back.png", back)
    ys, xs = np.where(back[..., 3] > 0.5)
    crown = float(ys[np.abs(xs - back.shape[1] / 2) < back.shape[1] * 0.2].min())
    OUT["back"] = dict(size=[back.shape[1], back.shape[0]], crown=round(crown / back.shape[0], 4))
    hand = mc.trim(mc.load("PH2b-pappy-hand-cutout.png"))
    ys, xs = np.where(hand[..., 3] > 0.5)
    j = int(np.argmax(xs - ys))                               # the corner furthest up and to the right
    mc.save("hand-key.png", hand)
    OUT["hand"] = dict(size=[hand.shape[1], hand.shape[0]], tip=[round(float(xs[j]) / hand.shape[1], 4), round(float(ys[j]) / hand.shape[0], 4)])


def keys():
    """The ring with its tag, and the three keys, left to right on their sheet. Each key is held
    by the hole in its head; the ring by its own middle. The tag's paper came back see-through
    (white, on a white sheet): it is put back."""
    sheet = sorted(mc.pieces(mc.load("PH3-keys-cutout.png"), 2000), key=lambda p: p[0])
    assert len(sheet) == 4, f"{len(sheet)} things on the sheet of keys: there should be the ring and three keys"
    ring = sheet[0][2].copy()
    holes = sorted(holes_of(ring), key=lambda h: h[1][1])     # top to bottom: the ring's, the links', the tag's
    (rx, ry, rw, rh, _), mid, _ = max(holes[:1], key=lambda h: h[0][cv2.CC_STAT_AREA])
    tag = max(holes, key=lambda h: h[0][cv2.CC_STAT_AREA] if h[1][1] > ring.shape[0] * 0.5 else 0)
    ring[tag[2]] = (0.98, 0.97, 0.93, 1.0)
    soft = cv2.GaussianBlur(tag[2].astype(np.float32), (0, 0), 1.2)
    ring[..., 3] = np.maximum(ring[..., 3], soft)
    mc.save("ring.png", ring)
    tx, ty, tw, th, _ = tag[0]
    h, w = ring.shape[:2]
    OUT["ring"] = dict(size=[w, h], centre=[round(float(mid[0]) / w, 4), round(float(mid[1]) / h, 4)], across=round(float(rw + rh) / 2 / w, 4),
                       tag=[round(tx / w, 4), round(ty / h, 4), round((tx + tw) / w, 4), round((ty + th) / h, 4)])
    OUT["keys"] = []
    for i, (_, _, key) in enumerate(sheet[1:]):
        (hx, hy, hw, hh, _), mid, _ = max(holes_of(key), key=lambda h: h[0][cv2.CC_STAT_AREA])
        h, w = key.shape[:2]
        mc.save(f"key{i}.png", key)
        OUT["keys"].append(dict(size=[w, h], hole=[round(float(mid[0]) / w, 4), round(float(mid[1]) / h, 4)]))


def body(sheet, name, scale=None, to_chin=None, hold="feet"):
    """Somebody whose head comes off, for theirs to go on: the piece, the spot on the floor it is
    held by (under the feet; or, kneeling, at the knees, so that he can lean without moving), and
    where the chin goes from there. Returns how big a pixel of the sheet is drawn, for the next
    pose off the same sheet."""
    cut = mc.load(f"{sheet}-cutout.png")
    head = mc.selection(f"{sheet}-headmask.png")
    rest = mc.without_heads(cut, [head])
    (cx, cy), tall = mc.chin_of(head)
    x0, x1, y0, y1 = mc.boxed(rest)
    ys, xs = np.where(rest[..., 3] > 0.3)
    floor = float(ys.max())
    low = ys > floor - (floor - cy) * 0.07
    if hold == "knees":
        spot = float(xs[low].max()) - (floor - cy) * 0.1
    elif hold == "foot":
        spot = (x0 + x1) / 2
    else:
        spot = float(np.median(xs[low]))
    if scale is None:
        scale = to_chin / (floor - cy)
    piece = mc.smaller(rest[y0:y1, x0:x1], min(1, scale * DETAIL))
    mc.save(f"{name.replace('_', '-')}.png", piece)
    OUT.setdefault("bodies", {})[name] = dict(
        h=round((y1 - y0) * scale, 1), at=[round((spot - x0) / (x1 - x0), 4), round((floor - y0) / (y1 - y0), 4)],
        chin=[round((cx - spot) * scale, 1), round((cy - floor) * scale, 1)], head=round(tall * scale, 1))
    return scale, rest, (spot, floor)


def people():
    k, _, _ = body("PH5a-pappy-stand", "pappy_stand", to_chin=TO_CHIN["pappy"])
    body("PH5b-pappy-kneel", "pappy_kneel", scale=k, hold="knees")
    body("PH5c-pappy-smooch", "pappy_smooch", scale=k, hold="knees")
    k, _, _ = body("PH6a-mammy-stand", "mammy_stand", to_chin=TO_CHIN["mammy"])
    _, bent, (spot, floor) = body("PH6b-mammy-bent", "mammy_bent", scale=k)
    # where a kiss lands: on the bloomers (white, with hearts), a little way in from the back of
    # them and above the middle (the lower it is, the further over he has to tip to reach it)
    tone = mc.hsv(bent)
    white = ((tone[..., 1] < 0.16) & (tone[..., 2] > 0.78) & (bent[..., 3] > 0.9)).astype(np.uint8)
    white = cv2.morphologyEx(white, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    n, lab, st, mid = cv2.connectedComponentsWithStats(white, 8)
    x, y, w, h, _ = st[1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))]
    OUT["kiss"] = [round((x + w * 0.16 - spot) * k, 1), round((y + h * 0.36 - floor) * k, 1)]
    OUT["bloomers"] = [round((x - spot) * k, 1), round((y - floor) * k, 1), round((x + w - spot) * k, 1), round((y + h - floor) * k, 1)]
    body("PH4-mammy-door", "mammy_door", to_chin=DOOR_TO_CHIN, hold="foot")


def cut():
    import json
    porch()
    from_behind()
    keys()
    people()
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
