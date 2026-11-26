#!/usr/bin/env python3
"""A batch of somebody's faces, on its way through Adobe.

The owner makes a person's looks, one to a picture, and puts them in a folder
of his Drive, each named for the person and the look ("Pappy Angry.png"). Once
they are on disk (docs/cutting.md says how they get there), this gets them
ready for Adobe and checks what comes back. The Adobe calls themselves are
made by a helper, a person at a time: tools/cast_jobs.md is its brief.

    .venv/bin/python tools/cast_jobs.py prepare <folder> <who> <work folder> [--woman] [--crop top,bottom] [--tall N] [--only look,look] [--name "<file's name>=<look>" ...]

makes a copy of each picture to send (cropped to the head if it is a small
part of the picture, and made N pixels tall: 1194 unless told) in
<work folder>/<who>/, and writes <work folder>/<who>.json, the list the helper
works through: for each look, the copy, its exact size in bytes, where Adobe's
cutout is to be saved (art-src/cast/<who>/<look>-cutout.png) and what is to be
selected (the head; and for --woman, whose hair hangs below her chin, the face
alone as well). "Default" and "Base" are that person's smile; "Laughing" is
laugh. A picture whose name is not a look is listed and left out, unless
--name says what it is ("Branson Calm (2)=smug"; and a look of that person's
own, outside the fifteen, is named the same way: "Christian Yell Alternate=yell2").

    .venv/bin/python tools/cast_jobs.py check <work folder>/<who>.json

says, for each look on a list, whether Adobe's answers are on disk, are PNGs
the size of the picture that was sent, and select a believable amount of it.
(After it: tools/make_cast.py --keep, and tools/make_cast.py.)
"""
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOOKS = ["calm", "talking", "smile", "laugh", "smug", "angry", "yell", "shocked", "guilty", "worried", "cry", "ouch", "dazed",
         "disgusted", "asleep"]
ALSO = {"default": "smile", "base": "smile", "the base": "smile", "laughing": "laugh", "smiling": "smile", "crying": "cry",
        "yelling": "yell", "sleeping": "asleep", "sleep": "asleep", "disgust": "disgusted", "shock": "shocked", "talk": "talking"}
MAN = ["Hair", "Face", "Left Ear", "Right Ear", "Beard"]
WOMAN = ["Hair", "Face", "Left Ear", "Right Ear"]


def flag(args, name, default=None):
    if name not in args:
        return default
    i = args.index(name)
    value = args[i + 1]
    del args[i:i + 2]
    return value


def prepare(args):
    woman = "--woman" in args
    if woman:
        args.remove("--woman")
    crop = [float(v) for v in flag(args, "--crop", "0,1").split(",")]
    tall = int(flag(args, "--tall", "1194"))
    only = flag(args, "--only")
    only = only.split(",") if only else None
    named = {}
    while "--name" in args:
        stem, look = flag(args, "--name").rsplit("=", 1)
        named[stem.strip().lower()] = look.strip()
    folder, who, work = args
    os.makedirs(os.path.join(work, who), exist_ok=True)
    rows, left = [], []
    for name in sorted(os.listdir(folder)):
        stem, ext = os.path.splitext(name)
        if ext.lower() not in (".png", ".jpg", ".jpeg", ".webp", ".jfif"):
            continue
        said = stem.split(" ", 1)[1].strip().lower() if " " in stem else stem.lower()
        look = named.get(stem.lower()) or ALSO.get(said, said)
        if (look not in LOOKS and stem.lower() not in named) or (only and look not in only):
            if look not in LOOKS:
                left.append(name)
            continue
        im = Image.open(os.path.join(folder, name)).convert("RGB")
        im = im.crop((0, round(im.height * crop[0]), im.width, round(im.height * crop[1])))
        if im.height != tall:
            # (a picture that came small is brought up to the same size, so that the set still lines up)
            im = im.resize((round(im.width * tall / im.height), tall), Image.LANCZOS)
        out = os.path.join(work, who, f"{look}.jpg")
        im.save(out, quality=93, subsampling=0)
        dest = os.path.join(ROOT, "art-src", "cast", who, look)
        prompt = "the woman" if woman else "the man"
        selections = [{"save_as": dest + "-headmask.png", "prompt": prompt, "bodyParts": WOMAN if woman else MAN}]
        if woman:
            selections.append({"save_as": dest + "-facemask.png", "prompt": prompt, "bodyParts": ["Face"]})
        if any(r["name"] == f"{who}-{look}" for r in rows):
            print(f"  two pictures are \"{look}\": {name} takes the place of the one before it")
            rows = [r for r in rows if r["name"] != f"{who}-{look}"]
        rows.append({"name": f"{who}-{look}", "file": out, "bytes": os.path.getsize(out), "size": list(im.size), "from": name,
                     "cutout": dest + "-cutout.png", "selections": selections})
    os.makedirs(os.path.join(ROOT, "art-src", "cast", who), exist_ok=True)
    with open(os.path.join(work, who + ".json"), "w") as f:
        json.dump(rows, f, indent=1)
    print(f"{who}: {len(rows)} to send: {', '.join(r['name'].split('-', 1)[1] for r in rows)}")
    print(f"  sizes {sorted(set(tuple(r['size']) for r in rows))}; not in this batch: {', '.join(l for l in LOOKS if not any(r['name'] == f'{who}-{l}' for r in rows)) or 'none'}")
    if left:
        print("  left out (the name is not a look):", ", ".join(left))


def check(args):
    bad = 0
    for row in json.load(open(args[0])):
        size, notes = tuple(row["size"]), []
        for kind, path in [("cutout", row["cutout"])] + [(os.path.basename(s["save_as"]).rsplit("-", 1)[1][:-4], s["save_as"]) for s in row["selections"]]:
            kept = path[:-4] + ".webp"
            if not os.path.exists(path) and kind == "cutout" and os.path.exists(kept):
                path = kept                          # kept already (tools/make_cast.py --keep)
            if not os.path.exists(path):
                notes.append(f"{kind}: MISSING")
                continue
            try:
                im = Image.open(path)
                im.load()
            except Exception:
                notes.append(f"{kind}: NOT AN IMAGE ({os.path.getsize(path)} bytes)")
                continue
            if im.size != size:
                notes.append(f"{kind}: WRONG SIZE {im.size}, sent {size}")
                continue
            a = np.asarray(im.convert("RGBA")).astype(float)
            sel = a[..., 3] if a[..., 3].std() > 1 else a[..., :3].mean(axis=2)
            part = (sel > 128).mean()
            notes.append(f"{kind}: {part:.0%}" + ("" if 0.02 <= part <= 0.95 else " ODD AMOUNT"))
        line = "; ".join(notes)
        bad += any(w in line for w in ("MISSING", "NOT AN", "WRONG", "ODD"))
        print(f"{row['name']:20s} {line}")
    print("all good" if not bad else f"{bad} to look at")


if __name__ == "__main__":
    what, rest = sys.argv[1], sys.argv[2:]
    {"prepare": prepare, "check": check}[what](rest)
