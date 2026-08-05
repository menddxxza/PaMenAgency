# Notiq

App de productividad personal con tres pilares: **notas por bloques**, **tareas** y un
**asistente** que tiene contexto de ambas cosas.

Next.js 15 (App Router) + TypeScript + Tailwind + Supabase. La IA va contra
`gpt-4o-mini` a través de un cliente propio sobre `fetch`.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena al menos las dos variables de Supabase
npm run dev
```

Sin credenciales de Supabase la app arranca igual: la landing y la página de precios
funcionan, y las rutas privadas enseñan un aviso de configuración en vez de reventar.

## Base de datos

Ejecuta [`supabase/migrations/0001_notiq.sql`](supabase/migrations/0001_notiq.sql) en el
SQL Editor de Supabase (o `supabase db push` con la CLI). Crea:

| Tabla | Para qué |
|---|---|
| `profiles` | Plan del usuario e identificadores de Stripe. Se crea sola al registrarse. |
| `folders` | Carpetas de notas. |
| `notes` | Notas. `content` es el array de bloques; `busqueda` es un `tsvector` generado. |
| `tags` / `note_tags` | Etiquetas y su relación con las notas. |
| `tasks` | Tareas, con estado, prioridad, vencimiento y la nota de la que salieron. |
| `ai_usage` | Contador de operaciones de IA por usuario y mes. |

Todas tienen RLS activo: cada usuario solo ve lo suyo. Dos detalles que importan:

- **El plan no lo puede cambiar el usuario.** Un trigger (`proteger_plan`) revierte
  cualquier intento de tocar `plan` o los campos de Stripe desde una sesión normal.
  Solo la service role key —es decir, el webhook de Stripe— puede escribirlos.
- **La cuota de IA se cuenta en SQL.** La función `consumir_ia` incrementa y comprueba
  el límite en el mismo statement. Contar en JS y escribir después deja una ventana en
  la que dos peticiones simultáneas pasan las dos por el último hueco de la cuota.

## Cómo está montado

```
app/
  page.tsx              landing + precios
  entrar/               acceso (contraseña o magic link)
  auth/                 callback PKCE y cierre de sesión
  (app)/                todo lo que exige sesión
    notas/              lista, buscador y editor
    tareas/             lista, Kanban y calendario
    asistente/          chat con contexto
    ajustes/            plan y consumo
  api/ia/               resumen · tareas · chat
components/             UI (los clientes llevan 'use client')
lib/
  bloques.ts            modelo de bloques y conversión a/desde markdown
  planes.ts             límites de cada plan — única fuente de verdad
  tareas.ts             orden por urgencia y etiquetas de vencimiento
  ia/                   cliente de OpenAI, prompts, cuota, preámbulo de las rutas
  supabase/             clientes de navegador y servidor
middleware.ts           refresco de sesión y protección de rutas
```

### El editor

Una nota se guarda como array de bloques en `notes.content` (jsonb), no como markdown.
El markdown es una proyección que se genera al vuelo (`aMarkdown`) para mandarlo a la
IA, copiarlo o exportarlo; `desdeMarkdown` hace el camino de vuelta al pegar.

Cada bloque es un `<textarea>` que se autoajusta, no un `contenteditable`: así el
autocompletado del móvil, el corrector, deshacer/rehacer y los lectores de pantalla
funcionan sin reimplementarlos. Los atajos (`# `, `- `, `[] `, `> `, ` ``` `) se aplican
al escribir; pegar markdown de varias líneas lo descompone en bloques.

El guardado es automático con 900 ms de debounce, y `Ctrl/Cmd+S` fuerza el guardado ya.

### La IA

Las tres rutas de `app/api/ia/` comparten el preámbulo de `lib/ia/handler.ts`: sesión,
IA configurada y cuota del plan. Un par de decisiones a la vista:

- **La cuota se consume antes de llamar al proveedor.** Si la llamada falla luego, el
  usuario pierde una operación. Es el lado por el que conviene equivocarse: al revés,
  un fallo a mitad de respuesta dejaría una llamada pagada sin contabilizar.
- **El contenido del usuario nunca va dentro del `system`.** Una nota puede llevar
  texto pegado de un correo o de una web; si eso acaba en las instrucciones se
  convierte en una vía para reescribirlas. Va en el mensaje de usuario, envuelto en
  etiquetas, y los prompts dicen explícitamente que es contenido y no órdenes.
- **La recuperación de contexto del chat es full-text, no vectorial.** Con el volumen
  de una cuenta personal `websearch_to_tsquery` acierta lo suficiente y evita mantener
  embeddings al día en cada tecla del editor. Si la búsqueda no devuelve nada (una
  pregunta genérica tipo «resume mi semana»), cae a las notas recientes.

Coste aproximado con `gpt-4o-mini` (0,15 $ por millón de tokens de entrada): un resumen
de una nota larga ronda los 0,0002 $. Las 20 operaciones del plano gratuito cuestan
menos de un céntimo al mes por usuario.

## Planes

Los límites viven en `lib/planes.ts` y son la única fuente de verdad: los aplica el
servidor y los pinta la página de precios.

| Plan | Precio | Notas | IA/mes | Colaboración |
|---|---|---|---|---|
| Free | 0 € | 50 | 20 | — |
| Pro | 9 €/mes | Ilimitadas | 500 | — |
| Team | 19 €/usuario | Ilimitadas | 2.000 | Sí |

## Qué falta

Esto cubre las semanas 1-4 del [roadmap](ROADMAP.md). Todavía no está hecho:

- **Stripe.** Los límites se aplican, pero no hay checkout ni portal ni webhook: el
  plan se cambia a mano en `profiles.plan`.
- **App móvil (Expo).** `lib/` está escrito sin dependencias de Next para poder
  compartirlo, pero no hay proyecto de React Native.
- **Recordatorios.** El esquema ya tiene `recordar_el` y su índice parcial; falta el
  cron que los envía.
- **Imágenes en las notas.** El tipo de bloque existe; falta la subida a Storage.
- **Colaboración en tiempo real** del plan Team.
