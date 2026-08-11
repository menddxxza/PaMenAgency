// Pruebas del Rule Engine. Son casos de reglamento, no de implementación:
// si alguna falla, el juego estaría enseñando una regla equivocada.

import RuleEngine, { SEVERITY, GRADE } from '../src/rules/ruleEngine.js';
import { check, suite } from './harness.js';

export default suite('Reglamento', (t) => {
  // ---------------------------------------------------------------- faltas

  t('una entrada limpia no es falta', () => {
    const r = RuleEngine.evaluateFoul({ contact: 0.2, playedBall: true, brutality: 0.1 });
    check(r.isFoul === false, 'debería no ser falta');
    check(r.card === null, 'no debería llevar tarjeta');
  });

  t('jugar el balón no salva una entrada con fuerza excesiva', () => {
    const r = RuleEngine.evaluateFoul({
      contact: 1.2, playedBall: true, brutality: 1.1, speed: 18, studsUp: true,
    });
    check(r.isFoul === true, 'debería ser falta');
    check(r.severity === SEVERITY.EXCESSIVE, `esperaba fuerza excesiva, salió ${r.severity}`);
    check(r.card === 'red', 'debería ser roja');
  });

  t('la entrada temeraria es amarilla, no roja', () => {
    const r = RuleEngine.evaluateFoul({ contact: 0.85, brutality: 0.6, speed: 10, fromBehind: true });
    check(r.isFoul === true, 'debería ser falta');
    check(r.severity === SEVERITY.RECKLESS, `esperaba temeraria, salió ${r.severity}`);
    check(r.card === 'yellow', `esperaba amarilla, salió ${r.card}`);
  });

  t('la falta imprudente no lleva tarjeta', () => {
    const r = RuleEngine.evaluateFoul({ contact: 0.5, brutality: 0.15, speed: 4 });
    check(r.isFoul === true, 'debería ser falta');
    check(r.severity === SEVERITY.CARELESS, `esperaba imprudente, salió ${r.severity}`);
    check(r.card === null, 'no debería llevar tarjeta');
  });

  t('la simulación se castiga con amarilla al que se tira', () => {
    const r = RuleEngine.evaluateFoul({ contact: 0.1, dive: true, inBox: true });
    check(r.simulation === true, 'debería detectarse simulación');
    check(r.isFoul === false, 'no debería ser falta del defensor');
    check(r.card === 'yellow', 'debería ser amarilla');
  });

  // ----------------------------------------------------------- disciplina

  t('ocasión manifiesta fuera del área es roja', () => {
    const d = RuleEngine.evaluateDisciplinaryAction({ severity: SEVERITY.CARELESS, dogso: true, inBox: false });
    check(d.card === 'red', `esperaba roja, salió ${d.card}`);
  });

  t('ocasión manifiesta dentro del área intentando jugar el balón baja a amarilla', () => {
    const d = RuleEngine.evaluateDisciplinaryAction({
      severity: SEVERITY.CARELESS, dogso: true, inBox: true, attemptedBall: true,
    });
    check(d.card === 'yellow', `esperaba amarilla, salió ${d.card}`);
  });

  t('interrumpir un ataque prometedor es amarilla', () => {
    const d = RuleEngine.evaluateDisciplinaryAction({ severity: SEVERITY.CARELESS, spa: true });
    check(d.card === 'yellow', `esperaba amarilla, salió ${d.card}`);
  });

  t('la reiteración de faltas acaba en amarilla', () => {
    const d = RuleEngine.evaluateDisciplinaryAction({ severity: SEVERITY.CARELESS, persistent: true });
    check(d.card === 'yellow', `esperaba amarilla, salió ${d.card}`);
    check(d.reason === 'foul.persistent', `motivo incorrecto: ${d.reason}`);
  });

  t('la conducta violenta es roja siempre', () => {
    const d = RuleEngine.evaluateDisciplinaryAction({ severity: SEVERITY.CARELESS, violent: true });
    check(d.card === 'red', 'debería ser roja');
  });

  // ------------------------------------------------------ pérdida de tiempo

  t('un retraso corto sólo merece advertencia', () => {
    const r = RuleEngine.evaluateTimeWasting({ delaySeconds: 5, minute: 80, leading: true });
    check(r.card === null, `no debería haber tarjeta, salió ${r.card}`);
  });

  t('un retraso descarado es amarilla', () => {
    const r = RuleEngine.evaluateTimeWasting({ delaySeconds: 14, minute: 85, leading: true });
    check(r.card === 'yellow', 'debería ser amarilla');
  });

  t('reincidir tras la advertencia es amarilla aunque el retraso sea menor', () => {
    const r = RuleEngine.evaluateTimeWasting({ delaySeconds: 7, minute: 70, leading: true, alreadyWarned: true });
    check(r.card === 'yellow', 'debería ser amarilla por reincidencia');
  });

  // ------------------------------------------------------------------ mano

  t('el brazo pegado al cuerpo tras rebote propio no es mano', () => {
    const r = RuleEngine.evaluateHandball({
      armDistanceFromBody: 0.05, deflectedOffOwnBody: true, inBox: true, distanceToShooter: 3,
    });
    check(r.offence === false, 'no debería ser infracción');
  });

  t('hacerse más grande con el brazo es mano', () => {
    const r = RuleEngine.evaluateHandball({
      armDistanceFromBody: 0.95, movementTowardsBall: 0.6, distanceToShooter: 8, inBox: true,
    });
    check(r.offence === true, 'debería ser infracción');
    check(r.penalty === true, 'dentro del área debería ser penalti');
  });

  t('un gol con la mano se anula aunque sea involuntario', () => {
    const r = RuleEngine.evaluateHandball({ isAttacker: true, leadsToGoal: true, armDistanceFromBody: 0 });
    check(r.offence === true, 'debería ser infracción');
    check(r.disallowGoal === true, 'debería anular el gol');
  });

  t('el portero puede usar las manos en su área', () => {
    const r = RuleEngine.evaluateHandball({ isGoalkeeperInBox: true, armDistanceFromBody: 1 });
    check(r.offence === false, 'no debería ser infracción');
  });

  // ---------------------------------------------------------- fuera de juego

  t('no hay fuera de juego desde saque de banda', () => {
    const r = RuleEngine.evaluateOffside({ attackerAheadBy: 3, fromThrowIn: true });
    check(r.offside === false, 'no debería haber fuera de juego');
  });

  t('no hay fuera de juego en campo propio', () => {
    const r = RuleEngine.evaluateOffside({ attackerAheadBy: 2, inOwnHalf: true });
    check(r.offside === false, 'no debería haber fuera de juego');
  });

  t('el despeje deliberado del defensor habilita', () => {
    const r = RuleEngine.evaluateOffside({ attackerAheadBy: 4, deliberatePlayByDefender: true });
    check(r.offside === false, 'no debería haber fuera de juego');
  });

  t('estar por detrás del penúltimo defensor habilita', () => {
    const r = RuleEngine.evaluateOffside({ attackerAheadBy: -0.4 });
    check(r.offside === false, 'no debería haber fuera de juego');
  });

  t('sin participación activa no se sanciona', () => {
    const r = RuleEngine.evaluateOffside({ attackerAheadBy: 2, activeInterference: false });
    check(r.offside === false, 'no debería sancionarse');
  });

  t('adelantado e interviniendo es fuera de juego', () => {
    const r = RuleEngine.evaluateOffside({ attackerAheadBy: 1.2, activeInterference: true });
    check(r.offside === true, 'debería ser fuera de juego');
  });

  // --------------------------------------------------------------- ventaja

  t('no se da ventaja ante una acción de fuerza excesiva', () => {
    const r = RuleEngine.evaluateAdvantage({ severity: SEVERITY.EXCESSIVE, clearOpportunity: true });
    check(r.advisable === false, 'no debería ser aconsejable');
  });

  t('la ventaja es aconsejable con ocasión clara', () => {
    const r = RuleEngine.evaluateAdvantage({ clearOpportunity: true, severity: SEVERITY.CARELESS });
    check(r.advisable === true, 'debería ser aconsejable');
  });

  t('dentro del área es mejor el penalti que la ventaja dudosa', () => {
    const r = RuleEngine.evaluateAdvantage({ inBox: true, clearOpportunity: false });
    check(r.advisable === false, 'no debería aconsejarse ventaja');
  });

  // --------------------------------------------------------- reanudaciones

  t('último toque del defensor por línea de meta es córner', () => {
    const r = RuleEngine.evaluateRestart({ exitEdge: 'goalline', lastTouchSide: 1, defendingSide: 1 });
    check(r.type === 'corner', `esperaba córner, salió ${r.type}`);
    check(r.toSide === 0, 'el córner es para el atacante');
  });

  t('último toque del atacante por línea de meta es saque de puerta', () => {
    const r = RuleEngine.evaluateRestart({ exitEdge: 'goalline', lastTouchSide: 0, defendingSide: 1 });
    check(r.type === 'goalKick', `esperaba saque de puerta, salió ${r.type}`);
  });

  t('el saque de banda es para el rival del último que tocó', () => {
    const r = RuleEngine.evaluateRestart({ exitEdge: 'touchline', lastTouchSide: 0, defendingSide: 1 });
    check(r.type === 'throwIn' && r.toSide === 1, 'debería ser banda para el otro equipo');
  });

  // ------------------------------------------------------------------- VAR

  t('el VAR no revisa una segunda amarilla', () => {
    const reviewable = RuleEngine.isVarReviewable({ type: 'dissent', truth: { card: 'yellow' } });
    check(reviewable === false, 'no debería ser revisable');
  });

  t('el VAR revisa siempre un gol', () => {
    check(RuleEngine.isVarReviewable({ type: 'goal' }) === true, 'debería ser revisable');
  });

  t('el VAR revisa un posible penalti', () => {
    check(RuleEngine.isVarReviewable({ type: 'penaltyShout', inBox: true }) === true, 'debería ser revisable');
  });

  t('el VAR sólo entra ante error claro', () => {
    const inc = { type: 'goal', truth: { goal: true }, impact: 'critical' };
    const noEntra = RuleEngine.varShouldIntervene(inc, { action: 'goal' }, { varSkill: 90 });
    check(noEntra.intervene === false, 'no debería intervenir si la decisión es correcta');
    const entra = RuleEngine.varShouldIntervene(inc, { action: 'noGoal' }, { varSkill: 90 });
    check(entra.intervene === true, 'debería intervenir ante un error claro');
  });

  // ------------------------------------------------------ calificar decisión

  t('acertar falta y tarjeta es correcta', () => {
    const inc = { type: 'challenge', truth: { isFoul: true, card: 'yellow' } };
    const g = RuleEngine.gradeDecision(inc, { action: 'foul', card: 'yellow' });
    check(g.grade === GRADE.CORRECT, `esperaba correcta, salió ${g.grade}`);
  });

  t('acertar la falta y fallar la tarjeta no es lo mismo que inventarse la falta', () => {
    const inc = { type: 'challenge', truth: { isFoul: true, card: 'yellow' } };
    const parcial = RuleEngine.gradeDecision(inc, { action: 'foul', card: null });
    const inventada = RuleEngine.gradeDecision({ type: 'challenge', truth: { isFoul: false } }, { action: 'foul' });
    check(parcial.grade === GRADE.MOSTLY, `esperaba mayormente correcta, salió ${parcial.grade}`);
    check(inventada.grade === GRADE.INCORRECT, `esperaba incorrecta, salió ${inventada.grade}`);
    check(parcial.score > inventada.score, 'la parcial debe puntuar más que la inventada');
  });

  t('inventarse un penalti es lo peor que se puede hacer', () => {
    const g = RuleEngine.gradeDecision({ type: 'penaltyShout', truth: { isFoul: false }, inBox: true }, { action: 'penalty' });
    check(g.grade === GRADE.INCORRECT && g.score === 0, 'debería ser incorrecta con puntuación cero');
  });

  t('un fuera de juego muy ajustado es discutible, no incorrecto', () => {
    const inc = { type: 'offside', truth: { offside: true, margin: 0.1 } };
    const g = RuleEngine.gradeDecision(inc, { action: 'playon' });
    check(g.grade === GRADE.DEBATABLE, `esperaba discutible, salió ${g.grade}`);
  });

  t('dejar una ventaja aconsejable es correcto', () => {
    const inc = {
      type: 'challenge',
      truth: { isFoul: true, card: null },
      advantageFacts: { clearOpportunity: true, severity: SEVERITY.CARELESS },
    };
    const g = RuleEngine.gradeDecision(inc, { action: 'advantage' });
    check(g.grade === GRADE.CORRECT, `esperaba correcta, salió ${g.grade}`);
  });
});
