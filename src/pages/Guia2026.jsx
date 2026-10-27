import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  ChevronRight,
  Gauge,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Wrench,
  Wallet,
  Zap,
} from "lucide-react";
import config from "../../niche.config.mjs";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import AffiliateNote from "../components/ui/AffiliateNote";
import { ErrorState, LoadingGrid } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { SCORE_METRICS } from "../lib/normalize-product";
import { PRICE_BANDS, inPriceBand } from "../lib/site";
import { FAQS } from "../data/faqs";
import { faqSchema, useSEO } from "../lib/seo";

const TOC = [
  { href: "#metodologia", label: "Metodología" },
  { href: "#por-presupuesto", label: "Por presupuesto" },
  { href: "#por-perfil", label: "Según tu trayecto" },
  { href: "#mantenimiento", label: "Mantenimiento" },
  { href: "#faq", label: "Preguntas frecuentes" },
];

const PROFILES = [
  {
    icon: Wallet,
    title: "Ir al trabajo a diario",
    text: "Prioriza autonomía suficiente para ida y vuelta y un plegado rápido. Si lo combinas con metro o cercanías, el peso manda más que la velocidad punta.",
    href: "/patinetes?uso=commuter",
    cta: "Ver patinetes para commuting",
  },
  {
    icon: Sparkles,
    title: "Piso sin ascensor",
    text: "Busca menos de 14 kg y un sistema de plegado que puedas hacer con una mano. Un patinete de 20 kg acaba quedándose en el portal.",
    href: "/patinetes?ligero=1",
    cta: "Ver modelos ligeros",
  },
  {
    icon: Gauge,
    title: "Calles irregulares",
    text: "Adoquines, asfalto parcheado o carril bici en mal estado: la suspensión y una rueda de 10 pulgadas o más marcan la diferencia.",
    href: "/patinetes?suspension=1",
    cta: "Ver modelos con suspensión",
  },
];

const FACTORS = [
  {
    icon: BatteryCharging,
    title: "Autonomía: el dato que más engaña",
    text: "El fabricante mide en condiciones ideales. En uso real, con un adulto de 75 kg, cuestas y frenadas, calcula entre el 55 % y el 70 % de lo anunciado. Para 10 km diarios, busca al menos 20 km declarados.",
  },
  {
    icon: Zap,
    title: "Potencia: nominal, no pico",
    text: "250 W bastan en llano; 350 W mantienen mejor la velocidad en cuestas del 8–10 %. Si pesas más de 85 kg o vives en zona con pendientes, mira 500 W o más y comprueba la carga máxima.",
  },
  {
    icon: ShieldCheck,
    title: "Frenos: lo primero que mirar",
    text: "Un freno de disco delantero es el mínimo razonable. El tambor se queda corto en frenadas de emergencia y el eléctrico ayuda, pero no sustituye al mecánico. Revisa también luces y reflectantes.",
  },
  {
    icon: Wrench,
    title: "Peso y plegado: el arrepentimiento típico",
    text: "Cada kilo cuenta al subirlo a un tercer piso. Un buen plegado se hace en segundos y bloquea con seguridad. Si el manillar queda suelto o la bisagra tiene holgura, no es un buen plegado.",
  },
];

