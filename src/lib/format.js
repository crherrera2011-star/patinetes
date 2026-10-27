const eurFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

const compactFormatter = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function formatPrice(value) {
  return eurFormatter.format(toNumber(value));
}

export function formatNumber(value) {
  return numberFormatter.format(toNumber(value));
}

export function formatCompact(value) {
  return compactFormatter.format(toNumber(value));
}

export function formatDate(value, options = {}) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function parseList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
      } catch {
        return [trimmed];
      }
    }
    return trimmed
      .split(/\n|•|\|/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

const BRAND_WORDS = [
  "Xiaomi",
  "Segway",
  "Ninebot",
  "Cecotec",
  "Smartgyro",
  "iScooter",
  "Kugoo",
  "Mibao",
  "Bergsteiger",
  "Doc Green",
  "Rider",
  "Urban",
];

const POSITIVE_HINT =
  /\b(fácil|facil|automátic|automatic|rápid|rapid|limpia|sin esfuerzo|intuitiv|ahorro|compact|elegante|calidad|personaliz|versátil|versatil|excelente|explora|disfruta|gracias|controla|guarda|ajusta|plegable|ligero|potente|autonomía|autonomia)\b/i;

const NEGATIVE_HINT =
  /\b(pero|aunque|sin embargo|difícil|dificil|ruido|caro|pesad|lento|problema|limitad|requiere|ocupa|elevado|no incluye|solo)\b/i;

/**
 * Turn scraped, often ALL-CAPS marketing copy into readable Spanish.
 */
export function humanize(text, maxLength = 190) {
  if (!text) return "";
  let value = String(text).replace(/\s+/g, " ").trim();

  const labelMatch = value.match(/^([A-ZÁÉÍÓÚÜÑ0-9][A-ZÁÉÍÓÚÜÑ0-9\s/&.,+-]{3,}?):\s+(.+)$/);
  if (labelMatch) {
    const label = labelMatch[1].toLocaleLowerCase("es");
    value = `${label.charAt(0).toLocaleUpperCase("es")}${label.slice(1)}: ${labelMatch[2]}`;
  }

  const letters = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const upperLetters = letters.replace(/[^A-ZÉÍÓÚÜÑ]/g, "").length;
  const isShouting = letters.length > 28 && upperLetters / letters.length > 0.72;

  if (isShouting) {
    value = value.toLocaleLowerCase("es");
    value = value.charAt(0).toLocaleUpperCase("es") + value.slice(1);
    for (const word of BRAND_WORDS) {
      const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      value = value.replace(re, word);
    }
  }

  if (value.length > maxLength) {
    const cut = value.slice(0, maxLength);
    const lastSpace = cut.lastIndexOf(" ");
    value = `${cut.slice(0, lastSpace > 60 ? lastSpace : maxLength).trim()}…`;
  }

  return value;
}

export function looksPositive(text) {
  return POSITIVE_HINT.test(text) && !NEGATIVE_HINT.test(text);
}

export function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function median(values) {
  const numbers = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (numbers.length === 0) return 0;
  const middle = Math.floor(numbers.length / 2);
  return numbers.length % 2 === 0
    ? (numbers[middle - 1] + numbers[middle]) / 2
    : numbers[middle];
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}
