# PaMenAgency — contexto del monorepo

Este archivo lo lee Claude Code automáticamente al empezar cualquier sesión en este
repositorio (VS Code, terminal, o cualquier otro cliente), sin que haya que explicarlo
a mano. Mantenlo al día cuando termines un bloque de trabajo importante: es la memoria
del proyecto entre sesiones y entre dispositivos (el chat de la app de Claude/iPad y el
de Claude Code en VS Code **no** comparten historial — este archivo es el puente).

## Qué es esto

Monorepo con varios productos de PaMenAgency, cada uno en su carpeta con su propio
`README.md` (léelo para el detalle de ese producto):

| Carpeta | Producto | Stack |
| --- | --- | --- |
| `notiq/` | App de notas + tareas + asistente IA | Next.js 15, TypeScript, Tailwind, Neon (Postgres), Auth.js |
| `leadscope/` | SaaS de búsqueda de negocios locales sin web | Next.js 14, Supabase, Google Places API, Stripe |
| `nexorai/` | Plataforma de crecimiento con agentes IA | Next.js 14, Supabase |
| `iapyme/` | Landing de validación de demanda (marketplace IA) | Next.js 14, Supabase |
| `telegram-bot/` | Bot de Telegram | — |
| `src/`, `public/`, `index.html`, `vite.config.ts` | App raíz (Vite + React + `atiende`) | Vite, React 18, React Router, Supabase |

Cada subproyecto tiene su propio `package.json`/`npm install`. Lee el `README.md` de la
carpeta antes de tocar algo ahí.

## Estado reciente (lo último trabajado, más nuevo arriba)

Ver `git log --oneline` para el detalle exacto. Resumen de los últimos bloques de trabajo:

- **Landing raíz**: sección de comparación con reloj animado y scroll reveal.
- **Notiq — Estudio**: se quitó "Grabar clase" (consumía muchos créditos de IA); se
  añadieron "Escanear documento", "Resolver ejercicio" (foto → solución paso a paso) y
  "Analizar vídeo de clase"; se aparcó "Importar de YouTube" (YouTube bloquea la
  extracción gratuita); biblioteca de recursos por asignatura.
- **Notiq — autoguardado de notas**: fue una saga larga de bugs de pérdida de contenido
  al cerrar/reabrir notas rápido. Causas reales encontradas y corregidas, en orden:
  caché "atrás" (bfcache) de Next.js forzando recarga; carrera entre refetch al montar
  el editor y el guardado reciente (se quitó el refetch redundante); **doble
  codificación JSON en la columna `jsonb`** (la causa raíz final). Se añadió botón
  "Guardar ahora" visible junto al indicador de estado. **Si tocas el editor de notas
  o el autoguardado, lee este historial de commits primero** — varias "soluciones"
  anteriores no eran la causa real.
- **Notiq — nav**: rediseño con efecto "gooey" (GooeyNav) en escritorio, Estudio justo
  después de Inicio.
- **Notiq — otras features**: recordatorios reales (push + cron), modo examen (cuenta
  atrás + plan de repaso), compartir nota por enlace, vista de tabla en Notas, nota de
  bienvenida al registrarse, eliminar carpetas.

## Ramas activas / en curso

Hay múltiples ramas de trabajo en `origin` (`leadscope`, `redesign/estilo-dala-preview`,
`claude/pamenagency-website-djp4ol`, `claude/project-continuation-6xsnaf`, etc.). Antes
de asumir que `main` tiene lo último de un producto concreto, comprueba
`git log --oneline --all --graph` o pregunta cuál es la rama activa de ese trabajo.

## Convenciones

- Commits y READMEs en español.
- Cuando un bug parece resuelto pero no lo está, el historial de Notiq (arriba) es un
  buen ejemplo de cómo se acaba encontrando la causa real — no asumas que el primer
  síntoma es la causa.
