/**
 * Historial de novedades que se enseña en el botón "🎉 Novedades" del panel
 * (ver components/panel/Novedades.tsx). Lista a mano, no generada: cada
 * entrada nueva se añade arriba del todo al lanzar algo que de verdad
 * cambie lo que el usuario puede hacer — no cada arreglo interno.
 */
export type EntradaChangelog = {
  /** YYYY-MM-DD, para poder comparar con la fecha de última visita. */
  fecha: string;
  titulo: string;
  descripcion: string;
};

export const CHANGELOG: EntradaChangelog[] = [
  {
    fecha: '2026-09-28',
    titulo: 'Primeros pasos en Inicio',
    descripcion: 'Una lista de cuatro pasos para conocer lo esencial de Notiq al empezar: crear una nota, una tarea, hablar con el asistente y probar Estudio.',
  },
  {
    fecha: '2026-09-17',
    titulo: 'Guardado de notas más fiable',
    descripcion: 'Corregido un fallo de fondo que en algunos casos podía hacer que una nota pareciera vacía al reabrirla.',
  },
  {
    fecha: '2026-09-15',
    titulo: 'Estudio: flashcards, exámenes y grabar clase',
    descripcion: 'Nueva pestaña Estudio: flashcards con repaso espaciado, generador de exámenes con corrección automática y análisis de fallos, y "Grabar clase" para convertir audio en apuntes.',
  },
  {
    fecha: '2026-09-14',
    titulo: 'Modo oscuro, plantillas y backlinks',
    descripcion: 'Modo oscuro en Ajustes, paleta de comandos (Ctrl/Cmd+K), plantillas de nota, exportar a Markdown o PDF, enlaces entre notas con [[Título]] y arrastrar imágenes directamente al editor.',
  },
  {
    fecha: '2026-09-08',
    titulo: 'Etiquetas y papelera',
    descripcion: 'Etiquetas para organizar tus notas y una papelera para recuperar las que borres por error.',
  },
];
