import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "../../lib/normalize-product";

/**
 * Imagen de producto con fallback: Amazon rota URLs del CDN y una imagen rota
 * es la forma más rápida de parecer poco fiable.
 */
export default function ProductMedia({
  product,
  src: srcOverride,
  className = "",
  imgClassName = "",
  priority = false,
}) {
  const preferred = srcOverride || product?.image?.src || PLACEHOLDER_IMAGE;
  const [src, setSrc] = useState(preferred);

  useEffect(() => {
    setSrc(preferred);
  }, [preferred]);

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-cream-100 ${className}`}>
      <img
        src={src}
        alt={product?.image?.alt || product?.name || "Patinete eléctrico"}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => {
          if (src !== PLACEHOLDER_IMAGE) setSrc(PLACEHOLDER_IMAGE);
        }}
        className={`h-full w-full object-contain p-4 transition-transform duration-500 ${imgClassName}`}
      />
    </div>
  );
}
