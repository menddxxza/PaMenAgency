# Reels de Instagram de PaMen Agency — archivo único

> **Para Claude Code:** este archivo lo contiene todo: contexto, reglas, método, código del renderizador, plantilla y catálogo. Léelo entero antes de hacer nada. Tu trabajo es **producir reels virales uno detrás de otro, todos con el "Estilo de la casa"; al terminar cada uno, ábreselo al usuario y pregúntale si sigue con el siguiente** (ver "Bucle de producción").

Esta carpeta es la **fábrica de reels** de PaMen Agency (pamenagency.com), una agencia de automatización con IA para negocios pequeños: respuestas automáticas por WhatsApp, Instagram y web, agenda de citas, recordatorios y seguimiento de clientes.

Aquí solo se hacen **vídeos**. Cada reel es una página HTML animada que se renderiza frame a frame a MP4 4K. Todo el texto de los vídeos va en **español de España**: tuteo, "vosotros" y expresiones como "currar" o "flipar" con moderación.

## Reglas del dueño (obligatorias)

1. **Solo vídeos.** No toques las apps del repo (notiq, nexorai, leadscope, iapyme…), ni Vercel, ni PRs, salvo que el usuario lo pida. Haz un vídeo de una app concreta solo si lo pide.
2. **Todo es contenido viral:**
   - **Gancho en el primer segundo:** texto grande en pantalla desde el frame 0-0,3 s.
   - **Duración:** 10-13 s.
   - **Formatos:** meme o nativos de TikTok/Reels.
   - **Humor:** identificable para el dueño de un negocio.
   - **Subtítulos:** estilo TikTok (caja clara, texto negro, negrita). En el estilo de la casa: caja crema `#f2ece2`, Anton negro en mayúsculas.
   - **Doble CTA al final:** comentar "IA" y además otra cosa: comentar un número, etiquetar a alguien, mandárselo a alguien o guardar.
3. **Cada vídeo debe ser distinto a todos los anteriores en formato y concepto, pero todos comparten el "Estilo de la casa"** (desde el Reel 25, ver abajo). Motion design de verdad: cámara, 3D, máscaras, partículas, trazos SVG, transiciones con golpe. Mira el catálogo antes de elegir.
4. **4K (2160x3840) a 60 fps siempre.** Nada de 120 fps: no compensa.
5. **No inventes datos presentados como reales.** Si usas cifras, márcalas como ejemplo o avisa al usuario para que ponga una fuente. En los memes, los números de likes y similares son ficción y se nota.
6. Cuando termines un vídeo, **ábreselo al usuario** (`Start-Process "<ruta completa del MP4>"` en Windows) y **pregúntale si sigue con el siguiente**. No encadenes reels sin su confirmación.

## Estilo de la casa (obligatorio desde el Reel 25)

Referencia: la película vertical de MecaPro (`Proyectos claude/MecaPro-pelicula-vertical-4K-60fps.mp4`, fuente en `Proyectos claude/mecapro-launch-film/index.html`). El dueño quiere que **todos los reels se parezcan a ese lenguaje de motion graphics, pero sin copiarlo**: cada reel tiene su propio formato, concepto y elementos.

