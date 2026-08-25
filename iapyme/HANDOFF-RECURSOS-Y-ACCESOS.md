# IAPyme — Recursos, cuentas y accesos

Aviso de seguridad honesto antes de nada: **esta sesión de Claude nunca ha tenido, visto
ni guardado ninguna clave secreta real** (API keys, contraseñas, tokens). El usuario las
configuró siempre directamente en el panel de Vercel, sin pasarlas nunca por el chat — que
es exactamente como debe ser. Este documento lista **qué cuentas y variables existen y para
qué sirven**, no sus valores. Donde haga falta un valor secreto, lo pone en mayúsculas
entre corchetes y dice dónde ir a buscarlo. Rellénalo tú (el usuario) directamente en
Vercel, nunca lo pegues en un chat con una IA si puedes evitarlo.

## Repositorio de código

- **GitHub**: `github.com/menddxxza/PaMenAgency` (el repo se movió/renombró desde
  `menddxxza/menddxxza` durante esta sesión — un `git push` al nombre antiguo redirige
  solo, pero usa el nuevo nombre para clonar).
- Es un **monorepo**: contiene, en carpetas separadas dentro de las mismas ramas, varios
  proyectos de PaMenAgency (IAPyme, un proyecto llamado "Notiq", un bot de Telegram, la
  propia web de PaMenAgency). **IAPyme vive en la subcarpeta `iapyme/`.**
- **Rama de producción real** (la que Vercel despliega en `iapymeapp.com`):
  `claude/atiende-react-supabase-setup-fz5e9t`
  — confírmalo siempre en Vercel → Project Settings → Environments → Production → Branch
  Tracking, no lo des por hecho por el nombre.
- Otras ramas relevantes que verás en el historial (no son producción):
  - `claude/revision-archivos-proyecto-bop2gl` — rama de trabajo usada en esta sesión
    antes de fusionar a producción.
  - `claude/notiq-ai-productivity-app-mcriln` — contiene el proyecto "Notiq", NO IAPyme
    en producción (aunque en un momento de esta sesión se pensó por error que sí lo era —
    ver `HANDOFF-RESUMEN-SESION.md` sección 4).
  - `claude/pamenagency-website-djp4ol` — la web de pamenagency.com, proyecto distinto.

## Vercel (hosting)

- **Team**: PaMenAgency (plan Hobby).
- **Proyecto**: `iapyme`.
- **Dominios en producción**: `iapymeapp.com` y `iapyme.vercel.app`.
- **Rama de producción**: `claude/atiende-react-supabase-setup-fz5e9t` (branch tracking
  activado — cada push a esa rama debería generar un deployment de producción automático;
  en la práctica, verifica siempre que el deployment quede marcado como "Production", no
  solo "Preview" — ha fallado antes, ver sección 4 del resumen).
- **Variables de entorno** a configurar en Vercel → Project Settings → Environment
  Variables (entorno "Production" como mínimo; añade también "Preview" si quieres probar
  ramas antes de fusionar):

| Variable | Para qué | Dónde conseguirla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio, **solo servidor**, nunca exponerla al cliente | Supabase → Project Settings → API |
| `GROQ_API_KEY` | Asistente de búsqueda con IA (`app/api/recomendar`) | console.groq.com → API Keys |
| `RESEND_API_KEY` | Envío de emails transaccionales (avisos de moderación, leads, reseñas) | resend.com → API Keys |
| `ADMIN_EMAIL` | A qué email llegan los avisos de moderación | el email que tú quieras usar |
| `NEXT_PUBLIC_SITE_URL` | URL canónica para metadatos, sitemap, robots.txt | debe ser `https://iapymeapp.com` — **revisa que esté puesta así**; el valor por defecto en el código si falta esta variable es `https://iapyme.es`, que es un dominio de una fase anterior del proyecto y NO el actual |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Analítica con Plausible (opcional — si no se pone, simplemente no carga el script) | plausible.io, si tienes cuenta |
| `SITE_LOCK_PASSWORD` | Opcional: si se rellena, toda la web pide usuario/contraseña (HTTP Basic Auth) antes de servir nada — útil para bloquear el sitio temporalmente. Sin esta variable, no cambia nada | la contraseña que tú quieras |

