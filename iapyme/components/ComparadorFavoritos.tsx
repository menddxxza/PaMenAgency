'use client';

import { useState } from 'react';
import Link from 'next/link';
import Estrellas from './Estrellas';
import { NOMBRE_TIPO, precioResumido, tiempoInstalacion } from '@/lib/formato';
import type { ProductoConRelaciones } from '@/lib/database.types';

const MAX = 3;

export default function ComparadorFavoritos({
  productos,
}: {
  productos: ProductoConRelaciones[];
}) {
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  if (productos.length < 2) return null;

  function alternar(id: string) {
    setSeleccionados((actual) => {
      if (actual.includes(id)) return actual.filter((x) => x !== id);
      if (actual.length >= MAX) return actual;
      return [...actual, id];
    });
  }

  const elegidos = productos.filter((p) => seleccionados.includes(p.id));

  return (
    <section className="card mt-8 p-6">
      <h2 className="font-semibold tracking-tight">Comparar favoritos</h2>
      <p className="mt-1 text-sm text-ink/60">
        Elige hasta {MAX} para verlos uno junto al otro.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {productos.map((p) => {
          const activo = seleccionados.includes(p.id);
          const deshabilitado = !activo && seleccionados.length >= MAX;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => alternar(p.id)}
              disabled={deshabilitado}
              aria-pressed={activo}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition
                          disabled:cursor-not-allowed disabled:opacity-40 ${
                            activo
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-ink/15 text-ink/70 hover:border-ink/30'
                          }`}
            >
              {p.titulo}
            </button>
          );
        })}
      </div>

      {elegidos.length >= 2 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32" />
                {elegidos.map((p) => (
                  <th key={p.id} className="border-b border-ink/10 px-4 py-3 text-left align-top">
                    <Link
                      href={`/p/${p.slug}`}
                      className="font-display text-base font-normal text-ink hover:text-brand-700"
                    >
                      {p.titulo}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink/50">{p.categories?.nombre}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <FilaComparacion
                etiqueta="Precio"
                valores={elegidos.map((p) => {
                  const precio = precioResumido(p);
                  return precio.secundario ? `${precio.principal} ${precio.secundario}` : precio.principal;
                })}
              />
              <FilaComparacion
                etiqueta="Listo en"
                valores={elegidos.map((p) => tiempoInstalacion(p.minutos_instalacion))}
              />
              <FilaComparacion
                etiqueta="Tipo"
                valores={elegidos.map((p) => NOMBRE_TIPO[p.product_type])}
              />
              <tr className="border-t border-ink/10">
                <td className="w-32 py-3 text-xs font-bold uppercase tracking-wider text-ink/60">
                  Valoración
                </td>
                {elegidos.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    {p.rating_total > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Estrellas puntuacion={p.rating_promedio} />
                        <span className="text-xs text-ink/50">({p.rating_total})</span>
                      </span>
                    ) : (
                      <span className="text-ink/60">Sin reseñas</span>
                    )}
                  </td>
                ))}
              </tr>
              <FilaComparacion
                etiqueta="Vendedor"
                valores={elegidos.map((p) => p.profiles?.display_name ?? '—')}
              />
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink/50">Selecciona al menos 2 para comparar.</p>
      )}
    </section>
  );
}

function FilaComparacion({ etiqueta, valores }: { etiqueta: string; valores: string[] }) {
  return (
    <tr className="border-t border-ink/10">
      <td className="w-32 py-3 text-xs font-bold uppercase tracking-wider text-ink/60">
        {etiqueta}
      </td>
      {valores.map((valor, i) => (
        <td key={i} className="px-4 py-3 text-ink/80">
          {valor}
        </td>
      ))}
    </tr>
  );
}
