// Escenarios y partidos históricos ficticios: situaciones concretas que el
// jugador debe resolver. Todos arrancan el motor real, no son guiones.

export const SCENARIOS = [
  {
    id: 'lastMinutePenalty',
    name: 'Minuto 90, 1-1, el área hierve',
    desc: 'Empate a uno en el descuento. Cualquier contacto en el área decidirá el partido.',
    startMinute: 88, half: 2, score: [1, 1], importance: 88, rivalry: 60,
    weather: 'rain', divisionId: 'primera', knockout: false,
    goal: 'Termina el partido con nota 7 o superior.', targetRating: 7,
  },
  {
    id: 'derbyCards',
    name: 'Derbi: cinco amarillas en veinte minutos',
    desc: 'Un derbi descontrolado desde el pitido inicial. Recupera el control sin arruinar el partido.',
    startMinute: 20, half: 1, score: [0, 0], importance: 95, rivalry: 98,
    weather: 'clear', divisionId: 'primera', preCards: 5,
    goal: 'Llega al final sin suspender el encuentro y con control alto.', targetRating: 6.5,
  },
  {
    id: 'lateOffsideGoal',
    name: 'Gol en el 94 con posible fuera de juego',
    desc: 'Última jugada. Si entra, cambia la eliminatoria. El asistente duda.',
    startMinute: 92, half: 2, score: [0, 1], importance: 92, rivalry: 40,
    weather: 'storm', divisionId: 'continental', knockout: true,
    goal: 'Resuelve correctamente la jugada decisiva.', targetRating: 7.5,
  },
  {
    id: 'continentalRed',
    name: 'Final continental, minuto 87, posible roja',
    desc: 'Una final igualada y una entrada al límite. La decisión te marcará la carrera.',
    startMinute: 85, half: 2, score: [1, 1], importance: 100, rivalry: 70,
    weather: 'clear', divisionId: 'continental', knockout: true,
    goal: 'Acierta la sanción disciplinaria y termina con nota 7.5.', targetRating: 7.5,
  },
  {
    id: 'divingStriker',
    name: 'El delantero que siempre se cae',
    desc: 'Un ariete especialista en buscar el penalti. No te dejes engañar dos veces.',
    startMinute: 0, half: 1, score: [0, 0], importance: 60, rivalry: 30,
    weather: 'clear', divisionId: 'segunda', diveBoost: 2.6,
    goal: 'Detecta las simulaciones sin inventarte penaltis.', targetRating: 7,
  },
];

export const HISTORIC = [
  {
    id: 'final1998',
    name: 'Final Continental 1998',
    desc: 'La final que nadie quiso arbitrar. Dos escuelas opuestas y un estadio a reventar.',
    startMinute: 0, half: 1, score: [0, 0], importance: 100, rivalry: 85,
    weather: 'clear', divisionId: 'continental', knockout: true,
    goal: 'Sobrevive a los 120 minutos con nota 8.', targetRating: 8,
  },
  {
    id: 'rainSemi',
    name: 'Semifinal bajo la lluvia',
    desc: 'Diluvio, campo encharcado y un balón imposible de controlar.',
    startMinute: 0, half: 1, score: [0, 0], importance: 88, rivalry: 55,
    weather: 'storm', divisionId: 'europa', knockout: true,
    goal: 'Mantén el criterio pese al terreno.', targetRating: 7.2,
  },
  {
    id: 'fiveReds',
    name: 'El partido de las cinco expulsiones',
    desc: 'Se recuerda como la noche más violenta de la categoría. ¿Habrías hecho lo mismo?',
    startMinute: 0, half: 1, score: [0, 0], importance: 80, rivalry: 100,
    weather: 'wind', divisionId: 'segunda', aggressionBoost: 1.7,
    goal: 'Termina el encuentro sin suspenderlo.', targetRating: 6.5,
  },
  {
    id: 'snowDerby',
    name: 'Derbi en la nieve',
    desc: 'Las líneas apenas se ven. Un partido que se decide por lo que puedas distinguir.',
    startMinute: 0, half: 1, score: [0, 0], importance: 84, rivalry: 92,
    weather: 'snow', divisionId: 'primera',
    goal: 'Acierta más del 70% de las decisiones.', targetRating: 7,
  },
];

export function allSpecials() {
  return [...SCENARIOS.map((s) => ({ ...s, kind: 'scenario' })),
    ...HISTORIC.map((s) => ({ ...s, kind: 'historic' }))];
}

export function findSpecial(id) {
  return allSpecials().find((s) => s.id === id) || null;
}