- **Paleta:** fondo negro cálido `#0b0a09`, texto crema `#f2ece2`, texto secundario `rgba(242,236,226,.52)`, **un único acento rojo `#ff3d1f`**. Nada de gradientes de colores ni paletas nuevas por reel.
- **Atmósfera:** resplandor radial rojo suave en el centro + **grano de película** (canvas con 4 fotogramas de ruido deterministas que se alternan, opacidad ~0,06) + viñeta roja en los golpes.
- **HUD fijo de cine:** esquinas de encuadre; arriba a la izquierda "PAMEN AGENCY 2026" + descripción en mono + cuadraditos de progreso; arriba a la derecha **timecode que corre** (`TC 00:00:SS:FF`) y "9:16 / 60 FPS"; abajo "0N — CAPÍTULO" y "PaMenAgency × Reels". El reel se divide en capítulos con nombre.
- **Tipografía:** titulares **Anton** en mayúsculas, `line-height:.95`, que **suben desde una máscara** (`overflow:hidden` + `translateY(105% → 0)`) con una copia roja desenfocada detrás (halo), frases cortas **con punto final** y la segunda línea en rojo. Etiquetas y datos en **JetBrains Mono** mayúsculas con `letter-spacing:.2em`. Marca y botones en **Inter Tight 500**.
- **Recursos de movimiento:** líneas que se dibujan desde el centro, tarjetas UI oscuras (`#131110`, borde `rgba(242,236,226,.1)`, radio 18) que se abren desde una línea, trazos SVG con estela desenfocada y punto de cabeza, nodos que se encienden con check dibujado, contadores con frenada y nota "cifra ilustrativa, no son datos reales", anillos y rayos que estallan, flashes con caída exponencial, golpes de cámara (sacudida, punch-in con `transform-origin` en el punto de interés). Una idea por plano, mucho espacio negativo.
- **Cierre:** marca "PaMenAgency" revelada de izquierda a derecha, titular "COMENTA “IA”." y botón píldora rojo con el segundo CTA.
- **Base de código:** parte de `fuente-bolsa/reel25.html` (HUD, grano, helpers `P/eOut/eIO/eBack/rise`, titulares con máscara, flash). Todo se calcula en `seek(t)` en función de `t`.
- **No copiar literalmente** escenas de la referencia (nube de iconos que forma un globo, filas diagonales rojas a pantalla completa, buscador que se convierte en dashboard): inspírate, no las repitas.
- **Trampas:** el halo desenfocado de un titular escondido asoma por el borde de su máscara: pon `visibility:hidden` cuando su progreso sea 0 (ya lo hace `rise()` en la base). En Anton las comillas angulares se ven como dos signos de menor/mayor: usa “ ”. El grano infla mucho el MP4: si pasa de ~95 MB (GitHub rechaza archivos de más de 100 MB), recomprime con `ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -movflags +faststart -c:a copy out.mp4` (el Reel 25 bajó de 103 a 58 MB sin pérdida visible).

## Estructura

```
marketing/instagram/
  CLAUDE.md                     ← este archivo (lo único que hace falta)
  tools/render4k.cjs            ← renderizador: créalo con el código del final de este archivo
  tools/plantilla.html          ← esqueleto de reel: créalo con el código del final de este archivo
  tools/package.json            ← dependencia: playwright (código al final)
  reel-<slug>[-4k-60fps].mp4    ← vídeos finales
  portada-<slug>[-4k].jpg       ← portada (un frame del vídeo)
  fuente-<slug>/                ← fuente de cada reel: reelNN.html + fonts/
```

## Puesta en marcha (una vez)

Si no existe `marketing/instagram/tools/`, créala con los tres archivos del apartado "Código" (al final). Después:

```bash
cd marketing/instagram/tools
npm install
npx playwright install chromium
ffmpeg -version     # si no está: winget install ffmpeg | brew install ffmpeg | apt install ffmpeg
```

## Bucle de producción (lo que haces siempre)

### Antes de empezar

1. Lee este archivo entero: reglas del dueño, método, trampas conocidas y **catálogo** de reels ya hechos.
2. Comprueba que el entorno está listo: `marketing/instagram/tools/node_modules/playwright` existe y `ffmpeg -version` responde. Si falta algo, ejecuta la "Puesta en marcha". Si no puedes instalarlo tú, díselo al usuario en una línea.
3. Si el usuario pide un tema, un formato o una app concreta, úsalo para el primer reel. Si no, elige tú.

### Bucle

Para cada reel:

