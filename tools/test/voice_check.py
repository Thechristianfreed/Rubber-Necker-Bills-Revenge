"""Check the family's lines as the game has them: each line in src/data/voice.ts is
played to a speech recogniser out of public/voice/lines.mp3, and what it hears is put
beside what the line is meant to be, with how long the line is, how soon it starts, and
how loud it is. For after tools/make_voice.py has been changed: a line cut short, or cut
in the wrong place, is heard wrong here.

usage: python tools/test/voice_check.py        (from anywhere in the repository)
(needs numpy and faster-whisper, and ffmpeg on the path)
"""
import os
import re
import subprocess
import numpy as np
from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 16000
pcm = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", os.path.join(ROOT, "public", "voice", "lines.mp3"), "-f", "s16le", "-ar", str(SR), "-ac", "1", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
rows = re.findall(r"^\s+(\w+): \[([\d.]+), ([\d.]+)\],\s+// (.*)$", open(os.path.join(ROOT, "src", "data", "voice.ts")).read(), re.M)
model = WhisperModel("small.en", device="cpu", compute_type="int8")
for name, a, d, said in rows:
    a, d = float(a), float(d)
    clip = audio[int(a * SR): int((a + d) * SR)]
    env = np.abs(clip)
    onset = np.argmax(env > env.max() * 0.2) / SR
    rms = 20 * np.log10(np.sqrt((clip ** 2).mean()))
    padded = np.concatenate([np.zeros(SR // 2, np.float32), clip, np.zeros(SR // 2, np.float32)])
    text = " ".join(s.text.strip() for s in model.transcribe(padded, beam_size=5, condition_on_previous_text=False)[0])
    print(f"{name:18s} {d:4.2f}s  onset {onset * 1000:4.0f}ms  rms {rms:5.1f} dB | heard: {text!r:44s} | wanted: {said}")
