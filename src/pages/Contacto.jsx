import { Link } from "react-router-dom";
import {
  ChevronRight,
  Clock3,
  Mail,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import { SITE } from "../lib/site";
import { useSEO } from "../lib/seo";

const REASONS = [
  {
    icon: MessageSquare,
    title: "Correcciones de datos",
    text: "Si una especificación, un precio o un enlace no cuadra con la ficha oficial, dínoslo e indica el modelo y la fuente. Lo revisamos y corregimos.",
  },
  {
    icon: ShieldCheck,
    title: "Privacidad y derechos",
    text: "Para ejercer acceso, rectificación, supresión u oposición sobre tus datos, escribe desde la misma dirección con la que contactaste y lo gestionamos.",
  },
  {
    icon: Clock3,
    title: "Sugerencias de modelos",
    text: "Puedes proponer patinetes para el catálogo. No garantizamos que se analicen todos, pero sí leer cada propuesta.",
  },
];

const NOT_DONE = [
  "No vendemos posiciones ni mejoramos notas a cambio de dinero.",
  "No publicamos reseñas pagadas ni enlaces patrocinados encubiertos.",
  "No damos soporte técnico de un patinete concreto: para garantías, acude al vendedor.",
];

export default function Contacto() {
  useSEO({
    title: "Contacto",
    description:
      "Escríbenos para corregir un dato, proponer un modelo o ejercer tus derechos de privacidad. Contacto directo por correo, sin formularios ni registros.",
    path: "/contacto",
  });

  return (
    <div className="bg-cream-50 pb-20">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Contacto</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Contacto
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            Hablemos de patinetes, datos o privacidad
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            Detrás de {SITE.fullName} hay una persona, no un formulario automático. Escríbenos al
            correo y te responderemos en un par de días laborables.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-sans text-lg font-semibold text-ink">Correo electrónico</h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                    Es la vía más rápida y la única que usamos. No hay teléfono de atención ni chat.
                  </p>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="mt-4 inline-block break-words text-[14px] font-medium text-brand underline underline-offset-4 hover:text-brand-dark sm:text-[15px]"
                  >
                    {SITE.email}
                  </a>
                  <div className="mt-5">
                    <Button href={`mailto:${SITE.email}`} size="md">
                      <Mail className="h-4 w-4" />
                      Escribir un correo
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[1.65rem] leading-[1.15] text-ink sm:text-[1.9rem]">
                Para qué escribirnos
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {REASONS.map((reason) => {
                  const Icon = reason.icon;
                  return (
                    <div key={reason.title} className="rounded-2xl border border-line bg-white p-5">
                      <Icon className="h-5 w-5 text-copper" aria-hidden="true" />
                      <h3 className="mt-3 font-sans text-[14px] font-semibold text-ink">
                        {reason.title}
                      </h3>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
                        {reason.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
              <h2 className="font-sans text-lg font-semibold text-ink">Qué no hacemos</h2>
              <ul className="mt-4 space-y-3">
                {NOT_DONE.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-soft">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-line bg-cream-100 p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">
                Antes de escribir
              </p>
              <ul className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-ink-soft">
                <li>Indica el modelo o el enlace exacto de la página.</li>
                <li>Si es un dato, adjunta la fuente oficial o la ficha de Amazon.</li>
                <li>Para privacidad, escribe desde la dirección afectada.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                Más información
              </p>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link to="/aviso-legal" className="text-[12.5px] text-brand hover:text-brand-dark">
                    Aviso legal y privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    to="/aviso-legal#cookies"
                    className="text-[12.5px] text-brand hover:text-brand-dark"
                  >
                    Cookies y almacenamiento local
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guia-2026#metodologia"
                    className="text-[12.5px] text-brand hover:text-brand-dark"
                  >
                    Cómo puntuamos
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
