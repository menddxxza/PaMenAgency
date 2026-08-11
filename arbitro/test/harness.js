// Arnés de pruebas mínimo: sin dependencias, sin instalación.

export class AssertionError extends Error {}

export function check(cond, msg) {
  if (!cond) throw new AssertionError(msg || 'comprobación fallida');
}

export function near(actual, expected, tolerance, msg) {
  check(Math.abs(actual - expected) <= tolerance,
    msg || `esperaba ${expected} ±${tolerance}, salió ${actual}`);
}

export function between(actual, min, max, msg) {
  check(actual >= min && actual <= max,
    msg || `esperaba entre ${min} y ${max}, salió ${actual}`);
}

/**
 * Define un bloque de pruebas. Devuelve una función que las ejecuta y
 * devuelve { name, passed, failed, failures }.
 */
export function suite(name, define) {
  const cases = [];
  define((label, fn) => cases.push({ label, fn }));

  return async function run(opts = {}) {
    const failures = [];
    let passed = 0;
    for (const c of cases) {
      try {
        await c.fn();
        passed++;
        if (opts.verbose) console.log(`    ✓ ${c.label}`);
      } catch (err) {
        failures.push({ label: c.label, message: err.message, stack: err.stack });
        console.error(`    ✗ ${c.label}\n      ${err.message}`);
      }
    }
    return { name, passed, failed: failures.length, failures };
  };
}
