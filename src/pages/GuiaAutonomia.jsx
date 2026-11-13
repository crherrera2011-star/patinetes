import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  ChevronRight,
  Gauge,
  Mountain,
  Thermometer,
  Weight,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import AffiliateNote from "../components/ui/AffiliateNote";
import { useCatalog } from "../context/CatalogContext";
import { specDisplay, specValue } from "../lib/normalize-product";
import { formatPrice } from "../lib/format";
import { articleSchema, faqSchema, useSEO } from "../lib/seo";

const UPDATED = "2026-11-13";

const TOC = [
  { href: "#por-que", label: "Por qué no se cumple" },
  { href: "#calculadora", label: "Calculadora" },
  { href: "#cuanta", label: "Cuánta necesitas" },
  { href: "#catalogo", label: "Datos del catálogo" },
  { href: "#medir", label: "Cómo medir la tuya" },
  { href: "#faq", label: "Preguntas frecuentes" },
];

const FACTORS = [
  {
    icon: Weight,
    title: "Tu peso y la carga",
    text: "Cada kilo cuenta. Un rider de 95 kg puede perder un 25–30 % de autonomía frente al dato de laboratorio, que se mide con unos 75 kg.",
  },
  {
    icon: Mountain,
    title: "Cuestas y arranques",
    text: "Un trayecto urbano con semáforos consume más que uno lineal. Cada arranque desde parado pide un pico de potencia que la batería nota.",
  },
  {
    icon: Thermometer,
    title: "Frío y viento",
    text: "Por debajo de 10 °C la batería de litio pierde capacidad útil. El viento en contra es, en la práctica, una cuesta constante.",
  },
  {
    icon: Gauge,
    title: "Modo de conducción",
    text: "Ir a 25 km/h consume bastante más que ir a 18–20 km/h. La diferencia entre modo eco y modo sport puede ser del 30 %.",
  },
];

const TRAJECTS = [
  { km: 5, label: "5 km al día", declared: 15, note: "Trayectos cortos de barrio" },
  { km: 10, label: "10 km al día", declared: 25, note: "Ida y vuelta al trabajo cerca" },
  { km: 15, label: "15 km al día", declared: 35, note: "El uso más habitual" },
  { km: 20, label: "20 km al día", declared: 45, note: "Travesía de ciudad" },
  { km: 30, label: "30 km al día", declared: 60, note: "Sin margen para improvisar" },
];

const FAQS = [
  {
    question: "¿Por qué mi patinete no llega a los kilómetros anunciados?",
    answer:
      "Porque el dato del fabricante se mide en condiciones de laboratorio: rider de unos 75 kg, terreno llano, temperatura suave, neumáticos a presión y velocidad constante. En uso real la autonomía suele quedar entre el 55 % y el 75 % de esa cifra.",
  },
  {
    question: "¿Cuánta autonomía real tiene un patinete de 360 Wh?",
    answer:
      "Con un rider de 75 kg y conducción normal por ciudad, entre 25 y 30 km. La cuenta es sencilla: se divide la energía de la batería (Wh) entre el consumo medio, que en un patinete urbano ronda los 13 Wh/km.",
  },
  {
    question: "¿Merece la pena pagar por más batería?",
    answer:
      "Solo si tu trayecto diario se acerca al límite. Para 8–10 km al día, una batería de 275–360 Wh es suficiente y ahorras peso y dinero. Para más de 20 km diarios, busca 500 Wh o más.",
  },
  {
    question: "¿La autonomía baja con el tiempo?",
    answer:
      "Sí. Una batería de litio pierde capacidad con los ciclos de carga. Tras 500 ciclos completos es normal quedarse en el 80 % de la autonomía inicial. Cargar entre el 20 % y el 80 % y evitar el calor alarga su vida.",
  },
  {
    question: "¿Puedo llevar el cargador y recargar en el trabajo?",
    answer:
      "Sí, siempre que la batería sea extraíble o el fabricante permita carga en exterior. Muchos modelos permiten cargar en 4–6 horas, así que una segunda carga en destino duplica la autonomía diaria sin comprar una batería mayor.",
  },
];

const WH_PRESETS = [275, 360, 468, 720, 1080];

const MODES = [
  { id: "eco", label: "Eco (18 km/h)", factor: 0.85 },
  { id: "normal", label: "Normal (22 km/h)", factor: 1 },
  { id: "sport", label: "Sport (25 km/h)", factor: 1.2 },
];

