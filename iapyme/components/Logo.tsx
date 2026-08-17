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
        width={30}
        height={30}
        className="h-[30px] w-[30px] shrink-0 rounded-lg
                   transition-transform duration-base ease-out
                   group-hover/logo:-rotate-3"
      />

      <span
        className={`font-display text-[17px] font-semibold tracking-[-0.02em] ${
          inverso ? 'text-white' : 'text-ink'
        }`}
      >
        IAPyme
      </span>
    </span>
  );
}
