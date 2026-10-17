-- ============================================================
-- SEED — SEAT Leon III (5F) / EA288
-- GENERADO. No editar a mano: `python3 tools/gen_seed.py`.
-- Fuente: prototype/app.html (constantes DB, SYSTEMS y C).
--
-- TODO ESTE CONTENIDO ES origin = 'demo'.
-- Ficha tecnica, tiempos, dificultades y herramientas NO estan
-- verificados contra documentacion oficial ni licenciada; la UI los
-- marca como DEMO DATA. Referencias OEM, equivalencias, proveedores
-- y precios se dejan VACIOS a proposito (regla 1: no inventar datos).
--
-- Idempotente. Requiere schema.sql + db/migrations aplicados antes.
-- ============================================================

BEGIN;

-- ---------- SISTEMAS ----------
INSERT INTO system (code, name, sort) VALUES ('ENG', 'Motor', 0)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;
INSERT INTO system (code, name, sort) VALUES ('INT', 'Admisión', 1)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;
INSERT INTO system (code, name, sort) VALUES ('EXH', 'Escape', 2)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;
INSERT INTO system (code, name, sort) VALUES ('FUEL', 'Combustible', 3)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;
INSERT INTO system (code, name, sort) VALUES ('COOL', 'Refrigeración', 4)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;
INSERT INTO system (code, name, sort) VALUES ('ELE', 'Eléctrico', 5)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;
INSERT INTO system (code, name, sort) VALUES ('TRN', 'Transmisión', 6)
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;

-- ---------- SUBSISTEMAS (derivados de SYS.SUBSYS.COMPONENT) ----------
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'BLOCK', 'Bloque', 0 FROM system WHERE code = 'ENG'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'HEAD', 'Culata', 1 FROM system WHERE code = 'ENG'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'SUMP', 'Lubricación', 2 FROM system WHERE code = 'ENG'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'OIL', 'Lubricación', 3 FROM system WHERE code = 'ENG'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'CRANK', 'Distribución', 4 FROM system WHERE code = 'ENG'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'BELT', 'Distribución', 5 FROM system WHERE code = 'ENG'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'TURBO', 'Sobrealimentación', 6 FROM system WHERE code = 'INT'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'MANIFOLD', 'Admisión', 7 FROM system WHERE code = 'INT'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'INTERCOOLER', 'Admisión', 8 FROM system WHERE code = 'INT'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'PIPE', 'Admisión', 9 FROM system WHERE code = 'INT'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'COVER', 'Admisión', 10 FROM system WHERE code = 'INT'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'EGR', 'EGR', 11 FROM system WHERE code = 'INT'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'MANIFOLD', 'Escape', 12 FROM system WHERE code = 'EXH'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'DOWNPIPE', 'Escape', 13 FROM system WHERE code = 'EXH'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'RAIL', 'Alta presión', 14 FROM system WHERE code = 'FUEL'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'INJ', 'Inyección', 15 FROM system WHERE code = 'FUEL'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'PUMP', 'Alta presión', 16 FROM system WHERE code = 'FUEL'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'PUMP', 'Refrigeración', 17 FROM system WHERE code = 'COOL'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'THERMO', 'Refrigeración', 18 FROM system WHERE code = 'COOL'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'RAD', 'Refrigeración', 19 FROM system WHERE code = 'COOL'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'ALT', 'Carga', 20 FROM system WHERE code = 'ELE'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'START', 'Arranque', 21 FROM system WHERE code = 'ELE'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO subsystem (system_id, code, name, sort)
  SELECT id, 'FLY', 'Embrague', 22 FROM system WHERE code = 'TRN'
  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;

-- ---------- MARCA / MODELO / GENERACION ----------
INSERT INTO manufacturer (slug, name, country, "group", status)
  VALUES ('seat', 'SEAT', 'ES', 'Volkswagen Group', 'published')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;
