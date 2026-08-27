# PROJECT_ANALYSIS.md — Estado del repositorio antes de construir Revynai

## 1. Qué es este repositorio

`PaMenAgency` **no es una sola aplicación**: es un monorepo que aloja varios productos
independientes de PaMenAgency, cada uno en su propia carpeta de nivel raíz, con su propio
`package.json`, su propio deploy y su propia base de datos Supabase:

| Carpeta         | Producto                              | Stack                                                    |
| ---------------- | -------------------------------------- | --------------------------------------------------------- |
| `src/` (raíz)     | **Atiende** — asistente de citas/WhatsApp para negocios | Vite + React 18 + React Router + Supabase JS (SPA, no SSR) |
| `iapyme/`         | Landing/producto IA para PyMEs         | Next.js 14 (App Router) + Supabase SSR + Tailwind          |
| `leadscope/`      | SaaS de prospección de negocios sin web | Next.js 14 (App Router) + Supabase SSR + Stripe + Tailwind |
| `notiq/`          | Producto de productividad              | Next.js 15 + NextAuth + Postgres directo (`postgres` lib)  |
| `telegram-bot/`   | Bots de Telegram (soporte + personal)   | Node + Telegraf, standalone (sin framework web)            |
| `nexorai/` (nuevo)| **Este proyecto**                       | Next.js 14 + Supabase SSR + Tailwind (mismo patrón que `leadscope`) |

No existe un "punto de entrada único" ni un paquete raíz que orqueste todo (no hay
`workspaces` en el `package.json` raíz). Cada subcarpeta es un proyecto desplegable de forma
independiente. La raíz (`src/`, `index.html`, `vite.config.ts`) es en sí misma el producto
"Atiende", no un contenedor de los demás.

**Conclusión:** integrar Revynai significa añadir una nueva carpeta hermana (`nexorai/`),
replicando las convenciones ya probadas en el repo — no modificar la app raíz ni las otras
carpetas, y no intentar unificarlas en un monolito.

## 2. Patrón de referencia elegido: `leadscope/`

De los productos existentes, `leadscope` es el más cercano en propósito (SaaS B2B de
generación de oportunidades comerciales) y el más reciente. Se usa como plantilla de
convenciones para Revynai:

- **Next.js 14 App Router + TypeScript estricto**, alias `@/*`.
- **Tailwind** con tokens de color en HSL vía CSS custom properties (`--bg`, `--surface`,
  `--fg`, `--muted`, `--border`, `--ring`) definidas en `app/globals.css`, más una escala
  `brand.50…900` propia del producto. Fuente `next/font/google` (display + sans) con
  variables CSS.
- **Supabase**: `lib/supabase/{client,server,middleware}.ts` con `@supabase/ssr`,
  `middleware.ts` raíz que llama a `updateSession`, Row Level Security en todas las tablas,
  trigger `handle_new_user` que crea el registro de perfil al hacer signup.
  Migraciones SQL versionadas en `supabase/migrations/000N_*.sql`.
  `types/database.types.ts` con los tipos de la base de datos.
- **Estructura de carpetas**: `app/(auth)/...`, `app/(dashboard)/dashboard/...`, `app/api/...`,
  `components/{ui,landing,dashboard,...}`, `lib/{dominio}.ts`, `hooks/`.
- **UI kit propio** en `components/ui/` (Button, Card, Input, Select, Badge, Modal, Tooltip)
  con `class-variance-authority` — no se usa una librería de componentes de terceros.
- **Motor de negocio determinista** en `lib/` (p.ej. `opportunity-score.ts`) desacoplado de
  React: funciones puras que calculan un score a partir de datos reales; la IA (opcional, vía
  `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`) sólo se usa como reclasificador opcional, nunca como
  única fuente de la verdad — exactamente el patrón que pide la spec de Revynai (estimaciones
  deterministas + IA como capa de enriquecimiento, nunca de invención de datos).
