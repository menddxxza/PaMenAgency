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
