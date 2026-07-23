import type { PlanTier } from '@/types/database.types'

export interface PlanDefinition {
  id: PlanTier
  name: string
  priceLabel: string
  monthlyPriceEur: number
  maxTeamMembers: number
  maxBusinesses: number
  hasClientes: boolean
  hasEstadisticas: boolean
  hasFacturacion: boolean
  hasInventario: boolean
  features: string[]
}

// Única fuente de verdad para nombres/precios/límites que se muestran en la
// landing, el paywall y el gating de navegación. Los Price ID reales de
// Stripe viven como secretos de Supabase (STRIPE_PRICE_STARTER, etc.), no
// aquí — así cambiar un precio en Stripe no obliga a tocar código.
export const PLANS: Record<PlanTier, PlanDefinition> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceLabel: '19€/mes',
    monthlyPriceEur: 19,
    maxTeamMembers: 1,
    maxBusinesses: 1,
    hasClientes: false,
    hasEstadisticas: false,
    hasFacturacion: false,
    hasInventario: false,
    features: ['Citas (hasta 50/mes)', 'Conversaciones + bot de WhatsApp', '1 usuario', '1 negocio'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceLabel: '49€/mes',
    monthlyPriceEur: 49,
    maxTeamMembers: 5,
    maxBusinesses: 1,
    hasClientes: true,
    hasEstadisticas: true,
    hasFacturacion: true,
    hasInventario: true,
    features: [
      'Citas ilimitadas',
      'Clientes (CRM)',
      'Facturación',
      'Inventario',
      'Estadísticas',
      'Hasta 5 usuarios',
      '1 negocio',
    ],
  },
  agencia: {
    id: 'agencia',
    name: 'Agencia',
    priceLabel: '99€/mes',
    monthlyPriceEur: 99,
    maxTeamMembers: Infinity,
    maxBusinesses: Infinity,
    hasClientes: true,
    hasEstadisticas: true,
    hasFacturacion: true,
    hasInventario: true,
    features: ['Todo lo de Pro', 'Negocios ilimitados', 'Equipo ilimitado', 'Soporte prioritario'],
  },
}

export const PLAN_ORDER: PlanTier[] = ['starter', 'pro', 'agencia']
export const PLANS_LIST = PLAN_ORDER.map((id) => PLANS[id])
