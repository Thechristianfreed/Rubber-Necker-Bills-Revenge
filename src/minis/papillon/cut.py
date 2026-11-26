"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/papillon) into the pieces the game loads (src/minis/papillon/assets),
and write the table that says how big each is drawn and where it is held
(src/minis/papillon/cut.ts).

Run:  .venv/bin/python src/minis/papillon/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
without_heads, chin_of, ...) and points them at this game's own folders, so
nothing here reads or writes any other game's pictures.

These are the restaurant's pictures as well as the ordering game's: the room, the
tables, what stands on them, the chair, the waiter and everybody's seat, which the
other games set at Le Papillon use (src/minis/shared/papillon.ts). Each takes the
place of the paper piece with the same name (art.ts), at the size the paper was and
held at the same point, so that nothing in any of the three games has to move.

    PP1a  the room             one photo is the whole backdrop: not cut out
    PP1b  the sign             the blank board; the game letters its name on it
    PP2a  the table for three  a round one
    PP2b  the long table
    PP3a  what stands on it    plate, glass, glass of red, candle, rose, dome, tray, the amuse-bouche
    PP3b  the menu             in two hands; made shorter, so that the hands show over the table
    PP4   the chair
    PP5   the waiter           standing, and with a hand out for a tray
    PP6a  sitting              Bill, Stephanie, Christian: their heads come off
    PP6b  sitting              Shane, Chad, Branson
    PP7a  PP7b  PP7c           the menu's twelve dishes
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "papillon")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go
TABLE = os.path.join(HERE, "cut.ts")

# What the table is made of as the pieces are cut: a row for each piece, and the odd numbers.
ROWS = []
FIT = {}


def piece(key, file, rgba, border, anchor, w=None, h=None):
    """Save a piece, and say how it is drawn: `w` or `h` in the game's pixels, held at `anchor`
    (fractions of the piece)."""
    mc.save(file, rgba)
    size = f"w: {w:.1f}" if w is not None else f"h: {h:.1f}"
    ROWS.append(f"  {{ key: '{key}', file: '{file}', {size}, border: {border}, anchor: [{anchor[0]:.4f}, {anchor[1]:.4f}] }},")


def foot(rgba):
    """Where something stands: the middle of the lowest of it, as a fraction of its width."""
    ys, xs = np.where(rgba[..., 3] > 0.3)
    low = ys > ys.max() - (ys.max() - ys.min()) * 0.05
    return float(xs[low].mean()) / rgba.shape[1]


# ---- the room ---------------------------------------------------------------------------------

# In the photo: the row the panelling's rail is on, and the row the carpet starts on.
ROOM_RAIL, ROOM_CARPET = 371, 578
# How big it is drawn (the game's pixels to one of the photo's), and where its rail is put on the
# page. It has to cover the page and 48 more all round, which the photo does not quite: a little
# more wallpaper is put on above and a little more carpet below, each the photo's own, turned over.
ROOM_SCALE, ROOM_RAIL_AT = 0.9, 292
ROOM_ABOVE, ROOM_BELOW = 24, 72


def room():
    photo = np.asarray(Image.open(os.path.join(mc.GEN, "PP1a-room.jpg")).convert("RGB"))
    carpet = photo[ROOM_CARPET + 4:]
    # (carpet, turned over and over until there is enough of it)
    more = np.vstack([carpet[::-1], carpet, carpet[::-1]])[:ROOM_BELOW]
    whole = np.vstack([photo[:ROOM_ABOVE][::-1], photo, more])
    os.makedirs(mc.OUT, exist_ok=True)
    path = os.path.join(mc.OUT, "room.jpg")
    Image.fromarray(whole).save(path, quality=90, optimize=True)
    print("room.jpg", whole.shape[1], "x", whole.shape[0], os.path.getsize(path), "bytes")
    top = ROOM_RAIL_AT - (ROOM_RAIL + ROOM_ABOVE) * ROOM_SCALE
    FIT["ROOM_FIT"] = (f"{{ file: 'room.jpg', tall: {whole.shape[0] * ROOM_SCALE:.1f}, top: {top:.1f}, "
                       f"rail: {ROOM_RAIL_AT}, carpet: {ROOM_RAIL_AT + (ROOM_CARPET - ROOM_RAIL) * ROOM_SCALE:.1f} }}")


