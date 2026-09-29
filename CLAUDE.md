# PaMenAgency — contexto general del monorepo

> Este archivo se lee siempre, trabajes en la carpeta que trabajes. Cada producto tiene
> además su propio `CLAUDE.md` dentro de su carpeta (`notiq/CLAUDE.md`, `leadscope/CLAUDE.md`,
> `nexorai/CLAUDE.md`, `iapyme/CLAUDE.md`) con su contexto específico. **No mezcles el
> contexto de un producto con otro**: si trabajas dentro de `leadscope/`, ese `CLAUDE.md`
> manda; el de `notiq/` no aplica ahí, y viceversa. Si hay duda de qué producto toca,
> pregunta a Pablo antes de asumir.

## Quién es el usuario

- **Pablo Angel Piñeiro Mendoza**, gestiona varios productos reales bajo la marca
  **PaMenAgency** (pamenagency.com). Persona física como responsable legal.
- **Sin perfil técnico**: en pasos de configuración (Vercel, Stripe, DNS, Supabase...) hay
  que ser muy concreto («haz clic en X, después en Y»), sin dar por supuesto vocabulario
  técnico.
- Prefiere trabajar por fases explícitas y validar cada una antes de avanzar a la
  siguiente. Rechaza estética «AI startup», chatbots genéricos, degradados morados y
  dashboards de plantilla.
- Dirección artística que le gusta: negro/dorado, tipografía enorme, transiciones cortas y
  limpias.
- Cuenta con la que interactúa con Claude: mendozitadjerez@gmail.com.
- Sus proyectos son independientes entre sí (Notiq, LeadScope, Atiende, RevynAI/Nexorai,
  IAPyme, la web de PaMenAgency, NADIR, PRAXIS, Dronagrícola). No mezclar contexto de uno
  con otro.

## Reglas generales de trabajo

- Responde siempre en **español de España** (respuestas, commits, comentarios, textos de
  interfaz).
- **Sin humo**: no prometas cifras, resultados ni funcionalidades que no existan. Si no hay
  fuente o dato, dilo explícitamente.
- Trabaja por fases y no avances a la siguiente sin validación explícita de Pablo.
- Todo documento entregable (Word, PDF...) lleva la marca **PaMenAgency**: logo en
  cabecera y paleta **dorado `#9C7A2A`** / **negro `#1A1A1A`**. Logo disponible en
  `PaMenAgencyHandoff/PaMenAgency-Handoff/pamenagency-web/public/logo.jpg` (fuera de este
  repo).
- Correo de soporte de cara al público para **todos** los productos:
  `soporte.atiende@gmail.com`. (`hola@iapymeapp.com` no se atiende — si aparece en algún
  sitio de IAPyme es un resto por sustituir.)
- Nunca pidas ni repitas claves o contraseñas en el chat; se guardan como variables de
  entorno.

## Estructura de este monorepo

Este repositorio (`pamenagency`) **no es una sola app**: aloja varios productos
independientes, cada uno en su carpeta de nivel raíz, con su propio `package.json`,
despliegue y base de datos:

| Carpeta | Producto | Stack |
| --- | --- | --- |
| `src/`, `index.html`, `vite.config.ts` (raíz) | **Atiende** — agente de IA de atención al cliente por WhatsApp | Vite + React 18 + React Router + Supabase JS (SPA) |
| `notiq/` | **Notiq** — notas, tareas y asistente IA | Next.js 14/15 + Auth.js + Neon (Postgres) |
| `leadscope/` | **LeadScope** — SaaS para encontrar negocios sin web | Next.js 14 + Supabase + Google Places |
| `nexorai/` | **RevynAI / Nexorai** — calcula pérdidas de un negocio y genera plan con IA (**EN PAUSA**) | Next.js 14 + Supabase SSR + Tailwind |
| `iapyme/` | **IAPyme** — marketplace de soluciones de IA en español | Next.js 14 + Supabase SSR |
| `telegram-bot/` | Bots de Telegram (soporte y uso personal), standalone | Node + Telegraf |
| `supabase/` (raíz) | Edge Functions y migraciones propias de **Atiende** | Supabase |

No hay `workspaces` ni punto de entrada único: cada carpeta se despliega por separado. La
raíz del repo **es** el producto Atiende, no un contenedor de los demás.

## Atiende (proyecto de la carpeta raíz de este repo)

- Objetivo de Pablo: automatizar negocios con **coste 0**. Piloto con el salón de uñas
  **All Nails** (usa su número normal de WhatsApp; agenda en Google Calendar). Si va bien,
  seguir con 6 negocios de Cádiz.
