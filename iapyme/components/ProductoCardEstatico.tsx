import { CATEGORIAS } from '@/lib/categorias';
import type { Producto } from '@/lib/productos';

function formatoTiempo(minutos: number) {
  if (minutos < 60) return `${minutos} min`;
  const horas = minutos / 60;
  return horas === 1 ? '1 hora' : `${horas} horas`;
}

export default function ProductoCardEstatico({ producto }: { producto: Producto }) {
  const categoria = CATEGORIAS.find((c) => c.slug === producto.categoriaSlug);

  return (
    <article className="card flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-brand-300">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 text-xs font-medium text-ink/70">
          <span aria-hidden>{categoria?.icono}</span>
          {categoria?.nombre}
        </span>
        {producto.destacado ? (
          <span className="rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-700">
            Destacado
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-lg font-bold">{producto.titulo}</h3>
      <p className="mt-1 text-sm text-ink/70">{producto.tagline}</p>

      <dl className="mt-5 space-y-3 border-t border-ink/10 pt-5 text-sm">
        <div>
          <dt className="font-semibold text-ink/65">El problema</dt>
          <dd className="mt-0.5 text-ink/80">{producto.problema}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink/65">La solución</dt>
          <dd className="mt-0.5 text-ink/80">{producto.solucion}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-end justify-between gap-4 border-t border-ink/10 pt-5">
        <p className="text-sm">
          <span className="text-xl font-extrabold">{producto.precioSetup} €</span>
          <span className="text-ink/60"> setup</span>
          <span className="block text-ink/60">+ {producto.precioMensual} €/mes</span>
        </p>
        <p className="rounded-lg bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-700">
          Listo en {formatoTiempo(producto.minutosInstalacion)}
        </p>
      </div>
    </article>
  );
}
