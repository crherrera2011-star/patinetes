import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BatteryCharging,
  Check,
  ChevronRight,
  Gauge,
  Plus,
  Scale,
  Search,
  Trash2,
  Trophy,
  Wallet,
} from "lucide-react";
import config from "../../niche.config.mjs";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import Stars from "../components/ui/Stars";
import ScoreBadge from "../components/ui/ScoreBadge";
import Badge from "../components/ui/Badge";
import ProductMedia from "../components/product/ProductMedia";
import RadarChart from "../components/product/RadarChart";
import BarChart from "../components/product/BarChart";
import { ErrorState, PageLoader } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { useCompare } from "../context/CompareContext";
import {
  SCORE_METRICS,
  SPECS,
  specDisplay,
  specGroups,
  specValue,
} from "../lib/normalize-product";
import { formatPrice } from "../lib/format";
import { useSEO } from "../lib/seo";

const SERIES_COLORS = ["#0d6b57", "#9dbb2f", "#c99a3d"];
const BAR_CHARTS = (config.charts || []).filter((chart) => chart.type === "bars");

const VIEWS = [
  { id: "resumen", label: "Resumen" },
  { id: "especificaciones", label: "Especificaciones" },
  { id: "puntuaciones", label: "Puntuaciones" },
  { id: "graficas", label: "Gráficas" },
];

const ESSENTIAL_ROWS = [
  { label: "Precio orientativo", get: (product) => product.price, display: formatPrice, best: "min" },
  {
    label: "Nota editorial",
    get: (product) => product.editorScore,
    display: (value) => `${value.toFixed(1)} / 10`,
    best: "max",
  },
  { label: "Franja de precio", get: (product) => product.priceBandLabel, display: (value) => value || "—" },
];

const SPEC_SECTIONS = specGroups().map((group) => ({
  group,
  rows: Object.entries(SPECS)
    .filter(([, definition]) => (definition.group || "Especificaciones") === group)
    .map(([key, definition]) => ({
      label: definition.label,
      get: (product) => specValue(product, key),
      display: (value) => specDisplay(key, value),
      best: definition.type === "boolean" ? undefined : definition.best,
    })),
}));

