export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  light = false,
  className = "",
}) {
  const alignment = align === "center" ? "items-center text-center" : "items-start";

  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${
        align === "center" ? "sm:flex-col sm:items-center" : ""
      } ${className}`}
    >
      <div className={`flex max-w-2xl flex-col ${alignment}`}>
        {eyebrow && (
          <p
            className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${
              light ? "text-copper" : "text-brand"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-3xl leading-[1.05] sm:text-[2.6rem] ${
            light ? "text-cream-50" : "text-ink"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-4 text-[15px] leading-relaxed ${
              light ? "text-cream-200/80" : "text-ink-muted"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
