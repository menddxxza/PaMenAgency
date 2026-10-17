// Sistema VAR: sala de vídeo, cámaras, control de reproducción y protocolo.
// El VAR sólo entra ante error claro y manifiesto, y no revisa todo.

import { clamp } from '../core/rng.js';
import RuleEngine, { GRADE } from '../rules/ruleEngine.js';

export const CAMERAS = [
  { id: 'main', labelKey: 'var.cam.main', clarity: 1.0 },
  { id: 'side', labelKey: 'var.cam.side', clarity: 1.12 },
  { id: 'behindGoal', labelKey: 'var.cam.behindGoal', clarity: 1.18 },
  { id: 'tactical', labelKey: 'var.cam.tactical', clarity: 0.85 },
];

export class VarSystem {
  constructor(match, bus) {
    this.match = match;
    this.bus = bus;
    this.session = null;
    this.history = [];
  }

  available() { return this.match.varEnabled; }

  skill() {
    const v = this.match.crew.var;
    if (!v) return 60;
    return v.accuracy * 0.5 + v.criterion * 0.3 + v.experience * 0.2;
  }

  /** Comprobación silenciosa tras una decisión (protocolo real). */
  check(incident, decision) {
    if (!this.available()) return { intervene: false, reason: 'var.noIntervention' };
    const res = RuleEngine.varShouldIntervene(incident, decision, {
      varSkill: this.skill(),
      aggressiveVar: this.match.crew.var && this.match.crew.var.criterion > 82,
    });
    // El VAR también puede equivocarse
    if (res.intervene && this.match.rng.next() > clamp(this.skill() / 100, 0.3, 0.97)) {
      return { intervene: false, reason: 'var.noIntervention', varError: true };
    }
    return res;
  }

  /** Abre la sala de revisión. La UI conduce la reproducción. */
  open(incident, { preDecision, onClose }) {
    const m = this.match;
    const center = incident.clock;
    const frames = m.replayBuffer.filter((f) => f.t >= center - 9 && f.t <= center + 3);
    this.session = {
      incident,
      preDecision,
      frames: frames.length ? frames : m.replayBuffer.slice(-90),
      index: Math.max(0, Math.floor(frames.length * 0.7)),
      playing: false,
      speed: 1,
      camera: 'main',
      zoom: 1,
      offsideLine: false,
      onClose,
      recommendation: this.check(incident, preDecision || incident.decisionTaken || { action: 'playon' }),
      startedAt: Date.now(),
      glt: incident.glt ? this._glt(incident) : null,
    };
    this.bus.emit('var:open', { session: this.session, incident });
    return this.session;
  }

  _glt(incident) {
    // Tecnología de línea de gol: veredicto exacto e infalible
    const crossed = incident.truth.goal === true || incident.facts?.fullyCrossed === true;
    return { crossed, textKey: crossed ? 'var.gltIn' : 'var.gltOut' };
  }

  // --- controles de reproducción -------------------------------------
  play() { if (this.session) { this.session.playing = true; this._emit(); } }
  pause() { if (this.session) { this.session.playing = false; this._emit(); } }
  setSpeed(s) { if (this.session) { this.session.speed = s; this._emit(); } }
  step(n) {
    if (!this.session) return;
    this.session.index = clamp(this.session.index + n, 0, this.session.frames.length - 1);
    this.session.playing = false;
    this._emit();
  }
  seek(i) {
    if (!this.session) return;
    this.session.index = clamp(i, 0, this.session.frames.length - 1);
    this._emit();
  }
  setCamera(id) { if (this.session) { this.session.camera = id; this._emit(); } }
  setZoom(z) { if (this.session) { this.session.zoom = clamp(z, 1, 4); this._emit(); } }
  toggleOffsideLine() {
    if (this.session) { this.session.offsideLine = !this.session.offsideLine; this._emit(); }
  }

  tick(dt) {
    const s = this.session;
    if (!s || !s.playing) return;
    s.acc = (s.acc || 0) + dt * 30 * s.speed;
    while (s.acc >= 1) {
      s.acc -= 1;
      s.index++;
      if (s.index >= s.frames.length - 1) { s.index = s.frames.length - 1; s.playing = false; break; }
    }
    this._emit();
  }

  _emit() { this.bus.emit('var:update', { session: this.session }); }

  currentFrame() {
    const s = this.session;
    if (!s) return null;
    return s.frames[clamp(s.index, 0, s.frames.length - 1)];
  }

  /**
   * El árbitro cierra la revisión.
   * finalPayload = decisión definitiva (mantener o cambiar).
   */
  close(finalPayload) {
    const s = this.session;
    if (!s) return;
    const before = RuleEngine.gradeDecision(s.incident, s.preDecision || { action: 'playon' });
    const after = RuleEngine.gradeDecision(s.incident, finalPayload);
    const result = {
      incidentId: s.incident.id,
      before: before.grade,
      after: after.grade,
      improved: after.score > before.score,
      worsened: after.score < before.score,
      camerasUsed: s.camera,
      duration: (Date.now() - s.startedAt) / 1000,
      recommendation: s.recommendation,
      finalPayload,
      glt: s.glt,
    };
    this.history.push(result);
    const cb = s.onClose;
    this.session = null;
    this.bus.emit('var:close', { result });
    if (cb) cb(result);
    return result;
  }

  rate() {
    const v = this.match.crew.var;
    if (!v) return { name: '—', rating: null, reviews: 0 };
    const good = this.history.filter((h) => h.improved).length;
    const bad = this.history.filter((h) => h.worsened).length;
    const base = 6.5 + good * 0.7 - bad * 0.9;
    return { name: v.name, rating: +clamp(base, 1, 10).toFixed(1), reviews: this.history.length };
  }
}

export default VarSystem;
