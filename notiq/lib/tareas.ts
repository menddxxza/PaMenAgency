export type Tarea = {
  id: string;
  titulo: string;
  estado: 'pendiente' | 'en_curso' | 'hecha';
  prioridad: 'urgente' | 'alta' | 'normal' | 'baja';
  vence: string | null;
  note_id: string | null;
  origen: 'manual' | 'ia';
};

export const COLUMNAS: { estado: Tarea['estado']; etiqueta: string }[] = [
  { estado: 'pendiente', etiqueta: 'Pendiente' },
  { estado: 'en_curso', etiqueta: 'En curso' },
  { estado: 'hecha', etiqueta: 'Hecha' },
];

export const PRIORIDADES: { valor: Tarea['prioridad']; etiqueta: string; clase: string }[] = [
  { valor: 'urgente', etiqueta: 'Urgente', clase: 'border-red-200 bg-red-50 text-red-700' },
  { valor: 'alta', etiqueta: 'Alta', clase: 'border-orange-200 bg-orange-50 text-orange-700' },
  { valor: 'normal', etiqueta: 'Normal', clase: 'border-ink/10 bg-ink/[0.03] text-ink/65' },
  { valor: 'baja', etiqueta: 'Baja', clase: 'border-ink/10 bg-ink/[0.02] text-ink/45' },
];

export function clasePrioridad(prioridad: Tarea['prioridad']): string {
  return PRIORIDADES.find((p) => p.valor === prioridad)?.clase ?? PRIORIDADES[2].clase;
}

export function etiquetaPrioridad(prioridad: Tarea['prioridad']): string {
  return PRIORIDADES.find((p) => p.valor === prioridad)?.etiqueta ?? 'Normal';
}

/**
 * Orden de la matriz urgente/importante: primero lo que vence antes, y a igualdad de
 * fecha lo más prioritario. Las tareas sin fecha van al final, no al principio: no
 * tener fecha no las hace urgentes.
 */
export function ordenarPorUrgencia(tareas: Tarea[]): Tarea[] {
  const peso: Record<Tarea['prioridad'], number> = { urgente: 0, alta: 1, normal: 2, baja: 3 };

  return [...tareas].sort((a, b) => {
    if (a.vence && b.vence && a.vence !== b.vence) return a.vence < b.vence ? -1 : 1;
    if (a.vence && !b.vence) return -1;
    if (!a.vence && b.vence) return 1;
    return peso[a.prioridad] - peso[b.prioridad];
  });
}

/** Etiqueta relativa de la fecha de vencimiento ("Hoy", "Mañana", "3 mar"). */
export function etiquetaVencimiento(vence: string | null): { texto: string; vencida: boolean } | null {
  if (!vence) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  // El date de Postgres llega como 'YYYY-MM-DD'; construirlo así (y no con new
  // Date(vence)) evita que se interprete como UTC y se desplace un día.
  const [ano, mes, dia] = vence.split('-').map(Number);
  const fecha = new Date(ano, mes - 1, dia);

  const dias = Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);

  if (dias === 0) return { texto: 'Hoy', vencida: false };
  if (dias === 1) return { texto: 'Mañana', vencida: false };
  if (dias === -1) return { texto: 'Ayer', vencida: true };
  if (dias < 0) return { texto: `Hace ${Math.abs(dias)} días`, vencida: true };

  return {
    texto: fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    vencida: false,
  };
}
