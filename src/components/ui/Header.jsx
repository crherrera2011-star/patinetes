import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, Scale, Search, X, Zap } from "lucide-react";
import { FULL_ARTICLES } from "../../data/articles";
import { CATALOG_PATH, NAV_LINKS, SITE } from "../../lib/site";
import { useCompare } from "../../context/CompareContext";
import Container from "./Container";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { count } = useCompare();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const handleSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `${CATALOG_PATH}?q=${encodeURIComponent(value)}` : CATALOG_PATH);
    setQuery("");
    setMenuOpen(false);
  };

  const navClass = ({ isActive }) =>
    `relative whitespace-nowrap text-[13.5px] font-medium transition-colors ${
      isActive
        ? "text-ink after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brand"
        : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* Affiliate transparency strip */}
      <div className="hidden bg-ink text-cream-200/80 sm:block">
        <Container className="flex h-8 items-center justify-between text-[11px]">
          <p className="truncate">
            <span className="font-medium text-cream-100">Divulgación:</span> ganamos una comisión por
            las compras realizadas desde nuestros enlaces de Amazon, sin coste extra para ti.
          </p>
          <Link
            to="/aviso-legal#afiliados"
            className="shrink-0 font-medium text-cream-100 underline underline-offset-2 hover:text-white"
          >
            Cómo trabajamos
          </Link>
        </Container>
      </div>

      <div className="border-b border-line bg-cream-50/92 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-3" aria-label={`${SITE.fullName}, inicio`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6">
              <Zap className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[22px] font-semibold lowercase tracking-[-0.03em] text-ink">
                patinetes
              </span>
              <span className="mt-0.5 hidden text-[9px] font-semibold uppercase tracking-[0.2em] text-ink-muted sm:block">
                Eléctricos · 2026
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex lg:gap-6" aria-label="Navegación principal">
            {NAV_LINKS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navClass}>
                {item.label}
              </NavLink>
            ))}

            {/* Guías editoriales: dropdown con los cromos */}
            <div className="group relative">
              <NavLink to="/articulos" end={false} className={navClass}>
                Guías
              </NavLink>
              <div className="pointer-events-none absolute right-0 top-full mt-2 w-72 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                <div className="rounded-2xl border border-line bg-white p-2 shadow-lift">
                  {FULL_ARTICLES.map((article) => (
                    <NavLink
                      key={article.id}
                      to={article.path}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-cream-100"
                    >
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          {article.category}
                        </p>
                        <p className="truncate text-[13px] font-medium text-ink">{article.title}</p>
                      </div>
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                    </NavLink>
                  ))}
                  <Link
                    to="/articulos"
                    className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-cream-100 px-3 py-2.5 text-[12px] font-semibold text-brand transition-colors hover:bg-cream-200"
                  >
                    Ver todas las guías
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden lg:block" role="search">
              <label className="relative flex items-center">
                <span className="sr-only">Buscar patinetes</span>
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar marca o modelo"
                  className="h-10 w-52 rounded-full border border-line bg-white/80 pl-9 pr-3 text-[13px] text-ink outline-none transition-all placeholder:text-ink-muted/70 focus:w-64 focus:border-brand/40 focus:bg-white"
                />
              </label>
            </form>

            <Link
              to="/comparador"
              className="relative hidden items-center gap-2 rounded-full border border-line-strong bg-white/70 px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-brand hover:text-brand sm:inline-flex"
            >
              <Scale className="h-4 w-4" aria-hidden="true" />
              Comparar
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="-mr-1 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-100 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        {menuOpen && (
          <div id="mobile-navigation" className="border-t border-line bg-cream-50 md:hidden">
            <Container className="space-y-1 py-4">
              <form onSubmit={handleSearch} className="relative mb-3" role="search">
                <span className="sr-only">Buscar patinetes</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar marca o modelo"
                  className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm outline-none focus:border-brand/40"
                />
              </form>
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                      isActive ? "bg-brand-soft text-brand" : "text-ink-soft hover:bg-cream-100"
                    }`
                  }
                >
                  {item.label}
                  <span aria-hidden="true">→</span>
                </NavLink>
              ))}

              {/* Guías en móvil: submenú expandible */}
              <details className="group">
                <summary className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:bg-cream-100 list-none marker:content-none">
                  Guías
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-2 space-y-1">
                  {FULL_ARTICLES.map((article) => (
                    <Link
                      key={article.id}
                      to={article.path}
                      className="flex items-start justify-between gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-cream-100"
                    >
                      <div className="min-w-0">
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          {article.category}
                        </p>
                        <p className="truncate text-ink">{article.title}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                    </Link>
                  ))}
                  <Link
                    to="/articulos"
                    className="flex items-center justify-between gap-3 rounded-xl bg-cream-100 px-3 py-2 text-[12px] font-semibold text-brand"
                  >
                    Ver todas las guías
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </details>

              <Link
                to="/comparador"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-medium text-white"
              >
                <Scale className="h-4 w-4" />
                Comparar patinetes {count > 0 ? `(${count})` : ""}
              </Link>
            </Container>
          </div>
        )}
      </div>
    </header>
  );
}
