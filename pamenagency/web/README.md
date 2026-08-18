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
    ui/            Botón, icono, sección, acordeón, cursor, cabecera de página
    sections/      Bloques que componen la portada y las páginas internas
    three/         Escenas WebGL y su equivalente estático en SVG
    cookies/       Banner y panel de consentimiento
  lib/
    seo.ts         Metadatos por ruta, Open Graph y datos estructurados
    motion.ts      Scroll reveal, parallax, spotlight, detección de capacidades
    consent.ts     Almacenamiento y lectura del consentimiento
  pages/           Una página por ruta; todas salvo la portada se cargan bajo demanda
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

## Sustituir el logotipo

El logo actual es un placeholder. Para poner el definitivo:

1. Coloca el archivo en `public/logo.svg`.
2. En `src/components/layout/Logo.tsx`, cambia `LOGO_SRC` a `'/logo.svg'` y
   ajusta `LOGO_ASPECT` si no es cuadrado.

El hueco reservado, los tamaños de cabecera y pie y la alineación ya están
definidos ahí, así que no hay que retocar el diseño ni el resto de los
componentes.

## Datos pendientes antes de publicar

Estos datos no se han inventado: aparecen en la web como marcadores visibles.

- `src/content/site.ts` → bloque `legal`: titular, NIF/CIF, dirección, email
  legal, responsable del tratamiento y dominio.
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
