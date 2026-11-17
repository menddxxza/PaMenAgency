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
  /** Bloque de planes: antetítulo, titular (la palabra en oro va aparte) y nota. */
  planesTitulo: string
  planesLema: [string, string, string]
  planesNota: string
}

export const facturas: Herramienta = {
  slug: 'facturas',
  nombre: 'Lector de facturas',
  ruta: '/facturas/',
  frase: 'Tus facturas, leídas solas.',
  descripcion:
    'La IA lee tus facturas, comprueba que cuadran y las deja listas para tu gestoría.',
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
  planesTitulo: 'Planes del lector de facturas',
  planesLema: ['Pagas según lo que ', 'lees', '.'],
  planesNota: 'Las facturas de ejemplo y los duplicados no cuentan.',
}

export const asistente: Herramienta = {
  slug: 'asistente',
  nombre: 'Asistente de documentos',
  ruta: '/asistente/',
  frase: 'Pregunta a tus documentos.',
  descripcion:
    'Tu equipo pregunta y responde con los documentos de tu empresa, citando la página.',
  puntos: [
    'Lee PDF, Word y texto',
    'Cita el documento y la página',
    'Si no lo sabe, no se lo inventa',
    'Permisos por departamento',
  ],
  prueba: '30 preguntas gratis para probar. Sin tarjeta.',
  planes: [
    {
      nombre: 'Básico',
      precio: 19,
      ventajas: ['Hasta 300 preguntas al mes', 'Hasta 50 documentos', '3 usuarios'],
    },
    {
      nombre: 'Profesional',
      precio: 49,
      destacado: true,
      ventajas: ['Hasta 1.500 preguntas al mes', 'Hasta 300 documentos', '10 usuarios', 'Permisos por departamento'],
    },
    {
      nombre: 'Empresa',
      precio: 99,
      ventajas: [
        'Hasta 5.000 preguntas al mes',
        'Hasta 2.000 documentos',
        'Usuarios ilimitados',
        'Permisos por departamento',
        'Entrada automática desde una carpeta o n8n',
      ],
    },
  ],
  planesTitulo: 'Planes del asistente',
  planesLema: ['Pagas según lo que ', 'preguntas', '.'],
  planesNota: 'Los documentos de ejemplo no cuentan.',
}

export const incidencias: Herramienta = {
  slug: 'incidencias',
  nombre: 'Gestor de incidencias',
  ruta: '/incidencias/',
  frase: 'Cada incidencia, en su sitio.',
  descripcion:
    'Tus clientes abren incidencias y llegan clasificadas a la persona que toca.',
  puntos: [
    'Formulario para tus clientes, con tu nombre',
    'Categoría, prioridad y plazo automáticos',
    'Asignación por reglas a cada persona',
    'Historial de cada cliente',
  ],
  prueba: '30 incidencias gratis para probar. Sin tarjeta.',
  planes: [
    {
      nombre: 'Básico',
      precio: 19,
      ventajas: ['Hasta 200 incidencias al mes', '3 usuarios', 'Formulario y clasificación con IA'],
    },
    {
      nombre: 'Profesional',
      precio: 49,
      destacado: true,
      ventajas: ['Hasta 1.000 incidencias al mes', '10 usuarios', 'Asignación automática por reglas'],
    },
    {
      nombre: 'Empresa',
      precio: 99,
      ventajas: [
        'Hasta 5.000 incidencias al mes',
        'Usuarios ilimitados',
        'Asignación automática por reglas',
        'Entrada automática desde el correo (n8n)',
      ],
    },
  ],
  planesTitulo: 'Planes del gestor de incidencias',
  planesLema: ['Pagas según lo que ', 'recibes', '.'],
  planesNota: 'Las incidencias de ejemplo no cuentan.',
}

export const presupuestos: Herramienta = {
  slug: 'presupuestos',
  nombre: 'Presupuestos para reformas',
  ruta: '/presupuestos/',
  frase: 'Presupuestos en minutos.',
  descripcion:
    'Para reformas e instalaciones: cuentas el trabajo con texto, voz o fotos y sale el presupuesto con tus precios.',
  puntos: [
    'Texto, nota de voz o fotos de la obra',
    'Solo tus precios: la IA no se inventa importes',
    'PDF con tu logo y aceptación en línea',
    'Aviso cuando toca llamar al cliente',
  ],
  prueba: '15 presupuestos gratis para probar. Sin tarjeta.',
  planes: [
    {
      nombre: 'Básico',
      precio: 19,
      ventajas: ['Hasta 60 presupuestos al mes', '2 usuarios', 'Borradores con IA, PDF y aceptación en línea'],
    },
    {
      nombre: 'Profesional',
      precio: 49,
      destacado: true,
      ventajas: ['Hasta 300 presupuestos al mes', '5 usuarios', 'Recordatorio automático al cliente'],
    },
    {
      nombre: 'Empresa',
      precio: 99,
      ventajas: [
        'Hasta 1.500 presupuestos al mes',
        'Usuarios ilimitados',
        'Recordatorio automático al cliente',
        'Entrada automática (WhatsApp, n8n o tu web)',
      ],
    },
  ],
  planesTitulo: 'Planes de presupuestos',
  planesLema: ['Pagas según lo que ', 'presupuestas', '.'],
  planesNota: 'Los presupuestos de ejemplo no cuentan.',
}

export const herramientas: Herramienta[] = [facturas, asistente, incidencias, presupuestos]

/** Las siguientes herramientas, aún sin fecha: no se prometen funciones concretas. */
export const proximamente: { nombre: string; texto: string }[] = []
