// Audio 100% sintetizado con WebAudio: sin archivos externos.
// Silbato, ambiente de estadio, cánticos, protestas, golpeos y pitidos VAR.

export class AudioSystem {
  constructor(settings = {}) {
    this.enabled = settings.sound !== false;
    this.crowdVolume = settings.crowdVolume ?? 0.5;
    this.whistleVolume = settings.whistleVolume ?? 0.8;
    this.ctx = null;
    this.crowd = null;
    this.started = false;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) { this.enabled = false; return null; }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setSettings(s) {
    this.enabled = s.sound !== false;
    this.crowdVolume = s.crowdVolume ?? this.crowdVolume;
    this.whistleVolume = s.whistleVolume ?? this.whistleVolume;
    if (!this.enabled) this.stopCrowd();
    else if (this.crowd) this.crowd.gain.gain.value = this.crowdVolume * 0.16;
  }

  _noiseBuffer(seconds = 2) {
    const ctx = this.ctx;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ---------------------------------------------------------- ambiente

  startCrowd() {
    const ctx = this.ensure();
    if (!ctx || this.crowd) return;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(4);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 620; lp.Q.value = 0.6;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 120;
    const gain = ctx.createGain();
    gain.gain.value = this.crowdVolume * 0.16;
    src.connect(hp); hp.connect(lp); lp.connect(gain); gain.connect(this.master);
    src.start();
    this.crowd = { src, gain, lp };
    this.started = true;
  }

  stopCrowd() {
    if (this.crowd) {
      try { this.crowd.src.stop(); } catch (e) { /* ya parado */ }
      this.crowd = null;
    }
  }

  /** noise 0..100, tension 0..100 */
  updateCrowd(noise, tension = 0) {
    if (!this.crowd || !this.ctx) return;
    const g = this.crowdVolume * (0.08 + (noise / 100) * 0.24);
    this.crowd.gain.gain.setTargetAtTime(g, this.ctx.currentTime, 0.5);
    this.crowd.lp.frequency.setTargetAtTime(480 + (tension / 100) * 900, this.ctx.currentTime, 0.8);
  }

  // ------------------------------------------------------------ efectos

  whistle(kind = 'short') {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const dur = kind === 'long' ? 1.1 : kind === 'double' ? 0.5 : 0.28;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(this.whistleVolume * 0.35, t + 0.015);
    g.gain.setValueAtTime(this.whistleVolume * 0.32, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.master);

    for (const f of [2680, 3120]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      o.frequency.linearRampToValueAtTime(f * 1.02, t + dur);
      // Trino del silbato
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 42;
      const lg = ctx.createGain(); lg.gain.value = 130;
      lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g);
      o.start(t); o.stop(t + dur);
      lfo.start(t); lfo.stop(t + dur);
    }
    // Aire
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(0.4);
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 3000; nf.Q.value = 2;
    const ng = ctx.createGain(); ng.gain.value = this.whistleVolume * 0.06;
    n.connect(nf); nf.connect(ng); ng.connect(this.master);
    n.start(t); n.stop(t + dur);

    if (kind === 'double') setTimeout(() => this.whistle('short'), 240);
    if (kind === 'triple') { setTimeout(() => this.whistle('short'), 260); setTimeout(() => this.whistle('long'), 520); }
  }

  kick(power = 1) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(0.2);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 220 + power * 180; f.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22 * power, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    n.connect(f); f.connect(g); g.connect(this.master);
    n.start(t); n.stop(t + 0.14);
  }

  cheer(intensity = 1) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(3);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(this.crowdVolume * 0.5 * intensity, t + 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.6);
    n.connect(f); f.connect(g); g.connect(this.master);
    n.start(t); n.stop(t + 2.8);
  }

  boo(intensity = 1) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this._noiseBuffer(3);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 340;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(this.crowdVolume * 0.45 * intensity, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
    n.connect(f); f.connect(g); g.connect(this.master);
    n.start(t); n.stop(t + 2.6);
  }

  card(red = false) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(red ? 320 : 520, t);
    o.frequency.exponentialRampToValueAtTime(red ? 160 : 700, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.26);
  }

  varBeep(up = true) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    [0, 0.12, 0.24].forEach((d, i) => {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = up ? 720 + i * 160 : 900 - i * 160;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, t + d);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.1);
      o.connect(g); g.connect(this.master);
      o.start(t + d); o.stop(t + d + 0.11);
    });
  }

  ui(kind = 'click') {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = kind === 'back' ? 320 : kind === 'error' ? 180 : 620;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.1);
  }
}

export default AudioSystem;
