/**
 * El icono real de la app (edificio + traza de circuito), no un monograma de
 * texto. Es el mismo archivo que usa la PWA, así que la marca es idéntica
 * dentro de la web y fuera de ella (pantalla de inicio, favicon).
 */
export default function Logo({ inverso = false }: { inverso?: boolean }) {
  return (
    <span className="group/logo flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-[10px]
                   transition-transform duration-base ease-out
                   group-hover/logo:-rotate-6"
      />

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
