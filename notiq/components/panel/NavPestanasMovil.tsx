'use client';

import { PESTANAS, type Pestana } from './pestanas';

/**
 * Barra de pestañas fija abajo, solo en móvil (`sm:hidden`) — el patrón de
 * cualquier app nativa de verdad, con más motivo ahora que Notiq se puede
 * instalar como PWA (ver app/manifest.ts): sin scroll, sin competir por sitio
 * con el logo o el botón de salir de la cabecera, y siempre alcanzable con el
 * pulgar. `env(safe-area-inset-bottom)` dejar sitio a la barra de gestos del
 * iPhone en modo standalone, donde ya no hay barra de Safari que la empuje.
 */
export default function NavPestanasMovil({
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
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-paper/95 backdrop-blur-md sm:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {PESTANAS.map((p) => {
          const seleccionada = activa === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={seleccionada}
              onClick={() => onCambiar(p.id)}
              className="flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 py-1.5 text-ink/50 transition-colors duration-150 active:bg-ink/[0.04]"
            >
              <span
                aria-hidden
                className={`text-lg leading-none transition-transform duration-150 ${
                  seleccionada ? 'scale-110' : ''
                }`}
              >
                {p.emoji}
              </span>
              <span
                className={`text-[11px] leading-none ${
                  seleccionada ? 'font-bold text-brand-600' : 'font-medium'
                }`}
              >
                {p.etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
