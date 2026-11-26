"""Cut this game's pictures: from what the owner sent and Adobe's cutouts of it
(art-src/games/ownbasket) into the pieces the game loads (src/minis/ownbasket/assets).

Run:  .venv/bin/python src/minis/ownbasket/cut.py        (how the cutouts are made: docs/cutting.md)

It borrows the cutting tool's helpers (load, save, pieces, trim, selection,
head_only, without_heads, chin_of, ...) and points them at this game's own
folders, so nothing here reads or writes any other game's pictures.

What it makes:

  steph-<pose>.png      Stephanie's bodies, their heads taken off (hers is hung on by the chin)
  steph-<pose>-arms.png her arms again, for the poses that have them up: they go over her head
  her-<pose>.png        the other girl, who keeps her own head
  hoop.png, net.png     the basket from the side, and its rim and net as a piece of their own
  ball.png, board.png   the ball, and the scoreboard
  ../bodies.ts          where everything is: chins, hands, the rim, the scoreboard's panels
"""
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import make_cutouts as mc  # noqa: E402

mc.SRC = os.path.join(ROOT, "art-src", "games", "ownbasket")    # Adobe's cutouts and masks
mc.GEN = mc.SRC                                            # ...and the pictures they were made from
mc.OUT = os.path.join(HERE, "assets")                      # where the pieces go

# The sheets, and who is doing what on each, from left to right; and then whose heads say how
# big that sheet's people are (a mouth wide open makes a face bigger, and an arm in front of
# a head makes it smaller: those are left out). A pose the game has two names for (standing,
# and bouncing the ball where she stands) is the one picture.
STEPH = [("OB1a-steph-moves", ["stand", "run1", "run2", "aim"], ["stand", "run1", "run2"]),
         ("OB1b-steph-shots", ["shoot", "guard", "steal", "cheer"], ["guard", "steal"])]
HER = [("OB2a-her-moves", ["dribble", "run1", "run2", "shoot"], ["dribble", "run1", "run2"]),
       ("OB2b-her-feelings", ["guard", "steal", "shrug", "cheer"], ["guard", "steal"])]
ALSO = {"steph": {"dribble": "stand"}, "her": {"stand": "dribble"}}

# How big they are drawn. Everything in the game is measured in the paper dolls' pixels:
# Stephanie's chin is this far off the floor as she stands on her first sheet, and the other
# girl is this tall from her shoes to the top of her head with her arms out, baffled. (She
# is drawn a little bigger than Stephanie's body is: her own head is a real one, and small.)
STEPH_CHIN = 114
HER_TALL = 150
# Pieces are kept at this many of their pixels to one of the game's.
DETAIL = 3

# How far Stephanie's head tips, where it is not upright (the photo heads are all face on).
TILT = {"steal": 0.16, "aim": 0.05}
# Where the ball goes in a pose: the hand that is out in front of her, at her hip or at her
# chest, or the top of her arms. (As a band of her height, chin to floor, and which end of it.)
HANDS = {
    "steph": {"stand": ("out", 0.30, 0.62), "aim": ("out", -0.04, 0.26), "shoot": ("top", 0, 0)},
    "her": {"dribble": ("out", 0.30, 0.62), "shoot": ("top", 0, 0)},
}
# Stephanie's head is a good deal bigger than the one that came off, so arms held up beside
# the small one are behind the big one. In these poses her arms are a piece of their own, laid
# over her head: each moved out to its side until it is clear of her face (this far from her
# chin, in the game's pixels), and made this much longer, so that her hands still get above it.
# In the jump shot her near arm crosses in front of her face and cannot be had whole: the far
# one is used for both, turned round for the other side.
ARMS_UP = {"shoot": (1.5, True), "cheer": (1.4, False)}
FACE_HALF = 19
# Two pictures of somebody running: her head is kept level between them (the one in which she
# is lower is lifted off the floor: she is in mid-stride), so that it does not bob as she goes.
STRIDES = [("run1", "run2")]

# The basket: how far above the floor its rim is, and how far out over the court from where the
# game stands it, in the game's pixels (as the paper one's is: HOOP.rim in art.ts). The photo's
# post is a good deal further back from its rim than that, and is off the edge of the page.
RIM_UP = 250
RIM_OUT = 84
# The scoreboard: how wide it is drawn; and the middle of each of its three panels, with how
# wide each is, as fractions of the picture (measured off it: `tools/test/grid.py`).
BOARD_W = 270
PANELS = [(0.210, 0.637, 0.270), (0.498, 0.637, 0.125), (0.788, 0.637, 0.273)]
BALL = 30


