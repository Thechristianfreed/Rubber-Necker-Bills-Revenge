"""What is in some sound files: for each, how long it is, its peak, and the separate
sounds in it (where each starts and stops, its peak, and where its pitch is centred).
For choosing takes out of a downloaded recording with several in it, before telling
make_sfx.py which to use.

usage: python tools/test/audio_events.py <sound file> [more files ...]
(needs numpy, and ffmpeg on the path)
"""
import subprocess
import sys
import numpy as np

SR = 22050


def load(path):
    pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", path, "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"], capture_output=True).stdout
    return np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0


def events(a, gap=0.25, floor_db=-45):
    """The stretches that are louder than the quiet between them, joined across short gaps."""
    step = SR // 100
    n = len(a) // step
    if n == 0:
        return []
    level = 20 * np.log10(np.maximum(np.sqrt((a[:n * step].reshape(n, step) ** 2).mean(axis=1)), 1e-6))
    on = level > max(floor_db, level.max() - 38)
    runs, start = [], None
    for i, v in enumerate(on):
        if v and start is None:
            start = i
        if not v and start is not None:
            runs.append([start / 100, i / 100])
            start = None
    if start is not None:
        runs.append([start / 100, n / 100])
    out = []
    for run in runs:
        if out and run[0] - out[-1][1] < gap:
            out[-1][1] = run[1]
        else:
            out.append(run)
    return [run for run in out if run[1] - run[0] >= 0.04]


def centroid(x):
    if len(x) < 256:
        return 0
    power = np.abs(np.fft.rfft(x * np.hanning(len(x))))
    freq = np.fft.rfftfreq(len(x), 1 / SR)
    return float((power * freq).sum() / max(power.sum(), 1e-9))


def db(x):
    return 20 * np.log10(max(np.abs(x).max(), 1e-6))


for path in sys.argv[1:]:
    a = load(path)
    if len(a) == 0:
        print(path, "did not decode")
        continue
    found = events(a)
    print(f"{path}  {len(a) / SR:5.1f}s  peak {db(a):5.1f} dB  {len(found)} sounds")
    for start, end in found[:14]:
        x = a[int(start * SR): int(end * SR)]
        print(f"      {start:6.2f}-{end:6.2f} ({end - start:4.2f}s) peak {db(x):5.1f} dB  centre {centroid(x):5.0f} Hz")
