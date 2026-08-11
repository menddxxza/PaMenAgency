// Controlador del juego: une motor, render, HUD, pantallas, audio,
// carrera y guardado. Aquí vive la máquina de estados de la aplicación.

import { GAME, DIFFICULTY, WEATHER } from './core/config.js';
import { setLocale, getLocale, t } from './core/i18n.js';
import { RNG } from './core/rng.js';
import { loadSettings, saveSettings, saveGame, loadGame, deleteSave, lastSaveSlot } from './core/save.js';
import { generateWorld, clubsOfDivision, divisionById, generateCrew } from './data/generators.js';
import { findSpecial } from './data/scenarios.js';
import { createMatch } from './match/state.js';
import { MatchEngine } from './match/matchEngine.js';
import { Career } from './career/career.js';
import { createReferee, KITS } from './career/referee.js';
import { Academy } from './career/academy.js';
import { AchievementSystem } from './career/achievements.js';
import { Renderer } from './ui/renderer.js';
import { HUD } from './ui/hud.js';
import { Screens } from './ui/screens.js';
import { AudioSystem } from './audio/audio.js';
import { makeAutoReferee } from './ai/autoReferee.js';

const SPEEDS = [0.5, 1, 2, 4];

export class Game {
  constructor(dom) {
    this.dom = dom;
    this.settings = loadSettings();
    setLocale(this.settings.locale);
    this.audio = new AudioSystem(this.settings);
    this.renderer = new Renderer(dom.canvas);
    this.hud = new HUD(dom.hud, this);
    this.screens = new Screens(dom.screens, this);
    this.career = null;
    this.match = null;
    this.engine = null;
    this.speedIdx = SPEEDS.indexOf(this.settings.matchSpeed) >= 0 ? SPEEDS.indexOf(this.settings.matchSpeed) : 1;
    this.paused = false;
    this.mode = 'menu';
    this.special = null;
    this.tutorial = null;
    this._world = null;
    this.freeAcademy = new Academy({ rng: new RNG('free'), season: 0, round: 0, referee: createReferee({ seed: 'free' }), achievements: { check: () => [] } });
    this.freeAchievements = new AchievementSystem({ referee: null });
    this.keys = new Set();
    this.lastFrame = performance.now();
    this._bindInput();
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  // ------------------------------------------------------------- entrada

  _bindInput() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ') this.togglePause();
      if (e.key.toLowerCase() === 'c') this.renderer.follow = !this.renderer.follow;
      if (/^[1-6]$/.test(e.key)) this._hotkeyDecision(Number(e.key) - 1);
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('resize', () => this.renderer.resize());
    this.dom.canvas.addEventListener('pointerdown', () => this.audio.ensure());
  }

  _hotkeyDecision(i) {
    const btns = this.dom.hud.querySelectorAll('.decision-panel .dp-actions button');
    if (btns[i]) btns[i].click();
  }

  _readInput() {
    const k = this.keys;
    const dx = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
    const dy = (k.has('s') || k.has('arrowdown') ? 1 : 0) - (k.has('w') || k.has('arrowup') ? 1 : 0);
    return { dx, dy, sprint: k.has('shift') };
  }

  togglePause() {
    if (!this.engine || this.engine.finished) return;
    this.paused = !this.paused;
    this.hud.toast(this.paused ? t('hud.paused') : '▶', 'info', 1200);
  }

  speedLabel() { return `${SPEEDS[this.speedIdx]}×`; }

  cycleSpeed() {
    this.speedIdx = (this.speedIdx + 1) % SPEEDS.length;
    if (this.engine) this.engine.speed = SPEEDS[this.speedIdx];
    this.settings.matchSpeed = SPEEDS[this.speedIdx];
    saveSettings(this.settings);
  }

  // --------------------------------------------------------------- bucle

