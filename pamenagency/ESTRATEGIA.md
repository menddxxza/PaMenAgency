# PaMenAgency — Estrategia

> Documento de decisiones, no de opciones. Fecha: 4 de agosto de 2026.
> Creamos · Conectamos · Impulsamos

---

## 0. La respuesta corta

**No montes una agencia de IA.** El mercado español ya está saturado de agencias que
venden "chatbots de WhatsApp para PYMEs" a 49-99 €/mes, todas revendiendo la API de
OpenAI, todas compitiendo por precio, todas intercambiables.

Monta **una empresa de producto con una cuña de entrada legal**, y usa la marca
PaMenAgency como paraguas. La cuña existe desde hace exactamente dos días y tiene fecha
de caducidad: el que llegue primero se la queda.

Las tres decisiones:

1. **Vertical única: clínicas dentales en España.** Nada más, durante 12 meses.
2. **Puerta de entrada: cumplimiento del AI Act**, no "te vendo un bot".
3. **Precio: 10× lo que cobras hoy.** 249 €/mes, no 49 €/mes.

El resto de este documento explica por qué, con los números.

---

## 1. Qué tienes ya (inventario real, no aspiracional)

Esto es lo que hay construido en el repositorio. Es más de lo que tiene el 95 % de las
agencias que se anuncian en LinkedIn.

| Activo | Estado | Valor estratégico |
|---|---|---|
| **Atiende** (raíz del repo) | SaaS multi-tenant completo: React + Vite + Supabase, RLS, citas, CRM, estadísticas, equipo con invitaciones, PWA, Stripe con 3 planes, canal WhatsApp + Telegram | **Es el producto.** Ya es vendible |
| **Bots de Telegram** (`telegram-bot/`) | Bot de soporte con **Ollama local** (coste por token = 0) + bot personal con ejecución remota | **Es el foso.** Ver §3 |
| **IAPyme** (`iapyme/`) | Marketplace en Next.js, desplegado, dominio `iapyme.es`, Supabase con RLS, moderación, admin | Canal de distribución, no negocio propio. Ver §7 |
| **Infra** | Stripe operativo, Supabase Edge Functions, n8n como bus de mensajería | Puedes cobrar mañana |
| **Cumplimiento del AI Act** | `personas.ts:29` — el bot ya declara que es una IA si se lo preguntan | **La cuña.** Ver §2 |

Ese último punto lo escribiste como buena práctica. Desde el 2 de agosto es una
obligación legal, y es el motivo por el que este documento existe.

---

## 2. La cuña: el artículo 50 del AI Act

### El hecho

Desde el **2 de agosto de 2026**, el artículo 50 del Reglamento Europeo de IA obliga a
que cualquier sistema que converse con personas —chatbot, agente, asistente de voz—
informe de forma **clara, perceptible y accesible** de que el usuario está hablando con
una IA. No vale esconderlo en los términos y condiciones. El régimen sancionador llega a
**15 M€ o el 3 % de la facturación** (con criterios de proporcionalidad para PYMEs, que
no es lo mismo que impunidad).

### Por qué esto es una oportunidad y no una noticia

Piensa en el estado del mercado hoy, 4 de agosto de 2026:

- Miles de PYMEs españolas instalaron un chatbot en 2024-2026 porque estaba de moda.
- Se lo montó una agencia que ya no les da soporte, o un freelance, o una plantilla.
- Ninguna de esas PYMEs sabe qué dice su bot si le preguntan "¿eres un robot?".
- La mayoría de esos bots **niegan** ser IA o esquivan la pregunta, porque quien los
  configuró creía que parecer humano era mejor producto.
- Ninguna agencia va a llamar a sus clientes antiguos para decirles "oye, lo que te
  vendí ahora es ilegal".

Tienes un mercado entero de empresas que **acaban de quedarse fuera de la ley sin
enterarse**, y un producto que ya nace cumpliendo.

### Por qué esto vende y "te vendo un bot" no

Vender mejora es difícil: el cliente compara, pospone, pide descuento. Vender riesgo es
fácil: tiene fecha, tiene multa y tiene culpable si no actúa. Es la misma dinámica que
convirtió el RGPD en 2018 en una industria entera de consultoras que hoy siguen
facturando. Ese tren pasó. Este está pasando ahora mismo.

### El límite honesto — léelo antes de vender nada

