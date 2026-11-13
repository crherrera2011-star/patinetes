import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleSlash,
  Gauge,
  HardHat,
  MapPin,
  Receipt,
  Scale,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import AffiliateNote from "../components/ui/AffiliateNote";
import { articleSchema, faqSchema, useSEO } from "../lib/seo";
import { SITE } from "../lib/site";

const UPDATED = "2026-11-12";

const TOC = [
  { href: "#resumen", label: "Resumen rápido" },
  { href: "#que-es", label: "Qué es un VMP" },
  { href: "#novedades-2026", label: "Novedades 2026" },
  { href: "#por-donde", label: "Por dónde circular" },
  { href: "#normas", label: "Normas al conducir" },
  { href: "#multas", label: "Multas" },
  { href: "#faq", label: "Preguntas frecuentes" },
];

const KEY_RULES = [
  {
    icon: Gauge,
    title: "25 km/h máximo",
    text: "Un VMP no puede superar por diseño los 25 km/h. Si tu patinete pasa de ahí, legalmente no es un VMP y no puede circular como tal.",
  },
  {
    icon: CalendarClock,
    title: "15 años mínimo",
    text: "Desde el 1 de octubre de 2026 la edad mínima para conducir un patinete eléctrico son 15 años.",
  },
  {
    icon: HardHat,
    title: "Casco obligatorio",
    text: "También desde el 1 de octubre de 2026 el casco es obligatorio para conducir un VMP, además de prenda o elemento reflectante de noche.",
  },
  {
    icon: Receipt,
    title: "Seguro obligatorio",
    text: "La Ley 5/2025 exige un seguro de responsabilidad civil en vigor. Circular sin él es una infracción, no un trámite pendiente.",
  },
  {
    icon: ShieldCheck,
    title: "Registro y etiqueta",
    text: "El Real Decreto 52/2026 crea el Registro de Vehículos Personales Ligeros. Los patinetes deben ir inscritos y con su etiqueta identificativa.",
  },
  {
    icon: MapPin,
    title: "Nunca por la acera",
    text: "Prohibido en aceras, zonas peatonales, autopistas, autovías, vías interurbanas y túneles urbanos. El resto lo decide tu ayuntamiento.",
  },
];

const NOVHEDADES = [
  {
    date: "24 de julio de 2025",
    title: "Ley 5/2025: seguro obligatorio",
    text: "Reforma la responsabilidad civil y el seguro en la circulación de vehículos a motor. Los VMP pasan a necesitar una póliza de responsabilidad civil para circular por la vía pública.",
  },
  {
    date: "28 de enero de 2026",
    title: "Real Decreto 52/2026: registro y etiqueta",
    text: "Modifica el Reglamento General de Vehículos y activa el Registro de Vehículos Personales Ligeros. Cada patinete debe estar inscrito y llevar una etiqueta identificativa visible.",
  },
  {
    date: "1 de octubre de 2026",
    title: "Casco, 15 años y reflectante",
    text: "Entran en vigor las medidas de seguridad vial: casco homologado obligatorio, edad mínima de 15 años y elemento reflectante cuando se circula de noche.",
  },
  {
    date: "1 de enero de 2027",
    title: "Fin de la moratoria del certificado",
    text: "Hasta esa fecha pueden seguir circulando patinetes sin certificado. A partir de ahí, solo los VMP certificados conforme al Manual de características de la DGT.",
  },
];

const ALLOWED = [
  "Calzada urbana, preferiblemente en vías con límite de 30 km/h.",
  "Carril bici y ciclocalles cuando la ordenanza municipal lo permita.",
  "Zonas 30 y calles residenciales habilitadas por tu ayuntamiento.",
];

const FORBIDDEN = [
  "Aceras, zonas peatonales y pasos de travesía.",
  "Autopistas, autovías y túneles urbanos.",
  "Vías interurbanas: fuera de la ciudad, prohibido.",
  "Transportar a un segundo ocupante o ir sentado si el modelo no lo permite.",
];

const FAQS = [
  {
    question: "¿Es obligatorio el casco en patinete eléctrico?",
    answer:
      "Sí. Desde el 1 de octubre de 2026 el casco de protección es obligatorio para conducir un VMP en España, con independencia de la ordenanza municipal. Debe ser homologado o certificado.",
  },
  {
    question: "¿Hace falta carné para un patinete eléctrico?",
    answer:
      "No se exige permiso de conducir para un VMP que cumpla la definición (6–25 km/h, una plaza, motor eléctrico). Sí se exige tener al menos 15 años desde octubre de 2026.",
  },
  {
    question: "¿Es obligatorio el seguro del patinete?",
    answer:
      "Sí. La Ley 5/2025 obliga a tener un seguro de responsabilidad civil en vigor para circular. No cubre tu patinete: cubre los daños que causes a terceros.",
  },
  {
    question: "¿Tengo que registrar mi patinete?",
    answer:
      "Sí, en el Registro de Vehículos Personales Ligeros, con su etiqueta identificativa. Los patinetes sin certificado tienen moratoria hasta el 1 de enero de 2027.",
  },
  {
    question: "¿Puedo llevar a alguien detrás?",
    answer:
      "No. Un VMP tiene una única plaza. Transportar a un segundo ocupante está prohibido y es una de las infracciones más sancionadas por las ordenanzas municipales.",
  },
  {
    question: "¿Puedo usar el móvil o auriculares?",
    answer:
      "No. Está prohibido conducir con auriculares puestos o usando el móvil, igual que en el resto de vehículos. También se aplican los límites de alcohol y drogas.",
  },
];

