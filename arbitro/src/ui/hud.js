// HUD del partido: marcador, reloj, nota, estadísticas, botones
// contextuales, panel de decisión, consulta al asistente y sala VAR.

import { t, tv } from '../core/i18n.js';
import { clamp } from '../core/rng.js';
import { CAMERAS } from '../match/var.js';

const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

const fmtClock = (sec) => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export class HUD {
  constructor(root, game) {
    this.root = root;
    this.game = game;
    this.build();
    this.decisionTimer = null;
  }

  build() {
    const wasHidden = this.root.classList.contains('hidden');
    this.root.innerHTML = '';
    this.root.className = `hud${wasHidden ? ' hidden' : ''}`;

    // ---- marcador
    this.top = el('div', 'hud-top');
    this.top.innerHTML = `
      <div class="score-board">
        <div class="team home"><span class="chip"></span><span class="name"></span></div>
        <div class="score"><span class="sh">0</span><span class="sep">-</span><span class="sa">0</span></div>
        <div class="team away"><span class="name"></span><span class="chip"></span></div>
      </div>
      <div class="clock-box"><span class="clock">00:00</span><span class="added"></span><span class="period"></span></div>`;
    this.root.appendChild(this.top);

    // ---- nota + físico
    this.left = el('div', 'hud-left');
    this.left.innerHTML = `
      <div class="panel rating-panel">
        <div class="label">${t('hud.rating')}</div>
        <div class="rating-value">–</div>
        <div class="bar"><i></i></div>
        <div class="label small">${t('hud.stamina')}</div>
        <div class="bar stamina"><i></i></div>
      </div>`;
    this.root.appendChild(this.left);

    // ---- estadísticas
    this.right = el('div', 'hud-right');
    this.right.innerHTML = `<div class="panel stats-panel"></div>`;
    this.root.appendChild(this.right);

    // ---- botones contextuales
    this.actions = el('div', 'hud-actions');
    this.root.appendChild(this.actions);

    // ---- panel de decisión
    this.decision = el('div', 'decision-panel hidden');
    this.root.appendChild(this.decision);

    // ---- VAR
    this.varPanel = el('div', 'var-panel hidden');
    this.root.appendChild(this.varPanel);

    // ---- avisos
    this.toasts = el('div', 'toasts');
    this.root.appendChild(this.toasts);

    // ---- evaluación
    this.evalBox = el('div', 'eval-box hidden');
    this.root.appendChild(this.evalBox);
  }

  // ------------------------------------------------------------ marcador

  update(match, engine) {
    const [h, a] = match.teams;
    const q = (s) => this.top.querySelector(s);
    q('.team.home .chip').style.background = (match.kits ? match.kits[0].primary : h.colors.primary);
    q('.team.away .chip').style.background = (match.kits ? match.kits[1].primary : a.colors.primary);
    q('.team.home .name').textContent = h.shortName || h.name;
    q('.team.away .name').textContent = a.shortName || a.name;
    q('.sh').textContent = match.score[0];
    q('.sa').textContent = match.score[1];
    q('.clock').textContent = fmtClock(match.clock);
    q('.added').textContent = match.addedTime ? `+${Math.round(match.addedTime / 60)}` : '';
    const periods = { 1: 'hud.half1', 2: 'hud.half2', 3: 'hud.et1', 4: 'hud.et2', 5: 'hud.shootout' };
    q('.period').textContent = t(periods[match.half] || 'hud.half1');

    const r = engine.rating.current();
    const rv = this.left.querySelector('.rating-value');
    rv.textContent = r.toFixed(1);
    rv.className = `rating-value ${r >= 8 ? 'good' : r >= 6.5 ? 'ok' : r >= 5 ? 'warn' : 'bad'}`;
    this.left.querySelector('.bar > i').style.width = `${r * 10}%`;
    const st = this.left.querySelector('.bar.stamina > i');
    st.style.width = `${match.ref.stamina}%`;
    st.className = match.ref.stamina < 25 ? 'low' : '';

    const s0 = match.stats[0], s1 = match.stats[1];
    const pos = engine._possessionPct();
    this.right.querySelector('.stats-panel').innerHTML = `
      <div class="row head"><span>${h.shortName}</span><span></span><span>${a.shortName}</span></div>
      <div class="row"><span>${pos[0]}%</span><span>${t('hud.possession')}</span><span>${pos[1]}%</span></div>
      <div class="row"><span>${s0.shots}</span><span>${t('report.shots')}</span><span>${s1.shots}</span></div>
      <div class="row"><span>${s0.fouls}</span><span>${t('hud.fouls')}</span><span>${s1.fouls}</span></div>
      <div class="row"><span class="yc">${s0.yellows}</span><span>${t('report.yellows')}</span><span class="yc">${s1.yellows}</span></div>
      <div class="row"><span class="rc">${s0.reds}</span><span>${t('report.reds')}</span><span class="rc">${s1.reds}</span></div>
      <div class="row"><span>${s0.corners}</span><span>${t('report.corners')}</span><span>${s1.corners}</span></div>
      <div class="row"><span>${s0.offsides}</span><span>${t('report.offsides')}</span><span>${s1.offsides}</span></div>
      <div class="row"><span>${s0.subs}</span><span>${t('ui.subsShort')}</span><span>${s1.subs}</span></div>`;
  }

  /** Botonera permanente (fuera de incidentes). */
  renderIdleActions(engine) {
    const match = engine.match;
    this.actions.innerHTML = '';
    const add = (label, cls, fn, disabled) => {
      const b = el('button', `act ${cls}${disabled ? ' disabled' : ''}`, label);
      if (!disabled) b.onclick = fn;
      this.actions.appendChild(b);
      return b;
    };
    if (match.phase === 'halftime') {
      add(t('ui.continue'), 'primary', () => this.game.resumeSecondHalf());
      return;
    }
    add(t('act.assistant'), 'ghost', () => this.game.askAssistantFree());
    add(match.advantage ? t('act.whistle') : t('act.playon'),
      match.advantage ? 'accent' : 'ghost',
      () => { if (match.advantage) this.game.cancelAdvantage(); });
    add(t('act.stopMatch'), 'warn', () => this.game.stopMatchRequest());
    const speedBtn = add(`▶ ${this.game.speedLabel()}`, 'ghost', () => {
      this.game.cycleSpeed();
      speedBtn.textContent = `▶ ${this.game.speedLabel()}`;
    });
  }

  // ---------------------------------------------------------- decisión

  showDecision(incident, options, match, onChoose) {
    this.decision.classList.remove('hidden');
    this.decision.innerHTML = '';

    const head = el('div', 'dp-head');
    head.innerHTML = `<span class="dp-title">${this.incidentTitle(incident)}</span>
      <span class="dp-min">${incident.minute}'</span>`;
    this.decision.appendChild(head);

    const timerWrap = el('div', 'dp-timer');
    const timerBar = el('i');
    timerWrap.appendChild(timerBar);
    this.decision.appendChild(timerWrap);
    this.timerBar = timerBar;

    const hints = this.buildHints(incident, match);
    if (hints.length) {
      const h = el('div', 'dp-hints');
      hints.forEach((x) => h.appendChild(el('span', 'hint', x)));
      this.decision.appendChild(h);
    }

    const btns = el('div', 'dp-actions');
    options.forEach((o, i) => {
      const label = o.id === 'throwHome' ? t('act.throwA', { team: match.teams[0].shortName })
        : o.id === 'throwAway' ? t('act.throwA', { team: match.teams[1].shortName })
          : t(o.labelKey);
      const b = el('button', `act ${o.style || 'ghost'}`, label);
      // Atajo visible: el partido se puede arbitrar sin soltar el teclado
      if (i < 6) b.appendChild(el('span', 'key', String(i + 1)));
      b.onclick = () => onChoose(o);
      btns.appendChild(b);
    });
    this.decision.appendChild(btns);
  }

  incidentTitle(inc) {
    const map = {
      challenge: t('inc.challenge'),
      penaltyShout: t('inc.penaltyShout'),
      handball: t('foul.handball'),
      offside: t('rulebook.offside'),
      outOfPlay: t('rulebook.restarts'),
      goal: t('report.goals'),
      dissent: t('foul.dissent'),
      violence: t('foul.violent'),
      injury: t('event.injury'),
      timewasting: t('inc.timewasting'),
      crowd: t('event.security'),
    };
    return map[inc.type] || inc.type;
  }

  /** Pistas parciales: nunca revelan la decisión correcta. */
  buildHints(inc, match) {
    const level = match.difficulty.hintLevel;
    if (level <= 0) return [];
    const out = [];
    const clarity = inc.clarity ?? 0.5;
    out.push(`👁 ${clarity > 0.75 ? t('hint.sawWell') : clarity > 0.45 ? t('hint.partial') : t('hint.poor')}`);
    if (inc.inBox) out.push(`📍 ${t('hint.inBox')}`);
    if (level >= 2) {
      if (inc.facts && inc.facts.contact !== undefined) {
        out.push(inc.facts.contact > 0.7 ? t('hint.contactHigh')
          : inc.facts.contact > 0.4 ? t('hint.contactMed') : t('hint.contactLow'));
      }
      if (inc.type === 'offside' && inc.assistantFlag !== undefined) {
        out.push(`🚩 ${inc.assistantFlag ? t('hint.flagUp') : t('hint.flagDown')}`);
      }
      if (inc.dogso) out.push(t('hint.dogso'));
    } else if (inc.type === 'offside' && inc.assistantFlag !== undefined) {
      out.push(`🚩 ${inc.assistantFlag ? t('hint.flagUp') : t('hint.flagDown')}`);
    }
    if (inc.type === 'timewasting') {
      out.push(`⏱ ${t('hint.delay', { n: Math.round(inc.delaySeconds || 0) })}`);
      if (inc.leading) out.push(t('hint.leading'));
    }
    if (inc.persistent && level >= 1) out.push(t('hint.persistent'));
    if (inc.impact === 'critical') out.push(`⚠ ${t('hint.decisive')}`);
    return out;
  }

  updateDecisionTimer(fraction) {
    if (this.timerBar) this.timerBar.style.width = `${clamp(fraction, 0, 1) * 100}%`;
  }

  hideDecision() {
    this.decision.classList.add('hidden');
    this.decision.innerHTML = '';
    this.timerBar = null;
  }

  showCardChoice(incident, options, match, onChoose) {
    this.showDecision(incident, options, match, onChoose);
    const head = this.decision.querySelector('.dp-title');
    if (head) head.textContent = `${t('card.reason')}: ${this.incidentTitle(incident)}`;
  }

  // -------------------------------------------------------- asistente

  showAssistantAnswer(answer) {
    const texts = {
      offside: t(answer.value ? 'ar.offsideYes' : 'ar.offsideNo'),
      handball: t(answer.value ? 'ar.handYes' : 'ar.handNo'),
      lastTouch: t(answer.value === 0 ? 'ar.lastTouchHome' : 'ar.lastTouchAway'),
      violence: t(answer.value ? 'ar.violenceYes' : 'ar.violenceNo'),
      foul: t(answer.value ? 'ar.foulYes' : 'ar.foulNo'),
    };
    const body = answer.unsure ? t('assistant.unsure') : (texts[answer.kind] || '—');
    this.toast(`💬 ${answer.name}: ${body}`, 'assistant', 4200);
  }

  // -------------------------------------------------------------- VAR

  showVar(session, varSystem, match, onFinish) {
    this.varPanel.classList.remove('hidden');
    this.varPanel.innerHTML = `
      <div class="var-head">
        <span class="var-title">⬤ ${t('var.title')}</span>
        <span class="var-sub"></span>
      </div>
      <div class="var-cams"></div>
      <div class="var-transport"></div>
      <div class="var-info"></div>
      <div class="var-decide"></div>`;

    const sub = this.varPanel.querySelector('.var-sub');
    sub.textContent = session.recommendation.intervene ? t('var.recommend') : t('var.check');

    const cams = this.varPanel.querySelector('.var-cams');
    for (const c of CAMERAS) {
      const b = el('button', `chip-btn${session.camera === c.id ? ' on' : ''}`, t(c.labelKey));
      b.onclick = () => {
        varSystem.setCamera(c.id);
        cams.querySelectorAll('.chip-btn').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
      };
      cams.appendChild(b);
    }
    const lineBtn = el('button', 'chip-btn', t('var.offsideLine'));
    lineBtn.onclick = () => { varSystem.toggleOffsideLine(); lineBtn.classList.toggle('on'); };
    cams.appendChild(lineBtn);

    const tr = this.varPanel.querySelector('.var-transport');
    const mk = (label, fn) => { const b = el('button', 'chip-btn', label); b.onclick = fn; tr.appendChild(b); return b; };
    mk('⏮', () => varSystem.seek(0));
    mk('◀◀', () => varSystem.step(-10));
    mk('◀|', () => varSystem.step(-1));
    const playBtn = mk('▶', () => {
      if (varSystem.session.playing) { varSystem.pause(); playBtn.textContent = '▶'; }
      else { varSystem.play(); playBtn.textContent = '⏸'; }
    });
    mk('|▶', () => varSystem.step(1));
    mk('▶▶', () => varSystem.step(10));
    const speeds = [0.25, 0.5, 1];
    let si = 2;
    const spBtn = mk('1×', () => {
      si = (si + 1) % speeds.length;
      varSystem.setSpeed(speeds[si]);
      spBtn.textContent = `${speeds[si]}×`;
    });
    mk('🔍+', () => varSystem.setZoom((varSystem.session.zoom || 1) + 0.5));
    mk('🔍−', () => varSystem.setZoom((varSystem.session.zoom || 1) - 0.5));

    const info = this.varPanel.querySelector('.var-info');
    if (session.glt) {
      info.innerHTML = `<div class="glt">${t('glt.title')}: <b>${t(session.glt.textKey)}</b></div>`;
    }

    const dec = this.varPanel.querySelector('.var-decide');
    const options = this.varOptionsFor(session.incident);
    for (const o of options) {
      const b = el('button', `act ${o.style}`, o.label);
      b.onclick = () => onFinish(o.payload);
      dec.appendChild(b);
    }
  }

  varOptionsFor(inc) {
    switch (inc.type) {
      case 'goal':
        return [
          { label: t('act.goal'), style: 'primary', payload: { action: 'goal' } },
          { label: t('act.noGoal'), style: 'warn', payload: { action: 'noGoal' } },
        ];
      case 'penaltyShout':
      case 'challenge':
        return [
          { label: t('act.penalty'), style: 'primary', payload: { action: 'penalty' } },
          { label: t('act.noPenalty'), style: 'ghost', payload: { action: 'playon' } },
          { label: t('act.red'), style: 'danger', payload: { action: 'foul', card: 'red' } },
          { label: t('act.dive'), style: 'warn', payload: { action: 'dive', card: 'yellow' } },
        ];
      case 'handball':
        return [
          { label: t('act.penalty'), style: 'primary', payload: { action: 'penalty' } },
          { label: t('act.noHandball'), style: 'ghost', payload: { action: 'playon' } },
        ];
      case 'offside':
        return [
          { label: t('act.offside'), style: 'primary', payload: { action: 'offside' } },
          { label: t('act.onside'), style: 'ghost', payload: { action: 'playon' } },
        ];
      case 'violence':
        return [
          { label: t('act.red'), style: 'danger', payload: { action: 'card', card: 'red' } },
          { label: t('act.yellow'), style: 'warn', payload: { action: 'card', card: 'yellow' } },
          { label: t('act.playon'), style: 'ghost', payload: { action: 'playon' } },
        ];
      default:
        return [{ label: t('var.confirm'), style: 'primary', payload: { action: 'playon' } }];
    }
  }

  hideVar() {
    this.varPanel.classList.add('hidden');
    this.varPanel.innerHTML = '';
  }

  // -------------------------------------------------------- evaluación

  showEvaluation(incident, payload, grade) {
    const gradeLabels = {
      correct: t('eval.correct'), mostly: t('eval.mostly'),
      debatable: t('eval.debatable'), incorrect: t('eval.incorrect'),
    };
    this.evalBox.className = `eval-box ${grade.grade}`;
    this.evalBox.innerHTML = `
      <div class="eg">${gradeLabels[grade.grade]}</div>
      <div class="er">${t('eval.rule')}: ${t(grade.rule)}</div>
      <div class="ei">${t('eval.impact')}: ${t(`eval.impact.${incident.impact}`)}</div>`;
    clearTimeout(this._evalTimer);
    this._evalTimer = setTimeout(() => this.evalBox.classList.add('hidden'), 3200);
  }

  // ------------------------------------------------------------ avisos

  toast(text, kind = 'info', ms = 2600) {
    const e = el('div', `toast ${kind}`, text);
    this.toasts.appendChild(e);
    setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 400); }, ms);
    while (this.toasts.children.length > 6) this.toasts.firstChild.remove();
  }
}

export default HUD;
