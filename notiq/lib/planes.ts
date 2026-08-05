/**
 * Los tres planes de Notiq y lo que incluye cada uno.
 *
 * Esta tabla es la única fuente de verdad de los límites: la usan el servidor para
 * cortar (lib/ia/limites.ts) y la página de precios para pintarlos. Si cambian los
 * precios o las cuotas, se cambian aquí y no en seis sitios.
 */

export type Plan = 'free' | 'pro' | 'team';

export type LimitesPlan = {
  id: Plan;
  nombre: string;
  precio: number;
  /** Notas totales que puede tener la cuenta. null = sin límite. */
  notas: number | null;
  /** Llamadas a la IA al mes (resúmenes, extracción de tareas y chat). */
  operacionesIaMes: number;
  /** Colaboración en tiempo real sobre notas y tareas. */
  colaboracion: boolean;
  reclamo: string;
  incluye: string[];
};

export const PLANES: Record<Plan, LimitesPlan> = {
  free: {
    id: 'free',
    nombre: 'Free',
    precio: 0,
    notas: 50,
    operacionesIaMes: 20,
    colaboracion: false,
    reclamo: 'Para probar Notiq con tus notas de verdad.',
    incluye: [
      '50 notas',
      '20 operaciones de IA al mes',
      'Tareas ilimitadas',
      'Búsqueda full-text',
    ],
  },
  pro: {
    id: 'pro',
    nombre: 'Pro',
    precio: 9,
    notas: null,
    operacionesIaMes: 500,
    colaboracion: false,
    reclamo: 'Para quien vive dentro de sus notas.',
    incluye: [
      'Notas ilimitadas',
      '500 operaciones de IA al mes',
      'Asistente con contexto de todo tu espacio',
      'Sincronización multidispositivo',
    ],
  },
  team: {
    id: 'team',
    nombre: 'Team',
    precio: 19,
    notas: null,
    operacionesIaMes: 2000,
    colaboracion: true,
    reclamo: 'Para equipos pequeños que comparten contexto.',
    incluye: [
      'Todo lo de Pro',
      '2.000 operaciones de IA al mes',
      'Colaboración en tiempo real',
      'Espacios compartidos por equipo',
    ],
  },
};

export const ORDEN_PLANES: Plan[] = ['free', 'pro', 'team'];

/** Normaliza lo que venga de la base de datos a un plan conocido. */
export function comoPlan(valor: string | null | undefined): Plan {
  return valor === 'pro' || valor === 'team' ? valor : 'free';
}

export function limitesDe(plan: string | null | undefined): LimitesPlan {
  return PLANES[comoPlan(plan)];
}
