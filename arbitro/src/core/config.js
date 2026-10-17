// Constantes globales y perfiles de dificultad.

export const GAME = {
  id: 'silbato-zero',
  name: 'SILBATO CERO',
  tagline: 'Simulador de carrera arbitral',
  version: '0.9.0',
  saveKey: 'silbato-zero:saves',
};

// Dimensiones reales del campo, en metros. Todo el motor trabaja en metros.
export const FIELD = {
  length: 105,
  width: 68,
  goalWidth: 7.32,
  goalDepth: 2.0,
  penaltyAreaLength: 16.5,
  penaltyAreaWidth: 40.32,
  goalAreaLength: 5.5,
  goalAreaWidth: 18.32,
  centreCircle: 9.15,
  penaltySpot: 11,
};

export const SIM = {
  dt: 1 / 30,            // paso fijo de simulación (s)
  matchSecondsPerTick: 1 / 30 * 6, // 6x: 90' de partido ≈ 15' reales a 1x
  maxSubsPerTeam: 5,
};

export const DIFFICULTY = {
  easy: {
    id: 'easy', label: 'difficulty.easy',
    ambiguity: 0.45,        // cuánto se solapan las situaciones dudosas
    assistantAccuracy: 1.15, // multiplicador de acierto del asistente
    hintLevel: 2,           // 2 = pistas completas, 1 = parciales, 0 = ninguna
    pressure: 0.7,
    protestRate: 0.7,
    simulationRate: 0.6,
    ratingHarshness: 0.7,
    decisionTime: 9,        // segundos para decidir
    showTruthBefore: true,
  },
  normal: {
    id: 'normal', label: 'difficulty.normal',
    ambiguity: 0.7, assistantAccuracy: 1.0, hintLevel: 1, pressure: 1,
    protestRate: 1, simulationRate: 1, ratingHarshness: 1, decisionTime: 7,
    showTruthBefore: false,
  },
  hard: {
    id: 'hard', label: 'difficulty.hard',
    ambiguity: 0.9, assistantAccuracy: 0.9, hintLevel: 1, pressure: 1.25,
    protestRate: 1.25, simulationRate: 1.3, ratingHarshness: 1.15, decisionTime: 6,
    showTruthBefore: false,
  },
  expert: {
    id: 'expert', label: 'difficulty.expert',
    ambiguity: 1.1, assistantAccuracy: 0.8, hintLevel: 0, pressure: 1.5,
    protestRate: 1.5, simulationRate: 1.5, ratingHarshness: 1.3, decisionTime: 5,
    showTruthBefore: false,
  },
  realistic: {
    id: 'realistic', label: 'difficulty.realistic',
    ambiguity: 1.25, assistantAccuracy: 0.72, hintLevel: 0, pressure: 1.7,
    protestRate: 1.6, simulationRate: 1.6, ratingHarshness: 1.4, decisionTime: 4.5,
    showTruthBefore: false,
  },
};

export const WEATHER = {
  clear:  { id: 'clear',  ballFriction: 1.0,  slip: 0.02, visibility: 1.0,  stamina: 1.0 },
  rain:   { id: 'rain',   ballFriction: 0.93, slip: 0.07, visibility: 0.95, stamina: 1.05 },
  storm:  { id: 'storm',  ballFriction: 0.88, slip: 0.13, visibility: 0.78, stamina: 1.15 },
  wind:   { id: 'wind',   ballFriction: 1.05, slip: 0.03, visibility: 0.97, stamina: 1.05 },
  snow:   { id: 'snow',   ballFriction: 0.8,  slip: 0.16, visibility: 0.7,  stamina: 1.2 },
  heat:   { id: 'heat',   ballFriction: 1.02, slip: 0.02, visibility: 1.0,  stamina: 1.25 },
};

export const REF_STATS = [
  'accuracy', 'positioning', 'fitness', 'communication',
  'control', 'discipline', 'concentration', 'rules', 'pressure', 'var',
];