1. **Elige formato y concepto nuevos.** Mira el catálogo y la lista de ideas sin usar. El formato viral tiene que ser distinto de todos los anteriores; el estilo visual es siempre el de la casa. Decide el guion en una línea y díselo al usuario en una frase: "Reel NN: <formato> — <concepto>".
2. **Construye** `marketing/instagram/fuente-<slug>/reelNN.html` a partir de `fuente-bolsa/reel25.html` (base del estilo de la casa; copia también sus `fonts/`):
   - gancho visible en 0-0,3 s
   - 10-13 s en total
   - subtítulos en caja blanca
   - marca PAMEN AGENCY visible
   - doble CTA al final (comenta "IA" + número/etiqueta/compartir/guardar)
3. **Verifica con stills** (6-8 momentos clave) y **mira los PNG**. Corrige todo lo que se salga, se pise o no se lea. No renderices hasta que los stills estén bien.
4. **Renderiza en 4K 60 fps** en una carpeta temporal fuera del repo y en segundo plano. Mientras renderiza, ve pensando el siguiente reel. Comprueba con ffprobe que sale 2160x3840, 60 fps y la duración correcta.
5. **Guarda:**
   - mueve el MP4 a `marketing/instagram/reel-<slug>-4k-60fps.mp4`
   - genera `portada-<slug>-4k.jpg`
   - añade la fila al catálogo de este archivo (y tacha la idea si venía de la lista)
6. **Commit y push** de los archivos de ese reel con el mensaje "Añade Reel NN '<título>' en 4K a 60 fps". No abras PRs ni toques nada fuera de `marketing/instagram`.
7. **Entrega**: abre el MP4 al usuario (`Start-Process "<ruta completa>"`) y pásale el "Formato de entrega" de este archivo: ruta del archivo, caption, hashtags, comentario fijado y nota de audio.
8. **Pregunta si sigue con el siguiente reel.** Solo cuando diga que sí, vuelve al paso 1.

Si se te acaba el turno o el contexto a mitad de un reel, al volver retómalo donde estaba: mira qué hay en `marketing/instagram` y en el catálogo.

### Calidad mínima de cada reel

- Movimiento en todo momento: nada de pantallas estáticas más de ~0,6 s. Usa easing con rebote para entradas, golpes de escala o sacudida en los momentos clave, y transiciones con intención (máscaras, giros 3D, barridos, zoom de cámara).
- Legible en móvil: texto principal ≥ 52 px en el lienzo de 1080, buen contraste y nada en los 250 px inferiores que tape la interfaz de Instagram. Lo importante entre y = 150 y y = 1600.
- Español natural, frases cortas, humor de dueño de negocio, sin datos inventados presentados como reales.

## Cómo se construye un reel

- Lienzo CSS de **1080x1920**. El renderizador usa `deviceScaleFactor: 2`, así que sale en 4K nítido (vectores re-renderizados, no un reescalado).
- Toda la animación se hace con la **Web Animations API**, en pausa. `seek(t)` pone el `currentTime` de todas las animaciones. La página expone `window.TOTAL` y `window.seek`. Con `?render` en la URL se queda quieta; sin él, se reproduce en bucle en el navegador para previsualizar. Parte siempre de `tools/plantilla.html`.
- Lo que se calcula por frame (partículas, canvas, contadores) se hace dentro de `seek(t)` y **solo en función de `t`**. Para lo aleatorio, usa el PRNG con semilla `seed = seed*16807 % 2147483647`. Nunca uses `Math.random` ni `Date`.
- Fuentes: descárgalas de Google Fonts a `fonts/Nombre.font`. Para sacar la URL del .ttf: `curl -s "https://fonts.googleapis.com/css2?family=Anton" | grep -o 'https://[^)]*'`.
  - Estilo de la casa: Anton, JetBrains Mono, Inter Tight (en `fuente-bolsa/fonts/`).
  - Fuentes de reels anteriores al estilo de la casa: Archivo Black, Caveat, Permanent Marker, Press Start 2P, VT323, Cinzel, Bebas Neue, Luckiest Guy, Fredoka, Space Grotesk, Lilita One, Teko, IBM Plex Mono, Bowlby One.
  - Puedes copiar las fuentes de otra carpeta `fuente-*/fonts`.

