import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  ChevronRight,
  Feather,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import AffiliateNote from "../components/ui/AffiliateNote";
import { ErrorState, LoadingGrid } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { specDisplay, specValue } from "../lib/normalize-product";
import { formatPrice } from "../lib/format";
import { articleSchema, faqSchema, useSEO } from "../lib/seo";

const UPDATED = "2026-11-13";
const BUDGET = 500;

const TOC = [
  { href: "#que-esperar", label: "Qué puedes exigir" },
  { href: "#ranking", label: "El ranking" },
  { href: "#comparativa", label: "Comparativa" },
  { href: "#evitar", label: "Qué evitar" },
  { href: "#metodo", label: "Cómo elegimos" },
  { href: "#faq", label: "Preguntas frecuentes" },
];

const EXPECT = [
  {
    icon: ShieldCheck,
    title: "Frenos de disco y luces",
    text: "A este precio ya se puede exigir freno de disco (mejor si es en las dos ruedas), luces delantera y trasera, y timbre. Son requisitos legales, no extras.",
  },
  {
    icon: BadgeEuro,
    title: "350–500 W y 25 km/h",
    text: "Sobra potencia para ciudad y para la mayoría de cuestas. Lo que no debe faltar es que el modelo esté limitado a 25 km/h de fábrica: si pasa, no es un VMP.",
  },
  {
    icon: Feather,
    title: "Entre 15 y 20 kg",
    text: "Es la franja donde el patinete sigue siendo manejable para plegarlo y subirlo a un ascensor. Por debajo de 13 kg suele haber renuncias en batería o frenos.",
  },
];

const AVOID = [
  "Modelos sin marcado ni certificado: a partir del 1 de enero de 2027 no podrán circular.",
  "Patinetes de menos de 200 € de marcas sin servicio técnico ni repuestos.",
  "Anuncios de 40 km de autonomía con 250 Wh: la cuenta no sale ni en laboratorio.",
  "Ruedas de menos de 8 pulgadas si vas a circular por asfalto en mal estado.",
];

const FAQS = [
  {
    question: "¿Merece la pena comprar un patinete por menos de 500 €?",
    answer:
      "Sí, para trayectos urbanos de hasta 10–15 km al día. En esa franja se encuentran modelos con freno de disco, luces, 350–500 W y 15–20 kg. Lo que se sacrifica frente a gamas altas es autonomía, suspensión y acabados.",
  },
  {
    question: "¿Qué autonomía real tiene un patinete de 400 €?",
    answer:
      "Los modelos de esa franja suelen anunciar entre 45 y 80 km. En uso real, con un rider de 75 kg y tráfico urbano, la cifra queda en torno al 70 %: entre 30 y 55 km. Para 10 km diarios sobra.",
  },
  {
    question: "¿Puedo circular con un patinete barato por la ciudad?",
    answer:
      "Solo si cumple la normativa: certificado como VMP, limitado a 25 km/h, con seguro de responsabilidad civil y registrado. El precio no exime de ninguno de esos requisitos.",
  },
  {
    question: "¿Es mejor comprar uno de 300 € o esperar a uno de 600 €?",
    answer:
      "Si tu trayecto es corto y llano, uno de 300–400 € bien elegido cumple. Si haces más de 15 km diarios, pesas mucho o hay cuestas, el salto a 600 € suele compensar en batería, frenos y suspensión.",
  },
  {
    question: "¿Cuándo es mejor momento para comprar?",
    answer:
      "Los precios suelen bajar en Prime Day, Black Friday y las semanas previas a Navidad. Como el catálogo se actualiza, la comparativa de esta página refleja el precio del último scraping, no una oferta puntual.",
  },
];

function scoreOf(product) {
  const value = Number(product.editorScore);
  return Number.isFinite(value) ? value : 0;
}