INSERT INTO model (manufacturer_id, slug, name, status)
  SELECT id, 'leon', 'León', 'published' FROM manufacturer WHERE slug = 'seat'
  ON CONFLICT (manufacturer_id, slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;
INSERT INTO generation (model_id, slug, name, platform, year_start, year_end)
  SELECT id, '5f', 'III (5F)', 'MQB', 2012, 2020
  FROM model WHERE slug = 'leon'
  ON CONFLICT (model_id, slug) DO UPDATE SET name = EXCLUDED.name, platform = EXCLUDED.platform;

-- ---------- CARROCERIAS ----------
INSERT INTO body_style (slug, name, doors) VALUES ('hatchback-5d', '5 puertas', 5)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, doors = EXCLUDED.doors;
INSERT INTO body_style (slug, name, doors) VALUES ('hatchback-3d', 'SC 3 puertas', 3)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, doors = EXCLUDED.doors;
INSERT INTO body_style (slug, name, doors) VALUES ('estate', 'ST familiar', 5)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, doors = EXCLUDED.doors;

-- ---------- MOTORES (entidad de primer nivel: reutilizados en todo el grupo) ----------
INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,
    power_kw, torque_nm, emission_std, notes)
  VALUES ('CRLB / DFGA', 'EA288', 1968, 4, 'diesel', 'Turbo VGT',
    110, 340, 'Euro 6', 'DEMO DATA - sin verificar')
  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,
    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;
INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,
    power_kw, torque_nm, emission_std, notes)
  VALUES ('CUNA / DFHA', 'EA288', 1968, 4, 'diesel', 'Turbo VGT',
    135, 380, 'Euro 6', 'DEMO DATA - sin verificar')
  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,
    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;
INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,
    power_kw, torque_nm, emission_std, notes)
  VALUES ('CXXB / DDYA', 'EA288', 1598, 4, 'diesel', 'Turbo VGT',
    85, 250, 'Euro 6', 'DEMO DATA - sin verificar')
  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,
    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;
INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,
    power_kw, torque_nm, emission_std, notes)
  VALUES ('CZEA', 'EA211', 1395, 4, 'petrol', 'Turbo',
    92, 200, 'Euro 6', 'DEMO DATA - sin verificar')
  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,
    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;
INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,
    power_kw, torque_nm, emission_std, notes)
  VALUES ('DADA', 'EA211 evo', 1498, 4, 'petrol', 'Turbo',
    110, 250, 'Euro 6', 'DEMO DATA - sin verificar')
  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,
    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;
INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,
    power_kw, torque_nm, emission_std, notes)
  VALUES ('DJHA', 'EA888 gen3', 1984, 4, 'petrol', 'Turbo',
    213, 380, 'Euro 6', 'DEMO DATA - sin verificar')
  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,
    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;