**No vendas "certificación legal" ni firmes que un cliente cumple la ley.** No eres un
despacho. Si vendes cumplimiento y un cliente recibe una sanción, la responsabilidad te
salpica.

Lo que vendes es una **revisión técnica**: qué hace su sistema, qué responde, qué datos
salen de España, y la implementación de los avisos. La parte jurídica la firma un
abogado. Decisión concreta: **busca un despacho pequeño de derecho digital y pactad
comisión cruzada** (tú les llevas la parte legal, ellos te llevan la implementación
técnica). Te da credibilidad, te quita responsabilidad y te duplica el canal de entrada.
Esto es de las primeras cinco llamadas que tienes que hacer.

---

## 3. El foso: el modelo corre en local

Casi todas las agencias españolas revenden la API de OpenAI o Anthropic. Eso les crea
dos problemas que tú no tienes.

**Problema 1 — margen.** Pagan por token. Su coste sube cuando el cliente usa más el
producto: su mejor cliente es su peor margen. Tu `support-bot` corre sobre Ollama:
coste marginal cero. Puedes ofrecer conversaciones ilimitadas sin miedo, y eso es una
línea en la propuesta comercial que ellos no pueden escribir.

**Problema 2 — datos.** Y este es el grande para la vertical que vas a elegir.

Una clínica dental trata **datos de salud**: categoría especial del artículo 9 del RGPD,
el nivel más protegido que existe. Cuando el bot de la competencia procesa "necesito
cita para una endodoncia, me duele desde el jueves", ese dato sale a un servidor de
Estados Unidos.

Tú puedes escribir esto en una propuesta, y es verdad:

> **Las conversaciones de tus pacientes no salen de nuestra infraestructura. El modelo
> de lenguaje se ejecuta en un servidor propio en la Unión Europea. Ningún dato de salud
> de tus pacientes se envía a OpenAI, a Google ni a ningún proveedor fuera del EEE.**

Ninguna agencia que revenda APIs puede firmar ese párrafo. Ese párrafo es el negocio.

**Nota técnica:** hoy el bot corre en tu máquina. Antes de vender esto, móntalo en una
**VPS europea dedicada** (Hetzner en Alemania o Finlandia, ~40-80 €/mes para un modelo
pequeño). No des acceso a clientes desde tu ordenador, y **no despliegues nunca el
`personal-bot` en esa máquina** — ejecuta shell arbitraria, como ya avisa su README.

---

## 4. La vertical: clínicas dentales

### Por qué dental y no "PYMEs"

"PYMEs" no es un mercado, es una excusa para no elegir. Dental sí lo es:

| Dato | Cifra | Fuente |
|---|---|---|
| Clínicas dentales privadas registradas en España | **22.591** (registro oficial, 2022); otras estimaciones ~30.000 | Registro Gral. de Centros Sanitarios |
| Dentistas colegiados | **43.672** (INE, mayo 2026) | Consejo General de Dentistas |
| Concentración | Andalucía (4.269), Cataluña (3.561), Madrid (3.464) = la mitad del país | Dentalia |
| Tasa de no-show | **12-18 %** en consulta privada; hasta **25 %** en primeras visitas | Sector |
| Pérdida mensual típica | **~5.940 €/mes** (20 citas/día, 15 % ausencias, ticket 90 €) | Sector |
| Pérdida anual, clínica de 3 sillones | **18.000 - 35.000 €/año** | Sector |

Además: sector **atomizado**, operadores pequeños y locales. Eso significa que el dueño
decide solo, no hay comité de compras, y el ciclo de venta es de días, no de meses. Y
que todos van a los mismos congresos y se conocen entre ellos — el boca a boca funciona.

Y ya tenías "Agente de Citas para Clínicas Dentales" en el catálogo de salida de IAPyme.
La intuición ya la tenías; lo que faltaba era apostarlo todo a ella.

### El argumento de venta en una frase

> Tu clínica pierde entre 18.000 y 35.000 € al año en citas que nadie anuló. Nosotros lo
> recuperamos con un agente que confirma y reprograma por WhatsApp, sin que los datos de
> tus pacientes salgan de Europa, y cumpliendo el reglamento de IA que entró en vigor
> este mes.

Tres golpes: dinero perdido, dato sensible protegido, obligación legal reciente.

---

## 5. El precio: estás cobrando 10 veces menos de lo que vales

### Lo que cobras hoy

`src/lib/plans.ts`: Starter 19 €, Pro 49 €, Agencia 99 €.

