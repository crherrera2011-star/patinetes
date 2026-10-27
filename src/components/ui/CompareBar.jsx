import { Link, useLocation } from "react-router-dom";
import { Scale, Trash2, X } from "lucide-react";
import { useCompare } from "../../context/CompareContext";
import { useCatalog } from "../../context/CatalogContext";
import ProductMedia from "../product/ProductMedia";
import Button from "./Button";

export default function CompareBar() {
  const { selectedIds, count, remove, clear, notice, dismissNotice, limit } = useCompare();
  const { products } = useCatalog();
  const location = useLocation();

  const hidden =
    count === 0 ||
    location.pathname.startsWith("/comparador") ||
    location.pathname.startsWith("/producto/");

  const selected = selectedIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  if (hidden) {
    return notice ? (
      <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 px-4" role="status" aria-live="polite">
        <button
          type="button"
          onClick={dismissNotice}
          className="rounded-full bg-ink px-4 py-2 text-xs text-cream-50 shadow-lift"
        >
          {notice}
        </button>
      </div>
    ) : null;
  }

  return (
    <>
      {notice && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 px-4" role="status" aria-live="polite">
          <button
            type="button"
            onClick={dismissNotice}
            className="rounded-full bg-ink px-4 py-2 text-xs text-cream-50 shadow-lift"
          >
            {notice}
          </button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream-50/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-18px_rgba(16,22,20,0.4)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              {Array.from({ length: limit }).map((_, index) => {
                const product = selected[index];
                return (
                  <div
                    key={index}
                    className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-line bg-white"
                  >
                    {product ? (
                      <>
                        <ProductMedia
                          product={product}
                          className="h-full w-full p-0"
                          imgClassName="object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-ink/80 text-white opacity-0 transition-opacity hover:bg-danger focus:opacity-100 group-hover:opacity-100"
                          aria-label={`Quitar ${product.shortName} de la comparación`}
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-ink-muted/50">{index + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                {count} de {limit} patinetes
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {count < 2 ? "Añade otro para comparar" : "Listos para comparar"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={clear}
              className="hidden rounded-full p-2 text-ink-muted transition-colors hover:bg-cream-200 hover:text-danger sm:block"
              aria-label="Vaciar comparación"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <Button as={Link} to="/comparador" size="sm" className="whitespace-nowrap">
              <Scale className="h-4 w-4" />
              Comparar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
