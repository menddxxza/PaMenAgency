// Nota del árbitro. Una decisión mala no hunde la nota por sí sola:
// pesa el contexto (impacto, dificultad de la jugada, visibilidad).

import { clamp } from '../core/rng.js';
import { GRADE, GRADE_WEIGHT } from '../rules/ruleEngine.js';
import { dist } from './sim.js';

const IMPACT_W = { low: 0.6, medium: 1, high: 1.6, critical: 2.4 };

export class RefereeRating {
  constructor(match) {
    this.match = match;
    this.decisions = [];
    this.posSamples = 0;
    this.posGood = 0;
    this.posSum = 0;
    this.advantages = { tried: 0, good: 0 };
    this.varCalls = { used: 0, right: 0, wrong: 0 };
    this.cards = { given: 0, needed: 0, unnecessary: 0, missed: 0 };
    this.protestsHandled = 0;
    this.protestsIgnored = 0;
    this.thresholdSamples = [];
    this.timeouts = 0;
  }

  samplePositioning(distToBall, active) {
    if (!active) return;
    this.posSamples++;
    this.posSum += distToBall;
    if (distToBall < 20) this.posGood++;
  }

  recordDecision(incident, payload, grade) {
    const w = IMPACT_W[incident.impact] || 1;
    // Jugadas muy difíciles de ver penalizan menos
    const difficultyRelief = clamp(1 - (1 - incident.clarity) * 0.35, 0.62, 1);
    const score = GRADE_WEIGHT[grade.grade];
    this.decisions.push({
      score, weight: w, relief: difficultyRelief, type: incident.type,
      grade: grade.grade, impact: incident.impact, minute: incident.minute,
    });

    if (payload.timeout) this.timeouts++;

    if (incident.type === 'challenge' || incident.type === 'penaltyShout') {
      this.thresholdSamples.push({
        contact: incident.facts ? incident.facts.contact : 0.5,
        whistled: payload.action === 'foul' || payload.action === 'penalty',
        half: incident.half,
      });
    }
    const need = incident.truth.card;
    const got = payload.card;
    if (got) this.cards.given++;
    if (need) this.cards.needed++;
    if (got && !need) this.cards.unnecessary++;
    if (need && !got) this.cards.missed++;
    if (incident.type === 'dissent') {
      if (got || payload.warning) this.protestsHandled++;
      else this.protestsIgnored++;
    }
  }

  recordAdvantage(materialized, incident) {
    this.advantages.tried++;
    if (materialized) this.advantages.good++;
  }

  recordVar(incident, result) {
    this.varCalls.used++;
    if (result && result.improved) this.varCalls.right++;
    else if (result && result.worsened) this.varCalls.wrong++;
  }

  /** Consistencia: ¿pita siempre a partir del mismo nivel de contacto? */
  consistencyScore() {
    const s = this.thresholdSamples;
    if (s.length < 4) return 0.75;
    const whistled = s.filter((x) => x.whistled).map((x) => x.contact);
    const let_go = s.filter((x) => !x.whistled).map((x) => x.contact);
    if (!whistled.length || !let_go.length) return 0.8;
    const minW = Math.min(...whistled);
    const maxL = Math.max(...let_go);
    // Solapamiento = incoherencia
    const overlap = clamp((maxL - minW) / 0.6, 0, 1);
    // Deriva entre partes
    const h1 = s.filter((x) => x.half === 1 && x.whistled).map((x) => x.contact);
    const h2 = s.filter((x) => x.half >= 2 && x.whistled).map((x) => x.contact);
    const avg = (a) => (a.length ? a.reduce((p, c) => p + c, 0) / a.length : null);
    const a1 = avg(h1), a2 = avg(h2);
    const drift = a1 !== null && a2 !== null ? clamp(Math.abs(a1 - a2) / 0.45, 0, 1) : 0;
    return clamp(1 - overlap * 0.6 - drift * 0.35, 0, 1);
  }

  accuracyScore() {
    if (!this.decisions.length) return 0.75;
    let num = 0, den = 0;
    for (const d of this.decisions) {
      const w = d.weight;
      const penalty = 1 - (1 - d.score) * d.relief;
      num += penalty * w;
      den += w;
    }
    return clamp(num / den, 0, 1);
  }

