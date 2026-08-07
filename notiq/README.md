# Notiq

App de productividad personal con tres pilares: **notas por bloques**, **tareas** y un
**asistente** que tiene contexto de ambas cosas.

Next.js 15 (App Router) + TypeScript + Tailwind + Neon (Postgres) + Auth.js. La IA va
contra `gpt-4o-mini` a través de un cliente propio sobre `fetch`.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena al menos DATABASE_URL y AUTH_SECRET
psql "$DATABASE_URL" -f migrations/0001_neon.sql
npm run dev
```

Sin `DATABASE_URL` la app arranca igual: la landing y la página de precios funcionan,
y las rutas privadas enseñan un aviso de configuración en vez de reventar.

## Base de datos

Un único fichero, [`migrations/0001_neon.sql`](migrations/0001_neon.sql), aplicado con
`psql` (o cualquier cliente de Postgres) contra el `DATABASE_URL` de tu proyecto de
[Neon](https://neon.tech). Crea:

| Tabla | Para qué |
|---|---|
| `users` | Cuenta del usuario: contraseña (hash), plan e identificadores de Stripe. |
| `folders` | Carpetas de notas. |
| `notes` | Notas. `content` es el array de bloques; `busqueda` es un `tsvector` generado. |
| `tags` / `note_tags` | Etiquetas y su relación con las notas. |
| `tasks` | Tareas, con estado, prioridad, vencimiento y la nota de la que salieron. |
| `ai_usage` | Contador de operaciones de IA por usuario y mes. |

### Por qué Neon y no Supabase, y qué cambia

La primera versión de Notiq se construyó sobre Supabase (Postgres + Auth + RLS). Se
migró a Neon + Auth.js porque el entorno de desarrollo de este proyecto solo tiene
salida de red hacia servicios con un conector ya configurado, y Neon es el único
backend con base de datos disponible en esas condiciones — no por una preferencia
técnica sobre Supabase. Vale la pena saber qué se pierde al hacer ese cambio:

- **No hay RLS.** Supabase hace cumplir "cada usuario solo ve lo suyo" dentro de
  Postgres, con `auth.uid()` en cada política; ninguna consulta puede saltárselo
  aunque el código de la aplicación tenga un bug. Aquí no hay PostgREST que traduzca
  la sesión del usuario en una identidad de Postgres, así que **cada consulta filtra
  por `user_id` a mano**, en el código de la aplicación. Es el modelo estándar de
  cualquier app Next.js + Postgres fuera de Supabase, pero es una garantía menos: un
  `where user_id = ...` que se olvide en una sola consulta ya no lo frena la base de
  datos.
- **La sesión es JWT, no cookies + PostgREST.** El login usa
  [Auth.js](https://authjs.dev) con un provider de credenciales (email + contraseña,
  hash con bcrypt) y sesión JWT. El plan del usuario se lee de la base de datos en
  cada petición (`lib/sesion.ts`), no del propio JWT, para que un cambio de plan se
  note sin tener que volver a entrar.
- **Sin enlace mágico (login sin contraseña).** La versión de Supabase lo tenía; esta
  no manda correos de ningún tipo (no hay servicio de email configurado), así que solo
  hay login con contraseña. Añadir un provider de email a Auth.js es sencillo el día
  que haya un proveedor de correo transaccional de por medio.
- **La cuota de IA sigue siendo atómica en SQL.** La función `consumir_ia` incrementa
  y comprueba el límite en el mismo statement — eso no depende de RLS, sigue igual.

## Cómo está montado

```
app/
  page.tsx              landing + precios
  entrar/               login y registro (Auth.js, credenciales)
  auth/salir/           cierre de sesión
  api/auth/[...nextauth]/  handlers de Auth.js
  (app)/                todo lo que exige sesión
    notas/              lista, buscador y editor
    tareas/             lista, Kanban y calendario
    asistente/          chat con contexto
    ajustes/            plan y consumo
  api/ia/               resumen · tareas · chat
  api/stripe/           checkout · portal · webhook
components/             UI (los clientes llevan 'use client')
lib/
  db.ts                 conexión a Neon (postgres.js) + validación de UUIDs
  sesion.ts             sesión + plan del usuario actual
  bloques.ts            modelo de bloques y conversión a/desde markdown
  planes.ts             límites de cada plan — única fuente de verdad
  tareas.ts             orden por urgencia y etiquetas de vencimiento
  stripe.ts             mapeo de planes a precios de Stripe
  ia/                   cliente de OpenAI, prompts, cuota, preámbulo de las rutas
