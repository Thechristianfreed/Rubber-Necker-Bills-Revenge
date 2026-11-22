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
        if name == "sign":
            # shorten the post so the sign face sits at the height of Bill's head
            piece = piece[: int(piece.shape[0] * 0.72)]
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
    dogs()
    props()
    postcard()