  _loop(now) {
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    if (this.engine && !this.engine.finished) {
      const varSession = this.engine.var.session;
      if (varSession) {
        this.engine.var.tick(dt);
        this.renderer.drawReplay(this.engine.var.currentFrame(), this.match, varSession);
      } else {
        if (!this.paused && this.mode === 'match') {
          this.engine.setInput(this._readInput());
          this.engine.update(dt);
        }
        this.renderer.draw(this.match, {
          dt,
          incident: this.engine.pending ? this.engine.pending.incident : null,
          kit: KITS.find((x) => x.id === (this.currentKit || 'black')),
          flagUp: this._flagUp,
        });
        this.hud.update(this.match, this.engine);
        if (this.engine.pending) {
          const p = this.engine.pending;
          this.hud.updateDecisionTimer(p.timeLeft / this.match.difficulty.decisionTime);
        }
        this.audio.updateCrowd(this.match.atmosphere.noise,
          (this.match.atmosphere.anger[0] + this.match.atmosphere.anger[1]) / 2);
      }
    }
    requestAnimationFrame(this._loop);
  }

  // --------------------------------------------------------- arranque UI

  boot() {
    this.dom.canvas.classList.add('dim');
    this.screens.mainMenu();
  }

  quitToMenu() {
    this._teardownMatch();
    this.mode = 'menu';
    this.dom.canvas.classList.add('dim');
    this.hud.root.classList.add('hidden');
    this.audio.stopCrowd();
    this.screens.mainMenu();
  }

  classicWorld() {
    if (!this._world) this._world = generateWorld('classic-world');
    return this._world;
  }

  setLocale(id) {
    setLocale(id);
    this.settings.locale = id;
    saveSettings(this.settings);
    this.screens.settings();
  }

  setDifficulty(id) {
    this.settings.difficulty = id;
    saveSettings(this.settings);
    if (this.career) this.career.difficultyId = id;
    this.screens.settings();
  }

  toggleSetting(key) {
    this.settings[key] = !this.settings[key];
    saveSettings(this.settings);
    this.audio.setSettings(this.settings);
    this.screens.settings();
  }

  // ------------------------------------------------------------- carrera

  createRefereeFromForm() {
    const q = (id) => this.dom.screens.querySelector(id);
    const opts = {
      firstName: q('#f-first').value.trim() || 'Árbitro',
      lastName: q('#f-last').value.trim() || 'Anónimo',
      age: Number(q('#f-age').value) || 24,
      gender: q('#f-gender').value,
      nationId: q('#f-nation').value,
      kit: q('#f-kit').value,
      skin: q('#f-skin').value,
      hair: q('#f-hair').value,
      seed: `${Date.now()}`,
    };
    const difficulty = q('#f-diff').value;
    const mode = q('#f-mode').value;
    this.settings.difficulty = difficulty;
    saveSettings(this.settings);

    const referee = createReferee(opts);
    this.career = new Career({
      mode, difficulty, referee,
      worldSeed: `w${Date.now()}`,
    });
    this.currentKit = opts.kit;
    this.pendingRef = null;
    this.autosave();
    this.screens.careerHub();
  }

  continueCareer() {
    const slot = lastSaveSlot();
    if (!slot) return this.screens.createReferee();
    this.loadSlot(slot);
  }

  loadSlot(slot) {
    const data = loadGame(slot);
    if (!data) return this.screens.saves();
    this.career = Career.deserialize(data);
    this.currentKit = this.career.referee.appearance.kit;
    this.saveSlotIdx = slot;
    this.hud.toast('Partida cargada', 'good');
    this.screens.careerHub();
  }

  saveSlot(slot) {
    if (!this.career) return;
    saveGame(slot, this.career);
    this.saveSlotIdx = slot;
    this.hud.toast('Partida guardada', 'good');
    this.screens.saves();
  }

  deleteSlot(slot) { deleteSave(slot); this.screens.saves(); }

