import Link from 'next/link';
import Icono from './Icono';
import type { ProductoConRelaciones } from '@/lib/database.types';
import { precioResumido, tiempoInstalacion } from '@/lib/formato';

export default function ProductoCard({ producto }: { producto: ProductoConRelaciones }) {
  const precio = precioResumido(producto);

  return (
    <Link
      href={`/p/${producto.slug}`}
      className="card-interactive group flex flex-col
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-50">
        {producto.cover_image_url ? (
          // Imagen de Supabase Storage: dominio variable, por eso <img> y no next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.cover_image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover
                       transition-transform duration-slow ease-out
                       group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center bg-grid text-4xl
                       [background-size:22px_22px]
                       transition-transform duration-slow ease-out
                       group-hover:scale-[1.04]"
            aria-hidden
          >
            {producto.categories?.icono ?? '·'}
          </div>
        )}

        {producto.is_featured ? (
          <span
            className="dato absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1
                       text-[11px] font-semibold uppercase tracking-wider text-white"
          >
            Destacado
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {producto.categories ? (
          <span className="dato text-[11px] uppercase tracking-[0.12em] text-ink/65">
            {producto.categories.nombre}
          </span>
        ) : null}

        <h3
          className="mt-2 font-display text-base font-semibold leading-snug
                     transition-colors duration-fast ease-out
                     group-hover:text-brand-700"
        >
          {producto.titulo}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/60">
          {producto.tagline}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-5">
          <p className="min-w-0">
            <span className="dato text-lg font-semibold text-ink">{precio.principal}</span>
            {precio.secundario ? (
              <span className="dato block truncate text-xs text-ink/65">
                {precio.secundario}
              </span>
            ) : null}
          </p>

          {/* shrink-0 + nowrap: si el precio secundario es largo, se recorta él,
              nunca se parte la insignia de tiempo en dos líneas. */}
          <span
            className="dato inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap
                       rounded-lg bg-accent-500/10 px-2 py-1 text-[11px] font-medium
                       text-accent-700"
          >
            <Icono nombre="reloj" className="h-3.5 w-3.5" />
            {tiempoInstalacion(producto.minutos_instalacion)}
          </span>
        </div>
      </div>
    </Link>
  );
}
