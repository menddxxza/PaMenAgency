# CLAUDE.md — Proyecto "Despiece"

Plataforma web de despiece 3D interactivo de vehículos.
Este archivo es el contexto completo del proyecto. Léelo entero antes de escribir código.

---

## 1. Qué es

**No** es un catálogo de coches ni una tienda de recambios.

El usuario busca su vehículo → lo abre en 3D → lo desmonta virtualmente →
selecciona cualquier componente → ve qué es, dónde está, qué referencia tiene
y qué hay que quitar para llegar hasta él.

El 3D es el núcleo del producto, no un adorno.

**Vehículo piloto:** SEAT León III (5F) 2.0 TDI 150 CV, motor EA288.
Elegido porque es VAG: el mismo motor se reutiliza en Golf VII, Octavia III,
A3 8V, Ateca, Tarraco… Un modelo 3D sirve para ~15 vehículos.

---

## 2. Estado actual

| Entregable | Estado | Archivo |
|---|---|---|
| Esquema Postgres completo | ✅ | `db/schema.sql` |
| Migraciones (búsqueda, vistas, RLS) | ✅ | `db/migrations/` |
| Seed del León 5F (generado) | ✅ | `db/seed.sql` ← `tools/gen_seed.py` |
| Comprobaciones de reglas sobre la BD | ✅ | `db/checks.sql` |
| Pipeline de modelado Blender | ✅ | `tools/blender_addon_vehicle3d.py` |
| Front completo (prototipo SPA) | ✅ | `prototype/app.html` |
| Buscador + ficha de vehículo en Next.js | ✅ | `app/page.tsx`, `app/vehiculo/[slug]/` |
| Explorador 3D (R3F, GLB desde R2) | ✅ | `components/viewer/Viewer3D.tsx` |
| Admin: subida a R2, lectura de nodos, mapeo | ✅ | `app/admin/` |
| RLS + service_role solo en admin | ✅ | `db/migrations/005_rls.sql` |
| Auth Supabase y planes | ❌ | — |
| Modelado 3D real del EA288 | ❌ | **bloqueante** |
| Datos de piezas (OEM, precios) | ❌ | bloqueado por licencia |

`prototype/app.html` es un **prototipo de una sola página** con los datos en
memoria. Sirve como especificación viva de la UI y de la lógica, y es la fuente
de la que `tools/gen_seed.py` genera el seed. No se extiende: lo que crece es
la app de Next.js.

Dos desviaciones respecto a este documento, conscientes:

1. El catálogo del prototipo tiene **27** componentes, no 26 (§10 dice 26).
   Se han migrado los 27 tal cual.
2. El esquema núcleo no tenía sitio para el **material** ni para las
   **herramientas** por componente, que el prototipo sí describe. Se añaden en
   `db/migrations/001`, en la capa conceptual. `procedure_tool` sigue siendo la
   lista de herramientas de un procedimiento concreto cuando existan.

No hay ninguna fila en `model_3d`: sin GLB del EA288, registrarlo sería afirmar
que existe un modelo que no existe. El explorador 3D dice exactamente eso.

---

## 3. Stack decidido

| Capa | Elección | Motivo |
|---|---|---|
| Frontend | Next.js (App Router) + React | — |
| 3D | Three.js + React Three Fiber + drei | — |
| Backend | API Routes / Server Actions de Next | evita un despliegue extra; separar solo si duele |
| BD | Postgres (Supabase) | — |
| Búsqueda | `pg_trgm` + `tsvector` en Postgres | sobra hasta ~500k vehículos; Meilisearch self-host después |
| Storage | Cloudflare R2 | 10 GB gratis y **egress €0** — crítico porque los GLB pesan |
| Auth | Supabase Auth + RLS | — |
| Hosting | Vercel free | — |

**Restricción dura: coste 0 €.** Nada de servicios de pago sin avisar antes.
Elasticsearch descartado por coste y complejidad. S3 descartado por egress.

---

## 4. Principio fundamental de arquitectura

Tres capas **completamente separadas**, unidas solo por IDs:

```
DATOS DEL VEHÍCULO    ← APIs / licencias externas
DATOS DE LAS PIEZAS   ← proveedores / licencias
REPRESENTACIÓN 3D     ← propiedad nuestra
```

Cadena de relación:

```
vehicle → model_3d → model_node → component → part → part_reference → price_quote
```

**`component` vs `part` — no confundir nunca:**

- `component` = pieza **conceptual** ("el turbo del EA288"). **A esto apunta el 3D.**
- `part` = pieza **comprable** con marca y referencia OEM concreta.

Esta separación es lo que permite cambiar de proveedor de datos sin tocar
un solo modelo 3D. Si se rompe, el proyecto no escala.

