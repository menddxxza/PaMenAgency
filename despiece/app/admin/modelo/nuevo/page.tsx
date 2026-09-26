import { UploadForm } from '@/components/admin/UploadForm';
import { adminVehicles } from '@/lib/queries';
import { r2Configured } from '@/lib/r2';
import { isConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function NewModelPage() {
  if (!isConfigured()) {
    return <p className="text-sm text-text-2">Sin conexión a Supabase.</p>;
  }

  const vehicles = await adminVehicles();

  return (
    <div className="max-w-3xl space-y-5">
      <section className="panel p-4">
        <h2 className="label">Pipeline</h2>
        <ol className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-text-2">
          <li>1 · Blender: validar convenciones y asignar node_uuid (addon Vehicle3D)</li>
          <li>2 · Exportar GLB con Draco y export_extras activado</li>
          <li>3 · gltfpack -cc</li>
          <li>4 · Subir aquí: el servidor lee los nodos del GLB y crea las filas de model_node</li>
          <li>5 · Mapear cada nodo a su componente y ajustar vectores de despiece</li>
          <li>6 · Publicar</li>
        </ol>
      </section>

      {!r2Configured() ? (
        <div className="panel border-l-2 border-l-accent p-4 text-sm text-text-2">
          R2 no está configurado. Define <span className="font-mono">R2_ACCOUNT_ID</span>,{' '}
          <span className="font-mono">R2_ACCESS_KEY_ID</span>, <span className="font-mono">R2_SECRET_ACCESS_KEY</span> y{' '}
          <span className="font-mono">R2_BUCKET</span>. Sin almacenamiento no se puede subir ningún GLB: no se
          registra un modelo que no existe.
        </div>
      ) : (
        <UploadForm vehicles={vehicles.map((v) => ({ id: v.id, slug: v.slug }))} />
      )}
    </div>
  );
}
