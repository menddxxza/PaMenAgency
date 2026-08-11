// Construcción del estado de un partido: alineaciones, balón, árbitros,
// estadio, clima y contadores. Sin lógica de simulación.

import { RNG, clamp } from '../core/rng.js';
import { FIELD, WEATHER } from '../core/config.js';
import { FORMATIONS, STYLES } from '../data/formations.js';
import { generateCrew } from '../data/generators.js';

export const SIDE = { HOME: 0, AWAY: 1 };

/** Elige los 11 titulares equilibrando la formación. */
export function pickLineup(rng, team) {
  const shape = FORMATIONS[team.formation] || FORMATIONS['4-4-2'];
  const byRole = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of team.squad) byRole[p.role].push(p);
  for (const k of Object.keys(byRole)) {
    byRole[k].sort((a, b) => rating(b) - rating(a));
  }
  const used = new Set();
  const lineup = shape.map((slot) => {
    const pool = byRole[slot.role].filter((p) => !used.has(p.id));
    const fallback = team.squad.filter((p) => !used.has(p.id));
    const p = pool[0] || fallback[0];
    used.add(p.id);
    return { player: p, slot };
  });
  const bench = team.squad.filter((p) => !used.has(p.id)).slice(0, 9);
  return { lineup, bench };
}

function rating(p) {
  return (p.pace + p.tackling + p.passing + p.shooting + p.technique + p.positioning + p.strength) / 7;
}

/** Entidad viva en el campo. */
function makeEntity(player, slot, sideIdx, teamRef) {
  return {
    id: player.id,
    player,
    side: sideIdx,
    team: teamRef,
    role: player.role,
    slot: { ...slot },
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: sideIdx === SIDE.HOME ? 0 : Math.PI,
    stamina: 100,
    mood: 'calm',        // calm | confident | frustrated | nervous | aggressive | tired
    frustration: 0,      // 0..100
    onPitch: true,
    yellow: 0,
    red: false,
    fouls: 0,
    injured: false,
    injuryLevel: 0,
    downUntil: 0,
    actionCd: 0,
    tackleCd: 0,
    blockCd: 0,
    protestCd: 0,
    hasBall: false,
    minutesPlayed: 0,
  };
}

export function createMatch(opts) {
  const {
    home, away, competition, seed = Date.now(), weather = 'clear',
    importance = 50, rivalry = 0, difficulty, referee, crew, varEnabled,
    neutralVenue = false, stadium, kickoffScore = null, startMinute = 0,
    half: startHalf = null, knockout = false, title = null,
  } = opts;

  const rng = new RNG(seed);
  const teams = [home, away];
  const lineups = teams.map((t) => pickLineup(rng, t));

  const entities = [];
  lineups.forEach((lu, sideIdx) => {
    lu.lineup.forEach(({ player, slot }) => {
      entities.push(makeEntity(player, slot, sideIdx, teams[sideIdx]));
    });
  });

  const w = WEATHER[weather] || WEATHER.clear;
  const venue = stadium || (neutralVenue ? away.stadium : home.stadium);

  const match = {
    id: `m${seed}`,
    seed,
    rng,
    title,
    competition,
    knockout,
    teams,
    lineups,
    entities,
    bench: lineups.map((l) => l.bench),
    stadium: venue,
    weather: w,
    weatherId: w.id,
    importance,
    rivalry,
    neutralVenue,
    difficulty,
    referee,
    crew: crew || generateCrew(rng, competition.level, varEnabled),
    varEnabled: varEnabled ?? !!competition.var,

    ball: {
      pos: { x: FIELD.length / 2, y: FIELD.width / 2 },
      vel: { x: 0, y: 0 },
      height: 0, vz: 0,
      owner: null,
      lastTouch: null,
      lastTouchSide: null,
      prevTouch: null,
      prevTouchSide: null,
      inPlay: false,
    },

    // Reloj. Los escenarios pueden arrancar en un minuto concreto: el motor
    // respeta ese punto de partida en lugar de empezar siempre en el 0.
    startClock: startMinute * 60,
    startHalf: startHalf || (startMinute >= 45 ? 2 : 1),
    half: startHalf || (startMinute >= 45 ? 2 : 1),
    clock: startMinute * 60,
    halfStart: 0,
    halfLength: 45 * 60,
    stoppage: 0,           // segundos acumulados de descuento
    addedTime: 0,          // descuento anunciado en la parte actual
    phase: 'pre',          // pre | kickoff | play | deadball | stopped | decision | var | halftime | fulltime | abandoned
    restart: null,         // {type, side, pos}
    running: false,

    score: kickoffScore ? kickoffScore.slice() : [0, 0],
    shootout: null,

    // Árbitro
    ref: {
      pos: { x: FIELD.length / 2 - 8, y: FIELD.width / 2 - 8 },
      vel: { x: 0, y: 0 },
      facing: 0,
      stamina: 100,
      sprinting: false,
    },
    assistantsPos: [
      { x: FIELD.length * 0.25, y: -1.6 },
      { x: FIELD.length * 0.75, y: FIELD.width + 1.6 },
    ],

    // Registro
    incidents: [],
    decisions: [],
    events: [],           // cronología legible
    pending: null,        // incidente esperando decisión
    advantage: null,      // {incidentId, until, foulerId, victimSide}
    replayBuffer: [],     // frames para el VAR
    lastGoalCheck: null,

    stats: [emptyStats(), emptyStats()],
    subsUsed: [0, 0],
    atmosphere: { support: [50, 50], anger: [0, 0], noise: 40 },

    // Estado del partido para IA
    possession: null,      // side con balón
    momentum: 0,           // -1 away .. +1 home
    tempo: 1,
    flow: { attackSide: null, phase: 'build' },
    lastFoulByPlayer: {},
    refCriterion: { fouls: 0, whistled: 0, letGo: 0, cardsGiven: 0, threshold: 0.5 },
    log: [],
  };

  // Estilos combinados equipo+táctica
  match.tactics = teams.map((t) => {
    const s = STYLES[t.style] || STYLES.balanced;
    return {
      ...s,
      aggression: clamp((s.aggression * 100 + t.aggression) / 200 + 0.15, 0.1, 1),
      press: clamp((s.press * 100 + t.pressing) / 200 + 0.1, 0.1, 1),
      discipline: t.discipline / 100,
    };
  });

  // Equipaciones: el visitante cambia hasta que los dos equipos se
  // distinguen de un vistazo. Si su segunda tampoco sirve, se recurre a un
  // contraste garantizado (blanco o negro).
  match.kits = [
    { primary: home.colors.primary, secondary: home.colors.secondary },
    { primary: away.colors.primary, secondary: away.colors.secondary },
  ];
  const MIN_KIT_CONTRAST = 210;
  if (colorDistance(home.colors.primary, away.colors.primary) < MIN_KIT_CONTRAST) {
    const candidates = [away.colors.away, '#f4f6f8', '#15181d', '#1f4fd8', '#e11d48'];
    let best = candidates[0], bestD = -1;
    for (const c of candidates) {
      if (!c) continue;
      const d = colorDistance(home.colors.primary, c);
      if (d >= MIN_KIT_CONTRAST) { best = c; bestD = d; break; }
      if (d > bestD) { best = c; bestD = d; }
    }
    match.kits[1] = { primary: best, secondary: away.colors.primary };
  }
  // El vivo tampoco puede confundirse con la camiseta del rival
  if (colorDistance(match.kits[1].secondary, match.kits[0].primary) < 120) {
    match.kits[1].secondary = colorDistance(match.kits[1].primary, '#0f1216') > 200 ? '#0f1216' : '#f4f6f8';
  }

  match.atmosphere.support = [
    50 + (neutralVenue ? 0 : 22) + home.fanIntensity * 0.1,
    50 - (neutralVenue ? 0 : 12) + away.fanIntensity * 0.06,
  ];

  return match;
}

