// Academia arbitral: exámenes de reglamento. Aprobar es requisito para
// ascender a partir de cierta categoría.

import { clamp } from '../core/rng.js';
import { QUESTIONS, EXAM_TOPICS } from '../data/examQuestions.js';
import { getLocale } from '../core/i18n.js';
import { trainStat } from './referee.js';

// Categoría -> nivel de examen exigido
const REQUIRED_LEVEL = {
  regional: 0, preferente: 0, tercera: 1, segundaB: 1,
  segunda: 2, primera: 2, copa: 2, europa: 3, continental: 3, mundial: 3,
};

export class Academy {
  constructor(career) {
    this.career = career;
    this.examLevel = 0;          // nivel de titulación conseguido
    this.results = [];
    this.current = null;
  }

  /** ¿Tiene la titulación para ascender desde esta categoría? */
  passedFor(divisionId) {
    const idx = Object.keys(REQUIRED_LEVEL).indexOf(divisionId);
    const nextId = Object.keys(REQUIRED_LEVEL)[idx + 1];
    if (!nextId) return true;
    return this.examLevel >= (REQUIRED_LEVEL[nextId] || 0);
  }

  requiredFor(divisionId) {
    const idx = Object.keys(REQUIRED_LEVEL).indexOf(divisionId);
    const nextId = Object.keys(REQUIRED_LEVEL)[idx + 1];
    return nextId ? (REQUIRED_LEVEL[nextId] || 0) : 0;
  }

  startExam(topic = null, count = 6) {
    const rng = this.career.rng;
    const pool = topic ? QUESTIONS.filter((q) => q.topic === topic) : QUESTIONS;
    const picked = rng.shuffle(pool).slice(0, Math.min(count, pool.length));
    const loc = getLocale();
    this.current = {
      topic,
      index: 0,
      answers: [],
      questions: picked.map((q) => {
        const body = q[loc] || q.es;
        // Se barajan las opciones: la posición correcta nunca es predecible
        const order = rng.shuffle(body.options.map((_, i) => i));
        return {
          topic: q.topic,
          q: body.q,
          options: order.map((i) => body.options[i]),
          correct: order.indexOf(body.correct),
          why: body.why,
        };
      }),
    };
    return this.current;
  }

  answer(optionIndex) {
    const ex = this.current;
    if (!ex) return null;
    const q = ex.questions[ex.index];
    const ok = optionIndex === q.correct;
    ex.answers.push({ given: optionIndex, correct: q.correct, ok });
    ex.index++;
    const done = ex.index >= ex.questions.length;
    return { ok, why: q.why, correct: q.correct, done, progress: ex.index, total: ex.questions.length };
  }

  finishExam() {
    const ex = this.current;
    if (!ex) return null;
    const right = ex.answers.filter((a) => a.ok).length;
    const score = right / ex.questions.length;
    const passed = score >= 0.7;
    const perfect = right === ex.questions.length;

    const ref = this.career.referee;
    const gains = {};
    if (passed) {
      gains.rules = trainStat(ref, 'rules', 2.2 + score * 2);
      gains.accuracy = trainStat(ref, 'accuracy', 0.6 * score);
      if (perfect) gains.concentration = trainStat(ref, 'concentration', 0.8);
      // Subir de titulación exige exámenes generales aprobados con buena nota
      if (!ex.topic && score >= 0.8) this.examLevel = clamp(this.examLevel + 1, 0, 3);
    }
    const result = {
      score, right, total: ex.questions.length, passed, perfect,
      topic: ex.topic, examLevel: this.examLevel, gains,
      season: this.career.season, round: this.career.round,
    };
    this.results.unshift(result);
    this.results = this.results.slice(0, 30);
    this.current = null;
    this.career.achievements.check('exam', { perfect });
    return result;
  }

  topics() { return EXAM_TOPICS; }

  serialize() { return { examLevel: this.examLevel, results: this.results.slice(0, 15) }; }
  restore(d) { if (!d) return; this.examLevel = d.examLevel || 0; this.results = d.results || []; }
}

export default Academy;
