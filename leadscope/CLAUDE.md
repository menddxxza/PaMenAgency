# LeadScope — contexto específico

> Este `CLAUDE.md` es solo de **LeadScope**. Para reglas de Pablo y transversales del
> monorepo, ver `../CLAUDE.md`. No mezclar con Notiq, RevynAI/Nexorai, IAPyme ni Atiende.

## Qué es

SaaS para encontrar negocios locales sin web (leadscope.es). Documento de referencia con
más detalle en `README.md` de esta misma carpeta y, si existe, `PROYECTO_LEADSCOPE.md`.

## Estado (última nota: 2026-09-24)

Dominio y Supabase configurados; falta Stripe y el Production Branch en Vercel.

## Stack

Next.js 14 + TypeScript, Tailwind, Supabase (Postgres, Auth, RLS), Google Places API
(New) y Geocoding, exportación CSV/Excel/PDF, PWA. Vercel (team `pa-men-agency`, proyecto
`leadscope`).

- Usa una **segunda cuenta de Supabase** distinta a la de otros productos. Claude nunca ha
  tenido sus credenciales; Pablo aplica las migraciones pegándolas él mismo.

## Nombre y dominio

- El nombre se queda **LeadScope** (se probó BUSCASITE y se revirtió).
- Dominio `leadscope.es` en Nominalia: A `@` → `76.76.21.21`, CNAME `www` →
  `cname.vercel-dns.com`. El correo no se toca.

## Ramas

- Rama propia e independiente `leadscope` en GitHub (creada desde la de Notiq; **no
  fusionar** con ella). Clon local en `notiq-repo/leadscope/`.
- Falta que Vercel use `leadscope` como Production Branch.

## Flujo de trabajo

- Antes de cada commit: `npx tsc --noEmit` y `npm run build` limpios.
- Solo importa que el check **`Vercel – leadscope`** esté en verde. El check
  `Vercel – pamenagency` falla desde siempre y no bloquea nada.

## Pendiente

- **Stripe**: código listo pero con claves placeholder, sin producto ni precio real.
- **Clasificación IA de calidad de web** (`ENABLE_AI_QUALITY_CHECK`): desactivada, sin
  claves de IA.
- Poner `leadscope` como Production Branch en Vercel.