- **Técnico**: proyecto Supabase `Atiende` (ref `whbnseutymxdvoesdqml`, eu-west-1) con
  esquema multi-tenant. Todo en Edge Functions de Supabase (sin n8n ni Oracle). Funciones:
  `generate-bot-reply` (Groq > Gemini > Anthropic según el secreto presente),
  `whatsapp-inbound` (Meta), `telegram-inbound` (solo pruebas), `create-checkout-session`,
  `create-portal-session`, `stripe-webhook`, `invite-member`, `list-members`,
  `remove-member`, `get-business-config`. Groq gratis con `openai/gpt-oss-20b`.
- **El cerebro del bot funciona de extremo a extremo por Telegram.** Por WhatsApp con el
  número de pruebas de Meta el webhook verifica, pero los mensajes reales desde el móvil
  nunca llegaron a probarse (sin depurar).
- **Panel «todo en la app»**: chat por cliente y conversación, envío real por
  WhatsApp/Telegram, aviso «Esperando respuesta», horario editable. Páginas en
  `src/pages/`: Dashboard, Conversaciones, Clientes, Citas, Estadisticas, Configuracion,
  OnboardingBusiness, Suscripcion, Landing, Login, Signup.
- **Pendiente**: número real en Meta (SIM nueva o coexistencia con la app WhatsApp
  Business), secretos `META_APP_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, agenda
  con Google Calendar, cuenta Resend y revisión de copy.
- **Aviso importante**: el `whatsapp_number` real del negocio All Nails es `637635492` y se
  cambió temporalmente al número de pruebas de Meta. **Restaurarlo al terminar las
  pruebas.** El horario y las duraciones de servicios cargados son inventados, no reales.
- Gemini en capa gratuita: no usar con datos sensibles (por ejemplo, clínicas, si algún día
  se usara Atiende con una).

## Reglas técnicas transversales

- **postgres.js (porsager/postgres)**: nunca escribir `${JSON.stringify(x)}::jsonb`; usar
  `${sql.json(x)}` (o `tx.json(x)` en transacción). Si no, el valor se codifica dos veces,
  no da error, y los datos «se guardan pero no se ven». Para detectarlo:
  `select jsonb_typeof(columna) ...` devuelve `'string'` en vez de `'array'`/`'object'`.
  Reparación: `(columna #>> '{}')::jsonb`.
- **Vercel**: un push a una rama que no sea la de producción genera un «Preview»; hay que
  promover a mano a producción.
- **Windows** (si Pablo trabaja localmente y lo comenta): filtrar procesos por
  `*next*start*` también mata `next dev` — parar por puerto, no por nombre de proceso.
  Next.js 16 reescribe `AGENTS.md` al arrancar el servidor de desarrollo: revertir con
  `git checkout -- AGENTS.md` antes de commitear.

## Otros proyectos de Pablo (fuera de este repositorio)

No están en este monorepo — no tocarlos desde aquí, solo tenerlos presentes para no
confundir contexto si Pablo los menciona:

- **Web de PaMenAgency** (pamenagency.com): repo/rama aparte
  (`claude/pamenagency-website-djp4ol`). SPA en React con rediseño cinematográfico de la
  Home (GSAP ScrollTrigger + Lenis + Three.js). Un push a esa rama no promueve solo a
  producción en Vercel: hay que entrar a mano en Vercel → proyecto `pamenagency` →
  Deployments → «Promote to Production», y avisarlo siempre tras cada push.
- **NADIR**: plataforma B2B «sistema operativo para drones» (agricultura e inspección de
  edificios). Proyecto propio de Pablo, git local sin remoto, carpeta
  `Proyectos claude/nadir`.
- **PRAXIS**: inteligencia empresarial para todo tamaño de empresa. Git local, carpeta
  `Proyectos claude/praxis/`. FASE 8 preparada, faltan claves y despliegue.
- **Dronagrícola (Blue Drone AI)**: demo de un amigo (Carlos), repo
  `Carlitos306/PROYECTOAGRICOLA`. No es de Pablo — líneas rojas estrictas sobre datos RAW y
  reprocesar vuelos.
- **Nuevo SaaS**: en fase de validar candidatas con entrevistas, sin construir nada aún.

## Pendientes abiertos (transversales)

- **Atiende**: número real de WhatsApp en Meta, secretos de Meta, agenda con Google
  Calendar, cuenta Resend. Restaurar el número real de All Nails.
- **Conectores de claude.ai**: autorizar los que falten (Canva, Stripe, Notion...) y
  arreglar el de GitHub si sigue fallando.
