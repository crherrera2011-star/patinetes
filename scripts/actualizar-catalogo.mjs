#!/usr/bin/env node
/**
 * actualizar-catalogo.mjs
 * ----------------------------------------------------------------------------
 * Actualización semanal del catálogo de patinetes en Supabase.
 *
 * Flujo:
 *   1. Lee las URLs de `datos/patinetes.xlsx` (o del archivo que se indique).
 *   2. Opcionalmente refresca precio, valoración, reseñas, imágenes y specs
 *      desde Amazon.es reutilizando `scripts/scrape-catalogo.mjs`.
 *   3. Conserva los datos editoriales que ya existen en Supabase (notas,
 *      etiquetas, textos y badges) y actualiza solo los campos volátiles.
 *   4. Valida el resultado (mínimo de productos, duplicados, datos esenciales).
 *   5. Llama a la función RPC `replace_products`, que borra e inserta todo el
 *      catálogo en una sola transacción.
 *
 * Uso local:
 *   node scripts/actualizar-catalogo.mjs --offline
 *   node scripts/actualizar-catalogo.mjs --offline --scrape --limit 2
 *   node scripts/actualizar-catalogo.mjs --dry-run --scrape
 *   node scripts/actualizar-catalogo.mjs --scrape
 *   node scripts/actualizar-catalogo.mjs --export datos/catalogo.exportado.json
 *
 * Requisitos:
 *   - supabase/migrations/001_replace_products.sql aplicado en Supabase.
 *   - SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para leer/escribir en Supabase.
 *   - AMAZON_ASSOCIATE_TAG es opcional; si no existe se usa el de
 *     niche.config.mjs.
 * ----------------------------------------------------------------------------
 */

import fs from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

const require = createRequire(import.meta.url);

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "datos");
const DEFAULT_INPUT = path.join(DATA_DIR, "patinetes.xlsx");
const SNAPSHOT_FILE = path.join(DATA_DIR, "catalogo.actualizado.json");
const BACKUP_FILE = path.join(DATA_DIR, "catalogo.anterior.json");
const LOG_FILE = path.join(DATA_DIR, "ultima-actualizacion.log");
// Snapshot base del proyecto (fallback local).
const LOCAL_SNAPSHOT = path.join(DATA_DIR, "productos.json");
// Snapshot aislado de esta ejecución: solo contiene lo scrapeado ahora.
const SCRAPE_DIR = path.join(DATA_DIR, "scrape-semanal");
const SCRAPE_SNAPSHOT = path.join(SCRAPE_DIR, "productos.json");

const MIN_PRODUCTS_DEFAULT = 8;
const RPC = "replace_products";
const SYNC_TABLE = "sync_runs";

const logLines = [];

function log(level, message) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}`;
  console.log(line);
  logLines.push(line);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clean = (value) => String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

const stripAccents = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const slugify = (value) =>
  stripAccents(clean(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = {
    input: null,
    dryRun: false,
    offline: false,
    scrape: false,
    limit: Infinity,
    strict: false,
    force: false,
    export: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--input":
        args.input = argv[++i];
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--offline":
        args.offline = true;
        break;
      case "--scrape":
        args.scrape = true;
        break;
      case "--no-scrape":
        args.scrape = false;
        break;
      case "--limit":
        args.limit = Number.parseInt(argv[++i], 10);
        break;
      case "--strict":
        args.strict = true;
        break;
      case "--force":
        args.force = true;
        break;
      case "--export":
        args.export =
          argv[i + 1] && !argv[i + 1].startsWith("-") ? argv[++i] : DEFAULT_INPUT.replace(/\.xlsx$/i, ".json");
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        if (arg.startsWith("--input=")) args.input = arg.slice("--input=".length);
        else if (arg.startsWith("--limit=")) args.limit = Number.parseInt(arg.slice("--limit=".length), 10);
        else if (arg.startsWith("--export=")) args.export = arg.slice("--export=".length);
        else if (!arg.startsWith("-")) args.input = arg;
        else throw new Error(`Opción desconocida: ${arg}. Usa --help para ver las opciones.`);
    }
  }

  if (!Number.isFinite(args.limit) || args.limit <= 0) args.limit = Infinity;
  return args;
}

function printHelp() {
  console.log(`
