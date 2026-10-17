bl_info = {
    "name": "Vehicle3D Pipeline",
    "author": "PaMenAgency",
    "version": (0, 3, 0),
    "blender": (4, 0, 0),
    "location": "View3D > Sidebar > Vehicle3D",
    "description": "Valida convenciones, genera node_uuid estables y exporta GLB + manifest.json",
    "category": "Import-Export",
}

import bpy, json, re, uuid, os
from mathutils import Vector

# ============================================================
# CONVENCIONES — deben coincidir con schema.sql
# ============================================================
# Nombre de objeto:  SYS.SUBSYS.COMPONENT[.NNN]
#   ENG.TURBO.HOUSING.001
NAME_RE = re.compile(r'^[A-Z]{2,5}\.[A-Z0-9]{2,12}\.[A-Z0-9_]{2,24}(\.\d{3})?$')

TRI_BUDGET_SMALL = 3_000
TRI_BUDGET_LARGE = 15_000
TRI_BUDGET_SCENE = 600_000
MAT_BUDGET       = 8
LARGE_DIM_M      = 0.35      # > 35 cm cuenta como pieza grande

SYSTEMS = {
    "ENG": "Motor",        "COOL": "Refrigeración",  "INT": "Admisión",
    "EXH": "Escape",       "FUEL": "Combustible",    "TRN": "Transmisión",
    "SUS": "Suspensión",   "STR": "Dirección",       "BRK": "Frenos",
    "ELE": "Eléctrico",    "BDY": "Carrocería",      "CAB": "Interior",
    "HVA": "Climatización",
}

UUID_PROP = "node_uuid"


# ============================================================
# UTILIDADES
# ============================================================
def mesh_objects(ctx):
    return [o for o in ctx.scene.objects if o.type == 'MESH']


def tri_count(obj):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    me = obj.evaluated_get(depsgraph).to_mesh()
    n = sum(len(p.vertices) - 2 for p in me.polygons)
    obj.evaluated_get(depsgraph).to_mesh_clear()
    return n


def node_path(obj):
    parts, cur = [], obj
    while cur:
        parts.append(cur.name)
        cur = cur.parent
    return "/".join(reversed(parts))


def origin_offset(obj):
    """Distancia entre el origen del objeto y su centro geométrico (mundo)."""
    if not obj.data.vertices:
        return 0.0
    center = sum((obj.matrix_world @ v.co for v in obj.data.vertices), Vector()) / len(obj.data.vertices)
    return (center - obj.matrix_world.translation).length


# ============================================================
# VALIDADOR
# ============================================================
class V3D_OT_validate(bpy.types.Operator):
    bl_idname = "v3d.validate"
    bl_label = "Validar escena"
    bl_description = "Comprueba nombres, orígenes, escala, polígonos y materiales"

    def execute(self, context):
        errors, warns = [], []
        objs = mesh_objects(context)

        if not objs:
            self.report({'ERROR'}, "No hay mallas en la escena")
            return {'CANCELLED'}

        # Escala de escena
        if abs(context.scene.unit_settings.scale_length - 1.0) > 1e-6:
            errors.append("unit scale debe ser 1.0 (1 unidad = 1 m)")

        total_tris = 0
        seen_names = set()

        for o in objs:
            base = o.name.split('.')[0:3]
            if not NAME_RE.match(o.name):
                errors.append(f"[{o.name}] nombre no cumple SYS.SUBSYS.COMPONENT.NNN")
            elif base[0] not in SYSTEMS:
                errors.append(f"[{o.name}] sistema '{base[0]}' desconocido")

            if o.name in seen_names:
                errors.append(f"[{o.name}] nombre duplicado")
            seen_names.add(o.name)

            # Transform aplicado
            s = o.scale
            if any(abs(v - 1.0) > 1e-4 for v in s):
                errors.append(f"[{o.name}] escala sin aplicar {tuple(round(v,3) for v in s)}")

            # Origen en centro geométrico
            off = origin_offset(o)
            if off > 0.02:
                errors.append(f"[{o.name}] origen a {off*100:.1f} cm del centro geométrico")

            # Polígonos
            t = tri_count(o)
            total_tris += t
            dim = max(o.dimensions)
            budget = TRI_BUDGET_LARGE if dim > LARGE_DIM_M else TRI_BUDGET_SMALL
            if t > budget:
                warns.append(f"[{o.name}] {t} tris (presupuesto {budget})")

            # Modificadores no aplicados que disparan el conteo
            for m in o.modifiers:
                if m.type == 'SUBSURF' and m.render_levels > 2:
                    warns.append(f"[{o.name}] Subsurf nivel {m.render_levels}")

            if not o.data.materials:
                warns.append(f"[{o.name}] sin material")

        if total_tris > TRI_BUDGET_SCENE:
            errors.append(f"Escena {total_tris} tris (máx {TRI_BUDGET_SCENE})")

        mats = {m.name for o in objs for m in o.data.materials if m}
        if len(mats) > MAT_BUDGET:
            errors.append(f"{len(mats)} materiales (máx {MAT_BUDGET}): {sorted(mats)}")

        report = "\n".join(["❌ " + e for e in errors] + ["⚠ " + w for w in warns])
        print("\n=== VEHICLE3D VALIDATE ===\n" + (report or "OK") +
              f"\n--- {len(objs)} objetos · {total_tris} tris · {len(mats)} materiales")

        if errors:
            self.report({'ERROR'}, f"{len(errors)} errores, {len(warns)} avisos — ver consola")
            return {'CANCELLED'}
        self.report({'INFO'}, f"OK · {len(objs)} objetos · {total_tris} tris · {len(warns)} avisos")
        return {'FINISHED'}


