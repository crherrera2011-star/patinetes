import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "patinetes:compare:v1";
export const COMPARE_LIMIT = 3;

const CompareContext = createContext(null);

function readStoredIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id) => typeof id === "string").slice(0, COMPARE_LIMIT)
      : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }) {
  const [selectedIds, setSelectedIds] = useState(readStoredIds);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      /* storage can be unavailable in private mode */
    }
  }, [selectedIds]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const toggle = useCallback(
    (id) => {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
        return;
      }
      if (selectedIds.length >= COMPARE_LIMIT) {
        setNotice(`Puedes comparar hasta ${COMPARE_LIMIT} patinetes a la vez.`);
        return;
      }
      setSelectedIds([...selectedIds, id]);
    },
    [selectedIds]
  );

  const remove = useCallback((id) => {
    setSelectedIds((current) => current.filter((item) => item !== id));
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const value = useMemo(
    () => ({
      selectedIds,
      count: selectedIds.length,
      limit: COMPARE_LIMIT,
      isSelected: (id) => selectedIds.includes(id),
      toggle,
      remove,
      clear,
      notice,
      dismissNotice: () => setNotice(""),
    }),
    [selectedIds, toggle, remove, clear, notice]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare debe usarse dentro de <CompareProvider>");
  }
  return context;
}
