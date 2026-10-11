#!/usr/bin/env bash
# Normalización de sonoridad en dos pasadas (EBU R128): -14 LUFS integrados, -1,5 dBTP.
# Uso: src/loudnorm.sh entrada.wav salida.wav
set -euo pipefail
in="$1"; out="$2"
stats=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -hide_banner -loglevel error -i "$in" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" -c:a pcm_s16le "$out"
echo "$out"
