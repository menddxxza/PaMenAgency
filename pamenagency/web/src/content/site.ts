/**
 * Configuración central del sitio.
 *
 * Todo lo que aquí aparece marcado como `PENDIENTE` es un dato real de la
 * empresa que todavía no se ha facilitado. No se inventa: se muestra en la web
 * con un marcador visible (`<Placeholder />`) para que sea imposible publicar
 * información legal falsa por descuido.
 */

export const PENDIENTE = 'PENDIENTE' as const

/** Datos identificativos y de contacto. */
export const site = {
  name: 'PaMenAgency',
  /** El nombre se compone en dos piezas para poder darle tratamiento visual. */
  wordmark: { first: 'PAMEN', second: 'AGENCY' },
  tagline: 'Convierte la Inteligencia Artificial en una ventaja real.',
  description:
    'PaMenAgency es una agencia de Inteligencia Artificial y centro de conocimiento. Ayudamos a personas, PYMEs y empresas a entender, implementar y aprovechar la IA con criterio.',
  /** Dominio definitivo aún sin confirmar: se usa para canonical, OG y sitemap. */
  url: 'https://www.pamenagency.com',
  locale: 'es_ES',
  lang: 'es',
  email: 'soporte.atiende@gmail.com',
  /** Sin número confirmado: la web no muestra teléfono hasta que exista. */
  phone: null as string | null,
  whatsapp: null as string | null,
  social: [
    { name: 'Instagram', url: 'https://www.instagram.com/pamenagency' as string | null },
    { name: 'TikTok', url: 'https://www.tiktok.com/@pamenagency' as string | null },
    { name: 'LinkedIn', url: null as string | null },
  ],
} as const

/** Navegación principal. El orden es también el orden del relato de la home. */
export const mainNav = [
  { label: 'Inicio', to: '/' },
  { label: 'Quiénes somos', to: '/nosotros' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'IA para todos', to: '/ia-para-todos' },
  { label: 'Conocimiento', to: '/conocimiento' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contacto', to: '/contacto' },
] as const

/** Enlaces del pie, agrupados por columna. */
export const footerNav = [
  {
    title: 'Agencia',
    links: [
      { label: 'Quiénes somos', to: '/nosotros' },
      { label: 'Metodología', to: '/metodologia' },
      { label: 'Servicios', to: '/servicios' },
      { label: 'Diagnóstico', to: '/diagnostico' },
      { label: 'Contacto', to: '/contacto' },
    ],
  },
  {
    title: 'Conocimiento',
    links: [
      { label: 'Centro de conocimiento', to: '/conocimiento' },
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
