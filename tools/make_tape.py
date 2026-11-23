"""Cut the workout tape's music and its breathing out of a recording of the tape.

Input   audio-src/tape/workout.m4a   the sound of a short recording of the tape: its music all
                                     the way through, and one breath in and one "PAH" near the end
Output  public/music/workout.mp3     three clean bars of the music, going round and round
        public/sfx/tape.mp3          the breath in and the "PAH", with the music under them taken out
        src/data/tape.ts             where each of those two is in that file

The tape is somebody else's recording (see docs/music.md). The game does
without the two sound files if they are missing: the quick games' usual
music plays, and the breathing is synthesised.

How it works. The music is a slow synth pad over a drum pattern two seconds
long. LOOP is three of those bars with nothing but music in them; they are
joined end to start on a drum beat. The breath in and the "PAH" both have the
pad's held chord under them, which never changes while they last, so it can be
measured on its own (QUIET, where there is only music) and subtracted from
them, frequency by frequency; what is left of the drums goes with the low end.

Run:  python tools/make_tape.py     (needs numpy, and ffmpeg on the path)
"""
import os
import subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "audio-src", "tape", "workout.m4a")
MUSIC = os.path.join(ROOT, "public", "music", "workout.mp3")
SPRITE = os.path.join(ROOT, "public", "sfx", "tape.mp3")
TABLE = os.path.join(ROOT, "src", "data", "tape.ts")
SR = 44100

# The music: the drum beat the loop starts on, and the same beat three bars later.
LOOP = (2.15, 8.155)
ROUNDS = 6                    # 36 seconds: longer than the game it plays under
# The breathing: where each sound is, the lowest frequency of it worth keeping,
# and how loud to make it (the level of its loudest 40ms, as in make_sfx.py).
BREATHS = [
    ("inhale", 8.13, 9.50, 900, 0.17, "the breath in, through the nose"),
    ("pah", 9.935, 11.02, 430, 0.30, 'the "PAH"'),
]
# Stretches with the same chord and nobody breathing, to measure the music from.
QUIET = [(7.25, 7.85), (9.50, 9.90)]
GAP = 0.25
N, HOP = 2048, 512


def load(path):
    pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "quiet", "-i", path, "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"],
                         capture_output=True).stdout
    if not pcm:
        raise SystemExit(f"could not read {path}")
    return np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0


def cut(audio, a, b):
    return audio[int(a * SR): int(b * SR)].copy()


def loudest(clip, ms=40):
    """The level (RMS) of the loudest `ms` milliseconds of a clip."""
    n = int(SR * ms / 1000)
    total = np.cumsum(np.concatenate([[0.0], clip.astype(np.float64) ** 2]))
    return float(np.sqrt(((total[n:] - total[:-n]) / n).max()))


def highpass(clip, hz, width=0.25):
    """Take out everything below `hz`, easing in over the `width` of it below."""
    spec = np.fft.rfft(clip)
    f = np.fft.rfftfreq(len(clip), 1 / SR)
    keep = np.clip((f - hz * (1 - width)) / (hz * width), 0, 1)
    return np.fft.irfft(spec * (0.5 - 0.5 * np.cos(np.pi * keep)), len(clip)).astype(np.float32)


def lowpass(clip, hz, width=0.25):
    return clip - highpass(clip, hz, width)


def frames(clip):
    """The clip as overlapping windowed slices, each turned into its frequencies."""
    pad = np.concatenate([np.zeros(N, np.float32), clip, np.zeros(N, np.float32)])
    win = np.hanning(N).astype(np.float32)
    idx = np.arange(0, len(pad) - N, HOP)
    return np.fft.rfft(np.stack([pad[i:i + N] * win for i in idx]), axis=1), idx, len(pad)


def unframes(spec, idx, length):
    win = np.hanning(N).astype(np.float32)
    out, weight = np.zeros(length, np.float64), np.zeros(length, np.float64)
    for row, i in zip(np.fft.irfft(spec, N, axis=1), idx):
        out[i:i + N] += row * win
        weight[i:i + N] += win ** 2
    return (out / np.maximum(weight, 1e-6))[N:-N].astype(np.float32)


