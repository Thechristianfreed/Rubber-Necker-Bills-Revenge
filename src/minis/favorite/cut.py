"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/favorite) into the pieces the game loads (src/minis/favorite/assets).

Run:  .venv/bin/python src/minis/favorite/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.

What there is to cut is one picture, the bottle (FV1: the owner's picture of the
Williams Selyem Pinot Noir, on white; Adobe took the white off). It is cut twice:
as it is, full, and again with the wine gone, the glass above and below the label
turned to empty green glass. The game lays the full one over the empty one and
takes it away from the top down as the evening goes on.
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


def cut():
    bottle()


if __name__ == "__main__":
    cut()
