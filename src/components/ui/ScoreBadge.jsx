import { scoreTone } from "../../lib/normalize-product";

const TONES = {
  success: "bg-success/10 text-success ring-success/20",
  gold: "bg-gold/15 text-gold ring-gold/25",
  warning: "bg-warning/10 text-warning ring-warning/20",
  danger: "bg-danger/10 text-danger ring-danger/20",
};

export default function ScoreBadge({ score = 0, size = "md", label, className = "" }) {
  const tone = TONES[scoreTone(score)] || TONES.gold;
  const sizes = {
    sm: "text-[13px] px-2 py-1",
    md: "text-base px-2.5 py-1.5",
    lg: "text-2xl px-4 py-2.5",
  };

  return (
    <span
      className={`inline-flex items-baseline gap-0.5 rounded-lg font-semibold tabular ring-1 ring-inset ${tone} ${sizes[size]} ${className}`}
      title={`Puntuación editorial: ${Number(score).toFixed(1)} sobre 10`}
    >
      {Number(score).toFixed(1)}
      <span className="text-[0.62em] font-medium opacity-70">/10</span>
      {label && (
        <span className="ml-1 text-[0.62em] font-medium uppercase tracking-wide opacity-80">
          {label}
        </span>
      )}
    </span>
  );
}
