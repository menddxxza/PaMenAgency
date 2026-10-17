#!/usr/bin/env python3
"""Genera db/seed.sql a partir de las constantes del prototipo.

El prototipo `prototype/app.html` es la especificación viva del catálogo
(constantes DB, SYSTEMS y C). Este script lo lee y emite SQL idempotente,
para que el seed nunca se transcriba a mano y no se desvíe del prototipo.

    python3 tools/gen_seed.py          # escribe db/seed.sql

Todo lo que emite va marcado con origin = 'demo': nada de esto está
verificado contra documentación oficial ni licenciada.
"""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROTO = ROOT / "prototype" / "app.html"
OUT = ROOT / "db" / "seed.sql"

# Motor piloto del catálogo de componentes.
PILOT_ENGINE_ID = "en-ea288-150"


# ------------------------------------------------------------------
# Lectura de las constantes del prototipo
# ------------------------------------------------------------------
def js_literal(src: str, decl: str, closer: str):
    """Extrae una constante JS del prototipo y la convierte a objeto Python."""
    i = re.search(re.escape(decl), src).start() + len(decl)
    j = src.index("\n" + closer, i)
    body = src[i : j + 2]
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    body = re.sub(r"([{,\[\s])([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', body)
    body = re.sub(r"'([^']*)'", lambda m: json.dumps(m.group(1)), body)
    body = re.sub(r",(\s*[}\]])", r"\1", body)
    return json.loads(body)


def load():
    src = PROTO.read_text()
    db = js_literal(src, "const DB = ", "}")
    systems = js_literal(src, "const SYSTEMS=", "]")
    components = js_literal(src, "const C=", "]")
    return db, systems, components


# ------------------------------------------------------------------
# Utilidades SQL
# ------------------------------------------------------------------
def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", s).strip().lower()


def q(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def build() -> str:
    db, systems, components = load()
    out: list[str] = []
    w = out.append

    w(
        """-- ============================================================
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
"""
    )

    w("-- ---------- SISTEMAS ----------")
    for i, s in enumerate(systems):
        w(
            f"INSERT INTO system (code, name, sort) VALUES ({q(s['code'])}, {q(s['name'])}, {i})\n"
            "  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;"
        )
    w("")

    # Los subsistemas se derivan del codigo del componente (SYS.SUBSYS.COMPONENT),
    # que es la misma convencion que valida el addon de Blender.
    subs: dict[tuple[str, str], str] = {}
    for c in components:
        sys_code, sub_code = c["code"].split(".")[:2]
        subs.setdefault((sys_code, sub_code), c["sub"])

    w("-- ---------- SUBSISTEMAS (derivados de SYS.SUBSYS.COMPONENT) ----------")
    for i, ((sys_code, sub_code), name) in enumerate(subs.items()):
        w(
            "INSERT INTO subsystem (system_id, code, name, sort)\n"
            f"  SELECT id, {q(sub_code)}, {q(name)}, {i} FROM system WHERE code = {q(sys_code)}\n"
            "  ON CONFLICT (system_id, code) DO UPDATE SET name = EXCLUDED.name;"
        )
    w("")

    w("-- ---------- MARCA / MODELO / GENERACION ----------")
    for m in db["manufacturer"]:
        w(
            'INSERT INTO manufacturer (slug, name, country, "group", status)\n'
            f"  VALUES ({q(m['slug'])}, {q(m['name'])}, {q(m['country'])}, {q(m['group'])}, 'published')\n"
            "  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;"
        )
    for m in db["model"]:
        mf = next(x for x in db["manufacturer"] if x["id"] == m["manufacturer_id"])
        w(
            "INSERT INTO model (manufacturer_id, slug, name, status)\n"
            f"  SELECT id, {q(m['slug'])}, {q(m['name'])}, 'published' FROM manufacturer WHERE slug = {q(mf['slug'])}\n"
            "  ON CONFLICT (manufacturer_id, slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;"
        )
    for g in db["generation"]:
        m = next(x for x in db["model"] if x["id"] == g["model_id"])
        w(
            "INSERT INTO generation (model_id, slug, name, platform, year_start, year_end)\n"
            f"  SELECT id, {q(g['slug'])}, {q(g['name'])}, {q(g['platform'])}, {g['year_start']}, {g['year_end']}\n"
            f"  FROM model WHERE slug = {q(m['slug'])}\n"
            "  ON CONFLICT (model_id, slug) DO UPDATE SET name = EXCLUDED.name, platform = EXCLUDED.platform;"
        )
    w("")

    w("-- ---------- CARROCERIAS ----------")
    for b in db["body_style"]:
        w(
            f"INSERT INTO body_style (slug, name, doors) VALUES ({q(b['slug'])}, {q(b['name'])}, {b['doors']})\n"
            "  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, doors = EXCLUDED.doors;"
        )
    w("")

    w("-- ---------- MOTORES (entidad de primer nivel: reutilizados en todo el grupo) ----------")
    for e in db["engine"]:
        w(
            "INSERT INTO engine (code, family, displacement_cc, cylinders, fuel, aspiration,\n"
            "    power_kw, torque_nm, emission_std, notes)\n"
            f"  VALUES ({q(e['code'])}, {q(e['family'])}, {e['cc']}, {e['cyl']}, {q(e['fuel'])}, {q(e['asp'])},\n"
            f"    {e['kw']}, {e['nm']}, {q(e['euro'])}, 'DEMO DATA - sin verificar')\n"
            "  ON CONFLICT (code) DO UPDATE SET family = EXCLUDED.family,\n"
            "    power_kw = EXCLUDED.power_kw, torque_nm = EXCLUDED.torque_nm;"
        )
    w("")

    w("-- ---------- CAMBIOS ----------")
    for t in db["transmission"]:
        w(
            f"INSERT INTO transmission (code, type, gears, name) VALUES ({q(t['code'])}, {q(t['type'])}, {t['gears']}, {q(t['name'])})\n"
            "  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;"
        )
    w("")

    w("-- ---------- VEHICULOS ----------")
    w("-- canonical_key se calcula con make_canonical_key() sobre IDs, nunca sobre texto libre.")
    gen = db["generation"][0]
    for v in db["vehicle"]:
        body = next(x for x in db["body_style"] if x["id"] == v["body"])
        eng = next(x for x in db["engine"] if x["id"] == v["engine"])
        tr = next(x for x in db["transmission"] if x["id"] == v["trans"])
        w(
            "INSERT INTO vehicle (slug, generation_id, body_style_id, engine_id, transmission_id, trim,\n"
            "    year_start, year_end, drivetrain, market, length_mm, width_mm, height_mm, wheelbase_mm,\n"
            "    kerb_weight_kg, tank_l, canonical_key, status, origin)\n"
            f"  SELECT {q(v['slug'])}, g.id, b.id, e.id, t.id, {q(v['trim'])},\n"
            f"    {v['y0']}, {v['y1']}, {q(v['dt'])}, 'EU', {v['L']}, {v['W']}, {v['H']}, {v['WB']},\n"
            f"    {v['kg']}, {v['tank']},\n"
            f"    make_canonical_key(g.id, b.id, e.id, t.id, {v['y0']}::smallint, {q(v['trim'])}, 'EU'),\n"
            "    'published', 'demo'\n"
            "  FROM generation g, body_style b, engine e, transmission t\n"
            f"  WHERE g.slug = {q(gen['slug'])} AND b.slug = {q(body['slug'])}\n"
            f"    AND e.code = {q(eng['code'])} AND t.code = {q(tr['code'])}\n"
            "  ON CONFLICT (canonical_key) DO UPDATE SET slug = EXCLUDED.slug,\n"
            "    status = EXCLUDED.status, origin = EXCLUDED.origin;"
        )
    w("")

    w("-- ---------- ALIAS DE VEHICULO (colapso de cadenas crudas en el dedupe) ----------")
    aliases = [
        ("seat-leon-5f-2-0-tdi-150-fr-2017", ["SEAT Leon 2.0 TDI 150 FR", "Seat Leon 5F 2.0TDI 150cv FR DSG"]),
        ("seat-leon-5f-2-0-tdi-184-fr-2016", ["SEAT LEON 5F 2.0 TDI 184"]),
    ]
    for slug, raws in aliases:
        for raw in raws:
            w(
                "INSERT INTO vehicle_alias (vehicle_id, raw_string, normalized, source, confidence)\n"
                f"  SELECT id, {q(raw)}, {q(normalize(raw))}, 'manual', 1.0 FROM vehicle WHERE slug = {q(slug)}\n"
                "  ON CONFLICT (normalized, source) DO NOTHING;"
            )
    w("")

    tools: list[str] = []
    for c in components:
        for t in c["tools"]:
            if t not in tools:
                tools.append(t)
    w("-- ---------- HERRAMIENTAS ----------")
    for t in tools:
        w(
            f"INSERT INTO tool (slug, name) VALUES ({q(slugify(t))}, {q(t)})\n"
            "  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;"
        )
    w("")

    pilot = next(e for e in db["engine"] if e["id"] == PILOT_ENGINE_ID)
    w(f"-- ---------- COMPONENTES ({len(components)}) ----------")
    w("-- Capa CONCEPTUAL: a esto apunta el 3D (model_node.component_id).")
    w(f"-- engine_id apunta al motor piloto del catalogo ({pilot['code']}, {pilot['family']}).")
    for c in components:
        sys_code, sub_code = c["code"].split(".")[:2]
        w(
            "INSERT INTO component (subsystem_id, code, name, description, position_note, material,\n"
            "    engine_id, difficulty, est_time_min, status, origin)\n"
            f"  SELECT sub.id, {q(c['code'])}, {q(c['name'])}, {q(c['fn'])}, {q(c['pos'])}, {q(c['mat'])},\n"
            f"    e.id, {c['diff']}, {c['time']}, 'published', 'demo'\n"
            "  FROM subsystem sub JOIN system s ON s.id = sub.system_id, engine e\n"
            f"  WHERE s.code = {q(sys_code)} AND sub.code = {q(sub_code)} AND e.code = {q(pilot['code'])}\n"
            "  ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,\n"
            "    position_note = EXCLUDED.position_note, material = EXCLUDED.material,\n"
            "    difficulty = EXCLUDED.difficulty, est_time_min = EXCLUDED.est_time_min,\n"
            "    status = EXCLUDED.status, origin = EXCLUDED.origin;"
        )
    w("")

    w("-- ---------- HERRAMIENTAS POR COMPONENTE ----------")
    for c in components:
        for t in c["tools"]:
            w(
                "INSERT INTO component_tool (component_id, tool_id)\n"
                f"  SELECT c.id, t.id FROM component c, tool t WHERE c.code = {q(c['code'])} AND t.slug = {q(slugify(t))}\n"
                "  ON CONFLICT DO NOTHING;"
            )
    w("")

    w("-- ---------- DEPENDENCIAS DE DESMONTAJE ----------")
    for c in components:
        for i, dep in enumerate(c["deps"]):
            w(
                "INSERT INTO component_dependency (component_id, requires_id, step_order)\n"
                f"  SELECT c.id, r.id, {i} FROM component c, component r\n"
                f"  WHERE c.code = {q(c['code'])} AND r.code = {q(dep)}\n"
                "  ON CONFLICT (component_id, requires_id) DO UPDATE SET step_order = EXCLUDED.step_order;"
            )
    w("")

    w("-- ---------- COMPONENTES POR VEHICULO ----------")
    w("-- Solo los EA288 2.0 TDI (1968 cc): el catalogo describe ese motor.")
    w("-- El 1.6 TDI (EA288 1598 cc), los TSI y el EA888 se quedan SIN componentes")
    w("-- a proposito: su despiece no esta descrito ni verificado.")
    w(
        "INSERT INTO vehicle_component (vehicle_id, component_id, qty)\n"
        "  SELECT v.id, c.id, 1\n"
        "  FROM vehicle v\n"
        "  JOIN engine e ON e.id = v.engine_id\n"
        "  CROSS JOIN component c\n"
        f"  WHERE e.family = 'EA288' AND e.displacement_cc = 1968\n"
        f"    AND c.engine_id = (SELECT id FROM engine WHERE code = {q(pilot['code'])})\n"
        "  ON CONFLICT (vehicle_id, component_id) DO NOTHING;"
    )
    w("")

    w(
        """-- ---------- 3D ----------
-- No se inserta ninguna fila en model_3d ni model_node.
-- Todavia no existe ningun GLB del EA288: registrarlo haria que la
-- plataforma afirmase tener un modelo que no tiene. Esas filas las crea
-- el admin al subir el GLB real a R2 y mapear sus nodos.

COMMIT;"""
    )
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    OUT.write_text(build())
    print(f"escrito {OUT.relative_to(ROOT)}")
