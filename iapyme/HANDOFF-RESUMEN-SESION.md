# IAPyme — Resumen de la sesión de rediseño y arreglos (para retomar en otro Claude)

Este documento explica **todo lo que se ha hecho en esta sesión de trabajo**, en orden,
para que puedas continuar sin perder el hilo. Léelo junto con `HANDOFF-RECURSOS-Y-ACCESOS.md`
(cuentas, ramas, dominios, variables de entorno) y con los documentos de negocio que ya
existían en el proyecto: `CONTEXTO-IA.md` (idea y modelo de negocio), `ROADMAP.md` (fases),
`PROGRESO.md` (histórico anterior a esta sesión — **ojo, tiene datos de despliegue
desactualizados**, ver aviso más abajo).

## 0. Contexto de partida

Al empezar esta sesión, IAPyme ya era un MVP funcional (Fase 1 del roadmap): catálogo
público, autenticación, panel de vendedor, moderación en `/admin`, con base de datos real
en Supabase. El código vivía en un repositorio de GitHub con **varias ramas de trabajo
distintas y un historial confuso** (ver más abajo, es importante). El trabajo de esta
sesión fue, en este orden:

1. Un rediseño visual completo de la aplicación (pedido explícitamente por el usuario,
   con un brief muy detallado de dirección de arte — ver sección 1).
2. El descubrimiento de que la app llevaba semanas actualizándose en una rama que
   **no era la que Vercel despliega de verdad** — mucho esfuerzo de esta sesión fue
   diagnosticar y corregir eso (ver sección 4, es la parte más importante para no repetir
   el error).
3. Una serie de arreglos puntuales y mejoras de diseño posteriores (secciones 5-8).

## 1. El rediseño visual (Fase 1 y Fase 2)

El usuario pidió explícitamente eliminar cualquier apariencia de "hecho con IA": nada de
gradientes, fondos con blobs animados, glassmorphism, iconos genéricos, tipografías
futuristas, texto de marketing genérico ("Revoluciona tu negocio con IA", etc.). Quería
un nivel de acabado tipo Linear/Stripe/Notion/Vercel, en español de España, sobrio,
"empresa tecnológica seria".

**Fase 1** (sistema de diseño + home + header/footer):
- Tipografía: se unificó todo a **Inter** como única familia (display y cuerpo), se quitó
  una fuente serif (Fraunces) que había en un rediseño anterior.
- Paleta en **OKLCH** (ya existía, se conservó — azul de marca `oklch(50.5% 0.259 265.7)`).
- Se eliminó un fondo animado con blobs (`FondoAnimado.tsx`, borrado) y el glassmorphism
  del header (`backdrop-blur` → fondo blanco sólido).
- Radios de esquina, sombras (`shadow-quiet` / `shadow-lift`) y espaciado más contenidos.
- Rediseño del hero de portada para mostrar **el catálogo real** (componente
  `EscaparateProducto` dentro de `app/page.tsx`) en vez de una ilustración genérica de IA.
- Archivo `tokens.css` actualizado como export portable del sistema.
- Se creó `.hallmark/log.json` — un registro de las pasadas de diseño (usa la skill
  "hallmark" de Claude Code; si vuelves a rediseñar algo, sigue esa disciplina: mirar antes
  qué se ha probado ya para no repetir la misma composición).

**Fase 2** (extender el sistema al resto de páginas): barrido de consistencia sobre
catálogo, ficha de producto, categoría, vendedor, dashboard, admin, entrar, validación,
legales — sobre todo `font-extrabold` → `font-semibold` en cabeceras, y subir el contraste
de bastantes textos en `text-ink/35` a `/45` (no pasaban WCAG AA) a `/60` o más.

