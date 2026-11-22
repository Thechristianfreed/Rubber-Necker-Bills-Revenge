"""Cut the family's voice recording into the game's lines and mouth sounds.

Input   audio-src/voice/Record1.wav   one take, every line read in order
Output  public/voice/lines.mp3        all the clips end to end, with gaps
        src/data/voice.ts             where each clip is in that file

The CUTS below say roughly where each line is in the recording (found by
splitting it at the pauses and checking each piece with speech recognition).
Each one is then trimmed to where the sound really starts and stops, levelled
so the quiet ones are as loud as the shouted ones, and given a short fade.
To re-record a line: add the new take's times here and run this again.

Run:  python tools/make_voice.py     (needs numpy, and ffmpeg on the path)
"""
import os
import subprocess
import wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "audio-src", "voice", "Record1.wav")
OUT = os.path.join(ROOT, "public", "voice", "lines.mp3")
TABLE = os.path.join(ROOT, "src", "data", "voice.ts")

# id, start, end (seconds into the recording), and what is said
CUTS = [
    ("damn_phone", 8.14, 9.76, "Get off your DAMN PHONE!"),
    ("addicted", 11.60, 12.06, "You're ADDICTED!"),
    ("piss_rope", 14.14, 16.36, "OH PISS UP A ROPE!"),
    ("keep_moving", 19.06, 19.88, "Keep it moving!"),
    ("nothing_to_see", 22.16, 23.26, "Nothing to see here!"),
    ("eyes_road", 25.42, 26.60, "Eyes on the road!"),
    ("fender_bender", 29.00, 30.32, "It's a fender bender!"),
    ("sorry_pooch", 32.26, 32.76, "Sorry, pooch!"),
    ("sorry_mister", 35.96, 36.82, "Sorry, mister!"),
    ("special_delivery", 38.36, 39.36, "Special delivery!"),
    ("extra_extra", 41.06, 42.28, "Extra! Extra!"),
    ("read_all", 44.28, 45.54, "Read all about it!"),
    ("fifteen_love", 48.50, 49.70, "Fifteen-love!"),
    ("return_sender", 51.44, 52.56, "Return to sender!"),
    ("not_peanut_butter", 54.68, 56.24, "That's not peanut butter!"),
    ("game_set_match", 57.84, 59.72, "Game, set, match!"),
    ("teacher_book", 63.16, 64.60, "The teacher: WHERE is your BOOK?!"),
    ("bully_milkshake", 65.84, 71.50, "The bully: Ugh... Someone broke into my locker..."),
    ("fx_bonk", 74.74, 75.10, "BONK!"),
    ("fx_boing", 76.48, 77.72, "boi-oi-oi-oing"),
    ("fx_whoosh", 78.84, 79.06, "whoosh"),
    ("fx_splat", 80.46, 80.66, "SPLAT!"),
    ("fx_ow", 82.30, 82.86, "OW!"),
    ("fx_yelp", 84.10, 84.32, "a dog yelp"),
    ("fx_woohoo", 85.74, 86.40, "WOO-HOO!"),
    ("fx_groan", 87.66, 88.52, "a long groan"),
]

GAP = 0.3            # silence between clips in the output
LEVEL = 0.14         # how loud each clip is made (RMS), unless that would clip it
CEILING = 0.89


def main():
    w = wave.open(SRC)
    sr = w.getframerate()
    assert w.getnchannels() == 1 and w.getsampwidth() == 2
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

    # how loud the room is, in 10ms steps, so each cut can be widened to
    # where the sound really begins and ends
    step = sr // 100
    n = len(audio) // step
    level = 20 * np.log10(np.maximum(np.sqrt((audio[: n * step].reshape(n, step) ** 2).mean(axis=1)), 1e-6))
    quiet = np.percentile(level, 20) + 9

    def widen(a, b, lo, hi):
        """Move a..b outward while it is still noisy, stopping at 150ms of quiet or at lo/hi."""
        i, run = int(a * 100), 0
        while i > lo * 100 and run < 15:
            i -= 1
            run = run + 1 if level[i] < quiet else 0
        j, run2 = int(b * 100), 0
        while j < hi * 100 - 1 and j < n - 1 and run2 < 15:
            j += 1
            run2 = run2 + 1 if level[j] < quiet else 0
        return (i + run) / 100 - 0.03, (j - run2) / 100 + 0.06

    gap = np.zeros(int(GAP * sr), np.float32)
    parts, rows, at = [gap], [], GAP
    for k, (name, a, b, said) in enumerate(CUTS):
        lo = (CUTS[k - 1][2] + a) / 2 if k else 0
        hi = (b + CUTS[k + 1][1]) / 2 if k + 1 < len(CUTS) else len(audio) / sr
        a2, b2 = widen(a, b, max(lo, a - 0.6), min(hi, b + 0.6))
        clip = audio[int(a2 * sr): int(b2 * sr)].copy()
        if name.startswith("fx_"):
            # a sound effect has to land the instant it is asked for: drop any breath before it
            onset = int(np.argmax(np.abs(clip) > np.abs(clip).max() * 0.1))
            clip = clip[max(0, onset - int(0.05 * sr)):]
        rms = float(np.sqrt((clip ** 2).mean()))
        gain = min(LEVEL / max(rms, 1e-5), CEILING / float(np.abs(clip).max()))
        clip *= gain
        fi, fo = int(0.008 * sr), int(0.04 * sr)
        clip[:fi] *= np.linspace(0, 1, fi)
        clip[-fo:] *= np.linspace(1, 0, fo)
        parts += [clip, gap]
        rows.append((name, at, len(clip) / sr, said))
        print(f"{name:18s} {a2:6.2f} - {b2:6.2f}  {len(clip) / sr:4.2f}s  gain {20 * np.log10(gain):+5.1f} dB")
        at += len(clip) / sr + GAP

    sprite = np.concatenate(parts)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    pcm = (np.clip(sprite, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(sr), "-ac", "1",
                    "-i", "-", "-af", "highpass=f=70", "-ar", "22050", "-codec:a", "libmp3lame", "-b:a", "64k", OUT],
                   input=pcm, check=True)
    with open(TABLE, "w") as f:
        f.write("/** Where each recorded line is in voice/lines.mp3: [start, length] in seconds.\n"
                " *  Written by tools/make_voice.py from the family's recording; do not edit by hand. */\n"
                "export const VOICE = {\n")
        for name, start, dur, said in rows:
            f.write(f"  {name}: [{start:.3f}, {dur:.3f}],{' ' * max(1, 20 - len(name))}// {said}\n")
        f.write("} as const;\n\nexport type VoiceId = keyof typeof VOICE;\n")
    print(f"{OUT}  {len(sprite) / sr:.1f}s  {os.path.getsize(OUT)} bytes")


if __name__ == "__main__":
    main()
