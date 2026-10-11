/*
 * PaMenAgency — anuncio vertical 1080x1920.
 * Motor de escena determinista: renderFrame(t) dibuja el fotograma exacto del segundo t.
 * La línea de tiempo (window.TL) la inyecta render.mjs desde timeline.json.
 */
'use strict';

const W = 1080;
const H = 1920;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TL = window.TL;
const C = TL.cues;

const COL = {
  bg: '#050505',
  white: '#F4F4F2',
  cool: [168, 188, 218],
};

/* ---------- utilidades ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const eOutQuint = (x) => 1 - Math.pow(1 - x, 5);
const eOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eInOutSine = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const eInCubic = (x) => x * x * x;
const win = (t, a, b, fi, fo) => Math.min(eInOutSine(prog(t, a, a + fi)), 1 - eInOutSine(prog(t, b - fo, b)));

function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function reset(c = ctx) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = 'source-over';
  c.filter = 'none';
  c.shadowBlur = 0;
  c.shadowColor = 'transparent';
  c.letterSpacing = '0px';
}

function rrect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/* Degradado dorado metálico, vertical sobre la altura del texto. */
function goldGrad(c, yTop, yBot, x0 = 0, x1 = 0) {
  const g = x1 ? c.createLinearGradient(x0, yTop, x1, yBot) : c.createLinearGradient(0, yTop, 0, yBot);
  g.addColorStop(0.0, '#8A6F1E');
  g.addColorStop(0.34, '#D4AF37');
  g.addColorStop(0.52, '#F0D680');
  g.addColorStop(0.7, '#D4AF37');
  g.addColorStop(1.0, '#8A6F1E');
  return g;
}

/* ---------- tipografía ---------- */
// Tipografía de marca (la de pamenagency.com): Space Grotesk para titulares, Inter para texto.
const fontFor = (o, size, weight) => `${weight} ${size}px "${o.f || 'Space Grotesk'}"`;
const lsFor = (o, size) => `${(-0.02 * size).toFixed(2)}px`;

function layout(spec) {
  if (spec._L) return spec._L;
  ctx.save();
  reset();
  const size = spec.size;
  const weight = spec.weight || 600;
  const lines = spec.lines.map((line) => {
    const words = [];
    line.forEach((seg) => {
      const s = typeof seg === 'string' ? { t: seg } : seg;
      s.t.split(' ')
        .filter(Boolean)
        .forEach((w) => words.push({ w, f: spec.font, c: s.c || spec.color || 'white' }));
    });
    words.forEach((o) => {
      ctx.font = fontFor(o, size, weight);
      ctx.letterSpacing = spec.ls != null ? `${spec.ls}px` : lsFor(o, size);
      o.width = ctx.measureText(o.w).width;
    });
    const space = size * 0.27;
    const total = words.reduce((a, o) => a + o.width, 0) + space * (words.length - 1);
    return { words, total, space };
  });
  const maxW = Math.max(...lines.map((l) => l.total));
  const scale = Math.min(1, (spec.maxW || 880) / maxW);
  ctx.restore();
  spec._L = { lines, scale };
  return spec._L;
}

/*
 * Bloque de texto con revelado por máscara palabra a palabra y salida suave.
 * spec: { lines, cx, cy, size, at, out, weight, stagger, dur, alpha, shadow }
 */
function drawBlock(spec, t, dy = 0) {
  if (t < spec.at - 0.02 || t > spec.out + 0.75) return;
  const L = layout(spec);
  const s = spec.size;
  const lh = spec.lh || s * 1.16;
  const n = L.lines.length;
  const weight = spec.weight || 600;
  const exitP = eInOutCubic(prog(t, spec.out, spec.out + 0.65));
  const cy = spec.cy + dy;
  const top = cy - ((n - 1) * lh) / 2;
  let wi = 0;
  ctx.save();
  ctx.translate(spec.cx, cy);
  ctx.scale(L.scale, L.scale);
  ctx.translate(-spec.cx, -cy);
  ctx.textBaseline = 'alphabetic';
  if (spec.shadow !== false) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 28;
  }
  L.lines.forEach((line, i) => {
    const by = top + i * lh + s * 0.36;
    let x = spec.cx - line.total / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-200, by - s * 1.3, W + 400, s * 1.78);
    ctx.clip();
    line.words.forEach((o) => {
      const d = spec.at + wi * (spec.stagger ?? 0.055) + i * (spec.lineDelay ?? 0.08);
      wi++;
      const p = eOutQuint(prog(t, d, d + (spec.dur || 1.15)));
      const a = clamp(p * 1.5) * (1 - exitP) * (spec.alpha ?? 1);
      if (a > 0.002) {
        const yOff = (1 - p) * s * 1.0 - exitP * 26;
        ctx.font = fontFor(o, s, weight);
        ctx.letterSpacing = spec.ls != null ? `${spec.ls}px` : lsFor(o, s);
        ctx.globalAlpha = a;
        ctx.filter = exitP > 0.001 ? `blur(${(exitP * 9).toFixed(2)}px)` : 'none';
        if (o.c === 'gold') ctx.fillStyle = goldGrad(ctx, by + yOff - s * 0.95, by + yOff + s * 0.2);
        else if (o.c === 'dim') ctx.fillStyle = 'rgba(244,244,242,0.78)';
        else ctx.fillStyle = COL.white;
        ctx.fillText(o.w, x, by + yOff);
      }
      x += o.width + line.space;
    });
    ctx.restore();
  });
  ctx.restore();
}

