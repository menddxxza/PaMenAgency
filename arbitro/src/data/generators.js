// Generación procedural del mundo: clubes, plantillas, entrenadores,
// estadios, competiciones y equipo arbitral. Todo desde una semilla.

import { RNG, clamp } from '../core/rng.js';
import {
  NATIONS, CITIES, CLUB_PREFIX, CLUB_SUFFIX, STADIUM_PREFIX, STADIUM_NAME,
  FIRST_NAMES, FIRST_NAMES_F, LAST_NAMES, NICKNAMES, COMPETITION_NAMES,
} from './names.js';
import { FORMATION_IDS, STYLE_IDS } from './formations.js';

const KIT_PALETTE = [
  ['#e63946', '#ffffff'], ['#1d3557', '#f1faee'], ['#2a9d8f', '#264653'],
  ['#f4a261', '#22223b'], ['#6a4c93', '#f7ede2'], ['#0b3954', '#bfd7ea'],
  ['#38b000', '#ffffff'], ['#ffbe0b', '#1b1b1e'], ['#8d99ae', '#2b2d42'],
  ['#d90429', '#2b2d42'], ['#390099', '#ff5400'], ['#007f5f', '#ffff3f'],
  ['#9d0208', '#ffba08'], ['#03045e', '#90e0ef'], ['#3a0ca3', '#f72585'],
  ['#212529', '#adb5bd'], ['#5f0f40', '#fb8b24'], ['#004b23', '#ccff33'],
];

export const DIVISIONS = [
  { id: 'regional',  tier: 1, name: COMPETITION_NAMES.regional,  level: 22, fee: 90,   xp: 45,  clubs: 16, var: false, assistants: 2 },
  { id: 'preferente',tier: 2, name: COMPETITION_NAMES.preferente,level: 34, fee: 160,  xp: 55,  clubs: 16, var: false, assistants: 2 },
  { id: 'tercera',   tier: 3, name: COMPETITION_NAMES.tercera,   level: 46, fee: 320,  xp: 70,  clubs: 18, var: false, assistants: 2 },
  { id: 'segundaB',  tier: 4, name: COMPETITION_NAMES.segundaB,  level: 56, fee: 620,  xp: 85,  clubs: 18, var: false, assistants: 2 },
  { id: 'segunda',   tier: 5, name: COMPETITION_NAMES.segunda,   level: 66, fee: 1400, xp: 105, clubs: 20, var: true,  assistants: 2 },
  { id: 'primera',   tier: 6, name: COMPETITION_NAMES.primera,   level: 78, fee: 4200, xp: 130, clubs: 20, var: true,  assistants: 2 },
  { id: 'copa',      tier: 6, name: COMPETITION_NAMES.copa,      level: 74, fee: 3800, xp: 125, clubs: 0,  var: true,  assistants: 2, cup: true },
  { id: 'europa',    tier: 7, name: COMPETITION_NAMES.europa,    level: 86, fee: 9000, xp: 165, clubs: 0,  var: true,  assistants: 2, cup: true },
  { id: 'continental',tier: 8,name: COMPETITION_NAMES.continental,level: 92,fee: 15000,xp: 200, clubs: 0,  var: true,  assistants: 2, cup: true },
  { id: 'mundial',   tier: 9, name: COMPETITION_NAMES.mundial,   level: 97, fee: 26000,xp: 260, clubs: 0,  var: true,  assistants: 2, cup: true, national: true },
];

export function divisionById(id) {
  return DIVISIONS.find((d) => d.id === id) || DIVISIONS[0];
}

function personName(rng, gender = 'm') {
  const pool = gender === 'f' ? FIRST_NAMES_F : FIRST_NAMES;
  return { first: rng.pick(pool), last: rng.pick(LAST_NAMES) };
}

let _uid = 1;
export function uid(prefix = 'e') { return `${prefix}${_uid++}`; }
export function resetUid() { _uid = 1; }

// ---------------------------------------------------------------- jugadores

const ROLE_PROFILE = {
  GK: { pace: 0.7, tackling: 0.5, passing: 0.8, shooting: 0.3, heading: 0.6, strength: 0.9 },
  DF: { pace: 0.9, tackling: 1.15, passing: 0.85, shooting: 0.5, heading: 1.1, strength: 1.1 },
  MF: { pace: 0.95, tackling: 0.95, passing: 1.15, shooting: 0.9, heading: 0.85, strength: 0.9 },
  FW: { pace: 1.1, tackling: 0.6, passing: 0.95, shooting: 1.2, heading: 1.0, strength: 0.95 },
};