-- ---------- CAMBIOS ----------
INSERT INTO transmission (code, type, gears, name) VALUES ('MQ350 / 02Q', 'manual', 6, 'Manual 6v')
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO transmission (code, type, gears, name) VALUES ('DQ381', 'dsg', 7, 'DSG 7v')
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO transmission (code, type, gears, name) VALUES ('DQ250', 'dsg', 6, 'DSG 6v')
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- ---------- VEHICULOS ----------
-- canonical_key se calcula con make_canonical_key() sobre IDs, nunca sobre texto libre.
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-5f-2-0-tdi-150-fr-2017', g.id, b.id, e.id, t.id, 'FR',
    2016, 2020, 'fwd', 'EU', 4282, 1816, 1459, 2636,
    1350, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2016::smallint, 'FR', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'CRLB / DFGA' AND t.code = 'DQ381'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-5f-2-0-tdi-150-style-2017', g.id, b.id, e.id, t.id, 'Style',
    2016, 2020, 'fwd', 'EU', 4282, 1816, 1459, 2636,
    1320, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2016::smallint, 'Style', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'CRLB / DFGA' AND t.code = 'MQ350 / 02Q'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-st-5f-2-0-tdi-150-xcellence-2018', g.id, b.id, e.id, t.id, 'Xcellence',
    2016, 2020, 'fwd', 'EU', 4548, 1816, 1454, 2636,
    1405, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2016::smallint, 'Xcellence', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'estate'
    AND e.code = 'CRLB / DFGA' AND t.code = 'DQ381'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-5f-2-0-tdi-184-fr-2016', g.id, b.id, e.id, t.id, 'FR',
    2014, 2020, 'fwd', 'EU', 4282, 1816, 1459, 2636,
    1375, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2014::smallint, 'FR', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'CUNA / DFHA' AND t.code = 'DQ381'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-5f-1-6-tdi-115-reference-2018', g.id, b.id, e.id, t.id, 'Reference',
    2017, 2020, 'fwd', 'EU', 4282, 1816, 1459, 2636,
    1280, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2017::smallint, 'Reference', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'CXXB / DDYA' AND t.code = 'MQ350 / 02Q'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-5f-1-4-tsi-125-style-2016', g.id, b.id, e.id, t.id, 'Style',
    2014, 2018, 'fwd', 'EU', 4282, 1816, 1459, 2636,
    1205, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2014::smallint, 'Style', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'CZEA' AND t.code = 'MQ350 / 02Q'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-5f-1-5-tsi-150-fr-2019', g.id, b.id, e.id, t.id, 'FR',
    2018, 2020, 'fwd', 'EU', 4282, 1816, 1459, 2636,
    1245, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2018::smallint, 'FR', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'DADA' AND t.code = 'DQ381'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,
    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,
    kerb_weight_kg, tank_l, canonical_key, status, origin)
  SELECT 'seat-leon-cupra-5f-290-2017', g.id, b.id, e.id, t.id, 'Cupra 290',
    2016, 2018, 'fwd', 'EU', 4282, 1816, 1449, 2636,
    1375, 50,
    make_canonical_key(g.id, b.id, e.id, t.id, 2016::smallint, 'Cupra 290', 'EU'),
    'published', 'demo'
  FROM generation g, body_style b, engine e, transmission t
  WHERE g.slug = '5f' AND b.slug = 'hatchback-5d'
    AND e.code = 'DJHA' AND t.code = 'DQ250'
  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,
    status = EXCLUDED.status, origin = EXCLUDED.origin;

-- ---------- ALIAS DE VEHICULO (colapso de cadenas crudas en el dedupe) ----------
INSERT INTO vehicle_alias (vehicle_id, raw_string, normalized, source, confidence)
  SELECT id, 'SEAT Leon 2.0 TDI 150 FR', 'seat leon 2.0 tdi 150 fr', 'manual', 1.0 FROM vehicle WHERE slug = 'seat-leon-5f-2-0-tdi-150-fr-2017'
  ON CONFLICT (normalized, source) DO NOTHING;
INSERT INTO vehicle_alias (vehicle_id, raw_string, normalized, source, confidence)
  SELECT id, 'Seat Leon 5F 2.0TDI 150cv FR DSG', 'seat leon 5f 2.0tdi 150cv fr dsg', 'manual', 1.0 FROM vehicle WHERE slug = 'seat-leon-5f-2-0-tdi-150-fr-2017'
  ON CONFLICT (normalized, source) DO NOTHING;
INSERT INTO vehicle_alias (vehicle_id, raw_string, normalized, source, confidence)
  SELECT id, 'SEAT LEON 5F 2.0 TDI 184', 'seat leon 5f 2.0 tdi 184', 'manual', 1.0 FROM vehicle WHERE slug = 'seat-leon-5f-2-0-tdi-184-fr-2016'
  ON CONFLICT (normalized, source) DO NOTHING;