auth.config.ts          config de Auth.js segura para el runtime Edge (sin providers)
lib/auth.ts             config completa de Auth.js (providers, callbacks)
middleware.ts           protección de rutas privadas
migrations/0001_neon.sql  esquema completo
```

### El editor

Una nota se guarda como array de bloques en `notes.content` (jsonb), no como markdown.
El markdown es una proyección que se genera al vuelo (`aMarkdown`) para mandarlo a la
IA, copiarlo o exportarlo; `desdeMarkdown` hace el camino de vuelta al pegar.

Cada bloque es un `<textarea>` que se autoajusta, no un `contenteditable`: así el
autocompletado del móvil, el corrector, deshacer/rehacer y los lectores de pantalla
funcionan sin reimplementarlos. Los atajos (`# `, `- `, `[] `, `> `, ` ``` `) se aplican
al escribir; pegar markdown de varias líneas lo descompone en bloques.

El guardado es automático con 900 ms de debounce (serializado: nunca hay dos
peticiones de guardado en vuelo a la vez, para que una respuesta lenta no pise a una
más rápida), y `Ctrl/Cmd+S` fuerza el guardado ya. Navegar dentro de la app antes de
que venza el debounce fuerza igualmente un guardado al desmontar el editor.

### Autenticación

`auth.config.ts` (sin providers, apto para el runtime Edge) + `lib/auth.ts` (con el
provider de credenciales, que sí toca la base de datos) es el patrón que documenta
Auth.js para Next.js middleware con un provider que depende de la base de datos: el
provider de credenciales usa `postgres.js`, que abre sockets TCP — no soportado en
Edge. `middleware.ts` importa solo `auth.config.ts`, y además fuerza
`runtime: 'nodejs'` (estable desde Next.js 15.5): Auth.js usa `jose` para el JWT de
sesión, que a su vez usa `DecompressionStream`, tampoco disponible en Edge. Sin esto
el build avisa de una API no soportada; con esto, ese aviso desaparece porque el
middleware ya no corre ahí.

El registro (`app/entrar/actions.ts`) hashea la contraseña con bcrypt (coste 12) e
inserta directamente en `users` — no hay tablas de Auth.js de por medio, porque la
sesión es JWT y no hay provider de email que necesite guardar tokens de verificación.

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
de una nota larga ronda los 0,0002 $. Las 20 operaciones del plan gratuito cuestan
menos de un céntimo al mes por usuario.

**Servidor de IA en local.** `OPENAI_BASE_URL` apunta el cliente a cualquier servidor
compatible con la API de OpenAI (Ollama, LM Studio, llama.cpp, vLLM…) en vez de a
OpenAI de verdad — casi todos exponen `/v1/chat/completions` con el mismo formato.
`OPENAI_MODEL` pasa a ser el nombre del modelo que sirva ese servidor, y
`OPENAI_API_KEY` puede ser cualquier texto no vacío si el servidor no valida claves.
Ver `.env.example` para los puertos por defecto de Ollama y LM Studio. Con esto no
hay coste por token, pero conviene saber que `response_format: json_object` (lo que
usa la extracción de tareas) no lo soportan todos los modelos/servidores locales por
igual — si falla ahí mientras el resumen normal funciona, es la explicación más
probable.

### Stripe

Tres rutas en `app/api/stripe/`:

| Ruta | Qué hace |
|---|---|
| `checkout` | Abre Stripe Checkout en modo suscripción y devuelve la URL. |
| `portal` | Abre el portal de facturación (tarjeta, facturas, cancelar). |
| `webhook` | **Lo único que escribe `users.plan`.** |

La regla que sostiene todo esto: **ninguna ruta que hable con el usuario cambia el
plan**. `checkout` solo abre el pago; si lo marcara como contratado, bastaría con
abrir el checkout y cerrarlo para tener Pro gratis. El plan lo escribe el webhook
cuando Stripe confirma el cobro. Sin RLS de por medio, esto ya no lo hace cumplir
Postgres (como el trigger `proteger_plan` de la versión con Supabase) — es una
disciplina del código: ninguna otra ruta debe tocar `users.plan` nunca.

Otras decisiones:

- **El plan se resuelve por price ID**, no por el nombre del producto ni por metadata.
  El nombre se puede editar desde el dashboard de Stripe, y entonces alguien que paga
  se quedaría en Free sin que nadie se entere.
- **`past_due` mantiene el plan.** El cobro ha fallado pero Stripe reintenta durante
  días; cortarle el acceso a alguien que probablemente solo tiene la tarjeta caducada
  es peor negocio que regalarle una semana. Cuando Stripe se rinde manda
  `customer.subscription.deleted` y ahí sí baja a Free.
- **Un precio desconocido no baja a nadie a Free.** Casi siempre significa que
  `STRIPE_PRICE_*` está mal configurado, así que se deja el plan como está y se avisa
  en los logs.
- **Los errores devuelven 500, no 200.** Stripe reintenta con backoff durante 3 días;
  tragarse el error deja al usuario pagando en el plan Free sin forma de recuperarlo.
- **El customer se guarda al crearlo**, no al llegar el webhook: si el usuario abre el
  checkout y lo cierra no llega ningún webhook, y el siguiente intento crearía otro
  customer, partiendo su historial de facturas.
