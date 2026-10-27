import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import config from "../../niche.config.mjs";
import { supabase } from "../lib/supabase";
import { enrichCatalog, normalizeProduct } from "../lib/normalize-product";
import fallbackData from "../data/productos.json";

const CatalogContext = createContext(null);
const TABLE = config.table || "products";
const FALLBACK = Array.isArray(fallbackData) ? fallbackData : fallbackData?.items || [];

/**
 * Carga el catálogo una vez por sesión y lo expone a todas las rutas.
 * Si Supabase falla (o no está configurado), usa el snapshot local y avisa.
 */
export function CatalogProvider({ children, fallback = FALLBACK }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const load = useCallback(async () => {
    setStatus((current) => (current === "ready" ? current : "loading"));
    setError(null);
    setWarning(null);

    try {
      if (!supabase) throw new Error("Supabase no está configurado");
      const { data, error: supabaseError } = await supabase
        .from(TABLE)
        .select("*")
        .order("price", { ascending: true });

      if (supabaseError) throw supabaseError;
      if (!data?.length) throw new Error("El catálogo está vacío");

      setProducts(enrichCatalog(data.map(normalizeProduct).filter(Boolean)));
      setSource("live");
      setStatus("ready");
    } catch (err) {
      // Pista útil en la consola: casi siempre es falta de VITE_SUPABASE_* en
      // el build del hosting (Vite las inyecta al compilar, no en runtime).
      console.warn("[catálogo] Fallo al cargar Supabase:", err?.message || err);

      const cached = (fallbackRef.current || []).map(normalizeProduct).filter(Boolean);
      if (cached.length) {
        setProducts(enrichCatalog(cached));
        setSource("cache");
        setStatus("ready");
        setWarning(
          "No hemos podido conectar con el catálogo en directo. Mostramos una copia local."
        );
      } else {
        setStatus("error");
        setError(err?.message || "No se pudo cargar el catálogo");
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b, "es")
    );
    const prices = products.map((product) => product.price).filter(Boolean);
    const latest = products
      .map((product) => product.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      products,
      brands,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      lastUpdated: latest ? new Date(latest) : new Date(),
      loading: status === "loading",
      status,
      source,
      error,
      warning,
      reload: load,
    };
  }, [products, status, source, error, warning, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  return context;
}

export function useProduct(id) {
  const { products, loading, status } = useCatalog();
  return {
    product: products.find((item) => item.id === id || item.asin === id),
    products,
    loading,
    status,
  };
}
