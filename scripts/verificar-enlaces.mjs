#!/usr/bin/env node
/**
 * verificar-enlaces.mjs — comprueba los enlaces de afiliado del catálogo.
 *
 * Para cada producto:
 *   1. Valida la estructura de la URL (dominio, /dp/ASIN y tag de afiliado).
 *   2. Hace una petición HTTP con aspecto de navegador.
 *   3. Distingue entre enlace roto, redirección sospechosa y bloqueo antirrobot.
 *
 * Amazon bloquea muchas peticiones automatizadas. Un 429/503 o una página de
 * captcha se marca como «bloqueado», no como error: no sabemos si el enlace
 * está bien, pero tampoco lo damos por roto.
 *
 * Uso:
 *   node scripts/verificar-enlaces.mjs
 *   node scripts/verificar-enlaces.mjs --input datos/catalogo.actualizado.json
 *   node scripts/verificar-enlaces.mjs --limit 5 --json datos/enlaces.json
 *   node scripts/verificar-enlaces.mjs --markdown datos/enlaces.md
 *
 * Código de salida: 1 si hay enlaces claramente rotos (404, ASIN distinto,
 * URL mal formada). Los avisos y los bloqueos no hacen fallar el proceso salvo
 * que se pase --fail-on-warning.
 */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const CAPTCHA =
  /(api-services-support@amazon\.com|introduce los caracteres|type the characters|enter the characters|robot check|no soy un robot|sorry, we just need to make sure)/i;

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

async function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    const target = path.join(ROOT, file);
    if (!existsSync(target)) continue;
    const text = await fs.readFile(target, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
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
  }
}

function extractAsin(value) {
  const match = String(value || "").match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : "";
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function structuralCheck(item, { tag, domain }) {
  const errors = [];
  const warnings = [];
  const url = clean(item.affiliate_url || item.affiliateUrl);

  if (!url) {
    return { errors: ["sin URL de afiliado"], warnings };
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { errors: ["la URL no es válida"], warnings };
  }

  const host = parsed.hostname.toLowerCase();
  const expectedHost = String(domain || "www.amazon.es").toLowerCase();
  if (!/(^|\.)amazon\./i.test(host) && host !== expectedHost) {
    warnings.push(`dominio inesperado: ${host}`);
  }
  if (!/^https:$/i.test(parsed.protocol)) {
    warnings.push("la URL no usa HTTPS");
  }

  const urlAsin = extractAsin(url);
  const itemAsin = clean(item.asin || item.id).toUpperCase();
  if (!urlAsin) {
    errors.push("la URL no contiene /dp/ASIN");
  } else if (itemAsin && urlAsin !== itemAsin) {
    errors.push(`la URL apunta a ${urlAsin} y la ficha es ${itemAsin}`);
  }

  const urlTag = clean(parsed.searchParams.get("tag"));
  if (tag && urlTag !== tag) {
    warnings.push(`tag=${urlTag || "(ninguno)"} en vez de ${tag}`);
  }

  return { errors, warnings };
}

async function fetchPage(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": UA,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "es-ES,es;q=0.9,en;q=0.6",
        "cache-control": "no-cache",
      },
    });
    const body = await response.text();
    return { status: response.status, finalUrl: response.url, body };
  } finally {
    clearTimeout(timer);
  }
}

function classify(item, response) {
  const { status, finalUrl, body } = response;
  const itemAsin = clean(item.asin || item.id).toUpperCase();

  if (status === 404 || status === 410) {
    return { state: "error", detail: `HTTP ${status}` };
  }
  if (status === 429 || status === 503) {
    return { state: "blocked", detail: `HTTP ${status} (control antirrobot)` };
  }
  if (status >= 500) {
    return { state: "unknown", detail: `HTTP ${status}` };
  }
  if (CAPTCHA.test(body)) {
    return { state: "blocked", detail: "captcha de Amazon" };
  }

  const finalAsin = extractAsin(finalUrl);
  if (finalAsin && itemAsin && finalAsin !== itemAsin) {
    return { state: "error", detail: `redirige al ASIN ${finalAsin}` };
  }
  if (/\/errors\//i.test(finalUrl)) {
    return { state: "error", detail: "redirige a la página de errores de Amazon" };
  }
  if (status >= 400) {
    return { state: "error", detail: `HTTP ${status}` };
  }
  if (itemAsin && !body.toUpperCase().includes(itemAsin)) {
    return { state: "warning", detail: "la página no contiene el ASIN" };
  }
  // El stock no se comprueba a propósito: Amazon muestra «No disponible» en
  // recomendaciones y plantillas ocultas, y generaría falsos positivos.
  return { state: "ok", detail: `HTTP ${status}` };
}

