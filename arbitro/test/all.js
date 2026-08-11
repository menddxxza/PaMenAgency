// Ejecuta toda la batería de pruebas: `node test/all.js`
// Sin dependencias. Devuelve código 1 si algo falla.

import rules from './rules.test.js';
import systems from './systems.test.js';
import engine from './engine.test.js';

const suites = [rules, systems, engine];
const verbose = process.argv.includes('-v');

const t0 = Date.now();
let passed = 0, failed = 0;
const failures = [];

for (const run of suites) {
  const res = await run({ verbose });
  console.log(`\n${res.failed ? '✗' : '✓'} ${res.name}: ${res.passed} correctas, ${res.failed} fallidas`);
  passed += res.passed;
  failed += res.failed;
  failures.push(...res.failures.map((f) => ({ ...f, suite: res.name })));
}

console.log(`\n${'─'.repeat(52)}`);
console.log(`${passed} pruebas correctas · ${failed} fallidas · ${((Date.now() - t0) / 1000).toFixed(1)} s`);

if (failed) {
  console.log('\nFallos:');
  for (const f of failures) console.log(`  · [${f.suite}] ${f.label}\n    ${f.message}`);
  process.exit(1);
}
