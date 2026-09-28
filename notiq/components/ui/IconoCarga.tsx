/** Icono de carga de marca: el logo con un anillo girando alrededor, en vez
 * de un "Cargando…" a secas o (peor) una pantalla en blanco. Reutilizado por
 * app/(app)/loading.tsx (arranque de la app) y por las secciones del panel
 * mientras piden sus propios datos la primera vez. */
export default function IconoCarga({ etiqueta = 'Cargando…' }: { etiqueta?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-spin rounded-full border-2 border-ink/10 border-t-brand-500"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- icono de marca
            fijo en public/, mismo motivo que Logo.tsx. */}
        <img src="/logo.png" alt="" aria-hidden className="h-9 w-9 rounded-xl object-cover" />
      </div>
      {etiqueta && <p className="text-sm text-ink/45">{etiqueta}</p>}
    </div>
  );
}
