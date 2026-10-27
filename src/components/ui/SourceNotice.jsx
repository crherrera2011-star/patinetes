import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCatalog } from "../../context/CatalogContext";

/**
 * Aviso honesto y discreto cuando no se pudo alcanzar el catálogo en directo y
 * se está usando la copia local.
 */
export default function SourceNotice() {
  const { warning, reload } = useCatalog();

  if (!warning) return null;

  return (
    <div className="border-b border-warning/20 bg-warning/[0.08]">
      <div className="mx-auto flex w-full max-w-7xl items-start gap-2.5 px-5 py-2.5 text-[11.5px] leading-relaxed text-warning sm:items-center sm:px-8">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          {warning} Los precios pueden no estar actualizados: confirma siempre el importe en Amazon.
        </p>
        <button
          type="button"
          onClick={reload}
          className="inline-flex shrink-0 items-center gap-1 font-medium underline underline-offset-2 hover:text-ink"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          Reintentar
        </button>
      </div>
    </div>
  );
}
