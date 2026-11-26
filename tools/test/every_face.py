#!/usr/bin/env python3
"""usage: .venv/bin/python tools/test/every_face.py <out prefix> [who ...]

Every face a person has, on one sheet, for the owner to look at: the fifteen
(with a gap where one is not made yet), and under them the faces that are
only that person's. Each is the finished cutout the game loads, with its
paper border, hung by its chin on one line, and labelled with the name a game
calls it by. A yellow line under a face gives what the first six games call
the same picture, where they use it.

With nobody named, a sheet for everybody in src/data/cast.ts, and one more
with everybody on it: a row for each person, a column for each of the
fifteen, a gap where a look is not made yet, and their own faces at the end.
They are written to <out prefix>-<who>.png and <out prefix>-everybody.png.
(tools/test/faces.cjs shows the same faces in the running game; these are
bigger, and say more about each.)
"""
import os
import re
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCRAP = os.path.join(ROOT, "src", "assets", "scrap")
LOOKS = ["calm", "talking", "smile", "laugh", "smug", "angry", "yell", "shocked", "guilty", "worried", "cry", "ouch", "dazed",
         "disgusted", "asleep"]
# what a person gives for a look they have not got: the same list as NEAREST in src/minis/shared/people.ts
NEAREST = {"calm": ["smug", "smile", "talking"], "talking": ["calm", "smile", "laugh"], "smile": ["laugh", "smug", "calm"],
           "laugh": ["smile", "talking"], "smug": ["smile", "calm"], "angry": ["yell", "disgusted", "calm"],
           "yell": ["angry", "shocked", "talking"], "shocked": ["yell", "worried", "guilty"], "guilty": ["worried", "shocked", "calm"],
           "worried": ["guilty", "cry", "calm"], "cry": ["worried", "ouch", "yell"], "ouch": ["cry", "disgusted", "dazed"],
           "dazed": ["asleep", "calm", "ouch"], "disgusted": ["angry", "ouch"], "asleep": ["dazed", "calm"]}
# What each of a person's own faces is, and what the first six games call the pictures they
# share with the set (docs/characters.md has both, in full).
OWN = {
    "mammy": {"photo": "the real photo her set was made from"},
    "pappy": {"photo": "a real photo: a closed-mouth smile", "silly": "tongue out, in his sunglasses"},
    "nanner": {"photo": "the real photo her set was made from"},
    "shorty": {"pout": "a pout"},
    "curt": {"photo": "a real photo: as he is now, smiling"},
    "sabra": {"photo": "a real photo: smiling, in the restaurant"},
    "christian": {"gentle": "a gentle smile (2021)", "yell2": "another yell (the green T-shirt)", "dazed2": "dazed again (the green T-shirt)",
                  "worried2": "a nervous grin (the green T-shirt)"},
    "bill": {"inhale": "the breath in", "hold": "holding his breath", "sideeye": "side-eye (another photo)", "glare": "glaring down (another photo)"},
    "stephanie": {"inhale": "the breath in", "hold": "holding her breath; her cross face"},
    "chad": {"grin": "grinning: the photo itself", "angel": "smiling (another photo)", "joy": "laughing (another photo)", "scowl": "scowling (another photo)"},
    "shane": {"beam": "beaming: the photo itself", "wary": "wary, looking away (another photo)", "smirk": "smirking (another photo)", "doe": "doe eyes",
              "startled": "startled (another photo)"},
}
FIRST = {
    "bill": {"smile": "bill-grin", "yell": "bill_pah", "inhale": "bill_in", "hold": "bill_hold", "sideeye": "bill-sideeye", "glare": "bill-glare"},
    "stephanie": {"smile": "mom_smile", "yell": "mom_pah", "angry": "mom_scold, mom_big_scold", "inhale": "mom_in", "hold": "mom_hold"},
    "chad": {"calm": "chadhead_set, chadbighead_set", "yell": "chadhead_yell, chadbighead_yell", "cry": "chadhead_cry", "grin": "chadhead_glee",
             "angel": "chadhead_angel", "joy": "chadhead_joy", "scowl": "chadhead_mad, chadhead_sad"},
    "shane": {"cry": "shanehead_cry, shanebighead_cry", "startled": "shanehead_scared, shanehead_ow", "beam": "shanehead_sweet, shanehead_tongue",
              "smirk": "shanehead_grin", "doe": "shanehead_doe, shanebighead_doe", "wary": ""},
}
WOMEN = {"stephanie", "mammy", "nanner", "shorty", "sabra", "sherry", "cindy", "betty"}
HEAD, BORDER, W = 190, 5, 2200
GREEN, CHIP, OWN_CHIP = np.array([0x5c, 0x78, 0x68]) / 255, (0x3f, 0x55, 0x48), (0x2b, 0x3a, 0x55)


