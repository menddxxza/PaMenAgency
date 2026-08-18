import { clasePrioridad, etiquetaPrioridad } from '@/lib/tareas';

const TAREAS_EJEMPLO: { titulo: string; prioridad: 'urgente' | 'alta' | 'normal' }[] = [
  { titulo: 'Enviar propuesta a Marta', prioridad: 'urgente' },
  { titulo: 'Revisar maqueta con diseño', prioridad: 'alta' },
  { titulo: 'Agendar seguimiento', prioridad: 'normal' },
];

/**
 * Vista previa del producto para el hero: la propia idea del pitch ("escribes la
 * reunión, Notiq saca las tareas") convertida en una imagen, en vez de solo
 * contarla en texto. Construida con los mismos tokens y clases que el producto
 * real (clasePrioridad, .card, .chip) — no es una captura de pantalla ni un mock
 * inventado, es literalmente la interfaz real reducida a lo esencial.
 */
export default function VistaPreviaProducto() {
  return (
    <div className="card-flotante w-full max-w-sm p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Tu nota</p>
        <span aria-hidden className="text-sm">
          📝
        </span>
      </div>
      <p className="mt-2 text-sm font-bold tracking-tight">Reunión de seguimiento</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink/55">
        Marta se encarga de la propuesta, es urgente. Diseño revisa la maqueta esta
        semana. Quedamos en agendar un seguimiento…
      </p>

      <div className="my-4 flex items-center gap-2 text-brand-500">
        <div className="h-px flex-1 bg-brand-200" />
        <span className="text-xs font-semibold">✨ Extraer tareas</span>
        <div className="h-px flex-1 bg-brand-200" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Tablero</p>
        <span aria-hidden className="text-sm">
          ✅
        </span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {TAREAS_EJEMPLO.map((tarea) => (
          <li
            key={tarea.titulo}
            className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white/70 px-3 py-2"
          >
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink/20"
            />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink/80">
              {tarea.titulo}
            </span>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${clasePrioridad(tarea.prioridad)}`}
            >
              {etiquetaPrioridad(tarea.prioridad)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
