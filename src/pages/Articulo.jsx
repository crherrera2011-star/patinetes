import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, Clock3 } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import AffiliateNote from "../components/ui/AffiliateNote";
import ArticleCard from "../components/ui/ArticleCard";
import ArticleBlocks, { slugifyHeading } from "../components/articulos/ArticleBlocks";
import { useCatalog } from "../context/CatalogContext";
import { getArticle, getRelated } from "../data/articles";
import { formatDate } from "../lib/format";
import { articleSchema, breadcrumbSchema, faqSchema, useSEO } from "../lib/seo";

export default function Articulo() {
  const { slug } = useParams();
  const article = getArticle(slug);
  const { products, loading } = useCatalog();

  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const headings = useMemo(
    () => (article?.sections || []).filter((block) => block.type === "h2"),
    [article]
  );

  const related = article ? getRelated(article) : [];

  useSEO({
    title: article ? article.title : "Artículo no encontrado",
    description: article?.description,
    path: article ? article.path : "/articulos",
    noindex: !article,
    ogType: article ? "article" : "website",
    jsonLd: article
      ? [
          articleSchema({
            title: article.h1,
            description: article.description,
            path: article.path,
            datePublished: article.date,
            dateModified: article.date,
          }),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Artículos", path: "/articulos" },
            { name: article.title, path: article.path },
          ]),
          ...(article.faq?.length ? [faqSchema(article.faq)] : []),
        ]
      : null,
  });

  if (!article) {
    return (
      <Container className="py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Artículos</p>
        <h1 className="mt-3 text-3xl text-ink">Esta guía no existe</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
          Puede que el enlace esté mal o que la hayamos movido. Todas las comparativas están en el
          índice de artículos.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button as={Link} to="/articulos">
            Ver todos los artículos
          </Button>
          <Button as={Link} to="/" variant="outline">
            Volver al inicio
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-cream-50 pb-16">
      <div className={`h-1.5 w-full bg-gradient-to-r ${article.tone}`} aria-hidden="true" />

      <Container className="pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <Link to="/" className="hover:text-brand">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link to="/articulos" className="hover:text-brand">
              Artículos
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-ink">{article.category}</span>
          </nav>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>

        <header className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {article.readingTime} de lectura
            </span>
          </div>

          <h1 className="mt-4 text-4xl leading-[1.04] text-ink sm:text-[3rem]">{article.h1}</h1>

          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{article.intro}</p>

          <p className="mt-4 text-[11.5px] text-ink-muted">
            Publicado el {formatDate(article.date)} · Equipo editorial de Patinetes Eléctricos
          </p>
        </header>

        <div className="mt-8 max-w-3xl rounded-2xl border border-brand/20 bg-brand-soft/50 p-5">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
            Lo esencial
          </p>
          <ul className="mt-3 space-y-2">
            {article.takeaways.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Contenido del artículo" className="mt-6 flex max-w-3xl flex-wrap gap-2 lg:hidden">
          {headings.map((heading) => (
            <a
              key={heading.text}
              href={`#${slugifyHeading(heading.text)}`}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
            >
              {heading.text}
            </a>
          ))}
        </nav>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="max-w-3xl">
            <ArticleBlocks blocks={article.sections} products={productsById} loading={loading} />

            {article.faq?.length > 0 && (
              <section id="faq" className="mt-12 scroll-mt-28">
                <h2 className="text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]">
                  Preguntas frecuentes
                </h2>
                <div className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white px-5 sm:px-7">
                  {article.faq.map((item) => (
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
            )}

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-line bg-cream-100 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-brand">
                PE
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-ink">Cómo se escribe esta guía</p>
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
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <nav aria-label="Contenido del artículo" className="rounded-2xl border border-line bg-white p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  En este artículo
                </p>
                <ul className="mt-3 space-y-2.5">
                  {headings.map((heading) => (
                    <li key={heading.text}>
                      <a
                        href={`#${slugifyHeading(heading.text)}`}
                        className="block text-[12.5px] leading-snug text-ink-soft transition-colors hover:text-brand"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="rounded-2xl border border-line bg-white p-5">
                <p className="text-[12.5px] font-semibold text-ink">Compara antes de decidir</p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
                  Hasta tres modelos en la misma tabla, con notas por criterio.
                </p>
                <Button as={Link} to="/comparador" size="sm" fullWidth className="mt-4">
                  Abrir comparador
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  as={Link}
                  to="/patinetes"
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="mt-2"
                >
                  Ver catálogo
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-line pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                  Sigue leyendo
                </p>
                <h2 className="mt-2 text-2xl text-ink">Artículos relacionados</h2>
              </div>
              <Button as={Link} to="/articulos" variant="link">
                Ver todos los artículos
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <ArticleCard key={item.id} article={item} index={index} />
              ))}
            </div>
          </section>
        )}

        <section className="hero-surface hero-grain relative mt-12 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl text-cream-50 sm:text-4xl">¿Ya sabes lo que buscas?</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
              Vuelve al inicio para ver la selección del editor y las guías por presupuesto.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/" size="lg">
                Volver al inicio
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                as={Link}
                to="/patinetes"
                variant="ghost"
                size="lg"
                className="!text-cream-200 hover:!bg-white/10 hover:!text-white"
              >
                Ver catálogo
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
