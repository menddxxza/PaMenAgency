# PRODUCT_ARCHITECTURE.md — Nexorai

> "Conecta tu empresa. Dile cuánto quieres crecer. La IA encuentra dónde está el dinero y
> pone agentes a trabajar para conseguirlo."

Nexorai es un producto de **PaMenAgency** (pamenagency.com). No vende IA: vende resultados
comerciales. El usuario nunca interactúa con "modelos" o "prompts" — interactúa con un
objetivo de crecimiento, una auditoría de su negocio, oportunidades priorizadas por ingreso
potencial, y agentes que trabajan esas oportunidades.

## 1. Flujo principal del MVP (lo único que tiene que funcionar perfecto)

```
LANDING → REGISTRO → CREAR EMPRESA → DEFINIR OBJETIVO → AI AUDIT
   → OPPORTUNITIES → ACTIVAR AGENTE → DASHBOARD → RESULTADOS (timeline)
```

1. **Landing** (`/`): propuesta de valor, calculadora de potencial, demo visual del flujo,
   precios, footer con marca PaMenAgency + legales externos.
2. **Registro/Login** (`/login`, `/signup`): Supabase Auth (email/password).
3. **Crear empresa** (`/onboarding/business`): formulario corto (10 campos) → crea
   `Organization` + `Business` + `BusinessMetric`.
4. **Definir objetivo** (`/onboarding/goal`): "¿Cuánto quieres crecer?" → crea `Goal`.
5. **AI Audit** (`/audit`): ejecuta el motor determinista de oportunidad de ingresos sobre
   `Business` + `BusinessMetric` + `Goal` → crea `Opportunity[]` y un resumen ejecutivo
   (`AIProvider`, opcional). Muestra el desglose "Potencial detectado: €X/mes".
6. **Opportunities** (`/opportunities`): lista de oportunidades con
   nombre/potencial/dificultad/probabilidad/ROI/prioridad y botón `[ACTIVAR]`.
7. **Activar agente**: activar una oportunidad crea/activa el `Agent` correspondiente del
   catálogo, genera `AgentTask` iniciales y (en modo simulación, claramente etiquetado) datos
   de demostración progresivos (`Lead`, eventos de timeline).
8. **Dashboard** (`/dashboard`): KPIs (Revenue Generated / Potential, Leads Found/Contacted,
   Conversions, ROI), gráfico de evolución, agentes activos, Action Center.
9. **Resultados / Revenue Timeline** (`/dashboard#timeline`): línea de tiempo Hoy → Día 15
   mostrando qué ha hecho el sistema, para transmitir "hay una IA trabajando".

Todo lo demás (agentes marketplace, pagos entre agentes, success fee real, multi-sector
completo) es arquitectura preparada, no funcionalidad del MVP.

## 2. Multi-sector desde el diseño, inmobiliarias como piloto

`Business.sector` es un enum abierto (`lib/sectors.ts`) con configuración por sector:
etiquetas de campos, rangos de ticket medio típico, multiplicadores del motor de oportunidad,
y contenido de la página SEO `/sectores/[slug]`. El sector inicial completamente afinado es
**inmobiliarias** (alto valor por cliente, dependencia constante de leads, procesos
repetibles, capacidad de pago por resultado). Añadir un sector nuevo es añadir una entrada al
config, no tocar el modelo de datos ni el motor.

## 3. Modelo de datos (Supabase / Postgres, RLS por `organization_id`)

```
User (auth.users, gestionado por Supabase Auth)
  └─ profiles (1:1)                — nombre, email, org por defecto

Organization                        — tenant. Todo cuelga de aquí.
  ├─ memberships (user_id, org_id, role)
  ├─ Business (1:1 en el MVP; preparado para 1:N a futuro)
  │    └─ BusinessMetric            — snapshot de métricas (facturación, ticket medio, clientes…)
  ├─ Goal                           — objetivo de crecimiento declarado
  ├─ Opportunity                    — generadas por el audit engine a partir de Business+Goal
  ├─ Agent                          — instancias del catálogo, activadas por el usuario
  │    └─ AgentTask                 — unidades de trabajo de un agente (con resultado y coste)
  ├─ Lead                           — prospectos encontrados/gestionados por los agentes
  ├─ Campaign                       — agrupación opcional de tareas/leads (preparado, no UI en MVP)
  ├─ Conversation                   — hilo de mensajes de seguimiento de un Lead (preparado)
  ├─ Action                         — recomendaciones del Action Center (activable/vista)
  ├─ RevenueEvent                   — atribución de ingreso (real o potencial) a una Opportunity/Agent
  ├─ Subscription                   — plan contratado (Starter/Pro/Business/Performance)
  ├─ Usage                          — contadores de consumo por periodo (tareas de agente, etc.)
  └─ AuditLog                       — traza de eventos de producto y acciones sensibles
```

Puntos clave de diseño:

- **Todo cuelga de `organization_id`** (no de `user_id` directamente) para que RLS separe
  datos entre clientes desde el primer día y para soportar equipos multi-usuario sin
  refactorizar.
- **`RevenueEvent` es la pieza que prepara el success fee futuro**: cada fila tiene
  `amount`, `kind` ('potential' | 'attributed' | 'confirmed'), `opportunity_id`, `agent_id`,
  `is_simulated`. Un futuro `success_fee_pct` en `Subscription` permite calcular
  `fee = sum(amount where kind='confirmed') * success_fee_pct` sin tocar el resto del esquema.
- **`is_simulated` existe en `AgentTask`, `Lead` y `RevenueEvent`**: es el mecanismo por el que
  la UI sabe qué badge de "Simulación de demostración" pintar y qué nunca debe sumarse a
  ingresos reales ni exportarse como resultado verídico.