function numberSpec(product, key) {
  const value = Number(specValue(product, key));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export default function MejoresBaratos() {
  const { products, loading, error, reload } = useCatalog();

  useSEO({
    title: "Mejores patinetes eléctricos por menos de 500 € (2026)",
    description:
      "Comparativa de los mejores patinetes eléctricos por menos de 500 €: nota editorial, autonomía, potencia, peso y precio actualizado. Qué exigir y qué evitar.",
    path: "/mejores-patinetes-menos-500-euros",
    jsonLd: [
      articleSchema({
        title: "Mejores patinetes eléctricos por menos de 500 €",
        description:
          "Selección editorial de patinetes eléctricos por debajo de 500 €, con comparativa de autonomía, potencia, peso y precio.",
        path: "/mejores-patinetes-menos-500-euros",
        datePublished: UPDATED,
        dateModified: UPDATED,
      }),
      faqSchema(FAQS),
    ],
  });

  const ranked = useMemo(
    () =>
      products
        .filter((product) => Number(product.price) > 0 && Number(product.price) < BUDGET)
        .sort((a, b) => scoreOf(b) - scoreOf(a)),
    [products]
  );

  const top = ranked.slice(0, 6);

  const bestAutonomyId = useMemo(() => {
    let winner = null;
    let best = 0;
    for (const product of top) {
      const autonomy = numberSpec(product, "autonomia_km");
      if (autonomy > best) {
        best = autonomy;
        winner = product.id;
      }
    }
    return winner;
  }, [top]);

  const lightestId = useMemo(() => {
    let winner = null;
    let lightest = Infinity;
    for (const product of top) {
      const weight = numberSpec(product, "peso_kg");
      if (weight > 0 && weight < lightest) {
        lightest = weight;
        winner = product.id;
      }
    }
    return winner;
  }, [top]);

  const awardFor = (product, index) => {
    if (index === 0) return { label: "Mejor nota", tone: "editor" };
    if (product.id === bestAutonomyId) return { label: "Más autonomía", tone: "value" };
    if (product.id === lightestId) return { label: "Más ligero", tone: "budget" };
    return {};
  };

  return (
    <div className="bg-cream-50 pb-16">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link to="/guia-2026" className="hover:text-brand">
            Guía 2026
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Menos de 500 €</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Selección · actualizada en noviembre de 2026
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            Mejores patinetes eléctricos por menos de 500 €
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            No hace falta gastar 1.000 € para ir al trabajo. Estos son los modelos del catálogo que
            mejor equilibran precio, autonomía y seguridad por debajo de 500 €.
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

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/50 p-5">
          <BadgeEuro className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">Precio orientativo.</strong> Las cifras salen
            del último catálogo sincronizado y cambian a diario en Amazon. Antes de comprar, confirma
            el importe y que el modelo siga siendo un VMP certificado.
          </p>
        </div>

        <section id="que-esperar" className="mt-14 scroll-mt-28">
          <SectionHeading
            eyebrow="El listón"
            title="Qué puedes exigir por menos de 500 €"
            description="Tres cosas que no son negociables, ni siquiera en la gama de entrada."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {EXPECT.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-sans text-[14.5px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ranking" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Ranking"
            title="Los mejores por nota editorial"
            description="Filtrado por precio inferior a 500 € y ordenado por la nota del catálogo."
            action={
              <Button as={Link} to="/patinetes?gama=entrada" variant="outline" size="sm">
                Ver toda la gama
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />

          {loading && <LoadingGrid count={3} className="mt-8" />}

          {!loading && error && (
            <div className="mt-8">
              <ErrorState message={error} onRetry={reload} />
            </div>
          )}

          {!loading && !error && top.length === 0 && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
              <p className="text-[14px] font-medium text-ink">
                Ahora mismo no hay modelos por debajo de 500 € en el catálogo.
              </p>
              <p className="mt-2 text-[13px] text-ink-muted">
                Los precios se actualizan cada semana; vuelve a mirar o consulta la gama completa.
              </p>
              <Button as={Link} to="/patinetes" variant="outline" className="mt-5">
                Ver todos los patinetes
              </Button>
            </div>
          )}

          {!loading && !error && top.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {top.map((product, index) => {
                const award = awardFor(product, index);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    award={award.label}
                    awardTone={award.tone}
                  />
                );
              })}
            </div>
          )}
        </section>

        <section id="comparativa" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Lado a lado"
            title="Comparativa de los seis finalistas"
            description="Las specs que de verdad cambian la experiencia, no las que quedan bien en el folleto."
          />

          {!loading && !error && top.length > 0 && (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead className="border-b border-line bg-cream-100 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Modelo</th>
                    <th className="px-5 py-3 font-semibold">Nota</th>
                    <th className="px-5 py-3 font-semibold">Autonomía</th>
                    <th className="px-5 py-3 font-semibold">Potencia</th>
                    <th className="px-5 py-3 font-semibold">Peso</th>
                    <th className="px-5 py-3 font-semibold">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {top.map((product) => (
                    <tr key={product.id} className="transition-colors hover:bg-cream-50">
                      <td className="px-5 py-3.5">
                        <Link
                          to={`/producto/${product.id}`}
                          className="font-medium text-ink hover:text-brand"
                        >
                          {product.shortName || product.model || product.name}
                        </Link>
                        <span className="ml-2 text-[11px] text-ink-muted">{product.brand}</span>
                      </td>
                      <td className="px-5 py-3.5 tabular font-medium text-brand">
                        {scoreOf(product) > 0 ? scoreOf(product).toFixed(1) : "—"}
                      </td>
                      <td className="px-5 py-3.5 tabular text-ink-soft">
                        {specDisplay("autonomia_km", specValue(product, "autonomia_km"))}
                      </td>
                      <td className="px-5 py-3.5 tabular text-ink-soft">
                        {specDisplay("motor_w", specValue(product, "motor_w"))}
                      </td>
                      <td className="px-5 py-3.5 tabular text-ink-soft">
                        {specDisplay("peso_kg", specValue(product, "peso_kg"))}
                      </td>
                      <td className="px-5 py-3.5 tabular text-ink-soft">{formatPrice(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
            La autonomía es la declarada por el fabricante. En uso real suele quedarse en el 55–75 %.
            Lo explicamos con detalle en la{" "}
            <Link to="/autonomia-patinete-electrico" className="text-brand underline underline-offset-2">
              guía de autonomía real
            </Link>
            .
          </p>
        </section>

        <section id="evitar" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Aviso"
            title="Lo que conviene evitar"
            description="Cuatro señales de alarma que se repiten en la gama barata."
          />
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AVOID.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/[0.05] p-4"
              >
                <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-danger" aria-hidden="true" />
                <span className="text-[12.5px] leading-relaxed text-ink-soft">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/[0.07] p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">Ojo con las «ofertas» de 150 €.</strong> Un
              patinete sin certificado, sin luces o sin frenos homologados no es una ganga: es un
              problema que no podrás usar en la calle a partir de 2027. Revisa la{" "}
              <Link to="/normativa-patinete-electrico" className="text-brand underline underline-offset-2">
                normativa vigente
              </Link>
              .
            </p>
          </div>
        </section>

        <section id="metodo" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Transparencia"
            title="Cómo elegimos esta lista"
            description="Sin acuerdos con marcas: el orden lo decide la nota, no la comisión."
          />
          <div className="prose-editorial mt-6">
            <p>
              Partimos de todos los modelos del catálogo con precio inferior a 500 €. Descartamos los
              que no tienen precio o ficha completa y los ordenamos por <strong>nota editorial</strong>,
              que pondera autonomía real, potencia, frenos y seguridad, peso, confort y calidad-precio.
            </p>
            <p>
              Los distintivos «Más autonomía» y «Más ligero» se calculan sobre esos mismos seis
              finalistas, usando las especificaciones declaradas. La metodología completa está en{" "}
              <Link to="/guia-2026#metodologia">la guía de compra 2026</Link>.
            </p>
            <p className="text-[12.5px] text-ink-muted">
              Esta página no es una prueba de producto: es una selección editorial sobre datos
              verificables. Cuando un dato no existe, se muestra «—» en lugar de inventarlo.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to="/guia-2026#metodologia" variant="outline" size="sm">
              Ver metodología
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button as={Link} to="/comparador" variant="link">
              Comparar modelos lado a lado
            </Button>
          </div>
        </section>

        <section id="faq" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Dudas frecuentes"
            title="Preguntas con respuesta corta"
            description="Lo que más se pregunta antes de gastar menos de 500 €."
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

        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/normativa-patinete-electrico"
            className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Antes de comprar</p>
            <h2 className="mt-2 font-sans text-[16px] font-semibold text-ink group-hover:text-brand">
              Normativa del patinete eléctrico en 2026
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              Casco, seguro, registro y por dónde puedes circular.
            </p>
          </Link>
          <Link
            to="/autonomia-patinete-electrico"
            className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Antes de elegir</p>
            <h2 className="mt-2 font-sans text-[16px] font-semibold text-ink group-hover:text-brand">
              Autonomía real: cuánta necesitas
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              Calcula los kilómetros que harás con cada batería.
            </p>
          </Link>
        </section>

        <section className="hero-surface hero-grain relative mt-10 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl text-cream-50 sm:text-4xl">¿Sigues con dudas entre dos?</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
              El comparador enfrenta autonomía, potencia, frenos y peso en la misma tabla.
            </p>
            <Button as={Link} to="/comparador" size="lg" className="mt-6">
              Comparar patinetes
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Última revisión: 13 de noviembre de 2026 · Precios orientativos
        </p>

        <AffiliateNote className="mt-6" />
      </Container>
    </div>
  );
}