### Trampas conocidas (ya nos han pasado)

- **Fill de las animaciones:**
  - Animaciones de **salida**: `fill:"forwards"`. Con `"both"` el estado final se aplica desde el segundo 0 y el elemento desaparece antes de tiempo.
  - Pulsos o sacudidas puntuales: `fill:"none"`.
- **Visibilidad de escenas:** usa *una sola* animación de `visibility` por elemento, con `fill:"none"`. Dos animaciones se pisan.
- **Elementos hijos:** no pongas `style.visibility="visible"` en un hijo, porque se muestra aunque el padre esté oculto. Usa `""` u `opacity`.
- **Transformaciones que se pisan:** si dos animaciones tocan `transform`, la última gana. Separa con las propiedades `translate`, `scale` y `rotate` (por ejemplo, la sacudida en `translate` y el giro en `transform`).
- **3D:** el tamaño aparente depende de `perspective - translateZ`. Con `backface-visibility` las caras salen espejadas o invisibles. Mejor cambia de cara a mano en `seek()` cuando la tarjeta está de canto.
- **IDs:** `getElementById("id")`, sin `#`.
- **Texto que no cabe:**
  - Revisa siempre los stills: emojis que saltan de línea, textos que se salen, sellos que tapan cosas, máscaras que dejan ver bordes.
  - Texto claro sobre fondo claro (o al revés): la marca tiene que leerse en todas las escenas.
- **Archivos a medias:** renderiza siempre en una carpeta temporal fuera del repo y mueve el MP4 al acabar. Así nunca se queda un MP4 a medio escribir dentro del repo.

## Flujo de producción de un reel

1. **Idea:** elige un formato viral que **no** esté en el catálogo (el estilo visual es siempre el de la casa). Escribe guion, capítulos, tiempos y CTA.
2. **HTML:** `fuente-<slug>/reelNN.html` (NN = siguiente número) + `fuente-<slug>/fonts/`.
3. **Stills de control** en los momentos clave (gancho, cada escena, CTA):
   ```bash
   node tools/render4k.cjs fuente-<slug>/reelNN.html --stills /tmp/stillsNN "0.3,2,4.5,7,9.5,11.8"
   ```
   Míralos de verdad (lee los PNG) y corrige hasta que todo encaje.
4. **Render** (tarda unos 15-20 min; lánzalo en segundo plano y mientras tanto ve pensando el siguiente):
   ```bash
   node tools/render4k.cjs fuente-<slug>/reelNN.html /tmp/reel-<slug>-4k-60fps.mp4
   ffprobe -v error -show_entries stream=width,height,r_frame_rate -show_entries format=duration /tmp/reel-<slug>-4k-60fps.mp4
   ```
   Tiene que dar 2160x3840, 60/1 y la duración esperada.
5. **Mover y portada:**
   ```bash
   mv /tmp/reel-<slug>-4k-60fps.mp4 marketing/instagram/
   ffmpeg -y -ss <segundo bonito> -i reel-<slug>-4k-60fps.mp4 -frames:v 1 -q:v 2 portada-<slug>-4k.jpg
   ```
   Copia también `tools/render4k.cjs` dentro de `fuente-<slug>/` si quieres que la carpeta sea autónoma.
6. **Catálogo:** añade la fila del reel nuevo a la tabla de abajo.
7. **Git:** `git add` del MP4, la portada, la carpeta fuente y CLAUDE.md. Commit en español ("Añade Reel NN '<título>' en 4K a 60 fps") y push a la rama actual.
8. **Entrega al usuario:** ruta del MP4 y texto listo para pegar (ver formato abajo).

### Formato de entrega (texto para la publicación)

