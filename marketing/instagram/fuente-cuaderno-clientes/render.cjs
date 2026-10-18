(async()=>{const { chromium } = require("playwright");
const [,, html, outDir, fps = "30", only] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto("file://" + html + "?render");
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);
const T = await p.evaluate(() => window.TOTAL);
const times = only ? only.split(",").map(Number) : [...Array(Math.round(T * fps)).keys()].map(i => i / fps);
let i = 0;
for (const t of times) {
  await p.evaluate(t => window.seek(t), t);
  await p.screenshot({ path: `${outDir}/f${String(i++).padStart(4, "0")}.${only ? "png" : "jpg"}`, ...(only ? {} : { type: "jpeg", quality: 95 }) });
}
await b.close();
})();
