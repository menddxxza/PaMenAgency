// El árbitro del jugador: identidad, atributos, progresión y estado físico.

import { RNG, clamp } from '../core/rng.js';
import { REF_STATS } from '../core/config.js';
import { FIRST_NAMES, FIRST_NAMES_F, LAST_NAMES, NATIONS } from '../data/names.js';

export const KITS = [
  { id: 'black', name: 'Negro clásico', shirt: '#111418', trim: '#f2c14e' },
  { id: 'yellow', name: 'Amarillo alta visibilidad', shirt: '#f4d03f', trim: '#1b1b1b' },
  { id: 'teal', name: 'Verde azulado', shirt: '#0f766e', trim: '#e6fffb' },
  { id: 'red', name: 'Rojo', shirt: '#b3261e', trim: '#ffe0dd' },
  { id: 'purple', name: 'Violeta', shirt: '#5b2c6f', trim: '#f0e6f6' },
  { id: 'blue', name: 'Azul noche', shirt: '#1b3a6b', trim: '#cfe3ff' },
];

export const SKINS = ['#f2d3b6', '#e0b48c', '#c68b5e', '#8d5524', '#5c3317'];
export const HAIRS = ['#1b1b1b', '#4b3621', '#8b5a2b', '#c9a227', '#9e9e9e', '#efefef'];

export function createReferee(opts = {}) {
  const rng = new RNG(opts.seed ?? Date.now());
  const gender = opts.gender || 'm';
  const pool = gender === 'f' ? FIRST_NAMES_F : FIRST_NAMES;
  const stats = {};
  for (const k of REF_STATS) {
    stats[k] = clamp(Math.round(rng.gauss(opts.baseLevel ?? 34, 6)), 12, 99);
  }
  if (opts.stats) Object.assign(stats, opts.stats);

  return {
    firstName: opts.firstName || rng.pick(pool),
    lastName: opts.lastName || rng.pick(LAST_NAMES),
    get name() { return `${this.firstName} ${this.lastName}`; },
    gender,
    age: opts.age ?? rng.int(20, 28),
    nationId: opts.nationId || NATIONS[0].id,
    appearance: {
      kit: opts.kit || 'black',
      skin: opts.skin || SKINS[rng.int(0, SKINS.length - 1)],
      hair: opts.hair || HAIRS[rng.int(0, HAIRS.length - 1)],
      number: opts.number ?? rng.int(1, 30),
    },
    stats,
    condition: 100,      // frescura física entre partidos
    morale: 60,
    reputation: opts.reputation ?? 25,
    ethics: 70,
    experience: 0,
    level: 1,
    money: opts.money ?? 800,
    followers: 120,
    corruption: 0,
    suspicion: 0,
    record: {
      matches: 0, minutes: 0, yellows: 0, reds: 0, penalties: 0, goals: 0,
      correct: 0, mostly: 0, debatable: 0, incorrect: 0, varReviews: 0,
      ratings: [], abandoned: 0, promotions: 0,
    },
  };
}

export function refereeName(ref) {
  return `${ref.firstName} ${ref.lastName}`;
}

export function avgRating(ref) {
  const r = ref.record.ratings;
  if (!r.length) return null;
  return +(r.reduce((a, b) => a + b, 0) / r.length).toFixed(2);
}

export const XP_PER_LEVEL = (level) => Math.round(180 * Math.pow(1.18, level - 1));

export function addExperience(ref, xp) {
  ref.experience += xp;
  const gains = [];
  while (ref.experience >= XP_PER_LEVEL(ref.level)) {
    ref.experience -= XP_PER_LEVEL(ref.level);
    ref.level++;
    gains.push(ref.level);
  }
  return gains;
}

/** Sube atributos por rendimiento y entrenamiento. */
export function trainStat(ref, stat, amount) {
  if (!(stat in ref.stats)) return 0;
  const before = ref.stats[stat];
  // Cuesta más subir cuanto más alto
  const eff = amount * clamp(1.25 - before / 110, 0.15, 1.2);
  ref.stats[stat] = clamp(+(before + eff).toFixed(2), 1, 99);
  return +(ref.stats[stat] - before).toFixed(2);
}

export function overall(ref) {
  const vals = Object.values(ref.stats);
  return +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
}
