'use client';

const PESTANAS = [
  { id: 'inicio', etiqueta: 'Inicio', emoji: '🏠' },
  { id: 'notas', etiqueta: 'Notas', emoji: '📝' },
  { id: 'tareas', etiqueta: 'Tareas', emoji: '✅' },
  { id: 'asistente', etiqueta: 'Asistente', emoji: '🤖' },
  { id: 'ajustes', etiqueta: 'Ajustes', emoji: '⚙️' },
] as const;

export type Pestana = (typeof PESTANAS)[number]['id'];

export default function NavPestanas({
  activa,
  onCambiar,
}: {
  activa: Pestana;
  onCambiar: (p: Pestana) => void;
}) {
  return (
    // min-w-0: sin esto, un elemento flex nunca encoge por debajo del ancho de su
    // contenido (es el valor por defecto de min-width en flexbox, no "0" como
    // cabría esperar) — así que overflow-x-auto no llegaba a activarse nunca: en
    // vez de scrollear esta fila, era toda la cabecera la que se salía de la
    // pantalla, cortándose y desplazándose entera al deslizar.
    <nav
      role="tablist"
      aria-label="Secciones de Notiq"
      className="flex min-w-0 gap-1 overflow-x-auto"
    >
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={activa === p.id}
          aria-label={p.etiqueta}
          onClick={() => onCambiar(p.id)}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
            activa === p.id
              ? 'bg-brand-600 text-white'
              : 'text-ink/70 hover:bg-ink/[0.05] hover:text-ink'
          }`}
        >
          <span aria-hidden className="text-base sm:text-sm">
            {p.emoji}
          </span>
          {/* Solo el icono en móvil: así las cinco pestañas caben sin tener que
              deslizar, que es justo lo que fallaba. A partir de sm sobra sitio
              para el texto también. */}
          <span className="hidden sm:inline">{p.etiqueta}</span>
        </button>
      ))}
    </nav>
  );
}
