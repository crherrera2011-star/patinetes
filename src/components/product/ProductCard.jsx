import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import Stars from "../ui/Stars";
import ScoreBadge from "../ui/ScoreBadge";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import ProductMedia from "./ProductMedia";
import { useCompare } from "../../context/CompareContext";
import { formatCompact, formatPrice } from "../../lib/format";
import { specValue, specDisplay } from "../../lib/normalize-product";

const AWARD_TONES = {
  editor: "editor",
  value: "value",
  budget: "budget",
  neutral: "neutral",
};

export default function ProductCard({ product, award, awardTone = "editor", className = "" }) {
  const { isSelected, toggle } = useCompare();
  const selected = isSelected(product.id);

  const details = [
    specValue(product, "autonomia_km")
      ? `${specDisplay("autonomia_km", specValue(product, "autonomia_km"))} de autonomía`
      : null,
    specValue(product, "velocidad_max_kmh")
      ? `${specDisplay("velocidad_max_kmh", specValue(product, "velocidad_max_kmh"))}`
      : null,
    specValue(product, "peso_kg")
      ? `${specDisplay("peso_kg", specValue(product, "peso_kg"))}`
      : null,
  ].filter(Boolean);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift ${className}`}
    >
      <div className="relative">
        <Link
          to={`/producto/${product.id}`}
          className="block focus-visible:outline-offset-[-3px]"
          aria-label={`Ver análisis de ${product.shortName || product.name}`}
        >
          <ProductMedia
            product={product}
            className="aspect-[4/3]"
            imgClassName="group-hover:scale-[1.04]"
          />
        </Link>

        {award && (
          <Badge
            tone={AWARD_TONES[awardTone] || "neutral"}
            className="absolute left-3 top-3 shadow-sm"
          >
            {award}
          </Badge>
        )}

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-pressed={selected}
          aria-label={selected ? "Quitar de la comparación" : "Añadir a la comparación"}
          title={selected ? "Quitar de la comparación" : "Añadir a la comparación"}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-all ${
            selected
              ? "border-brand bg-brand text-white"
              : "border-line-strong bg-white/90 text-ink-soft hover:border-brand hover:text-brand"
          }`}
        >
          {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {product.brand}
          </p>
          <ScoreBadge score={product.editorScore} size="sm" />
        </div>

        <h3 className="mt-2 font-sans text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
          <Link to={`/producto/${product.id}`} className="transition-colors hover:text-brand">
            {product.model || product.shortName || product.name}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Stars rating={product.rating} showValue />
          <span className="text-[11px] text-ink-muted">
            {product.reviewCount > 0
              ? `(${formatCompact(product.reviewCount)} reseñas)`
              : "Sin reseñas aún"}
          </span>
        </div>

        <p className="mt-3 text-[12.5px] text-ink-muted">
          {details.length ? details.join(" · ") : "Especificaciones en la ficha"}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-line pt-4">
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Precio orientativo
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular tracking-[-0.02em] text-ink">
                {formatPrice(product.price)}
              </p>
            </div>
            {(product.pricePosition || 0) <= -5 && (
              <p className="pb-1 text-[10.5px] font-medium text-success">
                {Math.abs(product.pricePosition)} % bajo la mediana
              </p>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              as={Link}
              to={`/producto/${product.id}`}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Análisis
            </Button>
            <Button href={product.affiliateUrl} size="sm" className="flex-1">
              Ver precio
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
