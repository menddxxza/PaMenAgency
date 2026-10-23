// Exporta un reel HTML a MP4 1080×1920 a 30 fps, más una portada PNG.
//
//   node render-reel.mjs reel-3-tareas-ia.html
//
// La página debe definir window.REEL_DURATION (ms) y crear sus animaciones con
// la Web Animations API. Necesita Playwright (con Chromium) y ffmpeg.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  playwright = require(join(globalRoot, 'playwright'));
}

const FPS = 30;
const file = process.argv[2] ?? 'reel-3-tareas-ia.html';
const name = basename(file, '.html');
const tmp = join(here, '.frames', name);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`${pathToFileURL(join(here, file)).href}?render`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.REEL_DURATION);
const reel = page.locator('#reel');

const seek = (t) =>
  page.evaluate((ms) => {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = ms;
    }
  }, t);

const total = Math.round((duration / 1000) * FPS);
for (let f = 0; f < total; f++) {
  await seek((f / FPS) * 1000);
  await reel.screenshot({ path: join(tmp, `${String(f).padStart(4, '0')}.png`) });
  if (f % 60 === 0) console.log(`${name}: ${f}/${total}`);
}

// Portada: el gancho ya completo
await seek(2600);
await reel.screenshot({ path: join(here, `${name}-portada.png`) });
await browser.close();

execFileSync('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-framerate', String(FPS), '-i', join(tmp, '%04d.png'),
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
  '-shortest',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'slow',
  '-c:a', 'aac', '-b:a', '128k',
  '-movflags', '+faststart',
  join(here, `${name}.mp4`),
]);
rmSync(join(here, '.frames'), { recursive: true, force: true });
console.log(`${name}.mp4 listo`);
