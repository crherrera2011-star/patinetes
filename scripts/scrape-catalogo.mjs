#!/usr/bin/env node
/**
 * scrape-catalogo.mjs — Paso 4 del pipeline.
 *
 * Lee las URLs del Excel generado en el paso 2, scrapea cada ficha de Amazon,
 * normaliza los datos y rellena la tabla de Supabase.
 *
 * Uso:
 *   node scripts/scrape-catalogo.mjs --input datos/patinetes.xlsx --push
 *   node scripts/scrape-catalogo.mjs --input datos/patinetes.xlsx --dry-run
 *   node scripts/scrape-catalogo.mjs --input datos/patinetes.xlsx --sql
 *   node scripts/scrape-catalogo.mjs --input datos/patinetes.xlsx --limit 3 --push
 *   node scripts/scrape-catalogo.mjs --input datos/patinetes.xlsx --limit 1 --headful
 *
 * Variables (.env):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_AMAZON_TAG
 *   SUPABASE_SERVICE_ROLE_KEY  (solo para --push; nunca en el frontend)
 *
 * Requiere: npm i -D puppeteer xlsx
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

function loadDeps() {
  try {
    return { puppeteer: require("puppeteer"), XLSX: require("xlsx") };
  } catch {
    console.error("Faltan dependencias. Ejecuta:\n  npm i -D puppeteer xlsx");
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
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function loadEnvFile() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.resolve(file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, raw] = match;
      if (process.env[key] === undefined) {
        process.env[key] = raw.replace(/^["']|["']$/g, "");
      }
    }
  }
}

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(String(args.input || "datos/urls.xlsx"));
const configPath = path.resolve(String(args.config || "niche.config.mjs"));
const push = Boolean(args.push);
const dryRun = Boolean(args["dry-run"]);
const makeSql = Boolean(args.sql);
const onlyMissing = Boolean(args["only-missing"]);
const skipKnown = Boolean(args["skip-known"]);
const limit = Number(args.limit || 0);
const baseDelay = Number(args.delay || 3);
const outDir = path.resolve(String(args.out || "datos"));
const snapshotPath = path.join(outDir, "productos.json");
const sqlPath = path.resolve(String(args["sql-out"] || "supabase/insert-productos.sql"));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => delay((baseDelay + Math.random() * 2) * 1000);

const stripAccents = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const cleanText = (value) =>
  String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const slugKey = (value) =>
  stripAccents(cleanText(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function parsePrice(text) {
  const raw = cleanText(text).replace(/[^\d.,]/g, "");
  if (!raw) return 0;
  const normalized = raw.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : 0;
}

function parseRating(text) {
  const match = cleanText(text).match(/([0-5][.,]\d)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
}

function parseReviews(text) {
  const match = cleanText(text).match(/([\d.]+)/);
  return match ? Number(match[1].replace(/\./g, "")) || 0 : 0;
}

function extractAsin(url) {
  const match = String(url).match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : "";
}

async function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`No existe ${configPath}. Copia templates/niche.config.mjs en la raíz.`);
  }
  const module = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
  return module.default || module.config;
}

function buildAliasMap(config) {
  const map = new Map();
  const specs = config.specs || {};
  for (const [key, spec] of Object.entries(specs)) {
    const candidates = [key, spec.label, ...(spec.aliases || [])];
    for (const candidate of candidates) {
      const normalized = slugKey(candidate);
      if (normalized.length < 3) continue;
      if (!map.has(normalized)) map.set(normalized, key);
    }
  }
  return map;
}

function canonicalSpecKey(rawKey, aliasMap) {
  const normalized = slugKey(rawKey)
    .replace(/^(el|la|los|las|tipo_de|tamano_de|numero_de)_/, "")
    .replace(/_(del_producto|de_producto|del_articulo|de_la_bateria)$/, "");
  if (!normalized) return "";
  if (aliasMap.has(normalized)) return aliasMap.get(normalized);

  // Coincidencia parcial solo por palabras completas: evita que «rango de edad»
  // acabe en autonomía o «número de ruedas» en el tamaño de rueda.
  let best = "";
  let bestLength = 0;
  for (const [alias, key] of aliasMap) {
    if (alias.length < 5 || normalized.length < 5) continue;
    const bounded = new RegExp(`(^|_)${escapeRegExp(alias)}($|_)`).test(normalized);
    if (bounded && alias.length > bestLength) {
      best = key;
      bestLength = alias.length;
    }
  }
  return best || slugKey(rawKey);
}

function parseSpecNumber(value) {
  const match = cleanText(value).match(/-?\d+(?:[.,]\d+)*/);
  if (!match) return null;
  const normalized = match[0]
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : null;
}

