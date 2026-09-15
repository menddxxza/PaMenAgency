/** Días de hoy (a medianoche local) hasta una fecha "YYYY-MM-DD". Negativo si ya pasó. */
export function diasHasta(fechaISO: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = new Date(`${fechaISO}T00:00:00`);
  return Math.round((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export type DiaPlan = { etiqueta: string; tarea: string };

/**
 * Plan de repaso día a día hasta el examen — una regla fija, no generada por IA:
 * pedirle a un modelo que ordene "repasa / haz un test / simulacro" según cuántos
 * días queden es gastar una llamada de pago en algo que un puñado de condiciones
 * ya resuelve igual de bien. Los dos últimos días antes del examen son siempre
 * simulacro completo y luego repaso ligero; el resto alterna entre repasar
 * flashcards flojas y hacer un examen de práctica nuevo.
 */
export function generarPlanRepaso(diasRestantes: number): DiaPlan[] {
  if (diasRestantes <= 0) return [];

  const plan: DiaPlan[] = [];
  for (let i = 0; i < diasRestantes; i++) {
    const faltan = diasRestantes - i;
    let tarea: string;
    if (faltan === 1) tarea = 'Repaso ligero — nada nuevo, solo lo que sigue flojo';
    else if (faltan === 2) tarea = 'Simulacro de examen completo';
    else if (i % 2 === 0) tarea = 'Repasar flashcards flojas (🔴 y 🟡)';
    else tarea = 'Hacer un examen de práctica nuevo';

    plan.push({
      etiqueta: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : `En ${i} días`,
      tarea,
    });
  }
  return plan;
}