---

## 5. Reglas innegociables

1. **No inventar datos.** Si no hay referencia OEM, precio o procedimiento,
   mostrar literalmente `Información no disponible`. Nunca rellenar con
   valores plausibles.
2. **Todo dato de demo va marcado** como `DEMO DATA` en pantalla y con
   `origin = 'demo'` en la BD.
3. **Cero scraping.** `repair_procedure.origin` tiene un CHECK que solo admite
   `own`, `licensed` o `demo`. Nada de manuales de terceros ni modelos 3D de fabricantes.
4. **La IA nunca inventa** piezas, referencias, compatibilidades ni precios.
   Solo consulta datos estructurados existentes y dice cuándo algo no está confirmado.
5. **Diseño profesional.** Herramienta de ingeniería, no SaaS genérico.
   Sin gradientes, sin tarjetas decorativas, sin emojis como elementos de UI.
   Tipografía: Inter + JetBrains Mono para códigos.

---

## 6. Base de datos — puntos que hay que respetar

Fichero: `schema.sql`. Todo en Postgres 15+ con `pgcrypto`, `pg_trgm`, `unaccent`.

### PKs
UUID siempre. El slug legible (`seat-leon-5f-2-0-tdi-150-fr-2017`) es una
columna `UNIQUE`, **nunca** la clave primaria. Los slugs cambian, las FK no.

### Deduplicación de vehículos
`vehicle.canonical_key` = SHA-256 de **IDs normalizados**, nunca de texto libre:

```
hash(generation_id | body_style_id | engine_id | transmission_id | year | trim | market)
```

Función ya escrita: `make_canonical_key(...)`.

Toda cadena cruda que llegue de cualquier fuente se guarda en `vehicle_alias`,
así "SEAT Leon 2.0TDI", "Seat León 150cv" y "SEAT LEON 5F 2.0 TDI" colapsan
en la misma fila. Índice GIN trigram sobre `vehicle_alias.normalized`.

### Pipeline de importación
```
SOURCE → IMPORT → NORMALIZE → DEDUPE → VEHICLE MASTER
```
Trazabilidad obligatoria en `import_run` / `import_row`.
`import_run.license_note` es NOT NULL: hay que declarar bajo qué derecho se importa.

### Estados
`publish_status` = `draft | review | published | archived` en todas las entidades publicables.

---

## 7. Capa 3D — cómo se conecta con la BD

### Tablas
- `mesh_asset` — biblioteca de mallas **reutilizables**. El turbo del EA288 se
  modela una vez y se instancia en todos los vehículos que lo montan.
  **Es la única forma de llegar a cientos de vehículos.**
- `model_3d` — un GLB asociado a un vehículo.
- `model_node` — mapeo nodo glTF ↔ componente. **El vínculo central de la plataforma.**

### Reglas
- **No mapear por nombre de nodo.** Blender renombra (`turbo_01.001`).
  Se mapea por `node_uuid`, escrito en `extras` del glTF desde Blender.
  `node_path` es solo fallback.
- **Los vectores de despiece viven en `model_node`, no dentro del GLB.**
  Así se ajusta la animación sin reexportar 40 MB.
- Un componente puede tener N nodos (el escape son varias mallas) → relación N:1.

### Convención de nombres de objeto en Blender
```
SYS.SUBSYS.COMPONENT[.NNN]
ENG.TURBO.HOUSING.001
```
Regex: `^[A-Z]{2,5}\.[A-Z0-9]{2,12}\.[A-Z0-9_]{2,24}(\.\d{3})?$`

Sistemas válidos: `ENG COOL INT EXH FUEL TRN SUS STR BRK ELE BDY CAB HVA`

### Presupuestos de modelado
| Concepto | Límite |
|---|---|
| Pieza pequeña (<35 cm) | 3.000 tris |
| Pieza grande | 15.000 tris |
| Escena completa | 600.000 tris |
| Materiales por escena | 8 |
| Origen del objeto | centro geométrico, ±2 cm |
| Escala | 1 unidad = 1 metro |
| Eje | +Y arriba (glTF), +Z morro |

Un objeto = un componente. **Nunca hacer Join de mallas.**

### Pipeline de exportación
```
Blender → validar → asignar node_uuid → exportar GLB (Draco)
        → gltfpack -cc → subir a R2 → admin lee nodos → mapear a component_id
```

El addon `blender_addon_vehicle3d.py` hace validación, UUIDs, cálculo de
vectores de despiece y export con `export_extras=True`. Bloquea el export si
la validación falla.

---

## 8. Lo que ya está implementado en `app.html` (portar a Next.js)

