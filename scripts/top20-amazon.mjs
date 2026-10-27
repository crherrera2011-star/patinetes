#!/usr/bin/env node
/**
 * top20-amazon.mjs — Paso 2 del pipeline.
 *
 * Busca en Amazon.es los productos mejor valorados de una consulta, descarta
 * patrocinados, deduplica ASINs y genera un Excel con las URLs de detalle.
 *
 * Uso:
 *   node scripts/top20-amazon.mjs --query "patinetes eléctricos"
 *   node scripts/top20-amazon.mjs --query "monitores 27" --limit 20 --out datos/monitores.xlsx
 *   node scripts/top20-amazon.mjs --query "robots aspirador" --headful
 *
 * Requiere: npm i -D puppeteer xlsx
 *
 * Si Amazon bloquea la búsqueda, crea el Excel a mano con una columna "URL"
 * (una URL de detalle por fila). El resto del pipeline funciona igual.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadDeps() {
  try {
    return { puppeteer: require("puppeteer"), XLSX: require("xlsx") };
  } catch {
    console.error(
      "Faltan dependencias. Ejecuta:\n  npm i -D puppeteer xlsx\n" +
        "y vuelve a lanzar el script."
    );
    process.exit(1);
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const args = parseArgs(process.argv.slice(2));
const query = String(args.query || "").trim();
if (!query) {
  console.error('Falta la búsqueda. Ejemplo:\n  node scripts/top20-amazon.mjs --query "patinetes eléctricos"');
  process.exit(1);
}

const limit = Math.max(1, Number(args.limit || 20));
const minRating = Number(args["min-rating"] ?? 4.0);
const minReviews = Number(args["min-reviews"] ?? 20);
const maxPages = Math.max(1, Number(args.pages || 3));
const domain = String(args.domain || "amazon.es");
const exclude = args.exclude ? new RegExp(String(args.exclude), "i") : null;
const outPath = path.resolve(String(args.out || `datos/top-${slugify(query)}.xlsx`));
const headful = Boolean(args.headful);

const { puppeteer, XLSX } = loadDeps();
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function extractPage(page) {
  return page.evaluate((marketDomain) => {
    const cards = Array.from(document.querySelectorAll("div[data-asin]"));
    const rows = [];
    for (const card of cards) {
      const asin = (card.getAttribute("data-asin") || "").trim();
      if (!/^[A-Z0-9]{10}$/.test(asin)) continue;

      const text = card.innerText || "";
      if (/patrocinado|sponsored/i.test(text)) continue;

      const title =
        card.querySelector("h2")?.innerText?.trim() ||
        card.querySelector("h2 span")?.textContent?.trim() ||
        "";
      if (!title) continue;

      const ratingLabel =
        card.querySelector('[aria-label*="de 5 estrellas"]')?.getAttribute("aria-label") || "";
      const ratingMatch =
        ratingLabel.match(/([0-5][.,]\d)\s*de\s*5/) || text.match(/([0-5][.,]\d)\s*de\s*5/);

      // Amazon muestra el volumen como "(352)", "(2,2 mil)" o dentro del
      // aria-label ("… por 352 reseñas"). Probamos las tres formas.
      const reviewLabelMatch = ratingLabel.match(/por\s+([\d.,]+\s*(?:mil|k)?)\s*reseñas/i);
      const reviewTextMatch =
        text.match(/\(([\d.,]+\s*(?:mil|k)?)\)/i) ||
        text.match(/([\d.]+)\s*(?:valoraciones|opiniones)/i);
      const rawReviews = (reviewLabelMatch?.[1] || reviewTextMatch?.[1] || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(",", ".");
      let reviews = 0;
      if (rawReviews) {
        if (rawReviews.endsWith("mil")) {
          reviews = Math.round(Number.parseFloat(rawReviews.replace("mil", "")) * 1000);
        } else if (rawReviews.endsWith("k")) {
          reviews = Math.round(Number.parseFloat(rawReviews.replace("k", "")) * 1000);
        } else {
          reviews = Number.parseInt(rawReviews.replace(/\./g, ""), 10) || 0;
        }
      }

      const priceText = card.querySelector(".a-price .a-offscreen")?.textContent || "";

      rows.push({
        asin,
        title: title.replace(/\s+/g, " "),
        rating: ratingMatch ? Number(ratingMatch[1].replace(",", ".")) : 0,
        reviews,
        price: Number(priceText.replace(/[^\d,]/g, "").replace(",", ".")) || 0,
        url: `https://www.${marketDomain}/dp/${asin}`,
      });
    }
    return rows;
  }, domain);
}

async function main() {
  console.log(`Buscando "${query}" en ${domain}...`);
  const browser = await puppeteer.launch({
    headless: !headful,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--lang=es-ES",
    ],
  });

  const collected = new Map();
  let blocked = false;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    for (let current = 1; current <= maxPages; current += 1) {
      const url =
        `https://www.${domain}/s?k=${encodeURIComponent(query)}` +
        `&s=review-rank&page=${current}&language=es_ES`;
      console.log(`  página ${current} → ${url}`);
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await delay(1500 + Math.random() * 1500);

      const body = await page.evaluate(() => document.body.innerText.slice(0, 4000));
      if (/introduce los caracteres|no es un robot|validateCaptcha/i.test(body)) {
        blocked = true;
        break;
      }

      const rows = await extractPage(page);
      let added = 0;
      for (const row of rows) {
        if (!collected.has(row.asin)) {
          collected.set(row.asin, row);
          added += 1;
        }
      }
      console.log(`    ${rows.length} tarjetas, ${added} nuevas (total ${collected.size})`);
      const eligible = [...collected.values()]
        .filter((row) => !(exclude && exclude.test(row.title)))
        .filter((row) => row.rating >= minRating && row.reviews >= minReviews).length;
      if (eligible >= limit) break;
    }
  } finally {
    await browser.close();
  }

  const candidates = [...collected.values()]
    .filter((row) => !(exclude && exclude.test(row.title)))
    .filter((row) => row.rating >= minRating && row.reviews >= minReviews)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, limit);

  if (candidates.length === 0) {
    console.error(
      "\nNo se han podido obtener resultados." +
        (blocked ? " Amazon ha mostrado un captcha." : "") +
        "\nPlan B: crea el Excel manualmente con una columna URL y una URL de detalle por fila.\n" +
        `Ruta sugerida: ${outPath}`
    );
    process.exitCode = 2;
    return;
  }

  if (blocked) {
    console.warn(
      "\nAviso: Amazon ha mostrado un captcha a mitad de la búsqueda. " +
        `Se guardan los ${candidates.length} resultados ya obtenidos; revisa que sean suficientes.`
    );
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const rows = candidates.map((row) => ({
    URL: row.url,
    ASIN: row.asin,
    Titulo: row.title,
    Valoracion: row.rating,
    Resenas: row.reviews,
    Precio: row.price,
  }));  const sheet = XLSX.utils.json_to_sheet(rows, {
    header: ["URL", "ASIN", "Titulo", "Valoracion", "Resenas", "Precio"],
  });
  sheet["!cols"] = [
    { wch: 52 },
    { wch: 13 },
    { wch: 70 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "URLs");
  XLSX.writeFile(book, outPath);

  const jsonPath = outPath.replace(/\.xlsx$/i, ".json");
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      { query, domain, generatedAt: new Date().toISOString(), filters: { minRating, minReviews }, items: candidates },
      null,
      2
    ),
    "utf8"
  );

  console.log(`\n✅ ${candidates.length} productos → ${outPath}`);
  console.log(`✅ Datos completos → ${jsonPath}`);
  console.log("\nSiguiente paso: generar el esquema de Supabase con scripts/crear-esquema.mjs");

  if (candidates.length < limit) {
    console.warn(
      `\nAviso: solo ${candidates.length} de ${limit}. Baja --min-reviews, añade páginas ` +
        "o completa el Excel a mano con más URLs."
    );
  }
}

main().catch((error) => {
  console.error("\nError inesperado:", error.message);
  process.exitCode = 1;
});