/**
 * Convierte unidades que Amazon mezcla en la misma columna: gramos, milímetros,
 * kW, kWh o minutos. Sin esto, «361 Gramos» se leería como 361 kg.
 */
function normalizeNumberSpec(key, value) {
  const text = stripAccents(cleanText(value)).toLowerCase();
  const number = parseSpecNumber(text);
  if (number === null) return null;
  let result = number;

  if (key === "peso_kg" || key === "carga_max_kg") {
    if (/\bgramos?\b/.test(text) || /\bg\b/.test(text)) result /= 1000;
  }
  if (key === "motor_w" && /\bkw\b/.test(text)) result *= 1000;
  if (key === "bateria_wh" && /\bkwh\b/.test(text)) result *= 1000;
  if (key === "tiempo_carga_h" && /\bmin(?:utos?)?\b/.test(text)) result /= 60;
  if (key === "ruedas_pulgadas") {
    if (/\bmilimetros?\b|\bmm\b/.test(text)) result /= 25.4;
    else if (/\bcentimetros?\b|\bcm\b/.test(text)) result /= 2.54;
  }

  return Math.round(result * 100) / 100;
}

function inRange(definition, value) {
  const range = definition?.range;
  if (!Array.isArray(range) || range.length !== 2) return true;
  return value >= range[0] && value <= range[1];
}

function parseSpecBoolean(value) {
  const text = stripAccents(cleanText(value)).toLowerCase();
  if (!text) return null;
  if (/^(si|s|true|incluido|incluye|con|yes)$/.test(text)) return true;
  if (/^(no|false|sin)\b/.test(text)) return false;
  if (/no incluid|sin |no dispone|fij[oa]/.test(text)) return false;
  if (/incluid|incorporad|con suspension|plegable|\bsi\b/.test(text)) return true;
  // Un texto descriptivo ("Suspensión delantera") implica que la función existe.
  return true;
}

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Recupera specs que Amazon no publica en la tabla técnica a partir del título
 * y de los bullets. Solo rellena huecos: el dato estructurado siempre gana.
 */
export function inferSpecsFromText(text, config) {
  const source = cleanText(text);
  if (!source) return {};
  const inferred = {};

  for (const [key, spec] of Object.entries(config.specs || {})) {
    const entries = (spec.infer || [])
      .map((entry) => (entry instanceof RegExp ? { re: entry } : entry))
      .filter((entry) => entry?.re instanceof RegExp);
    if (!entries.length) continue;

    if (spec.type === "boolean") {
      const negative = (spec.inferNegative || []).some((re) => re.test(source));
      if (negative) {
        inferred[key] = false;
      } else if (entries.some((entry) => entry.re.test(source))) {
        inferred[key] = true;
      }
      continue;
    }

    for (const entry of entries) {
      entry.re.lastIndex = 0;
      const match = entry.re.exec(source);
      if (!match) continue;

      if (entry.reject) {
        const context = source.slice(
          Math.max(0, match.index - 40),
          match.index + match[0].length
        );
        entry.reject.lastIndex = 0;
        if (entry.reject.test(context)) continue;
      }

      if (spec.type === "number") {
        const raw = entry.compute
          ? entry.compute(match)
          : parseSpecNumber(match[1] ?? match[0]);
        const value = Number(raw) * (Number(entry.factor) || 1);
        const rounded = Math.round(value * 10) / 10;
        if (Number.isFinite(value) && value > 0 && inRange(spec, rounded)) {
          inferred[key] = rounded;
        }
      } else {
        const value = cleanText(match[1] ?? match[0])
          .replace(/[.;,|]+$/, "")
          .trim();
        if (value) inferred[key] = value.slice(0, 80);
      }

      if (inferred[key] !== undefined) break;
    }
  }

  return inferred;
}

