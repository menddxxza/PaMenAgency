# SILBATO CERO

Simulador 2D de carrera arbitral. No controlas a los futbolistas: controlas al
árbitro. El partido se juega solo, en tiempo real, y tú decides.

Todo el contenido —clubes, jugadores, entrenadores, estadios, competiciones y
narrativa— es **ficticio y original**. No se usan marcas, escudos, nombres ni
assets de terceros.

## Cómo jugarlo

No hay compilación ni dependencias: son módulos ES nativos.

```bash
cd arbitro
python3 -m http.server 8099     # o cualquier servidor estático
# abrir http://localhost:8099
```

(Debe servirse por HTTP, no con `file://`, por las restricciones de módulos ES.)

### Controles

| Tecla | Acción |
|---|---|
| `WASD` / flechas | mover al árbitro |
| `SHIFT` | esprintar (consume físico) |
| `ESPACIO` | pausa |
| `C` | cámara fija / cámara que sigue el balón |
| `1`–`6` | elegir opción durante una decisión |

Tu **posición importa**: la distancia, el ángulo y los cuerpos interpuestos
determinan lo que realmente ves, y por tanto tu probabilidad de acertar.

## Pruebas

```bash
node test/run.js 8     # simula 8 partidos completos sin interfaz y valida medias
```

Comprueba que los partidos terminan, que las medias (goles, faltas, tarjetas,
córners, fueras de juego) están en rangos creíbles y que las notas son coherentes.

## Arquitectura

```
arbitro/
├── index.html            punto de entrada
├── styles/tokens.css     sistema de diseño (color OKLCH, tipografía, espacio)
├── styles/main.css       estilo propio, construido sólo sobre tokens
├── i18n/                 es.js · en.js  (ningún texto vive en la lógica)
├── test/run.js           banco de pruebas headless
└── src/
    ├── core/             rng (semillas) · events · config · i18n · save
    ├── data/             names · generators · formations · examQuestions · scenarios
    ├── rules/            ruleEngine.js  ← todo el criterio reglamentario
    ├── match/            state · sim · incidents · matchEngine · rating · var · assistants
    ├── ai/               autoReferee (partidos sin jugador)
    ├── career/           career · referee · academy · press · achievements · syndicate
    ├── ui/               renderer · hud · screens
    ├── audio/            audio.js (WebAudio, sin ficheros)
    └── game.js           controlador y máquina de estados
```

Reglas de diseño que se respetan en todo el proyecto:

- **Los datos no viven en el código.** Clubes, plantillas y competiciones se
  generan desde una semilla (`generateWorld`), y las preguntas de examen y los
  escenarios son datos.
- **Las reglas no viven en la interfaz.** `ruleEngine.js` es el único sitio con
  criterio arbitral: `evaluateFoul`, `evaluateHandball`, `evaluateOffside`,
  `evaluatePenalty`, `evaluateAdvantage`, `evaluateDisciplinaryAction`,
  `evaluateRestart`, `evaluateGoal`, `gradeDecision`, `varShouldIntervene`.
- **El motor no dibuja.** `matchEngine` emite eventos; la UI escucha.
- **Los textos no viven en la lógica.** Siempre `t('clave')`.

## Qué simula

### Partido

Los 22 jugadores y el balón se simulan en metros sobre un campo de 105×68 con
paso fijo. Cada equipo tiene formación, estilo, presión, anchura, ritmo y
agresividad; los jugadores tienen atributos y personalidad (agresividad,
disciplina, simulación, temperamento, profesionalidad) y un estado emocional que
cambia durante el partido.

Los incidentes **emergen del juego**: un duelo se resuelve por atributos,
velocidad y estado del terreno, y de ahí sale —o no— una infracción. No hay
`randomEvent()` cada X segundos.

### Decisión

Cada incidente lleva una *verdad* reglamentaria oculta y una *claridad* calculada
a partir de tu posición. La botonera cambia según la situación: dentro del área
no se ofrece lo mismo que en el centro del campo.

La calificación es matizada: acertar la falta y fallar la tarjeta no es lo mismo
que inventarse un penalti. Cuatro niveles: correcta, mayormente correcta,
discutible, incorrecta.

### Sistemas implementados

Ventaja real (con memoria del infractor para amonestarlo después) · tarjetas con
advertencia verbal previa · manos evaluadas por posición del brazo, distancia y
naturalidad · fuera de juego con asistentes falibles que pueden dudar · VAR con
cuatro cámaras, control de reproducción fotograma a fotograma, línea de fuera de
juego y protocolo de error claro y manifiesto · tecnología de línea de gol ·
bloqueos y rechaces dentro del área · remates de cabeza · barrera a 9,15 m en
las faltas y área llena en los córners · reiteración de faltas · pérdida de
tiempo del equipo que va ganando ·
lesiones y equipo médico · sustituciones · descuento calculado dinámicamente
(sin cortar una ocasión clara) · prórroga y tanda de penaltis · protestas de
jugadores y entrenadores según personalidad · eventos de estadio (tangana,
objetos, apagón, tormenta, cánticos discriminatorios) con protocolo y posible
suspensión · clima que afecta al balón, a los resbalones y a la visibilidad.

### Carrera

Nueve categorías, de la Liga Regional Iberania al Campeonato Mundial, con más de
100 clubes y 16 selecciones. Cada jornada eliges entre designaciones con su
presión, dificultad, rivalidad, honorarios y experiencia.

Economía con dos caras: honorarios por partido frente a un coste fijo por
jornada que crece con la categoría, y siete inversiones con efecto real
(gimnasio, fisio, coche, piso, curso de reglamento, equipamiento y analista de
vídeo). Nota, reputación, experiencia, condición física y diez atributos que
suben entrenando y arbitrando. Ascensos y descensos por rendimiento sostenido,
condicionados a aprobar los exámenes de la academia. Prensa que titula según lo
que pasó de verdad, ruedas de prensa, blog con audiencia, supervisor arbitral,
decisiones éticas, modo Syndicate ramificado y ocho finales distintos.

### Modos

Carrera oficial · Syndicate · Classic (partido suelto configurable) · Escenarios
· Partidos históricos · Academia · Tutorial.

## Dificultad

`Fácil · Normal · Difícil · Experto · Realista`. Al subir: incidentes más
ambiguos, asistentes menos fiables, menos pistas (en Realista, ninguna), menos
tiempo para decidir, más presión y nota más exigente.

## Sistema de diseño

`styles/tokens.css` es la única fuente de color, tipografía, espacio y
movimiento. Ni la interfaz ni el renderizador de canvas escriben un color a
mano: el césped, las líneas y la noche del estadio salen de los mismos tokens
que los paneles, así que nunca se desincronizan.

- **Paleta** OKLCH anclada en `oklch(15% .018 250)` (noche azulada bajo focos)
  con un único acento cálido, `oklch(80% .15 78)`, el ámbar del silbato.
- **Tipografía 2+1**: display sans condensada para rótulos de retransmisión,
  sans del sistema para lectura y monoespaciada tabular para reloj, marcador y
  notas. Todo son stacks del sistema: el juego funciona sin conexión.
- **Movimiento**: tres curvas nombradas, sólo `transform` y `opacity`, y
  colapso completo bajo `prefers-reduced-motion`.
- Durante una decisión el campo se atenúa y un foco cae sobre la jugada: la
  vista acompaña a la decisión en lugar de competir con ella.

## Estado

Jugable de principio a fin. Lo que falta por pulir está anotado en
`NOTAS-DESARROLLO.md`.
