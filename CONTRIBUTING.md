# Trabajar en Silbato Cero

Guía corta para ponerse a tocar el juego sin romperlo. No hace falta saber
nada del proyecto de antemano: en diez minutos se tiene el juego corriendo.

## Dos formas de entrar

El repositorio es público, así que **no hace falta permiso para empezar**.

- **Con fork** (no requiere que te inviten): haz un *fork*, trabaja en tu
  copia y abre una pull request contra `claude/silbato-cero`. Las pruebas se
  ejecutan solas en la pull request.
- **Como colaborador** (puedes subir ramas al repositorio original): pídele
  al dueño que te invite en *Settings → Collaborators*. Llega un correo con
  la invitación; en cuanto la aceptas puedes hacer `git push` de tus ramas.

En los dos casos se trabaja igual: rama por tema y pull request. Nadie
empuja directamente a `claude/silbato-cero`.

## Arrancar

No hay compilación, ni dependencias, ni `npm install`. Son módulos ES nativos.

```bash
git clone https://github.com/menddxxza/menddxxza.git
cd menddxxza
git checkout claude/silbato-cero      # el juego vive en esta rama, en la raíz
python3 -m http.server 8099
# abrir http://localhost:8099
```

Hace falta **Node 18 o superior** sólo para las pruebas, no para jugar.

> Si estás tocando ficheros y el navegador sigue enseñando la versión vieja,
> es el service worker sirviendo de la caché. Recarga con `Ctrl`+`Shift`+`R`,
> o marca «Update on reload» en la pestaña *Application* de las herramientas
> de desarrollo.

## Antes de subir nada

```bash
node test/all.js
```

83 pruebas, sin dependencias, en unos 40 segundos. **Tienen que estar todas
en verde.** Si una falla, el mensaje dice qué esperaba y qué encontró.

```bash
node test/all.js -v     # detalle de cada prueba
node test/run.js 8      # simula 8 partidos y saca las medias por pantalla
```

`test/run.js` es la herramienta para cualquier cambio en el motor: si tocas
faltas, tarjetas o disparos, mira las medias antes y después.

## Las cuatro reglas del proyecto

Son las que mantienen el código manejable. Las pruebas vigilan tres de ellas.

1. **Los textos no viven en la lógica.** Nunca escribas una frase visible
   dentro de un `.js`: va a `i18n/es.js` y `i18n/en.js`, y se usa con
   `t('clave')`. Esto incluye nombres de logros, opciones de diálogo y
   etiquetas de la interfaz. Hay dos pruebas que lo comprueban.
2. **Las reglas no viven en la interfaz.** Todo el criterio arbitral está en
   `src/rules/ruleEngine.js`, en funciones puras. La interfaz pregunta, no
   decide. Si añades una regla, añade también su caso en
   `test/rules.test.js`.
3. **El motor no dibuja.** `matchEngine` emite eventos y la interfaz escucha.
   Si te encuentras importando algo de `ui/` dentro de `match/`, algo va mal.
4. **Los datos no viven en el código.** Clubes, plantillas y competiciones se
   generan desde una semilla; las preguntas de examen y los escenarios son
   datos en `src/data/`.

## Dónde tocar cada cosa

| Quiero… | Voy a… |
|---|---|
| cambiar cuándo es amarilla o roja | `src/rules/ruleEngine.js` |
| cambiar cómo se mueven los jugadores | `src/match/sim.js` |
| cambiar el ritmo del partido, faltas, cambios | `src/match/matchEngine.js` |
| cambiar cómo se ve el campo | `src/ui/renderer.js` |
| cambiar marcador, botones, panel de decisión | `src/ui/hud.js` |
| cambiar cualquier pantalla fuera del partido | `src/ui/screens.js` |
| cambiar la progresión, el dinero o los ascensos | `src/career/career.js` |
| cambiar colores, tipografía o espaciado | `styles/tokens.css` |
| añadir o corregir un texto | `i18n/es.js` + `i18n/en.js` |

## Añadir un idioma

1. Copia `i18n/es.js` a `i18n/fr.js` y traduce los valores.
2. Regístralo en `src/core/i18n.js` (`BUNDLES`).
3. `node test/all.js` avisa de cualquier clave que falte, esté vacía o
   pierda una variable (`{n}`, `{ref}`).

## Añadir un fichero nuevo

Si creas un `.js` o un `.css`, **añádelo también a la lista `SHELL` de
`sw.js`**, o el juego dejará de abrirse sin conexión. Hay una prueba que
falla si se te olvida, así que te enterarás antes de subirlo.

## Estilo de código

No hay linter: el código se lee, no se formatea con una herramienta.

- Dos espacios de indentación, punto y coma, comillas simples.
- Los comentarios explican **por qué**, no qué. Si un número está afinado
  (un umbral, una distancia), el comentario dice de dónde sale.
- Funciones cortas y nombres en castellano o inglés según lo que rodea; lo
  importante es no mezclar dentro del mismo módulo.

## Ramas y commits

- Sal de `claude/silbato-cero` y trabaja en una rama por tema:
  `motor/corners-en-contragolpe`, `ui/pantalla-de-logros`.
- Mensajes de commit en una línea que diga qué cambia de verdad, y un cuerpo
  que explique por qué si no es obvio. En castellano, como el resto.
- Abre una *pull request* contra `claude/silbato-cero`. Las pruebas se
  ejecutan solas y tienen que pasar antes de fusionar.

## Contenido: lo único innegociable

Todo el contenido del juego es **ficticio y original**. No entra en el
repositorio:

- nombres, escudos, equipaciones ni datos de clubes, jugadores o
  competiciones reales;
- assets, código, textos o diseños tomados de otros videojuegos;
- acusaciones a personas reales. El juego representa corrupción **ficticia**;
  esa es la línea y no se cruza.

Si dudas de un nombre porque «suena a alguien», cámbialo.
