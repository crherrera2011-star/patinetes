import { Component } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Container from "./Container";
import Button from "./Button";

/**
 * Last-resort boundary: a rendering error should never leave the visitor with a
 * blank page. Resets when the route changes (see the `resetKey` prop in App).
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <Container className="py-20">
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-line bg-white px-6 py-14 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="text-2xl text-ink">Algo no se ha cargado bien</h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Hemos registrado el problema. Vuelve a intentarlo o recarga la página para seguir
              explorando el catálogo.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
              <RotateCcw className="h-4 w-4" />
              Recargar
            </Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
