// Generador pseudoaleatorio determinista (mulberry32) + utilidades.
// Todo el juego usa semillas para que las partidas sean reproducibles.

export function hashSeed(str) {
  let h = 1779033703 ^ String(str).length;
  for (let i = 0; i < String(str).length; i++) {
    h = Math.imul(h ^ String(str).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h >>> 0) || 1;
}

export class RNG {
  constructor(seed = Date.now()) {
    this.seed = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);
    this._s = this.seed;
  }

  /** [0,1) */
  next() {
    this._s = (this._s + 0x6d2b79f5) >>> 0;
    let t = this._s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  /** Entero en [min, max] inclusive. */
  int(min, max) {
    return Math.floor(this.float(min, max + 1));
  }

  bool(p = 0.5) {
    return this.next() < p;
  }

  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }

  /** Elige de [{w, ...}] o de pares [valor, peso]. */
  weighted(entries) {
    let total = 0;
    for (const e of entries) total += Array.isArray(e) ? e[1] : e.w;
    let r = this.next() * total;
    for (const e of entries) {
      const w = Array.isArray(e) ? e[1] : e.w;
      r -= w;
      if (r <= 0) return Array.isArray(e) ? e[0] : e;
    }
    const last = entries[entries.length - 1];
    return Array.isArray(last) ? last[0] : last;
  }

  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Normal (Box-Muller) recortada. */
  gauss(mean = 0, sd = 1, clampSd = 3) {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    z = Math.max(-clampSd, Math.min(clampSd, z));
    return mean + z * sd;
  }

  /** Sub-generador derivado, para aislar sistemas sin romper la secuencia. */
  fork(tag = '') {
    return new RNG(hashSeed(`${this.seed}:${tag}:${this._s}`));
  }

  state() { return this._s; }
  setState(s) { this._s = s >>> 0; }
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
