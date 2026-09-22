import Link from 'next/link';

/**
 * Piezas sueltas de la portada. Están aquí y no en `components/` a secas
 * porque solo tienen sentido sobre el fondo oscuro de esta página: el resto
 * del sitio usa el sistema claro (`.btn-primary`, `.card`, `text-ink`).
 */

/** Etiqueta monoespaciada en versales. El rótulo pequeño del sistema. */
export function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60 sm:text-[11px]">
      {children}
    </p>
  );
}

/** Insignia con filete blanco a la izquierda sobre cristal. */
export function Insignia({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 font-mono
                 text-[11px] uppercase tracking-[0.15em] text-white backdrop-blur-md"
    >
      {children}
    </span>
  );
}

/** Titular de sección, a la escala grande de la portada. */
export function Titular({
  children,
  como: Como = 'h2',
  className = '',
}: {
  children: React.ReactNode;
  como?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <Como
      className={`text-4xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg
                  sm:text-6xl lg:text-7xl ${className}`}
    >
      {children}
    </Como>
  );
}

/** Párrafo sobre vídeo: siempre con sombra, o se pierde en los claros. */
export function Parrafo({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`leading-relaxed text-white/80 drop-shadow-md ${className}`}>{children}</p>
  );
}

/** Botón principal: pastilla blanca sólida, texto negro. */
export function BotonPrincipal({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs
                 font-medium text-black transition-colors duration-300 hover:bg-white/85
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] sm:text-sm"
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

/**
 * Botón secundario: cristal con borde. Admite `className` porque encima de
 * otra superficie de cristal (la tarjeta del hero) el borde por defecto se
 * pierde y el botón queda como una mancha gris.
 */
export function BotonSecundario({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10
                 px-5 py-2.5 text-xs font-medium text-white backdrop-blur-md transition-colors
                 duration-300 hover:bg-white/20 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-white/70 sm:text-sm ${className}`}
    >
      {children}
    </Link>
  );
}

/** Panel esmerilado con filas numeradas: el bloque de "capacidades". */
export function PanelCristal({
  filas,
}: {
  filas: { indice: string; titulo: string; texto: string }[];
}) {
  return (
    <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">
      {filas.map((fila, i) => (
        <div
          key={fila.indice}
          className={`flex gap-5 py-5 ${
            i < filas.length - 1 ? 'border-b border-white/15' : ''
          }`}
        >
          <span
            aria-hidden
            className="shrink-0 font-mono text-[11px] tracking-[0.15em] text-white/55"
          >
            {fila.indice}
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-medium text-white sm:text-lg">{fila.titulo}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">{fila.texto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