```
🎬 Reel NN · <título>
Formato: <formato viral> · Estilo: <estilo visual> · <duración> s · 4K 60 fps
Archivo: marketing/instagram/reel-<slug>-4k-60fps.mp4

Caption:
<2-4 líneas con gancho, emojis y CTA doble>

Hashtags:
#ia #inteligenciaartificial #automatizacion #negocios #emprendedores #pymes #marketingdigital #<3-5 del tema>

Primer comentario fijado: <pregunta para provocar comentarios>
Audio: usa un audio en tendencia de Instagram (el MP4 lleva una pista muda)
```

## Catálogo: reels ya hechos (NO repetir formato ni estilo)

| # | Archivo / carpeta | Formato | Estilo visual |
|---|---|---|---|
| 1 | reel-para-de-scrollear · `fuente` | Interrupción "para de scrollear" + CTA web/comenta IA | Tipografía cinética Anton, interrogaciones volando, bloques de color |
| 2 | reel-3-senales-ia · `fuente-3-senales` | Lista "3 señales de que tu negocio necesita IA" | Números gigantes que entran por pasos, "lee hasta el final" |
| 3 | reel-problema-solucion · `fuente-problema-solucion` | Problema → solución | Dos actos con cambio de color rojo/verde y gráfica que cae |
| 4 | reel-mito-vs-realidad · `fuente-mito-vs-realidad` | Mito vs realidad | Tarjetas ✕ MITO / ✓ REALIDAD que se tachan y se sustituyen |
| 5 | reel-dato-shock · `fuente-dato-shock` | Dato que duele | Contadores de porcentaje enormes (cifras ilustrativas) |
| 6 | reel-tutorial-3-pasos · `fuente-tutorial-3-pasos` | Tutorial en 3 pasos | Barra de progreso "paso X de 3" + checklist final |
| 7 | reel-antes-despues · `fuente-antes-despues` | Antes / después | Pantalla partida con cortinilla y anillo SVG que se dibuja |
| 8 | reel-pov-3am · `fuente-pov-3am` | POV: son las 3 a. m. y tu negocio vende | Mock de móvil con chat de WhatsApp y notificaciones, modo noche |
| 9 | reel-haz-la-cuenta · `fuente-haz-la-cuenta` | Haz la cuenta (horas perdidas) | Calculadora/tabla con contadores que suben hasta el total |
| 10 | reel-competencia-ia · `fuente-competencia-ia` | Alerta: tu competencia ya usa IA | Terminal hacker, glitch, cintas de aviso repetidas |
| 11 | reel-5-cosas-ia · `fuente-5-cosas-ia` | 5 cosas que la IA hace por ti | Número 5 gigante, tarjetas en ráfaga, cinta marquesina "COMENTA IA" |
| 12 | reel-piloto-automatico · `fuente-piloto-automatico` | ¿Y si funcionara en piloto automático? | Panel de control/dashboard con interruptores que se activan |
| 13 | reel-cuaderno-clientes · `fuente-cuaderno-clientes` | Cómo consigues clientes mientras trabajas | Cuaderno a mano: Caveat/Permanent Marker, flechas y trazos dibujados |
| 14 | reel-version-2-0 · `fuente-version-2-0` | Tu negocio versión 2.0 | Viaje de cámara 3D por tarjetas en el espacio, warp de estrellas en canvas |
| 15 | reel-escritorio-retro · `fuente-escritorio-retro` | Instalando IA en tu negocio | Escritorio retro tipo Windows 95 (Press Start 2P/VT323), instalador con barra |
| 16 | reel-trailer · `fuente-trailer` | Tráiler de película | Cinemático: bandas negras, Cinzel dorado, polvo, destellos, grano, créditos (17 s) |
| 17 | reel-nadie-absolutamente-nadie · `fuente-nadie-absolutamente-nadie` | Meme "POV: tienes un negocio" estilo tuit | Tuit/respuesta con likes que se disparan, reacciones (11 s) |
| 18 | reel-red-flags · `fuente-red-flags` | Red flags de tu negocio (comenta cuántas tienes) | Swipe estilo Tinder: cartas con sello RED FLAG, la última GREEN FLAG |
| 19 | reel-starter-pack · `fuente-starter-pack` | Starter pack: dueño de negocio sin IA vs con IA | Collage meme con stickers que caen, tarjeta que gira en 3D, sellos |
| 20 | reel-teletienda-ia · `fuente-teletienda-ia` | Falso anuncio de teletienda | Teletienda retro: piloto "EN DIRECTO", estallidos cómicos SVG, sello "¡OFERTA ESPECIAL!", precio tachado, testimonio ficticio, ticker inferior (12,5 s) |
| 21 | reel-negocio-wrapped · `fuente-negocio-wrapped` | "Spotify Wrapped" del negocio | Tarjetas de gradiente a pantalla completa estilo Wrapped, contador animado, anillo de progreso SVG, confeti determinista, tipografía Fredoka/Space Grotesk (12,2 s) |
| 22 | reel-test-necesitas-ia · `fuente-test-necesitas-ia` | Test "¿Necesitas IA?" con puntuación | Quiz estilo Kahoot: tarjetas con giro 3D de cámara (perspective + rotate Y), checkmark SVG que se dibuja, ráfagas de partículas deterministas, flash de cámara en los cortes clave, marcador de puntos en vivo (12,4 s) |
| 23 | reel-top3-podio · `fuente-top3-podio` | Top 3 cosas que la IA te quita de encima | Ranking/podio animado: escenario oscuro con focos giratorios, columnas que se elevan en 3D (perspective + rotateX), confeti determinista en el nº1, cámara que retrocede para el plano general, cortina oscura tras el podio para el CTA (12,6 s) |
| 24 | reel-ticket-sin-ia · `fuente-ticket-sin-ia` | Ticket de compra que se imprime ("lo que te cuesta no automatizar") | Impresora térmica: el ticket sale por la ranura con máscara y paso a paso, cámara que se aleja siguiendo el papel, sello que golpea con sacudida, ticket arrancado que sale volando en 3D, flash, segundo ticket "con IA" con rotulador SVG, cupón recortable con borde de hormigas para el CTA. IBM Plex Mono + Bowlby One (12,4 s) |
| 25 | reel-bolsa · `fuente-bolsa` | Si tu negocio cotizara en bolsa (gráfica de bolsa) | **Primer reel con el estilo de la casa.** Línea que se abre en tarjeta de cotización, trazo rojo con estela que cae con cada mensaje sin responder (sacudida + viñeta), nodo "IA activada" con anillos, rayos y punch-in de cámara, rebote con contador, cierre con marca, "COMENTA “IA”." y botón rojo (12,6 s) |

