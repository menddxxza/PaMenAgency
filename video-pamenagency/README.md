# PaMenAgency — anuncio vertical «La IA no sustituye tu capacidad. La multiplica con criterio.»

Pieza publicitaria de 35 s para Instagram Reels y TikTok, construida íntegramente
con código: animación, tipografía, música y exportación. Es reproducible y no usa
metraje, imágenes ni música de terceros.

## Identidad de marca

Tomada de la web de PaMenAgency que vive en este repositorio
(rama `claude/pamenagency-website-djp4ol`, carpeta `pamenagency/web`):

- **Logotipo original** (`public/logo.jpg`): monograma «PM» dorado en círculo. Se usa
  tal cual, sólo recortado al círculo como hace la web (`assets/logo/`).
- **Tipografía:** Space Grotesk (titulares y marca) e Inter (texto), las mismas de la web.
- **Color:** negro `#050506`, dorados `#D4AF37` / `#F0D680` / `#8A6F1E`, texto `#F4F4F2`
  (`src/styles/tokens.css` de la web).
- **Marca tipográfica:** «PAMEN» en blanco + «AGENCY» en degradado dorado, como en la web.
- **Claim:** «Convierte la IA en una ventaja real», coherente con el de la web
  («Convierte la Inteligencia Artificial en una ventaja real»).
- **Servicios:** automatización, asistentes de IA, creación digital, integración y
  estrategia de IA figuran en `src/content/services.ts` de la web; el anuncio no
  menciona nada fuera de eso.

## Entregables (`renders/`)

| Archivo | Qué es |
|---|---|
| `pamenagency_reel_35s_sin_subtitulos.mp4` | **Vídeo principal.** 1080×1920, 30 fps, H.264 High + AAC 48 kHz, Rec.709, 35 s, con música original. |
| `pamenagency_reel_15s.mp4` | Adaptación de 15 s para anuncios cortos: problema (0–4,2 s) → solución (4,2–7,6 s) → cierre con la URL legible ~3,5 s. Mismas especificaciones, música propia remontada. |
| `pamenagency_portada_1080x1920.png` | Portada vertical (contenido clave dentro del recorte 3:4 de la cuadrícula del perfil). |

La versión **con voz en off y la versión con subtítulos integrados** se generan con
un solo comando en cuanto exista la locución (ver «Pendiente»).

## Guion visual

| Tiempo | Escena | Texto en pantalla |
|---|---|---|
| 0–5,2 s | **El problema.** Oscuridad, un monitor se enciende: una lista de tareas repetitivas que no se acaba. Persona de espaldas a contraluz, desenfocada. El foco pasa de la pantalla al mensaje. | Tu empresa no necesita trabajar más horas. / Necesita trabajar **mejor.** |
| 5,2–11,2 s | **La oportunidad.** Las tareas se sueltan de la pantalla y flotan desordenadas; se alinean, se completan una a una y se funden en una sola línea dorada. | Menos tareas repetitivas. / Más tiempo para lo que realmente **importa.** |
| 11,2–20,2 s | **La solución.** La línea se abre como un telón de luz. Aparece el logotipo. La cámara desciende por un hilo dorado que conecta tres ideas dibujadas a trazo: un ciclo que se cierra solo, web + app, y una decisión entre varios caminos. | Diseñamos soluciones de IA para **problemas reales.** / Automatización / Soluciones **digitales** / Inteligencia artificial **con criterio** |
| 20,2–27 s | **Posicionamiento.** Un horizonte negro con borde de luz dorada sube y se intensifica con la música; el logotipo permanece arriba. | La tecnología es una herramienta. / Saber cómo utilizarla **es la ventaja.** |
| 27–35 s | **Cierre.** Entrada diseñada para el logotipo (apertura circular desde el centro, enfoque y un único reflejo), seguida de la marca «PAMEN AGENCY» con letras que convergen desde el desenfoque, filete dorado, claim y llamada a la acción. Se mantiene ~4 s legible. | PAMEN AGENCY / Convierte la IA en una **ventaja real.** / Descubre lo que podemos mejorar en tu empresa. / pamenagency.com |

En **negrita**, las palabras que van en dorado. Sin teléfonos, direcciones, ofertas, cifras, testimonios ni clientes.

## Cómo está construido

```
video-pamenagency/
├── assets/
│   ├── fonts/        Space Grotesk + Inter (Google Fonts, SIL OFL 1.1, licencias incluidas)
│   └── logo/         logotipo original + versión recortada con transparencia (ver LEEME.md)
├── audio/
│   ├── music_main.wav / music_short15.wav   música original normalizada (-14 LUFS, -1,5 dBTP)
│   └── voz/          guion de locución cronometrado, SRT y ASS de subtítulos
├── src/
│   ├── timeline.json  tiempos de escenas, entradas de texto y montajes (35 s y 15 s)
│   ├── scene.html/js  motor de escena Canvas 2D determinista: renderFrame(t)
│   ├── render.mjs     Chromium headless (Playwright) → PNG por fotograma → FFmpeg
│   ├── music.py       síntesis de la banda sonora (numpy + scipy)
│   ├── loudnorm.sh    normalización EBU R128 en dos pasadas
│   ├── srt2ass.py     subtítulos con estilo de marca y zona segura
│   └── mix_vo.sh      integra la voz en off (ducking de música + versiones con voz)
└── renders/           salidas finales
```

