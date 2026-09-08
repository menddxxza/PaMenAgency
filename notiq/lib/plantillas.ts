import { nuevoBloque, type Bloque } from '@/lib/bloques';

export type Plantilla = {
  id: string;
  nombre: string;
  icono: string;
  /** Función y no un valor fijo: la fecha del título tiene que ser la de hoy, no
   * la del momento en que se cargó la página. */
  crear: () => { titulo: string; bloques: Bloque[] };
};

const fechaHoy = () =>
  new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'reunion',
    nombre: 'Notas de reunión',
    icono: '🗓️',
    crear: () => ({
      titulo: `Reunión — ${fechaHoy()}`,
      bloques: [
        nuevoBloque('subtitulo', 'Asistentes'),
        nuevoBloque('lista', ''),
        nuevoBloque('subtitulo', 'Temas tratados'),
        nuevoBloque('texto', ''),
        nuevoBloque('subtitulo', 'Acuerdos y tareas'),
        nuevoBloque('tarea', ''),
      ],
    }),
  },
  {
    id: 'lista-compra',
    nombre: 'Lista de la compra',
    icono: '🛒',
    crear: () => ({ titulo: 'Lista de la compra', bloques: [nuevoBloque('tarea', '')] }),
  },
  {
    id: 'diario',
    nombre: 'Entrada de diario',
    icono: '📔',
    crear: () => ({
      titulo: fechaHoy(),
      bloques: [
        nuevoBloque('subtitulo', 'Cómo ha ido el día'),
        nuevoBloque('texto', ''),
        nuevoBloque('subtitulo', 'Algo que agradecer'),
        nuevoBloque('texto', ''),
      ],
    }),
  },
];