## Supabase (base de datos y autenticación)

- Proyecto de Supabase ya creado por el usuario (nombre "IAPyme", región Ireland, según
  `PROGRESO.md` — verifícalo, es de antes de esta sesión).
- Migraciones SQL en `iapyme/supabase/migrations/`, en orden: `0001_fase1.sql` (schema
  base: profiles, categories, products, leads, product_views), `0002_no_contar_visitas_propias.sql`,
  `0003_resenas.sql` (reseñas y valoraciones), `0004_favoritos.sql` (favoritos),
  `0005_admin_perfiles.sql` (permite a un admin verificar vendedores). **Las 5 ya están
  aplicadas** en el proyecto de Supabase real del usuario (confirmado durante esta sesión,
  columna por columna, vía el SQL Editor).
- Autenticación: email + Google (Google Cloud + Supabase Auth), configurada en una sesión
  anterior a esta.
- Login con Google: si hace falta revisarlo, está en Supabase → Authentication → Providers
  → Google, con las credenciales de un proyecto de Google Cloud (no gestionado por esta
  sesión, el usuario tendrá que localizar esas credenciales él mismo si hace falta
  rotarlas).

## Groq (asistente de búsqueda con IA)

- Cuenta en **console.groq.com**.
- Modelo usado actualmente: **`openai/gpt-oss-120b`** (constante `MODELO` en
  `iapyme/lib/groq.ts`). Groq retira modelos con cierta frecuencia — si el asistente
  empieza a fallar con `model_not_found`, pide al usuario la lista de modelos disponible
  en su cuenta (Playground o Docs → Models de console.groq.com) y actualiza esa constante.
- Capa gratuita, sin tarjeta de crédito necesaria en el momento de escribir esto.

## Resend (email transaccional)

- Cuenta en **resend.com**. Remitente usado en el código: `IAPyme <onboarding@resend.dev>`
  (dominio de pruebas de Resend — si se quiere un dominio propio verificado, hay que
  configurarlo en Resend y cambiar el remitente en `iapyme/lib/email.ts`).

## PaMenAgency (empresa / marca)

- Sitio: **pamenagency.com** — enlazado desde el pie de página de IAPyme
  ("un producto de PaMenAgency").
- Repositorio de su propia web: `claude/pamenagency-website-djp4ol` en el mismo monorepo
  de GitHub.

## Dominio y DNS

- `iapymeapp.com` — dominio real en producción, apuntado a Vercel.
- `iapyme.es` — mencionado en `PROGRESO.md` como comprado para una fase anterior con
  Netlify; **no se ha confirmado en esta sesión si sigue en uso o si redirige a
  iapymeapp.com**. Pregúntaselo directamente al usuario si es relevante para lo que estés
  haciendo.

## Cómo verificar que tienes todo esto bien puesto (checklist rápida)

1. Vercel → el proyecto `iapyme` → Environment Variables: están todas las de la tabla de
   arriba con el entorno "Production" marcado.
2. Vercel → Settings → Environments → Production → Branch Tracking: dice
   `claude/atiende-react-supabase-setup-fz5e9t`.
3. Vercel → Settings → Domains: `iapymeapp.com` aparece con el candado verde (verificado).
4. Supabase → Table Editor: existen las tablas `profiles`, `categories`, `products`,
   `leads`, `product_views`, `reviews`, `favorites` (si falta alguna, hay que correr la
   migración correspondiente de `supabase/migrations/`).
5. Prueba en la web real (no en local): el buscador con IA responde algo coherente (no
   "el asistente no está disponible ahora mismo").