def figures(cut, n):
    """The people on a sheet, from left to right: what of the sheet each one is."""
    count, lab, st, _ = cv2.connectedComponentsWithStats((cut[..., 3] > 0.16).astype(np.uint8), 8)
    big = sorted(range(1, count), key=lambda i: -st[i][4])[:n]
    assert len(big) == n, f"{len(big)} figures, not {n}"
    return [lab == i for i in sorted(big, key=lambda i: st[i][0])]


def of_each(selected, people):
    """A selection of several heads, shared out among the people they are on. (An arm in
    front of a head leaves its selection in two pieces: both go to her.)"""
    count, lab, st, _ = cv2.connectedComponentsWithStats((selected > 0.5).astype(np.uint8), 8)
    near = [cv2.dilate(p.astype(np.uint8), np.ones((15, 15), np.uint8)) > 0 for p in people]
    out = [np.zeros(selected.shape, bool) for _ in people]
    for i in range(1, count):
        if st[i][4] < 300:
            continue
        piece = lab == i
        out[int(np.argmax([(piece & n).sum() for n in near]))] |= piece
    return out


def boxed(alpha, margin=3):
    ys, xs = np.where(alpha > 0.3)
    return max(0, xs.min() - margin), min(alpha.shape[1], xs.max() + 1 + margin), max(0, ys.min() - margin), min(alpha.shape[0], ys.max() + 1 + margin)


def stands(body, chin):
    """The spot on the floor somebody stands on: under the middle of her trunk, at the
    lowest of her."""
    ys, xs = np.where(body > 0.3)
    feet = float(ys.max())
    trunk = (ys > chin[1] + 0.25 * (feet - chin[1])) & (ys < chin[1] + 0.55 * (feet - chin[1]))
    return float(np.median(xs[trunk])), feet


def hand_of(body, chin, spot, rule, way):
    """Where a hand is: the far end of whatever of her is in a band of her height (`way`
    is the side she faces, +1 for right), or the top of her."""
    kind, top, bottom = rule
    ys, xs = np.where(body > 0.3)
    if kind == "top":
        end = ys < ys.min() + 14
        return float(xs[end].mean()), float(ys.min())
    tall = spot[1] - chin[1]
    band = (ys > chin[1] + top * tall) & (ys < chin[1] + bottom * tall)
    far = xs[band].max() if way > 0 else xs[band].min()
    end = band & (np.abs(xs - far) < 16)
    return float(far), float(ys[end].mean())


def shrunk(piece, k):
    return cv2.resize(piece, (max(1, round(piece.shape[1] * k)), max(1, round(piece.shape[0] * k))), interpolation=cv2.INTER_AREA)


