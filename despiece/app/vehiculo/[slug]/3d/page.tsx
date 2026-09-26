import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Viewer3D } from '@/components/viewer/Viewer3D';
import { bytes, vehicleTitle } from '@/lib/format';
import { getModel3D, getVehicle, getVehicleComponents, getViewerNodes } from '@/lib/queries';
import { assetUrl } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export default async function ExplorerPage({ params }: { params: { slug: string } }) {
  const vehicle = await getVehicle(params.slug);
  if (!vehicle) notFound();

  const model = vehicle.model_3d_id ? await getModel3D(vehicle.id) : null;
  const nodes = model ? await getViewerNodes(model.id) : [];
  const components = await getVehicleComponents(params.slug);
  const url = model ? await assetUrl(model.storage_key) : null;

  const header = (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
      <div>
        <nav className="font-mono text-[11px] text-text-3">
          <Link href="/" className="hover:text-text-2">
            Buscar
          </Link>{' '}
          /{' '}
          <Link href={`/vehiculo/${vehicle.slug}`} className="hover:text-text-2">
            {vehicle.manufacturer_name} {vehicle.model_name}
          </Link>{' '}
          / 3D
        </nav>
        <h1 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{vehicleTitle(vehicle)}</h1>
      </div>
      <Link href={`/vehiculo/${vehicle.slug}`} className="btn">
        Ficha técnica
      </Link>
    </header>
  );

  // Sin modelo, sin nodos o sin R2: se dice qué falta. No se simula un visor.
  if (!model || !url || nodes.length === 0) {
    return (
      <div className="space-y-6">
        {header}
        <section className="panel border-l-2 border-l-accent p-5">
          <h2 className="label">Modelo 3D no disponible</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-2">
            {!model
              ? 'Este vehículo todavía no tiene ningún modelo 3D publicado. El modelado del EA288 está en curso: un motor despiezado son 60-100 h de trabajo y la biblioteca de mallas reutilizables (mesh_asset) es lo que permite bajar ese coste en los siguientes vehículos.'
              : nodes.length === 0
                ? 'El modelo está registrado pero ninguno de sus nodos está mapeado a un componente todavía. El mapeo se hace en Admin › Modelos.'
                : 'El modelo está registrado pero no hay almacenamiento configurado para servir el GLB. Revisa las variables R2_* y NEXT_PUBLIC_R2_PUBLIC_BASE.'}
          </p>
          {model && (
            <dl className="mt-4 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {(
                [
                  ['Código', model.code],
                  ['Versión', `v${model.version}`],
                  ['Nodos mapeados', String(nodes.length)],
                  ['Tamaño', bytes(model.file_bytes)],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="bg-surface px-3 py-2">
                  <dt className="label">{k}</dt>
                  <dd className="mt-0.5 font-mono text-[12px]">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-4 text-sm text-text-2">
            Mientras tanto, la ficha del vehículo lista los {components.length} componentes descritos, con
            dependencias de desmontaje.
          </p>
          <Link href={`/vehiculo/${vehicle.slug}`} className="btn mt-4">
            Ver componentes
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}
      <Viewer3D url={url} nodes={nodes} vehicleSlug={vehicle.slug} upAxis={model.up_axis} />
    </div>
  );
}
