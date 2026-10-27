#!/usr/bin/env node
/**
 * crear-esquema.mjs — Paso 3 del pipeline.
 *
 * Lee niche.config.mjs y genera un SQL idempotente para Supabase:
 * tabla de productos, columnas de nota, índices, trigger de updated_at y RLS
 * con lectura pública.
 *
 * Uso:
 *   node scripts/crear-esquema.mjs
 *   node scripts/crear-esquema.mjs --config niche.config.mjs --out supabase/schema.sql
 *
 * Después: pega el SQL en Supabase → SQL Editor → Run.
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
const configPath = path.resolve(String(args.config || "niche.config.mjs"));
const outPath = path.resolve(String(args.out || "supabase/schema.sql"));

const snake = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const ident = (value, label) => {
  const result = snake(value);
  if (!/^[a-z_][a-z0-9_]*$/.test(result) || result.length > 48) {
    throw new Error(`Identificador no válido para ${label}: "${value}"`);
  }
  return result;
};

async function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`No existe ${configPath}. Copia templates/niche.config.mjs en la raíz del proyecto.`);
  }
  const module = await import(`${pathToFileURL(configPath).href}?t=${Date.now()}`);
  const config = module.default || module.config;
  if (!config || typeof config !== "object") {
    throw new Error("El config debe exportar un objeto con `export default`.");
  }
  return config;
}

function validateScores(scores) {
  if (!Array.isArray(scores) || scores.length < 3) {
    throw new Error("`scores` debe ser un array con al menos 3 criterios.");
  }
  const reserved = new Set([
    "id",
    "asin",
    "name",
    "slug",
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
    "ideal_for",
    "reviews_summary",
    "specifications",
    "badge",
    "badge_color",
    "created_at",
    "updated_at",
  ]);
  const keys = new Set();
  let total = 0;
  for (const score of scores) {
    if (!score.key || !score.label) throw new Error("Cada criterio necesita `key` y `label`.");
    const key = ident(score.key, "score.key");
    if (reserved.has(key)) {
      throw new Error(`El criterio \"${score.label}\" usa una columna reservada: ${key}`);
    }
    if (keys.has(key)) throw new Error(`Criterio duplicado: ${key}`);
    keys.add(key);
    const weight = Number(score.weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      throw new Error(`Peso no válido en "${score.label}" (debe ser > 0).`);
    }
    total += weight;
  }
  if (Math.abs(total - 1) > 0.02) {
    throw new Error(
      `Los pesos de las notas suman ${total.toFixed(2)}; deben sumar 1 (100 %). ` +
        "Ajusta niche.config.mjs antes de generar el esquema."
    );
  }
}

async function main() {
  const config = await loadConfig();
  validateScores(config.scores);

  const table = ident(args.table || config.table || "products", "table");
  const scores = config.scores.map((score) => ({
    ...score,
    column: ident(score.key, "score.key"),
  }));

  const scoreColumns = scores
    .map(
      (score) =>
        `  ${score.column} smallint not null default 60 check (${score.column} between 0 and 100)`
    )
    .join(",\n");

  const alterScores = scores
    .map(
      (score) =>
        `alter table public.${table}\n  add column if not exists ${score.column} smallint not null default 60 check (${score.column} between 0 and 100);`
    )
    .join("\n");

  const scoreComments = scores
    .map(
      (score) =>
        `comment on column public.${table}.${score.column} is ${sqlString(
          `${score.label} (0-100). Peso ${Math.round(Number(score.weight) * 100)} %.`
        )};`
    )
    .join("\n");

  const sql = `-- Esquema generado por crear-esquema.mjs
-- Nicho: ${config.site?.fullName || config.category?.plural || "sin nombre"}
-- Tabla: public.${table}
-- Criterios: ${scores.length} (pesos al ${scores.reduce((t, s) => t + Number(s.weight), 0) * 100} %)
--
-- Ejecuta este archivo completo en Supabase → SQL Editor.
-- Es idempotente: se puede volver a ejecutar tras añadir criterios.

create extension if not exists pgcrypto;

create table if not exists public.${table} (
  id text primary key,
  asin text not null unique,
  name text not null,
  slug text unique,
  brand text,
  model text,
  price numeric(10, 2) not null default 0 check (price >= 0),
  currency text not null default 'EUR',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  image_src text,
  gallery text[] not null default '{}',
  affiliate_url text,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  tags text[] not null default '{}',
  ideal_for text,
  reviews_summary jsonb not null default '{}',
  specifications jsonb not null default '{}',
${scoreColumns},
  badge text,
  badge_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migración segura para tablas ya creadas
${alterScores}

create index if not exists ${table}_brand_idx on public.${table} (brand);
create index if not exists ${table}_price_idx on public.${table} (price);
create index if not exists ${table}_rating_idx on public.${table} (rating desc, review_count desc);
create index if not exists ${table}_specs_idx on public.${table} using gin (specifications);
create index if not exists ${table}_tags_idx on public.${table} using gin (tags);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ${table}_touch_updated_at on public.${table};
create trigger ${table}_touch_updated_at
before update on public.${table}
for each row execute function public.touch_updated_at();

-- Lectura pública; la escritura queda solo para service_role (bypass RLS)
alter table public.${table} enable row level security;
drop policy if exists "${table}_lectura_publica" on public.${table};
create policy "${table}_lectura_publica"
  on public.${table}
  for select
  to anon, authenticated
  using (true);

${scoreComments}

-- Verificación
select count(*) as productos from public.${table};
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sql, "utf8");

  console.log(`✅ Esquema generado → ${outPath}`);
  console.log(`   Tabla: public.${table}`);
  console.log(`   Criterios: ${scores.map((s) => s.column).join(", ")}`);
  console.log("\nPega el archivo en Supabase → SQL Editor → Run.");
  console.log("Siguiente paso: rellenar la tabla con scripts/scrape-catalogo.mjs");
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

main().catch((error) => {
  console.error(`\nError: ${error.message}`);
  process.exitCode = 1;
});
