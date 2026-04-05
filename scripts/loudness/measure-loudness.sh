#!/usr/bin/env bash
# Measure integrated loudness (EBU R128) for every MP3 in public/songs.
# Usage: ./scripts/loudness/measure-loudness.sh [output.txt]
# Default output: scripts/loudness/loudness-report.txt

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SONGS_DIR="$ROOT/public/songs"
OUT="${1:-$SCRIPT_DIR/loudness-report.txt}"

if [[ ! -d "$SONGS_DIR" ]]; then
  echo "Missing $SONGS_DIR" >&2
  exit 1
fi

TMP_BODY="$(mktemp)"
trap 'rm -f "$TMP_BODY"' EXIT

shopt -s nullglob
files=("$SONGS_DIR"/*.mp3)
n=${#files[@]}
i=0
for f in "${files[@]}"; do
  i=$((i + 1))
  base=$(basename "$f")
  printf '\r[%d/%d] %s' "$i" "$n" "$base" >&2
  val=$(
    ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 \
      | sed -n '/Integrated loudness:/,/Loudness range:/p' \
      | grep "I:" \
      | head -1 \
      | sed -E 's/.*I:[[:space:]]*(-?[0-9.]+) LUFS.*/\1/'
  )
  [[ -z "$val" ]] && val="?"
  echo "$base | $val"
done | LC_ALL=C sort -t '|' -k1,1 > "$TMP_BODY"

echo "" >&2
{
  echo "Song | Integrated LUFS (I)"
  echo "--- | ---"
  cat "$TMP_BODY"
} > "$OUT"

echo "Wrote $OUT ($(wc -l < "$OUT" | tr -d ' ') lines)" >&2
