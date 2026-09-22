# Atiende — documento de contexto (para retomar el trabajo)

Pega este documento en una sesión nueva de Claude Code en VS Code para que tenga
contexto completo sin tener que rebuscar en el historial. Refleja el estado real
del código a fecha de **21 de septiembre de 2026**, verificado directamente
contra el repositorio y contra el Supabase de producción, no de memoria.

---

## 0. Cómo continuar, en 3 pasos

```
git fetch origin
git checkout claude/atiende-product-strategy-by70jv
git pull origin claude/atiende-product-strategy-by70jv
```

- **Repositorio:** `menddxxza/menddxxza` en GitHub (el nombre visible del repo
  puede aparecer como "PaMenAgency" en algunos sitios — es el mismo repo, solo
  renombrado; el remoto de git sigue siendo `menddxxza/menddxxza`).
- **Rama de trabajo:** `claude/atiende-product-strategy-by70jv`. Todo el
  desarrollo de Atiende va aquí. **No tocar otras ramas** — este mismo
  repositorio tiene decenas de ramas de otros proyectos tuyos sin relación
  (`notiq`, `iapyme`, `pamenagency-website`, `nexora-ai-growth-platform`,
  `silbato-cero`, etc.). Si algo de eso aparece en notificaciones de Vercel
  fallando en la Pull Request, es ruido — ignóralo, no es de Atiende.
- **Pull Request:** #1, en modo borrador, apunta a esta misma rama. Netlify
  despliega automáticamente en cada push tanto la vista previa de la PR como
  (si la rama coincide con la configurada) la producción en `atiendeapp.es`.
- **Antes de dar nada por terminado:** `npx tsc --noEmit`, `npx tsc --noEmit -p
  tsconfig.sw.json`, `npx eslint .` y `npm run build`.

---

## 1. Qué es Atiende

SaaS multi-negocio de gestión de citas con bot de WhatsApp por IA, para
negocios de servicios en España (clínicas, peluquerías/salones, talleres). Un
bot responde preguntas frecuentes y agenda citas solo; el dueño lo controla
todo desde un panel (agenda, clientes, conversaciones, facturación,
inventario, estadísticas). Producto de **PaMen Agency** (pamenagency.com),
operado por Pablo Ángel.

**Stack:** React + Vite + TypeScript en el frontend, desplegado en Netlify.
Supabase (Postgres con RLS, Auth, Storage, Realtime, Edge Functions en Deno)
como backend. Stripe para pagos, en **modo Live** (no de prueba).

---

## 2. Convenciones del repo (respétalas)

- **TypeScript estricto**, sin `any` salvo justificación en comentario.
- **Sin dependencias nuevas** si se puede resolver con lo que ya hay
  (`fetch` nativo, `@supabase/supabase-js`). Sin librería de CSS ni de
  iconos: los estilos son `src/styles/global.css` a mano y los iconos son SVG
  en línea (`src/components/layout/NavIcons.tsx`).
- **RLS siempre.** Cualquier tabla nueva necesita su política de acceso por
  negocio basada en `auth_business_ids()`, salvo que solo la toquen Edge
  Functions con `service_role` (y entonces hay que documentarlo).
- **Toda función `SECURITY DEFINER` nueva necesita su propio control de acceso
  interno** (comprobar `business_users` contra `auth.uid()`), y hay que
  **revocar el `EXECUTE` de quien no deba llamarla** — ver §6, es la lección
  más cara aprendida en este proyecto.
- **La lógica de negocio vive en RPCs de Postgres o Edge Functions**, nunca
  embebida en el frontend.
- **Comentarios en castellano de España**, solo cuando explican un *porqué* no
  obvio (una restricción oculta, un arreglo, una decisión de seguridad).
  Nunca comentarios que narren lo que hace el código línea a línea.
- **Copy en castellano de España** (tú, no vos/che; "coge" no "agarra").
- Los hooks `useAppointments`, `useClients`, `useConversations`, `useServices`
  y `useSubscription` **no tienen lógica propia**: son reexportaciones de
  `BusinessDataContext`/`SubscriptionContext`. Se dejaron así a propósito para
  no cambiar los imports de las páginas — si necesitas tocar su
  comportamiento, edita el contexto, no el hook.

---

## 3. Estructura de páginas y componentes

### Públicas (sin sesión)
- `/` — **Landing** (`src/pages/Landing.tsx`): hero con mockup de chat de
  WhatsApp y paralaje al ratón, secciones de problema/solución/cómo
  funciona/casos de uso por sector/FAQ/precios/cierre, animación de aparición
  al hacer scroll (`useScrollReveal`, `useMouseParallax`). Pie con enlace a
  PaMen Agency y a las tres páginas legales.
