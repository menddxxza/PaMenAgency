// Renderizador 2D. Estilo propio: estadio nocturno bajo focos, gráficos
// de retransmisión y sprites vectoriales dibujados a mano (sin assets).
// Paleta y tipografía vienen de styles/tokens.css: la interfaz y el campo
// nunca se desincronizan.

import { FIELD } from '../core/config.js';
import { clamp, lerp } from '../core/rng.js';

const L = FIELD.length, W = FIELD.width;
const MARGIN = 6.5;          // metros de césped exterior
const STAND_DEPTH = 26;      // metros de gradas dibujadas

// Lee un token del sistema de diseño; si no está, usa el respaldo.
function token(name, fallback) {
  if (typeof getComputedStyle === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.zoom = 1;
    this.follow = false;
    this.cam = { x: L / 2, y: W / 2 };
    this.camZoom = 1;
    this.shake = 0;
    this.flash = 0;
    this.flashColor = '#ffffff';
    this.floaters = [];
    this.particles = [];
    this.trail = [];
    this.time = 0;
    this.spot = null;          // foco sobre la jugada en decisión
    this.dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    this.palette = {
      turf: token('--canvas-turf', '#1f7038'),
      turfDark: token('--canvas-turf-dark', '#185c2e'),
      line: token('--canvas-line', 'rgba(238,246,240,0.86)'),
      night: token('--canvas-night', '#0c1118'),
    };
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

  baseScale() {
    // Se encuadra el campo + un anillo de grada: el estadio forma parte del
    // plano, no es un borde recortado.
    const ring = 9;
    return Math.min(this.w / (L + (MARGIN + ring) * 2), this.h / (W + (MARGIN + ring) * 2));
  }

  worldToScreen(x, y, s, cam) {
    return [(x - cam.x) * s + this.w / 2, (y - cam.y) * s + this.h / 2];
  }

  addFloater(text, x, y, color = '#fff', life = 2.2) {
    this.floaters.push({ text, x, y, color, life, max: life });
  }

  triggerFlash(color = '#ffffff', strength = 0.6) { this.flash = strength; this.flashColor = color; }
  triggerShake(v = 6) { this.shake = v; }

  /** Ilumina una jugada concreta y apaga el resto del campo. */
  setSpotlight(pos) { this.spot = pos ? { x: pos.x, y: pos.y, t: 0 } : null; }

  // ═══════════════════════════════════════════════════════════ dibujo

  draw(match, opts = {}) {
    const ctx = this.ctx;
    const dt = opts.dt || 1 / 60;
    this.time += dt;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.w, this.h);

    // Cámara: acompaña al balón, y se acerca cuando hay una jugada que juzgar
    const wantZoom = opts.incident ? 1.32 : this.follow ? 1.12 : 1;
    this.camZoom = lerp(this.camZoom, wantZoom, 0.05);
    const s = this.baseScale() * this.zoom * this.camZoom;

    const target = opts.incident ? opts.incident.pos
      : this.follow ? match.ball.pos : { x: L / 2, y: W / 2 };
    const bx = clamp(target.x, L / 2 - (L / 2) * (1 - 1 / this.camZoom) - 2, L / 2 + (L / 2) * (1 - 1 / this.camZoom) + 2);
    const by = clamp(target.y, W / 2 - (W / 2) * (1 - 1 / this.camZoom) - 2, W / 2 + (W / 2) * (1 - 1 / this.camZoom) + 2);
    this.cam.x = lerp(this.cam.x, opts.incident ? target.x : bx, opts.incident ? 0.1 : 0.06);
    this.cam.y = lerp(this.cam.y, opts.incident ? target.y : by, opts.incident ? 0.1 : 0.06);

    const cam = { ...this.cam };
    if (this.shake > 0.1) {
      cam.x += (Math.random() - 0.5) * this.shake * 0.08;
      cam.y += (Math.random() - 0.5) * this.shake * 0.08;
      this.shake *= 0.88;
    }

    this.drawStadium(ctx, s, cam, match);
    this.drawPitch(ctx, s, cam, match);
    this.drawGoals(ctx, s, cam, match);
    this.drawCornerFlags(ctx, s, cam, match);
    this.drawBenches(ctx, s, cam, match);
    this.drawEntities(ctx, s, cam, match, opts);
    this.drawBall(ctx, s, cam, match, dt);
    this.drawOfficials(ctx, s, cam, match, opts);
    if (opts.incident) this.drawSpotlight(ctx, s, cam, opts.incident, dt);
    this.drawWeather(ctx, dt, match);
    this.drawFloaters(ctx, s, cam, dt);
    this.drawVignette(ctx);

    if (this.flash > 0.01) {
      ctx.globalAlpha = this.flash * 0.5;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.globalAlpha = 1;
      this.flash *= 0.9;
    }
    ctx.restore();
  }

  // ── Estadio ─────────────────────────────────────────────────────────

  drawStadium(ctx, s, cam, match) {
    const p = this.palette;
    ctx.fillStyle = p.night;
    ctx.fillRect(0, 0, this.w, this.h);

    const [ix0, iy0] = this.worldToScreen(-MARGIN, -MARGIN, s, cam);
    const [ix1, iy1] = this.worldToScreen(L + MARGIN, W + MARGIN, s, cam);
    const [ox0, oy0] = this.worldToScreen(-MARGIN - STAND_DEPTH, -MARGIN - STAND_DEPTH * 0.62, s, cam);
    const [ox1, oy1] = this.worldToScreen(L + MARGIN + STAND_DEPTH, W + MARGIN + STAND_DEPTH * 0.62, s, cam);

    // Cuenco de gradas: anillos concéntricos, más claros hacia el campo
    const tiers = 7;
    for (let i = tiers; i >= 1; i--) {
      const k = i / tiers;
      const x0 = lerp(ix0, ox0, k), y0 = lerp(iy0, oy0, k);
      const x1 = lerp(ix1, ox1, k), y1 = lerp(iy1, oy1, k);
      ctx.fillStyle = `rgba(${28 + i * 3}, ${34 + i * 4}, ${46 + i * 5}, 1)`;
      ctx.beginPath();
      ctx.roundRect(x0, y0, x1 - x0, y1 - y0, 14 + i * 3);
      ctx.fill();
    }

    // Público: densidad proporcional al aforo, vibración según el ruido
    const cap = match.stadium ? match.stadium.capacity : 12000;
    const density = clamp(cap / 60000, 0.18, 1);
    const noise = (match.atmosphere?.noise || 40) / 100;
    const step = Math.max(4, 3.2 * s / 6);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(ox0, oy0, ox1 - ox0, oy1 - oy0, 34);
    ctx.rect(ix1, iy1, ix0 - ix1, iy0 - iy1); // recorta el hueco del campo
    ctx.clip('evenodd');
    for (let sx = ox0; sx < ox1; sx += step) {
      for (let sy = oy0; sy < oy1; sy += step) {
        const n = (Math.sin(sx * 12.9898 + sy * 78.233) * 43758.5453) % 1;
        const r = n < 0 ? n + 1 : n;
        if (r > density) continue;
        const jitter = Math.sin(this.time * 7 + r * 40) * noise * 1.5;
        const shade = 58 + Math.floor(r * 70);
        ctx.fillStyle = `rgba(${shade}, ${shade + 10}, ${shade + 24}, ${0.5 + r * 0.4})`;
        ctx.fillRect(sx, sy + jitter, step * 0.6, step * 0.6);
      }
    }
    ctx.restore();

    // Focos: cuatro torres proyectando sobre el césped
    if (!match.stadium || match.stadium.floodlights !== false) {
      const corners = [[-MARGIN - 8, -MARGIN - 6], [L + MARGIN + 8, -MARGIN - 6],
        [-MARGIN - 8, W + MARGIN + 6], [L + MARGIN + 8, W + MARGIN + 6]];
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const [wx, wy] of corners) {
        const [cx, cy] = this.worldToScreen(wx, wy, s, cam);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 62 * s);
        g.addColorStop(0, 'rgba(226, 240, 255, 0.16)');
        g.addColorStop(0.45, 'rgba(200, 226, 255, 0.05)');
        g.addColorStop(1, 'rgba(200, 226, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 62 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  drawPitch(ctx, s, cam, match) {
    const p = this.palette;
    const [px, py] = this.worldToScreen(-MARGIN, -MARGIN, s, cam);
    const pw = (L + MARGIN * 2) * s, ph = (W + MARGIN * 2) * s;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 6);
    ctx.clip();

    ctx.fillStyle = p.turfDark;
    ctx.fillRect(px, py, pw, ph);

    // Corte del césped: franjas verticales y un tramado horizontal tenue
    const stripes = 12;
    for (let i = 0; i < stripes; i++) {
      const [sx] = this.worldToScreen(-MARGIN + ((L + MARGIN * 2) / stripes) * i, 0, s, cam);
      ctx.fillStyle = i % 2 ? p.turf : p.turfDark;
      ctx.fillRect(sx, py, ((L + MARGIN * 2) / stripes) * s + 1, ph);
    }
    ctx.globalAlpha = 0.028;
    for (let i = 0; i < 14; i++) {
      const [, sy] = this.worldToScreen(0, -MARGIN + ((W + MARGIN * 2) / 14) * i, s, cam);
      ctx.fillStyle = i % 2 ? '#ffffff' : '#000000';
      ctx.fillRect(px, sy, pw, ((W + MARGIN * 2) / 14) * s + 1);
    }
    ctx.globalAlpha = 1;

    // Caída de luz: el centro del campo recibe más foco que las esquinas
    const lightFall = ctx.createRadialGradient(
      px + pw / 2, py + ph / 2, Math.min(pw, ph) * 0.2,
      px + pw / 2, py + ph / 2, Math.max(pw, ph) * 0.62,
    );
    lightFall.addColorStop(0, 'rgba(255, 250, 226, 0.06)');
    lightFall.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
    lightFall.addColorStop(1, 'rgba(4, 10, 8, 0.3)');
    ctx.fillStyle = lightFall;
    ctx.fillRect(px, py, pw, ph);

    // Césped mojado: brillo especular bajo los focos
    if (match.weather && (match.weather.id === 'rain' || match.weather.id === 'storm')) {
      const g = ctx.createLinearGradient(px, py, px + pw, py + ph);
      g.addColorStop(0, 'rgba(150, 200, 235, 0.09)');
      g.addColorStop(0.5, 'rgba(150, 200, 235, 0.02)');
      g.addColorStop(1, 'rgba(150, 200, 235, 0.1)');
      ctx.fillStyle = g;
      ctx.fillRect(px, py, pw, ph);
    }
    if (match.weather && match.weather.id === 'snow') {
      ctx.fillStyle = 'rgba(236, 244, 252, 0.42)';
      ctx.fillRect(px, py, pw, ph);
    }
    ctx.restore();

    // ── Líneas
    ctx.strokeStyle = p.line;
    ctx.lineWidth = Math.max(1, 0.12 * s);
    ctx.lineCap = 'butt';

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
    const dot = (x, y, r = 0.22) => {
      const [a, b] = this.worldToScreen(x, y, s, cam);
      ctx.beginPath(); ctx.arc(a, b, Math.max(1.4, r * s), 0, Math.PI * 2);
      ctx.fillStyle = p.line; ctx.fill();
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
    arc(FIELD.penaltySpot, W / 2, FIELD.centreCircle, -0.93, 0.93);
    arc(L - FIELD.penaltySpot, W / 2, FIELD.centreCircle, Math.PI - 0.93, Math.PI + 0.93);
    arc(0, 0, 1, 0, Math.PI / 2);
    arc(L, 0, 1, Math.PI / 2, Math.PI);
    arc(0, W, 1, -Math.PI / 2, 0);
    arc(L, W, 1, Math.PI, Math.PI * 1.5);
  }

  drawGoals(ctx, s, cam, match) {
    const gw = FIELD.goalWidth, gd = FIELD.goalDepth;
    for (const side of [0, 1]) {
      const x = side === 0 ? -gd : L;
      const [a, b] = this.worldToScreen(x, W / 2 - gw / 2, s, cam);
      const w = gd * s, h = gw * s;

      // Red: retícula fina
      ctx.save();
      ctx.beginPath(); ctx.rect(a, b, w, h); ctx.clip();
      ctx.fillStyle = 'rgba(226, 238, 248, 0.1)';
      ctx.fillRect(a, b, w, h);
      ctx.strokeStyle = 'rgba(226, 238, 248, 0.28)';
      ctx.lineWidth = 1;
      const cell = Math.max(3, 0.42 * s);
      for (let gx = a; gx <= a + w; gx += cell) {
        ctx.beginPath(); ctx.moveTo(gx, b); ctx.lineTo(gx, b + h); ctx.stroke();
      }
      for (let gy = b; gy <= b + h; gy += cell) {
        ctx.beginPath(); ctx.moveTo(a, gy); ctx.lineTo(a + w, gy); ctx.stroke();
      }
      ctx.restore();

      // Postes y travesaño
      ctx.strokeStyle = '#f4f8fb';
      ctx.lineWidth = Math.max(2, 0.2 * s);
      ctx.beginPath();
      ctx.moveTo(side === 0 ? a + w : a, b);
      ctx.lineTo(side === 0 ? a : a + w, b);
      ctx.lineTo(side === 0 ? a : a + w, b + h);
      ctx.lineTo(side === 0 ? a + w : a, b + h);
      ctx.stroke();
    }
  }

  drawCornerFlags(ctx, s, cam, match) {
    const wind = match.weather && (match.weather.id === 'wind' || match.weather.id === 'storm') ? 1.9 : 0.6;
    const corners = [[0, 0], [L, 0], [0, W], [L, W]];
    for (const [wx, wy] of corners) {
      const [x, y] = this.worldToScreen(wx, wy, s, cam);
      const hgt = 1.6 * s;
      ctx.strokeStyle = 'rgba(240, 246, 250, 0.75)';
      ctx.lineWidth = Math.max(1, 0.1 * s);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - hgt); ctx.stroke();
      const sway = Math.sin(this.time * 3.4 + wx + wy) * wind * 0.14 * s;
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath();
      ctx.moveTo(x, y - hgt);
      ctx.lineTo(x + 0.9 * s + sway, y - hgt + 0.3 * s);
      ctx.lineTo(x, y - hgt + 0.62 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  /** Áreas técnicas y banquillos: el partido tiene bandas, no sólo campo. */
  drawBenches(ctx, s, cam, match) {
    for (const side of [0, 1]) {
      const y = side === 0 ? -MARGIN + 0.6 : W + MARGIN - 2.4;
      const [x0, y0] = this.worldToScreen(L / 2 - 14, y, s, cam);
      const w = 28 * s, h = 1.8 * s;
      ctx.fillStyle = 'rgba(12, 17, 24, 0.72)';
      ctx.beginPath(); ctx.roundRect(x0, y0, w, h, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1; ctx.stroke();

      // Suplentes y cuerpo técnico
      const kit = (match.kits && match.kits[side]) || match.teams[side].colors;
      const left = (match.bench && match.bench[side]) ? match.bench[side].length : 7;
      for (let i = 0; i < Math.min(left, 9); i++) {
        ctx.fillStyle = kit.primary;
        ctx.beginPath();
        ctx.arc(x0 + (i + 1) * (w / 11), y0 + h / 2, Math.max(1.6, 0.32 * s), 0, Math.PI * 2);
        ctx.fill();
      }
      // El entrenador, en el borde del área técnica
      ctx.fillStyle = '#e8eef6';
      ctx.beginPath();
      ctx.arc(x0 + w - (w / 11), y0 + h / 2, Math.max(1.8, 0.36 * s), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Jugadores ───────────────────────────────────────────────────────

  drawEntities(ctx, s, cam, match, opts) {
    const r = 0.98 * s;
    const carrier = match.ball.owner;
    const list = match.entities.filter((e) => e.onPitch && !e.red);

    for (const e of list) {
      const [x, y] = this.worldToScreen(e.pos.x, e.pos.y, s, cam);
      const kit = (match.kits && match.kits[e.side]) || match.teams[e.side].colors;
      const isGK = e.role === 'GK';
      const fill = isGK ? '#3fd07f' : kit.primary;
      const trim = isGK ? '#0d2a1a' : kit.secondary;

      // Sombra proyectada por los focos
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(x + r * 0.28, y + r * 0.6, r * 0.92, r * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Halo del portador del balón
      if (carrier === e.id) {
        ctx.strokeStyle = 'rgba(242, 193, 78, 0.85)';
        ctx.lineWidth = Math.max(1.5, r * 0.2);
        ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.stroke();
      }

      // Camiseta: disco sólido con vivo del color secundario y morro corto
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(e.facing);
      ctx.beginPath();
      ctx.arc(0, 0, isGK ? r * 1.05 : r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = Math.max(1.2, r * 0.22);
      ctx.strokeStyle = trim;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.beginPath();
      ctx.moveTo(r * 1.02, 0);
      ctx.lineTo(r * 0.52, -r * 0.28);
      ctx.lineTo(r * 0.52, r * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Aro de estado: lesionado, calentándose, amonestado
      const ring = e.injured ? '#ff5a5a'
        : e.mood === 'frustrated' ? '#ff9f1c'
          : e.yellow >= 1 ? 'rgba(255, 214, 10, 0.75)' : null;
      if (ring) {
        ctx.strokeStyle = ring;
        ctx.lineWidth = Math.max(1.2, r * 0.18);
        ctx.beginPath(); ctx.arc(x, y, r * 1.16, 0, Math.PI * 2); ctx.stroke();
      }

      // Dorsal
      if (s > 6) {
        ctx.font = `700 ${Math.round(r * 0.95)}px ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = Math.max(2, r * 0.3);
        ctx.strokeStyle = 'rgba(8, 12, 17, 0.75)';
        ctx.strokeText(String(e.player.number), x, y + 0.5);
        ctx.fillStyle = '#f6f9fc';
        ctx.fillText(String(e.player.number), x, y + 0.5);
      }
      if (e.injured) {
        ctx.fillStyle = '#ff5a5a';
        ctx.font = `700 ${Math.round(r * 1.1)}px ui-sans-serif, sans-serif`;
        ctx.fillText('+', x - r * 1.5, y - r * 1.2);
      }
    }
  }

  drawBall(ctx, s, cam, match, dt) {
    const b = match.ball;
    const [x, y] = this.worldToScreen(b.pos.x, b.pos.y, s, cam);
    const h = b.height || 0;
    const speed = Math.hypot(b.vel.x, b.vel.y);

    // Estela: sólo cuando el balón va fuerte, y se apaga sola
    this.trail.push({ x, y, a: clamp(speed / 26, 0, 1) });
    if (this.trail.length > 12) this.trail.shift();
    if (speed > 9) {
      ctx.lineCap = 'round';
      for (let i = 1; i < this.trail.length; i++) {
        const t = i / this.trail.length;
        ctx.strokeStyle = `rgba(255, 255, 255, ${t * this.trail[i].a * 0.28})`;
        ctx.lineWidth = t * 0.5 * s;
        ctx.beginPath();
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
        ctx.lineTo(this.trail[i].x, this.trail[i].y);
        ctx.stroke();
      }
    } else {
      this.trail.length = 0;
    }

    ctx.fillStyle = `rgba(0, 0, 0, ${0.4 - Math.min(h, 4) * 0.05})`;
    ctx.beginPath();
    ctx.ellipse(x + 0.18 * s, y + 0.34 * s, 0.38 * s, 0.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const rr = (0.36 + h * 0.045) * s;
    const cy = y - h * 0.55 * s;
    const g = ctx.createRadialGradient(x - rr * 0.35, cy - rr * 0.35, rr * 0.1, x, cy, rr);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#c8d2dc');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, cy, rr, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(20, 26, 34, 0.75)';
    ctx.lineWidth = 1; ctx.stroke();
  }

  // ── Equipo arbitral ─────────────────────────────────────────────────

  drawOfficials(ctx, s, cam, match, opts) {
    // Asistentes sobre la línea de banda
    for (let i = 0; i < 2; i++) {
      const a = match.assistantsPos[i];
      const yy = i === 0 ? -1.5 : W + 1.5;
      const [x, y] = this.worldToScreen(a.x, yy, s, cam);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(x + 0.2 * s, y + 0.5 * s, 0.8 * s, 0.36 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2c14e';
      ctx.beginPath(); ctx.arc(x, y, 0.82 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#12181f'; ctx.lineWidth = Math.max(1, 0.12 * s); ctx.stroke();

      const flag = opts.flagUp === i;
      ctx.strokeStyle = 'rgba(240,246,250,0.9)';
      ctx.lineWidth = Math.max(1.2, 0.1 * s);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - (flag ? 2.6 : 1.1) * s);
      ctx.stroke();
      if (flag) {
        ctx.fillStyle = '#ff3b30';
        ctx.beginPath();
        ctx.moveTo(x, y - 2.6 * s);
        ctx.lineTo(x + 1.35 * s, y - 2.2 * s);
        ctx.lineTo(x, y - 1.75 * s);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Árbitro principal
    const r = match.ref;
    const [x, y] = this.worldToScreen(r.pos.x, r.pos.y, s, cam);
    const kit = opts.kit || { shirt: '#111418', trim: '#f2c14e' };

    // Campo de visión: lo que el árbitro puede juzgar de verdad
    const fov = 1.1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 24 * s);
    grad.addColorStop(0, 'rgba(255, 246, 214, 0.16)');
    grad.addColorStop(0.6, 'rgba(255, 246, 214, 0.05)');
    grad.addColorStop(1, 'rgba(255, 246, 214, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 24 * s, r.facing - fov, r.facing + fov);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(x + 0.3 * s, y + 0.62 * s, s * 0.95, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r.facing);
    ctx.beginPath(); ctx.arc(0, 0, 1.02 * s, 0, Math.PI * 2);
    ctx.fillStyle = kit.shirt; ctx.fill();
    ctx.lineWidth = Math.max(1.6, 0.2 * s);
    ctx.strokeStyle = r.sprinting ? '#ffd60a' : kit.trim;
    ctx.stroke();
    ctx.fillStyle = kit.trim;
    ctx.beginPath();
    ctx.moveTo(0.98 * s, 0);
    ctx.lineTo(0.32 * s, -0.44 * s);
    ctx.lineTo(0.32 * s, 0.44 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Aviso de físico bajo: se ve en el campo, no sólo en el HUD
    if (r.stamina < 25) {
      const pulse = 0.35 + Math.sin(this.time * 5) * 0.25;
      ctx.strokeStyle = `rgba(255, 90, 90, ${pulse})`;
      ctx.lineWidth = Math.max(1.4, 0.16 * s);
      ctx.beginPath(); ctx.arc(x, y, 1.5 * s, 0, Math.PI * 2); ctx.stroke();
    }
  }

  /** Oscurece el campo salvo la jugada que hay que juzgar. */
  drawSpotlight(ctx, s, cam, incident, dt) {
    const [x, y] = this.worldToScreen(incident.pos.x, incident.pos.y, s, cam);
    const rad = 9 * s;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, rad * 0.35, x, y, rad * 2.6);
    g.addColorStop(0, 'rgba(6, 9, 13, 0)');
    g.addColorStop(1, 'rgba(6, 9, 13, 0.5)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
    ctx.restore();

    const pulse = 1 + Math.sin(this.time * 5) * 0.06;
    ctx.strokeStyle = 'rgba(242, 193, 78, 0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -this.time * 22;
    ctx.beginPath(); ctx.arc(x, y, rad * 0.62 * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  drawVignette(ctx) {
    const g = ctx.createRadialGradient(
      this.w / 2, this.h / 2, Math.min(this.w, this.h) * 0.32,
      this.w / 2, this.h / 2, Math.max(this.w, this.h) * 0.78,
    );
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  }

  drawWeather(ctx, dt, match) {
    const wid = match.weather ? match.weather.id : 'clear';
    if (wid === 'clear' || wid === 'heat') { this.particles.length = 0; return; }
    const want = wid === 'storm' ? 300 : wid === 'rain' ? 170 : wid === 'snow' ? 140 : 50;
    while (this.particles.length < want) {
      this.particles.push({
        x: Math.random() * this.w, y: Math.random() * this.h,
        v: wid === 'snow' ? 40 + Math.random() * 45 : 460 + Math.random() * 340,
        d: wid === 'wind' ? 2.4 : wid === 'storm' ? 1 : 0.35,
        w: 0.4 + Math.random() * 0.8,
      });
    }
    while (this.particles.length > want) this.particles.pop();

    ctx.lineCap = 'round';
    for (const p of this.particles) {
      p.y += p.v * dt;
      p.x += p.v * dt * p.d * 0.35;
      if (p.y > this.h) { p.y = -10; p.x = Math.random() * this.w; }
      if (p.x > this.w) p.x = 0;
      if (wid === 'snow') {
        ctx.fillStyle = `rgba(240, 248, 255, ${0.5 + p.w * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x + Math.sin(this.time * 2 + p.y * 0.05) * 6, p.y, p.w * 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(190, 220, 255, ${0.22 + p.w * 0.24})`;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.d * 7, p.y - 12);
        ctx.stroke();
      }
    }
    if (wid === 'storm' && Math.random() < 0.004) this.triggerFlash('#dbeafe', 0.7);
  }

  drawFloaters(ctx, s, cam, dt) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (const f of this.floaters) {
      f.life -= dt;
      const t = f.life / f.max;
      const [x, y] = this.worldToScreen(f.x, f.y, s, cam);
      ctx.globalAlpha = clamp(t * 1.5, 0, 1);
      ctx.font = `700 ${Math.max(12, 1.3 * s)}px ui-sans-serif, system-ui, sans-serif`;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(6, 9, 13, 0.85)';
      ctx.strokeText(f.text, x, y - (1 - t) * 30 - 14);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, x, y - (1 - t) * 30 - 14);
    }
    ctx.globalAlpha = 1;
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  // ═════════════════════════════════════════════════════ repeticiones

  /** Dibuja un frame guardado dentro de la sala VAR. */
  drawReplay(frame, match, session) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.clearRect(0, 0, this.w, this.h);
    if (!frame) { ctx.restore(); return; }

    const cams = {
      main: { zoom: 1, cx: L / 2, cy: W / 2 },
      side: { zoom: 1.8, cx: frame.ball.x, cy: frame.ball.y },
      behindGoal: { zoom: 2.2, cx: frame.ball.x > L / 2 ? L - 14 : 14, cy: W / 2 },
      tactical: { zoom: 0.9, cx: L / 2, cy: W / 2 },
    };
    const c = cams[session.camera] || cams.main;
    const s = this.baseScale() * c.zoom * (session.zoom || 1);
    const cam = { x: c.cx, y: c.cy };

    this.drawStadium(ctx, s, cam, match);
    this.drawPitch(ctx, s, cam, match);
    this.drawGoals(ctx, s, cam, match);

    for (const p of frame.players) {
      const [x, y] = this.worldToScreen(p.x, p.y, s, cam);
      const kit = (match.kits && match.kits[p.s]) || match.teams[p.s].colors;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(x + 0.2 * s, y + 0.5 * s, 0.85 * s, 0.38 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, 0.95 * s, 0, Math.PI * 2);
      ctx.fillStyle = kit.primary; ctx.fill();
      ctx.strokeStyle = kit.secondary; ctx.lineWidth = Math.max(1.2, 0.14 * s); ctx.stroke();
    }
    const [bx, by] = this.worldToScreen(frame.ball.x, frame.ball.y, s, cam);
    ctx.beginPath(); ctx.arc(bx, by, 0.42 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#12181f'; ctx.lineWidth = 1; ctx.stroke();

    const [rx, ry] = this.worldToScreen(frame.ref.x, frame.ref.y, s, cam);
    ctx.beginPath(); ctx.arc(rx, ry, 0.95 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#111418'; ctx.fill();
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = Math.max(1.4, 0.16 * s); ctx.stroke();

    // Línea de fuera de juego calibrada
    if (session.offsideLine) {
      const inc = session.incident;
      const defSide = inc ? 1 - inc.offenderSide : 1;
      const defs = frame.players.filter((p) => p.s === defSide).map((p) => p.x).sort((a, b) => a - b);
      const attackingLeft = inc && inc.pos.x < L / 2;
      const lineX = defs.length > 1 ? (attackingLeft ? defs[1] : defs[defs.length - 2]) : frame.ball.x;
      const attX = inc ? inc.pos.x : frame.ball.x;
      const [ly0] = [this.worldToScreen(0, 0, s, cam)[1]];
      const ly1 = this.worldToScreen(0, W, s, cam)[1];
      const [lx] = this.worldToScreen(lineX, 0, s, cam);
      const [ax] = this.worldToScreen(attX, 0, s, cam);

      ctx.save();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
      ctx.fillRect(Math.min(lx, ax), ly0, Math.abs(ax - lx), ly1 - ly0);
      ctx.setLineDash([7, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00e5ff';
      ctx.beginPath(); ctx.moveTo(lx, ly0); ctx.lineTo(lx, ly1); ctx.stroke();
      ctx.strokeStyle = '#ff2d55';
      ctx.beginPath(); ctx.moveTo(ax, ly0); ctx.lineTo(ax, ly1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '700 11px ui-monospace, monospace';
      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'center';
      ctx.fillText('DEF', lx, ly0 - 6);
      ctx.fillStyle = '#ff2d55';
      ctx.fillText('ATA', ax, ly1 + 14);
      ctx.restore();
    }

    this.drawVignette(ctx);
    // Marco de monitor
    ctx.strokeStyle = 'rgba(53, 196, 176, 0.28)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, this.w - 4, this.h - 4);
    ctx.restore();
  }
}

export default Renderer;
