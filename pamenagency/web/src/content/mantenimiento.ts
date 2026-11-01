/**
 * Mantenimiento mensual, después de entregar un proyecto (plan maestro, §5).
 *
 * Precios decididos por Pablo (noviembre de 2026), sin IVA. Nunca soporte
 * ilimitado ni disponibilidad 24/7: el alcance de cada plan se fija por
 * contrato.
 */
export type PlanMantenimiento = {
  nombre: string
  precio: string
  resumen: string
  incluye: string[]
}

export const planesMantenimiento: PlanMantenimiento[] = [
  {
    nombre: 'Esencial',
    precio: '49 €',
    resumen: 'Para comprobar que todo sigue funcionando.',
    incluye: [
      'Revisión periódica de que las automatizaciones se ejecutan bien.',
      'Informe de estado.',
      'Resolución de incidencias dentro del alcance acordado.',
    ],
  },
  {
    nombre: 'Profesional',
    precio: '99 €',
    resumen: 'Para sistemas que usáis a diario.',
    incluye: [
      'Vigilancia más frecuente de las ejecuciones.',
      'Gestión de incidencias y pequeños ajustes.',
      'Revisión del rendimiento e informe.',
      'Soporte en el horario y por el canal acordados.',
    ],
  },
  {
    nombre: 'Avanzado',
    precio: '199 €',
    resumen: 'Para quien quiere seguir mejorando lo que tiene.',
    incluye: [
      'Mayor cobertura y supervisión.',
      'Mejoras planificadas cada mes.',
      'Revisión de las integraciones.',
      'Prioridad acordada en las incidencias.',
    ],
  },
]

/** Lo que ningún plan incluye por defecto: se presupuesta aparte. */
export const mantenimientoNoIncluye = [
  'Licencias de programas y consumo de servicios de IA (APIs).',
  'Alojamiento e infraestructura.',
  'Funcionalidades nuevas.',
  'Servicios de terceros.',
]
