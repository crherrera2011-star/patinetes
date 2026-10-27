import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BatteryCharging,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Gauge,
  Info,
  Package,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import Stars from "../components/ui/Stars";
import ScoreBadge from "../components/ui/ScoreBadge";
import Badge from "../components/ui/Badge";
import AffiliateNote from "../components/ui/AffiliateNote";
import ProductCard from "../components/product/ProductCard";
import ProductMedia from "../components/product/ProductMedia";
import RadarChart from "../components/product/RadarChart";
import ScorePanel from "../components/product/ScorePanel";
import SpecTable from "../components/product/SpecTable";
import { ErrorState, PageLoader } from "../components/ui/PageState";
import { useCatalog } from "../context/CatalogContext";
import { useCompare } from "../context/CompareContext";
import {
  SCORE_METRICS,
  scoreLabel,
  specDisplay,
  specValue,
} from "../lib/normalize-product";
import { priceBandLabel } from "../lib/site";
import { formatCompact, formatPrice } from "../lib/format";
import { breadcrumbSchema, productSchema, useSEO } from "../lib/seo";

const TABS = [
  { id: "resumen", label: "Resumen", icon: FileText },
  { id: "especificaciones", label: "Especificaciones", icon: Package },
  { id: "puntuacion", label: "Puntuación", icon: Gauge },
  { id: "opiniones", label: "Opiniones", icon: Users },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench },
];

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading, status, error, reload } = useCatalog();
  const { isSelected, toggle } = useCompare();
  const [activeTab, setActiveTab] = useState("resumen");
  const [imageIndex, setImageIndex] = useState(0);

  const product = products.find((item) => item.id === id || item.asin === id);
  const selected = product ? isSelected(product.id) : false;

  useEffect(() => {
    setActiveTab("resumen");
    setImageIndex(0);
  }, [id]);

  const related = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.id !== product.id)
      .map((item) => {
        const sameBrand = item.brand === product.brand ? 1 : 0;
        const priceDistance = Math.abs(item.price - product.price) / Math.max(product.price, 1);
        return { item, score: sameBrand * 1.5 - priceDistance + item.editorScore / 20 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.item);
  }, [product, products]);

  const productJsonLd = product ? productSchema(product) : null;
  const crumbs = [
    { name: "Inicio", path: "/" },
    { name: "Patinetes", path: "/patinetes" },
    { name: product?.shortName || product?.name || "Modelo", path: `/producto/${id}` },
  ];

  useSEO({
    title: product
      ? `${product.shortName || product.name} — análisis y precio`
      : "Patinete no encontrado",
    description: product
      ? `${product.shortName || product.name}: análisis, especificaciones, pros y contras. Puntuación editorial ${product.editorScore}/10. Precio orientativo ${formatPrice(product.price)}.`
      : "El patinete que buscas no está en el catálogo.",
    path: `/producto/${id}`,
    image: product?.image?.src,
    jsonLd: product ? [productJsonLd, breadcrumbSchema(crumbs)] : null,
    noindex: !product,
  });

  if (loading) return <PageLoader label="Cargando la ficha" />;

  if (status === "error" || (error && products.length === 0)) {
    return (
      <Container className="py-20">
        <ErrorState message={error} onRetry={reload} />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-20">
        <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <h1 className="text-3xl text-ink">Este patinete ya no está en el catálogo</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Puede que se haya retirado o que el enlace esté mal. El catálogo se actualiza con los
            modelos disponibles.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button as={Link} to="/patinetes">
              Ver todos los patinetes
            </Button>
            <Button as={Link} to="/" variant="outline">
              Volver al inicio
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  const radarLabels = SCORE_METRICS.map((metric) => metric.short);
  const radarValues = SCORE_METRICS.map((metric) => product.scores[metric.key]);
  const gallery = product.image.gallery.length ? product.image.gallery : [product.image.src];
  const sortedScores = [...SCORE_METRICS].sort(
    (a, b) => product.scores[b.key] - product.scores[a.key]
  );
  const strongest = sortedScores.slice(0, 2);
  const weakest = sortedScores[sortedScores.length - 1];

  const autonomy = specValue(product, "autonomia_km");
  const speed = specValue(product, "velocidad_max_kmh");
  const motor = specValue(product, "motor_w");
  const weight = specValue(product, "peso_kg");
  const battery = specValue(product, "bateria_wh");
  const charge = specValue(product, "tiempo_carga_h");
  const wheels = specValue(product, "ruedas_pulgadas");
  const brakes = specValue(product, "frenos");
  const suspension = specValue(product, "suspension");
  const maxLoad = specValue(product, "carga_max_kg");
  const waterproof = specValue(product, "resistencia_ip");

  const quickFacts = [
    {
      icon: Gauge,
      label: "Autonomía",
      value: specDisplay("autonomia_km", autonomy),
    },
    {
      icon: Zap,
      label: "Velocidad",
      value: specDisplay("velocidad_max_kmh", speed),
    },
    {
      icon: Scale,
      label: "Peso",
      value: specDisplay("peso_kg", weight),
    },
    {
      icon: BatteryCharging,
      label: "Motor",
      value: specDisplay("motor_w", motor),
    },
  ];

  const summaryParagraphs = [
    `${product.brand} sitúa este ${product.model || product.shortName} en la franja ${priceBandLabel(
      product.price
    ).toLowerCase()}. ${
      suspension
        ? "Incluye suspensión, así que el asfalto irregular se nota menos en trayectos largos."
        : "Renuncia a la suspensión para contener peso y precio; el confort depende del tamaño de rueda y de la presión de los neumáticos."
    }`,
    [
      autonomy ? `Anuncia ${autonomy} km de autonomía, que en uso real suele quedarse en torno al 60–70 %.` : "",
      speed ? `Su velocidad máxima declarada es de ${speed} km/h.` : "",
      motor ? `El motor es de ${motor} W.` : "",
      weight ? `Pesa ${weight} kg.` : "",
      battery ? `La batería es de ${battery} Wh.` : "",
      charge ? `La carga completa tarda unas ${charge} h.` : "",
    ]
      .filter(Boolean)
      .join(" "),
    `Nuestra nota editorial es ${product.editorScore}/10 (${scoreLabel(
      product.editorScore
    ).toLowerCase()}). Destaca en ${strongest
      .map((metric) => metric.label.toLowerCase())
      .join(" y ")}; la asignatura pendiente es ${weakest.label.toLowerCase()}.`,
  ];

  const idealFor =
    product.idealFor ||
    (autonomy && autonomy >= 40
      ? "Trayectos largos y usuarios que no quieren cargar a diario."
      : weight && weight <= 14
        ? "Trayectos urbanos combinados con transporte público o ascensor."
        : "Uso diario en ciudad con trayectos de media distancia.");

  return (
    <div className="bg-cream-50 pb-24 lg:pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-cream-100/50">
        <Container className="flex flex-wrap items-center gap-1.5 py-3 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <Link to="/patinetes" className="hover:text-brand">
            Patinetes
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="truncate text-ink">{product.shortName || product.name}</span>
        </Container>
      </div>

      <Container className="pt-8 sm:pt-10">
        <Link
          to="/patinetes"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-muted transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al catálogo
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          {/* Gallery + content */}
          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[76px_minmax(0,1fr)]">
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                {gallery.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors ${
                      index === imageIndex ? "border-brand" : "border-line hover:border-line-strong"
                    }`}
                    aria-label={`Ver imagen ${index + 1} de ${product.shortName || product.name}`}
                    aria-pressed={index === imageIndex}
                  >
                    <ProductMedia
                      product={product}
                      src={src}
                      className="h-full w-full bg-white"
                      imgClassName="p-1.5"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1 overflow-hidden rounded-2xl border border-line bg-white sm:order-2">
                <ProductMedia
                  product={product}
                  src={gallery[imageIndex]}
                  priority
                  className="aspect-square sm:aspect-[4/3]"
                  imgClassName="p-8 sm:p-12"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Badge tone="neutral">
                {suspension ? "Con suspensión" : "Sin suspensión"}
              </Badge>
              <p className="text-[11px] text-ink-muted">
                {gallery.length} {gallery.length === 1 ? "imagen" : "imágenes"} · ficha del fabricante
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-10">
              <div
                className="hide-scrollbar grid grid-cols-2 gap-2 sm:flex sm:gap-1 sm:overflow-x-auto sm:border-b sm:border-line"
                role="tablist"
                aria-label="Información del producto"
                onKeyDown={(event) => {
                  if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
                  const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
                  let next = current;
                  if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
                  if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
                  if (event.key === "Home") next = 0;
                  if (event.key === "End") next = tabs.length - 1;
                  tabs[next]?.focus();
                  tabs[next]?.click();
                }}
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={active}
                      aria-controls={active ? `panel-${tab.id}` : undefined}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[12.5px] font-medium transition-colors sm:-mb-px sm:shrink-0 sm:justify-start sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b-2 sm:bg-transparent sm:px-4 sm:py-3 sm:text-[13px] ${
                        active
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-line bg-white text-ink-muted hover:text-ink sm:border-transparent"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="pt-7" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                {activeTab === "resumen" && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl text-ink">Por qué está en la lista</h2>
                      <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-ink-soft">
                        {summaryParagraphs.filter(Boolean).map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-line bg-brand-soft/50 p-5">
                      <h3 className="flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">
                        <Info className="h-4 w-4" />
                        Ideal para
                      </h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{idealFor}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-success/20 bg-success/[0.04] p-5">
                        <h3 className="flex items-center gap-2 font-sans text-[13px] font-semibold text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          Puntos fuertes
                        </h3>
                        {product.pros.length ? (
                          <ul className="mt-3 space-y-2">
                            {product.pros.slice(0, 5).map((pro) => (
                              <li key={pro} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-[13px] text-ink-muted">
                            La ficha del fabricante no detalla ventajas adicionales.
                          </p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-line bg-white p-5">
                        <h3 className="flex items-center gap-2 font-sans text-[13px] font-semibold text-ink">
                          <XCircle className="h-4 w-4 text-warning" />
                          A tener en cuenta
                        </h3>
                        {product.cons.length ? (
                          <ul className="mt-3 space-y-2">
                            {product.cons.slice(0, 5).map((con) => (
                              <li key={con} className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-[13px] text-ink-muted">
                            No hay desventajas relevantes registradas en la ficha. Revisa el peso y
                            la autonomía real antes de decidir.
                          </p>
                        )}
                        <p className="mt-4 text-[10.5px] leading-relaxed text-ink-muted">
                          Basado en la información pública del fabricante; puede variar según la
                          versión.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "especificaciones" && <SpecTable product={product} />}

                {activeTab === "puntuacion" && (
                  <div>
                    <h2 className="text-2xl text-ink">Perfil de rendimiento</h2>
                    <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                      Seis criterios, una sola escala. La forma del radar importa más que el área
                      total: busca un perfil equilibrado y sin vértices hundidos.
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
                      <div className="rounded-2xl border border-line bg-white p-4">
                        <RadarChart
                          labels={radarLabels}
                          series={[
                            {
                              name: product.shortName || product.name,
                              color: "var(--color-brand)",
                              values: radarValues,
                            },
                          ]}
                        />
                      </div>
                      <div className="rounded-2xl border border-line bg-white p-6">
                        <ScorePanel product={product} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "opiniones" && (
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-line bg-white p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl text-ink">Lo que dicen los compradores</h2>
                          <div className="mt-3 flex items-center gap-3">
                            <Stars rating={product.rating} size={18} showValue />
                            <span className="text-[13px] text-ink-muted">
                              {product.reviewCount > 0
                                ? `${formatCompact(product.reviewCount)} opiniones en Amazon`
                                : "Todavía sin opiniones"}
                            </span>
                          </div>
                        </div>
                        <Button href={product.affiliateUrl} variant="outline" size="sm">
                          Ver en Amazon
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <p className="mt-5 rounded-xl bg-cream-100/70 p-4 text-[12px] leading-relaxed text-ink-muted">
                        La nota media y el número de opiniones proceden de la ficha de Amazon. No
                        publicamos reseñas inventadas ni incentivadas.
                      </p>
                    </div>

                    {product.reviewsSummary.positive || product.reviewsSummary.negative ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-line bg-white p-5">
                          <h3 className="flex items-center gap-2 font-sans text-[13px] font-semibold text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            Lo positivo
                          </h3>
                          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                            {product.reviewsSummary.positive || "Sin resumen disponible."}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-line bg-white p-5">
                          <h3 className="flex items-center gap-2 font-sans text-[13px] font-semibold text-warning">
                            <XCircle className="h-4 w-4" />
                            Lo negativo
                          </h3>
                          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                            {product.reviewsSummary.negative || "Sin resumen disponible."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-line bg-white p-5">
                          <h3 className="font-sans text-[13px] font-semibold text-ink">
                            Lo que más se valora
                          </h3>
                          <ul className="mt-3 space-y-2">
                            {product.pros.slice(0, 3).map((item) => (
                              <li key={item} className="flex items-start gap-2 text-[13px] text-ink-soft">
                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-2xl border border-line bg-white p-5">
                          <h3 className="font-sans text-[13px] font-semibold text-ink">
                            Lo que conviene saber
                          </h3>
                          <ul className="mt-3 space-y-2">
                            {product.cons.slice(0, 3).map((item) => (
                              <li key={item} className="flex items-start gap-2 text-[13px] text-ink-soft">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "mantenimiento" && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl text-ink">Mantenimiento sin sorpresas</h2>
                      <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                        Un patinete dura años si cuidas tres cosas: neumáticos, frenos y batería.
                        Esta rutina evita las averías más comunes y no requiere herramientas
                        especiales.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                            "Aprieta tornillos del manillar y la plegable.",
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

                    <div className="flex items-start gap-3 rounded-2xl border border-line bg-cream-100/70 p-5">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      <div>
                        <h3 className="font-sans text-[13px] font-semibold text-ink">
                          Nota específica de {product.brand}
                        </h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                          {brandMaintenance(product.brand)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Purchase panel */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    Patinete eléctrico
                  </p>
                  <h1 className="mt-1.5 font-sans text-[21px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                    {product.shortName || product.model}
                  </h1>
                </div>
                <ScoreBadge score={product.editorScore} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars rating={product.rating} showValue />
                <span className="text-[12px] text-ink-muted">
                  {product.reviewCount > 0
                    ? `${formatCompact(product.reviewCount)} opiniones`
                    : "Sin opiniones todavía"}
                </span>
              </div>

              <div className="mt-5 border-t border-line pt-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[34px] font-semibold leading-none tabular tracking-[-0.03em] text-ink">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[11px] text-ink-muted">orientativo</span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
                  {product.pricePosition < -3 ? (
                    <>
                      <span className="font-semibold text-success">
                        {Math.abs(product.pricePosition)} % por debajo
                      </span>{" "}
                      del precio mediano del catálogo.
                    </>
                  ) : product.pricePosition > 3 ? (
                    <>
                      <span className="font-semibold text-ink">
                        {product.pricePosition} % por encima
                      </span>{" "}
                      del precio mediano del catálogo.
                    </>
                  ) : (
                    "En línea con el precio mediano del catálogo."
                  )}
                </p>
              </div>

              <div className="mt-5 space-y-2.5">
                <Button href={product.affiliateUrl} size="lg" fullWidth>
                  Ver precio en Amazon
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => toggle(product.id)}
                  aria-pressed={selected}
                >
                  {selected ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
                  {selected ? "En la comparación" : "Añadir a comparar"}
                </Button>
              </div>

              <p className="mt-3 text-center text-[10.5px] text-ink-muted">
                Se abre en Amazon.es · el precio puede variar
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5">
                {quickFacts.map((fact) => (
                  <div key={fact.label} className="rounded-xl bg-cream-50 p-3">
                    <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                      <fact.icon className="h-3 w-3" aria-hidden="true" />
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-[14px] font-semibold text-ink">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <AffiliateNote className="mt-5" withLink />
            </div>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-line pt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                  Alternativas
                </p>
                <h2 className="mt-2 text-2xl text-ink sm:text-3xl">Si este no te convence</h2>
              </div>
              <Button as={Link} to="/patinetes" variant="link">
                Ver todo el catálogo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </Container>

      {/* Mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream-50/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Precio orientativo
            </p>
            <p className="text-xl font-semibold tabular text-ink">{formatPrice(product.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-pressed={selected}
              aria-label={selected ? "Quitar de la comparación" : "Añadir a la comparación"}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                selected
                  ? "border-brand bg-brand text-white"
                  : "border-line-strong bg-white text-ink-soft"
              }`}
            >
              {selected ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
            </button>
            <Button href={product.affiliateUrl} size="md">
              Ver en Amazon
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function brandMaintenance(brand) {
  switch (brand) {
    case "Xiaomi":
      return "Revisa la presión cada dos semanas y usa el cargador original. La batería de los Xiaomi agradece cargas parciales: evita dejarla al 0 % durante semanas y no la cargues al 100 % si no vas a usarla al día siguiente.";
    case "Segway":
      return "Los Ninebot tienen app propia para revisar el estado de la batería y actualizar el firmware. Comprueba el bloqueo del plegado y la holgura del manillar cada mes; es lo primero que se nota con el uso.";
    case "Cecotec":
      return "Mantén los neumáticos a la presión indicada y revisa los frenos con frecuencia. Si vives en zona húmeda, seca el chasis tras la lluvia y evita sumergir la batería aunque el patinete tenga certificación IP.";
    case "Smartgyro":
      return "Revisa la tornillería del manillar y la bisagra cada mes. Usa el cargador original y guarda el patinete en un lugar seco; el frío intenso reduce la autonomía de forma temporal.";
    case "iScooter":
      return "Comprueba la presión y el desgaste de los neumáticos cada 300 km. Si notas holgura en la dirección, aprieta la tuerca de la columna antes de seguir usando el patinete.";
    default:
      return "Sigue las instrucciones del fabricante, usa el cargador original y no esperes a que la batería esté al 0 % para cargarla. La constancia importa más que la intensidad: revisar la presión y los frenos cada dos semanas evita la mayoría de las averías.";
  }
}
