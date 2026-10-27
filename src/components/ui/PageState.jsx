import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

export function LoadingGrid({ count = 6, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`} aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="skeleton aspect-[4/3] w-full" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-3 w-20 rounded-full" />
            <div className="skeleton h-4 w-4/5 rounded-full" />
            <div className="skeleton h-4 w-3/5 rounded-full" />
            <div className="skeleton h-8 w-full rounded-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Cargando patinetes…</span>
    </div>
  );
}

export function PageLoader({ label = "Cargando catálogo" }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 text-ink-muted">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-cream-300 border-t-brand" />
      <p className="text-sm">{label}…</p>
    </div>
  );
}

export function ErrorState({
  title = "No hemos podido cargar el catálogo",
  message,
  onRetry,
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-line bg-white px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertCircle className="h-6 w-6" />
      </span>
      <h2 className="text-2xl text-ink">{title}</h2>
      {message && <p className="mt-3 text-sm leading-relaxed text-ink-muted">{message}</p>}
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      )}
    </div>
  );
}
