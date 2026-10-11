#!/usr/bin/env python3
"""
Banda sonora original para el anuncio de PaMenAgency.

Todo el audio se sintetiza aquí (osciladores, ruido, envolventes, reverb por
convolución con una respuesta al impulso generada). No se usa ninguna muestra
ni loop de terceros, así que la pista es de uso libre para PaMenAgency.

    python3 src/music.py --version main     -> audio/music_main.wav
    python3 src/music.py --version short15  -> audio/music_short15.wav

Estilo: electrónica ambiental, graves controlados, percusión mínima y golpes
precisos sincronizados con los mensajes (tiempos en src/timeline.json).
"""
import argparse
import json
import pathlib

import numpy as np
from scipy import signal

ROOT = pathlib.Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/timeline.json").read_text())
SR = 48000
BEAT = 0.5625  # 106,7 BPM: 16 tiempos exactos entre la escena 3 y la 4
rng = np.random.default_rng(2026)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def db(x):
    return 10 ** (x / 20)


def t_axis(n):
    return np.arange(n) / SR


def lowpass(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def pan(mono, p):
    """p en [-1, 1], ley de potencia constante."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


class Bus:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.x = np.zeros((self.n, 2))

    def add(self, t0, stereo, gain=1.0):
        i0 = int(round(t0 * SR))
        if i0 >= self.n:
            return
        if i0 < 0:
            stereo = stereo[-i0:]
            i0 = 0
        m = min(len(stereo), self.n - i0)
        self.x[i0 : i0 + m] += stereo[:m] * gain


# ---------------------------------------------------------------- instrumentos
def saw_table(f, n):
    """Diente de sierra limitado en banda (aditivo) para evitar aliasing."""
    t = t_axis(n)
    out = np.zeros(n)
    k_max = int(min(14000 / f, 60))
    ph = rng.uniform(0, 2 * np.pi)
    for k in range(1, k_max + 1):
        out += np.sin(2 * np.pi * f * k * t + ph * k) / k
    return out * 0.6


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    if nr:
        e[-nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    return e


def pad(notes, dur, cutoff=1400, attack=0.9, release=1.4):
    n = int((dur + release) * SR)
    out = np.zeros((n, 2))
    for j, nt in enumerate(notes):
        for det, p in ((-9, -0.7), (0, 0.0), (8, 0.7)):
            f = midi(nt) * 2 ** (det / 1200)
            v = saw_table(f, n)
            out += pan(v, p * (0.5 + 0.5 * (j % 2)))
    out = lowpass(out, cutoff, 2)
    out *= env_adsr(n, attack, release)[:, None]
    # vibrato de amplitud muy lento para que respire
    out *= (1 + 0.06 * np.sin(2 * np.pi * 0.22 * t_axis(n)))[:, None]
    return out / (len(notes) * 3)


def pluck(f, dur=0.55, bright=2600):
    n = int(dur * SR)
    t = t_axis(n)
    v = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    e = np.exp(-t / 0.16) * (1 - np.exp(-t / 0.003))
    return lowpass(v * e, bright, 2)


def kick(gain=1.0):
    n = int(0.6 * SR)
    t = t_axis(n)
    f = 46 + 80 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    v = np.sin(ph) * np.exp(-t / 0.22)
    click = highpass(rng.standard_normal(n) * np.exp(-t / 0.004), 2500) * 0.15
    return (v + click) * gain


def hat():
    n = int(0.12 * SR)
    t = t_axis(n)
    v = highpass(rng.standard_normal(n), 7000, 4) * np.exp(-t / 0.022)
    return v


def clap():
    n = int(0.5 * SR)
    t = t_axis(n)
    env = np.exp(-t / 0.12)
    for d in (0.0, 0.011, 0.022):
        i = int(d * SR)
        env[i : i + int(0.006 * SR)] += 0.6
    return bandpass(rng.standard_normal(n), 900, 3500) * env * 0.5


def sub(f, dur):
    n = int(dur * SR)
    t = t_axis(n)
    v = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return v * env_adsr(n, 0.01, min(0.12, dur / 3))


def impact(size=1.0):
    n = int(4.0 * SR)
    t = t_axis(n)
    f = 32 + 40 * np.exp(-t / 0.12)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.9 * size))
    body = lowpass(rng.standard_normal(n), 900) * np.exp(-t / 0.18) * 0.5
    air = highpass(rng.standard_normal(n), 3000) * np.exp(-t / 0.05) * 0.08
    return boom + body + air


def riser(dur):
    n = int(dur * SR)
    t = t_axis(n)
    x = rng.standard_normal(n)
    # barrido con banco de filtros por bloques
    out = np.zeros(n)
    blocks = 40
    for b in range(blocks):
        i0, i1 = b * n // blocks, (b + 1) * n // blocks
        fc = 300 * (25 ** (b / blocks))
        seg = bandpass(x[max(0, i0 - 2000) : i1], fc * 0.7, min(fc * 1.6, 20000))
        out[i0:i1] = seg[-(i1 - i0) :]
    return out * (t / dur) ** 2.2


def drone(dur):
    n = int(dur * SR)
    t = t_axis(n)
    v = 0.6 * np.sin(2 * np.pi * midi(38) * t) + 0.35 * np.sin(2 * np.pi * midi(45) * t + 0.4)
    v += 0.2 * lowpass(saw_table(midi(50), n), 500)
    air = bandpass(rng.standard_normal(n), 2500, 6000) * 0.05 * (1 + np.sin(2 * np.pi * 0.15 * t))
    return np.stack([v + air, v + np.roll(air, 977)], axis=1)


def bell(f, dur=3.0):
    n = int(dur * SR)
    t = t_axis(n)
    v = np.zeros(n)
    for r, a, d in ((1, 1, 1.4), (2.76, 0.35, 0.5), (5.4, 0.12, 0.25), (2.0, 0.2, 0.9)):
        v += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d)
    return v * (1 - np.exp(-t / 0.002)) * 0.4


def reverb_ir(seconds=3.2, damp=5500):
    n = int(seconds * SR)
    t = t_axis(n)
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (seconds / 6.5))[:, None]
    ir = lowpass(ir, damp, 1)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt(np.sum(ir**2, axis=0, keepdims=True))


def convolve(x, ir):
    return np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)


def delay(x, seconds, fb=0.35, mix=0.3):
    d = int(seconds * SR)
    out = x.copy()
    tap = x.copy()
    for k in range(1, 5):
        tap = np.roll(tap, d, axis=0) * fb
        tap[:d] = 0
        if k % 2:
            tap = tap[:, ::-1]  # ping-pong
        out += tap * mix
    return out


# ----------------------------------------------------------------- arreglo
CH = {
    "Dm9": [50, 53, 57, 60, 64],
    "Bbmaj9": [46, 50, 53, 57, 60],
    "F/A": [45, 53, 57, 60, 64],
    "Gm9": [43, 50, 53, 57, 58],
    "Dsus2": [38, 45, 50, 52, 57, 62],
}


def arrangement(version):
    """Devuelve la lista de eventos (en segundos de la versión) a partir de la línea de tiempo."""
    c = {**TL["cues"], **TL["versions"][version].get("cueOverrides", {})}
    if version == "main":
        return {
            "dur": TL["versions"]["main"]["duration"],
            "drone": [(0.0, 6.5)],
            "chords": [
                (2.6, 2.7, "Dm9", 600), (5.2, 2.5, "Dm9", 1000), (7.7, 2.5, "Bbmaj9", 1100), (10.2, 1.1, "Gm9", 1300),
                (11.2, 2.25, "Dm9", 1500), (13.45, 2.25, "Bbmaj9", 1500), (15.7, 2.25, "F/A", 1600), (17.95, 2.25, "Gm9", 1700),
                (20.2, 2.25, "Dm9", 2300), (22.45, 2.25, "Bbmaj9", 2600), (24.7, 2.3, "Gm9", 2800),
                (c["logo"], 7.4, "Dsus2", 1800),
            ],
            "plucks": [(5.2 + 0.375, 11.2, 0.75), (11.2, 20.2, 0.8), (20.2, 26.95, 1.0)],
            "kicks": [(11.2, 20.2, 0.7), (20.2, 26.4, 1.0)],
            "hats": [(7.0, 11.0, 0.5), (11.2, 20.2, 0.8), (20.2, 26.4, 1.0)],
            "claps": [(20.2, 26.4)],
            "sub": [(11.2, 20.2, 0.8), (20.2, 26.95, 1.0)],
            "impacts": [(c["s1a"] - 0.05, 0.22), (c["s1b"] - 0.05, 0.3), (c["wipe"], 0.9), (c["s4b"], 0.5), (c["logo"], 1.0)],
            "risers": [(c["wipe"] - 1.6, 1.6, 0.5), (c["logo"] - 1.4, 1.4, 0.65)],
            "bells": [(c["tag"], 74), (c["url"], 81)],
            "fade_out": (c["end"] - 2.6, c["end"]),
        }
    # versión corta de 15 s: mismos materiales, recolocados según sus segmentos
    seg = TL["versions"]["short15"]["segments"]
    o2 = seg[0][1] - seg[0][0]  # inicio del 2º segmento en la salida
    o3 = o2 + seg[1][1] - seg[1][0]
    m2 = lambda s: o2 + (s - seg[1][0])  # noqa: E731
    m3 = lambda s: o3 + (s - seg[2][0])  # noqa: E731
    m1 = lambda s: s - seg[0][0]  # noqa: E731
    return {
        "dur": TL["versions"]["short15"]["duration"],
        "drone": [(0.0, o2 + 0.5)],
        "chords": [
            (m1(2.6), o2 - m1(2.6), "Dm9", 800),
            (o2, 2.0, "Dm9", 1600), (o2 + 2.0, o3 - o2 - 2.0, "Bbmaj9", 1800),
            (m3(c["logo"]), 15.0 - m3(c["logo"]), "Dsus2", 1800),
        ],
        "plucks": [(o2, o3 - 0.1, 0.8)],
        "kicks": [(o2, o3 - 0.3, 0.8)],
        "hats": [(o2, o3 - 0.3, 0.8)],
        "claps": [],
        "sub": [(o2, o3 - 0.1, 0.8)],
        "impacts": [(m1(c["s1a"]) - 0.05, 0.22), (m1(c["s1b"]) - 0.05, 0.3), (m2(c["wipe"]), 0.9), (m3(c["logo"]), 1.0)],
        "risers": [(m2(c["wipe"]) - 1.4, 1.4, 0.5), (m3(c["logo"]) - 0.9, 0.9, 0.5)],
        "bells": [(m3(c["tag"]), 74), (m3(c["url"]), 81)],
        "fade_out": (13.0, 15.0),
    }


def chord_at(chords, t):
    cur = chords[0][2]
    for t0, _, name, _ in chords:
        if t >= t0:
            cur = name
    return CH[cur]


def render(version):
    A = arrangement(version)
    dur = A["dur"]
    music = Bus(dur + 4)
    drums = Bus(dur + 4)
    fx = Bus(dur + 4)
    sends = Bus(dur + 4)  # envío a reverb

    for t0, d in A["drone"]:
        x = drone(d) * env_adsr(int(d * SR), 1.2, 1.5)[:, None]
        music.add(t0, x, db(-24))
        sends.add(t0, x, db(-28))

    for t0, d, name, cut in A["chords"]:
        x = pad(CH[name], d, cutoff=cut)
        music.add(t0, x, db(-9))
        sends.add(t0, x, db(-12))

    # arpegio de plucks, rejilla de corcheas alineada con la escena 3
    grid0 = 11.2 if version == "main" else A["plucks"][0][0]
    pattern = [0, 2, 1, 3, 2, 4, 3, 1]
    for a, b, g in A["plucks"]:
        k0 = int(np.ceil((a - grid0) / (BEAT / 2)))
        k = k0
        while True:
            t = grid0 + k * BEAT / 2
            if t >= b:
                break
            notes = chord_at(A["chords"], t)
            nt = notes[pattern[k % 8] % len(notes)] + 12
            vel = (1.0 if k % 2 == 0 else 0.62) * g
            x = pan(pluck(midi(nt), bright=1800 + 1400 * g), 0.35 * np.sin(k * 0.9))
            music.add(t, x, db(-21) * vel)
            k += 1

    for a, b, g in A["kicks"]:
        t = a
        while t < b - 1e-6:
            drums.add(t, pan(kick(), 0), db(-13) * g)
            t += BEAT
    for a, b, g in A["hats"]:
        t = a + BEAT / 2
        while t < b - 1e-6:
            drums.add(t, pan(hat(), 0.25), db(-33) * g)
            t += BEAT
    for a, b in A["claps"]:
        t = a + BEAT
        while t < b - 1e-6:
            x = pan(clap(), -0.1)
            drums.add(t, x, db(-25))
            sends.add(t, x, db(-22))
            t += 2 * BEAT

    # bajo: corcheas con bombeo (sidechain implícito: nota corta tras cada bombo)
    for a, b, g in A["sub"]:
        k = 0
        while True:
            t = a + k * BEAT / 2
            if t >= b:
                break
            root = chord_at(A["chords"], t)[0]
            while root > 45:
                root -= 12
            d = BEAT / 2 * 0.9
            v = sub(midi(root), d) * (0.55 if k % 2 == 0 else 1.0)
            music.add(t + (0.06 if k % 2 == 0 else 0), pan(v, 0), db(-17) * g)
            k += 1

    for t0, g in A["impacts"]:
        x = pan(impact(0.6 + g * 0.6), 0)
        fx.add(t0, x, db(-9) * g)
        sends.add(t0, x, db(-14) * g)
    for t_start, d, g in A["risers"]:
        x = riser(d)
        x = np.stack([x, np.roll(x, 331)], axis=1)
        fx.add(t_start, x, db(-24) * g)
        sends.add(t_start, x, db(-22) * g)
    for t0, nt in A["bells"]:
        x = pan(bell(midi(nt)), 0.15)
        music.add(t0, x, db(-21))
        sends.add(t0, x, db(-15))

    # el diente de sierra de los pads y plucks pasa por un retardo sutil
    music.x = delay(music.x, BEAT * 0.75, fb=0.3, mix=0.18)
    wet = convolve(sends.x, reverb_ir())
    mix = music.x + drums.x + fx.x + wet * 0.9
    mix = highpass(mix, 28, 2)

    # fundido final
    a, b = A["fade_out"]
    t = t_axis(len(mix))
    f = np.clip((b - t) / (b - a), 0, 1)
    mix *= (np.sin(f * np.pi / 2) ** 2)[:, None]
    mix = mix[: int(dur * SR)]

    # saturación suave + normalización de pico; la sonoridad final se fija con ffmpeg loudnorm
    mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.3) / np.tanh(1.3)
    return (mix * db(-1.0)).astype(np.float32)


def write_wav(path, x):
    import wave

    pcm = np.clip(x * 32767, -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", default="main", choices=list(TL["versions"].keys()))
    ap.add_argument("--out")
    a = ap.parse_args()
    out = pathlib.Path(a.out) if a.out else ROOT / f"audio/music_{a.version}_raw.wav"
    out.parent.mkdir(parents=True, exist_ok=True)
    write_wav(out, render(a.version))
    print(out)
