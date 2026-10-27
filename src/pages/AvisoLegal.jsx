import { Link } from "react-router-dom";
import { ChevronRight, Mail, ShieldCheck } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import AffiliateNote from "../components/ui/AffiliateNote";
import { SITE } from "../lib/site";
import { useSEO } from "../lib/seo";

const SECTIONS = [
  { id: "afiliados", title: "Afiliados y transparencia" },
  { id: "privacidad", title: "Privacidad" },
  { id: "cookies", title: "Cookies y almacenamiento local" },
  { id: "propiedad", title: "Propiedad intelectual" },
  { id: "responsabilidad", title: "Responsabilidad" },
  { id: "ley", title: "Ley aplicable" },
];

export default function AvisoLegal() {
  useSEO({
    title: "Aviso legal, afiliados y privacidad",
    description:
      "Cómo funciona Patinetes Eléctricos: programa de afiliados de Amazon, tratamiento de datos, uso de cookies y limitación de responsabilidad.",
    path: "/aviso-legal",
  });

  return (
    <div className="bg-cream-50 pb-20">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Link to="/" className="hover:text-brand">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-ink">Aviso legal</span>
        </nav>

        <header className="mt-6 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Información legal
          </p>
          <h1 className="mt-3 text-4xl leading-[1.04] text-ink sm:text-5xl">
            Cómo trabajamos y qué hacemos con tus datos
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            Esta página explica de forma directa nuestra relación con Amazon, el tratamiento de
            datos y las condiciones de uso del sitio. Última revisión: octubre de 2026.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                En esta página
              </p>
              <ul className="mt-3 space-y-1.5">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-2 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-cream-100 hover:text-brand"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-line pt-4">
                <Button href={`mailto:${SITE.email}`} variant="outline" size="sm" fullWidth>
                  <Mail className="h-4 w-4" />
                  Escribirnos
                </Button>
              </div>
            </div>
          </aside>

          <div className="prose-editorial max-w-none">
            <section id="afiliados" className="scroll-mt-28">
              <h2>1. Afiliados y transparencia</h2>
              <p>
                <strong>{SITE.fullName}</strong> es un sitio editorial independiente dedicado a
                comparar patinetes eléctricos disponibles en Amazon.es. Para mantener el proyecto,
                participamos en el Programa de Afiliados de Amazon, lo que significa que ingresamos
                una comisión cuando alguien compra a través de nuestros enlaces.
              </p>
              <ul>
                <li>El precio que pagas es exactamente el mismo que si llegaras a Amazon por tu cuenta.</li>
                <li>La comisión no altera la nota editorial ni el orden de las recomendaciones.</li>
                <li>No aceptamos pagos de marcas por aparecer, subir posiciones o mejorar valoraciones.</li>
                <li>
                  Los enlaces externos a Amazon se abren en una pestaña nueva y están marcados como
                  enlaces patrocinados.
                </li>
              </ul>
              <AffiliateNote className="mt-5" withLink={false} />
            </section>

            <section id="privacidad" className="scroll-mt-28">
              <h2>2. Privacidad</h2>
              <p>
                Este sitio no requiere registro y no solicita datos personales para consultar el
                catálogo, el comparador o las guías. No vendemos ni cedemos datos a terceros con
                fines publicitarios.
              </p>
              <h3>Qué datos podemos tratar</h3>
              <ul>
                <li>
                  <strong>Datos técnicos:</strong> el proveedor de alojamiento puede registrar la
                  dirección IP y el agente de usuario en sus registros de acceso por seguridad y
                  funcionamiento del servicio.
                </li>
                <li>
                  <strong>Correo electrónico:</strong> si nos escribes a{" "}
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>, conservaremos tu mensaje y tu
                  dirección únicamente para responder a tu consulta.
                </li>
                <li>
                  <strong>Preferencias del comparador:</strong> los modelos seleccionados se guardan
                  en el almacenamiento local de tu navegador, no en nuestros servidores.
                </li>
              </ul>
              <h3>Base legal y derechos</h3>
              <p>
                El tratamiento se basa en el interés legítimo de responder a tus consultas y en el
                consentimiento técnico necesario para recordar tus preferencias. Puedes solicitar
                acceso, rectificación, supresión u oposición escribiendo a{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. También puedes reclamar ante la
                Agencia Española de Protección de Datos.
              </p>
              <p>
                Amazon es un servicio independiente con su propia política de privacidad. Al pulsar
                un enlace de afiliado abandonas este sitio y pasas a estar sujeto a las condiciones
                de Amazon.es.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28">
              <h2>3. Cookies y almacenamiento local</h2>
              <p>
                Este sitio no utiliza cookies publicitarias ni de seguimiento propias. Para recordar
                el comparador empleamos <strong>localStorage</strong>, una tecnología del navegador
                que guarda información en tu dispositivo y no se envía a nuestros servidores.
              </p>
              <ul>
                <li>
                  <strong>Clave <code>patinetes:compare:v1</code>:</strong> almacena los
                  identificadores de los patinetes que has añadido al comparador (máximo tres).
                </li>
                <li>
                  Puedes borrar esta información en cualquier momento desde los ajustes de tu
                  navegador o vaciando la comparación.
                </li>
                <li>
                  Si en el futuro incorporamos analítica o cookies de terceros, actualizaremos esta
                  página y solicitaremos el consentimiento correspondiente.
                </li>
              </ul>
            </section>

            <section id="propiedad" className="scroll-mt-28">
              <h2>4. Propiedad intelectual</h2>
              <p>
                Los textos, la selección editorial, el diseño y el código de este sitio pertenecen a{" "}
                {SITE.fullName}, salvo que se indique lo contrario. Las marcas, nombres comerciales e
                imágenes de producto son propiedad de sus respectivos titulares y se muestran con
                fines informativos y de identificación.
              </p>
              <p>
                No está permitida la reproducción total o parcial del contenido sin autorización
                escrita. Se permite citar fragmentos breves indicando la fuente y enlazando a la
                página original.
              </p>
            </section>

            <section id="responsabilidad" className="scroll-mt-28">
              <h2>5. Responsabilidad</h2>
              <p>
                Trabajamos con la información publicada por los fabricantes y con las valoraciones
                disponibles en Amazon en el momento de la revisión. Aun así, las especificaciones,
                los precios y la disponibilidad pueden cambiar sin aviso.
              </p>
              <p>
                Las notas editoriales son una orientación, no una garantía de rendimiento. Antes de
                comprar, confirma siempre los detalles del modelo, el vendedor, el precio final y las
                condiciones de garantía en la ficha de Amazon.es.
              </p>
              <p>
                Los patinetes eléctricos son vehículos de movilidad personal: circula según la
                normativa estatal y la ordenanza de tu municipio. Este sitio no sustituye el manual
                del fabricante ni asesora sobre la legalidad de cada modelo en cada ciudad.
              </p>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-line bg-cream-100/70 p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-[12.5px] leading-relaxed text-ink-soft">
                  No realizamos pruebas de laboratorio propias ni afirmamos medir variables que no
                  podamos comprobar. Cuando un dato no está publicado, lo indicamos en lugar de
                  rellenarlo.
                </p>
              </div>
            </section>

            <section id="ley" className="scroll-mt-28">
              <h2>6. Ley aplicable</h2>
              <p>
                Estas condiciones se rigen por la legislación española. Cualquier controversia
                derivada del uso del sitio se someterá a los juzgados y tribunales competentes que
                correspondan conforme a la normativa aplicable en materia de consumidores.
              </p>
              <p>
                Para cualquier duda sobre este aviso legal puedes escribir a{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
