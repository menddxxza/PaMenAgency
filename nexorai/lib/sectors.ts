export interface SectorConfig {
  slug: string;
  name: string;
  namePlural: string;
  tagline: string;
  description: string;
  avgTicketHint: string;
  channels: string[];
  /** Multiplicador aplicado por el audit engine (1 = neutro). */
  opportunityMultiplier: number;
}

export const SECTORS: SectorConfig[] = [
  {
    slug: 'inmobiliarias',
    name: 'Inmobiliaria',
    namePlural: 'Inmobiliarias',
    tagline: 'Cada lead sin seguimiento es una comisión perdida.',
    description:
      'Agencias y agentes inmobiliarios vinculan cada nuevo cliente a un ticket alto y a un ciclo de decisión largo: recuperar contactos antiguos y automatizar el seguimiento tiene un impacto directo y medible en el cierre de operaciones.',
    avgTicketHint: '3.000€ – 15.000€ por operación cerrada',
    channels: ['Portales inmobiliarios', 'Referidos', 'Redes sociales', 'Captación en calle'],
    opportunityMultiplier: 1.15,
  },
  {
    slug: 'clinicas',
    name: 'Clínica',
    namePlural: 'Clínicas',
    tagline: 'Pacientes que no vuelven son ingresos recurrentes perdidos.',
    description:
      'Clínicas dentales, estéticas y de fisioterapia dependen de la reactivación de pacientes y de la conversión de primeras consultas: el seguimiento automatizado suele ser la palanca de crecimiento más rápida de activar.',
    avgTicketHint: '80€ – 2.500€ por tratamiento',
    channels: ['Google', 'Referidos', 'Redes sociales', 'Seguros médicos'],
    opportunityMultiplier: 1.0,
  },
  {
    slug: 'abogados',
    name: 'Despacho de abogados',
    namePlural: 'Despachos de abogados',
    tagline: 'Cada consulta sin cerrar es un cliente que se va a la competencia.',
    description:
      'Despachos legales generan consultas de alto valor pero con baja tasa de cierre por falta de seguimiento estructurado: cualificar y dar seguimiento sistemático a cada consulta mejora directamente la facturación.',
    avgTicketHint: '500€ – 10.000€ por caso',
    channels: ['Referidos', 'Google', 'Networking', 'Web'],
    opportunityMultiplier: 1.1,
  },
  {
    slug: 'gimnasios',
    name: 'Gimnasio',
    namePlural: 'Gimnasios',
    tagline: 'Las bajas se recuperan más barato de lo que cuesta captar un socio nuevo.',
    description:
      'Centros deportivos viven de la retención de socios y de convertir pruebas gratuitas en altas: reactivar bajas recientes y automatizar el seguimiento de leads de prueba es la oportunidad más rentable del sector.',
    avgTicketHint: '30€ – 90€/mes por socio',
    channels: ['Redes sociales', 'Referidos', 'Zona de influencia', 'Promociones locales'],
    opportunityMultiplier: 0.85,
  },
  {
    slug: 'talleres',
    name: 'Taller mecánico',
    namePlural: 'Talleres mecánicos',
    tagline: 'El recordatorio de revisión que nunca se envía es facturación que se pierde.',
    description:
      'Talleres y centros de mantenimiento dependen de la recurrencia: recordatorios de revisión y seguimiento de presupuestos no aceptados suelen ser la mayor bolsa de ingresos sin explotar.',
    avgTicketHint: '80€ – 900€ por servicio',
    channels: ['Recomendación', 'Zona de influencia', 'Google', 'Flotas'],
    opportunityMultiplier: 0.9,
  },
];

export function getSector(slug: string): SectorConfig | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