-- ---------- HERRAMIENTAS ----------
INSERT INTO tool (slug, name) VALUES ('grua-de-motor', 'Grúa de motor')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('llave-dinamometrica', 'Llave dinamométrica')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('juego-torx', 'Juego Torx')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('torx-t45', 'Torx T45')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('util-de-calado', 'Útil de calado')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('torx-t30', 'Torx T30')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('rascador-de-juntas', 'Rascador de juntas')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('vaso-32-mm', 'Vaso 32 mm')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('util-de-retencion', 'Útil de retención')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('triple-cuadrado-m16', 'Triple cuadrado M16')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('util-tensor', 'Útil tensor')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('carraca', 'Carraca')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('e-torx', 'E-Torx')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('penetrante', 'Penetrante')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('torx-t25', 'Torx T25')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('equipo-de-diagnosis', 'Equipo de diagnosis')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('juego-de-juntas', 'Juego de juntas')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('pinzas-de-abrazadera', 'Pinzas de abrazadera')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('destornillador-plano', 'Destornillador plano')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('pinzas', 'Pinzas')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('limpiador-de-admision', 'Limpiador de admisión')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('vaso', 'Vaso')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('llave-de-tubos-17-mm', 'Llave de tubos 17 mm')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('extractor-de-inyectores', 'Extractor de inyectores')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('extractor', 'Extractor')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('recipiente-de-vaciado', 'Recipiente de vaciado')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('vaso-16-mm', 'Vaso 16 mm')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('vaso-largo-16-mm', 'Vaso largo 16 mm')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('extension', 'Extensión')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('grua', 'Grúa')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO tool (slug, name) VALUES ('dinamometrica-angular', 'Dinamométrica angular')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- ---------- COMPONENTES (27) ----------
-- Capa CONCEPTUAL: a esto apunta el 3D (model_node.component_id).
-- engine_id apunta al motor piloto del catalogo (CRLB / DFGA, EA288).
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.BLOCK.MAIN', 'Bloque motor', 'Aloja cilindros, cigüeñal y circuitos de aceite y refrigerante. Fundición de hierro en el EA288 diésel.', 'Centro del conjunto, transversal', 'Fundición gris',
    e.id, 5, 960, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'BLOCK' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.HEAD.MAIN', 'Culata', 'Cierra las cámaras de combustión. Aloja árboles de levas, válvulas e inyectores.', 'Sobre el bloque, lado superior', 'Aluminio',
    e.id, 5, 600, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'HEAD' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.HEAD.COVER', 'Tapa de balancines', 'Sella la zona de árboles de levas y separa los vapores de aceite.', 'Parte superior de la culata', 'Polímero reforzado',
    e.id, 2, 45, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'HEAD' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.SUMP.PAN', 'Cárter de aceite', 'Depósito de aceite del motor. Aloja la aspiración de la bomba.', 'Parte inferior del bloque', 'Aluminio',
    e.id, 3, 120, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'SUMP' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.OIL.FILTER', 'Filtro de aceite', 'Retiene partículas del circuito de lubricación. Cartucho en carcasa fija.', 'Módulo frontal, lado admisión', 'Celulosa / carcasa polímero',
    e.id, 1, 15, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'OIL' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.CRANK.PULLEY', 'Polea de cigüeñal', 'Transmite el giro a la correa de accesorios. Damper de vibraciones torsionales.', 'Extremo derecho del cigüeñal', 'Acero / caucho',
    e.id, 4, 90, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'CRANK' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ENG.BELT.AUX', 'Correa de accesorios', 'Arrastra alternador, bomba de agua y compresor de clima.', 'Lado derecho del motor', 'Caucho EPDM',
    e.id, 2, 40, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ENG' AND sub.code = 'BELT' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.TURBO.HOUSING', 'Turbo — carcasa turbina', 'Aprovecha los gases de escape para accionar la turbina. Geometría variable.', 'Lado escape, parte trasera del bloque', 'Fundición refractaria',
    e.id, 4, 300, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'TURBO' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.TURBO.COMPRESSOR', 'Turbo — carcasa compresora', 'Comprime el aire de admisión que entra al intercooler.', 'Solidaria a la turbina, lado admisión', 'Aluminio',
    e.id, 4, 300, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'TURBO' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.TURBO.ACTUATOR', 'Actuador de geometría variable', 'Regula el ángulo de los álabes según la carga. Mando eléctrico, requiere adaptación tras sustituir.', 'Lateral del turbo', 'Aluminio / polímero',
    e.id, 3, 120, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'TURBO' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.MANIFOLD.MAIN', 'Colector de admisión', 'Distribuye el aire a los cilindros. Incorpora mariposas de turbulencia.', 'Cara delantera de la culata', 'Polímero reforzado',
    e.id, 3, 150, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'MANIFOLD' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.INTERCOOLER.MAIN', 'Intercooler', 'Enfría el aire comprimido por el turbo, aumentando la densidad de la carga.', 'Frontal, delante del radiador', 'Aluminio',
    e.id, 3, 180, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'INTERCOOLER' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.PIPE.CHARGE', 'Conducto de sobrealimentación', 'Canaliza el aire presurizado. Punto habitual de fugas de presión.', 'Entre turbo e intercooler', 'Aluminio / silicona',
    e.id, 2, 45, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'PIPE' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.COVER.MAIN', 'Cubierta insonorizante', 'Cubierta estética y acústica. Primer elemento a retirar en casi cualquier intervención.', 'Sobre el motor', 'Polímero espumado',
    e.id, 1, 5, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'COVER' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.EGR.COOLER', 'Refrigerador EGR', 'Enfría los gases recirculados antes de reintroducirlos en la admisión.', 'Lateral trasero de la culata', 'Acero inoxidable',
    e.id, 4, 240, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'EGR' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'INT.EGR.VALVE', 'Válvula EGR', 'Regula el caudal de gases recirculados. Fuente frecuente de carbonilla.', 'Junto al refrigerador EGR', 'Aluminio / acero',
    e.id, 3, 150, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'INT' AND sub.code = 'EGR' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'EXH.MANIFOLD.MAIN', 'Colector de escape', 'Conduce los gases de los cilindros hacia la turbina.', 'Cara trasera de la culata', 'Fundición refractaria',
    e.id, 4, 270, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'EXH' AND sub.code = 'MANIFOLD' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'EXH.DOWNPIPE.MAIN', 'Bajante de escape', 'Conecta la salida de turbina con el sistema de postratamiento.', 'Bajo el turbo, hacia el tren trasero', 'Acero inoxidable',
    e.id, 3, 120, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'EXH' AND sub.code = 'DOWNPIPE' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'FUEL.RAIL.MAIN', 'Rail de alta presión', 'Acumulador común de gasoil a alta presión para los inyectores.', 'Parte superior de la culata', 'Acero forjado',
    e.id, 4, 180, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'FUEL' AND sub.code = 'RAIL' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'FUEL.INJ.CYL', 'Inyector (×4)', 'Pulverizan el gasoil en la cámara. Requieren codificación IMA tras sustitución.', 'Verticales en la culata, uno por cilindro', 'Acero',
    e.id, 4, 210, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'FUEL' AND sub.code = 'INJ' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'FUEL.PUMP.HP', 'Bomba de alta presión', 'Eleva la presión del combustible hasta el valor de rail. Accionada por el árbol de levas.', 'Extremo izquierdo de la culata', 'Aluminio / acero',
    e.id, 5, 300, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'FUEL' AND sub.code = 'PUMP' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'COOL.PUMP.WATER', 'Bomba de agua', 'Impulsa el refrigerante por el circuito. En el EA288 forma módulo con el termostato.', 'Lado derecho del bloque', 'Aluminio / polímero',
    e.id, 4, 240, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'COOL' AND sub.code = 'PUMP' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'COOL.THERMO.MAIN', 'Termostato', 'Regula la temperatura de funcionamiento abriendo el circuito al radiador.', 'Integrado en el módulo de bomba', 'Polímero / latón',
    e.id, 3, 150, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'COOL' AND sub.code = 'THERMO' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'COOL.RAD.MAIN', 'Radiador', 'Disipa el calor del refrigerante al aire ambiente.', 'Frontal, tras el intercooler', 'Aluminio / polímero',
    e.id, 3, 210, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'COOL' AND sub.code = 'RAD' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ELE.ALT.MAIN', 'Alternador', 'Genera corriente y mantiene la carga de la batería. Polea de rueda libre.', 'Lado derecho, arrastrado por la correa', 'Aluminio / cobre',
    e.id, 3, 120, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ELE' AND sub.code = 'ALT' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'ELE.START.MAIN', 'Motor de arranque', 'Arrastra el volante motor en el arranque.', 'Unión bloque-caja, zona trasera', 'Acero / aluminio',
    e.id, 3, 150, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'ELE' AND sub.code = 'START' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;