export default function Comparison() {
  const { products, loading, error, reload } = useCatalog();
  const { selectedIds, toggle, clear, isSelected, limit, notice } = useCompare();
  const [view, setView] = useState("resumen");
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => selectedIds.map((id) => products.find((product) => product.id === id)).filter(Boolean),
    [selectedIds, products]
  );

  const ranking = useMemo(() => {
    const sorted = [...selected].sort((a, b) => b.editorScore - a.editorScore);
    return new Map(sorted.map((product, index) => [product.id, index + 1]));
  }, [selected]);

  const winner = useMemo(
    () => [...selected].sort((a, b) => b.editorScore - a.editorScore)[0],
    [selected]
  );
  const bestPrice = useMemo(
    () => [...selected].sort((a, b) => a.price - b.price)[0],
    [selected]
  );
  const bestAutonomy = useMemo(
    () =>
      [...selected].sort(
        (a, b) => (specValue(b, "autonomia_km") || 0) - (specValue(a, "autonomia_km") || 0)
      )[0],
    [selected]
  );

  const picker = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.name} ${product.brand} ${product.model}`.toLowerCase().includes(term)
    );
  }, [products, search]);

  useSEO({
    title: "Comparador de patinetes eléctricos",
    description:
      "Compara hasta tres patinetes eléctricos lado a lado: autonomía, potencia, frenos, peso, precio y puntuaciones por criterio.",
    path: "/comparador",
  });

  if (loading) return <PageLoader />;
  if (error && products.length === 0) {
    return (
      <Container className="py-20">
        <ErrorState message={error} onRetry={reload} />
      </Container>
    );
  }

  return (
    <div className="bg-cream-50 pb-20">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Comparador</span>
        </nav>

        <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
              Cara a cara
            </p>
            <h1 className="mt-3 text-4xl text-ink sm:text-5xl">Comparador</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
              Hasta {limit} patinetes, los mismos criterios. Añade modelos y cambia entre resumen,
              especificaciones, puntuaciones y gráficas del nicho.
            </p>
          </div>
          {selected.length > 0 && (
            <Button variant="outline" size="sm" onClick={clear} className="self-start sm:self-auto">
              <Trash2 className="h-4 w-4" />
              Vaciar ({selected.length})
            </Button>
          )}
        </header>

        {notice && (
          <p className="mt-4 rounded-xl border border-warning/20 bg-warning/10 px-4 py-2.5 text-[12.5px] text-warning">
            {notice}
          </p>
        )}

        {/* Selected strip */}
        {selected.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selected.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3"
              >
                <ProductMedia
                  product={product}
                  className="h-14 w-14 shrink-0 rounded-xl border border-line"
                  imgClassName="p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    {product.brand}
                  </p>
                  <p className="truncate text-[13px] font-medium text-ink">
                    {product.model || product.shortName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[12px] font-semibold tabular text-ink">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[10.5px] text-ink-muted">· {product.editorScore}/10</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cream-200 hover:text-danger"
                  aria-label={`Quitar ${product.shortName || product.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {selected.length < 2 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-white px-6 py-8 text-center">
            <Scale className="mx-auto h-6 w-6 text-ink-muted" />
            <p className="mt-3 text-[14px] font-medium text-ink">
              {selected.length === 0
                ? "Elige dos patinetes para empezar"
                : "Añade un segundo patinete"}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Selecciona modelos en la lista de abajo. Puedes cambiarlos cuando quieras.
            </p>
          </div>
        ) : (
          <>
            {/* Comparison highlights */}
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Highlight
                icon={Trophy}
                label="Mejor puntuación"
                product={winner}
                value={`${winner?.editorScore.toFixed(1)} / 10`}
              />
              <Highlight
                icon={Wallet}
                label="Precio más bajo"
                product={bestPrice}
                value={bestPrice ? formatPrice(bestPrice.price) : "—"}
              />
              <Highlight
                icon={BatteryCharging}
                label="Más autonomía"
                product={bestAutonomy}
                value={specDisplay("autonomia_km", specValue(bestAutonomy || {}, "autonomia_km"))}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-1.5">
              {VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  aria-pressed={view === item.id}
                  className={`rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors ${
                    view === item.id
                      ? "bg-ink text-cream-50"
                      : "border border-line bg-white text-ink-soft hover:border-line-strong"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {view === "resumen" && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {selected.map((product) => {
                    const rank = ranking.get(product.id);
                    return (
                      <article
                        key={product.id}
                        className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white ${
                          rank === 1 ? "border-brand/30 shadow-card" : "border-line"
                        }`}
                      >
                        <div className="absolute left-4 top-4 z-10">
                          {rank === 1 ? (
                            <Badge tone="editor" icon={Trophy}>
                              Mejor nota
                            </Badge>
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-100 text-[11px] font-semibold text-ink-muted">
                              0{rank}
                            </span>
                          )}
                        </div>

                        <Link to={`/producto/${product.id}`} className="block">
                          <ProductMedia product={product} className="aspect-[4/3]" imgClassName="p-6" />
                        </Link>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                                {product.brand}
                              </p>
                              <h2 className="mt-1 font-sans text-[15px] font-semibold leading-snug text-ink">
                                <Link to={`/producto/${product.id}`} className="hover:text-brand">
                                  {product.model || product.shortName}
                                </Link>
                              </h2>
                            </div>
                            <ScoreBadge score={product.editorScore} size="sm" />
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <Stars rating={product.rating} showValue={product.reviewCount > 0} />
                            <span className="text-[10.5px] text-ink-muted">
                              {product.reviewCount > 0
                                ? `${product.reviewCount} opiniones`
                                : "Sin opiniones"}
                            </span>
                          </div>

                          <p className="mt-4 text-[24px] font-semibold tabular tracking-[-0.02em] text-ink">
                            {formatPrice(product.price)}
                          </p>

                          <ul className="mt-4 space-y-2 border-t border-line pt-4">
                            {product.pros.slice(0, 3).map((pro) => (
                              <li
                                key={pro}
                                className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft"
                              >
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                                <span className="line-clamp-2">{pro}</span>
                              </li>
                            ))}
                            {product.pros.length === 0 && (
                              <li className="text-[12.5px] text-ink-muted">
                                Sin ventajas destacadas en la ficha.
                              </li>
                            )}
                          </ul>

                          <div className="mt-auto flex gap-2 pt-5">
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
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {view === "especificaciones" && (
                <div className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-line">
                          <th className="sticky left-0 z-10 w-44 bg-cream-50 px-4 py-4 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                            Característica
                          </th>
                          {selected.map((product, index) => (
                            <th key={product.id} className="min-w-[200px] px-4 py-4 align-top">
                              <div className="flex items-center gap-2.5">
                                <ProductMedia
                                  product={product}
                                  className="h-10 w-10 shrink-0 rounded-lg border border-line"
                                  imgClassName="p-1"
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-[12px] font-semibold text-ink">
                                    {product.brand}
                                  </p>
                                  <p className="mt-0.5 truncate text-[10.5px] font-normal text-ink-muted">
                                    {product.model || product.name}
                                  </p>
                                </div>
                                <span
                                  className="ml-auto h-2 w-2 shrink-0 rounded-full"
                                  style={{ backgroundColor: SERIES_COLORS[index] }}
                                  aria-hidden="true"
                                />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <SpecRows group="Lo esencial" rows={ESSENTIAL_ROWS} selected={selected} />
                        {SPEC_SECTIONS.map((section) => (
                          <SpecRows
                            key={section.group}
                            group={section.group}
                            rows={section.rows}
                            selected={selected}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="border-t border-line px-4 py-3 text-[11px] text-ink-muted">
                    En verde, el mejor valor de cada fila cuando existe un criterio objetivo
                    (precio, autonomía, potencia o nota). Un guion significa que el dato no está
                    publicado.
                  </p>
                </div>
              )}

              {view === "puntuaciones" && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-2xl border border-line bg-white p-5">
                    <h2 className="font-sans text-[14px] font-semibold text-ink">Perfil comparado</h2>
                    <RadarChart
                      labels={SCORE_METRICS.map((metric) => metric.short)}
                      series={selected.map((product, index) => ({
                        name: product.brand,
                        color: SERIES_COLORS[index],
                        values: SCORE_METRICS.map((metric) => product.scores[metric.key]),
                      }))}
                    />
                  </div>

                  <div className="rounded-2xl border border-line bg-white p-5">
                    <h2 className="font-sans text-[14px] font-semibold text-ink">Criterio a criterio</h2>
                    <div className="mt-5 space-y-6">
                      {SCORE_METRICS.map((metric) => {
                        const values = selected.map((product) => product.scores[metric.key]);
                        const best = Math.max(...values);
                        return (
                          <div key={metric.key}>
                            <div className="mb-2 flex items-baseline justify-between gap-3">
                              <h3 className="font-sans text-[12.5px] font-medium text-ink-soft">
                                {metric.label}
                              </h3>
                              <span className="text-[10.5px] text-ink-muted">
                                peso {Math.round(metric.weight * 100)} %
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {selected.map((product, index) => {
                                const value = product.scores[metric.key];
                                return (
                                  <div key={product.id} className="flex items-center gap-2">
                                    <span className="w-14 shrink-0 truncate text-[10.5px] text-ink-muted">
                                      {product.brand}
                                    </span>
                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-100">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${value}%`,
                                          backgroundColor: SERIES_COLORS[index],
                                        }}
                                      />
                                    </div>
                                    <span
                                      className={`w-7 text-right text-[11px] tabular ${
                                        value === best ? "font-semibold text-success" : "text-ink-muted"
                                      }`}
                                    >
                                      {value}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {view === "graficas" && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {BAR_CHARTS.map((chart) => {
                    const definition = SPECS[chart.metric] || {};
                    return (
                      <div key={chart.metric} className="rounded-2xl border border-line bg-white p-5">
                        <h2 className="flex items-center gap-2 font-sans text-[13.5px] font-semibold text-ink">
                          <Gauge className="h-4 w-4 text-copper" aria-hidden="true" />
                          {chart.title}
                        </h2>
                        <BarChart
                          className="mt-4"
                          title={chart.title}
                          unit={definition.unit || ""}
                          higherIsBetter={definition.best !== "min"}
                          items={selected.map((product, index) => ({
                            name: product.shortName || product.name,
                            value: specValue(product, chart.metric) ?? 0,
                            color: SERIES_COLORS[index],
                          }))}
                        />
                      </div>
                    );
                  })}
                  <p className="rounded-2xl border border-line bg-cream-100/60 p-5 text-[11.5px] leading-relaxed text-ink-muted lg:col-span-3">
                    Las barras comparan el dato declarado por el fabricante, no una medición propia.
                    En autonomía y velocidad, más es mejor; en peso, menos es mejor. Si un modelo no
                    publica el dato, no entra en la gráfica.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Picker */}
        <section className="mt-12 border-t border-line pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                Añadir al comparador
              </p>
              <h2 className="mt-2 text-2xl text-ink sm:text-3xl">
                {selected.length === 0
                  ? "Elige un patinete"
                  : selected.length >= limit
                    ? "Tu comparación está completa"
                    : "Elige otro patinete"}
              </h2>
              {selected.length >= limit && (
                <p className="mt-2 text-[12.5px] text-ink-muted">
                  Quita uno de los {limit} seleccionados para cambiar el modelo.
                </p>
              )}
            </div>
            <label className="relative flex items-center">
              <span className="sr-only">Filtrar la lista</span>
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filtrar por marca o modelo"
                className="h-10 w-full rounded-full border border-line bg-white pl-9 pr-4 text-[12.5px] text-ink outline-none focus:border-brand/50 sm:w-64"
              />
            </label>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {picker.map((product) => {
              const selectedItem = isSelected(product.id);
              const atLimit = !selectedItem && selectedIds.length >= limit;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggle(product.id)}
                  disabled={atLimit}
                  aria-pressed={selectedItem}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                    selectedItem
                      ? "border-brand bg-brand-soft/50"
                      : atLimit
                        ? "cursor-not-allowed border-line bg-cream-50 opacity-50"
                        : "border-line bg-white hover:border-line-strong"
                  }`}
                >
                  <ProductMedia
                    product={product}
                    className="h-12 w-12 shrink-0 rounded-lg border border-line"
                    imgClassName="p-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">{product.shortName}</p>
                    <p className="mt-0.5 text-[10.5px] text-ink-muted">
                      {product.brand} · {formatPrice(product.price)} · {product.editorScore}/10
                    </p>
                  </div>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                      selectedItem
                        ? "border-brand bg-brand text-white"
                        : "border-line-strong text-ink-muted"
                    }`}
                  >
                    {selectedItem ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
            {picker.length === 0 && (
              <p className="rounded-xl border border-dashed border-line bg-white p-4 text-[12.5px] text-ink-muted sm:col-span-2">
                No hay modelos que coincidan con «{search}».
              </p>
            )}
          </div>
        </section>
      </Container>
    </div>
  );
}

function Highlight({ icon: Icon, label, product, value }) {
  if (!product) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
        <p className="truncate text-[12.5px] font-medium text-ink">{product.shortName}</p>
        <p className="text-[11px] text-ink-muted">{value}</p>
      </div>
    </div>
  );
}

function SpecRows({ group, rows, selected }) {
  return (
    <>
      <tr>
        <th
          colSpan={selected.length + 1}
          className="sticky left-0 bg-cream-100/80 px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted"
        >
          {group}
        </th>
      </tr>
      {rows.map((row) => {
        const values = selected.map((product) => row.get(product));
        let bestValue = null;
        if (row.best) {
          const numeric = values.filter((value) => typeof value === "number" && Number.isFinite(value));
          if (numeric.length > 1) {
            bestValue = row.best === "min" ? Math.min(...numeric) : Math.max(...numeric);
          }
        }

        return (
          <tr key={row.label} className="border-t border-line/70">
            <th className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left text-[12px] font-normal text-ink-muted">
              {row.label}
            </th>
            {selected.map((product, index) => {
              const raw = values[index];
              const isBest = bestValue !== null && raw === bestValue;
              return (
                <td
                  key={product.id}
                  className={`px-4 py-2.5 text-[12.5px] ${
                    isBest ? "bg-success/[0.06] font-semibold text-success" : "text-ink"
                  }`}
                >
                  {row.display(raw)}
                  {isBest && <span className="ml-1 text-[9px] uppercase tracking-wide">mejor</span>}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
