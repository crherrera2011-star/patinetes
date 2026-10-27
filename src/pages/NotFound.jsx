import { Link } from "react-router-dom";
import { ArrowRight, Compass, Scale, Zap } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { useCatalog } from "../context/CatalogContext";
import { useSEO } from "../lib/seo";

const SUGGESTIONS = [
  {
    icon: Zap,
    title: "Todo el catálogo",
    text: "Los patinetes que hemos analizado, con filtros por precio, peso y suspensión.",
    to: "/patinetes",
    cta: "Ver patinetes",
  },
  {
    icon: Compass,
    title: "Guía de compra",
    text: "Seis criterios, tres franjas de precio y los errores que conviene evitar.",
    to: "/guia-2026",
    cta: "Leer la guía",
  },
  {
    icon: Scale,
    title: "Comparador",
    text: "Pon hasta tres modelos frente a frente y decide con la ficha delante.",
    to: "/comparador",
    cta: "Comparar modelos",
  },
];

export default function NotFound() {
  const { products, loading } = useCatalog();
  const top = [...products].sort((a, b) => b.editorScore - a.editorScore).slice(0, 3);

  useSEO({
    title: "Página no encontrada",
    description:
      "La página que buscas no existe. Vuelve al catálogo de patinetes eléctricos o consulta la guía de compra.",
    path: "/404",
    noindex: true,
  });

  return (
    <div className="bg-cream-50 pb-20">
      <Container className="pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-[86px] leading-none tracking-[-0.05em] text-brand/20 sm:text-[120px]">
            404
          </p>
          <h1 className="-mt-4 text-4xl leading-[1.05] text-ink sm:text-5xl">
            Esta página se ha desviado
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            El enlace no existe o ha cambiado de sitio. No pasa nada: el catálogo y la guía siguen
            donde estaban.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/patinetes" size="lg">
              Ver todos los patinetes
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as={Link} to="/" variant="outline" size="lg">
              Volver al inicio
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {SUGGESTIONS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-sans text-[15px] font-semibold text-ink group-hover:text-brand">
                {item.title}
              </h2>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{item.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand">
                {item.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        {!loading && top.length > 0 && (
          <div className="mx-auto mt-14 max-w-3xl">
            <h2 className="text-center font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              Mientras tanto, los mejor valorados
            </h2>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-5">
              {top.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/producto/${product.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 text-[13px] text-ink-soft transition-colors hover:text-brand"
                  >
                    <span className="min-w-0 truncate">
                      <span className="font-medium text-ink">
                        {product.model || product.shortName || product.name}
                      </span>
                      <span className="ml-2 text-[11.5px] text-ink-muted">{product.brand}</span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold tabular text-brand">
                      {product.editorScore.toFixed(1)}/10
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </div>
  );
}
