import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on navigation, but respects in-page anchors such as
 * /guia-2026#metodologia or /aviso-legal#afiliados.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let attempts = 0;
      let timer;

      // Lazy routes mount after the location changes, so the anchor may not
      // exist yet. Retry briefly instead of silently scrolling to the top.
      const scrollToTarget = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (attempts < 12) {
          attempts += 1;
          timer = setTimeout(scrollToTarget, 60);
        }
      };

      scrollToTarget();
      return () => clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