- **Imagen:** cada fotograma se dibuja en un `<canvas>` de 1080×1920 a partir del
  tiempo exacto, por lo que el render es idéntico en cada ejecución. Chromium se usa
  sólo como rasterizador (tipografía con antialiasing de calidad, desenfoques reales,
  degradados). No es una web que «simula» un vídeo: el resultado es un MP4 codificado
  con FFmpeg.
- **Música:** compuesta y sintetizada por código (pads, arpegio, bajo, percusión
  mínima, subidas y golpes sincronizados con los mensajes, reverb por convolución).
  No contiene muestras de terceros: se puede usar comercialmente sin licencias.
- **Color:** sRGB → Rec.709 (BT.709 en matriz, primarios y transferencia; rango limitado).
- **Zonas seguras:** todos los textos quedan entre y≈300 y y≈1430 px y dentro de
  ±450 px del centro, fuera de las zonas ocupadas por la interfaz de Reels/TikTok.

## Dependencias

- Node.js ≥ 18 y Playwright con Chromium (se usa el Playwright instalado globalmente si no hay uno local).
- FFmpeg con libx264, AAC y libass.
- Python 3 con `numpy` y `scipy` (`pip install numpy scipy`).

## Volver a renderizar

Desde `video-pamenagency/`:

```bash
# 1. Música
python3 src/music.py --version main
src/loudnorm.sh audio/music_main_raw.wav audio/music_main.wav
python3 src/music.py --version short15
src/loudnorm.sh audio/music_short15_raw.wav audio/music_short15.wav

# 2. Vídeo principal (≈10 min con 4 núcleos)
node src/render.mjs --version main --audio audio/music_main.wav \
  --out renders/pamenagency_reel_35s_sin_subtitulos.mp4

# 3. Versión de 15 s y portada
node src/render.mjs --version short15 --audio audio/music_short15.wav \
  --out renders/pamenagency_reel_15s.mp4
node src/render.mjs --cover renders/pamenagency_portada_1080x1920.png

# Fotogramas sueltos para revisar (se guardan en .cache/stills)
node src/render.mjs --stills 2,8,16,24,32

# Retocar sólo un tramo (tras un render completo) o sólo volver a codificar
node src/render.mjs --version main --from 14.5 --to 21 --audio audio/music_main.wav \
  --out renders/pamenagency_reel_35s_sin_subtitulos.mp4
node src/render.mjs --version main --encode-only --crf 19 --audio audio/music_main.wav \
  --out renders/pamenagency_reel_35s_sin_subtitulos.mp4
```

La versión de 15 s se define en `timeline.json` (`versions.short15`): segmentos del
montaje, fundido final y `cueOverrides`, que adelantan el claim y la URL para que
se lean el tiempo suficiente.

Para cambiar textos o tiempos: los textos están en `src/scene.js` (constantes `S1A`,
`S2B`, `CONCEPTS`, `S5TAG`…) y los tiempos en `src/timeline.json` (la música los lee
del mismo archivo, así que los golpes siguen sincronizados).

## Pendiente (requiere intervención)

1. **Logotipo en alta resolución (opcional).** El original disponible mide 507×485 px;
   el vídeo lo muestra a 300 px como máximo, así que no se amplía. Si existe una versión
   mayor, sustitúyela en `assets/logo/logo.png` y vuelve a renderizar.
2. **Voz en off.** No había un motor de voz neuronal en español peninsular disponible
   en el entorno y una voz robótica habría restado calidad. Guion cronometrado y
   dirección de locución en `audio/voz/GUION_VOZ_EN_OFF.md`. Con el WAV grabado:
   `src/mix_vo.sh audio/voz/voz_en_off.wav` genera la mezcla (música atenuada bajo la
   voz) y las versiones **con voz** y **con voz + subtítulos integrados**. El script
   está probado con una señal de prueba; falta sólo la locución real.
3. **Revisión de la web publicada.** La identidad y los servicios se han tomado del código
   de la web en este repositorio; pamenagency.com no era accesible desde el entorno, así
   que conviene confirmar que la versión publicada coincide.
4. **Escucha final.** El audio se ha verificado por medición (sonoridad, picos,
   espectrograma, sincronía de golpes), no de oído: revisa la mezcla en altavoces
   y móvil antes de publicar.
