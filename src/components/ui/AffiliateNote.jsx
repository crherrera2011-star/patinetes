import { Info } from "lucide-react";
import { Link } from "react-router-dom";

export default function AffiliateNote({ tone = "light", className = "", withLink = true }) {
  const dark = tone === "dark";

  return (
    <p
      className={`flex items-start gap-2 text-[11.5px] leading-relaxed ${
        dark ? "text-cream-200/70" : "text-ink-muted"
      } ${className}`}
    >
      <Info className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${dark ? "text-copper" : "text-brand"}`} aria-hidden="true" />
      <span>
        Como afiliados de Amazon ingresamos una comisión por las compras realizadas desde nuestros
        enlaces. El precio que pagas es el mismo.{" "}
        {withLink && (
          <Link
            to="/aviso-legal#afiliados"
            className={`underline underline-offset-2 ${dark ? "hover:text-cream-50" : "hover:text-brand"}`}
          >
            Más información
          </Link>
        )}
      </span>
    </p>
  );
}
