# PaMenAgency — web oficial

Experiencia digital completa de PaMenAgency: agencia de Inteligencia Artificial
y centro de conocimiento. React + TypeScript + Vite, sin framework de UI ni
dependencias de estilo: el sistema de diseño es propio.

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # typecheck + build + sitemap.xml
npm run preview    # sirve dist/ para comprobar el resultado final
```

## Estructura

```
src/
  content/         Todo el contenido del sitio, tipado y separado de los componentes
    site.ts        Marca, navegación, contacto y datos legales (con placeholders)
    services.ts    Catálogo de servicios → /servicios y /servicios/:slug
    faq.ts         Preguntas frecuentes → /faq y schema FAQPage
    paths.ts       Caminos de «IA para todos»
    cracks.ts      «Las grietas de la IA»
    useCases.ts    Casos de uso por sector
    methodology.ts Metodología, cadena problema→resultado y los nueve pasos
    diagnostic.ts  Preguntas y lógica del diagnóstico orientativo
    knowledge/     Documentos del centro de conocimiento (ver su README)
  components/
    layout/        Cabecera, menú móvil, pie y armazón de página
    ui/            Botón, icono, sección, acordeón, cursor, partículas, cabecera de página
    sections/      Bloques que componen la portada y las páginas internas
    three/         Escenas WebGL y su equivalente estático en SVG
    cookies/       Banner y panel de consentimiento
    chat/          Widget del asistente de IA (frontend)
  lib/
    seo.ts         Metadatos por ruta, Open Graph y datos estructurados
    motion.ts      Scroll reveal, parallax, spotlight, detección de capacidades
    consent.ts     Almacenamiento y lectura del consentimiento
  pages/           Una página por ruta; todas salvo la portada se cargan bajo demanda
api/
  chat.ts          Función serverless de Vercel: backend del asistente de IA
```

## Cómo ampliar el sitio

Todo el contenido está separado de los componentes, así que ampliar no exige
tocar la interfaz.

| Quiero añadir… | Edito… | Lo que ocurre solo |
|---|---|---|
| Un servicio | `content/services.ts` | Card en la portada, listado, página propia, sitemap y selector del formulario |
| Una guía | `content/knowledge/` + registro en su `index.ts` | Card, página con índice, tiempo de lectura, navegación y sitemap |
| Una pregunta frecuente | `content/faq.ts` | Acordeón de la portada, página `/faq` y schema `FAQPage` |
| Un sector | `content/useCases.ts` | Nueva pestaña en «Casos de uso» |
| Un camino de entrada | `content/paths.ts` | Nueva tarjeta en «IA para todos» |
| Una pregunta al diagnóstico | `content/diagnostic.ts` | Se recalculan puntuación máxima y progreso |

Para convertir un documento propio en una página del centro de conocimiento,
las instrucciones están en `src/content/knowledge/README.md`.

## Logotipo

El logo definitivo ya está en uso: `public/logo.jpg` (recortado al círculo,
sin el margen negro sobrante del archivo original), y reutilizado como
favicon en `public/favicon.png`. Para sustituirlo por otra versión, coloca
el archivo nuevo en `public/`, cambia `LOGO_SRC` en
`src/components/layout/Logo.tsx` a esa ruta y ajusta `LOGO_ASPECT` (ancho ÷
alto) si la proporción cambia. El hueco reservado, los tamaños de cabecera
y pie y la alineación ya están definidos ahí, así que no hay que retocar el
diseño ni el resto de los componentes.

## Datos pendientes antes de publicar

Los datos personales de identificación (titular, NIF/CIF, domicilio) se han
dejado deliberadamente fuera de las páginas legales a petición expresa: no se
inventan y no se piden. El aviso legal y la política de privacidad lo indican
como pendiente en vez de mostrar un dato falso.

- `src/pages/legal/AvisoLegal.tsx` y `Privacidad.tsx`: cuando exista una razón
  social y un NIF que publicar, añádelos donde el propio texto indica que
  faltan.
- `src/content/site.ts` → `url`: dominio definitivo (se usa en canonical, Open
  Graph y sitemap). Debe coincidir con `BASE` en `scripts/generate-sitemap.mjs`
  y con las URL de `index.html` y `public/robots.txt`.
- `src/content/site.ts` → `social`: URLs de Instagram, TikTok y LinkedIn. Sin
  URL, el pie muestra el nombre sin enlazar en lugar de un enlace roto.
- `src/content/site.ts` → `phone` y `whatsapp`, si se quieren ofrecer.
- Páginas legales: los proveedores de alojamiento y correo, en
  `src/pages/legal/Privacidad.tsx` y `TratamientoDatos.tsx`.
- `public/og-image.svg`: si la red social de destino no admite SVG, exportarlo a
  PNG de 1200×630 y actualizar la referencia en `src/lib/seo.ts` e `index.html`.

## Formulario de contacto

Sin backend configurado, el formulario valida y después compone un correo con
los datos y abre el cliente del usuario. Para enviarlo a un servicio propio,
define `VITE_CONTACT_ENDPOINT` (ver `.env.example`): recibirá un POST con JSON.

## Asistente de IA

Widget de chat flotante (`src/components/chat/AssistantWidget.tsx`), visible en
todas las páginas, que llama a la función serverless `api/chat.ts`. Esa función
habla con [Groq](https://groq.com) — inferencia alojada, API compatible con
OpenAI, muy rápida — con un prompt de sistema que resume los servicios, el
tono y los límites de la agencia; no tiene acceso a nada más y no inventa
datos que no estén en ese prompt.

Configura en Vercel (Settings → Environment Variables, en Production y
Preview):

- `GROQ_API_KEY`: clave de [console.groq.com/keys](https://console.groq.com/keys).
- `GROQ_MODEL`: el modelo a usar (por defecto `openai/gpt-oss-120b`).

Sin `GROQ_API_KEY` configurada, o si la petición falla, el asistente sigue
funcionando pero responde siempre con un mensaje que remite al contacto
humano, en vez de fallar o quedarse colgado (la función corta la espera a
los 15 segundos).

La conversación vive sólo en memoria del componente: no se guarda en el
navegador ni se envía a ningún sitio salvo a esa función, así que no requiere
consentimiento de cookies.

## Decisiones que conviene conocer

- **Sin scroll horizontal, por construcción.** `overflow-x: clip` en la raíz,
  rejillas con `minmax(min(100%, Npx), 1fr)`, tipografía fluida con `clamp()` y
  fondos decorativos siempre `pointer-events: none` y por debajo del contenido.
- **El 3D es opcional.** `three` vive en su propio chunk y sólo se descarga en
  equipos que superan la comprobación de `useCanRender3D` (pantalla ancha,
  memoria y núcleos suficientes, WebGL disponible y sin `prefers-reduced-motion`).
  En el resto se sirve una versión estática en SVG, no un hueco.
- **Las animaciones se apagan solas.** Todo el movimiento respeta
  `prefers-reduced-motion`; las escenas WebGL se pausan fuera de pantalla y con
  la pestaña oculta.
- **Nada se inventa.** No hay estadísticas, clientes ni casos de éxito
  ficticios. Los casos de uso por sector están redactados como ejemplos de
  aplicación, y así se indica en la propia sección.

## Despliegue

Es una SPA: cualquier ruta debe resolverse en `index.html`. Ya están incluidos
`public/_redirects` (Netlify) y `vercel.json` (Vercel). Para otro alojamiento,
configura el mismo *fallback*.
