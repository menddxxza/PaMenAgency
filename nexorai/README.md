# Nexorai

> "Conecta tu empresa. Dile cuánto quieres crecer. La IA encuentra dónde está el dinero y pone
> agentes a trabajar para conseguirlo."

Un producto de [PaMenAgency](https://pamenagency.com). No vende IA — vende resultados: una
empresa introduce su objetivo de crecimiento, Nexorai audita el negocio, detecta oportunidades
de ingreso con potencial estimado y activa agentes especializados para trabajarlas.

Ver `PROJECT_ANALYSIS.md` (estado del monorepo antes de este proyecto) y
`PRODUCT_ARCHITECTURE.md` (arquitectura completa del producto) para el contexto de diseño.

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + `class-variance-authority` |
| Datos / Auth | Supabase (Postgres + Auth + Row Level Security) |
| IA | Capa `AIProvider` desacoplada (Anthropic / OpenAI / mock) — sólo para el resumen ejecutivo, nunca para las cifras |
| Gráficos | Recharts |
| Despliegue | Cualquier host compatible con Next.js (Vercel, Netlify…) |

## Flujo del MVP

```
LANDING → REGISTRO → CREAR EMPRESA → DEFINIR OBJETIVO → AI AUDIT
   → OPPORTUNITIES → ACTIVAR AGENTE → DASHBOARD → RESULTADOS
```

## Puesta en marcha

```bash
cd nexorai
npm install
cp .env.example .env.local   # rellena NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Aplica las migraciones de `supabase/migrations/` sobre tu proyecto Supabase (SQL editor o
`supabase db push`) antes de usar la app — sin ellas, el registro y el resto del flujo
fallarán al no existir las tablas.

Sin `AI_PROVIDER`/`ANTHROPIC_API_KEY`/`OPENAI_API_KEY`, el resumen ejecutivo del AI Business
Audit usa una plantilla local determinista (etiquetada como tal en la UI); los cálculos de
potencial de ingresos **nunca** dependen de un proveedor de IA.

## Estructura

```
nexorai/
├─ app/
│  ├─ page.tsx                        # Landing
│  ├─ (auth)/login, (auth)/signup      # Supabase Auth
│  ├─ onboarding/business, /goal       # Alta de negocio + objetivo
│  ├─ (app)/audit, /opportunities, /agents, /dashboard, /billing, /settings
│  ├─ sectores/[slug]                  # Páginas SEO por sector
│  └─ api/                             # Route Handlers (businesses, goals, activate)
├─ components/{ui,landing,dashboard,onboarding,auth,opportunities}
├─ lib/
│  ├─ ai/{provider,audit-engine,opportunity-engine}.ts
│  ├─ agents/{catalog,simulate}.ts
│  ├─ supabase/{client,server,middleware}.ts
│  ├─ server/org-context.ts
│  └─ {sectors,plans,analytics,types,utils}.ts
├─ supabase/migrations/0001_init.sql
└─ types/database.types.ts
```

## Datos de demostración

Ningún conector externo real (WhatsApp, email, CRM) está conectado en este MVP. Al activar una
oportunidad se genera trabajo simulado (tareas, leads, ingreso potencial) para poder enseñar el
producto funcionando de extremo a extremo. Todo dato simulado lleva `is_simulated = true` en la
base de datos y una etiqueta visible **"Simulación de demostración"** en la UI — nunca se
presenta como un resultado real.
