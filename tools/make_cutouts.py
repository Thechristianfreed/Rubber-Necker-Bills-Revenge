"""Turn Adobe background-removed images into game-ready photo cutouts.

Inputs  (art-src/adobe):     <name>-cutout.png   (RGBA, background removed)
Outputs (src/assets/scrap):  one trimmed PNG per game piece

The game adds the white paper border and drop shadow itself, so these are just
the clean cutouts, trimmed to their contents.

Run:  python tools/make_cutouts.py     (needs pillow, numpy, opencv-python-headless)
"""
import os
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "art-src", "adobe")
OUT = os.path.join(ROOT, "src", "assets", "scrap")


def load(name):
    return np.asarray(Image.open(os.path.join(SRC, name)).convert("RGBA"), dtype=np.float32) / 255.0


def save(name, rgba):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    Image.fromarray((np.clip(rgba, 0, 1) * 255).astype(np.uint8), "RGBA").save(path, optimize=True)
    print(name, rgba.shape[1], "x", rgba.shape[0], os.path.getsize(path), "bytes")


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
    sheet = load("O-phone-arm-cutout.png")
    save("arm-phone.png", trim(sheet))
    # the phone on its own, for when it gets knocked flying: the half above the
    # fingers, mirrored to make a whole phone
    top = sheet[112:230, 236:300]
    save("phone.png", trim(np.concatenate([top, top[::-1]], axis=0)))


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
        "black": ((0.14, 0.12, 0.13), rough, 2.2),
    }
    os.makedirs(OUT, exist_ok=True)
    for name, (colour, grain, strength) in sheets.items():
        rgb = np.clip(np.array(colour)[None, None, :] * (1 + grain[..., None] * strength), 0, 1)
        path = os.path.join(OUT, f"paper-{name}.png")
        Image.fromarray((rgb * 255).astype(np.uint8), "RGB").save(path, optimize=True)
        print(f"paper-{name}.png", rgb.shape[1], "x", rgb.shape[0], os.path.getsize(path), "bytes")


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
    guardrail()
    effects()
    phone_arm()
    papers()
    asphalt()
    dogs()
    props()
    postcard()