**Verificación usada en toda la sesión** (repítela si sigues tocando diseño):
`npm run typecheck && npm run build`, luego servidor local + Playwright (capturas en
1440/768/375px, sin overflow, sin errores de consola) + auditoría de accesibilidad con
`axe-core` (instalado ad hoc en un scratchpad, no es dependencia del proyecto). El objetivo
siempre fue **0 violaciones de axe-core** en las páginas que se pueden renderizar sin datos
reales de Supabase.

**Limitación de este entorno, IMPORTANTE para el siguiente Claude**: esta sesión corría en
una sandbox en la nube **sin conexión a tu Supabase real** ni acceso general a internet
(solo a GitHub y npm). Eso significa que páginas que dependen de datos reales (ficha de
producto con datos de verdad, categoría con productos, dashboard logueado, admin logueado)
**nunca se pudieron ver renderizadas con datos reales desde esta sesión** — solo se verificó
su "estado vacío" (aviso de "Falta configurar Supabase"). Si el siguiente Claude tiene el
mismo tipo de sandbox, tendrá la misma limitación; pídele al usuario capturas de pantalla
reales cuando dude de cómo se ve algo con datos de verdad — es más fiable que asumir.

## 2. Ajustes al hero tras feedback visual

Después de la Fase 1/2, el usuario dio feedback iterativo sobre el hero de portada viendo
capturas reales del móvil:

- La tarjeta de "catálogo reciente" en el hero se veía "cuadriculada" y desconectada del
  resto — se le quitó peso visual (sombra más suave en móvil, menos separación).
- Pidió un cambio de composición más radical: el hero pasó de "texto izquierda + tarjeta
  derecha" a un **hero de fondo oscuro a todo lo ancho** (mismo tono que el footer y la
  pantalla de "entrar", no es un color nuevo) con el titular arriba y el catálogo real como
  **franja horizontal de 3 columnas debajo**, no una tarjeta flotante al lado.

## 3. La pantalla en blanco de `/admin` (bug real, ya corregido)

Al revisar el resto de páginas, se encontró que `/admin` y `/admin/vendedores` hacían
`return null` (página completamente en blanco, sin mensaje) si no había sesión o Supabase
no estaba configurado — a diferencia del resto del panel, `/admin` no vive bajo un layout
que ya resuelva esos casos. Se corrigió: sin Supabase, muestra el mismo aviso amarillo que
el resto de la app; sin sesión, redirige a `/entrar?volver=/admin`.

## 4. EL PROBLEMA GRANDE: la rama de producción real (léelo antes de tocar nada)

**Esto es lo más importante de todo el documento.** Durante gran parte de la sesión, el
usuario reportaba repetidamente "no veo ningún cambio" tras cada arreglo. La causa real,
descubierta tras mucho ir y venir:

- El repositorio de GitHub tiene **varias ramas con nombres parecidos** usadas en distintos
  momentos por distintas sesiones de Claude: `claude/revision-archivos-proyecto-bop2gl`,
  `claude/atiende-react-supabase-setup-fz5e9t`, `claude/notiq-ai-productivity-app-mcriln`
  (esta última contiene además un proyecto **completamente distinto**, "Notiq", en la
  misma rama, mezclado — el repo es un monorepo con varios productos de PaMenAgency).
- En un punto de la sesión, una pista ambigua del panel de Vercel llevó a pensar que
  `claude/notiq-ai-productivity-app-mcriln` era la rama de producción real, y se hizo un
  trabajo enorme de "paridad de funciones" portando todo el código ahí. **Eso fue un
  error** — esa rama nunca fue la que Vercel despliega a producción.
- La rama de producción real, confirmada mirando **Vercel → Project Settings → Environments
  → Production → Branch Tracking** (la única fuente de verdad fiable, no lo adivines por
  el historial de commits ni por qué rama "parece" más reciente), es:

  **`claude/atiende-react-supabase-setup-fz5e9t`**

  con los dominios `iapymeapp.com` y `iapyme.vercel.app` asignados a esa rama.

