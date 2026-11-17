import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  Feather,
  Scale,
  Wallet,
  Waves,
  Zap,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import ArticleCard from "../components/ui/ArticleCard";
import AffiliateNote from "../components/ui/AffiliateNote";
import { ErrorState, PageLoader } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { CATEGORIES, getCategory } from "../data/categories";
import { getArticle } from "../data/articles";
import { formatPrice } from "../lib/format";
import { breadcrumbSchema, faqSchema, itemListSchema, useSEO } from "../lib/seo";
import NotFound from "./NotFound";

const ICONS = {
  briefcase: Briefcase,
  feather: Feather,
  wallet: Wallet,
  scale: Scale,
  zap: Zap,
  waves: Waves,
};

export default function CategoryDetail() {
  const { slug } = useParams();
  const { products, loading, error, reload } = useCatalog();
  const category = getCategory(slug);

  const items = useMemo(() => {
    if (!category) return [];
    return [...products].filter(category.filter).sort((a, b) => b.editorScore - a.editorScore);
  }, [products, category]);

  const priceFrom = useMemo(() => {
    const prices = items.map((product) => Number(product.price)).filter((price) => price > 0);
    return prices.length ? Math.min(...prices) : 0;
  }, [items]);

  const averageScore = useMemo(() => {
    if (!items.length) return 0;
    const total = items.reduce((sum, product) => sum + (Number(product.editorScore) || 0), 0);
    return total / items.length;
  }, [items]);

  const relatedArticles = useMemo(
    () => (category?.related || []).map((articleSlug) => getArticle(articleSlug)).filter(Boolean),
    [category]
  );

  const path = category ? `/categorias/${category.slug}` : "/categorias";
  const crumbs = category
    ? [
        { name: "Inicio", path: "/" },
        { name: "Categorías", path: "/categorias" },
        { name: category.title, path },
      ]
    : [];

  useSEO({
    title: category ? category.metaTitle : "Categoría no encontrada",
    description: category
      ? category.metaDescription
      : "La categoría que buscas no existe. Vuelve al índice de categorías para encontrar tu patinete.",
    path,
    noindex: !category,
    jsonLd: category
      ? [
          breadcrumbSchema(crumbs),
          ...(category.faq?.length ? [faqSchema(category.faq)] : []),
          ...(items.length
            ? [itemListSchema({ name: category.h1, path, items: items.slice(0, 10) })]
            : []),
        ]
      : null,
  });

  if (!category) return <NotFound />;
  if (loading) return <PageLoader />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState message={error} onRetry={reload} />
      </Container>
    );
  }

  const Icon = ICONS[category.icon] || Zap;

  return (
    <div className="bg-cream-50 pb-16">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link to="/categorias" className="hover:text-brand">
            Categorías
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">{category.title}</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {category.short}
            </span>
          </div>

          <h1 className="mt-4 text-4xl leading-[1.05] text-ink sm:text-5xl">{category.h1}</h1>

          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{category.description}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-[12px] text-ink-muted">
            <span className="rounded-full border border-line bg-white px-3 py-1.5">
              {items.length} {items.length === 1 ? "modelo" : "modelos"}
            </span>
            {priceFrom > 0 && (
              <span className="rounded-full border border-line bg-white px-3 py-1.5">
                Desde {formatPrice(priceFrom)}
              </span>
            )}
            {averageScore > 0 && (
              <span className="rounded-full border border-line bg-white px-3 py-1.5">
                Nota media {averageScore.toFixed(1)}/10
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to={category.href} size="md">
              Ver en el catálogo filtrado
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as={Link} to="/comparador" variant="outline" size="md">
              <Scale className="h-4 w-4" />
              Comparar modelos
            </Button>
          </div>
        </header>
      </Container>

      <Container className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]">
            Nuestra selección
          </h2>
          <Link
            to={category.href}
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand hover:text-brand-dark"
          >
            Ver todos los filtros
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {items.length ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-ink">
              Ahora mismo no hay modelos que cumplan este criterio.
            </p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
              El catálogo se actualiza cada semana. Mientras tanto, puedes explorar el resto de
              patinetes por precio, peso o uso.
            </p>
            <Button as={Link} to="/patinetes" variant="outline" size="sm" className="mt-5">
              Ver todo el catálogo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Container>

      <Container className="mt-14">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Antes de decidir
          </p>
          <h2 className="mt-3 text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]">
            Cómo elegir
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Los factores que más pesan en esta categoría.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {category.guide.map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-line bg-white p-5">
              <span className="text-[11px] font-semibold tabular text-copper">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-sans text-[15px] font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-14">
        <section id="faq" className="max-w-3xl scroll-mt-28">
          <h2 className="text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]">
            Preguntas frecuentes
          </h2>
          <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white px-5 sm:px-7">
            {category.faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink marker:content-none">
                  {item.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-muted transition-transform group-open:rotate-45">
                    <span className="text-base leading-none">+</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </Container>

      {relatedArticles.length > 0 && (
        <Container className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]">
              Para seguir decidiendo
            </h2>
            <Link
              to="/articulos"
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand hover:text-brand-dark"
            >
              Todas las guías
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {relatedArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </Container>
      )}

      <Container className="mt-14">
        <div className="rounded-2xl border border-line bg-cream-100 p-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
            Otras categorías
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.filter((item) => item.id !== category.id).map((item) => (
              <Link
                key={item.id}
                to={`/categorias/${item.slug}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-line bg-white p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[12px] font-semibold text-brand">
            PE
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-ink">Cómo se elige esta selección</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
              Partimos de las especificaciones del catálogo y de la metodología de seis criterios.
              Cuando un dato no está publicado, se muestra «—»: no se estima ni se copia de otro
              modelo.{" "}
              <Link to="/guia-2026" className="text-brand underline underline-offset-2">
                Ver metodología
              </Link>
              .
            </p>
          </div>
        </div>

        <AffiliateNote className="mt-6" />
      </Container>
    </div>
  );
}
