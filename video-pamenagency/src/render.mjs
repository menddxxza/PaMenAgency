#!/usr/bin/env node
/*
 * Renderiza la escena fotograma a fotograma con Chromium headless (Playwright)
 * y codifica con FFmpeg (H.264 + AAC, Rec.709, 1080x1920, 30 fps).
 *
 *   node src/render.mjs --version main --audio audio/music_main.wav --out renders/x.mp4
 *   node src/render.mjs --stills 1.5,7,13      -> PNG sueltos en .cache/stills
 *   node src/render.mjs --cover renders/portada.png
 *   --encode-only  reutiliza los PNG de .cache/frames (sólo vuelve a codificar)
 *   --from S --to S  re-renderiza sólo ese tramo (requiere un render completo previo)
 *   --crf N        calidad x264 (por defecto 19)
 */
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return require(path.join(globalRoot, 'playwright'));
  }
}
const { chromium } = loadPlaywright();

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
    return acc;
  }, []),
);

async function openPage(browser, vname = 'main') {
  const page = await browser.newPage({ viewport: { width: TL.width, height: TL.height }, deviceScaleFactor: 1 });
  // cada versión puede adelantar o retrasar entradas de texto (cueOverrides)
  const tl = { ...TL, cues: { ...TL.cues, ...(TL.versions[vname]?.cueOverrides || {}) } };
  await page.addInitScript((t) => {
    window.TL = t;
  }, tl);
  await page.goto('file://' + path.join(ROOT, 'src/scene.html'));
  const info = await page.evaluate(() => window.ready);
  if (!info.fontsOk) throw new Error('Las tipografías no se han cargado');
  return { page, info };
}

async function shot(page, file) {
  await page.locator('#c').screenshot({ path: file, type: 'png', animations: 'disabled' });
}

/* Convierte el tiempo de salida al tiempo de la escena según los segmentos del montaje. */
function sourceTime(version, tOut) {
  let acc = 0;
  for (const [s, e] of version.segments) {
    const len = e - s;
    if (tOut < acc + len - 1e-9) return s + (tOut - acc);
    acc += len;
  }
  const last = version.segments[version.segments.length - 1];
  return last[1];
}

async function main() {
  const browser = await chromium.launch({
    args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'],
  });

  if (args.stills) {
    const dir = path.join(ROOT, '.cache/stills');
    fs.mkdirSync(dir, { recursive: true });
    const { page, info } = await openPage(browser);
    console.log('logo original:', info.logo ? 'sí' : 'no (se usa la marca tipográfica)');
    for (const t of String(args.stills).split(',').map(Number)) {
      await page.evaluate((tt) => window.renderFrame(tt), t);
      const f = path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`);
      await shot(page, f);
      console.log(f);
    }
    await browser.close();
    return;
  }

  if (args.cover) {
    const { page } = await openPage(browser);
    await page.evaluate(() => window.renderCover());
    const out = path.resolve(ROOT, args.cover);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await shot(page, out);
    console.log('portada:', out);
    await browser.close();
    return;
  }

  const vname = args.version || 'main';
  const version = TL.versions[vname];
  const fps = TL.fps;
  const total = Math.round(version.duration * fps);
  const workers = Number(args.workers || Math.max(1, Math.min(4, os.cpus().length)));
  const dir = path.join(ROOT, '.cache/frames', vname);
  const t0 = Date.now();
  if (!args['encode-only']) {
    // --from/--to (segundos de salida): re-renderiza sólo ese tramo y conserva el resto
    const partial = args.from != null || args.to != null;
    const fFrom = partial ? Math.floor(Number(args.from || 0) * fps) : 0;
    const fTo = partial ? Math.min(total, Math.ceil(Number(args.to || version.duration) * fps)) : total;
    if (!partial) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    console.log(`Renderizando ${vname}: ${total} fotogramas, ${workers} procesos`);
    let done = 0;
    await Promise.all(
      Array.from({ length: workers }, async (_, w) => {
        const { page } = await openPage(browser, vname);
        for (let f = fFrom + w; f < fTo; f += workers) {
          const t = sourceTime(version, f / fps);
          await page.evaluate((tt) => window.renderFrame(tt), t);
          await shot(page, path.join(dir, `f${String(f).padStart(5, '0')}.png`));
          done++;
          if (done % 60 === 0) console.log(`  ${done}/${total}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
        }
        await page.close();
      }),
    );
  }
  await browser.close();

  const out = path.resolve(ROOT, args.out || `renders/pamenagency_${vname}.mp4`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f%05d.png')];
  if (args.audio) ff.push('-i', path.resolve(ROOT, args.audio));
  if (args.subs) ff.push('-vf', `subtitles=${path.resolve(ROOT, args.subs)}:force_style='${args.subsStyle || ''}'`);
  ff.push(
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    String(args.crf || 19),
    '-tune',
    'film',
    '-maxrate',
    '16M',
    '-bufsize',
    '32M',
    '-profile:v',
    'high',
    '-level',
    '4.2',
    '-pix_fmt',
    'yuv420p',
    '-x264-params',
    'colorprim=bt709:transfer=bt709:colormatrix=bt709',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-colorspace',
    'bt709',
    '-color_range',
    'tv',
    '-r',
    String(fps),
    '-g',
    String(fps * 2),
  );
  const fade = version.fadeOut ? `fade=t=out:st=${version.duration - version.fadeOut}:d=${version.fadeOut},` : '';
  if (!args.subs) ff.splice(ff.indexOf('-c:v'), 0, '-vf', `${fade}scale=out_color_matrix=bt709:out_range=tv`);
  if (args.audio) ff.push('-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest');
  ff.push('-t', String(version.duration), '-movflags', '+faststart', out);
  await new Promise((res, rej) => {
    const p = spawn('ffmpeg', ff, { stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? res() : rej(new Error('ffmpeg ' + code))));
  });
  console.log('Listo:', out, `(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