### Lo que dice el mercado

- Implantación de chatbot de WhatsApp para empresa: **800 - 5.000 €** + **80 - 300 €/mes**.
- Coste total típico para una PYME con 200 conversaciones/mes: **150 - 350 €/mes**.
- Agente de IA a medida: **desde 5.000 €**.

Estás por debajo del suelo del mercado en un producto que es superior al de la media.

### La aritmética que hace obvio el cambio

Una clínica pierde 5.940 €/mes por ausencias. Si recuperas solo **el 30 %** de eso, le
devuelves **1.782 €/mes**. Cobrarle 49 € por eso no es ser barato: es hacer que no se lo
crea. Un precio de 49 € comunica "esto es un juguete". Un precio de 249 € comunica
"esto es infraestructura de tu clínica".

### Los precios nuevos (vertical dental)

| Concepto | Precio | Nota |
|---|---|---|
| **Revisión de IA y datos** (entrada) | **490 €**, pago único | 2-3 h de trabajo. Informe de qué hace su bot actual, qué datos salen de la UE, y checklist del art. 50. Es el producto que abre la puerta |
| **Implantación** | **1.490 €**, pago único | Ya lo hacías por 297 € |
| **Agente Dental** | **249 €/mes** | Citas, confirmaciones, reprogramación, WhatsApp, modelo en la UE |
| **Multiclínica** (2-5 sedes) | **599 €/mes** | Mismo producto, ya lo soporta el multi-tenant |

Los planes actuales de 19/49/99 € se quedan **solo** para el autoservicio genérico de
`atiendeapp.es`. No los enseñes nunca en una venta dental: cambia de página.

### Qué significa "hacerse rico", en números

Sin humo. Con 249 €/mes y 1.490 € de implantación:

| Clínicas | MRR | Ingreso anual recurrente | Qué es eso |
|---|---|---|---|
| 10 | 2.490 € | ~30.000 € | Un sueldo. Mes 6 realista |
| 40 | 9.960 € | ~120.000 € | Empresa de verdad. Mes 18 |
| 100 | 24.900 € | ~300.000 € | 0,45 % del mercado dental español |
| 250 | 62.250 € | ~750.000 € | 1,1 % del mercado. Aquí ya vendes la empresa |

**Cien clínicas de veintidós mil es el 0,45 %.** Eso es lo que separa esto de una
fantasía: no necesitas ganar el mercado, necesitas una esquina diminuta y bien elegida.

Compara con el camino de 19 €/mes: para llegar a 25.000 € de MRR necesitas **1.300
clientes**, cada uno con su soporte y su churn. Es el mismo dinero con trece veces más
trabajo. Esa es toda la diferencia entre esto y lo que estabas haciendo.

---

## 6. Lo que nadie hace (y tú puedes hacer desde el lunes)

Pediste algo que nadie haga. Estas cuatro, por orden de rareza:

**1. Vender la revisión de cumplimiento antes que el producto.**
Todo el mundo vende "más ventas, más eficiencia". Nadie vende "esto que ya tienes
instalado dejó de ser legal hace dos semanas, te lo reviso por 490 €". Entras cobrando,
sin competir contra nadie, y sales con un diagnóstico que justifica el producto. El
cliente ya te ha pagado una vez: la segunda venta es diez veces más fácil.

**2. Garantía sobre el resultado, no sobre el servicio.**
Ninguna agencia española garantiza nada. Ofrece: *"si en 90 días no reducimos tus
ausencias, te devolvemos las mensualidades"*. Puedes permitírtelo porque tu coste
marginal es casi cero (modelo local) y porque el producto ya funciona. Es la frase que
cierra la venta cuando el dentista duda, y la que la competencia no puede copiar sin
arruinarse pagando tokens.

**3. El informe mensual como producto.**
Cada mes, un PDF de una página a cada clínica: citas confirmadas, ausencias evitadas,
euros recuperados. Tienes el módulo de estadísticas construido (`src/pages/Estadisticas.tsx`).
Ese PDF es lo que hace que no te den de baja nunca, y es lo que el dentista enseña a
otro dentista en el congreso. El churn se mata con evidencia, no con soporte.

**4. Modelo en la UE como cláusula contractual, no como argumento de marketing.**
Ponlo por escrito en el contrato: *"los datos de salud tratados no abandonan la
infraestructura del prestador en la UE"*. Nadie lo firma porque nadie puede. Tú sí.

---

