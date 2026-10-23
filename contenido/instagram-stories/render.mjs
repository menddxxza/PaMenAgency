// Exporta las stories de stories.html a PNG (1080×1920) y MP4 animado.
//
//   node render.mjs                 → todas las stories, PNG + MP4
//   node render.mjs --png           → solo PNG
//   node render.mjs b1-quien-esta-detras c2-atiende   → solo esas
//
// Necesita Playwright (con Chromium) y ffmpeg en el PATH.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
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
const SECONDS = 6;
const args = process.argv.slice(2);
const pngOnly = args.includes('--png');
const html = readFileSync(join(here, 'stories.html'), 'utf8');
const allIds = [...html.matchAll(/data-id="([^"]+)"/g)].map((m) => m[1]);
const wanted = args.filter((a) => !a.startsWith('--'));
const ids = wanted.length ? allIds.filter((id) => wanted.includes(id)) : allIds;

mkdirSync(join(here, 'png'), { recursive: true });
mkdirSync(join(here, 'video'), { recursive: true });

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const pageUrl = pathToFileURL(join(here, 'stories.html')).href;

async function seek(ms) {
  await page.evaluate((t) => {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = t;
    }
  }, ms);
}

for (const [i, id] of ids.entries()) {
  const prefix = String(allIds.indexOf(id) + 1).padStart(2, '0');
  const name = `${prefix}-${id}`;
  await page.goto(`${pageUrl}?only=${id}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const frame = page.locator(`#${id}`);

  // PNG: estado final de la animación
  await seek(SECONDS * 1000);
  await frame.screenshot({ path: join(here, 'png', `${name}.png`) });

  // MP4: portadas de destacadas no llevan vídeo
  if (!pngOnly && !id.startsWith('portada-')) {
    const tmp = join(here, '.frames', id);
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const total = FPS * SECONDS;
    for (let f = 0; f < total; f++) {
      await seek((f / FPS) * 1000);
      await frame.screenshot({ path: join(tmp, `${String(f).padStart(4, '0')}.png`) });
    }
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-framerate', String(FPS), '-i', join(tmp, '%04d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow',
      '-movflags', '+faststart',
      join(here, 'video', `${name}.mp4`),
    ]);
    rmSync(tmp, { recursive: true, force: true });
  }
  console.log(`[${i + 1}/${ids.length}] ${name}`);
}

rmSync(join(here, '.frames'), { recursive: true, force: true });
await browser.close();
