import { Star } from "lucide-react";

/**
 * Accessible five-star rating. The filled layer is clipped by width so half
 * stars and other fractions render accurately.
 */
export default function Stars({ rating = 0, size = 14, showValue = false, className = "" }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const stars = [0, 1, 2, 3, 4];
  const starSize = { width: size, height: size };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5 text-cream-300">
          {stars.map((index) => (
            <Star key={index} style={starSize} className="fill-current" strokeWidth={0} />
          ))}
        </span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${(value / 5) * 100}%` }}
        >
          <span className="flex gap-0.5 text-gold">
            {stars.map((index) => (
              <Star key={index} style={starSize} className="shrink-0 fill-current" strokeWidth={0} />
            ))}
          </span>
        </span>
      </span>
      <span className="sr-only">
        {value > 0 ? `${value.toFixed(1)} de 5 estrellas` : "Sin valoraciones todavía"}
      </span>
      {showValue && value > 0 && (
        <span className="text-xs font-medium tabular text-ink-soft">{value.toFixed(1)}</span>
      )}
    </span>
  );
}
