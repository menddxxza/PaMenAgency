// Pruebas de los sistemas que rodean al partido: mundo, guardado, idiomas,
// carrera, economía y academia. Todo sin navegador.

import { suite, check, between } from './harness.js';
import { generateWorld, clubsOfDivision, DIVISIONS } from '../src/data/generators.js';
import { createMatch, colorDistance } from '../src/match/state.js';
import { Career, ASSETS } from '../src/career/career.js';
import { createReferee, addExperience, trainStat, overall } from '../src/career/referee.js';
import { DIFFICULTY } from '../src/core/config.js';
import { es } from '../i18n/es.js';
import { en } from '../i18n/en.js';
import { QUESTIONS } from '../src/data/examQuestions.js';
import { ACHIEVEMENTS } from '../src/career/achievements.js';
import { allSpecials } from '../src/data/scenarios.js';
import { RNG } from '../src/core/rng.js';

export default suite('Sistemas', (t) => {
  // ------------------------------------------------------------- mundo

  t('el mundo tiene más de 100 clubes y 16 selecciones', () => {
    const w = generateWorld('pruebas');
    check(w.allClubIds.length >= 100, `sólo hay ${w.allClubIds.length} clubes`);
    check(Object.keys(w.nationalTeams).length === 16, 'deberían ser 16 selecciones');
  });

  t('la misma semilla genera el mismo mundo', () => {
    const a = generateWorld('igual');
    const b = generateWorld('igual');
    check(a.clubs[a.allClubIds[7]].name === b.clubs[b.allClubIds[7]].name, 'los nombres deberían coincidir');
    check(a.clubs[a.allClubIds[7]].squad[3].pace === b.clubs[b.allClubIds[7]].squad[3].pace,
      'los atributos deberían coincidir');
  });

  t('semillas distintas generan mundos distintos', () => {
    const a = generateWorld('uno');
    const b = generateWorld('dos');
    check(a.clubs[a.allClubIds[0]].name !== b.clubs[b.allClubIds[0]].name, 'deberían diferir');
  });

  t('cada club tiene plantilla completa y entrenador', () => {
    const w = generateWorld('plantillas');
    for (const id of w.allClubIds.slice(0, 25)) {
      const c = w.clubs[id];
      check(c.squad.length >= 22, `${c.name} tiene ${c.squad.length} jugadores`);
      check(c.squad.filter((p) => p.role === 'GK').length >= 2, `${c.name} necesita porteros`);
      check(!!c.coach && !!c.coach.trait, `${c.name} sin entrenador`);
      check(!!c.stadium.name, `${c.name} sin estadio`);
    }
  });

  t('todas las divisiones con clubes se pueden poblar', () => {
    const w = generateWorld('divisiones');
    for (const d of DIVISIONS) {
      const clubs = clubsOfDivision(w, d.id);
      check(clubs.length >= 2, `${d.id} no tiene equipos suficientes`);
    }
  });

  // ------------------------------------------------------- equipaciones

  t('local y visitante siempre se distinguen', () => {
    const w = generateWorld('kits');
    const div = w.divisions.find((d) => d.id === 'primera');
    const clubs = div.clubIds.map((id) => w.clubs[id]);
    const ref = createReferee({ seed: 'k' });
    let worst = Infinity;
    for (let i = 0; i < clubs.length; i++) {
      for (let j = 0; j < clubs.length; j++) {
        if (i === j) continue;
        const m = createMatch({
          home: clubs[i], away: clubs[j], competition: div, seed: i * 31 + j,
          difficulty: DIFFICULTY.normal, referee: ref,
        });
        worst = Math.min(worst, colorDistance(m.kits[0].primary, m.kits[1].primary));
      }
    }
    check(worst >= 200, `el peor contraste entre equipaciones es ${worst.toFixed(0)}`);
  });

  // ------------------------------------------------------------ idiomas

  t('inglés y español tienen exactamente las mismas claves', () => {
    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();
    const faltanEn = esKeys.filter((k) => !(k in en));
    const faltanEs = enKeys.filter((k) => !(k in es));
    check(faltanEn.length === 0, `faltan en inglés: ${faltanEn.slice(0, 8).join(', ')}`);
    check(faltanEs.length === 0, `faltan en español: ${faltanEs.slice(0, 8).join(', ')}`);
  });

  t('ninguna traducción está vacía', () => {
    for (const [bundle, name] of [[es, 'es'], [en, 'en']]) {
      for (const [k, v] of Object.entries(bundle)) {
        const empty = Array.isArray(v) ? v.some((x) => !x || !x.trim()) : !String(v).trim();
        check(!empty, `clave vacía en ${name}: ${k}`);
      }
    }
  });

  t('los textos con variables las declaran en los dos idiomas', () => {
    const vars = (v) => (Array.isArray(v) ? v.join(' ') : String(v)).match(/\{(\w+)\}/g) || [];
    for (const k of Object.keys(es)) {
      if (!(k in en)) continue;
      const a = new Set(vars(es[k]));
      const b = new Set(vars(en[k]));
      for (const v of a) check(b.has(v), `${k}: falta ${v} en inglés`);
      for (const v of b) check(a.has(v), `${k}: falta ${v} en español`);
    }
  });

  t('la interfaz no usa claves inexistentes', async () => {
    const { readFileSync, readdirSync, statSync } = await import('fs');
    const files = [];
    const walk = (dir) => {
      for (const f of readdirSync(dir)) {
        const p = `${dir}/${f}`;
        if (statSync(p).isDirectory()) walk(p);
        else if (f.endsWith('.js')) files.push(p);
      }
    };
    walk(new URL('../src', import.meta.url).pathname);

    // Los comentarios traen ejemplos como t('clave'): no cuentan
    const stripComments = (src) => src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');

    const missing = new Set();
    for (const f of files) {
      const src = stripComments(readFileSync(f, 'utf8'));
      // Sólo claves literales: las dinámicas se comprueban a mano
      for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9._]+)'/g)) {
        const key = m[1];
        if (!(key in es)) missing.add(`${key} (${f.split('/').pop()})`);
      }
    }
    check(missing.size === 0, `claves sin traducción: ${[...missing].slice(0, 10).join(', ')}`);
  });

  // ------------------------------------------------------------ carrera

  t('una carrera nueva arranca coherente', () => {
    const c = new Career({ worldSeed: 'carrera' });
    check(c.divisionId === 'regional', 'debería empezar en regional');
    check(c.assignments.length === 3, 'debería ofrecer tres designaciones');
    check(c.referee.money > 0, 'debería empezar con algo de dinero');
    for (const a of c.assignments) {
      check(a.homeId !== a.awayId, 'un equipo no puede jugar contra sí mismo');
      check(!!a.stadium && !!a.weather, 'la designación necesita estadio y clima');
    }
  });

  t('guardar y cargar conserva la carrera', () => {
    const c = new Career({ worldSeed: 'guardado', mode: 'syndicate' });
    c.referee.money = 4321;
    c.referee.reputation = 55;
    c.buy('kit');
    c.academy.examLevel = 2;
    c.syndicate.chapter = 2;
    c.syndicate.flags.contacted = true;
    c.advanceRound();

    const data = JSON.parse(JSON.stringify(c.serialize()));
    const back = Career.deserialize(data);

    check(back.referee.money === c.referee.money, 'el dinero no coincide');
    check(back.referee.name === c.referee.name, 'el nombre no coincide');
    check(back.round === c.round && back.season === c.season, 'la jornada no coincide');
    check(back.owns('kit') === true, 'las compras no se conservan');
    check(back.academy.examLevel === 2, 'la titulación no se conserva');
    check(back.syndicate.chapter === 2 && back.syndicate.flags.contacted, 'la trama no se conserva');
    check(back.mode === 'syndicate', 'el modo no se conserva');
  });

  t('la experiencia sube de nivel de forma progresiva', () => {
    const ref = createReferee({ seed: 'xp' });
    const nivelesPrimero = addExperience(ref, 200).length;
    const nivelInicial = ref.level;
    addExperience(ref, 200);
    check(nivelesPrimero >= 1, 'debería subir al menos un nivel');
    check(ref.level > nivelInicial, 'debería seguir subiendo');
    check(ref.experience >= 0, 'la experiencia no puede quedar negativa');
  });

  t('entrenar cuesta más cuanto mejor eres', () => {
    const novato = createReferee({ seed: 'a', stats: { accuracy: 20 } });
    const veterano = createReferee({ seed: 'b', stats: { accuracy: 92 } });
    const g1 = trainStat(novato, 'accuracy', 2);
    const g2 = trainStat(veterano, 'accuracy', 2);
    check(g1 > g2, `el novato debería mejorar más (${g1} vs ${g2})`);
    check(veterano.stats.accuracy <= 99, 'no puede pasar de 99');
  });

  // ----------------------------------------------------------- economía

  t('las compras descuentan dinero y tienen efecto', () => {
    const c = new Career({ worldSeed: 'eco' });
    c.referee.money = 50000;
    const reglasAntes = c.referee.stats.rules;
    const res = c.buy('course');
    check(res.ok === true, 'la compra debería completarse');
    check(c.referee.money === 50000 - 1600, 'el dinero no se descontó bien');
    check(c.referee.stats.rules > reglasAntes, 'el curso debería subir el conocimiento de reglas');
    check(c.buy('course').ok === false, 'no se puede comprar dos veces');
  });

  t('no se puede comprar sin dinero', () => {
    const c = new Career({ worldSeed: 'eco2' });
    c.referee.money = 10;
    const res = c.buy('home');
    check(res.ok === false && res.reason === 'money', 'debería rechazarse por dinero');
    check(c.referee.money === 10, 'no debería descontar nada');
  });

  t('el gasto por jornada crece con la categoría', () => {
    const bajo = new Career({ worldSeed: 'e3', divisionId: 'regional' });
    const alto = new Career({ worldSeed: 'e4', divisionId: 'primera' });
    check(alto.livingCost() > bajo.livingCost(), 'arriba debería costar más vivir');
  });

  t('el mantenimiento se suma al gasto fijo', () => {
    const c = new Career({ worldSeed: 'e5' });
    const antes = c.livingCost();
    c.referee.money = 50000;
    c.buy('home');
    check(c.livingCost() > antes, 'el piso debería añadir mantenimiento');
  });

  t('los bienes cambian de verdad la recuperación', () => {
    const sin = new Career({ worldSeed: 'e6' });
    const con = new Career({ worldSeed: 'e6' });
    con.referee.money = 50000;
    con.buy('gym');
    sin.fatigue = 60; con.fatigue = 60;
    sin.advanceRound(); con.advanceRound();
    check(con.fatigue < sin.fatigue, `el gimnasio debería recuperar más (${con.fatigue} vs ${sin.fatigue})`);
  });

  // ------------------------------------------------------------ academia

  t('el examen baraja las opciones y corrige bien', () => {
    const c = new Career({ worldSeed: 'examen' });
    const ex = c.academy.startExam(null, 6);
    check(ex.questions.length === 6, 'debería haber seis preguntas');
    let posiciones = new Set();
    for (const q of ex.questions) {
      check(q.options.length >= 2, 'cada pregunta necesita opciones');
      check(q.correct >= 0 && q.correct < q.options.length, 'el índice correcto está fuera de rango');
      check(!!q.why, 'toda pregunta debe explicar el porqué');
      posiciones.add(q.correct);
    }
    check(posiciones.size > 1, 'la respuesta correcta no puede caer siempre en el mismo sitio');

    for (const q of ex.questions) c.academy.answer(q.correct);
    const res = c.academy.finishExam();
    check(res.passed === true && res.perfect === true, 'contestando bien debería aprobar');
    check(res.examLevel >= 1, 'debería subir la titulación');
  });

  t('el banco de preguntas está completo en los dos idiomas', () => {
    for (const q of QUESTIONS) {
      for (const loc of ['es', 'en']) {
        const body = q[loc];
        check(!!body, `pregunta ${q.topic} sin ${loc}`);
        check(body.options.length >= 3, 'necesita al menos tres opciones');
        check(body.correct >= 0 && body.correct < body.options.length, 'índice correcto inválido');
        check(!!body.why && body.why.length > 20, 'la explicación es demasiado corta');
      }
      check(q.es.options.length === q.en.options.length, 'las opciones deben coincidir en número');
    }
  });

  // -------------------------------------------------------------- varios

  t('todos los logros tienen nombre y descripción', () => {
    check(ACHIEVEMENTS.length >= 20, 'deberían ser al menos veinte');
    for (const a of ACHIEVEMENTS) {
      check(!!a.id && !!a.name && !!a.desc, `logro incompleto: ${a.id}`);
    }
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    check(ids.size === ACHIEVEMENTS.length, 'hay identificadores repetidos');
  });

  t('los escenarios están bien definidos', () => {
    const all = allSpecials();
    check(all.length >= 8, 'deberían ser al menos ocho');
    for (const s of all) {
      check(!!s.name && !!s.desc && !!s.goal, `escenario incompleto: ${s.id}`);
      between(s.targetRating, 1, 10, `objetivo fuera de rango en ${s.id}`);
      check(DIVISIONS.some((d) => d.id === s.divisionId), `división desconocida en ${s.id}`);
    }
  });

  t('el generador aleatorio es reproducible y está bien repartido', () => {
    const a = new RNG('semilla'); const b = new RNG('semilla');
    for (let i = 0; i < 50; i++) check(a.next() === b.next(), 'la secuencia debería repetirse');
    const r = new RNG('reparto');
    let suma = 0; const N = 20000;
    const cubos = new Array(10).fill(0);
    for (let i = 0; i < N; i++) { const v = r.next(); suma += v; cubos[Math.floor(v * 10)]++; }
    between(suma / N, 0.47, 0.53, 'la media debería rondar 0,5');
    for (const c of cubos) between(c / N, 0.07, 0.13, 'el reparto por décimas está sesgado');
  });
});
