"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/golf) into the pieces the game loads (src/minis/golf/assets), and
write what was measured on the way (where a chin is, where a blank sign is to be
lettered) to src/minis/golf/cuts.ts.

Run:  .venv/bin/python src/minis/golf/cut.py          (how the cutouts are made: docs/cutting.md)
      .venv/bin/python src/minis/golf/cut.py --keep   turns Adobe's cutouts from PNG into WebP,
                                                      a fifth of the size, which is how they are kept

It borrows the cutting tool's helpers (load, save, selection, without_heads,
chin_of, smaller, ...) and points them at this game's own folders, so nothing
here reads or writes any other game's pictures.

What came from the owner, and what Adobe was asked for each:

  GF1, GF1b  Chad with a driver, and the same again with a 7 iron: three poses a
             sheet. Each figure was sent by itself (cut out of the sheet by the
             same box for both, so that the two line up): the background off, the
             head selected ("the boy": Hair, Face, Left Ear, Right Ear), and "the
             golf club" selected.
  GF2        Bill, two poses: the same, each by itself.
  GF8a-f     Six people on the trail, two moments of a stride each: the same.
  GF4, GF6,  Sheets of things on a plain background: the background off, whole.
  GF7, GF9   (A few things were selected by name as well, in case the cutout
             dropped them. It did not: those masks are kept and not used.)
  GF3, GF5,  The first tee, the trail and the lot outside the shop: whole places,
  GF10       which go in as they are, made smaller.
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

mc.SRC = os.path.join(ROOT, "art-src", "games", "golf")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go

# The pieces keep this many pixels to each of the game's (so each is drawn at a third of its size).
DETAIL = 3
# How far it is from the ground to the chin, in the game's pixels: a boy as the brothers are in
# the back yard (KID_CHIN in tools/make_cutouts.py), a grown-up standing, and one running (who leans).
KID = 110
GROWN = 198
RUNS = 190
# A whole place is made this tall in the game's pixels (more than the page, to be put where it
# suits), and keeps this many pixels to each of them.
PLACE = 660
PLACE_DETAIL = 1.5


def adobe(name):
    """One of Adobe's cutouts: as it is kept (WebP), or as it came (PNG)."""
    kept = f"{name}-cutout.webp"
    return mc.load(kept if os.path.exists(os.path.join(mc.SRC, kept)) else f"{name}-cutout.png")


def keep():
    """Turn Adobe's cutouts from PNG into WebP. The selections stay PNG: they are small."""
    for name in sorted(os.listdir(mc.SRC)):
        if not name.endswith("-cutout.png"):
            continue
        path = os.path.join(mc.SRC, name)
        Image.open(path).convert("RGBA").save(path[:-4] + ".webp", "WEBP", quality=95, alpha_quality=100, method=6, exact=True)
        print(name, os.path.getsize(path), "->", os.path.getsize(path[:-4] + ".webp"))
        os.remove(path)


# ---- people ---------------------------------------------------------------------------------

def figure(name):
    """Somebody with their head taken off. Returns the piece cut down to them, the spot on the
    ground they stand on (as a fraction of the piece: under the middle of their trunk, at the
    bottom of their feet), and from that spot, in the picture's pixels: where the chin was, how
    far it is from chin to ground, and where the hand that is furthest forward is."""
    cut = adobe(name)
    head = mc.selection(f"{name}-headmask.png")
    body = mc.without_heads(cut, [head])
    club = np.zeros(head.shape, bool)
    if os.path.exists(os.path.join(mc.SRC, f"{name}-clubmask.png")):
        # a club that goes behind his head is in two pieces once the head is off: both are kept
        club = (mc.selection(f"{name}-clubmask.png") > 0.5) & (head < 0.5)
        body[..., 3] = np.where(club, cut[..., 3], body[..., 3])
    (cx, cy), _ = mc.chin_of(head)
    ys, xs = np.where((body[..., 3] > 0.3) & ~club)
    feet = float(ys.max())
    tall = feet - cy
    trunk = (ys > cy + 0.25 * tall) & (ys < cy + 0.55 * tall)
    spot = (float(np.median(xs[trunk])), feet)
    arm = (ys > cy + 0.08 * tall) & (ys < cy + 0.62 * tall)
    front = xs[arm] > xs[arm].max() - 14
    hand = (float(xs[arm][front].mean()), float(ys[arm][front].mean()))
    x0, x1, y0, y1 = mc.boxed(body)
    return dict(piece=body[y0:y1, x0:x1], at=((spot[0] - x0) / (x1 - x0), (spot[1] - y0) / (y1 - y0)),
                chin=(cx - spot[0], cy - spot[1]), tall=tall, hand=(hand[0] - spot[0], hand[1] - spot[1]))


