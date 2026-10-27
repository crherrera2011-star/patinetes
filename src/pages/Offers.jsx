import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Info,
  Percent,
  Scale,
  Wallet,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import ProductMedia from "../components/product/ProductMedia";
import ScoreBadge from "../components/ui/ScoreBadge";
import AffiliateNote from "../components/ui/AffiliateNote";
import { ErrorState, LoadingGrid } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { PRICE_BANDS, inPriceBand } from "../lib/site";
import { formatDate, formatPrice, median } from "../lib/format";
import { useSEO } from "../lib/seo";

const SORT_OPTIONS = [
  { value: "desviacion", label: "Mayor ahorro frente a la mediana" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "puntuacion", label: "Mejor puntuación" },
];

export default function Offers() {
  const { products, loading, error, reload, lastUpdated } = useCatalog();
  const [sort, setSort] = useState("desviacion");

  const medianPrice = useMemo(
    () => median(products.map((product) => product.price).filter(Boolean)),
    [products]
  );
  const belowMedian = useMemo(
    () =>
      products
        .filter((product) => product.pricePosition <= -5)
        .sort((a, b) => a.pricePosition - b.pricePosition),
    [products]
  );

  const bestByBand = useMemo(
    () =>
      PRICE_BANDS.map((band) => {
        const inBand = products.filter((product) => inPriceBand(product.price, band));
        return {
          band,
          product: [...inBand].sort((a, b) => b.editorScore - a.editorScore)[0],
        };
      }).filter((entry) => entry.product),
    [products]
  );

  const rows = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "precio-asc":
        return list.sort((a, b) => a.price - b.price);
      case "puntuacion":
        return list.sort((a, b) => b.editorScore - a.editorScore);
      default:
        return list.sort((a, b) => a.pricePosition - b.pricePosition);
    }
  }, [products, sort]);

  useSEO({
    title: "Precios de patinetes eléctricos",
    description:
      "Precios orientativos actualizados y comparación con la mediana del catálogo. Sin descuentos simulados: solo el precio real y su contexto.",
    path: "/ofertas",
  });

  return (
    <div className="bg-cream-50 pb-16">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Precios</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Precios y valor
          </p>
          <h1 className="mt-3 text-4xl text-ink sm:text-5xl">
            Precios reales. Sin rebajas inventadas.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            No podemos verificar el «precio anterior» de un patinete, así que no lo inventamos. Aquí
            comparamos el precio actual con la mediana de nuestro catálogo y con la puntuación
            editorial. Última revisión: {formatDate(lastUpdated)}.
          </p>
        </header>

        {loading ? (
          <div className="mt-10">
            <LoadingGrid count={6} />
          </div>
        ) : error ? (
          <div className="mt-10">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <dl className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  icon: Scale,
                  label: "Precio mediano",
                  value: formatPrice(medianPrice),
                  hint: `${products.length} modelos`,
                },
                {
                  icon: Wallet,
                  label: "Desde",
                  value: formatPrice(Math.min(...products.map((product) => product.price))),
                  hint: "La opción más ajustada",
                },
                {
                  icon: Percent,
                  label: "Por debajo de la mediana",
                  value: `${belowMedian.length}`,
                  hint: "Precio real vs. mediana del catálogo",
                },
                {
                  icon: Info,
                  label: "Actualización",
                  value: formatDate(lastUpdated, { month: "short", year: undefined }),
                  hint: "Datos de ficha",
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-line bg-white p-4">
                  <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    <stat.icon className="h-3.5 w-3.5 text-copper" aria-hidden="true" />
                    {stat.label}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold tabular text-ink">{stat.value}</dd>
                  <dd className="mt-0.5 text-[11px] text-ink-muted">{stat.hint}</dd>
                </div>
              ))}
            </dl>

            {/* Below median */}
            <section className="mt-14">
              <SectionHeading
                eyebrow="Oportunidades"
                title="Por debajo de la mediana del catálogo"
                description="No son «ofertas flash»: son patinetes cuyo precio actual está al menos un 5 % por debajo de la mediana de los modelos que comparamos."
              />
              {belowMedian.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {belowMedian.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      award={`${Math.abs(product.pricePosition)} % bajo la mediana`}
                      awardTone="value"
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl border border-line bg-white p-6 text-[13.5px] text-ink-muted">
                  Ahora mismo ningún patinete está claramente por debajo de la mediana. Es una buena
                  señal: los precios están agrupados. Vuelve a revisar en unos días.
                </p>
              )}
            </section>

            {/* Best by budget */}
            <section className="mt-14">
              <SectionHeading
                eyebrow="Según presupuesto"
                title="El mejor de cada franja"
                description="La nota más alta dentro de cada rango de precio. Si tu presupuesto es fijo, empieza por aquí."
              />
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bestByBand.map(({ band, product }) => (
                  <article key={band.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="flex items-center justify-between gap-2 border-b border-line bg-cream-50 px-4 py-3">
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                        {band.label}
                      </p>
                      <ScoreBadge score={product.editorScore} size="sm" />
                    </div>
                    <div className="flex gap-4 p-4">
                      <ProductMedia
                        product={product}
                        className="h-24 w-24 shrink-0 rounded-xl"
                        imgClassName="p-2"
                      />
                      <div className="min-w-0">
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          {product.brand}
                        </p>
                        <h3 className="mt-1 font-sans text-[13.5px] font-semibold leading-snug text-ink">
                          <Link to={`/producto/${product.id}`} className="hover:text-brand">
                            {product.model || product.shortName}
                          </Link>
                        </h3>
                        <p className="mt-1.5 text-[15px] font-semibold tabular text-ink">
                          {formatPrice(product.price)}
                        </p>
                        <Link
                          to={`/producto/${product.id}`}
                          className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand hover:text-brand-dark"
                        >
                          Ver análisis
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Full table */}
            <section className="mt-14">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading
                  eyebrow="Todos los precios"
                  title="La tabla completa"
                  description="Precio orientativo, nota editorial y desviación respecto a la mediana."
                />
                <label className="flex items-center gap-2 text-[12px] text-ink-muted">
                  <span className="hidden sm:inline">Ordenar:</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
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

              <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line bg-cream-50 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                        <th className="px-4 py-3 font-semibold">Modelo</th>
                        <th className="px-4 py-3 font-semibold">Nota</th>
                        <th className="px-4 py-3 font-semibold">Precio</th>
                        <th className="px-4 py-3 font-semibold">Vs. mediana</th>
                        <th className="px-4 py-3 text-right font-semibold">Enlace</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((product) => (
                        <tr key={product.id} className="border-t border-line/70 hover:bg-cream-50/60">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <ProductMedia
                                product={product}
                                className="h-11 w-11 shrink-0 rounded-lg border border-line"
                                imgClassName="p-1"
                              />
                              <div className="min-w-0">
                                <Link
                                  to={`/producto/${product.id}`}
                                  className="block max-w-[280px] truncate text-[12.5px] font-medium text-ink hover:text-brand"
                                >
                                  {product.model || product.shortName}
                                </Link>
                                <p className="text-[10.5px] text-ink-muted">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <ScoreBadge score={product.editorScore} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-[13px] font-semibold tabular text-ink">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-4 py-3">
                            <PositionChip position={product.pricePosition} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={product.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:text-brand-dark"
                            >
                              Amazon
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <AffiliateNote className="mt-4" />
            </section>

            {/* Method note */}
            <section className="mt-14 grid grid-cols-1 gap-6 rounded-3xl border border-line bg-cream-100/60 p-6 sm:p-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <h2 className="text-2xl text-ink">Cómo leer estos precios</h2>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
                  La mediana divide el catálogo en dos mitades: es más estable que la media y evita
                  que un modelo muy caro distorsione la referencia. Si un patinete está un 20 % por
                  debajo, es una buena señal; si está por encima, compara con su ficha antes de
                  descartarlo.
                </p>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Los precios son orientativos y pueden cambiar en Amazon.",
                  "No mostramos descuentos que no podamos verificar.",
                  "Una nota alta no siempre es la compra más inteligente.",
                  "Confirma siempre el vendedor y los gastos de envío.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-xl border border-line bg-white p-3.5 text-[12.5px] leading-relaxed text-ink-soft"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </Container>
    </div>
  );
}

function PositionChip({ position }) {
  if (position < -3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[10.5px] font-semibold text-success">
        ↓ {Math.abs(position)} % vs mediana
      </span>
    );
  }
  if (position > 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-[10.5px] font-semibold text-warning">
        ↑ {position} % vs mediana
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-[10.5px] font-medium text-ink-muted">
      En la mediana
    </span>
  );
}
