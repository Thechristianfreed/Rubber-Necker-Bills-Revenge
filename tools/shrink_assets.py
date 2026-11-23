"""Turn every PNG the game loads into a WebP, which is several times smaller.

The game's pictures are all inside its one page when it is published, and
that page has a size limit; as PNGs they nearly filled it. make_cutouts.py and
make_heads.py already save WebP, so this is only for a PNG that has come
from somewhere else: drop it in src/assets/scrap, run this, and it is replaced.
The code goes on calling it "name.png"; the loader looks for "name.webp".

Run:  python tools/shrink_assets.py     (needs pillow)
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FOLDERS = [os.path.join(ROOT, "src", "assets", "scrap"), os.path.join(ROOT, "src", "assets", "bill")]
QUALITY = 90


def as_webp(path):
    """Where the WebP for a picture goes: the same name, with the ending changed."""
    return os.path.splitext(path)[0] + ".webp"


def save_webp(image, path):
    """Save a picture as WebP (see-through parts are kept exactly) and return the size of the file."""
    out = as_webp(path)
    image.save(out, "WEBP", quality=QUALITY, method=6, exact=False)
    return os.path.getsize(out)


def main():
    before = after = 0
    for folder in FOLDERS:
        for name in sorted(os.listdir(folder)):
            if not name.lower().endswith(".png"):
                continue
            path = os.path.join(folder, name)
            size = os.path.getsize(path)
            small = save_webp(Image.open(path).convert("RGBA"), path)
            os.remove(path)
            before += size
            after += small
    print(f"{before / 1e6:.1f} MB of PNG is now {after / 1e6:.1f} MB of WebP")


if __name__ == "__main__":
    main()
