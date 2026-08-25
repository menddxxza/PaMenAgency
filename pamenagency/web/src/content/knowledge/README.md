# Centro de Conocimiento — cómo añadir un documento

Cada documento vive en un archivo `.ts` de esta carpeta y se declara con la
forma definida en `types.ts`. No hace falta tocar ningún componente: al
registrarlo en `index.ts` aparece automáticamente en `/conocimiento`, obtiene su
página en `/conocimiento/<slug>`, entra en el sitemap y recibe índice lateral,
barra de progreso, navegación entre capítulos y tiempo estimado de lectura.

## Pasos

1. Crea `mi-documento.ts` en esta carpeta.
2. Exporta un objeto `KnowledgeDoc`.
3. Regístralo en el array `docs` de `index.ts`.

```ts
import type { KnowledgeDoc } from './types'

export const miDocumento: KnowledgeDoc = {
  slug: 'mi-documento',            // define la URL: /conocimiento/mi-documento
  title: 'Título del documento',
  summary: 'Una frase. Se usa en la card y como meta description.',
  category: 'Fundamentos',
  level: 'Iniciación',             // Iniciación | Intermedio | Avanzado
  updated: '2026-08-18',
  intro: [{ type: 'p', text: 'Párrafo de entrada.' }],
  chapters: [
    {
      id: 'primer-capitulo',       // ancla del índice lateral
      title: 'Primer capítulo',
      blocks: [
        { type: 'p', text: 'Texto con **negrita** donde haga falta.' },
        { type: 'ul', items: ['Punto uno', 'Punto dos'] },
        { type: 'callout', label: 'Recuerda', text: 'Idea que no debe perderse.' },
        { type: 'example', text: 'Un caso concreto.' },
        { type: 'quote', text: 'Una frase que resume el capítulo.' },
      ],
    },
  ],
  conclusion: [{ type: 'p', text: 'Cierre.' }],
}
```

## Al convertir un documento propio

Cuando el material de partida es un archivo existente (texto, PDF, notas), el
criterio es:

- Respetar el significado original; no se resume hasta perder información.
- Identificar los capítulos reales del documento y usarlos como `chapters`.
- Sacar a `callout`, `example` y `quote` lo que en el original ya destacaba.
- No añadir datos, cifras ni afirmaciones que no estuvieran en el original.
- Si el documento es muy largo, dividirlo en más capítulos antes que alargar uno.

## Bloques disponibles

| Bloque | Uso |
|---|---|
| `p` | Párrafo. Admite `**negrita**`. |
| `h3` | Subtítulo dentro de un capítulo. |
| `ul` / `ol` | Listas; `ol` para procesos con orden. |
| `callout` | Destacado. `variant: 'warn'` para advertencias. |
| `quote` | Idea central del capítulo. |
| `example` | Caso concreto, separado del razonamiento. |
| `divider` | Separador visual. |

El tiempo de lectura se calcula solo a partir del texto (≈ 200 palabras/minuto);
no hay que indicarlo a mano.
