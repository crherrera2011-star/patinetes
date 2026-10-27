import { Link } from "react-router-dom";
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
import SectionHeading from "../components/ui/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import { ErrorState, PageLoader } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { CATEGORIES, countCategory } from "../data/categories";
import { useSEO } from "../lib/seo";

const ICONS = {
  briefcase: Briefcase,
  feather: Feather,
  wallet: Wallet,
  scale: Scale,
  zap: Zap,
  waves: Waves,
};

export default function Categories() {
  const { products, loading, error, reload } = useCatalog();

  useSEO({
    title: "Categorías de patinetes eléctricos",
    description:
      "Explora los patinetes eléctricos por uso y presupuesto: para ir a trabajar, ligeros, hasta 400 €, gama media, premium y modelos con suspensión.",
    path: "/categorias",
  });

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <Container className="py-20">
        <ErrorState message={error} onRetry={reload} />
      </Container>
    );
  }

  return (
    <div className="bg-cream-50 pb-16">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Categorías</span>
        </nav>

        <header className="mt-6 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Explora por necesidad
          </p>
          <h1 className="mt-3 text-4xl text-ink sm:text-5xl">Categorías</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            Seis formas de acotar la búsqueda. Cada categoría enlaza al catálogo ya filtrado, con las
            mismas puntuaciones y datos comparables.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const Icon = ICONS[category.icon] || Zap;
            const count = countCategory(products, category);
            return (
              <Link
                key={category.id}
                to={category.href}
                className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10.5px] font-medium text-ink-muted">{count} modelos</span>
                </div>
                <h2 className="mt-4 font-sans text-lg font-semibold text-ink group-hover:text-brand">
                  {category.title}
                </h2>
                <p className="mt-1 text-[11.5px] font-medium uppercase tracking-[0.1em] text-copper">
                  {category.short}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{category.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand">
                  Ver selección
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>

      {CATEGORIES.map((category, index) => {
        const Icon = ICONS[category.icon] || Zap;
        const items = products
          .filter(category.filter)
          .sort((a, b) => b.editorScore - a.editorScore)
          .slice(0, 3);

        if (!items.length) return null;

        return (
          <Container key={category.id} className={index === 0 ? "mt-16" : "mt-14"}>
            <SectionHeading
              eyebrow={`${countCategory(products, category)} modelos`}
              title={
                <span className="inline-flex items-center gap-3">
                  <Icon className="h-6 w-6 text-copper" aria-hidden="true" />
                  {category.title}
                </span>
              }
              action={
                <Button as={Link} to={category.href} variant="outline" size="sm">
                  Ver los {countCategory(products, category)}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              }
            />
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        );
      })}
    </div>
  );
}
