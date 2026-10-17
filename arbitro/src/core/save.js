// Guardado en localStorage con varias ranuras y autoguardado.
// El mundo no se serializa entero: se regenera desde su semilla.

import { GAME } from './config.js';

const KEY = GAME.saveKey;
const SLOTS = 5;

function storage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch (e) { /* entorno sin DOM */ }
  // Fallback en memoria (tests, SSR)
  if (!globalThis.__memStore) {
    const mem = new Map();
    globalThis.__memStore = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, v),
      removeItem: (k) => mem.delete(k),
    };
  }
  return globalThis.__memStore;
}

function readAll() {
  try {
    const raw = storage().getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Guardado corrupto, se reinicia', e);
    return {};
  }
}

function writeAll(data) {
  storage().setItem(KEY, JSON.stringify(data));
}

export function listSaves() {
  const all = readAll();
  const out = [];
  for (let i = 1; i <= SLOTS; i++) {
    const s = all[`slot${i}`];
    out.push(s ? {
      slot: i, empty: false, name: s.meta.name, division: s.meta.division,
      season: s.meta.season, matches: s.meta.matches, rating: s.meta.rating,
      updated: s.meta.updated, mode: s.meta.mode,
    } : { slot: i, empty: true });
  }
  return out;
}

export function saveGame(slot, career) {
  const all = readAll();
  all[`slot${slot}`] = {
    version: GAME.version,
    meta: {
      name: `${career.referee.firstName} ${career.referee.lastName}`,
      division: career.divisionId,
      season: career.season,
      matches: career.referee.record.matches,
      rating: career.avgRating(),
      updated: Date.now(),
      mode: career.mode,
    },
    data: career.serialize(),
  };
  writeAll(all);
  return true;
}

export function loadGame(slot) {
  const all = readAll();
  const s = all[`slot${slot}`];
  return s ? s.data : null;
}

export function deleteSave(slot) {
  const all = readAll();
  delete all[`slot${slot}`];
  writeAll(all);
}

export function hasAnySave() {
  return listSaves().some((s) => !s.empty);
}

export function lastSaveSlot() {
  const saves = listSaves().filter((s) => !s.empty);
  if (!saves.length) return null;
  saves.sort((a, b) => b.updated - a.updated);
  return saves[0].slot;
}

// --- Ajustes globales (independientes de la partida) ---------------

const SETTINGS_KEY = `${KEY}:settings`;

export const DEFAULT_SETTINGS = {
  locale: 'es',
  difficulty: 'normal',
  sound: true,
  crowdVolume: 0.5,
  whistleVolume: 0.8,
  matchSpeed: 1,
  showEvaluation: true,
  autosave: true,
};

export function loadSettings() {
  try {
    const raw = storage().getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s) {
  storage().setItem(SETTINGS_KEY, JSON.stringify(s));
}

// --- Logros persistentes -------------------------------------------

const ACH_KEY = `${KEY}:achievements`;

export function loadAchievements() {
  try {
    const raw = storage().getItem(ACH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) { return {}; }
}

export function saveAchievements(a) {
  storage().setItem(ACH_KEY, JSON.stringify(a));
}