# ============================================================
# NODE UUID — estable entre reexportaciones
# ============================================================
class V3D_OT_assign_uuids(bpy.types.Operator):
    bl_idname = "v3d.assign_uuids"
    bl_label = "Asignar node_uuid"
    bl_description = "Genera UUID en objetos que no lo tengan. Nunca sobrescribe."

    def execute(self, context):
        new = 0
        for o in mesh_objects(context):
            if not o.get(UUID_PROP):
                o[UUID_PROP] = str(uuid.uuid4())
                new += 1
        self.report({'INFO'}, f"{new} UUID nuevos asignados")
        return {'FINISHED'}


class V3D_OT_compute_explode(bpy.types.Operator):
    bl_idname = "v3d.compute_explode"
    bl_label = "Calcular vectores de despiece"
    bl_description = "Vector radial desde el centro del sistema. Punto de partida, se afina en el admin."

    factor: bpy.props.FloatProperty(name="Factor", default=1.6, min=1.0, max=5.0)

    def execute(self, context):
        objs = mesh_objects(context)
        groups = {}
        for o in objs:
            groups.setdefault(o.name.split('.')[0], []).append(o)

        for sysname, items in groups.items():
            center = sum((o.matrix_world.translation for o in items), Vector()) / len(items)
            for o in items:
                d = o.matrix_world.translation - center
                if d.length < 1e-4:
                    d = Vector((0, 1, 0))
                v = d.normalized() * d.length * (self.factor - 1.0)
                o["explode"] = [round(v.x, 4), round(v.z, 4), round(-v.y, 4)]  # Blender Z-up -> glTF Y-up
        self.report({'INFO'}, f"Vectores calculados para {len(groups)} sistemas")
        return {'FINISHED'}


# ============================================================
# EXPORT
# ============================================================
class V3D_OT_export(bpy.types.Operator):
    bl_idname = "v3d.export"
    bl_label = "Exportar GLB + manifest"
    bl_description = "Valida, exporta GLB y genera manifest.json para el admin"

    directory: bpy.props.StringProperty(subtype='DIR_PATH')
    model_code: bpy.props.StringProperty(name="Código de modelo",
                                         default="SEAT_5F_20TDI_2017_MAIN")

    def invoke(self, context, event):
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        if bpy.ops.v3d.validate() != {'FINISHED'}:
            self.report({'ERROR'}, "Validación fallida — no se exporta")
            return {'CANCELLED'}
        bpy.ops.v3d.assign_uuids()

        base = self.model_code.lower()
        glb_path = os.path.join(self.directory, base + ".glb")
        man_path = os.path.join(self.directory, base + ".manifest.json")

        nodes, total = [], 0
        for o in mesh_objects(context):
            sys_c, sub_c, comp_c = (o.name.split('.') + ['', '', ''])[:3]
            t = tri_count(o)
            total += t
            ex = list(o.get("explode", [0.0, 0.0, 0.0]))
            nodes.append({
                "node_uuid": o[UUID_PROP],
                "node_path": node_path(o),
                "object_name": o.name,
                "component_code": f"{sys_c}.{sub_c}.{comp_c}",
                "system_code": sys_c,
                "explode_x": ex[0], "explode_y": ex[1], "explode_z": ex[2],
                "explode_group": sys_c,
                "tri_count": t,
                "label_anchor": [round(v, 4) for v in o.matrix_world.translation],
            })

        bpy.ops.export_scene.gltf(
            filepath=glb_path,
            export_format='GLB',
            export_yup=True,
            export_apply=True,
            export_extras=True,          # <- propagar node_uuid y explode
            export_draco_mesh_compression_enable=True,
            export_draco_mesh_compression_level=6,
            export_cameras=False,
            export_lights=False,
            use_visible=False,
        )

        manifest = {
            "model_code": self.model_code,
            "schema_version": 1,
            "up_axis": "Y",
            "scale_unit": "m",
            "tri_count": total,
            "node_count": len(nodes),
            "glb_file": os.path.basename(glb_path),
            "nodes": nodes,
        }
        with open(man_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        size = os.path.getsize(glb_path) / 1e6
        self.report({'INFO'}, f"{len(nodes)} nodos · {total} tris · {size:.1f} MB")
        return {'FINISHED'}


# ============================================================
# UI
# ============================================================
class V3D_PT_panel(bpy.types.Panel):
    bl_label = "Vehicle3D Pipeline"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "Vehicle3D"

    def draw(self, context):
        c = self.layout.column(align=True)
        c.operator("v3d.validate", icon='CHECKMARK')
        c.separator()
        c.operator("v3d.assign_uuids", icon='COPY_ID')
        c.operator("v3d.compute_explode", icon='MOD_EXPLODE')
        c.separator()
        c.operator("v3d.export", icon='EXPORT')

        box = self.layout.box()
        box.label(text="Convención de nombres:")
        box.label(text="SYS.SUBSYS.COMPONENT.NNN")
        box.label(text="ej. ENG.TURBO.HOUSING.001")


CLASSES = (V3D_OT_validate, V3D_OT_assign_uuids, V3D_OT_compute_explode,
           V3D_OT_export, V3D_PT_panel)


def register():
    for c in CLASSES:
        bpy.utils.register_class(c)


def unregister():
    for c in reversed(CLASSES):
        bpy.utils.unregister_class(c)


if __name__ == "__main__":
    register()
