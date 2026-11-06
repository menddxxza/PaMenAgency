/**
 * Herramientas de pago de PaMenAgency: aplicaciones listas para usar que viven
 * dentro de la web (pamenagency.com/<ruta>). Precios decididos por Pablo
 * (noviembre de 2026), al mes y sin IVA.
 */

export type PlanHerramienta = {
  nombre: string
  precio: number
  destacado?: boolean
  ventajas: string[]
}

export type Herramienta = {
  slug: string
  nombre: string
  /** Ruta de la aplicación dentro del dominio. Es otra aplicación: se enlaza con <a href>, no con <Link>. */
  ruta: string
  frase: string
  descripcion: string
  puntos: string[]
  prueba: string
  planes: PlanHerramienta[]
}

export const facturas: Herramienta = {
  slug: 'facturas',
  nombre: 'Lector de facturas',
  ruta: '/facturas/',
  frase: 'Tus facturas, leídas solas.',
  descripcion:
    'Sube tus facturas y albaranes: la IA lee los datos, comprueba que cuadran y te deja solo lo dudoso para revisar. Lo demás queda listo para tu gestoría.',
  puntos: [
    'Lee PDF, escaneos y fotos de facturas',
    'Comprueba NIF, fechas, importes y duplicados',
    'Revisas solo lo que no cuadra',
    'Exporta a Excel para tu gestoría',
  ],
  prueba: '20 facturas gratis para probar. Sin tarjeta.',
  planes: [
    {
      nombre: 'Básico',
      precio: 19,
      ventajas: ['Hasta 100 facturas al mes', '1 usuario', 'Lectura, comprobación y revisión'],
    },
    {
      nombre: 'Profesional',
      precio: 49,
      destacado: true,
      ventajas: ['Hasta 500 facturas al mes', '3 usuarios', 'Exportar a Excel (CSV) para la gestoría'],
    },
    {
      nombre: 'Empresa',
      precio: 99,
      ventajas: [
        'Hasta 2.000 facturas al mes',
        'Usuarios ilimitados',
        'Exportar a Excel (CSV)',
        'Entrada automática desde el correo o n8n',
      ],
    },
  ],
}

/** Las siguientes herramientas, aún sin fecha: no se prometen funciones concretas. */
export const proximamente = [
  { nombre: 'Asistente de tus documentos', texto: 'Pregunta en lenguaje normal y responde con lo que dicen tus documentos.' },
  { nombre: 'Gestor de incidencias', texto: 'Recoge, ordena y sigue las incidencias de tus clientes o de tu equipo.' },
]
