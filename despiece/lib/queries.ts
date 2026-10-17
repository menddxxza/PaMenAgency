import { db, dbAdmin, isConfigured } from '@/lib/supabase/server';
import type { ComponentFull, Model3D, ModelNode, VehicleFull, ViewerNode } from '@/lib/types';

/**
 * Toda lectura de la plataforma pasa por aquí. Las rutas no hablan con
 * Supabase directamente: así la superficie de consulta es auditable y
 * las vistas/RPC de Postgres son el único contrato.
 *
 * Si la BD no está configurada, estas funciones devuelven vacío en lugar
 * de lanzar: la UI dice "Información no disponible" y no finge datos.
 */

export type SearchResult = {
  vehicles: VehicleFull[];
  components: ComponentFull[];
  configured: boolean;
};

export async function search(q: string, limit = 24): Promise<SearchResult> {
  if (!isConfigured()) return { vehicles: [], components: [], configured: false };

  const client = db();
  const [vehicles, components] = await Promise.all([
    client.rpc('search_vehicles', { q, lim: limit }),
    q.trim() ? client.rpc('search_components', { q, lim: limit }) : Promise.resolve({ data: [], error: null }),
  ]);

  if (vehicles.error) throw vehicles.error;
  if (components.error) throw components.error;

  return {
    vehicles: (vehicles.data ?? []) as VehicleFull[],
    components: (components.data ?? []) as ComponentFull[],
    configured: true,
  };
}

export async function getVehicle(slug: string): Promise<VehicleFull | null> {
  if (!isConfigured()) return null;
  const { data, error } = await db().from('vehicle_full').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return (data as VehicleFull | null) ?? null;
}

export async function getVehicleComponents(slug: string): Promise<ComponentFull[]> {
  if (!isConfigured()) return [];
  const { data, error } = await db().rpc('vehicle_components', { p_slug: slug });
  if (error) throw error;
  return (data ?? []) as ComponentFull[];
}

/** Modelo 3D publicado de un vehículo, o null si todavía no existe. */
export async function getModel3D(vehicleId: string): Promise<Model3D | null> {
  if (!isConfigured()) return null;
  const { data, error } = await db()
    .from('model_3d')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Model3D | null) ?? null;
}

/**
 * Nodos del modelo con su componente resuelto. El visor mapea por
 * `node_uuid`, nunca por nombre de nodo: Blender renombra.
 */
export async function getViewerNodes(model3dId: string): Promise<ViewerNode[]> {
  if (!isConfigured()) return [];
  const { data, error } = await db()
    .from('model_node')
    .select(
      `id, model_3d_id, node_uuid, node_path, component_id, mesh_asset_id,
       explode_x, explode_y, explode_z, explode_order, explode_group,
       selectable, label_anchor,
       component:component_id ( code, name, difficulty, est_time_min,
         subsystem:subsystem_id ( name, system:system_id ( code, name ) ) )`,
    )
    .eq('model_3d_id', model3dId)
    .order('explode_order', { ascending: true });
  if (error) throw error;

  type Raw = Omit<ModelNode, never> & {
    component:
      | {
          code: string;
          name: string;
          difficulty: number | null;
          est_time_min: number | null;
          subsystem: { name: string; system: { code: string; name: string } | null } | null;
        }
      | null;
  };

  return ((data ?? []) as unknown as Raw[]).map((row) => ({
    ...row,
    component: row.component
      ? {
          code: row.component.code,
          name: row.component.name,
          difficulty: row.component.difficulty,
          est_time_min: row.component.est_time_min,
          system_code: row.component.subsystem?.system?.code ?? '—',
          system_name: row.component.subsystem?.system?.name ?? 'Sin sistema',
          subsystem_name: row.component.subsystem?.name ?? '—',
        }
      : null,
  }));
}

/** Componentes de los que depende el desmontaje, resueltos a fila completa. */
export async function getComponentsByCode(codes: string[]): Promise<ComponentFull[]> {
  if (!isConfigured() || codes.length === 0) return [];
  const { data, error } = await db().from('component_full').select('*').in('code', codes);
  if (error) throw error;
  return (data ?? []) as ComponentFull[];
}

// ------------------------------------------------------------------
// Admin (service_role: salta RLS, solo servidor)
// ------------------------------------------------------------------

export async function adminVehicles(): Promise<VehicleFull[]> {
  const { data, error } = await dbAdmin().from('vehicle_full').select('*').order('slug');
  if (error) throw error;
  return (data ?? []) as VehicleFull[];
}

export async function adminComponents(): Promise<ComponentFull[]> {
  const { data, error } = await dbAdmin()
    .from('component_full')
    .select('*')
    .order('system_sort')
    .order('code');
  if (error) throw error;
  return (data ?? []) as ComponentFull[];
}

export type AdminModel = Model3D & { vehicle_slug: string; node_count: number; mapped_count: number };

export async function adminModels(): Promise<AdminModel[]> {
  const client = dbAdmin();
  const { data, error } = await client
    .from('model_3d')
    .select('*, vehicle:vehicle_id ( slug ), model_node ( id, component_id )')
    .order('created_at', { ascending: false });
  if (error) throw error;

  type Raw = Model3D & {
    vehicle: { slug: string } | null;
    model_node: { id: string; component_id: string | null }[];
  };

  return ((data ?? []) as unknown as Raw[]).map(({ vehicle, model_node, ...model }) => ({
    ...model,
    vehicle_slug: vehicle?.slug ?? '—',
    node_count: model_node.length,
    mapped_count: model_node.filter((n) => n.component_id).length,
  }));
}

export async function adminModel(id: string): Promise<(Model3D & { vehicle_slug: string }) | null> {
  const { data, error } = await dbAdmin()
    .from('model_3d')
    .select('*, vehicle:vehicle_id ( slug )')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { vehicle, ...model } = data as unknown as Model3D & { vehicle: { slug: string } | null };
  return { ...model, vehicle_slug: vehicle?.slug ?? '—' };
}

export async function adminNodes(model3dId: string): Promise<ModelNode[]> {
  const { data, error } = await dbAdmin()
    .from('model_node')
    .select('*')
    .eq('model_3d_id', model3dId)
    .order('node_path');
  if (error) throw error;
  return (data ?? []) as ModelNode[];
}

export async function adminComponentOptions(): Promise<{ id: string; code: string; name: string }[]> {
  const { data, error } = await dbAdmin().from('component').select('id, code, name').order('code');
  if (error) throw error;
  return (data ?? []) as { id: string; code: string; name: string }[];
}
