import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Feather,
  Gauge,
  ListChecks,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import Stars from "../components/ui/Stars";
import ScoreBadge from "../components/ui/ScoreBadge";
import Badge from "../components/ui/Badge";
import ProductCard from "../components/product/ProductCard";
import ProductMedia from "../components/product/ProductMedia";
import AffiliateNote from "../components/ui/AffiliateNote";
import { ErrorState, LoadingGrid } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { buildPicks, SCORE_METRICS } from "../lib/normalize-product";
import { CATEGORIES } from "../data/categories";
import { FAQS } from "../data/faqs";
import { formatCompact, formatDate, formatPrice } from "../lib/format";
import { faqSchema, useSEO } from "../lib/seo";

const CATEGORY_ICONS = {
  briefcase: Briefcase,
  feather: Feather,
  wallet: Wallet,
  scale: Scale,
  zap: Zap,
  waves: Waves,
};

export default function Home() {
  const { products, brands, loading, error, reload, lastUpdated } = useCatalog();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const picks = useMemo(() => buildPicks(products), [products]);
  const editorPick = picks[0];
  const totalReviews = useMemo(
    () => products.reduce((total, product) => total + product.reviewCount, 0),
    [products]
  );

  useSEO({
    title: "Comparativa de patinetes eléctricos 2026",
    description:
      "Comparativas independientes de patinetes eléctricos: autonomía real, potencia, frenos, peso y precio. Encuentra el patinete que encaja con tus trayectos.",
    path: "/",
    jsonLd: faqSchema(FAQS.slice(0, 4)),
  });

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/patinetes?q=${encodeURIComponent(value)}` : "/patinetes");
  };

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="hero-surface hero-grain relative isolate overflow-hidden">
        <img
          src="/images/hero-patinete.svg"
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center] opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/92 to-ink/25" />

        <Container className="grid grid-cols-1 gap-14 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-cream-200/85 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden="true" />
              Guía independiente · actualizada {formatDate(lastUpdated)}
            </span>

            <h1 className="mt-6 max-w-2xl text-[2.75rem] leading-[0.98] text-cream-50 sm:text-6xl lg:text-[4.4rem]">
              La ciudad, a la <span className="italic text-copper">velocidad</span> que eliges.
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cream-200/75 sm:text-base">
              Comparamos patinetes eléctricos con criterios claros —autonomía real, potencia,
              frenos, peso y precio— para que aciertes sin leer cien opiniones contradictorias.
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-xl" role="search">
              <label className="flex items-center gap-2 rounded-full bg-cream-50 p-1.5 pl-4 shadow-lift">
                <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="sr-only">Buscar patinetes</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Marca, modelo o presupuesto…"
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
                />
                <Button type="submit" size="md" className="shrink-0">
                  Buscar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </label>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {[
                { label: "Hasta 400 €", to: "/patinetes?gama=entrada" },
                { label: "Ligeros (≤ 14 kg)", to: "/patinetes?ligero=1" },
                { label: "Con suspensión", to: "/patinetes?suspension=1" },
              ].map((chip) => (
                <Link
                  key={chip.label}
                  to={chip.to}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[12px] text-cream-200/80 transition-colors hover:border-copper hover:text-white"
                >
                  {chip.label}
                </Link>
              ))}
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                { value: loading ? "—" : products.length, label: "modelos analizados" },
                { value: loading ? "—" : brands.length, label: "marcas comparadas" },
                {
                  value: loading ? "—" : formatCompact(totalReviews),
                  label: "opiniones revisadas",
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-2xl font-semibold tabular text-cream-50">{stat.value}</dd>
                  <dd className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-cream-200/65">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Editor pick */}
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-full border border-white/10 lg:block" aria-hidden="true" />
            <div className="absolute -bottom-8 -right-6 hidden h-40 w-40 rounded-full bg-copper/10 blur-2xl lg:block" aria-hidden="true" />

            <div className="relative overflow-hidden rounded-3xl bg-cream-50 p-5 shadow-lift ring-1 ring-white/20">
              <div className="flex items-center justify-between gap-3">
                <Badge tone="editor" icon={Award}>
                  Elección del editor
                </Badge>
                {editorPick && <ScoreBadge score={editorPick.editorScore} size="sm" />}
              </div>

              {editorPick ? (
                <>
                  <Link to={`/producto/${editorPick.id}`} className="mt-4 block">
                    <ProductMedia
                      product={editorPick}
                      priority
                      className="aspect-[4/3] rounded-2xl"
                      imgClassName="p-6"
                    />
                  </Link>

                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                      {editorPick.brand}
                    </p>
                    <h2 className="mt-1 font-sans text-[17px] font-semibold leading-snug text-ink">
                      <Link to={`/producto/${editorPick.id}`} className="hover:text-brand">
                        {editorPick.model || editorPick.shortName || editorPick.name}
                      </Link>
                    </h2>
                    <div className="mt-2 flex items-center gap-2">
                      <Stars rating={editorPick.rating} showValue={editorPick.reviewCount > 0} />
                      <span className="text-[11px] text-ink-muted">
                        {editorPick.reviewCount > 0
                          ? `${formatCompact(editorPick.reviewCount)} reseñas`
                          : "Sin reseñas todavía"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                      <div>
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          Precio orientativo
                        </p>
                        <p className="text-2xl font-semibold tabular text-ink">
                          {formatPrice(editorPick.price)}
                        </p>
                      </div>
                      <Button
                        href={editorPick.affiliateUrl}
                        size="md"
                        className="whitespace-nowrap"
                      >
                        Ver en Amazon
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="skeleton aspect-[4/3] rounded-2xl" />
                  <div className="skeleton h-4 w-4/5 rounded-full" />
                  <div className="skeleton h-4 w-3/5 rounded-full" />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* --------------------------------------------------------- Trust strip */}
      <section className="border-b border-line bg-cream-100/60">
        <Container className="grid grid-cols-2 gap-x-6 gap-y-5 py-6 sm:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Sin publicidad pagada", text: "Nadie compra su posición" },
            { icon: Gauge, title: "6 criterios ponderados", text: "Una nota, comparable" },
            { icon: ListChecks, title: "Datos de la ficha", text: "Especificaciones verificadas" },
            { icon: Zap, title: "Enfoque real", text: "Autonomía y uso diario" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-2.5">
              <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-copper" aria-hidden="true" />
              <div>
                <p className="text-[12.5px] font-semibold text-ink">{item.title}</p>
                <p className="text-[11.5px] text-ink-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ----------------------------------------------------------- Selection */}
      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Nuestra selección 2026"
            title="Tres formas de acertar"
            description="El mejor en conjunto, el que ofrece más patinete por euro y la opción más sensata si el presupuesto manda. Sin rellenar la lista con veinte modelos."
            action={
              <Button as={Link} to="/patinetes" variant="outline" size="sm">
                Ver todo el catálogo
                <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />

          <div className="mt-10">
            {loading ? (
              <LoadingGrid count={3} />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {picks.map((pick) => (
                  <ProductCard
                    key={pick.id}
                    product={pick}
                    award={pick.award}
                    awardTone={pick.awardTone}
                  />
                ))}
                {picks.length === 0 && (
                  <p className="text-sm text-ink-muted">Todavía no hay patinetes publicados.</p>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Categories */}
      <section className="border-y border-line bg-cream-100/50 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Explora por necesidad"
            title="Encuentra tu punto de partida"
            description="No todas las comparativas empiezan por el precio. Filtra por el uso que le vas a dar."
          />

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.icon] || Zap;
              const count = products.filter(category.filter).length;

              return (
                <Link
                  key={category.id}
                  to={category.href}
                  className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-cream-100 px-2.5 py-1 text-[10.5px] font-medium text-ink-muted">
                      {loading ? "…" : `${count} modelos`}
                    </span>
                  </div>
                  <h3 className="mt-4 font-sans text-[17px] font-semibold text-ink group-hover:text-brand">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.1em] text-copper">
                    {category.short}
                  </p>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-muted">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand">
                    Ver selección
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Methodology */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Metodología"
                title="Menos opiniones, más criterio."
                description="Cada patinete recibe una nota sobre 10 a partir de seis criterios ponderados. La velocidad punta no manda: importa la autonomía real y la seguridad. Ninguna marca puede pagar por subir puestos."
              />
              <ul className="mt-7 space-y-3">
                {[
                  "Partimos de las especificaciones publicadas por el fabricante.",
                  "Cruzamos la ficha con las opiniones de compradores verificados.",
                  "Penalizamos el peso excesivo y las funciones que no sirven en ciudad.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button as={Link} to="/guia-2026#metodologia" variant="outline" className="mt-7">
                Ver la metodología completa
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                  Cómo se compone la nota
                </p>
                <ScoreBadge score={8.6} size="sm" />
              </div>
              <dl className="mt-6 space-y-4">
                {SCORE_METRICS.map((metric) => (
                  <div key={metric.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[13px] text-ink-soft">{metric.label}</dt>
                      <dd className="text-[12px] font-semibold tabular text-ink">
                        {Math.round(metric.weight * 100)} %
                      </dd>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-copper"
                        style={{ width: `${metric.weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-6 border-t border-line pt-4 text-[11.5px] leading-relaxed text-ink-muted">
                Una nota alta no significa que sea el mejor para ti: el peso, la altura del manillar
                o la suspensión importan. Por eso cada ficha incluye un apartado «ideal para».
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- FAQ */}
      <section id="faq" className="border-t border-line bg-cream-100/50 py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading
              eyebrow="Antes de comprar"
              title="Preguntas frecuentes"
              description="Las dudas que aparecen siempre cuando se compra el primer patinete eléctrico."
              action={
                <Button as={Link} to="/guia-2026" variant="link" className="justify-start">
                  Leer la guía completa
                  <ArrowRight className="h-4 w-4" />
                </Button>
              }
            />

            <div className="divide-y divide-line border-y border-line">
              {FAQS.slice(0, 4).map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14.5px] font-medium text-ink marker:content-none">
                    {faq.question}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-muted transition-transform group-open:rotate-45">
                      <span className="text-base leading-none">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Final CTA */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="hero-surface hero-grain relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
                Comparador
              </p>
              <h2 className="mt-3 text-3xl text-cream-50 sm:text-4xl">
                Dos patinetes. Una decisión.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream-200/70">
                Selecciona hasta tres modelos y compáralos lado a lado: especificaciones, notas por
                criterio y precio. Sin abrir diez pestañas.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button as={Link} to="/comparador" size="lg">
                  Abrir el comparador
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button as={Link} to="/ofertas" variant="ghost" size="lg" className="text-cream-200 hover:bg-white/10 hover:text-white">
                  Ver precios actuales
                </Button>
              </div>
            </div>
          </div>

          <AffiliateNote className="mx-auto mt-8 max-w-2xl text-center sm:text-left" />
        </Container>
      </section>
    </>
  );
}
