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
  home.png, away.png    the two pennants
  ../bodies.ts          where everything is: chins, hands, the rim, the scoreboard's lights
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
# and bouncing the ball where she stands) is the one picture. A name that begins with "_"
# is somebody who is on the sheet and is not cut from it any more: a later picture took
# her place (OB4 for the two with her arms up, OB5 for the two of her running).
STEPH = [("OB1a-steph-moves", ["stand", "_run1", "_run2", "aim"], ["stand", "_run1", "_run2"]),
         ("OB1b-steph-shots", ["_shoot", "guard", "steal", "_cheer"], ["guard", "steal"]),
         ("OB4-steph-arms-up", ["shoot", "cheer"], ["cheer"]),
         ("OB5-steph-running", ["run1", "run2"], ["run1", "run2"])]
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
ARMS_UP = {"shoot": 1.4, "cheer": 1.3}
FACE_HALF = 19
# Two pictures of somebody running: her head is kept level between them (the one in which she
# is lower is lifted off the floor: she is in mid-stride), so that it does not bob as she goes.
STRIDES = [("run1", "run2")]

# The basket: how far above the floor its rim is, and how far out over the court from where the
# game stands it, in the game's pixels (as the paper one's is: HOOP.rim in art.ts); and how far
# across its rim is drawn, which is what sets the size of the whole of it. Its post is then cut
# to whatever length puts the rim at that height.
RIM_UP = 250
RIM_OUT = 84
RIM_WIDE = 50
# The scoreboard: how wide it is drawn. Its numbers are lights, two to a panel: where the top
# left of each of the six is in the picture, how big one is, how thick its strokes are and how
# far its top leans to the right of its bottom (all in the cutout's own pixels, measured off it:
# the same for every one of them, and checked by laying the lit strokes over the unlit ones).
BOARD_W = 270
LIGHTS = dict(at=[185, 422, 814, 1051, 1443, 1680], top=348, wide=173, tall=300, thick=30, lean=18)
# The pennants: how wide each is drawn.
PENNANT_W = 170
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


