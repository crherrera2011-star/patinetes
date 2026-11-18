import { Link } from "react-router-dom";
import { ChevronRight, Mail, ShieldCheck } from "lucide-react";
import Container from "../components/ui/Container";
import Button from "../components/ui/Button";
import AffiliateNote from "../components/ui/AffiliateNote";
import { SITE } from "../lib/site";
import { useSEO } from "../lib/seo";

const SECTIONS = [
  { id: "titular", title: "Titular del sitio" },
  { id: "afiliados", title: "Afiliados y transparencia" },
  { id: "privacidad", title: "Privacidad" },
  { id: "cookies", title: "Cookies y almacenamiento" },
  { id: "propiedad", title: "Propiedad intelectual" },
  { id: "responsabilidad", title: "Responsabilidad" },
  { id: "ley", title: "Ley aplicable" },
];

export default function AvisoLegal() {
  const legal = SITE.legal || {};

  useSEO({
    title: "Aviso legal, privacidad y cookies",
    description:
      "Quién está detrás de Patinetes Eléctricos, cómo se financia el sitio, qué datos se tratan, qué cookies se usan y cómo ejercer tus derechos.",
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
            Aviso legal, privacidad y cookies
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
            Quién está detrás del sitio, cómo se financia, qué datos se tratan y qué cookies se usan.
            Última revisión: noviembre de 2026.
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
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                <Button href={`mailto:${SITE.email}`} variant="outline" size="sm" fullWidth>
                  <Mail className="h-4 w-4" />
                  Escribirnos
                </Button>
                <Button as={Link} to="/contacto" variant="ghost" size="sm" fullWidth>
                  Página de contacto
                </Button>
              </div>
            </div>
          </aside>

          <div className="prose-editorial max-w-none">
            <section id="titular" className="scroll-mt-28">
              <h2>1. Titular del sitio</h2>
              {legal.name ? (
                <ul>
                  <li>
                    <strong>Titular:</strong> {legal.name}
                  </li>
                  {legal.nif && (
                    <li>
                      <strong>NIF/CIF:</strong> {legal.nif}
                    </li>
                  )}
                  {legal.address && (
                    <li>
                      <strong>Domicilio:</strong> {legal.address}
                    </li>
                  )}
                  {legal.phone && (
                    <li>
                      <strong>Teléfono:</strong> {legal.phone}
                    </li>
                  )}
                  <li>
                    <strong>Correo:</strong>{" "}
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  </li>
                </ul>
              ) : (
                <p>
                  El titular de este sitio es <strong>{SITE.fullName}</strong>. Para cualquier
                  consulta relacionada con el contenido, los datos o las condiciones de uso, puedes
                  escribir a <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
                </p>
              )}
              <p>
                Este es un proyecto editorial independiente sobre patinetes eléctricos. No es una
                tienda: no vendemos productos ni gestionamos pedidos, garantías o devoluciones.
              </p>
            </section>

            <section id="afiliados" className="scroll-mt-28">
              <h2>2. Afiliados y transparencia</h2>
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
              <h2>3. Privacidad</h2>
              <p>
                Este sitio no requiere registro y no solicita datos personales para consultar el
                catálogo, el comparador o las guías. No vendemos ni cedemos datos a terceros con
                fines publicitarios y no elaboramos perfiles de usuario.
              </p>

              <h3>Responsable del tratamiento</h3>
              <p>
                El responsable es el titular indicado en el apartado 1. Para cualquier cuestión
                relacionada con tus datos, escribe a{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
              </p>

              <h3>Qué datos podemos tratar</h3>
              <ul>
                <li>
                  <strong>Datos técnicos de acceso:</strong> el proveedor de alojamiento puede
                  registrar la dirección IP, el agente de usuario y la fecha de la petición en sus
                  registros de seguridad. Se conservan durante un periodo limitado y no se usan para
                  publicidad.
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
                <li>
                  <strong>Analítica agregada:</strong> usamos Vercel Analytics para saber qué páginas
                  se visitan. Es una analítica sin cookies y sin identificación personal; los eventos
                  de clic en enlaces de afiliado solo registran el modelo, la ubicación del botón y el
                  precio, nunca datos que te identifiquen.
                </li>
              </ul>

              <h3>Para qué y con qué base legal</h3>
              <ul>
                <li>
                  <strong>Seguridad y funcionamiento:</strong> interés legítimo en mantener el sitio
                  disponible y protegido frente a abusos.
                </li>
                <li>
                  <strong>Responder a tus mensajes:</strong> consentimiento y relación precontractual
                  derivada de tu propia consulta.
                </li>
                <li>
                  <strong>Recordar el comparador:</strong> necesidad técnica del servicio que has
                  activado voluntariamente.
                </li>
                <li>
                  <strong>Medir audiencia:</strong> interés legítimo en conocer qué contenido es útil,
                  con datos agregados y sin perfilado.
                </li>
              </ul>

              <h3>Cuánto tiempo se conservan</h3>
              <ul>
                <li>Registros de acceso: el periodo limitado que fije el proveedor de alojamiento.</li>
                <li>Correos: mientras dure la consulta y, después, el tiempo necesario para atender posibles responsabilidades.</li>
                <li>Comparador: en tu navegador hasta que lo borres o vacíes la comparación.</li>
              </ul>

              <h3>Quién puede acceder</h3>
              <p>
                No cedemos datos a terceros con fines comerciales. Para prestar el servicio usamos
                proveedores que actúan como encargados del tratamiento: Vercel (alojamiento y
                analítica agregada), Supabase (base de datos del catálogo) y Amazon (solo cuando
                pulsas un enlace de afiliado y abandonas este sitio). Cada uno aplica su propia
                política de privacidad.
              </p>

              <h3>Seguridad y derechos</h3>
              <p>
                El sitio se sirve por HTTPS y el acceso a la base de datos está restringido. Puedes
                solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad
                escribiendo a <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. También puedes
                reclamar ante la Agencia Española de Protección de Datos.
              </p>
              <p>
                Amazon es un servicio independiente. Al pulsar un enlace de afiliado abandonas este
                sitio y pasas a estar sujeto a las condiciones y la política de Amazon.es.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28">
              <h2>4. Cookies y almacenamiento local</h2>
              <p>
                Este sitio <strong>no instala cookies propias de publicidad ni de seguimiento</strong>.
                No hay píxeles publicitarios, ni redes sociales embebidas, ni venta de audiencias. Por
                eso no verás un banner de consentimiento: no hay cookies que consentir.
              </p>

              <h3>Analítica sin cookies</h3>
              <p>
                Usamos <strong>Vercel Analytics</strong> para contar visitas y clics de forma agregada.
                Esta herramienta no usa cookies, no identifica a personas concretas y no permite
                seguirte por otras webs. Los eventos de clic en enlaces de afiliado registran solo el
                identificador del modelo, la ubicación del botón y el precio mostrado.
              </p>

              <h3>Almacenamiento local del comparador</h3>
              <ul>
                <li>
                  <strong>Clave <code>patinetes:compare:v1</code>:</strong> guarda los identificadores
                  de los patinetes que has añadido al comparador (máximo tres) en tu propio navegador.
                </li>
                <li>
                  Esta información no se envía a nuestros servidores y puedes borrarla en cualquier
                  momento desde los ajustes de tu navegador o vaciando la comparación.
                </li>
              </ul>

              <h3>Cookies de Amazon</h3>
              <p>
                Cuando pulsas un enlace de afiliado, pasas a Amazon.es. Amazon puede instalar sus
                propias cookies para gestionar la sesión y atribuir la compra. Esas cookies dependen de
                Amazon y se rigen por su política de cookies y privacidad, no por la de este sitio.
              </p>
              <p>
                Si en el futuro incorporamos cookies de terceros con fines publicitarios o de
                perfilado, actualizaremos esta página y solicitaremos el consentimiento previo.
              </p>
            </section>

            <section id="propiedad" className="scroll-mt-28">
              <h2>5. Propiedad intelectual</h2>
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
              <h2>6. Responsabilidad</h2>
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
              <h2>7. Ley aplicable</h2>
              <p>
                Estas condiciones se rigen por la legislación española. Cualquier controversia
                derivada del uso del sitio se someterá a los juzgados y tribunales competentes que
                correspondan conforme a la normativa aplicable en materia de consumidores.
              </p>
              <p>
                Para cualquier duda sobre este aviso legal puedes escribir a{" "}
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a> o usar la{" "}
                <Link to="/contacto">página de contacto</Link>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}
