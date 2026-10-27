import { useEffect } from "react";
import { useCatalog } from "../../context/CatalogContext";
import { useCompare } from "../../context/CompareContext";

/**
 * Quita del comparador los ids guardados que ya no existen en el catálogo,
 * para que la barra flotante nunca cuente un patinete que no se puede comparar.
 */
export default function CompareSync() {
  const { products, status } = useCatalog();
  const { selectedIds, remove } = useCompare();

  useEffect(() => {
    if (status !== "ready" || selectedIds.length === 0) return;
    const available = new Set(products.map((product) => product.id));
    selectedIds.filter((id) => !available.has(id)).forEach(remove);
  }, [products, status, selectedIds, remove]);

  return null;
}
