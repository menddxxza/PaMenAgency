import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DemoBadge, NoData } from '@/components/DemoBadge';
import { ComponentDetail } from '@/components/ComponentDetail';
import { cv, displacement, minutes, vehicleTitle, years } from '@/lib/format';
import { getVehicle, getVehicleComponents } from '@/lib/queries';
import type { ComponentFull } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string }; searchParams: { c?: string } };

export default async function VehiclePage({ params, searchParams }: Props) {
  const vehicle = await getVehicle(params.slug);
  if (!vehicle) notFound();

  const components = await getVehicleComponents(params.slug);
  const selected = components.find((c) => c.code === searchParams.c) ?? null;

  const bySystem = components.reduce<Map<string, ComponentFull[]>>((acc, c) => {
    const list = acc.get(c.system_code) ?? [];
    list.push(c);
    acc.set(c.system_code, list);
    return acc;
  }, new Map());

  const specs: [string, string | null][] = [
    ['Generación', `${vehicle.generation_name}${vehicle.platform ? ` · ${vehicle.platform}` : ''}`],
    ['Carrocería', `${vehicle.body_name}${vehicle.doors ? ` · ${vehicle.doors} p` : ''}`],
    ['Años', years(vehicle.year_start, vehicle.year_end)],
    ['Motor', vehicle.engine_code],
    ['Familia', vehicle.engine_family],
    ['Cilindrada', displacement(vehicle.displacement_cc)],
    ['Cilindros', vehicle.cylinders ? String(vehicle.cylinders) : null],
    ['Combustible', vehicle.fuel],
    ['Sobrealimentación', vehicle.aspiration],
    ['Potencia', cv(vehicle.power_kw)],
    ['Par', vehicle.torque_nm ? `${vehicle.torque_nm} Nm` : null],
    ['Emisiones', vehicle.emission_std],
    ['Cambio', vehicle.transmission_name],
    ['Código cambio', vehicle.transmission_code],
    ['Tracción', vehicle.drivetrain?.toUpperCase() ?? null],
    ['Longitud', vehicle.length_mm ? `${vehicle.length_mm} mm` : null],
    ['Anchura', vehicle.width_mm ? `${vehicle.width_mm} mm` : null],
    ['Altura', vehicle.height_mm ? `${vehicle.height_mm} mm` : null],
    ['Entre ejes', vehicle.wheelbase_mm ? `${vehicle.wheelbase_mm} mm` : null],
    ['Peso en vacío', vehicle.kerb_weight_kg ? `${vehicle.kerb_weight_kg} kg` : null],
    ['Depósito', vehicle.tank_l ? `${vehicle.tank_l} l` : null],
    ['Mercado', vehicle.market],
  ];

  return (
    <div className="space-y-8">
      <nav className="font-mono text-[11px] text-text-3">
        <Link href="/" className="hover:text-text-2">
          Buscar
        </Link>{' '}
        / {vehicle.manufacturer_name} {vehicle.model_name}
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.03em]">{vehicleTitle(vehicle)}</h1>
            <DemoBadge origin={vehicle.origin} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-text-3">{vehicle.slug}</p>
        </div>
        <Link
          href={`/vehiculo/${vehicle.slug}/3d`}
          className={vehicle.model_3d_id ? 'btn btn-accent' : 'btn'}
          aria-disabled={!vehicle.model_3d_id}
        >
          {vehicle.model_3d_id ? 'Abrir en 3D' : 'Explorador 3D'}
        </Link>
      </header>

      <section>
        <h2 className="label mb-3">Ficha técnica</h2>
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
          {specs.map(([k, v]) => (
            <div key={k} className="bg-surface px-3 py-2.5">
              <dt className="label">{k}</dt>
              <dd className="mt-0.5 font-mono text-[13px]">{v ?? <NoData />}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <header className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-2">Componentes</h2>
            <span className="font-mono text-[11px] text-text-3">{components.length}</span>
          </header>

          {components.length === 0 ? (
            <div className="panel border-l-2 border-l-accent p-4 text-sm text-text-2">
              Este vehículo no tiene componentes descritos. El catálogo cubre por ahora el EA288 2.0 TDI: el
              despiece del resto de motorizaciones no está descrito ni verificado, y no se rellena con datos
              plausibles.
            </div>
          ) : (
            <div className="space-y-6">
              {[...bySystem.entries()].map(([code, list]) => (
                <div key={code}>
                  <h3 className="label mb-2">
                    {code} · {list[0]?.system_name}
                  </h3>
                  <ul className="divide-y divide-line border border-line">
                    {list.map((c) => {
                      const active = c.code === selected?.code;
                      return (
                        <li key={c.id} id={c.code}>
                          <Link
                            href={`/vehiculo/${vehicle.slug}?c=${encodeURIComponent(c.code)}#${c.code}`}
                            scroll={false}
                            className={`row-hover flex items-center gap-4 px-3 py-2.5 ${
                              active ? 'bg-surface-2 border-l-2 border-l-accent' : ''
                            }`}
                          >
                            <span className="w-[200px] shrink-0 font-mono text-[11px] text-accent">{c.code}</span>
                            <span className="flex-1 text-sm">{c.name}</span>
                            <span className="font-mono text-[11px] text-text-3">
                              {c.difficulty ? `${c.difficulty}/5` : '—'}
                            </span>
                            <span className="w-[72px] text-right font-mono text-[11px] text-text-3">
                              {minutes(c.est_time_min)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {selected ? (
            <ComponentDetail component={selected} vehicleSlug={vehicle.slug} allComponents={components} />
          ) : (
            <div className="panel p-4">
              <h2 className="label">Componente</h2>
              <p className="mt-2 text-sm text-text-2">
                Selecciona un componente de la lista para ver su función, posición, herramientas y qué hay que
                desmontar antes.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