def font(size, bold=False):
    return ImageFont.truetype(f"/usr/share/fonts/truetype/dejavu/DejaVuSans{'-Bold' if bold else ''}.ttf", size)


def cast():
    text = open(os.path.join(ROOT, "src", "data", "cast.ts")).read()
    people = {}
    for who, block in re.findall(r"\n  (\w+): \{\n(.*?)\n  \},", text, re.S):
        people[who] = {m.group(1): dict(file=m.group(2), tall=float(m.group(3)), chin=(float(m.group(4)), float(m.group(5))))
                       for m in re.finditer(r"(\w+): \{ file: '([^']+)', tall: ([\d.]+), chin: \[([\d.-]+), ([\d.-]+)\] \}", block)}
    return people


def tile(face):
    im = Image.open(os.path.join(SCRAP, face["file"].replace(".png", ".webp"))).convert("RGBA")
    k = HEAD * face["tall"] / im.height
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    pad = BORDER + 12
    c = np.zeros((a.shape[0] + 2 * pad, a.shape[1] + 2 * pad, 4), np.float32)
    c[pad:-pad, pad:-pad] = a
    edge = cv2.GaussianBlur(cv2.dilate((c[..., 3] > 0.5).astype(np.float32), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * BORDER + 1,) * 2)), (0, 0), 0.9)
    shadow = cv2.GaussianBlur(np.roll(edge, (6, 5), (0, 1)), (0, 0), 5) * 0.4
    rgb = np.array([1, .98, .94]) * (1 - c[..., 3:]) + c[..., :3] * c[..., 3:]
    return rgb, edge, shadow, pad, a.shape[0], a.shape[1]


