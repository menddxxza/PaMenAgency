# Despiece

Plataforma de despiece 3D interactivo de vehículos. El contexto completo del
proyecto (reglas, arquitectura, plan) está en [`CLAUDE.md`](./CLAUDE.md) —
leerlo antes de tocar código.

Vehículo piloto: SEAT León III (5F) 2.0 TDI, motor EA288.

## Qué hay en este directorio

| Ruta | Qué es |
|---|---|
| `db/schema.sql` | Esquema núcleo (Postgres 15+ / Supabase) |
| `db/migrations/` | Migraciones sobre el esquema núcleo, en orden |
| `db/seed.sql` | Catálogo del León 5F. **Generado**, todo `origin = 'demo'` |
| `db/checks.sql` | Comprobaciones de las reglas del proyecto sobre la BD |
| `db/apply.sh` | Aplica esquema + migraciones + seed |
| `tools/gen_seed.py` | Regenera `db/seed.sql` desde el prototipo |
| `tools/blender_addon_vehicle3d.py` | Addon de Blender: validación, `node_uuid`, export GLB |
| `prototype/app.html` | Prototipo SPA. **Especificación viva, no se extiende** |
| `app/`, `components/`, `lib/` | Aplicación Next.js (App Router) |

## Puesta en marcha

```bash
cp .env.example .env.local     # y rellenar
npm install

# Base de datos (Supabase o Postgres local)
./db/apply.sh "$DATABASE_URL"
psql "$DATABASE_URL" -f db/checks.sql

npm run dev
```

Sin `NEXT_PUBLIC_SUPABASE_URL` la aplicación arranca igual: cada ruta dice qué
falta en lugar de fingir datos.

### Variables

Están todas descritas en `.env.example`. Las mínimas para ver la plataforma
funcionando son las tres de Supabase. Las de R2 solo hacen falta para subir y
servir GLB; sin ellas el explorador 3D dice que no hay modelo, que es la verdad.

`SUPABASE_SERVICE_ROLE_KEY` salta RLS y solo se usa en `/admin`, en el
servidor. `ADMIN_TOKEN` es la puerta provisional de `/admin` hasta que exista
Supabase Auth: sin definirlo, `/admin` queda abierto en desarrollo y **cerrado
en producción**.

## Rutas

| Ruta | Qué hace |
|---|---|
| `/` | Buscador de vehículos **y** componentes (`search_vehicles`, `search_components`) |
| `/vehiculo/[slug]` | Ficha técnica + componentes por sistema + dependencias navegables |
| `/vehiculo/[slug]/3d` | Explorador: despiece continuo, aislar, filtro por sistema |
| `/admin` | Modelos 3D, vehículos y catálogo |
| `/admin/modelo/nuevo` | Subida de GLB a R2 y lectura de nodos |
| `/admin/modelo/[id]` | Mapeo nodo ↔ componente y vectores de despiece |

## Pipeline 3D

```
Blender (addon: valida convenciones, escribe extras.node_uuid)
  → export GLB con Draco y export_extras
  → gltfpack -cc
  → /admin/modelo/nuevo: sube a R2 con URL firmada
  → el servidor lee los nodos del GLB (lib/glb.ts, sin GLTFLoader)
  → crea una fila model_node por nodo con malla, sugiriendo componente
  → /admin/modelo/[id]: mapear y ajustar vectores
  → publicar
```

Dos cosas que no se negocian:

- **El mapeo es por `node_uuid`**, escrito en `extras` desde Blender. El nombre
  del nodo es solo fallback: Blender renombra al reexportar.
- **Los vectores de despiece viven en `model_node`**, no dentro del GLB. Se
  ajustan sin reexportar 40 MB.

## Datos

El seed se **genera** desde las constantes del prototipo:

```bash
python3 tools/gen_seed.py
```

Contiene 8 variantes del León 5F, 7 sistemas y 27 componentes del EA288, todo
con `origin = 'demo'` y marcado como DEMO DATA en pantalla. Referencias OEM,
equivalencias, proveedores y precios están **vacíos a propósito**: en Europa eso
es TecDoc y hace falta licencia. `db/checks.sql` falla si alguien los rellena
sin declarar fuente.

No se inserta ninguna fila en `model_3d`: todavía no existe ningún GLB del
EA288, y registrarlo haría que la plataforma afirmase tener un modelo que no
tiene.

## Migraciones

| Fichero | Por qué existe |
|---|---|
| `001_component_material_tools.sql` | El catálogo describe material y herramientas por componente; el esquema núcleo no tenía dónde guardarlos |
| `002_component_search.sql` | `component` no tenía búsqueda, y la de `vehicle` solo indexaba el código interno del motor (nadie busca "CRLB") |
| `003_views.sql` | `vehicle_full` y `component_full`: superficie de lectura del front, con `security_invoker` |
| `004_search.sql` | `search_vehicles`, `search_components`, `vehicle_components` |
| `005_rls.sql` | RLS en todas las tablas: anónimo ve solo lo `published`; escritura solo con `service_role` |

## Estado

Hecho: esquema aplicable y verificado, seed generado, buscador, ficha de
vehículo, explorador 3D, admin con subida a R2 y mapeo de nodos, RLS.

Pendiente (en orden): Supabase Auth + modo Taller · capa `VIN_PROVIDER`
abstracta · comparador de piezas (bloqueado por licencia) · planes · IA sobre
datos estructurados.

Bloqueante real: **el modelado 3D**. Un motor despiezado son 60-100 h. Empezar
por ENG, ~25 objetos, y apoyarse en `mesh_asset` para que el segundo vehículo
cueste 20-30 h y no 300.