# sheet, how far from ground to chin for whoever on it is standing straightest, and each figure on it:
# what it is called, and how far its head tips
PEOPLE = [
    ("GF1-chad-golf", KID, [("chad_address", 0.06), ("chad_back", 0.1), ("chad_follow", -0.04)]),
    ("GF1b-chad-iron", KID, [("chad_address_iron", 0.06), ("chad_back_iron", 0.1), ("chad_follow_iron", -0.04)]),
    ("GF2-bill-tee", GROWN, [("bill_stand", 0), ("bill_ohno", 0)]),
    ("GF8a-walker-green", GROWN, [("p0_walk1", 0), ("p0_walk2", 0)]),
    ("GF8b-walker-red", GROWN, [("p1_walk1", 0), ("p1_walk2", 0)]),
    ("GF8c-walker-cardigan", GROWN, [("p2_walk1", 0), ("p2_walk2", 0)]),
    ("GF8d-runner-yellow", RUNS, [("p3_run1", 0), ("p3_run2", 0)]),
    ("GF8e-runner-white", RUNS, [("p4_run1", 0), ("p4_run2", 0)]),
    ("GF8f-runner-green", RUNS, [("p5_run1", 0), ("p5_run2", 0)]),
]


def people():
    made, sizes = {}, {}
    for sheet, height, poses in PEOPLE:
        if not any(os.path.exists(os.path.join(mc.SRC, f"{sheet}-1-cutout{ext}")) for ext in (".png", ".webp")):
            continue                    # not made yet
        found = [(pose, tilt, figure(f"{sheet}-{k + 1}")) for k, (pose, tilt) in enumerate(poses)]
        # everybody on a sheet is the same size: whoever stands tallest is as tall as that kind of person is
        scale = height / max(f["tall"] for _, _, f in found)
        # (Chad with the iron is the same picture as Chad with the driver, and is made the same size)
        scale = sizes.get(sheet.replace("GF1b-chad-iron", "GF1-chad-golf"), scale)
        sizes[sheet] = scale
        for pose, tilt, f in found:
            file = pose.replace("_", "-") + ".png"
            mc.save(file, mc.smaller(f["piece"], scale * DETAIL))
            made[pose] = dict(file=file, at=f["at"], chin=(f["chin"][0] * scale, f["chin"][1] * scale), tilt=tilt,
                              hand=(f["hand"][0] * scale, f["hand"][1] * scale))
    return made


# ---- things ---------------------------------------------------------------------------------

def bands(sheet, splits):
    """A sheet of things in a row, cut where the gaps between them are (as fractions of its
    width): each thing by itself, trimmed, left to right."""
    cut = adobe(sheet)
    edges = [0] + [round(s * cut.shape[1]) for s in splits] + [cut.shape[1]]
    out = []
    for a, b in zip(edges, edges[1:]):
        piece = cut.copy()
        piece[:, :a] = 0
        piece[:, b:] = 0
        out.append(mc.trim(piece))
    return out


def sized(piece, wide=None, tall=None):
    """A piece made the size it is drawn at (so many of the game's pixels wide, or tall)."""
    k = (wide / piece.shape[1] if wide else tall / piece.shape[0]) * DETAIL
    return mc.smaller(piece, k)


def blank(piece, bright=0.8, plain=0.14, least=0.02):
    """The blank part of a sign, to be lettered: the biggest patch of it that is pale and has
    no colour to speak of. Returns (left, top, right, bottom) as fractions of the piece."""
    rgb, alpha = piece[..., :3], piece[..., 3]
    pale = (alpha > 0.9) & (rgb.min(axis=2) > bright) & (rgb.max(axis=2) - rgb.min(axis=2) < plain)
    n, lab, st, _ = cv2.connectedComponentsWithStats(pale.astype(np.uint8), 8)
    i = max(range(1, n), key=lambda i: st[i][4])
    assert st[i][4] > least * pale.size, "no blank part found"
    x, y, w, h = st[i][:4]
    return (x / piece.shape[1], y / piece.shape[0], (x + w) / piece.shape[1], (y + h) / piece.shape[0])


def board(piece, share=0.8):
    """The board of a sign on posts: the rows where it is nearly as wide as it gets."""
    wide = (piece[..., 3] > 0.5).sum(axis=1)
    rows = np.where(wide > wide.max() * share)[0]
    cols = np.where((piece[rows.min():rows.max() + 1, :, 3] > 0.5).any(axis=0))[0]
    return (cols.min() / piece.shape[1], rows.min() / piece.shape[0], (cols.max() + 1) / piece.shape[1], (rows.max() + 1) / piece.shape[0])


