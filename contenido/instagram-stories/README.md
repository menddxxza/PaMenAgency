# Stories de Instagram · PaMenAgency

Material gráfico para Instagram (1080×1920). La estrategia de publicación está en
[`ESTRATEGIA.md`](./ESTRATEGIA.md).

```
stories.html   ← fuente editable de todas las stories (ábrelo en el navegador para ver la galería)
render.mjs     ← exporta stories.html a PNG y MP4
assets/        ← tu foto: assets/foto-fundador.jpg (vertical, mín. 1280 px de alto)
png/           ← imágenes listas para subir
video/         ← versiones animadas (6 s, MP4 H.264)
```

## Series

| Serie | Archivos | Destacada |
|---|---|---|
| A · Quiénes somos | `01`–`04` | Nosotros |
| B · Sobre mí | `05`–`08` | Sobre mí |
| C · Qué hacemos | `09`–`13` | Servicios |
| D · Dudas | `14`–`19` | Dudas |
| Portadas de destacadas | `20`–`23` | — |

Los recuadros discontinuos (A4 y D6) marcan dónde poner el sticker de enlace o de preguntas
dentro de Instagram.

## Cambiar textos o añadir tu foto

1. Guarda tu foto como `assets/foto-fundador.jpg`.
2. Edita el texto en `stories.html` (cada story es un `<template data-id="…">`).
3. Regenera:

```bash
node render.mjs                          # todo (PNG + MP4)
node render.mjs --png                    # solo PNG, mucho más rápido
node render.mjs b1-quien-esta-detras     # solo una story
```

Necesitas Node 18+, Playwright con Chromium y `ffmpeg`.
