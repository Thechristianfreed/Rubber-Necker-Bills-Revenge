"""A picture of a sound: time across, pitch up (60 Hz to 12 kHz, evenly by octave),
brighter where it is louder, with a line every `tick` seconds. For finding where the
things in a recording are before cutting it up (the workout tape, the announcer), and
for seeing what a made sound is made of.

usage: python tools/test/spec.py <sound file> <out.png> [from] [to] [tick=0.5]
(needs numpy and pillow, and ffmpeg on the path)
"""
import subprocess
import sys
import numpy as np
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
SR, N, HOP, ROWS, WIDE, TALL = 44100, 2048, 128, 300, 1900, 500
pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "quiet", "-i", src, "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"], capture_output=True).stdout
a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
t0 = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
t1 = float(sys.argv[4]) if len(sys.argv) > 4 else len(a) / SR
tick = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5
a = a[int(t0 * SR):int(t1 * SR)]
frames = np.array([a[i:i + N] * np.hanning(N) for i in range(0, len(a) - N, HOP)])
power = np.abs(np.fft.rfft(frames, axis=1))
freq = np.fft.rfftfreq(N, 1 / SR)
edges = np.geomspace(60, 12000, ROWS + 1)
img = np.zeros((ROWS, power.shape[0]))
for r in range(ROWS):
    band = (freq >= edges[r]) & (freq < edges[r + 1])
    img[r] = power[:, band].mean(axis=1) if band.any() else power[:, np.argmin(abs(freq - edges[r]))]
db = 20 * np.log10(img + 1e-6)
db = np.clip((db - db.max() + 70) / 70, 0, 1)
im = Image.fromarray((db[::-1] * 255).astype(np.uint8)).resize((WIDE, TALL), Image.BILINEAR).convert("RGB")
d = ImageDraw.Draw(im)
dur = len(a) / SR
t = np.ceil(t0 / tick) * tick
while t < t0 + dur:
    x = int((t - t0) / dur * WIDE)
    d.line([(x, 0), (x, TALL)], fill=(255, 80, 80), width=1)
    d.text((x + 3, 2), f"{t:.2f}", fill=(255, 255, 0))
    t += tick
for hz in [100, 200, 500, 1000, 2000, 4000, 8000]:
    y = TALL - int(np.log(hz / 60) / np.log(12000 / 60) * TALL)
    d.line([(0, y), (WIDE, y)], fill=(60, 140, 255), width=1)
    d.text((3, y - 11), f"{hz}", fill=(120, 200, 255))
im.save(out)
print(out, f"{dur:.2f}s")
