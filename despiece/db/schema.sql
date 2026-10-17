-- ============================================================
-- PLATAFORMA 3D DE VEHÍCULOS — ESQUEMA NÚCLEO
-- Postgres 15+ / Supabase
-- Vehículo piloto: SEAT León III (5F) 2.0 TDI EA288
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
CREATE TYPE publish_status AS ENUM ('draft','review','published','archived');
CREATE TYPE data_origin    AS ENUM ('own','licensed','api','demo');
CREATE TYPE fuel_type      AS ENUM ('diesel','petrol','hybrid','phev','bev','cng','lpg','other');
CREATE TYPE drivetrain     AS ENUM ('fwd','rwd','awd');
CREATE TYPE trans_type     AS ENUM ('manual','automatic','dsg','cvt','other');

-- ============================================================
-- 1. JERARQUÍA DE VEHÍCULO
-- ============================================================

CREATE TABLE manufacturer (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,          -- 'seat'
  name        text NOT NULL,                 -- 'SEAT'
  country     text,
  "group"     text,                          -- 'Volkswagen Group'
  logo_key    text,
  status      publish_status NOT NULL DEFAULT 'draft',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE model (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id uuid NOT NULL REFERENCES manufacturer(id) ON DELETE CASCADE,
  slug            text NOT NULL,             -- 'leon'
  name            text NOT NULL,             -- 'León'
  status          publish_status NOT NULL DEFAULT 'draft',
  UNIQUE (manufacturer_id, slug)
);

CREATE TABLE generation (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id    uuid NOT NULL REFERENCES model(id) ON DELETE CASCADE,
  slug        text NOT NULL,                 -- '5f'
  name        text NOT NULL,                 -- 'III (5F)'
  platform    text,                          -- 'MQB'
  year_start  smallint NOT NULL,
  year_end    smallint,
  facelift_of uuid REFERENCES generation(id),
  UNIQUE (model_id, slug)
);

CREATE TABLE body_style (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug  text UNIQUE NOT NULL,                -- 'hatchback-5d'
  name  text NOT NULL,
  doors smallint
);

-- El motor es entidad de primer nivel: se reutiliza entre marcas del grupo.
-- Clave para el ahorro de modelado 3D en VAG.
CREATE TABLE engine (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code           text UNIQUE NOT NULL,       -- 'EA288' / 'CRLB'
  family         text,                       -- 'EA288'
  displacement_cc integer,
  cylinders      smallint,
  valves         smallint,
  fuel           fuel_type NOT NULL,
  aspiration     text,                       -- 'turbo VGT'
  power_kw       integer,
  torque_nm      integer,
  emission_std   text,                       -- 'Euro 6'
  notes          text
);

CREATE TABLE transmission (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code      text UNIQUE NOT NULL,            -- '0CW' (DSG7 DQ200)
  type      trans_type NOT NULL,
  gears     smallint,
  name      text
);

-- ============================================================
-- 2. VEHÍCULO CANÓNICO + DEDUPLICACIÓN
-- ============================================================

CREATE TABLE vehicle (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,      -- 'seat-leon-5f-2-0-tdi-150-2017'
  generation_id   uuid NOT NULL REFERENCES generation(id),
  body_style_id   uuid NOT NULL REFERENCES body_style(id),
  engine_id       uuid NOT NULL REFERENCES engine(id),
  transmission_id uuid REFERENCES transmission(id),
  trim            text,                      -- 'FR'
  year_start      smallint NOT NULL,
  year_end        smallint,
  drivetrain      drivetrain,
  market          text NOT NULL DEFAULT 'EU',

  -- Ficha técnica
  length_mm integer, width_mm integer, height_mm integer,
  wheelbase_mm integer, kerb_weight_kg integer, tank_l numeric(5,1),

  -- Dedupe: hash determinista de los IDs normalizados, NUNCA de texto libre.
  canonical_key   text NOT NULL,
  status          publish_status NOT NULL DEFAULT 'draft',
  origin          data_origin NOT NULL DEFAULT 'own',
  search_vector   tsvector,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canonical_key)
);