  autosave() {
    if (!this.settings.autosave || !this.career) return;
    saveGame(this.saveSlotIdx || 1, this.career);
    this.saveSlotIdx = this.saveSlotIdx || 1;
  }

  restRound() {
    if (!this.career) return;
    this.career.train('rest');
    this.career.advanceRound();
    this.autosave();
    this.screens.careerHub();
  }

  doTraining(id) {
    const res = this.career.train(id);
    let msg = '';
    if (res && res.blocked) msg = 'Estás demasiado cansado para entrenar. Descansa.';
    else if (res && res.rest) msg = `Has descansado. Fatiga: ${Math.round(res.fatigue)}%`;
    else if (res) msg = t('training.doneGain', { stat: t(`stat.${res.stat}`), n: res.gain });
    this.autosave();
    this.screens.training(msg);
  }

  startExam(topic) {
    const ac = this.career ? this.career.academy : this.freeAcademy;
    this.activeAcademy = ac;
    const exam = ac.startExam(topic || null, 6);
    this.screens.examQuestion(exam, null);
  }

  answerExam(i) {
    const ac = this.activeAcademy;
    const res = ac.answer(i);
    if (!res) return;
    if (res.done) {
      const final = ac.finishExam();
      this.audio.ui(final.passed ? 'click' : 'error');
      if (this.career) this.autosave();
      this.screens.examResult(final);
    } else {
      this.screens.examQuestion(ac.current, res);
    }
  }

  publishPost(tone) {
    const p = this.career.press.publish('partido', tone);
    this.autosave();
    this.screens.pressScreen(`Publicado. Alcance ${p.reach}, ${p.followersGained >= 0 ? '+' : ''}${p.followersGained} seguidores, reputación ${p.repDelta}.`);
  }

  syndicateChoose(chapter, option) {
    const res = this.career.syndicate.choose(chapter, option);
    this.autosave();
    if (res && res.option.money) this.hud.toast(`+${res.option.money} €`, 'good');
    this.screens.careerHub();
  }

  resolveEthics(choice) {
    const res = this.career.resolveEthics(choice);
    this.autosave();
    const msgs = {
      accepted: 'Has aceptado el dinero. Alguien más lo sabe.',
      refused: 'Has rechazado la oferta.',
      reported: 'Has denunciado el intento. Se abre una investigación.',
      ignored: 'Has mirado hacia otro lado.',
    };
    this.hud.toast(msgs[res.type] || '', res.type === 'accepted' ? 'bad' : 'good', 4000);
    this._postMatchNext();
  }

  answerPress(qIndex, key) {
    const conf = this.career.pendingPressConference;
    const q = conf.questions[qIndex];
    this.career.press.answer(q, key, this.lastReport);
    conf.current = (conf.current || 0) + 1;
    if (conf.current >= conf.questions.length) {
      this.career.pendingPressConference = null;
      this.afterPressConference();
    } else {
      this.screens.pressConference(conf, this.lastReport);
    }
  }

  afterPressConference() {
    this.autosave();
    this._postMatchNext();
  }

  retire() {
    const end = this.career.retire();
    this.screens.ending(end, this.career);
    this.career = null;
  }

  // -------------------------------------------------------------- partido

  acceptAssignment(id) {
    const a = this.career.accept(id);
    if (!a) return;
    const cfg = this.career.matchConfigFor(a);
    this.pendingMatchCfg = cfg;
    this.match = createMatch(cfg);
    this.screens.preMatch({ ...cfg, lineups: this.match.lineups, weatherId: this.match.weatherId, crew: this.match.crew }, a);
  }

