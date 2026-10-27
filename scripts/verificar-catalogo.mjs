#!/usr/bin/env node
/**
 * verificar-catalogo.mjs — control de calidad del snapshot.
 *
 * Lee datos/productos.json (o el JSON que generes con --sql/--push) y comprueba
 * que el catálogo es publicable: ASINs únicos, precios, specs, imágenes, notas
 * y enlaces de afiliado.
 *
 * Uso:
 *   node scripts/verificar-catalogo.mjs
 *   node scripts/verificar-catalogo.mjs --input datos/productos.json
 *   node scripts/verificar-catalogo.mjs --strict
 *
 * Código de salida: 1 si hay errores críticos (o warnings con --strict).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

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

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(String(args.input || "datos/productos.json"));
const configPath = path.resolve(String(args.config || "niche.config.mjs"));
const strict = Boolean(args.strict);

const snake = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function loadItems(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`No existe ${file}. Ejecuta primero scrape-catalogo.mjs.`);
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const items = Array.isArray(raw) ? raw : raw.items;
  if (!Array.isArray(items)) throw new Error("El JSON no contiene un array `items`.");
  return items;
}

async function loadConfig() {
  if (!fs.existsSync(configPath)) return null;
  const module = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
  return module.default || module.config || null;
}

const config = await loadConfig();
const items = loadItems(inputPath);
const scoreKeys = (config?.scores || []).map((score) => snake(score.key));
const expectedTag = config?.site?.amazonTag || process.env.VITE_AMAZON_TAG || "";

const errors = [];
const warnings = [];
const perProduct = [];

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const isHttp = (value) => /^https?:\/\//i.test(String(value || ""));
const parsePrice = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value ?? "").match(/-?\d+(?:[.,]\d+)*/);
  if (!match) return 0;
  const number = Number.parseFloat(
    match[0].replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")
  );
  return Number.isFinite(number) ? number : 0;
};

const seenIds = new Set();
const seenAsins = new Set();
const prices = [];

