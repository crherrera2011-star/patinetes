/**
 * prerender.mjs — se ejecuta después de `vite build`.
 *
 * La web es una SPA: el HTML inicial solo trae `<div id="root">` y Google tiene
 * que ejecutar JavaScript (y esperar a Supabase) para ver contenido. Este script
 * abre cada ruta del sitemap en Chrome headless, deja que React pinte y guarda
 * el HTML resultante como archivo estático:
 *
 *   /                  -> dist/index.html
 *   /patinetes         -> dist/patinetes.html
 *   /producto/<id>     -> dist/producto/<id>.html
 *   /404               -> dist/404.html
 *
 * Con `cleanUrls: true` en vercel.json, Vercel sirve `/patinetes` desde
 * `patinetes.html` y las rutas inexistentes caen en el 404 real.
 *
 * Si Chrome no arranca (build sin binario) o una ruta falla, se copia el shell
 * original para no romper el despliegue: la web sigue funcionando como SPA.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PRERENDER_PORT || 4599);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const NAV_TIMEOUT = Number(process.env.PRERENDER_TIMEOUT || 30000);

if (process.env.PRERENDER_DISABLED === "1") {
  console.log("Prerender: desactivado por PRERENDER_DISABLED=1.");
  process.exit(0);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function isFile(target) {
  try {
    return statSync(target).isFile();
  } catch {
    return false;
  }
}

async function main() {
  if (!existsSync(path.join(DIST, "index.html"))) {
    throw new Error("No existe dist/index.html. ¿Se ejecutó vite build?");
  }
  if (!existsSync(path.join(DIST, "sitemap.xml"))) {
    throw new Error("No existe dist/sitemap.xml. ¿Se ejecutó generate-sitemap?");
  }

  // El shell original se sirve siempre para las rutas HTML: así Chrome siempre
  // arranca la SPA limpia, aunque ya hayamos escrito algún .html prerenderizado.
  const shell = await readFile(path.join(DIST, "index.html"));

  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent((req.url || "/").split("?")[0]);
      const filePath = path.join(DIST, pathname);
      const ext = path.extname(filePath).toLowerCase();

      if (ext && ext !== ".html" && isFile(filePath)) {
        const body = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
        res.end(body);
        return;
      }

      res.writeHead(200, { "Content-Type": MIME[".html"] });
      res.end(shell);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(String(error?.message || error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, "127.0.0.1", resolve);
  });

  let browser;
  const results = [];

  try {
    const { default: puppeteer } = await import("puppeteer");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const routes = await readRoutes();
    console.log(`Prerender: ${routes.length} rutas en ${BASE_URL}`);

    for (const route of routes) {
      const result = await renderRoute(browser, route);
      results.push(result);
      const state = result.ok ? "ok" : `omitida (${result.reason})`;
      console.log(`  ${result.ok ? "✓" : "·"} ${route.path} — ${result.title || "-"} [${state}]`);
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
  }

  let written = 0;
  for (const result of results) {
    if (!result.ok) continue;
    const target = outputPath(result.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, result.html, "utf8");
    written += 1;
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length) {
    console.warn(`Prerender: ${failed.length} ruta(s) sin HTML propio (usarán el shell SPA).`);
  }
  console.log(`Prerender: ${written}/${results.length} páginas escritas.`);
}

async function readRoutes() {
  const sitemap = await readFile(path.join(DIST, "sitemap.xml"), "utf8");
  const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => {
      try {
        return new URL(match[1]).pathname;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const unique = [...new Set(["/", ...paths, "/404"])];
  return unique.map((routePath) => ({
    path: routePath,
    isProduct: routePath.startsWith("/producto/"),
    is404: routePath === "/404",
  }));
}

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1280, height: 900 });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      const url = request.url();
      const heavy = type === "image" || type === "media" || type === "font";
      const thirdParty = /m\.media-amazon\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url);
      if (heavy || thirdParty) request.abort().catch(() => {});
      else request.continue().catch(() => {});
    });

    await page.goto(`${BASE_URL}${route.path}`, {
      waitUntil: "networkidle2",
      timeout: NAV_TIMEOUT,
    });
    await page.waitForSelector("#contenido h1", { timeout: 15000 });
    // Deja que useEffect() de useSEO actualice title, canonical y JSON-LD.
    await new Promise((resolve) => setTimeout(resolve, 300));

    const snapshot = await page.evaluate(() => ({
      title: document.title,
      robots: document.querySelector('meta[name="robots"]')?.content || "",
      h1: document.querySelector("#contenido h1")?.textContent?.trim() || "",
      html: `<!DOCTYPE html>\n${document.documentElement.outerHTML}`,
    }));

    // Ficha que no existe: NO se escribe (Vercel devolverá 404 de verdad).
    if (route.isProduct && /noindex/i.test(snapshot.robots)) {
      return { ...route, ok: false, reason: "producto no encontrado" };
    }
    if (!route.is404 && !snapshot.h1) {
      return { ...route, ok: false, reason: "sin h1" };
    }

    return { ...route, ok: true, title: snapshot.title, html: snapshot.html };
  } catch (error) {
    return { ...route, ok: false, reason: error?.message || "error de render" };
  } finally {
    await page.close().catch(() => {});
  }
}

function outputPath(routePath) {
  if (routePath === "/") return path.join(DIST, "index.html");
  const relative = routePath.replace(/^\/+/, "").replace(/\/+$/, "");
  const safe = relative
    .split("/")
    .map((segment) => segment.replace(/[<>:"|?*\\]/g, "_"))
    .join(path.sep);
  return path.join(DIST, `${safe}.html`);
}

main().catch(async (error) => {
  console.warn(`Prerender: no se pudo completar (${error?.message || error}).`);
  console.warn("Prerender: se copia el shell SPA en cada ruta para no romper el sitio.");
  try {
    const shell = await readFile(path.join(DIST, "index.html"));
    if (!shell.length) throw new Error("dist/index.html está vacío");

    const routes = await readRoutes().catch(() => []);
    let copies = 0;
    for (const route of routes) {
      const target = outputPath(route.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, shell);
      copies += 1;
    }
    await writeFile(path.join(DIST, "404.html"), shell);
    console.warn(`Prerender: shell copiado a ${copies} rutas + 404.html.`);
  } catch (inner) {
    console.error(`Prerender: ${inner.message}`);
    process.exitCode = 1;
  }
});