INSERT INTO component (subsystem_id, code, name, description, position_note, material,
    engine_id, difficulty, est_time_min, status, origin)
  SELECT sub.id, 'TRN.FLY.DMF', 'Volante bimasa', 'Absorbe las vibraciones torsionales entre motor y caja de cambios.', 'Extremo izquierdo del cigüeñal', 'Acero',
    e.id, 5, 480, 'published', 'demo'
  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e
  WHERE s.code = 'TRN' AND sub.code = 'FLY' AND e.code = 'CRLB / DFGA'
  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
    position_note = EXCLUDED.position_note, material = EXCLUDED.material,
    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,
    status = EXCLUDED.status, origin = EXCLUDED.origin;

-- ---------- HERRAMIENTAS POR COMPONENTE ----------
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.BLOCK.MAIN' AND t.slug = 'grua-de-motor'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.BLOCK.MAIN' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.BLOCK.MAIN' AND t.slug = 'juego-torx'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.HEAD.MAIN' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.HEAD.MAIN' AND t.slug = 'torx-t45'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.HEAD.MAIN' AND t.slug = 'util-de-calado'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.HEAD.COVER' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.HEAD.COVER' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.SUMP.PAN' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.SUMP.PAN' AND t.slug = 'rascador-de-juntas'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.OIL.FILTER' AND t.slug = 'vaso-32-mm'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.CRANK.PULLEY' AND t.slug = 'util-de-retencion'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.CRANK.PULLEY' AND t.slug = 'triple-cuadrado-m16'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.BELT.AUX' AND t.slug = 'util-tensor'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ENG.BELT.AUX' AND t.slug = 'carraca'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.HOUSING' AND t.slug = 'e-torx'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.HOUSING' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.HOUSING' AND t.slug = 'penetrante'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.COMPRESSOR' AND t.slug = 'e-torx'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.COMPRESSOR' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.ACTUATOR' AND t.slug = 'torx-t25'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.TURBO.ACTUATOR' AND t.slug = 'equipo-de-diagnosis'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.MANIFOLD.MAIN' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.MANIFOLD.MAIN' AND t.slug = 'juego-de-juntas'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.INTERCOOLER.MAIN' AND t.slug = 'torx-t25'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.INTERCOOLER.MAIN' AND t.slug = 'pinzas-de-abrazadera'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.PIPE.CHARGE' AND t.slug = 'destornillador-plano'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.PIPE.CHARGE' AND t.slug = 'pinzas'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.EGR.COOLER' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.EGR.COOLER' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.EGR.VALVE' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'INT.EGR.VALVE' AND t.slug = 'limpiador-de-admision'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'EXH.MANIFOLD.MAIN' AND t.slug = 'e-torx'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'EXH.MANIFOLD.MAIN' AND t.slug = 'penetrante'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'EXH.MANIFOLD.MAIN' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'EXH.DOWNPIPE.MAIN' AND t.slug = 'vaso'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'EXH.DOWNPIPE.MAIN' AND t.slug = 'penetrante'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.RAIL.MAIN' AND t.slug = 'llave-de-tubos-17-mm'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.RAIL.MAIN' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.INJ.CYL' AND t.slug = 'extractor-de-inyectores'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.INJ.CYL' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.INJ.CYL' AND t.slug = 'equipo-de-diagnosis'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.PUMP.HP' AND t.slug = 'extractor'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.PUMP.HP' AND t.slug = 'util-de-calado'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'FUEL.PUMP.HP' AND t.slug = 'llave-dinamometrica'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'COOL.PUMP.WATER' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'COOL.PUMP.WATER' AND t.slug = 'recipiente-de-vaciado'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'COOL.THERMO.MAIN' AND t.slug = 'torx-t30'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'COOL.RAD.MAIN' AND t.slug = 'pinzas-de-abrazadera'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'COOL.RAD.MAIN' AND t.slug = 'torx-t25'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ELE.ALT.MAIN' AND t.slug = 'util-tensor'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ELE.ALT.MAIN' AND t.slug = 'vaso-16-mm'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ELE.START.MAIN' AND t.slug = 'vaso-largo-16-mm'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'ELE.START.MAIN' AND t.slug = 'extension'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'TRN.FLY.DMF' AND t.slug = 'grua'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'TRN.FLY.DMF' AND t.slug = 'util-de-retencion'
  ON CONFLICT DO NOTHING;
