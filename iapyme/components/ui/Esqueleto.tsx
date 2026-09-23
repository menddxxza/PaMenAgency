/**
 * Hueco gris mientras carga. Es preferible a un spinner porque anticipa la
 * forma de lo que viene: la página no da un salto al llegar el contenido.
 *
 * `aria-hidden` a propósito: quien usa lector de pantalla no gana nada
 * oyendo "cargando" diez veces seguidas; el contenedor que lo contiene
 * anuncia el estado una sola vez.
 */
export default function Esqueleto({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`block animate-pulse rounded-md bg-superficie-200 ${className}`}
    />
  );
}

/** Esqueleto con la forma de una tarjeta de publicación. */
export function EsqueletoTarjeta() {
  return (
    <div className="overflow-hidden rounded-xl border border-superficie-200 bg-superficie-0">
      <Esqueleto className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Esqueleto className="h-3 w-20" />
        <Esqueleto className="h-4 w-full" />
        <Esqueleto className="h-4 w-2/3" />
        <div className="flex items-center gap-2 pt-2">
          <Esqueleto className="h-6 w-6 rounded-full" />
          <Esqueleto className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}
