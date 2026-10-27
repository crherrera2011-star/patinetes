/**
 * niche.config.mjs — configuración del nicho «patinetes eléctricos».
 *
 * Lo consumen la web (src/lib), el generador de esquema y el scraper.
 * Reglas:
 *  - Los pesos de `scores` suman 1 (100 %).
 *  - Cada criterio es una columna smallint 0-100 en Supabase.
 *  - `specs` solo contiene datos extraíbles de la ficha de Amazon.
 *    Si un dato no aparece, la UI muestra «—»; nunca se inventa.
 */

export default {
  // ---------------------------------------------------------------- identidad
  site: {
    name: "Patinetes",
    fullName: "Patinetes Eléctricos",
    tagline: "Guía independiente · 2026",
    description:
      "Comparativas independientes de patinetes eléctricos: autonomía real, potencia, frenos, peso y precio. Sin marketing.",
    url: "https://patinetes-electricos.es",
    email: "hola@patinetes-electricos.es",
    amazonTag: "netcarmoncafe-21",
    amazonDomain: "www.amazon.es",
    edition: 2026,
    locale: "es-ES",
  },

  table: "products",

  // ---------------------------------------------------------------- categoría
  category: {
    singular: "patinete eléctrico",
    plural: "patinetes eléctricos",
    slug: "patinetes",
    icon: "Zap",
    scoreNoun: "nota",
    unit: "modelos",
  },

  // ------------------------------------------------------------ precio (€)
  // `max` es exclusivo salvo en la última franja.
  priceBands: [
    { id: "entrada", label: "Hasta 400 €", min: 0, max: 400 },
    { id: "media", label: "400 € – 800 €", min: 400, max: 800 },
    { id: "alta", label: "Más de 800 €", min: 800, max: Infinity },
  ],

  // ------------------------------------------------------- notas (6 criterios)
  // weight: peso sobre la nota final. default: valor si no hay nota editorial.
  // derive: estimación transparente desde una spec (0-100). min puntúa 0 y max
  //         puntúa 100; para «menos es mejor» (peso), min > max.
  scores: [
    {
      key: "autonomy",
      label: "Autonomía real",
      short: "Autonomía",
      weight: 0.2,
      default: 60,
      derive: { spec: "autonomia_km", min: 8, max: 80 },
      hint: "Kilómetros con un adulto de 75 kg, no el dato de catálogo.",
    },
    {
      key: "power",
      label: "Potencia y cuestas",
      short: "Potencia",
      weight: 0.18,
      default: 60,
      derive: { spec: "motor_w", min: 250, max: 800 },
      hint: "Capacidad de subir pendientes sin perder velocidad.",
    },
    {
      key: "safety",
      label: "Frenos y seguridad",
      short: "Seguridad",
      weight: 0.18,
      default: 60,
      derive: {
        spec: "frenos",
        values: { tambor: 45, disco: 70, "disco hidráulico": 86, eléctrico: 78 },
      },
      hint: "Frenos, luces, intermitentes y estabilidad.",
    },
    {
      key: "portability",
      label: "Plegado y peso",
      short: "Portabilidad",
      weight: 0.16,
      default: 60,
      derive: { spec: "peso_kg", min: 35, max: 10 },
      hint: "Peso real y facilidad para plegarlo y subirlo.",
    },
    {
      key: "comfort",
      label: "Confort y suspensión",
      short: "Confort",
      weight: 0.14,
      default: 60,
      derive: { spec: "suspension", values: { true: 80, false: 50 } },
      hint: "Suspensión, tamaño de rueda y amortiguación.",
    },
    {
      key: "value_for_money",
      label: "Calidad-precio",
      short: "Precio",
      weight: 0.14,
      default: 60,
      derive: { kind: "value" },
      hint: "Lo que ofrece frente a lo que cuesta.",
    },
  ],

  // --------------------------------------------------------- especificaciones
  specs: {
    autonomia_km: {
      group: "Movilidad",
      label: "Autonomía",
      unit: "km",
      type: "number",
      best: "max",
      range: [5, 200],
      aliases: [
        "autonomía",
        "autonomía máxima",
        "autonomía real",
        "recorrido",
        "distancia máxima",
        "kilómetros",
      ],
      // La tabla técnica de Amazon rara vez trae autonomía: se deduce del
      // título y de los bullets. El dato estructurado siempre tiene prioridad.
      infer: [
        /autonom[ií]a.{0,40}?(\d+(?:[.,]\d+)?)\s*(?:km|kil[oó]metros?)/i,
        /(\d+(?:[.,]\d+)?)\s*(?:km|kil[oó]metros?)(?!\s*\/).{0,25}?autonom[ií]a/i,
        /(?:recorrido|rango|distancia m[aá]xima).{0,25}?(\d+(?:[.,]\d+)?)\s*(?:km|kil[oó]metros?)/i,
      ],
    },
    velocidad_max_kmh: {
      group: "Movilidad",
      label: "Velocidad máxima",
      unit: "km/h",
      type: "number",
      best: "max",
      range: [10, 80],
      aliases: ["velocidad máxima", "velocidad", "velocidad punta", "velocidad tope"],
      infer: [
        /(\d+(?:[.,]\d+)?)\s*km\s*\/\s*h\b/i,
        /(?:velocidad|vel\.).{0,25}?(\d+(?:[.,]\d+)?)\s*(?:km\/h|km por hora)/i,
      ],
    },
    motor_w: {
      group: "Motor",
      label: "Potencia",
      unit: "W",
      type: "number",
      best: "max",
      range: [100, 10000],
      aliases: ["potencia", "potencia del motor", "potencia nominal", "vatios"],
      infer: [
        // Doble motor: "2×1800W" son 3600 W totales.
        { re: /2\s*[x×]\s*(\d{3,4})\s*w\b/i, factor: 2 },
        /(\d{3,4})\s*w\b/i,
        /(\d{3,4})\s*vatios/i,
      ],
    },
    bateria_wh: {
      group: "Batería",
      label: "Batería",
      unit: "Wh",
      type: "number",
      best: "max",
      range: [50, 5000],
      aliases: ["batería", "capacidad de la batería", "energía", "capacidad batería"],
      infer: [
        // "52V 23,4Ah" → 1217 Wh.
        {
          re: /(\d{2,3})\s*v\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*ah/i,
          compute: (match) =>
            Number(match[1]) * Number(String(match[2]).replace(",", ".")),
        },
        /(\d+(?:[.,]\d+)?)\s*wh\b/i,
      ],
    },
    peso_kg: {
      group: "Portabilidad",
      label: "Peso",
      unit: "kg",
      type: "number",
      best: "min",
      range: [5, 80],
      aliases: ["peso", "peso del producto", "peso neto", "peso aproximado"],
      infer: [
        {
          re: /(?:peso|pesa)\b.{0,25}?(\d+(?:[.,]\d+)?)\s*kg/i,
          reject: /m[aá]ximo|soport|carga|admite/i,
        },
        // Formato de dimensiones de Amazon: "124,5 x 63,8 x 134 cm; 29,7 kg".
        /;\s*(\d+(?:[.,]\d+)?)\s*kg\b/i,
        // "17 kg" suelto, siempre que el contexto no hable de carga máxima.
        {
          re: /(\d+(?:[.,]\d+)?)\s*kg\b/i,
          reject: /carga|m[aá]ximo|soport|admite|resistencia/i,
        },
      ],
    },
    carga_max_kg: {
      group: "Portabilidad",
      label: "Carga máxima",
      unit: "kg",
      type: "number",
      best: "max",
      range: [30, 250],
      aliases: [
        "carga máxima",
        "peso máximo soportado",
        "carga soportada",
        "peso máximo",
        "capacidad máxima de carga",
        "límite de peso",
      ],
      infer: [
        /(?:carga m[aá]xima|peso m[aá]ximo(?: soportado)?|soporta(?:r)?|admite|hasta)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*kg/i,
      ],
    },
    tiempo_carga_h: {
      group: "Batería",
      label: "Tiempo de carga",
      unit: "h",
      type: "number",
      best: "min",
      range: [0.5, 24],
      aliases: ["tiempo de carga", "tiempo de carga completo", "tiempo de carga rápida", "carga"],
      infer: [
        /(\d+(?:[.,]\d+)?)\s*(?:h|horas?)\s*(?:de\s*)?(?:carga|recarga)/i,
        /(?:carga|recarga|cargar)\b.{0,25}?(\d+(?:[.,]\d+)?)\s*(?:h|horas?)\b/i,
      ],
    },
    ruedas_pulgadas: {
      group: "Confort",
      label: "Tamaño de ruedas",
      unit: "″",
      type: "number",
      best: "max",
      range: [5, 30],
      aliases: ["tamaño de rueda", "tamaño de la rueda", "diámetro de rueda", "tamaño de las ruedas"],
      infer: [
        /(\d{1,2}(?:[.,]\d)?)\s*(?:"|''|″|pulgadas)/i,
        /(?:ruedas?|neum[aá]ticos?)\s*(?:de\s*)?(\d{1,2}(?:[.,]\d)?)\s*(?:pulgadas?|")/i,
      ],
    },
    frenos: {
      group: "Seguridad",
      label: "Frenos",
      type: "text",
      aliases: ["frenos", "sistema de frenado", "tipo de freno", "freno"],
      infer: [
        /frenos?\b[^.;,|]{0,60}/i,
        /(?:disco|tambor)[^.;,|]{0,40}/i,
      ],
    },
    suspension: {
      group: "Confort",
      label: "Suspensión",
      type: "boolean",
      aliases: ["suspensión", "amortiguación", "suspensión delantera", "suspensión trasera"],
      infer: [/suspensi[oó]n|amortiguaci[oó]n/i],
      inferNegative: [/sin suspensi[oó]n|no (?:tiene|incluye) suspensi[oó]n/i],
    },
    plegable: {
      group: "Portabilidad",
      label: "Plegable",
      type: "boolean",
      aliases: ["plegable", "tipo de plegado", "sistema de plegado"],
      infer: [/plegable|plegado|se pliega/i],
      inferNegative: [/no plegable|sin plegado|no se pliega/i],
    },
    resistencia_ip: {
      group: "Seguridad",
      label: "Resistencia al agua",
      type: "text",
      aliases: ["resistencia al agua", "grado de protección ip", "ip", "certificación ip"],
      infer: [/\bIP\s?[0-9X]{2}\b/i],
    },
    luces: {
      group: "Seguridad",
      label: "Luces",
      type: "boolean",
      aliases: ["luces", "iluminación", "luz led", "luz delantera"],
      infer: [/\bluces?\b|luz led|iluminaci[oó]n|faros?\b|intermitentes/i],
    },
  },

  // Filtros del catálogo además de precio y marca.
  filters: [
    { key: "suspension", label: "Con suspensión" },
    { key: "plegable", label: "Plegable" },
  ],

  // --------------------------------------------------------------- gráficas
  charts: [
    { type: "radar", title: "Perfil comparado", source: "scores" },
    { type: "bars", title: "Autonomía (km)", metric: "autonomia_km" },
    { type: "bars", title: "Velocidad máxima (km/h)", metric: "velocidad_max_kmh" },
    { type: "bars", title: "Peso (kg)", metric: "peso_kg" },
  ],

  // ---------------------------------------------------------------- guía
  guide: {
    title: "Elegir patinete sin leer cien opiniones",
    intro:
      "La autonomía que anuncia el fabricante casi nunca es la real. Esta guía explica qué datos importan, cómo los comprobamos y en qué orden decidir.",
    sections: [
      "Autonomía: por qué el dato de catálogo se queda corto",
      "Potencia y pendientes: cuándo 350 W no bastan",
      "Frenos y seguridad: lo primero que deberías mirar",
      "Peso y plegado: el factor que más arrepentimientos causa",
      "Batería y mantenimiento: qué acorta su vida",
    ],
  },
};