export function deriveModel(title, brand, hint) {
  let text = cleanText(title);
  if (brand) {
    text = text.replace(
      new RegExp(`^\\s*${escapeRegExp(brand)}\\s*[-–—:,]?\\s*`, "i"),
      ""
    );
  }
  // "Patinete eléctrico para adultos, " es genérico y no identifica el modelo.
  text = text.replace(
    /^(?:patinete|scooter)\s*(?:el[eé]ctrico|electrico)?\s*(?:(?:para\s+)?adultos?)?\s*[,:\-–—]?\s*/i,
    ""
  );
  text = text.split(/\s+[-–—]\s+|,\s+|;\s*|\||•/)[0];
  const scooterIndex = text.search(/\b(?:scooter|patinete)\b/i);
  if (scooterIndex > 10) text = text.slice(0, scooterIndex).trim();
  text = text.replace(/\bpatinete\b.*$/i, "").trim();
  text = text.replace(/\bpara\s+adultos?\b.*$/i, "").trim();
  text = text.replace(/\s+adultos?$/i, "").trim();
  text = text.replace(/^modelo\s+/i, "").trim();
  text = text.replace(/^[-–—:,]+\s*/, "").trim();
  if (brand && /^\d/.test(text)) text = `${brand} ${text}`;

  const generic = !text || /^para\b/i.test(text) || text.length > 45;
  const hintText = cleanText(hint);
  if (hintText && hintText.length <= 40) {
    const fromTitle = stripAccents(text).toLowerCase().replace(/[^a-z0-9]/g, "");
    const fromHint = stripAccents(hintText).toLowerCase().replace(/[^a-z0-9]/g, "");
    // La tabla suele ser más precisa cuando el título solo describe el uso.
    if (generic || (fromHint.length >= 2 && fromTitle && !fromTitle.includes(fromHint) && !fromHint.includes(fromTitle))) {
      text = hintText;
    }
  }

  if (!text) text = cleanText(title).slice(0, 60);
  return text.length > 60
    ? `${text.slice(0, 59).replace(/\s+\S*$/, "")}…`
    : text;
}

function cleanPros(bullets) {
  const seen = new Set();
  const pros = [];
  for (const bullet of bullets) {
    let text = cleanText(bullet).replace(/^[•\-–—]\s*/, "");
    if (text.length < 8) continue;
    const key = stripAccents(text).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (text.length > 180) {
      text = `${text.slice(0, 177).replace(/\s+\S*$/, "")}…`;
    }
    pros.push(text);
    if (pros.length >= 6) break;
  }
  return pros;
}

export function estimateScores(specifications, config) {
  const scores = {};
  const specsConfig = config.specs || {};

  for (const metric of config.scores || []) {
    const column = slugKey(metric.key);
    const fallback = Number.isFinite(Number(metric.default)) ? Number(metric.default) : 60;
    const rule = metric.derive;
    if (!rule || !rule.spec) {
      scores[column] = fallback;
      continue;
    }

    const raw =
      specifications[rule.spec] ??
      Object.entries(specifications).find(([key]) => key.includes(rule.spec))?.[1];
    if (raw == null) {
      scores[column] = fallback;
      continue;
    }

    if (rule.values) {
      if ((specsConfig[rule.spec]?.type || "") === "boolean") {
        const value = parseSpecBoolean(raw);
        scores[column] = value === null ? fallback : Number(rule.values[value] ?? fallback);
        continue;
      }
      const text = stripAccents(cleanText(raw)).toLowerCase();
      const matches = Object.entries(rule.values)
        .map(([label, value]) => [stripAccents(String(label)).toLowerCase(), value])
        .filter(([label]) => label.length > 2 && text.includes(label))
        .sort((a, b) => b[0].length - a[0].length);
      scores[column] = matches.length ? Number(matches[0][1]) : fallback;
      continue;
    }

    const number = parseSpecNumber(raw);
    if (number === null || !Number.isFinite(rule.min) || !Number.isFinite(rule.max)) {
      scores[column] = fallback;
      continue;
    }
    const ratio = (number - rule.min) / (rule.max - rule.min);
    scores[column] = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  }

  return scores;
}