  startClassicFromForm() {
    const q = (id) => this.dom.screens.querySelector(id);
    const world = this.classicWorld();
    const divId = q('#c-div').value;
    const div = world.divisions.find((d) => d.id === divId) || world.divisions[0];
    const all = clubsOfDivision(world, divId);
    const home = all.find((c) => c.id === q('#c-home').value) || all[0];
    const away = all.find((c) => c.id === q('#c-away').value) || all[1];
    if (home.id === away.id) { this.hud.toast('Elige equipos distintos', 'bad'); return; }
    const difficulty = DIFFICULTY[q('#c-diff').value] || DIFFICULTY.normal;
    const referee = this.career ? this.career.referee : createReferee({ seed: 'classic', baseLevel: 62 });
    const rng = new RNG(Date.now());
    const cfg = {
      home, away, competition: div, seed: Date.now(),
      weather: q('#c-weather').value,
      importance: Number(q('#c-imp').value) || 50,
      rivalry: (home.rivals.find((r) => r.id === away.id) || {}).intensity || 0,
      difficulty, referee,
      crew: generateCrew(rng, div.level, !!div.var),
      varEnabled: !!div.var,
      stadium: home.stadium,
    };
    this.mode = 'classic';
    this.pendingMatchCfg = cfg;
    this.match = createMatch(cfg);
    this.screens.preMatch({ ...cfg, lineups: this.match.lineups, weatherId: this.match.weatherId, crew: this.match.crew }, null);
  }

  startSpecial(id) {
    const sp = findSpecial(id);
    if (!sp) return;
    const world = this.classicWorld();
    const div = world.divisions.find((d) => d.id === sp.divisionId) || world.divisions[0];
    const pool = clubsOfDivision(world, sp.divisionId);
    const rng = new RNG(`${id}:${Date.now()}`);
    const home = rng.pick(pool);
    let away = rng.pick(pool);
    while (away.id === home.id) away = rng.pick(pool);
    if (sp.aggressionBoost) { home.aggression = Math.min(99, home.aggression * sp.aggressionBoost); away.aggression = Math.min(99, away.aggression * sp.aggressionBoost); }
    const referee = this.career ? this.career.referee : createReferee({ seed: `sp-${id}`, baseLevel: 66 });
    const difficulty = DIFFICULTY[this.settings.difficulty] || DIFFICULTY.normal;
    const cfg = {
      home, away, competition: div, seed: `${id}:${Date.now()}`,
      weather: sp.weather, importance: sp.importance, rivalry: sp.rivalry,
      difficulty: sp.diveBoost ? { ...difficulty, simulationRate: difficulty.simulationRate * sp.diveBoost } : difficulty,
      referee, crew: generateCrew(rng, div.level, !!div.var), varEnabled: !!div.var,
      knockout: !!sp.knockout, stadium: home.stadium, title: sp.name,
      kickoffScore: sp.score, startMinute: sp.startMinute,
    };
    this.mode = 'special';
    this.special = sp;
    this.pendingMatchCfg = cfg;
    this.match = createMatch(cfg);
    if (sp.half === 2 || sp.startMinute >= 45) this.match.half = 2;
    if (sp.preCards) this._preloadCards(this.match, sp.preCards);
    this.screens.preMatch({ ...cfg, lineups: this.match.lineups, weatherId: this.match.weatherId, crew: this.match.crew }, null);
  }

  _preloadCards(match, n) {
    const pool = match.rng.shuffle(match.entities.filter((e) => e.role !== 'GK'));
    for (let i = 0; i < n && i < pool.length; i++) {
      pool[i].yellow = 1;
      match.stats[pool[i].side].yellows++;
      pool[i].frustration = 60;
    }
  }

  beginMatch() {
    this.screens.hide();
    this.hud.root.classList.remove('hidden');
    this.dom.canvas.classList.remove('dim');
    this.renderer.resize();
    this.mode = this.mode === 'menu' ? 'match' : this.mode;
    if (this.mode !== 'special' && this.mode !== 'classic') this.mode = 'match';
    this._runMatch();
  }