### Ideas de formatos virales aún sin usar

- "Cosas que dice un dueño de negocio" en bocadillos.
- "Expectativa vs realidad".
- "Nivel 1 / nivel 100".
- "Tier list" de tareas para automatizar.
- "Si tu negocio fuera una peli de terror".
- "Elige: ¿A o B?" (encuesta).
- Notificaciones del móvil bajo la lluvia.
- "Dime tu sector y te digo qué automatizar".
- "Mi jefe vs la IA".
- Videojuego retro (barra de vida, nivel superado).
- Telediario de última hora.
- Mapa del tesoro.
- "Lo que veo vs lo que ve mi cliente".

Táchalas al usarlas.

## Código

### tools/package.json
```json
{
  "name": "pamen-reels-tools",
  "private": true,
  "description": "Renderizador 4K de los reels de PaMen Agency",
  "dependencies": {
    "playwright": "^1.56.0"
  }
}
```

### tools/render4k.cjs
```js
// Renderizador de reels de PaMen Agency (4K 2160x3840, 60 fps, H.264 + pista de audio muda).
//
//   Vídeo:   node render4k.cjs ruta/reel.html salida.mp4
//   Stills:  node render4k.cjs ruta/reel.html --stills carpeta "0.5,2,4.8,9"
//
// La página debe exponer window.TOTAL (segundos) y window.seek(t), y quedarse quieta con ?render.
// Requisitos: npm i (en esta carpeta), npx playwright install chromium, ffmpeg en el PATH.
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

(async () => {
  const [, , htmlArg, a, b, c] = process.argv;
  if (!htmlArg || !a) { console.log("uso: node render4k.cjs reel.html salida.mp4 | --stills carpeta \"t1,t2\""); process.exit(1); }
  const html = path.resolve(htmlArg);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(html).href + "?render");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const T = await page.evaluate(() => window.TOTAL);

  if (a === "--stills") {
    const dir = path.resolve(b); fs.mkdirSync(dir, { recursive: true });
    const times = c.split(",").map(Number); let i = 0;
    for (const t of times) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: path.join(dir, `s${i++}.png`) }); }
    await browser.close(); console.log(`${times.length} stills en ${dir}`); return;
  }

  const out = path.resolve(a), FPS = 60, N = Math.round(T * FPS);
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", out],
    { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise(r => ff.on("close", r));
  const write = buf => new Promise(r => (ff.stdin.write(buf) ? r() : ff.stdin.once("drain", r)));
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => window.seek(t), i / FPS);
    await write(await page.screenshot({ type: "jpeg", quality: 95 }));
    if (i % 240 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await done; await browser.close();
  console.log("hecho", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
})();
```

