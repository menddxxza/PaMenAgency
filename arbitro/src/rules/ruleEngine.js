// RULE ENGINE
// Único lugar del proyecto donde vive el criterio reglamentario.
// La UI nunca decide qué es correcto: pregunta aquí.
//
// Todas las funciones son puras: reciben hechos físicos y devuelven
// la resolución reglamentaria + la referencia de la regla aplicada.

import { clamp } from '../core/rng.js';
import { FIELD } from '../core/config.js';

export const SEVERITY = { CLEAN: 'clean', CARELESS: 'careless', RECKLESS: 'reckless', EXCESSIVE: 'excessive' };
export const GRADE = { CORRECT: 'correct', MOSTLY: 'mostly', DEBATABLE: 'debatable', INCORRECT: 'incorrect' };

/** ¿El punto está dentro del área del equipo `defSide`? */
export function inPenaltyArea(pos, defGoalX) {
  const withinX = defGoalX === 0
    ? pos.x <= FIELD.penaltyAreaLength
    : pos.x >= FIELD.length - FIELD.penaltyAreaLength;
  const withinY = Math.abs(pos.y - FIELD.width / 2) <= FIELD.penaltyAreaWidth / 2;
  return withinX && withinY;
}

// ------------------------------------------------------------------ faltas

/**
 * Evalúa un contacto entre defensor y atacante.
 * facts: { contact (0..1), severityRoll, fromBehind, playedBall, speed,
 *          armUse, studsUp, aggression, inBox, dogso, spa, dive }
 */
export function evaluateFoul(facts) {
  const {
    contact = 0, playedBall = false, fromBehind = false, speed = 0,
    studsUp = false, armUse = false, dive = false, inBox = false,
    dogso = false, spa = false, victimFell = true, brutality = 0,
  } = facts;

  if (dive) {
    return {
      isFoul: false, simulation: true, severity: SEVERITY.CLEAN,
      foulType: 'simulation', card: 'yellow', cardReason: 'foul.simulation',
      restart: inBox ? 'indirectFreeKickDef' : 'freeKickDef',
      rule: 'rulebook.fouls', text: 'law.dive',
    };
  }

  // Balón jugado limpiamente y sin brutalidad => no hay infracción
  if (playedBall && brutality < 0.55 && contact < 0.55) {
    return {
      isFoul: false, severity: SEVERITY.CLEAN, foulType: 'foul.cleanTackle',
      card: null, restart: 'none', rule: 'rulebook.fouls', text: 'law.cleanTackle',
    };
  }

  const threshold = 0.34;
  if (contact < threshold && !studsUp && !armUse) {
    return {
      isFoul: false, severity: SEVERITY.CLEAN, foulType: 'foul.fairCharge',
      card: null, restart: 'none', rule: 'rulebook.fouls', text: 'law.fairCharge',
    };
  }

  // Gravedad. La inmensa mayoría de faltas son simplemente imprudentes
  // (careless): sin tarjeta. Temeraria = amarilla. Fuerza excesiva = roja.
  let severity = SEVERITY.CARELESS;
  const intensity = contact * 0.42 + brutality * 0.85 + speed / 45
    + (fromBehind ? 0.08 : 0) + (studsUp ? 0.26 : 0);
  if (intensity > 1.28) severity = SEVERITY.EXCESSIVE;
  else if (intensity > 0.88) severity = SEVERITY.RECKLESS;

  let foulType = 'foul.trip';
  if (armUse) foulType = 'foul.push';
  else if (studsUp) foulType = severity === SEVERITY.EXCESSIVE ? 'foul.excessiveForce' : 'foul.stamp';
  else if (fromBehind) foulType = 'foul.recklessTackle';
  else if (!victimFell) foulType = 'foul.hold';
  else if (speed > 14) foulType = 'foul.charge';

  const disc = evaluateDisciplinaryAction({ severity, dogso, spa, foulType, inBox, persistent: facts.persistent });

  return {
    isFoul: true,
    severity,
    foulType,
    card: disc.card,
    cardReason: disc.reason,
    restart: inBox ? 'penalty' : 'freeKickAtt',
    penalty: inBox,
    dogso, spa,
    rule: inBox ? 'rulebook.penalty' : 'rulebook.fouls',
    text: 'law.foul',
  };
}