Rutas por hash, a convertir en rutas de Next:

| Prototipo | Next.js |
|---|---|
| `#/` | `/` — buscador de vehículos **y** componentes |
| `#/v/{slug}` | `/vehiculo/[slug]` — ficha técnica |
| `#/v/{slug}/3d` | `/vehiculo/[slug]/3d` — explorador |
| `#/admin` | `/admin` — modelos, mapeo, catálogo |

### Funciona ya y hay que conservarlo
- Órbita/zoom/pinch con controles propios (sin OrbitControls).
  Al portar a R3F se puede usar `<OrbitControls>` de drei.
- Raycasting con umbral de 6 px para distinguir clic de arrastre.
- Despiece continuo por slider, lerp a 0.14, vectores radiales desde el
  centro del conjunto + overrides manuales para cubierta/culata/cárter.
- Aislar, filtro por sistema, atenuado del resto al 24 % de opacidad.
- Dependencias navegables en la ficha ("desmontar previamente" → clic → salta).
- **Parser de GLB escrito a mano** (`parseGLB`): lee el chunk JSON del
  contenedor binario sin GLTFLoader y extrae nodos con malla, rutas y
  `extras.node_uuid`. Conservar — es útil en el admin server-side.
- Auto-sugerencia de `component_id` parseando el nombre del nodo.
- Generador de `INSERT … ON CONFLICT DO UPDATE` para `model_node`.

### Tokens de diseño
```css
--bg:#0b0d10  --surface:#14171b  --surface-2:#1b1f24
--line:#262b31  --line-2:#333a42
--text:#e6e9ec --text-2:#98a1ab --text-3:#626b75
--accent:#f0662b
```
Tema claro definido bajo `[data-theme="light"]`.

---

## 9. Plan de trabajo

### Inmediato
1. Scaffold Next.js + Supabase, aplicar `schema.sql`
2. `seed.sql`: SEAT, León, gen 5F, EA288, 8 variantes, 7 sistemas, 26 componentes
3. Portar buscador y ficha de vehículo a rutas reales con queries a Postgres
4. Portar el viewer a R3F cargando GLB desde R2 con GLTFLoader
5. Admin: upload a R2 + lectura de nodos + escritura en `model_node`

### Después
6. Auth Supabase + RLS + modo Taller (recientes, favoritos, historial)
7. Capa `VIN_PROVIDER` abstracta (NHTSA vPIC es gratis pero solo mercado USA;
   para EU no hay API gratuita seria — dejar preparado, no implementar)
8. Comparador de piezas (requiere datos con licencia)
9. Planes free / pro / taller / empresa
10. IA sobre datos estructurados

### Bloqueantes reales
- **Modelado 3D.** Un motor despiezado = 60-100 h. Un vehículo completo = 300 h+.
  La biblioteca reutilizable (`mesh_asset`) baja el vehículo 2 a 20-30 h.
  Empezar por ENG solo, ~25 objetos.
- **Datos de piezas.** En Europa eso es TecDoc, licencia de 4-5 cifras.
  No hay equivalente gratuito. Mientras tanto: carga manual marcada como demo.

---

## 10. Catálogo de componentes del MVP

26 componentes del EA288, ya definidos en `app.html` (constante `C`) con
función, posición, material, dificultad 1-5, tiempo estimado, herramientas y
dependencias de desmontaje. Migrar tal cual a `seed.sql`.

```
ENG   BLOCK.MAIN  HEAD.MAIN  HEAD.COVER  SUMP.PAN  OIL.FILTER
      CRANK.PULLEY  BELT.AUX
INT   TURBO.HOUSING  TURBO.COMPRESSOR  TURBO.ACTUATOR  MANIFOLD.MAIN
      INTERCOOLER.MAIN  PIPE.CHARGE  COVER.MAIN  EGR.COOLER  EGR.VALVE
EXH   MANIFOLD.MAIN  DOWNPIPE.MAIN
FUEL  RAIL.MAIN  INJ.CYL  PUMP.HP
COOL  PUMP.WATER  THERMO.MAIN  RAD.MAIN
ELE   ALT.MAIN  START.MAIN
TRN   FLY.DMF
```

Todas las referencias OEM, equivalencias, proveedores y precios están vacías
a propósito. **No rellenarlas.**

---

## 11. Forma de trabajar

Antes de escribir grandes cantidades de código: analizar, detectar problemas
técnicos, proponer, y después implementar.

No construir landing pages que simulen que la plataforma existe.
No rellenar la app con datos falsos para aparentar que funciona.

Prioridad: **funcionalidad → calidad de datos → experiencia 3D → escalabilidad → diseño**.
