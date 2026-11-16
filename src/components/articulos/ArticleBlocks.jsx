import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { SPECS, specDisplay, specValue } from "../../lib/normalize-product";
import { formatPrice } from "../../lib/format";

const LINK_CLASS =
  "font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand";

export function slugifyHeading(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Negritas **así** y enlaces [texto](/ruta) dentro del texto editorial. */
function Inline({ text }) {
  const parts = String(text || "").split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (/^https?:/i.test(href)) {
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS}
          >
            {label}
          </a>
        );
      }
      return (
        <Link key={index} to={href} className={LINK_CLASS}>
          {label}
        </Link>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

const CALLOUT_TONES = {
  brand: {
    box: "border-brand/20 bg-brand-soft/60",
    icon: Info,
    iconClass: "text-brand",
  },
  warning: {
    box: "border-warning/25 bg-warning/[0.07]",
    icon: AlertTriangle,
    iconClass: "text-warning",
  },
  success: {
    box: "border-success/25 bg-success/[0.06]",
    icon: CheckCircle2,
    iconClass: "text-success",
  },
};

const ROW_LABELS = {
  precio: "Precio orientativo",
  nota: "Nota editorial",
};

function SpecsTable({ block, products, loading }) {
  const columns = (block.ids || []).map((id) => products.get(id)).filter(Boolean);

  if (!columns.length) {
    return (
      <p className="mt-6 rounded-2xl border border-line bg-white p-5 text-[13px] text-ink-muted">
        {loading
          ? "Cargando los datos del catálogo…"
          : "Los datos de esta comparativa no están disponibles ahora mismo."}
      </p>
    );
  }

  const keys = block.rows || [
    "precio",
    "nota",
    "autonomia_km",
    "motor_w",
    "peso_kg",
    "bateria_wh",
  ];

  const valueFor = (key, product) => {
    if (key === "precio") return formatPrice(product.price);
    if (key === "nota") return product.editorScore > 0 ? product.editorScore.toFixed(1) : "—";
    return specDisplay(key, specValue(product, key));
  };

  const labelFor = (key) => {
    if (ROW_LABELS[key]) return ROW_LABELS[key];
    const definition = SPECS[key] || {};
    return definition.unit ? `${definition.label} (${definition.unit})` : definition.label || key;
  };

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <caption className="sr-only">Comparativa de especificaciones</caption>
        <thead className="border-b border-line bg-cream-100 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">
              Modelo
            </th>
            {columns.map((product) => (
              <th key={product.id} scope="col" className="px-5 py-3 font-semibold">
                <Link to={`/producto/${product.id}`} className="hover:text-brand">
                  {product.shortName || product.model || product.name}
                </Link>
                <span className="mt-0.5 block text-[9.5px] font-medium normal-case tracking-normal text-ink-muted">
                  {product.brand}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {keys.map((key) => (
            <tr key={key} className="transition-colors hover:bg-cream-50">
              <th scope="row" className="px-5 py-3.5 text-left font-medium text-ink-muted">
                {labelFor(key)}
              </th>
              {columns.map((product) => (
                <td key={product.id} className="px-5 py-3.5 tabular text-ink">
                  {valueFor(key, product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProsCons({ block }) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-5">
      {block.title && (
        <h3 className="font-sans text-[15px] font-semibold text-ink">{block.title}</h3>
      )}
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            A favor
          </p>
          <ul className="mt-2.5 space-y-2">
            {(block.pros || []).map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                  aria-hidden="true"
                />
                <Inline text={item} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-danger">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            En contra
          </p>
          <ul className="mt-2.5 space-y-2">
            {(block.cons || []).map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-soft"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-danger"
                  aria-hidden="true"
                />
                <Inline text={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ArticleBlocks({ blocks = [], products, loading = false }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={index}
                id={slugifyHeading(block.text)}
                className="mt-12 scroll-mt-28 text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]"
              >
                {block.text}
              </h2>
            );

          case "p":
            return (
              <p key={index} className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
                <Inline text={block.text} />
              </p>
            );

          case "list":
            return (
              <ul key={index} className="mt-5 space-y-2.5">
                {(block.items || []).map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-soft"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-copper"
                      aria-hidden="true"
                    />
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "steps":
            return (
              <ol key={index} className="mt-6 space-y-3">
                {(block.items || []).map((item, stepIndex) => (
                  <li key={item} className="flex gap-4 rounded-2xl border border-line bg-white p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[11.5px] font-semibold text-cream-50">
                      {stepIndex + 1}
                    </span>
                    <p className="text-[13px] leading-relaxed text-ink-soft">
                      <Inline text={item} />
                    </p>
                  </li>
                ))}
              </ol>
            );

          case "table":
            return (
              <div key={index} className="mt-6">
                <div className="overflow-x-auto rounded-2xl border border-line bg-white">
                  <table className="w-full min-w-[560px] text-left text-[13px]">
                    {block.caption && <caption className="sr-only">{block.caption}</caption>}
                    <thead className="border-b border-line bg-cream-100 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                      <tr>
                        {(block.head || []).map((cell) => (
                          <th key={cell} scope="col" className="px-5 py-3 font-semibold">
                            {cell}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {(block.rows || []).map((row, rowIndex) => (
                        <tr key={rowIndex} className="transition-colors hover:bg-cream-50">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className={`px-5 py-3.5 ${
                                cellIndex === 0 ? "font-medium text-ink" : "text-ink-soft"
                              }`}
                            >
                              <Inline text={cell} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {block.note && (
                  <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-muted">{block.note}</p>
                )}
              </div>
            );

          case "proscons":
            return <ProsCons key={index} block={block} />;

          case "callout": {
            const tone = CALLOUT_TONES[block.tone] || CALLOUT_TONES.brand;
            const Icon = tone.icon;
            return (
              <div
                key={index}
                className={`mt-6 flex items-start gap-3 rounded-2xl border p-5 ${tone.box}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.iconClass}`} aria-hidden="true" />
                <div>
                  {block.title && (
                    <p className="text-[13.5px] font-semibold text-ink">{block.title}</p>
                  )}
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    <Inline text={block.text} />
                  </p>
                </div>
              </div>
            );
          }

          case "specs":
            return <SpecsTable key={index} block={block} products={products} loading={loading} />;

          case "products": {
            const items = (block.ids || []).map((id) => products.get(id)).filter(Boolean);
            if (!items.length) return null;
            return (
              <div
                key={index}
                className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