def things():
    signs = {}
    # GF4: what is on the tee
    bag, sign, driver, iron, ball = bands("GF4-tee-things", [0.185, 0.332, 0.595, 0.852])
    mc.save("bag.png", sized(bag, tall=150))
    mc.save("sign.png", sized(sign, tall=104))
    signs["sign"] = board(sign)
    mc.save("club-driver.png", sized(driver, wide=84))
    mc.save("club-iron.png", sized(iron, wide=84))
    mc.save("ball.png", sized(ball, wide=132))
    # GF6: what stands at the entrance to the trail (the park's sign loses the feet of its posts, which are long)
    bollard, gate, park, stop = bands("GF6-entrance-things", [0.15, 0.525, 0.805])
    mc.save("bollard.png", sized(bollard, tall=92))
    mc.save("gate.png", sized(gate, tall=112))
    park = park[:round(park.shape[0] * 0.74)]
    mc.save("trailsign.png", sized(park, tall=150))
    signs["trailsign"] = board(park)
    mc.save("stopsign.png", sized(stop, tall=168))
    # GF7: the water stand
    table, cooler, bottle, jar = bands("GF7-water-stand", [0.335, 0.63, 0.772])
    mc.save("table.png", sized(table, wide=136))
    signs["poster"] = blank(table)
    mc.save("cooler.png", sized(cooler, wide=70))
    mc.save("bottle.png", sized(bottle, tall=36))
    mc.save("jar.png", sized(jar, tall=54))
    # GF9: Windows R Us, and one new window
    shop, pane = bands("GF9-windows-r-us", [0.6])
    mc.save("store.png", sized(shop, tall=350))
    signs["store"] = blank(shop, bright=0.86, plain=0.08)
    mc.save("window-new.png", sized(pane, tall=150))
    return signs


# ---- places ---------------------------------------------------------------------------------

def places():
    """The three whole places. Each is made PLACE of the game's pixels tall; the game puts it
    where its ground suits whoever stands on it."""
    made = {}
    for sheet, name in [("GF3-first-tee", "tee"), ("GF5-trail", "trail"), ("GF10-parking-lot", "lot")]:
        path = os.path.join(mc.GEN, sheet + ".webp")
        if not os.path.exists(path):
            continue
        im = Image.open(path).convert("RGB")
        k = PLACE * PLACE_DETAIL / im.height
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        out = os.path.join(mc.OUT, name + ".jpg")
        im.save(out, quality=84, optimize=True)
        print(name + ".jpg", im.width, "x", im.height, os.path.getsize(out), "bytes")
        made[name] = dict(file=name + ".jpg", wide=im.width / PLACE_DETAIL)
    return made


def cut():
    os.makedirs(mc.OUT, exist_ok=True)
    bodies, signs, grounds = people(), things(), places()
    table = os.path.join(HERE, "cuts.ts")
    pair = lambda v: f"[{v[0]:.1f}, {v[1]:.1f}]"
    with open(table, "w") as f:
        f.write("/** What was measured as this game's pictures were cut.\n"
                " *  The bodies: for each pose its picture, how big it is drawn (game pixels to one of\n"
                " *  the picture's), the spot on the ground it stands on (as a fraction of the picture),\n"
                " *  and from that spot, in game pixels: where the chin goes, how far the head tips, and\n"
                " *  where the hand that is furthest forward is.\n"
                " *  The signs: the blank part of each, to be lettered (left, top, right, bottom, as\n"
                " *  fractions of its picture).\n"
                " *  The places: each one's picture, how tall it is made and how wide that makes it.\n"
                " *  Written by src/minis/golf/cut.py; do not edit by hand. */\n"
                "export interface GolfBody { file: string; scale: number; spot: [number, number]; chin: [number, number]; tilt: number; hand: [number, number] }\n\n"
                "export const GOLF_BODIES: Record<string, GolfBody> = {\n")
        for pose, e in bodies.items():
            f.write(f"  {pose}: {{ file: '{e['file']}', scale: {1 / DETAIL:.4f}, spot: [{e['at'][0]:.3f}, {e['at'][1]:.3f}],"
                    f" chin: {pair(e['chin'])}, tilt: {e['tilt']:.2f}, hand: {pair(e['hand'])} }},\n")
        f.write("};\n\nexport const GOLF_SIGNS: Record<string, [number, number, number, number]> = {\n")
        for name, box in signs.items():
            f.write(f"  {name}: [{', '.join(f'{v:.3f}' for v in box)}],\n")
        f.write(f"}};\n\nexport const GOLF_PLACE_TALL = {PLACE};\n"
                "export const GOLF_PLACES: Record<string, { file: string; wide: number }> = {\n")
        for name, e in grounds.items():
            f.write(f"  {name}: {{ file: '{e['file']}', wide: {e['wide']:.0f} }},\n")
        f.write("};\n")
    print("wrote", table)


if __name__ == "__main__":
    keep() if "--keep" in sys.argv else cut()
