export type Categoria = {
  slug: string;
  nombre: string;
  icono: string;
  descripcion: string;
};

/** Las 10 categorías verticales de IAPyme. Mismo orden y slugs que el seed de Supabase. */
export const CATEGORIAS: Categoria[] = [
  {
    slug: 'atencion-al-cliente',
    nombre: 'Atención al cliente',
    icono: '💬',
    descripcion: 'Chatbots, agentes de WhatsApp, helpdesk.',
  },
  {
    slug: 'salud-y-clinicas',
    nombre: 'Salud y clínicas',
    icono: '🏥',
    descripcion: 'Agendamiento, recordatorios, triaje.',
  },
  {
    slug: 'finanzas-y-facturacion',
    nombre: 'Finanzas y facturación',
    icono: '💰',
    descripcion: 'Facturación automática, cobros, conciliación.',
  },
  {
    slug: 'marketing-y-contenido',
    nombre: 'Marketing y contenido',
    icono: '📱',
    descripcion: 'Generación de contenido, SEO, redes.',
  },
  {
    slug: 'productividad',
    nombre: 'Productividad',
    icono: '⚡',
    descripcion: 'Resúmenes, transcripciones, gestión de tareas.',
  },
  {
    slug: 'ventas-y-crm',
    nombre: 'Ventas y CRM',
    icono: '📈',
    descripcion: 'Lead scoring, seguimiento, propuestas.',
  },
  {
    slug: 'ecommerce',
    nombre: 'Ecommerce',
    icono: '🛒',
    descripcion: 'Recomendadores, atención post-venta, logística.',
  },
  {
    slug: 'educacion',
    nombre: 'Educación',
    icono: '📚',
    descripcion: 'Tutores IA, generación de cursos, evaluación.',
  },
  {
    slug: 'legal-y-compliance',
    nombre: 'Legal y compliance',
    icono: '⚖️',
    descripcion: 'Contratos, RGPD, análisis de documentos.',
  },
  {
    slug: 'recursos-humanos',
    nombre: 'Recursos humanos',
    icono: '👥',
    descripcion: 'Filtrado de CVs, onboarding, evaluación.',
  },
];
