// Internacionalización. Ningún texto visible debe escribirse en la lógica:
// siempre `t('clave')`. Añadir un idioma = añadir un archivo en /i18n.

import { es } from '../../i18n/es.js';
import { en } from '../../i18n/en.js';

const BUNDLES = { es, en };

let current = 'es';
let fallback = 'es';

export function availableLocales() {
  return Object.keys(BUNDLES).map((id) => ({ id, name: BUNDLES[id]['locale.name'] || id }));
}

export function setLocale(id) {
  if (BUNDLES[id]) current = id;
  return current;
}

export function getLocale() { return current; }

function lookup(key, locale) {
  const b = BUNDLES[locale];
  return b ? b[key] : undefined;
}

/**
 * t('match.foul')            -> texto
 * t('press.headline', {a:1}) -> interpola {a}
 * Si el valor es un array, devuelve el array (para elegir variantes).
 */
export function t(key, params) {
  let v = lookup(key, current);
  if (v === undefined) v = lookup(key, fallback);
  if (v === undefined) return key;
  if (Array.isArray(v)) return v;
  if (typeof v !== 'string') return v;
  if (!params) return v;
  return v.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m));
}

/** Variante aleatoria de una clave con múltiples textos. */
export function tv(key, params, rng) {
  const v = t(key, params);
  if (!Array.isArray(v)) return v;
  const pick = rng ? v[Math.floor(rng.next() * v.length)] : v[Math.floor(Math.random() * v.length)];
  return params ? pick.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m)) : pick;
}

export function has(key) {
  return lookup(key, current) !== undefined || lookup(key, fallback) !== undefined;
}
