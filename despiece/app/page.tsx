import Link from 'next/link';
import { Suspense } from 'react';
import { DemoBadge } from '@/components/DemoBadge';
import { SearchForm } from '@/components/SearchForm';
import { cv, displacement, minutes, vehicleTitle, years } from '@/lib/format';
import { search } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const { vehicles, components, configured } = await search(q);

  return (
    <div className="space-y-10">
      <section className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Despiece de vehículos</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-2">
          Busca un vehículo para abrirlo en 3D y desmontarlo componente a componente, o busca un componente
          para ver qué es, dónde está y qué hay que quitar antes para llegar hasta él.
        </p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-[74px]" />}>
            <SearchForm autoFocus />
          </Suspense>
        </div>
      </section>

      {!configured && (
        <section className="panel border-l-2 border-l-accent p-4">
          <h2 className="label">Sin base de datos</h2>
          <p className="mt-2 text-sm text-text-2">
            No hay conexión a Supabase configurada (<span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span>).
            Consulta <span className="font-mono">README.md</span>: aplicar <span className="font-mono">db/schema.sql</span>,
            las migraciones y el seed.
          </p>
        </section>
      )}

      {configured && (
        <>
          <section>
            <header className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-2">Vehículos</h2>
              <span className="font-mono text-[11px] text-text-3">{vehicles.length}</span>
            </header>

            {vehicles.length === 0 ? (
              <p className="py-6 text-sm text-text-3">
                {q ? `Ningún vehículo coincide con “${q}”.` : 'Todavía no hay vehículos publicados.'}
              </p>
            ) : (
              <ul className="divide-y divide-line border border-line">
                {vehicles.map((v) => (
                  <li key={v.id}>
                    <Link href={`/vehiculo/${v.slug}`} className="row-hover flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
                      <div className="min-w-[280px] flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{vehicleTitle(v)}</span>
                          <DemoBadge origin={v.origin} />
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-text-3">
                          {v.generation_name} · {v.body_name} · {years(v.year_start, v.year_end)}
                        </div>
                      </div>
                      <dl className="flex gap-6 font-mono text-[11px] text-text-2">
                        <div>
                          <dt className="label">Motor</dt>
                          <dd>{v.engine_family ?? v.engine_code}</dd>
                        </div>
                        <div>
                          <dt className="label">Potencia</dt>
                          <dd>{cv(v.power_kw)}</dd>
                        </div>
                        <div>
                          <dt className="label">Componentes</dt>
                          <dd>{v.component_count || '—'}</dd>
                        </div>
                        <div>
                          <dt className="label">3D</dt>
                          <dd className={v.model_3d_id ? 'text-ok' : 'text-text-3'}>
                            {v.model_3d_id ? 'Disponible' : 'Pendiente'}
                          </dd>
                        </div>
                      </dl>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {q && (
            <section>
              <header className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-2">Componentes</h2>
                <span className="font-mono text-[11px] text-text-3">{components.length}</span>
              </header>

              {components.length === 0 ? (
                <p className="py-6 text-sm text-text-3">Ningún componente coincide con “{q}”.</p>
              ) : (
                <div className="overflow-x-auto border border-line">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Componente</th>
                        <th>Sistema</th>
                        <th>Dificultad</th>
                        <th>Tiempo</th>
                        <th>Previo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((c) => (
                        <tr key={c.id} className="row-hover">
                          <td className="whitespace-nowrap font-mono text-[11px] text-accent">{c.code}</td>
                          <td>
                            <span className="text-sm">{c.name}</span>
                            <div className="font-mono text-[11px] text-text-3">{c.subsystem_name}</div>
                          </td>
                          <td className="font-mono text-[11px]">{c.system_name}</td>
                          <td className="font-mono text-[11px]">{c.difficulty ? `${c.difficulty}/5` : '—'}</td>
                          <td className="whitespace-nowrap font-mono text-[11px]">{minutes(c.est_time_min)}</td>
                          <td className="font-mono text-[11px]">{c.requires.length || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-2 font-mono text-[11px] text-text-3">
                El componente es la pieza <em>conceptual</em>. Las referencias comprables viven en{' '}
                <span className="text-text-2">part</span> y todavía no tienen fuente con licencia cargada.
              </p>
            </section>
          )}

          {!q && vehicles.length > 0 && (
            <p className="font-mono text-[11px] text-text-3">
              Vehículo piloto: SEAT León III (5F) 2.0 TDI, motor EA288 ({displacement(1968)}). El mismo motor se
              reutiliza en Golf VII, Octavia III, A3 8V, Ateca y Tarraco.
            </p>
          )}
        </>
      )}
    </div>
  );
}
