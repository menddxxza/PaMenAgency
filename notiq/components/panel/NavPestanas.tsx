'use client';

const PESTANAS = [
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
    <nav
      role="tablist"
      aria-label="Secciones de Notiq"
      className="flex gap-1 overflow-x-auto"
    >
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={activa === p.id}
          onClick={() => onCambiar(p.id)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
            activa === p.id
              ? 'bg-brand-600 text-white'
              : 'text-ink/70 hover:bg-ink/[0.05] hover:text-ink'
          }`}
        >
          <span aria-hidden>{p.emoji}</span>
          {p.etiqueta}
        </button>
      ))}
    </nav>
  );
}
