import type { IconName } from '@/components/ui/Icon'

export interface Producto {
  slug: string
  nombre: string
  icon: IconName
  tagline: string
  descripcion: string
  url: string
  /** Lo que demuestra de verdad — no una lista de tecnologías, una prueba. */
  prueba: string
}

/**
 * Productos propios de PaMenAgency, en producción real — no ejemplos ni
 * casos hipotéticos como los de `useCases.ts`. Se muestran como prueba de
 * que la agencia construye lo mismo que vende, no solo lo explica.
 */
export const productos: Producto[] = [
  {
    slug: 'iapyme',
    nombre: 'IAPyme',
    icon: 'store',
    tagline: 'Marketplace de soluciones de IA para pymes españolas',
    descripcion:
      'Catálogo de automatizaciones, agentes y bots ya hechos por otras pymes, en español, sin comisión por venta. Con fichas técnicas reales en vez de anuncios genéricos.',
    url: 'https://iapymeapp.com',
    prueba: 'En producción, con catálogo real y pago de comisión al 0 % desde el primer día.',
  },
  {
    slug: 'revynai',
    nombre: 'Revynai',
    icon: 'gauge',
    tagline: 'Auditoría de crecimiento con IA para empresas',
    descripcion:
      'Analiza un negocio, detecta oportunidades de ingreso con un cálculo determinista (nunca inventado por IA) y activa agentes especializados para trabajarlas.',
    url: 'https://revynai.es',
    prueba: 'En producción, con cálculo de negocio siempre determinista: la IA redacta, nunca calcula cifras.',
  },
  {
    slug: 'notiq',
    nombre: 'Notiq',
    icon: 'sparkles',
    tagline: 'Notas, tareas y asistente de IA en una sola app',
    descripcion:
      'Aplicación de productividad con asistente de IA integrado para organizar notas y tareas, con planes de pago reales para quien necesita más que lo gratuito.',
    url: 'https://notiq.es',
    prueba: 'En producción, con planes de pago reales (Free, Pro y Team) ya activos.',
  },
]
