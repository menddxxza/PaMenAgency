// Árbitro automático: resuelve incidentes sin jugador humano.
// Se usa para pruebas, para el tutorial y para simular partidos de fondo.

import { clamp } from '../core/rng.js';

/**
 * @param {object} opts - { skill 0..100, bias, rng }
 * @returns {function} (incident, options, match, ctx) -> payload
 */
export function makeAutoReferee(opts = {}) {
  const skill = clamp(opts.skill ?? 65, 5, 99) / 100;
  const rng = opts.rng;

  const roll = (clarity) => {
    const p = clamp(skill * (0.6 + clarity * 0.4), 0.05, 0.98);
    return (rng ? rng.next() : Math.random()) < p;
  };

  return function autoReferee(inc, options, match, ctx = {}) {
    const truth = inc.truth || {};
    const sees = roll(inc.clarity ?? 0.7);

    if (ctx.cardPhase) {
      const need = truth.card || null;
      const card = sees ? need : (need === 'red' ? 'yellow' : need === 'yellow' ? null : null);
      return { card };
    }

    switch (inc.type) {
      case 'challenge':
      case 'penaltyShout': {
        if (truth.simulation) return sees ? { action: 'dive', card: 'yellow' } : { action: 'playon' };
        if (!truth.isFoul) return sees ? { action: 'playon' } : { action: inc.inBox ? 'penalty' : 'foul' };
        if (inc.inBox) return sees ? { action: 'penalty' } : { action: 'playon' };
        // Ventaja si procede
        if (sees && (inc.spa || inc.dogso === false) && match.possession === inc.victimSide
          && (rng ? rng.next() : Math.random()) < 0.3) {
          return { action: 'advantage' };
        }
        return sees ? { action: 'foul' } : { action: 'playon' };
      }
      case 'handball':
        return (sees ? truth.offence : !truth.offence)
          ? { action: inc.inBox ? 'penalty' : 'handball' }
          : { action: 'playon' };
      case 'offside':
        return (sees ? truth.offside : !truth.offside) ? { action: 'offside' } : { action: 'playon' };
      case 'outOfPlay': {
        const right = sees;
        const type = inc.truth.type;
        const toSide = right ? inc.truth.toSide : 1 - inc.truth.toSide;
        return { action: 'restart', restartType: type, toSide };
      }
      case 'goal':
        return (sees ? truth.goal : !truth.goal) ? { action: 'goal' } : { action: 'noGoal' };
      case 'dissent':
        return truth.card === 'yellow' && sees ? { action: 'card', card: 'yellow' } : { action: 'warning' };
      case 'violence':
        return sees ? { action: 'card', card: 'red' } : { action: 'card', card: 'yellow' };
      case 'injury':
        return truth.stopPlay ? { action: 'medics' } : { action: 'playon' };
      case 'crowd':
        return { action: truth.protocol === 'stop' ? 'stop' : 'protocol' };
      default:
        return { action: 'playon' };
    }
  };
}

export default makeAutoReferee;
