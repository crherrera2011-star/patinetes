import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import ArticleCard from "../components/ui/ArticleCard";
import { ARTICLES, FULL_ARTICLES } from "../data/articles";
import { breadcrumbSchema, useSEO } from "../lib/seo";
import { SITE } from "../lib/site";

const GUIDES = ARTICLES.filter((article) => !article.slug);

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Guías y comparativas de patinetes eléctricos",
  itemListElement: FULL_ARTICLES.map((article, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: article.title,
    url: `${SITE.url}${article.path}`,
  })),
};

export default function Articulos() {
  useSEO({
    title: "Guías y comparativas de patinetes eléctricos 2026",
    description:
      "Comparativas cara a cara, guías de potencia, autonomía y presupuesto para elegir patinete eléctrico con datos, tablas y precios orientativos.",
    path: "/articulos",
    jsonLd: [
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Artículos", path: "/articulos" },
      ]),
      itemListSchema,
    ],
  });

  return (
    <div className="bg-cream-50 pb-16">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">Artículos</span>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Biblioteca · {FULL_ARTICLES.length} comparativas y {GUIDES.length} guías
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            Guías y comparativas para decidir
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            Comparativas cara a cara, dudas de potencia y presupuesto, y respuestas concretas para
            quien ya está a punto de comprar. Sin relleno y con las tablas delante.
          </p>
        </header>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-white p-5">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            Cada artículo enlaza a las fichas del catálogo y a las guías relacionadas. Si buscas una
            comparativa entre dos modelos concretos, abre el{" "}
            <Link to="/comparador" className="text-brand underline underline-offset-2">
              comparador
            </Link>{" "}
            y los enfrentas en una sola tabla.
          </p>
        </div>

        <section className="mt-12">
          <SectionHeading
            eyebrow="Comparativas y compras"
            title="Elige por lo que te preocupa"
            description="Precio, cuestas, peso, autonomía o uso diario: cada pieza responde a una duda concreta."
          />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FULL_ARTICLES.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-line pt-10">
          <SectionHeading
            eyebrow="Guías completas"
            title="Las páginas de referencia"
            description="Metodología, normativa, autonomía real y ranking por presupuesto."
          />
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {GUIDES.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index + FULL_ARTICLES.length} />
            ))}
          </div>
        </section>

        <section className="hero-surface hero-grain relative mt-12 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl text-cream-50 sm:text-4xl">Vuelve a la selección</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
              La página principal reúne la elección del editor, las categorías y el acceso al
              catálogo completo.
            </p>
            <Button as={Link} to="/" size="lg" className="mt-6">
              Volver al inicio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </Container>
    </div>
  );
}