  _runMatch() {
    const engine = new MatchEngine(this.match, { speed: SPEEDS[this.speedIdx] });
    this.engine = engine;
    this.paused = false;
    this._wireEngine(engine);
    this.audio.ensure();
    this.audio.startCrowd();
    engine.start();
    this.audio.whistle('short');
    this.hud.renderIdleActions(engine);
    this.hud.toast('Comienza el partido', 'info');
    // El modo partido usa el bucle general; `mode` marca que hay simulación viva
    this._activeMode = this.mode;
    this.mode = 'match';
  }

  _wireEngine(engine) {
    const hud = this.hud;

    engine.on('decision:request', ({ incident, options }) => {
      this.audio.whistle(incident.type === 'goal' ? 'double' : 'short');
      hud.showDecision(incident, options, this.match, (opt) => {
        if (opt.payload.action === 'assistant') {
          engine.decide({ action: 'assistant' });
          return;
        }
        if (opt.payload.action === 'var') {
          engine.decide({ action: 'var', preDecision: this._lastIntent || { action: 'playon' } });
          return;
        }
        this._lastIntent = opt.payload;
        hud.hideDecision();
        engine.decide(opt.payload);
      });
    });

    engine.on('decision:cards', ({ incident, options }) => {
      hud.showCardChoice(incident, options, this.match, (opt) => {
        hud.hideDecision();
        engine.decide(opt.payload);
      });
    });

    engine.on('decision:timeout', () => {
      hud.hideDecision();
      hud.toast('Sin decisión: el juego sigue', 'bad');
    });

    engine.on('decision:resolved', ({ incident, payload, grade }) => {
      hud.hideDecision();
      if (this.settings.showEvaluation && !this.match.difficulty.showTruthBefore) {
        hud.showEvaluation(incident, payload, grade);
      }
      hud.renderIdleActions(engine);
      if (payload.card === 'yellow') this.audio.card(false);
      if (payload.card === 'red') this.audio.card(true);
      if (this.tutorial) this._tutorialStep(incident, payload);
    });

    engine.on('assistant:answer', ({ answer }) => {
      hud.showAssistantAnswer(answer);
      this._flagUp = answer.kind === 'offside' && answer.value ? (answer.key === 'ar1' ? 0 : 1) : null;
      setTimeout(() => { this._flagUp = null; }, 2500);
    });

    engine.on('var:open', ({ session }) => {
      this.audio.varBeep(true);
      hud.hideDecision();
      hud.showVar(session, engine.var, this.match, (payload) => {
        engine.var.close(payload);
        hud.hideVar();
        this.audio.varBeep(false);
      });
    });

    engine.on('goal', ({ side }) => {
      this.renderer.triggerFlash('#ffffff', 0.35);
      this.renderer.triggerShake(8);
      this.renderer.addFloater('¡GOL!', this.match.ball.pos.x, this.match.ball.pos.y, '#ffd60a', 2.6);
      this.audio.cheer(1);
      hud.toast(`⚽ ${this.match.teams[side].name}`, 'good');
    });

    engine.on('card', ({ entity, card }) => {
      this.renderer.addFloater(card === 'red' ? '🟥' : '🟨', entity.pos.x, entity.pos.y, card === 'red' ? '#ff453a' : '#ffd60a', 2);
    });

    engine.on('protest', ({ entity, intensity }) => {
      const lines = ['protest.ref', 'protest.out', 'protest.noTouch', 'protest.red', 'protest.penalty',
        'protest.always', 'protest.dive', 'protest.handball', 'protest.homer'];
      const key = lines[Math.floor(Math.random() * lines.length)];
      this.renderer.addFloater(t(key), entity.pos.x, entity.pos.y, '#ff9f1c', 2.2);
    });

    engine.on('coachProtest', ({ side, coach }) => {
      hud.toast(`📣 ${coach.name}: “${t('protest.coach')}”`, 'warn', 3000);
    });

    engine.on('crowd', ({ anger }) => {
      if (anger > 55) this.audio.boo(Math.min(1, anger / 90));
    });

    engine.on('restart:taken', ({ type }) => {
      if (['freeKick', 'corner', 'goalKick', 'throwIn'].includes(type)) this.audio.kick(0.8);
    });

    engine.on('substitution', ({ side, out, in: inn }) => {
      hud.toast(`🔄 ${out.player.name} → ${inn.player.name}`, 'info');
    });

    engine.on('addedTime', ({ minutes }) => {
      hud.toast(`⏱ ${t('hud.added')}: +${Math.round(minutes)}`, 'info', 3500);
    });

    engine.on('advantage:start', () => {
      hud.toast(`▶ ${t('act.advantage')}`, 'accent');
      hud.renderIdleActions(engine);
    });

    engine.on('advantage:end', ({ materialized }) => {
      hud.toast(materialized ? 'Ventaja aprovechada' : 'Vuelta a la falta', materialized ? 'good' : 'warn');
      hud.renderIdleActions(engine);
    });

    engine.on('match:stopped', () => hud.toast('⏸ Juego detenido', 'warn'));
    engine.on('match:resumed', () => hud.toast('▶ Se reanuda', 'info'));
    engine.on('match:abandoned', () => hud.toast('⛔ Partido suspendido', 'bad', 5000));

    engine.on('halftime', ({ report }) => {
      this.audio.whistle('double');
      this.paused = true;
      this.screens.halfTime(report, this.match);
    });

    engine.on('match:end', ({ report }) => {
      this.audio.whistle('triple');
      this.audio.stopCrowd();
      this.lastReport = report;
      setTimeout(() => this._onMatchEnd(report), 900);
    });
  }

