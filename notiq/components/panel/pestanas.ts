export const PESTANAS = [
  { id: 'inicio', etiqueta: 'Inicio', emoji: '🏠' },
  { id: 'notas', etiqueta: 'Notas', emoji: '📝' },
  { id: 'tareas', etiqueta: 'Tareas', emoji: '✅' },
  { id: 'estudio', etiqueta: 'Estudio', emoji: '🎓' },
  { id: 'asistente', etiqueta: 'Asistente', emoji: '🤖' },
  { id: 'ajustes', etiqueta: 'Ajustes', emoji: '⚙️' },
] as const;

export type Pestana = (typeof PESTANAS)[number]['id'];
