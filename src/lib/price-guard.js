import config from "../../niche.config.mjs";

/**
 * Reglas compartidas por el scraper, la auditoría y la web para decidir si un
 * precio es publicable. Los límites viven en niche.config.mjs para poder
 * ajustarlos sin tocar código.
 */
const DEFAULTS = {
  min: 50,
  max: 5000,
  minRatio: 0.2,
  maxRatio: 5,
  staleDays: 14,
};

export const PRICE_GUARD = { ...DEFAULTS, ...(config.priceGuard || {}) };

export function isAvailablePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0;
}

/**
 * Devuelve true si el precio es positivo, está dentro del rango absoluto y no
 * se aleja más de lo permitido del precio anterior (si lo hay).
 */
export function isPlausiblePrice(value, baseline = 0, guard = PRICE_GUARD) {
  return !priceRejectionReason(value, baseline, guard);
}

/**
 * Motivo legible del descarte. Cadena vacía si el precio es aceptable.
 */
export function priceRejectionReason(value, baseline = 0, guard = PRICE_GUARD) {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return "precio vacío o cero";
  if (Number.isFinite(guard.min) && price < guard.min) {
    return `por debajo del mínimo de ${guard.min} €`;
  }
  if (Number.isFinite(guard.max) && price > guard.max) {
    return `por encima del máximo de ${guard.max} €`;
  }

  // Un precio anterior corrupto (p. ej. 22.795 € por un selector roto) no
  // debe impedir que un precio nuevo y válido lo sustituya.
  const previous = Number(baseline);
  const baselineIsValid =
    Number.isFinite(previous) &&
    previous > 0 &&
    (!Number.isFinite(guard.min) || previous >= guard.min) &&
    (!Number.isFinite(guard.max) || previous <= guard.max);
  if (baselineIsValid) {
    if (price < previous * guard.minRatio) {
      return `menos del ${Math.round(guard.minRatio * 100)} % del precio anterior (${previous} €)`;
    }
    if (price > previous * guard.maxRatio) {
      return `más de ${guard.maxRatio}× el precio anterior (${previous} €)`;
    }
  }

  return "";
}

export function priceAgeDays(value, now = new Date()) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 86400000));
}

export function isPriceStale(value, guard = PRICE_GUARD, now = new Date()) {
  const days = priceAgeDays(value, now);
  return days !== null && days > guard.staleDays;
}
