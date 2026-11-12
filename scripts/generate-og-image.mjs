/**
 * generate-og-image.mjs — genera public/images/og-default.png (1200×630).
 *
 * WhatsApp, LinkedIn o X no renderizan SVG, así que la imagen social tiene que
 * ser PNG/JPG. Se regenera a mano con:
 *
 *   npm run og:image
 *
 * No se ejecuta en cada build: la imagen cambia muy poco y así el deploy no
 * depende de Chrome.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { launchBrowser } from "./lib/launch-browser.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public", "images");
const OUT_FILE = path.join(OUT_DIR, "og-default.png");

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #fbfaf6;
    font-family: Inter, "Segoe UI", system-ui, sans-serif;
    color: #101614;
    position: relative;
  }
  .glow {
    position: absolute; width: 720px; height: 720px; right: -180px; top: -260px;
    background: radial-gradient(circle, rgba(13,107,87,0.16) 0%, rgba(13,107,87,0) 68%);
  }
  .bar { position: absolute; left: 0; top: 0; width: 14px; height: 100%; background: #0d6b57; }
  .wrap { position: relative; padding: 74px 84px 64px 104px; height: 100%; display: flex; flex-direction: column; }
  .pill {
    align-self: flex-start; display: inline-flex; align-items: center; gap: 10px;
    border: 1px solid #e4dfd1; background: #fff; border-radius: 999px;
    padding: 9px 18px; font-size: 19px; font-weight: 500; letter-spacing: 0.02em; color: #3b4640;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #9dbb2f; }
  h1 {
    margin-top: 44px; font-family: "Bricolage Grotesque", Inter, sans-serif;
    font-size: 82px; line-height: 0.96; letter-spacing: -0.035em; font-weight: 600;
    max-width: 900px;
  }
  h1 em { font-style: italic; color: #0d6b57; }
  p { margin-top: 30px; font-size: 27px; line-height: 1.4; color: #6d7872; max-width: 800px; }
  .foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 16px; font-size: 24px; font-weight: 600; }
  .bolt {
    width: 52px; height: 52px; border-radius: 14px; background: #101614;
    display: flex; align-items: center; justify-content: center;
  }
  .bolt svg { width: 26px; height: 26px; }
  .url { font-size: 21px; color: #6d7872; letter-spacing: 0.01em; }
</style>
</head>
<body>
  <div class="bar"></div>
  <div class="glow"></div>
  <div class="wrap">
    <span class="pill"><span class="dot"></span> Guía independiente · 2026</span>
    <h1>Comparativas de patinetes <em>eléctricos</em></h1>
    <p>Autonomía real, potencia, frenos y precio. Nota editorial con metodología, sin marketing.</p>
    <div class="foot">
      <div class="brand">
        <span class="bolt">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9dbb2f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/></svg>
        </span>
        Patinetes Eléctricos
      </div>
      <span class="url">toppatinetes.com</span>
    </div>
  </div>
</body>
</html>`;

async function main() {
  const { browser, strategy } = await launchBrowser();
  console.log(`OG image: navegador listo (${strategy}).`);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
    await page.setContent(HTML, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts?.ready);
    const buffer = await page.screenshot({ type: "png" });

    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, buffer);
    console.log(`OG image: ${OUT_FILE} (${(buffer.length / 1024).toFixed(0)} KB)`);
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`OG image: ${error?.message || error}`);
  process.exitCode = 1;
});
