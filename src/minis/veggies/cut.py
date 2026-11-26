"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/veggies) into the pieces the game loads (src/minis/veggies/assets),
and write the table that says how big each is drawn and where it is held
(src/minis/veggies/cut.ts).

Run:  .venv/bin/python src/minis/veggies/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
without_heads, chin_of, ...) and points them at this game's own folders, so
nothing here reads or writes any other game's pictures. Run again, it writes
the same files.

What each picture is, and what is cut from it:

  VG1  a small boy sitting, a napkin in his collar     his body: head off, arms off at the shoulder
  VG2  a small boy's arm, a fist on the end            his arm, round at the shoulder
  VG3  a carrot, an ear of corn, broccoli, a leaf      each one, turned level, the end that goes in to the right
  VG4  a man's arm in a dinner jacket, a fist          Bill's sleeve (which stretches) and his fist (which does not)
  VG5  a woman's arm, a pinching hand, a flat hand     Stephanie's upper arm and forearm, and her two hands
  VG6  a bowl of buttered noodles                      the bowl (by Adobe's selection of it: its cutout kept only the noodles)
  VG7  false teeth, top and bottom, and a tongue       half of each row of teeth, front tooth first, and the tongue

(VG8, Branson with his cheeks full, is a face: it is in his set, cut by tools/make_cast.py.)
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "veggies")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                              # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                        # where the pieces go
TABLE = os.path.join(HERE, "cut.ts")

# No piece is kept bigger than this many of its own pixels to one of the game's: the page is
# drawn at two, and twice that is room to spare.
DENSE = 4

# The vegetables: how far each is turned to lie level (they were photographed tip down), how
# long it is drawn, and how wide his mouth has to open for it. In the order they are on the sheet.
VEG = [
    ("carrot", 14.0, 190, 34),
    ("corn", 13.0, 170, 52),
    ("broccoli", 13.0, 176, 126),
]


def grid(shape):
    yy, xx = np.mgrid[0:shape[0], 0:shape[1]].astype(np.float32)
    return xx, yy


def only(rgba, keep, soft=1.2):
    """A cutout with everything outside `keep` taken away, the cut edge a little soft."""
    k = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), soft)
    out = rgba.copy()
    out[..., 3] *= np.clip(k * 2 - 0.5, 0, 1)
    return out