// -------------------------------------------------------------- disciplina

/**
 * Decide la sanción disciplinaria de una infracción ya calificada.
 * Aplica el principio de "penalti = doble sanción atenuada": si el defensor
 * intentaba jugar el balón dentro del área, la roja por DOGSO baja a amarilla.
 */
export function evaluateDisciplinaryAction(facts) {
  const {
    severity, dogso = false, spa = false, inBox = false, attemptedBall = true,
    violent = false, persistent = false,
  } = facts;

  if (violent) return { card: 'red', reason: 'foul.violent', rule: 'rulebook.cards' };
  if (severity === SEVERITY.EXCESSIVE) {
    return { card: 'red', reason: 'foul.excessiveForce', rule: 'rulebook.cards' };
  }
  if (dogso) {
    if (inBox && attemptedBall) return { card: 'yellow', reason: 'foul.dogso', rule: 'rulebook.cards' };
    return { card: 'red', reason: 'foul.dogso', rule: 'rulebook.cards' };
  }
  if (severity === SEVERITY.RECKLESS) {
    return { card: 'yellow', reason: 'foul.recklessTackle', rule: 'rulebook.cards' };
  }
  if (spa) return { card: 'yellow', reason: 'foul.spa', rule: 'rulebook.cards' };
  // Reiteración: el jugador que acumula infracciones acaba amonestado aunque
  // ninguna de ellas, por separado, mereciera tarjeta.
  if (persistent) return { card: 'yellow', reason: 'foul.persistent', rule: 'rulebook.cards' };
  return { card: null, reason: null, rule: 'rulebook.cards' };
}

/**
 * Pérdida de tiempo / impedir la reanudación.
 * facts: { delaySeconds, minute, leading, alreadyWarned }
 */
export function evaluateTimeWasting(facts) {
  const { delaySeconds = 0, minute = 45, leading = false, alreadyWarned = false } = facts;
  const blatant = delaySeconds > 12 || (delaySeconds > 8 && leading && minute > 75);
  if (blatant || (alreadyWarned && delaySeconds > 6)) {
    return {
      card: 'yellow',
      reason: alreadyWarned ? 'foul.delayRestart' : 'foul.timewasting',
      rule: 'rulebook.cards', delaySeconds, blatant: true,
    };
  }
  return { card: null, reason: 'foul.timewasting', rule: 'rulebook.cards', delaySeconds, blatant: false };
}

// -------------------------------------------------------------------- mano

/**
 * facts: { armDistanceFromBody (0..1), movementTowardsBall (0..1),
 *          distanceToShooter (m), armAboveShoulder, deflectedOffOwnBody,
 *          isAttacker, leadsToGoal, isGoalkeeperInBox, inBox }
 */
