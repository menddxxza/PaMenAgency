/**
 * Regla 2: todo dato de demo va marcado en pantalla.
 * Si `origin` no es 'demo' no se pinta nada.
 */
export function DemoBadge({ origin, className = '' }: { origin: string; className?: string }) {
  if (origin !== 'demo') return null;
  return (
    <span
      className={`inline-block border border-accent px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-accent ${className}`}
    >
      Demo data
    </span>
  );
}

/** Hueco explícito de dato ausente. Nunca un valor plausible inventado. */
export function NoData({ className = '' }: { className?: string }) {
  return <span className={`font-mono text-[11px] text-text-3 ${className}`}>Información no disponible</span>;
}
