"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/favorite) into the pieces the game loads (src/minis/favorite/assets).

Run:  .venv/bin/python src/minis/favorite/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.

Three pictures:

FV1, the bottle (the owner's picture of the Williams Selyem Pinot Noir, on white;
Adobe took the white off). It is cut twice: as it is, full, and again with the wine
gone, the glass above and below the label turned to empty green glass. The game lays
the full one over the empty one and takes it away from the top down as the evening
goes on.

FV2, Bill's three hands on one sheet: pointing, a finger up for "shh", and open,
to hold beside his mouth. Each is cut out by itself, and where the game holds it
(the wrist, the finger, the palm) is written into hands.ts beside this file.

FV3, a red card heart. It is cut twice as well: as it is, and the same shape to the
pixel in charcoal grey, for the heart with nothing in it. The game lays the red one
over the grey one and takes it away from the top down as a boy feels less special.
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "favorite")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go

# How tall the bottle is kept: it is drawn about 170 of the game's pixels tall, at twice that.
TALL = 640
# Where the glass shows, as fractions of the bottle's height: between the foil and the label,
# and under the label. (FavoriteMini.ts has the first pair too, as GLASS: the wine goes down
# from the one to the other.)
GLASS = ((0.192, 0.566), (0.94, 1.0))
# What empty glass looks like, and how much of whatever is behind it shows through.
GREEN = np.array([0.34, 0.47, 0.2], dtype=np.float32)
SEE_THROUGH = 0.2


def bottle():
    full = mc.trim(mc.load("FV1-bottle-cutout.png"), margin=0)
    h, w = full.shape[:2]
    full = cv2.resize(full, (round(w * TALL / h), TALL), interpolation=cv2.INTER_AREA)
    mc.save("bottle.png", full)

    # ...and empty: only the glass changes (the foil and the label are as they were)
    empty = full.copy()
    rgb, light = empty[..., :3], empty[..., :3].max(axis=2)
    rows = np.zeros(TALL, bool)
    for top, bottom in GLASS:
        rows[round(top * TALL):round(bottom * TALL)] = True
    # (everything in those rows that is not red: the dark glass, and the light on it)
    glass = rows[:, None] & (rgb[..., 0] - rgb[..., 1] < 0.18)
    # (its own shine is kept: brighter where the photo was brighter)
    shine = np.minimum(0.7 + 2.2 * light, 2.1)[..., None]
    rgb[glass] = np.clip(GREEN * shine, 0, 1)[glass]
    empty[..., 3][glass] *= 1 - SEE_THROUGH
    mc.save("bottle-empty.png", empty)


# ---- FV2: Bill's hands --------------------------------------------------------------------

# How many of the game's pixels one of the sheet's is: a hand comes out about as long as
# the paper one it replaces (86 from fingertip to wrist), which is a little under a face.
HAND_SCALE = 0.22
# The three, left to right on the sheet: what the game calls each, and the point on the
# sheet that it is held by (read off a grid: tools/test/grid.py).
HANDS = (
    ("point", (165, 440)),    # the wrist, where the cuff starts: the arm comes in level from the left
    ("shh", (717, 292)),      # the foot of the finger that is up: his lips are just above it
    ("cup", (1095, 390)),     # the middle of the palm
)
TABLE = os.path.join(HERE, "hands.ts")


def apart(rgba, min_area=400):
    """A sheet's separate cutouts, left to right: (x, y, piece), where (x, y) is where the
    piece's own top left corner is on the sheet. (As mc.pieces, which trims each piece but
    does not say by how much.)"""
    n, lab, stats, _ = cv2.connectedComponentsWithStats((rgba[..., 3] > 0.16).astype(np.uint8), 8)
    out = []
    for i in range(1, n):
        if stats[i][4] < min_area:
            continue
        near = cv2.dilate((lab == i).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
        piece = rgba.copy()
        piece[~near] = 0
        ys, xs = np.where(piece[..., 3] > 0.08)
        x0, y0 = max(0, xs.min() - 2), max(0, ys.min() - 2)
        out.append((int(x0), int(y0), piece[y0:min(piece.shape[0], ys.max() + 3), x0:min(piece.shape[1], xs.max() + 3)]))
    return sorted(out, key=lambda p: p[0])


def hands():
    sheet = apart(mc.load("FV2-hands-cutout.webp"))
    assert len(sheet) == len(HANDS), f"{len(sheet)} hands on the sheet, not {len(HANDS)}"
    rows = []
    for (name, (hx, hy)), (x, y, piece) in zip(HANDS, sheet):
        h, w = piece.shape[:2]
        assert 0 <= hx - x < w and 0 <= hy - y < h, f"the {name} hand is not held inside its own picture"
        mc.save(f"hand-{name}.png", piece)
        rows.append(f"  {name}: {{ file: 'hand-{name}.png', scale: {HAND_SCALE}, anchor: [{(hx - x) / w:.3f}, {(hy - y) / h:.3f}] }},")
    with open(TABLE, "w") as f:
        f.write("/** Bill's hands (FV2), as they are cut from the sheet: the picture, how many of the game's\n"
                " *  pixels one of its own is, and the point each is held by, as a fraction of the picture\n"
                " *  (the wrist of the one that points, the foot of the finger that is up, the middle of the\n"
                " *  open palm). Each is a right hand, and the game turns it over for the other side.\n"
                " *  Written by cut.py; do not edit by hand. */\n"
                "export const HANDS: Record<string, { file: string; scale: number; anchor: [number, number] }> = {\n"
                + "\n".join(rows) + "\n};\n")
    print("hands.ts", len(rows), "hands")


# ---- FV3: the heart -----------------------------------------------------------------------

# How wide the heart is kept: it is drawn 46 of the game's pixels wide, at twice that.
HEART_WIDE = 240
# What the heart with nothing in it is cut from: charcoal-grey card, and how much of the red
# one's shine it keeps.
CHARCOAL = np.array([0.2, 0.19, 0.22], dtype=np.float32)
SHEEN = 0.5


def heart():
    full = mc.trim(mc.load("FV3-heart-cutout.webp"), margin=0)
    h, w = full.shape[:2]
    full = cv2.resize(full, (HEART_WIDE, round(h * HEART_WIDE / w)), interpolation=cv2.INTER_AREA)
    mc.save("heart.png", full)

    # ...and empty: the very same shape (its edge and all), in dull grey card
    empty = full.copy()
    solid = empty[..., 3] > 0.5
    light = empty[..., :3].max(axis=2)
    shine = (1 + SHEEN * (light - light[solid].mean()) / max(light[solid].mean(), 1e-6))[..., None]
    empty[..., :3] = np.clip(CHARCOAL * shine, 0, 1)
    mc.save("heart-empty.png", empty)


def cut():
    bottle()
    hands()
    heart()


if __name__ == "__main__":
    cut()
