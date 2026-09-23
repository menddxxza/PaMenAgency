import Link from 'next/link';
import Estrellas from './Estrellas';
import BotonFavorito from './BotonFavorito';
import Avatar from './ui/Avatar';
import Distintivo from './ui/Distintivo';
import type { ProductoConRelaciones } from '@/lib/database.types';
import { NOMBRE_TIPO, precioResumido, tiempoInstalacion } from '@/lib/formato';

/**
 * Tarjeta de publicación: la pieza que más se repite del marketplace, así que
 * manda ella sobre el resto del sistema.
 *
 * Tres decisiones que la gobiernan:
 *
 * 1. Jerarquía en cuatro niveles y punto: imagen, título, precio, vendedor.
 *    Todo lo demás (tipo, tiempo de instalación, valoración) es secundario y
 *    se queda en gris. Un listado donde todo pesa igual no se escanea.
 * 2. Sin inclinación al pasar el cursor. La versión anterior se ladeaba
 *    siguiendo el ratón; en una retícula de doce tarjetas eso es ruido, y
 *    obligaba a que fuera componente de cliente. Ahora se renderiza en el
 *    servidor y solo el corazón lleva JavaScript.
 * 3. El hueco sin foto no se disimula. Se pinta el icono de la categoría
 *    sobre color plano en vez de una imagen de archivo genérica.
 */
export default function ProductoCard({ producto }: { producto: ProductoConRelaciones }) {
  const precio = precioResumido(producto);
  const vendedor = producto.profiles;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border
                 border-superficie-200 bg-superficie-0 transition-colors duration-fast ease-out
                 hover:border-superficie-300 focus-within:border-brand-400"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-superficie-100">
        {producto.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.cover_image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-slow ease-out
                       group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center text-4xl opacity-40"
          >
            {producto.categories?.icono ?? '·'}
          </span>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {producto.is_featured ? <Distintivo tono="oscuro">Destacado</Distintivo> : null}
        </div>

        <div className="absolute right-3 top-3">
          <BotonFavorito productId={producto.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-ink/55">
          {producto.categories?.nombre}
          <span aria-hidden> · </span>
          {NOMBRE_TIPO[producto.product_type]}
        </p>

        <h3 className="mt-1.5 font-display text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          {/* El enlace cubre la tarjeta entera; el corazón queda por encima
              con su propio z-index para no caer dentro del área clicable. */}
          <Link
            href={`/p/${producto.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none
                       focus-visible:underline focus-visible:decoration-brand-500
                       focus-visible:underline-offset-4"
          >
            {producto.titulo}
          </Link>
        </h3>

        {producto.rating_total > 0 ? (
          <p className="mt-2 flex items-center gap-1.5">
            <Estrellas puntuacion={producto.rating_promedio} tamano="text-[0.7rem]" />
            <span className="text-xs text-ink/50">({producto.rating_total})</span>
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          <p className="flex items-baseline gap-1.5">
            <span className="dato text-base font-semibold text-ink">{precio.principal}</span>
            {precio.secundario ? (
              <span className="text-xs text-ink/55">{precio.secundario}</span>
            ) : null}
          </p>

          <div className="mt-3 flex items-center gap-2 border-t border-superficie-200 pt-3">
            <Avatar nombre={vendedor?.display_name ?? '—'} url={vendedor?.avatar_url} tamano="sm" />
            <span className="min-w-0 flex-1 truncate text-xs text-ink/65">
              {vendedor?.display_name ?? 'Vendedor'}
            </span>
            {vendedor?.is_verified ? (
              <span
                className="shrink-0 text-brand-600"
                title="Vendedor verificado"
                aria-label="Vendedor verificado"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                  <path d="M8 0.8l1.7 1.2 2.1-.2.9 1.9 1.9.9-.2 2.1L15.6 8l-1.2 1.7.2 2.1-1.9.9-.9 1.9-2.1-.2L8 15.6l-1.7-1.2-2.1.2-.9-1.9-1.9-.9.2-2.1L.4 8l1.2-1.7-.2-2.1 1.9-.9.9-1.9 2.1.2L8 .4z" />
                  <path d="M6.9 10.4L4.6 8.1l.9-.9 1.4 1.4 3-3 .9.9z" fill="#fff" />
                </svg>
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-ink/50">
            Listo en {tiempoInstalacion(producto.minutos_instalacion).toLowerCase()}
          </p>
        </div>
      </div>
    </article>
  );
}