for (const [index, item] of items.entries()) {
  const position = index + 1;
  const id = clean(item.id || item.asin);
  const name = clean(item.name);
  const price = parsePrice(item.price);
  const rating = Number(item.rating) || 0;
  const reviews = Number(item.review_count ?? item.reviewCount) || 0;
  const specs =
    item.specifications && typeof item.specifications === "object"
      ? Object.keys(item.specifications)
      : [];
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
  const url = clean(item.affiliate_url || item.affiliateUrl);

  const localErrors = [];
  const localWarnings = [];

  if (!id) localErrors.push("sin id/ASIN");
  if (id && !/^[A-Z0-9]{10}$/i.test(id)) localWarnings.push(`ASIN con formato raro: ${id}`);
  if (id && seenIds.has(id)) localErrors.push(`id duplicado: ${id}`);
  if (id) seenIds.add(id);
  if (item.asin && seenAsins.has(item.asin)) localErrors.push(`ASIN duplicado: ${item.asin}`);
  if (item.asin) seenAsins.add(item.asin);

  if (!name) localErrors.push("sin nombre");
  if (/captcha|introduce los caracteres|robot/i.test(name)) localErrors.push("el nombre parece un captcha");
  if (/^amazon\.es$/i.test(name)) localErrors.push("el nombre es la home de Amazon");

  if (!price) localErrors.push("precio 0 o inválido");
  else prices.push(price);

  if (rating < 0 || rating > 5) localErrors.push(`rating fuera de rango: ${rating}`);
  if (reviews < 0 || !Number.isFinite(reviews)) localErrors.push(`reseñas inválidas: ${reviews}`);
  if (reviews === 0 && rating > 0) localWarnings.push("rating sin reseñas");

  if (specs.length < 5) localWarnings.push(`solo ${specs.length} specs`);
  if (gallery.length < 3) localWarnings.push(`solo ${gallery.length} imágenes`);

  if (!url) localWarnings.push("sin URL de afiliado");
  else {
    if (!isHttp(url)) localWarnings.push("URL de afiliado no es http(s)");
    if (expectedTag && !url.includes(`tag=${expectedTag}`)) {
      localWarnings.push(`la URL no lleva tag=${expectedTag}`);
    }
    if (expectedTag && url.includes("tag=tucodigo-21") && expectedTag !== "tucodigo-21") {
      localErrors.push("la URL conserva el tag placeholder tucodigo-21");
    }
  }

  for (const key of scoreKeys) {
    const value = item[key];
    if (value === undefined || value === null || value === "") {
      localWarnings.push(`falta la nota ${key}`);
    } else if (!Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > 100) {
      localErrors.push(`nota ${key} fuera de 0-100: ${value}`);
    }
  }
  if (scoreKeys.length && scoreKeys.every((key) => Number(item[key]) === 60)) {
    localWarnings.push("todas las notas son 60 (posible falta de specs)");
  }

  for (const error of localErrors) errors.push(`${id || `#${position}`}: ${error}`);
  for (const warning of localWarnings) warnings.push(`${id || `#${position}`}: ${warning}`);
  if (localErrors.length || localWarnings.length) perProduct.push({ id, localErrors, localWarnings });
}

// Precio atípico frente a la mediana del propio catálogo.
const sorted = [...prices].sort((a, b) => a - b);
const medianPrice = sorted.length
  ? sorted.length % 2
    ? sorted[Math.floor(sorted.length / 2)]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
  : 0;

for (const item of items) {
  const price = parsePrice(item.price);
  if (!price || !medianPrice) continue;
  if (price > medianPrice * 3) {
    warnings.push(`${item.id}: precio ${price} € es >3× la mediana (${medianPrice} €)`);
  }
  if (price < medianPrice * 0.3) {
    warnings.push(`${item.id}: precio ${price} € es <0,3× la mediana (${medianPrice} €)`);
  }
}

// ---------------------------------------------------------------- informe
const total = items.length;
const withPrice = items.filter((item) => parsePrice(item.price) > 0).length;
const withSpecs = items.filter(
  (item) => item.specifications && Object.keys(item.specifications).length >= 5
).length;
const withImages = items.filter(
  (item) => Array.isArray(item.gallery) && item.gallery.length >= 3
).length;
const withReviews = items.filter((item) => Number(item.review_count ?? item.reviewCount) > 0).length;

const percent = (value) => (total ? Math.round((value / total) * 100) : 0);

console.log(`Catálogo: ${inputPath}`);
console.log(`Productos: ${total}`);
console.log(`  con precio:  ${withPrice} (${percent(withPrice)} %)`);
console.log(`  con specs:   ${withSpecs} (${percent(withSpecs)} %)`);
console.log(`  con imágenes:${withImages} (${percent(withImages)} %)`);
console.log(`  con reseñas: ${withReviews} (${percent(withReviews)} %)`);
console.log(`  mediana:     ${medianPrice ? `${medianPrice.toFixed(2)} €` : "—"}`);

if (perProduct.length) {
  console.log("\nIncidencias por producto:");
  for (const entry of perProduct.slice(0, 25)) {
    console.log(`  ${entry.id || "(sin id)"}`);
    for (const error of entry.localErrors) console.log(`    ✗ ${error}`);
    for (const warning of entry.localWarnings.slice(0, 6)) console.log(`    ! ${warning}`);
  }
  if (perProduct.length > 25) {
    console.log(`  ... y ${perProduct.length - 25} productos más con incidencias.`);
  }
}

if (errors.length) {
  console.log(`\nErrores críticos (${errors.length}):`);
  for (const error of errors.slice(0, 40)) console.log(`  ✗ ${error}`);
}

if (warnings.length) {
  console.log(`\nAvisos (${warnings.length}):`);
  for (const warning of warnings.slice(0, 40)) console.log(`  ! ${warning}`);
}

const coverageOk = total >= 16 && percent(withPrice) >= 90 && percent(withSpecs) >= 80;
if (!total) {
  console.log("\n✗ No hay productos. El catálogo no es publicable.");
  process.exitCode = 1;
} else if (errors.length || (strict && warnings.length)) {
  console.log("\n✗ Hay errores críticos. Corrige antes de publicar.");
  process.exitCode = 1;
} else if (!coverageOk) {
  console.log("\n! Cobertura baja: revisa precios y specs antes de publicar.");
  process.exitCode = strict ? 1 : 0;
} else {
  console.log("\n✓ Catálogo apto para publicar (revisa igualmente 3 fichas a mano).");
}
