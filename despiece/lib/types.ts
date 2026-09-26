// Tipos de las vistas de lectura (db/migrations/003_views.sql).
// Se escriben a mano y no se generan: el contrato con la BD debe romper
// la compilación cuando cambie, no fallar en runtime.

export type PublishStatus = 'draft' | 'review' | 'published' | 'archived';
export type DataOrigin = 'own' | 'licensed' | 'api' | 'demo';

/** Fila de la vista `vehicle_full`. */
export type VehicleFull = {
  id: string;
  slug: string;
  manufacturer_slug: string;
  manufacturer_name: string;
  model_slug: string;
  model_name: string;
  generation_slug: string;
  generation_name: string;
  platform: string | null;
  body_slug: string;
  body_name: string;
  doors: number | null;
  engine_code: string;
  engine_family: string | null;
  displacement_cc: number | null;
  cylinders: number | null;
  fuel: string;
  aspiration: string | null;
  power_kw: number | null;
  torque_nm: number | null;
  emission_std: string | null;
  transmission_code: string | null;
  transmission_type: string | null;
  gears: number | null;
  transmission_name: string | null;
  trim: string | null;
  year_start: number;
  year_end: number | null;
  drivetrain: string | null;
  market: string;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  wheelbase_mm: number | null;
  kerb_weight_kg: number | null;
  tank_l: number | null;
  status: PublishStatus;
  origin: DataOrigin;
  component_count: number;
  model_3d_id: string | null;
};

export type ComponentRequirement = { code: string; name: string };

/** Fila de la vista `component_full`. */
export type ComponentFull = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  position_note: string | null;
  material: string | null;
  difficulty: number | null;
  est_time_min: number | null;
  status: PublishStatus;
  origin: DataOrigin;
  system_code: string;
  system_name: string;
  system_sort: number;
  subsystem_code: string;
  subsystem_name: string;
  tools: string[];
  requires: ComponentRequirement[];
  part_count: number;
};

export type Model3D = {
  id: string;
  vehicle_id: string;
  code: string;
  storage_key: string;
  version: number;
  scale_unit: string;
  up_axis: string;
  tri_count: number | null;
  file_bytes: number | null;
  status: PublishStatus;
  created_at: string;
};

/** Fila de `model_node`: el vínculo nodo glTF ↔ componente. */
export type ModelNode = {
  id: string;
  model_3d_id: string;
  node_uuid: string;
  node_path: string;
  component_id: string | null;
  mesh_asset_id: string | null;
  explode_x: number;
  explode_y: number;
  explode_z: number;
  explode_order: number;
  explode_group: string | null;
  selectable: boolean;
  label_anchor: [number, number, number] | null;
};

/** Lo que necesita el visor: nodo + el componente al que apunta. */
export type ViewerNode = ModelNode & {
  component: Pick<
    ComponentFull,
    'code' | 'name' | 'system_code' | 'system_name' | 'subsystem_name' | 'difficulty' | 'est_time_min'
  > | null;
};