# ---- the sign ---------------------------------------------------------------------------------

# The chains it hangs by are long: only the last link of each is kept (from this row down).
SIGN_CHAIN, SIGN_BOARD = 190, 242
SIGN_W = 310
# Where its two painted butterflies are, across the picture: its name goes between them.
SIGN_BUTTERFLIES = (258, 1085)


def sign():
    cut = mc.load("PP1b-sign-cutout.webp")
    cut[:SIGN_CHAIN] = 0
    ys, xs = np.where(cut[..., 3] > 0.08)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    board = cut[y0:y1, x0:x1]
    k = SIGN_W / board.shape[1]
    piece("papillon_sign", "sign.png", board, 2.4, (0.5, 0), w=SIGN_W)
    middle = ((SIGN_BOARD - y0) + (y1 - SIGN_BOARD) / 2) * k
    room_for = (SIGN_BUTTERFLIES[1] - SIGN_BUTTERFLIES[0]) * k - 56
    FIT["SIGN_FIT"] = f"{{ name: [{SIGN_W / 2:.1f}, {middle:.1f}], wide: {room_for:.1f} }}"


# ---- the tables -------------------------------------------------------------------------------

# How wide each is drawn (the whole cloth, where it is widest), and how far above where it is held
# the far edge of its top is: a little, so that what is stood on it is well onto it.
#
# The table for three came round. Its top is an ellipse, narrow at the far edge where things are
# stood, so it is drawn wider than the paper one was (720 for 620) and held 10 below its far edge:
# a glass at either end of the row is then still on the table. The long one's top narrows towards
# the back as well, and the anniversary sits six along it with a plate at each end: 1200 for 1060.
TABLES = (("papillon_table", "PP2a-table", "table.png", 720, 10), ("papillon_table_long", "PP2b-table-long", "table-long.png", 1200, 6))


def tables():
    for key, name, file, wide, lift in TABLES:
        cloth = mc.trim(mc.load(f"{name}-cutout.webp"), margin=0)
        k = wide / cloth.shape[1]
        piece(key, file, cloth, 2.4, (0.5, lift / (cloth.shape[0] * k)), w=wide)


# ---- what stands on the table -------------------------------------------------------------------

# Left to right on the sheet: what each is, how it is sized (the paper's sizes), and how far up
# from its foot it is held.
WARE = (
    ("papillon_plate", "plate.png", 1.6, {"w": 92}, 0.42),
    ("papillon_glass", "glass.png", 1.4, {"h": 68}, 0.03),
    ("papillon_glass_red", "glass-red.png", 1.4, {"h": 68}, 0.03),
    ("papillon_candle", "candle.png", 1.5, {"h": 104}, 0.03),
    ("papillon_rose", "rose.png", 1.5, {"h": 96}, 0.03),
    ("papillon_cloche", "cloche.png", 1.8, {"w": 96}, 0.06),
    ("papillon_tray", "tray.png", 1.6, {"w": 120}, 0.42),
    ("papillon_amuse", "amuse.png", 1.6, {"w": 108}, 0.38),
)
# The dome came on a tray of its own, and the game stands it on the waiter's: it is taken off
# along its own rim, which is an ellipse (its middle, and half its width and height, in the sheet).
DOME_RIM = ((764, 506), (79, 21))


