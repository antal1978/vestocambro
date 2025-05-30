export interface ColorOption {
  id: string
  name: string
  hex: string
  category: "neutros" | "tierra-calidos" | "frios" | "especiales"
}

export interface ColorCombinationRule {
  baseColor: string
  compatibleColors: string[]
  description: string
}

export const COLORS: ColorOption[] = [
  // Neutros
  { id: "blanco", name: "Blanco", hex: "#FFFFFF", category: "neutros" },
  { id: "negro", name: "Negro", hex: "#000000", category: "neutros" },
  { id: "gris-claro", name: "Gris claro", hex: "#D1D5DB", category: "neutros" },
  { id: "gris-oscuro", name: "Gris oscuro", hex: "#374151", category: "neutros" },
  { id: "crudo", name: "Crudo / Off-white", hex: "#F0EAD6", category: "neutros" },
  { id: "beige", name: "Beige", hex: "#F5F5DC", category: "neutros" },
  { id: "arena", name: "Arena", hex: "#E2D5B8", category: "neutros" },
  { id: "marron", name: "Marrón", hex: "#964B00", category: "neutros" },
  { id: "chocolate", name: "Chocolate", hex: "#7B3F00", category: "neutros" },
  { id: "taupe", name: "Taupe", hex: "#483C32", category: "neutros" },

  // Tierra y Cálidos
  { id: "amarillo-claro", name: "Amarillo claro", hex: "#FFFACD", category: "tierra-calidos" },
  { id: "amarillo-mostaza", name: "Amarillo mostaza", hex: "#FFDB58", category: "tierra-calidos" },
  { id: "naranja", name: "Naranja", hex: "#FFA500", category: "tierra-calidos" },
  { id: "terracota", name: "Terracota", hex: "#E2725B", category: "tierra-calidos" },
  { id: "cobre", name: "Cobre", hex: "#B87333", category: "tierra-calidos" },
  { id: "oxido", name: "Óxido", hex: "#B7410E", category: "tierra-calidos" },
  { id: "coral", name: "Coral", hex: "#FF7F50", category: "tierra-calidos" },
  { id: "rojo", name: "Rojo", hex: "#FF0000", category: "tierra-calidos" },
  { id: "bordo", name: "Bordó / Vino", hex: "#800020", category: "tierra-calidos" },
  { id: "rosa-claro", name: "Rosa claro / Rosa bebé", hex: "#FFB6C1", category: "tierra-calidos" },
  { id: "rosa-chicle", name: "Rosa chicle", hex: "#FF1493", category: "tierra-calidos" },
  { id: "fucsia", name: "Fucsia", hex: "#FF00FF", category: "tierra-calidos" },
  { id: "salmon", name: "Salmón", hex: "#FA8072", category: "tierra-calidos" },

  // Fríos
  { id: "lavanda", name: "Lavanda", hex: "#E6E6FA", category: "frios" },
  { id: "lila", name: "Lila", hex: "#C8A2C8", category: "frios" },
  { id: "violeta", name: "Violeta", hex: "#8A2BE2", category: "frios" },
  { id: "purpura", name: "Púrpura", hex: "#800080", category: "frios" },
  { id: "azul-bebe", name: "Azul bebé", hex: "#89CFF0", category: "frios" },
  { id: "celeste", name: "Celeste", hex: "#87CEEB", category: "frios" },
  { id: "azul-francia", name: "Azul Francia", hex: "#318CE7", category: "frios" },
  { id: "azul-marino", name: "Azul marino", hex: "#000080", category: "frios" },
  { id: "azul-petroleo", name: "Azul petróleo", hex: "#082567", category: "frios" },
  { id: "verde-menta", name: "Verde menta", hex: "#98FF98", category: "frios" },
  { id: "verde-pasto", name: "Verde pasto", hex: "#7CFC00", category: "frios" },
  { id: "verde-oliva", name: "Verde oliva", hex: "#808000", category: "frios" },
  { id: "verde-seco", name: "Verde seco / militar", hex: "#6B8E23", category: "frios" },
  { id: "verde-esmeralda", name: "Verde esmeralda", hex: "#50C878", category: "frios" },
  { id: "verde-botella", name: "Verde botella", hex: "#006A4E", category: "frios" },

  // Especiales
  { id: "denim", name: "Denim", hex: "#1560BD", category: "especiales" }, // Color representativo para denim
  { id: "plateado", name: "Plateado", hex: "#C0C0C0", category: "especiales" },
  { id: "dorado", name: "Dorado", hex: "#FFD700", category: "especiales" },
  { id: "bronce", name: "Bronce", hex: "#CD7F32", category: "especiales" },
  { id: "multicolor", name: "Multicolor / Estampado", hex: "#800080", category: "especiales" }, // Placeholder, color no específico
  { id: "animal-print", name: "Animal print", hex: "#800080", category: "especiales" }, // Placeholder, color no específico
]

