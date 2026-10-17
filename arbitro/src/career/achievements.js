// Logros. Se guardan a nivel de perfil (persisten entre carreras).

import { loadAchievements, saveAchievements } from '../core/save.js';

export const ACHIEVEMENTS = [
  { id: 'firstMatch', name: 'Debut', desc: 'Arbitra tu primer partido.' },
  { id: 'firstYellow', name: 'Primera amarilla', desc: 'Muestra tu primera cartulina amarilla.' },
  { id: 'firstRed', name: 'Primera roja', desc: 'Expulsa a un jugador por primera vez.' },
  { id: 'firstVar', name: 'Al monitor', desc: 'Completa tu primera revisión VAR.' },
  { id: 'firstPenalty', name: 'Señalando el punto', desc: 'Pita tu primer penalti.' },
  { id: 'perfectMatch', name: 'Partido perfecto', desc: 'Termina un partido sin una sola decisión incorrecta.' },
  { id: 'flawless', name: 'Sobresaliente', desc: 'Consigue una nota de 9.0 o superior.' },
  { id: 'matches25', name: '25 partidos', desc: 'Arbitra 25 partidos.' },
  { id: 'matches50', name: '50 partidos', desc: 'Arbitra 50 partidos.' },
  { id: 'matches100', name: 'Centenario', desc: 'Arbitra 100 partidos.' },
  { id: 'promotion', name: 'Escalando', desc: 'Asciende de categoría.' },
  { id: 'topFlight', name: 'Élite', desc: 'Llega a la Primera División Ibérica.' },
  { id: 'international', name: 'Internacional', desc: 'Arbitra una competición continental.' },
  { id: 'worldFinal', name: 'La final', desc: 'Arbitra una final internacional.' },
  { id: 'fiveReds', name: 'Noche caliente', desc: 'Expulsa a cinco jugadores en un partido.' },
  { id: 'abandon', name: 'Se acabó', desc: 'Suspende un partido.' },
  { id: 'refuseBribe', name: 'Incorruptible', desc: 'Rechaza un soborno.' },
  { id: 'reportBribe', name: 'Denunciante', desc: 'Denuncia un intento de soborno.' },
  { id: 'exposeNetwork', name: 'La red al descubierto', desc: 'Destapa la red de amaños.' },
  { id: 'advantageMaster', name: 'Ley de la ventaja', desc: 'Aplica tres ventajas acertadas en un partido.' },
  { id: 'calmDerby', name: 'Mano firme', desc: 'Termina un derbi con nota 8 o más.' },
  { id: 'examAce', name: 'Reglamento al dedillo', desc: 'Aprueba un examen con el 100%.' },
  { id: 'ironLungs', name: 'Pulmones de acero', desc: 'Termina un partido con más del 60% de físico.' },
  { id: 'saveTheMatch', name: 'Salvar el partido', desc: 'Gestiona un incidente grave sin suspender el encuentro.' },
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
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return null;
    this.unlocked[id] = { at: Date.now() };
    saveAchievements(this.unlocked);
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

  all() {
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!this.unlocked[a.id] }));
  }

  serialize() { return { unlocked: this.unlocked }; }
  restore(d) { if (d && d.unlocked) this.unlocked = { ...this.unlocked, ...d.unlocked }; }
}

export default AchievementSystem;
