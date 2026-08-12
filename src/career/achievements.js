// Logros. Se guardan a nivel de perfil (persisten entre carreras).

import { loadAchievements, saveAchievements } from '../core/save.js';
import { t } from '../core/i18n.js';

// Sólo identificadores: el nombre y la descripción viven en i18n
// (`ach.<id>.name` y `ach.<id>.desc`), como todo texto visible.
export const ACHIEVEMENT_IDS = [
  'firstMatch',
  'firstYellow',
  'firstRed',
  'firstVar',
  'firstPenalty',
  'perfectMatch',
  'flawless',
  'matches25',
  'matches50',
  'matches100',
  'promotion',
  'topFlight',
  'international',
  'worldFinal',
  'fiveReds',
  'abandon',
  'refuseBribe',
  'reportBribe',
  'exposeNetwork',
  'advantageMaster',
  'calmDerby',
  'examAce',
  'ironLungs',
  'saveTheMatch',
];

export class AchievementSystem {
  constructor(career) {
    this.career = career;
    this.unlocked = loadAchievements();
    this.session = [];
  }

  isUnlocked(id) { return !!this.unlocked[id]; }

  unlock(id) {
    if (this.unlocked[id]) return null;
    if (!ACHIEVEMENT_IDS.includes(id)) return null;
    this.unlocked[id] = { at: Date.now() };
    saveAchievements(this.unlocked);
    const def = { id, name: t(`ach.${id}.name`), desc: t(`ach.${id}.desc`) };
    this.session.push(def);
    return def;
  }

  checkAfterMatch(report, career) {
    const out = [];
    const push = (id) => { const d = this.unlock(id); if (d) out.push(d); };
    const ref = career.referee;

    push('firstMatch');
    if (report.stats[0].yellows + report.stats[1].yellows > 0) push('firstYellow');
    const reds = report.stats[0].reds + report.stats[1].reds;
    if (reds > 0) push('firstRed');
    if (reds >= 5) push('fiveReds');
    if (report.stats[0].penalties + report.stats[1].penalties > 0) push('firstPenalty');
    if (report.rating.varCalls.used > 0) push('firstVar');
    if (report.counts.total > 8 && report.counts.incorrect === 0) push('perfectMatch');
    if (report.rating.overall >= 9) push('flawless');
    if (report.abandoned) push('abandon');
    if (report.rating.advantages.tried >= 3 && report.rating.advantages.good >= 3) push('advantageMaster');
    if (ref.record.matches >= 25) push('matches25');
    if (ref.record.matches >= 50) push('matches50');
    if (ref.record.matches >= 100) push('matches100');
    if (career.divisionId === 'primera') push('topFlight');
    if (['europa', 'continental'].includes(career.divisionId)) push('international');
    if (career.divisionId === 'mundial' && report.title) push('worldFinal');
    if (career.currentAssignment && career.currentAssignment.derby && report.rating.overall >= 8) push('calmDerby');
    if (report.incidents.some((i) => i.type === 'crowd') && !report.abandoned) push('saveTheMatch');
    return out;
  }

  check(kind, data = {}) {
    const out = [];
    const push = (id) => { const d = this.unlock(id); if (d) out.push(d); };
    if (kind === 'ethics') {
      if (data.choice === 'refuse') push('refuseBribe');
      if (data.choice === 'report') push('reportBribe');
    }
    if (kind === 'promotion') push('promotion');
    if (kind === 'exam' && data.perfect) push('examAce');
    if (kind === 'syndicate' && data.exposed) push('exposeNetwork');
    if (kind === 'fitness' && data.remaining > 60) push('ironLungs');
    return out;
  }

  /** Los textos se resuelven aquí, en el borde: la lógica sólo maneja ids. */
  all() {
    return ACHIEVEMENT_IDS.map((id) => ({
      id,
      name: t(`ach.${id}.name`),
      desc: t(`ach.${id}.desc`),
      unlocked: !!this.unlocked[id],
    }));
  }

  serialize() { return { unlocked: this.unlocked }; }
  restore(d) { if (d && d.unlocked) this.unlocked = { ...this.unlocked, ...d.unlocked }; }
}

export default AchievementSystem;