- **Legal**: páginas `/legal/privacidad`, `/legal/cookies`, `/legal/terminos`,
  `/legal/tratamiento-datos` ya existen como páginas propias dentro de `leadscope`. Para
  Revynai, el propietario ha pedido explícitamente enlazar las páginas legales de
  **pamenagency.com** (externas), no crear páginas locales — Revynai se presenta como un
  producto de PaMenAgency.
- **Pagos**: Stripe Checkout/Portal/Webhook ya resueltos en `leadscope/app/api/stripe/*` y
  `lib/stripe.ts` — sirven de referencia para cuando Revynai active pagos reales, pero el MVP
  de Revynai no los activa (ver más abajo, sección 21 de la spec: "no implementes pagos reales
  todavía salvo que sea necesario").

## 3. Qué se reutiliza vs. qué se crea

**Se reutiliza (patrón, no código copiado literalmente):**
- Arquitectura de carpetas Next.js App Router.
- Convención de tokens de diseño HSL + Tailwind.
- Patrón de clientes Supabase (browser/server/middleware) y de migraciones con RLS.
- Convención de "motor determinista + IA opcional desacoplada por proveedor".
- Sistema de componentes UI propio (sin librerías externas de componentes).

**Se crea desde cero para Revynai:**
- Identidad visual propia (paleta esmeralda/oro inspirada en el logo Revynai, tipografía,
  fondo oscuro permanente tipo "consola estratégica" — inspirado en la referencia visual
  aportada, sin copiar su paleta cian/violeta genérica de IA).
- Modelo de datos multi-tenant orientado a **objetivo de crecimiento → auditoría → oportunidad
  → agente → tarea → lead → evento de ingreso**, que no existe en ningún otro producto del
  repo.
- Capa `AIProvider` desacoplada de proveedor (Anthropic/OpenAI/mock) reutilizable más allá de
  un solo caso de uso (en `leadscope` la IA está incrustada directamente en un archivo con
  fetch a dos proveedores; en Revynai se abstrae detrás de una interfaz común para poder
  añadir proveedores sin tocar el resto de la app).
- Motor de oportunidades y agentes (catálogo de 6 agentes, simulación controlada de tareas).

## 4. Qué falta / decisiones de arquitectura tomadas

- **No hay proyecto Supabase real conectado a esta sesión** (no hay credenciales en el
  entorno). El esquema y el código se escriben para funcionar contra un proyecto Supabase real
  en cuanto se configuren `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `SUPABASE_SERVICE_ROLE_KEY`, siguiendo el mismo patrón que `leadscope`. Sin esas variables la
  app no puede ejecutarse en runtime (ni podría cualquier otro producto del repo), pero el
  código, los tipos y las migraciones son reales y completos, no un mock de UI.
- **No hay claves de proveedores de IA**. Por diseño (ver spec, punto 4 y 21), los cálculos de
  oportunidad de ingresos son **deterministas** a partir de los datos introducidos por el
  usuario (no dependen de IA para no "inventar" cifras). La capa `AIProvider` se usa solo para
  generar un resumen ejecutivo en lenguaje natural a partir de esas cifras ya calculadas; si no
  hay API key configurada, cae a un `MockAIProvider` que compone el resumen con una plantilla
  determinista — la UI dice explícitamente cuándo el resumen es una plantilla local vs.
  generado por un modelo.
- **Acciones de agentes con efecto externo real** (enviar WhatsApp, emails, etc.) no están
  conectadas a ningún proveedor en este MVP. Se simulan de forma controlada y **toda la UI que
  muestra datos simulados lleva una etiqueta visible** ("Simulación de demostración") — nunca
  se presentan como resultados reales, cumpliendo la regla fundamental del punto 21 de la spec.
- **Stripe**: no se activa checkout real; el plan de precios se muestra como estructura de
  datos editable (`lib/plans.ts`) con CTAs que llevan a contacto, no a un cobro real.
- **next/font con Google Fonts** requiere red en build time; si el entorno de build no tiene
  salida a Google Fonts, hay que sustituir por fuentes locales. Se deja documentado en
  `README.md` de `nexorai/`.

Ver `PRODUCT_ARCHITECTURE.md` para el diseño detallado del producto (entidades, flujos,
agentes, seguridad, escalabilidad).
