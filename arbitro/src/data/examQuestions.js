// Banco de preguntas de la academia. Cada pregunta lleva su explicación:
// el jugador debe entender POR QUÉ, no memorizar.

export const EXAM_TOPICS = [
  'offside', 'handball', 'fouls', 'cards', 'advantage', 'penalty', 'restarts', 'conduct', 'var',
];

export const QUESTIONS = [
  {
    topic: 'offside', es: {
      q: 'Un atacante en posición de fuera de juego recibe el balón directamente de un saque de banda de su compañero.',
      options: ['Fuera de juego', 'El juego sigue', 'Libre indirecto para la defensa', 'Balón a tierra'],
      correct: 1,
      why: 'No hay fuera de juego cuando el balón se recibe directamente de un saque de banda, de puerta o de esquina.',
    },
    en: {
      q: 'An attacker in an offside position receives the ball directly from a team-mate’s throw-in.',
      options: ['Offside', 'Play on', 'Indirect free kick to the defence', 'Dropped ball'],
      correct: 1,
      why: 'There is no offside from a throw-in, goal kick or corner kick.',
    },
  },
  {
    topic: 'offside', es: {
      q: 'Un atacante en posición antirreglamentaria no toca el balón, pero corre hacia él tapando la visión del portero.',
      options: ['El juego sigue', 'Fuera de juego por interferir', 'Sólo si toca el balón', 'Tarjeta amarilla'],
      correct: 1,
      why: 'Interferir a un adversario (tapar la visión o disputarle el balón) desde posición antirreglamentaria es sancionable aunque no se toque el balón.',
    },
    en: {
      q: 'An attacker in an offside position does not touch the ball but blocks the goalkeeper’s line of vision.',
      options: ['Play on', 'Offside for interfering', 'Only if he touches the ball', 'Yellow card'],
      correct: 1,
      why: 'Interfering with an opponent — including obstructing his line of vision — is punishable even without touching the ball.',
    },
  },
  {
    topic: 'offside', es: {
      q: 'Un defensor despeja voluntariamente hacia un atacante que estaba en posición antirreglamentaria.',
      options: ['Fuera de juego', 'El juego sigue', 'Balón a tierra', 'Libre indirecto'],
      correct: 1,
      why: 'Un despeje deliberado de un defensor (que no sea un rechace ni una parada) reinicia la jugada: no hay infracción.',
    },
    en: {
      q: 'A defender deliberately plays the ball to an attacker who was in an offside position.',
      options: ['Offside', 'Play on', 'Dropped ball', 'Indirect free kick'],
      correct: 1,
      why: 'A deliberate play by a defender (not a deflection or save) resets the phase: there is no offence.',
    },
  },
  {
    topic: 'handball', es: {
      q: 'El balón golpea el brazo de un defensor pegado al cuerpo tras rebotar en su propia rodilla, dentro del área.',
      options: ['Penalti', 'No es infracción', 'Penalti y amarilla', 'Libre indirecto'],
      correct: 1,
      why: 'El brazo en posición natural y el rebote en el propio cuerpo hacen que el contacto no sea sancionable.',
    },
    en: {
      q: 'The ball hits a defender’s arm, held against his body, after deflecting off his own knee inside the area.',
      options: ['Penalty', 'No offence', 'Penalty and yellow card', 'Indirect free kick'],
      correct: 1,
      why: 'An arm in a natural position plus a deflection off the player’s own body means no offence.',
    },
  },
  {
    topic: 'handball', es: {
      q: 'Un atacante marca gol tras controlar el balón con la mano de forma involuntaria.',
      options: ['Gol válido', 'Gol anulado', 'Gol y amarilla', 'Gol si no fue deliberado'],
      correct: 1,
      why: 'Un gol marcado con la mano o el brazo se anula siempre, aunque sea accidental.',
    },
    en: {
      q: 'An attacker scores after accidentally controlling the ball with his hand.',
      options: ['Goal stands', 'Goal disallowed', 'Goal and yellow card', 'Goal if not deliberate'],
      correct: 1,
      why: 'A goal scored with the hand or arm is always disallowed, even if accidental.',
    },
  },
  {
    topic: 'handball', es: {
      q: 'Un defensor bloquea un centro con el brazo claramente separado del cuerpo, aumentando su superficie.',
      options: ['No es infracción', 'Infracción sancionable', 'Sólo si mira el balón', 'Balón a tierra'],
      correct: 1,
      why: 'Hacer el cuerpo antinaturalmente más grande con el brazo es infracción, aunque no haya intención.',
    },
    en: {
      q: 'A defender blocks a cross with his arm clearly away from the body, making himself bigger.',
      options: ['No offence', 'Punishable offence', 'Only if he looks at the ball', 'Dropped ball'],
      correct: 1,
      why: 'Making the body unnaturally bigger is an offence even without intent.',
    },
  },
  {
    topic: 'fouls', es: {
      q: 'Un defensor llega tarde, juega primero el balón y después arrolla al rival con fuerza excesiva.',
      options: ['No hay falta: jugó el balón', 'Falta y roja', 'Falta sin tarjeta', 'Amarilla por temeraria'],
      correct: 1,
      why: 'Jugar el balón no protege una entrada con fuerza excesiva que pone en peligro la integridad del rival.',
    },
    en: {
      q: 'A defender wins the ball first but then follows through with excessive force.',
      options: ['No foul: he played the ball', 'Foul and red card', 'Foul, no card', 'Yellow for recklessness'],
      correct: 1,
      why: 'Playing the ball does not excuse a challenge using excessive force that endangers an opponent.',
    },
  },
  {
    topic: 'fouls', es: {
      q: 'Dos jugadores disputan un balón hombro con hombro dentro de la distancia de juego.',
      options: ['Carga legal', 'Falta del defensor', 'Falta del atacante', 'Juego peligroso'],
      correct: 0,
      why: 'La carga hombro con hombro, con el balón en disputa y sin uso excesivo de la fuerza, es legal.',
    },
    en: {
      q: 'Two players challenge shoulder to shoulder within playing distance of the ball.',
      options: ['Fair charge', 'Foul by the defender', 'Foul by the attacker', 'Dangerous play'],
      correct: 0,
      why: 'A shoulder-to-shoulder charge with the ball in playing distance and no excessive force is legal.',
    },
  },
  {
    topic: 'cards', es: {
      q: 'Un defensor derriba dentro del área a un atacante que iba solo hacia la portería, intentando jugar el balón.',
      options: ['Penalti y roja', 'Penalti y amarilla', 'Sólo penalti', 'Roja sin penalti'],
      correct: 1,
      why: 'Si el defensor intenta jugar el balón dentro del área, la roja por ocasión manifiesta se atenúa a amarilla.',
    },
    en: {
      q: 'A defender fouls an attacker heading for goal inside the area, while attempting to play the ball.',
      options: ['Penalty and red', 'Penalty and yellow', 'Penalty only', 'Red without penalty'],
      correct: 1,
      why: 'If the defender attempts to play the ball inside the area, the DOGSO red is reduced to a caution.',
    },
  },
  {
    topic: 'cards', es: {
      q: 'Un jugador ya amonestado retrasa deliberadamente la reanudación del juego.',
      options: ['Advertencia verbal', 'Segunda amarilla y expulsión', 'Roja directa', 'Nada: no es sancionable'],
      correct: 1,
      why: 'Impedir la reanudación es amonestable; al ser la segunda amarilla implica la expulsión.',
    },
    en: {
      q: 'An already-cautioned player deliberately delays the restart of play.',
      options: ['Verbal warning', 'Second yellow and send off', 'Straight red', 'Nothing: not punishable'],
      correct: 1,
      why: 'Delaying the restart is a cautionable offence; as a second caution it means a sending off.',
    },
  },
  {
    topic: 'advantage', es: {
      q: 'Hay una entrada con fuerza excesiva, pero el equipo agredido mantiene el balón en ataque.',
      options: ['Dar ventaja siempre', 'Parar el juego y expulsar', 'Dar ventaja y no sancionar', 'Amonestar y seguir'],
      correct: 1,
      why: 'Ante una acción de fuerza excesiva o violenta, el juego se detiene: la seguridad prevalece sobre la ventaja.',
    },
    en: {
      q: 'There is a challenge using excessive force, but the fouled team keeps the ball going forward.',
      options: ['Always play advantage', 'Stop play and send off', 'Play advantage, no sanction', 'Caution and play on'],
      correct: 1,
      why: 'With excessive force or violent conduct, play is stopped: safety comes before advantage.',
    },
  },
  {
    topic: 'advantage', es: {
      q: 'Se señala ventaja y en tres segundos el ataque se pierde por completo.',
      options: ['No se puede volver atrás', 'Volver a la falta original', 'Balón a tierra', 'Saque de banda'],
      correct: 1,
      why: 'Si la ventaja no se materializa en unos segundos, se vuelve a la infracción original.',
    },
    en: {
      q: 'Advantage is signalled and within three seconds the attack breaks down completely.',
      options: ['You cannot go back', 'Return to the original foul', 'Dropped ball', 'Throw-in'],
      correct: 1,
      why: 'If the advantage does not materialise within a few seconds, play returns to the original offence.',
    },
  },
  {
    topic: 'penalty', es: {
      q: 'Un atacante se deja caer dentro del área sin que exista contacto.',
      options: ['Penalti', 'Libre indirecto para la defensa y amarilla', 'Balón a tierra', 'Nada'],
      correct: 1,
      why: 'La simulación se sanciona con libre indirecto para el rival y amonestación por conducta antideportiva.',
    },
    en: {
      q: 'An attacker goes down inside the area with no contact whatsoever.',
      options: ['Penalty', 'Indirect free kick to the defence and a caution', 'Dropped ball', 'Nothing'],
      correct: 1,
      why: 'Simulation is punished with an indirect free kick to the opponents and a caution for unsporting behaviour.',
    },
  },
  {
    topic: 'restarts', es: {
      q: 'El balón sale por la línea de meta tras tocar por última vez en un defensor.',
      options: ['Saque de puerta', 'Saque de esquina', 'Saque de banda', 'Balón a tierra'],
      correct: 1,
      why: 'Si el último toque es de un defensor, la reanudación es saque de esquina para el equipo atacante.',
    },
    en: {
      q: 'The ball leaves over the goal line after last touching a defender.',
      options: ['Goal kick', 'Corner kick', 'Throw-in', 'Dropped ball'],
      correct: 1,
      why: 'If a defender touched it last, the restart is a corner kick for the attacking team.',
    },
  },
  {
    topic: 'conduct', es: {
      q: 'Un entrenador protesta repetidamente y invade el terreno de juego para reclamar.',
      options: ['Ignorarlo', 'Amonestarlo y, si insiste, expulsarlo del área técnica', 'Suspender el partido', 'Amarilla a un jugador'],
      correct: 1,
      why: 'Los oficiales de equipo también reciben tarjetas; la reiteración lleva a la expulsión del área técnica.',
    },
    en: {
      q: 'A coach protests repeatedly and enters the field of play to complain.',
      options: ['Ignore him', 'Caution him and, if he persists, send him from the technical area', 'Abandon the match', 'Yellow card a player'],
      correct: 1,
      why: 'Team officials receive cards too; repeated offences lead to being sent from the technical area.',
    },
  },
  {
    topic: 'var', es: {
      q: '¿Cuál de estas situaciones NO es revisable por el VAR?',
      options: ['Gol / no gol', 'Segunda tarjeta amarilla', 'Penalti / no penalti', 'Identidad equivocada'],
      correct: 1,
      why: 'El VAR revisa gol, penalti, roja directa e identidad equivocada. Una segunda amarilla no es revisable.',
    },
    en: {
      q: 'Which of these is NOT reviewable by VAR?',
      options: ['Goal / no goal', 'Second yellow card', 'Penalty / no penalty', 'Mistaken identity'],
      correct: 1,
      why: 'VAR covers goals, penalties, direct red cards and mistaken identity. A second caution is not reviewable.',
    },
  },
  {
    topic: 'var', es: {
      q: 'El VAR avisa de un posible error claro. ¿Quién toma la decisión final?',
      options: ['El VAR', 'El árbitro principal', 'El cuarto árbitro', 'El asistente'],
      correct: 1,
      why: 'El VAR sólo asiste y recomienda: la decisión final es siempre del árbitro principal.',
    },
    en: {
      q: 'VAR flags a possible clear error. Who takes the final decision?',
      options: ['The VAR', 'The referee', 'The fourth official', 'The assistant'],
      correct: 1,
      why: 'VAR only assists and recommends: the final decision always belongs to the referee.',
    },
  },
  {
    topic: 'conduct', es: {
      q: 'Se detecta un cántico discriminatorio masivo en la grada.',
      options: ['Continuar el partido', 'Aplicar el protocolo por pasos: parar, avisar, y suspender si persiste', 'Suspender de inmediato', 'Expulsar al capitán'],
      correct: 1,
      why: 'El protocolo tiene tres pasos: detener el juego y avisar, suspender temporalmente y, si persiste, suspender definitivamente.',
    },
    en: {
      q: 'Mass discriminatory chanting is detected in the stands.',
      options: ['Play on', 'Apply the three-step protocol: stop, announce, abandon if it persists', 'Abandon immediately', 'Send off the captain'],
      correct: 1,
      why: 'The protocol has three steps: stop play and announce, suspend temporarily and, if it persists, abandon the match.',
    },
  },
];

export function questionsFor(topic) {
  return QUESTIONS.filter((q) => q.topic === topic);
}
