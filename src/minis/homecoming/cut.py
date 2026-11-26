"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/homecoming) into the pieces the game loads (src/minis/homecoming/assets).

Run:  .venv/bin/python src/minis/homecoming/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "homecoming")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go


def cut():
    # Nothing has come back yet: the prompts are in README.md (PH1 to PH7). When they do,
    # each sheet is cut here into the pieces index.ts lists, under the names the paper
    # stand-ins have (pappy_stand, pappy_kneel, pappy_smooch, mammy_stand, mammy_bent,
    # mammy_door...), and each body's chin is written into BODIES in layout.ts. Bodies
    # come on sheets with their heads on, and the heads come off: bat_bodies() in
    # tools/make_cutouts.py is the pattern to follow (Adobe's cutout of the sheet, its
    # selection of the heads, mc.pieces() left to right, mc.without_heads(), mc.chin_of()).
    print("nothing to cut yet")


if __name__ == "__main__":
    cut()
