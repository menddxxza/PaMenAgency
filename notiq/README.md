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

`0002_stripe.sql` añade `profiles.subscription_status` y vuelve a crear el trigger
para que también lo proteja. `0003_orden_webhook.sql` añade
`profiles.stripe_evento_en` (también protegido) para descartar webhooks
desordenados — ver más abajo.

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

### Stripe

Tres rutas en `app/api/stripe/`:

| Ruta | Qué hace |
|---|---|
| `checkout` | Abre Stripe Checkout en modo suscripción y devuelve la URL. |
| `portal` | Abre el portal de facturación (tarjeta, facturas, cancelar). |
| `webhook` | **Lo único que escribe `profiles.plan`.** |

La regla que sostiene todo esto: **ninguna ruta que hable con el usuario cambia el
plan**. `checkout` solo abre el pago; si lo marcara como contratado, bastaría con
abrir el checkout y cerrarlo para tener Pro gratis. El plan lo escribe el webhook
cuando Stripe confirma el cobro, con la service role key, que es la única que se salta
el trigger `proteger_plan`.

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
  `profiles.stripe_evento_en` guarda el `evento.created` del último webhook que ha
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

## Qué falta

Esto cubre las semanas 1-4 y 7-8 del [roadmap](ROADMAP.md). Todavía no está hecho:

- **Las claves de Stripe en el entorno.** Los productos ya existen (tabla de arriba),
  pero faltan `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y el alta del endpoint del
  webhook en el dashboard.
- **Team no cobra por asiento.** Se cobra `quantity: 1` aunque el plan se anuncia como
  19 €/usuario. Falta contar los miembros del espacio, que tampoco existen todavía.
- **App móvil (Expo).** `lib/` está escrito sin dependencias de Next para poder
  compartirlo, pero no hay proyecto de React Native.
- **Recordatorios.** El esquema ya tiene `recordar_el` y su índice parcial; falta el
  cron que los envía.
- **Imágenes en las notas.** El tipo de bloque existe; falta la subida a Storage.
- **Colaboración en tiempo real** del plan Team.
