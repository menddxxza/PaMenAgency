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

export type Tab = {
  label: string
  to: string
  /** Una línea que aparece bajo el nombre en el menú. */
  hint: string
}

/**
 * Las seis pestañas de la web: todo lo que hay en el menú de las tres
 * barras. Son rutas propias, no anclas de una página larga, así que cada
 * pestaña se puede enlazar y compartir por separado.
 *
 * El resto de páginas (guías, calculadora, diagnóstico, auditoría IA,
 * escenarios…) no están en el menú pero siguen existiendo: sus enlaces y su
 * posición en Google no se pierden, y el pie las recoge en "Más recursos".
 */
export const tabs: Tab[] = [
  { label: 'Inicio', to: '/', hint: 'Qué hacemos, en un vistazo' },
  { label: 'Servicios', to: '/servicios', hint: 'Diez formas de trabajar la IA' },
  { label: 'Cómo trabajamos', to: '/metodologia', hint: 'Seis fases, siempre en orden' },
  { label: 'Sectores', to: '/sectores', hint: 'Dónde aporta en cada negocio' },
  { label: 'Nosotros', to: '/nosotros', hint: 'Quién hay detrás' },
  { label: 'Contacto', to: '/contacto', hint: 'Cuéntanos tu caso' },
]

/** Páginas fuera del menú que el pie sigue enlazando. */
export const moreResources: { label: string; to: string }[] = [
  { label: 'Auditoría de IA', to: '/auditoria-ia' },
  { label: 'Diagnóstico gratuito', to: '/diagnostico' },
  { label: 'Centro de conocimiento', to: '/conocimiento' },
  { label: 'Calculadora de coste', to: '/calculadora' },
  { label: 'Soluciones', to: '/soluciones' },
  { label: 'Preguntas frecuentes', to: '/faq' },
]

/** Enlaces legales del pie. */
export const legalNav: { label: string; to: string }[] = [
  { label: 'Aviso legal', to: '/legal/aviso-legal' },
  { label: 'Privacidad', to: '/legal/privacidad' },
  { label: 'Cookies', to: '/legal/cookies' },
  { label: 'Términos', to: '/legal/terminos' },
]
