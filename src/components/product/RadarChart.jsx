import { useId } from "react";

const WIDTH = 380;
const HEIGHT = 320;
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2 - 4;
const RADIUS = 100;
const LABEL_RADIUS = 128;

function pointAt(index, count, ratio) {
  const angle = ((Math.PI * 2) / count) * index - Math.PI / 2;
  return {
    x: CENTER_X + RADIUS * ratio * Math.cos(angle),
    y: CENTER_Y + RADIUS * ratio * Math.sin(angle),
    angle,
  };
}

/**
 * Multi-series radar chart. Series are plain objects:
 * { name, color, values: number[] } with values on a 0–100 scale.
 */
export default function RadarChart({ labels = [], series = [], showLegend = true, className = "" }) {
  const titleId = useId();
  const count = Math.max(labels.length, series[0]?.values?.length || 0);

  if (count < 3 || series.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-line text-sm text-ink-muted">
        Sin datos suficientes para el gráfico
      </div>
    );
  }

  const levels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[420px]"
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>
          Perfil de rendimiento: {series.map((item) => item.name).join(", ")}
        </title>

        {levels.map((level) => {
          const points = labels
            .map((_, index) => {
              const { x, y } = pointAt(index, count, level);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={level}
              points={points}
              fill={level === 1 ? "var(--color-cream-50)" : "none"}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
          );
        })}

        {labels.map((label, index) => {
          const { x, y } = pointAt(index, count, 1);
          return (
            <line
              key={label}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={x}
              y2={y}
              stroke="var(--color-line)"
              strokeWidth={1}
            />
          );
        })}

        {series.map((item) => {
          const points = Array.from({ length: count })
            .map((_, index) => {
              const value = Math.max(0, Math.min(100, item.values[index] ?? 0)) / 100;
              const { x, y } = pointAt(index, count, value);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");

          return (
            <g key={item.name}>
              <polygon
                points={points}
                fill={item.color}
                fillOpacity={0.14}
                stroke={item.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {Array.from({ length: count }).map((_, index) => {
                const value = Math.max(0, Math.min(100, item.values[index] ?? 0)) / 100;
                const { x, y } = pointAt(index, count, value);
                return (
                  <circle key={index} cx={x} cy={y} r={2.6} fill={item.color}>
                    <title>
                      {item.name} · {labels[index]}: {Math.round(value * 100)}
                    </title>
                  </circle>
                );
              })}
            </g>
          );
        })}

        {labels.map((label, index) => {
          const angle = ((Math.PI * 2) / count) * index - Math.PI / 2;
          const x = CENTER_X + LABEL_RADIUS * Math.cos(angle);
          const y = CENTER_Y + LABEL_RADIUS * Math.sin(angle);
          const cos = Math.cos(angle);
          const anchor = Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";

          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="10.5"
              fontWeight="500"
              fill="var(--color-ink-muted)"
            >
              {label}
            </text>
          );
        })}
      </svg>

      {showLegend && series.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {series.map((item) => (
            <span key={item.name} className="inline-flex items-center gap-2 text-[11.5px] text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
