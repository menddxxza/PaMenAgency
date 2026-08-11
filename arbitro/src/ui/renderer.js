// Renderizador 2D sobre canvas. Estilo propio: campo limpio, sprites
// vectoriales sencillos, cámara que sigue la acción y efectos de clima.

import { FIELD } from '../core/config.js';
import { clamp, lerp } from '../core/rng.js';

const L = FIELD.length, W = FIELD.width;
const MARGIN = 7; // metros de césped exterior

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.zoom = 1;               // 1 = campo completo
    this.follow = false;
    this.cam = { x: L / 2, y: W / 2 };
    this.shake = 0;
    this.flash = 0;
    this.flashColor = '#ffffff';
    this.floaters = [];
    this.particles = [];
    this.time = 0;
    this.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    this.resize();
  }

  resize() {
    const c = this.canvas;
    const r = c.getBoundingClientRect();
    const w = Math.max(320, r.width || c.clientWidth || 960);
    const h = Math.max(240, r.height || c.clientHeight || 600);
    c.width = Math.round(w * this.dpr);
    c.height = Math.round(h * this.dpr);
    this.w = w; this.h = h;
  }

  /** Escala px/m para que quepa el campo + márgenes. */
  baseScale() {
    return Math.min(this.w / (L + MARGIN * 2), this.h / (W + MARGIN * 2));
  }

  worldToScreen(x, y, s, cam) {
    return [(x - cam.x) * s + this.w / 2, (y - cam.y) * s + this.h / 2];
  }

  addFloater(text, x, y, color = '#fff', life = 2.2) {
    this.floaters.push({ text, x, y, color, life, max: life });
  }

  triggerFlash(color = '#ffffff', strength = 0.6) {
    this.flash = strength; this.flashColor = color;
  }

  triggerShake(v = 6) { this.shake = v; }

  // ------------------------------------------------------------- dibujo

  draw(match, opts = {}) {
    const ctx = this.ctx;
    const dt = opts.dt || 1 / 60;
    this.time += dt;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.w, this.h);

    const s = this.baseScale() * this.zoom;
    if (this.follow) {
      this.cam.x = lerp(this.cam.x, clamp(match.ball.pos.x, 20, L - 20), 0.06);
      this.cam.y = lerp(this.cam.y, clamp(match.ball.pos.y, 14, W - 14), 0.06);
    } else {
      this.cam.x = lerp(this.cam.x, L / 2, 0.08);
      this.cam.y = lerp(this.cam.y, W / 2, 0.08);
    }
    const cam = { ...this.cam };
    if (this.shake > 0.1) {
      cam.x += (Math.random() - 0.5) * this.shake * 0.08;
      cam.y += (Math.random() - 0.5) * this.shake * 0.08;
      this.shake *= 0.88;
    }

    this.drawStands(ctx, s, cam, match);
    this.drawPitch(ctx, s, cam, match);
    this.drawGoals(ctx, s, cam);
    if (opts.incident) this.drawIncidentMarker(ctx, s, cam, opts.incident);
    this.drawEntities(ctx, s, cam, match, opts);
    this.drawBall(ctx, s, cam, match);
    this.drawOfficials(ctx, s, cam, match, opts);
    this.drawWeather(ctx, dt, match);
    this.drawFloaters(ctx, s, cam, dt);

    if (this.flash > 0.01) {
      ctx.globalAlpha = this.flash * 0.5;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalAlpha = 1;
      this.flash *= 0.9;
    }
    ctx.restore();
  }

  drawStands(ctx, s, cam, match) {
    const [x0, y0] = this.worldToScreen(-MARGIN - 22, -MARGIN - 16, s, cam);
    const [x1, y1] = this.worldToScreen(L + MARGIN + 22, W + MARGIN + 16, s, cam);
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#10151c');
    g.addColorStop(0.5, '#161d27');
    g.addColorStop(1, '#10151c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    // Público: puntos que vibran con el ruido del estadio
    const noise = (match.atmosphere?.noise || 40) / 100;
    const cols = ['#2a3442', '#333f52', '#25303d'];
    const step = Math.max(5, 9 * s / 10);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    ctx.clip();
    const seed = match.stadium ? match.stadium.capacity : 10000;
    for (let sx = x0; sx < x1; sx += step) {
      for (let sy = y0; sy < y1; sy += step) {
        const [px, py] = this.worldToScreen(0, 0, s, cam);
        const inPitchX = sx > this.worldToScreen(-MARGIN, 0, s, cam)[0] && sx < this.worldToScreen(L + MARGIN, 0, s, cam)[0];
        const inPitchY = sy > this.worldToScreen(0, -MARGIN, s, cam)[1] && sy < this.worldToScreen(0, W + MARGIN, s, cam)[1];
        if (inPitchX && inPitchY) continue;
        const n = ((sx * 13 + sy * 7 + seed) % 97) / 97;
        const jitter = Math.sin(this.time * 6 + n * 12) * noise * 1.6;
        ctx.fillStyle = cols[Math.floor(n * cols.length)];
        ctx.globalAlpha = 0.55 + n * 0.35;
        ctx.fillRect(sx, sy + jitter, step * 0.55, step * 0.55);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  drawPitch(ctx, s, cam, match) {
    const [px, py] = this.worldToScreen(-MARGIN, -MARGIN, s, cam);
    const pw = (L + MARGIN * 2) * s, ph = (W + MARGIN * 2) * s;

    ctx.fillStyle = '#1d6b34';
    ctx.fillRect(px, py, pw, ph);

    // Franjas de corte del césped
    const stripes = 10;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.045)';
      const [sx] = this.worldToScreen((L / stripes) * i, 0, s, cam);
      ctx.fillRect(sx, this.worldToScreen(0, 0, s, cam)[1], (L / stripes) * s, W * s);
    }
    if (match.weather && match.weather.id === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      const [ax, ay] = this.worldToScreen(0, 0, s, cam);
      ctx.fillRect(ax, ay, L * s, W * s);
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.82)';
    ctx.lineWidth = Math.max(1, 0.12 * s);
    const line = (x1, y1, x2, y2) => {
      const [a, b] = this.worldToScreen(x1, y1, s, cam);
      const [c, d] = this.worldToScreen(x2, y2, s, cam);
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke();
    };
    const rect = (x, y, w, h) => {
      const [a, b] = this.worldToScreen(x, y, s, cam);
      ctx.strokeRect(a, b, w * s, h * s);
    };
    const arc = (x, y, r, a0, a1) => {
      const [a, b] = this.worldToScreen(x, y, s, cam);
      ctx.beginPath(); ctx.arc(a, b, r * s, a0, a1); ctx.stroke();
    };
    const dot = (x, y, r = 0.25) => {
      const [a, b] = this.worldToScreen(x, y, s, cam);
      ctx.beginPath(); ctx.arc(a, b, Math.max(1.5, r * s), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
    };

    rect(0, 0, L, W);
    line(L / 2, 0, L / 2, W);
    arc(L / 2, W / 2, FIELD.centreCircle, 0, Math.PI * 2);
    dot(L / 2, W / 2);

    const pa = FIELD.penaltyAreaLength, paw = FIELD.penaltyAreaWidth;
    const ga = FIELD.goalAreaLength, gaw = FIELD.goalAreaWidth;
    rect(0, W / 2 - paw / 2, pa, paw);
    rect(L - pa, W / 2 - paw / 2, pa, paw);
    rect(0, W / 2 - gaw / 2, ga, gaw);
    rect(L - ga, W / 2 - gaw / 2, ga, gaw);
    dot(FIELD.penaltySpot, W / 2);
    dot(L - FIELD.penaltySpot, W / 2);
    arc(FIELD.penaltySpot, W / 2, FIELD.centreCircle, -0.9, 0.9);
    arc(L - FIELD.penaltySpot, W / 2, FIELD.centreCircle, Math.PI - 0.9, Math.PI + 0.9);
    // Córners
    arc(0, 0, 1, 0, Math.PI / 2);
    arc(L, 0, 1, Math.PI / 2, Math.PI);
    arc(0, W, 1, -Math.PI / 2, 0);
    arc(L, W, 1, Math.PI, Math.PI * 1.5);
  }

  drawGoals(ctx, s, cam) {
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = Math.max(1.5, 0.18 * s);
    const gw = FIELD.goalWidth, gd = FIELD.goalDepth;
    for (const side of [0, 1]) {
      const x = side === 0 ? -gd : L;
      const [a, b] = this.worldToScreen(x, W / 2 - gw / 2, s, cam);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(a, b, gd * s, gw * s);
      ctx.strokeRect(a, b, gd * s, gw * s);
    }
  }

  drawIncidentMarker(ctx, s, cam, inc) {
    const [x, y] = this.worldToScreen(inc.pos.x, inc.pos.y, s, cam);
    const r = (1.6 + Math.sin(this.time * 6) * 0.4) * s;
    ctx.strokeStyle = 'rgba(255,214,10,0.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,214,10,0.35)';
    ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2); ctx.stroke();
  }

  drawEntities(ctx, s, cam, match, opts) {
    const r = 0.95 * s;
    const sorted = match.entities.filter((e) => e.onPitch && !e.red);
    for (const e of sorted) {
      const [x, y] = this.worldToScreen(e.pos.x, e.pos.y, s, cam);
      const kit = (match.kits && match.kits[e.side]) || match.teams[e.side].colors;
      const fill = kit.primary;
      const stroke = kit.secondary;

      // Sombra
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(x, y + r * 0.55, r * 0.9, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();

      // Cuerpo
      ctx.beginPath();
      ctx.arc(x, y, e.role === 'GK' ? r * 1.05 : r, 0, Math.PI * 2);
      ctx.fillStyle = e.role === 'GK' ? '#4ade80' : fill;
      ctx.fill();
      ctx.lineWidth = Math.max(1, r * 0.18);
      ctx.strokeStyle = e.injured ? '#ff5252' : e.mood === 'frustrated' ? '#ff9f1c' : stroke;
      ctx.stroke();

      // Dirección
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = Math.max(1, r * 0.22);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(e.facing) * r * 1.35, y + Math.sin(e.facing) * r * 1.35);
      ctx.stroke();

      // Dorsal
      if (s > 7) {
        ctx.fillStyle = '#0b0e12';
        ctx.font = `700 ${Math.round(r * 1.05)}px system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(e.player.number), x, y + 0.5);
      }
      // Tarjeta amarilla visible
      if (e.yellow > 0) {
        ctx.fillStyle = '#ffd60a';
        ctx.fillRect(x + r * 0.75, y - r * 1.5, r * 0.55, r * 0.8);
      }
      if (e.injured) {
        ctx.fillStyle = '#ff5252';
        ctx.font = `700 ${Math.round(r)}px system-ui`;
        ctx.fillText('+', x - r * 1.4, y - r * 1.1);
      }
    }
  }

  drawBall(ctx, s, cam, match) {
    const b = match.ball;
    const [x, y] = this.worldToScreen(b.pos.x, b.pos.y, s, cam);
    const h = b.height || 0;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 0.3 * s, 0.36 * s, 0.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    const rr = (0.36 + h * 0.05) * s;
    ctx.beginPath();
    ctx.arc(x, y - h * 0.55 * s, rr, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#1c1c1c'; ctx.lineWidth = 1; ctx.stroke();
  }

  drawOfficials(ctx, s, cam, match, opts) {
    // Asistentes
    for (let i = 0; i < 2; i++) {
      const a = match.assistantsPos[i];
      const yy = i === 0 ? -1.4 : W + 1.4;
      const [x, y] = this.worldToScreen(a.x, yy, s, cam);
      ctx.fillStyle = '#f7b32b';
      ctx.beginPath(); ctx.arc(x, y, 0.85 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1.5; ctx.stroke();
      // Banderín
      const flag = opts.flagUp && opts.flagUp === i;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - (flag ? 2.4 : 1.2) * s);
      ctx.stroke();
      if (flag) {
        ctx.fillStyle = '#ff3b30';
        ctx.fillRect(x, y - 2.4 * s, 1.2 * s, 0.8 * s);
      }
    }

    // Árbitro
    const r = match.ref;
    const [x, y] = this.worldToScreen(r.pos.x, r.pos.y, s, cam);
    const kit = opts.kit || { shirt: '#111418', trim: '#f2c14e' };

    // Cono de visión
    const fov = 1.15;
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 22 * s);
    grad.addColorStop(0, 'rgba(255,255,255,0.16)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 22 * s, r.facing - fov, r.facing + fov);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y + 0.6 * s, s * 0.9, s * 0.45, 0, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(x, y, 1.05 * s, 0, Math.PI * 2);
    ctx.fillStyle = kit.shirt; ctx.fill();
    ctx.lineWidth = Math.max(1.5, 0.22 * s);
    ctx.strokeStyle = r.sprinting ? '#ffd60a' : kit.trim;
    ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, 0.24 * s);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(r.facing) * 1.7 * s, y + Math.sin(r.facing) * 1.7 * s);
    ctx.stroke();
  }

  drawWeather(ctx, dt, match) {
    const wid = match.weather ? match.weather.id : 'clear';
    if (wid === 'clear' || wid === 'heat') return;
    const want = wid === 'storm' ? 260 : wid === 'rain' ? 150 : wid === 'snow' ? 120 : 40;
    while (this.particles.length < want) {
      this.particles.push({
        x: Math.random() * this.w, y: Math.random() * this.h,
        v: wid === 'snow' ? 40 + Math.random() * 40 : 420 + Math.random() * 320,
        d: wid === 'wind' ? 2.2 : wid === 'storm' ? 0.9 : 0.35,
      });
    }
    while (this.particles.length > want) this.particles.pop();
    ctx.strokeStyle = wid === 'snow' ? 'rgba(255,255,255,0.85)' : 'rgba(190,220,255,0.5)';
    ctx.lineWidth = 1;
    for (const p of this.particles) {
      p.y += p.v * dt;
      p.x += p.v * dt * p.d * 0.35;
      if (p.y > this.h) { p.y = -10; p.x = Math.random() * this.w; }
      if (p.x > this.w) p.x = 0;
      if (wid === 'snow') {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(p.x, p.y, 2, 2);
      } else {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.d * 6, p.y - 10);
        ctx.stroke();
      }
    }
    if (wid === 'storm' && Math.random() < 0.004) this.triggerFlash('#dbeafe', 0.7);
  }

  drawFloaters(ctx, s, cam, dt) {
    ctx.textAlign = 'center';
    for (const f of this.floaters) {
      f.life -= dt;
      const t = f.life / f.max;
      const [x, y] = this.worldToScreen(f.x, f.y, s, cam);
      ctx.globalAlpha = clamp(t * 1.4, 0, 1);
      ctx.font = `700 ${Math.max(11, 1.35 * s)}px system-ui, sans-serif`;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(f.text, x, y - (1 - t) * 26 - 12);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, x, y - (1 - t) * 26 - 12);
    }
    ctx.globalAlpha = 1;
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  // -------------------------------------------------------- repeticiones

  /** Dibuja un frame guardado (sala VAR). */
  drawReplay(frame, match, session) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.w, this.h);
    if (!frame) { ctx.restore(); return; }

    const cams = {
      main: { zoom: 1, cx: L / 2, cy: W / 2, rot: 0 },
      side: { zoom: 1.7, cx: frame.ball.x, cy: frame.ball.y, rot: 0 },
      behindGoal: { zoom: 2.1, cx: frame.ball.x > L / 2 ? L - 16 : 16, cy: W / 2, rot: 0 },
      tactical: { zoom: 0.85, cx: L / 2, cy: W / 2, rot: 0 },
    };
    const c = cams[session.camera] || cams.main;
    const s = this.baseScale() * c.zoom * (session.zoom || 1);
    const cam = { x: c.cx, y: c.cy };

    this.drawStands(ctx, s, cam, match);
    this.drawPitch(ctx, s, cam, match);
    this.drawGoals(ctx, s, cam);

    for (const p of frame.players) {
      const [x, y] = this.worldToScreen(p.x, p.y, s, cam);
      const kit = (match.kits && match.kits[p.s]) || match.teams[p.s].colors;
      ctx.beginPath(); ctx.arc(x, y, 0.95 * s, 0, Math.PI * 2);
      ctx.fillStyle = kit.primary; ctx.fill();
      ctx.strokeStyle = kit.secondary; ctx.lineWidth = 2; ctx.stroke();
    }
    const [bx, by] = this.worldToScreen(frame.ball.x, frame.ball.y, s, cam);
    ctx.beginPath(); ctx.arc(bx, by, 0.4 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.stroke();

    const [rx, ry] = this.worldToScreen(frame.ref.x, frame.ref.y, s, cam);
    ctx.beginPath(); ctx.arc(rx, ry, 0.95 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#111418'; ctx.fill(); ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 2; ctx.stroke();

    // Línea de fuera de juego
    if (session.offsideLine) {
      const inc = session.incident;
      const dir = inc && inc.pos ? inc.pos.x : frame.ball.x;
      const defs = frame.players.filter((p) => p.s === (inc ? 1 - inc.offenderSide : 1)).map((p) => p.x).sort((a, b) => a - b);
      const lineX = defs.length > 1 ? (dir < L / 2 ? defs[1] : defs[defs.length - 2]) : dir;
      const [lx, ly0] = this.worldToScreen(lineX, 0, s, cam);
      const [, ly1] = this.worldToScreen(lineX, W, s, cam);
      ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(lx, ly0); ctx.lineTo(lx, ly1); ctx.stroke();
      ctx.setLineDash([]);
      const attX = session.incident ? session.incident.pos.x : frame.ball.x;
      const [ax] = this.worldToScreen(attX, 0, s, cam);
      ctx.strokeStyle = '#ff2d55';
      ctx.beginPath(); ctx.moveTo(ax, ly0); ctx.lineTo(ax, ly1); ctx.stroke();
    }

    // Marco de televisión
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, this.w - 6, this.h - 6);
    ctx.restore();
  }
}

export default Renderer;