def sheet(who, looks, out):
    his = "her" if who in WOMEN else "his"
    own = [look for look in looks if look not in LOOKS]
    got = [look for look in LOOKS if look in looks]
    # how far below its chin the lowest of any face goes (long hair hangs well below it)
    below = max((1 - f["chin"][1]) * f["tall"] for f in looks.values()) * HEAD
    row = int(HEAD * 1.08 + below) + 150
    top, gap = 150, 96
    own_cols = max(5, len(own))
    tall_px = top + row * 3 + (gap + row if own else 0) + 20
    page = np.tile(GREEN, (tall_px, W, 1)).astype(np.float32)
    labels = []

    def put(look, x, chin_y, chip):
        f = looks[look]
        rgb, edge, shadow, pad, h, w = tile(f)
        ox, oy = round(x - pad - f["chin"][0] * w), round(chin_y - pad - f["chin"][1] * h)
        y0, x0, y1, x1 = max(0, oy), max(0, ox), min(tall_px, oy + rgb.shape[0]), min(W, ox + rgb.shape[1])
        part = page[y0:y1, x0:x1]
        sh, ed = shadow[y0 - oy:y1 - oy, x0 - ox:x1 - ox, None], edge[y0 - oy:y1 - oy, x0 - ox:x1 - ox, None]
        part[:] = part * (1 - sh)
        part[:] = part * (1 - ed) + rgb[y0 - oy:y1 - oy, x0 - ox:x1 - ox] * ed
        lines = [(f"face_{who}_{look}", (216, 230, 200))]
        if look in OWN.get(who, {}):
            lines.insert(0, (OWN[who][look], (255, 255, 255)))
        first = FIRST.get(who, {}).get(look)
        if first and ", " in first:
            # two names to a picture go on two lines, so that no label runs into the next
            one, rest = first.split(", ", 1)
            lines += [(f"in the first games: {one},", (255, 230, 128)), (rest, (255, 230, 128))]
        elif first:
            lines.append((f"in the first games: {first}", (255, 230, 128)))
        elif first == "":
            lines.append(("no game has used it yet", (255, 230, 128)))
        labels.append((x, chin_y + below + 22, look, lines, chip))

    for i, look in enumerate(LOOKS):
        x, y = W / 5 * (i % 5 + 0.5), top + (i // 5) * row + int(HEAD * 1.04)
        if look in looks:
            put(look, x, y, CHIP)
        else:
            stand = next((n for n in NEAREST[look] + LOOKS if n in looks), None)
            labels.append((x, y - HEAD * 0.62, look, [("not made yet", (255, 230, 128)), (f"for now a game gets {his} \"{stand}\"", (216, 230, 200))], (0x6b, 0x4a, 0x3a)))
    y_own = top + 3 * row + gap
    for i, look in enumerate(own):
        put(look, W / own_cols * (i + 0.5), y_own + int(HEAD * 1.04), OWN_CHIP)

    img = Image.fromarray((np.clip(page, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    d.text((40, 28), f"{who.capitalize()}: every face there is", font=font(44, True), fill=(255, 255, 255))
    d.text((42, 86), f"{len(looks)} cutouts: {len(got)} of the fifteen, and {len(own)} that are only {his}", font=font(24), fill=(216, 230, 200))

    def header(y, text):
        d.line([(40, y + 16), (W - 40, y + 16)], fill=(160, 185, 165), width=2)
        w = d.textlength(text, font=font(24, True))
        d.rectangle([(40, y), (40 + w + 28, y + 34)], fill=(0x5c, 0x78, 0x68))
        d.text((40, y + 2), text, font=font(24, True), fill=(255, 235, 150))

    header(top - 26, "The fifteen")
    if own:
        header(y_own - 58, f"Only {his}: made for one game or another, and there for any game to use")
    for x, y, title, lines, chip in labels:
        f1, f2 = font(25, True), font(17)
        w = max([d.textlength(title, font=f1)] + [d.textlength(text, font=f2) for text, _ in lines]) + 24
        h = 38 + 24 * len(lines) + 4
        x0 = min(max(x - w / 2, 6), W - 6 - w)
        d.rounded_rectangle([(x0, y), (x0 + w, y + h)], radius=8, fill=chip)
        d.text((x0 + w / 2, y + 5), title, font=f1, fill=(255, 255, 255), anchor="ma")
        for i, (text, colour) in enumerate(lines):
            d.text((x0 + w / 2, y + 38 + 24 * i), text, font=f2, fill=colour, anchor="ma")
    img.save(out)
    print(out, img.size, f"{len(looks)} faces: {len(got)} of the fifteen, {len(own)} of {his} own")


def overview(people, out):
    """Everybody on one sheet: who has which of the fifteen, and what else."""
    head, name_w, cell, own_w = 96, 250, 150, 132
    most = max(len([l for l in looks if l not in LOOKS]) for looks in people.values())
    below = {who: max((1 - f["chin"][1]) * f["tall"] for f in looks.values()) * head for who, looks in people.items()}
    row_h = {who: int(head * 1.25 + min(below[who], head * 0.75)) + 34 for who in people}
    width = name_w + cell * len(LOOKS) + 30 + own_w * max(most, 1) + 30
    top = 150
    height = top + sum(row_h.values()) + 30
    page = np.tile(GREEN, (height, width, 1)).astype(np.float32)
    notes, y = [], top
    scale = head / HEAD

    def put(face, x, chin_y):
        im = Image.open(os.path.join(SCRAP, face["file"].replace(".png", ".webp"))).convert("RGBA")
        k = head * face["tall"] / im.height
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        a = np.asarray(im).astype(np.float32) / 255
        b, pad = 3, 10
        c = np.zeros((a.shape[0] + 2 * pad, a.shape[1] + 2 * pad, 4), np.float32)
        c[pad:-pad, pad:-pad] = a
        edge = cv2.GaussianBlur(cv2.dilate((c[..., 3] > 0.5).astype(np.float32), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * b + 1,) * 2)), (0, 0), 0.8)
        shadow = cv2.GaussianBlur(np.roll(edge, (4, 3), (0, 1)), (0, 0), 3) * 0.4
        rgb = np.array([1, .98, .94]) * (1 - c[..., 3:]) + c[..., :3] * c[..., 3:]
        ox, oy = round(x - pad - face["chin"][0] * a.shape[1]), round(chin_y - pad - face["chin"][1] * a.shape[0])
        y0, x0, y1, x1 = max(0, oy), max(0, ox), min(height, oy + c.shape[0]), min(width, ox + c.shape[1])
        part = page[y0:y1, x0:x1]
        sh, ed = shadow[y0 - oy:y1 - oy, x0 - ox:x1 - ox, None], edge[y0 - oy:y1 - oy, x0 - ox:x1 - ox, None]
        part[:] = part * (1 - sh)
        part[:] = part * (1 - ed) + rgb[y0 - oy:y1 - oy, x0 - ox:x1 - ox] * ed

    rows = []
    for who, looks in people.items():
        chin_y = y + int(head * 1.18)
        for i, look in enumerate(LOOKS):
            x = name_w + cell * (i + 0.5)
            if look in looks:
                put(looks[look], x, chin_y)
            else:
                notes.append(("gap", x, chin_y - head * 0.5))
        own = [l for l in looks if l not in LOOKS]
        for i, look in enumerate(own):
            x = name_w + cell * len(LOOKS) + 30 + own_w * (i + 0.5)
            put(looks[look], x, chin_y)
            notes.append(("own", x, chin_y + min(below[who], head * 0.75) + 6, look))
        rows.append((who, y, len([l for l in LOOKS if l in looks]), len(own)))
        y += row_h[who]
    img = Image.fromarray((np.clip(page, 0, 1) * 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    d.text((30, 22), "Everybody's faces: what is covered", font=font(40, True), fill=(255, 255, 255))
    d.text((32, 74), "A row for each person, a column for each of the fifteen looks. An empty ring is a look that is not made yet. On the right, the faces that are only theirs.",
           font=font(19), fill=(216, 230, 200))
    for i, look in enumerate(LOOKS):
        d.text((name_w + cell * (i + 0.5), top - 30), look, font=font(19, True), fill=(255, 235, 150), anchor="ma")
    d.text((name_w + cell * len(LOOKS) + 30, top - 30), "only theirs", font=font(19, True), fill=(160, 190, 255))
    d.line([(name_w + cell * len(LOOKS) + 14, top - 34), (name_w + cell * len(LOOKS) + 14, height - 24)], fill=(160, 185, 165), width=2)
    for who, y0, got, own in rows:
        d.line([(24, y0), (width - 24, y0)], fill=(120, 150, 132), width=1)
        d.text((30, y0 + 34), who.capitalize(), font=font(28, True), fill=(255, 255, 255))
        d.text((30, y0 + 72), f"{got} of 15" + (f", and {own} more" if own else ""), font=font(18), fill=(216, 230, 200))
    for note in notes:
        if note[0] == "gap":
            _, x, yc = note
            d.ellipse([(x - 30, yc - 36), (x + 30, yc + 36)], outline=(0x8a, 0x5a, 0x48), width=4)
        else:
            _, x, yy, look = note
            w = d.textlength(look, font=font(15)) + 12
            d.rounded_rectangle([(x - w / 2, yy), (x + w / 2, yy + 22)], radius=5, fill=OWN_CHIP)
            d.text((x, yy + 2), look, font=font(15), fill=(255, 255, 255), anchor="ma")
    img.save(out)
    print(out, img.size, f"{len(people)} people")


def main():
    out, only = sys.argv[1], sys.argv[2:]
    people = cast()
    for who, looks in people.items():
        if not only or who in only:
            sheet(who, looks, f"{out}-{who}.png")
    if not only:
        overview(people, f"{out}-everybody.png")


if __name__ == "__main__":
    main()
