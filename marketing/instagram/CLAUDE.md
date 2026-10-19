# Reels de Instagram de PaMen Agency

Esta carpeta es la **fábrica de reels** de PaMen Agency (pamenagency.com), una agencia de automatización con IA para negocios pequeños: respuestas automáticas por WhatsApp, Instagram y web, agenda de citas, recordatorios y seguimiento de clientes.

Aquí solo se hacen **vídeos**. Cada reel es una página HTML animada que se renderiza frame a frame a MP4 4K. Todo el texto de los vídeos va en **español de España**: tuteo, "vosotros" y expresiones como "currar" o "flipar" con moderación.

## Reglas del dueño (obligatorias)

1. **Solo vídeos.** No toques las apps del repo (notiq, nexorai, leadscope, iapyme…), ni Vercel, ni PRs, salvo que el usuario lo pida. Haz un vídeo de una app concreta solo si lo pide.
2. **Todo es contenido viral:**
   - **Gancho en el primer segundo:** texto grande en pantalla desde el frame 0-0,3 s.
   - **Duración:** 10-13 s.
   - **Formatos:** meme o nativos de TikTok/Reels.
   - **Humor:** identificable para el dueño de un negocio.
   - **Subtítulos:** estilo TikTok (caja blanca, texto negro, negrita).
   - **Doble CTA al final:** comentar "IA" y además otra cosa: comentar un número, etiquetar a alguien, mandárselo a alguien o guardar.
3. **Cada vídeo debe ser distinto a todos los anteriores**, tanto en formato como en estilo visual. Usa motion design de verdad: cámara, 3D, máscaras, partículas, trazos SVG, transiciones con golpe. Mira el catálogo de abajo antes de elegir.
4. **4K (2160x3840) a 60 fps siempre.** Nada de 120 fps: no compensa.
5. **No inventes datos presentados como reales.** Si usas cifras, márcalas como ejemplo o avisa al usuario para que ponga una fuente. En los memes, los números de likes y similares son ficción y se nota.
6. Cuando termines un vídeo, **sigue con el siguiente sin preguntar** hasta que el usuario diga que pares. Para eso existe el comando `/reels-virales`.

## Estructura

```
marketing/instagram/
  CLAUDE.md                     ← este archivo
  tools/render4k.cjs            ← renderizador (4K 60 fps y stills de prueba)
  tools/plantilla.html          ← esqueleto para un reel nuevo
  tools/package.json            ← dependencia: playwright
  reel-<slug>[-4k-60fps].mp4    ← vídeos finales
  portada-<slug>[-4k].jpg       ← portada (un frame del vídeo)
  fuente-<slug>/                ← fuente de cada reel: reelNN.html + fonts/
```

## Puesta en marcha (una vez)

```bash
cd marketing/instagram/tools
npm install
npx playwright install chromium
ffmpeg -version     # si no está: winget install ffmpeg | brew install ffmpeg | apt install ffmpeg
```

## Cómo se construye un reel

- Lienzo CSS de **1080x1920**. El renderizador usa `deviceScaleFactor: 2`, así que sale en 4K nítido (vectores re-renderizados, no un reescalado).
- Toda la animación se hace con la **Web Animations API**, en pausa. `seek(t)` pone el `currentTime` de todas las animaciones. La página expone `window.TOTAL` y `window.seek`. Con `?render` en la URL se queda quieta; sin él, se reproduce en bucle en el navegador para previsualizar. Parte siempre de `tools/plantilla.html`.
- Lo que se calcula por frame (partículas, canvas, contadores) se hace dentro de `seek(t)` y **solo en función de `t`**. Para lo aleatorio, usa el PRNG con semilla `seed = seed*16807 % 2147483647`. Nunca uses `Math.random` ni `Date`.
- Fuentes: descárgalas de Google Fonts a `fonts/Nombre.font`. Para sacar la URL del .ttf: `curl -s "https://fonts.googleapis.com/css2?family=Anton" | grep -o 'https://[^)]*'`.
  - Fuentes ya usadas: Anton, Archivo Black, Caveat, Permanent Marker, Press Start 2P, VT323, Cinzel.
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

1. **Idea:** elige un formato viral y un estilo visual que **no** estén en el catálogo. Escribe guion, tiempos y CTA.
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

### Ideas de formatos virales aún sin usar

- "Cosas que dice un dueño de negocio" en bocadillos.
- "Expectativa vs realidad".
- "Nivel 1 / nivel 100".
- "Tier list" de tareas para automatizar.
- "Si tu negocio fuera una peli de terror".
- "Elige: ¿A o B?" (encuesta).
- Notificaciones del móvil bajo la lluvia.
- Falso anuncio de teletienda.
- Ranking/podio animado.
- "Dime tu sector y te digo qué automatizar".
- "Mi jefe vs la IA".
- "Test: ¿necesitas IA?" con puntuación.
- Videojuego retro (barra de vida, nivel superado).
- Telediario de última hora.
- Mapa del tesoro.
- "Spotify Wrapped" del negocio.
- Ticket de compra que se imprime.
- Gráfica de bolsa.
- "Lo que veo vs lo que ve mi cliente".

Táchalas al usarlas.
