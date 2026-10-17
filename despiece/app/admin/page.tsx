import Link from 'next/link';
import { DemoBadge } from '@/components/DemoBadge';
import { bytes, cv, minutes } from '@/lib/format';
import { adminComponents, adminModels, adminVehicles } from '@/lib/queries';
import { isConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!isConfigured()) {
    return (
      <div className="panel border-l-2 border-l-accent p-5 text-sm text-text-2">
        Sin conexión a Supabase: define <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span>,{' '}
        <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> y{' '}
        <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span>.
      </div>
    );
  }

  const [models, vehicles, components] = await Promise.all([
    adminModels(),
    adminVehicles(),
    adminComponents(),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <header className="mb-3 flex items-baseline justify-between border-b border-line pb-2">
          <div className="flex items-baseline gap-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-2">Modelos 3D</h2>
            <span className="font-mono text-[11px] text-text-3">{models.length}</span>
          </div>
          <Link href="/admin/modelo/nuevo" className="btn">
            Subir GLB
          </Link>
        </header>

        {models.length === 0 ? (
          <p className="py-5 text-sm text-text-2">
            Ningún modelo registrado. El primer entregable 3D es el EA288 (ENG, ~25 objetos): se modela en
            Blender con <span className="font-mono">tools/blender_addon_vehicle3d.py</span>, se exporta con{' '}
            <span className="font-mono">node_uuid</span> en extras y se sube aquí.
          </p>
        ) : (
          <div className="overflow-x-auto border border-line">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Vehículo</th>
                  <th>Nodos</th>
                  <th>Mapeados</th>
                  <th>Tamaño</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="row-hover">
                    <td className="font-mono text-[11px]">{m.code}</td>
                    <td className="font-mono text-[11px] text-text-2">{m.vehicle_slug}</td>
                    <td className="font-mono text-[11px]">{m.node_count}</td>
                    <td className="font-mono text-[11px]">
                      <span className={m.mapped_count === m.node_count ? 'text-ok' : 'text-accent'}>
                        {m.mapped_count}
                      </span>{' '}
                      / {m.node_count}
                    </td>
                    <td className="font-mono text-[11px]">{bytes(m.file_bytes)}</td>
                    <td className="font-mono text-[11px]">{m.status}</td>
                    <td>
                      <Link href={`/admin/modelo/${m.id}`} className="font-mono text-[11px] text-accent">
                        Mapear
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <header className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-2">Vehículos</h2>
          <span className="font-mono text-[11px] text-text-3">{vehicles.length}</span>
        </header>
        <div className="overflow-x-auto border border-line">
          <table className="tbl">
            <thead>
              <tr>
                <th>Slug</th>
                <th>Motor</th>
                <th>Potencia</th>
                <th>Cambio</th>
                <th>Componentes</th>
                <th>3D</th>
                <th>Estado</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="row-hover">
                  <td className="max-w-[300px] truncate font-mono text-[11px]">
                    <Link href={`/vehiculo/${v.slug}`} className="hover:text-accent">
                      {v.slug}
                    </Link>
                  </td>
                  <td className="font-mono text-[11px]">{v.engine_code}</td>
                  <td className="font-mono text-[11px]">{cv(v.power_kw)}</td>
                  <td className="font-mono text-[11px] text-text-2">{v.transmission_name ?? '—'}</td>
                  <td className="font-mono text-[11px]">{v.component_count || '—'}</td>
                  <td className="font-mono text-[11px]">
                    {v.model_3d_id ? <span className="text-ok">sí</span> : <span className="text-text-3">no</span>}
                  </td>
                  <td className="font-mono text-[11px]">{v.status}</td>
                  <td>
                    <DemoBadge origin={v.origin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <header className="mb-3 flex items-baseline gap-3 border-b border-line pb-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-2">Catálogo de componentes</h2>
          <span className="font-mono text-[11px] text-text-3">{components.length}</span>
        </header>
        <div className="overflow-x-auto border border-line">
          <table className="tbl">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Sistema</th>
                <th>Dif.</th>
                <th>Tiempo</th>
                <th>Previos</th>
                <th>Piezas</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={c.id} className="row-hover">
                  <td className="whitespace-nowrap font-mono text-[11px] text-accent">{c.code}</td>
                  <td className="text-sm">{c.name}</td>
                  <td className="font-mono text-[11px]">{c.system_name}</td>
                  <td className="font-mono text-[11px]">{c.difficulty ?? '—'}/5</td>
                  <td className="whitespace-nowrap font-mono text-[11px]">{minutes(c.est_time_min)}</td>
                  <td className="font-mono text-[11px]">{c.requires.length || '—'}</td>
                  <td className="font-mono text-[11px]">{c.part_count || '—'}</td>
                  <td>
                    <DemoBadge origin={c.origin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-text-3">
          El catálogo es <span className="text-text-2">conceptual</span> (tabla <span className="text-text-2">component</span>).
          Las referencias comprables viven en <span className="text-text-2">part</span> y no tienen todavía ninguna
          fuente con licencia cargada: la columna Piezas está vacía a propósito.
        </p>
      </section>
    </div>
  );
}
