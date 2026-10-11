#!/usr/bin/env bash
# Integra la voz en off cuando esté grabada.
#   src/mix_vo.sh audio/voz/voz_en_off.wav
# Produce:
#   audio/mezcla_con_voz.wav                         (música atenuada bajo la voz, -14 LUFS)
#   renders/pamenagency_reel_35s_con_voz.mp4         (limpia)
#   renders/pamenagency_reel_35s_con_voz_subtitulada.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
vo="${1:?Indica el WAV de la voz en off}"
video="renders/pamenagency_reel_35s_sin_subtitulos.mp4"
music="audio/music_main.wav"

# 1) Mezcla: la música se comprime con la voz como señal de control (ducking ~8-10 dB).
ffmpeg -y -hide_banner -loglevel error -i "$music" -i "$vo" -filter_complex "\
[1:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=80,acompressor=threshold=0.125:ratio=3:attack=5:release=120,volume=2.5,asplit=2[vo][sc];\
[0:a][sc]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=450:makeup=1[duck];\
[duck][vo]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.84[m]" \
  -map "[m]" -c:a pcm_s16le .cache/mezcla_tmp.wav
src/loudnorm.sh .cache/mezcla_tmp.wav audio/mezcla_con_voz.wav

# 2) Versión limpia con voz (el vídeo no se recodifica).
ffmpeg -y -hide_banner -loglevel error -i "$video" -i audio/mezcla_con_voz.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart \
  renders/pamenagency_reel_35s_con_voz.mp4

# 3) Versión con subtítulos integrados (estilo de marca, zona segura inferior).
python3 src/srt2ass.py audio/voz/subtitulos_vo.srt audio/voz/subtitulos_vo.ass >/dev/null
ffmpeg -y -hide_banner -loglevel error -i "$video" -i audio/mezcla_con_voz.wav \
  -vf "ass=audio/voz/subtitulos_vo.ass:fontsdir=assets/fonts" \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 15 -tune film -profile:v high -level 4.2 -pix_fmt yuv420p \
  -x264-params colorprim=bt709:transfer=bt709:colormatrix=bt709 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart \
  renders/pamenagency_reel_35s_con_voz_subtitulada.mp4

echo "Listo: renders/pamenagency_reel_35s_con_voz.mp4 y renders/pamenagency_reel_35s_con_voz_subtitulada.mp4"
