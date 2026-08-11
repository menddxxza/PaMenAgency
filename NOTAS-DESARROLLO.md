# Notas de desarrollo — Silbato Cero

Registro honesto del estado del proyecto: qué está hecho de verdad, qué está
hecho en versión funcional pero ampliable, y qué falta.

## Fases completadas

| Fase | Estado | Dónde vive |
|---|---|---|
| 1. Motor de partido 2D | ✔ | `match/sim.js`, `match/state.js` |
| 2. Movimiento de jugadores y balón | ✔ | `match/sim.js` |
| 3. Movimiento del árbitro | ✔ | `matchEngine._moveReferee` |
| 4. Incidentes | ✔ | `match/incidents.js` |
| 5. Decisiones arbitrales | ✔ | `matchEngine`, `ui/hud.js` |
| 6. Reglas | ✔ | `rules/ruleEngine.js` |
| 7. Tarjetas | ✔ | `ruleEngine.evaluateDisciplinaryAction` |
| 8. Goles / penaltis / fuera de juego | ✔ | `matchEngine`, `incidents` |
| 9. VAR + tecnología de línea de gol | ✔ | `match/var.js` |
| 10. Nota del árbitro | ✔ | `match/rating.js` |
| 11. Carrera | ✔ | `career/career.js` |
| 12. Clubes y ligas | ✔ | `data/generators.js` |
| 13. Eventos dinámicos | ✔ | `matchEngine._randomIncidents` |
| 14. Prensa | ✔ | `career/press.js` |
| 15. Syndicate | ✔ | `career/syndicate.js` |
| 16. Economía | ✔ (versión simple, a propósito) | `career/career.js` |
| 17. Logros | ✔ | `career/achievements.js` |
| 18. Pulido visual y sonoro | ✔ base sólida, ampliable | `ui/`, `audio/` |

## Calibración del motor

Medias por partido en Primera División Ibérica (`node test/run.js 8`, árbitro
automático con acierto 72%):

| Métrica | Silbato Cero | Fútbol real (referencia) |
|---|---|---|
| Goles | ~2,4 | 2,7 |
| Faltas | ~21 | 22–26 |
| Amarillas | ~2,8 | 3–5 |
| Rojas | ~0,15 | 0,1–0,2 |
| Penaltis | ~0,4 | 0,25 |
| Fueras de juego | ~4 | 3–5 |
| Córners | ~7,4 | 9–11 |
| Tiros | ~30 | 24–28 |

Los atributos de los futbolistas se comprimen por categoría
(`generators.compressLevel`): sin esa compresión, la Liga Regional producía
partidos sin una sola ocasión.

## Versión funcional pero ampliable

Estas piezas funcionan y están conectadas, pero admiten profundidad:

- **Cambios**: la IA sustituye por cansancio; no hay lectura táctica del
  marcador.
- **Syndicate**: cinco capítulos ramificados. La estructura admite más sin tocar
  código: son datos en `CHAPTERS`.
- **Personalización visual del árbitro**: se elige uniforme, tono de piel,
  cabello y dorsal, pero el sprite 2D sólo refleja el uniforme.
- **Córners**: 7,4 por partido frente a los 9-11 reales. Los bloqueos ya
  existen; falta que los rechaces largos salgan más veces por la línea.

## Cerrado en la revisión del motor

- **Bloqueos y rechaces en el área.** Los defensores tapan el disparo con más
  alcance dentro de su área; un bloqueo puede irse por la línea de fondo
  (córner) o quedar como rechace. De ahí salen también las manos dentro del
  área. Cada jugador tiene un tiempo de espera para no bloquear dos veces el
  mismo balón.
- **Remates de cabeza.** Un balón alto que cae en el área lo disputa quien
  mejor juega de cabeza: dentro, remate a puerta; fuera, despeje. Sin esto los
  córners no producían nada.
- **Barrera y colocación en el balón parado.** Las faltas a menos de 32 m
  forman barrera de 2 a 4 jugadores a 9,15 m, con rematadores y marcadores
  dentro del área; los córners llenan el área. El servicio se ejecuta de
  verdad: centro al área o disparo directo por encima de la barrera.
  Con el balón por alto los defensores saltan en lugar de entrar, que era la
  causa de una plaga de penaltis en los córners.
