/**
 * articles.js — índice editorial del sitio.
 *
 * Un solo array con dos tipos de entrada:
 *  - Guías ya publicadas (tienen `path` a su propia página).
 *  - Artículos nuevos (tienen `slug` y se renderizan en /articulos/:slug).
 *
 * El archivo es JS puro (sin JSX) para que lo lean tanto la web como el
 * generador del sitemap en Node.
 *
 * Bloques disponibles en `sections`:
 *  - h2, p, list, steps, table, proscons, callout, specs, products
 * En `p`, `list`, `table` y `callout` se admite **negrita** y [enlace](/ruta).
 */

export const ARTICLES = [
  // ------------------------------------------------------------------
  // Guías ya publicadas
  // ------------------------------------------------------------------
  {
    id: "guia-2026",
    path: "/guia-2026",
    title: "Guía de compra de patinetes eléctricos 2026",
    description:
      "Cómo elegir un patinete eléctrico en 2026: autonomía real, potencia, frenos, peso y las mejores opciones por franja de precio.",
    category: "Guía de compra",
    updated: "13 de noviembre de 2026",
    date: "2026-11-13",
    readingTime: "12 min",
    tone: "from-[#0d6b57] to-[#084d3f]",
    icon: "book",
    highlights: ["Metodología de 6 criterios", "Mejor opción por presupuesto", "Según tu trayecto"],
  },
  {
    id: "normativa",
    path: "/normativa-patinete-electrico",
    title: "Normativa del patinete eléctrico en España",
    description:
      "Casco obligatorio, edad mínima de 15 años, seguro de responsabilidad civil, registro y por dónde puedes circular en 2026.",
    category: "Normativa",
    updated: "12 de noviembre de 2026",
    date: "2026-11-12",
    readingTime: "8 min",
    tone: "from-[#3b4640] to-[#101614]",
    icon: "shield",
    highlights: ["Casco y 15 años", "Seguro obligatorio", "Multas y circulación"],
  },
  {
    id: "autonomia",
    path: "/autonomia-patinete-electrico",
    title: "Autonomía real: cuánta necesitas de verdad",
    description:
      "Calculadora de autonomía real según peso, batería y modo de conducción, y qué cifra declarada buscar para tu trayecto diario.",
    category: "Autonomía",
    updated: "13 de noviembre de 2026",
    date: "2026-11-13",
    readingTime: "10 min",
    tone: "from-[#9dbb2f] to-[#55613f]",
    icon: "battery",
    highlights: ["Calculadora interactiva", "Tabla por trayecto", "Datos del catálogo"],
  },
  {
    id: "menos-500",
    path: "/mejores-patinetes-menos-500-euros",
    title: "Mejores patinetes eléctricos por menos de 500 €",
    description:
      "Ranking por nota editorial de los mejores patinetes por debajo de 500 €, con comparativa de autonomía, potencia, peso y precio.",
    category: "Presupuesto",
    updated: "13 de noviembre de 2026",
    date: "2026-11-13",
    readingTime: "9 min",
    tone: "from-[#c99a3d] to-[#a4701c]",
    icon: "wallet",
    highlights: ["Ranking por nota", "Comparativa lado a lado", "Qué evitar"],
  },

  // ------------------------------------------------------------------
  // Artículos long-tail
  // ------------------------------------------------------------------
  {
    id: "xiaomi-6-max-vs-segway-max-g3-e",
    slug: "xiaomi-6-max-vs-segway-max-g3-e",
    path: "/articulos/xiaomi-6-max-vs-segway-max-g3-e",
    title: "Xiaomi 6 Max vs Segway MAX G3 E",
    h1: "Xiaomi 6 Max vs Segway MAX G3 E: cuál comprar en 2026",
    description:
      "Cara a cara entre el Xiaomi 6 Max y el Segway MAX G3 E: autonomía, velocidad, peso, potencia y precio para saber cuál te conviene.",
    category: "Comparativa",
    updated: "15 de noviembre de 2026",
    date: "2026-11-15",
    readingTime: "6 min",
    tone: "from-[#0d6b57] to-[#084d3f]",
    icon: "scale",
    highlights: ["80 km frente a 70 km", "9 kg de diferencia", "Precio más contenido"],
    intro:
      "Son dos de los patinetes más buscados de 2026 y no juegan en la misma liga: el Xiaomi 6 Max va a por el usuario de marca, y el Segway MAX G3 E a por quien quiere la máxima autonomía por euro. Esta comparativa usa las fichas del catálogo, no los folletos.",
    takeaways: [
      "El MAX G3 E anuncia 80 km y 25 km/h; el Xiaomi 6 Max, 70 km y 20 km/h.",
      "El Segway pesa 20,7 kg frente a 29,7 kg del Xiaomi: 9 kg que se notan al plegarlo.",
      "El Xiaomi cuesta más. En esta comparativa, el Segway gana por relación calidad-precio.",
    ],
    sections: [
      { type: "h2", text: "Los datos, lado a lado" },
      {
        type: "p",
        text: "Antes de entrar en interpretaciones, la ficha técnica. Los dos son VMP de una plaza y están limitados a velocidad urbana, así que la decisión se juega en autonomía, peso y precio.",
      },
      {
        type: "specs",
        ids: ["B0GBXNCH7B", "B0F4XGBYRR"],
        rows: ["precio", "nota", "autonomia_km", "velocidad_max_kmh", "motor_w", "peso_kg", "bateria_wh", "carga_max_kg"],
      },
      { type: "h2", text: "Autonomía y velocidad: 80 km y 25 km/h frente a 70 km y 20 km/h" },
      {
        type: "p",
        text: "Sobre el papel, el MAX G3 E gana en las dos casillas que más se miran: **10 km más de autonomía anunciada** y **5 km/h más de velocidad punta**. En uso real, aplicando el 70 % del que hablamos en la [guía de autonomía](/autonomia-patinete-electrico), la diferencia se queda en unos 7 km: suficiente para un día de trabajo, no para dos.",
      },
      {
        type: "p",
        text: "La velocidad importa menos de lo que parece en ciudad: con tráfico y semáforos, la media real rara vez pasa de 15 km/h. Pero esos 25 km/h sí se agradecen en avenidas largas y en carril bici despejado.",
      },
      { type: "h2", text: "Peso: 9 kilos que cambian el uso diario" },
      {
        type: "p",
        text: "El dato que menos se mira en la tienda y más se sufre después. **20,7 kg frente a 29,7 kg** es la diferencia entre subirlo con una mano o turnarse con la otra. Si vives en un tercero sin ascensor, el Xiaomi se convierte en un mueble con ruedas.",
      },
      {
        type: "list",
        items: [
          "**MAX G3 E:** manejable para plegar y subir escaleras, con 130 kg de carga máxima.",
          "**Xiaomi 6 Max:** 29,7 kg y la misma carga máxima de 130 kg; pide ascensor o planta baja.",
        ],
      },
      { type: "h2", text: "Potencia: el dato que el Xiaomi sí publica" },
      {
        type: "p",
        text: "La ficha del Xiaomi 6 Max declara **450 W**, una cifra justa para mover 29,7 kg con soltura en llano. La del Segway no publica potencia en el catálogo, así que no la inventamos: si vives en una ciudad con cuestas, pide la ficha oficial antes de decidir y compara con nuestra [guía de potencia para subir cuestas](/articulos/patinete-electrico-para-subir-cuestas).",
      },
      { type: "h2", text: "Pros y contras de cada uno" },
      {
        type: "proscons",
        title: "Segway MAX G3 E",
        pros: [
          "80 km de autonomía anunciada y 25 km/h.",
          "20,7 kg: el más manejable de los dos.",
          "Precio de gama de entrada con nota editorial alta.",
        ],
        cons: [
          "La ficha no publica potencia ni batería en Wh.",
          "Menos ecosistema de accesorios que Xiaomi.",
        ],
      },
      {
        type: "proscons",
        title: "Xiaomi 6 Max",
        pros: [
          "Marca con red de servicio y repuestos extendida.",
          "App y firmware con historial detrás.",
          "130 kg de carga máxima.",
        ],
        cons: [
          "20 km/h de velocidad punta, por debajo del máximo legal.",
          "29,7 kg para un uso urbano diario.",
          "Cuesta bastante más que el Segway.",
        ],
      },
      {
        type: "callout",
        tone: "brand",
        title: "Veredicto",
        text: "Para la mayoría, **MAX G3 E**: más autonomía, más velocidad, 9 kg menos y un precio que deja margen para casco, seguro y candado. El Xiaomi 6 Max solo se justifica si valoras la marca, la app o el diseño por encima del precio y no tienes que cargarlo por escaleras.",
      },
      { type: "h2", text: "¿Y si ninguno encaja?" },
      {
        type: "p",
        text: "Si tu prioridad es el peso, mira modelos por debajo de 18 kg; si es la autonomía, el [ranking de menos de 500 €](/mejores-patinetes-menos-500-euros) tiene opciones con más batería por menos dinero. Y si dudas entre varios, el [comparador](/comparador) los enfrenta en la misma tabla.",
      },
      { type: "products", ids: ["B0F4XGBYRR", "B0GBXNCH7B"] },
    ],
    faq: [
      {
        question: "¿Cuál de los dos tiene más autonomía real?",
        answer:
          "El Segway MAX G3 E: anuncia 80 km frente a 70 km del Xiaomi. Aplicando el 70 % habitual en uso real, la diferencia ronda los 7 km a favor del Segway.",
      },
      {
        question: "¿Merece la pena pagar más por el Xiaomi 6 Max?",
        answer:
          "Por prestaciones, no: el Segway ofrece más autonomía, más velocidad y menos peso por bastante menos dinero. El Xiaomi se elige por marca, app o diseño, no por los números de la ficha.",
      },
      {
        question: "¿Cuál es mejor si vivo en un piso sin ascensor?",
        answer:
          "El MAX G3 E, sin duda. Sus 20,7 kg frente a los 29,7 kg del Xiaomi marcan la diferencia al plegarlo y subirlo cada día.",
      },
      {
        question: "¿Los dos son legales como VMP?",
        answer:
          "Sí, ambos están limitados a velocidad urbana y son de una plaza. Comprueba que la unidad que recibes lleva el certificado y la etiqueta de registro que exige la normativa de 2026.",
      },
    ],
    related: ["segway-e2-pro-d-vs-e3-pro-e", "mejor-patinete-electrico-para-ir-al-trabajo"],
  },

  {
    id: "segway-e2-pro-d-vs-e3-pro-e",
    slug: "segway-e2-pro-d-vs-e3-pro-e",
    path: "/articulos/segway-e2-pro-d-vs-e3-pro-e",
    title: "Segway E2 Pro D vs E3 Pro E",
    h1: "Segway E2 Pro D vs E3 Pro E: diferencias y cuál merece la pena",
    description:
      "Comparativa entre el Segway E2 Pro D y el E3 Pro E: autonomía, velocidad, motor, peso y precio para elegir el patinete de entrada correcto.",
    category: "Comparativa",
    updated: "15 de noviembre de 2026",
    date: "2026-11-15",
    readingTime: "5 min",
    tone: "from-[#4d6b2f] to-[#2c3f18]",
    icon: "scale",
    highlights: ["55 km frente a 35 km", "750 W declarados", "Salto de precio"],
    intro:
      "Dentro de la misma familia, Segway vende dos patinetes que se parecen mucho en la tienda y muy poco en la calle. El E2 Pro D es la puerta de entrada; el E3 Pro E sube de gama para ganar autonomía y velocidad. La pregunta es si ese salto se nota en el uso diario, más allá de la oferta del día.",
    takeaways: [
      "El E3 Pro E anuncia 55 km y 25 km/h; el E2 Pro D, 35 km y 20 km/h.",
      "El E2 Pro D declara 750 W y 18,8 kg; el E3 Pro E no publica esos datos en el catálogo.",
      "Para menos de 10 km al día, el E2 Pro D cubre de sobra. Para 15 km o más, el E3 Pro E.",
    ],
    sections: [
      { type: "h2", text: "Ficha contra ficha" },
      {
        type: "p",
        text: "Los dos son plegables, de una plaza y con 100 kg de carga máxima. Las diferencias reales están en la batería y en el motor.",
      },
      {
        type: "specs",
        ids: ["B0B3RTYXZS", "B0FQ341SVY"],
        rows: ["precio", "nota", "autonomia_km", "velocidad_max_kmh", "motor_w", "peso_kg", "bateria_wh", "carga_max_kg"],
      },
      { type: "h2", text: "Autonomía: 35 km frente a 55 km anunciados" },
      {
        type: "p",
        text: "El E3 Pro E anuncia 20 km más, pero en uso real esa diferencia se queda en unos **14 km** (el 70 % del anunciado). Es justo el margen que separa un patinete de «ida y vuelta al trabajo» de uno que necesita cargarse a media tarde.",
      },
      {
        type: "p",
        text: "El E2 Pro D declara **275 Wh**. Con un consumo medio de 13 Wh/km, da para unos 21 km reales en condiciones normales; suficiente para trayectos de 8–10 km con margen, justo para quien no quiere cargar todos los días.",
      },
      { type: "h2", text: "Motor y cuestas: el dato que falta" },
      {
        type: "p",
        text: "El E2 Pro D publica **750 W**, una cifra alta para su precio y peso. El E3 Pro E no declara potencia en la ficha del catálogo, así que no podemos comparar con rigor. Si tu ruta tiene pendientes, pide la ficha oficial del E3 o mira modelos con potencia publicada en la [guía para subir cuestas](/articulos/patinete-electrico-para-subir-cuestas).",
      },
      { type: "h2", text: "Peso y plegado" },
      {
        type: "p",
        text: "El E2 Pro D pesa **18,8 kg**, un peso contenido para la gama. Del E3 Pro E no hay peso publicado: otro dato que conviene confirmar antes de comprar si vas a subirlo por escaleras. En esta franja, cada kilo cuenta.",
      },
      {
        type: "callout",
        tone: "brand",
        title: "Veredicto",
        text: "Si haces **menos de 10 km al día**, el E2 Pro D cubre el trayecto y declara más potencia. Si necesitas **15 km o más** o quieres los 25 km/h, el E3 Pro E compensa el salto. Compara el precio del día en la tabla antes de decidir: en esta gama cambia con las ofertas.",
      },
      { type: "h2", text: "Para quién es cada uno" },
      {
        type: "list",
        items: [
          "**E2 Pro D:** primer patinete, trayectos cortos, presupuesto ajustado, rider de hasta 100 kg.",
          "**E3 Pro E:** commuting de 10–15 km, necesidad de 25 km/h, quien no quiere cargar a diario.",
        ],
      },
      { type: "products", ids: ["B0B3RTYXZS", "B0FQ341SVY"] },
    ],
    faq: [
      {
        question: "¿Cuánta diferencia real hay entre 35 y 55 km?",
        answer:
          "Unos 14 km aplicando el 70 % de autonomía real. Es la diferencia entre cubrir un trayecto de 10 km con margen y poder hacer 15 km sin cargar.",
      },
      {
        question: "¿El E2 Pro D sube cuestas?",
        answer:
          "Con 750 W declarados y 18,8 kg, está bien preparado para pendientes urbanas suaves. Para cuestas largas o riders pesados, conviene un motor de 1.000 W o más.",
      },
      {
        question: "¿Cuál es más ligero?",
        answer:
          "El E2 Pro D declara 18,8 kg; el E3 Pro E no publica peso en el catálogo. Si el plegado diario es prioritario, confirma el peso del E3 antes de decidir.",
      },
    ],
    related: ["xiaomi-6-max-vs-segway-max-g3-e", "patinete-electrico-menos-300-euros"],
  },

  {
    id: "patinete-electrico-para-subir-cuestas",
    slug: "patinete-electrico-para-subir-cuestas",
    path: "/articulos/patinete-electrico-para-subir-cuestas",
    title: "Patinete para subir cuestas: cuántos vatios",
    h1: "Qué potencia necesita un patinete eléctrico para subir cuestas",
    description:
      "Cuántos vatios necesitas para subir cuestas en patinete según tu peso y la pendiente, y qué modelos del catálogo cumplen.",
    category: "Guía de compra",
    updated: "15 de noviembre de 2026",
    date: "2026-11-15",
    readingTime: "7 min",
    tone: "from-[#55613f] to-[#2f3a22]",
    icon: "mountain",
    highlights: ["Tabla por peso y pendiente", "Nominal frente a pico", "Modelos del catálogo"],
    intro:
      "«¿Este patinete sube cuestas?» es la pregunta que más se repite en las fichas y la que peor se responde con un número de vatios. La potencia ayuda, pero no lo explica todo. Aquí tienes la cuenta y los modelos del catálogo que mejor responden.",
    takeaways: [
      "Para cuestas suaves basta con 350–500 W; para pendientes fuertes, 1.000 W o más.",
      "El peso del rider y del patinete importa tanto como la potencia.",
      "Un motor de pico alto no sirve si los frenos y la batería no acompañan.",
    ],
    sections: [
      { type: "h2", text: "Potencia nominal y potencia de pico: no son lo mismo" },
      {
        type: "p",
        text: "Los fabricantes mezclan dos cifras. La **potencia nominal** es la que el motor aguanta de forma continua; la **de pico**, la que entrega durante unos segundos al arrancar o encarar una rampa. Un patinete de 500 W nominales puede anunciar 800 W de pico y no está mintiendo: son medidas distintas.",
      },
      {
        type: "p",
        text: "Para comparar modelos, usa siempre la nominal. Si la ficha solo publica el pico, tómalo con cautela y prioriza marcas que detallan ambas.",
      },
      { type: "h2", text: "Cuántos vatios necesitas según tu peso y la pendiente" },
      {
        type: "p",
        text: "Esta tabla es orientativa: asume un patinete de 15–25 kg, neumáticos a presión y modo sport. Una pendiente del 10 % es una calle empinada de ciudad; por encima del 15 %, ya hablamos de rampas de garaje o carreteras de montaña.",
      },
      {
        type: "table",
        head: ["Peso del rider", "Pendiente suave (<5 %)", "Pendiente media (5–10 %)", "Pendiente fuerte (>10 %)"],
        rows: [
          ["Hasta 70 kg", "250–350 W", "500 W", "1.000 W"],
          ["70–90 kg", "350–500 W", "750 W", "1.500 W"],
          ["Más de 90 kg", "500 W", "1.000 W", "2.000 W"],
        ],
        note: "Cifras orientativas de potencia nominal. El estado de la batería y la temperatura también afectan.",
      },
      { type: "h2", text: "Modelos del catálogo con más motor" },
      {
        type: "p",
        text: "Ordenados por potencia declarada. Ojo: un motor grande no compensa un peso alto si la cuesta es larga; mira también los kilos y la batería.",
      },
      {
        type: "specs",
        ids: ["B0FJXLF929", "B0DN1D8K4B", "B0DM6BYS2N", "B0CG1TDVB3", "B0B8HDQP52", "B0B3RTYXZS"],
        rows: ["precio", "nota", "motor_w", "peso_kg", "autonomia_km", "bateria_wh"],
      },
      { type: "h2", text: "Lo que no te cuenta el número de vatios" },
      {
        type: "list",
        items: [
          "**Peso total:** 90 kg de rider más 30 kg de patinete son 120 kg que el motor debe mover. Cada kilo cuenta en la rampa.",
          "**Diámetro de rueda:** una rueda de 10″ tracciona mejor y absorbe más que una de 8,5″ en asfalto irregular.",
          "**Batería:** un motor grande con poca batería se queda sin energía justo cuando más lo necesitas.",
          "**Frenos:** subir es la mitad; bajar con freno de tambor y 30 kg de patinete es la otra mitad.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Cuidado con el modo sport",
        text: "El modo más potente consume hasta un 30 % más. Si tu ruta tiene cuestas y quieres conservar autonomía, alterna: sport para la rampa, normal para el llano.",
      },
      { type: "h2", text: "Cómo probarlo antes de comprar" },
      {
        type: "steps",
        items: [
          "Busca una cuesta real de tu ruta y mide su pendiente aproximada con el móvil.",
          "Comprueba el peso del patinete y el tuyo: suma ambos.",
          "Coteja la potencia nominal con la tabla de arriba.",
          "Lee opiniones de compradores que pesen como tú; es el dato que ninguna ficha da.",
        ],
      },
      { type: "products", ids: ["B0DM6BYS2N", "B0DN1D8K4B", "B0FJXLF929"] },
    ],
    faq: [
      {
        question: "¿Cuántos vatios necesita un patinete para subir una cuesta del 10 %?",
        answer:
          "Con un rider de 70–90 kg, unos 750 W nominales. Por encima de 90 kg o con pendientes más largas, mejor 1.000 W o más.",
      },
      {
        question: "¿Un patinete de 250 W sube cuestas?",
        answer:
          "Pendientes suaves y riders ligeros, sí. En cuanto la rampa pasa del 5 % o el peso sube, el motor se queda corto y la velocidad cae en picado.",
      },
      {
        question: "¿La potencia afecta a la autonomía?",
        answer:
          "Sí. Un motor más potente consume más si lo usas a fondo. La autonomía depende sobre todo de la batería (Wh) y del modo de conducción.",
      },
      {
        question: "¿Es legal un patinete de 2.000 W?",
        answer:
          "La normativa limita la velocidad a 25 km/h, no la potencia. Un patinete de 2.000 W puede ser legal si está limitado y certificado como VMP; si supera los 25 km/h, deja de serlo.",
      },
    ],
    related: ["mejor-patinete-electrico-para-ir-al-trabajo", "patinete-electrico-para-100-kg"],
  },

  {
    id: "mejor-patinete-electrico-para-ir-al-trabajo",
    slug: "mejor-patinete-electrico-para-ir-al-trabajo",
    path: "/articulos/mejor-patinete-electrico-para-ir-al-trabajo",
    title: "Mejor patinete para ir al trabajo",
    h1: "Mejor patinete eléctrico para ir al trabajo en 2026",
    description:
      "Qué debe cumplir un patinete para el commuting diario: peso, autonomía, luces y frenos. Con los modelos del catálogo que mejor encajan.",
    category: "Guía de compra",
    updated: "15 de noviembre de 2026",
    date: "2026-11-15",
    readingTime: "6 min",
    tone: "from-[#3b4640] to-[#101614]",
    icon: "briefcase",
    highlights: ["Menos de 22 kg", "25 km de autonomía", "Luces y frenos de disco"],
    intro:
      "Ir al trabajo en patinete tiene tres enemigos: el peso al plegarlo, la autonomía justa y la falta de luces. Un modelo de 1.500 € puede ser peor commuting que uno de 400 € si no encaja con tu trayecto. Estas son las prioridades, en orden.",
    takeaways: [
      "Por debajo de 22 kg el patinete se vuelve manejable a diario.",
      "Para 10 km de ida y vuelta, busca 25 km de autonomía anunciada o más.",
      "Luces, frenos de disco y guardabarros no son extras: son requisitos de uso diario.",
    ],
    sections: [
      { type: "h2", text: "Los cinco requisitos de un patinete de commuting" },
      {
        type: "table",
        head: ["Requisito", "Mínimo recomendable", "Por qué"],
        rows: [
          ["Peso", "≤ 22 kg", "Plegarlo y subirlo a diario sin abandonar"],
          ["Autonomía anunciada", "≥ 25 km", "Cubre 10 km reales con margen y frío"],
          ["Frenos", "Disco delantero", "Frenar en mojado con 20 kg de patinete"],
          ["Luces", "Delantera y trasera", "Requisito legal y seguridad real"],
          ["Plegado", "Una sola mano", "Metro, ascensor, oficina"],
        ],
      },
      { type: "h2", text: "Los modelos del catálogo que mejor encajan" },
      {
        type: "p",
        text: "Selección por equilibrio entre peso, autonomía y precio. No es un ranking de potencia: es una lista de patinetes que no dan pereza.",
      },
      {
        type: "specs",
        ids: ["B0F4XGBYRR", "B0FN89KKZT", "B0FQ341SVY", "B0DGY45BG4", "B0B3RTYXZS"],
        rows: ["precio", "nota", "peso_kg", "autonomia_km", "velocidad_max_kmh", "bateria_wh", "carga_max_kg"],
      },
      { type: "h2", text: "Autonomía: cuánta necesitas para tu trayecto" },
      {
        type: "p",
        text: "La cuenta rápida: **ida y vuelta × 1,4**. Si son 6 km por trayecto, necesitas unos 17 km reales, es decir, 25 km anunciados. Si no puedes cargar en la oficina, añade un 20 % de margen. Lo desarrollamos en la [guía de autonomía real](/autonomia-patinete-electrico).",
      },
      { type: "h2", text: "Lo que conviene evitar" },
      {
        type: "list",
        items: [
          "Patinetes de más de 25 kg si tienes que subir escaleras.",
          "Modelos sin luces integradas: acabarás comprando una luz suelta que se olvida.",
          "Autonomías anunciadas por debajo de 20 km: en invierno se quedan en la mitad.",
          "Ruedas de 8″ para calles con baches; mejor 10″ o suspensión.",
        ],
      },
      {
        type: "callout",
        tone: "brand",
        title: "El factor que nadie mide",
        text: "La pereza. Un patinete que pesa 25 kg y tarda 40 segundos en plegarse se queda en casa a la tercera semana. Prioriza el plegado y el peso por encima de la velocidad punta.",
      },
      { type: "h2", text: "Antes de comprar, comprueba esto" },
      {
        type: "steps",
        items: [
          "Mide tu trayecto real y multiplícalo por 1,4.",
          "Comprueba si tu oficina tiene ascensor y si el patinete cabe plegado.",
          "Revisa las normas de tu operador de transporte si vas a combinarlo con metro o cercanías.",
          "Suma casco, seguro y candado al presupuesto: la normativa de 2026 los hace necesarios.",
        ],
      },
      { type: "products", ids: ["B0F4XGBYRR", "B0FN89KKZT", "B0FQ341SVY"] },
    ],
    faq: [
      {
        question: "¿Cuánta autonomía necesito para 10 km de ida y vuelta?",
        answer:
          "Con 25 km anunciados vas sobrado: equivalen a unos 17 km reales, que cubren los 10 km con margen para el frío y las cuestas.",
      },
      {
        question: "¿Puedo meter el patinete en el metro?",
        answer:
          "Depende del operador y de la ciudad. Muchos permiten patinetes plegados fuera de hora punta; consúltalo antes de comprar si el commuting combina bici y transporte público.",
      },
      {
        question: "¿Es mejor uno ligero o uno con más batería?",
        answer:
          "Si lo subes a diario, ligero. Si lo dejas en el garaje y haces trayectos largos, batería. El peso se sufre todos los días; la autonomía, solo cuando se queda corta.",
      },
      {
        question: "¿Necesito casco y seguro para ir al trabajo?",
        answer:
          "Sí. Desde octubre de 2026 el casco es obligatorio y la Ley 5/2025 exige seguro de responsabilidad civil. Lo explicamos en la guía de normativa.",
      },
    ],
    related: ["patinete-electrico-para-subir-cuestas", "xiaomi-6-max-vs-segway-max-g3-e"],
  },

  {
    id: "patinete-electrico-para-100-kg",
    slug: "patinete-electrico-para-100-kg",
    path: "/articulos/patinete-electrico-para-100-kg",
    title: "Patinetes para más de 100 kg",
    h1: "Mejores patinetes eléctricos para personas de más de 100 kg",
    description:
      "Qué mirar en un patinete si pesas más de 100 kg: carga máxima real, motor, frenos y modelos del catálogo que aguantan.",
    category: "Guía de compra",
    updated: "15 de noviembre de 2026",
    date: "2026-11-15",
    readingTime: "6 min",
    tone: "from-[#7d9626] to-[#4c5c17]",
    icon: "users",
    highlights: ["120 kg o más", "Motor y frenos", "Autonomía penalizada"],
    intro:
      "Casi todos los patinetes anuncian 100 kg de carga máxima. Si pesas 105, ese margen desaparece. La buena noticia es que el catálogo tiene modelos con 120, 130 y hasta 200 kg de capacidad; la mala, que el peso extra también afecta a autonomía, frenos y suspensiones.",
    takeaways: [
      "Busca al menos 120 kg de carga máxima si pesas más de 100 kg.",
      "El motor y los frenos sufren más que el chasis con sobrepeso.",
      "La autonomía real cae entre un 15 % y un 25 % con riders pesados.",
    ],
    sections: [
      { type: "h2", text: "Carga máxima no es lo mismo que «peso recomendado»" },
      {
        type: "p",
        text: "La **carga máxima** es el peso total que el fabricante garantiza que soporta el patinete, rider incluido. No es una recomendación: es un límite estructural. Circular por encima acorta la vida del chasis, de la dirección y de la batería, y puede invalidar la garantía.",
      },
      {
        type: "p",
        text: "Si pesas 100 kg, no compres uno de 100 kg: busca **120 kg o más** para tener margen con mochila, ropa de invierno y baches.",
      },
      { type: "h2", text: "Modelos con más capacidad de carga" },
      {
        type: "p",
        text: "Ordenados por carga máxima declarada. Comprueba siempre la ficha del modelo concreto: la capacidad puede cambiar entre versiones.",
      },
      {
        type: "specs",
        ids: ["B0BF553WQB", "B0DN1D8K4B", "B0F4XGBYRR", "B0GBXNCH7B", "B0F1CZ831G", "B0DGY45BG4"],
        rows: ["precio", "nota", "carga_max_kg", "motor_w", "peso_kg", "autonomia_km"],
      },
      { type: "h2", text: "Por qué el motor importa más si pesas" },
      {
        type: "p",
        text: "Mover 100 kg con un motor de 350 W es posible en llano y sufrido en cuesta. Como referencia, un rider de más de 90 kg debería mirar **1.000 W nominales** si su ruta tiene pendientes. La [guía de potencia para cuestas](/articulos/patinete-electrico-para-subir-cuestas) tiene la tabla completa.",
      },
      { type: "h2", text: "Frenos y suspensiones: donde se nota el peso" },
      {
        type: "list",
        items: [
          "**Freno:** con más masa, un freno de tambor se queda corto. Busca disco, mejor en las dos ruedas.",
          "**Suspensión:** no es un lujo; con 100 kg, absorbe impactos que de otro modo llegan al chasis.",
          "**Ruedas:** 10″ o más para repartir la carga y traccionar mejor.",
          "**Presión de neumáticos:** revísala cada semana; con sobrepeso, una rueda blanda se destruye antes.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "La autonomía no se libra",
        text: "Un rider de 100 kg consume entre un 15 % y un 25 % más que uno de 75 kg. Si la ficha anuncia 70 km, cuenta con 40–45 km reales, no con 49.",
      },
      { type: "products", ids: ["B0BF553WQB", "B0DN1D8K4B", "B0F4XGBYRR"] },
    ],
    faq: [
      {
        question: "¿Puedo usar un patinete de 100 kg si peso 105?",
        answer:
          "No es recomendable. Estarás por encima del límite estructural, la garantía puede no cubrirte y el chasis sufrirá. Busca uno de 120 kg o más.",
      },
      {
        question: "¿Cuánta autonomía pierdo si peso 100 kg?",
        answer:
          "Entre un 15 % y un 25 % respecto al dato de laboratorio, que se mide con unos 75 kg. Aplícale además el 70 % habitual de uso real.",
      },
      {
        question: "¿Un patinete de 200 kg de carga es más seguro?",
        answer:
          "No necesariamente más seguro, pero sí más robusto. Un chasis sobredimensionado para 200 kg trabajará más holgado con 100 kg, aunque pesará más y será menos ágil.",
      },
    ],
    related: ["patinete-electrico-para-subir-cuestas", "mejor-patinete-electrico-para-ir-al-trabajo"],
  },

  {
    id: "patinete-electrico-menos-300-euros",
    slug: "patinete-electrico-menos-300-euros",
    path: "/articulos/patinete-electrico-menos-300-euros",
    title: "¿Un patinete decente por menos de 300 €?",
    h1: "Patinete eléctrico por menos de 300 €: qué se puede esperar",
    description:
      "Qué patinetes se pueden comprar por menos de 300 €, qué limitaciones tienen y qué comprobar antes de pagar para no tirar el dinero.",
    category: "Presupuesto",
    updated: "15 de noviembre de 2026",
    date: "2026-11-15",
    readingTime: "5 min",
    tone: "from-[#c99a3d] to-[#a4701c]",
    icon: "wallet",
    highlights: ["30 km anunciados", "Sin suspensión", "Certificado obligatorio"],
    intro:
      "Por debajo de 300 € se puede comprar un patinete eléctrico que funcione para trayectos cortos. Lo que no se puede es exigirle lo mismo que a uno de 800 €. Esta guía separa lo que es una limitación asumible de lo que es un problema.",
    takeaways: [
      "Por menos de 300 € se encuentran VMP de 30 km anunciados y 15-19 kg.",
      "Lo que falta casi siempre: suspensión, frenos hidráulicos y autonomía real.",
      "Antes de pagar, comprueba certificado, luces y disponibilidad de repuestos.",
    ],
    sections: [
      { type: "h2", text: "Qué hay en el catálogo por debajo de 300 €" },
      {
        type: "p",
        text: "Modelos reales, no promesas. En el catálogo hay dos opciones claras por debajo de 300 €; el resto de la gama de entrada se acerca a los 400–600 €. Fíjate en autonomía, peso y potencia: son los tres datos que marcan la experiencia.",
      },
      {
        type: "specs",
        ids: ["B0DCBRJW4P", "B0CQ82X5BF"],
        rows: ["precio", "nota", "autonomia_km", "velocidad_max_kmh", "motor_w", "peso_kg", "bateria_wh"],
        note: "Precio orientativo del catálogo; puede variar. Confirma el importe en la ficha antes de comprar.",
      },
      { type: "h2", text: "Lo que no vas a encontrar (y está bien)" },
      {
        type: "list",
        items: [
          "**Autonomía real de 30 km:** lo anunciado se queda en 20–25 km reales en condiciones normales.",
          "**Suspensión de calidad:** a este precio, o no hay o es un muelle testimonial.",
          "**Frenos hidráulicos:** casi todos montan disco mecánico o tambor. Suficiente en seco, justo en mojado.",
          "**Servicio técnico rápido:** comprueba que la marca tenga repuestos y garantía real en España.",
        ],
      },
      { type: "h2", text: "Las tres comprobaciones antes de pagar" },
      {
        type: "steps",
        items: [
          "**Certificado VMP:** sin él, el patinete no podrá circular a partir del 1 de enero de 2027.",
          "**Luces y timbre:** son obligatorios; si no vienen, no es un VMP homologable.",
          "**Repuestos:** neumáticos, cámaras y frenos. Si no se encuentran, el patinete dura lo que dure la primera rueda.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "El precio no exime de la norma",
        text: "Un patinete de 200 € sigue necesitando casco, seguro y registro. Si el presupuesto es justo, cuenta esos costes antes de elegir modelo. Lo detallamos en la [guía de normativa 2026](/normativa-patinete-electrico).",
      },
      { type: "h2", text: "¿Mejor 300 € ahora o 500 € después?" },
      {
        type: "p",
        text: "Si haces menos de 8 km al día y el terreno es llano, 300 € bien elegidos son suficientes. Si haces 15 km, pesas más de 90 kg o hay cuestas, el salto a la franja de 400–500 € compensa en batería, frenos y suspensiones. Tienes la lista en [mejores patinetes por menos de 500 €](/mejores-patinetes-menos-500-euros).",
      },
      { type: "products", ids: ["B0DCBRJW4P", "B0CQ82X5BF"] },
    ],
    faq: [
      {
        question: "¿Un patinete de menos de 300 € es legal?",
        answer:
          "Solo si está certificado como VMP, limitado a 25 km/h y cuenta con luces, frenos y timbre. El precio no cambia los requisitos legales.",
      },
      {
        question: "¿Cuánto dura la batería de un patinete barato?",
        answer:
          "Entre 300 y 500 ciclos completos antes de perder un 20 % de capacidad. Cargar entre el 20 % y el 80 % y evitar el calor alarga su vida.",
      },
      {
        question: "¿Puedo subir cuestas con uno de 300 €?",
        answer:
          "Pendientes suaves, sí. Rampas largas o riders pesados, no: el motor se queda corto y la velocidad cae. Mira la guía de potencia si tu ruta tiene desnivel.",
      },
    ],
    related: ["segway-e2-pro-d-vs-e3-pro-e", "patinete-electrico-para-100-kg"],
  },
];

/** Artículos con página propia en /articulos/:slug. */
export const FULL_ARTICLES = ARTICLES.filter((article) => article.slug);

export function getArticle(slug) {
  return ARTICLES.find((article) => article.slug === slug) || null;
}

export function getRelated(article) {
  return (article.related || [])
    .map((slug) => getArticle(slug))
    .filter(Boolean)
    .slice(0, 2);
}

export function articlePath(article) {
  return article.path;
}

export default ARTICLES;
