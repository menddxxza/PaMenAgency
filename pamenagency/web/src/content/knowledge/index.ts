import type { Block, KnowledgeDoc } from './types'
import { ventajaReal } from './ventaja-real'
import { grietasDoc } from './grietas'
import { erroresComunes } from './errores-comunes'
import { detectarOportunidades } from './detectar-oportunidades'
import { elegirAgenciaIa } from './elegir-agencia-ia'

export type { KnowledgeDoc, Chapter, Block, Level } from './types'

/**
 * Registro de documentos publicados.
 *
 * El orden de este array es el orden en que aparecen en `/conocimiento` y el
 * que usa la navegación «anterior / siguiente» dentro de cada documento.
 */
export const docs: KnowledgeDoc[] = [
  ventajaReal,
  grietasDoc,
  erroresComunes,
  detectarOportunidades,
  elegirAgenciaIa,
]

export const getDoc = (slug: string | undefined) => docs.find((d) => d.slug === slug)

/** Documento anterior y siguiente, para la navegación del pie del artículo. */
export function getDocNeighbours(slug: string) {
  const i = docs.findIndex((d) => d.slug === slug)
  return {
    prev: i > 0 ? docs[i - 1] : null,
    next: i >= 0 && i < docs.length - 1 ? docs[i + 1] : null,
  }
}

function blockWords(b: Block): number {
  switch (b.type) {
    case 'p':
    case 'h3':
    case 'quote':
      return b.text.split(/\s+/).length
    case 'callout':
    case 'example':
      return b.text.split(/\s+/).length
    case 'ul':
    case 'ol':
      return b.items.reduce((n, i) => n + i.split(/\s+/).length, 0)
    case 'divider':
      return 0
  }
}

/** Tiempo estimado de lectura en minutos (≈ 200 palabras/minuto). */
export function readingTime(doc: KnowledgeDoc): number {
  const all: Block[] = [
    ...doc.intro,
    ...doc.chapters.flatMap((c) => c.blocks),
    ...(doc.conclusion ?? []),
  ]
  const words =
    all.reduce((n, b) => n + blockWords(b), 0) +
    doc.chapters.reduce((n, c) => n + c.title.split(/\s+/).length, 0)
  return Math.max(1, Math.round(words / 200))
}

/** Categorías presentes, para filtrar el listado. */
export function getCategories(): string[] {
  return [...new Set(docs.map((d) => d.category))]
}

/**
 * Temas previstos que aún no tienen documento publicado.
 *
 * Se muestran en `/conocimiento` marcados claramente como pendientes: prometer
 * contenido que no existe sería exactamente lo que esta web evita.
 */
export const upcomingTopics: string[] = [
  'Cómo utilizar varias IA juntas',
  'IA para empresas',
  'IA para PYMEs',
  'IA para emprendedores',
  'Productividad con IA',
  'Cómo ahorrar tiempo con IA',
  'Seguridad y privacidad',
  'Riesgos y limitaciones',
]