def arms_up(figure, head, chin, scale, longer, both_the_far_one):
    """Stephanie's two arms, from the level of her chin up, as a picture the size of the
    sheet: each moved out sideways until it is clear of where her face will be, and
    stretched upwards from where it was cut. They are laid over her head in the game. (They are cut from
    her as she came, less exactly her head: taking a head off a body takes a little of
    whatever is next to it as well, and an arm that crosses in front of her head would
    lose a bite.)"""
    line = int(chin[1] + 6)                                   # (from her chin up, there is nothing of her but arms)
    above = figure.copy()
    above[..., 3] *= 1 - np.clip(cv2.GaussianBlur(cv2.dilate(head.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32), (0, 0), 0.8) * 1.5, 0, 1)
    above[line:] = 0
    count, lab, st, _ = cv2.connectedComponentsWithStats((above[..., 3] > 0.3).astype(np.uint8), 8)
    # (an arm is something that comes up from the shoulder line: the two biggest that do)
    rooted = [i for i in range(1, count) if st[i][1] + st[i][3] >= line - 2]
    two = sorted(sorted(rooted, key=lambda i: -st[i][4])[:2], key=lambda i: st[i][0])
    assert len(two) == 2, "she has not two arms up"
    clear = FACE_HALF / scale
    out = np.zeros_like(figure)
    for side, i in zip((-1, 1), two):
        if both_the_far_one and side < 0:
            continue
        arm = above.copy()
        arm[cv2.dilate((lab == i).astype(np.uint8), np.ones((5, 5), np.uint8)) == 0] = 0
        # a round end where it was cut off, so that it reads as a piece glued on
        ys, xs = np.where(arm[..., 3] > 0.3)
        low = ys > line - 10
        cx, half = float(xs[low].mean()), float(xs[low].max() - xs[low].min()) / 2
        rows, cols = np.mgrid[0:arm.shape[0], 0:arm.shape[1]]
        arm[(rows > line - half) & ((cols - cx) ** 2 + (rows - (line - half)) ** 2 > half ** 2)] = 0
        # how far it has to go to be clear of her face, over the height of her face
        face = (ys > chin[1] - 2.6 * clear) & (ys < chin[1] - 0.2 * clear)
        inner = (xs[face].max() if side < 0 else xs[face].min()) if face.any() else chin[0]
        shift = side * max(0.0, clear - side * (inner - chin[0]))
        # ...and longer, upwards, from where it was cut
        turn = np.float32([[1, 0, shift], [0, longer, line * (1 - longer)]])
        moved = cv2.warpAffine(arm, turn, (arm.shape[1], arm.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        out = np.where(moved[..., 3:4] > out[..., 3:4], moved, out)
    if both_the_far_one:
        # the other arm: the same one, as a mirror shows it, the same distance the other side of her chin
        cols = np.clip(np.round(2 * chin[0] - np.arange(out.shape[1])).astype(int), 0, out.shape[1] - 1)
        mirrored = out[:, cols]
        mirrored[:, (2 * chin[0] - np.arange(out.shape[1]) < 0) | (2 * chin[0] - np.arange(out.shape[1]) > out.shape[1] - 1)] = 0
        out = np.where(mirrored[..., 3:4] > out[..., 3:4], mirrored, out)
    return out


def people(who, sheets, heads_are, way):
    """Everybody on somebody's sheets, as pieces and as rows for the table. `way` is +1
    for somebody facing right. Returns the rows, by pose, measured in the sheet's own
    pixels, with how big the heads on that sheet are."""
    rows = {}
    for sheet, poses, measure in sheets:
        cut = mc.load(f"{sheet}-cutout.png")
        each = figures(cut, len(poses))
        heads = of_each(mc.selection(f"{sheet}-{heads_are}.png"), each)
        size = float(np.mean([np.sqrt(h.sum()) for pose, h in zip(poses, heads) if pose in measure]))
        whole = mc.without_heads(cut, [h.astype(np.float32) for h in heads]) if who == "steph" else cut
        for pose, figure, head in zip(poses, each, heads):
            near = cv2.dilate(figure.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
            body = whole.copy()
            body[~near] = 0
            chin, tall = mc.chin_of(head.astype(np.float32))
            if who == "steph":
                # (her own head is face on, and sits over her neck: most of the way back from the
                # tip of the chin that was there to the middle of the neck under it)
                under = np.where(body[int(chin[1]) + 8:int(chin[1]) + 26, max(0, int(chin[0]) - 90):int(chin[0]) + 40, 3] > 0.5)[1]
                if len(under):
                    neck = max(0, int(chin[0]) - 90) + float(np.median(under))
                    chin = (chin[0] * 0.35 + neck * 0.65, chin[1])
            spot = stands(body[..., 3], chin)
            mine = cut.copy()
            mine[~near] = 0
            row = dict(sheet=sheet, size=size, body=body, figure=mine, head=head, chin=chin, spot=spot, face=tall)
            if pose in HANDS[who]:
                row["hand"] = hand_of(body[..., 3], chin, spot, HANDS[who][pose], way)
            rows[pose] = row
    for a, b in STRIDES:
        if a in rows and b in rows:
            # (measured in heads, since the two may be on sheets of different sizes)
            up = {p: (rows[p]["spot"][1] - rows[p]["chin"][1]) / rows[p]["size"] for p in (a, b)}
            low, high = (a, b) if up[a] < up[b] else (b, a)
            rows[low]["spot"] = (rows[low]["spot"][0], rows[low]["spot"][1] + (up[high] - up[low]) * rows[low]["size"])
    return rows


def write_people(who, rows, scale_of):
    """Save somebody's pieces, and give back her lines of the table."""
    lines = []
    for pose, r in rows.items():
        scale = scale_of(r)                                   # the game's pixels to one of the sheet's
        if who == "steph" and pose in ARMS_UP:
            # (her arms from the chin up are a piece of their own: they come off the body)
            r["body"][:int(r["chin"][1] + 6)] = 0
        x0, x1, y0, y1 = boxed(r["body"][..., 3])
        mc.save(f"{who}-{pose}.png", shrunk(r["body"][y0:y1, x0:x1], scale * DETAIL))
        sx, sy = r["spot"]
        at = lambda p: f"[{(p[0] - sx) * scale:.1f}, {(p[1] - sy) * scale:.1f}]"  # noqa: E731
        more = ""
        if who == "her":
            # (her own head: the top of it is a third of her face above the top of her face)
            more += f", tall: {r['face'] * 1.34 * scale:.1f}"
        if "hand" in r:
            more += f", hand: {at(r['hand'])}"
        if who == "steph" and pose in ARMS_UP:
            arms = arms_up(r["figure"], r["head"], r["chin"], scale, *ARMS_UP[pose])
            ax0, ax1, ay0, ay1 = boxed(arms[..., 3])
            mc.save(f"{who}-{pose}-arms.png", shrunk(arms[ay0:ay1, ax0:ax1], scale * DETAIL))
            more += f", arms: {{ file: '{who}-{pose}-arms.png', spot: [{(sx - ax0) / (ax1 - ax0):.3f}, {(sy - ay0) / (ay1 - ay0):.3f}] }}"
            if "hand" in r:
                # (the ball leaves from the top of the arms as they now are)
                ys, xs = np.where(arms[..., 3] > 0.3)
                top = ys < ys.min() + 14
                more = more.replace(f"hand: {at(r['hand'])}", f"hand: {at((float(xs[top].mean()), float(ys.min())))}")
        line = (f"{{ file: '{who}-{pose}.png', scale: {1 / DETAIL:.4f}, spot: [{(sx - x0) / (x1 - x0):.3f}, {(sy - y0) / (y1 - y0):.3f}],"
                f" chin: {at(r['chin'])}, tilt: {TILT.get(pose, 0) if who == 'steph' else 0:.2f}{more} }}")
        lines.append((pose, line))
        for twin, of in ALSO[who].items():
            if of == pose:
                lines.append((twin, line))
    return lines


def things():
    """The basket, the ball and the scoreboard: one cutout, three things, left to right."""
    hoop, ball, board = (p[2] for p in sorted(mc.pieces(mc.load("OB3-things-cutout.png"), 20000), key=lambda p: p[0]))
    out = {}

    # The basket. Its rim is the only orange in it: that says where the rim is, and how big to
    # draw the whole thing. The rim and the net are a piece of their own, for the ball to go
    # down behind, and are taken out of the rest.
    hsv = mc.hsv(hoop)
    orange = (hoop[..., 3] > 0.5) & (hsv[..., 0] > 5) & (hsv[..., 0] < 28) & (hsv[..., 1] > 0.55) & (hsv[..., 2] > 0.45)
    count, lab, st, _ = cv2.connectedComponentsWithStats(orange.astype(np.uint8), 8)
    rim = lab == 1 + int(np.argmax(st[1:, 4]))
    ys, xs = np.where(rim)
    # (the ring itself is the wide part of it; what joins it to the board is narrower and lower)
    ring = xs[ys < ys.min() + 14]
    left, right, top = float(ring.min()), float(xs.max()), float(ys.min())
    middle, level = (left + right) / 2, top + 8
    foot = float(np.where(hoop[..., 3] > 0.3)[0].max())
    scale = RIM_UP / (foot - level)
    net = hoop.copy()
    net[:, :int(xs.min())] = 0
    net[:int(top) - 3] = 0
    rest = hoop.copy()
    rest[int(top) - 3:, int(xs.min()):] = 0
    mc.save("hoop.png", shrunk(rest, scale * DETAIL))
    nx0, nx1, ny0, ny1 = boxed(net[..., 3], 2)
    mc.save("net.png", shrunk(net[ny0:ny1, nx0:nx1], scale * DETAIL))
    h, w = hoop.shape[:2]
    out["hoop"] = (f"{{ file: 'hoop.png', scale: {1 / DETAIL:.4f}, foot: [{(middle - RIM_OUT / scale) / w:.4f}, {(level + RIM_UP / scale) / h:.4f}], wide: {(right - left) * scale:.1f} }}")
    out["net"] = (f"{{ file: 'net.png', scale: {1 / DETAIL:.4f}, rim: [{(middle - nx0) / (nx1 - nx0):.4f}, {(level - ny0) / (ny1 - ny0):.4f}] }}")

    mc.save("ball.png", shrunk(ball, BALL * DETAIL / ball.shape[1]))
    out["ball"] = "{ file: 'ball.png' }"

    bh, bw = board.shape[:2]
    where = ", ".join(f"[{x:.3f}, {y:.3f}]" for x, y, _ in PANELS)
    sizes = ", ".join(f"{w:.3f}" for _, _, w in PANELS)
    mc.save("board.png", shrunk(board, BOARD_W * DETAIL / bw))
    out["board"] = f"{{ file: 'board.png', w: {BOARD_W}, tall: {BOARD_W * bh / bw:.1f}, panels: [{where}], wide: [{sizes}] }}"
    return out


def cut():
    steph = people("steph", STEPH, "headmask", 1)
    her = people("her", HER, "facemask", -1)
    # Stephanie: by her chin as she stands, and her other sheet matched to that by the heads on it
    stand = steph["stand"]
    base = STEPH_CHIN / (stand["spot"][1] - stand["chin"][1])
    steph_lines = write_people("steph", steph, lambda r: base * stand["size"] / r["size"])
    # the other girl: by how tall she stands, baffled, and her other sheet matched the same way
    shrug = her["shrug"]
    ys = np.where(shrug["body"][..., 3] > 0.3)[0]
    tall = HER_TALL / (ys.max() - ys.min())
    her_lines = write_people("her", her, lambda r: tall * shrug["size"] / r["size"])
    made = things()

    table = os.path.join(HERE, "bodies.ts")
    with open(table, "w") as f:
        f.write("/** The photos of this game, and where everything is in them. Written by cut.py: do not\n"
                " *  edit by hand.\n"
                " *\n"
                " *  For each of the two of them ('steph', 'her') and each pose: the picture, how big it is\n"
                " *  drawn (the game's pixels to one of the picture's), the spot on the floor she stands on\n"
                " *  (as a fraction of the picture), where her chin is from that spot (in the game's pixels)\n"
                " *  and how far her head tips. Stephanie's head is hung on at the chin; the other girl has\n"
                " *  kept her own, and `tall` is how tall it is. `hand` is where the ball goes in a pose that\n"
                " *  holds one. `arms` is Stephanie's arms again, for a pose that has them up: a picture of\n"
                " *  its own, laid over her head, standing on the same spot.\n"
                " *\n"
                " *  A pose that is not here is still a paper doll (art.ts), and its chin is the doll's. */\n"
                "export interface Body {\n  file: string;\n  scale: number;\n  spot: [number, number];\n  chin: [number, number];\n  tilt: number;\n"
                "  tall?: number;\n  hand?: [number, number];\n  arms?: { file: string; spot: [number, number] };\n}\n\n"
                "export const BODIES: Record<string, Record<string, Body>> = {\n")
        for who, lines in (("steph", steph_lines), ("her", her_lines)):
            f.write(f"  {who}: {{\n")
            for pose, line in lines:
                f.write(f"    {pose}: {line},\n")
            f.write("  },\n")
        f.write("};\n\n"
                "/** The things: the basket from the side (`foot` is the spot the game stands it on, as a\n"
                " *  fraction of the picture: the middle of its rim is where the paper one's is from there;\n"
                " *  `wide` is how far across the rim is, in the game's pixels); its rim and net again, as the\n"
                " *  piece the ball goes down behind (`rim` is the middle of the rim in it); the ball; and the\n"
                " *  scoreboard, with the middle of each of its three panels and how wide each is (as\n"
                " *  fractions of the picture). */\n"
                "export interface Things {\n"
                "  hoop?: { file: string; scale: number; foot: [number, number]; wide: number };\n"
                "  net?: { file: string; scale: number; rim: [number, number] };\n"
                "  ball?: { file: string };\n"
                "  board?: { file: string; w: number; tall: number; panels: [number, number][]; wide: number[] };\n"
                "}\n\n"
                "export const THINGS: Things = {\n")
        for name, row in made.items():
            f.write(f"  {name}: {row},\n")
        f.write("};\n")
    print("wrote", table)


if __name__ == "__main__":
    cut()
