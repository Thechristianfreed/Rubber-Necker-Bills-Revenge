"""A piece of a picture with a ruled grid over it, each line marked with its place in
the whole picture. For reading off where something is in a generated image (an elbow, a
chin, the top of a plank) before telling make_cutouts.py to cut there.

usage: python tools/test/grid.py <picture> <out.png> <x0> <y0> <x1> <y1> <step>
       (the corner to start at, the corner to stop at, and how far apart the lines are)
(needs pillow)
"""
import sys
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
x0, y0, x1, y1, step = map(int, sys.argv[3:8])
im = Image.open(src).convert("RGB").crop((x0, y0, x1, y1))
d = ImageDraw.Draw(im)
for x in range((x0 // step + 1) * step, x1, step):
    d.line([(x - x0, 0), (x - x0, y1 - y0)], fill=(255, 255, 0), width=1)
    d.text((x - x0 + 2, 2), str(x), fill=(255, 255, 0))
for y in range((y0 // step + 1) * step, y1, step):
    d.line([(0, y - y0), (x1 - x0, y - y0)], fill=(0, 255, 255), width=1)
    d.text((2, y - y0 + 2), str(y), fill=(0, 255, 255))
im.save(out)
print(out, im.size)
