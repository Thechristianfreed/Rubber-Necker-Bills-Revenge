"""Find what is said in a recording of the family's lines, before cutting it up: the
separate sounds in it (where each starts and stops, and its peak), and what a speech
recogniser hears in each. Writes them to a JSON file as well, for working from.
tools/make_voice.py is then told where each line is.

usage: python tools/test/voice_find.py <recording> [out.json]
(needs numpy and faster-whisper, and ffmpeg on the path. The first run fetches the
recogniser's model, "small.en", from Hugging Face.)
"""
import json
import subprocess
import sys
import numpy as np
from faster_whisper import WhisperModel

SR = 16000
src = sys.argv[1]
pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", src, "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
# the sounds: runs where the level stays above the room's own noise, joined across short gaps
win = int(SR * 0.02)
n = len(audio) // win
level = 20 * np.log10(np.maximum(np.sqrt((audio[:n * win].reshape(n, win) ** 2).mean(axis=1)), 1e-6))
floor = np.percentile(level, 20)
loud = level > max(floor + 12, -42)
runs, start = [], None
for i, v in enumerate(loud):
    if v and start is None:
        start = i
    if not v and start is not None:
        runs.append([start * 0.02, i * 0.02])
        start = None
if start is not None:
    runs.append([start * 0.02, n * 0.02])
# (pieces less than 0.45 s apart are the gaps inside one line; anything under 0.12 s is a blip)
joined = []
for run in runs:
    if joined and run[0] - joined[-1][1] < 0.45:
        joined[-1][1] = run[1]
    else:
        joined.append(run)
joined = [run for run in joined if run[1] - run[0] >= 0.12]
print("noise floor %.0f dB, %d sounds" % (floor, len(joined)))
model = WhisperModel("small.en", device="cpu", compute_type="int8")
out = []
for k, (a, b) in enumerate(joined):
    clip = audio[max(0, int((a - 0.25) * SR)): int((b + 0.25) * SR)]
    clip = np.concatenate([np.zeros(SR // 2, np.float32), clip, np.zeros(SR // 2, np.float32)])
    heard = list(model.transcribe(clip, beam_size=5, condition_on_previous_text=False, vad_filter=False)[0])
    text = " ".join(s.text.strip() for s in heard)
    silent = max([s.no_speech_prob for s in heard], default=1)
    peak = 20 * np.log10(max(1e-6, float(np.abs(audio[int(a * SR): int(b * SR)]).max())))
    print(f"{k:2d}  {a:6.2f} - {b:6.2f}  ({b - a:4.2f}s, peak {peak:5.1f} dB)  no-speech {silent:.2f}  | {text}")
    out.append({"i": k, "start": round(a, 3), "end": round(b, 3), "text": text})
if len(sys.argv) > 2:
    json.dump(out, open(sys.argv[2], "w"), indent=1)
    print("wrote", sys.argv[2])
