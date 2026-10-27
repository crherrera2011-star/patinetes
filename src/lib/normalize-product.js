/**
 * normalize-product.js — capa única de datos.
 *
 * Convierte las filas de Supabase (snake_case) o el snapshot local en objetos
 * consistentes para todas las páginas. Las specs y los criterios viven en
 * niche.config.mjs: aquí no hay nada específico de un nicho.
 */
import config from "../../niche.config.mjs";
import { affiliateUrl, priceBandId, priceBandLabel, SITE } from "./site";

export const SITE_INFO = SITE;
export const SCORE_METRICS = config.scores;
export const SPECS = config.specs;
export const CATEGORY = config.category;
export const PLACEHOLDER_IMAGE = "/images/placeholder-patinete.svg";

const stripAccents = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeKey = (value) =>
  stripAccents(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const cleanText = (value) =>
  String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const slugify = (value) =>
  stripAccents(cleanText(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const snakeCase = (value) =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase();

export function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value ?? "").match(/-?\d+(?:[.,]\d+)*/);
  if (!match) return fallback;
  const parsed = Number.parseFloat(
    match[0].replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")
  );
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toBool(value) {
  if (typeof value === "boolean") return value;
  const text = normalizeKey(value);
  if (!text) return false;
  if (/^(si|s|true|incluido|incluye|con|yes)$/.test(text)) return true;
  if (/^(no|false|sin)\b/.test(text)) return false;
  if (/no incluid|sin |no dispone|fij[oa]/.test(text)) return false;
  if (/incluid|incorporad|con suspension|plegable|\bsi\b/.test(text)) return true;
  // Un texto descriptivo ("Suspensión delantera") implica que existe.
  return true;
}

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));

/**
 * Devuelve el valor tipado de una especificación, aceptando el nombre canónico
 * o cualquiera de sus alias de Amazon.
 */
export function specValue(product, key) {
  const definition = SPECS[key];
  const specifications = product?.specifications || {};
  let raw = specifications[key];

  if (raw === undefined && definition) {
    const wanted = [definition.label, ...(definition.aliases || [])].map(normalizeKey);
    const found = Object.keys(specifications).find((candidate) => {
      const normalized = normalizeKey(candidate);
      return wanted.some((alias) => alias && (normalized === alias || normalized.includes(alias)));
    });
    if (found) raw = specifications[found];
  }

  if (raw === undefined || raw === null || raw === "") return null;
  if (definition?.type === "number") {
    const number = toNumber(raw, Number.NaN);
    return Number.isFinite(number) ? number : null;
  }
  if (definition?.type === "boolean") return toBool(raw);
  return cleanText(raw);
}

export function specLabel(key) {
  const definition = SPECS[key];
  if (!definition) return key;
  return definition.unit ? `${definition.label} (${definition.unit})` : definition.label;
}

export function specDisplay(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  const definition = SPECS[key] || {};
  if (definition.type === "boolean") return value ? "Sí" : "No";
  if (definition.type === "number") {
    return `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}${
      definition.unit ? ` ${definition.unit}` : ""
    }`;
  }
  return String(value);
}

/** Filas de especificaciones agrupadas para la ficha. */
export function productSpecRows(product) {
  const rows = [
    { label: "Marca", value: product.brand || "—", group: "General" },
    { label: "Modelo", value: product.model || "—", group: "General" },
    { label: "ASIN", value: product.asin || "—", group: "General" },
  ];
  for (const [key, definition] of Object.entries(SPECS)) {
    const value = specValue(product, key);
    rows.push({
      label: definition.label,
      value: specDisplay(key, value),
      group: definition.group || "Especificaciones",
    });
  }
  return rows;
}

export function specGroups() {
  return [...new Set(Object.values(SPECS).map((spec) => spec.group || "Especificaciones"))];
}

function deriveScore(product, metric) {
  const fallback = Number.isFinite(Number(metric.default)) ? Number(metric.default) : 60;
  const rule = metric.derive;
  if (!rule?.spec) return fallback;

  const value = specValue(product, rule.spec);
  if (value === null) return fallback;

  if (rule.values) {
    if (typeof value === "boolean") {
      return Number(rule.values[value] ?? fallback);
    }
    const text = normalizeKey(value);
    const matches = Object.entries(rule.values)
      .map(([label, score]) => [normalizeKey(label), score])
      .filter(([label]) => label.length > 2 && text.includes(label))
      .sort((a, b) => b[0].length - a[0].length);
    return matches.length ? Number(matches[0][1]) : fallback;
  }

  if (typeof value !== "number" || !Number.isFinite(rule.min) || !Number.isFinite(rule.max)) {
    return fallback;
  }
  const ratio = (value - rule.min) / (rule.max - rule.min);
  return Math.round(clamp(ratio * 100));
}

export function scoreFor(product, metric) {
  const stored = product?.scores?.[metric.key];
  if (typeof stored === "number" && Number.isFinite(stored)) return clamp(Math.round(stored));
  return deriveScore(product, metric);
}

