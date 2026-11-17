import { track } from "@vercel/analytics";

/**
 * Vercel Analytics mide pageviews, pero no dice qué ficha, artículo o botón
 * genera un clic hacia Amazon. Estos eventos son la única forma de saber qué
 * contenido convierte y cuál solo hace bulto.
 */
export function trackEvent(name, properties = {}) {
  try {
    track(name, properties);
  } catch {
    /* Analytics es opcional: en local o con bloqueadores no debe romper la UI. */
  }
}

export function trackAffiliateClick(product, placement) {
  if (!product) return;
  trackEvent("affiliate_click", {
    asin: String(product.asin || product.id || ""),
    placement,
    price: Number(product.price) || 0,
  });
}
