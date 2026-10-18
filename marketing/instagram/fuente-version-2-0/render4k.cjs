// Render 4K (2160x3840): node render4k.cjs page.html salida120.mp4 salida60.mp4
// Stills de prueba:      node render4k.cjs page.html --stills carpeta "1.2,3.4"
(async () => {
  const { chromium } = require("playwright");
  const { spawn } = require("child_process");
  const [, , html, a, b, c] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await page.goto("file://" + html + "?render");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const T = await page.evaluate(() => window.TOTAL);

  if (a === "--stills") {
    const times = c.split(",").map(Number);
    let i = 0;
    for (const t of times) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: `${b}/s${i++}.png` });
    }
    await browser.close();
    return;
  }

  const enc = (fps, out) => {
    const p = spawn("ffmpeg", ["-loglevel", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
      "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest",
      "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high",
      "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k", out], { stdio: ["pipe", "inherit", "inherit"] });
    p.done = new Promise(r => p.on("close", r));
    return p;
  };
  const write = (p, buf) => new Promise(r => (p.stdin.write(buf) ? r() : p.stdin.once("drain", r)));

  const e120 = enc(120, a), e60 = enc(60, b);
  const N = Math.round(T * 120);
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => window.seek(t), i / 120);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    await write(e120, buf);
    if (i % 2 === 0) await write(e60, buf);
    if (i % 240 === 0) console.log(`frame ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  e120.stdin.end(); e60.stdin.end();
  await Promise.all([e120.done, e60.done]);
  await browser.close();
  console.log("done", ((Date.now() - t0) / 1000).toFixed(0) + "s");
})();
