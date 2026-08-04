import Link from 'next/link';
import type { ProductoConRelaciones } from '@/lib/database.types';
import { precioResumido, tiempoInstalacion } from '@/lib/formato';

export default function ProductoCard({ producto }: { producto: ProductoConRelaciones }) {
  const precio = precioResumido(producto);

  return (
    <Link
      href={`/p/${producto.slug}`}
      className="card group flex flex-col overflow-hidden transition
                 hover:-translate-y-0.5 hover:border-brand-300"
    >
      <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-50 to-ink/[0.06]">
        {producto.cover_image_url ? (
          // Imagen de Supabase Storage: dominio variable, por eso <img> y no next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={producto.cover_image_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl" aria-hidden>
            {producto.categories?.icono ?? '🤖'}
          </div>
        )}

        {producto.is_featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white">
            Destacado
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {producto.categories ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink/[0.04] px-2.5 py-1 text-xs font-medium text-ink/70">
            <span aria-hidden>{producto.categories.icono}</span>
            {producto.categories.nombre}
          </span>
        ) : null}

        <h3 className="mt-3 font-bold leading-snug group-hover:text-brand-700">
          {producto.titulo}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink/65">{producto.tagline}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-sm">
            <span className="text-lg font-extrabold">{precio.principal}</span>
            {precio.secundario ? (
              <span className="block text-xs text-ink/60">{precio.secundario}</span>
            ) : null}
          </p>
          <span className="rounded-lg bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-600">
            {tiempoInstalacion(producto.minutos_instalacion)}
          </span>
        </div>
      </div>
    </Link>
  );
}
