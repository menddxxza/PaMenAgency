'use client';

/**
 * Pequeño aviso de "has terminado" al acabar un examen o el repaso de
 * flashcards del día: dos tonos ascendentes cortos generados con Web Audio
 * (sin archivo de audio que cargar) más una vibración breve en los móviles
 * que la soportan. Todo dentro de un try/catch silencioso: el navegador
 * puede bloquear el audio si no hay gesto del usuario reciente, o no tener
 * Web Audio/vibración — nunca debe romper el flujo de terminar un examen.
 */
export function celebrarFinal() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const ahora = ctx.currentTime;

    [523.25, 783.99].forEach((frecuencia, i) => {
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frecuencia;
      const inicio = ahora + i * 0.11;
      ganancia.gain.setValueAtTime(0, inicio);
      ganancia.gain.linearRampToValueAtTime(0.12, inicio + 0.02);
      ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + 0.28);
      osc.connect(ganancia);
      ganancia.connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.3);
    });

    setTimeout(() => ctx.close(), 600);
  } catch {
    // Sin Web Audio, o bloqueado por el navegador: no pasa nada, es solo un extra.
  }

  try {
    navigator.vibrate?.(120);
  } catch {
    // Sin soporte de vibración (la mayoría de escritorio): no pasa nada.
  }
}
