import { Link } from "react-router-dom";
import { SCORE_METRICS, scoreLabel } from "../../lib/normalize-product";
import ScoreBadge from "../ui/ScoreBadge";

export default function ScorePanel({ product, showHeader = true }) {
  const weightSummary = SCORE_METRICS.map(
    (metric) => `${metric.label.toLowerCase()} ${Math.round(metric.weight * 100)} %`
  ).join(", ");

  return (
    <div>
      {showHeader && (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Puntuación editorial
            </p>
            <div className="mt-2 flex items-center gap-3">
              <ScoreBadge score={product.editorScore} size="lg" />
              <span className="text-sm font-medium text-ink-soft">
                {scoreLabel(product.editorScore)}
              </span>
            </div>
          </div>
          <Link
            to="/guia-2026#metodologia"
            className="text-[12px] font-medium text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            Cómo puntuamos
          </Link>
        </div>
      )}

      <dl className="mt-6 space-y-4">
        {SCORE_METRICS.map((metric) => {
          const value = product.scores[metric.key] ?? 0;
          return (
            <div key={metric.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <dt className="text-[13px] text-ink-soft">{metric.label}</dt>
                <dd className="text-[12px] font-semibold tabular text-ink">
                  {value}
                  <span className="ml-0.5 text-[10px] font-normal text-ink-muted">/100</span>
                </dd>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${value}%` }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={metric.label}
                />
              </div>
            </div>
          );
        })}
      </dl>

      <p className="mt-5 text-[11.5px] leading-relaxed text-ink-muted">
        Media ponderada de seis criterios ({weightSummary}). La calidad-precio se estima comparando
        la calidad del resto de criterios con el precio mediano del catálogo. Las puntuaciones son
        editoriales y no están patrocinadas.
      </p>
    </div>
  );
}