INSERT INTO component_tool (component_id, tool_id)
  SELECT c.id, t.id FROM component c, tool t WHERE c.code = 'TRN.FLY.DMF' AND t.slug = 'dinamometrica-angular'
  ON CONFLICT DO NOTHING;

-- ---------- DEPENDENCIAS DE DESMONTAJE ----------
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'ENG.HEAD.MAIN' AND r.code = 'ENG.HEAD.COVER'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 1 FROM component c, component r
  WHERE c.code = 'ENG.HEAD.MAIN' AND r.code = 'FUEL.RAIL.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 2 FROM component c, component r
  WHERE c.code = 'ENG.HEAD.MAIN' AND r.code = 'INT.MANIFOLD.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'ENG.HEAD.COVER' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'INT.TURBO.HOUSING' AND r.code = 'EXH.MANIFOLD.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 1 FROM component c, component r
  WHERE c.code = 'INT.TURBO.HOUSING' AND r.code = 'EXH.DOWNPIPE.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 2 FROM component c, component r
  WHERE c.code = 'INT.TURBO.HOUSING' AND r.code = 'INT.TURBO.ACTUATOR'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'INT.TURBO.COMPRESSOR' AND r.code = 'INT.PIPE.CHARGE'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'INT.MANIFOLD.MAIN' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'INT.INTERCOOLER.MAIN' AND r.code = 'INT.PIPE.CHARGE'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'INT.EGR.COOLER' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 1 FROM component c, component r
  WHERE c.code = 'INT.EGR.COOLER' AND r.code = 'INT.MANIFOLD.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'INT.EGR.VALVE' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'EXH.MANIFOLD.MAIN' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'FUEL.RAIL.MAIN' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'FUEL.INJ.CYL' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 1 FROM component c, component r
  WHERE c.code = 'FUEL.INJ.CYL' AND r.code = 'FUEL.RAIL.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'FUEL.PUMP.HP' AND r.code = 'INT.COVER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 1 FROM component c, component r
  WHERE c.code = 'FUEL.PUMP.HP' AND r.code = 'ENG.BELT.AUX'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'COOL.PUMP.WATER' AND r.code = 'ENG.BELT.AUX'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'COOL.THERMO.MAIN' AND r.code = 'COOL.PUMP.WATER'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'COOL.RAD.MAIN' AND r.code = 'INT.INTERCOOLER.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'ELE.ALT.MAIN' AND r.code = 'ENG.BELT.AUX'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;