export function evaluateHandball(facts) {
  const {
    armDistanceFromBody = 0, movementTowardsBall = 0, distanceToShooter = 10,
    armAboveShoulder = false, deflectedOffOwnBody = false, isAttacker = false,
    leadsToGoal = false, isGoalkeeperInBox = false, inBox = false, deliberateStop = false,
  } = facts;

  if (isGoalkeeperInBox) {
    return { offence: false, card: null, restart: 'none', rule: 'rulebook.handball', text: 'law.gkHands' };
  }

  // Gol marcado con la mano (o inmediatamente antes) = siempre infracción
  if (isAttacker && leadsToGoal) {
    return {
      offence: true, card: null, restart: 'freeKickDef', disallowGoal: true,
      rule: 'rulebook.handball', text: 'law.attackerHandGoal',
    };
  }

  if (armAboveShoulder && !deflectedOffOwnBody) {
    return {
      offence: true, card: deliberateStop ? 'red' : null,
      cardReason: deliberateStop ? 'foul.dogso' : null,
      restart: inBox ? 'penalty' : 'freeKickAtt', penalty: inBox,
      rule: 'rulebook.handball', text: 'law.armAboveShoulder',
    };
  }

  // Distancia corta + rebote en el propio cuerpo => no sancionable
  if (deflectedOffOwnBody || distanceToShooter < 1.6) {
    return { offence: false, card: null, restart: 'none', rule: 'rulebook.handball', text: 'law.unavoidableHand' };
  }

  const unnatural = armDistanceFromBody * 0.65 + movementTowardsBall * 0.55
    + clamp((5 - distanceToShooter) / 5, 0, 1) * -0.25;

  if (unnatural > 0.62 || deliberateStop) {
    return {
      offence: true,
      card: deliberateStop && !inBox ? 'yellow' : null,
      cardReason: deliberateStop && !inBox ? 'foul.spa' : null,
      restart: inBox ? 'penalty' : 'freeKickAtt', penalty: inBox,
      rule: 'rulebook.handball', text: 'law.unnaturalPosition',
    };
  }

  return { offence: false, card: null, restart: 'none', rule: 'rulebook.handball', text: 'law.naturalPosition' };
}

// ------------------------------------------------------------ fuera de juego

/**
 * facts: { attackerAheadBy (m; >0 = por delante del penúltimo defensor),
 *          activeInterference, deliberatePlayByDefender, fromThrowIn,
 *          fromGoalKick, fromCorner, inOwnHalf, rebound }
 */
export function evaluateOffside(facts) {
  const {
    attackerAheadBy = -1, activeInterference = true, deliberatePlayByDefender = false,
    fromThrowIn = false, fromGoalKick = false, fromCorner = false, inOwnHalf = false,
    reboundOffPost = false, reboundOffDefender = false,
  } = facts;

  if (fromThrowIn || fromGoalKick || fromCorner) {
    return { offside: false, margin: 0, rule: 'rulebook.offside', text: 'law.noOffsideRestart' };
  }
  if (inOwnHalf) {
    return { offside: false, margin: 0, rule: 'rulebook.offside', text: 'law.ownHalf' };
  }
  if (deliberatePlayByDefender && !reboundOffPost && !reboundOffDefender) {
    return { offside: false, margin: 0, rule: 'rulebook.offside', text: 'law.deliberatePlay' };
  }
  if (attackerAheadBy <= 0) {
    return { offside: false, margin: attackerAheadBy, rule: 'rulebook.offside', text: 'law.onside' };
  }
  if (!activeInterference && !reboundOffPost) {
    return { offside: false, margin: attackerAheadBy, rule: 'rulebook.offside', text: 'law.notInvolved' };
  }
  return {
    offside: true, margin: attackerAheadBy, restart: 'indirectFreeKickDef',
    rule: 'rulebook.offside', text: 'law.offside',
  };
}

// ---------------------------------------------------------------- penaltis

export function evaluatePenalty(facts) {
  const foul = evaluateFoul({ ...facts, inBox: true });
  if (foul.simulation) return { penalty: false, simulation: true, ...foul };
  return { penalty: foul.isFoul, ...foul };
}

// ----------------------------------------------------------------- ventaja

/**
 * ¿Conviene aplicar ventaja? facts:
 * { possessionRetained, attackDirection (0..1 hacia gol), clearOpportunity,
 *   severity, inBox, immediateDanger }
 */