## 7. Qué hacer con IAPyme

Decisión incómoda: **IAPyme deja de ser un negocio y pasa a ser un canal.**

El razonamiento: un marketplace es un negocio de dos lados, el más difícil que existe.
Necesitas vendedores y compradores a la vez, tardas años y no genera caja al principio
—tú mismo decidiste comisión 0 % hasta tener volumen, que es la decisión correcta y
también la que significa "esto no factura en 18 meses"—. No puedes financiar eso sin
ingresos, y los ingresos van a venir de dental.

**No lo mates.** Está desplegado, el dominio está comprado y el SEO tarda meses en
madurar. Redúcelo a mantenimiento y dale un único trabajo: **captar leads**. Publica
contenido en `iapyme.es` que posicione por lo que tus clientes buscan ahora mismo
("mi chatbot cumple el AI Act", "IA para clínica dental"), y que el formulario de lead
—que ya funciona— caiga en tu bandeja. Cero desarrollo nuevo. Cuando dental facture
10.000 €/mes, revisas si merece la pena reabrirlo.

Del catálogo de 5 productos, **congela cuatro**. Solo dental. Los otros son la forma más
elegante de no avanzar en ninguno.

---

## 8. La marca: qué es PaMenAgency

La arquitectura, para que no confundas al cliente:

```
PaMenAgency  ← la casa. Vende, factura, firma. Es la marca profesional
   │
   ├── Atiende      → el producto SaaS (atiendeapp.es)
   ├── Agente Dental → la oferta vertical, sobre Atiende. LA PRIORIDAD
   └── IAPyme       → canal de captación (iapyme.es). Mantenimiento
```

Sobre el logo y la identidad: el logo que tienes (monograma PM dorado sobre negro) está
bien y transmite lo que necesitas. **Un aviso**: negro y dorado es el código visual de
lujo y de "consultoría premium", pero también es el código visual de los infoproductores
de "libertad financiera". En sanidad genera desconfianza. Recomendación concreta: mantén
el dorado para PaMenAgency (la casa, el contrato, la factura) y usa una identidad más
sobria y clínica —blanco, azul, mucho espacio— para todo lo que vea un dentista. Vende
más parecerse a un proveedor médico serio que a una agencia con éxito.

El eslogan que ya tienes, *Creamos · Conectamos · Impulsamos*, funciona para la casa.
Para dental usa uno concreto: *"Menos ausencias. Datos en Europa."*

Lo mínimo para ser creíble ante una clínica, en orden: web propia con casos y precios,
correo con dominio propio (nada de Gmail), factura correcta con IVA, contrato de
encargado de tratamiento del RGPD, y política de privacidad revisada por el abogado del
§2. Sin los dos últimos, una clínica seria no te firma. Con ellos, ya estás por delante
de la mitad de tu competencia.

---

## 9. Los 90 días

### Semanas 1-2 — Poner la casa en orden
- [ ] Elegir forma jurídica y facturación (autónomo para empezar; SL cuando pases de
      ~3.000 €/mes). Contrato de encargado de tratamiento redactado.
- [ ] Llamar a 5 despachos de derecho digital. Cerrar uno con comisión cruzada (§2).
- [ ] Mover el modelo de Ollama a una **VPS europea**. Sin esto no puedes vender la
      promesa de datos en la UE. El `personal-bot` NO va en esa máquina.
- [ ] Subir precios en `src/lib/plans.ts` y crear el plan `dental` a 249 €.

### Semanas 3-4 — Una clínica de verdad
- [ ] Elegir tu ciudad. Listar 50 clínicas dentales con teléfono y dueño.
- [ ] Vender **la revisión de 490 €**, no el producto. Objetivo: 3 revisiones.
- [ ] Con la primera clínica que pague: implantar gratis a cambio de un caso de éxito
      con cifras reales y permiso para publicarlo. **Uno solo.** El resto paga.

### Semanas 5-8 — Demostrar que funciona
- [ ] 90 días de datos de esa clínica: ausencias antes vs. después.
- [ ] Convertir eso en el informe mensual en PDF (§6.3) y en la única página de venta
      que vas a necesitar.
- [ ] Objetivo: **5 clínicas de pago**. ~1.245 €/mes + implantaciones.

### Semanas 9-12 — Repetir
- [ ] El caso de éxito es ahora la herramienta de venta. 30 llamadas/semana.
- [ ] Pedir referencias explícitamente a cada cliente contento. En un sector atomizado
      y local, es el canal más barato que existe.
