/**
 * Guía "por dónde empezar" para /servicios.
 *
 * Con diez servicios en el catálogo, quien no sabe cuál necesita se pierde
 * eligiendo. Esto no es una tabla de comparación de características —es
 * una lista de situaciones concretas, cada una apuntando al servicio que
 * mejor responde a esa situación. El slug debe existir en `services.ts`.
 */
export type ServiceGuideRow = {
  situacion: string
  slug: string
}

export const serviceGuide: ServiceGuideRow[] = [
  { situacion: 'No sé si la IA me sirve para algo, quiero que alguien lo mire primero', slug: 'consultoria-de-ia' },
  { situacion: 'Repito la misma tarea manual cada semana y quiero quitármela de encima', slug: 'automatizacion' },
  { situacion: 'Tengo varias herramientas que no se hablan entre sí', slug: 'integracion-de-ia' },
  { situacion: 'Quiero un asistente que responda dudas o atienda consultas por mí', slug: 'asistentes-de-ia' },
  { situacion: 'Somos una empresa con varios equipos y no sabemos por dónde empezar', slug: 'ia-para-empresas' },
  { situacion: 'Somos una pyme pequeña, sin presupuesto ni equipo técnico grande', slug: 'ia-para-pymes' },
  { situacion: 'Quiero ser más productivo en mi día a día, sin montar nada complejo', slug: 'ia-para-productividad' },
  { situacion: 'Necesito contenido, imágenes o textos generados con IA', slug: 'creacion-digital' },
  { situacion: 'Quiero que mi equipo aprenda a usar la IA, no que se la instalen', slug: 'formacion' },
  { situacion: 'Necesito un plan a medio plazo, no una herramienta suelta', slug: 'estrategia-de-ia' },
]
