#!/usr/bin/env bash
# Fetch and prepare the level music (needs curl and ffmpeg).
#
#   bash tools/make_music.sh
#
# The tracks are by Kevin MacLeod (incompetech.com), licensed under Creative
# Commons: By Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/).
# Each is cut to its first minute and a half with a fade at the end (a level
# is about a minute long, and the game goes round again if it has to), levelled
# to the same loudness so no level is louder than another, and saved small.
#
# One line per level: the level's id, then the track's file name at the source.
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="https://incompetech.com/music/royalty-free/mp3-royaltyfree"
OUT="public/music"
TMP="$(mktemp -d)"
mkdir -p "$OUT"
while IFS='|' read -r level track; do
  [ -z "$level" ] && continue
  curl -sSL --get -o "$TMP/$level.mp3" "$SRC/$(python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$track")"
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$TMP/$level.mp3" -map 0:a -t 92 \
    -af "loudnorm=I=-18:TP=-2:LRA=11,afade=t=out:st=89:d=3" \
    -ar 44100 -ac 2 -codec:a libmp3lame -b:a 112k -map_metadata -1 "$OUT/$level.mp3"
  echo "$OUT/$level.mp3  <-  $track"
done <<'TRACKS'
street|Sock Hop.mp3
highway|Happy Bee - Surf.mp3
locker|Sneaky Snitch.mp3
TRACKS
rm -rf "$TMP"
