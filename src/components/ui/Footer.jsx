import { Link } from "react-router-dom";
import { ArrowUp, Mail, Zap } from "lucide-react";
import Container from "./Container";
import { SITE } from "../../lib/site";

const EXPLORE = [
  { label: "Todos los patinetes", to: "/patinetes" },
  { label: "Comparador", to: "/comparador" },
  { label: "Ligeros y plegables", to: "/patinetes?ligero=1" },
  { label: "Hasta 400 €", to: "/patinetes?gama=entrada" },
  { label: "Más de 800 €", to: "/patinetes?gama=alta" },
];

const GUIDES = [
  { label: "Guía de compra 2026", to: "/guia-2026" },
  { label: "Precios y valor", to: "/ofertas" },
  { label: "Categorías", to: "/categorias" },
  { label: "Preguntas frecuentes", to: "/guia-2026#faq" },
];

const LEGAL = [
  { label: "Aviso legal", to: "/aviso-legal" },
  { label: "Afiliados y transparencia", to: "/aviso-legal#afiliados" },
  { label: "Privacidad", to: "/aviso-legal#privacidad" },
  { label: "Cookies", to: "/aviso-legal#cookies" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream-200/75">
      <Container className="pb-28 pt-14">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                <Zap className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[22px] font-semibold lowercase tracking-[-0.03em] text-cream-50">
                  patinetes
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-cream-200/60">
                  Eléctricos · 2026
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-200/70">
              Comparativas y guías de compra independientes. Analizamos los patinetes con criterios
              públicos y comparables para que elijas con datos, no con ruido.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-5 inline-flex items-center gap-2 text-sm text-cream-100 underline underline-offset-4 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              {SITE.email}
            </a>
          </div>

          <FooterColumn title="Explorar" links={EXPLORE} />
          <FooterColumn title="Guías" links={GUIDES} />
          <FooterColumn title="Legal" links={LEGAL} />
        </div>

        <div className="flex flex-col gap-5 pt-8 text-xs text-cream-200/65 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-2">
            <p>
              © {year} {SITE.fullName}. Todos los derechos reservados.
            </p>
            <p>
              Participamos en el Programa de Afiliados de Amazon.es. Las comisiones no influyen en
              nuestras puntuaciones ni en el orden de las recomendaciones. Precios orientativos:
              confirma siempre el importe final en Amazon.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-cream-100 transition-colors hover:border-copper hover:text-white"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Volver arriba
          </button>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream-100">
        {title}
      </h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link to={link.to} className="text-sm text-cream-200/65 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
