"""Fetch and prepare the library sound effects: hits, mailbox clunks, stretches, springs.

Output  public/sfx/effects.mp3   all the clips end to end, with gaps
        src/data/sfx.ts          where each clip is in that file, by group

Every sound is from BigSoundBank.com (Joseph Sardin), which releases its
"Free and Royalty Free" sounds under Creative Commons CC0 1.0: free for any
use, no credit required (one is given anyway, in docs/voice.md).

CLIPS says which part of which sound each clip is. The game picks a clip at
random from a group each time, so adding a line here adds variety there.
The downloads are kept in audio-src/sfx/cache (not committed).

Run:  python tools/make_sfx.py     (needs numpy, and curl and ffmpeg on the path)
"""
import os
import subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "audio-src", "sfx", "cache")
OUT = os.path.join(ROOT, "public", "sfx", "effects.mp3")
TABLE = os.path.join(ROOT, "src", "data", "sfx.ts")
SOURCE = "https://bigsoundbank.com/UPLOAD/{kind}/{id}.{kind}"
SR = 44100

# group, sound id at BigSoundBank, start, end (seconds; None = to the end), what it is
CLIPS = [
    # hits: something landing on a head
    ("hit", "2460", 0.03, 0.55, "punch"),
    ("hit", "2461", 0.02, 0.50, "punch"),
    ("hit", "2463", 0.01, 0.55, "punch, meatier"),
    ("hit", "2468", 0.05, 0.45, "punch, dull"),
    ("hit", "0444", 1.10, 1.50, "punch"),
    ("hit", "0444", 3.18, 3.62, "punch"),
    ("hit", "1588", 0.00, None, "a gavel: one wooden knock"),
    ("hit", "1084", 17.15, 17.95, "a shovel on something hard"),
    ("hit", "0597", 0.25, 0.65, "a slap"),
    # clunks: a newspaper landing in a metal mailbox
    ("clunk", "1527", 0.36, 0.95, "metal mailbox"),
    ("clunk", "1527", 1.85, 2.50, "metal mailbox"),
    ("clunk", "1528", 1.35, 2.20, "metal mailbox"),
    # stretches: a neck being pulled like rubber
    ("stretch", "3420", 0.02, 0.92, "rope creak"),
    ("stretch", "3421", 0.04, 1.60, "rope creak"),
    ("stretch", "3422", 0.10, 1.25, "rope creak"),
    ("stretch", "0554", 8.44, 9.70, "rope pulled tight"),
    ("stretch", "0554", 12.14, 13.66, "rope pulled tight"),
    ("stretch", "0554", 23.20, 24.47, "rope pulled tight"),
    ("stretch", "3426", 0.30, 1.60, "a big rope groaning"),
    ("stretch", "3426", 4.10, 5.40, "a big rope groaning"),
    ("stretch", "3426", 9.00, 10.30, "a big rope groaning"),
    # springs
    ("spring", "1950", 0.00, 1.15, "cartoon twang"),
    ("spring", "1953", 0.08, 1.40, "cartoon twang"),
    ("spring", "1955", 0.06, 1.15, "cartoon twang"),
    ("spring", "1959", 0.13, 0.95, "cartoon twang"),
    ("spring", "0206", 0.05, 1.50, "a large spring let go"),
    ("spring", "0206", 6.96, 8.40, "a large spring let go"),
    ("spring", "0206", 14.90, 16.30, "a large spring let go"),
    ("spring", "0605", 0.14, 1.58, "a door spring grinding"),
    ("spring", "0605", 2.41, 3.50, "a door spring grinding"),
]

GAP = 0.25
# How loud each group is made, measured at its loudest moment (the level of the
# loudest 40ms), which is what the ear goes by. The family's mouth sounds come
# out at about 0.24 on the same measure. Punches, knocks and creaks are nearly
# all spike and no body: set by their peaks they are far too quiet to hear
# under the music, so they are pushed up to this level and the spikes are
# rounded off instead.
LOUD = {"hit": 0.28, "clunk": 0.26, "stretch": 0.24, "spring": 0.23}
KNOCKS = ("hit", "clunk")


