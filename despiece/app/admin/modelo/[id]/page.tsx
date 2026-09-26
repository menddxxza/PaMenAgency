import Link from 'next/link';
import { notFound } from 'next/navigation';
import { saveNodes, setModelStatus } from '@/app/admin/actions';
import { bytes } from '@/lib/format';
import { adminComponentOptions, adminModel, adminNodes } from '@/lib/queries';
import { isConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ModelMappingPage({ params }: { params: { id: string } }) {
  if (!isConfigured()) return <p className="text-sm text-text-2">Sin conexión a Supabase.</p>;

  const model = await adminModel(params.id);
  if (!model) notFound();

  const [nodes, components] = await Promise.all([adminNodes(model.id), adminComponentOptions()]);
  const mapped = nodes.filter((n) => n.component_id).length;
  const withoutUuid = nodes.filter((n) => n.node_uuid.startsWith('path:')).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-mono text-sm">{model.code}</h2>
          <p className="mt-1 font-mono text-[11px] text-text-3">
            {model.vehicle_slug} · v{model.version} · {bytes(model.file_bytes)} · {model.storage_key}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={setModelStatus}>
            <input type="hidden" name="model_id" value={model.id} />
            <input type="hidden" name="status" value={model.status === 'published' ? 'draft' : 'published'} />
            <button type="submit" className={model.status === 'published' ? 'btn' : 'btn btn-accent'}>
              {model.status === 'published' ? 'Retirar' : 'Publicar'}
            </button>
          </form>
          <Link href={`/vehiculo/${model.vehicle_slug}/3d`} className="btn">
            Ver en 3D
          </Link>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {(
          [
            ['Estado', model.status],
            ['Nodos', String(nodes.length)],
            ['Mapeados', `${mapped} / ${nodes.length}`],
            ['Sin node_uuid', String(withoutUuid)],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="bg-surface px-3 py-2">
            <dt className="label">{k}</dt>
            <dd className="mt-0.5 font-mono text-[12px]">{v}</dd>
          </div>
        ))}
      </dl>

      {withoutUuid > 0 && (
        <p className="panel border-l-2 border-l-accent p-3 font-mono text-[11px] leading-relaxed text-text-2">
          {withoutUuid} nodos llegaron sin <span className="text-text">extras.node_uuid</span>: se ha usado la ruta
          como identificador provisional. Es frágil, porque Blender renombra al reexportar. Conviene reexportar con
          el addon, que escribe los UUID.
        </p>
      )}

      <form action={saveNodes} className="space-y-3">
        <input type="hidden" name="model_id" value={model.id} />
        <div className="overflow-x-auto border border-line">
          <table className="tbl">
            <thead>
              <tr>
                <th>Nodo</th>
                <th>node_uuid</th>
                <th>Componente</th>
                <th>Δx</th>
                <th>Δy</th>
                <th>Δz</th>
                <th>Selec.</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((n) => (
                <tr key={n.id}>
                  <td className="max-w-[260px] truncate font-mono text-[11px]" title={n.node_path}>
                    {n.node_path}
                  </td>
                  <td className="font-mono text-[10px] text-text-3">
                    {n.node_uuid.startsWith('path:') ? (
                      <span className="text-accent">sin UUID</span>
                    ) : (
                      `${n.node_uuid.slice(0, 8)}…`
                    )}
                  </td>
                  <td>
                    <input type="hidden" name="node_id" value={n.id} />
                    <select
                      name={`component_id:${n.id}`}
                      defaultValue={n.component_id ?? ''}
                      className="input py-1 font-mono text-[11px]"
                    >
                      <option value="">— sin asignar —</option>
                      {components.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} · {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  {(['explode_x', 'explode_y', 'explode_z'] as const).map((axis) => (
                    <td key={axis}>
                      <input
                        type="number"
                        step="0.001"
                        name={`${axis}:${n.id}`}
                        defaultValue={n[axis]}
                        className="input w-20 py-1 font-mono text-[11px]"
                      />
                    </td>
                  ))}
                  <td className="text-center">
                    <input type="checkbox" name={`selectable:${n.id}`} defaultChecked={n.selectable} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-accent">
            Guardar mapeo
          </button>
          <p className="font-mono text-[10px] leading-relaxed text-text-3">
            Los vectores de despiece se guardan en <span className="text-text-2">model_node</span>, no dentro del
            GLB: se ajustan sin reexportar el fichero.
          </p>
        </div>
      </form>
    </div>
  );
}
