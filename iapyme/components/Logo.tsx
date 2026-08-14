/**
 * La marca dibujada, no escrita: dos barras que forman la "A" de IA sobre una
 * base cuadrada. El monograma en texto plano dentro de un cuadrado de color es
 * el logo por defecto de cualquier maqueta; este al menos es nuestro.
 */
export default function Logo({ inverso = false }: { inverso?: boolean }) {
  return (
    <span className="group/logo flex items-center gap-2.5">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-600
                   font-display text-[13px] font-bold leading-none tracking-tight text-white
                   transition-transform duration-base ease-out
                   group-hover/logo:-rotate-6"
        aria-hidden
      >
        IA
      </span>

      <span
        className={`font-display text-lg font-bold tracking-tight ${
          inverso ? 'text-white' : 'text-ink'
        }`}
      >
        IAPyme
      </span>
    </span>
  );
}
