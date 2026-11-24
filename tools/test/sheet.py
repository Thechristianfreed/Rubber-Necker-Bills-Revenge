"""A contact sheet: every PNG in a folder, in name order, as rows of small labelled
pictures on one page (or on several). For looking over a run of screenshots in one go,
and for sending them.

usage: python tools/test/sheet.py <folder> <out prefix> [columns=4] [per sheet=16] [tile width=480]
writes <out prefix>-0.jpg, <out prefix>-1.jpg, ...        (needs pillow)
"""
import glob
import os
import sys
from PIL import Image, ImageDraw

folder, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
per = int(sys.argv[4]) if len(sys.argv) > 4 else 16
wide = int(sys.argv[5]) if len(sys.argv) > 5 else 480
files = sorted(glob.glob(os.path.join(folder, "*.png")))
if not files:
    sys.exit(f"no PNGs in {folder}")
for k in range(0, len(files), per):
    part = files[k:k + per]
    pictures = [Image.open(f).convert("RGB") for f in part]
    tall = int(pictures[0].height * wide / pictures[0].width)
    rows = (len(part) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * wide, rows * (tall + 16)), (20, 20, 20))
    draw = ImageDraw.Draw(sheet)
    for i, (f, im) in enumerate(zip(part, pictures)):
        x, y = (i % cols) * wide, (i // cols) * (tall + 16)
        sheet.paste(im.resize((wide, tall)), (x, y + 16))
        draw.text((x + 4, y + 2), os.path.basename(f)[:-4], fill=(255, 255, 120))
    name = f"{out}-{k // per}.jpg"
    sheet.save(name, quality=82)
    print(name, sheet.size)
