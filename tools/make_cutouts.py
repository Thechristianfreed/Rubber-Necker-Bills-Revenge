"""Turn Adobe background-removed images into game-ready photo cutouts.

Inputs  (art-src/adobe):     <name>-cutout.png   (RGBA, background removed)
Outputs (src/assets/scrap):  one trimmed picture per game piece (saved as WebP)

The game adds the white paper border and drop shadow itself, so these are just
the clean cutouts, trimmed to their contents.

Run:  python tools/make_cutouts.py     (needs pillow, numpy, opencv-python-headless)
"""
import os
import cv2
import numpy as np
from PIL import Image
from shrink_assets import save_webp

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "art-src", "adobe")
OUT = os.path.join(ROOT, "src", "assets", "scrap")


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name)).convert("RGBA"), dtype=np.float32) / 255.0


def save(name, rgba):
    """Save a cutout. It is called "name.png" everywhere, here and in the game,
    but what is written is a WebP, which is a fraction of the size."""
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    image = Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA")
    if name.endswith(".png"):
        size = save_webp(image, path)
    else:
        image.save(path, optimize=True)
        size = os.path.getsize(path)
    print(name, rgba.shape[1], "x", rgba.shape[0], size, "bytes")


def trim(rgba, margin=2):
    ys, xs = np.where(rgba[..., 3] > 0.08)
    y0, y1 = max(0, ys.min() - margin), min(rgba.shape[0], ys.max() + 1 + margin)
    x0, x1 = max(0, xs.min() - margin), min(rgba.shape[1], xs.max() + 1 + margin)
    return rgba[y0:y1, x0:x1]