-- Toda cadena cruda vista en cualquier import apunta aquí.
-- "SEAT Leon 2.0TDI", "Seat León 150cv", "SEAT LEON 5F 2.0 TDI" -> mismo vehicle_id
CREATE TABLE vehicle_alias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  uuid NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
  raw_string  text NOT NULL,
  normalized  text NOT NULL,
  source      text NOT NULL,                 -- 'nhtsa' | 'manual' | 'supplier_x'
  confidence  numeric(3,2) NOT NULL DEFAULT 1.0,
  UNIQUE (normalized, source)
);

CREATE INDEX idx_vehicle_alias_trgm ON vehicle_alias USING gin (normalized gin_trgm_ops);
CREATE INDEX idx_vehicle_search ON vehicle USING gin (search_vector);
CREATE INDEX idx_vehicle_gen ON vehicle (generation_id);

-- Función de clave canónica: determinista, sin texto libre.
CREATE OR REPLACE FUNCTION make_canonical_key(
  p_gen uuid, p_body uuid, p_engine uuid, p_trans uuid,
  p_year smallint, p_trim text, p_market text
) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT encode(digest(
    coalesce(p_gen::text,'') || '|' || coalesce(p_body::text,'') || '|' ||
    coalesce(p_engine::text,'') || '|' || coalesce(p_trans::text,'') || '|' ||
    coalesce(p_year::text,'') || '|' ||
    lower(unaccent(coalesce(p_trim,''))) || '|' || coalesce(p_market,'EU'),
    'sha256'), 'hex');
$$;

-- ============================================================
-- 3. SISTEMAS / COMPONENTES (capa CONCEPTUAL — a esto apunta el 3D)
-- ============================================================

CREATE TABLE system (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code     text UNIQUE NOT NULL,             -- 'ENG'
  name     text NOT NULL,                    -- 'Motor'
  icon     text,
  sort     smallint NOT NULL DEFAULT 0
);

CREATE TABLE subsystem (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id uuid NOT NULL REFERENCES system(id) ON DELETE CASCADE,
  code      text NOT NULL,                   -- 'TURBO'
  name      text NOT NULL,                   -- 'Sobrealimentación'
  sort      smallint NOT NULL DEFAULT 0,
  UNIQUE (system_id, code)
);

-- Componente = pieza conceptual ("el turbo del EA288").
-- NO es una referencia comprable. Esa es `part`.
CREATE TABLE component (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subsystem_id  uuid NOT NULL REFERENCES subsystem(id),
  code          text UNIQUE NOT NULL,        -- 'ENG.TURBO.HOUSING'
  name          text NOT NULL,
  description   text,
  position_note text,                        -- 'Lado escape, bloque trasero'
  parent_id     uuid REFERENCES component(id),
  -- Si el componente pertenece a una familia de motor concreta se marca aquí:
  engine_id     uuid REFERENCES engine(id),
  difficulty    smallint CHECK (difficulty BETWEEN 1 AND 5),
  est_time_min  integer,
  status        publish_status NOT NULL DEFAULT 'draft',
  origin        data_origin NOT NULL DEFAULT 'own'
);

CREATE INDEX idx_component_subsystem ON component (subsystem_id);
CREATE INDEX idx_component_engine ON component (engine_id);

-- Qué hay que desmontar antes de llegar a X
CREATE TABLE component_dependency (
  component_id  uuid NOT NULL REFERENCES component(id) ON DELETE CASCADE,
  requires_id   uuid NOT NULL REFERENCES component(id) ON DELETE CASCADE,
  step_order    smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (component_id, requires_id),
  CHECK (component_id <> requires_id)
);

-- Qué componentes tiene realmente un vehículo concreto
CREATE TABLE vehicle_component (
  vehicle_id   uuid NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
  component_id uuid NOT NULL REFERENCES component(id) ON DELETE CASCADE,
  qty          smallint NOT NULL DEFAULT 1,
  note         text,
  PRIMARY KEY (vehicle_id, component_id)
);

-- ============================================================
-- 4. CAPA 3D
-- ============================================================