export default function Guia2026() {
  const { products, loading, error, reload } = useCatalog();

  useSEO({
    title: "Guía de compra de patinetes eléctricos 2026",
    description:
      "Cómo elegir un patinete eléctrico en 2026: autonomía real, potencia, frenos, peso, suspensión y las mejores opciones por franja de precio.",
    path: "/guia-2026",
    jsonLd: faqSchema(FAQS),
  });

  const bands = PRICE_BANDS.map((band) => ({
    ...band,
    items: products
      .filter((product) => inPriceBand(product.price, band))
      .sort((a, b) => b.editorScore - a.editorScore)
      .slice(0, 3),
  }));

  return (
    <div className="bg-cream-50 pb-16">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Guía 2026</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Guía de compra · edición 2026
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            {config.guide?.title || "Elegir patinete sin leer cien opiniones"}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            {config.guide?.intro ||
              "Lo que de verdad cambia la experiencia —y lo que es marketing— explicado en cinco minutos."}
          </p>
        </header>

        <nav aria-label="Contenido de la guía" className="mt-7 flex flex-wrap gap-2">
          {TOC.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-brand hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="prose-editorial">
            <p>
              Un patinete eléctrico parece sencillo: motor, batería y un manillar. La diferencia
              entre dos modelos de precio parecido está en lo que no se ve a primera vista: la
              estabilidad del chasis, la calidad de los frenos y lo que aguanta la batería después
              de dos inviernos.
            </p>
            <p>
              Esta guía no ordena el catálogo por comisiones. Empieza por el trayecto y el
              presupuesto; después afina con el peso, el plegado y la seguridad. Si un patinete no
              encaja en tu rutina, no importa que tenga la nota más alta.
            </p>
          </div>

          <aside className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">
              <ListChecks className="h-4 w-4" />
              En esta guía
            </h2>
            <ul className="mt-3 space-y-2.5 text-[13px] text-ink-soft">
              {[
                "Cómo puntuamos (y qué no puntuamos).",
                "La mejor opción en cada franja de precio.",
                "Qué patinete encaja según tu trayecto.",
                "Mantenimiento realista y errores caros.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* Methodology */}
        <section id="metodologia" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Metodología"
            title="Una nota, seis criterios"
            description="La puntuación editorial es una media ponderada sobre diez. No incluye comisiones, acuerdos comerciales ni el precio de venta como criterio independiente: el precio ya pesa dentro de «calidad-precio»."
          />

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCORE_METRICS.map((metric) => (
              <div key={metric.key} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-sans text-[14px] font-semibold text-ink">{metric.label}</h3>
                  <span className="text-[12px] font-semibold tabular text-brand">
                    {Math.round(metric.weight * 100)} %
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">{metric.hint}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-copper"
                    style={{ width: `${metric.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-cream-100/60 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Las notas parten de especificaciones publicadas y opiniones de compradores. No
              realizamos pruebas de laboratorio propias, así que no afirmamos medir la autonomía
              kilómetro a kilómetro. Cuando un dato no está publicado, lo indicamos en lugar de
              rellenarlo.
            </p>
          </div>
        </section>

        {/* By budget */}
        <section id="por-presupuesto" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Por presupuesto"
            title="La mejor opción en cada franja"
            description="Ordenadas por puntuación editorial dentro de cada rango. Si tu presupuesto está en el límite, mira también la franja superior: a veces la diferencia no compensa."
          />

          <div className="mt-8">
            {loading ? (
              <LoadingGrid count={3} />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : (
              <div className="space-y-10">
                {bands.map((band) => (
                  <div key={band.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="flex items-baseline gap-2 font-sans text-[15px] font-semibold text-ink">
                        {band.label}
                        <span className="text-[11px] font-normal text-ink-muted">
                          {band.items.length} {band.items.length === 1 ? "modelo" : "modelos"} destacados
                        </span>
                      </h3>
                      <Button as={Link} to={`/patinetes?gama=${band.id}`} variant="link">
                        Ver todos
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {band.items.length ? (
                      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {band.items.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-xl border border-dashed border-line bg-white p-4 text-[12.5px] text-ink-muted">
                        Sin modelos publicados en esta franja.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* By profile */}
        <section id="por-perfil" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Según tu trayecto"
            title="Empieza por tu rutina, no por la marca"
            description="Tres perfiles habituales y el filtro que mejor los resuelve."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PROFILES.map((profile) => (
              <div key={profile.title} className="flex flex-col rounded-2xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <profile.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-sans text-[15px] font-semibold text-ink">{profile.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">{profile.text}</p>
                <Button as={Link} to={profile.href} variant="outline" size="sm" className="mt-5 self-start">
                  {profile.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Factors */}
        <section className="mt-16">
          <SectionHeading
            eyebrow="Decisiones que importan"
            title="Cuatro factores, cero humo"
            description="Lo que cambia la experiencia de uso a los seis meses."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FACTORS.map((factor) => (
              <div key={factor.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-brand">
                  <factor.icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-sans text-[14px] font-semibold text-ink">{factor.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{factor.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Maintenance */}
        <section id="mantenimiento" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Mantenimiento"
            title="La rutina que evita averías"
            description="Dos minutos a la semana y una revisión de frenos a tiempo valen más que cualquier garantía extendida."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                title: "Cada semana",
                items: [
                  "Comprueba la presión de los neumáticos.",
                  "Revisa que los frenos muerdan sin rozar.",
                  "Limpia el polvo del chasis con un paño húmedo.",
                ],
              },
              {
                title: "Cada mes",
                items: [
                  "Aprieta tornillos del manillar y la bisagra.",
                  "Revisa el desgaste de las pastillas de freno.",
                  "Comprueba luces y reflectantes.",
                ],
              },
              {
                title: "Cada 6 meses",
                items: [
                  "Revisa el estado de la batería y sus contactos.",
                  "Sustituye neumáticos si la banda está lisa.",
                  "Lubrica la bisagra de plegado si chirría.",
                ],
              },
            ].map((block) => (
              <div key={block.title} className="rounded-2xl border border-line bg-white p-5">
                <h3 className="font-sans text-[13px] font-semibold text-brand">{block.title}</h3>
                <ul className="mt-3 space-y-2">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-copper" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/[0.06] p-5">
            <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">El error más caro:</strong> guardar el
              patinete con la batería al 0 % durante semanas. El frío y la descarga profunda acortan
              su vida útil. Si no lo usas a diario, déjala entre el 20 % y el 80 % y recárgala una
              vez al mes.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Dudas razonables"
            title="Preguntas frecuentes"
            description="Las respuestas cortas a las dudas que más se repiten."
          />
          <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white px-5 sm:px-7">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-medium text-ink marker:content-none">
                  {faq.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink-muted transition-transform group-open:rotate-45">
                    <span className="text-base leading-none">+</span>
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="hero-surface hero-grain relative mt-16 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl text-cream-50 sm:text-4xl">Ya sabes qué buscar</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
              Compara las candidatas finales con los mismos criterios y decide con la ficha delante.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/comparador" size="lg">
                Comparar patinetes
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/patinetes" variant="ghost" size="lg" className="text-cream-200 hover:bg-white/10 hover:text-white">
                Ver catálogo
              </Button>
            </div>
          </div>
        </section>

        <AffiliateNote className="mt-6" />
      </Container>
    </div>
  );
}