def loudest(clip, ms=40):
    """The level (RMS) of the loudest `ms` milliseconds of a clip."""
    n = int(SR * ms / 1000)
    if len(clip) <= n:
        return float(np.sqrt((clip ** 2).mean()))
    total = np.cumsum(np.concatenate([[0.0], clip.astype(np.float64) ** 2]))
    return float(np.sqrt(((total[n:] - total[:-n]) / n).max()))


def fetch(sound):
    """The sound as mono samples: FLAC where the site has it, MP3 otherwise."""
    os.makedirs(CACHE, exist_ok=True)
    for kind in ("flac", "mp3"):
        path = os.path.join(CACHE, f"{sound}.{kind}")
        if not os.path.exists(path):
            subprocess.run(["curl", "-sSL", "-A", "Mozilla/5.0", "-o", path, SOURCE.format(kind=kind, id=sound)], check=True)
        pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "quiet", "-i", path, "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"],
                             capture_output=True).stdout
        if pcm:
            return np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
        os.remove(path)          # the site answered with a page, not a sound
    raise SystemExit(f"could not fetch sound {sound}")


def main():
    gap = np.zeros(int(GAP * SR), np.float32)
    parts, groups, at = [gap], {}, GAP
    for group, sound, a, b, what in CLIPS:
        audio = fetch(sound)
        clip = audio[int(a * SR): int(b * SR) if b else len(audio)].copy()
        if group in KNOCKS:
            # a knock has to land the instant it is asked for
            onset = int(np.argmax(np.abs(clip) > np.abs(clip).max() * 0.1))
            clip = clip[max(0, onset - int(0.012 * SR)):]
        # tanh leaves the body of the sound alone and bends the spikes over below
        # full scale. Bending them takes a little off the level, so the gain
        # is nudged up until the result is as loud as it is meant to be.
        raw, gain = clip, LOUD[group] / max(loudest(clip), 1e-5)
        for _ in range(8):
            clip = np.tanh(raw * gain) * 0.85
            gain = min(gain * LOUD[group] / max(loudest(clip), 1e-5), 20.0)
        clip = np.tanh(raw * gain) * 0.85
        fi, fo = int(0.003 * SR), int(min(0.12, len(clip) / SR * 0.25) * SR)
        clip[:fi] *= np.linspace(0, 1, fi)
        clip[-fo:] *= np.linspace(1, 0, fo)
        parts += [clip, gap]
        groups.setdefault(group, []).append((at, len(clip) / SR, f"{what} ({sound})"))
        print(f"{group:8s} {sound}  {len(clip) / SR:4.2f}s  gain {20 * np.log10(gain):+5.1f} dB  {what}")
        at += len(clip) / SR + GAP

    sprite = np.concatenate(parts)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    pcm = (np.clip(sprite, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1",
                    "-i", "-", "-codec:a", "libmp3lame", "-b:a", "96k", OUT], input=pcm, check=True)
    with open(TABLE, "w") as f:
        f.write("/** Where each library sound effect is in sfx/effects.mp3: [start, length] in\n"
                " *  seconds, by group. The game picks one from a group at random.\n"
                " *  Written by tools/make_sfx.py; do not edit by hand. */\n"
                "export const SFX = {\n")
        for group, rows in groups.items():
            f.write(f"  {group}: [\n")
            for start, dur, what in rows:
                f.write(f"    [{start:.3f}, {dur:.3f}],  // {what}\n")
            f.write("  ],\n")
        f.write("} as const;\n\nexport type SfxGroup = keyof typeof SFX;\n")
    print(f"{OUT}  {len(sprite) / SR:.1f}s  {os.path.getsize(OUT)} bytes")


if __name__ == "__main__":
    main()