- `/login`, `/signup`, `/forgot-password`.
- `/privacidad`, `/cookies`, `/terminos` (`src/pages/legal/`, envueltas en
  `LegalLayout`) — plantillas orientativas, no asesoría legal. **El NIF del
  responsable sigue como `[pendiente de completar]`** en las tres.

### Protegidas (`/app/...`, dentro de `Shell`)
- **Dashboard** — resumen de citas/conversaciones/clientes.
- **Citas** — agenda con filtro por estado.
- **Clientes** *(Pro/Agencia)* — listado con búsqueda, ficha con historial y
  documentos, **botón "+ Nuevo cliente" para darlos de alta a mano**
  (`NewClientModal.tsx` — se añadió porque antes solo se creaban solos vía
  bot/citas, y un negocio que capta clientes por teléfono no tenía forma de
  meterlos).
- **Conversaciones** — bandeja de WhatsApp en vivo con Realtime.
- **Facturación** *(Pro/Agencia)* — presupuestos/facturas numeradas.
- **Inventario** *(Pro/Agencia)* — stock, precio de compra, caducidad,
  pedidos a proveedores.
- **Estadísticas** *(Pro/Agencia)*.
- **Configuración** — datos del negocio, bot, servicios, equipo.
- **Suscripción** (`/suscripcion`) — plan actual, aviso de prueba/caducidad,
  cambio de plan.

### Componentes de infraestructura de interfaz (`src/components/ui/`)
- `Modal.tsx` — diálogo accesible base: `role="dialog"`, cierre con Escape,
  foco atrapado y devuelto al cerrar, pila para diálogos anidados, bloquea el
  scroll de fondo. **Todos los modales del proyecto pasan por aquí.**
- `ConfirmDialog.tsx` — confirmación para acciones destructivas (cancelar
  cita/factura/pedido, quitar del equipo, borrar documento).
- `EmptyState.tsx` / `Skeleton.tsx` — estados vacíos con acción y marcadores
  de carga con la forma del contenido, en vez de "Cargando…" a secas.

### Contextos (`src/context/`)
- `AuthContext`, `TenantContext` — sesión y negocio activo (preexistentes).
- `SubscriptionContext` — **una sola consulta de suscripción por sesión**
  (antes se pedía por separado desde 5 sitios distintos) + toda la lógica de
  la prueba gratuita (`isTrialing`, `trialDaysLeft`, `trialExpired`).
- `BusinessDataContext` — citas/conversaciones/clientes/servicios con **una
  sola carga y un solo canal de Realtime por negocio** (antes cada página
  volvía a descargar todo y reabría su propio canal al navegar).

---

## 4. Planes y prueba gratuita

| Plan | Precio | Incluye |
|---|---|---|
| Starter | 19€/mes | Citas (hasta 50/mes), Conversaciones + bot, 1 usuario, 1 negocio |
| Pro | 49€/mes | Todo ilimitado + Clientes, Facturación, Inventario, Estadísticas, hasta 5 usuarios |
| Agencia | 99€/mes | Todo lo de Pro + negocios/equipo ilimitados, soporte prioritario |

- **Todo negocio nuevo arranca con 5 días de prueba gratis del plan Pro
  completo, sin tarjeta** (`TRIAL_DAYS` en `src/lib/plans.ts`, y de verdad en
  `create_business()`, migración `0011_free_trial.sql`).
- La prueba **no toca Stripe en absoluto** — vive solo en la tabla
  `subscriptions` (`status = 'trialing'`, `current_period_end = now() + 5
  días`). Al contratar un plan real, el webhook de Stripe sobrescribe la fila
  y la prueba termina.
- La caducidad se comprueba **por fecha, sin cron**, en dos sitios que tienen
  que coincidir si se cambia la duración: `business_plan()` (SQL) y
  `evaluate()` en `SubscriptionContext.tsx` (frontend).
- Las cuentas founder (`mendozitadjerez@gmail.com`,
  `amandacurbelo18@gmail.com`) se saltan la prueba: reciben Agencia activo
  gratis para siempre, directo en `create_business()`.

---

## 5. Infraestructura (dónde vive cada cosa)

| Pieza | Dónde |
|---|---|
| Frontend | GitHub → Netlify, autodeploy desde esta rama |
| Dominio | `atiendeapp.es` (Arsys), apuntando a Netlify con SSL |
| Backend | Supabase, proyecto **"Atiende"**, ref `whbnseutymxdvoesdqml`, org `mziabhacpxhotgsqjmnf` |
| Pagos | Stripe en **modo Live**, probado de extremo a extremo con un pago real |
| Correo | SMTP con `soporte.Atiende@gmail.com` |
| IA del bot | API de Anthropic (`ANTHROPIC_API_KEY` en secretos de Supabase) |
| WhatsApp real | **Sin conectar** — se monta con n8n + Meta WhatsApp Business API cuando un negocio de pago real lo pida, no es infraestructura global |