- Todo el trabajo de esta sesión (rediseño Fase 1/2, arreglo de `/admin`, iconos, modelo de
  Groq, pieza 3D del hero, tarjetas con inclinación, crédito de PaMenAgency) terminó
  fusionado correctamente en `claude/atiende-react-supabase-setup-fz5e9t`. **Esa es la rama
  en la que debes trabajar de aquí en adelante.**
- Además hubo un segundo problema de despliegue distinto: incluso empujando a la rama
  correcta, un deployment puede quedarse como **"Preview"** en vez de promocionarse solo a
  "Production" — pasó al menos una vez con el icono de la app. Si el usuario dice que no ve
  cambios después de un push a la rama correcta, la checklist es:
  1. ¿El deployment más reciente en Vercel tiene el commit esperado?
  2. ¿Está en verde/Ready?
  3. ¿Está marcado como **Production** (badge azul), no solo "Preview"?
  4. Si no, pedirle al usuario que pulse "Promote to Production" en el menú `···` de ese
     deployment.
  5. Si aun así no se ve, probar en ventana de incógnito (caché de navegador/PWA) antes de
     asumir que el despliegue falló.

**Recomendación fuerte para el siguiente Claude**: al empezar, verifica tú mismo (o pide al
usuario que verifique) cuál es la Production Branch actual en Vercel antes de fusionar nada
a ninguna parte. No confíes en lo que diga cualquier documento (incluido este) si ha pasado
tiempo — las cosas pueden haber cambiado.

## 5. El asistente de búsqueda con IA — modelo de Groq

El buscador tiene un botón "¿No sabes qué buscar? Pregúntale a la IA" (`app/api/recomendar/route.ts`,
lógica en `lib/groq.ts`) que usa la API de Groq. Groq retiró todos los modelos Llama de chat
de su catálogo a mitad de esta sesión, así que el modelo original (`llama-3.3-70b-versatile`)
empezó a fallar con `404 model_not_found`. Se cambió a **`openai/gpt-oss-120b`**, el modelo de
razonamiento general más capaz que quedaba disponible en la cuenta del usuario en el momento
de escribir esto. **Si vuelve a fallar con un error de modelo no encontrado**, pide al
usuario la lista de modelos de su cuenta en console.groq.com y actualiza `MODELO` en
`lib/groq.ts` — es la única constante que hay que tocar.

Nota: en paralelo, otra sesión de Claude trabajando en el proyecto "Notiq" (mismo repo,
otra carpeta) hizo un cambio parecido en `notiq/lib/ia/openai.ts` — no está relacionado con
IAPyme, no lo toques al arreglar esto.

## 6. Icono de la app desactualizado

`public/icons/icon-192.png` tenía un diseño antiguo (monograma "IA" en un cuadrado azul)
mientras que el resto de iconos (`app/icon.png`, `apple-touch-icon.png`, `icon-512.png`)
ya tenían el diseño nuevo (un edificio con una traza de circuito). Se regeneró
`icon-192.png` a partir de `icon-512.png` para que todos coincidan. Si en el futuro cambia
el diseño de marca otra vez, revisa **los cuatro archivos de icono a la vez** — es fácil
que se actualice uno y se olviden los demás (ya ha pasado dos veces).

## 7. Elemento 3D en el hero y tarjetas con inclinación

El usuario pidió "mejorar el diseño con animación/3D" pero **rechazó explícitamente**
varias skills de Claude Code por no encajar con el proyecto (Flutter, canvas de pósters
estáticos, Three.js "por defecto" sin cuidado, artifacts standalone). Se acordó con el
usuario aplicar algo puntual y con cuidado:

- **`components/EscenaHero.tsx`** — una escena 3D con `three` + `@react-three/fiber`
  (instalados como dependencias nuevas, versiones fijadas a React 18: `three@^0.160.0`,
  `@react-three/fiber@^8.15.0`, más `@types/three` como dev dependency — **no actualices
  a `@react-three/fiber` v9**, requiere React 19 y este proyecto usa React 18).
  Dibuja un **nudo toroidal como una sola línea continua** (la curva paramétrica, no la
  malla de un sólido — eso se probó primero y se veía como una jaula de cuadrícula densa,
  se descartó). Antes de esto hubo también una versión con icosaedro + red de nodos, que
  el usuario pidió cambiar explícitamente por "ya tener eso en otras apps".
