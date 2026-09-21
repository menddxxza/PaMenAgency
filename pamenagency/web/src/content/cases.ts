import type { IconName } from '@/components/ui/Icon'

/**
 * Casos de ejemplo.
 *
 * Son casos ilustrativos, no clientes: la sección que los muestra lo dice
 * en su cabecera y cada tarjeta lleva la etiqueta "Caso de ejemplo".
 * Están construidos sobre situaciones habituales en cada sector y con
 * cifras de orden de magnitud razonable para una pyme. No se les pone
 * nombre de empresa, logo ni cita atribuida a una persona: eso los haría
 * pasar por reales.
 */
export type Caso = {
  sector: string
  /** Slug de `useCases.ts`, para enlazar a la página del sector. */
  sectorSlug: string
  icon: IconName
  tamano: string
  reto: string
  implantado: string[]
  antes: string
  despues: string
  metrica: string
}

export const casos: Caso[] = [
  {
    sector: 'Clínica dental',
    sectorSlug: 'clinicas',
    icon: 'building',
    tamano: '8 personas',
    reto: 'La recepción se pasaba la mañana al teléfono confirmando citas y respondiendo siempre las mismas preguntas.',
    implantado: ['Recordatorios de cita automáticos', 'Asistente para preguntas frecuentes', 'Reasignación de huecos cancelados'],
    antes: '3 h',
    despues: '40 min',
    metrica: 'al día al teléfono',
  },
  {
    sector: 'Asesoría',
    sectorSlug: 'servicios',
    icon: 'layers',
    tamano: '15 personas',
    reto: 'Cada cierre de mes se iba en abrir facturas en PDF y teclearlas una a una en el programa de gestión.',
    implantado: ['Lectura automática de facturas', 'Validación humana de importes', 'Aviso de facturas que faltan'],
    antes: '4 días',
    despues: '1 día',
    metrica: 'para cerrar el mes',
  },
  {
    sector: 'Tienda online',
    sectorSlug: 'tiendas',
    icon: 'store',
    tamano: '4 personas',
    reto: 'Las consultas de "¿dónde está mi pedido?" se comían el tiempo que tenía que ir a preparar envíos.',
    implantado: ['Atención conectada al estado de los pedidos', 'Respuestas fuera de horario', 'Escalado de incidencias a una persona'],
    antes: '20 h',
    despues: '5 h',
    metrica: 'a la semana en consultas',
  },
  {
    sector: 'Inmobiliaria',
    sectorSlug: 'inmobiliarias',
    icon: 'target',
    tamano: '6 personas',
    reto: 'Entraban contactos por tres portales distintos y muchos se quedaban sin respuesta hasta el día siguiente.',
    implantado: ['Entrada única de contactos', 'Primera respuesta automática', 'Seguimiento que no depende de la memoria'],
    antes: '26 h',
    despues: '< 1 h',
    metrica: 'hasta la primera respuesta',
  },
]