- [ ] Objetivo mes 3: **10 clínicas**, ~2.490 €/mes recurrentes.

### La métrica única
No mires visitas, ni seguidores, ni features. Mira **clínicas dentales de pago**. Si esa
cifra no sube esta semana, nada de lo que hiciste esta semana importó.

---

## 10. Lo que te va a matar si no lo evitas

**Construir en vez de vender.** Es el riesgo número uno, y es tuyo en concreto: tienes
tres proyectos construidos y cero clientes de pago. Construir se siente productivo y no
tiene rechazo; vender se siente horrible y es lo único que funciona. Atiende ya está
terminado para lo que necesitas. **No escribas una línea de código nuevo hasta que haya
una clínica pagando**, salvo lo que esa clínica te pida.

**Aceptar el cliente que no es dental.** Va a llegar un restaurante ofreciendo 300 €.
Dile que no, o cóbrale 3.000 €. Cada cliente fuera de la vertical te rompe el producto
repetible y te devuelve a ser una agencia genérica.

**Volver a bajar el precio ante la primera objeción.** Si dicen que es caro, no bajes:
enseña la cuenta de los 5.940 €/mes. Quien no compra a 249 € tampoco compraría a 99 €;
solo tardaría más en decírtelo.

**Reabrir IAPyme cuando dental se ponga cuesta arriba.** Cambiar de proyecto cuando el
actual se hace difícil se siente como avanzar y es exactamente lo contrario. El mes 2 es
cuando esa tentación aparece.

---

## 11. Sobre "hacerse rico"

Una nota honesta, porque me lo preguntaste directamente.

No hay una idea que nadie haya tenido que te haga rico. Lo que hay es una ventaja
temporal —el AI Act acaba de entrar en vigor—, un activo que casi nadie tiene —modelo
local, datos en la UE—, y un producto ya construido. Eso es una posición realmente buena;
no es un atajo. Lo que convierte esa posición en dinero es cobrar bien y llamar a
clínicas todos los días durante un año, que es exactamente la parte que no se puede
delegar ni automatizar.

La ventana del AI Act se cierra sola: en 6-12 meses habrá diez agencias vendiendo esto.
Lo que quede entonces no será la idea, será tu lista de clientes y tus casos de éxito.
Por eso las 90 primeras jornadas van de vender y no de construir.

---

## Fuentes

- [AI Act: el artículo 50 activa la transparencia obligatoria de la IA el 2 de agosto — Economist & Jurist](https://www.economistjurist.es/articulos-juridicos-destacados/ai-act-el-articulo-50-activa-la-transparencia-obligatoria-de-la-ia-el-2-de-agosto/)
- [AI Act: nuevas obligaciones de transparencia desde el 2 de agosto de 2026 — PYMES Magazine](https://pymesmagazine.es/actualidad/ai-act-transparencia-2-agosto-2026/)
- [AI Act transparencia: las empresas españolas deben etiquetar el contenido generado con IA — Moncloa](https://www.moncloa.com/2026/08/02/ai-act-transparencia-etiquetado-espana-3409530)
- [España rebasa la cifra de 43.000 dentistas colegiados — Gaceta Dental](https://gacetadental.com/2026/05/espana-rebasa-43-000-dentistas-colegiados/)
- [Andalucía, Cataluña y Madrid suman el mismo número de clínicas dentales que el resto de CCAA juntas — Dentalia](https://www.consalud.es/dentalia/clinicas/andalucia-cataluna-madrid-suman-mismo-numero-clinicas-dentales-resto-ccaa-juntas_138360_102.html)
- [Cómo reducir no-shows en clínicas dentales (guía 2026) — Bookniapp](https://bookniapp.com/es/blog/reducir-no-shows-clinicas-dentales-guia-2026/)
- [Tasas de inasistencias en clínicas: benchmarks reales — Hellomatik](https://hellomatik.com/es/blog/que-dice-realmente-tu-tasa-de-inasistencias-sobre-tu-clinica)
- [Cuánto cuesta un chatbot WhatsApp para empresas 2026 — Potencia Redes](https://potenciaredes.com/blog/cuanto-cuesta-chatbot-whatsapp-empresas-malaga-2026/)
- [¿Cuánto cuesta un agente IA para empresas en España? Guía de precios 2026 — Inter Linked](https://interlinkedai.es/precio-agente-ia-empresa/)
