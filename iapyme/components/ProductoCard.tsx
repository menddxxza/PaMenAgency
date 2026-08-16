import Link from 'next/link';
import Icono from './Icono';
import Estrellas from './Estrellas';
import BotonFavorito from './BotonFavorito';
import type { ProductoConRelaciones } from '@/lib/database.types';
import { precioResumido, tiempoInstalacion } from '@/lib/formato';

export default function ProductoCard({ producto }: { producto: ProductoConRelaciones }) {
  const precio = precioResumido(producto);

  return (
    <div className="card-interactive group relative flex h-full flex-col">
      <div className="absolute right-3 top-3 z-10">
        <BotonFavorito productId={producto.id} />
      </div>

      <Link
        href={`/p/${producto.slug}`}
        className="flex h-full flex-col focus:outline-none focus-visible:ring-2
                   focus-visible:ring-brand-500 focus-visible:ring-offset-2"
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
                       group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-4xl
                       transition-transform duration-slow ease-out
                       group-hover:scale-[1.03]"
            aria-hidden
          >
            {producto.categories?.icono ?? '·'}
          </div>
        )}

      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-ink/65">
          {producto.categories ? <span>{producto.categories.nombre}</span> : null}
          {/* Discreto a propósito: un punto y una palabra, no una insignia
              negra encima de la foto. Sigue siendo información real cuando
              esta tarjeta aparece mezclada en resultados de búsqueda. */}
          {producto.is_featured ? (
            <span className="inline-flex items-center gap-1.5 text-brand-700">
              {producto.categories ? <span aria-hidden>·</span> : null}
              Destacado
            </span>
          ) : null}
          {producto.rating_total > 0 ? (
            <span className="inline-flex items-center gap-1">
              {producto.categories || producto.is_featured ? <span aria-hidden>·</span> : null}
              <Estrellas puntuacion={producto.rating_promedio} tamano="text-[0.7rem]" />
              <span>{producto.rating_promedio.toFixed(1)}</span>
            </span>
          ) : null}
        </div>

        <h3
          className="mt-1.5 font-display text-lg font-normal leading-snug text-ink
                     transition-colors duration-fast ease-out
                     group-hover:text-brand-700"
        >
          {producto.titulo}
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/60">
          {producto.tagline}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <p className="min-w-0">
            <span className="dato text-lg font-medium text-ink">{precio.principal}</span>
            {precio.secundario ? (
              <span className="dato block truncate text-xs text-ink/65">
                {precio.secundario}
              </span>
            ) : null}
          </p>

          {/* whitespace-nowrap: si el precio secundario es largo, se recorta
              él (min-w-0 + truncate arriba), nunca esto. */}
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-ink/65">
            <Icono nombre="reloj" className="h-3.5 w-3.5" />
            {tiempoInstalacion(producto.minutos_instalacion)}
          </span>
        </div>
      </div>
      </Link>
    </div>
  );
}