export function evaluateAdvantage(facts) {
  const {
    possessionRetained = false, promisingAttack = false, clearOpportunity = false,
    severity = SEVERITY.CARELESS, inBox = false, minute = 45,
  } = facts;

  // Nunca se da ventaja ante brutalidad: hay que parar el juego.
  if (severity === SEVERITY.EXCESSIVE) {
    return { advisable: false, reason: 'law.noAdvantageViolent', rule: 'rulebook.advantage' };
  }
  if (inBox) {
    return {
      advisable: clearOpportunity, reason: clearOpportunity ? 'law.advantageInBox' : 'law.penaltyBetter',
      rule: 'rulebook.advantage',
    };
  }
  if (clearOpportunity) return { advisable: true, reason: 'law.clearAdvantage', rule: 'rulebook.advantage' };
  if (promisingAttack && possessionRetained) {
    return { advisable: true, reason: 'law.promisingAdvantage', rule: 'rulebook.advantage' };
  }
  return { advisable: false, reason: 'law.noAdvantage', rule: 'rulebook.advantage' };
}

/** Ventana en la que la ventaja debe materializarse (segundos). */
export const ADVANTAGE_WINDOW = 4.5;

// ------------------------------------------------------------ reanudaciones

export function evaluateRestart(facts) {
  const { side, exitEdge, lastTouchSide, defendingSide } = facts;
  if (exitEdge === 'touchline') {
    return { type: 'throwIn', toSide: 1 - lastTouchSide, rule: 'rulebook.restarts', text: 'law.throwIn' };
  }
  // Línea de meta
  if (lastTouchSide === defendingSide) {
    return { type: 'corner', toSide: 1 - defendingSide, rule: 'rulebook.restarts', text: 'law.corner' };
  }
  return { type: 'goalKick', toSide: defendingSide, rule: 'rulebook.restarts', text: 'law.goalKick' };
}

// ------------------------------------------------------------------- gol

export function evaluateGoal(facts) {
  const { fullyCrossed, offsideInBuildUp, handballInBuildUp, foulInBuildUp, keeperFouled } = facts;
  if (!fullyCrossed) return { goal: false, reason: 'law.notCrossed', rule: 'rulebook.restarts' };
  if (offsideInBuildUp) return { goal: false, reason: 'law.offside', rule: 'rulebook.offside' };
  if (handballInBuildUp) return { goal: false, reason: 'law.attackerHandGoal', rule: 'rulebook.handball' };
  if (foulInBuildUp || keeperFouled) return { goal: false, reason: 'law.foul', rule: 'rulebook.fouls' };
  return { goal: true, reason: 'law.validGoal', rule: 'rulebook.restarts' };
}

// --------------------------------------------------------------------- VAR

export const VAR_REVIEWABLE = ['goal', 'penalty', 'redCard', 'mistakenIdentity'];

/** ¿Es revisable el incidente? El VAR NO revisa todo. */
export function isVarReviewable(incident) {
  switch (incident.type) {
    case 'goal': return true;
    case 'penaltyShout':
    case 'challenge': return incident.inBox === true || incident.truth?.card === 'red'
      || incident.decisionTaken?.card === 'red';
    case 'handball': return incident.inBox === true || !!incident.truth?.disallowGoal;
    case 'offside': return incident.leadsToGoal === true;
    case 'violence': return true;
    case 'mistakenIdentity': return true;
    default: return false;
  }
}

/** El VAR sólo interviene ante error claro y manifiesto. */
export function varShouldIntervene(incident, decision, opts = {}) {
  if (!isVarReviewable(incident)) return { intervene: false, reason: 'var.notReviewable' };
  const grade = gradeDecision(incident, decision).grade;
  const clearError = grade === GRADE.INCORRECT;
  const marginal = grade === GRADE.DEBATABLE;
  const skill = clamp((opts.varSkill ?? 70) / 100, 0.2, 1);
  if (clearError) return { intervene: true, reason: 'var.recommend', confidence: 0.6 + skill * 0.4 };
  if (marginal && opts.aggressiveVar) return { intervene: true, reason: 'var.recommend', confidence: 0.4 * skill };
  return { intervene: false, reason: 'var.noIntervention', confidence: skill };
}