  resumeSecondHalf() {
    this.screens.hide();
    this.paused = false;
    this.engine.resumeFromHalfTime();
    this.hud.renderIdleActions(this.engine);
    this.audio.startCrowd();
    this.audio.whistle('short');
  }

  cancelAdvantage() {
    if (this.engine && this.engine.cancelAdvantage()) this.audio.whistle('short');
  }

  stopMatchRequest() {
    if (!this.engine) return;
    if (this.engine.manualStop(90)) this.audio.whistle('long');
  }

  askAssistantFree() {
    if (!this.engine) return;
    const a = this.engine.askAssistantAbout(null);
    if (a) { this.hud.showAssistantAnswer(a); return; }
    const f = this.engine.askFourthOfficial();
    this.hud.toast(`💬 ${f.name}: descuento estimado +${Math.max(f.addedTime, f.pendingStoppage)}′`, 'assistant', 3200);
  }

  // ------------------------------------------------------- fin de partido

  _onMatchEnd(report) {
    this.hud.root.classList.add('hidden');
    this.dom.canvas.classList.add('dim');
    const mode = this._activeMode || 'match';

    if (mode === 'special' && this.special) {
      const passed = report.rating.overall >= this.special.targetRating && !report.abandoned;
      this.screens.scenarioResult(this.special, report, passed);
      this._teardownMatch();
      return;
    }
    if (mode === 'classic' || !this.career) {
      this.screens.matchReport(report, {
        buttons: `<button class="primary" data-act="classic">Otro partido</button>
                  <button data-act="menu">${t('menu.quit')}</button>`,
      });
      this._teardownMatch();
      return;
    }
    if (this.tutorial) {
      this.tutorial = null;
      this.screens.matchReport(report, { buttons: `<button class="primary" data-act="menu">${t('tut.done')}</button>` });
      this._teardownMatch();
      return;
    }

    const res = this.career.finishMatch(report);
    this.lastResult = res;
    this.autosave();

    const gainsHtml = `
      <div class="card"><h4>Progresión</h4>
        <ul class="list small">
          <li>${t('report.xp')}: +${res.entry.xp} XP${res.entry.levels.length ? ` · ¡Nivel ${res.entry.levels[res.entry.levels.length - 1]}!` : ''}</li>
          <li>${t('report.fee')}: +${res.entry.fee} €</li>
          <li>${t('stat.reputation')}: ${res.entry.repDelta >= 0 ? '+' : ''}${res.entry.repDelta}</li>
          ${Object.entries(res.entry.gains).map(([k, v]) => `<li>${t(`stat.${k}`)} +${v}</li>`).join('')}
          ${res.movement ? `<li class="${res.movement.type === 'promotion' ? 'good' : 'bad'}">
            ${res.movement.type === 'promotion' ? t('career.promoted', { div: res.movement.name }) : t('career.relegated', { div: res.movement.name })}</li>` : ''}
          ${res.unlocked.map((u) => `<li class="good">🏅 ${t('ach.unlocked', { name: u.name })}</li>`).join('')}
          ${res.news.map((n) => `<li class="muted">📰 ${n.headline}</li>`).join('')}
        </ul></div>`;

    this.screens.matchReport(report, {
      gainsHtml,
      buttons: `<button class="primary big" data-act="postMatchNext">${t('ui.continue')}</button>`,
    });
    // El botón de continuar encadena rueda de prensa / ética / trama
    const btn = this.dom.screens.querySelector('[data-act="postMatchNext"]');
    if (btn) btn.onclick = () => { this.audio.ui('click'); this._postMatchNext(); };
    this._teardownMatch();
  }

