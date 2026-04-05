#!/usr/bin/env bash
# Normalize every MP3 from public/songs-originals into public/songs at -14 LUFS
# (single-pass loudnorm), 192 kb/s stereo. Skips if no matching original exists.
#
# Usage: ./normalize-songs.sh              # all tracks that have an original
#        ./normalize-songs.sh "file.mp3"   # single file (basename only)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
ORIG="$ROOT/public/songs-originals"
OUT="$ROOT/public/songs"
TARGET_I=-14
TARGET_TP=-1.5
TARGET_LRA=11
BITRATE=192k

if [[ ! -d "$ORIG" || ! -d "$OUT" ]]; then
  echo "Need $ORIG and $OUT" >&2
  exit 1
fi

normalize_one() {
  local base="$1"
  local src="$ORIG/$base"
  local dst="$OUT/$base"
  if [[ ! -f "$src" ]]; then
    echo "skip (no original): $base" >&2
    return 0
  fi
  local tmp
  tmp=$(mktemp -t normXXXXXX.mp3)
  ffmpeg -y -hide_banner -nostats -i "$src" \
    -af "loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}" \
    -ar 44100 \
    -c:a libmp3lame -b:a "$BITRATE" \
    "$tmp"
  mv "$tmp" "$dst"
  echo "ok: $base" >&2
}

if [[ $# -ge 1 ]]; then
  normalize_one "$1"
  exit 0
fi

shopt -s nullglob
for src in "$ORIG"/*.mp3; do
  normalize_one "$(basename "$src")"
done

echo "Done." >&2
