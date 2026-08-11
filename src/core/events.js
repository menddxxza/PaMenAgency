// Bus de eventos mínimo. El motor no conoce la UI: sólo emite.

export class EventBus {
  constructor() { this._h = new Map(); }

  on(type, fn) {
    if (!this._h.has(type)) this._h.set(type, new Set());
    this._h.get(type).add(fn);
    return () => this.off(type, fn);
  }

  once(type, fn) {
    const off = this.on(type, (...a) => { off(); fn(...a); });
    return off;
  }

  off(type, fn) {
    const s = this._h.get(type);
    if (s) s.delete(fn);
  }

  emit(type, payload) {
    const s = this._h.get(type);
    if (s) for (const fn of Array.from(s)) fn(payload);
    const all = this._h.get('*');
    if (all) for (const fn of Array.from(all)) fn({ type, payload });
  }

  clear() { this._h.clear(); }
}