/** Distancia perceptual sencilla entre dos colores hex. */
export function colorDistance(a, b) {
  const hex = (c) => {
    const m = String(c).replace('#', '');
    const v = m.length === 3 ? m.split('').map((x) => x + x).join('') : m;
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = hex(a), [r2, g2, b2] = hex(b);
  return Math.abs(r1 - r2) * 0.9 + Math.abs(g1 - g2) * 1.2 + Math.abs(b1 - b2) * 0.7;
}

export function emptyStats() {
  return {
    possessionTicks: 0, shots: 0, shotsOn: 0, goals: 0, corners: 0,
    throwIns: 0, goalKicks: 0, offsides: 0, fouls: 0, foulsSuffered: 0,
    yellows: 0, reds: 0, penalties: 0, saves: 0, passes: 0, passesOk: 0,
    injuries: 0, subs: 0, dives: 0,
  };
}

/** Dirección de ataque de un lado, considerando el cambio de campo. */
export function attackDir(match, side) {
  const swapped = match.half === 2 || match.half === 4;
  const base = side === SIDE.HOME ? 1 : -1;
  return swapped ? -base : base;
}

/** Portería que defiende un lado: x objetivo. */
export function ownGoalX(match, side) {
  return attackDir(match, side) > 0 ? 0 : FIELD.length;
}

export function targetGoalX(match, side) {
  return attackDir(match, side) > 0 ? FIELD.length : 0;
}

export function onPitch(match, side) {
  return match.entities.filter((e) => e.side === side && e.onPitch && !e.red);
}

export function entityById(match, id) {
  return match.entities.find((e) => e.id === id);
}

/** Coloca a los 22 en posición de saque inicial. */
export function setKickoffPositions(match, kickoffSide) {
  for (const e of match.entities) {
    if (!e.onPitch) continue;
    const dir = attackDir(match, e.side);
    const ownX = ownGoalX(match, e.side);
    // slot.x mide avance desde portería propia
    let x = ownX + dir * e.slot.x * FIELD.length * 0.92;
    let y = e.slot.y * FIELD.width;
    if (dir < 0) y = FIELD.width - y;
    // En el saque nadie pasa del centro salvo los dos del inicio
    if (e.side !== kickoffSide) {
      x = dir > 0 ? Math.min(x, FIELD.length / 2 - 1) : Math.max(x, FIELD.length / 2 + 1);
    } else {
      x = dir > 0 ? Math.min(x, FIELD.length / 2 - 0.5) : Math.max(x, FIELD.length / 2 + 0.5);
    }
    e.pos.x = clamp(x, 1, FIELD.length - 1);
    e.pos.y = clamp(y, 1, FIELD.width - 1);
    e.vel.x = 0; e.vel.y = 0;
  }
  const starters = onPitch(match, kickoffSide)
    .filter((e) => e.role === 'FW')
    .sort((a, b) => Math.abs(a.pos.y - FIELD.width / 2) - Math.abs(b.pos.y - FIELD.width / 2));
  const taker = starters[0] || onPitch(match, kickoffSide)[0];
  if (taker) {
    taker.pos.x = FIELD.length / 2 - (attackDir(match, kickoffSide) > 0 ? 1 : -1);
    taker.pos.y = FIELD.width / 2;
  }
  match.ball.pos = { x: FIELD.length / 2, y: FIELD.width / 2 };
  match.ball.vel = { x: 0, y: 0 };
  match.ball.owner = taker ? taker.id : null;
  match.ball.lastTouch = taker ? taker.id : null;
  match.ball.lastTouchSide = kickoffSide;
  match.possession = kickoffSide;
  return taker;
}