INSERT INTO component_dependency (component_id, requires_id, step_order)
  SELECT c.id, r.id, 0 FROM component c, component r
  WHERE c.code = 'TRN.FLY.DMF' AND r.code = 'ELE.START.MAIN'
  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;

-- ---------- COMPONENTES POR VEHICULO ----------
-- Solo los EA288 2.0 TDI (1968 cc): el catalogo describe ese motor.
-- El 1.6 TDI (EA288 1598 cc), los TSI y el EA888 se quedan SIN componentes
-- a proposito: su despiece no esta descrito ni verificado.
INSERT INTO vehicle_component (vehicle_id, component_id, qty)
  SELECT v.id, c.id, 1
  FROM vehicle v
  JOIN engine e ON e.id = v.engine_id
  CROSS JOIN component c
  WHERE e.family = 'EA288' AND e.displacement_cc = 1968
    AND c.engine_id = (SELECT id FROM engine WHERE code = 'CRLB / DFGA')
  ON CONFLICT (vehicle_id, component_id) DO NOTHING;

-- ---------- 3D ----------
-- No se inserta ninguna fila en model_3d ni model_node.
-- Todavia no existe ningun GLB del EA288: registrarlo haria que la
-- plataforma afirmase tener un modelo que no tiene. Esas filas las crea
-- el admin al subir el GLB real a R2 y mapear sus nodos.

COMMIT;
