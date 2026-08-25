/**
 * Modelo de contenido del Centro de Conocimiento.
 *
 * Un documento no se guarda como PDF ni como HTML suelto: se describe como
 * una lista de bloques tipados. Eso permite que el mismo contenido se
 * maquete siempre igual, se le calcule el tiempo de lectura, se le genere
 * el índice y se navegue por capítulos sin trabajo adicional.
 *
 * Para añadir un documento nuevo, ver README.md en esta misma carpeta.
 */

export type Block =
  /** Párrafo. Admite **negrita** en línea. */
  | { type: 'p'; text: string }
  /** Subtítulo dentro de un capítulo. */
  | { type: 'h3'; text: string }
  /** Lista de puntos. */
  | { type: 'ul'; items: string[] }
  /** Lista numerada, para procesos con orden. */
  | { type: 'ol'; items: string[] }
  /** Bloque destacado. `warn` para advertencias. */
  | { type: 'callout'; label: string; text: string; variant?: 'gold' | 'warn' }
  /** Cita o idea central. */
  | { type: 'quote'; text: string }
  /** Ejemplo concreto, separado visualmente del razonamiento. */
  | { type: 'example'; label?: string; text: string }
  /** Separador visual dentro del capítulo. */
  | { type: 'divider' }

export type Chapter = {
  /** Identificador para el ancla y el índice lateral. */
  id: string
  title: string
  blocks: Block[]
}

export type Level = 'Iniciación' | 'Intermedio' | 'Avanzado'

export type KnowledgeDoc = {
  slug: string
  title: string
  /** Frase de portada, se usa también como meta description. */
  summary: string
  category: string
  level: Level
  /** Fecha de publicación o última revisión (ISO). */
  updated: string
  /** Introducción antes del primer capítulo. */
  intro: Block[]
  chapters: Chapter[]
  /** Cierre del documento. */
  conclusion?: Block[]
}
