import { productSpecRows, specGroups } from "../../lib/normalize-product";

export default function SpecTable({ product }) {
  const rows = productSpecRows(product);
  const groups = specGroups();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {groups.map((group) => {
          const groupRows = rows.filter((row) => row.group === group);
          if (groupRows.length === 0) return null;

          return (
            <section key={group} className="overflow-hidden rounded-xl border border-line bg-white">
              <h3 className="border-b border-line bg-cream-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                {group}
              </h3>
              <dl className="divide-y divide-line/70 px-5">
                {groupRows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-[13px] text-ink-muted">{row.label}</dt>
                    <dd className="text-right text-[13px] font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      <p className="text-[11.5px] leading-relaxed text-ink-muted">
        Datos tomados de la ficha del fabricante. Las especificaciones pueden variar según la
        versión o el lote: confirma los detalles en la página del producto antes de comprar. Un
        guion significa que el dato no está publicado, no que el patinete carezca de él.
      </p>
    </div>
  );
}