### tools/plantilla.html
```html
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Reel NN PaMen</title>
<style>
/* Copia las fuentes que uses a ./fonts (ver CLAUDE.md, apartado Fuentes) */
@font-face { font-family: "Anton"; src: url("fonts/Anton.font") format("truetype"); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#111; }
#stage { position:relative; width:1080px; height:1920px; overflow:hidden; font-family:"Inter", Arial, sans-serif; color:#fff; }
#brand { position:absolute; top:70px; left:0; right:0; text-align:center; font-weight:900; font-size:26px; letter-spacing:.35em; opacity:.85; }
/* subtítulo estilo TikTok: caja blanca, texto negro */
.cap { position:absolute; left:0; right:0; top:190px; display:flex; justify-content:center; z-index:20; }
.cap span { background:#fff; color:#000; font-weight:900; font-size:56px; line-height:1.16; padding:14px 30px; border-radius:22px; text-align:center; }
</style>
</head>
<body>
<div id="stage">
  <div id="brand">PAMEN AGENCY</div>
  <div class="cap" id="cap"><span>Gancho en el primer segundo 👀</span></div>
</div>

<script>
const T = 12.0;                       // duración total en segundos (10-13 s)
const A = [];
const $ = id => document.getElementById(id);
// anim(elemento|id, keyframes, inicio s, duración s, easing, fill). Salidas: fill "forwards"; pulsos: "none".
function anim(id, kf, start, dur, easing = "cubic-bezier(.16,1,.3,1)", fill = "both") {
  const el = typeof id === "string" ? $(id) : id;
  const a = el.animate(kf, { duration: dur * 1000, delay: start * 1000, fill, easing });
  a.pause(); A.push(a);
}
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // aleatorio determinista

anim("cap", [{ opacity: 0, transform: "scale(.7)" }, { opacity: 1, transform: "scale(1)" }], 0, .3, "cubic-bezier(.34,1.56,.64,1)");

function seek(t) {
  for (const a of A) a.currentTime = t * 1000;
  // aquí lo que dependa de t frame a frame (partículas, canvas…), siempre en función de t, nunca de Date/Math.random
}
window.seek = seek;
window.TOTAL = T;

if (!location.search.includes("render")) {
  const t0 = performance.now();
  (function loop() { seek(((performance.now() - t0) / 1000) % T); requestAnimationFrame(loop); })();
} else seek(0);
</script>
</body>
</html>
```
