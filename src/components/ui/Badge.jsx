const TONES = {
  editor: "bg-brand text-white",
  value: "bg-olive text-white",
  budget: "bg-ink text-cream-50",
  neutral: "bg-cream-200 text-ink-soft",
  outline: "border border-line-strong bg-white/80 text-ink-soft",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export default function Badge({ tone = "neutral", children, className = "", icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
        TONES[tone] || TONES.neutral
      } ${className}`}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
