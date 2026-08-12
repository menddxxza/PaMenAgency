// MODO SYNDICATE: trama ramificada sobre una red de amaños ficticia.
// Las decisiones no son sólo diálogo: marcan partidos, dinero, sospecha,
// reputación y el final de la carrera.

import { clamp } from '../core/rng.js';

export const PATHS = { CLEAN: 'clean', COLLABORATE: 'collaborate', INFILTRATE: 'infiltrate', EXPOSE: 'expose' };

// Los capítulos son datos: condiciones y efectos. El texto de la escena y
// las etiquetas de las opciones viven en i18n, como `syn.<capítulo>.text` y
// `syn.<capítulo>.<opción>`.
export const CHAPTERS = [
  {
    id: 1, minMatches: 2,
    options: [
      { id: 'ignore', path: PATHS.CLEAN, ethics: +4 },
      { id: 'keep', path: null, suspicion: +2 },
      { id: 'call', path: null, flag: 'contacted' },
    ],
  },
  {
    id: 2, minMatches: 5, requires: 'contacted',
    options: [
      { id: 'talk', path: PATHS.COLLABORATE, money: 2500, suspicion: +8, ethics: -12 },
      { id: 'refuse', path: PATHS.CLEAN, ethics: +8 },
      { id: 'record', path: PATHS.INFILTRATE, flag: 'evidence1', suspicion: +3 },
    ],
  },
  {
    id: 3, minMatches: 9,
    marksMatch: true,
    options: [
      { id: 'comply', path: PATHS.COLLABORATE, flag: 'fixedMatch', money: 6000, corruption: +25 },
      { id: 'ignore', path: PATHS.CLEAN, ethics: +10 },
      { id: 'double', path: PATHS.INFILTRATE, flag: 'evidence2', suspicion: +6 },
    ],
  },
  {
    id: 4, minMatches: 14, requires: 'evidence2',
    options: [
      { id: 'press', path: PATHS.EXPOSE, flag: 'exposed', reputation: +18, suspicion: -20 },
      { id: 'committee', path: PATHS.EXPOSE, flag: 'exposed', reputation: +10, ethics: +12 },
      { id: 'deeper', path: PATHS.INFILTRATE, suspicion: +10 },
    ],
  },
  {
    id: 5, minMatches: 18, requires: 'fixedMatch',
    options: [
      { id: 'confess', path: PATHS.EXPOSE, flag: 'exposed', reputation: -10, corruption: -30, ethics: +20 },
      { id: 'silence', path: PATHS.COLLABORATE, suspicion: +18 },
      { id: 'flee', path: null, flag: 'retiring' },
    ],
  },
];

export class Syndicate {
  constructor(career) {
    this.career = career;
    this.chapter = 0;
    this.flags = {};
    this.path = null;
    this.exposed = false;
    this.markedAssignmentId = null;
    this.markedSide = null;
    this.log = [];
  }

  get active() { return this.career.mode === 'syndicate'; }

  /** ¿Hay una escena disponible ahora mismo? */
  pending() {
    if (!this.active) return null;
    const matches = this.career.referee.record.matches;
    const next = CHAPTERS.find((c) => c.id === this.chapter + 1);
    if (!next) return null;
    if (matches < next.minMatches) return null;
    if (next.requires && !this.flags[next.requires]) {
      // Salta capítulos cuyos requisitos no se cumplieron
      this.chapter = next.id;
      return this.pending();
    }
    return next;
  }

  choose(chapterId, optionId) {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    if (!ch) return null;
    const opt = ch.options.find((o) => o.id === optionId);
    if (!opt) return null;
    const ref = this.career.referee;

    if (opt.path) this.path = opt.path;
    if (opt.flag) this.flags[opt.flag] = true;
    if (opt.money) ref.money += opt.money;
    if (opt.corruption) ref.corruption = clamp(ref.corruption + opt.corruption, 0, 100);
    if (opt.suspicion) ref.suspicion = clamp(ref.suspicion + opt.suspicion, 0, 100);
    if (opt.ethics) ref.ethics = clamp(ref.ethics + opt.ethics, 0, 100);
    if (opt.reputation) ref.reputation = clamp(ref.reputation + opt.reputation, 0, 100);
    if (opt.flag === 'exposed') {
      this.exposed = true;
      this.career.achievements.check('syndicate', { exposed: true });
    }

    this.chapter = ch.id;
    this.log.push({ chapter: ch.id, option: opt.id, path: opt.path || this.path });

    // Un capítulo puede marcar el próximo partido
    if (ch.marksMatch && (opt.id === 'comply' || opt.id === 'double')) {
      const a = this.career.assignments[0];
      if (a) { this.markedAssignmentId = a.id; this.markedSide = 1; }
    }
    return { chapter: ch, option: opt, path: this.path, flags: { ...this.flags } };
  }

  /** Comprueba si el encargo se cumplió y ajusta sospecha. */
  afterMatch(report, assignment) {
    if (!this.active || !assignment) return;
    if (this.markedAssignmentId !== assignment.id) return;
    this.markedAssignmentId = null;
    const ref = this.career.referee;
    const favoured = this.markedSide;
    const complied = report.score[favoured] >= report.score[1 - favoured];
    if (complied) {
      ref.money += 4000;
      ref.corruption = clamp(ref.corruption + 8, 0, 100);
      this.log.push({ event: 'complied', season: this.career.season });
    } else {
      ref.suspicion = clamp(ref.suspicion + 6, 0, 100);
      this.log.push({ event: 'failed', season: this.career.season });
    }
    // Un partido amañado con muchos errores levanta sospechas
    if (report.counts.incorrect > 3) ref.suspicion = clamp(ref.suspicion + 8, 0, 100);
  }

  onBribeAccepted() {
    const ref = this.career.referee;
    if (!this.active) return;
    this.flags.bribed = true;
    ref.suspicion = clamp(ref.suspicion + 5, 0, 100);
  }

  onReported() {
    if (!this.active) return;
    this.flags.reportedOnce = true;
    this.career.referee.suspicion = clamp(this.career.referee.suspicion - 6, 0, 100);
  }

  status() {
    return {
      chapter: this.chapter, path: this.path, exposed: this.exposed,
      suspicion: this.career.referee.suspicion, corruption: this.career.referee.corruption,
      flags: { ...this.flags },
    };
  }

  serialize() {
    return { chapter: this.chapter, flags: this.flags, path: this.path, exposed: this.exposed, log: this.log.slice(-20) };
  }

  restore(d) {
    if (!d) return;
    this.chapter = d.chapter || 0;
    this.flags = d.flags || {};
    this.path = d.path || null;
    this.exposed = !!d.exposed;
    this.log = d.log || [];
  }
}

export default Syndicate;
