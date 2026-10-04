/**
 * Mini-diagnóstico: versión de tres preguntas del diagnóstico completo
 * (`diagnostic.ts`), pensada como enganche rápido en páginas contextuales
 * (sectores, guías) donde pedir diez respuestas sería pedir demasiado.
 *
 * No sustituye al diagnóstico de /diagnostico —con sus diez preguntas y
 * sus áreas candidatas—; lo precede. El resultado siempre ofrece seguir
 * al diagnóstico completo o directamente a la auditoría. Mismo cálculo en
 * el navegador, nada se envía ni se guarda.
 */
export type MiniOption = { label: string; score: 0 | 1 | 2 | 3 }
export type MiniQuestion = { id: string; question: string; options: MiniOption[] }

export const miniQuestions: MiniQuestion[] = [
  {
    id: 'repetitivas',
    question: '¿Cuánto de tu semana se va en tareas que haces siempre igual?',
    options: [
      { label: 'Casi nada', score: 0 },
      { label: 'Una parte', score: 1 },
      { label: 'Buena parte', score: 2 },
      { label: 'La mayoría', score: 3 },
    ],
  },
  {
    id: 'documentos',
    question: '¿Tenéis consultas o documentos de los que sacáis siempre la misma información?',
    options: [
      { label: 'Casi nunca', score: 0 },
      { label: 'Algunos', score: 1 },
      { label: 'A diario', score: 2 },
      { label: 'Es el centro del trabajo', score: 3 },
    ],
  },
  {
    id: 'procesos',
    question: '¿Alguien pasa información a mano entre herramientas distintas?',
    options: [
      { label: 'No, todo está conectado', score: 0 },
      { label: 'Algunas cosas sí', score: 1 },
      { label: 'Casi todo', score: 2 },
      { label: 'Todo, cada vez', score: 3 },
    ],
  },
]

export const miniMaxScore = miniQuestions.length * 3

export type MiniLevel = { key: 'alto' | 'medio' | 'bajo'; label: string; texto: string }

export function getMiniLevel(score: number): MiniLevel {
  const pct = (score / miniMaxScore) * 100
  if (pct >= 65)
    return {
      key: 'alto',
      label: 'Hay margen claro',
      texto:
        'Lo que describes es justo el tipo de patrón donde una auditoría suele encontrar algo que merece la pena mover.',
    }
  if (pct >= 30)
    return {
      key: 'medio',
      label: 'Puede haber margen',
      texto: 'Hay alguna señal, pero no suficiente para saberlo sin mirar más de cerca.',
    }
  return {
    key: 'bajo',
    label: 'Poco margen por ahora',
    texto: 'Con lo que cuentas, hoy no parece el momento. El diagnóstico completo afina más.',
  }
}
