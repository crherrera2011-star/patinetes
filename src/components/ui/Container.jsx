export default function Container({ as: Component = "div", className = "", children, ...props }) {
  return (
    <Component className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`} {...props}>
      {children}
    </Component>
  );
}
