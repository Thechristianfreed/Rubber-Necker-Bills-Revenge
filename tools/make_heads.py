"""Build Bill's photo-head sprites from Adobe outputs.

Inputs (art-src/adobe): bill-N-cutout.png  (background removed, RGBA)
                        bill-N-headmask.png (hair + face + beard + ears selection)
Output (src/assets/bill): one "sticker" PNG per expression - the head only,
with a white cut-paper border and a soft drop shadow. The head itself is
always HEAD_H pixels tall, centred in the image.

Run:  python tools/make_heads.py      (needs pillow, numpy, opencv-python-headless)
"""
import os
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "art-src", "adobe")
OUT = os.path.join(ROOT, "src", "assets", "bill")

# name -> source photo number
HEADS = {"glare": 1, "sideeye": 2, "grin": 3}
HEAD_H = 400          # head height in px before the border is added
BORDER = 12           # white cut-paper border
SHADOW = (9, 13, 7.0, 0.42)   # dx, dy, blur sigma, opacity
PAD = 48              # transparent margin on every side (room for the shadow)


def mask_channel(im):
    """The selection may live in alpha or in luminance; pick whichever varies."""
    a = np.asarray(im.convert("RGBA"), dtype=np.float32) / 255.0
    alpha, lum = a[..., 3], a[..., :3].mean(axis=2)
    return alpha if alpha.std() > 0.01 else lum


def largest_component(binary):
    n, labels, stats, _ = cv2.connectedComponentsWithStats(binary.astype(np.uint8), 8)
    if n <= 1:
        return binary
    keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return labels == keep


def fill_holes(binary):
    contours, _ = cv2.findContours(binary.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    filled = np.zeros(binary.shape, np.uint8)
    cv2.drawContours(filled, contours, -1, 1, thickness=cv2.FILLED)
    return filled.astype(bool)


def build(name, n):
    cut = Image.open(os.path.join(SRC, f"bill-{n}-cutout.png")).convert("RGBA")
    sel = mask_channel(Image.open(os.path.join(SRC, f"bill-{n}-headmask.png")))
    rgba = np.asarray(cut, dtype=np.float32) / 255.0

    solid = largest_component(sel > 0.5)
    solid = fill_holes(solid)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    solid = cv2.morphologyEx(solid.astype(np.uint8), cv2.MORPH_CLOSE, k).astype(bool)
    soft = cv2.GaussianBlur(solid.astype(np.float32), (0, 0), 1.6)
    alpha = np.minimum(rgba[..., 3], soft) * solid_guard(solid)

    ys, xs = np.where(alpha > 0.05)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    head = np.dstack([rgba[y0:y1, x0:x1, :3], alpha[y0:y1, x0:x1]])
    scale = HEAD_H / head.shape[0]
    size = (max(1, round(head.shape[1] * scale)), HEAD_H)
    head = cv2.resize(head, size, interpolation=cv2.INTER_AREA)

    pad = PAD
    canvas = np.zeros((size[1] + pad * 2, size[0] + pad * 2, 4), np.float32)
    canvas[pad:pad + size[1], pad:pad + size[0]] = head
    a = canvas[..., 3]

    kk = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (BORDER * 2 + 1, BORDER * 2 + 1))
    border = cv2.GaussianBlur(cv2.dilate((a > 0.5).astype(np.float32), kk), (0, 0), 0.9)

    dx, dy, sigma, opacity = SHADOW
    shift = np.float32([[1, 0, dx], [0, 1, dy]])
    shadow = cv2.warpAffine(border, shift, (border.shape[1], border.shape[0]))
    shadow = cv2.GaussianBlur(shadow, (0, 0), sigma) * opacity

    white = np.array([1.0, 0.98, 0.94])
    rgb = white * (1 - a[..., None]) + canvas[..., :3] * a[..., None]
    out = np.zeros_like(canvas)
    out[..., :3] = np.array([0.09, 0.06, 0.04]) * (1 - border[..., None]) + rgb * border[..., None]
    out[..., 3] = border + shadow * (1 - border)

    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"head-{name}.png")
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA").save(path, optimize=True)
    print(name, out.shape[1], "x", out.shape[0], os.path.getsize(path), "bytes")


def solid_guard(solid):
    """Slightly grown hard mask so the soft edge cannot leak far past the selection."""
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    return cv2.dilate(solid.astype(np.uint8), k).astype(np.float32)


if __name__ == "__main__":
    for name, n in HEADS.items():
        build(name, n)