export default function GuiaAutonomia() {
  const { products, loading, error } = useCatalog();
  const [weight, setWeight] = useState(75);
  const [wh, setWh] = useState(360);
  const [mode, setMode] = useState("normal");

  useSEO({
    title: "Autonomía real de un patinete eléctrico: cuánta necesitas",
    description:
      "La autonomía que anuncia el fabricante no es la que haces. Calcula la autonomía real de tu patinete según peso, batería y modo, y elige la batería que necesitas.",
    path: "/autonomia-patinete-electrico",
    jsonLd: [
      articleSchema({
        title: "Autonomía real de un patinete eléctrico",
        description:
          "Cómo calcular la autonomía real de un patinete eléctrico y cuánta batería necesitas según tu trayecto.",
        path: "/autonomia-patinete-electrico",
        datePublished: UPDATED,
        dateModified: UPDATED,
      }),
      faqSchema(FAQS),
    ],
  });

  const factorMode = MODES.find((item) => item.id === mode)?.factor ?? 1;
  const consumption = 13 * (weight / 75) * factorMode;
  const realKm = wh / consumption;

  const catalogRows = useMemo(() => {
    return products
      .map((product) => {
        const declared = Number(specValue(product, "autonomia_km")) || 0;
        const battery = Number(specValue(product, "bateria_wh")) || 0;
        return { product, declared, battery };
      })
      .filter((row) => row.declared > 0)
      .sort((a, b) => b.declared - a.declared)
      .slice(0, 8);
  }, [products]);

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
          <span className="text-ink">Autonomía</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Autonomía · actualizado en noviembre de 2026
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            Autonomía real: cuánta necesitas de verdad
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            El fabricante anuncia 70 km y tú haces 45. No es publicidad engañosa: es física. Aquí
            tienes la cuenta para saber qué batería necesitas antes de pagar por ella.
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

        <section id="por-que" className="mt-14 scroll-mt-28">
          <SectionHeading
            eyebrow="El dato de catálogo"
            title="Por qué la autonomía anunciada no se cumple"
            description="La cifra del fabricante es un máximo teórico. Cuatro factores se encargan del resto."
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FACTORS.map((factor) => (
              <div key={factor.title} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <factor.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-sans text-[14.5px] font-semibold text-ink">{factor.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{factor.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-line bg-cream-100 p-5">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">Regla práctica:</strong> calcula entre el
              55 % y el 75 % de la autonomía anunciada. Usa el 55 % si pesas más de 90 kg, hay
              cuestas o hace frío; el 75 % si eres ligero y el terreno es llano.
            </p>
          </div>
        </section>

        <section id="calculadora" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Calculadora"
            title="Estima tu autonomía en 10 segundos"
            description="Consumo medio de 13 Wh/km a 75 kg en modo normal. Ajusta los tres valores y verás cuánto margen tienes."
          />
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-line bg-white p-6">
              <label className="block">
                <span className="flex items-center justify-between text-[12px] font-medium text-ink">
                  Tu peso
                  <span className="tabular text-ink-muted">{weight} kg</span>
                </span>
                <input
                  type="range"
                  min={50}
                  max={120}
                  step={1}
                  value={weight}
                  onChange={(event) => setWeight(Number(event.target.value))}
                  className="mt-3 w-full accent-brand"
                  aria-label="Peso del conductor en kilos"
                />
              </label>

              <div className="mt-6">
                <span className="text-[12px] font-medium text-ink">Batería</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WH_PRESETS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setWh(value)}
                      aria-pressed={wh === value}
                      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                        wh === value
                          ? "border-brand bg-brand text-white"
                          : "border-line-strong bg-white text-ink-soft hover:border-brand hover:text-brand"
                      }`}
                    >
                      {value} Wh
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <span className="text-[12px] font-medium text-ink">Modo de conducción</span>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {MODES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      aria-pressed={mode === item.id}
                      className={`rounded-xl border px-2 py-2.5 text-[11.5px] font-medium transition-colors ${
                        mode === item.id
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-line-strong bg-white text-ink-soft hover:border-brand"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="hero-surface hero-grain relative overflow-hidden rounded-2xl p-6 text-cream-50">
              <div className="relative z-10 flex h-full flex-col">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-copper">
                  Autonomía estimada
                </p>
                <p className="mt-3 text-5xl font-semibold tabular tracking-[-0.03em]">
                  {realKm.toFixed(0)}
                  <span className="ml-1 text-xl font-medium text-cream-200/70">km</span>
                </p>
                <p className="mt-3 text-[12.5px] leading-relaxed text-cream-200/75">
                  Consumo estimado: {consumption.toFixed(1)} Wh/km. Para un trayecto de ida y vuelta
                  de {Math.max(1, Math.floor(realKm / 2))} km irías con margen.
                </p>
                <div className="mt-auto pt-6">
                  <p className="text-[11px] text-cream-200/55">
                    Equivale a anunciar unos {(realKm / 0.7).toFixed(0)} km en catálogo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cuanta" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Compra"
            title="Qué autonomía declarada buscar según tu trayecto"
            description="Estas cifras ya incluyen el margen del 30 % que se pierde en uso real."
          />
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead className="border-b border-line bg-cream-100 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Trayecto diario</th>
                  <th className="px-5 py-3 font-semibold">Autonomía declarada</th>
                  <th className="px-5 py-3 font-semibold">Para quién</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {TRAJECTS.map((row) => (
                  <tr key={row.km}>
                    <td className="px-5 py-3.5 font-medium text-ink">{row.label}</td>
                    <td className="px-5 py-3.5 tabular text-ink-soft">{row.declared} km o más</td>
                    <td className="px-5 py-3.5 text-ink-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
            Si tu trayecto es de ida y vuelta, cuenta el total. Y si no puedes cargar en destino,
            deja siempre un 20 % de margen: no conviene apurar la batería hasta el 0 %.
          </p>
        </section>

        <section id="catalogo" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Datos reales"
            title="Los modelos con más autonomía del catálogo"
            description="Autonomía declarada por el fabricante y estimación real aplicando el 70 %. No es una prueba: es la misma cuenta que puedes hacer tú."
            action={
              <Button as={Link} to="/patinetes" variant="outline" size="sm">
                Ver catálogo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />

          {loading && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-[13px] text-ink-muted">
              Cargando el catálogo…
            </div>
          )}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-[13px] text-ink-muted">
              No se ha podido cargar el catálogo en este momento. Puedes verlo igualmente en{" "}
              <Link to="/patinetes" className="text-brand underline underline-offset-2">
                la página de patinetes
              </Link>
              .
            </div>
          )}

          {!loading && !error && catalogRows.length > 0 && (
            <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[680px] text-left text-[13px]">
                <thead className="border-b border-line bg-cream-100 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Modelo</th>
                    <th className="px-5 py-3 font-semibold">Batería</th>
                    <th className="px-5 py-3 font-semibold">Anunciada</th>
                    <th className="px-5 py-3 font-semibold">Estimada real</th>
                    <th className="px-5 py-3 font-semibold">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {catalogRows.map(({ product, declared, battery }) => (
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
                      <td className="px-5 py-3.5 tabular text-ink-soft">
                        {battery ? specDisplay("bateria_wh", battery) : "—"}
                      </td>
                      <td className="px-5 py-3.5 tabular text-ink-soft">{declared} km</td>
                      <td className="px-5 py-3.5 tabular font-medium text-brand">
                        ≈ {Math.round(declared * 0.7)} km
                      </td>
                      <td className="px-5 py-3.5 tabular text-ink-soft">{formatPrice(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
            La estimación aplica un factor fijo del 70 % sobre el dato del fabricante. Sirve para
            comparar modelos entre sí, no para prometer una cifra exacta en tu ruta.
          </p>
        </section>

        <section id="medir" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Método"
            title="Cómo medir la autonomía real de tu patinete"
            description="Tres salidas y una cuenta. Es la única forma de saberlo con tu peso y tus calles."
          />
          <ol className="mt-8 space-y-3">
            {[
              "Carga al 100 % y anota el cuentakilómetros parcial (o usa una app de GPS).",
              "Haz tu trayecto habitual, sin cambiar nada: mismo modo, mismo peso, misma ruta.",
              "Cuando llegue al 20 %, apunta los kilómetros recorridos y divide entre 0,8.",
              "Repite una vez en verano y otra en invierno: la diferencia estacional puede ser del 15 %.",
            ].map((step, index) => (
              <li key={step} className="flex gap-4 rounded-2xl border border-line bg-white p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-cream-50">
                  {index + 1}
                </span>
                <p className="text-[13px] leading-relaxed text-ink-soft">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft/60 p-5">
            <BatteryCharging className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
            <p className="text-[12.5px] leading-relaxed text-ink-soft">
              <strong className="font-semibold text-ink">Truco:</strong> la autonomía se mide mejor
              en porcentaje que en kilómetros. Si tu patinete gasta un 10 % cada 3 km, sabes que
              tienes unos 30 km útiles hasta el 0 %, y unos 24 km hasta el 20 % recomendado.
            </p>
          </div>
        </section>

        <section id="faq" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Dudas frecuentes"
            title="Preguntas con respuesta corta"
            description="Las que más se repiten antes de comprar."
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
            to="/mejores-patinetes-menos-500-euros"
            className="group rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Presupuesto</p>
            <h2 className="mt-2 font-sans text-[16px] font-semibold text-ink group-hover:text-brand">
              Mejores patinetes por menos de 500 €
            </h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              Lo que sí puedes exigir con ese presupuesto.
            </p>
          </Link>
        </section>

        <section className="hero-surface hero-grain relative mt-10 overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl text-cream-50 sm:text-4xl">Compara autonomía real, no folletos</h2>
            <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
              En el comparador ves batería, potencia y peso de cada modelo en la misma tabla.
            </p>
            <Button as={Link} to="/comparador" size="lg" className="mt-6">
              Abrir el comparador
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Última revisión: 13 de noviembre de 2026
        </p>

        <AffiliateNote className="mt-6" />
      </Container>
    </div>
  );
}
