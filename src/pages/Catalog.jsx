import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import { ErrorState, LoadingGrid } from "../components/ui/PageState";
import AffiliateNote from "../components/ui/AffiliateNote";
import { useCatalog } from "../context/CatalogContext";
import { PRICE_BANDS, inPriceBand } from "../lib/site";
import { specValue } from "../lib/normalize-product";
import { useSEO } from "../lib/seo";

const SORT_OPTIONS = [
  { value: "relevancia", label: "Mejor puntuación" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "valoracion", label: "Mejor valorados" },
  { value: "opiniones", label: "Más opiniones" },
  { value: "autonomia", label: "Más autonomía" },
];

export default function Catalog() {
  const { products, brands, loading, error, reload } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get("q") || "";
  const gama = params.get("gama") || "";
  const ligero = params.get("ligero") === "1";
  const suspension = params.get("suspension") === "1";
  const uso = params.get("uso") || "";
  const selectedBrands = params.getAll("marca");
  const orden = params.get("orden") || "relevancia";

  const [term, setTerm] = useState(q);
  useEffect(() => setTerm(q), [q]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const toggleBrand = (brand) => {
    const next = new URLSearchParams(params);
    const current = next.getAll("marca");
    next.delete("marca");
    const updated = current.includes(brand)
      ? current.filter((item) => item !== brand)
      : [...current, brand];
    updated.forEach((item) => next.append("marca", item));
    setParams(next, { replace: true });
  };

  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const visible = useMemo(() => {
    const search = q.trim().toLowerCase();
    const words = search.split(/\s+/).filter(Boolean);
    const band = PRICE_BANDS.find((item) => item.id === gama);

    const list = products.filter((product) => {
      if (words.length) {
        if (!words.every((word) => product.searchIndex.includes(word))) return false;
      }
      if (band && !inPriceBand(product.price, band)) return false;
      if (selectedBrands.length && !selectedBrands.includes(product.brand)) return false;

      const weight = specValue(product, "peso_kg");
      if (ligero && !(typeof weight === "number" && weight > 0 && weight <= 14)) return false;
      if (suspension && !specValue(product, "suspension")) return false;
      if (
        uso === "commuter" &&
        !(product.scores.portability >= 60 && product.scores.autonomy >= 55)
      ) {
        return false;
      }
      return true;
    });

    switch (orden) {
      case "precio-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "precio-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "valoracion":
        return [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case "opiniones":
        return [...list].sort((a, b) => b.reviewCount - a.reviewCount);
      case "autonomia":
        return [...list].sort(
          (a, b) => (specValue(b, "autonomia_km") || 0) - (specValue(a, "autonomia_km") || 0)
        );
      default:
        return [...list].sort((a, b) => b.editorScore - a.editorScore);
    }
  }, [products, q, gama, selectedBrands, ligero, suspension, uso, orden]);

  const activeFilters = [
    gama && { key: "gama", label: PRICE_BANDS.find((band) => band.id === gama)?.label || gama },
    ligero && { key: "ligero", label: "Ligeros (≤ 14 kg)" },
    suspension && { key: "suspension", label: "Con suspensión" },
    uso === "commuter" && { key: "uso", label: "Para ir a trabajar" },
    ...selectedBrands.map((brand) => ({ key: `marca:${brand}`, label: brand, brand })),
  ].filter(Boolean);

  const activeCount = activeFilters.length + (q ? 1 : 0);

  useSEO({
    title: q ? `Patinetes para “${q}”` : "Todos los patinetes eléctricos",
    description:
      "Catálogo completo de patinetes eléctricos con filtros por precio, marca, peso y suspensión. Compara especificaciones y puntuaciones editoriales.",
    path: "/patinetes",
  });

  const removeFilter = (filter) => {
    if (filter.brand) {
      toggleBrand(filter.brand);
      return;
    }
    const next = new URLSearchParams(params);
    next.delete(filter.key);
    setParams(next, { replace: true });
  };

  return (
    <div className="bg-cream-50">
      <Container className="pb-16 pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Patinetes</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Catálogo {new Date().getFullYear()}
          </p>
          <h1 className="mt-3 text-4xl text-ink sm:text-5xl">
            {q ? `Resultados para “${q}”` : "Todos los patinetes, sin ruido"}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            {loading
              ? "Cargando el catálogo…"
              : `${visible.length} ${visible.length === 1 ? "modelo" : "modelos"} con datos comparables. Filtra por presupuesto, peso o suspensión.`}
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={() => setFiltersOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-4 py-2 text-[13px] font-medium text-ink"
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-white">
                    {activeCount}
                  </span>
                )}
              </button>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[12px] font-medium text-brand underline underline-offset-4"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            <div
              className={`mt-4 space-y-6 rounded-2xl border border-line bg-white p-5 lg:mt-0 ${
                filtersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Filtrar
                </p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-dark"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Limpiar
                  </button>
                )}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  updateParam("q", term.trim());
                }}
                role="search"
              >
                <label className="relative flex items-center">
                  <span className="sr-only">Buscar en el catálogo</span>
                  <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
                  <input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder="Marca o modelo"
                    className="h-10 w-full rounded-lg border border-line bg-cream-50 pl-9 pr-3 text-[13px] text-ink outline-none focus:border-brand/50 focus:bg-white"
                  />
                </label>
              </form>

              <FilterGroup title="Precio">
                <FilterChip active={!gama} onClick={() => updateParam("gama", "")}>
                  Cualquier precio
                </FilterChip>
                {PRICE_BANDS.map((band) => (
                  <FilterChip
                    key={band.id}
                    active={gama === band.id}
                    onClick={() => updateParam("gama", gama === band.id ? "" : band.id)}
                  >
                    {band.label}
                  </FilterChip>
                ))}
              </FilterGroup>

              <FilterGroup title="Uso">
                <label className="flex w-full cursor-pointer items-center gap-2 py-1 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={ligero}
                    onChange={() => updateParam("ligero", ligero ? "" : "1")}
                    className="h-3.5 w-3.5 rounded border-line-strong accent-brand"
                  />
                  Ligeros (≤ 14 kg)
                </label>
                <label className="flex w-full cursor-pointer items-center gap-2 py-1 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={suspension}
                    onChange={() => updateParam("suspension", suspension ? "" : "1")}
                    className="h-3.5 w-3.5 rounded border-line-strong accent-brand"
                  />
                  Con suspensión
                </label>
                <label className="flex w-full cursor-pointer items-center gap-2 py-1 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={uso === "commuter"}
                    onChange={() => updateParam("uso", uso === "commuter" ? "" : "commuter")}
                    className="h-3.5 w-3.5 rounded border-line-strong accent-brand"
                  />
                  Para ir a trabajar
                </label>
              </FilterGroup>

              <FilterGroup title="Marca">
                {brands.map((brand) => {
                  const count = products.filter((product) => product.brand === brand).length;
                  return (
                    <label
                      key={brand}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 py-1 text-[13px] text-ink-soft hover:text-ink"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="h-3.5 w-3.5 rounded border-line-strong accent-brand"
                        />
                        {brand}
                      </span>
                      <span className="text-[11px] text-ink-muted">{count}</span>
                    </label>
                  );
                })}
              </FilterGroup>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {q && <ActiveChip label={`“${q}”`} onRemove={() => updateParam("q", "")} />}
                {activeFilters.map((filter) => (
                  <ActiveChip
                    key={filter.key}
                    label={filter.label}
                    onRemove={() => removeFilter(filter)}
                  />
                ))}
                {activeCount === 0 && (
                  <p className="text-[12.5px] text-ink-muted">
                    Sin filtros activos · ordenado por puntuación
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-[12px] text-ink-muted">
                <span className="hidden sm:inline">Ordenar:</span>
                <select
                  value={orden}
                  onChange={(event) => updateParam("orden", event.target.value)}
                  className="h-9 rounded-lg border border-line bg-white px-2.5 text-[12.5px] text-ink outline-none focus:border-brand/50"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <LoadingGrid count={6} />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-100 text-ink-muted">
                  <Search className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-2xl text-ink">No hay resultados</h2>
                <p className="mt-2 max-w-sm text-sm text-ink-muted">
                  Prueba a quitar algún filtro o busca una marca concreta. El catálogo se actualiza
                  con los modelos disponibles.
                </p>
                <Button variant="outline" className="mt-6" onClick={clearAll}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <AffiliateNote className="mt-8" />
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {title}
      </legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-cream-50 text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ActiveChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-1 pl-3 pr-1.5 text-[11.5px] font-medium text-brand">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4.5 w-4.5 items-center justify-center rounded-full hover:bg-brand/15"
        aria-label={`Quitar filtro ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
