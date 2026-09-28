# LeadScope — instrucciones para Claude

> Este archivo lo lee automáticamente cualquier sesión de Claude Code que abra esta carpeta,
> sea en VS Code, en la nube o desde claude.ai/code (iPad). Mantenlo al día tú mismo cuando
> termines un bloque de trabajo importante: es la forma de que la siguiente sesión, en
> cualquier dispositivo, sepa por dónde vas sin que el usuario tenga que repetírtelo.

## Qué es LeadScope
SaaS para **encontrar clientes**: busca negocios locales por sector y zona con Google Places API
(New), puntúa su presencia online (sin web / solo redes / web rota o antigua / activa) y exporta
resultados. Parte de PaMenAgency. Todo en español — respuestas, commits, comentarios, interfaz.

## Reglas no negociables
- **Rama**: trabaja siempre en `leadscope`, independiente de la rama de Notiq
  (`claude/notiq-ai-productivity-app-mcriln`) y de cualquier otra del monorepo
  `menddxxza/PaMenAgency`. No fusionar ramas de distintos proyectos.
- Si trabajas desde un clon local que también se usa para otros proyectos de este monorepo
  (en este equipo del usuario: `notiq-repo/` y `PaMenAgency/`), comprueba `git branch
  --show-current` antes de cualquier commit. Ya pasó una vez que un commit de Notiq se coló en
  esta rama por error — ver detalle en el traspaso (enlace abajo).
- Antes de subir cualquier cambio: `npx tsc --noEmit` y `npm run build` limpios. El build en
  local necesita `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` — valores falsos
  bastan para comprobar que compila.
- El usuario (Pablo) no tiene perfil técnico: explica los pasos manuales (Vercel, Stripe,
  Supabase, DNS) paso a paso y en detalle. Nunca le pidas que pegue claves secretas en el chat.

## Estado actual (corte 2026-09-28)
- Dominio de producción: `leadscope.es` (Nominalia + Vercel). Producción despliega automáticamente
  al hacer push a `leadscope`.
- Supabase: segunda cuenta del usuario (no la principal). RLS activo.
- 4 planes de pago (Gratis/Básico 10€/Avanzado 40€/Pro 80€) definidos en `lib/types.ts`
  (`PLANS`), con Stripe en modo real ya configurado por el usuario.
- Patrón habitual: varias sesiones en paralelo abren PRs contra `leadscope` y se fusionan
  directamente ahí. Es normal encontrarte cambios de otra sesión al retomar — revisa
  `git log` antes de asumir que la rama está como la dejaste tú.

## Dónde está el resto del contexto
- `leadscope/README.md`: arquitectura técnica detallada.
- `TRASPASO_LEADSCOPE.md` (carpeta `Proyectos claude/leadscope/` en el OneDrive del usuario, no
  en este repo): historial narrativo completo, decisiones tomadas, pendientes e incidentes. Pídele
  al usuario que te lo pase si no lo tienes ya en contexto, o pídeselo por su ruta si tienes
  acceso al sistema de archivos de su equipo.
