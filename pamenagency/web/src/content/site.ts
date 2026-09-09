/** Configuración central del sitio. */

/** Datos identificativos y de contacto. */
export const site = {
  name: 'PaMenAgency',
  /** El nombre se compone en dos piezas para poder darle tratamiento visual. */
  wordmark: { first: 'PAMEN', second: 'AGENCY' },
  tagline: 'Convierte la Inteligencia Artificial en una ventaja real.',
  description:
    'PaMenAgency es una agencia de Inteligencia Artificial y centro de conocimiento. Ayudamos a personas, PYMEs y empresas a entender, implementar y aprovechar la IA con criterio.',
  /** Dominio definitivo: se usa para canonical, OG y sitemap. */
  url: 'https://pamenagency.com',
  locale: 'es_ES',
  lang: 'es',
  email: 'soporte.atiende@gmail.com',
  phone: '+34 600 366 395' as string | null,
  whatsapp: null as string | null,
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/pamenagency' as string | null },
    { name: 'TikTok', url: 'https://www.tiktok.com/@pamenagency' as string | null },
  ],
} as const

export type NavChild = { label: string; to: string; hint?: string }

export type NavItem = {
  label: string
  /** Destino propio. Los grupos que sólo agrupan no lo tienen. */
  to?: string
  /** Si existe, el elemento se despliega en escritorio. */
  children?: NavChild[]
}

/**
 * Navegación principal.
 *
 * Se mantiene en **siete elementos de primer nivel** a propósito: el header
 * conmuta al menú hamburguesa en 1240px y ese corte está calibrado justo
 * para este ancho (ver el comentario del breakpoint en components.css).
 * Como el sitio ya tiene más destinos que huecos, los que no caben cuelgan
 * de un desplegable en vez de ensanchar la barra. Las etiquetas nuevas son
 * además más cortas que las que sustituyen, así que el corte no sufre.
 *
 * La auditoría no está aquí: es el botón destacado del header, y repetirla
 * como enlace restaría fuerza al CTA.
 */
export const mainNav: NavItem[] = [
  { label: 'Inicio', to: '/' },
  {
    label: 'Soluciones',
    to: '/soluciones',
    children: [
      { label: 'Ver las siete', to: '/soluciones', hint: 'Índice completo' },
      { label: 'IA para vender más', to: '/soluciones/ingresos' },
      { label: 'IA para operaciones', to: '/soluciones/operaciones' },
      { label: 'IA para atención al cliente', to: '/soluciones/atencion-al-cliente' },
      { label: 'Agentes de IA', to: '/soluciones/agentes' },
      { label: 'Conocimiento interno', to: '/soluciones/conocimiento-interno' },
      { label: 'Preparación de datos', to: '/soluciones/datos' },
      { label: 'Gobernanza de IA', to: '/soluciones/gobernanza' },
    ],
  },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Sectores', to: '/sectores' },
  {
    label: 'Recursos',
    children: [
      { label: 'Centro de conocimiento', to: '/conocimiento', hint: '14 guías, sin registro' },
      { label: 'Calculadora de coste', to: '/calculadora', hint: 'Lo que te cuesta hoy' },
      { label: 'Escenarios', to: '/escenarios', hint: 'Proyectos de ejemplo' },
      { label: 'Diagnóstico gratuito', to: '/diagnostico' },
      { label: 'IA para todos', to: '/ia-para-todos' },
      { label: 'Las grietas de la IA', to: '/grietas-de-la-ia' },
      { label: 'Preguntas frecuentes', to: '/faq' },
    ],
  },
  {
    label: 'Agencia',
    children: [
      { label: 'Quiénes somos', to: '/nosotros' },
      { label: 'Metodología', to: '/metodologia' },
    ],
  },
  { label: 'Contacto', to: '/contacto' },
]

/**
 * La misma navegación aplanada, para el menú móvil.
 *
 * En móvil no hay desplegables: la rueda ya es una lista recorrible, así
 * que los hijos suben a primer nivel. Se deriva de `mainNav` para que no
 * puedan desincronizarse. Se descarta el hijo que repite el destino de su
 * padre (el "Ver las siete" de Soluciones) para no listarlo dos veces.
 */
export const mobileNav: { label: string; to: string }[] = mainNav.flatMap((item) => {
  const propio = item.to ? [{ label: item.label, to: item.to }] : []
  const hijos = (item.children ?? [])
    .filter((c) => c.to !== item.to)
    .map((c) => ({ label: c.label, to: c.to }))
  // Las soluciones concretas no entran en móvil: su índice ya las lista y
  // meter siete más haría la rueda inmanejable.
  return item.label === 'Soluciones' ? propio : [...propio, ...hijos]
})

/** Enlaces del pie, agrupados por columna. */
export const footerNav = [
  {
    title: 'Agencia',
    links: [
      { label: 'Quiénes somos', to: '/nosotros' },
      { label: 'Auditoría de IA', to: '/auditoria-ia' },
      { label: 'Soluciones', to: '/soluciones' },
      { label: 'Servicios', to: '/servicios' },
      { label: 'Sectores', to: '/sectores' },
      { label: 'Escenarios', to: '/escenarios' },
      { label: 'Metodología', to: '/metodologia' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
  {
    title: 'Conocimiento',
    links: [
      { label: 'Centro de conocimiento', to: '/conocimiento' },
      { label: 'Diagnóstico gratuito', to: '/diagnostico' },
      { label: 'Calculadora de coste', to: '/calculadora' },
      { label: 'IA para todos', to: '/ia-para-todos' },
      { label: 'Las grietas de la IA', to: '/grietas-de-la-ia' },
      { label: 'Preguntas frecuentes', to: '/faq' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Aviso legal', to: '/legal/aviso-legal' },
      { label: 'Política de privacidad', to: '/legal/privacidad' },
      { label: 'Política de cookies', to: '/legal/cookies' },
      { label: 'Términos y condiciones', to: '/legal/terminos' },
      { label: 'Tratamiento de datos', to: '/legal/tratamiento-de-datos' },
    ],
  },
] as const
