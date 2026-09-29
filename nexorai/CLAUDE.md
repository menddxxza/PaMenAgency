# RevynAI / Nexorai — contexto específico

> ⚠️ **EN PAUSA desde 2026-09-24 hasta nuevo aviso. No trabajar en él ni proponer avances**
> salvo que Pablo lo retome explícitamente.

> Este `CLAUDE.md` es solo de este producto. Para reglas de Pablo y transversales del
> monorepo, ver `../CLAUDE.md`. No mezclar con Notiq, LeadScope, IAPyme ni Atiende.

## Qué es

Calcula, con un motor determinista (sin IA, con rangos), cuánto dinero pierde un negocio,
y genera con Groq un plan de 6 pasos y borradores. Documento de referencia con más detalle
en `README.md`, `PRODUCT_ARCHITECTURE.md` y `PROJECT_ANALYSIS.md` de esta misma carpeta.

## Qué es real y qué no

- **Real**: cálculo, planes IA, importación CSV, dashboards, `/admin`, login
  multi-negocio, PWA.
- **No real**: los agentes no envían nada (falta cuenta Resend), no hay cobro (planes
  50/100/200 € sin Stripe), cero clientes de pago. **No prometer «agentes que trabajan
  solos».**

## Dominio

`revynai.es` (Nominalia) pasó a renovación **manual** el 2026-09-24: si nadie lo renueva,
caduca y la web cae.

## Entrega/handoff

Entrega completa en `revynai/REVYNAI_HANDOFF_COMPLETO.md` si existe en el checkout (rama
`claude/nexora-ai-growth-platform-n8na21`, PR #23).

## Pendiente (solo si Pablo lo retoma)

- Renovar `revynai.es` a mano si se quiere conservar el dominio.
