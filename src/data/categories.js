import { specValue } from "../lib/normalize-product";

export const CATEGORIES = [
  {
    id: "commuter",
    title: "Para ir a trabajar",
    short: "Autonomía y plegado rápido",
    description:
      "Patinetes con autonomía suficiente para ida y vuelta, plegado en segundos y un peso que puedas subir en ascensor o metro. La prioridad aquí es la constancia, no la velocidad punta.",
    href: "/patinetes?uso=commuter",
    icon: "briefcase",
    filter: (product) => product.scores.portability >= 60 && product.scores.autonomy >= 55,
  },
  {
    id: "ligeros",
    title: "Ligeros y plegables",
    short: "Menos de 14 kg",
    description:
      "Modelos que se pliegan y se llevan sin esfuerzo. Perfectos si combinas patinete con transporte público o si vives en un piso sin ascensor.",
    href: "/patinetes?ligero=1",
    icon: "feather",
    filter: (product) => {
      const weight = specValue(product, "peso_kg");
      return typeof weight === "number" && weight > 0 && weight <= 14;
    },
  },
  {
    id: "entrada",
    title: "Hasta 400 €",
    short: "La puerta de entrada",
    description:
      "Opciones que cubren lo esencial —motor suficiente, frenos decentes y autonomía para trayectos cortos— sin pagar por extras que no vas a usar.",
    href: "/patinetes?gama=entrada",
    icon: "wallet",
    filter: (product) => product.price > 0 && product.price < 400,
  },
  {
    id: "media",
    title: "400 € – 800 €",
    short: "El punto de equilibrio",
    description:
      "La franja donde aparecen mejores suspensiones, baterías más grandes y acabados que aguantan el uso diario. Aquí suele estar la compra más sensata.",
    href: "/patinetes?gama=media",
    icon: "scale",
    filter: (product) => product.price >= 400 && product.price < 800,
  },
  {
    id: "premium",
    title: "Más de 800 €",
    short: "Máxima autonomía",
    description:
      "Patinetes con baterías grandes, motores de 500 W o más y componentes de gama alta. Pensados para trayectos largos o para quien no quiere renunciar a nada.",
    href: "/patinetes?gama=alta",
    icon: "zap",
    filter: (product) => product.price >= 800,
  },
  {
    id: "suspension",
    title: "Con suspensión",
    short: "Para calles irregulares",
    description:
      "La suspensión no es un lujo si ruedas por adoquines o asfalto parcheado. Filtra los modelos que la incluyen y compara el tamaño de rueda.",
    href: "/patinetes?suspension=1",
    icon: "waves",
    filter: (product) => Boolean(specValue(product, "suspension")),
  },
];

export function countCategory(products, category) {
  return products.filter(category.filter).length;
}
