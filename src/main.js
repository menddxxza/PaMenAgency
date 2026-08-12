// Punto de entrada.

import { Game } from './game.js';

const dom = {
  canvas: document.getElementById('pitch'),
  hud: document.getElementById('hud'),
  screens: document.getElementById('screens'),
};

const game = new Game(dom);
game.boot();

// Útil para depurar desde la consola del navegador.
globalThis.SILBATO = game;

// Sin conexión: el juego es estático y cabe entero en la caché del navegador.
// Si el registro falla (file://, navegador sin soporte) no pasa nada: se
// juega igual, sólo que hace falta el servidor.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
  });
}