def tableware():
    sheet = mc.load("PP3a-tableware-cutout.webp")
    # the dome, off its tray: nothing below its rim, or beside it from where the tray begins
    (cx, cy), (rx, ry) = DOME_RIM
    yy, xx = np.mgrid[:sheet.shape[0], :sheet.shape[1]]
    near = (np.abs(xx - cx) < 110) & (yy > cy - 20)
    under = (yy >= cy) & (((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 > 1)
    beside = (yy < cy) & (np.abs(xx - cx) > rx)
    sheet[near & (under | beside), 3] = 0
    things = sorted(mc.pieces(sheet, min_area=300), key=lambda p: p[0])
    assert len(things) == len(WARE), f"{len(things)} things on the sheet, and {len(WARE)} were expected"
    for (key, file, border, size, up), (_, _, thing) in zip(WARE, things):
        # (something tall is held under its foot; something flat by its middle)
        piece(key, file, thing, border, (foot(thing) if "h" in size else 0.5, 1 - up), **size)


# ---- the menu -----------------------------------------------------------------------------------

# The menu is held up with its foot behind the table, and in the photo the hands are on the
# lower half of it: they would not be seen. So a band is taken out of the cover above the
# butterfly (these rows), which brings the butterfly and the hands up into what shows.
MENU_OUT = (300, 480)
MENU_BLEND = 24
# The cover, across the picture, and how wide it is drawn; how far below its top edge it is held
# (the paper one is held 70 below its top: it is put with that point at the chin + 84).
MENU_COVER, MENU_COVER_W, MENU_HELD = (175, 690), 104, 70


def menu():
    cut = mc.load("PP3b-menu-cutout.webp")
    a, b = MENU_OUT
    # (the leather either side of the cut is run together over a few rows, so that no line shows)
    t = np.linspace(0, 1, MENU_BLEND)[:, None, None]
    join = cut[a - MENU_BLEND:a] * (1 - t) + cut[b - MENU_BLEND:b] * t
    short = mc.trim(np.vstack([cut[:a - MENU_BLEND], join, cut[b:]]), margin=0)
    k = MENU_COVER_W / (MENU_COVER[1] - MENU_COVER[0])
    piece("papillon_menu", "menu.png", short, 2, (0.5, MENU_HELD / (short.shape[0] * k)), w=short.shape[1] * k)


# ---- the chair ------------------------------------------------------------------------------------

# Its back, across the picture, and how wide that is drawn (the paper chair is all back).
CHAIR_BACK, CHAIR_BACK_W = (262, 602), 150


def chair():
    cut = mc.trim(mc.load("PP4-chair-cutout.webp"), margin=0)
    piece("papillon_chair", "chair.png", cut, 2.2, (0.5, 0), w=cut.shape[1] * CHAIR_BACK_W / (CHAIR_BACK[1] - CHAIR_BACK[0]))


# ---- the waiter -----------------------------------------------------------------------------------

# How tall he is drawn. Then, for each pose, in the sheet: the line down the middle of him (he is
# held on it, by the floor under his feet), his mouth, and the top of his head; and, with his
# hand out, the spot on it that a tray sits on.
WAITER_TALL = 312
WAITER = (
    ("stand", "papillon_waiter", "waiter.png", 337, {"mouth": (350, 116), "top": (337, 40)}),
    ("serve", "papillon_waiter_serve", "waiter-serve.png", 1005, {"hand": (1165, 186), "mouth": (1018, 116), "top": (1003, 40)}),
)


def waiter():
    sheet = mc.load("PP5-waiter-cutout.webp")
    poses = sorted(mc.pieces(sheet, min_area=2000), key=lambda p: p[0])
    assert len(poses) == 2, f"{len(poses)} waiters on the sheet"
    rows = []
    for (pose, key, file, middle, spots), (x, y, cut) in zip(WAITER, poses):
        ys, _ = np.where(cut[..., 3] > 0.3)
        floor = y + ys.max()
        k = WAITER_TALL / cut.shape[0]
        piece(key, file, cut, 2.4, ((middle - x) / cut.shape[1], (floor - y) / cut.shape[0]), h=WAITER_TALL)
        at = ", ".join(f"{name}: {{ x: {(px - middle) * k:.1f}, y: {(py - floor) * k:.1f} }}" for name, (px, py) in spots.items())
        rows.append(f"{pose}: {{ {at} }}")
    FIT["WAITER_FIT"] = "{ " + ", ".join(rows) + " }"


# ---- everybody, sitting down --------------------------------------------------------------------

# Each sheet: who is on it, left to right (each has a head selection of their own), and how big
# they are drawn (the game's pixels to one of the picture's): the second sheet came framed
# smaller, and is drawn that much bigger, so that all six are a size. Their shoulders come out
# about 160 across, as the paper ones were, under a head 92 tall.
SEATED = (("PP6a-seated", ("bill", "stephanie", "christian"), 0.44), ("PP6b-seated", ("shane", "chad", "branson"), 0.512))
# How far below the chin a body has to go (they lean, and the table hides the rest). The pictures
# stop a little short of it: the last of each is drawn down to there.
SEATED_BELOW = 212


def seated():
    for sheet, people, k in SEATED:
        cut = mc.load(f"{sheet}-cutout.webp")
        heads = [mc.selection(f"{sheet}-headmask{n}.png") for n in ("", "2", "3")]
        bodies = mc.without_heads(cut, heads)
        _, lab = cv2.connectedComponents((bodies[..., 3] > 0.3).astype(np.uint8), 8)
        for who, head in zip(people, heads):
            (cx, cy), tall = mc.chin_of(head)
            # (whoever is under this chin)
            mine = lab[int(cy + tall * 0.6), int(cx)]
            assert mine > 0, f"nobody under {who}'s chin"
            body = bodies.copy()
            body[~(cv2.dilate((lab == mine).astype(np.uint8), np.ones((7, 7), np.uint8)) > 0)] = 0
            ys, xs = np.where(body[..., 3] > 0.08)
            x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            body = body[y0:y1, x0:x1]
            need = round(SEATED_BELOW / k) - (y1 - cy)
            if need > 0:
                body = np.vstack([body, np.repeat(body[-1:], need, axis=0)])
            piece(f"papillon_sit_{who}", f"sit-{who}.png", body, 2.4, ((cx - x0) / body.shape[1], (cy - y0) / body.shape[0]), w=body.shape[1] * k)


# ---- the menu's dishes ----------------------------------------------------------------------------

# Each sheet is a course, left to right (the names are the ones MENU in art.ts has). Every dish
# is drawn to fit the same box, as the paper ones did: most are a plate 100 across, and a tall
# one (the sundae in its glass) is a little smaller.
DISHES = (
    ("PP7a-starters", ("soup", "escargots", "shrimp", "salad")),
    ("PP7b-mains", ("steak", "salmon", "chicken", "lobster")),
    ("PP7c-desserts", ("cake", "tart", "sundae", "cheesecake")),
)
DISH_BOX = (100, 96)


def dishes():
    for sheet, names in DISHES:
        plates = sorted(mc.pieces(mc.load(f"{sheet}-cutout.webp"), min_area=2000), key=lambda p: p[0])
        assert len(plates) == len(names), f"{len(plates)} dishes on {sheet}"
        for name, (_, _, dish) in zip(names, plates):
            k = min(DISH_BOX[0] / dish.shape[1], DISH_BOX[1] / dish.shape[0])
            piece(f"papillon_dish_{name}", f"dish-{name}.png", dish, 1.8, (0.5, 0.5), w=dish.shape[1] * k)


# ---- all of it ------------------------------------------------------------------------------------

def table():
    with open(TABLE, "w") as f:
        f.write("// Written by cut.py (src/minis/papillon/cut.py): do not edit by hand.\n")
        f.write("import { Piece } from '../kit';\n\n")
        f.write("/** The photos that take the place of the paper pieces: how big each is drawn, and where it is held. */\n")
        f.write("export const CUT: Piece[] = [\n" + "\n".join(ROWS) + "\n];\n\n")
        f.write("/** The room, which is one photo: how tall it is drawn, where its top is put (it is centred on the page),\n")
        f.write(" *  and where that puts the rail of its panelling and the edge of its carpet. */\n")
        f.write(f"export const ROOM_FIT = {FIT['ROOM_FIT']};\n\n")
        f.write("/** The sign: where its name is lettered on the board (in the piece, as it is drawn), and how wide it may be. */\n")
        f.write(f"export const SIGN_FIT = {FIT['SIGN_FIT']};\n\n")
        f.write("/** The waiter in the photos, facing right: where his mouth and the top of his head are from the floor under\n")
        f.write(" *  him, standing and serving; and, serving, the spot on his hand that a tray sits on. */\n")
        f.write(f"export const WAITER_FIT = {FIT['WAITER_FIT']};\n")
    print("wrote", os.path.relpath(TABLE, ROOT))


def cut():
    room()
    sign()
    tables()
    tableware()
    menu()
    chair()
    waiter()
    seated()
    dishes()
    table()


if __name__ == "__main__":
    cut()