Actualizar catálogo de patinetes en Supabase

Uso:
  node scripts/actualizar-catalogo.mjs [opciones]

Opciones:
  --input <archivo>     Excel/JSON/TXT con las URLs. Por defecto datos/patinetes.xlsx.
  --scrape              Refresca desde Amazon todos los productos.
  --no-scrape           No visita Amazon; usa el catálogo actual y el snapshot local.
  --dry-run             Lee Supabase y valida, pero no escribe.
  --offline             No conecta con Supabase; valida y hace scraping opcional.
  --limit <n>           Procesa solo los primeros n productos (solo pruebas).
  --strict              Falla si algún scrape no se puede completar.
  --force               Permite arrancar con una tabla vacía o reducir el catálogo.
  --export [archivo]    Exporta el catálogo actual de Supabase a JSON.
  --help, -h            Muestra esta ayuda.

Ejemplos:
  node scripts/actualizar-catalogo.mjs --offline
  node scripts/actualizar-catalogo.mjs --offline --scrape --limit 2
  node scripts/actualizar-catalogo.mjs --dry-run --scrape
  node scripts/actualizar-catalogo.mjs --scrape
  node scripts/actualizar-catalogo.mjs --export
`);
}

// ---------------------------------------------------------------------------
// Entorno y Supabase
// ---------------------------------------------------------------------------
async function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    try {
      const text = await fs.readFile(path.join(ROOT, file), "utf8");
      for (const line of text.split(/\r?\n/)) {
        if (!line.trim() || /^\s*#/.test(line)) continue;
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[match[1]]) process.env[match[1]] = value;
      }
    } catch {
      // El archivo no existe: no es un error.
    }
  }
}

function looksLikeServiceRoleKey(key) {
  if (key.startsWith("sb_secret_")) return true;
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

function readSupabaseConfig() {
  const url = clean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const key = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!/^https:\/\/[^/]+\.supabase\.co\/?$/i.test(url)) {
    throw new Error(
      "SUPABASE_URL no es válida. Define SUPABASE_URL (o VITE_SUPABASE_URL) con la URL real del proyecto."
    );
  }

  if (!key || /^TU_/i.test(key) || key.length < 30) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY real. En GitHub debe ser un secret; en local, una variable de .env.local."
    );
  }

  if (!looksLikeServiceRoleKey(key)) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no parece una clave de service_role. No uses la clave anon/publishable para escribir."
    );
  }

  return { url: url.replace(/\/+$/, ""), key };
}

// ---------------------------------------------------------------------------
// Lectura de URLs y catálogo
// ---------------------------------------------------------------------------
async function readInputUrls(file) {
  const extension = path.extname(file).toLowerCase();

  if (extension === ".json") {
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.products || [];
    return items
      .map((item) => (typeof item === "string" ? item : item.url || item.affiliate_url))
      .filter(Boolean);
  }

  if (extension === ".txt") {
    const raw = await fs.readFile(file, "utf8");
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^https?:\/\//i.test(line));
  }

  const XLSX = require("xlsx");
  const book = XLSX.readFile(file);
  const sheet = book.Sheets[book.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
  if (!rows.length) return [];

  const header = rows[0].map((cell) => slugify(cell).replace(/-/g, "_"));
  let column = header.findIndex((cell) => ["url", "enlace", "link", "amazon_url"].includes(cell));
  let start = 1;
  if (column < 0) {
    column = 0;
    start = /^https?:\/\//i.test(clean(rows[0][0])) ? 0 : 1;
  }

  return rows
    .slice(start)
    .map((row) => clean(row[column]))
    .filter((value) => /^https?:\/\//i.test(value));
}

async function readJsonRows(file) {
  if (!existsSync(file)) return [];
  const parsed = JSON.parse(await fs.readFile(file, "utf8"));
  const rows = Array.isArray(parsed) ? parsed : parsed.items || parsed.products || [];
  return Array.isArray(rows) ? rows.filter((row) => row && (row.id || row.asin)) : [];
}

// ---------------------------------------------------------------------------
// Amazon
// ---------------------------------------------------------------------------
function extractAsin(url) {
  const text = clean(url);
  if (!text) return null;
  const match =
    text.match(/\/(?:dp|gp\/product|d)\/([A-Z0-9]{10})(?:[/?#]|$)/i) ||
    text.match(/[?&](?:asin|ASIN)=([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

function buildAffiliateUrl(url, tag, domain) {
  const asin = extractAsin(url);
  if (!asin) return clean(url);
  const canonical = new URL(`https://${domain}/dp/${asin}`);
  if (tag) canonical.searchParams.set("tag", tag);
  return canonical.toString();
}

