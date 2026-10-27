import { useId } from "react";

/**
 * Horizontal bar chart for one niche spec (autonomy, speed, weight…).
 *
 * `items` is a list of { name, value, color }. The chart is a visual aid only:
 * the same data is always available as a real table for screen readers and for
 * anyone who prefers numbers.
 */
export default function BarChart({
  title,
  unit = "",
  items = [],
  higherIsBetter = true,
  className = "",
}) {
  const titleId = useId();
  const valid = items.filter((item) => Number.isFinite(item.value) && item.value > 0);

  if (valid.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-line px-4 text-center text-[12.5px] text-ink-muted">
        Ninguno de los modelos seleccionados publica este dato.
      </div>
    );
  }

  const max = Math.max(...valid.map((item) => item.value));
  const bestValue = higherIsBetter
    ? Math.max(...valid.map((item) => item.value))
    : Math.min(...valid.map((item) => item.value));

  const formatValue = (value) =>
    `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}${unit ? ` ${unit}` : ""}`;

  return (
    <div className={className}>
      <div
        role="img"
        aria-labelledby={titleId}
        className="space-y-3"
      >
        <p id={titleId} className="sr-only">
          {title}. {valid.map((item) => `${item.name}: ${formatValue(item.value)}`).join(". ")}
        </p>

        {valid.map((item) => {
          const width = Math.max(4, Math.round((item.value / max) * 100));
          const isBest = item.value === bestValue;
          return (
            <div key={item.name}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-[11.5px] font-medium text-ink-soft">{item.name}</span>
                <span
                  className={`shrink-0 text-[11.5px] tabular ${
                    isBest ? "font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  {formatValue(item.value)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${width}%`,
                    backgroundColor: item.color,
                    opacity: isBest ? 1 : 0.62,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <details className="group mt-4">
        <summary className="cursor-pointer list-none text-[11px] font-medium text-ink-muted underline underline-offset-4 transition-colors hover:text-brand">
          Ver los datos en tabla
        </summary>
        <div className="mt-2 overflow-x-auto rounded-lg border border-line">
          <table className="w-full border-collapse text-left text-[11.5px]">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="bg-cream-50 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                <th scope="col" className="px-3 py-2 font-semibold">Modelo</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">{title}</th>
              </tr>
            </thead>
            <tbody>
              {valid.map((item) => (
                <tr key={item.name} className="border-t border-line/70">
                  <th scope="row" className="px-3 py-2 font-normal text-ink-soft">{item.name}</th>
                  <td className="px-3 py-2 text-right tabular text-ink">{formatValue(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
