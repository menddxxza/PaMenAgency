# LeadScope

SaaS para encontrar negocios locales **sin página web** (o con web rota, desactualizada, o solo
en redes sociales) en cualquier país, ciudad o código postal del mundo, usando datos en vivo de
Google Places. Pensado para agencias de diseño web, freelancers y comerciales que venden
presencia digital a negocios locales.

## Stack

| Capa            | Tecnología                                             |
| --------------- | ------------------------------------------------------- |
| Framework       | Next.js 14 (App Router) + TypeScript                    |
| Estilos         | Tailwind CSS + `class-variance-authority`                |
| Datos / Auth    | Supabase (Postgres + Auth + Row Level Security)          |
| Datos de negocios | Google Places API (New) — Text Search + Geocoding      |
| Clasificación IA | Claude (Anthropic) u OpenAI — detección de webs anticuadas (opcional) |
| Pagos           | Stripe (Checkout + Billing Portal + Webhooks)             |
| Exportación     | `papaparse` (CSV), `xlsx` (Excel), `jspdf` (PDF)          |
| Tabla virtualizada | `@tanstack/react-virtual`                              |
| Despliegue      | Vercel                                                    |

## Estructura del proyecto

```
leadscope/
├─ app/
│  ├─ page.tsx                     # Landing page
│  ├─ layout.tsx                   # Layout raíz: providers (tema, toasts, auth)
│  ├─ globals.css                  # Tokens de diseño (light/dark) + utilidades
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ signup/page.tsx
│  ├─ (dashboard)/
│  │  └─ layout.tsx                # Protege /dashboard/* (redirige si no hay sesión)
│  │  └─ dashboard/
│  │     ├─ search/page.tsx        # Buscador principal
│  │     ├─ history/page.tsx       # Historial de búsquedas
│  │     ├─ history/[id]/page.tsx  # Resultados de una búsqueda pasada
│  │     ├─ billing/page.tsx       # Plan actual, uso, upgrade a Pro
│  │     └─ settings/page.tsx      # Perfil y preferencias
│  ├─ api/
│  │  ├─ search/route.ts           # Orquesta Places + detección de web + scoring + guardado
│  │  └─ stripe/
│  │     ├─ checkout/route.ts      # Crea sesión de Stripe Checkout
│  │     ├─ portal/route.ts        # Crea sesión del Billing Portal
│  │     └─ webhook/route.ts       # Sincroniza el plan tras eventos de Stripe
│  └─ auth/callback/route.ts       # Intercambio de código OAuth/email de Supabase
│
├─ components/
│  ├─ ui/                          # Sistema de diseño: Button, Input, Select, Badge, Card…
│  ├─ landing/                     # Secciones de la landing
│  ├─ auth/                        # AuthCard compartido por login/signup
│  ├─ dashboard/                   # Sidebar, Topbar, navegación móvil
│  ├─ search/                      # Formulario, filtros, tabla virtualizada, export, badges
│  ├─ billing/                     # Tarjetas de plan
│  └─ providers/                   # Theme, Toast y Auth context (React Context, no libs extra)
│
├─ lib/
│  ├─ google-places.ts             # Cliente de Places API (New): Text Search + Geocoding
│  ├─ website-detector.ts          # Determina sin_web / redes / rota / activa + extrae email
│  ├─ ai-classifier.ts             # Reclasifica "activa" → "antigua" con IA (opcional)
│  ├─ opportunity-score.ts         # Calcula el score de oportunidad (Alta/Media/Baja)
│  ├─ filter-businesses.ts         # Filtros + búsqueda instantánea client-side
│  ├─ export.ts                    # Exportación a CSV/Excel/PDF (client-side, carga diferida)
│  ├─ stripe.ts                    # Cliente de Stripe + IDs de precios
│  ├─ types.ts                     # Tipos de dominio + configuración de planes
│  ├─ utils.ts                     # cn(), formatters, debounce
│  └─ supabase/
│     ├─ client.ts                 # Cliente de Supabase para Client Components
│     ├─ server.ts                 # Cliente para Server Components/Route Handlers + service role
│     └─ middleware.ts             # Refresco de sesión + protección de rutas
│
├─ hooks/
│  ├─ useSearch.ts                 # Llama a /api/search y gestiona el estado de resultados
│  └─ useDebounce.ts               # Debounce genérico (usado en la búsqueda instantánea)
│
├─ types/database.types.ts         # Tipos de la base de datos (equivalente a `supabase gen types`)
├─ supabase/migrations/            # Esquema SQL + RLS + función de límite de uso
├─ middleware.ts                   # Middleware raíz de Next.js
└─ .env.example
```

### Por qué esta arquitectura

- **App Router + Server Components por defecto**: las páginas que solo leen datos (historial,
  billing, layout del dashboard) son Server Components que consultan Supabase directamente con
  la sesión del usuario — sin exponer claves ni duplicar llamadas cliente/servidor. Los
  componentes interactivos (formulario de búsqueda, tabla, filtros) son Client Components
  explícitos (`'use client'`).
- **Toda la lógica de negocio vive en `lib/`**, no en los componentes ni en las rutas API: eso
  permite testear `opportunity-score.ts` o `website-detector.ts` de forma aislada y reutilizarlos
  si mañana se añade un endpoint público o un job en background.
