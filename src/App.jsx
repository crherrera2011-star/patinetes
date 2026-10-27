import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import CompareBar from "./components/ui/CompareBar";
import ScrollToTop from "./components/ui/ScrollToTop";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import SourceNotice from "./components/ui/SourceNotice";
import CompareSync from "./components/ui/CompareSync";
import { PageLoader } from "./components/ui/PageState";
import { CatalogProvider } from "./context/CatalogContext";
import { CompareProvider } from "./context/CompareContext";

const Home = lazy(() => import("./pages/Home"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Categories = lazy(() => import("./pages/Categories"));
const Comparison = lazy(() => import("./pages/Comparison"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Offers = lazy(() => import("./pages/Offers"));
const Guia2026 = lazy(() => import("./pages/Guia2026"));
const AvisoLegal = lazy(() => import("./pages/AvisoLegal"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-cream-50"
      >
        Saltar al contenido
      </a>

      <ScrollToTop />
      <CompareSync />
      <Header />
      <SourceNotice />

      <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/patinetes" element={<Catalog />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/comparador" element={<Comparison />} />
              <Route path="/guia-2026" element={<Guia2026 />} />
              <Route path="/ofertas" element={<Offers />} />
              <Route path="/aviso-legal" element={<AvisoLegal />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/maquinas/:id" element={<LegacyProductRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <CompareBar />
    </div>
  );
}

function LegacyProductRedirect() {
  const location = useLocation();
  const id = location.pathname.split("/").filter(Boolean).at(-1);
  return <Navigate to={`/producto/${id}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <CompareProvider>
          <AppShell />
        </CompareProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
