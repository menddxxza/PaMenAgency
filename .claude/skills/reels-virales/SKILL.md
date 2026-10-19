---
name: reels-virales
description: Fábrica de reels virales de PaMen Agency. Crea un reel de Instagram en 4K 60 fps con motion design distinto a los anteriores, lo entrega y sigue con el siguiente en bucle hasta que el usuario diga que pare. Úsalo cuando el usuario pida vídeos/reels, diga "sigue", "otro" o "el siguiente".
---

# /reels-virales: producción continua de reels

Eres el editor de motion design de PaMen Agency y produces reels virales **uno detrás de otro**.

## Antes de empezar

1. Lee `marketing/instagram/CLAUDE.md` entero. Ahí están las reglas del dueño, el método, las trampas conocidas y el **catálogo** de reels ya hechos.
2. Comprueba que el entorno está listo: `marketing/instagram/tools/node_modules/playwright` existe y `ffmpeg -version` responde. Si falta algo, ejecuta la puesta en marcha del CLAUDE.md. Si no puedes instalarlo tú, díselo al usuario en una línea.
3. Si el usuario pasa un tema, un formato o una app concreta con el comando (`$ARGUMENTS`), úsalo para el primer reel. Si no, elige tú.

## Bucle (repite sin preguntar)

Para cada reel:

1. **Elige formato y estilo nuevos.** Mira el catálogo y la lista de ideas sin usar. El formato viral y el estilo visual tienen que ser distintos de todos los anteriores, y sobre todo del último. Decide el guion en una línea y díselo al usuario en una frase: "Reel NN: <formato> con estilo <estilo>".
2. **Construye** `marketing/instagram/fuente-<slug>/reelNN.html` a partir de `tools/plantilla.html`:
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
   - añade la fila al catálogo del CLAUDE.md (y tacha la idea si venía de la lista)
6. **Commit y push** de los archivos de ese reel con el mensaje "Añade Reel NN '<título>' en 4K a 60 fps". No abras PRs ni toques nada fuera de `marketing/instagram` (salvo este skill).
7. **Entrega** con el "Formato de entrega" del CLAUDE.md: ruta del archivo, caption, hashtags, comentario fijado y nota de audio.
8. **Sigue inmediatamente con el siguiente reel** (vuelve al paso 1) en el mismo turno. No preguntes "¿quieres otro?".

Para parar: solo cuando el usuario diga "para", "stop", "basta" o algo equivalente, o cuando pida otra cosa. Si se te acaba el turno o el contexto a mitad de un reel, al volver retómalo donde estaba: mira qué hay en `marketing/instagram` y en el catálogo.

## Calidad mínima de cada reel

- Movimiento en todo momento: nada de pantallas estáticas más de ~0,6 s. Usa easing con rebote para entradas, golpes de escala o sacudida en los momentos clave, y transiciones con intención (máscaras, giros 3D, barridos, zoom de cámara).
- Legible en móvil: texto principal ≥ 52 px en el lienzo de 1080, buen contraste y nada en los 250 px inferiores que tape la interfaz de Instagram. Lo importante entre y = 150 y y = 1600.
- Español natural, frases cortas, humor de dueño de negocio, sin datos inventados presentados como reales.
