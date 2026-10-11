#!/usr/bin/env python3
"""Convierte el SRT de la voz en off a ASS con el estilo de la marca (1080x1920, zona segura)."""
import re
import sys

src, dst = sys.argv[1], sys.argv[2]
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: VO,Manrope SemiBold,44,&H00E8F0F3,&H00E8F0F3,&H00000000,&H99000000,0,0,0,0,100,100,0,0,1,0,2,2,110,110,390,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
def ts(s):
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return f"{int(h)}:{m}:{sec}.{ms[:2]}"

blocks = re.split(r"\n\s*\n", open(src, encoding="utf-8").read().strip())
lines = []
for b in blocks:
    parts = b.strip().splitlines()
    a, z = [x.strip() for x in parts[1].split("-->")]
    text = r"\N".join(parts[2:])
    lines.append(f"Dialogue: 0,{ts(a)},{ts(z)},VO,,0,0,0,,{{\\fad(120,120)}}{text}")
open(dst, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
print(dst)