// ------------------------------------------------------- calificar decisión

/**
 * Compara la decisión del árbitro con la verdad del incidente.
 * Devuelve una calificación matizada: acertar la falta y fallar la tarjeta
 * NO es lo mismo que inventarse una falta.
 */
export function gradeDecision(incident, decision) {
  const truth = incident.truth || {};
  const d = decision || {};
  const out = (grade, score, key, extra = {}) => ({
    grade, score, explanation: key, rule: truth.rule || incident.rule || 'rulebook.fouls', ...extra,
  });

  switch (incident.type) {
    case 'challenge':
    case 'penaltyShout': {
      const shouldWhistle = truth.isFoul || truth.simulation;
      const whistled = d.action === 'foul' || d.action === 'penalty' || d.action === 'dive';

      if (truth.simulation) {
        if (d.action === 'dive') {
          return d.card === 'yellow'
            ? out(GRADE.CORRECT, 1, 'eval.simCaught')
            : out(GRADE.MOSTLY, 0.8, 'eval.simNoCard');
        }
        if (d.action === 'penalty') return out(GRADE.INCORRECT, 0, 'eval.gavePenaltyToDive');
        if (d.action === 'foul') return out(GRADE.INCORRECT, 0.15, 'eval.gaveFoulToDive');
        return out(GRADE.DEBATABLE, 0.55, 'eval.missedSim');
      }

      if (!truth.isFoul) {
        if (!whistled) return out(GRADE.CORRECT, 1, 'eval.correctPlayOn');
        if (d.action === 'penalty') return out(GRADE.INCORRECT, 0, 'eval.inventedPenalty');
        return out(GRADE.INCORRECT, 0.2, 'eval.inventedFoul');
      }

      // Era falta
      if (!whistled && d.action !== 'advantage') {
        return truth.penalty
          ? out(GRADE.INCORRECT, 0, 'eval.missedPenalty')
          : out(GRADE.INCORRECT, 0.25, 'eval.missedFoul');
      }
      if (d.action === 'advantage') {
        const adv = evaluateAdvantage(incident.advantageFacts || {});
        return adv.advisable
          ? out(GRADE.CORRECT, 1, 'eval.goodAdvantage')
          : out(GRADE.DEBATABLE, 0.6, 'eval.badAdvantage');
      }
      if (truth.penalty && d.action !== 'penalty') return out(GRADE.MOSTLY, 0.6, 'eval.foulButNotPenalty');
      if (!truth.penalty && d.action === 'penalty') return out(GRADE.INCORRECT, 0.1, 'eval.penaltyOutsideBox');

      // Falta acertada: ahora la tarjeta
      const need = truth.card || null;
      const got = d.card || null;
      if (need === got) return out(GRADE.CORRECT, 1, 'eval.perfect');
      if (!need && got === 'yellow') return out(GRADE.MOSTLY, 0.7, 'eval.unnecessaryYellow');
      if (need === 'yellow' && !got) return out(GRADE.MOSTLY, 0.65, 'eval.missingYellow');
      if (need === 'red' && got === 'yellow') return out(GRADE.INCORRECT, 0.3, 'eval.shouldBeRed');
      if (need === 'yellow' && got === 'red') return out(GRADE.INCORRECT, 0.15, 'eval.tooHarshRed');
      if (!need && got === 'red') return out(GRADE.INCORRECT, 0, 'eval.inventedRed');
      if (need === 'red' && !got) return out(GRADE.INCORRECT, 0.1, 'eval.missedRed');
      return out(GRADE.DEBATABLE, 0.5, 'eval.debatableCard');
    }

    case 'handball': {
      const should = truth.offence;
      const gave = d.action === 'handball' || d.action === 'penalty';
      if (should === gave) {
        if (should && truth.penalty && d.action !== 'penalty') return out(GRADE.MOSTLY, 0.6, 'eval.handballNotPenalty');
        return out(GRADE.CORRECT, 1, should ? 'eval.correctHandball' : 'eval.correctNoHandball');
      }
      return out(GRADE.INCORRECT, should ? 0.15 : 0.1, should ? 'eval.missedHandball' : 'eval.inventedHandball');
    }

    case 'offside': {
      const should = truth.offside;
      const gave = d.action === 'offside';
      if (should === gave) return out(GRADE.CORRECT, 1, should ? 'eval.correctOffside' : 'eval.correctOnside');
      const tight = Math.abs(truth.margin || 0) < 0.25;
      if (tight) return out(GRADE.DEBATABLE, 0.55, 'eval.tightOffside');
      return out(GRADE.INCORRECT, 0.1, should ? 'eval.missedOffside' : 'eval.wrongOffside');
    }

    case 'outOfPlay': {
      const ok = d.action === 'restart' && d.restartType === truth.type && d.toSide === truth.toSide;
      if (ok) return out(GRADE.CORRECT, 1, 'eval.correctRestart');
      if (d.action === 'restart' && d.restartType === truth.type) return out(GRADE.MOSTLY, 0.5, 'eval.wrongSide');
      return out(GRADE.INCORRECT, 0.2, 'eval.wrongRestart');
    }

    case 'goal': {
      const should = truth.goal;
      const gave = d.action === 'goal';
      if (should === gave) return out(GRADE.CORRECT, 1, should ? 'eval.correctGoal' : 'eval.correctDisallow');
      if (truth.closeCall) return out(GRADE.DEBATABLE, 0.5, 'eval.closeGoal');
      return out(GRADE.INCORRECT, 0, should ? 'eval.disallowedValidGoal' : 'eval.allowedInvalidGoal');
    }

    case 'timewasting':
    case 'dissent':
    case 'violence': {
      const need = truth.card;
      const got = d.card || null;
      if (need === got) return out(GRADE.CORRECT, 1, 'eval.correctDiscipline');
      if (!need && got === 'yellow') return out(GRADE.DEBATABLE, 0.55, 'eval.softYellow');
      if (need === 'red' && got !== 'red') return out(GRADE.INCORRECT, 0.05, 'eval.missedRed');
      if (need === 'yellow' && !got) return out(GRADE.MOSTLY, 0.6, 'eval.missingYellow');
      return out(GRADE.DEBATABLE, 0.5, 'eval.debatableCard');
    }

    case 'injury': {
      const should = truth.stopPlay;
      const stopped = d.action === 'stop' || d.action === 'medics';
      if (should === stopped) return out(GRADE.CORRECT, 1, 'eval.correctInjuryCall');
      if (should) return out(GRADE.INCORRECT, 0.15, 'eval.shouldHaveStopped');
      return out(GRADE.DEBATABLE, 0.6, 'eval.stoppedUnnecessarily');
    }

    case 'crowd':
    case 'security': {
      const need = truth.protocol;
      if (d.action === need) return out(GRADE.CORRECT, 1, 'eval.correctProtocol');
      if (d.action === 'abandon' && need !== 'abandon') return out(GRADE.DEBATABLE, 0.45, 'eval.hastyAbandon');
      return out(GRADE.INCORRECT, 0.25, 'eval.wrongProtocol');
    }

    default:
      return out(GRADE.DEBATABLE, 0.5, 'eval.unclassified');
  }
}

export const GRADE_WEIGHT = {
  [GRADE.CORRECT]: 1,
  [GRADE.MOSTLY]: 0.72,
  [GRADE.DEBATABLE]: 0.45,
  [GRADE.INCORRECT]: 0,
};

export default {
  evaluateFoul, evaluateHandball, evaluateOffside, evaluatePenalty,
  evaluateAdvantage, evaluateDisciplinaryAction, evaluateTimeWasting,
  evaluateRestart, evaluateGoal,
  gradeDecision, isVarReviewable, varShouldIntervene, inPenaltyArea,
};
