'use client';

import { PESTANAS, type Pestana } from './pestanas';

/**
 * Barra de pestañas de escritorio/tablet (a partir de `sm`): en móvil las mismas
 * pestañas viven abajo, fijas, en NavPestanasMovil — cinco destinos más el logo,
 * el medidor de IA, el correo y "Salir" no caben con dignidad en una sola fila
 * horizontal con scroll, por bien que el scroll funcione. Ver PanelApp.tsx.
 */
export default function NavPestanas({
  activa,
  onCambiar,
}: {
  activa: Pestana;
  onCambiar: (p: Pestana) => void;
}) {
  return (
    // min-w-0 + overflow-x-auto: un hijo flex no encoge por debajo del ancho de su
    // contenido si no se le dice min-w-0 explícito, y aunque su contenedor padre sí
    // pueda encoger (es flex-1), eso no basta — el navegador prefiere encoger ese
    // padre hasta el límite antes que mandar esta fila a una línea nueva, así que
    // sin su propio overflow-x-auto el nav se sale igualmente por encima de lo que
    // quede a la derecha (correo, medidor de IA, Salir) en vez de quedarse dentro
    // o scrollear. Pasa justo en el rango de tablet (~640-1024px), donde las cinco
    // etiquetas de texto no caben del todo pero tampoco falta tanto sitio como
    // para que se note a simple vista que hace falta scroll.
    <nav
      role="tablist"
      aria-label="Secciones de Notiq"
      className="hidden min-w-0 gap-1 overflow-x-auto sm:flex"
    >
      {PESTANAS.map((p) => (
        <button
          key={p.id}
          type="button"
          role="tab"
          aria-selected={activa === p.id}
          onClick={() => onCambiar(p.id)}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-150 ${
            activa === p.id
              ? 'bg-brand-600 text-white'
              : 'text-ink/70 hover:bg-ink/[0.05] hover:text-ink'
          }`}
        >
          <span aria-hidden className="text-sm">
            {p.emoji}
          </span>
          {p.etiqueta}
        </button>
      ))}
    </nav>
  );
}