// ---------------------------------------------------------------------------
// Scraper (reutiliza scripts/scrape-catalogo.mjs)
// ---------------------------------------------------------------------------
async function fileMtime(file) {
  try {
    return statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

async function runScraper({ input, config, limit }) {
  const script = path.join(ROOT, "scripts", "scrape-catalogo.mjs");
  const args = [
    script,
    "--input",
    input,
    "--config",
    config,
    "--out",
    SCRAPE_DIR,
    // Empieza vacío: el snapshot solo contiene lo que se scrapea en esta
    // ejecución. Así un fallo de Amazon no reutiliza datos antiguos.
    "--fresh",
  ];

  if (Number.isFinite(limit)) args.push("--limit", String(limit));
  if (process.env.SCRAPE_DELAY_SECONDS) {
    args.push("--delay", process.env.SCRAPE_DELAY_SECONDS);
  }

  // Sin restos de la ejecución anterior para que mtime detecte si hubo éxitos.
  await fs.rm(SCRAPE_SNAPSHOT, { force: true });
  const before = await fileMtime(SCRAPE_SNAPSHOT);

  log("info", "Refrescando productos desde Amazon.es...");
  const exitCode = await new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      env: process.env,
      stdio: "inherit",
    });
    child.on("error", (error) => {
      log("error", `No se pudo lanzar el scraper: ${error.message}`);
      resolve(1);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0) {
    throw new Error(`El scraper terminó con código ${exitCode}. No se toca Supabase.`);
  }

  const after = await fileMtime(SCRAPE_SNAPSHOT);
  return { changed: after !== before };
}

// ---------------------------------------------------------------------------
// Mezcla y validación
// ---------------------------------------------------------------------------
function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value ?? "").match(/-?\d+(?:[.,]\d+)*/);
  if (!match) return 0;
  const parsed = Number.parseFloat(match[0].replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function scoreValue(value) {
  // 0 es una nota editorial válida: solo se descartan null/undefined/vacío.
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function pickScore(primary, fallback) {
  const first = scoreValue(primary);
  if (first !== null) return first;
  return scoreValue(fallback);
}

function mergeRow({ baseline, scraped, url, asin, tag, domain, scoreColumns, now }) {
  if (!asin) {
    log("warn", `No se pudo identificar el ASIN de ${url}; se omite.`);
    return null;
  }

  if (!baseline && !scraped) {
    log("warn", `El producto ${asin} no está en Supabase ni se pudo scrapear; se omite.`);
    return null;
  }

  const name = clean(scraped?.name || baseline?.name);
  if (!name) {
    log("warn", `El producto ${asin} no tiene nombre; se omite.`);
    return null;
  }

  const affiliateUrl =
    clean(scraped?.affiliate_url) ||
    clean(baseline?.affiliate_url) ||
    buildAffiliateUrl(url, tag, domain);
  if (!affiliateUrl) {
    log("warn", `El producto ${asin} no tiene URL de afiliado; se omite.`);
    return null;
  }

  const scrapedPrice = toNumber(scraped?.price);
  const baselinePrice = toNumber(baseline?.price);
  const price = scrapedPrice > 0 ? scrapedPrice : baselinePrice;
  const slugBase = slugify(name).slice(0, 70);

  const row = {
    id: asin,
    asin,
    name,
    slug: clean(baseline?.slug) || (slugBase ? `${slugBase}-${asin.toLowerCase()}` : asin.toLowerCase()),
    brand: clean(scraped?.brand || baseline?.brand),
    model: clean(scraped?.model || baseline?.model),
    price: Math.max(0, price),
    currency: "EUR",
    rating: Math.max(0, Math.min(5, toNumber(scraped?.rating) || toNumber(baseline?.rating))),
    review_count: Math.max(
      0,
      Math.round(toNumber(scraped?.review_count) || toNumber(baseline?.review_count))
    ),
    image_src: clean(scraped?.image_src) || clean(baseline?.image_src) || null,
    gallery:
      Array.isArray(scraped?.gallery) && scraped.gallery.length
        ? scraped.gallery
        : Array.isArray(baseline?.gallery)
          ? baseline.gallery
          : [],
    affiliate_url: affiliateUrl,
    // Los bullets de Amazon se refrescan; si el scrape no los trae, se conservan.
    pros:
      Array.isArray(scraped?.pros) && scraped.pros.length
        ? scraped.pros
        : Array.isArray(baseline?.pros)
          ? baseline.pros
          : [],
    cons:
      Array.isArray(scraped?.cons) && scraped.cons.length
        ? scraped.cons
        : Array.isArray(baseline?.cons)
          ? baseline.cons
          : [],
    tags: Array.isArray(baseline?.tags) ? baseline.tags : [],
    ideal_for: clean(baseline?.ideal_for),
    reviews_summary: baseline?.reviews_summary || {},
    // Las specs nuevas ganan, pero no se pierden las que Amazon deje de publicar.
    specifications: {
      ...(baseline?.specifications && typeof baseline.specifications === "object"
        ? baseline.specifications
        : {}),
      ...(scraped?.specifications && typeof scraped.specifications === "object"
        ? scraped.specifications
        : {}),
    },
    badge: clean(baseline?.badge),
    badge_color: clean(baseline?.badge_color),
    created_at: baseline?.created_at || now,
    updated_at: now,
  };

  // Las notas son editoriales: una actualización de precio o specs no las pisa.
  for (const column of scoreColumns) {
    row[column] = pickScore(baseline?.[column], scraped?.[column]);
  }

  return row;
}

function validateCatalog(rows, baselineCount, force, minProducts) {
  if (!rows.length) {
    throw new Error("Ningún producto ha pasado la validación. No se tocará Supabase.");
  }

  if (Number.isFinite(minProducts) && minProducts > 0 && rows.length < minProducts && !force) {
    throw new Error(
      `El nuevo catálogo tiene ${rows.length} productos y el mínimo configurado es ${minProducts}. No se ha borrado nada. Usa --force si es intencionado.`
    );
  }

  if (!force && baselineCount >= 4 && rows.length < Math.ceil(baselineCount / 2)) {
    throw new Error(
      `El nuevo catálogo tiene ${rows.length} productos frente a ${baselineCount} actuales. Si es intencionado, repite con --force. No se ha borrado nada.`
    );
  }

  const ids = new Set();
  for (const row of rows) {
    if (!clean(row.id)) throw new Error("Hay un producto sin id/ASIN. No se tocará Supabase.");
    if (!clean(row.name)) throw new Error(`El producto ${row.id} no tiene nombre. No se tocará Supabase.`);
    if (!clean(row.affiliate_url)) {
      throw new Error(`El producto ${row.id} no tiene URL de afiliado. No se tocará Supabase.`);
    }
    if (ids.has(row.id)) throw new Error(`El ASIN ${row.id} está duplicado. No se tocará Supabase.`);
    ids.add(row.id);
  }

  return true;
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------
async function fetchCurrentRows(supabase, table) {
  const { data, error } = await supabase.from(table).select("*").order("id");
  if (error) {
    throw new Error(
      `No se pudo leer ${table}: ${error.message}. Comprueba SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.`
    );
  }
  return data ?? [];
}

async function startRun(supabase, source, productsReceived, details) {
  const { data, error } = await supabase
    .from(SYNC_TABLE)
    .insert({ status: "running", source, products_received: productsReceived, details })
    .select("id")
    .single();

  if (error) {
    if (/could not find the table|relation .* does not exist/i.test(error.message)) {
      log(
        "warn",
        `La tabla ${SYNC_TABLE} no existe. Ejecuta supabase/migrations/001_replace_products.sql para tener histórico.`
      );
    } else {
      log("warn", `No se pudo registrar el inicio de la ejecución: ${error.message}`);
    }
    return null;
  }

  return data?.id ?? null;
}

async function finishRun(supabase, runId, payload) {
  if (!runId) return;
  const { error } = await supabase
    .from(SYNC_TABLE)
    .update({ finished_at: new Date().toISOString(), ...payload })
    .eq("id", runId);
  if (error) log("warn", `No se pudo cerrar el registro de ejecución: ${error.message}`);
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  await loadEnvFiles();

  if (args.limit !== Infinity && !args.dryRun && !args.offline && !args.force) {
    throw new Error(
      "--limit es solo para pruebas. Combínalo con --dry-run/--offline, o añade --force si de verdad quieres reemplazar el catálogo por solo esos productos."
    );
  }

  const configPath = path.join(ROOT, "niche.config.mjs");
  const config = existsSync(configPath)
    ? (await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`)).default
    : {};
  const table = config.table || "products";
  const domain = clean(config.site?.amazonDomain || "www.amazon.es")
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
  const amazonTag = clean(process.env.AMAZON_ASSOCIATE_TAG) || clean(config.site?.amazonTag);
  const scoreColumns = (config.scores || []).map((metric) => metric.key);
  const minProducts = Number.parseInt(process.env.MIN_PRODUCTS ?? String(MIN_PRODUCTS_DEFAULT), 10);

  let supabase = null;
  if (args.offline) {
    if (args.export) throw new Error("--export necesita conexión a Supabase; no lo combines con --offline.");
    log("info", "Modo offline: se valida el catálogo sin conectar a Supabase.");
  } else {
    const { url, key } = readSupabaseConfig();
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (args.export) {
    log("info", "Exportando catálogo actual de Supabase...");
    const rows = await fetchCurrentRows(supabase, table);
    const file = path.resolve(ROOT, args.export);
    await writeJson(file, rows);
    log("ok", `Exportadas ${rows.length} filas a ${path.relative(ROOT, file)}.`);
    return;
  }

  const inputFile = path.resolve(ROOT, args.input || DEFAULT_INPUT);
  if (!existsSync(inputFile)) {
    throw new Error(`No existe ${path.relative(ROOT, inputFile)}. Indica la ruta con --input.`);
  }

  let urls = await readInputUrls(inputFile);
  urls = [...new Set(urls)];
  if (!urls.length) throw new Error(`${path.relative(ROOT, inputFile)} no contiene URLs válidas.`);
  log("info", `Entrada: ${path.relative(ROOT, inputFile)} (${urls.length} URLs).`);

  // Catálogo actual: Supabase en modo online, snapshot local en offline.
  let currentRows = [];
  if (args.offline) {
    currentRows = await readJsonRows(LOCAL_SNAPSHOT);
    log("info", `Catálogo local de referencia: ${currentRows.length} productos.`);
  } else {
    currentRows = await fetchCurrentRows(supabase, table);
    if (!currentRows.length) {
      if (!args.force) {
        throw new Error(
          `La tabla ${table} está vacía. Si quieres inicializarla desde ${path.relative(ROOT, inputFile)}, repite con --force.`
        );
      }
      log("warn", `La tabla ${table} está vacía; se inicializa desde cero.`);
    } else {
      await writeJson(BACKUP_FILE, currentRows);
      log(
        "info",
        `Copia de seguridad: ${path.relative(ROOT, BACKUP_FILE)} (${currentRows.length} filas).`
      );
    }
  }

  const baselineByAsin = new Map();
  for (const row of currentRows) {
    const asin = clean(row.asin) || clean(row.id) || extractAsin(row.affiliate_url);
    if (asin) baselineByAsin.set(asin.toUpperCase(), row);
  }

  if (args.scrape) {
    const { changed } = await runScraper({
      input: inputFile,
      config: configPath,
      limit: args.limit,
    });
    if (!changed && !args.force) {
      throw new Error(
        "No se pudo refrescar ningún producto desde Amazon. No se toca Supabase. Revisa la conexión o usa --force si solo quieres reaplicar el catálogo actual."
      );
    }
    // Pequeña pausa para que el sistema de archivos asiente el snapshot.
    await sleep(150);
  } else {
    log("info", "Sin scraping: se usan los datos actuales y el snapshot local.");
  }

  const scrapedRows = args.scrape ? await readJsonRows(SCRAPE_SNAPSHOT) : [];
  const scrapedByAsin = new Map();
  for (const row of scrapedRows) {
    const asin = clean(row.asin) || clean(row.id);
    if (asin) scrapedByAsin.set(asin.toUpperCase(), row);
  }
  log(
    "info",
    args.scrape
      ? `Scrapeados en esta ejecución: ${scrapedByAsin.size} productos.`
      : "Sin scraping: se conservan los datos actuales del catálogo."
  );

  const limitedUrls = urls.slice(0, args.limit);
  const now = new Date().toISOString();
  const rows = [];
  const seen = new Set();
  let scrapeErrors = 0;

  for (const url of limitedUrls) {
    const asin = extractAsin(url);
    const scraped = asin ? scrapedByAsin.get(asin) : null;
    const baseline = asin ? baselineByAsin.get(asin) : null;
    if (args.scrape && !scraped) scrapeErrors += 1;

    const row = mergeRow({
      baseline,
      scraped,
      url,
      asin,
      tag: amazonTag,
      domain,
      scoreColumns,
      now,
    });
    if (!row) continue;
    if (seen.has(row.id)) {
      log("warn", `ASIN duplicado ${row.id}; se omite.`);
      continue;
    }
    seen.add(row.id);
    rows.push(row);
  }

  if (scrapeErrors > 0) {
    log(
      "warn",
      `${scrapeErrors} producto(s) no se pudieron refrescar desde Amazon; se conservan sus datos actuales.`
    );
  }

  validateCatalog(rows, currentRows.length, args.force, minProducts);
  await writeJson(SNAPSHOT_FILE, rows);
  log("info", `Snapshot del nuevo catálogo: ${path.relative(ROOT, SNAPSHOT_FILE)} (${rows.length} filas).`);

  if (scrapeErrors > 0 && args.strict) {
    throw new Error(`${scrapeErrors} scrape(s) fallaron y se usó --strict.`);
  }

  if (args.offline || args.dryRun) {
    log(
      "info",
      args.offline
        ? "Offline: no se ha conectado a Supabase; solo se ha validado el catálogo."
        : "Dry-run: no se ha borrado ni insertado nada en Supabase."
    );
    log("info", "Primeros productos que se insertarían:");
    rows.slice(0, 5).forEach((row) => log("info", `  · ${row.id} | ${row.name} | ${row.price} €`));
    return;
  }

  const runId = await startRun(supabase, path.basename(inputFile), rows.length, {
    scrape: args.scrape,
    limit: args.limit === Infinity ? null : args.limit,
    node: process.version,
  });

  log("info", `Reemplazando el catálogo en Supabase (${table})...`);
  const { data: inserted, error } = await supabase.rpc(RPC, { p_rows: rows });

  if (error) {
    await finishRun(supabase, runId, {
      status: "error",
      products_inserted: 0,
      message: error.message,
      details: { code: error.code, hint: error.hint },
    });

    if (error.code === "PGRST202" || /function .* does not exist/i.test(error.message)) {
      throw new Error(
        "La función replace_products no existe. Ejecuta supabase/migrations/001_replace_products.sql en Supabase → SQL Editor."
      );
    }

    throw new Error(`Supabase rechazó el reemplazo: ${error.message}`);
  }

  await finishRun(supabase, runId, {
    status: "success",
    products_inserted: inserted ?? rows.length,
    message: `Catálogo reemplazado con ${rows.length} productos.`,
  });

  log("ok", `Catálogo reemplazado: ${inserted ?? rows.length} filas insertadas.`);
}

let exitCode = 0;

try {
  await main();
} catch (error) {
  log("error", error.message);
  exitCode = 1;
} finally {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(LOG_FILE, `${logLines.join("\n")}\n`, "utf8");
  } catch {
    // Si no se puede escribir el log, no ocultamos el error principal.
  }
}

process.exitCode = exitCode;
