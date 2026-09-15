'use client';

import GooeyNav from '@/components/ui/GooeyNav';
import { PESTANAS, type Pestana } from './pestanas';

const ITEMS = PESTANAS.map((p) => ({ id: p.id, label: `${p.emoji} ${p.etiqueta}` }));

/**
 * Barra de pestañas de escritorio/tablet (a partir de `sm`): en móvil las mismas
 * pestañas viven abajo, fijas, en NavPestanasMovil — cinco destinos más el logo,
 * el medidor de IA, el correo y "Salir" no caben con dignidad en una sola fila
 * horizontal con scroll, por bien que el scroll funcione. Ver PanelApp.tsx.
 *
 * El efecto "gooey" (GooeyNav, adaptado de React Bits — ver components/ui/) solo
 * tiene sentido aquí: en la barra fija de abajo, con solo icono y sin hueco para
 * el desplazamiento de la burbuja, no aportaría nada.
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
    <div className="hidden min-w-0 overflow-x-auto sm:block">
      <GooeyNav
        items={ITEMS}
        activeId={activa}
        onSelect={(id) => onCambiar(id as Pestana)}
        ariaLabel="Secciones de Notiq"
      />
    </div>
  );
}
