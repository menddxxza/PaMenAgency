// Renderizador de reels de PaMen Agency (4K 2160x3840, 60 fps, H.264 + pista de audio muda).
//
//   Vídeo:   node render4k.cjs ruta/reel.html salida.mp4
//   Stills:  node render4k.cjs ruta/reel.html --stills carpeta "0.5,2,4.8,9"
//
// La página debe exponer window.TOTAL (segundos) y window.seek(t), y quedarse quieta con ?render.
// Requisitos: npm i (en esta carpeta), npx playwright install chromium, ffmpeg en el PATH.
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");
const { spawn } = require("child_process");
const { chromium } = require("playwright");

(async () => {
  const [, , htmlArg, a, b, c] = process.argv;
  if (!htmlArg || !a) { console.log("uso: node render4k.cjs reel.html salida.mp4 | --stills carpeta \"t1,t2\""); process.exit(1); }
  const html = path.resolve(htmlArg);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(html).href + "?render");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const T = await page.evaluate(() => window.TOTAL);

  if (a === "--stills") {
    const dir = path.resolve(b); fs.mkdirSync(dir, { recursive: true });
    const times = c.split(",").map(Number); let i = 0;
    for (const t of times) { await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: path.join(dir, `s${i++}.png`) }); }
    await browser.close(); console.log(`${times.length} stills en ${dir}`); return;
  }

  const out = path.resolve(a), FPS = 60, N = Math.round(T * FPS);
  const ff = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest", "-c:v", "libx264", "-preset", "medium", "-crf", "17",
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", out],
    { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise(r => ff.on("close", r));
  const write = buf => new Promise(r => (ff.stdin.write(buf) ? r() : ff.stdin.once("drain", r)));
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => window.seek(t), i / FPS);
    await write(await page.screenshot({ type: "jpeg", quality: 95 }));
    if (i % 240 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await done; await browser.close();
  console.log("hecho", out, ((Date.now() - t0) / 1000).toFixed(0) + "s");
})();