  positioningScore() {
    if (!this.posSamples) return 0.7;
    const avg = this.posSum / this.posSamples;
    const ratio = this.posGood / this.posSamples;
    const byAvg = clamp(1 - (avg - 14) / 32, 0, 1);
    return clamp(ratio * 0.55 + byAvg * 0.45, 0, 1);
  }

  disciplineScore() {
    const { unnecessary, missed, needed, given } = this.cards;
    const total = Math.max(1, needed + given);
    return clamp(1 - (unnecessary * 0.9 + missed * 1.1) / (total + 2), 0, 1);
  }

  advantageScore() {
    if (!this.advantages.tried) return 0.72;
    return clamp(this.advantages.good / this.advantages.tried, 0, 1);
  }

  varScore() {
    if (!this.varCalls.used) return this.match.varEnabled ? 0.72 : 0.75;
    return clamp((this.varCalls.right + 0.4) / (this.varCalls.used + 0.5) - this.varCalls.wrong * 0.25, 0, 1);
  }

  communicationScore() {
    const p = this.protestsHandled + this.protestsIgnored;
    if (!p) return 0.75;
    return clamp(this.protestsHandled / p * 0.7 + 0.3, 0, 1);
  }

  controlScore() {
    const m = this.match;
    const anger = (m.atmosphere.anger[0] + m.atmosphere.anger[1]) / 200;
    const frustration = m.entities.filter((e) => e.onPitch)
      .reduce((s, e) => s + e.frustration, 0) / Math.max(1, m.entities.filter((e) => e.onPitch).length) / 100;
    return clamp(1 - anger * 0.55 - frustration * 0.5, 0, 1);
  }

  managementScore() {
    const timeoutPenalty = clamp(this.timeouts * 0.08, 0, 0.4);
    return clamp((this.controlScore() * 0.5 + this.communicationScore() * 0.3
      + this.consistencyScore() * 0.2) - timeoutPenalty, 0, 1);
  }

  breakdown() {
    return {
      accuracy: this.accuracyScore(),
      positioning: this.positioningScore(),
      consistency: this.consistencyScore(),
      discipline: this.disciplineScore(),
      communication: this.communicationScore(),
      control: this.controlScore(),
      advantage: this.advantageScore(),
      management: this.managementScore(),
      var: this.varScore(),
    };
  }

  /** Nota 0..10 en curso. */
  current() {
    const b = this.breakdown();
    const raw = b.accuracy * 0.42 + b.positioning * 0.13 + b.consistency * 0.09
      + b.discipline * 0.1 + b.control * 0.08 + b.communication * 0.06
      + b.advantage * 0.05 + b.management * 0.04 + b.var * 0.03;
    const harsh = this.match.difficulty.ratingHarshness;
    const scaled = 1.4 + raw * 8.7;
    return clamp(10 - (10 - scaled) * harsh, 1, 10);
  }

  finalize() {
    const b = this.breakdown();
    const overall = this.current();
    return {
      overall: +overall.toFixed(2),
      breakdown: Object.fromEntries(Object.entries(b).map(([k, v]) => [k, +(v * 10).toFixed(1)])),
      counts: { ...this.cards },
      advantages: { ...this.advantages },
      varCalls: { ...this.varCalls },
      avgDistanceToBall: this.posSamples ? +(this.posSum / this.posSamples).toFixed(1) : null,
    };
  }

  supervisorNotes(match) {
    const b = this.breakdown();
    const notes = [];
    if (b.positioning > 0.75) notes.push('supervisor.positioning.good');
    else if (b.positioning < 0.5) notes.push('supervisor.positioning.bad');
    if (b.communication < 0.5) notes.push('supervisor.protests.bad');
    if (this.cards.missed > 2) notes.push('supervisor.lenient');
    if (this.cards.unnecessary > 2) notes.push('supervisor.strict');
    if (this.advantages.tried > 0 && b.advantage > 0.7) notes.push('supervisor.advantage.good');
    if (b.consistency < 0.5) notes.push('supervisor.consistency.bad');
    if (this.varCalls.used > 0 && b.var > 0.7) notes.push('supervisor.var.good');
    const o = this.current();
    if (o >= 8.3) notes.push('supervisor.overall.great');
    else if (o < 5.5) notes.push('supervisor.overall.poor');
    return notes;
  }
}

export default RefereeRating;