- **Cambiar de un plan de pago a otro no abre un checkout nuevo.** Si ya hay una
  suscripción activa, `checkout/route.ts` actualiza su precio con prorrateo
  (`stripe.subscriptions.update`) en vez de crear una segunda. Un checkout nuevo no
  cancela la suscripción vieja — Stripe no las fusiona solo por compartir customer —
  así que sin esto, pasar de Pro a Team dejaba las dos activas cobrando a la vez.
- **El webhook descarta eventos más viejos que el último aplicado.**
  `users.stripe_evento_en` guarda el `evento.created` del último webhook que ha
  tocado el plan. Stripe no garantiza el orden de entrega y reintenta los fallos
  hasta 3 días: sin este control, un `subscription.updated` reintentado con éxito
  después de un `subscription.deleted` más reciente podría resucitar un plan que ya
  se había cancelado de verdad.

#### Productos dados de alta

Ya existen en la cuenta, **en modo live**:

| Plan | Producto | Price ID | Importe |
|---|---|---|---|
| Pro | `prod_V1A97pXWHwFH3G` | `price_1U17pMA0ZutwmmcPlc4qgLvE` | 9 €/mes |
| Team | `prod_V1A9QwrBcGPWwT` | `price_1U17pWA0ZutwmmcPAth6dFrK` | 19 €/mes |

Los price IDs no son secretos (viajan al navegador en el checkout), por eso están
aquí; las claves sí, y van solo en el entorno.

Ojo con la pareja clave/precio: estos IDs solo valen con una `sk_live_…`. Para
desarrollar hay que crear los mismos productos en modo test y usar sus IDs, porque un
price de live con una clave de test devuelve «No such price».

#### Probar en local

Hace falta el CLI de Stripe, porque el webhook necesita una firma válida:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copia el whsec_… que imprime a STRIPE_WEBHOOK_SECRET y reinicia `npm run dev`
stripe trigger checkout.session.completed
```

En producción hay que dar de alta el endpoint en Stripe (Developers → Webhooks) con
los eventos `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated` y `customer.subscription.deleted`.

## Planes

Los límites viven en `lib/planes.ts` y son la única fuente de verdad: los aplica el
servidor y los pinta la página de precios.

| Plan | Precio | Notas | IA/mes | Colaboración |
|---|---|---|---|---|
| Free | 0 € | 50 | 20 | — |
| Pro | 9 €/mes | Ilimitadas | 500 | — |
| Team | 19 €/usuario | Ilimitadas | 2.000 | Sí |

## Verificación pendiente

Todo el código de este README pasa `tsc --noEmit` y `npm run build` sin errores, pero
**no se ha probado contra una base de datos de Neon real ni contra el navegador**: el
entorno donde se escribió no tiene salida de red hacia Neon (ver el porqué más arriba).
Antes de darlo por bueno hace falta, en un entorno con acceso normal a internet:

1. Aplicar `migrations/0001_neon.sql` contra un Neon real y confirmar que no da
   errores.
2. Registrar una cuenta, cerrar sesión y volver a entrar.
3. Crear una nota, escribir, comprobar que el indicador pasa por
   "Sin guardar" → "Guardando…" → "Guardado", y que sigue ahí tras recargar.
4. Crear una carpeta y filtrar notas por ella.
5. Buscar notas por texto (`websearch_to_tsquery`, admite `"frase exacta"` y
   `-excluir`).
6. Crear tareas, cambiar su estado y prioridad en las tres vistas (lista, Kanban,
   calendario).
7. Con `OPENAI_API_KEY` configurada: resumir una nota, extraer tareas de una nota, y
   preguntar algo al asistente.
8. Con Stripe en modo test (`stripe listen`): contratar Pro, cambiar a Team (comprobar
   en el dashboard de Stripe que la suscripción vieja se actualiza en vez de
   duplicarse), y cancelar desde el portal.
9. Que un segundo usuario registrado no vea ni pueda tocar los datos del primero
   (crear dos cuentas y comprobarlo a mano) — es el punto que más ha cambiado al no
   haber RLS, y el que más conviene probar con cuidado.

## Qué falta

Esto cubre las semanas 1-4 y 7-8 del [roadmap](ROADMAP.md), más la migración de
Supabase a Neon. Todavía no está hecho:

- **Verificación real**, la lista de arriba.
- **Team no cobra por asiento.** Se cobra `quantity: 1` aunque el plan se anuncia como
  19 €/usuario. Falta contar los miembros del espacio, que tampoco existen todavía.
- **App móvil (Expo).** `lib/` está escrito sin dependencias de Next para poder
  compartirlo, pero no hay proyecto de React Native.
- **Recordatorios.** El esquema ya tiene `recordar_el` y su índice parcial; falta el
  cron que los envía.
- **Imágenes en las notas.** El tipo de bloque existe; falta dónde subirlas (Neon no
  tiene un Storage propio; haría falta S3, R2 o similar).
- **Colaboración en tiempo real** del plan Team.
- **Enlace mágico (login sin contraseña).** Se quitó al migrar a Neon por no tener
  servicio de email configurado.
