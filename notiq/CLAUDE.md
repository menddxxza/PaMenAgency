# Notiq — contexto específico

> Este `CLAUDE.md` es solo de **Notiq**. Para reglas de Pablo y transversales del
> monorepo, ver `../CLAUDE.md`. No mezclar con LeadScope, RevynAI/Nexorai, IAPyme ni
> Atiende.

## Qué es

App de notas, tareas y asistente IA (notiq.es). Documento de referencia con más detalle en
`README.md` y `ROADMAP.md` de esta misma carpeta.

## Estado (última nota: 2026-09-17)

En producción con pagos Stripe reales. Pestaña «Estudio» hecha pero sin subir.

## Stack

- Next.js 14 (App Router) + Tailwind.
- Base de datos **Neon** (Postgres, sin RLS).
- Auth.js v5 con email y contraseña.
- Stripe: planes Free / Pro 9 € / Team 19 €.
- IA con Groq (`groq/compound` para el asistente, `openai/gpt-oss-120b` para resúmenes).
- Despliegue en Vercel (team PaMenAgency, plan Hobby). Dominio `notiq.es` en Arsys con
  nameservers de Vercel.

## Repositorio y ramas

- Rama de producción: `claude/notiq-ai-productivity-app-mcriln` (PR #7 abierto en
  borrador). Esa rama despliega sola a notiq.es. Clon de trabajo local en
  `Proyectos claude/notiq-repo/notiq`.

## Convenciones

- Todo en español (código, comentarios, nombres).
- Los comentarios solo explican el «por qué».
- Los prompts de IA viven en `lib/ia/prompts.ts`; el contenido del usuario **nunca** va en
  el mensaje `system` (anti-inyección).

## Ya en producción

Etiquetas, papelera de recuperación, modo oscuro, paleta de comandos Ctrl/Cmd+K,
plantillas, exportar a Markdown/PDF, backlinks `[[Título]]`, «Recordar», arrastrar y
soltar en adjuntos, hero nuevo con vídeo de fondo (`public/hero.mp4`, 16 MB sin comprimir —
si la landing carga lenta, mirar ahí).

## Sin subir

- «Compartir por enlace» (rama local `notiq-compartir-pendiente`, necesita la migración
  0003 en Neon).
- Pestaña «Estudio» con flashcards, exámenes y grabar clase (necesita la migración 0004).
  **Desplegarla sin las tablas rompería la app.**

## Bug resuelto (2026-09-17)

«La nota se vacía al reabrirla» era doble codificación JSON al escribir columnas `jsonb`
(ver regla técnica de `postgres.js` en el `CLAUDE.md` raíz). Datos reparados con la
migración 0012.

## Deuda menor

Tabla `debug_log` y columnas `notes.debug_bloques` / `debug_momento` sin limpiar. No hay
borrado de cuenta autoservicio.

## Documento de referencia adicional

Si existe, `notiq/NOTIQCONTEXTOCOMPLETO.md` (sin claves reales, solo nombres de
variables) — en este checkout no está presente; usar `README.md` / `ROADMAP.md` mientras
tanto.

## Pendientes

- Decidir si ejecutar las migraciones 0003 (compartir por enlace) y 0004 (Estudio).
- Limpiar `debug_log`.
- PR #7 sin fusionar.