-- Biblioteca de mallas reutilizables. LA CLAVE DEL AHORRO DE MODELADO:
-- el turbo del EA288 se modela UNA vez y se instancia en León, Ateca,
-- Golf, Octavia, A3... cambiando solo transform.
CREATE TABLE mesh_asset (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text UNIQUE NOT NULL,         -- 'MESH.EA288.TURBO.HOUSING.V1'
  component_id uuid REFERENCES component(id),
  storage_key  text NOT NULL,                -- R2: 'meshes/ea288/turbo_housing_v1.glb'
  tri_count    integer,
  version      smallint NOT NULL DEFAULT 1,
  author       text,
  license      text NOT NULL DEFAULT 'proprietary',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE model_3d (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id   uuid NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
  code         text UNIQUE NOT NULL,         -- 'SEAT_5F_20TDI_2017_MAIN'
  storage_key  text NOT NULL,                -- R2: GLB comprimido
  version      smallint NOT NULL DEFAULT 1,
  scale_unit   text NOT NULL DEFAULT 'm',
  up_axis      text NOT NULL DEFAULT 'Y',
  tri_count    integer,
  file_bytes   bigint,
  status       publish_status NOT NULL DEFAULT 'draft',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Mapeo nodo glTF <-> componente. El vínculo de toda la plataforma.
-- node_uuid se escribe en extras del glTF desde Blender y sobrevive renombrados.
-- Los vectores de despiece viven AQUÍ, no en el GLB: se retocan sin reexportar.
CREATE TABLE model_node (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_3d_id   uuid NOT NULL REFERENCES model_3d(id) ON DELETE CASCADE,
  node_uuid     text NOT NULL,               -- de glTF extras.node_uuid
  node_path     text NOT NULL,               -- fallback: 'Body/Engine/ENG.TURBO.HOUSING.001'
  component_id  uuid REFERENCES component(id),
  mesh_asset_id uuid REFERENCES mesh_asset(id),

  -- Despiece
  explode_x     real NOT NULL DEFAULT 0,
  explode_y     real NOT NULL DEFAULT 0,
  explode_z     real NOT NULL DEFAULT 0,
  explode_order smallint NOT NULL DEFAULT 0,
  explode_group text,                        -- 'ENG' — permite despiezar solo un sistema
  selectable    boolean NOT NULL DEFAULT true,
  label_anchor  real[3],

  UNIQUE (model_3d_id, node_uuid)
);

CREATE INDEX idx_model_node_component ON model_node (component_id);
CREATE INDEX idx_model_node_model ON model_node (model_3d_id);

-- ============================================================
-- 5. PIEZAS REALES / REFERENCIAS / PROVEEDORES
-- ============================================================

CREATE TABLE brand (                          -- fabricante de recambio
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug    text UNIQUE NOT NULL,              -- 'garrett'
  name    text NOT NULL,
  tier    smallint CHECK (tier BETWEEN 1 AND 3)  -- 1=OE, 2=OEM, 3=aftermarket
);

CREATE TABLE part (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid NOT NULL REFERENCES component(id),
  brand_id     uuid REFERENCES brand(id),
  name         text NOT NULL,
  is_oem       boolean NOT NULL DEFAULT false,
  status       publish_status NOT NULL DEFAULT 'draft',
  origin       data_origin NOT NULL DEFAULT 'demo',
  search_vector tsvector
);

CREATE INDEX idx_part_component ON part (component_id);
CREATE INDEX idx_part_search ON part USING gin (search_vector);

CREATE TABLE part_reference (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id   uuid NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  ref_type  text NOT NULL,                   -- 'oem' | 'aftermarket' | 'ean'
  ref_code  text NOT NULL,
  normalized text GENERATED ALWAYS AS (upper(regexp_replace(ref_code,'[^A-Za-z0-9]','','g'))) STORED,
  origin    data_origin NOT NULL DEFAULT 'demo',
  UNIQUE (part_id, ref_type, ref_code)
);

CREATE INDEX idx_part_ref_norm ON part_reference (normalized);

-- Cruces entre referencias equivalentes (OEM <-> aftermarket)
CREATE TABLE reference_equivalence (
  ref_a uuid NOT NULL REFERENCES part_reference(id) ON DELETE CASCADE,
  ref_b uuid NOT NULL REFERENCES part_reference(id) ON DELETE CASCADE,
  source text NOT NULL,
  PRIMARY KEY (ref_a, ref_b)
);

CREATE TABLE part_fitment (
  part_id    uuid NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
  note       text,
  origin     data_origin NOT NULL DEFAULT 'demo',
  PRIMARY KEY (part_id, vehicle_id)
);

CREATE TABLE supplier (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  country     text,
  website     text,
  currency    char(3) NOT NULL DEFAULT 'EUR',
  api_adapter text,                          -- nombre del adaptador en código
  active      boolean NOT NULL DEFAULT true
);

-- Precios: histórico, nunca sobrescritos. Sin precio -> "Información no disponible".
CREATE TABLE price_quote (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id     uuid NOT NULL REFERENCES part(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplier(id),
  amount      numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency    char(3) NOT NULL DEFAULT 'EUR',
  in_stock    boolean,
  url         text,
  origin      data_origin NOT NULL,
  fetched_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_part_recent ON price_quote (part_id, fetched_at DESC);

-- ============================================================
-- 6. PROCEDIMIENTOS / HERRAMIENTAS  (fase 2, estructura lista)
-- ============================================================

CREATE TABLE tool (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  spec text                                  -- 'Torx T30'
);

CREATE TABLE repair_procedure (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid NOT NULL REFERENCES component(id) ON DELETE CASCADE,
  vehicle_id   uuid REFERENCES vehicle(id),   -- NULL = aplica a toda la familia
  title        text NOT NULL,
  est_time_min integer,
  difficulty   smallint CHECK (difficulty BETWEEN 1 AND 5),
  origin       data_origin NOT NULL,          -- 'own' | 'licensed' obligatorio
  license_ref  text,
  status       publish_status NOT NULL DEFAULT 'draft',
  CHECK (origin IN ('own','licensed','demo'))  -- nunca scraping
);

CREATE TABLE procedure_step (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  procedure_id uuid NOT NULL REFERENCES repair_procedure(id) ON DELETE CASCADE,
  step_order   smallint NOT NULL,
  instruction  text NOT NULL,
  torque_nm    numeric(6,1),
  component_id uuid REFERENCES component(id), -- resaltar en 3D
  UNIQUE (procedure_id, step_order)
);

CREATE TABLE procedure_tool (
  procedure_id uuid NOT NULL REFERENCES repair_procedure(id) ON DELETE CASCADE,
  tool_id      uuid NOT NULL REFERENCES tool(id),
  PRIMARY KEY (procedure_id, tool_id)
);

-- ============================================================
-- 7. USUARIOS / MODO TALLER
-- ============================================================

CREATE TABLE workshop (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  cif        text,
  city       text,
  plan       text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app_user (
  id          uuid PRIMARY KEY,              -- = auth.users.id (Supabase)
  workshop_id uuid REFERENCES workshop(id),
  role        text NOT NULL DEFAULT 'user',  -- user | mechanic | admin
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_favorite (
  user_id    uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicle(id) ON DELETE CASCADE,
  part_id    uuid REFERENCES part(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(vehicle_id, part_id) = 1)
);

CREATE TABLE user_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicle(id) ON DELETE SET NULL,
  component_id uuid REFERENCES component(id) ON DELETE SET NULL,
  query      text,
  at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_history_user ON user_history (user_id, at DESC);

-- ============================================================
-- 8. IMPORTACIÓN (trazabilidad de toda fuente externa)
-- ============================================================

CREATE TABLE import_run (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source    text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  rows_in   integer, rows_new integer, rows_merged integer, rows_rejected integer,
  license_note text NOT NULL                 -- obligatorio: bajo qué derecho se importa
);

CREATE TABLE import_row (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_run_id uuid NOT NULL REFERENCES import_run(id) ON DELETE CASCADE,
  raw           jsonb NOT NULL,
  vehicle_id    uuid REFERENCES vehicle(id),
  outcome       text NOT NULL,               -- new | merged | rejected
  reason        text
);

-- ============================================================
-- 9. BÚSQUEDA
-- ============================================================

CREATE OR REPLACE FUNCTION vehicle_search_refresh() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE txt text;
BEGIN
  SELECT unaccent(concat_ws(' ',
    mf.name, m.name, g.name, g.slug, e.code, e.family,
    NEW.trim, NEW.year_start::text, bs.name))
  INTO txt
  FROM generation g
  JOIN model m ON m.id = g.model_id
  JOIN manufacturer mf ON mf.id = m.manufacturer_id
  JOIN engine e ON e.id = NEW.engine_id
  JOIN body_style bs ON bs.id = NEW.body_style_id
  WHERE g.id = NEW.generation_id;

  NEW.search_vector := to_tsvector('simple', coalesce(txt,''));
  RETURN NEW;
END $$;

CREATE TRIGGER trg_vehicle_search
BEFORE INSERT OR UPDATE ON vehicle
FOR EACH ROW EXECUTE FUNCTION vehicle_search_refresh();