- **No se duplica dato de negocio**: `BusinessMetric` es histórico versionado (una fila nueva
  por actualización), no se sobreescribe `Business`.

Ver `supabase/migrations/0001_init.sql` para el DDL completo con constraints, índices y RLS.

## 4. Motor de auditoría y oportunidades (determinista, sin IA)

`lib/ai/audit-engine.ts` calcula el potencial de ingreso mensual a partir de datos reales
introducidos por el usuario (facturación, ticket medio, clientes actuales, leads/mes,
conversión, canales, empleados) con fórmulas explícitas y **rangos**, nunca cifras inventadas
sin base. Genera 5 categorías fijas (igual que el ejemplo de la spec):

1. Leads sin seguimiento
2. Clientes antiguos recuperables
3. Prospección
4. Automatización comercial
5. Optimización de conversión

Cada categoría se convierte en una fila de `Opportunity` con: nombre, descripción, potencial
económico (rango), dificultad, tiempo estimado, probabilidad, coste estimado, ROI potencial y
prioridad (`lib/ai/opportunity-engine.ts` ordena y prioriza). La UI muestra siempre el texto
fijo: **"Estimación basada en los datos proporcionados"** y nunca la palabra "garantizado".

La capa `AIProvider` (`lib/ai/provider.ts`) sólo se invoca *después* de tener las cifras, para
redactar un resumen ejecutivo en lenguaje natural. Interfaz:

```ts
interface AIProvider {
  readonly id: 'anthropic' | 'openai' | 'mock';
  summarizeAudit(input: AuditSummaryInput): Promise<string>;
}
```

`getAIProvider()` decide la implementación por `process.env.AI_PROVIDER` (default `mock`).
Cambiar de modelo/proveedor es cambiar una variable de entorno, no reescribir la app.

## 5. Agentes

Catálogo fijo en `lib/agents/catalog.ts` (nombre, objetivo, descripción, herramientas,
permisos, tipo de oportunidad que atiende):

| Agente | Objetivo | Oportunidad que activa |
| --- | --- | --- |
| Lead Hunter | Encontrar prospectos nuevos | Prospección |
| Lead Qualifier | Clasificar y priorizar leads | Optimización de conversión |
| Sales Assistant | Preparar respuestas/seguimiento | Automatización comercial |
| Follow-up Agent | Detectar leads olvidados | Leads sin seguimiento |
| Reactivation Agent | Reactivar clientes antiguos | Clientes antiguos recuperables |
| Revenue Analyst | Analizar resultados y ROI | (transversal, siempre activo) |

Activar una `Opportunity` crea/activa el `Agent` correspondiente y llama a
`lib/agents/simulate.ts`, que genera `AgentTask` + `Lead` + `RevenueEvent(kind='potential',
is_simulated=true)` distribuidos en el tiempo (hoy, día 1, 3, 5, 10, 15) para alimentar el
Revenue Timeline. **Ninguna acción externa irreversible ocurre sin autorización explícita**:
en el MVP no hay conectores externos reales conectados (WhatsApp/email), así que no hay nada
que autorizar todavía — el botón `[ACTIVAR]` sólo activa trabajo simulado y claramente
etiquetado; el día que se conecte un canal real, esa activación pasará a requerir un paso de
confirmación explícito adicional (ya contemplado en el campo `Agent.requires_approval`).

## 6. Seguridad y privacidad

- Auth por Supabase (email/password), sesión gestionada por `@supabase/ssr` + middleware.
- RLS en **todas** las tablas de negocio, con policies `using (organization_id in (select
  organization_id from memberships where user_id = auth.uid()))`.
- Ninguna clave (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
  `STRIPE_SECRET_KEY`) se expone al cliente — sólo `NEXT_PUBLIC_*` llega al bundle.
  El cliente admin (`service role`) sólo se instancia en Route Handlers server-side.
- Validación de inputs con `zod` en cada Route Handler antes de tocar la base de datos.
- `AuditLog` registra: creación de empresa, definición de objetivo, generación de auditoría,
  activación de oportunidad/agente, cambios de plan.
- Preparado para GDPR: `Organization.deleted_at` (soft delete + purga programada),
  exportación de datos vía endpoint futuro `GET /api/account/export` (documentado, no
  implementado en el MVP), borrado de cuenta vía `DELETE /api/account` (documentado). No se
  hacen afirmaciones legales de cumplimiento — el footer enlaza a las políticas reales de
  pamenagency.com.

## 7. Escalabilidad y evolución futura (no se construye ahora, pero no se bloquea)

- **Marketplace/broker de agentes**: `Agent` ya tiene `is_marketplace_listed`,
  `owner_organization_id` nulos hoy, listos para que un agente pueda pertenecer a un tercero.
- **Transacciones/pagos entre agentes y success fee**: `RevenueEvent` + `Subscription` cubren
  la atribución; falta sólo la integración de cobro real (Stripe Connect u otro), fuera del
  MVP.
- **Multi-sector**: añadir sector = añadir config, no migración.
- **Multi-negocio por organización**: el esquema ya soporta `Business` 1:N por
  `Organization`; el MVP sólo permite crear uno por simplicidad de UI, no por límite de datos.

## 8. Eventos de analítica (`lib/analytics.ts`)

`signup`, `business_created`, `audit_started`, `audit_completed`, `opportunity_viewed`,
`opportunity_activated`, `agent_created`, `agent_started`, `lead_created`, `lead_contacted`,
`conversion_created`, `revenue_recorded`, `subscription_started`. Se registran en `AuditLog`
(best-effort, no bloqueante) y por consola en desarrollo.
