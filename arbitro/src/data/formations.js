// Formaciones: posiciones base normalizadas.
// x: 0 = línea de gol propia, 1 = línea de gol rival. y: 0 = banda izq, 1 = banda der.

export const FORMATIONS = {
  '4-4-2': [
    { role: 'GK', x: 0.04, y: 0.5 },
    { role: 'DF', x: 0.22, y: 0.16 }, { role: 'DF', x: 0.18, y: 0.38 },
    { role: 'DF', x: 0.18, y: 0.62 }, { role: 'DF', x: 0.22, y: 0.84 },
    { role: 'MF', x: 0.45, y: 0.14 }, { role: 'MF', x: 0.42, y: 0.4 },
    { role: 'MF', x: 0.42, y: 0.6 }, { role: 'MF', x: 0.45, y: 0.86 },
    { role: 'FW', x: 0.7, y: 0.4 }, { role: 'FW', x: 0.7, y: 0.6 },
  ],
  '4-3-3': [
    { role: 'GK', x: 0.04, y: 0.5 },
    { role: 'DF', x: 0.24, y: 0.14 }, { role: 'DF', x: 0.18, y: 0.38 },
    { role: 'DF', x: 0.18, y: 0.62 }, { role: 'DF', x: 0.24, y: 0.86 },
    { role: 'MF', x: 0.4, y: 0.5 }, { role: 'MF', x: 0.5, y: 0.32 },
    { role: 'MF', x: 0.5, y: 0.68 },
    { role: 'FW', x: 0.72, y: 0.16 }, { role: 'FW', x: 0.76, y: 0.5 },
    { role: 'FW', x: 0.72, y: 0.84 },
  ],
  '4-2-3-1': [
    { role: 'GK', x: 0.04, y: 0.5 },
    { role: 'DF', x: 0.24, y: 0.14 }, { role: 'DF', x: 0.18, y: 0.38 },
    { role: 'DF', x: 0.18, y: 0.62 }, { role: 'DF', x: 0.24, y: 0.86 },
    { role: 'MF', x: 0.36, y: 0.4 }, { role: 'MF', x: 0.36, y: 0.6 },
    { role: 'MF', x: 0.58, y: 0.18 }, { role: 'MF', x: 0.56, y: 0.5 },
    { role: 'MF', x: 0.58, y: 0.82 },
    { role: 'FW', x: 0.76, y: 0.5 },
  ],
  '5-3-2': [
    { role: 'GK', x: 0.04, y: 0.5 },
    { role: 'DF', x: 0.28, y: 0.1 }, { role: 'DF', x: 0.16, y: 0.3 },
    { role: 'DF', x: 0.14, y: 0.5 }, { role: 'DF', x: 0.16, y: 0.7 },
    { role: 'DF', x: 0.28, y: 0.9 },
    { role: 'MF', x: 0.42, y: 0.3 }, { role: 'MF', x: 0.4, y: 0.5 },
    { role: 'MF', x: 0.42, y: 0.7 },
    { role: 'FW', x: 0.68, y: 0.4 }, { role: 'FW', x: 0.68, y: 0.6 },
  ],
  '3-5-2': [
    { role: 'GK', x: 0.04, y: 0.5 },
    { role: 'DF', x: 0.18, y: 0.3 }, { role: 'DF', x: 0.16, y: 0.5 },
    { role: 'DF', x: 0.18, y: 0.7 },
    { role: 'MF', x: 0.46, y: 0.08 }, { role: 'MF', x: 0.4, y: 0.35 },
    { role: 'MF', x: 0.38, y: 0.5 }, { role: 'MF', x: 0.4, y: 0.65 },
    { role: 'MF', x: 0.46, y: 0.92 },
    { role: 'FW', x: 0.72, y: 0.42 }, { role: 'FW', x: 0.72, y: 0.58 },
  ],
};

export const FORMATION_IDS = Object.keys(FORMATIONS);

export const STYLES = {
  possession:   { tempo: 0.85, width: 0.9, press: 0.6, directness: 0.25, aggression: 0.45 },
  direct:       { tempo: 1.15, width: 0.7, press: 0.55, directness: 0.8,  aggression: 0.6 },
  counter:      { tempo: 1.05, width: 0.6, press: 0.35, directness: 0.7,  aggression: 0.55 },
  highPress:    { tempo: 1.1,  width: 0.85, press: 0.95, directness: 0.5, aggression: 0.75 },
  lowBlock:     { tempo: 0.8,  width: 0.5, press: 0.25, directness: 0.6,  aggression: 0.7 },
  balanced:     { tempo: 1.0,  width: 0.75, press: 0.55, directness: 0.5, aggression: 0.5 },
};

export const STYLE_IDS = Object.keys(STYLES);
