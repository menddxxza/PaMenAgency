/**
 * Estructura de precios editable — nada de esto está conectado a cobro real
 * todavía (ver PROJECT_ANALYSIS.md). Se muestra como referencia y puede
 * cambiarse sin tocar el resto de la app.
 */
export interface PlanConfig {
  id: 'starter' | 'pro' | 'business' | 'performance';
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export const PLANS: PlanConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '99€',
    priceNote: '/mes',
    description: 'Para validar el motor de oportunidades en un solo negocio.',
    features: [
      '1 negocio conectado',
      'AI Business Audit ilimitado',
      '2 agentes activos',
      'Dashboard de resultados',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '499€',
    priceNote: '/mes',
    description: 'Para negocios que quieren todos los agentes trabajando a la vez.',
    features: [
      'Hasta 3 negocios',
      '6 agentes activos',
      'Action Center + Revenue Timeline',
      'Soporte prioritario',
    ],
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '1.499€',
    priceNote: '/mes',
    description: 'Para agencias y grupos con varias unidades de negocio.',
    features: [
      'Negocios ilimitados',
      'Todos los agentes + prioridad de cómputo',
      'Onboarding asistido',
      'Acceso a API (próximamente)',
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    price: 'Precio base + 5%',
    priceNote: 'del revenue atribuible',
    description: 'Pagas menos fijo y compartimos el resultado que generamos.',
    features: [
      'Todo lo de Business',
      'Success fee sobre ingreso confirmado y atribuido',
      'Revisión mensual de atribución',
      'A medida según volumen',
    ],
  },
];