async function loadFromSupabase({ url, key, table }) {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/${table}?select=id,asin,affiliate_url,name,price&order=price.asc`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase respondió ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json();
}

async function loadItems(args, config) {
  if (args.input) {
    const file = path.resolve(ROOT, String(args.input));
    if (!existsSync(file)) throw new Error(`No existe ${file}.`);
    const raw = JSON.parse(await fs.readFile(file, "utf8"));
    const items = Array.isArray(raw) ? raw : raw.items;
    if (!Array.isArray(items)) throw new Error("El JSON no contiene un array `items`.");
    return items;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "";
  if (!url || !key) {
    throw new Error(
      "Faltan SUPABASE_URL y una clave (service_role o anon). También puedes pasar --input con un JSON."
    );
  }
  return loadFromSupabase({ url, key, table: config.table || "products" });
}

async function runPool(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

async function writeReport(file, data) {
  const target = path.resolve(ROOT, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return target;
}

function markdownReport(results, config) {
  const counts = results.reduce(
    (acc, item) => {
      acc[item.state] = (acc[item.state] || 0) + 1;
      return acc;
    },
    { ok: 0, warning: 0, blocked: 0, unknown: 0, error: 0 }
  );
  const icon = { ok: "✅", warning: "⚠️", blocked: "🤖", unknown: "❔", error: "❌" };
  const lines = [
    "## Verificación de enlaces de afiliado",
    "",
    `- Fecha: ${new Date().toISOString()}`,
    `- Dominio: ${config.site?.amazonDomain || "www.amazon.es"}`,
    `- Productos: ${results.length}`,
    `- OK: ${counts.ok} · Avisos: ${counts.warning} · Bloqueados: ${counts.blocked} · Errores: ${counts.error}`,
    "",
  ];

  if (counts.error > 0 || counts.warning > 0 || counts.blocked > 0) {
    lines.push("| ASIN | Modelo | Estado | Detalle |");
    lines.push("| --- | --- | --- | --- |");
    for (const item of results) {
      if (item.state === "ok") continue;
      const name = String(item.name || "").replace(/\|/g, "\\|").slice(0, 60);
      lines.push(`| ${item.asin || item.id || "—"} | ${name} | ${icon[item.state]} ${item.state} | ${item.detail} |`);
    }
    lines.push("");
  }

  lines.push(
    "> Los bloqueos antirrobot no cuentan como enlace roto: Amazon no siempre permite comprobar sus páginas desde un servidor."
  );
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(
      "Uso: node scripts/verificar-enlaces.mjs [--input file.json] [--limit N] [--json out.json] [--markdown out.md] [--fail-on-warning]"
    );
    return;
  }

  await loadEnvFiles();

  const configPath = path.join(ROOT, "niche.config.mjs");
  const config = existsSync(configPath)
    ? (await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`)).default
    : {};
  const tag = clean(process.env.AMAZON_ASSOCIATE_TAG) || clean(config.site?.amazonTag);
  const domain = clean(config.site?.amazonDomain) || "www.amazon.es";

  let items = await loadItems(args, config);
  items = items.filter((item) => clean(item.asin || item.id));

  const limit = Number.parseInt(args.limit ?? "", 10);
  if (Number.isFinite(limit) && limit > 0) items = items.slice(0, limit);

  if (!items.length) {
    console.log("No hay enlaces que verificar.");
    return;
  }

  const timeoutMs = Math.max(3000, Number.parseInt(args.timeout ?? "15000", 10) || 15000);
  const concurrency = Math.max(1, Number.parseInt(args.concurrency ?? "2", 10) || 2);
  const delayMs = Math.max(0, Number.parseInt(args.delay ?? "1200", 10) || 0);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  console.log(`Verificando ${items.length} enlaces de ${domain}...`);

  const results = await runPool(items, concurrency, async (item) => {
    const base = {
      asin: clean(item.asin || item.id),
      name: clean(item.name),
      price: Number(item.price) || 0,
      url: clean(item.affiliate_url || item.affiliateUrl),
    };
    const structural = structuralCheck(item, { tag, domain });
    if (structural.errors.length) {
      return { ...base, state: "error", detail: structural.errors.join("; "), warnings: structural.warnings };
    }

    await sleep(delayMs);
    try {
      const response = await fetchPage(base.url, timeoutMs);
      const verdict = classify(item, response);
      return {
        ...base,
        ...verdict,
        finalUrl: response.finalUrl,
        warnings: structural.warnings,
      };
    } catch (error) {
      const aborted = error?.name === "AbortError";
      return {
        ...base,
        state: "unknown",
        detail: aborted ? `sin respuesta en ${Math.round(timeoutMs / 1000)} s` : error.message,
        warnings: structural.warnings,
      };
    }
  });

  const counts = results.reduce(
    (acc, item) => {
      acc[item.state] = (acc[item.state] || 0) + 1;
      return acc;
    },
    { ok: 0, warning: 0, blocked: 0, unknown: 0, error: 0 }
  );

  const icon = { ok: "✓", warning: "!", blocked: "·", unknown: "?", error: "✗" };
  for (const item of results) {
    const warnings = item.warnings?.length ? ` [${item.warnings.join("; ")}]` : "";
    console.log(`  ${icon[item.state]} ${item.asin || "(sin ASIN)"} ${item.state}: ${item.detail}${warnings}`);
  }

  console.log(
    `\nResumen: ${counts.ok} correctos · ${counts.warning} avisos · ${counts.blocked} bloqueados · ${counts.unknown} sin verificar · ${counts.error} errores.`
  );
  if (counts.blocked > 0) {
    console.log(
      "Los bloqueados no se consideran rotos: Amazon ha respondido con un control antirrobot."
    );
  }

  if (args.json) {
    const file = await writeReport(String(args.json), {
      checkedAt: new Date().toISOString(),
      domain,
      counts,
      results,
    });
    console.log(`Informe JSON: ${path.relative(ROOT, file)}`);
  }

  if (args.markdown) {
    const file = path.resolve(ROOT, String(args.markdown));
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, markdownReport(results, config), "utf8");
    console.log(`Informe Markdown: ${path.relative(ROOT, file)}`);
  }

  if (counts.error > 0) {
    process.exitCode = 1;
  } else if (args["fail-on-warning"] && (counts.warning > 0 || counts.unknown > 0)) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exitCode = 1;
}
