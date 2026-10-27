/**
 * generate-sitemap.mjs — se ejecuta en `prebuild`.
 *
 * Genera public/sitemap.xml y public/robots.txt con las rutas estáticas del
 * nicho y una URL por producto. Primero intenta Supabase; si no hay datos,
 * usa el snapshot local (src/data/productos.json) para no publicar un sitemap
 * sin fichas.
 */
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();

async function loadEnvFile() {
  const envPath = path.join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  const content = await readFile(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

await loadEnvFile();

const configPath = path.join(ROOT, "niche.config.mjs");
if (!existsSync(configPath)) {
  console.warn("Sitemap: no existe niche.config.mjs; se omiten las fichas.");
}
const config = existsSync(configPath)
  ? (await import(pathToFileURL(configPath).href)).default
  : { site: {}, category: { slug: "productos" }, table: "products" };

const SITE_URL = (process.env.VITE_SITE_URL || config.site?.url || "https://example.com").replace(
  /\/$/,
  ""
);
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TABLE = config.table || "products";
const CATEGORY_SLUG = config.category?.slug || "productos";

const missing = ["VITE_SITE_URL", "VITE_AMAZON_TAG", "VITE_CONTACT_EMAIL"].filter(
  (key) => !process.env[key]
);
if (missing.length) {
  console.log(
    `Aviso: faltan ${missing.join(", ")} en .env. Se usarán los valores de niche.config.mjs.`
  );
}

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: `/${CATEGORY_SLUG}`, priority: "0.9", changefreq: "weekly" },
  { path: "/comparador", priority: "0.6", changefreq: "monthly" },
  { path: "/categorias", priority: "0.7", changefreq: "monthly" },
  { path: "/ofertas", priority: "0.7", changefreq: "weekly" },
  { path: "/guia-2026", priority: "0.8", changefreq: "monthly" },
  { path: "/aviso-legal", priority: "0.2", changefreq: "yearly" },
];

async function fetchProducts() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${TABLE}?select=id,updated_at&order=price.asc`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`Supabase respondió ${response.status}`);
  return response.json();
}

async function loadLocalSnapshot() {
  const candidates = [
    path.join(ROOT, "src", "data", "productos.json"),
    path.join(ROOT, "datos", "productos.json"),
  ];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      const parsed = JSON.parse(await readFile(candidate, "utf8"));
      const items = Array.isArray(parsed) ? parsed : parsed?.items;
      if (Array.isArray(items) && items.length) return items;
    } catch {
      /* snapshot corrupto: se ignora */
    }
  }
  return [];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function urlEntry({ path: routePath, lastmod, priority = "0.6", changefreq = "monthly" }) {
  const location = `${SITE_URL}${routePath === "/" ? "/" : routePath}`;
  return [
    "  <url>",
    `    <loc>${escapeXml(location)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  let products = [];
  let source = "Supabase";

  try {
    products = await fetchProducts();
    console.log(`Sitemap: ${products.length} productos desde Supabase.`);
  } catch (error) {
    console.warn(`Sitemap: no se pudo consultar Supabase (${error.message}).`);
  }

  if (!products.length) {
    products = await loadLocalSnapshot();
    source = "snapshot local";
    console.log(`Sitemap: ${products.length} productos desde ${source}.`);
  }

  const seen = new Set();
  const productEntries = [];
  for (const product of products) {
    const id = product.id || product.asin;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    productEntries.push(
      urlEntry({
        path: `/producto/${encodeURIComponent(id)}`,
        lastmod: product.updated_at ? String(product.updated_at).slice(0, 10) : today,
        priority: "0.8",
        changefreq: "weekly",
      })
    );
  }

  const entries = [
    ...STATIC_ROUTES.map((route) => urlEntry({ ...route, lastmod: today })),
    ...productEntries,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  await writeFile(path.join(ROOT, "public", "sitemap.xml"), xml, "utf8");
  await writeFile(
    path.join(ROOT, "public", "robots.txt"),
    ["User-agent: *", "Allow: /", "", `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join("\n"),
    "utf8"
  );
  console.log(`Sitemap escrito: ${entries.length} URLs (${productEntries.length} fichas).`);
}

main().catch((error) => {
  console.error("Sitemap: error inesperado", error);
  process.exitCode = 0;
});