def seal_glass(rgba, original, top_fraction=0.5):
    """Background removal sometimes punches see-through holes in window glass.
    Fill any hole that is fully enclosed by the vehicle, in its upper part, with
    the original pixels so the glass reads as solid."""
    solid = rgba[..., 3] > 0.5
    contours, _ = cv2.findContours(solid.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros(solid.shape, np.uint8)
    cv2.drawContours(filled, contours, -1, 1, thickness=cv2.FILLED)
    ys = np.where(solid.any(axis=1))[0]
    cut = ys.min() + (ys.max() - ys.min()) * top_fraction
    rows = np.arange(solid.shape[0])[:, None]
    holes = (filled == 1) & (rgba[..., 3] < 0.98) & (rows < cut)
    out = rgba.copy()
    out[holes, :3] = original[holes, :3]
    out[holes, 3] = 1.0
    return out


def richer(rgba, amount=1.35):
    """Deepen the paint colour so it survives the game's faded-print finish.
    Near-neutral pixels (chrome, whitewalls, glass) are left alone."""
    hsv = cv2.cvtColor(rgba[..., :3].astype(np.float32), cv2.COLOR_RGB2HSV)
    painted = hsv[..., 1] > 0.12
    hsv[..., 1] = np.where(painted, np.clip(hsv[..., 1] * amount, 0, 1), hsv[..., 1])
    hsv[..., 2] = np.where(painted, hsv[..., 2] * 0.96, hsv[..., 2])
    out = rgba.copy()
    out[..., :3] = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    return out


def bug():
    cut = load("A-bug-cutout.png")
    src = np.asarray(Image.open(os.path.join(ROOT, "art-src", "generated", "A-bug.png")).convert("RGB"), dtype=np.float32) / 255.0
    save("bug.png", trim(richer(seal_glass(cut, src))))


def original(name):
    return np.asarray(Image.open(os.path.join(ROOT, "art-src", "generated", name)).convert("RGB"), dtype=np.float32) / 255.0


def pieces(rgba, min_area=400):
    """Split a sheet into its separate cutouts. Returns (x, y, piece) in sheet
    coordinates, each piece trimmed to its own contents."""
    n, lab, stats, _ = cv2.connectedComponentsWithStats((rgba[..., 3] > 0.16).astype(np.uint8), 8)
    out = []
    for i in range(1, n):
        x, y, w, h, area = stats[i]
        if area < min_area:
            continue
        near = cv2.dilate((lab == i).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
        piece = rgba.copy()
        piece[~near] = 0
        out.append((int(x), int(y), trim(piece)))
    return out


def hsv(rgba):
    return cv2.cvtColor(rgba[..., :3].astype(np.float32), cv2.COLOR_RGB2HSV)


def glass_mask(rgba):
    """Windows: large see-through or backdrop-coloured areas enclosed by the
    upper part of a vehicle."""
    solid = rgba[..., 3] > 0.5
    contours, _ = cv2.findContours(solid.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    hull = np.zeros(solid.shape, np.uint8)
    cv2.drawContours(hull, contours, -1, 1, thickness=cv2.FILLED)
    hull = cv2.erode(hull, np.ones((5, 5), np.uint8)).astype(bool)
    h = hsv(rgba)
    backdrop = (h[..., 1] < 0.05) & (h[..., 2] > 0.84)
    cand = hull & ((rgba[..., 3] < 0.9) | backdrop)
    ys = np.where(solid.any(axis=1))[0]
    rows = np.arange(solid.shape[0])[:, None]
    cand &= rows < ys.min() + (ys.max() - ys.min()) * 0.6
    cand = cv2.morphologyEx(cand.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, cent = cv2.connectedComponentsWithStats(cand, 8)
    mask = np.zeros(solid.shape, bool)
    windows = []
    for i in range(1, n):
        if stats[i][4] < 260:
            continue
        mask |= lab == i
        windows.append(tuple(int(v) for v in stats[i][:4]))
    mask = cv2.dilate(mask.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & hull
    return mask, sorted(windows)


def dark_glass(rgba):
    """Paint the windows as a dark interior, so a neck reads as coming out of the car."""
    mask, windows = glass_mask(rgba)
    out = rgba.copy()
    rows = np.linspace(0, 1, rgba.shape[0])[:, None]
    shade = 0.16 + 0.07 * rows
    for c, base in enumerate((0.78, 0.92, 1.12)):
        out[..., c] = np.where(mask, shade * base, out[..., c])
    out[..., 3] = np.where(mask, 1.0, out[..., 3])
    return out, windows


def repaint(rgba, hue, sat_mul, val_mul=1.0):
    """Respray a vehicle: move its body colour to a new hue. Only pixels close
    to the dominant paint hue change, so tyres, chrome, glass, lamps and wood
    trim are left alone."""
    h = hsv(rgba)
    paint = (h[..., 1] > 0.08) & (h[..., 2] > 0.3) & (rgba[..., 3] > 0.5)
    body = np.median(h[..., 0][paint])
    away = np.abs(((h[..., 0] - body + 180) % 360) - 180)
    paint &= away < 30
    h[..., 0] = np.where(paint, hue, h[..., 0])
    h[..., 1] = np.where(paint, np.clip(h[..., 1] * sat_mul, 0, 1), h[..., 1])
    h[..., 2] = np.where(paint, np.clip(h[..., 2] * val_mul, 0, 1), h[..., 2])
    out = rgba.copy()
    out[..., :3] = cv2.cvtColor(h, cv2.COLOR_HSV2RGB)
    return out


def fractions(label, piece, windows):
    hh, ww = piece.shape[:2]
    print(f"  {label} windows (centre x, sill y as fractions):",
          [(round((x + w / 2) / ww, 3), round((y + h * 0.8) / hh, 3)) for x, y, w, h in windows])


def vehicles():
    sheet = sorted(pieces(load("C-bus-van-cutout.png")), key=lambda p: p[1])
    bus, windows = dark_glass(sheet[0][2])
    save("bus.png", bus)
    fractions("bus", bus, windows)
    van, windows = dark_glass(sheet[1][2])
    fractions("van", van, windows)
    save("van-blue.png", richer(van, 1.5))
    save("van-green.png", repaint(van, 128, 2.2, 0.86))


def cars():
    sheet = sorted(pieces(load("B-cars-cutout.png")), key=lambda p: p[1])
    sedan, windows = dark_glass(sheet[0][2])
    fractions("sedan", sedan, windows)
    save("sedan-red.png", sedan)
    save("sedan-blue.png", repaint(sedan, 214, 0.78, 0.86))
    save("sedan-green.png", repaint(sedan, 150, 0.62, 0.74))
    wagon, windows = dark_glass(sheet[1][2])
    fractions("wagon", wagon, windows)
    save("wagon.png", wagon)
    pickup, windows = dark_glass(sheet[2][2])
    fractions("pickup", pickup, windows)
    save("pickup-mustard.png", pickup)
    save("pickup-blue.png", repaint(pickup, 200, 0.62, 0.9))


def heads():
    sheet = pieces(load("D-heads-cutout.png"))
    rows = sorted(sheet, key=lambda p: p[1])
    gawk = sorted(rows[:4], key=lambda p: p[0])
    dazed = sorted(rows[4:], key=lambda p: p[0])
    for i, (g, d) in enumerate(zip(gawk, dazed)):
        save(f"head{i}.png", g[2])
        save(f"head{i}-dazed.png", d[2])


def clear_haze(rgba, from_row):
    """Background removal can leave a pale haze of backdrop along the bottom of
    a sheet. Drop near-white, colourless pixels below `from_row`."""
    h = hsv(rgba)
    rows = np.arange(rgba.shape[0])[:, None]
    haze = (h[..., 1] < 0.11) & (h[..., 2] > 0.78) & (rows >= from_row)
    out = rgba.copy()
    out[..., 3] = np.where(haze, 0.0, out[..., 3])
    return out


def grid_cells(rgba, cols, rows, min_area=2500):
    """One cutout per grid cell: the largest piece whose centre falls in the cell.
    Returns the pieces row by row."""
    n, lab, stats, cent = cv2.connectedComponentsWithStats((rgba[..., 3] > 0.3).astype(np.uint8), 8)
    H, W = rgba.shape[:2]
    best = {}
    for i in range(1, n):
        area = stats[i][4]
        if area < min_area:
            continue
        cell = (min(rows - 1, int(cent[i][1] * rows / H)), min(cols - 1, int(cent[i][0] * cols / W)))
        if cell not in best or area > stats[best[cell]][4]:
            best[cell] = i
    out = []
    for r in range(rows):
        for c in range(cols):
            i = best[(r, c)]
            near = cv2.dilate((lab == i).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
            piece = rgba.copy()
            piece[~near] = 0
            out.append(trim(piece))
    return out


def head_only(rgba, mask_name):
    """Keep just hair, face and ears, using Adobe's body-part selection, with
    the holes it leaves at eyes and foreheads filled back in."""
    m = np.asarray(Image.open(os.path.join(SRC, mask_name)).convert("RGBA"), dtype=np.float32) / 255.0
    sel = m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)
    solid = (sel > 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros(solid.shape, np.uint8)
    cv2.drawContours(filled, contours, -1, 1, thickness=cv2.FILLED)
    filled = cv2.GaussianBlur(filled.astype(np.float32), (0, 0), 1.2)
    out = rgba.copy()
    out[..., 3] = np.minimum(out[..., 3], np.clip(filled * 1.6, 0, 1))
    return out


def more_heads():
    """Sheets two and three of rubberneckers: heads 4 to 11."""
    sheet2 = grid_cells(clear_haze(load("H-heads2-cutout.png"), 470), 4, 2)
    sheet3 = grid_cells(head_only(load("I-heads3-cutout.png"), "I-heads3-headmask.png"), 4, 2)
    for base, sheet in ((4, sheet2), (8, sheet3)):
        for i in range(4):
            save(f"head{base + i}.png", sheet[i])
            save(f"head{base + i}-dazed.png", sheet[4 + i])


def bill():
    """Bill's body in three stop-motion poses (rest, wind-up, swing). The man in
    the source photo loses his head, and the game puts Bill's photo head on the
    neck. Prints, for each pose, where the chin was (as a fraction of the saved
    image): that is the point the game hangs the pose and the head from."""
    cut = load("S-bill-poses-cutout.png")
    m = load("S-bill-poses-headmask.png")
    head = ((m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)) > 0.5).astype(np.uint8)
    grown = cv2.GaussianBlur(cv2.dilate(head, np.ones((11, 11), np.uint8)).astype(np.float32), (0, 0), 1.0)
    body = cut.copy()
    body[..., 3] *= 1 - np.clip(grown * 1.5, 0, 1)

    n, _, hs, _ = cv2.connectedComponentsWithStats(head, 8)
    heads = sorted((tuple(int(v) for v in hs[i][:4]) for i in range(1, n) if hs[i][4] > 1500), key=lambda b: b[0])
    n, lab, bs, _ = cv2.connectedComponentsWithStats((body[..., 3] > 0.3).astype(np.uint8), 8)
    for name, (hx, hy, hw, hh) in zip(("rest", "windup", "swing"), heads):
        chin = (hx + hw / 2, hy + hh)
        # the body under this head: the biggest piece that spans the chin's column
        best = max((i for i in range(1, n) if bs[i][0] <= chin[0] <= bs[i][0] + bs[i][2]), key=lambda i: bs[i][4])
        near = cv2.dilate((lab == best).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        piece = body.copy()
        piece[~near] = 0
        ys, xs = np.where(piece[..., 3] > 0.08)
        x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
        save(f"bill-{name}.png", piece[y0:y1, x0:x1])
        print(f"  bill-{name}: chin at ({(chin[0] - x0) / (x1 - x0):.3f}, {(chin[1] - y0) / (y1 - y0):.3f}),"
              f" far right edge {x1 - chin[0]:.0f}px right and {chin[1] - ys[xs.argmax()]:.0f}px above the chin")


def kid():
    """Bill as a kid on the Stingray: four stop-motion frames (riding, winding
    up, throwing, ducking). The bike sits at the same pixels in all four source
    images, so every frame is pinned at the same point on the ground under it.
    The boy loses his head, and the game puts Bill's on his neck. Prints each
    frame's ground anchor (as a fraction of the saved image) and where the
    chin was, in source pixels from that anchor."""
    ground = (512, 548)
    for name, src in (("rest", "T1-kid-rest"), ("windup", "T2-kid-windup"), ("swing", "T3b-kid-throw"), ("duck", "T4-kid-duck")):
        cut = load(f"{src}-cutout.png")
        m = load(f"{src}-headmask.png")
        head = ((m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)) > 0.5).astype(np.uint8)
        grown = cv2.GaussianBlur(cv2.dilate(head, np.ones((9, 9), np.uint8)).astype(np.float32), (0, 0), 1.0)
        body = cut.copy()
        body[..., 3] *= 1 - np.clip(grown * 1.5, 0, 1)
        # drop any specks left where the head was
        n, lab, st, _ = cv2.connectedComponentsWithStats((body[..., 3] > 0.3).astype(np.uint8), 8)
        biggest = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        near = cv2.dilate((lab == biggest).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        body[~near] = 0
        ys, xs = np.where(body[..., 3] > 0.08)
        x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
        save(f"kid-{name}.png", body[y0:y1, x0:x1])
        hy, hx = np.where(head > 0)
        chin = ((hx.min() + hx.max()) / 2, hy.max())
        print(f"  kid-{name}: anchor ({(ground[0] - x0) / (x1 - x0):.3f}, {(ground[1] - y0) / (y1 - y0):.3f}),"
              f" chin {chin[0] - ground[0]:+.0f}, {chin[1] - ground[1]:+.0f} px from it")

    # A rolled-up newspaper to throw: the free end of the one he holds out in the
    # first version of the throwing frame, turned level and mirrored to make a whole roll.
    cut = load("T3-kid-swing-cutout.png")
    piece = cut[78:140, 596:682]
    h, w = piece.shape[:2]
    turn = cv2.getRotationMatrix2D((w / 2, h / 2), -27, 1.0)
    level = trim(cv2.warpAffine(piece, turn, (w, h), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0)))
    half = level[:, level.shape[1] // 2:]
    save("paper-roll.png", trim(np.concatenate([half[:, ::-1], half], axis=1)))


def selection(name):
    """One of Adobe's selections, as how selected each pixel is (0 to 1)."""
    m = load(name)
    return m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)


def mom():
    """Stephanie, the instructor on the workout tape: four faces. One is a
    photo of her smiling (WT1d); the three of the breathing (the breath in, the
    "PAH", holding it) are edits of that same photo, one expression each (WT1a
    to WT1c). They share one framing, so they share one hairline and one chin:
    the chin where it is with her mouth shut, so that her head stays put when
    her mouth drops open. All four are saved with her face the same size, FACE
    pixels from hairline to chin, and each prints how tall its picture is in
    faces and where that chin is in it: what src/art/photos.ts needs to show
    them the same size, hung from one point."""
    FACE = 200
    names = (("d", "smile"), ("b", "in"), ("a", "pah"), ("c", "hold"))
    faces = {n: np.where(selection(f"WT1{c}-mom-{n}-facemask.png") > 0.5) for c, n in names}
    top = min(ys.min() for ys, _ in faces.values())
    shut = [n for _, n in names if n != "pah"]
    chin = (float(np.mean([(xs.min() + xs.max()) / 2 for _, xs in faces.values()])), float(np.mean([faces[n][0].max() for n in shut])))
    k = FACE / (chin[1] - top)
    for c, n in names:
        head = head_only(load(f"WT1{c}-mom-{n}-cutout.png"), f"WT1{c}-mom-{n}-headmask.png")
        ys, xs = np.where(head[..., 3] > 0.08)
        x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
        piece = head[y0:y1, x0:x1]
        out = cv2.resize(piece, (round(piece.shape[1] * k), round(piece.shape[0] * k)), interpolation=cv2.INTER_AREA)
        save(f"mom-{n}.png", out)
        print(f"  mom-{n}: {out.shape[0] / FACE:.3f} faces tall, chin at ({(chin[0] - x0) / (x1 - x0):.3f}, {(chin[1] - y0) / (y1 - y0):.3f})")


def bill_faces():
    """Bill's faces for the breathing on the workout tape: the breath in, holding
    it, and the "PAH". They are edits of one photo of him, one expression each
    (WT6a to WT6c), so they share one framing: the top of his hair, and his chin
    where it is with his mouth shut. Each is saved with his head HEAD pixels
    tall between those two, and prints how tall its picture is in heads and
    where that chin is in it, for src/art/photos.ts."""
    HEAD = 260
    names = (("a", "in"), ("b", "hold"), ("c", "pah"))
    heads = {n: np.where(selection(f"WT6{c}-bill-{n}-headmask.png") > 0.5) for c, n in names}
    top = min(ys.min() for ys, _ in heads.values())
    chin = (float(np.mean([(xs.min() + xs.max()) / 2 for _, xs in heads.values()])), float(np.mean([heads[n][0].max() for n in ("in", "hold")])))
    k = HEAD / (chin[1] - top)
    for c, n in names:
        head = head_only(load(f"WT6{c}-bill-{n}-cutout.png"), f"WT6{c}-bill-{n}-headmask.png")
        ys, xs = np.where(head[..., 3] > 0.08)
        x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
        piece = head[y0:y1, x0:x1]
        out = cv2.resize(piece, (round(piece.shape[1] * k), round(piece.shape[0] * k)), interpolation=cv2.INTER_AREA)
        save(f"billface-{n}.png", out)
        print(f"  billface-{n}: {out.shape[0] / HEAD:.3f} heads tall, chin at ({(chin[0] - x0) / (x1 - x0):.3f}, {(chin[1] - y0) / (y1 - y0):.3f})")


# The workout's bodies: for each sheet, whose it is and which pose each figure
# is doing, from left to right, with how far the new head should tip on it.
WORKOUT_SHEETS = [
    ("WT2a-mom-standing", "mom", [("ready", -0.10), ("lunge", 0.0), ("stretch", 0.0)]),
    ("WT2b-mom-floor", "mom", [("frog", 0.0), ("pretzel", 0.04), ("kick", 0.16)]),
    ("WT2c-bill-standing", "bill", [("ready", -0.10), ("lunge", 0.0), ("stretch", 0.0)]),
    ("WT2d-bill-floor", "bill", [("frog", 0.0), ("pretzel", 0.04), ("kick", 0.16)]),
]
# How tall a chin is off the floor when its owner stands up straight, in the game's own pixels.
STANDING_CHIN = 196


def workout_bodies():
    """Mom's (and Bill's) bodies for the workout tape, one for each pose. The
    people in the generated sheets lose their heads, and the game hangs
    Stephanie's and Bill's from the chins they leave. Writes src/data/workout.ts:
    for each pose its file, how big to draw it, the spot on the floor it stands
    on (as a fraction of the picture), and where the chin was from that spot."""
    found = {}
    for sheet, who, poses in WORKOUT_SHEETS:
        cut = load(f"{sheet}-cutout.png")
        head = (selection(f"{sheet}-headmask.png") > 0.5).astype(np.uint8)
        grown = cv2.GaussianBlur(cv2.dilate(head, np.ones((7, 7), np.uint8)).astype(np.float32), (0, 0), 1.0)
        body = cut.copy()
        body[..., 3] *= 1 - np.clip(grown * 1.5, 0, 1)
        n, _, hs, _ = cv2.connectedComponentsWithStats(head, 8)
        heads = sorted((tuple(int(v) for v in hs[i][:4]) for i in range(1, n) if hs[i][4] > 600), key=lambda box: box[0])
        n, lab, bs, _ = cv2.connectedComponentsWithStats((body[..., 3] > 0.3).astype(np.uint8), 8)
        bodies = sorted((i for i in range(1, n) if bs[i][4] > 4000), key=lambda i: bs[i][0])
        assert len(heads) == len(bodies) == len(poses), f"{sheet}: {len(heads)} heads, {len(bodies)} bodies"
        for (pose, tilt), (hx, hy, hw, hh), i in zip(poses, heads, bodies):
            # the chin: the middle of the lowest tenth of the head
            rows = head[hy + int(hh * 0.9):hy + hh, hx:hx + hw]
            chin = (hx + float(np.where(rows)[1].mean()), hy + hh)
            near = cv2.dilate((lab == i).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
            piece = body.copy()
            piece[~near] = 0
            ys, xs = np.where(piece[..., 3] > 0.08)
            x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
            save(f"pose-{who}-{pose}.png", piece[y0:y1, x0:x1])
            spot = ((x0 + x1) / 2, ys.max())
            found[(who, pose)] = dict(file=f"pose-{who}-{pose}.png", spot=((spot[0] - x0) / (x1 - x0), (spot[1] - y0) / (y1 - y0)),
                                      chin=(chin[0] - spot[0], chin[1] - spot[1]), tilt=tilt,
                                      head=float(np.sqrt(head[hy:hy + hh, hx:hx + hw].sum())))
    table = os.path.join(ROOT, "src", "data", "workout.ts")
    with open(table, "w") as f:
        f.write("/** The photo bodies for the workout tape: for each pose, the picture, how big\n"
                " *  it is drawn (game pixels to one of the picture's), the spot on the floor it\n"
                " *  stands on (as a fraction of the picture), where the chin goes from that spot\n"
                " *  (in game pixels) and how far the head tips. Written by tools/make_cutouts.py;\n"
                " *  do not edit by hand. */\n"
                "export interface WorkoutBody { file: string; scale: number; spot: [number, number]; chin: [number, number]; tilt: number }\n\n"
                "export const WORKOUT_BODIES: Record<string, Record<string, WorkoutBody>> = {\n")
        for who in sorted({w for w, _ in found}, reverse=True):
            # everybody is drawn to the size that stands the tall one's chin where the game expects it...
            standing = STANDING_CHIN / -found[(who, "stretch")]["chin"][1]
            usual = float(np.median([b["head"] for (w, _), b in found.items() if w == who]))
            f.write(f"  {who}: {{\n")
            for (w, pose), b in found.items():
                if w != who:
                    continue
                # ...unless a figure was photographed from closer up or further off than the rest,
                # which the size of the head it lost gives away
                off = usual / b["head"]
                scale = standing * (off if abs(off - 1) > 0.12 else 1.0)
                f.write(f"    {pose}: {{ file: '{b['file']}', scale: {scale:.4f}, spot: [{b['spot'][0]:.3f}, {b['spot'][1]:.3f}],"
                        f" chin: [{b['chin'][0] * scale:.1f}, {b['chin'][1] * scale:.1f}], tilt: {b['tilt']} }},\n")
            f.write("  },\n")
        f.write("};\n")
    print("wrote", table)


def workout_set():
    """The rest of the workout tape's set. The television, with its green screen
    taken out (the tape plays behind the glass) and saved beside it as the shape
    of the hole; the room on the tape; and the den the television stands in.
    Prints where the screen and the recorder's clock are on the television, as
    fractions of its picture, for TV in src/art/minis.ts."""
    cut = load("WT4-television-cutout.png")
    src = original("WT4-television.webp")
    green = ((src[..., 1] > 0.6) & (src[..., 0] < 0.55) & (src[..., 2] < 0.55)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(green, 8)
    glass = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    # a little wider than the green itself, to take its glow off the edge of the tube with it
    glass = cv2.dilate(glass, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    hole = cv2.GaussianBlur(glass.astype(np.float32), (0, 0), 0.8)
    tv = cut.copy()
    tv[..., :3] = tv[..., :3] * (1 - hole[..., None]) + np.float32((0.07, 0.08, 0.09)) * hole[..., None]
    ys, xs = np.where(tv[..., 3] > 0.08)
    x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    save("tv-set.png", tv[y0:y1, x0:x1])
    mask = np.zeros_like(tv)
    mask[..., :3] = 1
    mask[..., 3] = hole
    save("tv-glass.png", mask[y0:y1, x0:x1])
    gy, gx = np.where(glass > 0)
    w, h = x1 - x0, y1 - y0
    print(f"  television: {w} x {h}; screen from ({(gx.min() - x0) / w:.3f}, {(gy.min() - y0) / h:.3f}),"
          f" {(gx.max() - gx.min()) / w:.3f} wide and {(gy.max() - gy.min()) / h:.3f} tall")
    # the recorder's display: the long dark window low down on the front of it
    print(f"  clock at about ({(512 - x0) / w:.3f}, {(622 - y0) / h:.3f})")

    def backdrop(name, rgb, quality=84):
        path = os.path.join(OUT, name)
        Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB").save(path, quality=quality)
        print(name, rgb.shape[1], "x", rgb.shape[0], os.path.getsize(path), "bytes")

    # the room on the tape: a little soft and washed out, as a tape that has been played a lot is
    room = cv2.resize(original("WT3-tape-room.webp"), (704, 528), interpolation=cv2.INTER_AREA)
    room = cv2.GaussianBlur(room, (0, 0), 0.7)
    backdrop("tape-room.jpg", room * 0.86 + 0.10)

    # the den: the flat of the wall between the corners, laid beside its own mirror image so that
    # it is wide enough for any screen, with more carpet added at the bottom the same way
    den = original("WT5-den.webp")[:, 72:952]
    den = np.concatenate([den, den[:, ::-1]], axis=1)
    den = np.concatenate([den, den[:-70:-1]], axis=0)
    backdrop("den.jpg", den, 80)


# The fight after school. Stephanie's bodies, by sheet, in the order they stand on it; the
# other girl before and after, the same way.
FIGHT_CHEER = [("AS1a-cheer-standing", ["ready", "fingers", "kick", "flurry"]), ("AS1b-cheer-losing", ["plead", "fly", "ko"])]
FIGHT_RIVAL = [("AS2a-rival-before", ["walk", "point", "flinch", "charge"], "point", 286),
               ("AS2b-rival-after", ["hulk", "flick", "win"], "hulk", 356),
               # her arm at four heights, for swinging Stephanie by: down and out, level, up and out, straight up
               ("AS5-rival-arms", ["arm0", "arm1", "arm2", "arm3"], "arm1", 356)]
# Poses in which she has an arm out with something in the hand: the game needs to know
# where that hand is. It is the leftmost point of her, or for an arm straight up, the topmost.
FIGHT_HANDS = {"flick": "left", "arm0": "left", "arm1": "left", "arm2": "left", "arm3": "top"}


def fight():
    """The fight after school. Stephanie's bodies in her cheer outfit lose their
    heads, as the workout's do, and hers hangs from the chin each leaves; the
    other girl, before and after, keeps her own. Writes src/data/fight.ts: for
    every pose its file, its size, the spot on the floor it stands on and, for
    Stephanie, where her chin goes from there and how far her head is tipped.
    The pose of her in mid-air is held by a foot instead (the one furthest from
    her head), since that is what she is swung by: its spot is that foot, and
    `lie` is the direction from it to her chin. Also the gym itself."""
    cheer, sizes = {}, {}
    for sheet, poses in FIGHT_CHEER:
        cut = load(f"{sheet}-cutout.png")
        head = (selection(f"{sheet}-headmask.png") > 0.5).astype(np.uint8)
        grown = cv2.GaussianBlur(cv2.dilate(head, np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 0.8)
        body = cut.copy()
        body[..., 3] *= 1 - np.clip(grown * 1.5, 0, 1)
        n, hl, hs, hc = cv2.connectedComponentsWithStats(head, 8)
        big = max(hs[i][4] for i in range(1, n))
        heads = sorted((i for i in range(1, n) if hs[i][4] > big * 0.4), key=lambda i: hs[i][0])
        n, lab, bs, bc = cv2.connectedComponentsWithStats((body[..., 3] > 0.3).astype(np.uint8), 8)
        big = max(bs[i][4] for i in range(1, n))
        bodies = sorted((i for i in range(1, n) if bs[i][4] > big * 0.5), key=lambda i: bs[i][0])
        assert len(heads) == len(bodies) == len(poses), f"{sheet}: {len(heads)} heads, {len(bodies)} bodies"
        sizes[sheet] = float(np.median([np.sqrt(hs[i][4]) for i in heads]))
        for pose, h, b in zip(poses, heads, bodies):
            # her chin: the point of her head nearest the middle of the rest of her
            hy, hx = np.where(hl == h)
            mid = bc[b]
            k = int(np.argmin((hx - mid[0]) ** 2 + (hy - mid[1]) ** 2))
            chin = (float(hx[k]), float(hy[k]))
            tip = float(np.arctan2(-(chin[0] - hc[h][0]), chin[1] - hc[h][1]))
            near = cv2.dilate((lab == b).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
            piece = body.copy()
            piece[~near] = 0
            ys, xs = np.where(piece[..., 3] > 0.08)
            x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
            save(f"cheer-{pose}.png", piece[y0:y1, x0:x1])
            spot = ((x0 + x1) / 2, float(ys.max()))
            entry = dict(sheet=sheet, tilt=tip if abs(tip) > 0.5 else 0.0)
            if pose == "fly":
                k = int(np.argmax((xs - chin[0]) ** 2 + (ys - chin[1]) ** 2))
                spot = (float(xs[k]), float(ys[k]))
                entry["lie"] = float(np.arctan2(chin[1] - spot[1], chin[0] - spot[0]))
            entry.update(at=((spot[0] - x0) / (x1 - x0), (spot[1] - y0) / (y1 - y0)), chin=(chin[0] - spot[0], chin[1] - spot[1]))
            cheer[pose] = entry
    # she is drawn to the size that puts her chin where the game expects it when she stands up
    # straight (pleading); the other sheet is matched to that by the size of the heads on it
    straight = STANDING_CHIN / -cheer["plead"]["chin"][1]
    for entry in cheer.values():
        entry["scale"] = straight * sizes[cheer["plead"]["sheet"]] / sizes[entry["sheet"]]

    rival = {}
    for sheet, poses, measure, tall in FIGHT_RIVAL:
        if not os.path.exists(os.path.join(SRC, f"{sheet}-cutout.png")):
            continue                    # not made yet
        cut = load(f"{sheet}-cutout.png")
        found = sorted(pieces(cut, 8000), key=lambda p: p[0])
        assert len(found) == len(poses), f"{sheet}: {len(found)} figures"
        scale = tall / found[poses.index(measure)][2].shape[0]
        for pose, (_, _, piece) in zip(poses, found):
            save(f"rival-{pose}.png", piece)
            ys, xs = np.where(piece[..., 3] > 0.08)
            # she stands on the middle of her feet: the bottom tenth of her
            feet = xs[ys > ys.max() - piece.shape[0] * 0.1]
            spot = (float(feet.min() + feet.max()) / 2, float(ys.max()))
            rival[pose] = dict(scale=scale, at=(spot[0] / piece.shape[1], spot[1] / piece.shape[0]))
            # her face, for anything she says to come from: the middle of what there is of her
            # above her feet in the rows where a face would be (below her hair, above her shoulders)
            tall_px = piece.shape[0]
            over = np.abs(xs - spot[0]) < tall_px * 0.16
            top = ys[over].min()
            rows = over & (ys > top + tall_px * (0.085 if sheet != "AS2a-rival-before" else 0.045)) & (ys < top + tall_px * (0.20 if sheet != "AS2a-rival-before" else 0.15))
            rival[pose]["face"] = ((float(xs[rows].mean()) - spot[0]) * scale, (float(ys[rows].mean()) - spot[1]) * scale)
            if pose in FIGHT_HANDS:
                # the end of her arm: the last few pixels of her that way, and the middle of those
                if FIGHT_HANDS[pose] == "left":
                    end = xs < xs.min() + 8
                else:
                    end = ys < ys.min() + 8
                rival[pose]["hand"] = ((float(xs[end].mean()) - spot[0]) * scale, (float(ys[end].mean()) - spot[1]) * scale)

    table = os.path.join(ROOT, "src", "data", "fight.ts")
    with open(table, "w") as f:
        f.write("/** The photo bodies for the fight after school. For each pose: the picture, how\n"
                " *  big it is drawn (game pixels to one of the picture's) and the spot on the\n"
                " *  floor it stands on (as a fraction of the picture). Stephanie's also say where\n"
                " *  her chin goes from that spot (in game pixels) and how far her head tips; in\n"
                " *  mid-air she is held by a foot, and `lie` is the direction from it to her chin.\n"
                " *  The other girl's say where her face is from her spot (for what she says to come\n"
                " *  from) and, where she has an arm out, `hand` is where that hand is.\n"
                " *  Written by tools/make_cutouts.py; do not edit by hand. */\n"
                "export interface FightBody { file: string; scale: number; spot: [number, number]; chin?: [number, number]; tilt?: number; lie?: number; face?: [number, number]; hand?: [number, number] }\n\n"
                "export const FIGHT_BODIES: Record<string, Record<string, FightBody>> = {\n  cheer: {\n")
        for pose, e in cheer.items():
            lie = f", lie: {e['lie']:.3f}" if "lie" in e else ""
            f.write(f"    {pose}: {{ file: 'cheer-{pose}.png', scale: {e['scale']:.4f}, spot: [{e['at'][0]:.3f}, {e['at'][1]:.3f}],"
                    f" chin: [{e['chin'][0] * e['scale']:.1f}, {e['chin'][1] * e['scale']:.1f}], tilt: {e['tilt']:.2f}{lie} }},\n")
        f.write("  },\n  rival: {\n")
        for pose, e in rival.items():
            hand = f", hand: [{e['hand'][0]:.1f}, {e['hand'][1]:.1f}]" if "hand" in e else ""
            face = f", face: [{e['face'][0]:.1f}, {e['face'][1]:.1f}]"
            f.write(f"    {pose}: {{ file: 'rival-{pose}.png', scale: {e['scale']:.4f}, spot: [{e['at'][0]:.3f}, {e['at'][1]:.3f}]{face}{hand} }},\n")
        f.write("  },\n};\n")
    print("wrote", table)

    # The things that get broken. The table and the hoop come out of one cutout; the bleachers
    # were not taken for a subject, so they have a selection of their own (less their handrails,
    # which are too thin to select cleanly: opening the selection takes them off).
    table, hoop = (p[2] for p in sorted(pieces(load("AS4-gym-things-cutout.png"), 3000), key=lambda p: p[0]))
    save("gym-table.png", table)
    save("gym-hoop.png", hoop)
    block = cv2.morphologyEx((selection("AS4-gym-things-bleachers.png") > 0.5).astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(block, 8)
    block = (lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.float32)
    bleachers = np.dstack([original("AS4-gym-things.webp"), cv2.GaussianBlur(block, (0, 0), 0.8)])
    save("gym-bleachers.png", trim(bleachers))

    # the gym: beside its own mirror image to be wide enough for any screen, with more floor
    # added at the bottom the same way
    gym = original("AS3-gym.webp")
    gym = np.concatenate([gym, gym[:, ::-1]], axis=1)
    gym = np.concatenate([gym, gym[:-70:-1]], axis=0)
    path = os.path.join(OUT, "gym.jpg")
    Image.fromarray((np.clip(gym, 0, 1) * 255).astype(np.uint8), "RGB").save(path, quality=80)
    print("gym.jpg", gym.shape[1], "x", gym.shape[0], os.path.getsize(path), "bytes")


# The day Chad had had enough. Whose faces there are photos of, and what each photo is
# of: the photo's number (art-src/photos/<who>-<number>.jpg) and the look on his face.
BAT_FACES = [("chad", [("1", "scowl"), ("2", "smile"), ("3", "grin"), ("4", "laugh")]),
             ("shane", [("1", "grin"), ("2", "scared"), ("3", "cry"), ("4", "smile")])]


def bat_faces():
    """The brothers' heads, for the bodies of two five-year-olds: each is one of
    the family's photos of him, as he is now, cut to hair, face and ears by
    Adobe's body-part selection (art-src/adobe/PB-<who>-<number>-headmask.png)
    laid over its cutout of him (...-cutout.png).
    Each is saved with his head HEAD pixels tall from the top of his hair to
    his chin. Writes src/data/bat.ts: for every face its file, how tall its
    picture is in heads, and where the chin is in it. A photo with no selection
    yet is left out, and the game keeps its paper face for that look."""
    HEAD = 230
    made = {}
    for who, shots in BAT_FACES:
        for number, look in shots:
            mask = f"PB-{who}-{number}-headmask.png"
            photo = os.path.join(ROOT, "art-src", "photos", f"{who}-{number}.jpg")
            if not (os.path.exists(os.path.join(SRC, mask)) and os.path.exists(photo)):
                continue
            # Adobe's cutout of him where there is one (it knows his hair from a dark doorway
            # behind it better than the selection of his hair does), and of that only the
            # one piece that is his head: not a lamp the same colour somewhere behind him
            cutout = f"PB-{who}-{number}-cutout.png"
            if os.path.exists(os.path.join(SRC, cutout)):
                rgba = load(cutout)
            else:
                rgb = np.asarray(Image.open(photo).convert("RGB"), dtype=np.float32) / 255.0
                rgba = np.dstack([rgb, np.ones(rgb.shape[:2], np.float32)])
            head = head_only(rgba, mask)
            n, lab, st, _ = cv2.connectedComponentsWithStats((head[..., 3] > 0.5).astype(np.uint8), 8)
            keep = cv2.dilate((lab == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))).astype(np.uint8), np.ones((5, 5), np.uint8))
            head[..., 3] *= keep
            ys, xs = np.where(head[..., 3] > 0.5)
            # his chin: the middle of the lowest of him
            low = ys > ys.max() - (ys.max() - ys.min()) * 0.04
            chin = (float(xs[low].mean()), float(ys.max()))
            k = HEAD / (chin[1] - ys.min())
            ys, xs = np.where(head[..., 3] > 0.08)
            x0, x1 = max(0, xs.min() - 2), min(head.shape[1], xs.max() + 3)
            y0, y1 = max(0, ys.min() - 2), min(head.shape[0], ys.max() + 3)
            piece = head[y0:y1, x0:x1]
            interpolation = cv2.INTER_AREA if k < 1 else cv2.INTER_CUBIC
            out = cv2.resize(piece, (round(piece.shape[1] * k), round(piece.shape[0] * k)), interpolation=interpolation)
            save(f"{who}face-{look}.png", out)
            made.setdefault(who, {})[look] = (out.shape[0] / HEAD, (chin[0] - x0) / (x1 - x0), (chin[1] - y0) / (y1 - y0))
    table = os.path.join(ROOT, "src", "data", "bat.ts")
    with open(table, "w") as f:
        f.write("/** The brothers' photo faces for the day Chad had had enough. For each look: the\n"
                " *  picture, how tall it is in heads (a head being hair to chin), and where the\n"
                " *  chin is in it (as a fraction of the picture): each is hung from its chin.\n"
                " *  Written by tools/make_cutouts.py; do not edit by hand. */\n"
                "export interface BatFace { file: string; tall: number; chin: [number, number] }\n\n"
                "export const BAT_FACES: Record<string, Record<string, BatFace>> = {\n")
        for who, looks in made.items():
            f.write(f"  {who}: {{\n")
            for look, (tall, cx, cy) in looks.items():
                f.write(f"    {look}: {{ file: '{who}face-{look}.png', tall: {tall:.3f}, chin: [{cx:.3f}, {cy:.3f}] }},\n")
            f.write("  },\n")
        f.write("};\n")
    print("wrote", table)


def mailman():
    """The mailman, cheerful and furious. Prints where his feet are, so both
    photos can stand on the same spot."""
    sheet = sorted(pieces(load("V-mailman-cutout.png"), 5000), key=lambda p: p[0])
    for name, (_, _, piece) in zip(("mailman", "mailman-mad"), sheet):
        save(f"{name}.png", piece)
        feet = np.where(piece[int(piece.shape[0] * 0.93):, :, 3].max(axis=0) > 0.5)[0]
        print(f"  {name}: feet centre x (fraction) {(feet.min() + feet.max()) / 2 / piece.shape[1]:.3f}")


def tree():
    """The street tree with a birdhouse sitting in its fork. The tree (birdhouse
    and all) is the backdrop; the birdhouse is also saved on its own, to be
    drawn again in front of Bill. Prints where the trunk meets the ground, and
    where the birdhouse sits relative to that, as fractions of the tree's height."""
    cut = load("Z-tree-birdhouse-cutout.png").copy()
    n, lab, st, _ = cv2.connectedComponentsWithStats((cut[..., 3] > 0.3).astype(np.uint8), 8)
    biggest = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    near = cv2.dilate((lab == biggest).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    cut[~near] = 0   # loose leaves floating clear of the crown

    m = load("Z-tree-birdhouse-mask.png")
    sel = (m[..., 3] if m[..., 3].std() > 0.01 else m[..., :3].mean(axis=2)) > 0.5
    bird = cut.copy()
    bird[..., 3] = np.minimum(bird[..., 3], cv2.GaussianBlur(sel.astype(np.float32), (0, 0), 0.8))
    bys, bxs = np.where(sel)
    save("birdhouse.png", bird[bys.min() - 2:bys.max() + 3, bxs.min() - 2:bxs.max() + 3])

    ys, xs = np.where(cut[..., 3] > 0.08)
    x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
    solid = cut[..., 3] > 0.5
    base_y = np.where(solid.any(axis=1))[0].max() + 1
    base = np.where(solid[base_y - 24:base_y - 8].any(axis=0))[0]
    base_x = (base.min() + base.max()) / 2
    height = y1 - y0
    print(f"  tree: trunk base at ({(base_x - x0) / (x1 - x0):.3f}, {(base_y - y0) / height:.3f});"
          f" birdhouse sits {((bxs.min() + bxs.max()) / 2 - base_x) / height:+.4f} across and"
          f" {(base_y - bys.max() - 1) / height:.4f} up (of the tree's height),"
          f" {(bxs.max() - bxs.min() + 1) / height:.4f} wide")
    piece = cut[y0:y1, x0:x1]
    k = 620 / piece.shape[0]
    save("tree.png", cv2.resize(piece, (round(piece.shape[1] * k), 620), interpolation=cv2.INTER_AREA))


def fence():
    """Crop the picket fence from the middle of one gap to the middle of
    another, so it repeats without a seam."""
    cut = load("Y-fence-cutout.png")
    ys = np.where(cut[..., 3].max(axis=1) > 0.3)[0]
    band = cut[ys.min():ys.max() + 1]
    # between the two rails there is nothing but pickets and the gaps between them
    gap = (band[int(band.shape[0] * 0.42):int(band.shape[0] * 0.58), :, 3].max(axis=0) < 0.2).astype(np.int8)
    edges = np.diff(gap)
    starts, ends = np.where(edges == 1)[0] + 1, np.where(edges == -1)[0] + 1
    centres = [(a + ends[ends > a][0]) / 2 for a in starts if (ends > a).any()]
    x0, x1 = int(round(centres[0])), int(round(centres[-1]))
    print(f"  fence: {len(centres) - 1} pickets, spacing {(x1 - x0) / (len(centres) - 1):.1f}px, crop {x0}..{x1}")
    save("fence.png", band[:, x0:x1])


def houses():
    """The far side of the street: sky, houses and front lawns from the photo,
    cut off where its own pavement starts and mirrored so it repeats."""
    im = Image.open(os.path.join(ROOT, "art-src", "generated", "X-houses.png")).convert("RGB")
    strip = im.crop((0, 45, im.width, 316))
    both = Image.new("RGB", (strip.width * 2, strip.height))
    both.paste(strip, (0, 0))
    both.paste(strip.transpose(Image.FLIP_LEFT_RIGHT), (strip.width, 0))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "houses.jpg")
    both.save(path, quality=90)
    print("houses.jpg", both.size, os.path.getsize(path), "bytes")


def concrete():
    """Pavement: the same public-domain tarmac photo, bleached to pale concrete,
    with an expansion joint every slab."""
    im = Image.open(os.path.join(ROOT, "art-src", "library", "asphalt031.png")).convert("RGB").resize((384, 384), Image.LANCZOS)
    rgb = np.asarray(im, dtype=np.float32)[:192] / 255.0
    rgb = np.clip(((rgb - rgb.mean()) * 0.6 + 0.83) * np.array([1.0, 0.985, 0.94]), 0, 1)
    for x in (0, 192):
        rgb[:, x:x + 2] *= 0.72
        rgb[:, x + 2:x + 3] *= 1.05
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "concrete.jpg")
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB").save(path, quality=88)
    print("concrete.jpg", (rgb.shape[1], rgb.shape[0]), os.path.getsize(path), "bytes")


def mailboxes():
    """Mailboxes on posts: silver and red, each waiting and with a paper
    delivered. The posts in the photo are short, so the bottom of each is
    stretched (along the grain) to stand the box at throwing height. Prints
    where each post meets the ground, and how high the box sits above it."""
    sheet = sorted(pieces(load("U-mailboxes-strip-cutout.png"), 3000), key=lambda p: p[0])
    for name, (_, _, piece) in zip(("silver", "silver-hit", "red", "red-hit"), sheet):
        post = cv2.resize(piece[-38:], (piece.shape[1], 110), interpolation=cv2.INTER_LINEAR)
        tall = np.concatenate([piece[:-38], post], axis=0)
        save(f"mailbox-{name}.png", tall)
        solid = tall[..., 3] > 0.5
        base_y = np.where(solid.any(axis=1))[0].max() + 1
        base = np.where(solid[base_y - 12:base_y].any(axis=0))[0]
        line = f"  mailbox-{name}: post base at ({(base.min() + base.max()) / 2 / tall.shape[1]:.3f}, {base_y / tall.shape[0]:.3f})"
        if not name.endswith("hit"):
            box = np.where(solid.sum(axis=1) > 100)[0]
            line += f", box centre {base_y - (box.min() + box.max()) / 2:.0f}px above it, box {solid.sum(axis=1).max()}px wide"
        print(line)


def asphalt():
    """Road surface from a public-domain photo texture (see art-src/library).
    It already tiles; shrink it and cool it down to sit behind the cutouts."""
    im = Image.open(os.path.join(ROOT, "art-src", "library", "asphalt031.png")).convert("RGB").resize((384, 384), Image.LANCZOS)
    rgb = np.asarray(im, dtype=np.float32) / 255.0
    rgb = (rgb - 0.5) * 0.9 + 0.5
    rgb = np.clip(rgb * np.array([0.80, 0.79, 0.84]), 0, 1)
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "asphalt.jpg")
    Image.fromarray((rgb * 255).astype(np.uint8), "RGB").save(path, quality=88)
    print("asphalt.jpg", im.size, os.path.getsize(path), "bytes")


def guardrail():
    """Crop the rail to a whole number of post spacings so it repeats cleanly."""
    rail = load("L-guardrail-cutout.png")
    ys = np.where(rail[..., 3].max(axis=1) > 0.3)[0]
    band = rail[ys.min():ys.max() + 1]
    posts = band[int(band.shape[0] * 0.75):, :, 3].max(axis=0) > 0.5
    n, lab, stats, cent = cv2.connectedComponentsWithStats(posts[None, :].astype(np.uint8), 8)
    xs = sorted(cent[i][0] for i in range(1, n) if stats[i][4] >= 4)
    period = (xs[-1] - xs[0]) / (len(xs) - 1)
    x0 = max(0, int(round(xs[0] - period / 2)))
    x1 = min(band.shape[1], int(round(xs[0] - period / 2 + period * len(xs))))
    print(f"  guardrail: {len(xs)} posts, spacing {period:.1f}px, crop {x0}..{x1}")
    save("rail.png", band[:, x0:x1])


def effects():
    sheet = sorted(pieces(load("M-effects-cutout.png")), key=lambda p: p[0])
    for name, (_, _, piece) in zip(("star", "puff", "burst"), sheet):
        save(f"{name}.png", piece)
    words = sorted(pieces(load("N-words-cutout.png"), 3000), key=lambda p: (p[1] > 200, p[0]))
    for name, (_, _, piece) in zip(("bonk", "whack", "thwack", "pow", "bop", "perfect"), words):
        save(f"word-{name}.png", piece)


def phone_arm():
    """A hand holding a phone up to film. Only the hand and wrist are kept: in
    the game the wrist tucks behind the gawker's head, so the phone is held out
    in front of their face."""
    sheet = load("O-phone-arm-cutout.png")
    full = trim(sheet)
    hand = trim(full[:, :290])
    save("hand-phone.png", hand)
    rows = np.where(hand[:, -8:, 3].max(axis=1) > 0.5)[0]
    print("  hand-phone wrist centre y (fraction):", round((rows.min() + rows.max()) / 2 / hand.shape[0], 3))
    # the phone on its own, for when it gets knocked flying: the half above the
    # fingers, mirrored to make a whole phone
    top = sheet[112:230, 236:300]
    save("phone.png", trim(np.concatenate([top, top[::-1]], axis=0)))


def birds():
    """Two frames of a bluebird in flight (wings up, wings down), facing left.
    Prints where the orange chest is in each, so both frames can be pinned at
    the same point and only the wings appear to move."""
    sheet = sorted(pieces(load("P-bluebirds-cutout.png"), 2000), key=lambda p: p[0])
    for name, (_, _, piece) in zip(("up", "down"), sheet):
        save(f"bird-{name}.png", piece)
        h = hsv(piece)
        chest = (h[..., 0] > 8) & (h[..., 0] < 38) & (h[..., 1] > 0.35) & (piece[..., 3] > 0.9)
        ys, xs = np.where(chest)
        print(f"  bird-{name}: chest at ({xs.mean() / piece.shape[1]:.3f}, {ys.mean() / piece.shape[0]:.3f})")


def papers():
    """Sheets of coloured paper for the interface, lettering and road paint.
    The grain is real: it is lifted from the blank billboard face and the yellow
    paper burst, flattened, mirrored so it tiles, and then dyed."""
    def grain_of(name, x0, y0, x1, y1):
        im = np.asarray(Image.open(os.path.join(OUT, name)).convert("RGB"), dtype=np.float32) / 255.0
        luma = im[y0:y1, x0:x1].mean(axis=2)
        flat = luma - cv2.GaussianBlur(luma, (0, 0), 9)      # drop lighting, keep fibres
        top = np.concatenate([flat, flat[:, ::-1]], axis=1)
        return np.concatenate([top, top[::-1]], axis=0)

    smooth = grain_of("billboard.png", 22, 14, 84, 54)
    rough = grain_of("burst.png", 84, 66, 172, 152)
    sheets = {
        "cream": ((0.975, 0.955, 0.895), smooth, 1.6),
        "white": ((0.985, 0.98, 0.955), smooth, 1.3),
        "manila": ((0.90, 0.78, 0.55), smooth, 1.8),
        "yellow": ((0.965, 0.77, 0.19), rough, 1.5),
        "red": ((0.80, 0.19, 0.16), rough, 1.5),
        "blue": ((0.17, 0.36, 0.68), rough, 1.5),
        "green": ((0.33, 0.62, 0.30), rough, 1.5),
        "grey": ((0.42, 0.40, 0.43), rough, 1.5),
        "brown": ((0.50, 0.34, 0.20), rough, 1.6),
        "sky": ((0.62, 0.79, 0.90), smooth, 1.4),
        "black": ((0.14, 0.12, 0.13), rough, 2.2),
    }
    os.makedirs(OUT, exist_ok=True)
    for name, (colour, grain, strength) in sheets.items():
        rgb = np.clip(np.array(colour)[None, None, :] * (1 + grain[..., None] * strength), 0, 1)
        path = os.path.join(OUT, f"paper-{name}.png")
        size = save_webp(Image.fromarray((rgb * 255).astype(np.uint8), "RGB"), path)
        print(f"paper-{name}.png", rgb.shape[1], "x", rgb.shape[0], size, "bytes")


def ellipse_crop(rgba, cx, cy, rx, ry, feather=3.0):
    yy, xx = np.mgrid[0:rgba.shape[0], 0:rgba.shape[1]].astype(np.float32)
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    keep = np.clip((1 - d) * min(rx, ry) / feather, 0, 1)
    out = rgba.copy()
    out[..., 3] *= keep
    return out


def dogs():
    sheet = load("E-dog-cutout.png")
    # keep the head and a little neck; the sheet shows each dog down to the chest
    save("dog.png", trim(ellipse_crop(sheet, 290, 250, 232, 160)))
    save("dog-mad.png", trim(ellipse_crop(sheet, 757, 243, 188, 160)))


def props():
    sheet = sorted(pieces(load("G-props-cutout.png")), key=lambda p: p[0])
    for name, (_, _, piece) in zip(("palm", "billboard", "sign", "cone"), sheet):
        save(f"{name}.png", piece)


def string_face(rgba, extra=None):
    """The strung face of the racquet in a pose photo, as an ellipse:
    ((cx, cy), (width, height), angle), the way OpenCV fits them."""
    h8 = cv2.cvtColor((rgba[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2HSV)
    face = (h8[..., 1] < 45) & (h8[..., 2] > 150) & (rgba[..., 3] > 0.9)
    face[:, :600] = False
    if extra is not None:
        face |= extra
    face = cv2.morphologyEx(face.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    contours, _ = cv2.findContours(face, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    return cv2.fitEllipse(max(contours, key=cv2.contourArea))


def no_ball(rgba, clean):
    """The hitting frame came with a tennis ball on the strings. Lay the clean
    strings from the ready frame (`clean`, the same racquet) over the face:
    turned, squeezed and moved to fit this frame's hoop."""
    h, w = rgba.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    ball = (((xx - 681) / 28.0) ** 2 + ((yy - 97) / 23.0) ** 2) <= 1
    (cx, cy), (dw, dh), ang = string_face(rgba, ball)
    (sx, sy), (sw, sh), sang = string_face(clean)

    def frame(c, size, angle):
        """Ellipse to unit circle: a 3x3 matrix taking a point on the photo to
        coordinates in which the ellipse is the circle of radius 1."""
        t = np.deg2rad(angle)
        rot = np.array([[np.cos(t), np.sin(t), 0], [-np.sin(t), np.cos(t), 0], [0, 0, 1]])
        move = np.array([[1, 0, -c[0]], [0, 1, -c[1]], [0, 0, 1]], np.float64)
        return np.diag([2 / size[0], 2 / size[1], 1]) @ rot @ move

    # ready-frame pixel -> unit circle -> hitting-frame pixel
    m = np.linalg.inv(frame((cx, cy), (dw, dh), ang)) @ frame((sx, sy), (sw, sh), sang)
    laid = cv2.warpAffine(clean[..., :3], m[:2].astype(np.float32), (w, h), flags=cv2.INTER_LINEAR)
    inside = np.zeros((h, w), np.uint8)
    cv2.ellipse(inside, ((cx, cy), (dw - 5, dh - 5), ang), 1, -1)
    soft = cv2.GaussianBlur(inside.astype(np.float32), (0, 0), 1.2)[..., None]
    out = rgba.copy()
    out[..., :3] = rgba[..., :3] * (1 - soft) + laid * soft
    print(f"  ball painted out: strings laid over a {dw:.0f} x {dh:.0f} face from the ready frame's {sw:.0f} x {sh:.0f}")
    return out


def teen():
    """Bill from behind, for the school hallway: three stop-motion frames
    (ready, winding up, hitting) with the bully's tennis racquet. The three
    photos are edits of one another, so the body sits at the same pixels in
    each, and every frame is pinned at the same point: the middle of the top
    of his collar. The boy loses his head and neck; the game puts the back of
    Bill's head there (and his face, when he turns round). Prints the pin as
    a fraction of each saved frame, and where the middle of the racquet face
    is in the hitting frame, in source pixels from the pin."""
    cols = np.arange(446, 576)
    pin = None
    ready = load("SJ2a-teen-ready-cutout.png")
    for name, src in (("rest", "SJ2a-teen-ready"), ("windup", "SJ2b-teen-windup"), ("swing", "SJ2c-teen-hit")):
        cut = load(f"{src}-cutout.png")
        if name == "swing":
            cut = no_ball(cut, ready)
        h8 = cv2.cvtColor((cut[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
        shirt = (h8[..., 0] >= 14.5) & (h8[..., 0] < 30) & (h8[..., 1] > 120) & (h8[..., 2] > 120) & (cut[..., 3] > 0.5)
        if pin is None:
            # the collar: in each column under his head, the top of the run of
            # shirt that reaches up from between his shoulder blades
            tops = []
            for x in cols:
                y = 215
                while y > 0 and shirt[y - 1, x]:
                    y -= 1
                tops.append(y)
            tops = np.clip(cv2.medianBlur(np.array(tops, np.float32).reshape(1, -1), 5).ravel(), 181, 210)
            tops = cv2.GaussianBlur(tops.reshape(1, -1), (0, 0), 2.0).ravel()
            flat = cols[tops <= tops.min() + 4]
            pin = ((flat.min() + flat.max()) / 2, float(np.median(tops[(cols > flat.min()) & (cols < flat.max())])))

            def shoulder(x):
                """The top edge of his shoulder in a column clear of his head."""
                y = 215
                while y > 0 and cut[y - 1, x, 3] > 0.3:
                    y -= 1
                return y

            # the cut: level along the top of the collar, then straight down
            # each shoulder to where his own outline takes over
            line = np.interp(cols, [cols[0], flat.min(), flat.max(), cols[-1]],
                             [shoulder(cols[0]), pin[1], pin[1], shoulder(cols[-1])])
        keep = np.ones(cut.shape[:2], np.float32)
        for x, y in zip(cols, line):
            keep[: int(round(y)), x] = 0
        keep = cv2.GaussianBlur(keep, (0, 0), 0.8)
        body = cut.copy()
        body[..., 3] *= np.clip(keep * 2 - 1, 0, 1)
        # drop any specks left where the head was
        n, lab, st, _ = cv2.connectedComponentsWithStats((body[..., 3] > 0.3).astype(np.uint8), 8)
        biggest = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        near = cv2.dilate((lab == biggest).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        body[~near] = 0
        ys, xs = np.where(body[..., 3] > 0.08)
        # nothing lower than this is ever on screen
        x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, min(ys.max() + 3, int(pin[1]) + 270)
        save(f"teen-{name}.png", body[y0:y1, x0:x1])
        face = (h8[..., 1] < 45) & (h8[..., 2] > 150) & (body[..., 3] > 0.9)
        face[:, :600] = False
        fy, fx = np.where(cv2.erode(face.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0)
        print(f"  teen-{name}: pin ({(pin[0] - x0) / (x1 - x0):.3f}, {(pin[1] - y0) / (y1 - y0):.3f}),"
              f" racquet face {fx.mean() - pin[0]:+.0f}, {fy.mean() - pin[1]:+.0f} px from it")


def hallway():
    """The school hallway: the whole backdrop of the bonus level is this one
    photo, enlarged a little and sharpened so it holds up across the screen."""
    from PIL import ImageFilter
    im = Image.open(os.path.join(ROOT, "art-src", "generated", "SJ1-hallway.jpg")).convert("RGB")
    big = im.resize((round(im.width * 1.6), round(im.height * 1.6)), Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "hallway.jpg")
    big.save(path, quality=86)
    print("hallway.jpg", big.size, os.path.getsize(path), "bytes")


def locker_things():
    """What comes flying out of the bully's locker: the jar of peanut butter,
    the chocolate milkshake and his history book. The source photo had each
    on a panel of its own; the three panels were stitched into one plain
    strip (SJ4-objects-strip.png) so the background would come away cleanly."""
    sheet = sorted(pieces(load("SJ4-objects-strip-cutout.png"), 3000), key=lambda p: p[0])
    for name, (_, _, piece) in zip(("jar", "shake", "book"), sheet):
        save(f"{name}.png", piece)


def splats():
    """Four splats of chocolate milkshake, photographed on pale blue. Brown on
    blue keys out by colour alone, which keeps every fleck: the background is
    whatever the picture is where nothing is brown, and a pixel is as solid as
    it is far from that. Each splat keeps the flecks nearest to it. Saved
    dark, light, dark, light; and one fleck on its own, for the bits that go
    through the racquet strings."""
    im = np.asarray(Image.open(os.path.join(ROOT, "art-src", "generated", "SJ5-splats.jpg")).convert("RGB"), dtype=np.float32)
    brown = ((im[..., 0] - im[..., 2]) > 14).astype(np.uint8)
    clear = 1.0 - cv2.dilate(brown, np.ones((15, 15), np.uint8)).astype(np.float32)
    # the backdrop behind the splats: a blurred picture of everywhere that is clear of them
    back = cv2.GaussianBlur(im * clear[..., None], (0, 0), 40) / np.maximum(cv2.GaussianBlur(clear, (0, 0), 40), 1e-3)[..., None]
    far = np.sqrt(((im - back) ** 2).sum(axis=2))
    alpha = np.clip((far - 14) / 34, 0, 1)
    # glints on the wet surface are as pale as the backdrop: fill them back in
    contours, _ = cv2.findContours((alpha > 0.5).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros(alpha.shape, np.uint8)
    cv2.drawContours(filled, contours, -1, 1, thickness=cv2.FILLED)
    alpha = np.maximum(alpha, cv2.erode(filled, np.ones((3, 3), np.uint8)).astype(np.float32))
    # take the blue back out of the soft edges
    a3 = np.maximum(alpha, 0.05)[..., None]
    rgb = np.clip((im - back * (1 - a3)) / a3, 0, 255)
    rgba = np.dstack([rgb / 255.0, alpha]).astype(np.float32)

    n, lab, st, cen = cv2.connectedComponentsWithStats((alpha > 0.4).astype(np.uint8), 8)
    order = sorted(range(1, n), key=lambda i: -st[i][cv2.CC_STAT_AREA])
    mains = sorted(order[:4], key=lambda i: cen[i][0])
    owner = {}
    for i in order[4:]:
        if st[i][cv2.CC_STAT_AREA] < 8:
            continue
        owner[i] = min(mains, key=lambda m: np.hypot(*(cen[i] - cen[m])))
    for slot, m in zip((1, 0, 3, 2), mains):
        mine = np.isin(lab, [m] + [i for i, o in owner.items() if o == m])
        near = cv2.dilate(mine.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
        piece = rgba.copy()
        piece[~near] = 0
        ys, xs = np.where(piece[..., 3] > 0.08)
        x0, x1, y0, y1 = xs.min() - 2, xs.max() + 3, ys.min() - 2, ys.max() + 3
        save(f"splat{slot}.png", piece[y0:y1, x0:x1])
        print(f"  splat{slot}: middle of the blob ({(cen[m][0] - x0) / (x1 - x0):.3f}, {(cen[m][1] - y0) / (y1 - y0):.3f})")
    # a fleck: the biggest one thrown clear of the second (dark) splat
    fleck = max((i for i, o in owner.items() if o == mains[1]), key=lambda i: st[i][cv2.CC_STAT_AREA])
    near = cv2.dilate((lab == fleck).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    piece = rgba.copy()
    piece[~near] = 0
    save("blob.png", trim(piece))


def postcard():
    """The far background: the top of the postcard, mirrored so it repeats without a seam."""
    im = Image.open(os.path.join(ROOT, "art-src", "generated", "F-postcard.png")).convert("RGB")
    strip = im.crop((0, 0, im.width, 352))
    both = Image.new("RGB", (strip.width * 2, strip.height))
    both.paste(strip, (0, 0))
    both.paste(strip.transpose(Image.FLIP_LEFT_RIGHT), (strip.width, 0))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, "postcard.jpg")
    both.save(path, quality=90)
    print("postcard.jpg", both.size, os.path.getsize(path), "bytes")


if __name__ == "__main__":
    bug()
    vehicles()
    cars()
    heads()
    more_heads()
    bill()
    kid()
    mom()
    bill_faces()
    workout_bodies()
    workout_set()
    fight()
    bat_faces()
    teen()
    hallway()
    locker_things()
    splats()
    mailman()
    mailboxes()
    tree()
    fence()
    houses()
    concrete()
    guardrail()
    effects()
    phone_arm()
    birds()
    papers()
    asphalt()
    dogs()
    props()
    postcard()