export const COLOR_CATEGORIES = {
  neutros: "Neutros",
  "tierra-calidos": "Tierra y Cálidos",
  frios: "Fríos",
  especiales: "Especiales",
}

export const COLOR_COMBINATION_RULES: ColorCombinationRule[] = [
  // Reglas para neutros
  {
    baseColor: "negro",
    compatibleColors: [
      "blanco",
      "gris-claro",
      "rojo",
      "azul-francia",
      "verde-esmeralda",
      "amarillo-mostaza",
      "rosa-chicle",
    ],
    description: "El negro combina con casi todos los colores",
  },
  {
    baseColor: "blanco",
    compatibleColors: ["negro", "azul-marino", "rojo", "verde-oscuro", "marron", "gris-oscuro"],
    description: "El blanco es versátil y combina con colores intensos",
  },
  {
    baseColor: "gris-claro",
    compatibleColors: ["blanco", "negro", "azul-francia", "rosa-claro", "amarillo-mostaza", "verde-pasto"],
    description: "El gris es neutral y combina con colores vibrantes",
  },

  // Reglas para cálidos
  {
    baseColor: "rojo",
    compatibleColors: ["blanco", "negro", "gris-claro", "beige", "azul-marino"],
    description: "El rojo combina bien con neutros y azul marino",
  },
  {
    baseColor: "amarillo-mostaza",
    compatibleColors: ["blanco", "negro", "gris-oscuro", "azul-francia", "verde-oliva"],
    description: "El amarillo resalta con neutros y colores fríos",
  },
  {
    baseColor: "rosa-chicle",
    compatibleColors: ["blanco", "gris-claro", "negro", "verde-menta", "azul-bebe"],
    description: "El rosa combina con neutros y verdes",
  },

  // Reglas para fríos
  {
    baseColor: "azul-francia",
    compatibleColors: ["blanco", "gris-claro", "amarillo-mostaza", "naranja", "beige"],
    description: "El azul combina con neutros y colores cálidos",
  },
  {
    baseColor: "verde-esmeralda",
    compatibleColors: ["blanco", "beige", "marron", "rosa-claro", "crudo"],
    description: "El verde combina con neutros tierra y rosa",
  },
  {
    baseColor: "violeta",
    compatibleColors: ["blanco", "gris-claro", "amarillo-claro", "verde-menta", "beige"],
    description: "El morado combina con neutros y amarillo",
  },
]

export function getColorById(colorId: string): ColorOption | undefined {
  return COLORS.find((color) => color.id === colorId)
}

export function getCompatibleColors(baseColorId: string): string[] {
  const rule = COLOR_COMBINATION_RULES.find((rule) => rule.baseColor === baseColorId)
  return rule ? rule.compatibleColors : []
}

export function getColorsByCategory(category: string): ColorOption[] {
  return COLORS.filter((color) => color.category === category)
}