export function generatePlayer(rng, { role, level, teamId, number, nationId }) {
  const g = (mult = 1, spread = 9) => clamp(Math.round(rng.gauss(level, spread) * mult), 12, 99);
  const prof = ROLE_PROFILE[role];
  const name = personName(rng, 'm');
  return {
    id: uid('p'),
    teamId,
    number,
    nationId,
    name: `${name.first} ${name.last}`,
    shortName: `${name.first[0]}. ${name.last}`,
    role,
    age: rng.int(18, 36),
    // Atributos futbolísticos
    pace: g(prof.pace), tackling: g(prof.tackling), passing: g(prof.passing),
    shooting: g(prof.shooting), heading: g(prof.heading), strength: g(prof.strength),
    technique: g(1), positioning: g(1), stamina: g(1, 8),
    // Personalidad (afecta a incidentes y protestas)
    aggression: clamp(Math.round(rng.gauss(48, 20)), 5, 99),
    discipline: clamp(Math.round(rng.gauss(55, 18)), 5, 99),
    diving: clamp(Math.round(rng.gauss(35, 22)), 1, 99),
    temperament: clamp(Math.round(rng.gauss(50, 20)), 5, 99),
    professionalism: clamp(Math.round(rng.gauss(58, 18)), 5, 99),
    leadership: clamp(Math.round(rng.gauss(45, 20)), 5, 99),
  };
}

export function generateSquad(rng, team, level) {
  const squad = [];
  const plan = [
    ['GK', 3], ['DF', 8], ['MF', 8], ['FW', 6],
  ];
  const numbers = rng.shuffle(Array.from({ length: 40 }, (_, i) => i + 1));
  let n = 0;
  for (const [role, count] of plan) {
    for (let i = 0; i < count; i++) {
      squad.push(generatePlayer(rng, {
        role, level: level + rng.int(-6, 6), teamId: team.id,
        number: numbers[n++], nationId: team.nationId,
      }));
    }
  }
  return squad;
}

// ------------------------------------------------------------ entrenadores

export const COACH_TRAITS = ['calm', 'aggressive', 'complainer', 'respectful', 'manipulative', 'tactical', 'emotional'];

export function generateCoach(rng, nationId) {
  const gender = rng.bool(0.12) ? 'f' : 'm';
  const name = personName(rng, gender);
  const trait = rng.pick(COACH_TRAITS);
  return {
    id: uid('c'),
    name: `${name.first} ${name.last}`,
    nationId,
    trait,
    age: rng.int(34, 66),
    temper: clamp(Math.round(rng.gauss(
      trait === 'aggressive' ? 80 : trait === 'calm' ? 25 : 50, 14)), 1, 99),
    protestRate: clamp(Math.round(rng.gauss(
      trait === 'complainer' ? 85 : trait === 'respectful' ? 20 : 50, 15)), 1, 99),
    influence: clamp(Math.round(rng.gauss(50, 20)), 1, 99),
  };
}

// ------------------------------------------------------------------ clubes

function clubName(rng, city) {
  const r = rng.next();
  if (r < 0.4) return `${rng.pick(CLUB_PREFIX)} ${city}`;
  if (r < 0.75) return `${city} ${rng.pick(CLUB_SUFFIX)}`;
  return `${rng.pick(CLUB_PREFIX)} ${city} ${rng.pick(CLUB_SUFFIX)}`;
}

export function generateStadium(rng, city, level) {
  const cap = Math.round(clamp(rng.gauss(level * 700, level * 260), 900, 88000));
  const size = cap < 3000 ? 'small' : cap < 12000 ? 'regional' : cap < 35000 ? 'modern' : cap < 60000 ? 'big' : 'international';
  return {
    id: uid('s'),
    name: `${rng.pick(STADIUM_PREFIX)} ${rng.pick(STADIUM_NAME)}`,
    city,
    capacity: cap,
    size,
    roofed: rng.bool(level > 70 ? 0.6 : 0.15),
    floodlights: level > 30 || rng.bool(0.4),
    pitchQuality: clamp(Math.round(rng.gauss(level, 14)), 20, 99),
  };
}

export function generateClub(rng, { city, nationId, level, divisionId }) {
  const kit = rng.pick(KIT_PALETTE);
  const alt = rng.pick(KIT_PALETTE);
  const id = uid('t');
  const club = {
    id,
    name: clubName(rng, city),
    shortName: city.slice(0, 3).toUpperCase(),
    nickname: rng.pick(NICKNAMES),
    city,
    nationId,
    divisionId,
    level: clamp(Math.round(rng.gauss(level, 6)), 15, 99),
    colors: { primary: kit[0], secondary: kit[1], away: alt[0] },
    stadium: generateStadium(rng, city, level),
    formation: rng.pick(FORMATION_IDS),
    style: rng.pick(STYLE_IDS),
    aggression: clamp(Math.round(rng.gauss(50, 18)), 8, 96),
    pressing: clamp(Math.round(rng.gauss(50, 18)), 8, 96),
    discipline: clamp(Math.round(rng.gauss(55, 18)), 8, 96),
    fanIntensity: clamp(Math.round(rng.gauss(50, 22)), 5, 99),
    prestige: clamp(Math.round(rng.gauss(level, 12)), 5, 99),
    budget: Math.round(Math.pow(level, 2.6) * rng.float(0.8, 1.4)),
    rivals: [],
    coach: generateCoach(rng, nationId),
  };
  club.squad = generateSquad(rng, club, club.level);
  return club;
}

// -------------------------------------------------------------- selecciones