const SCORE_WORDS = /^(patinete|scooter|el[eé]ctrico|electrico|electric|plegable|adulto|adultos|para|con|de|y)$/i;

function deriveShortName(name, brand, model) {
  const fromModel = cleanText(model);
  if (fromModel) {
    const brandText = cleanText(brand);
    const sameAsBrand = brandText && fromModel.toLowerCase() === brandText.toLowerCase();
    const base = sameAsBrand
      ? brandText
      : brandText && !fromModel.toLowerCase().startsWith(brandText.toLowerCase())
        ? `${brandText} ${fromModel}`
        : fromModel;
    return base.length > 46 ? `${base.slice(0, 45).trim()}…` : base;
  }

  if (!name) return brand || "Modelo";
  let rest = cleanText(name);
  if (brand) {
    rest = rest.replace(new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\s*`, "i"), "");
  }
  rest = rest.replace(/\bpatinete\s+(el[eé]ctrico|electrico|para adultos?)\b/gi, " ");
  rest = rest.replace(/\b(scooter|el[eé]ctrico|electrico|electric)\b/gi, " ");
  rest = rest.split(/\s[-–—]\s|,\s|\.\s|\||\(/)[0];
  rest = rest
    .split(/\s+/)
    .filter((word) => word && !SCORE_WORDS.test(word))
    .join(" ");
  if (rest.length < 2) return brand || name.slice(0, 42);
  const label = `${brand || ""} ${rest}`.replace(/\s+/g, " ").trim();
  return label.length > 46 ? `${label.slice(0, 45).trim()}…` : label;
}

export function normalizeProduct(raw) {
  if (!raw) return null;

  const asin = String(raw.asin || raw.id || "");
  const price = Math.max(0, toNumber(raw.price));
  const reviewCount = Math.max(0, Math.round(toNumber(raw.review_count ?? raw.reviewCount)));
  // Una valoración sin reseñas suele venir de fichas fusionadas: no se muestra.
  const rating = reviewCount > 0 ? Math.min(5, Math.max(0, toNumber(raw.rating))) : 0;

  const gallery = [
    ...(Array.isArray(raw.gallery) ? raw.gallery : []),
    raw.image_src,
    raw.image?.src,
  ]
    .filter(Boolean)
    .map(String)
    .filter((src, index, list) => list.indexOf(src) === index);

  const specifications =
    raw.specifications && typeof raw.specifications === "object" ? raw.specifications : {};
  const name = cleanText(raw.name) || `${raw.brand || ""} ${raw.model || ""}`.trim();
  const brand = cleanText(raw.brand);
  const fallbackModel =
    brand && name.toLowerCase().startsWith(brand.toLowerCase())
      ? name.slice(brand.length).trim()
      : name;
  const model = cleanText(raw.model) || fallbackModel;

  const scores = {};
  let valuePending = false;
  for (const metric of SCORE_METRICS) {
    // Calidad-precio depende de la mediana del catálogo: se calcula siempre en
    // el cliente y nunca se acepta un valor almacenado por el scraper.
    if (metric.derive?.kind === "value") {
      scores[metric.key] = null;
      valuePending = true;
      continue;
    }
    const stored =
      raw[snakeCase(metric.key)] ?? raw[metric.key] ?? raw.scores?.[metric.key];
    if (stored !== undefined && stored !== null && stored !== "") {
      scores[metric.key] = clamp(Math.round(toNumber(stored)));
    } else {
      scores[metric.key] = null;
    }
  }

  const product = {
    id: String(raw.id || asin),
    asin,
    name,
    shortName: cleanText(raw.short_name || raw.shortName) || deriveShortName(name, brand, model),
    brand: brand || "Otras marcas",
    model,
    price,
    currency: raw.currency || "EUR",
    rating,
    reviewCount,
    image: {
      src: gallery[0] || PLACEHOLDER_IMAGE,
      gallery: gallery.length ? gallery : [PLACEHOLDER_IMAGE],
      alt: name || `${CATEGORY.singular} ${brand}`.trim(),
    },
    gallery,
    affiliateUrl: affiliateUrl(asin, raw.affiliate_url || raw.affiliateUrl),
    specifications,
    scores,
    valuePending,
    pros: Array.isArray(raw.pros) ? raw.pros.filter(Boolean) : [],
    cons: Array.isArray(raw.cons) ? raw.cons.filter(Boolean) : [],
    tags: (Array.isArray(raw.tags) ? raw.tags : String(raw.tags || "").split(","))
      .map((tag) => cleanText(tag).toLowerCase())
      .filter(Boolean),
    idealFor: cleanText(raw.ideal_for || raw.idealFor),
    badge: cleanText(raw.badge),
    badgeColor: cleanText(raw.badge_color || raw.badgeColor),
    reviewsSummary: raw.reviews_summary || raw.reviewsSummary || {},
    updatedAt: raw.updated_at || raw.updatedAt || null,
    searchIndex: normalizeKey(
      `${name} ${brand} ${model} ${Array.isArray(raw.tags) ? raw.tags.join(" ") : raw.tags || ""}`
    ),
  };

  // Estimación transparente desde specs para los criterios que la permiten.
  for (const metric of SCORE_METRICS) {
    if (product.scores[metric.key] === null && !(metric.derive?.kind === "value")) {
      product.scores[metric.key] = deriveScore(product, metric);
    }
  }

  product.editorScore = computeEditorScore(product);
  return product;
}

export function computeEditorScore(product) {
  let total = 0;
  let weight = 0;
  for (const metric of SCORE_METRICS) {
    const value = product.scores[metric.key];
    if (typeof value !== "number") continue;
    total += value * metric.weight;
    weight += metric.weight;
  }
  if (!weight) return 0;
  return Math.round((total / weight / 10) * 10) / 10;
}

export function median(values) {
  const sorted = values
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Calidad-precio transparente: calidad media ponderada (sin contar la propia
 * calidad-precio) dividida por el precio relativo a la mediana del catálogo.
 * Un modelo en la mediana con 80 de calidad obtiene 80; uno que cuesta el doble
 * y ofrece lo mismo, 40. No sustituye a una review, pero es defendible.
 */
function estimateValueForMoney(product, medianPrice) {
  let total = 0;
  let weight = 0;
  for (const metric of SCORE_METRICS) {
    if (metric.derive?.kind === "value") continue;
    const value = product.scores[metric.key];
    if (typeof value !== "number") continue;
    total += value * metric.weight;
    weight += metric.weight;
  }
  const quality = weight ? total / weight : 60;
  const ratio = product.price > 0 && medianPrice > 0 ? product.price / medianPrice : 1;
  return clamp(Math.round(quality / Math.max(ratio, 0.25)));
}

/**
 * Añade información relativa al catálogo: mediana, desviación, franja y ranking.
 * La web nunca muestra «rebajas» inventadas: solo este dato verificable.
 */
export function enrichCatalog(products) {
  if (!products.length) return products;
  const medianPrice = median(products.map((product) => product.price));

  const enriched = products.map((product) => {
    let scores = product.scores;
    if (product.valuePending) {
      scores = {
        ...scores,
        value_for_money: estimateValueForMoney(product, medianPrice),
      };
    }
    const withScores = { ...product, scores, medianPrice };
    withScores.editorScore = computeEditorScore(withScores);
    const delta =
      medianPrice > 0 && product.price > 0
        ? Math.round(((product.price - medianPrice) / medianPrice) * 100)
        : 0;
    return {
      ...withScores,
      priceDelta: delta,
      pricePosition: delta,
      priceBand: priceBandId(product.price),
      priceBandLabel: priceBandLabel(product.price),
    };
  });

  return enriched
    .sort((a, b) => b.editorScore - a.editorScore || a.price - b.price)
    .map((product, index) => ({ ...product, rank: index + 1 }));
}

export function sortByScore(products) {
  return [...products].sort((a, b) => b.editorScore - a.editorScore || a.price - b.price);
}

export function scoreTone(score) {
  if (score >= 8.6) return "success";
  if (score >= 8) return "gold";
  if (score >= 7) return "warning";
  return "danger";
}

export function scoreLabel(score) {
  if (score >= 9) return "Excepcional";
  if (score >= 8.5) return "Muy recomendable";
  if (score >= 8) return "Recomendable";
  if (score >= 7) return "Correcta";
  return "Mejorable";
}

export function formatPrice(value) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

/**
 * Selección editorial de la home: mejor global, mejor calidad-precio y la
 * opción más económica. Devuelve como máximo tres productos distintos.
 */
export function buildPicks(products) {
  const pool = products.filter((product) => product.price > 0);
  if (!pool.length) return [];

  const editorPick = [...pool].sort(
    (a, b) => b.editorScore - a.editorScore || b.reviewCount - a.reviewCount
  )[0];

  const valueScore = (product) =>
    (product.editorScore ** 2) / Math.max(product.price, 1) +
    product.scores.value_for_money / 10000;

  const bestValue = [...pool]
    .filter((product) => product.id !== editorPick.id)
    .sort((a, b) => valueScore(b) - valueScore(a))[0];

  const budget = [...pool]
    .filter((product) => ![editorPick.id, bestValue?.id].includes(product.id))
    .sort((a, b) => a.price - b.price || b.editorScore - a.editorScore)[0];

  return [
    editorPick && { ...editorPick, award: "Elección del editor", awardTone: "editor" },
    bestValue && { ...bestValue, award: "Mejor calidad-precio", awardTone: "value" },
    budget && { ...budget, award: "Opción más económica", awardTone: "budget" },
  ]
    .filter(Boolean)
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index);
}