- **`components/EscenaHeroLazy.tsx`** — envoltorio cliente que carga `EscenaHero` con
  `next/dynamic(..., { ssr:false })` y respeta `prefers-reduced-motion` (si está activado,
  ni siquiera se monta el Canvas). Esto es necesario porque `dynamic(..., {ssr:false})` no
  se puede llamar directamente desde un Server Component (la home es `async function`).
- La pieza 3D vive en **su propia celda de grid** junto al texto del hero (no en posición
  absoluta contra toda la sección) — la primera versión se recortaba por los bordes y se
  solapaba con el catálogo de abajo; el usuario lo detectó y se corrigió.
- **`components/ProductoCard.tsx`** pasó a ser un Client Component (antes no tenía
  interactividad propia) para añadir una inclinación sutil que sigue al cursor
  (`perspective` + `rotateX/rotateY` vía variables CSS, sin re-render de React) y un
  brillo muy tenue sobre la imagen que también sigue el puntero. Se omite con
  `prefers-reduced-motion`.
- Impacto en el bundle: la home pasó de ~98 kB a ~101 kB de First Load JS — el código de
  Three.js va en un chunk aparte gracias al `dynamic(ssr:false)`, no infla el bundle inicial.

## 8. Crédito de PaMenAgency

Se añadió en el pie de página: `© AÑO IAPyme · un producto de PaMenAgency`, enlazando a
`https://pamenagency.com` (target `_blank`, `rel="noopener noreferrer"`), a petición del
usuario. Vive en `components/Footer.tsx`, en la fila inferior junto al copyright.

## Cómo se hacía cada despliegue en esta sesión (flujo de trabajo)

Como el usuario no dio acceso directo al panel de Vercel ni a Supabase, todo el ciclo era:

1. Trabajar en el checkout local de este entorno (`/home/user/menddxxza/iapyme`, sobre la
   rama `claude/revision-archivos-proyecto-bop2gl`).
2. `npm run typecheck` → `npm run build` (limpio, sin `.next` previo) → servidor local +
   Playwright (overflow, errores de consola, capturas) + `axe-core` (0 violaciones).
3. Commit y push a `claude/revision-archivos-proyecto-bop2gl`.
4. Clonar en fresco `claude/atiende-react-supabase-setup-fz5e9t` (la rama de producción
   real) en un directorio de scratch, fusionar la rama de trabajo, repetir la verificación
   del paso 2 sobre ese checkout, y solo entonces hacer push a
   `claude/atiende-react-supabase-setup-fz5e9t`.
5. Avisar al usuario y esperar confirmación de que Vercel lo desplegó de verdad (ver
   sección 4 sobre Preview vs Production).

Si el siguiente Claude tiene acceso directo al mismo repo, puede simplificar esto, pero el
principio importa: **nunca fusionar directamente en la rama de producción sin verificar
build limpio primero en un checkout aparte**, y **nunca dar algo por desplegado sin que el
usuario confirme viéndolo en su dominio real** (esta sesión se equivocó dando cosas por
hechas prematuramente varias veces).

## Aviso sobre documentos antiguos del repositorio

`PROGRESO.md` (dentro de `iapyme/`) tiene información de un despliegue en **Netlify** con
dominio **iapyme.es** — eso es de una fase anterior del proyecto y **ya no es así**: el
despliegue real actual es en **Vercel**, dominio **iapymeapp.com** (ver
`HANDOFF-RECURSOS-Y-ACCESOS.md`). No confíes en esa parte de `PROGRESO.md`; el resto
(modelo de negocio, roadmap de fases) sigue siendo válido.