export function generateNationalTeam(rng, nation) {
  const level = clamp(Math.round(rng.gauss(80, 8)), 60, 96);
  const id = uid('n');
  const team = {
    id,
    national: true,
    name: `Selección de ${nation.name}`,
    shortName: nation.id.toUpperCase(),
    nickname: nation.adj,
    city: nation.name,
    nationId: nation.id,
    divisionId: 'mundial',
    level,
    colors: { primary: nation.colors[0], secondary: nation.colors[1], away: '#ffffff' },
    stadium: generateStadium(rng, nation.name, 95),
    formation: rng.pick(FORMATION_IDS),
    style: rng.pick(STYLE_IDS),
    aggression: clamp(Math.round(rng.gauss(48, 15)), 10, 90),
    pressing: clamp(Math.round(rng.gauss(55, 15)), 10, 95),
    discipline: clamp(Math.round(rng.gauss(62, 14)), 10, 95),
    fanIntensity: clamp(Math.round(rng.gauss(78, 12)), 30, 99),
    prestige: level,
    budget: 0,
    rivals: [],
    coach: generateCoach(rng, nation.id),
  };
  team.squad = generateSquad(rng, team, level);
  return team;
}

// ----------------------------------------------------------- equipo arbitral

export function generateOfficial(rng, kind, level) {
  const gender = rng.bool(0.18) ? 'f' : 'm';
  const name = personName(rng, gender);
  const g = (sd = 10) => clamp(Math.round(rng.gauss(level, sd)), 15, 99);
  return {
    id: uid('o'),
    kind, // 'AR1' | 'AR2' | 'FOURTH' | 'VAR' | 'AVAR'
    name: `${name.first} ${name.last}`,
    accuracy: g(),
    experience: g(14),
    concentration: g(12),
    confidence: g(14),
    communication: g(12),
    criterion: g(12),
    temperament: clamp(Math.round(rng.gauss(50, 18)), 5, 95),
  };
}

export function generateCrew(rng, level, hasVar) {
  const crew = {
    ar1: generateOfficial(rng, 'AR1', level - 4),
    ar2: generateOfficial(rng, 'AR2', level - 6),
    fourth: generateOfficial(rng, 'FOURTH', level - 8),
  };
  if (hasVar) {
    crew.var = generateOfficial(rng, 'VAR', level - 2);
    crew.avar = generateOfficial(rng, 'AVAR', level - 6);
  }
  return crew;
}

// ------------------------------------------------------------------- mundo

/** Genera el mundo completo: >100 clubes en 6 divisiones + 16 selecciones. */
export function generateWorld(seed = 'silbato') {
  resetUid();
  const rng = new RNG(seed);
  const world = {
    seed: String(seed),
    nations: NATIONS.slice(),
    divisions: DIVISIONS.map((d) => ({ ...d, clubIds: [] })),
    clubs: {},
    nationalTeams: {},
  };

  const cityPool = rng.shuffle(CITIES);
  let ci = 0;
  const nextCity = () => {
    const c = cityPool[ci % cityPool.length];
    const suffix = ci >= cityPool.length ? ` ${['Alta', 'Baja', 'del Río', 'Vieja'][Math.floor(ci / cityPool.length) % 4]}` : '';
    ci++;
    return c + suffix;
  };

  for (const div of world.divisions) {
    if (!div.clubs) continue;
    for (let i = 0; i < div.clubs; i++) {
      const club = generateClub(rng, {
        city: nextCity(),
        nationId: 'ibr',
        level: div.level,
        divisionId: div.id,
      });
      world.clubs[club.id] = club;
      div.clubIds.push(club.id);
    }
  }

  // Rivalidades: pares dentro de cada división, más algún clásico entre niveles.
  for (const div of world.divisions) {
    const ids = rng.shuffle(div.clubIds);
    for (let i = 0; i + 1 < ids.length; i += 2) {
      const a = world.clubs[ids[i]], b = world.clubs[ids[i + 1]];
      const intensity = clamp(Math.round(rng.gauss(60, 20)), 20, 100);
      a.rivals.push({ id: b.id, intensity });
      b.rivals.push({ id: a.id, intensity });
    }
  }

  for (const nation of NATIONS) {
    const nt = generateNationalTeam(rng, nation);
    world.nationalTeams[nt.id] = nt;
  }
  // Rivalidades entre selecciones vecinas.
  const ntIds = Object.keys(world.nationalTeams);
  for (let i = 0; i < ntIds.length; i++) {
    const a = world.nationalTeams[ntIds[i]];
    const b = world.nationalTeams[ntIds[(i + 1) % ntIds.length]];
    a.rivals.push({ id: b.id, intensity: rng.int(55, 95) });
  }

  world.allClubIds = Object.keys(world.clubs);
  return world;
}

export function clubsOfDivision(world, divisionId) {
  const div = world.divisions.find((d) => d.id === divisionId);
  if (!div) return [];
  if (div.national) return Object.values(world.nationalTeams);
  if (div.clubIds.length) return div.clubIds.map((id) => world.clubs[id]);
  // Competiciones copa/continentales: usa los mejores clubes del mundo.
  const pool = Object.values(world.clubs).sort((a, b) => b.level - a.level);
  return pool.slice(0, div.id === 'europa' ? 32 : div.id === 'continental' ? 24 : 40);
}