- **Reiteración de faltas.** El motor cuenta las faltas de cada jugador y a
  partir de la tercera la infracción pasa a ser amonestable, aunque ninguna
  por separado lo fuera (`evaluateDisciplinaryAction`, hecho `persistent`).
- **Pérdida de tiempo.** A partir del minuto 60, el equipo que va ganando
  estira las reanudaciones. Si el retraso se hace descarado llega al árbitro
  como situación propia, con advertencia verbal previa: una segunda demora
  del mismo jugador ya es amarilla (`evaluateTimeWasting`).
- **Economía con gastos.** Coste fijo por jornada que sube con la categoría,
  siete inversiones con efecto real (gimnasio, fisio, coche, piso, curso de
  reglamento, equipamiento y analista de vídeo) con su mantenimiento, libro de
  movimientos y aviso del banco al entrar en números rojos.

## Qué falta

- Idiomas más allá de es/en: la arquitectura ya lo soporta, sólo hay que añadir
  el archivo en `i18n/` y registrarlo en `core/i18n.js`.
- Repetición navegable del partido completo desde el informe final (hoy la
  cronología es una lista; el búfer de repetición existe y lo usa el VAR).
- Mando / táctil: hoy el partido se juega con teclado y ratón.

## Rediseño de interfaz y gráficos

Ejecutado con la disciplina de Hallmark (género *atmospheric*, macroestructura
*Workbench* para la carrera y *Broadcast overlay* para el partido, tema propio
en OKLCH). Registro en `.hallmark/log.json`.

- Todo el color y toda la tipografía salen de `styles/tokens.css`; ni la
  interfaz ni el canvas escriben un valor a mano.
- Tipografía 2+1 con stacks del sistema: display condensada (rótulos),
  sans del sistema (lectura) y mono tabular (reloj, marcador, notas). Sin
  fuentes remotas: el juego funciona sin conexión.
- Estadio dibujado a mano: cuenco de gradas con aforo proporcional, público
  que vibra con el ruido, focos, banquillos, banderines y redes.
- Durante una decisión la cámara se acerca, un foco aísla la jugada y el
  resto del campo se atenúa.
- Atajos `1`–`6` visibles sobre los propios botones de decisión.
- Verificado a 375 px sin scroll horizontal; `prefers-reduced-motion`
  colapsa todas las animaciones.

## Errores corregidos durante el desarrollo

1. **Partidos colgados**: el reanudado tras una interrupción usaba `setTimeout`,
   que nunca se dispara dentro del bucle síncrono de simulación. Ahora se evalúa
   en el propio tick (`_tickStopped`).
2. **19 rojas por partido**: los umbrales de gravedad y el cálculo de brutalidad
   estaban desbocados; también DOGSO y "ataque prometedor" se activaban casi en
   cada falta.
3. **150 faltas por partido**: las entradas se intentaban cada pocos segundos y
   casi todas producían contacto sancionable.
4. **Cero córners**: no existían desvíos, y las paradas devolvían siempre el
   balón al campo.
5. **Partidos sin ocasiones en categorías bajas**: atributos absolutos
   demasiado bajos; resuelto con la compresión por categoría.
6. **Equipaciones indistinguibles**: ahora el visitante cambia de color si
   choca con el local (`state.colorDistance`).
7. **Notas infladas**: un árbitro con la mitad de decisiones falladas sacaba 8,4.
   Se reescaló la nota y se redujo la indulgencia por mala visibilidad.
8. **Examen predecible**: la respuesta correcta caía casi siempre en la misma
   posición. Ahora las opciones se barajan.
9. **HUD visible en el menú**: `HUD.build()` borraba la clase `hidden`.
10. **Equipaciones que seguían confundiéndose**: el umbral de contraste era
    demasiado bajo y la alternativa podía ser otro tono cercano. Ahora se
    recorre una lista de candidatos hasta garantizar separación; verificado
    sobre los 380 emparejamientos de Primera.
11. **Etiquetas sin traducir en el informe** (`advantage`, `management`) y
    decisiones mostradas con su nombre interno (`challenge → foul`). Ahora
    todo pasa por `t()` y se lee en lenguaje de árbitro.