/* ---------- recursos ---------- */
const TASKS = [
  'Copiar datos del formulario al Excel',
  'Responder: ¿qué horario tenéis?',
  'Reenviar la factura al cliente',
  'Actualizar la hoja de pedidos',
  'Confirmar la cita por teléfono',
  'Pasar a limpio las notas de la reunión',
  'Buscar el presupuesto de la semana pasada',
  'Responder: ¿tenéis disponibilidad?',
  'Revisar el correo de proveedores',
  'Copiar contactos a la agenda',
  'Enviar recordatorio de pago',
  'Preparar el informe semanal a mano',
];

let LOGO = null; // logotipo original opcional: assets/logo/logo.png

/* Grano de película: texturas precalculadas y deterministas. */
const GRAIN = [];
function buildGrain() {
  const r = rng(7);
  for (let k = 0; k < 8; k++) {
    const g = document.createElement('canvas');
    g.width = 540;
    g.height = 960;
    const gc = g.getContext('2d');
    const img = gc.createImageData(540, 960);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() + r() + r() - 1.5) * 120;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    gc.putImageData(img, 0, 0);
    GRAIN.push(g);
  }
}

const screenCv = document.createElement('canvas');
screenCv.width = 900;
screenCv.height = 640;
const sctx = screenCv.getContext('2d');

const wmCv = document.createElement('canvas');
wmCv.width = W;
wmCv.height = 400;
const wctx = wmCv.getContext('2d');

/* ---------- escena 1: el problema ---------- */
function drawScreenUI(t) {
  const c = sctx;
  reset(c);
  const g = c.createLinearGradient(0, 0, 0, 640);
  g.addColorStop(0, '#10141b');
  g.addColorStop(1, '#090b0f');
  c.fillStyle = g;
  c.fillRect(0, 0, 900, 640);
  // lista que no se acaba
  const rowH = 76;
  const scroll = t * 30 + Math.pow(Math.max(0, t - 1.5), 2) * 9;
  c.save();
  c.beginPath();
  c.rect(0, 92, 900, 548);
  c.clip();
  for (let k = -1; k < 10; k++) {
    const idx = Math.floor(scroll / rowH) + k;
    const y = 96 + idx * rowH - scroll;
    const label = TASKS[((idx % TASKS.length) + TASKS.length) % TASKS.length];
    c.strokeStyle = 'rgba(255,255,255,0.32)';
    c.lineWidth = 2;
    rrect(c, 44, y + 25, 26, 26, 6);
    c.stroke();
    c.fillStyle = 'rgba(236,240,246,0.74)';
    c.font = '500 27px Inter';
    c.fillText(label, 94, y + 47);
    c.fillStyle = 'rgba(255,255,255,0.055)';
    c.fillRect(44, y + rowH - 1, 812, 1);
  }
  c.restore();
  // cabecera
  c.fillStyle = 'rgba(236,240,246,0.86)';
  c.font = '600 30px Inter';
  c.fillText('Pendientes', 44, 58);
  c.fillStyle = 'rgba(255,255,255,0.08)';
  c.fillRect(44, 88, 812, 1);
  // desvanecido inferior
  const fg = c.createLinearGradient(0, 470, 0, 640);
  fg.addColorStop(0, 'rgba(9,11,15,0)');
  fg.addColorStop(1, 'rgba(9,11,15,1)');
  c.fillStyle = fg;
  c.fillRect(0, 470, 900, 170);
}

function silhouettePath(c) {
  // persona de espaldas, en primer término (plano por encima del hombro)
  c.save();
  c.translate(236, 1338);
  c.scale(1.28, 1.28);
  c.beginPath();
  c.moveTo(-460, 640);
  c.bezierCurveTo(-430, 480, -270, 410, -158, 372);
  c.bezierCurveTo(-116, 352, -100, 312, -103, 262);
  c.bezierCurveTo(-138, 214, -152, 120, -146, 30);
  c.bezierCurveTo(-140, -96, -74, -176, 6, -178);
  c.bezierCurveTo(92, -180, 156, -112, 160, -6);
  c.bezierCurveTo(163, 84, 146, 176, 106, 238);
  c.bezierCurveTo(100, 292, 112, 334, 160, 360);
  c.bezierCurveTo(272, 400, 432, 470, 486, 640);
  c.closePath();
  c.restore();
}