def arms_up(figure, head, chin, scale, longer):
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
    # (...and less anything as dark as her hair: where an arm lies against her head, a lock of it comes too)
    above[mc.hsv(above)[..., 2] < 0.45] = 0
    # (Taking her head away leaves a thread of it round where it was, which can join one arm
    # to the other over the top: anything that thin is rubbed out before the arms are looked for.)
    stout = cv2.morphologyEx((above[..., 3] > 0.3).astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    count, lab, st, _ = cv2.connectedComponentsWithStats(stout, 8)
    # (an arm is something that comes up from the shoulder line: the two biggest that do)
    rooted = [i for i in range(1, count) if st[i][1] + st[i][3] >= line - 6]
    two = sorted(sorted(rooted, key=lambda i: -st[i][4])[:2], key=lambda i: st[i][0])
    assert len(two) == 2, "she has not two arms up"
    clear = FACE_HALF / scale
    out = np.zeros_like(figure)
    for side, i in zip((-1, 1), two):
        arm = above.copy()
        arm[cv2.dilate((lab == i).astype(np.uint8), np.ones((11, 11), np.uint8)) == 0] = 0
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
            if not pose.startswith("_"):
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
            arms = arms_up(r["figure"], r["head"], r["chin"], scale, ARMS_UP[pose])
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


def one(name):
    """The one thing in a cutout: the biggest piece of it, trimmed."""
    return max(mc.pieces(mc.load(name), 20000), key=lambda p: p[2].shape[0] * p[2].shape[1])[2]


def basket():
    """The basket, from the side. Its rim is the only orange in it: that says where the rim
    is, and how big to draw the whole thing. Its post is then cut (or pieced out) to the
    length that puts the rim as far above the floor as the game has it: a post is the same
    all the way down, so rows of it can be taken out or put in and not be missed. The rim
    and the net are a piece of their own, for the ball to go down behind, and are taken
    out of the rest."""
    hoop = one("OB6-hoop-cutout.png")
    hsv = mc.hsv(hoop)
    orange = (hoop[..., 3] > 0.5) & (hsv[..., 0] > 5) & (hsv[..., 0] < 28) & (hsv[..., 1] > 0.55) & (hsv[..., 2] > 0.45)
    count, lab, st, _ = cv2.connectedComponentsWithStats(orange.astype(np.uint8), 8)
    ys, xs = np.where(lab == 1 + int(np.argmax(st[1:, 4])))
    # (the ring itself is the wide part of it; what joins it to the board is narrower and lower)
    ring = xs[ys < ys.min() + 14]
    left, right, top = float(ring.min()), float(xs.max()), float(ys.min())
    middle, level = (left + right) / 2, top + 8
    scale = RIM_WIDE / (right - left)

    # the post by itself: the rows in which there is nothing but one narrow upright
    solid = hoop[..., 3] > 0.3
    wide = np.array([np.ptp(np.where(row)[0]) + 1 if row.any() else 0 for row in solid])
    post = np.median(wide[int(len(wide) * 0.6):int(len(wide) * 0.9)])
    plain = np.where((wide > 0) & (wide < post * 1.25) & (np.arange(len(wide)) > ys.max() + 40))[0]
    foot = float(np.where(solid.any(axis=1))[0].max())
    more = int(round(level + RIM_UP / scale - foot))             # rows the post is short by (or, if less than nothing, too long by)
    cut_at = int(plain[len(plain) // 2])
    if more < 0:
        assert -more < len(plain) - 40, "there is not that much post to take out"
        hoop = np.concatenate([hoop[:cut_at + more // 2], hoop[cut_at - more + more // 2:]], axis=0)
    elif more > 0:
        length = hoop[plain[20]:plain[-20]]
        there = np.concatenate([length, length[::-1]] * (1 + more // (2 * len(length))), axis=0)[:more]
        hoop = np.concatenate([hoop[:cut_at], there, hoop[cut_at:]], axis=0)

    net = hoop.copy()
    net[:, :int(xs.min())] = 0
    net[:int(top) - 3] = 0
    net[int(ys.max()) + int(1.2 * (right - left)):] = 0          # (the net is no longer than its rim is wide, or near it)
    rest = hoop.copy()
    rest[int(top) - 3:int(ys.max()) + int(1.2 * (right - left)), int(xs.min()):] = 0
    mc.save("hoop.png", shrunk(rest, scale * DETAIL))
    nx0, nx1, ny0, ny1 = boxed(net[..., 3], 2)
    mc.save("net.png", shrunk(net[ny0:ny1, nx0:nx1], scale * DETAIL))
    h, w = hoop.shape[:2]
    return {
        "hoop": f"{{ file: 'hoop.png', scale: {1 / DETAIL:.4f}, foot: [{(middle - RIM_OUT / scale) / w:.4f}, {(level + RIM_UP / scale) / h:.4f}], wide: {RIM_WIDE} }}",
        "net": f"{{ file: 'net.png', scale: {1 / DETAIL:.4f}, rim: [{(middle - nx0) / (nx1 - nx0):.4f}, {(level - ny0) / (ny1 - ny0):.4f}] }}",
    }


def things():
    """The basket, the ball, the scoreboard and the pennants."""
    out = basket()

    # the ball is the middle one of the three things on the first sheet of them
    ball = sorted(mc.pieces(mc.load("OB3-things-cutout.png"), 20000), key=lambda p: p[0])[1][2]
    mc.save("ball.png", shrunk(ball, BALL * DETAIL / ball.shape[1]))
    out["ball"] = "{ file: 'ball.png' }"

    board = one("OB7-scoreboard-cutout.png")
    bh, bw = board.shape[:2]
    mc.save("board.png", shrunk(board, BOARD_W * DETAIL / bw))
    at = ", ".join(f"{x / bw:.4f}" for x in LIGHTS["at"])
    out["board"] = (f"{{ file: 'board.png', w: {BOARD_W}, tall: {BOARD_W * bh / bw:.1f}, lights: {{ at: [{at}], top: {LIGHTS['top'] / bh:.4f},"
                    f" wide: {LIGHTS['wide'] / bw:.4f}, tall: {LIGHTS['tall'] / bh:.4f}, thick: {LIGHTS['thick'] / bw:.4f}, lean: {LIGHTS['lean'] / bw:.4f} }} }}")

    # the pennants: HOME is the upper one
    home, away = (p[2] for p in sorted(mc.pieces(mc.load("OB8-pennants-cutout.png"), 20000), key=lambda p: p[1]))
    for name, pennant in (("home", home), ("away", away)):
        mc.save(f"{name}.png", shrunk(pennant, PENNANT_W * DETAIL / pennant.shape[1]))
        out[name] = f"{{ file: '{name}.png', w: {PENNANT_W} }}"
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
                " *  piece the ball goes down behind (`rim` is the middle of the rim in it); the ball; the\n"
                " *  scoreboard, and its lights: six numbers, two to a panel, each made of seven strokes.\n"
                " *  `at` is the left of each, `top` the top of all of them, `wide` and `tall` the size of one,\n"
                " *  `thick` how thick a stroke is and `lean` how far the top of one is to the right of its\n"
                " *  bottom (all as fractions of the picture: across for across, down for down). And the two\n"
                " *  pennants. */\n"
                "export interface Lights { at: number[]; top: number; wide: number; tall: number; thick: number; lean: number }\n"
                "export interface Things {\n"
                "  hoop?: { file: string; scale: number; foot: [number, number]; wide: number };\n"
                "  net?: { file: string; scale: number; rim: [number, number] };\n"
                "  ball?: { file: string };\n"
                "  board?: { file: string; w: number; tall: number; lights: Lights };\n"
                "  home?: { file: string; w: number };\n"
                "  away?: { file: string; w: number };\n"
                "}\n\n"
                "export const THINGS: Things = {\n")
        for name, row in made.items():
            f.write(f"  {name}: {row},\n")
        f.write("};\n")
    print("wrote", table)


if __name__ == "__main__":
    cut()
