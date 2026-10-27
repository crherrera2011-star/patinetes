const VARIANT_CLASSES = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-dark active:bg-brand-dark disabled:bg-brand/40",
  dark: "bg-ink text-cream-50 hover:bg-ink-soft active:bg-ink",
  outline:
    "border border-line-strong bg-white/70 text-ink hover:border-brand hover:text-brand",
  light: "bg-cream-50 text-ink hover:bg-white border border-transparent",
  ghost: "text-ink-soft hover:bg-cream-100 hover:text-ink",
  link: "text-brand underline-offset-4 hover:underline",
};

const SIZE_CLASSES = {
  xs: "h-8 px-3 text-[11px]",
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-10 w-10 p-0",
};

export default function Button({
  as,
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  type = "button",
  ...props
}) {
  const Component = as || (href ? "a" : "button");
  const isExternal = Component === "a" && href && /^https?:/i.test(href);
  const isLink = variant === "link";

  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em]",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200",
    "disabled:cursor-not-allowed disabled:opacity-60",
    isLink ? "h-auto p-0" : SIZE_CLASSES[size] || SIZE_CLASSES.md,
    VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      href={href}
      type={Component === "button" ? type : undefined}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer sponsored" : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}
