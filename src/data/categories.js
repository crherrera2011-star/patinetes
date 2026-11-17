import { specValue } from "../lib/normalize-product";

/**
 * Cada categoría tiene dos caras:
 *  - `href`: el catálogo filtrado (útil para seguir afinando).
 *  - `slug`: una landing propia e indexable en /categorias/:slug, con texto
 *    único, guía y FAQ. Los filtros por query param no rankean por sí solos.
 */
export const CATEGORIES = [
  {
    id: "commuter",
    slug: "patinetes-para-ir-al-trabajo",
    title: "Para ir a trabajar",
    h1: "Patinetes eléctricos para ir al trabajo",
    short: "Autonomía y plegado rápido",
    description:
      "Patinetes con autonomía suficiente para ida y vuelta, plegado en segundos y un peso que puedas subir en ascensor o metro. La prioridad aquí es la constancia, no la velocidad punta.",
    metaTitle: "Patinetes eléctricos para ir al trabajo (2026)",
    metaDescription:
      "Selección de patinetes para el día a día: autonomía real para ida y vuelta, plegado rápido y un peso manejable en ascensor, metro o bus.",
    href: "/patinetes?uso=commuter",
    icon: "briefcase",
    filter: (product) => product.scores.portability >= 60 && product.scores.autonomy >= 55,
    guide: [
      {
        title: "Autonomía para ida y vuelta",
        text: "La autonomía anunciada se mide en condiciones ideales. Para el día a día, calcula la distancia de ida y vuelta y añade un 30-40 % de margen: frío, cuestas, peso y paradas juegan en contra.",
      },
      {
        title: "Plegado que uses de verdad",
        text: "Un patinete que se pliega en tres segundos se usa; uno que exige dos manos y forcejeo se queda en casa. Prueba el mecanismo y comprueba que no tenga holgura cuando esté abierto.",
      },
      {
        title: "Frenos, luces e intermitentes",
        text: "En ciudad la prioridad es ver y ser visto. Busca freno eléctrico más freno de disco, luces delanteras y traseras conectadas a la batería y, si puedes, intermitentes.",
      },
    ],
    faq: [
      {
        question: "¿Cuánta autonomía necesito para ir al trabajo?",
        answer:
          "Suma la distancia de ida y vuelta y añade un 30-40 % de margen. Si son 10 km al día, busca al menos 15-20 km de autonomía real; con frío o cuestas, algo más. Los fabricantes suelen anunciar cifras en condiciones ideales.",
      },
      {
        question: "¿Puedo subir el patinete al metro o al bus?",
        answer:
          "Depende del operador y de la ciudad. Muchos permiten patinetes plegados si no molestan, pero algunos los restringen en hora punta. Comprueba la normativa de tu transporte antes de comprar y prioriza un peso que puedas llevar.",
      },
      {
        question: "¿Qué peso es razonable para el día a día?",
        answer:
          "Por debajo de 16 kg se lleva bien en ascensor y tramos cortos; a partir de 18-20 kg empieza a notarse en escaleras. Si tienes que subirlo a un piso sin ascensor, busca modelos por debajo de 14 kg.",
      },
      {
        question: "¿Se puede circular por la acera?",
        answer:
          "La normativa de vehículos de movilidad personal no permite circular por aceras. Revisa la ordenanza de tu ciudad y usa carril bici o calzada según corresponda. En la guía de normativa tienes los límites básicos.",
      },
    ],
    related: ["mejor-patinete-electrico-para-ir-al-trabajo", "segway-e2-pro-d-vs-e3-pro-e"],
  },
  {
    id: "ligeros",
    slug: "patinetes-ligeros-y-plegables",
    title: "Ligeros y plegables",
    h1: "Patinetes eléctricos ligeros y plegables",
    short: "Hasta 16 kg",
    description:
      "Modelos de hasta 16 kg que se pliegan y se llevan sin depender del ascensor. Perfectos si combinas patinete con transporte público o si vives en un piso alto.",
    metaTitle: "Patinetes eléctricos ligeros y plegables (2026)",
    metaDescription:
      "Modelos de hasta 16 kg para combinar con transporte público o subir sin ascensor. Qué se sacrifica en autonomía, ruedas y confort.",
    href: "/patinetes?ligero=1",
    icon: "feather",
    filter: (product) => {
      const weight = specValue(product, "peso_kg");
      return typeof weight === "number" && weight > 0 && weight <= 16;
    },
    guide: [
      {
        title: "Peso real, no anunciado",
        text: "El peso de catálogo suele excluir candado, guardabarros o soporte. Si vives en un piso, prueba a levantar el modelo o compara con algo que ya cargues a diario: 2 kg de diferencia se notan a la tercera planta.",
      },
      {
        title: "El plegado importa más que el peso",
        text: "Un mecanismo de una sola mano, con bloqueo firme y sin holgura, vale más que 500 g menos. En transporte público lo vas a plegar y desplegar varias veces al día.",
      },
      {
        title: "Ruedas pequeñas y firme irregular",
        text: "Las ruedas de 8 pulgadas son manejables y ligeras, pero sufren con baches y adoquines. Si tu ruta no está bien asfaltada, prioriza 10 pulgadas o neumático más ancho.",
      },
    ],
    faq: [
      {
        question: "¿Cuánto pesa un patinete eléctrico ligero?",
        answer:
          "En este catálogo consideramos ligeros los modelos de hasta 16 kg. Por debajo de 12 kg son excepcionales y suelen limitar batería y autonomía. A partir de 18 kg cuesta subirlos por escaleras.",
      },
      {
        question: "¿Se puede llevar en el metro o el autobús?",
        answer:
          "Normalmente sí, plegado y siempre que no moleste. Cada operador tiene sus reglas y algunas ciudades los limitan en hora punta. Consulta la normativa de tu transporte y evita los modelos que no se quedan bloqueados al plegarse.",
      },
      {
        question: "¿Merece la pena sacrificar autonomía?",
        answer:
          "Si tus trayectos son de menos de 8-10 km al día, sí. La batería pequeña también reduce el peso y el tiempo de carga. Si haces trayectos largos o no puedes cargar a diario, un modelo algo más pesado compensa.",
      },
      {
        question: "¿Ruedas de 8 o de 10 pulgadas?",
        answer:
          "Las de 10 pulgadas absorben mejor baches y bordillos, y suelen dar más estabilidad. Las de 8 son más ligeras y compactas, pero exigen más atención al firme. Para ciudad con asfalto irregular, 10 pulgadas es la opción sensata.",
      },
    ],
    related: ["segway-e2-pro-d-vs-e3-pro-e", "patinete-electrico-para-100-kg"],
  },
  {
    id: "entrada",
    slug: "patinetes-hasta-400-euros",
    title: "Hasta 400 €",
    h1: "Patinetes eléctricos por menos de 400 euros",
    short: "La puerta de entrada",
    description:
      "Opciones que cubren lo esencial —motor suficiente, frenos decentes y autonomía para trayectos cortos— sin pagar por extras que no vas a usar.",
    metaTitle: "Patinetes eléctricos por menos de 400 euros (2026)",
    metaDescription:
      "Qué puedes esperar por menos de 400 €: motor suficiente para ciudad, autonomía corta y en qué puntos no conviene recortar.",
    href: "/patinetes?gama=entrada",
    icon: "wallet",
    filter: (product) => product.price > 0 && product.price < 400,
    guide: [
      {
        title: "Qué se puede esperar",
        text: "En esta franja es razonable encontrar motores de 250-350 W, baterías de 7-10 Ah, 15-25 km de autonomía real y un peso de 14-17 kg. Lo esencial para trayectos urbanos cortos, sin extras.",
      },
      {
        title: "Dónde no conviene recortar",
        text: "Frenos, luces y repuestos. Un patinete barato con freno flojo o sin luces sale caro. Comprueba que haya baterías y neumáticos de repuesto y que el vendedor responda.",
      },
      {
        title: "Cuidado con las marcas sin servicio",
        text: "La batería y la controladora son las piezas que más fallan. Antes de comprar, busca si el fabricante tiene servicio en España o si al menos vende recambios. Un modelo barato sin repuestos es un producto de usar y tirar.",
      },
    ],
    faq: [
      {
        question: "¿Merece la pena un patinete de menos de 400 €?",
        answer:
          "Para trayectos urbanos cortos y uso ocasional, sí. Cubre lo esencial si eliges un modelo con frenos decentes y repuestos disponibles. Para uso diario intensivo o trayectos largos, la gama media compensa.",
      },
      {
        question: "¿Qué sacrifico frente a uno de 600 €?",
        answer:
          "Sobre todo suspensión, tamaño de batería, acabados y calidad de rodamientos. También suele haber menos potencia y menos opciones de conectividad. La diferencia se nota en confort y en cuántos años aguanta el uso diario.",
      },
      {
        question: "¿Son seguros los patinetes baratos?",
        answer:
          "Pueden serlo si tienen freno eléctrico y de disco, luces y un chasis sin holguras. El riesgo está en modelos sin control de calidad ni repuestos. No escatimes en casco y revisa tornillos y frenos al principio.",
      },
      {
        question: "¿Puedo empezar con uno barato y cambiarlo luego?",
        answer:
          "Sí, pero ten en cuenta que la batería es lo que más envejece y lo que más cuesta reponer. Si crees que vas a usar el patinete a diario, puede salir más caro comprar dos veces que ir directamente a la franja de 400-800 €.",
      },
    ],
    related: ["patinete-electrico-menos-300-euros", "mejor-patinete-electrico-para-ir-al-trabajo"],
  },
  {
    id: "media",
    slug: "patinetes-entre-400-y-800-euros",
    title: "400 € – 800 €",
    h1: "Patinetes eléctricos entre 400 y 800 euros",
    short: "El punto de equilibrio",
    description:
      "La franja donde aparecen mejores suspensiones, baterías más grandes y acabados que aguantan el uso diario. Aquí suele estar la compra más sensata.",
    metaTitle: "Patinetes eléctricos entre 400 y 800 euros (2026)",
    metaDescription:
      "La franja con mejor equilibrio entre precio, autonomía y componentes. Qué ganas frente a la gama de entrada y cuándo no hace falta subir más.",
    href: "/patinetes?gama=media",
    icon: "scale",
    filter: (product) => product.price >= 400 && product.price < 800,
    guide: [
      {
        title: "El punto de equilibrio",
        text: "Aquí suelen convivir motores de 350-500 W, baterías de 10-15 Ah, ruedas de 10 pulgadas y suspensión. Es la franja donde el desembolso extra se traduce en confort y durabilidad, no solo en potencia.",
      },
      {
        title: "Suspensión: delantera, trasera o ambas",
        text: "La trasera ayuda con baches y adoquines; la delantera, con bordillos y firme roto. Con una sola, prioriza la trasera si tu ruta tiene asfalto parcheado. Con ambas, el peso sube.",
      },
      {
        title: "Batería y autonomía real",
        text: "Desconfía de autonomías anunciadas de 60 km con baterías de 10 Ah. Para uso diario, busca 30-40 km homologados y calcula un 60-70 % real. La capacidad en Ah y el voltaje dicen más que la cifra de marketing.",
      },
    ],
    faq: [
      {
        question: "¿Es la franja más recomendable?",
        answer:
          "Para uso diario en ciudad, suele ser la compra más equilibrada. Añade suspensión, mejor batería y frenos más fiables sin entrar en el peso y el precio de la gama alta.",
      },
      {
        question: "¿Qué gano frente a un patinete de menos de 400 €?",
        answer:
          "Confort (suspensión y ruedas más grandes), autonomía, frenos mejores y componentes que aguantan más ciclos de carga. También suele haber mejor servicio de repuestos.",
      },
      {
        question: "¿Y frente a uno de más de 800 €?",
        answer:
          "La gama alta ofrece más potencia, batería y autonomía, pero también más peso y precio. Si tus trayectos son urbanos y no superas los 15-20 km diarios, no necesitas ese extra.",
      },
      {
        question: "¿Cuánto dura la batería de esta gama?",
        answer:
          "Depende del uso y de cómo se cargue. Con ciclos completos y sin dejarla descargada meses, una batería de calidad suele mantener una capacidad útil durante varios años. La garantía del fabricante es un buen indicador.",
      },
    ],
    related: ["xiaomi-6-max-vs-segway-max-g3-e", "mejor-patinete-electrico-para-ir-al-trabajo"],
  },
  {
    id: "premium",
    slug: "patinetes-mas-de-800-euros",
    title: "Más de 800 €",
    h1: "Patinetes eléctricos de más de 800 euros",
    short: "Máxima autonomía",
    description:
      "Patinetes con baterías grandes, motores de 500 W o más y componentes de gama alta. Pensados para trayectos largos o para quien no quiere renunciar a nada.",
    metaTitle: "Patinetes eléctricos de más de 800 euros (2026)",
    metaDescription:
      "Modelos de gama alta: más autonomía, motores de 500 W o más y componentes para trayectos largos. Cuándo compensa y cuándo no.",
    href: "/patinetes?gama=alta",
    icon: "zap",
    filter: (product) => product.price >= 800,
    guide: [
      {
        title: "Autonomía de verdad",
        text: "En esta franja es donde tiene sentido hablar de 40-60 km reales. Aun así, el anuncio suele medirse a 15 km/h y sin cuestas. Si tu trayecto es largo, mira capacidad de batería y tiempo de carga.",
      },
      {
        title: "Potencia y peso van juntos",
        text: "Motores de 500-1000 W y baterías grandes añaden kilos: 20-30 kg es habitual. Antes de comprar, piensa dónde lo vas a guardar y cuántas escaleras hay entre la calle y tu casa.",
      },
      {
        title: "Cuándo no compensa",
        text: "Si haces menos de 10 km al día, vives en un cuarto sin ascensor o no necesitas suspensiones de largo recorrido, la gama media hace el mismo trabajo con menos peso y menos gasto.",
      },
    ],
    faq: [
      {
        question: "¿Merece la pena gastar más de 800 €?",
        answer:
          "Si haces trayectos largos, pesas bastante o necesitas suspensiones y frenos de gama alta, sí. Si el uso es urbano y corto, pagas por autonomía y potencia que no vas a aprovechar.",
      },
      {
        question: "¿Son legales estos patinetes?",
        answer:
          "La velocidad máxima legal de un VMP es 25 km/h y deben cumplir la normativa de vehículos de movilidad personal. Un modelo capaz de más velocidad no es legal por ello en vía pública. Revisa la ficha y la normativa municipal.",
      },
      {
        question: "¿El mantenimiento es más caro?",
        answer:
          "Suele serlo: neumáticos más grandes, frenos hidráulicos, más peso y componentes específicos. Antes de comprar, comprueba el precio de los recambios y si hay servicio técnico en España.",
      },
      {
        question: "¿Puedo usarlo si peso más de 100 kg?",
        answer:
          "Depende del peso máximo soportado que declare el fabricante. No lo estimes por la potencia del motor. En la guía de patinetes para 100 kg tienes criterios y modelos que declaran ese límite.",
      },
    ],
    related: ["xiaomi-6-max-vs-segway-max-g3-e", "patinete-electrico-para-subir-cuestas"],
  },
  {
    id: "suspension",
    slug: "patinetes-con-suspension",
    title: "Con suspensión",
    h1: "Patinetes eléctricos con suspensión",
    short: "Para calles irregulares",
    description:
      "La suspensión no es un lujo si ruedas por adoquines o asfalto parcheado. Filtra los modelos que la incluyen y compara el tamaño de rueda.",
    metaTitle: "Patinetes eléctricos con suspensión (2026)",
    metaDescription:
      "Qué aporta la suspensión delantera y trasera, cuándo compensa y en qué fijarse si ruedas por adoquines o asfalto parcheado.",
    href: "/patinetes?suspension=1",
    icon: "waves",
    filter: (product) => Boolean(specValue(product, "suspension")),
    guide: [
      {
        title: "Delantera, trasera o ambas",
        text: "La trasera absorbe baches y adoquines; la delantera, bordillos y firme roto. Si solo hay una, la trasera suele notarse más en ciudad. Con ambas, el confort sube y el peso también.",
      },
      {
        title: "La suspensión no sustituye a una buena rueda",
        text: "Una rueda de 10 pulgadas con neumático ancho y presión correcta hace tanto o más que una suspensión básica. Si eliges ruedas pequeñas, la suspensión ayuda, pero no convierte un firme roto en una alfombra.",
      },
      {
        title: "Peso y mantenimiento",
        text: "La suspensión añade kilos y puntos de revisión: muelles, casquillos y tornillos. En modelos baratos puede perder recorrido con el tiempo. Revisa holguras y apriete con cierta periodicidad.",
      },
    ],
    faq: [
      {
        question: "¿Compensa la suspensión?",
        answer:
          "Si ruedas por adoquines, asfalto parcheado o caminos compactos, sí. En una ciudad con firme impecable y trayectos cortos, es un extra que añade peso y mantenimiento sin gran diferencia.",
      },
      {
        question: "¿Se puede añadir suspensión después?",
        answer:
          "Existen kits, pero no es lo mismo que una suspensión de fábrica: puede afectar a la geometría, la garantía y la seguridad. Si la necesitas, mejor elegir un modelo que ya la incluya.",
      },
      {
        question: "¿Más suspensión significa más comodidad?",
        answer:
          "Ayuda, pero no es el único factor. El tamaño y la anchura de la rueda, la presión del neumático y la rigidez del chasis también influyen. Una suspensión mal ajustada puede ser incómoda y perder eficacia.",
      },
      {
        question: "¿La suspensión encarece el mantenimiento?",
        answer:
          "Añade revisión de muelles, casquillos y tornillos, y en algunos modelos requiere recambios específicos. No es un coste alto, pero conviene incluirla en la revisión periódica de frenos y neumáticos.",
      },
    ],
    related: ["patinete-electrico-para-subir-cuestas", "patinete-electrico-para-100-kg"],
  },
];

export function countCategory(products, category) {
  return products.filter(category.filter).length;
}

export function getCategory(slug) {
  return CATEGORIES.find((category) => category.slug === slug) || null;
}
