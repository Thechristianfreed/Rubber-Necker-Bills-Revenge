"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/golf) into the pieces the game loads (src/minis/golf/assets).

Run:  .venv/bin/python src/minis/golf/cut.py        (how the cutouts are made: docs/cutting.md)

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

mc.SRC = os.path.join(ROOT, "art-src", "games", "golf")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go


def cut():
    # Nothing has come back yet: the prompts are in the README (GF1 to GF9). When a
    # picture does, it is kept in art-src/games/golf under its number, with Adobe's
    # cutout of it beside it, and cut here. For example, the sheet of things on the tee
    # (GF4: five of them on a plain background, left to right):
    #
    #   sheet = sorted(mc.pieces(mc.load("GF4-tee-things-cutout.png")), key=lambda p: p[0])
    #   for name, (_, _, piece) in zip(("bag", "sign", "club-driver", "club-iron", "ball-big"), sheet):
    #       mc.save(f"{name}.png", piece)
    #
    # Chad's and Bill's bodies (GF1, GF2) have their heads taken off, as the brothers'
    # have in tools/make_cutouts.py (bat_bodies), and their chins written to a table in
    # this folder for figures.ts to read in place of the paper dolls' (poses.ts).
    print("nothing to cut yet")


if __name__ == "__main__":
    cut()
