import config from "../../niche.config.mjs";

/**
 * Configuración pública del sitio. Los valores de `.env` mandan sobre el
 * config para poder cambiar dominio, correo o tag sin tocar código.
 */
export const SITE = {
  ...config.site,
  url: (import.meta.env.VITE_SITE_URL || config.site.url).replace(/\/$/, ""),
  email: import.meta.env.VITE_CONTACT_EMAIL || config.site.email,
  amazonTag: import.meta.env.VITE_AMAZON_TAG || config.site.amazonTag,
};

export const CATEGORY = config.category;
export const PRICE_BANDS = config.priceBands;
export const CATALOG_PATH = `/${config.category.slug}`;
export const PRODUCT_PATH = "/producto";

export const NAV_LINKS = [
  { label: "Inicio", to: "/" },
  { label: "Patinetes", to: CATALOG_PATH },
  { label: "Comparador", to: "/comparador" },
  { label: "Guía 2026", to: "/guia-2026" },
  { label: "Precios", to: "/ofertas" },
];

export function priceBandId(price) {
  const band = PRICE_BANDS.find(
    (item) => price >= item.min && (price < item.max || item.max === Infinity)
  );
  return band?.id || PRICE_BANDS[PRICE_BANDS.length - 1].id;
}

export function inPriceBand(price, band) {
  return Boolean(band) && priceBandId(price) === band.id;
}

export function priceBandLabel(price) {
  return PRICE_BANDS.find((band) => band.id === priceBandId(price))?.label ?? "";
}

export function productUrl(productOrId) {
  const id = typeof productOrId === "string" ? productOrId : productOrId?.id;
  return `${PRODUCT_PATH}/${id}`;
}

/**
 * Construye el enlace de afiliado. Si la fila ya trae una URL de Amazon,
 * conserva sus parámetros y solo asegura `tag` y `linkCode`.
 */
export function affiliateUrl(asin, rawUrl) {
  const tag = SITE.amazonTag;
  const domain = SITE.amazonDomain || "www.amazon.es";

  if (rawUrl) {
    try {
      const url = new URL(rawUrl);
      if (/(^|\.)amazon\./i.test(url.hostname)) {
        const stored = (url.searchParams.get("tag") || "").trim();
        const finalTag = stored && stored !== "tucodigo-21" ? stored : tag;
        if (finalTag) url.searchParams.set("tag", finalTag);
        if (!url.searchParams.has("linkCode")) url.searchParams.set("linkCode", "ll1");
        return url.toString();
      }
      return rawUrl;
    } catch {
      /* usa la URL construida */
    }
  }

  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  params.set("linkCode", "ll1");
  return `https://${domain}/dp/${asin}?${params.toString()}`;
}