Tengo (esta sesión) acceso directo de lectura/escritura al proyecto de
Supabase vía MCP cuando está conectado — úsalo para aplicar migraciones o
comprobar `get_advisors` antes de dar algo por hecho; si no está conectado, el
único camino es pegar el SQL a mano en el SQL Editor del dashboard.

---

## 6. Seguridad — lo que se arregló y por qué importa

**Vulnerabilidad activa real, ya corregida (24 de agosto de 2026):** tres
funciones `SECURITY DEFINER` sin ningún control interno
(`handle_inbound_message`, `due_appointment_reminders`,
`mark_reminder_sent`) eran llamables por cualquier visitante sin sesión,
usando solo la clave pública `anon` que va incrustada en el propio bundle de
la web. Impacto real mientras estuvo así: inyección de mensajes/clientes
falsos en cualquier negocio, lectura del teléfono y nombre de clientes de
**todos** los negocios de la plataforma, y poder desactivar recordatorios
ajenos.

**La lección cara:** las migraciones `0001`/`0003` ya llevaban un `revoke
execute on function X from public;` desde el principio, y aun así no
funcionaba. Comprobado directamente contra la base de datos
(`has_function_privilege('anon', ...)` y `pg_proc.proacl`): Supabase concede
`EXECUTE` **directamente** a los roles `anon`/`authenticated` sobre cada
función nueva del esquema `public` (vía default privileges), no a través del
pseudo-rol `PUBLIC` — así que `revoke ... from public` no quita nada real.
Hay que revocar explícitamente `from anon, authenticated` (o `from public`
cuando el ACL muestra una entrada `=X/...` bare, que es un caso distinto —
ver el comentario largo en `0014_revoke_public_from_self_checked_rpcs.sql`).
**Nunca asumas que un `revoke` funcionó por el nombre del comando — compruébalo
con `has_function_privilege` contra la base de datos real.**

Migraciones relevantes: `0012` (cierre de las 3 críticas + `next_invoice_number`),
`0013` (fija `search_path` en las 9 funciones `SECURITY DEFINER`), `0014`
(quita el `PUBLIC` heredado de `auth_business_ids`, `business_plan`,
`create_business`, `create_invoice`, `receive_supplier_order` — estas cinco
NO tenían un exploit activo, ya se autoprotegen comprobando `business_users`
por dentro, se cerró por higiene).

**Pendiente, no técnico:** activar "Leaked password protection" en Supabase
→ Authentication → Policies (interruptor de un segundo, no tengo herramienta
para tocarlo desde aquí).

---

## 7. Verificado end-to-end en esta cuenta real (no solo en local)

- Pago real con Stripe en modo Live, de principio a fin (cobro → webhook →
  suscripción activa → acceso al panel), luego reembolsado.
- Registro, confirmación de email con el dominio real, y login.
- 40 combinaciones de contraste de color (20 pares × claro/oscuro) medidas
  con un script contra el CSS real, compositando la transparencia de los
  badges — todas pasan WCAG AA (4,5:1).
- El menú móvil de la landing a 390/360/320px, renderizado y medido, no solo
  calculado a mano.
- Las tres páginas legales, servidas con un `vite preview` real y
  capturadas, no solo compiladas.

---

## 8. Pendiente / próximos pasos

1. **NIF real** en las tres páginas legales (`Privacidad.tsx`, `Terminos.tsx`)
   — sigue como `[pendiente de completar]`.
2. **Leaked password protection** en Supabase Auth (ver §6).
3. **Conectar WhatsApp real** (n8n + Meta Business API) cuando un cliente de
   pago lo pida — no antes.
4. Avisos de rendimiento de `get_advisors` (claves foráneas sin índice,
   índices sin uso) — solo informativos, no urgentes hasta que haya volumen
   real de datos.
5. Confirmar en el dashboard de Netlify que **Production deploys** (no solo
   la vista previa de la PR) está siguiendo esta misma rama — hubo un caso en
   el que la vista previa se desplegó bien pero no quedó claro si producción
   lo había recogido; si vuelve a pasar, comprobar ahí antes de nada.

---

## 9. Material ya preparado (fuera del código)

- One-pager en PDF, tarjetas de visita (frontal negro + reverso con
  contacto), imagen de portada 1200×630 para fichas externas — todo generado
  con Playwright renderizando HTML con la paleta real de la app, no con
  Canva (no está autorizado en esta sesión).
- Plantillas de email/WhatsApp y guion de venta para contactar negocios en
  frío.