function scene1(t) {
  const [a, b] = TL.scenes.s1_problema;
  if (t > b + 0.9) return;
  const on = eInOutSine(prog(t, 0.35, 1.6)); // la pantalla se enciende
  const rack = eInOutCubic(prog(t, 1.15, 2.1)); // foco: de la pantalla al mensaje
  const exit = eInOutCubic(prog(t, b - 0.45, b + 0.75));
  const vis = on * (1 - exit);
  if (vis <= 0.001) return;
  drawScreenUI(t);

  const push = lerp(1, 1.075, eInOutSine(prog(t, a, b + 0.8)));
  reset();
  ctx.save();
  ctx.translate(600, 1230);
  ctx.scale(push, push);
  ctx.translate(-600, -1230);

  // derrame de luz fría del monitor
  ctx.globalAlpha = vis;
  let g = ctx.createRadialGradient(600, 1230, 60, 600, 1230, 980);
  g.addColorStop(0, `rgba(${COL.cool.join(',')},0.20)`);
  g.addColorStop(0.45, `rgba(${COL.cool.join(',')},0.06)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // reflejo sobre la mesa
  ctx.save();
  ctx.translate(600, 1640);
  ctx.scale(1, 0.16);
  g = ctx.createRadialGradient(0, 0, 10, 0, 0, 560);
  g.addColorStop(0, `rgba(${COL.cool.join(',')},0.16)`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-700, -700, 1400, 1400);
  ctx.restore();

  // monitor
  ctx.save();
  ctx.translate(600, 1230);
  ctx.rotate((-2.2 * Math.PI) / 180);
  ctx.fillStyle = '#0a0a0b';
  rrect(ctx, -472, -342, 944, 684, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const blur = lerp(0, 5.5, rack) + exit * 10;
  ctx.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
  ctx.globalAlpha = vis * lerp(1, 0.5, rack);
  ctx.drawImage(screenCv, -450, -320);
  ctx.filter = 'none';
  // brillo especular muy sutil sobre el cristal
  g = ctx.createLinearGradient(-450, -320, 300, 320);
  g.addColorStop(0, 'rgba(255,255,255,0.045)');
  g.addColorStop(0.4, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.globalAlpha = vis;
  ctx.fillRect(-450, -320, 900, 640);
  ctx.restore();

  // persona en primer término, a contraluz y desenfocada
  ctx.globalAlpha = vis;
  ctx.filter = 'blur(13px)';
  silhouettePath(ctx);
  ctx.fillStyle = '#010102';
  ctx.fill();
  ctx.filter = 'blur(5px)';
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, 1640);
  ctx.clip();
  silhouettePath(ctx);
  const rim = ctx.createRadialGradient(330, 1110, 20, 330, 1110, 380);
  rim.addColorStop(0, `rgba(${COL.cool.join(',')},0.42)`);
  rim.addColorStop(1, `rgba(${COL.cool.join(',')},0.0)`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  ctx.filter = 'none';
  ctx.restore();

  // sombra superior para que el texto respire
  reset();
  g = ctx.createLinearGradient(0, 200, 0, 1100);
  g.addColorStop(0, 'rgba(5,5,5,0.85)');
  g.addColorStop(1, 'rgba(5,5,5,0)');
  ctx.globalAlpha = rack * (1 - exit);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 1100);
  reset();

  drawBlock(S1A, t);
  drawBlock(S1B, t);
}

const S1A = {
  lines: [['Tu empresa no necesita'], ['trabajar más horas.']],
  cx: 540, cy: 520, size: 74, at: C.s1a, out: TL.scenes.s1_problema[1] - 0.35,
};
const S1B = {
  lines: [['Necesita trabajar', { t: 'mejor.', c: 'gold' }]],
  cx: 540, cy: 760, size: 74, at: C.s1b, out: TL.scenes.s1_problema[1] - 0.25,
};

/* ---------- escena 2: la oportunidad ---------- */
const CARD_N = 8;
const CARDS = (() => {
  const r = rng(42);
  const picks = [0, 2, 4, 1, 5, 3, 10, 7];
  return picks.map((ti, i) => ({
    label: TASKS[ti],
    cx: lerp(250, 830, r()),
    cy: lerp(820, 1580, (i + r() * 0.9) / CARD_N),
    rot: (r() - 0.5) * 0.52,
    depth: r(),
    ph: r() * 6.28,
  }));
})();

function drawCard(o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rot);
  ctx.scale(o.sc, o.sc);
  ctx.globalAlpha = o.alpha;
  ctx.filter = o.blur > 0.05 ? `blur(${o.blur.toFixed(2)}px)` : 'none';
  const w = o.w;
  const h = o.h;
  rrect(ctx, -w / 2, -h / 2, w, h, Math.min(18, h / 2));
  ctx.fillStyle = `rgba(22,22,24,${0.92 * o.fill})`;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = o.line;
  ctx.stroke();
  if (o.textA > 0.01 && h > 30) {
    const bx = -w / 2 + 44;
    // casilla
    ctx.globalAlpha = o.alpha * o.textA;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    ctx.arc(bx, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    if (o.check > 0) {
      ctx.fillStyle = goldGrad(ctx, -14, 14);
      ctx.globalAlpha = o.alpha * o.textA * clamp(o.check * 2);
      ctx.beginPath();
      ctx.arc(bx, 0, 14 * eOutCubic(clamp(o.check * 1.6)), 0, Math.PI * 2);
      ctx.fill();
      // trazo de verificación
      const cp = clamp((o.check - 0.35) / 0.65);
      if (cp > 0) {
        ctx.strokeStyle = '#0b0b0b';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.setLineDash([22 * cp, 40]);
        ctx.moveTo(bx - 6, 0);
        ctx.lineTo(bx - 1.5, 5);
        ctx.lineTo(bx + 7, -5);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.globalAlpha = o.alpha * o.textA * lerp(1, 0.42, o.done);
    ctx.fillStyle = COL.white;
    ctx.font = '500 32px Inter';
    ctx.letterSpacing = '-0.2px';
    ctx.fillText(o.label, bx + 32, 10);
  }
  ctx.restore();
}

function scene2(t) {
  const [a, b] = TL.scenes.s2_oportunidad;
  if (t < a - 0.6 || t > b + 1.2) return;
  reset();
  ctx.font = '500 32px Inter';
  const ORDER_Y0 = 800;
  const GAP = 106;
  const LINE_Y = 1170;
  const tCollapse0 = b - 1.15;
  const tCollapse1 = b - 0.35;
  const collapse = eInOutCubic(prog(t, tCollapse0, tCollapse1));

  if (t < tCollapse1 + 0.02) {
    CARDS.forEach((c, i) => {
      const appear = eOutCubic(prog(t, a - 0.5 + c.depth * 0.5, a + 0.6 + c.depth * 0.5));
      const ord = eInOutCubic(prog(t, a + 1.75 + i * 0.075, a + 3.15 + i * 0.075));
      const check = prog(t, a + 3.75 + i * 0.12, a + 4.2 + i * 0.12);
      const done = eInOutSine(prog(t, a + 3.95 + i * 0.12, a + 4.5 + i * 0.12));
      const drift = 1 - ord;
      const natW = ctx.measureText(c.label).width + 140;
      const chaos = {
        x: c.cx + Math.sin(t * 0.55 + c.ph) * 16,
        y: c.cy + Math.cos(t * 0.47 + c.ph * 1.3) * 12 + (1 - appear) * 60,
        rot: c.rot + Math.sin(t * 0.4 + c.ph) * 0.035,
        sc: lerp(0.74, 1.04, c.depth),
        blur: (1 - c.depth) * 5.5,
      };
      const order = { x: 540, y: ORDER_Y0 + i * GAP, rot: 0, sc: 1, blur: 0 };
      let x = lerp(chaos.x, order.x, ord);
      let y = lerp(chaos.y, order.y, ord);
      let w = lerp(natW, 900, ord);
      let h = 86;
      // colapso hacia una sola línea dorada
      const ci = eInOutCubic(prog(t, tCollapse0 + i * 0.03, tCollapse1));
      y = lerp(y, LINE_Y, ci);
      h = lerp(h, 2, ci);
      const gold = Math.round(lerp(255, 214, ci));
      drawCard({
        x, y, w, h,
        rot: lerp(chaos.rot, 0, ord),
        sc: lerp(chaos.sc, 1, ord),
        blur: lerp(chaos.blur, 0, ord) + (1 - appear) * 8,
        alpha: appear * lerp(lerp(0.55, 1, c.depth), 1, ord),
        fill: 1 - ci,
        line: ci > 0.02 ? `rgba(${gold},${Math.round(lerp(255, 184, ci))},${Math.round(lerp(255, 119, ci))},${lerp(0.14, 0.9, ci)})` : 'rgba(255,255,255,0.13)',
        textA: 1 - eInOutSine(prog(t, tCollapse0 - 0.15, tCollapse0 + 0.25)),
        check,
        done,
        label: c.label,
      });
      void drift;
    });
  }

  // la línea dorada se extiende y se abre como un telón de luz
  const lineIn = prog(t, tCollapse1 - 0.25, tCollapse1);
  if (lineIn > 0) {
    const ext = eInOutCubic(prog(t, tCollapse1, C.wipe + 0.05));
    const open = eOutCubic(prog(t, C.wipe, C.wipe + 1.0));
    const fade = 1 - eInOutSine(prog(t, C.wipe + 0.35, C.wipe + 1.1));
    const half = lerp(450, 620, ext);
    reset();
    // halo cálido entre las dos líneas
    if (open > 0) {
      const top = LINE_Y - open * 1300;
      const bot = LINE_Y + open * 1300;
      const g = ctx.createLinearGradient(0, top, 0, bot);
      g.addColorStop(0, 'rgba(212,175,55,0)');
      g.addColorStop(0.5, `rgba(212,175,55,${0.16 * fade})`);
      g.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, top, W, bot - top);
    }
    const ys = open > 0 ? [LINE_Y - open * 1300, LINE_Y + open * 1300] : [LINE_Y];
    ys.forEach((y) => {
      const g = ctx.createLinearGradient(540 - half, 0, 540 + half, 0);
      g.addColorStop(0, 'rgba(212,175,55,0)');
      g.addColorStop(0.5, 'rgba(240,214,128,1)');
      g.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.globalAlpha = fade * clamp(lineIn * 2);
      ctx.fillStyle = g;
      ctx.shadowColor = 'rgba(212,175,55,0.9)';
      ctx.shadowBlur = lerp(10, 34, ext);
      ctx.fillRect(540 - half, y - 1.5, half * 2, 3);
    });
    reset();
  }

  drawBlock(S2A, t);
  drawBlock(S2B, t);
}

const S2A = {
  lines: [['Menos tareas'], ['repetitivas.']],
  cx: 540, cy: 470, size: 80, at: C.s2a, out: C.s2b - 0.6,
};
const S2B = {
  lines: [['Más tiempo para lo que'], ['realmente', { t: 'importa.', c: 'gold' }]],
  cx: 540, cy: 470, size: 74, at: C.s2b, out: TL.scenes.s2_oportunidad[1] - 0.75,
};

/* ---------- escena 3: la solución ---------- */
function camY(t) {
  return [C.c1, C.c2, C.c3].reduce((acc, ck) => acc + 1000 * eInOutCubic(prog(t, ck - 0.5, ck + 0.4)), 0);
}

function strokeDraw(path, len, p) {
  ctx.setLineDash([len * p, len + 10]);
  ctx.stroke(path);
  ctx.setLineDash([]);
}

function goldStroke(width = 3) {
  ctx.strokeStyle = goldGrad(ctx, -130, 130, -130, 130);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(212,175,55,0.55)';
  ctx.shadowBlur = 14;
}

function pictogram(k, x, y, p, t) {
  const A = ctx.globalAlpha; // opacidad heredada (salida de la escena)
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.3, 1.3);
  goldStroke(2.6);
  if (k === 0) {
    // automatización: un ciclo que se cierra solo
    const r = 92;
    const a0 = -Math.PI / 2 + 0.35;
    const a1 = a0 + Math.PI * 2 - 0.7;
    const path = new Path2D();
    path.arc(0, 0, r, a0, a1);
    strokeDraw(path, r * (a1 - a0), p);
    if (p > 0.92) {
      const ap = eOutCubic(prog(p, 0.92, 1));
      const ex = Math.cos(a1) * r;
      const ey = Math.sin(a1) * r;
      const head = new Path2D();
      head.moveTo(ex - 16 * ap, ey + 4 - 12 * ap);
      head.lineTo(ex, ey);
      head.lineTo(ex - 18 * ap, ey + 14 * ap);
      ctx.stroke(head);
    }
    // pulso que recorre el ciclo, constante y sin esfuerzo
    if (p > 0.6) {
      const ang = a0 + ((t * 1.6) % 1) * (a1 - a0);
      ctx.globalAlpha = A * clamp((p - 0.6) * 3);
      ctx.fillStyle = '#F0D680';
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * r, Math.sin(ang) * r, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (k === 1) {
    // soluciones digitales: web + app, trazo de línea
    const path = new Path2D();
    path.moveTo(-150, -70);
    path.lineTo(-150, 70);
    path.lineTo(80, 70);
    path.moveTo(-150, -70);
    path.lineTo(110, -70);
    path.lineTo(110, -10);
    const bar = new Path2D();
    bar.moveTo(-150, -38);
    bar.lineTo(110, -38);
    const lines = new Path2D();
    lines.moveTo(-122, -6);
    lines.lineTo(-10, -6);
    lines.moveTo(-122, 22);
    lines.lineTo(-50, 22);
    const phone = new Path2D();
    phone.roundRect(48, -24, 92, 156, 16);
    const pl = new Path2D();
    pl.moveTo(80, 112);
    pl.lineTo(108, 112);
    strokeDraw(path, 720, eInOutCubic(prog(p, 0, 0.6)));
    ctx.lineWidth = 2;
    strokeDraw(bar, 260, eInOutCubic(prog(p, 0.25, 0.65)));
    strokeDraw(lines, 190, eInOutCubic(prog(p, 0.45, 0.85)));
    ctx.lineWidth = 3;
    strokeDraw(phone, 480, eInOutCubic(prog(p, 0.3, 0.95)));
    strokeDraw(pl, 28, eInOutCubic(prog(p, 0.85, 1)));
    ctx.fillStyle = '#D4AF37';
    ctx.globalAlpha = A * clamp((p - 0.3) * 4);
    [-136, -122, -108].forEach((dx) => {
      ctx.beginPath();
      ctx.arc(dx, -54, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // con criterio: de varias opciones, se elige un camino
    const ends = [[-120, -86], [0, -110], [120, -86]];
    const pick = 2;
    ends.forEach(([ex, ey], j) => {
      const path = new Path2D();
      path.moveTo(0, 96);
      path.bezierCurveTo(0, 20, ex * 0.95, 10, ex, ey);
      const isPick = j === pick;
      const glow = eInOutSine(prog(p, 0.7, 1));
      ctx.save();
      if (!isPick) {
        ctx.strokeStyle = `rgba(244,244,242,${lerp(0.55, 0.22, glow)})`;
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
      }
      strokeDraw(path, 230, eInOutCubic(prog(p, 0.05 + j * 0.06, 0.65 + j * 0.06)));
      const dp = prog(p, 0.62 + j * 0.06, 0.8 + j * 0.06);
      if (dp > 0) {
        ctx.globalAlpha = A * dp;
        ctx.fillStyle = isPick ? '#F0D680' : `rgba(244,244,242,${lerp(0.6, 0.25, glow)})`;
        ctx.beginPath();
        ctx.arc(ex, ey, isPick ? lerp(6, 10, glow) : 5, 0, Math.PI * 2);
        ctx.fill();
        if (isPick && glow > 0) {
          ctx.globalAlpha = A * (glow * 0.5);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ex, ey, 22 + glow * 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    });
    ctx.fillStyle = '#F0D680';
    ctx.globalAlpha = A * clamp(p * 5);
    ctx.beginPath();
    ctx.arc(0, 96, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

const CONCEPTS = [
  { lines: [['Automatización']], size: 84 },
  { lines: [['Soluciones'], [{ t: 'digitales', c: 'gold' }]], size: 84 },
  { lines: [['Inteligencia'], ['artificial'], [{ t: 'con criterio', c: 'gold' }]], size: 84 },
];

const S3H = {
  lines: [['Diseñamos soluciones'], ['de IA para'], [{ t: 'problemas reales.', c: 'gold' }]],
  cx: 540, cy: 900, size: 82, at: C.s3h, out: C.c1 - 0.55,
};

/* Marca pequeña recurrente (escenas 3-4): el logotipo original, o la marca tipográfica si falta. */
function smallWordmark(t, alpha) {
  if (alpha <= 0.002) return;
  reset();
  ctx.globalAlpha = alpha;
  if (LOGO) {
    const sz = 116;
    ctx.drawImage(LOGO, 540 - sz / 2, 318 - sz / 2, sz, sz);
  } else {
    ctx.font = '700 30px "Space Grotesk"';
    ctx.letterSpacing = '9px';
    ctx.textAlign = 'center';
    ctx.fillStyle = goldGrad(ctx, 300, 334);
    ctx.fillText('PAMENAGENCY', 545, 330);
    ctx.textAlign = 'left';
  }
  reset();
}

function scene3(t) {
  const [a, b] = TL.scenes.s3_solucion;
  if (t < a - 0.2 || t > b + 1.0) return;
  const cy = camY(t);
  reset();
  // atmósfera cálida mínima
  const amb = win(t, a, b + 0.8, 1.0, 1.0);
  let g = ctx.createRadialGradient(540, 980, 40, 540, 980, 900);
  g.addColorStop(0, `rgba(212,175,55,${0.075 * amb})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // órbitas: sistemas conectados (sólo durante el titular)
  const orb = win(t, a + 0.3, C.c1 + 0.2, 1.2, 0.8);
  if (orb > 0.002) {
    ctx.save();
    ctx.translate(540, 900 - cy * 0.5);
    [0.32, -0.32].forEach((rot, j) => {
      ctx.save();
      ctx.rotate(rot + t * 0.03 * (j ? -1 : 1));
      ctx.scale(1, 0.34);
      ctx.beginPath();
      ctx.arc(0, 0, 470, 0, Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = `rgba(212,175,55,${0.16 * orb})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // nodo que viaja por la órbita
      const ang = t * 0.55 + j * 2.4;
      const px = Math.cos(ang) * 470;
      const py = Math.sin(ang) * 470 * 0.34;
      const rr = rot + t * 0.03 * (j ? -1 : 1);
      ctx.fillStyle = `rgba(240,214,128,${0.7 * orb})`;
      ctx.beginPath();
      ctx.arc(px * Math.cos(rr) - py * Math.sin(rr), px * Math.sin(rr) + py * Math.cos(rr), 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // hilo conductor vertical que une los conceptos
  const threadA = win(t, C.c1 - 0.6, b + 0.6, 0.6, 0.9);
  if (threadA > 0.002) {
    reset();
    const base = 820 + 1000 - cy;
    for (let k = 0; k < 3; k++) {
      const y0 = base + k * 1000 + 470;
      const y1 = base + (k + 1) * 1000 - 150;
      const lg = ctx.createLinearGradient(0, y0, 0, y1);
      lg.addColorStop(0, 'rgba(212,175,55,0)');
      lg.addColorStop(0.5, `rgba(212,175,55,${0.42 * threadA})`);
      lg.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(539, y0, 2, y1 - y0);
    }
    // señal que viaja por el hilo durante cada desplazamiento
    [C.c2, C.c3, b + 0.2].forEach((ck, k) => {
      const sp = prog(t, ck - 0.55, ck + 0.35);
      if (sp > 0 && sp < 1) {
        const y = base + k * 1000 + lerp(470, 850, eInOutCubic(sp));
        ctx.globalAlpha = Math.sin(sp * Math.PI) * threadA;
        ctx.fillStyle = '#F0D680';
        ctx.shadowColor = 'rgba(240,214,128,0.9)';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(540, y, 5, 0, Math.PI * 2);
        ctx.fill();
        reset();
      }
    });
  }

  // titular
  drawBlock(S3H, t, -cy * 0.55);

  // conceptos
  const starts = [C.c1, C.c2, C.c3];
  CONCEPTS.forEach((cpt, k) => {
    const ck = starts[k];
    const endK = k < 2 ? starts[k + 1] - 0.35 : b - 0.45;
    if (t < ck - 0.6 || t > endK + 1.0) return;
    const y = 820 + k * 1000 + 1000 - cy;
    const vis = 1 - eInOutCubic(prog(t, endK, endK + 0.6));
    const p = eInOutCubic(prog(t, ck - 0.15, ck + 1.0));
    reset();
    ctx.globalAlpha = vis;
    pictogram(k, 540, y, p, t);
    reset();
    if (!cpt.spec) {
      cpt.spec = { lines: cpt.lines, cx: 540, cy: 0, size: cpt.size, at: ck + 0.05, out: endK, lh: cpt.size * 1.08 };
    }
    const n = cpt.lines.length;
    drawBlock(cpt.spec, t, y + 270 + ((n - 1) * cpt.size * 1.08) / 2);
  });

  smallWordmark(t, win(t, a + 0.45, TL.scenes.s4_posicionamiento[1] - 0.2, 0.9, 0.6));
}

/* ---------- escena 4: posicionamiento ---------- */
function horizon(t, alpha, boost, cyy, R) {
  if (alpha <= 0.002) return;
  reset();
  ctx.globalAlpha = alpha;
  // atmósfera cálida sobre el borde
  let g = ctx.createRadialGradient(540, cyy - R, 0, 540, cyy - R, 760);
  g.addColorStop(0, `rgba(212,175,55,${0.2 * boost})`);
  g.addColorStop(0.5, `rgba(212,175,55,${0.05 * boost})`);
  g.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // disco negro que tapa la luz por debajo del horizonte
  g = ctx.createRadialGradient(540, cyy - R, 10, 540, cyy - R, 520);
  g.addColorStop(0, '#0d0b08');
  g.addColorStop(1, '#030303');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(540, cyy, R, 0, Math.PI * 2);
  ctx.fill();
  // borde iluminado: tres pasadas (halo, medio, núcleo)
  const pass = (lw, a, blur, color) => {
    const sg = ctx.createLinearGradient(0, 0, W, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0)');
    sg.addColorStop(0.18, `rgba(${color},${a * 0.25})`);
    sg.addColorStop(0.5, `rgba(${color},${a})`);
    sg.addColorStop(0.82, `rgba(${color},${a * 0.25})`);
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.strokeStyle = sg;
    ctx.lineWidth = lw;
    ctx.filter = blur ? `blur(${blur}px)` : 'none';
    ctx.beginPath();
    ctx.arc(540, cyy, R, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.restore();
  };
  pass(90, 0.14 * boost, 40, '212,175,55');
  pass(18, 0.4 * boost, 10, '226,196,96');
  pass(2.6, 0.95, 0, '246,226,160');
  reset();
}

const S4A = {
  lines: [['La tecnología es'], ['una herramienta.']],
  cx: 540, cy: 800, size: 82, at: C.s4a, out: C.s4b - 0.55,
};
const S4B = {
  lines: [['Saber cómo utilizarla'], [{ t: 'es la ventaja.', c: 'gold' }]],
  cx: 540, cy: 800, size: 82, at: C.s4b, out: TL.scenes.s4_posicionamiento[1] - 0.5,
};

function scene4(t) {
  const [a, b] = TL.scenes.s4_posicionamiento;
  if (t < a - 0.8 || t > b + 1.2) return;
  const rise = eOutCubic(prog(t, a - 0.6, a + 1.6));
  const sink = eInOutCubic(prog(t, b - 0.4, b + 0.9));
  const drift = eInOutSine(prog(t, a, b));
  const R = lerp(1250, 1290, drift);
  const cyy = lerp(2980, 2700, rise) - drift * 40 + sink * 260;
  const boost = lerp(0.65, 1, eInOutSine(prog(t, C.s4b - 0.2, C.s4b + 0.9)));
  horizon(t, rise * (1 - sink), boost, cyy, R);
  drawBlock(S4A, t, -drift * 20);
  drawBlock(S4B, t, -drift * 20);
}

/* ---------- escena 5: cierre ---------- */
// Marca tipográfica como en pamenagency.com: «PAMEN» en blanco, «AGENCY» en dorado.
const WM = { text: 'PAMEN AGENCY', split: 6, size: 74, ls: 6, y: 878 };
const LOGO_Y = 612;
const LOGO_SIZE = 300;

function wordmark(t, cx, y, mode) {
  // mode: 'anim' (entrada) o 'static'
  const c = wctx;
  reset(c);
  c.clearRect(0, 0, W, 400);
  c.font = `700 ${WM.size}px "Space Grotesk"`;
  c.letterSpacing = '0px';
  const chars = [...WM.text];
  const widths = chars.map((ch) => (ch === ' ' ? WM.size * 0.32 : c.measureText(ch).width));
  const total = widths.reduce((s, w) => s + w, 0) + WM.ls * (chars.length - 1);
  const by = 200 + WM.size * 0.36;
  let x = cx - total / 2;
  const mid = (chars.length - 1) / 2;
  const t0 = C.logo + 0.55;
  chars.forEach((ch, i) => {
    let p = 1;
    if (mode === 'anim') {
      const d = t0 + Math.abs(i - mid) * 0.06;
      p = eOutExpo(prog(t, d, d + 1.3));
    }
    const cxch = x + widths[i] / 2;
    const off = (cxch - cx) * (1 - p) * 0.4;
    c.globalAlpha = clamp(p * 1.3);
    c.filter = p < 0.999 ? `blur(${((1 - p) * 14).toFixed(2)}px)` : 'none';
    c.fillStyle = i >= WM.split ? goldGrad(c, by - WM.size * 0.78, by + 4) : COL.white;
    if (ch !== ' ') c.fillText(ch, x + off, by);
    x += widths[i] + WM.ls;
  });
  reset(c);
  reset();
  ctx.drawImage(wmCv, 0, y - 200);
  return total;
}

/* Entrada propia del logotipo: apertura circular desde el centro + enfoque + un único reflejo. */
const logoCv = document.createElement('canvas');
logoCv.width = logoCv.height = 512;
const lctx = logoCv.getContext('2d');
function drawLogo(t, mode, cx, cy, size) {
  if (!LOGO) return;
  const p = mode === 'anim' ? prog(t, C.logo - 0.15, C.logo + 1.25) : 1;
  if (p <= 0) return;
  const c = lctx;
  reset(c);
  c.clearRect(0, 0, 512, 512);
  const e = eOutCubic(p);
  c.save();
  c.beginPath();
  c.arc(256, 256, 262 * e, 0, Math.PI * 2);
  c.clip();
  c.filter = p < 0.999 ? `blur(${((1 - e) * 10).toFixed(2)}px)` : 'none';
  c.drawImage(LOGO, 0, 0, 512, 512);
  c.restore();
  const sp = mode === 'anim' ? prog(t, C.logo + 1.2, C.logo + 2.2) : 0;
  if (sp > 0 && sp < 1) {
    const sx = lerp(-160, 672, eInOutSine(sp));
    const g = c.createLinearGradient(sx - 110, 60, sx + 110, 450);
    g.addColorStop(0, 'rgba(255,246,214,0)');
    g.addColorStop(0.5, 'rgba(255,246,214,0.32)');
    g.addColorStop(1, 'rgba(255,246,214,0)');
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = g;
    c.fillRect(0, 0, 512, 512);
    reset(c);
  }
  reset();
  const sc = lerp(0.94, 1, eOutCubic(p));
  const sz = size * sc;
  ctx.globalAlpha = clamp(p * 2);
  ctx.drawImage(logoCv, cx - sz / 2, cy - sz / 2, sz, sz);
  reset();
}

const S5TAG = {
  lines: [['Convierte la IA en'], ['una', { t: 'ventaja real.', c: 'gold' }]],
  cx: 540, cy: 1030, size: 60, at: C.tag, out: 99,
};
const S5CTA = {
  lines: [['Descubre lo que podemos'], ['mejorar en tu empresa.']],
  cx: 540, cy: 1232, size: 40, weight: 500, font: 'Inter', color: 'dim', at: C.cta, out: 99, stagger: 0.035,
};

function urlPill(t, at, cy) {
  const p = prog(t, at, at + 1.1);
  if (p <= 0) return;
  reset();
  const w = 440;
  const h = 86;
  const path = new Path2D();
  path.roundRect(540 - w / 2, cy - h / 2, w, h, h / 2);
  ctx.strokeStyle = goldGrad(ctx, cy - h / 2, cy + h / 2);
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([(2 * w + 2 * h) * eInOutCubic(p), 3000]);
  ctx.stroke(path);
  ctx.setLineDash([]);
  const tp = eOutQuint(prog(t, at + 0.25, at + 1.2));
  ctx.globalAlpha = tp;
  ctx.font = '600 40px "Space Grotesk"';
  ctx.letterSpacing = '2px';
  ctx.textAlign = 'center';
  ctx.fillStyle = goldGrad(ctx, cy - 22, cy + 14);
  ctx.fillText('pamenagency.com', 541, cy + 14 + (1 - tp) * 10);
  reset();
  ctx.textAlign = 'left';
}

function endCard(t, mode) {
  reset();
  // resplandor cálido detrás del logotipo
  const glow = mode === 'anim' ? eInOutSine(prog(t, C.logo - 0.2, C.logo + 1.6)) : 1;
  let g = ctx.createRadialGradient(540, LOGO_Y, 20, 540, LOGO_Y, 620);
  g.addColorStop(0, `rgba(212,175,55,${0.1 * glow})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (LOGO) {
    drawLogo(t, mode, 540, LOGO_Y, LOGO_SIZE);
    wordmark(t, 540, WM.y, mode);
  } else {
    wordmark(t, 540, LOGO_Y + 60, mode);
  }

  // filete dorado bajo la marca
  const rp = mode === 'anim' ? eInOutCubic(prog(t, C.logo + 1.3, C.logo + 2.3)) : 1;
  if (rp > 0) {
    const half = 170 * rp;
    const ry = (LOGO ? WM.y : LOGO_Y + 60) + 62;
    g = ctx.createLinearGradient(540 - half, 0, 540 + half, 0);
    g.addColorStop(0, 'rgba(212,175,55,0)');
    g.addColorStop(0.5, 'rgba(212,175,55,0.9)');
    g.addColorStop(1, 'rgba(212,175,55,0)');
    ctx.fillStyle = g;
    ctx.fillRect(540 - half, ry, half * 2, 1.5);
  }
}

function scene5(t) {
  const [a, b] = TL.scenes.s5_cierre;
  if (t < a - 0.3) return;
  endCard(t, 'anim');
  drawBlock(S5TAG, t);
  drawBlock(S5CTA, t);
  urlPill(t, C.url, 1372);
  void b;
}

/* ---------- acabado global ---------- */
function vignette() {
  reset();
  const g = ctx.createRadialGradient(540, 920, 420, 540, 920, 1350);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function grain(t) {
  reset();
  const k = Math.floor(t * 30) % GRAIN.length;
  ctx.globalAlpha = 0.05;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(GRAIN[k], 0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.022;
  ctx.drawImage(GRAIN[(k + 3) % GRAIN.length], 0, 0, W, H);
  ctx.imageSmoothingEnabled = true;
  reset();
}

function fades(t) {
  const end = TL.cues.end;
  const fin = prog(t, end - 0.4, end);
  if (fin > 0) {
    reset();
    ctx.globalAlpha = eInOutSine(fin);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    reset();
  }
}

function renderFrame(t) {
  reset();
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, W, H);
  scene1(t);
  scene2(t);
  scene3(t);
  scene4(t);
  scene5(t);
  vignette();
  grain(t);
  fades(t);
}

/* Portada vertical (fotograma fijo diseñado aparte). */
const COVER = {
  lines: [['La IA no sustituye'], ['tu capacidad.'], [{ t: 'La multiplica', c: 'gold' }], [{ t: 'con criterio.', c: 'gold' }]],
  cx: 540, cy: 860, size: 88, at: -10, out: 99, lh: 102,
};
function renderCover() {
  reset();
  ctx.fillStyle = COL.bg;
  ctx.fillRect(0, 0, W, H);
  horizon(0, 1, 1, 2760, 1270);
  if (LOGO) {
    reset();
    ctx.drawImage(LOGO, 540 - 100, 390 - 100, 200, 200);
  } else {
    smallWordmark(0, 1);
  }
  drawBlock(COVER, 50);
  urlPill(50, 0, 1330);
  vignette();
  grain(0);
}

window.ready = (async () => {
  const fams = ['500 30px "Space Grotesk"', '600 30px "Space Grotesk"', '700 30px "Space Grotesk"',
    '400 30px Inter', '500 30px Inter', '600 30px Inter'];
  await Promise.all(fams.map((f) => document.fonts.load(f, 'Áéíóúñ¿?')));
  await document.fonts.ready;
  const ok = fams.every((f) => document.fonts.check(f));
  buildGrain();
  await new Promise((res) => {
    const img = new Image();
    img.onload = () => { LOGO = img; res(); };
    img.onerror = () => res();
    img.src = '../assets/logo/logo.png';
  });
  window.renderFrame = renderFrame;
  window.renderCover = renderCover;
  return { fontsOk: ok, logo: !!LOGO };
})();