def box(rgba):
    ys, xs = np.where(rgba[..., 3] > 0.08)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def turned(piece, degrees):
    """A piece turned anticlockwise by so many degrees, with room made for all of it."""
    h, w = piece.shape[:2]
    m = cv2.getRotationMatrix2D((w / 2, h / 2), degrees, 1.0)
    c, s = abs(m[0, 0]), abs(m[0, 1])
    nw, nh = int(h * s + w * c) + 2, int(h * c + w * s) + 2
    m[0, 2] += nw / 2 - w / 2
    m[1, 2] += nh / 2 - h / 2
    # (premultiplied, so that nothing see-through bleeds its colour into the edge)
    pre = piece.copy()
    pre[..., :3] *= pre[..., 3:4]
    out = cv2.warpAffine(pre, m, (nw, nh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    out = np.clip(out, 0, 1)
    a = np.maximum(out[..., 3:4], 1e-4)
    out[..., :3] = np.clip(out[..., :3] / a, 0, 1)
    return out, m


def resized(piece, w, h):
    pre = piece.copy()
    pre[..., :3] *= pre[..., 3:4]
    out = np.clip(cv2.resize(pre, (max(1, round(w)), max(1, round(h))), interpolation=cv2.INTER_AREA), 0, 1)
    a = np.maximum(out[..., 3:4], 1e-4)
    out[..., :3] = np.clip(out[..., :3] / a, 0, 1)
    return out


ROWS = []


def keep(key, name, piece, wide, anchor, border=2.2, tall=None):
    """Save a piece, and say how it is drawn: `wide` across in the game (and `tall`, if it is
    not to keep its own shape), held at `anchor` (a fraction of it, across and down)."""
    h, w = piece.shape[:2]
    th = tall if tall is not None else wide * h / w
    if tall is not None or w > wide * DENSE:
        k = min(1.0, wide * DENSE / w)
        piece = resized(piece, w * k if tall is None else wide * DENSE, h * k if tall is None else th * DENSE)
    mc.save(name, piece)
    ROWS.append((key, name, wide, th if tall is not None else None, anchor, border))


def body():
    """VG1: his body. His head comes off (a grown man's goes on, by the chin); and his arms come
    off at the shoulder, because the game gives him two of its own to wave about."""
    cut = mc.load("VG1-body-cutout.webp")
    head = mc.selection("VG1-body-headmask.png")
    (cx, cy), _ = mc.chin_of(head)
    rest = mc.without_heads(cut, [head])
    solid = rest[..., 3] > 0.5
    # his waistcoat is the dark of him: below the shoulders, what is kept is what is between its two edges
    dark = solid & (mc.hsv(rest)[..., 2] < 0.42)
    xx, yy = grid(solid.shape)
    kept = yy < 628
    for y in range(628, solid.shape[0]):
        xs = np.where(dark[y])[0]
        if len(xs) > 40:
            kept[y, max(0, xs.min() - 2):xs.max() + 3] = True
    # ...and a round end to each shoulder, for an arm to turn on
    joints = [(207.0, 655.0), (645.0, 655.0)]
    for jx, jy in joints:
        kept |= np.hypot(xx - jx, yy - jy) <= 50
    piece = only(rest, kept)
    x0, y0, x1, y1 = box(piece)
    piece = piece[y0:y1, x0:x1]
    scale = 130.0 / (x1 - x0)
    keep("veggies_body", "body.png", piece, 130.0, ((cx - x0) / (x1 - x0), (cy - y0) / (y1 - y0)), 2.4)
    return {"shoulders": [[round((jx - cx) * scale, 1), round((jy - cy) * scale, 1)] for jx, jy in joints]}


def kid_arm():
    """VG2: his arm, which came with some of his shirt: cut round at the shoulder."""
    cut = mc.load("VG2-arm-cutout.webp")
    xx, yy = grid(cut.shape)
    jx, jy = 215.0, 385.0
    piece = only(cut, (xx >= jx) | (np.hypot(xx - jx, yy - jy) <= 142))
    x0, y0, x1, y1 = box(piece)
    piece = piece[y0:y1, x0:x1]
    # (as long from the shoulder to the knuckles as so many of the game's pixels)
    wide = 78.0 * (x1 - x0) / (x1 - jx)
    keep("veggies_kidarm", "kidarm.png", piece, wide, ((jx - x0) / (x1 - x0), (jy - y0) / (y1 - y0)), 2)


def vegetables():
    """VG3: the three of them and a leaf, left to right. Each is turned level, and held by the
    end that goes in first: the point of the carrot, the tip of the corn, the foot of the stalk."""
    sheet = sorted(mc.pieces(mc.load("VG3-vegetables-cutout.webp")), key=lambda p: p[0])
    assert len(sheet) == 4, f"the sheet of vegetables came apart into {len(sheet)} pieces, not 4"
    fit = {}
    for (name, degrees, long, thick), (_, _, piece) in zip(VEG, sheet):
        level, _ = turned(piece, degrees)
        level = mc.trim(level, 1)
        h, w = level.shape[:2]
        tip = np.where(level[:, w - 6:, 3].max(axis=1) > 0.3)[0]
        keep(f"veggies_{name}", f"{name}.png", level, float(long), (1 - 2.0 / w, float(tip.mean()) / h), 2.4)
        fit[f"veggies_{name}"] = {"len": long, "thick": thick, "tall": round(long * h / w, 1)}
    leaf = sheet[3][2]
    keep("veggies_leaf", "leaf.png", leaf, 28.0, (0.5, 0.5), 1.2)
    return fit


def bill_arm():
    """VG4: his father's arm. The sleeve, round at the shoulder, to the end of the cuff: it is
    stretched as far as it has to go. The fist, with a round of cuff behind it: it is not."""
    cut = mc.load("VG4-bill-arm-cutout.webp")
    xx, yy = grid(cut.shape)
    jx, jy = 215.0, 347.0
    sleeve = only(cut, ((xx >= jx) | (np.hypot(xx - jx, yy - jy) <= 147)) & (xx <= 990))
    x0, y0, x1, y1 = box(sleeve)
    scale = 0.21
    keep("veggies_arm_bill", "arm-bill.png", sleeve[y0:y1, x0:x1], (x1 - x0) * scale, ((jx - x0) / (x1 - x0) * 0.5, (jy - y0) / (y1 - y0)), 2.2)
    wx, wy = 1000.0, 392.0
    fist = only(cut, (xx >= wx) | (np.hypot(xx - wx, yy - wy) <= 66))
    x0, y0, x1, y1 = box(fist)
    keep("veggies_fist", "fist.png", fist[y0:y1, x0:x1], (x1 - x0) * scale, ((1105.0 - x0) / (x1 - x0), (wy - y0) / (y1 - y0)), 2)


def steph_arm():
    """VG5: his mother's arm and her two hands. The arm came whole and pointing left: it is cut
    in two at the elbow, each half round there, and each is turned right round, so that it is
    held by its near end and points right like every other arm (the game turns it back). Her
    hands are as they came: the game turns each to follow her forearm."""
    cut = mc.load("VG5-steph-arm-cutout.webp")
    xx, yy = grid(cut.shape)
    ex, ey, er = 410.0, 392.0, 38.0
    elbow = np.hypot(xx - ex, yy - ey) <= er
    scale = 0.34
    fit = {}
    # from the sleeve to the elbow
    upper = only(cut, (xx < 650) & ((xx >= ex) | elbow))
    x0, y0, x1, y1 = box(upper)
    piece = upper[y0:y1, x0:x1][::-1, ::-1]
    keep("veggies_arm_steph", "arm-steph.png", np.ascontiguousarray(piece), (x1 - x0) * scale, (0.04, (y1 - 388.0) / (y1 - y0)), 2.2)
    # from the elbow to the wrist
    fore = only(cut, (xx >= 204) & ((xx <= ex) | elbow) & (xx < 650))
    x0, y0, x1, y1 = box(fore)
    piece = fore[y0:y1, x0:x1][::-1, ::-1]
    keep("veggies_forearm", "forearm.png", np.ascontiguousarray(piece), (x1 - x0) * scale, ((x1 - ex) / (x1 - x0), (y1 - ey) / (y1 - y0)), 2.2)
    # her hands: where each is held (finger and thumb; the middle of the palm), and where its wrist is from there
    hands = [("pinch", (650, 1030), (700.0, 338.0), (952.0, 472.0), 0.21), ("palm", (1030, 1344), (1160.0, 400.0), (1154.0, 536.0), 0.22)]
    for name, (a, b), (hx, hy), (wx, wy), k in hands:
        hand = only(cut, (xx >= a) & (xx < b), 0.6)
        x0, y0, x1, y1 = box(hand)
        keep(f"veggies_{name}", f"{name}.png", hand[y0:y1, x0:x1], (x1 - x0) * k, ((hx - x0) / (x1 - x0), (hy - y0) / (y1 - y0)), 2)
        fit[name] = {"wrist": [round((wx - hx) * k, 1), round((wy - hy) * k, 1)]}
    return fit


def noodles():
    """VG6: the bowl. Adobe's cutout kept the noodles and the blue rim and lost the white bowl
    (white, on white): so it is the picture itself, inside Adobe's selection of "the bowl of noodles"."""
    rgb = mc.original("VG6-noodles.jpg")
    sel = mc.selection("VG6-noodles-bowlmask.png")
    solid = (sel > 0.5).astype(np.uint8)
    outline, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    whole = np.zeros(solid.shape, np.uint8)
    cv2.drawContours(whole, [max(outline, key=cv2.contourArea)], -1, 1, thickness=cv2.FILLED)
    alpha = np.clip(cv2.GaussianBlur(cv2.erode(whole, np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 1.0) * 1.4 - 0.2, 0, 1)
    piece = mc.trim(np.dstack([rgb, alpha]), 1)
    keep("veggies_noodles", "noodles.png", piece, 140.0, (0.5, 0.97), 2.4)


def teeth():
    """VG7: false teeth. His mouth is seen from the side, so each row is half of a set, the front
    tooth first (at his lips) and the back ones after it; drawn wider than they are tall, to be
    a row of teeth and not a pair of tusks. The gum of each is behind his face. And the tongue."""
    cut = mc.load("VG7-teeth-cutout.webp")
    xx, _ = grid(cut.shape)
    # the top row: from the middle of the set to its right-hand end; held where teeth meet gum, at the front
    top = only(cut, (xx >= 540) & (xx < 950), 0.6)
    x0, y0, x1, y1 = box(top)
    keep("veggies_teeth_top", "teeth-top.png", top[y0:y1, x0:x1], 66.0, (0.0, (772.0 - y0) / (y1 - y0)), 0, tall=(y1 - y0) * 0.115)
    # the bottom row, the same
    bot = only(cut, (xx >= 1362) & (xx < 1760), 0.6)
    x0, y0, x1, y1 = box(bot)
    keep("veggies_teeth_bot", "teeth-bot.png", bot[y0:y1, x0:x1], 66.0, (0.0, (866.0 - y0) / (y1 - y0)), 0, tall=(y1 - y0) * 0.115)
    tongue = only(cut, xx >= 1780, 0.6)
    x0, y0, x1, y1 = box(tongue)
    keep("veggies_tongue", "tongue.png", tongue[y0:y1, x0:x1], 76.0, (0.02, 0.92), 0)


def ts(value):
    if isinstance(value, dict):
        return "{ " + ", ".join(f"{k}: {ts(v)}" for k, v in value.items()) + " }"
    if isinstance(value, (list, tuple)):
        return "[" + ", ".join(ts(v) for v in value) + "]"
    return f"{value:g}" if isinstance(value, float) else str(value)


def cut():
    del ROWS[:]
    fit = {"body": body()}
    kid_arm()
    veg = vegetables()
    bill_arm()
    fit["hands"] = steph_arm()
    noodles()
    teeth()
    lines = ["// Written by cut.py (src/minis/veggies/cut.py): do not edit by hand.", "import { Piece } from '../kit';", "",
             "/** The photos that take the place of the paper pieces: how big each is drawn, and where it is held. */",
             "export const CUT: Piece[] = ["]
    for key, name, wide, tall, anchor, border in ROWS:
        size = f"w: {wide:.1f}" + (f", h: {tall:.1f}" if tall is not None else "")
        lines.append(f"  {{ key: '{key}', file: '{name}', {size}, border: {border:g}, anchor: [{anchor[0]:.4f}, {anchor[1]:.4f}] }},")
    lines += ["];", "",
              "/** The vegetables, as the photos of them are: how long each is drawn, how tall that makes it, and how wide",
              " *  his mouth has to open for it (how thick it is where it goes in, and a bit). */",
              f"export const VEG_FIT: Record<string, {{ len: number; thick: number; tall: number }}> = {ts(veg)};", "",
              "/** His body in the photo: where his two shoulders are from his chin (an arm is pinned at each). And his",
              " *  mother's hands: where the wrist of each is from the spot it is held by, as it is drawn. */",
              f"export const FIT = {ts(fit)};", ""]
    with open(TABLE, "w") as f:
        f.write("\n".join(lines))
    print("wrote", TABLE)


if __name__ == "__main__":
    cut()
