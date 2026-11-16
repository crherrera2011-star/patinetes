import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  BookOpen,
  Briefcase,
  Mountain,
  Scale,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

const ICONS = {
  book: BookOpen,
  shield: ShieldCheck,
  battery: BatteryCharging,
  wallet: Wallet,
  scale: Scale,
  mountain: Mountain,
  briefcase: Briefcase,
  users: Users,
};

/**
 * Tarjeta tipo «cromo» (sticker coleccionable) para las guías editoriales.
 *
 * Diseño de coleccionable: degradado de marca, número de artículo, icono,
 * título, resumen y «brillos» de los puntos clave.
 */
export default function ArticleCard({ article, index = 0 }) {
  const Icon = ICONS[article.icon] || BookOpen;
  const order = String(index + 1).padStart(2, "0");

  return (
    <Link
      to={article.path}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-1 shadow-card ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      {/* Superficie del cromo */}
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[14px] p-5">
        {/* Degradado de fondo del cromo */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${article.tone} transition-transform duration-500 group-hover:scale-[1.03]`}
          aria-hidden="true"
        />

        {/* Textura de grano sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-1 flex-col">
          {/* Encabezado del cromo */}
          <div className="flex items-start justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
              <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden="true" />
              {article.category}
            </span>
            <span
              className="text-[26px] font-semibold leading-none tabular text-white/25"
              aria-hidden="true"
            >
              {order}
            </span>
          </div>

          {/* Icono */}
          <span className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm ring-1 ring-white/20">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>

          {/* Título y resumen */}
          <h3 className="mt-4 font-sans text-[17px] font-semibold leading-snug text-white">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-white/80">
            {article.description}
          </p>

          {/* Highlights (los «brillos» del cromo) */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {article.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/85 ring-1 ring-white/15"
              >
                {highlight}
              </span>
            ))}
          </div>

          {/* Pie del cromo */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/60">
              {article.readingTime} lectura
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-white ring-1 ring-white/20 transition-colors group-hover:bg-white/25">
              Abrir cromo
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