export function readUrls(file) {
  const extension = path.extname(file).toLowerCase();
  if (extension === ".json") {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const items = Array.isArray(raw) ? raw : raw.items || [];
    return items.map((item) => (typeof item === "string" ? item : item.url)).filter(Boolean);
  }
  if (extension === ".txt") {
    return fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^https?:\/\//i.test(line));
  }

  const { XLSX } = loadDeps();
  const book = XLSX.readFile(file);
  const sheet = book.Sheets[book.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  if (!rows.length) return [];

  const header = rows[0].map((cell) => slugKey(cell));
  let column = header.findIndex((cell) => ["url", "enlace", "link", "amazon_url"].includes(cell));
  let start = 1;
  if (column < 0) {
    column = 0;
    start = /^https?:\/\//i.test(cleanText(rows[0][0])) ? 0 : 1;
  }

  return rows
    .slice(start)
    .map((row) => cleanText(row[column]))
    .filter((value) => /^https?:\/\//i.test(value));
}

async function scrapeProduct(page, url, aliasMap, amazonTag, host, config) {
  const debug = process.env.SCRAPE_DEBUG === "1";
  if (debug) console.log("  · goto");
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  if (debug) console.log("  · loaded");
  await delay(1200 + Math.random() * 1500);
  // El precio se inyecta después del HTML inicial: esperamos a que el nodo
  // exista Y tenga un número, no solo a que exista el contenedor.
  await page
    .waitForFunction(
      () => {
        const selectors = [
          "#corePrice_feature_div .a-price .a-offscreen",
          "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
          "#tp_price_block_total_price_ww .a-offscreen",
          "#priceblock_ourprice",
          ".a-price .a-offscreen",
        ];
        return selectors.some((selector) => {
          const text = document.querySelector(selector)?.textContent || "";
          return /\d/.test(text);
        });
      },
      { timeout: 8000, polling: 250 }
    )
    .catch(() => {});
  if (debug) console.log("  · price wait done");
  await delay(500);

  const html = await page.content();
  if (debug) console.log("  · html captured");
  const captcha = await page.evaluate(
    () =>
      Boolean(document.querySelector('form[action*="validateCaptcha"]')) ||
      /introduce los caracteres/i.test(document.body.innerText.slice(0, 800))
  );
  if (captcha || /validateCaptcha/i.test(html.slice(0, 20000))) {
    throw new Error("Amazon ha mostrado un captcha");
  }

  const raw = await page.evaluate(() => {
    const clean = (value) =>
      String(value || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const title = clean(document.querySelector("#productTitle")?.textContent);
    if (!title) return null;

    const brandRaw = clean(
      document.querySelector("#bylineInfo")?.textContent ||
        document.querySelector("#brand")?.textContent
    );
    const brand = brandRaw
      .replace(/^(visita la tienda de|marca|tienda de)\s*:?\s*/i, "")
      .trim();

    const priceText = (() => {
      const selectors = [
        "#corePrice_feature_div .a-price .a-offscreen",
        "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
        "#priceblock_ourprice",
        "#tp_price_block_total_price_ww .a-offscreen",
        ".a-price .a-offscreen",
      ];
      for (const selector of selectors) {
        const text = clean(document.querySelector(selector)?.textContent);
        if (/\d/.test(text)) return text;
      }
      return "";
    })();

    const ratingText = clean(
      document.querySelector("#acrPopover")?.getAttribute("title") ||
        document.querySelector("span[data-hook='rating-out-of-text']")?.textContent
    );

    const reviewsText = clean(document.querySelector("#acrCustomerReviewText")?.textContent);

    const bullets = Array.from(
      document.querySelectorAll("#feature-bullets li span.a-list-item")
    )
      .map((element) => clean(element.textContent))
      .filter((text) => text.length > 12);

    // Galería: imagen principal + miniaturas, sin duplicados ni píxeles vacíos.
    // Las URLs cambian de tamaño (`._AC_SX679_`) pero no de imagen: se agrupan.
    const baseImage = (src) => String(src || "").replace(/\._[A-Z0-9_,]+_\./, ".");
    const images = [];
    const dynamic = document.querySelector("#landingImage")?.getAttribute("data-a-dynamic-image");
    if (dynamic) {
      try {
        const parsed = JSON.parse(dynamic);
        const sorted = Object.entries(parsed).sort(
          (a, b) => (b[1]?.[0] || 0) - (a[1]?.[0] || 0)
        );
        for (const [src] of sorted) images.push(baseImage(src));
      } catch {
        /* ignore */
      }
    }
    for (const image of document.querySelectorAll("#altImages img")) {
      const src = image.getAttribute("src") || "";
      if (!src || /grey-pixel|transparent-pixel|sprite/i.test(src)) continue;
      images.push(baseImage(src));
    }

    // Especificaciones: tablas técnicas + resumen + bullets de detalle.
    // Amazon usa dos maquetaciones: `th` + `td` y filas con dos `td`.
    const specs = {};
    const pushSpec = (key, value) => {
      const label = clean(key).replace(/:$/, "");
      const content = clean(value);
      if (!label || !content || content.length > 320) return;
      if (/^(ver mas|ver más|ver todo|see more)$/i.test(content)) return;
      specs[label] = content;
    };

    const readCell = (cell) => {
      if (!cell) return "";
      const clone = cell.cloneNode(true);
      clone.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
      return clean(clone.textContent);
    };

    for (const row of document.querySelectorAll(
      "#productDetails_techSpec_section_1 tr, #productDetails_techSpec_section_2 tr, " +
        "#productDetails_detailBullets_sections1 tr, #productOverview_feature_div tr, " +
        "table.a-keyvalue.prodDetTable tr, table.a-normal.a-spacing-micro tr"
    )) {
      const header = row.querySelector("th");
      const cells = Array.from(row.querySelectorAll("td"));
      if (header) {
        pushSpec(readCell(header), readCell(cells[0]));
      } else if (cells.length >= 2) {
        pushSpec(readCell(cells[0]), readCell(cells[1]));
      }
    }

    for (const item of document.querySelectorAll("#detailBullets_feature_div li")) {
      const text = clean(item.textContent);
      const parts = text.split(/[:：]/);
      if (parts.length >= 2) pushSpec(parts[0], parts.slice(1).join(":"));
    }

    return {
      title,
      brand,
      priceText,
      ratingText,
      reviewsText,
      bullets,
      images: [...new Set(images)]
        .filter((src) => /^https?:\/\//.test(src))
        .slice(0, 8),
      specs,
    };
  });

  if (!raw) throw new Error("La ficha no tiene título (producto no disponible)");
  if (debug) console.log("  · evaluate done");

  const knownSpecs = new Set(Object.keys(config.specs || {}));
  const modelHint = Object.entries(raw.specs).find(([key]) =>
    /^(nombre del modelo|modelo)$/i.test(cleanText(key))
  )?.[1];
  const structured = {};
  for (const [rawKey, value] of Object.entries(raw.specs)) {
    const key = canonicalSpecKey(rawKey, aliasMap);
    if (!knownSpecs.has(key) || structured[key] !== undefined) continue;
    const definition = config.specs[key];
    if (definition?.type === "number") {
      const number = normalizeNumberSpec(key, value);
      if (number !== null && inRange(definition, number)) structured[key] = number;
    } else if (definition?.type === "boolean") {
      const bool = parseSpecBoolean(value);
      if (bool !== null) structured[key] = bool;
    } else {
      structured[key] = value;
    }
  }

  // Título + bullets + tabla: ahí viven autonomía, potencia, peso y frenos.
  const inferred = inferSpecsFromText(
    [raw.title, ...raw.bullets, ...Object.values(raw.specs)].join(" · "),
    config
  );
  const specifications = { ...inferred, ...structured };

  const asin = extractAsin(url);
  if (!asin) throw new Error(`No se pudo extraer el ASIN de ${url}`);
  if (debug) console.log("  · specs built");
  const tag = amazonTag ? `?tag=${encodeURIComponent(amazonTag)}&linkCode=ll1` : "";

  return {
    id: asin,
    asin,
    name: raw.title,
    brand: raw.brand || raw.title.split(" ")[0],
    model: deriveModel(raw.title, raw.brand, modelHint),
    price: parsePrice(raw.priceText),
    currency: "EUR",
    rating: parseRating(raw.ratingText),
    review_count: parseReviews(raw.reviewsText),
    image_src: raw.images[0] || null,
    gallery: raw.images,
    affiliate_url: `https://${host}/dp/${asin}${tag}`,
    pros: cleanPros(raw.bullets),
    cons: [],
    tags: [],
    specifications,
    ...estimateScores(specifications, config),
  };
}

export function toSqlRow(row, table, scoreColumns) {
  const q = (value) => (value == null ? "null" : `'${String(value).replace(/'/g, "''")}'`);
  const arr = (values) =>
    values?.length ? `array[${values.map(q).join(", ")}]` : `'{}'::text[]`;
  const columns = [
    "id",
    "asin",
    "name",
    "brand",
    "model",
    "price",
    "currency",
    "rating",
    "review_count",
    "image_src",
    "gallery",
    "affiliate_url",
    "pros",
    "cons",
    "tags",
    "specifications",
    ...scoreColumns,
  ];
  const values = [
    q(row.id),
    q(row.asin),
    q(row.name),
    q(row.brand),
    q(row.model),
    Number(row.price) || 0,
    q(row.currency),
    Number(row.rating) || 0,
    Number(row.review_count) || 0,
    q(row.image_src),
    arr(row.gallery),
    q(row.affiliate_url),
    arr(row.pros),
    arr(row.cons),
    arr(row.tags),
    `${q(JSON.stringify(row.specifications || {}))}::jsonb`,
    ...scoreColumns.map((column) =>
      Number.isFinite(Number(row[column])) ? Number(row[column]) : 60
    ),
  ];
  const updates = columns
    .filter((column) => !["id", "asin"].includes(column))
    // Las notas solo se escriben al insertar: una revisión editorial posterior
    // no debe perderse al actualizar precios o specs.
    .filter((column) => !scoreColumns.includes(column))
    .map((column) => `${column} = excluded.${column}`)
    .join(",\n    ");

  return (
    `insert into public.${table} (${columns.join(", ")}) values (${values.join(", ")})\n` +
    `on conflict (id) do update set\n    ${updates},\n    updated_at = now();`
  );
}

function writeSqlFile(rows, target, table, scoreColumns) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const sql = [
    `-- Datos generados por scrape-catalogo.mjs (${new Date().toISOString()})`,
    `-- Tabla: public.${table}`,
    "begin;",
    ...rows.map((row) => toSqlRow(row, table, scoreColumns)),
    "commit;",
    "",
  ].join("\n");
  fs.writeFileSync(target, sql, "utf8");
  console.log(`\n📝 SQL generado → ${target} (${rows.length} filas)`);
}

async function supabaseRequest(pathname, options = {}) {
  const url = process.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Para --push necesitas VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env"
    );
  }
  const response = await fetch(`${url}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  return response;
}

async function main() {
  loadEnvFile();
  const config = await loadConfig();
  const table = String(args.table || config.table || "products");
  const domain = String(config.site?.amazonDomain || "www.amazon.es")
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  const host = domain.startsWith("www.") ? domain : `www.${domain}`;
  const amazonTag = config.site?.amazonTag || process.env.VITE_AMAZON_TAG || "";
  const aliasMap = buildAliasMap(config);
  const scoreColumns = (config.scores || []).map((score) => slugKey(score.key));

  if (!fs.existsSync(inputPath)) {
    throw new Error(`No existe ${inputPath}. Genera el Excel en el paso 2.`);
  }
  let urls = [...new Set(readUrls(inputPath))];
  if (!urls.length) throw new Error("El Excel no contiene URLs válidas.");
  console.log(`📄 ${urls.length} URLs en ${path.basename(inputPath)}`);

  fs.mkdirSync(outDir, { recursive: true });
  let snapshot = { generatedAt: null, items: [] };
  if (fs.existsSync(snapshotPath) && !args.fresh) {
    try {
      snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
      snapshot.items = (Array.isArray(snapshot.items) ? snapshot.items : []).filter(
        (item) => item && item.id
      );
    } catch {
      snapshot = { generatedAt: null, items: [] };
    }
  }
  const byId = new Map(snapshot.items.map((item) => [item.id, item]));

  if (!amazonTag) {
    console.warn("⚠️  No hay tag de afiliado (site.amazonTag / VITE_AMAZON_TAG).");
  }

  const existingIds = new Set();
  if (onlyMissing || (push && !dryRun)) {
    const response = await supabaseRequest(`${table}?select=id`, { method: "GET" });
    const existing = await response.json();
    for (const row of existing) existingIds.add(row.id);
    if (onlyMissing) {
      const before = urls.length;
      urls = urls.filter((url) => !existingIds.has(extractAsin(url)));
      console.log(`🔄 --only-missing: ${before - urls.length} ya estaban en Supabase`);
    }
  }

  // Reanudar una tanda interrumpida sin volver a pedir las fichas ya guardadas.
  if (skipKnown) {
    const before = urls.length;
    urls = urls.filter((url) => !byId.has(extractAsin(url)));
    console.log(`🔄 --skip-known: ${before - urls.length} ya estaban en el snapshot`);
  }

  if (limit > 0) urls = urls.slice(0, limit);
  if (!urls.length) {
    console.log("No queda nada por scrapear.");
    if (makeSql) writeSqlFile([...byId.values()], sqlPath, table, scoreColumns);
    return;
  }

  const { puppeteer } = loadDeps();
  const browser = await puppeteer.launch({
    headless: !args.headful,
    protocolTimeout: 180000,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--lang=es-ES",
    ],
  });

  const results = [];
  const errors = [];

  // Amazon a veces navega o recarga la pestaña y deja el frame anterior
  // desconectado. Reutilizar esa pestaña rompe todos los productos siguientes:
  // se crea una limpia y se reintenta.
  const createPage = async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "accept-language": "es-ES,es;q=0.9,en;q=0.8" });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
    return page;
  };

  try {
    let page = await createPage();

    for (let index = 0; index < urls.length; index += 1) {
      const url = urls[index];
      const asin = extractAsin(url);
      console.log(`\n[${index + 1}/${urls.length}] ${asin || url}`);

      let product = null;
      let lastError = null;
      for (let attempt = 1; attempt <= 2 && !product; attempt += 1) {
        try {
          product = await scrapeProduct(page, url, aliasMap, amazonTag, host, config);
        } catch (error) {
          lastError = error;
          console.warn(`  intento ${attempt} fallido: ${error.message}`);
          const brokenPage =
            /detached|Session closed|Target closed|Protocol error|callFunctionOn timed out/i.test(
              error.message
            );
          if (brokenPage) {
            await page.close().catch(() => {});
            page = await createPage();
            await delay(2000);
          } else if (attempt < 2) {
            await delay(6000);
          }
        }
      }

      if (!product) {
        errors.push({ url, error: lastError?.message || "desconocido" });
        continue;
      }

      byId.set(product.id, product);
      results.push(product);
      snapshot = {
        generatedAt: new Date().toISOString(),
        items: [...byId.values()],
      };
      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8");
      console.log(
        `  ✅ ${product.name.slice(0, 60)} · ${product.price} € · ` +
          `${product.rating}★ (${product.review_count}) · ${Object.keys(product.specifications).length} specs`
      );

      if (push && !dryRun) {
        const payload = { ...product, id: product.id };
        const alreadyExists = existingIds.has(product.id);
        if (alreadyExists) {
          // Conserva las notas editoriales de una revisión anterior.
          for (const column of scoreColumns) delete payload[column];
        }
        await supabaseRequest(`${table}?on_conflict=id`, {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify([payload]),
        });
        console.log(
          alreadyExists
            ? "  ↑ actualizado en Supabase (notas conservadas)"
            : "  ↑ guardado en Supabase"
        );
      }

      await randomDelay();
    }
  } finally {
    await browser.close();
  }

  if (makeSql) writeSqlFile([...byId.values()], sqlPath, table, scoreColumns);

  console.log(`\n${dryRun ? "Simulación" : "Proceso"} terminado.`);
  console.log(`   Correctos: ${results.length}`);
  console.log(`   Errores:   ${errors.length}`);
  console.log(`   Snapshot:  ${snapshotPath}`);
  if (errors.length) {
    console.log("\nFallos:");
    for (const error of errors) console.log(` - ${error.url} → ${error.error}`);
    console.log("Vuelve a lanzar el script: reutiliza el snapshot y reintenta.");
  }
  if (!push && !makeSql && !dryRun) {
    console.log("\nNo se ha escrito en Supabase. Usa --push o --sql.");
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  main().catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exitCode = 1;
  });
}
