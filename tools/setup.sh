#!/usr/bin/env bash
# Get a fresh checkout ready to work in: the game's packages, and a Python of
# its own (.venv) with what the tools need. Safe to run again.
#
#   bash tools/setup.sh
#
# After it:  npm run dev                               the game, to play
#            .venv/bin/python tools/make_cutouts.py     the pictures (docs/cutting.md)
#            node tools/test/tape_whole.cjs ...         the game playing itself (docs/testing.md)
set -euo pipefail
cd "$(dirname "$0")/.."

npm ci
python3 -m venv .venv
.venv/bin/pip install --quiet -r tools/requirements.txt
echo "python: $(.venv/bin/python --version), with $(.venv/bin/pip freeze | tr '\n' ' ')"

# things that are not installed from here: say so if they are missing
command -v ffmpeg >/dev/null || echo "MISSING ffmpeg: the sound tools (make_sfx.py, make_tape.py, make_voice.py, make_music.sh) need it"
command -v curl >/dev/null || echo "MISSING curl: make_sfx.py and make_music.sh need it"
node -e "require('playwright')" 2>/dev/null || echo "MISSING Playwright: the self-play scripts in tools/test need it (a Claude cloud session has it; do not add it to package.json)"
