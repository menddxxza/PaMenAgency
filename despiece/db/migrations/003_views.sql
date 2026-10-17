-- ============================================================
-- 003 — Vistas de lectura
-- ============================================================
-- El front no debe rearmar a mano el JOIN de 6 tablas de la jerarquía
-- de vehículo en cada ruta. Estas vistas son la superficie de lectura.
--
-- `security_invoker = true`: la vista se evalúa con los permisos de quien
-- consulta, así las políticas RLS de las tablas base siguen aplicando
-- (ver 005_rls.sql). Sin esto, la vista sería un agujero.
--
-- Idempotente.
-- ============================================================

CREATE OR REPLACE VIEW vehicle_full WITH (security_invoker = true) AS
SELECT
  v.id,
  v.slug,
  mf.slug            AS manufacturer_slug,
  mf.name            AS manufacturer_name,
  m.slug             AS model_slug,
  m.name             AS model_name,
  g.slug             AS generation_slug,
  g.name             AS generation_name,
  g.platform,
  bs.slug            AS body_slug,
  bs.name            AS body_name,
  bs.doors,
  e.code             AS engine_code,
  e.family           AS engine_family,
  e.displacement_cc,
  e.cylinders,
  e.fuel::text       AS fuel,
  e.aspiration,
  e.power_kw,
  e.torque_nm,
  e.emission_std,
  t.code             AS transmission_code,
  t.type::text       AS transmission_type,
  t.gears,
  t.name             AS transmission_name,
  v.trim,
  v.year_start,
  v.year_end,
  v.drivetrain::text AS drivetrain,
  v.market,
  v.length_mm, v.width_mm, v.height_mm, v.wheelbase_mm,
  v.kerb_weight_kg, v.tank_l,
  v.status::text     AS status,
  v.origin::text     AS origin,
  (SELECT count(*) FROM vehicle_component vc WHERE vc.vehicle_id = v.id)   AS component_count,
  (SELECT m3.id FROM model_3d m3
     WHERE m3.vehicle_id = v.id AND m3.status = 'published'
     ORDER BY m3.version DESC LIMIT 1)                                     AS model_3d_id
FROM vehicle v
JOIN generation g    ON g.id  = v.generation_id
JOIN model m         ON m.id  = g.model_id
JOIN manufacturer mf ON mf.id = m.manufacturer_id
JOIN body_style bs   ON bs.id = v.body_style_id
JOIN engine e        ON e.id  = v.engine_id
LEFT JOIN transmission t ON t.id = v.transmission_id;

COMMENT ON VIEW vehicle_full IS 'Vehículo con su jerarquía resuelta. Lectura del front.';

CREATE OR REPLACE VIEW component_full WITH (security_invoker = true) AS
SELECT
  c.id,
  c.code,
  c.name,
  c.description,
  c.position_note,
  c.material,
  c.difficulty,
  c.est_time_min,
  c.status::text AS status,
  c.origin::text AS origin,
  s.code         AS system_code,
  s.name         AS system_name,
  s.sort         AS system_sort,
  sub.code       AS subsystem_code,
  sub.name       AS subsystem_name,
  COALESCE((
    SELECT array_agg(t.name ORDER BY t.name)
    FROM component_tool ct JOIN tool t ON t.id = ct.tool_id
    WHERE ct.component_id = c.id
  ), ARRAY[]::text[]) AS tools,
  COALESCE((
    SELECT jsonb_agg(jsonb_build_object('code', r.code, 'name', r.name) ORDER BY d.step_order)
    FROM component_dependency d JOIN component r ON r.id = d.requires_id
    WHERE d.component_id = c.id
  ), '[]'::jsonb) AS requires,
  -- Piezas comprables asociadas. Hoy 0 en todo el catálogo: sin fuente
  -- licenciada. El front muestra "Información no disponible", no un hueco.
  (SELECT count(*) FROM part p WHERE p.component_id = c.id AND p.status = 'published') AS part_count
FROM component c
JOIN subsystem sub ON sub.id = c.subsystem_id
JOIN system s      ON s.id   = sub.system_id;

COMMENT ON VIEW component_full IS 'Componente conceptual con sistema, herramientas y dependencias.';
