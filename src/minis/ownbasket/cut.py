"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/ownbasket) into the pieces the game loads (src/minis/ownbasket/assets).

Run:  .venv/bin/python src/minis/ownbasket/cut.py        (how the cutouts are made: docs/cutting.md)

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

mc.SRC = os.path.join(ROOT, "art-src", "games", "ownbasket")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go


def cut():
    # for example, a sheet of three things on a plain background, left to right:
    #
    #   sheet = sorted(mc.pieces(mc.load("OWNBASKET1-things-cutout.png")), key=lambda p: p[0])
    #   for name, (_, _, piece) in zip(("star", "moon", "sun"), sheet):
    #       mc.save(f"{name}.png", piece)
    print("nothing to cut yet")


if __name__ == "__main__":
    cut()