def without_music(clip, music):
    """Subtract the music's steady sound from a clip, one frequency at a time."""
    spec, idx, length = frames(clip)
    mag = np.abs(spec)
    # a little more than was measured comes off, and never quite everything:
    # a hole in the sound is easier to hear than a trace of chord
    left = np.maximum(mag - 1.8 * music, 0.05 * mag)
    return unframes(spec * (left / np.maximum(mag, 1e-9)), idx, length)


def encode(samples, path, rate, filters=None):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16).tobytes()
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-"]
    if filters:
        cmd += ["-af", filters]
    subprocess.run(cmd + ["-ar", str(SR), "-codec:a", "libmp3lame", "-b:a", rate, "-map_metadata", "-1", path], input=pcm, check=True)


def music_loop(audio):
    """Three bars, cut so that the end runs straight back into the start."""
    a, b = LOOP
    # the two drum beats, lined up exactly: slide the later one until its thump sits on the earlier one's
    low = lowpass(audio, 220)
    ref = cut(low, a - 0.05, a + 0.30)
    best, shift = -1.0, 0
    for s in range(-int(0.03 * SR), int(0.03 * SR)):
        i = int((b - 0.05) * SR) + s
        score = float(np.dot(ref, low[i:i + len(ref)]))
        if score > best:
            best, shift = score, s
    start = int((a - 0.03) * SR)
    length = int((b - a) * SR) + shift
    loop = audio[start:start + length].copy()
    # the first few hundredths of a second are a blend of what follows the end
    # and the start itself, so there is no step where one meets the other
    n = int(0.025 * SR)
    ramp = np.linspace(0, 1, n, dtype=np.float32)
    loop[:n] = loop[:n] * ramp + audio[start + length:start + length + n] * (1 - ramp)
    return loop


def main():
    audio = load(SOURCE)

    loop = music_loop(audio)
    track = np.tile(loop, ROUNDS)
    fade = int(0.04 * SR)
    track[:fade] *= np.linspace(0, 1, fade)
    seconds = len(track) / SR
    # levelled like the rest of the music (tools/make_music.sh)
    encode(track, MUSIC, "96k", f"loudnorm=I=-18:TP=-2:LRA=11,afade=t=out:st={seconds - 2:.2f}:d=2")
    print(f"{MUSIC}  a loop of {len(loop) / SR:.3f}s, {ROUNDS} times round: {seconds:.1f}s, {os.path.getsize(MUSIC)} bytes")

    music = np.median(np.concatenate([np.abs(frames(cut(audio, a, b))[0]) for a, b in QUIET]), axis=0)
    gap = np.zeros(int(GAP * SR), np.float32)
    parts, rows, at = [gap], [], GAP
    for name, a, b, floor, level, what in BREATHS:
        raw = highpass(without_music(cut(audio, a, b), music), floor)
        # as in make_sfx.py: tanh rounds off the spikes, and the gain is nudged up until it is as loud as it should be
        gain = level / max(loudest(raw), 1e-5)
        for _ in range(8):
            clip = np.tanh(raw * gain) * 0.9
            gain = min(gain * level / max(loudest(clip), 1e-5), 30.0)
        clip = np.tanh(raw * gain) * 0.9
        fi, fo = int(0.006 * SR), int(0.22 * SR)
        clip[:fi] *= np.linspace(0, 1, fi)
        clip[-fo:] *= np.linspace(1, 0, fo) ** 2
        parts += [clip, gap]
        rows.append((name, at, len(clip) / SR, what))
        print(f"{name:7s} {len(clip) / SR:4.2f}s  gain {20 * np.log10(gain):+5.1f} dB  {what}")
        at += len(clip) / SR + GAP
    sprite = np.concatenate(parts)
    encode(sprite, SPRITE, "96k")
    with open(TABLE, "w") as f:
        f.write("/** Where the workout tape's own breathing is in sfx/tape.mp3: [start, length]\n"
                " *  in seconds. Written by tools/make_tape.py; do not edit by hand. */\n"
                "export const TAPE = {\n")
        for name, start, dur, what in rows:
            f.write(f"  {name}: [{start:.3f}, {dur:.3f}],  // {what}\n")
        f.write("} as const;\n")
    print(f"{SPRITE}  {len(sprite) / SR:.1f}s  {os.path.getsize(SPRITE)} bytes")


if __name__ == "__main__":
    main()