export default function GuiaNormativa() {
  useSEO({
    title: "Normativa del patinete eléctrico en España 2026",
    description:
      "Casco, edad mínima, seguro obligatorio, registro y por dónde puedes circular: la normativa del patinete eléctrico en 2026 explicada y con enlaces oficiales.",
    path: "/normativa-patinete-electrico",
    jsonLd: [
      articleSchema({
        title: "Normativa del patinete eléctrico en España 2026",
        description:
          "Guía de la normativa VMP en España: casco, edad mínima, seguro, registro y normas de circulación.",
        path: "/normativa-patinete-electrico",
        datePublished: UPDATED,
        dateModified: UPDATED,
      }),
      faqSchema(FAQS),
    ],
  });

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
          <span className="text-ink">Normativa</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Normativa · actualizado en noviembre de 2026
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            Normativa del patinete eléctrico en España
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            2026 ha cambiado las reglas: casco obligatorio, 15 años, seguro de responsabilidad civil,
            registro y etiqueta. Esto es lo que dice la normativa estatal, sin interpretaciones de
            foro.
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

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/[0.07] p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">Aviso:</strong> esta página es información
            editorial, no asesoramiento legal. La normativa estatal se completa con la{" "}
            <strong className="font-semibold text-ink">ordenanza de tu ayuntamiento</strong>, que puede
            prohibir o limitar la circulación por calles concretas. Antes de circular, confirma el
            texto vigente en la{" "}
            <a
              href="https://www.dgt.es/muevete-con-seguridad/viaja-seguro/en-patinete/"
              className="underline underline-offset-2 hover:text-brand"
              rel="noopener noreferrer"
              target="_blank"
            >
              web de la DGT
            </a>
            .
          </p>
        </div>

        <section id="resumen" className="mt-14 scroll-mt-28">
          <SectionHeading
            eyebrow="Resumen"
            title="Las seis reglas que resumen todo"
            description="Si solo vas a leer un bloque, que sea este."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_RULES.map((rule) => (
              <div key={rule.title} className="rounded-2xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <rule.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-sans text-[15px] font-semibold text-ink">{rule.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{rule.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="que-es" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Definición"
            title="Qué es un VMP (y qué no lo es)"
            description="La definición legal marca qué puedes conducir sin carné y qué no."
          />
          <div className="prose-editorial mt-6">
            <p>
              Un <strong>vehículo de movilidad personal (VMP)</strong> es un vehículo de una o más
              ruedas, con una única plaza, propulsado exclusivamente por motor eléctrico y con una
              velocidad máxima por diseño de entre 6 y 25 km/h. Los patinetes eléctricos son el caso
              más habitual. Quedan fuera los vehículos para personas con movilidad reducida.
            </p>
            <p>
              Para poder circular, el modelo debe estar <strong>certificado</strong> conforme al
              Manual de características de los VMP de la DGT: dos frenos independientes, sistema de
              iluminación y señalización, timbre, estabilidad y marcaje de fábrica, entre otros
              requisitos técnicos. Un patinete que supera los 25 km/h de fábrica, o que no está
              certificado, no puede circular como VMP.
            </p>
            <p>
              Ese detalle es el que convierte la compra en una decisión normativa, no solo técnica:
              un modelo barato sin certificado puede quedarse fuera de la ciudad el 1 de enero de
              2027.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to="/patinetes" variant="outline" size="sm">
              Ver patinetes del catálogo
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button as={Link} to="/guia-2026#metodologia" variant="link">
              Cómo puntuamos
            </Button>
          </div>
        </section>

        <section id="novedades-2026" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Cronología"
            title="Qué ha cambiado en 2026"
            description="Cuatro fechas que afectan a cualquier patinete que circule hoy por España."
          />
          <ol className="mt-8 space-y-3">
            {NOVHEDADES.map((item) => (
              <li
                key={item.date}
                className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:gap-6"
              >
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand sm:w-40">
                  {item.date}
                </span>
                <div>
                  <h3 className="font-sans text-[14.5px] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="por-donde" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Circulación"
            title="Por dónde puedes ir y por dónde no"
            description="La regla estatal es la misma en toda España; el detalle lo pone cada ayuntamiento."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-success/25 bg-success/[0.06] p-5">
              <h3 className="flex items-center gap-2 font-sans text-[14px] font-semibold text-ink">
                <CheckCircle2 className="h-4.5 w-4.5 text-success" aria-hidden="true" />
                Permitido
              </h3>
              <ul className="mt-3 space-y-2">
                {ALLOWED.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-danger/25 bg-danger/[0.06] p-5">
              <h3 className="flex items-center gap-2 font-sans text-[14px] font-semibold text-ink">
                <XCircle className="h-4.5 w-4.5 text-danger" aria-hidden="true" />
                Prohibido
              </h3>
              <ul className="mt-3 space-y-2">
                {FORBIDDEN.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-5 text-[12.5px] leading-relaxed text-ink-muted">
            Si tu ayuntamiento no ha aprobado ordenanza, se permite circular por cualquier calzada
            urbana. Comprueba también las restricciones de las Zonas de Bajas Emisiones: algunos
            municipios exigen registro previo para acceder.
          </p>
        </section>

        <section id="normas" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Al conducir"
            title="Las normas que se olvidan"
            description="No son recomendaciones: son infracciones si te paran."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                icon: CircleSlash,
                title: "Nada de móvil ni auriculares",
                text: "Prohibido usar el teléfono o llevar auriculares puestos mientras conduces, igual que en un coche.",
              },
              {
                icon: Scale,
                title: "Alcohol y drogas",
                text: "Se aplican los mismos límites que para el resto de conductores. Un patinete no es un juguete a efectos de sanción.",
              },
              {
                icon: BatteryCharging,
                title: "Luces y reflectantes",
                text: "El VMP debe llevar luces y elementos reflectantes. De noche, además, prenda reflectante visible.",
              },
              {
                icon: ShieldCheck,
                title: "Casco homologado",
                text: "Tiene que ser un casco de protección homologado o certificado. Una gorra o un casco de bici sin certificación no sirven.",
              },
            ].map((rule) => (
              <div key={rule.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-100 text-brand">
                  <rule.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-[14px] font-semibold text-ink">{rule.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{rule.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="multas" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Sanciones"
            title="Qué te puede costar"
            description="Las cuantías dependen del supuesto y de la ordenanza local; estos son los mínimos que conviene tener claros."
          />
          <div className="prose-editorial mt-6">
            <p>
              Circular <strong>sin el seguro obligatorio</strong> se sanciona con multas de entre
              601 € y 3.005 €, además de la posible inmovilización del vehículo. Una póliza básica de
              responsabilidad civil suele costar entre 30 y 60 € al año: es la multa más cara por el
              trámite más barato.
            </p>
            <p>
              Ir por la acera, llevar a un segundo ocupante, usar el móvil, no llevar casco o circular
              sin la etiqueta de registro son infracciones que cada ayuntamiento cuantifica en su
              ordenanza. En la práctica, las multas municipales por circular por acera suelen moverse
              entre 100 € y 500 €.
            </p>
            <p className="text-[12.5px] text-ink-muted">
              Las cifras son orientativas y pueden cambiar. Para el importe exacto, consulta la
              ordenanza de tu ciudad y la web de la DGT.
            </p>
          </div>
        </section>

        <section id="faq" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Dudas frecuentes"
            title="Preguntas con respuesta corta"
            description="Las que más se repiten en buscadores y en foros."
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
            to="/autonomia-patinete-electrico"
            className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Siguiente</p>
            <h2 className="mt-2 font-sans text-[16px] font-semibold text-ink group-hover:text-brand">
              Cuánta autonomía necesitas de verdad
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              La distancia anunciada no es la que haces. Cómo calcular la tuya antes de comprar.
            </p>
          </Link>
          <Link
            to="/mejores-patinetes-menos-500-euros"
            className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">También</p>
            <h2 className="mt-2 font-sans text-[16px] font-semibold text-ink group-hover:text-brand">
              Mejores patinetes por menos de 500 €
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              Lo que se puede exigir con ese presupuesto y lo que conviene evitar.
            </p>
          </Link>
        </section>

        <section className="hero-surface hero-grain relative mt-10 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl text-cream-50 sm:text-4xl">Compra con la norma en la mano</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
              Todos los modelos del catálogo se comparan con los mismos criterios, incluida la
              seguridad.
            </p>
            <Button as={Link} to="/patinetes" size="lg" className="mt-6">
              Ver el catálogo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Última revisión: {new Date(UPDATED).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {SITE.fullName}
        </p>

        <AffiliateNote className="mt-6" />
      </Container>
    </div>
  );
}