- **RLS en Supabase como única fuente de autorización**: cada tabla (`searches`,
  `search_results`, `usage_counters`) tiene políticas `auth.uid() = user_id`, así que aunque haya
  un bug en una ruta API, un usuario nunca puede leer los datos de otro.
- **Límite de plan gratuito aplicado de forma atómica**: `increment_usage_and_check_limit` es una
  función SQL `security definer` que incrementa y comprueba el contador en una sola transacción,
  evitando condiciones de carrera si el usuario lanza varias búsquedas a la vez.
- **Exportación 100% client-side**: CSV/Excel/PDF se generan en el navegador con `import()`
  dinámico, así el bundle inicial no carga `xlsx`/`jspdf` a menos que el usuario exporte.
- **Tabla virtualizada**: `@tanstack/react-virtual` solo monta las filas visibles, así que 200+
  resultados (el máximo del plan Pro) se renderizan sin coste perceptible y el diseño soporta
  crecer a miles de filas cacheadas en el historial.

## Flujo de una búsqueda

1. El usuario rellena nicho + ubicación en `/dashboard/search` → `SearchForm`.
2. `useSearch` hace `POST /api/search`.
3. La ruta API:
   1. Verifica sesión (Supabase) y plan del usuario.
   2. Llama a `increment_usage_and_check_limit` (bloquea si el plan gratuito agotó sus 5
      búsquedas del mes).
   3. Pide negocios a `searchPlaces()` (Google Places Text Search, con geocoding del código
      postal/ciudad si hace falta y paginación hasta el límite del plan).
   4. Para cada negocio, `checkWebsitesBatch()` comprueba en paralelo (8 a la vez) si la web
      existe, es una red social, está rota o activa — y extrae el email si lo encuentra en el
      HTML.
   5. Si `ENABLE_AI_QUALITY_CHECK=true`, `maybeReclassifyOutdated()` reutiliza el HTML ya
      descargado y le pregunta a Claude/OpenAI si la web parece anticuada.
   6. `computeOpportunity()` calcula el score 0-100 y la etiqueta Alta/Media/Baja.
   7. Se guarda la búsqueda y sus resultados en Supabase (para el historial) y se devuelven al
      cliente.
4. La tabla, los filtros y la búsqueda instantánea son 100% client-side sobre el array recibido —
   no hay round-trips al servidor al cambiar de filtro.

## Puesta en marcha local

```bash
cd leadscope
npm install
cp .env.example .env.local   # rellena las claves (ver abajo)
npm run dev
```

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ejecuta las migraciones de `supabase/migrations/` en el SQL Editor (o con la CLI:
   `supabase db push`), en orden: `0001_init.sql`, luego `0002_usage_functions.sql`.
3. Copia `Project URL` y `anon public key` a `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y la `service_role key` a `SUPABASE_SERVICE_ROLE_KEY`
   (solo se usa en el webhook de Stripe, nunca en el cliente).

### 2. Google Places API

1. En [Google Cloud Console](https://console.cloud.google.com/), activa **Places API (New)** y
   **Geocoding API** en el mismo proyecto.
2. Crea una API key restringida a esas dos APIs y ponla en `GOOGLE_PLACES_API_KEY`.

### 3. Stripe

1. Crea un producto "LeadScope Pro" con un precio mensual (y opcionalmente anual) recurrente.
2. Copia los `price_id` a `STRIPE_PRICE_PRO_MONTHLY` / `STRIPE_PRICE_PRO_YEARLY`.
3. Copia la clave secreta a `STRIPE_SECRET_KEY`.
4. En local, usa `stripe listen --forward-to localhost:3000/api/stripe/webhook` para obtener el
   `STRIPE_WEBHOOK_SECRET` de pruebas. En producción, crea el webhook apuntando a
   `https://tu-dominio.com/api/stripe/webhook` escuchando `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.created` y
   `customer.subscription.deleted`.

### 4. Clasificación de calidad de web con IA (opcional)

Activa `ENABLE_AI_QUALITY_CHECK=true` y añade `ANTHROPIC_API_KEY` (por defecto) o
`OPENAI_API_KEY` con `AI_PROVIDER=openai`. Si se deja desactivado, todo el resto de la app
funciona igual: simplemente no se reclasifican webs "activas" como "antiguas".

## Despliegue en Vercel

1. Importa el repositorio en Vercel y selecciona `leadscope/` como **Root Directory** (es un
   proyecto independiente dentro de este monorepo).
2. Añade todas las variables de `.env.example` en Project Settings → Environment Variables.
3. Configura el webhook de Stripe apuntando a `https://<tu-dominio>.vercel.app/api/stripe/webhook`.
4. Añade la URL final en `NEXT_PUBLIC_SITE_URL` (usada en los `return_url` de Stripe).

## Modelo de planes

| | Gratis | Pro |
| --- | --- | --- |
| Búsquedas / mes | 5 | Ilimitadas |
| Resultados por búsqueda | 20 | 200 |
| Exportación | CSV | CSV, Excel, PDF |
| Clasificación de webs con IA | — | ✓ |

La configuración vive en `lib/types.ts` (`PLANS`) — cambiar límites o precios no requiere tocar
ninguna otra parte del código.