  _postMatchNext() {
    const c = this.career;
    if (!c) return this.screens.mainMenu();
    if (c.pendingPressConference) {
      c.pendingPressConference.current = c.pendingPressConference.current || 0;
      return this.screens.pressConference(c.pendingPressConference, this.lastReport);
    }
    if (c.pendingEthics) return this.screens.ethicsEvent(c.pendingEthics);
    if (c.syndicate.pending()) return this.screens.syndicateScene();
    c.advanceRound();
    if (c.ended) { const e = c.ended; this.screens.ending(e, c); this.career = null; return; }
    this.autosave();
    return this.screens.careerHub();
  }

  _teardownMatch() {
    this.engine = null;
    this.match = null;
    this.paused = false;
    this._flagUp = null;
    this.audio.stopCrowd();
  }

  // ------------------------------------------------------------ tutorial

  startTutorial() {
    const world = this.classicWorld();
    const div = world.divisions.find((d) => d.id === 'tercera');
    const pool = clubsOfDivision(world, 'tercera');
    const rng = new RNG('tutorial');
    const referee = createReferee({ seed: 'tutorial', baseLevel: 55 });
    const cfg = {
      home: pool[0], away: pool[1], competition: div, seed: 'tutorial',
      weather: 'clear', importance: 30, rivalry: 0,
      difficulty: { ...DIFFICULTY.easy, decisionTime: 20 },
      referee, crew: generateCrew(rng, div.level, true), varEnabled: true,
      stadium: pool[0].stadium,
    };
    this.mode = 'match';
    this.tutorial = { step: 0, seen: new Set() };
    this.pendingMatchCfg = cfg;
    this.match = createMatch(cfg);
    this.screens.preMatch({ ...cfg, lineups: this.match.lineups, weatherId: 'clear', crew: this.match.crew }, null);
    setTimeout(() => {
      this.hud.toast(t('tut.move'), 'info', 7000);
      setTimeout(() => this.hud.toast(t('tut.position'), 'info', 7000), 2000);
    }, 400);
  }

  _tutorialStep(incident, payload) {
    if (!this.tutorial) return;
    const seen = this.tutorial.seen;
    const lessons = {
      challenge: 'tut.foul', penaltyShout: 'tut.penalty',
      offside: 'tut.offside', goal: 'tut.var', handball: 'tut.card',
    };
    const key = lessons[incident.type];
    if (key && !seen.has(key)) {
      seen.add(key);
      this.hud.toast(t(key), 'info', 6000);
    }
    if (payload.action === 'advantage' && !seen.has('adv')) {
      seen.add('adv');
      this.hud.toast(t('tut.advantage'), 'info', 6000);
    }
  }
}

export default Game;
