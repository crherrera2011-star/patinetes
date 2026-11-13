import { useEffect } from "react";
import { CATEGORY, SITE } from "./site";
import { toNumber } from "./format";

function ensureMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function absoluteUrl(value) {
  if (!value) return `${SITE.url}/images/og-default.png`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE.url}${value.startsWith("/") ? "" : "/"}${value}`;
}

function ensureLink(rel, href) {
  if (!href) return;
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

/**
 * Client-side metadata management: titles, descriptions, Open Graph, canonical
 * URLs and JSON-LD stay in sync with the current route.
 */
export function useSEO({ title, description, path = "/", image, jsonLd, noindex = false } = {}) {
  const structuredData = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const fullTitle = title
      ? `${title} · ${SITE.fullName}`
      : `${SITE.fullName} · Comparativas y guía de compra 2026`;
    const desc = description || SITE.description;
    const canonical = `${SITE.url}${path === "/" ? "/" : path}`;
    const socialImage = absoluteUrl(image || "/images/og-default.png");

    document.title = fullTitle;
    ensureMeta("name", "description", desc);
    ensureMeta(
      "name",
      "robots",
      noindex ? "noindex, follow" : "index, follow, max-image-preview:large"
    );
    ensureMeta("property", "og:title", fullTitle);
    ensureMeta("property", "og:description", desc);
    ensureMeta("property", "og:url", canonical);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:image", socialImage);
    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", fullTitle);
    ensureMeta("name", "twitter:description", desc);
    ensureMeta("name", "twitter:image", socialImage);
    ensureLink("canonical", canonical);

    let script = document.getElementById("seo-structured-data");
    if (structuredData) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "seo-structured-data";
        document.head.appendChild(script);
      }
      script.textContent = structuredData;
    } else if (script) {
      script.remove();
    }
  }, [title, description, path, image, structuredData, noindex]);
}

export function productSchema(product) {
  if (!product) return null;
  const price = toNumber(product.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.shortName || product.name,
    image: product.image.gallery.slice(0, 3).map(absoluteUrl),
    description:
      product.idealFor ||
      `${product.shortName || product.name}: ficha, especificaciones y precio orientativo.`,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.asin,
    category: CATEGORY.plural,
    url: `${SITE.url}/producto/${product.id}`,
    review: editorialReview(product),
    offers:
      price > 0
        ? {
            "@type": "Offer",
            url: product.affiliateUrl,
            priceCurrency: "EUR",
            // Schema.org expects a plain decimal.
            price: price.toFixed(2),
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };
}

/**
 * Reseña editorial propia (nota de 0 a 10).
 *
 * Antes se publicaba el `aggregateRating` de Amazon: Google considera esas
 * reseñas contenido de terceros y su uso en datos estructurados puede acabar
 * en una acción manual por «reseñas engañosas». La nota editorial sí es nuestra
 * y tiene metodología pública en /guia-2026#metodologia.
 */
function editorialReview(product) {
  const score = Number(product.editorScore);
  if (!Number.isFinite(score) || score <= 0) return undefined;
  const name = product.shortName || product.name;
  return {
    "@type": "Review",
    name: `${name}: análisis y nota editorial`,
    reviewBody:
      product.idealFor ||
      `Análisis de ${name}: especificaciones, precio orientativo y nota editorial de ${SITE.fullName}.`,
    reviewRating: {
      "@type": "Rating",
      ratingValue: score.toFixed(1),
      bestRating: 10,
      worstRating: 0,
    },
    author: { "@type": "Organization", name: SITE.fullName, url: SITE.url },
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}

export function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Artículo editorial: guías propias con fecha de publicación y revisión. */
export function articleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  image,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    inLanguage: "es-ES",
    mainEntityOfPage: `${SITE.url}${path}`,
    author: { "@type": "Organization", name: SITE.fullName, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.fullName,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/favicon.svg` },
    },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    image: absoluteUrl(image || "/images/og-default.png"),
  };
}
