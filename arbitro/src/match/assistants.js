// Árbitros asistentes: tienen ojos propios, aciertan, dudan y se equivocan.

import { clamp } from '../core/rng.js';
import { FIELD } from '../core/config.js';
import { dist } from './sim.js';

export class AssistantSystem {
  constructor(match) {
    this.match = match;
    this.calls = { ar1: { total: 0, right: 0 }, ar2: { total: 0, right: 0 } };
    this.notes = [];
  }

  /** Asistente responsable de una zona del campo. */
  forPos(pos) {
    return pos.x < FIELD.length / 2 ? 'ar1' : 'ar2';
  }

  _skill(key) {
    const a = this.match.crew[key];
    const diff = this.match.difficulty.assistantAccuracy;
    const base = (a.accuracy * 0.55 + a.concentration * 0.25 + a.experience * 0.2) / 100;
    return clamp(base * diff, 0.15, 0.99);
  }

  /** ¿Levanta el banderín? */
  judgeOffside(inc) {
    const key = this.forPos(inc.pos);
    const skill = this._skill(key);
    const margin = Math.abs(inc.truth.margin || 0);
    // Cuanto más ajustado, más difícil
    const certainty = clamp(skill * (0.62 + clamp(margin / 0.8, 0, 1) * 0.38), 0.05, 0.99);
    const correct = this.match.rng.next() < certainty;
    const flag = correct ? inc.truth.offside : !inc.truth.offside;
    this.calls[key].total++;
    if (correct) this.calls[key].right++;
    if (!correct) {
      this.notes.push({ key, kind: 'offsideError', minute: inc.minute });
    }
    return { flag, confidence: certainty, key, correct };
  }

  /**
   * El árbitro consulta. La respuesta depende de lo que el asistente
   * REALMENTE pudo ver, no de la verdad absoluta.
   */
  ask(incident, question) {
    const key = this.forPos(incident.pos);
    const a = this.match.crew[key];
    const skill = this._skill(key);
    const d = dist({ x: incident.pos.x, y: incident.pos.y },
      { x: this.match.assistantsPos[key === 'ar1' ? 0 : 1].x, y: key === 'ar1' ? 0 : FIELD.width });
    const visibility = clamp(1 - (d - 12) / 55, 0.2, 1) * this.match.weather.visibility;
    const certainty = clamp(skill * visibility, 0.05, 0.98);

    const q = question || this._defaultQuestion(incident);
    const rng = this.match.rng;

    // Duda explícita
    if (certainty < 0.42 && rng.next() < 0.55) {
      return { key, name: a.name, question: q, unsure: true, textKey: 'assistant.unsure', confidence: certainty };
    }

    const correct = rng.next() < certainty;
    let answer;
    switch (q) {
      case 'assistant.q.offside':
        answer = { value: correct ? incident.truth.offside : !incident.truth.offside, kind: 'offside' };
        break;
      case 'assistant.q.handball':
        answer = { value: correct ? !!incident.truth.offence : !incident.truth.offence, kind: 'handball' };
        break;
      case 'assistant.q.lastTouch':
        answer = {
          value: correct ? incident.truth.toSide : 1 - incident.truth.toSide,
          kind: 'lastTouch',
        };
        break;
      case 'assistant.q.violence':
        answer = { value: correct ? (incident.truth.card === 'red') : false, kind: 'violence' };
        break;
      default:
        answer = { value: correct ? !!incident.truth.isFoul : !incident.truth.isFoul, kind: 'foul' };
    }
    this.calls[key].total++;
    if (correct) this.calls[key].right++;
    return { key, name: a.name, question: q, ...answer, correct, confidence: certainty, unsure: false };
  }

  _defaultQuestion(incident) {
    switch (incident.type) {
      case 'offside': return 'assistant.q.offside';
      case 'handball': return 'assistant.q.handball';
      case 'outOfPlay': return 'assistant.q.lastTouch';
      case 'violence': return 'assistant.q.violence';
      default: return 'assistant.q.foul';
    }
  }

  halfTimeNotes() {
    const out = [];
    for (const key of ['ar1', 'ar2']) {
      const c = this.calls[key];
      if (!c.total) continue;
      out.push({
        key, name: this.match.crew[key].name,
        accuracy: Math.round((c.right / c.total) * 100), calls: c.total,
      });
    }
    return out;
  }

  rate(key) {
    const c = this.calls[key];
    const name = this.match.crew[key] ? this.match.crew[key].name : '—';
    if (!c.total) return { name, rating: 7, calls: 0, accuracy: null };
    const acc = c.right / c.total;
    return { name, rating: +(4 + acc * 6).toFixed(1), calls: c.total, accuracy: Math.round(acc * 100) };
  }
}

export default AssistantSystem;
